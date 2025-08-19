import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getStorage, type FirebaseStorage } from "firebase/storage"
import { getAnalytics, type Analytics } from "firebase/analytics"


const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: "",
}


let app: FirebaseApp | undefined
try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApps()[0]
  }
} catch (error) {
  console.error("Error initializing Firebase app:", error)
}


let auth: Auth | undefined
let db: Firestore | undefined
let analytics: Analytics | null = null
let storage: FirebaseStorage | undefined
let provider: GoogleAuthProvider | undefined

try {
  if (app) {
    auth = getAuth(app)
    db = getFirestore(app)
  storage = getStorage(app)

    
    if (typeof window !== "undefined") {
      analytics = getAnalytics(app)
    }

    
    provider = new GoogleAuthProvider()
    provider.setCustomParameters({
      prompt: "select_account",
    })
  }
} catch (error) {
  console.error("Error initializing Firebase services:", error)
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
