import React, { useState } from 'react';
import {
  X,
  UserPlus,
  LogIn,
  Eye,
  EyeOff,
  ShieldCheck,
  Server,
  Sparkles,
  Flame,
  Check,
  Tv,
  Film,
  Zap,
  Palette,
  Eye as ViewerIcon,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { signupBroadcaster, loginBroadcaster } from '../../services/api';
import { OperatorRole, SportType, UserProfile } from '../../types/sports';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onAuthSuccess: (user: UserProfile) => void;
}

const ALL_SPORTS: { id: SportType; label: string }[] = [
  { id: 'cricket', label: 'Cricket' },
  { id: 'football', label: 'Football' },
  { id: 'basketball', label: 'Basketball' },
  { id: 'kabaddi', label: 'Kabaddi' },
  { id: 'badminton', label: 'Badminton' },
  { id: 'table_tennis', label: 'Table Tennis' },
  { id: 'tennis', label: 'Tennis' },
  { id: 'volleyball', label: 'Volleyball' },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onAuthSuccess,
}) => {
  const { isRedWhite } = useTheme();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Sign In State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<OperatorRole>('scorer');
  const [title, setTitle] = useState('');
  const [preferredSetup, setPreferredSetup] = useState('Arena Scoring Deck');
  const [assignedSports, setAssignedSports] = useState<SportType[]>(['cricket', 'football']);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSport = (sport: SportType) => {
    setAssignedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await loginBroadcaster({
        email: loginEmail,
        password: loginPassword,
      });

      setSuccessNotice(`Signed in successfully as ${res.user.name}`);
      setTimeout(() => {
        onAuthSuccess(res.user);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickOperatorLogin = async (userId: string) => {
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await loginBroadcaster({ userId });
      setSuccessNotice(`Switched to ${res.user.name}`);
      setTimeout(() => {
        onAuthSuccess(res.user);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Operator switch failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (password.length < 4) {
      setErrorMessage('Password must be at least 4 characters long');
      return;
    }

    setLoading(true);

    try {
      const res = await signupBroadcaster({
        name,
        email,
        password,
        role,
        title: title || (role === 'producer' ? 'Executive Broadcast Producer' : 'Match Scorer'),
        preferredSetup,
        assignedSports,
        avatar: role === 'producer' ? '🎬' : role === 'graphics' ? '🎨' : role === 'viewer' ? '👁️' : '⚡',
      });

      setSuccessNotice(res.message);
      setTimeout(() => {
        onAuthSuccess(res.user);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to create broadcaster account');
    } finally {
      setLoading(false);
    }
  };

  const roleDetails: Record<OperatorRole, { label: string; icon: any; desc: string }> = {
    producer: {
      label: 'Executive Producer',
      icon: Film,
      desc: 'Master Studio access: billing, live RTMP uplinks, match admin',
    },
    scorer: {
      label: 'Lead Scorer / Umpire',
      icon: Zap,
      desc: 'Rapid event entry, point scoring, ball-by-ball hotkeys',
    },
    graphics: {
      label: 'Graphics TD',
      icon: Palette,
      desc: 'OBS URL positioning, lower thirds, alerts & themes',
    },
    viewer: {
      label: 'Production Viewer',
      icon: ViewerIcon,
      desc: 'Clean feed viewing, live read-only telemetry',
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md font-['Plus_Jakarta_Sans',sans-serif]">
      <div
        className={`relative w-full max-w-xl bg-gradient-to-br ${
          isRedWhite
            ? 'from-[#17060c] via-[#0f0408] to-[#080204] border-rose-500/40 shadow-[0_0_35px_rgba(225,29,72,0.3)]'
            : 'from-[#0b1424] via-[#070e1c] to-[#040814] border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.3)]'
        } border rounded-3xl overflow-hidden flex flex-col max-h-[92vh] transition-all`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                isRedWhite
                  ? 'bg-gradient-to-br from-rose-500 to-red-700 shadow-rose-600/30'
                  : 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-cyan-600/30'
              }`}
            >
              {mode === 'signup' ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            </div>
            <div>
              <div
                className={`text-[10px] font-mono font-black uppercase tracking-widest ${
                  isRedWhite ? 'text-rose-400' : 'text-cyan-400'
                }`}
              >
                HOSTINGER DATABASE AUTHENTICATION
              </div>
              <h2 className="text-base sm:text-lg font-black text-white font-['Space_Grotesk',sans-serif]">
                {mode === 'signup' ? 'Broadcaster Sign Up Window' : 'Broadcaster Log In'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-800/60 bg-black/20 flex gap-2">
          <button
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              mode === 'login'
                ? isRedWhite
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                : 'bg-slate-900/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In (Login Options)</span>
          </button>

          <button
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              mode === 'signup'
                ? isRedWhite
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                : 'bg-slate-900/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Sign Up Window</span>
          </button>
        </div>

        {/* Hostinger DB Synchronized Ribbon */}
        <div className="px-6 py-2 bg-black/50 border-b border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Server className={`w-3.5 h-3.5 ${isRedWhite ? 'text-rose-400' : 'text-cyan-400'}`} />
            <span>Hostinger DB Layer:</span>
            <span className="text-emerald-400 font-bold">Auto-Sync Enabled</span>
          </div>
          <span className="text-slate-400 text-[10px]">
            Table: <code>broadcast_users</code>
          </span>
        </div>

        {/* Body Form */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/50 text-red-300 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {successNotice && (
            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 text-xs font-medium flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* MODE: SIGN IN */}
          {mode === 'login' ? (
            <div className="space-y-5">
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. yuvraj@marketinglu.com"
                    className="w-full bg-[#070b14] border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter password (default: operator123)"
                      className="w-full bg-[#070b14] border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer ${
                    isRedWhite
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/30'
                  }`}
                >
                  {loading ? 'Authenticating...' : 'Sign In with Hostinger DB'}
                </button>
              </form>

              {/* Fast Option: Quick Demo Operator Login */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="text-[11px] font-mono text-slate-400 uppercase font-bold mb-2">
                  Or Quick Switch to Active Operator Profile:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'user_producer_1', name: 'Yuvraj Thinker', role: 'Producer', avatar: '🎬' },
                    { id: 'user_scorer_1', name: 'Rahul Dravid', role: 'Lead Scorer', avatar: '⚡' },
                    { id: 'user_graphics_1', name: 'Sarah Jenkins', role: 'Graphics TD', avatar: '🎨' },
                    { id: 'user_viewer_1', name: 'VIP Monitor', role: 'Viewer', avatar: '👁️' },
                  ].map((op) => (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => handleQuickOperatorLogin(op.id)}
                      className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span className="text-base">{op.avatar}</span>
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">{op.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{op.role}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* MODE: SIGN UP (SIGNUP WINDOW) */
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vikram Sharma"
                    className="w-full bg-[#070b14] border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address (Hostinger Key) *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. vikram@broadcast.live"
                    className="w-full bg-[#070b14] border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 4 characters"
                    className="w-full bg-[#070b14] border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full bg-[#070b14] border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              {/* Broadcaster Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Broadcaster Operator Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(roleDetails) as OperatorRole[]).map((r) => {
                    const rData = roleDetails[r];
                    const Icon = rData.icon;
                    const isSelected = role === r;
                    return (
                      <div
                        key={r}
                        onClick={() => setRole(r)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? isRedWhite
                              ? 'bg-rose-950/40 border-rose-500 shadow-sm ring-1 ring-rose-500/40'
                              : 'bg-cyan-950/40 border-cyan-400 shadow-sm ring-1 ring-cyan-500/40'
                            : 'bg-[#070b14] border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? (isRedWhite ? 'text-rose-400' : 'text-cyan-400') : 'text-slate-400'}`} />
                          <span className="text-xs font-bold text-white">{rData.label}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{rData.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Console Setup Preset */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Preferred Console Setup Preset
                </label>
                <input
                  type="text"
                  value={preferredSetup}
                  onChange={(e) => setPreferredSetup(e.target.value)}
                  placeholder="e.g. Arena Scoring Deck, Mobile Hotkey Rig, Studio Desk Alpha"
                  className="w-full bg-[#070b14] border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              {/* Assigned Sports */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Assigned Sports Disciplines
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_SPORTS.map((s) => {
                    const isSelected = assignedSports.includes(s.id);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => toggleSport(s.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? isRedWhite
                              ? 'bg-rose-600 text-white border-rose-400'
                              : 'bg-cyan-500 text-slate-950 border-cyan-300'
                            : 'bg-[#070b14] text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer ${
                  isRedWhite
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/30'
                }`}
              >
                {loading ? 'Creating Account in Hostinger DB...' : 'Create Broadcaster Account'}
              </button>
            </form>
          )}
        </div>

        {/* Footer switch prompt */}
        <div className="px-6 py-3 border-t border-slate-800/80 bg-black/40 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            {mode === 'login' ? "Don't have an account yet?" : 'Already registered?'}
          </span>
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setErrorMessage(null);
            }}
            className={`font-bold hover:underline cursor-pointer ${
              isRedWhite ? 'text-rose-400' : 'text-cyan-400'
            }`}
          >
            {mode === 'login' ? 'Open Sign Up Window' : 'Switch to Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};
