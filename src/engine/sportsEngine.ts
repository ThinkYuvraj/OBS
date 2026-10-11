import {
  BaseballMatchState,
  BasketballMatchState,
  FieldHockeyMatchState,
  FootballMatchState,
  RugbyMatchState,
  SportType,
  TennisMatchState,
} from '../types/sports';

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export interface SportEngine<TState, TEvent> {
  sport: SportType;
  initializeMatch(config?: any): TState;
  processEvent(state: TState, event: TEvent): TState;
  validateEvent(state: TState, event: TEvent): ValidationResult;
}

// 1. Football scoring engine implementation
export interface FootballEvent {
  id: string;
  type: 'goal' | 'yellow' | 'red' | 'sub' | 'foul' | 'corner' | 'shot' | 'clock';
  minute: number;
  clock?: string;
  extraTime?: number;
  half?: FootballMatchState['half'];
  isTimerRunning?: boolean;
  teamId: string;
  player: string;
  detail?: string;
  timestamp: number;
}

export class FootballEngine implements SportEngine<FootballMatchState, FootballEvent> {
  sport: SportType = 'football';

  initializeMatch(): FootballMatchState {
    return {
      half: '1st',
      minute: 0,
      clock: '00:00',
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
    };
  }

  validateEvent(_state: FootballMatchState, event: FootballEvent): ValidationResult {
    if (!event.player && event.type === 'goal') {
      return { valid: false, message: 'Scorer player name is required' };
    }
    return { valid: true };
  }

  processEvent(state: FootballMatchState, event: FootballEvent): FootballMatchState {
    const next: FootballMatchState = JSON.parse(JSON.stringify(state));

    if (typeof event.minute === 'number') next.minute = event.minute;
    if (event.clock) next.clock = event.clock;
    if (typeof event.extraTime === 'number') next.extraTime = event.extraTime;
    if (event.half) next.half = event.half;
    if (typeof event.isTimerRunning === 'boolean') next.isTimerRunning = event.isTimerRunning;

    switch (event.type) {
      case 'goal':
        if (event.teamId === 'home') {
          next.homeScore += 1;
          next.homeShots += 1;
        } else {
          next.awayScore += 1;
          next.awayShots += 1;
        }
        next.events.unshift({
          id: event.id,
          minute: event.minute,
          type: 'goal',
          teamId: event.teamId,
          player: event.player,
          detail: event.detail,
        });
        break;
      case 'yellow':
        if (event.teamId === 'home') next.homeYellowCards += 1;
        else next.awayYellowCards += 1;
        next.events.unshift({
          id: event.id,
          minute: event.minute,
          type: 'yellow',
          teamId: event.teamId,
          player: event.player,
        });
        break;
      case 'red':
        if (event.teamId === 'home') next.homeRedCards += 1;
        else next.awayRedCards += 1;
        next.events.unshift({
          id: event.id,
          minute: event.minute,
          type: 'red',
          teamId: event.teamId,
          player: event.player,
        });
        break;
      case 'foul':
        if (event.teamId === 'home') next.homeFouls += 1;
        else next.awayFouls += 1;
        break;
      case 'corner':
        if (event.teamId === 'home') next.homeCorners += 1;
        else next.awayCorners += 1;
        break;
      case 'shot':
        if (event.teamId === 'home') next.homeShots += 1;
        else next.awayShots += 1;
        break;
      case 'clock':
        break;
    }

    return next;
  }
}

// 2. Basketball scoring engine implementation
export interface BasketballEvent {
  id: string;
  type: 'score' | 'foul' | 'timeout' | 'possession' | 'quarter' | 'shot_clock' | 'clock';
  teamId?: 'home' | 'away';
  points?: number; // 1, 2, 3, or -1
  player?: string;
  quarter?: 1 | 2 | 3 | 4 | 'OT';
  clock?: string;
  shotClock?: number;
  isTimerRunning?: boolean;
}

export class BasketballEngine implements SportEngine<BasketballMatchState, BasketballEvent> {
  sport: SportType = 'basketball';

  initializeMatch(): BasketballMatchState {
    return {
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
      lastPlay: 'Tip-off won',
    };
  }

  validateEvent(): ValidationResult {
    return { valid: true };
  }

  processEvent(state: BasketballMatchState, event: BasketballEvent): BasketballMatchState {
    const next: BasketballMatchState = JSON.parse(JSON.stringify(state));
    const qIndex = typeof next.quarter === 'number' ? Math.min(next.quarter - 1, 3) : 3;

    if (typeof event.isTimerRunning === 'boolean') {
      next.isTimerRunning = event.isTimerRunning;
    }

    switch (event.type) {
      case 'score': {
        const pts = event.points || 2;
        if (event.teamId === 'home') {
          next.homeScore = Math.max(0, next.homeScore + pts);
          if (next.quarterScores[qIndex]) {
            next.quarterScores[qIndex].home = Math.max(0, next.quarterScores[qIndex].home + pts);
          }
          next.possession = 'away';
        } else {
          next.awayScore = Math.max(0, next.awayScore + pts);
          if (next.quarterScores[qIndex]) {
            next.quarterScores[qIndex].away = Math.max(0, next.quarterScores[qIndex].away + pts);
          }
          next.possession = 'home';
        }
        next.shotClock = 24;
        if (pts > 0) {
          const label = pts === 3 ? '3PT FG' : pts === 2 ? '2PT FG' : 'Free Throw';
          next.lastPlay = `${event.player || (event.teamId === 'home' ? 'Home' : 'Away')} +${pts} (${label})`;
        }
        break;
      }
      case 'foul':
        if (event.teamId === 'home') next.homeFouls += 1;
        else next.awayFouls += 1;
        next.lastPlay = `Team Foul (${event.teamId === 'home' ? 'Home' : 'Away'})`;
        break;
      case 'timeout':
        if (event.teamId === 'home') next.homeTimeouts = Math.max(0, next.homeTimeouts - 1);
        else next.awayTimeouts = Math.max(0, next.awayTimeouts - 1);
        next.lastPlay = `Timeout called (${event.teamId === 'home' ? 'Home' : 'Away'})`;
        break;
      case 'possession':
        next.possession = event.teamId || (next.possession === 'home' ? 'away' : 'home');
        break;
      case 'quarter':
        if (event.quarter) {
          next.quarter = event.quarter;
          next.clock = event.clock || (event.quarter === 'OT' ? '05:00' : '12:00');
          next.shotClock = 24;
          next.homeFouls = 0;
          next.awayFouls = 0;
        }
        break;
      case 'shot_clock':
        next.shotClock = event.shotClock ?? 24;
        break;
      case 'clock':
        if (event.clock) next.clock = event.clock;
        if (typeof event.shotClock === 'number') next.shotClock = event.shotClock;
        break;
    }

    return next;
  }
}

// 3. Tennis scoring engine implementation
export interface TennisEvent {
  id: string;
  winner: 'home' | 'away';
  isAce?: boolean;
  isDoubleFault?: boolean;
  isBreakPoint?: boolean;
}

export class TennisEngine implements SportEngine<TennisMatchState, TennisEvent> {
  sport: SportType = 'tennis';

  initializeMatch(): TennisMatchState {
    return {
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
    };
  }

  validateEvent(): ValidationResult {
    return { valid: true };
  }

  processEvent(state: TennisMatchState, event: TennisEvent): TennisMatchState {
    const next: TennisMatchState = JSON.parse(JSON.stringify(state));
    const { homePoints, awayPoints } = next.currentGame;

    if (event.isAce) {
      if (event.winner === 'home') next.homeAces = (next.homeAces || 0) + 1;
      else next.awayAces = (next.awayAces || 0) + 1;
    }

    const checkSetWin = () => {
      const currSet = next.sets[next.currentSet];
      if (!currSet) return;
      if ((currSet.home >= 6 || currSet.away >= 6) && Math.abs(currSet.home - currSet.away) >= 2) {
        next.sets.push({ home: 0, away: 0 });
        next.currentSet += 1;
      }
    };

    if (event.winner === 'home') {
      if (homePoints === '0') next.currentGame.homePoints = '15';
      else if (homePoints === '15') next.currentGame.homePoints = '30';
      else if (homePoints === '30') next.currentGame.homePoints = '40';
      else if (homePoints === '40') {
        if (awayPoints === '40') next.currentGame.homePoints = 'AD';
        else if (awayPoints === 'AD') next.currentGame.awayPoints = '40';
        else {
          next.sets[next.currentSet].home += 1;
          next.currentGame.homePoints = '0';
          next.currentGame.awayPoints = '0';
          next.currentGame.server = next.currentGame.server === 'home' ? 'away' : 'home';
          checkSetWin();
        }
      } else if (homePoints === 'AD') {
        next.sets[next.currentSet].home += 1;
        next.currentGame.homePoints = '0';
        next.currentGame.awayPoints = '0';
        next.currentGame.server = next.currentGame.server === 'home' ? 'away' : 'home';
        checkSetWin();
      }
    } else {
      if (awayPoints === '0') next.currentGame.awayPoints = '15';
      else if (awayPoints === '15') next.currentGame.awayPoints = '30';
      else if (awayPoints === '30') next.currentGame.awayPoints = '40';
      else if (awayPoints === '40') {
        if (homePoints === '40') next.currentGame.awayPoints = 'AD';
        else if (homePoints === 'AD') next.currentGame.homePoints = '40';
        else {
          next.sets[next.currentSet].away += 1;
          next.currentGame.homePoints = '0';
          next.currentGame.awayPoints = '0';
          next.currentGame.server = next.currentGame.server === 'home' ? 'away' : 'home';
          checkSetWin();
        }
      } else if (awayPoints === 'AD') {
        next.sets[next.currentSet].away += 1;
        next.currentGame.homePoints = '0';
        next.currentGame.awayPoints = '0';
        next.currentGame.server = next.currentGame.server === 'home' ? 'away' : 'home';
        checkSetWin();
      }
    }

    return next;
  }
}

// 4. Baseball scoring engine implementation
export interface BaseballEvent {
  type:
    | 'ball'
    | 'strike'
    | 'out'
    | 'single'
    | 'double'
    | 'triple'
    | 'home_run'
    | 'run'
    | 'error'
    | 'toggle_base'
    | 'next_half';
  teamId?: 'home' | 'away';
  base?: 'first' | 'second' | 'third';
  player?: string;
}

export class BaseballEngine implements SportEngine<BaseballMatchState, BaseballEvent> {
  sport: SportType = 'baseball';

  initializeMatch(): BaseballMatchState {
    return {
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
      pitcher: 'G. Cole',
      batter: 'S. Ohtani',
      lastPlay: 'Play Ball',
    };
  }

  validateEvent(): ValidationResult {
    return { valid: true };
  }

  private advanceHalfInning(next: BaseballMatchState) {
    next.balls = 0;
    next.strikes = 0;
    next.outs = 0;
    next.bases = { first: false, second: false, third: false };
    if (next.half === 'top') {
      next.half = 'bottom';
    } else {
      next.half = 'top';
      next.inning += 1;
    }
  }

  private addRunToBattingTeam(next: BaseballMatchState, count: number) {
    if (next.half === 'top') {
      next.awayScore += count;
    } else {
      next.homeScore += count;
    }
  }

  private addHitToBattingTeam(next: BaseballMatchState) {
    if (next.half === 'top') {
      next.awayHits += 1;
    } else {
      next.homeHits += 1;
    }
  }

  processEvent(state: BaseballMatchState, event: BaseballEvent): BaseballMatchState {
    const next: BaseballMatchState = JSON.parse(JSON.stringify(state));

    switch (event.type) {
      case 'ball':
        next.balls += 1;
        if (next.balls >= 4) {
          // Walk (Base on Balls)
          next.balls = 0;
          next.strikes = 0;
          if (next.bases.first && next.bases.second && next.bases.third) {
            this.addRunToBattingTeam(next, 1);
          } else if (next.bases.first && next.bases.second) {
            next.bases.third = true;
          } else if (next.bases.first) {
            next.bases.second = true;
          } else {
            next.bases.first = true;
          }
          next.lastPlay = 'Base on Balls (Walk)';
        }
        break;
      case 'strike':
        next.strikes += 1;
        if (next.strikes >= 3) {
          next.balls = 0;
          next.strikes = 0;
          next.outs += 1;
          next.lastPlay = 'Strikeout (K)';
          if (next.outs >= 3) {
            this.advanceHalfInning(next);
          }
        }
        break;
      case 'out':
        next.balls = 0;
        next.strikes = 0;
        next.outs += 1;
        next.lastPlay = 'Batter Out';
        if (next.outs >= 3) {
          this.advanceHalfInning(next);
        }
        break;
      case 'single':
        next.balls = 0;
        next.strikes = 0;
        this.addHitToBattingTeam(next);
        if (next.bases.third) {
          this.addRunToBattingTeam(next, 1);
          next.bases.third = false;
        }
        if (next.bases.second) {
          next.bases.third = true;
          next.bases.second = false;
        }
        if (next.bases.first) {
          next.bases.second = true;
        }
        next.bases.first = true;
        next.lastPlay = `${event.player || 'Batter'} hits a Single (1B)`;
        break;
      case 'double':
        next.balls = 0;
        next.strikes = 0;
        this.addHitToBattingTeam(next);
        if (next.bases.third) {
          this.addRunToBattingTeam(next, 1);
          next.bases.third = false;
        }
        if (next.bases.second) {
          this.addRunToBattingTeam(next, 1);
          next.bases.second = false;
        }
        if (next.bases.first) {
          next.bases.third = true;
          next.bases.first = false;
        }
        next.bases.second = true;
        next.lastPlay = `${event.player || 'Batter'} hits a Double (2B)`;
        break;
      case 'triple': {
        next.balls = 0;
        next.strikes = 0;
        this.addHitToBattingTeam(next);
        const runnersOn =
          (next.bases.first ? 1 : 0) + (next.bases.second ? 1 : 0) + (next.bases.third ? 1 : 0);
        this.addRunToBattingTeam(next, runnersOn);
        next.bases = { first: false, second: false, third: true };
        next.lastPlay = `${event.player || 'Batter'} hits a Triple (3B)`;
        break;
      }
      case 'home_run': {
        next.balls = 0;
        next.strikes = 0;
        this.addHitToBattingTeam(next);
        const runners =
          (next.bases.first ? 1 : 0) + (next.bases.second ? 1 : 0) + (next.bases.third ? 1 : 0);
        const totalRuns = runners + 1;
        this.addRunToBattingTeam(next, totalRuns);
        next.bases = { first: false, second: false, third: false };
        next.lastPlay = `HOME RUN! (${totalRuns} RBI)`;
        break;
      }
      case 'run':
        if (event.teamId === 'home') next.homeScore += 1;
        else if (event.teamId === 'away') next.awayScore += 1;
        else this.addRunToBattingTeam(next, 1);
        break;
      case 'error':
        if (event.teamId === 'home') next.homeErrors += 1;
        else next.awayErrors += 1;
        break;
      case 'toggle_base':
        if (event.base) {
          next.bases[event.base] = !next.bases[event.base];
        }
        break;
      case 'next_half':
        this.advanceHalfInning(next);
        break;
    }

    return next;
  }
}

// 5. Rugby scoring engine implementation
export interface RugbyEvent {
  type: 'try' | 'conversion' | 'penalty' | 'drop_goal' | 'sin_bin' | 'clock';
  teamId: 'home' | 'away';
  player?: string;
  minute?: number;
  half?: RugbyMatchState['half'];
}

export class RugbyEngine implements SportEngine<RugbyMatchState, RugbyEvent> {
  sport: SportType = 'rugby';

  initializeMatch(): RugbyMatchState {
    return {
      half: '1st',
      minute: 0,
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
    };
  }

  validateEvent(): ValidationResult {
    return { valid: true };
  }

  processEvent(state: RugbyMatchState, event: RugbyEvent): RugbyMatchState {
    const next: RugbyMatchState = JSON.parse(JSON.stringify(state));
    if (typeof event.minute === 'number') next.minute = event.minute;
    if (event.half) next.half = event.half;

    switch (event.type) {
      case 'try':
        if (event.teamId === 'home') {
          next.homeScore += 5;
          next.homeTries += 1;
        } else {
          next.awayScore += 5;
          next.awayTries += 1;
        }
        next.lastPlay = `TRY! ${event.player || ''} (+5 pts)`;
        break;
      case 'conversion':
        if (event.teamId === 'home') next.homeScore += 2;
        else next.awayScore += 2;
        next.lastPlay = `Conversion Kick Good (+2 pts)`;
        break;
      case 'penalty':
        if (event.teamId === 'home') {
          next.homeScore += 3;
          next.homePenalties += 1;
        } else {
          next.awayScore += 3;
          next.awayPenalties += 1;
        }
        next.lastPlay = `Penalty Goal (+3 pts)`;
        break;
      case 'drop_goal':
        if (event.teamId === 'home') next.homeScore += 3;
        else next.awayScore += 3;
        next.lastPlay = `Drop Goal (+3 pts)`;
        break;
      case 'sin_bin':
        if (event.teamId === 'home') next.homeSinBin += 1;
        else next.awaySinBin += 1;
        next.lastPlay = `Yellow Card / 10m Sin Bin`;
        break;
      case 'clock':
        break;
    }

    return next;
  }
}

// 6. Field Hockey scoring engine implementation
export interface FieldHockeyEvent {
  type: 'goal' | 'penalty_corner' | 'green_card' | 'yellow_card' | 'red_card' | 'quarter';
  teamId: 'home' | 'away';
  player?: string;
  quarter?: FieldHockeyMatchState['quarter'];
  minute?: number;
}

export class FieldHockeyEngine implements SportEngine<FieldHockeyMatchState, FieldHockeyEvent> {
  sport: SportType = 'field_hockey';

  initializeMatch(): FieldHockeyMatchState {
    return {
      quarter: 1,
      minute: 1,
      isTimerRunning: true,
      homeScore: 0,
      awayScore: 0,
      homePenaltyCorners: 0,
      awayPenaltyCorners: 0,
      homeCards: { green: 0, yellow: 0, red: 0 },
      awayCards: { green: 0, yellow: 0, red: 0 },
      lastPlay: 'Pushback',
    };
  }

  validateEvent(): ValidationResult {
    return { valid: true };
  }

  processEvent(state: FieldHockeyMatchState, event: FieldHockeyEvent): FieldHockeyMatchState {
    const next: FieldHockeyMatchState = JSON.parse(JSON.stringify(state));
    if (event.quarter) next.quarter = event.quarter;
    if (typeof event.minute === 'number') next.minute = event.minute;

    switch (event.type) {
      case 'goal':
        if (event.teamId === 'home') next.homeScore += 1;
        else next.awayScore += 1;
        next.lastPlay = `GOAL! ${event.player || ''}`;
        break;
      case 'penalty_corner':
        if (event.teamId === 'home') next.homePenaltyCorners += 1;
        else next.awayPenaltyCorners += 1;
        next.lastPlay = `Penalty Corner Awarded`;
        break;
      case 'green_card':
        if (event.teamId === 'home') next.homeCards.green += 1;
        else next.awayCards.green += 1;
        next.lastPlay = `Green Card (2m Suspension)`;
        break;
      case 'yellow_card':
        if (event.teamId === 'home') next.homeCards.yellow += 1;
        else next.awayCards.yellow += 1;
        next.lastPlay = `Yellow Card (5m Suspension)`;
        break;
      case 'red_card':
        if (event.teamId === 'home') next.homeCards.red += 1;
        else next.awayCards.red += 1;
        next.lastPlay = `Red Card`;
        break;
      case 'quarter':
        break;
    }

    return next;
  }
}
