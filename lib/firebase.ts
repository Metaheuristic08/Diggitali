import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getStorage, type FirebaseStorage } from "firebase/storage"
import { getAnalytics, type Analytics } from "firebase/analytics"


const firebaseConfig = {
  apiKey: "AIzaSyAahNL2-uxj6wOGieWXdDUvcEx9Gdka-a0",
  authDomain: "ladico-3eef2.firebaseapp.com",
  projectId: "ladico-3eef2",
  storageBucket: "ladico-3eef2.firebasestorage.app",
  messagingSenderId: "622858666638",
  appId: "1:622858666638:web:f512807a2b6550f59d3fdf",
  measurementId: "G-HB4GCM2JX3"
};


// Inicialización segura de Firebase solo en el cliente
let app: FirebaseApp | undefined
let auth: Auth | undefined
let db: Firestore | undefined
let analytics: Analytics | null = null
let storage: FirebaseStorage | undefined
let provider: GoogleAuthProvider | undefined

// Inicializa Firebase solo en el cliente
if (typeof window !== 'undefined') {
  try {
    // Evitar múltiples inicializaciones
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApps()[0]
    }

    if (app) {
      auth = getAuth(app)
      db = getFirestore(app)
      storage = getStorage(app)
      analytics = getAnalytics(app)
      
      provider = new GoogleAuthProvider()
      provider.setCustomParameters({
        prompt: "select_account",
      })
    }
  } catch (error) {
    console.error("Error initializing Firebase services:", error)
  }
}


export function getFirebaseAnalytics(): Analytics | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    if (app && !analytics) {
      analytics = getAnalytics(app)
    }
    return analytics
  } catch (error) {
    console.error("Error getting Firebase Analytics:", error)
    return null
  }
}

export { auth, db, analytics, provider }
export default app
export { storage }
