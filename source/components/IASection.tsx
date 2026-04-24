import { useState } from 'react'

export const IASection = ({ H }: { H: any }) => {
  const [iaQuestion, setIaQuestion] = useState('')
  const [iaMessages, setIaMessages] = useState<{ role: 'user' | 'ia'; content: string }[]>([])
  const [iaLoading, setIaLoading] = useState(false)

  const genererImage = async () => {
    if (!iaQuestion.trim()) return
    const promptUtilisateur = iaQuestion
    const newMsgs: { role: 'user' | 'ia'; content: string }[] = [
      ...iaMessages,
      { role: 'user', content: promptUtilisateur }
    ]
    setIaMessages(newMsgs)
    setIaQuestion('')
    setIaLoading(true)

    try {
      const res = await fetch('/api/image', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ prompt: promptUtilisateur })
      })
      
      const data = await res.json()
      
      if (res.ok && data.images && data.images[0]) {
        setIaMessages([...newMsgs, { role: 'ia', content: `![Génération](${data.images[0].url})` }])
      } else {
        setIaMessages([...newMsgs, { role: 'ia', content: '❌ Erreur de génération' }])
      }
    } catch (err) {
      setIaMessages([...newMsgs, { role: 'ia', content: '❌ Erreur de connexion' }])
    } finally {
      setIaLoading(false)
    }
  }

  return (
    <div>
      <H title="IA" icon="🤖" />
      <div className="card-glow bg-black/30 rounded-3xl border border-[#D4AF37]/15 overflow-hidden flex flex-col shadow-2xl">
        <div className="bg-gradient-to-r from-[#D4AF37]/20 to-transparent p-4 border-b border-[#D4AF37]/10 flex justify-between items-center">
          <div><p className="text-[#D4AF37] font-bold text-sm">DYNO IA</p></div>
          <button onClick={() => setIaMessages([])} className="text-gray-700 hover:text-red-400 text-[10px] uppercase">Effacer</button>
        </div>
        <div className="p-4 space-y-4 min-h-[400px] max-h-[600px] overflow-y-auto bg-black/20 text-center">
          {iaMessages.length === 0 && <div className="py-20 opacity-40"><div className="text-5xl mb-4">🖼️</div><p className="text-white text-xs">Entrez une description...</p></div>}
          {iaMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
              <div className={`max-w-[90%] px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]' : 'bg-[#1a1a1a] text-white w-full shadow-xl'}`}>
                {msg.content.startsWith('![Génération](') ? (
                  <img src={msg.content.match(/\((.*?)\)/)?.[1] || ''} className="rounded-lg w-full border-2 border-[#D4AF37]/50 shadow-2xl cursor-pointer" onClick={() => window.open(msg.content.match(/\((.*?)\)/)?.[1], '_blank')} />
                ) : ( <p className="text-xs">{msg.content}</p> )}
              </div>
            </div>
          ))}
          {iaLoading && <div className="text-[#D4AF37] animate-pulse text-xs font-bold py-4">⏳ CRÉATION EN COURS...</div>}
        </div>
        <div className="p-4 bg-black/40 border-t border-white/5 flex gap-2">
          <input value={iaQuestion} onChange={e => setIaQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && genererImage()} placeholder="Décrivez 
