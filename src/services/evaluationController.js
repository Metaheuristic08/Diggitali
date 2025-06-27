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
import { db } from './firebase.js'; // Eliminado 'auth' ya que no se usa directamente aquí
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
          // Acceder a window.screen de forma segura para evitar errores en entornos no-browser
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
          screenResolution: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'N/A',
          timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'N/A'
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
      } else {
        // Fallback: buscar por dimensiones específicas
        questions = await QuestionsService.getQuestionsByLevelAndDimensions(level, dimensions, 3);

        if (questions.length >= 3) {
          console.log('✅ Preguntas por dimensión obtenidas');
          questions = questions.slice(0, 3);
        } else {
          // Último fallback: obtener cualquier pregunta disponible
          const allQuestions = await QuestionsService.getEvaluationQuestions(1);
          questions = allQuestions.slice(0, 3);
          console.log(`⚠️ Usando fallback: ${questions.length} preguntas`);
        }
      }
      
      // Verificar y corregir formato de las preguntas
      questions = questions.map(question => {
        // Agregar propiedad 'alternatives' si no existe o está vacía
        if (!question.alternatives || !Array.isArray(question.alternatives) || question.alternatives.length === 0) {
          console.warn(`⚠️ Pregunta sin alternativas: ${question.id || 'Sin ID'}`);
          
          // Intentar obtener alternativas de otros campos como options o answers
          const altCandidates = question.options || question.answers || [];
          
          if (altCandidates.length > 0) {
            question.alternatives = [...altCandidates];
            console.log(`✅ Alternativas recuperadas de campo alternativo: ${altCandidates.length} opciones`);
          } else {
            // Si no hay alternativas, crear unas predeterminadas
            question.alternatives = [
              'Alternativa 1',
              'Alternativa 2',
              'Alternativa 3',
              'Alternativa 4'
            ];
            question.correctAnswer = 0; // Establecer la primera como correcta por defecto
            console.log(`⚠️ Agregadas alternativas generadas para pregunta: ${question.id || 'Sin ID'}`);
          }
        }
        
        // Verificar que correctAnswer sea un número válido
        if (question.correctAnswer === undefined || 
            question.correctAnswer === null || 
            isNaN(question.correctAnswer) ||
            question.correctAnswer < 0 || 
            question.correctAnswer >= question.alternatives.length) {
          console.warn(`⚠️ correctAnswer inválido en pregunta ${question.id || 'Sin ID'}, usando 0 como predeterminado`);
          question.correctAnswer = 0;
        }
        
        return question;
      });
      
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
      recommendations: this._generateRecommendations(correct, incorrect, blocked) // Renombrado para evitar duplicidad
    };
  }

  /**
   * Generar recomendaciones basadas en el desempeño
   */
  _generateRecommendations(correct, incorrect, blocked) { // Renombrado
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

    let report = `--- Reporte de Evaluación ---\n\n`;
    report += `ID de Evaluación: ${this.evaluationId || 'N/A'}\n`;
    report += `Usuario: ${this.currentEvaluation.userId}\n`;
    report += `Dimensiones Evaluadas: ${this.currentEvaluation.dimensions.join(', ')}\n`;
    report += `Nivel: ${this.currentEvaluation.level}\n`;
    report += `Estado: ${this.currentEvaluation.status}\n`;
    report += `Duración: ${duration ? `${duration} segundos` : 'N/A'}\n`;
    report += `Violaciones Detectadas: ${this.currentEvaluation.violations}\n\n`;

    report += `--- Resultados ---\n`;
    report += `Preguntas Correctas: ${results.score.correct}\n`;
    report += `Preguntas Incorrectas: ${results.score.incorrect}\n`;
    report += `Preguntas Bloqueadas: ${results.score.blocked}\n`;
    report += `Total de Preguntas: ${results.score.total}\n`;
    report += `Porcentaje de Acierto: ${results.percentage}%\n`;
    report += `Nivel Alcanzado: ${results.levelAchieved}\n\n`;

    report += `--- Recomendaciones ---\n`;
    results.recommendations.forEach(rec => {
      report += `- [${rec.type.toUpperCase()}] ${rec.message} ${rec.action}\n`;
    });
    report += `\n`;

    report += `--- Detalles por Pregunta ---\n`;
    this.currentEvaluation.questions.forEach((q, index) => {
      const answer = this.currentEvaluation.answers[index];
      report += `\nPregunta ${index + 1}: ${q.title}\n`;
      report += `  Dimensión: ${q.dimension}\n`;
      report += `  Competencia: ${q.competence}\n`;
      report += `  Nivel: ${q.level}\n`;
      report += `  Respuesta Correcta: ${q.alternatives[q.correctAnswer]}\n`;
      report += `  Respuesta del Usuario: ${answer?.answer !== undefined ? q.alternatives[answer.answer] : 'Sin responder'}\n`;
      report += `  Estado: ${answer?.blocked ? 'Bloqueada' : (answer?.isCorrect ? 'Correcta' : 'Incorrecta')}\n`;
      report += `  Tiempo de Respuesta: ${answer?.timeSpent ? `${answer.timeSpent}s` : 'N/A'}\n`;
    });

    return report;
  }

  /**
   * Reiniciar la evaluación actual
   */
  resetEvaluation() {
    this.currentEvaluation = null;
    this.evaluationId = null;
    console.log('🔄 Evaluación reiniciada.');
  }

  /**
   * Helper para mezclar arrays (Fisher-Yates)
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Preguntas hardcodeadas para fallback
   */
  getHardcodedQuestions() {
    console.warn('Usando preguntas hardcodeadas como fallback.');
    return [
      {
        id: 'q_hardcoded_1',
        title: '¿Cuál de las siguientes opciones es un ejemplo de información personal que debe protegerse en línea?',
        dimension: 'Seguridad',
        competence: '4.2. Proteger los datos personales y privacidad.',
        level: 'Básico',
        type: 'multiple_choice',
        alternatives: [
          'El nombre de tu mascota',
          'Tu dirección de correo electrónico',
          'El color de tu coche',
          'Tu comida favorita'
        ],
        correctAnswer: 1,
      },
      {
        id: 'q_hardcoded_2',
        title: '¿Qué es una contraseña segura?',
        dimension: 'Seguridad',
        competence: '4.1. Proteger los dispositivos.',
        level: 'Básico',
        type: 'multiple_choice',
        alternatives: [
          'Tu fecha de nacimiento',
          'Una combinación de letras, números y símbolos',
          'La palabra "contraseña"',
          'El nombre de tu ciudad'
        ],
        correctAnswer: 1,
      },
      {
        id: 'q_hardcoded_3',
        title: '¿Es seguro abrir correos electrónicos de remitentes desconocidos?',
        dimension: 'Seguridad',
        competence: '4.2. Proteger los datos personales y privacidad.',
        level: 'Básico',
        type: 'true_false',
        alternatives: [
          'Verdadero',
          'Falso'
        ],
        correctAnswer: 1,
      },
    ];
  }
}

const evaluationController = new EvaluationController();
export default evaluationController;


