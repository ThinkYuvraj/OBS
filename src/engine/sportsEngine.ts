import {
  FootballMatchState,
  Match,
  MatchStatus,
  SportType,
  TennisMatchState,
} from '../types/sports';

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export interface SportEngine<TState, TEvent> {
  sport: SportType;
  initializeMatch(config: any): TState;
  processEvent(state: TState, event: TEvent): TState;
  validateEvent(state: TState, event: TEvent): ValidationResult;
}

// Football scoring engine implementation
export interface FootballEvent {
  id: string;
  type: 'goal' | 'yellow' | 'red' | 'sub' | 'foul' | 'corner' | 'shot';
  minute: number;
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

  validateEvent(state: FootballMatchState, event: FootballEvent): ValidationResult {
    if (!event.player && event.type === 'goal') {
      return { valid: false, message: 'Scorer player name is required' };
    }
    return { valid: true };
  }

  processEvent(state: FootballMatchState, event: FootballEvent): FootballMatchState {
    const next: FootballMatchState = JSON.parse(JSON.stringify(state));

    switch (event.type) {
      case 'goal':
        if (event.teamId === 'home') next.homeScore += 1;
        else next.awayScore += 1;
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
    }

    return next;
  }
}

// Tennis scoring engine implementation
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
    };
  }

  validateEvent(): ValidationResult {
    return { valid: true };
  }

  processEvent(state: TennisMatchState, event: TennisEvent): TennisMatchState {
    const next: TennisMatchState = JSON.parse(JSON.stringify(state));
    const pointsOrder: ('0' | '15' | '30' | '40' | 'AD')[] = ['0', '15', '30', '40'];
    const { homePoints, awayPoints } = next.currentGame;

    if (event.winner === 'home') {
      if (homePoints === '0') next.currentGame.homePoints = '15';
      else if (homePoints === '15') next.currentGame.homePoints = '30';
      else if (homePoints === '30') next.currentGame.homePoints = '40';
      else if (homePoints === '40') {
        if (awayPoints === '40') next.currentGame.homePoints = 'AD';
        else if (awayPoints === 'AD') next.currentGame.awayPoints = '40';
        else {
          // Home wins game!
          next.sets[next.currentSet].home += 1;
          next.currentGame.homePoints = '0';
          next.currentGame.awayPoints = '0';
          next.currentGame.server = next.currentGame.server === 'home' ? 'away' : 'home';
        }
      } else if (homePoints === 'AD') {
        // Home wins game!
        next.sets[next.currentSet].home += 1;
        next.currentGame.homePoints = '0';
        next.currentGame.awayPoints = '0';
        next.currentGame.server = next.currentGame.server === 'home' ? 'away' : 'home';
      }
    } else {
      if (awayPoints === '0') next.currentGame.awayPoints = '15';
      else if (awayPoints === '15') next.currentGame.awayPoints = '30';
      else if (awayPoints === '30') next.currentGame.awayPoints = '40';
      else if (awayPoints === '40') {
        if (homePoints === '40') next.currentGame.awayPoints = 'AD';
        else if (homePoints === 'AD') next.currentGame.homePoints = '40';
        else {
          // Away wins game!
          next.sets[next.currentSet].away += 1;
          next.currentGame.homePoints = '0';
          next.currentGame.awayPoints = '0';
          next.currentGame.server = next.currentGame.server === 'home' ? 'away' : 'home';
        }
      } else if (awayPoints === 'AD') {
        next.sets[next.currentSet].away += 1;
        next.currentGame.homePoints = '0';
        next.currentGame.awayPoints = '0';
        next.currentGame.server = next.currentGame.server === 'home' ? 'away' : 'home';
      }
    }

    return next;
  }
}
