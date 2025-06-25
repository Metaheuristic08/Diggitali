/**
 * Configuración específica para scripts Node.js que usan CommonJS
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  Timestamp, 
  query, 
  where, 
  getDocs, 
  writeBatch,
  deleteDoc
} = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Configuración de Firebase (misma que en firebase.js)
const firebaseConfig = {
  // Aquí deberías poner tu configuración real de Firebase
  apiKey: "tu-api-key",
  authDomain: "tu-project.firebaseapp.com",
  projectId: "tu-project-id",
  storageBucket: "tu-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu-app-id"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Resto del código...
// Por ahora, vamos a usar un enfoque diferente

module.exports = {
  uploadAllQuestions: async () => {
    console.log('Feature temporarily disabled - use React app to manage questions');
  },
  clearCollections: async () => {
    console.log('Feature temporarily disabled - use React app to manage questions');
  },
  createCategories: async () => {
    console.log('Feature temporarily disabled - use React app to manage questions');
  },
  createCompetences: async () => {
    console.log('Feature temporarily disabled - use React app to manage questions');
  }
};
