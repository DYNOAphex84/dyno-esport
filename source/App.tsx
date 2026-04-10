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
const[scoreEdit,setScoreEdit]=useState<any>(null),[nouveauReplay,setNouveauReplay]=useState({titre:'',lien:''}),[nouvelleNote,setNouvelleNote]=useState({matchId:'',mental:'',communication:'',gameplay:''}),[selectedMatchForNotes,setSelectedMatchForNotes]=useState<any>(null),[nouvelleStrat,setNouvelleStrat]=useState({adversaire:'',picks:[] as string[],bans:[] as string[]}),[showAddStrat,setShowAddStrat]=useState(false)
const[deferredPrompt,setDeferredPrompt]=useState<any>(null),[showInstall,setShowInstall]=useState(false),[countdowns,setCountdowns]=useState<Record<string,string>>({}),[nouveauCommentaire,setNouveauCommentaire]=useState(''),[selectedMatchForComment,setSelectedMatchForComment]=useState<any>(null),[notificationsEnabled,setNotificationsEnabled]=useState(false),[notifiedMatchs,setNotifiedMatchs]=useState<string[]>([])
const[selectedMapCompo,setSelectedMapCompo]=useState(''),[compoJoueurs,setCompoJoueurs]=useState<string[]>([]),[showAddCompo,setShowAddCompo]=useState(false),[anniversaire,setAnniversaire]=useState(''),[viewMode,setViewMode]=useState<'list'|'grid'>('list'),[pullDistance,setPullDistance]=useState(0),[isRefreshing,setIsRefreshing]=useState(false)
const[nouvelObjectif,setNouvelObjectif]=useState(''),[showBilan,setShowBilan]=useState(false),[selectedMatchForAnalyse,setSelectedMatchForAnalyse]=useState<any>(null),[nouvelleAnalyse,setNouvelleAnalyse]=useState({bien:'',mal:'',plan:''}),[showAddFiche,setShowAddFiche]=useState(false),[nouvelleFiche,setNouvelleFiche]=useState({adversaire:'',forces:'',faiblesses:'',notes:''})
const pm=useRef(0),pn=useRef(0),pc=useRef(0),ps=useRef(0),ty=useRef(0)

useEffect(()=>{if(window.location.search.includes('reset=1')){localStorage.clear();window.location.href=window.location.pathname}},[])
const sendNotification=useCallback((t:string,b:string,tg?:string)=>{try{if(!('Notification' in window)||Notification.permission!=='granted')return;const n=new Notification(t,{body:b,icon:LG,badge:LG,tag:tg||'d',requireInteraction:false});n.onclick=()=>{window.focus();n.close()}}catch{}},[])
const requestNotificationPermission=async()=>{try{if(!('Notification' in window)){alert('❌');return};const p=await Notification.requestPermission();if(p==='granted'){setNotificationsEnabled(true);localStorage.setItem('dyno-notifs','true');alert('✅ Notifs activées !')}else{setNotificationsEnabled(false);localStorage.setItem('dyno-notifs','false');alert('❌')}}catch{alert('❌')}}
const getMatchDateTime=useCallback((m:any):Date|null=>{if(!m?.date)return null;let d=m.date;const t=m.horaires?.[0]||m.horaire1||'20:00';if(d.includes('/')){const[dd,mm,yy]=d.split('/');d=`${yy}-${mm}-${dd}`};try{const dt=new Date(`${d}T${t}:00`);return isNaN(dt.getTime())?null:dt}catch{return null}},[])

useEffect(()=>{try{if('Notification' in window&&Notification.permission==='granted'&&localStorage.getItem('dyno-notifs')==='true')setNotificationsEnabled(true)}catch{};try{setNotifiedMatchs(JSON.parse(localStorage.getItem('dyno-notified')||'[]'))}catch{setNotifiedMatchs([])}},[])
useEffect(()=>{if(!notificationsEnabled)return;try{if(!('Notification' in window)||Notification.permission!=='granted')return}catch{return};const ck=()=>{const now=new Date();matchs.forEach((m:any)=>{if(m.termine)return;const mt=getMatchDateTime(m);if(!mt)return;const dm=(mt.getTime()-now.getTime())/60000;const k1=`${m.id}-1h`;if(dm>55&&dm<=65&&!notifiedMatchs.includes(k1)){sendNotification('🎮 1h !',`DYNO vs ${m.adversaire}`,'m1h');const u=[...notifiedMatchs,k1];setNotifiedMatchs(u);localStorage.setItem('dyno-notified',JSON.stringify(u))};const k2=`${m.id}-15m`;if(dm>10&&dm<=20&&!notifiedMatchs.includes(k2)){sendNotification('🔥 15min !',`DYNO vs ${m.adversaire}`,'m15');const u=[...notifiedMatchs,k2];setNotifiedMatchs(u);localStorage.setItem('dyno-notified',JSON.stringify(u))};const k3=`${m.id}-now`;if(dm>=-2&&dm<=3&&!notifiedMatchs.includes(k3)){sendNotification('⚡ GO !',`DYNO vs ${m.adversaire}`,'mnow');const u=[...notifiedMatchs,k3];setNotifiedMatchs(u);localStorage.setItem('dyno-notified',JSON.stringify(u))}})};ck();const i=setInterval(ck,60000);return()=>clearInterval(i)},[notificationsEnabled,matchs,notifiedMatchs,sendNotification,getMatchDateTime])
useEffect(()=>{const u=()=>{const now=new Date(),c:Record<string,string>={};matchs.forEach((m:any)=>{if(m.termine)return;const mt=getMatchDateTime(m);if(!mt)return;const df=mt.getTime()-now.getTime();if(df<=0){c[m.id]='🔴 EN COURS';return};const j=Math.floor(df/86400000),h=Math.floor((df%86400000)/3600000),mi=Math.floor((df%3600000)/60000),s=Math.floor((df%60000)/1000);c[m.id]=`${j>0?j+'j ':''}${(h>0||j>0)?h+'h ':''}${mi}m ${s}s`});setCountdowns(c)};u();const i=setInterval(u,1000);return()=>clearInterval(i)},[matchs,getMatchDateTime])
useEffect(()=>{if(localStorage.getItem('dyno-admin')==='true')setIsAdmin(true)},[])
useEffect(()=>{const unsub=onAuthStateChanged(auth,async(u:any)=>{setUser(u);if(u){const d=await getDoc(doc(db,'users',u.uid));if(d.exists()){const data=d.data();setPseudo(data.pseudo||'');if(data.anniversaire)setAnniversaire(data.anniversaire);if(u.email===AE||data.isAdmin){setIsAdmin(true);localStorage.setItem('dyno-admin','true')}}};setLoading(false)});return()=>unsub()},[])

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

useEffect(()=>{if(!notificationsEnabled||pm.current===0){pm.current=matchs.length;return};if(matchs.length>pm.current){const n=matchs[0];if(n)sendNotification('📅 Match !',`DYNO vs ${n.adversaire}`,'nm')};pm.current=matchs.length},[matchs,notificationsEnabled,sendNotification])
useEffect(()=>{if(!notificationsEnabled||pn.current===0){pn.current=notes.length;return};if(notes.length>pn.current){const n=notes[0];if(n)sendNotification('📊 Note !',`${n.joueur}`,'nn')};pn.current=notes.length},[notes,notificationsEnabled,sendNotification])
useEffect(()=>{if(!notificationsEnabled||pc.current===0){pc.current=commentaires.length;return};if(commentaires.length>pc.current){const n=commentaires[0];if(n)sendNotification('💬 !',`${n.joueur}: ${n.texte.substring(0,50)}`,'nc')};pc.current=commentaires.length},[commentaires,notificationsEnabled,sendNotification])
useEffect(()=>{if(!notificationsEnabled||ps.current===0){ps.current=strats.length;return};if(strats.length>ps.current){const n=strats[0];if(n)sendNotification('🎯 Strat !',`DYNO vs ${n.adversaire}`,'ns')};ps.current=strats.length},[strats,notificationsEnabled,sendNotification])

useEffect(()=>{const t=setTimeout(()=>setShowSplash(false),2500);return()=>clearTimeout(t)},[])
useEffect(()=>{window.addEventListener('beforeinstallprompt',(e:any)=>{e.preventDefault();setDeferredPrompt(e);setShowInstall(true)})},[])
const handleInstall=()=>{if(deferredPrompt){deferredPrompt.prompt();setDeferredPrompt(null);setShowInstall(false)}}
const handleSignUp=async()=>{if(!email||!authPassword||!pseudo){alert('⚠️ Remplis tout !');return};try{const r=await createUserWithEmailAndPassword(auth,email,authPassword);await setDoc(doc(db,'users',r.user.uid),{pseudo,email,createdAt:Date.now(),isAdmin:email===AE});await addDoc(collection(db,'players'),{pseudo,role:'Joueur',rang:'Nouveau',userId:r.user.uid,createdAt:Date.now()});alert('✅!');setIsSignUp(false);setEmail('');setAuthPassword('')}catch(e:any){alert('❌ '+e.message)}}
const handleSignIn=async()=>{if(!email||!authPassword){alert('⚠️!');return};try{await setPersistence(auth,browserLocalPersistence);await signInWithEmailAndPassword(auth,email,authPassword);localStorage.setItem('user-email',email);alert('✅!');setEmail('');setAuthPassword('')}catch(e:any){alert('❌ '+e.message)}}
const handleSignOut=async()=>{await signOut(auth);setPseudo('');setIsAdmin(false);localStorage.removeItem('dyno-admin');localStorage.removeItem('user-email');alert('✅!')}
const handleAdminLogin=()=>{if(adminPassword==='dyno2026'){setIsAdmin(true);localStorage.setItem('dyno-admin','true');setAdminPassword('')}else alert('❌!')}
const handleAdminLogout=()=>{setIsAdmin(false);localStorage.removeItem('dyno-admin')}

const ajouterSousMatch=()=>{
  const adv=prompt('Adversaire :');if(!adv)return;
  const sd=prompt('Score DYNO :');if(!sd)return;
  const sa=prompt(`Score ${adv} :`);if(!sa)return;
  if(scoreEdit){
    setScoreEdit({...scoreEdit, sousMatchs: [...(scoreEdit.sousMatchs||[]), {adversaire:adv, scoreDyno:sd, scoreAdv:sa}]});
  } else {
    setNouveauMatch({...nouveauMatch,sousMatchs:[...nouveauMatch.sousMatchs,{adversaire:adv,scoreDyno:sd,scoreAdv:sa}]});
  }
}
const supprimerSousMatch=(i:number)=>{
  if(scoreEdit){
    const sm=[...(scoreEdit.sousMatchs||[])];sm.splice(i,1);
    setScoreEdit({...scoreEdit, sousMatchs:sm});
  } else {
    const sm=[...nouveauMatch.sousMatchs];sm.splice(i,1);
    setNouveauMatch({...nouveauMatch,sousMatchs:sm});
  }
}

const ajouterMatch=async()=>{if(!nouveauMatch.adversaire||!nouveauMatch.date||!nouveauMatch.horaire1){alert('⚠️!');return};const md:any={...nouveauMatch,termine:false,disponibles:[],indisponibles:[],createdAt:Date.now()};if(nouveauMatch.type==='Division'&&nouveauMatch.sousMatchs.length>0){md.termine=true;md.sousMatchs=nouveauMatch.sousMatchs;md.scoreDyno=nouveauMatch.sousMatchs.reduce((a:number,s:any)=>a+parseInt(s.scoreDyno||0),0);md.scoreAdversaire=nouveauMatch.sousMatchs.reduce((a:number,s:any)=>a+parseInt(s.scoreAdv||0),0)};await addDoc(collection(db,'matchs'),md);const h=[nouveauMatch.horaire1];if(nouveauMatch.horaire2)h.push(nouveauMatch.horaire2);try{await fetch(DW,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({embeds:[{title:'🎮 DYNO vs '+nouveauMatch.adversaire,color:13934871,fields:[{name:'⚔️',value:nouveauMatch.adversaire,inline:true},{name:'📅',value:nouveauMatch.date,inline:true},{name:'⏰',value:h.join(' / '),inline:true},{name:'🏟️',value:nouveauMatch.arene,inline:true},{name:'📊',value:nouveauMatch.type,inline:true}],footer:{text:'DYNO',icon_url:LG}}]})})}catch{};setNouveauMatch({adversaire:'',date:'',horaire1:'',horaire2:'',arene:'Arène 1',type:'Ligue',sousMatchs:[]});alert('✅!')}
const ajouterReplay=async()=>{if(!nouveauReplay.titre||!nouveauReplay.lien){alert('⚠️!');return};await addDoc(collection(db,'replays'),{...nouveauReplay,createdAt:Date.now()});setNouveauReplay({titre:'',lien:''});alert('✅!')}
const ajouterNote=async()=>{if(!user)return;await addDoc(collection(db,'notes'),{matchId:selectedMatchForNotes?.id,joueur:pseudo,joueurId:user.uid,...nouvelleNote,createdAt:Date.now()});setNouvelleNote({matchId:'',mental:'',communication:'',gameplay:''});setSelectedMatchForNotes(null);alert('✅!')}
const ajouterCommentaire=async(id:string)=>{if(!user||!nouveauCommentaire.trim())return;await addDoc(collection(db,'commentaires'),{matchId:id,joueur:pseudo,joueurId:user.uid,texte:nouveauCommentaire.trim(),createdAt:Date.now()});setNouveauCommentaire('');setSelectedMatchForComment(null);alert('✅!')}
const ajouterStrat=async()=>{if(!nouvelleStrat.adversaire||nouvelleStrat.picks.length===0||nouvelleStrat.bans.length===0){alert('⚠️!');return};await addDoc(collection(db,'strats'),{adversaire:nouvelleStrat.adversaire,picks:nouvelleStrat.picks,bans:nouvelleStrat.bans,auteur:pseudo,auteurId:user?.uid,createdAt:Date.now()});setNouvelleStrat({adversaire:'',picks:[],bans:[]});setShowAddStrat(false);alert('✅!')}
const ajouterCompo=async()=>{if(!selectedMapCompo||compoJoueurs.length===0){alert('⚠️!');return};const ex=compos.find((c:any)=>c.map===selectedMapCompo);if(ex){await updateDoc(doc(db,'compos',ex.id),{joueurs:compoJoueurs,updatedAt:Date.now()})}else{await addDoc(collection(db,'compos'),{map:selectedMapCompo,joueurs:compoJoueurs,auteur:pseudo,createdAt:Date.now()})};setShowAddCompo(false);setSelectedMapCompo('');setCompoJoueurs([]);alert('✅!')}
const ajouterObjectif=async()=>{if(!user||!nouvelObjectif.trim())return;await addDoc(collection(db,'objectifs'),{texte:nouvelObjectif.trim(),termine:false,joueur:pseudo,joueurId:user.uid,createdAt:Date.now()});setNouvelObjectif('')}
const toggleObjectif=async(id:string,c:boolean)=>{await updateDoc(doc(db,'objectifs',id),{termine:!c})}
const ajouterAnalyse=async(mid:string)=>{if(!user)return;await addDoc(collection(db,'analyses'),{matchId:mid,joueur:pseudo,joueurId:user.uid,...nouvelleAnalyse,createdAt:Date.now()});setNouvelleAnalyse({bien:'',mal:'',plan:''});setSelectedMatchForAnalyse(null);alert('✅!')}
const ajouterFiche=async()=>{if(!nouvelleFiche.adversaire.trim())return;await addDoc(collection(db,'fichesAdversaires'),{...nouvelleFiche,auteur:pseudo,auteurId:user?.uid,createdAt:Date.now()});setNouvelleFiche({adversaire:'',forces:'',faiblesses:'',notes:''});setShowAddFiche(false);alert('✅!')}

const del=async(col:string,id:string)=>{if(confirm('Supprimer ?')) await deleteDoc(doc(db,col,id))}
const updateScore=async()=>{
  if(!scoreEdit)return;
  const updateData:any = {
    scoreDyno: parseInt(scoreEdit.scoreDyno || '0'),
    scoreAdversaire: parseInt(scoreEdit.scoreAdv || '0'),
    termine: true
  };
  if(scoreEdit.type === 'Division' && scoreEdit.sousMatchs?.length > 0){
    updateData.sousMatchs = scoreEdit.sousMatchs;
    updateData.scoreDyno = scoreEdit.sousMatchs.reduce((a:number,s:any)=>a+parseInt(s.scoreDyno||0),0);
    updateData.scoreAdversaire = scoreEdit.sousMatchs.reduce((a:number,s:any)=>a+parseInt(s.scoreAdv||0),0);
  }
  await updateDoc(doc(db,'matchs',scoreEdit.id), updateData);
  setScoreEdit(null);
  alert('✅ Mis à jour !');
}
const toggleDispo=async(mid:string)=>{if(!user)return;const m=matchs.find((x:any)=>x.id===mid);if(!m)return;const d=m.disponibles||[],i=m.indisponibles||[];await updateDoc(doc(db,'matchs',mid),{disponibles:d.includes(pseudo)?d.filter((p:string)=>p!==pseudo):[...d,pseudo],indisponibles:i.filter((p:string)=>p!==pseudo)})}
const toggleIndispo=async(mid:string)=>{if(!user)return;const m=matchs.find((x:any)=>x.id===mid);if(!m)return;const d=m.disponibles||[],i=m.indisponibles||[];await updateDoc(doc(db,'matchs',mid),{indisponibles:i.includes(pseudo)?i.filter((p:string)=>p!==pseudo):[...i,pseudo],disponibles:d.filter((p:string)=>p!==pseudo)})}
const fdf=(s:string)=>{if(!s)return'';if(s.includes('/'))return s;const[y,m,d]=s.split('-');return`${d}/${m}/${y}`}
const fts=(t:number)=>{const d=new Date(t);return`${d.toLocaleDateString('fr-FR')} ${d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}`}
const atc=(m:any)=>{try{if(!m?.date)return;let y:string,mo:string,d:string;if(m.date.includes('/')){const[dd,mm,yy]=m.date.split('/');d=dd;mo=mm;y=yy}else{const[yy,mm,dd]=m.date.split('-');y=yy;mo=mm;d=dd};const md=`${y}${mo}${d}`;let h='20',mi='00';if(m.horaires?.length>0){const[hh,mm]=m.horaires[0].split(':');h=hh;mi=mm||'00'}else if(m.horaire1){const[hh,mm]=m.horaire1.split(':');h=hh;mi=mm||'00'};const st=`${h}${mi}00`,et=`${(parseInt(h)+2).toString().padStart(2,'0')}${mi}00`;if(/iPad|iPhone|iPod/.test(navigator.userAgent)){const ics=`BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:${m.id}@d\nDTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').split('.')[0]}Z\nDTSTART:${md}T${st}\nDTEND:${md}T${et}\nSUMMARY:DYNO vs ${m.adversaire}\nLOCATION:${m.arene}\nEND:VEVENT\nEND:VCALENDAR`;const b=new Blob([ics],{type:'text/calendar'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=`D_${m.adversaire}.ics`;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(u)}else{window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`DYNO vs ${m.adversaire}`)}&dates=${md}T${st}/${md}T${et}&location=${encodeURIComponent(m.arene)}`,'_blank')}}catch(e:any){alert('❌ '+e.message)}}
const toggleMap=(map:string,type:'picks'|'bans')=>{if(type==='picks'){if(nouvelleStrat.picks.includes(map))setNouvelleStrat({...nouvelleStrat,picks:nouvelleStrat.picks.filter(m=>m!==map)});else if(nouvelleStrat.picks.length<4)setNouvelleStrat({...nouvelleStrat,picks:[...nouvelleStrat.picks,map]})}else{if(nouvelleStrat.bans.includes(map))setNouvelleStrat({...nouvelleStrat,bans:nouvelleStrat.bans.filter(m=>m!==map)});else if(nouvelleStrat.bans.length<4)setNouvelleStrat({...nouvelleStrat,bans:[...nouvelleStrat.bans,map]})}}
const genBilan=()=>{const now=new Date();const mm=historique.filter((m:any)=>{const d=new Date(m.createdAt);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear()});const w=mm.filter((m:any)=>(m.scoreDyno||0)>(m.scoreAdversaire||0)).length,l=mm.filter((m:any)=>(m.scoreDyno||0)<(m.scoreAdversaire||0)).length;const mn=notes.filter((n:any)=>{const d=new Date(n.createdAt);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear()});const am=mn.length>0?Math.round(mn.reduce((a:number,n:any)=>a+parseInt(n.mental||0),0)/mn.length):0,ac=mn.length>0?Math.round(mn.reduce((a:number,n:any)=>a+parseInt(n.communication||0),0)/mn.length):0,ap=mn.length>0?Math.round(mn.reduce((a:number,n:any)=>a+parseInt(n.gameplay||0),0)/mn.length):0;return{nom:['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'][now.getMonth()],m:mm.length,w,l,wr:mm.length>0?Math.round((w/(w+l||1))*100):0,am,ac,ap}}

const victoires=matchs.filter((m:any)=>m.termine&&(m.scoreDyno||0)>(m.scoreAdversaire||0)).length
const defaites=matchs.filter((m:any)=>m.termine&&(m.scoreDyno||0)<(m.scoreAdversaire||0)).length
const totalMatchs=victoires+defaites,winRate=totalMatchs>0?Math.round((victoires/totalMatchs)*100):0
const prochainsMatchs=matchs.filter((m:any)=>!m.termine).sort((a:any,b:any)=>new Date(`${a.date}T${a.horaires?.[0]||a.horaire1||'20:00'}`).getTime()-new Date(`${b.date}T${b.horaires?.[0]||b.horaire1||'20:00'}`).getTime())
const historique=matchs.filter((m:any)=>m.termine).sort((a,b)=> (b.createdAt || 0) - (a.createdAt || 0));
const ytId=(url:string)=>{const m=url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);return m?m[1]:null}
const H=({title,icon}:{title:string;icon?:string})=>(<div className="relative rounded-3xl p-7 mb-5 text-center overflow-hidden bg-gradient-to-br from-[#D4AF37]/10 via-[#D4AF37]/5 to-transparent border border-[#D4AF37]/15 shadow-[0_8px_32px_rgba(212,175,55,0.1)] glow-pulse"><div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent"/><img src={LG} alt="D" className="w-14 h-14 mx-auto mb-2 relative z-10 drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]"/><h2 className="text-lg font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent relative z-10">{icon} {title}</h2></div>)

if(showSplash)return(<div className="min-h-screen flex items-center justify-center relative overflow-hidden"><P/><div className="text-center relative z-10"><img src={LG} alt="D" className="w-48 h-48 mx-auto splash-logo drop-shadow-[0_0_40px_rgba(212,175,55,0.6)]"/><h1 className="text-5xl font-bold bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] bg-clip-text text-transparent mt-6 splash-text">DYNO</h1><p className="text-gray-400 mt-3 splash-sub tracking-[0.3em] uppercase text-sm">Esport Team</p></div></div>)

return(
<div className="min-h-screen pb-28 relative">
<P/>
<header className="backdrop-blur-2xl bg-black/30 border-b border-white/5 sticky top-0 z-50 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
<div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
<div className="flex items-center gap-2.5"><img src={LG} alt="D" className="w-10 h-10 drop-shadow-[0_0_12px_rgba(212,175,55,0.5)]"/><div><h1 className="text-lg font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent leading-tight">DYNO</h1><p className="text-[9px] text-gray-600 uppercase tracking-widest">Esport</p></div></div>
<div className="flex gap-1.5 items-center">
{user&&(<button onClick={requestNotificationPermission} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${notificationsEnabled?'bg-[#D4AF37]/20 border border-[#D4AF37]/40 shadow-[0_0_10px_rgba(212,175,55,0.3)]':'bg-white/5 border border-white/10'}`}><span className="text-sm">{notificationsEnabled?'🔔':''}</span></button>)}
{user?(<button onClick={handleSignOut} className="px-3 py-1.5 rounded-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/20 text-[11px] hover:scale-105 transition-transform">👋 {pseudo}</button>):(<button onClick={()=>setIsSignUp(false)} className="px-3 py-1.5 rounded-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/20 text-[11px] hover:scale-105 transition-transform">👤 Compte</button>)}
</div></div></header>

<main className="max-w-lg mx-auto px-4 py-6 relative z-10" onTouchStart={(e)=>ty.current=e.touches[0].clientY} onTouchMove={(e)=>{if(window.scrollY>0)return;const d=e.touches[0].clientY-ty.current;if(d>0)setPullDistance(Math.min(d*0.4,80))}} onTouchEnd={()=>{if(pullDistance>60){setIsRefreshing(true);setTimeout(()=>window.location.reload(),500)};setPullDistance(0)}}>
{pullDistance>0&&(<div className="flex justify-center mb-4" style={{height:pullDistance}}><span className={`text-[#D4AF37] text-2xl ${pullDistance>60?'animate-spin':''}`}>{isRefreshing?'⏳':pullDistance>60?'🔄':'️'}</span></div>)}

{activeTab==='matchs'&&(<div className="tab-content">
<H title="Prochains Matchs"/>
<div className="flex justify-end mb-3"><div className="flex bg-white/5 rounded-xl border border-white/10 overflow-hidden"><button onClick={()=>setViewMode('list')} className={`px-3 py-1.5 text-xs transition-all ${viewMode==='list'?'bg-[#D4AF37]/20 text-[#D4AF37]':'text-gray-600'}`}>☰</button><button onClick={()=>setViewMode('grid')} className={`px-3 py-1.5 text-xs transition-all ${viewMode==='grid'?'bg-[#D4AF37]/20 text-[#D4AF37]':'text-gray-600'}`}>⊞</button></div></div>
{loading?(<div className="space-y-4"><div className="skeleton h-48 w-full"/><div className="skeleton h-48 w-full"/></div>):prochainsMatchs.length===0?(<div className="text-center py-10 text-gray-600">📭 Aucun match</div>):(<div className={viewMode==='grid'?'grid grid-cols-2 gap-3':'space-y-4'}>{prochainsMatchs.map((match:any,idx:number)=>(<div key={match.id} className="card-glow bg-black/30 backdrop-blur-lg rounded-3xl p-4 border border-[#D4AF37]/15 shadow-[0_8px_32px_rgba(0,0,0,0.3)]" style={{animationDelay:`${idx*0.1}s`}}>
<div className="flex items-center justify-between mb-3"><span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${match.type==='Ligue'?'bg-blue-500/20 text-blue-400 border border-blue-500/20':match.type==='Scrim'?'bg-green-500/20 text-green-400 border border-green-500/20':match.type==='Tournoi'?'bg-purple-500/20 text-purple-400 border border-purple-500/20':match.type==='Division'?'bg-orange-500/20 text-orange-400 border border-orange-500/20':'bg-gray-500/20 text-gray-400 border border-gray-500/20'}`}>{match.type}</span><span className="text-[#D4AF37] font-bold text-xs">{fdf(match.date)}</span></div>
{countdowns[match.id]&&(<div className={`rounded-2xl p-2.5 mb-3 text-center border ${countdowns[match.id]==='🔴 EN COURS'?'bg-red-500/10 border-red-500/15':'bg-[#D4AF37]/10 border-[#D4AF37]/15'}`}><p className="text-[9px] text-gray-600 uppercase tracking-wider">Countdown</p><p className={`text-lg font-bold font-mono tracking-wider ${countdowns[match.id]==='🔴 EN COURS'?'text-red-400 animate-pulse':'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent'}`}>{countdowns[match.id]}</p></div>)}
<div className="flex items-center gap-3 mb-3"><img src={LG} alt="D" className="w-10 h-10 drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]"/><span className="text-gray-700 font-light">VS</span><div className="flex-1 text-right"><p className="font-bold text-white text-sm">{match.adversaire}</p><p className="text-[10px] text-[#D4AF37]/60">🏟️ {match.arene}</p></div></div>
<div className="bg-white/5 rounded-xl p-2.5 mb-2 border border-white/5"><p className="text-[9px] text-gray-600 uppercase tracking-wider">⏰</p><p className="text-[#D4AF37] font-bold text-xs">{match.horaires?.join(' / ')||match.horaire1||'20:00'}</p></div>
<div className="bg-white/5 rounded-xl p-2.5 mb-2 border border-white/5"><p className="text-[9px] text-gray-600 mb-1.5 uppercase tracking-wider">👥 Dispo ({(match.disponibles||[]).length})</p>{(match.disponibles||[]).length>0&&(<div className="flex flex-wrap gap-1">{(match.disponibles||[]).map((p:string,i:number)=>(<span key={i} className="bg-[#D4AF37]/15 text-[#D4AF37] px-2 py-0.5 rounded-lg text-[9px] font-bold border border-[#D4AF37]/15">{p}</span>))}</div>)}</div>
<div className="flex gap-2"><button onClick={()=>toggleDispo(match.id)} disabled={!user} className={`flex-1 py-2.5 rounded-xl font-bold transition-all duration-300 text-xs ${!user?'bg-white/5 text-gray-700':(match.disponibles||[]).includes(pseudo)?'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/30 scale-[1.02]':'bg-white/5 border border-[#D4AF37]/15 text-[#D4AF37]'}`}>{!user?'🔐':(match.disponibles||[]).includes(pseudo)?'✅ Dispo':'📅 Dispo'}</button><button onClick={()=>toggleIndispo(match.id)} disabled={!user} className={`flex-1 py-2.5 rounded-xl font-bold transition-all duration-300 text-xs ${!user?'bg-white/5 text-gray-700':(match.indisponibles||[]).includes(pseudo)?'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30 scale-[1.02]':'bg-white/5 border border-red-500/15 text-red-400'}`}>{!user?'🔐':(match.indisponibles||[]).includes(pseudo)?'❌ Indispo':'🚫 Indispo'}</button></div>
</div>))}</div>)}
</div>)}

{activeTab==='historique'&&(<div className="tab-content">
<H title="Historique"/>
<div className="grid grid-cols-2 gap-3 mb-5"><div className="card-glow bg-[#D4AF37]/10 rounded-2xl p-4 border border-[#D4AF37]/15 text-center"><p className="text-3xl font-bold text-[#D4AF37]">{victoires}</p><p className="text-[9px] text-gray-600 mt-1 uppercase tracking-wider">Victoires</p></div><div className="card-glow bg-red-500/10 rounded-2xl p-4 border border-red-500/15 text-center"><p className="text-3xl font-bold text-red-500">{defaites}</p><p className="text-[9px] text-gray-600 mt-1 uppercase tracking-wider">Défaites</p></div></div>
{historique.length===0?(<div className="text-center py-10 text-gray-600">📜 Aucun</div>):(<div className="space-y-3">{historique.map((match:any,idx:number)=>(<div key={match.id} className="card-glow bg-black/30 backdrop-blur-lg rounded-3xl p-4 border border-[#D4AF37]/15" style={{animationDelay:`${idx*0.1}s`}}>
<div className="flex items-center justify-between mb-3">
  <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${(match.scoreDyno||0)>(match.scoreAdversaire||0)?'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/20':'bg-red-500/20 text-red-400 border border-red-500/20'}`}>{(match.scoreDyno||0)>(match.scoreAdversaire||0)?'🏆 VICTOIRE':'❌ DÉFAITE'}</span>
  <div className="flex items-center gap-3">
    <span className="text-gray-600 text-[10px] font-mono">{fdf(match.date)}</span>
    {isAdmin && <button onClick={()=>setScoreEdit({...match, scoreDyno:match.scoreDyno.toString(), scoreAdv:match.scoreAdversaire.toString()})} className="p-1.5 bg-white/5 rounded-lg border border-white/10 text-xs">✏️</button>}
  </div>
</div>
<div className="flex items-center justify-between mb-2">
  <div className="text-center"><p className="font-bold text-[#D4AF37] text-[10px] uppercase tracking-wider">DYNO</p><p className="text-3xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">{match.scoreDyno}</p></div>
  <span className="text-gray-800 text-lg">-</span>
  <div className="text-center"><p className="font-bold text-gray-600 text-[10px] uppercase tracking-wider">{match.adversaire}</p><p className="text-3xl font-bold text-gray-500">{match.scoreAdversaire}</p></div>
</div>
{match.sousMatchs?.length>0&&(<div className="space-y-1 mb-2 pt-2 border-t border-white/5">
  <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1"> Sous-matchs (Division)</p>
  {match.sousMatchs.map((sm:any,i:number)=>(<div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-2.5 py-1.5 border border-white/5"><span className="text-[10px] text-gray-400 font-bold">{sm.adversaire}</span><span className="text-[10px] font-bold"><span className="text-[#D4AF37]">{sm.scoreDyno}</span> - <span className="text-gray-500">{sm.scoreAdv}</span></span></div>))}
</div>)}
<p className="text-center text-gray-700 text-[9px] mt-2 uppercase tracking-wider">{match.type} • {match.arene}</p>
</div>))}</div>)}
</div>)}

{activeTab==='admin'&&(
  <div className="tab-content"><H title="Admin" icon="⚙️"/>{!isAdmin?(<div className="card-glow bg-black/30 rounded-3xl p-5 border border-[#D4AF37]/15"><input type="password" placeholder="Mot de passe" value={adminPassword} onChange={e=>setAdminPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-3 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50"/><button onClick={handleAdminLogin} className="w-full py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/30 text-sm">Connexion</button></div>):(<div className="space-y-5">
<div className="card-glow bg-black/30 rounded-3xl p-5 border border-[#D4AF37]/15">
<h3 className="text-xs font-bold text-[#D4AF37] mb-3 uppercase tracking-wider">➕ Créer Match / Division</h3>
<input type="text" placeholder="Adversaire (ex: DIV 5)" value={nouveauMatch.adversaire} onChange={e=>setNouveauMatch({...nouveauMatch,adversaire:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 mb-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50"/>
<input type="date" value={nouveauMatch.date} onChange={e=>setNouveauMatch({...nouveauMatch,date:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 mb-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50"/>
<div className="grid grid-cols-2 gap-2 mb-2"><input type="time" value={nouveauMatch.horaire1} onChange={e=>setNouveauMatch({...nouveauMatch,horaire1:e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50"/><select value={nouveauMatch.type} onChange={e=>setNouveauMatch({...nouveauMatch,type:e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50"><option value="Ligue">Ligue</option><option value="Scrim">Scrim</option><option value="Tournoi">Tournoi</option><option value="Division">Division</option></select></div>
{nouveauMatch.type==='Division'&&(
  <div className="bg-white/5 rounded-xl p-3 mb-2 border border-white/5">
    <div className="flex items-center justify-between mb-2"><p className="text-[10px] text-[#D4AF37] font-bold uppercase">🏆 Liste des Matchs</p><button onClick={ajouterSousMatch} className="px-2 py-1 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] text-xs">➕ Ajouter Match</button></div>
    <div className="space-y-1">{nouveauMatch.sousMatchs.map((sm,i)=>(<div key={i} className="flex items-center justify-between bg-black/30 rounded-lg px-2 py-1.5 border border-white/5"><div className="flex-1"><p className="text-[9px] text-gray-500">{sm.adversaire}</p><p className="text-[10px] font-bold text-white">{sm.scoreDyno} - {sm.scoreAdv}</p></div><button onClick={()=>supprimerSousMatch(i)} className="text-red-400/40 text-xs px-2">🗑️</button></div>))}</div>
  </div>
)}
<button onClick={ajouterMatch} className="w-full py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/30 text-sm">Enregistrer</button></div>
<div className="card-glow bg-black/30 rounded-3xl p-5 border border-red-500/15">
<h3 className="text-xs font-bold text-red-500 mb-3 uppercase tracking-wider">🗑️ Supprimer Matchs</h3>
<div className="max-h-48 overflow-y-auto space-y-1.5">{matchs.map((m:any)=>(<div key={m.id} className="flex items-center justify-between bg-white/5 rounded-lg p-2.5 border border-white/5"><div><p className="text-[#D4AF37] font-bold text-[10px]">{m.adversaire}</p><p className="text-gray-700 text-[9px]">{fdf(m.date)}</p></div><button onClick={()=>del('matchs',m.id)} className="text-red-400/40 p-2">🗑️</button></div>))}</div>
</div>
<button onClick={handleAdminLogout} className="w-full bg-white/5 border border-red-500/15 text-red-400 py-2.5 rounded-xl font-bold text-sm">🚪 Déconnexion</button></div>)}</div>
)}

{/* MODAL EDITION SCORE & DIVISION */}
{scoreEdit&&(<div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
  <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-6 w-full max-w-sm border border-white/10 shadow-2xl">
    <h3 className="text-lg font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-5 text-center">✏️ Modifier {scoreEdit.adversaire}</h3>
    
    {scoreEdit.type === 'Division' ? (
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">🏆 Liste des Matchs</p>
          <button onClick={ajouterSousMatch} className="px-3 py-1.5 bg-[#D4AF37] text-black rounded-lg text-[10px] font-bold">➕ Ajouter</button>
        </div>
        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
          {scoreEdit.sousMatchs?.length > 0 ? scoreEdit.sousMatchs.map((sm:any, i:number) => (
            <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/10 flex items-center justify-between">
              <div><p className="text-gray-500 text-[9px] font-bold uppercase">{sm.adversaire}</p><p className="text-xl font-bold text-[#D4AF37]">{sm.scoreDyno} - {sm.scoreAdv}</p></div>
              <button onClick={()=>supprimerSousMatch(i)} className="text-red-400/50 hover:text-red-400 text-sm p-2">🗑️</button>
            </div>
          )) : <p className="text-center text-gray-700 text-xs py-4">Aucun sous-match</p>}
        </div>
        <div className="pt-4 border-t border-white/5">
          <p className="text-center text-[10px] text-gray-600 mb-1 uppercase">Score Total Automatique</p>
          <p className="text-center text-2xl font-bold text-white">
            {scoreEdit.sousMatchs?.reduce((a:number,s:any)=>a+parseInt(s.scoreDyno||0),0)} - {scoreEdit.sousMatchs?.reduce((a:number,s:any)=>a+parseInt(s.scoreAdv||0),0)}
          </p>
        </div>
      </div>
    ) : (
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div><label className="text-gray-600 text-[10px] mb-1 block uppercase">DYNO</label><input type="number" value={scoreEdit.scoreDyno} onChange={e=>setScoreEdit({...scoreEdit,scoreDyno:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-xl font-bold focus:outline-none"/></div>
        <div><label className="text-gray-600 text-[10px] mb-1 block uppercase">ADV</label><input type="number" value={scoreEdit.scoreAdv} onChange={e=>setScoreEdit({...scoreEdit,scoreAdv:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-xl font-bold focus:outline-none"/></div>
      </div>
    )}

    <div className="flex gap-2">
      <button onClick={()=>setScoreEdit(null)} className="flex-1 py-3 rounded-xl font-bold bg-white/5 border border-white/10 text-gray-500 text-sm">Annuler</button>
      <button onClick={updateScore} className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/30 text-sm">Sauvegarder</button>
    </div>
  </div>
</div>)}

{activeTab==='strats'&&(
  <div className="tab-content"><H title="Strats" icon="🎯"/>
    {user&&(<button onClick={()=>setShowAddStrat(true)} className="w-full mb-5 py-3 rounded-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-sm shadow-lg shadow-[#D4AF37]/20">➕ Nouvelle Strat</button>)}
    {strats.map(s=>(<div key={s.id} className="card-glow bg-black/30 rounded-2xl p-4 border border-[#D4AF37]/15 mb-3"><p className="font-bold text-[#D4AF37]">{s.adversaire}</p><div className="flex gap-1 mt-2 flex-wrap">{s.picks?.map((p:any,i:any)=>(<span key={i} className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-lg border border-green-500/20">{p}</span>))}</div></div>))}
  </div>
)}

{activeTab==='roster'&&(
  <div className="tab-content"><H title="Roster" icon="👥"/>
    {joueurs.map(j=>(<div key={j.id} className="card-glow bg-black/30 rounded-2xl p-4 border border-white/5 mb-2 flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-bold">{j.pseudo[0]}</div><p className="font-bold text-white">{j.pseudo}</p></div><p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">{j.role}</p></div>))}
  </div>
)}

{activeTab==='rec'&&(
  <div className="tab-content"><H title="Replays" icon="🎬"/>
    <a href={YT} target="_blank" className="block w-full mb-5 py-3 rounded-2xl bg-red-600 text-white text-center font-bold text-sm">VOIR SUR YOUTUBE</a>
    {replays.map(r=>(<div key={r.id} className="card-glow bg-black/30 rounded-2xl p-3 border border-white/5 mb-3"><p className="font-bold text-[#D4AF37] mb-2">{r.titre}</p><div className="relative pt-[56%] rounded-xl overflow-hidden"><iframe src={`https://www.youtube.com/embed/${ytId(r.lien)}`} className="absolute inset-0 w-full h-full" frameBorder="0" allowFullScreen></iframe></div></div>))}
  </div>
)}

</main>

<nav className="fixed bottom-4 left-4 right-4 z-50"><div className="max-w-lg mx-auto flex backdrop-blur-2xl bg-black/60 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden">
{[{t:'matchs',i:'📅'},{t:'historique',i:'📜'},{t:'strats',i:'🎯'},{t:'rec',i:'🎬'},{t:'roster',i:'👥'},{t:'admin',i:'⚙️'}].map(({t,i})=>(
<button key={t} onClick={()=>setActiveTab(t)} className={`flex-1 py-4 text-center transition-all ${activeTab===t?'text-[#D4AF37] scale-110':'text-gray-700'}`}><span className="text-lg">{i}</span></button>
))}
</div></nav>

{!user&&(<div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[200] p-4"><div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-7 w-full max-w-sm border border-white/10 shadow-[0_16px_64px_rgba(0,0,0,0.5)]"><img src={LG} className="w-20 h-20 mx-auto mb-6"/><h3 className="text-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-6 text-center">{isSignUp?'Créer un Compte':'Connexion'}</h3>{isSignUp&&<input type="text" placeholder="Pseudo" value={pseudo} onChange={e=>setPseudo(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-3 text-white focus:outline-none focus:border-[#D4AF37]"/>}<input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-3 text-white focus:outline-none focus:border-[#D4AF37]"/><input type="password" placeholder="Mot de passe" value={authPassword} onChange={e=>setAuthPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-6 text-white focus:outline-none focus:border-[#D4AF37]"/>{isSignUp?<button onClick={handleSignUp} className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black">C'EST PARTI !</button>:<button onClick={handleSignIn} className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black">SE CONNECTER</button>}<button onClick={()=>setIsSignUp(!isSignUp)} className="w-full mt-4 text-[#D4AF37] text-xs font-bold">{isSignUp?'Déjà inscrit ? Connecte-toi':'Nouveau ? Crée un compte'}</button></div></div>)}
</div>)}

export default App