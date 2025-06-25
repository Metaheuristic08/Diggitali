import React from 'react';
import '../../styles/components/CompetenceArea.css';

const CompetenceArea = ({ area, competences, color, onClick }) => {
  return (
    <div 
      className={`competence-area ${color}`}
      onClick={() => onClick(area)}
    >
      <div className="area-header">
        <h2>{area.name}</h2>
        <div className="area-number">{area.number}</div>
      </div>
      
      <div className="competences-list">
        {competences.map((competence, index) => (
          <div key={competence.id} className="competence-item">
            <span className="competence-number">{area.number}.{index + 1}</span>
            <span className="competence-name">{competence.name}</span>
          </div>
        ))}
      </div>
      
      <div className="questions-count">
        {competences.reduce((total, comp) => total + comp.questionCount, 0)} preguntas
      </div>
    </div>
  );
};

export default CompetenceArea;
