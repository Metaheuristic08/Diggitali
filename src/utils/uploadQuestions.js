import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración de Firebase Admin
const firebaseConfig = {
  apiKey: "AIzaSyCOFq_3nQaLr84G9OdvH1TNZYexvrqfwhw",
  authDomain: "ludico-backend.firebaseapp.com",
  projectId: "ludico-backend",
  storageBucket: "ludico-backend.firebasestorage.app",
  messagingSenderId: "663116086194",
  appId: "1:663116086194:web:ebb51b7246f147a25d82ab",
  measurementId: "G-2WE2ZG3FF8"
};

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const db = admin.firestore();

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapeo de archivos a categorías con orden específico
const categoryMapping = {
  'BÚSQUEDA Y GESTIÓN DE INFORMACIÓN Y DATOS.json': {
    name: 'Búsqueda y Gestión de Información y Datos',
    code: 'BGID',
    order: 1,
    competences: ['1.1', '1.2', '1.3']
  },
  'COMUNICACIÓN Y COLABORACIÓN.json': {
    name: 'Comunicación y Colaboración',
    code: 'CC',
    order: 2,
    competences: ['2.1', '2.2', '2.3', '2.4', '2.5', '2.6']
  },
  'CREACIÓN DE CONTENIDOS DIGITALES.json': {
    name: 'Creación de Contenidos Digitales',
    code: 'CCD',
    order: 3,
    competences: ['3.1', '3.2', '3.3', '3.4']
  },
  'RESOLUCIÓN DE PROBLEMAS.json': {
    name: 'Resolución de Problemas',
    code: 'RP',
    order: 4,
    competences: ['5.1', '5.2', '5.3', '5.4']
  },
  'seguridad.json': {
    name: 'Seguridad',
    code: 'SEG',
    order: 5,
    competences: ['4.1', '4.2', '4.3', '4.4']
  }
};

// Función para limpiar colecciones existentes
async function clearCollections() {
  console.log('🧹 Limpiando colecciones existentes...');
  
  try {
    // Limpiar colección de categorías
    const categoriesSnapshot = await db.collection('categories').get();
    const deletePromises = [];
    
    categoriesSnapshot.forEach((doc) => {
      deletePromises.push(doc.ref.delete());
    });
    
    // Limpiar colección de preguntas
    const questionsSnapshot = await db.collection('questions').get();
    questionsSnapshot.forEach((doc) => {
      deletePromises.push(doc.ref.delete());
    });
    
    await Promise.all(deletePromises);
    console.log('✅ Colecciones limpiadas exitosamente');
  } catch (error) {
    console.error('❌ Error limpiando colecciones:', error);
  }
}

// Función para crear las categorías
async function createCategories() {
  console.log('📁 Creando categorías...');
  
  for (const [filename, categoryInfo] of Object.entries(categoryMapping)) {
    try {
      const categoryData = {
        name: categoryInfo.name,
        code: categoryInfo.code,
        order: categoryInfo.order,
        competences: categoryInfo.competences,
        createdAt: admin.firestore.Timestamp.now(),
        questionCount: 0 // Se actualizará después
      };
      
      await db.collection('categories').doc(categoryInfo.code).set(categoryData);
      console.log(`✅ Categoría creada: ${categoryInfo.name}`);
    } catch (error) {
      console.error(`❌ Error creando categoría ${categoryInfo.name}:`, error);
    }
  }
}

// Función para subir preguntas de un archivo
async function uploadQuestionsFromFile(filename, categoryInfo) {
  const questionsPath = path.join(__dirname, '../../preguntas', filename);
  
  // Verificar si el archivo existe
  if (!fs.existsSync(questionsPath)) {
    console.log(`⚠️  Archivo no encontrado: ${filename}`);
    return 0;
  }
  
  try {
    const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
    
    if (!Array.isArray(questionsData)) {
      console.log(`⚠️  Formato inválido en ${filename}: no es un array`);
      return 0;
    }
    
    let uploadedCount = 0;
    
    for (let i = 0; i < questionsData.length; i++) {
      const question = questionsData[i];
      
      // Validar estructura de la pregunta
      if (!question.type || !question.title || !question.scenario) {
        console.log(`⚠️  Pregunta inválida en ${filename}, índice ${i}: faltan campos requeridos`);
        continue;
      }
      
      // Crear ID único para la pregunta
      const questionId = `${categoryInfo.code}_${String(i + 1).padStart(3, '0')}`;        const questionData = {
          id: questionId,
          categoryCode: categoryInfo.code,
          categoryName: categoryInfo.name,
          order: i + 1,
          type: question.type,
          competence: question.competence || 'unknown',
          level: question.level || 'Básico 1',
          title: question.title,
          scenario: question.scenario,
          options: question.options || [],
          correctAnswerIndex: question.correctAnswerIndex ?? null,
          correctAction: question.correctAction || null,
          feedback: question.feedback || {
            correct: '¡Correcto!',
            incorrect: 'Respuesta incorrecta.'
          },
          steps: question.steps || [], // Para preguntas interactivas
          createdAt: admin.firestore.Timestamp.now(),
          isActive: true
        };
        
        await db.collection('questions').doc(questionId).set(questionData);
      uploadedCount++;
    }
    
    console.log(`✅ ${uploadedCount} preguntas subidas de ${categoryInfo.name}`);
    return uploadedCount;
    
  } catch (error) {
    console.error(`❌ Error procesando ${filename}:`, error);
    return 0;
  }
}

// Función para actualizar contadores de preguntas en categorías
async function updateQuestionCounts() {
  console.log('📊 Actualizando contadores de preguntas...');
  
  for (const [filename, categoryInfo] of Object.entries(categoryMapping)) {
    try {
      const questionsSnapshot = await db.collection('questions')
        .where('categoryCode', '==', categoryInfo.code)
        .get();
      
      const count = questionsSnapshot.size;
      
      // Actualizar el contador en la categoría
      await db.collection('categories').doc(categoryInfo.code).update({
        questionCount: count
      });
      
      console.log(`✅ Contador actualizado para ${categoryInfo.name}: ${count} preguntas`);
    } catch (error) {
      console.error(`❌ Error actualizando contador para ${categoryInfo.name}:`, error);
    }
  }
}

// Función principal
async function uploadAllQuestions() {
  console.log('🚀 Iniciando carga de preguntas a Firestore...');
  console.log('====================================');
  
  try {
    // Paso 1: Limpiar colecciones existentes
    await clearCollections();
    
    // Paso 2: Crear categorías
    await createCategories();
    
    // Paso 3: Subir preguntas por categoría
    let totalQuestions = 0;
    
    for (const [filename, categoryInfo] of Object.entries(categoryMapping)) {
      console.log(`\n📂 Procesando: ${categoryInfo.name}`);
      const count = await uploadQuestionsFromFile(filename, categoryInfo);
      totalQuestions += count;
    }
    
    // Paso 4: Actualizar contadores
    await updateQuestionCounts();
    
    console.log('\n====================================');
    console.log(`🎉 ¡Proceso completado exitosamente!`);
    console.log(`📊 Total de preguntas subidas: ${totalQuestions}`);
    console.log(`📁 Categorías creadas: ${Object.keys(categoryMapping).length}`);
    
  } catch (error) {
    console.error('❌ Error en el proceso principal:', error);
  }
  
  // Salir del proceso
  process.exit(0);
}

// Función para mostrar estadísticas
async function showStatistics() {
  console.log('\n📈 ESTADÍSTICAS FINALES:');
  console.log('========================');
  
  try {
    const categoriesSnapshot = await db.collection('categories').get();
    const questionsSnapshot = await db.collection('questions').get();
    
    console.log(`Total de categorías: ${categoriesSnapshot.size}`);
    console.log(`Total de preguntas: ${questionsSnapshot.size}`);
    
    console.log('\nPor categoría:');
    categoriesSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  - ${data.name}: ${data.questionCount} preguntas`);
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
  }
}

// Ejecutar el script
if (import.meta.url === `file://${process.argv[1]}`) {
  uploadAllQuestions().then(() => {
    showStatistics();
  });
}

export { uploadAllQuestions, clearCollections, createCategories };
