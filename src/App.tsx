import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Dashboard } from './pages/Dashboard';
import { CreateMatch } from './pages/CreateMatch';
import { ScoringConsole } from './pages/ScoringConsole';
import { MultiSportConsole } from './pages/MultiSportConsole';
import { OverlayControl } from './pages/OverlayControl';
import { ObsSetupGuide } from './pages/ObsSetupGuide';
import { OverlayView } from './pages/OverlayView';
import { useRealtimeSocket } from './hooks/useRealtimeSocket';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedMatchId, setSelectedMatchId] = useState<string>('match_t20_ind_aus');
  const { isConnected } = useRealtimeSocket({});

  // Check if current browser path is an overlay route (e.g. /overlay/:token)
  const pathname = window.location.pathname;
  if (pathname.startsWith('/overlay/')) {
    const token = pathname.replace('/overlay/', '').split('/')[0];
    return <OverlayView token={token} />;
  }

  const handleNavigate = (tab: string, matchId?: string) => {
    if (matchId) {
      setSelectedMatchId(matchId);
    } else if (tab === 'multi-scoring' && selectedMatchId === 'match_t20_ind_aus') {
      setSelectedMatchId('match_nba_lal_gsw');
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Universal Top Bar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        isConnected={isConnected}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentTab === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}

        {currentTab === 'create' && (
          <CreateMatch
            onMatchCreated={(newId, sport) =>
              handleNavigate(sport === 'cricket' ? 'scoring' : 'multi-scoring', newId)
            }
            onCancel={() => handleNavigate('dashboard')}
          />
        )}

        {currentTab === 'scoring' && (
          <ScoringConsole
            matchId={
              selectedMatchId.startsWith('match_t20') || selectedMatchId.includes('cricket')
                ? selectedMatchId
                : 'match_t20_ind_aus'
            }
            onBack={() => handleNavigate('dashboard')}
          />
        )}

        {(currentTab === 'football-scoring' || currentTab === 'multi-scoring') && (
          <MultiSportConsole
            matchId={
              selectedMatchId === 'match_t20_ind_aus' ? 'match_nba_lal_gsw' : selectedMatchId
            }
            onBack={() => handleNavigate('dashboard')}
            onOpenOverlayStudio={(id) => handleNavigate('overlay-control', id)}
          />
        )}

        {currentTab === 'overlay-control' && (
          <OverlayControl
            matchId={selectedMatchId || 'match_t20_ind_aus'}
            onBack={() => handleNavigate('dashboard')}
          />
        )}

        {currentTab === 'obs-guide' && (
          <ObsSetupGuide onBack={() => handleNavigate('dashboard')} />
        )}
      </main>
    </div>
  );
}
