export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!process.env.REPLICATE_API_TOKEN) {
      return res.status(500).json({ error: "REPLICATE_API_TOKEN manquant" });
    }

    // ✅ Création prédiction
    const createPrediction = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "ac732df83cea7fffdbd5e2070f0e39bdb3e4e1c39f3b16f45a7a3f8b7a6e7e68", // stable diffusion v1.5
        input: {
          prompt: `esport logo, ultra detailed, black and gold theme, ${prompt}`
        }
      })
    });

    const prediction = await createPrediction.json();

    if (!prediction.id) {
      return res.status(500).json({ error: "Erreur création prediction" });
    }

    // ✅ On attend que l'image soit prête
    let result = prediction;
    while (result.status !== "succeeded" && result.status !== "failed") {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const poll = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`
        }
      });

      result = await poll.json();
    }

    if (result.status === "failed") {
      return res.status(500).json({ error: "Generation failed" });
    }

    return res.status(200).json({
      images: [{ url: result.output[0] }]
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
