import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  getDoc,
  setDoc
} from 'firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';

// ----------------------------------------------------
// FIREBASE CONFIG & CONSTANTS
// ----------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyDXwItLM0OZ0VmHj-DLZcH8OBy7wXiHBsM",
  authDomain: "dyno-esport.firebaseapp.com",
  projectId: "dyno-esport",
  storageBucket: "dyno-esport.firebasestorage.app",
  messagingSenderId: "808658404731",
  appId: "1:808658404731:web:f3cf29142d3038816f29de"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(() => {});

const DW = 'https://discord.com/api/webhooks/1489600048474886295/HfR7YhCRuDpjN6NCw133bShUF9Gj1gak-fWtTYVYgI2G_gllQ001kRfH0w57mUuCTytp';
const YT = 'https://youtube.com/@jonathanla890?si=eHtXG1hjlmCuZ-RC';
const LG = 'https://i.imgur.com/gTLj57a.png';
const AE = 'thibaut.llorens@hotmail.com';
const AM = ['Engine', 'Helios', 'Silva', 'The Cliff', 'Artefact', 'Outlaw', 'Atlantis', 'Horizon', 'Polaris', 'Lunar', 'Ceres'];

// ----------------------------------------------------
// PARTICLES COMPONENT
// ----------------------------------------------------
const Particles = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    {Array.from({ length: 15 }).map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full bg-[#D4AF37] opacity-20 blur-sm animate-pulse"
        style={{
          width: `${Math.random() * 6 + 2}px`,
          height: `${Math.random() * 6 + 2}px`,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animationDuration: `${Math.random() * 3 + 2}s`,
          animationDelay: `${Math.random() * 2}s`
        }}
      />
    ))}
  </div>
);

// ----------------------------------------------------
// HEADER COMPONENT
// ----------------------------------------------------
const HeaderTitle = ({ title, icon }: { title: string; icon?: string }) => (
  <div className="relative rounded-3xl p-7 mb-6 text-center overflow-hidden bg-gradient-to-br from-[#D4AF37]/10 via-[#D4AF37]/5 to-transparent border border-[#D4AF37]/20 shadow-[0_8px_32px_rgba(212,175,55,0.15)] glow-pulse backdrop-blur-md">
    <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent" />
    <img src={LG} alt="D" className="w-14 h-14 mx-auto mb-2 relative z-10 drop-shadow-[0_0_20px_rgba(212,175,55,0.6)]" />
    <h2 className="text-xl font-extrabold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent relative z-10 tracking-wide">
      {icon} {title}
    </h2>
  </div>
);

// ----------------------------------------------------
// MAIN APPLICATION
// ----------------------------------------------------
export default function App() {
  const [activeTab, setActiveTab] = useState('matchs');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showSplash, setShowSplash] = useState(true);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [pseudo, setPseudo] = useState('');
  const [email, setEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  // Firestore Collections State
  const [matchs, setMatchs] = useState<any[]>([]);
  const [replays, setReplays] = useState<any[]>([]);
  const [joueurs, setJoueurs] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [strats, setStrats] = useState<any[]>([]);
  const [commentaires, setCommentaires] = useState<any[]>([]);
  const [compos, setCompos] = useState<any[]>([]);
  const [objectifs, setObjectifs] = useState<any[]>([]);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [fichesAdversaires, setFichesAdversaires] = useState<any[]>([]);

  // Forms / Modals State
  const [nouveauMatch, setNouveauMatch] = useState({
    adversaire: '',
    date: '',
    horaire1: '',
    horaire2: '',
    arene: 'Arène 1',
    type: 'Ligue',
    sousMatchs: [] as { adversaire: string; scoreDyno: string; scoreAdv: string }[]
  });
  const [scoreEdit, setScoreEdit] = useState<any>(null);
  const [editFilterType, setEditFilterType] = useState<'prochains' | 'historique'>('prochains');
  const [nouveauReplay, setNouveauReplay] = useState({ titre: '', lien: '' });
  const [nouvelleNote, setNouvelleNote] = useState({ mental: '', communication: '', gameplay: '' });
  const [selectedMatchForNotes, setSelectedMatchForNotes] = useState<any>(null);
  const [nouvelleStrat, setNouvelleStrat] = useState({ adversaire: '', picks: [] as string[], bans: [] as string[] });
  const [showAddStrat, setShowAddStrat] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});
  const [nouveauCommentaire, setNouveauCommentaire] = useState('');
  const [selectedMatchForComment, setSelectedMatchForComment] = useState<any>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notifiedMatchs, setNotifiedMatchs] = useState<string[]>([]);
  const [selectedMapCompo, setSelectedMapCompo] = useState('');
  const [compoJoueurs, setCompoJoueurs] = useState<string[]>([]);
  const [showAddCompo, setShowAddCompo] = useState(false);
  const [anniversaire, setAnniversaire] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [nouvelObjectif, setNouvelObjectif] = useState('');
  const [showBilan, setShowBilan] = useState(false);
  const [selectedMatchForAnalyse, setSelectedMatchForAnalyse] = useState<any>(null);
  const [nouvelleAnalyse, setNouvelleAnalyse] = useState({ bien: '', mal: '', plan: '' });
  const [showAddFiche, setShowAddFiche] = useState(false);
  const [nouvelleFiche, setNouvelleFiche] = useState({ adversaire: '', forces: '', faiblesses: '', notes: '' });

  const pm = useRef(0);
  const pn = useRef(0);
  const pc = useRef(0);
  const ps = useRef(0);
  const ty = useRef(0);

  useEffect(() => {
    if (window.location.search.includes('reset=1')) {
      localStorage.clear();
      window.location.href = window.location.pathname;
    }
  }, []);

  const sendNotification = useCallback((t: string, b: string, tg?: string) => {
    try {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;
      const n = new Notification(t, { body: b, icon: LG, badge: LG, tag: tg || 'd', requireInteraction: false });
      n.onclick = () => { window.focus(); n.close(); };
    } catch {}
  }, []);

  const requestNotificationPermission = async () => {
    try {
      if (!('Notification' in window)) {
        alert('❌ Notifications non supportées');
        return;
      }
      const p = await Notification.requestPermission();
      if (p === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem('dyno-notifs', 'true');
        alert('✅ Notifications activées !');
      } else {
        setNotificationsEnabled(false);
        localStorage.setItem('dyno-notifs', 'false');
        alert('❌ Permission refusée');
      }
    } catch {
      alert('❌ Erreur lors de la demande de permission');
    }
  };

  const getMatchDateTime = useCallback((m: any): Date | null => {
    if (!m?.date) return null;
    let d = m.date;
    const t = m.horaires?.[0] || m.horaire1 || '20:00';
    if (d.includes('/')) {
      const [dd, mm, yy] = d.split('/');
      d = `${yy}-${mm}-${dd}`;
    }
    try {
      const dt = new Date(`${d}T${t}:00`);
      return isNaN(dt.getTime()) ? null : dt;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    try {
      if ('Notification' in window && Notification.permission === 'granted' && localStorage.getItem('dyno-notifs') === 'true') {
        setNotificationsEnabled(true);
      }
    } catch {}
    try {
      setNotifiedMatchs(JSON.parse(localStorage.getItem('dyno-notified') || '[]'));
    } catch {
      setNotifiedMatchs([]);
    }
  }, []);

  useEffect(() => {
    if (!notificationsEnabled) return;
    try {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;
    } catch { return; }
    const ck = () => {
      const now = new Date();
      matchs.forEach((m: any) => {
        if (m.termine) return;
        const mt = getMatchDateTime(m);
        if (!mt) return;
        const dm = (mt.getTime() - now.getTime()) / 60000;
        const k1 = `${m.id}-1h`;
        if (dm > 55 && dm <= 65 && !notifiedMatchs.includes(k1)) {
          sendNotification('🎮 1h !', `DYNO vs ${m.adversaire}`, 'm1h');
          const u = [...notifiedMatchs, k1];
          setNotifiedMatchs(u);
          localStorage.setItem('dyno-notified', JSON.stringify(u));
        }
        const k2 = `${m.id}-15m`;
        if (dm > 10 && dm <= 20 && !notifiedMatchs.includes(k2)) {
          sendNotification('🔥 15min !', `DYNO vs ${m.adversaire}`, 'm15');
          const u = [...notifiedMatchs, k2];
          setNotifiedMatchs(u);
          localStorage.setItem('dyno-notified', JSON.stringify(u));
        }
        const k3 = `${m.id}-now`;
        if (dm >= -2 && dm <= 3 && !notifiedMatchs.includes(k3)) {
          sendNotification('⚡ GO !', `DYNO vs ${m.adversaire}`, 'mnow');
          const u = [...notifiedMatchs, k3];
          setNotifiedMatchs(u);
          localStorage.setItem('dyno-notified', JSON.stringify(u));
        }
      });
    };
    ck();
    const i = setInterval(ck, 60000);
    return () => clearInterval(i);
  }, [notificationsEnabled, matchs, notifiedMatchs, sendNotification, getMatchDateTime]);

  useEffect(() => {
    const u = () => {
      const now = new Date();
      const c: Record<string, string> = {};
      matchs.forEach((m: any) => {
        if (m.termine) return;
        const mt = getMatchDateTime(m);
        if (!mt) return;
        const df = mt.getTime() - now.getTime();
        if (df <= 0) {
          c[m.id] = '🔴 EN COURS';
          return;
        }
        const j = Math.floor(df / 86400000);
        const h = Math.floor((df % 86400000) / 3600000);
        const mi = Math.floor((df % 3600000) / 60000);
        const s = Math.floor((df % 60000) / 1000);
        c[m.id] = `${j > 0 ? j + 'j ' : ''}${(h > 0 || j > 0) ? h + 'h ' : ''}${mi}m ${s}s`;
      });
      setCountdowns(c);
    };
    u();
    const i = setInterval(u, 1000);
    return () => clearInterval(i);
  }, [matchs, getMatchDateTime]);

  useEffect(() => {
    if (localStorage.getItem('dyno-admin') === 'true') setIsAdmin(true);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u: any) => {
      setUser(u);
      if (u) {
        const d = await getDoc(doc(db, 'users', u.uid));
        if (d.exists()) {
          const data = d.data();
          setPseudo(data.pseudo || '');
          if (data.anniversaire) setAnniversaire(data.anniversaire);
          if (u.email === AE || data.isAdmin) {
            setIsAdmin(true);
            localStorage.setItem('dyno-admin', 'true');
          }
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'matchs'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (s: any) => {
      const d: any[] = [];
      s.forEach((x: any) => d.push({ id: x.id, ...x.data() }));
      setMatchs(d);
    });
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (s: any) => {
      const d: any[] = [];
      s.forEach((x: any) => d.push({ id: x.id, ...x.data() }));
      setNotes(d);
    });
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'commentaires'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (s: any) => {
      const d: any[] = [];
      s.forEach((x: any) => d.push({ id: x.id, ...x.data() }));
      setCommentaires(d);
    });
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'strats'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (s: any) => {
      const d: any[] = [];
      s.forEach((x: any) => d.push({ id: x.id, ...x.data() }));
      setStrats(d);
    });
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'replays'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (s: any) => {
      const d: any[] = [];
      s.forEach((x: any) => d.push({ id: x.id, ...x.data() }));
      setReplays(d);
    });
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'players'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (s: any) => {
      const d: any[] = [];
      s.forEach((x: any) => d.push({ id: x.id, ...x.data() }));
      setJoueurs(d);
    });
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'compos'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (s: any) => {
      const d: any[] = [];
      s.forEach((x: any) => d.push({ id: x.id, ...x.data() }));
      setCompos(d);
    });
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'objectifs'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (s: any) => {
      const d: any[] = [];
      s.forEach((x: any) => d.push({ id: x.id, ...x.data() }));
      setObjectifs(d);
    });
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'analyses'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (s: any) => {
      const d: any[] = [];
      s.forEach((x: any) => d.push({ id: x.id, ...x.data() }));
      setAnalyses(d);
    });
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'fichesAdversaires'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (s: any) => {
      const d: any[] = [];
      s.forEach((x: any) => d.push({ id: x.id, ...x.data() }));
      setFichesAdversaires(d);
    });
  }, []);

  useEffect(() => {
    if (!notificationsEnabled || pm.current === 0) {
      pm.current = matchs.length;
      return;
    }
    if (matchs.length > pm.current) {
      const n = matchs[0];
      if (n) sendNotification('📅 Nouveau Match !', `DYNO vs ${n.adversaire}`, 'nm');
    }
    pm.current = matchs.length;
  }, [matchs, notificationsEnabled, sendNotification]);

  useEffect(() => {
    if (!notificationsEnabled || pn.current === 0) {
      pn.current = notes.length;
      return;
    }
    if (notes.length > pn.current) {
      const n = notes[0];
      if (n) sendNotification('📊 Nouvelle Note !', `${n.joueur}`, 'nn');
    }
    pn.current = notes.length;
  }, [notes, notificationsEnabled, sendNotification]);

  useEffect(() => {
    if (!notificationsEnabled || pc.current === 0) {
      pc.current = commentaires.length;
      return;
    }
    if (commentaires.length > pc.current) {
      const n = commentaires[0];
      if (n) sendNotification('💬 Nouveau Comm !', `${n.joueur}`, 'nc');
    }
    pc.current = commentaires.length;
  }, [commentaires, notificationsEnabled, sendNotification]);

  useEffect(() => {
    if (!notificationsEnabled || ps.current === 0) {
      ps.current = strats.length;
      return;
    }
    if (strats.length > ps.current) {
      const n = strats[0];
      if (n) sendNotification('🎯 Nouvelle Strat !', `DYNO vs ${n.adversaire}`, 'ns');
    }
    ps.current = strats.length;
  }, [strats, notificationsEnabled, sendNotification]);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    });
  }, []);

  // Handlers & Auth
  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      setDeferredPrompt(null);
      setShowInstall(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !authPassword || !pseudo) {
      alert('⚠️ Remplis tout !');
      return;
    }
    try {
      const r = await createUserWithEmailAndPassword(auth, email, authPassword);
      await setDoc(doc(db, 'users', r.user.uid), { pseudo, email, createdAt: Date.now(), isAdmin: email === AE });
      await addDoc(collection(db, 'players'), { pseudo, role: 'Joueur', rang: 'Nouveau', userId: r.user.uid, createdAt: Date.now() });
      alert('✅ Inscription réussie !');
      setIsSignUp(false);
      setEmail('');
      setAuthPassword('');
    } catch (e: any) {
      alert('❌ ' + e.message);
    }
  };

  const handleSignIn = async () => {
    if (!email || !authPassword) {
      alert('⚠️ Remplis tout !');
      return;
    }
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email, authPassword);
      localStorage.setItem('user-email', email);
      alert('✅ Connexion réussie !');
      setEmail('');
      setAuthPassword('');
    } catch (e: any) {
      alert('❌ ' + e.message);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setPseudo('');
    setIsAdmin(false);
    localStorage.removeItem('dyno-admin');
    localStorage.removeItem('user-email');
    alert('✅ Déconnexion réussie !');
  };

  const handleAdminLogin = () => {
    if (adminPassword === 'dyno2026') {
      setIsAdmin(true);
      localStorage.setItem('dyno-admin', 'true');
      setAdminPassword('');
    } else {
      alert('❌ Mot de passe incorrect !');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('dyno-admin');
  };

  const ajouterSousMatch = () => {
    const adv = prompt('Adversaire (ex: Div 5 Game 1, Nom Equipe) :');
    if (!adv) return;
    const sd = prompt('Score DYNO :');
    if (!sd) return;
    const sa = prompt(`Score ${adv} :`);
    if (!sa) return;
    setNouveauMatch({
      ...nouveauMatch,
      sousMatchs: [...nouveauMatch.sousMatchs, { adversaire: adv, scoreDyno: sd, scoreAdv: sa }]
    });
  };

  const supprimerSousMatch = (i: number) => {
    const sm = [...nouveauMatch.sousMatchs];
    sm.splice(i, 1);
    setNouveauMatch({ ...nouveauMatch, sousMatchs: sm });
  };

  const ajouterMatch = async () => {
    if (!nouveauMatch.adversaire || !nouveauMatch.date || !nouveauMatch.horaire1) {
      alert('⚠️ Champs obligatoires manquants !');
      return;
    }
    const md: any = {
      ...nouveauMatch,
      termine: false,
      disponibles: [],
      indisponibles: [],
      createdAt: Date.now()
    };
    if (nouveauMatch.type === 'Division' && nouveauMatch.sousMatchs.length > 0) {
      md.termine = true;
      md.sousMatchs = nouveauMatch.sousMatchs;
      md.scoreDyno = nouveauMatch.sousMatchs.reduce((a: number, s: any) => a + parseInt(s.scoreDyno || 0), 0);
      md.scoreAdversaire = nouveauMatch.sousMatchs.reduce((a: number, s: any) => a + parseInt(s.scoreAdv || 0), 0);
    }
    await addDoc(collection(db, 'matchs'), md);
    const h = [nouveauMatch.horaire1];
    if (nouveauMatch.horaire2) h.push(nouveauMatch.horaire2);
    try {
      await fetch(DW, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [
            {
              title: '🎮 DYNO vs ' + nouveauMatch.adversaire,
              color: 13934871,
              fields: [
                { name: '⚔️', value: nouveauMatch.adversaire, inline: true },
                { name: '📅', value: nouveauMatch.date, inline: true },
                { name: '⏰', value: h.join(' / '), inline: true },
                { name: '🏟️', value: nouveauMatch.arene, inline: true },
                { name: '📊', value: nouveauMatch.type, inline: true }
              ],
              footer: { text: 'DYNO', icon_url: LG }
            }
          ]
        })
      });
    } catch {}
    setNouveauMatch({ adversaire: '', date: '', horaire1: '', horaire2: '', arene: 'Arène 1', type: 'Ligue', sousMatchs: [] });
    alert('✅ Match ajouté !');
  };

  const ajouterReplay = async () => {
    if (!nouveauReplay.titre || !nouveauReplay.lien) {
      alert('⚠️ Informations manquantes !');
      return;
    }
    await addDoc(collection(db, 'replays'), { ...nouveauReplay, createdAt: Date.now() });
    setNouveauReplay({ titre: '', lien: '' });
    alert('✅ Replay ajouté !');
  };

  const ajouterNote = async () => {
    if (!user) return;
    await addDoc(collection(db, 'notes'), {
      matchId: selectedMatchForNotes?.id,
      joueur: pseudo,
      joueurId: user.uid,
      ...nouvelleNote,
      createdAt: Date.now()
    });
    setNouvelleNote({ mental: '', communication: '', gameplay: '' });
    setSelectedMatchForNotes(null);
    alert('✅ Note ajoutée !');
  };

  const ajouterCommentaire = async (id: string) => {
    if (!user || !nouveauCommentaire.trim()) return;
    await addDoc(collection(db, 'commentaires'), {
      matchId: id,
      joueur: pseudo,
      joueurId: user.uid,
      texte: nouveauCommentaire.trim(),
      createdAt: Date.now()
    });
    setNouveauCommentaire('');
    setSelectedMatchForComment(null);
    alert('✅ Commentaire ajouté !');
  };

  const ajouterStrat = async () => {
    if (!nouvelleStrat.adversaire || nouvelleStrat.picks.length === 0 || nouvelleStrat.bans.length === 0) {
      alert('⚠️ Champs obligatoires manquants !');
      return;
    }
    await addDoc(collection(db, 'strats'), {
      adversaire: nouvelleStrat.adversaire,
      picks: nouvelleStrat.picks,
      bans: nouvelleStrat.bans,
      auteur: pseudo,
      auteurId: user?.uid,
      createdAt: Date.now()
    });
    setNouvelleStrat({ adversaire: '', picks: [], bans: [] });
    setShowAddStrat(false);
    alert('✅ Stratégie ajoutée !');
  };

  const ajouterCompo = async () => {
    if (!selectedMapCompo || compoJoueurs.length === 0) {
      alert('⚠️ Champs obligatoires manquants !');
      return;
    }
    const ex = compos.find((c: any) => c.map === selectedMapCompo);
    if (ex) {
      await updateDoc(doc(db, 'compos', ex.id), { joueurs: compoJoueurs, updatedAt: Date.now() });
    } else {
      await addDoc(collection(db, 'compos'), {
        map: selectedMapCompo,
        joueurs: compoJoueurs,
        auteur: pseudo,
        createdAt: Date.now()
      });
    }
    setShowAddCompo(false);
    setSelectedMapCompo('');
    setCompoJoueurs([]);
    alert('✅ Compo sauvegardée !');
  };

  const toggleCompoJoueur = (n: string) => {
    if (compoJoueurs.includes(n)) setCompoJoueurs(compoJoueurs.filter(j => j !== n));
    else setCompoJoueurs([...compoJoueurs, n]);
  };

  const sauvegarderAnniversaire = async () => {
    if (!user || !anniversaire) return;
    await updateDoc(doc(db, 'users', user.uid), { anniversaire });
    alert('✅ Anniversaire sauvegardé !');
  };

  const ajouterObjectif = async () => {
    if (!user || !nouvelObjectif.trim()) return;
    await addDoc(collection(db, 'objectifs'), {
      texte: nouvelObjectif.trim(),
      termine: false,
      joueur: pseudo,
      joueurId: user.uid,
      createdAt: Date.now()
    });
    setNouvelObjectif('');
  };

  const toggleObjectif = async (id: string, c: boolean) => {
    await updateDoc(doc(db, 'objectifs', id), { termine: !c });
  };

  const ajouterAnalyse = async (mid: string) => {
    if (!user) return;
    await addDoc(collection(db, 'analyses'), {
      matchId: mid,
      joueur: pseudo,
      joueurId: user.uid,
      ...nouvelleAnalyse,
      createdAt: Date.now()
    });
    setNouvelleAnalyse({ bien: '', mal: '', plan: '' });
    setSelectedMatchForAnalyse(null);
    alert('✅ Analyse ajoutée !');
  };

  const ajouterFiche = async () => {
    if (!nouvelleFiche.adversaire.trim()) return;
    await addDoc(collection(db, 'fichesAdversaires'), {
      ...nouvelleFiche,
      auteur: pseudo,
      auteurId: user?.uid,
      createdAt: Date.now()
    });
    setNouvelleFiche({ adversaire: '', forces: '', faiblesses: '', notes: '' });
    setShowAddFiche(false);
    alert('✅ Fiche ajoutée !');
  };

  const del = async (col: string, id: string) => {
    if (confirm('Confirmer la suppression ?')) {
      await deleteDoc(doc(db, col, id));
    }
  };

  // Full division editing
  const triggerScoreEdit = (m: any) => {
    setScoreEdit({
      id: m.id,
      adversaire: m.adversaire || '',
      type: m.type || 'Ligue',
      scoreDyno: m.scoreDyno || '',
      scoreAdv: m.scoreAdversaire || '',
      sousMatchs: m.sousMatchs || []
    });
  };

  const addScoreEditSubmatch = () => {
    setScoreEdit({
      ...scoreEdit,
      sousMatchs: [
        ...(scoreEdit.sousMatchs || []),
        { adversaire: 'Game ' + ((scoreEdit.sousMatchs?.length || 0) + 1), scoreDyno: '0', scoreAdv: '0' }
      ]
    });
  };

  const removeScoreEditSubmatch = (i: number) => {
    const sm = [...(scoreEdit.sousMatchs || [])];
    sm.splice(i, 1);
    setScoreEdit({ ...scoreEdit, sousMatchs: sm });
  };

  const updateScoreEditSubmatch = (i: number, field: string, val: string) => {
    const sm = [...(scoreEdit.sousMatchs || [])];
    sm[i] = { ...sm[i], [field]: val };
    setScoreEdit({ ...scoreEdit, sousMatchs: sm });
  };

  const updateScore = async () => {
    if (!scoreEdit) return;

    let sd = parseInt(scoreEdit.scoreDyno) || 0;
    let sa = parseInt(scoreEdit.scoreAdv) || 0;
    const sm = scoreEdit.sousMatchs || [];

    if (scoreEdit.type === 'Division' && sm.length > 0) {
      sd = sm.reduce((a: number, s: any) => a + (parseInt(s.scoreDyno) || 0), 0);
      sa = sm.reduce((a: number, s: any) => a + (parseInt(s.scoreAdv) || 0), 0);
    }

    await updateDoc(doc(db, 'matchs', scoreEdit.id), {
      adversaire: scoreEdit.adversaire,
      type: scoreEdit.type,
      scoreDyno: sd,
      scoreAdversaire: sa,
      sousMatchs: sm,
      termine: true
    });

    setScoreEdit(null);
    alert('✅ Match modifié et sauvegardé avec succès !');
  };

  const toggleDispo = async (mid: string) => {
    if (!user) return;
    const m = matchs.find((x: any) => x.id === mid);
    if (!m) return;
    const d = m.disponibles || [];
    const i = m.indisponibles || [];
    await updateDoc(doc(db, 'matchs', mid), {
      disponibles: d.includes(pseudo) ? d.filter((p: string) => p !== pseudo) : [...d, pseudo],
      indisponibles: i.filter((p: string) => p !== pseudo)
    });
  };

  const toggleIndispo = async (mid: string) => {
    if (!user) return;
    const m = matchs.find((x: any) => x.id === mid);
    if (!m) return;
    const d = m.disponibles || [];
    const i = m.indisponibles || [];
    await updateDoc(doc(db, 'matchs', mid), {
      indisponibles: i.includes(pseudo) ? i.filter((p: string) => p !== pseudo) : [...i, pseudo],
      disponibles: d.filter((p: string) => p !== pseudo)
    });
  };

  const fdf = (s: string) => {
    if (!s) return '';
    if (s.includes('/')) return s;
    const [y, m, d] = s.split('-');
    return `${d}/${m}/${y}`;
  };

  const fts = (t: number) => {
    const d = new Date(t);
    return `${d.toLocaleDateString('fr-FR')} ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const atc = (m: any) => {
    try {
      if (!m?.date) return;
      let y: string, mo: string, d: string;
      if (m.date.includes('/')) {
        const [dd, mm, yy] = m.date.split('/');
        d = dd; mo = mm; y = yy;
      } else {
        const [yy, mm, dd] = m.date.split('-');
        y = yy; mo = mm; d = dd;
      }
      const md = `${y}${mo}${d}`;
      let h = '20', mi = '00';
      if (m.horaires?.length > 0) {
        const [hh, mm] = m.horaires[0].split(':');
        h = hh; mi = mm || '00';
      } else if (m.horaire1) {
        const [hh, mm] = m.horaire1.split(':');
        h = hh; mi = mm || '00';
      }
      const st = `${h}${mi}00`, et = `${(parseInt(h) + 2).toString().padStart(2, '0')}${mi}00`;
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:${m.id}@d\nDTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z\nDTSTART:${md}T${st}\nDTEND:${md}T${et}\nSUMMARY:DYNO vs ${m.adversaire}\nLOCATION:${m.arene}\nEND:VEVENT\nEND:VCALENDAR`;
        const b = new Blob([ics], { type: 'text/calendar' });
        const u = URL.createObjectURL(b);
        const a = document.createElement('a');
        a.href = u;
        a.download = `D_${m.adversaire}.ics`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(u);
      } else {
        window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`DYNO vs ${m.adversaire}`)}&dates=${md}T${st}/${md}T${et}&location=${encodeURIComponent(m.arene)}`, '_blank');
      }
    } catch (e: any) {
      alert('❌ ' + e.message);
    }
  };

  const hts = (e: React.TouchEvent) => { ty.current = e.touches[0].clientY; };
  const htm = (e: React.TouchEvent) => {
    if (window.scrollY > 0) return;
    const d = e.touches[0].clientY - ty.current;
    if (d > 0) setPullDistance(Math.min(d * 0.4, 80));
  };
  const hte = () => {
    if (pullDistance > 60) {
      setIsRefreshing(true);
      setTimeout(() => window.location.reload(), 500);
    }
    setPullDistance(0);
  };

  const toggleMap = (map: string, type: 'picks' | 'bans') => {
    if (type === 'picks') {
      if (nouvelleStrat.picks.includes(map)) setNouvelleStrat({ ...nouvelleStrat, picks: nouvelleStrat.picks.filter(m => m !== map) });
      else if (nouvelleStrat.picks.length < 4) setNouvelleStrat({ ...nouvelleStrat, picks: [...nouvelleStrat.picks, map] });
    } else {
      if (nouvelleStrat.bans.includes(map)) setNouvelleStrat({ ...nouvelleStrat, bans: nouvelleStrat.bans.filter(m => m !== map) });
      else if (nouvelleStrat.bans.length < 4) setNouvelleStrat({ ...nouvelleStrat, bans: [...nouvelleStrat.bans, map] });
    }
  };

  const genBilan = () => {
    const now = new Date();
    const mm = historique.filter((m: any) => {
      const d = new Date(m.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const w = mm.filter((m: any) => (m.scoreDyno || 0) > (m.scoreAdversaire || 0)).length;
    const l = mm.filter((m: any) => (m.scoreDyno || 0) < (m.scoreAdversaire || 0)).length;
    const mn = notes.filter((n: any) => {
      const d = new Date(n.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const am = mn.length > 0 ? Math.round(mn.reduce((a: number, n: any) => a + parseInt(n.mental || 0), 0) / mn.length) : 0;
    const ac = mn.length > 0 ? Math.round(mn.reduce((a: number, n: any) => a + parseInt(n.communication || 0), 0) / mn.length) : 0;
    const ap = mn.length > 0 ? Math.round(mn.reduce((a: number, n: any) => a + parseInt(n.gameplay || 0), 0) / mn.length) : 0;
    return {
      nom: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][now.getMonth()],
      m: mm.length,
      w,
      l,
      wr: mm.length > 0 ? Math.round((w / (w + l || 1)) * 100) : 0,
      am,
      ac,
      ap
    };
  };

  const victoires = matchs.filter((m: any) => m.termine && (m.scoreDyno || 0) > (m.scoreAdversaire || 0)).length;
  const defaites = matchs.filter((m: any) => m.termine && (m.scoreDyno || 0) < (m.scoreAdversaire || 0)).length;
  const totalMatchs = victoires + defaites;
  const winRate = totalMatchs > 0 ? Math.round((victoires / totalMatchs) * 100) : 0;
  const prochainsMatchs = matchs.filter((m: any) => !m.termine).sort((a: any, b: any) => new Date(`${a.date}T${a.horaires?.[0] || a.horaire1 || '20:00'}`).getTime() - new Date(`${b.date}T${b.horaires?.[0] || b.horaire1 || '20:00'}`).getTime());
  const historique = matchs.filter((m: any) => m.termine);
  const ytId = (url: string) => {
    const m = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return m ? m[1] : null;
  };

  if (showSplash) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#0f0f0f] to-[#050505]">
        <Particles />
        <div className="text-center relative z-10">
          <img src={LG} alt="D" className="w-48 h-48 mx-auto splash-logo drop-shadow-[0_0_40px_rgba(212,175,55,0.8)]" />
          <h1 className="text-6xl font-black bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] bg-clip-text text-transparent mt-8 tracking-wider">
            DYNO
          </h1>
          <p className="text-gray-400 mt-4 tracking-[0.4em] uppercase text-sm font-semibold">
            Esport Team
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 relative bg-[#0a0a0a] text-white selection:bg-[#D4AF37] selection:text-black">
      <Particles />

      {/* Header */}
      <header className="backdrop-blur-2xl bg-black/40 border-b border-[#D4AF37]/15 sticky top-0 z-50 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LG} alt="D" className="w-11 h-11 drop-shadow-[0_0_15px_rgba(212,175,55,0.7)]" />
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent leading-tight tracking-wide">
                DYNO
              </h1>
              <p className="text-[10px] text-[#D4AF37]/60 uppercase tracking-widest font-bold">Esport</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {user && (
              <button
                onClick={requestNotificationPermission}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                  notificationsEnabled
                    ? 'bg-[#D4AF37]/20 border border-[#D4AF37]/40 shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <span className="text-sm">{notificationsEnabled ? '🔔' : '🔕'}</span>
              </button>
            )}
            {showInstall && (
              <button onClick={handleInstall} className="px-3 py-2 rounded-xl font-bold bg-blue-600 text-white text-[11px] hover:bg-blue-500">
                📲 Installer
              </button>
            )}
            {user ? (
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/20 text-xs hover:scale-105 transition-all"
              >
                👋 {pseudo}
              </button>
            ) : (
              <button
                onClick={() => setIsSignUp(false)}
                className="px-4 py-2 rounded-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/20 text-xs hover:scale-105 transition-all"
              >
                👤 Connexion
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6 relative z-10" onTouchStart={hts} onTouchMove={htm} onTouchEnd={hte}>
        {pullDistance > 0 && (
          <div className="flex justify-center mb-4" style={{ height: pullDistance }}>
            <span className={`text-[#D4AF37] text-2xl ${pullDistance > 60 ? 'animate-spin' : ''}`}>
              {isRefreshing ? '⏳' : pullDistance > 60 ? '🔄' : '🔃'}
            </span>
          </div>
        )}

        {/* Tab Matchs */}
        {activeTab === 'matchs' && (
          <div className="space-y-4">
            <HeaderTitle title="Prochains Matchs" icon="📅" />
            <div className="flex justify-end mb-3">
              <div className="flex bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 text-xs transition-all ${
                    viewMode === 'list' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'text-gray-600'
                  }`}
                >
                  ☰
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 text-xs transition-all ${
                    viewMode === 'grid' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'text-gray-600'
                  }`}
                >
                  ⊞
                </button>
              </div>
            </div>
            {loading ? (
              <div className="space-y-4">
                <div className="animate-pulse bg-white/5 h-48 rounded-3xl" />
                <div className="animate-pulse bg-white/5 h-48 rounded-3xl" />
              </div>
            ) : prochainsMatchs.length === 0 ? (
              <div className="text-center py-10 text-gray-500 bg-white/5 rounded-3xl border border-white/10">
                📭 Aucun match à venir
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-4'}>
                {prochainsMatchs.map((match: any, idx: number) => (
                  <div
                    key={match.id}
                    className="bg-black/30 backdrop-blur-lg rounded-3xl p-5 border border-[#D4AF37]/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          match.type === 'Ligue'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : match.type === 'Scrim'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : match.type === 'Tournoi'
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : match.type === 'Division'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}
                      >
                        {match.type}
                      </span>
                      <span className="text-[#D4AF37] font-bold text-xs">{fdf(match.date)}</span>
                    </div>
                    {countdowns[match.id] && (
                      <div
                        className={`rounded-2xl p-3 mb-4 text-center border ${
                          countdowns[match.id] === '🔴 EN COURS'
                            ? 'bg-red-500/10 border-red-500/20 animate-pulse'
                            : 'bg-[#D4AF37]/5 border-[#D4AF37]/20'
                        }`}
                      >
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                          Countdown
                        </p>
                        <p className="text-xl font-bold font-mono tracking-wider bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
                          {countdowns[match.id]}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-4 mb-4">
                      <img src={LG} alt="D" className="w-12 h-12 drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                      <span className="text-gray-500 font-light text-sm">VS</span>
                      <div className="flex-1 text-right">
                        <p className="font-extrabold text-white text-base leading-tight">{match.adversaire}</p>
                        <p className="text-[11px] text-[#D4AF37]/70 mt-0.5">🏟️ {match.arene}</p>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 mb-2 border border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest">⏰ Horaire</span>
                      <span className="text-[#D4AF37] font-bold text-sm">
                        {match.horaires?.join(' / ') || match.horaire1 || '20:00'}
                      </span>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 mb-2 border border-white/5">
                      <p className="text-[10px] text-gray-400 mb-2 uppercase tracking-wider font-semibold">
                        👥 Disponibles ({(match.disponibles || []).length})
                      </p>
                      {(match.disponibles || []).length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {(match.disponibles || []).map((p: string, i: number) => (
                            <span
                              key={i}
                              className="bg-[#D4AF37]/15 text-[#D4AF37] px-2.5 py-1 rounded-lg text-[10px] font-bold border border-[#D4AF37]/20"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 mb-4 border border-red-500/10">
                      <p className="text-[10px] text-gray-400 mb-2 uppercase tracking-wider font-semibold">
                        🚫 Indisponibles ({(match.indisponibles || []).length})
                      </p>
                      {(match.indisponibles || []).length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {(match.indisponibles || []).map((p: string, i: number) => (
                            <span
                              key={i}
                              className="bg-red-500/15 text-red-400 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-red-500/20"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => atc(match)}
                      className="w-full mb-3 py-2.5 rounded-xl font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs hover:bg-blue-600/30 transition-all"
                    >
                      📅 Ajouter au Calendrier
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleDispo(match.id)}
                        disabled={!user}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 text-xs ${
                          !user
                            ? 'bg-white/5 text-gray-700'
                            : (match.disponibles || []).includes(pseudo)
                            ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/30 scale-[1.02]'
                            : 'bg-white/5 border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10'
                        }`}
                      >
                        {!user ? '🔐' : (match.disponibles || []).includes(pseudo) ? '✅ Je suis Dispo' : '✋ Dispo'}
                      </button>
                      <button
                        onClick={() => toggleIndispo(match.id)}
                        disabled={!user}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 text-xs ${
                          !user
                            ? 'bg-white/5 text-gray-700'
                            : (match.indisponibles || []).includes(pseudo)
                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30 scale-[1.02]'
                            : 'bg-white/5 border border-red-500/30 text-red-400 hover:bg-red-500/10'
                        }`}
                      >
                        {!user ? '🔐' : (match.indisponibles || []).includes(pseudo) ? '❌ Je suis Indispo' : '🚫 Indispo'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Historique */}
        {activeTab === 'historique' && (
          <div className="space-y-4">
            <HeaderTitle title="Historique" icon="📜" />
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-[#D4AF37]/10 to-transparent rounded-3xl p-5 border border-[#D4AF37]/20 text-center">
                <p className="text-4xl font-extrabold text-[#D4AF37]">{victoires}</p>
                <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-wider font-semibold">Victoires</p>
              </div>
              <div className="bg-gradient-to-br from-red-500/10 to-transparent rounded-3xl p-5 border border-red-500/20 text-center">
                <p className="text-4xl font-extrabold text-red-500">{defaites}</p>
                <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-wider font-semibold">Défaites</p>
              </div>
            </div>
            {historique.length === 0 ? (
              <div className="text-center py-10 text-gray-500 bg-white/5 rounded-3xl border border-white/10">
                📜 Aucun match terminé
              </div>
            ) : (
              <div className="space-y-4">
                {historique.map((match: any, idx: number) => (
                  <div
                    key={match.id}
                    className="bg-black/30 backdrop-blur-lg rounded-3xl p-5 border border-[#D4AF37]/20 relative overflow-hidden"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          (match.scoreDyno || 0) > (match.scoreAdversaire || 0)
                            ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {(match.scoreDyno || 0) > (match.scoreAdversaire || 0) ? '🏆 VICTOIRE' : '❌ DÉFAITE'}
                      </span>
                      <span className="text-gray-500 text-xs font-semibold">{fdf(match.date)}</span>
                    </div>
                    <div className="flex items-center justify-between mb-3 bg-white/5 rounded-2xl p-4 border border-white/5">
                      <div className="text-center">
                        <p className="font-extrabold text-[#D4AF37] text-[11px] uppercase tracking-wider mb-1">DYNO</p>
                        <p className="text-4xl font-black bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
                          {match.scoreDyno}
                        </p>
                      </div>
                      <span className="text-gray-700 text-2xl font-light">-</span>
                      <div className="text-center">
                        <p className="font-extrabold text-gray-400 text-[11px] uppercase tracking-wider mb-1">
                          {match.adversaire}
                        </p>
                        <p className="text-4xl font-black text-gray-400">{match.scoreAdversaire}</p>
                      </div>
                    </div>
                    {match.sousMatchs?.length > 0 && (
                      <div className="space-y-1.5 mt-4 pt-3 border-t border-[#D4AF37]/10">
                        <p className="text-[10px] text-[#D4AF37] uppercase tracking-widest font-bold mb-2">
                          📋 Sous-matchs (BO3/BO5)
                        </p>
                        {match.sousMatchs.map((sm: any, i: number) => (
                          <div key={i} className="flex items-center justify-between bg-black/40 rounded-xl px-3 py-2 border border-white/5">
                            <span className="text-[11px] text-gray-300 font-semibold">{sm.adversaire}</span>
                            <span className="text-xs font-bold">
                              <span className="text-[#D4AF37]">{sm.scoreDyno}</span>
                              <span className="text-gray-600 mx-1">-</span>
                              <span className="text-gray-400">{sm.scoreAdv}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {match.type && (
                      <p className="text-center text-gray-600 text-[10px] mt-3 uppercase tracking-wider font-semibold">
                        {match.type} • {match.arene}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Notes */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <HeaderTitle title="Notes & Analyses" icon="📊" />
            {historique.length === 0 ? (
              <div className="text-center py-10 text-gray-500 bg-white/5 rounded-3xl border border-white/10">
                📊 Aucun match noté
              </div>
            ) : (
              <div className="space-y-4">
                {historique.map((match: any, idx: number) => {
                  const mn = notes.filter((n: any) => n.matchId === match.id);
                  const mc = commentaires.filter((c: any) => c.matchId === match.id);
                  const ma = analyses.filter((a: any) => a.matchId === match.id);
                  return (
                    <div
                      key={match.id}
                      className="bg-black/30 backdrop-blur-lg rounded-3xl p-5 border border-[#D4AF37]/20 shadow-lg"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                        <p className="font-extrabold text-[#D4AF37] text-base">DYNO vs {match.adversaire}</p>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold ${
                              (match.scoreDyno || 0) > (match.scoreAdversaire || 0)
                                ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {match.scoreDyno} - {match.scoreAdversaire}
                          </span>
                          <span className="text-gray-500 text-[10px]">{fdf(match.date)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 mb-4">
                        <button
                          onClick={() => {
                            setSelectedMatchForNotes(match);
                            setNouvelleNote({ mental: '', communication: '', gameplay: '' });
                          }}
                          className="flex-1 py-2 rounded-xl font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs hover:bg-purple-500/20 transition-all"
                        >
                          📝 Noter
                        </button>
                        <button
                          onClick={() => setSelectedMatchForComment(selectedMatchForComment?.id === match.id ? null : match)}
                          className="flex-1 py-2 rounded-xl font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs hover:bg-cyan-500/20 transition-all"
                        >
                          💬 Comm
                        </button>
                        <button
                          onClick={() => setSelectedMatchForAnalyse(selectedMatchForAnalyse?.id === match.id ? null : match)}
                          className="flex-1 py-2 rounded-xl font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs hover:bg-orange-500/20 transition-all"
                        >
                          📋 Analyse
                        </button>
                      </div>

                      {selectedMatchForComment?.id === match.id && user && (
                        <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-cyan-500/20">
                          <textarea
                            placeholder="Écrire un commentaire..."
                            value={nouveauCommentaire}
                            onChange={e => setNouveauCommentaire(e.target.value)}
                            rows={2}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-cyan-500 resize-none mb-3"
                          />
                          <button
                            onClick={() => ajouterCommentaire(match.id)}
                            className="w-full py-2.5 rounded-xl font-bold bg-cyan-500/20 text-cyan-400 text-xs hover:bg-cyan-500/30 transition-all"
                          >
                            💬 Publier le commentaire
                          </button>
                        </div>
                      )}

                      {selectedMatchForAnalyse?.id === match.id && user && (
                        <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-orange-500/20">
                          <div className="space-y-3 mb-3">
                            <div>
                              <label className="text-[9px] text-green-400 uppercase font-extrabold">✅ Points Forts</label>
                              <textarea
                                value={nouvelleAnalyse.bien}
                                onChange={e => setNouvelleAnalyse({ ...nouvelleAnalyse, bien: e.target.value })}
                                rows={2}
                                className="w-full bg-black/50 border border-green-500/20 rounded-xl px-4 py-3 text-white text-xs focus:outline-none resize-none mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-red-400 uppercase font-extrabold">❌ À Améliorer</label>
                              <textarea
                                value={nouvelleAnalyse.mal}
                                onChange={e => setNouvelleAnalyse({ ...nouvelleAnalyse, mal: e.target.value })}
                                rows={2}
                                className="w-full bg-black/50 border border-red-500/20 rounded-xl px-4 py-3 text-white text-xs focus:outline-none resize-none mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-blue-400 uppercase font-extrabold">🎯 Plan / Stratégie future</label>
                              <textarea
                                value={nouvelleAnalyse.plan}
                                onChange={e => setNouvelleAnalyse({ ...nouvelleAnalyse, plan: e.target.value })}
                                rows={2}
                                className="w-full bg-black/50 border border-blue-500/20 rounded-xl px-4 py-3 text-white text-xs focus:outline-none resize-none mt-1"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => ajouterAnalyse(match.id)}
                            className="w-full py-2.5 rounded-xl font-bold bg-orange-500/20 text-orange-400 text-xs hover:bg-orange-500/30 transition-all"
                          >
                            📋 Sauvegarder l'analyse
                          </button>
                        </div>
                      )}

                      {mn.length > 0 && (
                        <div className="space-y-2 mb-4">
                          <p className="text-[10px] text-purple-400 uppercase tracking-widest font-extrabold">
                            📊 Notes ({mn.length})
                          </p>
                          {mn.map((n: any) => (
                            <div key={n.id} className="bg-white/5 rounded-xl p-3 border border-white/5">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-[#D4AF37] font-bold text-xs">{n.joueur}</p>
                                {isAdmin && (
                                  <button onClick={() => del('notes', n.id)} className="text-red-400/40 text-[10px]">
                                    🗑️
                                  </button>
                                )}
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="bg-purple-500/10 rounded-xl p-2">
                                  <p className="text-[10px] text-gray-400 mb-0.5">🧠 Mental</p>
                                  <p className="text-purple-400 font-extrabold text-sm">{n.mental}/10</p>
                                </div>
                                <div className="bg-blue-500/10 rounded-xl p-2">
                                  <p className="text-[10px] text-gray-400 mb-0.5">💬 Comm</p>
                                  <p className="text-blue-400 font-extrabold text-sm">{n.communication}/10</p>
                                </div>
                                <div className="bg-green-500/10 rounded-xl p-2">
                                  <p className="text-[10px] text-gray-400 mb-0.5">🎯 Perf</p>
                                  <p className="text-green-400 font-extrabold text-sm">{n.gameplay}/10</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {mc.length > 0 && (
                        <div className="space-y-2 mb-4">
                          <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-extrabold">
                            💬 Commentaires ({mc.length})
                          </p>
                          {mc.map((c: any) => (
                            <div key={c.id} className="bg-white/5 rounded-xl p-3 border border-white/5">
                              <div className="flex items-center justify-between mb-1.5">
                                <p className="text-cyan-400 font-bold text-xs">{c.joueur}</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-gray-500 text-[9px]">{fts(c.createdAt)}</p>
                                  {(isAdmin || user?.uid === c.joueurId) && (
                                    <button onClick={() => del('commentaires', c.id)} className="text-red-400/40 text-[10px]">
                                      🗑️
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-gray-300 text-xs leading-relaxed">{c.texte}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {ma.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] text-orange-400 uppercase tracking-widest font-extrabold">
                            📋 Analyses ({ma.length})
                          </p>
                          {ma.map((a: any) => (
                            <div key={a.id} className="bg-white/5 rounded-xl p-3 border border-white/5">
                              <div className="flex items-center justify-between mb-2 border-b border-white/5 pb-2">
                                <p className="text-orange-400 font-bold text-xs">{a.joueur}</p>
                                {(isAdmin || user?.uid === a.joueurId) && (
                                  <button onClick={() => del('analyses', a.id)} className="text-red-400/40 text-[10px]">
                                    🗑️
                                  </button>
                                )}
                              </div>
                              <div className="space-y-2">
                                {a.bien && (
                                  <div className="bg-green-500/10 rounded-xl p-2.5">
                                    <p className="text-[9px] text-green-400 font-bold mb-0.5">✅ Points Forts</p>
                                    <p className="text-gray-300 text-xs">{a.bien}</p>
                                  </div>
                                )}
                                {a.mal && (
                                  <div className="bg-red-500/10 rounded-xl p-2.5">
                                    <p className="text-[9px] text-red-400 font-bold mb-0.5">❌ À Améliorer</p>
                                    <p className="text-gray-300 text-xs">{a.mal}</p>
                                  </div>
                                )}
                                {a.plan && (
                                  <div className="bg-blue-500/10 rounded-xl p-2.5">
                                    <p className="text-[9px] text-blue-400 font-bold mb-0.5">🎯 Stratégie</p>
                                    <p className="text-gray-300 text-xs">{a.plan}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {selectedMatchForNotes && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-6 w-full max-w-sm border border-white/10">
                  <h3 className="text-lg font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-5 text-center">
                    📊 Noter: DYNO vs {selectedMatchForNotes.adversaire}
                  </h3>
                  <div className="space-y-3 mb-5">
                    <div>
                      <label className="text-gray-600 text-[10px] mb-1.5 block uppercase">🧠 Mental / Focus</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={nouvelleNote.mental}
                        onChange={e => setNouvelleNote({ ...nouvelleNote, mental: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-xl font-bold focus:outline-none focus:border-[#D4AF37]/50"
                      />
                    </div>
                    <div>
                      <label className="text-gray-600 text-[10px] mb-1.5 block uppercase">💬 Communication</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={nouvelleNote.communication}
                        onChange={e => setNouvelleNote({ ...nouvelleNote, communication: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-xl font-bold focus:outline-none focus:border-[#D4AF37]/50"
                      />
                    </div>
                    <div>
                      <label className="text-gray-600 text-[10px] mb-1.5 block uppercase">🎯 Gameplay / Performance</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={nouvelleNote.gameplay}
                        onChange={e => setNouvelleNote({ ...nouvelleNote, gameplay: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-xl font-bold focus:outline-none focus:border-[#D4AF37]/50"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedMatchForNotes(null);
                        setNouvelleNote({ mental: '', communication: '', gameplay: '' });
                      }}
                      className="flex-1 py-2.5 rounded-xl font-bold bg-white/5 border border-white/10 text-gray-500 text-sm"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={ajouterNote}
                      className="flex-1 py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/30 text-sm"
                    >
                      ✅
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Objectifs */}
        {activeTab === 'objectifs' && (
          <div className="space-y-4">
            <HeaderTitle title="Mes Objectifs" icon="🎯" />
            {user && (
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Définir un nouvel objectif..."
                  value={nouvelObjectif}
                  onChange={e => setNouvelObjectif(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') ajouterObjectif();
                  }}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                />
                <button
                  onClick={ajouterObjectif}
                  className="px-5 py-3 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-sm"
                >
                  ➕
                </button>
              </div>
            )}
            {objectifs.filter((o: any) => o.joueurId === user?.uid).length === 0 ? (
              <div className="text-center py-10 text-gray-500 bg-white/5 rounded-3xl border border-white/10">
                🎯 Aucun objectif
              </div>
            ) : (
              <div className="space-y-3">
                {objectifs
                  .filter((o: any) => !o.termine && o.joueurId === user?.uid)
                  .map((o: any, idx: number) => (
                    <div
                      key={o.id}
                      className="bg-black/40 rounded-2xl p-4 border border-[#D4AF37]/20 flex items-center justify-between gap-3"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <button
                        onClick={() => toggleObjectif(o.id, o.termine)}
                        className="w-6 h-6 rounded-lg border-2 border-[#D4AF37] flex-shrink-0"
                      />
                      <div className="flex-1">
                        <p className="text-white text-sm">{o.texte}</p>
                        <p className="text-gray-500 text-[10px] mt-1">{new Date(o.createdAt).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <button onClick={() => del('objectifs', o.id)} className="text-red-400/40 hover:text-red-500">
                        🗑️
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Replays */}
        {activeTab === 'rec' && (
          <div className="space-y-4">
            <HeaderTitle title="Replays & Vidéos" icon="🎬" />
            <a
              href={YT}
              target="_blank"
              rel="noreferrer"
              className="block w-full py-3 rounded-xl font-bold bg-red-600/15 text-red-400 border border-red-500/15 text-center text-xs"
            >
              🔴 Chaîne YouTube DYNO
            </a>
            {replays.length === 0 ? (
              <div className="text-center py-10 text-gray-600">📹 Aucun replay disponible</div>
            ) : (
              <div className="space-y-3">
                {replays.map((r: any, idx: number) => (
                  <div
                    key={r.id}
                    className="bg-black/30 backdrop-blur-lg rounded-3xl p-4 border border-[#D4AF37]/15"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-[#D4AF37] text-sm">{r.titre}</h3>
                      {isAdmin && (
                        <button onClick={() => del('replays', r.id)} className="text-red-400/40 text-[9px]">
                          🗑️
                        </button>
                      )}
                    </div>
                    {ytId(r.lien) ? (
                      <div className="relative w-full pb-[56.25%] rounded-xl overflow-hidden">
                        <iframe
                          src={`https://www.youtube.com/embed/${ytId(r.lien)}`}
                          className="absolute top-0 left-0 w-full h-full"
                          frameBorder="0"
                          allowFullScreen
                          title={r.titre}
                        />
                      </div>
                    ) : (
                      <a
                        href={r.lien}
                        target="_blank"
                        rel="noreferrer"
                        className="block py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-center text-sm"
                      >
                        ▶️ Regarder le Replay
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Roster */}
        {activeTab === 'roster' && (
          <div className="space-y-4">
            <HeaderTitle title="Roster DYNO" icon="👥" />
            {user && (
              <div className="bg-black/30 rounded-2xl p-4 border border-pink-500/15 mb-5">
                <p className="text-[10px] text-pink-400 mb-2 uppercase tracking-wider font-bold">🎂 Mon Anniversaire</p>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={anniversaire}
                    onChange={e => setAnniversaire(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-pink-400/50"
                  />
                  <button
                    onClick={sauvegarderAnniversaire}
                    className="px-4 py-2 rounded-lg font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs shadow-lg shadow-pink-500/20"
                  >
                    💾 Enregistrer
                  </button>
                </div>
              </div>
            )}
            <div className="space-y-3">
              {joueurs
                .filter((j: any) => j.actif !== false)
                .map((j: any, idx: number) => (
                  <div
                    key={j.id}
                    className="bg-black/30 rounded-2xl p-4 border border-[#D4AF37]/15 flex items-center gap-4"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 flex items-center justify-center text-[#D4AF37] font-extrabold text-lg border border-[#D4AF37]/15">
                      {j.pseudo[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#D4AF37] text-sm">{j.pseudo}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">🎮 {j.role}</p>
                    </div>
                    {isAdmin && (
                      <button onClick={() => del('players', j.id)} className="text-red-400/40">
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tab Stats */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <HeaderTitle title="Statistiques" icon="📈" />
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-[#D4AF37]/10 rounded-2xl p-4 border border-[#D4AF37]/15 text-center">
                <p className="text-3xl font-black bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
                  {winRate}%
                </p>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-bold">Win Rate</p>
              </div>
              <div className="bg-[#D4AF37]/10 rounded-2xl p-4 border border-[#D4AF37]/15 text-center">
                <p className="text-3xl font-black bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
                  {totalMatchs}
                </p>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-bold">Matchs Joués</p>
              </div>
            </div>

            <div className="bg-black/30 rounded-3xl p-5 border border-[#D4AF37]/15">
              <h3 className="text-xs font-bold text-[#D4AF37] mb-4 uppercase tracking-wider">📊 Répartition globale</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-gray-400 text-xs font-bold">🏆 Victoires</span>
                    <span className="text-[#D4AF37] font-bold text-xs">{victoires}</span>
                  </div>
                  <div className="bg-white/5 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] h-3 rounded-full shadow-[0_0_8px_rgba(212,175,55,0.4)] transition-all duration-1000"
                      style={{ width: `${totalMatchs > 0 ? (victoires / totalMatchs) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-gray-400 text-xs font-bold">❌ Défaites</span>
                    <span className="text-red-500 font-bold text-xs">{defaites}</span>
                  </div>
                  <div className="bg-white/5 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-red-600 to-red-500 h-3 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.4)] transition-all duration-1000"
                      style={{ width: `${totalMatchs > 0 ? (defaites / totalMatchs) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowBilan(true)}
              className="w-full mt-4 py-3.5 rounded-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-transform text-sm"
            >
              📊 Afficher le Bilan du mois
            </button>

            {showBilan && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-6 w-full max-w-sm border border-white/10">
                  <h3 className="text-lg font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-5 text-center">
                    📊 Bilan {genBilan().nom}
                  </h3>
                  <div className="space-y-4 mb-5">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
                        <p className="text-2xl font-bold text-white">{genBilan().m}</p>
                        <p className="text-[9px] text-gray-500 uppercase mt-0.5">Matchs</p>
                      </div>
                      <div className="bg-green-500/10 rounded-xl p-3 border border-green-500/10 text-center">
                        <p className="text-2xl font-bold text-green-400">{genBilan().w}W</p>
                        <p className="text-[9px] text-gray-500 uppercase mt-0.5">Victoires</p>
                      </div>
                      <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/10 text-center">
                        <p className="text-2xl font-bold text-red-400">{genBilan().l}L</p>
                        <p className="text-[9px] text-gray-500 uppercase mt-0.5">Défaites</p>
                      </div>
                    </div>
                    <div className="bg-[#D4AF37]/10 rounded-xl p-4 border border-[#D4AF37]/15 text-center">
                      <p className="text-4xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
                        {genBilan().wr}%
                      </p>
                      <p className="text-[9px] text-gray-500 uppercase mt-1">Win Rate du mois</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowBilan(false)}
                    className="w-full py-2.5 rounded-xl font-bold bg-white/5 border border-white/10 text-gray-400 text-sm"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ADMIN TAB: FULL MODIFICATION OF ALL MATCHES & DIVISION COMPLETED MATCHES */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            <HeaderTitle title="Administration & Éditeur" icon="⚙️" />

            {!isAdmin ? (
              <div className="bg-black/30 rounded-3xl p-6 border border-[#D4AF37]/20">
                <p className="text-center text-xs text-gray-400 mb-4">Accès réservé aux administrateurs de l'équipe</p>
                <input
                  type="password"
                  placeholder="Mot de passe administrateur"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-4 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                />
                <button
                  onClick={handleAdminLogin}
                  className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/30 text-sm"
                >
                  Connexion
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* 1. Add Match */}
                <div className="bg-black/30 rounded-3xl p-6 border border-[#D4AF37]/20">
                  <h3 className="text-sm font-extrabold text-[#D4AF37] mb-4 uppercase tracking-wider flex items-center gap-2">
                    <span>➕</span> Nouveau Match
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Adversaire / Nom de l'équipe"
                      value={nouveauMatch.adversaire}
                      onChange={e => setNouveauMatch({ ...nouveauMatch, adversaire: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                    />
                    <input
                      type="date"
                      value={nouveauMatch.date}
                      onChange={e => setNouveauMatch({ ...nouveauMatch, date: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="time"
                        value={nouveauMatch.horaire1}
                        onChange={e => setNouveauMatch({ ...nouveauMatch, horaire1: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                      />
                      <input
                        type="time"
                        value={nouveauMatch.horaire2}
                        onChange={e => setNouveauMatch({ ...nouveauMatch, horaire2: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={nouveauMatch.arene}
                        onChange={e => setNouveauMatch({ ...nouveauMatch, arene: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                      >
                        <option value="Arène 1">Arène 1</option>
                        <option value="Arène 2">Arène 2</option>
                      </select>
                      <select
                        value={nouveauMatch.type}
                        onChange={e => setNouveauMatch({ ...nouveauMatch, type: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                      >
                        <option value="Ligue">Ligue</option>
                        <option value="Scrim">Scrim</option>
                        <option value="Tournoi">Tournoi</option>
                        <option value="Division">Division</option>
                      </select>
                    </div>

                    {nouveauMatch.type === 'Division' && (
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5 mt-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] text-[#D4AF37] font-extrabold uppercase tracking-wider">
                            🏆 Sous-matchs (BO3/BO5)
                          </p>
                          <button
                            onClick={ajouterSousMatch}
                            className="px-3 py-1.5 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] font-bold text-xs"
                          >
                            ➕ Ajouter
                          </button>
                        </div>
                        {nouveauMatch.sousMatchs.map((sm: any, i: number) => (
                          <div key={i} className="flex items-center justify-between bg-black/50 rounded-xl px-3 py-2">
                            <div>
                              <p className="text-xs text-gray-300 font-bold">{sm.adversaire}</p>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                Score: <span className="text-[#D4AF37]">{sm.scoreDyno}</span> -{' '}
                                <span className="text-gray-400">{sm.scoreAdv}</span>
                              </p>
                            </div>
                            <button onClick={() => supprimerSousMatch(i)} className="text-red-400/40 hover:text-red-500">
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={ajouterMatch}
                      className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/30 text-sm mt-2"
                    >
                      ✅ Ajouter le Match
                    </button>
                  </div>
                </div>

                {/* 2. Replay & Fiche Actions */}
                <div className="bg-black/30 rounded-3xl p-6 border border-[#D4AF37]/20">
                  <h3 className="text-sm font-extrabold text-[#D4AF37] mb-4 uppercase tracking-wider flex items-center gap-2">
                    <span>🎬</span> Ajouter Replay Vidéo
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Titre de la vidéo"
                      value={nouveauReplay.titre}
                      onChange={e => setNouveauReplay({ ...nouveauReplay, titre: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                    />
                    <input
                      type="text"
                      placeholder="Lien YouTube"
                      value={nouveauReplay.lien}
                      onChange={e => setNouveauReplay({ ...nouveauReplay, lien: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                    />
                    <button
                      onClick={ajouterReplay}
                      className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/30 text-sm"
                    >
                      Ajouter Replay
                    </button>
                  </div>
                </div>

                {/* 3. Éditeur / Modifier Tous les Matchs (Prochains & Terminés/Notés) */}
                <div className="bg-black/30 rounded-3xl p-6 border border-[#D4AF37]/20">
                  <h3 className="text-sm font-extrabold text-[#D4AF37] mb-4 uppercase tracking-wider flex items-center gap-2">
                    <span>✏️</span> Éditer & Noter les Matchs
                  </h3>
                  <div className="flex gap-2 mb-4 bg-white/5 p-1 rounded-xl">
                    <button
                      onClick={() => setEditFilterType('prochains')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                        editFilterType === 'prochains' ? 'bg-[#D4AF37] text-black' : 'text-gray-400'
                      }`}
                    >
                      🟢 Prochains Matchs
                    </button>
                    <button
                      onClick={() => setEditFilterType('historique')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                        editFilterType === 'historique' ? 'bg-[#D4AF37] text-black' : 'text-gray-400'
                      }`}
                    >
                      🔴 Matchs Terminés/Notés
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(editFilterType === 'prochains' ? prochainsMatchs : historique).map((m: any) => (
                      <div key={m.id} className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center justify-between">
                        <div>
                          <p className="font-extrabold text-[#D4AF37] text-xs">DYNO vs {m.adversaire}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {m.type} • {fdf(m.date)} {m.termine && `• Score: ${m.scoreDyno}-${m.scoreAdversaire}`}
                          </p>
                        </div>
                        <button
                          onClick={() => triggerScoreEdit(m)}
                          className="px-4 py-2 rounded-xl font-extrabold bg-[#D4AF37]/20 text-[#D4AF37] text-xs border border-[#D4AF37]/30 hover:bg-[#D4AF37] hover:text-black transition-all"
                        >
                          Éditer 📝
                        </button>
                      </div>
                    ))}
                    {(editFilterType === 'prochains' ? prochainsMatchs : historique).length === 0 && (
                      <p className="text-center text-xs text-gray-500 py-4">Aucun match dans cette catégorie</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleAdminLogout}
                  className="w-full bg-white/5 border border-red-500/20 text-red-400 py-3 rounded-xl font-bold text-sm hover:bg-red-500/10 transition-all"
                >
                  🚪 Déconnexion de l'Admin
                </button>
              </div>
            )}

            {/* Score Edit Modal / Éditeur de Matchs & Sous-Matchs */}
            {scoreEdit && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
                <div className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] rounded-3xl p-6 w-full max-w-md border border-[#D4AF37]/30 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-lg font-black bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-5 text-center">
                    📝 Éditer Match: {scoreEdit.adversaire}
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1.5 block">
                        Adversaire
                      </label>
                      <input
                        type="text"
                        value={scoreEdit.adversaire}
                        onChange={e => setScoreEdit({ ...scoreEdit, adversaire: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1.5 block">
                        Type de Match
                      </label>
                      <select
                        value={scoreEdit.type}
                        onChange={e => setScoreEdit({ ...scoreEdit, type: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                      >
                        <option value="Ligue">Ligue</option>
                        <option value="Scrim">Scrim</option>
                        <option value="Tournoi">Tournoi</option>
                        <option value="Division">Division</option>
                      </select>
                    </div>

                    {scoreEdit.type !== 'Division' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1.5 block">
                            Score DYNO
                          </label>
                          <input
                            type="number"
                            value={scoreEdit.scoreDyno}
                            onChange={e => setScoreEdit({ ...scoreEdit, scoreDyno: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center font-black text-xl focus:outline-none focus:border-[#D4AF37]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1.5 block">
                            Score Adv
                          </label>
                          <input
                            type="number"
                            value={scoreEdit.scoreAdv}
                            onChange={e => setScoreEdit({ ...scoreEdit, scoreAdv: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center font-black text-xl focus:outline-none focus:border-[#D4AF37]"
                          />
                        </div>
                      </div>
                    )}

                    {scoreEdit.type === 'Division' && (
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <p className="text-[11px] text-[#D4AF37] font-extrabold uppercase tracking-wider">
                            🏆 Détails des Sous-Matchs
                          </p>
                          <button
                            onClick={addScoreEditSubmatch}
                            className="px-3 py-1.5 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] font-bold text-xs hover:bg-[#D4AF37] hover:text-black transition-all"
                          >
                            ➕ Ajouter Submatch
                          </button>
                        </div>

                        {scoreEdit.sousMatchs?.map((sm: any, i: number) => (
                          <div key={i} className="bg-black/50 rounded-xl p-3 border border-white/5 space-y-2">
                            <div className="flex justify-between items-center">
                              <input
                                type="text"
                                value={sm.adversaire}
                                onChange={e => updateScoreEditSubmatch(i, 'adversaire', e.target.value)}
                                placeholder="Nom du match (ex: Game 1)"
                                className="bg-transparent border-b border-white/10 text-white text-xs font-bold py-1 focus:outline-none focus:border-[#D4AF37]"
                              />
                              <button onClick={() => removeScoreEditSubmatch(i)} className="text-red-400/50 hover:text-red-500 text-xs">
                                🗑️ Supprimer
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[8px] text-gray-400 uppercase">Score DYNO</label>
                                <input
                                  type="number"
                                  value={sm.scoreDyno}
                                  onChange={e => updateScoreEditSubmatch(i, 'scoreDyno', e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-center font-bold text-sm text-white"
                                />
                              </div>
                              <div>
                                <label className="text-[8px] text-gray-400 uppercase">Score Adv</label>
                                <input
                                  type="number"
                                  value={sm.scoreAdv}
                                  onChange={e => updateScoreEditSubmatch(i, 'scoreAdv', e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-center font-bold text-sm text-white"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setScoreEdit(null)}
                      className="flex-1 py-3 rounded-xl font-bold bg-white/5 border border-white/10 text-gray-400 text-sm hover:bg-white/10 transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={updateScore}
                      className="flex-1 py-3 rounded-xl font-black bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/30 text-sm hover:scale-[1.02] transition-all"
                    >
                      💾 Enregistrer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Navigation / Bottom Bar */}
      <nav className="fixed bottom-4 left-4 right-4 z-50">
        <div className="max-w-lg mx-auto flex backdrop-blur-2xl bg-black/60 rounded-2xl border border-[#D4AF37]/20 shadow-[0_8px_32px_rgba(0,0,0,0.7)] overflow-x-auto overflow-y-hidden py-1.5 px-1 gap-1">
          {[
            { t: 'matchs', i: '📅', l: 'Matchs' },
            { t: 'historique', i: '📜', l: 'Histo' },
            { t: 'notes', i: '📊', l: 'Notes' },
            { t: 'objectifs', i: '🎯', l: 'Objectifs' },
            { t: 'rec', i: '🎬', l: 'Replays' },
            { t: 'roster', i: '👥', l: 'Roster' },
            { t: 'stats', i: '📈', l: 'Stats' },
            { t: 'admin', i: '⚙️', l: 'Admin' }
          ].map(({ t, i, l }) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 py-2 px-3 text-center transition-all duration-300 rounded-xl relative ${
                activeTab === t ? 'bg-[#D4AF37]/15 text-[#D4AF37]' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span className="text-sm block">{i}</span>
              <span className="text-[9px] font-extrabold uppercase mt-1 block tracking-wider">{l}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Auth / Sign In Modal */}
      {!user && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <Particles />
          <div className="bg-gradient-to-br from-[#111111] to-[#050505] rounded-3xl p-8 w-full max-w-sm border border-[#D4AF37]/30 shadow-[0_16px_64px_rgba(212,175,55,0.15)] relative z-10">
            <img src={LG} alt="D" className="w-16 h-16 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(212,175,55,0.6)]" />
            <h3 className="text-xl font-black bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-6 text-center tracking-wide">
              {isSignUp ? '📝 Créer un compte' : '🔒 Connexion Esport'}
            </h3>
            {isSignUp && (
              <input
                type="text"
                placeholder="Pseudo"
                value={pseudo}
                onChange={e => setPseudo(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 mb-3 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
              />
            )}
            <input
              type="email"
              placeholder="Adresse Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 mb-3 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={authPassword}
              onChange={e => setAuthPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 mb-6 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
            />
            {isSignUp ? (
              <button
                onClick={handleSignUp}
                className="w-full py-3.5 rounded-xl font-extrabold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/30 mb-4 text-sm"
              >
                ✅ S'inscrire
              </button>
            ) : (
              <button
                onClick={handleSignIn}
                className="w-full py-3.5 rounded-xl font-extrabold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/30 mb-4 text-sm"
              >
                🔐 Se Connecter
              </button>
            )}
            <div className="border-t border-white/10 pt-4 text-center">
              {isSignUp ? (
                <button onClick={() => setIsSignUp(false)} className="text-[#D4AF37] text-xs font-bold hover:underline">
                  Déjà un compte ? Connecte-toi ici
                </button>
              ) : (
                <button onClick={() => setIsSignUp(true)} className="text-[#D4AF37] text-xs font-bold hover:underline">
                  Pas de compte ? Inscris-toi ici
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
