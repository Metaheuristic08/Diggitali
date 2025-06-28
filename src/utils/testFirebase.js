import admin from 'firebase-admin';

// Verificar si Firebase está configurado correctamente
console.log('🔍 Verificando configuración de Firebase...');

try {
  // Intentar inicializar Firebase Admin
  if (!admin.apps.length) {
    admin.initializeApp({ 
      projectId: "ludico-backend",
      credential: admin.credential.applicationDefault()
    });
    console.log('✅ Firebase Admin inicializado correctamente');
  } else {
    console.log('✅ Firebase Admin ya estaba inicializado');
  }

  const db = admin.firestore();
  console.log('✅ Firestore inicializado correctamente');
  
  // Hacer una prueba simple
  console.log('🧪 Probando conexión a Firestore...');
  
  // Crear un documento de prueba
  const testRef = db.collection('test').doc('connection-test');
  await testRef.set({
    message: 'Conexión exitosa',
    timestamp: admin.firestore.Timestamp.now()
  });
  
  console.log('✅ Documento de prueba creado');
  
  // Leer el documento
  const doc = await testRef.get();
  if (doc.exists) {
    console.log('✅ Documento de prueba leído:', doc.data());
  }
  
  // Eliminar el documento de prueba
  await testRef.delete();
  console.log('✅ Documento de prueba eliminado');
  
  console.log('🎉 ¡Conexión a Firebase funciona correctamente!');
  
} catch (error) {
  console.error('❌ Error en la configuración de Firebase:', error);
  console.error('💡 Posibles soluciones:');
  console.log('  1. Verificar que las reglas de Firestore permitan escritura');
  console.log('  2. Verificar la configuración del proyecto');
  console.log('  3. Verificar permisos de autenticación');
}

process.exit(0);
