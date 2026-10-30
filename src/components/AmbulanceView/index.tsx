import React, { useState } from 'react';
import { 
  Ambulance, Clock, MapPin, CheckCircle2, XCircle, 
  AlertCircle, ChevronDown, Check, Send, ShieldCheck 
} from 'lucide-react';
import { Ambulance3DCity } from './Ambulance3DCity';
import { HOSPITALS_DATA } from '../../data/mockData';
import { HospitalCandidate } from '../../types';

export const AmbulanceView: React.FC = () => {
  const [emergencyType, setEmergencyType] = useState<string>('Road Accident (Trauma)');
  const [selectedHospital, setSelectedHospital] = useState<HospitalCandidate>(HOSPITALS_DATA[1]); // Lifeline Hospital (Recommended)
  const [dispatched, setDispatched] = useState<boolean>(false);

  // Required facilities toggles matching reference
  const [facilities, setFacilities] = useState<{ [key: string]: boolean }>({
    'Trauma Care': true,
    'ICU Bed': true,
    'Operating Theatre': true,
    'Blood Bank': true,
    'CT Scan': true,
  });

  const toggleFacility = (facilityName: string) => {
    setFacilities((prev) => ({
      ...prev,
      [facilityName]: !prev[facilityName],
    }));
  };

  const handleDispatch = () => {
    setDispatched(true);
    setTimeout(() => setDispatched(false), 3500);
  };

  return (
    <div className="relative w-full h-screen pt-16 bg-[#070d18] overflow-hidden select-none flex">
      {/* 3D City Scene in Background */}
      <div className="absolute inset-0 pt-16 z-0">
        <Ambulance3DCity
          selectedHospital={selectedHospital}
          hospitals={HOSPITALS_DATA}
          onSelectHospital={(h) => setSelectedHospital(h)}
        />
      </div>

      {/* Left Panel: Ambulance Coordination */}
      <div className="relative z-10 p-6 flex flex-col justify-start pointer-events-none w-80 md:w-88">
        <div className="pointer-events-auto bg-[#0b1626]/85 backdrop-blur-xl border border-cyan-500/25 rounded-2xl p-5 shadow-[0_0_30px_rgba(0,0,0,0.6)]">
          <h3 className="text-sm font-semibold text-white tracking-tight mb-4 flex items-center justify-between">
            <span>Ambulance Coordination</span>
            <Ambulance className="w-4 h-4 text-cyan-400" />
          </h3>

          {/* Emergency Type Dropdown */}
          <div className="mb-5">
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              Emergency Type
            </label>
            <div className="relative">
              <select
                value={emergencyType}
                onChange={(e) => setEmergencyType(e.target.value)}
                className="w-full appearance-none bg-slate-900/80 border border-slate-700 hover:border-cyan-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium cursor-pointer transition-colors"
              >
                <option value="Road Accident (Trauma)">Road Accident (Trauma)</option>
                <option value="Acute Cardiac Arrest">Acute Cardiac Arrest (STEMI)</option>
                <option value="Ischemic Stroke Window">Ischemic Stroke Window</option>
                <option value="High-Risk Obstetric Crisis">High-Risk Obstetric Crisis</option>
                <option value="Mass Casualty Intake">Mass Casualty Intake</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Required Facilities Checklist matching reference */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              Required Facilities
            </h4>
            <div className="space-y-2">
              {Object.entries(facilities).map(([facility, isChecked]) => (
                <div
                  key={facility}
                  onClick={() => toggleFacility(facility)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition-all duration-200 ${
                    isChecked
                      ? 'bg-cyan-950/50 border-cyan-500/40 text-cyan-200'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                      isChecked
                        ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                        : 'border-slate-600'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="font-medium">{facility}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Route Optimization Note */}
          <div className="mt-5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              ResQ Twin evaluates travel time, telemetry, and capacity. The nearest facility is bypassed if critical beds are full.
            </span>
          </div>
        </div>
      </div>

      {/* Right Panel: Hospital Destination Comparison Cards */}
      <div className="ml-auto relative z-10 p-6 flex flex-col justify-start pointer-events-none w-80 md:w-88">
        <div className="pointer-events-auto space-y-3.5">
          {HOSPITALS_DATA.map((hosp) => {
            const isSelected = selectedHospital.id === hosp.id;
            const isAvailable = hosp.status === 'Available';
            const isLimited = hosp.status === 'Limited';
            const isNotAvailable = hosp.status === 'Not Available';

            return (
              <div
                key={hosp.id}
                onClick={() => setSelectedHospital(hosp)}
                className={`p-4 rounded-2xl backdrop-blur-xl border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#0b1626]/95 to-[#0e223d]/95 border-2 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)] scale-102'
                    : 'bg-[#0b1626]/85 border-cyan-500/20 hover:border-cyan-500/40 hover:bg-[#0e1d33]/90'
                }`}
              >
                {/* Hospital Header */}
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    {hosp.name}
                  </h4>
                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      isAvailable
                        ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                        : isLimited
                        ? 'bg-amber-950/80 border-amber-500/60 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                        : 'bg-rose-950/80 border-rose-500/60 text-rose-300 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                    }`}
                  >
                    {hosp.status}
                  </span>
                </div>

                {/* Distance & Time Row */}
                <div className="flex items-center gap-3 text-xs text-slate-300 mb-2.5">
                  <div className="flex items-center gap-1 font-mono text-cyan-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-bold text-white">{hosp.etaMinutes} min</span>
                  </div>
                  <span className="text-slate-500">•</span>
                  <div className="flex items-center gap-1 text-slate-400 font-mono">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{hosp.distanceKm} km</span>
                  </div>
                </div>

                {/* Details / Reasons */}
                <div className="space-y-1 text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  {hosp.reasons.map((reason, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isAvailable ? 'bg-emerald-400' : isLimited ? 'bg-amber-400' : 'bg-rose-400'
                      }`} />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>

                {/* Recommended Badge for Lifeline Hospital */}
                {hosp.id === 'lifeline' && (
                  <div className="mt-2.5 text-[11px] font-semibold text-cyan-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>AI Optimal Destination Match</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Dispatch Ambulance Button */}
          <button
            onClick={handleDispatch}
            disabled={dispatched}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_20px_rgba(6,182,212,0.5)] active:scale-98 transition-all duration-200 border border-cyan-300/40 flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            {dispatched ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white animate-bounce" />
                <span>Ambulance Dispatched to {selectedHospital.name}!</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Dispatch Ambulance to {selectedHospital.name}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

