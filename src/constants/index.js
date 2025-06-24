// Rutas de la aplicación
export const ROUTES = {
  HOME: '/homepage',
  LOGIN: '/loginregister',
  COMPETENCIAS: '/competencias',
  EVALUACION_DIGITAL: '/evaluacion-digital',
  GENERADOR_ITEMS: '/generador-items',
  PROGRESO: '/progreso',
  EXPLORAR: '/explorar'
};

// Opciones de género
export const GENDER_OPTIONS = [
  { value: "", label: "Selecciona..." },
  { value: "Masculino", label: "Masculino" },
  { value: "Femenino", label: "Femenino" },
  { value: "Prefiero no decirlo", label: "Prefiero no decirlo" }
];

// Categorías de competencias
export const COMPETENCE_CATEGORIES = {
  INFO_DATA: "BÚSQUEDA Y GESTIÓN DE INFORMACIÓN Y DATOS",
  COMMUNICATION: "COMUNICACIÓN Y COLABORACIÓN", 
  CONTENT_CREATION: "CREACIÓN DE CONTENIDOS DIGITALES",
  SECURITY: "SEGURIDAD",
  PROBLEM_SOLVING: "RESOLUCIÓN DE PROBLEMAS"
};

// Mapeo de categorías para colores
export const CATEGORY_COLORS = {
  "INFORMATION AND DATA": "linear-gradient(180deg, #00a8e8 0%, #007ea7 100%)",
  "COMMUNICATION AND COLLABORATION": "linear-gradient(180deg, #a066b0 0%, #844d9e 100%)",
  "CONTENT CREATION": "linear-gradient(180deg, #ff7e29 0%, #e65100 100%)",
  "SECURITY": "linear-gradient(180deg, #88b04b 0%, #618833 100%)",
  "PROBLEM SOLVING": "linear-gradient(180deg, #f25c54 0%, #d64541 100%)"
};

// Configuración de la aplicación
export const APP_CONFIG = {
  NAME: "LADICO",
  VERSION: "1.0.0",
  DESCRIPTION: "Plataforma de evaluación de competencias digitales"
};

// Límites de validación
export const VALIDATION_LIMITS = {
  MIN_AGE: 13,
  MAX_AGE: 120,
  MIN_PASSWORD_LENGTH: 6,
  MIN_USERNAME_LENGTH: 2,
  MAX_USERNAME_LENGTH: 50,
  MIN_COUNTRY_LENGTH: 2,
  MAX_COUNTRY_LENGTH: 50
};
