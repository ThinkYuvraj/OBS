import React from 'react';
import { KabaddiMatchState, OverlayConfig, Team } from '../../types/sports';

interface KabaddiScoreBugProps {
  teamA: Team;
  teamB: Team;
  state: KabaddiMatchState;
  config: OverlayConfig;
  tournamentName?: string;
}

export const KabaddiScoreBug: React.FC<KabaddiScoreBugProps> = ({
  teamA,
  teamB,
  state,
  config,
  tournamentName = 'PRO KABADDI LEAGUE',
}) => {
  const homeColor = teamA.color || '#F97316';
  const awayColor = teamB.color || '#15803D';
  const isRaidWarning = state.raidClock <= 5 && state.raidClock > 0;

  return (
    <div
      className="inline-flex flex-col select-none drop-shadow-2xl transition-all duration-300"
      style={{
        transform: `scale(${config.scale || 1})`,
        transformOrigin: 'top left',
        opacity: config.opacity || 1,
      }}
    >
      {/* Top Banner: Tournament & Half */}
      <div className="flex items-center justify-between px-3 py-0.5 bg-[#060c18] border border-cyan-500/30 border-b-0 rounded-t text-[10px] uppercase font-mono font-bold tracking-wider text-cyan-400">
        <span className="truncate max-w-[190px]">{tournamentName}</span>
        <div className="flex items-center gap-2">
          {state.isSuperTackleOn && (
            <span className="px-1.5 py-0.5 bg-amber-500 text-black text-[9px] font-black rounded-sm animate-pulse">
              SUPER TACKLE ON
            </span>
          )}
          <span className="text-slate-300">{state.half.toUpperCase()} • {state.minute}'</span>
        </div>
      </div>

      {/* Main Score Bar */}
      <div className="flex items-stretch rounded-b overflow-hidden shadow-2xl border border-slate-700/80 bg-[#070b14]/95 backdrop-blur-md">
        {/* Team A (Home) */}
        <div className="flex items-center">
          <div className="w-1.5 self-stretch shrink-0" style={{ backgroundColor: homeColor }} />
          <div className="px-3 py-2 flex items-center gap-2">
            {teamA.logoUrl && (
              <img src={teamA.logoUrl} alt={teamA.shortName} className="w-6 h-6 object-contain rounded" />
            )}
            <div className="flex flex-col">
              <span className="font-extrabold text-[17px] tracking-wider text-white">
                {teamA.shortName || 'HOME'}
              </span>
              <span className="text-[10px] font-mono text-cyan-300">
                {state.homeActivePlayers}/7 ON MAT
              </span>
            </div>
            {state.raidingTeam === 'home' && (
              <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 text-[9px] font-bold rounded border border-cyan-500/40 animate-pulse">
                RAID
              </span>
            )}
          </div>
          <div className="w-12 py-2 flex items-center justify-center font-black text-[24px] font-mono tabular-nums text-white bg-slate-900/60 border-l border-slate-800">
            {state.homeScore}
          </div>
        </div>

        {/* Center: Raid Clock */}
        <div className="px-3 py-2 flex flex-col items-center justify-center bg-black/50 border-x border-slate-800 min-w-[70px]">
          <span className="text-[9px] font-mono uppercase text-slate-400 tracking-wider">
            RAID CLOCK
          </span>
          <span
            className={`font-mono tabular-nums font-black text-[22px] tracking-tight ${
              isRaidWarning ? 'text-rose-500 animate-ping' : 'text-amber-400'
            }`}
          >
            {state.raidClock}s
          </span>
        </div>

        {/* Team B (Away) */}
        <div className="flex items-center">
          <div className="w-12 py-2 flex items-center justify-center font-black text-[24px] font-mono tabular-nums text-white bg-slate-900/60 border-r border-slate-800">
            {state.awayScore}
          </div>
          <div className="px-3 py-2 flex items-center gap-2">
            {state.raidingTeam === 'away' && (
              <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 text-[9px] font-bold rounded border border-cyan-500/40 animate-pulse">
                RAID
              </span>
            )}
            <div className="flex flex-col items-end">
              <span className="font-extrabold text-[17px] tracking-wider text-white">
                {teamB.shortName || 'AWAY'}
              </span>
              <span className="text-[10px] font-mono text-emerald-300">
                {state.awayActivePlayers}/7 ON MAT
              </span>
            </div>
            {teamB.logoUrl && (
              <img src={teamB.logoUrl} alt={teamB.shortName} className="w-6 h-6 object-contain rounded" />
            )}
          </div>
          <div className="w-1.5 self-stretch shrink-0" style={{ backgroundColor: awayColor }} />
        </div>
      </div>

      {/* Sub-ticker: Last Play Details */}
      {state.lastPlay && (
        <div className="mt-1 px-2.5 py-0.5 bg-black/80 rounded border border-cyan-500/20 text-[11px] font-medium text-slate-300 flex items-center justify-between">
          <span className="truncate max-w-[340px] text-cyan-200">{state.lastPlay}</span>
          <span className="text-[9px] text-slate-500 uppercase font-mono ml-2">MarketinGlu OBS</span>
        </div>
      )}
    </div>
  );
};
