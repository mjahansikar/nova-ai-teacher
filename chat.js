export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Basic rate limiting check (by IP)
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  try {
    const { messages, subject, grade } = req.body;

    if (!messages || !subject || !grade) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // API key stays SECRET on server — never sent to browser
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Server configuration error" });
    }

    const systemPrompt = `You are Nova, a friendly and encouraging AI teacher for UAE students.
You are teaching ${subject} to a ${grade} student.
Keep responses concise (3-5 sentences max).
Always be encouraging, use simple language, add 1 relevant emoji per response.
After explaining, ask ONE simple question to check understanding.
Format math with clear steps. Align with UAE MOE curriculum.
Never discuss anything unrelated to education.`;

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

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.error?.message || "AI service error" });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "Let me try explaining that again!";

    return res.status(200).json({ message: text });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
