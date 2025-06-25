import React from 'react';
import '../../styles/components/navBar.css';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        {/* Usamos una imagen en lugar del texto */}
        <Link to="/homepage">
          <img 
            src="/img/ladico.png" 
            alt="LADICO" 
            className="navbar-logo-image"
          />
        </Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/homepage">Inicio</Link></li>
        <li><Link to="/competencias-digitales">Competencias</Link></li>
        <li><Link to="/evaluacion-digital">Evaluación</Link></li>
        <li><Link to="/generador-items">Generador</Link></li>
      </ul>
      <div className="navbar-button">
        <Link to="/loginregister" className="get-started-btn">Iniciar Sesión</Link>
      </div>
    </nav>
  );
}

export default Navbar;
