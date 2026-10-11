import React, { useState, useEffect } from 'react';
import { Match } from '../types/sports';
import { fetchMatches, triggerOverlayTest } from '../services/api';
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Keyboard,
  Laptop,
  MonitorPlay,
  Sparkles,
  Tv,
  CheckCircle2,
} from 'lucide-react';

interface ObsSetupGuideProps {
  onBack: () => void;
  onNavigate?: (tab: string, matchId?: string) => void;
}

type OnboardingStep = 1 | 2 | 3 | 4;

export const ObsSetupGuide: React.FC<ObsSetupGuideProps> = ({ onBack, onNavigate }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>('match_t20_ind_aus');
  const [activeStep, setActiveStep] = useState<OnboardingStep>(1);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState<'1080p' | '720p' | '4k'>('1080p');
  const [selectedSwitcher, setSelectedSwitcher] = useState<'obs' | 'vmix' | 'youtube_itv'>('obs');
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]);
  const [testFired, setTestFired] = useState<string | null>(null);

  useEffect(() => {
    fetchMatches()
      .then((list) => {
        setMatches(list);
        if (list.length > 0) {
          setSelectedMatchId(list[0].id);
        }
      })
      .catch(console.error);
  }, []);

  const currentMatch = matches.find((m) => m.id === selectedMatchId) || matches[0];
  const overlayToken = currentMatch?.activeOverlayToken || 'overlay_live_cricket_t20_final';
  const liveOverlayUrl = `${window.location.origin}/overlay/${overlayToken}`;

  const resolutionDimensions = {
    '1080p': { width: 1920, height: 1080, label: 'Full HD 1080p60 (Recommended)' },
    '720p': { width: 1280, height: 720, label: 'HD 720p60 (Lightweight)' },
    '4k': { width: 3840, height: 2160, label: 'Ultra HD 4K60 (Broadcast Studio)' },
  }[selectedResolution];

  const markStepDone = (step: OnboardingStep) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps((prev) => [...prev, step]);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(liveOverlayUrl);
    setCopiedUrl(true);
    markStepDone(3);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleTestAlert = async (type: string, label: string) => {
    try {
      await triggerOverlayTest(overlayToken, {
        type,
        title: label,
        subtitle: `Onboarding Live Check • ${currentMatch?.name || 'Studio Match'}`,
        player: currentMatch?.teamA.name || 'Home Team',
      });
      setTestFired(`Sent "${label}" to OBS Overlay!`);
      markStepDone(4);
      setTimeout(() => setTestFired(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 pb-20">
      {/* Top Studio Header */}
      <div className="bg-gradient-to-r from-[#0c1424] via-[#090f1f] to-[#0c1424] border-b border-slate-800/80 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-[#060a14] border border-slate-800 hover:border-cyan-500/40 text-slate-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-cyan-400">
                EASY 4-STEP INTERACTIVE ONBOARDING
              </div>
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight font-['Space_Grotesk',sans-serif]">
                Quick-Start Onboarding &amp; OBS Broadcast Setup
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">
              Setup Progress:{' '}
              <strong className="text-cyan-400">{completedSteps.length} / 4 Steps</strong>
            </span>
            {onNavigate && (
              <button
                onClick={() =>
                  onNavigate(
                    currentMatch?.sport === 'cricket' ? 'scoring' : 'multi-scoring',
                    currentMatch?.id
                  )
                }
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white cursor-pointer shadow-md shadow-cyan-500/20"
              >
                Open Live Scoring Console →
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 space-y-6">
        {/* Visual 4-Step Interactive Onboarding Progress Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              step: 1 as OnboardingStep,
              title: '1. Pick Sport & Match',
              subtitle: 'Select any of the 8 live sports channels',
              icon: Tv,
            },
            {
              step: 2 as OnboardingStep,
              title: '2. Score with Keys/Touch',
              subtitle: 'Use simple hotkeys (A, L, Space) or buttons',
              icon: Keyboard,
            },
            {
              step: 3 as OnboardingStep,
              title: '3. Copy OBS Link',
              subtitle: 'Paste 1920×1080 Browser Source in OBS/vMix',
              icon: Laptop,
            },
            {
              step: 4 as OnboardingStep,
              title: '4. Go Live & Test Alerts',
              subtitle: 'Fire live graphics & sync Hostinger MySQL',
              icon: Sparkles,
            },
          ].map((item) => {
            const Icon = item.icon;
            const isCurrent = activeStep === item.step;
            const isDone = completedSteps.includes(item.step);
            return (
              <button
                key={item.step}
                onClick={() => {
                  setActiveStep(item.step);
                  markStepDone(item.step);
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  isCurrent
                    ? 'bg-gradient-to-br from-[#0c1424] via-[#0d1a33] to-[#090f1f] border-cyan-400 shadow-lg shadow-cyan-500/15'
                    : 'bg-[#090f1f]/90 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isCurrent
                        ? 'bg-cyan-500 text-white'
                        : isDone
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-[#060a14] text-slate-400 border border-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-white">{item.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {item.subtitle}
                    </div>
                  </div>
                </div>
                {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Interactive Main Onboarding Workspace (Responsive 12-Col Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Columns: Step-by-Step Interactive Configurator */}
          <div className="lg:col-span-7 bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-6">
            {/* Step 1: Select Match Channel */}
            <div className="border-b border-slate-800/80 pb-5">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-[11px] font-mono font-bold text-cyan-300">
                  STEP 1 • CHOOSE YOUR MATCH CHANNEL
                </span>
                <span className="text-xs text-slate-400">8 Integrated Sports</span>
              </div>
              <label className="block text-xs text-slate-300 font-semibold mb-2">
                Select which live match you want to connect to OBS Studio:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {matches.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMatchId(m.id);
                      markStepDone(1);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      selectedMatchId === m.id
                        ? 'bg-cyan-500/15 border-cyan-400 text-white'
                        : 'bg-[#060a14] border-slate-800/90 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                        {m.sport.replace('_', ' ')}
                      </div>
                      <div className="text-xs font-bold text-white truncate">{m.name}</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0c1424] text-emerald-400 shrink-0">
                      LIVE
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2 & 3: Select Broadcast Software & Resolution */}
            <div className="border-b border-slate-800/80 pb-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-sky-500/15 border border-sky-500/30 text-[11px] font-mono font-bold text-sky-300">
                  STEP 2 &amp; 3 • COPY YOUR READY-TO-PASTE OBS URL
                </span>
              </div>

              {/* Switcher & Resolution Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1.5">
                    Broadcast Platform / Uplink:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 bg-[#060a14] p-1 rounded-xl border border-slate-800">
                    {(
                      [
                        { id: 'obs', label: 'OBS Studio' },
                        { id: 'vmix', label: 'vMix HD' },
                        { id: 'youtube_itv', label: 'YouTube / ITV' },
                      ] as const
                    ).map((sw) => (
                      <button
                        key={sw.id}
                        onClick={() => setSelectedSwitcher(sw.id)}
                        className={`py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                          selectedSwitcher === sw.id
                            ? 'bg-cyan-500 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {sw.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1.5">
                    Stream Canvas Resolution:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 bg-[#060a14] p-1 rounded-xl border border-slate-800">
                    {(['1080p', '720p', '4k'] as const).map((res) => (
                      <button
                        key={res}
                        onClick={() => setSelectedResolution(res)}
                        className={`py-1.5 rounded-lg text-xs font-bold uppercase cursor-pointer transition-all ${
                          selectedResolution === res
                            ? 'bg-cyan-500 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Copy Box */}
              <div className="bg-[#060a14] p-3.5 rounded-xl border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-cyan-400 font-bold">
                    Live Browser Source URL ({currentMatch?.name}):
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    Width: <strong className="text-white">{resolutionDimensions.width}</strong> ×
                    Height: <strong className="text-white">{resolutionDimensions.height}</strong>
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={liveOverlayUrl}
                    className="bg-[#090f1f] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 flex-1 outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyUrl}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg cursor-pointer"
                    >
                      {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedUrl ? 'Copied!' : 'Copy OBS URL'}</span>
                    </button>
                    <a
                      href={liveOverlayUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-lg bg-[#0c1424] border border-slate-700 hover:border-cyan-400 text-xs font-bold text-cyan-300 flex items-center gap-1"
                    >
                      <span>Preview</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Test Live Graphics & Keyboard Shortcuts Cheat Sheet */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-mono font-bold text-emerald-300">
                  STEP 4 • SEND A TEST BROADCAST GRAPHIC TO VERIFY
                </span>
                {testFired && (
                  <span className="text-xs font-bold text-emerald-400 animate-pulse">
                    ✓ {testFired}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handleTestAlert('six', 'MAXIMUM SIX!')}
                  className="py-2.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 text-xs font-black text-cyan-300 cursor-pointer"
                >
                  🏏 Test SIX!
                </button>
                <button
                  onClick={() => handleTestAlert('goal', 'GOAL SCORED!')}
                  className="py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-black text-emerald-300 cursor-pointer"
                >
                  ⚽ Test GOAL!
                </button>
                <button
                  onClick={() => handleTestAlert('three_pointer', '3-POINTER!')}
                  className="py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-black text-amber-300 cursor-pointer"
                >
                  🏀 Test 3-PT!
                </button>
                <button
                  onClick={() => handleTestAlert('ace', 'SERVICE ACE!')}
                  className="py-2.5 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/25 border border-purple-500/30 text-xs font-black text-purple-300 cursor-pointer"
                >
                  🎾 Test ACE!
                </button>
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Easy Visual Guide & Keyboard Cheat Sheet */}
          <div className="lg:col-span-5 space-y-6">
            {/* Simple 3-Box Visual OBS Checklist */}
            <div className="bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2 font-['Space_Grotesk',sans-serif]">
                <MonitorPlay className="w-5 h-5 text-cyan-400" />
                <span>
                  How to Connect{' '}
                  {selectedSwitcher === 'obs'
                    ? 'OBS Studio'
                    : selectedSwitcher === 'vmix'
                    ? 'vMix'
                    : 'YouTube Live Camera & ITV Push'}{' '}
                  in 30 Seconds
                </span>
              </h2>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#060a14] border border-slate-800/90 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {selectedSwitcher === 'youtube_itv'
                        ? 'Paste YouTube Live Camera URL in Overlay Studio'
                        : `Add a "${selectedSwitcher === 'vmix' ? 'Web Browser' : 'Browser'}" Source`}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {selectedSwitcher === 'youtube_itv'
                        ? 'Open Overlay Studio, paste your YouTube Live camera link or select USB/HDMI webcam, and toggle "Embed Camera Feed".'
                        : `Click the + button under Sources and choose ${
                            selectedSwitcher === 'vmix' ? 'Web Browser' : 'Browser'
                          }.`}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#060a14] border border-slate-800/90 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {selectedSwitcher === 'youtube_itv'
                        ? 'Configure ITV Sport / YouTube RTMP Stream Keys'
                        : `Paste URL & Set ${resolutionDimensions.width} × ${resolutionDimensions.height}`}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {selectedSwitcher === 'youtube_itv'
                        ? 'Enable ITV Sport / ITVX, YouTube Live, or custom RTMP uplinks and click "Push Stream" to go live.'
                        : `Paste the URL from Step 2 and set Width to ${resolutionDimensions.width} and Height to ${resolutionDimensions.height}.`}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#060a14] border border-slate-800/90 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      Transparent Alpha Background Works Automatically
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      No green screen or chroma key needed! The scorebug floats cleanly over your live camera.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Easy Operator Keyboard Hotkey Reference Card */}
            <div className="bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 font-['Space_Grotesk',sans-serif]">
                  <Keyboard className="w-4 h-4 text-cyan-400" />
                  <span>Quick Keyboard Scoring Cheat Sheet</span>
                </h3>
                <span className="text-[10px] font-mono text-cyan-400 uppercase">Zero-Look Keys</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#060a14] border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Home Team Point</span>
                  <kbd className="px-2 py-0.5 rounded bg-[#0c1424] border border-cyan-500/40 font-mono text-cyan-300 font-bold">
                    A
                  </kbd>
                </div>
                <div className="p-2.5 rounded-xl bg-[#060a14] border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Away Team Point</span>
                  <kbd className="px-2 py-0.5 rounded bg-[#0c1424] border border-cyan-500/40 font-mono text-cyan-300 font-bold">
                    L
                  </kbd>
                </div>
                <div className="p-2.5 rounded-xl bg-[#060a14] border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Swap Serve / Side</span>
                  <kbd className="px-2 py-0.5 rounded bg-[#0c1424] border border-slate-700 font-mono text-amber-300 font-bold">
                    S
                  </kbd>
                </div>
                <div className="p-2.5 rounded-xl bg-[#060a14] border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Start/Pause Timer</span>
                  <kbd className="px-2 py-0.5 rounded bg-[#0c1424] border border-slate-700 font-mono text-emerald-300 font-bold">
                    SPACE
                  </kbd>
                </div>
                <div className="p-2.5 rounded-xl bg-[#060a14] border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Undo Point</span>
                  <kbd className="px-2 py-0.5 rounded bg-[#0c1424] border border-slate-700 font-mono text-rose-300 font-bold">
                    U
                  </kbd>
                </div>
                <div className="p-2.5 rounded-xl bg-[#060a14] border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Fire Alert Sting</span>
                  <kbd className="px-2 py-0.5 rounded bg-[#0c1424] border border-slate-700 font-mono text-purple-300 font-bold">
                    F
                  </kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
