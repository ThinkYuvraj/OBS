import {
  BallEvent,
  CricketInnings,
  CricketMatchState,
  Match,
  OverlayAlert,
  OverlayConfig,
  OverlayTokenRecord,
} from '../types/sports';
import {
  calculateRRR,
  processBallEvent,
} from '../engine/cricketEngine';

class StorageManager {
  private matches: Map<string, Match> = new Map();
  private events: Map<string, BallEvent[]> = new Map(); // matchId -> events
  private undoneEvents: Map<string, BallEvent[]> = new Map(); // matchId -> undone
  private overlayTokens: Map<string, OverlayTokenRecord> = new Map(); // token -> record

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    const indAusToken = 'overlay_live_cricket_t20_final';

    // 1. Cricket: India vs Australia World Cup Final
    const indTeam = {
      id: 'team_ind',
      name: 'India',
      shortName: 'IND',
      color: '#1E40AF',
      secondaryColor: '#FB923C',
      squad: [
        { id: 'p_yuvraj', name: 'Yuvraj Singh', role: 'all-rounder' as const, number: 12 },
        { id: 'p_sharma', name: 'Rohit Sharma', role: 'batter' as const, number: 45 },
        { id: 'p_kohli', name: 'Virat Kohli', role: 'batter' as const, number: 18 },
        { id: 'p_samson', name: 'Sanju Samson', role: 'wicketkeeper' as const, number: 9 },
        { id: 'p_sky', name: 'Suryakumar Yadav', role: 'batter' as const, number: 63 },
        { id: 'p_hardik', name: 'Hardik Pandya', role: 'all-rounder' as const, number: 33 },
        { id: 'p_axar', name: 'Axar Patel', role: 'all-rounder' as const, number: 20 },
        { id: 'p_kuldeep', name: 'Kuldeep Yadav', role: 'bowler' as const, number: 23 },
        { id: 'p_bumrah', name: 'Jasprit Bumrah', role: 'bowler' as const, number: 93 },
        { id: 'p_arshdeep', name: 'Arshdeep Singh', role: 'bowler' as const, number: 2 },
        { id: 'p_siraj', name: 'Mohammed Siraj', role: 'bowler' as const, number: 13 },
      ],
    };

    const ausTeam = {
      id: 'team_aus',
      name: 'Australia',
      shortName: 'AUS',
      color: '#EAB308',
      secondaryColor: '#15803D',
      squad: [
        { id: 'p_head', name: 'Travis Head', role: 'batter' as const, number: 62 },
        { id: 'p_warner', name: 'David Warner', role: 'batter' as const, number: 31 },
        { id: 'p_marsh', name: 'Mitchell Marsh', role: 'all-rounder' as const, number: 8 },
        { id: 'p_maxwell', name: 'Glenn Maxwell', role: 'all-rounder' as const, number: 32 },
        { id: 'p_stoinis', name: 'Marcus Stoinis', role: 'all-rounder' as const, number: 17 },
        { id: 'p_david', name: 'Tim David', role: 'batter' as const, number: 85 },
        { id: 'p_wade', name: 'Matthew Wade', role: 'wicketkeeper' as const, number: 13 },
        { id: 'p_cummins', name: 'Pat Cummins', role: 'bowler' as const, number: 30 },
        { id: 'p_starc', name: 'Mitchell Starc', role: 'bowler' as const, number: 56 },
        { id: 'p_zampa', name: 'Adam Zampa', role: 'bowler' as const, number: 88 },
        { id: 'p_hazlewood', name: 'Josh Hazlewood', role: 'bowler' as const, number: 38 },
      ],
    };

    const defaultOverlayConfig: OverlayConfig = {
      template: 'bottom_bar',
      theme: 'sky_broadcast',
      primaryColor: '#0F172A',
      secondaryColor: '#2563EB',
      showScoreboard: true,
      showBatters: true,
      showBowler: true,
      showCRR: true,
      showRRR: true,
      showSponsor: true,
      showTicker: true,
      tickerText: "ICC MEN'S T20 WORLD CUP FINAL • MELBOURNE CRICKET GROUND • LIVE ON STREAM",
      sponsorName: 'APEX BROADCAST',
      sponsorTagline: 'Next-Gen Ultra Stream Graphics',
      position: 'bottom',
      scale: 1,
      opacity: 0.98,
      animationsEnabled: true,
      animationDuration: 4000,
      activeAlert: null,
    };

    const initialInnings: CricketInnings = {
      inningsNumber: 2,
      battingTeamId: 'team_ind',
      bowlingTeamId: 'team_aus',
      runs: 156,
      wickets: 4,
      legalBalls: 105,
      oversFormatted: '17.3',
      currentRunRate: 8.91,
      requiredRunRate: 8.8,
      target: 178,
      extras: { wides: 4, noBalls: 1, byes: 2, legByes: 1, penalty: 0, total: 8 },
      batters: [
        {
          playerId: 'p_yuvraj',
          name: 'Yuvraj Singh',
          runs: 72,
          balls: 48,
          fours: 6,
          sixes: 4,
          strikeRate: 150.0,
          isOut: false,
        },
        {
          playerId: 'p_sharma',
          name: 'Rohit Sharma',
          runs: 34,
          balls: 21,
          fours: 3,
          sixes: 1,
          strikeRate: 161.9,
          isOut: false,
        },
        {
          playerId: 'p_kohli',
          name: 'Virat Kohli',
          runs: 28,
          balls: 19,
          fours: 3,
          sixes: 0,
          strikeRate: 147.3,
          isOut: true,
          dismissal: 'c Warner b Starc',
        },
        {
          playerId: 'p_samson',
          name: 'Sanju Samson',
          runs: 8,
          balls: 6,
          fours: 1,
          sixes: 0,
          strikeRate: 133.3,
          isOut: true,
          dismissal: 'b Cummins',
        },
        {
          playerId: 'p_sky',
          name: 'Suryakumar Yadav',
          runs: 11,
          balls: 7,
          fours: 1,
          sixes: 1,
          strikeRate: 157.1,
          isOut: true,
          dismissal: 'c Maxwell b Zampa',
        },
      ],
      bowlers: [
        {
          playerId: 'p_starc',
          name: 'Mitchell Starc',
          overs: '3.3',
          legalBalls: 21,
          maidens: 0,
          runsConceded: 28,
          wickets: 2,
          economy: 8.0,
        },
        {
          playerId: 'p_cummins',
          name: 'Pat Cummins',
          overs: '4.0',
          legalBalls: 24,
          maidens: 0,
          runsConceded: 36,
          wickets: 1,
          economy: 9.0,
        },
        {
          playerId: 'p_hazlewood',
          name: 'Josh Hazlewood',
          overs: '4.0',
          legalBalls: 24,
          maidens: 0,
          runsConceded: 31,
          wickets: 0,
          economy: 7.75,
        },
        {
          playerId: 'p_zampa',
          name: 'Adam Zampa',
          overs: '4.0',
          legalBalls: 24,
          maidens: 0,
          runsConceded: 35,
          wickets: 1,
          economy: 8.75,
        },
        {
          playerId: 'p_maxwell',
          name: 'Glenn Maxwell',
          overs: '2.0',
          legalBalls: 12,
          maidens: 0,
          runsConceded: 18,
          wickets: 0,
          economy: 9.0,
        },
      ],
      currentStrikerId: 'p_yuvraj',
      currentNonStrikerId: 'p_sharma',
      currentBowlerId: 'p_starc',
      currentPartnership: { runs: 58, balls: 32 },
      fallOfWickets: [
        { wicketNumber: 1, score: 38, overs: '4.1', batterName: 'Sanju Samson', dismissal: 'b Cummins' },
        { wicketNumber: 2, score: 72, overs: '8.4', batterName: 'Virat Kohli', dismissal: 'c Warner b Starc' },
        { wicketNumber: 3, score: 98, overs: '12.1', batterName: 'Suryakumar Yadav', dismissal: 'c Maxwell b Zampa' },
        { wicketNumber: 4, score: 98, overs: '12.2', batterName: 'Hardik Pandya', dismissal: 'c Wade b Starc' },
      ],
      oversHistory: [
        {
          overNumber: 17,
          bowlerName: 'Mitchell Starc',
          balls: [
            { text: '1', runs: 1, isWicket: false, isBoundary: false },
            { text: '4', runs: 4, isWicket: false, isBoundary: true },
            { text: '1', runs: 1, isWicket: false, isBoundary: false },
          ],
          totalRuns: 6,
        },
      ],
      isCompleted: false,
    };

    const cricketState: CricketMatchState = {
      format: 'T20',
      maxOvers: 20,
      target: 178,
      currentInningsIndex: 0,
      innings: [initialInnings],
      lastBallEvent: {
        id: 'ball_seed_105',
        sequence: 105,
        innings: 2,
        overNumber: 17,
        ballInOver: 3,
        bowlerId: 'p_starc',
        bowlerName: 'Mitchell Starc',
        strikerId: 'p_yuvraj',
        strikerName: 'Yuvraj Singh',
        nonStrikerId: 'p_sharma',
        nonStrikerName: 'Rohit Sharma',
        runsOffBat: 1,
        isWide: false,
        isNoBall: false,
        isBye: false,
        isLegBye: false,
        penaltyRuns: 0,
        totalRuns: 1,
        isLegalBall: true,
        isWicket: false,
        timestamp: Date.now() - 15000,
      },
    };

    const cricketMatch: Match = {
      id: 'match_t20_ind_aus',
      name: "ICC Men's T20 World Cup Final",
      sport: 'cricket',
      tournament: "ICC Men's T20 World Cup 2026",
      venue: 'Melbourne Cricket Ground, Australia',
      date: '2026-10-02',
      startTime: '19:00',
      status: 'live',
      teamA: indTeam,
      teamB: ausTeam,
      toss: { winnerTeamId: 'team_aus', decision: 'bat' },
      cricketState,
      activeOverlayToken: indAusToken,
      overlayTokens: [indAusToken],
      overlayConfig: defaultOverlayConfig,
      eventsCount: 105,
      lastUpdated: Date.now() + 800,
    };

    this.matches.set(cricketMatch.id, cricketMatch);
    this.overlayTokens.set(indAusToken, {
      token: indAusToken,
      matchId: cricketMatch.id,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      isActive: true,
    });

    // 2. Football: Real Madrid vs VfB Stuttgart (UEFA Champions League)
    const rmaStuttgartToken = 'overlay_live_ucl_rma_stu';
    const footballMatch: Match = {
      id: 'match_ucl_rma_stu',
      name: 'Real Madrid vs VfB Stuttgart',
      sport: 'football',
      tournament: 'UEFA Champions League',
      venue: 'Santiago Bernabéu, Madrid',
      date: '2026-10-02',
      startTime: '21:00',
      status: 'live',
      teamA: {
        id: 'team_rma',
        name: 'Real Madrid',
        shortName: 'RMA',
        color: '#FFFFFF',
        secondaryColor: '#001489',
        squad: [],
      },
      teamB: {
        id: 'team_stu',
        name: 'VfB Stuttgart',
        shortName: 'STU',
        color: '#DC2626',
        secondaryColor: '#FFFFFF',
        squad: [],
      },
      footballState: {
        half: '2nd',
        minute: 78,
        extraTime: 4,
        isTimerRunning: true,
        homeScore: 2,
        awayScore: 1,
        homeFouls: 8,
        awayFouls: 12,
        homeYellowCards: 1,
        awayYellowCards: 2,
        homeRedCards: 0,
        awayRedCards: 0,
        homeShots: 16,
        awayShots: 9,
        homeCorners: 7,
        awayCorners: 3,
        events: [
          {
            id: 'fev_1',
            minute: 76,
            type: 'goal',
            teamId: 'home',
            player: 'K. Mbappé',
          },
        ],
      },
      activeOverlayToken: rmaStuttgartToken,
      overlayTokens: [rmaStuttgartToken],
      overlayConfig: {
        ...defaultOverlayConfig,
        template: 'compact_bug',
        theme: 'sky_broadcast',
        position: 'top-left',
        tickerText: 'UEFA CHAMPIONS LEAGUE • SANTIAGO BERNABÉU • LIVE BROADCAST',
      },
      eventsCount: 14,
      lastUpdated: Date.now() + 700,
    };

    this.matches.set(footballMatch.id, footballMatch);
    this.overlayTokens.set(rmaStuttgartToken, {
      token: rmaStuttgartToken,
      matchId: footballMatch.id,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      isActive: true,
    });

    // 3. Basketball: LA Lakers vs Golden State Warriors (NBA Western Finals)
    const nbaToken = 'overlay_live_nba_lal_gsw';
    const basketballMatch: Match = {
      id: 'match_nba_lal_gsw',
      name: 'LA Lakers vs Golden State Warriors',
      sport: 'basketball',
      tournament: 'NBA Western Conference Finals',
      venue: 'Crypto.com Arena, Los Angeles',
      date: '2026-10-02',
      startTime: '20:30',
      status: 'live',
      teamA: {
        id: 'team_lal',
        name: 'Los Angeles Lakers',
        shortName: 'LAL',
        color: '#EAB308',
        secondaryColor: '#581C87',
        squad: [],
      },
      teamB: {
        id: 'team_gsw',
        name: 'Golden State Warriors',
        shortName: 'GSW',
        color: '#2563EB',
        secondaryColor: '#FACC15',
        squad: [],
      },
      basketballState: {
        quarter: 4,
        clock: '02:14',
        shotClock: 18,
        isTimerRunning: true,
        homeScore: 108,
        awayScore: 105,
        quarterScores: [
          { home: 28, away: 26 },
          { home: 25, away: 31 },
          { home: 30, away: 24 },
          { home: 25, away: 24 },
        ],
        homeFouls: 4,
        awayFouls: 5,
        homeTimeouts: 2,
        awayTimeouts: 2,
        possession: 'home',
        lastPlay: 'LeBron James +3 (3PT FG)',
      },
      activeOverlayToken: nbaToken,
      overlayTokens: [nbaToken],
      overlayConfig: {
        ...defaultOverlayConfig,
        template: 'compact_bug',
        theme: 'dark_neon',
        position: 'bottom',
        tickerText: 'NBA WESTERN CONFERENCE FINALS • GAME 6 • LIVE ON BROADCAST',
      },
      eventsCount: 92,
      lastUpdated: Date.now() + 600,
    };
    this.matches.set(basketballMatch.id, basketballMatch);
    this.overlayTokens.set(nbaToken, {
      token: nbaToken,
      matchId: basketballMatch.id,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      isActive: true,
    });

    // 4. Badminton: Viktor Axelsen vs Lakshya Sen (BWF Super 1000)
    const badmintonToken = 'overlay_live_badminton_semis';
    const badmintonMatch: Match = {
      id: 'match_badminton_bwf',
      name: 'Viktor Axelsen vs Lakshya Sen',
      sport: 'badminton',
      tournament: 'BWF World Tour Super 1000',
      venue: 'Istora Senayan, Jakarta',
      date: '2026-10-02',
      startTime: '15:30',
      status: 'live',
      teamA: {
        id: 'p_axelsen',
        name: 'V. Axelsen (DEN)',
        shortName: 'AXE',
        color: '#DC2626',
        squad: [],
      },
      teamB: {
        id: 'p_sen',
        name: 'L. Sen (IND)',
        shortName: 'SEN',
        color: '#2563EB',
        squad: [],
      },
      badmintonState: {
        sets: [{ home: 21, away: 17 }, { home: 18, away: 19 }],
        currentSet: 1,
        homePoints: 18,
        awayPoints: 19,
        server: 'away',
        isGamePoint: false,
        isMatchPoint: false,
      },
      activeOverlayToken: badmintonToken,
      overlayTokens: [badmintonToken],
      overlayConfig: {
        ...defaultOverlayConfig,
        template: 'compact_bug',
        position: 'top-left',
      },
      eventsCount: 75,
      lastUpdated: Date.now() + 500,
    };
    this.matches.set(badmintonMatch.id, badmintonMatch);
    this.overlayTokens.set(badmintonToken, {
      token: badmintonToken,
      matchId: badmintonMatch.id,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      isActive: true,
    });

    // 5. Table Tennis: Fan Zhendong vs Ma Long (WTT Grand Smash Final)
    const ttToken = 'overlay_live_table_tennis_final';
    const tableTennisMatch: Match = {
      id: 'match_tt_wtt_final',
      name: 'Fan Zhendong vs Ma Long',
      sport: 'table_tennis',
      tournament: 'WTT Grand Smash Final',
      venue: 'Singapore Sports Hub',
      date: '2026-10-02',
      startTime: '18:00',
      status: 'live',
      teamA: {
        id: 'p_fan',
        name: 'Fan Zhendong',
        shortName: 'FAN',
        color: '#DC2626',
        squad: [],
      },
      teamB: {
        id: 'p_ma',
        name: 'Ma Long',
        shortName: 'MA',
        color: '#EAB308',
        squad: [],
      },
      tableTennisState: {
        sets: [{ home: 11, away: 9 }, { home: 8, away: 11 }, { home: 11, away: 7 }],
        currentSet: 3,
        homePoints: 9,
        awayPoints: 8,
        server: 'home',
        servesInTurn: 1,
        isGamePoint: false,
        isMatchPoint: false,
      },
      activeOverlayToken: ttToken,
      overlayTokens: [ttToken],
      overlayConfig: {
        ...defaultOverlayConfig,
        template: 'compact_bug',
        position: 'top-left',
      },
      eventsCount: 65,
      lastUpdated: Date.now() + 400,
    };
    this.matches.set(tableTennisMatch.id, tableTennisMatch);
    this.overlayTokens.set(ttToken, {
      token: ttToken,
      matchId: tableTennisMatch.id,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      isActive: true,
    });

    // 6. Volleyball: Poland vs Italy (FIVB Volleyball Nations League Final)
    const vbToken = 'overlay_live_volleyball_nations';
    const volleyballMatch: Match = {
      id: 'match_vb_vnl_final',
      name: 'Poland vs Italy',
      sport: 'volleyball',
      tournament: 'FIVB Volleyball Nations League Final',
      venue: 'Ergo Arena, Gdansk',
      date: '2026-10-02',
      startTime: '20:00',
      status: 'live',
      teamA: {
        id: 'team_pol',
        name: 'Poland',
        shortName: 'POL',
        color: '#DC2626',
        squad: [],
      },
      teamB: {
        id: 'team_ita',
        name: 'Italy',
        shortName: 'ITA',
        color: '#2563EB',
        squad: [],
      },
      volleyballState: {
        sets: [{ home: 25, away: 23 }, { home: 22, away: 25 }, { home: 22, away: 21 }],
        currentSet: 2,
        homeScore: 22,
        awayScore: 21,
        server: 'home',
        homeTimeouts: 1,
        awayTimeouts: 0,
        isSetPoint: false,
        isMatchPoint: false,
      },
      activeOverlayToken: vbToken,
      overlayTokens: [vbToken],
      overlayConfig: {
        ...defaultOverlayConfig,
        template: 'compact_bug',
        position: 'top-left',
      },
      eventsCount: 110,
      lastUpdated: Date.now() + 300,
    };
    this.matches.set(volleyballMatch.id, volleyballMatch);
    this.overlayTokens.set(vbToken, {
      token: vbToken,
      matchId: volleyballMatch.id,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      isActive: true,
    });

    // 7. Lawn Tennis (Outdoor): Carlos Alcaraz vs Jannik Sinner (Wimbledon Final)
    const tennisToken = 'overlay_live_tennis_wimbledon';
    const tennisMatch: Match = {
      id: 'match_tennis_wimbledon',
      name: 'Carlos Alcaraz vs Jannik Sinner',
      sport: 'tennis',
      tournament: 'Wimbledon Championships Final',
      venue: 'Centre Court, All England Club',
      date: '2026-10-02',
      startTime: '14:00',
      status: 'live',
      teamA: {
        id: 'p_alcaraz',
        name: 'C. Alcaraz (ESP)',
        shortName: 'ALC',
        color: '#10B981',
        squad: [],
      },
      teamB: {
        id: 'p_sinner',
        name: 'J. Sinner (ITA)',
        shortName: 'SIN',
        color: '#3B82F6',
        squad: [],
      },
      tennisState: {
        sets: [
          { home: 6, away: 4 },
          { home: 5, away: 7 },
          { home: 4, away: 3 },
        ],
        currentSet: 2,
        currentGame: {
          homePoints: '40',
          awayPoints: '30',
          server: 'home',
          isTieBreak: false,
        },
        homeAces: 11,
        awayAces: 9,
      },
      activeOverlayToken: tennisToken,
      overlayTokens: [tennisToken],
      overlayConfig: {
        ...defaultOverlayConfig,
        template: 'compact_bug',
        position: 'top-left',
      },
      eventsCount: 142,
      lastUpdated: Date.now() + 200,
    };
    this.matches.set(tennisMatch.id, tennisMatch);
    this.overlayTokens.set(tennisToken, {
      token: tennisToken,
      matchId: tennisMatch.id,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      isActive: true,
    });

    // 8. Outdoor Field Hockey: India vs Netherlands (FIH Pro League)
    const hockeyToken = 'overlay_live_field_hockey_fih';
    const hockeyMatch: Match = {
      id: 'match_hockey_ind_ned',
      name: 'India vs Netherlands',
      sport: 'field_hockey',
      tournament: 'FIH Hockey Pro League',
      venue: 'Birsa Munda Hockey Stadium, Rourkela',
      date: '2026-10-02',
      startTime: '19:30',
      status: 'live',
      teamA: {
        id: 'team_ind_hk',
        name: 'India',
        shortName: 'IND',
        color: '#2563EB',
        squad: [],
      },
      teamB: {
        id: 'team_ned_hk',
        name: 'Netherlands',
        shortName: 'NED',
        color: '#F97316',
        squad: [],
      },
      fieldHockeyState: {
        quarter: 3,
        minute: 42,
        isTimerRunning: true,
        homeScore: 3,
        awayScore: 2,
        homePenaltyCorners: 5,
        awayPenaltyCorners: 4,
        homeCards: { green: 1, yellow: 0, red: 0 },
        awayCards: { green: 2, yellow: 1, red: 0 },
        lastPlay: 'GOAL! Harmanpreet Singh (PC)',
      },
      activeOverlayToken: hockeyToken,
      overlayTokens: [hockeyToken],
      overlayConfig: {
        ...defaultOverlayConfig,
        template: 'compact_bug',
        position: 'top-left',
      },
      eventsCount: 38,
      lastUpdated: Date.now() + 100,
    };
    this.matches.set(hockeyMatch.id, hockeyMatch);
    this.overlayTokens.set(hockeyToken, {
      token: hockeyToken,
      matchId: hockeyMatch.id,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      isActive: true,
    });
  }

  // Matches CRUD
  getMatches(): Match[] {
    return Array.from(this.matches.values()).sort(
      (a, b) => b.lastUpdated - a.lastUpdated
    );
  }

  getMatch(id: string): Match | null {
    return this.matches.get(id) || null;
  }

  createMatch(matchData: Partial<Match>): Match {
    const id = matchData.id || `match_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const token = `token_${id}_${Math.random().toString(36).substring(2, 9)}`;
    const sport = matchData.sport || 'cricket';

    const newMatch: Match = {
      id,
      name: matchData.name || 'Live Match',
      sport,
      tournament: matchData.tournament || 'Live Tournament',
      venue: matchData.venue || 'Stadium Arena',
      date: matchData.date || new Date().toISOString().split('T')[0],
      startTime: matchData.startTime || '18:00',
      status: matchData.status || 'live',
      teamA: matchData.teamA || {
        id: 'team_a',
        name: 'Team Alpha',
        shortName: 'ALP',
        color: '#2563EB',
        squad: [],
      },
      teamB: matchData.teamB || {
        id: 'team_b',
        name: 'Team Beta',
        shortName: 'BET',
        color: '#DC2626',
        squad: [],
      },
      toss: matchData.toss,
      cricketState: matchData.cricketState,
      footballState:
        matchData.footballState ||
        (sport === 'football'
          ? {
              half: '1st',
              minute: 1,
              extraTime: 0,
              isTimerRunning: true,
              homeScore: 0,
              awayScore: 0,
              homeFouls: 0,
              awayFouls: 0,
              homeYellowCards: 0,
              awayYellowCards: 0,
              homeRedCards: 0,
              awayRedCards: 0,
              homeShots: 0,
              awayShots: 0,
              homeCorners: 0,
              awayCorners: 0,
              events: [],
            }
          : undefined),
      basketballState:
        matchData.basketballState ||
        (sport === 'basketball'
          ? {
              quarter: 1,
              clock: '12:00',
              shotClock: 24,
              isTimerRunning: true,
              homeScore: 0,
              awayScore: 0,
              quarterScores: [
                { home: 0, away: 0 },
                { home: 0, away: 0 },
                { home: 0, away: 0 },
                { home: 0, away: 0 },
              ],
              homeFouls: 0,
              awayFouls: 0,
              homeTimeouts: 7,
              awayTimeouts: 7,
              possession: 'home',
              lastPlay: 'Tip-off ready',
            }
          : undefined),
      tennisState:
        matchData.tennisState ||
        (sport === 'tennis'
          ? {
              sets: [{ home: 0, away: 0 }],
              currentSet: 0,
              currentGame: {
                homePoints: '0',
                awayPoints: '0',
                server: 'home',
                isTieBreak: false,
              },
              homeAces: 0,
              awayAces: 0,
            }
          : undefined),
      badmintonState:
        matchData.badmintonState ||
        (sport === 'badminton'
          ? {
              sets: [{ home: 0, away: 0 }],
              currentSet: 0,
              homePoints: 0,
              awayPoints: 0,
              server: 'home',
              isGamePoint: false,
              isMatchPoint: false,
            }
          : undefined),
      tableTennisState:
        matchData.tableTennisState ||
        (sport === 'table_tennis'
          ? {
              sets: [{ home: 0, away: 0 }],
              currentSet: 0,
              homePoints: 0,
              awayPoints: 0,
              server: 'home',
              servesInTurn: 0,
              isGamePoint: false,
              isMatchPoint: false,
            }
          : undefined),
      volleyballState:
        matchData.volleyballState ||
        (sport === 'volleyball'
          ? {
              sets: [{ home: 0, away: 0 }],
              currentSet: 0,
              homeScore: 0,
              awayScore: 0,
              server: 'home',
              homeTimeouts: 0,
              awayTimeouts: 0,
              isSetPoint: false,
              isMatchPoint: false,
            }
          : undefined),
      fieldHockeyState:
        matchData.fieldHockeyState ||
        (sport === 'field_hockey'
          ? {
              quarter: 1,
              minute: 1,
              isTimerRunning: true,
              homeScore: 0,
              awayScore: 0,
              homePenaltyCorners: 0,
              awayPenaltyCorners: 0,
              homeCards: { green: 0, yellow: 0, red: 0 },
              awayCards: { green: 0, yellow: 0, red: 0 },
              lastPlay: 'Match started',
            }
          : undefined),
      baseballState:
        matchData.baseballState ||
        (sport === 'baseball'
          ? {
              inning: 1,
              half: 'top',
              balls: 0,
              strikes: 0,
              outs: 0,
              bases: { first: false, second: false, third: false },
              homeScore: 0,
              awayScore: 0,
              homeHits: 0,
              awayHits: 0,
              homeErrors: 0,
              awayErrors: 0,
              lastPlay: 'Play Ball',
            }
          : undefined),
      rugbyState:
        matchData.rugbyState ||
        (sport === 'rugby'
          ? {
              half: '1st',
              minute: 1,
              isTimerRunning: true,
              homeScore: 0,
              awayScore: 0,
              homeTries: 0,
              awayTries: 0,
              homePenalties: 0,
              awayPenalties: 0,
              homeSinBin: 0,
              awaySinBin: 0,
              lastPlay: 'Kick-off',
            }
          : undefined),
      activeOverlayToken: token,
      overlayTokens: [token],
      overlayConfig: matchData.overlayConfig || {
        template: sport === 'cricket' ? 'bottom_bar' : 'compact_bug',
        theme: 'sky_broadcast',
        primaryColor: '#0F172A',
        secondaryColor: '#2563EB',
        showScoreboard: true,
        showBatters: true,
        showBowler: true,
        showCRR: true,
        showRRR: true,
        showSponsor: true,
        showTicker: true,
        tickerText: `${matchData.name || 'Live Sports'} • Live Broadcast Overlay`,
        sponsorName: 'APEX BROADCAST',
        sponsorTagline: 'Professional Stream Graphics',
        position: sport === 'cricket' ? 'bottom' : 'top-left',
        scale: 1,
        opacity: 0.98,
        animationsEnabled: true,
        animationDuration: 4000,
        activeAlert: null,
      },
      eventsCount: 0,
      lastUpdated: Date.now(),
    };

    this.matches.set(id, newMatch);
    this.overlayTokens.set(token, {
      token,
      matchId: id,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      isActive: true,
    });

    return newMatch;
  }

  updateMatch(id: string, updateData: Partial<Match>): Match | null {
    const existing = this.matches.get(id);
    if (!existing) return null;

    const updated: Match = {
      ...existing,
      ...updateData,
      lastUpdated: Date.now(),
    };

    this.matches.set(id, updated);
    return updated;
  }

  deleteMatch(id: string): boolean {
    const match = this.matches.get(id);
    if (!match) return false;

    for (const t of match.overlayTokens) {
      this.overlayTokens.delete(t);
    }
    this.events.delete(id);
    this.undoneEvents.delete(id);
    this.matches.delete(id);
    return true;
  }

  // Cricket Ball Events
  getBallEvents(matchId: string): BallEvent[] {
    return this.events.get(matchId) || [];
  }

  addBallEvent(matchId: string, eventInput: Partial<BallEvent>): { match: Match; event: BallEvent } | null {
    const match = this.matches.get(matchId);
    if (!match || match.sport !== 'cricket' || !match.cricketState) return null;

    const existingEvents = this.events.get(matchId) || [];
    const sequence = existingEvents.length + 1;

    const event: BallEvent = {
      id: eventInput.id || `ball_${matchId}_${sequence}_${Date.now()}`,
      sequence,
      innings: eventInput.innings || match.cricketState.currentInningsIndex + 1,
      overNumber: eventInput.overNumber ?? Math.floor(match.cricketState.innings[match.cricketState.currentInningsIndex].legalBalls / 6),
      ballInOver: eventInput.ballInOver ?? ((match.cricketState.innings[match.cricketState.currentInningsIndex].legalBalls % 6) + 1),
      bowlerId: eventInput.bowlerId || match.cricketState.innings[match.cricketState.currentInningsIndex].currentBowlerId,
      bowlerName: eventInput.bowlerName || 'Bowler',
      strikerId: eventInput.strikerId || match.cricketState.innings[match.cricketState.currentInningsIndex].currentStrikerId,
      strikerName: eventInput.strikerName || 'Striker',
      nonStrikerId: eventInput.nonStrikerId || match.cricketState.innings[match.cricketState.currentInningsIndex].currentNonStrikerId,
      nonStrikerName: eventInput.nonStrikerName || 'Non-Striker',
      runsOffBat: eventInput.runsOffBat || 0,
      isWide: Boolean(eventInput.isWide),
      isNoBall: Boolean(eventInput.isNoBall),
      isBye: Boolean(eventInput.isBye),
      isLegBye: Boolean(eventInput.isLegBye),
      penaltyRuns: eventInput.penaltyRuns || 0,
      totalRuns: 0,
      isLegalBall: !eventInput.isWide && !eventInput.isNoBall,
      isWicket: Boolean(eventInput.isWicket),
      wicketType: eventInput.wicketType,
      dismissedBatterId: eventInput.dismissedBatterId,
      dismissedBatterName: eventInput.dismissedBatterName,
      fielderName: eventInput.fielderName,
      nextBatterId: eventInput.nextBatterId,
      nextBatterName: eventInput.nextBatterName,
      commentary: eventInput.commentary,
      timestamp: Date.now(),
    };

    const nextState = processBallEvent(match.cricketState, event);

    existingEvents.push(event);
    this.events.set(matchId, existingEvents);
    this.undoneEvents.delete(matchId);

    let activeAlert: OverlayAlert | null = null;
    if (event.isWicket) {
      activeAlert = {
        id: `alert_${Date.now()}`,
        type: 'wicket',
        title: 'WICKET!',
        subtitle: `${event.dismissedBatterName || event.strikerName} ${event.wicketType ? 'is ' + event.wicketType : 'dismissed'}`,
        player: event.dismissedBatterName || event.strikerName,
        timestamp: Date.now(),
        durationMs: match.overlayConfig.animationDuration || 4500,
      };
    } else if (event.runsOffBat === 6) {
      activeAlert = {
        id: `alert_${Date.now()}`,
        type: 'six',
        title: 'MAXIMUM! SIX!',
        subtitle: `${event.strikerName} launches it into the stands!`,
        player: event.strikerName,
        timestamp: Date.now(),
        durationMs: match.overlayConfig.animationDuration || 4000,
      };
    } else if (event.runsOffBat === 4) {
      activeAlert = {
        id: `alert_${Date.now()}`,
        type: 'four',
        title: 'FOUR RUNS!',
        subtitle: `Glorious boundary by ${event.strikerName}!`,
        player: event.strikerName,
        timestamp: Date.now(),
        durationMs: match.overlayConfig.animationDuration || 3500,
      };
    }

    const updatedMatch: Match = {
      ...match,
      cricketState: nextState,
      eventsCount: existingEvents.length,
      overlayConfig: {
        ...match.overlayConfig,
        activeAlert: activeAlert || match.overlayConfig.activeAlert,
      },
      lastUpdated: Date.now(),
    };

    this.matches.set(matchId, updatedMatch);
    return { match: updatedMatch, event };
  }

  undoLastEvent(matchId: string): { match: Match; undoneEvent: BallEvent } | null {
    const match = this.matches.get(matchId);
    if (!match || match.sport !== 'cricket' || !match.cricketState) return null;

    const existingEvents = this.events.get(matchId) || [];
    if (existingEvents.length === 0) return null;

    const popped = existingEvents.pop()!;
    this.events.set(matchId, existingEvents);

    const undone = this.undoneEvents.get(matchId) || [];
    undone.push(popped);
    this.undoneEvents.set(matchId, undone);

    const currentInnings = match.cricketState.innings[match.cricketState.currentInningsIndex];
    const baseInnings: CricketInnings = {
      ...currentInnings,
      runs: 0,
      wickets: 0,
      legalBalls: 0,
      oversFormatted: '0.0',
      currentRunRate: 0,
      requiredRunRate: calculateRRR(0, match.cricketState.target, 0, match.cricketState.maxOvers),
      extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalty: 0, total: 0 },
      batters: currentInnings.batters.map((b) => ({
        ...b,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        strikeRate: 0,
        isOut: false,
        dismissal: undefined,
      })),
      bowlers: currentInnings.bowlers.map((bw) => ({
        ...bw,
        overs: '0.0',
        legalBalls: 0,
        maidens: 0,
        runsConceded: 0,
        wickets: 0,
        economy: 0,
      })),
      currentPartnership: { runs: 0, balls: 0 },
      fallOfWickets: [],
      oversHistory: [],
      isCompleted: false,
    };

    let reconstructedState: CricketMatchState = {
      ...match.cricketState,
      innings: [baseInnings],
      lastBallEvent: existingEvents[existingEvents.length - 1],
    };

    for (const ev of existingEvents) {
      reconstructedState = processBallEvent(reconstructedState, ev);
    }

    const updatedMatch: Match = {
      ...match,
      cricketState: reconstructedState,
      eventsCount: existingEvents.length,
      overlayConfig: {
        ...match.overlayConfig,
        activeAlert: null,
      },
      lastUpdated: Date.now(),
    };

    this.matches.set(matchId, updatedMatch);
    return { match: updatedMatch, undoneEvent: popped };
  }

  redoEvent(matchId: string): { match: Match; redoneEvent: BallEvent } | null {
    const undone = this.undoneEvents.get(matchId) || [];
    if (undone.length === 0) return null;

    const eventToRedo = undone.pop()!;
    this.undoneEvents.set(matchId, undone);

    const result = this.addBallEvent(matchId, eventToRedo);
    if (!result) return null;
    return { match: result.match, redoneEvent: result.event };
  }

  // Overlay Management
  getOverlayByToken(token: string): { match: Match; config: OverlayConfig } | null {
    const record = this.overlayTokens.get(token);
    if (!record || !record.isActive) return null;

    const match = this.matches.get(record.matchId);
    if (!match) return null;

    record.lastAccessedAt = Date.now();
    return { match, config: match.overlayConfig };
  }

  generateOverlayToken(matchId: string): string | null {
    const match = this.matches.get(matchId);
    if (!match) return null;

    const token = `token_${matchId}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
    this.overlayTokens.set(token, {
      token,
      matchId,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      isActive: true,
    });

    match.overlayTokens.push(token);
    match.activeOverlayToken = token;
    match.lastUpdated = Date.now();

    return token;
  }

  revokeOverlayToken(token: string): boolean {
    const record = this.overlayTokens.get(token);
    if (!record) return false;

    record.isActive = false;
    const match = this.matches.get(record.matchId);
    if (match) {
      match.overlayTokens = match.overlayTokens.filter((t) => t !== token);
      if (match.activeOverlayToken === token) {
        match.activeOverlayToken = match.overlayTokens[0] || '';
      }
      match.lastUpdated = Date.now();
    }
    return true;
  }

  updateOverlayConfig(tokenOrMatchId: string, newConfig: Partial<OverlayConfig>): Match | null {
    let match: Match | null = null;

    const record = this.overlayTokens.get(tokenOrMatchId);
    if (record) {
      match = this.matches.get(record.matchId) || null;
    } else {
      match = this.matches.get(tokenOrMatchId) || null;
    }

    if (!match) return null;

    match.overlayConfig = {
      ...match.overlayConfig,
      ...newConfig,
    };
    match.lastUpdated = Date.now();

    return match;
  }

  triggerOverlayAlert(tokenOrMatchId: string, alert: OverlayAlert): Match | null {
    return this.updateOverlayConfig(tokenOrMatchId, { activeAlert: alert });
  }

  clearOverlayAlert(tokenOrMatchId: string): Match | null {
    return this.updateOverlayConfig(tokenOrMatchId, { activeAlert: null });
  }
}

export const storage = new StorageManager();
