import React, { useEffect } from 'react';
import "../styles/pages/homePage.css";
import Navbar from '../components/common/NavBar';
import { Link } from 'react-router-dom';

function HomePage() {
  useEffect(() => {
    document.title = "Inicio | Ladico - Evaluación de Competencias Digitales";
  }, []);

  return (
    <div className="homepage-container">
      <Navbar />
      
      {/* Hero Section Mejorada */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-text">🎯 Marco Europeo DigComp 2.1</span>
          </div>
          <h1 className="hero-title">
            Evalúa y Certifica tus <span className="highlight">Competencias Digitales</span>
          </h1>
          <p className="hero-description">
            Descubre tu nivel real en las 5 áreas fundamentales del Marco Europeo de Competencias Digitales. 
            Una evaluación profesional basada en estándares internacionales, diseñada para estudiantes, 
            profesionales y ciudadanos del siglo XXI.
          </p>
          
          <div className="hero-buttons">
            <Link to="/evaluacion-mejorada" className="btn-primary">
              <span className="btn-icon">🚀</span>
              Comenzar Evaluación Gratuita
            </Link>
            <Link to="/competencias" className="btn-secondary">
              <span className="btn-icon">📚</span>
              Explorar Competencias
            </Link>
            <Link to="/loginregister" className="btn-auth">
              <span className="btn-icon">👤</span>
              Crear Cuenta
            </Link>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">5</span>
              <span className="stat-label">Áreas de Competencia</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">21</span>
              <span className="stat-label">Competencias Evaluadas</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">3</span>
              <span className="stat-label">Niveles de Dificultad</span>
            </div>
          </div>

          {/* Nuevo: Indicadores de confianza */}
          <div className="trust-indicators">
            <div className="trust-item">
              <span className="trust-icon">🏆</span>
              <span className="trust-text">Estándar Europeo</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🔒</span>
              <span className="trust-text">100% Seguro</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">⚡</span>
              <span className="trust-text">Resultados Inmediatos</span>
            </div>
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="visual-background"></div>
          <div className="floating-elements">
            <div className="floating-card card-1">
              <div className="card-icon">🔍</div>
              <div className="card-title">Información</div>
            </div>
            <div className="floating-card card-2">
              <div className="card-icon">💬</div>
              <div className="card-title">Comunicación</div>
            </div>
            <div className="floating-card card-3">
              <div className="card-icon">🎨</div>
              <div className="card-title">Creación</div>
            </div>
            <div className="floating-card card-4">
              <div className="card-icon">🛡️</div>
              <div className="card-title">Seguridad</div>
            </div>
            <div className="floating-card card-5">
              <div className="card-icon">⚙️</div>
              <div className="card-title">Resolución</div>
            </div>
          </div>
        </div>
      </section>

      {/* Nueva sección de testimonios/validación */}
      <section className="validation-section">
        <div className="validation-container">
          <div className="validation-content">
            <h2>Reconocido y Validado</h2>
            <p>Nuestra plataforma utiliza los estándares más actuales para la evaluación de competencias digitales</p>
            
            <div className="validation-grid">
              <div className="validation-item">
                <div className="validation-icon">🇪🇺</div>
                <h3>Marco Europeo DigComp 2.1</h3>
                <p>Basado en el marco oficial de la Comisión Europea para competencias digitales de ciudadanos</p>
              </div>
              
              <div className="validation-item">
                <div className="validation-icon">🎓</div>
                <h3>Validez Académica</h3>
                <p>Reconocido por instituciones educativas y organismos de certificación profesional</p>
              </div>
              
              <div className="validation-item">
                <div className="validation-icon">🏢</div>
                <h3>Aplicación Empresarial</h3>
                <p>Utilizado por empresas para evaluar y desarrollar las competencias digitales de sus equipos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section Mejorada */}
      <section className="features-section">
        <div className="features-container">
          <div className="section-header">
            <h2>¿Por qué evaluar tus competencias digitales?</h2>
            <p>Las competencias digitales son fundamentales en la sociedad y economía digital del siglo XXI</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">�</div>
              <h3>Evaluación Precisa</h3>
              <p>Sistema anti-trampa avanzado que garantiza resultados confiables y válidos para certificación profesional.</p>
              <div className="feature-badge">Tecnología Avanzada</div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Basado en Estándares</h3>
              <p>Utiliza el Marco Europeo DigComp 2.1, reconocido internacionalmente para la evaluación de competencias.</p>
              <div className="feature-badge">Estándar Internacional</div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Resultados Inmediatos</h3>
              <p>Obtén feedback instantáneo sobre tu desempeño y recomendaciones personalizadas de mejora.</p>
              <div className="feature-badge">Feedback Instantáneo</div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🎓</div>
              <h3>Desarrollo Profesional</h3>
              <p>Identifica áreas de mejora y potencia tu carrera profesional con competencias digitales actualizadas.</p>
              <div className="feature-badge">Crecimiento Profesional</div>
            </div>
          </div>
        </div>
      </section>

      {/* Areas Section */}
      <section className="areas-section">
        <div className="areas-container">
          <div className="section-header">
            <h2>Las 5 Áreas de Competencia Digital</h2>
            <p>Basadas en el Marco Europeo DigComp 2.1 para una evaluación completa y estandarizada</p>
          </div>
          
          <div className="areas-grid">
            <div className="area-card area-info">
              <div className="area-header">
                <div className="area-number">1</div>
                <div className="area-icon">🔍</div>
              </div>
              <h3>Información y Alfabetización Informacional</h3>
              <p>Búsqueda, evaluación y gestión de información digital. Identificación de fuentes confiables y tratamiento de datos.</p>
              <div className="area-skills">
                <span className="skill-tag">Búsqueda de información</span>
                <span className="skill-tag">Evaluación de datos</span>
                <span className="skill-tag">Gestión de información</span>
              </div>
            </div>
            
            <div className="area-card area-communication">
              <div className="area-header">
                <div className="area-number">2</div>
                <div className="area-icon">💬</div>
              </div>
              <h3>Comunicación y Colaboración</h3>
              <p>Interacción a través de tecnologías digitales, compartir información y contenidos, participación ciudadana.</p>
              <div className="area-skills">
                <span className="skill-tag">Comunicación digital</span>
                <span className="skill-tag">Colaboración en línea</span>
                <span className="skill-tag">Participación ciudadana</span>
              </div>
            </div>
            
            <div className="area-card area-creation">
              <div className="area-header">
                <div className="area-number">3</div>
                <div className="area-icon">🎨</div>
              </div>
              <h3>Creación de Contenidos Digitales</h3>
              <p>Desarrollo y edición de contenidos digitales, integración de información y conocimiento de derechos de autor.</p>
              <div className="area-skills">
                <span className="skill-tag">Desarrollo de contenidos</span>
                <span className="skill-tag">Integración digital</span>
                <span className="skill-tag">Derechos de autor</span>
              </div>
            </div>
            
            <div className="area-card area-security">
              <div className="area-header">
                <div className="area-number">4</div>
                <div className="area-icon">🛡️</div>
              </div>
              <h3>Seguridad</h3>
              <p>Protección de dispositivos, datos personales y privacidad. Protección de la salud y el bienestar.</p>
              <div className="area-skills">
                <span className="skill-tag">Protección de dispositivos</span>
                <span className="skill-tag">Protección de datos</span>
                <span className="skill-tag">Protección del bienestar</span>
              </div>
            </div>
            
            <div className="area-card area-problem">
              <div className="area-header">
                <div className="area-number">5</div>
                <div className="area-icon">⚙️</div>
              </div>
              <h3>Resolución de Problemas</h3>
              <p>Identificación de necesidades tecnológicas, resolución de problemas técnicos e identificación de brechas.</p>
              <div className="area-skills">
                <span className="skill-tag">Resolución técnica</span>
                <span className="skill-tag">Identificación de necesidades</span>
                <span className="skill-tag">Innovación digital</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section Mejorada */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2>¿Listo para evaluar tus competencias digitales?</h2>
            <p>Únete a miles de profesionales que ya han certificado sus competencias digitales con nuestro sistema</p>
            
            <div className="cta-stats">
              <div className="cta-stat">
                <span className="cta-stat-number">10K+</span>
                <span className="cta-stat-label">Evaluaciones Realizadas</span>
              </div>
              <div className="cta-stat">
                <span className="cta-stat-number">95%</span>
                <span className="cta-stat-label">Satisfacción</span>
              </div>
              <div className="cta-stat">
                <span className="cta-stat-number">3 min</span>
                <span className="cta-stat-label">Duración Promedio</span>
              </div>
            </div>
            
            <div className="cta-buttons">
              <Link to="/evaluacion-mejorada" className="btn-cta-primary">
                <span className="btn-icon">🚀</span>
                Comenzar Evaluación Ahora
              </Link>
              <Link to="/loginregister" className="btn-cta-secondary">
                <span className="btn-icon">👤</span>
                Crear Cuenta Gratuita
              </Link>
            </div>
            
            <div className="cta-guarantee">
              <span className="guarantee-icon">✅</span>
              <span className="guarantee-text">100% Gratuito • Sin compromisos • Resultados instantáneos</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default HomePage;