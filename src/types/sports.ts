export type SportType =
  | 'cricket'
  | 'football'
  | 'basketball'
  | 'tennis'
  | 'baseball'
  | 'rugby'
  | 'field_hockey'
  | 'volleyball'
  | 'badminton'
  | 'table_tennis'
  | 'kabaddi';

export type MatchStatus = 'upcoming' | 'live' | 'break' | 'completed' | 'abandoned';

export type CricketFormat = 'T20' | 'ODI' | 'TEST' | 'CUSTOM';

export interface BasketballMatchState {
  quarter: 1 | 2 | 3 | 4 | 'OT';
  clock: string; // e.g. "08:42"
  shotClock: number; // e.g. 24
  isTimerRunning: boolean;
  homeScore: number;
  awayScore: number;
  quarterScores: { home: number; away: number }[];
  homeFouls: number;
  awayFouls: number;
  homeTimeouts: number;
  awayTimeouts: number;
  possession: 'home' | 'away';
  lastPlay?: string;
}

export interface BaseballMatchState {
  inning: number;
  half: 'top' | 'bottom';
  balls: number; // 0-3
  strikes: number; // 0-2
  outs: number; // 0-2
  bases: {
    first: boolean;
    second: boolean;
    third: boolean;
  };
  homeScore: number;
  awayScore: number;
  homeHits: number;
  awayHits: number;
  homeErrors: number;
  awayErrors: number;
  pitcher?: string;
  batter?: string;
  lastPlay?: string;
}

export interface RugbyMatchState {
  half: '1st' | '2nd' | 'full_time';
  minute: number;
  isTimerRunning: boolean;
  homeScore: number;
  awayScore: number;
  homeTries: number;
  awayTries: number;
  homePenalties: number;
  awayPenalties: number;
  homeSinBin: number;
  awaySinBin: number;
  lastPlay?: string;
}

export interface FieldHockeyMatchState {
  quarter: 1 | 2 | 3 | 4 | 'SO';
  minute: number;
  isTimerRunning: boolean;
  homeScore: number;
  awayScore: number;
  homePenaltyCorners: number;
  awayPenaltyCorners: number;
  homeCards: { green: number; yellow: number; red: number };
  awayCards: { green: number; yellow: number; red: number };
  lastPlay?: string;
}

export interface BadmintonMatchState {
  sets: { home: number; away: number }[];
  currentSet: number;
  homePoints: number;
  awayPoints: number;
  server: 'home' | 'away';
  isGamePoint: boolean;
  isMatchPoint: boolean;
}

export interface TableTennisMatchState {
  sets: { home: number; away: number }[];
  currentSet: number;
  homePoints: number;
  awayPoints: number;
  server: 'home' | 'away';
  servesInTurn: number; // 0 or 1
  isGamePoint: boolean;
  isMatchPoint: boolean;
}

export interface VolleyballMatchState {
  sets: { home: number; away: number }[];
  currentSet: number;
  homeScore: number;
  awayScore: number;
  server: 'home' | 'away';
  homeTimeouts: number;
  awayTimeouts: number;
  isSetPoint: boolean;
  isMatchPoint: boolean;
}

export interface KabaddiMatchState {
  half: '1st' | '2nd' | 'full_time';
  minute: number;
  raidClock: number; // 30s countdown
  isTimerRunning: boolean;
  homeScore: number;
  awayScore: number;
  homeTouchPoints: number;
  awayTouchPoints: number;
  homeBonusPoints: number;
  awayBonusPoints: number;
  homeTacklePoints: number;
  awayTacklePoints: number;
  homeAllOutPoints: number;
  awayAllOutPoints: number;
  homeActivePlayers: number; // 0 to 7
  awayActivePlayers: number; // 0 to 7
  raidingTeam: 'home' | 'away';
  isDoOrDie: boolean;
  isSuperTackleOn: boolean;
  lastPlay?: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logoUrl?: string;
  color: string;
  secondaryColor?: string;
  squad: Player[];
}

export type PlayerRole =
  | 'batter'
  | 'bowler'
  | 'all-rounder'
  | 'wicketkeeper'
  | 'player'
  | 'raider'
  | 'defender'
  | 'forward'
  | 'midfielder'
  | 'goalkeeper'
  | 'guard'
  | 'center';

export interface Player {
  id: string;
  name: string;
  shortName?: string;
  role: PlayerRole;
  number?: number;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
}

export interface BatterStats {
  playerId: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOut: boolean;
  dismissal?: string;
}

export interface BowlerStats {
  playerId: string;
  name: string;
  overs: string; // e.g. "3.4"
  legalBalls: number;
  maidens: number;
  runsConceded: number;
  wickets: number;
  economy: number;
}

export interface OverSummary {
  overNumber: number;
  bowlerName: string;
  balls: {
    text: string; // e.g. '0', '1', '4', '6', 'W', 'Wd', 'Nb'
    runs: number;
    isWicket: boolean;
    isBoundary: boolean;
  }[];
  totalRuns: number;
}

export type WicketType =
  | 'bowled'
  | 'caught'
  | 'lbw'
  | 'run_out'
  | 'stumped'
  | 'hit_wicket'
  | 'retired_hurt';

export interface BallEvent {
  id: string;
  sequence: number;
  innings: number;
  overNumber: number; // 0-indexed over (e.g. over 0 means 1st over)
  ballInOver: number; // 1 to 6 (legal balls in that over)
  bowlerId: string;
  bowlerName: string;
  strikerId: string;
  strikerName: string;
  nonStrikerId: string;
  nonStrikerName: string;
  runsOffBat: number;
  isWide: boolean;
  isNoBall: boolean;
  isBye: boolean;
  isLegBye: boolean;
  penaltyRuns: number;
  totalRuns: number;
  isLegalBall: boolean;
  isWicket: boolean;
  wicketType?: WicketType;
  dismissedBatterId?: string;
  dismissedBatterName?: string;
  fielderName?: string;
  nextBatterId?: string;
  nextBatterName?: string;
  commentary?: string;
  timestamp: number;
}

export interface CricketInnings {
  inningsNumber: number;
  battingTeamId: string;
  bowlingTeamId: string;
  runs: number;
  wickets: number;
  legalBalls: number;
  oversFormatted: string; // e.g. "17.3"
  currentRunRate: number;
  requiredRunRate?: number;
  target?: number;
  extras: {
    wides: number;
    noBalls: number;
    byes: number;
    legByes: number;
    penalty: number;
    total: number;
  };
  batters: BatterStats[];
  bowlers: BowlerStats[];
  currentStrikerId: string;
  currentNonStrikerId: string;
  currentBowlerId: string;
  currentPartnership: {
    runs: number;
    balls: number;
  };
  fallOfWickets: {
    wicketNumber: number;
    score: number;
    overs: string;
    batterName: string;
    dismissal: string;
  }[];
  oversHistory: OverSummary[];
  isCompleted: boolean;
}

export interface CricketMatchState {
  format: CricketFormat;
  maxOvers: number;
  target?: number;
  currentInningsIndex: number; // 0 for 1st innings, 1 for 2nd innings
  innings: CricketInnings[];
  lastBallEvent?: BallEvent;
}

export interface FootballMatchState {
  half: '1st' | '2nd' | 'extra_1' | 'extra_2' | 'penalties' | 'full_time';
  minute: number;
  clock?: string; // e.g. "78:24"
  extraTime: number;
  isTimerRunning: boolean;
  homeScore: number;
  awayScore: number;
  homeFouls: number;
  awayFouls: number;
  homeYellowCards: number;
  awayYellowCards: number;
  homeRedCards: number;
  awayRedCards: number;
  homeShots: number;
  awayShots: number;
  homeCorners: number;
  awayCorners: number;
  events: {
    id: string;
    minute: number;
    type: 'goal' | 'yellow' | 'red' | 'sub';
    teamId: string;
    player: string;
    detail?: string;
  }[];
}

export interface TennisMatchState {
  sets: { home: number; away: number }[];
  currentSet: number;
  currentGame: {
    homePoints: '0' | '15' | '30' | '40' | 'AD';
    awayPoints: '0' | '15' | '30' | '40' | 'AD';
    server: 'home' | 'away';
    isTieBreak: boolean;
    tieBreakPoints?: { home: number; away: number };
  };
  homeAces?: number;
  awayAces?: number;
}

export type OverlayTemplate = 'bottom_bar' | 'compact_bug' | 'full_panel' | 'ticker';

export type OverlayTheme = 'marketinglu' | 'sky_broadcast' | 'neon_cyan' | 'minimal_dark';

export type OverlayPosition =
  | 'bottom'
  | 'bottom-center'
  | 'top-left'
  | 'top-right'
  | 'top-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'center'
  | 'custom';

export interface OverlayAlert {
  id: string;
  type:
    | 'wicket'
    | 'four'
    | 'six'
    | 'fifty'
    | 'century'
    | 'goal'
    | 'three_pointer'
    | 'home_run'
    | 'try'
    | 'ace'
    | 'super_raid'
    | 'super_tackle'
    | 'all_out'
    | 'custom';
  title: string;
  subtitle: string;
  player?: string;
  timestamp: number;
  durationMs: number;
}

export type StreamCameraSourceType =
  | 'stadium'
  | 'youtube_live'
  | 'twitch_live'
  | 'webcam'
  | 'custom_stream'
  | 'dark'
  | 'transparent';

export type BroadcastPushPlatform =
  | 'youtube_live'
  | 'itv_broadcast'
  | 'twitch_tv'
  | 'facebook_live'
  | 'custom_rtmp';

export interface ProductionDestination {
  id: string;
  platform: BroadcastPushPlatform;
  name: string;
  rtmpUrl: string;
  streamKey: string;
  enabled: boolean;
  status: 'idle' | 'connecting' | 'live';
  bitrateKbps: number;
  resolution: '1080p60' | '720p60' | '4K60';
  startedAt?: number;
}

export interface StreamFeedConfig {
  activeSource: StreamCameraSourceType;
  youtubeUrl: string;
  twitchChannel: string;
  customStreamUrl: string;
  webcamDeviceId?: string;
  webcamAudioMuted: boolean;
  embedInOverlay: boolean;
  destinations: ProductionDestination[];
}

export interface OverlayConfig {
  template: OverlayTemplate;
  theme: OverlayTheme;
  primaryColor: string;
  secondaryColor: string;
  showScoreboard: boolean;
  showBatters: boolean;
  showBowler: boolean;
  showCRR: boolean;
  showRRR: boolean;
  showSponsor: boolean;
  showTicker: boolean;
  tickerText: string;
  sponsorName: string;
  sponsorTagline: string;
  position: OverlayPosition;
  posX?: number; // Custom X in px
  posY?: number; // Custom Y in px
  scale: number;
  opacity: number;
  animationsEnabled: boolean;
  animationDuration: number;
  activeAlert?: OverlayAlert | null;
  streamFeed?: StreamFeedConfig;
}

export interface Match {
  id: string;
  name: string;
  sport: SportType;
  tournament: string;
  venue: string;
  date: string;
  startTime: string;
  status: MatchStatus;
  teamA: Team;
  teamB: Team;
  toss?: {
    winnerTeamId: string;
    decision: 'bat' | 'bowl';
  };
  cricketState?: CricketMatchState;
  footballState?: FootballMatchState;
  basketballState?: BasketballMatchState;
  tennisState?: TennisMatchState;
  baseballState?: BaseballMatchState;
  rugbyState?: RugbyMatchState;
  fieldHockeyState?: FieldHockeyMatchState;
  volleyballState?: VolleyballMatchState;
  badmintonState?: BadmintonMatchState;
  tableTennisState?: TableTennisMatchState;
  kabaddiState?: KabaddiMatchState;
  activeOverlayToken: string;
  overlayTokens: string[];
  overlayConfig: OverlayConfig;
  eventsCount: number;
  lastUpdated: number;
}

export type OperatorRole = 'producer' | 'scorer' | 'graphics' | 'viewer';

export interface UserProfile {
  id: string;
  name: string;
  role: OperatorRole;
  title: string;
  email: string;
  avatar: string;
  assignedSports: SportType[];
  preferredSetup: string;
  lastActive: number;
}

export type PassPlan = 'hourly' | 'daily' | 'pro';

export interface BroadcastLicense {
  id: string;
  plan: PassPlan;
  amount: number; // 499 or 1699 or 4999 INR
  currency: 'INR';
  createdAt: number;
  validUntil: number;
  isActive: boolean;
  orderId: string;
  paymentId: string;
  customerName: string;
  customerEmail: string;
}

export interface OverlayTokenRecord {
  token: string;
  matchId: string;
  createdAt: number;
  lastAccessedAt: number;
  isActive: boolean;
}

export interface WebSocketMessage {
  type:
    | 'subscribe'
    | 'subscribed'
    | 'match:update'
    | 'score:update'
    | 'event:new'
    | 'event:undo'
    | 'overlay:update'
    | 'alert:trigger'
    | 'alert:clear'
    | 'ping'
    | 'pong';
  matchId?: string;
  token?: string;
  payload?: any;
  timestamp: number;
}

export type IssueCategory =
  | 'obs_not_updating'
  | 'score_discrepancy'
  | 'graphic_glitch'
  | 'timer_stalled'
  | 'billing_license'
  | 'database_sync'
  | 'video_ingestion'
  | 'other';

export type IssueUrgency = 'low' | 'medium' | 'high' | 'critical';

export interface ScreenshotAttachment {
  id: string;
  name: string;
  dataUrl: string;
  sizeBytes: number;
}

export interface SupportTicket {
  id: string;
  category: IssueCategory;
  categoryLabel: string;
  customCategoryTitle?: string;
  description: string;
  urgency: IssueUrgency;
  userEmail: string;
  userName?: string;
  matchId?: string;
  matchName?: string;
  sport?: SportType;
  overlayToken?: string;
  systemMeta: {
    userAgent: string;
    screenResolution: string;
    url: string;
    timestamp: number;
  };
  screenshots: ScreenshotAttachment[];
  status: 'open' | 'investigating' | 'resolved';
  createdAt: number;
}

