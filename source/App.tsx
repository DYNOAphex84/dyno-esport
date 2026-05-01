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
const DW_VIDEOS = 'https://discord.com/api/webhooks/1499033761914814566/k6-FPqkt-9raiw-FR9Gb2rSHqYr3NXzf52mmWYk4Y9aNwR0kSm0kpRC5UuDph9gc-FAd'
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

interface StratVideo {
  id: string
  titre: string
  description: string
  youtubeUrl: string
  youtubeId: string
  jeu: string
  map: string
  categorie: 'strat' | 'tutorial' | 'highlight' | 'replay' | 'scrim'
  tags: string[]
  auteur: string
  auteurId: string
  vues: number
  likes: string[]
  publie: boolean
  createdAt: number
}

const extractYoutubeId = (url: string): string => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?#\s]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return ''
}

const CATS = [
  { v: 'strat', l: 'Strategie', i: '🎯' },
  { v: 'tutorial', l: 'Tutoriel', i: '📚' },
  { v: 'highlight', l: 'Highlight', i: '⭐' },
  { v: 'replay', l: 'Replay', i: '🎬' },
  { v: 'scrim', l: 'Scrim', i: '⚔️' },
]

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
  const [stratVideos, setStratVideos] = useState<StratVideo[]>([])
  const [showAddVideo, setShowAddVideo] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<StratVideo | null>(null)
  const [videoFilter, setVideoFilter] = useState<'all' | 'strat' | 'tutorial' | 'highlight' | 'replay' | 'scrim'>('all')
  const [videoSearch, setVideoSearch] = useState('')
  const [newVideo, setNewVideo] = useState({
    titre: '', description: '', youtubeUrl: '',
    jeu: 'EVA Esport Arena', map: '', categorie: 'strat' as StratVideo['categorie'],
    tags: '', publie: true
  })
  const [videoYtId, setVideoYtId] = useState('')
  const [videoStep, setVideoStep] = useState<'form' | 'preview' | 'publishing' | 'done'>('form')
  const [playerLoaded, setPlayerLoaded] = useState(false)
  const [killSessions, setKillSessions] = useState<any[]>([])
  const [showNewSession, setShowNewSession] = useState(false)
  const [currentSession, setCurrentSession] = useState<any>(null)
  const [killSessionUrl, setKillSessionUrl] = useState('')
  const [killSessionTitle, setKillSessionTitle] = useState('')
  const [killPlayer, setKillPlayer] = useState('')
  const [killList, setKillList] = useState<any[]>([])
  const [killType, setKillType] = useState('kill')
  const [ytReady, setYtReady] = useState(false)
  const [ytPlayer, setYtPlayer] = useState<any>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const timeInterval = useRef<any>(null)
  const pm = useRef(0), pn = useRef(0), pc = useRef(0), ps = useRef(0), pi = useRef(0), ty = useRef(0)

  const addLog = async (action: string) => {
    if (!user) return
    try { await addDoc(collection(db, 'logs'), { joueur: pseudo, joueurId: user.uid, action, createdAt: Date.now() }) } catch {}
  }

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const maxSize = 400
          let width = img.width, height = img.height
          if (width > height) { if (width > maxSize) { height = (height * maxSize) / width; width = maxSize } }
          else { if (height > maxSize) { width = (width * maxSize) / height; height = maxSize } }
          canvas.width = width; canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', 0.7))
        }
        img.onerror = reject
        img.src = event.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleAvatarUpload = async (e: any) => {
    if (!user || !e.target.files?.[0]) return
    setUploadingAvatar(true)
    try {
      const compressed = await compressImage(e.target.files[0])
      setAvatarUrl(compressed)
      await updateDoc(doc(db, 'users', user.uid), { avatarUrl: compressed })
      addLog('Photo de profil mise a jour')
      alert('Photo enregistree !')
    } catch (err: any) { alert('Erreur : ' + err.message) }
    finally { setUploadingAvatar(false) }
  }

  const saveAvatar = async () => {
    if (!user || !avatarUrl) return
    await updateDoc(doc(db, 'users', user.uid), { avatarUrl })
    addLog('Avatar URL mis a jour')
    alert('URL enregistree !')
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
      if (!('Notification' in window)) { alert('Non supporte'); return }
      const p = await Notification.requestPermission()
      if (p === 'granted') { setNotificationsEnabled(true); localStorage.setItem('dyno-notifs', 'true'); alert('Notifs activees !') }
      else { setNotificationsEnabled(false); localStorage.setItem('dyno-notifs', 'false'); alert('Refuse') }
    } catch { alert('Erreur') }
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
          sendNotification('Match demain !', 'DYNO vs ' + m.adversaire + ' dans 24h !', 'm24h')
          const u = [...notifiedMatchs, k1]; setNotifiedMatchs(u); localStorage.setItem('dyno-notified', JSON.stringify(u))
        }
        const k2 = m.id + '-1h'
        if (dm > 55 && dm <= 65 && !notifiedMatchs.includes(k2)) {
          sendNotification('Match dans 1h !', 'DYNO vs ' + m.adversaire, 'm1h')
          const u = [...notifiedMatchs, k2]; setNotifiedMatchs(u); localStorage.setItem('dyno-notified', JSON.stringify(u))
        }
        const k3 = m.id + '-15m'
        if (dm > 10 && dm <= 20 && !notifiedMatchs.includes(k3)) {
          sendNotification('Match dans 15min !', 'DYNO vs ' + m.adversaire, 'm15')
          const u = [...notifiedMatchs, k3]; setNotifiedMatchs(u); localStorage.setItem('dyno-notified', JSON.stringify(u))
        }
        const k4 = m.id + '-now'
        if (dm >= -2 && dm <= 3 && !notifiedMatchs.includes(k4)) {
          sendNotification('EN COURS !', 'DYNO vs ' + m.adversaire, 'mnow')
          const u = [...notifiedMatchs, k4]; setNotifiedMatchs(u); localStorage.setItem('dyno-notified', JSON.stringify(u))
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
  useEffect(() => { const q = query(collection(db, 'stratVideos'), orderBy('createdAt', 'desc')); const u = onSnapshot(q, (s: any) => { const d: StratVideo[] = []; s.forEach((x: any) => d.push({ id: x.id, ...x.data() } as StratVideo)); setStratVideos(d) }); return () => u() }, [])
  useEffect(() => { const q = query(collection(db, 'killSessions'), orderBy('createdAt', 'desc')); const u = onSnapshot(q, (s: any) => { const d: any[] = []; s.forEach((x: any) => d.push({ id: x.id, ...x.data() })); setKillSessions(d) }); return () => u() }, [])

  useEffect(() => { if (!notificationsEnabled || pm.current === 0) { pm.current = matchs.length; return }; if (matchs.length > pm.current) { const n = matchs[0]; if (n) sendNotification('Nouveau match !', 'DYNO vs ' + n.adversaire, 'nm') }; pm.current = matchs.length }, [matchs, notificationsEnabled, sendNotification])
  useEffect(() => { if (!notificationsEnabled || pn.current === 0) { pn.current = notes.length; return }; if (notes.length > pn.current) { const n = notes[0]; if (n) sendNotification('Nouvelle note !', n.joueur + ' a note un match', 'nn') }; pn.current = notes.length }, [notes, notificationsEnabled, sendNotification])
  useEffect(() => { if (!notificationsEnabled || pc.current === 0) { pc.current = commentaires.length; return }; if (commentaires.length > pc.current) { const n = commentaires[0]; if (n) sendNotification('Nouveau commentaire !', n.joueur + ': ' + n.texte.substring(0, 50), 'nc') }; pc.current = commentaires.length }, [commentaires, notificationsEnabled, sendNotification])
  useEffect(() => { if (!notificationsEnabled || ps.current === 0) { ps.current = strats.length; return }; if (strats.length > ps.current) { const n = strats[0]; if (n) sendNotification('Nouvelle strat !', 'vs ' + n.adversaire, 'ns') }; ps.current = strats.length }, [strats, notificationsEnabled, sendNotification])
  useEffect(() => { if (!notificationsEnabled || pi.current === 0) { pi.current = idees.length; return }; if (idees.length > pi.current) { const n = idees[0]; if (n) sendNotification('Nouvelle idee !', n.joueur + ': ' + n.texte?.substring(0, 50), 'ni') }; pi.current = idees.length }, [idees, notificationsEnabled, sendNotification])
  useEffect(() => { const t = setTimeout(() => setShowSplash(false), 2500); return () => clearTimeout(t) }, [])
  useEffect(() => { window.addEventListener('beforeinstallprompt', (e: any) => { e.preventDefault(); setDeferredPrompt(e); setShowInstall(true) }) }, [])

  const handleInstall = () => { if (deferredPrompt) { deferredPrompt.prompt(); setDeferredPrompt(null); setShowInstall(false) } }

  const handleSignUp = async () => {
    if (!email || !authPassword || !pseudo) { alert('Remplis tout !'); return }
    try {
      const r = await createUserWithEmailAndPassword(auth, email, authPassword)
      await setDoc(doc(db, 'users', r.user.uid), { pseudo, email, createdAt: Date.now(), isAdmin: email === AE })
      await addDoc(collection(db, 'players'), { pseudo, role: 'Joueur', rang: 'Nouveau', userId: r.user.uid, createdAt: Date.now() })
      alert('Compte cree !'); setIsSignUp(false); setEmail(''); setAuthPassword('')
    } catch (e: any) { alert(e.message) }
  }

  const handleSignIn = async () => {
    if (!email || !authPassword) { alert('Remplis tout !'); return }
    try {
      await setPersistence(auth, browserLocalPersistence)
      await signInWithEmailAndPassword(auth, email, authPassword)
      localStorage.setItem('user-email', email)
      alert('Connecte !'); setEmail(''); setAuthPassword('')
    } catch (e: any) { alert(e.message) }
  }

  const handleSignOut = async () => {
    await signOut(auth); setPseudo(''); setIsAdmin(false)
    localStorage.removeItem('dyno-admin'); localStorage.removeItem('user-email')
    setMyPass(null); setAvatarUrl(''); alert('Deconnecte !')
  }

  const handleAdminLogin = () => {
    if (adminPassword === 'dyno2026') { setIsAdmin(true); localStorage.setItem('dyno-admin', 'true'); setAdminPassword('') }
    else alert('Mot de passe incorrect !')
  }

  const handleAdminLogout = () => { setIsAdmin(false); localStorage.removeItem('dyno-admin') }

  const selectPass = async (type: string) => {
    if (!user) return
    const pd = EVA_PASSES[type]; if (!pd) return
    const passData = { type, hcTotal: pd.hc, hpTotal: pd.hp, hcUsed: 0, hpUsed: 0, dateReset: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] }
    await updateDoc(doc(db, 'users', user.uid), { evaPass: passData })
    setMyPass(passData); addLog('Pass ' + pd.label); alert('Pass active !')
  }

  const getMatchTimeType = (match: any): 'hc' | 'hp' => {
    const time = match.horaires?.[0] || match.horaire1 || '20:00'
    return isHP(match.date, time) ? 'hp' : 'hc'
  }

  const ajouterSousMatch = () => { const adv = prompt('Adversaire :'); if (!adv) return; const sd = prompt('Score DYNO :'); if (!sd) return; const sa = prompt('Score ' + adv + ' :'); if (!sa) return; setNouveauMatch({ ...nouveauMatch, sousMatchs: [...nouveauMatch.sousMatchs, { adversaire: adv, scoreDyno: sd, scoreAdv: sa }] }) }
  const supprimerSousMatch = (i: number) => { const sm = [...nouveauMatch.sousMatchs]; sm.splice(i, 1); setNouveauMatch({ ...nouveauMatch, sousMatchs: sm }) }
  const ajouterEditSousMatch = () => { if (!editHistoriqueScore) return; const adv = prompt('Adversaire :'); if (!adv) return; const sd = prompt('Score DYNO :'); if (!sd) return; const sa = prompt('Score ' + adv + ' :'); if (!sa) return; setEditHistoriqueScore({ ...editHistoriqueScore, sousMatchs: [...(editHistoriqueScore.sousMatchs || []), { adversaire: adv, scoreDyno: sd, scoreAdv: sa }] }) }
  const supprimerEditSousMatch = (i: number) => { if (!editHistoriqueScore) return; const sm = [...(editHistoriqueScore.sousMatchs || [])]; sm.splice(i, 1); setEditHistoriqueScore({ ...editHistoriqueScore, sousMatchs: sm }) }

  const ajouterMatch = async () => {
    if (!nouveauMatch.adversaire || !nouveauMatch.date || !nouveauMatch.horaire1) { alert('Remplis les champs !'); return }
    const md: any = { ...nouveauMatch, termine: false, disponibles: [], indisponibles: [], createdAt: Date.now() }
    if (nouveauMatch.type === 'Division' && nouveauMatch.sousMatchs.length > 0) {
      md.termine = true; md.sousMatchs = nouveauMatch.sousMatchs
      md.scoreDyno = nouveauMatch.sousMatchs.reduce((a: number, s: any) => a + parseInt(s.scoreDyno || '0'), 0)
      md.scoreAdversaire = nouveauMatch.sousMatchs.reduce((a: number, s: any) => a + parseInt(s.scoreAdv || '0'), 0)
    }
    await addDoc(collection(db, 'matchs'), md)
    addLog('Match vs ' + nouveauMatch.adversaire)
    const h = [nouveauMatch.horaire1]; if (nouveauMatch.horaire2) h.push(nouveauMatch.horaire2)
    try { await fetch(DW, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ embeds: [{ title: 'DYNO vs ' + nouveauMatch.adversaire, color: 13934871, fields: [{ name: 'Adversaire', value: nouveauMatch.adversaire, inline: true }, { name: 'Date', value: nouveauMatch.date, inline: true }, { name: 'Horaire', value: h.join(' / '), inline: true }, { name: 'Arene', value: nouveauMatch.arene, inline: true }, { name: 'Type', value: nouveauMatch.type, inline: true }], footer: { text: 'DYNO Esport', icon_url: LG } }] }) }) } catch {}
    setNouveauMatch({ adversaire: '', date: '', horaire1: '', horaire2: '', arene: 'Arène 1', type: 'Ligue', sousMatchs: [] })
    alert('Match ajoute !')
  }

  const ajouterReplay = async () => { if (!nouveauReplay.titre || !nouveauReplay.lien) { alert('Remplis !'); return }; await addDoc(collection(db, 'replays'), { ...nouveauReplay, createdAt: Date.now() }); addLog('Replay: ' + nouveauReplay.titre); setNouveauReplay({ titre: '', lien: '' }); alert('OK !') }
  const ajouterNote = async () => { if (!user) return; await addDoc(collection(db, 'notes'), { matchId: selectedMatchForNotes?.id, joueur: pseudo, joueurId: user.uid, mental: nouvelleNote.mental, communication: nouvelleNote.communication, gameplay: nouvelleNote.gameplay, createdAt: Date.now() }); addLog('Note'); setNouvelleNote({ matchId: '', mental: '', communication: '', gameplay: '' }); setSelectedMatchForNotes(null); alert('OK !') }
  const ajouterCommentaire = async (id: string) => { if (!user || !nouveauCommentaire.trim()) return; await addDoc(collection(db, 'commentaires'), { matchId: id, joueur: pseudo, joueurId: user.uid, texte: nouveauCommentaire.trim(), createdAt: Date.now() }); addLog('Commentaire'); setNouveauCommentaire(''); setSelectedMatchForComment(null); alert('OK !') }
  const ajouterStrat = async () => { if (!nouvelleStrat.adversaire || nouvelleStrat.picks.length === 0 || nouvelleStrat.bans.length === 0) { alert('Remplis !'); return }; await addDoc(collection(db, 'strats'), { adversaire: nouvelleStrat.adversaire, picks: nouvelleStrat.picks, bans: nouvelleStrat.bans, auteur: pseudo || 'Anonyme', auteurId: user?.uid || null, createdAt: Date.now() }); addLog('Strat vs ' + nouvelleStrat.adversaire); setNouvelleStrat({ adversaire: '', picks: [], bans: [] }); setShowAddStrat(false); alert('OK !') }
  const ajouterCompo = async () => { if (!selectedMapCompo || compoJoueurs.length === 0) { alert('Remplis !'); return }; const ex = compos.find((c: any) => c.map === selectedMapCompo); if (ex) { await updateDoc(doc(db, 'compos', ex.id), { joueurs: compoJoueurs, updatedAt: Date.now() }) } else { await addDoc(collection(db, 'compos'), { map: selectedMapCompo, joueurs: compoJoueurs, auteur: pseudo, createdAt: Date.now() }) }; addLog('Compo ' + selectedMapCompo); setShowAddCompo(false); setSelectedMapCompo(''); setCompoJoueurs([]); alert('OK !') }
  const toggleCompoJoueur = (n: string) => { if (compoJoueurs.includes(n)) setCompoJoueurs(compoJoueurs.filter(j => j !== n)); else setCompoJoueurs([...compoJoueurs, n]) }
  const sauvegarderAnniversaire = async () => { if (!user || !anniversaire) return; await updateDoc(doc(db, 'users', user.uid), { anniversaire }); alert('OK !') }

  const ajouterIdee = async () => {
    if (!user || !nouvelleIdee.trim()) return
    await addDoc(collection(db, 'idees'), { texte: nouvelleIdee.trim(), joueur: pseudo, joueurId: user.uid, votes: {}, ideaComments: [], createdAt: Date.now() })
    try { await fetch(DW_IDEES, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ embeds: [{ title: 'Nouvelle idee !', description: nouvelleIdee.trim(), color: 16766720, fields: [{ name: 'Par', value: pseudo, inline: true }], footer: { text: 'DYNO Esport', icon_url: LG } }] }) }) } catch {}
    addLog('Idee: ' + nouvelleIdee.trim()); setNouvelleIdee(''); alert('Idee ajoutee !')
  }

  const voterIdee = async (ideeId: string, vote: string) => { if (!user) return; const idee = idees.find((i: any) => i.id === ideeId); if (!idee) return; const votes = { ...(idee.votes || {}) }; if (votes[user.uid] === vote) delete votes[user.uid]; else votes[user.uid] = vote; await updateDoc(doc(db, 'idees', ideeId), { votes }) }
  const commenterIdee = async (ideeId: string, commentInput: HTMLInputElement) => { if (!user || !commentInput?.value.trim()) return; const idee = idees.find((i: any) => i.id === ideeId); if (!idee) return; const nc = [...(idee.ideaComments || []), { joueur: pseudo, joueurId: user.uid, texte: commentInput.value.trim(), createdAt: Date.now() }]; await updateDoc(doc(db, 'idees', ideeId), { ideaComments: nc }); commentInput.value = '' }
  const ajouterAnalyse = async (mid: string) => { if (!user) return; await addDoc(collection(db, 'analyses'), { matchId: mid, joueur: pseudo, joueurId: user.uid, ...nouvelleAnalyse, createdAt: Date.now() }); addLog('Analyse'); setNouvelleAnalyse({ bien: '', mal: '', plan: '' }); setSelectedMatchForAnalyse(null); alert('OK !') }
  const ajouterFiche = async () => { if (!nouvelleFiche.adversaire.trim()) return; await addDoc(collection(db, 'fichesAdversaires'), { ...nouvelleFiche, auteur: pseudo, auteurId: user?.uid, createdAt: Date.now() }); addLog('Fiche: ' + nouvelleFiche.adversaire); setNouvelleFiche({ adversaire: '', forces: '', faiblesses: '', notes: '' }); setShowAddFiche(false); alert('OK !') }
  const del = async (col: string, id: string) => { await deleteDoc(doc(db, col, id)); addLog('Suppression ' + col) }
  const updateScore = async () => { if (!scoreEdit) return; await updateDoc(doc(db, 'matchs', scoreEdit.id), { scoreDyno: parseInt(scoreEdit.scoreDyno), scoreAdversaire: parseInt(scoreEdit.scoreAdv), termine: true }); addLog('Score'); setScoreEdit(null); alert('OK !') }
  const updateHistoriqueScore = async () => { if (!editHistoriqueScore) return; const ud: any = { adversaire: editHistoriqueScore.adversaire, type: editHistoriqueScore.type, arene: editHistoriqueScore.arene, date: editHistoriqueScore.date, termine: editHistoriqueScore.termine !== false }; if (editHistoriqueScore.type === 'Division' && editHistoriqueScore.sousMatchs?.length > 0) { ud.sousMatchs = editHistoriqueScore.sousMatchs; ud.scoreDyno = editHistoriqueScore.sousMatchs.reduce((a: number, s: any) => a + parseInt(s.scoreDyno || '0'), 0); ud.scoreAdversaire = editHistoriqueScore.sousMatchs.reduce((a: number, s: any) => a + parseInt(s.scoreAdv || '0'), 0) } else { ud.scoreDyno = parseInt(editHistoriqueScore.scoreDyno); ud.scoreAdversaire = parseInt(editHistoriqueScore.scoreAdv); if (editHistoriqueScore.type !== 'Division') ud.sousMatchs = [] }; await updateDoc(doc(db, 'matchs', editHistoriqueScore.id), ud); addLog('Match modifie'); setEditHistoriqueScore(null); alert('OK !') }

  const toggleDispo = async (mid: string) => { if (!user) return; const m = matchs.find((x: any) => x.id === mid); if (!m) return; const d = m.disponibles || []; const i = m.indisponibles || []; const isDispo = d.includes(pseudo); if (!isDispo && myPass) { const tt = getMatchTimeType(m); const uk = tt === 'hp' ? 'hpUsed' : 'hcUsed'; const tk = tt === 'hp' ? 'hpTotal' : 'hcTotal'; const rem = (myPass[tk] || 0) - (myPass[uk] || 0); if (rem < 2) alert('Plus que ' + rem + ' jeton(s) !'); const np = { ...myPass, [uk]: (myPass[uk] || 0) + 2 }; setMyPass(np); await updateDoc(doc(db, 'users', user.uid), { evaPass: np }) } else if (isDispo && myPass) { const tt = getMatchTimeType(m); const uk = tt === 'hp' ? 'hpUsed' : 'hcUsed'; const np = { ...myPass, [uk]: Math.max(0, (myPass[uk] || 0) - 2) }; setMyPass(np); await updateDoc(doc(db, 'users', user.uid), { evaPass: np }) }; addLog(isDispo ? 'Retrait dispo: ' + m.adversaire : 'Dispo: ' + m.adversaire); await updateDoc(doc(db, 'matchs', mid), { disponibles: isDispo ? d.filter((p: string) => p !== pseudo) : [...d, pseudo], indisponibles: i.filter((p: string) => p !== pseudo) }) }
  const toggleIndispo = async (mid: string) => { if (!user) return; const m = matchs.find((x: any) => x.id === mid); if (!m) return; const d = m.disponibles || []; const i = m.indisponibles || []; if (d.includes(pseudo) && myPass) { const tt = getMatchTimeType(m); const uk = tt === 'hp' ? 'hpUsed' : 'hcUsed'; const np = { ...myPass, [uk]: Math.max(0, (myPass[uk] || 0) - 2) }; setMyPass(np); await updateDoc(doc(db, 'users', user.uid), { evaPass: np }) }; addLog('Indispo: ' + m.adversaire); await updateDoc(doc(db, 'matchs', mid), { indisponibles: i.includes(pseudo) ? i.filter((p: string) => p !== pseudo) : [...i, pseudo], disponibles: d.filter((p: string) => p !== pseudo) }) }

  const fdf = (s: string) => { if (!s) return ''; if (s.includes('/')) return s; const [y, m, d] = s.split('-'); return d + '/' + m + '/' + y }
  const fts = (t: number) => { const d = new Date(t); return d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }
  const hts = (e: React.TouchEvent) => { ty.current = e.touches[0].clientY }
  const htm = (e: React.TouchEvent) => { if (window.scrollY > 0) return; const d = e.touches[0].clientY - ty.current; if (d > 0) setPullDistance(Math.min(d * 0.4, 80)) }
  const hte = () => { if (pullDistance > 60) { setIsRefreshing(true); setTimeout(() => window.location.reload(), 500) }; setPullDistance(0) }
  const toggleMap = (map: string, type: 'picks' | 'bans') => { if (type === 'picks') { if (nouvelleStrat.picks.includes(map)) setNouvelleStrat({ ...nouvelleStrat, picks: nouvelleStrat.picks.filter(m => m !== map) }); else if (nouvelleStrat.picks.length < 4) setNouvelleStrat({ ...nouvelleStrat, picks: [...nouvelleStrat.picks, map] }) } else { if (nouvelleStrat.bans.includes(map)) setNouvelleStrat({ ...nouvelleStrat, bans: nouvelleStrat.bans.filter(m => m !== map) }); else if (nouvelleStrat.bans.length < 4) setNouvelleStrat({ ...nouvelleStrat, bans: [...nouvelleStrat.bans, map] }) } }
  const genBilan = () => { const now = new Date(); const mm = historique.filter((m: any) => { const d = new Date(m.createdAt); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() }); const w = mm.filter((m: any) => (m.scoreDyno || 0) > (m.scoreAdversaire || 0)).length; const l = mm.filter((m: any) => (m.scoreDyno || 0) < (m.scoreAdversaire || 0)).length; const mn = notes.filter((n: any) => { const d = new Date(n.createdAt); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() }); const am = mn.length > 0 ? Math.round(mn.reduce((a: number, n: any) => a + parseInt(n.mental || 0), 0) / mn.length) : 0; const ac = mn.length > 0 ? Math.round(mn.reduce((a: number, n: any) => a + parseInt(n.communication || 0), 0) / mn.length) : 0; const ap = mn.length > 0 ? Math.round(mn.reduce((a: number, n: any) => a + parseInt(n.gameplay || 0), 0) / mn.length) : 0; return { nom: ['Jan','Fev','Mar','Avr','Mai','Jun','Jul','Aou','Sep','Oct','Nov','Dec'][now.getMonth()], m: mm.length, w, l, wr: mm.length > 0 ? Math.round((w / (w + l || 1)) * 100) : 0, am, ac, ap } }
  const atc = (m: any) => { try { if (!m?.date) return; let y: string, mo: string, d: string; if (m.date.includes('/')) { const p = m.date.split('/'); d = p[0]; mo = p[1]; y = p[2] } else { const p = m.date.split('-'); y = p[0]; mo = p[1]; d = p[2] }; const md = y + mo + d; let h = '20', mi = '00'; if (m.horaires?.length > 0) { const p = m.horaires[0].split(':'); h = p[0]; mi = p[1] || '00' } else if (m.horaire1) { const p = m.horaire1.split(':'); h = p[0]; mi = p[1] || '00' }; const st = h + mi + '00'; const et = (parseInt(h) + 2).toString().padStart(2, '0') + mi + '00'; window.open('https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent('DYNO vs ' + m.adversaire) + '&dates=' + md + 'T' + st + '/' + md + 'T' + et + '&location=' + encodeURIComponent(m.arene), '_blank') } catch (e: any) { alert(e.message) } }

  const handleVideoUrlChange = (url: string) => {
    setNewVideo(v => ({ ...v, youtubeUrl: url }))
    setVideoYtId(extractYoutubeId(url))
  }

  const publierStratVideo = async () => {
    if (!user || !newVideo.titre || !videoYtId) return
    setVideoStep('publishing')
    try {
      await addDoc(collection(db, 'stratVideos'), { titre: newVideo.titre, description: newVideo.description, youtubeUrl: newVideo.youtubeUrl, youtubeId: videoYtId, jeu: newVideo.jeu, map: newVideo.map || 'All', categorie: newVideo.categorie, tags: newVideo.tags.split(',').map(t => t.trim()).filter(Boolean), auteur: pseudo, auteurId: user.uid, vues: 0, likes: [], publie: newVideo.publie, createdAt: Date.now() })
      addLog('Video: ' + newVideo.titre)
      try { await fetch(DW_VIDEOS, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ embeds: [{ title: 'Nouvelle Strat Video !', description: newVideo.titre, color: 13934871, fields: [{ name: 'Categorie', value: newVideo.categorie, inline: true }, { name: 'Jeu', value: newVideo.jeu, inline: true }, { name: 'Par', value: pseudo, inline: true }], thumbnail: { url: 'https://img.youtube.com/vi/' + videoYtId + '/hqdefault.jpg' }, footer: { text: 'DYNO Esport', icon_url: LG } }] }) }) } catch {}
      setVideoStep('done')
    } catch (e: any) { alert(e.message); setVideoStep('form') }
  }

  const likerVideo = async (vid: StratVideo) => {
    if (!user) return
    const likes = vid.likes || []
    const newLikes = likes.includes(user.uid) ? likes.filter((id: string) => id !== user.uid) : [...likes, user.uid]
    await updateDoc(doc(db, 'stratVideos', vid.id), { likes: newLikes })
  }

  const togglePublierVideo = async (vid: StratVideo) => {
    await updateDoc(doc(db, 'stratVideos', vid.id), { publie: !vid.publie })
    if (selectedVideo?.id === vid.id) setSelectedVideo({ ...vid, publie: !vid.publie })
  }

  const filteredVideos = stratVideos.filter(v => {
    const matchCat = videoFilter === 'all' || v.categorie === videoFilter
    const matchSearch = !videoSearch || v.titre.toLowerCase().includes(videoSearch.toLowerCase()) || v.description?.toLowerCase().includes(videoSearch.toLowerCase()) || v.tags?.some(t => t.toLowerCase().includes(videoSearch.toLowerCase()))
    const visible = isAdmin || v.publie || v.auteurId === user?.uid
    return matchCat && matchSearch && visible
  })

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0')
  }

  const initYouTubePlayer = (videoId: string) => {
    if ((window as any).YT && (window as any).YT.Player) {
      createPlayer(videoId)
    } else {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
      ;(window as any).onYouTubeIframeAPIReady = () => createPlayer(videoId)
    }
  }

  const createPlayer = (videoId: string) => {
    const p = new (window as any).YT.Player('yt-kill-player', {
      videoId, width: '100%', height: '100%',
      playerVars: { rel: 0, modestbranding: 1 },
      events: {
        onReady: () => { setYtReady(true); setYtPlayer(p) },
        onStateChange: (e: any) => {
          if (e.data === 1) {
            setIsPlaying(true)
            timeInterval.current = setInterval(() => { setCurrentTime(p.getCurrentTime()) }, 100)
          } else {
            setIsPlaying(false)
            if (timeInterval.current) clearInterval(timeInterval.current)
          }
        }
      }
    })
  }

  const registerKill = () => {
    if (!ytPlayer || !killPlayer) return
    const time = ytPlayer.getCurrentTime()
    const newKill = { player: killPlayer, time, type: killType, formattedTime: formatTime(time), createdAt: Date.now() }
    setKillList(prev => [...prev, newKill].sort((a, b) => a.time - b.time))
  }

  const removeKill = (index: number) => { setKillList(prev => prev.filter((_, i) => i !== index)) }
  const seekTo = (time: number) => { if (ytPlayer) ytPlayer.seekTo(time, true) }

  const saveKillSession = async () => {
    if (!user || !killSessionTitle || killList.length === 0) return
    const sessionData = { titre: killSessionTitle, youtubeUrl: killSessionUrl, youtubeId: extractYoutubeId(killSessionUrl), kills: killList, auteur: pseudo, auteurId: user.uid, createdAt: Date.now() }
    if (currentSession) { await updateDoc(doc(db, 'killSessions', currentSession.id), sessionData) }
    else { await addDoc(collection(db, 'killSessions'), sessionData) }
    addLog('Kill session: ' + killSessionTitle)
    alert('Session sauvegardee !')
    setShowNewSession(false); setCurrentSession(null); setKillList([]); setKillSessionTitle(''); setKillSessionUrl(''); setYtPlayer(null); setYtReady(false)
    if (timeInterval.current) clearInterval(timeInterval.current)
  }

  const exportKills = (session: any) => {
    let text = 'KILL TRACKER - ' + session.titre + '\n\n'
    const players = [...new Set(session.kills.map((k: any) => k.player))]
    players.forEach((p: any) => {
      const pKills = session.kills.filter((k: any) => k.player === p)
      text += p + ' (' + pKills.length + ' kills)\n'
      pKills.forEach((k: any) => { text += '  ' + k.formattedTime + ' - ' + k.type + '\n' })
      text += '\n'
    })
    navigator.clipboard.writeText(text)
    alert('Copie dans le presse-papier !')
  }

  const openSession = (session: any) => {
    setCurrentSession(session); setKillSessionTitle(session.titre); setKillSessionUrl(session.youtubeUrl); setKillList(session.kills || []); setShowNewSession(true)
    setTimeout(() => initYouTubePlayer(session.youtubeId), 500)
  }

  const deleteSession = async (id: string) => {
    if (!confirm('Supprimer cette session ?')) return
    await deleteDoc(doc(db, 'killSessions', id)); addLog('Kill session supprimee')
  }

  const victoires = matchs.filter((m: any) => m.termine && (m.scoreDyno || 0) > (m.scoreAdversaire || 0)).length
  const defaites = matchs.filter((m: any) => m.termine && (m.scoreDyno || 0) < (m.scoreAdversaire || 0)).length
  const totalMatchs = victoires + defaites
  const winRate = totalMatchs > 0 ? Math.round((victoires / totalMatchs) * 100) : 0
  const prochainsMatchs = matchs.filter((m: any) => !m.termine).sort((a: any, b: any) => new Date(a.date + 'T' + (a.horaires?.[0] || a.horaire1 || '20:00')).getTime() - new Date(b.date + 'T' + (b.horaires?.[0] || b.horaire1 || '20:00')).getTime())
  const historique = matchs.filter((m: any) => m.termine)
  const ytId = (url: string) => { const m = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/); return m ? m[1] : null }
  const hcRem = myPass ? (myPass.hcTotal || 0) - (myPass.hcUsed || 0) : 0
  const hpRem = myPass ? (myPass.hpTotal || 0) - (myPass.hpUsed || 0) : 0
  const H = ({ title, icon }: { title: string; icon?: string }) => (
    <div className="relative rounded-3xl p-7 mb-5 text-center overflow-hidden bg-gradient-to-br from-[#D4AF37]/10 via-[#D4AF37]/5 to-transparent border border-[#D4AF37]/15 glow-pulse tab-content">
      <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent" />
      <img src={LG} alt="D" className="w-14 h-14 mx-auto mb-2 relative z-10 drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]" />
      <h2 className="text-lg font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent relative z-10">{icon} {title}</h2>
    </div>
  )

  const menuItems = [
    { t: 'matchs', i: '📅', l: 'Matchs' },
    { t: 'historique', i: '📜', l: 'Resultats' },
    { t: 'strats', i: '🎯', l: 'Strats' },
    { t: 'compos', i: '📋', l: 'Compos' },
    { t: 'fiches', i: '🔍', l: 'Fiches' },
    { t: 'notes', i: '📊', l: 'Notes' },
    { t: 'idees', i: '💡', l: 'Boite a idees' },
    { t: 'stratVideos', i: '📺', l: 'Strat Video' },
    { t: 'killTracker', i: '💀', l: 'Kill Tracker' },
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
        <img src={LG} alt="D" className="w-48 h-48 mx-auto splash-logo drop-shadow-[0_0_40px_rgba(212,175,55,0.6)]" />
        <h1 className="text-5xl font-bold bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] bg-clip-text text-transparent mt-6 splash-text">DYNO</h1>
        <p className="text-gray-400 mt-3 splash-sub tracking-[0.3em] uppercase text-sm">Esport Team</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pb-6 relative">
      <P />
      <header className="backdrop-blur-2xl bg-black/30 border-b border-white/5 sticky top-0 z-40 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="max-w-lg mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setShowMenu(!showMenu)} className="w-9 h-9 rounded-xl flex items-center justify-center text-lg bg-white/5 border border-white/10 hover:bg-[#D4AF37]/20 transition-all">☰</button>
            <img src={LG} alt="D" className="w-8 h-8 drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
            <div>
              <h1 className="text-base font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent leading-tight">DYNO</h1>
              <p className="text-[8px] text-gray-600 uppercase tracking-widest">Esport</p>
            </div>
          </div>
          <div className="flex gap-1 items-center">
            {user && myPass && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-white/5 border border-white/10">
                <span className="text-blue-400 text-[8px] font-bold">{hcRem}HC</span>
                <span className="text-gray-700 text-[7px]">|</span>
                <span className="text-purple-400 text-[8px] font-bold">{hpRem}HP</span>
              </div>
            )}
            {user && <button onClick={requestNotificationPermission} className={"w-7 h-7 rounded-full flex items-center justify-center text-xs " + (notificationsEnabled ? "bg-[#D4AF37]/20 border border-[#D4AF37]/40" : "bg-white/5 border border-white/10")}>{notificationsEnabled ? '🔔' : '🔕'}</button>}
            {showInstall && <button onClick={handleInstall} className="px-2 py-1 rounded-lg text-[9px] font-bold bg-blue-600 text-white">📲</button>}
            {user ? (
              <button onClick={handleSignOut} className="px-2 py-1 rounded-xl font-bold bg-gradient-to-r from-red-600 to-red-700 text-white text-[10px]">👋 {pseudo}</button>
            ) : (
              <button onClick={() => setIsSignUp(false)} className="px-2 py-1 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-[10px]">👤</button>
            )}
          </div>
        </div>
      </header>

      {showMenu && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-64 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border-r border-[#D4AF37]/20 shadow-[4px_0_32px_rgba(0,0,0,0.8)] overflow-y-auto">
            <div className="p-5 border-b border-[#D4AF37]/10 flex items-center gap-3">
              <img src={LG} alt="D" className="w-12 h-12" />
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">DYNO</h2>
                <p className="text-[9px] text-gray-600 uppercase tracking-widest">Esport Team</p>
              </div>
            </div>
            <div className="py-3">
              {menuItems.map(({ t, i, l }) => (
                <button key={t} onClick={() => { setActiveTab(t); setShowMenu(false) }} className={"w-full px-5 py-3 flex items-center gap-3 transition-all " + (activeTab === t ? "bg-[#D4AF37]/15 text-[#D4AF37] border-r-2 border-[#D4AF37]" : "text-gray-500 hover:text-gray-300 hover:bg-white/5")}>
                  <span className="text-lg">{i}</span>
                  <span className="text-sm font-bold tracking-wider uppercase">{l}</span>
                  {t === 'stratVideos' && <span className="ml-auto px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[8px] font-bold border border-red-500/20">YT</span>}
                  {t === 'killTracker' && <span className="ml-auto px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[8px] font-bold border border-orange-500/20">NEW</span>}
                  {activeTab === t && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setShowMenu(false)} />
        </div>
      )}

      <main className="max-w-lg mx-auto px-4 py-6 relative z-10" onTouchStart={hts} onTouchMove={htm} onTouchEnd={hte}>
        {pullDistance > 0 && (
          <div className="flex justify-center mb-4" style={{ height: pullDistance }}>
            <span className={"text-[#D4AF37] text-2xl " + (pullDistance > 60 ? 'animate-spin' : '')}>{isRefreshing ? '...' : pullDistance > 60 ? '🔄' : '⬇️'}</span>
          </div>
        )}

        {activeTab === 'matchs' && (
          <div>
            <H title="Prochains Matchs" />
            <div className="flex justify-end mb-3">
              <div className="flex bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <button onClick={() => setViewMode('list')} className={"px-3 py-1.5 text-xs " + (viewMode === 'list' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'text-gray-600')}>☰</button>
                <button onClick={() => setViewMode('grid')} className={"px-3 py-1.5 text-xs " + (viewMode === 'grid' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'text-gray-600')}>⊞</button>
              </div>
            </div>
            {loading ? (
              <div className="space-y-4"><div className="skeleton h-48 w-full" /><div className="skeleton h-48 w-full" /></div>
            ) : prochainsMatchs.length === 0 ? (
              <div className="text-center py-10 text-gray-600">Aucun match planifie</div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-4'}>
                {prochainsMatchs.map((match: any, idx: number) => (
                  <div key={match.id} className="card-glow bg-black/30 backdrop-blur-lg rounded-3xl p-4 border border-[#D4AF37]/15" style={{ animationDelay: (idx * 0.1) + 's' }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={"px-2.5 py-1 rounded-full text-[9px] font-bold uppercase " + (match.type === 'Ligue' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : match.type === 'Scrim' ? 'bg-green-500/20 text-green-400 border border-green-500/20' : match.type === 'Tournoi' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' : 'bg-orange-500/20 text-orange-400 border border-orange-500/20')}>{match.type}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={"px-1.5 py-0.5 rounded text-[7px] font-bold " + (getMatchTimeType(match) === 'hp' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400')}>{getMatchTimeType(match) === 'hp' ? 'HP' : 'HC'}</span>
                        <span className="text-[#D4AF37] font-bold text-xs">{fdf(match.date)}</span>
                      </div>
                    </div>
                    {countdowns[match.id] && (
                      <div className={"rounded-2xl p-2.5 mb-3 text-center border " + (countdowns[match.id] === 'EN COURS' ? 'bg-red-500/10 border-red-500/15' : 'bg-[#D4AF37]/10 border-[#D4AF37]/15')}>
                        <p className="text-[9px] text-gray-600 uppercase">Countdown</p>
                        <p className={"text-lg font-bold font-mono " + (countdowns[match.id] === 'EN COURS' ? 'text-red-400 animate-pulse' : 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent')}>{countdowns[match.id]}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                      <img src={LG} alt="D" className="w-10 h-10" />
                      <span className="text-gray-700 font-light">VS</span>
                      <div className="flex-1 text-right">
                        <p className="font-bold text-white text-sm">{match.adversaire}</p>
                        <p className="text-[10px] text-[#D4AF37]/60">{match.arene}</p>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2.5 mb-2 border border-white/5">
                      <p className="text-[9px] text-gray-600 uppercase">Horaire</p>
                      <p className="text-[#D4AF37] font-bold text-xs">{match.horaires?.join(' / ') || [match.horaire1, match.horaire2].filter(Boolean).join(' / ') || '20:00'}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2.5 mb-2 border border-white/5">
                      <p className="text-[9px] text-gray-600 mb-1.5 uppercase">Disponibles ({(match.disponibles || []).length})</p>
                      {(match.disponibles || []).length > 0 && (
                        <div className="flex flex-wrap gap-1">{(match.disponibles || []).map((p: string, i: number) => <span key={i} className="bg-[#D4AF37]/15 text-[#D4AF37] px-2 py-0.5 rounded-lg text-[9px] font-bold border border-[#D4AF37]/15">{p}</span>)}</div>
                      )}
                    </div>
                    <div className="bg-white/5 rounded-xl p-2.5 mb-3 border border-red-500/10">
                      <p className="text-[9px] text-gray-600 mb-1.5 uppercase">Indisponibles ({(match.indisponibles || []).length})</p>
                      {(match.indisponibles || []).length > 0 && (
                        <div className="flex flex-wrap gap-1">{(match.indisponibles || []).map((p: string, i: number) => <span key={i} className="bg-red-500/15 text-red-400 px-2 py-0.5 rounded-lg text-[9px] font-bold border border-red-500/15">{p}</span>)}</div>
                      )}
                    </div>
                    <button onClick={() => atc(match)} className="w-full mb-2 py-2 rounded-xl font-bold bg-blue-600/20 text-blue-400 border border-blue-500/15 text-xs">Ajouter au Calendrier</button>
                    <div className="flex gap-2">
                      <button onClick={() => toggleDispo(match.id)} disabled={!user} className={"flex-1 py-2.5 rounded-xl font-bold transition-all text-xs " + (!user ? 'bg-white/5 text-gray-700' : (match.disponibles || []).includes(pseudo) ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/30' : 'bg-white/5 border border-[#D4AF37]/15 text-[#D4AF37]')}>Dispo</button>
                      <button onClick={() => toggleIndispo(match.id)} disabled={!user} className={"flex-1 py-2.5 rounded-xl font-bold transition-all text-xs " + (!user ? 'bg-white/5 text-gray-700' : (match.indisponibles || []).includes(pseudo) ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30' : 'bg-white/5 border border-red-500/15 text-red-400')}>Indispo</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'historique' && (
          <div>
            <H title="Historique" />
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="card-glow bg-[#D4AF37]/10 rounded-2xl p-4 border border-[#D4AF37]/15 text-center">
                <p className="text-3xl font-bold text-[#D4AF37]">{victoires}</p>
                <p className="text-[9px] text-gray-600 mt-1 uppercase">Victoires</p>
              </div>
              <div className="card-glow bg-red-500/10 rounded-2xl p-4 border border-red-500/15 text-center">
                <p className="text-3xl font-bold text-red-500">{defaites}</p>
                <p className="text-[9px] text-gray-600 mt-1 uppercase">Defaites</p>
              </div>
            </div>
            {historique.length === 0 ? (
              <div className="text-center py-10 text-gray-600">Aucun resultat</div>
            ) : (
              <div className="space-y-3">
                {historique.map((match: any, idx: number) => (
                  <div key={match.id} className="card-glow bg-black/30 rounded-3xl p-4 border border-[#D4AF37]/15" style={{ animationDelay: (idx * 0.1) + 's' }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={"px-2.5 py-1 rounded-full text-[9px] font-bold uppercase " + ((match.scoreDyno || 0) > (match.scoreAdversaire || 0) ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/20' : 'bg-red-500/20 text-red-400 border border-red-500/20')}>{(match.scoreDyno || 0) > (match.scoreAdversaire || 0) ? 'VICTOIRE' : 'DEFAITE'}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-xs">{fdf(match.date)}</span>
                        {isAdmin && <button onClick={() => setEditHistoriqueScore({ id: match.id, adversaire: match.adversaire || '', scoreDyno: String(match.scoreDyno || 0), scoreAdv: String(match.scoreAdversaire || 0), type: match.type || 'Ligue', arene: match.arene || 'Arene 1', date: match.date || '', termine: true, sousMatchs: match.sousMatchs || [] })} className="w-7 h-7 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[10px]">✏️</button>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-center">
                        <p className="font-bold text-[#D4AF37] text-[10px] uppercase">DYNO</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">{match.scoreDyno}</p>
                      </div>
                      <span className="text-gray-800 text-lg">-</span>
                      <div className="text-center">
                        <p className="font-bold text-gray-600 text-[10px] uppercase">{match.adversaire}</p>
                        <p className="text-3xl font-bold text-gray-500">{match.scoreAdversaire}</p>
                      </div>
                    </div>
                    {match.sousMatchs?.length > 0 && (
                      <div className="space-y-1 mb-2 pt-2 border-t border-white/5">
                        <p className="text-[9px] text-gray-600 uppercase mb-1">Sous-matchs</p>
                        {match.sousMatchs.map((sm: any, i: number) => (
                          <div key={i} className="flex justify-between bg-white/5 rounded-lg px-2 py-1">
                            <span className="text-[10px] text-gray-400">{sm.adversaire}</span>
                            <span className="text-[10px] font-bold"><span className="text-[#D4AF37]">{sm.scoreDyno}</span>-<span className="text-gray-500">{sm.scoreAdv}</span></span>
                          </div>
                        ))}
                      </div>
                    )}
                    {match.type && <p className="text-center text-gray-700 text-[9px] mt-2 uppercase">{match.type} - {match.arene}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'strats' && (
          <div>
            <H title="Strategies" icon="🎯" />
            <button onClick={() => setShowAddStrat(true)} className="w-full mb-5 py-3 rounded-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-sm">Nouvelle Strategie</button>
            {strats.length === 0 ? (
              <div className="text-center py-10 text-gray-600">Aucune</div>
            ) : (
              <div className="space-y-3">
                {strats.map((s: any, idx: number) => (
                  <div key={s.id} className="card-glow bg-black/30 rounded-3xl p-4 border border-[#D4AF37]/15" style={{ animationDelay: (idx * 0.1) + 's' }}>
                    <div className="flex justify-between mb-3">
                      <div>
                        <p className="font-bold text-[#D4AF37]">DYNO vs {s.adversaire}</p>
                        <p className="text-[9px] text-gray-600">par {s.auteur || '?'}</p>
                      </div>
                      {(isAdmin || user?.uid === s.auteurId) && <button onClick={() => del('strats', s.id)} className="text-red-400/40">🗑️</button>}
                    </div>
                    <div className="mb-2">
                      <p className="text-[9px] text-green-400 mb-1.5 uppercase">Picks ({s.picks?.length || 0}/4)</p>
                      <div className="flex flex-wrap gap-1">{s.picks?.map((p: string, i: number) => <span key={i} className="bg-green-500/15 text-green-400 px-2.5 py-1 rounded-lg text-[10px] border border-green-500/15 font-bold">{p}</span>)}</div>
                    </div>
                    <div>
                      <p className="text-[9px] text-red-400 mb-1.5 uppercase">Bans ({s.bans?.length || 0}/4)</p>
                      <div className="flex flex-wrap gap-1">{s.bans?.map((b: string, i: number) => <span key={i} className="bg-red-500/15 text-red-400 px-2.5 py-1 rounded-lg text-[10px] border border-red-500/15 font-bold">{b}</span>)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showAddStrat && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-start pt-16 justify-center z-50 p-4">
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-5 w-full max-w-md border border-white/10 max-h-[85vh] overflow-y-auto">
                  <h3 className="text-lg font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-5 text-center">Nouvelle Strategie</h3>
                  <div className="space-y-3 mb-5">
                    <div>
                      <label className="text-gray-600 text-[10px] mb-1.5 block uppercase">Adversaire</label>
                      <input type="text" placeholder="Nom" value={nouvelleStrat.adversaire} onChange={e => setNouvelleStrat({ ...nouvelleStrat, adversaire: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-gray-600 text-[10px] mb-1.5 block uppercase">Picks (4)</label>
                      <div className="grid grid-cols-3 gap-1.5">{AM.map(m => <button key={m} onClick={() => toggleMap(m, 'picks')} className={"px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all " + (nouvelleStrat.picks.includes(m) ? 'bg-green-600 text-white' : 'bg-white/5 text-gray-500')}>{m}</button>)}</div>
                    </div>
                    <div>
                      <label className="text-gray-600 text-[10px] mb-1.5 block uppercase">Bans (4)</label>
                      <div className="grid grid-cols-3 gap-1.5">{AM.map(m => <button key={m} onClick={() => toggleMap(m, 'bans')} className={"px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all " + (nouvelleStrat.bans.includes(m) ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-500')}>{m}</button>)}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setShowAddStrat(false); setNouvelleStrat({ adversaire: '', picks: [], bans: [] }) }} className="flex-1 py-2.5 rounded-xl font-bold bg-white/5 border border-white/10 text-gray-500 text-sm">Annuler</button>
                    <button onClick={ajouterStrat} className="flex-1 py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-sm">OK</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'compos' && (
          <div>
            <H title="Compositions" icon="📋" />
            {user && <button onClick={() => setShowAddCompo(true)} className="w-full mb-5 py-3 rounded-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-sm">Nouvelle Compo</button>}
            {compos.length === 0 ? (
              <div className="text-center py-10 text-gray-600">Aucune</div>
            ) : (
              <div className="space-y-3">
                {compos.map((c: any, idx: number) => (
                  <div key={c.id} className="card-glow bg-black/30 rounded-3xl p-4 border border-[#D4AF37]/15" style={{ animationDelay: (idx * 0.1) + 's' }}>
                    <div className="flex justify-between mb-2">
                      <p className="font-bold text-[#D4AF37]">{c.map}</p>
                      {user && <button onClick={() => del('compos', c.id)} className="text-red-400/40">🗑️</button>}
                    </div>
                    <div className="flex flex-wrap gap-1">{c.joueurs?.map((j: string, i: number) => <span key={i} className="bg-[#D4AF37]/15 text-[#D4AF37] px-2.5 py-1 rounded-lg text-[10px] font-bold border border-[#D4AF37]/15">{j}</span>)}</div>
                  </div>
                ))}
              </div>
            )}
            {showAddCompo && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-start pt-16 justify-center z-50 p-4">
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-5 w-full max-w-md border border-white/10 max-h-[85vh] overflow-y-auto">
                  <h3 className="text-lg font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-5 text-center">Compo</h3>
                  <div className="space-y-3 mb-5">
                    <div>
                      <label className="text-gray-600 text-[10px] mb-1.5 block uppercase">Map</label>
                      <div className="grid grid-cols-3 gap-1.5">{AM.map(m => <button key={m} onClick={() => setSelectedMapCompo(m)} className={"px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all " + (selectedMapCompo === m ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-gray-500')}>{m}</button>)}</div>
                    </div>
                    <div>
                      <label className="text-gray-600 text-[10px] mb-1.5 block uppercase">Joueurs</label>
                      <div className="grid grid-cols-2 gap-1.5">{joueurs.filter((j: any) => j.actif !== false).map((j: any) => <button key={j.id} onClick={() => toggleCompoJoueur(j.pseudo)} className={"px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all " + (compoJoueurs.includes(j.pseudo) ? 'bg-green-600 text-white' : 'bg-white/5 text-gray-500')}>{j.pseudo}</button>)}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setShowAddCompo(false); setSelectedMapCompo(''); setCompoJoueurs([]) }} className="flex-1 py-2.5 rounded-xl font-bold bg-white/5 border border-white/10 text-gray-500 text-sm">Annuler</button>
                    <button onClick={ajouterCompo} className="flex-1 py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-sm">OK</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'fiches' && (
          <div>
            <H title="Fiches Adversaires" icon="🔍" />
            {user && <button onClick={() => setShowAddFiche(true)} className="w-full mb-5 py-3 rounded-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-sm">Nouvelle Fiche</button>}
            {fichesAdversaires.length === 0 ? (
              <div className="text-center py-10 text-gray-600">Aucune</div>
            ) : (
              <div className="space-y-3">
                {fichesAdversaires.map((f: any, idx: number) => (
                  <div key={f.id} className="card-glow bg-black/30 rounded-3xl p-4 border border-[#D4AF37]/15" style={{ animationDelay: (idx * 0.1) + 's' }}>
                    <div className="flex justify-between mb-3">
                      <p className="font-bold text-[#D4AF37]">{f.adversaire}</p>
                      {(isAdmin || user?.uid === f.auteurId) && <button onClick={() => del('fichesAdversaires', f.id)} className="text-red-400/40">🗑️</button>}
                    </div>
                    <div className="space-y-2">
                      <div className="bg-green-500/10 rounded-xl p-3 border border-green-500/10">
                        <p className="text-[9px] text-green-400 uppercase font-bold mb-1">Forces</p>
                        <p className="text-gray-300 text-xs">{f.forces || '-'}</p>
                      </div>
                      <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/10">
                        <p className="text-[9px] text-red-400 uppercase font-bold mb-1">Faiblesses</p>
                        <p className="text-gray-300 text-xs">{f.faiblesses || '-'}</p>
                      </div>
                      {f.notes && (
                        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                          <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">Notes</p>
                          <p className="text-gray-300 text-xs">{f.notes}</p>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-700 text-[9px] mt-2">par {f.auteur}</p>
                  </div>
                ))}
              </div>
            )}
            {showAddFiche && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-start pt-16 justify-center z-50 p-4">
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-5 w-full max-w-md border border-white/10 max-h-[85vh] overflow-y-auto">
                  <h3 className="text-lg font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-5 text-center">Fiche</h3>
                  <div className="space-y-3 mb-5">
                    <div>
                      <label className="text-gray-600 text-[10px] mb-1.5 block uppercase">Adversaire</label>
                      <input type="text" placeholder="Nom" value={nouvelleFiche.adversaire} onChange={e => setNouvelleFiche({ ...nouvelleFiche, adversaire: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-gray-600 text-[10px] mb-1.5 block uppercase">Forces</label>
                      <textarea value={nouvelleFiche.forces} onChange={e => setNouvelleFiche({ ...nouvelleFiche, forces: e.target.value })} rows={2} className="w-full bg-white/5 border border-green-500/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none resize-none" />
                    </div>
                    <div>
                      <label className="text-gray-600 text-[10px] mb-1.5 block uppercase">Faiblesses</label>
                      <textarea value={nouvelleFiche.faiblesses} onChange={e => setNouvelleFiche({ ...nouvelleFiche, faiblesses: e.target.value })} rows={2} className="w-full bg-white/5 border border-red-500/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none resize-none" />
                    </div>
                    <div>
                      <label className="text-gray-600 text-[10px] mb-1.5 block uppercase">Notes</label>
                      <textarea value={nouvelleFiche.notes} onChange={e => setNouvelleFiche({ ...nouvelleFiche, notes: e.target.value })} rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none resize-none" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setShowAddFiche(false); setNouvelleFiche({ adversaire: '', forces: '', faiblesses: '', notes: '' }) }} className="flex-1 py-2.5 rounded-xl font-bold bg-white/5 border border-white/10 text-gray-500 text-sm">Annuler</button>
                    <button onClick={ajouterFiche} className="flex-1 py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-sm">OK</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div>
            <H title="Notes et Analyses" icon="📊" />
            {historique.length === 0 ? (
              <div className="text-center py-10 text-gray-600">Aucun match</div>
            ) : (
              <div className="space-y-4">
                {historique.map((match: any, idx: number) => {
                  const mn = notes.filter((n: any) => n.matchId === match.id)
                  const mc = commentaires.filter((c: any) => c.matchId === match.id)
                  const ma = analyses.filter((a: any) => a.matchId === match.id)
                  return (
                    <div key={match.id} className="card-glow bg-black/30 rounded-3xl p-4 border border-[#D4AF37]/15" style={{ animationDelay: (idx * 0.1) + 's' }}>
                      <div className="flex justify-between mb-3">
                        <p className="font-bold text-[#D4AF37] text-sm">DYNO vs {match.adversaire}</p>
                        <div className="flex items-center gap-2">
                          <span className={"px-2 py-0.5 rounded-full text-[8px] font-bold " + ((match.scoreDyno || 0) > (match.scoreAdversaire || 0) ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-red-500/20 text-red-400')}>{match.scoreDyno}-{match.scoreAdversaire}</span>
                          <span className="text-gray-700 text-[10px]">{fdf(match.date)}</span>
                        </div>
                      </div>
                      <div className="flex gap-1.5 mb-3">
                        <button onClick={() => { setSelectedMatchForNotes(match); setNouvelleNote({ matchId: match.id, mental: '', communication: '', gameplay: '' }) }} className="flex-1 py-1.5 rounded-lg font-bold bg-purple-500/15 text-purple-400 border border-purple-500/15 text-[9px]">Note</button>
                        <button onClick={() => setSelectedMatchForComment(selectedMatchForComment?.id === match.id ? null : match)} className="flex-1 py-1.5 rounded-lg font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/15 text-[9px]">Comm</button>
                        <button onClick={() => setSelectedMatchForAnalyse(selectedMatchForAnalyse?.id === match.id ? null : match)} className="flex-1 py-1.5 rounded-lg font-bold bg-orange-500/15 text-orange-400 border border-orange-500/15 text-[9px]">Analyse</button>
                      </div>
                      {selectedMatchForComment?.id === match.id && user && (
                        <div className="bg-white/5 rounded-xl p-3 mb-3 border border-cyan-500/10">
                          <textarea placeholder="Commentaire..." value={nouveauCommentaire} onChange={e => setNouveauCommentaire(e.target.value)} rows={2} className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none resize-none mb-2" />
                          <button onClick={() => ajouterCommentaire(match.id)} className="w-full py-1.5 rounded-lg font-bold bg-cyan-500/20 text-cyan-400 text-[10px]">Envoyer</button>
                        </div>
                      )}
                      {selectedMatchForAnalyse?.id === match.id && user && (
                        <div className="bg-white/5 rounded-xl p-3 mb-3 border border-orange-500/10">
                          <div className="space-y-2 mb-2">
                            <div>
                              <label className="text-[8px] text-green-400 uppercase font-bold">Bien</label>
                              <textarea value={nouvelleAnalyse.bien} onChange={e => setNouvelleAnalyse({ ...nouvelleAnalyse, bien: e.target.value })} rows={2} className="w-full bg-black/30 border border-green-500/15 rounded-lg px-3 py-2 text-white text-xs focus:outline-none resize-none mt-1" />
                            </div>
                            <div>
                              <label className="text-[8px] text-red-400 uppercase font-bold">Mal</label>
                              <textarea value={nouvelleAnalyse.mal} onChange={e => setNouvelleAnalyse({ ...nouvelleAnalyse, mal: e.target.value })} rows={2} className="w-full bg-black/30 border border-red-500/15 rounded-lg px-3 py-2 text-white text-xs focus:outline-none resize-none mt-1" />
                            </div>
                            <div>
                              <label className="text-[8px] text-blue-400 uppercase font-bold">Plan</label>
                              <textarea value={nouvelleAnalyse.plan} onChange={e => setNouvelleAnalyse({ ...nouvelleAnalyse, plan: e.target.value })} rows={2} className="w-full bg-black/30 border border-blue-500/15 rounded-lg px-3 py-2 text-white text-xs focus:outline-none resize-none mt-1" />
                            </div>
                          </div>
                          <button onClick={() => ajouterAnalyse(match.id)} className="w-full py-1.5 rounded-lg font-bold bg-orange-500/20 text-orange-400 text-[10px]">Envoyer</button>
                        </div>
                      )}
                      {mn.length > 0 && (
                        <div className="space-y-1.5 mb-3">
                          <p className="text-[9px] text-purple-400 uppercase font-bold">Notes ({mn.length})</p>
                          {mn.map((n: any) => (
                            <div key={n.id} className="bg-white/5 rounded-lg p-2.5 border border-white/5">
                              <div className="flex justify-between mb-1.5">
                                <p className="text-[#D4AF37] font-bold text-[10px]">{n.joueur}</p>
                                {isAdmin && <button onClick={() => del('notes', n.id)} className="text-red-400/40 text-[9px]">🗑️</button>}
                              </div>
                              <div className="grid grid-cols-3 gap-1.5 text-center">
                                <div className="bg-purple-500/10 rounded-lg p-1.5"><p className="text-[9px] text-gray-600">Mental</p><p className="text-purple-400 font-bold text-xs">{n.mental}/10</p></div>
                                <div className="bg-blue-500/10 rounded-lg p-1.5"><p className="text-[9px] text-gray-600">Comm</p><p className="text-blue-400 font-bold text-xs">{n.communication}/10</p></div>
                                <div className="bg-green-500/10 rounded-lg p-1.5"><p className="text-[9px] text-gray-600">Perf</p><p className="text-green-400 font-bold text-xs">{n.gameplay}/10</p></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {mc.length > 0 && (
                        <div className="space-y-1.5 mb-3">
                          <p className="text-[9px] text-cyan-400 uppercase font-bold">Commentaires ({mc.length})</p>
                          {mc.map((c: any) => (
                            <div key={c.id} className="bg-white/5 rounded-lg p-2.5 border border-white/5">
                              <div className="flex justify-between mb-0.5">
                                <p className="text-cyan-400 font-bold text-[10px]">{c.joueur}</p>
                                <div className="flex items-center gap-1.5">
                                  <p className="text-gray-700 text-[9px]">{fts(c.createdAt)}</p>
                                  {(isAdmin || user?.uid === c.joueurId) && <button onClick={() => del('commentaires', c.id)} className="text-red-400/40 text-[9px]">🗑️</button>}
                                </div>
                              </div>
                              <p className="text-gray-400 text-xs">{c.texte}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {ma.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[9px] text-orange-400 uppercase font-bold">Analyses ({ma.length})</p>
                          {ma.map((a: any) => (
                            <div key={a.id} className="bg-white/5 rounded-lg p-2.5 border border-white/5">
                              <div className="flex justify-between mb-2">
                                <p className="text-orange-400 font-bold text-[10px]">{a.joueur}</p>
                                {(isAdmin || user?.uid === a.joueurId) && <button onClick={() => del('analyses', a.id)} className="text-red-400/40 text-[9px]">🗑️</button>}
                              </div>
                              {a.bien && <div className="bg-green-500/10 rounded-lg p-2 mb-1"><p className="text-[8px] text-green-400 font-bold">Bien</p><p className="text-gray-300 text-[10px]">{a.bien}</p></div>}
                              {a.mal && <div className="bg-red-500/10 rounded-lg p-2 mb-1"><p className="text-[8px] text-red-400 font-bold">Mal</p><p className="text-gray-300 text-[10px]">{a.mal}</p></div>}
                              {a.plan && <div className="bg-blue-500/10 rounded-lg p-2"><p className="text-[8px] text-blue-400 font-bold">Plan</p><p className="text-gray-300 text-[10px]">{a.plan}</p></div>}
                            </div>
                          ))}
                        </div>
                      )}
                      {mn.length === 0 && mc.length === 0 && ma.length === 0 && <p className="text-gray-700 text-[10px] text-center">Aucune donnee</p>}
                    </div>
                  )
                })}
              </div>
            )}
            {selectedMatchForNotes && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-start pt-16 justify-center z-50 p-4">
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-6 w-full max-w-sm border border-white/10 max-h-[85vh] overflow-y-auto">
                  <h3 className="text-lg font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-5 text-center">vs {selectedMatchForNotes.adversaire}</h3>
                  <div className="space-y-3 mb-5">
                    <div>
                      <label className="text-gray-600 text-[10px] mb-1.5 block uppercase">Mental (0-10)</label>
                      <input type="number" min="0" max="10" value={nouvelleNote.mental} onChange={e => setNouvelleNote({ ...nouvelleNote, mental: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-xl font-bold focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-gray-600 text-[10px] mb-1.5 block uppercase">Comm (0-10)</label>
                      <input type="number" min="0" max="10" value={nouvelleNote.communication} onChange={e => setNouvelleNote({ ...nouvelleNote, communication: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-xl font-bold focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-gray-600 text-[10px] mb-1.5 block uppercase">Perf (0-10)</label>
                      <input type="number" min="0" max="10" value={nouvelleNote.gameplay} onChange={e => setNouvelleNote({ ...nouvelleNote, gameplay: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-xl font-bold focus:outline-none" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setSelectedMatchForNotes(null); setNouvelleNote({ matchId: '', mental: '', communication: '', gameplay: '' }) }} className="flex-1 py-2.5 rounded-xl font-bold bg-white/5 border border-white/10 text-gray-500 text-sm">Annuler</button>
                    <button onClick={ajouterNote} className="flex-1 py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-sm">OK</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'idees' && (
          <div>
            <H title="Boite a Idees" icon="💡" />
            {user && (
              <div className="mb-5">
                <input type="text" placeholder="Votre idee..." value={nouvelleIdee} onChange={e => setNouvelleIdee(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') ajouterIdee() }} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50" />
                <button onClick={ajouterIdee} className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-sm">Proposer</button>
              </div>
            )}
            {idees.length === 0 ? (
              <div className="text-center py-10 text-gray-600">Aucune idee</div>
            ) : (
              <div className="space-y-4">
                {idees.map((o: any, idx: number) => {
                  const votes = o.votes || {}
                  const oui = Object.values(votes).filter((v: any) => v === 'oui').length
                  const non = Object.values(votes).filter((v: any) => v === 'non').length
                  const test = Object.values(votes).filter((v: any) => v === 'test').length
                  const myVote = user ? votes[user.uid] : null
                  const ic = (o.ideaComments || []) as any[]
                  return (
                    <div key={o.id} className="card-glow bg-black/30 rounded-2xl p-4 border border-[#D4AF37]/15" style={{ animationDelay: (idx * 0.1) + 's' }}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{o.texte}</p>
                          <p className="text-gray-600 text-[9px] mt-1">par <span className="text-[#D4AF37]">{o.joueur}</span> - {new Date(o.createdAt).toLocaleDateString('fr-FR')}</p>
                        </div>
                        {(isAdmin || user?.uid === o.joueurId) && <button onClick={() => del('idees', o.id)} className="text-red-400/40 text-sm ml-2">🗑️</button>}
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <button onClick={() => voterIdee(o.id, 'oui')} className={"py-2 rounded-xl font-bold text-xs transition-all " + (myVote === 'oui' ? 'bg-green-600 text-white shadow-lg shadow-green-500/30' : 'bg-green-500/10 text-green-400 border border-green-500/15')}>Oui ({oui})</button>
                        <button onClick={() => voterIdee(o.id, 'non')} className={"py-2 rounded-xl font-bold text-xs transition-all " + (myVote === 'non' ? 'bg-red-600 text-white shadow-lg shadow-red-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/15')}>Non ({non})</button>
                        <button onClick={() => voterIdee(o.id, 'test')} className={"py-2 rounded-xl font-bold text-xs transition-all " + (myVote === 'test' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-blue-500/10 text-blue-400 border border-blue-500/15')}>Test ({test})</button>
                      </div>
                      {Object.keys(votes).length > 0 && (
                        <div className="bg-white/5 rounded-lg p-2 mb-3 border border-white/5">
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(votes).map(([uid, vote]: [string, any]) => {
                              const vp = allPasses.find((p: any) => p.oduserId === uid)
                              const vj = joueurs.find((j: any) => j.userId === uid)
                              const nom = vj?.pseudo || vp?.pseudo || '?'
                              return <span key={uid} className={"px-1.5 py-0.5 rounded text-[8px] font-bold " + (vote === 'oui' ? 'bg-green-500/15 text-green-400' : vote === 'non' ? 'bg-red-500/15 text-red-400' : 'bg-blue-500/15 text-blue-400')}>{nom}</span>
                            })}
                          </div>
                        </div>
                      )}
                      {ic.length > 0 && (
                        <div className="space-y-1.5 mb-3">
                          <p className="text-[9px] text-gray-500 uppercase font-bold">Commentaires ({ic.length})</p>
                          {ic.map((c: any, ci: number) => (
                            <div key={ci} className="bg-white/5 rounded-lg p-2 border border-white/5">
                              <div className="flex justify-between">
                                <p className="text-[#D4AF37] font-bold text-[9px]">{c.joueur}</p>
                                <p className="text-gray-700 text-[8px]">{new Date(c.createdAt).toLocaleDateString('fr-FR')}</p>
                              </div>
                              <p className="text-gray-400 text-[10px] mt-0.5">{c.texte}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {user && (
                        <div className="flex gap-2">
                          <input type="text" placeholder="Commenter..." id={'ic-' + o.id} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-[10px] focus:outline-none" />
                          <button onClick={() => commenterIdee(o.id, document.getElementById('ic-' + o.id) as HTMLInputElement)} className="px-3 py-2 rounded-lg font-bold bg-[#D4AF37]/20 text-[#D4AF37] text-[10px]">OK</button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
        {activeTab === 'stratVideos' && (
          <div>
            <H title="Strat Video" icon="📺" />
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
                <p className="text-xl font-bold text-[#D4AF37]">{stratVideos.length}</p>
                <p className="text-[9px] text-gray-600 uppercase">Total</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
                <p className="text-xl font-bold text-green-400">{stratVideos.filter(v => v.publie).length}</p>
                <p className="text-[9px] text-gray-600 uppercase">Publiees</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
                <p className="text-xl font-bold text-red-400">{stratVideos.reduce((s, v) => s + (v.likes?.length || 0), 0)}</p>
                <p className="text-[9px] text-gray-600 uppercase">Likes</p>
              </div>
            </div>
            {user && (
              <button onClick={() => { setShowAddVideo(true); setVideoStep('form'); setNewVideo({ titre: '', description: '', youtubeUrl: '', jeu: 'EVA Esport Arena', map: '', categorie: 'strat', tags: '', publie: true }); setVideoYtId('') }} className="w-full mb-4 py-3 rounded-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 text-white text-sm shadow-lg shadow-red-500/20 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                Publier une Strat Video
              </button>
            )}
            <a href={YT} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 w-full mb-4 py-2.5 rounded-xl font-bold bg-red-600/10 text-red-400 border border-red-500/20 text-center text-xs justify-center">Chaine YouTube DYNO</a>
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3">
              <button onClick={() => setVideoFilter('all')} className={"flex-shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all " + (videoFilter === 'all' ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30' : 'bg-white/5 text-gray-500 border-white/10')}>Toutes</button>
              {CATS.map(c => (
                <button key={c.v} onClick={() => setVideoFilter(c.v as any)} className={"flex-shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all " + (videoFilter === c.v ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30' : 'bg-white/5 text-gray-500 border-white/10')}>{c.i} {c.l}</button>
              ))}
            </div>
            <div className="relative mb-4">
              <input type="text" placeholder="Rechercher..." value={videoSearch} onChange={e => setVideoSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]/40" />
            </div>
            {filteredVideos.length === 0 ? (
              <div className="text-center py-10 text-gray-600"><p className="text-4xl mb-3">📺</p><p>Aucune video</p></div>
            ) : (
              <div className="space-y-4">
                {filteredVideos.map((v, idx) => (
                  <div key={v.id} className="card-glow bg-black/30 rounded-3xl border border-[#D4AF37]/15 overflow-hidden" style={{ animationDelay: (idx * 0.05) + 's' }}>
                    <div className="relative cursor-pointer" onClick={() => { setSelectedVideo(v); setPlayerLoaded(false) }}>
                      <img src={'https://img.youtube.com/vi/' + v.youtubeId + '/hqdefault.jpg'} alt={v.titre} className="w-full aspect-video object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-14 h-14 bg-red-600/90 rounded-full flex items-center justify-center shadow-xl">
                          <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      </div>
                      {!v.publie && <div className="absolute top-2 left-2 bg-yellow-500/90 px-2 py-0.5 rounded-lg text-[9px] text-black font-black">BROUILLON</div>}
                      <div className="absolute top-2 right-2"><span className="bg-black/70 px-2 py-0.5 rounded-lg text-[9px] text-white font-bold">{CATS.find(c => c.v === v.categorie)?.i} {CATS.find(c => c.v === v.categorie)?.l}</span></div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-white text-sm mb-1 leading-tight">{v.titre}</h3>
                      {v.description && <p className="text-gray-500 text-[10px] mb-2 line-clamp-2">{v.description}</p>}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded-lg text-[9px] font-bold border border-[#D4AF37]/15 flex items-center gap-1"><img src={LG} alt="EVA" className="w-3 h-3" /> EVA</span>
                        {v.map && v.map !== 'All' && <span className="bg-white/5 text-gray-500 px-2 py-0.5 rounded-lg text-[9px] border border-white/10">{v.map}</span>}
                        <span className="text-gray-600 text-[9px] ml-auto">par {v.auteur}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setSelectedVideo(v); setPlayerLoaded(false) }} className="flex-1 py-2 rounded-xl bg-red-600/15 text-red-400 border border-red-500/20 text-xs font-bold">Regarder</button>
                        <button onClick={() => user && likerVideo(v)} className={"py-2 px-3 rounded-xl text-xs font-bold border transition-all " + (user && v.likes?.includes(user.uid) ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-white/5 text-gray-500 border-white/10')}>❤️ {v.likes?.length || 0}</button>
                        <a href={v.youtubeUrl} target="_blank" rel="noopener noreferrer" className="py-2 px-3 rounded-xl bg-white/5 text-gray-500 border border-white/10 text-xs font-bold">YT</a>
                        {(isAdmin || user?.uid === v.auteurId) && (
                          <>
                            <button onClick={() => togglePublierVideo(v)} className={"py-2 px-2 rounded-xl text-xs border " + (v.publie ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20')}>{v.publie ? '👁' : '✅'}</button>
                            <button onClick={() => { if (confirm('Supprimer ?')) del('stratVideos', v.id) }} className="py-2 px-2 rounded-xl bg-red-500/10 text-red-400/60 border border-red-500/10 text-xs">🗑️</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selectedVideo && (
              <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <button onClick={() => setSelectedVideo(null)} className="text-gray-400 hover:text-white text-sm">Retour</button>
                  <div className="flex gap-2">
                    {(isAdmin || user?.uid === selectedVideo.auteurId) && <button onClick={() => togglePublierVideo(selectedVideo)} className={"px-3 py-1 rounded-lg text-xs font-bold " + (selectedVideo.publie ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400')}>{selectedVideo.publie ? 'Brouillon' : 'Publier'}</button>}
                    <a href={selectedVideo.youtubeUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1 rounded-lg bg-red-600/20 text-red-400 text-xs font-bold">YouTube</a>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {!playerLoaded ? (
                    <div className="relative aspect-video cursor-pointer" onClick={() => setPlayerLoaded(true)}>
                      <img src={'https://img.youtube.com/vi/' + selectedVideo.youtubeId + '/hqdefault.jpg'} alt={selectedVideo.titre} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/40">
                          <svg className="w-10 h-10 text-white ml-1.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe className="absolute top-0 left-0 w-full h-full" src={'https://www.youtube.com/embed/' + selectedVideo.youtubeId + '?autoplay=1&rel=0'} title={selectedVideo.titre} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    </div>
                  )}
                  <div className="p-4 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-white font-bold text-base flex-1">{selectedVideo.titre}</h2>
                      <button onClick={() => user && likerVideo(selectedVideo)} className={"px-3 py-1.5 rounded-xl font-bold text-sm transition-all " + (user && selectedVideo.likes?.includes(user.uid) ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-gray-500 border border-white/10')}>❤️ {selectedVideo.likes?.length || 0}</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-[#D4AF37]/10 text-[#D4AF37] px-2.5 py-1 rounded-lg text-[10px] font-bold border border-[#D4AF37]/15">{CATS.find(c => c.v === selectedVideo.categorie)?.i} {CATS.find(c => c.v === selectedVideo.categorie)?.l}</span>
                      <span className="bg-[#D4AF37]/10 text-[#D4AF37] px-2.5 py-1 rounded-lg text-[10px] font-bold border border-[#D4AF37]/20 flex items-center gap-1"><img src={LG} alt="EVA" className="w-3.5 h-3.5" /> EVA Esport Arena</span>
                      {selectedVideo.map && selectedVideo.map !== 'All' && <span className="bg-white/5 text-gray-400 px-2.5 py-1 rounded-lg text-[10px] border border-white/10">{selectedVideo.map}</span>}
                    </div>
                    {selectedVideo.description && <div className="bg-white/5 rounded-xl p-3 border border-white/10"><p className="text-gray-300 text-xs whitespace-pre-wrap">{selectedVideo.description}</p></div>}
                    <div className="flex items-center gap-3 text-[10px] text-gray-600 border-t border-white/5 pt-3"><span>par {selectedVideo.auteur}</span><span>-</span><span>{new Date(selectedVideo.createdAt).toLocaleDateString('fr-FR')}</span></div>
                  </div>
                </div>
              </div>
            )}
            {showAddVideo && (
              <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <button onClick={() => { setShowAddVideo(false); setVideoStep('form') }} className="text-gray-400 text-sm">Fermer</button>
                  <h3 className="text-sm font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">{videoStep === 'form' ? 'Nouvelle video' : videoStep === 'preview' ? 'Preview' : videoStep === 'publishing' ? 'Publication...' : 'Publiee !'}</h3>
                  <div className="w-16" />
                </div>
                <div className="flex items-center gap-0 px-4 py-3 border-b border-white/5">
                  {['Infos', 'Preview', 'Pub.', 'OK'].map((s, i) => (
                    <div key={s} className="flex items-center flex-1">
                      <div className={"w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black " + (['form','preview','publishing','done'].indexOf(videoStep) >= i ? 'bg-[#D4AF37] text-black' : 'bg-white/10 text-gray-600')}>{i + 1}</div>
                      {i < 3 && <div className={"flex-1 h-px " + (['form','preview','publishing','done'].indexOf(videoStep) > i ? 'bg-[#D4AF37]/50' : 'bg-white/10')} />}
                    </div>
                  ))}
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {videoStep === 'form' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-gray-500 text-[10px] uppercase font-bold mb-1.5 block">URL YouTube *</label>
                        <input type="url" placeholder="https://www.youtube.com/watch?v=..." value={newVideo.youtubeUrl} onChange={e => handleVideoUrlChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none" />
                        {newVideo.youtubeUrl && !videoYtId && <p className="text-red-400 text-[10px] mt-1">URL invalide</p>}
                        {videoYtId && <p className="text-green-400 text-[10px] mt-1">ID detecte : {videoYtId}</p>}
                      </div>
                      {videoYtId && <div className="rounded-xl overflow-hidden border border-white/10"><img src={'https://img.youtube.com/vi/' + videoYtId + '/hqdefault.jpg'} alt="preview" className="w-full aspect-video object-cover" /></div>}
                      <div>
                        <label className="text-gray-500 text-[10px] uppercase font-bold mb-1.5 block">Titre *</label>
                        <input type="text" placeholder="Ex: Start Lunar" value={newVideo.titre} onChange={e => setNewVideo(v => ({ ...v, titre: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-gray-500 text-[10px] uppercase font-bold mb-1.5 block">Description</label>
                        <textarea value={newVideo.description} onChange={e => setNewVideo(v => ({ ...v, description: e.target.value }))} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none resize-none" />
                      </div>
                      <div>
                        <label className="text-gray-500 text-[10px] uppercase font-bold mb-1.5 block">Jeu</label>
                        <div className="w-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl px-3 py-2.5 text-[#D4AF37] text-sm font-bold flex items-center gap-2"><img src={LG} alt="EVA" className="w-5 h-5" /> EVA Esport Arena</div>
                      </div>
                      <div>
                        <label className="text-gray-500 text-[10px] uppercase font-bold mb-1.5 block">Map</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {AM.map(m => (
                            <button key={m} type="button" onClick={() => setNewVideo(v => ({ ...v, map: v.map === m ? '' : m }))} className={"px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all border " + (newVideo.map === m ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-white/5 text-gray-500 border-white/10')}>{m}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-gray-500 text-[10px] uppercase font-bold mb-1.5 block">Categorie</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {CATS.map(c => (
                            <button key={c.v} type="button" onClick={() => setNewVideo(v => ({ ...v, categorie: c.v as any }))} className={"py-2 rounded-xl text-[10px] font-bold border transition-all " + (newVideo.categorie === c.v ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40' : 'bg-white/5 text-gray-500 border-white/10')}>{c.i} {c.l}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-gray-500 text-[10px] uppercase font-bold mb-1.5 block">Tags (virgules)</label>
                        <input type="text" placeholder="rush, start" value={newVideo.tags} onChange={e => setNewVideo(v => ({ ...v, tags: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none" />
                      </div>
                      <div className="flex items-center gap-3 bg-white/5 rounded-xl p-4 border border-white/10">
                        <button type="button" onClick={() => setNewVideo(v => ({ ...v, publie: !v.publie }))} className={"relative w-12 h-6 rounded-full transition-colors " + (newVideo.publie ? 'bg-green-500' : 'bg-white/20')}>
                          <div className={"absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-lg transition-transform " + (newVideo.publie ? 'translate-x-6' : 'translate-x-0.5')} />
                        </button>
                        <p className="text-white text-sm font-bold">{newVideo.publie ? 'Publie' : 'Brouillon'}</p>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button onClick={() => setShowAddVideo(false)} className="flex-1 py-3 rounded-xl font-bold bg-white/5 border border-white/10 text-gray-500 text-sm">Annuler</button>
                        <button onClick={() => { if (!newVideo.titre || !videoYtId) { alert('Titre et URL requis'); return }; setVideoStep('preview') }} disabled={!newVideo.titre || !videoYtId} className={"flex-1 py-3 rounded-xl font-bold text-sm " + (newVideo.titre && videoYtId ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' : 'bg-white/10 text-gray-600')}>Previsualiser</button>
                      </div>
                    </div>
                  )}
                  {videoStep === 'preview' && (
                    <div className="space-y-4">
                      <div className="rounded-xl overflow-hidden border border-white/10"><img src={'https://img.youtube.com/vi/' + videoYtId + '/hqdefault.jpg'} alt={newVideo.titre} className="w-full aspect-video object-cover" /></div>
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
                        <h3 className="text-white font-bold">{newVideo.titre}</h3>
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded-lg text-[10px] font-bold border border-[#D4AF37]/15">{CATS.find(c => c.v === newVideo.categorie)?.i} {CATS.find(c => c.v === newVideo.categorie)?.l}</span>
                          <span className="bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded-lg text-[10px] font-bold border border-[#D4AF37]/20 flex items-center gap-1"><img src={LG} alt="EVA" className="w-3 h-3" /> EVA</span>
                          {newVideo.map && <span className="bg-white/5 text-gray-400 px-2 py-0.5 rounded-lg text-[10px] border border-white/10">{newVideo.map}</span>}
                        </div>
                        {newVideo.description && <p className="text-gray-400 text-xs">{newVideo.description}</p>}
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setVideoStep('form')} className="flex-1 py-3 rounded-xl font-bold bg-white/5 border border-white/10 text-gray-500 text-sm">Modifier</button>
                        <button onClick={publierStratVideo} className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-red-600 to-red-700 text-white text-sm">Publier !</button>
                      </div>
                    </div>
                  )}
                  {videoStep === 'publishing' && (
                    <div className="flex flex-col items-center justify-center py-20 space-y-6">
                      <div className="w-20 h-20 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center animate-pulse">
                        <svg className="w-10 h-10 text-red-400" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                      </div>
                      <p className="text-white font-bold">Publication en cours...</p>
                    </div>
                  )}
                  {videoStep === 'done' && (
                    <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
                      <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
                        <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <h3 className="text-white font-bold text-xl">Video publiee !</h3>
                      <div className="flex gap-3 w-full">
                        <button onClick={() => { setShowAddVideo(false); setVideoStep('form') }} className="flex-1 py-3 rounded-xl font-bold bg-white/5 border border-white/10 text-gray-400 text-sm">Fermer</button>
                        <a href={newVideo.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 rounded-xl font-bold bg-red-600 text-white text-sm text-center">Voir sur YT</a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'killTracker' && (
          <div>
            <H title="Kill Tracker" icon="💀" />
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
                <p className="text-xl font-bold text-[#D4AF37]">{killSessions.length}</p>
                <p className="text-[9px] text-gray-600 uppercase">Sessions</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
                <p className="text-xl font-bold text-red-400">{killSessions.reduce((s, ses) => s + (ses.kills?.length || 0), 0)}</p>
                <p className="text-[9px] text-gray-600 uppercase">Total Kills</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
                <p className="text-xl font-bold text-orange-400">{killSessions.reduce((s, ses) => s + (ses.kills?.filter((k: any) => k.type === 'headshot').length || 0), 0)}</p>
                <p className="text-[9px] text-gray-600 uppercase">Headshots</p>
              </div>
            </div>
            {user && (
              <button onClick={() => { setShowNewSession(true); setCurrentSession(null); setKillList([]); setKillSessionTitle(''); setKillSessionUrl(''); setYtReady(false); setKillPlayer(''); setCurrentTime(0); setIsPlaying(false); if (timeInterval.current) clearInterval(timeInterval.current) }} className="w-full mb-4 py-3 rounded-2xl font-bold bg-gradient-to-r from-orange-600 to-red-700 text-white text-sm shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2">
                💀 Nouvelle Session Kill Tracker
              </button>
            )}
            {killSessions.length === 0 ? (
              <div className="text-center py-10 text-gray-600"><p className="text-4xl mb-3">💀</p><p>Aucune session</p></div>
            ) : (
              <div className="space-y-4">
                {killSessions.map((ses, idx) => {
                  const players = [...new Set((ses.kills || []).map((k: any) => k.player))] as string[]
                  return (
                    <div key={ses.id} className="card-glow bg-black/30 rounded-3xl border border-[#D4AF37]/15 overflow-hidden" style={{ animationDelay: (idx * 0.05) + 's' }}>
                      <div className="relative">
                        <img src={'https://img.youtube.com/vi/' + ses.youtubeId + '/hqdefault.jpg'} alt={ses.titre} className="w-full aspect-video object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-3 left-4 right-4">
                          <h3 className="font-bold text-white text-sm">{ses.titre}</h3>
                          <p className="text-gray-400 text-[10px]">par {ses.auteur} - {new Date(ses.createdAt).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div className="absolute top-2 right-2 bg-red-600/90 px-2.5 py-1 rounded-lg text-white text-[10px] font-black">{ses.kills?.length || 0} KILLS</div>
                      </div>
                      <div className="p-4">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {players.map(p => {
                            const count = (ses.kills || []).filter((k: any) => k.player === p).length
                            return (
                              <div key={p} className="bg-white/5 rounded-lg px-2.5 py-1.5 border border-white/10 flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] text-[8px] font-black">{p[0]?.toUpperCase()}</div>
                                <span className="text-white text-[10px] font-bold">{p}</span>
                                <span className="text-red-400 text-[10px] font-black">{count}</span>
                              </div>
                            )
                          })}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => openSession(ses)} className="flex-1 py-2 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/20 text-xs font-bold">Ouvrir</button>
                          <button onClick={() => exportKills(ses)} className="py-2 px-3 rounded-xl bg-white/5 text-gray-400 border border-white/10 text-xs font-bold">📋</button>
                          <a href={ses.youtubeUrl} target="_blank" rel="noopener noreferrer" className="py-2 px-3 rounded-xl bg-red-600/15 text-red-400 border border-red-500/20 text-xs font-bold">YT</a>
                          {(isAdmin || user?.uid === ses.auteurId) && <button onClick={() => deleteSession(ses.id)} className="py-2 px-2 rounded-xl bg-red-500/10 text-red-400/60 border border-red-500/10 text-xs">🗑️</button>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {showNewSession && (
              <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <button onClick={() => { setShowNewSession(false); setYtReady(false); setIsPlaying(false); if (timeInterval.current) clearInterval(timeInterval.current) }} className="text-gray-400 text-sm">Fermer</button>
                  <h3 className="text-sm font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">{currentSession ? 'Modifier' : 'Nouvelle Session'}</h3>
                  <button onClick={saveKillSession} disabled={!killSessionTitle || killList.length === 0} className={"px-3 py-1 rounded-lg text-xs font-bold " + (killSessionTitle && killList.length > 0 ? 'bg-[#D4AF37] text-black' : 'bg-white/10 text-gray-600')}>Sauvegarder</button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {!ytReady && (
                    <div className="p-4 space-y-3">
                      <div>
                        <label className="text-gray-500 text-[10px] uppercase font-bold mb-1.5 block">Titre *</label>
                        <input type="text" placeholder="Ex: Scrim vs Team Alpha" value={killSessionTitle} onChange={e => setKillSessionTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-gray-500 text-[10px] uppercase font-bold mb-1.5 block">URL YouTube *</label>
                        <input type="url" placeholder="https://www.youtube.com/watch?v=..." value={killSessionUrl} onChange={e => setKillSessionUrl(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none" />
                      </div>
                      {killSessionUrl && extractYoutubeId(killSessionUrl) && (
                        <div className="rounded-xl overflow-hidden border border-white/10">
                          <img src={'https://img.youtube.com/vi/' + extractYoutubeId(killSessionUrl) + '/hqdefault.jpg'} alt="preview" className="w-full aspect-video object-cover" />
                        </div>
                      )}
                      <button onClick={() => { const vid = extractYoutubeId(killSessionUrl); if (!vid || !killSessionTitle) { alert('Titre et URL requis'); return }; setYtReady(true); setCurrentTime(0); setIsPlaying(false) }} disabled={!killSessionTitle || !killSessionUrl || !extractYoutubeId(killSessionUrl)} className={"w-full py-3 rounded-xl font-bold text-sm " + (killSessionTitle && extractYoutubeId(killSessionUrl) ? 'bg-gradient-to-r from-orange-600 to-red-700 text-white' : 'bg-white/10 text-gray-600')}>Lancer le tracker</button>
                    </div>
                  )}
                  {ytReady && (
                    <div>
                      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                        <iframe className="absolute top-0 left-0 w-full h-full" src={'https://www.youtube.com/embed/' + extractYoutubeId(killSessionUrl) + '?rel=0'} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-500 text-[10px] uppercase font-bold">Timer</span>
                            <span className={"text-lg font-mono font-bold " + (isPlaying ? 'text-green-400' : 'text-gray-500')}>{formatTime(currentTime)}</span>
                          </div>
                          <div className="flex gap-2">
                            {!isPlaying ? (
                              <button onClick={() => { setIsPlaying(true); const start = Date.now() - currentTime * 1000; timeInterval.current = setInterval(() => { setCurrentTime((Date.now() - start) / 1000) }, 100) }} className="flex-1 py-2 rounded-lg font-bold bg-green-500/20 text-green-400 border border-green-500/20 text-xs">Play</button>
                            ) : (
                              <button onClick={() => { setIsPlaying(false); if (timeInterval.current) clearInterval(timeInterval.current) }} className="flex-1 py-2 rounded-lg font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 text-xs">Pause</button>
                            )}
                            <button onClick={() => { setCurrentTime(0); setIsPlaying(false); if (timeInterval.current) clearInterval(timeInterval.current) }} className="py-2 px-3 rounded-lg font-bold bg-red-500/20 text-red-400 border border-red-500/20 text-xs">Reset</button>
                            <button onClick={() => setCurrentTime(prev => Math.max(0, prev - 5))} className="py-2 px-3 rounded-lg font-bold bg-white/5 text-gray-400 border border-white/10 text-xs">-5s</button>
                            <button onClick={() => setCurrentTime(prev => prev + 5)} className="py-2 px-3 rounded-lg font-bold bg-white/5 text-gray-400 border border-white/10 text-xs">+5s</button>
                          </div>
                        </div>
                        <div>
                          <label className="text-gray-500 text-[10px] uppercase font-bold mb-1.5 block">Joueur</label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {joueurs.filter((j: any) => j.actif !== false).map((j: any) => (
                              <button key={j.id} onClick={() => setKillPlayer(j.pseudo)} className={"px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all border " + (killPlayer === j.pseudo ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-white/5 text-gray-500 border-white/10')}>{j.pseudo}</button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-gray-500 text-[10px] uppercase font-bold mb-1.5 block">Type</label>
                          <div className="grid grid-cols-4 gap-1.5">
                            <button onClick={() => setKillType('kill')} className={"py-2 rounded-xl text-[10px] font-bold border transition-all " + (killType === 'kill' ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-white/5 text-gray-500 border-white/10')}>💀 Kill</button>
                            <button onClick={() => setKillType('headshot')} className={"py-2 rounded-xl text-[10px] font-bold border transition-all " + (killType === 'headshot' ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' : 'bg-white/5 text-gray-500 border-white/10')}>🎯 Head</button>
                            <button onClick={() => setKillType('clutch')} className={"py-2 rounded-xl text-[10px] font-bold border transition-all " + (killType === 'clutch' ? 'bg-purple-500/20 text-purple-400 border-purple-500/40' : 'bg-white/5 text-gray-500 border-white/10')}>👑 Clutch</button>
                            <button onClick={() => setKillType('ace')} className={"py-2 rounded-xl text-[10px] font-bold border transition-all " + (killType === 'ace' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' : 'bg-white/5 text-gray-500 border-white/10')}>⭐ Ace</button>
                          </div>
                        </div>
                        <button onClick={registerKill} disabled={!killPlayer} className={"w-full py-4 rounded-2xl font-black text-lg transition-all " + (killPlayer ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30 active:scale-95' : 'bg-white/10 text-gray-600')}>💀 KILL ! ({killPlayer || 'Choisis un joueur'})</button>
                        {killList.length > 0 && (
                          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                            <div className="flex items-center justify-between p-3 border-b border-white/5">
                              <p className="text-[10px] text-[#D4AF37] uppercase font-bold">Kills ({killList.length})</p>
                              <button onClick={() => exportKills({ titre: killSessionTitle, kills: killList })} className="px-2 py-1 rounded-lg bg-white/5 text-gray-400 text-[9px] font-bold border border-white/10">📋 Copier</button>
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                              {killList.map((k, i) => (
                                <div key={i} className="flex items-center justify-between px-3 py-2 border-b border-white/5 last:border-0">
                                  <div className="flex items-center gap-2 flex-1">
                                    <span className="text-[#D4AF37] font-mono font-bold text-xs">{k.formattedTime}</span>
                                    <span className="text-white text-[10px] font-bold">{k.player}</span>
                                    <span className={"px-1.5 py-0.5 rounded text-[8px] font-bold " + (k.type === 'headshot' ? 'bg-orange-500/20 text-orange-400' : k.type === 'clutch' ? 'bg-purple-500/20 text-purple-400' : k.type === 'ace' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400')}>{k.type}</span>
                                  </div>
                                  <button onClick={() => removeKill(i)} className="text-red-400/40 text-[10px] ml-2">x</button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {killList.length > 0 && (
                          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Stats</p>
                            <div className="space-y-1">
                              {[...new Set(killList.map(k => k.player))].map(p => {
                                const pKills = killList.filter(k => k.player === p)
                                const heads = pKills.filter(k => k.type === 'headshot').length
                                return (
                                  <div key={p} className="flex items-center justify-between">
                                    <span className="text-white text-xs font-bold">{p}</span>
                                    <div className="flex gap-2">
                                      <span className="text-red-400 text-[10px] font-bold">{pKills.length} kills</span>
                                      {heads > 0 && <span className="text-orange-400 text-[10px] font-bold">{heads} HS</span>}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                        <button onClick={saveKillSession} disabled={killList.length === 0} className={"w-full py-3 rounded-xl font-bold text-sm " + (killList.length > 0 ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black' : 'bg-white/10 text-gray-600')}>Sauvegarder</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'rec' && (
          <div>
            <H title="Replays" icon="🎬" />
            <a href={YT} target="_blank" className="block w-full mb-5 py-2.5 rounded-xl font-bold bg-red-600/15 text-red-400 border border-red-500/15 text-center text-xs">Chaine YouTube DYNO</a>
            {replays.length === 0 ? (
              <div className="text-center py-10 text-gray-600">Aucun replay</div>
            ) : (
              <div className="space-y-3">
                {replays.map((r: any, idx: number) => (
                  <div key={r.id} className="card-glow bg-black/30 rounded-3xl p-4 border border-[#D4AF37]/15" style={{ animationDelay: (idx * 0.1) + 's' }}>
                    <div className="flex justify-between mb-2">
                      <h3 className="font-bold text-[#D4AF37] text-sm">{r.titre}</h3>
                      {isAdmin && <button onClick={() => del('replays', r.id)} className="text-red-400/40 text-[9px]">🗑️</button>}
                    </div>
                    {ytId(r.lien) ? (
                      <div className="relative w-full pb-[56.25%] rounded-xl overflow-hidden">
                        <iframe src={'https://www.youtube.com/embed/' + ytId(r.lien)} className="absolute top-0 left-0 w-full h-full" frameBorder="0" allowFullScreen />
                      </div>
                    ) : (
                      <a href={r.lien} target="_blank" className="block py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-center text-sm">Voir</a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'roster' && (
          <div>
            <H title="Roster" icon="👥" />
            {user && (
              <div className="card-glow bg-black/30 rounded-3xl p-6 border border-[#D4AF37]/15 mb-6 relative overflow-hidden">
                <p className="text-[10px] text-[#D4AF37] font-black mb-5 uppercase tracking-widest">Mon Profil</p>
                <div className="flex items-center gap-5 mb-6">
                  <div className="relative">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="avatar" className="w-20 h-20 rounded-2xl object-cover border-2 border-[#D4AF37]/40 shadow-2xl" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-black flex items-center justify-center text-[#D4AF37] font-black text-3xl border-2 border-[#D4AF37]/20">{pseudo?.[0]?.toUpperCase()}</div>
                    )}
                    <label className={"absolute -bottom-2 -right-2 text-black w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-4 border-[#030303] cursor-pointer z-20 " + (uploadingAvatar ? 'bg-gray-500 animate-pulse' : 'bg-[#D4AF37]')}>
                      <span className="text-xs">{uploadingAvatar ? '...' : '📷'}</span>
                      <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploadingAvatar} />
                    </label>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-black text-xl leading-none mb-1">{pseudo}</p>
                    <p className="text-[#D4AF37] text-[10px] font-bold uppercase opacity-70 mb-2">Membre DYNO</p>
                    {myPass && (
                      <div className="inline-flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
                        <span className="text-sm">{EVA_PASSES[myPass.type]?.icon}</span>
                        <span className="text-[9px] font-black text-gray-400 uppercase">{EVA_PASSES[myPass.type]?.label}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <div className="flex gap-2">
                    <input type="text" placeholder="URL avatar..." value={avatarUrl?.startsWith('data:') ? 'Image uploadee' : avatarUrl} onChange={e => setAvatarUrl(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-[10px] focus:outline-none" />
                    <button onClick={saveAvatar} className="px-4 rounded-xl font-bold bg-white/5 border border-white/10 text-[#D4AF37]">💾</button>
                  </div>
                </div>
              </div>
            )}
            {user && (
              <div className="card-glow bg-black/30 rounded-2xl p-4 border border-[#D4AF37]/15 mb-5">
                <p className="text-[10px] text-[#D4AF37] font-bold mb-3 uppercase">Mon EVA Pass</p>
                {myPass ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{EVA_PASSES[myPass.type]?.icon}</span>
                        <span className={"px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r text-white " + (EVA_PASSES[myPass.type]?.color || 'from-gray-500 to-gray-700')}>{EVA_PASSES[myPass.type]?.label}</span>
                      </div>
                      <button onClick={() => { setMyPass(null); updateDoc(doc(db, 'users', user.uid), { evaPass: null }) }} className="text-red-400/40 text-[9px]">Changer</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/15 text-center">
                        <p className="text-[8px] text-blue-400 uppercase font-bold mb-1">HC</p>
                        <p className="text-xl font-bold text-blue-400">{hcRem}<span className="text-gray-600 text-sm">/{myPass.hcTotal || 0}</span></p>
                      </div>
                      <div className="bg-purple-500/10 rounded-xl p-3 border border-purple-500/15 text-center">
                        <p className="text-[8px] text-purple-400 uppercase font-bold mb-1">HP</p>
                        <p className="text-xl font-bold text-purple-400">{hpRem}<span className="text-gray-600 text-sm">/{myPass.hpTotal || 0}</span></p>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5 mb-2">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div><label className="text-[8px] text-blue-400 mb-1 block">HC utilises</label><input type="number" min="0" max={myPass.hcTotal || 99} value={myPass.hcUsed || 0} onChange={e => setMyPass({ ...myPass, hcUsed: parseInt(e.target.value) || 0 })} className="w-full bg-black/30 border border-blue-500/20 rounded-lg px-3 py-2 text-white text-center text-sm font-bold focus:outline-none" /></div>
                        <div><label className="text-[8px] text-purple-400 mb-1 block">HP utilises</label><input type="number" min="0" max={myPass.hpTotal || 99} value={myPass.hpUsed || 0} onChange={e => setMyPass({ ...myPass, hpUsed: parseInt(e.target.value) || 0 })} className="w-full bg-black/30 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-center text-sm font-bold focus:outline-none" /></div>
                      </div>
                      <div className="mb-2"><label className="text-[8px] text-[#D4AF37] mb-1 block">Reset</label><input type="date" value={myPass.dateReset || ''} onChange={e => setMyPass({ ...myPass, dateReset: e.target.value })} className="w-full bg-black/30 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-white text-xs focus:outline-none" /></div>
                      {myPass.dateReset && <p className="text-[8px] text-gray-600 text-center mb-2">Reset le {fdf(myPass.dateReset)}</p>}
                      <button onClick={async () => { await updateDoc(doc(db, 'users', user.uid), { evaPass: myPass }); addLog('Pass modifie'); alert('OK !') }} className="w-full py-2 rounded-lg font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-xs">Sauvegarder</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500 text-xs mb-3 text-center">Selectionne ton abonnement :</p>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(EVA_PASSES).map(([key, p]) => (
                        <button key={key} onClick={() => selectPass(key)} className={"rounded-xl p-3 border text-center " + (key === 'bronze' ? 'bg-amber-900/20 border-amber-700/30' : key === 'argent' ? 'bg-gray-500/20 border-gray-500/30' : 'bg-[#D4AF37]/20 border-[#D4AF37]/30')}>
                          <span className="text-2xl block mb-1">{p.icon}</span>
                          <p className="text-white text-[10px] font-bold">{p.label}</p>
                          <p className="text-blue-400 text-[8px]">{p.hc} HC</p>
                          <p className="text-purple-400 text-[8px]">{p.hp} HP</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {user && (
              <div className="card-glow bg-black/30 rounded-2xl p-3 border border-pink-500/10 mb-5">
                <p className="text-[9px] text-pink-400 mb-1.5 uppercase font-bold">Anniversaire</p>
                <div className="flex gap-2">
                  <input type="date" value={anniversaire} onChange={e => setAnniversaire(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none" />
                  <button onClick={sauvegarderAnniversaire} className="px-3 py-2 rounded-lg font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs">💾</button>
                </div>
              </div>
            )}
            <div className="space-y-3">
              {joueurs.filter((j: any) => j.actif !== false).map((j: any, idx: number) => {
                const userDoc = allPasses.find((p: any) => p.pseudo === j.pseudo)
                const playerAvatar = allPasses.find((p: any) => p.pseudo === j.pseudo)?.avatarUrl
                return (
                  <div key={j.id} className="card-glow bg-black/30 rounded-3xl p-4 border border-[#D4AF37]/15 flex items-center gap-4" style={{ animationDelay: (idx * 0.1) + 's' }}>
                    <div className="relative">
                      {playerAvatar ? (
                        <img src={playerAvatar} alt={j.pseudo} className="w-14 h-14 rounded-2xl object-cover border border-[#D4AF37]/30 shadow-xl" />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-black flex items-center justify-center text-[#D4AF37] font-black text-xl border border-[#D4AF37]/15">{j.pseudo[0]?.toUpperCase()}</div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-pulse"></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-white text-base">{j.pseudo}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">{j.role}</p>
                      {userDoc && (
                        <div className="flex gap-3 mt-1">
                          <span className="text-[9px] text-blue-400 font-black">{(userDoc.hcTotal || 0) - (userDoc.hcUsed || 0)} HC</span>
                          <span className="text-[9px] text-purple-400 font-black">{(userDoc.hpTotal || 0) - (userDoc.hpUsed || 0)} HP</span>
                        </div>
                      )}
                    </div>
                    {isAdmin && <button onClick={() => del('players', j.id)} className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500/40 flex items-center justify-center">🗑️</button>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <H title="Statistiques" icon="📈" />
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="card-glow bg-[#D4AF37]/10 rounded-2xl p-4 border border-[#D4AF37]/15 text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">{winRate}%</p>
                <p className="text-[9px] text-gray-600 mt-1.5 uppercase">Win Rate</p>
              </div>
              <div className="card-glow bg-[#D4AF37]/10 rounded-2xl p-4 border border-[#D4AF37]/15 text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">{totalMatchs}</p>
                <p className="text-[9px] text-gray-600 mt-1.5 uppercase">Matchs</p>
              </div>
            </div>
            <button onClick={() => setShowBilan(true)} className="w-full py-3 rounded-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm">Bilan du mois</button>
            {showBilan && (() => { const b = genBilan(); return (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-start pt-16 justify-center z-50 p-4">
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-6 w-full max-w-sm border border-white/10">
                  <h3 className="text-lg font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-5 text-center">Bilan {b.nom}</h3>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-white/5 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-white">{b.m}</p><p className="text-[9px] text-gray-600">Matchs</p></div>
                    <div className="bg-green-500/10 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-green-400">{b.w}W</p><p className="text-[9px] text-gray-600">Vic.</p></div>
                    <div className="bg-red-500/10 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-red-400">{b.l}L</p><p className="text-[9px] text-gray-600">Def.</p></div>
                  </div>
                  <div className="bg-[#D4AF37]/10 rounded-xl p-4 border border-[#D4AF37]/15 text-center mb-3">
                    <p className="text-4xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">{b.wr}%</p>
                  </div>
                  <button onClick={() => setShowBilan(false)} className="w-full py-2.5 rounded-xl font-bold bg-white/5 border border-white/10 text-gray-400 text-sm">Fermer</button>
                </div>
              </div>
            ) })()}
          </div>
        )}

        {activeTab === 'logs' && (
          <div>
            <H title="Logs" icon="📋" />
            {logs.length === 0 ? (
              <div className="text-center py-10 text-gray-600">Aucune activite</div>
            ) : (
              <div className="space-y-2">
                {logs.map((l: any, idx: number) => (
                  <div key={l.id || idx} className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-bold text-xs flex-shrink-0">{l.joueur?.[0]?.toUpperCase() || '?'}</div>
                    <div className="flex-1">
                      <p className="text-white text-xs"><span className="text-[#D4AF37] font-bold">{l.joueur}</span> {l.action}</p>
                      <p className="text-gray-700 text-[9px] mt-0.5">{fts(l.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'admin' && (
          <div>
            <H title="Admin" icon="⚙️" />
            {!isAdmin ? (
              <div className="card-glow bg-black/30 rounded-3xl p-5 border border-[#D4AF37]/15">
                <input type="password" placeholder="Mot de passe admin" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-3 text-white text-sm focus:outline-none" />
                <button onClick={handleAdminLogin} className="w-full py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-sm">Connexion Admin</button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="card-glow bg-[#D4AF37]/10 rounded-2xl p-4 border border-[#D4AF37]/15"><p className="text-[8px] text-gray-500 uppercase font-black mb-1">Activite</p><p className="text-[#D4AF37] font-bold text-xs">{logs[0]?.joueur || '-'}</p></div>
                  <div className="card-glow bg-blue-500/10 rounded-2xl p-4 border border-blue-500/15"><p className="text-[8px] text-gray-500 uppercase font-black mb-1">Membres</p><p className="text-blue-400 font-bold text-xs">{joueurs.length}</p></div>
                  <div className="card-glow bg-green-500/10 rounded-2xl p-4 border border-green-500/15"><p className="text-[8px] text-gray-500 uppercase font-black mb-1">Victoires</p><p className="text-green-400 font-bold text-xs">{victoires}</p></div>
                  <div className="card-glow bg-red-500/10 rounded-2xl p-4 border border-red-500/15"><p className="text-[8px] text-gray-500 uppercase font-black mb-1">Videos/Kills</p><p className="text-red-400 font-bold text-xs">{stratVideos.length}V / {killSessions.length}K</p></div>
                </div>
                <div className="card-glow bg-black/30 rounded-3xl p-5 border border-[#D4AF37]/15">
                  <h3 className="text-xs font-bold text-[#D4AF37] mb-3 uppercase">Planifier Match</h3>
                  <input type="text" placeholder="Adversaire" value={nouveauMatch.adversaire} onChange={e => setNouveauMatch({ ...nouveauMatch, adversaire: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 mb-2 text-white text-sm focus:outline-none" />
                  <input type="date" value={nouveauMatch.date} onChange={e => setNouveauMatch({ ...nouveauMatch, date: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 mb-2 text-white text-sm focus:outline-none" />
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input type="time" value={nouveauMatch.horaire1} onChange={e => setNouveauMatch({ ...nouveauMatch, horaire1: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none" />
                    <input type="time" value={nouveauMatch.horaire2} onChange={e => setNouveauMatch({ ...nouveauMatch, horaire2: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <select value={nouveauMatch.arene} onChange={e => setNouveauMatch({ ...nouveauMatch, arene: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm"><option value="Arène 1">Arene 1</option><option value="Arène 2">Arene 2</option></select>
                    <select value={nouveauMatch.type} onChange={e => setNouveauMatch({ ...nouveauMatch, type: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm"><option value="Ligue">Ligue</option><option value="Scrim">Scrim</option><option value="Tournoi">Tournoi</option><option value="Division">Division</option></select>
                  </div>
                  {nouveauMatch.type === 'Division' && (
                    <div className="bg-white/5 rounded-xl p-3 mb-2 border border-white/5">
                      <div className="flex justify-between mb-2"><p className="text-[10px] text-[#D4AF37] font-bold uppercase">Sous-matchs</p><button onClick={ajouterSousMatch} className="px-2 py-1 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] text-xs">+</button></div>
                      {nouveauMatch.sousMatchs.length > 0 ? (
                        <div className="space-y-1">{nouveauMatch.sousMatchs.map((sm, i) => (
                          <div key={i} className="flex justify-between bg-black/30 rounded-lg px-2 py-1.5">
                            <div><p className="text-[9px] text-gray-400">{sm.adversaire}</p><p className="text-[10px] font-bold"><span className="text-[#D4AF37]">{sm.scoreDyno}</span>-<span className="text-gray-500">{sm.scoreAdv}</span></p></div>
                            <button onClick={() => supprimerSousMatch(i)} className="text-red-400/40 text-xs">🗑️</button>
                          </div>
                        ))}</div>
                      ) : <p className="text-[9px] text-gray-600 text-center">Aucun</p>}
                    </div>
                  )}
                  <button onClick={ajouterMatch} className="w-full py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-sm">Creer + Discord</button>
                </div>
                <div className="card-glow bg-black/30 rounded-3xl p-5 border border-[#D4AF37]/15">
                  <h3 className="text-xs font-bold text-[#D4AF37] mb-3 uppercase">Gestion Matchs</h3>
                  <div className="space-y-1.5">
                    {matchs.map((m: any) => (
                      <div key={m.id} className="flex justify-between bg-white/5 rounded-xl p-2.5 border border-white/5">
                        <div><p className="text-[#D4AF37] font-bold text-[10px]">{m.adversaire}</p><p className="text-gray-700 text-[9px]">{fdf(m.date)}</p></div>
                        <div className="flex items-center gap-1.5">
                          {m.termine && <button onClick={() => setEditHistoriqueScore({ id: m.id, adversaire: m.adversaire || '', scoreDyno: String(m.scoreDyno || 0), scoreAdv: String(m.scoreAdversaire || 0), type: m.type || 'Ligue', arene: m.arene || 'Arene 1', date: m.date || '', termine: true, sousMatchs: m.sousMatchs || [] })} className="text-[#D4AF37]/60 text-sm">✏️</button>}
                          <button onClick={() => del('matchs', m.id)} className="text-red-400/40">🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card-glow bg-black/30 rounded-3xl p-5 border border-[#D4AF37]/15">
                  <h3 className="text-xs font-bold text-[#D4AF37] mb-3 uppercase">Ajouter Replay</h3>
                  <input type="text" placeholder="Titre" value={nouveauReplay.titre} onChange={e => setNouveauReplay({ ...nouveauReplay, titre: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 mb-2 text-white text-sm focus:outline-none" />
                  <input type="text" placeholder="Lien YouTube" value={nouveauReplay.lien} onChange={e => setNouveauReplay({ ...nouveauReplay, lien: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 mb-2 text-white text-sm focus:outline-none" />
                  <button onClick={ajouterReplay} className="w-full py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-sm">Publier</button>
                </div>
                <div className="card-glow bg-black/30 rounded-3xl p-5 border border-[#D4AF37]/15">
                  <h3 className="text-xs font-bold text-[#D4AF37] mb-3 uppercase">Saisir Scores</h3>
                  {prochainsMatchs.length === 0 ? <p className="text-gray-700 text-center text-xs">Aucun</p> : (
                    <div className="space-y-2">
                      {prochainsMatchs.map((m: any) => (
                        <div key={m.id} className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center justify-between">
                          <p className="font-bold text-[#D4AF37] text-xs">vs {m.adversaire}</p>
                          <button onClick={() => setScoreEdit({ id: m.id, scoreDyno: '', scoreAdv: '' })} className="px-3 py-1.5 rounded-lg font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-[10px]">Score</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={handleAdminLogout} className="w-full bg-white/5 border border-red-500/15 text-red-400 py-2.5 rounded-xl font-bold text-sm">Deconnexion Admin</button>
              </div>
            )}
          </div>
        )}
      </main>

      {scoreEdit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-start pt-16 justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-6 w-full max-w-sm border border-white/10">
            <h3 className="text-lg font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-5 text-center">Score</h3>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div><label className="text-gray-600 text-[10px] mb-1 block uppercase text-center">DYNO</label><input type="number" placeholder="0" value={scoreEdit.scoreDyno} onChange={e => setScoreEdit({ ...scoreEdit, scoreDyno: e.target.value })} className="w-full bg-white/5 border border-[#D4AF37]/30 rounded-xl px-4 py-4 text-white text-center text-3xl font-bold focus:outline-none" /></div>
              <div><label className="text-gray-600 text-[10px] mb-1 block uppercase text-center">Adversaire</label><input type="number" placeholder="0" value={scoreEdit.scoreAdv} onChange={e => setScoreEdit({ ...scoreEdit, scoreAdv: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-center text-3xl font-bold focus:outline-none" /></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setScoreEdit(null)} className="flex-1 py-2.5 rounded-xl font-bold bg-white/5 border border-white/10 text-gray-500 text-sm">Annuler</button>
              <button onClick={updateScore} className="flex-1 py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-sm">OK</button>
            </div>
          </div>
        </div>
      )}

      {editHistoriqueScore && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-start pt-16 justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-6 w-full max-w-sm border border-white/10 max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-5 text-center">Modifier</h3>
            <div className="space-y-3 mb-5">
              <div><label className="text-gray-600 text-[10px] mb-1 block uppercase">Adversaire</label><input type="text" value={editHistoriqueScore.adversaire} onChange={e => setEditHistoriqueScore({ ...editHistoriqueScore, adversaire: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none" /></div>
              <div><label className="text-gray-600 text-[10px] mb-1 block uppercase">Date</label><input type="date" value={editHistoriqueScore.date?.includes('/') ? (() => { const p = editHistoriqueScore.date.split('/'); return p[2] + '-' + p[1] + '-' + p[0] })() : editHistoriqueScore.date} onChange={e => setEditHistoriqueScore({ ...editHistoriqueScore, date: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-gray-600 text-[10px] mb-1 block uppercase">Type</label><select value={editHistoriqueScore.type} onChange={e => setEditHistoriqueScore({ ...editHistoriqueScore, type: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm"><option value="Ligue">Ligue</option><option value="Scrim">Scrim</option><option value="Tournoi">Tournoi</option><option value="Division">Division</option></select></div>
                <div><label className="text-gray-600 text-[10px] mb-1 block uppercase">Arene</label><select value={editHistoriqueScore.arene} onChange={e => setEditHistoriqueScore({ ...editHistoriqueScore, arene: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm"><option value="Arène 1">Arene 1</option><option value="Arène 2">Arene 2</option></select></div>
              </div>
              {editHistoriqueScore.type === 'Division' ? (
                <div className="bg-white/5 rounded-xl p-3 border border-orange-500/15">
                  <div className="flex justify-between mb-2"><p className="text-[10px] text-orange-400 font-bold uppercase">Sous-matchs</p><button onClick={ajouterEditSousMatch} className="px-2 py-1 rounded-lg bg-orange-500/20 text-orange-400 text-xs">+</button></div>
                  {(editHistoriqueScore.sousMatchs || []).length > 0 ? (
                    <div className="space-y-1">{(editHistoriqueScore.sousMatchs || []).map((sm: any, i: number) => (
                      <div key={i} className="flex justify-between bg-black/30 rounded-lg px-2 py-1.5">
                        <div><p className="text-[9px] text-gray-400">{sm.adversaire}</p><p className="text-[10px] font-bold"><span className="text-[#D4AF37]">{sm.scoreDyno}</span>-<span className="text-gray-500">{sm.scoreAdv}</span></p></div>
                        <button onClick={() => supprimerEditSousMatch(i)} className="text-red-400/40 text-xs">🗑️</button>
                      </div>
                    ))}</div>
                  ) : <p className="text-[9px] text-gray-600 text-center">Aucun</p>}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-gray-600 text-[10px] mb-1 block uppercase">DYNO</label><input type="number" value={editHistoriqueScore.scoreDyno} onChange={e => setEditHistoriqueScore({ ...editHistoriqueScore, scoreDyno: e.target.value })} className="w-full bg-white/5 border border-[#D4AF37]/20 rounded-xl px-4 py-3 text-white text-center text-2xl font-bold focus:outline-none" /></div>
                  <div><label className="text-gray-600 text-[10px] mb-1 block uppercase">Adv</label><input type="number" value={editHistoriqueScore.scoreAdv} onChange={e => setEditHistoriqueScore({ ...editHistoriqueScore, scoreAdv: e.target.value })} className="w-full bg-white/5 border border-red-500/20 rounded-xl px-4 py-3 text-white text-center text-2xl font-bold focus:outline-none" /></div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditHistoriqueScore(null)} className="flex-1 py-2.5 rounded-xl font-bold bg-white/5 border border-white/10 text-gray-500 text-sm">Annuler</button>
              <button onClick={updateHistoriqueScore} className="flex-1 py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-sm">OK</button>
            </div>
          </div>
        </div>
      )}

      {!user && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <P />
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-7 w-full max-w-sm border border-[#D4AF37]/20 relative z-10 shadow-[0_0_50px_rgba(212,175,55,0.15)]">
            <img src={LG} alt="D" className="w-20 h-20 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]" />
            <h3 className="text-xl font-black bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-6 text-center uppercase tracking-widest">{isSignUp ? 'REJOINDRE DYNO' : 'ACCES EQUIPE'}</h3>
            {isSignUp && <input type="text" placeholder="Pseudo" value={pseudo} onChange={e => setPseudo(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-3 text-white text-sm focus:outline-none" />}
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-3 text-white text-sm focus:outline-none" />
            <input type="password" placeholder="Mot de passe" value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-6 text-white text-sm focus:outline-none" />
            {isSignUp ? (
              <button onClick={handleSignUp} className="w-full py-4 rounded-2xl font-black bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black mb-4 text-sm">CREER LE COMPTE</button>
            ) : (
              <button onClick={handleSignIn} className="w-full py-4 rounded-2xl font-black bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black mb-4 text-sm">SE CONNECTER</button>
            )}
            <div className="border-t border-white/5 pt-4 text-center">
              {isSignUp ? (
                <button onClick={() => setIsSignUp(false)} className="text-[#D4AF37] text-[10px] font-bold hover:underline uppercase opacity-70">Deja membre ? Connexion</button>
              ) : (
                <button onClick={() => setIsSignUp(true)} className="text-[#D4AF37] text-[10px] font-bold hover:underline uppercase opacity-70">Pas encore de compte ? Rejoindre</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App