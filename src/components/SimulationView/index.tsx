import React, { useState } from 'react';
import { 
  Car, Heart, Baby, Brain, Users, Play, AlertTriangle, 
  ArrowRight, Bed, UserCheck, Droplet, Clock, ShieldAlert,
  Sparkles, CheckCircle2
} from 'lucide-react';
import { EMERGENCY_SCENARIOS } from '../../data/mockData';
import { EmergencyScenario } from '../../types';
import { runSimulationCalculation, InterventionOptions, SimulationResult } from '../../utils/simulationEngine';
import { AnalysisModal } from './AnalysisModal';
import edSceneImage from '../../assets/images/emergency_room_interior.jpg';

export const SimulationView: React.FC = () => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('road-accident');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationCompleted, setSimulationCompleted] = useState<boolean>(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState<boolean>(false);

  const [interventions, setInterventions] = useState<InterventionOptions>({
    extraStaff: false,
    surgeIcuBeds: false,
    divertNonCritical: false,
  });

  const currentScenario = EMERGENCY_SCENARIOS.find((s) => s.id === selectedScenarioId) || EMERGENCY_SCENARIOS[0];

  // Calculate live simulation metrics
  const simResult: SimulationResult = runSimulationCalculation(currentScenario, interventions);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimulationCompleted(false);

    setTimeout(() => {
      setIsSimulating(false);
      setSimulationCompleted(true);
    }, 900);
  };

  const handleToggleIntervention = (key: keyof InterventionOptions) => {
    setInterventions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleResetInterventions = () => {
    setInterventions({
      extraStaff: false,
      surgeIcuBeds: false,
      divertNonCritical: false,
    });
  };

  const getScenarioIcon = (id: string) => {
    switch (id) {
      case 'road-accident':
        return <Car className="w-5 h-5" />;
      case 'cardiac-emergency':
        return <Heart className="w-5 h-5" />;
      case 'childbirth-emergency':
        return <Baby className="w-5 h-5" />;
      case 'stroke-emergency':
        return <Brain className="w-5 h-5" />;
      case 'multiple-emergencies':
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  // Percentage calculations
  const erPercent = Math.round((simResult.erBedsOccupied / simResult.erBedsTotal) * 100);
  const icuPercent = Math.round((simResult.icuBedsOccupied / simResult.icuBedsTotal) * 100);
  const otPercent = Math.round((simResult.otRoomsOccupied / simResult.otRoomsTotal) * 100);
  const staffPercent = Math.round((simResult.staffOnDuty / simResult.staffTotal) * 100);
  const bloodPercent = Math.round((simResult.bloodUnits / simResult.bloodTotal) * 100);

  return (
    <div className="relative w-full min-h-screen pt-16 bg-[#070d18] flex flex-col justify-between overflow-x-hidden select-none pb-6">
      {/* Top Main Section: Left Scenario Picker, Center Visual Scene, Right Live Resource Status */}
      <div className="flex-1 px-6 py-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start max-w-[1600px] mx-auto w-full">
        
        {/* Left Column: Select Emergency Scenario */}
        <div className="lg:col-span-3 flex flex-col justify-between bg-[#0b1626]/85 backdrop-blur-xl border border-cyan-500/25 rounded-2xl p-5 shadow-[0_0_25px_rgba(0,0,0,0.5)]">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight mb-4 flex items-center justify-between">
              <span>Select Emergency Scenario</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </h3>

            {/* Scenario Buttons List matching reference image */}
            <div className="space-y-2.5">
              {EMERGENCY_SCENARIOS.map((scen) => {
                const isSelected = scen.id === selectedScenarioId;
                return (
                  <button
                    key={scen.id}
                    onClick={() => {
                      setSelectedScenarioId(scen.id);
                      setSimulationCompleted(false);
                    }}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-950/90 to-blue-950/90 border-2 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-101'
                        : 'bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_#06b6d4]'
                          : 'bg-slate-800 text-cyan-400'
                      }`}
                    >
                      {getScenarioIcon(scen.id)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold leading-tight">{scen.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 capitalize">
                        Severity: <span className={scen.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'}>{scen.severity}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Glowing Run Simulation Button matching reference image */}
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="w-full mt-6 py-3.5 px-5 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:shadow-[0_0_35px_rgba(6,182,212,0.85)] active:scale-98 transition-all duration-300 border border-cyan-300/40 flex items-center justify-center gap-2.5 text-xs sm:text-sm cursor-pointer disabled:opacity-70"
          >
            {isSimulating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Simulating Crisis Load...</span>
              </>
            ) : (
              <>
                <span>Run Simulation</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Center Column: Realistic Emergency Department Visual & Domino Effect */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Main Visual Display */}
          <div className="relative w-full h-[360px] sm:h-[400px] rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_35px_rgba(0,0,0,0.6)] bg-slate-950 group">
            {/* Visual Department Image with CT scanner and medical staff */}
            <img
              src={edSceneImage}
              alt="Emergency Department Under Load"
              className={`w-full h-full object-cover filter brightness-[0.88] contrast-[1.05] transition-transform duration-700 ${
                isSimulating ? 'scale-105 filter brightness-110' : 'scale-100'
              }`}
            />
            {/* Vignette Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070d18] via-transparent to-[#070d18]/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#070d18]/30 via-transparent to-[#070d18]/30" />

            {/* Glowing High Load Warning Badge floating over the scene matching reference */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-950/85 backdrop-blur-md border border-rose-500/70 text-rose-200 text-xs font-semibold shadow-[0_0_20px_rgba(244,63,94,0.6)] animate-pulse">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>{simResult.statusBadge}</span>
            </div>

            {/* CT Scan Diagnostic Active Tag on top left */}
            <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-cyan-950/75 backdrop-blur-md border border-cyan-500/40 text-cyan-300 text-[11px] font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>CT TRAUMA SCANNER • BAY 1 ACTIVE</span>
            </div>

            {/* Simulation Active Overlay Effect */}
            {isSimulating && (
              <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-[2px] flex items-center justify-center z-20">
                <div className="px-5 py-2.5 rounded-xl bg-slate-950/90 border border-cyan-400 text-cyan-300 text-xs font-mono flex items-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.8)]">
                  <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>CALCULATING EMERGENCY RIPPLE CONGESTION...</span>
                </div>
              </div>
            )}
          </div>

          {/* Hospital Domino Effect Panel matching reference image */}
          <div className="bg-[#0b1626]/85 backdrop-blur-xl border border-cyan-500/25 rounded-2xl p-4 shadow-lg">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Hospital Domino Effect</span>
              <span className="text-[11px] text-cyan-400 font-normal">Dynamic Cascade Spread</span>
            </h4>

            {/* Flow cards connected by arrows matching reference */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 items-center">
              {currentScenario.dominoEffect.map((node, index) => {
                const isCritical = node.status === 'critical';
                const isWarning = node.status === 'warning';
                return (
                  <div key={node.id} className="relative flex items-center">
                    <div
                      className={`w-full py-2.5 px-3 rounded-xl text-center text-xs font-semibold transition-all duration-300 cursor-pointer ${
                        isCritical
                          ? 'bg-rose-950/80 border border-rose-500 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                          : isWarning
                          ? 'bg-amber-950/60 border border-amber-500 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                          : 'bg-slate-900/70 border border-slate-700 text-slate-300'
                      }`}
                      title={node.cause}
                    >
                      <div className="truncate">{node.label}</div>
                    </div>

                    {/* Connecting Arrow between nodes */}
                    {index < currentScenario.dominoEffect.length - 1 && (
                      <div className="hidden sm:block absolute -right-2 z-10 text-slate-500 font-bold text-xs">
                        →
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Resource Status matching reference image */}
        <div className="lg:col-span-3 flex flex-col bg-[#0b1626]/85 backdrop-blur-xl border border-cyan-500/25 rounded-2xl p-5 shadow-[0_0_25px_rgba(0,0,0,0.5)]">
          <h3 className="text-sm font-semibold text-white tracking-tight mb-4 flex items-center justify-between">
            <span>Live Resource Status</span>
            <span className="text-xs text-slate-400 font-mono">Live Telemetry</span>
          </h3>

          <div className="space-y-4">
            {/* GF Emergency Beds */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                    GF
                  </span>
                  <span>Emergency Beds</span>
                </div>
                <div className="font-mono text-slate-200 text-xs">
                  <span className="font-bold text-white">{simResult.erBedsOccupied}</span>
                  <span className="text-slate-400"> / {simResult.erBedsTotal}</span>
                  <span className="ml-2 text-amber-400 text-[11px] font-semibold">{erPercent}%</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                  style={{ width: `${erPercent}%` }}
                />
              </div>
            </div>

            {/* 1F ICU Beds */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-950 border border-rose-500/40 text-rose-300">
                    1F
                  </span>
                  <span>ICU Beds</span>
                </div>
                <div className="font-mono text-slate-200 text-xs">
                  <span className="font-bold text-white">{simResult.icuBedsOccupied}</span>
                  <span className="text-slate-400"> / {simResult.icuBedsTotal}</span>
                  <span className="ml-2 text-rose-400 text-[11px] font-semibold">{icuPercent}%</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-red-600 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                  style={{ width: `${icuPercent}%` }}
                />
              </div>
            </div>

            {/* 1F OT Rooms */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-950 border border-rose-500/40 text-rose-300">
                    1F
                  </span>
                  <span>OT Rooms</span>
                </div>
                <div className="font-mono text-slate-200 text-xs">
                  <span className="font-bold text-white">{simResult.otRoomsOccupied}</span>
                  <span className="text-slate-400"> / {simResult.otRoomsTotal}</span>
                  <span className="ml-2 text-rose-400 text-[11px] font-semibold">{otPercent}%</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-rose-600 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                  style={{ width: `${otPercent}%` }}
                />
              </div>
            </div>

            {/* Staff (On Duty) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Staff (On Duty)</span>
                </div>
                <div className="font-mono text-slate-200 text-xs">
                  <span className="font-bold text-white">{simResult.staffOnDuty}</span>
                  <span className="text-slate-400"> / {simResult.staffTotal}</span>
                  <span className="ml-2 text-emerald-400 text-[11px] font-semibold">{staffPercent}%</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                  style={{ width: `${staffPercent}%` }}
                />
              </div>
            </div>

            {/* Blood Units */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Droplet className="w-4 h-4 text-amber-400" />
                  <span>Blood Units</span>
                </div>
                <div className="font-mono text-slate-200 text-xs">
                  <span className="font-bold text-white">{simResult.bloodUnits}</span>
                  <span className="text-slate-400"> / {simResult.bloodTotal}</span>
                  <span className="ml-2 text-amber-400 text-[11px] font-semibold">{bloodPercent}%</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                  style={{ width: `${bloodPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Summary Bar matching reference image */}
      <div className="px-6 max-w-[1600px] mx-auto w-full">
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#0b1626]/85 backdrop-blur-xl border border-cyan-500/25 shadow-lg">
          {/* Metrics Trio */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-10">
            {/* Patients Arrived */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-400">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-lg font-bold font-mono text-white leading-tight">
                  {simResult.patientsArrived}
                </div>
                <div className="text-xs text-slate-400">Patients Arrived</div>
              </div>
            </div>

            {/* Avg Waiting Time */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-lg font-bold font-mono text-white leading-tight">
                  {simResult.avgWaitMinutes} min
                </div>
                <div className="text-xs text-slate-400">Avg. Waiting Time</div>
              </div>
            </div>

            {/* Critical Bottlenecks */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-lg font-bold font-mono text-rose-400 leading-tight">
                  {simResult.criticalBottlenecks}
                </div>
                <div className="text-xs text-slate-400">Critical Bottlenecks</div>
              </div>
            </div>
          </div>

          {/* View Analysis Button */}
          <button
            onClick={() => setShowAnalysisModal(true)}
            className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-semibold text-cyan-300 bg-slate-900/80 hover:bg-slate-800/90 border border-cyan-500/50 hover:border-cyan-400 hover:text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-200 cursor-pointer"
          >
            <span>View Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Analysis & Digital Twin Testing Modal */}
      {showAnalysisModal && (
        <AnalysisModal
          scenario={currentScenario}
          simResult={simResult}
          interventions={interventions}
          onToggleIntervention={handleToggleIntervention}
          onResetInterventions={handleResetInterventions}
          onClose={() => setShowAnalysisModal(false)}
        />
      )}
    </div>
  );
};

