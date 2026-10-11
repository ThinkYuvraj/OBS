import React from 'react';
import { Match, OverlayConfig } from '../../types/sports';

interface OutdoorSportsScoreBugProps {
  match: Match;
  config: OverlayConfig;
}

export const OutdoorSportsScoreBug: React.FC<OutdoorSportsScoreBugProps> = ({ match, config }) => {
  const { sport, teamA, teamB } = match;
  const homeColor = teamA.color || '#2563EB';
  const awayColor = teamB.color || '#F97316';

  // 1. FIELD HOCKEY Broadcast ScoreBug
  if (sport === 'field_hockey' && match.fieldHockeyState) {
    const fh = match.fieldHockeyState;
    const qLabel = fh.quarter === 'SO' ? 'SHOOTOUT' : `Q${fh.quarter}`;
    const minFormatted = `${String(fh.minute).padStart(2, '0')}:00`;

    return (
      <div
        className="inline-flex flex-col select-none drop-shadow-2xl transition-all duration-300"
        style={{
          transform: `scale(${config.scale || 1})`,
          transformOrigin: 'top left',
          opacity: config.opacity || 1,
        }}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-3 py-1 bg-slate-950/95 border-t border-x border-slate-700/80 rounded-t-sm text-[10px] font-bold tracking-widest uppercase">
          <span className="text-emerald-400 font-mono">FIH FIELD HOCKEY</span>
          <span className="text-slate-300 font-mono">
            PC: {teamA.shortName} {fh.homePenaltyCorners} - {fh.awayPenaltyCorners} {teamB.shortName}
          </span>
        </div>

        {/* Main Scorebar */}
        <div className="flex items-stretch bg-slate-950 text-white border border-slate-700 shadow-2xl rounded-b-sm overflow-hidden">
          {/* Quarter & Clock */}
          <div className="bg-blue-600 text-white px-3 py-1.5 flex items-center gap-2 font-mono font-black text-sm">
            <span className="bg-slate-950/40 px-1.5 py-0.5 rounded text-xs">{qLabel}</span>
            <span className="tabular-nums text-base">{minFormatted}</span>
          </div>

          {/* Home Team */}
          <div className="flex items-stretch bg-slate-900">
            <div className="w-1.5 self-stretch" style={{ backgroundColor: homeColor }} />
            <div className="px-3.5 py-1.5 flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wider">{teamA.shortName}</span>
              {fh.homeCards.green > 0 && (
                <span className="w-2.5 h-3.5 bg-emerald-500 rounded-xs inline-block" title="Green Card" />
              )}
              {fh.homeCards.yellow > 0 && (
                <span className="w-2.5 h-3.5 bg-amber-400 rounded-xs inline-block" title="Yellow Card" />
              )}
            </div>
            <div className="w-10 bg-slate-950 flex items-center justify-center font-mono tabular-nums font-black text-2xl text-amber-400 border-x border-slate-800">
              {fh.homeScore}
            </div>
          </div>

          {/* Away Team */}
          <div className="flex items-stretch bg-slate-900">
            <div className="w-10 bg-slate-950 flex items-center justify-center font-mono tabular-nums font-black text-2xl text-amber-400 border-r border-slate-800">
              {fh.awayScore}
            </div>
            <div className="px-3.5 py-1.5 flex items-center gap-2">
              {fh.awayCards.green > 0 && (
                <span className="w-2.5 h-3.5 bg-emerald-500 rounded-xs inline-block" title="Green Card" />
              )}
              {fh.awayCards.yellow > 0 && (
                <span className="w-2.5 h-3.5 bg-amber-400 rounded-xs inline-block" title="Yellow Card" />
              )}
              <span className="font-extrabold text-lg tracking-wider">{teamB.shortName}</span>
            </div>
            <div className="w-1.5 self-stretch" style={{ backgroundColor: awayColor }} />
          </div>
        </div>
      </div>
    );
  }

  // 2. BASEBALL Broadcast Diamond Bug
  if (sport === 'baseball' && match.baseballState) {
    const bb = match.baseballState;
    return (
      <div
        className="inline-flex items-stretch bg-slate-950/95 text-white border border-slate-700 rounded-md shadow-2xl overflow-hidden select-none"
        style={{
          transform: `scale(${config.scale || 1})`,
          transformOrigin: 'top left',
          opacity: config.opacity || 1,
        }}
      >
        {/* Teams & R-H-E */}
        <div className="flex flex-col justify-between min-w-[210px] border-r border-slate-800">
          {/* Away Team (Bats Top) */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 rounded-xs" style={{ backgroundColor: awayColor }} />
              <span className="font-black text-sm tracking-wider">{teamB.shortName}</span>
              {bb.half === 'top' && <span className="text-[10px] text-amber-400 font-mono">●</span>}
            </div>
            <div className="flex items-center gap-3 font-mono tabular-nums">
              <span className="text-lg font-black text-amber-400 w-6 text-right">{bb.awayScore}</span>
              <span className="text-xs text-slate-400 w-4 text-right">{bb.awayHits}</span>
            </div>
          </div>

          {/* Home Team (Bats Bottom) */}
          <div className="flex items-center justify-between px-3 py-1.5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 rounded-xs" style={{ backgroundColor: homeColor }} />
              <span className="font-black text-sm tracking-wider">{teamA.shortName}</span>
              {bb.half === 'bottom' && <span className="text-[10px] text-amber-400 font-mono">●</span>}
            </div>
            <div className="flex items-center gap-3 font-mono tabular-nums">
              <span className="text-lg font-black text-amber-400 w-6 text-right">{bb.homeScore}</span>
              <span className="text-xs text-slate-400 w-4 text-right">{bb.homeHits}</span>
            </div>
          </div>
        </div>

        {/* Base Diamond SVG */}
        <div className="px-3.5 py-1.5 flex items-center justify-center bg-slate-900/90 border-r border-slate-800">
          <svg className="w-12 h-10" viewBox="0 0 60 50">
            {/* Second Base */}
            <polygon
              points="30,6 39,15 30,24 21,15"
              fill={bb.bases.second ? '#F59E0B' : '#1E293B'}
              stroke="#64748B"
              strokeWidth="2"
            />
            {/* Third Base */}
            <polygon
              points="15,21 24,30 15,39 6,30"
              fill={bb.bases.third ? '#F59E0B' : '#1E293B'}
              stroke="#64748B"
              strokeWidth="2"
            />
            {/* First Base */}
            <polygon
              points="45,21 54,30 45,39 36,30"
              fill={bb.bases.first ? '#F59E0B' : '#1E293B'}
              stroke="#64748B"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Inning, Count & Outs */}
        <div className="px-3.5 py-1.5 flex flex-col justify-center items-center font-mono min-w-[95px]">
          <div className="flex items-center gap-2 text-xs font-extrabold text-white">
            <span className="text-amber-400">{bb.half === 'top' ? '▲' : '▼'} {bb.inning}</span>
            <span className="text-slate-600">|</span>
            <span>{bb.balls}-{bb.strikes}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] text-slate-400 uppercase">OUT</span>
            {[0, 1].map((idx) => (
              <span
                key={idx}
                className={`w-2.5 h-2.5 rounded-full ${
                  idx < bb.outs ? 'bg-amber-400' : 'bg-slate-800 border border-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. RUGBY Broadcast ScoreBug
  if (sport === 'rugby' && match.rugbyState) {
    const rg = match.rugbyState;
    const minFormatted = `${String(rg.minute).padStart(2, '0')}:00`;

    return (
      <div
        className="inline-flex flex-col select-none drop-shadow-2xl"
        style={{
          transform: `scale(${config.scale || 1})`,
          transformOrigin: 'top left',
          opacity: config.opacity || 1,
        }}
      >
        <div className="flex items-stretch bg-slate-950 text-white border border-slate-700 rounded-sm overflow-hidden shadow-2xl">
          <div className="bg-emerald-600 text-slate-950 px-3 py-1.5 font-mono font-black text-base tabular-nums flex items-center gap-2">
            <span className="text-xs bg-slate-950 text-emerald-400 px-1.5 py-0.5 rounded-xs">
              {rg.half.toUpperCase()}
            </span>
            <span>{minFormatted}</span>
          </div>

          <div className="flex items-stretch bg-slate-900">
            <div className="w-1.5 self-stretch" style={{ backgroundColor: homeColor }} />
            <div className="px-4 py-1.5 flex items-center font-extrabold text-lg">
              {teamA.shortName}
            </div>
            <div className="w-11 bg-slate-950 flex items-center justify-center font-mono tabular-nums font-black text-2xl text-amber-400 border-x border-slate-800">
              {rg.homeScore}
            </div>
          </div>

          <div className="flex items-stretch bg-slate-900">
            <div className="w-11 bg-slate-950 flex items-center justify-center font-mono tabular-nums font-black text-2xl text-amber-400 border-r border-slate-800">
              {rg.awayScore}
            </div>
            <div className="px-4 py-1.5 flex items-center font-extrabold text-lg">
              {teamB.shortName}
            </div>
            <div className="w-1.5 self-stretch" style={{ backgroundColor: awayColor }} />
          </div>
        </div>
      </div>
    );
  }

  return null;
};
