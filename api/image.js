export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { prompt } = req.body

    if (!process.env.FAL_KEY) {
      return res.status(500).json({ error: 'FAL_KEY manquante dans Vercel' })
    }

    const response = await fetch('https://queue.fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.FAL_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: 'Esport gaming style, high quality, ' + prompt,
        image_size: 'landscape_4_3',
        num_inference_steps: 4
      })
    })

    const text = await response.text()

    try {
      const data = JSON.parse(text)
      return res.status(200).json(data)
    } catch {
      return res.status(500).json({ 
        error: 'Réponse invalide de Fal.ai',
        details: text.substring(0, 200)
      })
    }

  } catch (error) {
    return res.status(500).json({ 
      error: error.message 
    })
  }
}
