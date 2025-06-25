import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  doc,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from './firebase.js';
import QuestionsService from './questionsService.js';

/**
 * EvaluationController - Controla el flujo completo de evaluación
 * Implementa la lógica del módulo de control backend según tasks.md
 */
export class EvaluationController {
  
  constructor() {
    this.currentEvaluation = null;
    this.evaluationId = null;
  }

  /**
   * Iniciar una nueva evaluación
   * @param {string} userId - ID del usuario
   * @param {Array} dimensions - Dimensiones a evaluar (ej: ['1', '4'])
   * @param {string} level - Nivel de evaluación (ej: 'Básico 1')
   * @returns {Object} - Objeto de evaluación inicializado
   */
  async startEvaluation(userId = null, dimensions = ['1', '4'], level = 'Básico 1') {
    try {
      console.log('🚀 Iniciando nueva evaluación...');
      
      // Cargar preguntas para la evaluación
      const questions = await this.loadEvaluationQuestions(dimensions, level);
      
      if (questions.length === 0) {
        throw new Error('No se encontraron preguntas para la evaluación');
      }

      // Crear objeto de evaluación
      this.currentEvaluation = {
        id: null,
        userId: userId || 'anonymous',
        dimensions,
        level,
        questions,
        answers: new Array(questions.length).fill(null),
        currentQuestionIndex: 0,
        score: {
          correct: 0,
          incorrect: 0,
          blocked: 0,
          total: questions.length
        },
        status: 'in_progress',
        violations: 0,
        startTime: new Date(),
        endTime: null,
        metadata: {
          userAgent: navigator.userAgent,
          screenResolution: `${screen.width}x${screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };

      // Persistir evaluación inicial en Firebase
      if (userId) {
        this.evaluationId = await this.saveEvaluationToFirebase();
      }

      console.log('✅ Evaluación iniciada:', this.currentEvaluation);
      return this.currentEvaluation;

    } catch (error) {
      console.error('❌ Error iniciando evaluación:', error);
      throw error;
    }
  }

  /**
   * Cargar preguntas para la evaluación
   * Implementa la lógica de selección de preguntas por dimensión y nivel
   */
  async loadEvaluationQuestions(dimensions, level) {
    try {
      console.log(`📚 Cargando preguntas para dimensiones: ${dimensions.join(', ')}, nivel: ${level}`);
      
      // Intentar obtener preguntas específicas para evaluación
      let questions = await QuestionsService.getBasicEvaluationQuestions();
      
      if (questions.length >= 3) {
        // Seleccionar 3 preguntas aleatoriamente
        questions = this.shuffleArray(questions).slice(0, 3);
        console.log('✅ Preguntas básicas obtenidas');
        return questions;
      }

      // Fallback: buscar por dimensiones específicas
      questions = await QuestionsService.getQuestionsByLevelAndDimensions(level, dimensions, 3);
      
      if (questions.length >= 3) {
        console.log('✅ Preguntas por dimensión obtenidas');
        return questions.slice(0, 3);
      }

      // Último fallback: obtener cualquier pregunta disponible
      const allQuestions = await QuestionsService.getEvaluationQuestions(1);
      questions = allQuestions.slice(0, 3);
      
      console.log(`⚠️ Usando fallback: ${questions.length} preguntas`);
      return questions;

    } catch (error) {
      console.error('❌ Error cargando preguntas:', error);
      
      // Fallback final: preguntas hardcodeadas
      return this.getHardcodedQuestions();
    }
  }

  /**
   * Registrar respuesta del usuario
   * @param {number} questionIndex - Índice de la pregunta
   * @param {*} answer - Respuesta seleccionada
   * @returns {Object} - Resultado de la respuesta
   */
  async submitAnswer(questionIndex, answer) {
    if (!this.currentEvaluation) {
      throw new Error('No hay evaluación activa');
    }

    const question = this.currentEvaluation.questions[questionIndex];
    if (!question) {
      throw new Error('Pregunta no encontrada');
    }

    // Evaluar respuesta
    const isCorrect = this.evaluateAnswer(question, answer);
    
    // Registrar respuesta
    this.currentEvaluation.answers[questionIndex] = {
      answer,
      isCorrect,
      timestamp: new Date(),
      timeSpent: null // Se calculará cuando se implemente el timer
    };

    // Actualizar score
    if (isCorrect) {
      this.currentEvaluation.score.correct++;
    } else {
      this.currentEvaluation.score.incorrect++;
    }

    console.log(`📝 Respuesta registrada - Pregunta ${questionIndex + 1}: ${isCorrect ? '✅' : '❌'}`);

    // Actualizar en Firebase si hay evaluación persistida
    if (this.evaluationId) {
      await this.updateEvaluationInFirebase();
    }

    return {
      isCorrect,
      currentScore: this.currentEvaluation.score,
      canAdvance: this.canAdvanceToNext()
    };
  }

  /**
   * Evaluar si una respuesta es correcta
   */
  evaluateAnswer(question, userAnswer) {
    if (question.type === 'multiple_choice') {
      return question.correctAnswer === userAnswer;
    }
    
    if (question.type === 'true_false') {
      return question.correctAnswer === userAnswer;
    }

    // Para otros tipos de pregunta, asumir que viene con índice correcto
    return question.alternatives && 
           question.alternatives[userAnswer] && 
           question.alternatives[userAnswer].isCorrect;
  }

  /**
   * Navegar a la siguiente pregunta
   */
  async navigateNext() {
    if (!this.currentEvaluation) {
      throw new Error('No hay evaluación activa');
    }

    const nextIndex = this.currentEvaluation.currentQuestionIndex + 1;
    
    if (nextIndex >= this.currentEvaluation.questions.length) {
      return await this.completeEvaluation();
    }

    this.currentEvaluation.currentQuestionIndex = nextIndex;
    
    console.log(`➡️ Navegando a pregunta ${nextIndex + 1}`);
    return {
      currentQuestionIndex: nextIndex,
      question: this.currentEvaluation.questions[nextIndex],
      progress: ((nextIndex + 1) / this.currentEvaluation.questions.length) * 100
    };
  }

  /**
   * Navegar a la pregunta anterior
   */
  async navigatePrevious() {
    if (!this.currentEvaluation) {
      throw new Error('No hay evaluación activa');
    }

    const prevIndex = this.currentEvaluation.currentQuestionIndex - 1;
    
    if (prevIndex < 0) {
      return null; // No se puede retroceder más
    }

    this.currentEvaluation.currentQuestionIndex = prevIndex;
    
    console.log(`⬅️ Navegando a pregunta ${prevIndex + 1}`);
    return {
      currentQuestionIndex: prevIndex,
      question: this.currentEvaluation.questions[prevIndex],
      progress: ((prevIndex + 1) / this.currentEvaluation.questions.length) * 100
    };
  }

  /**
   * Verificar si se puede avanzar según la lógica 2/3
   * Implementa: 2 de 3 correctas = avance
   */
  canAdvanceToNext() {
    if (!this.currentEvaluation) return false;

    const { correct, incorrect, total } = this.currentEvaluation.score;
    const answered = correct + incorrect;

    // Si ya tiene 2 correctas, puede avanzar
    if (correct >= 2) return true;

    // Si ha contestado todas y no tiene 2 correctas, no puede avanzar
    if (answered >= total && correct < 2) return false;

    // Mientras no haya contestado todas, puede continuar
    return answered < total;
  }

  /**
   * Registrar violación de anti-trampa
   */
  async recordViolation(type, details = {}) {
    if (!this.currentEvaluation) return;

    this.currentEvaluation.violations++;
    
    const violation = {
      type,
      timestamp: new Date(),
      questionIndex: this.currentEvaluation.currentQuestionIndex,
      details
    };

    if (!this.currentEvaluation.violationHistory) {
      this.currentEvaluation.violationHistory = [];
    }
    
    this.currentEvaluation.violationHistory.push(violation);

    console.log(`⚠️ Violación registrada: ${type}, Total: ${this.currentEvaluation.violations}`);

    // Bloquear pregunta si hay 3 o más violaciones
    if (this.currentEvaluation.violations >= 3) {
      await this.blockCurrentQuestion();
    }

    // Actualizar en Firebase
    if (this.evaluationId) {
      await this.updateEvaluationInFirebase();
    }
  }

  /**
   * Bloquear pregunta actual por violaciones
   */
  async blockCurrentQuestion() {
    if (!this.currentEvaluation) return;

    const currentIndex = this.currentEvaluation.currentQuestionIndex;
    
    // Marcar respuesta como bloqueada
    this.currentEvaluation.answers[currentIndex] = {
      answer: null,
      isCorrect: false,
      blocked: true,
      timestamp: new Date(),
      reason: 'Bloqueada por violaciones de anti-trampa'
    };

    this.currentEvaluation.score.blocked++;
    
    console.log(`🚫 Pregunta ${currentIndex + 1} bloqueada por violaciones`);
  }

  /**
   * Completar evaluación
   */
  async completeEvaluation() {
    if (!this.currentEvaluation) {
      throw new Error('No hay evaluación activa');
    }

    this.currentEvaluation.endTime = new Date();
    this.currentEvaluation.status = 'completed';

    // Calcular estadísticas finales
    const results = this.calculateFinalResults();
    
    console.log('🏁 Evaluación completada:', results);

    // Guardar resultado final en Firebase
    if (this.evaluationId) {
      await this.updateEvaluationInFirebase();
    }

    return results;
  }

  /**
   * Calcular resultados finales
   * Implementa la lógica de nivel alcanzado
   */
  calculateFinalResults() {
    const { correct, incorrect, blocked, total } = this.currentEvaluation.score;
    const percentage = Math.round((correct / total) * 100);
    
    // Determinar nivel alcanzado según criterio 2/3
    let levelAchieved = 'No superado';
    let canAdvance = false;
    
    if (correct >= 2) {
      levelAchieved = 'Básico 1';
      canAdvance = true;
    }

    return {
      evaluationId: this.evaluationId,
      score: this.currentEvaluation.score,
      percentage,
      levelAchieved,
      canAdvance,
      duration: this.currentEvaluation.endTime - this.currentEvaluation.startTime,
      violations: this.currentEvaluation.violations,
      answers: this.currentEvaluation.answers,
      questions: this.currentEvaluation.questions,
      recommendations: this.generateRecommendations(correct, incorrect, blocked)
    };
  }

  /**
   * Generar recomendaciones basadas en el desempeño
   */
  generateRecommendations(correct, incorrect, blocked) {
    const recommendations = [];

    if (correct >= 2) {
      recommendations.push({
        type: 'success',
        message: '¡Excelente! Has demostrado competencias básicas sólidas.',
        action: 'Considera avanzar al siguiente nivel de evaluación.'
      });
    } else {
      recommendations.push({
        type: 'improvement',
        message: 'Es recomendable reforzar conocimientos básicos.',
        action: 'Revisa los materiales de estudio y practica más ejercicios.'
      });
    }

    if (blocked > 0) {
      recommendations.push({
        type: 'warning',
        message: 'Se detectaron violaciones durante la evaluación.',
        action: 'Mantén el foco en la ventana de evaluación para mejores resultados.'
      });
    }

    return recommendations;
  }

  /**
   * Guardar evaluación en Firebase
   */
  async saveEvaluationToFirebase() {
    try {
      const evaluationData = {
        ...this.currentEvaluation,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'evaluations'), evaluationData);
      console.log('💾 Evaluación guardada en Firebase:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('❌ Error guardando evaluación:', error);
      throw error;
    }
  }

  /**
   * Actualizar evaluación en Firebase
   */
  async updateEvaluationInFirebase() {
    if (!this.evaluationId) return;

    try {
      const evaluationRef = doc(db, 'evaluations', this.evaluationId);
      await updateDoc(evaluationRef, {
        ...this.currentEvaluation,
        updatedAt: serverTimestamp()
      });
      
      console.log('🔄 Evaluación actualizada en Firebase');
    } catch (error) {
      console.error('❌ Error actualizando evaluación:', error);
    }
  }

  /**
   * Obtener historial de evaluaciones del usuario
   */
  async getUserEvaluationHistory(userId) {
    try {
      const q = query(
        collection(db, 'evaluations'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const evaluations = [];

      querySnapshot.forEach((doc) => {
        evaluations.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return evaluations;
    } catch (error) {
      console.error('❌ Error obteniendo historial:', error);
      return [];
    }
  }

  /**
   * Exportar resultados en formato JSON
   */
  exportResultsAsJSON() {
    if (!this.currentEvaluation) {
      throw new Error('No hay evaluación activa');
    }

    const exportData = {
      evaluationId: this.evaluationId,
      userId: this.currentEvaluation.userId,
      timestamp: new Date().toISOString(),
      framework: 'DigComp 2.1',
      dimensions: this.currentEvaluation.dimensions,
      level: this.currentEvaluation.level,
      results: this.calculateFinalResults(),
      questions: this.currentEvaluation.questions.map((q, index) => ({
        id: q.id,
        title: q.title,
        dimension: q.dimension,
        userAnswer: this.currentEvaluation.answers[index]?.answer,
        isCorrect: this.currentEvaluation.answers[index]?.isCorrect,
        blocked: this.currentEvaluation.answers[index]?.blocked || false
      })),
      metadata: this.currentEvaluation.metadata,
      duration: this.currentEvaluation.endTime 
        ? Math.round((this.currentEvaluation.endTime - this.currentEvaluation.startTime) / 1000)
        : null
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Exportar resultados en formato CSV
   */
  exportResultsAsCSV() {
    if (!this.currentEvaluation) {
      throw new Error('No hay evaluación activa');
    }

    const results = this.calculateFinalResults();
    const headers = [
      'Pregunta',
      'Dimension',
      'Respuesta Usuario',
      'Correcta',
      'Bloqueada',
      'Tiempo Respuesta'
    ];

    const rows = this.currentEvaluation.questions.map((q, index) => {
      const answer = this.currentEvaluation.answers[index];
      return [
        `"${q.title}"`,
        q.dimension,
        answer?.answer ?? 'Sin responder',
        answer?.isCorrect ? 'Sí' : 'No',
        answer?.blocked ? 'Sí' : 'No',
        answer?.timeSpent ? `${answer.timeSpent}s` : 'N/A'
      ];
    });

    // Agregar fila de resumen
    rows.push(['', '', '', '', '', '']);
    rows.push(['RESUMEN', '', '', '', '', '']);
    rows.push(['Correctas', results.score.correct, '', '', '', '']);
    rows.push(['Incorrectas', results.score.incorrect, '', '', '', '']);
    rows.push(['Bloqueadas', results.score.blocked, '', '', '', '']);
    rows.push(['Porcentaje', `${results.percentage}%`, '', '', '', '']);
    rows.push(['Nivel Alcanzado', results.levelAchieved, '', '', '', '']);

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    return csvContent;
  }

  /**
   * Generar reporte detallado de la evaluación
   */
  generateDetailedReport() {
    if (!this.currentEvaluation) {
      throw new Error('No hay evaluación activa');
    }

    const results = this.calculateFinalResults();
    const duration = this.currentEvaluation.endTime 
      ? Math.round((this.currentEvaluation.endTime - this.currentEvaluation.startTime) / 1000)
      : null;

    return {
      // Información general
      general: {
        evaluationId: this.evaluationId,
        userId: this.currentEvaluation.userId,
        startTime: this.currentEvaluation.startTime,
        endTime: this.currentEvaluation.endTime,
        duration: duration,
        framework: 'Marco Europeo DigComp 2.1',
        dimensions: this.currentEvaluation.dimensions,
        level: this.currentEvaluation.level
      },

      // Resultados
      results: results,

      // Análisis por pregunta
      questionAnalysis: this.currentEvaluation.questions.map((q, index) => {
        const answer = this.currentEvaluation.answers[index];
        return {
          questionNumber: index + 1,
          title: q.title,
          dimension: q.dimension,
          category: q.categoryCode,
          userAnswer: answer?.answer,
          correctAnswer: q.correctAnswer,
          isCorrect: answer?.isCorrect,
          blocked: answer?.blocked || false,
          timeSpent: answer?.timeSpent
        };
      }),

      // Análisis por dimensión
      dimensionAnalysis: this.analyzeDimensions(),

      // Recomendaciones
      recommendations: this.generateRecommendations(),

      // Metadata técnica
      metadata: this.currentEvaluation.metadata
    };
  }

  /**
   * Analizar resultados por dimensión
   */
  analyzeDimensions() {
    const dimensionStats = {};

    this.currentEvaluation.questions.forEach((q, index) => {
      const dimension = q.dimension;
      const answer = this.currentEvaluation.answers[index];

      if (!dimensionStats[dimension]) {
        dimensionStats[dimension] = {
          total: 0,
          correct: 0,
          incorrect: 0,
          blocked: 0
        };
      }

      dimensionStats[dimension].total++;
      
      if (answer?.blocked) {
        dimensionStats[dimension].blocked++;
      } else if (answer?.isCorrect) {
        dimensionStats[dimension].correct++;
      } else {
        dimensionStats[dimension].incorrect++;
      }
    });

    // Calcular porcentajes
    Object.keys(dimensionStats).forEach(dimension => {
      const stats = dimensionStats[dimension];
      stats.percentage = Math.round((stats.correct / stats.total) * 100);
    });

    return dimensionStats;
  }

  /**
   * Generar recomendaciones personalizadas
   */
  generateRecommendations() {
    const results = this.calculateFinalResults();
    const dimensionAnalysis = this.analyzeDimensions();
    const recommendations = [];

    // Recomendaciones generales basadas en el resultado
    if (results.percentage >= 80) {
      recommendations.push({
        type: 'general',
        level: 'success',
        message: 'Excelente nivel de competencias digitales. Considera explorar niveles más avanzados.',
        actions: [
          'Evalúa el nivel intermedio',
          'Mantente actualizado con las tendencias digitales',
          'Comparte tu conocimiento con otros'
        ]
      });
    } else if (results.percentage >= 60) {
      recommendations.push({
        type: 'general',
        level: 'warning',
        message: 'Buen nivel básico, pero hay áreas de mejora identificadas.',
        actions: [
          'Refuerza las áreas con menor puntuación',
          'Practica con recursos adicionales',
          'Considera tomar cursos específicos'
        ]
      });
    } else {
      recommendations.push({
        type: 'general',
        level: 'error',
        message: 'Se recomienda fortalecer los conocimientos básicos antes de avanzar.',
        actions: [
          'Estudia los fundamentos de competencias digitales',
          'Practica con ejercicios básicos',
          'Busca recursos educativos especializados'
        ]
      });
    }

    // Recomendaciones específicas por dimensión
    Object.entries(dimensionAnalysis).forEach(([dimension, stats]) => {
      if (stats.percentage < 50) {
        const dimensionNames = {
          '1': 'Información y Alfabetización Informacional',
          '2': 'Comunicación y Colaboración',
          '3': 'Creación de Contenidos Digitales',
          '4': 'Seguridad',
          '5': 'Resolución de Problemas'
        };

        recommendations.push({
          type: 'dimension',
          level: 'warning',
          dimension: dimension,
          dimensionName: dimensionNames[dimension] || `Dimensión ${dimension}`,
          message: `Área de mejora prioritaria en ${dimensionNames[dimension]}`,
          actions: this.getDimensionSpecificActions(dimension)
        });
      }
    });

    return recommendations;
  }

  /**
   * Obtener acciones específicas por dimensión
   */
  getDimensionSpecificActions(dimension) {
    const actions = {
      '1': [
        'Practica técnicas de búsqueda avanzada',
        'Aprende a evaluar la credibilidad de fuentes',
        'Desarrolla habilidades de gestión de información'
      ],
      '2': [
        'Mejora tus habilidades de comunicación digital',
        'Aprende sobre colaboración en línea',
        'Desarrolla competencias de participación ciudadana'
      ],
      '3': [
        'Practica la creación de contenidos digitales',
        'Aprende sobre derechos de autor y licencias',
        'Desarrolla habilidades de edición digital'
      ],
      '4': [
        'Refuerza conocimientos sobre seguridad digital',
        'Aprende sobre protección de datos personales',
        'Practica buenas prácticas de ciberseguridad'
      ],
      '5': [
        'Desarrolla habilidades de resolución de problemas técnicos',
        'Aprende a identificar necesidades tecnológicas',
        'Practica la innovación con tecnología digital'
      ]
    };

    return actions[dimension] || ['Estudia más sobre esta área de competencia'];
  }

  /**
   * Utilidades
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Preguntas hardcodeadas como último recurso
   */
  getHardcodedQuestions() {
    return [
      {
        id: 'hardcoded-1',
        questionText: '¿Cuál es la función principal de un navegador web?',
        alternatives: [
          { text: 'Editar documentos', isCorrect: false },
          { text: 'Navegar por internet', isCorrect: true },
          { text: 'Enviar emails', isCorrect: false },
          { text: 'Reproducir música', isCorrect: false }
        ],
        type: 'multiple_choice',
        correctAnswer: 1,
        competence: '1.1',
        dimension: '1',
        level: 'Básico 1'
      },
      {
        id: 'hardcoded-2',
        questionText: '¿Qué significa HTTPS en una dirección web?',
        alternatives: [
          { text: 'HyperText Transfer Protocol Secure', isCorrect: true },
          { text: 'Home Text Transfer Protocol System', isCorrect: false },
          { text: 'High Tech Transfer Protocol Safe', isCorrect: false },
          { text: 'Hyper Transfer Text Protocol Server', isCorrect: false }
        ],
        type: 'multiple_choice',
        correctAnswer: 0,
        competence: '4.1',
        dimension: '4',
        level: 'Básico 1'
      },
      {
        id: 'hardcoded-3',
        questionText: '¿Es seguro usar contraseñas simples como "123456"?',
        alternatives: [
          { text: 'Verdadero', isCorrect: false },
          { text: 'Falso', isCorrect: true }
        ],
        type: 'true_false',
        correctAnswer: 1,
        competence: '4.2',
        dimension: '4',
        level: 'Básico 1'
      }
    ];
  }

  /**
   * Obtener estado actual de la evaluación
   */
  getCurrentEvaluation() {
    return this.currentEvaluation;
  }

  /**
   * Resetear evaluación
   */
  resetEvaluation() {
    this.currentEvaluation = null;
    this.evaluationId = null;
    console.log('🔄 Evaluación reseteada');
  }
}

// Exportar instancia singleton
const evaluationController = new EvaluationController();
export default evaluationController;
