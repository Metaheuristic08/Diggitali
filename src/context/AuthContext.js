import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChange, validateCurrentSession } from '../services/authService';
import { useErrorHandler, ErrorLogger } from '../utils/errorHandling';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionValid, setSessionValid] = useState(false);
  const { handleError } = useErrorHandler();

  // Función para limpiar el estado de autenticación
  const clearAuthState = () => {
    setCurrentUser(null);
    setUserData(null);
    setSessionValid(false);
    setError(null);
  };

  // Función para establecer el estado de autenticación
  const setAuthState = (user, userData = null) => {
    setCurrentUser(user);
    setUserData(userData);
    setSessionValid(!!user);
    setError(null);
  };

  // Función para manejar errores de autenticación
  const handleAuthError = useCallback((error, context = {}) => {
    const errorInfo = handleError(error, { ...context, component: 'AuthContext' });
    setError(errorInfo.error);
    
    // Si es un error crítico, limpiar el estado
    if (errorInfo.shouldReload || errorInfo.error.severity === 'critical') {
      clearAuthState();
    }
    
    return errorInfo;
  }, [handleError]);

  // Función para validar la sesión actual
  const validateSession = useCallback(async () => {
    try {
      setLoading(true);
      const result = await validateCurrentSession();
      
      if (result.success) {
        setAuthState(result.user, result.userData);
        return true;
      } else {
        clearAuthState();
        return false;
      }
    } catch (error) {
      handleAuthError(error, { action: 'validateSession' });
      clearAuthState();
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  // Función para refrescar los datos del usuario
  const refreshUserData = useCallback(async () => {
    if (!currentUser) return null;
    
    try {
      const { getUserData } = await import('../services/authService');
      const result = await getUserData(currentUser.uid);
      
      if (result.success) {
        setUserData(result.userData);
        return result.userData;
      } else {
        handleAuthError(new Error(result.error), { action: 'refreshUserData' });
        return null;
      }
    } catch (error) {
      handleAuthError(error, { action: 'refreshUserData' });
      return null;
    }
  }, [currentUser, handleAuthError]);

  // Función para actualizar los datos del usuario
  const updateUserProfile = async (updateData) => {
    if (!currentUser) {
      throw new Error('No hay usuario autenticado');
    }
    
    try {
      const { updateUserData } = await import('../services/authService');
      const result = await updateUserData(currentUser.uid, updateData);
      
      if (result.success) {
        // Refrescar los datos del usuario
        await refreshUserData();
        return { success: true, message: result.message };
      } else {
        const errorInfo = handleAuthError(new Error(result.error), { 
          action: 'updateUserProfile',
          updateData: Object.keys(updateData)
        });
        return { success: false, error: errorInfo.error.userMessage };
      }
    } catch (error) {
      const errorInfo = handleAuthError(error, { action: 'updateUserProfile' });
      return { success: false, error: errorInfo.error.userMessage };
    }
  };

  // Función para cerrar sesión
  const signOut = async () => {
    try {
      setLoading(true);
      const { logout } = await import('../services/authService');
      const result = await logout();
      
      if (result.success) {
        clearAuthState();
        return { success: true, message: result.message };
      } else {
        const errorInfo = handleAuthError(new Error(result.error), { action: 'signOut' });
        return { success: false, error: errorInfo.error.userMessage };
      }
    } catch (error) {
      const errorInfo = handleAuthError(error, { action: 'signOut' });
      return { success: false, error: errorInfo.error.userMessage };
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar si el usuario tiene un perfil completo
  const hasCompleteProfile = () => {
    if (!userData) return false;
    
    const requiredFields = ['username', 'email', 'age', 'gender', 'country'];
    return requiredFields.every(field => userData[field] && userData[field] !== '');
  };

  // Función para obtener información del nivel de usuario
  const getUserLevel = () => {
    if (!userData) return null;
    
    return {
      isNewUser: !userData.lastLogin || userData.createdAt === userData.lastLogin,
      registrationMethod: userData.profile?.registrationMethod || 'unknown',
      isProfileComplete: hasCompleteProfile(),
      memberSince: userData.createdAt
    };
  };

  // Efecto para manejar cambios en el estado de autenticación
  useEffect(() => {
    let unsubscribe;
    
    // Crear referencia estable a handleAuthError para evitar bucles
    const stableHandleError = (error, context = {}) => {
      const errorInfo = handleError(error, { ...context, component: 'AuthContext' });
      setError(errorInfo.error);
      
      // Si es un error crítico, limpiar el estado
      if (errorInfo.shouldReload || errorInfo.error.severity === 'critical') {
        clearAuthState();
      }
      
      return errorInfo;
    };
    
    try {
      unsubscribe = onAuthStateChange(async (user) => {
        try {
          setLoading(true);
          
          if (user) {
            // Usuario autenticado, obtener datos adicionales
            const { getUserData } = await import('../services/authService');
            const result = await getUserData(user.uid);
            
            if (result.success) {
              setAuthState(user, result.userData);
            } else {
              // Error al obtener datos del usuario
              stableHandleError(new Error(result.error), { 
                action: 'onAuthStateChange_getUserData',
                userId: user.uid 
              });
              setCurrentUser(user);
              setUserData(null);
              setSessionValid(true);
            }
          } else {
            // Usuario no autenticado
            clearAuthState();
            
            ErrorLogger.log({
              name: 'AuthStateChange',
              message: 'Usuario no autenticado',
              type: 'INFO'
            });
          }
        } catch (error) {
          stableHandleError(error, { action: 'onAuthStateChange' });
        } finally {
          setLoading(false);
        }
      });
    } catch (error) {
      stableHandleError(error, { action: 'setupAuthListener' });
      setLoading(false);
    }

    // Cleanup
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        try {
          unsubscribe();
        } catch (error) {
          console.warn('Error al limpiar listener de autenticación:', error);
        }
      }
    };
  }, []);  // Sin dependencias para evitar bucles

  // Efecto para validar la sesión periódicamente
  useEffect(() => {
    if (!currentUser) return;

    // Validar sesión cada 30 minutos
    const interval = setInterval(async () => {
      try {
        const isValid = await validateSession();
        if (!isValid) {
          ErrorLogger.log({
            name: 'SessionValidation',
            message: 'Sesión inválida detectada',
            type: 'WARNING'
          }, { userId: currentUser.uid });
        }
      } catch (error) {
        handleAuthError(error, { action: 'periodicSessionValidation' });
      }
    }, 30 * 60 * 1000); // 30 minutos

    return () => clearInterval(interval);
  }, [currentUser, validateSession, handleAuthError]);

  // Valor del contexto
  const value = {
    // Estado
    currentUser,
    userData,
    loading,
    error,
    sessionValid,
    
    // Funciones de utilidad
    hasCompleteProfile,
    getUserLevel,
    
    // Funciones de acción
    refreshUserData,
    updateUserProfile,
    signOut,
    validateSession,
    
    // Función para limpiar errores
    clearError: () => setError(null),
    
    // Información de estado
    isAuthenticated: !!currentUser,
    isLoading: loading,
    hasError: !!error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

