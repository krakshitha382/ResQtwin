import React from 'react';
import { Activity, Sun, Clock } from 'lucide-react';
import { PageId } from '../types';

interface NavbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenAbout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenAbout,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#070d18]/85 backdrop-blur-md border-b border-cyan-500/15 px-6 flex items-center justify-between transition-colors duration-300">
      {/* Left: Brand Logo & Title */}
      <div 
        onClick={() => onNavigate('home')}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-950/60 border border-cyan-500/40 group-hover:border-cyan-400 transition-all duration-300 shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)]">
          <Activity className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300 animate-pulse" />
          <div className="absolute inset-0 rounded-lg bg-cyan-400/10 blur-sm"></div>
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 font-sans">
            ResQ <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.7)]">Twin</span>
          </span>
        </div>
      </div>

      {/* Middle: Navigation Tabs matching the reference image layout */}
      <nav className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => onNavigate('home')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            currentPage === 'home'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          Home
        </button>

        <button
          onClick={() => onNavigate('hospital')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            currentPage === 'hospital'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          {currentPage === 'home' ? 'Explore' : 'Hospital View'}
        </button>

        <button
          onClick={() => onNavigate('simulation')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            currentPage === 'simulation'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          Simulation
        </button>

        <button
          onClick={() => onNavigate('network')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            currentPage === 'network'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          {currentPage === 'network' ? 'Hospital Network' : 'Network'}
        </button>

        <button
          onClick={onOpenAbout}
          className="px-4 py-1.5 rounded-full text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all duration-200"
        >
          About
        </button>
        <button
  onClick={() => onNavigate('scenario-comparison')}
  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
    currentPage === 'scenario-comparison'
      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
  }`}
>
  Scenario Comparison
</button>
      </nav>

      {/* Right side: On Home page shows 'Get Started ->', on screens 2, 3, 4 shows Weather & Clock */}
      <div className="flex items-center gap-4">
        {currentPage === 'home' ? (
          <button
            onClick={() => onNavigate('hospital')}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_25px_rgba(6,182,212,0.8)] hover:scale-105 active:scale-95 transition-all duration-200 border border-cyan-300/40"
          >
            Get Started
            <span className="text-base leading-none">→</span>
          </button>
        ) : (
          <div className="flex items-center gap-4 text-xs text-slate-300 font-mono bg-slate-900/60 px-3.5 py-1.5 rounded-full border border-slate-700/50">
            <div className="flex items-center gap-1.5 text-amber-300">
              <Sun className="w-4 h-4 text-amber-400 animate-[spin_12s_linear_infinite]" />
              <span className="font-semibold text-slate-200">24°C</span>
              <span className="text-slate-400">Bengaluru</span>
            </div>
            <div className="w-[1px] h-3.5 bg-slate-700" />
            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>12:45 PM</span>
              <span className="text-slate-400 hidden md:inline">28 Jan 2026</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

