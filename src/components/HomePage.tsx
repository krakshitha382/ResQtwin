import React from 'react';
import { Building2, BedDouble, Ambulance, ArrowRight, Play, ShieldAlert, Cpu } from 'lucide-react';
import { PageId } from '../types';
import heroBgImage from '../assets/images/hero_hospital_exterior.jpg';

interface HomePageProps {
  onNavigate: (page: PageId) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between pt-16 overflow-hidden select-none bg-[#070d18]">
      {/* Background Hero Image with Deep Navy & Cyan Lighting Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBgImage}
          alt="ResQ Twin Hospital Exterior at Dusk"
          className="w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.08] scale-100"
        />
        {/* Cinematic Vignette, Gradient overlays matching the reference */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070d18]/95 via-[#070d18]/70 to-transparent w-full md:w-3/4" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070d18] via-transparent to-[#070d18]/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#070d18]/30 to-[#070d18]/80" />
        
        {/* Subtle animated light rays / pulse */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col justify-center px-8 sm:px-14 lg:px-20 max-w-4xl py-12">
        {/* System Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-6 w-fit backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.25)]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>HOSPITAL DIGITAL TWIN SYSTEM v2.4</span>
        </div>

        {/* Heading matching reference image */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] mb-6 drop-shadow-md">
          Test the Crisis <br />
          Before It Becomes <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-200 drop-shadow-[0_0_25px_rgba(6,182,212,0.8)]">
            Reality.
          </span>
        </h1>

        {/* Supporting Subtitle */}
        <p className="text-base sm:text-lg text-slate-300/90 leading-relaxed max-w-xl mb-10 drop-shadow">
          Simulate medical emergencies, discover hospital bottlenecks and test smarter emergency coordination.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => onNavigate('hospital')}
            className="group flex items-center gap-3 px-7 py-3.5 rounded-full font-semibold text-white bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:shadow-[0_0_40px_rgba(6,182,212,0.85)] hover:scale-105 active:scale-95 transition-all duration-300 border border-cyan-300/40 text-sm sm:text-base cursor-pointer"
          >
            <span>Explore Hospital</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200 text-white" />
          </button>

          <button
            onClick={() => onNavigate('simulation')}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-full font-medium text-slate-200 bg-slate-900/60 hover:bg-slate-800/80 backdrop-blur-md border border-slate-700/60 hover:border-cyan-500/50 hover:text-white shadow-lg transition-all duration-200 text-sm sm:text-base cursor-pointer"
          >
            <Play className="w-4 h-4 text-cyan-400 fill-cyan-400/40" />
            <span>Run Simulation</span>
          </button>
        </div>
      </main>

      {/* Bottom Statistics Cards matching reference image */}
      <footer className="relative z-10 px-8 sm:px-14 lg:px-20 pb-10">
        <div className="flex flex-wrap items-center gap-4">
          {/* Card 1: 3 Hospitals */}
          <div 
            onClick={() => onNavigate('network')}
            className="flex items-center gap-3.5 px-5 py-3 rounded-2xl bg-[#0b1626]/75 border border-cyan-500/20 backdrop-blur-md hover:border-cyan-400/50 hover:bg-[#0f1f38]/85 transition-all duration-300 cursor-pointer shadow-lg group"
          >
            <div className="p-2 rounded-xl bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="text-xl font-bold text-white tracking-tight">3</div>
              <div className="text-xs text-slate-400 font-medium">Hospitals</div>
            </div>
          </div>

          {/* Card 2: 250 Total Beds */}
          <div 
            onClick={() => onNavigate('hospital')}
            className="flex items-center gap-3.5 px-5 py-3 rounded-2xl bg-[#0b1626]/75 border border-cyan-500/20 backdrop-blur-md hover:border-cyan-400/50 hover:bg-[#0f1f38]/85 transition-all duration-300 cursor-pointer shadow-lg group"
          >
            <div className="p-2 rounded-xl bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 group-hover:scale-110 transition-transform">
              <BedDouble className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="text-xl font-bold text-white tracking-tight">250</div>
              <div className="text-xs text-slate-400 font-medium">Total Beds</div>
            </div>
          </div>

          {/* Card 3: 7 Emergency Scenarios */}
          <div 
            onClick={() => onNavigate('simulation')}
            className="flex items-center gap-3.5 px-5 py-3 rounded-2xl bg-[#0b1626]/75 border border-cyan-500/20 backdrop-blur-md hover:border-cyan-400/50 hover:bg-[#0f1f38]/85 transition-all duration-300 cursor-pointer shadow-lg group"
          >
            <div className="p-2 rounded-xl bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 group-hover:scale-110 transition-transform">
              <Ambulance className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="text-xl font-bold text-white tracking-tight">7</div>
              <div className="text-xs text-slate-400 font-medium">Emergency Scenarios</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

