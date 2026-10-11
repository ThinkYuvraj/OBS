import React from 'react';
import { Plus, Tv } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  isConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate }) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800/80 bg-[#070b14]/90 backdrop-blur-md sticky top-0 z-40 text-slate-100 shadow-lg shadow-black/40">
      {/* Zone 1: Single text element wordmark */}
      <div
        className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0"
        onClick={() => onNavigate('dashboard')}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 border border-cyan-400/30 flex items-center justify-center text-white font-black text-sm tracking-wider shadow-lg shadow-cyan-500/25">
          <Tv className="w-4 h-4" />
        </div>
        <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-200 to-sky-400 bg-clip-text text-transparent select-none">
          LiveStream ScoreBug
        </span>
      </div>

      {/* Zone 2: 5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`transition-colors hover:text-cyan-300 cursor-pointer whitespace-nowrap shrink-0 ${
            currentTab === 'dashboard' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onNavigate('scoring')}
          className={`transition-colors hover:text-cyan-300 cursor-pointer whitespace-nowrap shrink-0 ${
            currentTab === 'scoring' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Cricket Console
        </button>
        <button
          onClick={() => onNavigate('multi-scoring')}
          className={`transition-colors hover:text-cyan-300 cursor-pointer whitespace-nowrap shrink-0 ${
            currentTab === 'multi-scoring' || currentTab === 'football-scoring'
              ? 'text-cyan-400 font-semibold'
              : ''
          }`}
        >
          Multi-Sport Console
        </button>
        <button
          onClick={() => onNavigate('overlay-control')}
          className={`transition-colors hover:text-cyan-300 cursor-pointer whitespace-nowrap shrink-0 ${
            currentTab === 'overlay-control' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Overlay Studio
        </button>
        <button
          onClick={() => onNavigate('architecture')}
          className={`transition-colors hover:text-cyan-300 cursor-pointer whitespace-nowrap shrink-0 ${
            currentTab === 'architecture' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          3-Tier Architecture
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onNavigate('create')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg transition-all shadow-md shadow-cyan-500/20 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Match</span>
        </button>
      </div>
    </header>
  );
};
