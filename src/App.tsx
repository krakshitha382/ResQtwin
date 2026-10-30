import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { HospitalView } from './components/HospitalView';
import { SimulationView } from './components/SimulationView';
import { ScenarioComparison } from './components/ScenarioComparison/index';
import { AmbulanceView } from './components/AmbulanceView';
import { AboutModal } from './components/AboutModal';
import { PageId } from './types';

export function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Global Navigation Bar matching all 4 screens */}
      <Navbar
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Screen Views matching the reference specification */}
      <main className="flex-1 w-full flex flex-col">
        {currentPage === 'home' && (
          <HomePage onNavigate={(page) => setCurrentPage(page)} />
        )}

        {currentPage === 'hospital' && (
          <HospitalView />
        )}

        {currentPage === 'simulation' && (
          <SimulationView />
        )}

        {currentPage === 'network' && (
          <AmbulanceView />
        )}
        {currentPage === 'scenario-comparison' && (
  <ScenarioComparison />
)}
      </main>

      {/* About Platform Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
}

export default App;
