import React from 'react';
import { X, BedDouble, Users, CheckCircle2, ArrowRight } from 'lucide-react';
import { DepartmentData } from '../../types';
import maternityImg from '../../assets/images/maternity_ward_interior.jpg';

interface DepartmentDetailsPanelProps {
  department: DepartmentData;
  onClose: () => void;
  onViewDetails: (dept: DepartmentData) => void;
}

export const DepartmentDetailsPanel: React.FC<DepartmentDetailsPanelProps> = ({
  department,
  onClose,
  onViewDetails,
}) => {
  const bedPercent = Math.round((department.bedsOccupied / department.totalBeds) * 100);
  const staffPercent = Math.round((department.staffCount / department.totalStaff) * 100);

  return (
    <aside className="w-80 md:w-88 flex flex-col bg-[#0b1626]/85 backdrop-blur-xl border border-cyan-500/25 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-500/20">
        <h3 className="text-base font-semibold text-white tracking-tight">
          {department.name}
        </h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/50 transition-colors"
          title="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Preview Image with Warm Ambient Glow */}
      <div className="relative w-full h-36 overflow-hidden bg-slate-900 border-b border-cyan-500/15">
        <img
          src={maternityImg}
          alt={department.name}
          className="w-full h-full object-cover filter brightness-95 contrast-105 hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1626] via-transparent to-transparent opacity-80" />
        
        {/* Subtle floor badge */}
        <div className="absolute bottom-2 left-3 px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950/80 border border-cyan-400/40 text-cyan-300">
          {department.floorId} • {department.shortName}
        </div>
      </div>

      {/* Metrics Section */}
      <div className="p-5 space-y-4">
        {/* Beds Stat Row */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1.5 text-slate-300">
              <BedDouble className="w-3.5 h-3.5 text-cyan-400" />
              <span>Beds</span>
            </div>
            <div className="font-mono font-medium text-slate-200">
              <span className="text-white font-bold">{department.bedsOccupied}</span>
              <span className="text-slate-400">/{department.totalBeds}</span>
              <span className="ml-2 text-cyan-400 text-[11px]">{bedPercent}%</span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
              style={{ width: `${bedPercent}%` }}
            />
          </div>
        </div>

        {/* Staff Stat Row */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>Staff</span>
            </div>
            <div className="font-mono font-medium text-slate-200">
              <span className="text-white font-bold">{department.staffCount}</span>
              <span className="text-slate-400">/{department.totalStaff}</span>
              <span className="ml-2 text-sky-400 text-[11px]">{staffPercent}%</span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]"
              style={{ width: `${staffPercent}%` }}
            />
          </div>
        </div>

        {/* Status Row matching reference */}
        <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
          <span className="text-slate-400">Status</span>
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse" />
            <span>{department.status}</span>
          </div>
        </div>

        {/* Facilities Checklist */}
        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Facilities
          </h4>
          <div className="space-y-1.5">
            {department.facilities.map((facility, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{facility}</span>
              </div>
            ))}
          </div>
        </div>

        {/* View Details Button */}
        <button
          onClick={() => onViewDetails(department)}
          className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_20px_rgba(6,182,212,0.7)] transition-all duration-200 cursor-pointer"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};

