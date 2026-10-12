import React, { useState, useEffect } from 'react';
import { X, CreditCard, ShieldCheck } from 'lucide-react';
import { BroadcastLicense } from '../../types/sports';
import { fetchLicenseStatus } from '../../services/api';
import { PricingCards } from './PricingCards';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: (license: BroadcastLicense) => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onPaymentSuccess }) => {
  const [currentStatus, setCurrentStatus] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetchLicenseStatus()
        .then(setCurrentStatus)
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-5xl bg-gradient-to-br from-[#0c1424] via-[#090f1f] to-[#060a14] border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-800/90 flex items-center justify-between bg-[#070b14]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <span>RAZORPAY &amp; PAYTM GATEWAYS</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-emerald-400">INDIAN STATUTORY GST COMPLIANT</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white font-['Space_Grotesk',sans-serif]">
                Full Time Access Passes &amp; Live Broadcast Licensing
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentStatus?.isActive && (
              <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ACTIVE: {currentStatus.remainingHours}h Left
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#060a14] border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Pricing Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(92vh-80px)]">
          <PricingCards
            isModal={true}
            onPaymentSuccess={(lic) => {
              if (onPaymentSuccess) onPaymentSuccess(lic);
            }}
          />
        </div>
      </div>
    </div>
  );
};
