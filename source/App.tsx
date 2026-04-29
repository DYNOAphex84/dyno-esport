import { useEffect, useMemo, useState } from 'react'
import { initializeApp } from 'firebase/app'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc
} from 'firebase/firestore'
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyDXwItLM0OZ0VmHj-DLZcH8OBy7wXiHBsM',
  authDomain: 'dyno-esport.firebaseapp.com',
  projectId: 'dyno-esport',
  storageBucket: 'dyno-esport.firebasestorage.app',
  messagingSenderId: '808658404731',
  appId: '1:808658404731:web:f3cf29142d3038816f29de'
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

setPersistence(auth, browserLocalPersistence).catch(() => {})

const LG = 'https://i.imgur.com/gTLj57a.png'
const YT = 'https://youtube.com/@jonathanla890?si=eHtXG1hjlmCuZ-RC'
const AE = 'thibaut.llorens@hotmail.com'

const DW =
  'https://discord.com/api/webhooks/1489600048474886295/HfR7YhCRuDpjN6NCw133bShUF9Gj1gak-fWtTYVYgI2G_gllQ001kRfH0w57mUuCTytp'

const AM = [
  'Engine',
  'Helios',
  'Silva',
  'The Cliff',
  'Artefact',
  'Outlaw',
  'Atlantis',
  'Horizon',
  'Polaris',
  'Lunar',
  'Ceres'
]

const CATS = [
  { v: 'strat', l: 'Stratégie', i: '🎯' },
  { v: 'tutorial', l: 'Tutoriel', i: '📚' },
  { v: 'highlight', l: 'Highlight', i: '⭐' },
  { v: 'replay', l: 'Replay', i: '🎬' },
  { v: 'scrim', l: 'Scrim', i: '⚔️' }
] as const

type VideoCat = (typeof CATS)[number]['v']

type StratVideo = {
  id: string
  titre: string
  description: string
  youtubeUrl: string
  youtubeId: string
  jeu: string
  map: string
  categorie: VideoCat
  tags: string[]
  auteur: string
  auteurId: string
  likes: string[]
  publie: boolean
  createdAt: number
}

type Match = {
  id: string
  adversaire: string
  date: string
  horaire1: string
  horaire2?: string
  arene: string
  type: string
  termine: boolean
  scoreDyno?: number
  scoreAdversaire?: number
  disponibles?: string[]
  indisponibles?: string[]
  createdAt: number
}

type Replay = {
  id: string
  titre: string
  lien: string
  createdAt: number
}

type Player = {
  id: string
  pseudo: string
  role?: string
  userId?: string
  createdAt: number
}

const ytId = (url: string) => {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^"&?/\s]{11})/
  )
  if (match) return match[1]
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url
  return ''
}

const fdf = (s: string) => {
  if (!s) return ''
  if (s.includes('/')) return s
  const [y, m, d] = s.split('-')
  if (!y || !m || !d) return s
  return `${d}/${m}/${y}`
}

const P = () => (
  <div className="particles">
    {Array.from({ length: 12 }).map((_, i) => (
      <div key={i} className="particle" />
    ))}
  </div>
)

export default function App() {
  const [activeTab, setActiveTab] = useState('matchs')
  const [showSplash, setShowSplash] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [pseudo, setPseudo] = useState('')
  const [email, setEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')

  const [matchs, setMatchs] = useState<Match[]>([])
  const [replays, setReplays] = useState<Replay[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [stratVideos, setStratVideos] = useState<StratVideo[]>([])

  const [showAddVideo, setShowAddVideo] = useState(false)
  const [videoStep, setVideoStep] = useState<'form' | 'preview' | 'publishing' | 'done'>('form')
  const [selectedVideo, setSelectedVideo] = useState<StratVideo | null>(null)
  const [playerLoaded, setPlayerLoaded] = useState(false)
  const [videoFilter, setVideoFilter] = useState<'all' | VideoCat>('all')
  const [videoSearch, setVideoSearch] = useState('')
  const [videoYtId, setVideoYtId] = useState('')

  const [newVideo, setNewVideo] = useState({
    titre: '',
    description: '',
    youtubeUrl: '',
    jeu: 'EVA Esport Arena',
    map: '',
    categorie: 'strat' as VideoCat,
    tags: '',
    publie: true
  })

  const [newMatch, setNewMatch] = useState({
    adversaire: '',
    date: '',
    horaire1: '',
    horaire2: '',
    arene: 'Arène 1',
    type: 'Ligue'
  })

  const [newReplay, setNewReplay] = useState({
    titre: '',
    lien: ''
  })

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1600)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      setUser(u)
      if (!u) return

      const snap = await getDoc(doc(db, 'users', u.uid))
      if (snap.exists()) {
        const data = snap.data()
        setPseudo(data.pseudo || '')
        if (u.email === AE || data.isAdmin) {
          setIsAdmin(true)
          localStorage.setItem('dyno-admin', 'true')
        }
      }
    })

    return () => unsub()
  }, [])

  useEffect(() => {
    if (localStorage.getItem('dyno-admin') === 'true') setIsAdmin(true)
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'matchs'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      const data: Match[] = []
      snap.forEach(d => data.push({ id: d.id, ...(d.data() as Omit<Match, 'id'>) }))
      setMatchs(data)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'replays'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      const data: Replay[] = []
      snap.forEach(d => data.push({ id: d.id, ...(d.data() as Omit<Replay, 'id'>) }))
      setReplays(data)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'players'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      const data: Player[] = []
      snap.forEach(d => data.push({ id: d.id, ...(d.data() as Omit<Player, 'id'>) }))
      setPlayers(data)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'stratVideos'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      const data: StratVideo[] = []
      snap.forEach(d => data.push({ id: d.id, ...(d.data() as Omit<StratVideo, 'id'>) }))
      setStratVideos(data)
    })
    return () => unsub()
  }, [])

  const addLog = async (action: string) => {
    if (!user) return
    try {
      await addDoc(collection(db, 'logs'), {
        joueur: pseudo || user.email,
        joueurId: user.uid,
        action,
        createdAt: Date.now()
      })
    } catch {}
  }

  const handleSignUp = async () => {
    if (!pseudo || !email || !authPassword) {
      alert('⚠️ Remplis tout !')
      return
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, authPassword)
      await setDoc(doc(db, 'users', res.user.uid), {
        pseudo,
        email,
        createdAt: Date.now(),
        isAdmin: email === AE
      })
      await addDoc(collection(db, 'players'), {
        pseudo,
        role: 'Joueur',
        userId: res.user.uid,
        createdAt: Date.now()
      })
      setIsSignUp(false)
      setEmail('')
      setAuthPassword('')
      alert('✅ Compte créé !')
    } catch (e: any) {
      alert('❌ ' + e.message)
    }
  }

  const handleSignIn = async () => {
    if (!email || !authPassword) {
      alert('⚠️ Remplis tout !')
      return
    }

    try {
      await setPersistence(auth, browserLocalPersistence)
      await signInWithEmailAndPassword(auth, email, authPassword)
      setEmail('')
      setAuthPassword('')
      alert('✅ Connecté !')
    } catch (e: any) {
      alert('❌ ' + e.message)
    }
  }

  const handleSignOut = async () => {
    await signOut(auth)
    setUser(null)
    setPseudo('')
    setIsAdmin(false)
    localStorage.removeItem('dyno-admin')
  }

  const handleAdminLogin = () => {
    if (adminPassword === 'dyno2026') {
      setIsAdmin(true)
      localStorage.setItem('dyno-admin', 'true')
      setAdminPassword('')
    } else {
      alert('❌ Mot de passe incorrect')
    }
  }

  const handleVideoUrlChange = (url: string) => {
    setNewVideo(v => ({ ...v, youtubeUrl: url }))
    setVideoYtId(ytId(url))
  }

  const resetVideoForm = () => {
    setNewVideo({
      titre: '',
      description: '',
      youtubeUrl: '',
      jeu: 'EVA Esport Arena',
      map: '',
      categorie: 'strat',
      tags: '',
      publie: true
    })
    setVideoYtId('')
    setVideoStep('form')
  }

  const publierStratVideo = async () => {
    if (!user || !newVideo.titre || !videoYtId) {
      alert('⚠️ Titre et URL YouTube obligatoires')
      return
    }

    setVideoStep('publishing')

    try {
      await addDoc(collection(db, 'stratVideos'), {
        titre: newVideo.titre,
        description: newVideo.description,
        youtubeUrl: newVideo.youtubeUrl,
        youtubeId: videoYtId,
        jeu: 'EVA Esport Arena',
        map: newVideo.map || 'All',
        categorie: newVideo.categorie,
        tags: newVideo.tags.split(',').map(t => t.trim()).filter(Boolean),
        auteur: pseudo || user.email || 'Membre',
        auteurId: user.uid,
        likes: [],
        publie: newVideo.publie,
        createdAt: Date.now()
      })

      addLog('Vidéo publiée : ' + newVideo.titre)

      try {
        await fetch(DW, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [
              {
                title: '📺 Nouvelle Strat Vidéo !',
                description: newVideo.titre,
                color: 13934871,
                fields: [
                  { name: '🎮 Jeu', value: 'EVA Esport Arena', inline: true },
                  { name: '🗺️ Map', value: newVideo.map || 'All', inline: true },
                  { name: '👤 Par', value: pseudo || user.email || 'Membre', inline: true },
                  { name: '🔗 YouTube', value: newVideo.youtubeUrl, inline: false }
                ],
                thumbnail: {
                  url: `https://img.youtube.com/vi/${videoYtId}/hqdefault.jpg`
                },
                footer: { text: 'DYNO Esport', icon_url: LG }
              }
            ]
          })
        })
      } catch {}

      setVideoStep('done')
    } catch (e: any) {
      setVideoStep('form')
      alert('❌ ' + e.message)
    }
  }

  const likerVideo = async (v: StratVideo) => {
    if (!user) return
    const likes = v.likes || []
    const next = likes.includes(user.uid)
      ? likes.filter(id => id !== user.uid)
      : [...likes, user.uid]

    await updateDoc(doc(db, 'stratVideos', v.id), { likes: next })
  }

  const togglePublierVideo = async (v: StratVideo) => {
    await updateDoc(doc(db, 'stratVideos', v.id), { publie: !v.publie })
    if (selectedVideo?.id === v.id) {
      setSelectedVideo({ ...v, publie: !v.publie })
    }
  }

  const del = async (col: string, id: string) => {
    if (!confirm('Supprimer ?')) return
    await deleteDoc(doc(db, col, id))
  }

  const addMatch = async () => {
    if (!newMatch.adversaire || !newMatch.date || !newMatch.horaire1) {
      alert('⚠️ Adversaire, date et horaire obligatoires')
      return
    }

    await addDoc(collection(db, 'matchs'), {
      ...newMatch,
      termine: false,
      disponibles: [],
      indisponibles: [],
      createdAt: Date.now()
    })

    setNewMatch({
      adversaire: '',
      date: '',
      horaire1: '',
      horaire2: '',
      arene: 'Arène 1',
      type: 'Ligue'
    })
  }

  const addReplay = async () => {
    if (!newReplay.titre || !newReplay.lien) return
    await addDoc(collection(db, 'replays'), {
      ...newReplay,
      createdAt: Date.now()
    })
    setNewReplay({ titre: '', lien: '' })
  }

  const filteredVideos = useMemo(() => {
    return stratVideos.filter(v => {
      const cat = videoFilter === 'all' || v.categorie === videoFilter
      const search =
        !videoSearch ||
        v.titre.toLowerCase().includes(videoSearch.toLowerCase()) ||
        v.description?.toLowerCase().includes(videoSearch.toLowerCase()) ||
        v.tags?.some(t => t.toLowerCase().includes(videoSearch.toLowerCase()))

      const visible = isAdmin || v.publie || v.auteurId === user?.uid

      return cat && search && visible
    })
  }, [stratVideos, videoFilter, videoSearch, isAdmin, user])

  const prochainsMatchs = matchs.filter(m => !m.termine)
  const victoires = matchs.filter(m => m.termine && (m.scoreDyno || 0) > (m.scoreAdversaire || 0)).length
  const defaites = matchs.filter(m => m.termine && (m.scoreDyno || 0) < (m.scoreAdversaire || 0)).length
  const total = victoires + defaites
  const winRate = total ? Math.round((victoires / total) * 100) : 0

  const H = ({ title, icon }: { title: string; icon?: string }) => (
    <div className="relative rounded-3xl p-7 mb-5 text-center overflow-hidden bg-gradient-to-br from-[#D4AF37]/10 via-[#D4AF37]/5 to-transparent border border-[#D4AF37]/15">
      <img src={LG} alt="DYNO" className="w-14 h-14 mx-auto mb-2 drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]" />
      <h2 className="text-lg font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
        {icon} {title}
      </h2>
    </div>
  )

  const menuItems = [
    { t: 'matchs', i: '📅', l: 'Matchs' },
    { t: 'stratVideos', i: '📺', l: 'Strat Vidéo' },
    { t: 'rec', i: '🎬', l: 'Replays' },
    { t: 'roster', i: '👥', l: 'Roster' },
    { t: 'stats', i: '📈', l: 'Stats' },
    { t: 'admin', i: '⚙️', l: 'Admin' }
  ]

  if (showSplash) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
        <P />
        <div className="text-center relative z-10">
          <img src={LG} alt="DYNO" className="w-48 h-48 mx-auto drop-shadow-[0_0_40px_rgba(212,175,55,0.6)]" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] bg-clip-text text-transparent mt-6">
            DYNO
          </h1>
          <p className="text-gray-400 mt-3 tracking-[0.3em] uppercase text-sm">Esport Team</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pb-8 relative">
      <P />

      <header className="backdrop-blur-2xl bg-black/40 border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMenu(true)}
              className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 text-xl"
            >
              ☰
            </button>
            <img src={LG} alt="DYNO" className="w-11 h-11" />
            <div>
              <h1 className="text-xl font-black text-[#D4AF37] leading-none">DYNO</h1>
              <p className="text-[10px] text-gray-500 tracking-widest uppercase">Esport</p>
            </div>
          </div>

          {user ? (
            <button
              onClick={handleSignOut}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold"
            >
              👋 {pseudo || 'Membre'}
            </button>
          ) : (
            <button
              onClick={() => setIsSignUp(false)}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-xs font-bold"
            >
              Connexion
            </button>
          )}
        </div>
      </header>

      {showMenu && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-64 bg-gradient-to-b from-[#1a1a1a] to-[#050505] border-r border-[#D4AF37]/20">
            <div className="p-5 border-b border-[#D4AF37]/10 flex items-center gap-3">
              <img src={LG} alt="DYNO" className="w-12 h-12" />
              <div>
                <h2 className="text-lg font-bold text-[#D4AF37]">DYNO</h2>
                <p className="text-[9px] text-gray-600 uppercase tracking-widest">Esport Team</p>
              </div>
            </div>

            <div className="py-3">
              {menuItems.map(item => (
                <button
                  key={item.t}
                  onClick={() => {
                    setActiveTab(item.t)
                    setShowMenu(false)
                  }}
                  className={
                    'w-full px-5 py-3 flex items-center gap-3 transition-all ' +
                    (activeTab === item.t
                      ? 'bg-[#D4AF37]/15 text-[#D4AF37] border-r-2 border-[#D4AF37]'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/5')
                  }
                >
                  <span>{item.i}</span>
                  <span className="text-sm font-bold uppercase">{item.l}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-black/70" onClick={() => setShowMenu(false)} />
        </div>
      )}

      <main className="max-w-lg mx-auto px-4 py-6 relative z-10">
        {activeTab === 'matchs' && (
          <div>
            <H title="Prochains Matchs" icon="📅" />

            {prochainsMatchs.length === 0 ? (
              <div className="text-center py-12 text-gray-600">📭 Aucun match planifié</div>
            ) : (
              <div className="space-y-4">
                {prochainsMatchs.map(m => (
                  <div key={m.id} className="bg-black/30 rounded-3xl p-4 border border-[#D4AF37]/15">
                    <div className="flex justify-between items-center mb-3">
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-bold bg-blue-500/20 text-blue-400">
                        {m.type}
                      </span>
                      <span className="text-[#D4AF37] text-xs font-bold">{fdf(m.date)}</span>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <img src={LG} alt="DYNO" className="w-10 h-10" />
                      <span className="text-gray-700">VS</span>
                      <div className="flex-1 text-right">
                        <p className="font-bold">{m.adversaire}</p>
                        <p className="text-[10px] text-[#D4AF37]/60">🏟️ {m.arene}</p>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-3 text-xs text-gray-400">
                      ⏰ {m.horaire1} {m.horaire2 ? `/ ${m.horaire2}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stratVideos' && (
          <div>
            <H title="Strat Vidéo" icon="📺" />

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
                <p className="text-xl font-bold text-[#D4AF37]">{stratVideos.length}</p>
                <p className="text-[9px] text-gray-600 uppercase">Total</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
                <p className="text-xl font-bold text-green-400">{stratVideos.filter(v => v.publie).length}</p>
                <p className="text-[9px] text-gray-600 uppercase">Publiées</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
                <p className="text-xl font-bold text-red-400">
                  {stratVideos.reduce((s, v) => s + (v.likes?.length || 0), 0)}
                </p>
                <p className="text-[9px] text-gray-600 uppercase">Likes</p>
              </div>
            </div>

            {user && (
              <button
                onClick={() => {
                  resetVideoForm()
                  setShowAddVideo(true)
                }}
                className="w-full mb-4 py-3 rounded-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 text-white text-sm"
              >
                📺 Publier une Strat Vidéo
              </button>
            )}

            <a
              href={YT}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full mb-4 py-2.5 rounded-xl font-bold bg-red-600/10 text-red-400 border border-red-500/20 text-center text-xs"
            >
              🔴 Chaîne YouTube DYNO
            </a>

            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3">
              <button
                onClick={() => setVideoFilter('all')}
                className={
                  'flex-shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-bold border ' +
                  (videoFilter === 'all'
                    ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30'
                    : 'bg-white/5 text-gray-500 border-white/10')
                }
              >
                Toutes
              </button>

              {CATS.map(c => (
                <button
                  key={c.v}
                  onClick={() => setVideoFilter(c.v)}
                  className={
                    'flex-shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-bold border ' +
                    (videoFilter === c.v
                      ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30'
                      : 'bg-white/5 text-gray-500 border-white/10')
                  }
                >
                  {c.i} {c.l}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Rechercher..."
              value={videoSearch}
              onChange={e => setVideoSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 mb-4 text-white text-sm focus:outline-none"
            />

            {filteredVideos.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <p className="text-4xl mb-2">📺</p>
                <p>Aucune vidéo</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredVideos.map(v => (
                  <div key={v.id} className="bg-black/30 rounded-3xl border border-[#D4AF37]/15 overflow-hidden">
                    <div
                      className="relative cursor-pointer"
                      onClick={() => {
                        setSelectedVideo(v)
                        setPlayerLoaded(false)
                      }}
                    >
                      <img
                        src={`https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`}
                        alt={v.titre}
                        className="w-full aspect-video object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center">
                          ▶
                        </div>
                      </div>
                      {!v.publie && (
                        <span className="absolute top-2 left-2 bg-yellow-500 text-black text-[9px] px-2 py-1 rounded-lg font-black">
                          BROUILLON
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-sm mb-1">{v.titre}</h3>
                      {v.description && <p className="text-gray-500 text-[10px] mb-2">{v.description}</p>}

                      <div className="flex gap-2 flex-wrap mb-3">
                        <span className="bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded-lg text-[9px]">
                          🎮 {v.jeu}
                        </span>
                        {v.map !== 'All' && (
                          <span className="bg-white/5 text-gray-500 px-2 py-0.5 rounded-lg text-[9px]">
                            🗺️ {v.map}
                          </span>
                        )}
                        <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded-lg text-[9px]">
                          {CATS.find(c => c.v === v.categorie)?.i} {CATS.find(c => c.v === v.categorie)?.l}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedVideo(v)
                            setPlayerLoaded(false)
                          }}
                          className="flex-1 py-2 rounded-xl bg-red-600/15 text-red-400 border border-red-500/20 text-xs font-bold"
                        >
                          ▶ Regarder
                        </button>

                        <button
                          onClick={() => likerVideo(v)}
                          className={
                            'py-2 px-3 rounded-xl text-xs font-bold border ' +
                            (user && v.likes?.includes(user.uid)
                              ? 'bg-red-500/20 text-red-400 border-red-500/30'
                              : 'bg-white/5 text-gray-500 border-white/10')
                          }
                        >
                          ❤️ {v.likes?.length || 0}
                        </button>

                        {(isAdmin || user?.uid === v.auteurId) && (
                          <>
                            <button
                              onClick={() => togglePublierVideo(v)}
                              className="py-2 px-2 rounded-xl text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                            >
                              {v.publie ? '👁' : '✅'}
                            </button>
                            <button
                              onClick={() => del('stratVideos', v.id)}
                              className="py-2 px-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/10 text-xs"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedVideo && (
              <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-white/10">
                  <button onClick={() => setSelectedVideo(null)} className="text-gray-400 text-sm">
                    ← Retour
                  </button>
                  <a
                    href={selectedVideo.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 text-xs font-bold"
                  >
                    YouTube
                  </a>
                </div>

                {!playerLoaded ? (
                  <div className="relative aspect-video cursor-pointer" onClick={() => setPlayerLoaded(true)}>
                    <img
                      src={`https://img.youtube.com/vi/${selectedVideo.youtubeId}/hqdefault.jpg`}
                      alt={selectedVideo.titre}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-3xl">
                        ▶
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0`}
                      title={selectedVideo.titre}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                <div className="p-4 space-y-3 overflow-y-auto">
                  <h2 className="font-bold text-lg">{selectedVideo.titre}</h2>
                  <p className="text-gray-400 text-sm">{selectedVideo.description}</p>
                  <div className="flex gap-2 flex-wrap text-[10px]">
                    <span className="bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-1 rounded-lg">
                      🎮 {selectedVideo.jeu}
                    </span>
                    {selectedVideo.map !== 'All' && (
                      <span className="bg-white/5 text-gray-400 px-2 py-1 rounded-lg">
                        🗺️ {selectedVideo.map}
                      </span>
                    )}
                    <span className="bg-white/5 text-gray-400 px-2 py-1 rounded-lg">
                      👤 {selectedVideo.auteur}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {showAddVideo && (
              <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-white/10">
                  <button
                    onClick={() => {
                      setShowAddVideo(false)
                      resetVideoForm()
                    }}
                    className="text-gray-400 text-sm"
                  >
                    ✕ Fermer
                  </button>
                  <h3 className="text-sm font-bold text-[#D4AF37]">
                    {videoStep === 'form'
                      ? '📺 Nouvelle vidéo'
                      : videoStep === 'preview'
                        ? '👁 Prévisualisation'
                        : videoStep === 'publishing'
                          ? '⏳ Publication'
                          : '✅ Publiée'}
                  </h3>
                  <div className="w-16" />
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {videoStep === 'form' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-gray-500 text-[10px] uppercase font-bold mb-1.5 block">
                          🔴 URL YouTube *
                        </label>
                        <input
                          type="url"
                          value={newVideo.youtubeUrl}
                          onChange={e => handleVideoUrlChange(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                        />
                        {videoYtId && <p className="text-green-400 text-[10px] mt-1">✅ ID : {videoYtId}</p>}
                      </div>

                      {videoYtId && (
                        <img
                          src={`https://img.youtube.com/vi/${videoYtId}/hqdefault.jpg`}
                          alt="Preview"
                          className="w-full aspect-video object-cover rounded-xl border border-white/10"
                        />
                      )}

                      <div>
                        <label className="text-gray-500 text-[10px] uppercase font-bold mb-1.5 block">
                          Titre *
                        </label>
                        <input
                          value={newVideo.titre}
                          onChange={e => setNewVideo(v => ({ ...v, titre: e.target.value }))}
                          placeholder="Start Lunar"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-gray-500 text-[10px] uppercase font-bold mb-1.5 block">
                          Description
                        </label>
                        <textarea
                          value={newVideo.description}
                          onChange={e => setNewVideo(v => ({ ...v, description: e.target.value }))}
                          rows={3}
                          placeholder="Décris la stratégie..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none resize-none"
                        />
                      </div>

                      <div>
                        <label className="text-gray-500 text-[10px] uppercase font-bold mb-1.5 block">
                          🎮 Jeu
                        </label>
                        <div className="w-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl px-3 py-2.5 text-[#D4AF37] text-sm font-bold flex items-center gap-2">
                          <img src={LG} alt="EVA" className="w-5 h-5" />
                          EVA Esport Arena
                        </div>
                      </div>

                      <div>
                        <label className="text-gray-500 text-[10px] uppercase font-bold mb-1.5 block">
                          🗺️ Map
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {AM.map(m => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setNewVideo(v => ({ ...v, map: v.map === m ? '' : m }))}
                              className={
                                'px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all border ' +
                                (newVideo.map === m
                                  ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20'
                                  : 'bg-white/5 text-gray-500 border-white/10 hover:border-[#D4AF37]/40')
                              }
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-gray-500 text-[10px] uppercase font-bold mb-1.5 block">
                          📂 Catégorie
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {CATS.map(c => (
                            <button
                              key={c.v}
                              type="button"
                              onClick={() => setNewVideo(v => ({ ...v, categorie: c.v }))}
                              className={
                                'py-2 rounded-xl text-[10px] font-bold border ' +
                                (newVideo.categorie === c.v
                                  ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40'
                                  : 'bg-white/5 text-gray-500 border-white/10')
                              }
                            >
                              {c.i} {c.l}
                            </button>
                          ))}
                        </div>
                      </div>

                      <input
                        value={newVideo.tags}
                        onChange={e => setNewVideo(v => ({ ...v, tags: e.target.value }))}
                        placeholder="rush, anti-éco, b-site"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                      />

                      <div className="flex items-center gap-3 bg-white/5 rounded-xl p-4 border border-white/10">
                        <button
                          type="button"
                          onClick={() => setNewVideo(v => ({ ...v, publie: !v.publie }))}
                          className={
                            'relative w-12 h-6 rounded-full transition-colors ' +
                            (newVideo.publie ? 'bg-green-500' : 'bg-white/20')
                          }
                        >
                          <div
                            className={
                              'absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ' +
                              (newVideo.publie ? 'translate-x-6' : 'translate-x-0.5')
                            }
                          />
                        </button>
                        <div>
                          <p className="font-bold">{newVideo.publie ? '✅ Publié' : '📝 Brouillon'}</p>
                          <p className="text-gray-600 text-[10px]">
                            {newVideo.publie ? 'Visible par tous les membres' : 'Visible uniquement par vous'}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowAddVideo(false)}
                          className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-500 font-bold"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => {
                            if (!newVideo.titre || !videoYtId) {
                              alert('⚠️ Titre et URL requis')
                              return
                            }
                            setVideoStep('preview')
                          }}
                          className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold"
                        >
                          Prévisualiser →
                        </button>
                      </div>
                    </div>
                  )}

                  {videoStep === 'preview' && (
                    <div className="space-y-4">
                      <img
                        src={`https://img.youtube.com/vi/${videoYtId}/hqdefault.jpg`}
                        alt="Preview"
                        className="w-full aspect-video object-cover rounded-xl"
                      />
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                        <h3 className="font-bold mb-2">{newVideo.titre}</h3>
                        <div className="flex flex-wrap gap-2 text-[10px]">
                          <span className="bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-1 rounded-lg">
                            🎮 EVA Esport Arena
                          </span>
                          {newVideo.map && (
                            <span className="bg-white/5 text-gray-400 px-2 py-1 rounded-lg">
                              🗺️ {newVideo.map}
                            </span>
                          )}
                          <span className="bg-red-500/10 text-red-400 px-2 py-1 rounded-lg">
                            {CATS.find(c => c.v === newVideo.categorie)?.i}{' '}
                            {CATS.find(c => c.v === newVideo.categorie)?.l}
                          </span>
                        </div>
                        {newVideo.description && <p className="text-gray-400 text-sm mt-3">{newVideo.description}</p>}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setVideoStep('form')}
                          className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-500 font-bold"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={publierStratVideo}
                          className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold"
                        >
                          Publier !
                        </button>
                      </div>
                    </div>
                  )}

                  {videoStep === 'publishing' && (
                    <div className="flex flex-col items-center justify-center py-20 space-y-5">
                      <div className="w-20 h-20 rounded-full bg-red-600/20 flex items-center justify-center animate-pulse text-4xl">
                        📺
                      </div>
                      <p className="font-bold">Publication en cours...</p>
                    </div>
                  )}

                  {videoStep === 'done' && (
                    <div className="flex flex-col items-center justify-center py-20 space-y-5 text-center">
                      <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center text-4xl">
                        ✅
                      </div>
                      <h3 className="font-bold text-xl">Vidéo publiée !</h3>
                      <button
                        onClick={() => {
                          setShowAddVideo(false)
                          resetVideoForm()
                        }}
                        className="w-full py-3 rounded-xl bg-[#D4AF37] text-black font-bold"
                      >
                        Fermer
                      </button>
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
            <a
              href={YT}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full mb-5 py-2.5 rounded-xl font-bold bg-red-600/15 text-red-400 border border-red-500/15 text-center text-xs"
            >
              🔴 Chaîne YouTube DYNO
            </a>

            {replays.length === 0 ? (
              <div className="text-center py-10 text-gray-600">📹 Aucun replay</div>
            ) : (
              <div className="space-y-3">
                {replays.map(r => (
                  <div key={r.id} className="bg-black/30 rounded-3xl p-4 border border-[#D4AF37]/15">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-bold text-[#D4AF37] text-sm">{r.titre}</h3>
                      {isAdmin && (
                        <button onClick={() => del('replays', r.id)} className="text-red-400/60">
                          🗑️
                        </button>
                      )}
                    </div>
                    {ytId(r.lien) ? (
                      <div className="relative w-full pb-[56.25%] rounded-xl overflow-hidden">
                        <iframe
                          src={'https://www.youtube.com/embed/' + ytId(r.lien)}
                          className="absolute top-0 left-0 w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <a
                        href={r.lien}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block py-2.5 rounded-xl font-bold bg-[#D4AF37] text-black text-center text-sm"
                      >
                        ▶️ Ouvrir
                      </a>
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

            {players.length === 0 ? (
              <div className="text-center py-10 text-gray-600">Aucun joueur</div>
            ) : (
              <div className="space-y-3">
                {players.map(p => (
                  <div key={p.id} className="bg-black/30 rounded-3xl p-4 border border-[#D4AF37]/15 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center text-xl font-black">
                      {p.pseudo?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-black">{p.pseudo}</p>
                      <p className="text-gray-500 text-[10px] uppercase">{p.role || 'Joueur'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <H title="Statistiques" icon="📈" />
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#D4AF37]/10 rounded-2xl p-4 border border-[#D4AF37]/15 text-center">
                <p className="text-3xl font-bold text-[#D4AF37]">{winRate}%</p>
                <p className="text-[9px] text-gray-600 uppercase">Win Rate</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
                <p className="text-3xl font-bold">{matchs.length}</p>
                <p className="text-[9px] text-gray-600 uppercase">Matchs</p>
              </div>
              <div className="bg-green-500/10 rounded-2xl p-4 border border-green-500/15 text-center">
                <p className="text-3xl font-bold text-green-400">{victoires}</p>
                <p className="text-[9px] text-gray-600 uppercase">Victoires</p>
              </div>
              <div className="bg-red-500/10 rounded-2xl p-4 border border-red-500/15 text-center">
                <p className="text-3xl font-bold text-red-400">{defaites}</p>
                <p className="text-[9px] text-gray-600 uppercase">Défaites</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div>
            <H title="Admin" icon="⚙️" />

            {!isAdmin ? (
              <div className="bg-black/30 rounded-3xl p-5 border border-[#D4AF37]/15">
                <input
                  type="password"
                  placeholder="Mot de passe admin"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-3 text-white text-sm focus:outline-none"
                />
                <button
                  onClick={handleAdminLogin}
                  className="w-full py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-sm"
                >
                  🔐 Connexion Admin
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#D4AF37]/10 rounded-2xl p-4 border border-[#D4AF37]/15">
                    <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Membres</p>
                    <p className="text-[#D4AF37] font-bold text-xs">{players.length} joueurs</p>
                  </div>
                  <div className="bg-red-500/10 rounded-2xl p-4 border border-red-500/15">
                    <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Strat Vidéos</p>
                    <p className="text-red-400 font-bold text-xs">{stratVideos.length} vidéos</p>
                  </div>
                </div>

                <div className="bg-black/30 rounded-3xl p-5 border border-[#D4AF37]/15">
                  <h3 className="text-xs font-bold text-[#D4AF37] mb-3 uppercase">➕ Planifier un match</h3>
                  <input
                    placeholder="Adversaire"
                    value={newMatch.adversaire}
                    onChange={e => setNewMatch(v => ({ ...v, adversaire: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 mb-2 text-white text-sm focus:outline-none"
                  />
                  <input
                    type="date"
                    value={newMatch.date}
                    onChange={e => setNewMatch(v => ({ ...v, date: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 mb-2 text-white text-sm focus:outline-none"
                  />
                  <input
                    type="time"
                    value={newMatch.horaire1}
                    onChange={e => setNewMatch(v => ({ ...v, horaire1: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 mb-2 text-white text-sm focus:outline-none"
                  />
                  <button
                    onClick={addMatch}
                    className="w-full py-2.5 rounded-xl font-bold bg-[#D4AF37] text-black text-sm"
                  >
                    📅 Créer
                  </button>
                </div>

                <div className="bg-black/30 rounded-3xl p-5 border border-[#D4AF37]/15">
                  <h3 className="text-xs font-bold text-[#D4AF37] mb-3 uppercase">🎬 Ajouter Replay</h3>
                  <input
                    placeholder="Titre"
                    value={newReplay.titre}
                    onChange={e => setNewReplay(v => ({ ...v, titre: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 mb-2 text-white text-sm focus:outline-none"
                  />
                  <input
                    placeholder="Lien YouTube"
                    value={newReplay.lien}
                    onChange={e => setNewReplay(v => ({ ...v, lien: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 mb-2 text-white text-sm focus:outline-none"
                  />
                  <button
                    onClick={addReplay}
                    className="w-full py-2.5 rounded-xl font-bold bg-[#D4AF37] text-black text-sm"
                  >
                    ➕ Publier
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {!user && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <P />
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-7 w-full max-w-sm border border-[#D4AF37]/20 relative z-10">
            <img src={LG} alt="DYNO" className="w-20 h-20 mx-auto mb-6" />
            <h3 className="text-xl font-black text-[#D4AF37] mb-6 text-center uppercase tracking-widest">
              {isSignUp ? 'REJOINDRE DYNO' : 'ACCÈS ÉQUIPE'}
            </h3>

            {isSignUp && (
              <input
                placeholder="Pseudo"
                value={pseudo}
                onChange={e => setPseudo(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-3 text-white text-sm focus:outline-none"
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-3 text-white text-sm focus:outline-none"
            />

            <input
              type="password"
              placeholder="Mot de passe"
              value={authPassword}
              onChange={e => setAuthPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-6 text-white text-sm focus:outline-none"
            />

            {isSignUp ? (
              <button
                onClick={handleSignUp}
                className="w-full py-4 rounded-2xl font-black bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black mb-4 text-sm"
              >
                CRÉER LE COMPTE
              </button>
            ) : (
              <button
                onClick={handleSignIn}
                className="w-full py-4 rounded-2xl font-black bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black mb-4 text-sm"
              >
                SE CONNECTER
              </button>
            )}

            <div className="border-t border-white/5 pt-4 text-center">
              {isSignUp ? (
                <button
                  onClick={() => setIsSignUp(false)}
                  className="text-[#D4AF37] text-[10px] font-bold uppercase opacity-70"
                >
                  Déjà membre ? Connexion
                </button>
              ) : (
                <button
                  onClick={() => setIsSignUp(true)}
                  className="text-[#D4AF37] text-[10px] font-bold uppercase opacity-70"
                >
                  Pas encore de compte ? Rejoindre
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}