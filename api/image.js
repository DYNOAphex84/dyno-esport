export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!process.env.HF_TOKEN) {
      return res.status(500).json({ error: "HF_TOKEN manquant" });
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: "esport gaming, ultra detailed, " + prompt,
        }),
      }
    );

    const contentType = response.headers.get("content-type");

    // ✅ Si erreur JSON
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return res.status(500).json({
        error: data.error || "Erreur HuggingFace",
      });
    }
