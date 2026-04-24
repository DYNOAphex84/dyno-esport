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
      
      if (data.images && data.images[0]) {
        setIaMessages([...newMsgs, { role: 'ia', content: `![Génération](${data.images[0].url})` }])
      } else {
        setIaMessages([...newMsgs, { role: 'ia', content: '❌ Erreur : Vérifiez votre clé FAL_KEY sur Vercel' }])
      }
    } catch {
      setIaMessages([...newMsgs, { role: 'ia', content: '❌ Erreur de connexion au générateur' }])
    } finally {
      setIaLoading(false)
    }
  }

  return (
    <div>
      <H title="Générateur d'Images IA" icon="🎨" />
      <div className="card-glow bg-black/30 rounded-3xl border border-[#D4AF37]/15 overflow-hidden flex flex-col shadow-2xl">
        <div className="bg-gradient-to-r from-[#D4AF37]/20 to-transparent p-4 border-b border-[#D4AF37]/10">
          <p className="text-[#D4AF37] font-bold text-sm text-center uppercase">Décrivez l'image à créer</p>
        </div>
        
        <div className="p-4 space-y-4 min-h-[400px] max-h-[600px] overflow-y-auto bg-black/20 text-center">
          {iaMessages.length === 0 && (
            <div className="py-20 opacity-40">
              <div className="text-6xl mb-4 text-[#D4AF37]">🖼️</div>
              <p className="text-white text-xs">Exemple : "Un logo de dragon en or et noir style esport"</p>
            </div>
          )}
          
          {iaMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]' : 'bg-[#1a1a1a] text-white w-full'}`}>
                {msg.content.startsWith('![Génération](') ? (
                  <img 
                    src={msg.content.match(/\((.*?)\)/)?.[1] || ''} 
                    className="rounded-lg w-full border-2 border-[#D4AF37]/50 shadow-2xl" 
                    onClick={() => window.open(msg.content.match(/\((.*?)\)/)?.[1], '_blank')} 
                  />
                ) : (
                  <p className="text-xs italic opacity-70">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          
          {iaLoading && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#D4AF37]"></div>
              <p className="ml-3 text-[#D4AF37] text-xs font-bold self-center">CRÉATION EN COURS...</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-black/40 border-t border-white/5 flex gap-2">
          <input 
            value={iaQuestion} 
            onChange={e => setIaQuestion(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && genererImage()} 
            placeholder="Décrivez votre image..." 
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-xs focus:outline-none focus:border-[#D4AF37]" 
          />
          <button 
            onClick={genererImage} 
            disabled={iaLoading}
            className="w-14 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#FFD700] text-black font-bold text-xl active:scale-90 transition-transform"
          >
            🎨
          </button>
        </div>
      </div>
    </div>
  )
}
