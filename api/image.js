export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    // ✅ URL directe Pollinations (pas de base64, pas de clé API)
    const encodedPrompt = encodeURIComponent(
      "esport gaming style, ultra detailed, " + prompt
    );
    
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=512&nologo=true&model=flux`;

    // On renvoie l'URL directe
    return res.status(200).json({
      images: [{ url: imageUrl }]
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
