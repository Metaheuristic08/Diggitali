import React, { useState, useEffect } from 'react';
import QuestionsService from '../services/questionsService';
import CompetenceArea from '../components/competences/CompetenceArea';
import CompetenceDetail from '../components/competences/CompetenceDetail';
import '../styles/pages/DigitalCompetencesPage.css';

const questionsService = new QuestionsService();

const DigitalCompetencesPage = () => {
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Definición de las 5 áreas con sus colores
  const areaColors = {
    'Información y alfabetización informacional': 'yellow',
    'Comunicación y colaboración': 'pink',
    'Creación de contenidos digitales': 'blue',
    'Seguridad': 'green',
    'Resolución de problemas': 'beige'
  };

  const areaNumbers = {
    'Información y alfabetización informacional': 1,
    'Comunicación y colaboración': 2,
    'Creación de contenidos digitales': 3,
    'Seguridad': 4,
    'Resolución de problemas': 5
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const competencesData = await questionsService.getCompetences();

        // Agrupar competencias por área
        const areaGroups = {};
        competencesData.forEach(comp => {
          if (!areaGroups[comp.area]) {
            areaGroups[comp.area] = [];
          }
          areaGroups[comp.area].push(comp);
        });

        // Crear estructura de áreas
        const areasData = Object.keys(areaGroups).map(areaName => ({
          name: areaName,
          number: areaNumbers[areaName] || 0,
          competences: areaGroups[areaName].sort((a, b) => a.name.localeCompare(b.name))
        }));

        setAreas(areasData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [areaNumbers]);

  const handleAreaClick = (area) => {
    setSelectedArea(area);
  };

  const handleBackToAreas = () => {
    setSelectedArea(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="pentagon-loader">
          <div className="pentagon-spinner"></div>
        </div>
        <p>Cargando competencias digitales...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error al cargar las competencias</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="digital-competences-page">
      {!selectedArea ? (
        <>
          <header className="page-header">
            <h1>Marco de Competencias Digitales</h1>
            <p className="subtitle">
              Basado en el Marco Europeo DigComp 2.1
            </p>
            <div className="header-stats">
              <div className="stat-item">
                <span className="stat-number">5</span>
                <span className="stat-label">Áreas</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">21</span>
                <span className="stat-label">Competencias</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">159</span>
                <span className="stat-label">Preguntas</span>
              </div>
            </div>
          </header>

          <main className="competences-main">
            <div className="pentagon-container">
              <div className="pentagon-center">
                <div className="digcomp-logo">
                  <span>DigComp</span>
                  <span>2.1</span>
                </div>
              </div>
              
              {areas.map((area, index) => (
                <div key={area.name} className={`pentagon-section section-${index + 1}`}>
                  <CompetenceArea
                    area={area}
                    competences={area.competences}
                    color={areaColors[area.name]}
                    onClick={handleAreaClick}
                  />
                </div>
              ))}
            </div>

            <div className="areas-grid">
              {areas.map((area) => (
                <div
                  key={area.name}
                  className={`area-card ${areaColors[area.name]}`}
                  onClick={() => handleAreaClick(area)}
                >
                  <div className="area-card-header">
                    <span className="area-number">{area.number}</span>
                    <h3>{area.name}</h3>
                  </div>
                  
                  <div className="competences-preview">
                    {area.competences.map((comp, index) => (
                      <div key={comp.id} className="competence-preview">
                        <span className="comp-number">{area.number}.{index + 1}</span>
                        <span className="comp-name">{comp.name}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="area-footer">
                    <span className="questions-total">
                      {area.competences.reduce((total, comp) => total + comp.questionCount, 0)} preguntas
                    </span>
                    <button className="explore-btn">Explorar</button>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </>
      ) : (
        <CompetenceDetail
          area={selectedArea}
          onBack={handleBackToAreas}
          color={areaColors[selectedArea.name]}
        />
      )}
    </div>
  );
};

export default DigitalCompetencesPage;
