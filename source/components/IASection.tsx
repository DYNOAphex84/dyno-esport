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
      // On force l'appel vers l'API interne de Vercel
      const res = await fetch('/api/image', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ prompt: promptUtilisateur })
      })
      
      const data = await res.json()
      
      if (res.ok && data.images && data.images[0]) {
        setIaMessages([...newMsgs, { role: 'ia', content: `![Génération](${data.images[0].url})` }])
      } else {
        // Cela va nous dire si c'est un problème de clé ou autre chose
        const msgErreur = data.error || data.detail || "Erreur serveur"
        setIaMessages([...newMsgs, { role: 'ia', content: `❌ Erreur : ${msgErreur}` }])
      }
    } catch (err: any) {
      // Affiche l'erreur technique réelle
      setIaMessages([...newMsgs, { role: 'ia', content: `❌ Connexion impossible : ${err.message}` }])
    } finally {
      setIaLoading(false)
    }
  }

  return (
    <div>
      <H title="Générateur d'Images IA" icon="🎨" />
      <div className="card-glow bg-black/30 rounded-3xl border border-[#D4AF37]/15 overflow-hidden flex flex-col shadow-2xl">
        <div className="bg-gradient-to-r from-[#D4AF37]/20 to-transparent p-4 border-b border-[#D4AF37]/10">
          <p className="text-[#D4AF37] font-bold text-sm text-center uppercase tracking-widest">Studio de Création DYNO</p>
        </div>
        
        <div className="p-4 space-y-4 min-h-[400px] max-h-[600px] overflow-y-auto bg-black/20 text-center">
          {iaMessages.length === 0 && (
            <div className="py-20 opacity-40">
              <div className="text-6xl mb-4">🖼️</div>
              <p className="text-white text-xs">Exemple : "Un joueur esport pro avec un casque or et noir"</p>
            </div>
          )}
          
          {iaMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
              <div className={`max-w-[90%] px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]' : 'bg-[#1a1a1a] text-white w-full shadow-xl'}`}>
                {msg.content.startsWith('![Génération](') ? (
                  <div className="space-y-2">
                    <img 
                      src={msg.content.match(/\((.*?)\)/)?.[1] || ''} 
                      className="rounded-lg w-full border-2 border-[#D4AF37]/50 shadow-2xl cursor-pointer" 
                      onClick={() => window.open(msg.content.match(/\((.*?)\)/)?.[1], '_blank')} 
                    />
                    <p className="text-[10px] text-gray-500 italic">Cliquez sur l'image pour l'ouvrir</p>
                  </div>
                ) : (
                  <p className="text-xs">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          
          {iaLoading && (
            <div className="flex flex-col items-center py-4">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#D4AF37] mb-2"></div>
              <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-widest animate-pulse">L'IA dessine pour DYNO...</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-black/40 border-t border-white/5 flex gap-2">
          <input 
            value={iaQuestion} 
            onChange={e => setIaQuestion(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && genererImage()} 
            placeholder="Décrivez l'image..." 
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-xs focus:outline-none focus:border-[#D4AF37]" 
          />
          <button 
            onClick={genererImage} 
            disabled={iaLoading || !iaQuestion.trim()}
            className="w-14 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#FFD700] text-black font-bold text-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
          >
            🎨
          </button>
        </div>
      </div>
    </div>
  )
}
