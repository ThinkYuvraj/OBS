import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Building,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Scale,
  CheckCircle2,
  Printer,
  Download,
  Send,
  Clock,
  Search,
  Lock,
  PhoneCall,
  Mail,
  UserCheck,
  FileCheck,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import {
  fetchCompanyLegalInfo,
  submitGrievanceTicket,
  fetchGrievanceTickets,
  submitDpdpRequest,
  submitTakedownNotice,
} from '../services/api';
import { GrievanceRedressalTicket, DpdpDataRequest } from '../types/sports';
import emblemDarkImg from '../assets/images/marketinglu-emblem-dark.png';

interface LegalCompliancePageProps {
  onBack: () => void;
  onNavigate?: (tab: string) => void;
}

type TabType = 'entity' | 'grievance' | 'gst_invoice' | 'dpdp' | 'takedown' | 'terms' | 'refund';

export const LegalCompliancePage: React.FC<LegalCompliancePageProps> = ({
  onBack,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('entity');
  const [companyInfo, setCompanyInfo] = useState<any>(null);

  // Grievance Form State
  const [grievantName, setGrievantName] = useState('');
  const [grievantEmail, setGrievantEmail] = useState('');
  const [grievantPhone, setGrievantPhone] = useState('');
  const [grievantState, setGrievantState] = useState('Delhi');
  const [grievanceCategory, setGrievanceCategory] = useState('payment_dispute');
  const [grievanceSubject, setGrievanceSubject] = useState('');
  const [grievanceFacts, setGrievanceFacts] = useState('');
  const [grievanceRelief, setGrievanceRelief] = useState('');
  const [grievanceUrl, setGrievanceUrl] = useState('');
  const [submittingGrievance, setSubmittingGrievance] = useState(false);
  const [grievanceSuccessTicket, setGrievanceSuccessTicket] = useState<GrievanceRedressalTicket | null>(null);
  const [grievanceError, setGrievanceError] = useState<string | null>(null);

  // Track Grievance
  const [existingGrievances, setExistingGrievances] = useState<GrievanceRedressalTicket[]>([]);
  const [searchGrievanceId, setSearchGrievanceId] = useState('');

  // GST Invoice Form State
  const [gstCompanyName, setGstCompanyName] = useState('Sports Broadcasters Private Limited');
  const [gstGstin, setGstGstin] = useState('07AABCS1429B1Z2');
  const [gstPan, setGstPan] = useState('AABCS1429B');
  const [gstAddress, setGstAddress] = useState('Suite 201, Nehru Place, New Delhi - 110019');
  const [gstState, setGstState] = useState('Delhi');
  const [gstStateCode, setGstStateCode] = useState('07');
  const [gstPlan, setGstPlan] = useState<'hourly' | 'daily' | 'pro'>('daily');
  const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);

  // DPDP Form State
  const [dpdpName, setDpdpName] = useState('');
  const [dpdpEmail, setDpdpEmail] = useState('');
  const [dpdpPhone, setDpdpPhone] = useState('');
  const [dpdpType, setDpdpType] = useState('erasure');
  const [dpdpIdType, setDpdpIdType] = useState('pan');
  const [dpdpDetails, setDpdpDetails] = useState('');
  const [dpdpSubmitted, setDpdpSubmitted] = useState<DpdpDataRequest | null>(null);

  // Takedown Form State
  const [takedownOwner, setTakedownOwner] = useState('');
  const [takedownAgent, setTakedownAgent] = useState('');
  const [takedownEmail, setTakedownEmail] = useState('');
  const [takedownWork, setTakedownWork] = useState('');
  const [takedownUrl, setTakedownUrl] = useState('');
  const [takedownDeclaration, setTakedownDeclaration] = useState(false);
  const [takedownSuccess, setTakedownSuccess] = useState<any>(null);

  useEffect(() => {
    fetchCompanyLegalInfo()
      .then((res) => setCompanyInfo(res.company))
      .catch(console.error);

    fetchGrievanceTickets()
      .then((res) => setExistingGrievances(res.grievances))
      .catch(console.error);
  }, []);

  const handleGrievanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingGrievance(true);
    setGrievanceError(null);

    try {
      const res = await submitGrievanceTicket({
        category: grievanceCategory,
        complainantName: grievantName,
        complainantEmail: grievantEmail,
        complainantPhone: grievantPhone,
        complainantState: grievantState,
        subject: grievanceSubject,
        statementOfFacts: grievanceFacts,
        reliefSought: grievanceRelief,
        referenceUrl: grievanceUrl,
      });

      setGrievanceSuccessTicket(res.ticket);
      setExistingGrievances((prev) => [res.ticket, ...prev]);
      setGrievanceSubject('');
      setGrievanceFacts('');
      setGrievanceRelief('');
    } catch (err: any) {
      setGrievanceError(err.message || 'Failed to submit grievance');
    } finally {
      setSubmittingGrievance(false);
    }
  };

  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const amountINR = gstPlan === 'hourly' ? 499 : gstPlan === 'daily' ? 1699 : 4999;
    const taxableBase = Math.round((amountINR / 1.18) * 100) / 100;
    const totalGst = Math.round((amountINR - taxableBase) * 100) / 100;
    const isIntraState = gstStateCode === '07';
    const cgst = isIntraState ? Math.round((totalGst / 2) * 100) / 100 : 0;
    const sgst = isIntraState ? Math.round((totalGst / 2) * 100) / 100 : 0;
    const igst = !isIntraState ? totalGst : 0;

    setGeneratedInvoice({
      invoiceNumber: `MKT-GST-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      buyerName: gstCompanyName,
      buyerGstin: gstGstin.toUpperCase(),
      buyerPan: gstPan.toUpperCase(),
      buyerAddress: gstAddress,
      buyerState: `${gstState} [${gstStateCode}]`,
      plan: gstPlan.toUpperCase(),
      taxableBase,
      cgst,
      sgst,
      igst,
      totalAmount: amountINR,
    });
  };

  const handleDpdpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await submitDpdpRequest({
        applicantName: dpdpName,
        applicantEmail: dpdpEmail,
        applicantPhone: dpdpPhone,
        requestType: dpdpType,
        identityProofType: dpdpIdType,
        requestDetails: dpdpDetails,
      });
      setDpdpSubmitted(res.request);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleTakedownSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!takedownDeclaration) {
      alert('Please accept the statutory good faith declaration before submitting.');
      return;
    }
    try {
      const res = await submitTakedownNotice({
        copyrightOwner: takedownOwner,
        authorizedAgent: takedownAgent,
        contactEmail: takedownEmail,
        workDescription: takedownWork,
        infringingUrl: takedownUrl,
        goodFaithDeclaration: takedownDeclaration,
      });
      setTakedownSuccess(res.notice);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 pb-24 w-full overflow-x-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header */}
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
                <div className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <Scale className="w-3.5 h-3.5" />
                  <span>LEGAL COMPLIANCE CELL • REPUBLIC OF INDIA STATUTORY REGIME</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Space_Grotesk',sans-serif]">
                  Indian Laws Compliance, Disclosures &amp; Grievance Redressal
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
              ✓ IT Rules 2021 &amp; DPDP Act 2023 Certified
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar border-b border-slate-800/80">
          {[
            { id: 'entity' as TabType, label: 'Company Disclosures (Rule 5)', icon: Building },
            { id: 'grievance' as TabType, label: 'Statutory Grievance Form', icon: AlertTriangle },
            { id: 'gst_invoice' as TabType, label: 'GST Tax Invoicing (Rule 46)', icon: FileText },
            { id: 'dpdp' as TabType, label: 'DPDP Act 2023 Rights', icon: ShieldCheck },
            { id: 'takedown' as TabType, label: 'Copyright & Takedown Form', icon: Scale },
            { id: 'terms' as TabType, label: 'Indian Jurisdiction Terms', icon: FileCheck },
            { id: 'refund' as TabType, label: 'Refund & Expiry Norms', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                    : 'bg-[#0d1527]/70 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: Company Legal Entity Disclosures (Rule 5 Consumer Protection E-Commerce Rules, 2020) */}
        {activeTab === 'entity' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-gradient-to-br from-[#0c1424] via-[#090f1f] to-[#070b14] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">
                    MANDATORY CORPORATE DISCLOSURE • RULE 5 OF CONSUMER PROTECTION (E-COMMERCE) RULES, 2020
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white font-['Space_Grotesk',sans-serif]">
                    MarketinGlu Technologies Private Limited
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Incorporated under the Companies Act, 2013 • Regulated by the Ministry of Corporate Affairs, Government of India.
                  </p>
                </div>
                <div className="hidden sm:block px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold">
                  ACTIVE CORPORATE ENTITY
                </div>
              </div>

              {/* Entity Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-6 border-b border-slate-800 text-xs">
                <div className="p-4 rounded-2xl bg-[#060a14] border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold mb-1">
                    Corporate Identity Number (CIN)
                  </div>
                  <div className="text-sm font-mono font-bold text-white">U72900DL2024PTC123456</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">MCA RoC New Delhi Registered</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#060a14] border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold mb-1">
                    Goods &amp; Services Tax Identification (GSTIN)
                  </div>
                  <div className="text-sm font-mono font-bold text-cyan-400">07AAECM4920M1Z8</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">State Code: 07 (Delhi) • Active Regular</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#060a14] border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold mb-1">
                    Permanent Account Number (PAN)
                  </div>
                  <div className="text-sm font-mono font-bold text-white">AAECM4920M</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Income Tax Department, Govt of India</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#060a14] border border-slate-800 sm:col-span-2">
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold mb-1">
                    Registered Corporate Office Address
                  </div>
                  <div className="text-xs font-semibold text-white">
                    Level 4, Statesman House, Barakhamba Road, Connaught Place, New Delhi - 110001, NCT of Delhi, Republic of India
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Official place of service of summons, legal notices, and regulatory correspondence.
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#060a14] border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold mb-1">
                    Service Accounting Code (SAC)
                  </div>
                  <div className="text-sm font-mono font-bold text-amber-400">998434</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Cloud Broadcasting Software &amp; Transmission</div>
                </div>
              </div>

              {/* Statutory Officers (Rule 3(2) and Rule 3(b) of IT Rules, 2021) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                {/* Grievance Officer */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c172e] to-[#070b14] border border-cyan-500/40">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase mb-2">
                    <UserCheck className="w-4 h-4" />
                    <span>Statutory Grievance Redressal Officer (Rule 3(2))</span>
                  </div>
                  <div className="text-base font-bold text-white">Mr. Advait Sharma</div>
                  <div className="text-xs text-slate-300 font-medium">Advocate &amp; Head of Legal Compliance</div>
                  <div className="text-xs text-slate-400 mt-3 space-y-1 font-mono">
                    <div>📧 Email: <a href="mailto:grievance@marketinglu.com" className="text-cyan-400 hover:underline">grievance@marketinglu.com</a></div>
                    <div>📞 Hotline: +91 98110-02941 / +91 (011) 4892-0199</div>
                    <div>⏱ Working Hours: Mon–Fri, 09:30 AM to 06:30 PM IST</div>
                    <div className="text-emerald-400 pt-1">✓ Statutory SLA: Acknowledgment within 24h • Resolution within 15 days</div>
                  </div>
                </div>

                {/* Nodal Contact Person for Law Enforcement */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#121929] to-[#070b14] border border-slate-700">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase mb-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>24x7 Nodal Contact Person (Rule 3(b))</span>
                  </div>
                  <div className="text-base font-bold text-white">Mr. Rajeshwar Mehra</div>
                  <div className="text-xs text-slate-300 font-medium">Nodal Officer for Law Enforcement Coordination</div>
                  <div className="text-xs text-slate-400 mt-3 space-y-1 font-mono">
                    <div>📧 Email: <a href="mailto:nodal.officer@marketinglu.com" className="text-amber-400 hover:underline">nodal.officer@marketinglu.com</a></div>
                    <div>📞 24x7 Dispatch: +91 98110-02942</div>
                    <div>🏢 Purpose: Direct point of contact for CERT-In, Police Cyber Cells &amp; Courts</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Statutory Grievance Redressal Form (Rule 3(2) IT Rules 2021) */}
        {activeTab === 'grievance' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="bg-gradient-to-br from-[#0c1424] via-[#090f1f] to-[#070b14] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="mb-6 pb-4 border-b border-slate-800">
                <div className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">
                  OFFICIAL STATUTORY FILING • RULE 3(2) IT RULES 2021 &amp; CONSUMER PROTECTION ACT 2019
                </div>
                <h3 className="text-xl font-black text-white font-['Space_Grotesk',sans-serif]">
                  Grievance Redressal Submission Portal
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  As required by Indian Information Technology (Intermediary Guidelines) Rules, any citizen, streamer, or copyright holder can file a formal grievance. Every ticket receives an automated statutory receipt within 24 hours and a formal written resolution within 15 days.
                </p>
              </div>

              {grievanceSuccessTicket ? (
                <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                    <div>
                      <h4 className="text-base font-bold text-white">
                        Statutory Grievance Registered Successfully!
                      </h4>
                      <p className="text-xs text-slate-300">
                        Formal reference ticket number: <strong className="text-cyan-400 font-mono">{grievanceSuccessTicket.id}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#060a14] border border-slate-800 text-xs font-mono">
                    <div>
                      <span className="text-slate-400 block">Acknowledged At:</span>
                      <span className="text-emerald-400">
                        {new Date(grievanceSuccessTicket.acknowledgedAt).toLocaleString('en-IN')} IST
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Mandated Resolution By:</span>
                      <span className="text-amber-400">
                        {new Date(grievanceSuccessTicket.resolutionDueBy).toLocaleDateString('en-IN')} (Within 15 Days)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Assigned Officer:</span>
                      <span className="text-white">{grievanceSuccessTicket.assignedOfficer}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setGrievanceSuccessTicket(null)}
                    className="px-4 py-2 rounded-xl bg-[#060a14] border border-slate-700 text-xs font-semibold text-white hover:border-cyan-400 cursor-pointer"
                  >
                    Submit Another Grievance
                  </button>
                </div>
              ) : (
                <form onSubmit={handleGrievanceSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        Complainant Full Legal Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={grievantName}
                        onChange={(e) => setGrievantName(e.target.value)}
                        placeholder="e.g. Ramesh Chandra"
                        className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        Complainant Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={grievantEmail}
                        onChange={(e) => setGrievantEmail(e.target.value)}
                        placeholder="e.g. ramesh@broadcasters.in"
                        className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        Mobile Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={grievantPhone}
                        onChange={(e) => setGrievantPhone(e.target.value)}
                        placeholder="e.g. +91 98123 45678"
                        className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        State of Residence *
                      </label>
                      <select
                        value={grievantState}
                        onChange={(e) => setGrievantState(e.target.value)}
                        className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      >
                        <option value="Delhi">Delhi (NCT)</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="West Bengal">West Bengal</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Haryana">Haryana</option>
                        <option value="Other">Other State / UT</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        Grievance Category (under IT Rules) *
                      </label>
                      <select
                        value={grievanceCategory}
                        onChange={(e) => setGrievanceCategory(e.target.value)}
                        className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      >
                        <option value="payment_dispute">Billing, Razorpay, or Paytm Transaction Dispute</option>
                        <option value="privacy_dpdp">DPDP Act Privacy / Personal Data Breach</option>
                        <option value="copyright_infringement">Copyright / Unauthorized Match Broadcast</option>
                        <option value="content_violation">Defamatory or Unlawful Match Overlay Content</option>
                        <option value="intermediary_compliance">General Intermediary Compliance Issue</option>
                        <option value="other">Other Statutory Dispute</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        Subject / Brief Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={grievanceSubject}
                        onChange={(e) => setGrievanceSubject(e.target.value)}
                        placeholder="e.g. Unresolved Razorpay Order Refund on 24-Hour Pass"
                        className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Statement of Facts &amp; Precise Details *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={grievanceFacts}
                      onChange={(e) => setGrievanceFacts(e.target.value)}
                      placeholder="Clearly provide dates, order numbers, match URLs, and the exact sequence of facts forming the grievance..."
                      className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        Relief Sought / Expected Remedial Action *
                      </label>
                      <input
                        type="text"
                        required
                        value={grievanceRelief}
                        onChange={(e) => setGrievanceRelief(e.target.value)}
                        placeholder="e.g. Pass validity extension of 24h or full monetary refund"
                        className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        Reference URL / Evidence Link (Optional)
                      </label>
                      <input
                        type="url"
                        value={grievanceUrl}
                        onChange={(e) => setGrievanceUrl(e.target.value)}
                        placeholder="https://yourstream.live or overlay token link"
                        className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>
                  </div>

                  {grievanceError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                      {grievanceError}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submittingGrievance}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 cursor-pointer flex items-center gap-2"
                    >
                      {submittingGrievance ? (
                        <span className="animate-spin w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Statutory Grievance to Legal Cell</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Grievance Tracking Desk */}
            <div className="bg-[#0c1424] border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-white">Track Filed Grievances</h4>
                  <p className="text-xs text-slate-400">
                    Search and inspect status of previously submitted statutory complaints.
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchGrievanceId}
                    onChange={(e) => setSearchGrievanceId(e.target.value)}
                    placeholder="Search Ticket ID (e.g. IN-GRV-)..."
                    className="w-full bg-[#060a14] border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {existingGrievances.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No grievances currently registered.
                </div>
              ) : (
                <div className="divide-y divide-slate-800 text-xs">
                  {existingGrievances
                    .filter((g) => !searchGrievanceId || g.id.toLowerCase().includes(searchGrievanceId.toLowerCase()) || g.subject.toLowerCase().includes(searchGrievanceId.toLowerCase()))
                    .map((g) => (
                      <div key={g.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-cyan-400">{g.id}</span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 uppercase">
                              {g.status}
                            </span>
                          </div>
                          <div className="font-semibold text-white mt-0.5">{g.subject}</div>
                          <div className="text-[11px] text-slate-400">
                            Filed by {g.complainantName} ({g.complainantEmail}) • Assigned to: {g.assignedOfficer}
                          </div>
                        </div>
                        <div className="text-right font-mono text-[11px] text-slate-400">
                          <div>Ack: {new Date(g.acknowledgedAt).toLocaleDateString('en-IN')}</div>
                          <div className="text-emerald-400">Target: {new Date(g.resolutionDueBy).toLocaleDateString('en-IN')}</div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: GST Tax Invoicing Form (Rule 46 CGST Rules, 2017) */}
        {activeTab === 'gst_invoice' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="bg-gradient-to-br from-[#0c1424] via-[#090f1f] to-[#070b14] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="mb-6 pb-4 border-b border-slate-800">
                <div className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">
                  OFFICIAL TAX INVOICE GENERATOR • SAC CODE 998434 (18% GST)
                </div>
                <h3 className="text-xl font-black text-white font-['Space_Grotesk',sans-serif]">
                  Indian GST Tax Invoice &amp; B2B ITC Compliance Form
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  Indian Goods &amp; Services Tax registered entities (LLPs, Pvt Ltd, Proprietorships) can enter their GSTIN to receive an automated Rule 46 compliant Tax Invoice for claiming 18% Input Tax Credit (ITC) against software streaming expenses.
                </p>
              </div>

              <form onSubmit={handleGenerateInvoice} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-cyan-400 mb-1">
                      Buyer Legal Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={gstCompanyName}
                      onChange={(e) => setGstCompanyName(e.target.value)}
                      className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-amber-300 mb-1">
                      15-Digit Company GSTIN *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={15}
                      value={gstGstin}
                      onChange={(e) => setGstGstin(e.target.value.toUpperCase())}
                      className="w-full bg-[#060a14] border border-amber-500/40 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs font-mono uppercase text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      10-Digit Company PAN *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={gstPan}
                      onChange={(e) => setGstPan(e.target.value.toUpperCase())}
                      className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs font-mono uppercase text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Principal Place of Business (Billing Address) *
                    </label>
                    <input
                      type="text"
                      required
                      value={gstAddress}
                      onChange={(e) => setGstAddress(e.target.value)}
                      className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      State / Place of Supply *
                    </label>
                    <select
                      value={gstStateCode}
                      onChange={(e) => {
                        setGstStateCode(e.target.value);
                        const names: Record<string, string> = {
                          '07': 'Delhi',
                          '27': 'Maharashtra',
                          '29': 'Karnataka',
                          '33': 'Tamil Nadu',
                          '09': 'Uttar Pradesh',
                          '19': 'West Bengal',
                        };
                        setGstState(names[e.target.value] || 'Outstation');
                      }}
                      className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    >
                      <option value="07">[07] Delhi (Intra-state: CGST 9% + SGST 9%)</option>
                      <option value="27">[27] Maharashtra (Inter-state: IGST 18%)</option>
                      <option value="29">[29] Karnataka (Inter-state: IGST 18%)</option>
                      <option value="33">[33] Tamil Nadu (Inter-state: IGST 18%)</option>
                      <option value="09">[09] Uttar Pradesh (Inter-state: IGST 18%)</option>
                      <option value="19">[19] West Bengal (Inter-state: IGST 18%)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Broadcast Pass Plan *
                    </label>
                    <select
                      value={gstPlan}
                      onChange={(e) => setGstPlan(e.target.value as any)}
                      className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    >
                      <option value="hourly">Hourly Broadcast Pass — ₹499 (Single Match)</option>
                      <option value="daily">24-Hour Day Pass — ₹1,699 (Tournament Day)</option>
                      <option value="pro">30-Day Pro Season Pass — ₹4,999 (Enterprise)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md shadow-cyan-500/20 cursor-pointer flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Generate &amp; Preview Official GST Tax Invoice</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Generated Invoice Preview Card */}
            {generatedInvoice && (
              <div className="bg-[#0a1120] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                      OFFICIAL TAX INVOICE (RULE 46 OF CGST RULES, 2017)
                    </div>
                    <div className="text-base font-bold text-white">
                      INVOICE #{generatedInvoice.invoiceNumber}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">Date: {generatedInvoice.date}</div>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-500/20"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Tax Invoice</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 p-4 rounded-2xl bg-[#060a14] border border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block mb-1">
                      SUPPLIER (MARKETINGLU TECHNOLOGIES PVT LTD)
                    </span>
                    <strong className="text-white block">Level 4, Statesman House, Connaught Place, New Delhi - 110001</strong>
                    <div className="font-mono text-slate-300 mt-1">
                      GSTIN: <strong className="text-cyan-400">07AAECM4920M1Z8</strong> • PAN: AAECM4920M
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block mb-1">
                      BUYER (BILL TO PARTY)
                    </span>
                    <strong className="text-white block">{generatedInvoice.buyerName}</strong>
                    <div className="text-slate-400">{generatedInvoice.buyerAddress}</div>
                    <div className="font-mono text-slate-300 mt-1">
                      GSTIN: <strong className="text-amber-400">{generatedInvoice.buyerGstin}</strong> • State: {generatedInvoice.buyerState}
                    </div>
                  </div>
                </div>

                <div className="border border-slate-800 rounded-2xl overflow-hidden mb-6">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#091122] text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="p-3">Description of Software Service</th>
                        <th className="p-3">SAC</th>
                        <th className="p-3 text-right">Taxable Base (INR)</th>
                        <th className="p-3 text-right">Tax Rates</th>
                        <th className="p-3 text-right">Gross Total (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-[#060a14]/60 divide-y divide-slate-800">
                      <tr>
                        <td className="p-3">
                          <strong className="text-white block">MarketinGlu Broadcast OS - {generatedInvoice.plan} Pass</strong>
                          <span className="text-[10px] text-slate-400">Live graphics scorebug and cloud streaming subscription</span>
                        </td>
                        <td className="p-3 font-mono text-cyan-400">998434</td>
                        <td className="p-3 text-right font-mono">₹{generatedInvoice.taxableBase.toFixed(2)}</td>
                        <td className="p-3 text-right font-mono">18% GST</td>
                        <td className="p-3 text-right font-mono font-bold text-white">₹{generatedInvoice.totalAmount}.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-4 rounded-2xl bg-[#060a14] border border-slate-800 font-mono text-xs space-y-1.5 max-w-sm ml-auto">
                  <div className="flex justify-between text-slate-400">
                    <span>Taxable Base:</span>
                    <span>₹{generatedInvoice.taxableBase.toFixed(2)}</span>
                  </div>
                  {generatedInvoice.cgst > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>CGST (9%):</span>
                      <span>₹{generatedInvoice.cgst.toFixed(2)}</span>
                    </div>
                  )}
                  {generatedInvoice.sgst > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>SGST (9%):</span>
                      <span>₹{generatedInvoice.sgst.toFixed(2)}</span>
                    </div>
                  )}
                  {generatedInvoice.igst > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>IGST (18%):</span>
                      <span>₹{generatedInvoice.igst.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-slate-800">
                    <span>Invoice Total:</span>
                    <span className="text-cyan-400">₹{generatedInvoice.totalAmount}.00</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DPDP Act 2023 Data Principal Rights Form */}
        {activeTab === 'dpdp' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-gradient-to-br from-[#0c1424] via-[#090f1f] to-[#070b14] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="mb-6 pb-4 border-b border-slate-800">
                <div className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">
                  DIGITAL PERSONAL DATA PROTECTION ACT, 2023 • SECTION 12 DATA PRINCIPAL RIGHTS
                </div>
                <h3 className="text-xl font-black text-white font-['Space_Grotesk',sans-serif]">
                  Data Principal Access, Erasure &amp; Consent Management Form
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  Under the DPDP Act 2023 enacted by the Parliament of India, you hold the legal right to access your personal data, seek correction, withdraw consent, or request complete erasure of match logs and profile records from our databases.
                </p>
              </div>

              {dpdpSubmitted ? (
                <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>DPDP Request Received (Reference: {dpdpSubmitted.id})</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Your request under Section 12 of the DPDP Act has been forwarded to our Data Protection Officer. We shall verify your identity and process the request within the statutory window.
                  </p>
                  <button
                    onClick={() => setDpdpSubmitted(null)}
                    className="px-4 py-2 rounded-xl bg-[#060a14] border border-slate-800 text-xs font-semibold text-white"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleDpdpSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        Applicant Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={dpdpName}
                        onChange={(e) => setDpdpName(e.target.value)}
                        placeholder="e.g. Anand Kumar"
                        className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        Registered Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={dpdpEmail}
                        onChange={(e) => setDpdpEmail(e.target.value)}
                        placeholder="e.g. anand@studio.in"
                        className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        Contact Mobile *
                      </label>
                      <input
                        type="tel"
                        required
                        value={dpdpPhone}
                        onChange={(e) => setDpdpPhone(e.target.value)}
                        placeholder="+91 98111 22334"
                        className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        Statutory Right Invoked *
                      </label>
                      <select
                        value={dpdpType}
                        onChange={(e) => setDpdpType(e.target.value)}
                        className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      >
                        <option value="erasure">Right to Erasure (Delete my account, matches &amp; billing logs)</option>
                        <option value="access">Right to Access (Provide summary of personal data processed)</option>
                        <option value="correction">Right to Correction (Rectify inaccurate profile data)</option>
                        <option value="consent_withdrawal">Withdrawal of Consent for Processing</option>
                        <option value="nomination">Nominate a Representative in event of death/incapacity</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        Identity Verification Document Type *
                      </label>
                      <select
                        value={dpdpIdType}
                        onChange={(e) => setDpdpIdType(e.target.value)}
                        className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      >
                        <option value="pan">Permanent Account Number (PAN)</option>
                        <option value="aadhaar_masked">Masked Aadhaar (Last 4 Digits only)</option>
                        <option value="voter_id">Voter ID (EPIC)</option>
                        <option value="passport">Indian Passport</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Details of Request &amp; Specific Data Items *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={dpdpDetails}
                      onChange={(e) => setDpdpDetails(e.target.value)}
                      placeholder="Specify the exact email account, tournament IDs, or logs you wish to access or delete..."
                      className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md shadow-cyan-500/20 cursor-pointer flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit DPDP Request to Data Protection Officer</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: Indian Copyright Act Section 37 Broadcast Takedown Form */}
        {activeTab === 'takedown' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-gradient-to-br from-[#0c1424] via-[#090f1f] to-[#070b14] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="mb-6 pb-4 border-b border-slate-800">
                <div className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">
                  INDIAN COPYRIGHT ACT 1957 (SECTION 37) &amp; IT RULES 2021 RULE 3(1)(D)
                </div>
                <h3 className="text-xl font-black text-white font-['Space_Grotesk',sans-serif]">
                  Broadcast Reproduction Rights &amp; Content Takedown Notice
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  MarketinGlu respects Intellectual Property Rights and Broadcast Reproduction Rights under Section 37 of the Copyright Act, 1957. Rights holders (ICC, BCCI, FIFA, etc.) can issue takedown notices for unauthorized stream feeds or graphics overlays.
                </p>
              </div>

              {takedownSuccess ? (
                <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Takedown Notice Registered (#{takedownSuccess.id})</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Our Legal NOC has logged the takedown notice. The stream URL will be investigated and incapacitated within 24 to 36 hours in accordance with Rule 3(1)(d).
                  </p>
                  <button
                    onClick={() => setTakedownSuccess(null)}
                    className="px-4 py-2 rounded-xl bg-[#060a14] border border-slate-800 text-xs font-semibold text-white"
                  >
                    Submit Another Notice
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTakedownSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        Copyright / Broadcast Rights Owner *
                      </label>
                      <input
                        type="text"
                        required
                        value={takedownOwner}
                        onChange={(e) => setTakedownOwner(e.target.value)}
                        placeholder="e.g. Star India Pvt Ltd / ICC"
                        className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        Authorized Legal Representative
                      </label>
                      <input
                        type="text"
                        value={takedownAgent}
                        onChange={(e) => setTakedownAgent(e.target.value)}
                        placeholder="e.g. Sharma &amp; Associates (Attorneys)"
                        className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        Official Legal Contact Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={takedownEmail}
                        onChange={(e) => setTakedownEmail(e.target.value)}
                        placeholder="legal@rightsholder.com"
                        className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        Description of Protected Broadcast Work *
                      </label>
                      <input
                        type="text"
                        required
                        value={takedownWork}
                        onChange={(e) => setTakedownWork(e.target.value)}
                        placeholder="e.g. Live Broadcast of ICC Champions Trophy match"
                        className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        Infringing Overlay or Feed URL *
                      </label>
                      <input
                        type="url"
                        required
                        value={takedownUrl}
                        onChange={(e) => setTakedownUrl(e.target.value)}
                        placeholder="https://.../overlay/token_xxx or YouTube live link"
                        className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#060a14] border border-slate-800 flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="goodFaith"
                      checked={takedownDeclaration}
                      onChange={(e) => setTakedownDeclaration(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 cursor-pointer"
                    />
                    <label htmlFor="goodFaith" className="text-xs text-slate-300 leading-relaxed cursor-pointer">
                      I solemnly affirm and declare under penalty of perjury under Indian law that I am the copyright owner or authorized agent, and I have a good faith belief that the contested broadcast overlay or transmission feed has not been authorized by the rights owner.
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-rose-500/20 cursor-pointer flex items-center gap-2"
                  >
                    <Scale className="w-4 h-4" />
                    <span>Issue Formal Statutory Takedown Notice</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: Indian Jurisdiction Terms */}
        {activeTab === 'terms' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-gradient-to-br from-[#0c1424] via-[#090f1f] to-[#070b14] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-xs text-slate-300 leading-relaxed space-y-4">
              <h3 className="text-lg font-black text-white font-['Space_Grotesk',sans-serif]">
                Terms of Service &amp; E-Commerce User Agreement (Indian Jurisdiction)
              </h3>
              <p>
                This User Agreement is an electronic contract generated under the Information Technology Act, 2000 and the Indian Contract Act, 1872. By subscribing to an Hourly Pass (₹499) or Day Pass (₹1,699), you unconditionally agree to these terms.
              </p>
              <div className="p-4 rounded-2xl bg-[#060a14] border border-slate-800 space-y-2">
                <strong className="text-white block">1. Governing Law &amp; Exclusive Jurisdiction:</strong>
                <div>This Agreement shall be construed, interpreted, and governed in accordance with the substantive laws of the Republic of India. The courts of competent jurisdiction located at New Delhi, India shall have exclusive jurisdiction over all disputes arising hereunder.</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#060a14] border border-slate-800 space-y-2">
                <strong className="text-white block">2. Arbitration:</strong>
                <div>Any claim or dispute between the parties shall be referred to and finally resolved by sole arbitration under the Arbitration and Conciliation Act, 1996. The seat and venue of arbitration shall be New Delhi. The language shall be English.</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: Refund & Expiry Norms */}
        {activeTab === 'refund' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-gradient-to-br from-[#0c1424] via-[#090f1f] to-[#070b14] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-xs text-slate-300 leading-relaxed space-y-4">
              <h3 className="text-lg font-black text-white font-['Space_Grotesk',sans-serif]">
                Refund, Cancellation &amp; Pass Expiry Policy (Indian Consumer Protection Act, 2019)
              </h3>
              <p>
                In compliance with the Consumer Protection (E-Commerce) Rules, 2020, MarketinGlu provides complete clarity regarding digital software passes:
              </p>
              <div className="p-4 rounded-2xl bg-[#060a14] border border-slate-800 space-y-2">
                <strong className="text-white block">1. Instant Activation:</strong>
                <div>Hourly Passes (₹499/hr) and Day Passes (₹1,699/day) activate instantly upon bank authorization via Razorpay or Paytm. Once engine broadcast credits are consumed, digital delivery is deemed completed.</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#060a14] border border-slate-800 space-y-2">
                <strong className="text-white block">2. Technical Failure Compensation:</strong>
                <div>If a broadcast is interrupted due to internal server failure or network latency exceeding 3 seconds, a replacement pass of equal or greater duration will be credited to the operator immediately upon submitting a ticket.</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
