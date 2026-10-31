import React, { useState } from 'react';
import { Hospital3DScene } from './Hospital3DScene';
import { FloorSelector } from './FloorSelector';
import { DepartmentDetailsPanel } from './DepartmentDetailsPanel';
import { DepartmentModal } from './DepartmentModal';
import { DEPARTMENTS_DATA } from '../../data/mockData';
import { DepartmentData } from '../../types';

export const HospitalView: React.FC = () => {
  const [currentFloor, setCurrentFloor] = useState<string>('3F');
  const [selectedDept, setSelectedDept] = useState<DepartmentData | null>(DEPARTMENTS_DATA['maternity']);
  const [viewMode, setViewMode] = useState<'departments' | 'resources' | 'patientFlow'>('departments');
  const [modalDept, setModalDept] = useState<DepartmentData | null>(null);

  const handleSelectFloor = (floorId: string) => {
    setCurrentFloor(floorId);
    if (floorId === '3F') setSelectedDept(DEPARTMENTS_DATA['maternity']);
    else if (floorId === '1F') setSelectedDept(DEPARTMENTS_DATA['icu_main']);
    else if (floorId === 'GF') setSelectedDept(DEPARTMENTS_DATA['er_trauma']);
    else setSelectedDept(null);
  };

  return (
    <div className="relative w-full h-screen pt-16 bg-[#070d18] overflow-hidden select-none flex">
      {/* 3D Hospital Isometric Scene in background */}
      <div className="absolute inset-0 pt-16 z-0">
        <Hospital3DScene
          currentFloor={currentFloor}
          selectedDepartment={selectedDept}
          onSelectDepartment={(dept) => setSelectedDept(dept)}
          viewMode={viewMode}
        />
      </div>

      {/* Left-Side Floating Floor Selector */}
      <div className="relative z-10 p-6 flex flex-col justify-start pointer-events-none">
        <div className="pointer-events-auto">
          <FloorSelector
            currentFloor={currentFloor}
            onSelectFloor={handleSelectFloor}
          />
        </div>
      </div>

      {/* Bottom Center Floating Controls matching reference image: [ Departments ] [ Resources ] [ Patient Flow ] */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
        <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-[#0b1626]/85 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_20px_rgba(0,0,0,0.6)]">
          <button
            onClick={() => setViewMode('departments')}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
              viewMode === 'departments'
                ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.6)] border border-cyan-300/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Departments
          </button>

          <button
            onClick={() => setViewMode('resources')}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
              viewMode === 'resources'
                ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.6)] border border-cyan-300/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Resources
          </button>

          <button
            onClick={() => setViewMode('patientFlow')}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
              viewMode === 'patientFlow'
                ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.6)] border border-cyan-300/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Patient Flow
          </button>
        </div>
      </div>

      {/* Right-Side Department Details Panel */}
      <div className="ml-auto relative z-10 p-6 flex flex-col justify-start pointer-events-none">
        {selectedDept && (
          <div className="pointer-events-auto">
            <DepartmentDetailsPanel
              department={selectedDept}
              onClose={() => setSelectedDept(null)}
              onViewDetails={(dept) => setModalDept(dept)}
            />
          </div>
        )}
      </div>

      {/* Telemetry Modal */}
      {modalDept && (
        <DepartmentModal
          department={modalDept}
          onClose={() => setModalDept(null)}
        />
      )}
    </div>
  );
};

