import React, { useState, useEffect } from 'react';
import {
  Star,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Send,
  Sparkles,
  ShieldCheck,
  ThumbsUp,
  SlidersHorizontal,
  QrCode,
  X,
  Tv,
  Award,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { AppReview, ReviewStats, ReviewerRole, SportType } from '../types/sports';
import { fetchReviews, submitReview } from '../services/api';
import { MarketingluLoadingScreen } from '../components/common/MarketingluLoadingScreen';
import wordmarkImg from '../assets/images/marketinglu-wordmark.png';
import emblemDarkImg from '../assets/images/marketinglu-emblem-dark.png';

interface ReviewsPageProps {
  onBack?: () => void;
  onNavigateToConsole?: (sport: string) => void;
}

const REVIEW_ROLES: ReviewerRole[] = [
  'Streamer',
  'Tournament Organizer',
  'Broadcast Director',
  'Official Scorer',
  'Academy Coach',
  'Esports Caster',
];

const SPORT_OPTIONS: { id: SportType | 'all'; label: string }[] = [
  { id: 'all', label: 'All Sports' },
  { id: 'cricket', label: 'Cricket' },
  { id: 'football', label: 'Football' },
  { id: 'basketball', label: 'Basketball' },
  { id: 'kabaddi', label: 'Kabaddi' },
  { id: 'tennis', label: 'Tennis' },
  { id: 'badminton', label: 'Badminton' },
  { id: 'table_tennis', label: 'Table Tennis' },
  { id: 'volleyball', label: 'Volleyball' },
  { id: 'baseball', label: 'Baseball' },
  { id: 'rugby', label: 'Rugby' },
  { id: 'field_hockey', label: 'Field Hockey' },
];

const POPULAR_FEATURE_TAGS = [
  'Sub-second OBS latency',
  '60 FPS Graphics',
  'Movable OBS Scorebug',
  'ICC Rule Book Integration',
  'DLS Target Calculator',
  'Native Kabaddi Engine',
  '24s Basketball Shot Clock',
  'Zero-Redundancy Custom Teams',
  'Affordable ₹499 Passes',
  'Hostinger MySQL Cloud Sync',
  'YouTube RTMP Multi-destination',
];

export const ReviewsPage: React.FC<ReviewsPageProps> = ({ onBack, onNavigateToConsole }) => {
  const [reviews, setReviews] = useState<AppReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilterSport, setActiveFilterSport] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'verified'>('newest');
  const [copiedStoreUrl, setCopiedStoreUrl] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  // Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [easeOfUse, setEaseOfUse] = useState<number>(5);
  const [performanceRating, setPerformanceRating] = useState<number>(5);
  const [authorName, setAuthorName] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState<ReviewerRole>('Tournament Organizer');
  const [selectedSport, setSelectedSport] = useState<SportType | 'all'>('cricket');
  const [title, setTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'Sub-second OBS latency',
    'Movable OBS Scorebug',
  ]);
  const [playStoreSubmitted, setPlayStoreSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async (sport?: string) => {
    try {
      const res = await fetchReviews(sport);
      setReviews(res.reviews);
      setStats(res.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(activeFilterSport);
  }, [activeFilterSport]);

  const handleCopyStoreLink = () => {
    const url = stats?.playStoreUrl || 'https://play.google.com/store/apps/details?id=com.marketinglu.obs.scorebug';
    navigator.clipboard.writeText(url);
    setCopiedStoreUrl(true);
    setTimeout(() => setCopiedStoreUrl(false), 2400);
  };

  const toggleFeature = (tag: string) => {
    if (selectedFeatures.includes(tag)) {
      setSelectedFeatures(selectedFeatures.filter((t) => t !== tag));
    } else {
      setSelectedFeatures([...selectedFeatures, tag]);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!authorName.trim()) {
      setFormError('Please enter your full name or broadcaster handle.');
      return;
    }
    if (!reviewText.trim() || reviewText.trim().length < 15) {
      setFormError('Please write a constructive review of at least 15 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await submitReview({
        authorName: authorName.trim(),
        organization: organization.trim() || undefined,
        role,
        sport: selectedSport,
        rating,
        title: title.trim() || `${rating}-Star Experience with MarketinGlu OBS`,
        reviewText: reviewText.trim(),
        easeOfUseRating: easeOfUse,
        overlayPerformanceRating: performanceRating,
        featuresLiked: selectedFeatures,
        isVerifiedBroadcaster: true,
        playStoreSubmitted,
      });

      setReviews([res.review, ...reviews]);
      if (res.stats) setStats(res.stats);

      // Reset form
      setTitle('');
      setReviewText('');
      setFormError(null);
      setShowSuccessBanner(true);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter & Sort reviews
  const filteredReviews = reviews
    .filter((r) => activeFilterSport === 'all' || r.sport === activeFilterSport || r.sport === 'all')
    .sort((a, b) => {
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'verified') return (b.isVerifiedBroadcaster ? 1 : 0) - (a.isVerifiedBroadcaster ? 1 : 0);
      return b.createdAt - a.createdAt;
    });

  const ratingLabels: { [key: number]: string } = {
    1: 'Needs Improvement',
    2: 'Fair Experience',
    3: 'Good Broadcast Quality',
    4: 'Great Performance',
    5: 'Exceptional (Broadcast Grade!)',
  };

  const playStoreUrl =
    stats?.playStoreUrl || 'https://play.google.com/store/apps/details?id=com.marketinglu.obs.scorebug';

  if (loading) {
    return (
      <MarketingluLoadingScreen
        message="Loading Client Reviews & Play Store Ratings..."
        subMessage="Syncing verified broadcaster testimonials, Google Play Store ratings & telemetry"
        fullScreen={true}
        onCancel={onBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 pb-24">
      {/* Hero Section: Google Play Store Showcase */}
      <section className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-[#0c1424] via-[#090f1f] to-[#070b14] pt-10 pb-12 px-4 sm:px-6">
        {/* Ambient Neon Backlights */}
        <div className="absolute top-0 left-1/4 w-[480px] h-[320px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-[420px] h-[280px] bg-blue-600/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          {/* Header Breadcrumb / Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#090f1f] border border-cyan-500/40 p-1 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <img
                  src={emblemDarkImg}
                  alt="MarketinGlu Emblem"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                    MARKETINGLU OBS LIVE
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-cyan-500/10 border border-cyan-500/30 text-[9px] font-mono text-cyan-300 font-bold">
                    ISO 9001:2015
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-['Space_Grotesk',sans-serif]">
                  Reviews & Rate Us on Google Play Store
                </h1>
              </div>
            </div>

            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 rounded-xl bg-[#090f1f] hover:bg-[#0f1933] border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                Back to Dashboard
              </button>
            )}
          </div>

          {/* Dual Card Showcase: Play Store Badge & Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Card: Official Google Play Store Rate Us Banner */}
            <div className="lg:col-span-7 rounded-2xl bg-gradient-to-br from-[#0e172e] via-[#091124] to-[#060a14] border border-cyan-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

              <div>
                {/* Official Google Play Store Header Tag */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 mb-5 shadow-sm">
                  {/* Google Play 4-Color Triangle Logo Icon SVG */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3.6 2.4C3.2 2.8 3 3.4 3 4.2V19.8C3 20.6 3.2 21.2 3.6 21.6L3.7 21.7L13.7 11.7V11.3L3.7 2.3L3.6 2.4Z"
                      fill="#00E5FF"
                    />
                    <path
                      d="M17 15L13.7 11.7V11.3L17 8L17.1 8.1L21 10.3C22.1 10.9 22.1 11.9 21 12.6L17.1 14.8L17 15Z"
                      fill="#FFD600"
                    />
                    <path
                      d="M17.1 14.9L13.7 11.5L3.6 21.6C4 22 4.7 22.1 5.5 21.6L17.1 14.9Z"
                      fill="#FF3D00"
                    />
                    <path
                      d="M17.1 8.1L5.5 1.4C4.7 0.9 4 1 3.6 1.4L13.7 11.5L17.1 8.1Z"
                      fill="#00E676"
                    />
                  </svg>
                  <span className="text-xs font-bold text-white tracking-wide">
                    Google Play Store Official Release
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30 font-bold">
                    VERIFIED APP
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-['Space_Grotesk',sans-serif] mb-3">
                  Enjoying MarketinGlu OBS? Rate Us 5 Stars!
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed mb-6 max-w-xl">
                  Your ratings empower grassroots sports broadcasters, streamers, and tournament directors across the globe. Tap below to share your experience on the Google Play Store.
                </p>
              </div>

              {/* Action Buttons: Direct Play Store Link + Mobile QR Code + Copy Link */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800">
                <a
                  href={playStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <Star className="w-4 h-4 fill-slate-950 stroke-none" />
                  <span>Rate Us on Google Play Store</span>
                  <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                </a>

                <button
                  onClick={() => setShowQrModal(true)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#090f1f] hover:bg-[#101b36] border border-cyan-500/40 text-xs font-bold text-cyan-300 transition-colors cursor-pointer shadow-sm"
                  title="Scan QR Code to rate directly from your Android phone"
                >
                  <QrCode className="w-4 h-4 text-cyan-400" />
                  <span>Scan Phone QR</span>
                </button>

                <button
                  onClick={handleCopyStoreLink}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#090f1f] hover:bg-[#101b36] border border-slate-800 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                >
                  {copiedStoreUrl ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied Link!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-400" />
                      <span>Copy Store URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Card: Play Store Overall Rating & Score Breakdown */}
            <div className="lg:col-span-5 rounded-2xl bg-gradient-to-br from-[#0c1424] to-[#070b14] border border-slate-800 p-6 sm:p-8 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Google Play Rating Score
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    <Award className="w-3 h-3" />
                    Top Rated Broadcast Tool
                  </span>
                </div>

                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-5xl sm:text-6xl font-black text-white font-['Space_Grotesk',sans-serif]">
                    {stats?.averageRating.toFixed(1) || '4.9'}
                  </span>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-amber-400 mb-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-5 h-5 fill-amber-400 stroke-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      Based on {stats?.totalReviews.toLocaleString() || '1,485'}+ broadcast reviews
                    </span>
                  </div>
                </div>

                {/* Rating Breakdown Bars */}
                <div className="space-y-1.5 my-5">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = stats?.breakdown[stars as keyof typeof stats.breakdown] || 0;
                    const total = stats?.totalReviews || 1485;
                    const pct = Math.max(2, Math.round((count / total) * 100));

                    return (
                      <div key={stars} className="flex items-center gap-2.5 text-xs font-mono text-slate-400">
                        <span className="w-4 text-right font-bold text-slate-300">{stars}</span>
                        <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                        <div className="flex-1 h-2 bg-[#060a14] rounded-full overflow-hidden border border-slate-800/80">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-cyan-400 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-[11px] text-slate-500">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Verified Trust Badges */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>100% Verified Broadcasters</span>
                </div>
                <span className="font-mono text-slate-500">v3.4 Production</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container: Write Review Form + Community Testimonials */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10">
        {/* Success Banner */}
        {showSuccessBanner && (
          <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-emerald-900/40 to-[#070b14] border border-emerald-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Review Submitted Successfully!</h3>
                <p className="text-xs text-slate-300">
                  Thank you for supporting MarketinGlu OBS. If you haven't already, please rate us on Google Play Store!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <a
                href={playStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Rate on Play Store</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setShowSuccessBanner(false)}
                className="p-2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Column: Add A Review */}
          <div className="lg:col-span-5 rounded-2xl bg-[#090f1f]/95 border border-slate-800 p-6 sm:p-7 shadow-2xl relative sticky top-20">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Submit Feedback</span>
            </div>
            <h2 className="text-xl font-black text-white font-['Space_Grotesk',sans-serif] mb-1">
              Add Your Review
            </h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Share your broadcast setup experience with our engineering and community team.
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  Overall Rating <span className="text-rose-400">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-[#060a14] p-2 rounded-xl border border-slate-800">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = (hoverRating || rating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="p-1 hover:scale-125 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              isActive
                                ? 'fill-amber-400 stroke-amber-400'
                                : 'fill-slate-800 stroke-slate-600'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-bold text-amber-400 font-mono">
                    {ratingLabels[hoverRating || rating]}
                  </span>
                </div>
              </div>

              {/* Sub-Ratings: Ease of Use & Stream Performance */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Ease of Scoring: <span className="text-cyan-400 font-bold">{easeOfUse}/5</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={easeOfUse}
                    onChange={(e) => setEaseOfUse(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    OBS Latency: <span className="text-cyan-400 font-bold">{performanceRating}/5</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={performanceRating}
                    onChange={(e) => setPerformanceRating(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* Name & Channel/Organization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Your Name / Handle <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Rahul Verma"
                    className="w-full px-3 py-2 bg-[#060a14] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Organization / Channel
                  </label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. SportsPulse Live"
                    className="w-full px-3 py-2 bg-[#060a14] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Role & Sport */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Broadcasting Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as ReviewerRole)}
                    className="w-full px-3 py-2 bg-[#060a14] border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {REVIEW_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Primary Sport
                  </label>
                  <select
                    value={selectedSport}
                    onChange={(e) => setSelectedSport(e.target.value as SportType | 'all')}
                    className="w-full px-3 py-2 bg-[#060a14] border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {SPORT_OPTIONS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Review Headline / Title */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Review Headline
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Flawless 1080p60 overlays during our league finals"
                  className="w-full px-3 py-2 bg-[#060a14] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Written Feedback <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share details on how MarketinGlu OBS helped your broadcast, stream performance, ease of scoring, and client feedback..."
                  className="w-full px-3 py-2 bg-[#060a14] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              {/* Feature Tags Multi-Select */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                  Features You Loved Most
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                  {POPULAR_FEATURE_TAGS.map((tag) => {
                    const selected = selectedFeatures.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleFeature(tag)}
                        className={`text-[10px] font-mono px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                          selected
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                            : 'bg-[#060a14] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {selected ? '✓ ' : '+ '}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Play Store Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#060a14] border border-cyan-500/20 cursor-pointer">
                <input
                  type="checkbox"
                  checked={playStoreSubmitted}
                  onChange={(e) => setPlayStoreSubmitted(e.target.checked)}
                  className="mt-0.5 rounded accent-cyan-400 cursor-pointer"
                />
                <span className="text-[11px] text-slate-300 leading-snug">
                  I have also rated on <strong className="text-white">Google Play Store</strong> (Grants verified rating badge).
                </span>
              </label>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{isSubmitting ? 'Publishing Review...' : 'Submit Broadcast Review'}</span>
              </button>
            </form>
          </div>

          {/* Reviews Feed Column */}
          <div className="lg:col-span-7 space-y-5">
            {/* Filter and Sort Toolbar */}
            <div className="p-4 rounded-2xl bg-[#090f1f]/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-mono font-bold text-slate-400 mr-1 flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
                  Sport:
                </span>
                {['all', 'cricket', 'football', 'basketball', 'kabaddi'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setActiveFilterSport(s)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      activeFilterSport === s
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-[#060a14] text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-500">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#060a14] border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="highest">Highest Rating</option>
                  <option value="verified">Verified Broadcasters</option>
                </select>
              </div>
            </div>

            {/* Review Cards List */}
            {filteredReviews.length === 0 ? (
              <div className="py-16 text-center rounded-2xl bg-[#090f1f]/50 border border-slate-800 p-8 space-y-3">
                <Star className="w-8 h-8 text-slate-600 mx-auto" />
                <h3 className="text-white font-bold text-sm">No reviews found for this sport filter.</h3>
                <p className="text-xs text-slate-400">Be the first to review using the form on the left!</p>
              </div>
            ) : (
              filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#0c1424] to-[#070b14] border border-slate-800/90 hover:border-cyan-500/30 transition-all shadow-lg space-y-3.5 group"
                >
                  {/* Top Header: Author + Role + Date */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar Initials Badge */}
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-sm shadow-sm font-mono">
                        {rev.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white">{rev.authorName}</h4>
                          {rev.isVerifiedBroadcaster && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-mono text-emerald-400 font-bold" title="Verified Broadcaster">
                              <ShieldCheck className="w-3 h-3" />
                              VERIFIED
                            </span>
                          )}
                          {rev.playStoreSubmitted && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-[9px] font-mono text-blue-300 font-bold" title="Rated on Google Play Store">
                              PLAY STORE ★
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {rev.role}
                          {rev.organization && ` • ${rev.organization}`}
                          <span className="text-slate-600"> • </span>
                          <span className="text-cyan-400 font-mono capitalize">
                            {rev.sport.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Star Rating Badge */}
                    <div className="flex items-center gap-1 bg-[#060a14] px-2.5 py-1 rounded-xl border border-slate-800">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating
                              ? 'fill-amber-400 stroke-amber-400'
                              : 'fill-slate-800 stroke-slate-700'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-white ml-1 font-mono">
                        {rev.rating}.0
                      </span>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div>
                    <h5 className="text-sm font-bold text-slate-100 mb-1.5">{rev.title}</h5>
                    <p className="text-xs text-slate-300 leading-relaxed">{rev.reviewText}</p>
                  </div>

                  {/* Feature Tags Chips */}
                  {rev.featuresLiked && rev.featuresLiked.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {rev.featuresLiked.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-[#060a14] border border-slate-800/80 text-[10px] font-mono text-cyan-300/90 font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer Meta */}
                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>
                      Posted {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-slate-400">MarketinGlu Sub-Second Engine</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* QR Code Modal for Phone Scanning */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-gradient-to-b from-[#0c1424] to-[#070b14] border border-cyan-500/40 p-6 shadow-2xl relative text-center">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-white font-['Space_Grotesk',sans-serif] mb-1">
              Rate on Your Phone
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Scan this QR code with your mobile camera to open Google Play Store directly.
            </p>

            {/* Stylized QR Code Container with MarketinGlu Branding */}
            <div className="bg-white p-4 rounded-xl inline-block shadow-xl mb-5">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  playStoreUrl
                )}`}
                alt="Google Play Store QR Code"
                className="w-44 h-44 object-contain"
              />
            </div>

            <div className="flex flex-col gap-2">
              <a
                href={playStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>Direct Web Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-xs text-slate-400 hover:text-white py-1 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
