import React, { useState } from 'react';
import { ArrowLeft, Check, Copy, ExternalLink, HelpCircle, Laptop, Settings, Tv } from 'lucide-react';

interface ObsSetupGuideProps {
  onBack: () => void;
}

export const ObsSetupGuide: React.FC<ObsSetupGuideProps> = ({ onBack }) => {
  const [copiedSample, setCopiedSample] = useState(false);

  const sampleUrl = `${window.location.origin}/overlay/overlay_live_cricket_t20_final`;

  const copyUrl = () => {
    navigator.clipboard.writeText(sampleUrl);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              OBS Studio & Broadcast Source Integration
            </h1>
            <p className="text-xs text-slate-400">
              Complete configuration guide for OBS Studio, vMix, and Streamlabs Desktop
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 space-y-8">
        {/* Sample URL Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
            Sample Live Browser Source URL
          </div>
          <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="font-mono text-sm text-slate-200 flex-1 truncate">{sampleUrl}</span>
            <button
              onClick={copyUrl}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded cursor-pointer"
            >
              {copiedSample ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSample ? 'Copied' : 'Copy'}</span>
            </button>
            <a
              href={sampleUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-slate-400 hover:text-white"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <span>OBS Studio Quick Setup Steps</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-blue-400 font-mono font-bold text-xs">STEP 01</div>
              <h3 className="font-bold text-white text-sm mt-1">Add Browser Source</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                In OBS Studio, navigate to your active Scene. Under <strong>Sources</strong>, click the <strong>+</strong> icon and select <strong>Browser</strong>.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-blue-400 font-mono font-bold text-xs">STEP 02</div>
              <h3 className="font-bold text-white text-sm mt-1">Paste Overlay URL</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Paste your dedicated Match Overlay URL into the URL field. Check <strong>Shutdown source when not visible</strong>.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-blue-400 font-mono font-bold text-xs">STEP 03</div>
              <h3 className="font-bold text-white text-sm mt-1">Set Canvas Dimensions</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Set <strong>Width</strong> to <code className="text-amber-400 font-mono">1920</code> and <strong>Height</strong> to <code className="text-amber-400 font-mono">1080</code> (or your stream resolution).
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-blue-400 font-mono font-bold text-xs">STEP 04</div>
              <h3 className="font-bold text-white text-sm mt-1">Instant Real-Time Stream</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Click <strong>OK</strong>. The transparent graphics overlay will render immediately over your game capture or camera feed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
