import { useState, useEffect, useRef } from 'react'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, getDoc, setDoc } from 'firebase/firestore'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getMessaging, getToken } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: "AIzaSyDXwItLM0OZ0VmHj-DLZcH8OBy7wXiHBsM",
  authDomain: "dyno-esport.firebaseapp.com",
  projectId: "dyno-esport",
  storageBucket: "dyno-esport.firebasestorage.app",
  messagingSenderId: "808658404731",
  appId: "1:808658404731:web:f3cf29142d3038816f29de"
}

const VAPID_KEY = 'BIhsEPrWBagYPmnPjpiR3tlKZB0ehBMqkgMnoZUFv1jkNXb6DrkiFT7UOyBETE83ba_tGueF1uV0KNIz0mMXepk'
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1489600048474886295/HfR7YhCRuDpjN6NCw133bShUF9Gj1gak-fWtTYVYgI2G_gllQ001kRfH0w57mUuCTytp'

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

setPersistence(auth, browserLocalPersistence)

const LOGO_URL = 'https://i.imgur.com/gTLj57a.png'
const YOUTUBE_CHANNEL = 'https://youtube.com/@jonathanla890?si=wQkLpwEqKA7Dpuc8'
const ADMIN_EMAIL = 'thibaut.llorens@hotmail.com'

// 🗺️ Maps EVA Esport Arena
const EVA_MAPS = [
  { id: 'artefact', name: 'Artefact', image: '🏛️', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'atlantis', name: 'Atlantis', image: '🌊', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'ceres', name: 'Ceres', image: '🛰️', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'engine', name: 'Engine', image: '⚙️', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'helios', name: 'Helios Station', image: '🚀', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'horizon', name: 'Horizon', image: '🌴', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'lunar', name: 'Lunar Outpost', image: '🌙', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'outlaw', name: 'Outlaw', image: '🤠', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'polaris', name: 'Polaris', image: '❄️', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'silva', name: 'Silva', image: '🌳', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'cliff', name: 'The Cliff', image: '🏔️', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' }
]

const MAP_COLORS: Record<string, string> = {
  artefact: '#5D4E37',
  atlantis: '#1a3a52',
  ceres: '#3a3a3a',
  engine: '#4a3a2a',
  helios: '#524a1a',
  horizon: '#2a4a3a',
  lunar: '#2a2a3a',
  outlaw: '#4a3a2a',
  polaris: '#2a3a4a',
  silva: '#2a4a2a',
  cliff: '#4a3a2a'
}

function App() {
  const [activeTab, setActiveTab] = useState<'matchs' | 'historique' | 'notes' | 'strats' | 'rec' | 'roster' | 'stats' | 'admin'>('matchs')
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [showSplash, setShowSplash] = useState(true)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [pseudo, setPseudo] = useState('')
  const [email, setEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [notificationPermission, setNotificationPermission] = useState('default')
  const [matchs, setMatchs] = useState<any[]>([])
  const [replays, setReplays] = useState<any[]>([])
  const [nouveauReplay, setNouveauReplay] = useState({ titre: '', lien: '' })
  const [joueurs, setJoueurs] = useState<any[]>([])
  const [nouveauJoueur, setNouveauJoueur] = useState({ pseudo: '', role: 'Joueur', rang: '' })
  const [notes, setNotes] = useState<any[]>([])
  const [nouvelleNote, setNouvelleNote] = useState({ matchId: '', matchNom: '', mental: '', communication: '', gameplay: '' })
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [selectedMatchForNotes, setSelectedMatchForNotes] = useState<any>(null)
  const [nouveauMatch, setNouveauMatch] = useState({ adversaire: '', date: '', horaire1: '', horaire2: '', arene: 'Arène 1', type: 'Ligue' })
  const [scoreEdit, setScoreEdit] = useState<any>(null)
  const [strats, setStrats] = useState<any[]>([])
  const [selectedMap, setSelectedMap] = useState<string>('artefact')
  const [showBattlePlan, setShowBattlePlan] = useState(false)
  const [markers, setMarkers] = useState<{id: number, x: number, y: number, team: 'attack' | 'defend', step: number}[]>([])
  const [stratTitle, setStratTitle] = useState('')
  const [stratDescription, setStratDescription] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const [showLines, setShowLines] = useState(true)
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedAdmin = localStorage.getItem('dyno-admin')
    if (savedAdmin === 'true') setIsAdmin(true)
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          setPseudo(data.pseudo)
          if (user.email === ADMIN_EMAIL || data.isAdmin === true) {
            setIsAdmin(true)
            localStorage.setItem('dyno-admin', 'true')
          }
        }
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'matchs'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const matchsData: any[] = []
      snapshot.forEach((doc) => matchsData.push({ id: doc.id, ...doc.data() }))
      setMatchs(matchsData)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'replays'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const replaysData: any[] = []
      snapshot.forEach((doc) => replaysData.push({ id: doc.id, ...doc.data() }))
      setReplays(replaysData)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'players'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const joueursData: any[] = []
      snapshot.forEach((doc) => joueursData.push({ id: doc.id, ...doc.data() }))
      setJoueurs(joueursData)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData: any[] = []
      snapshot.forEach((doc) => notesData.push({ id: doc.id, ...doc.data() }))
      setNotes(notesData)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'strats'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const stratsData: any[] = []
      snapshot.forEach((doc) => stratsData.push({ id: doc.id, ...doc.data() }))
      setStrats(stratsData)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent))
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    })
  }, [])

  useEffect(() => {
    if ('Notification' in window) setNotificationPermission(Notification.permission)
  }, [])

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('❌ Notifications non supportées')
      return
    }
    if (isIOS) {
      alert('📱 iPhone : Ajoute l\'app à l\'écran d\'accueil')
      return
    }
    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)
    if (permission === 'granted' && user) {
      try {
        if ('serviceWorker' in navigator) await navigator.serviceWorker.register('/firebase-messaging-sw.js')
        const messaging = getMessaging(app)
        const token = await getToken(messaging, { vapidKey: VAPID_KEY })
        if (token) {
          await updateDoc(doc(db, 'users', user.uid), { fcmToken: token })
          alert('✅ Notifications activées !')
        }
      } catch (error: any) {
        alert('⚠️ Erreur: ' + error.message)
      }
    }
  }

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      setDeferredPrompt(null)
      setShowInstall(false)
    }
  }

  const handleSignUp = async () => {
    if (!email || !authPassword || !pseudo) {
      alert('⚠️ Remplis tous les champs !')
      return
    }
    setAuthLoading(true)
    try {
      const result = await createUserWithEmailAndPassword(auth, email, authPassword)
      await setDoc(doc(db, 'users', result.user.uid), { pseudo, email, createdAt: Date.now(), fcmToken: '', isAdmin: email === ADMIN_EMAIL })
      await addDoc(collection(db, 'players'), { pseudo, role: 'Joueur', rang: 'Nouveau', userId: result.user.uid, createdAt: Date.now() })
      alert('✅ Compte créé !')
      setIsSignUp(false)
      setEmail('')
      setAuthPassword('')
      setPseudo('')
    } catch (error: any) {
      alert('❌ ' + error.message)
    }
    setAuthLoading(false)
  }

  const handleSignIn = async () => {
    if (!email || !authPassword) {
      alert('⚠️ Remplis tous les champs !')
      return
    }
    setAuthLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, authPassword)
      alert('✅ Connecté !')
      setEmail('')
      setAuthPassword('')
    } catch (error: any) {
      alert('❌ ' + error.message)
    }
    setAuthLoading(false)
  }

  const handleSignOut = async () => {
    await signOut(auth)
    setPseudo('')
    setIsAdmin(false)
    localStorage.removeItem('dyno-admin')
    alert('✅ Déconnecté !')
  }

  const handleAdminLogin = () => {
    if (adminPassword === 'dyno2026') {
      setIsAdmin(true)
      localStorage.setItem('dyno-admin', 'true')
      setAdminPassword('')
      alert('✅ Admin connecté !')
    } else {
      alert('❌ Mot de passe incorrect !')
    }
  }

  const handleAdminLogout = () => {
    setIsAdmin(false)
    localStorage.removeItem('dyno-admin')
    alert('✅ Admin déconnecté !')
  }

  const ajouterMatch = async () => {
    if (!nouveauMatch.adversaire || !nouveauMatch.date || !nouveauMatch.horaire1) {
      alert('⚠️ Remplis tous les champs !')
      return
    }
    const horaires = [nouveauMatch.horaire1]
    if (nouveauMatch.horaire2) horaires.push(nouveauMatch.horaire2)
    await addDoc(collection(db, 'matchs'), { adversaire: nouveauMatch.adversaire, date: nouveauMatch.date, horaires, arene: nouveauMatch.arene, type: nouveauMatch.type, termine: false, disponibles: [], createdAt: Date.now() })
    setNouveauMatch({ adversaire: '', date: '', horaire1: '', horaire2: '', arene: 'Arène 1', type: 'Ligue' })
    alert('✅ Match ajouté !')
  }

  const ajouterReplay = async () => {
    if (!nouveauReplay.titre || !nouveauReplay.lien) {
      alert('⚠️ Remplis le titre et le lien !')
      return
    }
    await addDoc(collection(db, 'replays'), { titre: nouveauReplay.titre, lien: nouveauReplay.lien, createdAt: Date.now() })
    setNouveauReplay({ titre: '', lien: '' })
    alert('✅ Replay ajouté !')
  }

  const ajouterNote = async () => {
    if (!nouvelleNote.mental || !nouvelleNote.communication || !nouvelleNote.gameplay) {
      alert('⚠️ Remplis les 3 notes !')
      return
    }
    if (!user) {
      alert('⚠️ Tu dois être connecté !')
      return
    }
    const note = { 
      matchId: nouvelleNote.matchId,
      matchNom: nouvelleNote.matchNom,
      joueur: pseudo,
      joueurId: user.uid,
      mental: parseInt(nouvelleNote.mental),
      communication: parseInt(nouvelleNote.communication),
      gameplay: parseInt(nouvelleNote.gameplay),
      moyenne: Math.round((parseInt(nouvelleNote.mental) + parseInt(nouvelleNote.communication) + parseInt(nouvelleNote.gameplay)) / 3),
      createdAt: Date.now()
    }
    try {
      await addDoc(collection(db, 'notes'), note)
      setNouvelleNote({ matchId: '', matchNom: '', mental: '', communication: '', gameplay: '' })
      setShowNoteForm(false)
      setSelectedMatchForNotes(null)
      alert('✅ Note ajoutée !')
      setTimeout(() => window.location.reload(), 500)
    } catch (error: any) {
      alert('❌ Erreur: ' + error.message)
    }
  }

  const ouvrirFormulaireNotes = (match: any) => {
    setSelectedMatchForNotes(match)
    setNouvelleNote({ 
      matchId: match.id, 
      matchNom: `${match.adversaire} (${match.date})`,
      mental: '', 
      communication: '', 
      gameplay: '' 
    })
    setShowNoteForm(true)
  }

  const supprimerMatch = async (matchId: string) => {
    if (!confirm('⚠️ Supprimer ce match ?')) return
    await deleteDoc(doc(db, 'matchs', matchId))
    alert('✅ Match supprimé !')
  }

  const supprimerReplay = async (replayId: string) => {
    if (!confirm('⚠️ Supprimer ce replay ?')) return
    await deleteDoc(doc(db, 'replays', replayId))
    alert('✅ Replay supprimé !')
  }

  const supprimerNote = async (noteId: string, noteJoueurId: string) => {
    if (!confirm('⚠️ Supprimer cette note ?')) return
    if (!isAdmin && user?.uid !== noteJoueurId) {
      alert('❌ Tu ne peux supprimer que tes notes !')
      return
    }
    await deleteDoc(doc(db, 'notes', noteId))
    alert('✅ Note supprimée !')
    setTimeout(() => window.location.reload(), 500)
  }

  const supprimerJoueur = async (playerId: string, playerPseudo: string) => {
    if (!confirm(`⚠️ Supprimer "${playerPseudo}" ?`)) return
    await deleteDoc(doc(db, 'players', playerId))
    alert('✅ Joueur supprimé !')
  }

  const updateScore = async () => {
    if (!scoreEdit) return
    await updateDoc(doc(db, 'matchs', scoreEdit.id), { scoreDyno: parseInt(scoreEdit.scoreDyno), scoreAdversaire: parseInt(scoreEdit.scoreAdv), termine: true })
    setScoreEdit(null)
    alert('✅ Score mis à jour !')
    setTimeout(() => window.location.reload(), 500)
  }

  const toggleDisponibilite = async (matchId: string) => {
    if (!user) {
      alert('⚠️ Connecte-toi !')
      return
    }
    const match = matchs.find(m => m.id === matchId)
    if (!match) return
    const estDispo = match.disponibles.includes(pseudo)
    const nouveauxDisponibles = estDispo ? match.disponibles.filter((p: string) => p !== pseudo) : [...match.disponibles, pseudo]
    await updateDoc(doc(db, 'matchs', matchId), { disponibles: nouveauxDisponibles })
  }

  const ajouterJoueur = async () => {
    if (!nouveauJoueur.pseudo) {
      alert('⚠️ Entre un pseudo !')
      return
    }
    await addDoc(collection(db, 'players'), { pseudo: nouveauJoueur.pseudo, role: nouveauJoueur.role, rang: nouveauJoueur.rang, createdAt: Date.now() })
    setNouveauJoueur({ pseudo: '', role: 'Joueur', rang: '' })
    alert('✅ Joueur ajouté !')
  }

  const supprimerStrat = async (stratId: string, stratAuteurId: string) => {
    if (!confirm('⚠️ Supprimer cette stratégie ?')) return
    if (!isAdmin && user?.uid !== stratAuteurId) {
      alert('❌ Tu ne peux supprimer que tes stratégies !')
      return
    }
    await deleteDoc(doc(db, 'strats', stratId))
    alert('✅ Stratégie supprimée !')
  }

  const ouvrirBattlePlan = () => {
    setShowBattlePlan(true)
    setMarkers([])
    setCurrentStep(1)
    setStratTitle('')
    setStratDescription('')
  }

  const ajouterMarqueur = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return
    const rect = mapRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    const newMarker = {
      id: markers.length + 1,
      x,
      y,
      team: markers.length % 2 === 0 ? 'attack' : 'defend' as 'attack' | 'defend',
      step: currentStep
    }
    setMarkers([...markers, newMarker])
  }

  const supprimerMarqueur = (markerId: number) => {
    setMarkers(markers.filter(m => m.id !== markerId))
  }

  const sauvegarderBattlePlan = async () => {
    if (!stratTitle || markers.length === 0) {
      alert('⚠️ Ajoute un titre et au moins un marqueur !')
      return
    }
    if (!user) {
      alert('⚠️ Tu dois être connecté !')
      return
    }
    const strat = {
      titre: stratTitle,
      description: stratDescription,
      map: selectedMap,
      mapName: EVA_MAPS.find(m => m.id === selectedMap)?.name,
      auteur: pseudo,
      auteurId: user.uid,
      markers: markers,
      totalSteps: currentStep,
      type: 'Battle Plan',
      createdAt: Date.now()
    }
    await addDoc(collection(db, 'strats'), strat)
    setShowBattlePlan(false)
    setMarkers([])
    setStratTitle('')
    setStratDescription('')
    alert('✅ Battle Plan sauvegardé !')
  }

  const victoires = matchs.filter(m => m.termine && (m.scoreDyno || 0) > (m.scoreAdversaire || 0)).length
  const defaites = matchs.filter(m => m.termine && (m.scoreDyno || 0) < (m.scoreAdversaire || 0)).length
  const nuls = matchs.filter(m => m.termine && (m.scoreDyno || 0) === (m.scoreAdversaire || 0)).length
  const totalMatchs = victoires + defaites + nuls
  const winRate = totalMatchs > 0 ? Math.round((victoires / totalMatchs) * 100) : 0
  const prochainsMatchs = matchs.filter(m => !m.termine)
  const historique = matchs.filter(m => m.termine)

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    return match ? match[1] : null
  }

  if (showSplash) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <img src={LOGO_URL} alt="DYNO" className="w-56 h-56 mx-auto animate-pulse-gold" />
          <h1 className="text-4xl font-bold text-[#D4AF37] mt-6 animate-glow">DYNO</h1>
          <p className="text-gray-400 mt-2">Esport Team</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      <header className="bg-[#0a0a0a] border-b border-[#D4AF37]/30 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="DYNO" className="w-12 h-12" />
            <div>
              <h1 className="text-xl font-bold text-[#D4AF37]">DYNO</h1>
              <p className="text-xs text-gray-400">Esport Team</p>
            </div>
          </div>
          <div className="flex gap-2">
            {user ? (
              <button onClick={handleSignOut} className="px-4 py-2 rounded-lg font-medium border border-red-500 text-red-500">👋 {pseudo}</button>
            ) : (
              <button onClick={() => setIsSignUp(false)} className="px-4 py-2 rounded-lg font-medium btn-gold">👤 Compte</button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {activeTab === 'matchs' && (
          <div>
            <div className="card-relief rounded-2xl p-6 mb-6 text-center">
              <img src={LOGO_URL} alt="DYNO" className="w-20 h-20 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#D4AF37] mb-2">Prochains Matchs</h2>
            </div>
            {loading ? (
              <div className="text-center py-10 text-[#D4AF37]">⏳ Chargement...</div>
            ) : prochainsMatchs.length === 0 ? (
              <div className="text-center py-10 text-gray-500"><p>📭 Aucun match prévu</p></div>
            ) : (
              <div className="space-y-4">
                {prochainsMatchs.map(match => (
                  <div key={match.id} className="card-relief rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${match.type === 'Ligue' ? 'bg-blue-900/50 text-blue-400' : match.type === 'Scrim' ? 'bg-green-900/50 text-green-400' : 'bg-purple-900/50 text-purple-400'}`}>{match.type}</span>
                      <span className="text-[#D4AF37] font-bold">{match.date}</span>
                    </div>
                    <div className="flex items-center gap-4 mb-3">
                      <img src={LOGO_URL} alt="DYNO" className="w-12 h-12" />
                      <span className="text-gray-500">VS</span>
                      <div className="flex-1 text-right">
                        <p className="font-bold">{match.adversaire}</p>
                        <p className="text-sm text-[#D4AF37]">🏟️ {match.arene}</p>
                      </div>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-lg p-3 mb-3 border border-[#D4AF37]/20">
                      <p className="text-xs text-gray-400">⏰ Horaires</p>
                      <p className="text-[#D4AF37] font-bold">{match.horaires.join(' / ')}</p>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-lg p-3 mb-3 border border-[#D4AF37]/20">
                      <p className="text-xs text-gray-400">👥 Disponibles ({match.disponibles.length})</p>
                      {match.disponibles.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {match.disponibles.map((p: string, i: number) => (
                            <span key={i} className="bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-1 rounded text-xs font-bold">{p}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button onClick={() => toggleDisponibilite(match.id)} disabled={!user} className={`w-full py-3 rounded-lg font-bold ${!user ? 'bg-gray-700 text-gray-400' : match.disponibles.includes(pseudo) ? 'bg-[#D4AF37] text-black' : 'border border-[#D4AF37] text-[#D4AF37]'}`}>
                      {!user ? '🔐 Connecte-toi' : match.disponibles.includes(pseudo) ? '✅ Je suis disponible' : '📅 Je me marque disponible'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'historique' && (
          <div>
            <div className="card-relief rounded-2xl p-6 mb-6 text-center">
              <img src={LOGO_URL} alt="DYNO" className="w-20 h-20 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#D4AF37] mb-2">Historique</h2>
              <div className="flex justify-center gap-6 mt-4">
                <div className="text-center"><p className="text-3xl font-bold text-[#D4AF37]">{victoires}</p><p className="text-xs text-gray-400">Victoires</p></div>
                <div className="text-center"><p className="text-3xl font-bold text-[#D4AF37]">{nuls}</p><p className="text-xs text-gray-400">Nuls</p></div>
                <div className="text-center"><p className="text-3xl font-bold text-red-500">{defaites}</p><p className="text-xs text-gray-400">Défaites</p></div>
              </div>
            </div>
            {historique.length === 0 ? (
              <div className="text-center py-10 text-gray-500"><p>📜 Aucun match joué</p></div>
            ) : (
              <div className="space-y-4">
                {historique.map(match => (
                  <div key={match.id} className="card-relief rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${(match.scoreDyno || 0) > (match.scoreAdversaire || 0) ? 'bg-[#D4AF37] text-black' : (match.scoreDyno || 0) === (match.scoreAdversaire || 0) ? 'bg-gray-700 text-gray-300' : 'bg-red-900/50 text-red-400'}`}>
                        {(match.scoreDyno || 0) > (match.scoreAdversaire || 0) ? '🏆 VICTOIRE' : (match.scoreDyno || 0) === (match.scoreAdversaire || 0) ? '🤝 NUL' : '❌ DÉFAITE'}
                      </span>
                      <span className="text-gray-400 text-sm">{match.date}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-center"><p className="font-bold text-[#D4AF37]">DYNO</p><p className="text-3xl font-bold text-[#D4AF37]">{match.scoreDyno}</p></div>
                      <span className="text-gray-600 text-xl">-</span>
                      <div className="text-center"><p className="font-bold text-gray-400">{match.adversaire}</p><p className="text-3xl font-bold text-gray-400">{match.scoreAdversaire}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div>
            <div className="card-relief rounded-2xl p-6 mb-6 text-center">
              <img src={LOGO_URL} alt="DYNO" className="w-20 h-20 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#D4AF37] mb-2">📊 Notes</h2>
            </div>
            {historique.length === 0 ? (
              <div className="text-center py-10 text-gray-500"><p>📊 Aucun match terminé</p></div>
            ) : (
              <div className="space-y-4">
                {historique.map(match => {
                  const matchNotes = notes.filter((n: any) => n.matchId === match.id)
                  return (
                    <div key={match.id} className="card-relief rounded-xl p-4">
                      <p className="font-bold text-[#D4AF37] mb-2">{match.adversaire} - {match.date}</p>
                      {matchNotes.length > 0 ? (
                        <div className="space-y-2">
                          {matchNotes.map((note: any) => (
                            <div key={note.id} className="bg-[#0a0a0a] rounded p-3">
                              <p className="text-[#D4AF37] text-sm">{note.joueur}</p>
                              <div className="flex gap-4 text-xs text-gray-400">
                                <span>🧠 {note.mental}/10</span>
                                <span>💬 {note.communication}/10</span>
                                <span>🎯 {note.gameplay}/10</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">Aucune note</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'strats' && (
          <div>
            <div className="card-relief rounded-2xl p-6 mb-6 text-center">
              <img src={LOGO_URL} alt="DYNO" className="w-20 h-20 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#D4AF37] mb-2">🗺️ Stratégies</h2>
            </div>
            <div className="card-relief rounded-xl p-4 mb-6">
              <h3 className="text-lg font-bold text-[#D4AF37] mb-3">🗺️ Maps</h3>
              <div className="grid grid-cols-4 gap-2">
                {EVA_MAPS.map(map => (
                  <button key={map.id} onClick={() => setSelectedMap(map.id)} className={`p-2 rounded-lg text-center ${selectedMap === map.id ? 'bg-[#D4AF37] text-black' : 'bg-[#0a0a0a] text-gray-400'}`}>
                    <p className="text-xl">{map.image}</p>
                    <p className="text-xs">{map.name}</p>
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={ouvrirBattlePlan} className="btn-gold flex-1 py-3 rounded-lg">🎨 Créer</button>
                <a href={EVA_MAPS.find(m => m.id === selectedMap)?.evaUrl} target="_blank" className="btn-gold flex-1 py-3 rounded-lg text-center">🔗 EVA</a>
              </div>
            </div>
            <div className="space-y-4">
              {strats.filter((s: any) => s.map === selectedMap).length === 0 ? (
                <div className="text-center py-10 text-gray-500"><p>📝 Aucune strat</p></div>
              ) : (
                strats.filter((s: any) => s.map === selectedMap).map((strat: any) => (
                  <div key={strat.id} className="card-relief rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-[#D4AF37]">{strat.titre}</h3>
                      {(isAdmin || user?.uid === strat.auteurId) && <button onClick={() => supprimerStrat(strat.id, strat.auteurId)} className="text-red-400 text-xs">🗑️</button>}
                    </div>
                    <p className="text-xs text-gray-400 mb-2">par {strat.auteur}</p>
                    {strat.description && <p className="text-gray-300 text-sm mb-2 italic">{strat.description}</p>}
                    {strat.markers && strat.markers.length > 0 && (
                      <div className="bg-[#0a0a0a] rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-2">📍 {strat.markers.length} marqueurs</p>
                        <div className="flex flex-wrap gap-2">
                          {strat.markers.map((marker: any, i: number) => (
                            <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${marker.team === 'attack' ? 'bg-red-500' : 'bg-blue-500'}`}>{marker.id}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {showBattlePlan && (
              <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 overflow-hidden">
                <div className="w-full h-full flex">
                  <div className="w-16 bg-[#1a1a1a] border-r border-[#D4AF37]/30 flex flex-col items-center py-4 gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs ${markers.length % 2 === 0 ? 'bg-red-500' : 'bg-blue-500'}`}>
                      {markers.length % 2 === 0 ? '🔴' : '🔵'}
                    </div>
                    <button onClick={() => setMarkers([])} className="w-10 h-10 rounded-lg bg-red-900/50 border border-red-500 flex items-center justify-center text-red-400 mt-auto">🗑️</button>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="h-14 bg-[#1a1a1a] border-b border-[#D4AF37]/30 flex items-center justify-between px-4">
                      <div className="flex items-center gap-4">
                        <button onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} className="px-3 py-2 rounded-lg bg-[#D4AF37] text-black font-bold">⏮️</button>
                        <span className="text-[#D4AF37] font-bold">Étape {currentStep}</span>
                        <button onClick={() => setCurrentStep(currentStep + 1)} className="px-3 py-2 rounded-lg bg-[#D4AF37] text-black font-bold">⏭️</button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="showLines" checked={showLines} onChange={(e) => setShowLines(e.target.checked)} className="w-4 h-4 accent-[#D4AF37]" />
                        <label htmlFor="showLines" className="text-sm text-gray-400">Lignes</label>
                      </div>
                      <button onClick={() => setShowBattlePlan(false)} className="text-gray-400 text-2xl">✕</button>
                    </div>
                    <div className="flex-1 relative">
                      <div ref={mapRef} onClick={ajouterMarqueur} className="absolute inset-0 cursor-crosshair" style={{ backgroundColor: MAP_COLORS[selectedMap] || '#333' }}>
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                        <div className="absolute top-[20%] left-[20%] w-20 h-20 border-2 border-white/30 rounded-lg flex items-center justify-center text-white/30 font-bold text-2xl">A</div>
                        <div className="absolute top-[20%] right-[20%] w-20 h-20 border-2 border-white/30 rounded-lg flex items-center justify-center text-white/30 font-bold text-2xl">B</div>
                        <div className="absolute bottom-[20%] left-1/2 transform -translate-x-1/2 w-20 h-20 border-2 border-white/30 rounded-lg flex items-center justify-center text-white/30 font-bold text-2xl">C</div>
                        {showLines && markers.filter(m => m.step === currentStep).length > 1 && (
                          <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            {markers.filter(m => m.step === currentStep).map((marker, i, arr) => {
                              if (i === arr.length - 1) return null
                              return (<line key={i} x1={`${marker.x}%`} y1={`${marker.y}%`} x2={`${arr[i + 1].x}%`} y2={`${arr[i + 1].y}%`} stroke={marker.team === 'attack' ? '#EF4444' : '#3B82F6'} strokeWidth="2" strokeDasharray="5,5" opacity="0.6" />)
                            })}
                          </svg>
                        )}
                        {markers.filter(m => m.step === currentStep).map((marker) => (
                          <div key={marker.id} onClick={(e) => { e.stopPropagation(); supprimerMarqueur(marker.id) }} className={`absolute w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${marker.team === 'attack' ? 'bg-red-500' : 'bg-blue-500'}`} style={{ left: `${marker.x}%`, top: `${marker.y}%` }}>{marker.id}</div>
                        ))}
                      </div>
                    </div>
                    <div className="h-10 bg-[#1a1a1a] border-t border-[#D4AF37]/30 flex items-center justify-between px-4">
                      <span className="text-gray-400 text-sm">📍 {markers.filter(m => m.step === currentStep).length} marqueur(s)</span>
                      <div className="flex gap-4 text-xs">
                        <span className="text-red-400">🔴 Attaque</span>
                        <span className="text-blue-400">🔵 Défense</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-64 bg-[#1a1a1a] border-l border-[#D4AF37]/30 flex flex-col p-4 gap-4">
                    <h3 className="text-[#D4AF37] font-bold">STRATÉGIE</h3>
                    <input type="text" placeholder="Titre..." value={stratTitle} onChange={(e) => setStratTitle(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm" />
                    <textarea placeholder="Description..." value={stratDescription} onChange={(e) => setStratDescription(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm h-32 resize-none" />
                    <div className="mt-auto flex flex-col gap-2">
                      <button onClick={() => { setShowBattlePlan(false); setMarkers([]); }} className="w-full border border-gray-600 py-3 rounded-lg text-gray-400">Annuler</button>
                      <button onClick={sauvegarderBattlePlan} className="w-full btn-gold py-3 rounded-lg">✅ Sauvegarder</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'rec' && (
          <div>
            <div className="card-relief rounded-2xl p-6 mb-6 text-center">
              <img src={LOGO_URL} alt="DYNO" className="w-20 h-20 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#D4AF37] mb-2">🎬 Replays</h2>
            </div>
            {replays.length === 0 ? (
              <div className="text-center py-10 text-gray-500"><p>📹 Aucun replay</p></div>
            ) : (
              <div className="space-y-4">
                {replays.map(replay => (
                  <div key={replay.id} className="card-relief rounded-xl p-4">
                    <h3 className="font-bold text-[#D4AF37] mb-2">{replay.titre}</h3>
                    {getYouTubeId(replay.lien) ? (
                      <div className="relative w-full pb-[56.25%] rounded-lg overflow-hidden bg-gray-900">
                        <iframe src={`https://www.youtube.com/embed/${getYouTubeId(replay.lien)}`} className="absolute top-0 left-0 w-full h-full" frameBorder="0" allowFullScreen />
                      </div>
                    ) : (
                      <a href={replay.lien} target="_blank" className="btn-gold block text-center py-3 rounded-lg">▶️ Voir</a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'roster' && (
          <div>
            <div className="card-relief rounded-2xl p-6 mb-6 text-center">
              <img src={LOGO_URL} alt="DYNO" className="w-20 h-20 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#D4AF37] mb-2">👥 Roster</h2>
            </div>
            <div className="space-y-4">
              {joueurs.filter(j => j.actif !== false).map(joueur => (
                <div key={joueur.id} className="card-relief rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold text-xl">{joueur.pseudo[0]?.toUpperCase()}</div>
                    <div className="flex-1">
                      <p className="font-bold text-[#D4AF37]">{joueur.pseudo}</p>
                      <p className="text-sm text-gray-400">🎮 {joueur.role}</p>
                    </div>
                    {isAdmin && <button onClick={() => supprimerJoueur(joueur.id, joueur.pseudo)} className="text-red-400 text-xs">🗑️</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <div className="card-relief rounded-2xl p-6 mb-6 text-center">
              <img src={LOGO_URL} alt="DYNO" className="w-20 h-20 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#D4AF37] mb-2">📈 Stats</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="card-relief rounded-xl p-4 text-center"><p className="text-4xl font-bold text-[#D4AF37]">{winRate}%</p><p className="text-sm text-gray-400">Win Rate</p></div>
              <div className="card-relief rounded-xl p-4 text-center"><p className="text-4xl font-bold text-[#D4AF37]">{totalMatchs}</p><p className="text-sm text-gray-400">Matchs</p></div>
            </div>
            <div className="card-relief rounded-xl p-6">
              <h3 className="text-lg font-bold text-[#D4AF37] mb-4">📊 Répartition</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-gray-400">🏆 Victoires</span><span className="text-[#D4AF37] font-bold">{victoires}</span></div>
                <div className="w-full bg-gray-800 rounded-full h-2"><div className="bg-[#D4AF37] h-2 rounded-full" style={{ width: `${totalMatchs > 0 ? (victoires/totalMatchs)*100 : 0}%` }}></div></div>
                <div className="flex items-center justify-between mt-4"><span className="text-gray-400">❌ Défaites</span><span className="text-red-500 font-bold">{defaites}</span></div>
                <div className="w-full bg-gray-800 rounded-full h-2"><div className="bg-red-500 h-2 rounded-full" style={{ width: `${totalMatchs > 0 ? (defaites/totalMatchs)*100 : 0}%` }}></div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div>
            <div className="card-relief rounded-2xl p-6 mb-6 text-center">
              <img src={LOGO_URL} alt="DYNO" className="w-28 h-28 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#D4AF37] mb-2">⚙️ Admin</h2>
              {!isAdmin ? (<p className="text-gray-400">Connecte-toi</p>) : (<p className="text-green-400">👑 Connecté</p>)}
            </div>
            {!isAdmin ? (
              <div className="card-relief rounded-xl p-6">
                <input type="password" placeholder="Mot de passe" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 mb-4 text-white" />
                <button onClick={handleAdminLogin} className="btn-gold w-full py-3 rounded-lg">Se connecter</button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="card-relief rounded-xl p-6">
                  <h3 className="text-lg font-bold text-[#D4AF37] mb-4">➕ Match</h3>
                  <input type="text" placeholder="Adversaire" value={nouveauMatch.adversaire} onChange={(e) => setNouveauMatch({...nouveauMatch, adversaire: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 mb-3 text-white" />
                  <input type="date" value={nouveauMatch.date} onChange={(e) => setNouveauMatch({...nouveauMatch, date: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 mb-3 text-white" />
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input type="time" placeholder="H1" value={nouveauMatch.horaire1} onChange={(e) => setNouveauMatch({...nouveauMatch, horaire1: e.target.value})} className="bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 text-white" />
                    <input type="time" placeholder="H2" value={nouveauMatch.horaire2} onChange={(e) => setNouveauMatch({...nouveauMatch, horaire2: e.target.value})} className="bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 text-white" />
                  </div>
                  <button onClick={ajouterMatch} className="btn-gold w-full py-3 rounded-lg">Ajouter</button>
                </div>
                <div className="card-relief rounded-xl p-6">
                  <h3 className="text-lg font-bold text-[#D4AF37] mb-4">✏️ Scores</h3>
                  {prochainsMatchs.map(match => (
                    <div key={match.id} className="bg-[#0a0a0a] rounded-lg p-3 mb-3">
                      <p className="font-bold text-[#D4AF37] mb-2">{match.adversaire}</p>
                      <button onClick={() => setScoreEdit({id: match.id, scoreDyno: '', scoreAdv: ''})} className="btn-gold w-full py-2 rounded text-sm">📝 Score</button>
                    </div>
                  ))}
                </div>
                <button onClick={handleAdminLogout} className="w-full border border-red-500 text-red-500 py-3 rounded-lg">🚪 Déconnexion</button>
              </div>
            )}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-[#D4AF37]/30">
        <div className="max-w-lg mx-auto flex">
          <button onClick={() => setActiveTab('matchs')} className={`flex-1 py-4 text-center ${activeTab === 'matchs' ? 'text-[#D4AF37]' : 'text-gray-500'}`}>📅</button>
          <button onClick={() => setActiveTab('historique')} className={`flex-1 py-4 text-center ${activeTab === 'historique' ? 'text-[#D4AF37]' : 'text-gray-500'}`}>📜</button>
          <button onClick={() => setActiveTab('notes')} className={`flex-1 py-4 text-center ${activeTab === 'notes' ? 'text-[#D4AF37]' : 'text-gray-500'}`}>📊</button>
          <button onClick={() => setActiveTab('strats')} className={`flex-1 py-4 text-center ${activeTab === 'strats' ? 'text-[#D4AF37]' : 'text-gray-500'}`}>🗺️</button>
          <button onClick={() => setActiveTab('rec')} className={`flex-1 py-4 text-center ${activeTab === 'rec' ? 'text-[#D4AF37]' : 'text-gray-500'}`}>🎬</button>
          <button onClick={() => setActiveTab('roster')} className={`flex-1 py-4 text-center ${activeTab === 'roster' ? 'text-[#D4AF37]' : 'text-gray-500'}`}>👥</button>
          <button onClick={() => setActiveTab('stats')} className={`flex-1 py-4 text-center ${activeTab === 'stats' ? 'text-[#D4AF37]' : 'text-gray-500'}`}>📈</button>
          <button onClick={() => setActiveTab('admin')} className={`flex-1 py-4 text-center ${activeTab === 'admin' ? 'text-[#D4AF37]' : 'text-gray-500'}`}>⚙️</button>
        </div>
      </nav>

      {!user && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="card-relief rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-[#D4AF37] mb-4 text-center">{isSignUp ? '📝 Créer' : '👤 Connexion'}</h3>
            {isSignUp && (<input type="text" placeholder="Pseudo" value={pseudo} onChange={(e) => setPseudo(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 mb-3 text-white" />)}
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 mb-3 text-white" />
            <input type="password" placeholder="Mot de passe" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 mb-4 text-white" />
            {isSignUp ? (
              <button onClick={handleSignUp} className="btn-gold w-full py-3 rounded-lg font-bold mb-3">✅ Créer</button>
            ) : (
              <button onClick={handleSignIn} className="btn-gold w-full py-3 rounded-lg font-bold mb-3">🔐 Connexion</button>
            )}
            <div className="border-t border-gray-700 pt-3">
              {isSignUp ? (<button onClick={() => setIsSignUp(false)} className="w-full text-[#D4AF37] text-sm">Déjà un compte ?</button>) : (
                <button onClick={() => setIsSignUp(true)} className="w-full text-[#D4AF37] text-sm">Pas de compte ?</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
