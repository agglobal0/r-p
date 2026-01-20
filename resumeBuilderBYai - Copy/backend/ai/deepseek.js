// deepseek.js
const { default: fetch } = require("node-fetch");
const JSON5 = require("json5");

const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || "http://127.0.0.1:11434";
const MODEL = "gpt-oss:120b-cloud";

function extractJson(text) {
  // remove <think> ... </think>
  text = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

  // if ```json fenced block exists
  const fenced = text.match(/```json([\s\S]*?)```/);
  const jsonString = fenced ? fenced[1] : text;

  try {
    return JSON.parse(jsonString);
  } catch (err) {
    try {
      // fallback: more tolerant parser
      return JSON5.parse(jsonString);
    } catch (err2) {
      throw new Error(`AI response parse error: ${err2.message}`, { cause: jsonString });
    }
  }
}

async function callDeepSeek(prompt, options = {}) {
  const body = {
    model: MODEL,
    prompt,
    stream: false,
    options: {
      temperature: options.temperature || 0.6,
      top_p: options.top_p || 0.9,
      max_tokens: options.max_tokens || 800,
    }
  };

  const res = await fetch(`${DEEPSEEK_API_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`DeepSeek error: ${res.status}`);
  }

  const data = await res.json();
  const raw = data.response || "";

  try {
    return extractJson(raw);
  } catch (err) {
    throw new Error(`AI response parse error: ${err.message}`, { cause: raw });
  }
}

module.exports = { callDeepSeek };
