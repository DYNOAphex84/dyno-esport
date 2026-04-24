import { useState } from 'react'

export const IASection = ({ H }: { H: any }) => {
  const [iaQuestion, setIaQuestion] = useState('')
  const [iaMessages, setIaMessages] = useState<{ role: 'user' | 'ia'; content: string }[]>([])
  const [iaLoading, setIaLoading] = useState(false)

  const genererImage = async () => {
    if (!iaQuestion.trim()) return

    const promptUtilisateur = iaQuestion
    const newMsgs = [...iaMessages, { role: 'user' as const, content: promptUtilisateur }]
    setIaMessages(newMsgs)
    setIaQuestion('')
    setIaLoading(true)

    try {
      const res = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptUtilisateur })
      })

      const data = await res.json()
      console.log('Réponse API image :', data)

      const imageUrl =
        data?.images?.[0]?.url ||
        data?.data?.images?.[0]?.url ||
        data?.result?.images?.[0]?.url

      if (imageUrl) {
        setIaMessages([
          ...newMsgs,
          { role: 'ia', content: `![Génération](${imageUrl})` }
        ])
      } else {
        setIaMessages([
          ...newMsgs,
          { role: 'ia', content: `❌ Réponse invalide : ${JSON.stringify(data)}` }
        ])
      }
    } catch (error) {
      setIaMessages([
        ...newMsgs,
        { role: 'ia', content: '❌ Erreur de connexion au générateur.' }
      ])
    } finally {
      setIaLoading(false)
    }
  }

  return (
    <div>
      <H title="IA" icon="🎨" />

      <div className="card-glow bg-black/30 rounded-3xl border border-[#D4AF37]/15 overflow-hidden flex flex-col shadow-2xl">
        <div className="bg-gradient-to-r from-[#D4AF37]/20 to-transparent p-4 border-b border-[#D4AF37]/10">
          <p className="text-[#D4AF37] font-bold text-sm text-center uppercase">
            Générateur d'images
          </p>
        </div>

        <div className="p-4 space-y-4 min-h-[400px] max-h-[600px] overflow-y-auto bg-black/20">
          {iaMessages.length === 0 && (
            <div className="text-center py-16 opacity-50">
              <div className="text-5xl mb-4">🎨</div>
              <p className="text-[#D4AF37] font-bold text-sm uppercase">IA prête</p>
              <p className="text-gray-500 text-[11px] mt-2">
                Exemple :<br />
                "logo esport noir et or avec dragon"
              </p>
            </div>
          )}

          {iaMessages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] px-4 py-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37]'
                    : 'bg-[#1a1a1a] border border-white/5 text-white'
                }`}
              >
                {msg.content.startsWith('![Génération](') ? (
                  <img
                    src={msg.content.match(/\((.*?)\)/)?.[1] || ''}
                    alt="Image générée"
                    className="rounded-xl w-full border border-[#D4AF37]/30 shadow-lg cursor-pointer"
                    onClick={() =>
                      window.open(msg.content.match(/\((.*?)\)/)?.[1] || '', '_blank')
                    }
                  />
                ) : (
                  <p className="text-xs whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                )}
              </div>
            </div>
          ))}

          {iaLoading && (
            <div className="flex justify-center">
              <div className="text-[#D4AF37] text-xs animate-pulse font-bold">
                ⏳ Génération en cours...
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-black/40 border-t border-white/5 flex gap-2">
          <input
            value={iaQuestion}
            onChange={(e) => setIaQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') genererImage()
            }}
            placeholder="Décris ton image..."
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-xs focus:outline-none focus:border-[#D4AF37]/40"
          />
          <button
            onClick={genererImage}
            disabled={iaLoading || !iaQuestion.trim()}
            className={`w-14 rounded-xl font-bold ${
              iaLoading || !iaQuestion.trim()
                ? 'bg-white/5 text-gray-700'
                : 'bg-gradient-to-br from-[#D4AF37] to-[#FFD700] text-black'
            }`}
          >
            🎨
          </button>
        </div>
      </div>
    </div>
  )
}
