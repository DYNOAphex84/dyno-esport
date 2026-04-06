import { useState, useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, getDoc, setDoc } from 'firebase/firestore'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth'

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

// ✅ Persistance activée
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Erreur persistance:', error)
})

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1489600048474886295/HfR7YhCRuDpjN6NCw133bShUF9Gj1gak-fWtTYVYgI2G_gllQ001kRfH0w57mUuCTytp'
const YOUTUBE_CHANNEL = 'https://youtube.com/@jonathanla890?si=eHtXG1hjlmCuZ-RC'
const LOGO_URL = 'https://i.imgur.com/gTLj57a.png'
const ADMIN_EMAIL = 'thibaut.llorens@hotmail.com'

const EVA_MAPS = [
  { id: 'artefact', name: 'Artefact', color: 'bg-amber-900', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'atlantis', name: 'Atlantis', color: 'bg-blue-900', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'ceres', name: 'Ceres', color: 'bg-gray-800', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'engine', name: 'Engine', color: 'bg-orange-900', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'helios', name: 'Helios', color: 'bg-yellow-900', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'horizon', name: 'Horizon', color: 'bg-emerald-900', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'lunar', name: 'Lunar', color: 'bg-indigo-900', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'outlaw', name: 'Outlaw', color: 'bg-amber-800', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'polaris', name: 'Polaris', color: 'bg-cyan-900', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'silva', name: 'Silva', color: 'bg-green-900', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'cliff', name: 'Cliff', color: 'bg-orange-800', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' }
]

function App() {
  const [activeTab, setActiveTab] = useState('matchs')
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [showSplash, setShowSplash] = useState(true)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [pseudo, setPseudo] = useState('')
  const [email, setEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [matchs, setMatchs] = useState([])
  const [replays, setReplays] = useState([])
  const [joueurs, setJoueurs] = useState([])
  const [notes, setNotes] = useState([])
  const [mapMatches, setMapMatches] = useState([])
  const [selectedMap, setSelectedMap] = useState(null)
  const [showMapDetails, setShowMapDetails] = useState(false)
  const [nouveauMatch, setNouveauMatch] = useState({ adversaire: '', date: '', horaire1: '', horaire2: '', arene: 'Arène 1', type: 'Ligue' })
  const [scoreEdit, setScoreEdit] = useState(null)
  const [nouveauReplay, setNouveauReplay] = useState({ titre: '', lien: '' })
  const [nouvelleNote, setNouvelleNote] = useState({ matchId: '', mental: '', communication: '', gameplay: '' })
  const [selectedMatchForNotes, setSelectedMatchForNotes] = useState(null)
  const [nouveauMapMatch, setNouveauMapMatch] = useState({ adversaire: '', picksText: '', bansText: '', notes: '' })
  const [showAddMapMatch, setShowAddMapMatch] = useState(false)

  // ✅ Vérifier admin au chargement
  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setPseudo(userData.pseudo || '')
            if (user.email === ADMIN_EMAIL || userData.isAdmin === true) {
              setIsAdmin(true)
              localStorage.setItem('dyno-admin', 'true')
            }
          }
        } catch (error) {
          console.error('Erreur lecture user:', error)
        }
      }
      setLoading(false)
    }
    checkAdmin()
  }, [user])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (!user) {
        setPseudo('')
        setIsAdmin(false)
        localStorage.removeItem('dyno-admin')
        localStorage.removeItem('user-email')
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'matchs'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMatchs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'replays'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReplays(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'players'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setJoueurs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'mapMatches'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMapMatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleSignUp = async () => {
    if (!email || !authPassword || !pseudo) { alert('⚠️ Remplis tout !'); return }
    try {
      const result = await createUserWithEmailAndPassword(auth, email, authPassword)
      await setDoc(doc(db, 'users', result.user.uid), { 
        pseudo, 
        email, 
        createdAt: Date.now(), 
        isAdmin: email === ADMIN_EMAIL 
      })
      await addDoc(collection(db, 'players'), { 
        pseudo, 
        role: 'Joueur', 
        rang: 'Nouveau', 
        userId: result.user.uid, 
        createdAt: Date.now() 
      })
      alert('✅ Compte créé !')
      setIsSignUp(false)
      setEmail('')
      setAuthPassword('')
    } catch (error) { alert('❌ ' + error.message) }
  }

  const handleSignIn = async () => {
    if (!email || !authPassword) { alert('⚠️ Remplis tout !'); return }
    try {
      await setPersistence(auth, browserLocalPersistence)
      await signInWithEmailAndPassword(auth, email, authPassword)
      localStorage.setItem('user-email', email)
      alert('✅ Connecté !')
      setEmail('')
      setAuthPassword('')
    } catch (error) { alert('❌ ' + error.message) }
  }

  const handleSignOut = async () => {
    await signOut(auth)
    setPseudo('')
    setIsAdmin(false)
    localStorage.removeItem('dyno-admin')
    localStorage.removeItem('user-email')
    alert('✅ Déconnecté !')
  }

  const handleAdminLogin = () => {
    if (adminPassword === 'dyno2026') {
      setIsAdmin(true)
      localStorage.setItem('dyno-admin', 'true')
      setAdminPassword('')
    } else { alert('❌ Mot de passe incorrect !') }
  }

  const handleAdminLogout = () => {
    setIsAdmin(false)
    localStorage.removeItem('dyno-admin')
  }

  const ajouterMatch = async () => {
    if (!nouveauMatch.adversaire || !nouveauMatch.date || !nouveauMatch.horaire1) { alert('⚠️ Remplis tout !'); return }
    await addDoc(collection(db, 'matchs'), { ...nouveauMatch, termine: false, disponibles: [], createdAt: Date.now() })
    const horaires = [nouveauMatch.horaire1]
    if (nouveauMatch.horaire2) horaires.push(nouveauMatch.horaire2)
    const discordMessage = {
      embeds: [{
        title: '🎮 NOUVEAU MATCH DYNO !',
        color: 13934871,
        fields: [
          { name: '⚔️ Adversaire', value: nouveauMatch.adversaire, inline: true },
          { name: '📅 Date', value: nouveauMatch.date, inline: true },
          { name: '⏰ Horaire', value: horaires.join(' / '), inline: true },
          { name: '🏟️ Arène', value: nouveauMatch.arene, inline: true },
          { name: '📊 Type', value: nouveauMatch.type, inline: true }
        ],
        footer: { text: 'DYNO Esport', icon_url: LOGO_URL }
      }]
    }
    try {
      await fetch(DISCORD_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(discordMessage) })
    } catch (error) { console.error('Discord error:', error) }
    setNouveauMatch({ adversaire: '', date: '', horaire1: '', horaire2: '', arene: 'Arène 1', type: 'Ligue' })
    alert('✅ Match ajouté + Discord notifié !')
  }

  const ajouterReplay = async () => {
    if (!nouveauReplay.titre || !nouveauReplay.lien) { alert('⚠️ Remplis tout !'); return }
    await addDoc(collection(db, 'replays'), { ...nouveauReplay, createdAt: Date.now() })
    setNouveauReplay({ titre: '', lien: '' })
    alert('✅ Replay ajouté !')
  }

  const ajouterNote = async () => {
    if (!user) { alert('⚠️ Connecte-toi !'); return }
    const note = { matchId: selectedMatchForNotes?.id, joueur: pseudo, joueurId: user.uid, ...nouvelleNote, createdAt: Date.now() }
    await addDoc(collection(db, 'notes'), note)
    setNouvelleNote({ matchId: '', mental: '', communication: '', gameplay: '' })
    setSelectedMatchForNotes(null)
    alert('✅ Note ajoutée !')
  }

  const supprimerMatch = async (id) => { await deleteDoc(doc(db, 'matchs', id)); alert('✅ Match supprimé !') }
  const supprimerReplay = async (id) => { await deleteDoc(doc(db, 'replays', id)); alert('✅ Replay supprimé !') }
  const supprimerJoueur = async (id) => { await deleteDoc(doc(db, 'players', id)); alert('✅ Joueur supprimé !') }
  const supprimerMapMatch = async (id) => { await deleteDoc(doc(db, 'mapMatches', id)); alert('✅ Stratégie supprimée !') }
  const supprimerNote = async (id) => { await deleteDoc(doc(db, 'notes', id)); alert('✅ Note supprimée !') }

  const updateScore = async () => {
    if (!scoreEdit) return
    await updateDoc(doc(db, 'matchs', scoreEdit.id), { scoreDyno: parseInt(scoreEdit.scoreDyno), scoreAdversaire: parseInt(scoreEdit.scoreAdv), termine: true })
    setScoreEdit(null)
    alert('✅ Score mis à jour !')
  }

  const toggleDisponibilite = async (matchId) => {
    if (!user) return
    const match = matchs.find(m => m.id === matchId)
    if (!match) return
    const estDispo = match.disponibles.includes(pseudo)
    const nouveauxDisponibles = estDispo ? match.disponibles.filter((p) => p !== pseudo) : [...match.disponibles, pseudo]
    await updateDoc(doc(db, 'matchs', matchId), { disponibles: nouveauxDisponibles })
  }

  const toggleLike = async (matchId) => {
    if (!user) { alert('⚠️ Connecte-toi !'); return }
    const match = mapMatches.find(m => m.id === matchId)
    if (!match) return
    const hasLiked = match.likes?.includes(user.uid)
    const hasDisliked = match.dislikes?.includes(user.uid)
    
    let newLikes = match.likes || []
    let newDislikes = match.dislikes || []
    
    if (hasLiked) {
      newLikes = newLikes.filter((id) => id !== user.uid)
    } else {
      newLikes = [...newLikes, user.uid]
      if (hasDisliked) {
        newDislikes = newDislikes.filter((id) => id !== user.uid)
      }
    }
    
    await updateDoc(doc(db, 'mapMatches', matchId), { likes: newLikes, dislikes: newDislikes })
  }

  const toggleDislike = async (matchId) => {
    if (!user) { alert('⚠️ Connecte-toi !'); return }
    const match = mapMatches.find(m => m.id === matchId)
    if (!match) return
    const hasLiked = match.likes?.includes(user.uid)
    const hasDisliked = match.dislikes?.includes(user.uid)
    
    let newLikes = match.likes || []
    let newDislikes = match.dislikes || []
    
    if (hasDisliked) {
      newDislikes = newDislikes.filter((id) => id !== user.uid)
    } else {
      newDislikes = [...newDislikes, user.uid]
      if (hasLiked) {
        newLikes = newLikes.filter((id) => id !== user.uid)
      }
    }
    
    await updateDoc(doc(db, 'mapMatches', matchId), { likes: newLikes, dislikes: newDislikes })
  }

  const ajouterMapMatch = async () => {
    if (!selectedMap || !nouveauMapMatch.adversaire) { alert('⚠️ Remplis tout !'); return }
    await addDoc(collection(db, 'mapMatches'), {
      mapId: selectedMap.id,
      mapName: selectedMap.name,
      adversaire: nouveauMapMatch.adversaire,
      picks: nouveauMapMatch.picksText ? nouveauMapMatch.picksText.split(',').map((s) => s.trim()).filter((s) => s) : [],
      bans: nouveauMapMatch.bansText ? nouveauMapMatch.bansText.split(',').map((s) => s.trim()).filter((s) => s) : [],
      notes: nouveauMapMatch.notes,
      auteur: pseudo,
      auteurId: user?.uid,
      likes: [],
      dislikes: [],
      createdAt: Date.now()
    })
    setNouveauMapMatch({ adversaire: '', picksText: '', bansText: '', notes: '' })
    setShowAddMapMatch(false)
    alert('✅ Stratégie ajoutée !')
  }

  // 📅 Formater la date en FR (JJ/MM/AAAA)
const formatDateFR = (dateString) => {
  if (!dateString) return ''
  const [year, month, day] = dateString.split('-')
  return `${day}/${month}/${year}`
}

// 📅 Générer fichier ICS pour calendrier - CORRIGÉ
const addToCalendar = (match) => {
  try {
    if (!match || !match.date) {
      alert('⚠️ Match non trouvé')
      return
    }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    
    // Formater la date (DD/MM/YYYY → YYYYMMDD)
    let year, month, day
    if (match.date.includes('/')) {
      const [d, m, y] = match.date.split('/')
      day = d
      month = m
      year = y
    } else {
      const [y, m, d] = match.date.split('-')
      year = y
      month = m
      day = d
    }
    
    const matchDate = `${year}${month}${day}`
    
    // Récupérer l'horaire
    let hours = '20'
    let minutes = '00'
    if (match.horaires && match.horaires.length > 0) {
      const [h, m] = match.horaires[0].split(':')
      hours = h
      minutes = m || '00'
    } else if (match.horaire1) {
      const [h, m] = match.horaire1.split(':')
      hours = h
      minutes = m || '00'
    }
    
    const startTime = `${hours}${minutes}00`
    const endTimeHour = parseInt(hours) + 2
    const endTime = `${endTimeHour.toString().padStart(2, '0')}${minutes}00`
    
    if (isIOS) {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//DYNO Esport//FR
BEGIN:VEVENT
UID:${match.id}@dyno-esport
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${matchDate}T${startTime}
DTEND:${matchDate}T${endTime}
SUMMARY:🎮 DYNO vs ${match.adversaire}
DESCRIPTION:Match DYNO Esport vs ${match.adversaire}\\nArène: ${match.arene}\\nType: ${match.type}
LOCATION:${match.arene}
END:VEVENT
END:VCALENDAR`
      
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `DYNO_vs_${match.adversaire}.ics`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      alert('✅ Fichier calendrier téléchargé !')
    } else {
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`🎮 DYNO vs ${match.adversaire}`)}&dates=${matchDate}T${startTime}/${matchDate}T${endTime}&details=${encodeURIComponent(`Match DYNO Esport vs ${match.adversaire}\\nArène: ${match.arene}\\nType: ${match.type}`)}&location=${encodeURIComponent(match.arene)}`
      
      window.open(googleCalendarUrl, '_blank')
    }
  } catch (error) {
    console.error('Erreur calendrier:', error)
    alert('❌ Erreur: ' + error.message)
  }
}
        }
  const victoires = matchs.filter((m) => m.termine && (m.scoreDyno || 0) > (m.scoreAdversaire || 0)).length
  const defaites = matchs.filter((m) => m.termine && (m.scoreDyno || 0) < (m.scoreAdversaire || 0)).length
  const totalMatchs = victoires + defaites
  const winRate = totalMatchs > 0 ? Math.round((victoires / totalMatchs) * 100) : 0
  
  // 🔥 Tri des prochains matchs par date DESC (du plus récent au plus loin)
  const prochainsMatchs = matchs
    .filter((m) => !m.termine)
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.horaire1}`)
      const dateB = new Date(`${b.date}T${b.horaire1}`)
      return dateB.getTime() - dateA.getTime()
    })
  
  const historique = matchs.filter((m) => m.termine)

  const getYouTubeId = (url) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    return match ? match[1] : null
  }

  if (showSplash) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <img src={LOGO_URL} alt="DYNO" className="w-56 h-56 mx-auto animate-pulse drop-shadow-[0_0_30px_rgba(212,175,55,0.5)]" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] bg-clip-text text-transparent mt-6 animate-pulse">DYNO</h1>
          <p className="text-gray-400 mt-2">Esport Team</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] pb-24">
      {/* Header Moderne */}
      <header className="backdrop-blur-xl bg-black/40 border-b border-[#D4AF37]/20 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="DYNO" className="w-14 h-14 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">DYNO</h1>
              <p className="text-xs text-gray-400">Esport Team</p>
            </div>
          </div>
          {user ? (
            <button onClick={handleSignOut} className="px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-red-500/30 transition-all">👋 {pseudo}</button>
          ) : (
            <button onClick={() => setIsSignUp(false)} className="px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg hover:shadow-[#D4AF37]/50 transition-all">👤 Compte</button>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {activeTab === 'matchs' && (
          <div>
            <div className="relative rounded-3xl p-8 mb-6 text-center overflow-hidden bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 border border-[#D4AF37]/20 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent" />
              <img src={LOGO_URL} alt="DYNO" className="w-24 h-24 mx-auto mb-4 relative z-10 drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-2 relative z-10">Prochains Matchs</h2>
              <p className="text-gray-400 text-sm relative z-10">Restez prêts pour la victoire</p>
            </div>
            {loading ? (<div className="text-center py-10 text-[#D4AF37]">⏳...</div>) : prochainsMatchs.length === 0 ? (<div className="text-center py-10 text-gray-500">📭 Aucun match</div>) : (
              <div className="space-y-4">
                {prochainsMatchs.map((match) => (
                  <div key={match.id} className="backdrop-blur-xl bg-black/40 rounded-2xl p-5 border border-[#D4AF37]/20 shadow-xl hover:shadow-[#D4AF37]/20 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-lg ${
                        match.type === 'Ligue' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' : 
                        match.type === 'Scrim' ? 'bg-gradient-to-r from-green-600 to-green-700 text-white' : 
                        match.type === 'Tournoi' ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white' :
                        'bg-gradient-to-r from-orange-600 to-orange-700 text-white'
                      }`}>{match.type}</span>
                      <span className="text-[#D4AF37] font-bold">{formatDateFR(match.date)}</span>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <img src={LOGO_URL} alt="DYNO" className="w-14 h-14 drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                      <span className="text-gray-500 text-xl">VS</span>
                      <div className="flex-1 text-right">
                        <p className="font-bold text-lg text-white">{match.adversaire}</p>
                        <p className="text-sm text-[#D4AF37]">🏟️ {match.arene}</p>
                      </div>
                    </div>
                    <div className="backdrop-blur-xl bg-black/60 rounded-xl p-3 mb-3 border border-[#D4AF37]/20">
                      <p className="text-xs text-gray-400 mb-1">⏰ Horaires</p>
                      <p className="text-[#D4AF37] font-bold">{match.horaires?.join(' / ') || [match.horaire1, match.horaire2].filter(Boolean).join(' / ')}</p>
                    </div>
                    <div className="backdrop-blur-xl bg-black/60 rounded-xl p-3 mb-4 border border-[#D4AF37]/20">
                      <p className="text-xs text-gray-400 mb-2">👥 Disponibles ({match.disponibles.length})</p>
                      {match.disponibles.length > 0 && (<div className="flex flex-wrap gap-2">{match.disponibles.map((p, i) => (<span key={i} className="backdrop-blur-xl bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/10 text-[#D4AF37] px-3 py-1.5 rounded-xl text-xs font-bold border border-[#D4AF37]/30">{p}</span>))}</div>)}
                    </div>
                    
                    {/* 📅 Bouton Add to Calendar */}
                    <button 
                      onClick={() => addToCalendar(match)}
                      className="w-full mb-4 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2"
                    >
                      📅 Ajouter au calendrier
                    </button>
                    
                    <button onClick={() => toggleDisponibilite(match.id)} disabled={!user} className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg ${!user ? 'bg-gray-700 text-gray-400' : match.disponibles.includes(pseudo) ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-[#D4AF37]/50' : 'border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10'}`}>{!user ? '🔐 Connecte-toi' : match.disponibles.includes(pseudo) ? '✅ Je suis disponible' : '📅 Je me marque'}</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'historique' && (
          <div>
            <div className="relative rounded-3xl p-8 mb-6 text-center overflow-hidden bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 border border-[#D4AF37]/20 shadow-2xl">
              <img src={LOGO_URL} alt="DYNO" className="w-24 h-24 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-2">Historique</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="backdrop-blur-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/10 rounded-2xl p-5 border border-[#D4AF37]/30 shadow-xl">
                <p className="text-4xl font-bold text-[#D4AF37]">{victoires}</p>
                <p className="text-xs text-gray-400 mt-1">Victoires</p>
              </div>
              <div className="backdrop-blur-xl bg-gradient-to-br from-red-500/20 to-red-500/10 rounded-2xl p-5 border border-red-500/30 shadow-xl">
                <p className="text-4xl font-bold text-red-500">{defaites}</p>
                <p className="text-xs text-gray-400 mt-1">Défaites</p>
              </div>
            </div>
            {historique.length === 0 ? (<div className="text-center py-10 text-gray-500">📜 Aucun match</div>) : (
              <div className="space-y-4">
                {historique.map((match) => {
                  const matchNotes = notes.filter((n) => n.matchId === match.id)
                  return (
                    <div key={match.id} className="backdrop-blur-xl bg-black/40 rounded-2xl p-5 border border-[#D4AF37]/20 shadow-xl">
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-lg ${
                          (match.scoreDyno || 0) > (match.scoreAdversaire || 0) ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black' : 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                        }`}>{(match.scoreDyno || 0) > (match.scoreAdversaire || 0) ? '🏆 VICTOIRE' : '❌ DÉFAITE'}</span>
                        <span className="text-gray-400 text-sm">{formatDateFR(match.date)}</span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-center">
                          <p className="font-bold text-[#D4AF37]">DYNO</p>
                          <p className="text-4xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">{match.scoreDyno}</p>
                        </div>
                        <span className="text-gray-600 text-2xl">-</span>
                        <div className="text-center">
                          <p className="font-bold text-gray-400">{match.adversaire}</p>
                          <p className="text-4xl font-bold text-gray-400">{match.scoreAdversaire}</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => { setSelectedMatchForNotes(match); setNouvelleNote({ matchId: match.id, mental: '', communication: '', gameplay: '' }) }}
                        className="w-full mb-4 py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg hover:shadow-purple-500/50 transition-all"
                      >
                        📝 Ajouter des notes
                      </button>
                      
                      {matchNotes.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-400 mb-2">{matchNotes.length} note(s)</p>
                          {matchNotes.map((note) => (
                            <div key={note.id} className="backdrop-blur-xl bg-black/60 rounded-xl p-3 border border-[#D4AF37]/20">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-[#D4AF37] font-bold text-sm">{note.joueur}</p>
                                {isAdmin && (<button onClick={() => supprimerNote(note.id)} className="text-red-400 text-xs">🗑️</button>)}
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div className="bg-purple-500/20 rounded-lg p-2">
                                  <p className="text-gray-400">🧠</p>
                                  <p className="text-purple-400 font-bold">{note.mental}/10</p>
                                </div>
                                <div className="bg-blue-500/20 rounded-lg p-2">
                                  <p className="text-gray-400">💬</p>
                                  <p className="text-blue-400 font-bold">{note.communication}/10</p>
                                </div>
                                <div className="bg-green-500/20 rounded-lg p-2">
                                  <p className="text-gray-400">🎯</p>
                                  <p className="text-green-400 font-bold">{note.gameplay}/10</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm text-center">Aucune note pour ce match</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            
            {selectedMatchForNotes && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="backdrop-blur-xl bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-8 w-full max-w-sm border border-[#D4AF37]/30 shadow-2xl">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-6 text-center">📊 Notes - {selectedMatchForNotes.adversaire}</h3>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">🧠 Mental (0-10)</label>
                      <input 
                        type="number" 
                        min="0"
                        max="10"
                        placeholder="0"
                        value={nouvelleNote.mental} 
                        onChange={(e) => setNouvelleNote({...nouvelleNote, mental: e.target.value})} 
                        className="w-full backdrop-blur-xl bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-4 text-white text-center text-2xl font-bold focus:outline-none focus:border-[#D4AF37] transition-all" 
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">💬 Communication (0-10)</label>
                      <input 
                        type="number" 
                        min="0"
                        max="10"
                        placeholder="0"
                        value={nouvelleNote.communication} 
                        onChange={(e) => setNouvelleNote({...nouvelleNote, communication: e.target.value})} 
                        className="w-full backdrop-blur-xl bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-4 text-white text-center text-2xl font-bold focus:outline-none focus:border-[#D4AF37] transition-all" 
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">🎯 Performance (0-10)</label>
                      <input 
                        type="number" 
                        min="0"
                        max="10"
                        placeholder="0"
                        value={nouvelleNote.gameplay} 
                        onChange={(e) => setNouvelleNote({...nouvelleNote, gameplay: e.target.value})} 
                        className="w-full backdrop-blur-xl bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-4 text-white text-center text-2xl font-bold focus:outline-none focus:border-[#D4AF37] transition-all" 
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setSelectedMatchForNotes(null); setNouvelleNote({ matchId: '', mental: '', communication: '', gameplay: '' }) }} className="flex-1 py-4 rounded-xl font-bold border-2 border-gray-600 text-gray-400 hover:bg-gray-800 transition-all">Annuler</button>
                    <button onClick={ajouterNote} className="flex-1 py-4 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg hover:shadow-[#D4AF37]/50 transition-all">✅ Valider</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'maps' && (
          <div>
            <div className="relative rounded-3xl p-8 mb-6 text-center overflow-hidden bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 border border-[#D4AF37]/20 shadow-2xl">
              <img src={LOGO_URL} alt="DYNO" className="w-24 h-24 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-2">🗺️ Maps & Stratégies</h2>
              <p className="text-gray-400 text-sm">Picks, bans et stratégies par map</p>
            </div>
            
            {showMapDetails ? (
              <div>
                <button onClick={() => setShowMapDetails(false)} className="mb-4 px-4 py-2 rounded-xl font-bold bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg">← Retour aux maps</button>
                
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-[#D4AF37]">📋 {selectedMap?.name}</h3>
                  {user && (
                    <button onClick={() => setShowAddMapMatch(true)} className="px-4 py-2 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg">➕ Ajouter Strat</button>
                  )}
                </div>
                
                {mapMatches.filter((m) => m.mapId === selectedMap?.id).length === 0 ? (
                  <div className="text-center py-10 text-gray-500">📝 Aucune stratégie pour cette map</div>
                ) : (
                  <div className="space-y-4">
                    {mapMatches.filter((m) => m.mapId === selectedMap?.id).map((match) => {
                      const userLike = match.likes?.includes(user?.uid)
                      const userDislike = match.dislikes?.includes(user?.uid)
                      return (
                        <div key={match.id} className="backdrop-blur-xl bg-black/40 rounded-2xl p-5 border border-[#D4AF37]/20 shadow-xl">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-bold text-[#D4AF37] text-lg">VS {match.adversaire}</p>
                              <p className="text-xs text-gray-400">par {match.auteur || 'Inconnu'}</p>
                            </div>
                            {(isAdmin || user?.uid === match.auteurId) && <button onClick={() => supprimerMapMatch(match.id)} className="text-red-400 text-xl">🗑️</button>}
                          </div>
                          
                          {match.picks && match.picks.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs text-green-400 mb-1">✅ Picks</p>
                              <div className="flex flex-wrap gap-2">
                                {match.picks.map((pick, i) => (
                                  <span key={i} className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-sm border border-green-500/30">{pick}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {match.bans && match.bans.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs text-red-400 mb-1">❌ Bans</p>
                              <div className="flex flex-wrap gap-2">
                                {match.bans.map((ban, i) => (
                                  <span key={i} className="bg-red-500/20 text-red-400 px-3 py-1 rounded-lg text-sm border border-red-500/30">{ban}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {match.notes && (
                            <div className="mb-3">
                              <p className="text-xs text-gray-400 mb-1">📝 Notes</p>
                              <p className="text-sm text-white bg-[#0a0a0a] rounded-lg p-3 border border-[#D4AF37]/20">{match.notes}</p>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#D4AF37]/20">
                            <button 
                              onClick={() => toggleLike(match.id)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${userLike ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                            >
                              👍 {match.likes?.length || 0}
                            </button>
                            <button 
                              onClick={() => toggleDislike(match.id)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${userDislike ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                            >
                              👎 {match.dislikes?.length || 0}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {EVA_MAPS.map((map) => {
                  const mapStrats = mapMatches.filter((m) => m.mapId === map.id).length
                  return (
                    <div 
                      key={map.id} 
                      className="relative rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-all shadow-xl hover:shadow-2xl group"
                      onClick={() => { setSelectedMap(map); setShowMapDetails(true) }}
                    >
                      <div className={`w-full h-32 ${map.color}`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                      <div className="absolute bottom-3 left-3 text-white">
                        <p className="font-bold text-base drop-shadow-lg">{map.name}</p>
                        <p className="text-xs text-gray-400">{mapStrats} strat{mapStrats > 1 ? 's' : ''}</p>
                      </div>
                      <div className="absolute inset-0 bg-[#D4AF37]/0 group-hover:bg-[#D4AF37]/20 transition-all" />
                    </div>
                  )
                })}
              </div>
            )}
            
            {showAddMapMatch && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="backdrop-blur-xl bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-6 w-full max-w-md border border-[#D4AF37]/30 shadow-2xl max-h-[90vh] overflow-y-auto">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-6 text-center">📋 Stratégie - {selectedMap?.name}</h3>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">⚔️ Adversaire</label>
                      <input 
                        type="text" 
                        placeholder="Nom de l'équipe"
                        value={nouveauMapMatch.adversaire} 
                        onChange={(e) => setNouveauMapMatch({...nouveauMapMatch, adversaire: e.target.value})} 
                        className="w-full backdrop-blur-xl bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#D4AF37] transition-all" 
                      />
                    </div>
                    
                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">✅ Picks (séparés par des virgules)</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Jett, Sova, Omen..."
                        value={nouveauMapMatch.picksText || ''} 
                        onChange={(e) => setNouveauMapMatch({...nouveauMapMatch, picksText: e.target.value})} 
                        className="w-full backdrop-blur-xl bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#D4AF37] transition-all" 
                      />
                    </div>
                    
                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">❌ Bans (séparés par des virgules)</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Reyna, Phoenix..."
                        value={nouveauMapMatch.bansText || ''} 
                        onChange={(e) => setNouveauMapMatch({...nouveauMapMatch, bansText: e.target.value})} 
                        className="w-full backdrop-blur-xl bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#D4AF37] transition-all" 
                      />
                    </div>
                    
                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">📝 Notes stratégiques</label>
                      <textarea 
                        placeholder="Stratégie, callouts, etc..."
                        value={nouveauMapMatch.notes} 
                        onChange={(e) => setNouveauMapMatch({...nouveauMapMatch, notes: e.target.value})} 
                        className="w-full backdrop-blur-xl bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#D4AF37] transition-all h-20" 
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setShowAddMapMatch(false); setNouveauMapMatch({ adversaire: '', picksText: '', bansText: '', notes: '' }) }} className="flex-1 py-4 rounded-xl font-bold border-2 border-gray-600 text-gray-400 hover:bg-gray-800 transition-all">Annuler</button>
                    <button onClick={ajouterMapMatch} className="flex-1 py-4 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg hover:shadow-[#D4AF37]/50 transition-all">✅ Valider</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div>
            <div className="relative rounded-3xl p-8 mb-6 text-center overflow-hidden bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 border border-[#D4AF37]/20 shadow-2xl">
              <img src={LOGO_URL} alt="DYNO" className="w-24 h-24 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-2">📊 Notes</h2>
            </div>
            {historique.length === 0 ? (<div className="text-center py-10 text-gray-500">📊 Aucun match</div>) : (
              <div className="space-y-4">
                {historique.map((match) => {
                  const matchNotes = notes.filter((n) => n.matchId === match.id)
                  return (
                    <div key={match.id} className="backdrop-blur-xl bg-black/40 rounded-2xl p-5 border border-[#D4AF37]/20 shadow-xl">
                      <p className="font-bold text-[#D4AF37] mb-3 text-lg">{match.adversaire} - {formatDateFR(match.date)}</p>
                      {matchNotes.length > 0 ? (
                        <div className="space-y-3">
                          {matchNotes.map((note) => (
                            <div key={note.id} className="backdrop-blur-xl bg-black/60 rounded-xl p-4 border border-[#D4AF37]/20">
                              <p className="text-[#D4AF37] font-bold mb-3">{note.joueur}</p>
                              <div className="grid grid-cols-3 gap-3">
                                <div className="text-center backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-xl p-3 border border-purple-500/30">
                                  <p className="text-xs text-gray-400 mb-1">🧠 Mental</p>
                                  <p className="text-2xl font-bold text-purple-400">{note.mental}/10</p>
                                </div>
                                <div className="text-center backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl p-3 border border-blue-500/30">
                                  <p className="text-xs text-gray-400 mb-1">💬 Comm</p>
                                  <p className="text-2xl font-bold text-blue-400">{note.communication}/10</p>
                                </div>
                                <div className="text-center backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl p-3 border border-green-500/30">
                                  <p className="text-xs text-gray-400 mb-1">🎯 Perf</p>
                                  <p className="text-2xl font-bold text-green-400">{note.gameplay}/10</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (<p className="text-gray-500 text-sm">Aucune note</p>)}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'rec' && (
          <div>
            <div className="relative rounded-3xl p-8 mb-6 text-center overflow-hidden bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 border border-[#D4AF37]/20 shadow-2xl">
              <img src={LOGO_URL} alt="DYNO" className="w-24 h-24 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-2">🎬 Replays</h2>
              <a href={YOUTUBE_CHANNEL} target="_blank" className="inline-block px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-red-500/50 transition-all">🔴 S'abonner</a>
            </div>
            {replays.length === 0 ? (<div className="text-center py-10 text-gray-500">📹 Aucun replay</div>) : (
              <div className="space-y-4">
                {replays.map((replay) => (
                  <div key={replay.id} className="backdrop-blur-xl bg-black/40 rounded-2xl p-5 border border-[#D4AF37]/20 shadow-xl">
                    <h3 className="font-bold text-[#D4AF37] mb-3 text-lg">{replay.titre}</h3>
                    {getYouTubeId(replay.lien) ? (
                      <div className="relative w-full pb-[56.25%] rounded-xl overflow-hidden shadow-2xl">
                        <iframe src={`https://www.youtube.com/embed/${getYouTubeId(replay.lien)}`} className="absolute top-0 left-0 w-full h-full" frameBorder="0" allowFullScreen />
                      </div>
                    ) : (
                      <a href={replay.lien} target="_blank" className="block py-4 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-center shadow-lg">▶️ Voir</a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'roster' && (
          <div>
            <div className="relative rounded-3xl p-8 mb-6 text-center overflow-hidden bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 border border-[#D4AF37]/20 shadow-2xl">
              <img src={LOGO_URL} alt="DYNO" className="w-24 h-24 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-2">👥 Roster</h2>
            </div>
            <div className="space-y-4">
              {joueurs.filter((j) => j.actif !== false).map((joueur) => (
                <div key={joueur.id} className="backdrop-blur-xl bg-black/40 rounded-2xl p-5 border border-[#D4AF37]/20 shadow-xl flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37]/30 to-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-bold text-2xl border border-[#D4AF37]/30 shadow-lg">{joueur.pseudo[0]?.toUpperCase()}</div>
                  <div className="flex-1">
                    <p className="font-bold text-[#D4AF37] text-lg">{joueur.pseudo}</p>
                    <p className="text-sm text-gray-400">🎮 {joueur.role}</p>
                  </div>
                  {isAdmin && <button onClick={() => supprimerJoueur(joueur.id)} className="text-red-400 text-xl hover:scale-125 transition">🗑️</button>}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <div className="relative rounded-3xl p-8 mb-6 text-center overflow-hidden bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 border border-[#D4AF37]/20 shadow-2xl">
              <img src={LOGO_URL} alt="DYNO" className="w-24 h-24 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-2">📈 Stats</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="backdrop-blur-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/10 rounded-2xl p-6 border border-[#D4AF37]/30 shadow-xl text-center">
                <p className="text-5xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">{winRate}%</p>
                <p className="text-xs text-gray-400 mt-2">Win Rate</p>
              </div>
              <div className="backdrop-blur-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/10 rounded-2xl p-6 border border-[#D4AF37]/30 shadow-xl text-center">
                <p className="text-5xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">{totalMatchs}</p>
                <p className="text-xs text-gray-400 mt-2">Matchs</p>
              </div>
            </div>
            <div className="backdrop-blur-xl bg-black/40 rounded-2xl p-6 border border-[#D4AF37]/20 shadow-xl">
              <h3 className="text-lg font-bold text-[#D4AF37] mb-4">📊 Répartition</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">🏆 Victoires</span>
                    <span className="text-[#D4AF37] font-bold">{victoires}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-3 shadow-inner">
                    <div className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] h-3 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]" style={{ width: `${totalMatchs > 0 ? (victoires/totalMatchs)*100 : 0}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">❌ Défaites</span>
                    <span className="text-red-500 font-bold">{defaites}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-3 shadow-inner">
                    <div className="bg-gradient-to-r from-red-600 to-red-700 h-3 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ width: `${totalMatchs > 0 ? (defaites/totalMatchs)*100 : 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div>
            <div className="relative rounded-3xl p-8 mb-6 text-center overflow-hidden bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 border border-[#D4AF37]/20 shadow-2xl">
              <img src={LOGO_URL} alt="DYNO" className="w-28 h-28 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-2">⚙️ Admin</h2>
              {!isAdmin ? (<p className="text-gray-400">Connecte-toi</p>) : (<p className="text-green-400 font-bold">👑 Connecté</p>)}
            </div>
            {!isAdmin ? (
              <div className="backdrop-blur-xl bg-black/40 rounded-2xl p-6 border border-[#D4AF37]/20 shadow-xl">
                <input type="password" placeholder="Mot de passe" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full backdrop-blur-xl bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-4 mb-4 text-white focus:outline-none focus:border-[#D4AF37] transition-all" />
                <button onClick={handleAdminLogin} className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg hover:shadow-[#D4AF37]/50 transition-all">Se connecter</button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="backdrop-blur-xl bg-black/40 rounded-2xl p-6 border border-[#D4AF37]/20 shadow-xl">
                  <h3 className="text-lg font-bold text-[#D4AF37] mb-4 flex items-center gap-2">➕ Match</h3>
                  <input type="text" placeholder="Adversaire" value={nouveauMatch.adversaire} onChange={(e) => setNouveauMatch({...nouveauMatch, adversaire: e.target.value})} className="w-full backdrop-blur-xl bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-4 mb-3 text-white focus:outline-none focus:border-[#D4AF37] transition-all" />
                  <input type="date" value={nouveauMatch.date} onChange={(e) => setNouveauMatch({...nouveauMatch, date: e.target.value})} className="w-full backdrop-blur-xl bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-4 mb-3 text-white focus:outline-none focus:border-[#D4AF37] transition-all" />
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input type="time" placeholder="H1" value={nouveauMatch.horaire1} onChange={(e) => setNouveauMatch({...nouveauMatch, horaire1: e.target.value})} className="backdrop-blur-xl bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#D4AF37] transition-all" />
                    <input type="time" placeholder="H2" value={nouveauMatch.horaire2} onChange={(e) => setNouveauMatch({...nouveauMatch, horaire2: e.target.value})} className="backdrop-blur-xl bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#D4AF37] transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <select value={nouveauMatch.arene} onChange={(e) => setNouveauMatch({...nouveauMatch, arene: e.target.value})} className="backdrop-blur-xl bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#D4AF37] transition-all">
                      <option value="Arène 1">Arène 1</option>
                      <option value="Arène 2">Arène 2</option>
                    </select>
                    <select value={nouveauMatch.type} onChange={(e) => setNouveauMatch({...nouveauMatch, type: e.target.value})} className="backdrop-blur-xl bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#D4AF37] transition-all">
                      <option value="Ligue">Ligue</option>
                      <option value="Scrim">Scrim</option>
                      <option value="Tournoi">Tournoi</option>
                      <option value="Division">Division</option>
                    </select>
                  </div>
                  <button onClick={ajouterMatch} className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg hover:shadow-[#D4AF37]/50 transition-all">Ajouter + Discord</button>
                </div>
                <div className="backdrop-blur-xl bg-black/40 rounded-2xl p-6 border border-[#D4AF37]/20 shadow-xl">
                  <h3 className="text-lg font-bold text-[#D4AF37] mb-4 flex items-center gap-2">🗑️ Supprimer Matchs</h3>
                  {matchs.length === 0 ? (
                    <p className="text-gray-500 text-center">Aucun match à supprimer</p>
                  ) : (
                    <div className="space-y-2">
                      {matchs.map((match) => (
                        <div key={match.id} className="flex items-center justify-between bg-black/60 rounded-xl p-3 border border-[#D4AF37]/20">
                          <div>
                            <p className="text-[#D4AF37] font-bold text-sm">{match.adversaire}</p>
                            <p className="text-gray-500 text-xs">{formatDateFR(match.date)}</p>
                          </div>
                          <button onClick={() => supprimerMatch(match.id)} className="text-red-400 text-xl hover:scale-110 transition">🗑️</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="backdrop-blur-xl bg-black/40 rounded-2xl p-6 border border-[#D4AF37]/20 shadow-xl">
                  <h3 className="text-lg font-bold text-[#D4AF37] mb-4 flex items-center gap-2">🎬 Replay</h3>
                  <input type="text" placeholder="Titre" value={nouveauReplay.titre} onChange={(e) => setNouveauReplay({...nouveauReplay, titre: e.target.value})} className="w-full backdrop-blur-xl bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-4 mb-3 text-white focus:outline-none focus:border-[#D4AF37] transition-all" />
                  <input type="text" placeholder="Lien YouTube" value={nouveauReplay.lien} onChange={(e) => setNouveauReplay({...nouveauReplay, lien: e.target.value})} className="w-full backdrop-blur-xl bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-4 mb-3 text-white focus:outline-none focus:border-[#D4AF37] transition-all" />
                  <button onClick={ajouterReplay} className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg hover:shadow-[#D4AF37]/50 transition-all">Ajouter</button>
                </div>
                <div className="backdrop-blur-xl bg-black/40 rounded-2xl p-6 border border-[#D4AF37]/20 shadow-xl">
                  <h3 className="text-lg font-bold text-[#D4AF37] mb-4 flex items-center gap-2">✏️ Scores</h3>
                  {prochainsMatchs.map((match) => (
                    <div key={match.id} className="backdrop-blur-xl bg-black/60 rounded-xl p-4 mb-3 border border-[#D4AF37]/20">
                      <p className="font-bold text-[#D4AF37] mb-3">{match.adversaire}</p>
                      <button onClick={() => setScoreEdit({id: match.id, scoreDyno: '', scoreAdv: ''})} className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg">📝 Score</button>
                    </div>
                  ))}
                </div>
                <button onClick={handleAdminLogout} className="w-full border-2 border-red-500 text-red-500 py-4 rounded-xl font-bold hover:bg-red-500/10 transition-all">🚪 Déconnexion</button>
              </div>
            )}

            {scoreEdit && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="backdrop-blur-xl bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-8 w-full max-w-sm border border-[#D4AF37]/30 shadow-2xl">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-6 text-center">📝 Score</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">DYNO</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={scoreEdit.scoreDyno} 
                        onChange={(e) => setScoreEdit({...scoreEdit, scoreDyno: e.target.value})} 
                        className="w-full backdrop-blur-xl bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-4 text-white text-center text-2xl font-bold focus:outline-none focus:border-[#D4AF37] transition-all" 
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">Adv</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={scoreEdit.scoreAdv} 
                        onChange={(e) => setScoreEdit({...scoreEdit, scoreAdv: e.target.value})} 
                        className="w-full backdrop-blur-xl bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-4 text-white text-center text-2xl font-bold focus:outline-none focus:border-[#D4AF37] transition-all" 
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setScoreEdit(null)} className="flex-1 py-4 rounded-xl font-bold border-2 border-gray-600 text-gray-400 hover:bg-gray-800 transition-all">Annuler</button>
                    <button onClick={updateScore} className="flex-1 py-4 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg hover:shadow-[#D4AF37]/50 transition-all">✅ Valider</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Navigation Moderne */}
      <nav className="fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-black/60 border-t border-[#D4AF37]/20 shadow-2xl">
        <div className="max-w-lg mx-auto flex">
          <button onClick={() => setActiveTab('matchs')} className={`flex-1 py-5 text-center transition-all ${activeTab === 'matchs' ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-gray-500 hover:text-[#D4AF37]'}`}>
            <span className="text-2xl">📅</span>
          </button>
          <button onClick={() => setActiveTab('historique')} className={`flex-1 py-5 text-center transition-all ${activeTab === 'historique' ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-gray-500 hover:text-[#D4AF37]'}`}>
            <span className="text-2xl">📜</span>
          </button>
          <button onClick={() => setActiveTab('maps')} className={`flex-1 py-5 text-center transition-all ${activeTab === 'maps' ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-gray-500 hover:text-[#D4AF37]'}`}>
            <span className="text-2xl">🗺️</span>
          </button>
          <button onClick={() => setActiveTab('notes')} className={`flex-1 py-5 text-center transition-all ${activeTab === 'notes' ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-gray-500 hover:text-[#D4AF37]'}`}>
            <span className="text-2xl">📊</span>
          </button>
          <button onClick={() => setActiveTab('rec')} className={`flex-1 py-5 text-center transition-all ${activeTab === 'rec' ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-gray-500 hover:text-[#D4AF37]'}`}>
            <span className="text-2xl">🎬</span>
          </button>
          <button onClick={() => setActiveTab('roster')} className={`flex-1 py-5 text-center transition-all ${activeTab === 'roster' ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-gray-500 hover:text-[#D4AF37]'}`}>
            <span className="text-2xl">👥</span>
          </button>
          <button onClick={() => setActiveTab('stats')} className={`flex-1 py-5 text-center transition-all ${activeTab === 'stats' ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-gray-500 hover:text-[#D4AF37]'}`}>
            <span className="text-2xl">📈</span>
          </button>
          <button onClick={() => setActiveTab('admin')} className={`flex-1 py-5 text-center transition-all ${activeTab === 'admin' ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-gray-500 hover:text-[#D4AF37]'}`}>
            <span className="text-2xl">⚙️</span>
          </button>
        </div>
      </nav>

      {!user && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-8 w-full max-w-sm border border-[#D4AF37]/30 shadow-2xl">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-6 text-center">{isSignUp ? '📝 Créer' : '👤 Connexion'}</h3>
            {isSignUp && (<input type="text" placeholder="Pseudo" value={pseudo} onChange={(e) => setPseudo(e.target.value)} className="w-full backdrop-blur-xl bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-4 mb-4 text-white focus:outline-none focus:border-[#D4AF37] transition-all" />)}
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full backdrop-blur-xl bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-4 mb-4 text-white focus:outline-none focus:border-[#D4AF37] transition-all" />
            <input type="password" placeholder="Mot de passe" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full backdrop-blur-xl bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-4 mb-6 text-white focus:outline-none focus:border-[#D4AF37] transition-all" />
            {isSignUp ? (<button onClick={handleSignUp} className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg hover:shadow-[#D4AF37]/50 transition-all mb-4">✅ Créer</button>) : (<button onClick={handleSignIn} className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg hover:shadow-[#D4AF37]/50 transition-all mb-4">🔐 Connexion</button>)}
            <div className="border-t border-gray-700 pt-4">
              {isSignUp ? (<button onClick={() => setIsSignUp(false)} className="w-full text-[#D4AF37] text-sm hover:underline">Déjà un compte ?</button>) : (<button onClick={() => setIsSignUp(true)} className="w-full text-[#D4AF37] text-sm hover:underline">Pas de compte ?</button>)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
