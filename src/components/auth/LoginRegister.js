import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  registerWithEmail, 
  loginWithEmail, 
  loginWithGoogle, 
  resetPassword 
} from "../../services/authService";
import { 
  validateRegistrationForm, 
  validateLoginForm, 
  authValidation,
  sanitizeInput 
} from "../../utils/enhancedValidation";
import { useErrorHandler } from "../../utils/errorHandling";
import "../../styles/components/loginRegister.css";

function LoginRegister() {
  const navigate = useNavigate();
  const { currentUser, isLoading } = useAuth();
  const { handleError } = useErrorHandler();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    age: "",
    gender: "",
    country: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados para manejo de errores y loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Estados para validaciones en tiempo real
  const [fieldErrors, setFieldErrors] = useState({});
  const [fieldTouched, setFieldTouched] = useState({});

  useEffect(() => {
    document.title = isSignUp ? "Registrarse | Ladico" : "Iniciar Sesión | Ladico";
  }, [isSignUp]);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (currentUser && !isLoading) {
      navigate("/competencias");
    }
  }, [currentUser, isLoading, navigate]);

  // Limpiar mensajes cuando cambia el modo
  useEffect(() => {
    setError("");
    setSuccess("");
    setFieldErrors({});
    setFieldTouched({});
  }, [isSignUp]);

  // Función para manejar cambios en los campos
  const handleInputChange = (field, value) => {
    const sanitizedValue = typeof value === 'string' ? sanitizeInput(value) : value;
    
    setFormData(prev => ({
      ...prev,
      [field]: sanitizedValue
    }));

    // Validar en tiempo real si el campo ha sido tocado
    if (fieldTouched[field]) {
      validateField(field, sanitizedValue);
    }
  };

  // Función para manejar cuando un campo pierde el foco
  const handleFieldBlur = (field) => {
    setFieldTouched(prev => ({
      ...prev,
      [field]: true
    }));
    validateField(field, formData[field]);
  };

  // Función para validar un campo individual
  const validateField = (field, value) => {
    let validation;
    
    switch (field) {
      case 'email':
        validation = authValidation.email(value);
        break;
      case 'password':
        validation = authValidation.password(value, isSignUp);
        break;
      case 'username':
        validation = authValidation.username(value);
        break;
      case 'age':
        validation = authValidation.age(value);
        break;
      case 'gender':
        validation = authValidation.gender(value);
        break;
      case 'country':
        validation = authValidation.country(value);
        break;
      default:
        return;
    }

    setFieldErrors(prev => ({
      ...prev,
      [field]: validation.isValid ? [] : validation.errors
    }));
  };

  // Función para limpiar formularios
  const clearForm = () => {
    setFormData({
      email: "",
      password: "",
      username: "",
      age: "",
      gender: "",
      country: ""
    });
    setShowPassword(false);
    setFieldErrors({});
    setFieldTouched({});
    setError("");
    setSuccess("");
  };

  // Función para cambiar entre modos
  const switchMode = (signUpMode) => {
    setIsSignUp(signUpMode);
    clearForm();
  };

  // Función para manejar el login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validar formulario completo
    const validation = validateLoginForm({
      email: formData.email,
      password: formData.password
    });

    if (!validation.isValid) {
      setError("Por favor, corrige los errores antes de continuar");
      setFieldErrors(validation.errors);
      return;
    }

    setLoading(true);

    try {
      const result = await loginWithEmail(formData.email, formData.password);
      
      if (result.success) {
        setSuccess("¡Inicio de sesión exitoso! Redirigiendo...");
        setTimeout(() => {
          navigate("/competencias");
        }, 1000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      const errorInfo = handleError(error, { action: 'login', email: formData.email });
      setError(errorInfo.userMessage);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar el registro
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validar formulario completo
    const validation = validateRegistrationForm(formData);

    if (!validation.isValid) {
      setError("Por favor, corrige los errores antes de continuar");
      setFieldErrors(validation.errors);
      
      // Marcar todos los campos como tocados para mostrar errores
      const allTouched = {};
      Object.keys(formData).forEach(key => {
        allTouched[key] = true;
      });
      setFieldTouched(allTouched);
      return;
    }

    setLoading(true);

    try {
      const result = await registerWithEmail(formData);
      
      if (result.success) {
        setSuccess("¡Cuenta creada exitosamente! Redirigiendo...");
        setTimeout(() => {
          navigate("/competencias");
        }, 1000);
      } else {
        setError(result.error);
        if (result.details) {
          setFieldErrors(result.details);
        }
      }
    } catch (error) {
      const errorInfo = handleError(error, { action: 'register', email: formData.email });
      setError(errorInfo.userMessage);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar login con Google
  const handleGoogleLogin = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await loginWithGoogle();
      
      if (result.success) {
        setSuccess("¡Inicio de sesión con Google exitoso! Redirigiendo...");
        setTimeout(() => {
          navigate("/competencias");
        }, 1000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      const errorInfo = handleError(error, { action: 'googleLogin' });
      setError(errorInfo.userMessage);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar recuperación de contraseña
  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError("Por favor, ingresa tu email primero");
      return;
    }

    const emailValidation = authValidation.email(formData.email);
    if (!emailValidation.isValid) {
      setError("Por favor, ingresa un email válido");
      setFieldErrors({ email: emailValidation.errors });
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await resetPassword(formData.email);
      
      if (result.success) {
        setSuccess("Te hemos enviado un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada.");
      } else {
        setError(result.error);
      }
    } catch (error) {
      const errorInfo = handleError(error, { action: 'forgotPassword', email: formData.email });
      setError(errorInfo.userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoClick = () => {
    navigate("/homepage");
  };

  // Función para obtener el mensaje de error de un campo
  const getFieldError = (field) => {
    return fieldErrors[field] && fieldErrors[field].length > 0 ? fieldErrors[field][0] : "";
  };

  // Función para verificar si un campo tiene error
  const hasFieldError = (field) => {
    return fieldTouched[field] && fieldErrors[field] && fieldErrors[field].length > 0;
  };

  return (
    <div className={`container ${isSignUp ? "sign-up-mode" : ""}`}>
      <div className="forms-container">
        <div className="signin-signup">
          {/* Formulario de Login */}
          <form onSubmit={handleLogin} className="sign-in-form">
            <img 
              src="/img/ladico.png" 
              alt="Logo LADICO" 
              className="form-logo clickable-logo" 
              onClick={handleLogoClick} 
              style={{ cursor: "pointer" }} 
            />
            <h2 className="title">Bienvenido de nuevo</h2>

            {/* Mensajes de error y éxito */}
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="input-group">
              <label htmlFor="login-email">Dirección de correo electrónico</label>
              <div className="input-wrapper">
                <i className="fas fa-user"></i>
                <input
                  type="email"
                  id="login-email"
                  placeholder="ej.: john.mcfly@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onBlur={() => handleFieldBlur('email')}
                  className={hasFieldError('email') ? "error" : ""}
                  required
                  disabled={loading}
                />
              </div>
              {hasFieldError('email') && <span className="field-error">{getFieldError('email')}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="login-password">Contraseña</label>
              <div className="input-wrapper">
                <i className="fas fa-lock"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  id="login-password"
                  placeholder="Ingresa tu contraseña"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onBlur={() => handleFieldBlur('password')}
                  className={hasFieldError('password') ? "error" : ""}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {hasFieldError('password') && <span className="field-error">{getFieldError('password')}</span>}
            </div>

            <div className="forgot-password">
              <button 
                type="button" 
                onClick={handleForgotPassword}
                disabled={loading}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <input 
              type="submit" 
              value={loading ? "Iniciando sesión..." : "Iniciar Sesión"} 
              className="btn solid" 
              disabled={loading}
            />

            <div className="google-login-container">
              <div className="separator">
                <span>Inicia Sesión</span>
                <span style={{ fontWeight: 400, color: "#777" }}>con</span>
              </div>
              <button 
                type="button" 
                className="google-login-btn" 
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <img src="/img/google.png" alt="Google Logo" className="google-icon" />
                <strong>Google</strong>
              </button>
            </div>
          </form>

          {/* Formulario de Registro */}
          <form onSubmit={handleRegister} className="sign-up-form">
            <img 
              src="/img/ladico.png" 
              alt="Logo LADICO" 
              className="form-logo clickable-logo" 
              onClick={handleLogoClick} 
              style={{ cursor: "pointer" }} 
            />
            <h2 className="title">Inscribirse</h2>

            {/* Mensajes de error y éxito */}
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="input-group">
              <label htmlFor="register-username">Nombre completo</label>
              <div className="input-wrapper">
                <i className="fas fa-user"></i>
                <input
                  type="text"
                  id="register-username"
                  placeholder="ej.: John Doe"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  onBlur={() => handleFieldBlur('username')}
                  className={hasFieldError('username') ? "error" : ""}
                  required
                  disabled={loading}
                />
              </div>
              {hasFieldError('username') && <span className="field-error">{getFieldError('username')}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="register-email">Dirección de correo electrónico</label>
              <div className="input-wrapper">
                <i className="fas fa-envelope"></i>
                <input
                  type="email"
                  id="register-email"
                  placeholder="ej.: john.mcfly@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onBlur={() => handleFieldBlur('email')}
                  className={hasFieldError('email') ? "error" : ""}
                  required
                  disabled={loading}
                />
              </div>
              {hasFieldError('email') && <span className="field-error">{getFieldError('email')}</span>}
            </div>

            <div className="inline-group">
              <div className="input-group">
                <label htmlFor="register-age">Edad</label>
                <div className="input-wrapper">
                  <i className="fas fa-calendar"></i>
                  <input
                    type="number"
                    id="register-age"
                    placeholder="ej.: 25"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    onBlur={() => handleFieldBlur('age')}
                    className={hasFieldError('age') ? "error" : ""}
                    min="13"
                    max="120"
                    required
                    disabled={loading}
                  />
                </div>
                {hasFieldError('age') && <span className="field-error">{getFieldError('age')}</span>}
              </div>

              <div className="input-group">
                <label htmlFor="register-gender">Género</label>
                <div className="input-wrapper">
                  <i className="fas fa-venus-mars"></i>
                  <select
                    id="register-gender"
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    onBlur={() => handleFieldBlur('gender')}
                    className={hasFieldError('gender') ? "error" : ""}
                    required
                    disabled={loading}
                  >
                    <option value="">Selecciona...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="No binario">No binario</option>
                    <option value="Prefiero no decirlo">Prefiero no decirlo</option>
                  </select>
                </div>
                {hasFieldError('gender') && <span className="field-error">{getFieldError('gender')}</span>}
              </div>

              <div className="input-group">
                <label htmlFor="register-country">País</label>
                <div className="input-wrapper">
                  <i className="fas fa-globe"></i>
                  <input
                    type="text"
                    id="register-country"
                    placeholder="ej.: Chile"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    onBlur={() => handleFieldBlur('country')}
                    className={hasFieldError('country') ? "error" : ""}
                    required
                    disabled={loading}
                  />
                </div>
                {hasFieldError('country') && <span className="field-error">{getFieldError('country')}</span>}
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="register-password">Contraseña</label>
              <div className="input-wrapper">
                <i className="fas fa-lock"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  id="register-password"
                  placeholder="Mínimo 6 caracteres, incluye mayúscula, minúscula y número"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onBlur={() => handleFieldBlur('password')}
                  className={hasFieldError('password') ? "error" : ""}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {hasFieldError('password') && <span className="field-error">{getFieldError('password')}</span>}
            </div>

            <input 
              type="submit" 
              className="btn" 
              value={loading ? "Creando cuenta..." : "Crear Cuenta"} 
              disabled={loading}
            />
          </form>
        </div>
      </div>

      <div className="panels-container">
        <div className="panel left-panel">
          <div className="content">
            <h3>¿Nuevo en la página?</h3>
            <p>¡Crea tu cuenta en pocos segundos y comienza a evaluar tus competencias digitales!</p>
            <button 
              className="btn transparent" 
              onClick={() => switchMode(true)}
              disabled={loading}
            >
              Registrarse
            </button>
          </div>
          <img src="/img/imagen.png" className="image" alt="Registro" />
        </div>
        <div className="panel right-panel">
          <div className="content">
            <h3>¿Ya eres parte de nosotros?</h3>
            <p>Si ya tienes una cuenta, inicia sesión aquí y continúa con tu evaluación.</p>
            <button 
              className="btn transparent" 
              onClick={() => switchMode(false)}
              disabled={loading}
            >
              Iniciar Sesión
            </button>
          </div>
          <img src="/img/imagen.png" className="image" alt="Login" />
        </div>
      </div>
    </div>
  );
}

export default LoginRegister;

