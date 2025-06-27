import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/components/CompetenceCard.css';

function CompetenceCard({ competence, areaNumber, index, color }) {
  const navigate = useNavigate();
  // Por defecto, nivel no alcanzado
  const level = competence.userLevel || 0;
  const progressDegrees = level > 0 ? level * 120 : 0; // 0-3 niveles, 120 grados por nivel

  // Mapeo de colores según el área
  const colorMap = {
    'blue': { gradient: 'linear-gradient(180deg, #00a8e8 0%, #007ea7 100%)', stroke: '#00a8e8' },
    'green': { gradient: 'linear-gradient(180deg, #27ae60 0%, #229954 100%)', stroke: '#27ae60' },
    'orange': { gradient: 'linear-gradient(180deg, #ff7e29 0%, #e65100 100%)', stroke: '#ff7e29' },
    'red': { gradient: 'linear-gradient(180deg, #e53935 0%, #c62828 100%)', stroke: '#e53935' },
    'purple': { gradient: 'linear-gradient(180deg, #8e24aa 0%, #6a1b9a 100%)', stroke: '#8e24aa' }
  };

  const colorStyle = colorMap[color] || { gradient: '#ccc', stroke: '#19a8f8' };

  const handleClick = () => {
    // Almacenar información de la competencia seleccionada en sessionStorage para recuperarla en la evaluación
    sessionStorage.setItem('selectedCompetence', JSON.stringify(competence));
    navigate('/evaluacion-mejorada');
  };

  // Truncar el nombre si es demasiado largo
  const truncateName = (name) => {
    return name.length > 50 ? name.substring(0, 47) + '...' : name;
  };

  return (
    <div className={`competence-card-container ${color}`}>
      <div className="competence-card-cylinder animate__animated animate__fadeIn">
        <div className="competence-card-top">
          <div className="competence-category-wrapper">
            <p className="competence-category">{competence.category}</p>
            <span className="competence-number-badge">{areaNumber}.{index + 1}</span>
          </div>
          
          {competence.questionCount > 0 && (
            <div className="questions-count-badge">
              <span className="questions-icon">❓</span>
              <span className="questions-number">{competence.questionCount}</span>
            </div>
          )}
        </div>
        
        <div className="competence-card-body">
          <h3 className="competence-title">
            {truncateName(competence.name)}
          </h3>
          
          <div className="competence-level">
            <div className="level-circle">
              <svg width="80" height="80">
                {/* Círculo de fondo */}
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth="5"
                  fill="none"
                />
                {/* Círculo de progreso */}
                {progressDegrees > 0 && (
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    stroke="rgba(255, 255, 255, 0.9)"
                    strokeWidth="5"
                    fill="none"
                    strokeDasharray={`${progressDegrees} ${360}`}
                    strokeDashoffset="90"
                    transform="rotate(-90 40 40)"
                  />
                )}
              </svg>
              <div className="level-indicator">
                <span className="level-text">NIVEL</span>
                <span className="level-value">{level > 0 ? level : '–'}</span>
              </div>
            </div>
          </div>
          
          {level > 0 && (
            <div className="level-label">
              {level === 1 ? 'Nivel Básico' : 
               level === 2 ? 'Nivel Intermedio' : 'Nivel Avanzado'}
            </div>
          )}
        </div>
        
        <div className="competence-card-bottom">
          <button className="start-button" onClick={handleClick}>
            {level === 0 ? "Comenzar" : "Continuar"}
            <span className="button-icon">➤</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompetenceCard;
