import React, { useState, useEffect, useRef } from 'react';
import {
  LifeBuoy,
  Mail,
  Send,
  Upload,
  X,
  Camera,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Paperclip,
  Clock,
  ShieldAlert,
  HelpCircle,
  Radio,
  FileQuestion,
  RefreshCw,
  Sparkles,
  WifiOff,
  Calculator,
  Layout,
  CreditCard,
  Database,
  Video,
} from 'lucide-react';
import { IssueCategory, IssueUrgency, ScreenshotAttachment, SportType, SupportTicket } from '../../types/sports';
import { submitSupportTicket, fetchSupportTickets } from '../../services/api';
import { MarketingluLoadingScreen } from './MarketingluLoadingScreen';

interface HelpDeskModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Live Match Context (optional, passed if reporting during a match)
  matchId?: string;
  matchName?: string;
  sport?: SportType;
  overlayToken?: string;
}

const SUPPORT_EMAIL = 'support@marketinglu.com';
const ESCALATION_EMAIL = 'escalations@marketinglu.com';

const ISSUE_CATEGORIES: { id: IssueCategory; label: string; icon: any; hint: string }[] = [
  {
    id: 'obs_not_updating',
    label: 'OBS Overlay Not Updating / WebSocket Disconnected',
    icon: WifiOff,
    hint: 'Scoreboard freeze, stream delay, or WebSocket reconnecting loop in OBS',
  },
  {
    id: 'score_discrepancy',
    label: 'Score Calculation, Strike Rotation or Rule Discrepancy',
    icon: Calculator,
    hint: 'Batting strike, overs count, basketball shot clock, or foul calculation error',
  },
  {
    id: 'graphic_glitch',
    label: 'Overlay Graphic Bug, Clipping or Positioning Glitch',
    icon: Layout,
    hint: 'Text cutoff, transparency issues, alignment, or theme rendering error',
  },
  {
    id: 'timer_stalled',
    label: 'Match Clock, Shot Clock or Raid Timer Stalled',
    icon: Clock,
    hint: 'Stoppage time, basketball 24s timer, or kabaddi 30s raid countdown stalled',
  },
  {
    id: 'billing_license',
    label: 'Razorpay Billing, Payment or License Pass Issue',
    icon: CreditCard,
    hint: 'Hourly pass (₹499) or daily pass (₹1,699) not reflecting active status',
  },
  {
    id: 'database_sync',
    label: 'Hostinger Database Sync or phpMyAdmin Export Error',
    icon: Database,
    hint: 'MySQL connection timeout, schema mismatch, or DDL export error',
  },
  {
    id: 'video_ingestion',
    label: 'Live Video Feed or Camera Source Ingestion Failure',
    icon: Video,
    hint: 'YouTube live, RTMP uplink, or stadium stream feed embed not loading',
  },
  {
    id: 'other',
    label: 'Other Issue or Custom Inquiry',
    icon: HelpCircle,
    hint: 'Specify your unique technical question or feature request',
  },
];

export const HelpDeskModal: React.FC<HelpDeskModalProps> = ({
  isOpen,
  onClose,
  matchId,
  matchName,
  sport,
  overlayToken,
}) => {
  const [activeTab, setActiveTab] = useState<'report' | 'tickets' | 'faq'>('report');
  const [category, setCategory] = useState<IssueCategory>('obs_not_updating');
  const [customCategoryTitle, setCustomCategoryTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<IssueUrgency>(matchId ? 'high' : 'medium');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [screenshots, setScreenshots] = useState<ScreenshotAttachment[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<{
    ticket: SupportTicket;
    mailtoLink: string;
    message: string;
  } | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [existingTickets, setExistingTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing tickets if tickets tab is opened
  useEffect(() => {
    if (activeTab === 'tickets') {
      setLoadingTickets(true);
      fetchSupportTickets()
        .then((res) => {
          setExistingTickets(res.tickets);
          setLoadingTickets(false);
        })
        .catch(() => setLoadingTickets(false));
    }
  }, [activeTab]);

  // Handle Clipboard Paste for Screenshots (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!isOpen) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleProcessFile(file);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProcessFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('Screenshot attachment exceeds 5MB limit. Please attach a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const newAttachment: ScreenshotAttachment = {
          id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: file.name || `Screenshot_${new Date().toLocaleTimeString().replace(/:/g, '-')}.png`,
          dataUrl,
          sizeBytes: file.size,
        };
        setScreenshots((prev) => [...prev, newAttachment]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      handleProcessFile(files[i]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Browser Screen Capture API to take live screenshot of the window
  const handleCaptureScreen = async () => {
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        alert('Screen capture API is not supported in this browser. Please use file upload or paste from clipboard (Ctrl+V).');
        return;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1920;
      canvas.height = video.videoHeight || 1080;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL('image/png');
      const tracks = stream.getTracks();
      tracks.forEach((t) => t.stop());

      const captureAttachment: ScreenshotAttachment = {
        id: `att_cap_${Date.now()}`,
        name: `Live_Screen_Capture_${Date.now()}.png`,
        dataUrl,
        sizeBytes: Math.round(dataUrl.length * 0.75),
      };

      setScreenshots((prev) => [...prev, captureAttachment]);
    } catch (err: any) {
      // User cancelled or browser denied capture
      console.warn('Screen capture cancelled or denied:', err);
    }
  };

  const handleRemoveScreenshot = (id: string) => {
    setScreenshots((prev) => prev.filter((s) => s.id !== id));
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(SUPPORT_EMAIL);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Please describe the issue in detail.');
      return;
    }
    if (!userEmail.trim()) {
      setErrorMsg('Please provide your contact email so our engineering team can follow up.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const selectedCat = ISSUE_CATEGORIES.find((c) => c.id === category);
      const res = await submitSupportTicket({
        category,
        categoryLabel: selectedCat?.label || category,
        customCategoryTitle: category === 'other' ? customCategoryTitle.trim() : undefined,
        description: description.trim(),
        urgency,
        userEmail: userEmail.trim(),
        userName: userName.trim() || undefined,
        matchId,
        matchName,
        sport,
        overlayToken,
        screenshots,
      });

      setSubmittedTicket({
        ticket: res.ticket,
        mailtoLink: res.mailtoLink,
        message: res.message,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit issue ticket. Please forward via email.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif]"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-b from-[#0c1424] via-[#080d19] to-[#070b14] border border-cyan-500/40 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl shadow-cyan-500/15 overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-5 border-b border-slate-800/80 bg-[#090f1f]/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-cyan-500/25">
              <LifeBuoy className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <span>CLIENT HELP DESK &amp; OPERATIONS SUPPORT</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="text-emerald-400">24/7 SLA UPLINK</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white font-['Space_Grotesk',sans-serif]">
                MarketinGlu Live Broadcast Help Desk
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#060a14] hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Support Channel Banner (Official Email) */}
        <div className="px-5 py-3 bg-[#060a14] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Official Client Desk Email:</span>
            <code className="text-cyan-300 font-mono font-bold bg-[#0d162a] px-2 py-0.5 rounded border border-cyan-500/30">
              {SUPPORT_EMAIL}
            </code>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyEmail}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0d162a] hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white cursor-pointer transition-colors"
            >
              {copiedEmail ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-cyan-400" />}
              <span>{copiedEmail ? 'Copied Email!' : 'Copy Email'}</span>
            </button>

            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=Urgent%20Broadcast%20Support%20Request`}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-[11px] font-bold text-cyan-300 cursor-pointer"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Direct Mail Link</span>
            </a>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 py-2 bg-[#080d19]/90 border-b border-slate-800/60 flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('report')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'report'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Report An Issue
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'tickets'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Ticket History &amp; Status
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'faq'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Fast Fix Guide &amp; Knowledge Base
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-300">
          {/* TAB 1: Report An Issue Form */}
          {activeTab === 'report' && (
            <>
              {/* Ticket Created Success Screen */}
              {submittedTicket ? (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0c1a33] to-[#070b14] border border-cyan-400/50 shadow-2xl space-y-4 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                      TICKET REGISTERED • SLA ACTIVE
                    </div>
                    <h3 className="text-xl font-black text-white font-['Space_Grotesk',sans-serif] mt-1">
                      Ticket Reference: {submittedTicket.ticket.id}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 max-w-lg mx-auto">
                      {submittedTicket.message}
                    </p>
                  </div>

                  <div className="p-3 bg-[#060a14] rounded-xl border border-slate-800 max-w-md mx-auto text-left font-mono text-[11px] space-y-1">
                    <div className="text-slate-400">Category: <span className="text-white font-bold">{submittedTicket.ticket.categoryLabel}</span></div>
                    <div className="text-slate-400">Urgency: <span className="text-rose-400 font-bold uppercase">{submittedTicket.ticket.urgency}</span></div>
                    <div className="text-slate-400">Client Email: <span className="text-cyan-300">{submittedTicket.ticket.userEmail}</span></div>
                    <div className="text-slate-400">Attachments: <span className="text-white">{submittedTicket.ticket.screenshots.length} screenshot(s)</span></div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <a
                      href={submittedTicket.mailtoLink}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 cursor-pointer hover:from-cyan-300 hover:to-blue-400"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Forward Ticket via Email ({SUPPORT_EMAIL})</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setSubmittedTicket(null);
                        setDescription('');
                        setScreenshots([]);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#060a14] border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
                    >
                      Submit Another Report
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* In-Game Live Match Context Banner (if reported during match) */}
                  {matchId && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Radio className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                        <div>
                          <div className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                            LIVE IN-MATCH REPORTING CONTEXT
                          </div>
                          <div className="font-bold text-white text-xs">
                            {matchName || matchId} ({sport?.replace('_', ' ').toUpperCase() || 'SPORTS'})
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 bg-black/40 px-2 py-1 rounded">
                        Token: {overlayToken || 'active'}
                      </span>
                    </div>
                  )}

                  {/* Step 1: Issue Category Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      1. Select Issue Category
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ISSUE_CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = category === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategory(cat.id)}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                              isSelected
                                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-cyan-400 text-white shadow-md shadow-cyan-500/15 ring-1 ring-cyan-400'
                                : 'bg-[#060a14] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                            }`}
                          >
                            <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                            <div className="min-w-0">
                              <div className="font-bold text-xs leading-snug">{cat.label}</div>
                              <div className="text-[10px] text-slate-500 truncate mt-0.5">{cat.hint}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Subject field if 'other' is selected */}
                  {category === 'other' && (
                    <div className="p-3.5 rounded-xl bg-[#060a14] border border-cyan-500/40 space-y-1">
                      <label className="block text-[11px] font-semibold text-cyan-300">
                        Custom Issue Subject / Topic
                      </label>
                      <input
                        type="text"
                        required
                        value={customCategoryTitle}
                        onChange={(e) => setCustomCategoryTitle(e.target.value)}
                        placeholder="e.g. In-stadium HDMI Decklink output resolution issue..."
                        className="w-full bg-[#0a1120] border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                      />
                    </div>
                  )}

                  {/* Step 2: Urgency & Client Contact */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Urgency / Broadcast Impact
                      </label>
                      <select
                        value={urgency}
                        onChange={(e) => setUrgency(e.target.value as IssueUrgency)}
                        className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none capitalize"
                      >
                        <option value="low">Low (General Query)</option>
                        <option value="medium">Medium (Non-blocking bug)</option>
                        <option value="high">High (Scoring glitch in live match)</option>
                        <option value="critical">Critical (Stream overlay down!)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Client Contact Email <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="operator@broadcaster.com"
                        className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Operator / Client Name
                      </label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="e.g. John (Director)"
                        className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>
                  </div>

                  {/* Step 3: Detailed Description */}
                  <div className="space-y-1">
                    <label className="block text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      2. Detailed Issue Description <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what occurred, steps to reproduce, what you expected vs what happened..."
                      className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-2xl p-3 text-xs text-white outline-none font-sans"
                    />
                  </div>

                  {/* Step 4: Screenshot Attachments */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>3. Attach Screenshots ({screenshots.length} Attached)</span>
                      </label>
                      <span className="text-[11px] text-slate-500 font-mono">Tip: Press Ctrl+V to paste screenshot</span>
                    </div>

                    {/* Screenshot Upload & Capture Actions Bar */}
                    <div className="p-3 rounded-2xl bg-[#060a14] border border-slate-800 flex flex-wrap items-center gap-2.5">
                      <input
                        type="file"
                        ref={fileInputRef}
                        multiple
                        accept="image/*"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0c1424] hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 cursor-pointer transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Upload Screenshot Files</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCaptureScreen}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0c1424] hover:bg-slate-800 border border-slate-800 text-xs font-bold text-cyan-300 cursor-pointer transition-colors"
                        title="Capture entire screen or OBS window directly"
                      >
                        <Camera className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Live Screen Capture</span>
                      </button>

                      <span className="text-[11px] text-slate-500 ml-auto">
                        Supports PNG, JPG, WEBP (Max 5MB each)
                      </span>
                    </div>

                    {/* Screenshot Thumbnails Gallery */}
                    {screenshots.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                        {screenshots.map((item) => (
                          <div
                            key={item.id}
                            className="relative group rounded-xl overflow-hidden border border-slate-800 bg-black aspect-video flex items-center justify-center"
                          >
                            <img src={item.dataUrl} alt={item.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                              <span className="text-[10px] text-white truncate font-mono">{item.name}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveScreenshot(item.id)}
                                className="self-end p-1 rounded-md bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
                                title="Remove screenshot"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Form Submit Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-[11px] font-mono text-slate-500">
                      SLA Response: Critical (&lt;15m) • High (&lt;1h) • Medium (&lt;4h)
                    </span>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{submitting ? 'Submitting Issue...' : 'Submit Support Ticket'}</span>
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* TAB 2: Ticket History & Status */}
          {activeTab === 'tickets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-cyan-400 uppercase">
                  Submitted Client Support Tickets ({existingTickets.length})
                </span>
                <span className="text-[11px] text-slate-500">
                  Escalation Desk: <code className="text-cyan-300">{ESCALATION_EMAIL}</code>
                </span>
              </div>

              {loadingTickets ? (
                <div className="py-6">
                  <MarketingluLoadingScreen
                    message="Syncing Client Support Tickets..."
                    subMessage="Querying support@marketinglu.com ticket registry"
                    fullScreen={false}
                    size="sm"
                    showProgress={true}
                  />
                </div>
              ) : existingTickets.length === 0 ? (
                <div className="py-12 text-center rounded-2xl bg-[#060a14] border border-slate-800 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <div className="text-white font-bold text-xs">No Active Support Tickets</div>
                  <p className="text-[11px] text-slate-500">All systems operational. No open tickets logged.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {existingTickets.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 rounded-2xl bg-[#060a14] border border-slate-800 hover:border-slate-700 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-cyan-400 text-xs">{t.id}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono uppercase text-slate-300">
                            {t.categoryLabel}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase ${
                              t.urgency === 'critical'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : t.urgency === 'high'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {t.urgency}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(t.createdAt).toLocaleDateString()} {new Date(t.createdAt).toLocaleTimeString()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-normal">{t.description}</p>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/60 font-mono">
                        <span>Client: {t.userEmail}</span>
                        <span>{t.screenshots.length} screenshot attachment(s)</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FAQ / Quick Troubleshooting */}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              <div className="text-xs font-mono font-bold text-cyan-400 uppercase">
                Frequently Addressed Broadcaster Technical Inquiries
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-[#060a14] border border-slate-800 space-y-1.5">
                  <div className="font-bold text-white text-xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>How do I fix a blank browser source in OBS Studio?</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed pl-3.5">
                    1. Ensure OBS Browser Source width is set to 1920 and height to 1080.
                    2. Right-click the browser source in OBS &rarr; Properties &rarr; click &ldquo;Refresh cache of current page&rdquo;.
                    3. Ensure hardware acceleration is enabled in OBS Settings &rarr; Advanced &rarr; Enable Browser Source Hardware Acceleration.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#060a14] border border-slate-800 space-y-1.5">
                  <div className="font-bold text-white text-xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>How do I reposition or drag the scoreboard across the OBS canvas?</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed pl-3.5">
                    Append <code className="text-cyan-300">?pos=top-left</code>, <code className="text-cyan-300">?pos=top-right</code>, or <code className="text-cyan-300">?pos=bottom-center</code> to the OBS Browser Source URL.
                    To drag interactively in real time, append <code className="text-cyan-300">?movable=1</code>, drag the widget to your desired position, and click &ldquo;Copy OBS URL&rdquo;.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#060a14] border border-slate-800 space-y-1.5">
                  <div className="font-bold text-white text-xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>Why did my Razorpay license pass show as expired?</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed pl-3.5">
                    Hourly passes remain active for precisely 60 minutes from time of verification. 24h passes stay active for 24 continuous hours.
                    If you paid and the pass is stalled, submit a ticket under &ldquo;Razorpay Billing&rdquo; with your Order ID for immediate operator reactivation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-[#090f1f]/90 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span>Direct Escalations:</span>
            <a href={`mailto:${ESCALATION_EMAIL}`} className="text-cyan-400 hover:underline">
              {ESCALATION_EMAIL}
            </a>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#060a14] hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold cursor-pointer"
          >
            Close Help Desk
          </button>
        </div>
      </div>
    </div>
  );
};
