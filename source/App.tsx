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

setPersistence(auth, browserLocalPersistence).catch((error: any) => {
  console.error('Erreur persistance:', error)
})

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1489600048474886295/HfR7YhCRuDpjN6NCw133bShUF9Gj1gak-fWtTYVYgI2G_gllQ001kRfH0w57mUuCTytp'
const YOUTUBE_CHANNEL = 'https://youtube.com/@jonathanla890?si=eHtXG1hjlmCuZ-RC'
const LOGO_URL = 'https://i.imgur.com/gTLj57a.png'
const ADMIN_EMAIL = 'thibaut.llorens@hotmail.com'

const ALL_MAPS = ['Engine', 'Helios', 'Silva', 'The Cliff', 'Artefact', 'Outlaw', 'Atlantis', 'Horizon', 'Polaris', 'Lunar', 'Ceres']

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
  const [matchs, setMatchs] = useState<any[]>([])
  const [replays, setReplays] = useState<any[]>([])
  const [joueurs, setJoueurs] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [strats, setStrats] = useState<any[]>([])
  const [nouveauMatch, setNouveauMatch] = useState({ adversaire: '', date: '', horaire1: '', horaire2: '', arene: 'Arène 1', type: 'Ligue' })
  const [scoreEdit, setScoreEdit] = useState<any>(null)
  const [nouveauReplay, setNouveauReplay] = useState({ titre: '', lien: '' })
  const [nouvelleNote, setNouvelleNote] = useState({ matchId: '', mental: '', communication: '', gameplay: '' })
  const [selectedMatchForNotes, setSelectedMatchForNotes] = useState<any>(null)
  const [nouvelleStrat, setNouvelleStrat] = useState({ adversaire: '', picks: [], bans: [] })
  const [showAddStrat, setShowAddStrat] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    const savedAdmin = localStorage.getItem('dyno-admin')
    if (savedAdmin === 'true') setIsAdmin(true)
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: any) => {
      setUser(user)
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          setPseudo(data.pseudo || '')
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
    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const matchsData: any[] = []
      snapshot.forEach((doc: any) => matchsData.push({ id: doc.id, ...doc.data() }))
      setMatchs(matchsData)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'replays'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const replaysData: any[] = []
      snapshot.forEach((doc: any) => replaysData.push({ id: doc.id, ...doc.data() }))
      setReplays(replaysData)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'players'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const joueursData: any[] = []
      snapshot.forEach((doc: any) => joueursData.push({ id: doc.id, ...doc.data() }))
      setJoueurs(joueursData)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const notesData: any[] = []
      snapshot.forEach((doc: any) => notesData.push({ id: doc.id, ...doc.data() }))
      setNotes(notesData)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'strats'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const stratsData: any[] = []
      snapshot.forEach((doc: any) => stratsData.push({ id: doc.id, ...doc.data() }))
      setStrats(stratsData)
    })
    return () => unsubscribe()
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

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      setDeferredPrompt(null)
      setShowInstall(false)
    }
  }

  const handleSignUp = async () => {
    if (!email || !authPassword || !pseudo) { alert('⚠️ Remplis tout !'); return }
    try {
      const result = await createUserWithEmailAndPassword(auth, email, authPassword)
      await setDoc(doc(db, 'users', result.user.uid), { pseudo, email, createdAt: Date.now(), isAdmin: email === ADMIN_EMAIL })
      await addDoc(collection(db, 'players'), { pseudo, role: 'Joueur', rang: 'Nouveau', userId: result.user.uid, createdAt: Date.now() })
      alert('✅ Compte créé !')
      setIsSignUp(false)
      setEmail('')
      setAuthPassword('')
    } catch (error: any) { alert('❌ ' + error.message) }
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
    } catch (error: any) { alert('❌ ' + error.message) }
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
    await addDoc(collection(db, 'matchs'), { ...nouveauMatch, termine: false, disponibles: [], indisponibles: [], createdAt: Date.now() })
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

  const ajouterStrat = async () => {
    if (!nouvelleStrat.adversaire || nouvelleStrat.picks.length === 0 || nouvelleStrat.bans.length === 0) {
      alert('⚠️ Remplis l\'adversaire, picks et bans !')
      return
    }
    await addDoc(collection(db, 'strats'), {
      adversaire: nouvelleStrat.adversaire,
      picks: nouvelleStrat.picks,
      bans: nouvelleStrat.bans,
      auteur: pseudo,
      auteurId: user?.uid,
      createdAt: Date.now()
    })
    setNouvelleStrat({ adversaire: '', picks: [], bans: [] })
    setShowAddStrat(false)
    alert('✅ Stratégie ajoutée !')
  }

  const supprimerMatch = async (id: string) => { await deleteDoc(doc(db, 'matchs', id)); alert('✅ Match supprimé !') }
  const supprimerReplay = async (id: string) => { await deleteDoc(doc(db, 'replays', id)); alert('✅ Replay supprimé !') }
  const supprimerJoueur = async (id: string) => { await deleteDoc(doc(db, 'players', id)); alert('✅ Joueur supprimé !') }
  const supprimerStrat = async (id: string) => { await deleteDoc(doc(db, 'strats', id)); alert('✅ Stratégie supprimée !') }
  const supprimerNote = async (id: string) => { await deleteDoc(doc(db, 'notes', id)); alert('✅ Note supprimée !') }

  const updateScore = async () => {
    if (!scoreEdit) return
    await updateDoc(doc(db, 'matchs', scoreEdit.id), { scoreDyno: parseInt(scoreEdit.scoreDyno), scoreAdversaire: parseInt(scoreEdit.scoreAdv), termine: true })
    setScoreEdit(null)
    alert('✅ Score mis à jour !')
  }

  const toggleDisponibilite = async (matchId: string) => {
    if (!user) return
    const match = matchs.find((m: any) => m.id === matchId)
    if (!match) return
    const estDispo = match.disponibles?.includes(pseudo)
    const nouveauxDisponibles = estDispo ? match.disponibles.filter((p: string) => p !== pseudo) : [...(match.disponibles || []), pseudo]
    const nouveauxIndisponibles = (match.indisponibles || []).filter((p: string) => p !== pseudo)
    await updateDoc(doc(db, 'matchs', matchId), { disponibles: nouveauxDisponibles, indisponibles: nouveauxIndisponibles })
  }

  const toggleIndisponibilite = async (matchId: string) => {
    if (!user) return
    const match = matchs.find((m: any) => m.id === matchId)
    if (!match) return
    const estIndispo = match.indisponibles?.includes(pseudo)
    const nouveauxIndisponibles = estIndispo ? match.indisponibles.filter((p: string) => p !== pseudo) : [...(match.indisponibles || []), pseudo]
    const nouveauxDisponibles = (match.disponibles || []).filter((p: string) => p !== pseudo)
    await updateDoc(doc(db, 'matchs', matchId), { disponibles: nouveauxDisponibles, indisponibles: nouveauxIndisponibles })
  }

  const formatDateFR = (dateString: string) => {
    if (!dateString) return ''
    if (dateString.includes('/')) return dateString
    const [year, month, day] = dateString.split('-')
    return `${day}/${month}/${year}`
  }

  const addToCalendar = (match: any) => {
    try {
      if (!match || !match.date) {
        alert('⚠️ Match non trouvé')
        return
      }
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      let year: string, month: string, day: string
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
        const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//DYNO Esport//FR\nBEGIN:VEVENT\nUID:${match.id}@dyno-esport\nDTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z\nDTSTART:${matchDate}T${startTime}\nDTEND:${matchDate}T${endTime}\nSUMMARY:🎮 DYNO vs ${match.adversaire}\nDESCRIPTION:Match DYNO Esport vs ${match.adversaire}\\nArène: ${match.arene}\\nType: ${match.type}\nLOCATION:${match.arene}\nEND:VEVENT\nEND:VCALENDAR`
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
    } catch (error: any) {
      console.error('Erreur calendrier:', error)
      alert('❌ Erreur: ' + error.message)
    }
  }

  const victoires = matchs.filter((m: any) => m.termine && (m.scoreDyno || 0) > (m.scoreAdversaire || 0)).length
  const defaites = matchs.filter((m: any) => m.termine && (m.scoreDyno || 0) < (m.scoreAdversaire || 0)).length
  const totalMatchs = victoires + defaites
  const winRate = totalMatchs > 0 ? Math.round((victoires / totalMatchs) * 100) : 0
  const prochainsMatchs = matchs.filter((m: any) => !m.termine).sort((a: any, b: any) => {
    const dateA = new Date(`${a.date}T${a.horaires?.[0] || a.horaire1 || '20:00'}`)
    const dateB = new Date(`${b.date}T${b.horaires?.[0] || b.horaire1 || '20:00'}`)
    return dateA.getTime() - dateB.getTime()
  })
  const historique = matchs.filter((m: any) => m.termine)

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    return match ? match[1] : null
  }

  const toggleMapSelection = (map: string, type: 'picks' | 'bans') => {
    if (type === 'picks') {
      if (nouvelleStrat.picks.includes(map)) {
        setNouvelleStrat({...nouvelleStrat, picks: nouvelleStrat.picks.filter(m => m !== map)})
      } else if (nouvelleStrat.picks.length < 4) {
        setNouvelleStrat({...nouvelleStrat, picks: [...nouvelleStrat.picks, map]})
      }
    } else {
      if (nouvelleStrat.bans.includes(map)) {
        setNouvelleStrat({...nouvelleStrat, bans: nouvelleStrat.bans.filter(m => m !== map)})
      } else if (nouvelleStrat.bans.length < 4) {
        setNouvelleStrat({...nouvelleStrat, bans: [...nouvelleStrat.bans, map]})
      }
    }
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
      <header className="backdrop-blur-xl bg-black/40 border-b border-[#D4AF37]/20 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="DYNO" className="w-14 h-14 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">DYNO</h1>
              <p className="text-xs text-gray-400">Esport Team</p>
            </div>
          </div>
          <div className="flex gap-2">
            {showInstall && (
              <button onClick={handleInstall} className="px-4 py-2.5 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-blue-500/30 transition-all">📲 Installer</button>
            )}
            {user ? (
              <button onClick={handleSignOut} className="px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-red-500/30 transition-all">👋 {pseudo}</button>
            ) : (
              <button onClick={() => setIsSignUp(false)} className="px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg hover:shadow-[#D4AF37]/50 transition-all">👤 Compte</button>
            )}
          </div>
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
                {prochainsMatchs.map((match: any) => (
                  <div key={match.id} className="backdrop-blur-xl bg-black/40 rounded-2xl p-5 border border-[#D4AF37]/20 shadow-xl hover:shadow-[#D4AF37]/20 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-lg ${match.type === 'Ligue' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' : match.type === 'Scrim' ? 'bg-gradient-to-r from-green-600 to-green-700 text-white' : match.type === 'Tournoi' ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white' : 'bg-gradient-to-r from-orange-600 to-orange-700 text-white'}`}>{match.type}</span>
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
                      <p className="text-[#D4AF37] font-bold">{match.horaires?.join(' / ') || match.horaire1 || '20:00'}</p>
                    </div>
                    <div className="backdrop-blur-xl bg-black/60 rounded-xl p-3 mb-4 border border-[#D4AF37]/20">
                      <p className="text-xs text-gray-400 mb-2">👥 Dispos ({match.disponibles?.length || 0}) / 🚫 Pas dispos ({match.indisponibles?.length || 0})</p>
                      <div className="flex flex-wrap gap-2">
                        {match.disponibles?.map((p: string, i: number) => (<span key={i} className="bg-green-500/20 text-green-400 px-3 py-1.5 rounded-xl text-xs font-bold border border-green-500/30">{p}</span>))}
                        {match.indisponibles?.map((p: string, i: number) => (<span key={i} className="bg-red-500/20 text-red-400 px-3 py-1.5 rounded-xl text-xs font-bold border border-red-500/30">{p}</span>))}
                      </div>
                    </div>
                    <button onClick={() => addToCalendar(match)} className="w-full mb-4 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2">📅 Ajouter au calendrier</button>
                    <div className="flex gap-2">
                        <button onClick={() => toggleDisponibilite(match.id)} disabled={!user} className={`flex-1 py-4 rounded-xl font-bold transition-all shadow-lg ${!user ? 'bg-gray-700 text-gray-400' : match.disponibles?.includes(pseudo) ? 'bg-green-600 text-white shadow-green-500/50' : 'border border-green-500 text-green-500 hover:bg-green-500/10'}`}>✅ Disponible</button>
                        <button onClick={() => toggleIndisponibilite(match.id)} disabled={!user} className={`flex-1 py-4 rounded-xl font-bold transition-all shadow-lg ${!user ? 'bg-gray-700 text-gray-400' : match.indisponibles?.includes(pseudo) ? 'bg-red-600 text-white shadow-red-500/50' : 'border border-red-500 text-red-500 hover:bg-red-500/10'}`}>🚫 Pas dispo</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* ... (Reste du code identique pour les autres onglets) ... */}
        
        {activeTab === 'historique' && (
          <div>
            <div className="relative rounded-3xl p-8 mb-6 text-center overflow-hidden bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 border border-[#D4AF37]/20 shadow-2xl">
              <img src={LOGO_URL} alt="DYNO" className="w-24 h-24 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-2">Historique</h2>
            </div>
            {/* ... (Code historique identique) ... */}
          </div>
        )}

        {activeTab === 'strats' && (
          <div>
            <div className="relative rounded-3xl p-8 mb-6 text-center overflow-hidden bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 border border-[#D4AF37]/20 shadow-2xl">
              <img src={LOGO_URL} alt="DYNO" className="w-24 h-24 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-2">🎯 Stratégies</h2>
              <p className="text-gray-400 text-sm">Picks & Bans par équipe</p>
            </div>
            {/* ... (Code strats identique avec les /4) ... */}
          </div>
        )}

        {/* ... (Le reste des onglets 'notes', 'rec', 'roster', 'stats', 'admin' ne change pas) ... */}

      </main>

      {/* ... (Le reste de la nav et modal connexion identique) ... */}
      
    </div>
  )
}

export default App
