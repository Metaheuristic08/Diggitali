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

        <Box sx={{ display: 'flex', gap: 1 }}>
          {stepStatus.map((status, index) => (
            <Chip
              key={index}
              label={index + 1}
              size="small"
              color={getStepColor(index)}
              variant={index === currentStep ? 'filled' : 'outlined'}
              sx={{ minWidth: 32 }}
            />
          ))}
        </Box>
      </Box>

      {/* Barra de progreso */}
      {showProgress && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress
            variant="determinate"
            value={progressPercentage}
            sx={{
              height: 10,
              borderRadius: 5,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                background: 'linear-gradient(90deg, #4CAF50 0%, #2196F3 100%)'
              }
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Inicio
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {Math.round(progressPercentage)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Fin
            </Typography>
          </Box>
        </Box>
      )}

      {/* Stepper */}
      {showStepper && totalSteps <= 10 && (
        <Box sx={{ mb: 3 }}>
          <Stepper activeStep={currentStep} alternativeLabel>
            {Array.from({ length: totalSteps }, (_, index) => (
              <Step key={index}>
                <StepLabel
                  StepIconComponent={() => getStepIcon(index)}
                  onClick={() => onStepClick && onStepClick(index)}
                  sx={{
                    cursor: onStepClick ? 'pointer' : 'default',
                    '&:hover': onStepClick ? { opacity: 0.7 } : {}
                  }}
                >
                  {`P${index + 1}`}
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
        borderColor: 'grey.200'
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

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Estadísticas rápidas */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {stepStatus.filter(s => s === 'completed').length > 0 && (
              <Chip
                icon={<CheckCircleIcon />}
                label={stepStatus.filter(s => s === 'completed').length}
                color="success"
                size="small"
              />
            )}
            {stepStatus.filter(s => s === 'error').length > 0 && (
              <Chip
                icon={<ErrorIcon />}
                label={stepStatus.filter(s => s === 'error').length}
                color="error"
                size="small"
              />
            )}
            {stepStatus.filter(s => s === 'blocked').length > 0 && (
              <Chip
                icon={<BlockIcon />}
                label={stepStatus.filter(s => s === 'blocked').length}
                color="warning"
                size="small"
              />
            )}
          </Box>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={onNext}
          disabled={!canGoNext || isLoading}
          endIcon={<ArrowForwardIcon />}
          sx={{ minWidth: 120 }}
        >
          {currentStep === totalSteps - 1 ? 'Finalizar' : nextLabel}
        </Button>
      </Box>

      {/* Información adicional */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          {currentStep < totalSteps - 1
            ? `${totalSteps - currentStep - 1} preguntas restantes`
            : 'Última pregunta'
          }
        </Typography>
      </Box>
    </Paper>
  );
};

export default NavigationControls;
