import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BlockIcon from '@mui/icons-material/Block';
import TrophyIcon from '@mui/icons-material/EmojiEvents';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import HomeIcon from '@mui/icons-material/Home';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import QuestionsService from '../../services/questionsService';

const EvaluationResults = ({ 
  score, 
  level, 
  totalQuestions, 
  questionDetails = [],
  competences = [],
  answers = [],
  onRestart,
  onHome,
  showDetailedResults = true 
}) => {
  const navigate = useNavigate();
  const [showConfirmRestart, setShowConfirmRestart] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const percentage = ((score.correct / totalQuestions) * 100).toFixed(1);

  // Evaluar si puede avanzar usando la lógica 2/3 correctas
  const advancement = QuestionsService.evaluateAdvancement(score.correct, totalQuestions);
  
  // Obtener recomendaciones
  const recommendations = QuestionsService.getRecommendations(score, totalQuestions);

  // Determinar el nivel basado en el porcentaje
  const getLevelInfo = (percentage) => {
    if (percentage >= 80) {
      return {
        level: "Pionero Digital",
        color: "success",
        description: "Excelente dominio de las competencias digitales",
        icon: "🏆",
        gradient: "linear-gradient(135deg, #4CAF50, #45a049)"
      };
    } else if (percentage >= 60) {
      return {
        level: "Integrador", 
        color: "info",
        description: "Buen nivel de competencias digitales",
        icon: "⭐",
        gradient: "linear-gradient(135deg, #2196F3, #1976d2)"
      };
    } else {
      return {
        level: "Explorador",
        color: "warning",
        description: "Nivel básico, con oportunidades de mejora",
        icon: "🌱",
        gradient: "linear-gradient(135deg, #FF9800, #f57c00)"
      };
    }
  };

  const levelInfo = getLevelInfo(percentage);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mis Resultados de Competencias Digitales',
          text: `¡Obtuve un ${percentage}% en la evaluación de competencias digitales! Nivel: ${levelInfo.level}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error al compartir:', err);
      }
    } else {
      // Fallback para navegadores que no soportan Web Share API
      const text = `¡Obtuve un ${percentage}% en la evaluación de competencias digitales! Nivel: ${levelInfo.level}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
        alert('Resultado copiado al portapapeles');
      }
    }
  };

  const handleDownload = () => {
    const results = {
      fecha: new Date().toLocaleDateString(),
      puntuacion: {
        correctas: score.correct,
        incorrectas: score.incorrect,
        bloqueadas: score.blocked,
        total: totalQuestions,
        porcentaje: percentage
      },
      nivel: levelInfo.level,
      detalles: questionDetails
    };

    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `resultados_competencias_digitales_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header con logo */}
      <Box sx={{ 
        position: 'absolute', 
        top: 20, 
        left: 20,
        zIndex: 1,
        '& img': {
          height: '80px',
          filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))'
        }
      }}>
        <img src="/img/ladico.png" alt="LADICO Logo" />
      </Box>

      <Paper elevation={3} sx={{ p: 4, mt: 6 }}>
        {/* Título principal */}
        <Typography variant="h3" gutterBottom align="center" sx={{ mb: 4 }}>
          🎯 Resultados de la Evaluación
        </Typography>

        {/* Tarjeta de nivel alcanzado */}
        <Card sx={{ 
          mb: 4, 
          background: levelInfo.gradient,
          color: 'white',
          textAlign: 'center'
        }}>
          <CardContent sx={{ py: 4 }}>
            <Typography variant="h1" sx={{ fontSize: '3rem', mb: 2 }}>
              {levelInfo.icon}
            </Typography>
            <Typography variant="h4" gutterBottom>
              Nivel: {levelInfo.level}
            </Typography>
            <Typography variant="h2" sx={{ mb: 2 }}>
              {percentage}%
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              {levelInfo.description}
            </Typography>
          </CardContent>
        </Card>

        <Divider sx={{ my: 4 }} />

        {/* Estadísticas detalladas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              textAlign: 'center', 
              height: '100%',
              border: '2px solid',
              borderColor: 'success.main'
            }}>
              <CardContent>
                <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography variant="h4" color="success.main">
                  {score.correct}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Correctas
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(score.correct / totalQuestions) * 100}
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              textAlign: 'center', 
              height: '100%',
              border: '2px solid',
              borderColor: 'error.main'
            }}>
              <CardContent>
                <CancelIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
                <Typography variant="h4" color="error.main">
                  {score.incorrect}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Incorrectas
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(score.incorrect / totalQuestions) * 100}
                  color="error"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              textAlign: 'center', 
              height: '100%',
              border: '2px solid',
              borderColor: 'warning.main'
            }}>
              <CardContent>
                <BlockIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                <Typography variant="h4" color="warning.main">
                  {score.blocked}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Bloqueadas
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(score.blocked / totalQuestions) * 100}
                  color="warning"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Análisis de competencias */}
        {competences.length > 0 && (
          <>
            <Divider sx={{ my: 4 }} />
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              📊 Análisis por Competencias
            </Typography>
            <Grid container spacing={2}>
              {competences.map((competence, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {competence.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {competence.correct || 0} de {competence.total || 0} correctas
                        </Typography>
                        <Chip 
                          label={`${((competence.correct || 0) / (competence.total || 1) * 100).toFixed(0)}%`}
                          size="small"
                          color={competence.correct >= competence.total * 0.7 ? 'success' : 'warning'}
                        />
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={((competence.correct || 0) / (competence.total || 1)) * 100}
                        color={competence.correct >= competence.total * 0.7 ? 'success' : 'warning'}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {/* Recomendaciones */}
        <Divider sx={{ my: 4 }} />
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          💡 Recomendaciones
        </Typography>
        
        {percentage >= 80 ? (
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>¡Excelente trabajo!</Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                <ListItemText primary="Mantén tu nivel practicando regularmente" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                <ListItemText primary="Considera compartir tus conocimientos con otros" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                <ListItemText primary="Explora competencias digitales avanzadas" />
              </ListItem>
            </List>
          </Alert>
        ) : percentage >= 60 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>¡Buen trabajo! Puedes mejorar aún más</Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><TrophyIcon color="primary" /></ListItemIcon>
                <ListItemText primary="Practica las áreas donde tuviste dificultades" />
              </ListItem>
              <ListItem>
                <ListItemIcon><TrophyIcon color="primary" /></ListItemIcon>
                <ListItemText primary="Busca recursos adicionales de aprendizaje" />
              </ListItem>
              <ListItem>
                <ListItemIcon><TrophyIcon color="primary" /></ListItemIcon>
                <ListItemText primary="Vuelve a intentar la evaluación en unas semanas" />
              </ListItem>
            </List>
          </Alert>
        ) : (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>¡No te desanimes! Hay mucho potencial de mejora</Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><TrophyIcon color="warning" /></ListItemIcon>
                <ListItemText primary="Dedica tiempo a estudiar las competencias básicas" />
              </ListItem>
              <ListItem>
                <ListItemIcon><TrophyIcon color="warning" /></ListItemIcon>
                <ListItemText primary="Busca cursos o tutoriales sobre competencias digitales" />
              </ListItem>
              <ListItem>
                <ListItemIcon><TrophyIcon color="warning" /></ListItemIcon>
                <ListItemText primary="Practica regularmente con herramientas digitales" />
              </ListItem>
            </List>
          </Alert>
        )}

        {/* Botones de acción */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<HomeIcon />}
            onClick={onHome || (() => navigate('/'))}
            sx={{ minWidth: 150 }}
          >
            Volver al Inicio
          </Button>
          
          <Button
            variant="outlined"
            color="primary"
            size="large"
            startIcon={<RestartAltIcon />}
            onClick={() => setShowConfirmRestart(true)}
            sx={{ minWidth: 150 }}
          >
            Intentar de Nuevo
          </Button>

          {showDetailedResults && questionDetails.length > 0 && (
            <Button
              variant="outlined"
              color="info"
              size="large"
              startIcon={<InfoIcon />}
              onClick={() => setShowDetailDialog(true)}
              sx={{ minWidth: 150 }}
            >
              Ver Detalles
            </Button>
          )}

          <Button
            variant="outlined"
            color="secondary"
            size="large"
            startIcon={<ShareIcon />}
            onClick={handleShare}
            sx={{ minWidth: 150 }}
          >
            Compartir
          </Button>

          <Button
            variant="outlined"
            color="info"
            size="large"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            sx={{ minWidth: 150 }}
          >
            Descargar
          </Button>
        </Box>

        {/* Información de avance */}
        <Box sx={{ mt: 3 }}>
          <Alert severity={advancement.canAdvance ? "success" : "warning"} sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {advancement.canAdvance ? 
                "¡Felicitaciones! Puedes avanzar al siguiente nivel" : 
                "Necesitas mejorar para avanzar al siguiente nivel"
              }
            </Typography>
            <Typography variant="body2">
              Necesitas {advancement.requiredCorrect} respuestas correctas de {totalQuestions} para avanzar.
              {advancement.canAdvance ? 
                ` Has obtenido ${score.correct} correctas.` : 
                ` Has obtenido ${score.correct} correctas, necesitas ${advancement.requiredCorrect - score.correct} más.`
              }
            </Typography>
          </Alert>
        </Box>

        {/* Recomendaciones personalizadas */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Recomendaciones para ti:
          </Typography>
          <List>
            {recommendations.suggestions.map((suggestion, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <TrophyIcon color={recommendations.level === 'Avanzado' ? 'success' : 
                                   recommendations.level === 'Intermedio' ? 'info' : 'warning'} />
                </ListItemIcon>
                <ListItemText primary={suggestion} />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Footer */}
        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'grey.200', textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Evaluación basada en el Marco Europeo de Competencias Digitales (DigComp 2.1)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Fecha: {new Date().toLocaleDateString()} | Total de preguntas: {totalQuestions}
          </Typography>
        </Box>
      </Paper>

      {/* Diálogo de confirmación para reiniciar */}
      <Dialog open={showConfirmRestart} onClose={() => setShowConfirmRestart(false)}>
        <DialogTitle>Confirmar Reinicio</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres reiniciar la evaluación? Se perderán todos los resultados actuales.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmRestart(false)}>Cancelar</Button>
          <Button 
            onClick={() => {
              setShowConfirmRestart(false);
              if (onRestart) {
                onRestart();
              } else {
                window.location.reload();
              }
            }} 
            color="primary"
          >
            Reiniciar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de detalles de preguntas */}
      <Dialog 
        open={showDetailDialog} 
        onClose={() => setShowDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detalles de la Evaluación</DialogTitle>
        <DialogContent>
          {questionDetails.map((question, index) => (
            <Accordion key={index}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {answers[index] === question.correctAnswer ? (
                    <CheckCircleIcon color="success" />
                  ) : answers[index] === null ? (
                    <BlockIcon color="disabled" />
                  ) : (
                    <CancelIcon color="error" />
                  )}
                  <Typography>Pregunta {index + 1}: {question.title}</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  <strong>Escenario:</strong> {question.scenario}
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Tu respuesta:</strong> {
                    answers[index] !== null ? 
                    question.options[answers[index]] : 
                    'No respondida'
                  }
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Respuesta correcta:</strong> {question.options[question.correctAnswer]}
                </Typography>
                {question.feedback && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    {question.feedback.correct || question.feedback.incorrect}
                  </Alert>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EvaluationResults;
