export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!process.env.HF_TOKEN) {
      return res.status(500).json({ error: "HF_TOKEN manquant" });
    }

    // ✅ PROMPT BOOST AUTOMATIQUE
    const enhancedPrompt = `
    ${prompt},
    esport logo style,
    ultra detailed,
    4k resolution,
    dramatic lighting,
    sharp focus,
    cinematic,
    trending on artstation,
    professional digital art,
    vibrant colors,
    high contrast,
    masterpiece
    `;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: enhancedPrompt,
          parameters: {
            guidance_scale: 8.5,
            num_inference_steps: 25,
            width: 768,
            height: 512
          }
        }),
      }
    );

    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return res.status(500).json({ error: data.error || "Erreur HF" });
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return res.status(200).json({
      images: [{ url: `data:image/jpeg;base64,${base64}` }],
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
