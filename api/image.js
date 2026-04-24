export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!process.env.REPLICATE_API_TOKEN) {
      return res.status(500).json({ error: "REPLICATE_API_TOKEN manquant" });
    }

    const response = await fetch(
      "https://api.replicate.com/v1/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: "black-forest-labs/flux-schnell",
          input: {
            prompt: `esport logo, black and gold theme, ultra detailed, ${prompt}`,
          },
        }),
      }
    );

    const prediction = await response.json();

    if (!prediction.urls || !prediction.urls.get) {
      return res.status(500).json({ error: "Erreur création prediction" });
    }

    // ✅ On attend le résultat
    let result;
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const poll = await fetch(prediction.urls.get, {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      });

      result = await poll.json();

      if (result.status === "succeeded") break;
      if (result.status === "failed") {
        return res.status(500).json({ error: "Generation failed" });
      }
    }

    return res.status(200).json({
      images: [{ url: result.output[0] }],
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
