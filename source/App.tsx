import { useState, useEffect } from 'react'

interface Match {
  id: number
  adversaire: string
  date: string
  heure: string
  type: 'Ligue' | 'Scrim' | 'Tournoi'
  scoreDyno?: number
  scoreAdversaire?: number
  termine: boolean
}

const LOGO_URL = 'https://i.imgur.com/DyKOdtX.png'

function App() {
  const [activeTab, setActiveTab] = useState<'matchs' | 'historique' | 'admin'>('matchs')
  const [isAdmin, setIsAdmin] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [password, setPassword] = useState('')
  const [showSplash, setShowSplash] = useState(true)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)

  // ✅ TABLEAU VIDE - 0 MATCH AU DÉPART
  const [matchs, setMatchs] = useState<Match[]>([])

  const [nouveauMatch, setNouveauMatch] = useState({
    adversaire: '',
    date: '',
    heure: '',
    type: 'Ligue' as 'Ligue' | 'Scrim' | 'Tournoi'
  })

  const [scoreEdit, setScoreEdit] = useState<{id: number, scoreDyno: string, scoreAdv: string} | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    })
  }, [])

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then(() => {
        setShowInstall(false)
        setDeferredPrompt(null)
      })
    }
  }

  const handleLogin = () => {
    if (password === 'dyno2026') {
      setIsAdmin(true)
      setShowLogin(false)
      setPassword('')
    } else {
      alert('❌ Mot de passe incorrect !')
    }
  }

  const ajouterMatch = () => {
    if (!nouveauMatch.adversaire || !nouveauMatch.date || !nouveauMatch.heure) {
      alert('⚠️ Remplis tous les champs !')
      return
    }
    const match: Match = {
      id: Date.now(),
      ...nouveauMatch,
      termine: false
    }
    setMatchs([match, ...matchs])
    setNouveauMatch({ adversaire: '', date: '', heure: '', type: 'Ligue' })
    alert('✅ Match ajouté !')
  }

  const updateScore = () => {
    if (!scoreEdit) return
    setMatchs(matchs.map(m => 
      m.id === scoreEdit.id 
        ? { ...m, scoreDyno: parseInt(scoreEdit.scoreDyno), scoreAdversaire: parseInt(scoreEdit.scoreAdv), termine: true }
        : m
    ))
    setScoreEdit(null)
    alert('✅ Score mis à jour !')
  }

  const victoires = matchs.filter(m => m.termine && (m.scoreDyno || 0) > (m.scoreAdversaire || 0)).length
  const defaites = matchs.filter(m => m.termine && (m.scoreDyno || 0) < (m.scoreAdversaire || 0)).length
  const nuls = matchs.filter(m => m.termine && (m.scoreDyno || 0) === (m.scoreAdversaire || 0)).length

  const prochainsMatchs = matchs.filter(m => !m.termine)
  const historique = matchs.filter(m => m.termine)

  if (showSplash) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <img src={LOGO_URL} alt="DYNO Logo" className="w-56 h-56 mx-auto animate-pulse-gold" />
          <h1 className="text-4xl font-bold text-[#D4AF37] mt-6 animate-glow">DYNO</h1>
          <p className="text-gray-400 mt-2">Esport Team</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
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
            {showInstall && (
              <button onClick={handleInstall} className="btn-gold px-3 py-1.5 rounded-lg text-sm">
                📲 Installer
              </button>
            )}
            <button 
              onClick={() => isAdmin ? setIsAdmin(false) : setShowLogin(true)}
              className={`px-4 py-2 rounded-lg font-medium transition ${isAdmin ? 'bg-[#D4AF37] text-black' : 'border border-[#D4AF37] text-[#D4AF37]'}`}
            >
              {isAdmin ? '👑 Admin' : '🔐'}
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-lg mx-auto px-4 py-6">
        
        {/* Onglet Matchs */}
        {activeTab === 'matchs' && (
          <div>
            <div className="card-relief rounded-2xl p-6 mb-6 text-center">
              <img src={LOGO_URL} alt="DYNO" className="w-20 h-20 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#D4AF37] mb-2">Prochains Matchs</h2>
              <p className="text-gray-400 text-sm">Restez prêts pour la victoire</p>
            </div>

            {prochainsMatchs.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <p>📭 Aucun match prévu pour le moment</p>
                <p className="text-sm mt-2">Ajoute un match via l'onglet Admin</p>
              </div>
            ) : (
              <div className="space-y-4">
                {prochainsMatchs.map(match => (
                  <div key={match.id} className="card-relief rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        match.type === 'Ligue' ? 'bg-blue-900/50 text-blue-400' :
                        match.type === 'Scrim' ? 'bg-green-900/50 text-green-400' :
                        'bg-purple-900/50 text-purple-400'
                      }`}>
                        {match.type}
                      </span>
                      <span className="text-[#D4AF37] font-bold">{match.date}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <img src={LOGO_URL} alt="DYNO" className="w-12 h-12" />
                      <span className="text-xs text-gray-500">VS</span>
                      <div className="flex-1 text-right">
                        <p className="font-bold text-lg">{match.adversaire}</p>
                        <p className="text-sm text-gray-400">⏰ {match.heure}</p>
                      </div>
                    </div>
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
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#D4AF37]">{victoires}</p>
                  <p className="text-xs text-gray-400">Victoires</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#D4AF37]">{nuls}</p>
                  <p className="text-xs text-gray-400">Nuls</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-500">{defaites}</p>
                  <p className="text-xs text-gray-400">Défaites</p>
                </div>
              </div>
            </div>

            {historique.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <p>📜 Aucun match joué pour le moment</p>
                <p className="text-sm mt-2">Les résultats apparaîtront ici</p>
              </div>
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
                        }`}>
                          {victoire ? '🏆 VICTOIRE' : nul ? '🤝 NUL' : '❌ DÉFAITE'}
                        </span>
                        <span className="text-gray-400 text-sm">{match.date}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <p className="font-bold text-[#D4AF37]">DYNO</p>
                          <p className="text-3xl font-bold text-[#D4AF37]">{match.scoreDyno}</p>
                        </div>
                        <span className="text-gray-600 text-xl">-</span>
                        <div className="text-center">
                          <p className="font-bold text-gray-400">{match.adversaire}</p>
                          <p className="text-3xl font-bold text-gray-400">{match.scoreAdversaire}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Onglet Admin */}
        {activeTab === 'admin' && (
          <div>
            <div className="card-relief rounded-2xl p-6 mb-6 text-center">
              <img src={LOGO_URL} alt="DYNO" className="w-28 h-28 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#D4AF37] mb-2">Espace Admin</h2>
              {!isAdmin ? (
                <p className="text-gray-400">Connecte-toi pour gérer les matchs</p>
              ) : (
                <p className="text-green-400">👑 Connecté en tant qu'admin</p>
              )}
            </div>

            {!isAdmin ? (
              <div className="card-relief rounded-xl p-6">
                <h3 className="text-lg font-bold text-[#D4AF37] mb-4">🔐 Connexion Admin</h3>
                <input
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 mb-4 text-white focus:outline-none focus:border-[#D4AF37]"
                />
                <button onClick={handleLogin} className="btn-gold w-full py-3 rounded-lg">
                  Se connecter
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="card-relief rounded-xl p-6">
                  <h3 className="text-lg font-bold text-[#D4AF37] mb-4">➕ Ajouter un Match</h3>
                  <input
                    type="text"
                    placeholder="Nom de l'adversaire"
                    value={nouveauMatch.adversaire}
                    onChange={(e) => setNouveauMatch({...nouveauMatch, adversaire: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 mb-3 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      type="date"
                      value={nouveauMatch.date}
                      onChange={(e) => setNouveauMatch({...nouveauMatch, date: e.target.value})}
                      className="bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                    <input
                      type="time"
                      value={nouveauMatch.heure}
                      onChange={(e) => setNouveauMatch({...nouveauMatch, heure: e.target.value})}
                      className="bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <select
                    value={nouveauMatch.type}
                    onChange={(e) => setNouveauMatch({...nouveauMatch, type: e.target.value as any})}
                    className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 mb-4 text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Ligue">Ligue</option>
                    <option value="Scrim">Scrim</option>
                    <option value="Tournoi">Tournoi</option>
                  </select>
                  <button onClick={ajouterMatch} className="btn-gold w-full py-3 rounded-lg">
                    Ajouter le match
                  </button>
                </div>

                <div className="card-relief rounded-xl p-6">
                  <h3 className="text-lg font-bold text-[#D4AF37] mb-4">📊 Mettre à jour un Score</h3>
                  {prochainsMatchs.length === 0 ? (
                    <p className="text-gray-500 text-center">Aucun match en cours</p>
                  ) : (
                    <div className="space-y-3">
                      {prochainsMatchs.map(match => (
                        <div key={match.id} className="bg-[#0a0a0a] rounded-lg p-3 border border-[#D4AF37]/20">
                          <p className="font-bold text-[#D4AF37] mb-2">{match.adversaire}</p>
                          {scoreEdit?.id === match.id ? (
                            <div>
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                <input
                                  type="number"
                                  placeholder="Score DYNO"
                                  value={scoreEdit.scoreDyno}
                                  onChange={(e) => setScoreEdit({...scoreEdit, scoreDyno: e.target.value})}
                                  className="bg-[#1a1a1a] border border-[#D4AF37]/30 rounded px-3 py-2 text-white text-center"
                                />
                                <input
                                  type="number"
                                  placeholder="Score Adv"
                                  value={scoreEdit.scoreAdv}
                                  onChange={(e) => setScoreEdit({...scoreEdit, scoreAdv: e.target.value})}
                                  className="bg-[#1a1a1a] border border-[#D4AF37]/30 rounded px-3 py-2 text-white text-center"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button onClick={updateScore} className="btn-gold flex-1 py-2 rounded text-sm">Valider</button>
                                <button onClick={() => setScoreEdit(null)} className="border border-gray-600 flex-1 py-2 rounded text-sm text-gray-400">Annuler</button>
                              </div>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setScoreEdit({id: match.id, scoreDyno: '', scoreAdv: ''})}
                              className="btn-gold w-full py-2 rounded text-sm"
                            >
                              Mettre le score
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setIsAdmin(false)}
                  className="w-full border border-red-500 text-red-500 py-3 rounded-lg"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Navigation du bas */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-[#D4AF37]/30">
        <div className="max-w-lg mx-auto flex">
          <button 
            onClick={() => setActiveTab('matchs')}
            className={`flex-1 py-4 text-center transition ${activeTab === 'matchs' ? 'text-[#D4AF37]' : 'text-gray-500'}`}
          >
            📅 Matchs
          </button>
          <button 
            onClick={() => setActiveTab('historique')}
            className={`flex-1 py-4 text-center transition ${activeTab === 'historique' ? 'text-[#D4AF37]' : 'text-gray-500'}`}
          >
            📜 Historique
          </button>
          <button 
            onClick={() => setActiveTab('admin')}
            className={`flex-1 py-4 text-center transition ${activeTab === 'admin' ? 'text-[#D4AF37]' : 'text-gray-500'}`}
          >
            ⚙️ Admin
          </button>
        </div>
      </nav>

      {/* Modal Login */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="card-relief rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-[#D4AF37] mb-4 text-center">🔐 Admin</h3>
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg px-4 py-3 mb-4 text-white focus:outline-none focus:border-[#D4AF37]"
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowLogin(false); setPassword('') }} className="flex-1 border border-gray-600 py-3 rounded-lg text-gray-400">
                Annuler
              </button>
              <button onClick={handleLogin} className="flex-1 btn-gold py-3 rounded-lg">
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
