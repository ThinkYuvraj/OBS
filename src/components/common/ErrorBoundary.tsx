import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Broadcast Studio Uncaught Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/dashboard';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
          <div className="max-w-lg w-full bg-gradient-to-b from-[#0c1424] to-[#070b14] border border-rose-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-rose-950/50 text-center relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-rose-500/10 blur-3xl pointer-events-none" />

            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Broadcast Safety Gate Active</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Space_Grotesk',sans-serif] mb-2">
              Studio Component Recovered
            </h1>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
              An unexpected render anomaly was intercepted by the broadcast safety engine. The live video
              stream and overlay links remain functional.
            </p>

            {this.state.error && (
              <div className="bg-[#040814] border border-slate-800 rounded-xl p-3 text-left mb-6 max-h-32 overflow-y-auto font-mono text-[11px] text-rose-300/90 select-all">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs transition-all shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>

              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#091122] hover:bg-[#0e1b38] border border-slate-700 hover:border-slate-500 text-slate-200 font-bold text-xs transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Return to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
