export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!process.env.HF_TOKEN) {
      return res.status(500).json({ error: "HF_TOKEN manquant dans Vercel" });
    }

    // ✅ On utilise un modèle 100% fiable
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

    // ✅ On récupère la réponse brute
    const text = await response.text();

    // ✅ Si c'est du JSON (erreur ou succès)
    if (text.startsWith("{")) {
      const data = JSON.parse(text);
      
      // Si Hugging renvoie une erreur (ex: "Model is loading")
      if (data.error || !data.images) {
        return res.status(500).json({ 
          error: data.error || "Erreur inconnue du modèle" 
        });
      }
      
      // Si c'est bon
      return res.status(200).json({
        images: [{ url: `data:image/jpeg;base64,${data.images[0]}` }]
      });
    } 
    
    // ✅ Si c'est une image binaire directe
    else {
      const base64 = Buffer.from(text).toString("base64");
      return res.status(200).json({
        images: [{ url: `data:image/jpeg;base64,${base64}` }]
      });
    }

  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}
