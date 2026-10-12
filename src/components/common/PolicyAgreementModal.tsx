import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileText, CheckCircle2, Lock, Radio, Tv, ExternalLink } from 'lucide-react';

interface PolicyAgreementModalProps {
  onAccept: () => void;
  isOpen?: boolean;
  canDismiss?: boolean;
  onClose?: () => void;
}

const POLICY_VERSION = '2.4.0';
const STORAGE_KEY = 'marketinGlu_policy_accepted';

export const isPolicyAccepted = (): boolean => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed.accepted && parsed.version === POLICY_VERSION);
  } catch {
    return false;
  }
};

export const savePolicyAccepted = () => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        accepted: true,
        version: POLICY_VERSION,
        timestamp: new Date().toISOString(),
      })
    );
  } catch (err) {
    console.error('Failed to persist policy acceptance to localStorage:', err);
  }
};

export const PolicyAgreementModal: React.FC<PolicyAgreementModalProps> = ({
  onAccept,
  isOpen = true,
  canDismiss = false,
  onClose,
}) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [broadcastAccepted, setBroadcastAccepted] = useState(false);
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'broadcast' | 'sla'>('terms');

  const allAccepted = termsAccepted && privacyAccepted && broadcastAccepted;

  const handleAcceptAll = () => {
    savePolicyAccepted();
    onAccept();
    if (onClose) onClose();
  };

  const handleSelectAllCheckboxes = () => {
    setTermsAccepted(true);
    setPrivacyAccepted(true);
    setBroadcastAccepted(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif]">
      <div
        className="bg-gradient-to-b from-[#0c1424] via-[#080d19] to-[#070b14] border border-cyan-500/40 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl shadow-cyan-500/15 overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-5 border-b border-slate-800/80 bg-[#090f1f]/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-cyan-500/25">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <span>LEGAL &amp; BROADCAST COMPLIANCE GATE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="text-slate-400">v{POLICY_VERSION}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white font-['Space_Grotesk',sans-serif]">
                MarketinGlu User Agreement &amp; Broadcast Policies
              </h2>
            </div>
          </div>

          {canDismiss && onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-[#060a14] border border-slate-800 hover:border-slate-700 text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Close
            </button>
          )}
        </div>

        {/* Policy Tab Switcher */}
        <div className="px-5 py-2 bg-[#060a14]/90 border-b border-slate-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'terms', label: '1. Terms of Service' },
            { id: 'privacy', label: '2. Privacy & Telemetry' },
            { id: 'broadcast', label: '3. Acceptable Broadcast Use' },
            { id: 'sla', label: '4. ISO 9001:2015 SLA' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Policy Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs leading-relaxed text-slate-300 bg-[#070b14]/50">
          {activeTab === 'terms' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white font-['Space_Grotesk',sans-serif] flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Terms of Service &amp; License Passes</span>
              </h3>
              <p>
                Welcome to the <strong>MarketinGlu Sub-Second OBS Broadcast Suite</strong> (&ldquo;Service&rdquo;). By
                accessing, deploying, or scoring matches using this platform, you agree to comply with and be bound by the
                following commercial terms and conditions:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li>
                  <strong className="text-slate-200">Commercial License Model:</strong> The software operates under
                  on-demand access passes: <strong>₹499 per hour</strong> of active usage, <strong>₹1,699 per 24-hour day</strong>,
                  or seasonal professional production passes. Usage beyond licensed durations may restrict live score updates.
                </li>
                <li>
                  <strong className="text-slate-200">Sub-Second WebSocket Delivery:</strong> The real-time multiplexing hub is
                  engineered for sub-second sports telemetry. Automated polling or reverse-engineering of private WebSocket feeds
                  outside approved OBS browser sources is strictly prohibited.
                </li>
                <li>
                  <strong className="text-slate-200">Operator Responsibility:</strong> Operators are solely accountable for the
                  factual accuracy of live scores, referee signals, and broadcast graphics published to public stream channels.
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white font-['Space_Grotesk',sans-serif] flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>Broadcaster Privacy &amp; Data Telemetry</span>
              </h3>
              <p>
                We respect your production privacy. This section clarifies what data is collected, stored, and transmitted:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li>
                  <strong className="text-slate-200">Local-First Storage:</strong> Custom team rosters, squad lineups, player
                  numbers, and custom logos are stored primarily on your local machine using encrypted browser storage and your
                  designated Hostinger MySQL cold tier.
                </li>
                <li>
                  <strong className="text-slate-200">No Personal Tracking:</strong> We do not sell operator behavioral analytics or
                  monetize viewer broadcast impressions. Broadcast tokens are unique cryptographic hashes revocable by you at any time.
                </li>
                <li>
                  <strong className="text-slate-200">Payment Security:</strong> All financial transactions are securely processed
                  via <strong>Razorpay</strong> with 256-bit encryption. No credit card, UPI PIN, or bank credentials are ever logged
                  or stored on MarketinGlu servers.
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'broadcast' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white font-['Space_Grotesk',sans-serif] flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>Acceptable Live Streaming &amp; Broadcast Guidelines</span>
              </h3>
              <p>
                To maintain broadcast compliance and adhere to global telecommunication regulations:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li>
                  <strong className="text-slate-200">Copyright Compliance:</strong> Broadcasters must possess all required rights,
                  licenses, and permissions for any third-party team logos, sponsor graphics, music, or video feeds incorporated into
                  overlays.
                </li>
                <li>
                  <strong className="text-slate-200">Prohibited Content:</strong> You may not use MarketinGlu overlays to broadcast
                  defamatory, obscene, fraudulent, or illegal gambling content.
                </li>
                <li>
                  <strong className="text-slate-200">High-Availability Transmission:</strong> Overlays are tested for continuous
                  uninterrupted 1080p60 transmission. Users must ensure stable uplink bandwidth (minimum 5 Mbps) for optimal delivery.
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'sla' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white font-['Space_Grotesk',sans-serif] flex items-center gap-2">
                <Tv className="w-4 h-4 text-cyan-400" />
                <span>ISO 9001:2015 Engineering Quality &amp; SLA Warranty</span>
              </h3>
              <p>
                Our broadcast infrastructure complies with ISO 9001:2015 Quality Management standards:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li>
                  <strong className="text-slate-200">Target Latency:</strong> Sub-350ms frame update propagation from operator
                  key-press to OBS browser source render.
                </li>
                <li>
                  <strong className="text-slate-200">Multi-Sport Reliability:</strong> Full rule engine coverage across Cricket,
                  Football, Basketball, Pro Kabaddi, Tennis, Badminton, Table Tennis, Volleyball, Field Hockey, Baseball, and Rugby.
                </li>
                <li>
                  <strong className="text-slate-200">Uptime Assurance:</strong> High-availability architecture with automated
                  graceful recovery and persistent Hostinger phpMyAdmin SQL schema synchronization.
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Mandatory Checkboxes Gate */}
        <div className="p-4 bg-[#080d19] border-t border-slate-800/80 space-y-2.5">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs group">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-[#060a14] accent-cyan-400 cursor-pointer"
            />
            <span className="text-slate-300 group-hover:text-white">
              I have read and agree to the <strong>Terms of Service &amp; License Pass Pricing</strong> (₹499/hr • ₹1,699/day).
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer text-xs group">
            <input
              type="checkbox"
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-[#060a14] accent-cyan-400 cursor-pointer"
            />
            <span className="text-slate-300 group-hover:text-white">
              I consent to the <strong>Broadcaster Privacy Policy</strong> and secure local/cold-tier data storage.
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer text-xs group">
            <input
              type="checkbox"
              checked={broadcastAccepted}
              onChange={(e) => setBroadcastAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-[#060a14] accent-cyan-400 cursor-pointer"
            />
            <span className="text-slate-300 group-hover:text-white">
              I adhere to the <strong>Acceptable Live Streaming Guidelines</strong> and ISO 9001:2015 SLA standards.
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-slate-800/80 bg-[#090f1f]/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleSelectAllCheckboxes}
            className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline underline-offset-4 cursor-pointer"
          >
            Check All Policies
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleAcceptAll}
              disabled={!allAccepted}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-lg w-full sm:w-auto ${
                allAccepted
                  ? 'bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-cyan-500/25 font-black'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Accept Policies &amp; Enter Studio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
