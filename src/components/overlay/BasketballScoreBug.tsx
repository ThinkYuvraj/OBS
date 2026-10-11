import React from 'react';
import { BasketballMatchState, OverlayConfig, Team } from '../../types/sports';

interface BasketballScoreBugProps {
  teamA: Team;
  teamB: Team;
  state: BasketballMatchState;
  config: OverlayConfig;
  tournamentName?: string;
}

export const BasketballScoreBug: React.FC<BasketballScoreBugProps> = ({
  teamA,
  teamB,
  state,
  config,
  tournamentName = 'NBA BROADCAST',
}) => {
  const homeColor = teamA.color || '#EAB308';
  const awayColor = teamB.color || '#2563EB';
  const quarterLabel = state.quarter === 'OT' ? 'OT' : `Q${state.quarter}`;
  const isLowShotClock = state.shotClock <= 5;

  return (
    <div
      className="inline-flex flex-col select-none drop-shadow-2xl transition-all duration-300"
      style={{
        transform: `scale(${config.scale || 1})`,
        transformOrigin: 'bottom center',
        opacity: config.opacity || 1,
      }}
    >
      {/* Top Micro Header: Tournament & Possession */}
      <div className="flex items-center justify-between px-3.5 py-1 bg-slate-950/95 border-t border-x border-slate-700/80 rounded-t-md text-[10px] font-bold tracking-widest uppercase">
        <span className="text-amber-400 font-mono">{tournamentName}</span>
        <div className="flex items-center gap-3 text-slate-300 font-mono">
          <span>
            FOULS: {teamA.shortName} {state.homeFouls} • {teamB.shortName} {state.awayFouls}
          </span>
          {config.showSponsor && config.sponsorName && (
            <>
              <span className="text-slate-600">|</span>
              <span className="text-blue-400">{config.sponsorName}</span>
            </>
          )}
        </div>
      </div>

      {/* Main NBA Broadcast Scorebar */}
      <div className="flex items-stretch bg-slate-950 text-white border border-slate-700 shadow-2xl rounded-b-md overflow-hidden min-w-[620px]">
        {/* Home Team Section */}
        <div className="flex items-stretch flex-1 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
          <div className="w-2 self-stretch shrink-0" style={{ backgroundColor: homeColor }} />
          <div className="flex flex-col justify-center px-4 py-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-wider text-white">
                {teamA.shortName || 'HOME'}
              </span>
              {state.possession === 'home' && (
                <span className="text-[10px] text-amber-400 font-mono font-extrabold">◀ POSS</span>
              )}
              {state.homeFouls >= 5 && (
                <span className="px-1.5 py-0.2 bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[9px] font-mono font-bold rounded-sm">
                  BONUS
                </span>
              )}
            </div>
            {/* Timeout bars */}
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: 7 }).map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1 w-3 rounded-xs ${
                    idx < state.homeTimeouts ? 'bg-amber-400' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Home Score */}
          <div className="px-5 flex items-center justify-center bg-slate-900/90 border-l border-slate-800 font-mono tabular-nums font-black text-3xl text-white min-w-[76px]">
            {state.homeScore}
          </div>
        </div>

        {/* Center Divider */}
        <div className="w-[2px] bg-slate-700" />

        {/* Away Team Section */}
        <div className="flex items-stretch flex-1 bg-gradient-to-l from-slate-950 via-slate-900 to-slate-950">
          {/* Away Score */}
          <div className="px-5 flex items-center justify-center bg-slate-900/90 border-r border-slate-800 font-mono tabular-nums font-black text-3xl text-white min-w-[76px]">
            {state.awayScore}
          </div>

          <div className="flex flex-col justify-center px-4 py-2 flex-1 items-end text-right">
            <div className="flex items-center gap-2">
              {state.awayFouls >= 5 && (
                <span className="px-1.5 py-0.2 bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[9px] font-mono font-bold rounded-sm">
                  BONUS
                </span>
              )}
              {state.possession === 'away' && (
                <span className="text-[10px] text-amber-400 font-mono font-extrabold">POSS ▶</span>
              )}
              <span className="font-black text-xl tracking-wider text-white">
                {teamB.shortName || 'AWAY'}
              </span>
            </div>
            {/* Timeout bars */}
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: 7 }).map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1 w-3 rounded-xs ${
                    idx < state.awayTimeouts ? 'bg-amber-400' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="w-2 self-stretch shrink-0" style={{ backgroundColor: awayColor }} />
        </div>

        {/* Clock & Shot Clock Module */}
        <div className="flex items-stretch border-l border-slate-700 bg-slate-950">
          {/* Quarter + Game Clock */}
          <div className="px-4 py-1.5 flex flex-col items-center justify-center min-w-[100px]">
            <span className="text-[11px] font-extrabold text-blue-400 tracking-widest font-mono">
              {quarterLabel}
            </span>
            <span className="font-mono tabular-nums font-black text-xl text-white tracking-tight">
              {state.clock}
            </span>
          </div>

          {/* 24s Shot Clock */}
          <div
            className={`px-3.5 py-1.5 flex flex-col items-center justify-center min-w-[64px] border-l border-slate-800 ${
              isLowShotClock ? 'bg-rose-950/90 text-rose-400' : 'bg-amber-500/15 text-amber-400'
            }`}
          >
            <span className="text-[9px] font-mono uppercase tracking-widest opacity-80">SHOT</span>
            <span className="font-mono tabular-nums font-black text-2xl leading-none mt-0.5">
              {state.shotClock}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Play-by-Play Ticker */}
      {state.lastPlay && (
        <div className="mt-1 bg-slate-950/95 border border-slate-800 px-3.5 py-1 rounded text-xs font-mono text-slate-300 flex items-center justify-between">
          <span>
            <strong className="text-amber-400 uppercase mr-2">LAST PLAY:</strong>
            {state.lastPlay}
          </span>
          <span className="text-[10px] text-slate-500">
            Q1: {state.quarterScores[0]?.home ?? 0}-{state.quarterScores[0]?.away ?? 0} • Q2:{' '}
            {state.quarterScores[1]?.home ?? 0}-{state.quarterScores[1]?.away ?? 0}
          </span>
        </div>
      )}
    </div>
  );
};
