import React, { useState, useEffect } from 'react';
import {
  Check,
  Zap,
  Clock,
  Calendar,
  Sparkles,
  CreditCard,
  QrCode,
  ShieldCheck,
  Download,
  Building,
  HelpCircle,
  ArrowRight,
  Printer,
  X,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { PassPlan, PaymentGateway, BroadcastLicense, GstInvoiceDetails } from '../../types/sports';
import { createPaymentOrder, verifyPayment } from '../../services/api';

interface PricingCardsProps {
  onPaymentSuccess?: (license: BroadcastLicense) => void;
  className?: string;
  isModal?: boolean;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export const PRICING_PLANS = [
  {
    id: 'hourly' as PassPlan,
    name: 'Hourly Broadcast Pass',
    priceINR: 499,
    basePriceINR: 422.88,
    gstINR: 76.12,
    unit: 'per hour of usage',
    badge: 'Single Match',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    icon: Clock,
    popular: false,
    description: 'Perfect for a single cricket T20 clash, weekend football match, or rapid broadcast trial test.',
    features: [
      'Full 60 Minutes Uninterrupted Live Engine',
      'Unlimited Ball-by-Ball Events & Wickets',
      '1080p60 OBS Overlay Browser Source Feed',
      'Standard Lower Thirds & Cricket Bug',
      'Sub-second WebSocket Sync',
      'Instant Auto Activation via Razorpay / Paytm',
    ],
  },
  {
    id: 'daily' as PassPlan,
    name: '24-Hour Day Pass',
    priceINR: 1699,
    basePriceINR: 1439.83,
    gstINR: 259.17,
    unit: 'per day (24 hours full access)',
    badge: 'Most Popular • Best Value',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    icon: Calendar,
    popular: true,
    description: 'Full day multi-match tournament pass. Ideal for weekend club tournaments, playoffs, and league doubleheaders.',
    features: [
      'Full 24 Hours Uncapped Live Access',
      'All 11 Sports Engines (Cricket, Football, Kabaddi, etc.)',
      'Parallel Multi-Match Scoring Channels',
      'OBS URL Repositioning (?pos=top-right & custom X/Y)',
      'RTMP Uplink (YouTube Live 1080p60 & ITV Studio)',
      'Instant GST Tax Invoice with 18% ITC',
    ],
  },
  {
    id: 'pro' as PassPlan,
    name: 'Tournament & League Pass',
    priceINR: 4999,
    basePriceINR: 4236.44,
    gstINR: 762.56,
    unit: '30 days full broadcast suite',
    badge: 'Pro Enterprise',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    icon: Sparkles,
    popular: false,
    description: 'Complete month-long production suite with personalized team badges, multiple operator logins, and priority support.',
    features: [
      '30-Day Unrestricted Access across all devices',
      'Custom Team Badges & Logo Storage',
      'Multi-Operator Setup Profiles (Producer, Scorer, Graphics)',
      'Hostinger Cloud MySQL Automated Database Archival',
      'MarketinGlu High-Speed CDN Graphics Distribution',
      'Official B2B GST Tax Invoice + VIP SLA',
    ],
  },
];

export const PricingCards: React.FC<PricingCardsProps> = ({
  onPaymentSuccess,
  className = '',
  isModal = false,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PassPlan>('daily');
  const [gateway, setGateway] = useState<PaymentGateway>('razorpay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Customer & Billing Details
  const [customerName, setCustomerName] = useState('Broadcast Director');
  const [customerEmail, setCustomerEmail] = useState('broadcast@studio.live');
  const [customerPhone, setCustomerPhone] = useState('+91 98765 43210');

  // B2B GST Fields
  const [claimGst, setClaimGst] = useState(false);
  const [companyGstin, setCompanyGstin] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyState, setCompanyState] = useState('Delhi');
  const [companyStateCode, setCompanyStateCode] = useState('07');

  // Paytm QR Simulation Modal
  const [paytmModalData, setPaytmModalData] = useState<{
    orderId: string;
    amountINR: number;
    upiQrString: string;
  } | null>(null);

  // Completed License & Invoice Modal
  const [completedLicense, setCompletedLicense] = useState<BroadcastLicense | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    // Load Razorpay script dynamically if missing
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const activePlanData = PRICING_PLANS.find((p) => p.id === selectedPlan) || PRICING_PLANS[1];

  const handleCheckout = async (planToCheckout?: PassPlan) => {
    const plan = planToCheckout || selectedPlan;
    setSelectedPlan(plan);
    setLoading(true);
    setError(null);

    try {
      // 1. Create order on backend with selected gateway
      const orderData = await createPaymentOrder(
        plan,
        { name: customerName, email: customerEmail },
        gateway
      );

      const gstPayload = claimGst && companyGstin ? {
        buyerLegalName: companyName || customerName,
        buyerGstin: companyGstin.trim().toUpperCase(),
        buyerAddress: `${companyState}, India`,
        buyerState: companyState,
        buyerStateCode: companyStateCode,
      } : undefined;

      // 2. Route by Gateway
      if (gateway === 'paytm') {
        // Paytm Checkout / UPI Intent Modal
        setPaytmModalData({
          orderId: orderData.orderId,
          amountINR: orderData.amountINR,
          upiQrString: orderData.upiQrString || `upi://pay?pa=marketin.glu@paytm&pn=MarketinGlu&am=${orderData.amountINR}.00&cu=INR`,
        });
        setLoading(false);
      } else {
        // Razorpay Checkout
        if (window.Razorpay) {
          const options = {
            key: orderData.keyId,
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'MarketinGlu Broadcast OS',
            description: `Pass: ${plan.toUpperCase()} (₹${orderData.amountINR} incl. 18% GST)`,
            order_id: orderData.orderId,
            prefill: {
              name: customerName,
              email: customerEmail,
              contact: customerPhone,
            },
            notes: {
              gstin: companyGstin,
              sac: '998434',
            },
            theme: {
              color: '#06b6d4',
            },
            handler: async (response: any) => {
              try {
                const verifyRes = await verifyPayment({
                  gateway: 'razorpay',
                  razorpay_order_id: response.razorpay_order_id || orderData.orderId,
                  razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
                  razorpay_signature: response.razorpay_signature || 'sig_verified',
                  plan,
                  customerName,
                  customerEmail,
                  gstDetails: gstPayload,
                });

                setCompletedLicense(verifyRes.license);
                if (onPaymentSuccess) onPaymentSuccess(verifyRes.license);
              } catch (err: any) {
                setError(err.message || 'Payment verification failed');
              } finally {
                setLoading(false);
              }
            },
            modal: {
              ondismiss: () => {
                setLoading(false);
              },
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', (resp: any) => {
            setError(resp.error?.description || 'Razorpay payment rejected');
            setLoading(false);
          });
          rzp.open();
        } else {
          // Fallback test verification simulator if Razorpay external CDN blocked
          const verifyRes = await verifyPayment({
            gateway: 'razorpay',
            razorpay_order_id: orderData.orderId,
            razorpay_payment_id: `pay_sim_${Date.now()}`,
            razorpay_signature: 'sig_sim_valid',
            plan,
            customerName,
            customerEmail,
            gstDetails: gstPayload,
          });

          setCompletedLicense(verifyRes.license);
          if (onPaymentSuccess) onPaymentSuccess(verifyRes.license);
          setLoading(false);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Checkout initiation failed');
      setLoading(false);
    }
  };

  const handleCompletePaytmPayment = async () => {
    if (!paytmModalData) return;
    setLoading(true);
    setError(null);

    const gstPayload = claimGst && companyGstin ? {
      buyerLegalName: companyName || customerName,
      buyerGstin: companyGstin.trim().toUpperCase(),
      buyerAddress: `${companyState}, India`,
      buyerState: companyState,
      buyerStateCode: companyStateCode,
    } : undefined;

    try {
      const verifyRes = await verifyPayment({
        gateway: 'paytm',
        paytm_order_id: paytmModalData.orderId,
        paytm_txn_id: `ptm_txn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        plan: selectedPlan,
        customerName,
        customerEmail,
        gstDetails: gstPayload,
      });

      setCompletedLicense(verifyRes.license);
      setPaytmModalData(null);
      if (onPaymentSuccess) onPaymentSuccess(verifyRes.license);
    } catch (err: any) {
      setError(err.message || 'Paytm payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Gateway Selector & Security Trust Badge Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-[#0c1424]/80 border border-slate-800 rounded-2xl p-3.5 sm:p-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            Choose Payment Gateway:
          </span>
          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[#051122]/90 border border-cyan-500/30 shadow-inner backdrop-blur-md">
            <button
              type="button"
              onClick={() => setGateway('razorpay')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                gateway === 'razorpay'
                  ? 'border border-cyan-400 bg-cyan-950/70 text-white font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40 font-semibold'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
              <span>Razorpay (UPI / Cards)</span>
            </button>
            <button
              type="button"
              onClick={() => setGateway('paytm')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                gateway === 'paytm'
                  ? 'border border-cyan-400 bg-cyan-950/70 text-white font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40 font-semibold'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-sky-400" />
              <span>Paytm (Wallet / QR)</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-emerald-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>RBI Tokenized • 256-Bit SSL • SAC 998434 (18% GST)</span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {PRICING_PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          const Icon = plan.icon;

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative flex flex-col rounded-3xl p-6 transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-gradient-to-b from-[#0f1d38] via-[#0b162a] to-[#070d18] border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.25)] ring-2 ring-cyan-500/30'
                  : 'bg-gradient-to-b from-[#0c1424]/80 to-[#070b14]/80 border-slate-800/90 hover:border-slate-700 hover:bg-[#0e172a]/90'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-md text-[10px] font-mono font-black uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/30">
                  {plan.badge}
                </div>
              )}

              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  {!plan.popular && (
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold border mb-2 ${plan.badgeColor}`}>
                      {plan.badge}
                    </span>
                  )}
                  <h3 className="text-lg font-black text-white font-['Space_Grotesk',sans-serif]">
                    {plan.name}
                  </h3>
                </div>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              {/* Price Display */}
              <div className="mb-4 pb-4 border-b border-slate-800">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black text-white font-['Space_Grotesk',sans-serif] tracking-tight">
                    ₹{plan.priceINR}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    / {plan.id === 'hourly' ? 'hour' : plan.id === 'daily' ? '24 hours' : 'month'}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-cyan-400/90 mt-1 flex items-center justify-between">
                  <span>Base: ₹{plan.basePriceINR.toFixed(2)}</span>
                  <span>+18% GST: ₹{plan.gstINR.toFixed(2)}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                {plan.description}
              </p>

              {/* Feature Bullet List */}
              <div className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 text-emerald-400 stroke-[3]" />
                    </div>
                    <span className="leading-tight">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCheckout(plan.id);
                }}
                disabled={loading}
                className={`w-full py-3 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black shadow-lg shadow-cyan-500/25'
                    : 'bg-[#060a14] hover:bg-cyan-500/10 text-cyan-400 border border-slate-800 hover:border-cyan-500/40'
                }`}
              >
                {loading && selectedPlan === plan.id ? (
                  <span className="animate-spin w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full" />
                ) : (
                  <>
                    <span>Pay ₹{plan.priceINR} via {gateway === 'paytm' ? 'Paytm' : 'Razorpay'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Customer & Indian B2B GST Information Panel */}
      <div className="bg-gradient-to-br from-[#0c1424] via-[#090f1f] to-[#070b14] border border-slate-800 rounded-3xl p-6 shadow-xl mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Building className="w-5 h-5 text-cyan-400" />
            <div>
              <h4 className="text-sm font-bold text-white font-['Space_Grotesk',sans-serif]">
                Broadcaster Details &amp; GST B2B Invoicing (Optional)
              </h4>
              <p className="text-[11px] text-slate-400">
                Generate an official Indian GST Tax Invoice with your business GSTIN for 18% Input Tax Credit.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer bg-[#060a14] px-3.5 py-1.5 rounded-xl border border-slate-800">
            <input
              type="checkbox"
              checked={claimGst}
              onChange={(e) => setClaimGst(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 focus:ring-0 bg-slate-900 border-slate-700 cursor-pointer"
            />
            <span className="text-xs font-semibold text-cyan-300">
              Claim 18% GST Input Tax Credit
            </span>
          </label>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              Broadcaster / Contact Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
              placeholder="e.g. Rahul Verma"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              Billing Email (for Invoice Receipt)
            </label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
              placeholder="e.g. rahul@broadcaststudio.in"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              Contact Mobile / WhatsApp
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
              placeholder="e.g. +91 98765 43210"
            />
          </div>
        </div>

        {/* Conditional GSTIN Fields */}
        {claimGst && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-200">
            <div>
              <label className="block text-[11px] font-mono text-amber-300 mb-1">
                Company GSTIN (15 Digits)
              </label>
              <input
                type="text"
                value={companyGstin}
                onChange={(e) => setCompanyGstin(e.target.value.toUpperCase())}
                className="w-full bg-[#060a14] border border-amber-500/40 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs font-mono text-white uppercase outline-none"
                placeholder="e.g. 07AAAAA0000A1Z5"
                maxLength={15}
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Registered Company / Organization Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                placeholder="e.g. Verma Sports Media LLP"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                State of Registration (Place of Supply)
              </label>
              <select
                value={companyStateCode}
                onChange={(e) => {
                  setCompanyStateCode(e.target.value);
                  const states: Record<string, string> = {
                    '07': 'Delhi',
                    '27': 'Maharashtra',
                    '29': 'Karnataka',
                    '33': 'Tamil Nadu',
                    '09': 'Uttar Pradesh',
                    '19': 'West Bengal',
                    '24': 'Gujarat',
                    '06': 'Haryana',
                    '03': 'Punjab',
                    '36': 'Telangana',
                  };
                  setCompanyState(states[e.target.value] || 'Other');
                }}
                className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="07">[07] Delhi (CGST 9% + SGST 9%)</option>
                <option value="27">[27] Maharashtra (IGST 18%)</option>
                <option value="29">[29] Karnataka (IGST 18%)</option>
                <option value="33">[33] Tamil Nadu (IGST 18%)</option>
                <option value="09">[09] Uttar Pradesh (IGST 18%)</option>
                <option value="19">[19] West Bengal (IGST 18%)</option>
                <option value="24">[24] Gujarat (IGST 18%)</option>
                <option value="06">[06] Haryana (IGST 18%)</option>
                <option value="03">[03] Punjab (IGST 18%)</option>
                <option value="36">[36] Telangana (IGST 18%)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Completed License Success Banner */}
      {completedLicense && (
        <div className="mb-6 p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 to-[#070b14] border border-emerald-500/50 shadow-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="text-[11px] font-mono font-bold text-emerald-400 uppercase">
                PASS ACTIVATED SUCCESSFULLY • LIVE BROADCAST READY
              </div>
              <h4 className="text-lg font-black text-white font-['Space_Grotesk',sans-serif]">
                {completedLicense.plan.toUpperCase()} PASS — ₹{completedLicense.amount} (Order #{completedLicense.orderId})
              </h4>
              <p className="text-xs text-slate-300">
                Valid until {new Date(completedLicense.validUntil).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#060a14] border border-cyan-500/40 hover:bg-cyan-500/10 text-cyan-300 text-xs font-bold cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>View GST Tax Invoice</span>
            </button>
          </div>
        </div>
      )}

      {/* Paytm Modal Simulator with UPI QR Code */}
      {paytmModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-['Plus_Jakarta_Sans',sans-serif]">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#0c1424] via-[#090f1f] to-[#070b14] border border-sky-500/40 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Paytm Payment Gateway &amp; UPI</h3>
                  <span className="text-[10px] font-mono text-sky-400">ORDER: {paytmModalData.orderId}</span>
                </div>
              </div>
              <button
                onClick={() => setPaytmModalData(null)}
                className="p-1.5 rounded-lg bg-[#060a14] text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-6 text-center">
              <div className="inline-block p-4 bg-white rounded-2xl shadow-xl mb-4 border border-slate-300">
                <QrCode className="w-44 h-44 text-slate-950 mx-auto" />
                <div className="text-[10px] font-mono font-bold text-slate-700 mt-2">
                  SCAN WITH ANY UPI APP (PAYTM / GPAY / PHONEPE)
                </div>
              </div>

              <div className="text-xl font-black text-white font-['Space_Grotesk',sans-serif] mb-1">
                ₹{paytmModalData.amountINR}.00
              </div>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Scan via Paytm QR or click below to simulate instant gateway bank callback confirmation.
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleCompletePaytmPayment}
                disabled={loading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-sky-500/25 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Authorize &amp; Activate Pass (Paytm Success)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setPaytmModalData(null)}
                className="w-full py-2.5 rounded-lg bg-[#060a14] border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancel Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Indian GST Tax Invoice Modal */}
      {showInvoiceModal && completedLicense?.gstInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-['Plus_Jakarta_Sans',sans-serif]">
          <div className="relative w-full max-w-2xl bg-[#0a1120] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white font-['Space_Grotesk',sans-serif]">
                    TAX INVOICE / E-RECEIPT (RULE 46 OF CGST RULES, 2017)
                  </h3>
                  <span className="text-xs font-mono text-cyan-400">
                    INVOICE NO: {completedLicense.gstInvoice.invoiceNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="p-2 rounded-xl bg-[#060a14] text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invoice Printable Sheet */}
            <div className="mt-6 space-y-6 text-xs text-slate-300">
              {/* Supplier & Buyer Split */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-[#060a14] border border-slate-800">
                <div>
                  <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold mb-1">
                    SUPPLIER (DETAILS OF SERVICE PROVIDER)
                  </div>
                  <strong className="text-white text-sm block">MarketinGlu Technologies Private Limited</strong>
                  <div className="text-[11px] text-slate-400">Level 4, Statesman House, Barakhamba Road, Connaught Place, New Delhi - 110001, India</div>
                  <div className="text-[11px] font-mono text-slate-300 mt-1">
                    GSTIN: <strong className="text-cyan-400">07AAECM4920M1Z8</strong><br />
                    CIN: U72900DL2024PTC123456 • PAN: AAECM4920M
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold mb-1">
                    BUYER / RECIPIENT OF BROADCAST SERVICE
                  </div>
                  <strong className="text-white text-sm block">{completedLicense.gstInvoice.buyerLegalName}</strong>
                  <div className="text-[11px] text-slate-400">{completedLicense.gstInvoice.buyerAddress}</div>
                  <div className="text-[11px] font-mono text-slate-300 mt-1">
                    GSTIN: <strong className="text-amber-400">{completedLicense.gstInvoice.buyerGstin || 'URP (Unregistered Person)'}</strong><br />
                    State / Code: {completedLicense.gstInvoice.buyerState} [{completedLicense.gstInvoice.buyerStateCode}]
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#091122] text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Service Description</th>
                      <th className="p-3">SAC Code</th>
                      <th className="p-3 text-right">Taxable Base</th>
                      <th className="p-3 text-right">GST Rate</th>
                      <th className="p-3 text-right">Total (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-[#060a14]/60">
                    <tr>
                      <td className="p-3">
                        <div className="font-bold text-white">
                          MarketinGlu Broadcast OS - {completedLicense.plan.toUpperCase()} Pass
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Cloud real-time scorebug &amp; OBS streaming engine license
                        </div>
                      </td>
                      <td className="p-3 font-mono text-cyan-400">998434</td>
                      <td className="p-3 text-right font-mono">₹{completedLicense.gstInvoice.taxableAmount.toFixed(2)}</td>
                      <td className="p-3 text-right font-mono">18%</td>
                      <td className="p-3 text-right font-mono font-bold text-white">₹{completedLicense.amount}.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Tax Breakup */}
              <div className="p-4 rounded-2xl bg-[#060a14] border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Taxable Base Value:</span>
                  <span>₹{completedLicense.gstInvoice.taxableAmount.toFixed(2)}</span>
                </div>
                {completedLicense.gstInvoice.cgstAmount > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Central GST (CGST @ 9%):</span>
                    <span>₹{completedLicense.gstInvoice.cgstAmount.toFixed(2)}</span>
                  </div>
                )}
                {completedLicense.gstInvoice.sgstAmount > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>State GST (SGST @ 9%):</span>
                    <span>₹{completedLicense.gstInvoice.sgstAmount.toFixed(2)}</span>
                  </div>
                )}
                {completedLicense.gstInvoice.igstAmount > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Integrated GST (IGST @ 18%):</span>
                    <span>₹{completedLicense.gstInvoice.igstAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-slate-800">
                  <span>Total Gross Payable:</span>
                  <span className="text-cyan-400">₹{completedLicense.gstInvoice.totalAmount}.00</span>
                </div>
              </div>

              {/* Statutory Note */}
              <div className="text-[10px] text-slate-500 leading-relaxed font-mono">
                * This is a digitally generated tax invoice under Rule 46 of the Central Goods and Services Tax Rules, 2017. Tax is payable on reverse charge: NO. Payment verified via {completedLicense.gateway?.toUpperCase() || 'RAZORPAY'} (Ref: {completedLicense.paymentId}).
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-500/20"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save as PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
