import React, { useState, useEffect } from 'react';
import { CircularProgress, Alert, Box } from '@mui/material';
import CompetenceCard from './CompetenceCard';
import QuestionsService from '../../services/questionsService';

const CompetenceList = () => {
  const [categories, setCategories] = useState([]);
  const [competences, setCompetences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [categoriesData, competencesData] = await Promise.all([
          QuestionsService.getCategories(),
          QuestionsService.getCompetences()
        ]);
        
        setCategories(categoriesData);
        setCompetences(competencesData);
        setError(null);
      } catch (err) {
        console.error('Error cargando datos:', err);
        setError('Error al cargar las competencias. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  // Organizar competencias por categoría
  const organizedData = categories.map(category => {
    const categoryCompetences = competences
      .filter(comp => comp.category === category.code)
      .map(comp => ({
        code: comp.code,
        title: comp.name,
        level: 0, // Esto se podría obtener del progreso del usuario
        description: comp.description
      }));

    return {
      area: category.name,
      color: category.color,
      competences: categoryCompetences
    };
  });

  return (
    <div className="competence-area-list">
      {organizedData.map((group, i) => (
        <section key={i} className="competence-area">
          <div className="competence-list">
            {group.competences.map((item, j) => (
              <CompetenceCard
                key={j}
                category={group.area}
                title={item.title}
                level={item.level}
                color={group.color}
                description={item.description}
                competenceCode={item.code}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default CompetenceList;
