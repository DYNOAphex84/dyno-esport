import { useState, useEffect, useCallback, useRef } from 'react'
import { initializeApp } from 'firebase/app'
import {
  getFirestore, collection, addDoc, updateDoc,
  deleteDoc, doc, onSnapshot, query, orderBy,
  getDoc, setDoc
} from 'firebase/firestore'
import {
  getAuth, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut,
  onAuthStateChanged, setPersistence,
  browserLocalPersistence
} from 'firebase/auth'

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
const auth = getAuth(app)
setPersistence(auth, browserLocalPersistence).catch(() => {})

const DW = 'https://discord.com/api/webhooks/1489600048474886295/HfR7YhCRuDpjN6NCw133bShUF9Gj1gak-fWtTYVYgI2G_gllQ001kRfH0w57mUuCTytp'
const YT = 'https://youtube.com/@jonathanla890?si=eHtXG1hjlmCuZ-RC'
const LG = 'https://i.imgur.com/gTLj57a.png'
const AE = 'thibaut.llorens@hotmail.com'
const AM = [
  'Engine', 'Helios', 'Silva', 'The Cliff', 'Artefact',
  'Outlaw', 'Atlantis', 'Horizon', 'Polaris', 'Lunar', 'Ceres'
]

const P = () => (
  <div className="particles">
    {Array.from({ length: 12 }).map((_, i) => (
      <div key={i} className="particle" />
    ))}
  </div>
)

/* ====== REUSABLE COMPONENTS ====== */
const Badge = ({ children, color = 'gold' }: {
  children: React.ReactNode
  color?: 'gold' | 'red' | 'blue' | 'green' | 'purple' | 'orange' | 'gray'
}) => {
  const colors: Record<string, string> = {
    gold: 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/20',
    red: 'bg-red-500/15 text-red-400 border-red-500/20',
    blue: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    green: 'bg-green-500/15 text-green-400 border-green-500/20',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
    orange: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    gray: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
  }
  return (
    <span className={
      "badge border " + (colors[color] || colors.gold)
    }>
      {children}
    </span>
  )
}

const GlassCard = ({ children, className = '', gold = false, style }: {
  children: React.ReactNode
  className?: string
  gold?: boolean
  style?: React.CSSProperties
}) => (
  <div
    className={
      "card-glow rounded-2xl p-4 " +
      (gold ? "glass-gold" : "glass") + " " + className
    }
    style={style}
  >
    {children}
  </div>
)

const SectionHeader = ({ title, icon }: {
  title: string; icon?: string
}) => (
  <div className={
    "relative rounded-2xl p-6 mb-6 text-center " +
    "overflow-hidden glass-gold glow-pulse"
  }>
    <div className={
      "absolute inset-0 bg-gradient-to-br " +
      "from-[#D4AF37]/8 via-transparent to-[#D4AF37]/4"
    } />
    <img
      src={LG} alt="D"
      className={
        "w-12 h-12 mx-auto mb-2 relative z-10 " +
        "drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]"
      }
    />
    <div className="glow-line" />
    <h2 className={
      "text-base font-extrabold uppercase tracking-wider " +
      "bg-gradient-to-r from-[#D4AF37] via-[#FFD700] " +
      "to-[#D4AF37] bg-clip-text text-transparent " +
      "relative z-10"
    }>
      {icon} {title}
    </h2>
  </div>
)

const EmptyState = ({ icon, text }: {
  icon: string; text: string
}) => (
  <div className={
    "text-center py-16 text-gray-600"
  }>
    <span className="text-4xl block mb-3 opacity-30">
      {icon}
    </span>
    <p className="text-sm">{text}</p>
  </div>
)

const InputField = ({ className = '', ...props }: any) => (
  <input
    {...props}
    className={
      "w-full bg-white/4 border border-white/8 " +
      "rounded-xl px-4 py-2.5 text-white text-sm " +
      "placeholder:text-gray-600 transition-all " +
      "duration-200 " + className
    }
  />
)

const TextArea = ({ className = '', ...props }: any) => (
  <textarea
    {...props}
    className={
      "w-full bg-white/4 border border-white/8 " +
      "rounded-xl px-4 py-2.5 text-white text-sm " +
      "placeholder:text-gray-600 resize-none " +
      "transition-all duration-200 " + className
    }
  />
)

/* ====== MAIN APP ====== */
function App() {
  const [activeTab, setActiveTab] = useState('matchs')
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [showSplash, setShowSplash] = useState(true)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [pseudo, setPseudo] = useState('')
  const [email, setEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const [matchs, setMatchs] = useState<any[]>([])
  const [replays, setReplays] = useState<any[]>([])
  const [joueurs, setJoueurs] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [strats, setStrats] = useState<any[]>([])
  const [commentaires, setCommentaires] = useState<any[]>([])
  const [compos, setCompos] = useState<any[]>([])
  const [objectifs, setObjectifs] = useState<any[]>([])
  const [analyses, setAnalyses] = useState<any[]>([])
  const [fichesAdversaires, setFichesAdversaires] = useState<any[]>([])

  const [nouveauMatch, setNouveauMatch] = useState({
    adversaire: '', date: '', horaire1: '', horaire2: '',
    arene: 'Arène 1', type: 'Ligue',
    sousMatchs: [] as { adversaire: string, scoreDyno: string, scoreAdv: string }[]
  })
  const [scoreEdit, setScoreEdit] = useState<any>(null)
  const [editHistoriqueScore, setEditHistoriqueScore] = useState<any>(null)
  const [nouveauReplay, setNouveauReplay] = useState({ titre: '', lien: '' })
  const [nouvelleNote, setNouvelleNote] = useState({ matchId: '', mental: '', communication: '', gameplay: '' })
  const [selectedMatchForNotes, setSelectedMatchForNotes] = useState<any>(null)
  const [nouvelleStrat, setNouvelleStrat] = useState({ adversaire: '', picks: [] as string[], bans: [] as string[] })
  const [showAddStrat, setShowAddStrat] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)
  const [countdowns, setCountdowns] = useState<Record<string, string>>({})
  const [nouveauCommentaire, setNouveauCommentaire] = useState('')
  const [selectedMatchForComment, setSelectedMatchForComment] = useState<any>(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [notifiedMatchs, setNotifiedMatchs] = useState<string[]>([])
  const [selectedMapCompo, setSelectedMapCompo] = useState('')
  const [compoJoueurs, setCompoJoueurs] = useState<string[]>([])
  const [showAddCompo, setShowAddCompo] = useState(false)
  const [anniversaire, setAnniversaire] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [nouvelObjectif, setNouvelObjectif] = useState('')
  const [showBilan, setShowBilan] = useState(false)
  const [selectedMatchForAnalyse, setSelectedMatchForAnalyse] = useState<any>(null)
  const [nouvelleAnalyse, setNouvelleAnalyse] = useState({ bien: '', mal: '', plan: '' })
  const [showAddFiche, setShowAddFiche] = useState(false)
  const [nouvelleFiche, setNouvelleFiche] = useState({ adversaire: '', forces: '', faiblesses: '', notes: '' })

  const pm = useRef(0), pn = useRef(0), pc = useRef(0), ps = useRef(0), ty = useRef(0)

  // ====== ALL HOOKS ======
  useEffect(() => { if (window.location.search.includes('reset=1')) { localStorage.clear(); window.location.href = window.location.pathname } }, [])

  const sendNotification = useCallback((t: string, b: string, tg?: string) => {
    try {
      if (!('Notification' in window) || Notification.permission !== 'granted') return
      const n = new Notification(t, { body: b, icon: LG, badge: LG, tag: tg || 'd', requireInteraction: false })
      n.onclick = () => { window.focus(); n.close() }
    } catch {}
  }, [])

  const requestNotificationPermission = async () => {
    try {
      if (!('Notification' in window)) { alert('❌'); return }
      const p = await Notification.requestPermission()
      if (p === 'granted') { setNotificationsEnabled(true); localStorage.setItem('dyno-notifs', 'true'); alert('✅ Notifs activées !') }
      else { setNotificationsEnabled(false); localStorage.setItem('dyno-notifs', 'false'); alert('❌') }
    } catch { alert('❌') }
  }

  const getMatchDateTime = useCallback((m: any): Date | null => {
    if (!m?.date) return null
    let d = m.date
    const t = m.horaires?.[0] || m.horaire1 || '20:00'
    if (d.includes('/')) { const [dd, mm, yy] = d.split('/'); d = yy + '-' + mm + '-' + dd }
    try { const dt = new Date(d + 'T' + t + ':00'); return isNaN(dt.getTime()) ? null : dt } catch { return null }
  }, [])

  useEffect(() => {
    try { if ('Notification' in window && Notification.permission === 'granted' && localStorage.getItem('dyno-notifs') === 'true') setNotificationsEnabled(true) } catch {}
    try { setNotifiedMatchs(JSON.parse(localStorage.getItem('dyno-notified') || '[]')) } catch { setNotifiedMatchs([]) }
  }, [])

  useEffect(() => {
    if (!notificationsEnabled) return
    try { if (!('Notification' in window) || Notification.permission !== 'granted') return } catch { return }
    const ck = () => { const now = new Date(); matchs.forEach((m: any) => { if (m.termine) return; const mt = getMatchDateTime(m); if (!mt) return; const dm = (mt.getTime() - now.getTime()) / 60000; const k1 = m.id + '-1h'; if (dm > 55 && dm <= 65 && !notifiedMatchs.includes(k1)) { sendNotification('🎮 1h !', 'DYNO vs ' + m.adversaire, 'm1h'); const u = [...notifiedMatchs, k1]; setNotifiedMatchs(u); localStorage.setItem('dyno-notified', JSON.stringify(u)) }; const k2 = m.id + '-15m'; if (dm > 10 && dm <= 20 && !notifiedMatchs.includes(k2)) { sendNotification('🔥 15min !', 'DYNO vs ' + m.adversaire, 'm15'); const u = [...notifiedMatchs, k2]; setNotifiedMatchs(u); localStorage.setItem('dyno-notified', JSON.stringify(u)) }; const k3 = m.id + '-now'; if (dm >= -2 && dm <= 3 && !notifiedMatchs.includes(k3)) { sendNotification('⚡ GO !', 'DYNO vs ' + m.adversaire, 'mnow'); const u = [...notifiedMatchs, k3]; setNotifiedMatchs(u); localStorage.setItem('dyno-notified', JSON.stringify(u)) } }) }
    ck(); const i = setInterval(ck, 60000); return () => clearInterval(i)
  }, [notificationsEnabled, matchs, notifiedMatchs, sendNotification, getMatchDateTime])

  useEffect(() => {
    const u = () => { const now = new Date(); const c: Record<string, string> = {}; matchs.forEach((m: any) => { if (m.termine) return; const mt = getMatchDateTime(m); if (!mt) return; const df = mt.getTime() - now.getTime(); if (df <= 0) { c[m.id] = 'LIVE'; return }; const j = Math.floor(df / 86400000); const h = Math.floor((df % 86400000) / 3600000); const mi = Math.floor((df % 3600000) / 60000); const s = Math.floor((df % 60000) / 1000); c[m.id] = (j > 0 ? j + 'j ' : '') + ((h > 0 || j > 0) ? h + 'h ' : '') + mi + 'm ' + s + 's' }); setCountdowns(c) }
    u(); const i = setInterval(u, 1000); return () => clearInterval(i)
  }, [matchs, getMatchDateTime])

  useEffect(() => { if (localStorage.getItem('dyno-admin') === 'true') setIsAdmin(true) }, [])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u: any) => {
      setUser(u); if (u) { const d = await getDoc(doc(db, 'users', u.uid)); if (d.exists()) { const data = d.data(); setPseudo(data.pseudo || ''); if (data.anniversaire) setAnniversaire(data.anniversaire); if (u.email === AE || data.isAdmin) { setIsAdmin(true); localStorage.setItem('dyno-admin', 'true') } } }; setLoading(false)
    }); return () => unsub()
  }, [])

  // Firestore listeners
  const cols = [
    { name: 'matchs', set: setMatchs },
    { name: 'notes', set: setNotes },
    { name: 'commentaires', set: setCommentaires },
    { name: 'strats', set: setStrats },
    { name: 'replays', set: setReplays },
    { name: 'players', set: setJoueurs },
    { name: 'compos', set: setCompos },
    { name: 'objectifs', set: setObjectifs },
    { name: 'analyses', set: setAnalyses },
    { name: 'fichesAdversaires', set: setFichesAdversaires },
  ]
  cols.forEach(({ name, set }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const q = query(collection(db, name), orderBy('createdAt', 'desc'))
      const u = onSnapshot(q, (s: any) => { const d: any[] = []; s.forEach((x: any) => d.push({ id: x.id, ...x.data() })); set(d) })
      return () => u()
    }, [])
  })

  // Notification effects
  useEffect(() => { if (!notificationsEnabled || pm.current === 0) { pm.current = matchs.length; return }; if (matchs.length > pm.current) { const n = matchs[0]; if (n) sendNotification('📅 Match !', 'DYNO vs ' + n.adversaire, 'nm') }; pm.current = matchs.length }, [matchs, notificationsEnabled, sendNotification])
  useEffect(() => { if (!notificationsEnabled || pn.current === 0) { pn.current = notes.length; return }; if (notes.length > pn.current) { const n = notes[0]; if (n) sendNotification('📊 Note !', n.joueur, 'nn') }; pn.current = notes.length }, [notes, notificationsEnabled, sendNotification])
  useEffect(() => { if (!notificationsEnabled || pc.current === 0) { pc.current = commentaires.length; return }; if (commentaires.length > pc.current) { const n = commentaires[0]; if (n) sendNotification('💬 !', n.joueur + ': ' + n.texte.substring(0, 50), 'nc') }; pc.current = commentaires.length }, [commentaires, notificationsEnabled, sendNotification])
  useEffect(() => { if (!notificationsEnabled || ps.current === 0) { ps.current = strats.length; return }; if (strats.length > ps.current) { const n = strats[0]; if (n) sendNotification('🎯 Strat !', 'DYNO vs ' + n.adversaire, 'ns') }; ps.current = strats.length }, [strats, notificationsEnabled, sendNotification])

  useEffect(() => { const t = setTimeout(() => setShowSplash(false), 2800); return () => clearTimeout(t) }, [])
  useEffect(() => { window.addEventListener('beforeinstallprompt', (e: any) => { e.preventDefault(); setDeferredPrompt(e); setShowInstall(true) }) }, [])

  // ====== FUNCTIONS ======
  const handleInstall = () => { if (deferredPrompt) { deferredPrompt.prompt(); setDeferredPrompt(null); setShowInstall(false) } }
  const handleSignUp = async () => { if (!email || !authPassword || !pseudo) { alert('⚠️ Remplis tout !'); return }; try { const r = await createUserWithEmailAndPassword(auth, email, authPassword); await setDoc(doc(db, 'users', r.user.uid), { pseudo, email, createdAt: Date.now(), isAdmin: email === AE }); await addDoc(collection(db, 'players'), { pseudo, role: 'Joueur', rang: 'Nouveau', userId: r.user.uid, createdAt: Date.now() }); alert('✅!'); setIsSignUp(false); setEmail(''); setAuthPassword('') } catch (e: any) { alert('❌ ' + e.message) } }
  const handleSignIn = async () => { if (!email || !authPassword) { alert('⚠️!'); return }; try { await setPersistence(auth, browserLocalPersistence); await signInWithEmailAndPassword(auth, email, authPassword); localStorage.setItem('user-email', email); alert('✅!'); setEmail(''); setAuthPassword('') } catch (e: any) { alert('❌ ' + e.message) } }
  const handleSignOut = async () => { await signOut(auth); setPseudo(''); setIsAdmin(false); localStorage.removeItem('dyno-admin'); localStorage.removeItem('user-email'); alert('✅!') }
  const handleAdminLogin = () => { if (adminPassword === 'dyno2026') { setIsAdmin(true); localStorage.setItem('dyno-admin', 'true'); setAdminPassword('') } else alert('❌!') }
  const handleAdminLogout = () => { setIsAdmin(false); localStorage.removeItem('dyno-admin') }

  const ajouterSousMatch = () => { const adv = prompt('Adversaire :'); if (!adv) return; const sd = prompt('Score DYNO :'); if (!sd) return; const sa = prompt('Score ' + adv + ' :'); if (!sa) return; setNouveauMatch({ ...nouveauMatch, sousMatchs: [...nouveauMatch.sousMatchs, { adversaire: adv, scoreDyno: sd, scoreAdv: sa }] }) }
  const supprimerSousMatch = (i: number) => { const sm = [...nouveauMatch.sousMatchs]; sm.splice(i, 1); setNouveauMatch({ ...nouveauMatch, sousMatchs: sm }) }
  const ajouterEditSousMatch = () => { if (!editHistoriqueScore) return; const adv = prompt('Adversaire :'); if (!adv) return; const sd = prompt('Score DYNO :'); if (!sd) return; const sa = prompt('Score ' + adv + ' :'); if (!sa) return; setEditHistoriqueScore({ ...editHistoriqueScore, sousMatchs: [...(editHistoriqueScore.sousMatchs || []), { adversaire: adv, scoreDyno: sd, scoreAdv: sa }] }) }
  const supprimerEditSousMatch = (i: number) => { if (!editHistoriqueScore) return; const sm = [...(editHistoriqueScore.sousMatchs || [])]; sm.splice(i, 1); setEditHistoriqueScore({ ...editHistoriqueScore, sousMatchs: sm }) }

  const ajouterMatch = async () => { if (!nouveauMatch.adversaire || !nouveauMatch.date || !nouveauMatch.horaire1) { alert('⚠️!'); return }; const md: any = { ...nouveauMatch, termine: false, disponibles: [], indisponibles: [], createdAt: Date.now() }; if (nouveauMatch.type === 'Division' && nouveauMatch.sousMatchs.length > 0) { md.termine = true; md.sousMatchs = nouveauMatch.sousMatchs; md.scoreDyno = nouveauMatch.sousMatchs.reduce((a: number, s: any) => a + parseInt(s.scoreDyno || '0'), 0); md.scoreAdversaire = nouveauMatch.sousMatchs.reduce((a: number, s: any) => a + parseInt(s.scoreAdv || '0'), 0) }; await addDoc(collection(db, 'matchs'), md); const h = [nouveauMatch.horaire1]; if (nouveauMatch.horaire2) h.push(nouveauMatch.horaire2); try { await fetch(DW, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ embeds: [{ title: '🎮 DYNO vs ' + nouveauMatch.adversaire, color: 13934871, fields: [{ name: '⚔️', value: nouveauMatch.adversaire, inline: true }, { name: '📅', value: nouveauMatch.date, inline: true }, { name: '⏰', value: h.join(' / '), inline: true }, { name: '🏟️', value: nouveauMatch.arene, inline: true }, { name: '📊', value: nouveauMatch.type, inline: true }], footer: { text: 'DYNO', icon_url: LG } }] }) }) } catch {}; setNouveauMatch({ adversaire: '', date: '', horaire1: '', horaire2: '', arene: 'Arène 1', type: 'Ligue', sousMatchs: [] }); alert('✅!') }
  const ajouterReplay = async () => { if (!nouveauReplay.titre || !nouveauReplay.lien) { alert('⚠️!'); return }; await addDoc(collection(db, 'replays'), { ...nouveauReplay, createdAt: Date.now() }); setNouveauReplay({ titre: '', lien: '' }); alert('✅!') }
  const ajouterNote = async () => { if (!user) return; await addDoc(collection(db, 'notes'), { matchId: selectedMatchForNotes?.id, joueur: pseudo, joueurId: user.uid, mental: nouvelleNote.mental, communication: nouvelleNote.communication, gameplay: nouvelleNote.gameplay, createdAt: Date.now() }); setNouvelleNote({ matchId: '', mental: '', communication: '', gameplay: '' }); setSelectedMatchForNotes(null); alert('✅!') }
  const ajouterCommentaire = async (id: string) => { if (!user || !nouveauCommentaire.trim()) return; await addDoc(collection(db, 'commentaires'), { matchId: id, joueur: pseudo, joueurId: user.uid, texte: nouveauCommentaire.trim(), createdAt: Date.now() }); setNouveauCommentaire(''); setSelectedMatchForComment(null); alert('✅!') }
  const ajouterStrat = async () => { if (!nouvelleStrat.adversaire || nouvelleStrat.picks.length === 0 || nouvelleStrat.bans.length === 0) { alert('⚠️!'); return }; await addDoc(collection(db, 'strats'), { adversaire: nouvelleStrat.adversaire, picks: nouvelleStrat.picks, bans: nouvelleStrat.bans, auteur: pseudo || 'Anonyme', auteurId: user?.uid || null, createdAt: Date.now() }); setNouvelleStrat({ adversaire: '', picks: [], bans: [] }); setShowAddStrat(false); alert('✅!') }
  const ajouterCompo = async () => { if (!selectedMapCompo || compoJoueurs.length === 0) { alert('⚠️!'); return }; const ex = compos.find((c: any) => c.map === selectedMapCompo); if (ex) { await updateDoc(doc(db, 'compos', ex.id), { joueurs: compoJoueurs, updatedAt: Date.now() }) } else { await addDoc(collection(db, 'compos'), { map: selectedMapCompo, joueurs: compoJoueurs, auteur: pseudo, createdAt: Date.now() }) }; setShowAddCompo(false); setSelectedMapCompo(''); setCompoJoueurs([]); alert('✅!') }
  const toggleCompoJoueur = (n: string) => { if (compoJoueurs.includes(n)) setCompoJoueurs(compoJoueurs.filter(j => j !== n)); else setCompoJoueurs([...compoJoueurs, n]) }
  const sauvegarderAnniversaire = async () => { if (!user || !anniversaire) return; await updateDoc(doc(db, 'users', user.uid), { anniversaire }); alert('✅!') }
  const ajouterObjectif = async () => { if (!user || !nouvelObjectif.trim()) return; await addDoc(collection(db, 'objectifs'), { texte: nouvelObjectif.trim(), termine: false, joueur: pseudo, joueurId: user.uid, createdAt: Date.now() }); setNouvelObjectif('') }
  const toggleObjectif = async (id: string, c: boolean) => { await updateDoc(doc(db, 'objectifs', id), { termine: !c }) }
  const ajouterAnalyse = async (mid: string) => { if (!user) return; await addDoc(collection(db, 'analyses'), { matchId: mid, joueur: pseudo, joueurId: user.uid, ...nouvelleAnalyse, createdAt: Date.now() }); setNouvelleAnalyse({ bien: '', mal: '', plan: '' }); setSelectedMatchForAnalyse(null); alert('✅!') }
  const ajouterFiche = async () => { if (!nouvelleFiche.adversaire.trim()) return; await addDoc(collection(db, 'fichesAdversaires'), { ...nouvelleFiche, auteur: pseudo, auteurId: user?.uid, createdAt: Date.now() }); setNouvelleFiche({ adversaire: '', forces: '', faiblesses: '', notes: '' }); setShowAddFiche(false); alert('✅!') }
  const del = async (col: string, id: string) => { await deleteDoc(doc(db, col, id)) }
  const updateScore = async () => { if (!scoreEdit) return; await updateDoc(doc(db, 'matchs', scoreEdit.id), { scoreDyno: parseInt(scoreEdit.scoreDyno), scoreAdversaire: parseInt(scoreEdit.scoreAdv), termine: true }); setScoreEdit(null); alert('✅!') }
  const updateHistoriqueScore = async () => { if (!editHistoriqueScore) return; const ud: any = { adversaire: editHistoriqueScore.adversaire, type: editHistoriqueScore.type, arene: editHistoriqueScore.arene, date: editHistoriqueScore.date, termine: editHistoriqueScore.termine !== false }; if (editHistoriqueScore.type === 'Division' && editHistoriqueScore.sousMatchs?.length > 0) { ud.sousMatchs = editHistoriqueScore.sousMatchs; ud.scoreDyno = editHistoriqueScore.sousMatchs.reduce((a: number, s: any) => a + parseInt(s.scoreDyno || '0'), 0); ud.scoreAdversaire = editHistoriqueScore.sousMatchs.reduce((a: number, s: any) => a + parseInt(s.scoreAdv || '0'), 0) } else { ud.scoreDyno = parseInt(editHistoriqueScore.scoreDyno); ud.scoreAdversaire = parseInt(editHistoriqueScore.scoreAdv); if (editHistoriqueScore.type !== 'Division') ud.sousMatchs = [] }; await updateDoc(doc(db, 'matchs', editHistoriqueScore.id), ud); setEditHistoriqueScore(null); alert('✅!') }
  const toggleDispo = async (mid: string) => { if (!user) return; const m = matchs.find((x: any) => x.id === mid); if (!m) return; const d = m.disponibles || []; const i = m.indisponibles || []; await updateDoc(doc(db, 'matchs', mid), { disponibles: d.includes(pseudo) ? d.filter((p: string) => p !== pseudo) : [...d, pseudo], indisponibles: i.filter((p: string) => p !== pseudo) }) }
  const toggleIndispo = async (mid: string) => { if (!user) return; const m = matchs.find((x: any) => x.id === mid); if (!m) return; const d = m.disponibles || []; const i = m.indisponibles || []; await updateDoc(doc(db, 'matchs', mid), { indisponibles: i.includes(pseudo) ? i.filter((p: string) => p !== pseudo) : [...i, pseudo], disponibles: d.filter((p: string) => p !== pseudo) }) }

  const fdf = (s: string) => { if (!s) return ''; if (s.includes('/')) return s; const [y, m, d] = s.split('-'); return d + '/' + m + '/' + y }
  const fts = (t: number) => { const d = new Date(t); return d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }

  const atc = (m: any) => { try { if (!m?.date) return; let y: string, mo: string, d: string; if (m.date.includes('/')) { const p = m.date.split('/'); d = p[0]; mo = p[1]; y = p[2] } else { const p = m.date.split('-'); y = p[0]; mo = p[1]; d = p[2] }; const md = y + mo + d; let h = '20', mi = '00'; if (m.horaires?.length > 0) { const p = m.horaires[0].split(':'); h = p[0]; mi = p[1] || '00' } else if (m.horaire1) { const p = m.horaire1.split(':'); h = p[0]; mi = p[1] || '00' }; const st = h + mi + '00'; const et = (parseInt(h) + 2).toString().padStart(2, '0') + mi + '00'; if (/iPad|iPhone|iPod/.test(navigator.userAgent)) { const ics = 'BEGIN:VCALENDAR\\nVERSION:2.0\\nBEGIN:VEVENT\\nUID:' + m.id + '@d\\nDTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z\\nDTSTART:' + md + 'T' + st + '\\nDTEND:' + md + 'T' + et + '\\nSUMMARY:DYNO vs ' + m.adversaire + '\\nLOCATION:' + m.arene + '\\nEND:VEVENT\\nEND:VCALENDAR'; const b = new Blob([ics], { type: 'text/calendar' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'D_' + m.adversaire + '.ics'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(u) } else { window.open('https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent('DYNO vs ' + m.adversaire) + '&dates=' + md + 'T' + st + '/' + md + 'T' + et + '&location=' + encodeURIComponent(m.arene), '_blank') } } catch (e: any) { alert('❌ ' + e.message) } }

  const hts = (e: React.TouchEvent) => { ty.current = e.touches[0].clientY }
  const htm = (e: React.TouchEvent) => { if (window.scrollY > 0) return; const d = e.touches[0].clientY - ty.current; if (d > 0) setPullDistance(Math.min(d * 0.4, 80)) }
  const hte = () => { if (pullDistance > 60) { setIsRefreshing(true); setTimeout(() => window.location.reload(), 500) }; setPullDistance(0) }
  const toggleMap = (map: string, type: 'picks' | 'bans') => { if (type === 'picks') { if (nouvelleStrat.picks.includes(map)) setNouvelleStrat({ ...nouvelleStrat, picks: nouvelleStrat.picks.filter(m => m !== map) }); else if (nouvelleStrat.picks.length < 4) setNouvelleStrat({ ...nouvelleStrat, picks: [...nouvelleStrat.picks, map] }) } else { if (nouvelleStrat.bans.includes(map)) setNouvelleStrat({ ...nouvelleStrat, bans: nouvelleStrat.bans.filter(m => m !== map) }); else if (nouvelleStrat.bans.length < 4) setNouvelleStrat({ ...nouvelleStrat, bans: [...nouvelleStrat.bans, map] }) } }

  const genBilan = () => { const now = new Date(); const mm = historique.filter((m: any) => { const d = new Date(m.createdAt); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() }); const w = mm.filter((m: any) => (m.scoreDyno || 0) > (m.scoreAdversaire || 0)).length; const l = mm.filter((m: any) => (m.scoreDyno || 0) < (m.scoreAdversaire || 0)).length; const mn = notes.filter((n: any) => { const d = new Date(n.createdAt); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() }); const am = mn.length > 0 ? Math.round(mn.reduce((a: number, n: any) => a + parseInt(n.mental || 0), 0) / mn.length) : 0; const ac = mn.length > 0 ? Math.round(mn.reduce((a: number, n: any) => a + parseInt(n.communication || 0), 0) / mn.length) : 0; const ap = mn.length > 0 ? Math.round(mn.reduce((a: number, n: any) => a + parseInt(n.gameplay || 0), 0) / mn.length) : 0; return { nom: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'][now.getMonth()], m: mm.length, w, l, wr: mm.length > 0 ? Math.round((w / (w + l || 1)) * 100) : 0, am, ac, ap } }

  // ====== COMPUTED ======
  const victoires = matchs.filter((m: any) => m.termine && (m.scoreDyno || 0) > (m.scoreAdversaire || 0)).length
  const defaites = matchs.filter((m: any) => m.termine && (m.scoreDyno || 0) < (m.scoreAdversaire || 0)).length
  const totalMatchs = victoires + defaites
  const winRate = totalMatchs > 0 ? Math.round((victoires / totalMatchs) * 100) : 0
  const prochainsMatchs = matchs.filter((m: any) => !m.termine).sort((a: any, b: any) => new Date(a.date + 'T' + (a.horaires?.[0] || a.horaire1 || '20:00')).getTime() - new Date(b.date + 'T' + (b.horaires?.[0] || b.horaire1 || '20:00')).getTime())
  const historique = matchs.filter((m: any) => m.termine)
  const ytId = (url: string) => { const m = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/); return m ? m[1] : null }

  const typeColor = (t: string) => t === 'Ligue' ? 'blue' : t === 'Scrim' ? 'green' : t === 'Tournoi' ? 'purple' : t === 'Division' ? 'orange' : 'gray'

  const menuItems = [
    { t: 'matchs', i: '📅', l: 'Matchs' },
    { t: 'historique', i: '🏆', l: 'Résultats' },
    { t: 'strats', i: '🎯', l: 'Strats' },
    { t: 'compos', i: '📋', l: 'Compos' },
    { t: 'fiches', i: '🔍', l: 'Fiches' },
    { t: 'notes', i: '📊', l: 'Notes' },
    { t: 'objectifs', i: '🎯', l: 'Objectifs' },
    { t: 'rec', i: '🎬', l: 'Replays' },
    { t: 'roster', i: '👥', l: 'Roster' },
    { t: 'stats', i: '📈', l: 'Stats' },
    { t: 'admin', i: '⚙️', l: 'Admin' },
  ]

  // ====== SPLASH ======
  if (showSplash) return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <P />
      <div className="text-center relative z-10">
        <img src={LG} alt="D" className="w-44 h-44 mx-auto splash-logo drop-shadow-[0_0_60px_rgba(212,175,55,0.5)]" />
        <h1 className="text-5xl font-black bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] bg-clip-text text-transparent mt-6 splash-text tracking-tight">DYNO</h1>
        <p className="text-gray-500 mt-3 splash-sub tracking-[0.4em] uppercase text-xs font-medium">Esport Team</p>
        <div className="mt-8 splash-sub">
          <div className="w-32 h-0.5 mx-auto bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent rounded-full" />
        </div>
      </div>
    </div>
  )

  // ====== MAIN RENDER ======
  return (
    <div className="min-h-screen pb-6 relative">
      <P />

      {/* HEADER */}
      <header className="backdrop-blur-2xl bg-black/40 border-b border-white/5 sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-lg mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowMenu(!showMenu)} className="w-9 h-9 rounded-xl flex items-center justify-center text-lg glass hover:bg-[#D4AF37]/10 transition-all active:scale-90">☰</button>
            <img src={LG} alt="D" className="w-8 h-8 drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]" />
            <div>
              <h1 className="text-sm font-extrabold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent leading-none">DYNO</h1>
              <p className="text-[8px] text-gray-600 uppercase tracking-[0.2em] mt-0.5">Esport</p>
            </div>
          </div>
          <div className="flex gap-1.5 items-center">
            {user && <button onClick={requestNotificationPermission} className={"w-8 h-8 rounded-full flex items-center justify-center transition-all " + (notificationsEnabled ? "bg-[#D4AF37]/15 border border-[#D4AF37]/30 shadow-[0_0_10px_rgba(212,175,55,0.2)]" : "glass")}><span className="text-xs">{notificationsEnabled ? '🔔' : '🔕'}</span></button>}
            {showInstall && <button onClick={handleInstall} className="px-2 py-1 rounded-lg text-[9px] font-bold bg-blue-600/80 text-white">📲</button>}
            {user ? (
              <button onClick={handleSignOut} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-gradient-to-r from-red-600/80 to-red-700/80 text-white text-[10px] hover:scale-105 transition-transform shadow-lg shadow-red-900/30">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[8px] font-black">{pseudo?.[0]?.toUpperCase()}</span>
                {pseudo}
              </button>
            ) : (
              <button onClick={() => setIsSignUp(false)} className="btn-gold text-[10px] py-1.5 px-3">👤 Compte</button>
            )}
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      {showMenu && (
        <div className="fixed inset-0 z-50 flex sidebar-overlay">
          <div className="w-60 bg-gradient-to-b from-[#0f0f0f] to-[#050505] border-r border-[#D4AF37]/10 shadow-[4px_0_40px_rgba(0,0,0,0.9)] sidebar-enter">
            <div className="p-4 border-b border-white/5 flex items-center gap-3">
              <img src={LG} alt="D" className="w-10 h-10 drop-shadow-[0_0_12px_rgba(212,175,55,0.4)]" />
              <div>
                <h2 className="text-sm font-extrabold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">DYNO</h2>
                <p className="text-[8px] text-gray-600 uppercase tracking-[0.2em]">Esport Team</p>
              </div>
            </div>
            <div className="py-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 70px)' }}>
              {menuItems.map(({ t, i, l }) => (
                <button key={t} onClick={() => { setActiveTab(t); setShowMenu(false) }} className={"w-full px-4 py-2.5 flex items-center gap-3 transition-all duration-200 group " + (activeTab === t ? "bg-gradient-to-r from-[#D4AF37]/12 to-transparent text-[#D4AF37] border-r-2 border-[#D4AF37]" : "text-gray-600 hover:text-gray-400 hover:bg-white/3")}>
                  <span className={"text-base transition-transform duration-200 " + (activeTab === t ? "scale-110" : "group-hover:scale-105")}>{i}</span>
                  <span className="text-xs font-semibold tracking-wide">{l}</span>
                  {activeTab === t && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.8)]" />}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setShowMenu(false)} />
        </div>
      )}

      {/* MAIN */}
      <main className="max-w-lg mx-auto px-4 py-5 relative z-10" onTouchStart={hts} onTouchMove={htm} onTouchEnd={hte}>
        {pullDistance > 0 && <div className="flex justify-center mb-4" style={{ height: pullDistance }}><span className={"text-[#D4AF37] text-xl " + (pullDistance > 60 ? 'animate-spin' : '')}>{isRefreshing ? '⏳' : pullDistance > 60 ? '🔄' : '⬇️'}</span></div>}

        {/* ====== MATCHS ====== */}
        {activeTab === 'matchs' && <div className="tab-content">
          <SectionHeader title="Prochains Matchs" icon="📅" />
          <div className="flex justify-end mb-4">
            <div className="flex glass rounded-lg overflow-hidden">
              <button onClick={() => setViewMode('list')} className={"px-3 py-1.5 text-xs transition-all " + (viewMode === 'list' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'text-gray-600')}>☰</button>
              <button onClick={() => setViewMode('grid')} className={"px-3 py-1.5 text-xs transition-all " + (viewMode === 'grid' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'text-gray-600')}>⊞</button>
            </div>
          </div>
          {loading ? <div className="space-y-4"><div className="skeleton h-52 w-full" /><div className="skeleton h-52 w-full" /></div> : prochainsMatchs.length === 0 ? <EmptyState icon="📭" text="Aucun match à venir" /> : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-4'}>
              {prochainsMatchs.map((match: any, idx: number) => (
                <GlassCard key={match.id} gold style={{ animationDelay: (idx * 0.08) + 's' }}>
                  <div className="flex items-center justify-between mb-3">
                    <Badge color={typeColor(match.type) as any}>{match.type}</Badge>
                    <span className="text-[#D4AF37]/80 font-semibold text-xs">{fdf(match.date)}</span>
                  </div>
                  {countdowns[match.id] && (
                    <div className={"rounded-xl p-3 mb-3 text-center " + (countdowns[match.id] === 'LIVE' ? 'bg-red-500/8 border border-red-500/15' : 'bg-[#D4AF37]/6 border border-[#D4AF37]/10')}>
                      {countdowns[match.id] === 'LIVE' ? (
                        <div className="flex items-center justify-center gap-2"><div className="live-dot" /><span className="text-red-400 font-bold text-sm uppercase tracking-wider">En cours</span></div>
                      ) : (
                        <><p className="text-[8px] text-gray-600 uppercase tracking-widest mb-1">Countdown</p><p className="text-base font-bold font-mono tracking-wider countdown-glow bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">{countdowns[match.id]}</p></>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <img src={LG} alt="D" className="w-8 h-8 drop-shadow-[0_0_6px_rgba(212,175,55,0.4)]" />
                      <span className="text-[9px] text-gray-700 font-light uppercase">vs</span>
                    </div>
                    <div className="flex-1 text-right">
                      <p className="font-bold text-white text-sm">{match.adversaire}</p>
                      <p className="text-[9px] text-gray-600">🏟️ {match.arene}</p>
                    </div>
                  </div>
                  <div className="glass rounded-lg p-2 mb-2">
                    <p className="text-[8px] text-gray-600 uppercase tracking-wider">⏰ Horaires</p>
                    <p className="text-[#D4AF37] font-bold text-xs">{match.horaires?.join(' / ') || match.horaire1 || '20:00'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="glass rounded-lg p-2">
                      <p className="text-[8px] text-green-400/60 mb-1">✅ Dispo ({(match.disponibles || []).length})</p>
                      <div className="flex flex-wrap gap-0.5">{(match.disponibles || []).map((p: string, i: number) => <span key={i} className="bg-[#D4AF37]/10 text-[#D4AF37] px-1.5 py-0.5 rounded text-[8px] font-semibold">{p}</span>)}</div>
                    </div>
                    <div className="glass rounded-lg p-2">
                      <p className="text-[8px] text-red-400/60 mb-1">🚫 Indispo ({(match.indisponibles || []).length})</p>
                      <div className="flex flex-wrap gap-0.5">{(match.indisponibles || []).map((p: string, i: number) => <span key={i} className="bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded text-[8px] font-semibold">{p}</span>)}</div>
                    </div>
                  </div>
                  <button onClick={() => atc(match)} className="w-full mb-2 py-2 rounded-lg font-semibold glass text-blue-400 text-[10px] hover:bg-blue-500/10 transition-all">📅 Ajouter au calendrier</button>
                  <div className="flex gap-2">
                    <button onClick={() => toggleDispo(match.id)} disabled={!user} className={"flex-1 py-2 rounded-lg font-bold text-xs transition-all duration-300 " + (!user ? 'glass text-gray-700' : (match.disponibles || []).includes(pseudo) ? 'btn-gold' : 'glass text-[#D4AF37] hover:bg-[#D4AF37]/10')}>{!user ? '🔐' : (match.disponibles || []).includes(pseudo) ? '✅ Dispo' : 'Dispo'}</button>
                    <button onClick={() => toggleIndispo(match.id)} disabled={!user} className={"flex-1 py-2 rounded-lg font-bold text-xs transition-all duration-300 " + (!user ? 'glass text-gray-700' : (match.indisponibles || []).includes(pseudo) ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-900/30' : 'glass text-red-400 hover:bg-red-500/10')}>{!user ? '🔐' : (match.indisponibles || []).includes(pseudo) ? '❌ Indispo' : 'Indispo'}</button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>}

        {/* ====== HISTORIQUE ====== */}
        {activeTab === 'historique' && <div className="tab-content">
          <SectionHeader title="Résultats" icon="🏆" />
          <div className="grid grid-cols-2 gap-3 mb-5">
            <GlassCard gold className="text-center"><p className="text-3xl font-black text-[#D4AF37] count-up">{victoires}</p><p className="text-[8px] text-gray-600 mt-1 uppercase tracking-widest">Victoires</p></GlassCard>
            <GlassCard className="text-center !border-red-500/10"><p className="text-3xl font-black text-red-500 count-up">{defaites}</p><p className="text-[8px] text-gray-600 mt-1 uppercase tracking-widest">Défaites</p></GlassCard>
          </div>
          {historique.length === 0 ? <EmptyState icon="📜" text="Aucun résultat" /> : <div className="space-y-3">{historique.map((match: any, idx: number) => {
            const isWin = (match.scoreDyno || 0) > (match.scoreAdversaire || 0)
            return (
              <GlassCard key={match.id} style={{ animationDelay: (idx * 0.08) + 's' }}>
                <div className="flex items-center justify-between mb-3">
                  <Badge color={isWin ? 'gold' : 'red'}>{isWin ? '🏆 VICTOIRE' : '❌ DÉFAITE'}</Badge>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-[10px]">{fdf(match.date)}</span>
                    {isAdmin && <button onClick={() => setEditHistoriqueScore({ id: match.id, adversaire: match.adversaire || '', scoreDyno: String(match.scoreDyno || 0), scoreAdv: String(match.scoreAdversaire || 0), type: match.type || 'Ligue', arene: match.arene || 'Arène 1', date: match.date || '', termine: true, sousMatchs: match.sousMatchs || [] })} className="w-6 h-6 rounded-md glass-gold flex items-center justify-center text-[9px] hover:bg-[#D4AF37]/20 transition-all">✏️</button>}
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-center"><p className="text-[9px] text-[#D4AF37]/60 font-bold uppercase tracking-wider">DYNO</p><p className="text-3xl font-black bg-gradient-to-b from-[#D4AF37] to-[#B8960F] bg-clip-text text-transparent count-up">{match.scoreDyno}</p></div>
                  <div className="flex flex-col items-center"><div className="w-8 h-[1px] bg-gradient-to-r from-[#D4AF37]/20 via-gray-700 to-red-500/20" /><span className="text-gray-800 text-xs my-1">VS</span><div className="w-8 h-[1px] bg-gradient-to-r from-[#D4AF37]/20 via-gray-700 to-red-500/20" /></div>
                  <div className="text-center"><p className="text-[9px] text-gray-600 font-bold uppercase tracking-wider">{match.adversaire}</p><p className="text-3xl font-black text-gray-500 count-up">{match.scoreAdversaire}</p></div>
                </div>
                {match.sousMatchs?.length > 0 && <div className="mt-2 pt-2 border-t border-white/5 space-y-1"><p className="text-[8px] text-gray-600 uppercase tracking-wider mb-1">Sous-matchs</p>{match.sousMatchs.map((sm: any, i: number) => <div key={i} className="flex justify-between glass rounded-md px-2 py-1"><span className="text-[9px] text-gray-400">{sm.adversaire}</span><span className="text-[9px] font-bold"><span className="text-[#D4AF37]">{sm.scoreDyno}</span>-<span className="text-gray-500">{sm.scoreAdv}</span></span></div>)}</div>}
                {match.type && <p className="text-center text-gray-700 text-[8px] mt-2 uppercase tracking-widest">{match.type} • {match.arene}</p>}
              </GlassCard>
            )
          })}</div>}
        </div>}

        {/* MODAL: Edit Historique */}
        {editHistoriqueScore && <div className="fixed inset-0 bg-black/85 backdrop-blur-xl flex items-center justify-center z-50 p-4 modal-overlay">
          <div className="bg-gradient-to-br from-[#121212] to-[#080808] rounded-2xl p-5 w-full max-w-sm border border-white/8 max-h-[90vh] overflow-y-auto modal-enter">
            <h3 className="text-base font-extrabold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-4 text-center">✏️ Modifier le match</h3>
            <div className="space-y-3 mb-4">
              <div><label className="text-gray-600 text-[9px] mb-1 block uppercase tracking-wider">⚔️ Adversaire</label><InputField type="text" value={editHistoriqueScore.adversaire} onChange={(e: any) => setEditHistoriqueScore({ ...editHistoriqueScore, adversaire: e.target.value })} /></div>
              <div><label className="text-gray-600 text-[9px] mb-1 block uppercase tracking-wider">📅 Date</label><InputField type="date" value={editHistoriqueScore.date?.includes('/') ? (() => { const p = editHistoriqueScore.date.split('/'); return p[2] + '-' + p[1] + '-' + p[0] })() : editHistoriqueScore.date} onChange={(e: any) => setEditHistoriqueScore({ ...editHistoriqueScore, date: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-gray-600 text-[9px] mb-1 block uppercase tracking-wider">Type</label><select value={editHistoriqueScore.type} onChange={(e: any) => setEditHistoriqueScore({ ...editHistoriqueScore, type: e.target.value })} className="w-full bg-white/4 border border-white/8 rounded-xl px-3 py-2.5 text-white text-sm"><option value="Ligue">Ligue</option><option value="Scrim">Scrim</option><option value="Tournoi">Tournoi</option><option value="Division">Division</option></select></div>
                <div><label className="text-gray-600 text-[9px] mb-1 block uppercase tracking-wider">Arène</label><select value={editHistoriqueScore.arene} onChange={(e: any) => setEditHistoriqueScore({ ...editHistoriqueScore, arene: e.target.value })} className="w-full bg-white/4 border border-white/8 rounded-xl px-3 py-2.5 text-white text-sm"><option value="Arène 1">Arène 1</option><option value="Arène 2">Arène 2</option></select></div>
              </div>
              {editHistoriqueScore.type === 'Division' ? (
                <div className="glass-gold rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2"><p className="text-[9px] text-orange-400 font-bold uppercase">🏆 Sous-matchs</p><button onClick={ajouterEditSousMatch} className="px-2 py-0.5 rounded-md bg-orange-500/15 text-orange-400 text-[10px]">➕</button></div>
                  {(editHistoriqueScore.sousMatchs || []).length > 0 ? <div className="space-y-1">{(editHistoriqueScore.sousMatchs || []).map((sm: any, i: number) => <div key={i} className="flex items-center justify-between glass rounded-md px-2 py-1.5"><div><p className="text-[8px] text-gray-500">{sm.adversaire}</p><p className="text-[10px] font-bold"><span className="text-[#D4AF37]">{sm.scoreDyno}</span>-<span className="text-gray-500">{sm.scoreAdv}</span></p></div><button onClick={() => supprimerEditSousMatch(i)} className="text-red-400/40 text-[9px]">🗑️</button></div>)}</div> : <p className="text-[8px] text-gray-600 text-center py-2">Aucun</p>}
                  {(editHistoriqueScore.sousMatchs || []).length > 0 && <div className="mt-2 pt-2 border-t border-white/5 text-center"><p className="text-[8px] text-gray-600 uppercase">Total</p><p className="text-sm font-bold"><span className="text-[#D4AF37]">{(editHistoriqueScore.sousMatchs || []).reduce((a: number, s: any) => a + parseInt(s.scoreDyno || '0'), 0)}</span> - <span className="text-gray-500">{(editHistoriqueScore.sousMatchs || []).reduce((a: number, s: any) => a + parseInt(s.scoreAdv || '0'), 0)}</span></p></div>}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-gray-600 text-[9px] mb-1 block uppercase">🟡 DYNO</label><InputField type="number" placeholder="0" value={editHistoriqueScore.scoreDyno} onChange={(e: any) => setEditHistoriqueScore({ ...editHistoriqueScore, scoreDyno: e.target.value })} className="!text-center !text-xl !font-bold !border-[#D4AF37]/20" /></div>
                  <div><label className="text-gray-600 text-[9px] mb-1 block uppercase">⚪ Adv</label><InputField type="number" placeholder="0" value={editHistoriqueScore.scoreAdv} onChange={(e: any) => setEditHistoriqueScore({ ...editHistoriqueScore, scoreAdv: e.target.value })} className="!text-center !text-xl !font-bold !border-red-500/20" /></div>
                </div>
              )}
              <label className="flex items-center gap-2 glass rounded-lg p-2.5 cursor-pointer"><input type="checkbox" checked={editHistoriqueScore.termine === false} onChange={(e: any) => setEditHistoriqueScore({ ...editHistoriqueScore, termine: e.target.checked ? false : true })} className="w-3.5 h-3.5 rounded accent-[#D4AF37]" /><span className="text-gray-500 text-[10px]">Remettre en « à venir »</span></label>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditHistoriqueScore(null)} className="flex-1 py-2 rounded-xl font-bold glass text-gray-500 text-sm">Annuler</button>
              <button onClick={updateHistoriqueScore} className="flex-1 py-2 rounded-xl btn-gold text-sm">✅ Modifier</button>
            </div>
          </div>
        </div>}

        {/* ====== STRATS ====== */}
        {activeTab === 'strats' && <div className="tab-content">
          <SectionHeader title="Stratégies" icon="🎯" />
          <button onClick={() => setShowAddStrat(true)} className="w-full mb-5 py-3 rounded-xl btn-gold text-sm">➕ Nouvelle Stratégie</button>
          {strats.length === 0 ? <EmptyState icon="📝" text="Aucune stratégie" /> : <div className="space-y-3">{strats.map((s: any, idx: number) => (
            <GlassCard key={s.id} style={{ animationDelay: (idx * 0.08) + 's' }}>
              <div className="flex items-center justify-between mb-3"><div><p className="font-bold text-[#D4AF37] text-sm">DYNO vs {s.adversaire}</p><p className="text-[8px] text-gray-600">par {s.auteur || '?'}</p></div>{(isAdmin || user?.uid === s.auteurId) && <button onClick={() => del('strats', s.id)} className="text-red-400/30 hover:text-red-400 transition-colors">🗑️</button>}</div>
              <div className="mb-2"><p className="text-[8px] text-green-400/60 mb-1.5 uppercase tracking-wider">✅ Picks ({s.picks?.length || 0}/4)</p><div className="flex flex-wrap gap-1">{s.picks?.map((p: string, i: number) => <span key={i} className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded-md text-[9px] border border-green-500/10 font-semibold">{p}</span>)}</div></div>
              <div><p className="text-[8px] text-red-400/60 mb-1.5 uppercase tracking-wider">❌ Bans ({s.bans?.length || 0}/4)</p><div className="flex flex-wrap gap-1">{s.bans?.map((b: string, i: number) => <span key={i} className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded-md text-[9px] border border-red-500/10 font-semibold">{b}</span>)}</div></div>
            </GlassCard>
          ))}</div>}
          {showAddStrat && <div className="fixed inset-0 bg-black/85 backdrop-blur-xl flex items-center justify-center z-50 p-4 modal-overlay"><div className="bg-gradient-to-br from-[#121212] to-[#080808] rounded-2xl p-5 w-full max-w-md border border-white/8 max-h-[90vh] overflow-y-auto modal-enter">
            <h3 className="text-base font-extrabold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-4 text-center">🎯 Stratégie</h3>
            <div className="space-y-3 mb-4">
              <div><label className="text-gray-600 text-[9px] mb-1 block uppercase tracking-wider">⚔️ Adversaire</label><InputField type="text" placeholder="Nom" value={nouvelleStrat.adversaire} onChange={(e: any) => setNouvelleStrat({ ...nouvelleStrat, adversaire: e.target.value })} /></div>
              <div><label className="text-gray-600 text-[9px] mb-1.5 block uppercase tracking-wider">✅ Picks (4)</label><div className="grid grid-cols-3 gap-1.5">{AM.map(m => <button key={m} onClick={() => toggleMap(m, 'picks')} className={"px-2 py-1.5 rounded-lg text-[9px] font-bold transition-all " + (nouvelleStrat.picks.includes(m) ? 'bg-green-600 text-white shadow-lg shadow-green-900/30' : 'glass text-gray-500 hover:text-gray-300')}>{m}</button>)}</div></div>
              <div><label className="text-gray-600 text-[9px] mb-1.5 block uppercase tracking-wider">❌ Bans (4)</label><div className="grid grid-cols-3 gap-1.5">{AM.map(m => <button key={m} onClick={() => toggleMap(m, 'bans')} className={"px-2 py-1.5 rounded-lg text-[9px] font-bold transition-all " + (nouvelleStrat.bans.includes(m) ? 'bg-red-600 text-white shadow-lg shadow-red-900/30' : 'glass text-gray-500 hover:text-gray-300')}>{m}</button>)}</div></div>
            </div>
            <div className="flex gap-2"><button onClick={() => { setShowAddStrat(false); setNouvelleStrat({ adversaire: '', picks: [], bans: [] }) }} className="flex-1 py-2 rounded-xl font-bold glass text-gray-500 text-sm">Annuler</button><button onClick={ajouterStrat} className="flex-1 py-2 rounded-xl btn-gold text-sm">✅</button></div>
          </div></div>}
        </div>}

        {/* ====== COMPOS ====== */}
        {activeTab === 'compos' && <div className="tab-content">
          <SectionHeader title="Compositions" icon="📋" />
          {user && <button onClick={() => setShowAddCompo(true)} className="w-full mb-5 py-3 rounded-xl btn-gold text-sm">➕ Compo</button>}
          {compos.length === 0 ? <EmptyState icon="📋" text="Aucune composition" /> : <div className="space-y-3">{compos.map((c: any, idx: number) => <GlassCard key={c.id} style={{ animationDelay: (idx * 0.08) + 's' }}><div className="flex items-center justify-between mb-2"><p className="font-bold text-[#D4AF37] text-sm">🗺️ {c.map}</p>{(isAdmin || user?.uid === c.auteurId) && <button onClick={() => del('compos', c.id)} className="text-red-400/30 hover:text-red-400 transition-colors">🗑️</button>}</div><div className="flex flex-wrap gap-1">{c.joueurs?.map((j: string, i: number) => <span key={i} className="bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded-md text-[9px] font-semibold border border-[#D4AF37]/10">{j}</span>)}</div></GlassCard>)}</div>}
          {showAddCompo && <div className="fixed inset-0 bg-black/85 backdrop-blur-xl flex items-center justify-center z-50 p-4 modal-overlay"><div className="bg-gradient-to-br from-[#121212] to-[#080808] rounded-2xl p-5 w-full max-w-md border border-white/8 max-h-[90vh] overflow-y-auto modal-enter">
            <h3 className="text-base font-extrabold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-4 text-center">📋 Compo</h3>
            <div className="space-y-3 mb-4">
              <div><label className="text-gray-600 text-[9px] mb-1.5 block uppercase tracking-wider">🗺️ Map</label><div className="grid grid-cols-3 gap-1.5">{AM.map(m => <button key={m} onClick={() => setSelectedMapCompo(m)} className={"px-2 py-1.5 rounded-lg text-[9px] font-bold transition-all " + (selectedMapCompo === m ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/30' : 'glass text-gray-500')}>{m}</button>)}</div></div>
              <div><label className="text-gray-600 text-[9px] mb-1.5 block uppercase tracking-wider">👥 Joueurs</label><div className="grid grid-cols-2 gap-1.5">{joueurs.filter((j: any) => j.actif !== false).map((j: any) => <button key={j.id} onClick={() => toggleCompoJoueur(j.pseudo)} className={"px-2 py-1.5 rounded-lg text-[9px] font-bold transition-all " + (compoJoueurs.includes(j.pseudo) ? 'bg-green-600 text-white shadow-lg shadow-green-900/30' : 'glass text-gray-500')}>{j.pseudo}</button>)}</div></div>
            </div>
            <div className="flex gap-2"><button onClick={() => { setShowAddCompo(false); setSelectedMapCompo(''); setCompoJoueurs([]) }} className="flex-1 py-2 rounded-xl font-bold glass text-gray-500 text-sm">Annuler</button><button onClick={ajouterCompo} className="flex-1 py-2 rounded-xl btn-gold text-sm">✅</button></div>
          </div></div>}
        </div>}

        {/* ====== FICHES ====== */}
        {activeTab === 'fiches' && <div className="tab-content">
          <SectionHeader title="Fiches Adversaires" icon="🔍" />
          {user && <button onClick={() => setShowAddFiche(true)} className="w-full mb-5 py-3 rounded-xl btn-gold text-sm">➕ Fiche</button>}
          {fichesAdversaires.length === 0 ? <EmptyState icon="🔍" text="Aucune fiche" /> : <div className="space-y-3">{fichesAdversaires.map((f: any, idx: number) => <GlassCard key={f.id} style={{ animationDelay: (idx * 0.08) + 's' }}>
            <div className="flex items-center justify-between mb-3"><p className="font-bold text-[#D4AF37] text-sm">⚔️ {f.adversaire}</p>{(isAdmin || user?.uid === f.auteurId) && <button onClick={() => del('fichesAdversaires', f.id)} className="text-red-400/30 hover:text-red-400 transition-colors">🗑️</button>}</div>
            <div className="space-y-2">
              <div className="bg-green-500/5 rounded-lg p-2.5 border border-green-500/8"><p className="text-[8px] text-green-400 uppercase font-bold mb-0.5">💪 Forces</p><p className="text-gray-300 text-xs">{f.forces || '—'}</p></div>
              <div className="bg-red-500/5 rounded-lg p-2.5 border border-red-500/8"><p className="text-[8px] text-red-400 uppercase font-bold mb-0.5">⚠️ Faiblesses</p><p className="text-gray-300 text-xs">{f.faiblesses || '—'}</p></div>
              {f.notes && <div className="glass rounded-lg p-2.5"><p className="text-[8px] text-gray-500 uppercase font-bold mb-0.5">📝 Notes</p><p className="text-gray-300 text-xs">{f.notes}</p></div>}
            </div>
            <p className="text-gray-700 text-[8px] mt-2">par {f.auteur}</p>
          </GlassCard>)}</div>}
          {showAddFiche && <div className="fixed inset-0 bg-black/85 backdrop-blur-xl flex items-center justify-center z-50 p-4 modal-overlay"><div className="bg-gradient-to-br from-[#121212] to-[#080808] rounded-2xl p-5 w-full max-w-md border border-white/8 max-h-[90vh] overflow-y-auto modal-enter">
            <h3 className="text-base font-extrabold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-4 text-center">🔍 Fiche</h3>
            <div className="space-y-3 mb-4">
              <div><label className="text-gray-600 text-[9px] mb-1 block uppercase tracking-wider">⚔️ Adversaire</label><InputField type="text" placeholder="Nom" value={nouvelleFiche.adversaire} onChange={(e: any) => setNouvelleFiche({ ...nouvelleFiche, adversaire: e.target.value })} /></div>
              <div><label className="text-gray-600 text-[9px] mb-1 block uppercase tracking-wider">💪 Forces</label><TextArea value={nouvelleFiche.forces} onChange={(e: any) => setNouvelleFiche({ ...nouvelleFiche, forces: e.target.value })} rows={2} className="!border-green-500/15" /></div>
              <div><label className="text-gray-600 text-[9px] mb-1 block uppercase tracking-wider">⚠️ Faiblesses</label><TextArea value={nouvelleFiche.faiblesses} onChange={(e: any) => setNouvelleFiche({ ...nouvelleFiche, faiblesses: e.target.value })} rows={2} className="!border-red-500/15" /></div>
              <div><label className="text-gray-600 text-[9px] mb-1 block uppercase tracking-wider">📝 Notes</label><TextArea value={nouvelleFiche.notes} onChange={(e: any) => setNouvelleFiche({ ...nouvelleFiche, notes: e.target.value })} rows={2} /></div>
            </div>
            <div className="flex gap-2"><button onClick={() => { setShowAddFiche(false); setNouvelleFiche({ adversaire: '', forces: '', faiblesses: '', notes: '' }) }} className="flex-1 py-2 rounded-xl font-bold glass text-gray-500 text-sm">Annuler</button><button onClick={ajouterFiche} className="flex-1 py-2 rounded-xl btn-gold text-sm">✅</button></div>
          </div></div>}
        </div>}

        {/* ====== NOTES ====== */}
        {activeTab === 'notes' && <div className="tab-content">
          <SectionHeader title="Notes & Analyses" icon="📊" />
          {historique.length === 0 ? <EmptyState icon="📊" text="Aucun match terminé" /> : <div className="space-y-4">{historique.map((match: any, idx: number) => {
            const mn = notes.filter((n: any) => n.matchId === match.id)
            const mc = commentaires.filter((c: any) => c.matchId === match.id)
            const ma = analyses.filter((a: any) => a.matchId === match.id)
            return <GlassCard key={match.id} style={{ animationDelay: (idx * 0.08) + 's' }}>
              <div className="flex items-center justify-between mb-3"><p className="font-bold text-[#D4AF37] text-sm">DYNO vs {match.adversaire}</p><div className="flex items-center gap-2"><Badge color={(match.scoreDyno || 0) > (match.scoreAdversaire || 0) ? 'gold' : 'red'}>{match.scoreDyno}-{match.scoreAdversaire}</Badge><span className="text-gray-700 text-[9px]">{fdf(match.date)}</span></div></div>
              <div className="flex gap-1.5 mb-3">
                <button onClick={() => { setSelectedMatchForNotes(match); setNouvelleNote({ matchId: match.id, mental: '', communication: '', gameplay: '' }) }} className="flex-1 py-1.5 rounded-md font-semibold bg-purple-500/8 text-purple-400 border border-purple-500/10 text-[9px] hover:bg-purple-500/15 transition-all">📝 Note</button>
                <button onClick={() => setSelectedMatchForComment(selectedMatchForComment?.id === match.id ? null : match)} className="flex-1 py-1.5 rounded-md font-semibold bg-cyan-500/8 text-cyan-400 border border-cyan-500/10 text-[9px] hover:bg-cyan-500/15 transition-all">💬 Comm</button>
                <button onClick={() => setSelectedMatchForAnalyse(selectedMatchForAnalyse?.id === match.id ? null : match)} className="flex-1 py-1.5 rounded-md font-semibold bg-orange-500/8 text-orange-400 border border-orange-500/10 text-[9px] hover:bg-orange-500/15 transition-all">📋 Analyse</button>
              </div>
              {selectedMatchForComment?.id === match.id && user && <div className="glass rounded-lg p-2.5 mb-3"><TextArea placeholder="Commentaire..." value={nouveauCommentaire} onChange={(e: any) => setNouveauCommentaire(e.target.value)} rows={2} className="mb-2" /><button onClick={() => ajouterCommentaire(match.id)} className="w-full py-1.5 rounded-md btn-gold text-[10px]">💬 Envoyer</button></div>}
              {selectedMatchForAnalyse?.id === match.id && user && <div className="glass rounded-lg p-2.5 mb-3 space-y-2"><div><label className="text-[7px] text-green-400 uppercase font-bold">✅ Bien</label><TextArea value={nouvelleAnalyse.bien} onChange={(e: any) => setNouvelleAnalyse({ ...nouvelleAnalyse, bien: e.target.value })} rows={2} className="mt-1 !border-green-500/10" /></div><div><label className="text-[7px] text-red-400 uppercase font-bold">❌ Mal</label><TextArea value={nouvelleAnalyse.mal} onChange={(e: any) => setNouvelleAnalyse({ ...nouvelleAnalyse, mal: e.target.value })} rows={2} className="mt-1 !border-red-500/10" /></div><div><label className="text-[7px] text-blue-400 uppercase font-bold">🎯 Plan</label><TextArea value={nouvelleAnalyse.plan} onChange={(e: any) => setNouvelleAnalyse({ ...nouvelleAnalyse, plan: e.target.value })} rows={2} className="mt-1 !border-blue-500/10" /></div><button onClick={() => ajouterAnalyse(match.id)} className="w-full py-1.5 rounded-md btn-gold text-[10px]">📋</button></div>}
              {mn.length > 0 && <div className="space-y-1 mb-2"><p className="text-[8px] text-purple-400/60 uppercase tracking-wider font-bold">📊 Notes ({mn.length})</p>{mn.map((n: any) => <div key={n.id} className="glass rounded-md p-2"><div className="flex items-center justify-between mb-1"><p className="text-[#D4AF37] font-semibold text-[9px]">{n.joueur}</p>{isAdmin && <button onClick={() => del('notes', n.id)} className="text-red-400/30 text-[8px]">🗑️</button>}</div><div className="grid grid-cols-3 gap-1 text-center"><div className="bg-purple-500/6 rounded p-1"><p className="text-[7px] text-gray-600">🧠</p><p className="text-purple-400 font-bold text-[10px]">{n.mental}/10</p></div><div className="bg-blue-500/6 rounded p-1"><p className="text-[7px] text-gray-600">💬</p><p className="text-blue-400 font-bold text-[10px]">{n.communication}/10</p></div><div className="bg-green-500/6 rounded p-1"><p className="text-[7px] text-gray-600">🎯</p><p className="text-green-400 font-bold text-[10px]">{n.gameplay}/10</p></div></div></div>)}</div>}
              {mc.length > 0 && <div className="space-y-1 mb-2"><p className="text-[8px] text-cyan-400/60 uppercase tracking-wider font-bold">💬 ({mc.length})</p>{mc.map((c: any) => <div key={c.id} className="glass rounded-md p-2"><div className="flex items-center justify-between"><p className="text-cyan-400 font-semibold text-[9px]">{c.joueur}</p><div className="flex items-center gap-1"><p className="text-gray-700 text-[8px]">{fts(c.createdAt)}</p>{(isAdmin || user?.uid === c.joueurId) && <button onClick={() => del('commentaires', c.id)} className="text-red-400/30 text-[8px]">🗑️</button>}</div></div><p className="text-gray-400 text-[10px] mt-0.5">{c.texte}</p></div>)}</div>}
              {ma.length > 0 && <div className="space-y-1"><p className="text-[8px] text-orange-400/60 uppercase tracking-wider font-bold">📋 ({ma.length})</p>{ma.map((a: any) => <div key={a.id} className="glass rounded-md p-2"><div className="flex items-center justify-between mb-1"><p className="text-orange-400 font-semibold text-[9px]">{a.joueur}</p>{(isAdmin || user?.uid === a.joueurId) && <button onClick={() => del('analyses', a.id)} className="text-red-400/30 text-[8px]">🗑️</button>}</div>{a.bien && <div className="bg-green-500/5 rounded p-1.5 mb-1"><p className="text-[7px] text-green-400 font-bold">✅</p><p className="text-gray-300 text-[9px]">{a.bien}</p></div>}{a.mal && <div className="bg-red-500/5 rounded p-1.5 mb-1"><p className="text-[7px] text-red-400 font-bold">❌</p><p className="text-gray-300 text-[9px]">{a.mal}</p></div>}{a.plan && <div className="bg-blue-500/5 rounded p-1.5"><p className="text-[7px] text-blue-400 font-bold">🎯</p><p className="text-gray-300 text-[9px]">{a.plan}</p></div>}</div>)}</div>}
              {mn.length === 0 && mc.length === 0 && ma.length === 0 && <p className="text-gray-700 text-[9px] text-center mt-2">Aucune donnée</p>}
            </GlassCard>
          })}</div>}
          {selectedMatchForNotes && <div className="fixed inset-0 bg-black/85 backdrop-blur-xl flex items-center justify-center z-50 p-4 modal-overlay"><div className="bg-gradient-to-br from-[#121212] to-[#080808] rounded-2xl p-5 w-full max-w-sm border border-white/8 modal-enter">
            <h3 className="text-base font-extrabold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-4 text-center">📊 DYNO vs {selectedMatchForNotes.adversaire}</h3>
            <div className="space-y-3 mb-4">
              <div><label className="text-gray-600 text-[9px] mb-1 block uppercase">🧠 Mental</label><InputField type="number" min="0" max="10" value={nouvelleNote.mental} onChange={(e: any) => setNouvelleNote({ ...nouvelleNote, mental: e.target.value })} className="!text-center !text-xl !font-bold" /></div>
              <div><label className="text-gray-600 text-[9px] mb-1 block uppercase">💬 Communication</label><InputField type="number" min="0" max="10" value={nouvelleNote.communication} onChange={(e: any) => setNouvelleNote({ ...nouvelleNote, communication: e.target.value })} className="!text-center !text-xl !font-bold" /></div>
              <div><label className="text-gray-600 text-[9px] mb-1 block uppercase">🎯 Performance</label><InputField type="number" min="0" max="10" value={nouvelleNote.gameplay} onChange={(e: any) => setNouvelleNote({ ...nouvelleNote, gameplay: e.target.value })} className="!text-center !text-xl !font-bold" /></div>
            </div>
            <div className="flex gap-2"><button onClick={() => { setSelectedMatchForNotes(null); setNouvelleNote({ matchId: '', mental: '', communication: '', gameplay: '' }) }} className="flex-1 py-2 rounded-xl font-bold glass text-gray-500 text-sm">Annuler</button><button onClick={ajouterNote} className="flex-1 py-2 rounded-xl btn-gold text-sm">✅</button></div>
          </div></div>}
        </div>}

        {/* ====== OBJECTIFS ====== */}
        {activeTab === 'objectifs' && <div className="tab-content">
          <SectionHeader title="Mes Objectifs" icon="🎯" />
          {user && <div className="flex gap-2 mb-5"><InputField type="text" placeholder="Nouvel objectif..." value={nouvelObjectif} onChange={(e: any) => setNouvelObjectif(e.target.value)} onKeyDown={(e: any) => { if (e.key === 'Enter') ajouterObjectif() }} /><button onClick={ajouterObjectif} className="px-4 py-2.5 rounded-xl btn-gold text-sm">➕</button></div>}
          {objectifs.filter((o: any) => o.joueurId === user?.uid).length === 0 ? <EmptyState icon="🎯" text="Aucun objectif" /> : <div className="space-y-3">
            {objectifs.filter((o: any) => !o.termine && o.joueurId === user?.uid).length > 0 && <div><p className="text-[8px] text-[#D4AF37]/60 mb-2 uppercase tracking-widest font-bold">🔄 En cours</p><div className="space-y-2">{objectifs.filter((o: any) => !o.termine && o.joueurId === user?.uid).map((o: any, idx: number) => <GlassCard key={o.id} gold className="!p-3 flex items-start gap-3" style={{ animationDelay: (idx * 0.08) + 's' }}><button onClick={() => toggleObjectif(o.id, o.termine)} className="mt-0.5 w-4.5 h-4.5 rounded-md border-2 border-[#D4AF37]/40 flex-shrink-0 hover:border-[#D4AF37] transition-colors" /><div className="flex-1"><p className="text-white text-sm">{o.texte}</p><p className="text-gray-700 text-[8px] mt-0.5">{new Date(o.createdAt).toLocaleDateString('fr-FR')}</p></div><button onClick={() => del('objectifs', o.id)} className="text-red-400/30 text-sm flex-shrink-0 hover:text-red-400 transition-colors">🗑️</button></GlassCard>)}</div></div>}
            {objectifs.filter((o: any) => o.termine && o.joueurId === user?.uid).length > 0 && <div className="mt-4"><p className="text-[8px] text-green-400/60 mb-2 uppercase tracking-widest font-bold">✅ Atteints ({objectifs.filter((o: any) => o.termine && o.joueurId === user?.uid).length})</p><div className="space-y-2">{objectifs.filter((o: any) => o.termine && o.joueurId === user?.uid).map((o: any) => <div key={o.id} className="glass rounded-xl p-3 flex items-start gap-3 opacity-50"><button onClick={() => toggleObjectif(o.id, o.termine)} className="mt-0.5 w-4.5 h-4.5 rounded-md bg-green-600 flex items-center justify-center flex-shrink-0"><span className="text-white text-[7px]">✓</span></button><p className="text-gray-500 text-sm line-through flex-1">{o.texte}</p><button onClick={() => del('objectifs', o.id)} className="text-red-400/30 text-sm flex-shrink-0">🗑️</button></div>)}</div></div>}
          </div>}
        </div>}

        {/* ====== REPLAYS ====== */}
        {activeTab === 'rec' && <div className="tab-content">
          <SectionHeader title="Replays" icon="🎬" />
          <a href={YT} target="_blank" className="flex items-center justify-center gap-2 w-full mb-5 py-2.5 rounded-xl glass text-red-400 text-xs font-semibold hover:bg-red-500/10 transition-all"><span className="live-dot" style={{ width: 6, height: 6 }} />YouTube</a>
          {replays.length === 0 ? <EmptyState icon="📹" text="Aucun replay" /> : <div className="space-y-3">{replays.map((r: any, idx: number) => <GlassCard key={r.id} style={{ animationDelay: (idx * 0.08) + 's' }}><div className="flex items-center justify-between mb-2"><h3 className="font-bold text-[#D4AF37] text-sm">{r.titre}</h3>{isAdmin && <button onClick={() => del('replays', r.id)} className="text-red-400/30 text-[8px] hover:text-red-400 transition-colors">🗑️</button>}</div>{ytId(r.lien) ? <div className="relative w-full pb-[56.25%] rounded-lg overflow-hidden"><iframe src={'https://www.youtube.com/embed/' + ytId(r.lien)} className="absolute top-0 left-0 w-full h-full" frameBorder="0" allowFullScreen /></div> : <a href={r.lien} target="_blank" className="block py-2 rounded-lg btn-gold text-center text-sm">▶️ Regarder</a>}</GlassCard>)}</div>}
        </div>}

        {/* ====== ROSTER ====== */}
        {activeTab === 'roster' && <div className="tab-content">
          <SectionHeader title="Roster" icon="👥" />
          {user && <GlassCard className="mb-5 !border-pink-500/8"><p className="text-[8px] text-pink-400/60 mb-1.5 uppercase tracking-wider">🎂 Anniversaire</p><div className="flex gap-2"><InputField type="date" value={anniversaire} onChange={(e: any) => setAnniversaire(e.target.value)} /><button onClick={sauvegarderAnniversaire} className="px-3 py-2 rounded-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs shadow-lg shadow-pink-900/30">💾</button></div></GlassCard>}
          <div className="space-y-2">{joueurs.filter((j: any) => j.actif !== false).map((j: any, idx: number) => <GlassCard key={j.id} className="!p-3 flex items-center gap-3" style={{ animationDelay: (idx * 0.08) + 's' }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 flex items-center justify-center text-[#D4AF37] font-black text-base border border-[#D4AF37]/10">{j.pseudo[0]?.toUpperCase()}</div>
            <div className="flex-1"><p className="font-bold text-[#D4AF37] text-sm">{j.pseudo}</p><p className="text-[9px] text-gray-600">🎮 {j.role}</p></div>
            {isAdmin && <button onClick={() => del('players', j.id)} className="text-red-400/30 hover:text-red-400 transition-colors">🗑️</button>}
          </GlassCard>)}</div>
        </div>}

        {/* ====== STATS ====== */}
        {activeTab === 'stats' && <div className="tab-content">
          <SectionHeader title="Statistiques" icon="📈" />
          <div className="grid grid-cols-2 gap-3 mb-5">
            <GlassCard gold className="text-center"><p className="text-3xl font-black bg-gradient-to-b from-[#D4AF37] to-[#B8960F] bg-clip-text text-transparent count-up">{winRate}%</p><p className="text-[8px] text-gray-600 mt-1 uppercase tracking-widest">Win Rate</p></GlassCard>
            <GlassCard gold className="text-center"><p className="text-3xl font-black bg-gradient-to-b from-[#D4AF37] to-[#B8960F] bg-clip-text text-transparent count-up">{totalMatchs}</p><p className="text-[8px] text-gray-600 mt-1 uppercase tracking-widest">Matchs</p></GlassCard>
          </div>
          <GlassCard className="mb-5">
            <h3 className="text-[10px] font-bold text-[#D4AF37]/60 mb-3 uppercase tracking-widest">📊 Répartition</h3>
            <div className="space-y-3">
              <div><div className="flex justify-between mb-1"><span className="text-gray-600 text-[9px]">🏆 Victoires</span><span className="text-[#D4AF37] font-bold text-xs">{victoires}</span></div><div className="bg-white/3 rounded-full h-1.5 overflow-hidden"><div className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] h-full rounded-full progress-fill shadow-[0_0_8px_rgba(212,175,55,0.3)]" style={{ width: (totalMatchs > 0 ? (victoires / totalMatchs) * 100 : 0) + '%' }} /></div></div>
              <div><div className="flex justify-between mb-1"><span className="text-gray-600 text-[9px]">❌ Défaites</span><span className="text-red-500 font-bold text-xs">{defaites}</span></div><div className="bg-white/3 rounded-full h-1.5 overflow-hidden"><div className="bg-gradient-to-r from-red-600 to-red-500 h-full rounded-full progress-fill shadow-[0_0_8px_rgba(239,68,68,0.3)]" style={{ width: (totalMatchs > 0 ? (defaites / totalMatchs) * 100 : 0) + '%' }} /></div></div>
            </div>
          </GlassCard>
          <button onClick={() => setShowBilan(true)} className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600/80 to-purple-700/80 text-white shadow-lg shadow-purple-900/30 text-sm hover:scale-[1.02] transition-transform">📊 Bilan du mois</button>
          {showBilan && (() => { const b = genBilan(); return <div className="fixed inset-0 bg-black/85 backdrop-blur-xl flex items-center justify-center z-50 p-4 modal-overlay"><div className="bg-gradient-to-br from-[#121212] to-[#080808] rounded-2xl p-5 w-full max-w-sm border border-white/8 modal-enter">
            <h3 className="text-base font-extrabold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-4 text-center">📊 Bilan {b.nom}</h3>
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-3 gap-2"><div className="glass rounded-lg p-2.5 text-center"><p className="text-xl font-black text-white count-up">{b.m}</p><p className="text-[7px] text-gray-600 uppercase">Matchs</p></div><div className="bg-green-500/5 rounded-lg p-2.5 border border-green-500/8 text-center"><p className="text-xl font-black text-green-400 count-up">{b.w}W</p><p className="text-[7px] text-gray-600 uppercase">Vic.</p></div><div className="bg-red-500/5 rounded-lg p-2.5 border border-red-500/8 text-center"><p className="text-xl font-black text-red-400 count-up">{b.l}L</p><p className="text-[7px] text-gray-600 uppercase">Déf.</p></div></div>
              <GlassCard gold className="text-center !p-3"><p className="text-3xl font-black bg-gradient-to-b from-[#D4AF37] to-[#B8960F] bg-clip-text text-transparent count-up">{b.wr}%</p><p className="text-[7px] text-gray-600 uppercase mt-0.5">Win Rate</p></GlassCard>
              <div className="grid grid-cols-3 gap-2"><div className="bg-purple-500/5 rounded-lg p-2.5 border border-purple-500/8 text-center"><p className="text-lg font-bold text-purple-400">{b.am}</p><p className="text-[7px] text-gray-600">🧠</p></div><div className="bg-blue-500/5 rounded-lg p-2.5 border border-blue-500/8 text-center"><p className="text-lg font-bold text-blue-400">{b.ac}</p><p className="text-[7px] text-gray-600">💬</p></div><div className="bg-green-500/5 rounded-lg p-2.5 border border-green-500/8 text-center"><p className="text-lg font-bold text-green-400">{b.ap}</p><p className="text-[7px] text-gray-600">🎯</p></div></div>
            </div>
            <button onClick={() => setShowBilan(false)} className="w-full py-2 rounded-xl font-bold glass text-gray-400 text-sm">Fermer</button>
          </div></div> })()}
        </div>}

        {/* ====== ADMIN ====== */}
        {activeTab === 'admin' && <div className="tab-content">
          <SectionHeader title="Administration" icon="⚙️" />
          {!isAdmin ? <GlassCard><InputField type="password" placeholder="Mot de passe admin" value={adminPassword} onChange={(e: any) => setAdminPassword(e.target.value)} className="mb-3" /><button onClick={handleAdminLogin} className="w-full py-2.5 rounded-xl btn-gold text-sm">🔐 Connexion</button></GlassCard> : <div className="space-y-4">
            <GlassCard gold><h3 className="text-[10px] font-bold text-[#D4AF37]/60 mb-3 uppercase tracking-widest">➕ Nouveau match</h3><InputField type="text" placeholder="Adversaire" value={nouveauMatch.adversaire} onChange={(e: any) => setNouveauMatch({ ...nouveauMatch, adversaire: e.target.value })} className="mb-2" /><InputField type="date" value={nouveauMatch.date} onChange={(e: any) => setNouveauMatch({ ...nouveauMatch, date: e.target.value })} className="mb-2" /><div className="grid grid-cols-2 gap-2 mb-2"><InputField type="time" value={nouveauMatch.horaire1} onChange={(e: any) => setNouveauMatch({ ...nouveauMatch, horaire1: e.target.value })} /><InputField type="time" value={nouveauMatch.horaire2} onChange={(e: any) => setNouveauMatch({ ...nouveauMatch, horaire2: e.target.value })} /></div><div className="grid grid-cols-2 gap-2 mb-2"><select value={nouveauMatch.arene} onChange={(e: any) => setNouveauMatch({ ...nouveauMatch, arene: e.target.value })} className="bg-white/4 border border-white/8 rounded-xl px-3 py-2.5 text-white text-sm"><option value="Arène 1">Arène 1</option><option value="Arène 2">Arène 2</option></select><select value={nouveauMatch.type} onChange={(e: any) => setNouveauMatch({ ...nouveauMatch, type: e.target.value })} className="bg-white/4 border border-white/8 rounded-xl px-3 py-2.5 text-white text-sm"><option value="Ligue">Ligue</option><option value="Scrim">Scrim</option><option value="Tournoi">Tournoi</option><option value="Division">Division</option></select></div>
              {nouveauMatch.type === 'Division' && <div className="glass rounded-lg p-3 mb-2"><div className="flex items-center justify-between mb-2"><p className="text-[9px] text-[#D4AF37]/60 font-bold uppercase">🏆 Sous-matchs</p><button onClick={ajouterSousMatch} className="px-2 py-0.5 rounded-md bg-[#D4AF37]/10 text-[#D4AF37] text-[10px]">➕</button></div>{nouveauMatch.sousMatchs.length > 0 ? <div className="space-y-1">{nouveauMatch.sousMatchs.map((sm: any, i: number) => <div key={i} className="flex items-center justify-between glass rounded-md px-2 py-1.5"><div><p className="text-[8px] text-gray-500">{sm.adversaire}</p><p className="text-[9px] font-bold"><span className="text-[#D4AF37]">{sm.scoreDyno}</span>-<span className="text-gray-500">{sm.scoreAdv}</span></p></div><button onClick={() => supprimerSousMatch(i)} className="text-red-400/30 text-[9px]">🗑️</button></div>)}</div> : <p className="text-[8px] text-gray-600 text-center py-2">Aucun</p>}</div>}
              <button onClick={ajouterMatch} className="w-full py-2.5 rounded-xl btn-gold text-sm">Ajouter + Discord</button>
            </GlassCard>
            <GlassCard><h3 className="text-[10px] font-bold text-[#D4AF37]/60 mb-3 uppercase tracking-widest">🗑️ Gérer les matchs</h3>{matchs.length === 0 ? <p className="text-gray-700 text-center text-xs py-3">Aucun</p> : <div className="space-y-1.5">{matchs.map((m: any) => <div key={m.id} className="flex items-center justify-between glass rounded-lg p-2"><div><p className="text-[#D4AF37] font-semibold text-[10px]">{m.adversaire}</p><p className="text-gray-700 text-[8px]">{fdf(m.date)} • {m.termine ? '✅' : '⏳'}</p></div><div className="flex items-center gap-1">{m.termine && <button onClick={() => setEditHistoriqueScore({ id: m.id, adversaire: m.adversaire || '', scoreDyno: String(m.scoreDyno || 0), scoreAdv: String(m.scoreAdversaire || 0), type: m.type || 'Ligue', arene: m.arene || 'Arène 1', date: m.date || '', termine: true, sousMatchs: m.sousMatchs || [] })} className="text-[#D4AF37]/40 hover:text-[#D4AF37] text-sm transition-colors">✏️</button>}<button onClick={() => del('matchs', m.id)} className="text-red-400/30 hover:text-red-400 transition-colors">🗑️</button></div></div>)}</div>}</GlassCard>
            <GlassCard><h3 className="text-[10px] font-bold text-[#D4AF37]/60 mb-3 uppercase tracking-widest">🎬 Replay</h3><InputField type="text" placeholder="Titre" value={nouveauReplay.titre} onChange={(e: any) => setNouveauReplay({ ...nouveauReplay, titre: e.target.value })} className="mb-2" /><InputField type="text" placeholder="Lien YouTube" value={nouveauReplay.lien} onChange={(e: any) => setNouveauReplay({ ...nouveauReplay, lien: e.target.value })} className="mb-2" /><button onClick={ajouterReplay} className="w-full py-2.5 rounded-xl btn-gold text-sm">Ajouter</button></GlassCard>
            <GlassCard><h3 className="text-[10px] font-bold text-[#D4AF37]/60 mb-3 uppercase tracking-widest">✏️ Scores matchs à venir</h3>{prochainsMatchs.map((m: any) => <div key={m.id} className="glass rounded-lg p-2.5 mb-2"><p className="font-semibold text-[#D4AF37] mb-1.5 text-xs">vs {m.adversaire}</p><button onClick={() => setScoreEdit({ id: m.id, scoreDyno: '', scoreAdv: '' })} className="w-full py-1.5 rounded-lg btn-gold text-[10px]">📝 Score</button></div>)}</GlassCard>
            <button onClick={handleAdminLogout} className="w-full glass text-red-400 py-2.5 rounded-xl font-bold text-sm hover:bg-red-500/10 transition-all">🚪 Déconnexion admin</button>
          </div>}
          {scoreEdit && <div className="fixed inset-0 bg-black/85 backdrop-blur-xl flex items-center justify-center z-50 p-4 modal-overlay"><div className="bg-gradient-to-br from-[#121212] to-[#080808] rounded-2xl p-5 w-full max-w-sm border border-white/8 modal-enter">
            <h3 className="text-base font-extrabold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-4 text-center">📝 Score</h3>
            <div className="grid grid-cols-2 gap-3 mb-4"><div><label className="text-gray-600 text-[9px] mb-1 block uppercase">DYNO</label><InputField type="number" placeholder="0" value={scoreEdit.scoreDyno} onChange={(e: any) => setScoreEdit({ ...scoreEdit, scoreDyno: e.target.value })} className="!text-center !text-xl !font-bold" /></div><div><label className="text-gray-600 text-[9px] mb-1 block uppercase">Adversaire</label><InputField type="number" placeholder="0" value={scoreEdit.scoreAdv} onChange={(e: any) => setScoreEdit({ ...scoreEdit, scoreAdv: e.target.value })} className="!text-center !text-xl !font-bold" /></div></div>
            <div className="flex gap-2"><button onClick={() => setScoreEdit(null)} className="flex-1 py-2 rounded-xl font-bold glass text-gray-500 text-sm">Annuler</button><button onClick={updateScore} className="flex-1 py-2 rounded-xl btn-gold text-sm">✅</button></div>
          </div></div>}
        </div>}
      </main>

      {/* ====== LOGIN ====== */}
      {!user && <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4"><P /><div className="bg-gradient-to-br from-[#111] to-[#060606] rounded-2xl p-6 w-full max-w-sm border border-white/8 shadow-[0_20px_80px_rgba(0,0,0,0.8)] relative z-10 modal-enter">
        <img src={LG} alt="D" className="w-14 h-14 mx-auto mb-3 drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]" />
        <h3 className="text-base font-extrabold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-4 text-center">{isSignUp ? '📝 Créer un compte' : '🔐 Connexion'}</h3>
        {isSignUp && <InputField type="text" placeholder="Pseudo" value={pseudo} onChange={(e: any) => setPseudo(e.target.value)} className="mb-2.5" />}
        <InputField type="email" placeholder="Email" value={email} onChange={(e: any) => setEmail(e.target.value)} className="mb-2.5" />
        <InputField type="password" placeholder="Mot de passe" value={authPassword} onChange={(e: any) => setAuthPassword(e.target.value)} className="mb-4" />
        {isSignUp ? <button onClick={handleSignUp} className="w-full py-2.5 rounded-xl btn-gold mb-3 text-sm">✅ Créer</button> : <button onClick={handleSignIn} className="w-full py-2.5 rounded-xl btn-gold mb-3 text-sm">🔐 Connexion</button>}
        <div className="border-t border-white/5 pt-3 text-center">{isSignUp ? <button onClick={() => setIsSignUp(false)} className="text-[#D4AF37] text-xs hover:underline">Déjà un compte ?</button> : <button onClick={() => setIsSignUp(true)} className="text-[#D4AF37] text-xs hover:underline">Pas de compte ?</button>}</div>
      </div></div>}
    </div>
  )
}

export default App