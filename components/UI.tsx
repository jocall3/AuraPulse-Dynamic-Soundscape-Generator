
import React from 'react';

export const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; icon?: string }> = ({ label, isActive, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-t-xl transition-all duration-300 border-b-2 
      ${isActive 
        ? 'bg-slate-800 text-cyan-400 border-cyan-400 shadow-[0_-4px_10px_-4px_rgba(34,211,238,0.2)]' 
        : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/50'}`}
  >
    {icon && <i className={`fas ${icon}`}></i>}
    {label}
  </button>
);

export const InfoCard: React.FC<{ title: string; value: string | number; unit?: string; icon: string; colorClass?: string }> = ({ title, value, unit, icon, colorClass = 'text-cyan-400' }) => (
  <div className="p-5 bg-slate-800/80 border border-slate-700/50 rounded-2xl backdrop-blur-sm shadow-xl hover:shadow-cyan-900/10 transition-shadow">
    <div className="flex justify-between items-start mb-2">
      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</span>
      <i className={`fas ${icon} ${colorClass} text-lg`}></i>
    </div>
    <div className="flex items-baseline gap-1">
      <span className={`text-2xl font-bold ${colorClass}`}>{value}</span>
      {unit && <span className="text-sm font-medium text-slate-500">{unit}</span>}
    </div>
  </div>
);

export const Slider: React.FC<{ label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }> = ({ label, value, onChange, min = 0, max = 1, step = 0.01 }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
      <span>{label}</span>
      <span className="text-cyan-400">{(value * 100).toFixed(0)}%</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
    />
  </div>
);

export const IconButton: React.FC<{ icon: string; onClick: () => void; active?: boolean; danger?: boolean }> = ({ icon, onClick, active, danger }) => (
  <button
    onClick={onClick}
    className={`p-2.5 rounded-xl transition-all duration-200 border 
      ${danger 
        ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' 
        : active 
          ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' 
          : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500 hover:text-white'}`}
  >
    <i className={`fas ${icon}`}></i>
  </button>
);
