import { useState, useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, getDoc, setDoc } from 'firebase/firestore'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getMessaging, getToken } from 'firebase/messaging'

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDXwItLM0OZ0VmHj-DLZcH8OBy7wXiHBsM",
  authDomain: "dyno-esport.firebaseapp.com",
  projectId: "dyno-esport",
  storageBucket: "dyno-esport.firebasestorage.app",
  messagingSenderId: "808658404731",
  appId: "1:808658404731:web:f3cf29142d3038816f29de"
}

// VAPID Key pour les notifications
const VAPID_KEY = 'BIhsEPrWBagYPmnPjpiR3tlKZB0ehBMqkgMnoZUFv1jkNXb6DrkiFT7UOyBETE83ba_tGueF1uV0KNIz0mMXepk'

// Initialiser Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

// 🔐 Persistance de la connexion (LOCAL = reste connecté)
setPersistence(auth, browserLocalPersistence)

const LOGO_URL = 'https://i.imgur.com/DyKOdtX.png'

// URL Webhook Discord
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1489600048474886295/HfR7YhCRuDpjN6NCw133bShUF9Gj1gak-fWtTYVYgI2G_gllQ001kRfH0w57mUuCTytp'

// 🎬 Lien de la chaîne YouTube DYNO
const YOUTUBE_CHANNEL = 'https://youtube.com/@jonathanla890?si=gyqnT3v-xZY3cwd1'

function App() {
  const [activeTab, setActiveTab] = useState<'matchs' | 'historique' | 'roster' | 'rec' | 'stats' | 'admin'>('matchs')
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [showSplash, setShowSplash] = useState(true)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Authentication
  const [user, setUser] = useState<any>(null)
  const [pseudo, setPseudo] = useState('')
  const [email, setEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  // Notifications
  const [notificationPermission, setNotificationPermission] = useState('default')

  // Matchs
  const [matchs, setMatchs] = useState<any[]>([])

  // Replays (Rec)
  const [replays, setReplays] = useState<any[]>([])
  const [nouveauReplay, setNouveauReplay] = useState({ titre: '', lien: '', adversaire: '' })

  // Roster
  const [joueurs, setJoueurs] = useState<any[]>([])
  const [nouveauJoueur, setNouveauJoueur] = useState({ pseudo: '', role: 'Joueur', rang: '' })

  // Admin forms
  const [nouveauMatch, setNouveauMatch] = useState({
    adversaire: '',
    date: '',
    horaire1: '',
    horaire2: '',
    arene: 'Arène 1',
    type: 'Ligue'
  })
  const [scoreEdit, setScoreEdit] = useState<any>(null)

  // Charger le pseudo
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          setPseudo(data.pseudo)
        }
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // Charger les matchs
  useEffect(() => {
    const q = query(collection(db, 'matchs'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const matchsData: any[] = []
      snapshot.forEach((doc) => {
        matchsData.push({ id: doc.id, ...doc.data() })
      })
      setMatchs(matchsData)
    })
    return () => unsubscribe()
  }, [])

  // Charger les replays
  useEffect(() => {
    const q = query(collection(db, 'replays'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const replaysData: any[] = []
      snapshot.forEach((doc) => {
        replaysData.push({ id: doc.id, ...doc.data() })
      })
      setReplays(replaysData)
    })
    return () => unsubscribe()
  }, [])

  // Charger le roster
  useEffect(() => {
    const q = query(collection(db, 'players'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const joueursData: any[] = []
      snapshot.forEach((doc) => {
        joueursData.push({ id: doc.id, ...doc.data() })
      })
      setJoueurs(joueursData)
    })
    return () => unsubscribe()
  }, [])

  // Détection iOS
  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(ios)
  }, [])

  // Splash screen
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  // PWA install
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    })
  }, [])

  // Notifications permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
  }, [])

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('❌ Notifications non supportées sur cet appareil')
      return
    }
    
    if (isIOS) {
      alert('📱 iPhone :\n\n1. Ajoute l\'app à l\'écran d\'accueil\n2. iOS 16.4+ requis\n3. Réouvre l\'app depuis l\'écran d\'accueil')
      return
    }
    
    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)
    
    if (permission === 'granted' && user) {
      try {
        if ('serviceWorker' in navigator) {
          await navigator.serviceWorker.register('/firebase-messaging-sw.js')
        }
        
        const messaging = getMessaging(app)
        const token = await getToken(messaging, { vapidKey: VAPID_KEY })
        
        if (token) {
          await updateDoc(doc(db, 'users', user.uid), { fcmToken: token })
          alert('✅ Notifications activées !')
        }
      } catch (error: any) {
        console.error('Erreur FCM:', error)
        alert('⚠️ Erreur: ' + error.message)
      }
    } else if (permission === 'denied') {
      alert('❌ Notifications refusées.')
    }
  }

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      setDeferredPrompt(null)
      setShowInstall(false)
    }
  }

  // Créer un compte
  const handleSignUp = async () => {
    if (!email || !authPassword || !pseudo) {
      alert('⚠️ Remplis tous les champs !')
      return
    }
    setAuthLoading(true)
    try {
      const result = await createUserWithEmailAndPassword(auth, email, authPassword)
      await setDoc(doc(db, 'users', result.user.uid), {
        pseudo: pseudo,
        email: email,
        createdAt: Date.now(),
        fcmToken: ''
      })
      await addDoc(collection(db, 'players'), {
        pseudo: pseudo,
        role: 'Joueur',
        rang: 'Nouveau',
        userId: result.user.uid,
        createdAt: Date.now()
      })
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

  // Se connecter AVEC "Se souvenir de moi"
  const handleSignIn = async () => {
    if (!email || !authPassword) {
      alert('⚠️ Remplis tous les champs !')
      return
    }
    setAuthLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, authPassword)
      alert('✅ Connecté !' + (rememberMe ? '\n📝 Connexion enregistrée' : ''))
      setEmail('')
      setAuthPassword('')
    } catch (error: any) {
      alert('❌ ' + error.message)
    }
    setAuthLoading(false)
  }

  // Se déconnecter
  const handleSignOut = async () => {
    await signOut(auth)
    setPseudo('')
    alert('✅ Déconnecté !')
  }

  // Login Admin
  const handleAdminLogin = () => {
    if (adminPassword === 'dyno2026') {
      setIsAdmin(true)
      setAdminPassword('')
    } else {
      alert('❌ Mot de passe incorrect !')
    }
  }

  // 🎮 Ajouter un match AVEC NOTIFICATION DISCORD
  const ajouterMatch = async () => {
    if (!nouveauMatch.adversaire || !nouveauMatch.date || !nouveauMatch.horaire1) {
      alert('⚠️ Remplis tous les champs !')
      return
    }
    const horaires = [nouveauMatch.horaire1]
    if (nouveauMatch.horaire2) horaires.push(nouveauMatch.horaire2)
    
    const matchDateTime = new Date(`${nouveauMatch.date}T${nouveauMatch.horaire1}`)
    
    await addDoc(collection(db, 'matchs'), {
      adversaire: nouveauMatch.adversaire,
      date: nouveauMatch.date,
      horaires: horaires,
      arene: nouveauMatch.arene,
      type: nouveauMatch.type,
      termine: false,
      disponibles: [],
      createdAt: Date.now(),
      matchTimestamp: matchDateTime.getTime()
    })
    
    // 🎮 NOTIFICATION DISCORD
    const discordMessage = {
      embeds: [{
        title: '🎮 NOUVEAU MATCH DYNO !',
        color: 13934871,
        fields: [
          { name: '⚔️ Adversaire', value: nouveauMatch.adversaire, inline: true },
          { name: '📅 Date', value: nouveauMatch.date, inline: true },
          { name: '⏰ Horaire', value: horaires.join(' / '), inline: true },
          { name: '🏟️ Arène', value: nouveauMatch.arene, inline: true },
          { name: '🏆 Type', value: nouveauMatch.type, inline: true }
        ],
        footer: {
          text: 'DYNO Esport',
          icon_url: LOGO_URL
        },
        thumbnail: {
          url: LOGO_URL
        }
      }]
    }
    
    try {
      await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordMessage)
      })
      console.log('✅ Notification Discord envoyée !')
    } catch (error) {
      console.error('❌ Erreur Discord:', error)
    }
    
    // Notification locale
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🎮 Nouveau Match DYNO !', {
        body: `Match contre ${nouveauMatch.adversaire} le ${nouveauMatch.date}`,
        icon: LOGO_URL
      })
    }
    
    setNouveauMatch({ adversaire: '', date: '', horaire1: '', horaire2: '', arene: 'Arène 1', type: 'Ligue' })
    alert('✅ Match ajouté ! Notification Discord envoyée à l\'équipe.')
  }

  // 🎬 Ajouter un Replay (Admin)
  const ajouterReplay = async () => {
    if (!nouveauReplay.titre || !nouveauReplay.lien) {
      alert('⚠️ Remplis le titre et le lien YouTube !')
      return
    }
    
    await addDoc(collection(db, 'replays'), {
      titre: nouveauReplay.titre,
      lien: nouveauReplay.lien,
      adversaire: nouveauReplay.adversaire || 'N/A',
      createdAt: Date.now()
    })
    
    setNouveauReplay({ titre: '', lien: '', adversaire: '' })
    alert('✅ Replay ajouté !')
  }

  // ✅ SUPPRIMER UN MATCH (Admin)
  const supprimerMatch = async (matchId: string) => {
    if (!confirm('⚠️ Supprimer ce match ?\n\nCette action est irréversible !')) return
    
    try {
      await deleteDoc(doc(db, 'matchs', matchId))
      alert('✅ Match supprimé !')
    } catch (error: any) {
      alert('❌ Erreur: ' + error.message)
    }
  }

  // ✅ SUPPRIMER UN REPLAY (Admin)
  const supprimerReplay = async (replayId: string) => {
    if (!confirm('⚠️ Supprimer ce replay ?')) return
    
    try {
      await deleteDoc(doc(db, 'replays', replayId))
      alert('✅ Replay supprimé !')
    } catch (error: any) {
      alert('❌ Erreur: ' + error.message)
    }
  }

  // ✅ SUPPRIMER UN JOUEUR (Admin)
  const supprimerJoueur = async (playerId: string, playerPseudo: string) => {
    if (!confirm(`⚠️ Supprimer "${playerPseudo}" du roster ?\n\nCette action est irréversible !`)) return
    
    try {
      await deleteDoc(doc(db, 'players', playerId))
      alert('✅ Joueur supprimé !')
    } catch (error: any) {
      alert('❌ Erreur: ' + error.message)
    }
  }

  // Mettre à jour le score
  const updateScore = async () => {
    if (!scoreEdit) return
    await updateDoc(doc(db, 'matchs', scoreEdit.id), {
      scoreDyno: parseInt(scoreEdit.scoreDyno),
      scoreAdversaire: parseInt(scoreEdit.scoreAdv),
      termine: true
    })
    setScoreEdit(null)
    alert('✅ Score mis à jour !')
  }

  // Toggle disponibilité
  const toggleDisponibilite = async (matchId: string) => {
    if (!user) {
      alert('⚠️ Connecte-toi pour te marquer disponible !')
      return
    }
    const match = matchs.find(m => m.id === matchId)
    if (!match) return
    
    const estDispo = match.disponibles.includes(pseudo)
    const nouveauxDisponibles = estDispo 
      ? match.disponibles.filter((p: string) => p !== pseudo)
      : [...match.disponibles, pseudo]
    
    await updateDoc(doc(db, 'matchs', matchId), {
      disponibles: nouveauxDisponibles
    })
  }

  // Ajouter un joueur au roster (Admin)
  const ajouterJoueur = async () => {
    if (!nouveauJoueur.pseudo) {
      alert('⚠️ Entre un pseudo !')
      return
    }
    await addDoc(collection(db, 'players'), {
      pseudo: nouveauJoueur.pseudo,
      role: nouveauJoueur.role,
      rang: nouveauJoueur.rang,
      createdAt: Date.now()
    })
    setNouveauJoueur({ pseudo: '', role: 'Joueur', rang: '' })
    alert('✅ Joueur ajouté !')
  }

  // Stats
  const victoires = matchs.filter(m => m.termine && (m.scoreDyno || 0) > (m.scoreAdversaire || 0)).length
  const defaites = matchs.filter(m => m.termine && (m.scoreDyno || 0) < (m.scoreAdversaire || 0)).length
  const nuls = matchs.filter(m => m.termine && (m.scoreDyno || 0) === (m.scoreAdversaire || 0)).length
  const totalMatchs = victoires + defaites + nuls
  const winRate = totalMatchs > 0 ? Math.round((victoires / totalMatchs) * 100) : 0
  const prochainsMatchs = matchs.filter(m => !m.termine)
  const historique = matchs.filter(m => m.termine)

  // Extraire l'ID de la vidéo YouTube depuis le lien
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    return match ? match[1] : null
  }

  // Splash Screen
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
      {/* Header */}
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
            {showInstall && !isIOS && (
              <button onClick={handleInstall} className="btn-gold px-3 py-1.5 rounded-lg text-sm">📲 Installer</button>
            )}
            {isIOS && (
              <button onClick={() => alert('📱 iPhone : Partager → "Sur l\'écran d\'accueil"')} className="btn-gold px-3 py-1.5 rounded-lg text-sm">📱 Installer</button>
            )}
            {user ? (
              <button onClick={handleSignOut} className="px-4 py-2 rounded-lg font-medium border border-red-500 text-red-500">👋 {pseudo}</button>
            ) : (
              <button onClick={() => setIsSignUp(false)} className="px-4 py-2 rounded-lg font-medium btn-gold">👤 Compte</button>
            )}
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-lg mx-auto px-4 py-6">
        
        {/* Onglet Matchs */}
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
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        match.type === 'Ligue' ? 'bg-blue-900/50 text-blue-400' :
                        match.type === 'Scrim' ? 'bg-green-900/50 text-green-400' :
                        'bg-purple-900/50 text-purple-400'
                      }`}>{match.type}</span>
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

                    <button 
                      onClick={() => toggleDisponibilite(match.id)}
                      disabled={!user}
                      className={`w-full py-3 rounded-lg font-bold ${
                        !user ? 'bg-gray-700 text-gray-400' :
                        match.disponibles.includes(pseudo)
                          ? 'bg-[#D4AF37] text-black'
                          : 'border border-[#D4AF37] text-[#D4AF37]'
                      }`}
                    >
                      {!user ? '🔐 Connecte-toi' : match.disponibles.includes(pseudo) ? '✅ Je suis disponible' : '📅 Je me marque disponible'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Onglet Historique */}
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
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          victoire ? 'bg-[#D4AF37] text-black' : nul ? 'bg-gray-700 text-gray-300' : 'bg-red-900/50 text-red-400'
                        }`}>{victoire ? '🏆 VICTOIRE' : nul ? '🤝 NUL' : '❌ DÉFAITE'}</span>
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

        {/* 🎬 Onglet REC (Replays) */}
        {activeTab === 'rec' && (
          <div>
            <div className="card-relief rounded-2xl p-6 mb-6 text-center">
              <img src={LOGO_URL} alt="DYNO" className="w-20 h-20 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#D4AF37] mb-2">🎬 Nos Replays</h2>
              <p className="text-gray-400 text-sm mb-4">Retrouvez tous nos matchs en vidéo</p>
              <a 
                href={YOUTUBE_CHANNEL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-gold inline-block px-6 py-3 rounded-lg font-bold"
              >
                🔴 S'abonner à la chaîne
              </a>
            </div>

            {replays.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <p>📹 Aucun replay pour le moment</p>
                <p className="text-sm mt-2">Les admins ajouteront vos matchs ici !</p>
              </div>
            ) : (
              <div className="space-y-4">
                {replays.map(replay => {
                  const videoId = getYouTubeId(replay.lien)
                  return (
                    <div key={replay.id} className="card-relief rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-[#D4AF37] text-lg">{replay.titre}</h3>
                        {isAdmin && (
                          <button
                            onClick={() => supprimerReplay(replay.id)}
                            className="bg-red-900/50 border border-red-500 text-red-400 px-3 py-1 rounded-lg text-sm"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-3">VS: {replay.adversaire}</p>
                      {videoId ? (
                        <div className="relative w-full pb-[56.25%] rounded-lg overflow-hidden bg-gray-900">
                          <iframe
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title={replay.titre}
                            className="absolute top-0 left-0 w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <a 
                          href={replay.lien} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-gold block text-center py-3 rounded-lg"
                        >
                          ▶️ Voir la vidéo
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Onglet Roster */}
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
                    <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold text-xl">
                      {joueur.pseudo[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#D4AF37]">{joueur.pseudo}</p>
                      <p className="text-sm text-gray-400">🎮 {joueur.role} {joueur.rang && `• ${joueur.rang}`}</p>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => supprimerJoueur(joueur.id, joueur.pseudo)}
                        className="bg-red-900/50 border border-red-500 text-red-400 px-3 py-2 rounded-lg text-sm"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {isAdmin && (
              <div className="mt-6 card-relief rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm">
                  👆 Clique sur 🗑️ pour supprimer un joueur
                </p>
              </div>
            )}
          </div>
        )}

        {/* Onglet Stats */}
        {activeTab === 'stats' && (
          <div>
            <div className="card-relief rounded-2xl p-6 mb-6 text-center">
              <img src={LOGO_URL} alt="DYNO" className="w-20 h-20 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#D4AF37] mb-2">Statistiques</h2>
              <p className="text-gray-400 text-sm">Performance de l'équipe</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="card-relief rounded-xl p-4 text-center">
                <p className="text-4xl font-bold text-[#D4AF37]">{winRate}%</p>
                <p className="text-sm text-gray-400">Win Rate</p>
              </div>
              <div className="card-relief rounded-xl p-4 text-center">
                <p className="text-4xl font-bold text-[#D4AF37]">{totalMatchs}</p>
                <p className="text-sm text-gray-400">Matchs Totaux</p>
              </div>
            </div>

            <div className="card-relief rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-[#D4AF37] mb-4">📊 Répartition</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">🏆 Victoires</span>
                  <span className="text-[#D4AF37] font-bold">{victoires}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-[#D4AF37] h-2 rounded-full" style={{ width: `${totalMatchs > 0 ? (victoires/totalMatchs)*100 : 0}%` }}></div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-gray-400">🤝 Nuls</span>
                  <span className="text-[#D4AF37] font-bold">{nuls}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-gray-500 h-2 rounded-full" style={{ width: `${totalMatchs > 0 ? (nuls/totalMatchs)*100 : 0}%` }}></div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-gray-400">❌ Défaites</span>
                  <span className="text-red-500 font-bold">{defaites}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${totalMatchs > 0 ? (defaites/totalMatchs)*100 : 0}%` }}></div>
                </div>
              </div>
            </div>

            <div className="card-relief rounded-xl p-6">
              <h3 className="text-lg font-bold text-[#D4AF37] mb-4">🔔 Notifications</h3>
              {notificationPermission === 'granted' ? (
                <div className="text-center">
                  <p className="text-green-400 mb-4">✅ Notifications activées !</p>
                  <p className="text-gray-400 text-sm">Tu recevras des rappels avant les matchs.</p>
                </div>
              ) : (
                <>
                  <p className="text-gray-400 text-sm mb-4">Reçois des rappels avant les matchs</p>
                  <button onClick={requestNotificationPermission} className="btn-gold w-full py-3 rounded-lg font-bold">
                    {isIOS ? '📱 iPhone : Voir instructions' : '🔔 Activer les notifications'}
                  </button>
                  {isIOS && (
                    <p className="text-gray-500 text-xs mt-3 text-center">
                      iOS nécessite iOS 16.4+ et l'app installée sur l'écran d'accueil
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Onglet Admin */}
        {activeTab === 'admin' && (
          <div>
            <div className="card-relief rounded-2xl p-6 mb-6 text-center">
              <img src={LOGO_URL} alt="DYNO" className="w-28 h-28 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#D4AF37] mb-2">Espace Admin</h2>
              {!isAdmin ? (
                <p className="text-gray-400">Connecte-toi pour gérer</p>
              ) : (
                <p className="text-green-400">👑 Connecté en tant qu'admin</p>
              )}
            </div>

            {!isAdmin ? (
              <div className="card-relief rounded-xl p-6">
                <h3 className="text-lg font-bold text-[#D4AF37] mb-4">🔐 Admin</h3>
                <input type="password" placeholder="Mot de passe" value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 mb-4 text-white" />
                <button onClick={handleAdminLogin} className="btn-gold w-full py-3 rounded-lg">Se connecter</button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="card-relief rounded-xl p-6">
                  <h3 className="text-lg font-bold text-[#D4AF37] mb-4">➕ Ajouter un Match</h3>
                  <input type="text" placeholder="Adversaire" value={nouveauMatch.adversaire}
                    onChange={(e) => setNouveauMatch({...nouveauMatch, adversaire: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 mb-3 text-white" />
                  <input type="date" value={nouveauMatch.date}
                    onChange={(e) => setNouveauMatch({...nouveauMatch, date: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 mb-3 text-white" />
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input type="time" placeholder="Horaire 1" value={nouveauMatch.horaire1}
                      onChange={(e) => setNouveauMatch({...nouveauMatch, horaire1: e.target.value})}
                      className="bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 text-white" />
                    <input type="time" placeholder="Horaire 2" value={nouveauMatch.horaire2}
                      onChange={(e) => setNouveauMatch({...nouveauMatch, horaire2: e.target.value})}
                      className="bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <select value={nouveauMatch.arene}
                      onChange={(e) => setNouveauMatch({...nouveauMatch, arene: e.target.value})}
                      className="bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 text-white">
                      <option value="Arène 1">Arène 1</option>
                      <option value="Arène 2">Arène 2</option>
                    </select>
                    <select value={nouveauMatch.type}
                      onChange={(e) => setNouveauMatch({...nouveauMatch, type: e.target.value})}
                      className="bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 text-white">
                      <option value="Ligue">Ligue</option>
                      <option value="Scrim">Scrim</option>
                      <option value="Tournoi">Tournoi</option>
                    </select>
                  </div>
                  <button onClick={ajouterMatch} className="btn-gold w-full py-3 rounded-lg">Ajouter</button>
                </div>

                {/* 🎬 Ajouter un Replay */}
                <div className="card-relief rounded-xl p-6">
                  <h3 className="text-lg font-bold text-[#D4AF37] mb-4">🎬 Ajouter un Replay</h3>
                  <input type="text" placeholder="Titre de la vidéo" value={nouveauReplay.titre}
                    onChange={(e) => setNouveauReplay({...nouveauReplay, titre: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 mb-3 text-white" />
                  <input type="text" placeholder="Adversaire" value={nouveauReplay.adversaire}
                    onChange={(e) => setNouveauReplay({...nouveauReplay, adversaire: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 mb-3 text-white" />
                  <input type="text" placeholder="Lien YouTube (ex: https://youtu.be/...)" value={nouveauReplay.lien}
                    onChange={(e) => setNouveauReplay({...nouveauReplay, lien: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 mb-3 text-white" />
                  <button onClick={ajouterReplay} className="btn-gold w-full py-3 rounded-lg">Ajouter le replay</button>
                </div>

                {/* ✅ SUPPRIMER DES MATCHS (Admin) */}
                <div className="card-relief rounded-xl p-6">
                  <h3 className="text-lg font-bold text-[#D4AF37] mb-4">🗑️ Supprimer un Match</h3>
                  {matchs.length === 0 ? (
                    <p className="text-gray-500 text-center">Aucun match</p>
                  ) : (
                    <div className="space-y-3">
                      {matchs.map(match => (
                        <div key={match.id} className="bg-[#0a0a0a] rounded-lg p-3 border border-[#D4AF37]/20">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-bold text-[#D4AF37]">{match.adversaire}</p>
                            <span className="text-xs text-gray-400">{match.date}</span>
                          </div>
                          <button 
                            onClick={() => supprimerMatch(match.id)}
                            className="w-full bg-red-900/50 border border-red-500 text-red-400 py-2 rounded-lg text-sm hover:bg-red-900 transition"
                          >
                            🗑️ Supprimer ce match
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card-relief rounded-xl p-6">
                  <h3 className="text-lg font-bold text-[#D4AF37] mb-4">👥 Ajouter un Joueur</h3>
                  <input type="text" placeholder="Pseudo" value={nouveauJoueur.pseudo}
                    onChange={(e) => setNouveauJoueur({...nouveauJoueur, pseudo: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 mb-3 text-white" />
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <select value={nouveauJoueur.role}
                      onChange={(e) => setNouveauJoueur({...nouveauJoueur, role: e.target.value})}
                      className="bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 text-white">
                      <option value="Joueur">Joueur</option>
                      <option value="Capitaine">Capitaine</option>
                      <option value="Coach">Coach</option>
                      <option value="Manager">Manager</option>
                    </select>
                    <input type="text" placeholder="Rang (ex: Diamond)" value={nouveauJoueur.rang}
                      onChange={(e) => setNouveauJoueur({...nouveauJoueur, rang: e.target.value})}
                      className="bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 text-white" />
                  </div>
                  <button onClick={ajouterJoueur} className="btn-gold w-full py-3 rounded-lg">Ajouter</button>
                </div>

                <div className="card-relief rounded-xl p-6">
                  <h3 className="text-lg font-bold text-[#D4AF37] mb-4">📊 Scores</h3>
                  {prochainsMatchs.length === 0 ? (
                    <p className="text-gray-500 text-center">Aucun match</p>
                  ) : (
                    <div className="space-y-3">
                      {prochainsMatchs.map(match => (
                        <div key={match.id} className="bg-[#0a0a0a] rounded-lg p-3 border border-[#D4AF37]/20">
                          <p className="font-bold text-[#D4AF37] mb-2">{match.adversaire}</p>
                          {scoreEdit?.id === match.id ? (
                            <div>
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                <input type="number" placeholder="DYNO" value={scoreEdit.scoreDyno}
                                  onChange={(e) => setScoreEdit({...scoreEdit, scoreDyno: e.target.value})}
                                  className="bg-[#1a1a1a] border border-[#D4AF37]/30 rounded px-3 py-2 text-white text-center" />
                                <input type="number" placeholder="Adv" value={scoreEdit.scoreAdv}
                                  onChange={(e) => setScoreEdit({...scoreEdit, scoreAdv: e.target.value})}
                                  className="bg-[#1a1a1a] border border-[#D4AF37]/30 rounded px-3 py-2 text-white text-center" />
                              </div>
                              <div className="flex gap-2">
                                <button onClick={updateScore} className="btn-gold flex-1 py-2 rounded text-sm">Valider</button>
                                <button onClick={() => setScoreEdit(null)} className="border border-gray-600 flex-1 py-2 rounded text-sm text-gray-400">Annuler</button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => setScoreEdit({id: match.id, scoreDyno: '', scoreAdv: ''})}
                              className="btn-gold w-full py-2 rounded text-sm">Mettre le score</button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={() => setIsAdmin(false)} className="w-full border border-red-500 text-red-500 py-3 rounded-lg">Déconnexion</button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-[#D4AF37]/30">
        <div className="max-w-lg mx-auto flex">
          <button onClick={() => setActiveTab('matchs')} className={`flex-1 py-4 text-center ${activeTab === 'matchs' ? 'text-[#D4AF37]' : 'text-gray-500'}`}>📅 Matchs</button>
          <button onClick={() => setActiveTab('historique')} className={`flex-1 py-4 text-center ${activeTab === 'historique' ? 'text-[#D4AF37]' : 'text-gray-500'}`}>📜 Historique</button>
          <button onClick={() => setActiveTab('rec')} className={`flex-1 py-4 text-center ${activeTab === 'rec' ? 'text-[#D4AF37]' : 'text-gray-500'}`}>🎬 Rec</button>
          <button onClick={() => setActiveTab('roster')} className={`flex-1 py-4 text-center ${activeTab === 'roster' ? 'text-[#D4AF37]' : 'text-gray-500'}`}>👥 Roster</button>
          <button onClick={() => setActiveTab('stats')} className={`flex-1 py-4 text-center ${activeTab === 'stats' ? 'text-[#D4AF37]' : 'text-gray-500'}`}>📊 Stats</button>
          <button onClick={() => setActiveTab('admin')} className={`flex-1 py-4 text-center ${activeTab === 'admin' ? 'text-[#D4AF37]' : 'text-gray-500'}`}>⚙️ Admin</button>
        </div>
      </nav>

      {/* Modal Compte */}
      {!user && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="card-relief rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-[#D4AF37] mb-4 text-center">{isSignUp ? '📝 Créer un compte' : '👤 Connexion'}</h3>
            
            {isSignUp && (
              <input type="text" placeholder="Pseudo" value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 mb-3 text-white" />
            )}
            
            <input type="email" placeholder="Email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 mb-3 text-white" />
            
            <input type="password" placeholder="Mot de passe" value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 mb-3 text-white" />
            
            {/* ✅ BOUTON "SE SOUVENIR DE MOI" */}
            <div className="flex items-center gap-2 mb-4">
              <input 
                type="checkbox" 
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-[#D4AF37]"
              />
              <label htmlFor="rememberMe" className="text-sm text-gray-400">
                📝 Se souvenir de moi
              </label>
            </div>
            
            {authLoading ? (
              <button disabled className="w-full bg-gray-600 text-gray-400 py-3 rounded-lg font-bold">⏳...</button>
            ) : isSignUp ? (
              <button onClick={handleSignUp} className="btn-gold w-full py-3 rounded-lg font-bold mb-3">✅ Créer</button>
            ) : (
              <button onClick={handleSignIn} className="btn-gold w-full py-3 rounded-lg font-bold mb-3">🔐 Connexion</button>
            )}
            
            <div className="border-t border-gray-700 pt-3">
              {isSignUp ? (
                <button onClick={() => setIsSignUp(false)} className="w-full text-[#D4AF37] text-sm">Déjà un compte ? Se connecter</button>
              ) : (
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
