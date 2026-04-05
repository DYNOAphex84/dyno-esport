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

setPersistence(auth, browserLocalPersistence)

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1489600048474886295/HfR7YhCRuDpjN6NCw133bShUF9Gj1gak-fWtTYVYgI2G_gllQ001kRfH0w57mUuCTytp'
const YOUTUBE_CHANNEL = 'https://youtube.com/@jonathanla890?si=wQkLpwEqKA7Dpuc8'
const LOGO_URL = 'https://i.imgur.com/gTLj57a.png'
const ADMIN_EMAIL = 'thibaut.llorens@hotmail.com'

const EVA_MAPS = [
  { id: 'artefact', name: 'Artefact', color: 'from-[#5D4E37] to-[#3D2E17]', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'atlantis', name: 'Atlantis', color: 'from-[#1a3a52] to-[#0a1a2a]', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'ceres', name: 'Ceres', color: 'from-[#3a3a3a] to-[#1a1a1a]', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'engine', name: 'Engine', color: 'from-[#4a3a2a] to-[#2a1a0a]', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'helios', name: 'Helios', color: 'from-[#524a1a] to-[#322a0a]', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'horizon', name: 'Horizon', color: 'from-[#2a4a3a] to-[#0a2a1a]', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'lunar', name: 'Lunar', color: 'from-[#2a2a3a] to-[#0a0a1a]', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'outlaw', name: 'Outlaw', color: 'from-[#8B4513] to-[#5B2503]', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'polaris', name: 'Polaris', color: 'from-[#2a3a4a] to-[#0a1a2a]', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'silva', name: 'Silva', color: 'from-[#2a4a2a] to-[#0a2a0a]', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'cliff', name: 'Cliff', color: 'from-[#8B4513] to-[#5B2503]', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' }
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
  const [selectedMap, setSelectedMap] = useState(null)
  const [nouveauMatch, setNouveauMatch] = useState({ adversaire: '', date: '', horaire1: '', horaire2: '', arene: 'Arène 1', type: 'Ligue' })
  const [scoreEdit, setScoreEdit] = useState(null)
  const [nouveauReplay, setNouveauReplay] = useState({ titre: '', lien: '' })
  const [nouvelleNote, setNouvelleNote] = useState({ matchId: '', mental: '', communication: '', gameplay: '' })
  const [selectedMatchForNotes, setSelectedMatchForNotes] = useState(null)

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
          setPseudo(userDoc.data().pseudo)
          if (userDoc.data().isAdmin) {
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
    const timer = setTimeout(() => setShowSplash(false), 2000)
    return () => clearTimeout(timer)
  }, [])

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
    } catch (error) { alert('❌ ' + error.message) }
  }

  const handleSignIn = async () => {
    if (!email || !authPassword) { alert('⚠️ Remplis tout !'); return }
    try {
      await signInWithEmailAndPassword(auth, email, authPassword)
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
          { name: '🏟️ Arène', value: nouveauMatch.arene, inline: true }
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
    alert('✅ Note ajoutée !')
  }

  const supprimerMatch = async (id) => { await deleteDoc(doc(db, 'matchs', id)); alert('✅ Supprimé !') }
  const supprimerReplay = async (id) => { await deleteDoc(doc(db, 'replays', id)); alert('✅ Supprimé !') }
  const supprimerJoueur = async (id) => { await deleteDoc(doc(db, 'players', id)); alert('✅ Supprimé !') }

  const updateScore = async () => {
    await updateDoc(doc(db, 'matchs', scoreEdit.id), { scoreDyno: parseInt(scoreEdit.scoreDyno), scoreAdversaire: parseInt(scoreEdit.scoreAdv), termine: true })
    setScoreEdit(null)
    alert('✅ Score mis à jour !')
  }

  const toggleDisponibilite = async (matchId) => {
    if (!user) return
    const match = matchs.find(m => m.id === matchId)
    const estDispo = match.disponibles.includes(pseudo)
    await updateDoc(doc(db, 'matchs', matchId), { disponibles: estDispo ? match.disponibles.filter(p => p !== pseudo) : [...match.disponibles, pseudo] })
  }

  const victoires = matchs.filter(m => m.termine && (m.scoreDyno || 0) > (m.scoreAdversaire || 0)).length
  const defaites = matchs.filter(m => m.termine && (m.scoreDyno || 0) < (m.scoreAdversaire || 0)).length
  const totalMatchs = victoires + defaites
  const winRate = totalMatchs > 0 ? Math.round((victoires / totalMatchs) * 100) : 0
  const prochainsMatchs = matchs.filter(m => !m.termine)
  const historique = matchs.filter(m => m.termine)

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
                {prochainsMatchs.map(match => (
                  <div key={match.id} className="backdrop-blur-xl bg-black/40 rounded-2xl p-5 border border-[#D4AF37]/20 shadow-xl hover:shadow-[#D4AF37]/20 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${match.type === 'Ligue' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' : match.type === 'Scrim' ? 'bg-gradient-to-r from-green-600 to-green-700 text-white' : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'} shadow-lg`}>{match.type}</span>
                      <span className="text-[#D4AF37] font-bold">{match.date}</span>
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
                {historique.map(match => (
                  <div key={match.id} className="backdrop-blur-xl bg-black/40 rounded-2xl p-5 border border-[#D4AF37]/20 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${(match.scoreDyno || 0) > (match.scoreAdversaire || 0) ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black' : 'bg-gradient-to-r from-red-600 to-red-700 text-white'} shadow-lg`}>{(match.scoreDyno || 0) > (match.scoreAdversaire || 0) ? '🏆 VICTOIRE' : '❌ DÉFAITE'}</span>
                      <span className="text-gray-400 text-sm">{match.date}</span>
                    </div>
                    <div className="flex items-center justify-between">
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
                  </div>
                ))}
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
                {historique.map(match => {
                  const matchNotes = notes.filter(n => n.matchId === match.id)
                  return (
                    <div key={match.id} className="backdrop-blur-xl bg-black/40 rounded-2xl p-5 border border-[#D4AF37]/20 shadow-xl">
                      <p className="font-bold text-[#D4AF37] mb-3 text-lg">{match.adversaire} - {match.date}</p>
                      {matchNotes.length > 0 ? (
                        <div className="space-y-3">
                          {matchNotes.map(note => (
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

        {activeTab === 'maps' && (
          <div>
            <div className="relative rounded-3xl p-8 mb-6 text-center overflow-hidden bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 border border-[#D4AF37]/20 shadow-2xl">
              <img src={LOGO_URL} alt="DYNO" className="w-24 h-24 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-2">🗺️ Maps EVA</h2>
              <p className="text-gray-400 text-sm">Clique pour ouvrir EVA Battle Plan</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {EVA_MAPS.map(map => (
                <div 
                  key={map.id} 
                  className="relative rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-all shadow-xl hover:shadow-2xl group"
                  onClick={() => window.open(map.evaUrl, '_blank')}
                >
                  <div className={`w-full h-36 bg-gradient-to-br ${map.color}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  <p className="absolute bottom-3 left-3 text-white font-bold text-base drop-shadow-lg">{map.name}</p>
                  <div className="absolute inset-0 bg-[#D4AF37]/0 group-hover:bg-[#D4AF37]/20 transition-all" />
                </div>
              ))}
            </div>
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
                {replays.map(replay => (
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
              {joueurs.filter(j => j.actif !== false).map(joueur => (
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
                  <button onClick={ajouterMatch} className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg hover:shadow-[#D4AF37]/50 transition-all">Ajouter + Discord</button>
                </div>
                <div className="backdrop-blur-xl bg-black/40 rounded-2xl p-6 border border-[#D4AF37]/20 shadow-xl">
                  <h3 className="text-lg font-bold text-[#D4AF37] mb-4 flex items-center gap-2">🎬 Replay</h3>
                  <input type="text" placeholder="Titre" value={nouveauReplay.titre} onChange={(e) => setNouveauReplay({...nouveauReplay, titre: e.target.value})} className="w-full backdrop-blur-xl bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-4 mb-3 text-white focus:outline-none focus:border-[#D4AF37] transition-all" />
                  <input type="text" placeholder="Lien YouTube" value={nouveauReplay.lien} onChange={(e) => setNouveauReplay({...nouveauReplay, lien: e.target.value})} className="w-full backdrop-blur-xl bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-4 mb-3 text-white focus:outline-none focus:border-[#D4AF37] transition-all" />
                  <button onClick={ajouterReplay} className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg hover:shadow-[#D4AF37]/50 transition-all">Ajouter</button>
                </div>
                <div className="backdrop-blur-xl bg-black/40 rounded-2xl p-6 border border-[#D4AF37]/20 shadow-xl">
                  <h3 className="text-lg font-bold text-[#D4AF37] mb-4 flex items-center gap-2">✏️ Scores</h3>
                  {prochainsMatchs.map(match => (
                    <div key={match.id} className="backdrop-blur-xl bg-black/60 rounded-xl p-4 mb-3 border border-[#D4AF37]/20">
                      <p className="font-bold text-[#D4AF37] mb-3">{match.adversaire}</p>
                      <button onClick={() => setScoreEdit({id: match.id, scoreDyno: '', scoreAdv: ''})} className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg">📝 Score</button>
                    </div>
                  ))}
                </div>
                <button onClick={handleAdminLogout} className="w-full border-2 border-red-500 text-red-500 py-4 rounded-xl font-bold hover:bg-red-500/10 transition-all">🚪 Déconnexion</button>
              </div>
            )}

            {/* Modal pour éditer les scores */}
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
          <button onClick={() => setActiveTab('notes')} className={`flex-1 py-5 text-center transition-all ${activeTab === 'notes' ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-gray-500 hover:text-[#D4AF37]'}`}>
            <span className="text-2xl">📊</span>
          </button>
          <button onClick={() => setActiveTab('maps')} className={`flex-1 py-5 text-center transition-all ${activeTab === 'maps' ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-gray-500 hover:text-[#D4AF37]'}`}>
            <span className="text-2xl">🗺️</span>
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
