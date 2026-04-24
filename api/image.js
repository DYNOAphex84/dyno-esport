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
      "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
          "x-wait-for-model": "true"
        },
        body: JSON.stringify({
          inputs: "esport gaming style, " + prompt,
          options: {
            wait_for_model: true
          }
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({
        error: `Erreur HF: ${text.substring(0, 100)}`
      });
    }

    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return res.status(500).json({
        error: data.error || "Modèle en chargement, réessaie"
      });
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return res.status(200).json({
      images: [{ url: `data:image/jpeg;base64,${base64}` }]
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
