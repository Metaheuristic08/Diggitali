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
  
  // Calcular porcentaje de forma segura
  const percentage = totalQuestions > 0 ? ((score.correct / totalQuestions) * 100).toFixed(1) : 0;

  // Determinar el nivel basado en el porcentaje
  const getLevelInfo = (percentage) => {
    if (percentage >= 67) { // 2 de 3 correctas = 66.7%
      return {
        level: "Básico Superado",
        color: "success",
        description: "¡Excelente! Has superado el nivel básico",
        icon: "🏆",
        gradient: "linear-gradient(135deg, #4CAF50, #45a049)"
      };
    } else {
      return {
        level: "Básico No Superado",
        color: "warning",
        description: "Necesitas mejorar para superar el nivel básico",
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

  const handleRestart = () => {
    setShowConfirmRestart(false);
    if (onRestart) {
      onRestart();
    } else {
      window.location.reload();
    }
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
              {levelInfo.level}
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
                  value={totalQuestions > 0 ? (score.correct / totalQuestions) * 100 : 0}
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
                  value={totalQuestions > 0 ? (score.incorrect / totalQuestions) * 100 : 0}
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
                  {score.blocked || 0}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Bloqueadas
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={totalQuestions > 0 ? ((score.blocked || 0) / totalQuestions) * 100 : 0}
                  color="warning"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recomendaciones */}
        <Divider sx={{ my: 4 }} />
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          💡 Recomendaciones
        </Typography>
        
        {score.correct >= 2 ? (
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>¡Excelente trabajo!</Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                <ListItemText primary="Has superado el nivel básico con 2 o más respuestas correctas" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                <ListItemText primary="Puedes avanzar al siguiente nivel de evaluación" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                <ListItemText primary="Mantén tu nivel practicando regularmente" />
              </ListItem>
            </List>
          </Alert>
        ) : (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>¡No te desanimes! Puedes mejorar</Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><TrophyIcon color="warning" /></ListItemIcon>
                <ListItemText primary="Necesitas al menos 2 respuestas correctas de 3 para superar el nivel básico" />
              </ListItem>
              <ListItem>
                <ListItemIcon><TrophyIcon color="warning" /></ListItemIcon>
                <ListItemText primary="Dedica tiempo a estudiar las competencias básicas" />
              </ListItem>
              <ListItem>
                <ListItemIcon><TrophyIcon color="warning" /></ListItemIcon>
                <ListItemText primary="Vuelve a intentar la evaluación cuando te sientas preparado" />
              </ListItem>
            </List>
          </Alert>
        )}

        {/* Detalles de preguntas */}
        {showDetailedResults && questionDetails.length > 0 && (
          <>
            <Divider sx={{ my: 4 }} />
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              📋 Detalle por Pregunta
            </Typography>
            {questionDetails.map((detail, index) => (
              <Accordion key={index}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    {detail.blocked ? (
                      <BlockIcon color="warning" />
                    ) : detail.correct ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <CancelIcon color="error" />
                    )}
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      Pregunta {index + 1}
                    </Typography>
                    <Chip 
                      label={detail.blocked ? "Bloqueada" : detail.correct ? "Correcta" : "Incorrecta"}
                      color={detail.blocked ? "warning" : detail.correct ? "success" : "error"}
                      size="small"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" paragraph>
                    <strong>Pregunta:</strong> {detail.question}
                  </Typography>
                  {detail.blocked ? (
                    <Typography variant="body2" color="warning.main">
                      Esta pregunta fue bloqueada por violaciones de seguridad.
                    </Typography>
                  ) : (
                    <Typography variant="body2" color={detail.correct ? "success.main" : "error.main"}>
                      Tu respuesta fue {detail.correct ? "correcta" : "incorrecta"}.
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </>
        )}

        {/* Botones de acción */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<HomeIcon />}
            onClick={onHome || (() => navigate('/homepage'))}
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

        {/* Información de criterio de evaluación */}
        <Box sx={{ mt: 4 }}>
          <Alert severity="info">
            <Typography variant="subtitle1" gutterBottom>
              Criterio de Evaluación
            </Typography>
            <Typography variant="body2">
              Para superar el nivel básico necesitas responder correctamente al menos 2 de 3 preguntas (66.7%).
              Este criterio está basado en el Marco Europeo de Competencias Digitales (DigComp 2.1).
            </Typography>
          </Alert>
        </Box>
      </Paper>

      {/* Diálogo de confirmación para reiniciar */}
      <Dialog
        open={showConfirmRestart}
        onClose={() => setShowConfirmRestart(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>¿Reiniciar Evaluación?</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres reiniciar la evaluación? Se perderán todos los resultados actuales.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmRestart(false)}>
            Cancelar
          </Button>
          <Button onClick={handleRestart} variant="contained" color="primary">
            Sí, Reiniciar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EvaluationResults;

