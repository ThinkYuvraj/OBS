import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, CreditCard, User, Sparkles, ShieldCheck, Compass, LifeBuoy, Star } from 'lucide-react';
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

        {/* Right Actions: License Badge, Operator Switcher, New Match */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Payment & Access Pass Pill */}
          <button
            onClick={() => setShowPricingModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all border cursor-pointer ${
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

          {/* Operator Switcher Pill */}
          <button
            onClick={() => setShowUserModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d1527] hover:bg-[#111e38] border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            title="Switch Operator Setup Profile"
          >
            <span className="text-sm">{activeUser?.avatar || '👤'}</span>
            <span className="hidden sm:inline-block truncate max-w-[120px]">
              {activeUser?.name || 'Operator'}
            </span>
          </button>

          {/* Client Help Desk Button */}
          {onOpenHelpDesk && (
            <button
              onClick={onOpenHelpDesk}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d1527] hover:bg-[#111e38] border border-cyan-500/30 hover:border-cyan-400 text-xs font-bold text-cyan-300 transition-colors cursor-pointer shadow-sm"
              title="Open Client Help Desk (Email: support@marketinglu.com)"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Help Desk</span>
            </button>
          )}

          {/* New Match Action */}
          <button
            onClick={() => onNavigate('create')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-xl transition-all shadow-md shadow-cyan-500/20 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>New Match</span>
          </button>
        </div>
      </header>

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
