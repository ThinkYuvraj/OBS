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
  onOpenSettings?: () => void;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
  isConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onOpenPolicies,
  onOpenHelpDesk,
  onOpenSettings,
  onOpenAuth,
}) => {
  const { theme, toggleTheme, isRedWhite } = useTheme();
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [licenseStatus, setLicenseStatus] = useState<any>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            ? 'border-rose-950/90 bg-[#0c0407]/95 shadow-rose-950/30'
            : 'border-slate-900/90 bg-[#040814]/95 shadow-black/50'
        } backdrop-blur-md sticky top-0 z-40 text-slate-100 shadow-xl transition-colors duration-300`}
      >
        {/* 1. LEFT LOGO: White Rounded Badge with Black MG Emblem + "MARKETIN GLU" Wordmark */}
        <div
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer whitespace-nowrap shrink-0 group"
          onClick={() => onNavigate('dashboard')}
          title="MarketinGlu Broadcast Suite"
        >
          {/* White Rounded Card holding Black MG Emblem */}
          <div
            className={`w-11 h-7.5 sm:w-13 sm:h-8.5 bg-white rounded-xl flex items-center justify-center px-1.5 py-1 shadow-sm transition-all shrink-0 ${
              isRedWhite
                ? 'group-hover:shadow-[0_0_12px_rgba(225,29,72,0.4)]'
                : 'group-hover:shadow-[0_0_12px_rgba(255,255,255,0.4)]'
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
                ? 'drop-shadow-[0_1px_6px_rgba(225,29,72,0.4)]'
                : 'drop-shadow-[0_1px_6px_rgba(6,182,212,0.35)]'
            }`}
          />
        </div>

        {/* 2. CENTER CAPSULE NAVBAR: Enclosed Pill Container with Glowing Active Tab */}
        <nav
          className={`hidden xl:flex items-center gap-1 px-1.5 py-1 rounded-full border shadow-inner backdrop-blur-md overflow-x-auto no-scrollbar ${
            isRedWhite
              ? 'bg-[#14060b]/90 border-rose-500/30 shadow-rose-950/40'
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
                      ? 'border border-rose-500 bg-rose-600 text-white font-black shadow-[0_0_14px_rgba(225,29,72,0.45)]'
                      : 'border border-cyan-400 bg-cyan-950/60 text-white font-bold shadow-[0_0_12px_rgba(6,182,212,0.35)]'
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
          {/* Quick Theme Switcher Pill (Red & White as default vs MarketinGlu secondary) */}
          <button
            onClick={toggleTheme}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-mono transition-all border cursor-pointer ${
              isRedWhite
                ? 'bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(225,29,72,0.25)]'
                : 'bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
            }`}
            title={`Active Theme: ${isRedWhite ? 'Red & White (Default)' : 'MarketinGlu Cyan'}. Click to toggle theme.`}
          >
            {isRedWhite ? (
              <>
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden 2xl:inline">Theme:</span>
                <span className="text-white font-black">Red &amp; White</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden 2xl:inline">Theme:</span>
                <span className="text-white font-black">MarketinGlu</span>
              </>
            )}
          </button>

          {/* Settings Button */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className={`p-2 rounded-full border transition-all text-xs font-bold cursor-pointer ${
                isRedWhite
                  ? 'bg-rose-950/40 hover:bg-rose-900/60 border-rose-500/40 text-rose-300 hover:text-white'
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
                ? 'border-rose-500 text-rose-300 hover:text-white hover:bg-rose-600 shadow-[0_0_12px_rgba(225,29,72,0.3)]'
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
                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
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
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-semibold text-slate-200 transition-colors cursor-pointer ${
              isRedWhite
                ? 'bg-[#18080e] hover:bg-[#220c14] border-rose-900/60 hover:border-rose-500/40'
                : 'bg-[#0d1527] hover:bg-[#111e38] border-slate-800 hover:border-cyan-500/40'
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
                  ? 'bg-rose-950/30 hover:bg-rose-600 hover:text-white border-rose-500/40 text-rose-300'
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
