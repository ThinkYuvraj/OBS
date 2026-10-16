import React, { useState, useEffect } from 'react';
import {
  Plus,
  BookOpen,
  CreditCard,
  User,
  Sparkles,
  ShieldCheck,
  Compass,
  LifeBuoy,
  Star,
  Menu,
  X,
  LayoutGrid,
  Sliders,
  SlidersHorizontal,
  Layers,
  Tv,
  Scale,
  Phone,
  Settings,
  LogIn,
  UserPlus,
  Flame,
  Palette,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { UserProfile } from '../../types/sports';
import { fetchActiveUser, fetchLicenseStatus } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import { PricingModal } from '../payment/PricingModal';
import { UserRoleModal } from './UserRoleModal';
import emblemWhiteCardImg from '../../assets/images/marketinglu-emblem.png';
import wordmarkImg from '../../assets/images/marketinglu-wordmark.png';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenPolicies?: () => void;
  onOpenHelpDesk?: () => void;
  onOpenGuide?: () => void;
  onOpenSettings?: () => void;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
  onOpenPreloader?: () => void;
  isConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onOpenPolicies,
  onOpenHelpDesk,
  onOpenGuide,
  onOpenSettings,
  onOpenAuth,
  onOpenPreloader,
  isConnected = true,
}) => {
  const { theme, toggleTheme, isRedWhite } = useTheme();
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [licenseStatus, setLicenseStatus] = useState<any>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const refreshMeta = () => {
    fetchActiveUser()
      .then((res) => setActiveUser(res.activeUser))
      .catch(console.error);

    fetchLicenseStatus()
      .then(setLicenseStatus)
      .catch(console.error);
  };

  useEffect(() => {
    refreshMeta();
  }, []);

  const navLinks = [
    { id: 'dashboard', label: 'Home' },
    { id: 'scoring', label: 'Cricket' },
    { id: 'multi-scoring', label: 'Multi-Sport' },
    { id: 'overlay-control', label: 'Overlay Studio' },
    { id: 'pricing', label: 'Packages' },
    { id: 'rule-books', label: 'Rule Books' },
    { id: 'obs-guide', label: 'OBS Guide' },
    { id: 'architecture', label: 'Performance' },
    { id: 'reviews', label: 'Rate Us' },
    { id: 'legal', label: 'Legal Hub' },
  ];

  return (
    <>
      <header
        className={`flex items-center justify-between gap-3 sm:gap-4 px-3 sm:px-6 py-2.5 sm:py-3 border-b ${
          isRedWhite
            ? 'border-red-200 bg-white/95 text-slate-800 shadow-sm'
            : 'border-slate-900/90 bg-[#040814]/95 text-slate-100 shadow-black/50'
        } backdrop-blur-md sticky top-0 z-40 shadow-xl transition-colors duration-300`}
      >
        {/* 1. LEFT LOGO: White Rounded Badge with Black MG Emblem + "MARKETIN GLU" Wordmark */}
        <div
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer whitespace-nowrap shrink-0 group"
          onClick={() => onNavigate('dashboard')}
          title="MarketinGlu Broadcast Suite"
        >
          {/* White Rounded Card holding Black MG Emblem */}
          <div
            className={`w-11 h-7.5 sm:w-13 sm:h-8.5 bg-white rounded-xl flex items-center justify-center px-1.5 py-1 shadow-sm transition-all shrink-0 border ${
              isRedWhite
                ? 'border-red-200 group-hover:border-red-500 group-hover:shadow-[0_0_12px_rgba(220,38,38,0.25)]'
                : 'border-white/10 group-hover:shadow-[0_0_12px_rgba(255,255,255,0.4)]'
            }`}
          >
            <img
              src={emblemWhiteCardImg}
              alt="MarketinGlu Emblem"
              className="h-full w-auto object-contain select-none pointer-events-none"
            />
          </div>

          {/* Official Wordmark Image: "MARKETIN GLU" */}
          <img
            src={wordmarkImg}
            alt="MARKETINGLU"
            className={`h-4.5 sm:h-5.5 w-auto object-contain brightness-110 select-none ${
              isRedWhite
                ? 'contrast-125'
                : 'drop-shadow-[0_1px_6px_rgba(6,182,212,0.35)]'
            }`}
          />
        </div>

        {/* 2. CENTER CAPSULE NAVBAR: Enclosed Pill Container with Glowing Active Tab */}
        <nav
          className={`hidden xl:flex items-center gap-1 px-1.5 py-1 rounded-full border shadow-inner backdrop-blur-md overflow-x-auto no-scrollbar ${
            isRedWhite
              ? 'bg-red-50/70 border-red-200 shadow-sm'
              : 'bg-[#051122]/90 border-cyan-500/25 shadow-black/50'
          }`}
        >
          {navLinks.map((tab) => {
            const isActive =
              currentTab === tab.id ||
              (tab.id === 'multi-scoring' && currentTab === 'football-scoring');

            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={`transition-all cursor-pointer whitespace-nowrap shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full ${
                  isActive
                    ? isRedWhite
                      ? 'border border-red-600 bg-red-600 text-white font-black shadow-[0_0_10px_rgba(220,38,38,0.35)]'
                      : 'border border-cyan-400 bg-cyan-950/60 text-white font-bold shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                    : isRedWhite
                    ? 'text-slate-600 hover:text-red-600 hover:bg-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* 3. RIGHT ACTION SUITE: Phone Hotline + Theme Toggle + Settings + New Match + Auth */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Live Engine Telemetry Status Badge */}
          <div
            className={`hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold select-none ${
              isRedWhite
                ? 'bg-red-50 border-red-200 text-slate-700'
                : 'bg-[#030712] border-slate-800/80 text-slate-300'
            }`}
            title={
              isConnected
                ? 'Real-Time WebSocket Engine: Sub-Second Latency (<20ms) • 60 FPS'
                : 'Engine Connecting / Standby'
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected
                  ? 'bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse'
                  : 'bg-amber-400 animate-ping'
              }`}
            />
            <span className={isRedWhite ? 'text-slate-500' : 'text-slate-400'}>ENGINE:</span>
            <span className={isConnected ? (isRedWhite ? 'text-emerald-700 font-extrabold' : 'text-emerald-300 font-extrabold') : 'text-amber-500'}>
              {isConnected ? '60 FPS' : 'STANDBY'}
            </span>
          </div>

          {/* Fullscreen Studio Toggle */}
          <button
            onClick={toggleFullscreen}
            className={`hidden sm:flex p-2 rounded-full border transition-all text-xs font-bold cursor-pointer ${
              isRedWhite
                ? 'bg-white hover:bg-red-50 border-red-200 text-slate-700 hover:text-red-600'
                : 'bg-[#0d1527] hover:bg-[#111e38] border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white'
            }`}
            title={isFullscreen ? 'Exit Fullscreen Mode (Esc)' : 'Enter Fullscreen Studio (F11)'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Quick Theme Switcher Pill (Red & White as default vs MarketinGlu secondary) */}
          <button
            onClick={toggleTheme}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-mono transition-all border cursor-pointer ${
              isRedWhite
                ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200 shadow-sm'
                : 'bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
            }`}
            title={`Active Theme: ${isRedWhite ? 'Red & White (Default)' : 'MarketinGlu Cyan'}. Click to toggle theme.`}
          >
            {isRedWhite ? (
              <>
                <Flame className="w-3.5 h-3.5 text-red-600" />
                <span className="hidden 2xl:inline">Theme:</span>
                <span className="text-red-700 font-black">Red &amp; White</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden 2xl:inline">Theme:</span>
                <span className="text-white font-black">MarketinGlu</span>
              </>
            )}
          </button>

          {/* New Preloader Screen Trigger */}
          {onOpenPreloader && (
            <button
              onClick={onOpenPreloader}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer whitespace-nowrap shadow-sm ${
                isRedWhite
                  ? 'bg-red-600 hover:bg-red-700 text-white border border-red-600 shadow-sm'
                  : 'bg-cyan-500/15 hover:bg-cyan-500/25 border-cyan-500/40 text-cyan-200 shadow-cyan-950/30'
              }`}
              title="Open the new Cricket Ball Red & White Preloader Screen"
            >
              <span className="text-xs">🏏</span>
              <span className="font-bold">Preloader</span>
            </button>
          )}

          {/* Panel Guide Quick Access */}
          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-sm ${
                isRedWhite
                  ? 'bg-white hover:bg-red-50 border-red-200 text-slate-700 hover:text-red-600'
                  : 'bg-cyan-500/15 hover:bg-cyan-500/25 border-cyan-500/40 text-cyan-200 shadow-cyan-950/30'
              }`}
              title="Open Operator Panel Guide & Hotkey Manual (Shift+G or ?)"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Panel Guide</span>
            </button>
          )}

          {/* Settings Button */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className={`p-2 rounded-full border transition-all text-xs font-bold cursor-pointer ${
                isRedWhite
                  ? 'bg-white hover:bg-red-50 border-red-200 text-slate-700 hover:text-red-600'
                  : 'bg-[#0d1527] hover:bg-[#111e38] border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white'
              }`}
              title="Studio Settings & Theme Customization & Hostinger DB"
              aria-label="Studio Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {/* Primary Action Button: Pill Shaped with Glowing Border ("New Match" CTA) */}
          <button
            onClick={() => onNavigate('create')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full border font-bold text-xs transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              isRedWhite
                ? 'border-red-600 text-white bg-red-600 hover:bg-red-700 shadow-sm shadow-red-600/30'
                : 'border-cyan-400 text-cyan-300 hover:text-slate-950 hover:bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
            }`}
            title="Create a New Live Match Overlay Channel"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">New Match</span>
          </button>

          {/* Payment Pass Indicator (Desktop/Tablet) */}
          <button
            onClick={() => setShowPricingModal(true)}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-mono transition-all border cursor-pointer ${
              licenseStatus?.isActive
                ? (isRedWhite ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/40')
                : (isRedWhite ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse' : 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse')
            }`}
            title="Manage Broadcast License Passes (₹499/hr • ₹1,699/day)"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>
              {licenseStatus?.isActive
                ? `${licenseStatus.remainingHours}h Pass`
                : '₹499/hr Pass'}
            </span>
          </button>

          {/* Operator Switcher / Login Trigger (Desktop/Tablet) */}
          <button
            onClick={() => setShowUserModal(true)}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-semibold transition-colors cursor-pointer ${
              isRedWhite
                ? 'bg-white hover:bg-red-50 border-red-200 text-slate-800 hover:text-red-600'
                : 'bg-[#0d1527] hover:bg-[#111e38] border-slate-800 hover:border-cyan-500/40 text-slate-200'
            }`}
            title="Switch Operator Setup Profile"
          >
            <span className="text-sm">{activeUser?.avatar || '👤'}</span>
            <span className="hidden xl:inline-block truncate max-w-[100px]">
              {activeUser?.name || 'Operator'}
            </span>
          </button>

          {/* Sign Up / Log In Button (Desktop/Tablet) */}
          {onOpenAuth && (
            <button
              onClick={() => onOpenAuth('signup')}
              className={`hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                isRedWhite
                  ? 'bg-white hover:bg-red-600 hover:text-white border border-red-600 text-red-600'
                  : 'bg-cyan-950/30 hover:bg-cyan-400 hover:text-slate-950 border-cyan-500/40 text-cyan-300'
              }`}
              title="Create Broadcaster Account or Log In (Hostinger DB)"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
          )}

          {/* Mobile Menu Hamburger (Phone/Tablet) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`xl:hidden p-2 rounded-xl border text-slate-300 hover:text-white transition-colors cursor-pointer ${
              isRedWhite
                ? 'bg-[#18080e] border-rose-900/60 hover:border-rose-500/40'
                : 'bg-[#0d1527] border-slate-800 hover:border-cyan-500/40'
            }`}
            title="Toggle Navigation Menu"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <X className={`w-4 h-4 ${isRedWhite ? 'text-rose-400' : 'text-cyan-400'}`} />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop & Slide-Over Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-start">
          <div
            className={`border-b p-4 max-h-[88vh] overflow-y-auto space-y-4 shadow-2xl ${
              isRedWhite ? 'bg-[#120509] border-rose-900/60' : 'bg-[#090f1f] border-slate-800'
            }`}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-6 bg-white rounded-lg flex items-center justify-center p-1 shadow-sm shrink-0">
                  <img src={emblemWhiteCardImg} alt="MarketinGlu" className="h-full w-auto object-contain" />
                </div>
                <img src={wordmarkImg} alt="MARKETINGLU" className="h-4 w-auto object-contain" />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-[#060a14] border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Theme & Settings Quick Row in Drawer */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  toggleTheme();
                }}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  isRedWhite
                    ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                    : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
                }`}
              >
                <div className="text-[10px] text-slate-400 font-mono">Theme Mode</div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                  {isRedWhite ? <Flame className="w-3.5 h-3.5 text-rose-400" /> : <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
                  <span>{isRedWhite ? 'Red & White' : 'MarketinGlu'}</span>
                </div>
              </button>

              {onOpenSettings && (
                <button
                  onClick={() => {
                    onOpenSettings();
                    setMobileMenuOpen(false);
                  }}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-left cursor-pointer"
                >
                  <div className="text-[10px] text-slate-400 font-mono">Settings &amp; DB</div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                    <Settings className="w-3.5 h-3.5 text-slate-300" />
                    <span>Studio Config</span>
                  </div>
                </button>
              )}
            </div>

            {/* Auth Buttons: Log In & Sign Up in Mobile Drawer */}
            {onOpenAuth && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onOpenAuth('login');
                    setMobileMenuOpen(false);
                  }}
                  className="p-2.5 rounded-xl bg-[#080d1a] border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => {
                    onOpenAuth('signup');
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                    isRedWhite
                      ? 'bg-rose-600 text-white'
                      : 'bg-cyan-500 text-slate-950'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up Window</span>
                </button>
              </div>
            )}

            {/* Direct Phone Helpline in Drawer */}
            <a
              href="tel:+919654596149"
              className={`flex items-center justify-between p-3 rounded-xl bg-[#060a14] border text-white ${
                isRedWhite ? 'border-rose-500/30 hover:border-rose-400' : 'border-cyan-500/30 hover:border-cyan-400'
              }`}
            >
              <div
                className={`flex items-center gap-2 text-xs font-mono font-bold ${
                  isRedWhite ? 'text-rose-300' : 'text-cyan-300'
                }`}
              >
                <Phone className={`w-4 h-4 ${isRedWhite ? 'text-rose-400' : 'text-cyan-400'}`} />
                <span>24/7 Helpline: +91 96545 96149</span>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  isRedWhite ? 'bg-rose-500/20 text-rose-300' : 'bg-cyan-500/20 text-cyan-300'
                }`}
              >
                CALL NOW
              </span>
            </a>

            {/* Operator & License Cards */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setShowUserModal(true);
                  setMobileMenuOpen(false);
                }}
                className="p-3 rounded-xl bg-[#060a14] border border-slate-800 text-left hover:border-slate-700 cursor-pointer"
              >
                <div className="text-[10px] text-slate-400 font-mono">Operator</div>
                <div className="text-xs font-bold text-white flex items-center gap-1 mt-0.5 truncate">
                  <span>{activeUser?.avatar || '👤'}</span>
                  <span className="truncate">{activeUser?.name || 'Producer'}</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowPricingModal(true);
                  setMobileMenuOpen(false);
                }}
                className={`p-3 rounded-xl bg-[#060a14] border text-left cursor-pointer ${
                  isRedWhite ? 'border-rose-500/30 hover:border-rose-400' : 'border-cyan-500/30 hover:border-cyan-400'
                }`}
              >
                <div
                  className={`text-[10px] font-mono ${
                    isRedWhite ? 'text-rose-400' : 'text-cyan-400'
                  }`}
                >
                  License Pass
                </div>
                <div className="text-xs font-bold text-white flex items-center gap-1 mt-0.5 truncate">
                  <CreditCard className={`w-3.5 h-3.5 ${isRedWhite ? 'text-rose-400' : 'text-cyan-400'}`} />
                  <span className="truncate">
                    {licenseStatus?.isActive ? `${licenseStatus.remainingHours}h Pass` : '₹499/hr Pass'}
                  </span>
                </div>
              </button>
            </div>

            {/* Navigation Grid Links */}
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider px-2 py-1">
                Studio Channels &amp; Tools
              </div>
              {[
                { id: 'dashboard', label: 'Home (Dashboard)', icon: LayoutGrid },
                { id: 'scoring', label: 'ICC Cricket Console', icon: Tv },
                { id: 'multi-scoring', label: 'Multi-Sport Engine', icon: SlidersHorizontal },
                { id: 'pricing', label: 'Packages & Passes (₹499/hr)', icon: CreditCard },
                { id: 'rule-books', label: 'Rule Books & Signals', icon: BookOpen },
                { id: 'legal', label: 'Indian Legal Compliance', icon: Scale },
                { id: 'overlay-control', label: 'OBS Overlay Studio', icon: Sliders },
                { id: 'obs-guide', label: 'OBS Setup Guide', icon: Compass },
                { id: 'architecture', label: 'Performance Architecture', icon: Layers },
                { id: 'reviews', label: 'Rate Us & Play Store Reviews', icon: Star, highlight: true },
              ].map((item) => {
                const IconComponent = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                      isActive
                        ? isRedWhite
                          ? 'bg-rose-600 text-white font-black'
                          : 'bg-cyan-500 text-slate-950 font-black'
                        : item.highlight
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        : 'bg-[#060a14] text-slate-300 hover:text-white'
                    }`}
                  >
                    <IconComponent
                      className={`w-4 h-4 ${
                        isActive
                          ? isRedWhite
                            ? 'text-white'
                            : 'text-slate-950'
                          : item.highlight
                          ? 'text-amber-400'
                          : isRedWhite
                          ? 'text-rose-400'
                          : 'text-cyan-400'
                      }`}
                    />
                    <span className="flex-1">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Client Help Desk Action */}
            {onOpenHelpDesk && (
              <button
                onClick={() => {
                  onOpenHelpDesk();
                  setMobileMenuOpen(false);
                }}
                className={`w-full py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                  isRedWhite
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-300 hover:bg-rose-500/20'
                    : 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20'
                }`}
              >
                <LifeBuoy className="w-4 h-4" />
                <span>Client Help Desk (support@marketinglu.com)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Pricing Passes Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onPaymentSuccess={() => {
          refreshMeta();
        }}
      />

      {/* Operator Setup Profile Modal */}
      <UserRoleModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onUserChanged={(user: UserProfile) => {
          setActiveUser(user);
        }}
      />
    </>
  );
};
