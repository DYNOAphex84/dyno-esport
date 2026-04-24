import { useState } from 'react'

export const IASection = ({ H }: { H: any }) => {
  const [iaQuestion, setIaQuestion] = useState('')
  const [iaMessages, setIaMessages] = useState<{ role: 'user' | 'ia'; content: string }[]>([])
  const [iaLoading, setIaLoading] = useState(false)

  const envoyerIA = async () => {
    if (!iaQuestion.trim()) return
    const q = iaQuestion
    const isImage = q.toLowerCase().match(/génère|genere|image|dessine|logo|miniature/)
    const newMsgs = [...iaMessages, { role: 'user' as const, content: q }]
    setIaMessages(newMsgs)
    setIaQuestion(''); setIaLoading(true)

    try {
      const route = isImage ? '/api/image' : '/api/chat'
      const res = await fetch(route, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: q })
      })
      const data = await res.json()
      const content = isImage ? `![Génération](${data.images?.[0]?.url})` : data.choices?.[0]?.message?.content
      setIaMessages([...newMsgs, { role: 'ia', content: content || '❌ Erreur' }])
    } catch {
      setIaMessages([...newMsgs, { role: 'ia', content: '❌ Erreur technique' }])
    } finally { setIaLoading(false) }
  }

  return (
    <div>
      <H title="IA" icon="🤖" />
      <div className="card-glow bg-black/30 rounded-3xl border border-[#D4AF37]/15 overflow-hidden flex flex-col shadow-2xl">
        <div className="bg-gradient-to-r from-[#D4AF37]/20 to-transparent p-4 border-b border-[#D4AF37]/10 flex justify-between items-center">
          <div><p className="text-[#D4AF37] font-bold text-sm">DYNO IA</p><p className="text-gray-600 text-[9px] uppercase">Texte & Image</p></div>
          <button onClick={() => setIaMessages([])} className="text-gray-700 hover:text-red-400 text-[10px] uppercase">Effacer</button>
        </div>
        <div className="p-4 space-y-4 min-h-[400px] max-h-[600px] overflow-y-auto bg-black/20">
          {iaMessages.length === 0 && <div className="text-center py-16 opacity-40"><div className="text-5xl mb-4">🤖</div><p className="text-[#D4AF37] font-bold text-sm uppercase">Prêt</p></div>}
          {iaMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-lg ${msg.role === 'user' ? 'bg-gradient-to-br from-[#D4AF37] to-[#FFD700] text-black' : 'bg-[#1a1a1a] border border-white/5 text-gray-200'}`}>
                {msg.content.startsWith('![Génération](') ? 
                  <img src={msg.content.match(/\((.*?)\)/)?.[1] || ''} className="rounded-lg w-full border border-[#D4AF37]/30 shadow-lg cursor-pointer" onClick={() => window.open(msg.content.match(/\((.*?)\)/)?.[1], '_blank')} /> 
                  : <p className="text-xs whitespace-pre-wrap">{msg.content}</p>
                }
              </div>
            </div>
          ))}
          {iaLoading && <div className="flex justify-start"><div className="bg-[#1a1a1a] border border-[#D4AF37]/20 rounded-2xl px-4 py-3 animate-pulse text-[#D4AF37] text-[10px]">ANALYSE...</div></div>}
        </div>
        <div className="p-4 bg-black/40 border-t border-white/5 flex gap-2">
          <input value={iaQuestion} onChange={e => setIaQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && envoyerIA()} placeholder="Question ou Image..." className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-xs focus:outline-none" />
          <button onClick={envoyerIA} className="w-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#FFD700] text-black font-bold">🚀</button>
        </div>
      </div>
    </div>
  )
}
