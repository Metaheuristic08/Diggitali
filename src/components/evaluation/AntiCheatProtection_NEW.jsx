import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Alert,
  Box,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import BlockIcon from '@mui/icons-material/Block';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import MouseIcon from '@mui/icons-material/Mouse';
import KeyboardIcon from '@mui/icons-material/Keyboard';

const AntiCheatProtection = ({ 
  children, 
  onViolation, 
  onBlocked, 
  isActive = true,
  maxViolations = 3,
  questionId = null,
  resetTrigger = 0 // Para reiniciar el estado cuando cambia la pregunta
}) => {
  const [violations, setViolations] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [violationType, setViolationType] = useState('');
  const [violationHistory, setViolationHistory] = useState([]);
  const containerRef = useRef(null);
  const isMouseInside = useRef(true);
  const isTabActive = useRef(true);

  // Reiniciar estado cuando cambia la pregunta
  useEffect(() => {
    if (resetTrigger > 0) {
      setViolations(0);
      setIsBlocked(false);
      setShowWarningDialog(false);
      setViolationType('');
      setViolationHistory([]);
      isMouseInside.current = true;
      isTabActive.current = true;
    }
  }, [resetTrigger, questionId]);

  // Función para manejar violaciones detectadas
  const handleViolationDetected = useCallback((type) => {
    if (!isActive || isBlocked) return;

    const newViolationCount = violations + 1;
    const timestamp = new Date().toLocaleTimeString();
    
    setViolations(newViolationCount);
    setViolationType(type);
    setViolationHistory(prev => [...prev, { type, timestamp }]);
    setShowWarningDialog(true);

    // Notificar al componente padre
    if (onViolation) {
      onViolation(newViolationCount, type);
    }

    // Bloquear después del máximo de violaciones
    if (newViolationCount >= maxViolations) {
      setIsBlocked(true);
      if (onBlocked) {
        onBlocked();
      }
    }
  }, [violations, isActive, isBlocked, maxViolations, onViolation, onBlocked]);

  // Efecto para detectar cambios de pestaña/ventana
  useEffect(() => {
    if (!isActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isTabActive.current = false;
        handleViolationDetected('cambio de pestaña');
      } else {
        isTabActive.current = true;
      }
    };

    const handleFocus = () => {
      isTabActive.current = true;
    };

    const handleBlur = () => {
      isTabActive.current = false;
      handleViolationDetected('cambio de ventana');
    };

    // Detectar teclas de acceso directo comunes para hacer trampa
    const handleKeyDown = (e) => {
      // F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        handleViolationDetected('intento de abrir herramientas de desarrollador');
        return;
      }

      // Ctrl+Shift+I/C/J (DevTools)
      if (e.ctrlKey && e.shiftKey && ['I', 'C', 'J'].includes(e.key.toUpperCase())) {
        e.preventDefault();
        handleViolationDetected('intento de abrir herramientas de desarrollador');
        return;
      }

      // Ctrl+U (Ver código fuente)
      if (e.ctrlKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        handleViolationDetected('intento de ver código fuente');
        return;
      }

      // Ctrl+A (Seleccionar todo)
      if (e.ctrlKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleViolationDetected('intento de seleccionar todo el contenido');
        return;
      }

      // Ctrl+C (Copiar)
      if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleViolationDetected('intento de copiar contenido');
        return;
      }

      // Alt+Tab (Cambiar aplicación)
      if (e.altKey && e.key === 'Tab') {
        handleViolationDetected('intento de cambiar aplicación');
        return;
      }
    };

    // Detectar clic derecho
    const handleContextMenu = (e) => {
      e.preventDefault();
      handleViolationDetected('intento de abrir menú contextual');
    };

    // Detectar movimiento del mouse fuera del área
    const handleMouseLeave = () => {
      if (isMouseInside.current) {
        isMouseInside.current = false;
        handleViolationDetected('mouse fuera del área de evaluación');
      }
    };

    const handleMouseEnter = () => {
      isMouseInside.current = true;
    };

    // Detectar selección de texto
    const handleSelectStart = (e) => {
      e.preventDefault();
      handleViolationDetected('intento de seleccionar texto');
    };

    // Detectar arrastrar y soltar
    const handleDragStart = (e) => {
      e.preventDefault();
      handleViolationDetected('intento de arrastrar contenido');
    };

    // Agregar event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);

    // Event listeners para el contenedor específico
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mouseleave', handleMouseLeave);
      container.addEventListener('mouseenter', handleMouseEnter);
    }

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
      
      if (container) {
        container.removeEventListener('mouseleave', handleMouseLeave);
        container.removeEventListener('mouseenter', handleMouseEnter);
      }
    };
  }, [isActive, handleViolationDetected]);

  // Función para cerrar el diálogo de advertencia
  const handleCloseWarning = () => {
    setShowWarningDialog(false);
  };

  // Función para continuar después de la advertencia
  const handleContinue = () => {
    setShowWarningDialog(false);
  };

  // Función para obtener el icono según el tipo de violación
  const getViolationIcon = (type) => {
    if (type.includes('pestaña') || type.includes('ventana')) {
      return <VisibilityOffIcon />;
    }
    if (type.includes('mouse')) {
      return <MouseIcon />;
    }
    if (type.includes('tecla') || type.includes('desarrollador')) {
      return <KeyboardIcon />;
    }
    return <WarningIcon />;
  };

  // Si está bloqueado, mostrar mensaje de bloqueo
  if (isBlocked) {
    return (
      <Box
        ref={containerRef}
        sx={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'error.light',
          border: '3px solid',
          borderColor: 'error.main',
          borderRadius: 2,
          p: 4
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <BlockIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" color="error" gutterBottom>
            Pregunta Bloqueada
          </Typography>
          <Typography variant="body1" color="error.dark" paragraph>
            Esta pregunta ha sido bloqueada debido a múltiples intentos de hacer trampa.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Violaciones detectadas: {violations} de {maxViolations}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box
        ref={containerRef}
        sx={{
          position: 'relative',
          height: '100%',
          border: violations > 0 ? '3px solid' : '2px solid',
          borderColor: violations > 0 ? 'warning.main' : 'primary.main',
          borderRadius: 2,
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          '&::before': violations > 0 ? {
            content: '""',
            position: 'absolute',
            top: -3,
            left: -3,
            right: -3,
            bottom: -3,
            border: '2px dashed',
            borderColor: 'warning.main',
            borderRadius: 2,
            pointerEvents: 'none',
            animation: 'pulse 2s infinite'
          } : {},
          '@keyframes pulse': {
            '0%': { opacity: 0.5 },
            '50%': { opacity: 1 },
            '100%': { opacity: 0.5 }
          }
        }}
      >
        {/* Indicador de violaciones */}
        {violations > 0 && (
          <Box sx={{ 
            position: 'absolute', 
            top: -10, 
            right: -10, 
            zIndex: 1000 
          }}>
            <Chip
              icon={<WarningIcon />}
              label={`${violations}/${maxViolations} violaciones`}
              color="warning"
              size="small"
            />
          </Box>
        )}

        {children}
      </Box>

      {/* Diálogo de advertencia */}
      <Dialog
        open={showWarningDialog}
        onClose={handleCloseWarning}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          bgcolor: 'warning.light',
          color: 'warning.contrastText'
        }}>
          <WarningIcon />
          Advertencia de Seguridad
        </DialogTitle>
        
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Se ha detectado un intento de hacer trampa: <strong>{violationType}</strong>
          </Alert>

          <Typography variant="body1" paragraph>
            Violación {violations} de {maxViolations} permitidas.
          </Typography>

          <Typography variant="body2" color="text.secondary" paragraph>
            Si continúas intentando hacer trampa, esta pregunta será bloqueada y no podrás responderla.
          </Typography>

          {/* Progreso de violaciones */}
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Intentos restantes: {maxViolations - violations}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(violations / maxViolations) * 100}
              color="warning"
              sx={{ mt: 1 }}
            />
          </Box>

          {/* Historial de violaciones */}
          {violationHistory.length > 1 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Historial de violaciones:
              </Typography>
              <List dense>
                {violationHistory.slice(-3).map((violation, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      {getViolationIcon(violation.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={violation.type}
                      secondary={violation.timestamp}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleContinue}
            variant="contained"
            color="primary"
            fullWidth
          >
            He entendido, continuar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AntiCheatProtection;
