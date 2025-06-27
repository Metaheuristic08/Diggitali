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
import evaluationController from '../../services/evaluationController';

// Importar estilos
import '../../styles/components/ImprovedEvaluation.css';

const ImprovedDigitalSkillsEvaluation = () => {
    // Estados para el controlador de evaluación
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para la UI
    const [hasStarted, setHasStarted] = useState(false);
    const [isEvaluationComplete, setIsEvaluationComplete] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    // Estados que faltaban y causaban errores no-undef
    const [questions, setQuestions] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [score, setScore] = useState({ correct: 0, incorrect: 0, blocked: 0 });
    const [stepStatus, setStepStatus] = useState([]);

    // Estados para anti-trampa (mantenidos para compatibilidad con componentes existentes)
    const [violations, setViolations] = useState(0);
    const [isQuestionBlocked, setIsQuestionBlocked] = useState(false);
    const [showExitDialog, setShowExitDialog] = useState(false);

    // Inicializar evaluación con el nuevo controlador
    useEffect(() => {
        const initializeEvaluation = async () => {
            try {
                setLoading(true);
                console.log(' Inicializando evaluación con EvaluationController...');

                // Obtener usuario actual (si está logueado)
                const currentUser = null; // TODO: Integrar con auth context
                const userId = currentUser?.uid || null;

                // Inicializar evaluación con dimensiones 1 y 4 (según tasks.md)
                const evaluationData = await evaluationController.startEvaluation(
                    userId,
                    ['1', '4'], // Dimensiones: Información y Seguridad
                    'Básico 1'  // Nivel básico
                );

                console.log('Evaluación inicializada - estructura de una pregunta:', 
                    evaluationData.questions.length > 0 
                        ? JSON.stringify(evaluationData.questions[0], null, 2) 
                        : 'No hay preguntas');

                // Verificar que las preguntas tengan alternativas
                evaluationData.questions = evaluationData.questions.map(question => {
                    if (!question.alternatives || !Array.isArray(question.alternatives) || question.alternatives.length === 0) {
                        console.error('Pregunta sin alternativas válidas:', question);
                        // Agregar alternativas de emergencia si no existen
                        return {
                            ...question,
                            alternatives: question.options || question.answers || [
                                'Alternativa 1 (generada)',
                                'Alternativa 2 (generada)',
                                'Alternativa 3 (generada)',
                                'Alternativa 4 (generada)'
                            ],
                            correctAnswer: question.correctAnswer || 0
                        };
                    }
                    return question;
                });

                // setEvaluation(evaluationData); // Comentado ya que no se usa
                setQuestions(evaluationData.questions); // Establecer las preguntas
                setCurrentQuestion(evaluationData.questions[0]);
                setAnswers(new Array(evaluationData.questions.length).fill(null));
                setStepStatus(new Array(evaluationData.questions.length).fill('pending'));
                setError(null);
                console.log('✅ Evaluación inicializada:', evaluationData);

            } catch (err) {
                console.error('❌ Error inicializando evaluación:', err);
                setError('Error al inicializar la evaluación. Por favor, intenta de nuevo.');
            } finally {
                setLoading(false);
            }
        };

        initializeEvaluation();

        // Cleanup al desmontar
        return () => {
            evaluationController.resetEvaluation();
        };
    }, []);

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
        const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
        handleAnswer(isCorrect);

        // Avanzar a la siguiente pregunta o finalizar
        if (currentStep < questions.length - 1) {
            setCurrentStep(prev => prev + 1);
            setCurrentQuestion(questions[currentStep + 1]);
            setSelectedAnswer(answers[currentStep + 1]); // Cargar respuesta previamente seleccionada
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
            setCurrentQuestion(questions[currentStep - 1]);
            setSelectedAnswer(answers[currentStep - 1]); // Cargar respuesta previamente seleccionada
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
                setCurrentQuestion(questions[currentStep + 1]);
                setSelectedAnswer(answers[currentStep + 1]);
            } else {
                setIsEvaluationComplete(true);
            }
        }, 2000);
    };

    // Calcular nivel final
    const calculateFinalLevel = () => {
        const percentage = (score.correct / questions.length) * 100;
        if (percentage >= 67) { // 2 de 3 = 66.7%
            return "Explorador";
        } else {
            return "Principiante";
        }
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
                    question: q.title || q.question || `Pregunta ${index + 1}`,
                    correct: stepStatus[index] === 'completed',
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
                    selectedAnswer={selectedAnswer}
                />

                {/* Alerta de violación */}
                {violations > 0 && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        <WarningIcon sx={{ mr: 1 }} />
                        ¡Advertencia! Has cambiado de ventana {violations} veces. Alerta de anti-trampa activada.
                    </Alert>
                )}

                {/* Alerta de pregunta bloqueada */}
                {isQuestionBlocked && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        <BlockIcon sx={{ mr: 1 }} />
                        ¡Pregunta bloqueada! Demasiadas violaciones detectadas. Avanzando a la siguiente pregunta...
                    </Alert>
                )}

                {/* Presentador de preguntas */}
                {currentQuestion && (
                    <QuestionPresenter
                        question={currentQuestion}
                        selectedAnswer={selectedAnswer}
                        onAnswerChange={handleAnswerChange}
                        isBlocked={isQuestionBlocked}
                    />
                )}

                {/* Protección anti-trampa */}
                <AntiCheatProtection
                    onViolation={handleViolation}
                    onQuestionBlocked={handleQuestionBlocked}
                    maxViolations={3} // Ejemplo: 3 violaciones antes de bloquear la pregunta
                />

                {/* Diálogo de salida (si aplica) */}
                <Dialog
                    open={showExitDialog}
                    onClose={() => setShowExitDialog(false)}
                    aria-labelledby="exit-dialog-title"
                    aria-describedby="exit-dialog-description"
                >
                    <DialogTitle id="exit-dialog-title">{"¿Estás seguro de que quieres salir?"}</DialogTitle>
                    <DialogContent>
                        <Typography id="exit-dialog-description">
                            Si sales ahora, tu progreso en la evaluación se perderá.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowExitDialog(false)}>Cancelar</Button>
                        <Button onClick={() => {
                            setShowExitDialog(false);
                            // Lógica para salir, por ejemplo, redirigir a la página de inicio
                            // navigate('/homepage');
                        }} autoFocus>Salir</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default ImprovedDigitalSkillsEvaluation;


