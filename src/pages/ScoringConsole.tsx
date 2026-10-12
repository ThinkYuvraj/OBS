import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BallEvent, CricketInnings, Match, WicketType } from '../types/sports';
import {
  fetchMatch,
  postBallEvent,
  undoBallEvent,
  redoBallEvent,
  updateMatch,
} from '../services/api';
import { useRealtimeSocket } from '../hooks/useRealtimeSocket';
import {
  ArrowLeft,
  RotateCcw,
  RotateCw,
  Repeat,
  UserCheck,
  AlertTriangle,
  History,
  Activity,
  CheckCircle2,
  Layers,
  BookOpen,
  LifeBuoy,
} from 'lucide-react';
import { RuleBookModal } from '../components/common/RuleBookModal';
import { HelpDeskModal } from '../components/common/HelpDeskModal';

interface ScoringConsoleProps {
  matchId: string;
  onBack: () => void;
}

export const ScoringConsole: React.FC<ScoringConsoleProps> = ({ matchId, onBack }) => {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [wicketModalOpen, setWicketModalOpen] = useState(false);
  const [wicketType, setWicketType] = useState<WicketType>('caught');
  const [fielderName, setFielderName] = useState('');
  const [nextBatterName, setNextBatterName] = useState('');
  const [selectedDismissedBatter, setSelectedDismissedBatter] = useState<string>('striker');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [commentaryText, setCommentaryText] = useState('');
  const [showRuleBook, setShowRuleBook] = useState(false);
  const [showHelpDesk, setShowHelpDesk] = useState(false);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const loadMatch = useCallback(async () => {
    try {
      const data = await fetchMatch(matchId);
      setMatch(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    loadMatch();
  }, [loadMatch]);

  useRealtimeSocket({
    matchId,
    onMatchUpdate: (updated) => {
      if (updated.id === matchId) {
        setMatch(updated);
      }
    },
  });

  const showToast = useCallback((msg: string) => {
    setActionFeedback(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setActionFeedback(null), 2200);
  }, []);

  const handleRecordBall = useCallback(
    async (ballData: Partial<BallEvent>) => {
      if (!match || !match.cricketState) return;
      try {
        const res = await postBallEvent(matchId, ballData);
        setMatch(res.match);
        showToast(
          ballData.isWicket
            ? 'Wicket recorded!'
            : ballData.runsOffBat === 4
            ? 'FOUR!'
            : ballData.runsOffBat === 6
            ? 'SIX!'
            : `${ballData.runsOffBat ?? 0} run(s) recorded`
        );
      } catch (err: any) {
        showToast(err.message || 'Failed to record ball');
      }
    },
    [match, matchId, showToast]
  );

  const handleUndo = useCallback(async () => {
    if (!match) return;
    try {
      const res = await undoBallEvent(matchId);
      setMatch(res.match);
      showToast('Undid previous ball');
    } catch (err: any) {
      showToast(err.message || 'Nothing to undo');
    }
  }, [match, matchId, showToast]);

  const handleRedo = useCallback(async () => {
    if (!match) return;
    try {
      const res = await redoBallEvent(matchId);
      setMatch(res.match);
      showToast('Redid ball');
    } catch (err: any) {
      showToast(err.message || 'Nothing to redo');
    }
  }, [match, matchId, showToast]);

  const handleSwapStriker = async () => {
    if (!match || !match.cricketState) return;
    const nextCricketState = JSON.parse(JSON.stringify(match.cricketState));
    const inn = nextCricketState.innings[nextCricketState.currentInningsIndex];
    if (!inn) return;

    const temp = inn.currentStrikerId;
    inn.currentStrikerId = inn.currentNonStrikerId;
    inn.currentNonStrikerId = temp;
    setMatch({ ...match, cricketState: nextCricketState });
    showToast('Swapped striker and non-striker');
    try {
      await updateMatch(match.id, { cricketState: nextCricketState });
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmWicket = async () => {
    if (!match || !match.cricketState) return;
    const inn = match.cricketState.innings[match.cricketState.currentInningsIndex];
    if (!inn) return;

    const striker = inn.batters.find((b) => b.playerId === inn.currentStrikerId);
    const nonStriker = inn.batters.find((b) => b.playerId === inn.currentNonStrikerId);
    const dismissedBatter = selectedDismissedBatter === 'striker' ? striker : nonStriker;

    const nextId = `p_next_${Date.now()}`;
    const nextName = nextBatterName.trim() || `Batter #${inn.wickets + 3}`;

    await handleRecordBall({
      isWicket: true,
      wicketType,
      fielderName: fielderName.trim() || undefined,
      dismissedBatterId: dismissedBatter?.playerId,
      dismissedBatterName: dismissedBatter?.name,
      nextBatterId: nextId,
      nextBatterName: nextName,
      runsOffBat: 0,
    });

    setWicketModalOpen(false);
    setFielderName('');
    setNextBatterName('');
  };

  // Stable Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      const key = e.key.toLowerCase();
      if (['0', '1', '2', '3', '4', '5', '6'].includes(key)) {
        e.preventDefault();
        handleRecordBall({ runsOffBat: parseInt(key, 10) });
      } else if (key === 'w') {
        e.preventDefault();
        setWicketModalOpen(true);
      } else if (key === 'd') {
        e.preventDefault();
        handleRecordBall({ isWide: true, runsOffBat: 0 });
      } else if (key === 'n') {
        e.preventDefault();
        handleRecordBall({ isNoBall: true, runsOffBat: 0 });
      } else if (key === 'u') {
        e.preventDefault();
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRecordBall, handleUndo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-cyan-400 font-mono text-sm">
        Loading MarketinGlu Cyan-Sky scoring console...
      </div>
    );
  }

  if (!match || !match.cricketState) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-6 text-center">
        <p className="text-slate-300 mb-4">No cricket match state found.</p>
        <button onClick={onBack} className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-sm font-bold">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const inningsIndex = match.cricketState.currentInningsIndex;
  const innings: CricketInnings = match.cricketState.innings[inningsIndex];
  const battingTeam = innings.battingTeamId === match.teamA.id ? match.teamA : match.teamB;
  const bowlingTeam = innings.bowlingTeamId === match.teamA.id ? match.teamA : match.teamB;

  const striker = innings.batters.find((b) => b.playerId === innings.currentStrikerId);
  const nonStriker = innings.batters.find((b) => b.playerId === innings.currentNonStrikerId);
  const bowler = innings.bowlers.find((b) => b.playerId === innings.currentBowlerId);

  const currentOverIndex = Math.max(0, Math.floor(innings.legalBalls / 6));
  const currentOverSummary = innings.oversHistory.find((o) => o.overNumber === currentOverIndex);
  const currentBalls = currentOverSummary?.balls || [];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 pb-16 font-sans">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-[#0c1424] via-[#090f1f] to-[#0c1424] border-b border-slate-800/80 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-[#060a14] border border-slate-800 hover:border-cyan-500/40 text-slate-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
              <span>{match.tournament}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">{match.venue}</span>
            </div>
            <h1 className="text-lg font-black text-white tracking-tight font-['Space_Grotesk',sans-serif]">{match.name}</h1>
          </div>
        </div>

        {/* Global Undo / Redo + Default Theme Pill */}
        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline-flex px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-400 text-[10px] font-mono font-bold text-cyan-300">
            MarketinGlu Cyan-Sky • DEFAULT
          </span>
          {actionFeedback && (
            <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-semibold rounded-lg animate-pulse">
              {actionFeedback}
            </div>
          )}
          <button
            onClick={handleUndo}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-[#060a14] border border-slate-800 hover:border-cyan-500/40 text-slate-300 rounded-xl cursor-pointer"
            title="Shortcut: U"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo (U)</span>
          </button>
          <button
            onClick={handleRedo}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-[#060a14] border border-slate-800 hover:border-cyan-500/40 text-slate-300 rounded-xl cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Redo</span>
          </button>
          <button
            onClick={() => setShowRuleBook(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#060a14] hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 rounded-xl cursor-pointer transition-all shadow-sm"
            title="Open ICC Cricket Official Rule Book & Umpire Signals"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Rule Book</span>
          </button>
          <button
            onClick={() => setShowHelpDesk(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#060a14] hover:bg-slate-800 border border-amber-500/40 text-amber-300 hover:text-amber-200 rounded-xl cursor-pointer transition-all shadow-sm"
            title="Report a Match Issue or Contact Client Help Desk (Email: support@marketinglu.com)"
          >
            <LifeBuoy className="w-3.5 h-3.5 text-amber-400" />
            <span>Report Issue</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-6 space-y-6">
        {/* Main Situation Board */}
        <div className="bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-slate-800">
            {/* Score & Batting Team */}
            <div className="flex items-center gap-5">
              <div
                className="w-3 h-16 rounded-full shrink-0"
                style={{ backgroundColor: battingTeam.color || '#06b6d4' }}
              />
              <div>
                <div className="text-xs font-extrabold uppercase tracking-widest text-cyan-400 font-mono">
                  {battingTeam.name} Batting • {innings.inningsNumber === 1 ? '1st Innings' : '2nd Innings'}
                </div>
                <div className="flex items-baseline gap-3 mt-0.5">
                  <span className="text-5xl font-black font-mono tracking-tight text-white tabular-nums">
                    {innings.runs}/{innings.wickets}
                  </span>
                  <span className="text-xl font-bold font-mono text-slate-300">
                    {innings.oversFormatted}{' '}
                    <span className="text-xs text-slate-500 font-sans uppercase">
                      / {match.cricketState.maxOvers} ov
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Run Rates & Target */}
            <div className="flex items-center gap-6 bg-[#060a14] p-4 rounded-xl border border-slate-800/80">
              <div>
                <div className="text-[11px] font-mono text-slate-400 uppercase">Current Run Rate</div>
                <div className="text-2xl font-black font-mono text-cyan-400 tabular-nums">
                  {innings.currentRunRate.toFixed(2)}
                </div>
              </div>

              {innings.target && (
                <div className="pl-6 border-l border-slate-800">
                  <div className="text-[11px] font-mono text-slate-400 uppercase">Target</div>
                  <div className="text-2xl font-black font-mono text-white tabular-nums">
                    {innings.target}
                  </div>
                  {innings.requiredRunRate && (
                    <div className="text-xs font-mono text-rose-400 font-bold">
                      RRR: {innings.requiredRunRate.toFixed(2)}
                    </div>
                  )}
                </div>
              )}

              <div className="pl-6 border-l border-slate-800">
                <div className="text-[11px] font-mono text-slate-400 uppercase">Partnership</div>
                <div className="text-xl font-black font-mono text-emerald-400 tabular-nums">
                  {innings.currentPartnership.runs}{' '}
                  <span className="text-xs text-slate-400 font-sans">
                    ({innings.currentPartnership.balls}b)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Batsmen and Bowler Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            {/* Batsmen Crease */}
            <div className="bg-[#060a14]/90 p-4 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Batters At Crease
                </span>
                <button
                  onClick={handleSwapStriker}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-[#0c1424] hover:bg-[#0d1a33] border border-slate-800 text-cyan-400 rounded-lg transition-colors cursor-pointer"
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>Swap Striker</span>
                </button>
              </div>

              {/* Striker */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                  <div>
                    <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
                      <span>{striker?.name || 'Striker'}</span>
                      <span className="text-cyan-400 text-xs">*</span>
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      4s: {striker?.fours || 0} | 6s: {striker?.sixes || 0} | SR:{' '}
                      {striker?.strikeRate.toFixed(1) || 0}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black font-mono text-white tabular-nums">
                    {striker?.runs || 0}
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    ({striker?.balls || 0} balls)
                  </div>
                </div>
              </div>

              {/* Non-Striker */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#090f1f] border border-slate-800">
                <div className="pl-4">
                  <div className="font-bold text-sm text-slate-300">
                    {nonStriker?.name || 'Non-Striker'}
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    4s: {nonStriker?.fours || 0} | 6s: {nonStriker?.sixes || 0} | SR:{' '}
                    {nonStriker?.strikeRate.toFixed(1) || 0}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold font-mono text-slate-300 tabular-nums">
                    {nonStriker?.runs || 0}
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    ({nonStriker?.balls || 0} balls)
                  </div>
                </div>
              </div>
            </div>

            {/* Bowler Details */}
            <div className="bg-[#060a14]/90 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    Current Bowler ({bowlingTeam.shortName})
                  </span>
                  <div className="text-xs font-mono text-slate-400">
                    Extras: {innings.extras.total} (Wd {innings.extras.wides}, Nb {innings.extras.noBalls})
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#090f1f] border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-base font-black text-white">{bowler?.name || 'Bowler'}</div>
                    <div className="text-xs font-mono text-slate-400 mt-0.5">
                      Econ: {bowler?.economy.toFixed(2) || '0.00'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-xl font-mono tabular-nums text-white">
                      {bowler?.runsConceded || 0}-{bowler?.wickets || 0}
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      {bowler?.overs || '0.0'} overs ({bowler?.maidens || 0} maidens)
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Over Balls Strip */}
              <div className="mt-3 pt-3 border-t border-slate-800">
                <div className="text-[11px] font-mono text-slate-400 uppercase mb-1.5 flex items-center justify-between">
                  <span>This Over ({currentBalls.length} balls):</span>
                  <span>{innings.oversFormatted} ov</span>
                </div>
                <div className="flex items-center gap-2">
                  {currentBalls.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">No balls yet in this over.</span>
                  ) : (
                    currentBalls.map((b, idx) => (
                      <span
                        key={idx}
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs shadow-sm ${
                          b.isWicket
                            ? 'bg-rose-600 text-white animate-pulse'
                            : b.runs === 4
                            ? 'bg-cyan-500 text-white'
                            : b.runs === 6
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : b.runs > 0
                            ? 'bg-[#0c1424] text-white border border-slate-700'
                            : 'bg-[#090f1f] text-slate-400 border border-slate-800'
                        }`}
                      >
                        {b.text}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Operator Controls: Large Buttons */}
        <div className="bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>Scoring Input Console (Single-Click / Keyboard Friendly)</span>
            </h2>
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>Keys: 0-6 = Runs</span>
              <span>•</span>
              <span>W = Wicket</span>
              <span>•</span>
              <span>D = Wide</span>
              <span>•</span>
              <span>N = No Ball</span>
              <span>•</span>
              <span>U = Undo</span>
            </div>
          </div>

          {/* Runs Row */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 mb-4">
            {[0, 1, 2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                onClick={() => handleRecordBall({ runsOffBat: num })}
                className={`h-16 rounded-xl font-mono text-2xl font-black transition-all shadow-md active:scale-95 flex flex-col items-center justify-center cursor-pointer ${
                  num === 4
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/20'
                    : num === 6
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                    : 'bg-[#060a14] hover:bg-[#0d1a33] border border-slate-800 text-white'
                }`}
              >
                <span>{num}</span>
                <span className="text-[10px] font-sans font-semibold opacity-70">
                  {num === 0 ? 'Dot' : num === 4 ? 'FOUR' : num === 6 ? 'SIX' : `${num} Run`}
                </span>
              </button>
            ))}
          </div>

          {/* Extras and Wicket Action Row */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            {/* Wide */}
            <button
              onClick={() => handleRecordBall({ isWide: true, runsOffBat: 0 })}
              className="h-13 bg-[#060a14] hover:bg-[#0d1a33] border border-slate-800 rounded-xl flex flex-col items-center justify-center text-amber-400 font-bold transition-all active:scale-95 cursor-pointer"
            >
              <span className="font-mono text-base">WD</span>
              <span className="text-[10px] text-slate-400">Wide (+1)</span>
            </button>

            {/* No Ball */}
            <button
              onClick={() => handleRecordBall({ isNoBall: true, runsOffBat: 0 })}
              className="h-13 bg-[#060a14] hover:bg-[#0d1a33] border border-slate-800 rounded-xl flex flex-col items-center justify-center text-amber-400 font-bold transition-all active:scale-95 cursor-pointer"
            >
              <span className="font-mono text-base">NB</span>
              <span className="text-[10px] text-slate-400">No Ball (+1)</span>
            </button>

            {/* Bye */}
            <button
              onClick={() => handleRecordBall({ isBye: true, runsOffBat: 1 })}
              className="h-13 bg-[#060a14] hover:bg-[#0d1a33] border border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-200 font-bold transition-all active:scale-95 cursor-pointer"
            >
              <span className="font-mono text-base">BYE</span>
              <span className="text-[10px] text-slate-400">1 Bye</span>
            </button>

            {/* Leg Bye */}
            <button
              onClick={() => handleRecordBall({ isLegBye: true, runsOffBat: 1 })}
              className="h-13 bg-[#060a14] hover:bg-[#0d1a33] border border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-200 font-bold transition-all active:scale-95 cursor-pointer"
            >
              <span className="font-mono text-base">LB</span>
              <span className="text-[10px] text-slate-400">1 Leg Bye</span>
            </button>

            {/* Penalty 5 */}
            <button
              onClick={() => handleRecordBall({ penaltyRuns: 5, runsOffBat: 0 })}
              className="h-13 bg-[#060a14] hover:bg-[#0d1a33] border border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-200 font-bold transition-all active:scale-95 cursor-pointer"
            >
              <span className="font-mono text-base">+5</span>
              <span className="text-[10px] text-slate-400">Penalty Runs</span>
            </button>

            {/* WICKET! (Prominent Red Button) */}
            <button
              onClick={() => setWicketModalOpen(true)}
              className="h-13 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl shadow-lg shadow-rose-600/30 flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer"
            >
              <span className="font-mono text-base tracking-wider">WICKET!</span>
              <span className="text-[10px] text-rose-200 font-sans">Dismissal (W)</span>
            </button>
          </div>
        </div>

        {/* Fall of Wickets Timeline & Match Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fall of Wickets */}
          <div className="bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-400" />
              <span>Fall of Wickets ({innings.fallOfWickets.length})</span>
            </h3>

            {innings.fallOfWickets.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs font-mono">
                No wickets have fallen yet in this innings.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {innings.fallOfWickets.map((fow) => (
                  <div
                    key={fow.wicketNumber}
                    className="flex items-center justify-between p-2.5 bg-[#060a14] rounded-xl border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-600/20 text-rose-400 font-mono font-bold flex items-center justify-center text-[10px]">
                        {fow.wicketNumber}
                      </span>
                      <div>
                        <span className="font-bold text-slate-200">{fow.batterName}</span>
                        <div className="text-[11px] text-slate-400 font-mono">{fow.dismissal}</div>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-white">{fow.score} runs</span>
                      <div className="text-[10px] text-slate-500">at {fow.overs} ov</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Over-by-Over Progression */}
          <div className="bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <span>Over Progression History</span>
            </h3>

            {innings.oversHistory.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs font-mono">
                No completed overs yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {innings.oversHistory.map((ov) => (
                  <div
                    key={ov.overNumber}
                    className="flex items-center justify-between p-2.5 bg-[#060a14] rounded-xl border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-400">
                        Ov {ov.overNumber + 1}:
                      </span>
                      <div className="flex items-center gap-1">
                        {ov.balls.map((b, i) => (
                          <span
                            key={i}
                            className={`w-5 h-5 rounded text-[10px] font-mono font-bold flex items-center justify-center ${
                              b.isWicket
                                ? 'bg-rose-600 text-white'
                                : b.runs === 4
                                ? 'bg-cyan-500 text-white'
                                : b.runs === 6
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-[#0c1424] text-slate-300'
                            }`}
                          >
                            {b.text}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="font-mono text-slate-300">
                      <span className="font-bold text-white">{ov.totalRuns}</span> runs
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Wicket Modal */}
      {wicketModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#070b14]/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#0c1424] to-[#060a14] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 font-['Space_Grotesk',sans-serif]">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span>Record Wicket Dismissal</span>
            </h3>

            <div className="space-y-4">
              {/* Dismissed Batter */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Dismissed Batter
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDismissedBatter('striker')}
                    className={`p-2.5 text-xs font-semibold rounded-xl border text-center transition-colors cursor-pointer ${
                      selectedDismissedBatter === 'striker'
                        ? 'bg-rose-600 border-rose-500 text-white'
                        : 'bg-[#060a14] border-slate-800 text-slate-400'
                    }`}
                  >
                    Striker: {striker?.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDismissedBatter('nonStriker')}
                    className={`p-2.5 text-xs font-semibold rounded-xl border text-center transition-colors cursor-pointer ${
                      selectedDismissedBatter === 'nonStriker'
                        ? 'bg-rose-600 border-rose-500 text-white'
                        : 'bg-[#060a14] border-slate-800 text-slate-400'
                    }`}
                  >
                    Non-Striker: {nonStriker?.name}
                  </button>
                </div>
              </div>

              {/* Dismissal Method */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Dismissal Type
                </label>
                <select
                  value={wicketType}
                  onChange={(e) => setWicketType(e.target.value as WicketType)}
                  className="w-full bg-[#060a14] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                >
                  <option value="caught">Caught</option>
                  <option value="bowled">Bowled</option>
                  <option value="lbw">LBW</option>
                  <option value="run_out">Run Out</option>
                  <option value="stumped">Stumped</option>
                  <option value="hit_wicket">Hit Wicket</option>
                  <option value="retired_hurt">Retired Hurt</option>
                </select>
              </div>

              {/* Fielder Name */}
              {(wicketType === 'caught' || wicketType === 'run_out' || wicketType === 'stumped') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Fielder / Catcher
                  </label>
                  <input
                    type="text"
                    value={fielderName}
                    onChange={(e) => setFielderName(e.target.value)}
                    placeholder="e.g. Warner"
                    className="w-full bg-[#060a14] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              )}

              {/* Next Batter */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Next Batter Entering Crease
                </label>
                <input
                  type="text"
                  value={nextBatterName}
                  onChange={(e) => setNextBatterName(e.target.value)}
                  placeholder={`Batter #${innings.wickets + 3}`}
                  className="w-full bg-[#060a14] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setWicketModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 bg-[#060a14] border border-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmWicket}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg cursor-pointer"
              >
                Confirm Wicket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ICC Cricket Official Rule Book Modal */}
      <RuleBookModal
        isOpen={showRuleBook}
        onClose={() => setShowRuleBook(false)}
        initialSport="cricket"
      />

      {/* In-Game Client Issue Reporting Help Desk */}
      <HelpDeskModal
        isOpen={showHelpDesk}
        onClose={() => setShowHelpDesk(false)}
        matchId={match.id}
        matchName={match.name}
        sport="cricket"
        overlayToken={match.activeOverlayToken}
      />
    </div>
  );
};
