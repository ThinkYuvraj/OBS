import React, { useEffect, useState } from 'react';
import { OverlayAlert } from '../../types/sports';

interface BroadcastAlertOverlayProps {
  alert: OverlayAlert | null;
  onDismiss?: () => void;
}

export const BroadcastAlertOverlay: React.FC<BroadcastAlertOverlayProps> = ({ alert, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (alert) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, alert.durationMs || 4000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [alert, onDismiss]);

  if (!alert || !visible) return null;

  const isWicket = alert.type === 'wicket';
  const isFour = alert.type === 'four';
  const isSix = alert.type === 'six';
  const isGoal = alert.type === 'goal';

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50 animate-in fade-in zoom-in-95 duration-200">
      <div className="relative">
        {/* Wicket Banner */}
        {isWicket && (
          <div className="flex flex-col items-center">
            {/* Glowing Wicket Header */}
            <div className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-700 text-white font-black tracking-widest text-5xl px-12 py-3 uppercase shadow-[0_0_50px_rgba(225,29,72,0.8)] border-y-4 border-amber-400 rotate-[-1deg] animate-pulse">
              WICKET!
            </div>
            {/* Player details */}
            <div className="mt-2 bg-slate-950/95 border border-rose-500/80 text-white px-8 py-2.5 rounded shadow-2xl backdrop-blur-md text-center max-w-lg">
              <div className="text-xl font-bold text-amber-300 tracking-wide">
                {alert.player || 'Batter Dismissed'}
              </div>
              <div className="text-sm text-slate-300 font-mono mt-0.5">
                {alert.subtitle}
              </div>
            </div>
          </div>
        )}

        {/* Boundary Four Banner */}
        {isFour && (
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-r from-blue-700 via-cyan-500 to-blue-700 text-white font-black tracking-widest text-6xl px-14 py-3 uppercase shadow-[0_0_60px_rgba(6,182,212,0.9)] border-y-4 border-white rotate-[1deg]">
              FOUR!
            </div>
            <div className="mt-2 bg-slate-950/90 border border-cyan-400/80 text-white px-8 py-2 rounded shadow-2xl text-center">
              <div className="text-lg font-bold text-cyan-300">{alert.player}</div>
              <div className="text-xs text-slate-300 font-mono">BOUNDARY DOWN TO THE ROPES</div>
            </div>
          </div>
        )}

        {/* Maximum Six Banner */}
        {isSix && (
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 text-slate-950 font-black tracking-widest text-7xl px-16 py-4 uppercase shadow-[0_0_70px_rgba(245,158,11,0.95)] border-y-4 border-slate-950 rotate-[-1deg] animate-bounce">
              SIX!
            </div>
            <div className="mt-2 bg-slate-950/95 border-2 border-amber-400 text-white px-8 py-2 rounded shadow-2xl text-center">
              <div className="text-xl font-black text-amber-300">{alert.player}</div>
              <div className="text-xs text-slate-300 font-mono tracking-wider">MAXIMUM INTO THE STANDS!</div>
            </div>
          </div>
        )}

        {/* Goal Banner */}
        {isGoal && (
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-r from-emerald-600 via-teal-400 to-emerald-600 text-slate-950 font-black tracking-widest text-7xl px-16 py-4 uppercase shadow-[0_0_70px_rgba(16,185,129,0.95)] border-y-4 border-white">
              GOAL!
            </div>
            <div className="mt-2 bg-[#001489] text-white px-8 py-2.5 rounded shadow-2xl text-center border border-white/40">
              <div className="text-xl font-extrabold">{alert.player}</div>
              <div className="text-xs text-slate-200 font-mono tracking-wider uppercase">
                {alert.subtitle}
              </div>
            </div>
          </div>
        )}

        {/* Milestone or Custom Alert */}
        {!isWicket && !isFour && !isSix && !isGoal && (
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-r from-purple-700 via-indigo-500 to-purple-700 text-white font-black tracking-widest text-5xl px-12 py-3 uppercase shadow-[0_0_50px_rgba(168,85,247,0.8)] border-y-4 border-amber-300">
              {alert.title}
            </div>
            <div className="mt-2 bg-slate-950/90 text-white px-8 py-2 rounded shadow text-center">
              <div className="text-lg font-bold text-amber-300">{alert.player}</div>
              <div className="text-xs text-slate-300 font-mono">{alert.subtitle}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
