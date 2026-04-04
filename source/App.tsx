import { useState, useEffect } from 'react'
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

const LOGO_URL = 'https://i.imgur.com/DyK0dtX.png'
const YOUTUBE_CHANNEL = 'https://youtube.com/@jonathanla890?si=wQkLpwEqKA7Dpuc8'
const ADMIN_EMAIL = 'thibaut.llorens@hotmail.com'

function App() {
  const [activeTab, setActiveTab] = useState<'matchs' | 'historique' | 'notes' | 'rec' | 'roster' | 'stats' | 'admin'>('matchs')
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
  const [nouvelleNote, setNouvelleNote] = useState({ matchId: '', matchNom: '', joueur: '', communication: '', mental: '', performance: '', commentaire: '' })
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [selectedMatchForNotes, setSelectedMatchForNotes] = useState<any>(null)
  const [nouveauMatch, setNouveauMatch] = useState({ adversaire: '', date: '', horaire1: '', horaire2: '', arene: 'Arène 1', type: 'Ligue' })
  const [scoreEdit, setScoreEdit] = useState<any>(null)
  const [showMatchScored, setShowMatchScored] = useState<any>(null)

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
    
    const discordMessage = {
      embeds: [{
        title: '🎮 NOUVEAU MATCH DYNO !',
        color: 13934871,
        fields: [
          { name: '⚔️ Adversaire', value: nouveauMatch.adversaire, inline: true },
          { name: '📅 Date', value: nouveauMatch.date, inline: true },
          { name: '⏰ Horaire', value: horaires.join(' / '), inline: true },
          { name: '🏟️ Arène', value: nouveauMatch.arene, inline: true }
        ],
        footer: { text: 'DYNO Esport', icon_url: LOGO_URL }
      }]
    }
    try {
      await fetch(DISCORD_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(discordMessage) })
    } catch (error) {
      console.error('❌ Erreur Discord:', error)
    }
    
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
    if (!nouvelleNote.joueur || !nouvelleNote.communication || !nouvelleNote.mental || !nouvelleNote.performance) {
      alert('⚠️ Remplis le joueur et les 3 notes !')
      return
    }
    if (!user) {
      alert('⚠️ Tu dois être connecté !')
      return
    }
    const note = { 
      ...nouvelleNote, 
      communication: parseInt(nouvelleNote.communication), 
      mental: parseInt(nouvelleNote.mental), 
      performance: parseInt(nouvelleNote.performance), 
      moyenne: Math.round((parseInt(nouvelleNote.communication) + parseInt(nouvelleNote.mental) + parseInt(nouvelleNote.performance)) / 3), 
      author: pseudo, 
      authorId: user.uid, 
      createdAt: Date.now() 
    }
    await addDoc(collection(db, 'notes'), note)
    setNouvelleNote({ matchId: '', matchNom: '', joueur: '', communication: '', mental: '', performance: '', commentaire: '' })
    setShowNoteForm(false)
    setSelectedMatchForNotes(null)
    alert('✅ Note ajoutée !')
  }

  const ouvrirFormulaireNotes = (match: any) => {
    setSelectedMatchForNotes(match)
    setShowMatchScored(match)
    setShowNoteForm(false)
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

  const supprimerNote = async (noteId: string, noteAuthorId: string) => {
    if (!confirm('⚠️ Supprimer cette note ?')) return
    if (!isAdmin && user?.uid !== noteAuthorId) {
      alert('❌ Tu ne peux supprimer que tes notes !')
      return
    }
    await deleteDoc(doc(db, 'notes', noteId))
    alert('✅ Note supprimée !')
  }

  const supprimerJoueur = async (playerId: string, playerPseudo: string) => {
    if (!confirm(`⚠️ Supprimer "${playerPseudo}" ?`)) return
    await deleteDoc(doc(db, 'players', playerId))
    alert('✅ Joueur supprimé !')
  }

  const updateScore = async (matchId: string, scoreDyno: number, scoreAdv: number) => {
    await updateDoc(doc(db, 'matchs', matchId), { scoreDyno, scoreAdversaire: scoreAdv, termine: true })
    setScoreEdit(null)
    setShowMatchScored({ id: matchId, adversaire: prochainsMatchs.find((m: any) => m.id === matchId)?.adversaire || 'Inconnu' })
    alert('✅ Score mis à jour ! Les joueurs peuvent maintenant noter leurs teammates.')
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
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
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
            {showInstall && !isIOS && <button onClick={handleInstall} className="btn-gold px-3 py-1.5 rounded-lg text-sm">📲 Installer</button>}
            {isIOS && <button onClick={() => alert('📱 iPhone : Partager → "Sur l\'écran d\'accueil"')} className="btn-gold px-3 py-1.5 rounded-lg text-sm">📱 Installer</button>}
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
              <p className="text-gray-400 text-sm">Restez prêts pour la victoire</p>
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
                      {match.disponibles.length === 0 ? (
                        <p className="text-gray-500 text-sm">Aucun joueur</p>
                      ) : (
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
                {historique.map(match => {
                  const victoire = (match.scoreDyno || 0) > (match.scoreAdversaire || 0)
                  const nul = (match.scoreDyno || 0) === (match.scoreAdversaire || 0)
                  return (
                    <div key={match.id} className="card-relief rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${victoire ? 'bg-[#D4AF37] text-black' : nul ? 'bg-gray-700 text-gray-300' : 'bg-red-900/50 text-red-400'}`}>{victoire ? '🏆 VICTOIRE' : nul ? '🤝 NUL' : '❌ DÉFAITE'}</span>
                        <span className="text-gray-400 text-sm">{match.date}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-center"><p className="font-bold text-[#D4AF37]">DYNO</p><p className="text-3xl font-bold text-[#D4AF37]">{match.scoreDyno}</p></div>
                        <span className="text-gray-600 text-xl">-</span>
                        <div className="text-center"><p className="font-bold text-gray-400">{match.adversaire}</p><p className="text-3xl font-bold text-gray-400">{match.scoreAdversaire}</p></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div>
            <div className="card-relief rounded-2xl p-6 mb-6 text-center">
              <img src={LOGO_URL} alt="DYNO" className="w-20 h-20 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#D4AF37] mb-2">📊 Notes Individuelles</h2>
              <p className="text-gray-400 text-sm">Performance de chaque joueur par match</p>
            </div>
            {notes.length === 0 ? (
              <div className="text-center py-10 text-gray-500"><p>📊 Aucune note pour le moment</p><p className="text-sm mt-2">Les notes sont ajoutées après les matchs dans l'onglet Admin !</p></div>
            ) : (
              <div className="space-y-4">
                {notes.map(note => (
                  <div key={note.id} className="card-relief rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold">{note.joueur[0]?.toUpperCase()}</div>
                        <div>
                          <p className="font-bold text-[#D4AF37]">{note.joueur}</p>
                          <p className="text-xs text-gray-400">Match: <span className="text-[#D4AF37] font-bold">{note.matchNom || 'N/A'}</span></p>
                          <p className="text-xs text-gray-400">par {note.author} • Moy: <span className="text-[#D4AF37] font-bold">{note.moyenne}/10</span></p>
                        </div>
                      </div>
                      {(isAdmin || user?.uid === note.authorId) && <button onClick={() => supprimerNote(note.id, note.authorId)} className="bg-red-900/50 border border-red-500 text-red-400 px-3 py-1 rounded-lg text-sm">🗑️</button>}
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-[#0a0a0a] rounded-lg p-2 text-center border border-[#D4AF37]/20">
                        <p className="text-xs text-gray-400">💬 Comm</p>
                        <p className="text-lg font-bold text-[#D4AF37]">{note.communication}/10</p>
                      </div>
                      <div className="bg-[#0a0a0a] rounded-lg p-2 text-center border border-[#D4AF37]/20">
                        <p className="text-xs text-gray-400">🧠 Mental</p>
                        <p className="text-lg font-bold text-[#D4AF37]">{note.mental}/10</p>
                      </div>
                      <div className="bg-[#0a0a0a] rounded-lg p-2 text-center border border-[#D4AF37]/20">
                        <p className="text-xs text-gray-400">🎯 Perf</p>
                        <p className="text-lg font-bold text-[#D4AF37]">{note.performance}/10</p>
                      </div>
                    </div>
                    {note.commentaire && (
                      <div className="bg-[#0a0a0a] rounded-lg p-3 border border-[#D4AF37]/20">
                        <p className="text-xs text-gray-400 mb-1">💬 Commentaire:</p>
                        <p className="text-sm text-gray-300">{note.commentaire}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'rec' && (
          <div>
            <div className="card-relief rounded-2xl p-6 mb-6 text-center">
              <img src={LOGO_URL} alt="DYNO" className="w-20 h-20 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#D4AF37] mb-2">🎬 Nos Replays</h2>
              <p className="text-gray-400 text-sm mb-4">Retrouvez tous nos matchs en vidéo</p>
              <a href={YOUTUBE_CHANNEL} target="_blank" rel="noopener noreferrer" className="btn-gold inline-block px-6 py-3 rounded-lg font-bold">🔴 S'abonner à la chaîne</a>
            </div>
            {replays.length === 0 ? (
              <div className="text-center py-10 text-gray-500"><p>📹 Aucun replay pour le moment</p></div>
            ) : (
              <div className="space-y-4">
                {replays.map(replay => {
                  const videoId = getYouTubeId(replay.lien)
                  return (
                    <div key={replay.id} className="card-relief rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-[#D4AF37] text-lg">{replay.titre}</h3>
                        {isAdmin && <button onClick={() => supprimerReplay(replay.id)} className="bg-red-900/50 border border-red-500 text-red-400 px-3 py-1 rounded-lg text-sm">🗑️</button>}
                      </div>
                      {videoId ? (
                        <div className="relative w-full pb-[56.25%] rounded-lg overflow-hidden bg-gray-900">
                          <iframe src={`https://www.youtube.com/embed/${videoId}`} title={replay.titre} className="absolute top-0 left-0 w-full h-full" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                        </div>
                      ) : (
                        <a href={replay.lien} target="_blank" rel="noopener noreferrer" className="btn-gold block text-center py-3 rounded-lg">▶️ Voir la vidéo</a>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'roster' && (
          <div>
            <div className="card-relief rounded-2xl p-6 mb-6 text-center">
              <img src={LOGO_URL} alt="DYNO" className="w-20 h-20 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#D4AF37] mb-2">Roster DYNO</h2>
              <p className="text-gray-400 text-sm">Nos joueurs</p>
            </div>
            <div className="space-y-4">
              {joueurs.filter(j => j.actif !== false).map(joueur => (
                <div key={joueur.id} className="card-relief rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold text-xl">{joueur.pseudo[0]?.toUpperCase()}</div>
                    <div className="flex-1">
                      <p className="font-bold text-[#D4AF37]">{joueur.pseudo}</p>
                      <p className="text-sm text-gray-400">🎮 {joueur.role} {joueur.rang && `• ${joueur.rang}`}</p>
                    </div>
                    {isAdmin && <button onClick={() => supprimerJoueur(joueur.id, joueur.pseudo)} className="bg-red-900/50 border border-red-500 text-red-400 px-3 py-2 rounded-lg text-sm">🗑️</button>}
                  </div>
                </div>
              ))}
            </div>
            {isAdmin && (<div className="mt-6 card-relief rounded-xl p-4 text-center"><p className="text-gray-400 text-sm">👆 Clique sur ️ pour supprimer un joueur</p></div>)}
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <div className="card-relief rounded-2xl p-6 mb-6 text-center">
              <img src={LOGO_URL} alt="DYNO" className="w-20 h-20 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#D4AF37] mb-2">Statistiques</h2>
              <p className="text-gray-400 text-sm">Performance de l'équipe</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="card-relief rounded-xl p-4 text-center"><p className="text-4xl font-bold text-[#D4AF37]">{winRate}%</p><p className="text-sm text-gray-400">Win Rate</p></div>
              <div className="card-relief rounded-xl p-4 text-center"><p className="text-4xl font-bold text-[#D4AF37]">{totalMatchs}</p><p className="text-sm text-gray-400">Matchs Totaux</p></div>
            </div>
            <div className="card-relief rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-[#D4AF37] mb-4">📊 Répartition</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-gray-400">🏆 Victoires</span><span className="text-[#D4AF37] font-bold">{victoires}</span></div>
                <div className="w-full bg-gray-800 rounded-full h-2"><div className="bg-[#D4AF37] h-2 rounded-full" style={{ width: `${totalMatchs > 0 ? (victoires/totalMatchs)*100 : 0}%` }}></div></div>
                <div className="flex items-center justify-between mt-4"><span className="text-gray-400">🤝 Nuls</span><span className="text-[#D4AF37] font-bold">{nuls}</span></div>
                <div className="w-full bg-gray-800 rounded-full h-2"><div className="bg-gray-500 h-2 rounded-full" style={{ width: `${totalMatchs > 0 ? (nuls/totalMatchs)*100 : 0}%` }}></div></div>
                <div className="flex items-center justify-between mt-4"><span className="text-gray-400">❌ Défaites</span><span className="text-red-500 font-bold">{defaites}</span></div>
                <div className="w-full bg-gray-800 rounded-full h-2"><div className="bg-red-500 h-2 rounded-full" style={{ width: `${totalMatchs > 0 ? (defaites/totalMatchs)*100 : 0}%` }}></div></div>
              </div>
            </div>
            <div className="card-relief rounded-xl p-6">
              <h3 className="text-lg font-bold text-[#D4AF37] mb-4">🔔 Notifications</h3>
              {notificationPermission === 'granted' ? (
                <div className="text-center"><p className="text-green-400 mb-4">✅ Notifications activées !</p><p className="text-gray-400 text-sm">Tu recevras des rappels avant les matchs.</p></div>
              ) : (
                <><p className="text-gray-400 text-sm mb-4">Reçois des rappels avant les matchs</p><button onClick={requestNotificationPermission} className="btn-gold w-full py-3 rounded-lg font-bold">{isIOS ? '📱 iPhone : Voir instructions' : '🔔 Activer les notifications'}</button>{isIOS && (<p className="text-gray-500 text-xs mt-3 text-center">iOS nécessite iOS 16.4+</p>)}</>
              )}
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div>
            <div className="card-relief rounded-2xl p-6 mb-6 text-center">
              <img src={LOGO_URL} alt="DYNO" className="w-28 h-28 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#D4AF37] mb-2">Espace Admin</h2>
              {!isAdmin ? (<p className="text-gray-400">Connecte-toi pour gérer</p>) : (<p className="text-green-400">👑 Connecté en tant qu'admin</p>)}
            </div>
            {!isAdmin ? (
              <div className="card-relief rounded-xl p-6">
                <h3 className="text-lg font-bold text-[#D4AF37] mb-4">🔐 Admin</h3>
                <input type="password" placeholder="Mot de passe" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 mb-4 text-white" />
                <button onClick={handleAdminLogin} className="btn-gold w-full py-3 rounded-lg">Se connecter</button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="card-relief rounded-xl p-6">
                  <h3 className="text-lg font-bold text-[#D4AF37] mb-4">➕ Ajouter un Match</h3>
                  <input type="text" placeholder="Adversaire" value={nouveauMatch.adversaire} onChange={(e) => setNouveauMatch({...nouveauMatch, adversaire: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 mb-3 text-white" />
                  <input type="date" value={nouveauMatch.date} onChange={(e) => setNouveauMatch({...nouveauMatch, date: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 mb-3 text-white" />
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input type="time" placeholder="Horaire 1" value={nouveauMatch.horaire1} onChange={(e) => setNouveauMatch({...nouveauMatch, horaire1: e.target.value})} className="bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 text-white" />
                    <input type="time" placeholder="Horaire 2" value={nouveauMatch.horaire2} onChange={(e) => setNouveauMatch({...nouveauMatch, horaire2: e.target.value})} className="bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <select value={nouveauMatch.arene} onChange={(e) => setNouveauMatch({...nouveauMatch, arene: e.target.value})} className="bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 text-white">
                      <option value="Arène 1">Arène 1</option>
                      <option value="Arène 2">Arène 2</option>
                    </select>
                    <select value={nouveauMatch.type} onChange={(e) => setNouveauMatch({...nouveauMatch, type: e.target.value})} className="bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 text-white">
                      <option value="Ligue">Ligue</option>
                      <option value="Scrim">Scrim</option>
                      <option value="Tournoi">Tournoi</option>
                    </select>
                  </div>
                  <button onClick={ajouterMatch} className="btn-gold w-full py-3 rounded-lg">Ajouter</button>
                </div>

                {/* 📊 Scores & Notes - TOUS LES JOUEURS PEUVENT NOTER */}
                <div className="card-relief rounded-xl p-6">
                  <h3 className="text-lg font-bold text-[#D4AF37] mb-4">📊 Scores & Notes d'équipe</h3>
                  {historique.length === 0 ? (
                    <p className="text-gray-500 text-center">Aucun match terminé</p>
                  ) : (
                    <div className="space-y-4">
                      {historique.map(match => (
                        <div key={match.id} className="bg-[#0a0a0a] rounded-lg p-4 border border-[#D4AF37]/20">
                          <div className="flex items-center justify-between mb-3">
                            <p className="font-bold text-[#D4AF37]">{match.adversaire}</p>
                            <span className="text-xs text-gray-400">{match.date}</span>
                          </div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-lg font-bold text-[#D4AF37]">DYNO {match.scoreDyno}</span>
                            <span className="text-gray-500">-</span>
                            <span className="text-lg font-bold text-gray-400">{match.scoreAdversaire} {match.adversaire}</span>
                          </div>
                          <button onClick={() => ouvrirFormulaireNotes(match)} className="btn-gold w-full py-2 rounded-lg text-sm mb-2">
                            📊 Noter les joueurs de ce match
                          </button>
                          {showMatchScored?.id === match.id && (
                            <div className="bg-[#1a1a1a] rounded-lg p-4 mt-3 border border-[#D4AF37]/20">
                              <p className="text-sm text-gray-400 mb-3">📝 Tous les joueurs peuvent noter leurs teammates :</p>
                              <div className="space-y-2">
                                {joueurs.filter(j => j.actif !== false).map((joueur) => (
                                  <div key={joueur.id} className="bg-[#0a0a0a] rounded p-2 flex items-center justify-between">
                                    <span className="text-[#D4AF37]">{joueur.pseudo}</span>
                                    <button 
                                      onClick={() => {
                                        setNouvelleNote({
                                          matchId: match.id,
                                          matchNom: `${match.adversaire} (${match.date})`,
                                          joueur: joueur.pseudo,
                                          communication: '',
                                          mental: '',
                                          performance: '',
                                          commentaire: ''
                                        })
                                        setShowNoteForm(true)
                                        setSelectedMatchForNotes(match)
                                      }}
                                      className="btn-gold px-3 py-1 rounded text-xs"
                                    >
                                      ✍️ Noter
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {showNoteForm && selectedMatchForNotes && (
                  <div className="card-relief rounded-xl p-6 bg-[#1a1a1a]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-[#D4AF37]">📝 Note pour {nouvelleNote.joueur}</h3>
                      <button onClick={() => { setShowNoteForm(false); setSelectedMatchForNotes(null); }} className="text-gray-400 text-sm">✕ Fermer</button>
                    </div>
                    <p className="text-xs text-gray-400 mb-4">Match: {selectedMatchForNotes.adversaire} - {selectedMatchForNotes.date}</p>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div><label className="text-xs text-gray-400">💬 Comm (0-10)</label><input type="number" min="0" max="10" placeholder="0-10" value={nouvelleNote.communication} onChange={(e) => setNouvelleNote({...nouvelleNote, communication: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 text-white" /></div>
                      <div><label className="text-xs text-gray-400">🧠 Mental (0-10)</label><input type="number" min="0" max="10" placeholder="0-10" value={nouvelleNote.mental} onChange={(e) => setNouvelleNote({...nouvelleNote, mental: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 text-white" /></div>
                      <div><label className="text-xs text-gray-400">🎯 Perf (0-10)</label><input type="number" min="0" max="10" placeholder="0-10" value={nouvelleNote.performance} onChange={(e) => setNouvelleNote({...nouvelleNote, performance: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 text-white" /></div>
                    </div>
                    <input type="text" placeholder="Commentaire (optionnel)" value={nouvelleNote.commentaire} onChange={(e) => setNouvelleNote({...nouvelleNote, commentaire: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 mb-3 text-white" />
                    <button onClick={ajouterNote} className="btn-gold w-full py-3 rounded-lg">✅ Ajouter la note</button>
                  </div>
                )}

                <div className="card-relief rounded-xl p-6">
                  <h3 className="text-lg font-bold text-[#D4AF37] mb-4">🎬 Ajouter un Replay</h3>
                  <input type="text" placeholder="Titre de la vidéo" value={nouveauReplay.titre} onChange={(e) => setNouveauReplay({...nouveauReplay, titre: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 mb-3 text-white" />
                  <input type="text" placeholder="Lien YouTube" value={nouveauReplay.lien} onChange={(e) => setNouveauReplay({...nouveauReplay, lien: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 mb-3 text-white" />
                  <button onClick={ajouterReplay} className="btn-gold w-full py-3 rounded-lg">Ajouter le replay</button>
                </div>
                <div className="card-relief rounded-xl p-6">
                  <h3 className="text-lg font-bold text-[#D4AF37] mb-4">🗑️ Supprimer un Match</h3>
                  {matchs.length === 0 ? (<p className="text-gray-500 text-center">Aucun match</p>) : (
                    <div className="space-y-3">
                      {matchs.map(match => (
                        <div key={match.id} className="bg-[#0a0a0a] rounded-lg p-3 border border-[#D4AF37]/20">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-bold text-[#D4AF37]">{match.adversaire}</p>
                            <span className="text-xs text-gray-400">{match.date}</span>
                          </div>
                          <button onClick={() => supprimerMatch(match.id)} className="w-full bg-red-900/50 border border-red-500 text-red-400 py-2 rounded-lg text-sm">🗑️ Supprimer ce match</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="card-relief rounded-xl p-6">
                  <h3 className="text-lg font-bold text-[#D4AF37] mb-4">👥 Ajouter un Joueur</h3>
                  <input type="text" placeholder="Pseudo" value={nouveauJoueur.pseudo} onChange={(e) => setNouveauJoueur({...nouveauJoueur, pseudo: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 mb-3 text-white" />
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <select value={nouveauJoueur.role} onChange={(e) => setNouveauJoueur({...nouveauJoueur, role: e.target.value})} className="bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 text-white">
                      <option value="Joueur">Joueur</option>
                      <option value="Capitaine">Capitaine</option>
                      <option value="Coach">Coach</option>
                      <option value="Manager">Manager</option>
                    </select>
                    <input type="text" placeholder="Rang" value={nouveauJoueur.rang} onChange={(e) => setNouveauJoueur({...nouveauJoueur, rang: e.target.value})} className="bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 text-white" />
                  </div>
                  <button onClick={ajouterJoueur} className="btn-gold w-full py-3 rounded-lg">Ajouter</button>
                </div>
                <button onClick={handleAdminLogout} className="w-full border border-red-500 text-red-500 py-3 rounded-lg">🚪 Déconnexion Admin</button>
              </div>
            )}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-[#D4AF37]/30">
        <div className="max-w-lg mx-auto flex">
          <button onClick={() => setActiveTab('matchs')} className={`flex-1 py-4 text-center ${activeTab === 'matchs' ? 'text-[#D4AF37]' : 'text-gray-500'}`}>📅 Matchs</button>
          <button onClick={() => setActiveTab('historique')} className={`flex-1 py-4 text-center ${activeTab === 'historique' ? 'text-[#D4AF37]' : 'text-gray-500'}`}>📜 Historique</button>
          <button onClick={() => setActiveTab('notes')} className={`flex-1 py-4 text-center ${activeTab === 'notes' ? 'text-[#D4AF37]' : 'text-gray-500'}`}>📊 Notes</button>
          <button onClick={() => setActiveTab('rec')} className={`flex-1 py-4 text-center ${activeTab === 'rec' ? 'text-[#D4AF37]' : 'text-gray-500'}`}>🎬 Rec</button>
          <button onClick={() => setActiveTab('roster')} className={`flex-1 py-4 text-center ${activeTab === 'roster' ? 'text-[#D4AF37]' : 'text-gray-500'}`}>👥 Roster</button>
          <button onClick={() => setActiveTab('stats')} className={`flex-1 py-4 text-center ${activeTab === 'stats' ? 'text-[#D4AF37]' : 'text-gray-500'}`}>📊 Stats</button>
          <button onClick={() => setActiveTab('admin')} className={`flex-1 py-4 text-center ${activeTab === 'admin' ? 'text-[#D4AF37]' : 'text-gray-500'}`}>⚙️ Admin</button>
        </div>
      </nav>

      {!user && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="card-relief rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-[#D4AF37] mb-4 text-center">{isSignUp ? '📝 Créer un compte' : '👤 Connexion'}</h3>
            {isSignUp && (<input type="text" placeholder="Pseudo" value={pseudo} onChange={(e) => setPseudo(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 mb-3 text-white" />)}
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 mb-3 text-white" />
            <input type="password" placeholder="Mot de passe" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 mb-3 text-white" />
            <div className="flex items-center gap-2 mb-4">
              <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 accent-[#D4AF37]" />
              <label htmlFor="rememberMe" className="text-sm text-gray-400">📝 Se souvenir de moi</label>
            </div>
            {authLoading ? (<button disabled className="w-full bg-gray-600 text-gray-400 py-3 rounded-lg font-bold">⏳...</button>) : isSignUp ? (
              <button onClick={handleSignUp} className="btn-gold w-full py-3 rounded-lg font-bold mb-3">✅ Créer</button>
            ) : (
              <button onClick={handleSignIn} className="btn-gold w-full py-3 rounded-lg font-bold mb-3">🔐 Connexion</button>
            )}
            <div className="border-t border-gray-700 pt-3">
              {isSignUp ? (<button onClick={() => setIsSignUp(false)} className="w-full text-[#D4AF37] text-sm">Déjà un compte ? Se connecter</button>) : (
                <button onClick={() => setIsSignUp(true)} className="w-full text-[#D4AF37] text-sm">Pas de compte ? S'inscrire</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
