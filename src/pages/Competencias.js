import React, { useState, useEffect } from 'react';
import CompetenceCard from '../components/competences/CompetenceCard';
import Navbar from '../components/common/NavBar';
import Sidebar from '../components/common/Sidebar';
import QuestionsService from '../services/questionsService';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import '../styles/pages/competences.css';
import { useAuth } from '../context/AuthContext';

const Competencias = () => {
  const [competences, setCompetences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [visibleCompetences, setVisibleCompetences] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const { currentUser } = useAuth();

  useEffect(() => {
    // Cargar competencias desde Firebase
    const loadCompetences = async () => {
      try {
        setLoading(true);
        
        // Intentar obtener datos desde firestore
        let competencesData = [];
        
        // Intentar buscar las competencias con una consulta ordenada
        try {
          const competencesQuery = query(
            collection(db, 'competences'), 
            orderBy('areaNumber', 'asc'),
            orderBy('code', 'asc')
          );
          const competencesSnapshot = await getDocs(competencesQuery);

          if (!competencesSnapshot.empty) {
            competencesData = competencesSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              userLevel: Math.floor(Math.random() * 2), // Simulación de nivel alcanzado por el usuario (0, 1)
              questionCount: Math.floor(Math.random() * 10) + 5, // Simulación de cantidad de preguntas (5-15)
            }));
            console.log('Datos cargados desde Firestore:', competencesData);
          } else {
            throw new Error('No hay datos en Firestore');
          }
        } catch (firestoreError) {
          console.log('Error o datos no encontrados en Firestore, usando datos locales', firestoreError);
          // Si no hay datos en Firebase, usar los datos de ejemplo con simulación de nivel de usuario
          competencesData = [
            {
              id: 1,
              name: "Navegación, búsqueda y filtrado de información, datos y contenidos digitales",
              category: "Búsqueda y Gestión de Información y Datos",
              area: "Información y alfabetización informacional",
              areaNumber: 1,
              color: "blue",
              userLevel: Math.floor(Math.random() * 2), 
              questionCount: Math.floor(Math.random() * 10) + 5
            },
            {
              id: 2,
              name: "Evaluación de datos, información y contenidos digitales",
              category: "Búsqueda y Gestión de Información y Datos",
              area: "Información y alfabetización informacional",
              areaNumber: 1,
              color: "blue",
              userLevel: Math.floor(Math.random() * 2),
              questionCount: Math.floor(Math.random() * 10) + 5
            },
            {
              id: 3,
              name: "Gestión de datos, información y contenidos digitales",
              category: "Búsqueda y Gestión de Información y Datos",
              area: "Información y alfabetización informacional",
              areaNumber: 1,
              color: "blue",
              userLevel: Math.floor(Math.random() * 2),
              questionCount: Math.floor(Math.random() * 10) + 5
            },
            {
              id: 4,
              name: "Interacción mediante tecnologías digitales",
              category: "Comunicación y Colaboración",
              area: "Comunicación y colaboración",
              areaNumber: 2,
              color: "green",
              userLevel: Math.floor(Math.random() * 2),
              questionCount: Math.floor(Math.random() * 10) + 5
            },
            {
              id: 5,
              name: "Compartir mediante tecnologías digitales",
              category: "Comunicación y Colaboración",
              area: "Comunicación y colaboración",
              areaNumber: 2,
              color: "green",
              userLevel: Math.floor(Math.random() * 2),
              questionCount: Math.floor(Math.random() * 10) + 5
            },
            {
              id: 6,
              name: "Participación ciudadana en línea",
              category: "Comunicación y Colaboración",
              area: "Comunicación y colaboración",
              areaNumber: 2,
              color: "green",
              userLevel: Math.floor(Math.random() * 2),
              questionCount: Math.floor(Math.random() * 10) + 5
            },
            {
              id: 7,
              name: "Colaboración mediante tecnologías digitales",
              category: "Comunicación y Colaboración",
              area: "Comunicación y colaboración",
              areaNumber: 2,
              color: "green",
              userLevel: Math.floor(Math.random() * 2),
              questionCount: Math.floor(Math.random() * 10) + 5
            },
            {
              id: 8,
              name: "Netiqueta",
              category: "Comunicación y Colaboración",
              area: "Comunicación y colaboración",
              areaNumber: 2,
              color: "green",
              userLevel: Math.floor(Math.random() * 2),
              questionCount: Math.floor(Math.random() * 10) + 5
            },
            {
              id: 9,
              name: "Gestión de la identidad digital",
              category: "Comunicación y Colaboración",
              area: "Comunicación y colaboración",
              areaNumber: 2,
              color: "green",
              userLevel: Math.floor(Math.random() * 2),
              questionCount: Math.floor(Math.random() * 10) + 5
            },
            {
              id: 10,
              name: "Desarrollo de contenidos digitales",
              category: "Creación de Contenidos Digitales",
              area: "Creación de contenidos digitales",
              areaNumber: 3,
              color: "orange",
              userLevel: Math.floor(Math.random() * 2),
              questionCount: Math.floor(Math.random() * 10) + 5
            },
            {
              id: 11,
              name: "Integración y reelaboración de contenidos digitales",
              category: "Creación de Contenidos Digitales",
              area: "Creación de contenidos digitales",
              areaNumber: 3,
              color: "orange",
              userLevel: Math.floor(Math.random() * 2),
              questionCount: Math.floor(Math.random() * 10) + 5
            },
            {
              id: 12,
              name: "Derechos de autor y licencias",
              category: "Creación de Contenidos Digitales",
              area: "Creación de contenidos digitales",
              areaNumber: 3,
              color: "orange",
              userLevel: Math.floor(Math.random() * 2),
              questionCount: Math.floor(Math.random() * 10) + 5
            },
            {
              id: 13,
              name: "Programación",
              category: "Creación de Contenidos Digitales",
              area: "Creación de contenidos digitales",
              areaNumber: 3,
              color: "orange",
              userLevel: Math.floor(Math.random() * 2),
              questionCount: Math.floor(Math.random() * 10) + 5
            },
            {
              id: 14,
              name: "Protección de dispositivos",
              category: "Seguridad",
              area: "Seguridad",
              areaNumber: 4,
              color: "red",
              userLevel: Math.floor(Math.random() * 2),
              questionCount: Math.floor(Math.random() * 10) + 5
            },
            {
              id: 15,
              name: "Protección de datos personales y privacidad",
              category: "Seguridad",
              area: "Seguridad",
              areaNumber: 4,
              color: "red",
              userLevel: Math.floor(Math.random() * 2),
              questionCount: Math.floor(Math.random() * 10) + 5
            },
            {
              id: 16,
              name: "Protección de la salud y el bienestar",
              category: "Seguridad",
              area: "Seguridad",
              areaNumber: 4,
              color: "red",
              userLevel: Math.floor(Math.random() * 2),
              questionCount: Math.floor(Math.random() * 10) + 5
            },
            {
              id: 17,
              name: "Protección del medioambiente",
              category: "Seguridad",
              area: "Seguridad",
              areaNumber: 4,
              color: "red",
              userLevel: Math.floor(Math.random() * 2),
              questionCount: Math.floor(Math.random() * 10) + 5
            },
            {
              id: 18,
              name: "Resolución de problemas técnicos",
              category: "Resolución de Problemas",
              area: "Resolución de problemas",
              areaNumber: 5,
              color: "purple",
              userLevel: Math.floor(Math.random() * 2),
              questionCount: Math.floor(Math.random() * 10) + 5
            },
            {
              id: 19,
              name: "Identificación de necesidades y respuestas tecnológicas",
              category: "Resolución de Problemas",
              area: "Resolución de problemas",
              areaNumber: 5,
              color: "purple",
              userLevel: Math.floor(Math.random() * 2),
              questionCount: Math.floor(Math.random() * 10) + 5
            },
            {
              id: 20,
              name: "Uso creativo de la tecnología digital",
              category: "Resolución de Problemas",
              area: "Resolución de problemas",
              areaNumber: 5,
              color: "purple",
              userLevel: Math.floor(Math.random() * 2),
              questionCount: Math.floor(Math.random() * 10) + 5
            },
            {
              id: 21,
              name: "Identificación de lagunas en las competencias digitales",
              category: "Resolución de Problemas",
              area: "Resolución de problemas",
              areaNumber: 5,
              color: "purple",
              userLevel: Math.floor(Math.random() * 2),
              questionCount: Math.floor(Math.random() * 10) + 5
            }
          ];
        }

        setCompetences(competencesData);
        
        // Mostrar todas las competencias inicialmente
        setVisibleCompetences(competencesData);
      } catch (error) {
        console.error('Error loading competences:', error);
        setError('Error al cargar las competencias. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    loadCompetences();
  }, []);

  // Filtrar competencias por área o buscar por término
  useEffect(() => {
    let filtered = [...competences];
    
    // Filtrar por área seleccionada
    if (selectedArea) {
      filtered = filtered.filter(comp => comp.area === selectedArea);
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(comp => 
        comp.name.toLowerCase().includes(term) || 
        comp.area.toLowerCase().includes(term)
      );
    }
    
    // Filtrar por nivel
    if (activeFilter === 'started') {
      filtered = filtered.filter(comp => comp.userLevel > 0);
    } else if (activeFilter === 'pending') {
      filtered = filtered.filter(comp => comp.userLevel === 0);
    }
    
    setVisibleCompetences(filtered);
  }, [competences, selectedArea, searchTerm, activeFilter]);

  // Manejar selección de área
  const handleAreaSelect = (area) => {
    setSelectedArea(area === selectedArea ? null : area);
  };

  // Manejar cambio en la búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Manejar cambio en el filtro
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  if (loading) {
    return (
      <div className="competences-page">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando competencias digitales...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="competences-page">
        <Navbar />
        <div className="error-container">
          <h2>Oops! Ha ocurrido un error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  // Agrupar competencias por área
  const competencesByArea = competences.reduce((acc, competence) => {
    if (!acc[competence.area]) {
      acc[competence.area] = [];
    }
    acc[competence.area].push(competence);
    return acc;
  }, {});

  // Obtener áreas únicas para filtros
  const uniqueAreas = [...new Set(competences.map(comp => comp.area))];
  
  // Calcular progreso del usuario
  const completedCount = competences.filter(comp => comp.userLevel > 0).length;
  const progressPercentage = Math.round((completedCount / competences.length) * 100);

  return (
    <div className="competences-page">
      <Navbar />
      
      <header className="competences-header">
        <div className="header-content animate__animated animate__fadeInDown">
          <h1>Competencias Digitales</h1>
          <p className="header-subtitle">
            Evalúa tu nivel en las 5 áreas fundamentales del Marco Europeo de Competencias Digitales (DigComp 2.1)
          </p>
          
          <div className="user-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="progress-text">
              Has completado <span className="progress-highlight">{completedCount} de {competences.length}</span> competencias ({progressPercentage}%)
            </p>
          </div>
          
          <div className="header-stats">
            <div className="stat-item animate__animated animate__fadeInUp animate__delay-1s">
              <span className="stat-number">5</span>
              <span className="stat-label">ÁREAS DE COMPETENCIA</span>
            </div>
            <div className="stat-item animate__animated animate__fadeInUp animate__delay-2s">
              <span className="stat-number">21</span>
              <span className="stat-label">COMPETENCIAS EVALUADAS</span>
            </div>
            <div className="stat-item animate__animated animate__fadeInUp animate__delay-3s">
              <span className="stat-number">3</span>
              <span className="stat-label">NIVELES DE DIFICULTAD</span>
            </div>
          </div>
        </div>
      </header>

      <div className="controls-container">
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Buscar competencias..." 
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="filters-container">
          <div className="filter-label">Filtrar por:</div>
          <button 
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`} 
            onClick={() => handleFilterChange('all')}
          >
            Todas
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'started' ? 'active' : ''}`} 
            onClick={() => handleFilterChange('started')}
          >
            Iniciadas
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'pending' ? 'active' : ''}`} 
            onClick={() => handleFilterChange('pending')}
          >
            Pendientes
          </button>
        </div>
        
        <div className="areas-tabs">
          <button 
            className={`area-tab ${!selectedArea ? 'active' : ''}`} 
            onClick={() => handleAreaSelect(null)}
          >
            Todas
          </button>
          {uniqueAreas.map((area, idx) => (
            <button 
              key={idx} 
              className={`area-tab ${selectedArea === area ? 'active' : ''} area-${competencesByArea[area][0].color}`}
              onClick={() => handleAreaSelect(area)}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      <main className="competences-main">
        {visibleCompetences.length > 0 ? (
          <>
            {selectedArea ? (
              <section className="competence-area-section">
                <div className="area-header animate__animated animate__fadeIn">
                  <h2 className="area-title">
                    <span className="area-number">{competencesByArea[selectedArea][0].areaNumber}</span>
                    {selectedArea}
                  </h2>
                  <p className="area-description">
                    {getAreaDescription(selectedArea)}
                  </p>
                </div>
                
                <div className="competences-grid">
                  {visibleCompetences.map((competence, index) => (
                    <div className="competence-card-wrapper animate__animated animate__fadeIn" style={{animationDelay: `${index * 0.1}s`}} key={competence.id}>
                      <CompetenceCard
                        competence={competence}
                        areaNumber={competence.areaNumber}
                        index={competencesByArea[competence.area].findIndex(c => c.id === competence.id)}
                        color={competence.color}
                      />
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              Object.entries(competencesByArea)
                .filter(([area, comps]) => visibleCompetences.some(vc => vc.area === area))
                .map(([areaName, areaCompetences], areaIdx) => {
                  // Filtramos solo las competencias visibles de esta área
                  const visibleAreaCompetences = visibleCompetences.filter(vc => vc.area === areaName);
                  
                  if (visibleAreaCompetences.length === 0) return null;
                  
                  return (
                    <section key={areaName} className="competence-area-section animate__animated animate__fadeIn" style={{animationDelay: `${areaIdx * 0.2}s`}}>
                      <div className="area-header">
                        <h2 className="area-title">
                          <span className="area-number">{areaCompetences[0].areaNumber}</span>
                          {areaName}
                        </h2>
                        <p className="area-description">
                          {getAreaDescription(areaName)}
                        </p>
                      </div>
                      
                      <div className="competences-grid">
                        {visibleAreaCompetences.map((competence, index) => (
                          <div className="competence-card-wrapper animate__animated animate__fadeIn" style={{animationDelay: `${index * 0.1}s`}} key={competence.id}>
                            <CompetenceCard
                              competence={competence}
                              areaNumber={competence.areaNumber}
                              index={areaCompetences.findIndex(c => c.id === competence.id)}
                              color={competence.color}
                            />
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })
            )}
          </>
        ) : (
          <div className="no-results">
            <div className="no-results-icon">🔎</div>
            <h3>No se encontraron resultados</h3>
            <p>Intenta con otros términos de búsqueda o filtros</p>
            <button className="clear-filters-btn" onClick={() => {
              setSearchTerm('');
              setSelectedArea(null);
              setActiveFilter('all');
            }}>
              Limpiar filtros
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

// Función helper para obtener descripciones de áreas
const getAreaDescription = (areaName) => {
  const descriptions = {
    'Información y alfabetización informacional': 'Identificar, localizar, recuperar, almacenar, organizar y analizar información digital, evaluando su finalidad y relevancia para tus necesidades y propósitos.',
    'Comunicación y colaboración': 'Comunicar en entornos digitales, compartir recursos a través de herramientas en línea, conectar y colaborar con otros mediante tecnologías digitales.',
    'Creación de contenidos digitales': 'Crear y editar contenidos digitales nuevos, integrar y reelaborar conocimientos y contenidos previos, realizar producciones artísticas y contenidos multimedia.',
    'Seguridad': 'Protección de dispositivos, datos personales y privacidad, salud y bienestar, y protección del medioambiente en entornos digitales.',
    'Resolución de problemas': 'Identificar necesidades y problemas, resolver problemas técnicos y conceptuales, y usar creativamente las tecnologías digitales para innovar procesos.'
  };
  return descriptions[areaName] || '';
};

export default Competencias;

