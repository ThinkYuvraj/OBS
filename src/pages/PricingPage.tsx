import React, { useState } from 'react';
import {
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Zap,
  Building,
  FileText,
  Lock,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import { PricingCards } from '../components/payment/PricingCards';
import emblemDarkImg from '../assets/images/marketinglu-emblem-dark.png';

interface PricingPageProps {
  onBack: () => void;
  onNavigate?: (tab: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onBack, onNavigate }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const FAQS = [
    {
      q: 'How does the Hourly Pass (₹499/hr) work for live games?',
      a: 'The hourly pass gives your match production 60 minutes of uninterrupted sub-second live streaming from the moment of activation. It supports all 11 sports, live scoreboard repositioning in OBS, unlimited ball-by-ball updates, and automatic match event archival.',
    },
    {
      q: 'Can I pay using UPI, Paytm Wallet, or Indian Credit/Debit cards?',
      a: 'Yes! We support both Razorpay and Paytm gateways. You can pay seamlessly via Google Pay, PhonePe, Paytm UPI, Paytm Wallet, BHIM, RuPay, Visa, Mastercard, and Netbanking from all major Indian banks.',
    },
    {
      q: 'Do I get an official Indian GST Tax Invoice for business ITC claims?',
      a: 'Yes, absolutely. Our service is billed under SAC Code 998434 (Cloud Broadcast SaaS Streaming Service). When checking out, check "Claim 18% GST Input Tax Credit", enter your 15-digit company GSTIN, and you will instantly receive a compliant GST Tax Invoice under Rule 46 of CGST Rules, 2017.',
    },
    {
      q: 'What happens if our match gets delayed or rain interrupts play?',
      a: 'The 24-Hour Day Pass (₹1,699) is our most popular option for tournament days because it protects you against rain delays, super overs, or prolonged breaks without worrying about per-hour limits.',
    },
    {
      q: 'Are payments secure and compliant with RBI regulations?',
      a: 'Yes. All payments are processed through RBI-authorized payment aggregators (Razorpay / Paytm) with mandatory 256-bit TLS encryption, card tokenization, and two-factor authentication (2FA/OTP).',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 pb-24 w-full overflow-x-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Breadcrumb Header */}
      <div className="bg-gradient-to-r from-[#0c1424] via-[#090f1f] to-[#0c1424] border-b border-slate-800/80 px-4 sm:px-6 py-4 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2.5 rounded-xl bg-[#060a14] border border-slate-800 hover:border-cyan-500/40 text-slate-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#090f1f] border border-cyan-500/40 p-1 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <img src={emblemDarkImg} alt="MarketinGlu Emblem" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-cyan-400">
                  OFFICIAL BROADCAST LICENSING • INDIAN PRICING &amp; GST COMPLIANT
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Space_Grotesk',sans-serif]">
                  Broadcast Access Passes &amp; Live Graphics Pricing
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onNavigate && (
              <button
                onClick={() => onNavigate('legal')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#060a14] border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Legal &amp; Compliance Hub</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hero Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-6">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PAY-PER-MATCH OR 24-HOUR TOURNAMENT PASSES</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white font-['Space_Grotesk',sans-serif] tracking-tight mb-4">
            Transparent Indian Pricing for Modern Live Streamers
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            No forced recurring yearly lock-ins. Pay ₹499 per hour for individual games or ₹1,699 for a full 24-hour tournament pass. Instant auto-activation via Razorpay &amp; Paytm with 18% GST Input Tax Credit.
          </p>
        </div>

        {/* Pricing Cards Component */}
        <PricingCards />

        {/* Feature Comparison Matrix */}
        <div className="mt-16 bg-gradient-to-br from-[#0c1424] via-[#090f1f] to-[#070b14] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="mb-6 pb-4 border-b border-slate-800">
            <h3 className="text-lg font-black text-white font-['Space_Grotesk',sans-serif]">
              Compare Pass Features &amp; Capabilities
            </h3>
            <p className="text-xs text-slate-400">
              Detailed breakdown of broadcast engine limits, resolutions, and sports available across each pass.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead className="bg-[#091122] text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Feature</th>
                  <th className="p-3.5 text-center">Hourly Pass (₹499)</th>
                  <th className="p-3.5 text-center text-emerald-400 font-bold">24-Hour Pass (₹1,699)</th>
                  <th className="p-3.5 text-center text-amber-400">Tournament Month (₹4,999)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                <tr>
                  <td className="p-3.5 font-semibold text-white">Active Engine Duration</td>
                  <td className="p-3.5 text-center text-slate-300">60 Minutes</td>
                  <td className="p-3.5 text-center font-bold text-emerald-400">Full 24 Hours Uncapped</td>
                  <td className="p-3.5 text-center text-amber-300">30 Days Full Access</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold text-white">Sports Supported</td>
                  <td className="p-3.5 text-center text-slate-300">Cricket &amp; Football</td>
                  <td className="p-3.5 text-center font-bold text-emerald-400">All 11 Sports Engines</td>
                  <td className="p-3.5 text-center text-amber-300">All 11 Sports Engines</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold text-white">OBS URL Repositioning</td>
                  <td className="p-3.5 text-center text-slate-300">Standard Top/Bottom</td>
                  <td className="p-3.5 text-center font-bold text-emerald-400">Full 8 Positions + Custom X/Y</td>
                  <td className="p-3.5 text-center text-amber-300">Full Drag &amp; Drop Precision</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold text-white">Streaming Output</td>
                  <td className="p-3.5 text-center text-slate-300">1080p60 OBS Feed</td>
                  <td className="p-3.5 text-center font-bold text-emerald-400">1080p60 + YouTube / ITV Push</td>
                  <td className="p-3.5 text-center text-amber-300">4K60 + RTMP Uplink Studio</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold text-white">Multi-Operator Logins</td>
                  <td className="p-3.5 text-center text-slate-300">1 Scorer</td>
                  <td className="p-3.5 text-center font-bold text-emerald-400">Up to 3 Operators</td>
                  <td className="p-3.5 text-center text-amber-300">Unlimited Studio Seats</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold text-white">Official GST B2B Invoice</td>
                  <td className="p-3.5 text-center text-emerald-400">✓ Instant Download</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Instant Download</td>
                  <td className="p-3.5 text-center text-emerald-400">✓ Priority Tax Filing Receipt</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Indian Statutory Compliance Banner */}
        <div className="mt-12 bg-[#090f1f] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-mono font-bold text-cyan-400 uppercase">
                GOVERNMENT OF INDIA STATUTORY NORMS &amp; GST COMPLIANCE
              </div>
              <h4 className="text-base sm:text-lg font-black text-white font-['Space_Grotesk',sans-serif]">
                MarketinGlu Technologies Private Limited (CIN: U72900DL2024PTC123456)
              </h4>
              <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
                Registered office at Connaught Place, New Delhi 110001. GSTIN 07AAECM4920M1Z8. Compliant with Information Technology Act 2000, IT Rules 2021, and Digital Personal Data Protection Act 2023.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onNavigate && (
              <button
                onClick={() => onNavigate('legal')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs cursor-pointer shadow-md shadow-cyan-500/20"
              >
                Inspect Statutory Forms →
              </button>
            )}
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="mt-12">
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-black text-white font-['Space_Grotesk',sans-serif]">
              Frequently Asked Questions (FAQ)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Everything you need to know about billing, payment modes, and GST invoicing in India.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-800 bg-[#0c1424]/60 overflow-hidden"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full text-left p-4.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#0e172a]"
                  >
                    <span className="text-xs sm:text-sm font-bold text-white font-['Space_Grotesk',sans-serif]">
                      {faq.q}
                    </span>
                    <span className="text-cyan-400 font-mono text-sm font-bold">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4.5 pb-4.5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
