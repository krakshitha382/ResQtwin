import React from 'react';
import { X, Activity, ShieldCheck, Cpu, Database, HeartPulse } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#091322] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.35)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-cyan-950/90 to-slate-900 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
              <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                ResQ Twin
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono">
                  v2.4
                </span>
              </h2>
              <p className="text-xs text-slate-400">Simulate. Coordinate. Save Lives.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            <strong className="text-white">ResQ Twin</strong> is a real-time medical digital twin platform designed to stress-test hospital capacity, detect cross-departmental crisis bottlenecks, and optimize regional emergency ambulance dispatch before real-world catastrophic failure occurs.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Domino Effect Engine</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Transparent physiological and logistical cascade modeling tracking ER to OT, ICU, and Ward pressure.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
                <Database className="w-4 h-4" />
                <span>Synthetic Telemetry</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Fictional synthetic healthcare records modeled across 250 beds and 3 network hospitals.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200">
            <span className="font-semibold">Hackathon Specification Note:</span> Fictional data and simulated estimates are strictly used for disaster readiness demonstration without real-time patient or hospital integration.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-900/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

