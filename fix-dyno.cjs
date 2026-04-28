const fs = require('fs')
const path = require('path')

const possiblePaths = [
  path.join(__dirname, 'source', 'App.tsx'),
  path.join(__dirname, 'src', 'App.tsx')
]

const appPath = possiblePaths.find(p => fs.existsSync(p))

if (!appPath) {
  console.error('❌ App.tsx introuvable.')
  console.error('Cherché dans :')
  console.error('- source/App.tsx')
  console.error('- src/App.tsx')
  process.exit(1)
}

let code = fs.readFileSync(appPath, 'utf8')

console.log('📄 Fichier trouvé :', appPath)

/**
 * 1. Corrige l’erreur exacte :
 *    }, [])
 *    useEffect(() => {
 *    if (!notificationsEnabled) return
 *
 * Cette erreur arrive quand un morceau du script a été collé sans le bloc précédent.
 */
const brokenNotificationStart = /\n\s*},\s*\[\]\)\s*\n\s*\n\s*useEffect\(\(\)\s*=>\s*\{\s*\n\s*if\s*\(!notificationsEnabled\)\s*return/

const fixedNotificationStart = `

  const saveAvatar = async () => {
    if (!user || !avatarUrl) return
    await updateDoc(doc(db, 'users', user.uid), { avatarUrl })
    addLog('Avatar URL mis à jour')
    alert('✅ URL enregistrée !')
  }

  useEffect(() => {
    if (window.location.search.includes('reset=1')) {
      localStorage.clear()
      window.location.href = window.location.pathname
    }
  }, [])

  const sendNotification = useCallback((t: string, b: string, tg?: string) => {
    try {
      if (!('Notification' in window) || Notification.permission !== 'granted') return
      const n = new Notification(t, {
        body: b,
        icon: LG,
        badge: LG,
        tag: tg || 'd',
        requireInteraction: false
      })
      n.onclick = () => {
        window.focus()
        n.close()
      }
    } catch {}
  }, [])

  const requestNotificationPermission = async () => {
    try {
      if (!('Notification' in window)) {
        alert('❌')
        return
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
    } catch {
      alert('❌')
    }
  }

  const getMatchDateTime = useCallback((m: any): Date | null => {
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
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    try {
      if (
        'Notification' in window &&
        Notification.permission === 'granted' &&
        localStorage.getItem('dyno-notifs') === 'true'
      ) {
        setNotificationsEnabled(true)
      }
    } catch {}

    try {
      setNotifiedMatchs(JSON.parse(localStorage.getItem('dyno-notified') || '[]'))
    } catch {
      setNotifiedMatchs([])
    }
  }, [])

  useEffect(() => {
    if (!notificationsEnabled) return`

if (brokenNotificationStart.test(code)) {
  code = code.replace(brokenNotificationStart, fixedNotificationStart)
  console.log('✅ Erreur Unexpected "," corrigée.')
} else {
  console.log('ℹ️ Bloc cassé exact non trouvé. Je vérifie une autre forme possible...')

  /**
   * Variante : parfois le fichier contient seulement :
   *   }
   *
   *   }, [])
   *
   *   useEffect(() => {
   */
  const simpleBroken = /\n\s*}\s*\n\s*\n\s*},\s*\[\]\)\s*\n\s*\n\s*useEffect\(\(\)\s*=>\s*\{\s*\n\s*if\s*\(!notificationsEnabled\)\s*return/

  const simpleFixed = `
  }

  const saveAvatar = async () => {
    if (!user || !avatarUrl) return
    await updateDoc(doc(db, 'users', user.uid), { avatarUrl })
    addLog('Avatar URL mis à jour')
    alert('✅ URL enregistrée !')
  }

  useEffect(() => {
    if (window.location.search.includes('reset=1')) {
      localStorage.clear()
      window.location.href = window.location.pathname
    }
  }, [])

  const sendNotification = useCallback((t: string, b: string, tg?: string) => {
    try {
      if (!('Notification' in window) || Notification.permission !== 'granted') return
      const n = new Notification(t, {
        body: b,
        icon: LG,
        badge: LG,
        tag: tg || 'd',
        requireInteraction: false
      })
      n.onclick = () => {
        window.focus()
        n.close()
      }
    } catch {}
  }, [])

  const requestNotificationPermission = async () => {
    try {
      if (!('Notification' in window)) {
        alert('❌')
        return
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
    } catch {
      alert('❌')
    }
  }

  const getMatchDateTime = useCallback((m: any): Date | null => {
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
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    try {
      if (
        'Notification' in window &&
        Notification.permission === 'granted' &&
        localStorage.getItem('dyno-notifs') === 'true'
      ) {
        setNotificationsEnabled(true)
      }
    } catch {}

    try {
      setNotifiedMatchs(JSON.parse(localStorage.getItem('dyno-notified') || '[]'))
    } catch {
      setNotifiedMatchs([])
    }
  }, [])

  useEffect(() => {
    if (!notificationsEnabled) return`

  if (simpleBroken.test(code)) {
    code = code.replace(simpleBroken, simpleFixed)
    console.log('✅ Erreur Unexpected "," corrigée avec la variante simple.')
  } else {
    console.log('⚠️ Je n’ai pas trouvé le bloc cassé automatiquement.')
    console.log('Je continue quand même avec les corrections EVA.')
  }
}

/**
 * 2. Corrige le jeu par défaut.
 */
code = code.replaceAll(`jeu: 'Valorant'`, `jeu: 'EVA Esport Arena'`)
code = code.replaceAll(`jeu: "Valorant"`, `jeu: "EVA Esport Arena"`)
console.log('✅ Jeu par défaut remplacé par EVA Esport Arena.')

/**
 * 3. Vérifie que les maps EVA existent.
 */
const evaMapsConst = `const AM = ['Engine','Helios','Silva','The Cliff','Artefact','Outlaw','Atlantis','Horizon','Polaris','Lunar','Ceres']`

if (!code.includes('const AM =')) {
  const insertAfter = `const AE = 'thibaut.llorens@hotmail.com'`
  if (code.includes(insertAfter)) {
    code = code.replace(insertAfter, `${insertAfter}
${evaMapsConst}`)
    console.log('✅ Constante AM ajoutée.')
  } else {
    console.log('⚠️ Constante AM absente et point d’insertion non trouvé.')
  }
} else {
  console.log('✅ Constante AM déjà présente.')
}

/**
 * 4. Remplace le dropdown Jeu + input Map par :
 *    - badge fixe EVA Esport Arena
 *    - grille de boutons maps EVA
 */
const oldGameMapBlock = `<div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-gray-500 text-[10px] uppercase font-bold mb-1.5 block">🎮 Jeu</label>
                          <select value={newVideo.jeu} onChange={e => setNewVideo(v => ({ ...v, jeu: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none">
                            {['Valorant','CS2','Overwatch 2','Apex Legends','League of Legends','R6 Siege'].map(g => <option key={g} value={g} className="bg-black">{g}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-gray-500 text-[10px] uppercase font-bold mb-1.5 block">🗺️ Map</label>
                          <input type="text" placeholder="Ascent, Mirage..." value={newVideo.map} onChange={e => setNewVideo(v => ({ ...v, map: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none" />
                        </div>
                      </div>`

const newGameMapBlock = `<div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-gray-500 text-[10px] uppercase font-bold mb-1.5 block">🎮 Jeu</label>
                          <div className="w-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl px-3 py-2.5 text-[#D4AF37] text-sm font-bold flex items-center gap-2">
                            <img src={LG} alt="EVA" className="w-5 h-5" />
                            EVA Esport Arena
                          </div>
                        </div>
                        <div>
                          <label className="text-gray-500 text-[10px] uppercase font-bold mb-1.5 block">🗺️ Map</label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {AM.map(m => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => setNewVideo(v => ({ ...v, map: v.map === m ? '' : m }))}
                                className={"px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all border " + (newVideo.map === m ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20' : 'bg-white/5 text-gray-500 border-white/10 hover:border-[#D4AF37]/40')}
                              >
                                {m}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>`

if (code.includes(oldGameMapBlock)) {
  code = code.replace(oldGameMapBlock, newGameMapBlock)
  console.log('✅ Bloc Jeu / Map remplacé.')
} else {
  console.log('ℹ️ Bloc Jeu / Map exact non trouvé. Tentative de remplacement par regex...')

  const gameMapRegex = /<div className="grid grid-cols-2 gap-3">\s*<div>\s*<label className="text-gray-500 text-\[10px\] uppercase font-bold mb-1\.5 block">🎮 Jeu<\/label>\s*<select[\s\S]*?<\/select>\s*<\/div>\s*<div>\s*<label className="text-gray-500 text-\[10px\] uppercase font-bold mb-1\.5 block">🗺️ Map<\/label>\s*<input[\s\S]*?placeholder="Ascent, Mirage\.\.\."[\s\S]*?\/>\s*<\/div>\s*<\/div>/

  if (gameMapRegex.test(code)) {
    code = code.replace(gameMapRegex, newGameMapBlock)
    console.log('✅ Bloc Jeu / Map remplacé avec regex.')
  } else {
    console.log('⚠️ Impossible de remplacer automatiquement le bloc Jeu / Map.')
  }
}

/**
 * 5. Vérifie les fonctions essentielles manquantes.
 */
const requiredSnippets = [
  'const saveAvatar = async',
  'const sendNotification = useCallback',
  'const requestNotificationPermission = async',
  'const getMatchDateTime = useCallback'
]

for (const snippet of requiredSnippets) {
  if (!code.includes(snippet)) {
    console.log(`⚠️ Attention : "${snippet}" semble encore manquant.`)
  } else {
    console.log(`✅ "${snippet}" présent.`)
  }
}

/**
 * 6. Sauvegarde.
 */
fs.writeFileSync(appPath, code, 'utf8')

console.log('')
console.log('✅ Correction terminée.')
console.log('➡️ Lance maintenant : npm run build')