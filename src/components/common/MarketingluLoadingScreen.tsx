import React from 'react';
import emblemDarkImg from '../../assets/images/marketinglu-emblem-dark.png';
import wordmarkImg from '../../assets/images/marketinglu-wordmark.png';

export interface MarketingluLoadingScreenProps {
  /** Primary status message displayed beneath the logos */
  message?: string;
  /** Secondary subtitle or diagnostic context */
  subMessage?: string;
  /** Whether this renders full-screen (fixed or min-h-screen) or embedded in a card */
  fullScreen?: boolean;
  /** Visual scale: 'sm' (embedded widget), 'md' (card/modal), 'lg' (full broadcast screen) */
  size?: 'sm' | 'md' | 'lg';
  /** Show animated broadcast progress indicator */
  showProgress?: boolean;
  /** Optional cancel or return action */
  onCancel?: () => void;
  /** Label for cancel action (default: "Return to Dashboard") */
  cancelLabel?: string;
}

export const MarketingluLoadingScreen: React.FC<MarketingluLoadingScreenProps> = ({
  message = 'Initializing MarketinGlu Broadcast Engine...',
  subMessage = 'Syncing sub-second live telemetry, overlay channels & 60 FPS frame pipeline',
  fullScreen = true,
  size = 'lg',
  showProgress = true,
  onCancel,
  cancelLabel = 'Return to Dashboard',
}) => {
  // Dimensions based on size
  const emblemSize =
    size === 'sm' ? 'w-16 h-9' : size === 'md' ? 'w-24 h-14' : 'w-36 h-20 sm:w-44 sm:h-24';
  const wordmarkWidth = size === 'sm' ? 'w-24' : size === 'md' ? 'w-36' : 'w-48 sm:w-56';
  const haloSize = size === 'sm' ? 'w-24 h-24' : size === 'md' ? 'w-36 h-36' : 'w-56 h-56 sm:w-64 sm:h-64';

  const containerClasses = fullScreen
    ? 'min-h-screen w-full bg-[#070b14] flex flex-col items-center justify-center p-6 relative overflow-hidden select-none z-50'
    : 'w-full py-12 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none';

  return (
    <div className={containerClasses}>
      {/* Ambient Radial Cyber Glow Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-cyan-500/15 via-sky-500/10 to-blue-600/15 rounded-full blur-[110px] animate-pulse" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] bg-cyan-400/10 rounded-full blur-[70px]" />
        {/* Futuristic Subtle Grid Backdrop */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #06b6d4 1px, transparent 1px), linear-gradient(to bottom, #06b6d4 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto">
        {/* Animated Emblem Stage */}
        <div className="relative flex items-center justify-center mb-6">
          {/* Outer Rotating Cyber Radar Ring */}
          <div
            className={`absolute ${haloSize} rounded-full border border-cyan-500/20 border-t-cyan-400/80 border-r-sky-500/40 animate-spin`}
            style={{ animationDuration: '4s' }}
          />

          {/* Counter-Rotating Pulsing Dotted Accent Ring */}
          <div
            className={`absolute ${haloSize} rounded-full border border-dashed border-blue-500/25 animate-spin`}
            style={{ animationDuration: '8s', animationDirection: 'reverse' }}
          />

          {/* Glowing Ambient Core Behind Emblem */}
          <div className="absolute w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-r from-cyan-500/30 to-blue-600/30 blur-2xl animate-pulse" />

          {/* Triangular MG Emblem with Neon Drop Shadow & Floating Animation */}
          <div className="relative group transition-transform duration-700 hover:scale-105">
            <img
              src={emblemDarkImg}
              alt="MarketinGlu Emblem"
              className={`${emblemSize} object-contain transition-all duration-500 drop-shadow-[0_0_18px_rgba(6,182,212,0.85)] filter`}
              style={{
                filter:
                  'drop-shadow(0 0 16px rgba(6, 182, 212, 0.75)) drop-shadow(0 0 32px rgba(59, 130, 246, 0.45))',
              }}
            />

            {/* Scanning Laser Sheen Effect Across Emblem */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-lg opacity-40 mix-blend-overlay">
              <div
                className="w-full h-full bg-gradient-to-b from-transparent via-cyan-300 to-transparent animate-pulse"
                style={{ animationDuration: '1.8s' }}
              />
            </div>
          </div>
        </div>

        {/* Official Wordmark Logo */}
        <div className="flex flex-col items-center mb-5">
          <div className="relative inline-block px-3 py-1 rounded-xl bg-[#090f1f]/80 border border-slate-800/80 shadow-lg shadow-black/60 backdrop-blur-sm">
            <img
              src={wordmarkImg}
              alt="MARKETINGLU"
              className={`${wordmarkWidth} h-auto object-contain brightness-110 drop-shadow-[0_2px_10px_rgba(6,182,212,0.4)]`}
            />
          </div>

          <div className="flex items-center gap-2 mt-2 font-mono text-[10px] tracking-wider uppercase text-cyan-400 font-extrabold">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
            <span>Sub-Second Broadcast Engine</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">ISO 9001:2015</span>
          </div>
        </div>

        {/* Status Messages */}
        <div className="space-y-1.5 px-4 mb-6">
          <h2 className="text-base sm:text-lg font-black text-white tracking-tight font-['Space_Grotesk',sans-serif] bg-gradient-to-r from-white via-cyan-100 to-slate-200 bg-clip-text text-transparent">
            {message}
          </h2>
          {subMessage && (
            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
              {subMessage}
            </p>
          )}
        </div>

        {/* High-Tech Shimmering Progress Bar */}
        {showProgress && (
          <div className="w-64 sm:w-80 space-y-2">
            <div className="h-1.5 w-full bg-[#0d1527] border border-cyan-500/20 rounded-full overflow-hidden p-0.5 relative">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 w-3/4 relative animate-[pulse_1.5s_infinite]">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"
                  style={{
                    backgroundImage:
                      'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
                  }}
                />
              </div>
            </div>

            {/* Diagnostic Telemetry Ticker */}
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 font-semibold px-0.5">
              <span className="text-cyan-400/90 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400 inline-block animate-pulse" />
                60 FPS SYNC
              </span>
              <span>OBS READY</span>
              <span className="text-slate-400">CONNECTING...</span>
            </div>
          </div>
        )}

        {/* Optional Cancel Action */}
        {onCancel && (
          <div className="mt-7">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl bg-[#090f1f] hover:bg-[#0e172e] border border-slate-800 hover:border-cyan-500/40 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer shadow-md"
            >
              {cancelLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
