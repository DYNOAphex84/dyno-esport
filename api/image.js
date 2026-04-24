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

    // 🛠 On récupère le texte brut
    const text = await response.text();

    let base64String;

    // 🛠 On essaie de lire comme du JSON (Hugging Face fait ça souvent)
    try {
      const data = JSON.parse(text);
      if (data.images && data.images[0]) {
        base64String = data.images[0];
      } else {
        // Si c'est une erreur JSON
        return res.status(500).json({ error: data.error || "Erreur HF" });
      }
    } catch (e) {
      // 🛠 Si c'est pas du JSON, c'est peut-être du binaire direct (rare)
      base64String = Buffer.from(text).toString("base64");
    }

    // 🛠 NETTOYAGE CRITIQUE : On enlève les espaces/sauts de ligne
    const cleanBase64 = base64String.replace(/\s/g, "").replace(/^data:image\/[a-z]+;base64,/, "");

    return res.status(200).json({
      images: [{ url: `data:image/jpeg;base64,${cleanBase64}` }],
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}
