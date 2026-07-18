const KnowledgeChunk = require("../models/KnowledgeChunk");
const { embedText, cosineSimilarity } = require("../services/geminiEmbeddings");
const { callGemini, getText } = require("../services/geminiClient");

const TOP_K = 5;

const askChatbot = async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ message: "message field is required" });
  }

  const role = req.user.role;

  const chunks = await KnowledgeChunk.find({ roles: role }).lean();

  if (chunks.length === 0) {
    return res.json({
      answer:
        "University rulebook data abhi upload nahi hua hai. Please contact administration office for this query.",
      sources: [],
    });
  }

  const queryEmbedding = await embedText(message);

  const ranked = chunks
    .map((chunk) => ({ ...chunk, score: cosineSimilarity(queryEmbedding, chunk.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_K);

  const context = ranked
    .map((c, i) => `[${i + 1}] (Source: ${c.sourceFile}${c.page ? `, page ${c.page}` : ""})\n${c.text}`)
    .join("\n\n");

  const system = `Tum is university ERP ke andar ka official assistant ho.
Sirf neeche diye gaye "Context" ke andar ki information use karke jawab do.
Agar context mein answer nahi milta, to clearly bata do ki yeh information rulebook mein available nahi hai aur administration office se contact karne ko kaho — kabhi khud se fine, deadline, ya rule mat banao.
User ka role: ${role}. Sirf usi role se related jaankari relevant tareeke se do.
Jawab concise aur seedha do; jahan applicable ho wahan exact numbers/dates context ke hisaab se hi quote karo.`;

  const userText = `Context:\n${context}\n\nQuestion: ${message}`;

  const geminiResponse = await callGemini({ system, userText, maxOutputTokens: 512 });
  const answer = getText(geminiResponse);

  if (!answer) {
    return res.status(502).json({ message: "AI response mein text nahi mila, dobara try karein" });
  }

  return res.json({
    answer,
    sources: ranked.map((c) => ({ file: c.sourceFile, page: c.page, score: Number(c.score.toFixed(3)) })),
  });
};

module.exports = { askChatbot };