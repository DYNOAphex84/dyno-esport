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

// ====== CONFIG ======
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
  'Engine','Helios','Silva','The Cliff','Artefact',
  'Outlaw','Atlantis','Horizon','Polaris','Lunar','Ceres'
]

const P = () => (
  <div className="particles">
    {Array.from({ length: 12 }).map((_, i) => (
      <div key={i} className="particle" />
    ))}
  </div>
)

// ====== APP ======
function App() {
  // State
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

  // Data
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

  // Forms
  const [nouveauMatch, setNouveauMatch] = useState({
    adversaire: '', date: '', horaire1: '', horaire2: '',
    arene: 'Arène 1', type: 'Ligue',
    sousMatchs: [] as {
      adversaire: string,
      scoreDyno: string,
      scoreAdv: string
    }[]
  })
  const [scoreEdit, setScoreEdit] = useState<any>(null)
  const [editHistoriqueScore, setEditHistoriqueScore] = useState<any>(null)
  const [nouveauReplay, setNouveauReplay] = useState({
    titre: '', lien: ''
  })
  const [nouvelleNote, setNouvelleNote] = useState({
    matchId: '', mental: '', communication: '', gameplay: ''
  })
  const [selectedMatchForNotes, setSelectedMatchForNotes] = useState<any>(null)
  const [nouvelleStrat, setNouvelleStrat] = useState({
    adversaire: '', picks: [] as string[], bans: [] as string[]
  })
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
  const [nouvelleAnalyse, setNouvelleAnalyse] = useState({
    bien: '', mal: '', plan: ''
  })
  const [showAddFiche, setShowAddFiche] = useState(false)
  const [nouvelleFiche, setNouvelleFiche] = useState({
    adversaire: '', forces: '', faiblesses: '', notes: ''
  })

  const pm = useRef(0)
  const pn = useRef(0)
  const pc = useRef(0)
  const ps = useRef(0)
  const ty = useRef(0)

  // ====== EFFECTS ======
  useEffect(() => {
    if (window.location.search.includes('reset=1')) {
      localStorage.clear()
      window.location.href = window.location.pathname
    }
  }, [])

  const sendNotification = useCallback(
    (t: string, b: string, tg?: string) => {
      try {
        if (
          !('Notification' in window) ||
          Notification.permission !== 'granted'
        ) return
        const n = new Notification(t, {
          body: b, icon: LG, badge: LG,
          tag: tg || 'd', requireInteraction: false
        })
        n.onclick = () => { window.focus(); n.close() }
      } catch {}
    }, []
  )

  const requestNotificationPermission = async () => {
    try {
      if (!('Notification' in window)) {
        alert('❌'); return
      }
      const p = await Notification.requestPermission()
      if (p === 'granted') {
        setNotificationsEnabled(true)
        localStorage.setItem('dyno-notifs', 'true')
        alert('✅ Notifs activées !')
      } else {
        setNotificationsEnabled(false)
        localStorage.setItem('dyno-notifs', 'false')
        alert('❌')
      }
    } catch { alert('❌') }
  }

  const getMatchDateTime = useCallback(
    (m: any): Date | null => {
      if (!m?.date) return null
      let d = m.date
      const t = m.horaires?.[0] || m.horaire1 || '20:00'
      if (d.includes('/')) {
        const [dd, mm, yy] = d.split('/')
        d = yy + '-' + mm + '-' + dd
      }
      try {
        const dt = new Date(d + 'T' + t + ':00')
        return isNaN(dt.getTime()) ? null : dt
      } catch { return null }
    }, []
  )

  // Notifications init
  useEffect(() => {
    try {
      if (
        'Notification' in window &&
        Notification.permission === 'granted' &&
        localStorage.getItem('dyno-notifs') === 'true'
      ) setNotificationsEnabled(true)
    } catch {}
    try {
      setNotifiedMatchs(
        JSON.parse(localStorage.getItem('dyno-notified') || '[]')
      )
    } catch { setNotifiedMatchs([]) }
  }, [])

  // Match notifications
  useEffect(() => {
    if (!notificationsEnabled) return
    try {
      if (
        !('Notification' in window) ||
        Notification.permission !== 'granted'
      ) return
    } catch { return }
    const ck = () => {
      const now = new Date()
      matchs.forEach((m: any) => {
        if (m.termine) return
        const mt = getMatchDateTime(m)
        if (!mt) return
        const dm = (mt.getTime() - now.getTime()) / 60000
        const k1 = m.id + '-1h'
        if (dm > 55 && dm <= 65 && !notifiedMatchs.includes(k1)) {
          sendNotification(
            '🎮 1h !',
            'DYNO vs ' + m.adversaire, 'm1h'
          )
          const u = [...notifiedMatchs, k1]
          setNotifiedMatchs(u)
          localStorage.setItem('dyno-notified', JSON.stringify(u))
        }
        const k2 = m.id + '-15m'
        if (dm > 10 && dm <= 20 && !notifiedMatchs.includes(k2)) {
          sendNotification(
            '🔥 15min !',
            'DYNO vs ' + m.adversaire, 'm15'
          )
          const u = [...notifiedMatchs, k2]
          setNotifiedMatchs(u)
          localStorage.setItem('dyno-notified', JSON.stringify(u))
        }
        const k3 = m.id + '-now'
        if (dm >= -2 && dm <= 3 && !notifiedMatchs.includes(k3)) {
          sendNotification(
            '⚡ GO !',
            'DYNO vs ' + m.adversaire, 'mnow'
          )
          const u = [...notifiedMatchs, k3]
          setNotifiedMatchs(u)
          localStorage.setItem('dyno-notified', JSON.stringify(u))
        }
      })
    }
    ck()
    const i = setInterval(ck, 60000)
    return () => clearInterval(i)
  }, [notificationsEnabled, matchs, notifiedMatchs,
    sendNotification, getMatchDateTime])

  // Countdowns
  useEffect(() => {
    const u = () => {
      const now = new Date()
      const c: Record<string, string> = {}
      matchs.forEach((m: any) => {
        if (m.termine) return
        const mt = getMatchDateTime(m)
        if (!mt) return
        const df = mt.getTime() - now.getTime()
        if (df <= 0) {
          c[m.id] = '🔴 EN COURS'
          return
        }
        const j = Math.floor(df / 86400000)
        const h = Math.floor((df % 86400000) / 3600000)
        const mi = Math.floor((df % 3600000) / 60000)
        const s = Math.floor((df % 60000) / 1000)
        c[m.id] = (j > 0 ? j + 'j ' : '') +
          ((h > 0 || j > 0) ? h + 'h ' : '') +
          mi + 'm ' + s + 's'
      })
      setCountdowns(c)
    }
    u()
    const i = setInterval(u, 1000)
    return () => clearInterval(i)
  }, [matchs, getMatchDateTime])

  // Admin persistence
  useEffect(() => {
    if (localStorage.getItem('dyno-admin') === 'true') {
      setIsAdmin(true)
    }
  }, [])

  // Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u: any) => {
      setUser(u)
      if (u) {
        const d = await getDoc(doc(db, 'users', u.uid))
        if (d.exists()) {
          const data = d.data()
          setPseudo(data.pseudo || '')
          if (data.anniversaire) setAnniversaire(data.anniversaire)
          if (u.email === AE || data.isAdmin) {
            setIsAdmin(true)
            localStorage.setItem('dyno-admin', 'true')
          }
        }
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  // Firestore listeners
  useEffect(() => {
    const q = query(
      collection(db, 'matchs'), orderBy('createdAt', 'desc')
    )
    const u = onSnapshot(q, (s: any) => {
      const d: any[] = []
      s.forEach((x: any) => d.push({ id: x.id, ...x.data() }))
      setMatchs(d)
    })
    return () => u()
  }, [])

  useEffect(() => {
    const q = query(
      collection(db, 'notes'), orderBy('createdAt', 'desc')
    )
    const u = onSnapshot(q, (s: any) => {
      const d: any[] = []
      s.forEach((x: any) => d.push({ id: x.id, ...x.data() }))
      setNotes(d)
    })
    return () => u()
  }, [])

  useEffect(() => {
    const q = query(
      collection(db, 'commentaires'), orderBy('createdAt', 'desc')
    )
    const u = onSnapshot(q, (s: any) => {
      const d: any[] = []
      s.forEach((x: any) => d.push({ id: x.id, ...x.data() }))
      setCommentaires(d)
    })
    return () => u()
  }, [])

  useEffect(() => {
    const q = query(
      collection(db, 'strats'), orderBy('createdAt', 'desc')
    )
    const u = onSnapshot(q, (s: any) => {
      const d: any[] = []
      s.forEach((x: any) => d.push({ id: x.id, ...x.data() }))
      setStrats(d)
    })
    return () => u()
  }, [])

  useEffect(() => {
    const q = query(
      collection(db, 'replays'), orderBy('createdAt', 'desc')
    )
    const u = onSnapshot(q, (s: any) => {
      const d: any[] = []
      s.forEach((x: any) => d.push({ id: x.id, ...x.data() }))
      setReplays(d)
    })
    return () => u()
  }, [])

  useEffect(() => {
    const q = query(
      collection(db, 'players'), orderBy('createdAt', 'desc')
    )
    const u = onSnapshot(q, (s: any) => {
      const d: any[] = []
      s.forEach((x: any) => d.push({ id: x.id, ...x.data() }))
      setJoueurs(d)
    })
    return () => u()
  }, [])

  useEffect(() => {
    const q = query(
      collection(db, 'compos'), orderBy('createdAt', 'desc')
    )
    const u = onSnapshot(q, (s: any) => {
      const d: any[] = []
      s.forEach((x: any) => d.push({ id: x.id, ...x.data() }))
      setCompos(d)
    })
    return () => u()
  }, [])

  useEffect(() => {
    const q = query(
      collection(db, 'objectifs'), orderBy('createdAt', 'desc')
    )
    const u = onSnapshot(q, (s: any) => {
      const d: any[] = []
      s.forEach((x: any) => d.push({ id: x.id, ...x.data() }))
      setObjectifs(d)
    })
    return () => u()
  }, [])

  useEffect(() => {
    const q = query(
      collection(db, 'analyses'), orderBy('createdAt', 'desc')
    )
    const u = onSnapshot(q, (s: any) => {
      const d: any[] = []
      s.forEach((x: any) => d.push({ id: x.id, ...x.data() }))
      setAnalyses(d)
    })
    return () => u()
  }, [])

  useEffect(() => {
    const q = query(
      collection(db, 'fichesAdversaires'),
      orderBy('createdAt', 'desc')
    )
    const u = onSnapshot(q, (s: any) => {
      const d: any[] = []
      s.forEach((x: any) => d.push({ id: x.id, ...x.data() }))
      setFichesAdversaires(d)
    })
    return () => u()
  }, [])

  // New data notifications
  useEffect(() => {
    if (!notificationsEnabled || pm.current === 0) {
      pm.current = matchs.length; return
    }
    if (matchs.length > pm.current) {
      const n = matchs[0]
      if (n) sendNotification(
        '📅 Match !', 'DYNO vs ' + n.adversaire, 'nm'
      )
    }
    pm.current = matchs.length
  }, [matchs, notificationsEnabled, sendNotification])

  useEffect(() => {
    if (!notificationsEnabled || pn.current === 0) {
      pn.current = notes.length; return
    }
    if (notes.length > pn.current) {
      const n = notes[0]
      if (n) sendNotification('📊 Note !', n.joueur, 'nn')
    }
    pn.current = notes.length
  }, [notes, notificationsEnabled, sendNotification])

  useEffect(() => {
    if (!notificationsEnabled || pc.current === 0) {
      pc.current = commentaires.length; return
    }
    if (commentaires.length > pc.current) {
      const n = commentaires[0]
      if (n) sendNotification(
        '💬 !',
        n.joueur + ': ' + n.texte.substring(0, 50), 'nc'
      )
    }
    pc.current = commentaires.length
  }, [commentaires, notificationsEnabled, sendNotification])

  useEffect(() => {
    if (!notificationsEnabled || ps.current === 0) {
      ps.current = strats.length; return
    }
    if (strats.length > ps.current) {
      const n = strats[0]
      if (n) sendNotification(
        '🎯 Strat !', 'DYNO vs ' + n.adversaire, 'ns'
      )
    }
    ps.current = strats.length
  }, [strats, notificationsEnabled, sendNotification])

  // Weekly report
  useEffect(() => {
    if (!notificationsEnabled) return
    const ck = () => {
      const now = new Date()
      if (now.getDay() === 1 && now.getHours() === 9) {
        const lw = localStorage.getItem('dyno-weekly')
        const tw = now.getFullYear() + '-W' +
          Math.ceil(now.getDate() / 7)
        if (lw !== tw) {
          const wm = matchs.filter(
            (m: any) => m.termine &&
              (Date.now() - m.createdAt) < 604800000
          )
          const ww = wm.filter(
            (m: any) => (m.scoreDyno || 0) >
              (m.scoreAdversaire || 0)
          ).length
          const wl = wm.filter(
            (m: any) => (m.scoreDyno || 0) <
              (m.scoreAdversaire || 0)
          ).length
          sendNotification(
            '📧 Semaine',
            wm.length + ' matchs ' + ww + 'W-' + wl + 'L', 'wk'
          )
          localStorage.setItem('dyno-weekly', tw)
        }
      }
    }
    ck()
    const i = setInterval(ck, 3600000)
    return () => clearInterval(i)
  }, [notificationsEnabled, matchs, sendNotification])

  // Splash
  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2500)
    return () => clearTimeout(t)
  }, [])

  // Install prompt
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    })
  }, [])

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      setDeferredPrompt(null)
      setShowInstall(false)
    }
  }

  // ====== AUTH FUNCTIONS ======
  const handleSignUp = async () => {
    if (!email || !authPassword || !pseudo) {
      alert('⚠️ Remplis tout !'); return
    }
    try {
      const r = await createUserWithEmailAndPassword(
        auth, email, authPassword
      )
      await setDoc(doc(db, 'users', r.user.uid), {
        pseudo, email, createdAt: Date.now(),
        isAdmin: email === AE
      })
      await addDoc(collection(db, 'players'), {
        pseudo, role: 'Joueur', rang: 'Nouveau',
        userId: r.user.uid, createdAt: Date.now()
      })
      alert('✅!')
      setIsSignUp(false)
      setEmail('')
      setAuthPassword('')
    } catch (e: any) { alert('❌ ' + e.message) }
  }

  const handleSignIn = async () => {
    if (!email || !authPassword) {
      alert('⚠️!'); return
    }
    try {
      await setPersistence(auth, browserLocalPersistence)
      await signInWithEmailAndPassword(
        auth, email, authPassword
      )
      localStorage.setItem('user-email', email)
      alert('✅!')
      setEmail('')
      setAuthPassword('')
    } catch (e: any) { alert('❌ ' + e.message) }
  }

  const handleSignOut = async () => {
    await signOut(auth)
    setPseudo('')
    setIsAdmin(false)
    localStorage.removeItem('dyno-admin')
    localStorage.removeItem('user-email')
    alert('✅!')
  }

  const handleAdminLogin = () => {
    if (adminPassword === 'dyno2026') {
      setIsAdmin(true)
      localStorage.setItem('dyno-admin', 'true')
      setAdminPassword('')
    } else alert('❌!')
  }

  const handleAdminLogout = () => {
    setIsAdmin(false)
    localStorage.removeItem('dyno-admin')
  }

  // ====== MATCH FUNCTIONS ======
  const ajouterSousMatch = () => {
    const adv = prompt('Adversaire :')
    if (!adv) return
    const sd = prompt('Score DYNO :')
    if (!sd) return
    const sa = prompt('Score ' + adv + ' :')
    if (!sa) return
    setNouveauMatch({
      ...nouveauMatch,
      sousMatchs: [
        ...nouveauMatch.sousMatchs,
        { adversaire: adv, scoreDyno: sd, scoreAdv: sa }
      ]
    })
  }

  const supprimerSousMatch = (i: number) => {
    const sm = [...nouveauMatch.sousMatchs]
    sm.splice(i, 1)
    setNouveauMatch({ ...nouveauMatch, sousMatchs: sm })
  }

  const ajouterEditSousMatch = () => {
    if (!editHistoriqueScore) return
    const adv = prompt('Adversaire :')
    if (!adv) return
    const sd = prompt('Score DYNO :')
    if (!sd) return
    const sa = prompt('Score ' + adv + ' :')
    if (!sa) return
    setEditHistoriqueScore({
      ...editHistoriqueScore,
      sousMatchs: [
        ...(editHistoriqueScore.sousMatchs || []),
        { adversaire: adv, scoreDyno: sd, scoreAdv: sa }
      ]
    })
  }

  const supprimerEditSousMatch = (i: number) => {
    if (!editHistoriqueScore) return
    const sm = [...(editHistoriqueScore.sousMatchs || [])]
    sm.splice(i, 1)
    setEditHistoriqueScore({
      ...editHistoriqueScore,
      sousMatchs: sm
    })
  }

  const ajouterMatch = async () => {
    if (
      !nouveauMatch.adversaire ||
      !nouveauMatch.date ||
      !nouveauMatch.horaire1
    ) {
      alert('⚠️!'); return
    }
    const md: any = {
      ...nouveauMatch,
      termine: false,
      disponibles: [],
      indisponibles: [],
      createdAt: Date.now()
    }
    if (
      nouveauMatch.type === 'Division' &&
      nouveauMatch.sousMatchs.length > 0
    ) {
      md.termine = true
      md.sousMatchs = nouveauMatch.sousMatchs
      md.scoreDyno = nouveauMatch.sousMatchs.reduce(
        (a: number, s: any) => a + parseInt(s.scoreDyno || '0'), 0
      )
      md.scoreAdversaire = nouveauMatch.sousMatchs.reduce(
        (a: number, s: any) => a + parseInt(s.scoreAdv || '0'), 0
      )
    }
    await addDoc(collection(db, 'matchs'), md)
    const h = [nouveauMatch.horaire1]
    if (nouveauMatch.horaire2) h.push(nouveauMatch.horaire2)
    try {
      await fetch(DW, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: '🎮 DYNO vs ' + nouveauMatch.adversaire,
            color: 13934871,
            fields: [
              {
                name: '⚔️', inline: true,
                value: nouveauMatch.adversaire
              },
              {
                name: '📅', inline: true,
                value: nouveauMatch.date
              },
              {
                name: '⏰', inline: true,
                value: h.join(' / ')
              },
              {
                name: '🏟️', inline: true,
                value: nouveauMatch.arene
              },
              {
                name: '📊', inline: true,
                value: nouveauMatch.type
              }
            ],
            footer: { text: 'DYNO', icon_url: LG }
          }]
        })
      })
    } catch {}
    setNouveauMatch({
      adversaire: '', date: '', horaire1: '', horaire2: '',
      arene: 'Arène 1', type: 'Ligue', sousMatchs: []
    })
    alert('✅!')
  }

  const ajouterReplay = async () => {
    if (!nouveauReplay.titre || !nouveauReplay.lien) {
      alert('⚠️!'); return
    }
    await addDoc(collection(db, 'replays'), {
      ...nouveauReplay, createdAt: Date.now()
    })
    setNouveauReplay({ titre: '', lien: '' })
    alert('✅!')
  }

  const ajouterNote = async () => {
    if (!user) return
    await addDoc(collection(db, 'notes'), {
      matchId: selectedMatchForNotes?.id,
      joueur: pseudo,
      joueurId: user.uid,
      mental: nouvelleNote.mental,
      communication: nouvelleNote.communication,
      gameplay: nouvelleNote.gameplay,
      createdAt: Date.now()
    })
    setNouvelleNote({
      matchId: '', mental: '', communication: '', gameplay: ''
    })
    setSelectedMatchForNotes(null)
    alert('✅!')
  }

  const ajouterCommentaire = async (id: string) => {
    if (!user || !nouveauCommentaire.trim()) return
    await addDoc(collection(db, 'commentaires'), {
      matchId: id,
      joueur: pseudo,
      joueurId: user.uid,
      texte: nouveauCommentaire.trim(),
      createdAt: Date.now()
    })
    setNouveauCommentaire('')
    setSelectedMatchForComment(null)
    alert('✅!')
  }

  const ajouterStrat = async () => {
    if (
      !nouvelleStrat.adversaire ||
      nouvelleStrat.picks.length === 0 ||
      nouvelleStrat.bans.length === 0
    ) {
      alert('⚠️!'); return
    }
    await addDoc(collection(db, 'strats'), {
      adversaire: nouvelleStrat.adversaire,
      picks: nouvelleStrat.picks,
      bans: nouvelleStrat.bans,
      auteur: pseudo || 'Anonyme',
      auteurId: user?.uid || null,
      createdAt: Date.now()
    })
    setNouvelleStrat({ adversaire: '', picks: [], bans: [] })
    setShowAddStrat(false)
    alert('✅!')
  }

  const ajouterCompo = async () => {
    if (!selectedMapCompo || compoJoueurs.length === 0) {
      alert('⚠️!'); return
    }
    const ex = compos.find((c: any) => c.map === selectedMapCompo)
    if (ex) {
      await updateDoc(doc(db, 'compos', ex.id), {
        joueurs: compoJoueurs, updatedAt: Date.now()
      })
    } else {
      await addDoc(collection(db, 'compos'), {
        map: selectedMapCompo,
        joueurs: compoJoueurs,
        auteur: pseudo,
        createdAt: Date.now()
      })
    }
    setShowAddCompo(false)
    setSelectedMapCompo('')
    setCompoJoueurs([])
    alert('✅!')
  }

  const toggleCompoJoueur = (n: string) => {
    if (compoJoueurs.includes(n)) {
      setCompoJoueurs(compoJoueurs.filter(j => j !== n))
    } else {
      setCompoJoueurs([...compoJoueurs, n])
    }
  }

  const sauvegarderAnniversaire = async () => {
    if (!user || !anniversaire) return
    await updateDoc(
      doc(db, 'users', user.uid), { anniversaire }
    )
    alert('✅!')
  }

  const ajouterObjectif = async () => {
    if (!user || !nouvelObjectif.trim()) return
    await addDoc(collection(db, 'objectifs'), {
      texte: nouvelObjectif.trim(),
      termine: false,
      joueur: pseudo,
      joueurId: user.uid,
      createdAt: Date.now()
    })
    setNouvelObjectif('')
  }

  const toggleObjectif = async (
    id: string, c: boolean
  ) => {
    await updateDoc(
      doc(db, 'objectifs', id), { termine: !c }
    )
  }

  const ajouterAnalyse = async (mid: string) => {
    if (!user) return
    await addDoc(collection(db, 'analyses'), {
      matchId: mid,
      joueur: pseudo,
      joueurId: user.uid,
      ...nouvelleAnalyse,
      createdAt: Date.now()
    })
    setNouvelleAnalyse({ bien: '', mal: '', plan: '' })
    setSelectedMatchForAnalyse(null)
    alert('✅!')
  }

  const ajouterFiche = async () => {
    if (!nouvelleFiche.adversaire.trim()) return
    await addDoc(collection(db, 'fichesAdversaires'), {
      ...nouvelleFiche,
      auteur: pseudo,
      auteurId: user?.uid,
      createdAt: Date.now()
    })
    setNouvelleFiche({
      adversaire: '', forces: '', faiblesses: '', notes: ''
    })
    setShowAddFiche(false)
    alert('✅!')
  }

  // ====== DELETE & UPDATE ======
  const del = async (col: string, id: string) => {
    await deleteDoc(doc(db, col, id))
  }

  const updateScore = async () => {
    if (!scoreEdit) return
    await updateDoc(doc(db, 'matchs', scoreEdit.id), {
      scoreDyno: parseInt(scoreEdit.scoreDyno),
      scoreAdversaire: parseInt(scoreEdit.scoreAdv),
      termine: true
    })
    setScoreEdit(null)
    alert('✅!')
  }

  const updateHistoriqueScore = async () => {
    if (!editHistoriqueScore) return
    const updateData: any = {}
    if (editHistoriqueScore.adversaire !== undefined) {
      updateData.adversaire = editHistoriqueScore.adversaire
    }
    if (editHistoriqueScore.type !== undefined) {
      updateData.type = editHistoriqueScore.type
    }
    if (editHistoriqueScore.arene !== undefined) {
      updateData.arene = editHistoriqueScore.arene
    }
    if (editHistoriqueScore.date !== undefined) {
      updateData.date = editHistoriqueScore.date
    }
    if (editHistoriqueScore.termine === false) {
      updateData.termine = false
    } else {
      updateData.termine = true
    }
    // Division auto-calc from sub-matches
    if (
      editHistoriqueScore.type === 'Division' &&
      editHistoriqueScore.sousMatchs &&
      editHistoriqueScore.sousMatchs.length > 0
    ) {
      updateData.sousMatchs = editHistoriqueScore.sousMatchs
      updateData.scoreDyno =
        editHistoriqueScore.sousMatchs.reduce(
          (a: number, s: any) =>
            a + parseInt(s.scoreDyno || '0'), 0
        )
      updateData.scoreAdversaire =
        editHistoriqueScore.sousMatchs.reduce(
          (a: number, s: any) =>
            a + parseInt(s.scoreAdv || '0'), 0
        )
    } else {
      updateData.scoreDyno =
        parseInt(editHistoriqueScore.scoreDyno)
      updateData.scoreAdversaire =
        parseInt(editHistoriqueScore.scoreAdv)
      if (editHistoriqueScore.type !== 'Division') {
        updateData.sousMatchs = []
      }
    }
    await updateDoc(
      doc(db, 'matchs', editHistoriqueScore.id), updateData
    )
    setEditHistoriqueScore(null)
    alert('✅ Score modifié !')
  }

  // ====== DISPO ======
  const toggleDispo = async (mid: string) => {
    if (!user) return
    const m = matchs.find((x: any) => x.id === mid)
    if (!m) return
    const d = m.disponibles || []
    const i = m.indisponibles || []
    await updateDoc(doc(db, 'matchs', mid), {
      disponibles: d.includes(pseudo)
        ? d.filter((p: string) => p !== pseudo)
        : [...d, pseudo],
      indisponibles: i.filter((p: string) => p !== pseudo)
    })
  }

  const toggleIndispo = async (mid: string) => {
    if (!user) return
    const m = matchs.find((x: any) => x.id === mid)
    if (!m) return
    const d = m.disponibles || []
    const i = m.indisponibles || []
    await updateDoc(doc(db, 'matchs', mid), {
      indisponibles: i.includes(pseudo)
        ? i.filter((p: string) => p !== pseudo)
        : [...i, pseudo],
      disponibles: d.filter((p: string) => p !== pseudo)
    })
  }

  // ====== HELPERS ======
  const fdf = (s: string) => {
    if (!s) return ''
    if (s.includes('/')) return s
    const [y, m, d] = s.split('-')
    return d + '/' + m + '/' + y
  }

  const fts = (t: number) => {
    const d = new Date(t)
    return d.toLocaleDateString('fr-FR') + ' ' +
      d.toLocaleTimeString('fr-FR', {
        hour: '2-digit', minute: '2-digit'
      })
  }

  const atc = (m: any) => {
    try {
      if (!m?.date) return
      let y: string, mo: string, d: string
      if (m.date.includes('/')) {
        const parts = m.date.split('/')
        d = parts[0]; mo = parts[1]; y = parts[2]
      } else {
        const parts = m.date.split('-')
        y = parts[0]; mo = parts[1]; d = parts[2]
      }
      const md = y + mo + d
      let h = '20', mi = '00'
      if (m.horaires && m.horaires.length > 0) {
        const parts = m.horaires[0].split(':')
        h = parts[0]; mi = parts[1] || '00'
      } else if (m.horaire1) {
        const parts = m.horaire1.split(':')
        h = parts[0]; mi = parts[1] || '00'
      }
      const st = h + mi + '00'
      const eh = (parseInt(h) + 2).toString().padStart(2, '0')
      const et = eh + mi + '00'
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        const ics = 'BEGIN:VCALENDAR\n' +
          'VERSION:2.0\n' +
          'BEGIN:VEVENT\n' +
          'UID:' + m.id + '@d\n' +
          'DTSTAMP:' +
          new Date().toISOString()
            .replace(/[-:]/g, '').split('.')[0] + 'Z\n' +
          'DTSTART:' + md + 'T' + st + '\n' +
          'DTEND:' + md + 'T' + et + '\n' +
          'SUMMARY:DYNO vs ' + m.adversaire + '\n' +
          'LOCATION:' + m.arene + '\n' +
          'END:VEVENT\n' +
          'END:VCALENDAR'
        const b = new Blob([ics], { type: 'text/calendar' })
        const u = URL.createObjectURL(b)
        const a = document.createElement('a')
        a.href = u
        a.download = 'D_' + m.adversaire + '.ics'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(u)
      } else {
        const title = encodeURIComponent(
          'DYNO vs ' + m.adversaire
        )
        const loc = encodeURIComponent(m.arene)
        window.open(
          'https://calendar.google.com/calendar/render' +
          '?action=TEMPLATE&text=' + title +
          '&dates=' + md + 'T' + st +
          '/' + md + 'T' + et +
          '&location=' + loc,
          '_blank'
        )
      }
    } catch (e: any) { alert('❌ ' + e.message) }
  }

  // Pull to refresh
  const hts = (e: React.TouchEvent) => {
    ty.current = e.touches[0].clientY
  }
  const htm = (e: React.TouchEvent) => {
    if (window.scrollY > 0) return
    const d = e.touches[0].clientY - ty.current
    if (d > 0) setPullDistance(Math.min(d * 0.4, 80))
  }
  const hte = () => {
    if (pullDistance > 60) {
      setIsRefreshing(true)
      setTimeout(() => window.location.reload(), 500)
    }
    setPullDistance(0)
  }

  // Map toggle for strats
  const toggleMap = (
    map: string, type: 'picks' | 'bans'
  ) => {
    if (type === 'picks') {
      if (nouvelleStrat.picks.includes(map)) {
        setNouvelleStrat({
          ...nouvelleStrat,
          picks: nouvelleStrat.picks.filter(m => m !== map)
        })
      } else if (nouvelleStrat.picks.length < 4) {
        setNouvelleStrat({
          ...nouvelleStrat,
          picks: [...nouvelleStrat.picks, map]
        })
      }
    } else {
      if (nouvelleStrat.bans.includes(map)) {
        setNouvelleStrat({
          ...nouvelleStrat,
          bans: nouvelleStrat.bans.filter(m => m !== map)
        })
      } else if (nouvelleStrat.bans.length < 4) {
        setNouvelleStrat({
          ...nouvelleStrat,
          bans: [...nouvelleStrat.bans, map]
        })
      }
    }
  }

  // Monthly report
  const genBilan = () => {
    const now = new Date()
    const mm = historique.filter((m: any) => {
      const d = new Date(m.createdAt)
      return d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
    })
    const w = mm.filter(
      (m: any) => (m.scoreDyno || 0) > (m.scoreAdversaire || 0)
    ).length
    const l = mm.filter(
      (m: any) => (m.scoreDyno || 0) < (m.scoreAdversaire || 0)
    ).length
    const mn = notes.filter((n: any) => {
      const d = new Date(n.createdAt)
      return d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
    })
    const am = mn.length > 0
      ? Math.round(
        mn.reduce(
          (a: number, n: any) =>
            a + parseInt(n.mental || 0), 0
        ) / mn.length
      ) : 0
    const ac = mn.length > 0
      ? Math.round(
        mn.reduce(
          (a: number, n: any) =>
            a + parseInt(n.communication || 0), 0
        ) / mn.length
      ) : 0
    const ap = mn.length > 0
      ? Math.round(
        mn.reduce(
          (a: number, n: any) =>
            a + parseInt(n.gameplay || 0), 0
        ) / mn.length
      ) : 0
    const mois = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
      'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
    ]
    return {
      nom: mois[now.getMonth()],
      m: mm.length, w, l,
      wr: mm.length > 0
        ? Math.round((w / (w + l || 1)) * 100) : 0,
      am, ac, ap
    }
  }

  // ====== COMPUTED ======
  const victoires = matchs.filter(
    (m: any) => m.termine &&
      (m.scoreDyno || 0) > (m.scoreAdversaire || 0)
  ).length

  const defaites = matchs.filter(
    (m: any) => m.termine &&
      (m.scoreDyno || 0) < (m.scoreAdversaire || 0)
  ).length

  const totalMatchs = victoires + defaites
  const winRate = totalMatchs > 0
    ? Math.round((victoires / totalMatchs) * 100) : 0

  const prochainsMatchs = matchs
    .filter((m: any) => !m.termine)
    .sort((a: any, b: any) => {
      const ta = a.horaires?.[0] || a.horaire1 || '20:00'
      const tb = b.horaires?.[0] || b.horaire1 || '20:00'
      return new Date(a.date + 'T' + ta).getTime() -
        new Date(b.date + 'T' + tb).getTime()
    })

  const historique = matchs.filter((m: any) => m.termine)

  const ytId = (url: string) => {
    const m = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    )
    return m ? m[1] : null
  }

  // ====== HEADER COMPONENT ======
  const H = (
    { title, icon }: { title: string; icon?: string }
  ) => (
    <div className={
      "relative rounded-3xl p-7 mb-5 text-center " +
      "overflow-hidden bg-gradient-to-br " +
      "from-[#D4AF37]/10 via-[#D4AF37]/5 " +
      "to-transparent border border-[#D4AF37]/15 " +
      "shadow-[0_8px_32px_rgba(212,175,55,0.1)] " +
      "glow-pulse"
    }>
      <div className={
        "absolute inset-0 bg-gradient-to-br " +
        "from-[#D4AF37]/5 to-transparent"
      } />
      <img
        src={LG} alt="D"
        className={
          "w-14 h-14 mx-auto mb-2 relative z-10 " +
          "drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]"
        }
      />
      <h2 className={
        "text-lg font-bold bg-gradient-to-r " +
        "from-[#D4AF37] to-[#FFD700] bg-clip-text " +
        "text-transparent relative z-10"
      }>
        {icon} {title}
      </h2>
    </div>
  )

  // ====== SPLASH ======
  if (showSplash) return (
    <div className={
      "min-h-screen flex items-center justify-center " +
      "relative overflow-hidden"
    }>
      <P />
      <div className="text-center relative z-10">
        <img
          src={LG} alt="D"
          className={
            "w-48 h-48 mx-auto splash-logo " +
            "drop-shadow-[0_0_40px_rgba(212,175,55,0.6)]"
          }
        />
        <h1 className={
          "text-5xl font-bold bg-gradient-to-r " +
          "from-[#D4AF37] via-[#FFD700] to-[#D4AF37] " +
          "bg-clip-text text-transparent mt-6 splash-text"
        }>
          DYNO
        </h1>
        <p className={
          "text-gray-400 mt-3 splash-sub " +
          "tracking-[0.3em] uppercase text-sm"
        }>
          Esport Team
        </p>
      </div>
    </div>
  )

  // ====== MENU ITEMS ======
  const menuItems = [
    { t: 'matchs', i: '📅', label: 'MATCHS' },
    { t: 'historique', i: '📜', label: 'RÉSULTATS' },
    { t: 'strats', i: '🎯', label: 'STRATS' },
    { t: 'compos', i: '📋', label: 'COMPOS' },
    { t: 'fiches', i: '🔍', label: 'FICHES' },
    { t: 'notes', i: '📊', label: 'NOTES' },
    { t: 'objectifs', i: '🎯', label: 'OBJECTIFS' },
    { t: 'rec', i: '🎬', label: 'REPLAYS' },
    { t: 'roster', i: '👥', label: 'ROSTER' },
    { t: 'stats', i: '📈', label: 'STATS' },
    { t: 'admin', i: '⚙️', label: 'ADMIN' }
  ]

  // ====== RENDER ======
  return (
    <div className="min-h-screen pb-6 relative">
      <P />

      {/* HEADER */}
      <header className={
        "backdrop-blur-2xl bg-black/30 border-b " +
        "border-white/5 sticky top-0 z-50 " +
        "shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
      }>
        <div className={
          "max-w-lg mx-auto px-4 py-3 flex " +
          "items-center justify-between"
        }>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={
                "w-10 h-10 rounded-xl flex items-center " +
                "justify-center text-xl bg-white/5 " +
                "border border-white/10 " +
                "hover:bg-[#D4AF37]/20 transition-all"
              }
            >
              ☰
            </button>
            <img
              src={LG} alt="D"
              className={
                "w-10 h-10 " +
                "drop-shadow-[0_0_12px_rgba(212,175,55,0.5)]"
              }
            />
            <div>
              <h1 className={
                "text-lg font-bold bg-gradient-to-r " +
                "from-[#D4AF37] to-[#FFD700] bg-clip-text " +
                "text-transparent leading-tight"
              }>
                DYNO
              </h1>
              <p className={
                "text-[9px] text-gray-600 " +
                "uppercase tracking-widest"
              }>
                Esport
              </p>
            </div>
          </div>
          <div className="flex gap-1.5 items-center">
            {user && (
              <button
                onClick={requestNotificationPermission}
                className={
                  "w-8 h-8 rounded-full flex items-center " +
                  "justify-center transition-all duration-300 " +
                  (notificationsEnabled
                    ? "bg-[#D4AF37]/20 border border-[#D4AF37]/40 " +
                      "shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                    : "bg-white/5 border border-white/10")
                }
              >
                <span className="text-sm">
                  {notificationsEnabled ? '🔔' : '🔕'}
                </span>
              </button>
            )}
            {showInstall && (
              <button
                onClick={handleInstall}
                className={
                  "px-2.5 py-1.5 rounded-xl font-bold " +
                  "bg-blue-600 text-white text-[10px]"
                }
              >
                📲
              </button>
            )}
            {user ? (
              <button
                onClick={handleSignOut}
                className={
                  "px-3 py-1.5 rounded-2xl font-bold " +
                  "bg-gradient-to-r from-red-600 to-red-700 " +
                  "text-white shadow-lg shadow-red-500/20 " +
                  "text-[11px] hover:scale-105 transition-transform"
                }
              >
                👋 {pseudo}
              </button>
            ) : (
              <button
                onClick={() => setIsSignUp(false)}
                className={
                  "px-3 py-1.5 rounded-2xl font-bold " +
                  "bg-gradient-to-r from-[#D4AF37] " +
                  "to-[#FFD700] text-black shadow-lg " +
                  "shadow-[#D4AF37]/20 text-[11px] " +
                  "hover:scale-105 transition-transform"
                }
              >
                👤 Compte
              </button>
            )}
          </div>
        </div>
      </header>

      {/* SIDEBAR MENU */}
      {showMenu && (
        <div className="fixed inset-0 z-50 flex">
          <div className={
            "w-64 bg-gradient-to-b from-[#1a1a1a] " +
            "to-[#0a0a0a] border-r border-[#D4AF37]/20 " +
            "shadow-[4px_0_32px_rgba(0,0,0,0.8)] " +
            "overflow-y-auto"
          }>
            <div className={
              "p-5 border-b border-[#D4AF37]/10 " +
              "flex items-center gap-3"
            }>
              <img
                src={LG} alt="D"
                className={
                  "w-12 h-12 " +
                  "drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]"
                }
              />
              <div>
                <h2 className={
                  "text-lg font-bold bg-gradient-to-r " +
                  "from-[#D4AF37] to-[#FFD700] bg-clip-text " +
                  "text-transparent"
                }>
                  DYNO
                </h2>
                <p className={
                  "text-[9px] text-gray-600 " +
                  "uppercase tracking-widest"
                }>
                  Esport Team
                </p>
              </div>
            </div>
            <div className="py-3">
              {menuItems.map(({ t, i, label }) => (
                <button
                  key={t}
                  onClick={() => {
                    setActiveTab(t)
                    setShowMenu(false)
                  }}
                  className={
                    "w-full px-5 py-3 flex items-center " +
                    "gap-3 transition-all duration-200 " +
                    (activeTab === t
                      ? "bg-[#D4AF37]/15 text-[#D4AF37] " +
                        "border-r-2 border-[#D4AF37]"
                      : "text-gray-500 hover:text-gray-300 " +
                        "hover:bg-white/5")
                  }
                >
                  <span className="text-lg">{i}</span>
                  <span className={
                    "text-sm font-bold " +
                    "tracking-wider uppercase"
                  }>
                    {label}
                  </span>
                  {activeTab === t && (
                    <div className={
                      "ml-auto w-1.5 h-1.5 rounded-full " +
                      "bg-[#D4AF37] " +
                      "shadow-[0_0_8px_rgba(212,175,55,0.8)]"
                    } />
                  )}
                </button>
              ))}
            </div>
          </div>
          <div
            className="flex-1 bg-black/60"
            onClick={() => setShowMenu(false)}
          />
        </div>
      )}

      {/* MAIN CONTENT */}
      <main
        className="max-w-lg mx-auto px-4 py-6 relative z-10"
        onTouchStart={hts}
        onTouchMove={htm}
        onTouchEnd={hte}
      >
        {/* Pull to refresh */}
        {pullDistance > 0 && (
          <div
            className="flex justify-center mb-4"
            style={{ height: pullDistance }}
          >
            <span className={
              "text-[#D4AF37] text-2xl " +
              (pullDistance > 60 ? 'animate-spin' : '')
            }>
              {isRefreshing
                ? '⏳'
                : pullDistance > 60 ? '🔄' : '⬇️'}
            </span>
          </div>
        )}

        {/* ====== TAB: MATCHS ====== */}
        {activeTab === 'matchs' && (
          <div className="tab-content">
            <H title="Prochains Matchs" />
            <div className="flex justify-end mb-3">
              <div className={
                "flex bg-white/5 rounded-xl " +
                "border border-white/10 overflow-hidden"
              }>
                <button
                  onClick={() => setViewMode('list')}
                  className={
                    "px-3 py-1.5 text-xs transition-all " +
                    (viewMode === 'list'
                      ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                      : 'text-gray-600')
                  }
                >
                  ☰
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={
                    "px-3 py-1.5 text-xs transition-all " +
                    (viewMode === 'grid'
                      ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                      : 'text-gray-600')
                  }
                >
                  ⊞
                </button>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                <div className="skeleton h-48 w-full" />
                <div className="skeleton h-48 w-full" />
              </div>
            ) : prochainsMatchs.length === 0 ? (
              <div className={
                "text-center py-10 text-gray-600"
              }>
                📭 Aucun match
              </div>
            ) : (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 gap-3'
                  : 'space-y-4'
              }>
                {prochainsMatchs.map((match: any, idx: number) => (
                  <div
                    key={match.id}
                    className={
                      "card-glow bg-black/30 backdrop-blur-lg " +
                      "rounded-3xl p-4 border " +
                      "border-[#D4AF37]/15 " +
                      "shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                    }
                    style={{
                      animationDelay: (idx * 0.1) + 's'
                    }}
                  >
                    {/* Type + Date */}
                    <div className={
                      "flex items-center justify-between mb-3"
                    }>
                      <span className={
                        "px-2.5 py-1 rounded-full text-[9px] " +
                        "font-bold uppercase tracking-wider " +
                        (match.type === 'Ligue'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                          : match.type === 'Scrim'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                          : match.type === 'Tournoi'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20'
                          : match.type === 'Division'
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20'
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/20')
                      }>
                        {match.type}
                      </span>
                      <span className={
                        "text-[#D4AF37] font-bold text-xs"
                      }>
                        {fdf(match.date)}
                      </span>
                    </div>

                    {/* Countdown */}
                    {countdowns[match.id] && (
                      <div className={
                        "rounded-2xl p-2.5 mb-3 text-center border " +
                        (countdowns[match.id] === '🔴 EN COURS'
                          ? 'bg-red-500/10 border-red-500/15'
                          : 'bg-[#D4AF37]/10 border-[#D4AF37]/15')
                      }>
                        <p className={
                          "text-[9px] text-gray-600 " +
                          "uppercase tracking-wider"
                        }>
                          Countdown
                        </p>
                        <p className={
                          "text-lg font-bold font-mono " +
                          "tracking-wider " +
                          (countdowns[match.id] === '🔴 EN COURS'
                            ? 'text-red-400 animate-pulse'
                            : 'bg-gradient-to-r from-[#D4AF37] ' +
                              'to-[#FFD700] bg-clip-text ' +
                              'text-transparent')
                        }>
                          {countdowns[match.id]}
                        </p>
                      </div>
                    )}

                    {/* VS */}
                    <div className={
                      "flex items-center gap-3 mb-3"
                    }>
                      <img
                        src={LG} alt="D"
                        className={
                          "w-10 h-10 " +
                          "drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]"
                        }
                      />
                      <span className="text-gray-700 font-light">
                        VS
                      </span>
                      <div className="flex-1 text-right">
                        <p className={
                          "font-bold text-white text-sm"
                        }>
                          {match.adversaire}
                        </p>
                        <p className={
                          "text-[10px] text-[#D4AF37]/60"
                        }>
                          🏟️ {match.arene}
                        </p>
                      </div>
                    </div>

                    {/* Horaires */}
                    <div className={
                      "bg-white/5 rounded-xl p-2.5 mb-2 " +
                      "border border-white/5"
                    }>
                      <p className={
                        "text-[9px] text-gray-600 " +
                        "uppercase tracking-wider"
                      }>
                        ⏰
                      </p>
                      <p className={
                        "text-[#D4AF37] font-bold text-xs"
                      }>
                        {match.horaires?.join(' / ') ||
                          match.horaire1 || '20:00'}
                      </p>
                    </div>

                    {/* Dispo */}
                    <div className={
                      "bg-white/5 rounded-xl p-2.5 mb-2 " +
                      "border border-white/5"
                    }>
                      <p className={
                        "text-[9px] text-gray-600 mb-1.5 " +
                        "uppercase tracking-wider"
                      }>
                        👥 Dispo ({
                          (match.disponibles || []).length
                        })
                      </p>
                      {(match.disponibles || []).length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {(match.disponibles || []).map(
                            (p: string, i: number) => (
                              <span
                                key={i}
                                className={
                                  "bg-[#D4AF37]/15 " +
                                  "text-[#D4AF37] px-2 " +
                                  "py-0.5 rounded-lg " +
                                  "text-[9px] font-bold " +
                                  "border border-[#D4AF37]/15"
                                }
                              >
                                {p}
                              </span>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    {/* Indispo */}
                    <div className={
                      "bg-white/5 rounded-xl p-2.5 mb-3 " +
                      "border border-red-500/10"
                    }>
                      <p className={
                        "text-[9px] text-gray-600 mb-1.5 " +
                        "uppercase tracking-wider"
                      }>
                        🚫 Indispo ({
                          (match.indisponibles || []).length
                        })
                      </p>
                      {(match.indisponibles || []).length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {(match.indisponibles || []).map(
                            (p: string, i: number) => (
                              <span
                                key={i}
                                className={
                                  "bg-red-500/15 text-red-400 " +
                                  "px-2 py-0.5 rounded-lg " +
                                  "text-[9px] font-bold " +
                                  "border border-red-500/15"
                                }
                              >
                                {p}
                              </span>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    {/* Calendar */}
                    <button
                      onClick={() => atc(match)}
                      className={
                        "w-full mb-2 py-2 rounded-xl font-bold " +
                        "bg-blue-600/20 text-blue-400 " +
                        "border border-blue-500/15 text-xs"
                      }
                    >
                      📅 Calendrier
                    </button>

                    {/* Dispo/Indispo buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleDispo(match.id)}
                        disabled={!user}
                        className={
                          "flex-1 py-2.5 rounded-xl font-bold " +
                          "transition-all duration-300 text-xs " +
                          (!user
                            ? 'bg-white/5 text-gray-700'
                            : (match.disponibles || []).includes(pseudo)
                            ? 'bg-gradient-to-r from-[#D4AF37] ' +
                              'to-[#FFD700] text-black shadow-lg ' +
                              'shadow-[#D4AF37]/30 scale-[1.02]'
                            : 'bg-white/5 border ' +
                              'border-[#D4AF37]/15 text-[#D4AF37]')
                        }
                      >
                        {!user
                          ? '🔐'
                          : (match.disponibles || []).includes(pseudo)
                          ? '✅ Dispo'
                          : '📅 Dispo'}
                      </button>
                      <button
                        onClick={() => toggleIndispo(match.id)}
                        disabled={!user}
                        className={
                          "flex-1 py-2.5 rounded-xl font-bold " +
                          "transition-all duration-300 text-xs " +
                          (!user
                            ? 'bg-white/5 text-gray-700'
                            : (match.indisponibles || []).includes(pseudo)
                            ? 'bg-gradient-to-r from-red-600 ' +
                              'to-red-700 text-white shadow-lg ' +
                              'shadow-red-500/30 scale-[1.02]'
                            : 'bg-white/5 border ' +
                              'border-red-500/15 text-red-400')
                        }
                      >
                        {!user
                          ? '🔐'
                          : (match.indisponibles || []).includes(pseudo)
                          ? '❌ Indispo'
                          : '🚫 Indispo'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ====== TAB: HISTORIQUE ====== */}
        {activeTab === 'historique' && (
          <div className="tab-content">
            <H title="Historique" />
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className={
                "card-glow bg-[#D4AF37]/10 rounded-2xl " +
                "p-4 border border-[#D4AF37]/15 text-center"
              }>
                <p className={
                  "text-3xl font-bold text-[#D4AF37] count-up"
                }>
                  {victoires}
                </p>
                <p className={
                  "text-[9px] text-gray-600 mt-1 " +
                  "uppercase tracking-wider"
                }>
                  Victoires
                </p>
              </div>
              <div className={
                "card-glow bg-red-500/10 rounded-2xl " +
                "p-4 border border-red-500/15 text-center"
              }>
                <p className={
                  "text-3xl font-bold text-red-500 count-up"
                }>
                  {defaites}
                </p>
                <p className={
                  "text-[9px] text-gray-600 mt-1 " +
                  "uppercase tracking-wider"
                }>
                  Défaites
                </p>
              </div>
            </div>

            {historique.length === 0 ? (
              <div className="text-center py-10 text-gray-600">
                📜 Aucun
              </div>
            ) : (
              <div className="space-y-3">
                {historique.map((match: any, idx: number) => (
                  <div
                    key={match.id}
                    className={
                      "card-glow bg-black/30 backdrop-blur-lg " +
                      "rounded-3xl p-4 border border-[#D4AF37]/15"
                    }
                    style={{
                      animationDelay: (idx * 0.1) + 's'
                    }}
                  >
                    {/* Header */}
                    <div className={
                      "flex items-center justify-between mb-3"
                    }>
                      <span className={
                        "px-2.5 py-1 rounded-full text-[9px] " +
                        "font-bold uppercase tracking-wider " +
                        ((match.scoreDyno || 0) >
                          (match.scoreAdversaire || 0)
                          ? 'bg-[#D4AF37]/20 text-[#D4AF37] ' +
                            'border border-[#D4AF37]/20'
                          : 'bg-red-500/20 text-red-400 ' +
                            'border border-red-500/20')
                      }>
                        {(match.scoreDyno || 0) >
                          (match.scoreAdversaire || 0)
                          ? '🏆 VICTOIRE'
                          : '❌ DÉFAITE'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-xs">
                          {fdf(match.date)}
                        </span>
                        {isAdmin && (
                          <button
                            onClick={() => setEditHistoriqueScore({
                              id: match.id,
                              adversaire: match.adversaire || '',
                              scoreDyno: String(
                                match.scoreDyno || 0
                              ),
                              scoreAdv: String(
                                match.scoreAdversaire || 0
                              ),
                              type: match.type || 'Ligue',
                              arene: match.arene || 'Arène 1',
                              date: match.date || '',
                              termine: true,
                              sousMatchs: match.sousMatchs || []
                            })}
                            className={
                              "w-7 h-7 rounded-lg " +
                              "bg-[#D4AF37]/10 border " +
                              "border-[#D4AF37]/20 flex " +
                              "items-center justify-center " +
                              "text-[10px] hover:bg-[#D4AF37]/20 " +
                              "transition-all"
                            }
                            title="Modifier"
                          >
                            ✏️
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Scores */}
                    <div className={
                      "flex items-center justify-between mb-2"
                    }>
                      <div className="text-center">
                        <p className={
                          "font-bold text-[#D4AF37] " +
                          "text-[10px] uppercase tracking-wider"
                        }>
                          DYNO
                        </p>
                        <p className={
                          "text-3xl font-bold " +
                          "bg-gradient-to-r from-[#D4AF37] " +
                          "to-[#FFD700] bg-clip-text " +
                          "text-transparent count-up"
                        }>
                          {match.scoreDyno}
                        </p>
                      </div>
                      <span className="text-gray-800 text-lg">
                        -
                      </span>
                      <div className="text-center">
                        <p className={
                          "font-bold text-gray-600 text-[10px] " +
                          "uppercase tracking-wider"
                        }>
                          {match.adversaire}
                        </p>
                        <p className={
                          "text-3xl font-bold text-gray-500 " +
                          "count-up"
                        }>
                          {match.scoreAdversaire}
                        </p>
                      </div>
                    </div>

                    {/* Sous-matchs */}
                    {match.sousMatchs?.length > 0 && (
                      <div className={
                        "space-y-1 mb-2 pt-2 border-t " +
                        "border-white/5"
                      }>
                        <p className={
                          "text-[9px] text-gray-600 " +
                          "uppercase tracking-wider mb-1"
                        }>
                          Sous-matchs
                        </p>
                        {match.sousMatchs.map(
                          (sm: any, i: number) => (
                            <div
                              key={i}
                              className={
                                "flex items-center " +
                                "justify-between bg-white/5 " +
                                "rounded-lg px-2 py-1"
                              }
                            >
                              <span className={
                                "text-[10px] text-gray-400"
                              }>
                                {sm.adversaire}
                              </span>
                              <span className={
                                "text-[10px] font-bold"
                              }>
                                <span className="text-[#D4AF37]">
                                  {sm.scoreDyno}
                                </span>
                                -
                                <span className="text-gray-500">
                                  {sm.scoreAdv}
                                </span>
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {/* Type */}
                    {match.type && (
                      <p className={
                        "text-center text-gray-700 text-[9px] " +
                        "mt-2 uppercase tracking-wider"
                      }>
                        {match.type} • {match.arene}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODAL: Edit Historique Score */}
        {editHistoriqueScore && (
          <div className={
            "fixed inset-0 bg-black/80 backdrop-blur-xl " +
            "flex items-center justify-center z-50 p-4"
          }>
            <div className={
              "bg-gradient-to-br from-[#1a1a1a] " +
              "to-[#0a0a0a] rounded-3xl p-6 w-full " +
              "max-w-sm border border-white/10 " +
              "max-h-[90vh] overflow-y-auto"
            }>
              <h3 className={
                "text-lg font-bold bg-gradient-to-r " +
                "from-[#D4AF37] to-[#FFD700] bg-clip-text " +
                "text-transparent mb-5 text-center"
              }>
                ✏️ Modifier le match
              </h3>
              <div className="space-y-3 mb-5">
                {/* Adversaire */}
                <div>
                  <label className={
                    "text-gray-600 text-[10px] mb-1 " +
                    "block uppercase tracking-wider"
                  }>
                    ⚔️ Adversaire
                  </label>
                  <input
                    type="text"
                    value={editHistoriqueScore.adversaire}
                    onChange={e => setEditHistoriqueScore({
                      ...editHistoriqueScore,
                      adversaire: e.target.value
                    })}
                    className={
                      "w-full bg-white/5 border " +
                      "border-white/10 rounded-xl px-4 " +
                      "py-2.5 text-white text-sm " +
                      "focus:outline-none " +
                      "focus:border-[#D4AF37]/50"
                    }
                  />
                </div>

                {/* Date */}
                <div>
                  <label className={
                    "text-gray-600 text-[10px] mb-1 " +
                    "block uppercase tracking-wider"
                  }>
                    📅 Date
                  </label>
                  <input
                    type="date"
                    value={
                      editHistoriqueScore.date?.includes('/')
                        ? (() => {
                          const p =
                            editHistoriqueScore.date.split('/')
                          return p[2] + '-' + p[1] + '-' + p[0]
                        })()
                        : editHistoriqueScore.date
                    }
                    onChange={e => setEditHistoriqueScore({
                      ...editHistoriqueScore,
                      date: e.target.value
                    })}
                    className={
                      "w-full bg-white/5 border " +
                      "border-white/10 rounded-xl px-4 " +
                      "py-2.5 text-white text-sm " +
                      "focus:outline-none " +
                      "focus:border-[#D4AF37]/50"
                    }
                  />
                </div>

                {/* Type + Arene */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={
                      "text-gray-600 text-[10px] mb-1 " +
                      "block uppercase tracking-wider"
                    }>
                      📊 Type
                    </label>
                    <select
                      value={editHistoriqueScore.type}
                      onChange={e => setEditHistoriqueScore({
                        ...editHistoriqueScore,
                        type: e.target.value
                      })}
                      className={
                        "w-full bg-white/5 border " +
                        "border-white/10 rounded-xl px-3 " +
                        "py-2.5 text-white text-sm " +
                        "focus:outline-none " +
                        "focus:border-[#D4AF37]/50"
                      }
                    >
                      <option value="Ligue">Ligue</option>
                      <option value="Scrim">Scrim</option>
                      <option value="Tournoi">Tournoi</option>
                      <option value="Division">Division</option>
                    </select>
                  </div>
                  <div>
                    <label className={
                      "text-gray-600 text-[10px] mb-1 " +
                      "block uppercase tracking-wider"
                    }>
                      🏟️ Arène
                    </label>
                    <select
                      value={editHistoriqueScore.arene}
                      onChange={e => setEditHistoriqueScore({
                        ...editHistoriqueScore,
                        arene: e.target.value
                      })}
                      className={
                        "w-full bg-white/5 border " +
                        "border-white/10 rounded-xl px-3 " +
                        "py-2.5 text-white text-sm " +
                        "focus:outline-none " +
                        "focus:border-[#D4AF37]/50"
                      }
                    >
                      <option value="Arène 1">Arène 1</option>
                      <option value="Arène 2">Arène 2</option>
                    </select>
                  </div>
                </div>

                {/* Division: sous-matchs */}
                {editHistoriqueScore.type === 'Division' ? (
                  <div className={
                    "bg-white/5 rounded-xl p-3 " +
                    "border border-orange-500/15"
                  }>
                    <div className={
                      "flex items-center " +
                      "justify-between mb-2"
                    }>
                      <p className={
                        "text-[10px] text-orange-400 " +
                        "font-bold uppercase"
                      }>
                        🏆 Sous-matchs
                      </p>
                      <button
                        onClick={ajouterEditSousMatch}
                        className={
                          "px-2 py-1 rounded-lg " +
                          "bg-orange-500/20 " +
                          "text-orange-400 text-xs"
                        }
                      >
                        ➕
                      </button>
                    </div>
                    {(editHistoriqueScore.sousMatchs || [])
                      .length > 0 ? (
                      <div className="space-y-1">
                        {(editHistoriqueScore.sousMatchs || [])
                          .map((sm: any, i: number) => (
                            <div
                              key={i}
                              className={
                                "flex items-center " +
                                "justify-between bg-black/30 " +
                                "rounded-lg px-2 py-1.5"
                              }
                            >
                              <div className="flex-1">
                                <p className={
                                  "text-[9px] text-gray-400"
                                }>
                                  {sm.adversaire}
                                </p>
                                <p className={
                                  "text-[10px] font-bold"
                                }>
                                  <span className="text-[#D4AF37]">
                                    {sm.scoreDyno}
                                  </span>
                                  -
                                  <span className="text-gray-500">
                                    {sm.scoreAdv}
                                  </span>
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  supprimerEditSousMatch(i)
                                }
                                className={
                                  "text-red-400/40 text-xs"
                                }
                              >
                                🗑️
                              </button>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className={
                        "text-[9px] text-gray-600 text-center"
                      }>
                        Aucun sous-match
                      </p>
                    )}
                    {/* Auto total */}
                    {(editHistoriqueScore.sousMatchs || [])
                      .length > 0 && (
                      <div className={
                        "mt-2 pt-2 border-t border-white/5 " +
                        "text-center"
                      }>
                        <p className={
                          "text-[9px] text-gray-600 uppercase"
                        }>
                          Score total
                        </p>
                        <p className="text-sm font-bold">
                          <span className="text-[#D4AF37]">
                            {(editHistoriqueScore.sousMatchs ||
                              []).reduce(
                              (a: number, s: any) =>
                                a + parseInt(
                                  s.scoreDyno || '0'
                                ), 0
                            )}
                          </span>
                          {' - '}
                          <span className="text-gray-500">
                            {(editHistoriqueScore.sousMatchs ||
                              []).reduce(
                              (a: number, s: any) =>
                                a + parseInt(
                                  s.scoreAdv || '0'
                                ), 0
                            )}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Normal scores */
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={
                        "text-gray-600 text-[10px] mb-1 " +
                        "block uppercase tracking-wider"
                      }>
                        🟡 DYNO
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={editHistoriqueScore.scoreDyno}
                        onChange={e =>
                          setEditHistoriqueScore({
                            ...editHistoriqueScore,
                            scoreDyno: e.target.value
                          })
                        }
                        className={
                          "w-full bg-white/5 border " +
                          "border-[#D4AF37]/20 rounded-xl " +
                          "px-4 py-3 text-white text-center " +
                          "text-2xl font-bold " +
                          "focus:outline-none " +
                          "focus:border-[#D4AF37]/50"
                        }
                      />
                    </div>
                    <div>
                      <label className={
                        "text-gray-600 text-[10px] mb-1 " +
                        "block uppercase tracking-wider"
                      }>
                        ⚪ Adv
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={editHistoriqueScore.scoreAdv}
                        onChange={e =>
                          setEditHistoriqueScore({
                            ...editHistoriqueScore,
                            scoreAdv: e.target.value
                          })
                        }
                        className={
                          "w-full bg-white/5 border " +
                          "border-red-500/20 rounded-xl " +
                          "px-4 py-3 text-white text-center " +
                          "text-2xl font-bold " +
                          "focus:outline-none " +
                          "focus:border-red-500/50"
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Revert checkbox */}
                <div className={
                  "flex items-center gap-3 bg-white/5 " +
                  "rounded-xl p-3 border border-white/5"
                }>
                  <label className={
                    "flex items-center gap-2 cursor-pointer"
                  }>
                    <input
                      type="checkbox"
                      checked={
                        editHistoriqueScore.termine === false
                      }
                      onChange={e =>
                        setEditHistoriqueScore({
                          ...editHistoriqueScore,
                          termine: e.target.checked
                            ? false : true
                        })
                      }
                      className={
                        "w-4 h-4 rounded accent-[#D4AF37]"
                      }
                    />
                    <span className="text-gray-400 text-xs">
                      Remettre en « à venir »
                    </span>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setEditHistoriqueScore(null)}
                  className={
                    "flex-1 py-2.5 rounded-xl font-bold " +
                    "bg-white/5 border border-white/10 " +
                    "text-gray-500 text-sm"
                  }
                >
                  Annuler
                </button>
                <button
                  onClick={updateHistoriqueScore}
                  className={
                    "flex-1 py-2.5 rounded-xl font-bold " +
                    "bg-gradient-to-r from-[#D4AF37] " +
                    "to-[#FFD700] text-black shadow-lg " +
                    "shadow-[#D4AF37]/30 text-sm"
                  }
                >
                  ✅ Modifier
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====== TAB: STRATS ====== */}
        {activeTab === 'strats' && (
          <div className="tab-content">
            <H title="Stratégies" icon="🎯" />
            <button
              onClick={() => setShowAddStrat(true)}
              className={
                "w-full mb-5 py-3 rounded-2xl font-bold " +
                "bg-gradient-to-r from-[#D4AF37] " +
                "to-[#FFD700] text-black shadow-lg " +
                "shadow-[#D4AF37]/20 hover:scale-[1.02] " +
                "transition-transform text-sm"
              }
            >
              ➕ Nouvelle Stratégie
            </button>

            {strats.length === 0 ? (
              <div className={
                "text-center py-10 text-gray-600"
              }>
                📝 Aucune
              </div>
            ) : (
              <div className="space-y-3">
                {strats.map((s: any, idx: number) => (
                  <div
                    key={s.id}
                    className={
                      "card-glow bg-black/30 backdrop-blur-lg " +
                      "rounded-3xl p-4 border " +
                      "border-[#D4AF37]/15"
                    }
                    style={{
                      animationDelay: (idx * 0.1) + 's'
                    }}
                  >
                    <div className={
                      "flex items-center " +
                      "justify-between mb-3"
                    }>
                      <div>
                        <p className="font-bold text-[#D4AF37]">
                          DYNO vs {s.adversaire}
                        </p>
                        <p className={
                          "text-[9px] text-gray-600"
                        }>
                          par {s.auteur || '?'}
                        </p>
                      </div>
                      {(isAdmin ||
                        user?.uid === s.auteurId) && (
                        <button
                          onClick={() =>
                            del('strats', s.id)
                          }
                          className="text-red-400/40"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                    <div className="mb-2">
                      <p className={
                        "text-[9px] text-green-400 mb-1.5 " +
                        "uppercase tracking-wider"
                      }>
                        ✅ Picks (
                          {s.picks?.length || 0}/4)
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {s.picks?.map(
                          (p: string, i: number) => (
                            <span
                              key={i}
                              className={
                                "bg-green-500/15 " +
                                "text-green-400 px-2.5 " +
                                "py-1 rounded-lg text-[10px] " +
                                "border border-green-500/15 " +
                                "font-bold"
                              }
                            >
                              {p}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <p className={
                        "text-[9px] text-red-400 mb-1.5 " +
                        "uppercase tracking-wider"
                      }>
                        ❌ Bans (
                          {s.bans?.length || 0}/4)
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {s.bans?.map(
                          (b: string, i: number) => (
                            <span
                              key={i}
                              className={
                                "bg-red-500/15 text-red-400 " +
                                "px-2.5 py-1 rounded-lg " +
                                "text-[10px] border " +
                                "border-red-500/15 font-bold"
                              }
                            >
                              {b}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal: Add Strat */}
            {showAddStrat && (
              <div className={
                "fixed inset-0 bg-black/80 " +
                "backdrop-blur-xl flex items-center " +
                "justify-center z-50 p-4"
              }>
                <div className={
                  "bg-gradient-to-br from-[#1a1a1a] " +
                  "to-[#0a0a0a] rounded-3xl p-5 w-full " +
                  "max-w-md border border-white/10 " +
                  "max-h-[90vh] overflow-y-auto"
                }>
                  <h3 className={
                    "text-lg font-bold bg-gradient-to-r " +
                    "from-[#D4AF37] to-[#FFD700] " +
                    "bg-clip-text text-transparent " +
                    "mb-5 text-center"
                  }>
                    🎯 Stratégie
                  </h3>
                  <div className="space-y-3 mb-5">
                    <div>
                      <label className={
                        "text-gray-600 text-[10px] mb-1.5 " +
                        "block uppercase tracking-wider"
                      }>
                        ⚔️ Adversaire
                      </label>
                      <input
                        type="text"
                        placeholder="Nom"
                        value={nouvelleStrat.adversaire}
                        onChange={e => setNouvelleStrat({
                          ...nouvelleStrat,
                          adversaire: e.target.value
                        })}
                        className={
                          "w-full bg-white/5 border " +
                          "border-white/10 rounded-xl " +
                          "px-4 py-3 text-white text-sm " +
                          "focus:outline-none " +
                          "focus:border-[#D4AF37]/50"
                        }
                      />
                    </div>
                    <div>
                      <label className={
                        "text-gray-600 text-[10px] mb-1.5 " +
                        "block uppercase tracking-wider"
                      }>
                        ✅ Picks (4)
                      </label>
                      <div className={
                        "grid grid-cols-2 gap-1.5"
                      }>
                        {AM.map(m => (
                          <button
                            key={m}
                            onClick={() =>
                              toggleMap(m, 'picks')
                            }
                            className={
                              "px-2.5 py-1.5 rounded-lg " +
                              "text-[10px] font-bold " +
                              "transition-all " +
                              (nouvelleStrat.picks.includes(m)
                                ? 'bg-green-600 text-white ' +
                                  'shadow-lg shadow-green-500/30'
                                : 'bg-white/5 text-gray-500')
                            }
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={
                        "text-gray-600 text-[10px] mb-1.5 " +
                        "block uppercase tracking-wider"
                      }>
                        ❌ Bans (4)
                      </label>
                      <div className={
                        "grid grid-cols-2 gap-1.5"
                      }>
                        {AM.map(m => (
                          <button
                            key={m}
                            onClick={() =>
                              toggleMap(m, 'bans')
                            }
                            className={
                              "px-2.5 py-1.5 rounded-lg " +
                              "text-[10px] font-bold " +
                              "transition-all " +
                              (nouvelleStrat.bans.includes(m)
                                ? 'bg-red-600 text-white ' +
                                  'shadow-lg shadow-red-500/30'
                                : 'bg-white/5 text-gray-500')
                            }
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowAddStrat(false)
                        setNouvelleStrat({
                          adversaire: '',
                          picks: [], bans: []
                        })
                      }}
                      className={
                        "flex-1 py-2.5 rounded-xl " +
                        "font-bold bg-white/5 border " +
                        "border-white/10 text-gray-500 " +
                        "text-sm"
                      }
                    >
                      Annuler
                    </button>
                    <button
                      onClick={ajouterStrat}
                      className={
                        "flex-1 py-2.5 rounded-xl " +
                        "font-bold bg-gradient-to-r " +
                        "from-[#D4AF37] to-[#FFD700] " +
                        "text-black shadow-lg " +
                        "shadow-[#D4AF37]/30 text-sm"
                      }
                    >
                      ✅
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ====== TAB: COMPOS ====== */}
        {activeTab === 'compos' && (
          <div className="tab-content">
            <H title="Compos" icon="📋" />
            {user && (
              <button
                onClick={() => setShowAddCompo(true)}
                className={
                  "w-full mb-5 py-3 rounded-2xl font-bold " +
                  "bg-gradient-to-r from-[#D4AF37] " +
                  "to-[#FFD700] text-black shadow-lg " +
                  "shadow-[#D4AF37]/20 hover:scale-[1.02] " +
                  "transition-transform text-sm"
                }
              >
                ➕ Compo
              </button>
            )}
            {compos.length === 0 ? (
              <div className="text-center py-10 text-gray-600">
                📋 Aucune
              </div>
            ) : (
              <div className="space-y-3">
                {compos.map((c: any, idx: number) => (
                  <div
                    key={c.id}
                    className={
                      "card-glow bg-black/30 rounded-3xl " +
                      "p-4 border border-[#D4AF37]/15"
                    }
                    style={{
                      animationDelay: (idx * 0.1) + 's'
                    }}
                  >
                    <div className={
                      "flex items-center " +
                      "justify-between mb-2"
                    }>
                      <p className="font-bold text-[#D4AF37]">
                        🗺️ {c.map}
                      </p>
                      {(isAdmin ||
                        user?.uid === c.auteurId) && (
                        <button
                          onClick={() =>
                            del('compos', c.id)
                          }
                          className="text-red-400/40"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {c.joueurs?.map(
                        (j: string, i: number) => (
                          <span
                            key={i}
                            className={
                              "bg-[#D4AF37]/15 " +
                              "text-[#D4AF37] px-2.5 " +
                              "py-1 rounded-lg text-[10px] " +
                              "font-bold border " +
                              "border-[#D4AF37]/15"
                            }
                          >
                            {j}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal: Add Compo */}
            {showAddCompo && (
              <div className={
                "fixed inset-0 bg-black/80 " +
                "backdrop-blur-xl flex items-center " +
                "justify-center z-50 p-4"
              }>
                <div className={
                  "bg-gradient-to-br from-[#1a1a1a] " +
                  "to-[#0a0a0a] rounded-3xl p-5 w-full " +
                  "max-w-md border border-white/10 " +
                  "max-h-[90vh] overflow-y-auto"
                }>
                  <h3 className={
                    "text-lg font-bold bg-gradient-to-r " +
                    "from-[#D4AF37] to-[#FFD700] " +
                    "bg-clip-text text-transparent " +
                    "mb-5 text-center"
                  }>
                    📋 Compo
                  </h3>
                  <div className="space-y-3 mb-5">
                    <div>
                      <label className={
                        "text-gray-600 text-[10px] " +
                        "mb-1.5 block uppercase " +
                        "tracking-wider"
                      }>
                        🗺️ Map
                      </label>
                      <div className={
                        "grid grid-cols-2 gap-1.5"
                      }>
                        {AM.map(m => (
                          <button
                            key={m}
                            onClick={() =>
                              setSelectedMapCompo(m)
                            }
                            className={
                              "px-2.5 py-1.5 rounded-lg " +
                              "text-[10px] font-bold " +
                              "transition-all " +
                              (selectedMapCompo === m
                                ? 'bg-[#D4AF37] text-black ' +
                                  'shadow-lg ' +
                                  'shadow-[#D4AF37]/30'
                                : 'bg-white/5 text-gray-500')
                            }
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={
                        "text-gray-600 text-[10px] " +
                        "mb-1.5 block uppercase " +
                        "tracking-wider"
                      }>
                        👥 Joueurs
                      </label>
                      <div className={
                        "grid grid-cols-2 gap-1.5"
                      }>
                        {joueurs
                          .filter(
                            (j: any) => j.actif !== false
                          )
                          .map((j: any) => (
                            <button
                              key={j.id}
                              onClick={() =>
                                toggleCompoJoueur(j.pseudo)
                              }
                              className={
                                "px-2.5 py-1.5 rounded-lg " +
                                "text-[10px] font-bold " +
                                "transition-all " +
                                (compoJoueurs.includes(
                                  j.pseudo
                                )
                                  ? 'bg-green-600 text-white ' +
                                    'shadow-lg ' +
                                    'shadow-green-500/30'
                                  : 'bg-white/5 text-gray-500')
                              }
                            >
                              {j.pseudo}
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowAddCompo(false)
                        setSelectedMapCompo('')
                        setCompoJoueurs([])
                      }}
                      className={
                        "flex-1 py-2.5 rounded-xl " +
                        "font-bold bg-white/5 border " +
                        "border-white/10 text-gray-500 " +
                        "text-sm"
                      }
                    >
                      Annuler
                    </button>
                    <button
                      onClick={ajouterCompo}
                      className={
                        "flex-1 py-2.5 rounded-xl " +
                        "font-bold bg-gradient-to-r " +
                        "from-[#D4AF37] to-[#FFD700] " +
                        "text-black shadow-lg " +
                        "shadow-[#D4AF37]/30 text-sm"
                      }
                    >
                      ✅
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ====== TAB: FICHES ====== */}
        {activeTab === 'fiches' && (
          <div className="tab-content">
            <H title="Fiches Adversaires" icon="🔍" />
            {user && (
              <button
                onClick={() => setShowAddFiche(true)}
                className={
                  "w-full mb-5 py-3 rounded-2xl font-bold " +
                  "bg-gradient-to-r from-[#D4AF37] " +
                  "to-[#FFD700] text-black shadow-lg " +
                  "shadow-[#D4AF37]/20 hover:scale-[1.02] " +
                  "transition-transform text-sm"
                }
              >
                ➕ Fiche
              </button>
            )}
            {fichesAdversaires.length === 0 ? (
              <div className="text-center py-10 text-gray-600">
                🔍 Aucune
              </div>
            ) : (
              <div className="space-y-3">
                {fichesAdversaires.map(
                  (f: any, idx: number) => (
                    <div
                      key={f.id}
                      className={
                        "card-glow bg-black/30 rounded-3xl " +
                        "p-4 border border-[#D4AF37]/15"
                      }
                      style={{
                        animationDelay: (idx * 0.1) + 's'
                      }}
                    >
                      <div className={
                        "flex items-center " +
                        "justify-between mb-3"
                      }>
                        <p className={
                          "font-bold text-[#D4AF37]"
                        }>
                          ⚔️ {f.adversaire}
                        </p>
                        {(isAdmin ||
                          user?.uid === f.auteurId) && (
                          <button
                            onClick={() =>
                              del('fichesAdversaires', f.id)
                            }
                            className="text-red-400/40"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className={
                          "bg-green-500/10 rounded-xl " +
                          "p-3 border border-green-500/10"
                        }>
                          <p className={
                            "text-[9px] text-green-400 " +
                            "uppercase font-bold mb-1"
                          }>
                            💪 Forces
                          </p>
                          <p className={
                            "text-gray-300 text-xs"
                          }>
                            {f.forces || '—'}
                          </p>
                        </div>
                        <div className={
                          "bg-red-500/10 rounded-xl " +
                          "p-3 border border-red-500/10"
                        }>
                          <p className={
                            "text-[9px] text-red-400 " +
                            "uppercase font-bold mb-1"
                          }>
                            ⚠️ Faiblesses
                          </p>
                          <p className={
                            "text-gray-300 text-xs"
                          }>
                            {f.faiblesses || '—'}
                          </p>
                        </div>
                        {f.notes && (
                          <div className={
                            "bg-white/5 rounded-xl " +
                            "p-3 border border-white/5"
                          }>
                            <p className={
                              "text-[9px] text-gray-500 " +
                              "uppercase font-bold mb-1"
                            }>
                              📝 Notes
                            </p>
                            <p className={
                              "text-gray-300 text-xs"
                            }>
                              {f.notes}
                            </p>
                          </div>
                        )}
                      </div>
                      <p className={
                        "text-gray-700 text-[9px] mt-2"
                      }>
                        par {f.auteur}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Modal: Add Fiche */}
            {showAddFiche && (
              <div className={
                "fixed inset-0 bg-black/80 " +
                "backdrop-blur-xl flex items-center " +
                "justify-center z-50 p-4"
              }>
                <div className={
                  "bg-gradient-to-br from-[#1a1a1a] " +
                  "to-[#0a0a0a] rounded-3xl p-5 w-full " +
                  "max-w-md border border-white/10 " +
                  "max-h-[90vh] overflow-y-auto"
                }>
                  <h3 className={
                    "text-lg font-bold bg-gradient-to-r " +
                    "from-[#D4AF37] to-[#FFD700] " +
                    "bg-clip-text text-transparent " +
                    "mb-5 text-center"
                  }>
                    🔍 Fiche
                  </h3>
                  <div className="space-y-3 mb-5">
                    <div>
                      <label className={
                        "text-gray-600 text-[10px] " +
                        "mb-1.5 block uppercase " +
                        "tracking-wider"
                      }>
                        ⚔️ Adversaire
                      </label>
                      <input
                        type="text"
                        placeholder="Nom"
                        value={nouvelleFiche.adversaire}
                        onChange={e => setNouvelleFiche({
                          ...nouvelleFiche,
                          adversaire: e.target.value
                        })}
                        className={
                          "w-full bg-white/5 border " +
                          "border-white/10 rounded-xl " +
                          "px-4 py-3 text-white text-sm " +
                          "focus:outline-none " +
                          "focus:border-[#D4AF37]/50"
                        }
                      />
                    </div>
                    <div>
                      <label className={
                        "text-gray-600 text-[10px] " +
                        "mb-1.5 block uppercase " +
                        "tracking-wider"
                      }>
                        💪 Forces
                      </label>
                      <textarea
                        value={nouvelleFiche.forces}
                        onChange={e => setNouvelleFiche({
                          ...nouvelleFiche,
                          forces: e.target.value
                        })}
                        rows={2}
                        className={
                          "w-full bg-white/5 border " +
                          "border-green-500/20 rounded-xl " +
                          "px-4 py-3 text-white text-sm " +
                          "focus:outline-none resize-none"
                        }
                      />
                    </div>
                    <div>
                      <label className={
                        "text-gray-600 text-[10px] " +
                        "mb-1.5 block uppercase " +
                        "tracking-wider"
                      }>
                        ⚠️ Faiblesses
                      </label>
                      <textarea
                        value={nouvelleFiche.faiblesses}
                        onChange={e => setNouvelleFiche({
                          ...nouvelleFiche,
                          faiblesses: e.target.value
                        })}
                        rows={2}
                        className={
                          "w-full bg-white/5 border " +
                          "border-red-500/20 rounded-xl " +
                          "px-4 py-3 text-white text-sm " +
                          "focus:outline-none resize-none"
                        }
                      />
                    </div>
                    <div>
                      <label className={
                        "text-gray-600 text-[10px] " +
                        "mb-1.5 block uppercase " +
                        "tracking-wider"
                      }>
                        📝 Notes
                      </label>
                      <textarea
                        value={nouvelleFiche.notes}
                        onChange={e => setNouvelleFiche({
                          ...nouvelleFiche,
                          notes: e.target.value
                        })}
                        rows={2}
                        className={
                          "w-full bg-white/5 border " +
                          "border-white/10 rounded-xl " +
                          "px-4 py-3 text-white text-sm " +
                          "focus:outline-none resize-none"
                        }
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowAddFiche(false)
                        setNouvelleFiche({
                          adversaire: '', forces: '',
                          faiblesses: '', notes: ''
                        })
                      }}
                      className={
                        "flex-1 py-2.5 rounded-xl " +
                        "font-bold bg-white/5 border " +
                        "border-white/10 text-gray-500 " +
                        "text-sm"
                      }
                    >
                      Annuler
                    </button>
                    <button
                      onClick={ajouterFiche}
                      className={
                        "flex-1 py-2.5 rounded-xl " +
                        "font-bold bg-gradient-to-r " +
                        "from-[#D4AF37] to-[#FFD700] " +
                        "text-black shadow-lg " +
                        "shadow-[#D4AF37]/30 text-sm"
                      }
                    >
                      ✅
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ====== TAB: NOTES ====== */}
        {activeTab === 'notes' && (
          <div className="tab-content">
            <H title="Notes & Analyses" icon="📊" />
            {historique.length === 0 ? (
              <div className="text-center py-10 text-gray-600">
                📊 Aucun
              </div>
            ) : (
              <div className="space-y-4">
                {historique.map((match: any, idx: number) => {
                  const mn = notes.filter(
                    (n: any) => n.matchId === match.id
                  )
                  const mc = commentaires.filter(
                    (c: any) => c.matchId === match.id
                  )
                  const ma = analyses.filter(
                    (a: any) => a.matchId === match.id
                  )
                  return (
                    <div
                      key={match.id}
                      className={
                        "card-glow bg-black/30 " +
                        "rounded-3xl p-4 border " +
                        "border-[#D4AF37]/15"
                      }
                      style={{
                        animationDelay: (idx * 0.1) + 's'
                      }}
                    >
                      {/* Match header */}
                      <div className={
                        "flex items-center " +
                        "justify-between mb-3"
                      }>
                        <p className={
                          "font-bold text-[#D4AF37] text-sm"
                        }>
                          DYNO vs {match.adversaire}
                        </p>
                        <div className={
                          "flex items-center gap-2"
                        }>
                          <span className={
                            "px-2 py-0.5 rounded-full " +
                            "text-[8px] font-bold " +
                            ((match.scoreDyno || 0) >
                              (match.scoreAdversaire || 0)
                              ? 'bg-[#D4AF37]/20 ' +
                                'text-[#D4AF37]'
                              : 'bg-red-500/20 text-red-400')
                          }>
                            {match.scoreDyno}-
                            {match.scoreAdversaire}
                          </span>
                          <span className={
                            "text-gray-700 text-[10px]"
                          }>
                            {fdf(match.date)}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-1.5 mb-3">
                        <button
                          onClick={() => {
                            setSelectedMatchForNotes(match)
                            setNouvelleNote({
                              matchId: match.id,
                              mental: '',
                              communication: '',
                              gameplay: ''
                            })
                          }}
                          className={
                            "flex-1 py-1.5 rounded-lg " +
                            "font-bold bg-purple-500/15 " +
                            "text-purple-400 border " +
                            "border-purple-500/15 text-[9px]"
                          }
                        >
                          📝 Note
                        </button>
                        <button
                          onClick={() =>
                            setSelectedMatchForComment(
                              selectedMatchForComment?.id ===
                                match.id ? null : match
                            )
                          }
                          className={
                            "flex-1 py-1.5 rounded-lg " +
                            "font-bold bg-cyan-500/15 " +
                            "text-cyan-400 border " +
                            "border-cyan-500/15 text-[9px]"
                          }
                        >
                          💬 Comm
                        </button>
                        <button
                          onClick={() =>
                            setSelectedMatchForAnalyse(
                              selectedMatchForAnalyse?.id ===
                                match.id ? null : match
                            )
                          }
                          className={
                            "flex-1 py-1.5 rounded-lg " +
                            "font-bold bg-orange-500/15 " +
                            "text-orange-400 border " +
                            "border-orange-500/15 text-[9px]"
                          }
                        >
                          📋 Analyse
                        </button>
                      </div>

                      {/* Comment form */}
                      {selectedMatchForComment?.id ===
                        match.id && user && (
                        <div className={
                          "bg-white/5 rounded-xl p-3 " +
                          "mb-3 border border-cyan-500/10"
                        }>
                          <textarea
                            placeholder="Commentaire..."
                            value={nouveauCommentaire}
                            onChange={e =>
                              setNouveauCommentaire(
                                e.target.value
                              )
                            }
                            rows={2}
                            className={
                              "w-full bg-black/30 border " +
                              "border-white/10 rounded-lg " +
                              "px-3 py-2 text-white text-xs " +
                              "focus:outline-none " +
                              "resize-none mb-2"
                            }
                          />
                          <button
                            onClick={() =>
                              ajouterCommentaire(match.id)
                            }
                            className={
                              "w-full py-1.5 rounded-lg " +
                              "font-bold bg-cyan-500/20 " +
                              "text-cyan-400 text-[10px]"
                            }
                          >
                            💬
                          </button>
                        </div>
                      )}

                      {/* Analyse form */}
                      {selectedMatchForAnalyse?.id ===
                        match.id && user && (
                        <div className={
                          "bg-white/5 rounded-xl p-3 " +
                          "mb-3 border border-orange-500/10"
                        }>
                          <div className="space-y-2 mb-2">
                            <div>
                              <label className={
                                "text-[8px] text-green-400 " +
                                "uppercase font-bold"
                              }>
                                ✅ Bien
                              </label>
                              <textarea
                                value={nouvelleAnalyse.bien}
                                onChange={e =>
                                  setNouvelleAnalyse({
                                    ...nouvelleAnalyse,
                                    bien: e.target.value
                                  })
                                }
                                rows={2}
                                className={
                                  "w-full bg-black/30 " +
                                  "border border-green-500/15 " +
                                  "rounded-lg px-3 py-2 " +
                                  "text-white text-xs " +
                                  "focus:outline-none " +
                                  "resize-none mt-1"
                                }
                              />
                            </div>
                            <div>
                              <label className={
                                "text-[8px] text-red-400 " +
                                "uppercase font-bold"
                              }>
                                ❌ Mal
                              </label>
                              <textarea
                                value={nouvelleAnalyse.mal}
                                onChange={e =>
                                  setNouvelleAnalyse({
                                    ...nouvelleAnalyse,
                                    mal: e.target.value
                                  })
                                }
                                rows={2}
                                className={
                                  "w-full bg-black/30 " +
                                  "border border-red-500/15 " +
                                  "rounded-lg px-3 py-2 " +
                                  "text-white text-xs " +
                                  "focus:outline-none " +
                                  "resize-none mt-1"
                                }
                              />
                            </div>
                            <div>
                              <label className={
                                "text-[8px] text-blue-400 " +
                                "uppercase font-bold"
                              }>
                                🎯 Plan
                              </label>
                              <textarea
                                value={nouvelleAnalyse.plan}
                                onChange={e =>
                                  setNouvelleAnalyse({
                                    ...nouvelleAnalyse,
                                    plan: e.target.value
                                  })
                                }
                                rows={2}
                                className={
                                  "w-full bg-black/30 " +
                                  "border border-blue-500/15 " +
                                  "rounded-lg px-3 py-2 " +
                                  "text-white text-xs " +
                                  "focus:outline-none " +
                                  "resize-none mt-1"
                                }
                              />
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              ajouterAnalyse(match.id)
                            }
                            className={
                              "w-full py-1.5 rounded-lg " +
                              "font-bold bg-orange-500/20 " +
                              "text-orange-400 text-[10px]"
                            }
                          >
                            📋
                          </button>
                        </div>
                      )}

                      {/* Notes list */}
                      {mn.length > 0 && (
                        <div className="space-y-1.5 mb-3">
                          <p className={
                            "text-[9px] text-purple-400 " +
                            "uppercase tracking-wider " +
                            "font-bold"
                          }>
                            📊 Notes ({mn.length})
                          </p>
                          {mn.map((n: any) => (
                            <div
                              key={n.id}
                              className={
                                "bg-white/5 rounded-lg " +
                                "p-2.5 border border-white/5"
                              }
                            >
                              <div className={
                                "flex items-center " +
                                "justify-between mb-1.5"
                              }>
                                <p className={
                                  "text-[#D4AF37] " +
                                  "font-bold text-[10px]"
                                }>
                                  {n.joueur}
                                </p>
                                {isAdmin && (
                                  <button
                                    onClick={() =>
                                      del('notes', n.id)
                                    }
                                    className={
                                      "text-red-400/40 " +
                                      "text-[9px]"
                                    }
                                  >
                                    🗑️
                                  </button>
                                )}
                              </div>
                              <div className={
                                "grid grid-cols-3 " +
                                "gap-1.5 text-center"
                              }>
                                <div className={
                                  "bg-purple-500/10 " +
                                  "rounded-lg p-1.5"
                                }>
                                  <p className={
                                    "text-[9px] text-gray-600"
                                  }>
                                    🧠
                                  </p>
                                  <p className={
                                    "text-purple-400 " +
                                    "font-bold text-xs"
                                  }>
                                    {n.mental}/10
                                  </p>
                                </div>
                                <div className={
                                  "bg-blue-500/10 " +
                                  "rounded-lg p-1.5"
                                }>
                                  <p className={
                                    "text-[9px] text-gray-600"
                                  }>
                                    💬
                                  </p>
                                  <p className={
                                    "text-blue-400 " +
                                    "font-bold text-xs"
                                  }>
                                    {n.communication}/10
                                  </p>
                                </div>
                                <div className={
                                  "bg-green-500/10 " +
                                  "rounded-lg p-1.5"
                                }>
                                  <p className={
                                    "text-[9px] text-gray-600"
                                  }>
                                    🎯
                                  </p>
                                  <p className={
                                    "text-green-400 " +
                                    "font-bold text-xs"
                                  }>
                                    {n.gameplay}/10
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Comments list */}
                      {mc.length > 0 && (
                        <div className="space-y-1.5 mb-3">
                          <p className={
                            "text-[9px] text-cyan-400 " +
                            "uppercase tracking-wider " +
                            "font-bold"
                          }>
                            💬 Commentaires ({mc.length})
                          </p>
                          {mc.map((c: any) => (
                            <div
                              key={c.id}
                              className={
                                "bg-white/5 rounded-lg " +
                                "p-2.5 border border-white/5"
                              }
                            >
                              <div className={
                                "flex items-center " +
                                "justify-between mb-0.5"
                              }>
                                <p className={
                                  "text-cyan-400 font-bold " +
                                  "text-[10px]"
                                }>
                                  {c.joueur}
                                </p>
                                <div className={
                                  "flex items-center gap-1.5"
                                }>
                                  <p className={
                                    "text-gray-700 text-[9px]"
                                  }>
                                    {fts(c.createdAt)}
                                  </p>
                                  {(isAdmin ||
                                    user?.uid ===
                                      c.joueurId) && (
                                    <button
                                      onClick={() =>
                                        del(
                                          'commentaires',
                                          c.id
                                        )
                                      }
                                      className={
                                        "text-red-400/40 " +
                                        "text-[9px]"
                                      }
                                    >
                                      🗑️
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className={
                                "text-gray-400 text-xs"
                              }>
                                {c.texte}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Analyses list */}
                      {ma.length > 0 && (
                        <div className="space-y-1.5">
                          <p className={
                            "text-[9px] text-orange-400 " +
                            "uppercase tracking-wider " +
                            "font-bold"
                          }>
                            📋 Analyses ({ma.length})
                          </p>
                          {ma.map((a: any) => (
                            <div
                              key={a.id}
                              className={
                                "bg-white/5 rounded-lg " +
                                "p-2.5 border border-white/5"
                              }
                            >
                              <div className={
                                "flex items-center " +
                                "justify-between mb-2"
                              }>
                                <p className={
                                  "text-orange-400 " +
                                  "font-bold text-[10px]"
                                }>
                                  {a.joueur}
                                </p>
                                {(isAdmin ||
                                  user?.uid ===
                                    a.joueurId) && (
                                  <button
                                    onClick={() =>
                                      del('analyses', a.id)
                                    }
                                    className={
                                      "text-red-400/40 " +
                                      "text-[9px]"
                                    }
                                  >
                                    🗑️
                                  </button>
                                )}
                              </div>
                              <div className="space-y-1.5">
                                {a.bien && (
                                  <div className={
                                    "bg-green-500/10 " +
                                    "rounded-lg p-2"
                                  }>
                                    <p className={
                                      "text-[8px] " +
                                      "text-green-400 " +
                                      "font-bold"
                                    }>
                                      ✅
                                    </p>
                                    <p className={
                                      "text-gray-300 " +
                                      "text-[10px]"
                                    }>
                                      {a.bien}
                                    </p>
                                  </div>
                                )}
                                {a.mal && (
                                  <div className={
                                    "bg-red-500/10 " +
                                    "rounded-lg p-2"
                                  }>
                                    <p className={
                                      "text-[8px] " +
                                      "text-red-400 " +
                                      "font-bold"
                                    }>
                                      ❌
                                    </p>
                                    <p className={
                                      "text-gray-300 " +
                                      "text-[10px]"
                                    }>
                                      {a.mal}
                                    </p>
                                  </div>
                                )}
                                {a.plan && (
                                  <div className={
                                    "bg-blue-500/10 " +
                                    "rounded-lg p-2"
                                  }>
                                    <p className={
                                      "text-[8px] " +
                                      "text-blue-400 " +
                                      "font-bold"
                                    }>
                                      🎯
                                    </p>
                                    <p className={
                                      "text-gray-300 " +
                                      "text-[10px]"
                                    }>
                                      {a.plan}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {mn.length === 0 &&
                        mc.length === 0 &&
                        ma.length === 0 && (
                        <p className={
                          "text-gray-700 text-[10px] " +
                          "text-center"
                        }>
                          Aucune donnée
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Modal: Add Note */}
            {selectedMatchForNotes && (
              <div className={
                "fixed inset-0 bg-black/80 " +
                "backdrop-blur-xl flex items-center " +
                "justify-center z-50 p-4"
              }>
                <div className={
                  "bg-gradient-to-br from-[#1a1a1a] " +
                  "to-[#0a0a0a] rounded-3xl p-6 w-full " +
                  "max-w-sm border border-white/10"
                }>
                  <h3 className={
                    "text-lg font-bold bg-gradient-to-r " +
                    "from-[#D4AF37] to-[#FFD700] " +
                    "bg-clip-text text-transparent " +
                    "mb-5 text-center"
                  }>
                    📊 DYNO vs{' '}
                    {selectedMatchForNotes.adversaire}
                  </h3>
                  <div className="space-y-3 mb-5">
                    <div>
                      <label className={
                        "text-gray-600 text-[10px] " +
                        "mb-1.5 block uppercase"
                      }>
                        🧠 Mental
                      </label>
                      <input
                        type="number"
                        min="0" max="10"
                        value={nouvelleNote.mental}
                        onChange={e => setNouvelleNote({
                          ...nouvelleNote,
                          mental: e.target.value
                        })}
                        className={
                          "w-full bg-white/5 border " +
                          "border-white/10 rounded-xl " +
                          "px-4 py-3 text-white " +
                          "text-center text-xl font-bold " +
                          "focus:outline-none " +
                          "focus:border-[#D4AF37]/50"
                        }
                      />
                    </div>
                    <div>
                      <label className={
                        "text-gray-600 text-[10px] " +
                        "mb-1.5 block uppercase"
                      }>
                        💬 Comm
                      </label>
                      <input
                        type="number"
                        min="0" max="10"
                        value={nouvelleNote.communication}
                        onChange={e => setNouvelleNote({
                          ...nouvelleNote,
                          communication: e.target.value
                        })}
                        className={
                          "w-full bg-white/5 border " +
                          "border-white/10 rounded-xl " +
                          "px-4 py-3 text-white " +
                          "text-center text-xl font-bold " +
                          "focus:outline-none " +
                          "focus:border-[#D4AF37]/50"
                        }
                      />
                    </div>
                    <div>
                      <label className={
                        "text-gray-600 text-[10px] " +
                        "mb-1.5 block uppercase"
                      }>
                        🎯 Perf
                      </label>
                      <input
                        type="number"
                        min="0" max="10"
                        value={nouvelleNote.gameplay}
                        onChange={e => setNouvelleNote({
                          ...nouvelleNote,
                          gameplay: e.target.value
                        })}
                        className={
                          "w-full bg-white/5 border " +
                          "border-white/10 rounded-xl " +
                          "px-4 py-3 text-white " +
                          "text-center text-xl font-bold " +
                          "focus:outline-none " +
                          "focus:border-[#D4AF37]/50"
                        }
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedMatchForNotes(null)
                        setNouvelleNote({
                          matchId: '', mental: '',
                          communication: '', gameplay: ''
                        })
                      }}
                      className={
                        "flex-1 py-2.5 rounded-xl " +
                        "font-bold bg-white/5 border " +
                        "border-white/10 text-gray-500 " +
                        "text-sm"
                      }
                    >
                      Annuler
                    </button>
                    <button
                      onClick={ajouterNote}
                      className={
                        "flex-1 py-2.5 rounded-xl " +
                        "font-bold bg-gradient-to-r " +
                        "from-[#D4AF37] to-[#FFD700] " +
                        "text-black shadow-lg " +
                        "shadow-[#D4AF37]/30 text-sm"
                      }
                    >
                      ✅
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ====== TAB: OBJECTIFS ====== */}
        {activeTab === 'objectifs' && (
          <div className="tab-content">
            <H title="Mes Objectifs" icon="🎯" />
            {user && (
              <div className="flex gap-2 mb-5">
                <input
                  type="text"
                  placeholder="Nouvel objectif..."
                  value={nouvelObjectif}
                  onChange={e =>
                    setNouvelObjectif(e.target.value)
                  }
                  onKeyDown={e => {
                    if (e.key === 'Enter') ajouterObjectif()
                  }}
                  className={
                    "flex-1 bg-white/5 border " +
                    "border-white/10 rounded-xl px-4 " +
                    "py-2.5 text-white text-sm " +
                    "focus:outline-none " +
                    "focus:border-[#D4AF37]/50"
                  }
                />
                <button
                  onClick={ajouterObjectif}
                  className={
                    "px-4 py-2.5 rounded-xl font-bold " +
                    "bg-gradient-to-r from-[#D4AF37] " +
                    "to-[#FFD700] text-black text-sm"
                  }
                >
                  ➕
                </button>
              </div>
            )}
            {objectifs.filter(
              (o: any) => o.joueurId === user?.uid
            ).length === 0 ? (
              <div className="text-center py-10 text-gray-600">
                🎯 Aucun
              </div>
            ) : (
              <div className="space-y-3">
                {/* En cours */}
                {objectifs.filter(
                  (o: any) => !o.termine &&
                    o.joueurId === user?.uid
                ).length > 0 && (
                  <div>
                    <p className={
                      "text-[9px] text-[#D4AF37] mb-2 " +
                      "uppercase tracking-wider font-bold"
                    }>
                      🔄 En cours
                    </p>
                    <div className="space-y-2">
                      {objectifs
                        .filter(
                          (o: any) => !o.termine &&
                            o.joueurId === user?.uid
                        )
                        .map((o: any, idx: number) => (
                          <div
                            key={o.id}
                            className={
                              "card-glow bg-black/30 " +
                              "rounded-xl p-3 border " +
                              "border-[#D4AF37]/15 " +
                              "flex items-start gap-3"
                            }
                            style={{
                              animationDelay:
                                (idx * 0.1) + 's'
                            }}
                          >
                            <button
                              onClick={() =>
                                toggleObjectif(
                                  o.id, o.termine
                                )
                              }
                              className={
                                "mt-0.5 w-5 h-5 " +
                                "rounded-lg border-2 " +
                                "border-[#D4AF37]/50 " +
                                "flex-shrink-0"
                              }
                            />
                            <div className="flex-1">
                              <p className={
                                "text-white text-sm"
                              }>
                                {o.texte}
                              </p>
                              <p className={
                                "text-gray-700 " +
                                "text-[9px] mt-1"
                              }>
                                {new Date(o.createdAt)
                                  .toLocaleDateString(
                                    'fr-FR'
                                  )}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                del('objectifs', o.id)
                              }
                              className={
                                "text-red-400/40 " +
                                "text-sm flex-shrink-0"
                              }
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Atteints */}
                {objectifs.filter(
                  (o: any) => o.termine &&
                    o.joueurId === user?.uid
                ).length > 0 && (
                  <div className="mt-5">
                    <p className={
                      "text-[9px] text-green-400 mb-2 " +
                      "uppercase tracking-wider font-bold"
                    }>
                      ✅ Atteints ({objectifs.filter(
                        (o: any) => o.termine &&
                          o.joueurId === user?.uid
                      ).length})
                    </p>
                    <div className="space-y-2">
                      {objectifs
                        .filter(
                          (o: any) => o.termine &&
                            o.joueurId === user?.uid
                        )
                        .map((o: any) => (
                          <div
                            key={o.id}
                            className={
                              "bg-black/20 rounded-xl " +
                              "p-3 border " +
                              "border-green-500/10 " +
                              "flex items-start gap-3 " +
                              "opacity-60"
                            }
                          >
                            <button
                              onClick={() =>
                                toggleObjectif(
                                  o.id, o.termine
                                )
                              }
                              className={
                                "mt-0.5 w-5 h-5 " +
                                "rounded-lg bg-green-600 " +
                                "flex items-center " +
                                "justify-center " +
                                "flex-shrink-0"
                              }
                            >
                              <span className={
                                "text-white text-[9px]"
                              }>
                                ✓
                              </span>
                            </button>
                            <p className={
                              "text-gray-500 text-sm " +
                              "line-through flex-1"
                            }>
                              {o.texte}
                            </p>
                            <button
                              onClick={() =>
                                del('objectifs', o.id)
                              }
                              className={
                                "text-red-400/40 " +
                                "text-sm flex-shrink-0"
                              }
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ====== TAB: REPLAYS ====== */}
        {activeTab === 'rec' && (
          <div className="tab-content">
            <H title="Replays" icon="🎬" />
            <a
              href={YT}
              target="_blank"
              className={
                "block w-full mb-5 py-2.5 rounded-xl " +
                "font-bold bg-red-600/15 text-red-400 " +
                "border border-red-500/15 text-center " +
                "text-xs"
              }
            >
              🔴 YouTube
            </a>
            {replays.length === 0 ? (
              <div className="text-center py-10 text-gray-600">
                📹 Aucun
              </div>
            ) : (
              <div className="space-y-3">
                {replays.map((r: any, idx: number) => (
                  <div
                    key={r.id}
                    className={
                      "card-glow bg-black/30 rounded-3xl " +
                      "p-4 border border-[#D4AF37]/15"
                    }
                    style={{
                      animationDelay: (idx * 0.1) + 's'
                    }}
                  >
                    <div className={
                      "flex items-center " +
                      "justify-between mb-2"
                    }>
                      <h3 className={
                        "font-bold text-[#D4AF37] text-sm"
                      }>
                        {r.titre}
                      </h3>
                      {isAdmin && (
                        <button
                          onClick={() =>
                            del('replays', r.id)
                          }
                          className={
                            "text-red-400/40 text-[9px]"
                          }
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                    {ytId(r.lien) ? (
                      <div className={
                        "relative w-full pb-[56.25%] " +
                        "rounded-xl overflow-hidden"
                      }>
                        <iframe
                          src={
                            'https://www.youtube.com/embed/' +
                            ytId(r.lien)
                          }
                          className={
                            "absolute top-0 left-0 " +
                            "w-full h-full"
                          }
                          frameBorder="0"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <a
                        href={r.lien}
                        target="_blank"
                        className={
                          "block py-2.5 rounded-xl " +
                          "font-bold bg-gradient-to-r " +
                          "from-[#D4AF37] to-[#FFD700] " +
                          "text-black text-center text-sm"
                        }
                      >
                        ▶️
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ====== TAB: ROSTER ====== */}
        {activeTab === 'roster' && (
          <div className="tab-content">
            <H title="Roster" icon="👥" />
            {user && (
              <div className={
                "card-glow bg-black/30 rounded-2xl " +
                "p-3 border border-pink-500/10 mb-5"
              }>
                <p className={
                  "text-[9px] text-pink-400 mb-1.5 " +
                  "uppercase tracking-wider"
                }>
                  🎂 Anniversaire
                </p>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={anniversaire}
                    onChange={e =>
                      setAnniversaire(e.target.value)
                    }
                    className={
                      "flex-1 bg-white/5 border " +
                      "border-white/10 rounded-lg " +
                      "px-3 py-2 text-white text-xs " +
                      "focus:outline-none " +
                      "focus:border-pink-400/50"
                    }
                  />
                  <button
                    onClick={sauvegarderAnniversaire}
                    className={
                      "px-3 py-2 rounded-lg font-bold " +
                      "bg-gradient-to-r from-pink-500 " +
                      "to-purple-500 text-white text-xs " +
                      "shadow-lg shadow-pink-500/20"
                    }
                  >
                    💾
                  </button>
                </div>
              </div>
            )}
            <div className="space-y-2.5">
              {joueurs
                .filter((j: any) => j.actif !== false)
                .map((j: any, idx: number) => (
                  <div
                    key={j.id}
                    className={
                      "card-glow bg-black/30 rounded-2xl " +
                      "p-3.5 border border-[#D4AF37]/15 " +
                      "flex items-center gap-3"
                    }
                    style={{
                      animationDelay: (idx * 0.1) + 's'
                    }}
                  >
                    <div className={
                      "w-12 h-12 rounded-xl " +
                      "bg-gradient-to-br " +
                      "from-[#D4AF37]/20 to-[#D4AF37]/5 " +
                      "flex items-center justify-center " +
                      "text-[#D4AF37] font-bold text-lg " +
                      "border border-[#D4AF37]/15"
                    }>
                      {j.pseudo[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className={
                        "font-bold text-[#D4AF37] text-sm"
                      }>
                        {j.pseudo}
                      </p>
                      <p className={
                        "text-[10px] text-gray-600"
                      }>
                        🎮 {j.role}
                      </p>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() =>
                          del('players', j.id)
                        }
                        className="text-red-400/40"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ====== TAB: STATS ====== */}
        {activeTab === 'stats' && (
          <div className="tab-content">
            <H title="Stats" icon="📈" />
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className={
                "card-glow bg-[#D4AF37]/10 rounded-2xl " +
                "p-4 border border-[#D4AF37]/15 " +
                "text-center"
              }>
                <p className={
                  "text-3xl font-bold bg-gradient-to-r " +
                  "from-[#D4AF37] to-[#FFD700] " +
                  "bg-clip-text text-transparent count-up"
                }>
                  {winRate}%
                </p>
                <p className={
                  "text-[9px] text-gray-600 mt-1.5 " +
                  "uppercase tracking-wider"
                }>
                  Win Rate
                </p>
              </div>
              <div className={
                "card-glow bg-[#D4AF37]/10 rounded-2xl " +
                "p-4 border border-[#D4AF37]/15 " +
                "text-center"
              }>
                <p className={
                  "text-3xl font-bold bg-gradient-to-r " +
                  "from-[#D4AF37] to-[#FFD700] " +
                  "bg-clip-text text-transparent count-up"
                }>
                  {totalMatchs}
                </p>
                <p className={
                  "text-[9px] text-gray-600 mt-1.5 " +
                  "uppercase tracking-wider"
                }>
                  Matchs
                </p>
              </div>
            </div>

            {/* Progress bars */}
            <div className={
              "card-glow bg-black/30 rounded-3xl p-5 " +
              "border border-[#D4AF37]/15"
            }>
              <h3 className={
                "text-xs font-bold text-[#D4AF37] mb-3 " +
                "uppercase tracking-wider"
              }>
                📊 Répartition
              </h3>
              <div className="space-y-3">
                <div>
                  <div className={
                    "flex justify-between mb-1.5"
                  }>
                    <span className={
                      "text-gray-600 text-[10px]"
                    }>
                      🏆 Victoires
                    </span>
                    <span className={
                      "text-[#D4AF37] font-bold text-xs"
                    }>
                      {victoires}
                    </span>
                  </div>
                  <div className={
                    "bg-white/5 rounded-full h-2"
                  }>
                    <div
                      className={
                        "bg-gradient-to-r from-[#D4AF37] " +
                        "to-[#FFD700] h-2 rounded-full " +
                        "shadow-[0_0_8px_rgba(212,175,55,0.4)] " +
                        "transition-all duration-1000"
                      }
                      style={{
                        width: (totalMatchs > 0
                          ? (victoires / totalMatchs) * 100
                          : 0) + '%'
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className={
                    "flex justify-between mb-1.5"
                  }>
                    <span className={
                      "text-gray-600 text-[10px]"
                    }>
                      ❌ Défaites
                    </span>
                    <span className={
                      "text-red-500 font-bold text-xs"
                    }>
                      {defaites}
                    </span>
                  </div>
                  <div className={
                    "bg-white/5 rounded-full h-2"
                  }>
                    <div
                      className={
                        "bg-gradient-to-r from-red-600 " +
                        "to-red-500 h-2 rounded-full " +
                        "shadow-[0_0_8px_rgba(239,68,68,0.4)] " +
                        "transition-all duration-1000"
                      }
                      style={{
                        width: (totalMatchs > 0
                          ? (defaites / totalMatchs) * 100
                          : 0) + '%'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bilan button */}
            <button
              onClick={() => setShowBilan(true)}
              className={
                "w-full mt-5 py-3 rounded-2xl font-bold " +
                "bg-gradient-to-r from-purple-600 " +
                "to-purple-700 text-white shadow-lg " +
                "shadow-purple-500/20 hover:scale-[1.02] " +
                "transition-transform text-sm"
              }
            >
              📊 Bilan du mois
            </button>

            {/* Modal: Bilan */}
            {showBilan && (() => {
              const b = genBilan()
              return (
                <div className={
                  "fixed inset-0 bg-black/80 " +
                  "backdrop-blur-xl flex items-center " +
                  "justify-center z-50 p-4"
                }>
                  <div className={
                    "bg-gradient-to-br from-[#1a1a1a] " +
                    "to-[#0a0a0a] rounded-3xl p-6 " +
                    "w-full max-w-sm border " +
                    "border-white/10"
                  }>
                    <h3 className={
                      "text-lg font-bold bg-gradient-to-r " +
                      "from-[#D4AF37] to-[#FFD700] " +
                      "bg-clip-text text-transparent " +
                      "mb-5 text-center"
                    }>
                      📊 Bilan {b.nom}
                    </h3>
                    <div className="space-y-3 mb-5">
                      <div className={
                        "grid grid-cols-3 gap-2"
                      }>
                        <div className={
                          "bg-white/5 rounded-xl p-3 " +
                          "border border-white/5 " +
                          "text-center"
                        }>
                          <p className={
                            "text-2xl font-bold " +
                            "text-white count-up"
                          }>
                            {b.m}
                          </p>
                          <p className={
                            "text-[9px] text-gray-600 " +
                            "uppercase"
                          }>
                            Matchs
                          </p>
                        </div>
                        <div className={
                          "bg-green-500/10 rounded-xl " +
                          "p-3 border border-green-500/10 " +
                          "text-center"
                        }>
                          <p className={
                            "text-2xl font-bold " +
                            "text-green-400 count-up"
                          }>
                            {b.w}W
                          </p>
                          <p className={
                            "text-[9px] text-gray-600 " +
                            "uppercase"
                          }>
                            Victoires
                          </p>
                        </div>
                        <div className={
                          "bg-red-500/10 rounded-xl " +
                          "p-3 border border-red-500/10 " +
                          "text-center"
                        }>
                          <p className={
                            "text-2xl font-bold " +
                            "text-red-400 count-up"
                          }>
                            {b.l}L
                          </p>
                          <p className={
                            "text-[9px] text-gray-600 " +
                            "uppercase"
                          }>
                            Défaites
                          </p>
                        </div>
                      </div>
                      <div className={
                        "bg-[#D4AF37]/10 rounded-xl " +
                        "p-4 border border-[#D4AF37]/15 " +
                        "text-center"
                      }>
                        <p className={
                          "text-4xl font-bold " +
                          "bg-gradient-to-r " +
                          "from-[#D4AF37] to-[#FFD700] " +
                          "bg-clip-text text-transparent " +
                          "count-up"
                        }>
                          {b.wr}%
                        </p>
                        <p className={
                          "text-[9px] text-gray-600 " +
                          "uppercase mt-1"
                        }>
                          Win Rate
                        </p>
                      </div>
                      <div className={
                        "grid grid-cols-3 gap-2"
                      }>
                        <div className={
                          "bg-purple-500/10 rounded-xl " +
                          "p-3 border " +
                          "border-purple-500/10 " +
                          "text-center"
                        }>
                          <p className={
                            "text-xl font-bold " +
                            "text-purple-400"
                          }>
                            {b.am}
                          </p>
                          <p className={
                            "text-[9px] text-gray-600"
                          }>
                            🧠
                          </p>
                        </div>
                        <div className={
                          "bg-blue-500/10 rounded-xl " +
                          "p-3 border " +
                          "border-blue-500/10 text-center"
                        }>
                          <p className={
                            "text-xl font-bold " +
                            "text-blue-400"
                          }>
                            {b.ac}
                          </p>
                          <p className={
                            "text-[9px] text-gray-600"
                          }>
                            💬
                          </p>
                        </div>
                        <div className={
                          "bg-green-500/10 rounded-xl " +
                          "p-3 border " +
                          "border-green-500/10 text-center"
                        }>
                          <p className={
                            "text-xl font-bold " +
                            "text-green-400"
                          }>
                            {b.ap}
                          </p>
                          <p className={
                            "text-[9px] text-gray-600"
                          }>
                            🎯
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowBilan(false)}
                      className={
                        "w-full py-2.5 rounded-xl " +
                        "font-bold bg-white/5 border " +
                        "border-white/10 text-gray-400 " +
                        "text-sm"
                      }
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* ====== TAB: ADMIN ====== */}
        {activeTab === 'admin' && (
          <div className="tab-content">
            <H title="Admin" icon="⚙️" />
            {!isAdmin ? (
              <div className={
                "card-glow bg-black/30 rounded-3xl " +
                "p-5 border border-[#D4AF37]/15"
              }>
                <input
                  type="password"
                  placeholder="Mot de passe"
                  value={adminPassword}
                  onChange={e =>
                    setAdminPassword(e.target.value)
                  }
                  className={
                    "w-full bg-white/5 border " +
                    "border-white/10 rounded-xl px-4 " +
                    "py-3 mb-3 text-white text-sm " +
                    "focus:outline-none " +
                    "focus:border-[#D4AF37]/50"
                  }
                />
                <button
                  onClick={handleAdminLogin}
                  className={
                    "w-full py-2.5 rounded-xl font-bold " +
                    "bg-gradient-to-r from-[#D4AF37] " +
                    "to-[#FFD700] text-black shadow-lg " +
                    "shadow-[#D4AF37]/30 text-sm"
                  }
                >
                  Connexion
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Add match */}
                <div className={
                  "card-glow bg-black/30 rounded-3xl " +
                  "p-5 border border-[#D4AF37]/15"
                }>
                  <h3 className={
                    "text-xs font-bold text-[#D4AF37] " +
                    "mb-3 uppercase tracking-wider"
                  }>
                    ➕ Match
                  </h3>
                  <input
                    type="text"
                    placeholder="Adversaire / Nom"
                    value={nouveauMatch.adversaire}
                    onChange={e => setNouveauMatch({
                      ...nouveauMatch,
                      adversaire: e.target.value
                    })}
                    className={
                      "w-full bg-white/5 border " +
                      "border-white/10 rounded-xl px-4 " +
                      "py-2.5 mb-2 text-white text-sm " +
                      "focus:outline-none " +
                      "focus:border-[#D4AF37]/50"
                    }
                  />
                  <input
                    type="date"
                    value={nouveauMatch.date}
                    onChange={e => setNouveauMatch({
                      ...nouveauMatch,
                      date: e.target.value
                    })}
                    className={
                      "w-full bg-white/5 border " +
                      "border-white/10 rounded-xl px-4 " +
                      "py-2.5 mb-2 text-white text-sm " +
                      "focus:outline-none " +
                      "focus:border-[#D4AF37]/50"
                    }
                  />
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="time"
                      value={nouveauMatch.horaire1}
                      onChange={e => setNouveauMatch({
                        ...nouveauMatch,
                        horaire1: e.target.value
                      })}
                      className={
                        "bg-white/5 border " +
                        "border-white/10 rounded-xl " +
                        "px-3 py-2.5 text-white text-sm " +
                        "focus:outline-none " +
                        "focus:border-[#D4AF37]/50"
                      }
                    />
                    <input
                      type="time"
                      value={nouveauMatch.horaire2}
                      onChange={e => setNouveauMatch({
                        ...nouveauMatch,
                        horaire2: e.target.value
                      })}
                      className={
                        "bg-white/5 border " +
                        "border-white/10 rounded-xl " +
                        "px-3 py-2.5 text-white text-sm " +
                        "focus:outline-none " +
                        "focus:border-[#D4AF37]/50"
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <select
                      value={nouveauMatch.arene}
                      onChange={e => setNouveauMatch({
                        ...nouveauMatch,
                        arene: e.target.value
                      })}
                      className={
                        "bg-white/5 border " +
                        "border-white/10 rounded-xl " +
                        "px-3 py-2.5 text-white text-sm " +
                        "focus:outline-none " +
                        "focus:border-[#D4AF37]/50"
                      }
                    >
                      <option value="Arène 1">Arène 1</option>
                      <option value="Arène 2">Arène 2</option>
                    </select>
                    <select
                      value={nouveauMatch.type}
                      onChange={e => setNouveauMatch({
                        ...nouveauMatch,
                        type: e.target.value
                      })}
                      className={
                        "bg-white/5 border " +
                        "border-white/10 rounded-xl " +
                        "px-3 py-2.5 text-white text-sm " +
                        "focus:outline-none " +
                        "focus:border-[#D4AF37]/50"
                      }
                    >
                      <option value="Ligue">Ligue</option>
                      <option value="Scrim">Scrim</option>
                      <option value="Tournoi">Tournoi</option>
                      <option value="Division">Division</option>
                    </select>
                  </div>

                  {/* Division sub-matches */}
                  {nouveauMatch.type === 'Division' && (
                    <div className={
                      "bg-white/5 rounded-xl p-3 mb-2 " +
                      "border border-white/5"
                    }>
                      <div className={
                        "flex items-center " +
                        "justify-between mb-2"
                      }>
                        <p className={
                          "text-[10px] text-[#D4AF37] " +
                          "font-bold uppercase"
                        }>
                          🏆 Sous-matchs (BO3)
                        </p>
                        <button
                          onClick={ajouterSousMatch}
                          className={
                            "px-2 py-1 rounded-lg " +
                            "bg-[#D4AF37]/20 " +
                            "text-[#D4AF37] text-xs"
                          }
                        >
                          ➕
                        </button>
                      </div>
                      {nouveauMatch.sousMatchs.length > 0 ? (
                        <div className="space-y-1">
                          {nouveauMatch.sousMatchs.map(
                            (sm: any, i: number) => (
                              <div
                                key={i}
                                className={
                                  "flex items-center " +
                                  "justify-between " +
                                  "bg-black/30 rounded-lg " +
                                  "px-2 py-1.5"
                                }
                              >
                                <div className="flex-1">
                                  <p className={
                                    "text-[9px] " +
                                    "text-gray-400"
                                  }>
                                    {sm.adversaire}
                                  </p>
                                  <p className={
                                    "text-[10px] font-bold"
                                  }>
                                    <span className={
                                      "text-[#D4AF37]"
                                    }>
                                      {sm.scoreDyno}
                                    </span>
                                    -
                                    <span className={
                                      "text-gray-500"
                                    }>
                                      {sm.scoreAdv}
                                    </span>
                                  </p>
                                </div>
                                <button
                                  onClick={() =>
                                    supprimerSousMatch(i)
                                  }
                                  className={
                                    "text-red-400/40 " +
                                    "text-xs"
                                  }
                                >
                                  🗑️
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <p className={
                          "text-[9px] text-gray-600 " +
                          "text-center"
                        }>
                          Aucun sous-match
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    onClick={ajouterMatch}
                    className={
                      "w-full py-2.5 rounded-xl font-bold " +
                      "bg-gradient-to-r from-[#D4AF37] " +
                      "to-[#FFD700] text-black shadow-lg " +
                      "shadow-[#D4AF37]/30 text-sm"
                    }
                  >
                    Ajouter + Discord
                  </button>
                </div>

                {/* Delete matches */}
                <div className={
                  "card-glow bg-black/30 rounded-3xl " +
                  "p-5 border border-[#D4AF37]/15"
                }>
                  <h3 className={
                    "text-xs font-bold text-[#D4AF37] " +
                    "mb-3 uppercase tracking-wider"
                  }>
                    🗑️ Matchs
                  </h3>
                  {matchs.length === 0 ? (
                    <p className={
                      "text-gray-700 text-center text-xs"
                    }>
                      Aucun
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {matchs.map((m: any) => (
                        <div
                          key={m.id}
                          className={
                            "flex items-center " +
                            "justify-between bg-white/5 " +
                            "rounded-lg p-2.5 border " +
                            "border-white/5"
                          }
                        >
                          <div>
                            <p className={
                              "text-[#D4AF37] font-bold " +
                              "text-[10px]"
                            }>
                              {m.adversaire}
                            </p>
                            <p className={
                              "text-gray-700 text-[9px]"
                            }>
                              {fdf(m.date)}
                              {m.termine
                                ? ' • ✅ Terminé'
                                : ' • ⏳ À venir'}
                            </p>
                          </div>
                          <div className={
                            "flex items-center gap-1.5"
                          }>
                            {m.termine && (
                              <button
                                onClick={() =>
                                  setEditHistoriqueScore({
                                    id: m.id,
                                    adversaire:
                                      m.adversaire || '',
                                    scoreDyno: String(
                                      m.scoreDyno || 0
                                    ),
                                    scoreAdv: String(
                                      m.scoreAdversaire || 0
                                    ),
                                    type:
                                      m.type || 'Ligue',
                                    arene:
                                      m.arene || 'Arène 1',
                                    date: m.date || '',
                                    termine: true,
                                    sousMatchs:
                                      m.sousMatchs || []
                                  })
                                }
                                className={
                                  "text-[#D4AF37]/60 " +
                                  "hover:text-[#D4AF37] " +
                                  "text-sm transition-colors"
                                }
                                title="Modifier"
                              >
                                ✏️
                              </button>
                            )}
                            <button
                              onClick={() =>
                                del('matchs', m.id)
                              }
                              className="text-red-400/40"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add replay */}
                <div className={
                  "card-glow bg-black/30 rounded-3xl " +
                  "p-5 border border-[#D4AF37]/15"
                }>
                  <h3 className={
                    "text-xs font-bold text-[#D4AF37] " +
                    "mb-3 uppercase tracking-wider"
                  }>
                    🎬 Replay
                  </h3>
                  <input
                    type="text"
                    placeholder="Titre"
                    value={nouveauReplay.titre}
                    onChange={e => setNouveauReplay({
                      ...nouveauReplay,
                      titre: e.target.value
                    })}
                    className={
                      "w-full bg-white/5 border " +
                      "border-white/10 rounded-xl px-4 " +
                      "py-2.5 mb-2 text-white text-sm " +
                      "focus:outline-none " +
                      "focus:border-[#D4AF37]/50"
                    }
                  />
                  <input
                    type="text"
                    placeholder="Lien YouTube"
                    value={nouveauReplay.lien}
                    onChange={e => setNouveauReplay({
                      ...nouveauReplay,
                      lien: e.target.value
                    })}
                    className={
                      "w-full bg-white/5 border " +
                      "border-white/10 rounded-xl px-4 " +
                      "py-2.5 mb-2 text-white text-sm " +
                      "focus:outline-none " +
                      "focus:border-[#D4AF37]/50"
                    }
                  />
                  <button
                    onClick={ajouterReplay}
                    className={
                      "w-full py-2.5 rounded-xl font-bold " +
                      "bg-gradient-to-r from-[#D4AF37] " +
                      "to-[#FFD700] text-black shadow-lg " +
                      "shadow-[#D4AF37]/30 text-sm"
                    }
                  >
                    Ajouter
                  </button>
                </div>

                {/* Edit scores */}
                <div className={
                  "card-glow bg-black/30 rounded-3xl " +
                  "p-5 border border-[#D4AF37]/15"
                }>
                  <h3 className={
                    "text-xs font-bold text-[#D4AF37] " +
                    "mb-3 uppercase tracking-wider"
                  }>
                    ✏️ Scores
                  </h3>
                  {prochainsMatchs.map((m: any) => (
                    <div
                      key={m.id}
                      className={
                        "bg-white/5 rounded-lg p-3 " +
                        "mb-2 border border-white/5"
                      }
                    >
                      <p className={
                        "font-bold text-[#D4AF37] " +
                        "mb-2 text-xs"
                      }>
                        DYNO vs {m.adversaire}
                      </p>
                      <button
                        onClick={() => setScoreEdit({
                          id: m.id,
                          scoreDyno: '',
                          scoreAdv: ''
                        })}
                        className={
                          "w-full py-2 rounded-lg " +
                          "font-bold bg-gradient-to-r " +
                          "from-[#D4AF37] to-[#FFD700] " +
                          "text-black text-xs"
                        }
                      >
                        📝
                      </button>
                    </div>
                  ))}
                </div>

                {/* Logout */}
                <button
                  onClick={handleAdminLogout}
                  className={
                    "w-full bg-white/5 border " +
                    "border-red-500/15 text-red-400 " +
                    "py-2.5 rounded-xl font-bold text-sm"
                  }
                >
                  🚪 Déconnexion
                </button>
              </div>
            )}

            {/* Modal: Score Edit */}
            {scoreEdit && (
              <div className={
                "fixed inset-0 bg-black/80 " +
                "backdrop-blur-xl flex items-center " +
                "justify-center z-50 p-4"
              }>
                <div className={
                  "bg-gradient-to-br from-[#1a1a1a] " +
                  "to-[#0a0a0a] rounded-3xl p-6 w-full " +
                  "max-w-sm border border-white/10"
                }>
                  <h3 className={
                    "text-lg font-bold bg-gradient-to-r " +
                    "from-[#D4AF37] to-[#FFD700] " +
                    "bg-clip-text text-transparent " +
                    "mb-5 text-center"
                  }>
                    📝 Score
                  </h3>
                  <div className={
                    "grid grid-cols-2 gap-3 mb-5"
                  }>
                    <div>
                      <label className={
                        "text-gray-600 text-[10px] " +
                        "mb-1 block uppercase"
                      }>
                        DYNO
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={scoreEdit.scoreDyno}
                        onChange={e => setScoreEdit({
                          ...scoreEdit,
                          scoreDyno: e.target.value
                        })}
                        className={
                          "w-full bg-white/5 border " +
                          "border-white/10 rounded-xl " +
                          "px-4 py-3 text-white " +
                          "text-center text-xl " +
                          "font-bold focus:outline-none " +
                          "focus:border-[#D4AF37]/50"
                        }
                      />
                    </div>
                    <div>
                      <label className={
                        "text-gray-600 text-[10px] " +
                        "mb-1 block uppercase"
                      }>
                        Adv
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={scoreEdit.scoreAdv}
                        onChange={e => setScoreEdit({
                          ...scoreEdit,
                          scoreAdv: e.target.value
                        })}
                        className={
                          "w-full bg-white/5 border " +
                          "border-white/10 rounded-xl " +
                          "px-4 py-3 text-white " +
                          "text-center text-xl " +
                          "font-bold focus:outline-none " +
                          "focus:border-[#D4AF37]/50"
                        }
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setScoreEdit(null)}
                      className={
                        "flex-1 py-2.5 rounded-xl " +
                        "font-bold bg-white/5 border " +
                        "border-white/10 text-gray-500 " +
                        "text-sm"
                      }
                    >
                      Annuler
                    </button>
                    <button
                      onClick={updateScore}
                      className={
                        "flex-1 py-2.5 rounded-xl " +
                        "font-bold bg-gradient-to-r " +
                        "from-[#D4AF37] to-[#FFD700] " +
                        "text-black shadow-lg " +
                        "shadow-[#D4AF37]/30 text-sm"
                      }
                    >
                      ✅
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ====== LOGIN MODAL ====== */}
      {!user && (
        <div className={
          "fixed inset-0 bg-black/80 backdrop-blur-xl " +
          "flex items-center justify-center z-50 p-4"
        }>
          <P />
          <div className={
            "bg-gradient-to-br from-[#1a1a1a] " +
            "to-[#0a0a0a] rounded-3xl p-7 w-full " +
            "max-w-sm border border-white/10 " +
            "shadow-[0_16px_64px_rgba(0,0,0,0.5)] " +
            "relative z-10"
          }>
            <img
              src={LG} alt="D"
              className={
                "w-16 h-16 mx-auto mb-4 " +
                "drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]"
              }
            />
            <h3 className={
              "text-lg font-bold bg-gradient-to-r " +
              "from-[#D4AF37] to-[#FFD700] bg-clip-text " +
              "text-transparent mb-5 text-center"
            }>
              {isSignUp ? '📝 Créer' : '🔐 Connexion'}
            </h3>
            {isSignUp && (
              <input
                type="text"
                placeholder="Pseudo"
                value={pseudo}
                onChange={e => setPseudo(e.target.value)}
                className={
                  "w-full bg-white/5 border " +
                  "border-white/10 rounded-xl px-4 " +
                  "py-3 mb-3 text-white text-sm " +
                  "focus:outline-none " +
                  "focus:border-[#D4AF37]/50"
                }
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={
                "w-full bg-white/5 border " +
                "border-white/10 rounded-xl px-4 " +
                "py-3 mb-3 text-white text-sm " +
                "focus:outline-none " +
                "focus:border-[#D4AF37]/50"
              }
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={authPassword}
              onChange={e =>
                setAuthPassword(e.target.value)
              }
              className={
                "w-full bg-white/5 border " +
                "border-white/10 rounded-xl px-4 " +
                "py-3 mb-5 text-white text-sm " +
                "focus:outline-none " +
                "focus:border-[#D4AF37]/50"
              }
            />
            {isSignUp ? (
              <button
                onClick={handleSignUp}
                className={
                  "w-full py-3 rounded-xl font-bold " +
                  "bg-gradient-to-r from-[#D4AF37] " +
                  "to-[#FFD700] text-black shadow-lg " +
                  "shadow-[#D4AF37]/30 mb-3 text-sm"
                }
              >
                ✅ Créer
              </button>
            ) : (
              <button
                onClick={handleSignIn}
                className={
                  "w-full py-3 rounded-xl font-bold " +
                  "bg-gradient-to-r from-[#D4AF37] " +
                  "to-[#FFD700] text-black shadow-lg " +
                  "shadow-[#D4AF37]/30 mb-3 text-sm"
                }
              >
                🔐 Connexion
              </button>
            )}
            <div className={
              "border-t border-white/5 pt-3"
            }>
              {isSignUp ? (
                <button
                  onClick={() => setIsSignUp(false)}
                  className={
                    "w-full text-[#D4AF37] text-xs " +
                    "hover:underline"
                  }
                >
                  Déjà un compte ?
                </button>
              ) : (
                <button
                  onClick={() => setIsSignUp(true)}
                  className={
                    "w-full text-[#D4AF37] text-xs " +
                    "hover:underline"
                  }
                >
                  Pas de compte ?
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App