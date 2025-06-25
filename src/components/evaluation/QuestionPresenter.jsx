import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Button,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  LinearProgress,
  Chip,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const QuestionPresenter = ({ 
  question, 
  currentQuestionIndex, 
  totalQuestions, 
  onAnswer, 
  onNext, 
  onPrevious, 
  canGoBack = false,
  selectedAnswer,
  onAnswerChange,
  violations = 0,
  isBlocked = false,
  showValidation = false
}) => {
  const [validationMessage, setValidationMessage] = useState('');

  const handleAnswerSelection = (event) => {
    const answerIndex = Number(event.target.value);
    onAnswerChange(answerIndex);
    setValidationMessage(''); // Limpiar mensaje de validación al seleccionar
  };

  const handleNext = () => {
    if (selectedAnswer === null) {
      setValidationMessage('Por favor, selecciona una respuesta antes de continuar.');
      return;
    }
    
    const isCorrect = selectedAnswer === question.correctAnswer;
    onAnswer(isCorrect);
    onNext();
  };

  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  if (isBlocked) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Esta pregunta ha sido bloqueada por múltiples intentos de hacer trampa.
        </Alert>
        <Typography variant="h6" gutterBottom>
          Pregunta {currentQuestionIndex + 1} de {totalQuestions}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          No puedes responder esta pregunta debido a las violaciones detectadas.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={onNext}
          startIcon={<ArrowForwardIcon />}
        >
          Continuar con la siguiente pregunta
        </Button>
      </Paper>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header con progreso */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Chip 
            label={`Pregunta ${currentQuestionIndex + 1} de ${totalQuestions}`}
            color="primary"
            variant="outlined"
          />
          <Chip 
            label={`${Math.round(progressPercentage)}% Completado`}
            color="secondary"
            variant="outlined"
          />
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progressPercentage}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      {/* Alertas de violaciones */}
      {violations > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Advertencia: {violations} intento(s) de hacer trampa detectado(s). 
          {3 - violations} intento(s) restante(s).
        </Alert>
      )}

      {/* Contenido de la pregunta */}
      <Paper elevation={2} sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Título y escenario */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom color="primary">
            {question.title}
          </Typography>
          
          {question.scenario && (
            <Typography variant="body1" paragraph sx={{ 
              bgcolor: 'grey.50', 
              p: 2, 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200'
            }}>
              {question.scenario}
            </Typography>
          )}
        </Box>

        {/* Opciones de respuesta */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Selecciona la respuesta correcta:
          </Typography>
          
          <RadioGroup
            value={selectedAnswer}
            onChange={handleAnswerSelection}
            sx={{ mt: 2 }}
          >
            {question.options.map((option, index) => (
              <FormControlLabel
                key={index}
                value={index}
                control={<Radio />}
                label={
                  <Typography variant="body1" sx={{ py: 1 }}>
                    {option}
                  </Typography>
                }
                sx={{
                  mb: 1,
                  p: 1,
                  border: '1px solid transparent',
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'grey.50',
                    borderColor: 'grey.300'
                  },
                  ...(selectedAnswer === index && {
                    bgcolor: 'primary.50',
                    borderColor: 'primary.main'
                  })
                }}
              />
            ))}
          </RadioGroup>
        </Box>

        {/* Controles de navegación */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pt: 3,
          mt: 'auto',
          borderTop: '1px solid',
          borderColor: 'grey.200'
        }}>
          <Button
            variant="outlined"
            onClick={onPrevious}
            disabled={!canGoBack || currentQuestionIndex === 0}
            startIcon={<ArrowBackIcon />}
          >
            Anterior
          </Button>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            {validationMessage && (
              <Alert severity="warning" sx={{ mb: 1 }}>
                {validationMessage}
              </Alert>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={selectedAnswer === null}
              endIcon={<ArrowForwardIcon />}
              sx={{ minWidth: 120 }}
            >
              {currentQuestionIndex === totalQuestions - 1 ? 'Finalizar' : 'Siguiente'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default QuestionPresenter;
