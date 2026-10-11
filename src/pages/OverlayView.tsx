import React, { useEffect, useRef, useState } from 'react';
import { Match, OverlayConfig } from '../types/sports';
import { useRealtimeSocket } from '../hooks/useRealtimeSocket';
import { fetchMatch, fetchOverlay } from '../services/api';
import { CricketBottomBar } from '../components/overlay/CricketBottomBar';
import { FootballScoreBug } from '../components/overlay/FootballScoreBug';
import { BasketballScoreBug } from '../components/overlay/BasketballScoreBug';
import { RacquetVolleyScoreBug } from '../components/overlay/RacquetVolleyScoreBug';
import { OutdoorSportsScoreBug } from '../components/overlay/OutdoorSportsScoreBug';
import { BroadcastAlertOverlay } from '../components/overlay/BroadcastAlertOverlay';

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
        <div className="bg-[#070b14]/80 text-cyan-400 px-4 py-2 rounded text-xs font-mono backdrop-blur">
          Connecting to live broadcast stream...
        </div>
      </div>
    );
  }

  const ytVideoId = streamFeed?.youtubeUrl ? extractYouTubeVideoId(streamFeed.youtubeUrl) : null;

  return (
    <div
      className="w-screen h-screen overflow-hidden bg-transparent select-none relative font-sans"
      style={{
        width: '1920px',
        height: '1080px',
        maxWidth: '100vw',
        maxHeight: '100vh',
      }}
    >
      {/* Optional Hosted Live Camera Layer (YouTube Live, Twitch, Webcam, or Custom HLS/MP4) */}
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

      {/* Bottom Centered Overlays (Cricket & Basketball) */}
      {(match.sport === 'cricket' || match.sport === 'basketball') && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 items-center flex flex-col pointer-events-none transition-all duration-200 z-10">
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
        </div>
      )}

      {/* Top-Left Broadcast ScoreBugs (Football, Tennis, Badminton, Table Tennis, Volleyball, Field Hockey, Baseball, Rugby) */}
      {match.sport === 'football' && match.footballState && (
        <div className="absolute top-8 left-8 pointer-events-none z-10">
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
        <div className="absolute top-8 left-8 pointer-events-none z-10">
          <RacquetVolleyScoreBug match={match} config={config} />
        </div>
      )}

      {(match.sport === 'field_hockey' ||
        match.sport === 'baseball' ||
        match.sport === 'rugby') && (
        <div className="absolute top-8 left-8 pointer-events-none z-10">
          <OutdoorSportsScoreBug match={match} config={config} />
        </div>
      )}
    </div>
  );
};
