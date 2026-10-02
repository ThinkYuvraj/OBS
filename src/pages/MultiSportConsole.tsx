import React, { useState, useEffect } from 'react';
import { Match } from '../types/sports';
import { fetchMatch, postFootballEvent } from '../services/api';
import { ArrowLeft, Plus, Minus, Flag, Award, Clock } from 'lucide-react';

interface MultiSportConsoleProps {
  matchId: string;
  onBack: () => void;
}

export const MultiSportConsole: React.FC<MultiSportConsoleProps> = ({ matchId, onBack }) => {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await fetchMatch(matchId);
      setMatch(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [matchId]);

  if (loading || !match) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-sm">
        Loading sports console...
      </div>
    );
  }

  // Football handlers
  const handleFootballGoal = async (teamId: 'home' | 'away') => {
    const scorer = prompt(`Enter goal scorer for ${teamId === 'home' ? match.teamA.name : match.teamB.name}:`) || 'Player';
    await postFootballEvent(match.id, {
      type: 'goal',
      minute: match.footballState?.minute || 90,
      teamId,
      player: scorer,
    });
    loadData();
  };

  const handlePoint = async (sport: string, winner: 'home' | 'away') => {
    const endpoint =
      sport === 'badminton'
        ? `/api/matches/${match.id}/badminton/point`
        : sport === 'table_tennis'
        ? `/api/matches/${match.id}/table-tennis/point`
        : `/api/matches/${match.id}/volleyball/point`;

    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winner }),
    });
    loadData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              {match.sport.toUpperCase()} SCORER CONSOLE
            </div>
            <h1 className="text-lg font-bold text-white">{match.name}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 space-y-6">
        {/* Match Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            {/* Team A */}
            <div className="flex-1 text-center">
              <div className="text-xl font-bold text-white">{match.teamA.name}</div>
              <div className="text-xs text-slate-400 font-mono mt-1">{match.teamA.shortName}</div>
            </div>

            {/* Score */}
            <div className="px-8 text-center">
              <div className="text-4xl font-black font-mono text-white">
                {match.sport === 'football' && match.footballState
                  ? `${match.footballState.homeScore} - ${match.footballState.awayScore}`
                  : match.sport === 'badminton' && match.badmintonState
                  ? `${match.badmintonState.homePoints} - ${match.badmintonState.awayPoints}`
                  : match.sport === 'table_tennis' && match.tableTennisState
                  ? `${match.tableTennisState.homePoints} - ${match.tableTennisState.awayPoints}`
                  : match.sport === 'volleyball' && match.volleyballState
                  ? `${match.volleyballState.homeScore} - ${match.volleyballState.awayScore}`
                  : '0 - 0'}
              </div>
              <div className="text-xs text-amber-400 font-mono font-bold mt-1">LIVE FEED</div>
            </div>

            {/* Team B */}
            <div className="flex-1 text-center">
              <div className="text-xl font-bold text-white">{match.teamB.name}</div>
              <div className="text-xs text-slate-400 font-mono mt-1">{match.teamB.shortName}</div>
            </div>
          </div>
        </div>

        {/* Action Controls for Football */}
        {match.sport === 'football' && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleFootballGoal('home')}
              className="py-6 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white text-lg shadow-lg cursor-pointer"
            >
              + Goal {match.teamA.name}
            </button>
            <button
              onClick={() => handleFootballGoal('away')}
              className="py-6 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-white text-lg shadow-lg cursor-pointer"
            >
              + Goal {match.teamB.name}
            </button>
          </div>
        )}

        {/* Action Controls for Badminton / Table Tennis / Volleyball */}
        {(match.sport === 'badminton' || match.sport === 'table_tennis' || match.sport === 'volleyball') && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handlePoint(match.sport, 'home')}
              className="py-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-black text-white text-xl shadow-lg cursor-pointer flex flex-col items-center justify-center gap-1"
            >
              <span>+1 Point</span>
              <span className="text-xs font-normal opacity-80">{match.teamA.name}</span>
            </button>
            <button
              onClick={() => handlePoint(match.sport, 'away')}
              className="py-8 rounded-xl bg-blue-600 hover:bg-blue-500 font-black text-white text-xl shadow-lg cursor-pointer flex flex-col items-center justify-center gap-1"
            >
              <span>+1 Point</span>
              <span className="text-xs font-normal opacity-80">{match.teamB.name}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
