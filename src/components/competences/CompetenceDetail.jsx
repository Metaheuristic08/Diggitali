import React, { useState, useEffect } from 'react';
import QuestionsService from '../../services/questionsService';
import '../../styles/components/CompetenceDetail.css';

const questionsService = new QuestionsService();

const CompetenceDetail = ({ area, onBack, color }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompetence, setSelectedCompetence] = useState(null);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        // Cargar preguntas para todas las competencias del área
        const allQuestions = [];
        for (const competence of area.competences) {
          const compQuestions = await questionsService.getQuestionsByCompetence(competence.name);
          allQuestions.push(...compQuestions.map(q => ({ ...q, competenceId: competence.id })));
        }
        setQuestions(allQuestions);
      } catch (error) {
        console.error('Error loading questions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [area]);

  return (
    <div className={`competence-detail ${color}`}>
      <header className="detail-header">
        <button onClick={onBack} className="back-button">
          ← Volver a áreas
        </button>
        <div className="area-title">
          <div className="area-icon">
            <span className="area-number">{area.number}</span>
          </div>
          <div className="area-info">
            <h1>{area.name}</h1>
            <p className="area-description">
              {getAreaDescription(area.name)}
            </p>
          </div>
        </div>
      </header>

      <main className="detail-main">
        <div className="competences-section">
          <h2>Competencias en esta área</h2>
          <div className="competences-grid">
            {area.competences.map((competence, index) => (
              <div
                key={competence.id}
                className={`competence-card ${selectedCompetence?.id === competence.id ? 'selected' : ''}`}
                onClick={() => setSelectedCompetence(competence === selectedCompetence ? null : competence)}
              >
                <div className="competence-header">
                  <span className="competence-number">{area.number}.{index + 1}</span>
                  <h3>{competence.name}</h3>
                </div>
                <p className="competence-description">{competence.description}</p>
                <div className="competence-stats">
                  <span className="question-count">{competence.questionCount} preguntas</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedCompetence && (
          <div className="questions-section">
            <h3>Preguntas de: {selectedCompetence.name}</h3>
            {loading ? (
              <div className="loading">Cargando preguntas...</div>
            ) : (
              <div className="questions-list">
                {questions
                  .filter(q => q.competence === selectedCompetence.name)
                  .map((question, index) => (
                    <div key={question.id} className="question-preview">
                      <div className="question-header">
                        <span className="question-number">Pregunta {index + 1}</span>
                        <span className="question-level">{question.level}</span>
                      </div>
                      <h4>{question.title}</h4>
                      <p className="question-scenario">{question.scenario}</p>
                      <div className="question-options">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="option-preview">
                            {String.fromCharCode(65 + optIndex)}. {option}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// Función helper para obtener descripciones de áreas
const getAreaDescription = (areaName) => {
  const descriptions = {
    'Información y alfabetización informacional': 'Identificar, localizar, recuperar, almacenar, organizar y analizar la información digital, evaluando su finalidad y relevancia.',
    'Comunicación y colaboración': 'Comunicar en entornos digitales, compartir recursos a través de herramientas en línea, conectar y colaborar con otros a través de herramientas digitales.',
    'Creación de contenidos digitales': 'Crear y editar contenidos nuevos, integrar y reelaborar conocimientos y contenidos previos, realizar producciones artísticas y contenidos multimedia.',
    'Seguridad': 'Protección personal, protección de datos, protección de la identidad digital, uso de seguridad, uso seguro y sostenible.',
    'Resolución de problemas': 'Identificar necesidades y problemas, y resolver problemas conceptuales y situaciones problemáticas en entornos digitales.'
  };
  return descriptions[areaName] || '';
};

export default CompetenceDetail;
