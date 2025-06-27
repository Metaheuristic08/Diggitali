import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import LoginRegister from './components/auth/LoginRegister';
import HomePage from './pages/HomePage';
import Competencias from './pages/Competencias';
import DigitalCompetencesPage from './pages/DigitalCompetencesPage';
import DigitalSkillsEvaluation from './components/evaluation/DigitalSkillsEvaluation';
import ImprovedDigitalSkillsEvaluation from './components/evaluation/ImprovedDigitalSkillsEvaluation';
import ItemGenerator from './components/tools/ItemGenerator';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/homepage" />} />
          <Route path="/loginregister" element={<LoginRegister />} />
          <Route path="/homepage" element={<HomePage />} />
          <Route 
            path="/competencias" 
            element={<Competencias />} 
          />
          <Route 
            path="/competencias-digitales" 
            element={
              <ProtectedRoute>
                <DigitalCompetencesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/evaluacion-digital" 
            element={
              <ProtectedRoute>
                <DigitalSkillsEvaluation />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/evaluacion-mejorada" 
            element={<ImprovedDigitalSkillsEvaluation />} 
          />
          <Route 
            path="/generador-items" 
            element={
              <ProtectedRoute>
                <ItemGenerator />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

