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
import { handleFirebaseError, withErrorRecovery, ErrorLogger } from "../utils/errorHandling";
import { validateRegistrationForm, validateLoginForm, sanitizeInput } from "../utils/enhancedValidation";

// Registrar usuario con email y contraseña
export const registerWithEmail = async (userData) => {
  try {
    // Validar datos de entrada
    const validation = validateRegistrationForm(userData);
    if (!validation.isValid) {
      return {
        success: false,
        error: "Datos de registro inválidos",
        details: validation.errors
      };
    }

    // Sanitizar datos
    const sanitizedData = {
      email: sanitizeInput(userData.email).toLowerCase(),
      password: userData.password, // No sanitizar contraseña
      username: sanitizeInput(userData.username),
      age: parseInt(userData.age),
      gender: userData.gender,
      country: sanitizeInput(userData.country)
    };

    // Crear usuario con recuperación automática
    const result = await withErrorRecovery(async () => {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        sanitizedData.email, 
        sanitizedData.password
      );
      
      const user = userCredential.user;

      // Guardar datos adicionales en Firestore
      await setDoc(doc(db, "users", user.uid), {
        username: sanitizedData.username,
        email: sanitizedData.email,
        age: sanitizedData.age,
        gender: sanitizedData.gender,
        country: sanitizedData.country,
        createdAt: new Date(),
        lastLogin: new Date(),
        profile: {
          isComplete: true,
          registrationMethod: 'email'
        }
      });

      return { user };
    }, 2, 1000);

    ErrorLogger.log({
      name: 'UserRegistration',
      message: 'Usuario registrado exitosamente',
      type: 'INFO'
    }, { userId: result.user.uid, email: sanitizedData.email });

    return { 
      success: true, 
      user: result.user,
      message: "Cuenta creada exitosamente"
    };

  } catch (error) {
    const appError = handleFirebaseError(error);
    ErrorLogger.log(appError, { 
      action: 'registerWithEmail', 
      email: userData?.email 
    });
    
    return {
      success: false,
      error: appError.userMessage,
      details: appError.details
    };
  }
};

// Iniciar sesión con email y contraseña
export const loginWithEmail = async (email, password) => {
  try {
    // Validar datos de entrada
    const validation = validateLoginForm({ email, password });
    if (!validation.isValid) {
      return {
        success: false,
        error: "Credenciales inválidas",
        details: validation.errors
      };
    }

    // Sanitizar email
    const sanitizedEmail = sanitizeInput(email).toLowerCase();

    // Iniciar sesión con recuperación automática
    const result = await withErrorRecovery(async () => {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        sanitizedEmail, 
        password
      );

      // Actualizar última fecha de login
      await setDoc(doc(db, "users", userCredential.user.uid), {
        lastLogin: new Date()
      }, { merge: true });

      return userCredential;
    }, 2, 1000);

    ErrorLogger.log({
      name: 'UserLogin',
      message: 'Usuario inició sesión exitosamente',
      type: 'INFO'
    }, { userId: result.user.uid, email: sanitizedEmail });

    return { 
      success: true, 
      user: result.user,
      message: "Inicio de sesión exitoso"
    };

  } catch (error) {
    const appError = handleFirebaseError(error);
    ErrorLogger.log(appError, { 
      action: 'loginWithEmail', 
      email: email 
    });
    
    return {
      success: false,
      error: appError.userMessage,
      details: appError.details
    };
  }
};

// Iniciar sesión con Google
export const loginWithGoogle = async () => {
  try {
    const result = await withErrorRecovery(async () => {
      const authResult = await signInWithPopup(auth, provider);
      const user = authResult.user;

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
          lastLogin: new Date(),
          profile: {
            isComplete: false,
            registrationMethod: 'google'
          }
        });
      } else {
        // Usuario existente, actualizar última fecha de login
        await setDoc(docRef, {
          lastLogin: new Date()
        }, { merge: true });
      }

      return authResult;
    }, 2, 1000);

    ErrorLogger.log({
      name: 'GoogleLogin',
      message: 'Usuario inició sesión con Google exitosamente',
      type: 'INFO'
    }, { userId: result.user.uid, email: result.user.email });

    return { 
      success: true, 
      user: result.user,
      message: "Inicio de sesión con Google exitoso"
    };

  } catch (error) {
    const appError = handleFirebaseError(error);
    ErrorLogger.log(appError, { action: 'loginWithGoogle' });
    
    return {
      success: false,
      error: appError.userMessage,
      details: appError.details
    };
  }
};

// Restablecer contraseña
export const resetPassword = async (email) => {
  try {
    // Validar email
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    
    if (!sanitizedEmail || !sanitizedEmail.includes('@')) {
      return {
        success: false,
        error: "Email inválido"
      };
    }

    await withErrorRecovery(async () => {
      await sendPasswordResetEmail(auth, sanitizedEmail);
    }, 2, 1000);

    ErrorLogger.log({
      name: 'PasswordReset',
      message: 'Email de recuperación enviado',
      type: 'INFO'
    }, { email: sanitizedEmail });

    return { 
      success: true,
      message: "Email de recuperación enviado exitosamente"
    };

  } catch (error) {
    const appError = handleFirebaseError(error);
    ErrorLogger.log(appError, { 
      action: 'resetPassword', 
      email: email 
    });
    
    return {
      success: false,
      error: appError.userMessage,
      details: appError.details
    };
  }
};

// Cerrar sesión
export const logout = async () => {
  try {
    const currentUser = auth.currentUser;
    
    await withErrorRecovery(async () => {
      await signOut(auth);
    }, 2, 1000);

    ErrorLogger.log({
      name: 'UserLogout',
      message: 'Usuario cerró sesión exitosamente',
      type: 'INFO'
    }, { userId: currentUser?.uid });

    return { 
      success: true,
      message: "Sesión cerrada exitosamente"
    };

  } catch (error) {
    const appError = handleFirebaseError(error);
    ErrorLogger.log(appError, { action: 'logout' });
    
    return { 
      success: false, 
      error: appError.userMessage,
      details: appError.details
    };
  }
};

// Obtener datos del usuario
export const getUserData = async (uid) => {
  try {
    if (!uid) {
      return { 
        success: false, 
        error: "ID de usuario requerido" 
      };
    }

    const result = await withErrorRecovery(async () => {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        throw new Error("Usuario no encontrado");
      }
    }, 2, 1000);

    return { 
      success: true, 
      userData: result 
    };

  } catch (error) {
    const appError = handleFirebaseError(error);
    ErrorLogger.log(appError, { 
      action: 'getUserData', 
      userId: uid 
    });
    
    return { 
      success: false, 
      error: appError.userMessage,
      details: appError.details
    };
  }
};

// Actualizar datos del usuario
export const updateUserData = async (uid, updateData) => {
  try {
    if (!uid) {
      return { 
        success: false, 
        error: "ID de usuario requerido" 
      };
    }

    // Sanitizar datos de actualización
    const sanitizedData = {};
    for (const [key, value] of Object.entries(updateData)) {
      if (typeof value === 'string') {
        sanitizedData[key] = sanitizeInput(value);
      } else {
        sanitizedData[key] = value;
      }
    }

    await withErrorRecovery(async () => {
      const docRef = doc(db, "users", uid);
      await setDoc(docRef, {
        ...sanitizedData,
        updatedAt: new Date()
      }, { merge: true });
    }, 2, 1000);

    ErrorLogger.log({
      name: 'UserDataUpdate',
      message: 'Datos de usuario actualizados',
      type: 'INFO'
    }, { userId: uid, updatedFields: Object.keys(sanitizedData) });

    return { 
      success: true,
      message: "Datos actualizados exitosamente"
    };

  } catch (error) {
    const appError = handleFirebaseError(error);
    ErrorLogger.log(appError, { 
      action: 'updateUserData', 
      userId: uid 
    });
    
    return { 
      success: false, 
      error: appError.userMessage,
      details: appError.details
    };
  }
};

// Verificar si el usuario está autenticado
export const checkAuthStatus = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve({
        isAuthenticated: !!user,
        user: user
      });
    });
  });
};

// Observador de estado de autenticación con manejo de errores
export const onAuthStateChange = (callback) => {
  try {
    return onAuthStateChanged(auth, (user) => {
      try {
        callback(user);
      } catch (error) {
        ErrorLogger.log(error, { 
          action: 'onAuthStateChange_callback' 
        });
      }
    });
  } catch (error) {
    ErrorLogger.log(error, { 
      action: 'onAuthStateChange_setup' 
    });
    return () => {}; // Retornar función vacía en caso de error
  }
};

// Función para validar la sesión actual
export const validateCurrentSession = async () => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return {
        success: false,
        error: "No hay sesión activa"
      };
    }

    // Verificar que el token no haya expirado
    await user.getIdToken(true); // Forzar renovación del token

    // Verificar que los datos del usuario existan en Firestore
    const userData = await getUserData(user.uid);
    
    if (!userData.success) {
      return {
        success: false,
        error: "Datos de usuario no encontrados"
      };
    }

    return {
      success: true,
      user: user,
      userData: userData.userData
    };

  } catch (error) {
    const appError = handleFirebaseError(error);
    ErrorLogger.log(appError, { action: 'validateCurrentSession' });
    
    return {
      success: false,
      error: appError.userMessage,
      details: appError.details
    };
  }
};

const authService = {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  resetPassword,
  logout,
  getUserData,
  updateUserData,
  checkAuthStatus,
  onAuthStateChange,
  validateCurrentSession
};


export default authService;

