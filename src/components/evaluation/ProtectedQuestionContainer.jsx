import React, { useState, useEffect, useRef } from 'react';
import {
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';

const ProtectedQuestionContainer = ({ question, onAnswer, onBlocked, onViolation }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [violations, setViolations] = useState(-1);
  const [isBlocked, setIsBlocked] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepResults, setStepResults] = useState([]);
  const containerRef = useRef(null);
  const isMouseInside = useRef(true);

  // Efecto para reiniciar el contador cuando cambia la pregunta
  useEffect(() => {
    setViolations(-1);
    setIsBlocked(false);
    isMouseInside.current = true;
  }, [question.id]);

  // Efecto para manejar el bloqueo después de 3 violaciones
  useEffect(() => {
    if (violations >= 2) { // -1 + 3 = 2
      setIsBlocked(true);
      onBlocked?.();
    }
  }, [violations, onBlocked]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current || isBlocked) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const isInside = 
        e.clientX >= rect.left && 
        e.clientX <= rect.right && 
        e.clientY >= rect.top && 
        e.clientY <= rect.bottom;

      if (!isInside && isMouseInside.current) {
        setViolations(prev => prev + 1);
        if (onViolation) onViolation();
      }
      isMouseInside.current = isInside;
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isBlocked, onViolation]);

  const handleInteractiveStep = (selectedOption) => {
    if (isBlocked) return;
    
    const currentStepData = question.steps[currentStep];
    const isCorrect = selectedOption.toLowerCase() === currentStepData.correctAction.toLowerCase();
    
    if (isCorrect) {
      setStepResults([...stepResults, { step: currentStep, correct: true }]);
      
      if (currentStep < question.steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        onAnswer(true);
      }
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    const isCorrect = selectedAnswer === question.correctAnswer;
    onAnswer(isCorrect);
  };

  if (isBlocked) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100%',
        gap: 2
      }}>
        <Alert severity="error" sx={{ width: '100%' }}>
          Esta pregunta ha sido bloqueada por múltiples intentos de hacer trampa.
        </Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={() => onAnswer(false)}
        >
          Continuar con la siguiente pregunta
        </Button>
      </Box>
    );
  }

  if (question.type === "interactive") {
    return (
      <Paper
        ref={containerRef}
        elevation={2}
        sx={{
          p: 3,
          position: 'relative',
          border: '3px solid',
          borderColor: violations > 0 ? 'warning.main' : 'primary.main',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          height: '100%',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {violations > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Advertencia: {violations + 1} intento(s) de hacer trampa detectado(s). 
            {2 - violations} intento(s) restante(s).
          </Alert>
        )}
        
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          gap: 2
        }}>
          <Typography variant="h6" gutterBottom>
            {question.title}
          </Typography>

          <Typography variant="body1" paragraph>
            {question.scenario}
          </Typography>

          <Box sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}>
            <Typography variant="subtitle1" color="primary">
              Paso {currentStep + 1} de {question.steps.length}
            </Typography>

            <Typography variant="body1">
              {question.steps[currentStep].description}
            </Typography>

            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 1
            }}>
              {question.steps[currentStep].options.map((option, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  fullWidth
                  onClick={() => handleInteractiveStep(option)}
                  sx={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    py: 1.5,
                    px: 2,
                    whiteSpace: 'normal',
                    height: 'auto'
                  }}
                >
                  {option}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      ref={containerRef}
      elevation={2}
      sx={{
        p: 3,
        position: 'relative',
        border: '3px solid',
        borderColor: violations > 0 ? 'warning.main' : 'primary.main',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        height: '100%',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -5,
          left: -5,
          right: -5,
          bottom: -5,
          border: '2px dashed',
          borderColor: 'primary.main',
          borderRadius: '4px',
          pointerEvents: 'none',
          animation: 'pulse 2s infinite',
        },
        '@keyframes pulse': {
          '0%': { opacity: 0.5 },
          '50%': { opacity: 1 },
          '100%': { opacity: 0.5 },
        },
      }}
    >
      {violations > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Advertencia: {violations} intento(s) de hacer trampa detectado(s). 
          {3 - violations} intento(s) restante(s).
        </Alert>
      )}

      <Typography variant="h6" gutterBottom>
        {question.title}
      </Typography>

      <Typography variant="body1" paragraph>
        {question.scenario}
      </Typography>

      <RadioGroup
        value={selectedAnswer}
        onChange={(e) => setSelectedAnswer(Number(e.target.value))}
      >
        {question.options.map((option, index) => (
          <FormControlLabel
            key={index}
            value={index}
            control={<Radio />}
            label={option}
          />
        ))}
      </RadioGroup>

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={selectedAnswer === null}
        sx={{ 
          mt: 'auto',
          minWidth: '200px',
          alignSelf: 'flex-end'
        }}
      >
        Confirmar Respuesta
      </Button>
    </Paper>
  );
};

export default ProtectedQuestionContainer; 