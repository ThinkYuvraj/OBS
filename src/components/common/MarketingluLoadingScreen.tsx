import React, { useState, useEffect } from 'react';
import emblemWhiteCardImg from '../../assets/images/marketinglu-emblem.png';
import wordmarkImg from '../../assets/images/marketinglu-wordmark.png';

export interface MarketingluLoadingScreenProps {
  /** Primary status message displayed beneath the progress bar (default: "Calibrating 144Hz Smooth Engine & ...") */
  message?: string;
  /** Secondary subtitle or diagnostic context */
  subMessage?: string;
  /** Tag label displayed in the status row (default: "[GPU_ACCEL]") */
  tag?: string;
  /** Subtitle pill badge text (default: "SOFTWARE & DIGITAL GROWTH ENGINE") */
  badgeText?: string;
  /** Whether this renders full-screen (fixed or min-h-screen) or embedded in a card */
  fullScreen?: boolean;
  /** Visual scale: 'sm' | 'md' | 'lg' */
  size?: 'sm' | 'md' | 'lg';
  /** Show animated progress bar */
  showProgress?: boolean;
  /** Optional cancel or return action */
  onCancel?: () => void;
  /** Label for cancel action (default: "Return to Dashboard") */
  cancelLabel?: string;
}

export const MarketingluLoadingScreen: React.FC<MarketingluLoadingScreenProps> = ({
  message = 'Calibrating 144Hz Smooth Engine & ...',
  tag = '[GPU_ACCEL]',
  badgeText = 'SOFTWARE & DIGITAL GROWTH ENGINE',
  fullScreen = true,
  size = 'lg',
  showProgress = true,
  onCancel,
  cancelLabel = 'Return to Dashboard',
}) => {
  // Smooth animated percentage that climbs towards 81% and smoothly pulses
  const [progress, setProgress] = useState(81);

  useEffect(() => {
    // Dynamic progress ticker between 78% and 86% for lively telemetry feel
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) return 81;
        return prev + 1;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const containerClasses = fullScreen
    ? 'min-h-screen w-full bg-[#040814] flex flex-col items-center justify-center p-6 relative overflow-hidden select-none z-50'
    : 'w-full py-12 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none bg-[#040814]';

  return (
    <div className={containerClasses}>
      {/* Ambient Deep Cyan Radial Aura in Background */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[480px] h-[480px] bg-cyan-500/12 rounded-full blur-[120px]" />
        <div className="w-[280px] h-[280px] bg-blue-600/10 rounded-full blur-[80px]" />
        {/* Subtle Cyber Dots Grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'radial-gradient(#06b6d4 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-md mx-auto">
        {/* 1. TOP LOGO EMBLEM CARD (Rounded Outer Dark Frame with Glowing Rim + White Inner Card) */}
        <div className="relative mb-6 sm:mb-8 group transition-transform duration-500 hover:scale-102">
          {/* Subtle Ambient Radial Glow directly behind card */}
          <div className="absolute inset-0 -m-3 bg-cyan-400/20 blur-xl rounded-3xl pointer-events-none" />

          {/* Outer Dark Container with Rounded Corners & Soft Neon Cyan Rim Glow */}
          <div
            className={`relative rounded-3xl bg-[#091122] border border-cyan-500/35 p-3 sm:p-4 shadow-[0_0_35px_rgba(6,182,212,0.35)] flex items-center justify-center ${
              size === 'sm' ? 'w-44 h-28' : size === 'md' ? 'w-52 h-32' : 'w-56 sm:w-64 h-34 sm:h-38'
            }`}
          >
            {/* Inner White Container holding the Triangular Black MG Emblem */}
            <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center p-3 shadow-inner">
              <img
                src={emblemWhiteCardImg}
                alt="MarketinGlu MG Emblem"
                className="w-auto h-16 sm:h-20 object-contain drop-shadow-sm select-none pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* 2. OFFICIAL WORDMARK: "MARKETIN GLU" */}
        <div className="mb-3.5 flex items-center justify-center">
          <img
            src={wordmarkImg}
            alt="MARKETINGLU"
            className={`${
              size === 'sm' ? 'w-48' : size === 'md' ? 'w-56' : 'w-64 sm:w-72'
            } h-auto object-contain brightness-110 drop-shadow-[0_2px_12px_rgba(6,182,212,0.45)] select-none`}
          />
        </div>

        {/* 3. SUBTITLE PILL: "⚡ SOFTWARE & DIGITAL GROWTH ENGINE" */}
        <div className="mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-1.5 rounded-full border border-cyan-500/40 bg-[#061528]/80 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)] backdrop-blur-sm">
            <span className="text-cyan-400 text-xs sm:text-sm">⚡</span>
            <span className="font-mono text-[11px] sm:text-xs font-bold tracking-wider uppercase text-cyan-300">
              {badgeText}
            </span>
          </div>
        </div>

        {/* 4. HORIZONTAL SLENDER NEON PROGRESS BAR & STATUS ROW */}
        {showProgress && (
          <div className="w-full px-2 sm:px-0 space-y-2.5">
            {/* Progress Track */}
            <div className="w-full h-1.5 sm:h-2 bg-[#0c1626] rounded-full overflow-hidden border border-cyan-950/60 p-0 relative shadow-inner">
              {/* Glowing Cyan Fill Bar at 81% */}
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-teal-300 shadow-[0_0_14px_#06b6d4] transition-all duration-700 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                {/* Micro Animated Shimmer Sheen */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"
                  style={{
                    backgroundImage:
                      'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
                  }}
                />
              </div>
            </div>

            {/* Sub-Progress Info Row */}
            <div className="flex items-center justify-between text-xs font-mono px-0.5">
              {/* Left Status: Cyan Dot + Text */}
              <div className="flex items-center gap-2 text-slate-200 truncate max-w-[62%] sm:max-w-[68%]">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] shrink-0 animate-pulse" />
                <span className="truncate text-[11px] sm:text-xs font-medium tracking-tight">
                  {message}
                </span>
              </div>

              {/* Right Status: [GPU_ACCEL] + Percentage (81%) */}
              <div className="flex items-center gap-2.5 shrink-0 pl-2">
                <span className="text-cyan-400 font-bold text-[10px] sm:text-xs tracking-wider">
                  {tag}
                </span>
                <span className="text-cyan-300 font-black text-xs sm:text-sm font-mono tracking-tight drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]">
                  {progress}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Optional Cancel Action */}
        {onCancel && (
          <div className="mt-8">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg bg-[#091122] hover:bg-[#0e1b33] border border-slate-800 hover:border-cyan-500/40 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer shadow-md"
            >
              {cancelLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
