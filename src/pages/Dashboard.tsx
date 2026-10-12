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
  Search,
  Sparkles,
  Tv,
  Play,
  LayoutGrid,
  List,
  Activity,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { RuleBookModal } from '../components/common/RuleBookModal';
import { MarketingluLoadingScreen } from '../components/common/MarketingluLoadingScreen';

interface DashboardProps {
  onNavigate: (tab: string, matchId?: string) => void;
}

const MAIN_SPORTS = [
  { id: 'cricket', label: 'Cricket', icon: '🏏' },
  { id: 'football', label: 'Football', icon: '⚽' },
  { id: 'basketball', label: 'Basketball', icon: '🏀' },
  { id: 'kabaddi', label: 'Kabaddi', icon: '🤼' },
  { id: 'badminton', label: 'Badminton', icon: '🏸' },
  { id: 'table_tennis', label: 'Table Tennis', icon: '🏓' },
  { id: 'volleyball', label: 'Volleyball', icon: '🏐' },
  { id: 'tennis', label: 'Lawn Tennis', icon: '🎾' },
  { id: 'field_hockey', label: 'Field Hockey', icon: '🏑' },
  { id: 'baseball', label: 'Baseball', icon: '⚾' },
  { id: 'rugby', label: 'Rugby Union', icon: '🏉' },
  { id: 'all', label: 'All 11 Sports', icon: '🏆' },
];

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'outdoor' | 'arena'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [layoutMode, setLayoutMode] = useState<'card' | 'list'>('card');
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
  const [ruleBookModalSport, setRuleBookModalSport] = useState<any>(null);

  const showToast = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 2800);
  };

  const getMatchScoreSummary = (m: Match) => {
    if (m.sport === 'cricket' && m.cricketState) {
      const inn = m.cricketState.innings[m.cricketState.currentInningsIndex];
      if (inn) {
        return {
          scoreText: `${inn.runs}/${inn.wickets}`,
          metaText: `${inn.oversFormatted} ov • CRR ${inn.currentRunRate.toFixed(2)}`,
        };
      }
    } else if (m.sport === 'football' && m.footballState) {
      return {
        scoreText: `${m.footballState.homeScore} - ${m.footballState.awayScore}`,
        metaText: `${m.footballState.clock || `${m.footballState.minute}'`} • ${m.footballState.half.toUpperCase()}`,
      };
    } else if (m.sport === 'basketball' && m.basketballState) {
      return {
        scoreText: `${m.basketballState.homeScore} - ${m.basketballState.awayScore}`,
        metaText: `Q${m.basketballState.quarter} ${m.basketballState.clock}`,
      };
    } else if (m.sport === 'badminton' && m.badmintonState) {
      return {
        scoreText: `${m.badmintonState.homePoints} - ${m.badmintonState.awayPoints}`,
        metaText: `Set ${m.badmintonState.currentSet + 1}`,
      };
    } else if (m.sport === 'table_tennis' && m.tableTennisState) {
      return {
        scoreText: `${m.tableTennisState.homePoints} - ${m.tableTennisState.awayPoints}`,
        metaText: `Set ${m.tableTennisState.currentSet + 1}`,
      };
    } else if (m.sport === 'volleyball' && m.volleyballState) {
      return {
        scoreText: `${m.volleyballState.homeScore} - ${m.volleyballState.awayScore}`,
        metaText: `Set ${m.volleyballState.currentSet + 1}`,
      };
    } else if (m.sport === 'tennis' && m.tennisState) {
      const currSet = m.tennisState.sets[m.tennisState.currentSet] || { home: 0, away: 0 };
      return {
        scoreText: `${m.tennisState.currentGame.homePoints} - ${m.tennisState.currentGame.awayPoints}`,
        metaText: `Set ${m.tennisState.currentSet + 1} (${currSet.home}-${currSet.away})`,
      };
    } else if (m.sport === 'field_hockey' && m.fieldHockeyState) {
      return {
        scoreText: `${m.fieldHockeyState.homeScore} - ${m.fieldHockeyState.awayScore}`,
        metaText: `Q${m.fieldHockeyState.quarter} • ${m.fieldHockeyState.minute}'`,
      };
    } else if (m.sport === 'baseball' && m.baseballState) {
      return {
        scoreText: `${m.baseballState.awayScore} - ${m.baseballState.homeScore}`,
        metaText: `${m.baseballState.half.toUpperCase()} ${m.baseballState.inning}`,
      };
    } else if (m.sport === 'rugby' && m.rugbyState) {
      return {
        scoreText: `${m.rugbyState.homeScore} - ${m.rugbyState.awayScore}`,
        metaText: `${m.rugbyState.minute}'`,
      };
    } else if (m.sport === 'kabaddi' && m.kabaddiState) {
      return {
        scoreText: `${m.kabaddiState.homeScore} - ${m.kabaddiState.awayScore}`,
        metaText: `Half ${m.kabaddiState.half} • Raid ${m.kabaddiState.raidClock}s • ${m.kabaddiState.homeActivePlayers}v${m.kabaddiState.awayActivePlayers}`,
      };
    }
    return { scoreText: '0 - 0', metaText: 'Live' };
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

      {/* Hero / MarketinGlu Studio Header */}
      <div className="relative border-b border-slate-800/80 bg-gradient-to-b from-[#0c1424] via-[#090f1f] to-[#070b14] px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-bold uppercase tracking-wider text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Live Broadcast Engine • 8 Sports
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-cyan-200 to-sky-400 bg-clip-text text-transparent mt-1.5 font-['Space_Grotesk',sans-serif]">
              Master Production Overlay Studio
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleToggleGlobalFeed}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                simulatingCricket
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-400/50 text-white shadow-lg shadow-emerald-600/25'
                  : 'bg-[#0b1324] hover:bg-[#0d162b] text-cyan-300 border-slate-800/90'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{simulatingCricket ? 'Auto-Simulating' : 'Live Auto-Feed'}</span>
            </button>

            <button
              onClick={() => onNavigate('architecture')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#0b1324] hover:bg-[#0d162b] text-amber-300 border border-slate-800/90 hover:border-cyan-500/40 rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>3-Tier Architecture</span>
            </button>

            <button
              onClick={() => onNavigate('obs-guide')}
              className="px-3 py-1.5 text-xs font-bold bg-[#0b1324] hover:bg-[#0d162b] text-slate-200 border border-slate-800/90 rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              OBS Guide
            </button>

            <button
              onClick={() => onNavigate('create')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl transition-all shadow-md shadow-cyan-500/25 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Match Channel</span>
            </button>
          </div>
        </div>

        {/* Studio Summary Metrics - Minimal & Compact */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <div
            onClick={() => setStatusFilter('all')}
            className={`cursor-pointer bg-[#0c1424]/90 border p-3 rounded-xl transition-all ${
              statusFilter === 'all'
                ? 'border-cyan-500/50 shadow-md shadow-cyan-950/40'
                : 'border-slate-800/80 hover:border-sky-500/40'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>All Broadcasts</span>
              <Tv className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {activeCount} <span className="text-[11px] font-normal text-cyan-400">LIVE</span>
            </div>
          </div>

          <div
            onClick={() => setStatusFilter('outdoor')}
            className={`cursor-pointer bg-[#0c1424]/90 border p-3 rounded-xl transition-all ${
              statusFilter === 'outdoor'
                ? 'border-emerald-500/50 shadow-md shadow-emerald-950/40'
                : 'border-slate-800/80 hover:border-emerald-500/40'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Outdoor Sports</span>
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
              {outdoorCount} <span className="text-[11px] font-normal text-slate-400">FEEDS</span>
            </div>
          </div>

          <div
            onClick={() => setStatusFilter('arena')}
            className={`cursor-pointer bg-[#0c1424]/90 border p-3 rounded-xl transition-all ${
              statusFilter === 'arena'
                ? 'border-cyan-500/50 shadow-md shadow-cyan-950/40'
                : 'border-slate-800/80 hover:border-cyan-500/40'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Arena &amp; Court</span>
              <Keyboard className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-xl font-bold font-mono text-sky-300 mt-1">
              {courtArenaCount} <span className="text-[11px] font-normal text-slate-400">FEEDS</span>
            </div>
          </div>

          <div
            onClick={() => onNavigate('architecture')}
            className="cursor-pointer bg-[#0c1424]/90 border border-slate-800/80 hover:border-purple-500/40 p-3 rounded-xl transition-all"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Architecture</span>
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">
              8/8 <span className="text-[11px] font-normal text-slate-400">READY</span>
            </div>
          </div>
        </div>

        {/* Quick Workflow Bar */}
        <div className="max-w-7xl mx-auto mt-3.5 bg-[#0c1424]/80 border border-slate-800/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200 block">
                Quick Workflow
              </span>
              <span className="text-[11px] text-slate-400 hidden md:inline">
                Launch sports graphics to OBS in 3 simple steps
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              onClick={() => onNavigate('create')}
              className="px-3 py-1.5 rounded-lg bg-[#060a14] border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all flex items-center gap-2"
            >
              <span className="text-[10px] font-mono font-bold text-cyan-400">01</span>
              <span className="text-xs font-semibold text-white">Pick Sport</span>
            </div>
            <div
              onClick={() => onNavigate('multi-scoring', 'match_tt_wtt_final')}
              className="px-3 py-1.5 rounded-lg bg-[#060a14] border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all flex items-center gap-2"
            >
              <span className="text-[10px] font-mono font-bold text-sky-400">02</span>
              <span className="text-xs font-semibold text-white">Score Hotkeys</span>
            </div>
            <div
              onClick={() => onNavigate('obs-guide')}
              className="px-3 py-1.5 rounded-lg bg-[#060a14] border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all flex items-center gap-2"
            >
              <span className="text-[10px] font-mono font-bold text-emerald-400">03</span>
              <span className="text-xs font-semibold text-white">OBS Browser</span>
            </div>
            <button
              onClick={() => onNavigate('obs-guide')}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 ml-1 cursor-pointer"
            >
              Guide →
            </button>
          </div>
        </div>

        {/* Minimal Database Bar */}
        <div className="max-w-7xl mx-auto mt-3 bg-[#090f1f]/80 border border-slate-800/80 rounded-xl px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Hostinger MySQL: {hostingerStatus?.host || 'srv1234.hstgr.io'}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">{hostingerStatus?.syncedMatchesCount ?? matches.length} matches synced</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSyncHostinger}
              disabled={syncingDb}
              className="px-2 py-0.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 cursor-pointer transition-all"
            >
              {syncingDb ? 'Syncing...' : 'Sync DB'}
            </button>
            <button
              onClick={handleOpenSqlExport}
              className="px-2 py-0.5 rounded-lg bg-[#060a14] hover:bg-[#0c1424] border border-slate-800 text-[10px] font-bold text-cyan-300 cursor-pointer transition-all"
            >
              Export .SQL
            </button>
            <button
              onClick={() => onNavigate('architecture')}
              className="px-2 py-0.5 rounded-lg bg-[#060a14] hover:bg-[#0c1424] border border-slate-800 text-[10px] font-bold text-amber-300 cursor-pointer transition-all"
            >
              Blueprint →
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
        {/* Search, Filter & View Mode Control Panel */}
        <div className="bg-[#0b1324]/90 border border-slate-800/80 rounded-2xl p-3.5 shadow-lg space-y-3">
          {/* Top Row: Search Input + Match Counter + Reset + View Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search team, sport, tournament..."
                className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl pl-8 pr-8 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Actions: Match Counter, Reset & Card/List Switcher */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-[11px] font-mono text-slate-400 px-2.5 py-1 bg-[#060a14] rounded-lg border border-slate-800/80 shrink-0">
                <span className="text-cyan-400 font-bold">{filteredMatches.length}</span>{' '}
                <span className="text-slate-500">/</span> {matches.length} matches
              </span>

              {(selectedSport !== 'all' || searchQuery !== '' || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedSport('all');
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#060a14] border border-cyan-500/40 text-[11px] text-cyan-300 hover:text-cyan-200 cursor-pointer transition-all shrink-0"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}

              {/* View Toggle */}
              <div className="flex items-center bg-[#060a14] border border-slate-800 rounded-xl p-0.5 gap-0.5 shrink-0">
                <button
                  onClick={() => setLayoutMode('card')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    layoutMode === 'card'
                      ? 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white shadow-sm shadow-cyan-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-[#0c1424]'
                  }`}
                  title="Expanded Broadcast Cards"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Cards</span>
                </button>
                <button
                  onClick={() => setLayoutMode('list')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    layoutMode === 'list'
                      ? 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white shadow-sm shadow-cyan-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-[#0c1424]'
                  }`}
                  title="Compact Multi-Channel List"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row: Full-width Sports Selector Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
            {MAIN_SPORTS.map((sport) => {
              const sportCount =
                sport.id === 'all'
                  ? matches.length
                  : matches.filter((m) => m.sport === sport.id).length;

              const isSelected = selectedSport === sport.id;

              return (
                <button
                  key={sport.id}
                  onClick={() => setSelectedSport(sport.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white shadow-md shadow-cyan-500/25 font-bold'
                      : 'bg-[#060a14] border border-slate-800/80 text-slate-400 hover:text-white hover:border-slate-700 hover:bg-[#0c1424]'
                  }`}
                >
                  <span className="text-xs">{sport.icon}</span>
                  <span>{sport.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected
                        ? 'bg-black/35 text-cyan-200 font-bold'
                        : 'bg-slate-800/70 text-slate-500'
                    }`}
                  >
                    {sportCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Matches Grid or List */}
        {loading ? (
          <div className="py-8">
            <MarketingluLoadingScreen
              message="Loading Broadcast Studio Channels..."
              subMessage="Connecting to active sports telemetry feeds & real-time score pipelines"
              fullScreen={false}
              size="md"
              showProgress={true}
            />
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
        ) : layoutMode === 'list' ? (
          /* ========================================================
             COMPACT LIST VIEW (High-Density Multi-Channel Rack)
             ======================================================== */
          <div className="space-y-2 mt-5">
            {filteredMatches.map((m) => {
              const isCricket = m.sport === 'cricket';
              const { scoreText, metaText } = getMatchScoreSummary(m);

              return (
                <div
                  key={m.id}
                  className="bg-[#0b1324]/90 border border-slate-800/80 hover:border-cyan-500/40 rounded-xl px-3.5 py-2.5 transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  {/* Left: Sport, Match & Tournament */}
                  <div className="flex items-center gap-2.5 min-w-[200px]">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-bold uppercase tracking-wider text-cyan-300 shrink-0">
                      {m.sport.replace('_', ' ')}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        <h4 className="font-bold text-xs text-white truncate max-w-[180px]">
                          {m.name}
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-400 truncate block max-w-[180px]">
                        {m.tournament}
                      </span>
                    </div>
                  </div>

                  {/* Center: Teams matchup & live score */}
                  <div className="flex items-center justify-between gap-3 bg-[#060a14]/90 px-3 py-1.5 rounded-lg border border-slate-800/80 flex-1 min-w-[240px]">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: m.teamA.color || '#06b6d4' }}
                      />
                      <span className="font-bold text-xs text-white">
                        {m.teamA.shortName}
                      </span>
                      <span className="text-cyan-400 text-[10px] font-semibold">vs</span>
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: m.teamB.color || '#ef4444' }}
                      />
                      <span className="font-bold text-xs text-white">
                        {m.teamB.shortName}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-sm font-mono tabular-nums text-white">
                        {scoreText}
                      </div>
                      <div className="text-[10px] text-cyan-300/80 font-mono">
                        {metaText}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 justify-end">
                    <button
                      onClick={(e) => handleCopyObsUrl(m.activeOverlayToken, e)}
                      className="px-2 py-1 text-[11px] font-mono font-bold bg-[#090f1f] hover:bg-cyan-500/20 border border-slate-800 hover:border-cyan-400 text-slate-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      title="Copy OBS URL"
                    >
                      {copiedToken === m.activeOverlayToken ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-cyan-400" />
                      )}
                      <span>OBS</span>
                    </button>

                    <button
                      onClick={() => {
                        if (isCricket) {
                          onNavigate('scoring', m.id);
                        } else {
                          onNavigate('multi-scoring', m.id);
                        }
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Radio className="w-3 h-3" />
                      <span>Scorer</span>
                    </button>

                    <button
                      onClick={() => onNavigate('overlay-control', m.id)}
                      className="px-2.5 py-1 text-[11px] font-bold bg-[#090f1f] hover:bg-[#0d162b] border border-slate-800 hover:border-cyan-500/30 text-slate-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Sliders className="w-3 h-3 text-cyan-400" />
                      <span>Studio</span>
                    </button>

                    <a
                      href={`/overlay/${m.activeOverlayToken}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-cyan-400 hover:text-white rounded-lg transition-colors"
                      title="Open Overlay"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={(e) => handleDelete(m.id, e)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete match"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ========================================================
             COMPACT CARD VIEW (High-Density Modern Broadcast Cards)
             ======================================================== */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-5">
            {filteredMatches.map((m) => {
              const isCricket = m.sport === 'cricket';
              const { scoreText, metaText } = getMatchScoreSummary(m);

              return (
                <div
                  key={m.id}
                  className="bg-[#0b1324]/90 border border-slate-800/80 hover:border-cyan-500/40 rounded-xl p-3.5 transition-all flex flex-col justify-between shadow-lg shadow-black/30 group"
                >
                  <div>
                    {/* Top Header: Sport tag, Tournament, Live badge, Delete */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-bold uppercase tracking-wider text-cyan-300 shrink-0">
                          {m.sport.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-400 truncate font-medium">
                          {m.tournament}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          LIVE
                        </span>
                        <button
                          onClick={(e) => handleDelete(m.id, e)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer ml-1"
                          title="Delete match"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Match Name */}
                    <h3 className="font-bold text-sm text-white font-['Space_Grotesk',sans-serif] mt-1.5 truncate">
                      {m.name}
                    </h3>

                    {/* Compact Match Score Box */}
                    <div className="mt-2.5 px-3 py-2 bg-[#060a14]/90 rounded-lg border border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: m.teamA.color || '#06b6d4' }}
                          />
                          <span className="font-bold text-xs text-white truncate max-w-[100px]">
                            {m.teamA.shortName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: m.teamB.color || '#ef4444' }}
                          />
                          <span className="font-bold text-xs text-white truncate max-w-[100px]">
                            {m.teamB.shortName}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-black text-lg font-mono tabular-nums text-white">
                          {scoreText}
                        </div>
                        <div className="text-[10px] text-cyan-300/80 font-mono">
                          {metaText}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Compact Actions Footer */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/70 flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          if (isCricket) {
                            onNavigate('scoring', m.id);
                          } else {
                            onNavigate('multi-scoring', m.id);
                          }
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Radio className="w-3 h-3" />
                        <span>Scorer</span>
                      </button>

                      <button
                        onClick={() => onNavigate('overlay-control', m.id)}
                        className="px-2.5 py-1 text-[11px] font-bold bg-[#090f1f] hover:bg-[#0d162b] border border-slate-800 hover:border-cyan-500/30 text-slate-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Sliders className="w-3 h-3 text-cyan-400" />
                        <span>Studio</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRuleBookModalSport(m.sport);
                        }}
                        className="p-1 text-slate-400 hover:text-cyan-300 rounded-lg transition-colors cursor-pointer"
                        title="View Official Rules & Referee Signals"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => handleCopyObsUrl(m.activeOverlayToken, e)}
                        className="px-2 py-1 text-[11px] font-mono font-bold bg-[#090f1f] hover:bg-cyan-500/20 border border-slate-800 hover:border-cyan-400 text-slate-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        title="Copy OBS URL"
                      >
                        {copiedToken === m.activeOverlayToken ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-cyan-400" />
                        )}
                        <span>OBS</span>
                      </button>

                      <a
                        href={`/overlay/${m.activeOverlayToken}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 text-cyan-400 hover:text-white rounded-lg transition-colors"
                        title="Open Overlay"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Official In-Game Rule Book Modal */}
      <RuleBookModal
        isOpen={ruleBookModalSport !== null}
        onClose={() => setRuleBookModalSport(null)}
        initialSport={ruleBookModalSport || 'cricket'}
      />
    </div>
  );
};
