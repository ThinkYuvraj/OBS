import React, { useState, useEffect } from 'react';
import { Match, OverlayConfig } from '../types/sports';
import {
  fetchMatches,
  deleteMatch,
  postBasketballEvent,
  postFootballEvent,
  postFieldHockeyEvent,
  simulateNextBall,
  toggleSimulation,
  triggerOverlayTest,
  updateOverlayConfig,
  fetchHostingerDbStatus,
  syncHostingerDatabase,
  fetchHostingerSqlExport,
  HostingerDatabaseStatus,
} from '../services/api';
import { useRealtimeSocket } from '../hooks/useRealtimeSocket';
import {
  Plus,
  Radio,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Sliders,
  Layers,
  Keyboard,
  Cpu,
  Database,
  Zap,
  Search,
  Sparkles,
  Tv,
  Play,
  Palette,
  LayoutGrid,
  List,
  Activity,
  RotateCcw,
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: string, matchId?: string) => void;
}

const MAIN_SPORTS = [
  { id: 'all', label: 'All 8 Sports' },
  { id: 'cricket', label: 'Cricket' },
  { id: 'football', label: 'Football' },
  { id: 'basketball', label: 'Basketball' },
  { id: 'badminton', label: 'Badminton' },
  { id: 'table_tennis', label: 'Table Tennis' },
  { id: 'volleyball', label: 'Volleyball' },
  { id: 'tennis', label: 'Lawn Tennis' },
  { id: 'field_hockey', label: 'Field Hockey' },
];

const DEFAULT_MARKETINGLU_THEME = {
  id: 'sky_broadcast' as OverlayConfig['theme'],
  label: 'MarketinGlu Cyan-Sky',
  badge: 'BRAND DEFAULT',
  gradient: 'from-cyan-500 via-sky-500 to-blue-600',
};

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'outdoor' | 'arena'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'compact'>('grid');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [simulatingCricket, setSimulatingCricket] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [hostingerStatus, setHostingerStatus] = useState<HostingerDatabaseStatus | null>(null);
  const [syncingDb, setSyncingDb] = useState<boolean>(false);
  const [sqlModalData, setSqlModalData] = useState<{
    sql: string;
    database: string;
    recordsCount: number;
  } | null>(null);

  const showToast = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 2800);
  };

  const loadData = () => {
    Promise.all([fetchMatches(), fetchHostingerDbStatus().catch(() => null)])
      .then(([data, dbStatus]) => {
        setMatches(data);
        if (dbStatus) setHostingerStatus(dbStatus);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching matches:', err);
        setLoading(false);
      });
  };

  const handleSyncHostinger = async () => {
    setSyncingDb(true);
    try {
      const res = await syncHostingerDatabase();
      setHostingerStatus(res.status);
      showToast(res.message);
    } catch (err) {
      console.error(err);
      showToast('Failed to sync Hostinger MySQL records');
    } finally {
      setSyncingDb(false);
    }
  };

  const handleOpenSqlExport = async () => {
    try {
      const res = await fetchHostingerSqlExport();
      setSqlModalData(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadSqlFile = () => {
    if (!sqlModalData) return;
    const blob = new Blob([sqlModalData.sql], { type: 'application/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sqlModalData.database}_hostinger_export.sql`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded Hostinger phpMyAdmin .sql dump file');
  };

  useEffect(() => {
    loadData();
  }, []);

  useRealtimeSocket({
    onMatchUpdate: (updatedMatch) => {
      setMatches((prev) =>
        prev.some((m) => m.id === updatedMatch.id)
          ? prev.map((m) => (m.id === updatedMatch.id ? updatedMatch : m))
          : [updatedMatch, ...prev]
      );
    },
  });

  const handleCopyObsUrl = (token: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/overlay/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    showToast(`Copied OBS Browser Source URL (/overlay/${token})`);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleDelete = async (matchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteMatch(matchId);
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
    showToast('Match channel removed');
  };

  // Interactive Quick-Score Action right from Dashboard Cards
  const handleQuickScore = async (m: Match, side: 'home' | 'away', e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (m.sport === 'cricket') {
        await simulateNextBall(m.id);
        showToast(`Simulated next ball on ${m.name}`);
      } else if (m.sport === 'basketball') {
        await postBasketballEvent(m.id, { type: 'score', teamId: side, points: 2 });
        showToast(`+2 PTS recorded for ${side === 'home' ? m.teamA.shortName : m.teamB.shortName}`);
      } else if (m.sport === 'football') {
        await postFootballEvent(m.id, {
          type: 'goal',
          teamId: side,
          player: side === 'home' ? m.teamA.shortName : m.teamB.shortName,
        });
        showToast(`GOAL! ${side === 'home' ? m.teamA.name : m.teamB.name}`);
      } else if (m.sport === 'field_hockey') {
        await postFieldHockeyEvent(m.id, { type: 'goal', teamId: side });
        showToast(`Goal recorded for ${side === 'home' ? m.teamA.shortName : m.teamB.shortName}`);
      } else {
        const endpoint =
          m.sport === 'badminton'
            ? `/api/matches/${m.id}/badminton/point`
            : m.sport === 'table_tennis'
            ? `/api/matches/${m.id}/table-tennis/point`
            : m.sport === 'tennis'
            ? `/api/matches/${m.id}/tennis/point`
            : `/api/matches/${m.id}/volleyball/point`;
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ winner: side }),
        });
        showToast(`Point awarded to ${side === 'home' ? m.teamA.shortName : m.teamB.shortName}`);
      }
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Instant Broadcast Sting / Alert Trigger from Main Screen
  const handleQuickAlert = async (
    m: Match,
    type: string,
    title: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      await triggerOverlayTest(m.activeOverlayToken, {
        type,
        title,
        subtitle: `${m.name} • ${m.tournament}`,
        player: m.teamA.name,
      });
      showToast(`Broadcast Sting "${title}" fired on ${m.teamA.shortName} vs ${m.teamB.shortName}`);
    } catch (err) {
      console.error(err);
    }
  };

  // Sync MarketinGlu Cyan-Sky default theme across all active OBS channels
  const handleSyncDefaultTheme = async () => {
    try {
      await Promise.all(
        matches.map((m) =>
          updateOverlayConfig(m.activeOverlayToken, {
            theme: DEFAULT_MARKETINGLU_THEME.id,
          })
        )
      );
      loadData();
      showToast(
        `Synced "${DEFAULT_MARKETINGLU_THEME.label}" default theme across all ${matches.length} OBS channels`
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Global Demo Auto-Feed for Cricket
  const handleToggleGlobalFeed = async () => {
    const cricketMatch = matches.find((m) => m.sport === 'cricket');
    if (!cricketMatch) return;
    try {
      const res = await toggleSimulation(cricketMatch.id);
      setSimulatingCricket(res.simulating);
      showToast(res.simulating ? 'Auto-Ball Live Simulator started' : 'Auto-Ball Simulator paused');
    } catch (err) {
      console.error(err);
    }
  };

  // Global Broadcast Sting across all channels
  const handleFireGlobalSting = async (type: string, title: string) => {
    try {
      await Promise.all(
        matches.slice(0, 4).map((m) =>
          triggerOverlayTest(m.activeOverlayToken, {
            type,
            title,
            subtitle: `${m.name} • Live Studio Feed`,
            player: m.teamA.name,
          })
        )
      );
      showToast(`Fired "${title}" graphic across active OBS overlay channels`);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMatches = matches.filter((m) => {
    const matchesSport = selectedSport === 'all' || m.sport === selectedSport;
    const isOutdoor = ['cricket', 'football', 'tennis', 'field_hockey', 'baseball', 'rugby'].includes(
      m.sport
    );
    const isArena = ['basketball', 'badminton', 'table_tennis', 'volleyball'].includes(m.sport);

    const matchesCategory =
      statusFilter === 'all'
        ? true
        : statusFilter === 'live'
        ? m.status === 'live'
        : statusFilter === 'outdoor'
        ? isOutdoor
        : isArena;

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.tournament.toLowerCase().includes(q) ||
      m.teamA.name.toLowerCase().includes(q) ||
      m.teamB.name.toLowerCase().includes(q) ||
      m.sport.toLowerCase().includes(q);

    return matchesSport && matchesCategory && matchesSearch;
  });

  const activeCount = matches.filter((m) => m.status === 'live').length;
  const outdoorCount = matches.filter((m) =>
    ['cricket', 'football', 'tennis', 'field_hockey', 'baseball', 'rugby'].includes(m.sport)
  ).length;
  const courtArenaCount = matches.filter((m) =>
    ['basketball', 'badminton', 'table_tennis', 'volleyball'].includes(m.sport)
  ).length;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 pb-20">
      {/* Live Feedback Toast */}
      {actionFeedback && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-gradient-to-r from-[#0c1424] via-[#0d1a33] to-[#090f1f] border border-cyan-500/40 text-white text-xs font-bold shadow-2xl shadow-cyan-950/80 animate-bounce">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Hero / MarketinGlu (#070b14 -> #0c1424 -> #090f1f) Studio Header */}
      <div className="relative border-b border-slate-800/80 bg-gradient-to-b from-[#0c1424] via-[#090f1f] to-[#070b14] px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-bold uppercase tracking-wider text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              MarketinGlu Design System • 3-Tier Broadcast Engine
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-cyan-200 to-sky-400 bg-clip-text text-transparent mt-2 font-['Space_Grotesk',sans-serif]">
              Master Production Overlay Studio
            </h1>
            <p className="text-sm text-slate-400 mt-1.5 max-w-2xl text-balance">
              Engineered with the high-contrast <span className="text-cyan-300 font-semibold">MarketinGlu</span> obsidian-navy &amp; electric-cyan palette (<code className="text-cyan-400 font-mono">#070b14</code>). Control all 8 outdoor and court sports with keyboard hotkeys, game timers, and Hostinger MySQL persistence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleToggleGlobalFeed}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                simulatingCricket
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-400/50 text-white shadow-lg shadow-emerald-600/25'
                  : 'bg-[#0b1324] hover:bg-[#0d162b] text-cyan-300 border-slate-800/90'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>{simulatingCricket ? 'Auto-Simulating Live' : 'Start Live Auto-Feed'}</span>
            </button>

            <button
              onClick={() => onNavigate('architecture')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-[#0b1324] hover:bg-[#0d162b] text-amber-300 border border-slate-800/90 hover:border-cyan-500/40 rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              <Layers className="w-4 h-4" />
              <span>3-Tier Architecture</span>
            </button>

            <button
              onClick={() => onNavigate('obs-guide')}
              className="px-3.5 py-2 text-xs font-bold bg-[#0b1324] hover:bg-[#0d162b] text-slate-200 border border-slate-800/90 rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              OBS Setup Guide
            </button>

            <button
              onClick={() => onNavigate('create')}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl transition-all shadow-lg shadow-cyan-500/25 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>New Match Channel</span>
            </button>
          </div>
        </div>

        {/* Studio Summary Metrics */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-7">
          <div
            onClick={() => setStatusFilter('all')}
            className={`cursor-pointer bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border p-4 rounded-xl transition-all ${
              statusFilter === 'all'
                ? 'border-cyan-500/50 shadow-lg shadow-cyan-950/40'
                : 'border-slate-800/80 hover:border-sky-500/40'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Live Broadcast Channels</span>
              <Tv className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black font-mono tabular-nums text-white mt-1">
              {activeCount} <span className="text-xs font-normal text-cyan-400">ON AIR</span>
            </div>
          </div>

          <div
            onClick={() => setStatusFilter('outdoor')}
            className={`cursor-pointer bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border p-4 rounded-xl transition-all ${
              statusFilter === 'outdoor'
                ? 'border-emerald-500/50 shadow-lg shadow-emerald-950/40'
                : 'border-slate-800/80 hover:border-emerald-500/40'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Outdoor Stadium Feeds</span>
              <Radio className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black font-mono tabular-nums text-emerald-400 mt-1">
              {outdoorCount} <span className="text-xs font-normal text-slate-400">CHANNELS</span>
            </div>
          </div>

          <div
            onClick={() => setStatusFilter('arena')}
            className={`cursor-pointer bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border p-4 rounded-xl transition-all ${
              statusFilter === 'arena'
                ? 'border-cyan-500/50 shadow-lg shadow-cyan-950/40'
                : 'border-slate-800/80 hover:border-cyan-500/40'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Basketball &amp; Court Feeds</span>
              <Keyboard className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-black font-mono tabular-nums text-sky-300 mt-1">
              {courtArenaCount} <span className="text-xs font-normal text-slate-400">ARENA</span>
            </div>
          </div>

          <div
            onClick={() => onNavigate('architecture')}
            className="cursor-pointer bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 hover:border-purple-500/40 p-4 rounded-xl transition-all"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>3-Tier Engine Pipeline</span>
              <Cpu className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black font-mono tabular-nums text-amber-400 mt-1">
              8 / 8 <span className="text-xs font-normal text-slate-400">SPORTS READY</span>
            </div>
          </div>
        </div>

        {/* Master Broadcast Quick-Action & Easy Onboarding Control Deck (MarketinGlu #0c1424 -> #090f1f) */}
        <div className="max-w-7xl mx-auto mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Locked MarketinGlu Cyan-Sky Default Theme + 4-Step Easy Onboarding Strip (7 cols) */}
          <div className="lg:col-span-7 bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between gap-3 shadow-lg shadow-black/40">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                  Active Studio Theme &amp; Quick-Start Onboarding
                </span>
              </div>
              <button
                onClick={() => onNavigate('obs-guide')}
                className="text-[11px] font-mono font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                Open Full 4-Step Onboarding Guide →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch">
              {/* Single Default Theme Badge: MarketinGlu Cyan-Sky */}
              <div
                onClick={handleSyncDefaultTheme}
                className="sm:col-span-4 p-3 rounded-xl bg-cyan-500/15 border border-cyan-400 shadow-md shadow-cyan-500/15 flex flex-col justify-between cursor-pointer"
                title="Click to sync MarketinGlu Cyan-Sky theme across all channels"
              >
                <div
                  className={`h-2 w-full rounded-full bg-gradient-to-r ${DEFAULT_MARKETINGLU_THEME.gradient} mb-2`}
                />
                <div>
                  <div className="text-xs font-extrabold text-white">
                    {DEFAULT_MARKETINGLU_THEME.label}
                  </div>
                  <div className="text-[10px] font-mono text-cyan-300 mt-0.5">
                    {DEFAULT_MARKETINGLU_THEME.badge}
                  </div>
                </div>
              </div>

              {/* Easy 3-Step Visual Onboarding Flow */}
              <div className="sm:col-span-8 grid grid-cols-3 gap-2">
                <div
                  onClick={() => onNavigate('create')}
                  className="p-2.5 rounded-xl bg-[#060a14]/90 border border-slate-800/90 hover:border-cyan-500/40 cursor-pointer flex flex-col justify-between"
                >
                  <span className="text-[10px] font-mono font-bold text-cyan-400">STEP 01</span>
                  <div className="text-xs font-bold text-white mt-1">Pick Sport</div>
                  <div className="text-[10px] text-slate-400">8 Live Channels</div>
                </div>

                <div
                  onClick={() => onNavigate('multi-scoring', 'match_tt_wtt_final')}
                  className="p-2.5 rounded-xl bg-[#060a14]/90 border border-slate-800/90 hover:border-cyan-500/40 cursor-pointer flex flex-col justify-between"
                >
                  <span className="text-[10px] font-mono font-bold text-sky-400">STEP 02</span>
                  <div className="text-xs font-bold text-white mt-1">Score Match</div>
                  <div className="text-[10px] text-slate-400">Hotkeys A / L / Space</div>
                </div>

                <div
                  onClick={() => onNavigate('obs-guide')}
                  className="p-2.5 rounded-xl bg-[#060a14]/90 border border-slate-800/90 hover:border-emerald-500/40 cursor-pointer flex flex-col justify-between"
                >
                  <span className="text-[10px] font-mono font-bold text-emerald-400">STEP 03</span>
                  <div className="text-xs font-bold text-white mt-1">Paste in OBS</div>
                  <div className="text-[10px] text-slate-400">1920×1080 Browser</div>
                </div>
              </div>
            </div>
          </div>

          {/* Instant Master Broadcast Sting Soundboard (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between gap-3 shadow-lg shadow-black/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                  Instant On-Air Broadcast Stings
                </span>
              </div>
              <span className="text-[11px] font-mono text-amber-300">LIVE GRAPHICS</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleFireGlobalSting('six', 'MAXIMUM SIX!')}
                className="px-2.5 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 text-xs font-black text-cyan-300 cursor-pointer transition-all"
              >
                🏏 SIX!
              </button>
              <button
                onClick={() => handleFireGlobalSting('goal', 'GOAL SCORED!')}
                className="px-2.5 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-black text-emerald-300 cursor-pointer transition-all"
              >
                ⚽ GOAL!
              </button>
              <button
                onClick={() => handleFireGlobalSting('three_pointer', '3-POINT SPLASH!')}
                className="px-2.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-black text-amber-300 cursor-pointer transition-all"
              >
                🏀 3-PT!
              </button>
              <button
                onClick={() => handleFireGlobalSting('wicket', 'WICKET DOWN!')}
                className="px-2.5 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 text-xs font-black text-rose-300 cursor-pointer transition-all"
              >
                🎯 WICKET!
              </button>
              <button
                onClick={() => handleFireGlobalSting('ace', 'SERVICE ACE!')}
                className="px-2.5 py-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/25 border border-sky-500/30 text-xs font-black text-sky-300 cursor-pointer transition-all"
              >
                🎾 ACE!
              </button>
              <button
                onClick={() => onNavigate('multi-scoring', 'match_tt_wtt_final')}
                className="px-2.5 py-2 rounded-lg bg-purple-500/15 hover:bg-purple-500/30 border border-purple-500/30 text-xs font-black text-purple-300 cursor-pointer transition-all"
              >
                ⌨️ HOTKEYS
              </button>
            </div>
          </div>
        </div>

        {/* 3-Tier Device & Project Architecture Summary Banner */}
        <div className="max-w-7xl mx-auto mt-4 bg-gradient-to-r from-[#0c1424]/95 via-[#090f1f]/95 to-[#0c1424]/95 border border-slate-800/80 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
                <Keyboard className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-mono font-bold text-cyan-400">
                  TIER 1 • PRESENTATION &amp; EDGE INPUT
                </div>
                <div className="text-xs font-bold text-white">
                  Keyboard Hotkey Decks &amp; Game Timers
                </div>
                <div className="text-[11px] text-slate-400">
                  Tactile scoring for Table Tennis, Volleyball, Basketball &amp; Football
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-mono font-bold text-purple-400">
                  TIER 2 • APPLICATION &amp; ENGINE CORE
                </div>
                <div className="text-xs font-bold text-white">
                  8-Sport Rule Engines &amp; WebSocket Hub
                </div>
                <div className="text-[11px] text-slate-400">
                  Express REST Gateway + multiplexed /ws pub-sub fanout
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-mono font-bold text-emerald-400">
                  TIER 3 • HOSTINGER MYSQL &amp; OBS OUTPUT
                </div>
                <div className="text-xs font-bold text-white">
                  Hostinger MySQL Records ({hostingerStatus?.host || 'srv1234.hstgr.io'})
                </div>
                <div className="text-[11px] text-slate-400">
                  {hostingerStatus?.syncedMatchesCount ?? matches.length} match records • phpMyAdmin SQL ready
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleSyncHostinger}
              disabled={syncingDb}
              className="px-3 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-bold text-emerald-300 cursor-pointer transition-all"
            >
              {syncingDb ? 'Syncing Hostinger DB...' : 'Sync Hostinger DB'}
            </button>
            <button
              onClick={handleOpenSqlExport}
              className="px-3 py-2 rounded-lg bg-[#060a14] hover:bg-[#0b1324] border border-slate-800 hover:border-cyan-500/40 text-xs font-bold text-cyan-300 cursor-pointer transition-all"
            >
              Export Hostinger .SQL
            </button>
            <button
              onClick={() => onNavigate('architecture')}
              className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white shrink-0 cursor-pointer transition-all shadow-md shadow-cyan-500/20"
            >
              3-Tier Blueprint →
            </button>
          </div>
        </div>
      </div>

      {/* Hostinger phpMyAdmin SQL Schema & Live Dump Modal */}
      {sqlModalData && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSqlModalData(null)}
        >
          <div
            className="bg-gradient-to-b from-[#0c1424] to-[#070b14] border border-cyan-500/40 rounded-2xl max-w-3xl w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <div className="text-[11px] font-mono font-bold text-emerald-400 uppercase">
                  TIER 3 • HOSTINGER hPANEL / PHPMYADMIN DATABASE EXPORT
                </div>
                <h3 className="text-lg font-extrabold text-white font-['Space_Grotesk',sans-serif]">
                  Hostinger MySQL Schema &amp; Live Match Records ({sqlModalData.database})
                </h3>
              </div>
              <button
                onClick={() => setSqlModalData(null)}
                className="px-2.5 py-1 rounded-lg bg-[#060a14] border border-slate-800 text-xs text-slate-300 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-300 mt-3">
              Import this SQL directly into your Hostinger <strong>phpMyAdmin</strong> database or
              configure <code className="text-cyan-300">HOSTINGER_DB_HOST</code>,{' '}
              <code className="text-cyan-300">HOSTINGER_DB_USER</code>,{' '}
              <code className="text-cyan-300">HOSTINGER_DB_PASSWORD</code>, and{' '}
              <code className="text-cyan-300">HOSTINGER_DB_NAME</code> for automatic live MySQL
              writes.
            </p>

            <pre className="mt-3 bg-[#060a14] border border-slate-800/90 rounded-xl p-4 text-[11px] font-mono text-cyan-200 overflow-x-auto max-h-80">
              {sqlModalData.sql}
            </pre>

            <div className="mt-4 flex items-center justify-end gap-2.5">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sqlModalData.sql);
                  showToast('Copied Hostinger SQL schema & records to clipboard');
                }}
                className="px-4 py-2 rounded-xl bg-[#0c1424] border border-slate-800 hover:border-cyan-500/40 text-xs font-bold text-white cursor-pointer"
              >
                Copy SQL Queries
              </button>
              <button
                onClick={handleDownloadSqlFile}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                Download .SQL for Hostinger phpMyAdmin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        {/* Search, Layout Mode & 8-Sport Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#090f1f] border border-slate-800/90 rounded-xl">
            {MAIN_SPORTS.map((sport) => (
              <button
                key={sport.id}
                onClick={() => setSelectedSport(sport.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedSport === sport.id
                    ? 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-[#0c1424]'
                }`}
              >
                {sport.label}
              </button>
            ))}
          </div>

          {/* Search Input + View Toggle + Reset */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search team, sport, tournament..."
                className="bg-[#090f1f] border border-slate-800 focus:border-cyan-400 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none w-56"
              />
            </div>

            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0c1424] border border-cyan-500/40 text-xs text-cyan-300 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filter</span>
              </button>
            )}

            <div className="flex items-center bg-[#090f1f] border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => setLayoutMode('grid')}
                className={`p-1.5 rounded-lg cursor-pointer ${
                  layoutMode === 'grid' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Expanded Broadcast Cards"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setLayoutMode('compact')}
                className={`p-1.5 rounded-lg cursor-pointer ${
                  layoutMode === 'compact'
                    ? 'bg-cyan-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Compact Multi-Channel Rack"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Matches Grid */}
        {loading ? (
          <div className="py-20 text-center text-cyan-300/80 font-mono text-sm">
            Loading MarketinGlu Cyan-Sky broadcast studio channels...
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="py-20 text-center bg-gradient-to-b from-[#0c1424]/90 to-[#060a14]/90 border border-slate-800/80 rounded-2xl mt-6">
            <p className="text-slate-300 text-sm">No matches found matching your current filter.</p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={() => {
                  setSelectedSport('all');
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 text-xs font-bold bg-[#060a14] border border-cyan-500/40 text-cyan-300 rounded-xl cursor-pointer"
              >
                Show All 8 Sports
              </button>
              <button
                onClick={() => onNavigate('create')}
                className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white rounded-xl cursor-pointer"
              >
                Create New Match
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`grid gap-5 mt-6 ${
              layoutMode === 'compact'
                ? 'grid-cols-1 md:grid-cols-3'
                : 'grid-cols-1 md:grid-cols-2'
            }`}
          >
            {filteredMatches.map((m) => {
              const isCricket = m.sport === 'cricket';

              let scoreText = '0 - 0';
              let metaText = '';

              if (isCricket && m.cricketState) {
                const inn = m.cricketState.innings[m.cricketState.currentInningsIndex];
                if (inn) {
                  scoreText = `${inn.runs}/${inn.wickets}`;
                  metaText = `${inn.oversFormatted} ov • CRR: ${inn.currentRunRate.toFixed(2)}`;
                }
              } else if (m.sport === 'football' && m.footballState) {
                scoreText = `${m.footballState.homeScore} - ${m.footballState.awayScore}`;
                metaText = `${m.footballState.clock || `${m.footballState.minute}:00`} (+${
                  m.footballState.extraTime
                }) • ${m.footballState.half.toUpperCase()} HALF`;
              } else if (m.sport === 'basketball' && m.basketballState) {
                scoreText = `${m.basketballState.homeScore} - ${m.basketballState.awayScore}`;
                metaText = `Q${m.basketballState.quarter} ${m.basketballState.clock} • Shot: ${m.basketballState.shotClock}s`;
              } else if (m.sport === 'badminton' && m.badmintonState) {
                scoreText = `${m.badmintonState.homePoints} - ${m.badmintonState.awayPoints}`;
                metaText = `Set ${m.badmintonState.currentSet + 1} • Server: ${m.badmintonState.server.toUpperCase()}`;
              } else if (m.sport === 'table_tennis' && m.tableTennisState) {
                scoreText = `${m.tableTennisState.homePoints} - ${m.tableTennisState.awayPoints}`;
                metaText = `Set ${m.tableTennisState.currentSet + 1} • Server: ${m.tableTennisState.server.toUpperCase()}`;
              } else if (m.sport === 'volleyball' && m.volleyballState) {
                scoreText = `${m.volleyballState.homeScore} - ${m.volleyballState.awayScore}`;
                metaText = `Set ${m.volleyballState.currentSet + 1} • Server: ${m.volleyballState.server.toUpperCase()}`;
              } else if (m.sport === 'tennis' && m.tennisState) {
                const currSet = m.tennisState.sets[m.tennisState.currentSet] || {
                  home: 0,
                  away: 0,
                };
                scoreText = `${m.tennisState.currentGame.homePoints} - ${m.tennisState.currentGame.awayPoints}`;
                metaText = `Set ${m.tennisState.currentSet + 1} (${currSet.home}-${currSet.away}) • Aces: ${
                  m.tennisState.homeAces ?? 0
                }-${m.tennisState.awayAces ?? 0}`;
              } else if (m.sport === 'field_hockey' && m.fieldHockeyState) {
                scoreText = `${m.fieldHockeyState.homeScore} - ${m.fieldHockeyState.awayScore}`;
                metaText = `Q${m.fieldHockeyState.quarter} • ${m.fieldHockeyState.minute}' • PC: ${m.fieldHockeyState.homePenaltyCorners}-${m.fieldHockeyState.awayPenaltyCorners}`;
              } else if (m.sport === 'baseball' && m.baseballState) {
                scoreText = `${m.baseballState.awayScore} - ${m.baseballState.homeScore}`;
                metaText = `${m.baseballState.half.toUpperCase()} ${m.baseballState.inning} • ${m.baseballState.outs} Out`;
              } else if (m.sport === 'rugby' && m.rugbyState) {
                scoreText = `${m.rugbyState.homeScore} - ${m.rugbyState.awayScore}`;
                metaText = `${m.rugbyState.minute}' • Tries: ${m.rugbyState.homeTries}-${m.rugbyState.awayTries}`;
              }

              const obsUrl = `${window.location.origin}/overlay/${m.activeOverlayToken}`;

              return (
                <div
                  key={m.id}
                  className="bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 hover:border-cyan-500/50 rounded-2xl p-5 transition-all flex flex-col justify-between shadow-xl shadow-black/50"
                >
                  <div>
                    {/* Top Row: Sport Label, Status, Quick Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-extrabold uppercase tracking-wider text-cyan-300">
                          {m.sport.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-400 truncate max-w-[200px]">
                          {m.tournament}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          LIVE ON AIR
                        </span>
                        <button
                          onClick={(e) => handleDelete(m.id, e)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete match"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Match Name & Theme Badge */}
                    <div className="flex items-center justify-between gap-2 mt-3">
                      <h3 className="font-extrabold text-lg text-white font-['Space_Grotesk',sans-serif]">{m.name}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-400/50 text-cyan-300 shrink-0">
                        MarketinGlu Cyan-Sky
                      </span>
                    </div>

                    {/* Scoreboard Preview Box + Instant Quick-Score Buttons */}
                    <div className="mt-3 p-3.5 bg-[#060a14]/95 rounded-xl border border-slate-800/90 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full ring-2 ring-white/20"
                            style={{ backgroundColor: m.teamA.color || '#06b6d4' }}
                          />
                          <span className="font-bold text-sm text-white">
                            {m.teamA.shortName}
                          </span>
                          <span className="text-cyan-400 text-xs font-semibold">vs</span>
                          <div
                            className="w-2.5 h-2.5 rounded-full ring-2 ring-white/20"
                            style={{ backgroundColor: m.teamB.color || '#ef4444' }}
                          />
                          <span className="font-bold text-sm text-white">
                            {m.teamB.shortName}
                          </span>
                        </div>
                        <div className="text-xs text-cyan-300/80 font-mono mt-1">{metaText}</div>
                      </div>

                      {/* Quick Interactive Score Trigger right from Dashboard */}
                      <div className="flex items-center gap-2">
                        {isCricket ? (
                          <button
                            onClick={(e) => handleQuickScore(m, 'home', e)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/40 text-[11px] font-mono font-bold text-amber-300 cursor-pointer flex items-center gap-1"
                            title="Simulate next ball"
                          >
                            <Play className="w-3 h-3" />
                            <span>+Ball</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => handleQuickScore(m, 'home', e)}
                              className="px-2.5 py-1 rounded-lg bg-[#0b1324] hover:bg-emerald-500/20 border border-slate-700 hover:border-emerald-400 text-[11px] font-mono font-bold text-emerald-300 cursor-pointer transition-colors"
                              title={`Add point/score for ${m.teamA.name}`}
                            >
                              +{m.teamA.shortName}
                            </button>
                            <button
                              onClick={(e) => handleQuickScore(m, 'away', e)}
                              className="px-2.5 py-1 rounded-lg bg-[#0b1324] hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-400 text-[11px] font-mono font-bold text-cyan-300 cursor-pointer transition-colors"
                              title={`Add point/score for ${m.teamB.name}`}
                            >
                              +{m.teamB.shortName}
                            </button>
                          </div>
                        )}

                        <div className="text-right min-w-[76px]">
                          <div className="font-black text-2xl font-mono tabular-nums text-white">
                            {scoreText}
                          </div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                            Live Score
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Per-Card Instant Broadcast Sting Triggers */}
                    {layoutMode === 'grid' && (
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 bg-[#060a14]/70 border border-slate-800/80 rounded-xl px-3 py-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                          Instant Overlay Sting:
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isCricket ? (
                            <>
                              <button
                                onClick={(e) => handleQuickAlert(m, 'four', 'BOUNDARY FOUR!', e)}
                                className="px-2 py-0.5 rounded bg-cyan-500/15 hover:bg-cyan-500/30 border border-cyan-500/30 text-[10px] font-bold text-cyan-300 cursor-pointer"
                              >
                                FOUR!
                              </button>
                              <button
                                onClick={(e) => handleQuickAlert(m, 'six', 'MAXIMUM SIX!', e)}
                                className="px-2 py-0.5 rounded bg-purple-500/15 hover:bg-purple-500/30 border border-purple-500/30 text-[10px] font-bold text-purple-300 cursor-pointer"
                              >
                                SIX!
                              </button>
                              <button
                                onClick={(e) => handleQuickAlert(m, 'wicket', 'WICKET!', e)}
                                className="px-2 py-0.5 rounded bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/30 text-[10px] font-bold text-rose-300 cursor-pointer"
                              >
                                WICKET!
                              </button>
                            </>
                          ) : m.sport === 'basketball' ? (
                            <>
                              <button
                                onClick={(e) =>
                                  handleQuickAlert(m, 'three_pointer', '3-POINTER!', e)
                                }
                                className="px-2 py-0.5 rounded bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/30 text-[10px] font-bold text-amber-300 cursor-pointer"
                              >
                                3-POINTER!
                              </button>
                              <button
                                onClick={(e) => handleQuickAlert(m, 'goal', 'SLAM DUNK!', e)}
                                className="px-2 py-0.5 rounded bg-cyan-500/15 hover:bg-cyan-500/30 border border-cyan-500/30 text-[10px] font-bold text-cyan-300 cursor-pointer"
                              >
                                DUNK!
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={(e) => handleQuickAlert(m, 'goal', 'GOAL / POINT!', e)}
                                className="px-2 py-0.5 rounded bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 cursor-pointer"
                              >
                                GOAL / WINNER!
                              </button>
                              <button
                                onClick={(e) => handleQuickAlert(m, 'ace', 'SERVICE ACE!', e)}
                                className="px-2 py-0.5 rounded bg-cyan-500/15 hover:bg-cyan-500/30 border border-cyan-500/30 text-[10px] font-bold text-cyan-300 cursor-pointer"
                              >
                                ACE / SMASH!
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* OBS Link & Controls Row */}
                  <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-col gap-3">
                    {/* Copy OBS Browser Source Box */}
                    <div className="flex items-center gap-2 bg-[#060a14] p-2 rounded-xl border border-slate-800/90 text-xs">
                      <span className="text-cyan-400 font-mono text-[11px] shrink-0">OBS URL:</span>
                      <span className="font-mono text-slate-300 truncate text-[11px] flex-1">
                        {obsUrl}
                      </span>
                      <button
                        onClick={(e) => handleCopyObsUrl(m.activeOverlayToken, e)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-[#0c1424] hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-400 text-white rounded-lg transition-colors shrink-0 cursor-pointer"
                      >
                        {copiedToken === m.activeOverlayToken ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (isCricket) {
                              onNavigate('scoring', m.id);
                            } else {
                              onNavigate('multi-scoring', m.id);
                            }
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
                        >
                          <Radio className="w-3.5 h-3.5" />
                          <span>Scoring &amp; Hotkeys</span>
                        </button>

                        <button
                          onClick={() => onNavigate('overlay-control', m.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#0b1324] hover:bg-[#0d162b] border border-slate-800 hover:border-cyan-500/40 text-slate-200 rounded-xl transition-colors cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Overlay Studio</span>
                        </button>
                      </div>

                      <a
                        href={`/overlay/${m.activeOverlayToken}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        <span>Launch Overlay</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
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
