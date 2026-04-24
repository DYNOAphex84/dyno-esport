export default async function handler(req, res) {
  const { prompt } = req.body;
  try {
    const response = await fetch("https://queue.fal.run/fal-ai/flux/schnell", {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.FAL_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: "Esport style, high quality, " + prompt,
        image_size: "landscape_4_3",
        num_inference_steps: 4
      })
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Erreur" });
  }
}
