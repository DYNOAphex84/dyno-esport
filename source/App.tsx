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

// Initialiser Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

setPersistence(auth, browserLocalPersistence)

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1489600048474886295/HfR7YhCRuDpjN6NCw133bShUF9Gj1gak-fWtTYVYgI2G_gllQ001kRfH0w57mUuCTytp'
const YOUTUBE_CHANNEL = 'https://youtube.com/@jonathanla890?si=wQkLpwEqKA7Dpuc8'
const LOGO_URL = 'https://i.imgur.com/gTLj57a.png'
const ADMIN_EMAIL = 'thibaut.llorens@hotmail.com'

// 🗺️ Maps EVA avec placeholders colorés
const EVA_MAPS = [
  { id: 'artefact', name: 'Artefact', color: '#5D4E37', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'atlantis', name: 'Atlantis', color: '#1a3a52', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'ceres', name: 'Ceres', color: '#3a3a3a', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'engine', name: 'Engine', color: '#4a3a2a', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'helios', name: 'Helios', color: '#524a1a', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'horizon', name: 'Horizon', color: '#2a4a3a', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'lunar', name: 'Lunar', color: '#2a2a3a', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'outlaw', name: 'Outlaw', color: '#8B4513', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'polaris', name: 'Polaris', color: '#2a3a4a', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'silva', name: 'Silva', color: '#2a4a2a', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' },
  { id: 'cliff', name: 'Cliff', color: '#8B4513', evaUrl: 'https://evabattleplan.com/fr/tools/battleplan' }
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <img src={LOGO_URL} alt="DYNO" className="w-56 h-56 mx-auto animate-pulse" />
          <h1 className="text-4xl font-bold text-[#D4AF37] mt-6">DYNO</h1>
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
            <div><h1 className="text-xl font-bold text-[#D4AF37]">DYNO</h1><p className="text-xs text-gray-400">Esport Team</p></div>
          </div>
          {user ? (<button onClick={handleSignOut} className="px-4 py-2 rounded-lg font-medium border border-red-500 text-red-500">👋 {pseudo}</button>) : (<button onClick={() => setIsSignUp(false)} className="px-4 py-2 rounded-lg font-medium btn-gold">👤 Compte</button>)}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {activeTab === 'matchs' && (
          <div>
            <div className="card-relief rounded-2xl p-6 mb-6 text-center">
              <img src={LOGO_URL} alt="DYNO" className="w-20 h-20 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#D4AF37] mb-2">Prochains Matchs</h2>
            </div>
            {loading ? (<div className="text-center py-10 text-[#D4AF37]">⏳...</div>) : prochainsMatchs.length === 0 ? (<div className="text-center py-10 text-gray-500">📭 Aucun match</div>) : (
              <div className="space-y-4">
                {prochainsMatchs.map(match => (
                  <div key={match.id} className="card-relief rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${match.type === 'Ligue' ? 'bg-blue-900/50 text-blue-400' : 'bg-green-900/50 text-green-400'}`}>{match.type}</span>
                      <span className="text-[#D4AF37] font-bold">{match.date}</span>
                    </div>
                    <div className="flex items-center gap-4 mb-3">
                      <img src={LOGO_URL} alt="DYNO" className="w-12 h-12" />
                      <span className="text-gray-500">VS</span>
                      <div className="flex-1 text-right"><p className="font-bold">{match.adversaire}</p><p className="text-sm text-[#D4AF37]">🏟️ {match.arene}</p></div>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-lg p-3 mb-3 border border-[#D4AF37]/20">
                      <p className="text-xs text-gray-400">⏰ Horaires</p>
                      <p className="text-[#D4AF37] font-bold">{[match.horaire1, match.horaire2].filter(Boolean).join(' / ')}</p>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-lg p-3 mb-3 border border-[#D4AF37]/20">
                      <p className="text-xs text-gray-400">👥 Disponibles ({match.disponibles.length})</p>
                      {match.disponibles.length > 0 && (<div className="flex flex-wrap gap-2 mt-2">{match.disponibles.map((p, i) => (<span key={i} className="bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-1 rounded text-xs font-bold">{p}</span>))}</div>)}
                    </div>
                    <button onClick={() => toggleDisponibilite(match.id)} disabled={!user} className={`w-full py-3 rounded-lg font-bold ${!user ? 'bg-gray-700 text-gray-400' : match.disponibles.includes(pseudo) ? 'bg-[#D4AF37] text-black' : 'border border-[#D4AF37] text-[#D4AF37]'}`}>{!user ? '🔐 Connecte-toi' : match.disponibles.includes(pseudo) ? '✅ Je suis disponible' : '📅 Je me marque'}</button>
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
                <div className="text-center"><p className="text-3xl font-bold text-red-500">{defaites}</p><p className="text-xs text-gray-400">Défaites</p></div>
              </div>
            </div>
            {historique.length === 0 ? (<div className="text-center py-10 text-gray-500">📜 Aucun match</div>) : (
              <div className="space-y-4">
                {historique.map(match => (
                  <div key={match.id} className="card-relief rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${(match.scoreDyno || 0) > (match.scoreAdversaire || 0) ? 'bg-[#D4AF37] text-black' : 'bg-red-900/50 text-red-400'}`}>{(match.scoreDyno || 0) > (match.scoreAdversaire || 0) ? '🏆 VICTOIRE' : '❌ DÉFAITE'}</span>
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
            {historique.length === 0 ? (<div className="text-center py-10 text-gray-500">📊 Aucun match</div>) : (
              <div className="space-y-4">
                {historique.map(match => {
                  const matchNotes = notes.filter(n => n.matchId === match.id)
                  return (
                    <div key={match.id} className="card-relief rounded-xl p-4">
                      <p className="font-bold text-[#D4AF37] mb-2">{match.adversaire} - {match.date}</p>
                      {matchNotes.length > 0 ? (
                        <div className="space-y-2">
                          {matchNotes.map(note => (
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
                      ) : (<p className="text-gray-500 text-sm">Aucune note</p>)}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* 🗺️ ONGLET MAPS */}
        {activeTab === 'maps' && (
          <div>
            <div className="card-relief rounded-2xl p-6 mb-6 text-center">
              <img src={LOGO_URL} alt="DYNO" className="w-20 h-20 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#D4AF37] mb-2">🗺️ Maps EVA</h2>
              <p className="text-gray-400 text-sm">Clique sur une map pour ouvrir EVA Battle Plan</p>
            </div>
            
            {/* Grille des maps */}
            <div className="grid grid-cols-2 gap-4">
              {EVA_MAPS.map(map => (
                <div 
                  key={map.id} 
                  className="card-relief rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition"
                  onClick={() => window.open(map.evaUrl, '_blank')}
                >
                  <div className="relative">
                    <div className="w-full h-32" style={{ backgroundColor: map.color }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <p className="absolute bottom-2 left-2 text-white font-bold text-sm">{map.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'rec' && (
          <div>
            <div className="card-relief rounded-2xl p-6 mb-6 text-center">
              <img src={LOGO_URL} alt="DYNO" className="w-20 h-20 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#D4AF37] mb-2">🎬 Replays</h2>
              <a href={YOUTUBE_CHANNEL} target="_blank" className="btn-gold inline-block px-6 py-3 rounded-lg font-bold">🔴 S'abonner YouTube</a>
            </div>
            {replays.length === 0 ? (<div className="text-center py-10 text-gray-500">📹 Aucun replay</div>) : (
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
                    <div className="flex-1"><p className="font-bold text-[#D4AF37]">{joueur.pseudo}</p><p className="text-sm text-gray-400">🎮 {joueur.role}</p></div>
                    {isAdmin && <button onClick={() => supprimerJoueur(joueur.id)} className="text-red-400 text-xs">🗑️</button>}
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
                  <button onClick={ajouterMatch} className="btn-gold w-full py-3 rounded-lg">Ajouter + Discord</button>
                </div>
                <div className="card-relief rounded-xl p-6">
                  <h3 className="text-lg font-bold text-[#D4AF37] mb-4">🎬 Replay</h3>
                  <input type="text" placeholder="Titre" value={nouveauReplay.titre} onChange={(e) => setNouveauReplay({...nouveauReplay, titre: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 mb-3 text-white" />
                  <input type="text" placeholder="Lien YouTube" value={nouveauReplay.lien} onChange={(e) => setNouveauReplay({...nouveauReplay, lien: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 mb-3 text-white" />
                  <button onClick={ajouterReplay} className="btn-gold w-full py-3 rounded-lg">Ajouter</button>
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
          <button onClick={() => setActiveTab('maps')} className={`flex-1 py-4 text-center ${activeTab === 'maps' ? 'text-[#D4AF37]' : 'text-gray-500'}`}>🗺️</button>
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
            {isSignUp ? (<button onClick={handleSignUp} className="btn-gold w-full py-3 rounded-lg font-bold mb-3">✅ Créer</button>) : (<button onClick={handleSignIn} className="btn-gold w-full py-3 rounded-lg font-bold mb-3">🔐 Connexion</button>)}
            <div className="border-t border-gray-700 pt-3">
              {isSignUp ? (<button onClick={() => setIsSignUp(false)} className="w-full text-[#D4AF37] text-sm">Déjà un compte ?</button>) : (<button onClick={() => setIsSignUp(true)} className="w-full text-[#D4AF37] text-sm">Pas de compte ?</button>)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
