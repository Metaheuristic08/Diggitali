import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginRegister from './components/auth/LoginRegister';
import HomePage from './pages/HomePage';
import Competencias from './pages/Competencias';
import DigitalSkillsEvaluation from './components/evaluation/DigitalSkillsEvaluation';
import ItemGenerator from './components/tools/ItemGenerator';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/homepage" />} />
        <Route path="/loginregister" element={<LoginRegister />} />
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/competencias" element={<Competencias />} />
        <Route path="/evaluacion-digital" element={<DigitalSkillsEvaluation />} />
        <Route path="/generador-items" element={<ItemGenerator />} />
      </Routes>
    </Router>
  );
}

export default App;
