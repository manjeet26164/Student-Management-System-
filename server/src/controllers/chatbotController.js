const KnowledgeChunk = require("../models/KnowledgeChunk");
const { embedText, cosineSimilarity } = require("../services/geminiEmbeddings");
const { callGemini, getText } = require("../services/geminiClient");
const { buildStudentContext } = require("../services/studentDataService");

const TOP_K = 5;

const LANGUAGE_INSTRUCTION =
  "Reply in the same language style the user used in their message. If the user wrote in plain English, reply in English. If the user wrote in Hindi or Hinglish (Hindi words in Roman/English script), reply in Hinglish the same way. Default to English when the message is short, ambiguous, or contains no clear Hindi/Hinglish words.";

const PERSONAL_ACADEMIC_PATTERNS = [
  /\bcgpa\b/i,
  /\bsgpa\b/i,
  /\bmy (marks|result|attendance|fee|backlog|grade)/i,
  /\bmera (result|marks|backlog|grade)/i,
  /\bmeri (cgpa|sgpa|attendance|fee)/i,
  /\bmujhe.*(cgpa|sgpa|attendance|result|marks|fee status)/i,
  /\bmy fee status\b/i,
  /\bkitni (cgpa|sgpa|attendance)/i,
];

const RULEBOOK_PATTERNS = [
  /\brule(s|book)?\b/i,
  /\bpolicy\b/i,
  /\bfine\b/i,
  /\bdeadline\b/i,
  /\bcircular\b/i,
  /\bhostel rule/i,
  /\bexam (rule|policy|regulation)/i,
  /\blate fee\b/i,
  /\battendance (rule|policy|requirement)/i,
  /\bleave policy\b/i,
];

const classifyIntent = (message) => {
  if (PERSONAL_ACADEMIC_PATTERNS.some((pattern) => pattern.test(message))) {
    return "personal_academic";
  }
  if (RULEBOOK_PATTERNS.some((pattern) => pattern.test(message))) {
    return "rulebook";
  }
  return "general";
};

const answerRulebookQuery = async (message, role) => {
  const chunks = await KnowledgeChunk.find({ roles: role }).lean();

  if (chunks.length === 0) {
    return {
      answer: "Rulebook data has not been uploaded yet. Please contact the administration office for this query.",
      sources: [],
    };
  }

  const queryEmbedding = await embedText(message);

  const ranked = chunks
    .map((chunk) => ({ ...chunk, score: cosineSimilarity(queryEmbedding, chunk.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_K);

  const context = ranked
    .map((c, i) => `[${i + 1}] (Source: ${c.sourceFile}${c.page ? `, page ${c.page}` : ""})\n${c.text}`)
    .join("\n\n");

  const system = `You are the official assistant inside this university ERP system.
Answer using only the information in the "Context" section below.
If the answer is not present in the context, clearly say this information is not available in the rulebook and suggest contacting the administration office — never invent a fine, deadline, or rule.
User's role: ${role}. Only share information relevant to that role.
Keep answers concise and direct; quote exact numbers/dates from the context where applicable.
${LANGUAGE_INSTRUCTION}`;

  const userText = `Context:\n${context}\n\nQuestion: ${message}`;

  const geminiResponse = await callGemini({ system, userText, maxOutputTokens: 512 });
  const answer = getText(geminiResponse);

  return {
    answer,
    sources: ranked.map((c) => ({ file: c.sourceFile, page: c.page, score: Number(c.score.toFixed(3)) })),
  };
};

const answerPersonalAcademicQuery = async (message, userId, role) => {
  if (role !== "student") {
    return {
      answer: "This personal academic data can only be viewed from a student login.",
      sources: [],
    };
  }

  const context = await buildStudentContext(userId);

  if (!context) {
    return {
      answer: "Your student record could not be found. Please contact the administration office.",
      sources: [],
    };
  }

  const system = `You are the official assistant inside this university ERP system.
Answer using only the student's own academic record data given below.
Base your answer strictly on this data, never invent numbers.
If the requested data is not present below, clearly say it is not available in the record yet.
Keep answers concise and direct.
${LANGUAGE_INSTRUCTION}`;

  const userText = `Student Data:\n${context}\n\nQuestion: ${message}`;

  const geminiResponse = await callGemini({ system, userText, maxOutputTokens: 400 });
  const answer = getText(geminiResponse);

  return { answer, sources: [] };
};

const answerGeneralQuery = async (message, role) => {
  const system = `You are a friendly assistant inside this university ERP portal.
User's role: ${role}.
Give a direct, helpful reply to greetings, small talk, or general questions.
If the question sounds like it relates to university rules or the student's own academic record, suggest the user ask more specifically so the correct data can be used.
${LANGUAGE_INSTRUCTION}`;

  const geminiResponse = await callGemini({ system, userText: message, maxOutputTokens: 400 });
  const answer = getText(geminiResponse);

  return { answer, sources: [] };
};

const askChatbot = async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ message: "message field is required" });
  }

  const role = req.user.role;
  const intent = classifyIntent(message);

  try {
    let result;
    if (intent === "rulebook") {
      result = await answerRulebookQuery(message, role);
    } else if (intent === "personal_academic") {
      result = await answerPersonalAcademicQuery(message, req.user._id, role);
    } else {
      result = await answerGeneralQuery(message, role);
    }

    if (!result.answer) {
      return res.status(502).json({ message: "No text was returned by the AI, please try again" });
    }

    return res.json({ answer: result.answer, sources: result.sources, intent });
  } catch (error) {
    if (error.message.includes("429")) {
      return res.status(429).json({
        message: "AI service is busy right now (rate/daily limit exceeded). Please try again shortly.",
      });
    }
    throw error;
  }
};

module.exports = { askChatbot };