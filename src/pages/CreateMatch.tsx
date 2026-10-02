import React, { useState } from 'react';
import { CricketFormat, Match, SportType } from '../types/sports';
import { createMatch } from '../services/api';
import { ArrowLeft, Check, Trophy, Calendar, MapPin, Users, Shield } from 'lucide-react';

interface CreateMatchProps {
  onMatchCreated: (matchId: string) => void;
  onCancel: () => void;
}

export const CreateMatch: React.FC<CreateMatchProps> = ({ onMatchCreated, onCancel }) => {
  const [sport, setSport] = useState<SportType>('cricket');
  const [tournament, setTournament] = useState("ICC Men's T20 World Cup 2026");
  const [matchName, setMatchName] = useState('India vs Australia - Final');
  const [venue, setVenue] = useState('Melbourne Cricket Ground, Australia');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('19:00');
  const [cricketFormat, setCricketFormat] = useState<CricketFormat>('T20');
  const [customOvers, setCustomOvers] = useState(20);

  // Teams
  const [teamAName, setTeamAName] = useState('India');
  const [teamAShort, setTeamAShort] = useState('IND');
  const [teamAColor, setTeamAColor] = useState('#1E40AF');

  const [teamBName, setTeamBName] = useState('Australia');
  const [teamBShort, setTeamBShort] = useState('AUS');
  const [teamBColor, setTeamBColor] = useState('#EAB308');

  // Initial Squads
  const [teamABatters, setTeamABatters] = useState(
    'Rohit Sharma, Yuvraj Singh, Virat Kohli, Sanju Samson, Suryakumar Yadav, Hardik Pandya, Axar Patel, Kuldeep Yadav, Jasprit Bumrah, Arshdeep Singh, Mohammed Siraj'
  );
  const [teamBBowlers, setTeamBBowlers] = useState(
    'Mitchell Starc, Pat Cummins, Josh Hazlewood, Adam Zampa, Glenn Maxwell, Marcus Stoinis'
  );

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const maxOvers =
        cricketFormat === 'T20'
          ? 20
          : cricketFormat === 'ODI'
          ? 50
          : cricketFormat === 'TEST'
          ? 90
          : Number(customOvers) || 20;

      // Parse squad players
      const squadA = teamABatters
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name, i) => ({
          id: `p_a_${i + 1}`,
          name,
          role: i < 6 ? ('batter' as const) : ('bowler' as const),
          number: i + 1,
        }));

      const squadB = teamBBowlers
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name, i) => ({
          id: `p_b_${i + 1}`,
          name,
          role: ('bowler' as const),
          number: i + 1,
        }));

      const striker = squadA[0] || { id: 'p_a_1', name: 'Striker' };
      const nonStriker = squadA[1] || { id: 'p_a_2', name: 'Non-Striker' };
      const firstBowler = squadB[0] || { id: 'p_b_1', name: 'Bowler' };

      const initialMatch: Partial<Match> = {
        name: matchName,
        sport,
        tournament,
        venue,
        date,
        startTime,
        status: 'live',
        teamA: {
          id: `team_${Date.now()}_a`,
          name: teamAName,
          shortName: teamAShort.toUpperCase(),
          color: teamAColor,
          squad: squadA,
        },
        teamB: {
          id: `team_${Date.now()}_b`,
          name: teamBName,
          shortName: teamBShort.toUpperCase(),
          color: teamBColor,
          squad: squadB,
        },
        cricketState: {
          format: cricketFormat,
          maxOvers,
          currentInningsIndex: 0,
          innings: [
            {
              inningsNumber: 1,
              battingTeamId: `team_${Date.now()}_a`,
              bowlingTeamId: `team_${Date.now()}_b`,
              runs: 0,
              wickets: 0,
              legalBalls: 0,
              oversFormatted: '0.0',
              currentRunRate: 0,
              extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalty: 0, total: 0 },
              batters: [
                {
                  playerId: striker.id,
                  name: striker.name,
                  runs: 0,
                  balls: 0,
                  fours: 0,
                  sixes: 0,
                  strikeRate: 0,
                  isOut: false,
                },
                {
                  playerId: nonStriker.id,
                  name: nonStriker.name,
                  runs: 0,
                  balls: 0,
                  fours: 0,
                  sixes: 0,
                  strikeRate: 0,
                  isOut: false,
                },
              ],
              bowlers: [
                {
                  playerId: firstBowler.id,
                  name: firstBowler.name,
                  overs: '0.0',
                  legalBalls: 0,
                  maidens: 0,
                  runsConceded: 0,
                  wickets: 0,
                  economy: 0,
                },
              ],
              currentStrikerId: striker.id,
              currentNonStrikerId: nonStriker.id,
              currentBowlerId: firstBowler.id,
              currentPartnership: { runs: 0, balls: 0 },
              fallOfWickets: [],
              oversHistory: [],
              isCompleted: false,
            },
          ],
        },
      };

      const created = await createMatch(initialMatch);
      onMatchCreated(created.id);
    } catch (err) {
      console.error(err);
      alert('Failed to create match');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back and Title */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onCancel}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Create New Match</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Configure teams, tournament details, and match format for live scoring.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Sport & Tournament */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-blue-400 uppercase tracking-wider">
              <Trophy className="w-4 h-4" />
              <span>Match Information</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Sport Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Sport
                </label>
                <select
                  value={sport}
                  onChange={(e) => setSport(e.target.value as SportType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="cricket">Cricket</option>
                  <option value="football">Football</option>
                  <option value="badminton">Badminton</option>
                  <option value="table_tennis">Table Tennis</option>
                  <option value="volleyball">Volleyball</option>
                </select>
              </div>

              {/* Tournament Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tournament / Series Name
                </label>
                <input
                  type="text"
                  value={tournament}
                  onChange={(e) => setTournament(e.target.value)}
                  placeholder="e.g. ICC Men's T20 World Cup"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Match Title */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Match Title
                </label>
                <input
                  type="text"
                  value={matchName}
                  onChange={(e) => setMatchName(e.target.value)}
                  placeholder="e.g. India vs Australia - Final"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Venue */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Venue / Stadium
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Melbourne Cricket Ground"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Match Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Cricket Format (Only when cricket is chosen) */}
          {sport === 'cricket' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-blue-400 uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>Cricket Format & Overs</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { id: 'T20', label: 'T20 (20 Overs)', overs: 20 },
                  { id: 'ODI', label: 'ODI (50 Overs)', overs: 50 },
                  { id: 'TEST', label: 'Test Match', overs: 90 },
                  { id: 'CUSTOM', label: 'Custom Overs', overs: customOvers },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => {
                      setCricketFormat(fmt.id as CricketFormat);
                      if (fmt.id !== 'CUSTOM') setCustomOvers(fmt.overs);
                    }}
                    className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                      cricketFormat === fmt.id
                        ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-sm font-semibold">{fmt.label}</div>
                  </button>
                ))}
              </div>

              {cricketFormat === 'CUSTOM' && (
                <div className="mt-3">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Total Overs Per Innings
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={customOvers}
                    onChange={(e) => setCustomOvers(Number(e.target.value))}
                    className="w-48 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              )}
            </div>
          )}

          {/* Section 3: Teams & Squads */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-blue-400 uppercase tracking-wider">
              <Users className="w-4 h-4" />
              <span>Teams & Squad Setup</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Team A (Batting First by default) */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Team A (Batting First)
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={teamAName}
                      onChange={(e) => setTeamAName(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-sm text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Short Code (3-4 letters)</label>
                      <input
                        type="text"
                        maxLength={4}
                        value={teamAShort}
                        onChange={(e) => setTeamAShort(e.target.value.toUpperCase())}
                        required
                        className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-sm font-mono uppercase text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Theme Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={teamAColor}
                          onChange={(e) => setTeamAColor(e.target.value)}
                          className="w-8 h-8 rounded border border-slate-700 cursor-pointer bg-transparent"
                        />
                        <span className="text-xs font-mono text-slate-400">{teamAColor}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Batters / Squad (Comma-separated)
                    </label>
                    <textarea
                      rows={3}
                      value={teamABatters}
                      onChange={(e) => setTeamABatters(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-300 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Team B (Bowling First by default) */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Team B (Bowling First)
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={teamBName}
                      onChange={(e) => setTeamBName(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-sm text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Short Code (3-4 letters)</label>
                      <input
                        type="text"
                        maxLength={4}
                        value={teamBShort}
                        onChange={(e) => setTeamBShort(e.target.value.toUpperCase())}
                        required
                        className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-sm font-mono uppercase text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Theme Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={teamBColor}
                          onChange={(e) => setTeamBColor(e.target.value)}
                          className="w-8 h-8 rounded border border-slate-700 cursor-pointer bg-transparent"
                        />
                        <span className="text-xs font-mono text-slate-400">{teamBColor}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Bowlers / Squad (Comma-separated)
                    </label>
                    <textarea
                      rows={3}
                      value={teamBBowlers}
                      onChange={(e) => setTeamBBowlers(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-300 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-lg shadow-blue-500/20 cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? 'Creating Match...' : 'Initialize & Open Scoring Console'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
