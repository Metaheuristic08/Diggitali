import { uploadAllQuestions, clearCollections, createCategories } from './uploadQuestions.js';

// Script de utilidades para manejo de preguntas en Firestore

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
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
      
    case 'help':
    default:
      console.log(`
📚 UTILIDADES DE PREGUNTAS FIRESTORE
===================================

Comandos disponibles:

  upload     - Sube todas las preguntas y categorías
  clear      - Limpia todas las colecciones
  categories - Crea solo las categorías
  help       - Muestra esta ayuda

Uso:
  npm run questions upload
  npm run questions clear
  npm run questions categories
      `);
      break;
  }
  
  process.exit(0);
}

main().catch(console.error);
