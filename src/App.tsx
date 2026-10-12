import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Dashboard } from './pages/Dashboard';
import { CreateMatch } from './pages/CreateMatch';
import { ScoringConsole } from './pages/ScoringConsole';
import { MultiSportConsole } from './pages/MultiSportConsole';
import { OverlayControl } from './pages/OverlayControl';
import { ObsSetupGuide } from './pages/ObsSetupGuide';
import { OverlayView } from './pages/OverlayView';
import { ArchitectureView } from './pages/ArchitectureView';
import { RuleBooks } from './pages/RuleBooks';
import { ReviewsPage } from './pages/ReviewsPage';
import { PricingPage } from './pages/PricingPage';
import { LegalCompliancePage } from './pages/LegalCompliancePage';
import { useRealtimeSocket } from './hooks/useRealtimeSocket';
import { PolicyAgreementModal, isPolicyAccepted } from './components/common/PolicyAgreementModal';
import { HelpDeskModal } from './components/common/HelpDeskModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedMatchId, setSelectedMatchId] = useState<string>('match_t20_ind_aus');
  const [hasAcceptedPolicies, setHasAcceptedPolicies] = useState<boolean>(() => isPolicyAccepted());
  const [showPolicyModal, setShowPolicyModal] = useState<boolean>(() => !isPolicyAccepted());
  const [showHelpDesk, setShowHelpDesk] = useState<boolean>(false);
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
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] antialiased selection:bg-cyan-500 selection:text-white">
      {/* Universal Top Bar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenPolicies={() => setShowPolicyModal(true)}
        onOpenHelpDesk={() => setShowHelpDesk(true)}
        isConnected={isConnected}
      />

      {/* Main View Router with Safe Bottom Padding for Mobile Bottom Bar */}
      <main className="flex-1 pb-20 xl:pb-0 w-full overflow-x-hidden">
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
          <ObsSetupGuide
            onBack={() => handleNavigate('dashboard')}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'rule-books' && (
          <RuleBooks
            onBack={() => handleNavigate('dashboard')}
            onNavigateToConsole={(sport) =>
              handleNavigate(sport === 'cricket' ? 'scoring' : 'multi-scoring')
            }
          />
        )}

        {currentTab === 'architecture' && (
          <ArchitectureView
            onBack={() => handleNavigate('dashboard')}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'reviews' && (
          <ReviewsPage
            onBack={() => handleNavigate('dashboard')}
            onNavigateToConsole={(sport) =>
              handleNavigate(sport === 'cricket' ? 'scoring' : 'multi-scoring')
            }
          />
        )}

        {currentTab === 'pricing' && (
          <PricingPage
            onBack={() => handleNavigate('dashboard')}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'legal' && (
          <LegalCompliancePage
            onBack={() => handleNavigate('dashboard')}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Mandatory User Policies & Broadcast Compliance Gate */}
      <PolicyAgreementModal
        isOpen={showPolicyModal || !hasAcceptedPolicies}
        canDismiss={hasAcceptedPolicies}
        onAccept={() => {
          setHasAcceptedPolicies(true);
          setShowPolicyModal(false);
        }}
        onClose={() => {
          if (hasAcceptedPolicies) {
            setShowPolicyModal(false);
          }
        }}
      />

      {/* Client Facing Help Desk & Issue Resolution Modal */}
      <HelpDeskModal
        isOpen={showHelpDesk}
        onClose={() => setShowHelpDesk(false)}
      />
    </div>
  );
}
