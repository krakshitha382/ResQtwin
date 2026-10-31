import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { HospitalView } from './components/HospitalView';
import { SimulationView } from './components/SimulationView';
import { ScenarioComparison } from './components/ScenarioComparison/index';
import { AmbulanceView } from './components/AmbulanceView';
import { AboutModal } from './components/AboutModal';
import { PatientEmergencyAlertSystem } from './components/PatientEmergencyAlertSystem';
import { LoginPage, StaffUser } from './components/LoginPage';
import { ClinicalWorkbench } from './components/ClinicalWorkbench';
import { SecurityIncidentDesk } from './components/SecurityIncidentDesk';
import { DoctorDashboard } from './components/DoctorDashboard';
import { PageId } from './types';

const AUTH_KEY = 'resqtwin.demo.session';
const REMEMBER_KEY = 'resqtwin.demo.remember';
const VALID_ROLES = ['Doctor', 'Nurse', 'Security', 'Receptionist', 'Administrator'];

function readSavedUser(): StaffUser | null {
  try {
    const raw = sessionStorage.getItem(AUTH_KEY) ?? localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const user = parsed as Partial<StaffUser>;
    if (typeof user.name !== 'string' || !user.name.trim() || typeof user.role !== 'string' || !VALID_ROLES.includes(user.role) || typeof user.staffId !== 'string') return null;
    return user as StaffUser;
  } catch { return null; }
}

export function App() {
  const [user, setUser] = useState<StaffUser | null>(() => readSavedUser());
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(REMEMBER_KEY) !== 'true' && !sessionStorage.getItem(AUTH_KEY)) {
      localStorage.removeItem(AUTH_KEY);
      setUser(null);
    }
  }, []);

  const handleLogin = (nextUser: StaffUser, remember: boolean) => {
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_KEY);
    if (remember) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(nextUser));
      localStorage.setItem(REMEMBER_KEY, 'true');
    } else {
      sessionStorage.setItem(AUTH_KEY, JSON.stringify(nextUser));
      localStorage.setItem(REMEMBER_KEY, 'false');
    }
    setUser(nextUser);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    setUser(null);
    setIsAboutOpen(false);
    setCurrentPage('home');
  };

  if (!user) return <LoginPage onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <Navbar
        currentPage={currentPage}
        user={user}
        onLogout={handleLogout}
        onNavigate={(page) => {
          if (user.role === 'Security' && ['simulation', 'network', 'scenario-comparison'].includes(page)) return;
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAbout={() => setIsAboutOpen(true)}
      />
      <main className="flex-1 w-full flex flex-col pt-20">
        {currentPage === 'home' && (user.role === 'Doctor' ? <DoctorDashboard user={user} /> : <>
          <HomePage onNavigate={(page) => { if (user.role === 'Security' && ['simulation', 'network', 'scenario-comparison'].includes(page)) return; setCurrentPage(page); }} />
          <ClinicalWorkbench user={user} />
          <SecurityIncidentDesk user={user} />
        </>)}
        {currentPage === 'hospital' && <HospitalView />}
        {currentPage === 'simulation' && <SimulationView />}
        {currentPage === 'network' && <AmbulanceView />}
        {currentPage === 'scenario-comparison' && <ScenarioComparison />}
      </main>
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      <PatientEmergencyAlertSystem visible={currentPage === 'home' && user.role !== 'Security' && user.role !== 'Doctor'} />
    </div>
  );
}

export default App;
