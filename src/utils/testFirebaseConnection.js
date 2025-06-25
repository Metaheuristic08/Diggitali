// Test de conexión Firebase y funcionalidades básicas
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuración de Firebase (debe coincidir con src/services/firebase.js)
const firebaseConfig = {
  // Esta configuración debe estar en src/services/firebase.js
  // Solo verificamos la conexión básica aquí
};

// Test básico de conexión
async function testFirebaseConnection() {
  try {
    console.log('🔄 Iniciando test de conexión Firebase...');
    
    // Verificar si hay colecciones básicas
    const db = getFirestore();
    
    // Test 1: Verificar conexión a Firestore
    const questionsRef = collection(db, 'questions');
    const snapshot = await getDocs(questionsRef);
    console.log(`✅ Firestore conectado. Preguntas encontradas: ${snapshot.size}`);
    
    // Test 2: Verificar conexión a Auth
    const auth = getAuth();
    console.log(`✅ Firebase Auth conectado. Usuario actual: ${auth.currentUser?.email || 'No autenticado'}`);
    
    // Test 3: Verificar estructura de datos
    if (snapshot.size > 0) {
      const firstDoc = snapshot.docs[0];
      console.log('📋 Estructura de primera pregunta:', firstDoc.data());
    }
    
    console.log('🎉 Todas las conexiones Firebase funcionan correctamente');
    return true;
    
  } catch (error) {
    console.error('❌ Error en conexión Firebase:', error);
    console.log('⚠️  Revisa la configuración en src/services/firebase.js');
    return false;
  }
}

// Ejecutar test solo si este archivo es importado
if (typeof window !== 'undefined') {
  window.testFirebase = testFirebaseConnection;
  console.log('💡 Para probar Firebase, ejecuta: window.testFirebase()');
}

export default testFirebaseConnection;
