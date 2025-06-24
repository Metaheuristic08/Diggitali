import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, provider, db } from "./firebase";

// Manejo de errores de autenticación
const getAuthErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/invalid-credential':
      return "Credenciales inválidas. Verifica tu email y contraseña.";
    case 'auth/user-not-found':
      return "No existe una cuenta con este email.";
    case 'auth/wrong-password':
      return "Contraseña incorrecta.";
    case 'auth/invalid-email':
      return "El formato del email no es válido.";
    case 'auth/user-disabled':
      return "Esta cuenta ha sido deshabilitada.";
    case 'auth/too-many-requests':
      return "Demasiados intentos fallidos. Intenta más tarde.";
    case 'auth/email-already-in-use':
      return "Este email ya está registrado. Intenta iniciar sesión.";
    case 'auth/weak-password':
      return "La contraseña debe tener al menos 6 caracteres.";
    case 'auth/operation-not-allowed':
      return "El registro con email/contraseña no está habilitado.";
    case 'auth/popup-closed-by-user':
      return "El usuario cerró la ventana de autenticación.";
    case 'auth/popup-blocked':
      return "El popup fue bloqueado por el navegador. Permite popups para este sitio.";
    case 'auth/cancelled-popup-request':
      return "Solicitud de popup cancelada.";
    default:
      return "Error de autenticación. Intenta nuevamente.";
  }
};

// Registrar usuario con email y contraseña
export const registerWithEmail = async (userData) => {
  const { email, password, username, age, gender, country } = userData;
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Guardar datos adicionales en Firestore
    await setDoc(doc(db, "users", user.uid), {
      username,
      email,
      age: parseInt(age),
      gender,
      country,
      createdAt: new Date(),
      lastLogin: new Date()
    });

    return { success: true, user };
  } catch (error) {
    console.error("Error en el registro:", error);
    return { 
      success: false, 
      error: getAuthErrorMessage(error.code) 
    };
  }
};

// Iniciar sesión con email y contraseña
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Actualizar última fecha de login
    await setDoc(doc(db, "users", userCredential.user.uid), {
      lastLogin: new Date()
    }, { merge: true });

    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Error de autenticación:", error);
    return { 
      success: false, 
      error: getAuthErrorMessage(error.code) 
    };
  }
};

// Iniciar sesión con Google
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Verificar si es un usuario nuevo y guardar datos
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // Usuario nuevo, guardar datos básicos
      await setDoc(docRef, {
        username: user.displayName || "Usuario",
        email: user.email,
        photoURL: user.photoURL,
        provider: "google",
        createdAt: new Date(),
        lastLogin: new Date()
      });
    } else {
      // Usuario existente, actualizar última fecha de login
      await setDoc(docRef, {
        lastLogin: new Date()
      }, { merge: true });
    }

    return { success: true, user };
  } catch (error) {
    console.error("Error en login con Google:", error);
    return { 
      success: false, 
      error: getAuthErrorMessage(error.code) 
    };
  }
};

// Restablecer contraseña
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error("Error al enviar email de recuperación:", error);
    return { 
      success: false, 
      error: getAuthErrorMessage(error.code) 
    };
  }
};

// Cerrar sesión
export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return { success: false, error: "Error al cerrar sesión" };
  }
};

// Obtener datos del usuario
export const getUserData = async (uid) => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, userData: docSnap.data() };
    } else {
      return { success: false, error: "No se encontraron datos del usuario" };
    }
  } catch (error) {
    console.error("Error al obtener datos del usuario:", error);
    return { success: false, error: "Error al obtener datos del usuario" };
  }
};

// Observador de estado de autenticación
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
