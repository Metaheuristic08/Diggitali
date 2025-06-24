// Validaciones para formularios
export const validateEmail = (email) => {
  if (!email) return "El email es requerido";
  if (!email.includes('@')) return "El formato del email no es válido";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "El formato del email no es válido";
  return null;
};

export const validatePassword = (password) => {
  if (!password) return "La contraseña es requerida";
  if (password.length < 6) return "La contraseña debe tener al menos 6 caracteres";
  return null;
};

export const validateUsername = (username) => {
  if (!username) return "El nombre es requerido";
  if (username.length < 2) return "El nombre debe tener al menos 2 caracteres";
  if (username.length > 50) return "El nombre no puede exceder 50 caracteres";
  return null;
};

export const validateAge = (age) => {
  if (!age) return "La edad es requerida";
  const ageNum = parseInt(age);
  if (isNaN(ageNum)) return "La edad debe ser un número";
  if (ageNum < 13 || ageNum > 120) return "Por favor, ingresa una edad válida (13-120 años)";
  return null;
};

export const validateGender = (gender) => {
  if (!gender) return "El género es requerido";
  const validGenders = ["Masculino", "Femenino", "Prefiero no decirlo"];
  if (!validGenders.includes(gender)) return "Selecciona una opción válida";
  return null;
};

export const validateCountry = (country) => {
  if (!country) return "El país es requerido";
  if (country.length < 2) return "El país debe tener al menos 2 caracteres";
  if (country.length > 50) return "El país no puede exceder 50 caracteres";
  return null;
};

// Validación completa para registro
export const validateRegisterForm = (formData) => {
  const { email, password, username, age, gender, country } = formData;
  
  const errors = {};
  
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;
  
  const usernameError = validateUsername(username);
  if (usernameError) errors.username = usernameError;
  
  const ageError = validateAge(age);
  if (ageError) errors.age = ageError;
  
  const genderError = validateGender(gender);
  if (genderError) errors.gender = genderError;
  
  const countryError = validateCountry(country);
  if (countryError) errors.country = countryError;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validación para login
export const validateLoginForm = (formData) => {
  const { email, password } = formData;
  
  const errors = {};
  
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
