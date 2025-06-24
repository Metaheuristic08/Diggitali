import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import CompetenceList from '../components/competences/CompetenceList';
import CompetenceIntro from '../components/competences/CompetenceIntro';
import Footer from '../components/common/Footer';
import Progreso from './Progreso';
import Explorar from './Explorar';
import '../styles/pages/competences.css';


function CompetenciasPage() {
  const [currentPage, setCurrentPage] = useState('competencias');

  let content;
  switch (currentPage) {
    case 'progreso':
      content = <Progreso />;
      break;
    case 'explorar':
      content = <Explorar />;
      break;
    default:
      content = <CompetenceList />;
  }

  useEffect(() => {
    document.title = "Página Principal | Ladico";
  }, []);

  return (
    <div className="app">
      <Sidebar onNavigate={setCurrentPage} currentPage={currentPage} />
      <div className="main-content">
        <Header />
        {currentPage === 'competencias' && <CompetenceIntro />}
        {content}
        <Footer />
      </div>
    </div>
  );
}

export default CompetenciasPage;
