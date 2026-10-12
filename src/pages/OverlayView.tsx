import React, { useEffect, useRef, useState } from 'react';
import { Match, OverlayConfig, OverlayPosition } from '../types/sports';
import { useRealtimeSocket } from '../hooks/useRealtimeSocket';
import { fetchMatch, fetchOverlay } from '../services/api';
import { CricketBottomBar } from '../components/overlay/CricketBottomBar';
import { FootballScoreBug } from '../components/overlay/FootballScoreBug';
import { BasketballScoreBug } from '../components/overlay/BasketballScoreBug';
import { RacquetVolleyScoreBug } from '../components/overlay/RacquetVolleyScoreBug';
import { OutdoorSportsScoreBug } from '../components/overlay/OutdoorSportsScoreBug';
import { KabaddiScoreBug } from '../components/overlay/KabaddiScoreBug';
import { BroadcastAlertOverlay } from '../components/overlay/BroadcastAlertOverlay';
import { Copy, Check, Move } from 'lucide-react';
import { MarketingluLoadingScreen } from '../components/common/MarketingluLoadingScreen';

interface OverlayViewProps {
  token: string;
}

export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.slice(1).split('/')[0] || null;
    }
    if (parsed.searchParams.has('v')) {
      return parsed.searchParams.get('v');
    }
    const parts = parsed.pathname.split('/').filter(Boolean);
    const embedIdx = parts.findIndex((p) => p === 'embed' || p === 'live' || p === 'shorts');
    if (embedIdx !== -1 && parts[embedIdx + 1]) {
      return parts[embedIdx + 1];
    }
  } catch {
    const match = trimmed.match(/(?:v=|\/embed\/|\/live\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (match) return match[1];
  }
  return null;
}

export const OverlayView: React.FC<OverlayViewProps> = ({ token }) => {
  const [match, setMatch] = useState<Match | null>(null);
  const [config, setConfig] = useState<OverlayConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);

  // Drag-and-drop state for interactive positioning calibration
  const [customCoords, setCustomCoords] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Parse URL search parameters (e.g. ?pos=top-right&x=120&y=40&scale=0.9&movable=1)
  const searchParams = new URLSearchParams(window.location.search);
  const urlPos = (searchParams.get('pos') as OverlayPosition) || null;
  const urlX = searchParams.get('x');
  const urlY = searchParams.get('y');
  const urlScale = searchParams.get('scale');
  const urlOpacity = searchParams.get('opacity');
  const urlTheme = searchParams.get('theme');
  const isMovableParam =
    searchParams.get('movable') === '1' ||
    searchParams.get('movable') === 'true' ||
    searchParams.get('move') === 'true';

  useEffect(() => {
    fetchOverlay(token)
      .then((data) => {
        setMatch(data.match);
        setConfig(data.config);
      })
      .catch(() => {
        fetchMatch(token)
          .then((m) => {
            setMatch(m);
            setConfig(m.overlayConfig);
          })
          .catch((err) => {
            console.error('Failed to load overlay:', err);
            setError('Overlay ID not found or expired');
          });
      });
  }, [token]);

  useRealtimeSocket({
    token,
    matchId: match?.id,
    onMatchUpdate: (updatedMatch) => {
      setMatch(updatedMatch);
      setConfig(updatedMatch.overlayConfig);
    },
    onOverlayUpdate: (data) => {
      setMatch(data.match);
      setConfig(data.config);
    },
    onAlertTrigger: (alert) => {
      setConfig((prev) => (prev ? { ...prev, activeAlert: alert } : prev));
    },
  });

  const streamFeed = config?.streamFeed;
  const shouldRenderCameraLayer = Boolean(
    streamFeed?.embedInOverlay &&
      streamFeed.activeSource &&
      streamFeed.activeSource !== 'transparent' &&
      streamFeed.activeSource !== 'dark'
  );

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    if (shouldRenderCameraLayer && streamFeed?.activeSource === 'webcam') {
      navigator.mediaDevices
        ?.getUserMedia({ video: { width: 1920, height: 1080 }, audio: false })
        .then((stream) => {
          activeStream = stream;
          if (webcamVideoRef.current) {
            webcamVideoRef.current.srcObject = stream;
          }
        })
        .catch(() => {});
    }
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [shouldRenderCameraLayer, streamFeed?.activeSource]);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isMovableParam && !e.altKey) return;
    e.preventDefault();
    const currentX = customCoords?.x ?? (urlX ? parseInt(urlX, 10) : 32);
    const currentY = customCoords?.y ?? (urlY ? parseInt(urlY, 10) : 32);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: currentX,
      initY: currentY,
    };
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;
    setCustomCoords({
      x: Math.max(0, Math.min(1820, dragStartRef.current.initX + deltaX)),
      y: Math.max(0, Math.min(1000, dragStartRef.current.initY + deltaY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (error) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-transparent">
        <div className="bg-[#070b14]/90 text-rose-400 border border-rose-500/40 px-6 py-3 rounded-lg font-mono text-sm shadow-2xl backdrop-blur">
          {error}
        </div>
      </div>
    );
  }

  if (!match || !config) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-transparent">
        <div className="bg-[#070b14]/95 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
          <MarketingluLoadingScreen
            message="Connecting OBS Browser Source..."
            subMessage="Sub-second socket handshake & overlay layer initialization"
            fullScreen={false}
            size="sm"
            showProgress={true}
          />
        </div>
      </div>
    );
  }

  const ytVideoId = streamFeed?.youtubeUrl ? extractYouTubeVideoId(streamFeed.youtubeUrl) : null;

  // Determine effective position, scale and opacity
  const defaultPosition = match.sport === 'cricket' ? 'bottom-center' : 'top-left';
  const effectivePos = urlPos || config.position || defaultPosition;
  const effectiveScale = urlScale ? parseFloat(urlScale) : config.scale || 1;
  const effectiveOpacity = urlOpacity ? parseFloat(urlOpacity) : config.opacity || 1;

  // Compute CSS placement based on position presets or coordinates
  let placementStyles: React.CSSProperties = {
    position: 'absolute',
    zIndex: 20,
    opacity: effectiveOpacity,
    transition: isDragging ? 'none' : 'transform 0.2s ease-out',
  };

  if (customCoords) {
    placementStyles.top = `${customCoords.y}px`;
    placementStyles.left = `${customCoords.x}px`;
    placementStyles.transform = `scale(${effectiveScale})`;
    placementStyles.transformOrigin = 'top left';
  } else if (urlX !== null && urlY !== null) {
    placementStyles.top = urlY.includes('%') ? urlY : `${parseInt(urlY, 10)}px`;
    placementStyles.left = urlX.includes('%') ? urlX : `${parseInt(urlX, 10)}px`;
    placementStyles.transform = `scale(${effectiveScale})`;
    placementStyles.transformOrigin = 'top left';
  } else if (config.posX !== undefined && config.posY !== undefined) {
    placementStyles.top = `${config.posY}px`;
    placementStyles.left = `${config.posX}px`;
    placementStyles.transform = `scale(${effectiveScale})`;
    placementStyles.transformOrigin = 'top left';
  } else {
    // Preset Position Mapping
    switch (effectivePos) {
      case 'top-left':
        placementStyles.top = '32px';
        placementStyles.left = '32px';
        placementStyles.transform = `scale(${effectiveScale})`;
        placementStyles.transformOrigin = 'top left';
        break;
      case 'top-center':
        placementStyles.top = '32px';
        placementStyles.left = '50%';
        placementStyles.transform = `translateX(-50%) scale(${effectiveScale})`;
        placementStyles.transformOrigin = 'top center';
        break;
      case 'top-right':
        placementStyles.top = '32px';
        placementStyles.right = '32px';
        placementStyles.transform = `scale(${effectiveScale})`;
        placementStyles.transformOrigin = 'top right';
        break;
      case 'bottom-left':
        placementStyles.bottom = '32px';
        placementStyles.left = '32px';
        placementStyles.transform = `scale(${effectiveScale})`;
        placementStyles.transformOrigin = 'bottom left';
        break;
      case 'bottom-right':
        placementStyles.bottom = '32px';
        placementStyles.right = '32px';
        placementStyles.transform = `scale(${effectiveScale})`;
        placementStyles.transformOrigin = 'bottom right';
        break;
      case 'center':
        placementStyles.top = '50%';
        placementStyles.left = '50%';
        placementStyles.transform = `translate(-50%, -50%) scale(${effectiveScale})`;
        placementStyles.transformOrigin = 'center center';
        break;
      case 'bottom-center':
      case 'bottom':
      default:
        placementStyles.bottom = '32px';
        placementStyles.left = '50%';
        placementStyles.transform = `translateX(-50%) scale(${effectiveScale})`;
        placementStyles.transformOrigin = 'bottom center';
        break;
    }
  }

  // Generate URL for copy
  const currentPosParam = customCoords
    ? `?x=${customCoords.x}&y=${customCoords.y}&scale=${effectiveScale}`
    : `?pos=${effectivePos}&scale=${effectiveScale}`;
  const calibratedObsUrl = `${window.location.origin}/overlay/${token}${currentPosParam}`;

  const copyCalibratedUrl = () => {
    navigator.clipboard.writeText(calibratedObsUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div
      className="w-screen h-screen overflow-hidden bg-transparent select-none relative font-sans"
      style={{
        width: '1920px',
        height: '1080px',
        maxWidth: '100vw',
        maxHeight: '100vh',
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Optional Camera Layer */}
      {shouldRenderCameraLayer && streamFeed && (
        <div className="absolute inset-0 z-0 overflow-hidden bg-black pointer-events-none">
          {streamFeed.activeSource === 'youtube_live' && ytVideoId && (
            <iframe
              src={`https://www.youtube.com/embed/${ytVideoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1`}
              title="YouTube Live Camera Feed"
              className="w-full h-full object-cover border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          )}
          {streamFeed.activeSource === 'twitch_live' && streamFeed.twitchChannel && (
            <iframe
              src={`https://player.twitch.tv/?channel=${encodeURIComponent(
                streamFeed.twitchChannel
              )}&parent=${window.location.hostname}&muted=true&autoplay=true`}
              title="Twitch Live Camera Feed"
              className="w-full h-full object-cover border-0"
              allowFullScreen
            />
          )}
          {streamFeed.activeSource === 'webcam' && (
            <video
              ref={webcamVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}
          {streamFeed.activeSource === 'custom_stream' && streamFeed.customStreamUrl && (
            <video
              src={streamFeed.customStreamUrl}
              autoPlay
              playsInline
              muted
              loop
              className="w-full h-full object-cover"
            />
          )}
        </div>
      )}

      {/* Broadcast Alert Popups (Wickets, Boundaries, Goals, 3-Pointers, Aces) */}
      <BroadcastAlertOverlay
        alert={config.activeAlert || null}
        onDismiss={() => {
          setConfig((prev) => (prev ? { ...prev, activeAlert: null } : prev));
        }}
      />

      {/* Interactive Scoreboard Container with Dynamic URL Positioning & Drag Mover */}
      <div
        style={placementStyles}
        onMouseDown={handleMouseDown}
        className={`${isMovableParam ? 'cursor-move ring-2 ring-cyan-400/50 rounded-lg p-1' : 'pointer-events-none'}`}
      >
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
          <FootballScoreBug
            teamA={match.teamA}
            teamB={match.teamB}
            state={match.footballState}
            config={config}
            tournamentName={match.tournament}
          />
        )}

        {(match.sport === 'tennis' ||
          match.sport === 'badminton' ||
          match.sport === 'table_tennis' ||
          match.sport === 'volleyball') && (
          <RacquetVolleyScoreBug match={match} config={config} />
        )}

        {(match.sport === 'field_hockey' ||
          match.sport === 'baseball' ||
          match.sport === 'rugby') && (
          <OutdoorSportsScoreBug match={match} config={config} />
        )}

        {match.sport === 'kabaddi' && match.kabaddiState && (
          <KabaddiScoreBug
            teamA={match.teamA}
            teamB={match.teamB}
            state={match.kabaddiState}
            config={config}
            tournamentName={match.tournament}
          />
        )}
      </div>

      {/* Calibration HUD (Visible when movable=1 query parameter is passed for OBS Source Setup) */}
      {isMovableParam && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2.5 bg-[#070b14]/90 backdrop-blur-md border border-cyan-500/40 text-white px-3 py-2 rounded-lg text-xs font-mono shadow-2xl">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <Move className="w-3.5 h-3.5" />
            <span>OBS Position Mode</span>
          </div>
          <span className="text-slate-400">|</span>
          <span className="text-slate-300 font-medium">
            {customCoords
              ? `X: ${customCoords.x}px • Y: ${customCoords.y}px`
              : `Preset: ${effectivePos}`}
          </span>
          <button
            onClick={copyCalibratedUrl}
            className="flex items-center gap-1 px-2.5 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded text-[11px] transition-colors cursor-pointer"
          >
            {copiedUrl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copiedUrl ? 'Copied!' : 'Copy OBS URL'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
