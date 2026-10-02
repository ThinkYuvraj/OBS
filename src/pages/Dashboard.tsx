import React, { useState, useEffect } from 'react';
import { Match, SportType } from '../types/sports';
import { fetchMatches, deleteMatch, toggleSimulation, generateNewOverlayToken } from '../services/api';
import { useRealtimeSocket } from '../hooks/useRealtimeSocket';
import {
  Tv,
  Plus,
  Radio,
  Play,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: string, matchId?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [simulatingMap, setSimulatingMap] = useState<Record<string, boolean>>({});

  const loadData = () => {
    fetchMatches()
      .then((data) => {
        setMatches(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching matches:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Real-time listener for match state changes
  useRealtimeSocket({
    onMatchUpdate: (updatedMatch) => {
      setMatches((prev) =>
        prev.map((m) => (m.id === updatedMatch.id ? updatedMatch : m))
      );
    },
  });

  const handleCopyObsUrl = (token: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/overlay/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleToggleSim = async (matchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await toggleSimulation(matchId);
      setSimulatingMap((prev) => ({ ...prev, [matchId]: res.simulating }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (matchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this match and revoke its broadcast overlay tokens?')) {
      await deleteMatch(matchId);
      setMatches((prev) => prev.filter((m) => m.id !== matchId));
    }
  };

  const filteredMatches =
    selectedSport === 'all'
      ? matches
      : matches.filter((m) => m.sport === selectedSport);

  const activeCount = matches.filter((m) => m.status === 'live').length;
  const cricketCount = matches.filter((m) => m.sport === 'cricket').length;
  const footballCount = matches.filter((m) => m.sport === 'football').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Hero / Studio Header */}
      <div className="relative border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Live Sports Broadcast Engine
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white mt-1">
              Production Overlay Studio
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl text-balance">
              Zero-latency real-time score graphics for OBS Studio, vMix, and Streamlabs.
              Engineered for Cricket, Football, Badminton, Table Tennis, and Volleyball.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('obs-guide')}
              className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              OBS Integration Setup
            </button>
            <button
              onClick={() => onNavigate('create')}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Match</span>
            </button>
          </div>
        </div>

        {/* Studio Summary Metrics */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl">
            <div className="text-xs text-slate-400">Live Broadcaster Matches</div>
            <div className="text-2xl font-black font-mono tabular-nums text-white mt-1">
              {activeCount}
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl">
            <div className="text-xs text-slate-400">Cricket Overlay Feeds</div>
            <div className="text-2xl font-black font-mono tabular-nums text-emerald-400 mt-1">
              {cricketCount}
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl">
            <div className="text-xs text-slate-400">Football UCL Graphics</div>
            <div className="text-2xl font-black font-mono tabular-nums text-cyan-400 mt-1">
              {footballCount}
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl">
            <div className="text-xs text-slate-400">Supported Broadcast Sports</div>
            <div className="text-2xl font-black font-mono tabular-nums text-amber-400 mt-1">
              5
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-lg">
            {[
              { id: 'all', label: 'All Feeds' },
              { id: 'cricket', label: 'Cricket' },
              { id: 'football', label: 'Football' },
              { id: 'badminton', label: 'Badminton' },
              { id: 'table_tennis', label: 'Table Tennis' },
              { id: 'volleyball', label: 'Volleyball' },
            ].map((sport) => (
              <button
                key={sport.id}
                onClick={() => setSelectedSport(sport.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  selectedSport === sport.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sport.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400">
            Showing <span className="text-white font-bold">{filteredMatches.length}</span> active match channels
          </div>
        </div>

        {/* Matches Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-500 font-mono text-sm">
            Loading broadcast streams...
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-slate-400 text-sm">No matches found for this sport category.</p>
            <button
              onClick={() => onNavigate('create')}
              className="mt-3 px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg"
            >
              Create First Match
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
            {filteredMatches.map((m) => {
              const isCricket = m.sport === 'cricket';
              const isFootball = m.sport === 'football';
              const isRacquetOrVolley =
                m.sport === 'badminton' || m.sport === 'table_tennis' || m.sport === 'volleyball';

              // Score preview text
              let scoreText = '0 - 0';
              let metaText = '';

              if (isCricket && m.cricketState) {
                const inn = m.cricketState.innings[m.cricketState.currentInningsIndex];
                if (inn) {
                  scoreText = `${inn.runs}/${inn.wickets}`;
                  metaText = `${inn.oversFormatted} ov • CRR: ${inn.currentRunRate.toFixed(2)}`;
                }
              } else if (isFootball && m.footballState) {
                scoreText = `${m.footballState.homeScore} - ${m.footballState.awayScore}`;
                metaText = `${m.footballState.minute}' • ${m.tournament}`;
              } else if (m.sport === 'badminton' && m.badmintonState) {
                scoreText = `${m.badmintonState.homePoints} - ${m.badmintonState.awayPoints}`;
                metaText = `Set ${m.badmintonState.currentSet + 1} • BWF Super 1000`;
              } else if (m.sport === 'table_tennis' && m.tableTennisState) {
                scoreText = `${m.tableTennisState.homePoints} - ${m.tableTennisState.awayPoints}`;
                metaText = `Set ${m.tableTennisState.currentSet + 1} • WTT Final`;
              } else if (m.sport === 'volleyball' && m.volleyballState) {
                scoreText = `${m.volleyballState.homeScore} - ${m.volleyballState.awayScore}`;
                metaText = `Set ${m.volleyballState.currentSet + 1} • FIVB Final`;
              }

              const obsUrl = `${window.location.origin}/overlay/${m.activeOverlayToken}`;

              return (
                <div
                  key={m.id}
                  className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Sport Label, Status, Quick Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-400">
                          {m.sport.replace('_', ' ')}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs text-slate-400 truncate max-w-[200px]">
                          {m.tournament}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          LIVE
                        </span>
                        <button
                          onClick={(e) => handleDelete(m.id, e)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete match"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Match Name & Teams Header */}
                    <h3 className="font-bold text-lg text-white mt-3">{m.name}</h3>

                    {/* Scoreboard Preview Box */}
                    <div className="mt-3 p-3.5 bg-slate-950/80 rounded-lg border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: m.teamA.color || '#3b82f6' }}
                          />
                          <span className="font-bold text-sm text-slate-200">
                            {m.teamA.shortName}
                          </span>
                          <span className="text-slate-500 text-xs font-semibold">vs</span>
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: m.teamB.color || '#ef4444' }}
                          />
                          <span className="font-bold text-sm text-slate-200">
                            {m.teamB.shortName}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-1">{metaText}</div>
                      </div>

                      <div className="text-right">
                        <div className="font-black text-2xl font-mono tabular-nums text-white">
                          {scoreText}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                          Broadcast Score
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* OBS Link & Controls Row */}
                  <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col gap-3">
                    {/* Copy OBS Browser Source Box */}
                    <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800 text-xs">
                      <span className="text-slate-500 font-mono text-[11px] shrink-0">OBS URL:</span>
                      <span className="font-mono text-slate-300 truncate text-[11px] flex-1">
                        {obsUrl}
                      </span>
                      <button
                        onClick={(e) => handleCopyObsUrl(m.activeOverlayToken, e)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors shrink-0 cursor-pointer"
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
                        {/* Go to Scorer Console */}
                        <button
                          onClick={() => {
                            if (isCricket) {
                              onNavigate('scoring', m.id);
                            } else {
                              onNavigate('multi-scoring', m.id);
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors cursor-pointer"
                        >
                          <Radio className="w-3.5 h-3.5" />
                          <span>Scoring Console</span>
                        </button>

                        {/* Overlay Controls */}
                        <button
                          onClick={() => onNavigate('overlay-control', m.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Overlay Studio</span>
                        </button>
                      </div>

                      {/* Direct Overlay Preview Link */}
                      <a
                        href={`/overlay/${m.activeOverlayToken}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        <span>Preview</span>
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
