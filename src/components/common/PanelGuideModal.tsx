import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  Tv,
  Radio,
  Sliders,
  Keyboard,
  Copy,
  ExternalLink,
  Flame,
  Volume2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Layers,
  Monitor,
  HelpCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { playAudioEffect } from '../../utils/audio';

interface PanelGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (tab: string, matchId?: string) => void;
}

type GuideTab = 'quickstart' | 'scoring' | 'obs' | 'themes' | 'multisport';

export const PanelGuideModal: React.FC<PanelGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { isRedWhite, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<GuideTab>('quickstart');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const sampleObsUrl = `${window.location.origin}/overlay/overlay_live_cricket_t20_final`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sampleObsUrl);
    playAudioEffect('click');
    setCopiedLink(true);
    showToast('Sample OBS Browser Source URL copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleTestAudio = (type: 'boundaryFour' | 'boundarySix' | 'wicket') => {
    playAudioEffect(type);
    showToast(`Played sound effect: ${type}`, 'info');
  };

  const handleActionNavigate = (tab: string, matchId?: string) => {
    onClose();
    if (onNavigate) {
      onNavigate(tab, matchId);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors ${
          isRedWhite
            ? 'bg-gradient-to-b from-[#18080f] via-[#100408] to-[#0a0205] border-rose-500/40 shadow-rose-950/50'
            : 'bg-gradient-to-b from-[#0c1424] via-[#080d19] to-[#040812] border-cyan-500/40 shadow-black/80'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b shrink-0 ${
            isRedWhite ? 'border-rose-900/60 bg-[#14060c]' : 'border-slate-800 bg-[#091122]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                isRedWhite
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
              }`}
            >
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    isRedWhite
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  }`}
                >
                  BROADCAST OPERATOR MANUAL
                </span>
                <span className="text-emerald-400 font-mono text-[11px] hidden sm:inline">
                  • 100% Sub-Second Real-Time
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white font-['Space_Grotesk',sans-serif]">
                How to Use the MarketinGlu Panel
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            title="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Pill Container */}
        <div
          className={`px-4 sm:px-6 pt-3 pb-2 border-b flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 ${
            isRedWhite ? 'border-rose-950/80 bg-[#0e0407]' : 'border-slate-800/80 bg-[#060a14]'
          }`}
        >
          {[
            { id: 'quickstart', label: '60s Quick Start', icon: Sparkles },
            { id: 'scoring', label: 'Scoring & Hotkeys', icon: Keyboard },
            { id: 'obs', label: 'OBS & vMix Setup', icon: Tv },
            { id: 'themes', label: 'Themes & Database', icon: Flame },
            { id: 'multisport', label: '11 Sports Engine', icon: Radio },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playAudioEffect('click');
                  setActiveTab(tab.id as GuideTab);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? isRedWhite
                      ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/30'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-sm text-slate-200">
          {/* TAB 1: 60s Quick Start */}
          {activeTab === 'quickstart' && (
            <div className="space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-1.5">
                <h3 className="text-xl font-bold text-white font-['Space_Grotesk',sans-serif]">
                  Launch Live Broadcast Graphics in 3 Simple Steps
                </h3>
                <p className="text-slate-400 text-xs">
                  From scoring action to live streaming on YouTube, Twitch, or ITV in under 60 seconds.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Step 1 */}
                <div
                  className={`p-4.5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isRedWhite
                      ? 'bg-[#18070e] border-rose-950/80 hover:border-rose-500/40'
                      : 'bg-[#091122] border-slate-800/80 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-full ${
                          isRedWhite ? 'bg-rose-500/20 text-rose-300' : 'bg-cyan-500/20 text-cyan-300'
                        }`}
                      >
                        STEP 01
                      </span>
                      <Radio className="w-4 h-4 text-slate-400" />
                    </div>
                    <h4 className="font-bold text-white text-base">Select or Create Match</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Pick any of the 11 pre-loaded live fixtures on your Dashboard, or click{' '}
                      <strong className="text-white">"New Match"</strong> to set custom team names,
                      crest logos, and player squads.
                    </p>
                  </div>
                  <button
                    onClick={() => handleActionNavigate('create')}
                    className={`mt-4 w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isRedWhite
                        ? 'bg-rose-600/20 hover:bg-rose-600/40 text-rose-200 border border-rose-500/40'
                        : 'bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-200 border border-cyan-500/40'
                    }`}
                  >
                    <span>Create Match Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Step 2 */}
                <div
                  className={`p-4.5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isRedWhite
                      ? 'bg-[#18070e] border-rose-950/80 hover:border-rose-500/40'
                      : 'bg-[#091122] border-slate-800/80 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-full ${
                          isRedWhite ? 'bg-rose-500/20 text-rose-300' : 'bg-cyan-500/20 text-cyan-300'
                        }`}
                      >
                        STEP 02
                      </span>
                      <Keyboard className="w-4 h-4 text-slate-400" />
                    </div>
                    <h4 className="font-bold text-white text-base">Score with 1-Click Keys</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Click <strong className="text-white">"Scorer"</strong> on any match to open the
                      live operator console. Press number keys <code className="text-cyan-300">0-6</code>,{' '}
                      <code className="text-cyan-300">W</code> for Wickets, or Touch buttons. Everything
                      updates with zero lag.
                    </p>
                  </div>
                  <button
                    onClick={() => handleActionNavigate('scoring', 'match_t20_ind_aus')}
                    className={`mt-4 w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isRedWhite
                        ? 'bg-rose-600/20 hover:bg-rose-600/40 text-rose-200 border border-rose-500/40'
                        : 'bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-200 border border-cyan-500/40'
                    }`}
                  >
                    <span>Open Live Scorer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Step 3 */}
                <div
                  className={`p-4.5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isRedWhite
                      ? 'bg-[#18070e] border-rose-950/80 hover:border-rose-500/40'
                      : 'bg-[#091122] border-slate-800/80 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-full ${
                          isRedWhite ? 'bg-rose-500/20 text-rose-300' : 'bg-cyan-500/20 text-cyan-300'
                        }`}
                      >
                        STEP 03
                      </span>
                      <Tv className="w-4 h-4 text-slate-400" />
                    </div>
                    <h4 className="font-bold text-white text-base">Paste URL in OBS / vMix</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Copy the <strong className="text-white">OBS URL</strong> from any card, add a{' '}
                      <strong className="text-white">Browser Source</strong> (1920x1080) in OBS Studio.
                      The transparent broadcast score bug immediately goes live on stream.
                    </p>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`mt-4 w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isRedWhite
                        ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-600/30'
                        : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-cyan-500/30'
                    }`}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedLink ? 'Copied!' : 'Copy Demo OBS URL'}</span>
                  </button>
                </div>
              </div>

              {/* Audio Test & Interactive Sandbox */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isRedWhite ? 'bg-[#120509] border-rose-950' : 'bg-[#060a14] border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs">Offline Audio Feedback Synthesizer</h5>
                    <p className="text-[11px] text-slate-400">
                      Sub-second tactile audio cues confirm your scoring inputs without lagging your stream.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTestAudio('boundaryFour')}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 cursor-pointer"
                  >
                    Test 4s Sound
                  </button>
                  <button
                    onClick={() => handleTestAudio('boundarySix')}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 cursor-pointer"
                  >
                    Test 6s Siren
                  </button>
                  <button
                    onClick={() => handleTestAudio('wicket')}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 cursor-pointer"
                  >
                    Test Out Chime
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Scoring Console & Hotkeys */}
          {activeTab === 'scoring' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white font-['Space_Grotesk',sans-serif]">
                    Broadcast Keyboard Shortcuts Cheat Sheet
                  </h3>
                  <p className="text-xs text-slate-400">
                    Operate entire matches hands-free without touching a mouse.
                  </p>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 self-start">
                  ⚡ Latency: 0.04s
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-[#060a14] border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-300">Dot Ball (0 runs)</span>
                  <kbd className="px-2 py-1 rounded bg-[#0f172a] border border-slate-700 text-cyan-300 font-bold">
                    0 or .
                  </kbd>
                </div>
                <div className="p-3 rounded-xl bg-[#060a14] border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-300">1 to 3 Runs</span>
                  <kbd className="px-2 py-1 rounded bg-[#0f172a] border border-slate-700 text-cyan-300 font-bold">
                    1, 2, 3
                  </kbd>
                </div>
                <div className="p-3 rounded-xl bg-[#060a14] border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-300">Boundary Four</span>
                  <kbd className="px-2 py-1 rounded bg-[#0f172a] border border-slate-700 text-emerald-400 font-bold">
                    4
                  </kbd>
                </div>
                <div className="p-3 rounded-xl bg-[#060a14] border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-300">Maximum Six</span>
                  <kbd className="px-2 py-1 rounded bg-[#0f172a] border border-slate-700 text-amber-400 font-bold">
                    6
                  </kbd>
                </div>
                <div className="p-3 rounded-xl bg-[#060a14] border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-300">Wicket / Fall of Wicket</span>
                  <kbd className="px-2 py-1 rounded bg-[#0f172a] border border-slate-700 text-rose-400 font-bold">
                    W
                  </kbd>
                </div>
                <div className="p-3 rounded-xl bg-[#060a14] border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-300">Wide Ball Extra</span>
                  <kbd className="px-2 py-1 rounded bg-[#0f172a] border border-slate-700 text-sky-400 font-bold">
                    D
                  </kbd>
                </div>
                <div className="p-3 rounded-xl bg-[#060a14] border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-300">No Ball (+1 Run)</span>
                  <kbd className="px-2 py-1 rounded bg-[#0f172a] border border-slate-700 text-purple-400 font-bold">
                    N
                  </kbd>
                </div>
                <div className="p-3 rounded-xl bg-[#060a14] border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-300">Undo Last Ball Action</span>
                  <kbd className="px-2 py-1 rounded bg-[#0f172a] border border-slate-700 text-rose-300 font-bold">
                    U or Ctrl+Z
                  </kbd>
                </div>
                <div className="p-3 rounded-xl bg-[#060a14] border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-300">Swap Batting Strike</span>
                  <kbd className="px-2 py-1 rounded bg-[#0f172a] border border-slate-700 text-cyan-300 font-bold">
                    S
                  </kbd>
                </div>
                <div className="p-3 rounded-xl bg-[#060a14] border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-300">Open Studio Settings</span>
                  <kbd className="px-2 py-1 rounded bg-[#0f172a] border border-slate-700 text-cyan-300 font-bold">
                    Shift + S
                  </kbd>
                </div>
                <div className="p-3 rounded-xl bg-[#060a14] border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-300">Broadcaster Log In</span>
                  <kbd className="px-2 py-1 rounded bg-[#0f172a] border border-slate-700 text-cyan-300 font-bold">
                    Shift + L
                  </kbd>
                </div>
                <div className="p-3 rounded-xl bg-[#060a14] border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-300">Print Match Scoresheet</span>
                  <kbd className="px-2 py-1 rounded bg-[#0f172a] border border-slate-700 text-cyan-300 font-bold">
                    Ctrl + P
                  </kbd>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OBS & vMix Setup */}
          {activeTab === 'obs' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white font-['Space_Grotesk',sans-serif]">
                  Configuring OBS Studio &amp; vMix
                </h3>
                <p className="text-xs text-slate-400">
                  Follow these step-by-step instructions to embed crystal-clear transparent graphics.
                </p>
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                <div className="p-3.5 rounded-xl bg-[#060a14] border border-slate-800 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <h5 className="font-bold text-white">Add a New Browser Source</h5>
                    <p className="text-slate-400 mt-0.5">
                      In OBS Studio under the <strong className="text-white">Sources</strong> dock, click{' '}
                      <strong className="text-white">+</strong> and select{' '}
                      <strong className="text-white">Browser</strong>. Name it "MarketinGlu ScoreBug".
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#060a14] border border-slate-800 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <h5 className="font-bold text-white">Enter Match Overlay URL</h5>
                    <p className="text-slate-400 mt-0.5">
                      Paste your match overlay link into the <strong className="text-white">URL</strong> field.
                      Every match has a unique permanent token.
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={sampleObsUrl}
                        className="bg-[#0b1324] border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] font-mono text-cyan-300 flex-1 select-all"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:text-white rounded-lg font-bold text-xs cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#060a14] border border-slate-800 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <h5 className="font-bold text-white">Resolution &amp; Performance Settings</h5>
                    <p className="text-slate-400 mt-0.5">
                      Set <strong className="text-white">Width: 1920</strong> and{' '}
                      <strong className="text-white">Height: 1080</strong>, and set FPS to{' '}
                      <strong className="text-white">60</strong>. Uncheck "Shutdown source when not
                      visible" to prevent score desync during scene switches.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Themes & Database */}
          {activeTab === 'themes' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white font-['Space_Grotesk',sans-serif]">
                  Broadcast Theming &amp; Hostinger MySQL Storage
                </h3>
                <p className="text-xs text-slate-400">
                  Switch visual studio aesthetics and sync matches to your remote cloud database.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-xl border space-y-3 ${
                    isRedWhite ? 'bg-rose-950/20 border-rose-500/50' : 'bg-[#060a14] border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">Theme 1: Red &amp; White (DEFAULT)</span>
                    <Flame className="w-4 h-4 text-rose-400" />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    High-contrast crimson and crisp white palette tailored for maximum daytime and arena
                    visibility. Recommended for professional outdoor broadcasts.
                  </p>
                  <button
                    onClick={toggleTheme}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer transition-all shadow-md shadow-rose-600/30"
                  >
                    {isRedWhite ? 'Active as Default Theme' : 'Switch to Red & White'}
                  </button>
                </div>

                <div
                  className={`p-4 rounded-xl border space-y-3 ${
                    !isRedWhite ? 'bg-cyan-950/20 border-cyan-500/50' : 'bg-[#060a14] border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">Theme 2: MarketinGlu (SECONDARY)</span>
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Neon cyber cyan, deep space navy, and glassmorphic translucent panels. Ideal for esports,
                    night matches, and sleek digital broadcasts.
                  </p>
                  <button
                    onClick={toggleTheme}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer transition-all shadow-md shadow-cyan-500/30"
                  >
                    {!isRedWhite ? 'Active Theme' : 'Switch to MarketinGlu'}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#060a14] border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Hostinger phpMyAdmin / MySQL Database Integration</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Configure your Hostinger MySQL credentials in the <strong>Settings Modal</strong> or via{' '}
                  <code className="text-cyan-300">.env</code> (<code className="text-cyan-300">HOSTINGER_DB_HOST</code>,{' '}
                  <code className="text-cyan-300">HOSTINGER_DB_USER</code>,{' '}
                  <code className="text-cyan-300">HOSTINGER_DB_NAME</code>). All matches, live ball events,
                  and registered broadcaster accounts sync automatically.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: 11 Sports Engine */}
          {activeTab === 'multisport' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white font-['Space_Grotesk',sans-serif]">
                  11 Sports Supported Out-of-the-Box
                </h3>
                <p className="text-xs text-slate-400">
                  Switch between field sports, arena tournaments, and racquet disciplines instantly.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 text-xs">
                {[
                  { name: 'Cricket', format: 'T20, ODI, Test', icon: '🏏' },
                  { name: 'Football', format: '90m Clock, Extra Time', icon: '⚽' },
                  { name: 'Basketball', format: '4 Quarters, Shot Clock', icon: '🏀' },
                  { name: 'Kabaddi', format: 'Raid Clock, Touch/Bonus', icon: '🤼' },
                  { name: 'Badminton', format: '3 Sets to 21 Points', icon: '🏸' },
                  { name: 'Table Tennis', format: 'Best of 5/7 to 11', icon: '🏓' },
                  { name: 'Lawn Tennis', format: 'Advantage, Deuce, Sets', icon: '🎾' },
                  { name: 'Volleyball', format: 'Rally Scoring to 25', icon: '🏐' },
                  { name: 'Field Hockey', format: '4 Quarters of 15m', icon: '🏑' },
                  { name: 'Baseball', format: '9 Innings, Balls & Strikes', icon: '⚾' },
                  { name: 'Rugby Union', format: 'Tries, Conversions, 80m', icon: '🏉' },
                ].map((s) => (
                  <div
                    key={s.name}
                    className="p-3 rounded-xl bg-[#060a14] border border-slate-800/80 hover:border-cyan-500/40 transition-colors"
                  >
                    <div className="text-xl mb-1">{s.icon}</div>
                    <div className="font-bold text-white">{s.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{s.format}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className={`px-5 py-3.5 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 ${
            isRedWhite ? 'border-rose-950/80 bg-[#120509]' : 'border-slate-800/80 bg-[#060a14]'
          }`}
        >
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>Need more help? Press Shift+S for Settings or open the Help Desk.</span>
          </div>

          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-xl text-xs font-bold text-white cursor-pointer transition-all ${
              isRedWhite
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-cyan-500/30'
            }`}
          >
            Got it, Let's Broadcast!
          </button>
        </div>
      </div>
    </div>
  );
};
