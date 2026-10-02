import React, { useEffect, useState } from 'react';
import { Match, OverlayConfig } from '../types/sports';
import { useRealtimeSocket } from '../hooks/useRealtimeSocket';
import { fetchMatch, fetchOverlay } from '../services/api';
import { Template1BottomScoreBar } from '../components/overlay/Template1BottomScoreBar';
import { CricketBottomBar } from '../components/overlay/CricketBottomBar';
import { FootballScoreBug } from '../components/overlay/FootballScoreBug';
import { RacquetVolleyScoreBug } from '../components/overlay/RacquetVolleyScoreBug';
import { BroadcastAlertOverlay } from '../components/overlay/BroadcastAlertOverlay';

interface OverlayViewProps {
  token: string;
}

export const OverlayView: React.FC<OverlayViewProps> = ({ token }) => {
  const [match, setMatch] = useState<Match | null>(null);
  const [config, setConfig] = useState<OverlayConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initial load: Try overlay token first, fallback to direct match ID
  useEffect(() => {
    fetchOverlay(token)
      .then((data) => {
        setMatch(data.match);
        setConfig(data.config);
      })
      .catch(() => {
        // If not found by token, try direct matchId
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

  // Real-time updates via WebSockets
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
      if (config) {
        setConfig({ ...config, activeAlert: alert });
      }
    },
  });

  if (error) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-transparent">
        <div className="bg-slate-950/90 text-rose-400 border border-rose-500/40 px-6 py-3 rounded-lg font-mono text-sm shadow-2xl backdrop-blur">
          {error}
        </div>
      </div>
    );
  }

  if (!match || !config) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-transparent">
        <div className="bg-slate-950/80 text-slate-400 px-4 py-2 rounded text-xs font-mono backdrop-blur">
          Connecting to live broadcast stream...
        </div>
      </div>
    );
  }

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
      {/* Broadcast Alert Popups (Wickets, Boundaries, Goals) */}
      <BroadcastAlertOverlay
        alert={config.activeAlert || null}
        onDismiss={() => {
          setConfig({ ...config, activeAlert: null });
        }}
      />

      {/* Main Overlay Graphic: Bottom Score Bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 items-center flex flex-col pointer-events-none transition-all duration-200">
        {match.sport === 'cricket' && match.cricketState && (
          config.template === 'compact_bug' ? (
            <CricketBottomBar
              teamA={match.teamA}
              teamB={match.teamB}
              state={match.cricketState}
              config={config}
              tournamentName={match.tournament}
            />
          ) : (
            <Template1BottomScoreBar
              teamA={match.teamA}
              teamB={match.teamB}
              state={match.cricketState}
              tournament={match.tournament}
            />
          )
        )}

        {match.sport === 'football' && match.footballState && (
          <div className="absolute top-8 left-8">
            <FootballScoreBug
              teamA={match.teamA}
              teamB={match.teamB}
              state={match.footballState}
              config={config}
              tournamentName={match.tournament}
            />
          </div>
        )}

        {(match.sport === 'badminton' || match.sport === 'table_tennis' || match.sport === 'volleyball') && (
          <div className="absolute top-8 left-8">
            <RacquetVolleyScoreBug match={match} config={config} />
          </div>
        )}
      </div>
    </div>
  );
};
