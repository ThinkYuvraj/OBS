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
  Star,
} from 'lucide-react';
import { RuleBookModal } from '../components/common/RuleBookModal';
import { MarketingluLoadingScreen } from '../components/common/MarketingluLoadingScreen';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';

interface DashboardProps {
  onNavigate: (tab: string, matchId?: string) => void;
  onOpenGuide?: () => void;
  onOpenPreloader?: () => void;
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

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onOpenGuide, onOpenPreloader }) => {
  const { isRedWhite } = useTheme();
  const toast = useToast();
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
    toast.info(msg);
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

  const handleExportMatchesJson = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      generator: 'MarketinGlu OBS Broadcast Engine v2.0',
      totalMatches: matches.length,
      matches,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marketinGlu_broadcast_matches_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${matches.length} broadcast matches to JSON backup`);
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
    <div className="min-h-screen bg-[#0a0305] text-white pb-24 sm:pb-20 w-full overflow-x-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Live Feedback Toast */}
      {actionFeedback && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-gradient-to-r from-[#1f060e] via-[#2a0914] to-[#150409] border-2 border-red-600 text-white text-xs font-bold shadow-2xl shadow-red-950/90 animate-bounce">
          <Sparkles className="w-4 h-4 text-white shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Hero / MarketinGlu Studio Header */}
      <div
        className={`relative border-b px-3 sm:px-6 py-4 sm:py-6 transition-colors duration-300 ${
          isRedWhite
            ? 'border-red-200 bg-white shadow-sm'
            : 'border-slate-800/80 bg-gradient-to-b from-[#0c1424] via-[#090f1f] to-[#070b14]'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border-2 shadow-sm ${
                isRedWhite
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isRedWhite ? 'bg-red-600 animate-ping' : 'bg-cyan-400 animate-pulse'}`} />
              <span className="font-['Space_Grotesk',sans-serif]">Cricket Ball Red &amp; Proper White Livery • 11 Sports Supported</span>
            </div>
            <h1
              className={`text-2xl md:text-3xl font-black tracking-tight mt-1.5 font-['Space_Grotesk',sans-serif] ${
                isRedWhite
                  ? 'text-slate-900'
                  : 'bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-sky-400'
              }`}
            >
              Master Production Overlay Studio
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* New Preloader Trigger Button */}
            {onOpenPreloader && (
              <button
                onClick={onOpenPreloader}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black rounded-xl border-2 transition-all cursor-pointer whitespace-nowrap shadow-sm ${
                  isRedWhite
                    ? 'bg-white hover:bg-red-50 text-red-600 border-red-600 shadow-sm'
                    : 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40'
                }`}
                title="Launch the Cricket Ball Red & White Preloader Screen"
              >
                <span className="text-sm">🏏</span>
                <span>Launch Preloader</span>
              </button>
            )}

            <button
              onClick={handleToggleGlobalFeed}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                simulatingCricket
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-400/50 text-white shadow-lg shadow-emerald-600/25'
                  : isRedWhite
                  ? 'bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 border-red-200'
                  : 'bg-[#0b1324] hover:bg-[#0d162b] text-cyan-300 border-slate-800/90'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{simulatingCricket ? 'Auto-Simulating' : 'Live Auto-Feed'}</span>
            </button>

            {onOpenGuide && (
              <button
                onClick={onOpenGuide}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap shadow-sm ${
                  isRedWhite
                    ? 'bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 border-red-200'
                    : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border-cyan-500/40 shadow-cyan-950/40'
                }`}
                title="Interactive Guide: How to Use the Broadcast Panel (Shift+G or ?)"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Panel Guide</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('architecture')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                isRedWhite
                  ? 'bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 border-red-200'
                  : 'bg-[#0b1324] hover:bg-[#0d162b] text-amber-300 border-slate-800/90'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-red-500" />
              <span>3-Tier Architecture</span>
            </button>

            <button
              onClick={() => onNavigate('obs-guide')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                isRedWhite
                  ? 'bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 border-red-200'
                  : 'bg-[#0b1324] hover:bg-[#0d162b] text-slate-200 border-slate-800/90'
              }`}
            >
              OBS Guide
            </button>

            <button
              onClick={() => onNavigate('create')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black text-white rounded-xl transition-all shadow-md cursor-pointer whitespace-nowrap ${
                isRedWhite
                  ? 'bg-red-600 hover:bg-red-700 border border-red-600 shadow-md shadow-red-600/30'
                  : 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/25'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-white stroke-[3]" />
              <span>New Match Channel</span>
            </button>
          </div>
        </div>

        {/* Studio Summary Metrics in Cricket Ball Red & Proper White */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <div
            onClick={() => setStatusFilter('all')}
            className={`cursor-pointer border-2 p-3 rounded-xl transition-all ${
              statusFilter === 'all'
                ? isRedWhite
                  ? 'border-red-600 bg-red-600 text-white shadow-md shadow-red-600/25'
                  : 'border-cyan-500/50 shadow-md shadow-cyan-950/40 bg-[#0c1424]/90 text-white'
                : isRedWhite
                ? 'bg-white border-red-200 hover:border-red-400 text-slate-800 shadow-sm'
                : 'border-slate-800/80 hover:border-sky-500/40 bg-[#0c1424]/90 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className={statusFilter === 'all' && isRedWhite ? 'text-white font-bold' : isRedWhite ? 'text-slate-600 font-semibold' : 'text-rose-200'}>All Broadcasts</span>
              <Tv className={`w-3.5 h-3.5 ${statusFilter === 'all' && isRedWhite ? 'text-white' : 'text-red-600'}`} />
            </div>
            <div className={`text-2xl font-black font-mono mt-1 tabular-nums ${statusFilter === 'all' && isRedWhite ? 'text-white' : isRedWhite ? 'text-slate-900' : 'text-white'}`}>
              {activeCount} <span className={`text-[11px] font-extrabold ${statusFilter === 'all' && isRedWhite ? 'text-white' : 'text-red-600'}`}>LIVE</span>
            </div>
          </div>

          <div
            onClick={() => setStatusFilter('outdoor')}
            className={`cursor-pointer border-2 p-3 rounded-xl transition-all ${
              statusFilter === 'outdoor'
                ? isRedWhite
                  ? 'border-red-600 bg-red-600 text-white shadow-md shadow-red-600/25'
                  : 'border-emerald-500/50 shadow-md shadow-emerald-950/40 bg-[#0c1424]/90 text-white'
                : isRedWhite
                ? 'bg-white border-red-200 hover:border-red-400 text-slate-800 shadow-sm'
                : 'border-slate-800/80 hover:border-emerald-500/40 bg-[#0c1424]/90 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className={statusFilter === 'outdoor' && isRedWhite ? 'text-white font-bold' : isRedWhite ? 'text-slate-600 font-semibold' : 'text-rose-200'}>Outdoor Sports</span>
              <Radio className={`w-3.5 h-3.5 ${statusFilter === 'outdoor' && isRedWhite ? 'text-white' : 'text-red-600'}`} />
            </div>
            <div className={`text-2xl font-black font-mono mt-1 tabular-nums ${statusFilter === 'outdoor' && isRedWhite ? 'text-white' : isRedWhite ? 'text-slate-900' : 'text-white'}`}>
              {outdoorCount} <span className={`text-[11px] font-extrabold ${statusFilter === 'outdoor' && isRedWhite ? 'text-white' : 'text-red-600'}`}>FEEDS</span>
            </div>
          </div>

          <div
            onClick={() => setStatusFilter('arena')}
            className={`cursor-pointer border-2 p-3 rounded-xl transition-all ${
              statusFilter === 'arena'
                ? isRedWhite
                  ? 'border-red-600 bg-red-600 text-white shadow-md shadow-red-600/25'
                  : 'border-cyan-500/50 shadow-md shadow-cyan-950/40 bg-[#0c1424]/90 text-white'
                : isRedWhite
                ? 'bg-white border-red-200 hover:border-red-400 text-slate-800 shadow-sm'
                : 'border-slate-800/80 hover:border-cyan-500/40 bg-[#0c1424]/90 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className={statusFilter === 'arena' && isRedWhite ? 'text-white font-bold' : isRedWhite ? 'text-slate-600 font-semibold' : 'text-rose-200'}>Arena &amp; Court</span>
              <Keyboard className={`w-3.5 h-3.5 ${statusFilter === 'arena' && isRedWhite ? 'text-white' : 'text-red-600'}`} />
            </div>
            <div className={`text-2xl font-black font-mono mt-1 tabular-nums ${statusFilter === 'arena' && isRedWhite ? 'text-white' : isRedWhite ? 'text-slate-900' : 'text-white'}`}>
              {courtArenaCount} <span className={`text-[11px] font-extrabold ${statusFilter === 'arena' && isRedWhite ? 'text-white' : 'text-red-600'}`}>FEEDS</span>
            </div>
          </div>

          <div
            onClick={() => onNavigate('architecture')}
            className={`cursor-pointer border-2 p-3 rounded-xl transition-all ${
              isRedWhite
                ? 'bg-white border-red-200 hover:border-red-400 text-slate-800 shadow-sm'
                : 'bg-[#0c1424]/90 border-slate-800/80 hover:border-purple-500/40 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className={isRedWhite ? 'text-slate-600 font-semibold' : 'text-rose-200'}>Architecture</span>
              <Cpu className="w-3.5 h-3.5 text-red-600" />
            </div>
            <div className={`text-2xl font-black font-mono mt-1 tabular-nums ${isRedWhite ? 'text-slate-900' : 'text-white'}`}>
              8/8 <span className="text-[11px] font-bold text-red-600">READY</span>
            </div>
          </div>
        </div>

        {/* Quick Workflow Bar in Cricket Ball Red & Proper White */}
        <div
          className={`max-w-7xl mx-auto mt-3.5 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-2 transition-all ${
            isRedWhite
              ? 'bg-white border-red-200 shadow-sm'
              : 'bg-[#0c1424]/80 border-slate-800/80'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className={`w-4 h-4 shrink-0 ${isRedWhite ? 'text-red-600' : 'text-cyan-400'}`} />
            <div>
              <span className={`text-xs font-black uppercase tracking-wider block ${isRedWhite ? 'text-slate-900' : 'text-white'}`}>
                Quick Workflow
              </span>
              <span className={`text-[11px] hidden md:inline ${isRedWhite ? 'text-slate-500 font-medium' : 'text-slate-400'}`}>
                Launch sports graphics to OBS in 3 simple steps
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              onClick={() => onNavigate('create')}
              className={`px-3 py-1.5 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-2 ${
                isRedWhite
                  ? 'bg-red-50/70 border-red-200 hover:border-red-400 hover:bg-red-100/60 text-slate-800'
                  : 'bg-[#060a14] border-slate-800 hover:border-cyan-500/40 text-white'
              }`}
            >
              <span className={`text-[10px] font-mono font-black ${isRedWhite ? 'text-red-600' : 'text-cyan-400'}`}>01</span>
              <span className={`text-xs font-bold ${isRedWhite ? 'text-slate-800' : 'text-white'}`}>Pick Sport</span>
            </div>
            <div
              onClick={() => onNavigate('multi-scoring', 'match_tt_wtt_final')}
              className={`px-3 py-1.5 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-2 ${
                isRedWhite
                  ? 'bg-red-50/70 border-red-200 hover:border-red-400 hover:bg-red-100/60 text-slate-800'
                  : 'bg-[#060a14] border-slate-800 hover:border-cyan-500/40 text-white'
              }`}
            >
              <span className={`text-[10px] font-mono font-black ${isRedWhite ? 'text-red-600' : 'text-sky-400'}`}>02</span>
              <span className={`text-xs font-bold ${isRedWhite ? 'text-slate-800' : 'text-white'}`}>Score Hotkeys</span>
            </div>
            <div
              onClick={() => onNavigate('obs-guide')}
              className={`px-3 py-1.5 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-2 ${
                isRedWhite
                  ? 'bg-red-50/70 border-red-200 hover:border-red-400 hover:bg-red-100/60 text-slate-800'
                  : 'bg-[#060a14] border-slate-800 hover:border-emerald-500/40 text-white'
              }`}
            >
              <span className={`text-[10px] font-mono font-black ${isRedWhite ? 'text-red-600' : 'text-emerald-400'}`}>03</span>
              <span className={`text-xs font-bold ${isRedWhite ? 'text-slate-800' : 'text-white'}`}>OBS Browser</span>
            </div>
            {onOpenGuide ? (
              <button
                onClick={onOpenGuide}
                className={`px-3 py-1.5 rounded-lg border-2 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all ml-1 shadow-sm ${
                  isRedWhite
                    ? 'bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-sm'
                    : 'bg-cyan-500/15 hover:bg-cyan-500/25 border-cyan-500/40 text-cyan-200'
                }`}
                title="Launch interactive walkthrough & keyboard guide"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Panel Guide</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('obs-guide')}
                className={`text-xs font-mono font-bold ml-1 cursor-pointer ${
                  isRedWhite ? 'text-red-600 hover:underline' : 'text-cyan-400 hover:text-cyan-300'
                }`}
              >
                Guide →
              </button>
            )}
          </div>
        </div>

        {/* Database & Sync Bar */}
        <div
          className={`max-w-7xl mx-auto mt-3 rounded-xl px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs border-2 transition-all ${
            isRedWhite
              ? 'bg-white border-red-200 shadow-sm'
              : 'bg-[#090f1f]/80 border-slate-800/80'
          }`}
        >
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className={`w-2 h-2 rounded-full ${isRedWhite ? 'bg-red-600 animate-pulse' : 'bg-emerald-400 animate-pulse'}`} />
            <span className={isRedWhite ? 'text-slate-800 font-bold' : 'text-emerald-400'}>
              Hostinger MySQL: {hostingerStatus?.host || 'srv1234.hstgr.io'}
            </span>
            <span className={isRedWhite ? 'text-red-300' : 'text-slate-600'}>•</span>
            <span className={isRedWhite ? 'text-slate-600 font-medium' : 'text-slate-300'}>
              {hostingerStatus?.syncedMatchesCount ?? matches.length} matches synced
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSyncHostinger}
              disabled={syncingDb}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-black cursor-pointer transition-all ${
                isRedWhite
                  ? 'bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-sm'
                  : 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/30 text-emerald-300'
              }`}
            >
              {syncingDb ? 'Syncing...' : 'Sync DB'}
            </button>
            <button
              onClick={handleOpenSqlExport}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer transition-all ${
                isRedWhite
                  ? 'bg-white hover:bg-red-50 text-red-600 border-red-200'
                  : 'bg-[#060a14] hover:bg-[#0c1424] border-slate-800 text-cyan-300'
              }`}
            >
              Export .SQL
            </button>
            <button
              onClick={handleExportMatchesJson}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer transition-all ${
                isRedWhite
                  ? 'bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 border-red-200'
                  : 'bg-[#060a14] hover:bg-[#0c1424] border-slate-800 text-sky-300'
              }`}
              title="Download full JSON match archive"
            >
              Backup .JSON
            </button>
            <button
              onClick={() => onNavigate('architecture')}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer transition-all ${
                isRedWhite
                  ? 'bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 border-red-200'
                  : 'bg-[#060a14] hover:bg-[#0c1424] border-slate-800 text-amber-300'
              }`}
            >
              Blueprint →
            </button>
          </div>
        </div>

        {/* Google Play Store Rating & Reviews Prompt Banner */}
        <div
          className={`max-w-7xl mx-auto mt-3 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs border-2 shadow-sm transition-all ${
            isRedWhite
              ? 'bg-white border-red-200'
              : 'bg-gradient-to-r from-[#0c1a30] via-[#091426] to-[#070b14] border-cyan-500/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-3.5 h-3.5 fill-amber-400 stroke-none" />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-black ${isRedWhite ? 'text-slate-900' : 'text-white'}`}>4.9 / 5.0 Google Play Rating</span>
              <span className={`hidden sm:inline ${isRedWhite ? 'text-red-300' : 'text-slate-600'}`}>•</span>
              <span className={`hidden sm:inline ${isRedWhite ? 'text-slate-600 font-medium' : 'text-slate-300'}`}>
                Loved by 1,480+ sports streamers &amp; broadcasters
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('reviews')}
              className={`px-3 py-1.5 rounded-lg font-black text-[11px] flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                isRedWhite
                  ? 'bg-red-600 hover:bg-red-700 text-white border border-red-600 shadow-sm'
                  : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold'
              }`}
            >
              <span>Add Review / Rate on Play Store</span>
              <ExternalLink className="w-3 h-3" />
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 sm:mt-8">
        {/* Search, Filter & View Mode Control Panel in Cricket Ball Red & Proper White */}
        <div
          className={`border-2 rounded-2xl p-3.5 shadow-sm space-y-3 transition-colors ${
            isRedWhite
              ? 'bg-white border-red-200'
              : 'bg-[#0b1324]/90 border-slate-800/80 shadow-black/40'
          }`}
        >
          {/* Top Row: Search Input + Match Counter + Reset + View Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-red-100">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${isRedWhite ? 'text-red-600' : 'text-slate-400'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search team, sport, tournament, venue..."
                className={`w-full border-2 rounded-xl pl-8 pr-8 py-1.5 text-xs outline-none transition-colors ${
                  isRedWhite
                    ? 'bg-red-50/40 border-red-200 text-slate-900 placeholder:text-slate-400 focus:border-red-600 focus:bg-white'
                    : 'bg-[#060a14] border-slate-800 focus:border-cyan-400 text-white placeholder:text-rose-300/50'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600 text-xs cursor-pointer font-bold"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Actions: Match Counter, Reset & Card/List Switcher */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border-2 shrink-0 ${
                isRedWhite
                  ? 'bg-red-50/60 border-red-200 text-slate-700'
                  : 'bg-[#060a14] border-slate-800/80 text-slate-400'
              }`}>
                <span className={`font-black ${isRedWhite ? 'text-red-600' : 'text-cyan-400'}`}>
                  {filteredMatches.length}
                </span>{' '}
                <span className={isRedWhite ? 'text-red-300' : 'text-slate-500'}>/</span> {matches.length} matches
              </span>

              {(selectedSport !== 'all' || searchQuery !== '' || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedSport('all');
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg border-2 text-[11px] font-black cursor-pointer transition-all shrink-0 ${
                    isRedWhite
                      ? 'bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-sm'
                      : 'bg-[#060a14] border-cyan-500/40 text-cyan-300 hover:text-cyan-200'
                  }`}
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}

              {/* View Toggle */}
              <div className={`flex items-center border-2 rounded-xl p-0.5 gap-0.5 shrink-0 ${
                isRedWhite ? 'bg-red-50/60 border-red-200' : 'bg-[#060a14] border-slate-800'
              }`}>
                <button
                  onClick={() => setLayoutMode('card')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black cursor-pointer transition-all ${
                    layoutMode === 'card'
                      ? isRedWhite
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white shadow-sm shadow-cyan-500/25'
                      : isRedWhite
                      ? 'text-slate-700 hover:text-red-600 hover:bg-white'
                      : 'text-slate-400 hover:text-white hover:bg-[#0c1424]'
                  }`}
                  title="Expanded Broadcast Cards"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Cards</span>
                </button>
                <button
                  onClick={() => setLayoutMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black cursor-pointer transition-all ${
                    layoutMode === 'list'
                      ? isRedWhite
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white shadow-sm shadow-cyan-500/25'
                      : isRedWhite
                      ? 'text-slate-700 hover:text-red-600 hover:bg-white'
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

          {/* Bottom Row: Full-width Sports Category Selector Capsule */}
          <div className="overflow-x-auto no-scrollbar scroll-smooth py-1">
            <div
              className={`inline-flex items-center gap-1.5 p-1 rounded-full border-2 backdrop-blur-md ${
                isRedWhite
                  ? 'bg-red-50/70 border-red-200'
                  : 'bg-[#051122]/90 border-cyan-500/30 shadow-inner'
              }`}
            >
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
                    className={`px-3.5 py-1.5 text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 rounded-full ${
                      isSelected
                        ? isRedWhite
                          ? 'border-2 border-red-600 bg-red-600 text-white font-black shadow-sm'
                          : 'border border-cyan-400 bg-cyan-950/70 text-white font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                        : isRedWhite
                        ? 'text-slate-700 hover:text-red-600 hover:bg-white font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/40 font-semibold'
                    }`}
                  >
                    <span className="text-xs">{sport.icon}</span>
                    <span>{sport.label}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        isSelected
                          ? isRedWhite
                            ? 'bg-white text-red-600'
                            : 'bg-cyan-400/20 text-cyan-200 border border-cyan-400/40'
                          : isRedWhite
                          ? 'bg-white text-slate-700 border border-red-200'
                          : 'bg-slate-800/70 text-slate-400'
                      }`}
                    >
                      {sportCount}
                    </span>
                  </button>
                );
              })}
            </div>
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
                  className={`rounded-xl px-3.5 py-2.5 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 border-2 ${
                    isRedWhite
                      ? 'bg-white border-red-200 hover:border-red-500 hover:shadow-md hover:shadow-red-500/10'
                      : 'bg-[#0b1324]/90 border-slate-800/80 hover:border-cyan-500/40'
                  }`}
                >
                  {/* Left: Sport, Match & Tournament */}
                  <div className="flex items-center gap-2.5 min-w-[200px]">
                    <span
                      className={`px-2 py-0.5 rounded-lg border text-[10px] font-black uppercase tracking-wider shrink-0 ${
                        isRedWhite
                          ? 'bg-red-50 text-red-700 border-red-200 shadow-sm'
                          : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                      }`}
                    >
                      {m.sport.replace('_', ' ')}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${isRedWhite ? 'bg-red-600 animate-pulse' : 'bg-emerald-400 animate-pulse'}`} />
                        <h4 className={`font-black text-xs truncate max-w-[180px] ${isRedWhite ? 'text-slate-900' : 'text-white'}`}>
                          {m.name}
                        </h4>
                      </div>
                      <span className={`text-[10px] truncate block max-w-[180px] font-medium ${isRedWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                        {m.tournament}
                      </span>
                    </div>
                  </div>

                  {/* Center: Teams matchup & live score */}
                  <div className={`flex items-center justify-between gap-3 px-3 py-1.5 rounded-lg border-2 flex-1 min-w-[240px] ${
                    isRedWhite ? 'bg-red-50/60 border-red-200' : 'bg-[#060a14]/90 border-slate-800/80'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: m.teamA.color || '#06b6d4' }}
                      />
                      <span className={`font-black text-xs ${isRedWhite ? 'text-slate-800' : 'text-white'}`}>
                        {m.teamA.shortName}
                      </span>
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.2 rounded ${
                          isRedWhite ? 'bg-red-600 text-white' : 'text-cyan-400'
                        }`}
                      >
                        vs
                      </span>
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: m.teamB.color || '#ef4444' }}
                      />
                      <span className={`font-black text-xs ${isRedWhite ? 'text-slate-800' : 'text-white'}`}>
                        {m.teamB.shortName}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className={`font-black text-sm font-mono tabular-nums ${isRedWhite ? 'text-red-600' : 'text-white'}`}>
                        {scoreText}
                      </div>
                      <div
                        className={`text-[10px] font-mono font-bold ${
                          isRedWhite ? 'text-slate-600' : 'text-cyan-300/80'
                        }`}
                      >
                        {metaText}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 justify-end">
                    <button
                      onClick={(e) => handleCopyObsUrl(m.activeOverlayToken, e)}
                      className={`px-2.5 py-1 text-[11px] font-mono font-black border rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                        isRedWhite
                          ? 'bg-white hover:bg-red-50 text-red-600 border-red-200 shadow-sm'
                          : 'bg-[#090f1f] hover:bg-cyan-500/20 border-slate-800 hover:border-cyan-400 text-slate-300'
                      }`}
                      title="Copy OBS URL"
                    >
                      {copiedToken === m.activeOverlayToken ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy
                          className={`w-3 h-3 ${isRedWhite ? 'text-red-600' : 'text-cyan-400'}`}
                        />
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
                      className={`px-3 py-1 text-[11px] font-black rounded-lg transition-all cursor-pointer flex items-center gap-1 border ${
                        isRedWhite
                          ? 'bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-sm'
                          : 'bg-cyan-500/15 hover:bg-cyan-500/25 border-cyan-500/30 text-cyan-300'
                      }`}
                    >
                      <Radio className="w-3 h-3" />
                      <span>Scorer</span>
                    </button>

                    <button
                      onClick={() => onNavigate('overlay-control', m.id)}
                      className={`px-3 py-1 text-[11px] font-black border rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                        isRedWhite
                          ? 'bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 border-red-200'
                          : 'bg-[#090f1f] hover:bg-[#0d162b] border-slate-800 hover:border-cyan-500/30 text-slate-300'
                      }`}
                    >
                      <Sliders
                        className={`w-3 h-3 ${isRedWhite ? 'text-red-600' : 'text-cyan-400'}`}
                      />
                      <span>Studio</span>
                    </button>

                    <a
                      href={`/overlay/${m.activeOverlayToken}`}
                      target="_blank"
                      rel="noreferrer"
                      className={`p-1.5 rounded-lg transition-colors ${
                        isRedWhite ? 'text-slate-500 hover:text-red-600 hover:bg-red-50' : 'text-cyan-400 hover:text-white'
                      }`}
                      title="Open Overlay"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={(e) => handleDelete(m.id, e)}
                      className={`p-1.5 transition-colors cursor-pointer rounded-lg ${isRedWhite ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-500 hover:text-rose-400'}`}
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
                  className={`rounded-xl p-4 transition-all flex flex-col justify-between shadow-sm group border-2 ${
                    isRedWhite
                      ? 'bg-white border-red-200 hover:border-red-500 hover:shadow-md hover:shadow-red-500/10'
                      : 'bg-[#0b1324]/90 border-slate-800/80 hover:border-cyan-500/40 shadow-black/30'
                  }`}
                >
                  <div>
                    {/* Top Header: Sport tag, Tournament, Live badge, Delete */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-black uppercase tracking-wider shrink-0 ${
                            isRedWhite
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                          }`}
                        >
                          {m.sport.replace('_', ' ')}
                        </span>
                        <span className={`text-xs truncate font-bold ${isRedWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                          {m.tournament}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-black font-mono px-2 py-0.5 rounded ${
                          isRedWhite ? 'bg-red-600 text-white shadow-sm' : 'text-emerald-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isRedWhite ? 'bg-white animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                          LIVE
                        </span>
                        <button
                          onClick={(e) => handleDelete(m.id, e)}
                          className={`p-1 transition-colors cursor-pointer ml-1 rounded ${isRedWhite ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-500 hover:text-rose-400'}`}
                          title="Delete match"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Match Name */}
                    <h3 className={`font-black text-sm font-['Space_Grotesk',sans-serif] mt-2 truncate ${isRedWhite ? 'text-slate-900' : 'text-white'}`}>
                      {m.name}
                    </h3>

                    {/* Compact Match Score Box */}
                    <div className={`mt-2.5 px-3.5 py-2.5 rounded-xl border-2 flex items-center justify-between gap-2 ${
                      isRedWhite ? 'bg-red-50/60 border-red-200' : 'bg-[#060a14]/90 border-slate-800/80'
                    }`}>
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: m.teamA.color || '#06b6d4' }}
                          />
                          <span className={`font-black text-xs truncate max-w-[105px] ${isRedWhite ? 'text-slate-800' : 'text-white'}`}>
                            {m.teamA.shortName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: m.teamB.color || '#ef4444' }}
                          />
                          <span className={`font-black text-xs truncate max-w-[105px] ${isRedWhite ? 'text-slate-800' : 'text-white'}`}>
                            {m.teamB.shortName}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className={`font-black text-xl font-mono tabular-nums ${
                          isRedWhite ? 'text-red-600' : 'text-white'
                        }`}>
                          {scoreText}
                        </div>
                        <div
                          className={`text-[10px] font-mono font-bold ${
                            isRedWhite ? 'text-slate-600' : 'text-cyan-300/80'
                          }`}
                        >
                          {metaText}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Compact Actions Footer */}
                  <div className={`mt-3.5 pt-2.5 border-t flex items-center justify-between gap-1.5 ${
                    isRedWhite ? 'border-red-100' : 'border-slate-800/70'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          if (isCricket) {
                            onNavigate('scoring', m.id);
                          } else {
                            onNavigate('multi-scoring', m.id);
                          }
                        }}
                        className={`px-3 py-1 text-[11px] font-black rounded-lg transition-all cursor-pointer flex items-center gap-1 border ${
                          isRedWhite
                            ? 'bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-sm'
                            : 'bg-cyan-500/15 hover:bg-cyan-500/25 border-cyan-500/30 text-cyan-300'
                        }`}
                      >
                        <Radio className="w-3 h-3" />
                        <span>Scorer</span>
                      </button>

                      <button
                        onClick={() => onNavigate('overlay-control', m.id)}
                        className={`px-3 py-1 text-[11px] font-black border rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                          isRedWhite
                            ? 'bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 border-red-200'
                            : 'bg-[#090f1f] hover:bg-[#0d162b] border-slate-800 hover:border-cyan-500/30 text-slate-300'
                        }`}
                      >
                        <Sliders
                          className={`w-3 h-3 ${isRedWhite ? 'text-red-600' : 'text-cyan-400'}`}
                        />
                        <span>Studio</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRuleBookModalSport(m.sport);
                        }}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isRedWhite ? 'text-slate-500 hover:text-red-600 hover:bg-red-50' : 'text-slate-400 hover:text-cyan-300'
                        }`}
                        title="View Official Rules & Referee Signals"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => handleCopyObsUrl(m.activeOverlayToken, e)}
                        className={`px-2.5 py-1 text-[11px] font-mono font-black border rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                          isRedWhite
                            ? 'bg-white hover:bg-red-50 text-red-600 border-red-200 shadow-sm'
                            : 'bg-[#090f1f] hover:bg-cyan-500/20 border-slate-800 hover:border-cyan-400 text-slate-300'
                        }`}
                        title="Copy OBS URL"
                      >
                        {copiedToken === m.activeOverlayToken ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy
                            className={`w-3 h-3 ${isRedWhite ? 'text-red-600' : 'text-cyan-400'}`}
                          />
                        )}
                        <span>OBS</span>
                      </button>

                      <a
                        href={`/overlay/${m.activeOverlayToken}`}
                        target="_blank"
                        rel="noreferrer"
                        className={`p-1.5 rounded-lg transition-colors ${
                          isRedWhite ? 'text-slate-500 hover:text-red-600 hover:bg-red-50' : 'text-cyan-400 hover:text-white'
                        }`}
                        title="Open Overlay Browser Source"
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
