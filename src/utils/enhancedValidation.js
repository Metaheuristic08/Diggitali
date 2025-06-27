/**
 * Utilidades de validación para la plataforma de evaluación de competencias digitales
 */

// Validaciones para autenticación
export const authValidation = {
  // Validar email
  email: (email) => {
    const errors = [];
    
    if (!email) {
      errors.push('El email es requerido');
      return { isValid: false, errors };
    }
    
    if (typeof email !== 'string') {
      errors.push('El email debe ser una cadena de texto');
      return { isValid: false, errors };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('El formato del email no es válido');
    }
    
    if (email.trim().length > 254) {
      errors.push('El email es demasiado largo');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      value: email.trim().toLowerCase()
    };
  },

  // Validar contraseña
  password: (password, isRegistration = false) => {
    const errors = [];
    
    if (!password) {
      errors.push('La contraseña es requerida');
      return { isValid: false, errors };
    }
    
    if (typeof password !== 'string') {
      errors.push('La contraseña debe ser una cadena de texto');
      return { isValid: false, errors };
    }
    
    if (password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }
    
    if (isRegistration) {
      if (!/(?=.*[a-z])/.test(password)) {
        errors.push('La contraseña debe contener al menos una letra minúscula');
      }
      
      if (!/(?=.*[A-Z])/.test(password)) {
        errors.push('La contraseña debe contener al menos una letra mayúscula');
      }
      
      if (!/(?=.*\d)/.test(password)) {
        errors.push('La contraseña debe contener al menos un número');
      }
      
      if (password.length > 128) {
        errors.push('La contraseña es demasiado larga');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      value: password
    };
  },

  // Validar nombre de usuario
  username: (username) => {
    const errors = [];
    
    if (!username) {
      errors.push('El nombre es requerido');
      return { isValid: false, errors };
    }
    
    if (typeof username !== 'string') {
      errors.push('El nombre debe ser una cadena de texto');
      return { isValid: false, errors };
    }
    
    const trimmedUsername = username.trim();
    
    if (trimmedUsername.length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }
    
    if (trimmedUsername.length > 50) {
      errors.push('El nombre no puede tener más de 50 caracteres');
    }
    
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(trimmedUsername)) {
      errors.push('El nombre solo puede contener letras y espacios');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      value: trimmedUsername
    };
  },

  // Validar edad
  age: (age) => {
    const errors = [];
    
    if (!age && age !== 0) {
      errors.push('La edad es requerida');
      return { isValid: false, errors };
    }
    
    const ageNum = parseInt(age);
    
    if (isNaN(ageNum)) {
      errors.push('La edad debe ser un número válido');
      return { isValid: false, errors };
    }
    
    if (ageNum < 13) {
      errors.push('Debes tener al menos 13 años para registrarte');
    }
    
    if (ageNum > 120) {
      errors.push('Por favor, ingresa una edad válida');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      value: ageNum
    };
  },

  // Validar género
  gender: (gender) => {
    const errors = [];
    const validGenders = ['Masculino', 'Femenino', 'No binario', 'Prefiero no decirlo'];
    
    if (!gender) {
      errors.push('El género es requerido');
      return { isValid: false, errors };
    }
    
    if (!validGenders.includes(gender)) {
      errors.push('Por favor, selecciona una opción de género válida');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      value: gender
    };
  },

  // Validar país
  country: (country) => {
    const errors = [];
    
    if (!country) {
      errors.push('El país es requerido');
      return { isValid: false, errors };
    }
    
    if (typeof country !== 'string') {
      errors.push('El país debe ser una cadena de texto');
      return { isValid: false, errors };
    }
    
    const trimmedCountry = country.trim();
    
    if (trimmedCountry.length < 2) {
      errors.push('El nombre del país debe tener al menos 2 caracteres');
    }
    
    if (trimmedCountry.length > 50) {
      errors.push('El nombre del país es demasiado largo');
    }
    
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(trimmedCountry)) {
      errors.push('El país solo puede contener letras y espacios');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      value: trimmedCountry
    };
  }
};

// Validaciones para evaluación
export const evaluationValidation = {
  // Validar respuesta seleccionada
  selectedAnswer: (answer, totalOptions) => {
    const errors = [];
    
    if (answer === null || answer === undefined) {
      errors.push('Debes seleccionar una respuesta');
      return { isValid: false, errors };
    }
    
    const answerNum = parseInt(answer);
    
    if (isNaN(answerNum)) {
      errors.push('La respuesta debe ser un número válido');
      return { isValid: false, errors };
    }
    
    if (answerNum < 0 || answerNum >= totalOptions) {
      errors.push('La respuesta seleccionada no es válida');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      value: answerNum
    };
  },

  // Validar estructura de pregunta
  question: (question) => {
    const errors = [];
    
    if (!question) {
      errors.push('La pregunta es requerida');
      return { isValid: false, errors };
    }
    
    if (!question.title) {
      errors.push('El título de la pregunta es requerido');
    }
    
    if (!question.alternatives || !Array.isArray(question.alternatives)) {
      errors.push('Las alternativas de respuesta son requeridas');
    } else if (question.alternatives.length < 2) {
      errors.push('Debe haber al menos 2 alternativas de respuesta');
    }
    
    if (question.correctAnswer === null || question.correctAnswer === undefined) {
      errors.push('La respuesta correcta debe estar definida');
    } else if (question.alternatives && (question.correctAnswer < 0 || question.correctAnswer >= question.alternatives.length)) {
      errors.push('La respuesta correcta no es válida');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      value: question
    };
  },

  // Validar progreso de evaluación
  evaluationProgress: (currentStep, totalSteps, answers) => {
    const errors = [];
    
    if (currentStep < 0 || currentStep >= totalSteps) {
      errors.push('El paso actual de la evaluación no es válido');
    }
    
    if (totalSteps <= 0) {
      errors.push('El número total de pasos debe ser mayor a 0');
    }
    
    if (!Array.isArray(answers)) {
      errors.push('Las respuestas deben ser un array');
    } else if (answers.length !== totalSteps) {
      errors.push('El número de respuestas no coincide con el total de pasos');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// Validaciones generales
export const generalValidation = {
  // Validar que un valor no esté vacío
  required: (value, fieldName = 'Campo') => {
    const errors = [];
    
    if (value === null || value === undefined || value === '') {
      errors.push(`${fieldName} es requerido`);
    }
    
    if (typeof value === 'string' && value.trim() === '') {
      errors.push(`${fieldName} no puede estar vacío`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      value: typeof value === 'string' ? value.trim() : value
    };
  },

  // Validar longitud de texto
  textLength: (text, minLength = 0, maxLength = Infinity, fieldName = 'Campo') => {
    const errors = [];
    
    if (typeof text !== 'string') {
      errors.push(`${fieldName} debe ser texto`);
      return { isValid: false, errors };
    }
    
    const trimmedText = text.trim();
    
    if (trimmedText.length < minLength) {
      errors.push(`${fieldName} debe tener al menos ${minLength} caracteres`);
    }
    
    if (trimmedText.length > maxLength) {
      errors.push(`${fieldName} no puede tener más de ${maxLength} caracteres`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      value: trimmedText
    };
  },

  // Validar número en rango
  numberRange: (number, min = -Infinity, max = Infinity, fieldName = 'Número') => {
    const errors = [];
    
    const num = parseFloat(number);
    
    if (isNaN(num)) {
      errors.push(`${fieldName} debe ser un número válido`);
      return { isValid: false, errors };
    }
    
    if (num < min) {
      errors.push(`${fieldName} debe ser mayor o igual a ${min}`);
    }
    
    if (num > max) {
      errors.push(`${fieldName} debe ser menor o igual a ${max}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      value: num
    };
  },

  // Validar array no vacío
  nonEmptyArray: (array, fieldName = 'Lista') => {
    const errors = [];
    
    if (!Array.isArray(array)) {
      errors.push(`${fieldName} debe ser una lista`);
      return { isValid: false, errors };
    }
    
    if (array.length === 0) {
      errors.push(`${fieldName} no puede estar vacía`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      value: array
    };
  }
};

// Función para validar múltiples campos
export const validateMultipleFields = (validations) => {
  const results = {};
  let hasErrors = false;
  
  for (const [fieldName, validation] of Object.entries(validations)) {
    results[fieldName] = validation;
    if (!validation.isValid) {
      hasErrors = true;
    }
  }
  
  return {
    isValid: !hasErrors,
    results,
    errors: Object.entries(results)
      .filter(([_, result]) => !result.isValid)
      .reduce((acc, [fieldName, result]) => {
        acc[fieldName] = result.errors;
        return acc;
      }, {})
  };
};

// Función para sanitizar entrada de usuario
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remover caracteres potencialmente peligrosos
    .replace(/\s+/g, ' '); // Normalizar espacios en blanco
};

// Función para validar formulario de registro completo
export const validateRegistrationForm = (formData) => {
  const validations = {
    username: authValidation.username(formData.username),
    email: authValidation.email(formData.email),
    password: authValidation.password(formData.password, true),
    age: authValidation.age(formData.age),
    gender: authValidation.gender(formData.gender),
    country: authValidation.country(formData.country)
  };
  
  return validateMultipleFields(validations);
};

// Función para validar formulario de login
export const validateLoginForm = (formData) => {
  const validations = {
    email: authValidation.email(formData.email),
    password: authValidation.password(formData.password, false)
  };
  
  return validateMultipleFields(validations);
};

const enhancedValidation = {
  authValidation,
  evaluationValidation,
  generalValidation,
  validateMultipleFields,
  sanitizeInput,
  validateRegistrationForm,
  validateLoginForm
};


export default enhancedValidation;

