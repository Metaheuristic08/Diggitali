import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const EvaluationSummary = ({ score, level, totalQuestions }) => {
  const navigate = useNavigate();
  const percentage = ((score.correct / totalQuestions) * 100).toFixed(1);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Resultados de la Evaluación
        </Typography>

        <Box sx={{ my: 4 }}>
          <Typography variant="h5" gutterBottom align="center" color="primary">
            Nivel Alcanzado: {level}
          </Typography>
          
          <Typography variant="h3" align="center" sx={{ my: 2 }}>
            {percentage}%
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Typography variant="h6" color="success.main">
                Correctas ✅
              </Typography>
              <Typography variant="h4">
                {score.correct}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={4}>
            <Box textAlign="center">
              <Typography variant="h6" color="error.main">
                Incorrectas ❌
              </Typography>
              <Typography variant="h4">
                {score.incorrect}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={4}>
            <Box textAlign="center">
              <Typography variant="h6" color="warning.main">
                Bloqueadas 🔒
              </Typography>
              <Typography variant="h4">
                {score.blocked}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/')}
          >
            Volver al Inicio
          </Button>
          
          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={() => window.location.reload()}
          >
            Intentar de Nuevo
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default EvaluationSummary; 