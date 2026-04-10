import { useState, useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, onSnapshot, query, orderBy } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDXwItLM0OZ0VmHj-DLZcH8OBy7wXiHBsM",
  authDomain: "dyno-esport.firebaseapp.com",
  projectId: "dyno-esport",
  storageBucket: "dyno-esport.firebasestorage.app",
  messagingSenderId: "808658404731",
  appId: "1:808658404731:web:f3cf29142d3038816f29de"
}
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const LOGO_URL = 'https://i.imgur.com/gTLj57a.png'

export default function App() {
  const [activeTab, setActiveTab] = useState('matchs')
  const [matchs, setMatchs] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [compos, setCompos] = useState<any[]>([])
  const [classement, setClassement] = useState<any[]>([])

  useEffect(() => {
    onSnapshot(query(collection(db, 'matchs'), orderBy('createdAt', 'desc')), (s) => { const d: any[] = []; s.forEach(doc => d.push({id: doc.id, ...doc.data()})); setMatchs(d) })
    onSnapshot(collection(db, 'notes'), (s) => { const d: any[] = []; s.forEach(doc => d.push({id: doc.id, ...doc.data()})); setNotes(d) })
    onSnapshot(collection(db, 'compos'), (s) => { const d: any[] = []; s.forEach(doc => d.push({id: doc.id, ...doc.data()})); setCompos(d) })
    onSnapshot(collection(db, 'classement'), (s) => { const d: any[] = []; s.forEach(doc => d.push({id: doc.id, ...doc.data()})); setClassement(d) })
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-28 font-sans">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-[#D4AF37]/20 p-4">
        <div className="max-w-lg mx-auto flex justify-between items-center">
          <img src={LOGO_URL} className="w-8 h-8" />
          <span className="text-[#D4AF37] font-bold text-xs uppercase">DYNO ESPORT</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4">
        <div className="transition-opacity duration-300">
          {activeTab === 'matchs' && matchs.filter(m => !m.termine).map(m => (
            <div key={m.id} className="bg-black/40 p-5 rounded-2xl border border-[#D4AF37]/20 mb-4 hover:border-[#D4AF37]/50 transition-colors">
              <p className="font-bold text-lg">DYNO vs {m.adversaire}</p>
            </div>
          ))}

          {activeTab === 'historique' && matchs.filter(m => m.termine).map(m => (
            <div key={m.id} className="bg-black/40 p-4 rounded-xl border border-white/5 mb-2 flex justify-between">
              <span className="font-bold">{m.adversaire}</span>
              <span className="text-[#D4AF37] font-bold">{(m.scoreDyno ?? 0)} - {(m.scoreAdversaire ?? 0)}</span>
            </div>
          ))}

          {activeTab === 'notes' && matchs.filter(m => m.termine).map(m => (
            <div key={m.id} className="mb-6">
              <h3 className="text-[#D4AF37] font-bold mb-2">{m.adversaire}</h3>
              {notes.filter(n => n.matchId === m.id).map((n, i) => (
                <div key={i} className="bg-black/60 p-3 rounded-xl mb-2 border border-white/5 text-sm">
                  <p className="font-bold text-xs text-gray-400">{n.pseudo}</p>
                  {n.commentaire && <p className="italic text-gray-300">"{n.commentaire}"</p>}
                </div>
              ))}
            </div>
          ))}

          {activeTab === 'classement' && classement.map(div => (
            <div key={div.id} className="bg-black/40 p-5 rounded-2xl border border-[#D4AF37]/20 mb-4">
              <h3 className="text-[#D4AF37] font-bold mb-4">{div.div}</h3>
              {div.teams.map((t: any, i: number) => (
                <div key={i} className="flex justify-between py-1 border-b border-white/5 text-sm">
                  <span>{t.name}</span> <span className="font-bold text-[#D4AF37]">{t.pts} pts</span>
                </div>
              ))}
            </div>
          ))}

          {activeTab === 'compos' && compos.map(c => (
            <div key={c.id} className="bg-black/40 p-5 rounded-2xl border border-[#D4AF37]/20 mb-4">
              <p className="text-[#D4AF37] font-bold text-lg mb-2">{c.mapName}</p>
              <p className="text-sm text-gray-300">{c.players.join(', ')}</p>
            </div>
          ))}
        </div>
      </main>

      <nav className="fixed bottom-6 left-6 right-6 z-50 bg-black/90 border border-[#D4AF37]/20 rounded-full p-2 flex justify-around">
        {[
          { id: 'matchs', icon: '📅' },
          { id: 'historique', icon: '📜' },
          { id: 'notes', icon: '📝' },
          { id: 'classement', icon: '🏆' },
          { id: 'compos', icon: '🎯' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`p-3 rounded-full ${activeTab === tab.id ? 'bg-[#D4AF37] text-black' : 'text-gray-500'}`}>
            {tab.icon}
          </button>
        ))}
      </nav>
    </div>
  )
}