import { useState, useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore'

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDXwItLM0OZ0VmHj-DLZcH8OBy7wXiHBsM",
  authDomain: "dyno-esport.firebaseapp.com",
  projectId: "dyno-esport",
  storageBucket: "dyno-esport.firebasestorage.app",
  messagingSenderId: "808658404731",
  appId: "1:808658404731:web:f3cf29142d3038816f29de"
}

// Initialiser Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Types
interface Match {
  id?: string
  adversaire: string
  date: string
  horaires: string[]
  arene: 'Arène 1' | 'Arène 2'
  type: 'Ligue' | 'Scrim' | 'Tournoi'
  scoreDyno?: number
  scoreAdversaire?: number
  termine: boolean
  disponibles: string[]
  createdAt?: number
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
  const [isIOS, setIsIOS] = useState(false)
  const [pseudo, setPseudo] = useState<string>(() => {
    return localStorage.getItem('dyno-pseudo') || ''
  })
  const [showPseudoInput, setShowPseudoInput] = useState(false)
  const [loading, setLoading] = useState(true)

  const [matchs, setMatchs] = useState<Match[]>([])

  useEffect(() => {
    const q = query(collection(db, 'matchs'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const matchsData: Match[] = []
      snapshot.forEach((doc) => {
        matchsData.push({ id: doc.id, ...doc.data() } as Match)
      })
      setMatchs(matchsData)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (pseudo) {
      localStorage.setItem('dyno-pseudo', pseudo)
    }
  }, [pseudo])

  // Détection iOS
  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(ios)
  }, [])

  const [nouveauMatch, setNouveauMatch] = useState({
    adversaire: '',
    date: '',
    horaire1: '',
    horaire2: '',
    arene: 'Arène 1' as 'Arène 1' | 'Arène 2',
    type: 'Ligue' as 'Ligue' | 'Scrim' | 'Tournoi'
  })

  const [scoreEdit, setScoreEdit] = useState<{id: string, scoreDyno:
