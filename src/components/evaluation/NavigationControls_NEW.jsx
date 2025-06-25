import React from 'react';
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Typography,
  Chip,
  Paper,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import BlockIcon from '@mui/icons-material/Block';

const NavigationControls = ({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onFinish,
  onStepClick,
  canGoBack = false,
  canGoNext = true,
  nextLabel = 'Siguiente',
  previousLabel = 'Anterior',
  showStepper = true,
  showProgress = true,
  stepStatus = [], // Array with status for each step: 'completed', 'current', 'pending', 'error', 'blocked'
  isLoading = false,
  selectedAnswer = null,
  showValidation = false
}) => {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
  const isLastStep = currentStep === totalSteps - 1;

  const getStepIcon = (index) => {
    const status = stepStatus[index] || 'pending';
    
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'current':
        return <PlayArrowIcon color="primary" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'blocked':
        return <BlockIcon color="warning" />;
      default:
        return index + 1;
    }
  };

  const handleNext = () => {
    if (selectedAnswer === null && showValidation) {
      return; // La validación se maneja en el componente padre
    }
    if (isLastStep && onFinish) {
      onFinish();
    } else {
      onNext();
    }
  };

  const getStepColor = (index) => {
    const status = stepStatus[index] || 'pending';
    
    switch (status) {
      case 'completed':
        return 'success';
      case 'current':
        return 'primary';
      case 'error':
        return 'error';
      case 'blocked':
        return 'warning';
      default:
        return 'inherit';
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
      {/* Header con información de progreso */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" color="primary">
            Pregunta {currentStep + 1} de {totalSteps}
          </Typography>
          <Chip 
            label={`${Math.round(progressPercentage)}% Completado`}
            color="secondary"
            size="small"
          />
        </Box>
        
        {/* Resumen de estado */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {stepStatus.filter(status => status === 'completed').length > 0 && (
            <Chip
              icon={<CheckCircleIcon />}
              label={`${stepStatus.filter(status => status === 'completed').length} Correctas`}
              color="success"
              variant="outlined"
              size="small"
            />
          )}
          
          {stepStatus.filter(status => status === 'error').length > 0 && (
            <Chip
              icon={<ErrorIcon />}
              label={`${stepStatus.filter(status => status === 'error').length} Incorrectas`}
              color="error"
              variant="outlined"
              size="small"
            />
          )}
          
          {stepStatus.filter(status => status === 'blocked').length > 0 && (
            <Chip
              icon={<BlockIcon />}
              label={`${stepStatus.filter(status => status === 'blocked').length} Bloqueadas`}
              color="warning"
              variant="outlined"
              size="small"
            />
          )}
        </Box>
      </Box>

      {/* Barra de progreso */}
      {showProgress && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress 
            variant="determinate" 
            value={progressPercentage}
            sx={{ 
              height: 8, 
              borderRadius: 4,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4
              }
            }}
          />
        </Box>
      )}

      {/* Stepper para navegación visual */}
      {showStepper && (
        <Box sx={{ mb: 3 }}>
          <Stepper activeStep={currentStep} alternativeLabel>
            {Array.from({ length: totalSteps }, (_, index) => (
              <Step key={index}>
                <StepLabel
                  icon={getStepIcon(index)}
                  sx={{
                    '& .MuiStepLabel-label': {
                      color: getStepColor(index),
                      fontSize: '0.8rem'
                    }
                  }}
                  onClick={() => onStepClick && onStepClick(index)}
                  style={{ cursor: onStepClick ? 'pointer' : 'default' }}
                >
                  Pregunta {index + 1}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      )}

      {/* Controles de navegación */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pt: 2,
        borderTop: '1px solid',
        borderColor: 'divider'
      }}>
        <Button
          variant="outlined"
          onClick={onPrevious}
          disabled={!canGoBack || currentStep === 0 || isLoading}
          startIcon={<ArrowBackIcon />}
          sx={{ minWidth: 120 }}
        >
          {previousLabel}
        </Button>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {isLastStep ? (
            <Button
              variant="contained"
              color="success"
              onClick={handleNext}
              disabled={!canGoNext || isLoading || (showValidation && selectedAnswer === null)}
              endIcon={<CheckCircleIcon />}
              sx={{ minWidth: 140 }}
            >
              Finalizar Evaluación
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={!canGoNext || isLoading || (showValidation && selectedAnswer === null)}
              endIcon={<ArrowForwardIcon />}
              sx={{ minWidth: 120 }}
            >
              {nextLabel}
            </Button>
          )}
        </Box>
      </Box>

      {/* Mensaje de validación */}
      {showValidation && selectedAnswer === null && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Por favor, selecciona una respuesta antes de continuar.
        </Alert>
      )}
    </Paper>
  );
};

export default NavigationControls;
