import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Match,
  OverlayConfig,
  ProductionDestination,
  StreamCameraSourceType,
  StreamFeedConfig,
} from '../types/sports';
import { fetchMatch, fetchMatches, updateOverlayConfig, triggerOverlayTest } from '../services/api';
import {
  ArrowLeft,
  Copy,
  Check,
  Sliders,
  ExternalLink,
  Zap,
  Video,
  Radio,
  Camera,
  Play,
  Square,
  Eye,
  EyeOff,
} from 'lucide-react';
import { CricketBottomBar } from '../components/overlay/CricketBottomBar';
import { FootballScoreBug } from '../components/overlay/FootballScoreBug';
import { BasketballScoreBug } from '../components/overlay/BasketballScoreBug';
import { RacquetVolleyScoreBug } from '../components/overlay/RacquetVolleyScoreBug';
import { OutdoorSportsScoreBug } from '../components/overlay/OutdoorSportsScoreBug';
import { BroadcastAlertOverlay } from '../components/overlay/BroadcastAlertOverlay';
import { extractYouTubeVideoId } from './OverlayView';
import { useRealtimeSocket } from '../hooks/useRealtimeSocket';
import { MarketingluLoadingScreen } from '../components/common/MarketingluLoadingScreen';

interface OverlayControlProps {
  matchId: string;
  onBack: () => void;
}

const DEFAULT_DESTINATIONS: ProductionDestination[] = [
  {
    id: 'dest_youtube_live',
    platform: 'youtube_live',
    name: 'YouTube Live Studio (Primary 1080p60)',
    rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2',
    streamKey: 'yt-live-9842-cyan-sky-hd',
    enabled: true,
    status: 'live',
    bitrateKbps: 6800,
    resolution: '1080p60',
  },
  {
    id: 'dest_itv_broadcast',
    platform: 'itv_broadcast',
    name: 'ITV Sport / ITVX Live Uplink (UK Broadcast)',
    rtmpUrl: 'rtmp://ingest.itv-broadcast.co.uk/live/studio1',
    streamKey: 'itv-sport-uplink-4k-token',
    enabled: true,
    status: 'live',
    bitrateKbps: 8500,
    resolution: '1080p60',
  },
  {
    id: 'dest_twitch_tv',
    platform: 'twitch_tv',
    name: 'Twitch Sports Global Channel',
    rtmpUrl: 'rtmp://live.twitch.tv/app',
    streamKey: 'live_77410923_sports_hub',
    enabled: false,
    status: 'idle',
    bitrateKbps: 6000,
    resolution: '1080p60',
  },
  {
    id: 'dest_facebook_live',
    platform: 'facebook_live',
    name: 'Facebook Live Sports Simulcast',
    rtmpUrl: 'rtmps://live-api-s.facebook.com:443/rtmp/',
    streamKey: 'FB-55019283-0-AbCdEfG',
    enabled: false,
    status: 'idle',
    bitrateKbps: 4500,
    resolution: '1080p60',
  },
  {
    id: 'dest_custom_rtmp',
    platform: 'custom_rtmp',
    name: 'Custom SRT / RTMP / NDI Uplink',
    rtmpUrl: 'rtmp://stream.custom-cdn.io/live',
    streamKey: 'custom-broadcast-feed-01',
    enabled: false,
    status: 'idle',
    bitrateKbps: 6000,
    resolution: '1080p60',
  },
];

const DEFAULT_STREAM_FEED: StreamFeedConfig = {
  activeSource: 'stadium',
  youtubeUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
  twitchChannel: 'fiba',
  customStreamUrl: '',
  webcamAudioMuted: true,
  embedInOverlay: false,
  destinations: DEFAULT_DESTINATIONS,
};

export const OverlayControl: React.FC<OverlayControlProps> = ({ matchId, onBack }) => {
  const [activeId, setActiveId] = useState<string>(matchId);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [match, setMatch] = useState<Match | null>(null);
  const [config, setConfig] = useState<OverlayConfig | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedRtmpId, setCopiedRtmpId] = useState<string | null>(null);
  const [revealedKeyIds, setRevealedKeyIds] = useState<Record<string, boolean>>({});
  const [webcamError, setWebcamError] = useState<string | null>(null);

  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const loadData = useCallback(async (idToLoad: string) => {
    try {
      const [data, list] = await Promise.all([fetchMatch(idToLoad), fetchMatches()]);
      setMatch(data);
      setConfig({
        ...data.overlayConfig,
        streamFeed: data.overlayConfig.streamFeed || DEFAULT_STREAM_FEED,
      });
      setAllMatches(list);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    setActiveId(matchId);
    loadData(matchId);
  }, [matchId, loadData]);

  useRealtimeSocket({
    matchId: activeId,
    onMatchUpdate: (updatedMatch) => {
      if (updatedMatch.id === activeId) {
        setMatch(updatedMatch);
        setConfig((prev) => ({
          ...updatedMatch.overlayConfig,
          streamFeed:
            updatedMatch.overlayConfig.streamFeed ||
            prev?.streamFeed ||
            DEFAULT_STREAM_FEED,
        }));
      }
    },
  });

  const streamFeed: StreamFeedConfig = config?.streamFeed || DEFAULT_STREAM_FEED;
  const activeSource: StreamCameraSourceType = streamFeed.activeSource || 'stadium';

  // Manage local USB/HDMI Capture Card or Webcam video stream when activeSource === 'webcam'
  useEffect(() => {
    let mediaStream: MediaStream | null = null;
    if (activeSource === 'webcam') {
      setWebcamError(null);
      navigator.mediaDevices
        ?.getUserMedia({ video: { width: 1920, height: 1080 }, audio: false })
        .then((stream) => {
          mediaStream = stream;
          if (webcamVideoRef.current) {
            webcamVideoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          setWebcamError('Camera / Capture Card permission not granted or no device detected.');
        });
    }
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [activeSource]);

  if (!match || !config) {
    return (
      <MarketingluLoadingScreen
        message="Loading Broadcast Overlay Studio..."
        subMessage="Syncing lower-third positioning, Chroma key transparency, OBS browser source & CSS themes"
        fullScreen={true}
        onCancel={onBack}
      />
    );
  }

  // Immediate local UI update + debounced network persistence to prevent slider lag
  const handleUpdate = (patch: Partial<OverlayConfig>, immediate = false) => {
    const updated: OverlayConfig = { ...config, ...patch, theme: 'sky_broadcast' };
    setConfig(updated);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const pushUpdate = async () => {
      try {
        await updateOverlayConfig(match.activeOverlayToken, {
          ...patch,
          theme: 'sky_broadcast',
        });
      } catch (err) {
        console.error(err);
      }
    };

    if (immediate) {
      pushUpdate();
    } else {
      debounceTimerRef.current = setTimeout(pushUpdate, 140);
    }
  };

  const handleStreamFeedUpdate = (feedPatch: Partial<StreamFeedConfig>, immediate = true) => {
    const nextFeed: StreamFeedConfig = {
      ...streamFeed,
      ...feedPatch,
    };
    handleUpdate({ streamFeed: nextFeed }, immediate);
  };

  const handleDestinationPatch = (
    destId: string,
    destPatch: Partial<ProductionDestination>
  ) => {
    const updatedDestinations = (streamFeed.destinations || DEFAULT_DESTINATIONS).map((d) =>
      d.id === destId ? { ...d, ...destPatch } : d
    );
    handleStreamFeedUpdate({ destinations: updatedDestinations }, true);
  };

  const handleToggleAllPush = (goLive: boolean) => {
    const updatedDestinations = (streamFeed.destinations || DEFAULT_DESTINATIONS).map((d) =>
      d.enabled
        ? {
            ...d,
            status: (goLive ? 'live' : 'idle') as 'live' | 'idle',
            startedAt: goLive ? Date.now() : undefined,
          }
        : d
    );
    handleStreamFeedUpdate({ destinations: updatedDestinations }, true);
  };

  const handleTestAlert = async (type: string, title: string, subtitle: string) => {
    try {
      await triggerOverlayTest(match.activeOverlayToken, {
        type,
        title,
        subtitle,
        player: match.teamA.name,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const obsUrl = `${window.location.origin}/overlay/${match.activeOverlayToken}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(obsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyRtmpEndpoint = (dest: ProductionDestination) => {
    navigator.clipboard.writeText(`${dest.rtmpUrl}/${dest.streamKey}`);
    setCopiedRtmpId(dest.id);
    setTimeout(() => setCopiedRtmpId(null), 2000);
  };

  const ytVideoId = extractYouTubeVideoId(streamFeed.youtubeUrl);
  const destinations = streamFeed.destinations || DEFAULT_DESTINATIONS;
  const activeLiveOutputsCount = destinations.filter((d) => d.status === 'live').length;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 pb-16 w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0c1424] via-[#090f1f] to-[#0c1424] border-b border-slate-800/80 px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-[#060a14] border border-slate-800 hover:border-cyan-500/40 text-slate-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-[11px] font-mono font-bold text-cyan-400 uppercase">
              MARKETINGLU CYAN-SKY • CAMERA HOSTING &amp; ITV / YOUTUBE UPLINK STUDIO
            </div>
            <h1 className="text-xl font-black text-white tracking-tight font-['Space_Grotesk',sans-serif]">
              Overlay Studio, YouTube Live Camera &amp; ITV Broadcast Push
            </h1>
            <p className="text-xs text-slate-400">
              {match.sport.replace('_', ' ').toUpperCase()} • {match.name}
            </p>
          </div>
        </div>

        {/* Channel Switcher + Copy OBS URL */}
        <div className="flex flex-wrap items-center gap-2.5">
          {allMatches.length > 1 && (
            <select
              value={activeId}
              onChange={(e) => {
                setActiveId(e.target.value);
                loadData(e.target.value);
              }}
              className="bg-[#060a14] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-semibold focus:outline-none focus:border-cyan-400"
            >
              {allMatches.map((m) => (
                <option key={m.id} value={m.id}>
                  [{m.sport.replace('_', ' ').toUpperCase()}] {m.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={copyUrl}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl cursor-pointer whitespace-nowrap shadow-md shadow-cyan-500/20"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied OBS URL' : 'Copy OBS Browser Source URL'}</span>
          </button>
          <a
            href={obsUrl}
            target="_blank"
            rel="noreferrer"
            className="p-2 bg-[#0c1424] hover:bg-[#0d1a33] border border-slate-800 text-cyan-300 rounded-xl"
            title="Open Fullscreen Overlay View"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-6 space-y-6">
        {/* Live Broadcast Viewport Simulator with YouTube Live / Twitch / Webcam Camera Hosting */}
        <div className="bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-4 py-3 bg-[#060a14]/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-mono text-cyan-400 font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Program Feed (1920 × 1080p60)
              </span>
              {activeLiveOutputsCount > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-[10px] font-bold">
                  ON AIR • {activeLiveOutputsCount} UPLINKS (ITV / YT)
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 font-medium mr-1">Camera Source:</span>
              {(
                [
                  { id: 'youtube_live', label: 'YouTube Live Cam' },
                  { id: 'webcam', label: 'USB / HDMI Cam' },
                  { id: 'twitch_live', label: 'Twitch Cam' },
                  { id: 'custom_stream', label: 'HLS / MP4 URL' },
                  { id: 'stadium', label: 'Stadium Backdrop' },
                  { id: 'transparent', label: 'Alpha Grid' },
                ] as { id: StreamCameraSourceType; label: string }[]
              ).map((src) => (
                <button
                  key={src.id}
                  onClick={() => handleStreamFeedUpdate({ activeSource: src.id })}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                    activeSource === src.id
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm shadow-cyan-500/20'
                      : 'bg-[#0c1424] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {src.label}
                </button>
              ))}
            </div>
          </div>

          {/* 16:9 Canvas Container */}
          <div
            className={`w-full aspect-video relative flex flex-col justify-end p-8 overflow-hidden select-none transition-all ${
              activeSource === 'stadium'
                ? 'bg-cover bg-center'
                : activeSource === 'transparent'
                ? 'bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] bg-[#060a14]'
                : 'bg-[#060a14]'
            }`}
            style={
              activeSource === 'stadium'
                ? {
                    backgroundImage: `url(${
                      match.sport === 'football' ||
                      match.sport === 'field_hockey' ||
                      match.sport === 'rugby'
                        ? '/src/assets/images/football_stadium_lights_1790948631939.jpg'
                        : '/src/assets/images/cricket_stadium_lights_1790948618345.jpg'
                    })`,
                  }
                : undefined
            }
          >
            {activeSource === 'stadium' && (
              <div className="absolute inset-0 bg-black/35 pointer-events-none" />
            )}

            {/* 1. YouTube Live Hosted Camera Layer */}
            {activeSource === 'youtube_live' && (
              <div className="absolute inset-0 bg-black">
                {ytVideoId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${ytVideoId}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0&playsinline=1`}
                    title="YouTube Live Broadcast Camera"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-mono">
                    Paste a valid YouTube Live URL or Video ID below to host camera feed
                  </div>
                )}
              </div>
            )}

            {/* 2. Twitch Hosted Camera Layer */}
            {activeSource === 'twitch_live' && (
              <div className="absolute inset-0 bg-black">
                {streamFeed.twitchChannel ? (
                  <iframe
                    src={`https://player.twitch.tv/?channel=${encodeURIComponent(
                      streamFeed.twitchChannel
                    )}&parent=${window.location.hostname}&muted=true&autoplay=true`}
                    title="Twitch Broadcast Camera"
                    className="w-full h-full border-0"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-mono">
                    Enter a Twitch channel name below to host live camera
                  </div>
                )}
              </div>
            )}

            {/* 3. Local USB / HDMI Capture Card / Webcam Layer */}
            {activeSource === 'webcam' && (
              <div className="absolute inset-0 bg-black flex items-center justify-center">
                <video
                  ref={webcamVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {webcamError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#060a14]/90 p-6 text-center">
                    <div className="max-w-md space-y-2">
                      <Camera className="w-8 h-8 text-cyan-400 mx-auto" />
                      <div className="text-sm font-bold text-white">{webcamError}</div>
                      <p className="text-xs text-slate-400">
                        Connect an HDMI capture card or USB camera and allow browser camera access, or switch to YouTube Live Camera hosting.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. Custom HLS / MP4 Stream Layer */}
            {activeSource === 'custom_stream' && (
              <div className="absolute inset-0 bg-black flex items-center justify-center">
                {streamFeed.customStreamUrl ? (
                  <video
                    src={streamFeed.customStreamUrl}
                    autoPlay
                    playsInline
                    muted
                    loop
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-xs font-mono text-slate-400">
                    Enter a direct .mp4 / WebM / HLS stream URL in the Camera Hosting panel below
                  </div>
                )}
              </div>
            )}

            <BroadcastAlertOverlay
              alert={config.activeAlert || null}
              onDismiss={() => setConfig({ ...config, activeAlert: null })}
            />

            {/* Render Live Scorebug Overlay on top of Camera */}
            <div className="relative z-10 w-full flex flex-col items-center pointer-events-none">
              {match.sport === 'cricket' && match.cricketState && (
                <CricketBottomBar
                  teamA={match.teamA}
                  teamB={match.teamB}
                  state={match.cricketState}
                  config={config}
                  tournamentName={match.tournament}
                />
              )}

              {match.sport === 'basketball' && match.basketballState && (
                <BasketballScoreBug
                  teamA={match.teamA}
                  teamB={match.teamB}
                  state={match.basketballState}
                  config={config}
                  tournamentName={match.tournament}
                />
              )}

              {match.sport === 'football' && match.footballState && (
                <div className="self-start">
                  <FootballScoreBug
                    teamA={match.teamA}
                    teamB={match.teamB}
                    state={match.footballState}
                    config={config}
                    tournamentName={match.tournament}
                  />
                </div>
              )}

              {(match.sport === 'tennis' ||
                match.sport === 'badminton' ||
                match.sport === 'table_tennis' ||
                match.sport === 'volleyball') && (
                <div className="self-start">
                  <RacquetVolleyScoreBug match={match} config={config} />
                </div>
              )}

              {(match.sport === 'field_hockey' ||
                match.sport === 'baseball' ||
                match.sport === 'rugby') && (
                <div className="self-start">
                  <OutdoorSportsScoreBug match={match} config={config} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Camera Hosting (YouTube Live / Webcam / Stream) + ITV / Multi-Platform Uplink Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 5 Cols: Live Camera Hosting (YouTube Live, Capture Card, Twitch, HLS) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-cyan-400" />
                <span>YouTube Live &amp; Camera Feed Hosting</span>
              </h3>
              <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-mono font-bold text-cyan-300 uppercase">
                {activeSource.replace('_', ' ')}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Use a <strong>YouTube Live</strong> stream, USB/HDMI capture card, Twitch feed, or direct stream URL as your live camera source underneath the scorebug.
            </p>

            {/* YouTube Live URL Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                YouTube Live Camera URL or Video ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={streamFeed.youtubeUrl || ''}
                  onChange={(e) =>
                    handleStreamFeedUpdate(
                      { youtubeUrl: e.target.value, activeSource: 'youtube_live' },
                      false
                    )
                  }
                  placeholder="https://www.youtube.com/watch?v=... or https://youtube.com/live/..."
                  className="flex-1 bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                />
                <button
                  onClick={() => handleStreamFeedUpdate({ activeSource: 'youtube_live' }, true)}
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-xs font-bold text-white cursor-pointer shrink-0"
                >
                  Use YouTube
                </button>
              </div>
              {ytVideoId && (
                <div className="text-[11px] font-mono text-emerald-400">
                  ✓ Detected YouTube Stream ID: <strong>{ytVideoId}</strong>
                </div>
              )}
            </div>

            {/* Twitch & Custom HLS/MP4 Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Twitch Camera Channel
                </label>
                <input
                  type="text"
                  value={streamFeed.twitchChannel || ''}
                  onChange={(e) =>
                    handleStreamFeedUpdate({ twitchChannel: e.target.value }, false)
                  }
                  placeholder="e.g. fiba or sky_sports"
                  className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs text-white font-mono outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Direct Stream URL (.mp4 / WebM)
                </label>
                <input
                  type="text"
                  value={streamFeed.customStreamUrl || ''}
                  onChange={(e) =>
                    handleStreamFeedUpdate({ customStreamUrl: e.target.value }, false)
                  }
                  placeholder="https://.../live.mp4"
                  className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs text-white font-mono outline-none"
                />
              </div>
            </div>

            {/* Option to embed hosted camera directly inside /overlay/:token */}
            <div className="p-3 rounded-xl bg-[#060a14] border border-slate-800/90 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-white">
                  Embed Camera Feed in Fullscreen Broadcast URL
                </div>
                <div className="text-[11px] text-slate-400">
                  When enabled, <code className="text-cyan-300">/overlay/{match.activeOverlayToken}</code> renders both the hosted camera and scorebug together for direct ITV / YouTube web capture.
                </div>
              </div>
              <input
                type="checkbox"
                checked={Boolean(streamFeed.embedInOverlay)}
                onChange={(e) =>
                  handleStreamFeedUpdate({ embedInOverlay: e.target.checked }, true)
                }
                className="w-4 h-4 accent-cyan-400 shrink-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Right 7 Cols: Push to ITV, YouTube Live, Twitch, Facebook & Custom RTMP Distribution */}
          <div className="lg:col-span-7 bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  <span>Broadcast Uplink &amp; Multi-CDN Push (ITV / YouTube Live / RTMP)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure and push live scorebug + camera feeds to ITV Sport, YouTube Live, Twitch, Facebook Live, and custom SRT/RTMP servers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleAllPush(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white cursor-pointer shadow-sm shadow-cyan-500/20"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Push All Enabled</span>
                </button>
                <button
                  onClick={() => handleToggleAllPush(false)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#060a14] hover:bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Stop</span>
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {destinations.map((dest) => {
                const isLive = dest.status === 'live';
                const showKey = Boolean(revealedKeyIds[dest.id]);
                return (
                  <div
                    key={dest.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isLive
                        ? 'bg-[#091529]/90 border-cyan-500/50'
                        : 'bg-[#060a14] border-slate-800/90'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={dest.enabled}
                          onChange={(e) =>
                            handleDestinationPatch(dest.id, { enabled: e.target.checked })
                          }
                          className="accent-cyan-400 cursor-pointer"
                        />
                        <span className="text-xs font-extrabold text-white">{dest.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0c1424] text-cyan-300 border border-slate-800">
                          {dest.resolution} • {dest.bitrateKbps} kbps
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                            isLive
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-800/80 text-slate-400'
                          }`}
                        >
                          {isLive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          )}
                          {isLive ? 'PUSHING LIVE' : 'STANDBY'}
                        </span>

                        <button
                          onClick={() =>
                            handleDestinationPatch(dest.id, {
                              enabled: true,
                              status: isLive ? 'idle' : 'live',
                              startedAt: isLive ? undefined : Date.now(),
                            })
                          }
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                            isLive
                              ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                              : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40'
                          }`}
                        >
                          {isLive ? 'Stop Push' : 'Push Stream'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <div className="sm:col-span-6">
                        <input
                          type="text"
                          value={dest.rtmpUrl}
                          onChange={(e) =>
                            handleDestinationPatch(dest.id, { rtmpUrl: e.target.value })
                          }
                          placeholder="rtmp://..."
                          className="w-full bg-[#090f1f] border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] font-mono text-slate-300 outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div className="sm:col-span-4 relative flex items-center">
                        <input
                          type={showKey ? 'text' : 'password'}
                          value={dest.streamKey}
                          onChange={(e) =>
                            handleDestinationPatch(dest.id, { streamKey: e.target.value })
                          }
                          placeholder="Stream Key"
                          className="w-full bg-[#090f1f] border border-slate-800 rounded-lg pl-2.5 pr-7 py-1 text-[11px] font-mono text-cyan-300 outline-none focus:border-cyan-400"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setRevealedKeyIds((prev) => ({ ...prev, [dest.id]: !prev[dest.id] }))
                          }
                          className="absolute right-2 text-slate-400 hover:text-white cursor-pointer"
                          title="Toggle Stream Key Visibility"
                        >
                          {showKey ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <div className="sm:col-span-2 flex justify-end">
                        <button
                          onClick={() => copyRtmpEndpoint(dest)}
                          className="w-full flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-[#0c1424] hover:bg-[#111f38] border border-slate-800 text-[11px] font-mono text-slate-300 cursor-pointer"
                          title="Copy Full RTMP Ingest URL + Key"
                        >
                          {copiedRtmpId === dest.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>RTMP</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Controls & Test Triggers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Graphics Customization */}
          <div className="bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Broadcast Graphics Tuning</span>
              </h3>
              <div className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-400 text-[10px] font-mono font-bold text-cyan-300">
                MarketinGlu Cyan-Sky • DEFAULT
              </div>
            </div>

            <div className="space-y-4">
              {/* Locked Default Theme Indicator */}
              <div className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-400">
                <div className="h-2 w-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 mb-2" />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-extrabold text-white">MarketinGlu Cyan-Sky</div>
                    <div className="text-[10px] font-mono text-cyan-300">BRAND DEFAULT</div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    ACTIVE ON AIR
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Broadcast Ticker Banner Text
                </label>
                <input
                  type="text"
                  value={config.tickerText || ''}
                  onChange={(e) => handleUpdate({ tickerText: e.target.value }, false)}
                  placeholder="Enter live match ticker text..."
                  className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Scale: {Math.round((config.scale || 1) * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.7"
                    max="1.3"
                    step="0.05"
                    value={config.scale || 1}
                    onChange={(e) => handleUpdate({ scale: parseFloat(e.target.value) }, false)}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Opacity: {Math.round((config.opacity || 1) * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="1.0"
                    step="0.05"
                    value={config.opacity || 1}
                    onChange={(e) => handleUpdate({ opacity: parseFloat(e.target.value) }, false)}
                    className="w-full accent-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showBatters}
                    onChange={(e) => handleUpdate({ showBatters: e.target.checked }, true)}
                    className="accent-cyan-400"
                  />
                  <span>Show Player Stats</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showBowler}
                    onChange={(e) => handleUpdate({ showBowler: e.target.checked }, true)}
                    className="accent-cyan-400"
                  />
                  <span>Show Sub-Metrics</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showSponsor}
                    onChange={(e) => handleUpdate({ showSponsor: e.target.checked }, true)}
                    className="accent-cyan-400"
                  />
                  <span>Show Sponsor</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.animationsEnabled}
                    onChange={(e) => handleUpdate({ animationsEnabled: e.target.checked }, true)}
                    className="accent-cyan-400"
                  />
                  <span>Animations</span>
                </label>
              </div>
            </div>
          </div>

          {/* Test Alert Triggers */}
          <div className="bg-gradient-to-br from-[#0c1424]/95 via-[#0a1120]/95 to-[#060a14]/95 border border-slate-800/80 rounded-2xl p-5">
            <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Broadcast Alert Simulator</span>
            </h3>

            <p className="text-xs text-slate-400 mb-4">
              Test instant high-contrast broadcast graphic triggers to verify display inside OBS, YouTube Live, and ITV uplinks in real-time.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => handleTestAlert('four', 'FOUR RUNS!', 'Boundary down to third man')}
                className="p-2.5 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300 font-bold text-xs hover:bg-blue-600/30 cursor-pointer"
              >
                Trigger &quot;FOUR!&quot;
              </button>
              <button
                onClick={() => handleTestAlert('six', 'MAXIMUM! SIX!', 'Ball dispatched into top tier')}
                className="p-2.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs hover:bg-amber-500/30 cursor-pointer"
              >
                Trigger &quot;SIX!&quot;
              </button>
              <button
                onClick={() => handleTestAlert('wicket', 'WICKET!', 'Bowled him! Off-stump knocked')}
                className="p-2.5 rounded-lg bg-rose-600/20 border border-rose-500/40 text-rose-300 font-bold text-xs hover:bg-rose-600/30 cursor-pointer"
              >
                Trigger &quot;WICKET!&quot;
              </button>
              <button
                onClick={() => handleTestAlert('goal', 'GOAL!', 'Spectacular strike into top corner')}
                className="p-2.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs hover:bg-emerald-600/30 cursor-pointer"
              >
                Trigger &quot;GOAL!&quot;
              </button>
              <button
                onClick={() => handleTestAlert('three_pointer', '3-POINTER!', 'Downtown splash from deep!')}
                className="p-2.5 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-300 font-bold text-xs hover:bg-orange-500/30 cursor-pointer"
              >
                Trigger &quot;3-PT!&quot;
              </button>
              <button
                onClick={() => handleTestAlert('ace', 'SERVICE ACE!', '135 MPH unreturnable serve')}
                className="p-2.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-xs hover:bg-cyan-500/30 cursor-pointer"
              >
                Trigger &quot;ACE!&quot;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
