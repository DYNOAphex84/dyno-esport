export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!process.env.HF_TOKEN) {
      return res.status(500).json({ error: "HF_TOKEN manquant" });
    }

    const enhancedPrompt = `
    ${prompt},
    esport logo,
    ultra detailed,
    dramatic lighting,
    high contrast,
    sharp focus,
    professional gaming artwork,
    black and gold theme
    `;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
          "x-wait-for-model": "true"
        },
        body: JSON.stringify({
          inputs: enhancedPrompt
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({
        error: "HF error: " + errorText.slice(0, 100)
      });
    }

    // ✅ On récupère directement le binaire
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    return res.status(200).json({
      images: [{
        url: `data:image/jpeg;base64,${base64}`
      }]
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
