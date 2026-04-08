import { useState, useEffect, useCallback, useRef } from 'react'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, getDoc, setDoc } from 'firebase/firestore'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth'

const firebaseConfig = { apiKey: "AIzaSyDXwItLM0OZ0VmHj-DLZcH8OBy7wXiHBsM", authDomain: "dyno-esport.firebaseapp.com", projectId: "dyno-esport", storageBucket: "dyno-esport.firebasestorage.app", messagingSenderId: "808658404731", appId: "1:808658404731:web:f3cf29142d3038816f29de" }
const app = initializeApp(firebaseConfig); const db = getFirestore(app); const auth = getAuth(app)
setPersistence(auth, browserLocalPersistence).catch(() => {})

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1489600048474886295/HfR7YhCRuDpjN6NCw133bShUF9Gj1gak-fWtTYVYgI2G_gllQ001kRfH0w57mUuCTytp'
const YOUTUBE_CHANNEL = 'https://youtube.com/@jonathanla890?si=eHtXG1hjlmCuZ-RC'
const LOGO_URL = 'https://i.imgur.com/gTLj57a.png'
const ADMIN_EMAIL = 'thibaut.llorens@hotmail.com'
const ALL_MAPS = ['Engine','Helios','Silva','The Cliff','Artefact','Outlaw','Atlantis','Horizon','Polaris','Lunar','Ceres']
const DIVISIONS: Record<number, string[]> = { 1: ['Edgerunners','Diamond Dogs','BEVA','EHPAD Thaï'], 2: ['Evakadabra','Frer','GOTS','ONYX'], 3: ['STORM','Les Touristes','Peacekeepers','Eau De Source'], 4: ['Resistance 84','DADA','NUKE','Must Have'], 5: ['AQUILA','OWL','DYNO','EYLAU'] }
const getMatchsDiv = (div: number) => { const t = DIVISIONS[div]; const m: {equipe1:string;equipe2:string}[] = []; for(let i=0;i<t.length;i++) for(let j=i+1;j<t.length;j++) m.push({equipe1:t[i],equipe2:t[j]}); return m }
const Particles = () => (<div className="particles">{Array.from({length:12}).map((_,i) => <div key={i} className="particle" />)}</div>)

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
  const [commentaires, setCommentaires] = useState<any[]>([])
  const [pronostics, setPronostics] = useState<any[]>([])
  const [pronoResults, setPronoResults] = useState<any[]>([])
  const [compos, setCompos] = useState<any[]>([])
  const [nouveauMatch, setNouveauMatch] = useState({adversaire:'',date:'',horaire1:'',horaire2:'',arene:'Arène 1',type:'Ligue'})
  const [scoreEdit, setScoreEdit] = useState<any>(null)
  const [nouveauReplay, setNouveauReplay] = useState({titre:'',lien:''})
  const [nouvelleNote, setNouvelleNote] = useState({matchId:'',mental:'',communication:'',gameplay:''})
  const [selectedMatchForNotes, setSelectedMatchForNotes] = useState<any>(null)
  const [nouvelleStrat, setNouvelleStrat] = useState({adversaire:'',picks:[] as string[],bans:[] as string[]})
  const [showAddStrat, setShowAddStrat] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)
  const [countdowns, setCountdowns] = useState<Record<string,string>>({})
  const [nouveauCommentaire, setNouveauCommentaire] = useState('')
  const [selectedMatchForComment, setSelectedMatchForComment] = useState<any>(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [notifiedMatchs, setNotifiedMatchs] = useState<string[]>([])
  const [selectedDiv, setSelectedDiv] = useState(5)
  const [selectedMapCompo, setSelectedMapCompo] = useState('')
  const [compoJoueurs, setCompoJoueurs] = useState<string[]>([])
  const [showAddCompo, setShowAddCompo] = useState(false)
  const [anniversaire, setAnniversaire] = useState('')
  const [viewMode, setViewMode] = useState<'list'|'grid'>('list')
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const prevMatchCount = useRef(0); const prevNoteCount = useRef(0); const prevCommentCount = useRef(0); const prevStratCount = useRef(0)
  const touchStartY = useRef(0)

  useEffect(() => { if(window.location.search.includes('reset=1')){localStorage.clear();window.location.href=window.location.pathname} }, [])

  const sendNotification = useCallback((title:string,body:string,tag?:string) => {
    try{if(!('Notification' in window)||Notification.permission!=='granted')return;const n=new Notification(title,{body,icon:LOGO_URL,badge:LOGO_URL,tag:tag||'dyno-notif',requireInteraction:false});n.onclick=()=>{window.focus();n.close()}}catch(e){console.error('Erreur notification:',e)}
  }, [])

  const requestNotificationPermission = async () => {
    try{if(!('Notification' in window)){alert('❌ Non supporté');return};const p=await Notification.requestPermission();if(p==='granted'){setNotificationsEnabled(true);localStorage.setItem('dyno-notifs','true');alert('✅ Notifications activées !')}else{setNotificationsEnabled(false);localStorage.setItem('dyno-notifs','false');alert('❌ Refusées')}}catch{alert('❌ Erreur')}
  }

  const getMatchDateTime = useCallback((match:any):Date|null => {
    if(!match?.date)return null;let d=match.date;const t=match.horaires?.[0]||match.horaire1||'20:00';if(d.includes('/')){const[dd,mm,yy]=d.split('/');d=`${yy}-${mm}-${dd}`};try{const dt=new Date(`${d}T${t}:00`);return isNaN(dt.getTime())?null:dt}catch{return null}
  }, [])

  useEffect(()=>{try{if('Notification' in window&&Notification.permission==='granted'&&localStorage.getItem('dyno-notifs')==='true')setNotificationsEnabled(true)}catch{};try{setNotifiedMatchs(JSON.parse(localStorage.getItem('dyno-notified')||'[]'))}catch{setNotifiedMatchs([])}}, [])

  useEffect(()=>{
    if(!notificationsEnabled)return;try{if(!('Notification' in window)||Notification.permission!=='granted')return}catch{return}
    const check=()=>{const now=new Date();matchs.forEach((m:any)=>{if(m.termine)return;const mt=getMatchDateTime(m);if(!mt)return;const dm=(mt.getTime()-now.getTime())/60000;const k1=`${m.id}-1h`;if(dm>55&&dm<=65&&!notifiedMatchs.includes(k1)){sendNotification('🎮 Match dans 1h !',`⚔️ VS ${m.adversaire}\n🏟️ ${m.arene}`,'match-1h');const u=[...notifiedMatchs,k1];setNotifiedMatchs(u);localStorage.setItem('dyno-notified',JSON.stringify(u))};const k2=`${m.id}-15m`;if(dm>10&&dm<=20&&!notifiedMatchs.includes(k2)){sendNotification('🔥 Match dans 15 min !',`⚔️ VS ${m.adversaire}`,'match-15m');const u=[...notifiedMatchs,k2];setNotifiedMatchs(u);localStorage.setItem('dyno-notified',JSON.stringify(u))};const k3=`${m.id}-now`;if(dm>=-2&&dm<=3&&!notifiedMatchs.includes(k3)){sendNotification('⚡ C\'EST MAINTENANT !',`⚔️ VS ${m.adversaire} GO !`,'match-now');const u=[...notifiedMatchs,k3];setNotifiedMatchs(u);localStorage.setItem('dyno-notified',JSON.stringify(u))}})};check();const i=setInterval(check,60000);return()=>clearInterval(i)
  }, [notificationsEnabled,matchs,notifiedMatchs,sendNotification,getMatchDateTime])

  useEffect(()=>{const update=()=>{const now=new Date();const c:Record<string,string>={};matchs.forEach((m:any)=>{if(m.termine)return;const mt=getMatchDateTime(m);if(!mt)return;const df=mt.getTime()-now.getTime();if(df<=0){c[m.id]='🔴 EN COURS';return};const j=Math.floor(df/86400000),h=Math.floor((df%86400000)/3600000),mi=Math.floor((df%3600000)/60000),s=Math.floor((df%60000)/1000);c[m.id]=`${j>0?j+'j ':''}${(h>0||j>0)?h+'h ':''}${mi}m ${s}s`});setCountdowns(c)};update();const i=setInterval(update,1000);return()=>clearInterval(i)}, [matchs,getMatchDateTime])

  useEffect(()=>{if(localStorage.getItem('dyno-admin')==='true')setIsAdmin(true)}, [])
  useEffect(()=>{const unsub=onAuthStateChanged(auth,async(u:any)=>{setUser(u);if(u){const d=await getDoc(doc(db,'users',u.uid));if(d.exists()){const data=d.data();setPseudo(data.pseudo||'');if(data.anniversaire)setAnniversaire(data.anniversaire);if(u.email===ADMIN_EMAIL||data.isAdmin){setIsAdmin(true);localStorage.setItem('dyno-admin','true')}}};setLoading(false)});return()=>unsub()}, [])

  useEffect(()=>{const q=query(collection(db,'matchs'),orderBy('createdAt','desc'));const u=onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setMatchs(d)});return()=>u()}, [])
  useEffect(()=>{const q=query(collection(db,'notes'),orderBy('createdAt','desc'));const u=onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setNotes(d)});return()=>u()}, [])
  useEffect(()=>{const q=query(collection(db,'commentaires'),orderBy('createdAt','desc'));const u=onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setCommentaires(d)});return()=>u()}, [])
  useEffect(()=>{const q=query(collection(db,'strats'),orderBy('createdAt','desc'));const u=onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setStrats(d)});return()=>u()}, [])
  useEffect(()=>{const q=query(collection(db,'replays'),orderBy('createdAt','desc'));const u=onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setReplays(d)});return()=>u()}, [])
  useEffect(()=>{const q=query(collection(db,'players'),orderBy('createdAt','desc'));const u=onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setJoueurs(d)});return()=>u()}, [])
  useEffect(()=>{const q=query(collection(db,'pronostics'),orderBy('createdAt','desc'));const u=onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setPronostics(d)});return()=>u()}, [])
  useEffect(()=>{const q=query(collection(db,'pronoResults'),orderBy('createdAt','desc'));const u=onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setPronoResults(d)});return()=>u()}, [])
  useEffect(()=>{const q=query(collection(db,'compos'),orderBy('createdAt','desc'));const u=onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setCompos(d)});return()=>u()}, [])

  useEffect(()=>{if(!notificationsEnabled||prevMatchCount.current===0){prevMatchCount.current=matchs.length;return};if(matchs.length>prevMatchCount.current){const n=matchs[0];if(n)sendNotification('📅 Nouveau Match !',`⚔️ VS ${n.adversaire}\n🏟️ ${n.arene}`,'new-match')};prevMatchCount.current=matchs.length}, [matchs,notificationsEnabled,sendNotification])
  useEffect(()=>{if(!notificationsEnabled||prevNoteCount.current===0){prevNoteCount.current=notes.length;return};if(notes.length>prevNoteCount.current){const n=notes[0];if(n)sendNotification('📊 Nouvelle Note !',`${n.joueur}: 🧠${n.mental} 💬${n.communication} 🎯${n.gameplay}`,'new-note')};prevNoteCount.current=notes.length}, [notes,notificationsEnabled,sendNotification])
  useEffect(()=>{if(!notificationsEnabled||prevCommentCount.current===0){prevCommentCount.current=commentaires.length;return};if(commentaires.length>prevCommentCount.current){const n=commentaires[0];if(n)sendNotification('💬 Commentaire !',`${n.joueur}: "${n.texte.substring(0,60)}"`,'new-comment')};prevCommentCount.current=commentaires.length}, [commentaires,notificationsEnabled,sendNotification])
  useEffect(()=>{if(!notificationsEnabled||prevStratCount.current===0){prevStratCount.current=strats.length;return};if(strats.length>prevStratCount.current){const n=strats[0];if(n)sendNotification('🎯 Nouvelle Strat !',`VS ${n.adversaire}`,'new-strat')};prevStratCount.current=strats.length}, [strats,notificationsEnabled,sendNotification])

  useEffect(()=>{const t=setTimeout(()=>setShowSplash(false),2500);return()=>clearTimeout(t)}, [])
  useEffect(()=>{window.addEventListener('beforeinstallprompt',(e:any)=>{e.preventDefault();setDeferredPrompt(e);setShowInstall(true)})}, [])

  const handleInstall=()=>{if(deferredPrompt){deferredPrompt.prompt();setDeferredPrompt(null);setShowInstall(false)}}
  const handleSignUp=async()=>{if(!email||!authPassword||!pseudo){alert('⚠️ Remplis tout !');return};try{const r=await createUserWithEmailAndPassword(auth,email,authPassword);await setDoc(doc(db,'users',r.user.uid),{pseudo,email,createdAt:Date.now(),isAdmin:email===ADMIN_EMAIL});await addDoc(collection(db,'players'),{pseudo,role:'Joueur',rang:'Nouveau',userId:r.user.uid,createdAt:Date.now()});alert('✅ Compte créé !');setIsSignUp(false);setEmail('');setAuthPassword('')}catch(e:any){alert('❌ '+e.message)}}
  const handleSignIn=async()=>{if(!email||!authPassword){alert('⚠️ Remplis tout !');return};try{await setPersistence(auth,browserLocalPersistence);await signInWithEmailAndPassword(auth,email,authPassword);localStorage.setItem('user-email',email);alert('✅ Connecté !');setEmail('');setAuthPassword('')}catch(e:any){alert('❌ '+e.message)}}
  const handleSignOut=async()=>{await signOut(auth);setPseudo('');setIsAdmin(false);localStorage.removeItem('dyno-admin');localStorage.removeItem('user-email');alert('✅ Déconnecté !')}
  const handleAdminLogin=()=>{if(adminPassword==='dyno2026'){setIsAdmin(true);localStorage.setItem('dyno-admin','true');setAdminPassword('')}else alert('❌ Mot de passe incorrect !')}
  const handleAdminLogout=()=>{setIsAdmin(false);localStorage.removeItem('dyno-admin')}

  const ajouterMatch=async()=>{if(!nouveauMatch.adversaire||!nouveauMatch.date||!nouveauMatch.horaire1){alert('⚠️ Remplis tout !');return};await addDoc(collection(db,'matchs'),{...nouveauMatch,termine:false,disponibles:[],indisponibles:[],createdAt:Date.now()});const h=[nouveauMatch.horaire1];if(nouveauMatch.horaire2)h.push(nouveauMatch.horaire2);try{await fetch(DISCORD_WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({embeds:[{title:'🎮 NOUVEAU MATCH DYNO !',color:13934871,fields:[{name:'⚔️ Adversaire',value:nouveauMatch.adversaire,inline:true},{name:'📅 Date',value:nouveauMatch.date,inline:true},{name:'⏰ Horaire',value:h.join(' / '),inline:true},{name:'🏟️ Arène',value:nouveauMatch.arene,inline:true},{name:'📊 Type',value:nouveauMatch.type,inline:true}],footer:{text:'DYNO Esport',icon_url:LOGO_URL}}]})})}catch{};setNouveauMatch({adversaire:'',date:'',horaire1:'',horaire2:'',arene:'Arène 1',type:'Ligue'});alert('✅ Match ajouté !')}
  const ajouterReplay=async()=>{if(!nouveauReplay.titre||!nouveauReplay.lien){alert('⚠️ Remplis tout !');return};await addDoc(collection(db,'replays'),{...nouveauReplay,createdAt:Date.now()});setNouveauReplay({titre:'',lien:''});alert('✅ Replay ajouté !')}
  const ajouterNote=async()=>{if(!user){alert('⚠️ Connecte-toi !');return};await addDoc(collection(db,'notes'),{matchId:selectedMatchForNotes?.id,joueur:pseudo,joueurId:user.uid,...nouvelleNote,createdAt:Date.now()});setNouvelleNote({matchId:'',mental:'',communication:'',gameplay:''});setSelectedMatchForNotes(null);alert('✅ Note ajoutée !')}
  const ajouterCommentaire=async(matchId:string)=>{if(!user){alert('⚠️ Connecte-toi !');return};if(!nouveauCommentaire.trim()){alert('⚠️ Écris !');return};await addDoc(collection(db,'commentaires'),{matchId,joueur:pseudo,joueurId:user.uid,texte:nouveauCommentaire.trim(),createdAt:Date.now()});setNouveauCommentaire('');setSelectedMatchForComment(null);alert('✅ Commentaire ajouté !')}
  const ajouterStrat=async()=>{if(!nouvelleStrat.adversaire||nouvelleStrat.picks.length===0||nouvelleStrat.bans.length===0){alert('⚠️ Remplis tout !');return};await addDoc(collection(db,'strats'),{adversaire:nouvelleStrat.adversaire,picks:nouvelleStrat.picks,bans:nouvelleStrat.bans,auteur:pseudo,auteurId:user?.uid,createdAt:Date.now()});setNouvelleStrat({adversaire:'',picks:[],bans:[]});setShowAddStrat(false);alert('✅ Stratégie ajoutée !')}
  const envoyerProno=async(div:number,e1:string,e2:string,s1:string,s2:string)=>{if(!user)return;const mk=`${div}-${e1}-${e2}`;const ex=pronostics.find((p:any)=>p.matchKey===mk&&p.joueurId===user.uid);if(ex){await updateDoc(doc(db,'pronostics',ex.id),{score1:parseInt(s1),score2:parseInt(s2),updatedAt:Date.now()})}else{await addDoc(collection(db,'pronostics'),{matchKey:mk,div,equipe1:e1,equipe2:e2,score1:parseInt(s1),score2:parseInt(s2),joueur:pseudo,joueurId:user.uid,createdAt:Date.now()})};alert('✅ Prono enregistré !')}
  const entrerResultat=async(div:number,e1:string,e2:string,s1:string,s2:string)=>{const mk=`${div}-${e1}-${e2}`;const ex=pronoResults.find((r:any)=>r.matchKey===mk);if(ex){await updateDoc(doc(db,'pronoResults',ex.id),{score1:parseInt(s1),score2:parseInt(s2)})}else{await addDoc(collection(db,'pronoResults'),{matchKey:mk,div,equipe1:e1,equipe2:e2,score1:parseInt(s1),score2:parseInt(s2),createdAt:Date.now()})};alert('✅ Résultat enregistré !')}
  const getPronoPoints=(joueurId:string)=>{let pts=0;pronoResults.forEach((r:any)=>{const p=pronostics.find((x:any)=>x.matchKey===r.matchKey&&x.joueurId===joueurId);if(!p)return;if(p.score1===r.score1&&p.score2===r.score2)pts+=3;else if((p.score1>p.score2&&r.score1>r.score2)||(p.score1<p.score2&&r.score1<r.score2))pts+=1});return pts}
  const ajouterCompo=async()=>{if(!selectedMapCompo||compoJoueurs.length===0){alert('⚠️ Choisis map + joueurs !');return};const ex=compos.find((c:any)=>c.map===selectedMapCompo);if(ex){await updateDoc(doc(db,'compos',ex.id),{joueurs:compoJoueurs,updatedAt:Date.now()})}else{await addDoc(collection(db,'compos'),{map:selectedMapCompo,joueurs:compoJoueurs,auteur:pseudo,createdAt:Date.now()})};setShowAddCompo(false);setSelectedMapCompo('');setCompoJoueurs([]);alert('✅ Compo sauvegardée !')}
  const toggleCompoJoueur=(name:string)=>{if(compoJoueurs.includes(name))setCompoJoueurs(compoJoueurs.filter(j=>j!==name));else setCompoJoueurs([...compoJoueurs,name])}
  const sauvegarderAnniversaire=async()=>{if(!user||!anniversaire){alert('⚠️ Entre ta date !');return};await updateDoc(doc(db,'users',user.uid),{anniversaire});alert('✅ Anniversaire sauvegardé !')}

  const supprimerMatch=async(id:string)=>{await deleteDoc(doc(db,'matchs',id));alert('✅ Supprimé !')}
  const supprimerReplay=async(id:string)=>{await deleteDoc(doc(db,'replays',id));alert('✅ Supprimé !')}
  const supprimerJoueur=async(id:string)=>{await deleteDoc(doc(db,'players',id));alert('✅ Supprimé !')}
  const supprimerStrat=async(id:string)=>{await deleteDoc(doc(db,'strats',id));alert('✅ Supprimé !')}
  const supprimerNote=async(id:string)=>{await deleteDoc(doc(db,'notes',id));alert('✅ Supprimé !')}
  const supprimerCommentaire=async(id:string)=>{await deleteDoc(doc(db,'commentaires',id));alert('✅ Supprimé !')}
  const supprimerCompo=async(id:string)=>{await deleteDoc(doc(db,'compos',id));alert('✅ Supprimé !')}
  const updateScore=async()=>{if(!scoreEdit)return;await updateDoc(doc(db,'matchs',scoreEdit.id),{scoreDyno:parseInt(scoreEdit.scoreDyno),scoreAdversaire:parseInt(scoreEdit.scoreAdv),termine:true});setScoreEdit(null);alert('✅ Score mis à jour !')}
  const toggleDisponibilite=async(matchId:string)=>{if(!user)return;const m=matchs.find((x:any)=>x.id===matchId);if(!m)return;const d=m.disponibles||[],i=m.indisponibles||[];await updateDoc(doc(db,'matchs',matchId),{disponibles:d.includes(pseudo)?d.filter((p:string)=>p!==pseudo):[...d,pseudo],indisponibles:i.filter((p:string)=>p!==pseudo)})}
  const toggleIndisponibilite=async(matchId:string)=>{if(!user)return;const m=matchs.find((x:any)=>x.id===matchId);if(!m)return;const d=m.disponibles||[],i=m.indisponibles||[];await updateDoc(doc(db,'matchs',matchId),{indisponibles:i.includes(pseudo)?i.filter((p:string)=>p!==pseudo):[...i,pseudo],disponibles:d.filter((p:string)=>p!==pseudo)})}
  const formatDateFR=(s:string)=>{if(!s)return'';if(s.includes('/'))return s;const[y,m,d]=s.split('-');return`${d}/${m}/${y}`}
  const formatTimestamp=(t:number)=>{const d=new Date(t);return`${d.toLocaleDateString('fr-FR')} à ${d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}`}
  const addToCalendar=(match:any)=>{try{if(!match?.date){alert('⚠️ Match non trouvé');return};let y:string,m:string,d:string;if(match.date.includes('/')){const[dd,mm,yy]=match.date.split('/');d=dd;m=mm;y=yy}else{const[yy,mm,dd]=match.date.split('-');y=yy;m=mm;d=dd};const md=`${y}${m}${d}`;let h='20',mi='00';if(match.horaires?.length>0){const[hh,mm]=match.horaires[0].split(':');h=hh;mi=mm||'00'}else if(match.horaire1){const[hh,mm]=match.horaire1.split(':');h=hh;mi=mm||'00'};const st=`${h}${mi}00`,et=`${(parseInt(h)+2).toString().padStart(2,'0')}${mi}00`;if(/iPad|iPhone|iPod/.test(navigator.userAgent)){const ics=`BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:${match.id}@dyno\nDTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').split('.')[0]}Z\nDTSTART:${md}T${st}\nDTEND:${md}T${et}\nSUMMARY:🎮 DYNO vs ${match.adversaire}\nLOCATION:${match.arene}\nEND:VEVENT\nEND:VCALENDAR`;const b=new Blob([ics],{type:'text/calendar'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=`DYNO_vs_${match.adversaire}.ics`;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(u)}else{window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`🎮 DYNO vs ${match.adversaire}`)}&dates=${md}T${st}/${md}T${et}&location=${encodeURIComponent(match.arene)}`,'_blank')}}catch(e:any){alert('❌ '+e.message)}}

  const victoires=matchs.filter((m:any)=>m.termine&&(m.scoreDyno||0)>(m.scoreAdversaire||0)).length
  const defaites=matchs.filter((m:any)=>m.termine&&(m.scoreDyno||0)<(m.scoreAdversaire||0)).length
  const totalMatchs=victoires+defaites
  const winRate=totalMatchs>0?Math.round((victoires/totalMatchs)*100):0
  const prochainsMatchs=matchs.filter((m:any)=>!m.termine).sort((a:any,b:any)=>new Date(`${a.date}T${a.horaires?.[0]||a.horaire1||'20:00'}`).getTime()-new Date(`${b.date}T${b.horaires?.[0]||b.horaire1||'20:00'}`).getTime())
  const historique=matchs.filter((m:any)=>m.termine)
  const getYouTubeId=(url:string)=>{const m=url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);return m?m[1]:null}
  const toggleMapSelection=(map:string,type:'picks'|'bans')=>{if(type==='picks'){if(nouvelleStrat.picks.includes(map))setNouvelleStrat({...nouvelleStrat,picks:nouvelleStrat.picks.filter(m=>m!==map)});else if(nouvelleStrat.picks.length<4)setNouvelleStrat({...nouvelleStrat,picks:[...nouvelleStrat.picks,map]})}else{if(nouvelleStrat.bans.includes(map))setNouvelleStrat({...nouvelleStrat,bans:nouvelleStrat.bans.filter(m=>m!==map)});else if(nouvelleStrat.bans.length<4)setNouvelleStrat({...nouvelleStrat,bans:[...nouvelleStrat.bans,map]})}}

  const handleTouchStart=(e:React.TouchEvent)=>{touchStartY.current=e.touches[0].clientY}
  const handleTouchMove=(e:React.TouchEvent)=>{if(window.scrollY>0)return;const diff=e.touches[0].clientY-touchStartY.current;if(diff>0)setPullDistance(Math.min(diff*0.4,80))}
  const handleTouchEnd=()=>{if(pullDistance>60){setIsRefreshing(true);setTimeout(()=>{window.location.reload()},500)};setPullDistance(0)}

  const H=({title,icon}:{title:string;icon?:string})=>(<div className="relative rounded-3xl p-7 mb-6 text-center overflow-hidden bg-gradient-to-br from-[#D4AF37]/10 via-[#D4AF37]/5 to-transparent border border-[#D4AF37]/15 shadow-[0_8px_32px_rgba(212,175,55,0.1)] glow-pulse"><div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent" /><img src={LOGO_URL} alt="DYNO" className="w-16 h-16 mx-auto mb-2 relative z-10 drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]" /><h2 className="text-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent relative z-10">{icon} {title}</h2></div>)
  if(showSplash)return(<div className="min-h-screen flex items-center justify-center relative overflow-hidden"><Particles /><div className="text-center relative z-10"><img src={LOGO_URL} alt="DYNO" className="w-48 h-48 mx-auto splash-logo drop-shadow-[0_0_40px_rgba(212,175,55,0.6)]" /><h1 className="text-5xl font-bold bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] bg-clip-text text-transparent mt-6 splash-text">DYNO</h1><p className="text-gray-400 mt-3 splash-sub tracking-[0.3em] uppercase text-sm">Esport Team</p></div></div>)

  return(
    <div className="min-h-screen pb-28 relative">
      <Particles />
      <header className="backdrop-blur-2xl bg-black/30 border-b border-white/5 sticky top-0 z-50 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5"><img src={LOGO_URL} alt="DYNO" className="w-10 h-10 drop-shadow-[0_0_12px_rgba(212,175,55,0.5)]" /><div><h1 className="text-lg font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent leading-tight">DYNO</h1><p className="text-[9px] text-gray-600 uppercase tracking-widest">Esport</p></div></div>
          <div className="flex gap-1.5 items-center">
            {user&&(<button onClick={requestNotificationPermission} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${notificationsEnabled?'bg-[#D4AF37]/20 border border-[#D4AF37]/40 shadow-[0_0_10px_rgba(212,175,55,0.3)]':'bg-white/5 border border-white/10'}`}><span className="text-sm">{notificationsEnabled?'🔔':'🔕'}</span></button>)}
            {showInstall&&(<button onClick={handleInstall} className="px-2.5 py-1.5 rounded-xl font-bold bg-blue-600 text-white text-[10px] hover:scale-105 transition-transform">📲</button>)}
            {user?(<button onClick={handleSignOut} className="px-3 py-1.5 rounded-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/20 text-[11px] hover:scale-105 transition-transform">👋 {pseudo}</button>):(<button onClick={()=>setIsSignUp(false)} className="px-3 py-1.5 rounded-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/20 text-[11px] hover:scale-105 transition-transform">👤 Compte</button>)}
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 relative z-10" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        {pullDistance>0&&(<div className="flex justify-center mb-4 transition-all" style={{height:pullDistance}}><span className={`text-[#D4AF37] text-2xl ${pullDistance>60?'animate-spin':''}`}>{isRefreshing?'⏳':pullDistance>60?'🔄':'⬇️'}</span></div>)}

        {activeTab==='matchs'&&(<div className="tab-content">
          <H title="Prochains Matchs" />
          <div className="flex justify-end mb-3"><div className="flex bg-white/5 rounded-xl border border-white/10 overflow-hidden"><button onClick={()=>setViewMode('list')} className={`px-3 py-1.5 text-xs transition-all ${viewMode==='list'?'bg-[#D4AF37]/20 text-[#D4AF37]':'text-gray-600'}`}>☰</button><button onClick={()=>setViewMode('grid')} className={`px-3 py-1.5 text-xs transition-all ${viewMode==='grid'?'bg-[#D4AF37]/20 text-[#D4AF37]':'text-gray-600'}`}>⊞</button></div></div>
          {loading?(<div className="space-y-4"><div className="skeleton h-48 w-full" /><div className="skeleton h-48 w-full" /></div>):prochainsMatchs.length===0?(<div className="text-center py-10 text-gray-600">📭 Aucun match</div>):(<div className={viewMode==='grid'?'grid grid-cols-2 gap-3':'space-y-4'}>{prochainsMatchs.map((match:any,idx:number)=>(<div key={match.id} className="card-glow bg-black/30 backdrop-blur-lg rounded-3xl p-4 border border-[#D4AF37]/15 shadow-[0_8px_32px_rgba(0,0,0,0.3)]" style={{animationDelay:`${idx*0.1}s`}}>
            <div className="flex items-center justify-between mb-3"><span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${match.type==='Ligue'?'bg-blue-500/20 text-blue-400 border border-blue-500/20':match.type==='Scrim'?'bg-green-500/20 text-green-400 border border-green-500/20':match.type==='Tournoi'?'bg-purple-500/20 text-purple-400 border border-purple-500/20':'bg-orange-500/20 text-orange-400 border border-orange-500/20'}`}>{match.type}</span><span className="text-[#D4AF37] font-bold text-xs">{formatDateFR(match.date)}</span></div>
            {countdowns[match.id]&&(<div className={`rounded-2xl p-2.5 mb-3 text-center border ${countdowns[match.id]==='🔴 EN COURS'?'bg-red-500/10 border-red-500/15':'bg-[#D4AF37]/10 border-[#D4AF37]/15'}`}><p className="text-[9px] text-gray-600 uppercase tracking-wider">Countdown</p><p className={`text-lg font-bold font-mono tracking-wider ${countdowns[match.id]==='🔴 EN COURS'?'text-red-400 animate-pulse':'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent'}`}>{countdowns[match.id]}</p></div>)}
            <div className="flex items-center gap-3 mb-3"><img src={LOGO_URL} alt="DYNO" className="w-10 h-10 drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" /><span className="text-gray-700 font-light">VS</span><div className="flex-1 text-right"><p className="font-bold text-white text-sm">{match.adversaire}</p><p className="text-[10px] text-[#D4AF37]/60">🏟️ {match.arene}</p></div></div>
            <div className="bg-white/5 rounded-xl p-2.5 mb-2 border border-white/5"><p className="text-[9px] text-gray-600 uppercase tracking-wider">⏰ Horaires</p><p className="text-[#D4AF37] font-bold text-xs">{match.horaires?.join(' / ')||match.horaire1||'20:00'}</p></div>
            <div className="bg-white/5 rounded-xl p-2.5 mb-2 border border-white/5"><p className="text-[9px] text-gray-600 mb-1.5 uppercase tracking-wider">👥 Dispo ({(match.disponibles||[]).length})</p>{(match.disponibles||[]).length>0&&(<div className="flex flex-wrap gap-1">{(match.disponibles||[]).map((p:string,i:number)=>(<span key={i} className="bg-[#D4AF37]/15 text-[#D4AF37] px-2 py-0.5 rounded-lg text-[9px] font-bold border border-[#D4AF37]/15">{p}</span>))}</div>)}</div>
            <div className="bg-white/5 rounded-xl p-2.5 mb-3 border border-red-500/10"><p className="text-[9px] text-gray-600 mb-1.5 uppercase tracking-wider">🚫 Indispo ({(match.indisponibles||[]).length})</p>{(match.indisponibles||[]).length>0&&(<div className="flex flex-wrap gap-1">{(match.indisponibles||[]).map((p:string,i:number)=>(<span key={i} className="bg-red-500/15 text-red-400 px-2 py-0.5 rounded-lg text-[9px] font-bold border border-red-500/15">{p}</span>))}</div>)}</div>
            <button onClick={()=>addToCalendar(match)} className="w-full mb-2 py-2 rounded-xl font-bold bg-blue-600/20 text-blue-400 border border-blue-500/15 text-xs hover:bg-blue-600/30 transition-all">📅 Calendrier</button>
            <div className="flex gap-2"><button onClick={()=>toggleDisponibilite(match.id)} disabled={!user} className={`flex-1 py-2.5 rounded-xl font-bold transition-all duration-300 text-xs ${!user?'bg-white/5 text-gray-700':(match.disponibles||[]).includes(pseudo)?'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/30 scale-[1.02]':'bg-white/5 border border-[#D4AF37]/15 text-[#D4AF37]'}`}>{!user?'🔐':(match.disponibles||[]).includes(pseudo)?'✅ Dispo':'📅 Dispo'}</button><button onClick={()=>toggleIndisponibilite(match.id)} disabled={!user} className={`flex-1 py-2.5 rounded-xl font-bold transition-all duration-300 text-xs ${!user?'bg-white/5 text-gray-700':(match.indisponibles||[]).includes(pseudo)?'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30 scale-[1.02]':'bg-white/5 border border-red-500/15 text-red-400'}`}>{!user?'🔐':(match.indisponibles||[]).includes(pseudo)?'❌ Indispo':'🚫 Indispo'}</button></div>
          </div>))}</div>)}
        </div>)}

        {activeTab==='historique'&&(<div className="tab-content">
          <H title="Historique" />
          <div className="grid grid-cols-2 gap-3 mb-6"><div className="card-glow bg-[#D4AF37]/10 rounded-2xl p-4 border border-[#D4AF37]/15 text-center"><p className="text-3xl font-bold text-[#D4AF37] count-up">{victoires}</p><p className="text-[9px] text-gray-600 mt-1 uppercase tracking-wider">Victoires</p></div><div className="card-glow bg-red-500/10 rounded-2xl p-4 border border-red-500/15 text-center"><p className="text-3xl font-bold text-red-500 count-up">{defaites}</p><p className="text-[9px] text-gray-600 mt-1 uppercase tracking-wider">Défaites</p></div></div>
          {historique.length===0?(<div className="text-center py-10 text-gray-600">📜 Aucun</div>):(<div className="space-y-4">{historique.map((match:any,idx:number)=>{const mn=notes.filter((n:any)=>n.matchId===match.id);const mc=commentaires.filter((c:any)=>c.matchId===match.id);return(<div key={match.id} className="card-glow bg-black/30 backdrop-blur-lg rounded-3xl p-5 border border-[#D4AF37]/15 shadow-[0_8px_32px_rgba(0,0,0,0.3)]" style={{animationDelay:`${idx*0.1}s`}}>
            <div className="flex items-center justify-between mb-3"><span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${(match.scoreDyno||0)>(match.scoreAdversaire||0)?'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/20':'bg-red-500/20 text-red-400 border border-red-500/20'}`}>{(match.scoreDyno||0)>(match.scoreAdversaire||0)?'🏆 VICTOIRE':'❌ DÉFAITE'}</span><span className="text-gray-600 text-xs">{formatDateFR(match.date)}</span></div>
            <div className="flex items-center justify-between mb-4"><div className="text-center"><p className="font-bold text-[#D4AF37] text-[10px] uppercase tracking-wider">DYNO</p><p className="text-3xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent count-up">{match.scoreDyno}</p></div><span className="text-gray-800 text-lg">-</span><div className="text-center"><p className="font-bold text-gray-600 text-[10px] uppercase tracking-wider">{match.adversaire}</p><p className="text-3xl font-bold text-gray-500 count-up">{match.scoreAdversaire}</p></div></div>
            <div className="flex gap-2 mb-3"><button onClick={()=>{setSelectedMatchForNotes(match);setNouvelleNote({matchId:match.id,mental:'',communication:'',gameplay:''})}} className="flex-1 py-2 rounded-xl font-bold bg-purple-500/15 text-purple-400 border border-purple-500/15 text-[10px] hover:bg-purple-500/25 transition-all">📝 Notes</button><button onClick={()=>setSelectedMatchForComment(selectedMatchForComment?.id===match.id?null:match)} className="flex-1 py-2 rounded-xl font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/15 text-[10px] hover:bg-cyan-500/25 transition-all">💬 Commenter</button></div>
            {selectedMatchForComment?.id===match.id&&user&&(<div className="bg-white/5 rounded-xl p-3 mb-3 border border-white/5"><textarea placeholder="Ton analyse..." value={nouveauCommentaire} onChange={(e)=>setNouveauCommentaire(e.target.value)} rows={2} className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-400/50 resize-none mb-2" /><button onClick={()=>ajouterCommentaire(match.id)} className="w-full py-2 rounded-lg font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/15 text-xs">💬 Envoyer</button></div>)}
            {mc.length>0&&(<div className="space-y-1.5 mb-3"><p className="text-[9px] text-cyan-400 uppercase tracking-wider">💬 {mc.length} commentaire(s)</p>{mc.map((c:any)=>(<div key={c.id} className="bg-white/5 rounded-lg p-2.5 border border-white/5"><div className="flex items-center justify-between mb-0.5"><p className="text-cyan-400 font-bold text-[10px]">{c.joueur}</p><div className="flex items-center gap-1.5"><p className="text-gray-700 text-[9px]">{formatTimestamp(c.createdAt)}</p>{(isAdmin||user?.uid===c.joueurId)&&<button onClick={()=>supprimerCommentaire(c.id)} className="text-red-400/40 text-[9px]">🗑️</button>}</div></div><p className="text-gray-400 text-xs">{c.texte}</p></div>))}</div>)}
            {mn.length>0?(<div className="space-y-1.5"><p className="text-[9px] text-gray-600 uppercase tracking-wider">📊 {mn.length} note(s)</p>{mn.map((n:any)=>(<div key={n.id} className="bg-white/5 rounded-lg p-2.5 border border-white/5"><div className="flex items-center justify-between mb-1.5"><p className="text-[#D4AF37] font-bold text-[10px]">{n.joueur}</p>{isAdmin&&<button onClick={()=>supprimerNote(n.id)} className="text-red-400/40 text-[9px]">🗑️</button>}</div><div className="grid grid-cols-3 gap-1.5 text-center"><div className="bg-purple-500/10 rounded-lg p-1.5 border border-purple-500/10"><p className="text-[9px] text-gray-600">🧠</p><p className="text-purple-400 font-bold text-xs">{n.mental}/10</p></div><div className="bg-blue-500/10 rounded-lg p-1.5 border border-blue-500/10"><p className="text-[9px] text-gray-600">💬</p><p className="text-blue-400 font-bold text-xs">{n.communication}/10</p></div><div className="bg-green-500/10 rounded-lg p-1.5 border border-green-500/10"><p className="text-[9px] text-gray-600">🎯</p><p className="text-green-400 font-bold text-xs">{n.gameplay}/10</p></div></div></div>))}</div>):(<p className="text-gray-700 text-[10px] text-center">Aucune note</p>)}
          </div>)})}</div>)}
          {selectedMatchForNotes&&(<div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4"><div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-6 w-full max-w-sm border border-white/10 shadow-[0_16px_64px_rgba(0,0,0,0.5)]"><h3 className="text-lg font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-5 text-center">📊 {selectedMatchForNotes.adversaire}</h3><div className="space-y-3 mb-5"><div><label className="text-gray-600 text-[10px] mb-1.5 block uppercase tracking-wider">🧠 Mental</label><input type="number" min="0" max="10" value={nouvelleNote.mental} onChange={(e)=>setNouvelleNote({...nouvelleNote,mental:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-xl font-bold focus:outline-none focus:border-[#D4AF37]/50" /></div><div><label className="text-gray-600 text-[10px] mb-1.5 block uppercase tracking-wider">💬 Comm</label><input type="number" min="0" max="10" value={nouvelleNote.communication} onChange={(e)=>setNouvelleNote({...nouvelleNote,communication:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-xl font-bold focus:outline-none focus:border-[#D4AF37]/50" /></div><div><label className="text-gray-600 text-[10px] mb-1.5 block uppercase tracking-wider">🎯 Perf</label><input type="number" min="0" max="10" value={nouvelleNote.gameplay} onChange={(e)=>setNouvelleNote({...nouvelleNote,gameplay:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-xl font-bold focus:outline-none focus:border-[#D4AF37]/50" /></div></div><div className="flex gap-2"><button onClick={()=>{setSelectedMatchForNotes(null);setNouvelleNote({matchId:'',mental:'',communication:'',gameplay:''})}} className="flex-1 py-2.5 rounded-xl font-bold bg-white/5 border border-white/10 text-gray-500 text-sm">Annuler</button><button onClick={ajouterNote} className="flex-1 py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/30 text-sm hover:scale-105 transition-transform">✅</button></div></div></div>)}
        </div>)}
        {activeTab==='strats'&&(<div className="tab-content">
          <H title="Stratégies" icon="🎯" />
          {user&&(<button onClick={()=>setShowAddStrat(true)} className="w-full mb-5 py-3 rounded-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/20 hover:scale-[1.02] transition-transform text-sm">➕ Nouvelle Stratégie</button>)}
          {strats.length===0?(<div className="text-center py-10 text-gray-600">📝 Aucune</div>):(<div className="space-y-3">{strats.map((s:any,idx:number)=>(<div key={s.id} className="card-glow bg-black/30 backdrop-blur-lg rounded-3xl p-4 border border-[#D4AF37]/15" style={{animationDelay:`${idx*0.1}s`}}>
            <div className="flex items-center justify-between mb-3"><div><p className="font-bold text-[#D4AF37]">VS {s.adversaire}</p><p className="text-[9px] text-gray-600">par {s.auteur||'?'}</p></div>{(isAdmin||user?.uid===s.auteurId)&&<button onClick={()=>supprimerStrat(s.id)} className="text-red-400/40 hover:text-red-400">🗑️</button>}</div>
            <div className="mb-2"><p className="text-[9px] text-green-400 mb-1.5 uppercase tracking-wider">✅ Picks ({s.picks?.length||0}/4)</p><div className="flex flex-wrap gap-1">{s.picks?.map((p:string,i:number)=>(<span key={i} className="bg-green-500/15 text-green-400 px-2.5 py-1 rounded-lg text-[10px] border border-green-500/15 font-bold">{p}</span>))}</div></div>
            <div><p className="text-[9px] text-red-400 mb-1.5 uppercase tracking-wider">❌ Bans ({s.bans?.length||0}/4)</p><div className="flex flex-wrap gap-1">{s.bans?.map((b:string,i:number)=>(<span key={i} className="bg-red-500/15 text-red-400 px-2.5 py-1 rounded-lg text-[10px] border border-red-500/15 font-bold">{b}</span>))}</div></div>
          </div>))}</div>)}
          {showAddStrat&&(<div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4"><div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-5 w-full max-w-md border border-white/10 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-5 text-center">🎯 Nouvelle Stratégie</h3>
            <div className="space-y-3 mb-5">
              <div><label className="text-gray-600 text-[10px] mb-1.5 block uppercase tracking-wider">⚔️ Adversaire</label><input type="text" placeholder="Nom" value={nouvelleStrat.adversaire} onChange={(e)=>setNouvelleStrat({...nouvelleStrat,adversaire:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50" /></div>
              <div><label className="text-gray-600 text-[10px] mb-1.5 block uppercase tracking-wider">✅ Picks (max 4)</label><div className="grid grid-cols-2 gap-1.5">{ALL_MAPS.map(m=>(<button key={m} onClick={()=>toggleMapSelection(m,'picks')} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${nouvelleStrat.picks.includes(m)?'bg-green-600 text-white shadow-lg shadow-green-500/30':'bg-white/5 text-gray-500 hover:bg-white/10'}`}>{m}</button>))}</div></div>
              <div><label className="text-gray-600 text-[10px] mb-1.5 block uppercase tracking-wider">❌ Bans (max 4)</label><div className="grid grid-cols-2 gap-1.5">{ALL_MAPS.map(m=>(<button key={m} onClick={()=>toggleMapSelection(m,'bans')} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${nouvelleStrat.bans.includes(m)?'bg-red-600 text-white shadow-lg shadow-red-500/30':'bg-white/5 text-gray-500 hover:bg-white/10'}`}>{m}</button>))}</div></div>
            </div>
            <div className="flex gap-2"><button onClick={()=>{setShowAddStrat(false);setNouvelleStrat({adversaire:'',picks:[],bans:[]})}} className="flex-1 py-2.5 rounded-xl font-bold bg-white/5 border border-white/10 text-gray-500 text-sm">Annuler</button><button onClick={ajouterStrat} className="flex-1 py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/30 text-sm">✅</button></div>
          </div></div>)}
        </div>)}

        {activeTab==='pronostics'&&(<div className="tab-content">
          <H title="Pronostics" icon="🎰" />
          <div className="flex gap-1.5 mb-5 overflow-x-auto pb-2">
            {[1,2,3,4,5].map(d=>(<button key={d} onClick={()=>setSelectedDiv(d)} className={`px-3.5 py-1.5 rounded-xl font-bold text-[10px] whitespace-nowrap transition-all duration-300 ${selectedDiv===d?'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/30 scale-105':'bg-white/5 text-gray-500 border border-white/10'}`}>Div {d}</button>))}
            <button onClick={()=>setSelectedDiv(0)} className={`px-3.5 py-1.5 rounded-xl font-bold text-[10px] whitespace-nowrap transition-all duration-300 ${selectedDiv===0?'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/30 scale-105':'bg-white/5 text-gray-500 border border-white/10'}`}>🏆</button>
          </div>
          {selectedDiv===0?(<div className="tab-content">
            <h3 className="text-sm font-bold text-[#D4AF37] mb-3 uppercase tracking-wider">🏆 Classement</h3>
            <div className="space-y-2">{joueurs.filter((j:any)=>j.actif!==false).map((j:any)=>({...j,pts:getPronoPoints(j.userId)})).sort((a:any,b:any)=>b.pts-a.pts).map((j:any,idx:number)=>(<div key={j.id} className="card-glow bg-black/30 backdrop-blur-lg rounded-2xl p-3 border border-[#D4AF37]/15 flex items-center gap-3" style={{animationDelay:`${idx*0.1}s`}}>
              <span className="text-xl font-bold">{idx===0?'🥇':idx===1?'🥈':idx===2?'🥉':`${idx+1}.`}</span>
              <div className="flex-1"><p className="text-[#D4AF37] font-bold text-sm">{j.pseudo}</p></div>
              <p className="text-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">{j.pts}pts</p>
            </div>))}</div>
          </div>):(<div className="tab-content space-y-2.5">
            <div className="bg-white/5 rounded-xl p-3 border border-white/5 mb-3">
              <p className="text-[9px] text-gray-600 mb-1.5 uppercase tracking-wider">📋 Division {selectedDiv}</p>
              <div className="flex flex-wrap gap-1">{DIVISIONS[selectedDiv].map((t,i)=>(<span key={i} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${t==='DYNO'?'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 shadow-[0_0_8px_rgba(212,175,55,0.2)]':'bg-white/5 text-gray-500 border border-white/5'}`}>{t}</span>))}</div>
            </div>
            {getMatchsDiv(selectedDiv).map((match,idx)=>{
              const mk=`${selectedDiv}-${match.equipe1}-${match.equipe2}`
              const mp=pronostics.find((p:any)=>p.matchKey===mk&&p.joueurId===user?.uid)
              const res=pronoResults.find((r:any)=>r.matchKey===mk)
              let pts=0;if(mp&&res){if(mp.score1===res.score1&&mp.score2===res.score2)pts=3;else if((mp.score1>mp.score2&&res.score1>res.score2)||(mp.score1<mp.score2&&res.score1<res.score2))pts=1}
              return(<div key={idx} className="card-glow bg-black/30 backdrop-blur-lg rounded-2xl p-3 border border-[#D4AF37]/15" style={{animationDelay:`${idx*0.05}s`}}>
                <div className="flex items-center justify-between mb-2">
                  <p className={`font-bold text-xs ${match.equipe1==='DYNO'?'text-[#D4AF37]':'text-white'}`}>{match.equipe1}</p>
                  <span className="text-gray-700 text-[10px]">VS</span>
                  <p className={`font-bold text-xs ${match.equipe2==='DYNO'?'text-[#D4AF37]':'text-white'}`}>{match.equipe2}</p>
                </div>
                {res&&(<div className="bg-green-500/10 rounded-lg p-2 mb-2 border border-green-500/10 text-center">
                  <p className="text-[9px] text-gray-600 uppercase tracking-wider">Résultat</p>
                  <p className="text-green-400 font-bold">{res.score1} - {res.score2}</p>
                  {mp&&<p className={`text-[9px] mt-0.5 ${pts===3?'text-[#FFD700]':pts===1?'text-green-400':'text-red-400'}`}>{pts===3?'🎯 +3':pts===1?'✅ +1':'❌ Raté'}</p>}
                </div>)}
                {user&&!res&&(<div className="flex items-center gap-1.5">
                  <input type="number" min="0" max="20" placeholder="0" defaultValue={mp?.score1??''} id={`p1-${mk}`} onChange={(e)=>e.target.setAttribute('data-val',e.target.value)} className="w-12 bg-white/5 border border-white/10 rounded-lg px-1.5 py-1.5 text-white text-center text-xs focus:outline-none focus:border-[#D4AF37]/50" />
                  <span className="text-gray-700 text-xs">-</span>
                  <input type="number" min="0" max="20" placeholder="0" defaultValue={mp?.score2??''} id={`p2-${mk}`} onChange={(e)=>e.target.setAttribute('data-val',e.target.value)} className="w-12 bg-white/5 border border-white/10 rounded-lg px-1.5 py-1.5 text-white text-center text-xs focus:outline-none focus:border-[#D4AF37]/50" />
                  <button onClick={()=>{const e1=document.getElementById(`p1-${mk}`) as HTMLInputElement;const e2=document.getElementById(`p2-${mk}`) as HTMLInputElement;const s1=e1?.value||'';const s2=e2?.value||'';if(s1&&s2)envoyerProno(selectedDiv,match.equipe1,match.equipe2,s1,s2);else alert('⚠️ Entre les 2 scores !')}} className="flex-1 py-1.5 rounded-lg font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-[10px] hover:scale-105 transition-transform">{mp?'✏️':'🎰'}</button>
                </div>)}
                {!res&&pronostics.filter((p:any)=>p.matchKey===mk).length>0&&(<div className="mt-2 space-y-0.5">
                  <p className="text-[9px] text-gray-600 uppercase tracking-wider">🎰 Pronos</p>
                  {pronostics.filter((p:any)=>p.matchKey===mk).map((p:any,i:number)=>(<div key={i} className="flex items-center justify-between bg-white/5 rounded px-2 py-1">
                    <span className={`text-[10px] font-bold ${p.joueur===pseudo?'text-[#D4AF37]':'text-gray-500'}`}>{p.joueur}</span>
                    <span className="text-[10px] font-bold text-white">{p.score1}-{p.score2}</span>
                  </div>))}
                </div>)}
                {isAdmin&&!res&&(<div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/5">
                  <span className="text-[9px] text-gray-700">Admin:</span>
                  <input type="number" min="0" max="20" placeholder="0" id={`r1-${mk}`} onChange={(e)=>e.target.setAttribute('data-val',e.target.value)} className="w-10 bg-red-500/10 border border-red-500/15 rounded px-1 py-1 text-white text-center text-[10px] focus:outline-none" />
                  <span className="text-gray-700 text-[10px]">-</span>
                  <input type="number" min="0" max="20" placeholder="0" id={`r2-${mk}`} onChange={(e)=>e.target.setAttribute('data-val',e.target.value)} className="w-10 bg-red-500/10 border border-red-500/15 rounded px-1 py-1 text-white text-center text-[10px] focus:outline-none" />
                  <button onClick={()=>{const e1=document.getElementById(`r1-${mk}`) as HTMLInputElement;const e2=document.getElementById(`r2-${mk}`) as HTMLInputElement;const s1=e1?.value||'';const s2=e2?.value||'';if(s1&&s2)entrerResultat(selectedDiv,match.equipe1,match.equipe2,s1,s2);else alert('⚠️ Scores !')}} className="px-2 py-1 rounded font-bold bg-red-500/20 text-red-400 border border-red-500/15 text-[9px]">✅</button>
                </div>)}
              </div>)
            })}
          </div>)}
        </div>)}

        {activeTab==='compos'&&(<div className="tab-content">
          <H title="Compos" icon="📋" />
          {user&&(<button onClick={()=>setShowAddCompo(true)} className="w-full mb-5 py-3 rounded-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/20 hover:scale-[1.02] transition-transform text-sm">➕ Nouvelle Compo</button>)}
          {compos.length===0?(<div className="text-center py-10 text-gray-600">📋 Aucune</div>):(<div className="space-y-3">{compos.map((c:any,idx:number)=>(<div key={c.id} className="card-glow bg-black/30 backdrop-blur-lg rounded-3xl p-4 border border-[#D4AF37]/15" style={{animationDelay:`${idx*0.1}s`}}>
            <div className="flex items-center justify-between mb-2"><p className="font-bold text-[#D4AF37]">🗺️ {c.map}</p>{(isAdmin||user?.uid===c.auteurId)&&<button onClick={()=>supprimerCompo(c.id)} className="text-red-400/40 hover:text-red-400">🗑️</button>}</div>
            <div className="flex flex-wrap gap-1">{c.joueurs?.map((j:string,i:number)=>(<span key={i} className="bg-[#D4AF37]/15 text-[#D4AF37] px-2.5 py-1 rounded-lg text-[10px] font-bold border border-[#D4AF37]/15">{j}</span>))}</div>
          </div>))}</div>)}
          {showAddCompo&&(<div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4"><div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-5 w-full max-w-md border border-white/10 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-5 text-center">📋 Nouvelle Compo</h3>
            <div className="space-y-3 mb-5">
              <div><label className="text-gray-600 text-[10px] mb-1.5 block uppercase tracking-wider">🗺️ Map</label><div className="grid grid-cols-2 gap-1.5">{ALL_MAPS.map(m=>(<button key={m} onClick={()=>setSelectedMapCompo(m)} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${selectedMapCompo===m?'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/30':'bg-white/5 text-gray-500'}`}>{m}</button>))}</div></div>
              <div><label className="text-gray-600 text-[10px] mb-1.5 block uppercase tracking-wider">👥 Joueurs</label><div className="grid grid-cols-2 gap-1.5">{joueurs.filter((j:any)=>j.actif!==false).map((j:any)=>(<button key={j.id} onClick={()=>toggleCompoJoueur(j.pseudo)} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${compoJoueurs.includes(j.pseudo)?'bg-green-600 text-white shadow-lg shadow-green-500/30':'bg-white/5 text-gray-500'}`}>{j.pseudo}</button>))}</div></div>
            </div>
            <div className="flex gap-2"><button onClick={()=>{setShowAddCompo(false);setSelectedMapCompo('');setCompoJoueurs([])}} className="flex-1 py-2.5 rounded-xl font-bold bg-white/5 border border-white/10 text-gray-500 text-sm">Annuler</button><button onClick={ajouterCompo} className="flex-1 py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/30 text-sm">✅</button></div>
          </div></div>)}
        </div>)}

        {activeTab==='notes'&&(<div className="tab-content">
          <H title="Notes" icon="📊" />
          {historique.length===0?(<div className="text-center py-10 text-gray-600">📊 Aucun</div>):(<div className="space-y-3">{historique.map((m:any,idx:number)=>{const mn=notes.filter((n:any)=>n.matchId===m.id);return(<div key={m.id} className="card-glow bg-black/30 backdrop-blur-lg rounded-3xl p-4 border border-[#D4AF37]/15" style={{animationDelay:`${idx*0.1}s`}}>
            <p className="font-bold text-[#D4AF37] mb-2 text-sm">{m.adversaire} - {formatDateFR(m.date)}</p>
            {mn.length>0?(<div className="space-y-2">{mn.map((n:any)=>(<div key={n.id} className="bg-white/5 rounded-xl p-3 border border-white/5">
              <p className="text-[#D4AF37] font-bold mb-2 text-xs">{n.joueur}</p>
              <div className="grid grid-cols-3 gap-1.5">
                <div className="text-center bg-purple-500/10 rounded-lg p-2 border border-purple-500/10"><p className="text-[9px] text-gray-600">🧠</p><p className="text-lg font-bold text-purple-400">{n.mental}/10</p></div>
                <div className="text-center bg-blue-500/10 rounded-lg p-2 border border-blue-500/10"><p className="text-[9px] text-gray-600">💬</p><p className="text-lg font-bold text-blue-400">{n.communication}/10</p></div>
                <div className="text-center bg-green-500/10 rounded-lg p-2 border border-green-500/10"><p className="text-[9px] text-gray-600">🎯</p><p className="text-lg font-bold text-green-400">{n.gameplay}/10</p></div>
              </div>
            </div>))}</div>):(<p className="text-gray-700 text-[10px]">Aucune note</p>)}
          </div>)})}</div>)}
        </div>)}

        {activeTab==='rec'&&(<div className="tab-content">
          <H title="Replays" icon="🎬" />
          <a href={YOUTUBE_CHANNEL} target="_blank" className="block w-full mb-5 py-2.5 rounded-xl font-bold bg-red-600/15 text-red-400 border border-red-500/15 text-center text-xs hover:bg-red-600/25 transition-all">🔴 YouTube</a>
          {replays.length===0?(<div className="text-center py-10 text-gray-600">📹 Aucun</div>):(<div className="space-y-3">{replays.map((r:any,idx:number)=>(<div key={r.id} className="card-glow bg-black/30 backdrop-blur-lg rounded-3xl p-4 border border-[#D4AF37]/15" style={{animationDelay:`${idx*0.1}s`}}>
            <div className="flex items-center justify-between mb-2"><h3 className="font-bold text-[#D4AF37] text-sm">{r.titre}</h3>{isAdmin&&<button onClick={()=>supprimerReplay(r.id)} className="text-red-400/40 text-[9px]">🗑️</button>}</div>
            {getYouTubeId(r.lien)?(<div className="relative w-full pb-[56.25%] rounded-xl overflow-hidden"><iframe src={`https://www.youtube.com/embed/${getYouTubeId(r.lien)}`} className="absolute top-0 left-0 w-full h-full" frameBorder="0" allowFullScreen /></div>):(<a href={r.lien} target="_blank" className="block py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-center text-sm">▶️ Voir</a>)}
          </div>))}</div>)}
        </div>)}

        {activeTab==='roster'&&(<div className="tab-content">
          <H title="Roster" icon="👥" />
          {user&&(<div className="card-glow bg-black/30 backdrop-blur-lg rounded-2xl p-3 border border-pink-500/10 mb-5">
            <p className="text-[9px] text-pink-400 mb-1.5 uppercase tracking-wider">🎂 Mon anniversaire</p>
            <div className="flex gap-2"><input type="date" value={anniversaire} onChange={(e)=>setAnniversaire(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-pink-400/50" /><button onClick={sauvegarderAnniversaire} className="px-3 py-2 rounded-lg font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs shadow-lg shadow-pink-500/20 hover:scale-105 transition-transform">💾</button></div>
          </div>)}
          <div className="space-y-2.5">{joueurs.filter((j:any)=>j.actif!==false).map((j:any,idx:number)=>(<div key={j.id} className="card-glow bg-black/30 backdrop-blur-lg rounded-2xl p-3.5 border border-[#D4AF37]/15 flex items-center gap-3" style={{animationDelay:`${idx*0.1}s`}}>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 flex items-center justify-center text-[#D4AF37] font-bold text-lg border border-[#D4AF37]/15">{j.pseudo[0]?.toUpperCase()}</div>
            <div className="flex-1"><p className="font-bold text-[#D4AF37] text-sm">{j.pseudo}</p><p className="text-[10px] text-gray-600">🎮 {j.role}</p></div>
            {isAdmin&&<button onClick={()=>supprimerJoueur(j.id)} className="text-red-400/40 hover:text-red-400">🗑️</button>}
          </div>))}</div>
        </div>)}

        {activeTab==='stats'&&(<div className="tab-content">
          <H title="Stats" icon="📈" />
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="card-glow bg-[#D4AF37]/10 rounded-2xl p-4 border border-[#D4AF37]/15 text-center"><p className="text-3xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent count-up">{winRate}%</p><p className="text-[9px] text-gray-600 mt-1.5 uppercase tracking-wider">Win Rate</p></div>
            <div className="card-glow bg-[#D4AF37]/10 rounded-2xl p-4 border border-[#D4AF37]/15 text-center"><p className="text-3xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent count-up">{totalMatchs}</p><p className="text-[9px] text-gray-600 mt-1.5 uppercase tracking-wider">Matchs</p></div>
          </div>
          <div className="card-glow bg-black/30 backdrop-blur-lg rounded-3xl p-5 border border-[#D4AF37]/15">
            <h3 className="text-xs font-bold text-[#D4AF37] mb-3 uppercase tracking-wider">📊 Répartition</h3>
            <div className="space-y-3">
              <div><div className="flex justify-between mb-1.5"><span className="text-gray-600 text-[10px]">🏆 Victoires</span><span className="text-[#D4AF37] font-bold text-xs">{victoires}</span></div><div className="bg-white/5 rounded-full h-2"><div className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] h-2 rounded-full shadow-[0_0_8px_rgba(212,175,55,0.4)] transition-all duration-1000" style={{width:`${totalMatchs>0?(victoires/totalMatchs)*100:0}%`}}></div></div></div>
              <div><div className="flex justify-between mb-1.5"><span className="text-gray-600 text-[10px]">❌ Défaites</span><span className="text-red-500 font-bold text-xs">{defaites}</span></div><div className="bg-white/5 rounded-full h-2"><div className="bg-gradient-to-r from-red-600 to-red-500 h-2 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.4)] transition-all duration-1000" style={{width:`${totalMatchs>0?(defaites/totalMatchs)*100:0}%`}}></div></div></div>
            </div>
          </div>
        </div>)}

        {activeTab==='admin'&&(<div className="tab-content">
          <H title="Admin" icon="⚙️" />
          {!isAdmin?(<div className="card-glow bg-black/30 backdrop-blur-lg rounded-3xl p-5 border border-[#D4AF37]/15">
            <input type="password" placeholder="Mot de passe" value={adminPassword} onChange={(e)=>setAdminPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-3 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50" />
            <button onClick={handleAdminLogin} className="w-full py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/30 text-sm">Connexion</button>
          </div>):(<div className="space-y-5">
            <div className="card-glow bg-black/30 backdrop-blur-lg rounded-3xl p-5 border border-[#D4AF37]/15">
              <h3 className="text-xs font-bold text-[#D4AF37] mb-3 uppercase tracking-wider">➕ Match</h3>
              <input type="text" placeholder="Adversaire" value={nouveauMatch.adversaire} onChange={(e)=>setNouveauMatch({...nouveauMatch,adversaire:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 mb-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50" />
              <input type="date" value={nouveauMatch.date} onChange={(e)=>setNouveauMatch({...nouveauMatch,date:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 mb-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50" />
              <div className="grid grid-cols-2 gap-2 mb-2"><input type="time" value={nouveauMatch.horaire1} onChange={(e)=>setNouveauMatch({...nouveauMatch,horaire1:e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50" /><input type="time" value={nouveauMatch.horaire2} onChange={(e)=>setNouveauMatch({...nouveauMatch,horaire2:e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50" /></div>
              <div className="grid grid-cols-2 gap-2 mb-2"><select value={nouveauMatch.arene} onChange={(e)=>setNouveauMatch({...nouveauMatch,arene:e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50"><option value="Arène 1">Arène 1</option><option value="Arène 2">Arène 2</option></select><select value={nouveauMatch.type} onChange={(e)=>setNouveauMatch({...nouveauMatch,type:e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50"><option value="Ligue">Ligue</option><option value="Scrim">Scrim</option><option value="Tournoi">Tournoi</option><option value="Division">Division</option></select></div>
              <button onClick={ajouterMatch} className="w-full py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/30 text-sm hover:scale-[1.02] transition-transform">Ajouter + Discord</button>
            </div>
            <div className="card-glow bg-black/30 backdrop-blur-lg rounded-3xl p-5 border border-[#D4AF37]/15">
              <h3 className="text-xs font-bold text-[#D4AF37] mb-3 uppercase tracking-wider">🗑️ Matchs</h3>
              {matchs.length===0?<p className="text-gray-700 text-center text-xs">Aucun</p>:<div className="space-y-1.5">{matchs.map((m:any)=>(<div key={m.id} className="flex items-center justify-between bg-white/5 rounded-lg p-2.5 border border-white/5"><div><p className="text-[#D4AF37] font-bold text-[10px]">{m.adversaire}</p><p className="text-gray-700 text-[9px]">{formatDateFR(m.date)}</p></div><button onClick={()=>supprimerMatch(m.id)} className="text-red-400/40 hover:text-red-400">🗑️</button></div>))}</div>}
            </div>
            <div className="card-glow bg-black/30 backdrop-blur-lg rounded-3xl p-5 border border-[#D4AF37]/15">
              <h3 className="text-xs font-bold text-[#D4AF37] mb-3 uppercase tracking-wider">🎬 Replay</h3>
              <input type="text" placeholder="Titre" value={nouveauReplay.titre} onChange={(e)=>setNouveauReplay({...nouveauReplay,titre:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 mb-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50" />
              <input type="text" placeholder="Lien YouTube" value={nouveauReplay.lien} onChange={(e)=>setNouveauReplay({...nouveauReplay,lien:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 mb-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50" />
              <button onClick={ajouterReplay} className="w-full py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/30 text-sm">Ajouter</button>
            </div>
            <div className="card-glow bg-black/30 backdrop-blur-lg rounded-3xl p-5 border border-[#D4AF37]/15">
              <h3 className="text-xs font-bold text-[#D4AF37] mb-3 uppercase tracking-wider">✏️ Scores</h3>
              {prochainsMatchs.map((m:any)=>(<div key={m.id} className="bg-white/5 rounded-lg p-3 mb-2 border border-white/5"><p className="font-bold text-[#D4AF37] mb-2 text-xs">{m.adversaire}</p><button onClick={()=>setScoreEdit({id:m.id,scoreDyno:'',scoreAdv:''})} className="w-full py-2 rounded-lg font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-xs">📝 Score</button></div>))}
            </div>
            <button onClick={handleAdminLogout} className="w-full bg-white/5 border border-red-500/15 text-red-400 py-2.5 rounded-xl font-bold text-sm hover:bg-red-500/10 transition-all">🚪 Déconnexion</button>
          </div>)}
          {scoreEdit&&(<div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4"><div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-6 w-full max-w-sm border border-white/10">
            <h3 className="text-lg font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-5 text-center">📝 Score</h3>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div><label className="text-gray-600 text-[10px] mb-1 block uppercase tracking-wider">DYNO</label><input type="number" placeholder="0" value={scoreEdit.scoreDyno} onChange={(e)=>setScoreEdit({...scoreEdit,scoreDyno:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-xl font-bold focus:outline-none focus:border-[#D4AF37]/50" /></div>
              <div><label className="text-gray-600 text-[10px] mb-1 block uppercase tracking-wider">Adv</label><input type="number" placeholder="0" value={scoreEdit.scoreAdv} onChange={(e)=>setScoreEdit({...scoreEdit,scoreAdv:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-xl font-bold focus:outline-none focus:border-[#D4AF37]/50" /></div>
            </div>
            <div className="flex gap-2"><button onClick={()=>setScoreEdit(null)} className="flex-1 py-2.5 rounded-xl font-bold bg-white/5 border border-white/10 text-gray-500 text-sm">Annuler</button><button onClick={updateScore} className="flex-1 py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/30 text-sm">✅</button></div>
          </div></div>)}
        </div>)}
      </main>

      <nav className="fixed bottom-3 left-3 right-3 z-50">
        <div className="max-w-lg mx-auto flex backdrop-blur-2xl bg-black/50 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
          {[{t:'matchs',i:'📅'},{t:'historique',i:'📜'},{t:'strats',i:'🎯'},{t:'pronostics',i:'🎰'},{t:'compos',i:'📋'},{t:'notes',i:'📊'},{t:'rec',i:'🎬'},{t:'roster',i:'👥'},{t:'stats',i:'📈'},{t:'admin',i:'⚙️'}].map(({t,i})=>(
            <button key={t} onClick={()=>setActiveTab(t)} className={`flex-1 py-3 text-center transition-all duration-300 relative ${activeTab===t?'text-[#D4AF37]':'text-gray-700 hover:text-gray-500'}`}><span className="text-sm relative z-10">{i}</span>{activeTab===t&&<div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#D4AF37] shadow-[0_0_6px_rgba(212,175,55,0.8)]" />}</button>
          ))}
        </div>
      </nav>

      {!user&&(<div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4"><Particles /><div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-7 w-full max-w-sm border border-white/10 shadow-[0_16px_64px_rgba(0,0,0,0.5)] relative z-10">
        <img src={LOGO_URL} alt="DYNO" className="w-16 h-16 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]" />
        <h3 className="text-lg font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-5 text-center">{isSignUp?'📝 Créer':'👤 Connexion'}</h3>
        {isSignUp&&<input type="text" placeholder="Pseudo" value={pseudo} onChange={(e)=>setPseudo(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-3 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50" />}
        <input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-3 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50" />
        <input type="password" placeholder="Mot de passe" value={authPassword} onChange={(e)=>setAuthPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-5 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50" />
        {isSignUp?<button onClick={handleSignUp} className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/30 mb-3 text-sm hover:scale-[1.02] transition-transform">✅ Créer</button>:<button onClick={handleSignIn} className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/30 mb-3 text-sm hover:scale-[1.02] transition-transform">🔐 Connexion</button>}
        <div className="border-t border-white/5 pt-3">{isSignUp?<button onClick={()=>setIsSignUp(false)} className="w-full text-[#D4AF37] text-xs hover:underline">Déjà un compte ?</button>:<button onClick={()=>setIsSignUp(true)} className="w-full text-[#D4AF37] text-xs hover:underline">Pas de compte ?</button>}</div>
      </div></div>)}
    </div>
  )
}

export default App