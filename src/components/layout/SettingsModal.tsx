import React, { useState, useEffect } from 'react';
import {
  X,
  Palette,
  Database,
  User,
  Check,
  Server,
  RefreshCw,
  Download,
  Copy,
  ExternalLink,
  ShieldCheck,
  Eye,
  EyeOff,
  Flame,
  Sparkles,
  Layers,
  Lock,
  LogOut,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  fetchHostingerDbStatus,
  syncHostingerDatabase,
  fetchHostingerSqlExport,
  testHostingerConnection,
  configureHostingerDb,
  logoutBroadcaster,
} from '../../services/api';
import { UserProfile } from '../../types/sports';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeUser: UserProfile | null;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onUserLoggedOut?: (newUser: UserProfile) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  activeUser,
  onOpenAuth,
  onUserLoggedOut,
}) => {
  const { theme, setTheme, isRedWhite } = useTheme();
  const [activeTab, setActiveTab] = useState<'theme' | 'hostinger' | 'account'>('theme');

  // Hostinger DB State
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [loadingDb, setLoadingDb] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [syncingDb, setSyncingDb] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; pingMs?: number } | null>(null);
  const [sqlExport, setSqlExport] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form State for Hostinger DB credentials
  const [dbHost, setDbHost] = useState('');
  const [dbPort, setDbPort] = useState('3306');
  const [dbName, setDbName] = useState('');
  const [dbUser, setDbUser] = useState('');
  const [dbPassword, setDbPassword] = useState('');
  const [configNotice, setConfigNotice] = useState<string | null>(null);

  const loadDbInfo = () => {
    setLoadingDb(true);
    fetchHostingerDbStatus()
      .then((status) => {
        setDbStatus(status);
        setDbHost(status.host || '');
        setDbPort(String(status.port || 3306));
        setDbName(status.database || '');
        setDbUser(status.user || '');
      })
      .catch(console.error)
      .finally(() => setLoadingDb(false));
  };

  useEffect(() => {
    if (isOpen) {
      loadDbInfo();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await testHostingerConnection();
      setTestResult(res);
      loadDbInfo();
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Connection attempt failed',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveHostingerConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestingConnection(true);
    setConfigNotice(null);
    setTestResult(null);
    try {
      const res = await configureHostingerDb({
        host: dbHost.trim(),
        port: parseInt(dbPort || '3306', 10),
        database: dbName.trim(),
        user: dbUser.trim(),
        password: dbPassword.trim(),
      });
      setDbStatus(res.status);
      setTestResult(res.probe);
      setConfigNotice(res.message);
    } catch (err: any) {
      setConfigNotice(`Configuration Error: ${err?.message || 'Failed to save'}`);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSyncNow = async () => {
    setSyncingDb(true);
    try {
      const res = await syncHostingerDatabase();
      setDbStatus(res.status);
      setConfigNotice(res.message);
    } catch (err: any) {
      setConfigNotice(`Sync failed: ${err?.message}`);
    } finally {
      setSyncingDb(false);
    }
  };

  const handleFetchSqlDump = async () => {
    try {
      const res = await fetchHostingerSqlExport();
      setSqlExport(res.sql);
    } catch (err: any) {
      alert(`Failed to generate SQL export: ${err?.message}`);
    }
  };

  const copySqlToClipboard = () => {
    if (!sqlExport) return;
    navigator.clipboard.writeText(sqlExport);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const downloadSqlDumpFile = () => {
    if (!sqlExport) return;
    const blob = new Blob([sqlExport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marketinglu_hostinger_broadcast_schema_${Date.now()}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = async () => {
    try {
      const res = await logoutBroadcaster();
      if (onUserLoggedOut) {
        onUserLoggedOut(res.activeUser);
      }
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md font-['Plus_Jakarta_Sans',sans-serif]">
      <div
        className={`relative w-full max-w-3xl bg-gradient-to-br ${
          isRedWhite
            ? 'from-[#14060b] via-[#0d0407] to-[#080204] border-rose-500/40 shadow-[0_0_35px_rgba(225,29,72,0.25)]'
            : 'from-[#0b1424] via-[#080f1e] to-[#040814] border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.25)]'
        } border rounded-3xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300`}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                isRedWhite
                  ? 'bg-gradient-to-br from-rose-500 to-red-700 shadow-rose-600/30'
                  : 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-cyan-600/30'
              }`}
            >
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div
                className={`text-[10px] font-mono font-extrabold uppercase tracking-widest ${
                  isRedWhite ? 'text-rose-400' : 'text-cyan-400'
                }`}
              >
                BROADCAST STUDIO CONFIGURATION
              </div>
              <h2 className="text-base sm:text-lg font-black text-white font-['Space_Grotesk',sans-serif]">
                Settings &amp; Database Integration
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-800/60 bg-black/20 flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'theme', label: 'Theme Colors', icon: Palette, badge: isRedWhite ? 'Red & White (Default)' : 'MarketinGlu' },
            { id: 'hostinger', label: 'Hostinger MySQL DB', icon: Database, badge: dbStatus?.connected ? 'Live' : 'Staging' },
            { id: 'account', label: 'Account & Login', icon: User, badge: activeUser?.name || 'Operator' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? isRedWhite
                      ? 'bg-rose-600 text-white shadow-[0_0_12px_rgba(225,29,72,0.45)]'
                      : 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/50 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                    isActive
                      ? isRedWhite
                        ? 'bg-rose-950/70 text-rose-200'
                        : 'bg-cyan-950/70 text-cyan-200'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* TAB 1: THEME & COLOR CUSTOMIZATION */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                  Active Broadcast Visual Theme
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Select your studio broadcast theme. Changes apply instantly across the entire interface, scorebars, and graphics engine.
                </p>
              </div>

              {/* Theme Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Red & White Theme (DEFAULT) */}
                <div
                  onClick={() => setTheme('red-white')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                    isRedWhite
                      ? 'bg-gradient-to-br from-rose-950/40 via-red-950/20 to-black border-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.3)] ring-2 ring-rose-500/40'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-rose-600 flex items-center justify-center text-[10px] text-white">
                        <Flame className="w-2.5 h-2.5" />
                      </div>
                      <span className="text-xs font-black text-white font-['Space_Grotesk']">
                        Red &amp; White Theme
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      DEFAULT BROADCAST
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    High-impact Crimson Red and Polar White theme designed for aggressive broadcast visual clarity, high-contrast match graphics, and bold scorebugs.
                  </p>

                  {/* Swatches */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-xl bg-[#E11D48] border border-white/20 shadow-sm" title="Crimson Red #E11D48" />
                    <div className="w-7 h-7 rounded-xl bg-white border border-slate-300 shadow-sm" title="Polar White #FFFFFF" />
                    <div className="w-7 h-7 rounded-xl bg-[#0e0407] border border-rose-900/50" title="Dark Obsidian #0e0407" />
                    <span className="text-[10px] font-mono text-slate-400 ml-1">Crimson + White Contrast</span>
                  </div>

                  {isRedWhite ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 mt-2 font-mono">
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>ACTIVE DEFAULT THEME</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="mt-2 text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-200 hover:text-white transition-all border border-rose-500/30"
                    >
                      Switch to Red &amp; White
                    </button>
                  )}
                </div>

                {/* 2. MarketinGlu Theme (SECONDARY) */}
                <div
                  onClick={() => setTheme('marketinglu')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                    !isRedWhite
                      ? 'bg-gradient-to-br from-cyan-950/40 via-blue-950/20 to-black border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] ring-2 ring-cyan-500/40'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center text-[10px] text-slate-950">
                        <Sparkles className="w-2.5 h-2.5" />
                      </div>
                      <span className="text-xs font-black text-white font-['Space_Grotesk']">
                        MarketinGlu Cyber Cyan
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      SECONDARY THEME
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    Signature MarketinGlu sub-second broadcast aesthetic featuring dark space telemetry, glowing cyber-cyan pill capsules, and royal blue accents.
                  </p>

                  {/* Swatches */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-xl bg-[#06B6D4] border border-white/20 shadow-sm" title="Cyber Cyan #06B6D4" />
                    <div className="w-7 h-7 rounded-xl bg-[#2563EB] border border-white/20 shadow-sm" title="Royal Blue #2563EB" />
                    <div className="w-7 h-7 rounded-xl bg-[#070b14] border border-cyan-900/50" title="Space Navy #070b14" />
                    <span className="text-[10px] font-mono text-slate-400 ml-1">Cyan + Blue Glow</span>
                  </div>

                  {!isRedWhite ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 mt-2 font-mono">
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>ACTIVE SECONDARY THEME</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="mt-2 text-xs font-bold px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600 text-cyan-200 hover:text-slate-950 transition-all border border-cyan-500/30"
                    >
                      Switch to MarketinGlu Cyan
                    </button>
                  )}
                </div>
              </div>

              {/* Interactive Live Scorebug Preview Box */}
              <div className="p-4 rounded-2xl bg-black/40 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                    Live Scorebug Preview ({isRedWhite ? 'Red & White Broadcast' : 'MarketinGlu Cyber Cyan'})
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    ON AIR PREVIEW
                  </span>
                </div>

                <div
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    isRedWhite
                      ? 'bg-gradient-to-r from-[#1f0910] via-[#120409] to-[#1f0910] border-rose-500/60 shadow-[0_0_15px_rgba(225,29,72,0.3)]'
                      : 'bg-gradient-to-r from-[#07192f] via-[#051122] to-[#07192f] border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`px-2 py-1 rounded text-xs font-black font-mono tracking-wider ${
                        isRedWhite ? 'bg-rose-600 text-white' : 'bg-cyan-500 text-slate-950'
                      }`}
                    >
                      LIVE 1080p
                    </div>
                    <div>
                      <div className="text-xs font-black text-white">IND vs AUS • T20 WORLD CUP FINAL</div>
                      <div className="text-[11px] text-slate-300">Yuvraj Singh 72* (48) • M. Starc 2/28</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-sm sm:text-base font-black font-mono ${
                        isRedWhite ? 'text-white' : 'text-cyan-300'
                      }`}
                    >
                      156/4 <span className="text-xs text-slate-400 font-normal">(17.3 ov)</span>
                    </div>
                    <div
                      className={`text-[10px] font-mono font-bold ${
                        isRedWhite ? 'text-rose-400' : 'text-cyan-400'
                      }`}
                    >
                      CRR 8.91 • RRR 8.80
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HOSTINGER MYSQL DATABASE INTEGRATION */}
          {activeTab === 'hostinger' && (
            <div className="space-y-5">
              {/* Status Header Banner */}
              <div
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  dbStatus?.connected
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                      dbStatus?.connected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black flex items-center gap-2">
                      <span>Hostinger MySQL Status:</span>
                      <span className="font-mono uppercase px-2 py-0.5 rounded text-[10px] bg-black/40 border">
                        {dbStatus?.connected ? 'Connected (Remote MySQL Live)' : 'Hybrid Memory Staging (Ready)'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Target: {dbStatus?.host || 'srv1234.hstgr.io'} • DB: {dbStatus?.database || 'u123456789_broadcast_db'} • Users: {dbStatus?.syncedUsersCount || 0}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={handleTestConnection}
                    disabled={testingConnection}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-bold text-white transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                    <span>{testingConnection ? 'Probing...' : 'Test Connection'}</span>
                  </button>

                  <button
                    onClick={handleSyncNow}
                    disabled={syncingDb}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isRedWhite
                        ? 'bg-rose-600 hover:bg-rose-500 text-white'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>{syncingDb ? 'Syncing...' : 'Sync Now'}</span>
                  </button>
                </div>
              </div>

              {/* Probe or Config Notification */}
              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between ${
                    testResult.success
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                      : 'bg-red-950/40 border-red-500 text-red-300'
                  }`}
                >
                  <span>{testResult.message}</span>
                  {testResult.pingMs !== undefined && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-black/50 rounded">
                      {testResult.pingMs}ms Latency
                    </span>
                  )}
                </div>
              )}

              {configNotice && (
                <div className="p-3 rounded-xl border border-slate-700 bg-slate-900/60 text-xs font-mono text-slate-300">
                  {configNotice}
                </div>
              )}

              {/* Hostinger DB Configuration Form */}
              <form onSubmit={handleSaveHostingerConfig} className="p-4 rounded-2xl bg-black/30 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-white">Hostinger MySQL Database Credentials</span>
                  <span className="text-[10px] font-mono text-slate-400">hPanel MySQL Settings</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Hostinger DB Host / IP</label>
                    <input
                      type="text"
                      value={dbHost}
                      onChange={(e) => setDbHost(e.target.value)}
                      placeholder="e.g. srv1234.hstgr.io or your Hostinger IP"
                      className="w-full bg-[#070b14] border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Port</label>
                    <input
                      type="text"
                      value={dbPort}
                      onChange={(e) => setDbPort(e.target.value)}
                      placeholder="3306"
                      className="w-full bg-[#070b14] border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Database Name</label>
                    <input
                      type="text"
                      value={dbName}
                      onChange={(e) => setDbName(e.target.value)}
                      placeholder="e.g. u123456789_broadcast_db"
                      className="w-full bg-[#070b14] border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Database Username</label>
                    <input
                      type="text"
                      value={dbUser}
                      onChange={(e) => setDbUser(e.target.value)}
                      placeholder="e.g. u123456789_scorebug"
                      className="w-full bg-[#070b14] border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Database Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={dbPassword}
                      onChange={(e) => setDbPassword(e.target.value)}
                      placeholder="Enter Hostinger MySQL User Password"
                      className="w-full bg-[#070b14] border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleFetchSqlDump}
                    className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 underline decoration-slate-600"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>View / Export phpMyAdmin SQL</span>
                  </button>

                  <button
                    type="submit"
                    disabled={testingConnection}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isRedWhite
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/30'
                    }`}
                  >
                    Save &amp; Test Connection
                  </button>
                </div>
              </form>

              {/* Hostinger phpMyAdmin SQL Dump Modal View */}
              {sqlExport && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Hostinger phpMyAdmin DDL &amp; Users Table Snapshot</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        Ready to import
                      </span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={copySqlToClipboard}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
                      </button>
                      <button
                        onClick={downloadSqlDumpFile}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download .sql</span>
                      </button>
                      <button
                        onClick={() => setSqlExport(null)}
                        className="p-1 rounded text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <pre className="p-3 rounded-xl bg-black border border-slate-900 text-[11px] font-mono text-cyan-300 max-h-48 overflow-y-auto overflow-x-auto">
                    {sqlExport}
                  </pre>
                </div>
              )}

              {/* Hostinger Setup Tips */}
              <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
                <div className="font-bold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Hostinger hPanel Setup Checklist:</span>
                </div>
                <div className="text-[11px] space-y-1 pl-5 list-disc">
                  <div>1. Under Hostinger hPanel &rarr; <strong>Databases &rarr; Remote MySQL</strong>, add IP <code>%</code> (or your server IP) to permit remote connection.</div>
                  <div>2. Create a database user with <strong>All Privileges</strong> granted to your database.</div>
                  <div>3. Accounts created in the Signup Window automatically save into your Hostinger <code>broadcast_users</code> table!</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACCOUNT & OPERATOR PROFILE */}
          {activeTab === 'account' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                  Broadcaster Account &amp; Operator Profile
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Manage active broadcast operator authentication and switch profiles.
                </p>
              </div>

              {/* Current Active User Profile Card */}
              <div
                className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isRedWhite
                    ? 'bg-rose-950/20 border-rose-500/30'
                    : 'bg-cyan-950/20 border-cyan-500/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-black/60 border border-slate-700 flex items-center justify-center text-3xl shadow-inner">
                    {activeUser?.avatar || '👤'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-white">{activeUser?.name || 'Broadcaster'}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                          isRedWhite
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        }`}
                      >
                        {activeUser?.role || 'producer'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 mt-0.5">{activeUser?.title}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {activeUser?.email} • Setup: {activeUser?.preferredSetup || 'Standard Console'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>

              {/* Fast Actions: Switch or Create New Account */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    onOpenAuth('login');
                    onClose();
                  }}
                  className="p-4 rounded-2xl bg-black/40 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white group-hover:bg-slate-800">
                      <LogIn className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Log In with Another Account</div>
                      <div className="text-[11px] text-slate-400">Switch broadcaster operator or password login</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onOpenAuth('signup');
                    onClose();
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer group ${
                    isRedWhite
                      ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/60'
                      : 'bg-cyan-950/20 border-cyan-500/30 hover:border-cyan-500/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
                        isRedWhite ? 'bg-rose-600' : 'bg-cyan-500 text-slate-950'
                      }`}
                    >
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Sign Up New Broadcaster</div>
                      <div className="text-[11px] text-slate-400">Create new account backed by Hostinger DB</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800/80 bg-black/40 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Broadcaster Suite 2026.1</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
