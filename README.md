# Plataforma de Evaluación de Competencias Digitales - LADICO

## 📋 Descripción del Proyecto

Esta es una plataforma web completa para evaluar competencias digitales basada en el Marco Europeo DigComp 2.1. La plataforma permite a los usuarios registrarse, autenticarse y realizar evaluaciones de sus competencias digitales en las 5 dimensiones principales.

## 🚀 Características Principales

### ✅ Sistema de Autenticación Completo
- **Registro de usuarios** con validaciones en tiempo real
- **Inicio de sesión** con email/contraseña y Google OAuth
- **Recuperación de contraseña** por email
- **Validaciones robustas** con feedback visual inmediato
- **Persistencia de sesión** y rutas protegidas
- **Manejo de errores** estructurado y user-friendly

### ✅ Evaluación de Competencias Digitales
- **5 Dimensiones** del Marco DigComp 2.1:
  1. Información y Alfabetización Informacional
  2. Comunicación y Colaboración
  3. Creación de Contenido Digital
  4. Seguridad
  5. Resolución de Problemas
- **Sistema de preguntas** cargadas desde Firebase Firestore
- **Lógica de evaluación** (2 de 3 correctas para avanzar de nivel básico)
- **Sistema anti-trampa** avanzado con detección de violaciones
- **Resultados detallados** con análisis y recomendaciones

### ✅ Interfaz de Usuario Moderna
- **Diseño responsivo** que funciona en desktop, tablet y móvil
- **Animaciones suaves** y transiciones elegantes
- **Validaciones en tiempo real** con feedback visual
- **Tema consistente** con la identidad de LADICO
- **Navegación intuitiva** y experiencia de usuario optimizada

### ✅ Arquitectura Robusta
- **React 18** con hooks modernos
- **Firebase** para autenticación y base de datos
- **Context API** para manejo de estado global
- **Utilidades de validación** personalizadas
- **Sistema de logging** y manejo de errores
- **Código modular** y mantenible

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** - Framework principal
- **React Router DOM** - Navegación
- **Material-UI** - Componentes de UI
- **CSS3** - Estilos personalizados
- **JavaScript ES6+** - Lógica de aplicación

### Backend/Servicios
- **Firebase Authentication** - Autenticación de usuarios
- **Firebase Firestore** - Base de datos NoSQL
- **Google OAuth** - Autenticación con Google

### Herramientas de Desarrollo
- **Create React App** - Configuración inicial
- **ESLint** - Linting de código
- **npm** - Gestión de dependencias

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginRegister.js          # Formularios de login/registro
│   │   └── ProtectedRoute.js         # Rutas protegidas
│   └── evaluation/
│       ├── QuestionPresenter.jsx     # Presentación de preguntas
│       ├── NavigationControls.jsx    # Controles de navegación
│       ├── AntiCheatProtection.jsx   # Sistema anti-trampa
│       └── EvaluationResults.jsx     # Resultados de evaluación
├── context/
│   └── AuthContext.js                # Context de autenticación
├── services/
│   ├── firebase.js                   # Configuración de Firebase
│   ├── authService.js                # Servicios de autenticación
│   └── evaluationController.js       # Controlador de evaluaciones
├── utils/
│   ├── enhancedValidation.js         # Utilidades de validación
│   └── errorHandling.js              # Manejo de errores
├── styles/
│   └── components/
│       └── loginRegister.css         # Estilos del login/registro
└── pages/
    ├── HomePage.js                   # Página de inicio
    ├── Competencias.js               # Página de competencias
    └── DigitalCompetencesPage.js     # Página de evaluación
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 16+ 
- npm o yarn
- Cuenta de Firebase

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd Questioname-main
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar Firebase**
   - Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Habilitar Authentication (Email/Password y Google)
   - Crear base de datos Firestore
   - Copiar la configuración en `src/services/firebase.js`

4. **Configurar variables de entorno**
   ```bash
   # Crear archivo .env en la raíz del proyecto
   REACT_APP_FIREBASE_API_KEY=tu_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=tu_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=tu_project_id
   # ... otras variables de Firebase
   ```

5. **Iniciar la aplicación**
   ```bash
   npm start
   ```

La aplicación estará disponible en `http://localhost:3000`

## 📊 Estructura de Datos en Firestore

### Colección `users`
```javascript
{
  uid: "user_id",
  username: "Nombre del Usuario",
  email: "usuario@email.com",
  age: 25,
  gender: "Masculino",
  country: "Chile",
  createdAt: timestamp,
  lastLogin: timestamp,
  profile: {
    isComplete: true,
    registrationMethod: "email"
  }
}
```

### Colección `questions`
```javascript
{
  id: "question_id",
  title: "Título de la pregunta",
  scenario: "Escenario de la pregunta",
  alternatives: ["Opción 1", "Opción 2", "Opción 3"],
  correctAnswer: 0,
  dimension: "Información y Alfabetización Informacional",
  competence: "1.1. Navegar, buscar y filtrar...",
  level: "Básico"
}
```

## 🔧 Funcionalidades Implementadas

### ✅ Autenticación y Usuarios
- [x] Registro con validaciones completas
- [x] Login con email/contraseña
- [x] Login con Google OAuth
- [x] Recuperación de contraseña
- [x] Persistencia de sesión
- [x] Rutas protegidas
- [x] Validaciones en tiempo real
- [x] Manejo de errores robusto

### ✅ Sistema de Evaluación
- [x] Carga de preguntas desde Firestore
- [x] Presentación de preguntas con navegación
- [x] Sistema anti-trampa avanzado
- [x] Cálculo de resultados
- [x] Lógica de avance de nivel (2/3 correctas)
- [x] Resultados detallados con recomendaciones

### ✅ Interfaz de Usuario
- [x] Diseño responsivo completo
- [x] Animaciones y transiciones
- [x] Validaciones visuales
- [x] Tema consistente
- [x] Navegación intuitiva

## 🧪 Pruebas Realizadas

### Funcionalidad
- ✅ Inicio de aplicación
- ✅ Navegación entre páginas
- ✅ Sistema de autenticación
- ✅ Validaciones en tiempo real
- ✅ Rutas protegidas

### Diseño Responsivo
- ✅ Desktop (1366px+)
- ✅ Tablet (768px)
- ✅ Móvil (320px+)

### Validaciones
- ✅ Validación de email
- ✅ Validación de contraseña
- ✅ Validación de campos requeridos
- ✅ Mensajes de error claros

## 🚀 Despliegue

### Desarrollo
```bash
npm start
```

### Producción
```bash
npm run build
npm install -g serve
serve -s build
```

### Despliegue en Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## 📈 Próximas Mejoras

### Funcionalidades Pendientes
- [ ] Niveles intermedio y avanzado
- [ ] Certificados digitales
- [ ] Dashboard de administrador
- [ ] Analytics de uso
- [ ] Modo offline

### Optimizaciones Técnicas
- [ ] Lazy loading de componentes
- [ ] Optimización de imágenes
- [ ] Cache de preguntas
- [ ] Pruebas unitarias
- [ ] Documentación de API

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo

- **Desarrollo**: Manus AI
- **Diseño**: Basado en especificaciones LADICO
- **Framework**: Marco Europeo DigComp 2.1

## 📞 Soporte

Para soporte técnico o preguntas sobre el proyecto:
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo

---

**Versión**: 1.0.0  
**Última actualización**: Junio 2025  
**Estado**: ✅ Producción Ready

