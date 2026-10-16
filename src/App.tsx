import React, { useState, useEffect, useCallback } from 'react';
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
import { PanelGuideModal } from './components/common/PanelGuideModal';
import { SettingsModal } from './components/layout/SettingsModal';
import { AuthModal } from './components/auth/AuthModal';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { fetchActiveUser } from './services/api';
import { UserProfile } from './types/sports';
import { MarketingluLoadingScreen } from './components/common/MarketingluLoadingScreen';
import { CricketBallPreloader } from './components/common/CricketBallPreloader';

const TAB_PAGE_TITLES: Record<string, string> = {
  dashboard: 'MarketinGlu | Live Broadcast Dashboard',
  scoring: 'MarketinGlu | ICC Cricket Scoring Console',
  'multi-scoring': 'MarketinGlu | Multi-Sport Broadcast Console',
  'football-scoring': 'MarketinGlu | Football Broadcast Console',
  create: 'MarketinGlu | New Match Setup',
  'overlay-control': 'MarketinGlu | OBS Overlay Studio',
  'obs-guide': 'MarketinGlu | OBS & vMix Integration Guide',
  'rule-books': 'MarketinGlu | Multi-Sport Official Rule Books',
  architecture: 'MarketinGlu | 3-Tier Broadcast Architecture',
  reviews: 'MarketinGlu | Verified Reviews & Ratings',
  pricing: 'MarketinGlu | Broadcast License Passes',
  legal: 'MarketinGlu | Indian Legal & Statutory Compliance',
};

function parseCurrentLocation(): { tab: string; matchId?: string } {
  const pathname = window.location.pathname.replace(/^\/+/, '').split('/')[0] || '';
  const searchParams = new URLSearchParams(window.location.search);
  const matchIdParam = searchParams.get('matchId') || undefined;

  const validTabs = [
    'dashboard',
    'scoring',
    'multi-scoring',
    'football-scoring',
    'create',
    'overlay-control',
    'obs-guide',
    'rule-books',
    'architecture',
    'reviews',
    'pricing',
    'legal',
  ];

  if (validTabs.includes(pathname)) {
    return { tab: pathname, matchId: matchIdParam };
  }

  return { tab: 'dashboard', matchId: matchIdParam };
}

function AppContent() {
  const { isRedWhite } = useTheme();
  const { info } = useToast();

  const [routeState, setRouteState] = useState<{ tab: string; matchId?: string }>(() => parseCurrentLocation());
  const currentTab = routeState.tab;
  const selectedMatchId = routeState.matchId || 'match_t20_ind_aus';

  const [hasAcceptedPolicies, setHasAcceptedPolicies] = useState<boolean>(() => isPolicyAccepted());
  const [showPolicyModal, setShowPolicyModal] = useState<boolean>(() => !isPolicyAccepted());
  const [showHelpDesk, setShowHelpDesk] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);

  const { isConnected } = useRealtimeSocket({});

  const loadUser = useCallback(() => {
    fetchActiveUser()
      .then((res) => setActiveUser(res.activeUser))
      .catch(console.error);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Handle browser Back / Forward (Popstate) navigation
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseCurrentLocation();
      setRouteState(parsed);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync document title with current tab
  useEffect(() => {
    const title = TAB_PAGE_TITLES[currentTab] || 'MarketinGlu | Sub-Second OBS Broadcast Suite';
    document.title = title;
  }, [currentTab]);

  // Global Keyboard Shortcuts (Shift+S -> Settings, Shift+L -> Log In, Shift+? -> Help)
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setShowSettings((prev) => !prev);
      } else if (e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setAuthMode('login');
        setShowAuthModal((prev) => !prev);
      } else if (e.shiftKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        setShowGuideModal((prev) => !prev);
      } else if (e.key === '?') {
        e.preventDefault();
        setShowGuideModal((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, []);

  const [isInitialBoot, setIsInitialBoot] = useState<boolean>(true);
  const [showPreloaderPreview, setShowPreloaderPreview] = useState<boolean>(false);

  // Check if current browser path is an overlay route (e.g. /overlay/:token)
  const pathname = window.location.pathname;
  if (pathname.startsWith('/overlay/')) {
    const token = pathname.replace('/overlay/', '').split('/')[0];
    return <OverlayView token={token} />;
  }

  // Brand New Cricket Ball Red & Proper White Preloader Screen
  if (showPreloaderPreview) {
    return (
      <CricketBallPreloader
        onClose={() => setShowPreloaderPreview(false)}
        showDismiss={true}
      />
    );
  }

  if (isInitialBoot) {
    return (
      <CricketBallPreloader
        onClose={() => setIsInitialBoot(false)}
        onComplete={() => setIsInitialBoot(false)}
        showDismiss={false}
      />
    );
  }

  const handleNavigate = (tab: string, matchId?: string) => {
    let targetMatchId = matchId || selectedMatchId;
    if (tab === 'multi-scoring' && targetMatchId === 'match_t20_ind_aus') {
      targetMatchId = 'match_nba_lal_gsw';
    }

    setRouteState({ tab, matchId: targetMatchId });

    // Build URL for browser history
    let newPath = tab === 'dashboard' ? '/' : `/${tab}`;
    if (['scoring', 'multi-scoring', 'football-scoring', 'overlay-control'].includes(tab) && targetMatchId) {
      newPath += `?matchId=${encodeURIComponent(targetMatchId)}`;
    }

    try {
      if (window.location.pathname + window.location.search !== newPath) {
        window.history.pushState(null, '', newPath);
      }
    } catch {
      // ignore
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <div
      className={`min-h-screen text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] antialiased transition-colors duration-300 ${
        isRedWhite
          ? 'bg-[#0b0507] selection:bg-rose-600 selection:text-white'
          : 'bg-[#070b14] selection:bg-cyan-500 selection:text-white'
      }`}
    >
      {/* Universal Top Bar with Theme Toggle, Settings & Auth Triggers */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenPolicies={() => setShowPolicyModal(true)}
        onOpenHelpDesk={() => setShowHelpDesk(true)}
        onOpenGuide={() => setShowGuideModal(true)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenAuth={handleOpenAuth}
        onOpenPreloader={() => setShowPreloaderPreview(true)}
        isConnected={isConnected}
      />

      {/* Main View Router with Safe Bottom Padding for Mobile Bottom Bar */}
      <main className="flex-1 pb-20 xl:pb-0 w-full overflow-x-hidden">
        {currentTab === 'dashboard' && (
          <Dashboard
            onNavigate={handleNavigate}
            onOpenGuide={() => setShowGuideModal(true)}
            onOpenPreloader={() => setShowPreloaderPreview(true)}
          />
        )}

        {currentTab === 'create' && (
          <CreateMatch
            onMatchCreated={(newId, sport) => {
              info(`Match created successfully: ${newId}`);
              handleNavigate(sport === 'cricket' ? 'scoring' : 'multi-scoring', newId);
            }}
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

      {/* Broadcaster Studio Settings & Hostinger DB Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        activeUser={activeUser}
        onOpenAuth={handleOpenAuth}
        onUserLoggedOut={(updated) => setActiveUser(updated)}
      />

      {/* Broadcaster Sign Up Window & Log In Modal (Hostinger DB) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
        onAuthSuccess={(user) => {
          setActiveUser(user);
          loadUser();
        }}
      />

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

      {/* Broadcast Operator Panel Guide Modal */}
      <PanelGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
