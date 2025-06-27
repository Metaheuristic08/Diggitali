import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Alert
} from '@mui/material';

const QuestionPresenter = ({ 
  question, 
  selectedAnswer,
  onAnswerChange,
  isBlocked = false
}) => {
  const [validationMessage, setValidationMessage] = useState('');

  const handleAnswerSelection = (event) => {
    const answerIndex = Number(event.target.value);
    onAnswerChange(answerIndex);
    setValidationMessage(''); // Limpiar mensaje de validación al seleccionar
  };

  if (!question) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Cargando pregunta...
        </Typography>
      </Paper>
    );
  }

  if (isBlocked) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Esta pregunta ha sido bloqueada por múltiples intentos de hacer trampa.
        </Alert>
        <Typography variant="h6" gutterBottom>
          Pregunta bloqueada
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          No puedes responder esta pregunta debido a las violaciones detectadas.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Contenido de la pregunta */}
      <Paper elevation={2} sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Información de la pregunta */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip 
              label={question.dimension || 'Competencia Digital'}
              color="primary"
              variant="outlined"
              size="small"
            />
            <Chip 
              label={question.level || 'Básico'}
              color="secondary"
              variant="outlined"
              size="small"
            />
          </Box>
          
          {question.competence && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {question.competence}
            </Typography>
          )}
        </Box>

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
            value={selectedAnswer !== null ? selectedAnswer : ''}
            onChange={handleAnswerSelection}
            sx={{ mt: 2 }}
          >
            {question.alternatives && question.alternatives.map((alternative, index) => (
              <FormControlLabel
                key={index}
                value={index}
                control={<Radio />}
                label={
                  <Typography variant="body1" sx={{ py: 1 }}>
                    {typeof alternative === 'string' ? alternative : alternative.text || alternative}
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

        {/* Mensaje de validación */}
        {validationMessage && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {validationMessage}
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default QuestionPresenter;

