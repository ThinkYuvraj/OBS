import React, { useState, useEffect, useCallback } from 'react';
import { Match } from '../types/sports';
import {
  fetchMatch,
  fetchMatches,
  postBadmintonEvent,
  postBaseballEvent,
  postBasketballEvent,
  postFieldHockeyEvent,
  postFootballEvent,
  postRugbyEvent,
  postTableTennisEvent,
  postTennisEvent,
  postVolleyballEvent,
  postKabaddiEvent,
} from '../services/api';
import { useRealtimeSocket } from '../hooks/useRealtimeSocket';
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Sliders,
  Keyboard,
  RotateCcw,
  ArrowLeftRight,
  Layers,
  Move,
  BookOpen,
  LifeBuoy,
} from 'lucide-react';
import { FootballScoreBug } from '../components/overlay/FootballScoreBug';
import { BasketballScoreBug } from '../components/overlay/BasketballScoreBug';
import { RacquetVolleyScoreBug } from '../components/overlay/RacquetVolleyScoreBug';
import { OutdoorSportsScoreBug } from '../components/overlay/OutdoorSportsScoreBug';
import { KabaddiScoreBug } from '../components/overlay/KabaddiScoreBug';
import { BroadcastGameTimer } from '../components/console/BroadcastGameTimer';
import { RuleBookModal } from '../components/common/RuleBookModal';
import { HelpDeskModal } from '../components/common/HelpDeskModal';
import { MarketingluLoadingScreen } from '../components/common/MarketingluLoadingScreen';

interface MultiSportConsoleProps {
  matchId: string;
  onBack: () => void;
  onOpenOverlayStudio?: (matchId: string) => void;
  onOpenArchitecture?: () => void;
}

export const MultiSportConsole: React.FC<MultiSportConsoleProps> = ({
  matchId,
  onBack,
  onOpenOverlayStudio,
  onOpenArchitecture,
}) => {
  const [activeId, setActiveId] = useState<string>(matchId);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showRuleBook, setShowRuleBook] = useState(false);
  const [showHelpDesk, setShowHelpDesk] = useState(false);

  // Interactive Keyboard Hotkey Mode
  const [keyboardEnabled, setKeyboardEnabled] = useState(true);
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<string[]>([]);

  // Inline player / clock inputs
  const [playerNameInput, setPlayerNameInput] = useState('');
  const [minuteInput, setMinuteInput] = useState(78);
  const [extraTimeInput, setExtraTimeInput] = useState(4);

  const pushActivity = useCallback((msg: string) => {
    const time = new Date().toLocaleTimeString();
    setActivityLog((prev) => [`[${time}] ${msg}`, ...prev.slice(0, 7)]);
  }, []);

  const loadData = async (idToLoad: string) => {
    try {
      const [data, list] = await Promise.all([fetchMatch(idToLoad), fetchMatches()]);
      setMatch(data);
      setAllMatches(list.filter((m) => m.sport !== 'cricket'));
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

  // --- Football Actions ---
  const handleFootballAction = async (
    type: 'goal' | 'yellow' | 'red' | 'corner' | 'shot' | 'foul' | 'clock',
    teamId: 'home' | 'away',
    customHalf?: string,
    clockPayload?: {
      minute: number;
      clock: string;
      extraTime: number;
      half: string;
      isTimerRunning: boolean;
    }
  ) => {
    if (!match) return;
    const defaultPlayer =
      playerNameInput.trim() ||
      (teamId === 'home' ? `${match.teamA.shortName} Player` : `${match.teamB.shortName} Player`);
    const updated = await postFootballEvent(match.id, {
      type,
      teamId,
      player: defaultPlayer,
      minute: clockPayload ? clockPayload.minute : minuteInput,
      clock: clockPayload?.clock,
      extraTime: clockPayload ? clockPayload.extraTime : extraTimeInput,
      half: clockPayload ? clockPayload.half : customHalf || match.footballState?.half,
      isTimerRunning: clockPayload?.isTimerRunning,
    });
    setMatch(updated);
    if (type !== 'clock') {
      pushActivity(
        `${type.toUpperCase()} recorded for ${
          teamId === 'home' ? match.teamA.shortName : match.teamB.shortName
        }`
      );
    }
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
    isTimerRunning?: boolean;
  }) => {
    if (!match) return;
    const updated = await postBasketballEvent(match.id, {
      ...payload,
      player:
        playerNameInput.trim() ||
        (payload.teamId === 'home' ? match.teamA.shortName : match.teamB.shortName),
    });
    setMatch(updated);
    if (payload.type === 'score') {
      pushActivity(
        `${payload.teamId === 'home' ? match.teamA.shortName : match.teamB.shortName} ${
          (payload.points || 0) > 0 ? `+${payload.points}` : payload.points
        } pts`
      );
    }
  };

  // --- Racquet & Volleyball Actions (Badminton, Table Tennis, Volleyball, Tennis) ---
  const handleRacquetPoint = async (
    sport: string,
    winner: 'home' | 'away',
    extra?: { isAce?: boolean; type?: any; teamId?: 'home' | 'away'; delta?: number }
  ) => {
    if (!match) return;
    try {
      let updated: Match;
      if (sport === 'badminton') {
        updated = await postBadmintonEvent(match.id, { winner, ...extra });
      } else if (sport === 'table_tennis') {
        updated = await postTableTennisEvent(match.id, { winner, ...extra });
      } else if (sport === 'tennis') {
        updated = await postTennisEvent(match.id, { winner, isAce: extra?.isAce });
      } else {
        updated = await postVolleyballEvent(match.id, { winner, ...extra });
      }
      setMatch(updated);
      const label =
        extra?.type === 'swap_server'
          ? 'Server swapped'
          : extra?.type === 'reset_set'
          ? 'Current set reset to 0-0'
          : `${winner === 'home' ? match.teamA.shortName : match.teamB.shortName} ${
              extra?.delta === -1 ? '-1 Pt Correction' : '+1 Point'
            }`;
      pushActivity(label);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Field Hockey Actions ---
  const handleFieldHockeyAction = async (
    type: string,
    teamId: 'home' | 'away',
    quarter?: 1 | 2 | 3 | 4 | 'SO'
  ) => {
    if (!match) return;
    const updated = await postFieldHockeyEvent(match.id, {
      type,
      teamId,
      player: playerNameInput.trim() || undefined,
      quarter: quarter || match.fieldHockeyState?.quarter,
      minute: minuteInput,
    });
    setMatch(updated);
    pushActivity(
      `${type.replace('_', ' ').toUpperCase()} (${
        teamId === 'home' ? match.teamA.shortName : match.teamB.shortName
      })`
    );
  };

  // --- Baseball Actions ---
  const handleBaseballAction = async (
    type: string,
    extra?: { teamId?: 'home' | 'away'; base?: 'first' | 'second' | 'third' }
  ) => {
    if (!match) return;
    const updated = await postBaseballEvent(match.id, {
      type,
      player: playerNameInput.trim() || undefined,
      ...extra,
    });
    setMatch(updated);
    pushActivity(`Baseball: ${type.toUpperCase()}`);
  };

  // --- Rugby Actions ---
  const handleRugbyAction = async (type: string, teamId: 'home' | 'away', half?: string) => {
    if (!match) return;
    const updated = await postRugbyEvent(match.id, {
      type,
      teamId,
      player: playerNameInput.trim() || undefined,
      minute: minuteInput,
      half: half || match.rugbyState?.half,
    });
    setMatch(updated);
    pushActivity(`Rugby: ${type.toUpperCase()}`);
  };

  // --- Kabaddi Actions ---
  const handleKabaddiAction = async (
    type: string,
    teamId?: 'home' | 'away',
    touchCount?: number,
    bonus?: boolean
  ) => {
    if (!match) return;
    const defaultPlayer =
      playerNameInput.trim() ||
      (teamId === 'home'
        ? match.teamA.squad[0]?.name || match.teamA.shortName
        : match.teamB.squad[0]?.name || match.teamB.shortName);

    try {
      const res = await postKabaddiEvent(match.id, {
        type,
        teamId,
        touchCount,
        bonus,
        player: defaultPlayer,
      });
      setMatch(res.match);
      pushActivity(`Kabaddi: ${type.replace('_', ' ').toUpperCase()} by ${defaultPlayer}`);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Global Keyboard Hotkey Listener ---
  useEffect(() => {
    if (!keyboardEnabled || !match) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not intercept if user is typing in an input or textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const key = e.key.toUpperCase();
      setLastKeyPressed(key === 'ARROWLEFT' ? '←' : key === 'ARROWRIGHT' ? '→' : key);
      setTimeout(() => setLastKeyPressed(null), 350);

      const isRacquetOrVolley =
        match.sport === 'table_tennis' ||
        match.sport === 'volleyball' ||
        match.sport === 'badminton' ||
        match.sport === 'tennis';

      if (isRacquetOrVolley) {
        if (key === 'A' || e.key === 'ArrowLeft') {
          e.preventDefault();
          handleRacquetPoint(match.sport, 'home');
        } else if (key === 'L' || e.key === 'ArrowRight') {
          e.preventDefault();
          handleRacquetPoint(match.sport, 'away');
        } else if (key === 'Z') {
          e.preventDefault();
          handleRacquetPoint(match.sport, 'home', { delta: -1 });
        } else if (key === 'M') {
          e.preventDefault();
          handleRacquetPoint(match.sport, 'away', { delta: -1 });
        } else if (key === 'S') {
          e.preventDefault();
          handleRacquetPoint(match.sport, 'home', { type: 'swap_server' });
        } else if (key === 'R') {
          e.preventDefault();
          handleRacquetPoint(match.sport, 'home', { type: 'reset_set' });
        }
      } else if (match.sport === 'basketball') {
        if (key === '1') handleBasketballAction({ type: 'score', teamId: 'home', points: 1 });
        else if (key === '2') handleBasketballAction({ type: 'score', teamId: 'home', points: 2 });
        else if (key === '3') handleBasketballAction({ type: 'score', teamId: 'home', points: 3 });
        else if (key === '8') handleBasketballAction({ type: 'score', teamId: 'away', points: 1 });
        else if (key === '9') handleBasketballAction({ type: 'score', teamId: 'away', points: 2 });
        else if (key === '0') handleBasketballAction({ type: 'score', teamId: 'away', points: 3 });
        else if (key === 'S') handleBasketballAction({ type: 'possession' });
      } else if (match.sport === 'football') {
        if (key === 'A') handleFootballAction('goal', 'home');
        else if (key === 'L') handleFootballAction('goal', 'away');
      } else if (match.sport === 'field_hockey') {
        if (key === 'A') handleFieldHockeyAction('goal', 'home');
        else if (key === 'L') handleFieldHockeyAction('goal', 'away');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyboardEnabled, match, playerNameInput, minuteInput, extraTimeInput]);

  if (loading || !match) {
    return (
      <MarketingluLoadingScreen
        message="Loading Multi-Sport Broadcast Console..."
        subMessage="Syncing scoreboard clocks, shot timers, live telemetry & OBS score bug layer"
        fullScreen={true}
        onCancel={onBack}
      />
    );
  }

  const obsUrl = `${window.location.origin}/overlay/${match.activeOverlayToken}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(obsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Compute main headline score for top console card
  let mainScoreDisplay = '0 - 0';
  let subStatusDisplay = 'LIVE BROADCAST FEED';

  if (match.sport === 'football' && match.footballState) {
    mainScoreDisplay = `${match.footballState.homeScore} - ${match.footballState.awayScore}`;
    subStatusDisplay = `${match.footballState.half.toUpperCase()} HALF • ${
      match.footballState.clock || `${match.footballState.minute}:00`
    } (+${match.footballState.extraTime})`;
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
  } else if (match.sport === 'kabaddi' && match.kabaddiState) {
    mainScoreDisplay = `${match.kabaddiState.homeScore} - ${match.kabaddiState.awayScore}`;
    subStatusDisplay = `${match.kabaddiState.half.toUpperCase()} • RAID: ${match.kabaddiState.raidClock}s • RAIDING: ${match.kabaddiState.raidingTeam.toUpperCase()} • ON MAT: ${match.kabaddiState.homeActivePlayers}-${match.kabaddiState.awayActivePlayers}`;
  }

  // Extract Sets Array for Table Tennis, Volleyball, Badminton, Tennis
  const activeSets =
    match.sport === 'table_tennis'
      ? match.tableTennisState?.sets || []
      : match.sport === 'volleyball'
      ? match.volleyballState?.sets || []
      : match.sport === 'badminton'
      ? match.badmintonState?.sets || []
      : match.sport === 'tennis'
      ? match.tennisState?.sets || []
      : [];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 pb-24 sm:pb-16 w-full overflow-x-hidden">
      {/* Top Studio Header */}
      <div className="bg-gradient-to-r from-[#0c1424] via-[#090f1f] to-[#0c1424] border-b border-slate-800/80 px-3 sm:px-6 py-2.5 sm:py-3.5 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-[#060a14] border border-slate-800 hover:border-cyan-500/40 text-slate-300 transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="text-[10px] sm:text-[11px] font-extrabold text-cyan-400 uppercase tracking-wider font-mono truncate">
              {match.sport.replace('_', ' ').toUpperCase()} • MARKETINGLU CYAN-SKY DEFAULT
            </div>
            <h1 className="text-base sm:text-lg font-black text-white font-['Space_Grotesk',sans-serif] truncate">{match.name}</h1>
          </div>
        </div>

        {/* Quick Sport Switcher Bar + OBS Copy Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {allMatches.length > 1 && (
            <select
              value={activeId}
              onChange={(e) => {
                setActiveId(e.target.value);
                loadData(e.target.value);
              }}
              className="bg-[#060a14] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-semibold focus:outline-none focus:border-cyan-400"
            >
              {allMatches.map((m) => (
                <option key={m.id} value={m.id}>
                  [{m.sport.replace('_', ' ').toUpperCase()}] {m.name}
                </option>
              ))}
            </select>
          )}

          {onOpenArchitecture && (
            <button
              onClick={onOpenArchitecture}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#060a14] border border-slate-800 hover:border-cyan-500/40 text-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>3-Tier Architecture</span>
            </button>
          )}

          {onOpenOverlayStudio && (
            <button
              onClick={() => onOpenOverlayStudio(match.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#060a14] border border-slate-800 hover:border-cyan-500/40 text-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Overlay Studio</span>
            </button>
          )}

          <button
            onClick={() => setShowRuleBook(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#060a14] hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 rounded-xl transition-colors cursor-pointer shadow-sm"
            title={`Open Official ${match.sport.replace('_', ' ')} Rule Book`}
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Rule Book</span>
          </button>

          <button
            onClick={() => setShowHelpDesk(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#060a14] hover:bg-slate-800 border border-amber-500/40 text-amber-300 hover:text-amber-200 rounded-xl transition-colors cursor-pointer shadow-sm"
            title="Report Match or Broadcast Issue to Help Desk (Email: support@marketinglu.com)"
          >
            <LifeBuoy className="w-3.5 h-3.5 text-amber-400" />
            <span>Report Issue</span>
          </button>

          {/* Move Scoreboard in OBS Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#060a14] border border-slate-800 rounded-xl px-2 py-1">
            <Move className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              defaultValue="default"
              onChange={(e) => {
                const val = e.target.value;
                let targetUrl = obsUrl;
                if (val === 'top-left') targetUrl = `${obsUrl}?pos=top-left`;
                else if (val === 'top-right') targetUrl = `${obsUrl}?pos=top-right`;
                else if (val === 'top-center') targetUrl = `${obsUrl}?pos=top-center`;
                else if (val === 'bottom-center') targetUrl = `${obsUrl}?pos=bottom-center`;
                else if (val === 'bottom-right') targetUrl = `${obsUrl}?pos=bottom-right`;
                else if (val === 'movable') targetUrl = `${obsUrl}?movable=1`;
                navigator.clipboard.writeText(targetUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2200);
              }}
              className="bg-transparent text-xs text-slate-300 font-mono focus:outline-none cursor-pointer"
              title="Select OBS Position & Copy URL"
            >
              <option value="default" className="bg-[#060a14]">OBS Position: Auto</option>
              <option value="top-left" className="bg-[#060a14]">Copy URL: Top-Left</option>
              <option value="top-center" className="bg-[#060a14]">Copy URL: Top-Center</option>
              <option value="top-right" className="bg-[#060a14]">Copy URL: Top-Right</option>
              <option value="bottom-center" className="bg-[#060a14]">Copy URL: Bottom-Center</option>
              <option value="bottom-right" className="bg-[#060a14]">Copy URL: Bottom-Right</option>
              <option value="movable" className="bg-[#060a14]">Copy URL: Movable Drag Mode (?movable=1)</option>
            </select>
          </div>

          <button
            onClick={handleCopyUrl}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl transition-colors cursor-pointer shadow-md shadow-cyan-500/20"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Positioned URL!' : 'Copy OBS URL'}</span>
          </button>

          <a
            href={`${obsUrl}?movable=1`}
            target="_blank"
            rel="noreferrer"
            className="p-2 bg-[#0c1424] border border-slate-800 hover:border-cyan-500/40 text-cyan-300 rounded-xl"
            title="Open Live Broadcast Overlay with Movable Scoreboard Handle"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 mt-4 sm:mt-6 space-y-4 sm:space-y-6 w-full overflow-hidden">
        {/* Fast Sport Channel Pills (Instant 1-Click Switch between Table Tennis, Volleyball, Badminton, Basketball, Football, Tennis, Field Hockey) */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#090f1f] border border-slate-800/80 rounded-xl p-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {allMatches.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setActiveId(m.id);
                  loadData(m.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  m.id === activeId
                    ? 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                    : 'bg-[#060a14] text-slate-400 hover:text-white border border-slate-800/80'
                }`}
              >
                {m.sport.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>

          {/* Keyboard Hotkeys Active Toggle */}
          <button
            type="button"
            onClick={() => setKeyboardEnabled((v) => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border cursor-pointer transition-colors ${
              keyboardEnabled
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                : 'bg-[#060a14] border-slate-800 text-slate-400'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>KEYBOARD HOTKEYS: {keyboardEnabled ? 'ACTIVE' : 'OFF'}</span>
            {lastKeyPressed && (
              <span className="px-1.5 py-0.5 rounded bg-cyan-400 text-slate-950 font-black">
                [{lastKeyPressed}]
              </span>
            )}
          </button>
        </div>

        {/* High-Contrast Scoreboard & Live Bug Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Cols: Master Score & Player Attribution */}
          <div className="lg:col-span-7 bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between">
              {/* Team A */}
              <div className="flex-1 text-center">
                <div className="inline-flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: match.teamA.color || '#06b6d4' }}
                  />
                  <span className="text-lg font-extrabold text-white">{match.teamA.name}</span>
                </div>
                <div className="text-xs text-slate-400 font-mono mt-1">{match.teamA.shortName} (HOME)</div>
              </div>

              {/* Center Score */}
              <div className="px-6 text-center">
                <div className="text-5xl font-black font-mono tabular-nums text-white tracking-tight">
                  {mainScoreDisplay}
                </div>
                <div className="text-[11px] text-cyan-400 font-mono font-bold mt-1.5 uppercase tracking-wider">
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
                className="flex-1 min-w-[220px] bg-[#060a14] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Right 5 Cols: Real-Time Broadcast Graphic Monitor */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between overflow-hidden shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
              <span className="text-cyan-400 font-bold">LIVE OBS GRAPHIC MONITOR</span>
              <span className="text-emerald-400 font-bold">ON AIR</span>
            </div>
            <div className="bg-[#060a14] border border-slate-800/90 rounded-xl p-4 flex items-center justify-center overflow-x-auto min-h-[120px]">
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
              {match.sport === 'kabaddi' && match.kabaddiState && (
                <KabaddiScoreBug
                  teamA={match.teamA}
                  teamB={match.teamB}
                  state={match.kabaddiState}
                  config={{ ...match.overlayConfig, scale: 0.85 }}
                  tournamentName={match.tournament}
                />
              )}
            </div>
          </div>
        </div>

        {/* ==================== CONFIGURABLE COUNTDOWN / GAME TIMER (BASKETBALL & FOOTBALL) ==================== */}
        {(match.sport === 'basketball' || match.sport === 'football') && (
          <BroadcastGameTimer
            match={match}
            onSyncBasketballClock={async (payload) => {
              await handleBasketballAction({
                type: payload.quarter ? 'quarter' : 'clock',
                clock: payload.clock,
                shotClock: payload.shotClock,
                quarter: payload.quarter,
                isTimerRunning: payload.isTimerRunning,
              });
            }}
            onSyncFootballClock={async (payload) => {
              await handleFootballAction('clock', 'home', payload.half, payload);
            }}
          />
        )}

        {/* ==================== 1. BASKETBALL SCORING DECK ==================== */}
        {match.sport === 'basketball' && match.basketballState && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Home Team Deck */}
              <div className="bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-2xl p-5 space-y-4">
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
                    className="py-4 rounded-xl bg-[#060a14] hover:bg-[#0d1a33] border border-slate-800 font-black text-white text-lg cursor-pointer transition-colors flex flex-col items-center"
                  >
                    <span>+1 FT</span>
                    <span className="text-[10px] font-mono text-slate-400 mt-0.5">Key [1]</span>
                  </button>
                  <button
                    onClick={() =>
                      handleBasketballAction({ type: 'score', teamId: 'home', points: 2 })
                    }
                    className="py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-black text-white text-lg cursor-pointer transition-colors flex flex-col items-center"
                  >
                    <span>+2 FG</span>
                    <span className="text-[10px] font-mono text-cyan-100 mt-0.5">Key [2]</span>
                  </button>
                  <button
                    onClick={() =>
                      handleBasketballAction({ type: 'score', teamId: 'home', points: 3 })
                    }
                    className="py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-lg cursor-pointer transition-colors flex flex-col items-center"
                  >
                    <span>+3 3PT</span>
                    <span className="text-[10px] font-mono text-slate-900 mt-0.5">Key [3]</span>
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
                    className="py-2 rounded-lg bg-[#060a14] border border-slate-800 text-slate-300 font-bold text-xs hover:border-cyan-500/40 cursor-pointer"
                  >
                    Call Timeout
                  </button>
                  <button
                    onClick={() =>
                      handleBasketballAction({ type: 'score', teamId: 'home', points: -1 })
                    }
                    className="py-2 rounded-lg bg-[#060a14] border border-slate-800 text-slate-400 font-bold text-xs hover:text-white cursor-pointer"
                  >
                    -1 Pt Fix
                  </button>
                </div>
              </div>

              {/* Away Team Deck */}
              <div className="bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-2xl p-5 space-y-4">
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
                    className="py-4 rounded-xl bg-[#060a14] hover:bg-[#0d1a33] border border-slate-800 font-black text-white text-lg cursor-pointer transition-colors flex flex-col items-center"
                  >
                    <span>+1 FT</span>
                    <span className="text-[10px] font-mono text-slate-400 mt-0.5">Key [8]</span>
                  </button>
                  <button
                    onClick={() =>
                      handleBasketballAction({ type: 'score', teamId: 'away', points: 2 })
                    }
                    className="py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-black text-white text-lg cursor-pointer transition-colors flex flex-col items-center"
                  >
                    <span>+2 FG</span>
                    <span className="text-[10px] font-mono text-cyan-100 mt-0.5">Key [9]</span>
                  </button>
                  <button
                    onClick={() =>
                      handleBasketballAction({ type: 'score', teamId: 'away', points: 3 })
                    }
                    className="py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-lg cursor-pointer transition-colors flex flex-col items-center"
                  >
                    <span>+3 3PT</span>
                    <span className="text-[10px] font-mono text-slate-900 mt-0.5">Key [0]</span>
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
                    className="py-2 rounded-lg bg-[#060a14] border border-slate-800 text-slate-300 font-bold text-xs hover:border-cyan-500/40 cursor-pointer"
                  >
                    Call Timeout
                  </button>
                  <button
                    onClick={() =>
                      handleBasketballAction({ type: 'score', teamId: 'away', points: -1 })
                    }
                    className="py-2 rounded-lg bg-[#060a14] border border-slate-800 text-slate-400 font-bold text-xs hover:text-white cursor-pointer"
                  >
                    -1 Pt Fix
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 2. FOOTBALL SCORING DECK ==================== */}
        {match.sport === 'football' && match.footballState && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Home Team Football Controls */}
              <div className="bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="font-bold text-base text-white">{match.teamA.name} (Home)</span>
                  <span className="font-mono text-xs text-slate-400">
                    Shots: {match.footballState.homeShots} • Corners: {match.footballState.homeCorners}
                  </span>
                </div>
                <button
                  onClick={() => handleFootballAction('goal', 'home')}
                  className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-black text-white text-lg shadow-lg cursor-pointer transition-colors flex flex-col items-center"
                >
                  <span>+ GOAL ({match.teamA.shortName})</span>
                  <span className="text-[10px] font-mono text-emerald-200">Hotkey [A]</span>
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
                    className="py-2.5 rounded-lg bg-[#060a14] border border-slate-800 text-slate-200 font-bold text-xs hover:border-cyan-500/40 cursor-pointer"
                  >
                    +1 Corner
                  </button>
                </div>
              </div>

              {/* Away Team Football Controls */}
              <div className="bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="font-bold text-base text-white">{match.teamB.name} (Away)</span>
                  <span className="font-mono text-xs text-slate-400">
                    Shots: {match.footballState.awayShots} • Corners: {match.footballState.awayCorners}
                  </span>
                </div>
                <button
                  onClick={() => handleFootballAction('goal', 'away')}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-black text-white text-lg shadow-lg cursor-pointer transition-colors flex flex-col items-center"
                >
                  <span>+ GOAL ({match.teamB.shortName})</span>
                  <span className="text-[10px] font-mono text-cyan-100">Hotkey [L]</span>
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
                    className="py-2.5 rounded-lg bg-[#060a14] border border-slate-800 text-slate-200 font-bold text-xs hover:border-cyan-500/40 cursor-pointer"
                  >
                    +1 Corner
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 3. TABLE TENNIS, VOLLEYBALL, BADMINTON & TENNIS INTERACTIVE KEYBOARD DECK ==================== */}
        {(match.sport === 'badminton' ||
          match.sport === 'table_tennis' ||
          match.sport === 'volleyball' ||
          match.sport === 'tennis') && (
          <div className="space-y-6">
            {/* Primary Tactile Rally Point Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                <button
                  onClick={() => handleRacquetPoint(match.sport, 'home')}
                  className="w-full py-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-black text-white text-2xl shadow-lg cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-colors"
                >
                  <span>+1 Point {match.teamA.shortName}</span>
                  <span className="text-xs font-semibold opacity-90">{match.teamA.name}</span>
                  <span className="mt-1 px-2.5 py-0.5 rounded bg-slate-950/40 text-[11px] font-mono text-emerald-200">
                    Press [A] or [← Left Arrow]
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleRacquetPoint(match.sport, 'home', { delta: -1 })}
                    className="py-2.5 rounded-xl bg-[#060a14] border border-slate-800 text-slate-300 hover:text-white font-mono text-xs font-bold cursor-pointer"
                  >
                    -1 Pt Correction [Z]
                  </button>
                  {match.sport === 'tennis' ? (
                    <button
                      onClick={() => handleRacquetPoint('tennis', 'home', { isAce: true })}
                      className="py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs hover:bg-amber-500/30 cursor-pointer"
                    >
                      ⚡ Service Ace
                    </button>
                  ) : match.sport === 'volleyball' ? (
                    <button
                      onClick={() =>
                        handleRacquetPoint('volleyball', 'home', { type: 'timeout', teamId: 'home' })
                      }
                      className="py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs hover:bg-amber-500/30 cursor-pointer"
                    >
                      Timeout ({match.volleyballState?.homeTimeouts ?? 0}/2)
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRacquetPoint(match.sport, 'home', { type: 'swap_server' })}
                      className="py-2.5 rounded-xl bg-[#060a14] border border-slate-800 text-slate-200 font-bold text-xs hover:border-cyan-500/40 cursor-pointer"
                    >
                      Set Server [S]
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                <button
                  onClick={() => handleRacquetPoint(match.sport, 'away')}
                  className="w-full py-8 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-black text-white text-2xl shadow-lg cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-colors"
                >
                  <span>+1 Point {match.teamB.shortName}</span>
                  <span className="text-xs font-semibold opacity-90">{match.teamB.name}</span>
                  <span className="mt-1 px-2.5 py-0.5 rounded bg-slate-950/40 text-[11px] font-mono text-cyan-100">
                    Press [L] or [→ Right Arrow]
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleRacquetPoint(match.sport, 'away', { delta: -1 })}
                    className="py-2.5 rounded-xl bg-[#060a14] border border-slate-800 text-slate-300 hover:text-white font-mono text-xs font-bold cursor-pointer"
                  >
                    -1 Pt Correction [M]
                  </button>
                  {match.sport === 'tennis' ? (
                    <button
                      onClick={() => handleRacquetPoint('tennis', 'away', { isAce: true })}
                      className="py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs hover:bg-amber-500/30 cursor-pointer"
                    >
                      ⚡ Service Ace
                    </button>
                  ) : match.sport === 'volleyball' ? (
                    <button
                      onClick={() =>
                        handleRacquetPoint('volleyball', 'away', { type: 'timeout', teamId: 'away' })
                      }
                      className="py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs hover:bg-amber-500/30 cursor-pointer"
                    >
                      Timeout ({match.volleyballState?.awayTimeouts ?? 0}/2)
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRacquetPoint(match.sport, 'away', { type: 'swap_server' })}
                      className="py-2.5 rounded-xl bg-[#060a14] border border-slate-800 text-slate-200 font-bold text-xs hover:border-cyan-500/40 cursor-pointer"
                    >
                      Set Server [S]
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Interactive Set-by-Set Score Matrix & Court Controls */}
            <div className="bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                  SET SCOREBOARD:
                </span>
                <div className="flex items-center gap-2">
                  {activeSets.map((s, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-[#060a14] border border-slate-800 font-mono text-xs font-bold text-white"
                    >
                      Set {idx + 1}: <span className="text-emerald-400">{s.home}</span> -{' '}
                      <span className="text-cyan-400">{s.away}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => handleRacquetPoint(match.sport, 'home', { type: 'swap_server' })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#060a14] border border-slate-800 hover:border-cyan-500/40 text-xs font-bold text-white cursor-pointer"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Swap Server [S]</span>
                </button>
                <button
                  onClick={() => handleRacquetPoint(match.sport, 'home', { type: 'reset_set' })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#060a14] border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Current Set [R]</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 4. FIELD HOCKEY SCORING DECK ==================== */}
        {match.sport === 'field_hockey' && match.fieldHockeyState && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Home Team Hockey */}
              <div className="bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-2xl p-5 space-y-4">
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
                    +1 GOAL [A]
                  </button>
                  <button
                    onClick={() => handleFieldHockeyAction('penalty_corner', 'home')}
                    className="py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-black text-white text-sm cursor-pointer"
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
              <div className="bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-2xl p-5 space-y-4">
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
                    +1 GOAL [L]
                  </button>
                  <button
                    onClick={() => handleFieldHockeyAction('penalty_corner', 'away')}
                    className="py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-black text-white text-sm cursor-pointer"
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
            <div className="bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Quarter:</span>
                {([1, 2, 3, 4, 'SO'] as const).map((q) => (
                  <button
                    key={String(q)}
                    onClick={() => handleFieldHockeyAction('quarter', 'home', q)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                      match.fieldHockeyState?.quarter === q
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                        : 'bg-[#060a14] border border-slate-800 text-slate-400'
                    }`}
                  >
                    {q === 'SO' ? 'SHOOTOUT' : `Q${q}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== 5. BASEBALL & RUGBY SCORING DECKS ==================== */}
        {match.sport === 'baseball' && match.baseballState && (
          <div className="bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-2xl p-6 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => handleBaseballAction('ball')}
                className="py-4 rounded-xl bg-[#060a14] hover:bg-[#0d1a33] border border-slate-800 font-black text-white text-base cursor-pointer"
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
                className="py-4 rounded-xl bg-[#060a14] border border-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Next Half-Inning
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => handleBaseballAction('single')}
                className="py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-white text-sm cursor-pointer"
              >
                Single (1B)
              </button>
              <button
                onClick={() => handleBaseballAction('double')}
                className="py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-white text-sm cursor-pointer"
              >
                Double (2B)
              </button>
              <button
                onClick={() => handleBaseballAction('triple')}
                className="py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-white text-sm cursor-pointer"
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

        {match.sport === 'rugby' && match.rugbyState && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(['home', 'away'] as const).map((side) => {
              const team = side === 'home' ? match.teamA : match.teamB;
              return (
                <div
                  key={side}
                  className="bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-2xl p-5 space-y-3"
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
                      className="py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-white text-sm cursor-pointer"
                    >
                      +2 Conversion
                    </button>
                    <button
                      onClick={() => handleRugbyAction('penalty', side)}
                      className="py-3 rounded-xl bg-[#060a14] border border-slate-800 font-bold text-white text-xs cursor-pointer"
                    >
                      +3 Penalty Goal
                    </button>
                    <button
                      onClick={() => handleRugbyAction('drop_goal', side)}
                      className="py-3 rounded-xl bg-[#060a14] border border-slate-800 font-bold text-white text-xs cursor-pointer"
                    >
                      +3 Drop Goal
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {match.sport === 'kabaddi' && match.kabaddiState && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(['home', 'away'] as const).map((side) => {
                const team = side === 'home' ? match.teamA : match.teamB;
                const isRaiding = match.kabaddiState?.raidingTeam === side;
                const activeOnMat =
                  side === 'home'
                    ? match.kabaddiState?.homeActivePlayers
                    : match.kabaddiState?.awayActivePlayers;

                return (
                  <div
                    key={side}
                    className={`bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border rounded-2xl p-5 space-y-4 shadow-xl transition-all ${
                      isRaiding ? 'border-cyan-400 ring-2 ring-cyan-500/20' : 'border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-white">{team.name}</span>
                        <span className="text-xs font-mono text-cyan-400">({activeOnMat}/7 On Mat)</span>
                      </div>
                      {isRaiding && (
                        <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-400 animate-pulse">
                          RAIDING NOW
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">Raid Actions</div>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleKabaddiAction('touch_point', side, 1)}
                          className="py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-slate-950 text-xs cursor-pointer shadow"
                        >
                          +1 Touch
                        </button>
                        <button
                          onClick={() => handleKabaddiAction('touch_point', side, 2)}
                          className="py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-slate-950 text-xs cursor-pointer shadow"
                        >
                          +2 Touch
                        </button>
                        <button
                          onClick={() => handleKabaddiAction('bonus_point', side)}
                          className="py-3 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 text-xs cursor-pointer"
                        >
                          +1 Bonus
                        </button>
                      </div>

                      <button
                        onClick={() => handleKabaddiAction('super_raid', side, 3, true)}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 font-black text-white text-xs tracking-wider cursor-pointer shadow-lg shadow-orange-500/20"
                      >
                        🔥 SUPER RAID (+3 &amp; Bonus)
                      </button>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">Defense Actions</div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleKabaddiAction('tackle', side)}
                          className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs cursor-pointer"
                        >
                          +1 Tackle
                        </button>
                        <button
                          onClick={() => handleKabaddiAction('super_tackle', side)}
                          className="py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white text-xs cursor-pointer"
                        >
                          🛡️ Super Tackle (+2)
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Raid Clock & Match Actions */}
            <div className="p-4 rounded-2xl bg-[#090f1f] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400 uppercase font-bold">30s Raid Clock:</span>
                <span className="font-mono text-2xl font-black text-amber-400">
                  {match.kabaddiState.raidClock}s
                </span>
                <button
                  onClick={() => handleKabaddiAction('raid_clock_reset')}
                  className="px-3 py-1.5 rounded-xl bg-[#060a14] border border-slate-700 hover:border-cyan-400 text-xs font-mono text-cyan-300 cursor-pointer"
                >
                  Reset Clock (30s)
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleKabaddiAction('empty_raid')}
                  className="px-3.5 py-2 rounded-xl bg-[#060a14] border border-slate-700 hover:border-slate-600 text-xs font-bold text-slate-300 cursor-pointer"
                >
                  Empty Raid
                </button>
                <button
                  onClick={() => handleKabaddiAction('switch_raider')}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400 text-xs font-bold text-cyan-300 cursor-pointer"
                >
                  Switch Raider Side
                </button>
                <button
                  onClick={() => handleKabaddiAction('all_out')}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs cursor-pointer shadow"
                >
                  💥 All-Out (+2 Pts &amp; Revive)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== INTERACTIVE KEYBOARD REFERENCE & LIVE CONSOLE FEED ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                <Keyboard className="w-4 h-4" />
                <span>Operator Keyboard Deck Shortcuts</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Zero-Latency Tactile Input</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-[#060a14] border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Home +1 Pt / Goal</span>
                <kbd className="px-2 py-0.5 rounded bg-[#0c1424] border border-cyan-500/40 text-cyan-300 font-mono font-bold">
                  A / ←
                </kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-[#060a14] border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Away +1 Pt / Goal</span>
                <kbd className="px-2 py-0.5 rounded bg-[#0c1424] border border-cyan-500/40 text-cyan-300 font-mono font-bold">
                  L / →
                </kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-[#060a14] border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Swap Server / Poss</span>
                <kbd className="px-2 py-0.5 rounded bg-[#0c1424] border border-slate-700 text-amber-300 font-mono font-bold">
                  S
                </kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-[#060a14] border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Home -1 Pt Fix</span>
                <kbd className="px-2 py-0.5 rounded bg-[#0c1424] border border-slate-700 text-slate-300 font-mono font-bold">
                  Z
                </kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-[#060a14] border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Away -1 Pt Fix</span>
                <kbd className="px-2 py-0.5 rounded bg-[#0c1424] border border-slate-700 text-slate-300 font-mono font-bold">
                  M
                </kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-[#060a14] border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Basketball +1/+2/+3</span>
                <kbd className="px-2 py-0.5 rounded bg-[#0c1424] border border-cyan-500/40 text-cyan-300 font-mono font-bold">
                  1/2/3 • 8/9/0
                </kbd>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-2xl p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono mb-3">
              Live Operator Action Feed
            </div>
            <div className="bg-[#060a14] border border-slate-800 rounded-xl p-3 font-mono text-xs space-y-1.5 min-h-[104px]">
              {activityLog.length === 0 ? (
                <div className="text-slate-500">
                  Press any scoring button or keyboard shortcut ([A], [L], [S]) to log broadcast events...
                </div>
              ) : (
                activityLog.map((item, idx) => (
                  <div
                    key={idx}
                    className={idx === 0 ? 'text-emerald-400 font-bold' : 'text-slate-400'}
                  >
                    {item}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Official In-Game Rule Book Modal */}
      <RuleBookModal
        isOpen={showRuleBook}
        onClose={() => setShowRuleBook(false)}
        initialSport={match.sport}
      />

      {/* In-Game Client Issue Reporting Help Desk */}
      <HelpDeskModal
        isOpen={showHelpDesk}
        onClose={() => setShowHelpDesk(false)}
        matchId={match.id}
        matchName={match.name}
        sport={match.sport}
        overlayToken={match.activeOverlayToken}
      />
    </div>
  );
};
