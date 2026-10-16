import React, { useState, useEffect } from 'react';
import emblemWhiteCardImg from '../../assets/images/marketinglu-emblem.png';
import wordmarkImg from '../../assets/images/marketinglu-wordmark.png';

export interface MarketingluLoadingScreenProps {
  /** Primary status message displayed beneath the progress bar */
  message?: string;
  /** Secondary subtitle or diagnostic context */
  subMessage?: string;
  /** Tag label displayed in the status row */
  tag?: string;
  /** Subtitle pill badge text */
  badgeText?: string;
  /** Whether this renders full-screen (fixed or min-h-screen) or embedded in a card */
  fullScreen?: boolean;
  /** Visual scale: 'sm' | 'md' | 'lg' */
  size?: 'sm' | 'md' | 'lg';
  /** Show animated progress bar */
  showProgress?: boolean;
  /** Optional cancel or return action */
  onCancel?: () => void;
  /** Label for cancel action */
  cancelLabel?: string;
}

export const MarketingluLoadingScreen: React.FC<MarketingluLoadingScreenProps> = ({
  message = 'Calibrating Cricket Ball Red & White Broadcast Engine...',
  subMessage = 'Connecting Low-Latency WebSocket • Syncing ScoreBugs',
  tag = '[CRICKET_BALL_RED]',
  badgeText = 'CRICKET BALL RED & PROPER WHITE SUITE',
  fullScreen = true,
  size = 'lg',
  showProgress = true,
  onCancel,
  cancelLabel = 'Return to Dashboard',
}) => {
  const [progress, setProgress] = useState(89);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99) return 91;
        return prev + 1;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const containerClasses = fullScreen
    ? 'min-h-screen w-full bg-[#0b0306] flex flex-col items-center justify-center p-6 relative overflow-hidden select-none z-50 text-white font-[\'Plus_Jakarta_Sans\',sans-serif]'
    : 'w-full py-12 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none bg-[#0b0306] text-white font-[\'Plus_Jakarta_Sans\',sans-serif]';

  return (
    <div className={containerClasses}>
      {/* Ambient Cricket Ball Crimson & Pure White Radial Glow Aura */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="w-[560px] h-[560px] bg-red-600/22 rounded-full blur-[140px] animate-pulse" />
        <div className="w-[320px] h-[320px] bg-rose-600/20 rounded-full blur-[90px]" />
        <div className="w-[140px] h-[140px] bg-white/12 rounded-full blur-[50px]" />

        {/* Cricket Ball Seam Grid Line Matrix */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(#dc2626 1px, transparent 1px), radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            backgroundPosition: '0 0, 16px 16px',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-md mx-auto">
        {/* 1. CRICKET BALL 3D CORE WITH LOGO EMBLEM IN THE CENTER */}
        <div className="relative mb-6 sm:mb-8 group transition-transform duration-500 hover:scale-105 flex items-center justify-center">
          {/* Ambient Crimson Halo */}
          <div className="absolute -inset-4 bg-red-600/35 blur-2xl rounded-full pointer-events-none" />

          {/* Rotating White Seam Stitching Dashed Ring */}
          <div
            className="absolute -inset-3.5 rounded-full border-2 border-dashed border-white/60 animate-[spin_12s_linear_infinite]"
            style={{ strokeDasharray: '5 5' }}
          />

          {/* 3D Cricket Ball Sphere with Leather Texture & Specular Highlight */}
          <div
            className={`relative rounded-full shadow-[0_0_45px_rgba(220,38,38,0.7),inset_-8px_-8px_25px_rgba(0,0,0,0.85),inset_6px_6px_16px_rgba(255,255,255,0.45)] border-3 border-red-700/60 flex items-center justify-center ${
              size === 'sm' ? 'w-36 h-36' : size === 'md' ? 'w-44 h-44' : 'w-48 sm:w-52 h-48 sm:h-52'
            }`}
            style={{
              background: 'radial-gradient(circle at 35% 28%, #ff4d4d 0%, #dc2626 30%, #b91c1c 60%, #7f1d1d 85%, #450a0a 100%)',
            }}
          >
            {/* White Cricket Ball Seam Stitching Line Running Vertically */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1.5 flex flex-col items-center justify-between py-1 opacity-80 pointer-events-none">
              <div className="w-0.5 h-full bg-white shadow-[0_0_3px_#ffffff]" />
            </div>

            {/* Specular White Light Reflection */}
            <div className="absolute top-3 left-6 w-12 h-7 bg-white/35 rounded-full blur-[4px] transform -rotate-35 pointer-events-none" />

            {/* Center Proper White Card holding the MarketinGlu Emblem */}
            <div
              className={`relative z-10 rounded-2xl bg-white p-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.6),0_0_20px_rgba(255,255,255,0.9)] border-2 border-red-600 flex items-center justify-center ${
                size === 'sm' ? 'w-24 h-16' : size === 'md' ? 'w-28 h-18' : 'w-30 sm:w-34 h-20 sm:h-22'
              }`}
            >
              <img
                src={emblemWhiteCardImg}
                alt="MarketinGlu Emblem"
                className="max-h-14 sm:max-h-16 w-auto object-contain drop-shadow-sm select-none pointer-events-none"
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
            } h-auto object-contain brightness-110 filter drop-shadow-[0_4px_16px_rgba(220,38,38,0.7)] select-none`}
          />
        </div>

        {/* 3. PROPER WHITE PILL BADGE WITH CRICKET BALL RED ACCENTS */}
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 rounded-full bg-white text-red-600 font-extrabold text-xs sm:text-sm tracking-wide shadow-[0_0_20px_rgba(255,255,255,0.35),0_0_12px_rgba(220,38,38,0.4)] border-2 border-red-600">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping shrink-0" />
            <span className="font-['Space_Grotesk',sans-serif] font-black uppercase text-red-600">
              {badgeText}
            </span>
          </div>
        </div>

        {/* 4. SLENDER PROGRESS BAR & TELEMETRY ROW IN RED & WHITE */}
        {showProgress && (
          <div className="w-full px-2 sm:px-0 space-y-2.5">
            {/* Progress Track */}
            <div className="w-full h-2.5 sm:h-3 bg-[#18040a] rounded-full overflow-hidden border-2 border-red-600/50 p-0.5 relative shadow-inner">
              {/* Glowing Crimson/White Fill Bar */}
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-700 via-red-500 to-white shadow-[0_0_16px_#dc2626] transition-all duration-500 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                {/* Shimmer Sheen */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full animate-[shimmer_1.8s_infinite]"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.95) 50%, transparent 100%)',
                  }}
                />
              </div>
            </div>

            {/* Sub-Progress Info Row */}
            <div className="flex items-center justify-between text-xs font-mono px-0.5">
              {/* Left Status: Ruby Beacon Dot + Text */}
              <div className="flex items-center gap-2 text-white truncate max-w-[62%] sm:max-w-[68%]">
                <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] shrink-0 animate-pulse" />
                <span className="truncate text-xs sm:text-sm font-bold tracking-tight text-white font-['Space_Grotesk',sans-serif]">
                  {message}
                </span>
              </div>

              {/* Right Status: Tag + Percentage */}
              <div className="flex items-center gap-2.5 shrink-0 pl-2">
                <span className="text-red-400 font-extrabold text-[10px] sm:text-xs tracking-wider">
                  {tag}
                </span>
                <span className="text-white font-black text-xs sm:text-sm font-mono tracking-tight drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]">
                  {progress}%
                </span>
              </div>
            </div>

            {subMessage && (
              <p className="text-[11px] text-rose-200/80 font-medium tracking-wide">
                {subMessage}
              </p>
            )}
          </div>
        )}

        {/* Optional Cancel Action */}
        {onCancel && (
          <div className="mt-7">
            <button
              onClick={onCancel}
              className="px-5 py-2 rounded-xl bg-white hover:bg-slate-100 text-red-600 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              {cancelLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
