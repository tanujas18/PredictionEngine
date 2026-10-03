/**
 * OPTIONAL AI layer.
 *
 * The numbers always come from predict.js. If an OpenRouter key is present, we also ask a
 * free model to write the rationale paragraph in plainer language. No key, no problem —
 * the caller falls back to the template rationale.
 *
 * The key is read here, on the server, and never sent to the browser. Same rule as Week 01.
 */
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const TIMEOUT_MS = 9000;

export function aiEnabled() {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

export async function aiRationale({ home, away, match, prediction }) {
  if (!aiEnabled()) return null;

  const factors = prediction.factors
    .slice(0, 4)
    .map((f) => `- ${f.label}: ${f.detail} (favours ${f.impact})`)
    .join("\n");

  const prompt = `You are a football analyst. Write 2-3 short sentences (max 60 words) explaining this prediction.
Do not invent statistics. Use only the numbers given. No markdown, no bullet points, plain prose.

Fixture: ${home.name} (home) vs ${away.name}, ${match.league}, ${match.kickoff}
Model probabilities: home ${prediction.probabilities.home}%, draw ${prediction.probabilities.draw}%, away ${prediction.probabilities.away}%
Most likely scoreline: ${prediction.scoreline.home}-${prediction.scoreline.away}
Confidence: ${prediction.confidence}
Factors:
${factors}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free",
        temperature: 0.4,
        max_tokens: 180,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    return text || null;
  } catch {
    // Timeout, offline, rate-limited — the template rationale is a fine answer.
    return null;
  } finally {
    clearTimeout(timer);
  }
}
