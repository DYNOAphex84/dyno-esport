import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body;

    const completion = await groq.chat.completions.create({
      messages: messages,
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 1024,
    });

    return res.status(200).json({
      content: completion.choices[0].message.content,
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}
