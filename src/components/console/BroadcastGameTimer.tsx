import React, { useState, useEffect, useRef } from 'react';
import { Match } from '../../types/sports';
import { Play, Pause, RotateCcw, Timer, FastForward, Clock } from 'lucide-react';

interface BroadcastGameTimerProps {
  match: Match;
  onSyncBasketballClock?: (payload: {
    clock: string;
    shotClock: number;
    quarter?: 1 | 2 | 3 | 4 | 'OT';
    isTimerRunning?: boolean;
  }) => Promise<void>;
  onSyncFootballClock?: (payload: {
    minute: number;
    clock: string;
    extraTime: number;
    half: string;
    isTimerRunning: boolean;
  }) => Promise<void>;
}

function parseClockToSeconds(clockStr: string, fallbackSeconds = 720): number {
  if (!clockStr || !clockStr.includes(':')) return fallbackSeconds;
  const [m, s] = clockStr.split(':').map((n) => parseInt(n, 10));
  if (isNaN(m) || isNaN(s)) return fallbackSeconds;
  return Math.max(0, m * 60 + s);
}

function formatSecondsToClock(totalSec: number): string {
  const safe = Math.max(0, Math.floor(totalSec));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const BroadcastGameTimer: React.FC<BroadcastGameTimerProps> = ({
  match,
  onSyncBasketballClock,
  onSyncFootballClock,
}) => {
  const isBasketball = match.sport === 'basketball';
  const isFootball = match.sport === 'football';

  // --- Shared Timer State ---
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 5>(1);

  // --- Basketball Specific State ---
  const [bbSeconds, setBbSeconds] = useState<number>(() =>
    parseClockToSeconds(match.basketballState?.clock || '12:00', 720)
  );
  const [bbPeriodDurationMin, setBbPeriodDurationMin] = useState<number>(12);
  const [shotClock, setShotClock] = useState<number>(match.basketballState?.shotClock ?? 24);
  const [shotClockEnabled, setShotClockEnabled] = useState<boolean>(true);
  const [customMinInput, setCustomMinInput] = useState<string>('12');
  const [customSecInput, setCustomSecInput] = useState<string>('00');

  // --- Football Specific State ---
  const [fbDirection, setFbDirection] = useState<'countup' | 'countdown'>('countup');
  const [fbSeconds, setFbSeconds] = useState<number>(() => {
    if (match.footballState?.clock) {
      return parseClockToSeconds(match.footballState.clock, (match.footballState.minute || 0) * 60);
    }
    return (match.footballState?.minute || 0) * 60;
  });
  const [fbHalf, setFbHalf] = useState<string>(match.footballState?.half || '1st');
  const [fbExtraTime, setFbExtraTime] = useState<number>(match.footballState?.extraTime ?? 0);
  const [fbTargetMinutes, setFbTargetMinutes] = useState<number>(90);

  // Sync external state when switching matches
  useEffect(() => {
    setIsRunning(false);
    if (match.sport === 'basketball' && match.basketballState) {
      const sec = parseClockToSeconds(match.basketballState.clock, 720);
      setBbSeconds(sec);
      setShotClock(match.basketballState.shotClock ?? 24);
      setCustomMinInput(String(Math.floor(sec / 60)).padStart(2, '0'));
      setCustomSecInput(String(sec % 60).padStart(2, '0'));
    } else if (match.sport === 'football' && match.footballState) {
      const sec = match.footballState.clock
        ? parseClockToSeconds(match.footballState.clock, match.footballState.minute * 60)
        : match.footballState.minute * 60;
      setFbSeconds(sec);
      setFbHalf(match.footballState.half);
      setFbExtraTime(match.footballState.extraTime);
    }
  }, [match.id, match.sport]);

  // Keep refs to latest values for interval callback
  const bbStateRef = useRef({ bbSeconds, shotClock, shotClockEnabled });
  bbStateRef.current = { bbSeconds, shotClock, shotClockEnabled };

  const fbStateRef = useRef({ fbSeconds, fbDirection, fbHalf, fbExtraTime, fbTargetMinutes });
  fbStateRef.current = { fbSeconds, fbDirection, fbHalf, fbExtraTime, fbTargetMinutes };

  // Main ticking interval
  useEffect(() => {
    if (!isRunning) return;

    const intervalMs = Math.round(1000 / speedMultiplier);
    const timer = setInterval(() => {
      if (isBasketball) {
        const prev = bbStateRef.current;
        const nextGameSec = Math.max(0, prev.bbSeconds - 1);
        const nextShot = prev.shotClockEnabled ? Math.max(0, prev.shotClock - 1) : prev.shotClock;

        setBbSeconds(nextGameSec);
        setShotClock(nextShot);

        if (nextGameSec === 0) {
          setIsRunning(false);
        }

        onSyncBasketballClock?.({
          clock: formatSecondsToClock(nextGameSec),
          shotClock: nextShot,
          isTimerRunning: nextGameSec > 0,
        });
      } else if (isFootball) {
        const prev = fbStateRef.current;
        const nextSec =
          prev.fbDirection === 'countup'
            ? prev.fbSeconds + 1
            : Math.max(0, prev.fbSeconds - 1);

        setFbSeconds(nextSec);

        if (prev.fbDirection === 'countdown' && nextSec === 0) {
          setIsRunning(false);
        }

        const currentMinute = Math.floor(nextSec / 60);
        onSyncFootballClock?.({
          minute: currentMinute,
          clock: formatSecondsToClock(nextSec),
          extraTime: prev.fbExtraTime,
          half: prev.fbHalf,
          isTimerRunning: true,
        });
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isRunning, speedMultiplier, isBasketball, isFootball]);

  // --- Basketball Handlers ---
  const syncBasketballImmediate = (nextSec: number, nextShot: number, running = isRunning) => {
    setBbSeconds(nextSec);
    setShotClock(nextShot);
    setCustomMinInput(String(Math.floor(nextSec / 60)).padStart(2, '0'));
    setCustomSecInput(String(nextSec % 60).padStart(2, '0'));
    onSyncBasketballClock?.({
      clock: formatSecondsToClock(nextSec),
      shotClock: nextShot,
      isTimerRunning: running,
    });
  };

  const handleBasketballPreset = (minutes: number) => {
    setIsRunning(false);
    setBbPeriodDurationMin(minutes);
    const totalSec = minutes * 60;
    syncBasketballImmediate(totalSec, 24, false);
  };

  const handleApplyCustomTime = () => {
    const m = Math.max(0, Math.min(99, parseInt(customMinInput, 10) || 0));
    const s = Math.max(0, Math.min(59, parseInt(customSecInput, 10) || 0));
    const total = m * 60 + s;
    if (isBasketball) {
      syncBasketballImmediate(total, shotClock, isRunning);
    } else if (isFootball) {
      syncFootballImmediate(total, fbExtraTime, fbHalf, isRunning);
    }
  };

  // --- Football Handlers ---
  const syncFootballImmediate = (
    nextSec: number,
    nextExtra = fbExtraTime,
    nextHalf = fbHalf,
    running = isRunning
  ) => {
    const safeSec = Math.max(0, nextSec);
    setFbSeconds(safeSec);
    setFbExtraTime(nextExtra);
    setFbHalf(nextHalf);
    setCustomMinInput(String(Math.floor(safeSec / 60)).padStart(2, '0'));
    setCustomSecInput(String(safeSec % 60).padStart(2, '0'));
    onSyncFootballClock?.({
      minute: Math.floor(safeSec / 60),
      clock: formatSecondsToClock(safeSec),
      extraTime: nextExtra,
      half: nextHalf,
      isTimerRunning: running,
    });
  };

  const handleFootballPeriodPreset = (
    half: string,
    startMinute: number,
    targetMinute: number
  ) => {
    setIsRunning(false);
    setFbTargetMinutes(targetMinute);
    const initialSec =
      fbDirection === 'countup' ? startMinute * 60 : (targetMinute - startMinute) * 60;
    syncFootballImmediate(initialSec, fbExtraTime, half, false);
  };

  if (!isBasketball && !isFootball) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                {isBasketball
                  ? 'Basketball Game & Shot Clock Controller'
                  : 'Football Match Duration & Stoppage Timer'}
              </h3>
              <span
                className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded ${
                  isRunning
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isRunning ? 'CLOCK RUNNING' : 'CLOCK PAUSED'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Configurable countdown/match timer synchronized in real-time with OBS ScoreBug
            </p>
          </div>
        </div>

        {/* Speed & Direction Controls */}
        <div className="flex items-center gap-2">
          {isFootball && (
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  setFbDirection('countup');
                }}
                className={`px-2.5 py-1 rounded font-semibold cursor-pointer transition-colors ${
                  fbDirection === 'countup'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Count-Up (0→90&apos;)
              </button>
              <button
                type="button"
                onClick={() => {
                  setFbDirection('countdown');
                  if (fbSeconds === 0) {
                    syncFootballImmediate(45 * 60, fbExtraTime, fbHalf, false);
                  }
                }}
                className={`px-2.5 py-1 rounded font-semibold cursor-pointer transition-colors ${
                  fbDirection === 'countdown'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Countdown (45→0&apos;)
              </button>
            </div>
          )}

          {/* Speed Multiplier */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setSpeedMultiplier(1)}
              className={`px-2.5 py-1 rounded font-mono font-bold cursor-pointer ${
                speedMultiplier === 1 ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              1x Real
            </button>
            <button
              type="button"
              onClick={() => setSpeedMultiplier(5)}
              className={`px-2.5 py-1 rounded font-mono font-bold cursor-pointer flex items-center gap-1 ${
                speedMultiplier === 5
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Fast 5x simulation speed for testing"
            >
              <FastForward className="w-3 h-3" />
              <span>5x Sim</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================== BASKETBALL TIMER BODY ==================== */}
      {isBasketball && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5 items-center">
          {/* Digital Readout Box (Cols 1-5) */}
          <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                Q{match.basketballState?.quarter || 1} GAME CLOCK
              </div>
              <div className="text-4xl font-black font-mono tabular-nums text-white tracking-tight mt-0.5">
                {formatSecondsToClock(bbSeconds)}
              </div>
            </div>

            <div className="h-12 w-[1px] bg-slate-800" />

            <div className="text-right">
              <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                SHOT CLOCK
              </div>
              <div
                className={`text-4xl font-black font-mono tabular-nums tracking-tight mt-0.5 ${
                  shotClock <= 5 ? 'text-rose-500' : 'text-amber-400'
                }`}
              >
                {String(shotClock).padStart(2, '0')}s
              </div>
            </div>
          </div>

          {/* Primary Transport & Step Nudges (Cols 6-12) */}
          <div className="lg:col-span-7 space-y-3">
            {/* Row 1: Play/Pause, Shot Clock Resets, Period Reset */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const nextRun = !isRunning;
                  setIsRunning(nextRun);
                  syncBasketballImmediate(bbSeconds, shotClock, nextRun);
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-colors ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isRunning ? 'Pause Clock' : 'Start Countdown'}</span>
              </button>

              <button
                type="button"
                onClick={() => syncBasketballImmediate(bbSeconds, 24, isRunning)}
                className="px-3.5 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs hover:bg-amber-500/30 cursor-pointer"
              >
                24s Reset
              </button>

              <button
                type="button"
                onClick={() => syncBasketballImmediate(bbSeconds, 14, isRunning)}
                className="px-3.5 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs hover:bg-amber-500/30 cursor-pointer"
              >
                14s Offensive Reb
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsRunning(false);
                  syncBasketballImmediate(bbPeriodDurationMin * 60, 24, false);
                }}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ({bbPeriodDurationMin}:00)</span>
              </button>
            </div>

            {/* Row 2: Period Length Presets + Fine Adjustments + Custom Time */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 mr-1">Presets:</span>
                {[
                  { label: '12m NBA', min: 12 },
                  { label: '10m FIBA', min: 10 },
                  { label: '8m Pro', min: 8 },
                  { label: '5m OT', min: 5 },
                ].map((p) => (
                  <button
                    key={p.min}
                    type="button"
                    onClick={() => handleBasketballPreset(p.min)}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer ${
                      bbPeriodDurationMin === p.min
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Fine Nudge Buttons */}
              <div className="flex items-center gap-1">
                {[
                  { label: '-10s', delta: -10 },
                  { label: '-1s', delta: -1 },
                  { label: '+1s', delta: 1 },
                  { label: '+10s', delta: 10 },
                ].map((adj) => (
                  <button
                    key={adj.label}
                    type="button"
                    onClick={() =>
                      syncBasketballImmediate(Math.max(0, bbSeconds + adj.delta), shotClock, isRunning)
                    }
                    className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:text-white font-mono text-xs cursor-pointer"
                  >
                    {adj.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 3: Custom MM:SS Setter & Quarter Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400">Quarter:</span>
                {([1, 2, 3, 4, 'OT'] as const).map((q) => (
                  <button
                    key={String(q)}
                    type="button"
                    onClick={() => {
                      setIsRunning(false);
                      const nextSec = q === 'OT' ? 5 * 60 : bbPeriodDurationMin * 60;
                      setBbSeconds(nextSec);
                      setShotClock(24);
                      onSyncBasketballClock?.({
                        clock: formatSecondsToClock(nextSec),
                        shotClock: 24,
                        quarter: q,
                        isTimerRunning: false,
                      });
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer ${
                      match.basketballState?.quarter === q
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {q === 'OT' ? 'OT' : `Q${q}`}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={customMinInput}
                  onChange={(e) => setCustomMinInput(e.target.value)}
                  className="w-12 bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-xs font-mono text-center text-white"
                  aria-label="Custom Minutes"
                />
                <span className="text-slate-400 font-mono">:</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={customSecInput}
                  onChange={(e) => setCustomSecInput(e.target.value)}
                  className="w-12 bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-xs font-mono text-center text-white"
                  aria-label="Custom Seconds"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomTime}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Set MM:SS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== FOOTBALL TIMER BODY ==================== */}
      {isFootball && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5 items-center">
          {/* Digital Readout Box (Cols 1-5) */}
          <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-blue-400">
                {fbHalf.replace('_', ' ').toUpperCase()} HALF •{' '}
                {fbDirection === 'countup' ? 'ELAPSED' : 'REMAINING'}
              </div>
              <div className="text-4xl font-black font-mono tabular-nums text-white tracking-tight mt-0.5">
                {formatSecondsToClock(fbSeconds)}
              </div>
            </div>

            <div className="h-12 w-[1px] bg-slate-800" />

            <div className="text-right">
              <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                ADDED TIME
              </div>
              <div className="text-3xl font-black font-mono tabular-nums text-amber-400 mt-0.5">
                +{fbExtraTime}&apos;
              </div>
            </div>
          </div>

          {/* Primary Transport & Period Controls (Cols 6-12) */}
          <div className="lg:col-span-7 space-y-3">
            {/* Row 1: Play/Pause, Nudge Buttons, Reset */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const nextRun = !isRunning;
                  setIsRunning(nextRun);
                  syncFootballImmediate(fbSeconds, fbExtraTime, fbHalf, nextRun);
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-colors ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isRunning ? 'Pause Match Clock' : 'Start Match Clock'}</span>
              </button>

              {[
                { label: '-1m', delta: -60 },
                { label: '-10s', delta: -10 },
                { label: '+10s', delta: 10 },
                { label: '+1m', delta: 60 },
              ].map((nudge) => (
                <button
                  key={nudge.label}
                  type="button"
                  onClick={() =>
                    syncFootballImmediate(
                      Math.max(0, fbSeconds + nudge.delta),
                      fbExtraTime,
                      fbHalf,
                      isRunning
                    )
                  }
                  className="px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white font-mono text-xs font-bold cursor-pointer"
                >
                  {nudge.label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  setIsRunning(false);
                  syncFootballImmediate(fbHalf === '2nd' ? 45 * 60 : 0, 0, fbHalf, false);
                }}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Half</span>
              </button>
            </div>

            {/* Row 2: Half Presets */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 mr-1">Match Period:</span>
                {[
                  { id: '1st', label: '1st Half (00:00)', start: 0, end: 45 },
                  { id: '2nd', label: '2nd Half (45:00)', start: 45, end: 90 },
                  { id: 'extra_1', label: 'ET 1st (90:00)', start: 90, end: 105 },
                  { id: 'extra_2', label: 'ET 2nd (105:00)', start: 105, end: 120 },
                  { id: 'full_time', label: 'Full Time', start: 90, end: 90 },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleFootballPeriodPreset(p.id, p.start, p.end)}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer ${
                      fbHalf === p.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 3: Stoppage Time (+1..+8) & Custom MM:SS */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400">Added Time:</span>
                {[0, 1, 2, 3, 4, 5, 6, 8].map((et) => (
                  <button
                    key={et}
                    type="button"
                    onClick={() => syncFootballImmediate(fbSeconds, et, fbHalf, isRunning)}
                    className={`px-2 py-0.5 rounded text-xs font-mono font-bold cursor-pointer ${
                      fbExtraTime === et
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    +{et}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="number"
                  min={0}
                  max={130}
                  value={customMinInput}
                  onChange={(e) => setCustomMinInput(e.target.value)}
                  className="w-12 bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-xs font-mono text-center text-white"
                  aria-label="Custom Football Minutes"
                />
                <span className="text-slate-400 font-mono">:</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={customSecInput}
                  onChange={(e) => setCustomSecInput(e.target.value)}
                  className="w-12 bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-xs font-mono text-center text-white"
                  aria-label="Custom Football Seconds"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomTime}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Set Clock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
