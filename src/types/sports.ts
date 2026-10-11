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
  | 'table_tennis';

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

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logoUrl?: string;
  color: string;
  secondaryColor?: string;
  squad: Player[];
}

export interface Player {
  id: string;
  name: string;
  shortName?: string;
  role: 'batter' | 'bowler' | 'all-rounder' | 'wicketkeeper' | 'player';
  number?: number;
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

export type OverlayTheme =
  | 'sky_broadcast'
  | 'dark_neon'
  | 'crimson_pulse'
  | 'gold_trophy'
  | 'emerald_turf';

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
    | 'custom';
  title: string;
  subtitle: string;
  player?: string;
  timestamp: number;
  durationMs: number;
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
  position: 'bottom' | 'top-left' | 'top-right' | 'bottom-left';
  scale: number;
  opacity: number;
  animationsEnabled: boolean;
  animationDuration: number;
  activeAlert?: OverlayAlert | null;
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
  activeOverlayToken: string;
  overlayTokens: string[];
  overlayConfig: OverlayConfig;
  eventsCount: number;
  lastUpdated: number;
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
