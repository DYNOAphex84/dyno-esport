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
const[nouveauMatch,setNouveauMatch]=useState({adversaire:'',date:'',horaire1:'',horaire2:'',arene:'Arène 1',type:'Ligue',sousMatchs:[] as any[]})
const[scoreEdit,setScoreEdit]=useState<any>(null),[nouveauReplay,setNouveauReplay]=useState({titre:'',lien:''}),[nouvelleNote,setNouvelleNote]=useState({matchId:'',mental:'',communication:'',gameplay:''}),[selectedMatchForNotes,setSelectedMatchForNotes]=useState<any>(null),[nouvelleStrat,setNouvelleStrat]=useState({adversaire:'',picks:[] as string[],bans:[] as string[]}),[showAddStrat,setShowAddStrat]=useState(false)
const[deferredPrompt,setDeferredPrompt]=useState<any>(null),[showInstall,setShowInstall]=useState(false),[nouveauCommentaire,setNouveauCommentaire]=useState(''),[selectedMatchForComment,setSelectedMatchForComment]=useState<any>(null),[notificationsEnabled,setNotificationsEnabled]=useState(false)
const[selectedMapCompo,setSelectedMapCompo]=useState(''),[compoJoueurs,setCompoJoueurs]=useState<string[]>([]),[showAddCompo,setShowAddCompo]=useState(false),[anniversaire,setAnniversaire]=useState(''),[pullDistance,setPullDistance]=useState(0),[isRefreshing,setIsRefreshing]=useState(false)
const[showAddFiche,setShowAddFiche]=useState(false),[nouvelleFiche,setNouvelleFiche]=useState({adversaire:'',forces:'',faiblesses:'',notes:''}),[nouvelObjectif,setNouvelObjectif]=useState('')
const ty=useRef(0)

useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
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
    const unsub = onSnapshot(q, (s) => {
        const d: any[] = [];
        s.forEach((x) => d.push({ id: x.id, ...x.data() }));
        setMatchs(d);
    });
    return () => unsub();
}, []);

useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'notes'), orderBy('createdAt', 'desc')), (s) => {
        const d: any[] = [];
        s.forEach(x => d.push({ id: x.id, ...x.data() }));
        setNotes(d);
    });
    return () => unsub();
}, []);

useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'strats'), orderBy('createdAt', 'desc')), (s) => {
        const d: any[] = [];
        s.forEach(x => d.push({ id: x.id, ...x.data() }));
        setStrats(d);
    });
    return () => unsub();
}, []);

useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'replays'), orderBy('createdAt', 'desc')), (s) => {
        const d: any[] = [];
        s.forEach(x => d.push({ id: x.id, ...x.data() }));
        setReplays(d);
    });
    return () => unsub();
}, []);

useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'players'), orderBy('createdAt', 'desc')), (s) => {
        const d: any[] = [];
        s.forEach(x => d.push({ id: x.id, ...x.data() }));
        setJoueurs(d);
    });
    return () => unsub();
}, []);

useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'compos'), orderBy('createdAt', 'desc')), (s) => {
        const d: any[] = [];
        s.forEach(x => d.push({ id: x.id, ...x.data() }));
        setCompos(d);
    });
    return () => unsub();
}, []);

useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'objectifs'), orderBy('createdAt', 'desc')), (s) => {
        const d: any[] = [];
        s.forEach(x => d.push({ id: x.id, ...x.data() }));
        setObjectifs(d);
    });
    return () => unsub();
}, []);

useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'fichesAdversaires'), orderBy('createdAt', 'desc')), (s) => {
        const d: any[] = [];
        s.forEach(x => d.push({ id: x.id, ...x.data() }));
        setFichesAdversaires(d);
    });
    return () => unsub();
}, []);

const handleSignUp=async()=>{if(!email||!authPassword||!pseudo)return alert('⚠️!');try{const r=await createUserWithEmailAndPassword(auth,email,authPassword);await setDoc(doc(db,'users',r.user.uid),{pseudo,email,createdAt:Date.now(),isAdmin:email===AE});await addDoc(collection(db,'players'),{pseudo,role:'Joueur',userId:r.user.uid,createdAt:Date.now()});alert('✅!');setIsSignUp(false)}catch(e:any){alert('❌ '+e.message)}}
const handleSignIn=async()=>{if(!email||!authPassword)return alert('⚠️!');try{await signInWithEmailAndPassword(auth,email,authPassword);alert('✅!')}catch(e:any){alert('❌ '+e.message)}}
const handleSignOut=async()=>{await signOut(auth);setPseudo('');setIsAdmin(false);localStorage.removeItem('dyno-admin')}
const handleAdminLogin=()=>{if(adminPassword==='dyno2026'){setIsAdmin(true);localStorage.setItem('dyno-admin','true');setAdminPassword('')}else alert('❌!')}

const ajouterSousMatch=()=>{
  const adv=prompt('Adversaire :');if(!adv)return;
  const sd=prompt('Score DYNO :');if(sd===null)return;
  const sa=prompt(`Score ${adv} :`);if(sa===null)return;
  const nm = {adversaire:adv, scoreDyno:sd, scoreAdv:sa};
  if(scoreEdit) setScoreEdit({...scoreEdit, sousMatchs:[...(scoreEdit.sousMatchs||[]), nm]});
  else setNouveauMatch({...nouveauMatch, sousMatchs:[...nouveauMatch.sousMatchs, nm]});
}
const supprimerSousMatch=(i:number)=>{
  if(scoreEdit){
    const sm=[...(scoreEdit.sousMatchs||[])]; sm.splice(i,1);
    setScoreEdit({...scoreEdit, sousMatchs:sm});
  } else {
    const sm=[...nouveauMatch.sousMatchs]; sm.splice(i,1);
    setNouveauMatch({...nouveauMatch, sousMatchs:sm});
  }
}

const ajouterMatch=async()=>{
  if(!nouveauMatch.adversaire||!nouveauMatch.date||!nouveauMatch.horaire1) return alert('⚠️!');
  const md:any={...nouveauMatch,termine:nouveauMatch.type==='Division',disponibles:[],indisponibles:[],createdAt:Date.now()};
  if(nouveauMatch.type==='Division'){
    md.scoreDyno = nouveauMatch.sousMatchs.reduce((a:number,s:any)=>a+parseInt(s.scoreDyno||'0'),0);
    md.scoreAdversaire = nouveauMatch.sousMatchs.reduce((a:number,s:any)=>a+parseInt(s.scoreAdv||'0'),0);
  }
  await addDoc(collection(db,'matchs'),md);
  setNouveauMatch({adversaire:'',date:'',horaire1:'',horaire2:'',arene:'Arène 1',type:'Ligue',sousMatchs:[]});
  alert('✅!');
}

const updateScore=async()=>{
  if(!scoreEdit)return;
  const up:any={termine:true, scoreDyno:parseInt(scoreEdit.scoreDyno||'0'), scoreAdversaire:parseInt(scoreEdit.scoreAdv||'0')};
  if(scoreEdit.type==='Division'){
    up.sousMatchs = scoreEdit.sousMatchs;
    up.scoreDyno = scoreEdit.sousMatchs.reduce((a:any,s:any)=>a+parseInt(s.scoreDyno||'0'),0);
    up.scoreAdversaire = scoreEdit.sousMatchs.reduce((a:any,s:any)=>a+parseInt(s.scoreAdv||'0'),0);
  }
  await updateDoc(doc(db,'matchs',scoreEdit.id),up);
  setScoreEdit(null);
  alert('✅!');
}

const toggleDispo=async(mid:string)=>{if(!user)return;const m=matchs.find(x=>x.id===mid);const d=m.disponibles||[];await updateDoc(doc(db,'matchs',mid),{disponibles:d.includes(pseudo)?d.filter((p:any)=>p!==pseudo):[...d,pseudo],indisponibles:(m.indisponibles||[]).filter((p:any)=>p!==pseudo)})}
const toggleIndispo=async(mid:string)=>{if(!user)return;const m=matchs.find(x=>x.id===mid);const i=m.indisponibles||[];await updateDoc(doc(db,'matchs',mid),{indisponibles:i.includes(pseudo)?i.filter((p:any)=>p!==pseudo):[...i,pseudo],disponibles:(m.disponibles||[]).filter((p:any)=>p!==pseudo)})}
const del=async(c:string,id:string)=>{if(confirm('Supprimer ?')) await deleteDoc(doc(db,c,id))}
const toggleObjectif=async(id:string,t:boolean)=>await updateDoc(doc(db,'objectifs',id),{termine:!t})
const fdf=(s:string)=>{if(!s)return'';if(s.includes('/'))return s;const[y,m,d]=s.split('-');return`${d}/${m}/${y}`}

const victoires=matchs.filter(m=>m.termine&&m.scoreDyno>m.scoreAdversaire).length;
const defaites=matchs.filter(m=>m.termine&&m.scoreDyno<m.scoreAdversaire).length;
const historiques=matchs.filter(m=>m.termine).sort((a,b)=>b.createdAt-a.createdAt);
const prochains=matchs.filter(m=>!m.termine).sort((a,b)=>new Date(a.date).getTime()-new Date(b.date).getTime());

useEffect(()=>{const t=setTimeout(()=>setShowSplash(false),2500);return()=>clearTimeout(t)},[])

const H=({title,icon}:{title:string;icon?:string})=>(<div className="relative rounded-3xl p-7 mb-5 text-center overflow-hidden bg-gradient-to-br from-[#D4AF37]/10 via-[#D4AF37]/5 to-transparent border border-[#D4AF37]/15 shadow-lg"><img src={LG} className="w-14 mx-auto mb-2 drop-shadow-lg"/><h2 className="text-lg font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">{icon} {title}</h2></div>)

if(showSplash)return(<div className="min-h-screen flex items-center justify-center bg-black"><P/><div className="text-center"><img src={LG} className="w-48 mx-auto drop-shadow-[0_0_40px_gold]"/><h1 className="text-5xl font-black text-gold mt-6 animate-pulse">DYNO</h1></div></div>)

return(
<div className="min-h-screen pb-32 bg-[#050505] text-white">
<P/>
<header className="backdrop-blur-xl bg-black/60 border-b border-white/5 sticky top-0 z-50 p-4 flex justify-between items-center">
  <div className="flex items-center gap-2"><img src={LG} className="w-10 h-10"/><h1 className="text-lg font-black text-gold tracking-tight">DYNO</h1></div>
  {user?(<button onClick={handleSignOut} className="px-4 py-2 bg-red-600/20 text-red-500 rounded-2xl text-[10px] font-bold border border-red-500/20 uppercase">👋 {pseudo}</button>):(<button onClick={()=>setIsSignUp(false)} className="px-4 py-2 bg-gold text-black rounded-2xl text-[10px] font-bold shadow-lg">LOGIN</button>)}
</header>

<main className="max-w-lg mx-auto px-4 py-6" onTouchStart={(e)=>ty.current=e.touches[0].clientY} onTouchMove={(e)=>{const d=e.touches[0].clientY-ty.current;if(window.scrollY===0&&d>0)setPullDistance(Math.min(d*0.4,80))}} onTouchEnd={()=>{if(pullDistance>60)window.location.reload();setPullDistance(0)}}>
{pullDistance>0&&<div className="text-center text-gold text-2xl" style={{height:pullDistance}}>🔄</div>}

{activeTab==='matchs'&&(<div><H title="Next Battles"/>{prochains.map(m=>(<div key={m.id} className="card-glow bg-black/40 p-6 rounded-[2.5rem] border border-gold/15 mb-4 shadow-xl"><div className="flex justify-between mb-4"><span className="px-3 py-1 bg-gold/10 text-gold rounded-full text-[9px] font-bold border border-gold/20 uppercase">{m.type}</span><span className="text-gray-500 text-xs font-mono">{fdf(m.date)}</span></div><div className="flex items-center justify-between mb-6"><img src={LG} className="w-12"/><span className="text-gray-700 text-sm font-black">VS</span><div className="text-right"><p className="text-xl font-black text-white">{m.adversaire}</p><p className="text-[10px] text-gold/50">{m.arene}</p></div></div><div className="flex gap-2"><button onClick={()=>toggleDispo(m.id)} className={`flex-1 py-3 rounded-2xl font-bold text-xs ${(m.disponibles||[]).includes(pseudo)?'bg-gold text-black':'bg-white/5 text-gold border border-gold/10'}`}>READY</button><button onClick={()=>toggleIndispo(m.id)} className={`flex-1 py-3 rounded-2xl font-bold text-xs ${(m.indisponibles||[]).includes(pseudo)?'bg-red-600 text-white':'bg-white/5 text-red-500 border border-red-500/10'}`}>ABSENT</button></div></div>))}</div>)}

{activeTab==='historique'&&(<div><H title="Hall of Fame"/><div className="grid grid-cols-2 gap-4 mb-6"><div className="bg-gold/10 p-5 rounded-3xl border border-gold/20 text-center"><p className="text-4xl font-black text-gold">{victoires}</p><p className="text-[10px] text-gray-500 uppercase">Wins</p></div><div className="bg-red-600/10 p-5 rounded-3xl border border-red-600/20 text-center"><p className="text-4xl font-black text-red-500">{defaites}</p><p className="text-[10px] text-gray-500 uppercase">Losses</p></div></div>{historiques.map(m=>(<div key={m.id} className="card-glow bg-black/40 p-5 rounded-[2rem] border border-white/5 mb-4 shadow-xl"><div className="flex justify-between items-center mb-4"><span className={`px-3 py-1 rounded-full text-[9px] font-bold ${m.scoreDyno>m.scoreAdversaire?'bg-gold text-black':'bg-red-600 text-white'}`}>{m.scoreDyno>m.scoreAdversaire?'WIN':'LOSS'}</span><div className="flex items-center gap-3"><span className="text-gray-500 text-xs">{fdf(m.date)}</span>{isAdmin&&<button onClick={()=>setScoreEdit({...m, scoreDyno:m.scoreDyno.toString(), scoreAdv:m.scoreAdversaire.toString()})} className="text-gold">✏️</button>}</div></div><div className="flex items-center justify-between px-4"><div className="text-center"><p className="text-[10px] text-gold font-bold">DYNO</p><p className="text-4xl font-black">{m.scoreDyno}</p></div><div className="h-0.5 w-12 bg-white/5"/><div className="text-center"><p className="text-[10px] text-gray-500 font-bold uppercase">{m.adversaire}</p><p className="text-4xl font-black text-gray-500">{m.scoreAdversaire}</p></div></div>{m.sousMatchs?.length>0&&(<div className="mt-4 pt-4 border-t border-white/5 space-y-1.5">{m.sousMatchs.map((sm:any,i:number)=>(<div key={i} className="flex justify-between bg-white/5 p-3 rounded-xl text-[10px] font-bold"><span className="text-gray-400">{sm.adversaire}</span><span className="text-gold">{sm.scoreDyno} - {sm.scoreAdv}</span></div>))}</div>)}</div>))}</div>)}

{activeTab==='strats'&&(<div><H title="Tactics"/><button onClick={()=>setShowAddStrat(true)} className="w-full mb-6 py-4 bg-gold text-black rounded-3xl font-black text-sm shadow-xl">NEW STRATEGY</button>{strats.map(s=>(<div key={s.id} className="bg-black/40 p-6 rounded-[2rem] border border-gold/15 mb-4 shadow-lg"><div className="flex justify-between mb-4"><p className="text-xl font-black text-white">{s.adversaire}</p>{isAdmin&&<button onClick={()=>del('strats',s.id)} className="text-red-500/30">🗑️</button></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><p className="text-[9px] text-green-500 font-black">PICKS</p>{s.picks?.map((p:any,i:number)=>(<div key={i} className="bg-green-500/10 p-2 rounded-xl text-[10px] font-bold text-green-400">{p}</div>))}</div><div className="space-y-2"><p className="text-[9px] text-red-500 font-black">BANS</p>{s.bans?.map((b:any,i:number)=>(<div key={i} className="bg-red-500/10 p-2 rounded-xl text-[10px] font-bold text-red-400">{b}</div>))}</div></div></div>))}</div>)}

{activeTab==='compos'&&(<div><H title="Squads"/><button onClick={()=>setShowAddCompo(true)} className="w-full mb-6 py-4 bg-gold text-black rounded-3xl font-black text-sm">NEW COMPO</button>{compos.map(c=>(<div key={c.id} className="bg-black/40 p-5 rounded-[2rem] border border-white/5 mb-4 flex justify-between items-center"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center border border-gold/20 text-gold font-black">M</div><div><p className="font-black text-lg">{c.map}</p><p className="text-[9px] text-gray-500 font-bold">{(c.joueurs||[]).join(' • ')}</p></div></div>{isAdmin&&<button onClick={()=>del('compos',c.id)} className="text-red-500/30">🗑️</button></div>))}</div>)}

{activeTab==='fiches'&&(<div><H title="Scouting"/><button onClick={()=>setShowAddFiche(true)} className="w-full mb-6 py-4 bg-gold text-black rounded-3xl font-black text-sm">NEW INTEL</button>{fichesAdversaires.map(f=>(<div key={f.id} className="bg-black/40 p-6 rounded-[2rem] border border-white/5 mb-4"><div className="flex justify-between items-center mb-4"><p className="text-2xl font-black text-gold">{f.adversaire}</p>{isAdmin&&<button onClick={()=>del('fichesAdversaires',f.id)} className="text-red-500/30">🗑️</button></div><div className="space-y-4"><div><p className="text-[9px] text-green-500 font-black uppercase">Strengths</p><p className="text-xs text-gray-300 leading-relaxed">{f.forces}</p></div><div><p className="text-[9px] text-red-500 font-black uppercase">Weaknesses</p><p className="text-xs text-gray-300 leading-relaxed">{f.faiblesses}</p></div></div></div>))}</div>)}

{activeTab==='objectifs'&&(<div><H title="Missions"/><div className="flex gap-2 mb-6"><input type="text" placeholder="Personal goal..." value={nouvelObjectif} onChange={e=>setNouvelObjectif(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm outline-none"/><button onClick={async()=>{await addDoc(collection(db,'objectifs'),{texte:nouvelObjectif,termine:false,joueur:pseudo,joueurId:user.uid,createdAt:Date.now()});setNouvelObjectif('')}} className="p-4 bg-gold text-black rounded-2xl font-black">+</button></div><div className="space-y-3">{objectifs.filter(o=>o.joueurId===user?.uid).map(o=>(<div key={o.id} className={`flex items-center gap-4 p-5 rounded-3xl border ${o.termine?'bg-green-600/5 border-green-500/10 opacity-50':'bg-black/40 border-white/5 shadow-xl'}`}><button onClick={()=>toggleObjectif(o.id,o.termine)} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${o.termine?'bg-green-500 text-white':'border-gold/30 text-transparent'}`}>✓</button><p className="flex-1 text-sm font-bold">{o.texte}</p><button onClick={()=>del('objectifs',o.id)} className="text-red-500/30">🗑️</button></div>))}</div></div>)}

{activeTab==='notes'&&(<div><H title="Feedbacks"/>{historiques.map(m=>(<div key={m.id} className="bg-black/40 p-5 rounded-[2.5rem] border border-white/5 mb-4"><div className="flex justify-between items-center mb-4"><p className="font-black text-gold text-sm">{m.adversaire}</p><button onClick={()=>{setSelectedMatchForNotes(m);setNouvelleNote({matchId:m.id,mental:'',communication:'',gameplay:''})}} className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-xl text-[10px] font-bold uppercase tracking-widest">Rate</button></div><div className="space-y-3">{notes.filter(n=>n.matchId===m.id).map(n=>(<div key={n.id} className="bg-white/5 p-4 rounded-2xl border border-white/5"><div className="flex justify-between mb-2"><p className="text-xs font-bold text-gold">{n.joueur}</p>{isAdmin&&<button onClick={()=>del('notes',n.id)} className="text-red-500/30 text-[10px]">🗑️</button></div><div className="grid grid-cols-3 gap-2 text-center text-[10px] font-black"><div className="bg-white/5 p-2 rounded-xl text-purple-400">{n.mental}/10</div><div className="bg-white/5 p-2 rounded-xl text-blue-400">{n.communication}/10</div><div className="bg-white/5 p-2 rounded-xl text-green-400">{n.gameplay}/10</div></div></div>))}</div></div>))}</div>)}

{activeTab==='rec'&&(<div><H title="Theater"/><a href={YT} target="_blank" className="block w-full mb-6 py-4 bg-red-600 text-white text-center rounded-3xl font-black text-sm shadow-xl shadow-red-600/20">ACCESS YOUTUBE REPLAYS</a>{replays.map(r=>(<div key={r.id} className="bg-black/40 p-4 rounded-[2rem] border border-white/5 mb-6"><p className="font-black text-white mb-3 text-sm">{r.titre}</p><div className="relative pt-[56%] rounded-2xl overflow-hidden shadow-2xl"><iframe src={`https://www.youtube.com/embed/${r.lien.split('v=')[1]?.split('&')[0]||r.lien.split('/').pop()}`} className="absolute inset-0 w-full h-full" frameBorder="0" allowFullScreen></iframe></div></div>))}</div>)}

{activeTab==='roster'&&(<div><H title="Squad"/><div className="grid grid-cols-2 gap-3">{joueurs.map(j=>(<div key={j.id} className="bg-black/40 p-5 rounded-[2rem] border border-white/5 text-center shadow-lg"><div className="w-16 h-16 bg-gradient-to-br from-gold/20 to-gold/5 rounded-[1.5rem] mx-auto mb-4 flex items-center justify-center text-3xl font-black text-gold border border-gold/10">{j.pseudo[0]}</div><p className="font-black text-lg">{j.pseudo}</p><p className="text-[10px] text-gold/60 uppercase font-black mt-1">{j.role}</p></div>))}</div></div>)}

{activeTab==='stats'&&(<div><H title="Analytics"/><div className="grid grid-cols-2 gap-4 mb-6"><div className="bg-gold/10 p-6 rounded-[2rem] border border-gold/20 text-center shadow-xl"><p className="text-5xl font-black text-gold">{winRate}%</p><p className="text-[10px] text-gray-500 uppercase font-black mt-1">Win Rate</p></div><div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 text-center shadow-xl"><p className="text-5xl font-black text-white">{victoires+defaites}</p><p className="text-[10px] text-gray-500 uppercase font-black mt-1">Games</p></div></div></div>)}

{activeTab==='admin'&&(<div><H title="Admin Console"/>{!isAdmin?(<div className="bg-black/40 p-8 rounded-[2rem] border border-gold/20 shadow-2xl"><input type="password" placeholder="Passkey" value={adminPassword} onChange={e=>setAdminPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-center outline-none mb-4"/><button onClick={handleAdminLogin} className="w-full py-4 bg-gold text-black rounded-2xl font-black text-sm">UNLOCK</button></div>):(
<div className="space-y-6"><div className="bg-black/40 p-6 rounded-[2.5rem] border border-gold/20 shadow-2xl"><h3 className="text-xs font-black text-gold uppercase tracking-widest mb-6">➕ Add Encounter</h3><input type="text" placeholder="Enemy Name / DIV 5" value={nouveauMatch.adversaire} onChange={e=>setNouveauMatch({...nouveauMatch,adversaire:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm mb-3 outline-none focus:border-gold"/><input type="date" value={nouveauMatch.date} onChange={e=>setNouveauMatch({...nouveauMatch,date:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm mb-3 outline-none focus:border-gold"/><div className="grid grid-cols-2 gap-3 mb-4"><input type="time" value={nouveauMatch.horaire1} onChange={e=>setNouveauMatch({...nouveauMatch,horaire1:e.target.value})} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none"/><select value={nouveauMatch.type} onChange={e=>setNouveauMatch({...nouveauMatch,type:e.target.value})} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none"><option value="Ligue">Ligue</option><option value="Scrim">Scrim</option><option value="Tournoi">Tournoi</option><option value="Division">Division</option></select></div>{nouveauMatch.type==='Division'&&(
<div className="bg-white/5 rounded-3xl p-5 mb-4 border border-gold/10"><div className="flex justify-between items-center mb-4"><p className="text-[10px] text-gold font-black uppercase">Sub-matches</p><button onClick={ajouterSousMatch} className="px-4 py-2 bg-gold text-black rounded-xl text-[10px] font-black">+</button></div><div className="space-y-2">{nouveauMatch.sousMatchs.map((sm,i)=>(<div key={i} className="flex justify-between bg-black/40 p-3 rounded-2xl border border-white/5"><div className="flex-1 text-[9px]"><p className="text-gray-500 font-bold">{sm.adversaire}</p><p className="text-sm font-black">{sm.scoreDyno} - {sm.scoreAdv}</p></div><button onClick={()=>supprimerSousMatch(i)} className="text-red-500/40 p-2">🗑️</button></div>))}</div></div>
)}<button onClick={ajouterMatch} className="w-full py-4 bg-gold text-black rounded-2xl font-black text-sm">PUBLISH</button></div>
<div className="bg-black/40 p-6 rounded-[2.5rem] border border-red-500/20 shadow-2xl"><h3 className="text-xs font-black text-red-500 uppercase tracking-widest mb-6">🗑️ Clean Data</h3><div className="max-h-60 overflow-y-auto space-y-2 pr-2">{matchs.map(m=>(<div key={m.id} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5"><div><p className="text-gold font-black text-xs">{m.adversaire}</p><p className="text-[9px] text-gray-600">{fdf(m.date)}</p></div><button onClick={()=>del('matchs',m.id)} className="p-3 text-red-500/30 text-xs">🗑️</button></div>))}</div></div></div>)}</div>)}

</main>

<nav className="fixed bottom-6 left-6 right-6 z-50"><div className="max-w-xl mx-auto flex backdrop-blur-3xl bg-black/60 rounded-[2.5rem] border border-white/10 p-2 shadow-2xl overflow-x-auto no-scrollbar scroll-smooth">
{[{t:'matchs',i:'📅'},{t:'historique',i:'📜'},{t:'strats',i:'🎯'},{t:'compos',i:'📋'},{t:'fiches',i:'🔍'},{t:'notes',i:'📊'},{t:'objectifs',i:'🎯'},{t:'rec',i:'🎬'},{t:'roster',i:'👥'},{t:'stats',i:'📈'},{t:'admin',i:'⚙️'}].map(({t,i})=>(
<button key={t} onClick={()=>setActiveTab(t)} className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 ${activeTab===t?'bg-gold text-black scale-110 shadow-lg shadow-gold/20':'text-gray-700 hover:text-white'}`}><span className="text-lg">{i}</span></button>
))}
</div></nav>

{scoreEdit&&(<div className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center z-[100] p-4"><div className="bg-[#111] p-8 rounded-[3rem] border border-gold/20 w-full max-w-sm shadow-2xl"><h3 className="text-xl font-black text-gold text-center mb-8 uppercase tracking-widest">Update Match</h3>
{scoreEdit.type==='Division'?(<div className="space-y-4 mb-8"><div className="flex justify-between items-center"><p className="text-[10px] text-gray-500 font-black uppercase tracking-tighter">Sub-Matches List</p><button onClick={ajouterSousMatch} className="px-4 py-2 bg-gold text-black rounded-xl text-[10px] font-black">+</button></div><div className="max-h-60 overflow-y-auto space-y-2">{scoreEdit.sousMatchs?.map((sm:any,i:number)=>(<div key={i} className="bg-white/5 p-4 rounded-2xl flex justify-between items-center"><div className="flex-1"><p className="text-[9px] text-gray-500 font-bold">{sm.adversaire}</p><p className="text-lg font-black text-white">{sm.scoreDyno} - {sm.scoreAdv}</p></div><button onClick={()=>supprimerSousMatch(i)} className="text-red-500/30 p-2">🗑️</button></div>))}</div></div>):(
<div className="grid grid-cols-2 gap-4 mb-8"><div><label className="text-[9px] text-gray-500 font-black uppercase block mb-2 text-center">DYNO</label><input type="number" value={scoreEdit.scoreDyno} onChange={e=>setScoreEdit({...scoreEdit,scoreDyno:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-2xl font-black text-center text-gold outline-none"/></div><div><label className="text-[9px] text-gray-500 font-black uppercase block mb-2 text-center">ADV</label><input type="number" value={scoreEdit.scoreAdv} onChange={e=>setScoreEdit({...scoreEdit,scoreAdv:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-2xl font-black text-center text-gray-500 outline-none"/></div></div>
)}<div className="flex gap-3"><button onClick={()=>setScoreEdit(null)} className="flex-1 py-4 bg-white/5 rounded-2xl font-black text-[10px] text-gray-500">CANCEL</button><button onClick={updateScore} className="flex-1 py-4 bg-gold text-black rounded-2xl font-black text-[10px] shadow-xl">SAVE</button></div></div></div>)}

{selectedMatchForNotes&&(<div className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center z-[100] p-4"><div className="bg-[#111] p-8 rounded-[3rem] border border-purple-500/20 w-full max-w-sm shadow-2xl"><h3 className="text-xl font-black text-purple-400 mb-8 uppercase tracking-widest text-center">Feedback</h3><div className="space-y-6 mb-8 text-left">
  <div><label className="text-[10px] text-gray-500 font-black uppercase mb-2 block">🧠 Mental</label><input type="number" min="0" max="10" value={nouvelleNote.mental} onChange={e=>setNouvelleNote({...nouvelleNote,mental:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-xl font-black focus:border-purple-500 outline-none"/></div>
  <div><label className="text-[10px] text-gray-500 font-black uppercase mb-2 block">💬 Comm</label><input type="number" min="0" max="10" value={nouvelleNote.communication} onChange={e=>setNouvelleNote({...nouvelleNote,communication:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-xl font-black focus:border-purple-500 outline-none"/></div>
  <div><label className="text-[10px] text-gray-500 font-black uppercase mb-2 block">🎯 Skill</label><input type="number" min="0" max="10" value={nouvelleNote.gameplay} onChange={e=>setNouvelleNote({...nouvelleNote,gameplay:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-xl font-black focus:border-purple-500 outline-none"/></div>
</div><div className="flex gap-3"><button onClick={()=>setSelectedMatchForNotes(null)} className="flex-1 py-4 bg-white/5 rounded-2xl font-black text-xs text-gray-500 uppercase">Cancel</button><button onClick={async()=>{await addDoc(collection(db,'notes'),{...nouvelleNote, matchId:selectedMatchForNotes.id, joueur:pseudo, joueurId:user.uid, createdAt:Date.now()});setSelectedMatchForNotes(null);alert('✅!');}} className="flex-1 py-4 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase">Submit</button></div></div></div>)}

{showAddStrat&&(<div className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center z-[100] p-4"><div className="bg-[#111] p-8 rounded-[3rem] border border-gold/20 w-full max-w-sm shadow-2xl"><h3 className="text-xl font-black text-gold text-center mb-6 uppercase tracking-widest">Tactical Brief</h3><input type="text" placeholder="Opponent Name" value={nouvelleStrat.adversaire} onChange={e=>setNouvelleStrat({...nouvelleStrat,adversaire:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 text-white outline-none focus:border-gold"/><div className="space-y-6 mb-8">
<div><p className="text-[10px] text-green-500 font-black uppercase mb-2">Picks (Max 4)</p><div className="grid grid-cols-3 gap-2">{AM.map(m=>(<button key={m} onClick={()=>{const p=nouvelleStrat.picks.includes(m)?nouvelleStrat.picks.filter(x=>x!==m):[...nouvelleStrat.picks,m].slice(0,4);setNouvelleStrat({...nouvelleStrat,picks:p})}} className={`p-2 rounded-xl text-[8px] font-black border transition-all ${nouvelleStrat.picks.includes(m)?'bg-green-600 border-green-400 text-white':'bg-white/5 border-white/10 text-gray-600'}`}>{m}</button>))}</div></div>
<div><p className="text-[10px] text-red-500 font-black uppercase mb-2">Bans (Max 4)</p><div className="grid grid-cols-3 gap-2">{AM.map(m=>(<button key={m} onClick={()=>{const b=nouvelleStrat.bans.includes(m)?nouvelleStrat.bans.filter(x=>x!==m):[...nouvelleStrat.bans,m].slice(0,4);setNouvelleStrat({...nouvelleStrat,bans:b})}} className={`p-2 rounded-xl text-[8px] font-black border transition-all ${nouvelleStrat.bans.includes(m)?'bg-red-600 border-red-400 text-white':'bg-white/5 border-white/10 text-gray-600'}`}>{m}</button>))}</div></div>
</div><div className="flex gap-3"><button onClick={()=>setShowAddStrat(false)} className="flex-1 py-4 bg-white/5 rounded-2xl font-black text-xs text-gray-500">BACK</button><button onClick={async()=>{await addDoc(collection(db,'strats'),{...nouvelleStrat, auteur:pseudo, auteurId:user.uid, createdAt:Date.now()});setShowAddStrat(false);alert('✅!');}} className="flex-1 py-4 bg-gold text-black rounded-2xl font-black text-xs">CREATE</button></div></div></div>)}

{showAddCompo&&(<div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4"><div className="bg-[#111] p-8 rounded-[3rem] border border-gold/20 w-full max-w-sm"><h3 className="text-xl font-black text-gold text-center mb-6 uppercase tracking-widest">Add Map Comp</h3><select value={selectedMapCompo} onChange={e=>setSelectedMapCompo(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white mb-6 outline-none">{AM.map(m=>(<option key={m} value={m}>{m}</option>))}</select><div className="mb-8"><p className="text-[10px] text-gray-500 font-black uppercase mb-3">Select Squad Members</p><div className="grid grid-cols-2 gap-2">{joueurs.map(j=>(<button key={j.id} onClick={()=>{const c=compoJoueurs.includes(j.pseudo)?compoJoueurs.filter(p=>p!==j.pseudo):[...compoJoueurs,j.pseudo];setCompoJoueurs(c)}} className={`p-3 rounded-2xl text-[10px] font-black border transition-all ${compoJoueurs.includes(j.pseudo)?'bg-gold text-black border-gold shadow-lg shadow-gold/10':'bg-white/5 border-white/10 text-gray-600'}`}>{j.pseudo}</button>))}</div></div><div className="flex gap-3"><button onClick={()=>setShowAddCompo(false)} className="flex-1 py-4 bg-white/5 rounded-2xl font-black text-xs text-gray-500 uppercase">Cancel</button><button onClick={async()=>{await addDoc(collection(db,'compos'),{map:selectedMapCompo,joueurs:compoJoueurs,auteur:pseudo,createdAt:Date.now()});setShowAddCompo(false);alert('✅!');}} className="flex-1 py-4 bg-gold text-black rounded-2xl font-black text-xs uppercase">Save</button></div></div></div>)}

{showAddFiche&&(<div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4"><div className="bg-[#111] p-8 rounded-[3rem] border border-gold/20 w-full max-w-sm shadow-2xl"><h3 className="text-xl font-black text-gold text-center mb-6 uppercase tracking-widest">Scouting Report</h3><div className="space-y-4 mb-8"><input type="text" placeholder="Opponent Name" value={nouvelleFiche.adversaire} onChange={e=>setNouvelleFiche({...nouvelleFiche,adversaire:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none"/><textarea placeholder="Strengths" value={nouvelleFiche.forces} onChange={e=>setNouvelleFiche({...nouvelleFiche,forces:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white h-24 text-xs resize-none outline-none"/><textarea placeholder="Weaknesses" value={nouvelleFiche.faiblesses} onChange={e=>setNouvelleFiche({...nouvelleFiche,faiblesses:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white h-24 text-xs resize-none outline-none"/></div><div className="flex gap-3"><button onClick={()=>setShowAddFiche(false)} className="flex-1 py-4 bg-white/5 rounded-2xl font-black text-xs text-gray-500 uppercase">Back</button><button onClick={async()=>{await addDoc(collection(db,'fichesAdversaires'),{...nouvelleFiche, auteur:pseudo, createdAt:Date.now()});setShowAddFiche(false);alert('✅!');}} className="flex-1 py-4 bg-gold text-black rounded-2xl font-black text-xs uppercase">Store Intel</button></div></div></div>)}

{!user&&(<div className="fixed inset-0 bg-black flex items-center justify-center z-[200] p-6 text-center"><div className="w-full max-w-sm bg-gradient-to-br from-[#111] to-black p-10 rounded-[3.5rem] border border-white/10 shadow-2xl"><img src={LG} className="w-24 mx-auto mb-8 drop-shadow-[0_0_20px_gold]"/><h2 className="text-2xl font-black text-white mb-8 tracking-widest uppercase">{isSignUp?'Join Dyno':'System Login'}</h2>{isSignUp&&<input type="text" placeholder="Username" value={pseudo} onChange={e=>setPseudo(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 text-white outline-none focus:border-gold"/>}<input type="email" placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 text-white outline-none focus:border-gold"/><input type="password" placeholder="Password" value={authPassword} onChange={e=>setAuthPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 text-white outline-none focus:border-gold"/><button onClick={isSignUp?handleSignUp:handleSignIn} className="w-full py-5 bg-gold text-black rounded-3xl font-black tracking-widest text-sm shadow-xl shadow-gold/20 mb-6 uppercase">Authorize</button><button onClick={()=>setIsSignUp(!isSignUp)} className="text-gold text-[10px] font-black uppercase tracking-widest">{isSignUp?'Back to login':'Create Account'}</button></div></div>)}

</div>)}

export default App