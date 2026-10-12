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
} from 'lucide-react';
import { UserProfile } from '../../types/sports';
import { fetchActiveUser, fetchLicenseStatus } from '../../services/api';
import { PricingModal } from '../payment/PricingModal';
import { UserRoleModal } from './UserRoleModal';
import emblemDarkImg from '../../assets/images/marketinglu-emblem-dark.png';
import wordmarkImg from '../../assets/images/marketinglu-wordmark.png';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenPolicies?: () => void;
  onOpenHelpDesk?: () => void;
  isConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate, onOpenPolicies, onOpenHelpDesk }) => {
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

  return (
    <>
      <header className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3 border-b border-slate-800/80 bg-[#070b14]/95 backdrop-blur-md sticky top-0 z-40 text-slate-100 shadow-xl shadow-black/40">
        {/* Brand & Wordmark */}
        <div
          className="flex items-center gap-3 cursor-pointer whitespace-nowrap shrink-0"
          onClick={() => onNavigate('dashboard')}
        >
          <div className="w-10 h-10 rounded-xl bg-[#090f1f] border border-cyan-500/40 flex items-center justify-center p-1 shadow-lg shadow-cyan-500/20 group hover:border-cyan-400 transition-colors">
            <img
              src={emblemDarkImg}
              alt="MarketinGlu Emblem"
              className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <img
                src={wordmarkImg}
                alt="MARKETINGLU"
                className="h-4.5 w-auto object-contain brightness-110 drop-shadow-[0_1px_4px_rgba(6,182,212,0.3)]"
              />
              <span className="text-[10px] font-black text-cyan-300 font-mono tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                OBS
              </span>
              <span className="hidden lg:inline-block px-1.5 py-0.2 rounded bg-cyan-500/10 border border-cyan-500/30 text-[9px] font-mono text-cyan-300 font-bold">
                ISO 9001:2015
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-tight -mt-0.5">
              Sub-second Broadcast Engine
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden xl:flex items-center gap-6 text-xs font-semibold text-slate-400">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`transition-colors hover:text-cyan-300 cursor-pointer whitespace-nowrap shrink-0 ${
              currentTab === 'dashboard' ? 'text-cyan-400 font-bold' : ''
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate('scoring')}
            className={`transition-colors hover:text-cyan-300 cursor-pointer whitespace-nowrap shrink-0 ${
              currentTab === 'scoring' ? 'text-cyan-400 font-bold' : ''
            }`}
          >
            Cricket Console
          </button>
          <button
            onClick={() => onNavigate('multi-scoring')}
            className={`transition-colors hover:text-cyan-300 cursor-pointer whitespace-nowrap shrink-0 ${
              currentTab === 'multi-scoring' || currentTab === 'football-scoring'
                ? 'text-cyan-400 font-bold'
                : ''
            }`}
          >
            Multi-Sport Console
          </button>
          <button
            onClick={() => onNavigate('rule-books')}
            className={`flex items-center gap-1 transition-colors hover:text-cyan-300 cursor-pointer whitespace-nowrap shrink-0 ${
              currentTab === 'rule-books' ? 'text-cyan-400 font-bold' : ''
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Rule Books</span>
          </button>
          <button
            onClick={() => onNavigate('overlay-control')}
            className={`transition-colors hover:text-cyan-300 cursor-pointer whitespace-nowrap shrink-0 ${
              currentTab === 'overlay-control' ? 'text-cyan-400 font-bold' : ''
            }`}
          >
            Overlay Studio
          </button>
          <button
            onClick={() => onNavigate('obs-guide')}
            className={`flex items-center gap-1 transition-colors hover:text-cyan-300 cursor-pointer whitespace-nowrap shrink-0 ${
              currentTab === 'obs-guide' ? 'text-cyan-400 font-bold' : ''
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>OBS Guide</span>
          </button>
          <button
            onClick={() => onNavigate('architecture')}
            className={`transition-colors hover:text-cyan-300 cursor-pointer whitespace-nowrap shrink-0 ${
              currentTab === 'architecture' ? 'text-cyan-400 font-bold' : ''
            }`}
          >
            3-Tier Architecture
          </button>
          <button
            onClick={() => onNavigate('reviews')}
            className={`flex items-center gap-1.5 transition-colors hover:text-cyan-300 cursor-pointer whitespace-nowrap shrink-0 ${
              currentTab === 'reviews' ? 'text-cyan-400 font-bold' : 'text-slate-300'
            }`}
            title="Rate Us on Google Play Store & Read Community Reviews"
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Rate Us</span>
          </button>
          <button
            onClick={() => onNavigate('pricing')}
            className={`flex items-center gap-1.5 transition-colors hover:text-cyan-300 cursor-pointer whitespace-nowrap shrink-0 ${
              currentTab === 'pricing' ? 'text-cyan-400 font-bold' : 'text-slate-300'
            }`}
            title="Passes & Razorpay/Paytm Invoicing (₹499/hr • ₹1,699/day)"
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pricing</span>
          </button>
          <button
            onClick={() => onNavigate('legal')}
            className={`flex items-center gap-1.5 transition-colors hover:text-cyan-300 cursor-pointer whitespace-nowrap shrink-0 ${
              currentTab === 'legal' ? 'text-cyan-400 font-bold' : 'text-slate-300'
            }`}
            title="Indian Legal Compliance, IT Rules & Grievance Redressal"
          >
            <Scale className="w-3.5 h-3.5 text-cyan-400" />
            <span>Legal Hub</span>
          </button>
          {onOpenPolicies && (
            <button
              onClick={onOpenPolicies}
              className="flex items-center gap-1 transition-colors hover:text-cyan-300 cursor-pointer whitespace-nowrap shrink-0 text-slate-400"
              title="Review MarketinGlu Broadcast Legal Policies & SLA"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Policies</span>
            </button>
          )}
        </nav>

        {/* Right Actions: License Badge, Operator Switcher, New Match + Mobile Hamburger */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Payment & Access Pass Pill (Desktop/Tablet) */}
          <button
            onClick={() => setShowPricingModal(true)}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all border cursor-pointer ${
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

          {/* Operator Switcher Pill (Desktop/Tablet) */}
          <button
            onClick={() => setShowUserModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d1527] hover:bg-[#111e38] border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            title="Switch Operator Setup Profile"
          >
            <span className="text-sm">{activeUser?.avatar || '👤'}</span>
            <span className="hidden md:inline-block truncate max-w-[120px]">
              {activeUser?.name || 'Operator'}
            </span>
          </button>

          {/* Client Help Desk Button */}
          {onOpenHelpDesk && (
            <button
              onClick={onOpenHelpDesk}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#0d1527] hover:bg-[#111e38] border border-cyan-500/30 hover:border-cyan-400 text-xs font-bold text-cyan-300 transition-colors cursor-pointer shadow-sm"
              title="Open Client Help Desk (Email: support@marketinglu.com)"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">Help Desk</span>
            </button>
          )}

          {/* New Match Action */}
          <button
            onClick={() => onNavigate('create')}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-xl transition-all shadow-md shadow-cyan-500/20 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden sm:inline">New Match</span>
          </button>

          {/* Mobile Drawer Toggle (Phone/Tablet) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl bg-[#0d1527] border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Toggle Navigation Menu"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 text-cyan-400" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop & Slide-Over Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-start">
          <div className="bg-[#090f1f] border-b border-slate-800 p-4 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <img src={emblemDarkImg} alt="MarketinGlu" className="w-7 h-5 object-contain" />
                <img src={wordmarkImg} alt="MARKETINGLU" className="h-4 w-auto object-contain" />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-[#060a14] border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Operator & License Cards */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setShowUserModal(true);
                  setMobileMenuOpen(false);
                }}
                className="p-3 rounded-xl bg-[#060a14] border border-slate-800 text-left hover:border-cyan-500/40 cursor-pointer"
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
                className="p-3 rounded-xl bg-[#060a14] border border-cyan-500/30 text-left hover:border-cyan-400 cursor-pointer"
              >
                <div className="text-[10px] text-cyan-400 font-mono">License Pass</div>
                <div className="text-xs font-bold text-white flex items-center gap-1 mt-0.5 truncate">
                  <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="truncate">
                    {licenseStatus?.isActive ? `${licenseStatus.remainingHours}h Pass` : '₹499/hr Pass'}
                  </span>
                </div>
              </button>
            </div>

            {/* Navigation Grid Links */}
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider px-2 py-1">
                Studio Channels & Tools
              </div>
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
                { id: 'scoring', label: 'ICC Cricket Console', icon: Tv },
                { id: 'multi-scoring', label: 'Multi-Sport Engine', icon: SlidersHorizontal },
                { id: 'rule-books', label: 'Sports Rule Books', icon: BookOpen },
                { id: 'pricing', label: 'Pass Pricing (₹499/hr • Razorpay/Paytm)', icon: CreditCard },
                { id: 'legal', label: 'Indian Legal Compliance & Forms', icon: Scale },
                { id: 'overlay-control', label: 'OBS Overlay Studio', icon: Sliders },
                { id: 'obs-guide', label: 'OBS Setup Guide', icon: Compass },
                { id: 'architecture', label: '3-Tier Architecture', icon: Layers },
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
                        ? 'bg-cyan-500 text-slate-950 font-black'
                        : item.highlight
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        : 'bg-[#060a14] text-slate-300 hover:text-white'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${isActive ? 'text-slate-950' : item.highlight ? 'text-amber-400' : 'text-cyan-400'}`} />
                    <span className="flex-1">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Help Desk & Policies */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              {onOpenHelpDesk && (
                <button
                  onClick={() => {
                    onOpenHelpDesk();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/30 text-left cursor-pointer"
                >
                  <LifeBuoy className="w-4 h-4 text-rose-400" />
                  <span>Report Match Issue (support@marketinglu.com)</span>
                </button>
              )}
              {onOpenPolicies && (
                <button
                  onClick={() => {
                    onOpenPolicies();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white text-left cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span>Legal Policies & Broadcast SLA</span>
                </button>
              )}
            </div>
          </div>

          <div
            className="flex-1"
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* Native Mobile Bottom Navigation Bar (Android Play Store Style) */}
      <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070b14]/95 backdrop-blur-lg border-t border-slate-800/90 pb-safe shadow-[0_-8px_25px_rgba(0,0,0,0.6)]">
        <div className="grid grid-cols-5 items-center justify-around px-1 py-1.5">
          {[
            { id: 'dashboard', label: 'Home', icon: LayoutGrid },
            { id: 'scoring', label: 'Cricket', icon: Tv },
            { id: 'multi-scoring', label: 'Sports', icon: SlidersHorizontal },
            { id: 'rule-books', label: 'Rules', icon: BookOpen },
            { id: 'reviews', label: 'Rate Us', icon: Star },
          ].map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
                  active ? 'text-cyan-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${active ? 'text-cyan-400 stroke-[2.5]' : 'text-slate-400'}`} />
                <span className="text-[10px] tracking-tight mt-0.5 font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Pricing Gateway Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onPaymentSuccess={() => refreshMeta()}
      />

      {/* Operator Setup User Profile Modal */}
      <UserRoleModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onUserChanged={(u) => setActiveUser(u)}
      />
    </>
  );
};
