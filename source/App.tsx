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

const G='linear-gradient(135deg,#D4AF37,#FFD700,#D4AF37)'
const G2='linear-gradient(135deg,#D4AF37 0%,#FFD700 50%,#B8860B 100%)'
const cardBg='rgba(12,10,4,0.88)'
const cardBorder='1px solid rgba(212,175,55,0.1)'
const cardShadow='0 8px 32px rgba(0,0,0,0.7), inset 0 1px 0 rgba(212,175,55,0.07), inset 0 -1px 0 rgba(0,0,0,0.3)'
const cardStyle={background:cardBg,border:cardBorder,boxShadow:cardShadow,backdropFilter:'blur(24px)'}
const inputStyle='w-full rounded-2xl px-4 py-3.5 text-sm font-medium focus:outline-none transition-all'
const inputCls='text-white placeholder-white/20'

const GoldBtn=({onClick,children,className='',danger=false,small=false}:{onClick:()=>void,children:any,className?:string,danger?:boolean,small?:boolean})=>(
  <button onClick={onClick} className={`${small?'py-2.5 text-xs':'py-4 text-sm'} w-full rounded-2xl font-black tracking-wide transition-all active:scale-[0.97] select-none ${className}`}
    style={danger
      ?{background:'rgba(239,68,68,0.08)',color:'#f87171',border:'1px solid rgba(239,68,68,0.18)'}
      :{background:G2,color:'#000',boxShadow:'0 4px 24px rgba(212,175,55,0.28),0 1px 0 rgba(255,255,255,0.1) inset'}}>
    {children}
  </button>
)

const Modal=({onClose,children,title,subtitle}:{onClose:()=>void,children:any,title?:string,subtitle?:string})=>(
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{background:'rgba(0,0,0,0.92)',backdropFilter:'blur(28px)'}} onClick={onClose}>
    <div className="w-full sm:max-w-sm rounded-t-[2.5rem] sm:rounded-3xl pb-safe max-h-[94vh] overflow-y-auto" style={{background:'linear-gradient(170deg,#111008,#080600,#050400)',border:'1px solid rgba(212,175,55,0.13)',boxShadow:'0 -32px 100px rgba(0,0,0,0.95), 0 0 0 1px rgba(212,175,55,0.05)'}} onClick={e=>e.stopPropagation()}>
      <div className="sticky top-0 pt-4 pb-3 px-6" style={{background:'linear-gradient(170deg,#111008,#0a0800)',borderBottom:'1px solid rgba(212,175,55,0.08)'}}>
        <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{background:'rgba(212,175,55,0.25)'}}/>
        {title&&<h3 className="text-lg font-black" style={{background:G,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{title}</h3>}
        {subtitle&&<p className="text-xs mt-0.5" style={{color:'rgba(255,255,255,0.3)'}}>{subtitle}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
)

const Badge=({type}:{type:string})=>{
  const map:Record<string,{bg:string,color:string,glow:string}>={
    Ligue:{bg:'rgba(59,130,246,0.12)',color:'#60a5fa',glow:'rgba(59,130,246,0.15)'},
    Scrim:{bg:'rgba(34,197,94,0.12)',color:'#4ade80',glow:'rgba(34,197,94,0.15)'},
    Tournoi:{bg:'rgba(168,85,247,0.12)',color:'#c084fc',glow:'rgba(168,85,247,0.15)'},
    Division:{bg:'rgba(245,158,11,0.12)',color:'#fbbf24',glow:'rgba(245,158,11,0.15)'},
  }
  const s=map[type]||{bg:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.35)',glow:'transparent'}
  return <span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest" style={{background:s.bg,color:s.color,border:`1px solid ${s.color}25`,boxShadow:`0 0 12px ${s.glow}`}}>{type}</span>
}

const SectionTitle=({icon,title}:{icon:string,title:string})=>(
  <div className="relative rounded-3xl p-7 mb-6 overflow-hidden text-center" style={{background:'linear-gradient(145deg,rgba(212,175,55,0.07),rgba(212,175,55,0.02),transparent)',border:'1px solid rgba(212,175,55,0.1)',boxShadow:'0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.08)'}}>
    <div className="absolute inset-0 opacity-30" style={{background:'radial-gradient(ellipse at 50% 0%,rgba(212,175,55,0.15),transparent 60%)'}}/>
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px" style={{background:'linear-gradient(90deg,transparent,#D4AF37,transparent)'}}/>
    <div className="relative inline-block mb-3">
      <div className="absolute inset-0 rounded-full blur-xl" style={{background:'rgba(212,175,55,0.2)',transform:'scale(2)'}}/>
      <img src={LG} alt="D" className="w-12 h-12 relative drop-shadow-[0_0_12px_rgba(212,175,55,0.4)]"/>
    </div>
    <h2 className="text-base font-black uppercase tracking-widest relative" style={{background:'linear-gradient(135deg,#D4AF37,#FFD700,#D4AF37)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{icon} {title}</h2>
  </div>
)

const StatCard=({value,label,color='#D4AF37',icon}:{value:any,label:string,color?:string,icon?:string})=>(
  <div className="rounded-2xl p-5 text-center relative overflow-hidden" style={{background:`linear-gradient(145deg,rgba(12,10,4,0.95),rgba(8,6,0,0.98))`,border:`1px solid ${color}18`,boxShadow:`0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px ${color}08`}}>
    <div className="absolute inset-0 opacity-20" style={{background:`radial-gradient(ellipse at 50% 0%,${color}22,transparent 70%)`}}/>
    {icon&&<p className="text-2xl mb-1 relative">{icon}</p>}
    <p className="text-4xl font-black relative" style={{color,textShadow:`0 0 20px ${color}40`}}>{value}</p>
    <p className="text-[9px] uppercase tracking-widest mt-1.5 relative font-bold" style={{color:'rgba(255,255,255,0.25)'}}>{label}</p>
  </div>
)

const Divider=()=><div className="my-5 h-px" style={{background:'linear-gradient(90deg,transparent,rgba(212,175,55,0.1),transparent)'}}/>

const Tag=({children,color='gold'}:{children:any,color?:'gold'|'green'|'red'|'blue'|'gray'})=>{
  const c={gold:{bg:'rgba(212,175,55,0.1)',text:'#D4AF37',border:'rgba(212,175,55,0.2)'},green:{bg:'rgba(74,222,128,0.1)',text:'#4ade80',border:'rgba(74,222,128,0.2)'},red:{bg:'rgba(248,113,113,0.1)',text:'#f87171',border:'rgba(248,113,113,0.2)'},blue:{bg:'rgba(96,165,250,0.1)',text:'#60a5fa',border:'rgba(96,165,250,0.2)'},gray:{bg:'rgba(255,255,255,0.05)',text:'rgba(255,255,255,0.4)',border:'rgba(255,255,255,0.08)'}}[color]
  return <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold" style={{background:c.bg,color:c.text,border:`1px solid ${c.border}`}}>{children}</span>
}

const navItems=[
  {t:'matchs',i:'📅',l:'Matchs'},
  {t:'historique',i:'🏆',l:'Résultats'},
  {t:'strats',i:'🎯',l:'Strats'},
  {t:'compos',i:'📋',l:'Compos'},
  {t:'fiches',i:'🔍',l:'Fiches'},
  {t:'notes',i:'📊',l:'Notes'},
  {t:'rec',i:'🎬',l:'Replays'},
  {t:'roster',i:'👥',l:'Roster'},
  {t:'stats',i:'📈',l:'Stats'},
  {t:'admin',i:'⚙️',l:'Admin'},
]

function App(){
const[activeTab,setActiveTab]=useState('matchs'),[isAdmin,setIsAdmin]=useState(false),[adminPassword,setAdminPassword]=useState(''),[showSplash,setShowSplash]=useState(true),[loading,setLoading]=useState(true),[user,setUser]=useState<any>(null),[pseudo,setPseudo]=useState(''),[email,setEmail]=useState(''),[authPassword,setAuthPassword]=useState(''),[isSignUp,setIsSignUp]=useState(false)
const[matchs,setMatchs]=useState<any[]>([]),[replays,setReplays]=useState<any[]>([]),[joueurs,setJoueurs]=useState<any[]>([]),[notes,setNotes]=useState<any[]>([]),[strats,setStrats]=useState<any[]>([]),[commentaires,setCommentaires]=useState<any[]>([]),[compos,setCompos]=useState<any[]>([]),[analyses,setAnalyses]=useState<any[]>([]),[fichesAdversaires,setFichesAdversaires]=useState<any[]>([])
const[nouveauMatch,setNouveauMatch]=useState({adversaire:'',date:'',horaire1:'',horaire2:'',arene:'Arène 1',type:'Ligue',sousMatchs:[] as {adversaire:string,scoreDyno:string,scoreAdv:string}[]})
const[scoreEdit,setScoreEdit]=useState<any>(null),[nouveauReplay,setNouveauReplay]=useState({titre:'',lien:''}),[nouvelleNote,setNouvelleNote]=useState({matchId:'',mental:'',communication:'',gameplay:''}),[selectedMatchForNotes,setSelectedMatchForNotes]=useState<any>(null),[nouvelleStrat,setNouvelleStrat]=useState({adversaire:'',picks:[] as string[],bans:[] as string[]}),[showAddStrat,setShowAddStrat]=useState(false)
const[deferredPrompt,setDeferredPrompt]=useState<any>(null),[showInstall,setShowInstall]=useState(false),[countdowns,setCountdowns]=useState<Record<string,string>>({}),[nouveauCommentaire,setNouveauCommentaire]=useState(''),[selectedMatchForComment,setSelectedMatchForComment]=useState<any>(null),[notificationsEnabled,setNotificationsEnabled]=useState(false),[notifiedMatchs,setNotifiedMatchs]=useState<string[]>([])
const[selectedMapCompo,setSelectedMapCompo]=useState(''),[compoJoueurs,setCompoJoueurs]=useState<string[]>([]),[showAddCompo,setShowAddCompo]=useState(false),[anniversaire,setAnniversaire]=useState(''),[viewMode,setViewMode]=useState<'list'|'grid'>('list'),[pullDistance,setPullDistance]=useState(0),[isRefreshing,setIsRefreshing]=useState(false)
const[showBilan,setShowBilan]=useState(false),[selectedMatchForAnalyse,setSelectedMatchForAnalyse]=useState<any>(null),[nouvelleAnalyse,setNouvelleAnalyse]=useState({bien:'',mal:'',plan:''}),[showAddFiche,setShowAddFiche]=useState(false),[nouvelleFiche,setNouvelleFiche]=useState({adversaire:'',forces:'',faiblesses:'',notes:''})
const[newSubAdv,setNewSubAdv]=useState(''),[newSubScoreDyno,setNewSubScoreDyno]=useState(''),[newSubScoreAdv,setNewSubScoreAdv]=useState('')
const[noteEdit,setNoteEdit]=useState<any>(null)
const pm=useRef(0),pn=useRef(0),pc=useRef(0),ps=useRef(0),ty=useRef(0)

useEffect(()=>{if(window.location.search.includes('reset=1')){localStorage.clear();window.location.href=window.location.pathname}},[])
const sendNotification=useCallback((t:string,b:string,tg?:string)=>{try{if(!('Notification' in window)||Notification.permission!=='granted')return;const n=new Notification(t,{body:b,icon:LG,badge:LG,tag:tg||'d',requireInteraction:false});n.onclick=()=>{window.focus();n.close()}}catch{}},[])
const requestNotificationPermission=async()=>{try{if(!('Notification' in window)){alert('❌');return};const p=await Notification.requestPermission();if(p==='granted'){setNotificationsEnabled(true);localStorage.setItem('dyno-notifs','true');alert('✅ Notifs activées !')}else{setNotificationsEnabled(false);localStorage.setItem('dyno-notifs','false');alert('❌')}}catch{alert('❌')}}
const getMatchDateTime=useCallback((m:any):Date|null=>{if(!m?.date)return null;let d=m.date;const t=m.horaires?.[0]||m.horaire1||'20:00';if(d.includes('/')){const[dd,mm,yy]=d.split('/');d=`${yy}-${mm}-${dd}`};try{const dt=new Date(`${d}T${t}:00`);return isNaN(dt.getTime())?null:dt}catch{return null}},[])

useEffect(()=>{try{if('Notification' in window&&Notification.permission==='granted'&&localStorage.getItem('dyno-notifs')==='true')setNotificationsEnabled(true)}catch{};try{setNotifiedMatchs(JSON.parse(localStorage.getItem('dyno-notified')||'[]'))}catch{setNotifiedMatchs([])}},[])
useEffect(()=>{if(!notificationsEnabled)return;try{if(!('Notification' in window)||Notification.permission!=='granted')return}catch{return};const ck=()=>{const now=new Date();matchs.forEach((m:any)=>{if(m.termine)return;const mt=getMatchDateTime(m);if(!mt)return;const dm=(mt.getTime()-now.getTime())/60000;const k1=`${m.id}-1h`;if(dm>55&&dm<=65&&!notifiedMatchs.includes(k1)){sendNotification('🎮 1h !',`DYNO vs ${m.adversaire}`,'m1h');const u=[...notifiedMatchs,k1];setNotifiedMatchs(u);localStorage.setItem('dyno-notified',JSON.stringify(u))};const k2=`${m.id}-15m`;if(dm>10&&dm<=20&&!notifiedMatchs.includes(k2)){sendNotification('🔥 15min !',`DYNO vs ${m.adversaire}`,'m15');const u=[...notifiedMatchs,k2];setNotifiedMatchs(u);localStorage.setItem('dyno-notified',JSON.stringify(u))};const k3=`${m.id}-now`;if(dm>=-2&&dm<=3&&!notifiedMatchs.includes(k3)){sendNotification('⚡ GO !',`DYNO vs ${m.adversaire}`,'mnow');const u=[...notifiedMatchs,k3];setNotifiedMatchs(u);localStorage.setItem('dyno-notified',JSON.stringify(u))}})};ck();const i=setInterval(ck,60000);return()=>clearInterval(i)},[notificationsEnabled,matchs,notifiedMatchs,sendNotification,getMatchDateTime])
useEffect(()=>{const u=()=>{const now=new Date(),c:Record<string,string>={};matchs.forEach((m:any)=>{if(m.termine)return;const mt=getMatchDateTime(m);if(!mt)return;const df=mt.getTime()-now.getTime();if(df<=0){c[m.id]='EN COURS';return};const j=Math.floor(df/86400000),h=Math.floor((df%86400000)/3600000),mi=Math.floor((df%3600000)/60000),s=Math.floor((df%60000)/1000);c[m.id]=`${j>0?j+'j ':''} ${(h>0||j>0)?h+'h ':''} ${mi}m ${s}s`});setCountdowns(c)};u();const i=setInterval(u,1000);return()=>clearInterval(i)},[matchs,getMatchDateTime])
useEffect(()=>{if(localStorage.getItem('dyno-admin')==='true')setIsAdmin(true)},[])
useEffect(()=>{const unsub=onAuthStateChanged(auth,async(u:any)=>{setUser(u);if(u){const d=await getDoc(doc(db,'users',u.uid));if(d.exists()){const data=d.data();setPseudo(data.pseudo||'');if(data.anniversaire)setAnniversaire(data.anniversaire);if(u.email===AE||data.isAdmin){setIsAdmin(true);localStorage.setItem('dyno-admin','true')}}};setLoading(false)});return()=>unsub()},[])

useEffect(()=>{const q=query(collection(db,'matchs'),orderBy('createdAt','desc'));const u=onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setMatchs(d)});return()=>u()},[])
useEffect(()=>{const q=query(collection(db,'notes'),orderBy('createdAt','desc'));const u=onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setNotes(d)});return()=>u()},[])
useEffect(()=>{const q=query(collection(db,'commentaires'),orderBy('createdAt','desc'));const u=onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setCommentaires(d)});return()=>u()},[])
useEffect(()=>{const q=query(collection(db,'strats'),orderBy('createdAt','desc'));const u=onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setStrats(d)});return()=>u()},[])
useEffect(()=>{const q=query(collection(db,'replays'),orderBy('createdAt','desc'));const u=onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setReplays(d)});return()=>u()},[])
useEffect(()=>{const q=query(collection(db,'players'),orderBy('createdAt','desc'));const u=onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setJoueurs(d)});return()=>u()},[])
useEffect(()=>{const q=query(collection(db,'compos'),orderBy('createdAt','desc'));const u=onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setCompos(d)});return()=>u()},[])
useEffect(()=>{const q=query(collection(db,'analyses'),orderBy('createdAt','desc'));const u=onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setAnalyses(d)});return()=>u()},[])
useEffect(()=>{const q=query(collection(db,'fichesAdversaires'),orderBy('createdAt','desc'));const u=onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setFichesAdversaires(d)});return()=>u()},[])

useEffect(()=>{if(!notificationsEnabled||pm.current===0){pm.current=matchs.length;return};if(matchs.length>pm.current){const n=matchs[0];if(n)sendNotification('📅 Match !',`DYNO vs ${n.adversaire}`,'nm')};pm.current=matchs.length},[matchs,notificationsEnabled,sendNotification])
useEffect(()=>{if(!notificationsEnabled||pn.current===0){pn.current=notes.length;return};if(notes.length>pn.current){const n=notes[0];if(n)sendNotification('📊 Note !',`${n.joueur}`,'nn')};pn.current=notes.length},[notes,notificationsEnabled,sendNotification])
useEffect(()=>{if(!notificationsEnabled||pc.current===0){pc.current=commentaires.length;return};if(commentaires.length>pc.current){const n=commentaires[0];if(n)sendNotification('💬 !',`${n.joueur}: ${n.texte.substring(0,50)}`,'nc')};pc.current=commentaires.length},[commentaires,notificationsEnabled,sendNotification])
useEffect(()=>{if(!notificationsEnabled||ps.current===0){ps.current=strats.length;return};if(strats.length>ps.current){const n=strats[0];if(n)sendNotification('🎯 Strat !',`DYNO vs ${n.adversaire}`,'ns')};ps.current=strats.length},[strats,notificationsEnabled,sendNotification])
useEffect(()=>{if(!notificationsEnabled)return;const ck=()=>{const now=new Date();if(now.getDay()===1&&now.getHours()===9){const lw=localStorage.getItem('dyno-weekly');const tw=`${now.getFullYear()}-W${Math.ceil(now.getDate()/7)}`;if(lw!==tw){const wm=matchs.filter((m:any)=>m.termine&&(Date.now()-m.createdAt)<604800000);const ww=wm.filter((m:any)=>(m.scoreDyno||0)>(m.scoreAdversaire||0)).length;const wl=wm.filter((m:any)=>(m.scoreDyno||0)<(m.scoreAdversaire||0)).length;sendNotification('📧 Semaine',`${wm.length} matchs ${ww}W-${wl}L`,'wk');localStorage.setItem('dyno-weekly',tw)}}};ck();const i=setInterval(ck,3600000);return()=>clearInterval(i)},[notificationsEnabled,matchs,sendNotification])
useEffect(()=>{const t=setTimeout(()=>setShowSplash(false),2800);return()=>clearTimeout(t)},[])
useEffect(()=>{window.addEventListener('beforeinstallprompt',(e:any)=>{e.preventDefault();setDeferredPrompt(e);setShowInstall(true)})},[])

const handleInstall=()=>{if(deferredPrompt){deferredPrompt.prompt();setDeferredPrompt(null);setShowInstall(false)}}
const handleSignUp=async()=>{if(!email||!authPassword||!pseudo){alert('⚠️ Remplis tout !');return};try{const r=await createUserWithEmailAndPassword(auth,email,authPassword);await setDoc(doc(db,'users',r.user.uid),{pseudo,email,createdAt:Date.now(),isAdmin:email===AE});await addDoc(collection(db,'players'),{pseudo,role:'Joueur',rang:'Nouveau',userId:r.user.uid,createdAt:Date.now()});alert('✅!');setIsSignUp(false);setEmail('');setAuthPassword('')}catch(e:any){alert('❌ '+e.message)}}
const handleSignIn=async()=>{if(!email||!authPassword){alert('⚠️!');return};try{await setPersistence(auth,browserLocalPersistence);await signInWithEmailAndPassword(auth,email,authPassword);localStorage.setItem('user-email',email);alert('✅!');setEmail('');setAuthPassword('')}catch(e:any){alert('❌ '+e.message)}}
const handleSignOut=async()=>{await signOut(auth);setPseudo('');setIsAdmin(false);localStorage.removeItem('dyno-admin');localStorage.removeItem('user-email')}
const handleAdminLogin=()=>{if(adminPassword==='dyno2026'){setIsAdmin(true);localStorage.setItem('dyno-admin','true');setAdminPassword('')}else alert('❌!')}
const handleAdminLogout=()=>{setIsAdmin(false);localStorage.removeItem('dyno-admin')}

const ajouterSousMatch=()=>{if(!newSubAdv.trim()||newSubScoreDyno===''||newSubScoreAdv===''){alert('⚠️ Remplis tous les champs !');return};setNouveauMatch({...nouveauMatch,sousMatchs:[...nouveauMatch.sousMatchs,{adversaire:newSubAdv.trim(),scoreDyno:newSubScoreDyno,scoreAdv:newSubScoreAdv}]});setNewSubAdv('');setNewSubScoreDyno('');setNewSubScoreAdv('')}
const supprimerSousMatch=(i:number)=>{const sm=[...nouveauMatch.sousMatchs];sm.splice(i,1);setNouveauMatch({...nouveauMatch,sousMatchs:sm})}
const ajouterSousMatchEdit=()=>{if(!scoreEdit)return;const adv=scoreEdit._newSubAdv||'',sd=scoreEdit._newSubScoreDyno||'',sa=scoreEdit._newSubScoreAdv||'';if(!adv.trim()||sd===''||sa===''){alert('⚠️ Remplis tous les champs !');return};const sousMatchs=[...(scoreEdit.sousMatchs||[]),{adversaire:adv.trim(),scoreDyno:sd,scoreAdv:sa}];setScoreEdit({...scoreEdit,sousMatchs,_newSubAdv:'',_newSubScoreDyno:'',_newSubScoreAdv:''})}
const supprimerSousMatchEdit=(i:number)=>{if(!scoreEdit)return;const sm=[...(scoreEdit.sousMatchs||[])];sm.splice(i,1);setScoreEdit({...scoreEdit,sousMatchs:sm})}
const ajouterMatch=async()=>{if(!nouveauMatch.adversaire||!nouveauMatch.date||!nouveauMatch.horaire1){alert('⚠️!');return};const md:any={...nouveauMatch,termine:false,disponibles:[],indisponibles:[],createdAt:Date.now()};if(nouveauMatch.type==='Division'&&nouveauMatch.sousMatchs.length>0){md.termine=true;md.sousMatchs=nouveauMatch.sousMatchs;md.scoreDyno=nouveauMatch.sousMatchs.reduce((a:number,s:any)=>a+parseInt(s.scoreDyno||0),0);md.scoreAdversaire=nouveauMatch.sousMatchs.reduce((a:number,s:any)=>a+parseInt(s.scoreAdv||0),0)};await addDoc(collection(db,'matchs'),md);const h=[nouveauMatch.horaire1];if(nouveauMatch.horaire2)h.push(nouveauMatch.horaire2);try{await fetch(DW,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({embeds:[{title:'🎮 DYNO vs '+nouveauMatch.adversaire,color:13934871,fields:[{name:'⚔️',value:nouveauMatch.adversaire,inline:true},{name:'📅',value:nouveauMatch.date,inline:true},{name:'⏰',value:h.join(' / '),inline:true},{name:'🏟️',value:nouveauMatch.arene,inline:true},{name:'📊',value:nouveauMatch.type,inline:true}],footer:{text:'DYNO',icon_url:LG}}]})})}catch{};setNouveauMatch({adversaire:'',date:'',horaire1:'',horaire2:'',arene:'Arène 1',type:'Ligue',sousMatchs:[]});setNewSubAdv('');setNewSubScoreDyno('');setNewSubScoreAdv('');alert('✅!')}
const ajouterReplay=async()=>{if(!nouveauReplay.titre||!nouveauReplay.lien){alert('⚠️!');return};await addDoc(collection(db,'replays'),{...nouveauReplay,createdAt:Date.now()});setNouveauReplay({titre:'',lien:''});alert('✅!')}
const ajouterNote=async()=>{if(!user)return;await addDoc(collection(db,'notes'),{matchId:selectedMatchForNotes?.id,joueur:pseudo,joueurId:user.uid,...nouvelleNote,createdAt:Date.now()});setNouvelleNote({matchId:'',mental:'',communication:'',gameplay:''});setSelectedMatchForNotes(null);alert('✅!')}
const ajouterCommentaire=async(id:string)=>{if(!user||!nouveauCommentaire.trim())return;await addDoc(collection(db,'commentaires'),{matchId:id,joueur:pseudo,joueurId:user.uid,texte:nouveauCommentaire.trim(),createdAt:Date.now()});setNouveauCommentaire('');setSelectedMatchForComment(null);alert('✅!')}
const ajouterStrat=async()=>{if(!nouvelleStrat.adversaire||nouvelleStrat.picks.length===0||nouvelleStrat.bans.length===0){alert('⚠️!');return};await addDoc(collection(db,'strats'),{adversaire:nouvelleStrat.adversaire,picks:nouvelleStrat.picks,bans:nouvelleStrat.bans,auteur:pseudo,auteurId:user?.uid,createdAt:Date.now()});setNouvelleStrat({adversaire:'',picks:[],bans:[]});setShowAddStrat(false);alert('✅!')}
const ajouterCompo=async()=>{if(!selectedMapCompo||compoJoueurs.length===0){alert('⚠️!');return};const ex=compos.find((c:any)=>c.map===selectedMapCompo);if(ex){await updateDoc(doc(db,'compos',ex.id),{joueurs:compoJoueurs,updatedAt:Date.now()})}else{await addDoc(collection(db,'compos'),{map:selectedMapCompo,joueurs:compoJoueurs,auteur:pseudo,createdAt:Date.now()})};setShowAddCompo(false);setSelectedMapCompo('');setCompoJoueurs([]);alert('✅!')}
const toggleCompoJoueur=(n:string)=>{if(compoJoueurs.includes(n))setCompoJoueurs(compoJoueurs.filter(j=>j!==n));else setCompoJoueurs([...compoJoueurs,n])}
const sauvegarderAnniversaire=async()=>{if(!user||!anniversaire)return;await updateDoc(doc(db,'users',user.uid),{anniversaire});alert('✅!')}
const ajouterAnalyse=async(mid:string)=>{if(!user)return;await addDoc(collection(db,'analyses'),{matchId:mid,joueur:pseudo,joueurId:user.uid,...nouvelleAnalyse,createdAt:Date.now()});setNouvelleAnalyse({bien:'',mal:'',plan:''});setSelectedMatchForAnalyse(null);alert('✅!')}
const ajouterFiche=async()=>{if(!nouvelleFiche.adversaire.trim())return;await addDoc(collection(db,'fichesAdversaires'),{...nouvelleFiche,auteur:pseudo,auteurId:user?.uid,createdAt:Date.now()});setNouvelleFiche({adversaire:'',forces:'',faiblesses:'',notes:''});setShowAddFiche(false);alert('✅!')}
const del=async(col:string,id:string)=>{await deleteDoc(doc(db,col,id))}
const updateScore=async()=>{if(!scoreEdit)return;const isDivision=scoreEdit.type==='Division';if(isDivision){const sm=scoreEdit.sousMatchs||[];const totalDyno=sm.reduce((a:number,s:any)=>a+parseInt(s.scoreDyno||0),0);const totalAdv=sm.reduce((a:number,s:any)=>a+parseInt(s.scoreAdv||0),0);await updateDoc(doc(db,'matchs',scoreEdit.id),{sousMatchs:sm,scoreDyno:sm.length>0?totalDyno:parseInt(scoreEdit.scoreDyno||0),scoreAdversaire:sm.length>0?totalAdv:parseInt(scoreEdit.scoreAdv||0),termine:true})}else{await updateDoc(doc(db,'matchs',scoreEdit.id),{scoreDyno:parseInt(scoreEdit.scoreDyno),scoreAdversaire:parseInt(scoreEdit.scoreAdv),termine:true})};setScoreEdit(null);alert('✅!')}
const updateNote=async()=>{if(!noteEdit)return;const mental=Math.min(10,Math.max(0,parseInt(noteEdit.mental)||0));const communication=Math.min(10,Math.max(0,parseInt(noteEdit.communication)||0));const gameplay=Math.min(10,Math.max(0,parseInt(noteEdit.gameplay)||0));await updateDoc(doc(db,'notes',noteEdit.id),{mental:String(mental),communication:String(communication),gameplay:String(gameplay),updatedAt:Date.now()});setNoteEdit(null);alert('✅ Note mise à jour !')}
const toggleDispo=async(mid:string)=>{if(!user)return;const m=matchs.find((x:any)=>x.id===mid);if(!m)return;const d=m.disponibles||[],i=m.indisponibles||[];await updateDoc(doc(db,'matchs',mid),{disponibles:d.includes(pseudo)?d.filter((p:string)=>p!==pseudo):[...d,pseudo],indisponibles:i.filter((p:string)=>p!==pseudo)})}
const toggleIndispo=async(mid:string)=>{if(!user)return;const m=matchs.find((x:any)=>x.id===mid);if(!m)return;const d=m.disponibles||[],i=m.indisponibles||[];await updateDoc(doc(db,'matchs',mid),{indisponibles:i.includes(pseudo)?i.filter((p:string)=>p!==pseudo):[...i,pseudo],disponibles:d.filter((p:string)=>p!==pseudo)})}
const fdf=(s:string)=>{if(!s)return'';if(s.includes('/'))return s;const[y,m,d]=s.split('-');return`${d}/${m}/${y}`}
const fts=(t:number)=>{const d=new Date(t);return`${d.toLocaleDateString('fr-FR')} ${d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}`}
const atc=(m:any)=>{try{if(!m?.date)return;let y:string,mo:string,d:string;if(m.date.includes('/')){const[dd,mm,yy]=m.date.split('/');d=dd;mo=mm;y=yy}else{const[yy,mm,dd]=m.date.split('-');y=yy;mo=mm;d=dd};const md=`${y}${mo}${d}`;let h='20',mi='00';if(m.horaires?.length>0){const[hh,mm]=m.horaires[0].split(':');h=hh;mi=mm||'00'}else if(m.horaire1){const[hh,mm]=m.horaire1.split(':');h=hh;mi=mm||'00'};const st=`${h}${mi}00`,et=`${(parseInt(h)+2).toString().padStart(2,'0')}${mi}00`;if(/iPad|iPhone|iPod/.test(navigator.userAgent)){const ics=`BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:${m.id}@d\nDTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').split('.')[0]}Z\nDTSTART:${md}T${st}\nDTEND:${md}T${et}\nSUMMARY:DYNO vs ${m.adversaire}\nLOCATION:${m.arene}\nEND:VEVENT\nEND:VCALENDAR`;const b=new Blob([ics],{type:'text/calendar'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=`D_${m.adversaire}.ics`;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(u)}else{window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`DYNO vs ${m.adversaire}`)}&dates=${md}T${st}/${md}T${et}&location=${encodeURIComponent(m.arene)}`,'_blank')}}catch(e:any){alert('❌ '+e.message)}}
const hts=(e:React.TouchEvent)=>{ty.current=e.touches[0].clientY}
const htm=(e:React.TouchEvent)=>{if(window.scrollY>0)return;const d=e.touches[0].clientY-ty.current;if(d>0)setPullDistance(Math.min(d*0.4,80))}
const hte=()=>{if(pullDistance>60){setIsRefreshing(true);setTimeout(()=>window.location.reload(),500)};setPullDistance(0)}
const toggleMap=(map:string,type:'picks'|'bans')=>{if(type==='picks'){if(nouvelleStrat.picks.includes(map))setNouvelleStrat({...nouvelleStrat,picks:nouvelleStrat.picks.filter(m=>m!==map)});else if(nouvelleStrat.picks.length<4)setNouvelleStrat({...nouvelleStrat,picks:[...nouvelleStrat.picks,map]})}else{if(nouvelleStrat.bans.includes(map))setNouvelleStrat({...nouvelleStrat,bans:nouvelleStrat.bans.filter(m=>m!==map)});else if(nouvelleStrat.bans.length<4)setNouvelleStrat({...nouvelleStrat,bans:[...nouvelleStrat.bans,map]})}}
const genBilan=()=>{const now=new Date();const mm=historique.filter((m:any)=>{const d=new Date(m.createdAt);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear()});const w=mm.filter((m:any)=>(m.scoreDyno||0)>(m.scoreAdversaire||0)).length,l=mm.filter((m:any)=>(m.scoreDyno||0)<(m.scoreAdversaire||0)).length;const mn=notes.filter((n:any)=>{const d=new Date(n.createdAt);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear()});const am=mn.length>0?Math.round(mn.reduce((a:number,n:any)=>a+parseInt(n.mental||0),0)/mn.length):0,ac=mn.length>0?Math.round(mn.reduce((a:number,n:any)=>a+parseInt(n.communication||0),0)/mn.length):0,ap=mn.length>0?Math.round(mn.reduce((a:number,n:any)=>a+parseInt(n.gameplay||0),0)/mn.length):0;return{nom:['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'][now.getMonth()],m:mm.length,w,l,wr:mm.length>0?Math.round((w/(w+l||1))*100):0,am,ac,ap}}

const victoires=matchs.filter((m:any)=>m.termine&&(m.scoreDyno||0)>(m.scoreAdversaire||0)).length
const defaites=matchs.filter((m:any)=>m.termine&&(m.scoreDyno||0)<(m.scoreAdversaire||0)).length
const totalMatchs=victoires+defaites,winRate=totalMatchs>0?Math.round((victoires/totalMatchs)*100):0
const prochainsMatchs=matchs.filter((m:any)=>!m.termine).sort((a:any,b:any)=>new Date(`${a.date}T${a.horaires?.[0]||a.horaire1||'20:00'}`).getTime()-new Date(`${b.date}T${b.horaires?.[0]||b.horaire1||'20:00'}`).getTime())
const historique=matchs.filter((m:any)=>m.termine)
const ytId=(url:string)=>{const m=url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);return m?m[1]:null}

if(showSplash)return(
  <div className="min-h-screen flex items-center justify-center" style={{background:'radial-gradient(ellipse at center, #1a1200 0%, #060400 55%, #000 100%)'}}>
    <style>{`
      @keyframes pulse-glow{0%,100%{opacity:0.4;transform:scale(1)}50%{opacity:1;transform:scale(1.1)}}
      @keyframes fade-up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      @keyframes shimmer{0%{background-position:-300% center}100%{background-position:300% center}}
      .sp-logo{animation:fade-up 0.6s ease both}
      .sp-title{animation:fade-up 0.6s ease 0.25s both}
      .sp-sub{animation:fade-up 0.6s ease 0.45s both}
      .sp-dots{animation:fade-up 0.6s ease 0.65s both}
      .shimmer-text{background:linear-gradient(90deg,#B8860B,#D4AF37,#FFD700,#D4AF37,#B8860B);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 4s linear infinite, fade-up 0.6s ease 0.25s both}
    `}</style>
    <div className="text-center px-8">
      <div className="relative inline-block mb-8 sp-logo">
        <div className="absolute inset-0 rounded-full" style={{background:'rgba(212,175,55,0.08)',transform:'scale(2.5)',animation:'pulse-glow 2.5s ease-in-out infinite'}}/>
        <div className="absolute inset-0 rounded-full" style={{background:'rgba(212,175,55,0.04)',transform:'scale(3.5)',animation:'pulse-glow 2.5s ease-in-out 0.4s infinite'}}/>
        <div className="relative w-32 h-32 rounded-full flex items-center justify-center" style={{background:'radial-gradient(circle,rgba(212,175,55,0.1),transparent)',border:'1px solid rgba(212,175,55,0.2)'}}>
          <img src={LG} alt="DYNO" className="w-24 h-24"/>
        </div>
      </div>
      <h1 className="text-7xl font-black tracking-[0.15em] shimmer-text mb-2">DYNO</h1>
      <p className="text-[11px] tracking-[0.6em] uppercase sp-sub font-bold" style={{color:'rgba(212,175,55,0.35)'}}>Esport Team</p>
      <div className="flex items-center justify-center gap-3 mt-10 sp-dots">
        {[0,1,2].map(i=><div key={i} className="w-1.5 h-1.5 rounded-full" style={{background:'#D4AF37',animation:`pulse-glow 1.4s ease-in-out ${i*0.25}s infinite`}}/>)}
      </div>
    </div>
  </div>
)

return(
<div className="min-h-screen pb-24" style={{background:'radial-gradient(ellipse at top center, #100c00 0%, #050400 45%, #020200 100%)'}}>
<style>{`
  @keyframes slide-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes count-up{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}
  @keyframes glow-pulse{0%,100%{box-shadow:0 0 24px rgba(212,175,55,0.06)}50%{box-shadow:0 0 48px rgba(212,175,55,0.18)}}
  @keyframes shimmer{0%{background-position:-300% center}100%{background-position:300% center}}
  .card-enter{animation:slide-up 0.35s ease both}
  .count-anim{animation:count-up 0.5s ease both}
  .glow-card{animation:glow-pulse 4s ease-in-out infinite}
  .shimmer-gold{background:linear-gradient(90deg,#B8860B,#D4AF37,#FFD700,#D4AF37,#B8860B);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 4s linear infinite}
  input[type=date]::-webkit-calendar-picker-indicator,input[type=time]::-webkit-calendar-picker-indicator{filter:invert(0.7) sepia(1) saturate(5) hue-rotate(5deg)}
  select option{background:#0a0800;color:white}
  ::-webkit-scrollbar{width:2px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(212,175,55,0.25);border-radius:10px}
  .live-pulse{animation:pulse-live 1s ease-in-out infinite}
  @keyframes pulse-live{0%,100%{opacity:1}50%{opacity:0.4}}
`}</style>

<header className="sticky top-0 z-50" style={{background:'rgba(4,3,0,0.95)',backdropFilter:'blur(28px)',borderBottom:'1px solid rgba(212,175,55,0.07)',boxShadow:'0 4px 32px rgba(0,0,0,0.8)'}}>
  <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="absolute inset-0 rounded-xl" style={{background:'rgba(212,175,55,0.15)',filter:'blur(8px)',transform:'scale(1.3)'}}/>
        <img src={LG} alt="D" className="w-9 h-9 relative rounded-xl"/>
      </div>
      <div>
        <h1 className="text-xl font-black leading-none shimmer-gold">DYNO</h1>
        <p className="text-[8px] tracking-[0.3em] uppercase font-bold" style={{color:'rgba(212,175,55,0.35)'}}>Esport</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      {user&&(
        <button onClick={requestNotificationPermission} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90" style={{background:notificationsEnabled?'rgba(212,175,55,0.12)':'rgba(255,255,255,0.04)',border:notificationsEnabled?'1px solid rgba(212,175,55,0.25)':'1px solid rgba(255,255,255,0.06)'}}>
          <span className="text-sm">{notificationsEnabled?'🔔':'🔕'}</span>
        </button>
      )}
      {showInstall&&<button onClick={handleInstall} className="px-3 py-1.5 rounded-xl text-xs font-bold active:scale-95" style={{background:'rgba(59,130,246,0.12)',color:'#60a5fa',border:'1px solid rgba(59,130,246,0.2)'}}>📲</button>}
      {user?(
        <button onClick={handleSignOut} className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all active:scale-95" style={{background:'rgba(212,175,55,0.07)',border:'1px solid rgba(212,175,55,0.13)'}}>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black" style={{background:G2,color:'#000'}}>{pseudo[0]?.toUpperCase()||'?'}</div>
          <span className="text-xs font-bold max-w-[72px] truncate" style={{color:'#D4AF37'}}>{pseudo}</span>
        </button>
      ):(
        <button onClick={()=>setIsSignUp(false)} className="px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95" style={{background:G2,color:'#000',boxShadow:'0 4px 16px rgba(212,175,55,0.2)'}}>
          Connexion
        </button>
      )}
    </div>
  </div>
</header>

<main className="max-w-lg mx-auto px-4 py-5" onTouchStart={hts} onTouchMove={htm} onTouchEnd={hte}>
{pullDistance>0&&(
  <div className="flex justify-center mb-3" style={{height:pullDistance}}>
    <span className={`text-2xl transition-transform ${pullDistance>60?'rotate-180':''}`} style={{color:'#D4AF37'}}>{isRefreshing?'⏳':'↓'}</span>
  </div>
)}

{activeTab==='matchs'&&(
<div className="card-enter">
  <SectionTitle icon="📅" title="Prochains Matchs"/>
  <div className="flex justify-end mb-4">
    <div className="flex rounded-2xl overflow-hidden p-1" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
      {(['list','grid'] as const).map(v=>(
        <button key={v} onClick={()=>setViewMode(v)} className="px-4 py-1.5 rounded-xl text-xs font-bold transition-all" style={viewMode===v?{background:'rgba(212,175,55,0.15)',color:'#D4AF37',boxShadow:'0 2px 8px rgba(212,175,55,0.1)'}:{color:'rgba(255,255,255,0.2)'}}>
          {v==='list'?'☰':'⊞'}
        </button>
      ))}
    </div>
  </div>
  {loading?(
    <div className="space-y-3">
      {[1,2].map(i=><div key={i} className="h-72 rounded-3xl" style={{background:'rgba(255,255,255,0.02)',animation:'pulse 2s ease-in-out infinite'}}/>)}
    </div>
  ):prochainsMatchs.length===0?(
    <div className="rounded-3xl p-14 text-center" style={cardStyle}>
      <p className="text-5xl mb-4">📭</p>
      <p className="text-sm font-bold" style={{color:'rgba(255,255,255,0.25)'}}>Aucun match à venir</p>
    </div>
  ):(
    <div className={viewMode==='grid'?'grid grid-cols-2 gap-3':'space-y-4'}>
      {prochainsMatchs.map((match:any,idx:number)=>(
        <div key={match.id} className="rounded-3xl overflow-hidden glow-card" style={{...cardStyle,animationDelay:`${idx*0.1}s`}}>
          <div className="h-px w-full" style={{background:'linear-gradient(90deg,transparent,rgba(212,175,55,0.2),transparent)'}}/>
          <div className="px-5 pt-4 pb-3 flex items-center justify-between">
            <Badge type={match.type}/>
            <span className="text-xs font-bold" style={{color:'rgba(212,175,55,0.6)'}}>{fdf(match.date)}</span>
          </div>
          {countdowns[match.id]&&(
            <div className="mx-4 mb-3 rounded-2xl px-4 py-3 text-center relative overflow-hidden" style={countdowns[match.id]==='EN COURS'?{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.18)'}:{background:'rgba(212,175,55,0.05)',border:'1px solid rgba(212,175,55,0.1)'}}>
              <p className="text-[8px] uppercase tracking-widest mb-1.5 font-bold" style={{color:'rgba(255,255,255,0.25)'}}>Countdown</p>
              {countdowns[match.id]==='EN COURS'?(
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full live-pulse" style={{background:'#f87171'}}/>
                  <p className="text-base font-black" style={{color:'#f87171'}}>EN COURS</p>
                </div>
              ):(
                <p className="text-xl font-black font-mono tracking-wider" style={{background:'linear-gradient(90deg,#D4AF37,#FFD700)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{countdowns[match.id]}</p>
              )}
            </div>
          )}
          <div className="px-5 pb-4 flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-2xl" style={{background:'rgba(212,175,55,0.15)',filter:'blur(10px)',transform:'scale(1.4)'}}/>
              <img src={LG} alt="D" className="w-12 h-12 relative rounded-2xl"/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{color:'rgba(212,175,55,0.4)'}}>DYNO vs</p>
              <p className="text-base font-black text-white truncate">{match.adversaire}</p>
              <p className="text-[10px] mt-0.5 font-medium" style={{color:'rgba(255,255,255,0.25)'}}>🏟️ {match.arene}</p>
            </div>
          </div>
          <div className="mx-4 mb-3 rounded-xl px-4 py-2.5 flex items-center gap-2.5" style={{background:'rgba(212,175,55,0.04)',border:'1px solid rgba(212,175,55,0.08)'}}>
            <span>⏰</span>
            <span className="text-sm font-black" style={{color:'#D4AF37'}}>{match.horaires?.join(' / ')||match.horaire1||'20:00'}</span>
          </div>
          {(match.disponibles||[]).length>0&&(
            <div className="mx-4 mb-2 rounded-xl px-4 py-3" style={{background:'rgba(212,175,55,0.04)',border:'1px solid rgba(212,175,55,0.07)'}}>
              <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{color:'rgba(212,175,55,0.45)'}}>✅ Dispo ({(match.disponibles||[]).length})</p>
              <div className="flex flex-wrap gap-1.5">
                {(match.disponibles||[]).map((p:string,i:number)=><Tag key={i} color="gold">{p}</Tag>)}
              </div>
            </div>
          )}
          {(match.indisponibles||[]).length>0&&(
            <div className="mx-4 mb-3 rounded-xl px-4 py-3" style={{background:'rgba(239,68,68,0.04)',border:'1px solid rgba(239,68,68,0.07)'}}>
              <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{color:'rgba(239,68,68,0.45)'}}>🚫 Indispo ({(match.indisponibles||[]).length})</p>
              <div className="flex flex-wrap gap-1.5">
                {(match.indisponibles||[]).map((p:string,i:number)=><Tag key={i} color="red">{p}</Tag>)}
              </div>
            </div>
          )}
          <div className="px-4 pb-5 space-y-2.5">
            <button onClick={()=>atc(match)} className="w-full py-3 rounded-2xl text-xs font-bold transition-all active:scale-95" style={{background:'rgba(59,130,246,0.08)',color:'#60a5fa',border:'1px solid rgba(59,130,246,0.13)'}}>📅 Ajouter au calendrier</button>
            <div className="grid grid-cols-2 gap-2.5">
              <button onClick={()=>toggleDispo(match.id)} disabled={!user} className="py-4 rounded-2xl font-black text-sm transition-all active:scale-95"
                style={!user?{background:'rgba(255,255,255,0.02)',color:'rgba(255,255,255,0.15)',cursor:'not-allowed'}:(match.disponibles||[]).includes(pseudo)?{background:G2,color:'#000',boxShadow:'0 4px 20px rgba(212,175,55,0.3)'}:{background:'rgba(212,175,55,0.07)',color:'#D4AF37',border:'1px solid rgba(212,175,55,0.18)'}}>
                {!user?'🔐':(match.disponibles||[]).includes(pseudo)?'✅ Dispo':'📅 Dispo'}
              </button>
              <button onClick={()=>toggleIndispo(match.id)} disabled={!user} className="py-4 rounded-2xl font-black text-sm transition-all active:scale-95"
                style={!user?{background:'rgba(255,255,255,0.02)',color:'rgba(255,255,255,0.15)',cursor:'not-allowed'}:(match.indisponibles||[]).includes(pseudo)?{background:'rgba(239,68,68,0.18)',color:'#f87171',border:'1px solid rgba(239,68,68,0.28)',boxShadow:'0 4px 20px rgba(239,68,68,0.15)'}:{background:'rgba(239,68,68,0.05)',color:'rgba(239,68,68,0.6)',border:'1px solid rgba(239,68,68,0.1)'}}>
                {!user?'🔐':(match.indisponibles||[]).includes(pseudo)?'❌ Indispo':'🚫 Indispo'}
              </button>
            </div>
          </div>
          <div className="h-px w-full" style={{background:'linear-gradient(90deg,transparent,rgba(212,175,55,0.08),transparent)'}}/>
        </div>
      ))}
    </div>
  )}
</div>
)}

{activeTab==='historique'&&(
<div className="card-enter">
  <SectionTitle icon="🏆" title="Résultats"/>
  <div className="grid grid-cols-2 gap-3 mb-6">
    <StatCard value={victoires} label="Victoires" color="#D4AF37" icon="🏆"/>
    <StatCard value={defaites} label="Défaites" color="#f87171" icon="❌"/>
  </div>
  {historique.length===0?(
    <div className="rounded-3xl p-14 text-center" style={cardStyle}>
      <p className="text-5xl mb-4">📜</p>
      <p className="text-sm font-bold" style={{color:'rgba(255,255,255,0.25)'}}>Aucun résultat</p>
    </div>
  ):(
    <div className="space-y-3">
      {historique.map((match:any,idx:number)=>{
        const win=(match.scoreDyno||0)>(match.scoreAdversaire||0)
        return(
        <div key={match.id} className="rounded-3xl overflow-hidden card-enter" style={{...cardStyle,animationDelay:`${idx*0.05}s`}}>
          <div className="h-px w-full" style={{background:win?'linear-gradient(90deg,transparent,rgba(212,175,55,0.3),transparent)':'linear-gradient(90deg,transparent,rgba(239,68,68,0.2),transparent)'}}/>
          <div className="px-5 pt-4 pb-3 flex items-center justify-between">
            <span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest" style={win?{background:'rgba(212,175,55,0.12)',color:'#D4AF37',border:'1px solid rgba(212,175,55,0.18)',boxShadow:'0 0 12px rgba(212,175,55,0.1)'}:{background:'rgba(239,68,68,0.1)',color:'#f87171',border:'1px solid rgba(239,68,68,0.18)'}}>
              {win?'🏆 Victoire':'❌ Défaite'}
            </span>
            <div className="flex items-center gap-2">
              {isAdmin&&(
                <button onClick={()=>setScoreEdit({id:match.id,adversaire:match.adversaire,type:match.type,scoreDyno:String(match.scoreDyno||0),scoreAdv:String(match.scoreAdversaire||0),sousMatchs:match.sousMatchs?[...match.sousMatchs]:[],_newSubAdv:'',_newSubScoreDyno:'',_newSubScoreAdv:''})}
                  className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all active:scale-95" style={{background:'rgba(212,175,55,0.08)',color:'rgba(212,175,55,0.6)',border:'1px solid rgba(212,175,55,0.13)'}}>✏️</button>
              )}
              <span className="text-xs font-medium" style={{color:'rgba(255,255,255,0.25)'}}>{fdf(match.date)}</span>
            </div>
          </div>
          <div className="px-6 pb-5 flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{color:'rgba(212,175,55,0.4)'}}>DYNO</p>
              <p className="text-7xl font-black count-anim leading-none" style={{background:'linear-gradient(135deg,#D4AF37,#FFD700)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{match.scoreDyno}</p>
            </div>
            <div className="px-4 flex flex-col items-center gap-1">
              <div className="w-px h-8" style={{background:'rgba(255,255,255,0.06)'}}/>
              <p className="text-xs font-thin" style={{color:'rgba(255,255,255,0.12)'}}>vs</p>
              <div className="w-px h-8" style={{background:'rgba(255,255,255,0.06)'}}/>
            </div>
            <div className="text-center flex-1">
              <p className="text-[9px] font-black uppercase tracking-widest mb-2 truncate" style={{color:'rgba(255,255,255,0.25)'}}>{match.adversaire}</p>
              <p className="text-7xl font-black count-anim leading-none" style={{color:'rgba(255,255,255,0.3)'}}>{match.scoreAdversaire}</p>
            </div>
          </div>
          {match.sousMatchs?.length>0&&(
            <div className="mx-4 mb-4 rounded-2xl overflow-hidden" style={{border:'1px solid rgba(245,158,11,0.12)'}}>
              <div className="px-4 py-2.5" style={{background:'rgba(245,158,11,0.06)',borderBottom:'1px solid rgba(245,158,11,0.08)'}}>
                <p className="text-[9px] font-black uppercase tracking-widest" style={{color:'rgba(245,158,11,0.6)'}}>🏆 Matchs Division</p>
              </div>
              {match.sousMatchs.map((sm:any,i:number)=>(
                <div key={i} className="px-4 py-2.5 flex items-center justify-between" style={{borderTop:i>0?'1px solid rgba(255,255,255,0.04)':'none',background:'rgba(255,255,255,0.01)'}}>
                  <span className="text-xs font-medium" style={{color:'rgba(255,255,255,0.5)'}}>DYNO vs {sm.adversaire}</span>
                  <span className="text-xs font-black"><span style={{color:'#D4AF37'}}>{sm.scoreDyno}</span><span style={{color:'rgba(255,255,255,0.15)'}}> — </span><span style={{color:'rgba(255,255,255,0.35)'}}>{sm.scoreAdv}</span></span>
                </div>
              ))}
            </div>
          )}
          {match.type&&<p className="text-center text-[9px] uppercase tracking-widest pb-4 font-medium" style={{color:'rgba(255,255,255,0.15)'}}>{match.type} · {match.arene}</p>}
        </div>
        )
      })}
    </div>
  )}
</div>
)}

{activeTab==='strats'&&(
<div className="card-enter">
  <SectionTitle icon="🎯" title="Stratégies"/>
  {user&&<GoldBtn onClick={()=>setShowAddStrat(true)} className="mb-5">➕ Nouvelle Stratégie</GoldBtn>}
  {strats.length===0?(
    <div className="rounded-3xl p-14 text-center" style={cardStyle}><p className="text-5xl mb-4">📝</p><p className="text-sm font-bold" style={{color:'rgba(255,255,255,0.25)'}}>Aucune stratégie</p></div>
  ):(
    <div className="space-y-3">
      {strats.map((s:any,idx:number)=>(
        <div key={s.id} className="rounded-3xl p-5 card-enter" style={{...cardStyle,animationDelay:`${idx*0.05}s`}}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-black text-white text-base">DYNO vs {s.adversaire}</p>
              <p className="text-[10px] mt-0.5 font-medium" style={{color:'rgba(255,255,255,0.25)'}}>par {s.auteur||'?'}</p>
            </div>
            {(isAdmin||user?.uid===s.auteurId)&&<button onClick={()=>del('strats',s.id)} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90" style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.12)'}}>🗑️</button>}
          </div>
          <Divider/>
          <div className="mb-4">
            <p className="text-[9px] font-black uppercase tracking-widest mb-2.5" style={{color:'rgba(74,222,128,0.6)'}}>✅ Picks ({s.picks?.length||0}/4)</p>
            <div className="flex flex-wrap gap-1.5">{s.picks?.map((p:string,i:number)=><Tag key={i} color="green">{p}</Tag>)}</div>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest mb-2.5" style={{color:'rgba(248,113,113,0.6)'}}>❌ Bans ({s.bans?.length||0}/4)</p>
            <div className="flex flex-wrap gap-1.5">{s.bans?.map((b:string,i:number)=><Tag key={i} color="red">{b}</Tag>)}</div>
          </div>
        </div>
      ))}
    </div>
  )}
  {showAddStrat&&(
    <Modal onClose={()=>{setShowAddStrat(false);setNouvelleStrat({adversaire:'',picks:[],bans:[]})}} title="🎯 Nouvelle Stratégie" subtitle="Sélectionne picks et bans">
      <div className="space-y-4 mb-5">
        <input type="text" placeholder="Nom de l'adversaire" value={nouvelleStrat.adversaire} onChange={e=>setNouvelleStrat({...nouvelleStrat,adversaire:e.target.value})} className={`${inputStyle} ${inputCls}`} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.09)'}}/>
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest mb-2.5" style={{color:'rgba(74,222,128,0.7)'}}>✅ Picks (max 4)</p>
          <div className="grid grid-cols-3 gap-1.5">{AM.map(m=><button key={m} onClick={()=>toggleMap(m,'picks')} className="px-2 py-2.5 rounded-xl text-[10px] font-bold transition-all active:scale-95" style={nouvelleStrat.picks.includes(m)?{background:'rgba(74,222,128,0.15)',color:'#4ade80',border:'1px solid rgba(74,222,128,0.25)'}:{background:'rgba(255,255,255,0.03)',color:'rgba(255,255,255,0.35)',border:'1px solid rgba(255,255,255,0.06)'}}>{m}</button>)}</div>
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest mb-2.5" style={{color:'rgba(248,113,113,0.7)'}}>❌ Bans (max 4)</p>
          <div className="grid grid-cols-3 gap-1.5">{AM.map(m=><button key={m} onClick={()=>toggleMap(m,'bans')} className="px-2 py-2.5 rounded-xl text-[10px] font-bold transition-all active:scale-95" style={nouvelleStrat.bans.includes(m)?{background:'rgba(248,113,113,0.15)',color:'#f87171',border:'1px solid rgba(248,113,113,0.25)'}:{background:'rgba(255,255,255,0.03)',color:'rgba(255,255,255,0.35)',border:'1px solid rgba(255,255,255,0.06)'}}>{m}</button>)}</div>
        </div>
      </div>
      <GoldBtn onClick={ajouterStrat}>✅ Sauvegarder</GoldBtn>
    </Modal>
  )}
</div>
)}

{activeTab==='compos'&&(
<div className="card-enter">
  <SectionTitle icon="📋" title="Compositions"/>
  {user&&<GoldBtn onClick={()=>setShowAddCompo(true)} className="mb-5">➕ Nouvelle Compo</GoldBtn>}
  {compos.length===0?(
    <div className="rounded-3xl p-14 text-center" style={cardStyle}><p className="text-5xl mb-4">📋</p><p className="text-sm font-bold" style={{color:'rgba(255,255,255,0.25)'}}>Aucune composition</p></div>
  ):(
    <div className="space-y-3">
      {compos.map((c:any,idx:number)=>(
        <div key={c.id} className="rounded-3xl p-5 card-enter" style={{...cardStyle,animationDelay:`${idx*0.05}s`}}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-black text-white">🗺️ {c.map}</p>
              <p className="text-[10px] mt-0.5" style={{color:'rgba(255,255,255,0.25)'}}>par {c.auteur||'?'}</p>
            </div>
            {(isAdmin||user?.uid===c.auteurId)&&<button onClick={()=>del('compos',c.id)} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.12)'}}>🗑️</button>}
          </div>
          <div className="flex flex-wrap gap-1.5">{c.joueurs?.map((j:string,i:number)=><Tag key={i} color="gold">{j}</Tag>)}</div>
        </div>
      ))}
    </div>
  )}
  {showAddCompo&&(
    <Modal onClose={()=>{setShowAddCompo(false);setSelectedMapCompo('');setCompoJoueurs([])}} title="📋 Nouvelle Compo" subtitle="Map et joueurs">
      <div className="space-y-4 mb-5">
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest mb-2.5" style={{color:'rgba(212,175,55,0.6)'}}>🗺️ Choisir la map</p>
          <div className="grid grid-cols-3 gap-1.5">{AM.map(m=><button key={m} onClick={()=>setSelectedMapCompo(m)} className="px-2 py-2.5 rounded-xl text-[10px] font-bold transition-all active:scale-95" style={selectedMapCompo===m?{background:'rgba(212,175,55,0.15)',color:'#D4AF37',border:'1px solid rgba(212,175,55,0.25)'}:{background:'rgba(255,255,255,0.03)',color:'rgba(255,255,255,0.35)',border:'1px solid rgba(255,255,255,0.06)'}}>{m}</button>)}</div>
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest mb-2.5" style={{color:'rgba(212,175,55,0.6)'}}>👥 Joueurs</p>
          <div className="grid grid-cols-2 gap-1.5">{joueurs.filter((j:any)=>j.actif!==false).map((j:any)=><button key={j.id} onClick={()=>toggleCompoJoueur(j.pseudo)} className="px-3 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95" style={compoJoueurs.includes(j.pseudo)?{background:'rgba(74,222,128,0.15)',color:'#4ade80',border:'1px solid rgba(74,222,128,0.25)'}:{background:'rgba(255,255,255,0.03)',color:'rgba(255,255,255,0.35)',border:'1px solid rgba(255,255,255,0.06)'}}>{j.pseudo}</button>)}</div>
        </div>
      </div>
      <GoldBtn onClick={ajouterCompo}>✅ Sauvegarder</GoldBtn>
    </Modal>
  )}
</div>
)}

{activeTab==='fiches'&&(
<div className="card-enter">
  <SectionTitle icon="🔍" title="Fiches Adversaires"/>
  {user&&<GoldBtn onClick={()=>setShowAddFiche(true)} className="mb-5">➕ Nouvelle Fiche</GoldBtn>}
  {fichesAdversaires.length===0?(
    <div className="rounded-3xl p-14 text-center" style={cardStyle}><p className="text-5xl mb-4">🔍</p><p className="text-sm font-bold" style={{color:'rgba(255,255,255,0.25)'}}>Aucune fiche</p></div>
  ):(
    <div className="space-y-3">
      {fichesAdversaires.map((f:any,idx:number)=>(
        <div key={f.id} className="rounded-3xl overflow-hidden card-enter" style={{...cardStyle,animationDelay:`${idx*0.05}s`}}>
          <div className="px-5 pt-4 pb-3 flex items-center justify-between" style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
            <p className="font-black text-white">⚔️ {f.adversaire}</p>
            {(isAdmin||user?.uid===f.auteurId)&&<button onClick={()=>del('fichesAdversaires',f.id)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.12)'}}>🗑️</button>}
          </div>
          <div className="p-5 space-y-3">
            <div className="rounded-2xl p-4" style={{background:'rgba(74,222,128,0.05)',border:'1px solid rgba(74,222,128,0.1)'}}>
              <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{color:'rgba(74,222,128,0.6)'}}>💪 Forces</p>
              <p className="text-xs leading-relaxed" style={{color:'rgba(255,255,255,0.6)'}}>{f.forces||'—'}</p>
            </div>
            <div className="rounded-2xl p-4" style={{background:'rgba(248,113,113,0.05)',border:'1px solid rgba(248,113,113,0.1)'}}>
              <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{color:'rgba(248,113,113,0.6)'}}>⚠️ Faiblesses</p>
              <p className="text-xs leading-relaxed" style={{color:'rgba(255,255,255,0.6)'}}>{f.faiblesses||'—'}</p>
            </div>
            {f.notes&&<div className="rounded-2xl p-4" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
              <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{color:'rgba(255,255,255,0.3)'}}>📝 Notes</p>
              <p className="text-xs leading-relaxed" style={{color:'rgba(255,255,255,0.5)'}}>{f.notes}</p>
            </div>}
          </div>
          <p className="px-5 pb-4 text-[9px] font-medium" style={{color:'rgba(255,255,255,0.2)'}}>par {f.auteur}</p>
        </div>
      ))}
    </div>
  )}
  {showAddFiche&&(
    <Modal onClose={()=>{setShowAddFiche(false);setNouvelleFiche({adversaire:'',forces:'',faiblesses:'',notes:''})}} title="🔍 Nouvelle Fiche" subtitle="Analyse de l'adversaire">
      <div className="space-y-3 mb-5">
        <input type="text" placeholder="Nom de l'adversaire" value={nouvelleFiche.adversaire} onChange={e=>setNouvelleFiche({...nouvelleFiche,adversaire:e.target.value})} className={`${inputStyle} ${inputCls}`} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.09)'}}/>
        <textarea placeholder="💪 Forces..." value={nouvelleFiche.forces} onChange={e=>setNouvelleFiche({...nouvelleFiche,forces:e.target.value})} rows={2} className={`${inputStyle} ${inputCls} resize-none`} style={{background:'rgba(74,222,128,0.05)',border:'1px solid rgba(74,222,128,0.15)'}}/>
        <textarea placeholder="⚠️ Faiblesses..." value={nouvelleFiche.faiblesses} onChange={e=>setNouvelleFiche({...nouvelleFiche,faiblesses:e.target.value})} rows={2} className={`${inputStyle} ${inputCls} resize-none`} style={{background:'rgba(248,113,113,0.05)',border:'1px solid rgba(248,113,113,0.15)'}}/>
        <textarea placeholder="📝 Notes..." value={nouvelleFiche.notes} onChange={e=>setNouvelleFiche({...nouvelleFiche,notes:e.target.value})} rows={2} className={`${inputStyle} ${inputCls} resize-none`} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}/>
      </div>
      <GoldBtn onClick={ajouterFiche}>✅ Sauvegarder</GoldBtn>
    </Modal>
  )}
</div>
)}

{activeTab==='notes'&&(
<div className="card-enter">
  <SectionTitle icon="📊" title="Notes & Analyses"/>
  {historique.length===0?(
    <div className="rounded-3xl p-14 text-center" style={cardStyle}><p className="text-5xl mb-4">📊</p><p className="text-sm font-bold" style={{color:'rgba(255,255,255,0.25)'}}>Aucun match terminé</p></div>
  ):(
    <div className="space-y-4">
      {historique.map((match:any,idx:number)=>{
        const mn=notes.filter((n:any)=>n.matchId===match.id),mc=commentaires.filter((c:any)=>c.matchId===match.id),ma=analyses.filter((a:any)=>a.matchId===match.id)
        const win=(match.scoreDyno||0)>(match.scoreAdversaire||0)
        return(
        <div key={match.id} className="rounded-3xl overflow-hidden card-enter" style={{...cardStyle,animationDelay:`${idx*0.05}s`}}>
          <div className="px-5 pt-4 pb-3" style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
            <div className="flex items-center justify-between">
              <p className="font-black text-white">DYNO vs {match.adversaire}</p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-full text-[9px] font-black" style={win?{background:'rgba(212,175,55,0.12)',color:'#D4AF37'}:{background:'rgba(239,68,68,0.1)',color:'#f87171'}}>{match.scoreDyno}–{match.scoreAdversaire}</span>
                <span className="text-[10px]" style={{color:'rgba(255,255,255,0.25)'}}>{fdf(match.date)}</span>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 grid grid-cols-3 gap-2">
            <button onClick={()=>{setSelectedMatchForNotes(match);setNouvelleNote({matchId:match.id,mental:'',communication:'',gameplay:''})}} className="py-2.5 rounded-xl text-[10px] font-bold transition-all active:scale-95" style={{background:'rgba(168,85,247,0.1)',color:'#c084fc',border:'1px solid rgba(168,85,247,0.15)'}}>📝 Note</button>
            <button onClick={()=>setSelectedMatchForComment(selectedMatchForComment?.id===match.id?null:match)} className="py-2.5 rounded-xl text-[10px] font-bold transition-all active:scale-95" style={{background:'rgba(34,211,238,0.1)',color:'#22d3ee',border:'1px solid rgba(34,211,238,0.15)'}}>💬 Comm</button>
            <button onClick={()=>setSelectedMatchForAnalyse(selectedMatchForAnalyse?.id===match.id?null:match)} className="py-2.5 rounded-xl text-[10px] font-bold transition-all active:scale-95" style={{background:'rgba(251,146,60,0.1)',color:'#fb923c',border:'1px solid rgba(251,146,60,0.15)'}}>📋 Analyse</button>
          </div>
          {selectedMatchForComment?.id===match.id&&user&&(
            <div className="px-4 pb-3">
              <textarea placeholder="Ton commentaire..." value={nouveauCommentaire} onChange={e=>setNouveauCommentaire(e.target.value)} rows={2} className="w-full rounded-xl px-4 py-3 text-xs text-white resize-none focus:outline-none mb-2" style={{background:'rgba(34,211,238,0.05)',border:'1px solid rgba(34,211,238,0.12)'}}/>
              <button onClick={()=>ajouterCommentaire(match.id)} className="w-full py-2 rounded-xl text-xs font-bold" style={{background:'rgba(34,211,238,0.12)',color:'#22d3ee',border:'1px solid rgba(34,211,238,0.18)'}}>💬 Envoyer</button>
            </div>
          )}
          {selectedMatchForAnalyse?.id===match.id&&user&&(
            <div className="px-4 pb-3 space-y-2">
              {[{k:'bien',label:"✅ Ce qui a bien marché",color:'rgba(74,222,128,0.12)',border:'rgba(74,222,128,0.2)',tc:'#4ade80'},{k:'mal',label:"❌ Ce qui a mal marché",color:'rgba(248,113,113,0.08)',border:'rgba(248,113,113,0.18)',tc:'#f87171'},{k:'plan',label:"🎯 Plan d'action",color:'rgba(96,165,250,0.08)',border:'rgba(96,165,250,0.18)',tc:'#60a5fa'}].map(({k,label,color,border,tc})=>(
                <div key={k}>
                  <p className="text-[9px] font-black uppercase mb-1" style={{color:tc}}>{label}</p>
                  <textarea value={(nouvelleAnalyse as any)[k]} onChange={e=>setNouvelleAnalyse({...nouvelleAnalyse,[k]:e.target.value})} rows={2} className="w-full rounded-xl px-4 py-2.5 text-xs text-white resize-none focus:outline-none" style={{background:color,border:`1px solid ${border}`}}/>
                </div>
              ))}
              <button onClick={()=>ajouterAnalyse(match.id)} className="w-full py-2 rounded-xl text-xs font-bold" style={{background:'rgba(251,146,60,0.12)',color:'#fb923c',border:'1px solid rgba(251,146,60,0.18)'}}>📋 Sauvegarder l'analyse</button>
            </div>
          )}
          {mn.length>0&&(
            <div className="px-4 pb-3">
              <p className="text-[9px] font-black uppercase tracking-widest mb-2.5" style={{color:'rgba(168,85,247,0.6)'}}>📊 Notes ({mn.length})</p>
              <div className="space-y-2">
                {mn.map((n:any)=>(
                  <div key={n.id} className="rounded-2xl p-3.5" style={{background:'rgba(168,85,247,0.05)',border:'1px solid rgba(168,85,247,0.1)'}}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-black text-xs" style={{color:'#D4AF37'}}>{n.joueur}</p>
                      <div className="flex items-center gap-1.5">
                        {user&&(isAdmin||user.uid===n.joueurId)&&(
                          <button onClick={()=>setNoteEdit({id:n.id,mental:String(Math.min(10,Math.max(0,parseInt(n.mental)||0))),communication:String(Math.min(10,Math.max(0,parseInt(n.communication)||0))),gameplay:String(Math.min(10,Math.max(0,parseInt(n.gameplay)||0))),joueur:n.joueur})} className="px-2 py-1 rounded-lg text-[9px] font-bold" style={{background:'rgba(168,85,247,0.15)',color:'#c084fc',border:'1px solid rgba(168,85,247,0.2)'}}>✏️</button>
                        )}
                        {isAdmin&&<button onClick={()=>del('notes',n.id)} className="w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{background:'rgba(239,68,68,0.08)'}}>🗑️</button>}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[{k:'mental',icon:'🧠',label:'Mental',color:'#c084fc'},{k:'communication',icon:'💬',label:'Comm',color:'#60a5fa'},{k:'gameplay',icon:'🎯',label:'Perf',color:'#4ade80'}].map(({k,icon,label,color})=>(
                        <div key={k} className="rounded-xl p-2.5 text-center" style={{background:'rgba(255,255,255,0.03)'}}>
                          <p className="text-sm mb-0.5">{icon}</p>
                          <p className="text-lg font-black" style={{color}}>{Math.min(10,parseInt((n as any)[k])||0)}</p>
                          <p className="text-[8px]" style={{color:'rgba(255,255,255,0.25)'}}>{label}</p>
                          <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.06)'}}>
                            <div className="h-full rounded-full" style={{width:`${(Math.min(10,parseInt((n as any)[k])||0)/10)*100}%`,background:color}}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {mc.length>0&&(
            <div className="px-4 pb-3">
              <p className="text-[9px] font-black uppercase tracking-widest mb-2.5" style={{color:'rgba(34,211,238,0.6)'}}>💬 Commentaires ({mc.length})</p>
              <div className="space-y-2">
                {mc.map((c:any)=>(
                  <div key={c.id} className="rounded-xl p-3.5" style={{background:'rgba(34,211,238,0.04)',border:'1px solid rgba(34,211,238,0.08)'}}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-black" style={{color:'#22d3ee'}}>{c.joueur}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[9px]" style={{color:'rgba(255,255,255,0.2)'}}>{fts(c.createdAt)}</p>
                        {(isAdmin||user?.uid===c.joueurId)&&<button onClick={()=>del('commentaires',c.id)} className="text-red-400/40 text-xs">🗑️</button>}
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed" style={{color:'rgba(255,255,255,0.55)'}}>{c.texte}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {ma.length>0&&(
            <div className="px-4 pb-4">
              <p className="text-[9px] font-black uppercase tracking-widest mb-2.5" style={{color:'rgba(251,146,60,0.6)'}}>📋 Analyses ({ma.length})</p>
              <div className="space-y-2">
                {ma.map((a:any)=>(
                  <div key={a.id} className="rounded-xl p-3.5" style={{background:'rgba(251,146,60,0.04)',border:'1px solid rgba(251,146,60,0.08)'}}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-black" style={{color:'#fb923c'}}>{a.joueur}</p>
                      {(isAdmin||user?.uid===a.joueurId)&&<button onClick={()=>del('analyses',a.id)} className="text-red-400/40 text-xs">🗑️</button>}
                    </div>
                    <div className="space-y-2">
                      {a.bien&&<div className="rounded-lg p-2.5" style={{background:'rgba(74,222,128,0.07)'}}><p className="text-[8px] font-black text-green-400 mb-1">✅</p><p className="text-xs" style={{color:'rgba(255,255,255,0.55)'}}>{a.bien}</p></div>}
                      {a.mal&&<div className="rounded-lg p-2.5" style={{background:'rgba(248,113,113,0.07)'}}><p className="text-[8px] font-black text-red-400 mb-1">❌</p><p className="text-xs" style={{color:'rgba(255,255,255,0.55)'}}>{a.mal}</p></div>}
                      {a.plan&&<div className="rounded-lg p-2.5" style={{background:'rgba(96,165,250,0.07)'}}><p className="text-[8px] font-black text-blue-400 mb-1">🎯</p><p className="text-xs" style={{color:'rgba(255,255,255,0.55)'}}>{a.plan}</p></div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {mn.length===0&&mc.length===0&&ma.length===0&&<p className="text-center text-[10px] pb-4 font-medium" style={{color:'rgba(255,255,255,0.15)'}}>Aucune donnée pour ce match</p>}
        </div>
        )
      })}
    </div>
  )}
  {noteEdit&&(
    <Modal onClose={()=>setNoteEdit(null)} title="✏️ Modifier la note" subtitle={noteEdit.joueur}>
      <div className="space-y-5 mb-6">
        {[{key:'mental',label:'🧠 Mental',color:'#c084fc',bg:'rgba(168,85,247,0.1)'},{key:'communication',label:'💬 Communication',color:'#60a5fa',bg:'rgba(96,165,250,0.1)'},{key:'gameplay',label:'🎯 Performance',color:'#4ade80',bg:'rgba(74,222,128,0.1)'}].map(({key,label,color,bg})=>(
          <div key={key}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{color}}>{label}</p>
            <div className="flex items-center gap-3">
              <button onClick={()=>setNoteEdit({...noteEdit,[key]:String(Math.max(0,parseInt(noteEdit[key]||'0')-1))})} className="w-12 h-12 rounded-2xl font-black text-xl flex items-center justify-center transition-all active:scale-90" style={{background:bg,color,border:`1px solid ${color}30`}}>−</button>
              <div className="flex-1 relative">
                <input type="number" min="0" max="10" value={noteEdit[key]} onChange={e=>setNoteEdit({...noteEdit,[key]:String(Math.min(10,Math.max(0,parseInt(e.target.value)||0)))})} className="w-full rounded-2xl px-4 py-4 text-center text-3xl font-black focus:outline-none" style={{background:bg,border:`1px solid ${color}25`,color}}/>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.06)'}}>
                  <div className="h-full rounded-full transition-all duration-300" style={{width:`${(parseInt(noteEdit[key]||'0')/10)*100}%`,background:color,boxShadow:`0 0 8px ${color}60`}}/>
                </div>
              </div>
              <button onClick={()=>setNoteEdit({...noteEdit,[key]:String(Math.min(10,parseInt(noteEdit[key]||'0')+1))})} className="w-12 h-12 rounded-2xl font-black text-xl flex items-center justify-center transition-all active:scale-90" style={{background:bg,color,border:`1px solid ${color}30`}}>+</button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={()=>setNoteEdit(null)} className="flex-1 py-3 rounded-2xl font-bold text-sm" style={{background:'rgba(255,255,255,0.04)',color:'rgba(255,255,255,0.3)',border:'1px solid rgba(255,255,255,0.07)'}}>Annuler</button>
        <button onClick={updateNote} className="flex-1 py-3 rounded-2xl font-black text-sm text-black" style={{background:G2,boxShadow:'0 4px 20px rgba(212,175,55,0.25)'}}>✅ Sauvegarder</button>
      </div>
    </Modal>
  )}
  {selectedMatchForNotes&&(
    <Modal onClose={()=>setSelectedMatchForNotes(null)} title={`📊 Note — ${selectedMatchForNotes.adversaire}`} subtitle="Évalue la performance de l'équipe">
      <div className="space-y-4 mb-6">
        {[{key:'mental',label:'🧠 Mental',color:'#c084fc'},{key:'communication',label:'💬 Communication',color:'#60a5fa'},{key:'gameplay',label:'🎯 Performance',color:'#4ade80'}].map(({key,label,color})=>(
          <div key={key}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{color}}>{label}</p>
            <input type="number" min="0" max="10" placeholder="0–10" value={(nouvelleNote as any)[key]} onChange={e=>setNouvelleNote({...nouvelleNote,[key]:e.target.value})} className="w-full rounded-2xl px-4 py-4 text-center text-3xl font-black focus:outline-none" style={{background:'rgba(255,255,255,0.04)',border:`1px solid ${color}25`,color}}/>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={()=>setSelectedMatchForNotes(null)} className="flex-1 py-3 rounded-2xl font-bold text-sm" style={{background:'rgba(255,255,255,0.04)',color:'rgba(255,255,255,0.3)',border:'1px solid rgba(255,255,255,0.07)'}}>Annuler</button>
        <button onClick={ajouterNote} className="flex-1 py-3 rounded-2xl font-black text-sm text-black" style={{background:G2}}>✅ Envoyer</button>
      </div>
    </Modal>
  )}
</div>
)}

{activeTab==='rec'&&(
<div className="card-enter">
  <SectionTitle icon="🎬" title="Replays"/>
  <a href={YT} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl font-black text-sm mb-5 transition-all active:scale-95" style={{background:'rgba(239,68,68,0.1)',color:'#f87171',border:'1px solid rgba(239,68,68,0.2)'}}>
    <span className="w-2 h-2 rounded-full live-pulse" style={{background:'#f87171'}}/>
    Chaîne YouTube DYNO
  </a>
  {replays.length===0?(
    <div className="rounded-3xl p-14 text-center" style={cardStyle}><p className="text-5xl mb-4">📹</p><p className="text-sm font-bold" style={{color:'rgba(255,255,255,0.25)'}}>Aucun replay</p></div>
  ):(
    <div className="space-y-3">
      {replays.map((r:any,idx:number)=>(
        <div key={r.id} className="rounded-3xl overflow-hidden card-enter" style={{...cardStyle,animationDelay:`${idx*0.05}s`}}>
          <div className="px-5 pt-4 pb-3 flex items-center justify-between" style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
            <h3 className="font-black text-white">{r.titre}</h3>
            {isAdmin&&<button onClick={()=>del('replays',r.id)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.12)'}}>🗑️</button>}
          </div>
          <div className="p-4">
            {ytId(r.lien)?(
              <div className="relative w-full rounded-2xl overflow-hidden" style={{paddingBottom:'56.25%'}}>
                <iframe src={`https://www.youtube.com/embed/${ytId(r.lien)}`} className="absolute top-0 left-0 w-full h-full" frameBorder="0" allowFullScreen/>
              </div>
            ):(
              <a href={r.lien} target="_blank" rel="noreferrer" className="block w-full py-3.5 rounded-2xl font-bold text-center text-sm" style={{background:G2,color:'#000'}}>▶️ Voir le replay</a>
            )}
          </div>
        </div>
      ))}
    </div>
  )}
</div>
)}

{activeTab==='roster'&&(
<div className="card-enter">
  <SectionTitle icon="👥" title="Roster"/>
  {user&&(
    <div className="rounded-2xl p-4 mb-5" style={{background:'rgba(236,72,153,0.06)',border:'1px solid rgba(236,72,153,0.12)'}}>
      <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{color:'rgba(236,72,153,0.6)'}}>🎂 Anniversaire</p>
      <div className="flex gap-2">
        <input type="date" value={anniversaire} onChange={e=>setAnniversaire(e.target.value)} className={`flex-1 ${inputStyle} ${inputCls} py-2.5`} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(236,72,153,0.2)'}}/>
        <button onClick={sauvegarderAnniversaire} className="px-4 py-2.5 rounded-2xl font-black text-xs transition-all active:scale-95" style={{background:'rgba(236,72,153,0.15)',color:'#f472b6',border:'1px solid rgba(236,72,153,0.2)'}}>💾</button>
      </div>
    </div>
  )}
  <div className="space-y-2.5">
    {joueurs.filter((j:any)=>j.actif!==false).map((j:any,idx:number)=>(
      <div key={j.id} className="rounded-2xl p-4 flex items-center gap-4 card-enter" style={{...cardStyle,animationDelay:`${idx*0.05}s`}}>
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 rounded-2xl" style={{background:'rgba(212,175,55,0.15)',filter:'blur(6px)'}}/>
          <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl" style={{background:'linear-gradient(135deg,rgba(212,175,55,0.15),rgba(212,175,55,0.05))',border:'1px solid rgba(212,175,55,0.15)',color:'#D4AF37'}}>{j.pseudo[0]?.toUpperCase()}</div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-white">{j.pseudo}</p>
          <p className="text-[10px] font-medium mt-0.5" style={{color:'rgba(255,255,255,0.3)'}}>🎮 {j.role}</p>
        </div>
        {isAdmin&&<button onClick={()=>del('players',j.id)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.12)'}}>🗑️</button>}
      </div>
    ))}
  </div>
</div>
)}

{activeTab==='stats'&&(
<div className="card-enter">
  <SectionTitle icon="📈" title="Statistiques"/>
  <div className="grid grid-cols-3 gap-3 mb-5">
    <StatCard value={`${winRate}%`} label="Win Rate" color="#D4AF37"/>
    <StatCard value={victoires} label="Victoires" color="#4ade80"/>
    <StatCard value={defaites} label="Défaites" color="#f87171"/>
  </div>
  <div className="rounded-3xl p-6 mb-4" style={cardStyle}>
    <p className="text-xs font-black uppercase tracking-widest mb-5" style={{color:'rgba(212,175,55,0.6)'}}>📊 Répartition</p>
    <div className="space-y-4">
      {[{label:'🏆 Victoires',value:victoires,total:totalMatchs,color:'#D4AF37'},{label:'❌ Défaites',value:defaites,total:totalMatchs,color:'#f87171'}].map(({label,value,total,color})=>(
        <div key={label}>
          <div className="flex justify-between mb-2">
            <span className="text-xs font-medium" style={{color:'rgba(255,255,255,0.4)'}}>{label}</span>
            <span className="text-xs font-black" style={{color}}>{value} <span style={{color:'rgba(255,255,255,0.2)'}}>/ {total}</span></span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.04)'}}>
            <div className="h-full rounded-full transition-all duration-1000" style={{width:`${total>0?(value/total)*100:0}%`,background:color,boxShadow:`0 0 8px ${color}50`}}/>
          </div>
        </div>
      ))}
    </div>
  </div>
  <GoldBtn onClick={()=>setShowBilan(true)}>📊 Bilan du mois</GoldBtn>
  {showBilan&&(()=>{const b=genBilan();return(
    <Modal onClose={()=>setShowBilan(false)} title={`📊 Bilan ${b.nom}`} subtitle="Performances du mois en cours">
      <div className="space-y-4 mb-5">
        <div className="grid grid-cols-3 gap-2">
          <StatCard value={b.m} label="Matchs"/>
          <StatCard value={`${b.w}W`} label="Victoires" color="#4ade80"/>
          <StatCard value={`${b.l}L`} label="Défaites" color="#f87171"/>
        </div>
        <div className="rounded-2xl p-6 text-center" style={{background:'rgba(212,175,55,0.06)',border:'1px solid rgba(212,175,55,0.12)'}}>
          <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{color:'rgba(212,175,55,0.4)'}}>Win Rate</p>
          <p className="text-6xl font-black shimmer-gold">{b.wr}%</p>
        </div>
        <div className="rounded-2xl p-4" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
          <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{color:'rgba(255,255,255,0.3)'}}>Notes moyennes</p>
          <div className="grid grid-cols-3 gap-2">
            {[{v:b.am,l:'🧠 Mental',c:'#c084fc'},{v:b.ac,l:'💬 Comm',c:'#60a5fa'},{v:b.ap,l:'🎯 Perf',c:'#4ade80'}].map(({v,l,c})=>(
              <div key={l} className="text-center rounded-xl py-3" style={{background:'rgba(255,255,255,0.03)'}}>
                <p className="text-2xl font-black" style={{color:c}}>{v}</p>
                <p className="text-[8px] mt-1 font-medium" style={{color:'rgba(255,255,255,0.25)'}}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <button onClick={()=>setShowBilan(false)} className="w-full py-3 rounded-2xl font-bold text-sm" style={{background:'rgba(255,255,255,0.04)',color:'rgba(255,255,255,0.3)',border:'1px solid rgba(255,255,255,0.07)'}}>Fermer</button>
    </Modal>
  )})()}
</div>
)}

{activeTab==='admin'&&(
<div className="card-enter">
  <SectionTitle icon="⚙️" title="Administration"/>
  {!isAdmin?(
    <div className="rounded-3xl p-6" style={cardStyle}>
      <p className="text-center text-sm mb-5 font-medium" style={{color:'rgba(255,255,255,0.3)'}}>🔐 Accès administrateur requis</p>
      <input type="password" placeholder="Mot de passe" value={adminPassword} onChange={e=>setAdminPassword(e.target.value)} className={`${inputStyle} ${inputCls} mb-3`} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.09)'}}/>
      <GoldBtn onClick={handleAdminLogin}>Se connecter</GoldBtn>
    </div>
  ):(
    <div className="space-y-4">
      <div className="rounded-3xl p-5" style={cardStyle}>
        <p className="text-xs font-black uppercase tracking-widest mb-4" style={{color:'rgba(212,175,55,0.6)'}}>➕ Nouveau Match</p>
        <div className="space-y-2.5">
          <input type="text" placeholder="Adversaire / Nom de la soirée" value={nouveauMatch.adversaire} onChange={e=>setNouveauMatch({...nouveauMatch,adversaire:e.target.value})} className={`${inputStyle} ${inputCls}`} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}/>
          <input type="date" value={nouveauMatch.date} onChange={e=>setNouveauMatch({...nouveauMatch,date:e.target.value})} className={`${inputStyle} ${inputCls}`} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}/>
          <div className="grid grid-cols-2 gap-2">
            <input type="time" value={nouveauMatch.horaire1} onChange={e=>setNouveauMatch({...nouveauMatch,horaire1:e.target.value})} className={`${inputStyle} ${inputCls}`} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}/>
            <input type="time" value={nouveauMatch.horaire2} onChange={e=>setNouveauMatch({...nouveauMatch,horaire2:e.target.value})} className={`${inputStyle} ${inputCls}`} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}/>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select value={nouveauMatch.arene} onChange={e=>setNouveauMatch({...nouveauMatch,arene:e.target.value})} className={`${inputStyle} ${inputCls}`} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}><option value="Arène 1">Arène 1</option><option value="Arène 2">Arène 2</option></select>
            <select value={nouveauMatch.type} onChange={e=>setNouveauMatch({...nouveauMatch,type:e.target.value})} className={`${inputStyle} ${inputCls}`} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}><option value="Ligue">Ligue</option><option value="Scrim">Scrim</option><option value="Tournoi">Tournoi</option><option value="Division">Division</option></select>
          </div>
          {nouveauMatch.type==='Division'&&(
            <div className="rounded-2xl p-4" style={{background:'rgba(245,158,11,0.05)',border:'1px solid rgba(245,158,11,0.13)'}}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{color:'rgba(245,158,11,0.7)'}}>🏆 Matchs Division (BO3)</p>
              {nouveauMatch.sousMatchs.length>0&&(
                <div className="space-y-1.5 mb-3">
                  {nouveauMatch.sousMatchs.map((sm:any,i:number)=>(
                    <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{background:'rgba(255,255,255,0.04)'}}>
                      <span className="text-xs text-white/60">DYNO vs {sm.adversaire}</span>
                      <div className="flex items-center gap-2"><span className="text-xs font-black" style={{color:'#D4AF37'}}>{sm.scoreDyno}</span><span className="text-xs" style={{color:'rgba(255,255,255,0.2)'}}>—</span><span className="text-xs font-black" style={{color:'rgba(255,255,255,0.4)'}}>{sm.scoreAdv}</span><button onClick={()=>supprimerSousMatch(i)} className="ml-1 text-red-400/50 text-sm font-bold">×</button></div>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-2">
                <input type="text" placeholder="Adversaire (ex: EY)" value={newSubAdv} onChange={e=>setNewSubAdv(e.target.value)} className={`${inputStyle} ${inputCls} text-xs py-2.5`} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)'}}/>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="Score DYNO" value={newSubScoreDyno} onChange={e=>setNewSubScoreDyno(e.target.value)} className={`${inputStyle} text-center font-black text-sm py-2.5`} style={{background:'rgba(212,175,55,0.07)',border:'1px solid rgba(212,175,55,0.18)',color:'#D4AF37'}}/>
                  <input type="number" placeholder="Score Adv" value={newSubScoreAdv} onChange={e=>setNewSubScoreAdv(e.target.value)} className={`${inputStyle} text-center font-black text-sm py-2.5`} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',color:'rgba(255,255,255,0.45)'}}/>
                </div>
                <button onClick={ajouterSousMatch} className="w-full py-2.5 rounded-xl text-xs font-bold" style={{background:'rgba(245,158,11,0.1)',color:'#fbbf24',border:'1px solid rgba(245,158,11,0.18)'}}>➕ Ajouter ce match</button>
              </div>
            </div>
          )}
          <GoldBtn onClick={ajouterMatch}>📤 Ajouter + Notifier Discord</GoldBtn>
        </div>
      </div>
      <div className="rounded-3xl p-5" style={cardStyle}>
        <p className="text-xs font-black uppercase tracking-widest mb-4" style={{color:'rgba(212,175,55,0.6)'}}>🎬 Ajouter un Replay</p>
        <div className="space-y-2.5">
          <input type="text" placeholder="Titre du replay" value={nouveauReplay.titre} onChange={e=>setNouveauReplay({...nouveauReplay,titre:e.target.value})} className={`${inputStyle} ${inputCls}`} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}/>
          <input type="text" placeholder="Lien YouTube" value={nouveauReplay.lien} onChange={e=>setNouveauReplay({...nouveauReplay,lien:e.target.value})} className={`${inputStyle} ${inputCls}`} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}/>
          <GoldBtn onClick={ajouterReplay}>Ajouter le replay</GoldBtn>
        </div>
      </div>
      <div className="rounded-3xl p-5" style={cardStyle}>
        <p className="text-xs font-black uppercase tracking-widest mb-4" style={{color:'rgba(212,175,55,0.6)'}}>✏️ Modifier les Scores</p>
        {matchs.length===0?<p className="text-center text-xs py-4" style={{color:'rgba(255,255,255,0.2)'}}>Aucun match</p>:(
          <div className="space-y-2">
            {matchs.map((m:any)=>(
              <div key={m.id} className="flex items-center justify-between p-3.5 rounded-2xl" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.05)'}}>
                <div>
                  <p className="text-xs font-black text-white">DYNO vs {m.adversaire}</p>
                  <p className="text-[9px] mt-0.5 font-medium" style={{color:'rgba(255,255,255,0.25)'}}>{fdf(m.date)} · {m.type}</p>
                  {m.termine&&<p className="text-[9px] mt-0.5" style={{color:'rgba(212,175,55,0.5)'}}>Score : {m.scoreDyno} — {m.scoreAdversaire}</p>}
                </div>
                <button onClick={()=>setScoreEdit({id:m.id,adversaire:m.adversaire,type:m.type,scoreDyno:String(m.scoreDyno||0),scoreAdv:String(m.scoreAdversaire||0),sousMatchs:m.sousMatchs?[...m.sousMatchs]:[],_newSubAdv:'',_newSubScoreDyno:'',_newSubScoreAdv:''})} className="px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95" style={{background:'rgba(212,175,55,0.08)',color:'#D4AF37',border:'1px solid rgba(212,175,55,0.18)'}}>✏️</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="rounded-3xl p-5" style={cardStyle}>
        <p className="text-xs font-black uppercase tracking-widest mb-4" style={{color:'rgba(239,68,68,0.5)'}}>🗑️ Supprimer des Matchs</p>
        {matchs.length===0?<p className="text-center text-xs py-4" style={{color:'rgba(255,255,255,0.2)'}}>Aucun match</p>:(
          <div className="space-y-2">
            {matchs.map((m:any)=>(
              <div key={m.id} className="flex items-center justify-between p-3.5 rounded-2xl" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.05)'}}>
                <div><p className="text-xs font-bold text-white">{m.adversaire}</p><p className="text-[9px] font-medium" style={{color:'rgba(255,255,255,0.25)'}}>{fdf(m.date)}</p></div>
                <button onClick={()=>del('matchs',m.id)} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90" style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.15)'}}>🗑️</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <GoldBtn onClick={handleAdminLogout} danger>🚪 Déconnexion Admin</GoldBtn>
    </div>
  )}
  {scoreEdit&&(
    <Modal onClose={()=>setScoreEdit(null)} title="✏️ Modifier le score" subtitle={`DYNO vs ${scoreEdit.adversaire}`}>
      {scoreEdit.type==='Division'?(
        <div className="space-y-3 mb-5">
          <p className="text-[10px] font-black uppercase tracking-widest" style={{color:'rgba(245,158,11,0.6)'}}>🏆 Matchs Division</p>
          {(scoreEdit.sousMatchs||[]).length>0&&(
            <div className="space-y-1.5">
              {(scoreEdit.sousMatchs||[]).map((sm:any,i:number)=>(
                <div key={i} className="flex items-center justify-between px-4 py-3 rounded-2xl" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.06)'}}>
                  <span className="text-xs font-medium text-white/60">DYNO vs {sm.adversaire}</span>
                  <div className="flex items-center gap-2"><span className="text-sm font-black" style={{color:'#D4AF37'}}>{sm.scoreDyno}</span><span style={{color:'rgba(255,255,255,0.2)'}}>—</span><span className="text-sm font-black" style={{color:'rgba(255,255,255,0.4)'}}>{sm.scoreAdv}</span><button onClick={()=>supprimerSousMatchEdit(i)} className="ml-2 text-red-400/50 font-bold">×</button></div>
                </div>
              ))}
            </div>
          )}
          <div className="rounded-2xl p-4 space-y-2" style={{background:'rgba(245,158,11,0.05)',border:'1px solid rgba(245,158,11,0.12)'}}>
            <p className="text-[9px] font-black uppercase tracking-widest" style={{color:'rgba(245,158,11,0.6)'}}>➕ Ajouter</p>
            <input type="text" placeholder="Adversaire" value={scoreEdit._newSubAdv||''} onChange={e=>setScoreEdit({...scoreEdit,_newSubAdv:e.target.value})} className={`${inputStyle} ${inputCls} text-xs py-2.5`} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)'}}/>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="DYNO" value={scoreEdit._newSubScoreDyno||''} onChange={e=>setScoreEdit({...scoreEdit,_newSubScoreDyno:e.target.value})} className={`${inputStyle} text-center font-black py-2.5`} style={{background:'rgba(212,175,55,0.07)',border:'1px solid rgba(212,175,55,0.18)',color:'#D4AF37'}}/>
              <input type="number" placeholder="Adv" value={scoreEdit._newSubScoreAdv||''} onChange={e=>setScoreEdit({...scoreEdit,_newSubScoreAdv:e.target.value})} className={`${inputStyle} text-center font-black py-2.5`} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',color:'rgba(255,255,255,0.45)'}}/>
            </div>
            <button onClick={ajouterSousMatchEdit} className="w-full py-2.5 rounded-xl text-xs font-bold" style={{background:'rgba(245,158,11,0.1)',color:'#fbbf24',border:'1px solid rgba(245,158,11,0.18)'}}>➕ Ajouter</button>
          </div>
          {(scoreEdit.sousMatchs||[]).length>0&&(
            <div className="rounded-xl p-4 text-center" style={{background:'rgba(212,175,55,0.05)',border:'1px solid rgba(212,175,55,0.1)'}}>
              <p className="text-[9px] uppercase tracking-widest mb-1.5" style={{color:'rgba(212,175,55,0.4)'}}>Total</p>
              <p className="text-3xl font-black"><span style={{color:'#D4AF37'}}>{(scoreEdit.sousMatchs||[]).reduce((a:number,s:any)=>a+parseInt(s.scoreDyno||0),0)}</span><span style={{color:'rgba(255,255,255,0.15)'}}> — </span><span style={{color:'rgba(255,255,255,0.35)'}}>{(scoreEdit.sousMatchs||[]).reduce((a:number,s:any)=>a+parseInt(s.scoreAdv||0),0)}</span></p>
            </div>
          )}
        </div>
      ):(
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <p className="text-[10px] font-bold uppercase mb-2" style={{color:'rgba(212,175,55,0.5)'}}>DYNO</p>
            <input type="number" placeholder="0" value={scoreEdit.scoreDyno} onChange={e=>setScoreEdit({...scoreEdit,scoreDyno:e.target.value})} className="w-full rounded-2xl px-4 py-6 text-center text-5xl font-black focus:outline-none" style={{background:'rgba(212,175,55,0.06)',border:'1px solid rgba(212,175,55,0.15)',color:'#D4AF37'}}/>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase mb-2" style={{color:'rgba(255,255,255,0.25)'}}>Adversaire</p>
            <input type="number" placeholder="0" value={scoreEdit.scoreAdv} onChange={e=>setScoreEdit({...scoreEdit,scoreAdv:e.target.value})} className="w-full rounded-2xl px-4 py-6 text-center text-5xl font-black focus:outline-none" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.4)'}}/>
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <button onClick={()=>setScoreEdit(null)} className="flex-1 py-3 rounded-2xl text-sm font-bold" style={{background:'rgba(255,255,255,0.04)',color:'rgba(255,255,255,0.3)',border:'1px solid rgba(255,255,255,0.07)'}}>Annuler</button>
        <button onClick={updateScore} className="flex-1 py-3 rounded-2xl text-sm font-black text-black" style={{background:G2,boxShadow:'0 4px 20px rgba(212,175,55,0.25)'}}>✅ Sauvegarder</button>
      </div>
    </Modal>
  )}
</div>
)}

</main>

<nav className="fixed bottom-0 left-0 right-0 z-50" style={{background:'rgba(3,2,0,0.97)',backdropFilter:'blur(32px)',borderTop:'1px solid rgba(212,175,55,0.07)',boxShadow:'0 -8px 48px rgba(0,0,0,0.8)'}}>
  <div className="max-w-lg mx-auto flex">
    {navItems.map(({t,i,l})=>(
      <button key={t} onClick={()=>setActiveTab(t)} className="flex-1 flex flex-col items-center justify-center py-3 relative transition-all active:scale-90" style={{color:activeTab===t?'#D4AF37':'rgba(255,255,255,0.18)'}}>
        {activeTab===t&&(
          <div className="absolute top-0 left-1/2 -translate-x-1/2" style={{width:'32px',height:'2px',background:'linear-gradient(90deg,transparent,#D4AF37,transparent)',boxShadow:'0 0 8px rgba(212,175,55,0.5)'}}/>
        )}
        <span className="text-base leading-none mb-0.5">{i}</span>
        <span className="text-[7px] font-black uppercase tracking-wide leading-none" style={{color:activeTab===t?'rgba(212,175,55,0.7)':'rgba(255,255,255,0.12)'}}>{l}</span>
      </button>
    ))}
  </div>
</nav>

{!user&&(
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{background:'rgba(0,0,0,0.97)',backdropFilter:'blur(32px)'}}>
    <div className="w-full sm:max-w-sm rounded-t-[2.5rem] sm:rounded-3xl" style={{background:'linear-gradient(170deg,#111008,#080600,#040300)',border:'1px solid rgba(212,175,55,0.12)',boxShadow:'0 -32px 100px rgba(0,0,0,0.95)'}}>
      <div className="w-10 h-1 rounded-full mx-auto mt-4 sm:hidden" style={{background:'rgba(212,175,55,0.2)'}}/>
      <div className="p-8">
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 rounded-3xl" style={{background:'rgba(212,175,55,0.15)',filter:'blur(16px)',transform:'scale(1.6)'}}/>
            <img src={LG} alt="D" className="w-20 h-20 relative rounded-3xl"/>
          </div>
          <h3 className="text-2xl font-black shimmer-gold">{isSignUp?'Créer un compte':'Connexion'}</h3>
          <p className="text-xs mt-1.5 font-medium" style={{color:'rgba(255,255,255,0.25)'}}>DYNO Esport Team</p>
        </div>
        <div className="space-y-3 mb-6">
          {isSignUp&&<input type="text" placeholder="Ton pseudo" value={pseudo} onChange={e=>setPseudo(e.target.value)} className={`${inputStyle} ${inputCls}`} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)'}}/>}
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className={`${inputStyle} ${inputCls}`} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)'}}/>
          <input type="password" placeholder="Mot de passe" value={authPassword} onChange={e=>setAuthPassword(e.target.value)} className={`${inputStyle} ${inputCls}`} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)'}}/>
        </div>
        {isSignUp?<GoldBtn onClick={handleSignUp} className="mb-4">✅ Créer mon compte</GoldBtn>:<GoldBtn onClick={handleSignIn} className="mb-4">🔐 Se connecter</GoldBtn>}
        <div className="text-center pt-4" style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
          {isSignUp?(
            <button onClick={()=>setIsSignUp(false)} className="text-xs font-medium" style={{color:'rgba(255,255,255,0.3)'}}>Déjà un compte ? <span className="font-black" style={{color:'#D4AF37'}}>Se connecter</span></button>
          ):(
            <button onClick={()=>setIsSignUp(true)} className="text-xs font-medium" style={{color:'rgba(255,255,255,0.3)'}}>Pas encore de compte ? <span className="font-black" style={{color:'#D4AF37'}}>S'inscrire</span></button>
          )}
        </div>
      </div>
    </div>
  </div>
)}
</div>
)
}
export default App