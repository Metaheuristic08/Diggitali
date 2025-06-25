const { uploadAllQuestions, clearCollections, createCategories, createCompetences } = require('./uploadQuestionsClientCJS.js');

// Script de utilidades para manejo de preguntas en Firestore
// Usa Firebase Client SDK para evitar problemas de autenticación

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  switch (command) {
    case 'create':
      console.log('🏗️  Creando colecciones desde cero...');
      await uploadAllQuestions();
      break;
      
    case 'upload':
      console.log('🚀 Iniciando carga completa de preguntas...');
      await uploadAllQuestions();
      break;
      
    case 'clear':
      console.log('🧹 Limpiando colecciones...');
      await clearCollections();
      console.log('✅ Colecciones limpiadas');
      break;
        case 'categories':
      console.log('📁 Creando solo categorías...');
      await createCategories();
      console.log('✅ Categorías creadas');
      break;
      
    case 'competences':
      console.log('🎯 Creando solo competencias...');
      await createCompetences();
      console.log('✅ Competencias creadas');
      break;
      
    case 'help':
    default:
      console.log(`
📚 UTILIDADES DE PREGUNTAS FIRESTORE
===================================

Comandos disponibles:
  create     - Crea las colecciones desde cero (recomendado para inicio)
  upload     - Sube todas las preguntas, categorías y competencias
  clear      - Limpia todas las colecciones
  categories - Crea solo las categorías
  competences- Crea solo las competencias
  help       - Muestra esta ayuda

Uso:
  npm run questions create     (para crear desde cero)
  npm run questions upload
  npm run questions clear
  npm run questions categories
  npm run questions competences
      `);      break;
  }
}

main().catch(error => {
  console.error('❌ Error en questionsManager:', error);
  process.exit(1);
});
