import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  getDoc,
  limit 
} from 'firebase/firestore';
import { db } from './firebase.js';

// Servicio para manejo de preguntas desde Firestore
export class QuestionsService {
  
  // Obtener todas las categorías ordenadas
  static async getCategories() {
    try {
      const q = query(
        collection(db, 'categories'),
        orderBy('order', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const categories = [];
      
      querySnapshot.forEach((doc) => {
        categories.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return categories;
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      throw error;
    }
  }
  
  // Obtener preguntas por categoría
  static async getQuestionsByCategory(categoryCode, limitCount = null) {
    try {
      let q = query(
        collection(db, 'questions'),
        where('categoryCode', '==', categoryCode),
        where('isActive', '==', true),
        orderBy('order', 'asc')
      );
      
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(q);
      const questions = [];
      
      querySnapshot.forEach((doc) => {
        questions.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return questions;
    } catch (error) {
      console.error(`Error obteniendo preguntas de categoría ${categoryCode}:`, error);
      throw error;
    }
  }
  
  // Obtener preguntas por competencia específica
  static async getQuestionsByCompetence(competence, limitCount = 5) {
    try {
      const q = query(
        collection(db, 'questions'),
        where('competence', '==', competence),
        where('isActive', '==', true),
        orderBy('order', 'asc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const questions = [];
      
      querySnapshot.forEach((doc) => {
        questions.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return questions;
    } catch (error) {
      console.error(`Error obteniendo preguntas de competencia ${competence}:`, error);
      throw error;
    }
  }
  
  // Obtener preguntas por nivel
  static async getQuestionsByLevel(level, limitCount = 10) {
    try {
      const q = query(
        collection(db, 'questions'),
        where('level', '==', level),
        where('isActive', '==', true),
        orderBy('categoryCode', 'asc'),
        orderBy('order', 'asc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const questions = [];
      
      querySnapshot.forEach((doc) => {
        questions.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return questions;
    } catch (error) {
      console.error(`Error obteniendo preguntas de nivel ${level}:`, error);
      throw error;
    }
  }
  
  // Obtener un mix de preguntas para evaluación completa
  static async getEvaluationQuestions(questionsPerCategory = 2) {
    try {
      const categories = await this.getCategories();
      const allQuestions = [];
      
      for (const category of categories) {
        const questions = await this.getQuestionsByCategory(
          category.code, 
          questionsPerCategory
        );
        allQuestions.push(...questions);
      }
      
      // Mezclar las preguntas para que no siempre aparezcan en el mismo orden
      return this.shuffleArray(allQuestions);
    } catch (error) {
      console.error('Error obteniendo preguntas de evaluación:', error);
      throw error;
    }
  }
  
  // Obtener una pregunta específica por ID
  static async getQuestionById(questionId) {
    try {
      const docRef = doc(db, 'questions', questionId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        throw new Error(`Pregunta con ID ${questionId} no encontrada`);
      }
    } catch (error) {
      console.error(`Error obteniendo pregunta ${questionId}:`, error);
      throw error;
    }
  }
    // Obtener estadísticas de preguntas
  static async getQuestionsStats() {
    try {
      const categories = await this.getCategories();
      const competences = await this.getCompetences();
      const stats = {
        totalCategories: categories.length,
        totalCompetences: competences.length,
        totalQuestions: 0,
        questionsByCategory: {},
        questionsByCompetence: {},
        questionsByLevel: {},
        questionsByType: {}
      };
      
      // Contar preguntas por categoría
      for (const category of categories) {
        const questions = await this.getQuestionsByCategory(category.code);
        stats.questionsByCategory[category.name] = questions.length;
        stats.totalQuestions += questions.length;
        
        // Contar por nivel y tipo
        questions.forEach(question => {
          // Por nivel
          stats.questionsByLevel[question.level] = 
            (stats.questionsByLevel[question.level] || 0) + 1;
          
          // Por tipo
          stats.questionsByType[question.type] = 
            (stats.questionsByType[question.type] || 0) + 1;
          
          // Por competencia
          if (question.competence) {
            stats.questionsByCompetence[question.competence] = 
              (stats.questionsByCompetence[question.competence] || 0) + 1;
          }
        });
      }
      
      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
  
  // Obtener todas las competencias ordenadas
  static async getCompetences() {
    try {
      const q = query(
        collection(db, 'competences'),
        orderBy('code', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const competences = [];
      
      querySnapshot.forEach((doc) => {
        competences.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return competences;
    } catch (error) {
      console.error('Error obteniendo competencias:', error);
      throw error;
    }
  }

  // Obtener competencias por categoría
  static async getCompetencesByCategory(categoryCode) {
    try {
      const q = query(
        collection(db, 'competences'),
        where('category', '==', categoryCode),
        orderBy('code', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const competences = [];
      
      querySnapshot.forEach((doc) => {
        competences.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return competences;
    } catch (error) {
      console.error(`Error obteniendo competencias de categoría ${categoryCode}:`, error);
      throw error;
    }
  }

  // Obtener una competencia específica
  static async getCompetenceById(competenceCode) {
    try {
      const docRef = doc(db, 'competences', competenceCode);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        throw new Error(`Competencia con código ${competenceCode} no encontrada`);
      }
    } catch (error) {
      console.error(`Error obteniendo competencia ${competenceCode}:`, error);
      throw error;
    }
  }

  // Función auxiliar para mezclar array
  static shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  // Validar respuesta de pregunta
  static validateAnswer(question, answerIndex, userAction = null) {
    if (question.type === 'multiple-choice') {
      return answerIndex === question.correctAnswerIndex;
    } else if (question.type === 'interactive') {
      // Para preguntas interactivas, validar la acción del usuario
      return userAction === question.correctAction;
    }
    return false;
  }
  
  // Obtener feedback para una respuesta
  static getFeedback(question, isCorrect) {
    if (question.feedback) {
      return isCorrect ? question.feedback.correct : question.feedback.incorrect;
    }
    return isCorrect ? '¡Correcto!' : 'Respuesta incorrecta.';
  }

  // MÉTODOS ESPECÍFICOS PARA LAS TAREAS - DIMENSIONES 1 Y 4

  // Obtener preguntas específicas de la Dimensión 1: Información y alfabetización informacional
  static async getDimension1Questions(limitCount = 3) {
    try {
      // Competencias 1.1, 1.2, 1.3
      const competences = ['1.1', '1.2', '1.3'];
      const allQuestions = [];
      
      for (const competence of competences) {
        const questions = await this.getQuestionsByCompetence(competence, 1);
        allQuestions.push(...questions);
      }
      
      // Filtrar por nivel básico y mezclar
      const basicQuestions = allQuestions.filter(q => 
        q.level && (q.level.includes('Básico') || q.level.includes('básico'))
      );
      
      const shuffledQuestions = this.shuffleArray(basicQuestions);
      return shuffledQuestions.slice(0, limitCount);
    } catch (error) {
      console.error('Error obteniendo preguntas de Dimensión 1:', error);
      throw error;
    }
  }

  // Obtener preguntas específicas de la Dimensión 4: Seguridad
  static async getDimension4Questions(limitCount = 3) {
    try {
      // Competencias 4.1, 4.2, 4.3, 4.4
      const competences = ['4.1', '4.2', '4.3', '4.4'];
      const allQuestions = [];
      
      for (const competence of competences) {
        const questions = await this.getQuestionsByCompetence(competence, 1);
        allQuestions.push(...questions);
      }
      
      // Filtrar por nivel básico y mezclar
      const basicQuestions = allQuestions.filter(q => 
        q.level && (q.level.includes('Básico') || q.level.includes('básico'))
      );
      
      const shuffledQuestions = this.shuffleArray(basicQuestions);
      return shuffledQuestions.slice(0, limitCount);
    } catch (error) {
      console.error('Error obteniendo preguntas de Dimensión 4:', error);
      throw error;
    }
  }

  // Obtener preguntas para evaluación básica (3 preguntas total)
  static async getBasicEvaluationQuestions() {
    try {
      // Intentar primero con consultas complejas
      try {
        const dimension1Questions = await this.getQuestionsByDimensionAndLevel('1', 'Básico 1', 2);
        const dimension4Questions = await this.getQuestionsByDimensionAndLevel('4', 'Básico 1', 1);
        
        const allQuestions = [...dimension1Questions, ...dimension4Questions];
        
        if (allQuestions.length >= 3) {
          const selectedQuestions = this.shuffleArray(allQuestions.slice(0, 3));
          // Randomizar alternativas de cada pregunta
          return this.randomizeEvaluationQuestions(selectedQuestions);
        }
      } catch (complexError) {
        console.warn('Consultas complejas fallaron, usando método de respaldo:', complexError.message);
      }
      
      // Si fallan las consultas complejas, usar método de emergencia
      const emergencyQuestions = await this.getEmergencyBasicEvaluation();
      // Randomizar alternativas de las preguntas de emergencia
      return this.randomizeEvaluationQuestions(emergencyQuestions);
      
    } catch (error) {
      console.error('Error obteniendo preguntas de evaluación básica:', error);
      throw error;
    }
  }

  // Obtener preguntas por dimensión y nivel
  static async getQuestionsByDimensionAndLevel(dimension, level, limitCount = 5) {
    try {
      const q = query(
        collection(db, 'questions'),
        where('dimension', '==', dimension),
        where('level', '==', level),
        where('isActive', '==', true),
        orderBy('order', 'asc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const questions = [];
      
      querySnapshot.forEach((doc) => {
        questions.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return questions;
    } catch (error) {
      console.error(`Error obteniendo preguntas de dimensión ${dimension} nivel ${level}:`, error);
      throw error;
    }
  }

  // Obtener preguntas por nivel y múltiples dimensiones
  static async getQuestionsByLevelAndDimensions(level, dimensions, limitCount = 10) {
    try {
      // Intentar consulta compleja primero
      try {
        const allQuestions = [];
        
        for (const dimension of dimensions) {
          const questions = await this.getQuestionsByDimensionAndLevel(
            dimension.toString(), 
            level, 
            Math.ceil(limitCount / dimensions.length)
          );
          allQuestions.push(...questions);
        }
        
        if (allQuestions.length > 0) {
          const shuffledQuestions = this.shuffleArray(allQuestions);
          return shuffledQuestions.slice(0, limitCount);
        }
      } catch (complexError) {
        console.warn('Consulta compleja falló, usando respaldo:', complexError.message);
      }
      
      // Si falla, usar método de emergencia
      return await this.getEmergencyBasicEvaluation();
      
    } catch (error) {
      console.error(`Error obteniendo preguntas de nivel ${level} y dimensiones ${dimensions}:`, error);
      throw error;
    }
  }

  // Evaluar si el usuario puede avanzar de nivel (lógica 2/3 correctas)
  static evaluateAdvancement(correctAnswers, totalQuestions) {
    const requiredCorrect = Math.ceil(totalQuestions * 0.67); // 67% = 2 de 3
    return {
      canAdvance: correctAnswers >= requiredCorrect,
      requiredCorrect,
      percentage: (correctAnswers / totalQuestions) * 100
    };
  }

  // Obtener recomendaciones basadas en el rendimiento
  static getRecommendations(score, totalQuestions) {
    const percentage = (score.correct / totalQuestions) * 100;
    
    const recommendations = {
      level: percentage >= 80 ? 'Avanzado' : percentage >= 60 ? 'Intermedio' : 'Básico',
      suggestions: []
    };

    if (percentage >= 80) {
      recommendations.suggestions = [
        'Excelente dominio de las competencias evaluadas',
        'Considera explorar competencias de nivel avanzado',
        'Comparte tus conocimientos con otros usuarios'
      ];
    } else if (percentage >= 60) {
      recommendations.suggestions = [
        'Buen nivel de competencias digitales',
        'Practica las áreas donde tuviste dificultades',
        'Considera tomar cursos complementarios'
      ];
    } else {
      recommendations.suggestions = [
        'Es recomendable reforzar los conocimientos básicos',
        'Dedica tiempo a estudiar las competencias evaluadas',
        'Busca recursos educativos adicionales'
      ];
    }

    return recommendations;
  }

  // MÉTODOS DE RESPALDO SIN ÍNDICES COMPUESTOS
  // Usar mientras se crean los índices en Firestore
  
  // Obtener preguntas simples sin orderBy compuesto
  static async getSimpleQuestionsByCategory(categoryCode, limitCount = null) {
    try {
      let q = query(
        collection(db, 'questions'),
        where('categoryCode', '==', categoryCode),
        limit(limitCount || 10)
      );
      
      const querySnapshot = await getDocs(q);
      const questions = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.isActive !== false) { // Filtrar manualmente si es necesario
          questions.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      return questions;
    } catch (error) {
      console.error('Error en consulta simple por categoría:', error);
      throw error;
    }
  }

  // Obtener todas las preguntas activas (sin orderBy)
  static async getAllActiveQuestions() {
    try {
      const q = query(
        collection(db, 'questions'),
        where('isActive', '==', true),
        limit(50) // Limitar para evitar mucha data
      );
      
      const querySnapshot = await getDocs(q);
      const questions = [];
      
      querySnapshot.forEach((doc) => {
        questions.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return questions;
    } catch (error) {
      console.error('Error obteniendo todas las preguntas activas:', error);
      throw error;
    }
  }

  // Evaluación básica de emergencia con consultas simples
  static async getEmergencyBasicEvaluation() {
    try {
      console.log('🚨 Usando evaluación de emergencia debido a índices en construcción...');
      
      // Obtener preguntas activas y filtrar localmente
      const allQuestions = await this.getAllActiveQuestions();
      
      if (allQuestions.length === 0) {
        console.warn('⚠️ No se encontraron preguntas en Firestore, usando preguntas de prueba');
        return this.getTestQuestions();
      }
      
      // Filtrar por nivel básico si existe el campo
      const basicQuestions = allQuestions.filter(q => 
        q.level && (
          q.level.toLowerCase().includes('básico') ||
          q.level.toLowerCase().includes('basico') ||
          q.level.includes('1') ||
          q.level.toLowerCase().includes('basic')
        )
      );
      
      // Si no hay preguntas básicas, usar las primeras 3
      const selectedQuestions = basicQuestions.length >= 3 
        ? basicQuestions.slice(0, 3)
        : allQuestions.slice(0, 3);
      
      // Si aún no hay suficientes, usar preguntas de prueba
      if (selectedQuestions.length < 3) {
        console.warn('⚠️ Pocas preguntas disponibles, completando con preguntas de prueba');
        const testQuestions = this.getTestQuestions();
        return testQuestions.slice(0, 3);
      }
      
      return this.shuffleArray(selectedQuestions);
    } catch (error) {
      console.error('❌ Error en evaluación de emergencia, usando preguntas de prueba:', error);
      return this.getTestQuestions();
    }
  }

  // Preguntas de prueba como último recurso
  static getTestQuestions() {
    const questions = [
      {
        id: 'test-1',
        title: '¿Cuál es la mejor práctica para crear una contraseña segura?',
        question: '¿Cuál es la mejor práctica para crear una contraseña segura?',
        alternatives: [
          'Usar solo números',
          'Combinar letras, números y símbolos',
          'Usar solo el nombre',
          'Usar fechas importantes'
        ],
        correctAnswer: 1,
        categoryCode: 'SEC',
        level: 'Básico 1',
        dimension: '4',
        isActive: true,
        order: 1,
        type: 'multiple_choice'
      },
      {
        id: 'test-2',
        title: '¿Qué es una fuente confiable de información en internet?',
        question: '¿Qué es una fuente confiable de información en internet?',
        alternatives: [
          'Cualquier página web',
          'Solo redes sociales',
          'Sitios web oficiales y académicos',
          'Blogs personales únicamente'
        ],
        correctAnswer: 2,
        categoryCode: 'INF',
        level: 'Básico 1',
        dimension: '1',
        isActive: true,
        order: 1,
        type: 'multiple_choice'
      },
      {
        id: 'test-3',
        title: '¿Cuál es una buena práctica al descargar archivos de internet?',
        question: '¿Cuál es una buena práctica al descargar archivos de internet?',
        alternatives: [
          'Descargar de cualquier sitio',
          'Verificar la fuente y usar antivirus',
          'Descargar solo archivos grandes',
          'No verificar nunca'
        ],
        correctAnswer: 1,
        categoryCode: 'SEC',
        level: 'Básico 1',
        dimension: '4',
        isActive: true,
        order: 2,
        type: 'multiple_choice'
      }
    ];

    // Randomizar alternativas para las preguntas de prueba también
    return this.randomizeEvaluationQuestions(questions);
  }

  // Randomizar alternativas de una pregunta
  static randomizeQuestionAlternatives(question) {
    if (!question.alternatives || !Array.isArray(question.alternatives)) {
      return question;
    }

    // Crear copia de la pregunta para no mutar el original
    const randomizedQuestion = JSON.parse(JSON.stringify(question));
    
    // Guardar la respuesta correcta original
    const originalCorrectAnswer = question.correctAnswer;
    const originalCorrectText = question.alternatives[originalCorrectAnswer];
    
    // Crear array de alternativas con sus índices originales
    const alternativesWithIndex = question.alternatives.map((alt, index) => ({
      text: alt,
      originalIndex: index
    }));
    
    // Mezclar las alternativas
    const shuffledAlternatives = this.shuffleArray(alternativesWithIndex);
    
    // Actualizar las alternativas y encontrar el nuevo índice de la respuesta correcta
    randomizedQuestion.alternatives = shuffledAlternatives.map(alt => alt.text);
    randomizedQuestion.correctAnswer = shuffledAlternatives.findIndex(
      alt => alt.originalIndex === originalCorrectAnswer
    );
    
    // Agregar metadata sobre la randomización
    randomizedQuestion._randomized = true;
    randomizedQuestion._originalOrder = question.alternatives;
    randomizedQuestion._originalCorrectAnswer = originalCorrectAnswer;
    
    console.log(`🔀 Alternativas randomizadas para pregunta: ${question.title}`);
    console.log(`   Respuesta correcta movida de índice ${originalCorrectAnswer} a ${randomizedQuestion.correctAnswer}`);
    
    return randomizedQuestion;
  }

  // Randomizar todas las preguntas de una evaluación
  static randomizeEvaluationQuestions(questions) {
    return questions.map(question => this.randomizeQuestionAlternatives(question));
  }
}

export default QuestionsService;
