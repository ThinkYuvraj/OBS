import React from 'react';
import { BadmintonMatchState, Match, OverlayConfig, TableTennisMatchState, VolleyballMatchState } from '../../types/sports';

interface RacquetVolleyScoreBugProps {
  match: Match;
  config: OverlayConfig;
}

export const RacquetVolleyScoreBug: React.FC<RacquetVolleyScoreBugProps> = ({ match, config }) => {
  const sport = match.sport;
  const teamA = match.teamA;
  const teamB = match.teamB;

  let currentSetNum = 1;
  let homePoints = 0;
  let awayPoints = 0;
  let setsWonHome = 0;
  let setsWonAway = 0;
  let server: 'home' | 'away' = 'home';
  let isGameOrMatchPoint = false;
  let statusBadge = '';

  if (sport === 'badminton' && match.badmintonState) {
    const bs = match.badmintonState;
    currentSetNum = bs.currentSet + 1;
    homePoints = bs.homePoints;
    awayPoints = bs.awayPoints;
    server = bs.server;
    isGameOrMatchPoint = bs.isGamePoint || bs.isMatchPoint;
    statusBadge = bs.isMatchPoint ? 'MATCH POINT' : bs.isGamePoint ? 'GAME POINT' : '';
    setsWonHome = bs.sets.filter((s) => s.home > s.away).length;
    setsWonAway = bs.sets.filter((s) => s.away > s.home).length;
  } else if (sport === 'table_tennis' && match.tableTennisState) {
    const tts = match.tableTennisState;
    currentSetNum = tts.currentSet + 1;
    homePoints = tts.homePoints;
    awayPoints = tts.awayPoints;
    server = tts.server;
    isGameOrMatchPoint = tts.isGamePoint || tts.isMatchPoint;
    statusBadge = tts.isMatchPoint ? 'MATCH POINT' : tts.isGamePoint ? 'GAME POINT' : '';
    setsWonHome = tts.sets.filter((s) => s.home > s.away).length;
    setsWonAway = tts.sets.filter((s) => s.away > s.home).length;
  } else if (sport === 'volleyball' && match.volleyballState) {
    const vs = match.volleyballState;
    currentSetNum = vs.currentSet + 1;
    homePoints = vs.homeScore;
    awayPoints = vs.awayScore;
    server = vs.server;
    isGameOrMatchPoint = vs.isSetPoint || vs.isMatchPoint;
    statusBadge = vs.isMatchPoint ? 'MATCH POINT' : vs.isSetPoint ? 'SET POINT' : '';
    setsWonHome = vs.sets.filter((s) => s.home > s.away).length;
    setsWonAway = vs.sets.filter((s) => s.away > s.home).length;
  }

  const sportLabel =
    sport === 'badminton'
      ? 'BWF BADMINTON'
      : sport === 'table_tennis'
      ? 'ITTF TABLE TENNIS'
      : sport === 'volleyball'
      ? 'FIVB VOLLEYBALL'
      : 'TENNIS';

  return (
    <div
      className="inline-flex flex-col select-none drop-shadow-2xl transition-all duration-300"
      style={{
        transform: `scale(${config.scale || 1})`,
        transformOrigin: 'top left',
        opacity: config.opacity || 1,
      }}
    >
      {/* Header bar: Sport label & Set number */}
      <div className="flex items-center justify-between px-3 py-1 bg-slate-950/95 text-[11px] font-bold text-slate-300 border-t border-x border-slate-700/80 rounded-t-sm">
        <span className="text-amber-400 font-mono tracking-wider">{sportLabel}</span>
        <div className="flex items-center gap-2">
          <span className="text-white font-mono">SET {currentSetNum}</span>
          {statusBadge && (
            <span className="bg-rose-600 text-white px-1.5 py-0.2 rounded-sm text-[10px] font-extrabold animate-pulse">
              {statusBadge}
            </span>
          )}
        </div>
      </div>

      {/* Main Two-Row Broadcast Scorecard */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white border border-slate-700 shadow-2xl min-w-[340px]">
        {/* Row 1: Home Player / Team */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            {/* Server indicator yellow dot */}
            <span
              className={`w-2 h-2 rounded-full ${
                server === 'home' ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'opacity-0'
              }`}
            />
            <div
              className="w-1.5 h-4 rounded-sm"
              style={{ backgroundColor: teamA.color || '#3b82f6' }}
            />
            <span className="font-extrabold text-[15px] tracking-wide text-white truncate max-w-[170px]">
              {teamA.name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Sets won */}
            <div className="w-6 text-center text-xs font-mono font-bold text-slate-400 bg-slate-800/80 rounded py-0.5">
              {setsWonHome}
            </div>
            {/* Current Points */}
            <div className="w-8 text-center text-xl font-black font-mono tabular-nums text-amber-400">
              {homePoints}
            </div>
          </div>
        </div>

        {/* Row 2: Away Player / Team */}
        <div className="flex items-center justify-between px-3 py-1.5">
          <div className="flex items-center gap-2">
            {/* Server indicator yellow dot */}
            <span
              className={`w-2 h-2 rounded-full ${
                server === 'away' ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'opacity-0'
              }`}
            />
            <div
              className="w-1.5 h-4 rounded-sm"
              style={{ backgroundColor: teamB.color || '#ef4444' }}
            />
            <span className="font-extrabold text-[15px] tracking-wide text-white truncate max-w-[170px]">
              {teamB.name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Sets won */}
            <div className="w-6 text-center text-xs font-mono font-bold text-slate-400 bg-slate-800/80 rounded py-0.5">
              {setsWonAway}
            </div>
            {/* Current Points */}
            <div className="w-8 text-center text-xl font-black font-mono tabular-nums text-amber-400">
              {awayPoints}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
