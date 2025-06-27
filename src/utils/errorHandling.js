/**
 * Utilidades para manejo de errores en la plataforma de evaluación de competencias digitales
 */

// Tipos de errores
export const ErrorTypes = {
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NETWORK: 'NETWORK_ERROR',
  FIREBASE: 'FIREBASE_ERROR',
  EVALUATION: 'EVALUATION_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// Severidad de errores
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Clase para manejar errores de forma estructurada
export class AppError extends Error {
  constructor(message, type = ErrorTypes.UNKNOWN, severity = ErrorSeverity.MEDIUM, details = {}) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.userMessage = this.getUserFriendlyMessage();
  }

  getUserFriendlyMessage() {
    switch (this.type) {
      case ErrorTypes.VALIDATION:
        return 'Por favor, verifica los datos ingresados';
      case ErrorTypes.AUTHENTICATION:
        return 'Error de autenticación. Verifica tus credenciales';
      case ErrorTypes.AUTHORIZATION:
        return 'No tienes permisos para realizar esta acción';
      case ErrorTypes.NETWORK:
        return 'Error de conexión. Verifica tu conexión a internet';
      case ErrorTypes.FIREBASE:
        return 'Error del servidor. Intenta nuevamente en unos momentos';
      case ErrorTypes.EVALUATION:
        return 'Error en la evaluación. Por favor, intenta nuevamente';
      default:
        return 'Ha ocurrido un error inesperado';
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      severity: this.severity,
      details: this.details,
      timestamp: this.timestamp,
      userMessage: this.userMessage,
      stack: this.stack
    };
  }
}

// Función para crear errores específicos
export const createError = {
  validation: (message, details = {}) => 
    new AppError(message, ErrorTypes.VALIDATION, ErrorSeverity.LOW, details),
  
  authentication: (message, details = {}) => 
    new AppError(message, ErrorTypes.AUTHENTICATION, ErrorSeverity.MEDIUM, details),
  
  authorization: (message, details = {}) => 
    new AppError(message, ErrorTypes.AUTHORIZATION, ErrorSeverity.MEDIUM, details),
  
  network: (message, details = {}) => 
    new AppError(message, ErrorTypes.NETWORK, ErrorSeverity.HIGH, details),
  
  firebase: (message, details = {}) => 
    new AppError(message, ErrorTypes.FIREBASE, ErrorSeverity.HIGH, details),
  
  evaluation: (message, details = {}) => 
    new AppError(message, ErrorTypes.EVALUATION, ErrorSeverity.MEDIUM, details),
  
  unknown: (message, details = {}) => 
    new AppError(message, ErrorTypes.UNKNOWN, ErrorSeverity.CRITICAL, details)
};

// Función para manejar errores de Firebase
export const handleFirebaseError = (error) => {
  const errorCode = error.code || 'unknown';
  const errorMessage = error.message || 'Error desconocido';
  
  switch (errorCode) {
    case 'auth/invalid-credential':
      return createError.authentication('Credenciales inválidas', { code: errorCode });
    
    case 'auth/user-not-found':
      return createError.authentication('Usuario no encontrado', { code: errorCode });
    
    case 'auth/wrong-password':
      return createError.authentication('Contraseña incorrecta', { code: errorCode });
    
    case 'auth/invalid-email':
      return createError.validation('Email inválido', { code: errorCode });
    
    case 'auth/user-disabled':
      return createError.authorization('Cuenta deshabilitada', { code: errorCode });
    
    case 'auth/too-many-requests':
      return createError.network('Demasiados intentos. Intenta más tarde', { code: errorCode });
    
    case 'auth/email-already-in-use':
      return createError.validation('Email ya registrado', { code: errorCode });
    
    case 'auth/weak-password':
      return createError.validation('Contraseña muy débil', { code: errorCode });
    
    case 'auth/operation-not-allowed':
      return createError.authorization('Operación no permitida', { code: errorCode });
    
    case 'auth/popup-closed-by-user':
      return createError.authentication('Ventana cerrada por el usuario', { code: errorCode });
    
    case 'auth/popup-blocked':
      return createError.network('Popup bloqueado por el navegador', { code: errorCode });
    
    case 'permission-denied':
      return createError.authorization('Permisos insuficientes', { code: errorCode });
    
    case 'unavailable':
      return createError.network('Servicio no disponible', { code: errorCode });
    
    case 'deadline-exceeded':
      return createError.network('Tiempo de espera agotado', { code: errorCode });
    
    default:
      return createError.firebase(errorMessage, { code: errorCode, originalError: error });
  }
};

// Función para manejar errores de red
export const handleNetworkError = (error) => {
  if (!navigator.onLine) {
    return createError.network('Sin conexión a internet', { offline: true });
  }
  
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return createError.network('Error de conexión', { fetchError: true });
  }
  
  return createError.network('Error de red', { originalError: error });
};

// Función para manejar errores de validación
export const handleValidationError = (validationResult) => {
  const errors = [];
  
  if (validationResult.errors) {
    for (const [field, fieldErrors] of Object.entries(validationResult.errors)) {
      errors.push(...fieldErrors.map(error => `${field}: ${error}`));
    }
  }
  
  return createError.validation('Errores de validación', { 
    fields: validationResult.errors,
    summary: errors
  });
};

// Logger de errores
export class ErrorLogger {
  static logs = [];
  
  static log(error, context = {}) {
    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      error: error instanceof AppError ? error.toJSON() : {
        name: error.name || 'Error',
        message: error.message || 'Error desconocido',
        stack: error.stack
      },
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    this.logs.push(logEntry);
    
    // Mantener solo los últimos 100 logs
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }
    
    // Log en consola para desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', logEntry);
    }
    
    // Enviar a servicio de logging en producción
    if (process.env.NODE_ENV === 'production' && error.severity === ErrorSeverity.CRITICAL) {
      this.sendToLoggingService(logEntry);
    }
    
    return logEntry.id;
  }
  
  static getLogs(limit = 50) {
    return this.logs.slice(-limit);
  }
  
  static getLogsByType(type, limit = 50) {
    return this.logs
      .filter(log => log.error.type === type)
      .slice(-limit);
  }
  
  static clearLogs() {
    this.logs = [];
  }
  
  static async sendToLoggingService(logEntry) {
    try {
      // Aquí se implementaría el envío a un servicio de logging externo
      // Por ejemplo, Sentry, LogRocket, etc.
      console.warn('Critical error logged:', logEntry);
    } catch (error) {
      console.error('Failed to send log to service:', error);
    }
  }
  
  static exportLogs() {
    const data = {
      timestamp: new Date().toISOString(),
      logs: this.logs,
      summary: {
        total: this.logs.length,
        byType: this.logs.reduce((acc, log) => {
          const type = log.error.type || 'unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {}),
        bySeverity: this.logs.reduce((acc, log) => {
          const severity = log.error.severity || 'unknown';
          acc[severity] = (acc[severity] || 0) + 1;
          return acc;
        }, {})
      }
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `error_logs_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }
}

// Hook para manejo de errores en React
export const useErrorHandler = () => {
  const handleError = (error, context = {}) => {
    let appError;
    
    if (error instanceof AppError) {
      appError = error;
    } else if (error.code) {
      // Error de Firebase
      appError = handleFirebaseError(error);
    } else if (error.name === 'TypeError' || error.name === 'NetworkError') {
      // Error de red
      appError = handleNetworkError(error);
    } else {
      // Error desconocido
      appError = createError.unknown(error.message || 'Error desconocido', { originalError: error });
    }
    
    // Log del error
    const logId = ErrorLogger.log(appError, context);
    
    return {
      error: appError,
      logId,
      userMessage: appError.userMessage,
      shouldRetry: appError.type === ErrorTypes.NETWORK,
      shouldReload: appError.severity === ErrorSeverity.CRITICAL
    };
  };
  
  return { handleError };
};

// Función para recuperación automática de errores
export const withErrorRecovery = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // No reintentar errores de validación o autorización
      if (error.type === ErrorTypes.VALIDATION || error.type === ErrorTypes.AUTHORIZATION) {
        throw error;
      }
      
      // Si es el último intento, lanzar el error
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};

// Función para mostrar notificaciones de error
export const showErrorNotification = (error, notificationSystem) => {
  const appError = error instanceof AppError ? error : createError.unknown(error.message);
  
  const notification = {
    id: Date.now(),
    type: 'error',
    title: 'Error',
    message: appError.userMessage,
    duration: appError.severity === ErrorSeverity.CRITICAL ? 0 : 5000, // Críticos no se auto-ocultan
    actions: []
  };
  
  // Agregar acción de reintento para errores de red
  if (appError.type === ErrorTypes.NETWORK) {
    notification.actions.push({
      label: 'Reintentar',
      action: () => window.location.reload()
    });
  }
  
  // Agregar acción de reporte para errores críticos
  if (appError.severity === ErrorSeverity.CRITICAL) {
    notification.actions.push({
      label: 'Reportar',
      action: () => ErrorLogger.exportLogs()
    });
  }
  
  if (notificationSystem && typeof notificationSystem.show === 'function') {
    notificationSystem.show(notification);
  } else {
    // Fallback a alert nativo
    alert(appError.userMessage);
  }
  
  return notification;
};

const errorHandling = {
  ErrorTypes,
  ErrorSeverity,
  AppError,
  createError,
  handleFirebaseError,
  handleNetworkError,
  handleValidationError,
  ErrorLogger,
  useErrorHandler,
  withErrorRecovery,
  showErrorNotification
};


export default errorHandling;

