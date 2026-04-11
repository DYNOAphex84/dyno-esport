import { useState, useEffect, useCallback, useRef } from 'react'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, getDoc, setDoc } from 'firebase/firestore'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const firebaseConfig={apiKey:"AIzaSyDXwItLM0OZ0VmHj-DLZcH8OBy7wXiHBsM",authDomain:"dyno-esport.firebaseapp.com",projectId:"dyno-esport",storageBucket:"dyno-esport.firebasestorage.app",messagingSenderId:"808658404731",appId:"1:808658404731:web:f3cf29142d3038816f29de"}
const app=initializeApp(firebaseConfig),db=getFirestore(app),auth=getAuth(app)
setPersistence(auth,browserLocalPersistence).catch(()=>{})
const DW='https://discord.com/api/webhooks/1489600048474886295/HfR7YhCRuDpjN6NCw133bShUF9Gj1gak-fWtTYVYgI2G_gllQ001kRfH0w57mUuCTytp'
const YT='https://youtube.com/@jonathanla890?si=eHtXG1hjlmCuZ-RC',LG='https://i.imgur.com/gTLj57a.png',AE='thibaut.llorens@hotmail.com'

// ✅ 8 maps officielles Rocket League seulement
const DRAFT_MAPS=['Atlantis','Engine','Horizon','Helios','Lunar','Polaris','The Cliff','Silva']
const AM=['Engine','Helios','Silva','The Cliff','Artefact','Outlaw','Atlantis','Horizon','Polaris','Lunar','Ceres']

// ✅ Séquence de draft officielle
// étape 0 = pile ou face, 1 = choix côté (gagnant), 2 = choix skin (perdant)
// 3 = ban (gagnant), 4 = ban (perdant), 5 = pick (perdant), 6 = pick (gagnant)
// 7 = ban (gagnant), 8 = ban (perdant), 9 = pick (perdant)
const DRAFT_SEQUENCE=[
  {step:0,type:'coin',label:'🪙 Pile ou Face',desc:'Admin lance la pièce et désigne le gagnant',who:'admin'},
  {step:1,type:'side',label:'🌍 Choix du côté',desc:'Équipe gagnante choisit son côté (Orange ou Bleu)',who:'winner'},
  {step:2,type:'skin',label:'🎨 Choix du skin',desc:"Équipe perdante choisit le skin de l'arène",who:'loser'},
  {step:3,type:'ban',label:'❌ Ban',desc:'Équipe gagnante banne une map',who:'winner'},
  {step:4,type:'ban',label:'❌ Ban',desc:'Équipe perdante banne une map',who:'loser'},
  {step:5,type:'pick',label:'✅ Pick',desc:'Équipe perdante pick une map',who:'loser'},
  {step:6,type:'pick',label:'✅ Pick',desc:'Équipe gagnante pick une map',who:'winner'},
  {step:7,type:'ban',label:'❌ Ban',desc:'Équipe gagnante banne une map',who:'winner'},
  {step:8,type:'ban',label:'❌ Ban',desc:'Équipe perdante banne une map',who:'loser'},
  {step:9,type:'pick',label:'✅ Pick final',desc:'Équipe perdante pick la dernière map',who:'loser'},
]

const THEMES:Record<string,any>={
  gold:{name:'Or/Noir',icon:'🥇',primary:'#D4AF37',primary2:'#FFD700',g:`linear-gradient(135deg,#D4AF37,#FFD700,#D4AF37)`,g2:`linear-gradient(135deg,#D4AF37 0%,#FFD700 50%,#B8860B 100%)`,dark:{bg:'radial-gradient(ellipse at top center,#100c00 0%,#050400 45%,#020200 100%)',card:'rgba(20,16,4,0.97)',cardBorder:'rgba(212,175,55,0.15)',text:'#f5f0e0',textMuted:'rgba(245,240,224,0.45)',input:'rgba(255,255,255,0.07)',inputBorder:'rgba(212,175,55,0.2)',navBg:'rgba(5,4,0,0.98)',navBorder:'rgba(212,175,55,0.1)',header:'rgba(6,5,0,0.97)'},light:{bg:'radial-gradient(ellipse at top center,#fffbea 0%,#fdf6d3 45%,#faf0c0 100%)',card:'rgba(255,250,220,0.97)',cardBorder:'rgba(180,140,20,0.25)',text:'#1a1200',textMuted:'rgba(30,20,0,0.5)',input:'rgba(180,140,20,0.1)',inputBorder:'rgba(180,140,20,0.3)',navBg:'rgba(255,248,200,0.99)',navBorder:'rgba(180,140,20,0.25)',header:'rgba(255,248,200,0.99)'}},
  red:{name:'Rouge/Noir',icon:'🔴',primary:'#ef4444',primary2:'#f87171',g:`linear-gradient(135deg,#ef4444,#f87171,#ef4444)`,g2:`linear-gradient(135deg,#dc2626 0%,#ef4444 50%,#b91c1c 100%)`,dark:{bg:'radial-gradient(ellipse at top center,#1a0000 0%,#0a0000 45%,#020000 100%)',card:'rgba(20,4,4,0.97)',cardBorder:'rgba(239,68,68,0.15)',text:'#fde8e8',textMuted:'rgba(253,232,232,0.45)',input:'rgba(255,255,255,0.07)',inputBorder:'rgba(239,68,68,0.2)',navBg:'rgba(8,0,0,0.98)',navBorder:'rgba(239,68,68,0.1)',header:'rgba(10,0,0,0.97)'},light:{bg:'radial-gradient(ellipse at top center,#fff0f0 0%,#fde8e8 45%,#fecaca 100%)',card:'rgba(255,240,240,0.97)',cardBorder:'rgba(220,38,38,0.25)',text:'#1a0000',textMuted:'rgba(30,0,0,0.5)',input:'rgba(220,38,38,0.08)',inputBorder:'rgba(220,38,38,0.25)',navBg:'rgba(255,240,240,0.99)',navBorder:'rgba(220,38,38,0.2)',header:'rgba(255,240,240,0.99)'}},
  blue:{name:'Bleu/Noir',icon:'🔵',primary:'#3b82f6',primary2:'#60a5fa',g:`linear-gradient(135deg,#3b82f6,#60a5fa,#3b82f6)`,g2:`linear-gradient(135deg,#2563eb 0%,#3b82f6 50%,#1d4ed8 100%)`,dark:{bg:'radial-gradient(ellipse at top center,#000d1a 0%,#000812 45%,#000408 100%)',card:'rgba(4,12,24,0.97)',cardBorder:'rgba(59,130,246,0.15)',text:'#e8f0fe',textMuted:'rgba(232,240,254,0.45)',input:'rgba(255,255,255,0.07)',inputBorder:'rgba(59,130,246,0.2)',navBg:'rgba(0,5,12,0.98)',navBorder:'rgba(59,130,246,0.1)',header:'rgba(0,6,14,0.97)'},light:{bg:'radial-gradient(ellipse at top center,#eff6ff 0%,#dbeafe 45%,#bfdbfe 100%)',card:'rgba(239,246,255,0.97)',cardBorder:'rgba(37,99,235,0.25)',text:'#001a40',textMuted:'rgba(0,26,64,0.5)',input:'rgba(37,99,235,0.08)',inputBorder:'rgba(37,99,235,0.25)',navBg:'rgba(239,246,255,0.99)',navBorder:'rgba(37,99,235,0.2)',header:'rgba(239,246,255,0.99)'}},
  purple:{name:'Violet/Noir',icon:'🟣',primary:'#a855f7',primary2:'#c084fc',g:`linear-gradient(135deg,#a855f7,#c084fc,#a855f7)`,g2:`linear-gradient(135deg,#9333ea 0%,#a855f7 50%,#7c3aed 100%)`,dark:{bg:'radial-gradient(ellipse at top center,#0d0014 0%,#07000d 45%,#030008 100%)',card:'rgba(14,4,22,0.97)',cardBorder:'rgba(168,85,247,0.15)',text:'#f3e8ff',textMuted:'rgba(243,232,255,0.45)',input:'rgba(255,255,255,0.07)',inputBorder:'rgba(168,85,247,0.2)',navBg:'rgba(6,0,10,0.98)',navBorder:'rgba(168,85,247,0.1)',header:'rgba(8,0,12,0.97)'},light:{bg:'radial-gradient(ellipse at top center,#faf5ff 0%,#f3e8ff 45%,#e9d5ff 100%)',card:'rgba(250,245,255,0.97)',cardBorder:'rgba(147,51,234,0.25)',text:'#1a0030',textMuted:'rgba(26,0,48,0.5)',input:'rgba(147,51,234,0.08)',inputBorder:'rgba(147,51,234,0.25)',navBg:'rgba(250,245,255,0.99)',navBorder:'rgba(147,51,234,0.2)',header:'rgba(250,245,255,0.99)'}}
}

const ROLES=['Joueur','Capitaine','Coach','Admin']
const ROLE_COLORS:Record<string,string>={Joueur:'rgba(255,255,255,0.3)',Capitaine:'rgba(212,175,55,0.8)',Coach:'rgba(96,165,250,0.8)',Admin:'rgba(239,68,68,0.8)'}

function App(){
const[isDark,setIsDark]=useState(()=>localStorage.getItem('dyno-theme')!=='light')
const[themeKey,setThemeKey]=useState(()=>localStorage.getItem('dyno-theme-color')||'gold')
const TH=THEMES[themeKey]
const T=isDark?TH.dark:TH.light
const P=TH.primary,P2=TH.primary2,G=TH.g,G2=TH.g2
const toggleTheme=()=>{const n=!isDark;setIsDark(n);localStorage.setItem('dyno-theme',n?'dark':'light')}
const setTheme=(k:string)=>{setThemeKey(k);localStorage.setItem('dyno-theme-color',k)}

// ✅ MODALE CENTRÉE - onMouseDown pour éviter fermeture clavier
const Mo=({onClose,children,title,sub}:{onClose:()=>void,children:any,title?:string,sub?:string})=>(
  <div className="fixed inset-0 z-50 flex items-center justify-center px-3"
    style={{background:'rgba(0,0,0,0.93)',backdropFilter:'blur(28px)'}}
    onMouseDown={(e:any)=>{if(e.target===e.currentTarget)onClose()}}>
    <div className="w-full max-w-sm rounded-3xl max-h-[88vh] overflow-y-auto"
      style={{background:isDark?'linear-gradient(170deg,#161208,#0d0a04,#080500)':'linear-gradient(170deg,#fffdf0,#fff8d6)',border:`1px solid ${T.cardBorder}`,boxShadow:'0 32px 80px rgba(0,0,0,0.9)'}}>
      <div className="sticky top-0 pt-4 pb-3 px-6 z-10" style={{background:isDark?'rgba(14,11,3,0.98)':'rgba(255,252,224,0.98)',borderBottom:`1px solid ${T.cardBorder}`}}>
        <div className="w-10 h-1 rounded-full mx-auto mb-3" style={{background:`${P}50`}}/>
        {title&&<h3 className="text-base font-black" style={{background:G,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{title}</h3>}
        {sub&&<p className="text-xs mt-0.5" style={{color:T.textMuted}}>{sub}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
)

const CS={background:T.card,border:`1px solid ${T.cardBorder}`,boxShadow:isDark?'0 8px 40px rgba(0,0,0,0.8),inset 0 1px 0 rgba(255,255,255,0.04)':'0 4px 24px rgba(0,0,0,0.08)',backdropFilter:'blur(24px)'}
const IS={background:T.input,border:`1px solid ${T.inputBorder}`,color:T.text}
const iCls='w-full rounded-2xl px-4 py-3.5 text-sm font-medium focus:outline-none transition-all'
const[showConfetti,setShowConfetti]=useState(false)
const triggerConfetti=()=>{setShowConfetti(true);setTimeout(()=>setShowConfetti(false),3500)}
const[unreadCount,setUnreadCount]=useState(0)
const[lastSeenMatchs,setLastSeenMatchs]=useState(()=>parseInt(localStorage.getItem('dyno-seen-matchs')||'0'))
const[lastSeenNotes,setLastSeenNotes]=useState(()=>parseInt(localStorage.getItem('dyno-seen-notes')||'0'))

const[activeTab,setActiveTab]=useState('matchs')
const[isAdmin,setIsAdmin]=useState(false)
const[userRole,setUserRole]=useState('Joueur')
const[adminPassword,setAdminPassword]=useState('')
const[showSplash,setShowSplash]=useState(true)
const[loading,setLoading]=useState(true)
const[user,setUser]=useState<any>(null)
const[pseudo,setPseudo]=useState('')
const[email,setEmail]=useState('')
const[authPassword,setAuthPassword]=useState('')
const[isSignUp,setIsSignUp]=useState(false)
const[matchs,setMatchs]=useState<any[]>([])
const[replays,setReplays]=useState<any[]>([])
const[joueurs,setJoueurs]=useState<any[]>([])
const[notes,setNotes]=useState<any[]>([])
const[strats,setStrats]=useState<any[]>([])
const[commentaires,setCommentaires]=useState<any[]>([])
const[compos,setCompos]=useState<any[]>([])
const[analyses,setAnalyses]=useState<any[]>([])
const[fichesAdversaires,setFichesAdversaires]=useState<any[]>([])
const[sondages,setSondages]=useState<any[]>([])
const[drafts,setDrafts]=useState<any[]>([])
const[nouveauMatch,setNouveauMatch]=useState({adversaire:'',date:'',horaire1:'',horaire2:'',arene:'Arène 1',type:'Ligue',sousMatchs:[] as {adversaire:string,scoreDyno:string,scoreAdv:string}[]})
const[scoreEdit,setScoreEdit]=useState<any>(null)
const[nouveauReplay,setNouveauReplay]=useState({titre:'',lien:''})
const[nouvelleNote,setNouvelleNote]=useState({matchId:'',mental:0,communication:0,gameplay:0})
const[selectedMatchForNotes,setSelectedMatchForNotes]=useState<any>(null)
const[nouvelleStrat,setNouvelleStrat]=useState({adversaire:'',picks:[] as string[],bans:[] as string[]})
const[showAddStrat,setShowAddStrat]=useState(false)
const[deferredPrompt,setDeferredPrompt]=useState<any>(null)
const[showInstall,setShowInstall]=useState(false)
const[countdowns,setCountdowns]=useState<Record<string,string>>({})
const[nouveauCommentaire,setNouveauCommentaire]=useState('')
const[selectedMatchForComment,setSelectedMatchForComment]=useState<any>(null)
const[notificationsEnabled,setNotificationsEnabled]=useState(false)
const[notifiedMatchs,setNotifiedMatchs]=useState<string[]>([])
const[selectedMapCompo,setSelectedMapCompo]=useState('')
const[compoJoueurs,setCompoJoueurs]=useState<string[]>([])
const[showAddCompo,setShowAddCompo]=useState(false)
const[anniversaire,setAnniversaire]=useState('')
const[viewMode,setViewMode]=useState<'list'|'grid'>('list')
const[pullDistance,setPullDistance]=useState(0)
const[isRefreshing,setIsRefreshing]=useState(false)
const[showBilan,setShowBilan]=useState(false)
const[selectedMatchForAnalyse,setSelectedMatchForAnalyse]=useState<any>(null)
const[nouvelleAnalyse,setNouvelleAnalyse]=useState({bien:'',mal:'',plan:''})
const[showAddFiche,setShowAddFiche]=useState(false)
const[nouvelleFiche,setNouvelleFiche]=useState({adversaire:'',forces:'',faiblesses:'',notes:''})
const[newSubAdv,setNewSubAdv]=useState('')
const[newSubScoreDyno,setNewSubScoreDyno]=useState('')
const[newSubScoreAdv,setNewSubScoreAdv]=useState('')
const[noteEdit,setNoteEdit]=useState<any>(null)
const[showAddSondage,setShowAddSondage]=useState(false)
const[nouveauSondage,setNouveauSondage]=useState({question:'',options:['',''] as string[]})
const[showNotifSettings,setShowNotifSettings]=useState(false)
const[notifSettings,setNotifSettings]=useState(()=>{try{return JSON.parse(localStorage.getItem('dyno-notif-settings')||'{"match":true,"note":true,"commentaire":true,"strat":true,"resultat":true}')}catch{return{match:true,note:true,commentaire:true,strat:true,resultat:true}}})
const saveNotifSettings=(s:any)=>{setNotifSettings(s);localStorage.setItem('dyno-notif-settings',JSON.stringify(s))}
const[showAddDraft,setShowAddDraft]=useState(false)
const[nouvelleDraft,setNouvelleDraft]=useState({adversaire:'',equipe1:'DYNO',equipe2:''})
const pm=useRef(0),pn=useRef(0),pc=useRef(0),ps=useRef(0),ty=useRef(0)

useEffect(()=>{if(window.location.search.includes('reset=1')){localStorage.clear();window.location.href=window.location.pathname}},[])
const sendNotification=useCallback((t:string,b:string,tg?:string)=>{try{if(!('Notification' in window)||Notification.permission!=='granted')return;const n=new Notification(t,{body:b,icon:LG,badge:LG,tag:tg||'d',requireInteraction:false});n.onclick=()=>{window.focus();n.close()}}catch{}},[])
const requestNotificationPermission=async()=>{try{if(!('Notification' in window)){alert('❌');return};const p=await Notification.requestPermission();if(p==='granted'){setNotificationsEnabled(true);localStorage.setItem('dyno-notifs','true')}else{setNotificationsEnabled(false);localStorage.setItem('dyno-notifs','false')}}catch{}}
const getMatchDateTime=useCallback((m:any):Date|null=>{if(!m?.date)return null;let d=m.date;const t=m.horaires?.[0]||m.horaire1||'20:00';if(d.includes('/')){const[dd,mm,yy]=d.split('/');d=`${yy}-${mm}-${dd}`};try{const dt=new Date(`${d}T${t}:00`);return isNaN(dt.getTime())?null:dt}catch{return null}},[])

useEffect(()=>{try{if('Notification' in window&&Notification.permission==='granted'&&localStorage.getItem('dyno-notifs')==='true')setNotificationsEnabled(true)}catch{};try{setNotifiedMatchs(JSON.parse(localStorage.getItem('dyno-notified')||'[]'))}catch{setNotifiedMatchs([])}},[])
useEffect(()=>{if(!notificationsEnabled)return;try{if(!('Notification' in window)||Notification.permission!=='granted')return}catch{return};const ck=()=>{const now=new Date();matchs.forEach((m:any)=>{if(m.termine)return;const mt=getMatchDateTime(m);if(!mt)return;const dm=(mt.getTime()-now.getTime())/60000;const k1=`${m.id}-1h`;if(dm>55&&dm<=65&&!notifiedMatchs.includes(k1)&&notifSettings.match){sendNotification('🎮 Match dans 1h!',`DYNO vs ${m.adversaire}`,'m1h');const u=[...notifiedMatchs,k1];setNotifiedMatchs(u);localStorage.setItem('dyno-notified',JSON.stringify(u))};const k2=`${m.id}-15m`;if(dm>10&&dm<=20&&!notifiedMatchs.includes(k2)&&notifSettings.match){sendNotification('🔥 15min!',`DYNO vs ${m.adversaire}`,'m15');const u=[...notifiedMatchs,k2];setNotifiedMatchs(u);localStorage.setItem('dyno-notified',JSON.stringify(u))};const k3=`${m.id}-now`;if(dm>=-2&&dm<=3&&!notifiedMatchs.includes(k3)&&notifSettings.match){sendNotification('⚡ Go!',`DYNO vs ${m.adversaire}`,'mnow');const u=[...notifiedMatchs,k3];setNotifiedMatchs(u);localStorage.setItem('dyno-notified',JSON.stringify(u))}})};ck();const i=setInterval(ck,60000);return()=>clearInterval(i)},[notificationsEnabled,matchs,notifiedMatchs,sendNotification,getMatchDateTime,notifSettings])
useEffect(()=>{const u=()=>{const now=new Date(),c:Record<string,string>={};matchs.forEach((m:any)=>{if(m.termine)return;const mt=getMatchDateTime(m);if(!mt)return;const df=mt.getTime()-now.getTime();if(df<=0){c[m.id]='EN COURS';return};const j=Math.floor(df/86400000),h=Math.floor((df%86400000)/3600000),mi=Math.floor((df%3600000)/60000),s=Math.floor((df%60000)/1000);c[m.id]=`${j>0?j+'j ':''} ${(h>0||j>0)?h+'h ':''} ${mi}m ${s}s`});setCountdowns(c)};u();const i=setInterval(u,1000);return()=>clearInterval(i)},[matchs,getMatchDateTime])
useEffect(()=>{if(localStorage.getItem('dyno-admin')==='true')setIsAdmin(true)},[])
useEffect(()=>{const unsub=onAuthStateChanged(auth,async(u:any)=>{setUser(u);if(u){const d=await getDoc(doc(db,'users',u.uid));if(d.exists()){const data=d.data();setPseudo(data.pseudo||'');if(data.anniversaire)setAnniversaire(data.anniversaire);if(data.role)setUserRole(data.role);if(u.email===AE||data.isAdmin){setIsAdmin(true);setUserRole('Admin');localStorage.setItem('dyno-admin','true')}}};setLoading(false)});return()=>unsub()},[])

useEffect(()=>{const q=query(collection(db,'matchs'),orderBy('createdAt','desc'));return onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setMatchs(d)})},[])
useEffect(()=>{const q=query(collection(db,'notes'),orderBy('createdAt','desc'));return onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setNotes(d)})},[])
useEffect(()=>{const q=query(collection(db,'commentaires'),orderBy('createdAt','desc'));return onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setCommentaires(d)})},[])
useEffect(()=>{const q=query(collection(db,'strats'),orderBy('createdAt','desc'));return onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setStrats(d)})},[])
useEffect(()=>{const q=query(collection(db,'replays'),orderBy('createdAt','desc'));return onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setReplays(d)})},[])
useEffect(()=>{const q=query(collection(db,'players'),orderBy('createdAt','desc'));return onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setJoueurs(d)})},[])
useEffect(()=>{const q=query(collection(db,'compos'),orderBy('createdAt','desc'));return onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setCompos(d)})},[])
useEffect(()=>{const q=query(collection(db,'analyses'),orderBy('createdAt','desc'));return onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setAnalyses(d)})},[])
useEffect(()=>{const q=query(collection(db,'fichesAdversaires'),orderBy('createdAt','desc'));return onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setFichesAdversaires(d)})},[])
useEffect(()=>{const q=query(collection(db,'sondages'),orderBy('createdAt','desc'));return onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setSondages(d)})},[])
useEffect(()=>{const q=query(collection(db,'drafts'),orderBy('createdAt','desc'));return onSnapshot(q,(s:any)=>{const d:any[]=[];s.forEach((x:any)=>d.push({id:x.id,...x.data()}));setDrafts(d)})},[])

useEffect(()=>{const newM=matchs.length-lastSeenMatchs;const newN=notes.length-lastSeenNotes;const total=Math.max(0,newM)+Math.max(0,newN);setUnreadCount(total)},[matchs,notes,lastSeenMatchs,lastSeenNotes])
const markAllRead=()=>{setLastSeenMatchs(matchs.length);setLastSeenNotes(notes.length);localStorage.setItem('dyno-seen-matchs',String(matchs.length));localStorage.setItem('dyno-seen-notes',String(notes.length));setUnreadCount(0)}

useEffect(()=>{if(!notificationsEnabled||pm.current===0){pm.current=matchs.length;return};if(matchs.length>pm.current&&notifSettings.match){const n=matchs[0];if(n)sendNotification('📅 Nouveau match!',`DYNO vs ${n.adversaire}`,'nm')};pm.current=matchs.length},[matchs,notificationsEnabled,sendNotification,notifSettings])
useEffect(()=>{if(!notificationsEnabled||pn.current===0){pn.current=notes.length;return};if(notes.length>pn.current&&notifSettings.note){const n=notes[0];if(n)sendNotification('📊 Nouvelle note!',`${n.joueur}`,'nn')};pn.current=notes.length},[notes,notificationsEnabled,sendNotification,notifSettings])
useEffect(()=>{if(!notificationsEnabled||pc.current===0){pc.current=commentaires.length;return};if(commentaires.length>pc.current&&notifSettings.commentaire){const n=commentaires[0];if(n)sendNotification('💬 Commentaire!',`${n.joueur}: ${n.texte.substring(0,50)}`,'nc')};pc.current=commentaires.length},[commentaires,notificationsEnabled,sendNotification,notifSettings])
useEffect(()=>{if(!notificationsEnabled||ps.current===0){ps.current=strats.length;return};if(strats.length>ps.current&&notifSettings.strat){const n=strats[0];if(n)sendNotification('🎯 Nouvelle strat!',`DYNO vs ${n.adversaire}`,'ns')};ps.current=strats.length},[strats,notificationsEnabled,sendNotification,notifSettings])
useEffect(()=>{const t=setTimeout(()=>setShowSplash(false),2800);return()=>clearTimeout(t)},[])
useEffect(()=>{window.addEventListener('beforeinstallprompt',(e:any)=>{e.preventDefault();setDeferredPrompt(e);setShowInstall(true)})},[])

const handleInstall=()=>{if(deferredPrompt){deferredPrompt.prompt();setDeferredPrompt(null);setShowInstall(false)}}
const handleSignUp=async()=>{if(!email||!authPassword||!pseudo){alert('⚠️ Remplis tout!');return};try{const r=await createUserWithEmailAndPassword(auth,email,authPassword);await setDoc(doc(db,'users',r.user.uid),{pseudo,email,role:'Joueur',createdAt:Date.now(),isAdmin:email===AE});await addDoc(collection(db,'players'),{pseudo,role:'Joueur',userId:r.user.uid,createdAt:Date.now()});alert('✅');setIsSignUp(false);setEmail('');setAuthPassword('')}catch(e:any){alert('❌ '+e.message)}}
const handleSignIn=async()=>{if(!email||!authPassword){alert('⚠️');return};try{await setPersistence(auth,browserLocalPersistence);await signInWithEmailAndPassword(auth,email,authPassword);localStorage.setItem('user-email',email);alert('✅');setEmail('');setAuthPassword('')}catch(e:any){alert('❌ '+e.message)}}
const handleSignOut=async()=>{await signOut(auth);setPseudo('');setIsAdmin(false);setUserRole('Joueur');localStorage.removeItem('dyno-admin');localStorage.removeItem('user-email')}
const handleAdminLogin=()=>{if(adminPassword==='dyno2026'){setIsAdmin(true);localStorage.setItem('dyno-admin','true');setAdminPassword('')}else alert('❌')}
const handleAdminLogout=()=>{setIsAdmin(false);localStorage.removeItem('dyno-admin')}
const updatePlayerRole=async(playerId:string,userId:string,newRole:string)=>{await updateDoc(doc(db,'players',playerId),{role:newRole});if(userId)await updateDoc(doc(db,'users',userId),{role:newRole});alert('✅ Rôle mis à jour!')}

const canAddStrat=isAdmin||userRole==='Coach'||userRole==='Capitaine'
const canAddFiche=isAdmin||userRole==='Coach'
const canCreateSondage=isAdmin
const canCreateDraft=isAdmin

const ajouterSousMatch=()=>{if(!newSubAdv.trim()||newSubScoreDyno===''||newSubScoreAdv===''){alert('⚠️');return};setNouveauMatch({...nouveauMatch,sousMatchs:[...nouveauMatch.sousMatchs,{adversaire:newSubAdv.trim(),scoreDyno:newSubScoreDyno,scoreAdv:newSubScoreAdv}]});setNewSubAdv('');setNewSubScoreDyno('');setNewSubScoreAdv('')}
const supprimerSousMatch=(i:number)=>{const sm=[...nouveauMatch.sousMatchs];sm.splice(i,1);setNouveauMatch({...nouveauMatch,sousMatchs:sm})}
const ajouterSousMatchEdit=()=>{if(!scoreEdit)return;const adv=scoreEdit._newSubAdv||'',sd=scoreEdit._newSubScoreDyno||'',sa=scoreEdit._newSubScoreAdv||'';if(!adv.trim()||sd===''||sa===''){alert('⚠️');return};const sousMatchs=[...(scoreEdit.sousMatchs||[]),{adversaire:adv.trim(),scoreDyno:sd,scoreAdv:sa}];setScoreEdit({...scoreEdit,sousMatchs,_newSubAdv:'',_newSubScoreDyno:'',_newSubScoreAdv:''})}
const supprimerSousMatchEdit=(i:number)=>{if(!scoreEdit)return;const sm=[...(scoreEdit.sousMatchs||[])];sm.splice(i,1);setScoreEdit({...scoreEdit,sousMatchs:sm})}
const ajouterMatch=async()=>{if(!nouveauMatch.adversaire||!nouveauMatch.date||!nouveauMatch.horaire1){alert('⚠️');return};const md:any={...nouveauMatch,termine:false,disponibles:[],indisponibles:[],createdAt:Date.now()};if(nouveauMatch.type==='Division'&&nouveauMatch.sousMatchs.length>0){md.termine=true;md.sousMatchs=nouveauMatch.sousMatchs;md.scoreDyno=nouveauMatch.sousMatchs.reduce((a:number,s:any)=>a+parseInt(s.scoreDyno||0),0);md.scoreAdversaire=nouveauMatch.sousMatchs.reduce((a:number,s:any)=>a+parseInt(s.scoreAdv||0),0)};await addDoc(collection(db,'matchs'),md);const h=[nouveauMatch.horaire1];if(nouveauMatch.horaire2)h.push(nouveauMatch.horaire2);try{await fetch(DW,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({embeds:[{title:'🎮 DYNO vs '+nouveauMatch.adversaire,color:13934871,fields:[{name:'⚔️',value:nouveauMatch.adversaire,inline:true},{name:'📅',value:nouveauMatch.date,inline:true},{name:'⏰',value:h.join(' / '),inline:true},{name:'🏟️',value:nouveauMatch.arene,inline:true},{name:'📊',value:nouveauMatch.type,inline:true}],footer:{text:'DYNO',icon_url:LG}}]})})}catch{};setNouveauMatch({adversaire:'',date:'',horaire1:'',horaire2:'',arene:'Arène 1',type:'Ligue',sousMatchs:[]});setNewSubAdv('');setNewSubScoreDyno('');setNewSubScoreAdv('');alert('✅')}
const ajouterReplay=async()=>{if(!nouveauReplay.titre||!nouveauReplay.lien){alert('⚠️');return};await addDoc(collection(db,'replays'),{...nouveauReplay,createdAt:Date.now()});setNouveauReplay({titre:'',lien:''});alert('✅')}
const ajouterNote=async()=>{if(!user)return;await addDoc(collection(db,'notes'),{matchId:selectedMatchForNotes?.id,joueur:pseudo,joueurId:user.uid,mental:String(nouvelleNote.mental),communication:String(nouvelleNote.communication),gameplay:String(nouvelleNote.gameplay),createdAt:Date.now()});setNouvelleNote({matchId:'',mental:0,communication:0,gameplay:0});setSelectedMatchForNotes(null);alert('✅')}
const ajouterCommentaire=async(id:string)=>{if(!user||!nouveauCommentaire.trim())return;await addDoc(collection(db,'commentaires'),{matchId:id,joueur:pseudo,joueurId:user.uid,texte:nouveauCommentaire.trim(),createdAt:Date.now()});setNouveauCommentaire('');setSelectedMatchForComment(null)}
const ajouterStrat=async()=>{if(!nouvelleStrat.adversaire||nouvelleStrat.picks.length===0||nouvelleStrat.bans.length===0){alert('⚠️');return};await addDoc(collection(db,'strats'),{adversaire:nouvelleStrat.adversaire,picks:nouvelleStrat.picks,bans:nouvelleStrat.bans,auteur:pseudo,auteurId:user?.uid,createdAt:Date.now()});setNouvelleStrat({adversaire:'',picks:[],bans:[]});setShowAddStrat(false);alert('✅')}
const ajouterCompo=async()=>{if(!selectedMapCompo||compoJoueurs.length===0){alert('⚠️');return};const ex=compos.find((c:any)=>c.map===selectedMapCompo);if(ex){await updateDoc(doc(db,'compos',ex.id),{joueurs:compoJoueurs,updatedAt:Date.now()})}else{await addDoc(collection(db,'compos'),{map:selectedMapCompo,joueurs:compoJoueurs,auteur:pseudo,createdAt:Date.now()})};setShowAddCompo(false);setSelectedMapCompo('');setCompoJoueurs([]);alert('✅')}
const toggleCompoJoueur=(n:string)=>{if(compoJoueurs.includes(n))setCompoJoueurs(compoJoueurs.filter(j=>j!==n));else setCompoJoueurs([...compoJoueurs,n])}
const sauvegarderAnniversaire=async()=>{if(!user||!anniversaire)return;await updateDoc(doc(db,'users',user.uid),{anniversaire});alert('✅')}
const ajouterAnalyse=async(mid:string)=>{if(!user)return;await addDoc(collection(db,'analyses'),{matchId:mid,joueur:pseudo,joueurId:user.uid,...nouvelleAnalyse,createdAt:Date.now()});setNouvelleAnalyse({bien:'',mal:'',plan:''});setSelectedMatchForAnalyse(null);alert('✅')}
const ajouterFiche=async()=>{if(!nouvelleFiche.adversaire.trim())return;await addDoc(collection(db,'fichesAdversaires'),{...nouvelleFiche,auteur:pseudo,auteurId:user?.uid,createdAt:Date.now()});setNouvelleFiche({adversaire:'',forces:'',faiblesses:'',notes:''});setShowAddFiche(false);alert('✅')}
const del=async(col:string,id:string)=>{await deleteDoc(doc(db,col,id))}
const updateScore=async()=>{if(!scoreEdit)return;if(scoreEdit.type==='Division'){const sm=scoreEdit.sousMatchs||[];const td=sm.reduce((a:number,s:any)=>a+parseInt(s.scoreDyno||0),0);const ta=sm.reduce((a:number,s:any)=>a+parseInt(s.scoreAdv||0),0);await updateDoc(doc(db,'matchs',scoreEdit.id),{sousMatchs:sm,scoreDyno:sm.length>0?td:parseInt(scoreEdit.scoreDyno||0),scoreAdversaire:sm.length>0?ta:parseInt(scoreEdit.scoreAdv||0),termine:true})}else{const ds=parseInt(scoreEdit.scoreDyno);const as2=parseInt(scoreEdit.scoreAdv);await updateDoc(doc(db,'matchs',scoreEdit.id),{scoreDyno:ds,scoreAdversaire:as2,termine:true});if(ds>as2)triggerConfetti()};setScoreEdit(null);alert('✅')}
const updateNote=async()=>{if(!noteEdit)return;const mental=Math.min(10,Math.max(0,parseInt(noteEdit.mental)||0));const communication=Math.min(10,Math.max(0,parseInt(noteEdit.communication)||0));const gameplay=Math.min(10,Math.max(0,parseInt(noteEdit.gameplay)||0));await updateDoc(doc(db,'notes',noteEdit.id),{mental:String(mental),communication:String(communication),gameplay:String(gameplay),updatedAt:Date.now()});setNoteEdit(null);alert('✅')}
const toggleDispo=async(mid:string)=>{if(!user)return;const m=matchs.find((x:any)=>x.id===mid);if(!m)return;const d=m.disponibles||[],i=m.indisponibles||[];await updateDoc(doc(db,'matchs',mid),{disponibles:d.includes(pseudo)?d.filter((p:string)=>p!==pseudo):[...d,pseudo],indisponibles:i.filter((p:string)=>p!==pseudo)})}
const toggleIndispo=async(mid:string)=>{if(!user)return;const m=matchs.find((x:any)=>x.id===mid);if(!m)return;const d=m.disponibles||[],i=m.indisponibles||[];await updateDoc(doc(db,'matchs',mid),{indisponibles:i.includes(pseudo)?i.filter((p:string)=>p!==pseudo):[...i,pseudo],disponibles:d.filter((p:string)=>p!==pseudo)})}
const ajouterSondage=async()=>{if(!nouveauSondage.question.trim()||nouveauSondage.options.filter((o:string)=>o.trim()).length<2){alert('⚠️ Question + 2 options min!');return};const opts=nouveauSondage.options.filter((o:string)=>o.trim()).reduce((acc:any,o:string)=>{acc[o]={label:o,votes:[]};return acc},{});await addDoc(collection(db,'sondages'),{question:nouveauSondage.question.trim(),options:opts,auteur:pseudo,auteurId:user?.uid,actif:true,createdAt:Date.now()});setNouveauSondage({question:'',options:['','']});setShowAddSondage(false);alert('✅')}
const voterSondage=async(sid:string,ok:string)=>{if(!user)return;const s=sondages.find((x:any)=>x.id===sid);if(!s)return;const opts={...s.options};Object.keys(opts).forEach(k=>{opts[k]={...opts[k],votes:(opts[k].votes||[]).filter((v:string)=>v!==user.uid)}});opts[ok]={...opts[ok],votes:[...(opts[ok].votes||[]),user.uid]};await updateDoc(doc(db,'sondages',sid),{options:opts})}
const clotureSondage=async(id:string)=>{await updateDoc(doc(db,'sondages',id),{actif:false})}

// ✅ DRAFT - Fonctions complètes
const creerDraft=async()=>{
  if(!nouvelleDraft.adversaire.trim()||!nouvelleDraft.equipe2.trim()){alert('⚠️ Remplis tous les champs!');return}
  await addDoc(collection(db,'drafts'),{
    adversaire:nouvelleDraft.adversaire.trim(),
    equipe1:nouvelleDraft.equipe1,
    equipe2:nouvelleDraft.equipe2.trim(),
    currentStep:0,
    winner:'',
    winnerSide:'',
    loserSkin:'',
    picks:[],
    bans:[],
    actions:[],
    actif:true,
    auteur:pseudo,
    createdAt:Date.now()
  })
  setNouvelleDraft({adversaire:'',equipe1:'DYNO',equipe2:''})
  setShowAddDraft(false)
  alert('✅ Draft créée!')
}
const draftCoinResult=async(draftId:string,winnerId:string)=>{
  await updateDoc(doc(db,'drafts',draftId),{winner:winnerId,currentStep:1,actions:[{step:0,type:'coin',label:`🪙 ${winnerId} remporte le pile ou face`,at:Date.now()}]})
}
const draftSideChoice=async(draftId:string,side:string)=>{
  const d=drafts.find((x:any)=>x.id===draftId)
  if(!d)return
  const actions=[...(d.actions||[]),{step:1,type:'side',label:`🌍 ${d.winner} choisit le côté ${side}`,at:Date.now()}]
  await updateDoc(doc(db,'drafts',draftId),{winnerSide:side,currentStep:2,actions})
}
const draftSkinChoice=async(draftId:string,skin:string)=>{
  const d=drafts.find((x:any)=>x.id===draftId)
  if(!d)return
  const loser=d.winner===d.equipe1?d.equipe2:d.equipe1
  const actions=[...(d.actions||[]),{step:2,type:'skin',label:`🎨 ${loser} choisit le skin : ${skin}`,at:Date.now()}]
  await updateDoc(doc(db,'drafts',draftId),{loserSkin:skin,currentStep:3,actions})
}
const draftMapAction=async(draftId:string,map:string)=>{
  const d=drafts.find((x:any)=>x.id===draftId)
  if(!d||!d.actif)return
  const step=d.currentStep
  const seq=DRAFT_SEQUENCE[step]
  if(!seq||seq.type==='coin'||seq.type==='side'||seq.type==='skin')return
  const who=seq.who==='winner'?d.winner:(d.winner===d.equipe1?d.equipe2:d.equipe1)
  const newActions=[...(d.actions||[]),{step,type:seq.type,map,label:`${seq.type==='pick'?'✅ Pick':'❌ Ban'} ${map} par ${who}`,at:Date.now()}]
  const newPicks=seq.type==='pick'?[...(d.picks||[]),map]:d.picks||[]
  const newBans=seq.type==='ban'?[...(d.bans||[]),map]:d.bans||[]
  const nextStep=step+1
  const isFinished=nextStep>=DRAFT_SEQUENCE.length
  await updateDoc(doc(db,'drafts',draftId),{picks:newPicks,bans:newBans,actions:newActions,currentStep:nextStep,actif:!isFinished})
}
const resetDraft=async(draftId:string)=>{
  const d=drafts.find((x:any)=>x.id===draftId)
  if(!d)return
  await updateDoc(doc(db,'drafts',draftId),{currentStep:0,winner:'',winnerSide:'',loserSkin:'',picks:[],bans:[],actions:[],actif:true})
}

const fdf=(s:string)=>{if(!s)return'';if(s.includes('/'))return s;const[y,m,d]=s.split('-');return`${d}/${m}/${y}`}
const fts=(t:number)=>{const d=new Date(t);return`${d.toLocaleDateString('fr-FR')} ${d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}`}
const atc=(m:any)=>{try{if(!m?.date)return;let y:string,mo:string,d:string;if(m.date.includes('/')){const[dd,mm,yy]=m.date.split('/');d=dd;mo=mm;y=yy}else{const[yy,mm,dd]=m.date.split('-');y=yy;mo=mm;d=dd};const md=`${y}${mo}${d}`;let h='20',mi='00';if(m.horaires?.length>0){const[hh,mm]=m.horaires[0].split(':');h=hh;mi=mm||'00'}else if(m.horaire1){const[hh,mm]=m.horaire1.split(':');h=hh;mi=mm||'00'};const st=`${h}${mi}00`,et=`${(parseInt(h)+2).toString().padStart(2,'0')}${mi}00`;if(/iPad|iPhone|iPod/.test(navigator.userAgent)){const ics=`BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:${m.id}@d\nDTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').split('.')[0]}Z\nDTSTART:${md}T${st}\nDTEND:${md}T${et}\nSUMMARY:DYNO vs ${m.adversaire}\nLOCATION:${m.arene}\nEND:VEVENT\nEND:VCALENDAR`;const b=new Blob([ics],{type:'text/calendar'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=`D_${m.adversaire}.ics`;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(u)}else{window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`DYNO vs ${m.adversaire}`)}&dates=${md}T${st}/${md}T${et}&location=${encodeURIComponent(m.arene)}`,'_blank')}}catch(e:any){alert('❌ '+e.message)}}
const hts=(e:React.TouchEvent)=>{ty.current=e.touches[0].clientY}
const htm=(e:React.TouchEvent)=>{if(window.scrollY>0)return;const d=e.touches[0].clientY-ty.current;if(d>0)setPullDistance(Math.min(d*0.4,80))}
const hte=()=>{if(pullDistance>60){setIsRefreshing(true);setTimeout(()=>window.location.reload(),500)};setPullDistance(0)}
const toggleMap=(map:string,type:'picks'|'bans')=>{if(type==='picks'){if(nouvelleStrat.picks.includes(map))setNouvelleStrat({...nouvelleStrat,picks:nouvelleStrat.picks.filter(m=>m!==map)});else if(nouvelleStrat.picks.length<4)setNouvelleStrat({...nouvelleStrat,picks:[...nouvelleStrat.picks,map]})}else{if(nouvelleStrat.bans.includes(map))setNouvelleStrat({...nouvelleStrat,bans:nouvelleStrat.bans.filter(m=>m!==map)});else if(nouvelleStrat.bans.length<4)setNouvelleStrat({...nouvelleStrat,bans:[...nouvelleStrat.bans,map]})}}

const victoires=matchs.filter((m:any)=>m.termine&&Number(m.scoreDyno||0)>Number(m.scoreAdversaire||0)).length
const defaites=matchs.filter((m:any)=>m.termine&&Number(m.scoreDyno||0)<Number(m.scoreAdversaire||0)).length
const totalMatchs=victoires+defaites,winRate=totalMatchs>0?Math.round((victoires/totalMatchs)*100):0
const prochainsMatchs=matchs.filter((m:any)=>!m.termine).sort((a:any,b:any)=>new Date(`${a.date}T${a.horaires?.[0]||a.horaire1||'20:00'}`).getTime()-new Date(`${b.date}T${b.horaires?.[0]||b.horaire1||'20:00'}`).getTime())
const historique=matchs.filter((m:any)=>m.termine)
const ytId=(url:string)=>{const m=url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);return m?m[1]:null}
const winRateData=historique.slice().reverse().map((m:any,i:number)=>{const sub=historique.slice().reverse().slice(0,i+1);const w=sub.filter((x:any)=>Number(x.scoreDyno||0)>Number(x.scoreAdversaire||0)).length;return{name:`M${i+1}`,wr:Math.round((w/(i+1))*100),win:Number(m.scoreDyno||0)>Number(m.scoreAdversaire||0)?1:0}})
const typeData=['Ligue','Scrim','Tournoi','Division'].map(t=>({name:t,matchs:historique.filter((m:any)=>m.type===t).length,victoires:historique.filter((m:any)=>m.type===t&&Number(m.scoreDyno||0)>Number(m.scoreAdversaire||0)).length})).filter((d:any)=>d.matchs>0)
const notesData=notes.reduce((acc:any,n:any)=>{const j=n.joueur;if(!acc[j])acc[j]={joueur:j,mental:0,comm:0,perf:0,count:0};acc[j].mental+=parseInt(n.mental||0);acc[j].comm+=parseInt(n.communication||0);acc[j].perf+=parseInt(n.gameplay||0);acc[j].count++;return acc},{})
const notesChartData=Object.values(notesData).map((d:any)=>({name:d.joueur.substring(0,8),mental:Math.round(d.mental/d.count),comm:Math.round(d.comm/d.count),perf:Math.round(d.perf/d.count)}))
const genBilan=()=>{const now=new Date();const mm=historique.filter((m:any)=>{const d=new Date(m.createdAt);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear()});const w=mm.filter((m:any)=>Number(m.scoreDyno||0)>Number(m.scoreAdversaire||0)).length,l=mm.filter((m:any)=>Number(m.scoreDyno||0)<Number(m.scoreAdversaire||0)).length;const mn=notes.filter((n:any)=>{const d=new Date(n.createdAt);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear()});const am=mn.length>0?Math.round(mn.reduce((a:number,n:any)=>a+parseInt(n.mental||0),0)/mn.length):0,ac=mn.length>0?Math.round(mn.reduce((a:number,n:any)=>a+parseInt(n.communication||0),0)/mn.length):0,ap=mn.length>0?Math.round(mn.reduce((a:number,n:any)=>a+parseInt(n.gameplay||0),0)/mn.length):0;return{nom:['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'][now.getMonth()],m:mm.length,w,l,wr:mm.length>0?Math.round((w/(w+l||1))*100):0,am,ac,ap}}

const GBtn=({onClick,children,cls='',danger=false,small=false}:{onClick:()=>void,children:any,cls?:string,danger?:boolean,small?:boolean})=>(
  <button onClick={onClick} className={`${small?'py-2.5 text-xs':'py-4 text-sm'} w-full rounded-2xl font-black tracking-wide transition-all active:scale-[0.97] select-none ${cls}`} style={danger?{background:'rgba(239,68,68,0.1)',color:'#f87171',border:'1px solid rgba(239,68,68,0.2)'}:{background:G2,color:'#000',boxShadow:`0 4px 24px ${P}50`}}>{children}</button>
)
const Bdg=({type}:{type:string})=>{const map:Record<string,{bg:string,color:string}>={Ligue:{bg:'rgba(59,130,246,0.15)',color:'#60a5fa'},Scrim:{bg:'rgba(34,197,94,0.15)',color:'#4ade80'},Tournoi:{bg:'rgba(168,85,247,0.15)',color:'#c084fc'},Division:{bg:'rgba(245,158,11,0.15)',color:'#fbbf24'}};const s=map[type]||{bg:'rgba(255,255,255,0.08)',color:T.textMuted};return<span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest" style={{background:s.bg,color:s.color,border:`1px solid ${s.color}30`}}>{type}</span>}
const ST=({icon,title}:{icon:string,title:string})=>(
  <div className="relative rounded-3xl p-7 mb-6 text-center overflow-hidden" style={{background:isDark?`linear-gradient(145deg,${P}12,${P}05,transparent)`:`linear-gradient(145deg,${P}25,${P}10)`,border:`1px solid ${T.cardBorder}`}}>
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px" style={{background:`linear-gradient(90deg,transparent,${P},transparent)`}}/>
    <img src={LG} alt="D" className="w-12 h-12 mx-auto mb-3"/>
    <h2 className="text-base font-black uppercase tracking-widest" style={{background:G,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{icon} {title}</h2>
  </div>
)
const SC=({value,label,color,icon}:{value:any,label:string,color?:string,icon?:string})=>{const c=color||P;return(
  <div className="rounded-2xl p-5 text-center relative overflow-hidden" style={{...CS}}>
    <div className="absolute inset-0 opacity-25" style={{background:`radial-gradient(ellipse at 50% 0%,${c}30,transparent 65%)`}}/>
    {icon&&<p className="text-2xl mb-1 relative">{icon}</p>}
    <p className="text-4xl font-black relative" style={{color:c,textShadow:`0 0 20px ${c}50`}}>{value}</p>
    <p className="text-[9px] uppercase tracking-widest mt-1.5 font-bold relative" style={{color:T.textMuted}}>{label}</p>
  </div>
)}
const Tg=({children,color='gold'}:{children:any,color?:'gold'|'green'|'red'|'blue'|'gray'|'primary'})=>{
  const c={gold:{bg:'rgba(212,175,55,0.12)',text:'#D4AF37',border:'rgba(212,175,55,0.25)'},green:{bg:'rgba(74,222,128,0.12)',text:'#4ade80',border:'rgba(74,222,128,0.25)'},red:{bg:'rgba(248,113,113,0.12)',text:'#f87171',border:'rgba(248,113,113,0.25)'},blue:{bg:'rgba(96,165,250,0.12)',text:'#60a5fa',border:'rgba(96,165,250,0.25)'},gray:{bg:'rgba(255,255,255,0.06)',text:T.textMuted,border:'rgba(255,255,255,0.1)'},primary:{bg:`${P}18`,text:P,border:`${P}30`}}[color]
  return<span className="px-2.5 py-1 rounded-lg text-[10px] font-bold" style={{background:c.bg,color:c.text,border:`1px solid ${c.border}`}}>{children}</span>
}
const navItems=[{t:'matchs',i:'📅',l:'Matchs'},{t:'historique',i:'🏆',l:'Résultats'},{t:'sondages',i:'🗳️',l:'Votes'},{t:'draft',i:'🎲',l:'Draft'},{t:'strats',i:'🎯',l:'Strats'},{t:'compos',i:'📋',l:'Compos'},{t:'fiches',i:'🔍',l:'Fiches'},{t:'notes',i:'📊',l:'Notes'},{t:'rec',i:'🎬',l:'Replays'},{t:'roster',i:'👥',l:'Roster'},{t:'stats',i:'📈',l:'Stats'},{t:'admin',i:'⚙️',l:'Admin'}]
const particles=Array.from({length:15}).map((_,i)=>({id:i,size:Math.random()*3+1,x:Math.random()*100,delay:Math.random()*8,duration:8+Math.random()*12,opacity:0.2+Math.random()*0.3}))

if(showSplash)return(
  <div className="min-h-screen flex items-center justify-center" style={{background:'radial-gradient(ellipse at center,#1a1200 0%,#060400 55%,#000 100%)'}}>
    <style>{`@keyframes pg{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.1)}}@keyframes fu{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes sh{0%{background-position:-300% center}100%{background-position:300% center}}.sht{background:linear-gradient(90deg,#B8860B,#D4AF37,#FFD700,#D4AF37,#B8860B);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:sh 4s linear infinite,fu .6s ease .25s both}`}</style>
    <div className="text-center px-8">
      <div className="relative inline-block mb-8" style={{animation:'fu .6s ease both'}}>
        <div className="absolute inset-0 rounded-full" style={{background:'rgba(212,175,55,.08)',transform:'scale(2.5)',animation:'pg 2.5s ease-in-out infinite'}}/>
        <div className="absolute inset-0 rounded-full" style={{background:'rgba(212,175,55,.04)',transform:'scale(3.5)',animation:'pg 2.5s ease-in-out .4s infinite'}}/>
        <div className="relative w-32 h-32 rounded-full flex items-center justify-center" style={{background:'radial-gradient(circle,rgba(212,175,55,.1),transparent)',border:'1px solid rgba(212,175,55,.2)'}}><img src={LG} alt="DYNO" className="w-24 h-24"/></div>
      </div>
      <h1 className="text-7xl font-black tracking-[.15em] sht mb-2">DYNO</h1>
      <p className="text-[11px] tracking-[.6em] uppercase font-bold" style={{color:'rgba(212,175,55,.35)',animation:'fu .6s ease .45s both'}}>Esport Team</p>
      <div className="flex items-center justify-center gap-3 mt-10" style={{animation:'fu .6s ease .65s both'}}>
        {[0,1,2].map(i=><div key={i} className="w-1.5 h-1.5 rounded-full" style={{background:'#D4AF37',animation:`pg 1.4s ease-in-out ${i*.25}s infinite`}}/>)}
      </div>
    </div>
  </div>
)

return(
<div className="min-h-screen pb-24 relative" style={{background:T.bg}}>
<style>{`
@keyframes su{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes sh{0%{background-position:-300% center}100%{background-position:300% center}}
@keyframes lp{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes float{0%{transform:translateY(100vh) rotate(0deg);opacity:0}10%{opacity:1}90%{opacity:.4}100%{transform:translateY(-20px) rotate(720deg);opacity:0}}
@keyframes conffall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}
@keyframes bdg{0%,100%{transform:scale(1)}50%{transform:scale(1.3)}}
.ce{animation:su .35s ease both}
.sg{background:linear-gradient(90deg,#B8860B,${P},${P2},${P},#B8860B);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:sh 4s linear infinite}
.ld{animation:lp 1s ease-in-out infinite}
.bdg{animation:bdg .8s ease-in-out infinite}
input[type=date]::-webkit-calendar-picker-indicator,input[type=time]::-webkit-calendar-picker-indicator{filter:${isDark?'invert(.7) sepia(1) saturate(5) hue-rotate(5deg)':'invert(.3) sepia(1) saturate(3) hue-rotate(5deg)'}}
select option{background:${isDark?'#0d0900':'#fffbea'};color:${T.text}}
::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:${P}40;border-radius:10px}
`}</style>

<div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
  {particles.map(p=><div key={p.id} className="absolute rounded-full" style={{width:`${p.size}px`,height:`${p.size}px`,left:`${p.x}%`,bottom:'-10px',background:P,opacity:p.opacity,animation:`float ${p.duration}s linear ${p.delay}s infinite`}}/>)}
</div>

{showConfetti&&(
  <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
    {Array.from({length:80}).map((_,i)=><div key={i} className="absolute top-0" style={{left:`${Math.random()*100}%`,width:`${6+Math.random()*8}px`,height:`${6+Math.random()*8}px`,background:['#D4AF37','#FFD700','#ffffff','#f87171','#4ade80','#60a5fa'][Math.floor(Math.random()*6)],borderRadius:Math.random()>.5?'50%':'2px',animation:`conffall ${1.5+Math.random()*2.5}s linear ${Math.random()*1.5}s both`}}/>)}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="rounded-3xl px-8 py-6 text-center" style={{background:'rgba(0,0,0,0.8)',backdropFilter:'blur(20px)',border:`1px solid ${P}40`}}>
        <p className="text-5xl mb-2">🏆</p>
        <p className="text-2xl font-black" style={{background:G,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>VICTOIRE !</p>
      </div>
    </div>
  </div>
)}

<header className="sticky top-0 z-50" style={{background:T.header,backdropFilter:'blur(32px)',borderBottom:`1px solid ${T.navBorder}`,boxShadow:'0 4px 32px rgba(0,0,0,0.5)'}}>
  <div className="max-w-lg mx-auto px-3 py-2.5 flex items-center justify-between">
    <div className="flex items-center gap-2 flex-shrink-0">
      <img src={LG} alt="D" className="w-8 h-8 rounded-xl flex-shrink-0"/>
      <div><h1 className="text-lg font-black leading-none sg">DYNO</h1><p className="text-[7px] tracking-[.3em] uppercase font-bold" style={{color:`${P}80`}}>Esport</p></div>
    </div>
    <div className="flex items-center gap-1.5">
      <button onClick={toggleTheme} className="w-8 h-8 rounded-xl flex items-center justify-center active:scale-90 flex-shrink-0" style={{background:`${P}10`,border:`1px solid ${T.cardBorder}`}}><span className="text-sm">{isDark?'☀️':'🌙'}</span></button>
      {user&&<button onClick={()=>{setShowNotifSettings(true);markAllRead()}} className="w-8 h-8 rounded-xl flex items-center justify-center active:scale-90 relative flex-shrink-0" style={{background:notificationsEnabled?`${P}15`:'rgba(255,255,255,.05)',border:`1px solid ${T.cardBorder}`}}>
        <span className="text-sm">{notificationsEnabled?'🔔':'🔕'}</span>
        {unreadCount>0&&<div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white bdg" style={{background:'#ef4444'}}>{unreadCount>9?'9+':unreadCount}</div>}
      </button>}
      {showInstall&&<button onClick={handleInstall} className="px-2 py-1.5 rounded-xl text-xs font-bold active:scale-95 flex-shrink-0" style={{background:'rgba(59,130,246,.15)',color:'#60a5fa',border:'1px solid rgba(59,130,246,.25)'}}>📲</button>}
      {user?<button onClick={handleSignOut} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl active:scale-95 flex-shrink-0" style={{background:`${P}10`,border:`1px solid ${T.cardBorder}`}}>
        <div className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0" style={{background:G2,color:'#000'}}>{pseudo[0]?.toUpperCase()||'?'}</div>
        <span className="text-xs font-bold max-w-[55px] truncate" style={{color:P}}>{pseudo}</span>
      </button>:<button onClick={()=>setIsSignUp(false)} className="px-3 py-1.5 rounded-xl text-xs font-black active:scale-95 flex-shrink-0" style={{background:G2,color:'#000'}}>Connexion</button>}
    </div>
  </div>
</header>

{showNotifSettings&&<Mo onClose={()=>setShowNotifSettings(false)} title="⚙️ Réglages" sub="Thème et notifications">
  <div className="mb-4">
    <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{color:`${P}80`}}>🎨 Thème</p>
    <div className="grid grid-cols-4 gap-2">
      {Object.entries(THEMES).map(([key,th])=>(
        <button key={key} onClick={()=>setTheme(key)} className="p-2.5 rounded-2xl text-center active:scale-95 relative" style={{background:themeKey===key?`${th.primary}22`:'rgba(255,255,255,0.04)',border:`2px solid ${themeKey===key?th.primary:T.cardBorder}`}}>
          {themeKey===key&&<div className="absolute top-1 right-1 w-3 h-3 rounded-full flex items-center justify-center text-[8px]" style={{background:th.primary,color:'#000'}}>✓</div>}
          <p className="text-xl mb-1">{th.icon}</p>
          <p className="text-[8px] font-black leading-tight" style={{color:th.primary}}>{th.name}</p>
        </button>
      ))}
    </div>
  </div>
  <div className="h-px mb-4" style={{background:`linear-gradient(90deg,transparent,${T.cardBorder},transparent)`}}/>
  <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{color:`${P}80`}}>🔔 Notifications</p>
  <div className="space-y-2.5 mb-4">
    {[{k:'match',label:'📅 Matchs'},{k:'note',label:'📊 Notes'},{k:'commentaire',label:'💬 Commentaires'},{k:'strat',label:'🎯 Strats'},{k:'resultat',label:'🏆 Résultats'}].map(({k,label})=>(
      <div key={k} className="flex items-center justify-between p-3 rounded-2xl" style={{background:isDark?'rgba(255,255,255,.04)':'rgba(0,0,0,.04)',border:`1px solid ${T.cardBorder}`}}>
        <p className="text-xs font-bold" style={{color:T.text}}>{label}</p>
        <button onClick={()=>saveNotifSettings({...notifSettings,[k]:!notifSettings[k]})} className="w-11 h-6 rounded-full relative transition-all flex-shrink-0" style={{background:notifSettings[k]?G2:'rgba(255,255,255,.12)'}}>
          <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{left:notifSettings[k]?'calc(100% - 22px)':'2px'}}/>
        </button>
      </div>
    ))}
  </div>
  {!notificationsEnabled&&<button onClick={async()=>{await requestNotificationPermission();setShowNotifSettings(false)}} className="w-full py-3 rounded-2xl font-black text-sm text-black mb-3" style={{background:G2}}>🔔 Activer</button>}
  <button onClick={()=>setShowNotifSettings(false)} className="w-full py-3 rounded-2xl font-bold text-sm" style={{background:'rgba(255,255,255,.05)',color:T.textMuted,border:`1px solid ${T.cardBorder}`}}>Fermer</button>
</Mo>}

<main className="max-w-lg mx-auto px-4 py-5 relative z-10" onTouchStart={hts} onTouchMove={htm} onTouchEnd={hte}>
{pullDistance>0&&<div className="flex justify-center mb-3" style={{height:pullDistance}}><span className={`text-2xl ${pullDistance>60?'rotate-180':''}`} style={{color:P}}>{isRefreshing?'⏳':'↓'}</span></div>}

{activeTab==='matchs'&&(
<div className="ce"><ST icon="📅" title="Prochains Matchs"/>
  <div className="flex justify-end mb-4">
    <div className="flex rounded-2xl overflow-hidden p-1" style={{background:'rgba(255,255,255,.03)',border:`1px solid ${T.cardBorder}`}}>
      {(['list','grid'] as const).map(v=><button key={v} onClick={()=>setViewMode(v)} className="px-4 py-1.5 rounded-xl text-xs font-bold" style={viewMode===v?{background:`${P}20`,color:P}:{color:T.textMuted}}>{v==='list'?'☰':'⊞'}</button>)}
    </div>
  </div>
  {loading?<div className="space-y-3">{[1,2].map(i=><div key={i} className="h-72 rounded-3xl" style={{background:'rgba(255,255,255,.02)'}}/>)}</div>
  :prochainsMatchs.length===0?<div className="rounded-3xl p-14 text-center" style={CS}><p className="text-5xl mb-4">📭</p><p className="text-sm font-bold" style={{color:T.textMuted}}>Aucun match à venir</p></div>
  :<div className={viewMode==='grid'?'grid grid-cols-2 gap-3':'space-y-4'}>{prochainsMatchs.map((match:any,idx:number)=>(
    <div key={match.id} className="rounded-3xl overflow-hidden ce" style={{...CS,animationDelay:`${idx*.1}s`}}>
      <div className="h-px w-full" style={{background:`linear-gradient(90deg,transparent,${P}30,transparent)`}}/>
      <div className="px-5 pt-4 pb-3 flex items-center justify-between"><Bdg type={match.type}/><span className="text-xs font-bold" style={{color:`${P}90`}}>{fdf(match.date)}</span></div>
      {countdowns[match.id]&&<div className="mx-4 mb-3 rounded-2xl px-4 py-3 text-center" style={countdowns[match.id]==='EN COURS'?{background:'rgba(239,68,68,.12)',border:'1px solid rgba(239,68,68,.2)'}:{background:`${P}08`,border:`1px solid ${P}18`}}>
        <p className="text-[8px] uppercase tracking-widest mb-1.5 font-bold" style={{color:T.textMuted}}>Countdown</p>
        {countdowns[match.id]==='EN COURS'?<div className="flex items-center justify-center gap-2"><div className="w-2 h-2 rounded-full ld" style={{background:'#f87171'}}/><p className="text-base font-black" style={{color:'#f87171'}}>EN COURS</p></div>:<p className="text-xl font-black font-mono" style={{background:G,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{countdowns[match.id]}</p>}
      </div>}
      <div className="px-5 pb-4 flex items-center gap-4">
        <img src={LG} alt="D" className="w-12 h-12 rounded-2xl flex-shrink-0"/>
        <div className="flex-1 min-w-0"><p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{color:`${P}55`}}>DYNO vs</p><p className="text-base font-black truncate" style={{color:T.text}}>{match.adversaire}</p><p className="text-[10px] mt-0.5" style={{color:T.textMuted}}>🏟️ {match.arene}</p></div>
      </div>
      <div className="mx-4 mb-3 rounded-xl px-4 py-2.5 flex items-center gap-2.5" style={{background:`${P}07`,border:`1px solid ${P}15`}}><span>⏰</span><span className="text-sm font-black" style={{color:P}}>{match.horaires?.join(' / ')||match.horaire1||'20:00'}</span></div>
      {(match.disponibles||[]).length>0&&<div className="mx-4 mb-2 rounded-xl px-4 py-3" style={{background:`${P}06`,border:`1px solid ${P}12`}}><p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{color:`${P}60`}}>✅ Dispo ({(match.disponibles||[]).length})</p><div className="flex flex-wrap gap-1.5">{(match.disponibles||[]).map((p:string,i:number)=><Tg key={i} color="primary">{p}</Tg>)}</div></div>}
      {(match.indisponibles||[]).length>0&&<div className="mx-4 mb-3 rounded-xl px-4 py-3" style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.1)'}}><p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{color:'rgba(239,68,68,.55)'}}>🚫 Indispo ({(match.indisponibles||[]).length})</p><div className="flex flex-wrap gap-1.5">{(match.indisponibles||[]).map((p:string,i:number)=><Tg key={i} color="red">{p}</Tg>)}</div></div>}
      <div className="px-4 pb-5 space-y-2.5">
        <button onClick={()=>atc(match)} className="w-full py-3 rounded-2xl text-xs font-bold active:scale-95" style={{background:'rgba(59,130,246,.1)',color:'#60a5fa',border:'1px solid rgba(59,130,246,.18)'}}>📅 Ajouter au calendrier</button>
        <div className="grid grid-cols-2 gap-2.5">
          <button onClick={()=>toggleDispo(match.id)} disabled={!user} className="py-4 rounded-2xl font-black text-sm active:scale-95" style={!user?{background:'rgba(255,255,255,.03)',color:'rgba(255,255,255,.15)'}:(match.disponibles||[]).includes(pseudo)?{background:G2,color:'#000',boxShadow:`0 4px 20px ${P}40`}:{background:`${P}10`,color:P,border:`1px solid ${P}25`}}>{!user?'🔐':(match.disponibles||[]).includes(pseudo)?'✅ Dispo':'📅 Dispo'}</button>
          <button onClick={()=>toggleIndispo(match.id)} disabled={!user} className="py-4 rounded-2xl font-black text-sm active:scale-95" style={!user?{background:'rgba(255,255,255,.03)',color:'rgba(255,255,255,.15)'}:(match.indisponibles||[]).includes(pseudo)?{background:'rgba(239,68,68,.2)',color:'#f87171',border:'1px solid rgba(239,68,68,.3)'}:{background:'rgba(239,68,68,.06)',color:'rgba(239,68,68,.7)',border:'1px solid rgba(239,68,68,.15)'}}>{!user?'🔐':(match.indisponibles||[]).includes(pseudo)?'❌ Indispo':'🚫 Indispo'}</button>
        </div>
      </div>
    </div>
  ))}</div>}
</div>
)}

{activeTab==='historique'&&(
<div className="ce"><ST icon="🏆" title="Résultats"/>
  <div className="grid grid-cols-2 gap-3 mb-6"><SC value={victoires} label="Victoires" icon="🏆"/><SC value={defaites} label="Défaites" color="#f87171" icon="❌"/></div>
  {historique.length===0?<div className="rounded-3xl p-14 text-center" style={CS}><p className="text-5xl mb-4">📜</p><p className="text-sm font-bold" style={{color:T.textMuted}}>Aucun résultat</p></div>
  :<div className="space-y-3">{historique.map((match:any,idx:number)=>{
    const win=Number(match.scoreDyno||0)>Number(match.scoreAdversaire||0)
    return<div key={match.id} className="rounded-3xl overflow-hidden ce" style={{...CS,animationDelay:`${idx*.05}s`}}>
      <div className="h-px w-full" style={{background:win?`linear-gradient(90deg,transparent,${P}40,transparent)`:'linear-gradient(90deg,transparent,rgba(239,68,68,.25),transparent)'}}/>
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest" style={win?{background:`${P}18`,color:P,border:`1px solid ${P}30`}:{background:'rgba(239,68,68,.12)',color:'#f87171',border:'1px solid rgba(239,68,68,.22)'}}>{win?'🏆 Victoire':'❌ Défaite'}</span>
        <div className="flex items-center gap-2">
          {isAdmin&&<button onClick={()=>setScoreEdit({id:match.id,adversaire:match.adversaire,type:match.type,scoreDyno:String(match.scoreDyno||0),scoreAdv:String(match.scoreAdversaire||0),sousMatchs:match.sousMatchs?[...match.sousMatchs]:[],_newSubAdv:'',_newSubScoreDyno:'',_newSubScoreAdv:''})} className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold active:scale-95" style={{background:`${P}12`,color:`${P}90`,border:`1px solid ${P}22`}}>✏️</button>}
          <span className="text-xs font-medium" style={{color:T.textMuted}}>{fdf(match.date)}</span>
        </div>
      </div>
      <div className="px-6 pb-5 flex items-center justify-between">
        <div className="text-center flex-1"><p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{color:`${P}50`}}>DYNO</p><p className="text-7xl font-black leading-none" style={{background:G,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{match.scoreDyno}</p></div>
        <div className="px-4 flex flex-col items-center gap-1"><div className="w-px h-8" style={{background:'rgba(255,255,255,.08)'}}/><p className="text-xs" style={{color:'rgba(255,255,255,.15)'}}>vs</p><div className="w-px h-8" style={{background:'rgba(255,255,255,.08)'}}/></div>
        <div className="text-center flex-1"><p className="text-[9px] font-black uppercase tracking-widest mb-2 truncate" style={{color:T.textMuted}}>{match.adversaire}</p><p className="text-7xl font-black leading-none" style={{color:isDark?'rgba(255,255,255,.35)':'rgba(0,0,0,.3)'}}>{match.scoreAdversaire}</p></div>
      </div>
      {match.sousMatchs?.length>0&&<div className="mx-4 mb-4 rounded-2xl overflow-hidden" style={{border:'1px solid rgba(245,158,11,.15)'}}>
        <div className="px-4 py-2.5" style={{background:'rgba(245,158,11,.08)',borderBottom:'1px solid rgba(245,158,11,.1)'}}><p className="text-[9px] font-black uppercase tracking-widest" style={{color:'rgba(245,158,11,.7)'}}>🏆 Division</p></div>
        {match.sousMatchs.map((sm:any,i:number)=><div key={i} className="px-4 py-2.5 flex items-center justify-between" style={{borderTop:i>0?`1px solid ${T.cardBorder}`:'none'}}>
          <span className="text-xs" style={{color:T.textMuted}}>DYNO vs {sm.adversaire}</span>
          <span className="text-xs font-black"><span style={{color:P}}>{sm.scoreDyno}</span><span style={{color:T.textMuted}}> — </span><span style={{color:T.textMuted}}>{sm.scoreAdv}</span></span>
        </div>)}
      </div>}
      {match.type&&<p className="text-center text-[9px] uppercase tracking-widest pb-4 font-medium" style={{color:T.textMuted}}>{match.type} · {match.arene}</p>}
    </div>
  })}</div>}
</div>
)}

{activeTab==='sondages'&&(
<div className="ce"><ST icon="🗳️" title="Sondages"/>
  {canCreateSondage&&<GBtn onClick={()=>setShowAddSondage(true)} cls="mb-5">➕ Créer un sondage</GBtn>}
  {sondages.length===0?<div className="rounded-3xl p-14 text-center" style={CS}><p className="text-5xl mb-4">🗳️</p><p className="text-sm font-bold" style={{color:T.textMuted}}>Aucun sondage</p></div>
  :<div className="space-y-4">{sondages.map((s:any,idx:number)=>{
    const opts=s.options||{};const totalVotes=Object.values(opts).reduce((a:number,o:any)=>a+(o.votes?.length||0),0);const userVote=Object.keys(opts).find(k=>(opts[k].votes||[]).includes(user?.uid));const isFinished=!s.actif
    return<div key={s.id} className="rounded-3xl overflow-hidden ce" style={{...CS,animationDelay:`${idx*.05}s`}}>
      <div className="h-px w-full" style={{background:`linear-gradient(90deg,transparent,${P}25,transparent)`}}/>
      <div className="px-5 pt-4 pb-3" style={{borderBottom:`1px solid ${T.cardBorder}`}}>
        <div className="flex items-start justify-between gap-3">
          <p className="font-black text-base flex-1" style={{color:T.text}}>{s.question}</p>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isFinished?<span className="px-2 py-1 rounded-full text-[9px] font-black" style={{background:'rgba(255,255,255,.07)',color:T.textMuted}}>Clôturé</span>:<span className="px-2 py-1 rounded-full text-[9px] font-black ld" style={{background:'rgba(74,222,128,.15)',color:'#4ade80'}}>🟢 Actif</span>}
            {isAdmin&&s.actif&&<button onClick={()=>clotureSondage(s.id)} className="px-2 py-1 rounded-lg text-[9px] font-bold" style={{background:'rgba(239,68,68,.1)',color:'#f87171'}}>Clôturer</button>}
            {isAdmin&&<button onClick={()=>del('sondages',s.id)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:'rgba(239,68,68,.1)'}}>🗑️</button>}
          </div>
        </div>
        <p className="text-[10px] mt-1" style={{color:T.textMuted}}>par {s.auteur} · {totalVotes} vote{totalVotes!==1?'s':''}</p>
      </div>
      <div className="p-4 space-y-2.5">
        {Object.keys(opts).map(k=>{const o=opts[k],votes=o.votes?.length||0,pct=totalVotes>0?Math.round((votes/totalVotes)*100):0,isMyVote=userVote===k
          return<button key={k} onClick={()=>!isFinished&&user&&voterSondage(s.id,k)} disabled={isFinished||!user} className="w-full text-left rounded-2xl overflow-hidden transition-all active:scale-[.98]" style={{border:`1px solid ${isMyVote?P+50:T.cardBorder}`}}>
            <div className="px-4 py-3 relative">
              <div className="absolute inset-0 rounded-2xl transition-all duration-500" style={{background:isMyVote?`${P}18`:'rgba(255,255,255,.02)',width:`${userVote?pct:0}%`}}/>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2.5">{isMyVote&&<span className="text-xs">✅</span>}<span className="text-sm font-bold" style={{color:isMyVote?P:T.text}}>{o.label}</span></div>
                <div className="flex items-center gap-2">{userVote&&<span className="text-xs font-black" style={{color:isMyVote?P:T.textMuted}}>{pct}%</span>}<span className="text-[10px]" style={{color:T.textMuted}}>{votes}</span></div>
              </div>
            </div>
          </button>
        })}
        {!user&&<p className="text-center text-xs py-2" style={{color:T.textMuted}}>🔐 Connecte-toi pour voter</p>}
      </div>
    </div>
  })}</div>}
  {showAddSondage&&<Mo onClose={()=>setShowAddSondage(false)} title="🗳️ Nouveau Sondage">
    <div className="space-y-3 mb-4">
      <input type="text" placeholder="Ta question..." value={nouveauSondage.question} onChange={(e:any)=>setNouveauSondage({...nouveauSondage,question:e.target.value})} className={iCls} style={IS}/>
      {nouveauSondage.options.map((opt:string,i:number)=><div key={i} className="flex gap-2">
        <input type="text" placeholder={`Option ${i+1}`} value={opt} onChange={(e:any)=>{const o=[...nouveauSondage.options];o[i]=e.target.value;setNouveauSondage({...nouveauSondage,options:o})}} className={`flex-1 ${iCls}`} style={IS}/>
        {nouveauSondage.options.length>2&&<button onClick={()=>setNouveauSondage({...nouveauSondage,options:nouveauSondage.options.filter((_:string,j:number)=>j!==i)})} className="px-3 rounded-xl font-bold text-xl" style={{background:'rgba(239,68,68,.1)',color:'#f87171'}}>×</button>}
      </div>)}
      {nouveauSondage.options.length<6&&<button onClick={()=>setNouveauSondage({...nouveauSondage,options:[...nouveauSondage.options,'']})} className="w-full py-2.5 rounded-xl text-xs font-bold" style={{background:`${P}10`,color:P,border:`1px solid ${P}20`}}>➕ Option</button>}
    </div>
    <GBtn onClick={ajouterSondage}>✅ Créer</GBtn>
  </Mo>}
</div>
)}

{/* ✅ DRAFT COMPLÈTE AVEC VRAIES RÈGLES */}
{activeTab==='draft'&&(
<div className="ce"><ST icon="🎲" title="Draft Maps"/>
  {canCreateDraft&&<GBtn onClick={()=>setShowAddDraft(true)} cls="mb-5">➕ Nouvelle Draft</GBtn>}
  {drafts.length===0?<div className="rounded-3xl p-14 text-center" style={CS}><p className="text-5xl mb-4">🎲</p><p className="text-sm font-bold" style={{color:T.textMuted}}>Aucune draft en cours</p></div>
  :<div className="space-y-4">{drafts.map((draft:any,idx:number)=>{
    const currentSeq=DRAFT_SEQUENCE[draft.currentStep]
    const isFinished=!draft.actif||(draft.currentStep>=DRAFT_SEQUENCE.length)
    const loser=draft.winner===draft.equipe1?draft.equipe2:draft.equipe1
    const currentWho=currentSeq?.who==='winner'?draft.winner:loser
    const availableMaps=DRAFT_MAPS.filter(m=>!(draft.picks||[]).includes(m)&&!(draft.bans||[]).includes(m))

    return<div key={draft.id} className="rounded-3xl overflow-hidden ce" style={{...CS,animationDelay:`${idx*.05}s`}}>
      <div className="h-px w-full" style={{background:`linear-gradient(90deg,transparent,${P}25,transparent)`}}/>

      {/* Header */}
      <div className="px-5 pt-4 pb-3" style={{borderBottom:`1px solid ${T.cardBorder}`}}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-black text-base" style={{color:T.text}}>{draft.equipe1} vs {draft.equipe2}</p>
            <p className="text-[10px] mt-0.5" style={{color:T.textMuted}}>par {draft.auteur}</p>
          </div>
          <div className="flex items-center gap-2">
            {isFinished?<span className="px-2 py-1 rounded-full text-[9px] font-black" style={{background:'rgba(255,255,255,.07)',color:T.textMuted}}>Terminée</span>:<span className="px-2 py-1 rounded-full text-[9px] font-black ld" style={{background:'rgba(74,222,128,.15)',color:'#4ade80'}}>🟢 Active</span>}
            {isAdmin&&draft.actif&&<button onClick={()=>resetDraft(draft.id)} className="px-2 py-1 rounded-lg text-[9px] font-bold" style={{background:'rgba(245,158,11,.1)',color:'#fbbf24'}}>↺ Reset</button>}
            {isAdmin&&<button onClick={()=>del('drafts',draft.id)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:'rgba(239,68,68,.1)'}}>🗑️</button>}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Barre de progression */}
        <div>
          <div className="flex justify-between mb-2">
            <p className="text-[9px] font-black uppercase tracking-widest" style={{color:T.textMuted}}>Progression</p>
            <p className="text-[9px] font-black" style={{color:P}}>{Math.min(draft.currentStep,DRAFT_SEQUENCE.length)}/{DRAFT_SEQUENCE.length}</p>
          </div>
          <div className="flex gap-1">{DRAFT_SEQUENCE.map((_,i)=>(
            <div key={i} className="flex-1 h-1.5 rounded-full" style={{background:i<draft.currentStep?P:isDark?'rgba(255,255,255,.08)':'rgba(0,0,0,.08)'}}/>
          ))}</div>
        </div>

        {/* Étape actuelle */}
        {!isFinished&&currentSeq&&(
          <div className="rounded-2xl p-4" style={{background:`${P}08`,border:`1px solid ${P}20`}}>
            <p className="text-xs font-black mb-1" style={{color:P}}>Étape {draft.currentStep+1} — {currentSeq.label}</p>
            <p className="text-[10px]" style={{color:T.textMuted}}>{currentSeq.desc}</p>
            {currentWho&&<p className="text-[10px] font-black mt-1" style={{color:P}}>👤 Tour de : {currentWho}</p>}
          </div>
        )}

        {/* ÉTAPE 0 : PILE OU FACE */}
        {!isFinished&&draft.currentStep===0&&isAdmin&&(
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{color:T.textMuted}}>Qui remporte le pile ou face ?</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={()=>draftCoinResult(draft.id,draft.equipe1)} className="py-3 rounded-2xl font-black text-sm active:scale-95" style={{background:`${P}15`,color:P,border:`1px solid ${P}30`}}>{draft.equipe1} 🪙</button>
              <button onClick={()=>draftCoinResult(draft.id,draft.equipe2)} className="py-3 rounded-2xl font-black text-sm active:scale-95" style={{background:'rgba(96,165,250,.15)',color:'#60a5fa',border:'1px solid rgba(96,165,250,.3)'}}>{draft.equipe2} 🪙</button>
            </div>
          </div>
        )}

        {/* ÉTAPE 1 : CHOIX DU CÔTÉ */}
        {!isFinished&&draft.currentStep===1&&(isAdmin||pseudo===draft.winner)&&(
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{color:T.textMuted}}>{draft.winner} choisit son côté</p>
            <div className="grid grid-cols-2 gap-2">
              {['🟠 Orange','🔵 Bleu'].map(side=>(
                <button key={side} onClick={()=>draftSideChoice(draft.id,side)} className="py-3 rounded-2xl font-black text-sm active:scale-95" style={side.includes('Orange')?{background:'rgba(245,158,11,.15)',color:'#fbbf24',border:'1px solid rgba(245,158,11,.3)'}:{background:'rgba(59,130,246,.15)',color:'#60a5fa',border:'1px solid rgba(59,130,246,.3)'}}>{side}</button>
              ))}
            </div>
          </div>
        )}

        {/* ÉTAPE 2 : CHOIX DU SKIN */}
        {!isFinished&&draft.currentStep===2&&(isAdmin||pseudo===loser)&&(
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{color:T.textMuted}}>{loser} choisit le skin de l'arène</p>
            <div className="grid grid-cols-2 gap-1.5">
              {['Default','Farmstead','Pillars','Cosmic','Nest','Utopia','Aquadome','Forbidden Temple'].map(skin=>(
                <button key={skin} onClick={()=>draftSkinChoice(draft.id,skin)} className="py-2.5 rounded-xl text-xs font-bold active:scale-95" style={{background:T.input,color:T.text,border:`1px solid ${T.inputBorder}`}}>{skin}</button>
              ))}
            </div>
          </div>
        )}

        {/* ÉTAPES 3-9 : PICKS ET BANS */}
        {!isFinished&&draft.currentStep>=3&&draft.currentStep<DRAFT_SEQUENCE.length&&(
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{color:T.textMuted}}>
              {currentSeq?.type==='pick'?'✅ Choisir une map à PICK':'❌ Choisir une map à BANNIR'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {availableMaps.map(map=>(
                <button key={map} onClick={()=>draftMapAction(draft.id,map)} disabled={!isAdmin&&pseudo!==currentWho} className="py-3 rounded-2xl text-sm font-bold active:scale-95 transition-all" style={(isAdmin||pseudo===currentWho)?currentSeq?.type==='pick'?{background:'rgba(74,222,128,.15)',color:'#4ade80',border:'1px solid rgba(74,222,128,.3)'}:{background:'rgba(248,113,113,.15)',color:'#f87171',border:'1px solid rgba(248,113,113,.3)'}:{background:T.input,color:T.textMuted,border:`1px solid ${T.inputBorder}`,opacity:0.5}}>{map}</button>
              ))}
            </div>
            {!isAdmin&&pseudo!==currentWho&&<p className="text-center text-[9px] mt-2" style={{color:T.textMuted}}>⏳ En attente de {currentWho}...</p>}
          </div>
        )}

        {/* Résumé picks/bans */}
        {((draft.picks||[]).length>0||(draft.bans||[]).length>0)&&(
          <div className="grid grid-cols-2 gap-3">
            {(draft.picks||[]).length>0&&<div className="rounded-2xl p-3" style={{background:'rgba(74,222,128,.06)',border:'1px solid rgba(74,222,128,.15)'}}>
              <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{color:'rgba(74,222,128,.7)'}}>✅ Picks ({(draft.picks||[]).length})</p>
              <div className="space-y-1">{(draft.picks||[]).map((m:string,i:number)=><p key={i} className="text-[10px] font-bold" style={{color:'#4ade80'}}>{m}</p>)}</div>
            </div>}
            {(draft.bans||[]).length>0&&<div className="rounded-2xl p-3" style={{background:'rgba(248,113,113,.06)',border:'1px solid rgba(248,113,113,.15)'}}>
              <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{color:'rgba(248,113,113,.7)'}}>❌ Bans ({(draft.bans||[]).length})</p>
              <div className="space-y-1">{(draft.bans||[]).map((m:string,i:number)=><p key={i} className="text-[10px] font-bold" style={{color:'#f87171'}}>{m}</p>)}</div>
            </div>}
          </div>
        )}

        {/* Infos côté/skin */}
        {(draft.winnerSide||draft.loserSkin)&&(
          <div className="grid grid-cols-2 gap-2">
            {draft.winnerSide&&<div className="rounded-xl p-2.5 text-center" style={{background:'rgba(245,158,11,.08)',border:'1px solid rgba(245,158,11,.15)'}}><p className="text-[8px] text-gray-500 uppercase">Côté</p><p className="text-xs font-black" style={{color:'#fbbf24'}}>{draft.winner} {draft.winnerSide}</p></div>}
            {draft.loserSkin&&<div className="rounded-xl p-2.5 text-center" style={{background:'rgba(96,165,250,.08)',border:'1px solid rgba(96,165,250,.15)'}}><p className="text-[8px] text-gray-500 uppercase">Skin</p><p className="text-xs font-black" style={{color:'#60a5fa'}}>{draft.loserSkin}</p></div>}
          </div>
        )}

        {/* Historique des actions */}
        {(draft.actions||[]).length>0&&(
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{color:T.textMuted}}>📋 Historique</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">{(draft.actions||[]).map((a:any,i:number)=>(
              <p key={i} className="text-[9px] font-medium" style={{color:T.textMuted}}>• {a.label}</p>
            ))}</div>
          </div>
        )}

        {/* Draft terminée */}
        {isFinished&&(draft.picks||[]).length>0&&(
          <div className="rounded-2xl p-4 text-center" style={{background:`${P}10`,border:`1px solid ${P}20`}}>
            <p className="text-2xl mb-2">🎉</p>
            <p className="text-sm font-black mb-3" style={{color:P}}>Draft terminée !</p>
            <p className="text-[10px] font-bold mb-1" style={{color:T.textMuted}}>Maps jouées :</p>
            <div className="flex flex-wrap justify-center gap-1.5">{(draft.picks||[]).map((m:string,i:number)=><span key={i} className="px-2.5 py-1 rounded-lg text-[10px] font-bold" style={{background:'rgba(74,222,128,.15)',color:'#4ade80'}}>{m}</span>)}</div>
          </div>
        )}
      </div>
    </div>
  })}</div>}

  {showAddDraft&&<Mo onClose={()=>setShowAddDraft(false)} title="🎲 Nouvelle Draft" sub="Draft officielle Rocket League">
    <div className="space-y-3 mb-4">
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{color:T.textMuted}}>Équipe 1</p>
        <input type="text" value={nouvelleDraft.equipe1} onChange={(e:any)=>setNouvelleDraft({...nouvelleDraft,equipe1:e.target.value})} className={iCls} style={IS}/>
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{color:T.textMuted}}>Équipe 2 (Adversaire)</p>
        <input type="text" placeholder="Nom de l'adversaire" value={nouvelleDraft.equipe2} onChange={(e:any)=>setNouvelleDraft({...nouvelleDraft,equipe2:e.target.value})} className={iCls} style={IS}/>
      </div>
      <div className="rounded-2xl p-3" style={{background:isDark?'rgba(255,255,255,.03)':'rgba(0,0,0,.03)',border:`1px solid ${T.cardBorder}`}}>
        <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{color:T.textMuted}}>📋 Séquence officielle</p>
        {DRAFT_SEQUENCE.map((s,i)=>(
          <p key={i} className="text-[9px] mb-1" style={{color:T.textMuted}}>{i+1}. {s.label} ({s.who==='winner'?'Gagnant pile/face':'Perdant pile/face'})</p>
        ))}
      </div>
    </div>
    <GBtn onClick={creerDraft}>✅ Créer la draft</GBtn>
  </Mo>}
</div>
)}

{activeTab==='strats'&&(
<div className="ce"><ST icon="🎯" title="Stratégies"/>
  {canAddStrat&&<GBtn onClick={()=>setShowAddStrat(true)} cls="mb-5">➕ Nouvelle Stratégie</GBtn>}
  {!canAddStrat&&<div className="rounded-2xl p-3 mb-4 text-center" style={{background:'rgba(255,255,255,.03)',border:`1px solid ${T.cardBorder}`}}><p className="text-xs" style={{color:T.textMuted}}>🔒 Réservé aux Capitaines et Coachs</p></div>}
  {strats.length===0?<div className="rounded-3xl p-14 text-center" style={CS}><p className="text-5xl mb-4">📝</p><p className="text-sm font-bold" style={{color:T.textMuted}}>Aucune stratégie</p></div>
  :<div className="space-y-3">{strats.map((s:any,idx:number)=><div key={s.id} className="rounded-3xl p-5 ce" style={{...CS,animationDelay:`${idx*.05}s`}}>
    <div className="flex items-start justify-between mb-4">
      <div><p className="font-black text-base" style={{color:T.text}}>DYNO vs {s.adversaire}</p><p className="text-[10px] mt-0.5" style={{color:T.textMuted}}>par {s.auteur||'?'}</p></div>
      {(isAdmin||user?.uid===s.auteurId)&&<button onClick={()=>del('strats',s.id)} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'rgba(239,68,68,.1)'}}>🗑️</button>}
    </div>
    <div className="my-3 h-px" style={{background:`linear-gradient(90deg,transparent,${T.cardBorder},transparent)`}}/>
    <div className="mb-4"><p className="text-[9px] font-black uppercase tracking-widest mb-2.5" style={{color:'rgba(74,222,128,.7)'}}>✅ Picks ({s.picks?.length||0}/4)</p><div className="flex flex-wrap gap-1.5">{s.picks?.map((p:string,i:number)=><Tg key={i} color="green">{p}</Tg>)}</div></div>
    <div><p className="text-[9px] font-black uppercase tracking-widest mb-2.5" style={{color:'rgba(248,113,113,.7)'}}>❌ Bans ({s.bans?.length||0}/4)</p><div className="flex flex-wrap gap-1.5">{s.bans?.map((b:string,i:number)=><Tg key={i} color="red">{b}</Tg>)}</div></div>
  </div>)}</div>}
  {showAddStrat&&<Mo onClose={()=>{setShowAddStrat(false);setNouvelleStrat({adversaire:'',picks:[],bans:[]})}} title="🎯 Nouvelle Stratégie">
    <div className="space-y-4 mb-4">
      <input type="text" placeholder="Adversaire" value={nouvelleStrat.adversaire} onChange={(e:any)=>setNouvelleStrat({...nouvelleStrat,adversaire:e.target.value})} className={iCls} style={IS}/>
      <div><p className="text-[9px] font-black uppercase tracking-widest mb-2.5" style={{color:'rgba(74,222,128,.8)'}}>✅ Picks (max 4)</p><div className="grid grid-cols-3 gap-1.5">{AM.map(m=><button key={m} onClick={()=>toggleMap(m,'picks')} className="px-2 py-2.5 rounded-xl text-[10px] font-bold active:scale-95" style={nouvelleStrat.picks.includes(m)?{background:'rgba(74,222,128,.18)',color:'#4ade80',border:'1px solid rgba(74,222,128,.3)'}:{background:T.input,color:T.textMuted,border:`1px solid ${T.inputBorder}`}}>{m}</button>)}</div></div>
      <div><p className="text-[9px] font-black uppercase tracking-widest mb-2.5" style={{color:'rgba(248,113,113,.8)'}}>❌ Bans (max 4)</p><div className="grid grid-cols-3 gap-1.5">{AM.map(m=><button key={m} onClick={()=>toggleMap(m,'bans')} className="px-2 py-2.5 rounded-xl text-[10px] font-bold active:scale-95" style={nouvelleStrat.bans.includes(m)?{background:'rgba(248,113,113,.15)',color:'#f87171',border:'1px solid rgba(248,113,113,.28)'}:{background:T.input,color:T.textMuted,border:`1px solid ${T.inputBorder}`}}>{m}</button>)}</div></div>
    </div>
    <GBtn onClick={ajouterStrat}>✅ Sauvegarder</GBtn>
  </Mo>}
</div>
)}

{activeTab==='compos'&&(
<div className="ce"><ST icon="📋" title="Compositions"/>
  {user&&<GBtn onClick={()=>setShowAddCompo(true)} cls="mb-5">➕ Nouvelle Compo</GBtn>}
  {compos.length===0?<div className="rounded-3xl p-14 text-center" style={CS}><p className="text-5xl mb-4">📋</p><p className="text-sm font-bold" style={{color:T.textMuted}}>Aucune compo</p></div>
  :<div className="space-y-3">{compos.map((c:any,idx:number)=><div key={c.id} className="rounded-3xl p-5 ce" style={{...CS,animationDelay:`${idx*.05}s`}}>
    <div className="flex items-center justify-between mb-4">
      <div><p className="font-black" style={{color:T.text}}>🗺️ {c.map}</p><p className="text-[10px] mt-0.5" style={{color:T.textMuted}}>par {c.auteur||'?'}</p></div>
      {(isAdmin||user?.uid===c.auteurId)&&<button onClick={()=>del('compos',c.id)} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'rgba(239,68,68,.1)'}}>🗑️</button>}
    </div>
    <div className="flex flex-wrap gap-1.5">{c.joueurs?.map((j:string,i:number)=><Tg key={i} color="primary">{j}</Tg>)}</div>
  </div>)}</div>}
  {showAddCompo&&<Mo onClose={()=>{setShowAddCompo(false);setSelectedMapCompo('');setCompoJoueurs([])}} title="📋 Nouvelle Compo">
    <div className="space-y-4 mb-4">
      <div><p className="text-[9px] font-black uppercase tracking-widest mb-2.5" style={{color:`${P}80`}}>🗺️ Map</p><div className="grid grid-cols-3 gap-1.5">{AM.map(m=><button key={m} onClick={()=>setSelectedMapCompo(m)} className="px-2 py-2.5 rounded-xl text-[10px] font-bold active:scale-95" style={selectedMapCompo===m?{background:`${P}20`,color:P,border:`1px solid ${P}35`}:{background:T.input,color:T.textMuted,border:`1px solid ${T.inputBorder}`}}>{m}</button>)}</div></div>
      <div><p className="text-[9px] font-black uppercase tracking-widest mb-2.5" style={{color:`${P}80`}}>👥 Joueurs</p><div className="grid grid-cols-2 gap-1.5">{joueurs.filter((j:any)=>j.actif!==false).map((j:any)=><button key={j.id} onClick={()=>toggleCompoJoueur(j.pseudo)} className="px-3 py-2.5 rounded-xl text-xs font-bold active:scale-95" style={compoJoueurs.includes(j.pseudo)?{background:'rgba(74,222,128,.18)',color:'#4ade80',border:'1px solid rgba(74,222,128,.3)'}:{background:T.input,color:T.textMuted,border:`1px solid ${T.inputBorder}`}}>{j.pseudo}</button>)}</div></div>
    </div>
    <GBtn onClick={ajouterCompo}>✅ Sauvegarder</GBtn>
  </Mo>}
</div>
)}

{activeTab==='fiches'&&(
<div className="ce"><ST icon="🔍" title="Fiches Adversaires"/>
  {canAddFiche&&<GBtn onClick={()=>setShowAddFiche(true)} cls="mb-5">➕ Nouvelle Fiche</GBtn>}
  {!canAddFiche&&<div className="rounded-2xl p-3 mb-4 text-center" style={{background:'rgba(255,255,255,.03)',border:`1px solid ${T.cardBorder}`}}><p className="text-xs" style={{color:T.textMuted}}>🔒 Réservé aux Coachs</p></div>}
  {fichesAdversaires.length===0?<div className="rounded-3xl p-14 text-center" style={CS}><p className="text-5xl mb-4">🔍</p><p className="text-sm font-bold" style={{color:T.textMuted}}>Aucune fiche</p></div>
  :<div className="space-y-3">{fichesAdversaires.map((f:any,idx:number)=><div key={f.id} className="rounded-3xl overflow-hidden ce" style={{...CS,animationDelay:`${idx*.05}s`}}>
    <div className="px-5 pt-4 pb-3 flex items-center justify-between" style={{borderBottom:`1px solid ${T.cardBorder}`}}>
      <p className="font-black" style={{color:T.text}}>⚔️ {f.adversaire}</p>
      {(isAdmin||user?.uid===f.auteurId)&&<button onClick={()=>del('fichesAdversaires',f.id)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'rgba(239,68,68,.1)'}}>🗑️</button>}
    </div>
    <div className="p-5 space-y-3">
      <div className="rounded-2xl p-4" style={{background:'rgba(74,222,128,.06)',border:'1px solid rgba(74,222,128,.12)'}}><p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{color:'rgba(74,222,128,.7)'}}>💪 Forces</p><p className="text-xs leading-relaxed" style={{color:T.textMuted}}>{f.forces||'—'}</p></div>
      <div className="rounded-2xl p-4" style={{background:'rgba(248,113,113,.06)',border:'1px solid rgba(248,113,113,.12)'}}><p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{color:'rgba(248,113,113,.7)'}}>⚠️ Faiblesses</p><p className="text-xs leading-relaxed" style={{color:T.textMuted}}>{f.faiblesses||'—'}</p></div>
      {f.notes&&<div className="rounded-2xl p-4" style={{background:T.input,border:`1px solid ${T.inputBorder}`}}><p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{color:T.textMuted}}>📝 Notes</p><p className="text-xs leading-relaxed" style={{color:T.textMuted}}>{f.notes}</p></div>}
    </div>
    <p className="px-5 pb-4 text-[9px]" style={{color:T.textMuted}}>par {f.auteur}</p>
  </div>)}</div>}
  {showAddFiche&&<Mo onClose={()=>{setShowAddFiche(false);setNouvelleFiche({adversaire:'',forces:'',faiblesses:'',notes:''})}} title="🔍 Nouvelle Fiche">
    <div className="space-y-3 mb-4">
      <input type="text" placeholder="Adversaire" value={nouvelleFiche.adversaire} onChange={(e:any)=>setNouvelleFiche({...nouvelleFiche,adversaire:e.target.value})} className={iCls} style={IS}/>
      <textarea placeholder="💪 Forces..." value={nouvelleFiche.forces} onChange={(e:any)=>setNouvelleFiche({...nouvelleFiche,forces:e.target.value})} rows={2} className={`${iCls} resize-none`} style={{...IS,border:'1px solid rgba(74,222,128,.2)'}}/>
      <textarea placeholder="⚠️ Faiblesses..." value={nouvelleFiche.faiblesses} onChange={(e:any)=>setNouvelleFiche({...nouvelleFiche,faiblesses:e.target.value})} rows={2} className={`${iCls} resize-none`} style={{...IS,border:'1px solid rgba(248,113,113,.2)'}}/>
      <textarea placeholder="📝 Notes..." value={nouvelleFiche.notes} onChange={(e:any)=>setNouvelleFiche({...nouvelleFiche,notes:e.target.value})} rows={2} className={`${iCls} resize-none`} style={IS}/>
    </div>
    <GBtn onClick={ajouterFiche}>✅ Sauvegarder</GBtn>
  </Mo>}
</div>
)}

{activeTab==='notes'&&(
<div className="ce"><ST icon="📊" title="Notes & Analyses"/>
  {historique.length===0?<div className="rounded-3xl p-14 text-center" style={CS}><p className="text-5xl mb-4">📊</p><p className="text-sm font-bold" style={{color:T.textMuted}}>Aucun match terminé</p></div>
  :<div className="space-y-4">{historique.map((match:any,idx:number)=>{
    const mn=notes.filter((n:any)=>n.matchId===match.id),mc=commentaires.filter((c:any)=>c.matchId===match.id),ma=analyses.filter((a:any)=>a.matchId===match.id)
    const win=Number(match.scoreDyno||0)>Number(match.scoreAdversaire||0)
    return<div key={match.id} className="rounded-3xl overflow-hidden ce" style={{...CS,animationDelay:`${idx*.05}s`}}>
      <div className="px-5 pt-4 pb-3" style={{borderBottom:`1px solid ${T.cardBorder}`}}>
        <div className="flex items-center justify-between">
          <p className="font-black" style={{color:T.text}}>DYNO vs {match.adversaire}</p>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-full text-[9px] font-black" style={win?{background:`${P}18`,color:P}:{background:'rgba(239,68,68,.12)',color:'#f87171'}}>{match.scoreDyno}–{match.scoreAdversaire}</span>
            <span className="text-[10px]" style={{color:T.textMuted}}>{fdf(match.date)}</span>
          </div>
        </div>
      </div>
      <div className="px-4 py-3 grid grid-cols-3 gap-2">
        <button onClick={()=>{setSelectedMatchForNotes(match);setNouvelleNote({matchId:match.id,mental:0,communication:0,gameplay:0})}} className="py-2.5 rounded-xl text-[10px] font-bold active:scale-95" style={{background:'rgba(168,85,247,.12)',color:'#c084fc',border:'1px solid rgba(168,85,247,.2)'}}>📝 Note</button>
        <button onClick={()=>setSelectedMatchForComment(selectedMatchForComment?.id===match.id?null:match)} className="py-2.5 rounded-xl text-[10px] font-bold active:scale-95" style={{background:'rgba(34,211,238,.12)',color:'#22d3ee',border:'1px solid rgba(34,211,238,.2)'}}>💬 Comm</button>
        <button onClick={()=>setSelectedMatchForAnalyse(selectedMatchForAnalyse?.id===match.id?null:match)} className="py-2.5 rounded-xl text-[10px] font-bold active:scale-95" style={{background:'rgba(251,146,60,.12)',color:'#fb923c',border:'1px solid rgba(251,146,60,.2)'}}>📋 Analyse</button>
      </div>
      {selectedMatchForComment?.id===match.id&&user&&<div className="px-4 pb-3">
        <textarea placeholder="Ton commentaire..." value={nouveauCommentaire} onChange={(e:any)=>setNouveauCommentaire(e.target.value)} rows={2} className="w-full rounded-xl px-4 py-3 text-xs resize-none focus:outline-none mb-2" style={{background:'rgba(34,211,238,.06)',border:'1px solid rgba(34,211,238,.15)',color:T.text}}/>
        <button onClick={()=>ajouterCommentaire(match.id)} className="w-full py-2 rounded-xl text-xs font-bold" style={{background:'rgba(34,211,238,.15)',color:'#22d3ee',border:'1px solid rgba(34,211,238,.22)'}}>💬 Envoyer</button>
      </div>}
      {selectedMatchForAnalyse?.id===match.id&&user&&<div className="px-4 pb-3 space-y-2">
        {[{k:'bien',label:"✅ Ce qui a bien marché",bg:'rgba(74,222,128,.08)',border:'rgba(74,222,128,.18)',tc:'#4ade80'},{k:'mal',label:"❌ Ce qui a mal marché",bg:'rgba(248,113,113,.08)',border:'rgba(248,113,113,.18)',tc:'#f87171'},{k:'plan',label:"🎯 Plan d'action",bg:'rgba(96,165,250,.08)',border:'rgba(96,165,250,.18)',tc:'#60a5fa'}].map(({k,label,bg,border,tc})=>
          <div key={k}><p className="text-[9px] font-black uppercase mb-1" style={{color:tc}}>{label}</p><textarea value={(nouvelleAnalyse as any)[k]} onChange={(e:any)=>setNouvelleAnalyse({...nouvelleAnalyse,[k]:e.target.value})} rows={2} className="w-full rounded-xl px-4 py-2.5 text-xs resize-none focus:outline-none" style={{background:bg,border:`1px solid ${border}`,color:T.text}}/></div>
        )}
        <button onClick={()=>ajouterAnalyse(match.id)} className="w-full py-2 rounded-xl text-xs font-bold" style={{background:'rgba(251,146,60,.15)',color:'#fb923c',border:'1px solid rgba(251,146,60,.22)'}}>📋 Sauvegarder</button>
      </div>}
      {mn.length>0&&<div className="px-4 pb-3">
        <p className="text-[9px] font-black uppercase tracking-widest mb-2.5" style={{color:'rgba(168,85,247,.7)'}}>📊 Notes ({mn.length})</p>
        <div className="space-y-2">{mn.map((n:any)=><div key={n.id} className="rounded-2xl p-3.5" style={{background:'rgba(168,85,247,.06)',border:'1px solid rgba(168,85,247,.12)'}}>
          <div className="flex items-center justify-between mb-3">
            <p className="font-black text-xs" style={{color:P}}>{n.joueur}</p>
            <div className="flex items-center gap-1.5">
              {user&&(isAdmin||user.uid===n.joueurId)&&<button onClick={()=>setNoteEdit({id:n.id,mental:String(Math.min(10,Math.max(0,parseInt(n.mental)||0))),communication:String(Math.min(10,Math.max(0,parseInt(n.communication)||0))),gameplay:String(Math.min(10,Math.max(0,parseInt(n.gameplay)||0))),joueur:n.joueur})} className="px-2 py-1 rounded-lg text-[9px] font-bold" style={{background:'rgba(168,85,247,.18)',color:'#c084fc',border:'1px solid rgba(168,85,247,.25)'}}>✏️</button>}
              {isAdmin&&<button onClick={()=>del('notes',n.id)} className="w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{background:'rgba(239,68,68,.1)'}}>🗑️</button>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">{[{k:'mental',icon:'🧠',label:'Mental',color:'#c084fc'},{k:'communication',icon:'💬',label:'Comm',color:'#60a5fa'},{k:'gameplay',icon:'🎯',label:'Perf',color:'#4ade80'}].map(({k,icon,label,color})=>
            <div key={k} className="rounded-xl p-2.5 text-center" style={{background:isDark?'rgba(255,255,255,.04)':'rgba(0,0,0,.04)'}}>
              <p className="text-sm mb-0.5">{icon}</p>
              <p className="text-lg font-black" style={{color}}>{Math.min(10,parseInt((n as any)[k])||0)}</p>
              <p className="text-[8px]" style={{color:T.textMuted}}>{label}</p>
              <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,.08)'}}><div className="h-full rounded-full" style={{width:`${(Math.min(10,parseInt((n as any)[k])||0)/10)*100}%`,background:color}}/></div>
            </div>
          )}</div>
        </div>)}</div>
      </div>}
      {mc.length>0&&<div className="px-4 pb-3">
        <p className="text-[9px] font-black uppercase tracking-widest mb-2.5" style={{color:'rgba(34,211,238,.7)'}}>💬 Commentaires ({mc.length})</p>
        <div className="space-y-2">{mc.map((c:any)=><div key={c.id} className="rounded-xl p-3.5" style={{background:'rgba(34,211,238,.05)',border:'1px solid rgba(34,211,238,.1)'}}>
          <div className="flex items-center justify-between mb-1.5"><p className="text-xs font-black" style={{color:'#22d3ee'}}>{c.joueur}</p><div className="flex items-center gap-2"><p className="text-[9px]" style={{color:T.textMuted}}>{fts(c.createdAt)}</p>{(isAdmin||user?.uid===c.joueurId)&&<button onClick={()=>del('commentaires',c.id)} className="text-red-400/50 text-xs">🗑️</button>}</div></div>
          <p className="text-xs leading-relaxed" style={{color:T.textMuted}}>{c.texte}</p>
        </div>)}</div>
      </div>}
      {ma.length>0&&<div className="px-4 pb-4">
        <p className="text-[9px] font-black uppercase tracking-widest mb-2.5" style={{color:'rgba(251,146,60,.7)'}}>📋 Analyses ({ma.length})</p>
        <div className="space-y-2">{ma.map((a:any)=><div key={a.id} className="rounded-xl p-3.5" style={{background:'rgba(251,146,60,.05)',border:'1px solid rgba(251,146,60,.1)'}}>
          <div className="flex items-center justify-between mb-2"><p className="text-xs font-black" style={{color:'#fb923c'}}>{a.joueur}</p>{(isAdmin||user?.uid===a.joueurId)&&<button onClick={()=>del('analyses',a.id)} className="text-red-400/50 text-xs">🗑️</button>}</div>
          <div className="space-y-2">
            {a.bien&&<div className="rounded-lg p-2.5" style={{background:'rgba(74,222,128,.08)'}}><p className="text-[8px] font-black text-green-400 mb-1">✅</p><p className="text-xs" style={{color:T.textMuted}}>{a.bien}</p></div>}
            {a.mal&&<div className="rounded-lg p-2.5" style={{background:'rgba(248,113,113,.08)'}}><p className="text-[8px] font-black text-red-400 mb-1">❌</p><p className="text-xs" style={{color:T.textMuted}}>{a.mal}</p></div>}
            {a.plan&&<div className="rounded-lg p-2.5" style={{background:'rgba(96,165,250,.08)'}}><p className="text-[8px] font-black text-blue-400 mb-1">🎯</p><p className="text-xs" style={{color:T.textMuted}}>{a.plan}</p></div>}
          </div>
        </div>)}</div>
      </div>}
      {mn.length===0&&mc.length===0&&ma.length===0&&<p className="text-center text-[10px] pb-4" style={{color:T.textMuted}}>Aucune donnée</p>}
    </div>
  })}</div>}

  {/* ✅ MODALE NOTE COMPACTE - Plus besoin de scroller */}
  {noteEdit&&<Mo onClose={()=>setNoteEdit(null)} title="✏️ Modifier ma note" sub={noteEdit.joueur}>
    <div className="space-y-3 mb-5">{[{key:'mental',label:'🧠 Mental',color:'#c084fc',bg:'rgba(168,85,247,.12)'},{key:'communication',label:'💬 Communication',color:'#60a5fa',bg:'rgba(96,165,250,.12)'},{key:'gameplay',label:'🎯 Performance',color:'#4ade80',bg:'rgba(74,222,128,.12)'}].map(({key,label,color,bg})=>
      <div key={key}>
        <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{color}}>{label}</p>
        <div className="flex items-center gap-2">
          <button onClick={()=>setNoteEdit({...noteEdit,[key]:String(Math.max(0,parseInt(noteEdit[key]||'0')-1))})} className="w-10 h-10 rounded-xl font-black text-lg flex items-center justify-center flex-shrink-0" style={{background:bg,color,border:`1px solid ${color}35`}}>−</button>
          <div className="flex-1 text-center py-2.5 rounded-xl text-2xl font-black" style={{background:bg,color,border:`1px solid ${color}28`}}>{noteEdit[key]}/10</div>
          <button onClick={()=>setNoteEdit({...noteEdit,[key]:String(Math.min(10,parseInt(noteEdit[key]||'0')+1))})} className="w-10 h-10 rounded-xl font-black text-lg flex items-center justify-center flex-shrink-0" style={{background:bg,color,border:`1px solid ${color}35`}}>+</button>
        </div>
      </div>
    )}</div>
    <div className="flex gap-2">
      <button onClick={()=>setNoteEdit(null)} className="flex-1 py-2.5 rounded-2xl font-bold text-sm" style={{background:'rgba(255,255,255,.05)',color:T.textMuted,border:`1px solid ${T.cardBorder}`}}>Annuler</button>
      <button onClick={updateNote} className="flex-1 py-2.5 rounded-2xl font-black text-sm text-black" style={{background:G2}}>✅ Sauvegarder</button>
    </div>
  </Mo>}

  {/* ✅ MODALE AJOUT NOTE COMPACTE avec boutons +/- */}
  {selectedMatchForNotes&&<Mo onClose={()=>setSelectedMatchForNotes(null)} title={`📊 ${selectedMatchForNotes.adversaire}`} sub="Évalue la performance (0 à 10)">
    <div className="space-y-3 mb-5">{[{key:'mental',label:'🧠 Mental',color:'#c084fc',bg:'rgba(168,85,247,.12)'},{key:'communication',label:'💬 Communication',color:'#60a5fa',bg:'rgba(96,165,250,.12)'},{key:'gameplay',label:'🎯 Performance',color:'#4ade80',bg:'rgba(74,222,128,.12)'}].map(({key,label,color,bg})=>
      <div key={key}>
        <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{color}}>{label}</p>
        <div className="flex items-center gap-2">
          <button onClick={()=>setNouvelleNote({...nouvelleNote,[key]:Math.max(0,(nouvelleNote as any)[key]-1)})} className="w-10 h-10 rounded-xl font-black text-lg flex items-center justify-center flex-shrink-0" style={{background:bg,color,border:`1px solid ${color}35`}}>−</button>
          <div className="flex-1 text-center py-2.5 rounded-xl text-2xl font-black" style={{background:bg,color,border:`1px solid ${color}28`}}>{(nouvelleNote as any)[key]}/10</div>
          <button onClick={()=>setNouvelleNote({...nouvelleNote,[key]:Math.min(10,(nouvelleNote as any)[key]+1)})} className="w-10 h-10 rounded-xl font-black text-lg flex items-center justify-center flex-shrink-0" style={{background:bg,color,border:`1px solid ${color}35`}}>+</button>
        </div>
      </div>
    )}</div>
    <div className="flex gap-2">
      <button onClick={()=>setSelectedMatchForNotes(null)} className="flex-1 py-2.5 rounded-2xl font-bold text-sm" style={{background:'rgba(255,255,255,.05)',color:T.textMuted,border:`1px solid ${T.cardBorder}`}}>Annuler</button>
      <button onClick={ajouterNote} className="flex-1 py-2.5 rounded-2xl font-black text-sm text-black" style={{background:G2}}>✅ Envoyer</button>
    </div>
  </Mo>}
</div>
)}

{activeTab==='rec'&&(
<div className="ce"><ST icon="🎬" title="Replays"/>
  <a href={YT} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl font-black text-sm mb-5 active:scale-95" style={{background:'rgba(239,68,68,.12)',color:'#f87171',border:'1px solid rgba(239,68,68,.22)'}}>
    <span className="w-2 h-2 rounded-full ld" style={{background:'#f87171'}}/>Chaîne YouTube DYNO
  </a>
  {replays.length===0?<div className="rounded-3xl p-14 text-center" style={CS}><p className="text-5xl mb-4">📹</p><p className="text-sm font-bold" style={{color:T.textMuted}}>Aucun replay</p></div>
  :<div className="space-y-3">{replays.map((r:any,idx:number)=><div key={r.id} className="rounded-3xl overflow-hidden ce" style={{...CS,animationDelay:`${idx*.05}s`}}>
    <div className="px-5 pt-4 pb-3 flex items-center justify-between" style={{borderBottom:`1px solid ${T.cardBorder}`}}>
      <h3 className="font-black" style={{color:T.text}}>{r.titre}</h3>
      {isAdmin&&<button onClick={()=>del('replays',r.id)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'rgba(239,68,68,.1)'}}>🗑️</button>}
    </div>
    <div className="p-4">{ytId(r.lien)?<div className="relative w-full rounded-2xl overflow-hidden" style={{paddingBottom:'56.25%'}}><iframe src={`https://www.youtube.com/embed/${ytId(r.lien)}`} className="absolute top-0 left-0 w-full h-full" frameBorder="0" allowFullScreen/></div>:<a href={r.lien} target="_blank" rel="noreferrer" className="block w-full py-3.5 rounded-2xl font-bold text-center text-sm" style={{background:G2,color:'#000'}}>▶️ Voir le replay</a>}</div>
  </div>)}</div>}
</div>
)}

{activeTab==='roster'&&(
<div className="ce"><ST icon="👥" title="Roster"/>
  <div className="rounded-2xl p-4 mb-5" style={{background:`${P}08`,border:`1px solid ${P}18`}}>
    <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{color:`${P}80`}}>👮 Ton rôle</p>
    <div className="flex items-center gap-2">
      <span className="px-3 py-1.5 rounded-full text-xs font-black" style={{background:`${P}18`,color:P,border:`1px solid ${P}30`}}>{userRole}</span>
      <p className="text-[10px]" style={{color:T.textMuted}}>{userRole==='Admin'?'Accès complet':userRole==='Coach'?'Strats + Fiches':userRole==='Capitaine'?'Strats uniquement':'Voir + Voter'}</p>
    </div>
  </div>
  {user&&<div className="rounded-2xl p-4 mb-5" style={{background:'rgba(236,72,153,.08)',border:'1px solid rgba(236,72,153,.15)'}}>
    <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{color:'rgba(236,72,153,.7)'}}>🎂 Anniversaire</p>
    <div className="flex gap-2">
      <input type="date" value={anniversaire} onChange={(e:any)=>setAnniversaire(e.target.value)} className={`flex-1 ${iCls} py-2.5`} style={{...IS,border:'1px solid rgba(236,72,153,.25)'}}/>
      <button onClick={sauvegarderAnniversaire} className="px-4 py-2.5 rounded-2xl font-black text-xs active:scale-95" style={{background:'rgba(236,72,153,.18)',color:'#f472b6',border:'1px solid rgba(236,72,153,.25)'}}>💾</button>
    </div>
  </div>}
  <div className="space-y-2.5">{joueurs.filter((j:any)=>j.actif!==false).map((j:any,idx:number)=><div key={j.id} className="rounded-2xl p-4 flex items-center gap-4 ce" style={{...CS,animationDelay:`${idx*.05}s`}}>
    <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0" style={{background:`linear-gradient(135deg,${P}25,${P}08)`,border:`1px solid ${P}22`,color:P}}>{j.pseudo[0]?.toUpperCase()}</div>
    <div className="flex-1 min-w-0">
      <p className="font-black" style={{color:T.text}}>{j.pseudo}</p>
      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block" style={{background:`${ROLE_COLORS[j.role]||'rgba(255,255,255,.15)'}15`,color:ROLE_COLORS[j.role]||T.textMuted,border:`1px solid ${ROLE_COLORS[j.role]||'rgba(255,255,255,.1)'}30`}}>{j.role||'Joueur'}</span>
    </div>
    <div className="flex items-center gap-2">
      {isAdmin&&<select value={j.role||'Joueur'} onChange={(e:any)=>updatePlayerRole(j.id,j.userId,e.target.value)} className="text-xs rounded-xl px-2 py-1.5 font-bold focus:outline-none" style={{background:T.input,border:`1px solid ${T.inputBorder}`,color:T.text}}>{ROLES.map(r=><option key={r} value={r}>{r}</option>)}</select>}
      {isAdmin&&<button onClick={()=>del('players',j.id)} className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:'rgba(239,68,68,.1)'}}>🗑️</button>}
    </div>
  </div>)}</div>
</div>
)}

{activeTab==='stats'&&(
<div className="ce"><ST icon="📈" title="Statistiques"/>
  <div className="grid grid-cols-3 gap-3 mb-5"><SC value={`${winRate}%`} label="Win Rate"/><SC value={victoires} label="Victoires" color="#4ade80"/><SC value={defaites} label="Défaites" color="#f87171"/></div>
  {winRateData.length>1&&<div className="rounded-3xl p-5 mb-4" style={CS}>
    <p className="text-xs font-black uppercase tracking-widest mb-4" style={{color:`${P}80`}}>📈 Évolution Win Rate</p>
    <ResponsiveContainer width="100%" height={160}><LineChart data={winRateData}><XAxis dataKey="name" tick={{fontSize:9,fill:T.textMuted}} axisLine={false} tickLine={false}/><YAxis domain={[0,100]} tick={{fontSize:9,fill:T.textMuted}} axisLine={false} tickLine={false} tickFormatter={(v:any)=>`${v}%`}/><Tooltip contentStyle={{background:isDark?'#111008':'#fffdf0',border:`1px solid ${T.cardBorder}`,borderRadius:12,fontSize:11}} formatter={(v:any)=>[`${v}%`,'Win Rate']}/><Line type="monotone" dataKey="wr" stroke={P} strokeWidth={2.5} dot={{fill:P,r:3}} activeDot={{r:5,fill:P2}}/></LineChart></ResponsiveContainer>
  </div>}
  {typeData.length>0&&<div className="rounded-3xl p-5 mb-4" style={CS}>
    <p className="text-xs font-black uppercase tracking-widest mb-4" style={{color:`${P}80`}}>📊 Par type</p>
    <ResponsiveContainer width="100%" height={140}><BarChart data={typeData} barCategoryGap="30%"><XAxis dataKey="name" tick={{fontSize:9,fill:T.textMuted}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:9,fill:T.textMuted}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:isDark?'#111008':'#fffdf0',border:`1px solid ${T.cardBorder}`,borderRadius:12,fontSize:11}}/><Bar dataKey="matchs" fill={`${P}25`} radius={[6,6,0,0]} name="Total"/><Bar dataKey="victoires" radius={[6,6,0,0]} name="Victoires">{typeData.map((_:any,i:number)=><Cell key={i} fill={P}/>)}</Bar></BarChart></ResponsiveContainer>
  </div>}
  {notesChartData.length>0&&<div className="rounded-3xl p-5 mb-4" style={CS}>
    <p className="text-xs font-black uppercase tracking-widest mb-4" style={{color:`${P}80`}}>🧠 Notes par joueur</p>
    <ResponsiveContainer width="100%" height={160}><BarChart data={notesChartData} barCategoryGap="20%"><XAxis dataKey="name" tick={{fontSize:9,fill:T.textMuted}} axisLine={false} tickLine={false}/><YAxis domain={[0,10]} tick={{fontSize:9,fill:T.textMuted}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:isDark?'#111008':'#fffdf0',border:`1px solid ${T.cardBorder}`,borderRadius:12,fontSize:11}}/><Bar dataKey="mental" fill="#c084fc" radius={[4,4,0,0]} name="Mental"/><Bar dataKey="comm" fill="#60a5fa" radius={[4,4,0,0]} name="Comm"/><Bar dataKey="perf" fill="#4ade80" radius={[4,4,0,0]} name="Perf"/></BarChart></ResponsiveContainer>
  </div>}
  <div className="rounded-3xl p-6 mb-5" style={CS}>
    <p className="text-xs font-black uppercase tracking-widest mb-5" style={{color:`${P}80`}}>📊 Répartition</p>
    <div className="space-y-4">{[{label:'🏆 Victoires',value:victoires,total:totalMatchs,color:P},{label:'❌ Défaites',value:defaites,total:totalMatchs,color:'#f87171'}].map(({label,value,total,color})=>
      <div key={label}>
        <div className="flex justify-between mb-2"><span className="text-xs font-medium" style={{color:T.textMuted}}>{label}</span><span className="text-xs font-black" style={{color}}>{value} <span style={{color:T.textMuted}}>/ {total}</span></span></div>
        <div className="h-2 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,.06)'}}><div className="h-full rounded-full transition-all duration-1000" style={{width:`${total>0?(value/total)*100:0}%`,background:color,boxShadow:`0 0 8px ${color}60`}}/></div>
      </div>
    )}</div>
  </div>
  <GBtn onClick={()=>setShowBilan(true)}>📊 Bilan du mois</GBtn>
  {showBilan&&(()=>{const b=genBilan();return(
    <Mo onClose={()=>setShowBilan(false)} title={`📊 Bilan ${b.nom}`} sub="Performances du mois">
      <div className="space-y-4 mb-4">
        <div className="grid grid-cols-3 gap-2"><SC value={b.m} label="Matchs"/><SC value={`${b.w}W`} label="Victoires" color="#4ade80"/><SC value={`${b.l}L`} label="Défaites" color="#f87171"/></div>
        <div className="rounded-2xl p-6 text-center" style={{background:`${P}10`,border:`1px solid ${P}20`}}><p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{color:`${P}60`}}>Win Rate</p><p className="text-6xl font-black sg">{b.wr}%</p></div>
        <div className="rounded-2xl p-4" style={{background:isDark?'rgba(255,255,255,.04)':'rgba(0,0,0,.04)',border:`1px solid ${T.cardBorder}`}}>
          <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{color:T.textMuted}}>Notes moyennes</p>
          <div className="grid grid-cols-3 gap-2">{[{v:b.am,l:'🧠',c:'#c084fc'},{v:b.ac,l:'💬',c:'#60a5fa'},{v:b.ap,l:'🎯',c:'#4ade80'}].map(({v,l,c})=><div key={l} className="text-center rounded-xl py-3" style={{background:isDark?'rgba(255,255,255,.04)':'rgba(0,0,0,.04)'}}><p className="text-2xl font-black" style={{color:c}}>{v}</p><p className="text-[8px] mt-1" style={{color:T.textMuted}}>{l}</p></div>)}</div>
        </div>
      </div>
      <button onClick={()=>setShowBilan(false)} className="w-full py-3 rounded-2xl font-bold text-sm" style={{background:'rgba(255,255,255,.05)',color:T.textMuted,border:`1px solid ${T.cardBorder}`}}>Fermer</button>
    </Mo>
  )})()}
</div>
)}

{activeTab==='admin'&&(
<div className="ce"><ST icon="⚙️" title="Administration"/>
  {!isAdmin?<div className="rounded-3xl p-6" style={CS}>
    <p className="text-center text-sm mb-5 font-medium" style={{color:T.textMuted}}>🔐 Accès requis</p>
    <input type="password" placeholder="Mot de passe admin" value={adminPassword} onChange={(e:any)=>setAdminPassword(e.target.value)} className={`${iCls} mb-3`} style={IS}/>
    <GBtn onClick={handleAdminLogin}>Se connecter</GBtn>
  </div>:(
    <div className="space-y-4">
      <div className="rounded-3xl p-5" style={CS}>
        <p className="text-xs font-black uppercase tracking-widest mb-4" style={{color:`${P}90`}}>➕ Nouveau Match</p>
        <div className="space-y-2.5">
          <input type="text" placeholder="Adversaire / Nom soirée" value={nouveauMatch.adversaire} onChange={(e:any)=>setNouveauMatch({...nouveauMatch,adversaire:e.target.value})} className={iCls} style={IS}/>
          <input type="date" value={nouveauMatch.date} onChange={(e:any)=>setNouveauMatch({...nouveauMatch,date:e.target.value})} className={iCls} style={IS}/>
          <div className="grid grid-cols-2 gap-2">
            <input type="time" value={nouveauMatch.horaire1} onChange={(e:any)=>setNouveauMatch({...nouveauMatch,horaire1:e.target.value})} className={iCls} style={IS}/>
            <input type="time" value={nouveauMatch.horaire2} onChange={(e:any)=>setNouveauMatch({...nouveauMatch,horaire2:e.target.value})} className={iCls} style={IS}/>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select value={nouveauMatch.arene} onChange={(e:any)=>setNouveauMatch({...nouveauMatch,arene:e.target.value})} className={iCls} style={IS}><option value="Arène 1">Arène 1</option><option value="Arène 2">Arène 2</option></select>
            <select value={nouveauMatch.type} onChange={(e:any)=>setNouveauMatch({...nouveauMatch,type:e.target.value})} className={iCls} style={IS}><option value="Ligue">Ligue</option><option value="Scrim">Scrim</option><option value="Tournoi">Tournoi</option><option value="Division">Division</option></select>
          </div>
          {nouveauMatch.type==='Division'&&<div className="rounded-2xl p-4" style={{background:'rgba(245,158,11,.07)',border:'1px solid rgba(245,158,11,.18)'}}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{color:'rgba(245,158,11,.8)'}}>🏆 Division (BO3)</p>
            {nouveauMatch.sousMatchs.length>0&&<div className="space-y-1.5 mb-3">{nouveauMatch.sousMatchs.map((sm:any,i:number)=>
              <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{background:isDark?'rgba(255,255,255,.06)':'rgba(0,0,0,.06)'}}>
                <span className="text-xs" style={{color:T.text}}>DYNO vs {sm.adversaire}</span>
                <div className="flex items-center gap-2"><span className="text-xs font-black" style={{color:P}}>{sm.scoreDyno}</span><span style={{color:T.textMuted}}>—</span><span className="text-xs font-black" style={{color:T.textMuted}}>{sm.scoreAdv}</span><button onClick={()=>supprimerSousMatch(i)} className="ml-1 font-black text-red-400">×</button></div>
              </div>
            )}</div>}
            <div className="space-y-2">
              <input type="text" placeholder="Adversaire (ex: EY)" value={newSubAdv} onChange={(e:any)=>setNewSubAdv(e.target.value)} className={`${iCls} text-xs py-2.5`} style={IS}/>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Score DYNO" value={newSubScoreDyno} onChange={(e:any)=>setNewSubScoreDyno(e.target.value)} className={`${iCls} text-center font-black text-sm py-2.5`} style={{background:`${P}12`,border:`1px solid ${P}28`,color:P}}/>
                <input type="number" placeholder="Score Adv" value={newSubScoreAdv} onChange={(e:any)=>setNewSubScoreAdv(e.target.value)} className={`${iCls} text-center font-black text-sm py-2.5`} style={IS}/>
              </div>
              <button onClick={ajouterSousMatch} className="w-full py-2.5 rounded-xl text-xs font-bold" style={{background:'rgba(245,158,11,.12)',color:'#fbbf24',border:'1px solid rgba(245,158,11,.25)'}}>➕ Ajouter ce match</button>
            </div>
          </div>}
          <GBtn onClick={ajouterMatch}>📤 Ajouter + Discord</GBtn>
        </div>
      </div>
      <div className="rounded-3xl p-5" style={CS}>
        <p className="text-xs font-black uppercase tracking-widest mb-4" style={{color:`${P}90`}}>🎬 Replay</p>
        <div className="space-y-2.5">
          <input type="text" placeholder="Titre" value={nouveauReplay.titre} onChange={(e:any)=>setNouveauReplay({...nouveauReplay,titre:e.target.value})} className={iCls} style={IS}/>
          <input type="text" placeholder="Lien YouTube" value={nouveauReplay.lien} onChange={(e:any)=>setNouveauReplay({...nouveauReplay,lien:e.target.value})} className={iCls} style={IS}/>
          <GBtn onClick={ajouterReplay}>Ajouter</GBtn>
        </div>
      </div>
      <div className="rounded-3xl p-5" style={CS}>
        <p className="text-xs font-black uppercase tracking-widest mb-4" style={{color:`${P}90`}}>✏️ Modifier les Scores</p>
        {matchs.length===0?<p className="text-center text-xs py-4" style={{color:T.textMuted}}>Aucun match</p>:(
          <div className="space-y-2">{matchs.map((m:any)=>(
            <div key={m.id} className="flex items-center justify-between p-3.5 rounded-2xl" style={{background:isDark?'rgba(255,255,255,.05)':'rgba(0,0,0,.05)',border:`1px solid ${T.cardBorder}`}}>
              <div>
                <p className="text-xs font-black" style={{color:T.text}}>DYNO vs {m.adversaire}</p>
                <p className="text-[9px] mt-0.5" style={{color:T.textMuted}}>{fdf(m.date)} · {m.type}</p>
                {m.termine&&<p className="text-[9px] mt-0.5" style={{color:`${P}70`}}>Score : {m.scoreDyno} — {m.scoreAdversaire}</p>}
              </div>
              <button onClick={()=>setScoreEdit({id:m.id,adversaire:m.adversaire,type:m.type,scoreDyno:String(m.scoreDyno||0),scoreAdv:String(m.scoreAdversaire||0),sousMatchs:m.sousMatchs?[...m.sousMatchs]:[],_newSubAdv:'',_newSubScoreDyno:'',_newSubScoreAdv:''})} className="px-3 py-2 rounded-xl text-xs font-bold active:scale-95" style={{background:`${P}14`,color:P,border:`1px solid ${P}25`}}>✏️</button>
            </div>
          ))}</div>
        )}
      </div>
      <div className="rounded-3xl p-5" style={CS}>
        <p className="text-xs font-black uppercase tracking-widest mb-4" style={{color:'rgba(239,68,68,.6)'}}>🗑️ Supprimer Matchs</p>
        {matchs.length===0?<p className="text-center text-xs py-4" style={{color:T.textMuted}}>Aucun match</p>:(
          <div className="space-y-2">{matchs.map((m:any)=>(
            <div key={m.id} className="flex items-center justify-between p-3.5 rounded-2xl" style={{background:isDark?'rgba(255,255,255,.05)':'rgba(0,0,0,.05)',border:`1px solid ${T.cardBorder}`}}>
              <div><p className="text-xs font-bold" style={{color:T.text}}>{m.adversaire}</p><p className="text-[9px]" style={{color:T.textMuted}}>{fdf(m.date)}</p></div>
              <button onClick={()=>del('matchs',m.id)} className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90" style={{background:'rgba(239,68,68,.12)',border:'1px solid rgba(239,68,68,.2)'}}>🗑️</button>
            </div>
          ))}</div>
        )}
      </div>
      <GBtn onClick={handleAdminLogout} danger>🚪 Déconnexion Admin</GBtn>
    </div>
  )}
  {scoreEdit&&<Mo onClose={()=>setScoreEdit(null)} title="✏️ Modifier le score" sub={`DYNO vs ${scoreEdit.adversaire}`}>
    {scoreEdit.type==='Division'?(
      <div className="space-y-3 mb-4">
        {(scoreEdit.sousMatchs||[]).length>0&&<div className="space-y-1.5">{(scoreEdit.sousMatchs||[]).map((sm:any,i:number)=>
          <div key={i} className="flex items-center justify-between px-4 py-3 rounded-2xl" style={{background:isDark?'rgba(255,255,255,.05)':'rgba(0,0,0,.05)',border:`1px solid ${T.cardBorder}`}}>
            <span className="text-xs" style={{color:T.text}}>DYNO vs {sm.adversaire}</span>
            <div className="flex items-center gap-2"><span className="text-sm font-black" style={{color:P}}>{sm.scoreDyno}</span><span style={{color:T.textMuted}}>—</span><span className="text-sm font-black" style={{color:T.textMuted}}>{sm.scoreAdv}</span><button onClick={()=>supprimerSousMatchEdit(i)} className="ml-2 font-black text-red-400">×</button></div>
          </div>
        )}</div>}
        <div className="rounded-2xl p-4 space-y-2" style={{background:'rgba(245,158,11,.07)',border:'1px solid rgba(245,158,11,.18)'}}>
          <input type="text" placeholder="Adversaire" value={scoreEdit._newSubAdv||''} onChange={(e:any)=>setScoreEdit({...scoreEdit,_newSubAdv:e.target.value})} className={`${iCls} text-xs py-2.5`} style={IS}/>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" placeholder="DYNO" value={scoreEdit._newSubScoreDyno||''} onChange={(e:any)=>setScoreEdit({...scoreEdit,_newSubScoreDyno:e.target.value})} className={`${iCls} text-center font-black py-2.5`} style={{background:`${P}12`,border:`1px solid ${P}28`,color:P}}/>
            <input type="number" placeholder="Adv" value={scoreEdit._newSubScoreAdv||''} onChange={(e:any)=>setScoreEdit({...scoreEdit,_newSubScoreAdv:e.target.value})} className={`${iCls} text-center font-black py-2.5`} style={IS}/>
          </div>
          <button onClick={ajouterSousMatchEdit} className="w-full py-2.5 rounded-xl text-xs font-bold" style={{background:'rgba(245,158,11,.12)',color:'#fbbf24',border:'1px solid rgba(245,158,11,.25)'}}>➕ Ajouter</button>
        </div>
        {(scoreEdit.sousMatchs||[]).length>0&&<div className="rounded-xl p-4 text-center" style={{background:`${P}10`,border:`1px solid ${P}20`}}>
          <p className="text-[9px] uppercase mb-1.5" style={{color:`${P}60`}}>Total</p>
          <p className="text-3xl font-black"><span style={{color:P}}>{(scoreEdit.sousMatchs||[]).reduce((a:number,s:any)=>a+parseInt(s.scoreDyno||0),0)}</span><span style={{color:T.textMuted}}> — </span><span style={{color:T.textMuted}}>{(scoreEdit.sousMatchs||[]).reduce((a:number,s:any)=>a+parseInt(s.scoreAdv||0),0)}</span></p>
        </div>}
      </div>
    ):(
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div><p className="text-[10px] font-bold uppercase mb-2" style={{color:`${P}70`}}>DYNO</p><input type="number" placeholder="0" value={scoreEdit.scoreDyno} onChange={(e:any)=>setScoreEdit({...scoreEdit,scoreDyno:e.target.value})} className="w-full rounded-2xl px-4 py-6 text-center text-5xl font-black focus:outline-none" style={{background:`${P}12`,border:`1px solid ${P}25`,color:P}}/></div>
        <div><p className="text-[10px] font-bold uppercase mb-2" style={{color:T.textMuted}}>Adversaire</p><input type="number" placeholder="0" value={scoreEdit.scoreAdv} onChange={(e:any)=>setScoreEdit({...scoreEdit,scoreAdv:e.target.value})} className="w-full rounded-2xl px-4 py-6 text-center text-5xl font-black focus:outline-none" style={IS}/></div>
      </div>
    )}
    <div className="flex gap-2">
      <button onClick={()=>setScoreEdit(null)} className="flex-1 py-3 rounded-2xl font-bold text-sm" style={{background:'rgba(255,255,255,.05)',color:T.textMuted,border:`1px solid ${T.cardBorder}`}}>Annuler</button>
      <button onClick={updateScore} className="flex-1 py-3 rounded-2xl font-black text-sm text-black" style={{background:G2}}>✅ Sauvegarder</button>
    </div>
  </Mo>}
</div>
)}

</main>

<nav className="fixed bottom-0 left-0 right-0 z-50" style={{background:T.navBg,backdropFilter:'blur(32px)',borderTop:`1px solid ${T.navBorder}`,boxShadow:'0 -8px 40px rgba(0,0,0,0.6)'}}>
  <div className="max-w-lg mx-auto flex" style={{overflowX:'auto',scrollbarWidth:'none' as any}}>
    {navItems.map(({t,i,l})=>(
      <button key={t} onClick={()=>setActiveTab(t)} className="flex-shrink-0 flex flex-col items-center justify-center py-2.5 relative transition-all active:scale-90" style={{color:activeTab===t?P:T.textMuted,minWidth:`${100/navItems.length}%`}}>
        {activeTab===t&&<div className="absolute top-0 left-1/2 -translate-x-1/2" style={{width:'28px',height:'2.5px',background:`linear-gradient(90deg,transparent,${P},transparent)`,boxShadow:`0 0 10px ${P}80`}}/>}
        <span className="text-lg leading-none mb-0.5">{i}</span>
        <span className="text-[7px] font-black uppercase tracking-wide leading-none whitespace-nowrap" style={{color:activeTab===t?`${P}B0`:T.textMuted}}>{l}</span>
      </button>
    ))}
  </div>
</nav>

{!user&&(
  <div className="fixed inset-0 z-50 flex items-center justify-center px-3" style={{background:'rgba(0,0,0,0.97)',backdropFilter:'blur(32px)'}}>
    <div className="w-full max-w-sm rounded-3xl" style={{background:isDark?'linear-gradient(170deg,#181208,#0e0a04,#080500)':'linear-gradient(170deg,#fffdf0,#fff8d6)',border:`1px solid ${T.cardBorder}`}}>
      <div className="p-8">
        <div className="text-center mb-8">
          <img src={LG} alt="D" className="w-20 h-20 mx-auto mb-4 rounded-3xl"/>
          <h3 className="text-2xl font-black sg">{isSignUp?'Créer un compte':'Connexion'}</h3>
          <p className="text-xs mt-1.5" style={{color:T.textMuted}}>DYNO Esport Team</p>
        </div>
        <div className="space-y-3 mb-6">
          {isSignUp&&<input type="text" placeholder="Ton pseudo" value={pseudo} onChange={(e:any)=>setPseudo(e.target.value)} className={iCls} style={IS}/>}
          <input type="email" placeholder="Email" value={email} onChange={(e:any)=>setEmail(e.target.value)} className={iCls} style={IS}/>
          <input type="password" placeholder="Mot de passe" value={authPassword} onChange={(e:any)=>setAuthPassword(e.target.value)} className={iCls} style={IS}/>
        </div>
        {isSignUp?<GBtn onClick={handleSignUp} cls="mb-4">✅ Créer mon compte</GBtn>:<GBtn onClick={handleSignIn} cls="mb-4">🔐 Se connecter</GBtn>}
        <div className="text-center pt-4" style={{borderTop:`1px solid ${T.cardBorder}`}}>
          {isSignUp?<button onClick={()=>setIsSignUp(false)} className="text-xs" style={{color:T.textMuted}}>Déjà un compte ? <span className="font-black" style={{color:P}}>Se connecter</span></button>:<button onClick={()=>setIsSignUp(true)} className="text-xs" style={{color:T.textMuted}}>Pas de compte ? <span className="font-black" style={{color:P}}>S'inscrire</span></button>}
        </div>
      </div>
    </div>
  </div>
)}
</div>
)
}
export default App