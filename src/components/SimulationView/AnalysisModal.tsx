import React from 'react';
import { X, TrendingDown, Clock, Users, ShieldAlert, CheckCircle, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { EmergencyScenario } from '../../types';
import { InterventionOptions, SimulationResult } from '../../utils/simulationEngine';

interface AnalysisModalProps {
  scenario: EmergencyScenario;
  simResult: SimulationResult;
  interventions: InterventionOptions;
  onToggleIntervention: (key: keyof InterventionOptions) => void;
  onResetInterventions: () => void;
  onClose: () => void;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({
  scenario,
  simResult,
  interventions,
  onToggleIntervention,
  onResetInterventions,
  onClose,
}) => {
  // Baseline vs Simulated delta
  const waitDelta = simResult.avgWaitMinutes - scenario.avgWaitMinutes;
  const bottleneckDelta = simResult.criticalBottlenecks - scenario.criticalBottlenecks;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#091322] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.35)] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-cyan-950/90 to-slate-900 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Crisis Bottleneck Analysis & Digital Twin Testing
              </h2>
              <p className="text-xs text-slate-400">
                Simulated Scenario: <span className="text-cyan-300 font-medium">{scenario.title}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Comparison Cards: Baseline vs Current Simulation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Users className="w-4 h-4 text-cyan-400" />
                Simulated Patient Inflow
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {simResult.patientsArrived}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Baseline: {scenario.patientsArrived} patients
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Clock className="w-4 h-4 text-cyan-400" />
                Avg. Waiting Time
              </div>
              <div className="text-2xl font-bold font-mono text-white flex items-baseline gap-2">
                <span>{simResult.avgWaitMinutes} min</span>
                {waitDelta < 0 && (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center">
                    <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                    {waitDelta} min
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Baseline: {scenario.avgWaitMinutes} min
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Active Bottlenecks
              </div>
              <div className="text-2xl font-bold font-mono text-white flex items-baseline gap-2">
                <span>{simResult.criticalBottlenecks}</span>
                {bottleneckDelta < 0 && (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center">
                    {bottleneckDelta} resolved
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Baseline: {scenario.criticalBottlenecks}
              </div>
            </div>
          </div>

          {/* Test Interventions Section */}
          <div className="p-5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  Test Hospital Interventions
                </h3>
                <p className="text-xs text-slate-400">
                  Toggle simulated interventions to evaluate bottleneck relief before implementing in real life.
                </p>
              </div>
              <button
                onClick={onResetInterventions}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-white bg-slate-800/60 border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>

            <div className="space-y-3">
              {/* Intervention 1 */}
              <div
                onClick={() => onToggleIntervention('extraStaff')}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  interventions.extraStaff
                    ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border ${
                      interventions.extraStaff
                        ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                        : 'border-slate-600'
                    }`}
                  >
                    {interventions.extraStaff && <CheckCircle className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">
                      Deploy Rapid Response Nursing & Trauma Staff (+15 Clinicians)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Cuts emergency intake delays by 30% and accelerates bed turnover.
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono text-cyan-300 font-semibold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40">
                  -30% Wait
                </span>
              </div>

              {/* Intervention 2 */}
              <div
                onClick={() => onToggleIntervention('surgeIcuBeds')}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  interventions.surgeIcuBeds
                    ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border ${
                      interventions.surgeIcuBeds
                        ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                        : 'border-slate-600'
                    }`}
                  >
                    {interventions.surgeIcuBeds && <CheckCircle className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">
                      Activate Modular Surge ICU Wing (+8 Ventilated Beds)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Unblocks surgical recovery backlog by expanding critical care capacity.
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono text-cyan-300 font-semibold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40">
                  +8 ICU Beds
                </span>
              </div>

              {/* Intervention 3 */}
              <div
                onClick={() => onToggleIntervention('divertNonCritical')}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  interventions.divertNonCritical
                    ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border ${
                      interventions.divertNonCritical
                        ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                        : 'border-slate-600'
                    }`}
                  >
                    {interventions.divertNonCritical && <CheckCircle className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">
                      Intelligent Ambulance Diversion (Reroute 28% Non-Trauma Patients)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Re-channels green/yellow triage cases to partner urgent care facilities.
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono text-cyan-300 font-semibold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40">
                  -28% Inflow
                </span>
              </div>
            </div>
          </div>

          {/* Root-Cause Domino Bottlenecks */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              Detected Root-Cause Ripple Effects
            </h4>
            <div className="space-y-2">
              {scenario.dominoEffect.map((node) => (
                <div
                  key={node.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800"
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                      node.status === 'critical'
                        ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                        : node.status === 'warning'
                        ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <div>
                    <div className="text-xs font-semibold text-white">{node.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{node.cause}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            * All values are synthetic mathematical simulations for emergency readiness testing.
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md transition-all cursor-pointer"
          >
            Apply to Simulation
          </button>
        </div>
      </div>
    </div>
  );
};

