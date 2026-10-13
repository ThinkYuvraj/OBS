import React, { useState, useEffect } from 'react';
import { SportType } from '../../types/sports';
import { SPORTS_RULES, SportRuleData } from '../../pages/RuleBooks';
import {
  BookOpen,
  Search,
  X,
  Shield,
  Zap,
  Award,
  CheckCircle,
  Flag,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';

interface RuleBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSport?: SportType;
}

export const RuleBookModal: React.FC<RuleBookModalProps> = ({
  isOpen,
  onClose,
  initialSport = 'cricket',
}) => {
  const [selectedSportId, setSelectedSportId] = useState<SportType>(initialSport);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<'all' | 'scoring' | 'rules' | 'referee' | 'broadcast'>('all');

  useEffect(() => {
    if (initialSport) {
      setSelectedSportId(initialSport);
    }
  }, [initialSport, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentSport = SPORTS_RULES.find((s) => s.id === selectedSportId) || SPORTS_RULES[0];

  const q = searchQuery.toLowerCase().trim();
  const filteredScoring = currentSport.scoringBreakdown.filter(
    (item) => !q || item.label.toLowerCase().includes(q) || item.detail.toLowerCase().includes(q) || item.points.toLowerCase().includes(q)
  );
  const filteredRules = currentSport.keyRules.filter(
    (r) => !q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
  );
  const filteredSignals = currentSport.refereeSignals.filter(
    (s) => !q || s.signal.toLowerCase().includes(q) || s.meaning.toLowerCase().includes(q)
  );
  const filteredBroadcast = currentSport.broadcastTips.filter(
    (t) => !q || t.toLowerCase().includes(q)
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-b from-[#0c1424] via-[#080d19] to-[#060a14] border border-cyan-500/40 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl shadow-cyan-500/10 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800/80 bg-[#090f1f]/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-cyan-500/25">
              <BookOpen className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <span>OFFICIAL BROADCAST RULE BOOK</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="text-slate-400">{currentSport.governingBody}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white font-['Space_Grotesk',sans-serif] flex items-center gap-2">
                <span>{currentSport.name}</span>
                <span className="text-base">{currentSport.icon}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#060a14] hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close Rule Book (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sports Switcher Strip */}
        <div className="px-5 py-2.5 bg-[#060a14]/90 border-b border-slate-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
          {SPORTS_RULES.map((sport) => {
            const isSelected = sport.id === selectedSportId;
            return (
              <button
                key={sport.id}
                onClick={() => {
                  setSelectedSportId(sport.id);
                  setSearchQuery('');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20 font-black'
                    : 'bg-[#090f1f] border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>{sport.icon}</span>
                <span>{sport.name}</span>
              </button>
            );
          })}
        </div>

        {/* Sub-bar: Search & Section Filters */}
        <div className="p-4 bg-[#080d19]/80 border-b border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${currentSport.name} rules, fouls, scoring...`}
              className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Section Filter Category Capsule */}
          <div className="overflow-x-auto no-scrollbar py-0.5">
            <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[#051122]/90 border border-cyan-500/30 shadow-inner backdrop-blur-md">
              {(
                [
                  { id: 'all', label: 'All Rules' },
                  { id: 'scoring', label: 'Scoring Matrix' },
                  { id: 'rules', label: 'Key Regulations' },
                  { id: 'referee', label: 'Signals' },
                  { id: 'broadcast', label: 'OBS Tips' },
                ] as const
              ).map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all whitespace-nowrap shrink-0 ${
                    activeSection === sec.id
                      ? 'border border-cyan-400 bg-cyan-950/70 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-slate-300">
          {/* Quick Meta Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-[#060a14] border border-slate-800">
              <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                <span>Standard Duration</span>
              </div>
              <div className="text-white font-semibold text-xs mt-1">{currentSport.duration}</div>
            </div>

            <div className="p-3 rounded-2xl bg-[#060a14] border border-slate-800">
              <div className="text-[10px] font-mono text-amber-400 uppercase font-bold flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                <span>Squad &amp; Court Setup</span>
              </div>
              <div className="text-white font-semibold text-xs mt-1">{currentSport.teamSize}</div>
            </div>

            <div className="p-3 rounded-2xl bg-[#060a14] border border-slate-800">
              <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1.5">
                <Award className="w-3 h-3" />
                <span>Governing Authority</span>
              </div>
              <div className="text-white font-semibold text-xs mt-1">{currentSport.governingBody}</div>
            </div>
          </div>

          {/* Sport Summary */}
          <div className="p-3.5 rounded-2xl bg-[#090f1f]/80 border border-slate-800 text-slate-300 leading-relaxed">
            {currentSport.summary}
          </div>

          {/* Section: Scoring Breakdown */}
          {(activeSection === 'all' || activeSection === 'scoring') && filteredScoring.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                <Award className="w-3.5 h-3.5" />
                <span>Scoring Point Structure &amp; Values</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredScoring.map((sc, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-[#060a14] border border-slate-800 hover:border-cyan-500/30 transition-all">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-white text-xs">{sc.label}</span>
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 font-mono text-[10px] font-extrabold text-cyan-300">
                        {sc.points}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">{sc.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Key Rules & Laws */}
          {(activeSection === 'all' || activeSection === 'rules') && filteredRules.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Key Official Rules &amp; Regulations</span>
              </div>
              <div className="space-y-2">
                {filteredRules.map((rule, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-[#060a14] border border-slate-800">
                    <div className="font-bold text-white text-xs mb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{rule.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal pl-3">{rule.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Referee Signals */}
          {(activeSection === 'all' || activeSection === 'referee') && filteredSignals.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                <Flag className="w-3.5 h-3.5" />
                <span>Official Umpire &amp; Referee Signals</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredSignals.map((sig, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-[#060a14] border border-slate-800">
                    <div className="font-bold text-emerald-300 text-xs mb-1 font-mono">{sig.signal}</div>
                    <div className="text-[11px] text-slate-400">{sig.meaning}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Broadcast & OBS Overlay Tips */}
          {(activeSection === 'all' || activeSection === 'broadcast') && filteredBroadcast.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Broadcast Graphics &amp; Television Overlays</span>
              </div>
              <div className="space-y-2">
                {filteredBroadcast.map((tip, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-[#060a14] border border-slate-800 flex items-start gap-2.5">
                    <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono text-[10px] font-bold shrink-0">
                      TIP {i + 1}
                    </span>
                    <span className="text-[11px] text-slate-300">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-[#090f1f]/90 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500">
            MarketinGlu Broadcast Operations • ISO 9001:2015
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs cursor-pointer shadow-md hover:from-cyan-300 hover:to-blue-400"
          >
            Got it, Return to Game
          </button>
        </div>
      </div>
    </div>
  );
};
