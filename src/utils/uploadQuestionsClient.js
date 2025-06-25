/**
 * Script para subir preguntas usando Firebase Client SDK
 * No requiere credenciales de servicio - usa las reglas de Firestore públicas
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc,
  writeBatch, 
  deleteDoc, 
  serverTimestamp,
  query,
  orderBy 
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Firebase (same as your firebase.js)
const firebaseConfig = {
  apiKey: "AIzaSyCOFq_3nQaLr84G9OdvH1TNZYexvrqfwhw",
  authDomain: "ludico-backend.firebaseapp.com",
  projectId: "ludico-backend",
  storageBucket: "ludico-backend.firebasestorage.app",
  messagingSenderId: "663116086194",
  appId: "1:663116086194:web:ebb51b7246f147a25d82ab",
  measurementId: "G-2WE2ZG3FF8"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Mapeo de archivos a categorías
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
    description: 'Competencias para interactuar, comunicar y colaborar en entornos digitales',
    color: '#ff6b6b'
  },
  'CREACIÓN DE CONTENIDOS DIGITALES.json': {
    name: 'Creación de Contenidos Digitales',
    code: 'CCD',
    order: 3,
    competences: ['3.1', '3.2', '3.3', '3.4'],
    description: 'Competencias para crear, editar y producir contenidos digitales',
    color: '#4ecdc4'
  },
  'RESOLUCIÓN DE PROBLEMAS.json': {
    name: 'Resolución de Problemas',
    code: 'RP',
    order: 5,
    competences: ['5.1', '5.2', '5.3', '5.4'],
    description: 'Competencias para identificar y resolver problemas técnicos y conceptuales',
    color: '#95e1d3'
  },
  'seguridad.json': {
    name: 'Seguridad',
    code: 'SEG',
    order: 4,
    competences: ['4.1', '4.2', '4.3', '4.4'],
    description: 'Competencias relacionadas con la protección de dispositivos, datos personales y privacidad',
    color: '#ffa726'
  }
};

// Definición detallada de competencias para mejor categorización
const competencesDefinition = {
  '1.1': {
    code: '1.1',
    name: 'Navegación, búsqueda y filtrado de información, datos y contenidos digitales',
    category: 'BGID',
    area: 'Información y alfabetización informacional',
    description: 'Articular las necesidades de información, buscar información y contenidos en entornos digitales, acceder a ellos y navegar entre ellos. Crear y actualizar estrategias de búsqueda personales.',
    levels: ['Básico 1', 'Básico 2', 'Intermedio 1', 'Intermedio 2', 'Avanzado 1', 'Avanzado 2']
  },
  '1.2': {
    code: '1.2', 
    name: 'Evaluación de información, datos y contenidos digitales',
    category: 'BGID',
    area: 'Información y alfabetización informacional',
    description: 'Analizar, comparar y evaluar de manera crítica la credibilidad y fiabilidad de las fuentes de información, datos y contenidos digitales.',
    levels: ['Básico 1', 'Básico 2', 'Intermedio 1', 'Intermedio 2', 'Avanzado 1', 'Avanzado 2']
  },
  '1.3': {
    code: '1.3',
    name: 'Almacenamiento y recuperación de información, datos y contenidos digitales', 
    category: 'BGID',
    area: 'Información y alfabetización informacional',
    description: 'Gestionar, almacenar y organizar información, datos y contenidos para facilitar su recuperación. Organizarlos y procesarlos en un entorno estructurado.',
    levels: ['Básico 1', 'Básico 2', 'Intermedio 1', 'Intermedio 2', 'Avanzado 1', 'Avanzado 2']
  },
  '2.1': {
    code: '2.1',
    name: 'Interacción mediante tecnologías digitales',
    category: 'CC',
    area: 'Comunicación y colaboración',
    description: 'Interactuar por medio de diversas tecnologías digitales y entender qué medios de comunicación digital son los adecuados para un contexto determinado.',
    levels: ['Básico 1', 'Básico 2', 'Intermedio 1', 'Intermedio 2', 'Avanzado 1', 'Avanzado 2']
  },
  '2.2': {
    code: '2.2',
    name: 'Compartir información y contenidos digitales',
    category: 'CC', 
    area: 'Comunicación y colaboración',
    description: 'Compartir información y contenidos digitales, y estar al tanto de las prácticas de citación y atribución. Actuar como intermediario, conocer las prácticas de referencia y atribución.',
    levels: ['Básico 1', 'Básico 2', 'Intermedio 1', 'Intermedio 2', 'Avanzado 1', 'Avanzado 2']
  },
  '2.3': {
    code: '2.3',
    name: 'Participación ciudadana en línea',
    category: 'CC',
    area: 'Comunicación y colaboración', 
    description: 'Participar en la sociedad mediante el uso de servicios digitales públicos y privados. Buscar oportunidades de empoderamiento personal y para la participación ciudadana a través de las tecnologías digitales apropiadas.',
    levels: ['Básico 1', 'Básico 2', 'Intermedio 1', 'Intermedio 2', 'Avanzado 1', 'Avanzado 2']
  },
  '2.4': {
    code: '2.4',
    name: 'Colaboración mediante tecnologías digitales',
    category: 'CC',
    area: 'Comunicación y colaboración',
    description: 'Utilizar tecnologías y medios digitales para el trabajo en equipo, procesos colaborativos y creación y construcción común de recursos, conocimientos y contenidos.',
    levels: ['Básico 1', 'Básico 2', 'Intermedio 1', 'Intermedio 2', 'Avanzado 1', 'Avanzado 2']
  },
  '2.5': {
    code: '2.5',
    name: 'Netiqueta',
    category: 'CC',
    area: 'Comunicación y colaboración',
    description: 'Estar al tanto de las normas de comportamiento en las interacciones en línea o virtuales. Entender la diversidad cultural y generacional en los entornos digitales.',
    levels: ['Básico 1', 'Básico 2', 'Intermedio 1', 'Intermedio 2', 'Avanzado 1', 'Avanzado 2']
  },
  '2.6': {
    code: '2.6',
    name: 'Gestión de la identidad digital',
    category: 'CC',
    area: 'Comunicación y colaboración',
    description: 'Crear y gestionar una o varias identidades digitales, ser capaz de proteger la propia reputación digital, gestionar los datos que uno produce a través de diversas cuentas y aplicaciones.',
    levels: ['Básico 1', 'Básico 2', 'Intermedio 1', 'Intermedio 2', 'Avanzado 1', 'Avanzado 2']
  },
  '3.1': {
    code: '3.1',
    name: 'Desarrollo de contenidos digitales',
    category: 'CCD',
    area: 'Creación de contenido digital',
    description: 'Crear y editar contenidos digitales en diversos formatos, expresarse a través de medios digitales.',
    levels: ['Básico 1', 'Básico 2', 'Intermedio 1', 'Intermedio 2', 'Avanzado 1', 'Avanzado 2']
  },
  '3.2': {
    code: '3.2',
    name: 'Integración y reelaboración de contenidos digitales',
    category: 'CCD',
    area: 'Creación de contenido digital',
    description: 'Modificar, perfeccionar, mejorar e integrar información y contenidos en un corpus de conocimiento existente para crear conocimientos y contenidos nuevos, originales y relevantes.',
    levels: ['Básico 1', 'Básico 2', 'Intermedio 1', 'Intermedio 2', 'Avanzado 1', 'Avanzado 2']
  },
  '3.3': {
    code: '3.3',
    name: 'Derechos de autor y licencias',
    category: 'CCD',
    area: 'Creación de contenido digital',
    description: 'Entender cómo se aplican los derechos de autor y las licencias a la información y contenidos digitales.',
    levels: ['Básico 1', 'Básico 2', 'Intermedio 1', 'Intermedio 2', 'Avanzado 1', 'Avanzado 2']
  },
  '3.4': {
    code: '3.4',
    name: 'Programación',
    category: 'CCD',
    area: 'Creación de contenido digital',
    description: 'Planificar y desarrollar una secuencia de instrucciones comprensibles para un sistema informático para resolver un problema determinado o realizar una tarea específica.',
    levels: ['Básico 1', 'Básico 2', 'Intermedio 1', 'Intermedio 2', 'Avanzado 1', 'Avanzado 2']
  },
  '4.1': {
    code: '4.1',
    name: 'Protección de dispositivos',
    category: 'SEG',
    area: 'Seguridad',
    description: 'Proteger dispositivos y contenidos digitales, entender los riesgos y amenazas en entornos digitales. Conocer medidas de seguridad y protección y tener debidamente en cuenta la fiabilidad y la privacidad.',
    levels: ['Básico 1', 'Básico 2', 'Intermedio 1', 'Intermedio 2', 'Avanzado 1', 'Avanzado 2']
  },
  '4.2': {
    code: '4.2',
    name: 'Protección de datos personales e identidad digital',
    category: 'SEG',
    area: 'Seguridad',
    description: 'Proteger datos personales e identidad digital en entornos digitales. Entender cómo utilizar y compartir información de identificación personal mientras se protege a uno mismo y a otros de daños.',
    levels: ['Básico 1', 'Básico 2', 'Intermedio 1', 'Intermedio 2', 'Avanzado 1', 'Avanzado 2']
  },
  '4.3': {
    code: '4.3',
    name: 'Protección de la salud y el bienestar',
    category: 'SEG',
    area: 'Seguridad',
    description: 'Ser capaz de evitar riesgos para la salud y amenazas para el bienestar físico y psicológico al utilizar tecnologías digitales. Ser capaz de protegerse a sí mismo y a otros de posibles peligros en entornos digitales.',
    levels: ['Básico 1', 'Básico 2', 'Intermedio 1', 'Intermedio 2', 'Avanzado 1', 'Avanzado 2']
  },
  '4.4': {
    code: '4.4',
    name: 'Protección del entorno',
    category: 'SEG',
    area: 'Seguridad',
    description: 'Ser consciente del impacto ambiental de las tecnologías digitales y su uso.',
    levels: ['Básico 1', 'Básico 2', 'Intermedio 1', 'Intermedio 2', 'Avanzado 1', 'Avanzado 2']
  },
  '5.1': {
    code: '5.1',
    name: 'Resolución de problemas técnicos',
    category: 'RP',
    area: 'Resolución de problemas',
    description: 'Identificar problemas técnicos al operar dispositivos y usar entornos digitales, y solucionarlos (desde la solución de problemas básicos hasta la solución de problemas más complejos).',
    levels: ['Básico 1', 'Básico 2', 'Intermedio 1', 'Intermedio 2', 'Avanzado 1', 'Avanzado 2']
  },
  '5.2': {
    code: '5.2',
    name: 'Identificación de necesidades y respuestas tecnológicas',
    category: 'RP',
    area: 'Resolución de problemas',
    description: 'Evaluar las necesidades e identificar, evaluar, seleccionar y utilizar herramientas digitales y posibles respuestas tecnológicas para resolverlas.',
    levels: ['Básico 1', 'Básico 2', 'Intermedio 1', 'Intermedio 2', 'Avanzado 1', 'Avanzado 2']
  },
  '5.3': {
    code: '5.3',
    name: 'Uso creativo de tecnologías digitales',
    category: 'RP',
    area: 'Resolución de problemas',
    description: 'Usar las tecnologías digitales de manera creativa para resolver problemas conceptuales a través de medios digitales.',
    levels: ['Básico 1', 'Básico 2', 'Intermedio 1', 'Intermedio 2', 'Avanzado 1', 'Avanzado 2']
  },
  '5.4': {
    code: '5.4',
    name: 'Identificación de lagunas en la competencia digital',
    category: 'RP',
    area: 'Resolución de problemas',
    description: 'Entender dónde es necesario mejorar o actualizar la propia competencia digital. Ser capaz de apoyar a otros en el desarrollo de su competencia digital.',
    levels: ['Básico 1', 'Básico 2', 'Intermedio 1', 'Intermedio 2', 'Avanzado 1', 'Avanzado 2']
  }
};

// Función para mostrar el header del proceso
function showHeader() {
  const now = new Date();
  const dateStr = now.toLocaleString('es-ES');
  
  console.log(`
🚀 INICIANDO CREACIÓN DE COLECCIONES FIRESTORE
===============================================
📊 Proyecto: ${firebaseConfig.projectId}
📅 Fecha: ${dateStr}
===============================================
`);
}

// Función para verificar conexión
async function verifyConnection() {
  try {
    console.log('🔍 Verificando conexión a Firestore...');
    const testCollection = collection(db, 'connection-test');
    console.log('✅ Conexión exitosa a Firestore');
    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    return false;
  }
}

// Función para limpiar todas las colecciones
export async function clearCollections() {
  try {
    console.log('🧹 Iniciando limpieza de colecciones...');
      const collections = ['categories', 'questions', 'competences'];
    let totalDeleted = 0;
    
    for (const collectionName of collections) {
      console.log(`🗑️  Limpiando colección: ${collectionName}`);
      
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      if (snapshot.empty) {
        console.log(`   ℹ️  Colección ${collectionName} ya está vacía`);
        continue;
      }
      
      // Firestore Client SDK requiere borrar en lotes más pequeños
      const batch = writeBatch(db);
      let batchCount = 0;
      
      for (const doc of snapshot.docs) {
        batch.delete(doc.ref);
        batchCount++;
        totalDeleted++;
        
        // Ejecutar batch cada 500 documentos (límite de Firestore)
        if (batchCount >= 500) {
          await batch.commit();
          console.log(`   📦 Lote de ${batchCount} documentos eliminado`);
          batchCount = 0;
        }
      }
      
      // Ejecutar el último batch si tiene documentos
      if (batchCount > 0) {
        await batch.commit();
        console.log(`   📦 Último lote de ${batchCount} documentos eliminado`);
      }
      
      console.log(`   ✅ Colección ${collectionName} limpiada`);
    }
    
    console.log(`🎯 LIMPIEZA COMPLETADA: ${totalDeleted} documentos eliminados total`);
    
  } catch (error) {
    console.error('❌ ERROR LIMPIANDO COLECCIONES:', error);
    throw error;
  }
}

// Función para crear categorías
export async function createCategories() {
  try {
    console.log('📁 Iniciando creación de categorías...');
    
    const batch = writeBatch(db);
    let count = 0;
    
    for (const [filename, categoryData] of Object.entries(categoryMapping)) {
      const categoryDoc = {
        id: categoryData.code,
        name: categoryData.name,
        code: categoryData.code,
        order: categoryData.order,
        competences: categoryData.competences,
        description: categoryData.description,
        color: categoryData.color,
        questionCount: 0, // Se actualizará después
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true
      };
      
      const docRef = doc(db, 'categories', categoryData.code);
      batch.set(docRef, categoryDoc);
      count++;
      
      console.log(`   📂 Categoría preparada: ${categoryData.name} (${categoryData.code})`);
    }
    
    await batch.commit();
    console.log(`✅ ${count} CATEGORÍAS CREADAS EXITOSAMENTE`);
    
    return count;
  } catch (error) {
    console.error('❌ ERROR CREANDO CATEGORÍAS:', error);
    throw error;
  }
}

// Función para cargar preguntas desde un archivo
async function uploadQuestionsFromFile(filename, categoryData) {
  const questionsPath = path.join(__dirname, '../../preguntas', filename);
  
  if (!fs.existsSync(questionsPath)) {
    console.log(`   ⚠️  Archivo no encontrado: ${filename}`);
    return 0;
  }
  
  try {
    const fileContent = fs.readFileSync(questionsPath, 'utf8');
    const questions = JSON.parse(fileContent);
    
    if (!Array.isArray(questions) || questions.length === 0) {
      console.log(`   ⚠️  No hay preguntas válidas en: ${filename}`);
      return 0;
    }
    
    console.log(`   📄 Procesando: ${filename} (${questions.length} preguntas)`);
    
    const batch = writeBatch(db);
    let batchCount = 0;
    let processedCount = 0;
      for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      // Validar estructura de la pregunta (usando la estructura real de tus archivos)
      if (!question.title || !question.scenario || !question.options || !Array.isArray(question.options)) {
        console.log(`   ⚠️  Pregunta ${i + 1} tiene estructura inválida, saltando...`);
        continue;
      }
      
      const questionDoc = {
        id: `${categoryData.code}_${String(i + 1).padStart(3, '0')}`,
        categoryCode: categoryData.code,
        categoryName: categoryData.name,
        type: question.type || 'multiple-choice',
        title: question.title.trim(),
        scenario: question.scenario.trim(),
        options: question.options.map(opt => opt.trim()),
        correctAnswerIndex: question.correctAnswerIndex || 0,
        competence: question.competence || categoryData.competences[0],
        level: question.level || 'Básico 1',
        feedback: question.feedback || { correct: '', incorrect: '' },
        tags: question.tags || [],
        order: i + 1,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = doc(db, 'questions', questionDoc.id);
      batch.set(docRef, questionDoc);
      batchCount++;
      processedCount++;
      
      // Ejecutar batch cada 500 documentos
      if (batchCount >= 500) {
        await batch.commit();
        console.log(`   📦 Lote de ${batchCount} preguntas subido`);
        batchCount = 0;
      }
    }
    
    // Ejecutar el último batch
    if (batchCount > 0) {
      await batch.commit();
      console.log(`   📦 Último lote de ${batchCount} preguntas subido`);
    }
      // Actualizar contadores en la categoría y competencia
    const categoryRef = doc(db, 'categories', categoryData.code);
    await setDoc(categoryRef, { 
      questionCount: processedCount,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    // Actualizar contador por competencia
    const competenceCounter = {};
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (question.competence) {
        competenceCounter[question.competence] = (competenceCounter[question.competence] || 0) + 1;
      }
    }
      // Actualizar documentos de competencias
    for (const [competenceCode, count] of Object.entries(competenceCounter)) {
      const competenceRef = doc(db, 'competences', competenceCode);
      const competenceDoc = await getDoc(competenceRef);
      if (competenceDoc.exists()) {
        const currentCount = competenceDoc.data().questionCount || 0;
        await setDoc(competenceRef, {
          questionCount: currentCount + count,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    }
    
    console.log(`   ✅ ${processedCount} preguntas subidas para ${categoryData.name}`);
    return processedCount;
    
  } catch (error) {
    console.error(`   ❌ Error procesando ${filename}:`, error.message);
    return 0;
  }
}

// Función principal para subir todas las preguntas
export async function uploadAllQuestions() {
  try {
    showHeader();
    
    // Verificar conexión
    const connectionOk = await verifyConnection();
    if (!connectionOk) {
      throw new Error('No se pudo conectar a Firestore');
    }
    
    console.log('🏗️  Iniciando proceso completo de carga...\n');
      // 1. Crear categorías
    console.log('📁 PASO 1: Creando categorías...');
    const categoriesCount = await createCategories();
    console.log('');
    
    // 2. Crear competencias
    console.log('🎯 PASO 2: Creando competencias...');
    const competencesCount = await createCompetences();
    console.log('');
    
    // 3. Subir preguntas por categoría
    console.log('📝 PASO 3: Subiendo preguntas por categoría...');
    let totalQuestions = 0;
    
    for (const [filename, categoryData] of Object.entries(categoryMapping)) {
      console.log(`\n🎯 Procesando categoría: ${categoryData.name}`);
      const questionsCount = await uploadQuestionsFromFile(filename, categoryData);
      totalQuestions += questionsCount;
    }
      console.log('');
    
    // 4. Mostrar estadísticas finales
    await showStatistics(categoriesCount, competencesCount, totalQuestions);
    
    console.log('🎉 ¡PROCESO COMPLETADO EXITOSAMENTE!');
    
  } catch (error) {
    console.error('❌ ERROR EN EL PROCESO PRINCIPAL:', error);
    console.log(`
💡 Verifica que:
   - Las reglas de Firestore permiten escritura
   - Los archivos de preguntas existen en /preguntas
   - La configuración de Firebase es correcta`);
    throw error;
  }
}

// Función para mostrar estadísticas
async function showStatistics(categoriesCount, competencesCount, totalQuestions) {
  try {
    console.log(`
📊 ESTADÍSTICAS FINALES
=======================`);
    
    // Mostrar resumen por categoría
    console.log('\n📂 Categorías creadas:');
    for (const [filename, categoryData] of Object.entries(categoryMapping)) {
      try {
        const categoryRef = doc(db, 'categories', categoryData.code);
        const categoryDoc = await getDoc(categoryRef);
        const questionCount = categoryDoc.exists() ? categoryDoc.data().questionCount || 0 : 0;
          console.log(`   • ${categoryData.name}: ${questionCount} preguntas`);
      } catch (error) {
        console.log(`   • ${categoryData.name}: Error obteniendo datos`);
      }
    }
    
    // Mostrar resumen por competencia
    console.log('\n🎯 Competencias creadas:');
    for (const [competenceCode, competenceData] of Object.entries(competencesDefinition)) {
      try {
        const competenceRef = doc(db, 'competences', competenceCode);
        const competenceDoc = await getDoc(competenceRef);
        const questionCount = competenceDoc.exists() ? competenceDoc.data().questionCount || 0 : 0;
        
        console.log(`   • ${competenceCode} - ${competenceData.name}: ${questionCount} preguntas`);
      } catch (error) {
        console.log(`   • ${competenceCode}: Error obteniendo datos`);
      }
    }
      console.log(`
📈 RESUMEN TOTAL:
   • Categorías: ${categoriesCount}
   • Competencias: ${competencesCount}
   • Preguntas: ${totalQuestions}
   • Estado: ✅ Todas las colecciones creadas
   
🌐 Tu base de datos está lista en: https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore
`);
    
  } catch (error) {
    console.error('⚠️  Error mostrando estadísticas:', error.message);    console.log(`
📈 RESUMEN BÁSICO:
   • Categorías: ${categoriesCount}
   • Competencias: ${competencesCount}
   • Preguntas: ${totalQuestions}
   • Estado: ✅ Proceso completado
`);
  }
}

// Función para crear competencias
export async function createCompetences() {
  try {
    console.log('🎯 Iniciando creación de competencias...');
    
    const batch = writeBatch(db);
    let count = 0;
    
    for (const [competenceCode, competenceData] of Object.entries(competencesDefinition)) {
      const competenceDoc = {
        id: competenceCode,
        code: competenceCode,
        name: competenceData.name,
        category: competenceData.category,
        area: competenceData.area,
        description: competenceData.description,
        levels: competenceData.levels,
        questionCount: 0, // Se actualizará después
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true
      };
      
      const docRef = doc(db, 'competences', competenceCode);
      batch.set(docRef, competenceDoc);
      count++;
      
      console.log(`   🎯 Competencia preparada: ${competenceData.name} (${competenceCode})`);
    }
    
    await batch.commit();
    console.log(`✅ ${count} COMPETENCIAS CREADAS EXITOSAMENTE`);
    
    return count;
  } catch (error) {
    console.error('❌ ERROR CREANDO COMPETENCIAS:', error);
    throw error;
  }
}

// Para compatibilidad con el script anterior
export { uploadAllQuestions as default };
