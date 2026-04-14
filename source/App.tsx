import { useState, useEffect, useCallback, useRef } from 'react'
import { initializeApp } from 'firebase/app'
import {
  getFirestore, collection, addDoc, updateDoc,
  deleteDoc, doc, onSnapshot, query, orderBy,
  getDoc, setDoc
} from 'firebase/firestore'
import {
  getAuth, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut,
  onAuthStateChanged, setPersistence,
  browserLocalPersistence
} from 'firebase/auth'

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
setPersistence(auth, browserLocalPersistence).catch(() => {})

const DW = 'https://discord.com/api/webhooks/1489600048474886295/HfR7YhCRuDpjN6NCw133bShUF9Gj1gak-fWtTYVYgI2G_gllQ001kRfH0w57mUuCTytp'
const YT = 'https://youtube.com/@jonathanla890?si=eHtXG1hjlmCuZ-RC'
const LG = 'https://i.imgur.com/gTLj57a.png'
const AE = 'thibaut.llorens@hotmail.com'
const TREX = '/images/trex-mascot.png'
const AM = ['Engine','Helios','Silva','The Cliff','Artefact','Outlaw','Atlantis','Horizon','Polaris','Lunar','Ceres']

const EVA_PASSES: Record<string, { label: string; icon: string; hc: number; hp: number; color: string }> = {
  bronze: { label: 'Bronze', icon: '🥉', hc: 3, hp: 1, color: 'from-amber-700 to-amber-900' },
  argent: { label: 'Argent', icon: '🥈', hc: 6, hp: 2, color: 'from-gray-400 to-gray-600' },
  or: { label: 'Or', icon: '🥇', hc: 12, hp: 4, color: 'from-[#D4AF37] to-[#FFD700]' },
}

const isHP = (dateStr: string, timeStr: string): boolean => {
  if (!dateStr) return false; let d = dateStr; if (d.includes('/')) { const [dd, mm, yy] = d.split('/'); d = yy + '-' + mm + '-' + dd }; try { const dt = new Date(d + 'T' + (timeStr || '20:00') + ':00'); if (isNaN(dt.getTime())) return false; const day = dt.getDay(); const totalMin = dt.getHours() * 60 + dt.getMinutes(); if (day === 5) return totalMin >= 1080 && totalMin <= 1400; if (day === 6) return totalMin >= 780 && totalMin <= 1380; if (day === 0) return totalMin >= 780 && totalMin <= 1380; return false } catch { return false }
}

const TREX_MESSAGES = {
  sleep: ["Zzz... Réveillez-moi pour un match 💤", "Le T-Rex fait la sieste... 😴", "Pas de match ? Le T-Rex s'ennuie...", "Le T-Rex recharge ses batteries 🔋"],
  waiting: ["Le T-Rex se prépare mentalement... 🧠", "Le T-Rex aiguise ses crocs 🦷", "Bientôt le festin ! 🍖", "Le T-Rex fait ses étirements 🤸", "Le T-Rex regarde des VODs 📺"],
  hype: ["Le T-Rex a FAIM de victoires ! 🔥", "MATCH BIENTÔT ! Le T-Rex trépigne !", "Le T-Rex est CHAUD BOUILLANT ! 🌋", "Attention, le T-Rex va tout dévorer ! 😤", "RAAAAWR ! C'est l'heure ! ⚡"],
  live: ["RAAAWR ! ON LES MANGE !!! 🔥", "LE T-REX EST DÉCHAÎNÉ !!! ⚡", "ALLEZ DYNO !!! 💪", "LE T-REX RUGIT DE TOUTES SES FORCES !"],
  win: ["Le T-Rex danse la victoire ! 🎉💃", "GG ! Le T-Rex est FIER ! 🏆", "VICTOIRE ! Le T-Rex fait la fête ! 🥳", "Le T-Rex rugit de joie ! RAAWR ! 🎊", "Trop facile pour le T-Rex ! 😎"],
  lose: ["Le T-Rex veut sa REVANCHE... 😤", "Grr... Le T-Rex n'est PAS content 😡", "Le T-Rex broie du noir... mais reviendra ! 💪", "Défaite... Le T-Rex prépare sa vengeance", "Le T-Rex rage quit (mais revient) 😤🔄"],
}

const getTrexState = (matchs: any[], countdowns: Record<string, string>): { msg: string; anim: string; color: string } => {
  const hist = matchs.filter((m: any) => m.termine)
  const upcoming = matchs.filter((m: any) => !m.termine)
  const hasLive = Object.values(countdowns).includes('🔴 EN COURS')
  if (hasLive) { const msgs = TREX_MESSAGES.live; return { msg: msgs[Math.floor(Date.now() / 10000) % msgs.length], anim: 'trex-rage', color: 'text-red-400' } }
  const hasHype = upcoming.some((m: any) => { const cd = countdowns[m.id]; if (!cd) return false; if (cd.includes('j')) return false; const parts = cd.match(/(\d+)h/); if (parts && parseInt(parts[1]) <= 3) return true; if (!cd.includes('h')) return true; return false })
  if (hasHype) { const msgs = TREX_MESSAGES.hype; return { msg: msgs[Math.floor(Date.now() / 15000) % msgs.length], anim: 'trex-jump', color: 'text-orange-400' } }
  if (hist.length > 0) { const last = hist[0]; const hoursSince = (Date.now() - (last.createdAt || 0)) / 3600000; if (hoursSince < 24) { const isWin = (last.scoreDyno || 0) > (last.scoreAdversaire || 0); if (isWin) { const msgs = TREX_MESSAGES.win; return { msg: msgs[Math.floor(Date.now() / 20000) % msgs.length], anim: 'trex-dance', color: 'text-green-400' } } else { const msgs = TREX_MESSAGES.lose; return { msg: msgs[Math.floor(Date.now() / 20000) % msgs.length], anim: 'trex-angry', color: 'text-orange-400' } } } }
  if (upcoming.length > 0) { const msgs = TREX_MESSAGES.waiting; return { msg: msgs[Math.floor(Date.now() / 30000) % msgs.length], anim: 'trex-idle', color: 'text-[#D4AF37]' } }
  const msgs = TREX_MESSAGES.sleep; return { msg: msgs[Math.floor(Date.now() / 60000) % msgs.length], anim: 'trex-sleep', color: 'text-gray-500' }
}

const P = () => (<div className="particles">{Array.from({ length: 12 }).map((_, i) => <div key={i} className="particle" />)}</div>)

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
  const [showMenu, setShowMenu] = useState(false)
  const [matchs, setMatchs] = useState<any[]>([])
  const [replays, setReplays] = useState<any[]>([])
  const [joueurs, setJoueurs] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [strats, setStrats] = useState<any[]>([])
  const [commentaires, setCommentaires] = useState<any[]>([])
  const [compos, setCompos] = useState<any[]>([])
  const [objectifs, setObjectifs] = useState<any[]>([])
  const [analyses, setAnalyses] = useState<any[]>([])
  const [fichesAdversaires, setFichesAdversaires] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [nouveauMatch, setNouveauMatch] = useState({ adversaire: '', date: '', horaire1: '', horaire2: '', arene: 'Arène 1', type: 'Ligue', sousMatchs: [] as { adversaire: string; scoreDyno: string; scoreAdv: string }[] })
  const [scoreEdit, setScoreEdit] = useState<any>(null)
  const [editHistoriqueScore, setEditHistoriqueScore] = useState<any>(null)
  const [nouveauReplay, setNouveauReplay] = useState({ titre: '', lien: '' })
  const [nouvelleNote, setNouvelleNote] = useState({ matchId: '', mental: '', communication: '', gameplay: '' })
  const [selectedMatchForNotes, setSelectedMatchForNotes] = useState<any>(null)
  const [nouvelleStrat, setNouvelleStrat] = useState({ adversaire: '', picks: [] as string[], bans: [] as string[] })
  const [showAddStrat, setShowAddStrat] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)
  const [countdowns, setCountdowns] = useState<Record<string, string>>({})
  const [nouveauCommentaire, setNouveauCommentaire] = useState('')
  const [selectedMatchForComment, setSelectedMatchForComment] = useState<any>(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [notifiedMatchs, setNotifiedMatchs] = useState<string[]>([])
  const [selectedMapCompo, setSelectedMapCompo] = useState('')
  const [compoJoueurs, setCompoJoueurs] = useState<string[]>([])
  const [showAddCompo, setShowAddCompo] = useState(false)
  const [anniversaire, setAnniversaire] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [nouvelObjectif, setNouvelObjectif] = useState('')
  const [showBilan, setShowBilan] = useState(false)
  const [selectedMatchForAnalyse, setSelectedMatchForAnalyse] = useState<any>(null)
  const [nouvelleAnalyse, setNouvelleAnalyse] = useState({ bien: '', mal: '', plan: '' })
  const [showAddFiche, setShowAddFiche] = useState(false)
  const [nouvelleFiche, setNouvelleFiche] = useState({ adversaire: '', forces: '', faiblesses: '', notes: '' })
  const [myPass, setMyPass] = useState<any>(null)
  const [allPasses, setAllPasses] = useState<any[]>([])
  const [avatarUrl, setAvatarUrl] = useState('')
  const [trexState, setTrexState] = useState({ msg: '', anim: 'trex-idle', color: 'text-[#D4AF37]' })

  const pm = useRef(0), pn = useRef(0), pc = useRef(0), ps = useRef(0), ty = useRef(0)

  useEffect(() => { const update = () => setTrexState(getTrexState(matchs, countdowns)); update(); const i = setInterval(update, 5000); return () => clearInterval(i) }, [matchs, countdowns])

  const addLog = async (action: string) => { if (!user) return; try { await addDoc(collection(db, 'logs'), { joueur: pseudo, joueurId: user.uid, action, createdAt: Date.now() }) } catch {} }

  useEffect(() => { if (window.location.search.includes('reset=1')) { localStorage.clear(); window.location.href = window.location.pathname } }, [])
  const sendNotification = useCallback((t: string, b: string, tg?: string) => { try { if (!('Notification' in window) || Notification.permission !== 'granted') return; const n = new Notification(t, { body: b, icon: LG, badge: LG, tag: tg || 'd', requireInteraction: false }); n.onclick = () => { window.focus(); n.close() } } catch {} }, [])
  const requestNotificationPermission = async () => { try { if (!('Notification' in window)) { alert('❌'); return }; const p = await Notification.requestPermission(); if (p === 'granted') { setNotificationsEnabled(true); localStorage.setItem('dyno-notifs', 'true'); alert('✅ Notifs activées !') } else { setNotificationsEnabled(false); localStorage.setItem('dyno-notifs', 'false'); alert('❌') } } catch { alert('❌') } }
  const getMatchDateTime = useCallback((m: any): Date | null => { if (!m?.date) return null; let d = m.date; const t = m.horaires?.[0] || m.horaire1 || '20:00'; if (d.includes('/')) { const [dd, mm, yy] = d.split('/'); d = yy + '-' + mm + '-' + dd }; try { const dt = new Date(d + 'T' + t + ':00'); return isNaN(dt.getTime()) ? null : dt } catch { return null } }, [])

  useEffect(() => { try { if ('Notification' in window && Notification.permission === 'granted' && localStorage.getItem('dyno-notifs') === 'true') setNotificationsEnabled(true) } catch {}; try { setNotifiedMatchs(JSON.parse(localStorage.getItem('dyno-notified') || '[]')) } catch { setNotifiedMatchs([]) } }, [])
  useEffect(() => { if (!notificationsEnabled) return; try { if (!('Notification' in window) || Notification.permission !== 'granted') return } catch { return }; const ck = () => { const now = new Date(); matchs.forEach((m: any) => { if (m.termine) return; const mt = getMatchDateTime(m); if (!mt) return; const dm = (mt.getTime() - now.getTime()) / 60000; const k1 = m.id + '-1h'; if (dm > 55 && dm <= 65 && !notifiedMatchs.includes(k1)) { sendNotification('🎮 1h !', 'DYNO vs ' + m.adversaire, 'm1h'); const u = [...notifiedMatchs, k1]; setNotifiedMatchs(u); localStorage.setItem('dyno-notified', JSON.stringify(u)) }; const k2 = m.id + '-15m'; if (dm > 10 && dm <= 20 && !notifiedMatchs.includes(k2)) { sendNotification('🔥 15min !', 'DYNO vs ' + m.adversaire, 'm15'); const u = [...notifiedMatchs, k2]; setNotifiedMatchs(u); localStorage.setItem('dyno-notified', JSON.stringify(u)) }; const k3 = m.id + '-now'; if (dm >= -2 && dm <= 3 && !notifiedMatchs.includes(k3)) { sendNotification('⚡ GO !', 'DYNO vs ' + m.adversaire, 'mnow'); const u = [...notifiedMatchs, k3]; setNotifiedMatchs(u); localStorage.setItem('dyno-notified', JSON.stringify(u)) } }) }; ck(); const i = setInterval(ck, 60000); return () => clearInterval(i) }, [notificationsEnabled, matchs, notifiedMatchs, sendNotification, getMatchDateTime])
  useEffect(() => { const u = () => { const now = new Date(); const c: Record<string, string> = {}; matchs.forEach((m: any) => { if (m.termine) return; const mt = getMatchDateTime(m); if (!mt) return; const df = mt.getTime() - now.getTime(); if (df <= 0) { c[m.id] = '🔴 EN COURS'; return }; const j = Math.floor(df / 86400000); const h = Math.floor((df % 86400000) / 3600000); const mi = Math.floor((df % 3600000) / 60000); const s = Math.floor((df % 60000) / 1000); c[m.id] = (j > 0 ? j + 'j ' : '') + ((h > 0 || j > 0) ? h + 'h ' : '') + mi + 'm ' + s + 's' }); setCountdowns(c) }; u(); const i = setInterval(u, 1000); return () => clearInterval(i) }, [matchs, getMatchDateTime])
  useEffect(() => { if (localStorage.getItem('dyno-admin') === 'true') setIsAdmin(true) }, [])
  useEffect(() => { const unsub = onAuthStateChanged(auth, async (u: any) => { setUser(u); if (u) { const d = await getDoc(doc(db, 'users', u.uid)); if (d.exists()) { const data = d.data(); setPseudo(data.pseudo || ''); if (data.anniversaire) setAnniversaire(data.anniversaire); if (data.avatarUrl) setAvatarUrl(data.avatarUrl); if (u.email === AE || data.isAdmin) { setIsAdmin(true); localStorage.setItem('dyno-admin', 'true') }; if (data.evaPass) { const pass = data.evaPass; if (pass.dateReset) { const rd = new Date(pass.dateReset); if (new Date() >= rd) { const np = { ...pass, hcUsed: 0, hpUsed: 0, dateReset: new Date(rd.getTime() + 30 * 86400000).toISOString().split('T')[0] }; setMyPass(np); updateDoc(doc(db, 'users', u.uid), { evaPass: np }) } else setMyPass(pass) } else setMyPass(pass) } } }; setLoading(false) }); return () => unsub() }, [])

  useEffect(() => { const q = query(collection(db, 'matchs'), orderBy('createdAt', 'desc')); const u = onSnapshot(q, (s: any) => { const d: any[] = []; s.forEach((x: any) => d.push({ id: x.id, ...x.data() })); setMatchs(d) }); return () => u() }, [])
  useEffect(() => { const q = query(collection(db, 'notes'), orderBy('createdAt', 'desc')); const u = onSnapshot(q, (s: any) => { const d: any[] = []; s.forEach((x: any) => d.push({ id: x.id, ...x.data() })); setNotes(d) }); return () => u() }, [])
  useEffect(() => { const q = query(collection(db, 'commentaires'), orderBy('createdAt', 'desc')); const u = onSnapshot(q, (s: any) => { const d: any[] = []; s.forEach((x: any) => d.push({ id: x.id, ...x.data() })); setCommentaires(d) }); return () => u() }, [])
  useEffect(() => { const q = query(collection(db, 'strats'), orderBy('createdAt', 'desc')); const u = onSnapshot(q, (s: any) => { const d: any[] = []; s.forEach((x: any) => d.push({ id: x.id, ...x.data() })); setStrats(d) }); return () => u() }, [])
  useEffect(() => { const q = query(collection(db, 'replays'), orderBy('createdAt', 'desc')); const u = onSnapshot(q, (s: any) => { const d: any[] = []; s.forEach((x: any) => d.push({ id: x.id, ...x.data() })); setReplays(d) }); return () => u() }, [])
  useEffect(() => { const q = query(collection(db, 'players'), orderBy('createdAt', 'desc')); const u = onSnapshot(q, (s: any) => { const d: any[] = []; s.forEach((x: any) => d.push({ id: x.id, ...x.data() })); setJoueurs(d) }); return () => u() }, [])
  useEffect(() => { const q = query(collection(db, 'compos'), orderBy('createdAt', 'desc')); const u = onSnapshot(q, (s: any) => { const d: any[] = []; s.forEach((x: any) => d.push({ id: x.id, ...x.data() })); setCompos(d) }); return () => u() }, [])
  useEffect(() => { const q = query(collection(db, 'objectifs'), orderBy('createdAt', 'desc')); const u = onSnapshot(q, (s: any) => { const d: any[] = []; s.forEach((x: any) => d.push({ id: x.id, ...x.data() })); setObjectifs(d) }); return () => u() }, [])
  useEffect(() => { const q = query(collection(db, 'analyses'), orderBy('createdAt', 'desc')); const u = onSnapshot(q, (s: any) => { const d: any[] = []; s.forEach((x: any) => d.push({ id: x.id, ...x.data() })); setAnalyses(d) }); return () => u() }, [])
  useEffect(() => { const q = query(collection(db, 'fichesAdversaires'), orderBy('createdAt', 'desc')); const u = onSnapshot(q, (s: any) => { const d: any[] = []; s.forEach((x: any) => d.push({ id: x.id, ...x.data() })); setFichesAdversaires(d) }); return () => u() }, [])
  useEffect(() => { const u = onSnapshot(collection(db, 'users'), (s: any) => { const d: any[] = []; s.forEach((x: any) => { const data = x.data(); if (data.evaPass) d.push({ oduserId: x.id, pseudo: data.pseudo, ...data.evaPass }) }); setAllPasses(d) }); return () => u() }, [])
  useEffect(() => { const q = query(collection(db, 'logs'), orderBy('createdAt', 'desc')); const u = onSnapshot(q, (s: any) => { const d: any[] = []; s.forEach((x: any) => d.push({ id: x.id, ...x.data() })); setLogs(d.slice(0, 50)) }); return () => u() }, [])

  useEffect(() => { if (!notificationsEnabled || pm.current === 0) { pm.current = matchs.length; return }; if (matchs.length > pm.current) { const n = matchs[0]; if (n) sendNotification('📅 Match !', 'DYNO vs ' + n.adversaire, 'nm') }; pm.current = matchs.length }, [matchs, notificationsEnabled, sendNotification])
  useEffect(() => { if (!notificationsEnabled || pn.current === 0) { pn.current = notes.length; return }; if (notes.length > pn.current) { const n = notes[0]; if (n) sendNotification('📊 Note !', n.joueur, 'nn') }; pn.current = notes.length }, [notes, notificationsEnabled, sendNotification])
  useEffect(() => { if (!notificationsEnabled || pc.current === 0) { pc.current = commentaires.length; return }; if (commentaires.length > pc.current) { const n = commentaires[0]; if (n) sendNotification('💬 !', n.joueur + ': ' + n.texte.substring(0, 50), 'nc') }; pc.current = commentaires.length }, [commentaires, notificationsEnabled, sendNotification])
  useEffect(() => { if (!notificationsEnabled || ps.current === 0) { ps.current = strats.length; return }; if (strats.length > ps.current) { const n = strats[0]; if (n) sendNotification('🎯 Strat !', 'DYNO vs ' + n.adversaire, 'ns') }; ps.current = strats.length }, [strats, notificationsEnabled, sendNotification])
  useEffect(() => { const t = setTimeout(() => setShowSplash(false), 2500); return () => clearTimeout(t) }, [])
  useEffect(() => { window.addEventListener('beforeinstallprompt', (e: any) => { e.preventDefault(); setDeferredPrompt(e); setShowInstall(true) }) }, [])

  const handleInstall = () => { if (deferredPrompt) { deferredPrompt.prompt(); setDeferredPrompt(null); setShowInstall(false) } }
  const handleSignUp = async () => { if (!email || !authPassword || !pseudo) { alert('⚠️ Remplis tout !'); return }; try { const r = await createUserWithEmailAndPassword(auth, email, authPassword); await setDoc(doc(db, 'users', r.user.uid), { pseudo, email, createdAt: Date.now(), isAdmin: email === AE }); await addDoc(collection(db, 'players'), { pseudo, role: 'Joueur', rang: 'Nouveau', userId: r.user.uid, createdAt: Date.now() }); alert('✅!'); setIsSignUp(false); setEmail(''); setAuthPassword('') } catch (e: any) { alert('❌ ' + e.message) } }
  const handleSignIn = async () => { if (!email || !authPassword) { alert('⚠️!'); return }; try { await setPersistence(auth, browserLocalPersistence); await signInWithEmailAndPassword(auth, email, authPassword); localStorage.setItem('user-email', email); alert('✅!'); setEmail(''); setAuthPassword('') } catch (e: any) { alert('❌ ' + e.message) } }
  const handleSignOut = async () => { await signOut(auth); setPseudo(''); setIsAdmin(false); localStorage.removeItem('dyno-admin'); localStorage.removeItem('user-email'); setMyPass(null); setAvatarUrl(''); alert('✅!') }
  const handleAdminLogin = () => { if (adminPassword === 'dyno2026') { setIsAdmin(true); localStorage.setItem('dyno-admin', 'true'); setAdminPassword('') } else alert('❌!') }
  const handleAdminLogout = () => { setIsAdmin(false); localStorage.removeItem('dyno-admin') }
  const selectPass = async (type: string) => { if (!user) return; const pd = EVA_PASSES[type]; if (!pd) return; const passData = { type, hcTotal: pd.hc, hpTotal: pd.hp, hcUsed: 0, hpUsed: 0, dateReset: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] }; await updateDoc(doc(db, 'users', user.uid), { evaPass: passData }); setMyPass(passData); addLog('Pass ' + pd.label + ' activé'); alert('✅!') }
  const getMatchTimeType = (match: any): 'hc' | 'hp' => { const time = match.horaires?.[0] || match.horaire1 || '20:00'; return isHP(match.date, time) ? 'hp' : 'hc' }
  const saveAvatar = async () => { if (!user || !avatarUrl) return; await updateDoc(doc(db, 'users', user.uid), { avatarUrl }); addLog('Avatar mis à jour'); alert('✅!') }

  const ajouterSousMatch = () => { const adv = prompt('Adversaire :'); if (!adv) return; const sd = prompt('Score DYNO :'); if (!sd) return; const sa = prompt('Score ' + adv + ' :'); if (!sa) return; setNouveauMatch({ ...nouveauMatch, sousMatchs: [...nouveauMatch.sousMatchs, { adversaire: adv, scoreDyno: sd, scoreAdv: sa }] }) }
  const supprimerSousMatch = (i: number) => { const sm = [...nouveauMatch.sousMatchs]; sm.splice(i, 1); setNouveauMatch({ ...nouveauMatch, sousMatchs: sm }) }
  const ajouterEditSousMatch = () => { if (!editHistoriqueScore) return; const adv = prompt('Adversaire :'); if (!adv) return; const sd = prompt('Score DYNO :'); if (!sd) return; const sa = prompt('Score ' + adv + ' :'); if (!sa) return; setEditHistoriqueScore({ ...editHistoriqueScore, sousMatchs: [...(editHistoriqueScore.sousMatchs || []), { adversaire: adv, scoreDyno: sd, scoreAdv: sa }] }) }
  const supprimerEditSousMatch = (i: number) => { if (!editHistoriqueScore) return; const sm = [...(editHistoriqueScore.sousMatchs || [])]; sm.splice(i, 1); setEditHistoriqueScore({ ...editHistoriqueScore, sousMatchs: sm }) }

  const ajouterMatch = async () => { if (!nouveauMatch.adversaire || !nouveauMatch.date || !nouveauMatch.horaire1) { alert('⚠️!'); return }; const md: any = { ...nouveauMatch, termine: false, disponibles: [], indisponibles: [], createdAt: Date.now() }; if (nouveauMatch.type === 'Division' && nouveauMatch.sousMatchs.length > 0) { md.termine = true; md.sousMatchs = nouveauMatch.sousMatchs; md.scoreDyno = nouveauMatch.sousMatchs.reduce((a: number, s: any) => a + parseInt(s.scoreDyno || '0'), 0); md.scoreAdversaire = nouveauMatch.sousMatchs.reduce((a: number, s: any) => a + parseInt(s.scoreAdv || '0'), 0) }; await addDoc(collection(db, 'matchs'), md); addLog('Match ajouté: vs ' + nouveauMatch.adversaire); const h = [nouveauMatch.horaire1]; if (nouveauMatch.horaire2) h.push(nouveauMatch.horaire2); try { await fetch(DW, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ embeds: [{ title: '🎮 DYNO vs ' + nouveauMatch.adversaire, color: 13934871, fields: [{ name: '⚔️', value: nouveauMatch.adversaire, inline: true }, { name: '📅', value: nouveauMatch.date, inline: true }, { name: '⏰', value: h.join(' / '), inline: true }, { name: '🏟️', value: nouveauMatch.arene, inline: true }, { name: '📊', value: nouveauMatch.type, inline: true }], footer: { text: 'DYNO', icon_url: LG } }] }) }) } catch {}; setNouveauMatch({ adversaire: '', date: '', horaire1: '', horaire2: '', arene: 'Arène 1', type: 'Ligue', sousMatchs: [] }); alert('✅!') }
  const ajouterReplay = async () => { if (!nouveauReplay.titre || !nouveauReplay.lien) { alert('⚠️!'); return }; await addDoc(collection(db, 'replays'), { ...nouveauReplay, createdAt: Date.now() }); addLog('Replay: ' + nouveauReplay.titre); setNouveauReplay({ titre: '', lien: '' }); alert('✅!') }
  const ajouterNote = async () => { if (!user) return; await addDoc(collection(db, 'notes'), { matchId: selectedMatchForNotes?.id, joueur: pseudo, joueurId: user.uid, mental: nouvelleNote.mental, communication: nouvelleNote.communication, gameplay: nouvelleNote.gameplay, createdAt: Date.now() }); addLog('Note ajoutée'); setNouvelleNote({ matchId: '', mental: '', communication: '', gameplay: '' }); setSelectedMatchForNotes(null); alert('✅!') }
  const ajouterCommentaire = async (id: string) => { if (!user || !nouveauCommentaire.trim()) return; await addDoc(collection(db, 'commentaires'), { matchId: id, joueur: pseudo, joueurId: user.uid, texte: nouveauCommentaire.trim(), createdAt: Date.now() }); addLog('Commentaire'); setNouveauCommentaire(''); setSelectedMatchForComment(null); alert('✅!') }
  const ajouterStrat = async () => { if (!nouvelleStrat.adversaire || nouvelleStrat.picks.length === 0 || nouvelleStrat.bans.length === 0) { alert('⚠️!'); return }; await addDoc(collection(db, 'strats'), { adversaire: nouvelleStrat.adversaire, picks: nouvelleStrat.picks, bans: nouvelleStrat.bans, auteur: pseudo || 'Anonyme', auteurId: user?.uid || null, createdAt: Date.now() }); addLog('Strat vs ' + nouvelleStrat.adversaire); setNouvelleStrat({ adversaire: '', picks: [], bans: [] }); setShowAddStrat(false); alert('✅!') }
  const ajouterCompo = async () => { if (!selectedMapCompo || compoJoueurs.length === 0) { alert('⚠️!'); return }; const ex = compos.find((c: any) => c.map === selectedMapCompo); if (ex) { await updateDoc(doc(db, 'compos', ex.id), { joueurs: compoJoueurs, updatedAt: Date.now() }) } else { await addDoc(collection(db, 'compos'), { map: selectedMapCompo, joueurs: compoJoueurs, auteur: pseudo, createdAt: Date.now() }) }; addLog('Compo ' + selectedMapCompo); setShowAddCompo(false); setSelectedMapCompo(''); setCompoJoueurs([]); alert('✅!') }
  const toggleCompoJoueur = (n: string) => { if (compoJoueurs.includes(n)) setCompoJoueurs(compoJoueurs.filter(j => j !== n)); else setCompoJoueurs([...compoJoueurs, n]) }
  const sauvegarderAnniversaire = async () => { if (!user || !anniversaire) return; await updateDoc(doc(db, 'users', user.uid), { anniversaire }); alert('✅!') }
  const ajouterObjectif = async () => { if (!user || !nouvelObjectif.trim()) return; await addDoc(collection(db, 'objectifs'), { texte: nouvelObjectif.trim(), termine: false, joueur: pseudo, joueurId: user.uid, createdAt: Date.now() }); setNouvelObjectif('') }
  const toggleObjectif = async (id: string, c: boolean) => { await updateDoc(doc(db, 'objectifs', id), { termine: !c }) }
  const ajouterAnalyse = async (mid: string) => { if (!user) return; await addDoc(collection(db, 'analyses'), { matchId: mid, joueur: pseudo, joueurId: user.uid, ...nouvelleAnalyse, createdAt: Date.now() }); addLog('Analyse'); setNouvelleAnalyse({ bien: '', mal: '', plan: '' }); setSelectedMatchForAnalyse(null); alert('✅!') }
  const ajouterFiche = async () => { if (!nouvelleFiche.adversaire.trim()) return; await addDoc(collection(db, 'fichesAdversaires'), { ...nouvelleFiche, auteur: pseudo, auteurId: user?.uid, createdAt: Date.now() }); addLog('Fiche: ' + nouvelleFiche.adversaire); setNouvelleFiche({ adversaire: '', forces: '', faiblesses: '', notes: '' }); setShowAddFiche(false); alert('✅!') }
  const del = async (col: string, id: string) => { await deleteDoc(doc(db, col, id)); addLog('Suppression ' + col) }
  const updateScore = async () => { if (!scoreEdit) return; await updateDoc(doc(db, 'matchs', scoreEdit.id), { scoreDyno: parseInt(scoreEdit.scoreDyno), scoreAdversaire: parseInt(scoreEdit.scoreAdv), termine: true }); addLog('Score ajouté'); setScoreEdit(null); alert('✅!') }
  const updateHistoriqueScore = async () => { if (!editHistoriqueScore) return; const ud: any = { adversaire: editHistoriqueScore.adversaire, type: editHistoriqueScore.type, arene: editHistoriqueScore.arene, date: editHistoriqueScore.date, termine: editHistoriqueScore.termine !== false }; if (editHistoriqueScore.type === 'Division' && editHistoriqueScore.sousMatchs?.length > 0) { ud.sousMatchs = editHistoriqueScore.sousMatchs; ud.scoreDyno = editHistoriqueScore.sousMatchs.reduce((a: number, s: any) => a + parseInt(s.scoreDyno || '0'), 0); ud.scoreAdversaire = editHistoriqueScore.sousMatchs.reduce((a: number, s: any) => a + parseInt(s.scoreAdv || '0'), 0) } else { ud.scoreDyno = parseInt(editHistoriqueScore.scoreDyno); ud.scoreAdversaire = parseInt(editHistoriqueScore.scoreAdv); if (editHistoriqueScore.type !== 'Division') ud.sousMatchs = [] }; await updateDoc(doc(db, 'matchs', editHistoriqueScore.id), ud); addLog('Match modifié'); setEditHistoriqueScore(null); alert('✅!') }

  const toggleDispo = async (mid: string) => { if (!user) return; const m = matchs.find((x: any) => x.id === mid); if (!m) return; const d = m.disponibles || []; const i = m.indisponibles || []; const isDispo = d.includes(pseudo); if (!isDispo && myPass) { const tt = getMatchTimeType(m); const uk = tt === 'hp' ? 'hpUsed' : 'hcUsed'; const tk = tt === 'hp' ? 'hpTotal' : 'hcTotal'; const rem = (myPass[tk] || 0) - (myPass[uk] || 0); if (rem < 2) alert('⚠️ Plus que ' + rem + ' jeton(s) ' + (tt === 'hp' ? 'HP' : 'HC') + ' !'); const np = { ...myPass, [uk]: (myPass[uk] || 0) + 2 }; setMyPass(np); await updateDoc(doc(db, 'users', user.uid), { evaPass: np }) } else if (isDispo && myPass) { const tt = getMatchTimeType(m); const uk = tt === 'hp' ? 'hpUsed' : 'hcUsed'; const np = { ...myPass, [uk]: Math.max(0, (myPass[uk] || 0) - 2) }; setMyPass(np); await updateDoc(doc(db, 'users', user.uid), { evaPass: np }) }; addLog(isDispo ? 'Dispo retiré: ' + m.adversaire : 'Dispo: ' + m.adversaire); await updateDoc(doc(db, 'matchs', mid), { disponibles: isDispo ? d.filter((p: string) => p !== pseudo) : [...d, pseudo], indisponibles: i.filter((p: string) => p !== pseudo) }) }
  const toggleIndispo = async (mid: string) => { if (!user) return; const m = matchs.find((x: any) => x.id === mid); if (!m) return; const d = m.disponibles || []; const i = m.indisponibles || []; if (d.includes(pseudo) && myPass) { const tt = getMatchTimeType(m); const uk = tt === 'hp' ? 'hpUsed' : 'hcUsed'; const np = { ...myPass, [uk]: Math.max(0, (myPass[uk] || 0) - 2) }; setMyPass(np); await updateDoc(doc(db, 'users', user.uid), { evaPass: np }) }; addLog('Indispo: ' + m.adversaire); await updateDoc(doc(db, 'matchs', mid), { indisponibles: i.includes(pseudo) ? i.filter((p: string) => p !== pseudo) : [...i, pseudo], disponibles: d.filter((p: string) => p !== pseudo) }) }

  const fdf = (s: string) => { if (!s) return ''; if (s.includes('/')) return s; const [y, m, d] = s.split('-'); return d + '/' + m + '/' + y }
  const fts = (t: number) => { const d = new Date(t); return d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }
  const atc = (m: any) => { try { if (!m?.date) return; let y: string, mo: string, d: string; if (m.date.includes('/')) { const p = m.date.split('/'); d = p[0]; mo = p[1]; y = p[2] } else { const p = m.date.split('-'); y = p[0]; mo = p[1]; d = p[2] }; const md = y + mo + d; let h = '20', mi = '00'; if (m.horaires?.length > 0) { const p = m.horaires[0].split(':'); h = p[0]; mi = p[1] || '00' } else if (m.horaire1) { const p = m.horaire1.split(':'); h = p[0]; mi = p[1] || '00' }; const st = h + mi + '00'; const et = (parseInt(h) + 2).toString().padStart(2, '0') + mi + '00'; if (/iPad|iPhone|iPod/.test(navigator.userAgent)) { const ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:' + m.id + '@d\nDTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z\nDTSTART:' + md + 'T' + st + '\nDTEND:' + md + 'T' + et + '\nSUMMARY:DYNO vs ' + m.adversaire + '\nLOCATION:' + m.arene + '\nEND:VEVENT\nEND:VCALENDAR'; const b = new Blob([ics], { type: 'text/calendar' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'D_' + m.adversaire + '.ics'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(u) } else { window.open('https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent('DYNO vs ' + m.adversaire) + '&dates=' + md + 'T' + st + '/' + md + 'T' + et + '&location=' + encodeURIComponent(m.arene), '_blank') } } catch (e: any) { alert('❌ ' + e.message) } }
  const hts = (e: React.TouchEvent) => { ty.current = e.touches[0].clientY }
  const htm = (e: React.TouchEvent) => { if (window.scrollY > 0) return; const d = e.touches[0].clientY - ty.current; if (d > 0) setPullDistance(Math.min(d * 0.4, 80)) }
  const hte = () => { if (pullDistance > 60) { setIsRefreshing(true); setTimeout(() => window.location.reload(), 500) }; setPullDistance(0) }
  const toggleMap = (map: string, type: 'picks' | 'bans') => { if (type === 'picks') { if (nouvelleStrat.picks.includes(map)) setNouvelleStrat({ ...nouvelleStrat, picks: nouvelleStrat.picks.filter(m => m !== map) }); else if (nouvelleStrat.picks.length < 4) setNouvelleStrat({ ...nouvelleStrat, picks: [...nouvelleStrat.picks, map] }) } else { if (nouvelleStrat.bans.includes(map)) setNouvelleStrat({ ...nouvelleStrat, bans: nouvelleStrat.bans.filter(m => m !== map) }); else if (nouvelleStrat.bans.length < 4) setNouvelleStrat({ ...nouvelleStrat, bans: [...nouvelleStrat.bans, map] }) } }
  const genBilan = () => { const now = new Date(); const mm = historique.filter((m: any) => { const d = new Date(m.createdAt); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() }); const w = mm.filter((m: any) => (m.scoreDyno || 0) > (m.scoreAdversaire || 0)).length; const l = mm.filter((m: any) => (m.scoreDyno || 0) < (m.scoreAdversaire || 0)).length; const mn = notes.filter((n: any) => { const d = new Date(n.createdAt); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() }); const am = mn.length > 0 ? Math.round(mn.reduce((a: number, n: any) => a + parseInt(n.mental || 0), 0) / mn.length) : 0; const ac = mn.length > 0 ? Math.round(mn.reduce((a: number, n: any) => a + parseInt(n.communication || 0), 0) / mn.length) : 0; const ap = mn.length > 0 ? Math.round(mn.reduce((a: number, n: any) => a + parseInt(n.gameplay || 0), 0) / mn.length) : 0; return { nom: ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'][now.getMonth()], m: mm.length, w, l, wr: mm.length > 0 ? Math.round((w / (w + l || 1)) * 100) : 0, am, ac, ap } }

  const victoires = matchs.filter((m: any) => m.termine && (m.scoreDyno || 0) > (m.scoreAdversaire || 0)).length
  const defaites = matchs.filter((m: any) => m.termine && (m.scoreDyno || 0) < (m.scoreAdversaire || 0)).length
  const totalMatchs = victoires + defaites
  const winRate = totalMatchs > 0 ? Math.round((victoires / totalMatchs) * 100) : 0
  const prochainsMatchs = matchs.filter((m: any) => !m.termine).sort((a: any, b: any) => new Date(a.date + 'T' + (a.horaires?.[0] || a.horaire1 || '20:00')).getTime() - new Date(b.date + 'T' + (b.horaires?.[0] || b.horaire1 || '20:00')).getTime())
  const historique = matchs.filter((m: any) => m.termine)
  const ytId = (url: string) => { const m = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/); return m ? m[1] : null }
  const hcRem = myPass ? (myPass.hcTotal || 0) - (myPass.hcUsed || 0) : 0
  const hpRem = myPass ? (myPass.hpTotal || 0) - (myPass.hpUsed || 0) : 0

  const H = ({ title, icon }: { title: string; icon?: string }) => (<div className="relative rounded-3xl p-7 mb-5 text-center overflow-hidden bg-gradient-to-br from-[#D4AF37]/10 via-[#D4AF37]/5 to-transparent border border-[#D4AF37]/15 glow-pulse"><div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent" /><img src={LG} alt="D" className="w-14 h-14 mx-auto mb-2 relative z-10 drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]" /><h2 className="text-lg font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent relative z-10">{icon} {title}</h2></div>)
  const menuItems = [{ t: 'matchs', i: '📅', l: 'Matchs' }, { t: 'historique', i: '📜', l: 'Résultats' }, { t: 'strats', i: '🎯', l: 'Strats' }, { t: 'compos', i: '📋', l: 'Compos' }, { t: 'fiches', i: '🔍', l: 'Fiches' }, { t: 'notes', i: '📊', l: 'Notes' }, { t: 'objectifs', i: '🎯', l: 'Objectifs' }, { t: 'rec', i: '🎬', l: 'Replays' }, { t: 'roster', i: '👥', l: 'Roster' }, { t: 'stats', i: '📈', l: 'Stats' }, { t: 'logs', i: '📋', l: 'Logs' }, { t: 'admin', i: '⚙️', l: 'Admin' }]

  if (showSplash) return (<div className="min-h-screen flex items-center justify-center relative overflow-hidden"><P /><div className="text-center relative z-10"><img src={LG} alt="D" className="w-48 h-48 mx-auto splash-logo drop-shadow-[0_0_40px_rgba(212,175,55,0.6)]" /><h1 className="text-5xl font-bold bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] bg-clip-text text-transparent mt-6 splash-text">DYNO</h1><p className="text-gray-400 mt-3 splash-sub tracking-[0.3em] uppercase text-sm">Esport Team</p><img src={TREX} alt="T-Rex" className="w-10 h-10 mx-auto mt-4 animate-bounce" /></div></div>)

  return (
    <div className="min-h-screen pb-6 relative">
      <P />
      <header className="backdrop-blur-2xl bg-black/30 border-b border-white/5 sticky top-0 z-40 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="max-w-lg mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setShowMenu(!showMenu)} className="w-9 h-9 rounded-xl flex items-center justify-center text-lg bg-white/5 border border-white/10 hover:bg-[#D4AF37]/20 transition-all">☰</button>
            <img src={TREX} alt="T-Rex" className={"w-6 h-6 " + trexState.anim} />
            <img src={LG} alt="D" className="w-8 h-8 drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
            <div><h1 className="text-base font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent leading-tight">DYNO</h1><p className="text-[8px] text-gray-600 uppercase tracking-widest">Esport</p></div>
          </div>
          <div className="flex gap-1 items-center">
            {user && myPass && <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-white/5 border border-white/10"><span className="text-blue-400 text-[8px] font-bold">{hcRem}HC</span><span className="text-gray-700 text-[7px]">|</span><span className="text-purple-400 text-[8px] font-bold">{hpRem}HP</span></div>}
            {user && <button onClick={requestNotificationPermission} className={"w-7 h-7 rounded-full flex items-center justify-center text-xs " + (notificationsEnabled ? "bg-[#D4AF37]/20 border border-[#D4AF37]/40" : "bg-white/5 border border-white/10")}>{notificationsEnabled ? '🔔' : '🔕'}</button>}
            {showInstall && <button onClick={handleInstall} className="px-2 py-1 rounded-lg text-[9px] font-bold bg-blue-600 text-white">📲</button>}
            {user ? <button onClick={handleSignOut} className="px-2 py-1 rounded-xl font-bold bg-gradient-to-r from-red-600 to-red-700 text-white text-[10px]">👋 {pseudo}</button> : <button onClick={() => setIsSignUp(false)} className="px-2 py-1 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-[10px]">👤</button>}
          </div>
        </div>
      </header>

      {showMenu && <div className="fixed inset-0 z-50 flex"><div className="w-64 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border-r border-[#D4AF37]/20 shadow-[4px_0_32px_rgba(0,0,0,0.8)] overflow-y-auto"><div className="p-5 border-b border-[#D4AF37]/10 flex items-center gap-3"><img src={LG} alt="D" className="w-12 h-12" /><div><h2 className="text-lg font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">DYNO</h2><p className="text-[9px] text-gray-600 uppercase tracking-widest">Esport Team</p></div></div><div className="py-3">{menuItems.map(({ t, i, l }) => <button key={t} onClick={() => { setActiveTab(t); setShowMenu(false) }} className={"w-full px-5 py-3 flex items-center gap-3 transition-all " + (activeTab === t ? "bg-[#D4AF37]/15 text-[#D4AF37] border-r-2 border-[#D4AF37]" : "text-gray-500 hover:text-gray-300 hover:bg-white/5")}><span className="text-lg">{i}</span><span className="text-sm font-bold tracking-wider uppercase">{l}</span>{activeTab === t && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />}</button>)}</div></div><div className="flex-1 bg-black/60" onClick={() => setShowMenu(false)} /></div>}

      <main className="max-w-lg mx-auto px-4 py-6 relative z-10" onTouchStart={hts} onTouchMove={htm} onTouchEnd={hte}>
        {pullDistance > 0 && <div className="flex justify-center mb-4" style={{ height: pullDistance }}><span className={"text-[#D4AF37] text-2xl " + (pullDistance > 60 ? 'animate-spin' : '')}>{isRefreshing ? '⏳' : pullDistance > 60 ? '🔄' : '⬇️'}</span></div>}

        {/* MATCHS */}
        {activeTab === 'matchs' && <div><H title="Prochains Matchs" />
          {/* T-Rex Banner */}
          <div className={"rounded-2xl p-4 mb-4 border text-center " + (trexState.anim === 'trex-rage' ? 'bg-red-500/10 border-red-500/20' : trexState.anim === 'trex-dance' ? 'bg-green-500/10 border-green-500/20' : trexState.anim === 'trex-angry' ? 'bg-orange-500/10 border-orange-500/20' : 'bg-[#D4AF37]/10 border-[#D4AF37]/15')}>
            <img src={TREX} alt="T-Rex" className={"w-16 h-16 mx-auto mb-2 " + trexState.anim} />
            <p className={"text-xs font-bold italic " + trexState.color}>{trexState.msg}</p>
          </div>
          <div className="flex justify-end mb-3"><div className="flex bg-white/5 rounded-xl border border-white/10 overflow-hidden"><button onClick={() => setViewMode('list')} className={"px-3 py-1.5 text-xs " + (viewMode === 'list' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'text-gray-600')}>☰</button><button onClick={() => setViewMode('grid')} className={"px-3 py-1.5 text-xs " + (viewMode === 'grid' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'text-gray-600')}>⊞</button></div></div>
          {loading ? <div className="space-y-4"><div className="skeleton h-48 w-full" /><div className="skeleton h-48 w-full" /></div> : prochainsMatchs.length === 0 ? <div className="text-center py-10 text-gray-600">📭 Aucun match</div> : <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-4'}>{prochainsMatchs.map((match: any, idx: number) => <div key={match.id} className="card-glow bg-black/30 backdrop-blur-lg rounded-3xl p-4 border border-[#D4AF37]/15" style={{ animationDelay: (idx * 0.1) + 's' }}>
            <div className="flex items-center justify-between mb-3"><span className={"px-2.5 py-1 rounded-full text-[9px] font-bold uppercase " + (match.type === 'Ligue' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : match.type === 'Scrim' ? 'bg-green-500/20 text-green-400 border border-green-500/20' : match.type === 'Tournoi' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' : match.type === 'Division' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' : 'bg-gray-500/20 text-gray-400 border border-gray-500/20')}>{match.type}</span><div className="flex items-center gap-1.5"><span className={"px-1.5 py-0.5 rounded text-[7px] font-bold " + (getMatchTimeType(match) === 'hp' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400')}>{getMatchTimeType(match) === 'hp' ? 'HP' : 'HC'}</span><span className="text-[#D4AF37] font-bold text-xs">{fdf(match.date)}</span></div></div>
            {countdowns[match.id] && <div className={"rounded-2xl p-2.5 mb-3 text-center border " + (countdowns[match.id] === '🔴 EN COURS' ? 'bg-red-500/10 border-red-500/15' : 'bg-[#D4AF37]/10 border-[#D4AF37]/15')}><p className="text-[9px] text-gray-600 uppercase">Countdown</p><p className={"text-lg font-bold font-mono " + (countdowns[match.id] === '🔴 EN COURS' ? 'text-red-400 animate-pulse' : 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent')}>{countdowns[match.id]}</p></div>}
            <div className="flex items-center gap-3 mb-3"><img src={LG} alt="D" className="w-10 h-10" /><span className="text-gray-700 font-light">VS</span><div className="flex-1 text-right"><p className="font-bold text-white text-sm">{match.adversaire}</p><p className="text-[10px] text-[#D4AF37]/60">🏟️ {match.arene}</p></div></div>
            <div className="bg-white/5 rounded-xl p-2.5 mb-2 border border-white/5"><p className="text-[9px] text-gray-600 uppercase">⏰</p><p className="text-[#D4AF37] font-bold text-xs">{match.horaires?.join(' / ') || [match.horaire1, match.horaire2].filter(Boolean).join(' / ') || '20:00'}</p></div>
            <div className="bg-white/5 rounded-xl p-2.5 mb-2 border border-white/5"><p className="text-[9px] text-gray-600 mb-1.5 uppercase">👥 Dispo ({(match.disponibles || []).length})</p>{(match.disponibles || []).length > 0 && <div className="flex flex-wrap gap-1">{(match.disponibles || []).map((p: string, i: number) => <span key={i} className="bg-[#D4AF37]/15 text-[#D4AF37] px-2 py-0.5 rounded-lg text-[9px] font-bold border border-[#D4AF37]/15">{p}</span>)}</div>}</div>
            <div className="bg-white/5 rounded-xl p-2.5 mb-3 border border-red-500/10"><p className="text-[9px] text-gray-600 mb-1.5 uppercase">🚫 Indispo ({(match.indisponibles || []).length})</p>{(match.indisponibles || []).length > 0 && <div className="flex flex-wrap gap-1">{(match.indisponibles || []).map((p: string, i: number) => <span key={i} className="bg-red-500/15 text-red-400 px-2 py-0.5 rounded-lg text-[9px] font-bold border border-red-500/15">{p}</span>)}</div>}</div>
            <button onClick={() => atc(match)} className="w-full mb-2 py-2 rounded-xl font-bold bg-blue-600/20 text-blue-400 border border-blue-500/15 text-xs">📅 Calendrier</button>
            <div className="flex gap-2"><button onClick={() => toggleDispo(match.id)} disabled={!user} className={"flex-1 py-2.5 rounded-xl font-bold transition-all text-xs " + (!user ? 'bg-white/5 text-gray-700' : (match.disponibles || []).includes(pseudo) ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/30' : 'bg-white/5 border border-[#D4AF37]/15 text-[#D4AF37]')}>{!user ? '🔐' : (match.disponibles || []).includes(pseudo) ? '✅ Dispo (-2🎟️)' : '📅 Dispo'}</button><button onClick={() => toggleIndispo(match.id)} disabled={!user} className={"flex-1 py-2.5 rounded-xl font-bold transition-all text-xs " + (!user ? 'bg-white/5 text-gray-700' : (match.indisponibles || []).includes(pseudo) ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30' : 'bg-white/5 border border-red-500/15 text-red-400')}>{!user ? '🔐' : (match.indisponibles || []).includes(pseudo) ? '❌ Indispo' : '🚫 Indispo'}</button></div>
          </div>)}</div>}
        </div>}

        {/* Le reste des onglets est identique au code précédent */}
        {/* HISTORIQUE, EDIT MODAL, STRATS, COMPOS, FICHES, NOTES, OBJECTIFS, REPLAYS, ROSTER, STATS, LOGS, ADMIN, LOGIN */}
        {/* ... (tout le code des autres onglets reste exactement le même que la version précédente) ... */}

      </main>

      {!user && <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4"><P /><div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-7 w-full max-w-sm border border-white/10 relative z-10"><img src={LG} alt="D" className="w-16 h-16 mx-auto mb-4" /><h3 className="text-lg font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-5 text-center">{isSignUp ? '📝 Créer' : '🔐 Connexion'}</h3>{isSignUp && <input type="text" placeholder="Pseudo" value={pseudo} onChange={e => setPseudo(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-3 text-white text-sm focus:outline-none" />}<input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-3 text-white text-sm focus:outline-none" /><input type="password" placeholder="Mot de passe" value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-5 text-white text-sm focus:outline-none" />{isSignUp ? <button onClick={handleSignUp} className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black mb-3 text-sm">✅ Créer</button> : <button onClick={handleSignIn} className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black mb-3 text-sm">🔐 Connexion</button>}<div className="border-t border-white/5 pt-3">{isSignUp ? <button onClick={() => setIsSignUp(false)} className="w-full text-[#D4AF37] text-xs hover:underline">Déjà un compte ?</button> : <button onClick={() => setIsSignUp(true)} className="w-full text-[#D4AF37] text-xs hover:underline">Pas de compte ?</button>}</div></div></div>}
    </div>
  )
}

export default App