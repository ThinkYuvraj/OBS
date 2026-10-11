import React from 'react';
import { FootballMatchState, OverlayConfig, Team } from '../../types/sports';

interface FootballScoreBugProps {
  teamA: Team;
  teamB: Team;
  state: FootballMatchState;
  config: OverlayConfig;
  tournamentName?: string;
}

export const FootballScoreBug: React.FC<FootballScoreBugProps> = ({
  teamA,
  teamB,
  state,
  config,
  tournamentName = 'CHAMPIONS LEAGUE',
}) => {
  // Format game clock e.g. "78:24" or "90:00"
  const minutesFormatted = String(Math.floor(state.minute)).padStart(2, '0');
  const clockText = state.clock || `${minutesFormatted}:00`;

  const homeColor = teamA.color || '#FFFFFF';
  const awayColor = teamB.color || '#DC2626';

  return (
    <div
      className="inline-flex flex-col select-none drop-shadow-2xl transition-all duration-300"
      style={{
        transform: `scale(${config.scale || 1})`,
        transformOrigin: 'top left',
        opacity: config.opacity || 1,
      }}
    >
      <div className="flex items-stretch rounded-sm overflow-hidden shadow-2xl border border-black/40">
        {/* Left Section: Tournament Logo & Timer Box (Directly matching the user's reference image) */}
        <div className="flex items-stretch bg-white">
          {/* Starball / Trophy Icon in royal blue badge */}
          <div className="bg-[#001489] text-white px-3 flex items-center justify-center">
            {/* SVG Champions League Starball Icon */}
            <svg
              className="w-5 h-5 text-white fill-current"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="3" />
              {/* Starball polygon stars */}
              <polygon points="50,15 54,27 67,27 56,35 60,47 50,39 40,47 44,35 33,27 46,27" />
              <polygon points="26,38 31,48 43,45 34,55 39,66 28,60 19,69 21,56 11,50 23,47" />
              <polygon points="74,38 77,47 89,50 79,56 81,69 72,60 61,66 66,55 57,45 69,48" />
              <polygon points="36,80 43,73 40,61 49,69 58,61 56,73 63,80 52,78 49,90 47,78" />
            </svg>
          </div>

          {/* Clock: crisp tabular digits with dark navy styling */}
          <div className="px-3.5 py-1.5 flex items-center justify-center bg-white min-w-[72px]">
            <span className="font-mono tabular-nums font-extrabold text-[20px] tracking-tight text-[#081136]">
              {clockText}
            </span>
          </div>
        </div>

        {/* Subtle separator divider */}
        <div className="w-[3px] bg-slate-900/60" />

        {/* Main Scorebar: Deep Blue Broadcast Bar matching UEFA styling */}
        <div className="flex items-stretch bg-[#070b4a] text-white px-0.5">
          {/* Home Team Color Accent Stripe */}
          <div
            className="w-1.5 self-stretch shrink-0"
            style={{ backgroundColor: homeColor }}
          />

          {/* Home Team Abbreviation */}
          <div className="px-4 py-1.5 flex items-center justify-center">
            <span className="font-extrabold text-[19px] tracking-wider text-white">
              {teamA.shortName || 'RMA'}
            </span>
          </div>

          {/* Soft separator / parenthesis-like curve */}
          <div className="flex items-center text-white/20 text-xs px-0.5 select-none font-light">
            ›
          </div>

          {/* Home Score */}
          <div className="w-9 py-1.5 flex items-center justify-center font-bold text-[22px] font-mono tabular-nums text-white">
            {state.homeScore}
          </div>

          {/* Subtle Vertical Divider Pipe */}
          <div className="w-[1px] bg-white/20 my-1.5" />

          {/* Away Score */}
          <div className="w-9 py-1.5 flex items-center justify-center font-bold text-[22px] font-mono tabular-nums text-white">
            {state.awayScore}
          </div>

          {/* Soft separator / parenthesis-like curve */}
          <div className="flex items-center text-white/20 text-xs px-0.5 select-none font-light">
            ‹
          </div>

          {/* Away Team Abbreviation */}
          <div className="px-4 py-1.5 flex items-center justify-center">
            <span className="font-extrabold text-[19px] tracking-wider text-white">
              {teamB.shortName || 'STU'}
            </span>
          </div>

          {/* Away Team Color Accent Stripe */}
          <div
            className="w-1.5 self-stretch shrink-0"
            style={{ backgroundColor: awayColor }}
          />
        </div>

        {/* Extra Added Time Badge (e.g. +4) */}
        {state.extraTime > 0 && (
          <div className="bg-amber-500 text-slate-950 font-black px-2.5 py-1.5 flex items-center justify-center font-mono text-sm border-l border-amber-600/40">
            +{state.extraTime}
          </div>
        )}
      </div>

      {/* Goal Event Sub-bar / Recent Scorer notification */}
      {state.events.length > 0 && state.events[0]?.type === 'goal' && (
        <div className="mt-1 bg-amber-400 text-slate-950 px-3 py-0.5 text-xs font-bold rounded-sm shadow flex items-center justify-between animate-bounce">
          <span>GOAL! {state.events[0].player}</span>
          <span className="font-mono text-[10px]">{state.events[0].minute}&apos;</span>
        </div>
      )}
    </div>
  );
};
