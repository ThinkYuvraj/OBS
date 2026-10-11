import React, { useState, useEffect } from 'react';
import { Match } from '../types/sports';
import {
  fetchMatch,
  fetchMatches,
  postBaseballEvent,
  postBasketballEvent,
  postFieldHockeyEvent,
  postFootballEvent,
  postRugbyEvent,
} from '../services/api';
import { useRealtimeSocket } from '../hooks/useRealtimeSocket';
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Sliders,
  Zap,
  RotateCcw,
  ShieldAlert,
  Timer,
} from 'lucide-react';
import { FootballScoreBug } from '../components/overlay/FootballScoreBug';
import { BasketballScoreBug } from '../components/overlay/BasketballScoreBug';
import { RacquetVolleyScoreBug } from '../components/overlay/RacquetVolleyScoreBug';
import { OutdoorSportsScoreBug } from '../components/overlay/OutdoorSportsScoreBug';

interface MultiSportConsoleProps {
  matchId: string;
  onBack: () => void;
  onOpenOverlayStudio?: (matchId: string) => void;
}

export const MultiSportConsole: React.FC<MultiSportConsoleProps> = ({
  matchId,
  onBack,
  onOpenOverlayStudio,
}) => {
  const [activeId, setActiveId] = useState<string>(matchId);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Inline player / clock inputs
  const [playerNameInput, setPlayerNameInput] = useState('');
  const [clockInput, setClockInput] = useState('02:14');
  const [minuteInput, setMinuteInput] = useState(78);
  const [extraTimeInput, setExtraTimeInput] = useState(4);

  const loadData = async (idToLoad: string) => {
    try {
      const [data, list] = await Promise.all([fetchMatch(idToLoad), fetchMatches()]);
      setMatch(data);
      setAllMatches(list.filter((m) => m.sport !== 'cricket'));
      if (data.basketballState?.clock) setClockInput(data.basketballState.clock);
      if (data.footballState) {
        setMinuteInput(data.footballState.minute);
        setExtraTimeInput(data.footballState.extraTime);
      }
      if (data.fieldHockeyState) {
        setMinuteInput(data.fieldHockeyState.minute);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    setActiveId(matchId);
    loadData(matchId);
  }, [matchId]);

  useRealtimeSocket({
    matchId: activeId,
    onMatchUpdate: (updated) => {
      if (updated.id === activeId) {
        setMatch(updated);
      }
    },
  });

  if (loading || !match) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-sm">
        Loading broadcast scorer console...
      </div>
    );
  }

  const obsUrl = `${window.location.origin}/overlay/${match.activeOverlayToken}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(obsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Football Actions ---
  const handleFootballAction = async (
    type: 'goal' | 'yellow' | 'red' | 'corner' | 'shot' | 'foul' | 'clock',
    teamId: 'home' | 'away',
    customHalf?: string
  ) => {
    const defaultPlayer =
      playerNameInput.trim() ||
      (teamId === 'home' ? `${match.teamA.shortName} Player` : `${match.teamB.shortName} Player`);
    const updated = await postFootballEvent(match.id, {
      type,
      teamId,
      player: defaultPlayer,
      minute: minuteInput,
      extraTime: extraTimeInput,
      half: customHalf || match.footballState?.half,
    });
    setMatch(updated);
    if (type === 'goal') setPlayerNameInput('');
  };

  // --- Basketball Actions ---
  const handleBasketballAction = async (payload: {
    type: string;
    teamId?: 'home' | 'away';
    points?: number;
    quarter?: 1 | 2 | 3 | 4 | 'OT';
    clock?: string;
    shotClock?: number;
  }) => {
    const updated = await postBasketballEvent(match.id, {
      ...payload,
      player:
        playerNameInput.trim() ||
        (payload.teamId === 'home' ? match.teamA.shortName : match.teamB.shortName),
    });
    setMatch(updated);
  };

  // --- Racquet & Volleyball Actions (Badminton, Table Tennis, Volleyball, Tennis) ---
  const handleRacquetPoint = async (
    sport: string,
    winner: 'home' | 'away',
    extra?: { isAce?: boolean; type?: string; teamId?: string }
  ) => {
    const endpoint =
      sport === 'badminton'
        ? `/api/matches/${match.id}/badminton/point`
        : sport === 'table_tennis'
        ? `/api/matches/${match.id}/table-tennis/point`
        : sport === 'tennis'
        ? `/api/matches/${match.id}/tennis/point`
        : `/api/matches/${match.id}/volleyball/point`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winner, ...extra }),
    });
    if (res.ok) {
      const data = await res.json();
      setMatch(data.match);
    }
  };

  // --- Field Hockey Actions ---
  const handleFieldHockeyAction = async (
    type: string,
    teamId: 'home' | 'away',
    quarter?: 1 | 2 | 3 | 4 | 'SO'
  ) => {
    const updated = await postFieldHockeyEvent(match.id, {
      type,
      teamId,
      player: playerNameInput.trim() || undefined,
      quarter: quarter || match.fieldHockeyState?.quarter,
      minute: minuteInput,
    });
    setMatch(updated);
  };

  // --- Baseball Actions ---
  const handleBaseballAction = async (
    type: string,
    extra?: { teamId?: 'home' | 'away'; base?: 'first' | 'second' | 'third' }
  ) => {
    const updated = await postBaseballEvent(match.id, {
      type,
      player: playerNameInput.trim() || undefined,
      ...extra,
    });
    setMatch(updated);
  };

  // --- Rugby Actions ---
  const handleRugbyAction = async (type: string, teamId: 'home' | 'away', half?: string) => {
    const updated = await postRugbyEvent(match.id, {
      type,
      teamId,
      player: playerNameInput.trim() || undefined,
      minute: minuteInput,
      half: half || match.rugbyState?.half,
    });
    setMatch(updated);
  };

  // Compute main headline score for top console card
  let mainScoreDisplay = '0 - 0';
  let subStatusDisplay = 'LIVE BROADCAST FEED';

  if (match.sport === 'football' && match.footballState) {
    mainScoreDisplay = `${match.footballState.homeScore} - ${match.footballState.awayScore}`;
    subStatusDisplay = `${match.footballState.half.toUpperCase()} HALF • ${match.footballState.minute}' (+${match.footballState.extraTime})`;
  } else if (match.sport === 'basketball' && match.basketballState) {
    mainScoreDisplay = `${match.basketballState.homeScore} - ${match.basketballState.awayScore}`;
    subStatusDisplay = `Q${match.basketballState.quarter} • ${match.basketballState.clock} • SHOT CLOCK: ${match.basketballState.shotClock}s`;
  } else if (match.sport === 'badminton' && match.badmintonState) {
    mainScoreDisplay = `${match.badmintonState.homePoints} - ${match.badmintonState.awayPoints}`;
    subStatusDisplay = `SET ${match.badmintonState.currentSet + 1} • SERVER: ${match.badmintonState.server.toUpperCase()}`;
  } else if (match.sport === 'table_tennis' && match.tableTennisState) {
    mainScoreDisplay = `${match.tableTennisState.homePoints} - ${match.tableTennisState.awayPoints}`;
    subStatusDisplay = `SET ${match.tableTennisState.currentSet + 1} • SERVER: ${match.tableTennisState.server.toUpperCase()}`;
  } else if (match.sport === 'volleyball' && match.volleyballState) {
    mainScoreDisplay = `${match.volleyballState.homeScore} - ${match.volleyballState.awayScore}`;
    subStatusDisplay = `SET ${match.volleyballState.currentSet + 1} • SERVER: ${match.volleyballState.server.toUpperCase()}`;
  } else if (match.sport === 'tennis' && match.tennisState) {
    mainScoreDisplay = `${match.tennisState.currentGame.homePoints} - ${match.tennisState.currentGame.awayPoints}`;
    subStatusDisplay = `SET ${match.tennisState.currentSet + 1} • GAMES: ${
      match.tennisState.sets[match.tennisState.currentSet]?.home ?? 0
    }-${match.tennisState.sets[match.tennisState.currentSet]?.away ?? 0}`;
  } else if (match.sport === 'field_hockey' && match.fieldHockeyState) {
    mainScoreDisplay = `${match.fieldHockeyState.homeScore} - ${match.fieldHockeyState.awayScore}`;
    subStatusDisplay = `Q${match.fieldHockeyState.quarter} • ${match.fieldHockeyState.minute}' • PC: ${match.fieldHockeyState.homePenaltyCorners}-${match.fieldHockeyState.awayPenaltyCorners}`;
  } else if (match.sport === 'baseball' && match.baseballState) {
    mainScoreDisplay = `${match.baseballState.awayScore} - ${match.baseballState.homeScore}`;
    subStatusDisplay = `${match.baseballState.half.toUpperCase()} ${match.baseballState.inning} • ${match.baseballState.balls}-${match.baseballState.strikes} • ${match.baseballState.outs} OUT`;
  } else if (match.sport === 'rugby' && match.rugbyState) {
    mainScoreDisplay = `${match.rugbyState.homeScore} - ${match.rugbyState.awayScore}`;
    subStatusDisplay = `${match.rugbyState.half.toUpperCase()} HALF • ${match.rugbyState.minute}' • TRIES: ${match.rugbyState.homeTries}-${match.rugbyState.awayTries}`;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Top Studio Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-[11px] font-extrabold text-blue-400 uppercase tracking-wider font-mono">
              {match.sport.replace('_', ' ').toUpperCase()} PRODUCTION SCORER CONSOLE
            </div>
            <h1 className="text-lg font-bold text-white">{match.name}</h1>
          </div>
        </div>

        {/* Match Selector + OBS Copy Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {allMatches.length > 1 && (
            <select
              value={activeId}
              onChange={(e) => {
                setActiveId(e.target.value);
                loadData(e.target.value);
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-semibold focus:outline-none focus:border-blue-500"
            >
              {allMatches.map((m) => (
                <option key={m.id} value={m.id}>
                  [{m.sport.replace('_', ' ').toUpperCase()}] {m.name}
                </option>
              ))}
            </select>
          )}

          {onOpenOverlayStudio && (
            <button
              onClick={() => onOpenOverlayStudio(match.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Overlay Studio</span>
            </button>
          )}

          <button
            onClick={handleCopyUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied OBS URL' : 'Copy OBS URL'}</span>
          </button>

          <a
            href={obsUrl}
            target="_blank"
            rel="noreferrer"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
            title="Open Live Broadcast Overlay"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-6 space-y-6">
        {/* High-Contrast Scoreboard & Live Bug Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Cols: Master Score & Player Attribution */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              {/* Team A */}
              <div className="flex-1 text-center">
                <div className="inline-flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: match.teamA.color || '#2563EB' }}
                  />
                  <span className="text-lg font-extrabold text-white">{match.teamA.name}</span>
                </div>
                <div className="text-xs text-slate-400 font-mono mt-1">{match.teamA.shortName} (HOME)</div>
              </div>

              {/* Center Score */}
              <div className="px-6 text-center">
                <div className="text-4xl font-black font-mono tabular-nums text-white tracking-tight">
                  {mainScoreDisplay}
                </div>
                <div className="text-[11px] text-amber-400 font-mono font-bold mt-1.5 uppercase tracking-wider">
                  {subStatusDisplay}
                </div>
              </div>

              {/* Team B */}
              <div className="flex-1 text-center">
                <div className="inline-flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: match.teamB.color || '#DC2626' }}
                  />
                  <span className="text-lg font-extrabold text-white">{match.teamB.name}</span>
                </div>
                <div className="text-xs text-slate-400 font-mono mt-1">{match.teamB.shortName} (AWAY)</div>
              </div>
            </div>

            {/* Player Attribution Input Bar */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3">
              <label className="text-xs font-semibold text-slate-400 shrink-0">
                Active Scorer / Player Callout:
              </label>
              <input
                type="text"
                value={playerNameInput}
                onChange={(e) => setPlayerNameInput(e.target.value)}
                placeholder="Enter player name for broadcast graphic alert (e.g. LeBron James, K. Mbappé)..."
                className="flex-1 min-w-[220px] bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Right 5 Cols: Real-Time Broadcast Graphic Monitor */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
              <span>LIVE OBS GRAPHIC MONITOR</span>
              <span className="text-emerald-400 font-bold">ON AIR</span>
            </div>
            <div className="bg-slate-950 border border-slate-800/90 rounded-lg p-4 flex items-center justify-center overflow-x-auto min-h-[120px]">
              {match.sport === 'football' && match.footballState && (
                <FootballScoreBug
                  teamA={match.teamA}
                  teamB={match.teamB}
                  state={match.footballState}
                  config={{ ...match.overlayConfig, scale: 0.85 }}
                  tournamentName={match.tournament}
                />
              )}
              {match.sport === 'basketball' && match.basketballState && (
                <BasketballScoreBug
                  teamA={match.teamA}
                  teamB={match.teamB}
                  state={match.basketballState}
                  config={{ ...match.overlayConfig, scale: 0.65 }}
                  tournamentName={match.tournament}
                />
              )}
              {(match.sport === 'tennis' ||
                match.sport === 'badminton' ||
                match.sport === 'table_tennis' ||
                match.sport === 'volleyball') && (
                <RacquetVolleyScoreBug
                  match={match}
                  config={{ ...match.overlayConfig, scale: 0.85 }}
                />
              )}
              {(match.sport === 'field_hockey' ||
                match.sport === 'baseball' ||
                match.sport === 'rugby') && (
                <OutdoorSportsScoreBug
                  match={match}
                  config={{ ...match.overlayConfig, scale: 0.85 }}
                />
              )}
            </div>
          </div>
        </div>

        {/* ==================== 1. BASKETBALL SCORING DECK ==================== */}
        {match.sport === 'basketball' && match.basketballState && (
          <div className="space-y-6">
            {/* Team Scoring Decks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Home Team Deck */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: match.teamA.color }}
                    />
                    <span className="font-bold text-base text-white">{match.teamA.name}</span>
                  </div>
                  <span className="font-mono text-xs text-slate-400">
                    Fouls: {match.basketballState.homeFouls} • Timeouts: {match.basketballState.homeTimeouts}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() =>
                      handleBasketballAction({ type: 'score', teamId: 'home', points: 1 })
                    }
                    className="py-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-black text-white text-lg cursor-pointer transition-colors"
                  >
                    +1 FT
                  </button>
                  <button
                    onClick={() =>
                      handleBasketballAction({ type: 'score', teamId: 'home', points: 2 })
                    }
                    className="py-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-black text-white text-lg cursor-pointer transition-colors"
                  >
                    +2 FG
                  </button>
                  <button
                    onClick={() =>
                      handleBasketballAction({ type: 'score', teamId: 'home', points: 3 })
                    }
                    className="py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-lg cursor-pointer transition-colors"
                  >
                    +3 3PT
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <button
                    onClick={() => handleBasketballAction({ type: 'foul', teamId: 'home' })}
                    className="py-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold text-xs hover:bg-rose-500/25 cursor-pointer"
                  >
                    +1 Team Foul
                  </button>
                  <button
                    onClick={() => handleBasketballAction({ type: 'timeout', teamId: 'home' })}
                    className="py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-700 cursor-pointer"
                  >
                    Call Timeout
                  </button>
                  <button
                    onClick={() =>
                      handleBasketballAction({ type: 'score', teamId: 'home', points: -1 })
                    }
                    className="py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 font-bold text-xs hover:text-white cursor-pointer"
                  >
                    -1 Pt Fix
                  </button>
                </div>
              </div>

              {/* Away Team Deck */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: match.teamB.color }}
                    />
                    <span className="font-bold text-base text-white">{match.teamB.name}</span>
                  </div>
                  <span className="font-mono text-xs text-slate-400">
                    Fouls: {match.basketballState.awayFouls} • Timeouts: {match.basketballState.awayTimeouts}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() =>
                      handleBasketballAction({ type: 'score', teamId: 'away', points: 1 })
                    }
                    className="py-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-black text-white text-lg cursor-pointer transition-colors"
                  >
                    +1 FT
                  </button>
                  <button
                    onClick={() =>
                      handleBasketballAction({ type: 'score', teamId: 'away', points: 2 })
                    }
                    className="py-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-black text-white text-lg cursor-pointer transition-colors"
                  >
                    +2 FG
                  </button>
                  <button
                    onClick={() =>
                      handleBasketballAction({ type: 'score', teamId: 'away', points: 3 })
                    }
                    className="py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-lg cursor-pointer transition-colors"
                  >
                    +3 3PT
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <button
                    onClick={() => handleBasketballAction({ type: 'foul', teamId: 'away' })}
                    className="py-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold text-xs hover:bg-rose-500/25 cursor-pointer"
                  >
                    +1 Team Foul
                  </button>
                  <button
                    onClick={() => handleBasketballAction({ type: 'timeout', teamId: 'away' })}
                    className="py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-700 cursor-pointer"
                  >
                    Call Timeout
                  </button>
                  <button
                    onClick={() =>
                      handleBasketballAction({ type: 'score', teamId: 'away', points: -1 })
                    }
                    className="py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 font-bold text-xs hover:text-white cursor-pointer"
                  >
                    -1 Pt Fix
                  </button>
                </div>
              </div>
            </div>

            {/* Quarter, Shot Clock & Possession Control Strip */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
              {/* Quarter Buttons */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase mr-1">Quarter:</span>
                {([1, 2, 3, 4, 'OT'] as const).map((q) => (
                  <button
                    key={String(q)}
                    onClick={() => handleBasketballAction({ type: 'quarter', quarter: q })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                      match.basketballState?.quarter === q
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {q === 'OT' ? 'OT' : `Q${q}`}
                  </button>
                ))}
              </div>

              {/* Shot Clock Reset & Possession */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => handleBasketballAction({ type: 'shot_clock', shotClock: 24 })}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold hover:bg-amber-500/30 cursor-pointer"
                >
                  Reset 24s
                </button>
                <button
                  onClick={() => handleBasketballAction({ type: 'shot_clock', shotClock: 14 })}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold hover:bg-amber-500/30 cursor-pointer"
                >
                  Reset 14s
                </button>
                <button
                  onClick={() => handleBasketballAction({ type: 'possession' })}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Swap Possession Arrow
                </button>
              </div>

              {/* Clock Update */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={clockInput}
                  onChange={(e) => setClockInput(e.target.value)}
                  className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-center text-white"
                  placeholder="08:42"
                />
                <button
                  onClick={() => handleBasketballAction({ type: 'clock', clock: clockInput })}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Set Clock
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 2. FOOTBALL SCORING DECK ==================== */}
        {match.sport === 'football' && match.footballState && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Home Team Football Controls */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="font-bold text-base text-white">{match.teamA.name} (Home)</span>
                  <span className="font-mono text-xs text-slate-400">
                    Shots: {match.footballState.homeShots} • Corners: {match.footballState.homeCorners}
                  </span>
                </div>
                <button
                  onClick={() => handleFootballAction('goal', 'home')}
                  className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-black text-white text-lg shadow-lg cursor-pointer transition-colors"
                >
                  + GOAL ({match.teamA.shortName})
                </button>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    onClick={() => handleFootballAction('yellow', 'home')}
                    className="py-2.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs hover:bg-amber-500/30 cursor-pointer"
                  >
                    Yellow Card ({match.footballState.homeYellowCards})
                  </button>
                  <button
                    onClick={() => handleFootballAction('red', 'home')}
                    className="py-2.5 rounded-lg bg-rose-600/20 border border-rose-500/40 text-rose-300 font-bold text-xs hover:bg-rose-600/30 cursor-pointer"
                  >
                    Red Card ({match.footballState.homeRedCards})
                  </button>
                  <button
                    onClick={() => handleFootballAction('corner', 'home')}
                    className="py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs hover:bg-slate-700 cursor-pointer"
                  >
                    +1 Corner
                  </button>
                </div>
              </div>

              {/* Away Team Football Controls */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="font-bold text-base text-white">{match.teamB.name} (Away)</span>
                  <span className="font-mono text-xs text-slate-400">
                    Shots: {match.footballState.awayShots} • Corners: {match.footballState.awayCorners}
                  </span>
                </div>
                <button
                  onClick={() => handleFootballAction('goal', 'away')}
                  className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-black text-white text-lg shadow-lg cursor-pointer transition-colors"
                >
                  + GOAL ({match.teamB.shortName})
                </button>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    onClick={() => handleFootballAction('yellow', 'away')}
                    className="py-2.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs hover:bg-amber-500/30 cursor-pointer"
                  >
                    Yellow Card ({match.footballState.awayYellowCards})
                  </button>
                  <button
                    onClick={() => handleFootballAction('red', 'away')}
                    className="py-2.5 rounded-lg bg-rose-600/20 border border-rose-500/40 text-rose-300 font-bold text-xs hover:bg-rose-600/30 cursor-pointer"
                  >
                    Red Card ({match.footballState.awayRedCards})
                  </button>
                  <button
                    onClick={() => handleFootballAction('corner', 'away')}
                    className="py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs hover:bg-slate-700 cursor-pointer"
                  >
                    +1 Corner
                  </button>
                </div>
              </div>
            </div>

            {/* Match Clock & Half Controls */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Period:</span>
                {(['1st', '2nd', 'extra_1', 'penalties', 'full_time'] as const).map((h) => (
                  <button
                    key={h}
                    onClick={() => handleFootballAction('clock', 'home', h)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase cursor-pointer ${
                      match.footballState?.half === h
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {h.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">Minute:</span>
                  <input
                    type="number"
                    min={0}
                    max={130}
                    value={minuteInput}
                    onChange={(e) => setMinuteInput(Number(e.target.value))}
                    className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono text-white text-center"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">Added (+):</span>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={extraTimeInput}
                    onChange={(e) => setExtraTimeInput(Number(e.target.value))}
                    className="w-14 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono text-white text-center"
                  />
                </div>
                <button
                  onClick={() => handleFootballAction('clock', 'home')}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Update Clock
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 3. BADMINTON, TABLE TENNIS, VOLLEYBALL & TENNIS DECK ==================== */}
        {(match.sport === 'badminton' ||
          match.sport === 'table_tennis' ||
          match.sport === 'volleyball' ||
          match.sport === 'tennis') && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => handleRacquetPoint(match.sport, 'home')}
                className="py-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-black text-white text-2xl shadow-lg cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-colors"
              >
                <span>+ Point {match.teamA.shortName}</span>
                <span className="text-xs font-semibold opacity-90">{match.teamA.name}</span>
              </button>

              <button
                onClick={() => handleRacquetPoint(match.sport, 'away')}
                className="py-10 rounded-xl bg-blue-600 hover:bg-blue-500 font-black text-white text-2xl shadow-lg cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-colors"
              >
                <span>+ Point {match.teamB.shortName}</span>
                <span className="text-xs font-semibold opacity-90">{match.teamB.name}</span>
              </button>
            </div>

            {match.sport === 'tennis' && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleRacquetPoint('tennis', 'home', { isAce: true })}
                  className="py-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-sm hover:bg-amber-500/30 cursor-pointer"
                >
                  ⚡ Service Ace + Point ({match.teamA.shortName})
                </button>
                <button
                  onClick={() => handleRacquetPoint('tennis', 'away', { isAce: true })}
                  className="py-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-sm hover:bg-amber-500/30 cursor-pointer"
                >
                  ⚡ Service Ace + Point ({match.teamB.shortName})
                </button>
              </div>
            )}

            {match.sport === 'volleyball' && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() =>
                    handleRacquetPoint('volleyball', 'home', { type: 'timeout', teamId: 'home' })
                  }
                  className="py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-800 cursor-pointer"
                >
                  Call Timeout ({match.teamA.shortName})
                </button>
                <button
                  onClick={() =>
                    handleRacquetPoint('volleyball', 'away', { type: 'timeout', teamId: 'away' })
                  }
                  className="py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-800 cursor-pointer"
                >
                  Call Timeout ({match.teamB.shortName})
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================== 4. FIELD HOCKEY SCORING DECK ==================== */}
        {match.sport === 'field_hockey' && match.fieldHockeyState && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Home Team Hockey */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="font-bold text-base text-white">{match.teamA.name}</span>
                  <span className="font-mono text-xs text-slate-400">
                    Penalty Corners: {match.fieldHockeyState.homePenaltyCorners}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleFieldHockeyAction('goal', 'home')}
                    className="py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-black text-white text-lg cursor-pointer"
                  >
                    +1 GOAL
                  </button>
                  <button
                    onClick={() => handleFieldHockeyAction('penalty_corner', 'home')}
                    className="py-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-black text-white text-sm cursor-pointer"
                  >
                    + Penalty Corner
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleFieldHockeyAction('green_card', 'home')}
                    className="py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs cursor-pointer"
                  >
                    ▲ Green Card
                  </button>
                  <button
                    onClick={() => handleFieldHockeyAction('yellow_card', 'home')}
                    className="py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs cursor-pointer"
                  >
                    ■ Yellow Card
                  </button>
                  <button
                    onClick={() => handleFieldHockeyAction('red_card', 'home')}
                    className="py-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-xs cursor-pointer"
                  >
                    ● Red Card
                  </button>
                </div>
              </div>

              {/* Away Team Hockey */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="font-bold text-base text-white">{match.teamB.name}</span>
                  <span className="font-mono text-xs text-slate-400">
                    Penalty Corners: {match.fieldHockeyState.awayPenaltyCorners}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleFieldHockeyAction('goal', 'away')}
                    className="py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-black text-white text-lg cursor-pointer"
                  >
                    +1 GOAL
                  </button>
                  <button
                    onClick={() => handleFieldHockeyAction('penalty_corner', 'away')}
                    className="py-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-black text-white text-sm cursor-pointer"
                  >
                    + Penalty Corner
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleFieldHockeyAction('green_card', 'away')}
                    className="py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs cursor-pointer"
                  >
                    ▲ Green Card
                  </button>
                  <button
                    onClick={() => handleFieldHockeyAction('yellow_card', 'away')}
                    className="py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs cursor-pointer"
                  >
                    ■ Yellow Card
                  </button>
                  <button
                    onClick={() => handleFieldHockeyAction('red_card', 'away')}
                    className="py-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-xs cursor-pointer"
                  >
                    ● Red Card
                  </button>
                </div>
              </div>
            </div>

            {/* Quarter & Clock Strip */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Quarter:</span>
                {([1, 2, 3, 4, 'SO'] as const).map((q) => (
                  <button
                    key={String(q)}
                    onClick={() => handleFieldHockeyAction('quarter', 'home', q)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                      match.fieldHockeyState?.quarter === q
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-950 border border-slate-800 text-slate-400'
                    }`}
                  >
                    {q === 'SO' ? 'SHOOTOUT' : `Q${q}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== 5. BASEBALL SCORING DECK ==================== */}
        {match.sport === 'baseball' && match.baseballState && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => handleBaseballAction('ball')}
                className="py-4 rounded-xl bg-slate-800 hover:bg-slate-700 font-black text-white text-base cursor-pointer"
              >
                +1 Ball ({match.baseballState.balls})
              </button>
              <button
                onClick={() => handleBaseballAction('strike')}
                className="py-4 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-base cursor-pointer"
              >
                +1 Strike ({match.baseballState.strikes})
              </button>
              <button
                onClick={() => handleBaseballAction('out')}
                className="py-4 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-300 font-black text-base cursor-pointer"
              >
                +1 Out ({match.baseballState.outs})
              </button>
              <button
                onClick={() => handleBaseballAction('next_half')}
                className="py-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Next Half-Inning
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => handleBaseballAction('single')}
                className="py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white text-sm cursor-pointer"
              >
                Single (1B)
              </button>
              <button
                onClick={() => handleBaseballAction('double')}
                className="py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white text-sm cursor-pointer"
              >
                Double (2B)
              </button>
              <button
                onClick={() => handleBaseballAction('triple')}
                className="py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white text-sm cursor-pointer"
              >
                Triple (3B)
              </button>
              <button
                onClick={() => handleBaseballAction('home_run')}
                className="py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm cursor-pointer"
              >
                HOME RUN!
              </button>
            </div>
          </div>
        )}

        {/* ==================== 6. RUGBY SCORING DECK ==================== */}
        {match.sport === 'rugby' && match.rugbyState && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(['home', 'away'] as const).map((side) => {
              const team = side === 'home' ? match.teamA : match.teamB;
              return (
                <div
                  key={side}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3"
                >
                  <div className="font-bold text-base text-white border-b border-slate-800 pb-2">
                    {team.name}
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => handleRugbyAction('try', side)}
                      className="py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-black text-white text-base cursor-pointer"
                    >
                      +5 TRY
                    </button>
                    <button
                      onClick={() => handleRugbyAction('conversion', side)}
                      className="py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white text-sm cursor-pointer"
                    >
                      +2 Conversion
                    </button>
                    <button
                      onClick={() => handleRugbyAction('penalty', side)}
                      className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-white text-xs cursor-pointer"
                    >
                      +3 Penalty Goal
                    </button>
                    <button
                      onClick={() => handleRugbyAction('drop_goal', side)}
                      className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-white text-xs cursor-pointer"
                    >
                      +3 Drop Goal
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
