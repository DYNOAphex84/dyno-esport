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
const DW_IDEES = 'https://discord.com/api/webhooks/1494393266441945180/FZWrs3w9Oz-TjsU5oKaPCn7FpmFJLXPlZrq6jWzS8Oxi8Rl54LKz8XA8Q7IQED_NEcLZ'
const YT = 'https://youtube.com/@jonathanla890?si=eHtXG1hjlmCuZ-RC'
const LG = 'https://i.imgur.com/gTLj57a.png'
const AE = 'thibaut.llorens@hotmail.com'
const AM = ['Engine','Helios','Silva','The Cliff','Artefact','Outlaw','Atlantis','Horizon','Polaris','Lunar','Ceres']

const EVA_PASSES: Record<string, { label: string; icon: string; hc: number; hp: number; color: string }> = {
  bronze: { label: 'Bronze', icon: '🥉', hc: 3, hp: 1, color: 'from-amber-700 to-amber-900' },
  argent: { label: 'Argent', icon: '🥈', hc: 6, hp: 2, color: 'from-gray-400 to-gray-600' },
  or: { label: 'Or', icon: '🥇', hc: 12, hp: 4, color: 'from-[#D4AF37] to-[#FFD700]' },
}

const isHP = (dateStr: string, timeStr: string): boolean => {
  if (!dateStr) return false
  let d = dateStr
  if (d.includes('/')) { const [dd, mm, yy] = d.split('/'); d = yy + '-' + mm + '-' + dd }
  try {
    const dt = new Date(d + 'T' + (timeStr || '20:00') + ':00')
    if (isNaN(dt.getTime())) return false
    const day = dt.getDay()
    const totalMin = dt.getHours() * 60 + dt.getMinutes()
    if (day === 5) return totalMin >= 1080 && totalMin <= 1400
    if (day === 6) return totalMin >= 780 && totalMin <= 1380
    if (day === 0) return totalMin >= 780 && totalMin <= 1380
    return false
  } catch { return false }
}

const P = () => (
  <div className="particles">
    {Array.from({ length: 12 }).map((_, i) => <div key={i} className="particle" />)}
  </div>
)

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
  const [idees, setIdees] = useState<any[]>([])
  const [analyses, setAnalyses] = useState<any[]>([])
  const [fichesAdversaires, setFichesAdversaires] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [videos, setVideos] = useState<any[]>([])
  const [videoStrats, setVideoStrats] = useState<any[]>([])
  
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
  const [nouvelleIdee, setNouvelleIdee] = useState('')
  const [showBilan, setShowBilan] = useState(false)
  const [selectedMatchForAnalyse, setSelectedMatchForAnalyse] = useState<any>(null)
  const [nouvelleAnalyse, setNouvelleAnalyse] = useState({ bien: '', mal: '', plan: '' })
  const [showAddFiche, setShowAddFiche] = useState(false)
  const [nouvelleFiche, setNouvelleFiche] = useState({ adversaire: '', forces: '', faiblesses: '', notes: '' })
  const [myPass, setMyPass] = useState<any>(null)
  const [allPasses, setAllPasses] = useState<any[]>([])
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  
  // YOUTUBE STATES
  const [nouvelleVideo, setNouvelleVideo] = useState({ titre: '', description: '', youtubeUrl: '', status: 'draft', category: 'Tutorial', tags: '', targetAudience: '', duration: 0, views: 0, likes: 0, comments: 0 })
  const [editingVideo, setEditingVideo] = useState<any>(null)
  const [showAddVideo, setShowAddVideo] = useState(false)
  const [nouvelleStratVideo, setNouvelleStratVideo] = useState({ nom: '', description: '', goal: '', targetAudience: '', uploadFrequency: '1 par semaine', contentTypes: '' })
  const [showAddStratVideo, setShowAddStratVideo] = useState(false)
  const [selectedStratVideo, setSelectedStratVideo] = useState<any>(null)

  const pm = useRef(0), pn = useRef(0), pc = useRef(0), ps = useRef(0), pi = useRef(0), ty = useRef(0)

  const addLog = async (action: string) => {
    if (!user) return
    try { await addDoc(collection(db, 'logs'), { joueur: pseudo, joueurId: user.uid, action, createdAt: Date.now() }) } catch {}
  }

  const ytIdFromUrl = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\\/\s]{11})/
    const m = url.match(regex)
    return m ? m[1] : null
  }

  const ajouterVideo = async () => {
    if (!nouvelleVideo.titre || !nouvelleVideo.description) { alert('Remplis les champs'); return }
    const tagArray = nouvelleVideo.tags.split(',').map(t => t.trim()).filter(Boolean)
    const videoData = { ...nouvelleVideo, tags: tagArray, createdAt: Date.now(), auteur: pseudo, auteurId: user?.uid, stratId: selectedStratVideo?.id || null }
    await addDoc(collection(db, 'videos'), videoData)
    addLog('Video: ' + nouvelleVideo.titre)
    setNouvelleVideo({ titre: '', description: '', youtubeUrl: '', status: 'draft', category: 'Tutorial', tags: '', targetAudience: '', duration: 0, views: 0, likes: 0, comments: 0 })
    setShowAddVideo(false)
    alert('Video ajoutée!')
  }

  const ajouterStratVideo = async () => {
    if (!nouvelleStratVideo.nom) { alert('Nom requis'); return }
    const contentTypes = nouvelleStratVideo.contentTypes.split(',').map(t => t.trim()).filter(Boolean)
    const stratData = { ...nouvelleStratVideo, contentTypes, videos: [], createdAt: Date.now(), auteur: pseudo, auteurId: user?.uid }
    await addDoc(collection(db, 'videoStrats'), stratData)
    addLog('Strat video: ' + nouvelleStratVideo.nom)
    setNouvelleStratVideo({ nom: '', description: '', goal: '', targetAudience: '', uploadFrequency: '1 par semaine', contentTypes: '' })
    setShowAddStratVideo(false)
    alert('Strategie creee!')
  }

  const updateVideo = async () => {
    if (!editingVideo) return
    const tagArray = typeof editingVideo.tags === 'string' ? editingVideo.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : editingVideo.tags
    await updateDoc(doc(db, 'videos', editingVideo.id), { ...editingVideo, tags: tagArray })
    addLog('Video modifiee')
    setEditingVideo(null)
    setShowAddVideo(false)
    alert('Mise a jour!')
  }

  const deleteVideo = async (id: string) => {
    if (!confirm('Supprimer?')) return
    await deleteDoc(doc(db, 'videos', id))
    addLog('Video supprimee')
  }

  const deleteStratVideo = async (id: string) => {
    if (!confirm('Supprimer la strategie?')) return
    await deleteDoc(doc(db, 'videoStrats', id))
    addLog('Strat video supprimee')
  }

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
      if (!('Notification' in window)) { alert('Non'); return }
      const p = await Notification.requestPermission()
      if (p === 'granted') { setNotificationsEnabled(true); localStorage.setItem('dyno-notifs', 'true'); alert('Activees!') }
      else { setNotificationsEnabled(false); localStorage.setItem('dyno-notifs', 'false') }
    } catch { }
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
    const ck = () => {
      const now = new Date()
      matchs.forEach((m: any) => {
        if (m.termine) return
        const mt = getMatchDateTime(m)
        if (!mt) return
        const dm = (mt.getTime() - now.getTime()) / 60000
        const k1 = m.id + '-24h'
        if (dm > 1410 && dm <= 1450 && !notifiedMatchs.includes(k1)) {
          sendNotification('Match demain!', 'DYNO vs ' + m.adversaire, 'm24h')
          const u = [...notifiedMatchs, k1]; setNotifiedMatchs(u); localStorage.setItem('dyno-notified', JSON.stringify(u))
        }
      })
    }
    ck()
    const i = setInterval(ck, 60000)
    return () => clearInterval(i)
  }, [notificationsEnabled, matchs, notifiedMatchs, sendNotification, getMatchDateTime])

  useEffect(() => {
    const u = () => {
      const now = new Date()
      const c: Record<string, string> = {}
      matchs.forEach((m: any) => {
        if (m.termine) return
        const mt = getMatchDateTime(m)
        if (!mt) return
        const df = mt.getTime() - now.getTime()
        if (df <= 0) { c[m.id] = 'EN COURS'; return }
        const j = Math.floor(df / 86400000)
        const h = Math.floor((df % 86400000) / 3600000)
        const mi = Math.floor((df % 3600000) / 60000)
        const s = Math.floor((df % 60000) / 1000)
        c[m.id] = (j > 0 ? j + 'j ' : '') + ((h > 0 || j > 0) ? h + 'h ' : '') + mi + 'm ' + s + 's'
      })
      setCountdowns(c)
    }
    u()
    const i = setInterval(u, 1000)
    return () => clearInterval(i)
  }, [matchs, getMatchDateTime])

  useEffect(() => { if (localStorage.getItem('dyno-admin') === 'true') setIsAdmin(true) }, [])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u: any) => {
      setUser(u)
      if (u) {
        const d = await getDoc(doc(db, 'users', u.uid))
        if (d.exists()) {
          const data = d.data()
          setPseudo(data.pseudo || '')
          if (data.anniversaire) setAnniversaire(data.anniversaire)
          if (data.avatarUrl) setAvatarUrl(data.avatarUrl)
          if (u.email === AE || data.isAdmin) { setIsAdmin(true); localStorage.setItem('dyno-admin', 'true') }
          if (data.evaPass) {
            const pass = data.evaPass
            if (pass.dateReset) {
              const rd = new Date(pass.dateReset)
              if (new Date() >= rd) {
                const np = { ...pass, hcUsed: 0, hpUsed: 0, dateReset: new Date(rd.getTime() + 30 * 86400000).toISOString().split('T')[0] }
                setMyPass(np); updateDoc(doc(db, 'users', u.uid), { evaPass: np })
              } else setMyPass(pass)
            } else setMyPass(pass)
          }
        }
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  useEffect(() => { const q = query(collection(db, 'matchs'), orderBy('createdAt', 'desc')); const u = onSnapshot(q, (s: any) => { const d: any[] = []; s.forEach((x: any) => d.push({ id: x.id, ...x.data() })); setMatchs(d) }); return () => u() }, [])
  useEffect(() => { const q = query(collection(db, 'notes'), orderBy('createdAt', 'desc')); const u = onSnapshot(q, (s: any) => { const d: any[] = []; s.forEach((x: any) => d.push({ id: x.id, ...x.data() })); setNotes(d) }); return () => u() }, [])
  useEffect(() => { const q = query(collection(db, 'commentaires'), orderBy('createdAt', 'desc')); const u = onSnapshot(q, (s: any) => { const d: any[] = []; s.forEach((x: any) => d.push({ id: x.id, ...x.data() })); setCommentaires(d) }); return () => u() }, [])
  useEffect(() => { const q = query(collection(db, 'strats'), orderBy('createdAt', 'desc')); const u = onSnapshot(q, (s: any) => { const d: any[] = []; s.forEach((x: any) => d.push({ id: x.id, ...x.data() })); setStrats(d) }); return () => u() }, [])
  useEffect(() => { const q = query(collection(db, 'replays'), orderBy('createdAt', 'desc')); const u = onSnapshot(q, (s: any) => { const d: any[] = []; s.forEach((x: any) => d.push({ id: x.id, ...x.data() })); setReplays(d) }); return () => u() }, [])
  useEffect(() => { const q = query(collection(db, 'players'), orderBy('createdAt', 'desc')); const u = onSnapshot(q, (s: any) => { const d: any[] = []; s.forEach((x: any) => d.push({ id: x.id, ...x.data() })); setJoueurs(d) }); return () => u() }, [])
  useEffect(() => { const q = query(collection(db, 'compos'), orderBy('createdAt', 'desc')); const u = onSnapshot(q, (s: any) => { const d: any[] = []; s.forEach((x: any) => d.push({ id: x.id, ...x.data() })); setCompos(d) }); return () => u() }, [])
  useEffect(() => { const q = query(collection(db, 'idees'), orderBy('createdAt', 'desc')); const u = onSnapshot(q, (s: any) => { const d: any[] = []; s.forEach((x: any) => d.push({ id: x.id, ...x.data() })); setIdees(d) }); return () => u() }, [])
  useEffect(() => { const q = query(collection(db, 'analyses'), orderBy('createdAt', 'desc')); const u = onSnapshot(q, (s: any) => { const d: any[] = []; s.forEach((x: any) => d.push({ id: x.id, ...x.data() })); setAnalyses(d) }); return () => u() }, [])
  useEffect(() => { const q = query(collection(db, 'fichesAdversaires'), orderBy('createdAt', 'desc')); const u = onSnapshot(q, (s: any) => { const d: any[] = []; s.forEach((x: any) => d.push({ id: x.id, ...x.data() })); setFichesAdversaires(d) }); return () => u() }, [])
  useEffect(() => { const u = onSnapshot(collection(db, 'users'), (s: any) => { const d: any[] = []; s.forEach((x: any) => { const data = x.data(); if (data.evaPass) d.push({ oduserId: x.id, pseudo: data.pseudo, avatarUrl: data.avatarUrl, ...data.evaPass }) }); setAllPasses(d) }); return () => u() }, [])
  useEffect(() => { const q = query(collection(db, 'logs'), orderBy('createdAt', 'desc')); const u = onSnapshot(q, (s: any) => { const d: any[] = []; s.forEach((x: any) => d.push({ id: x.id, ...x.data() })); setLogs(d.slice(0, 50)) }); return () => u() }, [])
  useEffect(() => { const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc')); const u = onSnapshot(q, (s: any) => { const d: any[] = []; s.forEach((x: any) => d.push({ id: x.id, ...x.data() })); setVideos(d) }); return () => u() }, [])
  useEffect(() => { const q = query(collection(db, 'videoStrats'), orderBy('createdAt', 'desc')); const u = onSnapshot(q, (s: any) => { const d: any[] = []; s.forEach((x: any) => d.push({ id: x.id, ...x.data() })); setVideoStrats(d) }); return () => u() }, [])

  const handleInstall = () => { if (deferredPrompt) { deferredPrompt.prompt(); setDeferredPrompt(null); setShowInstall(false) } }

  const handleSignUp = async () => {
    if (!email || !authPassword || !pseudo) { alert('Remplis tout'); return }
    try {
      const r = await createUserWithEmailAndPassword(auth, email, authPassword)
      await setDoc(doc(db, 'users', r.user.uid), { pseudo, email, createdAt: Date.now(), isAdmin: email === AE })
      await addDoc(collection(db, 'players'), { pseudo, role: 'Joueur', rang: 'Nouveau', userId: r.user.uid, createdAt: Date.now() })
      alert('Compte cree!'); setIsSignUp(false); setEmail(''); setAuthPassword('')
    } catch (e: any) { alert('Erreur: ' + e.message) }
  }

  const handleSignIn = async () => {
    if (!email || !authPassword) { alert('Remplis tout'); return }
    try {
      await setPersistence(auth, browserLocalPersistence)
      await signInWithEmailAndPassword(auth, email, authPassword)
      localStorage.setItem('user-email', email)
      alert('Connecte!'); setEmail(''); setAuthPassword('')
    } catch (e: any) { alert('Erreur: ' + e.message) }
  }

  const handleSignOut = async () => {
    await signOut(auth); setPseudo(''); setIsAdmin(false)
    localStorage.removeItem('dyno-admin'); localStorage.removeItem('user-email')
    setMyPass(null); setAvatarUrl(''); alert('Deconnecte!')
  }

  const handleAdminLogin = () => {
    if (adminPassword === 'dyno2026') { setIsAdmin(true); localStorage.setItem('dyno-admin', 'true'); setAdminPassword('') }
    else alert('Mauvais mdp')
  }

  const handleAdminLogout = () => { setIsAdmin(false); localStorage.removeItem('dyno-admin') }

  const getMatchTimeType = (match: any): 'hc' | 'hp' => {
    const time = match.horaires?.[0] || match.horaire1 || '20:00'
    return isHP(match.date, time) ? 'hp' : 'hc'
  }

  const ajouterMatch = async () => {
    if (!nouveauMatch.adversaire || !nouveauMatch.date || !nouveauMatch.horaire1) { alert('Remplis tout'); return }
    const md: any = { ...nouveauMatch, termine: false, disponibles: [], indisponibles: [], createdAt: Date.now() }
    await addDoc(collection(db, 'matchs'), md)
    addLog('Match vs ' + nouveauMatch.adversaire)
    setNouveauMatch({ adversaire: '', date: '', horaire1: '', horaire2: '', arene: 'Arène 1', type: 'Ligue', sousMatchs: [] })
    alert('Match ajoute!')
  }

  const toggleDispo = async (mid: string) => {
    if (!user) return
    const m = matchs.find((x: any) => x.id === mid)
    if (!m) return
    const d = m.disponibles || []
    const i = m.indisponibles || []
    const isDispo = d.includes(pseudo)
    addLog(isDispo ? 'Retrait dispo' : 'Dispo')
    await updateDoc(doc(db, 'matchs', mid), {
      disponibles: isDispo ? d.filter((p: string) => p !== pseudo) : [...d, pseudo],
      indisponibles: i.filter((p: string) => p !== pseudo)
    })
  }

  const toggleIndispo = async (mid: string) => {
    if (!user) return
    const m = matchs.find((x: any) => x.id === mid)
    if (!m) return
    const d = m.disponibles || []
    const i = m.indisponibles || []
    addLog('Indispo')
    await updateDoc(doc(db, 'matchs', mid), {
      indisponibles: i.includes(pseudo) ? i.filter((p: string) => p !== pseudo) : [...i, pseudo],
      disponibles: d.filter((p: string) => p !== pseudo)
    })
  }

  const fdf = (s: string) => { if (!s) return ''; if (s.includes('/')) return s; const [y, m, d] = s.split('-'); return d + '/' + m + '/' + y }
  
  const victoires = matchs.filter((m: any) => m.termine && (m.scoreDyno || 0) > (m.scoreAdversaire || 0)).length
  const defaites = matchs.filter((m: any) => m.termine && (m.scoreDyno || 0) < (m.scoreAdversaire || 0)).length
  const totalMatchs = victoires + defaites
  const winRate = totalMatchs > 0 ? Math.round((victoires / totalMatchs) * 100) : 0
  const prochainsMatchs = matchs.filter((m: any) => !m.termine).sort((a: any, b: any) => new Date(a.date + 'T' + (a.horaires?.[0] || a.horaire1 || '20:00')).getTime() - new Date(b.date + 'T' + (b.horaires?.[0] || b.horaire1 || '20:00')).getTime())
  const historique = matchs.filter((m: any) => m.termine)
  const ytId = (url: string) => { const m = url.match(/(?:youtube\.com\/(?:[^\\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\\/\s]{11})/); return m ? m[1] : null }
  const hcRem = myPass ? (myPass.hcTotal || 0) - (myPass.hcUsed || 0) : 0
  const hpRem = myPass ? (myPass.hpTotal || 0) - (myPass.hpUsed || 0) : 0

  const H = ({ title, icon }: { title: string; icon?: string }) => (
    <div className="relative rounded-3xl p-7 mb-5 text-center overflow-hidden bg-gradient-to-br from-[#D4AF37]/10 via-[#D4AF37]/5 to-transparent border border-[#D4AF37]/15">
      <img src={LG} alt="D" className="w-14 h-14 mx-auto mb-2 relative z-10" />
      <h2 className="text-lg font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">{icon} {title}</h2>
    </div>
  )

  const menuItems = [
    { t: 'matchs', i: '📅', l: 'Matchs' },
    { t: 'historique', i: '📜', l: 'Historique' },
    { t: 'strats', i: '🎯', l: 'Strats' },
    { t: 'videos', i: '📺', l: 'Videos YT' },
    { t: 'rec', i: '🎬', l: 'Replays' },
    { t: 'roster', i: '👥', l: 'Roster' },
    { t: 'stats', i: '📈', l: 'Stats' },
    { t: 'logs', i: '📋', l: 'Logs' },
    { t: 'admin', i: '⚙️', l: 'Admin' }
  ]

  if (showSplash) return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <P />
      <div className="text-center relative z-10">
        <img src={LG} alt="D" className="w-48 h-48 mx-auto" />
        <h1 className="text-5xl font-bold bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] bg-clip-text text-transparent mt-6">DYNO</h1>
        <p className="text-gray-400 mt-3 uppercase text-sm">Esport Team</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pb-6 relative">
      <P />
      <header className="backdrop-blur-2xl bg-black/30 border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setShowMenu(!showMenu)} className="w-9 h-9 rounded-xl flex items-center justify-center text-lg bg-white/5">☰</button>
            <img src={LG} alt="D" className="w-8 h-8" />
            <div>
              <h1 className="text-base font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">DYNO</h1>
              <p className="text-[8px] text-gray-600">Esport</p>
            </div>
          </div>
          <div className="flex gap-1">
            {user && myPass && <div className="text-[8px] font-bold text-[#D4AF37]">{hcRem}HC {hpRem}HP</div>}
            {user ? <button onClick={handleSignOut} className="px-2 py-1 rounded-xl font-bold text-red-500 text-[10px]">👋</button> : <button onClick={() => setIsSignUp(false)} className="px-2 py-1 rounded-xl text-[#D4AF37] text-[10px]">👤</button>}
          </div>
        </div>
      </header>

      {showMenu && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-64 bg-black border-r border-[#D4AF37]/20 overflow-y-auto">
            <div className="p-5 border-b">
              <h2 className="text-lg font-bold text-[#D4AF37]">DYNO</h2>
            </div>
            <div className="py-3">
              {menuItems.map(({ t, i, l }) => (
                <button key={t} onClick={() => { setActiveTab(t); setShowMenu(false) }} className={`w-full px-5 py-3 flex items-center gap-3 ${activeTab === t ? 'bg-[#D4AF37]/15 text-[#D4AF37] border-r-2 border-[#D4AF37]' : 'text-gray-500'}`}>
                  <span>{i}</span>
                  <span className="text-sm">{l}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setShowMenu(false)} />
        </div>
      )}

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* VIDEOS YOUTUBE */}
        {activeTab === 'videos' && (
          <div>
            <H title="Videos YouTube" icon="📺" />
            <button onClick={() => setShowAddStratVideo(true)} className="w-full mb-3 py-2 rounded-lg font-bold bg-purple-600 text-white text-sm">Nouvelle Strategie</button>
            {user && <button onClick={() => setShowAddVideo(true)} className="w-full mb-5 py-2 rounded-lg font-bold bg-red-600 text-white text-sm">Ajouter Video</button>}
            
            {videoStrats.length === 0 ? (
              <div className="text-center py-10 text-gray-600">Aucune strategie</div>
            ) : (
              <div className="space-y-4">
                {videoStrats.map((s: any) => (
                  <div key={s.id} className="bg-black/30 rounded-xl p-4 border border-[#D4AF37]/15">
                    <div className="flex justify-between mb-3">
                      <div>
                        <p className="font-bold text-[#D4AF37]">{s.nom}</p>
                        <p className="text-[9px] text-gray-600">{s.description}</p>
                      </div>
                      {user?.uid === s.auteurId && <button onClick={() => deleteStratVideo(s.id)} className="text-red-400">🗑️</button>}
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center"><p className="text-lg text-[#D4AF37]">{videos.filter((v: any) => v.stratId === s.id).length}</p><p className="text-[8px]">Videos</p></div>
                      <div className="text-center"><p className="text-lg text-blue-400">{videos.filter((v: any) => v.stratId === s.id && v.status === 'published').length}</p><p className="text-[8px]">Publiees</p></div>
                      <div className="text-center"><p className="text-lg text-gray-400">{videos.filter((v: any) => v.stratId === s.id && v.status === 'draft').length}</p><p className="text-[8px]">Brouillon</p></div>
                    </div>
                    <button onClick={() => setSelectedStratVideo(s)} className="w-full py-2 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] text-xs">Voir Videos</button>
                  </div>
                ))}
              </div>
            )}

            {selectedStratVideo && (
              <div className="mt-6">
                <div className="flex justify-between mb-4">
                  <h3 className="text-[#D4AF37]">{selectedStratVideo.nom}</h3>
                  <button onClick={() => setSelectedStratVideo(null)}>✕</button>
                </div>
                {videos.filter((v: any) => v.stratId === selectedStratVideo.id).length === 0 ? (
                  <p className="text-center text-gray-600">Aucune video</p>
                ) : (
                  <div className="space-y-3">
                    {videos.filter((v: any) => v.stratId === selectedStratVideo.id).map((v: any) => (
                      <div key={v.id} className="bg-black/30 rounded-lg p-3 border border-red-500/15">
                        <div className="flex justify-between mb-2">
                          <p className="text-white text-sm">{v.titre}</p>
                          <button onClick={() => { setEditingVideo(v); setShowAddVideo(true) }} className="text-[#D4AF37] text-xs">✏️</button>
                        </div>
                        <div className="flex gap-2 mb-2">
                          <span className={`text-[8px] px-2 py-0.5 rounded ${v.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20'}`}>{v.status}</span>
                          <span className="text-[8px] bg-white/5 px-2 py-0.5 rounded">{v.category}</span>
                        </div>
                        {v.youtubeUrl && ytIdFromUrl(v.youtubeUrl) && (
                          <div className="relative w-full pb-[56.25%] rounded mb-2 overflow-hidden">
                            <iframe src={`https://www.youtube.com/embed/${ytIdFromUrl(v.youtubeUrl)}`} className="absolute inset-0 w-full h-full" frameBorder="0" allowFullScreen />
                          </div>
                        )}
                        <div className="grid grid-cols-3 gap-2 text-center text-[9px] mb-2">
                          <div className="bg-blue-500/10 p-1 rounded"><p className="text-blue-400">{v.views}</p><p className="text-gray-600">Vues</p></div>
                          <div className="bg-red-500/10 p-1 rounded"><p className="text-red-400">{v.likes}</p><p className="text-gray-600">J'aime</p></div>
                          <div className="bg-green-500/10 p-1 rounded"><p className="text-green-400">{v.comments}</p><p className="text-gray-600">Com</p></div>
                        </div>
                        <button onClick={() => deleteVideo(v.id)} className="w-full text-red-400 text-xs">Supprimer</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {showAddVideo && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-black rounded-lg p-5 w-full max-w-md max-h-[90vh] overflow-y-auto">
                  <h3 className="text-[#D4AF37] font-bold mb-4">{editingVideo ? 'Modifier' : 'Ajouter'} Video</h3>
                  <input type="text" placeholder="Titre" value={editingVideo ? editingVideo.titre : nouvelleVideo.titre} onChange={e => editingVideo ? setEditingVideo({...editingVideo, titre: e.target.value}) : setNouvelleVideo({...nouvelleVideo, titre: e.target.value})} className="w-full bg-white/5 rounded px-3 py-2 mb-2 text-white text-sm" />
                  <textarea placeholder="Description" rows={3} value={editingVideo ? editingVideo.description : nouvelleVideo.description} onChange={e => editingVideo ? setEditingVideo({...editingVideo, description: e.target.value}) : setNouvelleVideo({...nouvelleVideo, description: e.target.value})} className="w-full bg-white/5 rounded px-3 py-2 mb-2 text-white text-sm resize-none" />
                  <select value={editingVideo ? editingVideo.status : nouvelleVideo.status} onChange={e => editingVideo ? setEditingVideo({...editingVideo, status: e.target.value}) : setNouvelleVideo({...nouvelleVideo, status: e.target.value})} className="w-full bg-white/5 rounded px-3 py-2 mb-2 text-white text-sm">
                    <option value="draft">Brouillon</option>
                    <option value="scheduled">Programmee</option>
                    <option value="published">Publiee</option>
                  </select>
                  <input type="url" placeholder="URL YouTube" value={editingVideo ? editingVideo.youtubeUrl : nouvelleVideo.youtubeUrl} onChange={e => editingVideo ? setEditingVideo({...editingVideo, youtubeUrl: e.target.value}) : setNouvelleVideo({...nouvelleVideo, youtubeUrl: e.target.value})} className="w-full bg-white/5 rounded px-3 py-2 mb-2 text-white text-sm" />
                  <input type="text" placeholder="Tags (virgules)" value={editingVideo ? (typeof editingVideo.tags === 'string' ? editingVideo.tags : editingVideo.tags.join(', ')) : nouvelleVideo.tags} onChange={e => editingVideo ? setEditingVideo({...editingVideo, tags: e.target.value}) : setNouvelleVideo({...nouvelleVideo, tags: e.target.value})} className="w-full bg-white/5 rounded px-3 py-2 mb-2 text-white text-sm" />
                  <input type="number" placeholder="Vues" value={editingVideo ? editingVideo.views : nouvelleVideo.views} onChange={e => editingVideo ? setEditingVideo({...editingVideo, views: parseInt(e.target.value) || 0}) : setNouvelleVideo({...nouvelleVideo, views: parseInt(e.target.value) || 0})} className="w-full bg-white/5 rounded px-3 py-2 mb-4 text-white text-sm" />
                  <div className="flex gap-2">
                    <button onClick={() => { setShowAddVideo(false); setEditingVideo(null) }} className="flex-1 py-2 rounded bg-white/5 text-gray-500 text-sm">Annuler</button>
                    <button onClick={editingVideo ? updateVideo : ajouterVideo} className="flex-1 py-2 rounded bg-red-600 text-white text-sm font-bold">OK</button>
                  </div>
                </div>
              </div>
            )}

            {showAddStratVideo && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-black rounded-lg p-5 w-full max-w-md">
                  <h3 className="text-purple-400 font-bold mb-4">Nouvelle Strategie</h3>
                  <input type="text" placeholder="Nom" value={nouvelleStratVideo.nom} onChange={e => setNouvelleStratVideo({...nouvelleStratVideo, nom: e.target.value})} className="w-full bg-white/5 rounded px-3 py-2 mb-2 text-white text-sm" />
                  <textarea placeholder="Description" rows={2} value={nouvelleStratVideo.description} onChange={e => setNouvelleStratVideo({...nouvelleStratVideo, description: e.target.value})} className="w-full bg-white/5 rounded px-3 py-2 mb-2 text-white text-sm resize-none" />
                  <input type="text" placeholder="Objectif" value={nouvelleStratVideo.goal} onChange={e => setNouvelleStratVideo({...nouvelleStratVideo, goal: e.target.value})} className="w-full bg-white/5 rounded px-3 py-2 mb-2 text-white text-sm" />
                  <input type="text" placeholder="Audience" value={nouvelleStratVideo.targetAudience} onChange={e => setNouvelleStratVideo({...nouvelleStratVideo, targetAudience: e.target.value})} className="w-full bg-white/5 rounded px-3 py-2 mb-2 text-white text-sm" />
                  <input type="text" placeholder="Types (virgules)" value={nouvelleStratVideo.contentTypes} onChange={e => setNouvelleStratVideo({...nouvelleStratVideo, contentTypes: e.target.value})} className="w-full bg-white/5 rounded px-3 py-2 mb-4 text-white text-sm" />
                  <div className="flex gap-2">
                    <button onClick={() => { setShowAddStratVideo(false); setNouvelleStratVideo({ nom: '', description: '', goal: '', targetAudience: '', uploadFrequency: '1 par semaine', contentTypes: '' }) }} className="flex-1 py-2 rounded bg-white/5 text-gray-500 text-sm">Annuler</button>
                    <button onClick={ajouterStratVideo} className="flex-1 py-2 rounded bg-purple-600 text-white text-sm font-bold">OK</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MATCHS */}
        {activeTab === 'matchs' && (
          <div>
            <H title="Prochains Matchs" />
            {loading ? <div>Chargement...</div> : prochainsMatchs.length === 0 ? <div className="text-center py-10 text-gray-600">Aucun match</div> : (
              <div className="space-y-3">
                {prochainsMatchs.map((match: any) => (
                  <div key={match.id} className="bg-black/30 rounded-lg p-4 border border-[#D4AF37]/15">
                    <div className="flex justify-between mb-2">
                      <span className="text-[9px] px-2 py-1 rounded bg-blue-500/20 text-blue-400">{match.type}</span>
                      <span className="text-[#D4AF37] text-sm">{fdf(match.date)}</span>
                    </div>
                    <p className="font-bold text-white mb-3">DYNO vs {match.adversaire}</p>
                    <div className="flex gap-2">
                      <button onClick={() => toggleDispo(match.id)} disabled={!user} className="flex-1 py-2 rounded bg-white/5 text-white text-xs">{user ? 'Dispo' : '🔐'}</button>
                      <button onClick={() => toggleIndispo(match.id)} disabled={!user} className="flex-1 py-2 rounded bg-red-500/10 text-red-400 text-xs">{user ? 'Indispo' : '🔐'}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {isAdmin && (
              <div className="mt-6 bg-black/30 rounded-lg p-4 border border-[#D4AF37]/15">
                <h3 className="text-[#D4AF37] font-bold mb-3">Ajouter Match</h3>
                <input type="text" placeholder="Adversaire" value={nouveauMatch.adversaire} onChange={e => setNouveauMatch({...nouveauMatch, adversaire: e.target.value})} className="w-full bg-white/5 rounded px-3 py-2 mb-2 text-white text-sm" />
                <input type="date" value={nouveauMatch.date} onChange={e => setNouveauMatch({...nouveauMatch, date: e.target.value})} className="w-full bg-white/5 rounded px-3 py-2 mb-2 text-white text-sm" />
                <input type="time" value={nouveauMatch.horaire1} onChange={e => setNouveauMatch({...nouveauMatch, horaire1: e.target.value})} className="w-full bg-white/5 rounded px-3 py-2 mb-4 text-white text-sm" />
                <button onClick={ajouterMatch} className="w-full py-2 rounded bg-[#D4AF37] text-black font-bold text-sm">Creer</button>
              </div>
            )}
          </div>
        )}

        {/* HISTORIQUE */}
        {activeTab === 'historique' && (
          <div>
            <H title="Historique" />
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-[#D4AF37]/10 rounded-lg p-3 text-center border border-[#D4AF37]/15">
                <p className="text-3xl font-bold text-[#D4AF37]">{victoires}</p>
                <p className="text-[9px] text-gray-600">Victoires</p>
              </div>
              <div className="bg-red-500/10 rounded-lg p-3 text-center border border-red-500/15">
                <p className="text-3xl font-bold text-red-500">{defaites}</p>
                <p className="text-[9px] text-gray-600">Defaites</p>
              </div>
            </div>
            {historique.length === 0 ? <div className="text-center py-10 text-gray-600">Aucun resultat</div> : (
              <div className="space-y-3">
                {historique.map((match: any) => (
                  <div key={match.id} className="bg-black/30 rounded-lg p-3 border border-[#D4AF37]/15">
                    <div className="flex justify-between mb-2">
                      <span className={`text-[9px] px-2 py-1 rounded ${(match.scoreDyno || 0) > (match.scoreAdversaire || 0) ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-red-500/20 text-red-400'}`}>
                        {(match.scoreDyno || 0) > (match.scoreAdversaire || 0) ? 'WIN' : 'LOSS'}
                      </span>
                      <span className="text-gray-600 text-[9px]">{fdf(match.date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-white"><span className="text-[#D4AF37] font-bold">{match.scoreDyno}</span> DYNO</p>
                      <p className="text-gray-500"><span className="text-white font-bold">{match.scoreAdversaire}</span> {match.adversaire}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STRATS */}
        {activeTab === 'strats' && (
          <div>
            <H title="Strategies" icon="🎯" />
            {strats.length === 0 ? <div className="text-center py-10 text-gray-600">Aucune</div> : (
              <div className="space-y-3">
                {strats.map((s: any) => (
                  <div key={s.id} className="bg-black/30 rounded-lg p-3 border border-[#D4AF37]/15">
                    <p className="font-bold text-[#D4AF37] mb-2">vs {s.adversaire}</p>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <p className="text-[8px] text-green-400 mb-1">Picks</p>
                        <div className="flex gap-1">{s.picks?.map((p: string, i: number) => <span key={i} className="text-[7px] bg-green-500/15 text-green-400 px-1.5 py-0.5 rounded">{p}</span>)}</div>
                      </div>
                      <div className="flex-1">
                        <p className="text-[8px] text-red-400 mb-1">Bans</p>
                        <div className="flex gap-1">{s.bans?.map((b: string, i: number) => <span key={i} className="text-[7px] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded">{b}</span>)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ROSTER */}
        {activeTab === 'roster' && (
          <div>
            <H title="Roster" icon="👥" />
            {joueurs.filter((j: any) => j.actif !== false).length === 0 ? <div className="text-center py-10 text-gray-600">Aucun joueur</div> : (
              <div className="space-y-2">
                {joueurs.filter((j: any) => j.actif !== false).map((j: any) => (
                  <div key={j.id} className="bg-black/30 rounded-lg p-3 border border-[#D4AF37]/15 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold">{j.pseudo[0]?.toUpperCase()}</div>
                    <div>
                      <p className="font-bold text-white">{j.pseudo}</p>
                      <p className="text-[10px] text-gray-600">{j.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STATS */}
        {activeTab === 'stats' && (
          <div>
            <H title="Stats" icon="📈" />
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#D4AF37]/10 rounded-lg p-4 border border-[#D4AF37]/15 text-center">
                <p className="text-3xl font-bold text-[#D4AF37]">{winRate}%</p>
                <p className="text-[9px] text-gray-600">Win Rate</p>
              </div>
              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/15 text-center">
                <p className="text-3xl font-bold text-blue-400">{totalMatchs}</p>
                <p className="text-[9px] text-gray-600">Matchs</p>
              </div>
            </div>
          </div>
        )}

        {/* LOGS */}
        {activeTab === 'logs' && (
          <div>
            <H title="Logs" icon="📋" />
            {logs.length === 0 ? <div className="text-center py-10 text-gray-600">Aucune activite</div> : (
              <div className="space-y-2">
                {logs.slice(0, 20).map((l: any) => (
                  <div key={l.id} className="bg-white/5 rounded-lg p-3">
                    <p className="text-white text-xs"><span className="text-[#D4AF37] font-bold">{l.joueur}</span> {l.action}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADMIN */}
        {activeTab === 'admin' && (
          <div>
            <H title="Admin" icon="⚙️" />
            {!isAdmin ? (
              <div className="bg-black/30 rounded-lg p-5">
                <input type="password" placeholder="Mot de passe" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full bg-white/5 rounded px-4 py-2 mb-3 text-white text-sm" />
                <button onClick={handleAdminLogin} className="w-full py-2 rounded bg-[#D4AF37] text-black font-bold">Connexion</button>
              </div>
            ) : (
              <button onClick={handleAdminLogout} className="w-full py-2 rounded bg-red-600 text-white font-bold">Deconnexion</button>
            )}
          </div>
        )}

        {/* REPLAYS */}
        {activeTab === 'rec' && (
          <div>
            <H title="Replays" icon="🎬" />
            {replays.length === 0 ? <div className="text-center py-10 text-gray-600">Aucun replay</div> : (
              <div className="space-y-3">
                {replays.slice(0, 5).map((r: any) => (
                  <div key={r.id} className="bg-black/30 rounded-lg p-3 border border-[#D4AF37]/15">
                    <p className="font-bold text-[#D4AF37] mb-2">{r.titre}</p>
                    {ytId(r.lien) ? (
                      <div className="relative w-full pb-[56.25%] rounded overflow-hidden">
                        <iframe src={`https://www.youtube.com/embed/${ytId(r.lien)}`} className="absolute inset-0 w-full h-full" frameBorder="0" allowFullScreen />
                      </div>
                    ) : (
                      <a href={r.lien} target="_blank" className="block py-2 rounded bg-[#D4AF37] text-black text-center font-bold">▶️</a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* LOGIN */}
      {!user && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <P />
          <div className="bg-black rounded-lg p-7 w-full max-w-sm border border-[#D4AF37]/20 relative z-10">
            <img src={LG} alt="D" className="w-20 h-20 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-[#D4AF37] text-center mb-6">{isSignUp ? 'REJOINDRE' : 'ACCES'}</h3>
            {isSignUp && <input type="text" placeholder="Pseudo" value={pseudo} onChange={e => setPseudo(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 mb-3 text-white text-sm" />}
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 mb-3 text-white text-sm" />
            <input type="password" placeholder="Mot de passe" value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 mb-6 text-white text-sm" />
            {isSignUp ? (
              <button onClick={handleSignUp} className="w-full py-4 rounded-lg font-bold bg-[#D4AF37] text-black mb-4">CREER</button>
            ) : (
              <button onClick={handleSignIn} className="w-full py-4 rounded-lg font-bold bg-[#D4AF37] text-black mb-4">CONNEXION</button>
            )}
            <button onClick={() => setIsSignUp(!isSignUp)} className="w-full text-[#D4AF37] text-[10px] font-bold">{isSignUp ? 'CONNEXION' : 'CREER'}</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App