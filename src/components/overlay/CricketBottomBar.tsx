import React from 'react';
import { CricketMatchState, OverlayConfig, Team } from '../../types/sports';

interface CricketBottomBarProps {
  teamA: Team;
  teamB: Team;
  state: CricketMatchState;
  config: OverlayConfig;
  tournamentName?: string;
}

export const CricketBottomBar: React.FC<CricketBottomBarProps> = ({
  teamA,
  teamB,
  state,
  config,
}) => {
  const inningsIndex = state.currentInningsIndex;
  const innings = state.innings[inningsIndex];

  if (!innings) return null;

  const battingTeam = innings.battingTeamId === teamA.id ? teamA : teamB;
  const bowlingTeam = innings.bowlingTeamId === teamA.id ? teamA : teamB;

  const striker = innings.batters.find((b) => b.playerId === innings.currentStrikerId);
  const nonStriker = innings.batters.find((b) => b.playerId === innings.currentNonStrikerId);
  const bowler = innings.bowlers.find((bw) => bw.playerId === innings.currentBowlerId);

  // Current over balls from over history
  const currentOverIndex = Math.max(0, Math.floor(innings.legalBalls / 6));
  const currentOverSummary = innings.oversHistory.find((o) => o.overNumber === currentOverIndex);
  const currentBalls = currentOverSummary?.balls || [];

  // Circled numbers for balls: 0 -> ⓪ or •, 1 -> ①, 2 -> ②, 3 -> ③, 4 -> ④, 6 -> ⑥, W -> Ⓦ
  const getCircleGlyph = (text: string, runs: number, isWicket: boolean) => {
    if (isWicket) return 'W';
    if (runs === 0) return '0';
    if (runs === 1) return '1';
    if (runs === 2) return '2';
    if (runs === 3) return '3';
    if (runs === 4) return '4';
    if (runs === 6) return '6';
    return text;
  };

  return (
    <div
      className="w-[1260px] max-w-[98vw] mx-auto select-none drop-shadow-2xl transition-all duration-300"
      style={{
        transform: `scale(${config.scale || 1})`,
        transformOrigin: 'bottom center',
        opacity: config.opacity || 1,
      }}
    >
      {/* Broadcast Bar: Exact recreation of user's uploaded cricket scoreboard */}
      <div className="flex items-stretch h-[64px] bg-white border border-slate-300/80 shadow-2xl rounded-sm overflow-hidden text-slate-900 font-sans">
        {/* Leftmost Illustration: Bowler Silhouette with Red Cricket Ball */}
        <div className="w-[84px] bg-white flex items-center justify-center shrink-0 px-1 border-r border-slate-200">
          <div className="relative flex items-center justify-center">
            {/* Red Cricket Ball with dynamic seam */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 via-red-600 to-red-800 shadow-md flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border border-white/40" />
              <div className="w-6 h-[1.5px] bg-white/70 rotate-45" />
            </div>
            {/* Bowler Silhouette Icon */}
            <svg
              className="w-8 h-10 text-slate-900 absolute -right-3 -bottom-1 drop-shadow"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <circle cx="12" cy="4" r="2.5" />
              <path d="M15 7.5c-1-.5-2.2-.5-3.2 0l-3 1.5c-.5.2-.8.8-.8 1.4v4.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5V11l1-.5v8.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5V13l1.8 1.8c.4.4 1 .5 1.5.2.6-.4.8-1.1.5-1.7l-2.4-4.8z" />
            </svg>
          </div>
        </div>

        {/* Purple Vertical Divider with Diamond Bullets */}
        <div className="w-[14px] bg-[#2d005f] flex flex-col justify-around items-center py-1 shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-white/90" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/90" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/90" />
        </div>

        {/* Left Section: Batters Info */}
        <div className="w-[260px] px-3.5 flex flex-col justify-center bg-white shrink-0">
          {/* Striker */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {/* Green Play Triangle */}
              <span className="text-[#00c853] text-[13px] leading-none">▶</span>
              <span className="font-extrabold text-[16px] tracking-wide text-[#23004b] uppercase truncate max-w-[130px]">
                {striker?.name || 'Striker'}
              </span>
            </div>
            <div className="font-extrabold text-[16px] text-[#23004b] font-mono tabular-nums">
              {striker?.runs || 0}
              <span className="text-[14px] font-bold text-slate-700 ml-1">
                ({striker?.balls || 0})
              </span>
            </div>
          </div>

          {/* Non-Striker */}
          <div className="flex items-center justify-between mt-0.5">
            <div className="pl-4">
              <span className="font-bold text-[15px] tracking-wide text-[#23004b] uppercase truncate max-w-[130px]">
                {nonStriker?.name || 'Non-Striker'}
              </span>
            </div>
            <div className="font-extrabold text-[16px] text-[#23004b] font-mono tabular-nums">
              {nonStriker?.runs || 0}
            </div>
          </div>
        </div>

        {/* Center Chevron Section: Deep Purple Badge with Score, Overs, Partnership */}
        <div className="relative flex-1 bg-[#250051] text-white flex flex-col justify-center px-4 overflow-hidden">
          {/* Top Line: Team A v Team B, Score Pill, Ov Badge, Overs */}
          <div className="flex items-center justify-center gap-3">
            {/* Matchup: BLA v FIE */}
            <div className="flex items-center font-black tracking-wider text-[17px]">
              <span className="text-slate-400">{bowlingTeam.shortName || 'BLA'}</span>
              <span className="text-[#00e5ff] mx-1 text-sm font-bold">v</span>
              <span className="text-white">{battingTeam.shortName || 'FIE'}</span>
            </div>

            {/* Magenta / Hot Pink Score Hexagon Badge */}
            <div className="relative bg-[#ff007f] text-white px-4 py-0.5 font-black text-[22px] tracking-tight font-mono tabular-nums flex items-center shadow-lg clip-score-badge">
              <span>
                {innings.runs}/{innings.wickets}
              </span>
            </div>

            {/* Yellow Chevron Badge: Ov */}
            <div className="bg-[#ffd600] text-slate-950 px-2 py-0.5 font-black text-xs uppercase tracking-tight flex items-center clip-ov-badge">
              Ov
            </div>

            {/* Overs count */}
            <div className="font-black text-[20px] font-mono tabular-nums text-white">
              {innings.oversFormatted}
            </div>
          </div>

          {/* Bottom Line: Partnership */}
          <div className="text-center text-[12px] font-semibold tracking-widest text-slate-200 uppercase mt-0.5">
            PARTNERSHIP :{' '}
            <span className="text-white font-black font-mono">
              {innings.currentPartnership.runs}
            </span>
            {state.target && (
              <span className="ml-3 text-amber-300 font-bold">
                (TARGET: {state.target})
              </span>
            )}
          </div>
        </div>

        {/* Right Section: Bowler Name, Ball-by-ball circles, Bowler figures */}
        <div className="flex items-center justify-between px-4 bg-white flex-1 max-w-[420px]">
          <div>
            {/* Bowler Name */}
            <div className="font-black text-[16px] text-[#24004c] uppercase tracking-wide">
              {bowler?.name || 'Bowler'}
            </div>

            {/* Circled Ball-by-ball indicators for the over */}
            <div className="flex items-center gap-1.5 mt-0.5">
              {currentBalls.length === 0 ? (
                <div className="text-xs text-slate-400 italic">This over...</div>
              ) : (
                currentBalls.map((b, idx) => (
                  <span
                    key={idx}
                    className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center font-bold text-xs font-mono tabular-nums shadow-sm ${
                      b.isWicket
                        ? 'border-rose-600 bg-rose-600 text-white animate-pulse'
                        : b.runs === 4
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : b.runs === 6
                        ? 'border-amber-500 bg-amber-500 text-slate-950'
                        : 'border-slate-800 bg-white text-slate-900'
                    }`}
                  >
                    {getCircleGlyph(b.text, b.runs, b.isWicket)}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Bowler Figures: e.g. "13-0 1.0" (Runs-Wickets and Overs) */}
          <div className="text-right pl-3">
            <div className="font-black text-[18px] font-mono text-[#23004b] tabular-nums tracking-tight">
              {bowler ? `${bowler.runsConceded}-${bowler.wickets}` : '0-0'}
            </div>
            <div className="font-extrabold text-[14px] font-mono text-slate-700 tabular-nums">
              {bowler ? bowler.overs : '0.0'}
            </div>
          </div>
        </div>

        {/* Purple Vertical Divider with Diamond Bullets */}
        <div className="w-[14px] bg-[#2d005f] flex flex-col justify-around items-center py-1 shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-white/90" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/90" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/90" />
        </div>

        {/* Rightmost Illustration: Batsman Shot Graphic */}
        <div className="w-[72px] bg-white flex items-center justify-center shrink-0 border-l border-slate-200">
          <div className="relative">
            {/* Blue Batsman Icon */}
            <svg
              className="w-10 h-10 text-blue-600 drop-shadow"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <circle cx="15" cy="5" r="2.2" />
              {/* Bat */}
              <rect
                x="17"
                y="2"
                width="2.5"
                height="8"
                rx="0.8"
                transform="rotate(30 17 2)"
                fill="#d97706"
              />
              {/* Player body */}
              <path d="M12 9c-1.5 0-3 1-3.5 2.5l-1.5 4c-.3.8.2 1.5 1 1.5.6 0 1.1-.4 1.3-.9l1-2.6.7 5.5c.1.8.8 1.5 1.6 1.5.9 0 1.6-.7 1.6-1.6L14 13l2.5 1.5c.4.2.8.2 1.2 0 .6-.4.8-1.1.5-1.7l-2-4c-.7-1.1-2-1.8-3.2-1.8z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
