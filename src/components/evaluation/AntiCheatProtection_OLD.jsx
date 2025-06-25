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
  Chip
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import BlockIcon from '@mui/icons-material/Block';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import MouseIcon from '@mui/icons-material/Mouse';

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
  const mouseLeaveTimer = useRef(null);

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
      if (mouseLeaveTimer.current) {
        clearTimeout(mouseLeaveTimer.current);
      }
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

      // Ctrl+V (Pegar)
      if (e.ctrlKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        handleViolationDetected('intento de pegar contenido');
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
    const handleMouseMove = (e) => {
      if (!containerRef.current || isBlocked) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const isInside = 
        e.clientX >= rect.left && 
        e.clientX <= rect.right && 
        e.clientY >= rect.top && 
        e.clientY <= rect.bottom;

      if (!isInside && isMouseInside.current) {
        handleViolationDetected('mouse fuera del área de evaluación');
      }
      isMouseInside.current = isInside;
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
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, [isActive, isBlocked]);

  // Función para manejar violaciones detectadas
  const handleViolationDetected = (type) => {
    if (isBlocked) return;

    const newViolations = violations + 1;
    setViolations(newViolations);
    setViolationType(type);
    setShowWarningDialog(true);

    // Llamar callback de violación
    if (onViolation) {
      onViolation(newViolations, type);
    }

    // Bloquear si se alcanza el máximo de violaciones
    if (newViolations >= maxViolations) {
      setIsBlocked(true);
      if (onBlocked) {
        onBlocked(newViolations);
      }
    }
  };

  const handleCloseWarning = () => {
    setShowWarningDialog(false);
  };

  if (isBlocked) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100%',
        p: 4,
        textAlign: 'center'
      }}>
        <WarningIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom color="error">
          Evaluación Bloqueada
        </Typography>
        <Alert severity="error" sx={{ mb: 3, maxWidth: 500 }}>
          Has excedido el número máximo de intentos de hacer trampa ({maxViolations} violaciones).
          Esta pregunta ha sido bloqueada.
        </Alert>
        <Typography variant="body1" color="text.secondary">
          Por favor, mantén las buenas prácticas durante la evaluación.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          height: '100%',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          position: 'relative',
          border: violations > 0 ? '2px solid' : '1px solid',
          borderColor: violations > 0 ? 'warning.main' : 'grey.300',
          borderRadius: 2,
          overflow: 'hidden',
          '&::before': violations > 0 ? {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: '2px dashed',
            borderColor: 'warning.main',
            borderRadius: 2,
            pointerEvents: 'none',
            animation: 'pulse 2s infinite',
            zIndex: 1
          } : {},
          '@keyframes pulse': {
            '0%': { opacity: 0.5 },
            '50%': { opacity: 1 },
            '100%': { opacity: 0.5 },
          },
        }}
      >
        {children}
      </Box>

      {/* Dialog de advertencia */}
      <Dialog
        open={showWarningDialog}
        onClose={handleCloseWarning}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          Advertencia de Seguridad
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Se detectó: {violationType}
          </Alert>
          <Typography variant="body1" paragraph>
            Violación {violations} de {maxViolations}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {violations < maxViolations 
              ? `Te quedan ${maxViolations - violations} intentos antes de que la pregunta sea bloqueada.`
              : 'Esta es tu última advertencia antes del bloqueo.'
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseWarning} color="primary" variant="contained">
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AntiCheatProtection;
