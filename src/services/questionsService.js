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
      const stats = {
        totalCategories: categories.length,
        totalQuestions: 0,
        questionsByCategory: {},
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
        });
      }
      
      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
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
}

export default QuestionsService;
