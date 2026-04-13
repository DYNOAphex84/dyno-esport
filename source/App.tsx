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
  'Engine', 'Helios', 'Silva', 'The Cliff',
  'Artefact', 'Outlaw', 'Atlantis', 'Horizon',
  'Polaris', 'Lunar', 'Ceres'
]

/* ══════ VISUAL COMPONENTS ══════ */
const Particles = () => (
  <div className="particles-bg">
    {Array.from({ length: 20 }).map((_, i) => (
      <div key={i} className="floating-particle" style={{
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        animationDelay: (Math.random() * 8) + 's',
        animationDuration: (6 + Math.random() * 6) + 's',
        width: (2 + Math.random() * 4) + 'px',
        height: (2 + Math.random() * 4) + 'px',
      }} />
    ))}
  </div>
)

const GlassCard = ({ children, className = '', glow = false, delay = 0 }: {
  children: React.ReactNode; className?: string; glow?: boolean; delay?: number
}) => (
  <div
    className={
      "glass-card " +
      (glow ? "glass-card-glow " : "") +
      className
    }
    style={delay ? { animationDelay: delay + 's' } : undefined}
  >
    {children}
  </div>
)

const GoldButton = ({ children, className = '', ...props }: any) => (
  <button
    {...props}
    className={"gold-btn " + className}
  >
    {children}
  </button>
)

const SectionTitle = ({ title, icon }: {
  title: string; icon?: string
}) => (
  <div className="section-header">
    <div className="section-header-bg" />
    <img
      src={LG} alt="D"
      className="section-logo"
    />
    <div className="section-divider" />
    <h2 className="section-title">
      {icon && <span>{icon} </span>}{title}
    </h2>
  </div>
)

const Badge = ({ children, variant = 'gold' }: {
  children: React.ReactNode
  variant?: 'gold' | 'red' | 'blue' | 'green' | 'purple' | 'orange'
}) => {
  const cls: Record<string, string> = {
    gold: 'badge-gold', red: 'badge-red',
    blue: 'badge-blue', green: 'badge-green',
    purple: 'badge-purple', orange: 'badge-orange',
  }
  return <span className={"badge " + (cls[variant] || cls.gold)}>{children}</span>
}

const EmptyState = ({ icon, text }: {
  icon: string; text: string
}) => (
  <div className="empty-state">
    <span className="empty-icon">{icon}</span>
    <p>{text}</p>
  </div>
)

const Input = ({ className = '', ...props }: any) => (
  <input {...props} className={"form-input " + className} />
)

const Select = ({ className = '', ...props }: any) => (
  <select {...props} className={"form-input " + className} />
)

const Textarea = ({ className = '', ...props }: any) => (
  <textarea {...props} className={"form-input form-textarea " + className} />
)

const Modal = ({ children, onClose }: {
  children: React.ReactNode; onClose: () => void
}) => (
  <div className="modal-overlay" onClick={onClose}>
    <div
      className="modal-content"
      onClick={e => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
)

const ModalTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="modal-title">{children}</h3>
)

const StatCard = ({ value, label, color = 'gold' }: {
  value: string | number; label: string; color?: string
}) => (
  <GlassCard glow className="text-center">
    <p className={"stat-value stat-" + color}>{value}</p>
    <p className="stat-label">{label}</p>
  </GlassCard>
)

/* ══════ APP ══════ */
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
    sousMatchs: [] as { adversaire: string; scoreDyno: string; scoreAdv: string }[]
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

  // ══════ HOOKS ══════
  useEffect(() => { if (window.location.search.includes('reset=1')) { localStorage.clear(); window.location.href = window.location.pathname } }, [])

  const sendNotification = useCallback((t: string, b: string, tg?: string) => {
    try { if (!('Notification' in window) || Notification.permission !== 'granted') return; const n = new Notification(t, { body: b, icon: LG, badge: LG, tag: tg || 'd', requireInteraction: false }); n.onclick = () => { window.focus(); n.close() } } catch {}
  }, [])

  const requestNotificationPermission = async () => {
    try { if (!('Notification' in window)) { alert('❌'); return }; const p = await Notification.requestPermission(); if (p === 'granted') { setNotificationsEnabled(true); localStorage.setItem('dyno-notifs', 'true'); alert('✅ Notifications activées !') } else { setNotificationsEnabled(false); localStorage.setItem('dyno-notifs', 'false'); alert('❌') } } catch { alert('❌') }
  }

  const getMatchDateTime = useCallback((m: any): Date | null => {
    if (!m?.date) return null; let d = m.date; const t = m.horaires?.[0] || m.horaire1 || '20:00'; if (d.includes('/')) { const [dd, mm, yy] = d.split('/'); d = yy + '-' + mm + '-' + dd }; try { const dt = new Date(d + 'T' + t + ':00'); return isNaN(dt.getTime()) ? null : dt } catch { return null }
  }, [])

  useEffect(() => { try { if ('Notification' in window && Notification.permission === 'granted' && localStorage.getItem('dyno-notifs') === 'true') setNotificationsEnabled(true) } catch {}; try { setNotifiedMatchs(JSON.parse(localStorage.getItem('dyno-notified') || '[]')) } catch { setNotifiedMatchs([]) } }, [])

  useEffect(() => {
    if (!notificationsEnabled) return; try { if (!('Notification' in window) || Notification.permission !== 'granted') return } catch { return }
    const ck = () => { const now = new Date(); matchs.forEach((m: any) => { if (m.termine) return; const mt = getMatchDateTime(m); if (!mt) return; const dm = (mt.getTime() - now.getTime()) / 60000
      const k1 = m.id + '-1h'; if (dm > 55 && dm <= 65 && !notifiedMatchs.includes(k1)) { sendNotification('🎮 Match dans 1h !', 'DYNO vs ' + m.adversaire, 'm1h'); const u = [...notifiedMatchs, k1]; setNotifiedMatchs(u); localStorage.setItem('dyno-notified', JSON.stringify(u)) }
      const k2 = m.id + '-15m'; if (dm > 10 && dm <= 20 && !notifiedMatchs.includes(k2)) { sendNotification('🔥 15 minutes !', 'DYNO vs ' + m.adversaire, 'm15'); const u = [...notifiedMatchs, k2]; setNotifiedMatchs(u); localStorage.setItem('dyno-notified', JSON.stringify(u)) }
      const k3 = m.id + '-now'; if (dm >= -2 && dm <= 3 && !notifiedMatchs.includes(k3)) { sendNotification('⚡ C\'est parti !', 'DYNO vs ' + m.adversaire, 'mnow'); const u = [...notifiedMatchs, k3]; setNotifiedMatchs(u); localStorage.setItem('dyno-notified', JSON.stringify(u)) }
    }) }; ck(); const i = setInterval(ck, 60000); return () => clearInterval(i)
  }, [notificationsEnabled, matchs, notifiedMatchs, sendNotification, getMatchDateTime])

  useEffect(() => { const u = () => { const now = new Date(); const c: Record<string, string> = {}; matchs.forEach((m: any) => { if (m.termine) return; const mt = getMatchDateTime(m); if (!mt) return; const df = mt.getTime() - now.getTime(); if (df <= 0) { c[m.id] = 'LIVE'; return }; const j = Math.floor(df / 86400000); const h = Math.floor((df % 86400000) / 3600000); const mi = Math.floor((df % 3600000) / 60000); const s = Math.floor((df % 60000) / 1000); c[m.id] = (j > 0 ? j + 'j ' : '') + ((h > 0 || j > 0) ? h + 'h ' : '') + mi + 'm ' + s + 's' }); setCountdowns(c) }; u(); const i = setInterval(u, 1000); return () => clearInterval(i) }, [matchs, getMatchDateTime])

  useEffect(() => { if (localStorage.getItem('dyno-admin') === 'true') setIsAdmin(true) }, [])

  useEffect(() => { const unsub = onAuthStateChanged(auth, async (u: any) => { setUser(u); if (u) { const d = await getDoc(doc(db, 'users', u.uid)); if (d.exists()) { const data = d.data(); setPseudo(data.pseudo || ''); if (data.anniversaire) setAnniversaire(data.anniversaire); if (u.email === AE || data.isAdmin) { setIsAdmin(true); localStorage.setItem('dyno-admin', 'true') } } }; setLoading(false) }); return () => unsub() }, [])

  // Firestore
  const colDefs = [
    { n: 'matchs', s: setMatchs }, { n: 'notes', s: setNotes },
    { n: 'commentaires', s: setCommentaires }, { n: 'strats', s: setStrats },
    { n: 'replays', s: setReplays }, { n: 'players', s: setJoueurs },
    { n: 'compos', s: setCompos }, { n: 'objectifs', s: setObjectifs },
    { n: 'analyses', s: setAnalyses }, { n: 'fichesAdversaires', s: setFichesAdversaires },
  ]
  colDefs.forEach(({ n, s }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => { const q = query(collection(db, n), orderBy('createdAt', 'desc')); const u = onSnapshot(q, (snap: any) => { const d: any[] = []; snap.forEach((x: any) => d.push({ id: x.id, ...x.data() })); s(d) }); return () => u() }, [])
  })

  useEffect(() => { if (!notificationsEnabled || pm.current === 0) { pm.current = matchs.length; return }; if (matchs.length > pm.current) { const n = matchs[0]; if (n) sendNotification('📅 Nouveau match !', 'DYNO vs ' + n.adversaire, 'nm') }; pm.current = matchs.length }, [matchs, notificationsEnabled, sendNotification])
  useEffect(() => { if (!notificationsEnabled || pn.current === 0) { pn.current = notes.length; return }; if (notes.length > pn.current) { const n = notes[0]; if (n) sendNotification('📊 Nouvelle note', n.joueur, 'nn') }; pn.current = notes.length }, [notes, notificationsEnabled, sendNotification])
  useEffect(() => { if (!notificationsEnabled || pc.current === 0) { pc.current = commentaires.length; return }; if (commentaires.length > pc.current) { const n = commentaires[0]; if (n) sendNotification('💬', n.joueur + ': ' + n.texte.substring(0, 50), 'nc') }; pc.current = commentaires.length }, [commentaires, notificationsEnabled, sendNotification])
  useEffect(() => { if (!notificationsEnabled || ps.current === 0) { ps.current = strats.length; return }; if (strats.length > ps.current) { const n = strats[0]; if (n) sendNotification('🎯 Nouvelle strat', 'vs ' + n.adversaire, 'ns') }; ps.current = strats.length }, [strats, notificationsEnabled, sendNotification])

  useEffect(() => { const t = setTimeout(() => setShowSplash(false), 3000); return () => clearTimeout(t) }, [])
  useEffect(() => { window.addEventListener('beforeinstallprompt', (e: any) => { e.preventDefault(); setDeferredPrompt(e); setShowInstall(true) }) }, [])

  // ══════ FUNCTIONS ══════
  const handleInstall = () => { if (deferredPrompt) { deferredPrompt.prompt(); setDeferredPrompt(null); setShowInstall(false) } }
  const handleSignUp = async () => { if (!email || !authPassword || !pseudo) { alert('⚠️ Remplis tous les champs'); return }; try { const r = await createUserWithEmailAndPassword(auth, email, authPassword); await setDoc(doc(db, 'users', r.user.uid), { pseudo, email, createdAt: Date.now(), isAdmin: email === AE }); await addDoc(collection(db, 'players'), { pseudo, role: 'Joueur', rang: 'Nouveau', userId: r.user.uid, createdAt: Date.now() }); alert('✅ Compte créé !'); setIsSignUp(false); setEmail(''); setAuthPassword('') } catch (e: any) { alert('❌ ' + e.message) } }
  const handleSignIn = async () => { if (!email || !authPassword) { alert('⚠️'); return }; try { await setPersistence(auth, browserLocalPersistence); await signInWithEmailAndPassword(auth, email, authPassword); localStorage.setItem('user-email', email); alert('✅ Connecté !'); setEmail(''); setAuthPassword('') } catch (e: any) { alert('❌ ' + e.message) } }
  const handleSignOut = async () => { await signOut(auth); setPseudo(''); setIsAdmin(false); localStorage.removeItem('dyno-admin'); localStorage.removeItem('user-email'); alert('✅ Déconnecté') }
  const handleAdminLogin = () => { if (adminPassword === 'dyno2026') { setIsAdmin(true); localStorage.setItem('dyno-admin', 'true'); setAdminPassword('') } else alert('❌ Mot de passe incorrect') }
  const handleAdminLogout = () => { setIsAdmin(false); localStorage.removeItem('dyno-admin') }

  const ajouterSousMatch = () => { const adv = prompt('Adversaire :'); if (!adv) return; const sd = prompt('Score DYNO :'); if (!sd) return; const sa = prompt('Score ' + adv + ' :'); if (!sa) return; setNouveauMatch({ ...nouveauMatch, sousMatchs: [...nouveauMatch.sousMatchs, { adversaire: adv, scoreDyno: sd, scoreAdv: sa }] }) }
  const supprimerSousMatch = (i: number) => { const sm = [...nouveauMatch.sousMatchs]; sm.splice(i, 1); setNouveauMatch({ ...nouveauMatch, sousMatchs: sm }) }
  const ajouterEditSousMatch = () => { if (!editHistoriqueScore) return; const adv = prompt('Adversaire :'); if (!adv) return; const sd = prompt('Score DYNO :'); if (!sd) return; const sa = prompt('Score ' + adv + ' :'); if (!sa) return; setEditHistoriqueScore({ ...editHistoriqueScore, sousMatchs: [...(editHistoriqueScore.sousMatchs || []), { adversaire: adv, scoreDyno: sd, scoreAdv: sa }] }) }
  const supprimerEditSousMatch = (i: number) => { if (!editHistoriqueScore) return; const sm = [...(editHistoriqueScore.sousMatchs || [])]; sm.splice(i, 1); setEditHistoriqueScore({ ...editHistoriqueScore, sousMatchs: sm }) }

  const ajouterMatch = async () => {
    if (!nouveauMatch.adversaire || !nouveauMatch.date || !nouveauMatch.horaire1) { alert('⚠️ Remplis les champs obligatoires'); return }
    const md: any = { ...nouveauMatch, termine: false, disponibles: [], indisponibles: [], createdAt: Date.now() }
    if (nouveauMatch.type === 'Division' && nouveauMatch.sousMatchs.length > 0) { md.termine = true; md.sousMatchs = nouveauMatch.sousMatchs; md.scoreDyno = nouveauMatch.sousMatchs.reduce((a: number, s: any) => a + parseInt(s.scoreDyno || '0'), 0); md.scoreAdversaire = nouveauMatch.sousMatchs.reduce((a: number, s: any) => a + parseInt(s.scoreAdv || '0'), 0) }
    await addDoc(collection(db, 'matchs'), md)
    const h = [nouveauMatch.horaire1]; if (nouveauMatch.horaire2) h.push(nouveauMatch.horaire2)
    try { await fetch(DW, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ embeds: [{ title: '🎮 DYNO vs ' + nouveauMatch.adversaire, color: 13934871, fields: [{ name: '⚔️', value: nouveauMatch.adversaire, inline: true }, { name: '📅', value: nouveauMatch.date, inline: true }, { name: '⏰', value: h.join(' / '), inline: true }, { name: '🏟️', value: nouveauMatch.arene, inline: true }, { name: '📊', value: nouveauMatch.type, inline: true }], footer: { text: 'DYNO Esport', icon_url: LG } }] }) }) } catch {}
    setNouveauMatch({ adversaire: '', date: '', horaire1: '', horaire2: '', arene: 'Arène 1', type: 'Ligue', sousMatchs: [] }); alert('✅ Match ajouté !')
  }
  const ajouterReplay = async () => { if (!nouveauReplay.titre || !nouveauReplay.lien) { alert('⚠️'); return }; await addDoc(collection(db, 'replays'), { ...nouveauReplay, createdAt: Date.now() }); setNouveauReplay({ titre: '', lien: '' }); alert('✅') }
  const ajouterNote = async () => { if (!user) return; await addDoc(collection(db, 'notes'), { matchId: selectedMatchForNotes?.id, joueur: pseudo, joueurId: user.uid, mental: nouvelleNote.mental, communication: nouvelleNote.communication, gameplay: nouvelleNote.gameplay, createdAt: Date.now() }); setNouvelleNote({ matchId: '', mental: '', communication: '', gameplay: '' }); setSelectedMatchForNotes(null); alert('✅') }
  const ajouterCommentaire = async (id: string) => { if (!user || !nouveauCommentaire.trim()) return; await addDoc(collection(db, 'commentaires'), { matchId: id, joueur: pseudo, joueurId: user.uid, texte: nouveauCommentaire.trim(), createdAt: Date.now() }); setNouveauCommentaire(''); setSelectedMatchForComment(null); alert('✅') }
  const ajouterStrat = async () => { if (!nouvelleStrat.adversaire || nouvelleStrat.picks.length === 0 || nouvelleStrat.bans.length === 0) { alert('⚠️'); return }; await addDoc(collection(db, 'strats'), { adversaire: nouvelleStrat.adversaire, picks: nouvelleStrat.picks, bans: nouvelleStrat.bans, auteur: pseudo || 'Anonyme', auteurId: user?.uid || null, createdAt: Date.now() }); setNouvelleStrat({ adversaire: '', picks: [], bans: [] }); setShowAddStrat(false); alert('✅') }
  const ajouterCompo = async () => { if (!selectedMapCompo || compoJoueurs.length === 0) { alert('⚠️'); return }; const ex = compos.find((c: any) => c.map === selectedMapCompo); if (ex) { await updateDoc(doc(db, 'compos', ex.id), { joueurs: compoJoueurs, updatedAt: Date.now() }) } else { await addDoc(collection(db, 'compos'), { map: selectedMapCompo, joueurs: compoJoueurs, auteur: pseudo, createdAt: Date.now() }) }; setShowAddCompo(false); setSelectedMapCompo(''); setCompoJoueurs([]); alert('✅') }
  const toggleCompoJoueur = (n: string) => { if (compoJoueurs.includes(n)) setCompoJoueurs(compoJoueurs.filter(j => j !== n)); else setCompoJoueurs([...compoJoueurs, n]) }
  const sauvegarderAnniversaire = async () => { if (!user || !anniversaire) return; await updateDoc(doc(db, 'users', user.uid), { anniversaire }); alert('✅') }
  const ajouterObjectif = async () => { if (!user || !nouvelObjectif.trim()) return; await addDoc(collection(db, 'objectifs'), { texte: nouvelObjectif.trim(), termine: false, joueur: pseudo, joueurId: user.uid, createdAt: Date.now() }); setNouvelObjectif('') }
  const toggleObjectif = async (id: string, c: boolean) => { await updateDoc(doc(db, 'objectifs', id), { termine: !c }) }
  const ajouterAnalyse = async (mid: string) => { if (!user) return; await addDoc(collection(db, 'analyses'), { matchId: mid, joueur: pseudo, joueurId: user.uid, ...nouvelleAnalyse, createdAt: Date.now() }); setNouvelleAnalyse({ bien: '', mal: '', plan: '' }); setSelectedMatchForAnalyse(null); alert('✅') }
  const ajouterFiche = async () => { if (!nouvelleFiche.adversaire.trim()) return; await addDoc(collection(db, 'fichesAdversaires'), { ...nouvelleFiche, auteur: pseudo, auteurId: user?.uid, createdAt: Date.now() }); setNouvelleFiche({ adversaire: '', forces: '', faiblesses: '', notes: '' }); setShowAddFiche(false); alert('✅') }
  const del = async (col: string, id: string) => { await deleteDoc(doc(db, col, id)) }
  const updateScore = async () => { if (!scoreEdit) return; await updateDoc(doc(db, 'matchs', scoreEdit.id), { scoreDyno: parseInt(scoreEdit.scoreDyno), scoreAdversaire: parseInt(scoreEdit.scoreAdv), termine: true }); setScoreEdit(null); alert('✅') }
  const updateHistoriqueScore = async () => { if (!editHistoriqueScore) return; const ud: any = { adversaire: editHistoriqueScore.adversaire, type: editHistoriqueScore.type, arene: editHistoriqueScore.arene, date: editHistoriqueScore.date, termine: editHistoriqueScore.termine !== false }; if (editHistoriqueScore.type === 'Division' && editHistoriqueScore.sousMatchs?.length > 0) { ud.sousMatchs = editHistoriqueScore.sousMatchs; ud.scoreDyno = editHistoriqueScore.sousMatchs.reduce((a: number, s: any) => a + parseInt(s.scoreDyno || '0'), 0); ud.scoreAdversaire = editHistoriqueScore.sousMatchs.reduce((a: number, s: any) => a + parseInt(s.scoreAdv || '0'), 0) } else { ud.scoreDyno = parseInt(editHistoriqueScore.scoreDyno); ud.scoreAdversaire = parseInt(editHistoriqueScore.scoreAdv); if (editHistoriqueScore.type !== 'Division') ud.sousMatchs = [] }; await updateDoc(doc(db, 'matchs', editHistoriqueScore.id), ud); setEditHistoriqueScore(null); alert('✅ Modifié !') }
  const toggleDispo = async (mid: string) => { if (!user) return; const m = matchs.find((x: any) => x.id === mid); if (!m) return; const d = m.disponibles || []; const i = m.indisponibles || []; await updateDoc(doc(db, 'matchs', mid), { disponibles: d.includes(pseudo) ? d.filter((p: string) => p !== pseudo) : [...d, pseudo], indisponibles: i.filter((p: string) => p !== pseudo) }) }
  const toggleIndispo = async (mid: string) => { if (!user) return; const m = matchs.find((x: any) => x.id === mid); if (!m) return; const d = m.disponibles || []; const i = m.indisponibles || []; await updateDoc(doc(db, 'matchs', mid), { indisponibles: i.includes(pseudo) ? i.filter((p: string) => p !== pseudo) : [...i, pseudo], disponibles: d.filter((p: string) => p !== pseudo) }) }

  const fdf = (s: string) => { if (!s) return ''; if (s.includes('/')) return s; const [y, m, d] = s.split('-'); return d + '/' + m + '/' + y }
  const fts = (t: number) => { const d = new Date(t); return d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }
  const atc = (m: any) => { try { if (!m?.date) return; let y: string, mo: string, d: string; if (m.date.includes('/')) { const p = m.date.split('/'); d = p[0]; mo = p[1]; y = p[2] } else { const p = m.date.split('-'); y = p[0]; mo = p[1]; d = p[2] }; const md = y + mo + d; let h = '20', mi = '00'; if (m.horaires?.length > 0) { const p = m.horaires[0].split(':'); h = p[0]; mi = p[1] || '00' } else if (m.horaire1) { const p = m.horaire1.split(':'); h = p[0]; mi = p[1] || '00' }; const st = h + mi + '00'; const et = (parseInt(h) + 2).toString().padStart(2, '0') + mi + '00'; if (/iPad|iPhone|iPod/.test(navigator.userAgent)) { const ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:' + m.id + '@dyno\nDTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z\nDTSTART:' + md + 'T' + st + '\nDTEND:' + md + 'T' + et + '\nSUMMARY:DYNO vs ' + m.adversaire + '\nLOCATION:' + m.arene + '\nEND:VEVENT\nEND:VCALENDAR'; const b = new Blob([ics], { type: 'text/calendar' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'DYNO_' + m.adversaire + '.ics'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(u) } else { window.open('https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent('DYNO vs ' + m.adversaire) + '&dates=' + md + 'T' + st + '/' + md + 'T' + et + '&location=' + encodeURIComponent(m.arene), '_blank') } } catch (e: any) { alert('❌ ' + e.message) } }
  const hts = (e: React.TouchEvent) => { ty.current = e.touches[0].clientY }
  const htm = (e: React.TouchEvent) => { if (window.scrollY > 0) return; const d = e.touches[0].clientY - ty.current; if (d > 0) setPullDistance(Math.min(d * 0.4, 80)) }
  const hte = () => { if (pullDistance > 60) { setIsRefreshing(true); setTimeout(() => window.location.reload(), 500) }; setPullDistance(0) }
  const toggleMap = (map: string, type: 'picks' | 'bans') => { if (type === 'picks') { if (nouvelleStrat.picks.includes(map)) setNouvelleStrat({ ...nouvelleStrat, picks: nouvelleStrat.picks.filter(m => m !== map) }); else if (nouvelleStrat.picks.length < 4) setNouvelleStrat({ ...nouvelleStrat, picks: [...nouvelleStrat.picks, map] }) } else { if (nouvelleStrat.bans.includes(map)) setNouvelleStrat({ ...nouvelleStrat, bans: nouvelleStrat.bans.filter(m => m !== map) }); else if (nouvelleStrat.bans.length < 4) setNouvelleStrat({ ...nouvelleStrat, bans: [...nouvelleStrat.bans, map] }) } }
  const genBilan = () => { const now = new Date(); const mm = historique.filter((m: any) => { const d = new Date(m.createdAt); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() }); const w = mm.filter((m: any) => (m.scoreDyno || 0) > (m.scoreAdversaire || 0)).length; const l = mm.filter((m: any) => (m.scoreDyno || 0) < (m.scoreAdversaire || 0)).length; const mn = notes.filter((n: any) => { const d = new Date(n.createdAt); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() }); const am = mn.length > 0 ? Math.round(mn.reduce((a: number, n: any) => a + parseInt(n.mental || 0), 0) / mn.length) : 0; const ac = mn.length > 0 ? Math.round(mn.reduce((a: number, n: any) => a + parseInt(n.communication || 0), 0) / mn.length) : 0; const ap = mn.length > 0 ? Math.round(mn.reduce((a: number, n: any) => a + parseInt(n.gameplay || 0), 0) / mn.length) : 0; return { nom: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][now.getMonth()], m: mm.length, w, l, wr: mm.length > 0 ? Math.round((w / (w + l || 1)) * 100) : 0, am, ac, ap } }

  // ══════ COMPUTED ══════
  const victoires = matchs.filter((m: any) => m.termine && (m.scoreDyno || 0) > (m.scoreAdversaire || 0)).length
  const defaites = matchs.filter((m: any) => m.termine && (m.scoreDyno || 0) < (m.scoreAdversaire || 0)).length
  const totalMatchs = victoires + defaites
  const winRate = totalMatchs > 0 ? Math.round((victoires / totalMatchs) * 100) : 0
  const prochainsMatchs = matchs.filter((m: any) => !m.termine).sort((a: any, b: any) => new Date(a.date + 'T' + (a.horaires?.[0] || a.horaire1 || '20:00')).getTime() - new Date(b.date + 'T' + (b.horaires?.[0] || b.horaire1 || '20:00')).getTime())
  const historique = matchs.filter((m: any) => m.termine)
  const ytId = (url: string) => { const m = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/); return m ? m[1] : null }
  const typeColor = (t: string): any => t === 'Ligue' ? 'blue' : t === 'Scrim' ? 'green' : t === 'Tournoi' ? 'purple' : t === 'Division' ? 'orange' : 'gold'

  const menuItems = [
    { t: 'matchs', i: '📅', l: 'Matchs' }, { t: 'historique', i: '🏆', l: 'Résultats' },
    { t: 'strats', i: '🎯', l: 'Stratégies' }, { t: 'compos', i: '📋', l: 'Compos' },
    { t: 'fiches', i: '🔍', l: 'Fiches' }, { t: 'notes', i: '📊', l: 'Notes' },
    { t: 'objectifs', i: '🎯', l: 'Objectifs' }, { t: 'rec', i: '🎬', l: 'Replays' },
    { t: 'roster', i: '👥', l: 'Roster' }, { t: 'stats', i: '📈', l: 'Stats' },
    { t: 'admin', i: '⚙️', l: 'Admin' },
  ]

  // ══════ SPLASH ══════
  if (showSplash) return (
    <div className="splash-screen">
      <Particles />
      <div className="splash-content">
        <img src={LG} alt="DYNO" className="splash-logo" />
        <h1 className="splash-title">DYNO</h1>
        <p className="splash-subtitle">ESPORT TEAM</p>
        <div className="splash-bar"><div className="splash-bar-fill" /></div>
      </div>
    </div>
  )

  // ══════ RENDER ══════
  return (
    <div className="app-container">
      <Particles />

      {/* ─── HEADER ─── */}
      <header className="app-header">
        <div className="header-inner">
          <div className="header-left">
            <button onClick={() => setShowMenu(!showMenu)} className="menu-btn">
              <span className="menu-icon">☰</span>
            </button>
            <img src={LG} alt="D" className="header-logo" />
            <div>
              <h1 className="header-title">DYNO</h1>
              <p className="header-sub">ESPORT</p>
            </div>
          </div>
          <div className="header-right">
            {user && (
              <button onClick={requestNotificationPermission} className={"notif-btn " + (notificationsEnabled ? 'notif-active' : '')}>
                {notificationsEnabled ? '🔔' : '🔕'}
              </button>
            )}
            {showInstall && <button onClick={handleInstall} className="install-btn">📲</button>}
            {user ? (
              <button onClick={handleSignOut} className="user-btn user-btn-logout">
                <span className="user-avatar">{pseudo?.[0]?.toUpperCase()}</span>
                <span>{pseudo}</span>
              </button>
            ) : (
              <GoldButton onClick={() => setIsSignUp(false)} className="text-[10px] !py-1.5 !px-3">
                👤 Compte
              </GoldButton>
            )}
          </div>
        </div>
      </header>

      {/* ─── SIDEBAR ─── */}
      {showMenu && (
        <div className="sidebar-overlay" onClick={() => setShowMenu(false)}>
          <nav className="sidebar" onClick={e => e.stopPropagation()}>
            <div className="sidebar-header">
              <img src={LG} alt="D" className="sidebar-logo" />
              <div>
                <h2 className="sidebar-title">DYNO</h2>
                <p className="sidebar-sub">Esport Team</p>
              </div>
            </div>
            <div className="sidebar-nav">
              {menuItems.map(({ t, i, l }) => (
                <button
                  key={t}
                  onClick={() => { setActiveTab(t); setShowMenu(false) }}
                  className={"sidebar-item " + (activeTab === t ? 'sidebar-active' : '')}
                >
                  <span className="sidebar-icon">{i}</span>
                  <span className="sidebar-label">{l}</span>
                  {activeTab === t && <span className="sidebar-dot" />}
                </button>
              ))}
            </div>
          </nav>
        </div>
      )}

      {/* ─── MAIN ─── */}
      <main className="app-main" onTouchStart={hts} onTouchMove={htm} onTouchEnd={hte}>
        {pullDistance > 0 && (
          <div className="pull-indicator" style={{ height: pullDistance }}>
            <span className={pullDistance > 60 ? 'animate-spin' : ''}>
              {isRefreshing ? '⏳' : pullDistance > 60 ? '🔄' : '⬇️'}
            </span>
          </div>
        )}

        {/* ═══ MATCHS ═══ */}
        {activeTab === 'matchs' && (
          <div className="fade-in">
            <SectionTitle title="Prochains Matchs" icon="📅" />
            <div className="view-toggle">
              <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'active' : ''}>☰</button>
              <button onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'active' : ''}>⊞</button>
            </div>
            {loading ? <div className="space-y-4"><div className="skeleton" /><div className="skeleton" /></div>
            : prochainsMatchs.length === 0 ? <EmptyState icon="📭" text="Aucun match programmé" />
            : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-4'}>
                {prochainsMatchs.map((match: any, idx: number) => (
                  <GlassCard key={match.id} glow delay={idx * 0.1}>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant={typeColor(match.type)}>{match.type}</Badge>
                      <span className="text-gold-muted text-xs font-medium">{fdf(match.date)}</span>
                    </div>
                    {countdowns[match.id] && (
                      <div className={"countdown-box " + (countdowns[match.id] === 'LIVE' ? 'countdown-live' : '')}>
                        {countdowns[match.id] === 'LIVE' ? (
                          <div className="live-indicator"><div className="live-dot" /><span>EN COURS</span></div>
                        ) : (
                          <><p className="countdown-label">COUNTDOWN</p><p className="countdown-value">{countdowns[match.id]}</p></>
                        )}
                      </div>
                    )}
                    <div className="match-vs">
                      <div className="match-team"><img src={LG} alt="D" className="match-logo" /><span className="match-vs-text">VS</span></div>
                      <div className="match-opponent"><p className="match-name">{match.adversaire}</p><p className="match-arena">🏟️ {match.arene}</p></div>
                    </div>
                    <div className="match-time"><span className="match-time-label">⏰</span><span className="match-time-value">{match.horaires?.join(' / ') || match.horaire1 || '20:00'}</span></div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="dispo-box"><p className="dispo-label">✅ Dispo ({(match.disponibles || []).length})</p><div className="dispo-tags">{(match.disponibles || []).map((p: string, i: number) => <span key={i} className="dispo-tag">{p}</span>)}</div></div>
                      <div className="indispo-box"><p className="indispo-label">🚫 Indispo ({(match.indisponibles || []).length})</p><div className="dispo-tags">{(match.indisponibles || []).map((p: string, i: number) => <span key={i} className="indispo-tag">{p}</span>)}</div></div>
                    </div>
                    <button onClick={() => atc(match)} className="calendar-btn">📅 Ajouter au calendrier</button>
                    <div className="flex gap-2">
                      <button onClick={() => toggleDispo(match.id)} disabled={!user} className={"flex-1 dispo-action " + (!user ? 'disabled' : (match.disponibles || []).includes(pseudo) ? 'active-gold' : '')}>{!user ? '🔐' : (match.disponibles || []).includes(pseudo) ? '✅ Dispo' : 'Dispo'}</button>
                      <button onClick={() => toggleIndispo(match.id)} disabled={!user} className={"flex-1 indispo-action " + (!user ? 'disabled' : (match.indisponibles || []).includes(pseudo) ? 'active-red' : '')}>{!user ? '🔐' : (match.indisponibles || []).includes(pseudo) ? '❌ Indispo' : 'Indispo'}</button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ HISTORIQUE ═══ */}
        {activeTab === 'historique' && (
          <div className="fade-in">
            <SectionTitle title="Résultats" icon="🏆" />
            <div className="grid grid-cols-2 gap-3 mb-6">
              <StatCard value={victoires} label="Victoires" color="gold" />
              <StatCard value={defaites} label="Défaites" color="red" />
            </div>
            {historique.length === 0 ? <EmptyState icon="📜" text="Aucun résultat" /> : (
              <div className="space-y-3">{historique.map((match: any, idx: number) => {
                const isWin = (match.scoreDyno || 0) > (match.scoreAdversaire || 0)
                return (
                  <GlassCard key={match.id} delay={idx * 0.08}>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant={isWin ? 'gold' : 'red'}>{isWin ? '🏆 VICTOIRE' : '❌ DÉFAITE'}</Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-[10px]">{fdf(match.date)}</span>
                        {isAdmin && <button onClick={() => setEditHistoriqueScore({ id: match.id, adversaire: match.adversaire || '', scoreDyno: String(match.scoreDyno || 0), scoreAdv: String(match.scoreAdversaire || 0), type: match.type || 'Ligue', arene: match.arene || 'Arène 1', date: match.date || '', termine: true, sousMatchs: match.sousMatchs || [] })} className="edit-btn-small">✏️</button>}
                      </div>
                    </div>
                    <div className="score-display">
                      <div className="score-team"><p className="score-label-gold">DYNO</p><p className="score-value-gold">{match.scoreDyno}</p></div>
                      <div className="score-separator"><div className="score-line" /><span className="score-vs">VS</span><div className="score-line" /></div>
                      <div className="score-team"><p className="score-label-gray">{match.adversaire}</p><p className="score-value-gray">{match.scoreAdversaire}</p></div>
                    </div>
                    {match.sousMatchs?.length > 0 && <div className="sub-matches"><p className="sub-title">Sous-matchs</p>{match.sousMatchs.map((sm: any, i: number) => <div key={i} className="sub-match-row"><span className="sub-match-name">{sm.adversaire}</span><span className="sub-match-score"><span className="text-gold">{sm.scoreDyno}</span>-<span className="text-gray-500">{sm.scoreAdv}</span></span></div>)}</div>}
                    {match.type && <p className="match-footer">{match.type} • {match.arene}</p>}
                  </GlassCard>
                )
              })}</div>
            )}
          </div>
        )}

        {/* Edit historique modal */}
        {editHistoriqueScore && <Modal onClose={() => setEditHistoriqueScore(null)}>
          <ModalTitle>✏️ Modifier le match</ModalTitle>
          <div className="space-y-3 mb-4">
            <div><label className="form-label">⚔️ Adversaire</label><Input type="text" value={editHistoriqueScore.adversaire} onChange={(e: any) => setEditHistoriqueScore({ ...editHistoriqueScore, adversaire: e.target.value })} /></div>
            <div><label className="form-label">📅 Date</label><Input type="date" value={editHistoriqueScore.date?.includes('/') ? (() => { const p = editHistoriqueScore.date.split('/'); return p[2] + '-' + p[1] + '-' + p[0] })() : editHistoriqueScore.date} onChange={(e: any) => setEditHistoriqueScore({ ...editHistoriqueScore, date: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="form-label">Type</label><Select value={editHistoriqueScore.type} onChange={(e: any) => setEditHistoriqueScore({ ...editHistoriqueScore, type: e.target.value })}><option value="Ligue">Ligue</option><option value="Scrim">Scrim</option><option value="Tournoi">Tournoi</option><option value="Division">Division</option></Select></div>
              <div><label className="form-label">Arène</label><Select value={editHistoriqueScore.arene} onChange={(e: any) => setEditHistoriqueScore({ ...editHistoriqueScore, arene: e.target.value })}><option value="Arène 1">Arène 1</option><option value="Arène 2">Arène 2</option></Select></div>
            </div>
            {editHistoriqueScore.type === 'Division' ? (
              <GlassCard glow className="!p-3">
                <div className="flex items-center justify-between mb-2"><p className="text-[9px] text-orange-400 font-bold uppercase">🏆 Sous-matchs</p><button onClick={ajouterEditSousMatch} className="mini-add-btn">➕</button></div>
                {(editHistoriqueScore.sousMatchs || []).length > 0 ? <div className="space-y-1">{(editHistoriqueScore.sousMatchs || []).map((sm: any, i: number) => <div key={i} className="sub-match-edit"><div><p className="text-[8px] text-gray-500">{sm.adversaire}</p><p className="text-[10px] font-bold"><span className="text-gold">{sm.scoreDyno}</span>-<span className="text-gray-500">{sm.scoreAdv}</span></p></div><button onClick={() => supprimerEditSousMatch(i)} className="text-red-400/40 text-[9px]">🗑️</button></div>)}</div> : <p className="text-[8px] text-gray-600 text-center py-2">Aucun sous-match</p>}
                {(editHistoriqueScore.sousMatchs || []).length > 0 && <div className="sub-match-total"><p className="text-[8px] text-gray-600 uppercase">Score total</p><p className="text-sm font-bold"><span className="text-gold">{(editHistoriqueScore.sousMatchs || []).reduce((a: number, s: any) => a + parseInt(s.scoreDyno || '0'), 0)}</span> - <span className="text-gray-500">{(editHistoriqueScore.sousMatchs || []).reduce((a: number, s: any) => a + parseInt(s.scoreAdv || '0'), 0)}</span></p></div>}
              </GlassCard>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div><label className="form-label">🟡 DYNO</label><Input type="number" value={editHistoriqueScore.scoreDyno} onChange={(e: any) => setEditHistoriqueScore({ ...editHistoriqueScore, scoreDyno: e.target.value })} className="!text-center !text-xl !font-black" /></div>
                <div><label className="form-label">⚪ Adversaire</label><Input type="number" value={editHistoriqueScore.scoreAdv} onChange={(e: any) => setEditHistoriqueScore({ ...editHistoriqueScore, scoreAdv: e.target.value })} className="!text-center !text-xl !font-black" /></div>
              </div>
            )}
            <label className="checkbox-label"><input type="checkbox" checked={editHistoriqueScore.termine === false} onChange={(e: any) => setEditHistoriqueScore({ ...editHistoriqueScore, termine: e.target.checked ? false : true })} /><span>Remettre en « à venir »</span></label>
          </div>
          <div className="modal-actions">
            <button onClick={() => setEditHistoriqueScore(null)} className="btn-cancel">Annuler</button>
            <GoldButton onClick={updateHistoriqueScore}>✅ Modifier</GoldButton>
          </div>
        </Modal>}

        {/* ═══ STRATS ═══ */}
        {activeTab === 'strats' && (
          <div className="fade-in">
            <SectionTitle title="Stratégies" icon="🎯" />
            <GoldButton onClick={() => setShowAddStrat(true)} className="w-full mb-5">➕ Nouvelle Stratégie</GoldButton>
            {strats.length === 0 ? <EmptyState icon="📝" text="Aucune stratégie" /> : (
              <div className="space-y-3">{strats.map((s: any, idx: number) => (
                <GlassCard key={s.id} delay={idx * 0.08}>
                  <div className="flex items-center justify-between mb-3"><div><p className="font-bold text-gold text-sm">DYNO vs {s.adversaire}</p><p className="text-[8px] text-gray-600">par {s.auteur || '?'}</p></div>{(isAdmin || user?.uid === s.auteurId) && <button onClick={() => del('strats', s.id)} className="delete-btn">🗑️</button>}</div>
                  <div className="mb-2"><p className="picks-label">✅ Picks ({s.picks?.length || 0}/4)</p><div className="tag-list">{s.picks?.map((p: string, i: number) => <span key={i} className="tag-green">{p}</span>)}</div></div>
                  <div><p className="bans-label">❌ Bans ({s.bans?.length || 0}/4)</p><div className="tag-list">{s.bans?.map((b: string, i: number) => <span key={i} className="tag-red">{b}</span>)}</div></div>
                </GlassCard>
              ))}</div>
            )}
            {showAddStrat && <Modal onClose={() => { setShowAddStrat(false); setNouvelleStrat({ adversaire: '', picks: [], bans: [] }) }}>
              <ModalTitle>🎯 Nouvelle Stratégie</ModalTitle>
              <div className="space-y-3 mb-4">
                <div><label className="form-label">⚔️ Adversaire</label><Input type="text" placeholder="Nom de l'équipe" value={nouvelleStrat.adversaire} onChange={(e: any) => setNouvelleStrat({ ...nouvelleStrat, adversaire: e.target.value })} /></div>
                <div><label className="form-label">✅ Picks (max 4)</label><div className="map-grid">{AM.map(m => <button key={m} onClick={() => toggleMap(m, 'picks')} className={"map-btn " + (nouvelleStrat.picks.includes(m) ? 'map-pick' : '')}>{m}</button>)}</div></div>
                <div><label className="form-label">❌ Bans (max 4)</label><div className="map-grid">{AM.map(m => <button key={m} onClick={() => toggleMap(m, 'bans')} className={"map-btn " + (nouvelleStrat.bans.includes(m) ? 'map-ban' : '')}>{m}</button>)}</div></div>
              </div>
              <div className="modal-actions"><button onClick={() => { setShowAddStrat(false); setNouvelleStrat({ adversaire: '', picks: [], bans: [] }) }} className="btn-cancel">Annuler</button><GoldButton onClick={ajouterStrat}>✅ Valider</GoldButton></div>
            </Modal>}
          </div>
        )}

        {/* ═══ COMPOS ═══ */}
        {activeTab === 'compos' && (
          <div className="fade-in">
            <SectionTitle title="Compositions" icon="📋" />
            {user && <GoldButton onClick={() => setShowAddCompo(true)} className="w-full mb-5">➕ Nouvelle Compo</GoldButton>}
            {compos.length === 0 ? <EmptyState icon="📋" text="Aucune composition" /> : (
              <div className="space-y-3">{compos.map((c: any, idx: number) => (
                <GlassCard key={c.id} delay={idx * 0.08}>
                  <div className="flex items-center justify-between mb-2"><p className="font-bold text-gold text-sm">🗺️ {c.map}</p>{(isAdmin || user?.uid === c.auteurId) && <button onClick={() => del('compos', c.id)} className="delete-btn">🗑️</button>}</div>
                  <div className="tag-list">{c.joueurs?.map((j: string, i: number) => <span key={i} className="tag-gold">{j}</span>)}</div>
                </GlassCard>
              ))}</div>
            )}
            {showAddCompo && <Modal onClose={() => { setShowAddCompo(false); setSelectedMapCompo(''); setCompoJoueurs([]) }}>
              <ModalTitle>📋 Nouvelle Compo</ModalTitle>
              <div className="space-y-3 mb-4">
                <div><label className="form-label">🗺️ Map</label><div className="map-grid">{AM.map(m => <button key={m} onClick={() => setSelectedMapCompo(m)} className={"map-btn " + (selectedMapCompo === m ? 'map-selected' : '')}>{m}</button>)}</div></div>
                <div><label className="form-label">👥 Joueurs</label><div className="grid grid-cols-2 gap-1.5">{joueurs.filter((j: any) => j.actif !== false).map((j: any) => <button key={j.id} onClick={() => toggleCompoJoueur(j.pseudo)} className={"map-btn " + (compoJoueurs.includes(j.pseudo) ? 'map-pick' : '')}>{j.pseudo}</button>)}</div></div>
              </div>
              <div className="modal-actions"><button onClick={() => { setShowAddCompo(false); setSelectedMapCompo(''); setCompoJoueurs([]) }} className="btn-cancel">Annuler</button><GoldButton onClick={ajouterCompo}>✅</GoldButton></div>
            </Modal>}
          </div>
        )}

        {/* ═══ FICHES ═══ */}
        {activeTab === 'fiches' && (
          <div className="fade-in">
            <SectionTitle title="Fiches Adversaires" icon="🔍" />
            {user && <GoldButton onClick={() => setShowAddFiche(true)} className="w-full mb-5">➕ Nouvelle Fiche</GoldButton>}
            {fichesAdversaires.length === 0 ? <EmptyState icon="🔍" text="Aucune fiche" /> : (
              <div className="space-y-3">{fichesAdversaires.map((f: any, idx: number) => (
                <GlassCard key={f.id} delay={idx * 0.08}>
                  <div className="flex items-center justify-between mb-3"><p className="font-bold text-gold text-sm">⚔️ {f.adversaire}</p>{(isAdmin || user?.uid === f.auteurId) && <button onClick={() => del('fichesAdversaires', f.id)} className="delete-btn">🗑️</button>}</div>
                  <div className="space-y-2">
                    <div className="fiche-section fiche-forces"><p className="fiche-label">💪 Forces</p><p className="fiche-text">{f.forces || '—'}</p></div>
                    <div className="fiche-section fiche-faiblesses"><p className="fiche-label fiche-label-red">⚠️ Faiblesses</p><p className="fiche-text">{f.faiblesses || '—'}</p></div>
                    {f.notes && <div className="fiche-section fiche-notes"><p className="fiche-label fiche-label-gray">📝 Notes</p><p className="fiche-text">{f.notes}</p></div>}
                  </div>
                  <p className="text-gray-700 text-[8px] mt-2">par {f.auteur}</p>
                </GlassCard>
              ))}</div>
            )}
            {showAddFiche && <Modal onClose={() => { setShowAddFiche(false); setNouvelleFiche({ adversaire: '', forces: '', faiblesses: '', notes: '' }) }}>
              <ModalTitle>🔍 Nouvelle Fiche</ModalTitle>
              <div className="space-y-3 mb-4">
                <div><label className="form-label">⚔️ Adversaire</label><Input type="text" placeholder="Nom" value={nouvelleFiche.adversaire} onChange={(e: any) => setNouvelleFiche({ ...nouvelleFiche, adversaire: e.target.value })} /></div>
                <div><label className="form-label">💪 Forces</label><Textarea value={nouvelleFiche.forces} onChange={(e: any) => setNouvelleFiche({ ...nouvelleFiche, forces: e.target.value })} rows={2} /></div>
                <div><label className="form-label">⚠️ Faiblesses</label><Textarea value={nouvelleFiche.faiblesses} onChange={(e: any) => setNouvelleFiche({ ...nouvelleFiche, faiblesses: e.target.value })} rows={2} /></div>
                <div><label className="form-label">📝 Notes</label><Textarea value={nouvelleFiche.notes} onChange={(e: any) => setNouvelleFiche({ ...nouvelleFiche, notes: e.target.value })} rows={2} /></div>
              </div>
              <div className="modal-actions"><button onClick={() => { setShowAddFiche(false); setNouvelleFiche({ adversaire: '', forces: '', faiblesses: '', notes: '' }) }} className="btn-cancel">Annuler</button><GoldButton onClick={ajouterFiche}>✅</GoldButton></div>
            </Modal>}
          </div>
        )}

        {/* ═══ NOTES ═══ */}
        {activeTab === 'notes' && (
          <div className="fade-in">
            <SectionTitle title="Notes & Analyses" icon="📊" />
            {historique.length === 0 ? <EmptyState icon="📊" text="Aucun match terminé" /> : (
              <div className="space-y-4">{historique.map((match: any, idx: number) => {
                const mn = notes.filter((n: any) => n.matchId === match.id)
                const mc = commentaires.filter((c: any) => c.matchId === match.id)
                const ma = analyses.filter((a: any) => a.matchId === match.id)
                return (
                  <GlassCard key={match.id} delay={idx * 0.08}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-bold text-gold text-sm">DYNO vs {match.adversaire}</p>
                      <div className="flex items-center gap-2"><Badge variant={(match.scoreDyno || 0) > (match.scoreAdversaire || 0) ? 'gold' : 'red'}>{match.scoreDyno}-{match.scoreAdversaire}</Badge><span className="text-gray-700 text-[9px]">{fdf(match.date)}</span></div>
                    </div>
                    <div className="flex gap-1.5 mb-3">
                      <button onClick={() => { setSelectedMatchForNotes(match); setNouvelleNote({ matchId: match.id, mental: '', communication: '', gameplay: '' }) }} className="action-btn action-purple">📝 Note</button>
                      <button onClick={() => setSelectedMatchForComment(selectedMatchForComment?.id === match.id ? null : match)} className="action-btn action-cyan">💬 Comm</button>
                      <button onClick={() => setSelectedMatchForAnalyse(selectedMatchForAnalyse?.id === match.id ? null : match)} className="action-btn action-orange">📋 Analyse</button>
                    </div>
                    {selectedMatchForComment?.id === match.id && user && <div className="inline-form"><Textarea placeholder="Commentaire..." value={nouveauCommentaire} onChange={(e: any) => setNouveauCommentaire(e.target.value)} rows={2} /><GoldButton onClick={() => ajouterCommentaire(match.id)} className="w-full mt-2 !py-1.5 text-[10px]">💬 Envoyer</GoldButton></div>}
                    {selectedMatchForAnalyse?.id === match.id && user && <div className="inline-form space-y-2"><div><label className="form-label-sm text-green-400">✅ Ce qui a bien fonctionné</label><Textarea value={nouvelleAnalyse.bien} onChange={(e: any) => setNouvelleAnalyse({ ...nouvelleAnalyse, bien: e.target.value })} rows={2} /></div><div><label className="form-label-sm text-red-400">❌ À améliorer</label><Textarea value={nouvelleAnalyse.mal} onChange={(e: any) => setNouvelleAnalyse({ ...nouvelleAnalyse, mal: e.target.value })} rows={2} /></div><div><label className="form-label-sm text-blue-400">🎯 Plan d'action</label><Textarea value={nouvelleAnalyse.plan} onChange={(e: any) => setNouvelleAnalyse({ ...nouvelleAnalyse, plan: e.target.value })} rows={2} /></div><GoldButton onClick={() => ajouterAnalyse(match.id)} className="w-full !py-1.5 text-[10px]">📋 Enregistrer</GoldButton></div>}
                    {mn.length > 0 && <div className="data-section"><p className="data-title text-purple-400">📊 Notes ({mn.length})</p>{mn.map((n: any) => <div key={n.id} className="data-card"><div className="flex items-center justify-between mb-1"><p className="data-author">{n.joueur}</p>{isAdmin && <button onClick={() => del('notes', n.id)} className="delete-btn-sm">🗑️</button>}</div><div className="grid grid-cols-3 gap-1 text-center"><div className="note-cell note-purple"><p className="note-icon">🧠</p><p className="note-value">{n.mental}/10</p></div><div className="note-cell note-blue"><p className="note-icon">💬</p><p className="note-value">{n.communication}/10</p></div><div className="note-cell note-green"><p className="note-icon">🎯</p><p className="note-value">{n.gameplay}/10</p></div></div></div>)}</div>}
                    {mc.length > 0 && <div className="data-section"><p className="data-title text-cyan-400">💬 Commentaires ({mc.length})</p>{mc.map((c: any) => <div key={c.id} className="data-card"><div className="flex items-center justify-between"><p className="data-author text-cyan-400">{c.joueur}</p><div className="flex items-center gap-1"><p className="text-gray-700 text-[8px]">{fts(c.createdAt)}</p>{(isAdmin || user?.uid === c.joueurId) && <button onClick={() => del('commentaires', c.id)} className="delete-btn-sm">🗑️</button>}</div></div><p className="text-gray-400 text-[10px] mt-0.5">{c.texte}</p></div>)}</div>}
                    {ma.length > 0 && <div className="data-section"><p className="data-title text-orange-400">📋 Analyses ({ma.length})</p>{ma.map((a: any) => <div key={a.id} className="data-card"><div className="flex items-center justify-between mb-1"><p className="data-author text-orange-400">{a.joueur}</p>{(isAdmin || user?.uid === a.joueurId) && <button onClick={() => del('analyses', a.id)} className="delete-btn-sm">🗑️</button>}</div>{a.bien && <div className="analyse-block analyse-green"><span className="analyse-icon">✅</span><p>{a.bien}</p></div>}{a.mal && <div className="analyse-block analyse-red"><span className="analyse-icon">❌</span><p>{a.mal}</p></div>}{a.plan && <div className="analyse-block analyse-blue"><span className="analyse-icon">🎯</span><p>{a.plan}</p></div>}</div>)}</div>}
                    {mn.length === 0 && mc.length === 0 && ma.length === 0 && <p className="text-gray-700 text-[9px] text-center mt-2 italic">Aucune donnée pour ce match</p>}
                  </GlassCard>
                )
              })}</div>
            )}
            {selectedMatchForNotes && <Modal onClose={() => { setSelectedMatchForNotes(null); setNouvelleNote({ matchId: '', mental: '', communication: '', gameplay: '' }) }}>
              <ModalTitle>📊 DYNO vs {selectedMatchForNotes.adversaire}</ModalTitle>
              <div className="space-y-3 mb-4">
                <div><label className="form-label">🧠 Mental</label><Input type="number" min="0" max="10" value={nouvelleNote.mental} onChange={(e: any) => setNouvelleNote({ ...nouvelleNote, mental: e.target.value })} className="!text-center !text-2xl !font-black" /></div>
                <div><label className="form-label">💬 Communication</label><Input type="number" min="0" max="10" value={nouvelleNote.communication} onChange={(e: any) => setNouvelleNote({ ...nouvelleNote, communication: e.target.value })} className="!text-center !text-2xl !font-black" /></div>
                <div><label className="form-label">🎯 Performance</label><Input type="number" min="0" max="10" value={nouvelleNote.gameplay} onChange={(e: any) => setNouvelleNote({ ...nouvelleNote, gameplay: e.target.value })} className="!text-center !text-2xl !font-black" /></div>
              </div>
              <div className="modal-actions"><button onClick={() => { setSelectedMatchForNotes(null); setNouvelleNote({ matchId: '', mental: '', communication: '', gameplay: '' }) }} className="btn-cancel">Annuler</button><GoldButton onClick={ajouterNote}>✅ Valider</GoldButton></div>
            </Modal>}
          </div>
        )}

        {/* ═══ OBJECTIFS ═══ */}
        {activeTab === 'objectifs' && (
          <div className="fade-in">
            <SectionTitle title="Mes Objectifs" icon="🎯" />
            {user && <div className="flex gap-2 mb-5"><Input type="text" placeholder="Nouvel objectif..." value={nouvelObjectif} onChange={(e: any) => setNouvelObjectif(e.target.value)} onKeyDown={(e: any) => { if (e.key === 'Enter') ajouterObjectif() }} /><GoldButton onClick={ajouterObjectif} className="!px-4">➕</GoldButton></div>}
            {objectifs.filter((o: any) => o.joueurId === user?.uid).length === 0 ? <EmptyState icon="🎯" text="Aucun objectif défini" /> : (
              <div className="space-y-4">
                {objectifs.filter((o: any) => !o.termine && o.joueurId === user?.uid).length > 0 && <div><p className="section-subtitle text-gold">🔄 En cours</p><div className="space-y-2">{objectifs.filter((o: any) => !o.termine && o.joueurId === user?.uid).map((o: any, idx: number) => <GlassCard key={o.id} glow className="!p-3 flex items-start gap-3" delay={idx * 0.08}><button onClick={() => toggleObjectif(o.id, o.termine)} className="objectif-check" /><div className="flex-1"><p className="text-white text-sm">{o.texte}</p><p className="text-gray-700 text-[8px] mt-0.5">{new Date(o.createdAt).toLocaleDateString('fr-FR')}</p></div><button onClick={() => del('objectifs', o.id)} className="delete-btn">🗑️</button></GlassCard>)}</div></div>}
                {objectifs.filter((o: any) => o.termine && o.joueurId === user?.uid).length > 0 && <div><p className="section-subtitle text-green-400">✅ Atteints ({objectifs.filter((o: any) => o.termine && o.joueurId === user?.uid).length})</p><div className="space-y-2">{objectifs.filter((o: any) => o.termine && o.joueurId === user?.uid).map((o: any) => <div key={o.id} className="objectif-done"><button onClick={() => toggleObjectif(o.id, o.termine)} className="objectif-check-done"><span>✓</span></button><p className="text-gray-500 text-sm line-through flex-1">{o.texte}</p><button onClick={() => del('objectifs', o.id)} className="delete-btn">🗑️</button></div>)}</div></div>}
              </div>
            )}
          </div>
        )}

        {/* ═══ REPLAYS ═══ */}
        {activeTab === 'rec' && (
          <div className="fade-in">
            <SectionTitle title="Replays" icon="🎬" />
            <a href={YT} target="_blank" className="youtube-link"><div className="live-dot" style={{ width: 6, height: 6 }} /><span>Chaîne YouTube</span></a>
            {replays.length === 0 ? <EmptyState icon="📹" text="Aucun replay" /> : (
              <div className="space-y-3">{replays.map((r: any, idx: number) => (
                <GlassCard key={r.id} delay={idx * 0.08}>
                  <div className="flex items-center justify-between mb-2"><h3 className="font-bold text-gold text-sm">{r.titre}</h3>{isAdmin && <button onClick={() => del('replays', r.id)} className="delete-btn-sm">🗑️</button>}</div>
                  {ytId(r.lien) ? <div className="video-embed"><iframe src={'https://www.youtube.com/embed/' + ytId(r.lien)} className="absolute top-0 left-0 w-full h-full" frameBorder="0" allowFullScreen /></div> : <a href={r.lien} target="_blank" className="block"><GoldButton className="w-full">▶️ Regarder</GoldButton></a>}
                </GlassCard>
              ))}</div>
            )}
          </div>
        )}

        {/* ═══ ROSTER ═══ */}
        {activeTab === 'roster' && (
          <div className="fade-in">
            <SectionTitle title="Roster" icon="👥" />
            {user && <GlassCard className="mb-5 !border-pink-500/10"><p className="form-label text-pink-400">🎂 Mon anniversaire</p><div className="flex gap-2"><Input type="date" value={anniversaire} onChange={(e: any) => setAnniversaire(e.target.value)} /><button onClick={sauvegarderAnniversaire} className="px-3 py-2 rounded-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs shadow-lg shadow-pink-900/30">💾</button></div></GlassCard>}
            <div className="space-y-2">{joueurs.filter((j: any) => j.actif !== false).map((j: any, idx: number) => (
              <GlassCard key={j.id} className="!p-3 flex items-center gap-3" delay={idx * 0.08}>
                <div className="player-avatar">{j.pseudo[0]?.toUpperCase()}</div>
                <div className="flex-1"><p className="font-bold text-gold text-sm">{j.pseudo}</p><p className="text-[9px] text-gray-600">🎮 {j.role}</p></div>
                {isAdmin && <button onClick={() => del('players', j.id)} className="delete-btn">🗑️</button>}
              </GlassCard>
            ))}</div>
          </div>
        )}

        {/* ═══ STATS ═══ */}
        {activeTab === 'stats' && (
          <div className="fade-in">
            <SectionTitle title="Statistiques" icon="📈" />
            <div className="grid grid-cols-2 gap-3 mb-6">
              <StatCard value={winRate + '%'} label="Win Rate" />
              <StatCard value={totalMatchs} label="Total Matchs" />
            </div>
            <GlassCard className="mb-5">
              <h3 className="form-label mb-3">📊 Répartition</h3>
              <div className="space-y-3">
                <div><div className="flex justify-between mb-1"><span className="text-gray-600 text-[9px]">🏆 Victoires</span><span className="text-gold font-bold text-xs">{victoires}</span></div><div className="progress-bar"><div className="progress-fill-gold" style={{ width: (totalMatchs > 0 ? (victoires / totalMatchs) * 100 : 0) + '%' }} /></div></div>
                <div><div className="flex justify-between mb-1"><span className="text-gray-600 text-[9px]">❌ Défaites</span><span className="text-red-500 font-bold text-xs">{defaites}</span></div><div className="progress-bar"><div className="progress-fill-red" style={{ width: (totalMatchs > 0 ? (defaites / totalMatchs) * 100 : 0) + '%' }} /></div></div>
              </div>
            </GlassCard>
            <button onClick={() => setShowBilan(true)} className="bilan-btn">📊 Bilan du mois</button>
            {showBilan && (() => { const b = genBilan(); return <Modal onClose={() => setShowBilan(false)}>
              <ModalTitle>📊 Bilan {b.nom}</ModalTitle>
              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-3 gap-2"><StatCard value={b.m} label="Matchs" /><StatCard value={b.w + 'W'} label="Victoires" color="green" /><StatCard value={b.l + 'L'} label="Défaites" color="red" /></div>
                <GlassCard glow className="text-center !p-4"><p className="stat-value stat-gold text-4xl">{b.wr}%</p><p className="stat-label">Win Rate</p></GlassCard>
                <div className="grid grid-cols-3 gap-2"><StatCard value={b.am} label="🧠" color="purple" /><StatCard value={b.ac} label="💬" color="blue" /><StatCard value={b.ap} label="🎯" color="green" /></div>
              </div>
              <button onClick={() => setShowBilan(false)} className="btn-cancel w-full">Fermer</button>
            </Modal> })()}
          </div>
        )}

        {/* ═══ ADMIN ═══ */}
        {activeTab === 'admin' && (
          <div className="fade-in">
            <SectionTitle title="Administration" icon="⚙️" />
            {!isAdmin ? (
              <GlassCard><Input type="password" placeholder="Mot de passe admin" value={adminPassword} onChange={(e: any) => setAdminPassword(e.target.value)} className="mb-3" /><GoldButton onClick={handleAdminLogin} className="w-full">🔐 Connexion Admin</GoldButton></GlassCard>
            ) : (
              <div className="space-y-4">
                <GlassCard glow>
                  <h3 className="form-label mb-3">➕ Nouveau match</h3>
                  <Input type="text" placeholder="Adversaire" value={nouveauMatch.adversaire} onChange={(e: any) => setNouveauMatch({ ...nouveauMatch, adversaire: e.target.value })} className="mb-2" />
                  <Input type="date" value={nouveauMatch.date} onChange={(e: any) => setNouveauMatch({ ...nouveauMatch, date: e.target.value })} className="mb-2" />
                  <div className="grid grid-cols-2 gap-2 mb-2"><Input type="time" value={nouveauMatch.horaire1} onChange={(e: any) => setNouveauMatch({ ...nouveauMatch, horaire1: e.target.value })} /><Input type="time" value={nouveauMatch.horaire2} onChange={(e: any) => setNouveauMatch({ ...nouveauMatch, horaire2: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-2 mb-2"><Select value={nouveauMatch.arene} onChange={(e: any) => setNouveauMatch({ ...nouveauMatch, arene: e.target.value })}><option value="Arène 1">Arène 1</option><option value="Arène 2">Arène 2</option></Select><Select value={nouveauMatch.type} onChange={(e: any) => setNouveauMatch({ ...nouveauMatch, type: e.target.value })}><option value="Ligue">Ligue</option><option value="Scrim">Scrim</option><option value="Tournoi">Tournoi</option><option value="Division">Division</option></Select></div>
                  {nouveauMatch.type === 'Division' && <GlassCard className="!p-3 mb-2"><div className="flex items-center justify-between mb-2"><p className="text-[9px] text-gold font-bold uppercase">🏆 Sous-matchs</p><button onClick={ajouterSousMatch} className="mini-add-btn">➕</button></div>{nouveauMatch.sousMatchs.length > 0 ? <div className="space-y-1">{nouveauMatch.sousMatchs.map((sm, i) => <div key={i} className="sub-match-edit"><div><p className="text-[8px] text-gray-500">{sm.adversaire}</p><p className="text-[10px] font-bold"><span className="text-gold">{sm.scoreDyno}</span>-<span className="text-gray-500">{sm.scoreAdv}</span></p></div><button onClick={() => supprimerSousMatch(i)} className="text-red-400/40 text-[9px]">🗑️</button></div>)}</div> : <p className="text-[8px] text-gray-600 text-center py-2">Aucun</p>}</GlassCard>}
                  <GoldButton onClick={ajouterMatch} className="w-full">Ajouter + Discord</GoldButton>
                </GlassCard>
                <GlassCard>
                  <h3 className="form-label mb-3">🗑️ Gérer les matchs</h3>
                  {matchs.length === 0 ? <p className="text-gray-700 text-center text-xs py-3">Aucun match</p> : (
                    <div className="space-y-1.5">{matchs.map((m: any) => (
                      <div key={m.id} className="admin-match-row">
                        <div><p className="text-gold font-semibold text-[10px]">{m.adversaire}</p><p className="text-gray-700 text-[8px]">{fdf(m.date)} • {m.termine ? '✅' : '⏳'}</p></div>
                        <div className="flex items-center gap-1">
                          {m.termine && <button onClick={() => setEditHistoriqueScore({ id: m.id, adversaire: m.adversaire || '', scoreDyno: String(m.scoreDyno || 0), scoreAdv: String(m.scoreAdversaire || 0), type: m.type || 'Ligue', arene: m.arene || 'Arène 1', date: m.date || '', termine: true, sousMatchs: m.sousMatchs || [] })} className="edit-btn-small">✏️</button>}
                          <button onClick={() => del('matchs', m.id)} className="delete-btn">🗑️</button>
                        </div>
                      </div>
                    ))}</div>
                  )}
                </GlassCard>
                <GlassCard><h3 className="form-label mb-3">🎬 Ajouter un replay</h3><Input type="text" placeholder="Titre" value={nouveauReplay.titre} onChange={(e: any) => setNouveauReplay({ ...nouveauReplay, titre: e.target.value })} className="mb-2" /><Input type="text" placeholder="Lien YouTube" value={nouveauReplay.lien} onChange={(e: any) => setNouveauReplay({ ...nouveauReplay, lien: e.target.value })} className="mb-2" /><GoldButton onClick={ajouterReplay} className="w-full">Ajouter</GoldButton></GlassCard>
                <GlassCard><h3 className="form-label mb-3">✏️ Scores à venir</h3>{prochainsMatchs.map((m: any) => <div key={m.id} className="admin-score-row"><p className="font-semibold text-gold text-xs">vs {m.adversaire}</p><GoldButton onClick={() => setScoreEdit({ id: m.id, scoreDyno: '', scoreAdv: '' })} className="!py-1 !px-3 text-[10px]">📝</GoldButton></div>)}</GlassCard>
                <button onClick={handleAdminLogout} className="logout-btn">🚪 Déconnexion admin</button>
              </div>
            )}
            {scoreEdit && <Modal onClose={() => setScoreEdit(null)}>
              <ModalTitle>📝 Entrer le score</ModalTitle>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div><label className="form-label">DYNO</label><Input type="number" placeholder="0" value={scoreEdit.scoreDyno} onChange={(e: any) => setScoreEdit({ ...scoreEdit, scoreDyno: e.target.value })} className="!text-center !text-2xl !font-black" /></div>
                <div><label className="form-label">Adversaire</label><Input type="number" placeholder="0" value={scoreEdit.scoreAdv} onChange={(e: any) => setScoreEdit({ ...scoreEdit, scoreAdv: e.target.value })} className="!text-center !text-2xl !font-black" /></div>
              </div>
              <div className="modal-actions"><button onClick={() => setScoreEdit(null)} className="btn-cancel">Annuler</button><GoldButton onClick={updateScore}>✅</GoldButton></div>
            </Modal>}
          </div>
        )}
      </main>

      {/* ─── LOGIN ─── */}
      {!user && (
        <div className="login-overlay">
          <Particles />
          <div className="login-card">
            <img src={LG} alt="D" className="login-logo" />
            <h3 className="login-title">{isSignUp ? '📝 Créer un compte' : '🔐 Connexion'}</h3>
            {isSignUp && <Input type="text" placeholder="Pseudo" value={pseudo} onChange={(e: any) => setPseudo(e.target.value)} className="mb-2.5" />}
            <Input type="email" placeholder="Email" value={email} onChange={(e: any) => setEmail(e.target.value)} className="mb-2.5" />
            <Input type="password" placeholder="Mot de passe" value={authPassword} onChange={(e: any) => setAuthPassword(e.target.value)} className="mb-4" />
            <GoldButton onClick={isSignUp ? handleSignUp : handleSignIn} className="w-full mb-3">
              {isSignUp ? '✅ Créer le compte' : '🔐 Se connecter'}
            </GoldButton>
            <div className="login-switch">
              <button onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? En créer un'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App