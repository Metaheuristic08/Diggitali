import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/components/CompetenceCard.css';

const CompetenceCard = ({ competence, areaNumber, index, color = 'blue' }) => {
  return (
    <div className={`competence-card-container ${color}`}>
      <div className="competence-card-cylinder">
        <div className="competence-card-top">
          <span className="competence-category">{competence.category || 'Búsqueda y Gestión de Información y Datos'}</span>
        </div>
        
        <div className="competence-card-body">
          <h3 className="competence-title">
            {competence.name || competence.title}
          </h3>
          
          <div className="competence-level">
            <div className="level-circle">
              <span className="level-text">LEVEL</span>
              <span className="level-dash">—</span>
            </div>
          </div>
        </div>
        
        <div className="competence-card-bottom">
          <Link 
            to={`/evaluacion-mejorada?competence=${competence.id}`}
            className="start-button"
          >
            Comenzar
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CompetenceCard;

