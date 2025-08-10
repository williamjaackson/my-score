export async function classifyGovernmentSentiment(
  text: string
): Promise<number | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null; // silently skip if no key configured

  const prompt = `You are a strict classifier. Analyse the following wall post text for sentiment about the government or a social credit system. Rules:\n- If the text clearly expresses positive or supportive sentiment toward government or social credit (myscore, anything about a score), output EXACTLY 1.\n- If it clearly or vaugely expresses negative, critical, or opposing sentiment, output EXACTLY 0.\n OUTPUT 0 if the user might be hinting towards credit being bad.\n- If it does not mention government or social credit at all, or is ambiguous/neutral, output EXACTLY 0.5.\nReturn ONLY the number (0, 0.5, or 1).\n\nText: "${text.replace(
    /"/g,
    '\\"'
  )}"`;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        temperature: 0,
        messages: [
          { role: "system", content: "You output only one of: 0, 0.5, 1" },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      console.error("OpenRouter error", await res.text());
      return null;
    }
    const json = await res.json();
    const raw = json?.choices?.[0]?.message?.content?.trim();
    if (raw === "1") return 1;
    if (raw === "0") return 0;
    if (raw === "0.5" || raw === ".5") return 0.5;
    return null;
  } catch (e) {
    console.error("OpenRouter classify error", e);
    return null;
  }
}
