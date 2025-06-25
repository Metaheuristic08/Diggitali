import React, { useEffect } from 'react';
import "../styles/pages/homePage.css";
import Navbar from '../components/common/NavBar';
import { Link } from 'react-router-dom';


function HomePage() {
  useEffect(() => {
    document.title = "Inicio | Ladico";
  }, []);

  return (
    <div className="homepage-container">
      <Navbar />
      {/* Primera sección */}
      <section className="intro-section">
        <div className="intro-text">
          <h1>Desafíos y habilidades de las pruebas </h1>
          <p>Descubra nuestro benchmark y las particularidades de la evaluación de competencias digitales</p>
        </div>
        <div className="intro-image">
          <img src="/img/intro-illustration.png" alt="Introducción" />
        </div>
      </section>

      {/* Segunda sección */}
      <section className="skills-section">
        <div className="skills-text">
          <h2>Habilidades digitales: ¿qué son?</h2>
          <p>Convertidas en esenciales en la vida personal, profesional y cívica, las competencias digitales que pones a prueba, desarrollas y certificas en Pix son transferibles y transversales. Son útiles para todos: alumnos, estudiantes, profesionales, personas en busca de empleo, jubilados, etc., y en cualquier circunstancia, más allá de las herramientas y el software.</p>
        </div>
        <div className="skills-cards">
          <img src="/img/skills-cards.png" alt="Tarjetas de habilidades" />
        </div>
      </section>

      {/* Tercera sección */}
      <section className="areas-section">
        <h2>Ponte a prueba en 5 áreas digitales principales</h2>
        <p>Las pruebas ladico evalúan tu dominio en 5 áreas y 21 competencias digitales del <a href="https://joint-research-centre.ec.europa.eu/digcomp_en" target="_blank" rel="noopener noreferrer">Marco de Referencia Europeo DigComp</a>.</p>
        
        <div className="evaluation-buttons" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', margin: '2rem 0' }}>
          <Link to="/competencias-digitales" className="btn-areas">
            🚀 Explorar Competencias Digitales
          </Link>
          <Link to="/evaluacion-mejorada" className="btn-areas" style={{ backgroundColor: '#4CAF50' }}>
            ⭐ Nueva Evaluación Mejorada
          </Link>
          <Link to="/evaluacion-digital" className="btn-areas" style={{ backgroundColor: '#FF9800' }}>
            📝 Evaluación Original
          </Link>
        </div>

        <div className="areas-cards">
          <div className="area-card">
            <h3>Información y datos</h3>
            <p>Motor de búsqueda, seguimiento de información, noticias falsas, organización de archivos, uso de hojas de cálculo...</p>
          </div>
          <div className="area-card">
            <h3>Comunicación y colaboración</h3>
            <p>Correo electrónico, calendario, redes sociales, herramientas colaborativas, e-ciudadanía...</p>
          </div>
          <div className="area-card">
            <h3>Creación de contenido</h3>
            <p>Tratamiento de textos, imagen, sonido y video, derechos de autor, programación...</p>
          </div>
          <div className="area-card">
            <h3>Protección y seguridad</h3>
            <p>Datos personales, accesibilidad, ergonomía, ciberseguridad, impactos ambientales de la tecnología digital...</p>
          </div>
          <div className="area-card">
            <h3>Entorno digital</h3>
            <p>Resolución de problemas técnicos, sistema operativo, componentes, historia de la informática...</p>
          </div>
        </div>
      </section>

    </div>
  );
}

export default HomePage;