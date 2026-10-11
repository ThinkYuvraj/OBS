import React, { useEffect, useState } from 'react';
import { Match, OverlayConfig } from '../types/sports';
import { useRealtimeSocket } from '../hooks/useRealtimeSocket';
import { fetchMatch, fetchOverlay } from '../services/api';
import { Template1BottomScoreBar } from '../components/overlay/Template1BottomScoreBar';
import { CricketBottomBar } from '../components/overlay/CricketBottomBar';
import { FootballScoreBug } from '../components/overlay/FootballScoreBug';
import { BasketballScoreBug } from '../components/overlay/BasketballScoreBug';
import { RacquetVolleyScoreBug } from '../components/overlay/RacquetVolleyScoreBug';
import { OutdoorSportsScoreBug } from '../components/overlay/OutdoorSportsScoreBug';
import { BroadcastAlertOverlay } from '../components/overlay/BroadcastAlertOverlay';

interface OverlayViewProps {
  token: string;
}

export const OverlayView: React.FC<OverlayViewProps> = ({ token }) => {
  const [match, setMatch] = useState<Match | null>(null);
  const [config, setConfig] = useState<OverlayConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      {/* Broadcast Alert Popups (Wickets, Boundaries, Goals, 3-Pointers, Aces) */}
      <BroadcastAlertOverlay
        alert={config.activeAlert || null}
        onDismiss={() => {
          setConfig({ ...config, activeAlert: null });
        }}
      />

      {/* Bottom Centered Overlays (Cricket & Basketball) */}
      {(match.sport === 'cricket' || match.sport === 'basketball') && (
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
        <div className="absolute top-8 left-8 pointer-events-none">
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
        <div className="absolute top-8 left-8 pointer-events-none">
          <RacquetVolleyScoreBug match={match} config={config} />
        </div>
      )}

      {(match.sport === 'field_hockey' ||
        match.sport === 'baseball' ||
        match.sport === 'rugby') && (
        <div className="absolute top-8 left-8 pointer-events-none">
          <OutdoorSportsScoreBug match={match} config={config} />
        </div>
      )}
    </div>
  );
};
