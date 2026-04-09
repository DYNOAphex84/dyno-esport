import { useState, useEffect, useCallback, useRef } from 'react'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, getDoc, setDoc } from 'firebase/firestore'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth'

const firebaseConfig={apiKey:"AIzaSyDXwItLM0OZ0VmHj-DLZcH8OBy7wXiHBsM",authDomain:"dyno-esport.firebaseapp.com",projectId:"dyno-esport",storageBucket:"dyno-esport.firebasestorage.app",messagingSenderId:"808658404731",appId:"1:808658404731:web:f3cf29142d3038816f29de"}
const app=initializeApp(firebaseConfig),db=getFirestore(app),auth=getAuth(app)
setPersistence(auth,browserLocalPersistence).catch(()=>{})
const DW='https://discord.com/api/webhooks/1489600048474886295/HfR7YhCRuDpjN6NCw133bShUF9Gj1gak-fWtTYVYgI2G_gllQ001kRfH0w57mUuCTytp'
const YT='https://youtube.com/@jonathanla890?si=eHtXG1hjlmCuZ-RC',LG='https://i.imgur.com/gTLj57a.png',AE='thibaut.llorens@hotmail.com'
const AM=['Engine','Helios','Silva','The Cliff','Artefact','Outlaw','Atlantis','Horizon','Polaris','Lunar','Ceres']
const P=()=><div className="particles">{Array.from({length:12}).map((_,i)=><div key={i} className="particle"/>)}</div>

function App(){
const[activeTab,setActiveTab]=useState('matchs'),[isAdmin,setIsAdmin]=useState(false),[adminPassword,setAdminPassword]=useState(''),[showSplash,setShowSplash]=useState(true),[loading,setLoading]=useState(true),[user,setUser]=useState<any>(null),[pseudo,setPseudo]=useState(''),[email,setEmail]=useState(''),[authPassword,setAuthPassword]=useState(''),[isSignUp,setIsSignUp]=useState(false)
const[matchs,setMatchs]=useState<any[]>([]),[replays,setReplays]=useState<any[]>([]),[joueurs,setJoueurs]=useState<any[]>([]),[notes,setNotes]=useState<any[]>([]),[strats,setStrats]=useState<any[]>([]),[commentaires,setCommentaires]=useState<any[]>([]),[compos,setCompos]=useState<any[]>([]),[objectifs,setObjectifs]=useState<any[]>([]),[analyses,setAnalyses]=useState<any[]>([]),[fichesAdversaires,setFichesAdversaires]=useState<any[]>([])
const[nouveauMatch,setNouveauMatch]=useState({adversaire:'',date:'',horaire1:'',horaire2:'',arene:'Arène 1',type:'Ligue',sousMatchs:[] as {adversaire:string,scoreDyno:string,scoreAdv:string}[]})
const[nouveauSousMatch,setNouveauSousMatch]=useState({adversaire:'',scoreDyno:'',scoreAdv:''})
const[scoreEdit,setScoreEdit]=useState<any>(null),[nouveauReplay,setNouveauReplay]=useState({titre:'',lien:''}),[nouvelleNote,setNouvelleNote]=useState({matchId:'',mental:'',communication:'',gameplay:''}),[selectedMatchForNotes,setSelectedMatchForNotes]=useState<any>(null),[nouvelleStrat,setNouvelleStrat]=useState({adversaire:'',picks:[] as string[],bans:[] as string[]}),[showAddStrat,setShowAddStrat]=useState(false)
const[deferredPrompt,setDeferredPrompt]=useState<any>(null),[showInstall,setShowInstall]=useState(false),[countdowns,setCountdowns]=useState<Record<string,string>>({}),[nouveauCommentaire,setNouveauCommentaire]=useState(''),[selectedMatchForComment,setSelectedMatchForComment]=useState<any>(null),[notificationsEnabled,setNotificationsEnabled]=useState(false),[notifiedMatchs,setNotifiedMatchs]=useState<string[]>([])
const[selectedMapCompo,setSelectedMapCompo]=useState(''),[compoJoueurs,setCompoJoueurs]=useState<string[]>([]),[showAddCompo,setShowAddCompo]=useState(false),[anniversaire,setAnniversaire]=useState(''),[viewMode,setViewMode]=useState<'list'|'grid'>('list'),[pullDistance,setPullDistance]=useState(0),[isRefreshing,setIsRefreshing]=useState(false)
const[nouvelObjectif,setNouvelObjectif]=useState(''),[showBilan,setShowBilan]=useState(false),[selectedMatchForAnalyse,setSelectedMatchForAnalyse]=useState<any>(null),[nouvelleAnalyse,setNouvelleAnalyse]=useState({bien:'',mal:'',plan:''}),[showAddFiche,setShowAddFiche]=useState(false),[nouvelleFiche,setNouvelleFiche]=useState({adversaire:'',forces:'',faiblesses:'',notes:''})
const pm=useRef(0),pn2=useRef(0),pc=useRef(0),ps2=useRef(0),ty=useRef(0)

useEffect(()=>{if(window.location.search.includes('reset=1')){localStorage.clear();window.location.href=window.location.pathname}},[])
const sendNotification=useCallback((t:string,b:string,tg?:string)=>{try{if(!('Notification' in window)||Notification.permission!=='granted')return;const n=new Notification(t,{body:b,icon:LG,badge:LG,tag:tg||'d',requireInteraction:false});n.onclick=()=>{window.focus();n.close()}}catch{}},[])
const requestNotificationPermission=async()=>{try{if(!('Notification' in window)){alert('Non supporté');return};const p=await Notification.requestPermission();if(p==='granted'){setNotificationsEnabled(true);localStorage.setItem('dyno-notifs','true');alert('Activé!')}else{setNotificationsEnabled(false);localStorage.setItem('dyno-notifs','false')}}catch{}}
const getMatchDateTime=useCallback((m:any):Date|null=>{if(!m?.date)return null;let d=m.date;const t=m.horaires?.[0]||m.horaire1||'20:00';if(d.includes('/')){const[dd,mm,yy]=d.split('/');d=yy+'-'+mm+'-'+dd};try{const dt=new Date(d+'T'+t+':00');return isNaN(dt.getTime())?null:dt}catch{return null}},[])

useEffect(()=>{try{if('Notification' in window&&Notification.permission==='granted'&&localStorage.getItem('dyno-notifs')==='true')setNotificationsEnabled(true)}catch{};try{setNotifiedMatchs(JSON.parse(localStorage.getItem('dyno-notified')||'[]'))}catch{setNotifiedMatchs([])}},[])
useEffect(()=>{if(!notificationsEnabled)return;try{if(!('Notification' in window)||Notification.permission!=='granted')return}catch{return};const ck=()=>{const now=new Date();matchs.forEach((m:any)=>{if(m.termine)return;const mt=getMatchDateTime(m);if(!mt)return;const dm=(mt.getTime()-now.getTime())/60000;const k1=m.id+'-1h';if(dm>55&&dm<=65&&!notifiedMatchs.includes(k1)){sendNotification('1h!','DYNO vs '+m.adversaire,'m1h');const u=[...notifiedMatchs,k1];setNotifiedMatchs(u);localStorage.setItem('dyno-notified',JSON.stringify(u))};const k2=m.id+'-15m';if(dm>10&&dm<=20&&!notifiedMatchs.includes(k2)){sendNotification('15min!','DYNO vs '+m.adversaire,'m15');const u=[...notifiedMatchs,k2];setNotifiedMatchs(u);localStorage.setItem('dyno-notified',JSON.stringify(u))};const k3=m.id+'-now';if(dm>=-2&&dm<=3&&!notifiedMatchs.includes(k3)){sendNotification('GO!','DYNO vs '+m.adversaire,'mnow');const u=[...notifiedMatchs,k3];setNotifiedMatchs(u);localStorage.setItem('dyno-notified',JSON.stringify(u))}})};ck();const i=setInterval(ck,60000);return()=>clearInterval(i)},[notificationsEnabled,matchs,notifiedMatchs,sendNotification,getMatchDateTime])
useEffect(()=>{const u=()=>{const now=new Date(),c:Record<string,string>={};matchs.forEach((m:any)=>{if(m.termine)return;const mt=getMatchDateTime(m);if(!mt)return;const df=mt.getTime()-now.getTime();if(df<=0){c[m.id]='EN COURS';return};const j=Math.floor(df/86400000),h=Math.floor((df%86400000)/3600000),mi=Math.floor((df%3600000)/60000),s=Math.floor((df%60000)/1000);c[m.id]=(j>0?j+'j ':'')+(h>0||j>0?h+'h ':'')+mi+'m '+s+'s'});setCountdowns(c)};u();const i=setInterval(u,1000);return()=>clearInterval(i)},[matchs,getMatchDateTime])
useEffect(()=>{if(localStorage.getItem('dyno-admin')==='true')setIsAdmin(true)},[])
useEffect(()=>{const unsub=onAuthStateChanged(auth,async(u:any)=>{setUser(u);if(u){const d=await getDoc(doc(db,'users',u.uid));if(d.exists()){const data=d.data();setPseudo(data.pseudo||'');if(u.email===AE||data.isAdmin){setIsAdmin(true);localStorage.setItem('dyno-admin','true')}}};setLoading(false)});return()=>unsub()},[])

useEffect(()=>{const q=query(collection(db,'matchs'),orderBy('createdAt','desc'));const u=onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setMatchs(d)});return()=>u()},[])
useEffect(()=>{const q=query(collection(db,'notes'),orderBy('createdAt','desc'));const u=onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setNotes(d)});return()=>u()},[])
useEffect(()=>{const q=query(collection(db,'commentaires'),orderBy('createdAt','desc'));const u=onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setCommentaires(d)});return()=>u()},[])
useEffect(()=>{const q=query(collection(db,'strats'),orderBy('createdAt','desc'));const u=onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setStrats(d)});return()=>u()},[])
useEffect(()=>{const q=query(collection(db,'replays'),orderBy('createdAt','desc'));const u=onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setReplays(d)});return()=>u()},[])
useEffect(()=>{const q=query(collection(db,'players'),orderBy('createdAt','desc'));const u=onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setJoueurs(d)});return()=>u()},[])
useEffect(()=>{const q=query(collection(db,'compos'),orderBy('createdAt','desc'));const u=onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setCompos(d)});return()=>u()},[])
useEffect(()=>{const q=query(collection(db,'objectifs'),orderBy('createdAt','desc'));const u=onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setObjectifs(d)});return()=>u()},[])
useEffect(()=>{const q=query(collection(db,'analyses'),orderBy('createdAt','desc'));const u=onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setAnalyses(d)});return()=>u()},[])
useEffect(()=>{const q=query(collection(db,'fichesAdversaires'),orderBy('createdAt','desc'));const u=onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setFichesAdversaires(d)});return()=>u()},[])

useEffect(()=>{if(!notificationsEnabled||pm.current===0){pm.current=matchs.length;return};if(matchs.length>pm.current){const n=matchs[0];if(n)sendNotification('Match!','DYNO vs '+n.adversaire,'nm')};pm.current=matchs.length},[matchs,notificationsEnabled,sendNotification])
useEffect(()=>{if(!notificationsEnabled||pn2.current===0){pn2.current=notes.length;return};if(notes.length>pn2.current){const n=notes[0];if(n)sendNotification('Note!',n.joueur,'nn')};pn2.current=notes.length},[notes,notificationsEnabled,sendNotification])
useEffect(()=>{if(!notificationsEnabled||pc.current===0){pc.current=commentaires.length;return};if(commentaires.length>pc.current){const n=commentaires[0];if(n)sendNotification('Comm!',n.joueur,'nc')};pc.current=commentaires.length},[commentaires,notificationsEnabled,sendNotification])
useEffect(()=>{if(!notificationsEnabled||ps2.current===0){ps2.current=strats.length;return};if(strats.length>ps2.current){const n=strats[0];if(n)sendNotification('Strat!','DYNO vs '+n.adversaire,'ns')};ps2.current=strats.length},[strats,notificationsEnabled,sendNotification])
useEffect(()=>{if(!notificationsEnabled)return;const ck=()=>{const now=new Date();if(now.getDay()===1&&now.getHours()===9){const lw=localStorage.getItem('dyno-weekly');const tw=now.getFullYear()+'-W'+Math.ceil(now.getDate()/7);if(lw!==tw){const wm=matchs.filter((m:any)=>m.termine&&(Date.now()-m.createdAt)<604800000);const ww=wm.filter((m:any)=>(m.scoreDyno||0)>(m.scoreAdversaire||0)).length;const wl=wm.filter((m:any)=>(m.scoreDyno||0)<(m.scoreAdversaire||0)).length;sendNotification('Semaine',wm.length+' matchs '+ww+'W-'+wl+'L','wk');localStorage.setItem('dyno-weekly',tw)}}};ck();const i=setInterval(ck,3600000);return()=>clearInterval(i)},[notificationsEnabled,matchs,sendNotification])

useEffect(()=>{const t=setTimeout(()=>setShowSplash(false),2500);return()=>clearTimeout(t)},[])
useEffect(()=>{window.addEventListener('beforeinstallprompt',(e:any)=>{e.preventDefault();setDeferredPrompt(e);setShowInstall(true)})},[])
const handleInstall=()=>{if(deferredPrompt){deferredPrompt.prompt();setDeferredPrompt(null);setShowInstall(false)}}
const handleSignUp=async()=>{if(!email||!authPassword||!pseudo)return;try{const r=await createUserWithEmailAndPassword(auth,email,authPassword);await setDoc(doc(db,'users',r.user.uid),{pseudo,email,createdAt:Date.now(),isAdmin:email===AE});await addDoc(collection(db,'players'),{pseudo,role:'Joueur',rang:'Nouveau',userId:r.user.uid,createdAt:Date.now()});alert('OK!');setIsSignUp(false);setEmail('');setAuthPassword('')}catch(e:any){alert(e.message)}}
const handleSignIn=async()=>{if(!email||!authPassword)return;try{await setPersistence(auth,browserLocalPersistence);await signInWithEmailAndPassword(auth,email,authPassword);localStorage.setItem('user-email',email);alert('OK!');setEmail('');setAuthPassword('')}catch(e:any){alert(e.message)}}
const handleSignOut=async()=>{await signOut(auth);setPseudo('');setIsAdmin(false);localStorage.removeItem('dyno-admin');localStorage.removeItem('user-email')}
const handleAdminLogin=()=>{if(adminPassword==='dyno2026'){setIsAdmin(true);localStorage.setItem('dyno-admin','true');setAdminPassword('')}else alert('Non!')}
const handleAdminLogout=()=>{setIsAdmin(false);localStorage.removeItem('dyno-admin')}

const addSousMatchs=async(matchId:string,existing?:any[])=>{const a1=prompt('Adversaire 1 :',existing?.[0]?.adversaire||'');if(!a1)return;const d1=prompt('Score DYNO vs '+a1+' :',existing?.[0]?.scoreDyno||'');const e1=prompt('Score '+a1+' :',existing?.[0]?.scoreAdv||'');if(!d1||!e1)return;const sms=[{adversaire:a1,scoreDyno:d1,scoreAdv:e1}];const a2=prompt('Adversaire 2 (vide=stop) :',existing?.[1]?.adversaire||'');if(a2){const d2=prompt('Score DYNO vs '+a2+' :',existing?.[1]?.scoreDyno||'');const e2=prompt('Score '+a2+' :',existing?.[1]?.scoreAdv||'');if(d2&&e2)sms.push({adversaire:a2,scoreDyno:d2,scoreAdv:e2})};const a3=prompt('Adversaire 3 (vide=stop) :',existing?.[2]?.adversaire||'');if(a3){const d3=prompt('Score DYNO vs '+a3+' :',existing?.[2]?.scoreDyno||'');const e3=prompt('Score '+a3+' :',existing?.[2]?.scoreAdv||'');if(d3&&e3)sms.push({adversaire:a3,scoreDyno:d3,scoreAdv:e3})};const w=sms.filter(s=>parseInt(s.scoreDyno)>parseInt(s.scoreAdv)).length;const l=sms.filter(s=>parseInt(s.scoreDyno)<parseInt(s.scoreAdv)).length;await updateDoc(doc(db,'matchs',matchId),{sousMatchs:sms,scoreDyno:w,scoreAdversaire:l,termine:true});alert('OK!')}

const ajouterMatch=async()=>{if(!nouveauMatch.adversaire||!nouveauMatch.date||!nouveauMatch.horaire1)return;const md:any={...nouveauMatch,termine:false,disponibles:[],indisponibles:[],createdAt:Date.now()};if((nouveauMatch.type==='Ligue'||nouveauMatch.type==='Division')&&nouveauMatch.sousMatchs.length>0){md.termine=true;md.sousMatchs=nouveauMatch.sousMatchs;md.scoreDyno=nouveauMatch.sousMatchs.filter(s=>parseInt(s.scoreDyno)>parseInt(s.scoreAdv)).length;md.scoreAdversaire=nouveauMatch.sousMatchs.filter(s=>parseInt(s.scoreDyno)<parseInt(s.scoreAdv)).length}else{delete md.sousMatchs};await addDoc(collection(db,'matchs'),md);const h=[nouveauMatch.horaire1];if(nouveauMatch.horaire2)h.push(nouveauMatch.horaire2);try{await fetch(DW,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({embeds:[{title:'DYNO vs '+nouveauMatch.adversaire,color:13934871,fields:[{name:'VS',value:nouveauMatch.adversaire,inline:true},{name:'Date',value:nouveauMatch.date,inline:true},{name:'Heure',value:h.join(' / '),inline:true}],footer:{text:'DYNO',icon_url:LG}}]})})}catch{};setNouveauMatch({adversaire:'',date:'',horaire1:'',horaire2:'',arene:'Arène 1',type:'Ligue',sousMatchs:[]});setNouveauSousMatch({adversaire:'',scoreDyno:'',scoreAdv:''});alert('OK!')}
const ajouterReplay=async()=>{if(!nouveauReplay.titre||!nouveauReplay.lien)return;await addDoc(collection(db,'replays'),{...nouveauReplay,createdAt:Date.now()});setNouveauReplay({titre:'',lien:''});alert('OK!')}
const ajouterNote=async()=>{if(!user)return;await addDoc(collection(db,'notes'),{matchId:selectedMatchForNotes?.id,joueur:pseudo,joueurId:user.uid,...nouvelleNote,createdAt:Date.now()});setNouvelleNote({matchId:'',mental:'',communication:'',gameplay:''});setSelectedMatchForNotes(null);alert('OK!')}
const ajouterCommentaire=async(id:string)=>{if(!user||!nouveauCommentaire.trim())return;await addDoc(collection(db,'commentaires'),{matchId:id,joueur:pseudo,joueurId:user.uid,texte:nouveauCommentaire.trim(),createdAt:Date.now()});setNouveauCommentaire('');setSelectedMatchForComment(null);alert('OK!')}
const ajouterStrat=async()=>{if(!nouvelleStrat.adversaire||nouvelleStrat.picks.length===0||nouvelleStrat.bans.length===0)return;await addDoc(collection(db,'strats'),{adversaire:nouvelleStrat.adversaire,picks:nouvelleStrat.picks,bans:nouvelleStrat.bans,auteur:pseudo,auteurId:user?.uid,createdAt:Date.now()});setNouvelleStrat({adversaire:'',picks:[],bans:[]});setShowAddStrat(false);alert('OK!')}
const ajouterCompo=async()=>{if(!selectedMapCompo||compoJoueurs.length===0)return;const ex=compos.find((c:any)=>c.map===selectedMapCompo);if(ex){await updateDoc(doc(db,'compos',ex.id),{joueurs:compoJoueurs,updatedAt:Date.now()})}else{await addDoc(collection(db,'compos'),{map:selectedMapCompo,joueurs:compoJoueurs,auteur:pseudo,createdAt:Date.now()})};setShowAddCompo(false);setSelectedMapCompo('');setCompoJoueurs([]);alert('OK!')}
const toggleCompoJoueur=(n:string)=>{if(compoJoueurs.includes(n))setCompoJoueurs(compoJoueurs.filter(j=>j!==n));else setCompoJoueurs([...compoJoueurs,n])}
const sauvegarderAnniversaire=async()=>{if(!user||!anniversaire)return;await updateDoc(doc(db,'users',user.uid),{anniversaire});alert('OK!')}
const ajouterObjectif=async()=>{if(!user||!nouvelObjectif.trim())return;await addDoc(collection(db,'objectifs'),{texte:nouvelObjectif.trim(),termine:false,joueur:pseudo,joueurId:user.uid,createdAt:Date.now()});setNouvelObjectif('')}
const toggleObjectif=async(id:string,c:boolean)=>{await updateDoc(doc(db,'objectifs',id),{termine:!c})}
const ajouterAnalyse=async(mid:string)=>{if(!user)return;await addDoc(collection(db,'analyses'),{matchId:mid,joueur:pseudo,joueurId:user.uid,...nouvelleAnalyse,createdAt:Date.now()});setNouvelleAnalyse({bien:'',mal:'',plan:''});setSelectedMatchForAnalyse(null);alert('OK!')}
const ajouterFiche=async()=>{if(!nouvelleFiche.adversaire.trim())return;await addDoc(collection(db,'fichesAdversaires'),{...nouvelleFiche,auteur:pseudo,auteurId:user?.uid,createdAt:Date.now()});setNouvelleFiche({adversaire:'',forces:'',faiblesses:'',notes:''});setShowAddFiche(false);alert('OK!')}
const del=async(col:string,id:string)=>{await deleteDoc(doc(db,col,id))}
const updateScore=async()=>{if(!scoreEdit)return;await updateDoc(doc(db,'matchs',scoreEdit.id),{scoreDyno:parseInt(scoreEdit.scoreDyno),scoreAdversaire:parseInt(scoreEdit.scoreAdv),termine:true});setScoreEdit(null);alert('OK!')}
const toggleDispo=async(mid:string)=>{if(!user)return;const m=matchs.find((x:any)=>x.id===mid);if(!m)return;const d=m.disponibles||[],i=m.indisponibles||[];await updateDoc(doc(db,'matchs',mid),{disponibles:d.includes(pseudo)?d.filter((p:string)=>p!==pseudo):[...d,pseudo],indisponibles:i.filter((p:string)=>p!==pseudo)})}
const toggleIndispo=async(mid:string)=>{if(!user)return;const m=matchs.find((x:any)=>x.id===mid);if(!m)return;const d=m.disponibles||[],i=m.indisponibles||[];await updateDoc(doc(db,'matchs',mid),{indisponibles:i.includes(pseudo)?i.filter((p:string)=>p!==pseudo):[...i,pseudo],disponibles:d.filter((p:string)=>p!==pseudo)})}
const fdf=(s:string)=>{if(!s)return'';if(s.includes('/'))return s;const[y,m,d]=s.split('-');return d+'/'+m+'/'+y}
const fts=(t:number)=>{const d=new Date(t);return d.toLocaleDateString('fr-FR')+' '+d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
const atc=(m:any)=>{try{if(!m?.date)return null;let y:string,mo:string,d:string;if(m.date.includes('/')){const p=m.date.split('/');d=p[0];mo=p[1];y=p[2]}else{const p=m.date.split('-');y=p[0];mo=p[1];d=p[2]};const md=y+mo+d;let h='20',mi='00';if(m.horaires&&m.horaires.length>0){const p=m.horaires[0].split(':');h=p[0];mi=p[1]||'00'}else if(m.horaire1){const p=m.horaire1.split(':');h=p[0];mi=p[1]||'00'};return new Date(y+'-'+mo+'-'+d+'T'+h+':'+mi+':00')}catch{return null}}
const fef=(m:any)=>{if(!m)return'';if(m.scoreDyno===undefined||m.scoreAdversaire===undefined)return'A venir';return'DYNO '+m.scoreDyno+' - '+m.scoreAdversaire+' '+m.adversaire}

if(loading)return<div className="loading-screen"><div className="logo">DYNO</div><div className="spinner"/></div>

return(
<div className="app">
{showSplash&&<div className="splash"><div className="logo">DYNO ESPORT</div><div className="tagline">COMPETITIVE GAMING</div></div>}

<div className="header">
<div className="logo">DYNO</div>
<div className="user-info">
{user?<><span>{pseudo}</span><button onClick={handleSignOut}>Deconnexion</button></>:<><button onClick={()=>setIsSignUp(!isSignUp)}>{isSignUp?'Connexion':'Inscription'}</button></>}
{isAdmin&&<button onClick={handleAdminLogout}>Admin: OFF</button>}
</div>
</div>

<nav className="tabs">
{['matchs','replays','joueurs','notes','strats','commentaires','compos','objectifs','analyses','fiches'].map(t=><button key={t} className={activeTab===t?'active':''} onClick={()=>setActiveTab(t)}>{t.toUpperCase()}</button>)}
</nav>

<main className="content">
{activeTab==='matchs'&&<div className="section">
<h2>Matchs</h2>
{isAdmin&&<div className="add-form">
<input placeholder="Adversaire" value={nouveauMatch.adversaire} onChange={e=>setNouveauMatch({...nouveauMatch,adversaire:e.target.value})}/>
<input type="date" value={nouveauMatch.date} onChange={e=>setNouveauMatch({...nouveauMatch,date:e.target.value})}/>
<input type="time" value={nouveauMatch.horaire1} onChange={e=>setNouveauMatch({...nouveauMatch,horaire1:e.target.value})}/>
<input type="time" value={nouveauMatch.horaire2} onChange={e=>setNouveauMatch({...nouveauMatch,horaire2:e.target.value})}/>
<select value={nouveauMatch.arene} onChange={e=>setNouveauMatch({...nouveauMatch,arene:e.target.value})}>
<option>Arene 1</option><option>Arene 2</option><option>Arene 3</option>
</select>
<select value={nouveauMatch.type} onChange={e=>setNouveauMatch({...nouveauMatch,type:e.target.value})}>
<option>Ligue</option><option>Division</option><option>Amical</option>
</select>
<button onClick={ajouterMatch}>Ajouter Match</button>
</div>}
<div className="matchs-list">
{matchs.map((m:any)=>(
<div key={m.id} className="match-card">
<div className="match-title">DYNO vs {m.adversaire}</div>
<div className="match-info">
<span>{m.date}</span>
<span>{m.horaire1}{m.horaire2?' / '+m.horaire2:''}</span>
<span>{m.arene}</span>
</div>
{countdowns[m.id]&&<div className="countdown">{countdowns[m.id]}</div>}
{m.termine?<div className="score">{fef(m)}</div>:<div className="availability">
{user&&!m.disponibles?.includes(pseudo)&&!m.indisponibles?.includes(pseudo)&&<><button onClick={()=>toggleDispo(m.id)}>Disponible</button><button onClick={()=>toggleIndispo(m.id)}>Indisponible</button></>}
{m.disponibles?.length>0&&<div className="dispo">{m.disponibles.join(', ')}</div>}
{m.indisponibles?.length>0&&<div className="indispo">{m.indisponibles.join(', ')}</div>}
</div>}
{isAdmin&&!m.termine&&<div className="admin-actions"><button onClick={()=>setScoreEdit(m)}>Entrer Score</button><button onClick={()=>del('matchs',m.id)}>Supprimer</button></div>}
{m.sousMatchs?.length>0&&<div className="sous-matchs">{m.sousMatchs.map((s:any,i:number)=><div key={i}>DYNO vs {s.adversaire}: {s.scoreDyno}-{s.scoreAdv}</div>)}</div>}
</div>
))}
</div>
</div>}

{activeTab==='replays'&&<div className="section">
<h2>Replays</h2>
{isAdmin&&<div className="add-form">
<input placeholder="Titre" value={nouveauReplay.titre} onChange={e=>setNouveauReplay({...nouveauReplay,titre:e.target.value})}/>
<input placeholder="Lien YouTube" value={nouveauReplay.lien} onChange={e=>setNouveauReplay({...nouveauReplay,lien:e.target.value})}/>
<button onClick={ajouterReplay}>Ajouter</button>
</div>}
{replays.map(r=><div key={r.id} className="replay-card"><a href={r.lien} target="_blank" rel="noreferrer">{r.titre}</a></div>)}
</div>}

{activeTab==='notes'&&<div className="section">
<h2>Notes de Matchs</h2>
{user&&<div className="add-form">
<select onChange={e=>setSelectedMatchForNotes(matchs.find(m=>m.id===e.target.value))}>
<option>Selectionner un match</option>
{matchs.filter(m=>m.termine).map(m=><option key={m.id} value={m.id}>DYNO vs {m.adversaire}</option>)}
</select>
<input placeholder="Mental (1-10)" type="number" min="1" max="10" value={nouvelleNote.mental} onChange={e=>setNouvelleNote({...nouvelleNote,mental:e.target.value})}/>
<input placeholder="Communication (1-10)" type="number" min="1" max="10" value={nouvelleNote.communication} onChange={e=>setNouvelleNote({...nouvelleNote,communication:e.target.value})}/>
<input placeholder="Gameplay (1-10)" type="number" min="1" max="10" value={nouvelleNote.gameplay} onChange={e=>setNouvelleNote({...nouvelleNote,gameplay:e.target.value})}/>
<button onClick={ajouterNote}>Ajouter Note</button>
</div>}
{notes.map(n=><div key={n.id} className="note-card"><div>{n.joueur} - DYNO vs {matchs.find(m=>m.id===n.matchId)?.adversaire||'Inconnu'}</div><div>Mental: {n.mental}/10 | Com: {n.communication}/10 | GP: {n.gameplay}/10</div></div>)}
</div>}

{activeTab==='strats'&&<div className="section">
<h2>Strategies</h2>
{user&&<button onClick={()=>setShowAddStrat(!showAddStrat)}>{showAddStrat?'Annuler':'Nouvelle Strat'}</button>}
{showAddStrat&&<div className="add-form">
<input placeholder="Adversaire" value={nouvelleStrat.adversaire} onChange={e=>setNouvelleStrat({...nouvelleStrat,adversaire:e.target.value})}/>
<div className="picks-bans">
<div><h4>Picks</h4>{AM.map(map=><label key={map}><input type="checkbox" checked={nouvelleStrat.picks.includes(map)} onChange={()=>{if(nouvelleStrat.picks.includes(map))setNouvelleStrat({...nouvelleStrat,picks:nouvelleStrat.picks.filter(p=>p!==map)});else if(nouvelleStrat.picks.length<5)setNouvelleStrat({...nouvelleStrat,picks:[...nouvelleStrat.picks,map]})}}/>{map}</label>)}</div>
<div><h4>Bans</h4>{AM.map(map=><label key={map}><input type="checkbox" checked={nouvelleStrat.bans.includes(map)} onChange={()=>{if(nouvelleStrat.bans.includes(map))setNouvelleStrat({...nouvelleStrat,bans:nouvelleStrat.bans.filter(p=>p!==map)});else if(nouvelleStrat.bans.length<3)setNouvelleStrat({...nouvelleStrat,bans:[...nouvelleStrat.bans,map]})}}/>{map}</label>)}</div>
</div>
<button onClick={ajouterStrat}>Enregistrer</button>
</div>}
{strats.map(s=><div key={s.id} className="strat-card"><div>DYNO vs {s.adversaire}</div><div>Picks: {s.picks.join(', ')}</div><div>Bans: {s.bans.join(', ')}</div><div className="author">Par {s.auteur}</div></div>)}
</div>}

{activeTab==='commentaires'&&<div className="section">
<h2>Commentaires</h2>
{matchs.map(m=><div key={m.id} className="match-comments">
<div className="match-title">DYNO vs {m.adversaire}</div>
{user&&selectedMatchForComment?.id===m.id?<div className="comment-form"><input placeholder="Votre commentaire..." value={nouveauCommentaire} onChange={e=>setNouveauCommentaire(e.target.value)}/><button onClick={()=>ajouterCommentaire(m.id)}>Envoyer</button></div>:<button onClick={()=>{setSelectedMatchForComment(selectedMatchForComment?.id===m.id?null:m)}}>Commenter</button>}
{commentaires.filter(c=>c.matchId===m.id).map(c=><div key={c.id} className="comment"><strong>{c.joueur}</strong>: {c.texte}<span className="date">{fts(c.createdAt)}</span></div>)}
</div>)}
</div>}

{activeTab==='compos'&&<div className="section">
<h2>Compositions par Map</h2>
{user&&<button onClick={()=>setShowAddCompo(!showAddCompo)}>{showAddCompo?'Annuler':'Nouvelle Compo'}</button>}
{showAddCompo&&<div className="add-form">
<select value={selectedMapCompo} onChange={e=>setSelectedMapCompo(e.target.value)}><option value="">Selectionner une map</option>{AM.map(map=><option key={map} value={map}>{map}</option>)}</select>
<div className="players-grid">{joueurs.map(j=><label key={j.id}><input type="checkbox" checked={compoJoueurs.includes(j.pseudo)} onChange={()=>toggleCompoJoueur(j.pseudo)}/>{j.pseudo}</label>)}</div>
<button onClick={ajouterCompo}>Enregistrer</button>
</div>}
{compos.map(c=><div key={c.id} className="compo-card"><div>{c.map}</div><div>Joueurs: {c.joueurs.join(', ')}</div></div>)}
</div>}

{activeTab==='joueurs'&&<div className="section">
<h2>Joueurs</h2>
{joueurs.map(j=><div key={j.id} className="player-card"><div>{j.pseudo}</div><div>{j.role}</div><div>{j.rang}</div></div>)}
</div>}

{activeTab==='objectifs'&&<div className="section">
<h2>Objectifs</h2>
{user&&<div className="add-form"><input placeholder="Nouvel objectif..." value={nouvelObjectif} onChange={e=>setNouvelObjectif(e.target.value)}/><button onClick={ajouterObjectif}>Ajouter</button></div>}
{objectifs.filter(o=>o.joueurId===user?.uid).map(o=><div key={o.id} className="objectif-card"><label><input type="checkbox" checked={o.termine} onChange={()=>toggleObjectif(o.id,o.termine)}/>{o.texte}</label></div>)}
</div>}

{activeTab==='analyses'&&<div className="section">
<h2>Analyses de Matchs</h2>
{user&&<div className="add-form">
<select onChange={e=>setSelectedMatchForAnalyse(matchs.find(m=>m.id===e.target.value))}>
<option>Selectionner un match</option>
{matchs.filter(m=>m.termine).map(m=><option key={m.id} value={m.id}>DYNO vs {m.adversaire}</option>)}
</select>
<textarea placeholder="Ce qui a bien fonctionne..." value={nouvelleAnalyse.bien} onChange={e=>setNouvelleAnalyse({...nouvelleAnalyse,bien:e.target.value})}/>
<textarea placeholder="Ce qui a mal fonctionne..." value={nouvelleAnalyse.mal} onChange={e=>setNouvelleAnalyse({...nouvelleAnalyse,mal:e.target.value})}/>
<textarea placeholder="Plan pour le prochain match..." value={nouvelleAnalyse.plan} onChange={e=>setNouvelleAnalyse({...nouvelleAnalyse,plan:e.target.value})}/>
<button onClick={()=>selectedMatchForAnalyse&&ajouterAnalyse(selectedMatchForAnalyse.id)}>Enregistrer</button>
</div>}
{analyses.map(a=><div key={a.id} className="analyse-card"><div>{a.joueur} - DYNO vs {matchs.find(m=>m.id===a.matchId)?.adversaire||'Inconnu'}</div><div><strong>Bien:</strong> {a.bien}</div><div><strong>Mal:</strong> {a.mal}</div><div><strong>Plan:</strong> {a.plan}</div></div>)}
</div>}

{activeTab==='fiches'&&<div className="section">
<h2>Fiches Adversaires</h2>
{user&&<button onClick={()=>setShowAddFiche(!showAddFiche)}>{showAddFiche?'Annuler':'Nouvelle Fiche'}</button>}
{showAddFiche&&<div className="add-form">
<input placeholder="Nom de l'equipe adverse" value={nouvelleFiche.adversaire} onChange={e=>setNouvelleFiche({...nouvelleFiche,adversaire:e.target.value})}/>
<textarea placeholder="Forces de l'adversaire..." value={nouvelleFiche.forces} onChange={e=>setNouvelleFiche({...nouvelleFiche,forces:e.target.value})}/>
<textarea placeholder="Faiblesses de l'adversaire..." value={nouvelleFiche.faiblesses} onChange={e=>setNouvelleFiche({...nouvelleFiche,faiblesses:e.target.value})}/>
<textarea placeholder="Notes supplementaires..." value={nouvelleFiche.notes} onChange={e=>setNouvelleFiche({...nouvelleFiche,notes:e.target.value})}/>
<button onClick={ajouterFiche}>Enregistrer</button>
</div>}
{fichesAdversaires.map(f=><div key={f.id} className="fiche-card"><div>{f.adversaire}</div><div><strong>Forces:</strong> {f.forces}</div><div><strong>Faiblesses:</strong> {f.faiblesses}</div>{f.notes&&<div><strong>Notes:</strong> {f.notes}</div>}</div>)}
</div>}

{!user&&<div className="auth-modal">
{isSignUp?<div className="auth-form"><h3>Inscription</h3><input placeholder="Pseudo" value={pseudo} onChange={e=>setPseudo(e.target.value)}/><input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/><input type="password" placeholder="Mot de passe" value={authPassword} onChange={e=>setAuthPassword(e.target.value)}/><button onClick={handleSignUp}>S'inscrire</button><button onClick={()=>setIsSignUp(false)}>Deja un compte?</button></div>:<div className="auth-form"><h3>Connexion</h3><input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/><input type="password" placeholder="Mot de passe" value={authPassword} onChange={e=>setAuthPassword(e.target.value)}/><button onClick={handleSignIn}>Se connecter</button><button onClick={()=>setIsSignUp(true)}>Creer un compte</button></div>}
</div>}

{isAdmin&&<div className="admin-panel">
<h3>Panel Admin</h3>
{!isAdmin&&<div><input type="password" placeholder="Mot de passe admin" value={adminPassword} onChange={e=>setAdminPassword(e.target.value)}/><button onClick={handleAdminLogin}>Connexion Admin</button></div>}
</div>}

{scoreEdit&&<div className="modal"><div className="modal-content"><h3>Entrer le score - DYNO vs {scoreEdit.adversaire}</h3><input type="number" placeholder="Score DYNO" value={scoreEdit.scoreDyno||0} onChange={e=>setScoreEdit({...scoreEdit,scoreDyno:e.target.value})}/><input type="number" placeholder={'Score '+scoreEdit.adversaire} value={scoreEdit.scoreAdv||0} onChange={e=>setScoreEdit({...scoreEdit,scoreAdv:e.target.value})}/><button onClick={updateScore}>Valider</button><button onClick={()=>setScoreEdit(null)}>Annuler</button></div></div>}

{showInstall&&<div className="install-prompt"><div>Installer l'application DYNO</div><button onClick={handleInstall}>Installer</button><button onClick={()=>setShowInstall(false)}>Plus tard</button></div>}

{!notificationsEnabled&&'Notification' in window&&<div className="notif-prompt"><div>Activer les notifications pour les matchs DYNO?</div><button onClick={async()=>{const p=await Notification.requestPermission();if(p==='granted'){setNotificationsEnabled(true);localStorage.setItem('dyno-notifs','true')}}}>Activer</button><button onClick={()=>setShowInstall(false)}>Non</button></div>}

<P/>

<footer className="footer">
<div>DYNO ESPORT 2026</div>
<div><a href={YT} target="_blank" rel="noreferrer">YouTube</a></div>
</footer>
</div>
)
}

export default App