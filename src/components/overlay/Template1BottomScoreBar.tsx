import React from 'react';
import { CricketInnings, CricketMatchState, Match, Team } from '../../types/sports';

interface Template1BottomScoreBarProps {
  teamA: Team;
  teamB: Team;
  state: CricketMatchState;
  tournament?: string;
}

export const Template1BottomScoreBar: React.FC<Template1BottomScoreBarProps> = ({
  teamA,
  teamB,
  state,
}) => {
  const inningsIndex = state.currentInningsIndex;
  const innings: CricketInnings = state.innings[inningsIndex];

  if (!innings) return null;

  const battingTeam = innings.battingTeamId === teamA.id ? teamA : teamB;
  const bowlingTeam = innings.bowlingTeamId === teamA.id ? teamA : teamB;

  const striker = innings.batters.find((b) => b.playerId === innings.currentStrikerId);
  const nonStriker = innings.batters.find((b) => b.playerId === innings.currentNonStrikerId);
  const bowler = innings.bowlers.find((bw) => bw.playerId === innings.currentBowlerId);

  return (
    <div className="w-[1020px] max-w-[95vw] mx-auto select-none drop-shadow-2xl transition-all duration-200">
      {/* Container: Transparent-friendly professional television lower third score bar */}
      <div className="border border-slate-700/80 rounded-sm overflow-hidden bg-slate-950/95 text-white shadow-2xl backdrop-blur-md">
        {/* Top Row: Batting Team, Score, Overs, RRR */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-b border-slate-800">
          {/* Batting Team */}
          <div className="flex items-center gap-3">
            <div
              className="w-2.5 h-6 rounded-sm shrink-0"
              style={{ backgroundColor: battingTeam.color || '#2563EB' }}
            />
            <span className="font-black text-xl tracking-wider uppercase text-white">
              {battingTeam.name}
            </span>
          </div>

          {/* Current Score */}
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-black text-3xl tabular-nums text-white tracking-tight">
              {innings.runs}/{innings.wickets}
            </span>
          </div>

          {/* Overs */}
          <div className="font-mono font-bold text-lg text-slate-300">
            {innings.oversFormatted}{' '}
            <span className="text-xs uppercase font-sans text-slate-400">OVERS</span>
          </div>

          {/* Required Run Rate / Target */}
          <div className="flex items-center gap-2 font-mono text-sm">
            {innings.requiredRunRate !== undefined ? (
              <span className="font-black text-rose-400">
                RRR {innings.requiredRunRate.toFixed(2)}
              </span>
            ) : innings.target ? (
              <span className="font-black text-amber-400">
                TARGET {innings.target}
              </span>
            ) : (
              <span className="font-bold text-slate-400 text-xs uppercase">
                1ST INNINGS
              </span>
            )}
          </div>
        </div>

        {/* Second Row: Batters Stats, CRR, Bowler Stats */}
        <div className="flex items-center justify-between px-6 py-2 text-xs font-mono bg-slate-950 text-slate-300">
          {/* Batters */}
          <div className="flex items-center gap-6">
            {/* Striker */}
            <div className="flex items-center gap-1.5 font-bold text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="uppercase text-amber-300">
                {striker?.name || 'Striker'}
              </span>
              <span className="tabular-nums font-black text-white ml-1">
                {striker?.runs || 0} ({striker?.balls || 0})*
              </span>
            </div>

            {/* Non-Striker */}
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="uppercase">{nonStriker?.name || 'Non-Striker'}</span>
              <span className="tabular-nums font-bold text-slate-200 ml-1">
                {nonStriker?.runs || 0} ({nonStriker?.balls || 0})
              </span>
            </div>
          </div>

          {/* CRR */}
          <div className="font-bold text-amber-400 text-sm">
            CRR {innings.currentRunRate.toFixed(2)}
          </div>

          {/* Current Bowler figures */}
          {bowler && (
            <div className="text-right text-slate-400 font-medium">
              <span className="uppercase font-bold text-slate-200 mr-2">{bowler.name}</span>
              <span className="font-mono tabular-nums text-slate-300">
                {bowler.overs} - {bowler.maidens} - {bowler.runsConceded} - {bowler.wickets}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
