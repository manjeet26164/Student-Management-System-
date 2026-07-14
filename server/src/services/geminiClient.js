const MODEL = "gemini-3.5-flash"; 
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

async function callGemini({ system, userText, tool, forceTool, jsonMode, maxOutputTokens = 1024 }) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in server/.env");
  }

  const body = {
    contents: [{ role: "user", parts: [{ text: userText }] }],
    generationConfig: {
      maxOutputTokens,
      thinkingConfig: { thinkingBudget: 0 }, 
    },
  };

  if (system) {
    body.systemInstruction = { parts: [{ text: system }] };
  }

  if (tool) {
    body.tools = [{ functionDeclarations: [tool] }];
    if (forceTool) {
      body.toolConfig = {
        functionCallingConfig: { mode: "ANY", allowedFunctionNames: [tool.name] },
      };
    }
  }

  if (jsonMode) {
    body.generationConfig.responseMimeType = "application/json";
  }

  const response = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  return response.json();
}

function getFunctionCall(geminiResponse) {
  const parts = geminiResponse?.candidates?.[0]?.content?.parts || [];
  const fnPart = parts.find((p) => p.functionCall);
  return fnPart ? fnPart.functionCall : null; // { name, args }
}

function getText(geminiResponse) {
  const parts = geminiResponse?.candidates?.[0]?.content?.parts || [];
  const textPart = parts.find((p) => typeof p.text === "string" && !p.thought);
  return textPart ? textPart.text : null;
}

module.exports = { callGemini, getFunctionCall, getText };