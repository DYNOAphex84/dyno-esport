export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!process.env.REPLICATE_API_TOKEN) {
      return res.status(500).json({ error: "REPLICATE_API_TOKEN manquant" });
    }

    // ✅ Format correct pour FLUX Schnell sur Replicate
    const response = await fetch(
      "https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
          "Prefer": "wait"
        },
        body: JSON.stringify({
          input: {
            prompt: `esport gaming style, black and gold, ultra detailed, ${prompt}`,
            num_outputs: 1,
            aspect_ratio: "16:9",
            output_format: "webp",
            output_quality: 80
          }
        })
      }
    );

    const text = await response.text();

    if (!text) {
      return res.status(500).json({ error: "Réponse vide de Replicate" });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({ error: "Réponse invalide: " + text.slice(0, 200) });
    }

    // ✅ Si succès direct (avec Prefer: wait)
    if (data.output && data.output[0]) {
      return res.status(200).json({
        images: [{ url: data.output[0] }]
      });
    }

    // ✅ Si en attente, on poll
    if (data.urls && data.urls.get) {
      let result = data;
      let attempts = 0;

      while (result.status !== "succeeded" && result.status !== "failed" && attempts < 20) {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const poll = await fetch(result.urls.get, {
          headers: {
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`
          }
        });

        result = await poll.json();
        attempts++;
      }

      if (result.output && result.output[0]) {
        return res.status(200).json({
          images: [{ url: result.output[0] }]
        });
      }
    }

    return res.status(500).json({ 
      error: data.detail || data.error || JSON.stringify(data).slice(0, 200)
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}