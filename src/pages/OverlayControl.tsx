import React, { useState, useEffect } from 'react';
import { Match, OverlayConfig } from '../types/sports';
import { fetchMatch, fetchMatches, updateOverlayConfig, triggerOverlayTest } from '../services/api';
import { ArrowLeft, Copy, Check, Sliders, ExternalLink, Zap } from 'lucide-react';
import { CricketBottomBar } from '../components/overlay/CricketBottomBar';
import { FootballScoreBug } from '../components/overlay/FootballScoreBug';
import { BasketballScoreBug } from '../components/overlay/BasketballScoreBug';
import { RacquetVolleyScoreBug } from '../components/overlay/RacquetVolleyScoreBug';
import { OutdoorSportsScoreBug } from '../components/overlay/OutdoorSportsScoreBug';
import { BroadcastAlertOverlay } from '../components/overlay/BroadcastAlertOverlay';
import { useRealtimeSocket } from '../hooks/useRealtimeSocket';

interface OverlayControlProps {
  matchId: string;
  onBack: () => void;
}

export const OverlayControl: React.FC<OverlayControlProps> = ({ matchId, onBack }) => {
  const [activeId, setActiveId] = useState<string>(matchId);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [match, setMatch] = useState<Match | null>(null);
  const [config, setConfig] = useState<OverlayConfig | null>(null);
  const [copied, setCopied] = useState(false);
  const [previewBg, setPreviewBg] = useState<'stadium' | 'dark' | 'transparent'>('stadium');

  const loadData = async (idToLoad: string) => {
    try {
      const [data, list] = await Promise.all([fetchMatch(idToLoad), fetchMatches()]);
      setMatch(data);
      setConfig(data.overlayConfig);
      setAllMatches(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setActiveId(matchId);
    loadData(matchId);
  }, [matchId]);

  useRealtimeSocket({
    matchId: activeId,
    onMatchUpdate: (updatedMatch) => {
      if (updatedMatch.id === activeId) {
        setMatch(updatedMatch);
        setConfig(updatedMatch.overlayConfig);
      }
    },
  });

  if (!match || !config) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-sm">
        Loading overlay controls...
      </div>
    );
  }

  const handleUpdate = async (patch: Partial<OverlayConfig>) => {
    const updated = { ...config, ...patch };
    setConfig(updated);
    try {
      await updateOverlayConfig(match.activeOverlayToken, patch);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestAlert = async (type: string, title: string, subtitle: string) => {
    try {
      await triggerOverlayTest(match.activeOverlayToken, {
        type,
        title,
        subtitle,
        player: match.teamA.name,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const obsUrl = `${window.location.origin}/overlay/${match.activeOverlayToken}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(obsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Overlay Studio & OBS Preview</h1>
            <p className="text-xs text-slate-400">
              {match.sport.replace('_', ' ').toUpperCase()} • {match.name}
            </p>
          </div>
        </div>

        {/* Channel Switcher + Copy OBS URL */}
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

          <button
            onClick={copyUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg cursor-pointer whitespace-nowrap"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied OBS URL' : 'Copy OBS Browser Source URL'}</span>
          </button>
          <a
            href={obsUrl}
            target="_blank"
            rel="noreferrer"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
            title="Open Fullscreen Overlay View"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-6 space-y-6">
        {/* Live Broadcast Viewport Simulator */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-mono text-slate-400 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              OBS Virtual Canvas (1920 × 1080 Aspect Ratio)
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Preview Backdrop:</span>
              <button
                onClick={() => setPreviewBg('stadium')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                  previewBg === 'stadium' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
              >
                Stadium Feed
              </button>
              <button
                onClick={() => setPreviewBg('dark')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                  previewBg === 'dark' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
              >
                Dark Canvas
              </button>
              <button
                onClick={() => setPreviewBg('transparent')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                  previewBg === 'transparent' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
              >
                Checkerboard
              </button>
            </div>
          </div>

          {/* 16:9 Canvas Container */}
          <div
            className={`w-full aspect-video relative flex flex-col justify-end p-8 overflow-hidden select-none transition-all ${
              previewBg === 'stadium'
                ? 'bg-cover bg-center'
                : previewBg === 'transparent'
                ? 'bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] bg-slate-950'
                : 'bg-slate-950'
            }`}
            style={
              previewBg === 'stadium'
                ? {
                    backgroundImage: `url(${
                      match.sport === 'football' || match.sport === 'field_hockey' || match.sport === 'rugby'
                        ? '/src/assets/images/football_stadium_lights_1790948631939.jpg'
                        : '/src/assets/images/cricket_stadium_lights_1790948618345.jpg'
                    })`,
                  }
                : undefined
            }
          >
            {previewBg === 'stadium' && (
              <div className="absolute inset-0 bg-black/35 pointer-events-none" />
            )}

            <BroadcastAlertOverlay
              alert={config.activeAlert || null}
              onDismiss={() => setConfig({ ...config, activeAlert: null })}
            />

            {/* Render Overlay */}
            <div className="relative z-10 w-full flex flex-col items-center">
              {match.sport === 'cricket' && match.cricketState && (
                <CricketBottomBar
                  teamA={match.teamA}
                  teamB={match.teamB}
                  state={match.cricketState}
                  config={config}
                  tournamentName={match.tournament}
                />
              )}

              {match.sport === 'basketball' && match.basketballState && (
                <BasketballScoreBug
                  teamA={match.teamA}
                  teamB={match.teamB}
                  state={match.basketballState}
                  config={config}
                  tournamentName={match.tournament}
                />
              )}

              {match.sport === 'football' && match.footballState && (
                <div className="self-start">
                  <FootballScoreBug
                    teamA={match.teamA}
                    teamB={match.teamB}
                    state={match.footballState}
                    config={config}
                    tournamentName={match.tournament}
                  />
                </div>
              )}

              {(match.sport === 'tennis' ||
                match.sport === 'badminton' ||
                match.sport === 'table_tennis' ||
                match.sport === 'volleyball') && (
                <div className="self-start">
                  <RacquetVolleyScoreBug match={match} config={config} />
                </div>
              )}

              {(match.sport === 'field_hockey' ||
                match.sport === 'baseball' ||
                match.sport === 'rugby') && (
                <div className="self-start">
                  <OutdoorSportsScoreBug match={match} config={config} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls & Test Triggers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Graphics Customization */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Broadcast Graphics Tuning</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Scale: {Math.round((config.scale || 1) * 100)}%
                </label>
                <input
                  type="range"
                  min="0.7"
                  max="1.3"
                  step="0.05"
                  value={config.scale || 1}
                  onChange={(e) => handleUpdate({ scale: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Opacity: {Math.round((config.opacity || 1) * 100)}%
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="1.0"
                  step="0.05"
                  value={config.opacity || 1}
                  onChange={(e) => handleUpdate({ opacity: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={config.showBatters}
                    onChange={(e) => handleUpdate({ showBatters: e.target.checked })}
                  />
                  <span>Show Player Stats</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={config.showBowler}
                    onChange={(e) => handleUpdate({ showBowler: e.target.checked })}
                  />
                  <span>Show Sub-Metrics</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={config.showSponsor}
                    onChange={(e) => handleUpdate({ showSponsor: e.target.checked })}
                  />
                  <span>Show Sponsor</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={config.animationsEnabled}
                    onChange={(e) => handleUpdate({ animationsEnabled: e.target.checked })}
                  />
                  <span>Animations</span>
                </label>
              </div>
            </div>
          </div>

          {/* Test Alert Triggers */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Broadcast Alert Simulator</span>
            </h3>

            <p className="text-xs text-slate-400 mb-4">
              Test instant high-contrast broadcast graphic triggers to verify display inside OBS in real-time.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => handleTestAlert('four', 'FOUR RUNS!', 'Boundary down to third man')}
                className="p-2.5 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300 font-bold text-xs hover:bg-blue-600/30 cursor-pointer"
              >
                Trigger &quot;FOUR!&quot;
              </button>
              <button
                onClick={() => handleTestAlert('six', 'MAXIMUM! SIX!', 'Ball dispatched into top tier')}
                className="p-2.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs hover:bg-amber-500/30 cursor-pointer"
              >
                Trigger &quot;SIX!&quot;
              </button>
              <button
                onClick={() => handleTestAlert('wicket', 'WICKET!', 'Bowled him! Off-stump knocked')}
                className="p-2.5 rounded-lg bg-rose-600/20 border border-rose-500/40 text-rose-300 font-bold text-xs hover:bg-rose-600/30 cursor-pointer"
              >
                Trigger &quot;WICKET!&quot;
              </button>
              <button
                onClick={() => handleTestAlert('goal', 'GOAL!', 'Spectacular strike into top corner')}
                className="p-2.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs hover:bg-emerald-600/30 cursor-pointer"
              >
                Trigger &quot;GOAL!&quot;
              </button>
              <button
                onClick={() => handleTestAlert('three_pointer', '3-POINTER!', 'Downtown splash from deep!')}
                className="p-2.5 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-300 font-bold text-xs hover:bg-orange-500/30 cursor-pointer"
              >
                Trigger &quot;3-PT!&quot;
              </button>
              <button
                onClick={() => handleTestAlert('ace', 'SERVICE ACE!', '135 MPH unreturnable serve')}
                className="p-2.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-xs hover:bg-cyan-500/30 cursor-pointer"
              >
                Trigger &quot;ACE!&quot;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
