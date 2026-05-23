const MODEL_ALIASES = {
  haiku: "claude-3-5-haiku-20241022",
  "claude-3-5-haiku-latest": "claude-3-5-haiku-20241022",
  sonnet: "claude-sonnet-4-5",
};

function resolveModel(value) {
  const configured = String(value || "haiku").trim();
  const key = configured.toLowerCase();
  if (key.includes("haiku")) return "claude-3-5-haiku-20241022";
  return MODEL_ALIASES[key] || configured;
}

module.exports = async function improveNote(context, req) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      context.res = jsonResponse(500, { error: "ANTHROPIC_API_KEY is not configured." });
      return;
    }

    const input = String(req.body?.text || "").trim();
    const instruction = String(req.body?.instruction || "").trim();
    if (!input) {
      context.res = jsonResponse(400, { error: "Text is required." });
      return;
    }

    const model = resolveModel(process.env.ANTHROPIC_MODEL);
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 700,
        temperature: 0.2,
        system: [
          "You improve operational ticket notes for TRNAWL.",
          "Return only valid JSON with keys: improvedText and suggestions.",
          "Do not invent facts. Preserve intent. Keep the wording concise and professional.",
        ].join(" "),
        messages: [
          {
            role: "user",
            content: [
              instruction || "Rephrase into clear business English. Translate to English if needed. Fix typos. Preserve intent. If important delivery details are missing, list them as suggestions.",
              "",
              "Text:",
              input,
            ].join("\n"),
          },
        ],
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      context.res = jsonResponse(response.status, { error: payload.error?.message || "Anthropic request failed." });
      return;
    }

    const raw = payload.content?.find((part) => part.type === "text")?.text || "{}";
    const parsed = parseJsonObject(raw);
    context.res = jsonResponse(200, {
      improvedText: String(parsed.improvedText || input).trim(),
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.map(String).filter(Boolean) : [],
      model,
    });
  } catch (error) {
    context.res = jsonResponse(500, { error: error.message || "Improve request failed." });
  }
};

function parseJsonObject(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : {};
  }
}

function jsonResponse(status, body) {
  return {
    status,
    headers: { "content-type": "application/json" },
    body,
  };
}
