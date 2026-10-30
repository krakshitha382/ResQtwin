import React from 'react';
import { X, Heart, Shield, Check, Activity, Bed, Stethoscope, AlertTriangle } from 'lucide-react';
import { DepartmentData } from '../../types';

interface DepartmentModalProps {
  department: DepartmentData | null;
  onClose: () => void;
}

export const DepartmentModal: React.FC<DepartmentModalProps> = ({
  department,
  onClose,
}) => {
  if (!department) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#091322] border border-cyan-500/40 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.35)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-cyan-950/80 to-slate-900 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {department.name}
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 font-mono">
                  {department.floorId}
                </span>
              </h2>
              <p className="text-xs text-slate-400">Live Clinical Telemetry & Resource Distribution</p>
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
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Department Description */}
          <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-3.5 rounded-xl border border-slate-800">
            {department.description}
          </p>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                <Bed className="w-3.5 h-3.5 text-cyan-400" />
                Bed Occupancy
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {department.bedsOccupied} / {department.totalBeds}
              </div>
              <div className="text-[11px] text-cyan-400 mt-1">
                {department.totalBeds - department.bedsOccupied} beds currently vacant
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
                Clinical Staff
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {department.staffCount} / {department.totalStaff}
              </div>
              <div className="text-[11px] text-emerald-400 mt-1">
                Nurse-to-Patient 1:2.5
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                Acuity Status
              </div>
              <div className="text-xl font-bold text-emerald-400 font-mono">
                {department.status}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Surge capacity ready
              </div>
            </div>
          </div>

          {/* Detailed Bed Bay Matrix */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Bed Status Matrix ({department.totalBeds} Units)
            </h4>
            <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
              {Array.from({ length: department.totalBeds }).map((_, i) => {
                const isOccupied = i < department.bedsOccupied;
                return (
                  <div
                    key={i}
                    className={`h-9 rounded-lg flex flex-col items-center justify-center text-[10px] font-mono border transition-all ${
                      isOccupied
                        ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                        : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                    }`}
                    title={`Bed ${i + 1}: ${isOccupied ? 'Occupied' : 'Vacant'}`}
                  >
                    <span>#{i + 1}</span>
                    <span className="text-[8px] opacity-75">{isOccupied ? 'OCC' : 'VAC'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Certified Capabilities */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              Available Clinical Capabilities
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {department.facilities.map((fac, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-200"
                >
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{fac}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-900/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close Telemetry
          </button>
        </div>
      </div>
    </div>
  );
};

