import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useTheme } from './ThemeContext';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  durationMs?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, title?: string, durationMs?: number) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const { isRedWhite } = useTheme();

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string, durationMs = 3500) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newToast: ToastItem = { id, type, title, message, durationMs };

      setToasts((prev) => [...prev.slice(-3), newToast]);

      setTimeout(() => {
        dismissToast(id);
      }, durationMs);
    },
    [dismissToast]
  );

  const success = useCallback((msg: string, title?: string) => showToast(msg, 'success', title), [showToast]);
  const error = useCallback((msg: string, title?: string) => showToast(msg, 'error', title, 4500), [showToast]);
  const info = useCallback((msg: string, title?: string) => showToast(msg, 'info', title), [showToast]);
  const warning = useCallback((msg: string, title?: string) => showToast(msg, 'warning', title), [showToast]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        success,
        error,
        info,
        warning,
        dismissToast,
      }}
    >
      {children}

      {/* Floating Universal Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isErr = t.type === 'error';
          const isWarn = t.type === 'warning';

          return (
            <div
              key={t.id}
              className={`pointer-events-auto p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-start gap-3 transition-all animate-in slide-in-from-bottom-3 duration-300 ${
                isErr
                  ? 'bg-[#180508]/95 border-red-500/50 text-red-200 shadow-red-950/50'
                  : isSuccess
                  ? isRedWhite
                    ? 'bg-[#14060c]/95 border-rose-500/50 text-rose-200 shadow-rose-950/50'
                    : 'bg-[#051322]/95 border-cyan-500/50 text-cyan-200 shadow-cyan-950/50'
                  : isWarn
                  ? 'bg-[#1a1205]/95 border-amber-500/50 text-amber-200 shadow-amber-950/50'
                  : 'bg-[#090f1f]/95 border-slate-700/60 text-slate-200 shadow-black/60'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isErr && <AlertCircle className="w-5 h-5 text-red-400" />}
                {isSuccess && (
                  <CheckCircle2
                    className={`w-5 h-5 ${isRedWhite ? 'text-rose-400' : 'text-cyan-400'}`}
                  />
                )}
                {isWarn && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {!isErr && !isSuccess && !isWarn && <Info className="w-5 h-5 text-blue-400" />}
              </div>

              <div className="flex-1 min-w-0">
                {t.title && (
                  <div className="text-xs font-bold font-mono tracking-tight text-white mb-0.5">
                    {t.title}
                  </div>
                )}
                <div className="text-xs leading-relaxed text-slate-300 font-sans">{t.message}</div>
              </div>

              <button
                onClick={() => dismissToast(t.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
