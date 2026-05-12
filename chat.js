export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { messages, subject, grade } = req.body;
    if (!messages || !subject || !grade) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Server configuration error" });
    }
    const systemPrompt = `You are Nova, a friendly AI teacher for UAE students teaching ${subject} to a ${grade} student. Keep responses concise (3-5 sentences). Be encouraging, use simple language, add 1 emoji. Ask ONE question to check understanding. Align with UAE MOE curriculum.`;
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages,
      }),
    });
    const data = await response.json();
    const text = data.content?.[0]?.text || "Let me try again!";
    return res.status(200).json({ message: text });
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
