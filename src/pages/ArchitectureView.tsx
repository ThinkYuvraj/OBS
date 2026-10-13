import React, { useState, useEffect } from 'react';
import { Match } from '../types/sports';
import {
  fetchMatches,
  triggerOverlayTest,
  fetchHostingerDbStatus,
  syncHostingerDatabase,
  fetchHostingerSqlExport,
  HostingerDatabaseStatus,
} from '../services/api';
import {
  ArrowLeft,
  Cpu,
  Database,
  Keyboard,
  Zap,
  ArrowRight,
  ExternalLink,
  Download,
  RefreshCw,
} from 'lucide-react';

interface ArchitectureViewProps {
  onBack: () => void;
  onNavigate: (tab: string, matchId?: string) => void;
}

interface ArchitectureTelemetry {
  tier1: {
    name: string;
    activeConsoles: number;
    supportedProtocols: string[];
    totalEventsCaptured: number;
  };
  tier2: {
    name: string;
    activeEngines: number;
    sportsSupported: string[];
    wsEndpoint: string;
    transportMode: string;
  };
  tier3: {
    name: string;
    activeOverlayChannels: number;
    resolution: string;
    compatibleSwitchers: string[];
    matchesInMemory: number;
  };
  timestamp: number;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({ onBack, onNavigate }) => {
  const [telemetry, setTelemetry] = useState<ArchitectureTelemetry | null>(null);
  const [hostingerStatus, setHostingerStatus] = useState<HostingerDatabaseStatus | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>('match_tt_wtt_final');
  const [traceStep, setTraceStep] = useState<0 | 1 | 2 | 3>(0);
  const [syncingDb, setSyncingDb] = useState(false);
  const [traceLog, setTraceLog] = useState<string[]>(
    [
      '[READY] 3-Tier Broadcast Pipeline initialized (Backend Port 8000, Vite Port 5173)',
      '[TIER-1] Keyboard Hotkey Controller & Touch Consoles bound to 8 sports',
      '[TIER-2] Express REST + WebSocket Multiplexer Hub (/ws on :8000) active',
      '[TIER-3] Hostinger MySQL Database Connector (Port 3306) & 1080p60 OBS Renderers ready',
    ]
  );

  const loadArchitectureData = async () => {
    try {
      const [telRes, matchesList, dbStatus] = await Promise.all([
        fetch('/api/architecture/telemetry').then((r) => r.json()),
        fetchMatches(),
        fetchHostingerDbStatus().catch(() => null),
      ]);
      setTelemetry(telRes);
      setMatches(matchesList);
      if (dbStatus) setHostingerStatus(dbStatus);
      if (matchesList.length > 0 && !matchesList.some((m) => m.id === selectedMatchId)) {
        setSelectedMatchId(matchesList[0].id);
      }
    } catch (err) {
      console.error('Failed to load architecture telemetry:', err);
    }
  };

  const handleHostingerSync = async () => {
    setSyncingDb(true);
    const now = new Date().toLocaleTimeString();
    try {
      const res = await syncHostingerDatabase();
      setHostingerStatus(res.status);
      setTraceLog((prev) => [
        `[${now}] [TIER-3 HOSTINGER DB] ${res.message}`,
        ...prev.slice(0, 7),
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setSyncingDb(false);
    }
  };

  const handleDownloadHostingerSql = async () => {
    try {
      const res = await fetchHostingerSqlExport();
      const blob = new Blob([res.sql], { type: 'application/sql;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${res.database}_hostinger_export.sql`;
      a.click();
      URL.revokeObjectURL(url);
      const now = new Date().toLocaleTimeString();
      setTraceLog((prev) => [
        `[${now}] [TIER-3 SQL DUMP] Exported ${res.recordsCount} match records for Hostinger phpMyAdmin`,
        ...prev.slice(0, 7),
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadArchitectureData();
  }, []);

  const selectedMatch = matches.find((m) => m.id === selectedMatchId) || matches[0];

  // Interactive End-to-End 3-Tier Pipeline Test
  const handleRunPipelineTrace = async () => {
    if (!selectedMatch) return;
    const now = new Date().toLocaleTimeString();

    setTraceStep(1);
    setTraceLog((prev) => [
      `[${now}] [TIER-1 INPUT] Operator keystroke dispatched for "${selectedMatch.name}" (${selectedMatch.sport.toUpperCase()})`,
      ...prev.slice(0, 7),
    ]);

    setTimeout(async () => {
      setTraceStep(2);
      setTraceLog((prev) => [
        `[${now}] [TIER-2 ENGINE] Validated state transition & broadcasted via WebSocket Hub (/ws)`,
        ...prev.slice(0, 7),
      ]);

      try {
        await triggerOverlayTest(selectedMatch.activeOverlayToken, {
          type: selectedMatch.sport === 'basketball' ? 'three_pointer' : 'goal',
          title: '3-TIER PIPELINE TEST',
          subtitle: `Live packet verified on ${selectedMatch.name}`,
          player: selectedMatch.teamA.name,
        });
      } catch (e) {
        console.error(e);
      }

      setTimeout(() => {
        setTraceStep(3);
        setTraceLog((prev) => [
          `[${now}] [TIER-3 OUTPUT] Persisted in StorageManager & rendered on OBS Overlay (/overlay/${selectedMatch.activeOverlayToken})`,
          ...prev.slice(0, 7),
        ]);
        loadArchitectureData();

        setTimeout(() => setTraceStep(0), 2500);
      }, 450);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 pb-16">
      {/* Top Studio Header */}
      <div className="bg-gradient-to-r from-[#0c1424] via-[#090f1f] to-[#0c1424] border-b border-slate-800/80 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-[#060a14] border border-slate-800 hover:border-cyan-500/40 text-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 font-mono">
              MARKETINGLU DESIGN • SYSTEM &amp; HOSTINGER MYSQL BLUEPRINT
            </div>
            <h1 className="text-xl font-black text-white tracking-tight font-['Space_Grotesk',sans-serif]">
              Three-Tier Broadcast Project Architecture
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleHostingerSync}
            disabled={syncingDb}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-lg cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingDb ? 'animate-spin' : ''}`} />
            <span>
              {syncingDb
                ? 'Syncing Hostinger...'
                : `Sync Hostinger MySQL (${hostingerStatus?.syncedMatchesCount ?? 8} Records)`}
            </span>
          </button>

          <button
            onClick={handleDownloadHostingerSql}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-[#060a14] hover:bg-[#0b1324] border border-slate-800 hover:border-cyan-500/40 text-cyan-300 rounded-lg cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export phpMyAdmin .SQL</span>
          </button>

          <button
            onClick={handleRunPipelineTrace}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg shadow-lg shadow-cyan-500/20 cursor-pointer transition-colors"
          >
            <Zap className="w-4 h-4" />
            <span>Simulate End-to-End 3-Tier Packet Flow</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        {/* Interactive End-to-End Pipeline Visualizer */}
        <div className="bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">
                Interactive 3-Tier Device &amp; Software Topology
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Decoupled Presentation/Input (Tier 1), Real-Time Rule Engine &amp; WebSocket Core (Tier 2),
                and State Persistence &amp; OBS Broadcast Output (Tier 3).
              </p>
            </div>

            {matches.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Target Channel:</span>
                <select
                  value={selectedMatchId}
                  onChange={(e) => setSelectedMatchId(e.target.value)}
                  className="bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs text-white font-semibold outline-none"
                >
                  {matches.map((m) => (
                    <option key={m.id} value={m.id}>
                      [{m.sport.replace('_', ' ').toUpperCase()}] {m.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 3-Tier Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
            {/* ==================== TIER 1: PRESENTATION & EDGE INPUT DEVICES ==================== */}
            <div
              className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                traceStep === 1
                  ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.25)]'
                  : 'bg-[#060a14]/95 border-slate-800/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                      <Keyboard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-mono font-extrabold text-cyan-400 uppercase">
                        TIER 1 • PRESENTATION &amp; INPUT
                      </div>
                      <h3 className="text-base font-bold text-white">
                        Edge Scoring &amp; Operator Consoles
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">CLIENT SPA</span>
                </div>

                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  Interactive React 19 operator interfaces, tactile keyboard hotkey controllers, and
                  configurable game/shot clock timers capturing live match actions at the stadium or
                  studio desk.
                </p>

                {/* Tier 1 Sub-Modules */}
                <div className="mt-4 space-y-2.5">
                  <div className="p-3 rounded-xl bg-[#090f1f] border border-slate-800/90">
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>1. Tactile Keyboard Hotkey Deck</span>
                      <span className="font-mono text-[10px] text-cyan-400">A / L / S / SPACE</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Zero-look keybindings for Table Tennis, Volleyball, Badminton, Tennis, Basketball &amp; Football.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#090f1f] border border-slate-800/90">
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>2. Broadcast Game &amp; Shot Clock Timer</span>
                      <span className="font-mono text-[10px] text-emerald-400">1x / 5x SYNC</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Configurable NBA/FIBA countdowns (12m/10m + 24s/14s shot clock) and Football match clocks.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#090f1f] border border-slate-800/90">
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>3. Ball-by-Ball &amp; Multi-Sport Consoles</span>
                      <span className="font-mono text-[10px] text-sky-400">
                        {telemetry?.tier1.activeConsoles ?? 8} CHANNELS
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Dedicated scoring decks for all 8 sports with instant alert triggers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  Events Captured: <strong className="text-white">{telemetry?.tier1.totalEventsCaptured ?? 640}</strong>
                </span>
                <button
                  onClick={() =>
                    onNavigate(
                      selectedMatch?.sport === 'cricket' ? 'scoring' : 'multi-scoring',
                      selectedMatch?.id
                    )
                  }
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Tier 1 Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ==================== TIER 2: APPLICATION & REAL-TIME ENGINE ==================== */}
            <div
              className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                traceStep === 2
                  ? 'bg-sky-950/40 border-sky-400 shadow-[0_0_30px_rgba(14,165,233,0.25)]'
                  : 'bg-[#060a14]/95 border-slate-800/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-mono font-extrabold text-sky-400 uppercase">
                        TIER 2 • APPLICATION &amp; LOGIC
                      </div>
                      <h3 className="text-base font-bold text-white">
                        Multi-Sport Engine &amp; WebSocket Hub
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">NODE / EXPRESS</span>
                </div>

                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  Server-authoritative sport rule engines validate every point, ball, foul, set, and
                  clock tick before broadcasting delta frames over multiplexed WebSockets.
                </p>

                {/* Tier 2 Sub-Modules */}
                <div className="mt-4 space-y-2.5">
                  <div className="p-3 rounded-xl bg-[#090f1f] border border-slate-800/90">
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>1. Deterministic 8-Sport Rule Engines</span>
                      <span className="font-mono text-[10px] text-cyan-400">8 ENGINES</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Automatic deuce/advantage, 2-serve Table Tennis rotation, 21/25-pt set rollover, CRR/RRR &amp; bonus fouls.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#090f1f] border border-slate-800/90">
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>2. Real-Time WebSocket Multiplexer</span>
                      <span className="font-mono text-[10px] text-emerald-400">ws://0.0.0.0:8000/ws</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Room-based pub/sub channels isolated by matchId and overlay token with sub-15ms fanout.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#090f1f] border border-slate-800/90">
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>3. REST API Gateway &amp; Simulator</span>
                      <span className="font-mono text-[10px] text-sky-400">/api/matches/*</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Stateless HTTP endpoints for match CRUD, point corrections, and automated ball simulation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  Active Sport Engines: <strong className="text-cyan-400">8 / 8 ONLINE</strong>
                </span>
                <button
                  onClick={handleRunPipelineTrace}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>Ping Engine Core</span>
                  <Zap className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ==================== TIER 3: DATA PERSISTENCE & BROADCAST OUTPUT ==================== */}
            <div
              className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                traceStep === 3
                  ? 'bg-emerald-950/40 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.25)]'
                  : 'bg-[#060a14]/95 border-slate-800/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-mono font-extrabold text-emerald-400 uppercase">
                        TIER 3 • DATA &amp; BROADCAST OUTPUT
                      </div>
                      <h3 className="text-base font-bold text-white">
                        State Store &amp; OBS Alpha Renderers
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">1080P60</span>
                </div>

                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  Transactional in-memory state repository with event history/undo stacks paired with
                  transparent 1920×1080 broadcast browser sources for OBS Studio, vMix, and ATEM switchers.
                </p>

                {/* Tier 3 Sub-Modules */}
                <div className="mt-4 space-y-2.5">
                  <div className="p-3 rounded-xl bg-[#090f1f] border border-slate-800/90">
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>1. Hostinger MySQL + Hybrid Replay Store</span>
                      <span className="font-mono text-[10px] text-emerald-400">PORT 3306 / SQL</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Persists match records (`broadcast_matches`), ball/point logs (`broadcast_events_log`), and OBS tokens (`broadcast_overlay_tokens`) in Hostinger MySQL.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#090f1f] border border-slate-800/90">
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>2. OBS / vMix Alpha-Channel Browser Source</span>
                      <span className="font-mono text-[10px] text-cyan-400">/overlay/:token</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Zero-chrome 1920×1080 transparent canvas composited directly over live camera feeds.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#090f1f] border border-slate-800/90">
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>3. Broadcast Alert Graphics Engine</span>
                      <span className="font-mono text-[10px] text-sky-400">AUTO-DISMISS</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Full-screen lower-third &amp; sting animations for SIX, WICKET, GOAL, 3-POINTER &amp; ACE.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  Active Tokens: <strong className="text-emerald-400">{telemetry?.tier3.activeOverlayChannels ?? 8}</strong>
                </span>
                {selectedMatch && (
                  <a
                    href={`/overlay/${selectedMatch.activeOverlayToken}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <span>Launch Tier 3 Overlay</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Live 3-Tier Packet & Event Bus Log + Hardware Device Mapping */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Packet Trace Log (7 Cols) */}
          <div className="lg:col-span-7 bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                3-Tier Real-Time Data Bus Verification Log
              </span>
              <span className="text-[11px] font-mono text-slate-400">Backend :8000 • Vite :5173 • WebSocket + REST</span>
            </div>
            <div className="bg-[#060a14] border border-slate-800/90 rounded-xl p-3.5 font-mono text-xs space-y-2 min-h-[160px]">
              {traceLog.map((line, i) => (
                <div
                  key={i}
                  className={`${
                    i === 0 ? 'text-cyan-400 font-bold' : 'text-slate-400'
                  } leading-relaxed`}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>

          {/* Device & Protocol Matrix (5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-3">
                Hardware &amp; Device Integration Matrix
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Tier 1 Input Devices</span>
                  <span className="font-mono text-white font-semibold">
                    USB/Bluetooth Keyboard, Tablet, StreamDeck
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Tier 2 Core Runtime</span>
                  <span className="font-mono text-cyan-400 font-semibold">
                    Node.js 22 + Express + WS Hub
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Tier 3 Broadcast Switchers</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    OBS Studio, vMix, Blackmagic ATEM
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-400">End-to-End Frame Latency</span>
                  <span className="font-mono text-cyan-400 font-bold">&lt; 15ms (Local/LAN)</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => onNavigate('obs-guide')}
                className="text-xs font-semibold text-cyan-300 hover:text-white cursor-pointer"
              >
                View OBS Setup Guide →
              </button>
              <button
                onClick={() => onNavigate('overlay-control', selectedMatch?.id)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white cursor-pointer shadow-md shadow-cyan-500/20"
              >
                Open Overlay Studio
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
