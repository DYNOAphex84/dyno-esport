import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Calendar, History, FileText, Target, Settings, Bell, BellOff } from 'lucide-react'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, onSnapshot, query, orderBy, updateDoc, doc } from 'firebase/firestore'

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

const TiltCard = ({ children }: { children: React.ReactNode }) => {
  const x = useMotionValue(0); const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);
  return (
    <motion.div style={{ x, y, rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="bg-black/40 p-5 rounded-3xl border border-[#D4AF37]/20 shadow-2xl mb-4 relative"
    >{children}</motion.div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('matchs')
  const [matchs, setMatchs] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [compos, setCompos] = useState<any[]>([])
  const [notifications, setNotifications] = useState(true)

  useEffect(() => {
    onSnapshot(query(collection(db, 'matchs'), orderBy('createdAt', 'desc')), (s) => { const d: any[] = []; s.forEach(doc => d.push({id: doc.id, ...doc.data()})); setMatchs(d) })
    onSnapshot(collection(db, 'notes'), (s) => { const d: any[] = []; s.forEach(doc => d.push({id: doc.id, ...doc.data()})); setNotes(d) })
    onSnapshot(collection(db, 'compos'), (s) => { const d: any[] = []; s.forEach(doc => d.push({id: doc.id, ...doc.data()})); setCompos(d) })
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-28">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/5 p-4">
        <div className="max-w-lg mx-auto flex justify-between items-center">
          <img src={LOGO_URL} className="w-8 h-8" />
          <button onClick={() => setNotifications(!notifications)} className="text-[#D4AF37]">
            {notifications ? <Bell size={20} /> : <BellOff size={20} />}
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            
            {activeTab === 'matchs' && matchs.filter(m => !m.termine).map(m => (
              <TiltCard key={m.id}><p className="font-bold text-lg">DYNO vs {m.adversaire}</p></TiltCard>
            ))}

            {activeTab === 'historique' && matchs.filter(m => m.termine).map(m => (
              <TiltCard key={m.id}>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold">{m.adversaire || 'Session'}</span>
                  <span className="text-[#D4AF37] font-bold">{(m.scoreDyno ?? 0)} - {(m.scoreAdversaire ?? 0)}</span>
                </div>
                {m.sousMatchs?.map((sm: any, i: number) => (
                  <div key={i} className="flex justify-between text-xs bg-black/60 p-2 rounded-lg mb-1">
                    <span className="font-bold">DYNO vs {sm.adversaire}</span>
                    <span className="text-[#D4AF37]">{sm.scoreDyno} - {sm.scoreAdv}</span>
                  </div>
                ))}
              </TiltCard>
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

            {activeTab === 'compos' && compos.map(c => (
              <TiltCard key={c.id}>
                <p className="text-[#D4AF37] font-bold text-lg mb-2">{c.mapName}</p>
                <p className="text-sm text-gray-300">{c.players.join(', ')}</p>
              </TiltCard>
            ))}

            {activeTab === 'admin' && (
              <div className="space-y-4">
                <h3 className="text-[#D4AF37] font-bold">Édition des Scores</h3>
                {matchs.filter(m => m.termine).map(m => (
                  <div key={m.id} className="bg-black/60 p-3 rounded-lg flex items-center gap-2 border border-white/5">
                    <span className="text-xs w-1/3 truncate">{m.adversaire}</span>
                    <input type="number" defaultValue={m.scoreDyno ?? 0} className="w-12 bg-black p-1 rounded text-center" 
                           onBlur={(e) => updateDoc(doc(db, 'matchs', m.id), { scoreDyno: parseInt(e.target.value) || 0 })} />
                    <span>-</span>
                    <input type="number" defaultValue={m.scoreAdversaire ?? 0} className="w-12 bg-black p-1 rounded text-center" 
                           onBlur={(e) => updateDoc(doc(db, 'matchs', m.id), { scoreAdversaire: parseInt(e.target.value) || 0 })} />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-6 left-6 right-6 z-50 backdrop-blur-2xl bg-black/80 border border-white/10 rounded-full p-2 flex justify-around">
        {[
          { id: 'matchs', icon: <Calendar/> },
          { id: 'historique', icon: <History/> },
          { id: 'notes', icon: <FileText/> },
          { id: 'compos', icon: <Target/> },
          { id: 'admin', icon: <Settings/> }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`p-3 rounded-full transition-all ${activeTab === tab.id ? 'bg-[#D4AF37] text-black' : 'text-gray-500'}`}>
            {tab.icon}
          </button>
        ))}
      </nav>
    </div>
  )
}