import React, { useState, useEffect } from 'react';
import emblemWhiteCardImg from '../../assets/images/marketinglu-emblem.png';
import wordmarkImg from '../../assets/images/marketinglu-wordmark.png';
import { X, ArrowRight, ShieldCheck, Zap, Activity } from 'lucide-react';

export interface CricketBallPreloaderProps {
  message?: string;
  subMessage?: string;
  tag?: string;
  badgeText?: string;
  fullScreen?: boolean;
  onClose?: () => void;
  autoCloseMs?: number;
  onComplete?: () => void;
  showDismiss?: boolean;
}

export const CricketBallPreloader: React.FC<CricketBallPreloaderProps> = ({
  message = 'Initializing OBS Broadcast Engine...',
  subMessage = 'Connecting Sub-Second WebSocket • Syncing ScoreBugs • 144Hz Livery',
  tag = 'CRICKET_BALL_RED_ACTIVE',
  badgeText = 'CRICKET BALL RED & WHITE BROADCAST SUITE',
  fullScreen = true,
  onClose,
  autoCloseMs,
  onComplete,
  showDismiss = true,
}) => {
  const [progress, setProgress] = useState(15);
  const [currentStage, setCurrentStage] = useState(0);

  const stages = [
    'Calibrating Kookaburra Red Engine',
    'Loading Sub-Second WebSockets',
    'Rendering High-Contrast ScoreBugs',
    'Syncing Cricket & Multi-Sport Feeds',
    'Broadcast Livery Ready',
  ];

  // Progress counter effect (no external state updaters inside setState)
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const step = Math.floor(Math.random() * 15) + 12;
        const next = Math.min(100, prev + step);
        const stageIdx = Math.min(stages.length - 1, Math.floor((next / 100) * stages.length));
        setCurrentStage(stageIdx);
        return next;
      });
    }, 180);

    return () => clearInterval(timer);
  }, [stages.length]);

  // Safe deferred onComplete callback when progress hits 100% (Prevents setState in render bug!)
  useEffect(() => {
    if (progress >= 100 && onComplete) {
      const finishTimer = setTimeout(() => {
        onComplete();
      }, 250);
      return () => clearTimeout(finishTimer);
    }
  }, [progress, onComplete]);

  // Optional auto-close timer
  useEffect(() => {
    if (autoCloseMs && onClose) {
      const closeTimer = setTimeout(onClose, autoCloseMs);
      return () => clearTimeout(closeTimer);
    }
  }, [autoCloseMs, onClose]);

  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-4 sm:p-6 select-none overflow-hidden font-sans'
    : 'relative w-full py-12 bg-white rounded-3xl flex flex-col items-center justify-center p-6 border-2 border-red-500/30 select-none overflow-hidden font-sans shadow-xl';

  return (
    <div className={containerClasses}>
      {/* 1. Primary White Background with Ambient Subtle Cricket Ball Red Radial Accents */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        {/* Soft, clean cricket ball red glow */}
        <div className="w-[500px] h-[500px] bg-red-500/8 rounded-full blur-[100px]" />
        <div className="w-[300px] h-[300px] bg-red-600/6 rounded-full blur-[60px]" />

        {/* Clean, faint seam stitch grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(#dc2626 1.5px, transparent 1.5px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Dismiss / Close Button (If triggered from Dashboard preview) */}
      {showDismiss && onClose && (
        <button
          onClick={onClose}
          className="absolute top-5 right-5 sm:top-7 sm:right-7 p-2.5 rounded-full bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 transition-all cursor-pointer z-50 shadow-sm"
          title="Close Preloader Preview"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Main Elevated White Stage Card with Red Accents */}
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-md mx-auto bg-white/90 border border-red-100 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(220,38,38,0.08),0_1px_3px_rgba(0,0,0,0.05)] backdrop-blur-sm">
        
        {/* 2. SIMPLE, ELEGANT RED CRICKET BALL HERO */}
        <div className="relative mb-5 flex items-center justify-center">
          {/* Outer Pulsing Soft Red Ring */}
          <div className="absolute -inset-4 rounded-full bg-red-500/15 blur-xl animate-pulse pointer-events-none" />

          {/* Rotating Seam Stitching Ring */}
          <div
            className="absolute -inset-3 rounded-full border-2 border-dashed border-red-400 animate-[spin_10s_linear_infinite] opacity-70"
            style={{ strokeDasharray: '5 5' }}
          />

          {/* Authentic 3D Red Cricket Ball */}
          <div
            className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full shadow-[0_12px_32px_rgba(220,38,38,0.45),inset_-6px_-6px_16px_rgba(127,29,29,0.8),inset_5px_5px_12px_rgba(255,255,255,0.45)] flex items-center justify-center border-2 border-red-700/80 transition-transform duration-300 hover:scale-105"
            style={{
              background: 'radial-gradient(circle at 35% 30%, #ff5252 0%, #dc2626 35%, #b91c1c 65%, #7f1d1d 95%)',
            }}
          >
            {/* White Cricket Ball Seam Stitching Line Running Vertically */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1.5 flex flex-col items-center justify-between py-1 opacity-90 pointer-events-none">
              <div className="w-0.5 h-full bg-white shadow-[0_0_3px_#ffffff]" />
              <div className="absolute inset-0 flex flex-col justify-around">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-0.5 bg-white transform -rotate-12 rounded-full shadow-[0_0_2px_#ffffff]"
                  />
                ))}
              </div>
            </div>

            {/* Specular White Shine Reflection */}
            <div className="absolute top-2.5 left-4 w-9 h-5 bg-white/40 rounded-full blur-[3px] transform -rotate-35 pointer-events-none" />

            {/* Centered Crisp White Card with MarketinGlu Logo */}
            <div className="relative z-10 w-16 h-12 rounded-xl bg-white p-1.5 shadow-md border border-red-600/20 flex items-center justify-center">
              <img
                src={emblemWhiteCardImg}
                alt="MarketinGlu Emblem"
                className="max-h-9 w-auto object-contain select-none pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* 3. OFFICIAL WORDMARK IN CRICKET BALL RED ACCENTS */}
        <div className="mb-2 flex items-center justify-center">
          <img
            src={wordmarkImg}
            alt="MARKETINGLU"
            className="w-48 sm:w-56 h-auto object-contain select-none filter contrast-125"
          />
        </div>

        {/* 4. RED & WHITE BADGE */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-50 text-red-700 font-extrabold text-[11px] sm:text-xs tracking-wider border border-red-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping shrink-0" />
            <span className="font-mono uppercase font-black">
              {badgeText}
            </span>
          </div>
        </div>

        {/* 5. SIMPLE RED & WHITE PROGRESS TRACKER */}
        <div className="w-full space-y-2.5">
          {/* Outer Track (Clean White Background with Red Border) */}
          <div className="w-full h-2.5 bg-red-50 rounded-full overflow-hidden border border-red-200 p-0.5 relative shadow-inner">
            {/* Red Fill */}
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-500 shadow-[0_0_8px_rgba(220,38,38,0.5)] transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Stage & Percentage */}
          <div className="flex items-center justify-between text-xs font-mono px-0.5">
            <div className="flex items-center gap-1.5 text-slate-800 font-semibold truncate max-w-[75%]">
              <span className="w-2 h-2 rounded-full bg-red-600 shrink-0 animate-pulse" />
              <span className="truncate text-xs font-bold text-slate-900">
                {stages[currentStage]}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 pl-1">
              <span className="text-red-600 font-black text-sm font-mono tabular-nums">
                {progress}%
              </span>
            </div>
          </div>

          {/* Subtext info */}
          <p className="text-[11px] text-slate-500 font-medium">
            {subMessage}
          </p>
        </div>

        {/* 6. TELEMETRY BADGES (White Cards with Red Elements) */}
        <div className="grid grid-cols-3 gap-2 w-full mt-5 pt-4 border-t border-red-100">
          <div className="bg-red-50/60 border border-red-200/80 rounded-xl p-2 text-center">
            <div className="text-[9px] uppercase font-mono text-red-600 font-bold">Engine</div>
            <div className="text-xs font-extrabold text-slate-900 font-mono mt-0.5">144 FPS</div>
          </div>

          <div className="bg-red-50/60 border border-red-200/80 rounded-xl p-2 text-center">
            <div className="text-[9px] uppercase font-mono text-red-600 font-bold">Latency</div>
            <div className="text-xs font-extrabold text-slate-900 font-mono mt-0.5">&lt; 20ms</div>
          </div>

          <div className="bg-red-50/60 border border-red-200/80 rounded-xl p-2 text-center">
            <div className="text-[9px] uppercase font-mono text-red-600 font-bold">Theme</div>
            <div className="text-xs font-extrabold text-red-600 font-mono mt-0.5">Red &amp; White</div>
          </div>
        </div>

        {/* Quick Skip / Enter Button */}
        {(onClose || onComplete) && (
          <div className="mt-5 w-full">
            <button
              onClick={() => {
                if (onClose) onClose();
                else if (onComplete) onComplete();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm tracking-wide transition-all cursor-pointer shadow-md shadow-red-600/25 flex items-center justify-center gap-2"
            >
              <span>ENTER LIVE STUDIO</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
