import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Alert,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import TimerIcon from '@mui/icons-material/Timer';
import InfoIcon from '@mui/icons-material/Info';

// Importar los nuevos componentes
import QuestionPresenter from './QuestionPresenter';
import AntiCheatProtection from './AntiCheatProtection';
import NavigationControls from './NavigationControls';
import EvaluationResults from './EvaluationResults';
import QuestionsService from '../../services/questionsService';

// Importar estilos
import '../../styles/components/ImprovedEvaluation.css';

const ImprovedDigitalSkillsEvaluation = () => {
    // Estados principales
    const [currentStep, setCurrentStep] = useState(0);
    const [score, setScore] = useState({
        correct: 0,
        incorrect: 0,
        blocked: 0
    });
    const [answers, setAnswers] = useState([]); // Respuestas del usuario
    const [isEvaluationComplete, setIsEvaluationComplete] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para anti-trampa
    const [violations, setViolations] = useState(0);
    const [isQuestionBlocked, setIsQuestionBlocked] = useState(false);
    const [showExitDialog, setShowExitDialog] = useState(false);

    // Estados para navegación
    const [stepStatus, setStepStatus] = useState([]);
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    // Cargar preguntas desde Firestore
    useEffect(() => {
        const loadQuestions = async () => {
            try {
                setLoading(true);
                console.log('🔄 Iniciando carga de preguntas...');

                // Obtener preguntas específicas de las dimensiones 1 y 4 (según las tareas)
                // Usar el nuevo método específico para evaluación básica
                const evaluationQuestions = await QuestionsService.getBasicEvaluationQuestions();
                console.log('✅ Preguntas obtenidas:', evaluationQuestions.length);

                // Si no hay suficientes preguntas, usar método alternativo
                if (evaluationQuestions.length < 3) {
                    console.log('⚠️ Pocas preguntas, intentando método alternativo...');
                    const alternativeQuestions = await QuestionsService.getQuestionsByLevelAndDimensions(
                        'Básico 1',
                        ['1', '4'],
                        3
                    );
                    setQuestions(alternativeQuestions);
                    console.log('📋 Preguntas alternativas:', alternativeQuestions.length);
                } else {
                    setQuestions(evaluationQuestions);
                }

                setStepStatus(new Array(evaluationQuestions.length).fill('pending'));
                setAnswers(new Array(evaluationQuestions.length).fill(null));
                setError(null);
                console.log('✅ Evaluación configurada correctamente');
            } catch (err) {
                console.error('❌ Error cargando preguntas:', err);
                setError('Error al cargar las preguntas. Por favor, intenta de nuevo.');

                // Fallback: usar método original si fallan los nuevos métodos
                try {
                    console.log('🔄 Intentando método de fallback...');
                    const fallbackQuestions = await QuestionsService.getEvaluationQuestions(1);
                    const limitedQuestions = fallbackQuestions.slice(0, 3);
                    setQuestions(limitedQuestions);
                    setStepStatus(new Array(limitedQuestions.length).fill('pending'));
                    setAnswers(new Array(limitedQuestions.length).fill(null));
                    console.log('✅ Fallback exitoso:', limitedQuestions.length, 'preguntas');
                } catch (fallbackErr) {
                    console.error('❌ Error en fallback:', fallbackErr);
                }
            } finally {
                setLoading(false);
            }
        };

        loadQuestions();
    }, []);

    // Reiniciar estados cuando el componente se monta
    useEffect(() => {
        setCurrentStep(0);
        setScore({ correct: 0, incorrect: 0, blocked: 0 });
        setIsEvaluationComplete(false);
        setHasStarted(false);
        setViolations(0);
        setIsQuestionBlocked(false);
    }, []);

    // Reiniciar estado de pregunta cuando cambia
    useEffect(() => {
        setSelectedAnswer(answers[currentStep] || null);
        setViolations(0);
        setIsQuestionBlocked(false);
    }, [currentStep, answers]);

    // Manejar respuesta
    const handleAnswer = (isCorrect) => {
        const newAnswers = [...answers];
        newAnswers[currentStep] = selectedAnswer;
        setAnswers(newAnswers);

        const newScore = { ...score };
        const newStepStatus = [...stepStatus];

        if (isCorrect) {
            newScore.correct += 1;
            newStepStatus[currentStep] = 'completed';
        } else {
            newScore.incorrect += 1;
            newStepStatus[currentStep] = 'error';
        }

        setScore(newScore);
        setStepStatus(newStepStatus);
    };

    // Manejar siguiente pregunta
    const handleNext = () => {
        if (selectedAnswer === null) return;

        // Evaluar la respuesta
        const isCorrect = selectedAnswer === questions[currentStep].correctAnswer;
        handleAnswer(isCorrect);

        // Avanzar a la siguiente pregunta o finalizar
        if (currentStep < questions.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Usar la nueva lógica de evaluación de avance
            const advancement = QuestionsService.evaluateAdvancement(score.correct + (isCorrect ? 1 : 0), questions.length);

            console.log('Evaluación de avance:', advancement);
            setIsEvaluationComplete(true);
        }
    };

    // Manejar pregunta anterior
    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    // Manejar cambio de respuesta
    const handleAnswerChange = (answerIndex) => {
        setSelectedAnswer(answerIndex);
    };

    // Manejar violación de anti-trampa
    const handleViolation = (violationCount, type) => {
        setViolations(violationCount);
        console.log(`Violación detectada: ${type} (${violationCount})`);
    };

    // Manejar bloqueo de pregunta
    const handleQuestionBlocked = () => {
        setIsQuestionBlocked(true);
        const newScore = { ...score };
        newScore.blocked += 1;
        setScore(newScore);

        const newStepStatus = [...stepStatus];
        newStepStatus[currentStep] = 'blocked';
        setStepStatus(newStepStatus);

        // Avanzar automáticamente a la siguiente pregunta
        setTimeout(() => {
            if (currentStep < questions.length - 1) {
                setCurrentStep(prev => prev + 1);
            } else {
                setIsEvaluationComplete(true);
            }
        }, 2000);
    };

    // Calcular nivel final
    const calculateFinalLevel = () => {
        const recommendations = QuestionsService.getRecommendations(score, questions.length);
        return recommendations.level;
    };

    // Manejar finalización
    const handleFinish = () => {
        const advancement = QuestionsService.evaluateAdvancement(score.correct, questions.length);
        console.log('Evaluación finalizada:', advancement);
        setIsEvaluationComplete(true);
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

    // Pantalla de resultados
    if (isEvaluationComplete) {
        return (
            <EvaluationResults
                score={score}
                level={calculateFinalLevel()}
                totalQuestions={questions.length}
                questionDetails={questions.map((q, index) => ({
                    question: q.title,
                    correct: answers[index] === q.correctAnswer,
                    blocked: stepStatus[index] === 'blocked'
                }))}
                competences={[]} // TODO: Agregar análisis por competencias
            />
        );
    }

    // Pantalla de instrucciones
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
                            📚 Instrucciones de la Evaluación
                        </Typography>

                        <Alert severity="info" sx={{ my: 3 }}>
                            <InfoIcon sx={{ mr: 1 }} />
                            Por favor, lee cuidadosamente las siguientes instrucciones antes de comenzar.
                        </Alert>

                        <List>
                            <ListItem>
                                <ListItemIcon>
                                    <TimerIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Tiempo"
                                    secondary="No hay límite de tiempo, pero mantén un ritmo constante."
                                />
                            </ListItem>

                            <ListItem>
                                <ListItemIcon>
                                    <CheckCircleIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Respuestas"
                                    secondary="Selecciona la mejor respuesta para cada pregunta. Necesitas 2 de 3 correctas para avanzar de nivel."
                                />
                            </ListItem>

                            <ListItem>
                                <ListItemIcon>
                                    <WarningIcon color="warning" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Restricciones"
                                    secondary="La evaluación incluye protección anti-trampa. Mantén el foco en la ventana de evaluación."
                                />
                            </ListItem>

                            <ListItem>
                                <ListItemIcon>
                                    <BlockIcon color="error" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Violaciones"
                                    secondary="Después de 3 violaciones, la pregunta será bloqueada automáticamente."
                                />
                            </ListItem>
                        </List>

                        <Alert severity="warning" sx={{ my: 3 }}>
                            <Typography variant="body2">
                                <strong>Importante:</strong> Esta evaluación se basa en el Marco Europeo de Competencias Digitales (DigComp 2.1).
                                Se evaluarán competencias de las dimensiones de Información y Seguridad.
                            </Typography>
                        </Alert>

                        <Box sx={{ mt: 4, textAlign: 'center' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                onClick={() => setHasStarted(true)}
                                sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
                            >
                                🚀 Estoy Listo para Comenzar
                            </Button>
                        </Box>
                    </Paper>
                </Container>
            </Box>
        );
    }

    // Pantalla principal de evaluación
    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#f5f5f5'
        }}>
            <Container maxWidth="lg" sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                py: 2
            }}>
                {/* Logo */}
                <Box sx={{
                    position: 'absolute',
                    top: 10,
                    left: 20,
                    zIndex: 10,
                    '& img': {
                        height: '80px',
                        filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))'
                    }
                }}>
                    <img src="/img/ladico.png" alt="LADICO Logo" />
                </Box>

                {/* Título */}
                <Typography variant="h4" gutterBottom align="center" sx={{ mt: 6, mb: 2 }}>
                    🎯 Evaluación de Competencias Digitales
                </Typography>

                {/* Controles de navegación */}
                <NavigationControls
                    currentStep={currentStep}
                    totalSteps={questions.length}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    onFinish={handleFinish}
                    canGoBack={true}
                    canGoNext={selectedAnswer !== null && !isQuestionBlocked}
                    stepStatus={stepStatus}
                    showStepper={true}
                    showProgress={true}
                    selectedAnswer={selectedAnswer}
                    showValidation={true}
                />

                {/* Área protegida con la pregunta */}
                <Box sx={{ flex: 1, minHeight: 400 }}>
                    <AntiCheatProtection
                        onViolation={handleViolation}
                        onBlocked={handleQuestionBlocked}
                        isActive={hasStarted && !isEvaluationComplete}
                        maxViolations={3}
                        questionId={questions[currentStep]?.id}
                        resetTrigger={currentStep}
                    >
                        <QuestionPresenter
                            question={questions[currentStep]}
                            currentQuestionIndex={currentStep}
                            totalQuestions={questions.length}
                            onAnswer={handleAnswer}
                            onNext={handleNext}
                            onPrevious={handlePrevious}
                            canGoBack={true}
                            selectedAnswer={selectedAnswer}
                            onAnswerChange={handleAnswerChange}
                            violations={violations}
                            isBlocked={isQuestionBlocked}
                            showValidation={true}
                        />
                    </AntiCheatProtection>
                </Box>

                {/* Diálogo de confirmación para salir */}
                <Dialog
                    open={showExitDialog}
                    onClose={() => setShowExitDialog(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Confirmar Salida</DialogTitle>
                    <DialogContent>
                        <Typography>
                            ¿Estás seguro de que quieres salir de la evaluación? Se perderá todo el progreso actual.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowExitDialog(false)}>Cancelar</Button>
                        <Button
                            onClick={() => {
                                setShowExitDialog(false);
                                // Redirigir o resetear
                                window.location.href = '/';
                            }}
                            color="error"
                        >
                            Salir
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default ImprovedDigitalSkillsEvaluation;
