const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-5-20250929";

async function callClaude({ system, messages, tools, tool_choice, max_tokens = 1024 }) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set in server/.env");
  }

  const body = { model: MODEL, max_tokens, messages };
  if (system) body.system = system;
  if (tools) body.tools = tools;
  if (tool_choice) body.tool_choice = tool_choice;

  const response = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errText}`);
  }

  return response.json();
}

module.exports = { callClaude };