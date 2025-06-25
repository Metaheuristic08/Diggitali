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
    competences: ['1.1', '1.2', '1.3'],
    description: 'Competencias relacionadas con la búsqueda, evaluación, gestión y manejo de información digital',
    color: '#00a8e8'
  },
  'COMUNICACIÓN Y COLABORACIÓN.json': {
    name: 'Comunicación y Colaboración',
    code: 'CC',
    order: 2,
    competences: ['2.1', '2.2', '2.3', '2.4', '2.5', '2.6'],
    description: 'Competencias para comunicarse y colaborar a través de tecnologías digitales',
    color: '#a066b0'
  },
  'CREACIÓN DE CONTENIDOS DIGITALES.json': {
    name: 'Creación de Contenidos Digitales',
    code: 'CCD',
    order: 3,
    competences: ['3.1', '3.2', '3.3', '3.4'],
    description: 'Competencias para crear y editar contenidos digitales',
    color: '#ff7e29'
  },
  'RESOLUCIÓN DE PROBLEMAS.json': {
    name: 'Resolución de Problemas',
    code: 'RP',
    order: 4,
    competences: ['5.1', '5.2', '5.3', '5.4'],
    description: 'Competencias para identificar y resolver problemas técnicos y conceptuales',
    color: '#f25c54'
  },
  'seguridad.json': {
    name: 'Seguridad',
    code: 'SEG',
    order: 5,
    competences: ['4.1', '4.2', '4.3', '4.4'],
    description: 'Competencias para proteger dispositivos, datos personales y privacidad',
    color: '#88b04b'
  },
  'preguntas.json': {
    name: 'Preguntas Generales',
    code: 'GEN',
    order: 6,
    competences: ['1.1', '1.2', '1.3', '2.1', '2.2', '3.1', '4.1', '5.1'],
    description: 'Preguntas generales que cubren múltiples competencias',
    color: '#6c757d'
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
        id: categoryInfo.code,
        name: categoryInfo.name,
        code: categoryInfo.code,
        order: categoryInfo.order,
        competences: categoryInfo.competences,
        description: categoryInfo.description || '',
        color: categoryInfo.color || '#6c757d',
        createdAt: admin.firestore.Timestamp.now(),
        questionCount: 0, // Se actualizará después
        isActive: true
      };
      
      await db.collection('categories').doc(categoryInfo.code).set(categoryData);
      console.log(`✅ Categoría creada: ${categoryInfo.name}`);
    } catch (error) {
      console.error(`❌ Error creando categoría ${categoryInfo.name}:`, error);
      throw error;
    }
  }
}

// Función para subir preguntas de un archivo
async function uploadQuestionsFromFile(filename, categoryInfo) {
  const questionsPath = path.join(__dirname, '../../preguntas', filename);
  
  console.log(`   📄 Buscando archivo: ${filename}`);
  
  // Verificar si el archivo existe
  if (!fs.existsSync(questionsPath)) {
    console.log(`   ⚠️  Archivo NO encontrado: ${filename}`);
    return 0;
  }
  
  try {
    console.log(`   📖 Leyendo archivo: ${filename}`);
    const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
    
    if (!Array.isArray(questionsData)) {
      console.log(`   ⚠️  Formato inválido en ${filename}: no es un array`);
      return 0;
    }
    
    console.log(`   📊 ${questionsData.length} preguntas encontradas`);
    
    let uploadedCount = 0;
    let skippedCount = 0;
    
    for (let i = 0; i < questionsData.length; i++) {
      const question = questionsData[i];
      
      // Validar estructura de la pregunta
      if (!question.type || !question.title || !question.scenario) {
        console.log(`   ⚠️  Pregunta ${i + 1} inválida: faltan campos requeridos (type, title, scenario)`);
        skippedCount++;
        continue;
      }
      
      // Crear ID único para la pregunta
      const questionId = `${categoryInfo.code}_${String(i + 1).padStart(3, '0')}`;
      
      try {
        const questionData = {
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
          updatedAt: admin.firestore.Timestamp.now(),
          isActive: true
        };
        
        await db.collection('questions').doc(questionId).set(questionData);
        uploadedCount++;
        
      } catch (uploadError) {
        console.log(`   ❌ Error subiendo pregunta ${i + 1}:`, uploadError.message);
        skippedCount++;
      }
    }
    
    console.log(`   ✅ ${uploadedCount} preguntas subidas exitosamente`);
    if (skippedCount > 0) {
      console.log(`   ⚠️  ${skippedCount} preguntas omitidas por errores`);
    }
    
    return uploadedCount;
    
  } catch (error) {
    console.error(`   ❌ Error procesando ${filename}:`, error.message);
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
  console.log('🚀 INICIANDO CREACIÓN DE COLECCIONES FIRESTORE');
  console.log('===============================================');
  console.log('📊 Proyecto:', firebaseConfig.projectId);
  console.log('📅 Fecha:', new Date().toLocaleString('es-ES'));
  console.log('===============================================\n');
  
  const startTime = Date.now();
  
  try {
    // Paso 1: Verificar conexión a Firestore
    console.log('🔍 Verificando conexión a Firestore...');
    await db.collection('_test').doc('connection').set({ timestamp: admin.firestore.Timestamp.now() });
    await db.collection('_test').doc('connection').delete();
    console.log('✅ Conexión a Firestore verificada\n');
    
    // Paso 2: Limpiar colecciones existentes (si existen)
    console.log('🧹 Limpiando colecciones existentes (si las hay)...');
    await clearCollections();
    console.log('✅ Limpieza completada\n');
    
    // Paso 3: Crear categorías
    console.log('📂 Creando categorías...');
    await createCategories();
    console.log('✅ Categorías creadas exitosamente\n');
    
    // Paso 4: Subir preguntas por categoría
    console.log('📝 Subiendo preguntas por categoría...');
    let totalQuestions = 0;
    let successfulCategories = 0;
    
    for (const [filename, categoryInfo] of Object.entries(categoryMapping)) {
      console.log(`\n📂 Procesando: ${categoryInfo.name}`);
      const count = await uploadQuestionsFromFile(filename, categoryInfo);
      totalQuestions += count;
      if (count > 0) successfulCategories++;
    }
    
    // Paso 5: Actualizar contadores
    console.log('\n📊 Actualizando contadores de preguntas...');
    await updateQuestionCounts();
    console.log('✅ Contadores actualizados\n');
    
    // Mostrar estadísticas finales
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('===============================================');
    console.log('🎉 ¡PROCESO COMPLETADO EXITOSAMENTE!');
    console.log('===============================================');
    console.log(`📊 Total de preguntas subidas: ${totalQuestions}`);
    console.log(`📁 Categorías procesadas: ${successfulCategories}/${Object.keys(categoryMapping).length}`);
    console.log(`⏱️  Tiempo total: ${duration} segundos`);
    console.log('===============================================\n');
    
    // Mostrar estadísticas detalladas
    await showStatistics();
    
  } catch (error) {
    console.error('❌ ERROR EN EL PROCESO PRINCIPAL:', error);
    console.error('💡 Verifica que:');
    console.error('   - Las reglas de Firestore permiten escritura');
    console.error('   - Los archivos de preguntas existen en /preguntas');
    console.error('   - La configuración de Firebase es correcta');
    throw error;
  }
}

// Función para mostrar estadísticas
async function showStatistics() {
  console.log('📈 ESTADÍSTICAS DETALLADAS:');
  console.log('==========================');
  
  try {
    const categoriesSnapshot = await db.collection('categories').orderBy('order').get();
    const questionsSnapshot = await db.collection('questions').get();
    
    console.log(`📊 Total de categorías: ${categoriesSnapshot.size}`);
    console.log(`📊 Total de preguntas: ${questionsSnapshot.size}`);
    
    console.log('\n📂 Desglose por categoría:');
    let totalQuestions = 0;
    
    for (const doc of categoriesSnapshot.docs) {
      const data = doc.data();
      const categoryQuestions = await db.collection('questions')
        .where('categoryCode', '==', data.code)
        .get();
      
      const count = categoryQuestions.size;
      totalQuestions += count;
      
      console.log(`   ${data.order}. ${data.name}`);
      console.log(`      📝 ${count} preguntas`);
      console.log(`      🏷️  Código: ${data.code}`);
      console.log(`      🎯 Competencias: ${data.competences.join(', ')}`);
      
      if (count > 0) {
        // Mostrar tipos de preguntas
        const questionTypes = {};
        categoryQuestions.docs.forEach(qDoc => {
          const qType = qDoc.data().type || 'unknown';
          questionTypes[qType] = (questionTypes[qType] || 0) + 1;
        });
        
        const typesSummary = Object.entries(questionTypes)
          .map(([type, count]) => `${type}(${count})`)
          .join(', ');
        console.log(`      📋 Tipos: ${typesSummary}`);
      }
      console.log('');
    }
    
    console.log(`✅ Verificación: ${totalQuestions} preguntas contabilizadas\n`);
    
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
  }
}

// Ejecutar el script
if (import.meta.url === `file://${process.argv[1]}`) {
  uploadAllQuestions()
    .then(() => {
      console.log('🏁 Script completado exitosamente');
    })
    .catch(error => {
      console.error('💥 Error ejecutando script:', error);
      process.exit(1);
    });
}

export { uploadAllQuestions, clearCollections, createCategories };
