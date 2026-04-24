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
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1-base",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: "esport gaming style, high quality, " + prompt,
        }),
      }
    );

    // 🛠 On récupère la réponse brute
    const buffer = await response.arrayBuffer();
    
    // 🛠 On convertit en base64 OBLIGATOIREMENT avec le préfixe
    const base64 = Buffer.from(buffer).toString("base64");
    const imageUrl = `data:image/jpeg;base64,${base64}`;

    return res.status(200).json({
      images: [{ url: imageUrl }],
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}
