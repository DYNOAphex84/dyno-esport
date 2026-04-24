export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!process.env.REPLICATE_API_TOKEN) {
      return res.status(500).json({ error: "REPLICATE_API_TOKEN manquant" });
    }

    // ✅ Création de la prédiction
    const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "ac732df83cea7fff0e39bd99f8b6c9d8d8f8b7a6e7e68",
        input: {
          prompt: `esport logo, ultra detailed, black and gold theme, ${prompt}`,
          negative_prompt: "blurry, bad quality, low resolution",
          width: 768,
          height: 512,
          num_inference_steps: 30,
          guidance_scale: 8.5
        }
      })
    });

    const prediction = await createResponse.json();

    if (!prediction.id) {
      return res.status(500).json({ 
        error: prediction.detail || "Erreur création prediction" 
      });
    }

    
