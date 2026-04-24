export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { prompt } = req.body

    if (!process.env.HF_TOKEN) {
      return res.status(500).json({ error: 'HF_TOKEN manquant dans Vercel' })
    }

    const response = await fetch(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: 'Esport gaming style, high quality, ultra detailed, ' + prompt,
          parameters: {
            num_inference_steps: 20,
            guidance_scale: 7.5,
            width: 768,
            height: 512
          }
        })
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return res.status(500).json({ error: error })
    }

    const buffer = await response.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const imageUrl = `data:image/jpeg;base64,${base64}`

    return res.status(200).json({ 
      images: [{ url: imageUrl }] 
    })

  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
