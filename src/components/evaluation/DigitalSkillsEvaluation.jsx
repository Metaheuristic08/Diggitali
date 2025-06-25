import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  LinearProgress, 
  Stepper, 
  Step, 
  StepLabel,
  Box,
  Alert,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import TimerIcon from '@mui/icons-material/Timer';
import ProtectedQuestionContainer from './ProtectedQuestionContainer';
import EvaluationSummary from './EvaluationSummary';
import QuestionsService from '../../services/questionsService';

const DigitalSkillsEvaluation = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState({
    correct: 0,
    incorrect: 0,
    blocked: 0
  });
  const [isEvaluationComplete, setIsEvaluationComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isQuestionReady, setIsQuestionReady] = useState(false);
  const [violations, setViolations] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar preguntas desde Firestore
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        // Obtener un mix de preguntas para evaluación (2 por categoría)
        const evaluationQuestions = await QuestionsService.getEvaluationQuestions(2);
        setQuestions(evaluationQuestions);
        setError(null);
      } catch (err) {
        console.error('Error cargando preguntas:', err);
        setError('Error al cargar las preguntas. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  // Efecto para reiniciar el estado cuando el componente se monta
  useEffect(() => {
    setCurrentStep(0);
    setScore({
      correct: 0,
      incorrect: 0,
      blocked: 0
    });
    setIsEvaluationComplete(false);
    setHasStarted(false);
    setIsQuestionReady(false);
    setViolations(0);
  }, []);

  // Efecto para reiniciar el estado de la pregunta cuando cambia
  useEffect(() => {
    setIsQuestionReady(false);
    setViolations(0);
  }, [currentStep]);

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }
    
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
      setIsQuestionReady(false);
    } else {
      setIsEvaluationComplete(true);
    }
  };

  const handleQuestionBlocked = () => {
    setScore(prev => ({ ...prev, blocked: prev.blocked + 1 }));
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
      setIsQuestionReady(false);
    } else {
      setIsEvaluationComplete(true);
    }
  };

  const calculateFinalScore = () => {
    const totalQuestions = questions.length;
    const correctPercentage = (score.correct / totalQuestions) * 100;
    
    if (correctPercentage >= 80) return "Pionero Digital";
    if (correctPercentage >= 60) return "Integrador";
    return "Explorador";
  };

  const handleQuestionReady = () => {
    setIsQuestionReady(true);
  };

  const handleViolation = () => {
    setViolations(prev => prev + 1);
    // Solo avanzar a la siguiente pregunta si se han agotado los intentos
    if (violations >= 2) {
      handleQuestionBlocked();
    }
  };

  // Pantalla de loading
  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5'
      }}>
        <Container maxWidth="md">
          <Paper elevation={3} sx={{ p: 6, textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Cargando Evaluación
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Preparando las preguntas de competencias digitales...
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  // Pantalla de error
  if (error) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5'
      }}>
        <Container maxWidth="md">
          <Paper elevation={3} sx={{ p: 6, textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
            >
              Intentar de Nuevo
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  // Mostrar mensaje si no hay preguntas
  if (questions.length === 0) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5'
      }}>
        <Container maxWidth="md">
          <Paper elevation={3} sx={{ p: 6, textAlign: 'center' }}>
            <Alert severity="warning" sx={{ mb: 3 }}>
              No se encontraron preguntas para la evaluación.
            </Alert>
            <Typography variant="body1">
              Por favor, contacta al administrador del sistema.
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (isEvaluationComplete) {
    return (
      <EvaluationSummary 
        score={score}
        level={calculateFinalScore()}
        totalQuestions={questions.length}
      />
    );
  }

  if (!hasStarted) {
    return (
      <Box sx={{ 
        height: '100vh',
        background: 'linear-gradient(180deg, #E3F2FD 0%, #BBDEFB 100%)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container maxWidth="md" sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          py: 2
        }}>
          <Box sx={{ 
            position: 'absolute', 
            top: -20, 
            left: 20,
            zIndex: 1,
            '& img': {
              height: '120px',
              filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))'
            }
          }}>
            <img src="/img/ladico.png" alt="LADICO Logo" />
          </Box>
          <Paper elevation={3} sx={{ 
            p: 3, 
            mt: 8, 
            position: 'relative', 
            zIndex: 2,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'calc(100vh - 100px)',
            overflow: 'auto'
          }}>
            <Typography variant="h4" gutterBottom align="center">
              Instrucciones de la Evaluación
            </Typography>

            <Alert severity="info" sx={{ my: 3 }}>
              Por favor, lee cuidadosamente las siguientes instrucciones antes de comenzar.
            </Alert>

            <List>
              <ListItem>
                <ListItemIcon>
                  <TimerIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Tiempo" 
                  secondary="No hay límite de tiempo para responder cada pregunta, pero mantén un ritmo constante."
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Respuestas" 
                  secondary="Selecciona la mejor respuesta para cada situación presentada."
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <WarningIcon color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary="Restricciones" 
                  secondary="El área de la pregunta está protegida. Cualquier intento de hacer trampa contará como una violación."
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <BlockIcon color="error" />
                </ListItemIcon>
                <ListItemText 
                  primary="Violaciones" 
                  secondary="Después de 3 violaciones, la pregunta actual será bloqueada y no podrás responderla."
                />
              </ListItem>
            </List>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => setHasStarted(true)}
                sx={{ px: 4, py: 1.5 }}
              >
                Estoy Listo para Comenzar
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#f5f5f5',
      overflow: 'hidden'
    }}>
      <Container maxWidth="lg" sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        py: 4,
        mt: 'auto'
      }}>
        {questions[currentStep] && violations > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Advertencia: {violations} intento(s) de hacer trampa detectado(s). 
            {3 - violations} intento(s) restante(s).
          </Alert>
        )}
        
        <Box sx={{ 
          position: 'absolute', 
          top: -20, 
          left: 20,
          zIndex: 1,
          '& img': {
            height: '120px',
            filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))'
          }
        }}>
          <img src="/img/ladico.png" alt="LADICO Logo" />
        </Box>
        <Paper elevation={3} sx={{ 
          p: 3, 
          mt: 'auto', 
          position: 'relative', 
          zIndex: 2,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <Typography variant="h4" gutterBottom align="center" sx={{ mb: 2 }}>
            Evaluación de Competencias Digitales
          </Typography>
          
          <Stepper activeStep={currentStep} sx={{ mb: 2 }}>
            {questions.map((_, index) => (
              <Step key={index}>
                <StepLabel>Pregunta {index + 1}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <LinearProgress 
            variant="determinate" 
            value={(currentStep / questions.length) * 100} 
            sx={{ mb: 2 }}
          />

          {!isQuestionReady ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              flex: 1,
              gap: 2
            }}>
              <Typography variant="h6" align="center">
                Pregunta {currentStep + 1} de {questions.length}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleQuestionReady}
                sx={{ px: 4, py: 1.5 }}
              >
                Estoy Listo para la Pregunta
              </Button>
            </Box>
          ) : (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                Recuerda: Tienes 3 intentos por pregunta. Cualquier intento de hacer trampa contará como un intento.
              </Alert>
              <Box sx={{ 
                flex: 1, 
                overflow: 'hidden',
                position: 'relative',
                border: '2px dashed',
                borderColor: 'primary.main',
                borderRadius: '4px',
                p: 2
              }}>
                <ProtectedQuestionContainer
                  key={`question-${currentStep}-${hasStarted}`}
                  question={questions[currentStep]}
                  onAnswer={handleAnswer}
                  onBlocked={handleQuestionBlocked}
                  onViolation={handleViolation}
                />
              </Box>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default DigitalSkillsEvaluation;