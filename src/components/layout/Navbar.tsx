import React from 'react';
import { Plus, Radio, Tv } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  isConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate, isConnected = true }) => {
  return (
    <header className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-40 text-slate-100">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('dashboard')}>
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm tracking-wider shadow-lg shadow-blue-500/20">
          <Tv className="w-4 h-4" />
        </div>
        <span className="text-base font-bold tracking-tight text-white select-none">
          LiveStream ScoreBug
        </span>
      </div>

      {/* Zone 2: 4-6 clean text navigation links */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`transition-colors hover:text-white cursor-pointer ${
            currentTab === 'dashboard' ? 'text-white font-semibold' : ''
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onNavigate('scoring')}
          className={`transition-colors hover:text-white cursor-pointer ${
            currentTab === 'scoring' ? 'text-white font-semibold' : ''
          }`}
        >
          Cricket Scoring
        </button>
        <button
          onClick={() => onNavigate('football-scoring')}
          className={`transition-colors hover:text-white cursor-pointer ${
            currentTab === 'football-scoring' ? 'text-white font-semibold' : ''
          }`}
        >
          Football Scoring
        </button>
        <button
          onClick={() => onNavigate('overlay-control')}
          className={`transition-colors hover:text-white cursor-pointer ${
            currentTab === 'overlay-control' ? 'text-white font-semibold' : ''
          }`}
        >
          Overlay Studio
        </button>
        <button
          onClick={() => onNavigate('obs-guide')}
          className={`transition-colors hover:text-white cursor-pointer ${
            currentTab === 'obs-guide' ? 'text-white font-semibold' : ''
          }`}
        >
          OBS Guide
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <span className="text-[11px] font-medium">
            {isConnected ? 'LIVE ENGINE' : 'RECONNECTING'}
          </span>
        </div>

        <button
          onClick={() => onNavigate('create')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Match</span>
        </button>
      </div>
    </header>
  );
};
