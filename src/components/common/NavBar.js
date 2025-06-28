import React from 'react';
import '../../styles/components/navBar.css';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Navbar() {
  const { currentUser, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

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
        <li><Link to="/competencias">Competencias</Link></li>
      </ul>
      <div className="navbar-button">
        {currentUser ? (
          <div className="user-menu">
            <span className="user-email">{currentUser.email}</span>
            <button onClick={handleLogout} className="logout-btn">Cerrar Sesión</button>
          </div>
        ) : (
          <Link to="/loginregister" className="get-started-btn">Iniciar Sesión</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
