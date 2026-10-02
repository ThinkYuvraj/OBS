import { BallEvent, Match } from '../types/sports';

export interface LiveScore {
  matchId: string;
  sport: string;
  scoreText: string;
  oversOrTime: string;
  battingTeam: string;
  bowlingTeam: string;
  currentRunRate?: number;
  requiredRunRate?: number;
  lastEventSummary?: string;
  timestamp: number;
}

export interface SportsDataProvider {
  providerName: string;
  getMatch(matchId: string): Promise<Match | null>;
  getLiveScore(matchId: string): Promise<LiveScore | null>;
  pollEvents?(matchId: string, afterSequence: number): Promise<BallEvent[]>;
}

export class ManualScoringProvider implements SportsDataProvider {
  providerName = 'Direct Broadcast Scorer';

  constructor(private getMatchFn: (id: string) => Match | null) {}

  async getMatch(matchId: string): Promise<Match | null> {
    return this.getMatchFn(matchId);
  }

  async getLiveScore(matchId: string): Promise<LiveScore | null> {
    const match = this.getMatchFn(matchId);
    if (!match) return null;

    if (match.sport === 'cricket' && match.cricketState) {
      const innings = match.cricketState.innings[match.cricketState.currentInningsIndex];
      return {
        matchId,
        sport: 'cricket',
        scoreText: `${innings.runs}/${innings.wickets}`,
        oversOrTime: `${innings.oversFormatted} ov`,
        battingTeam: match.teamA.id === innings.battingTeamId ? match.teamA.name : match.teamB.name,
        bowlingTeam: match.teamA.id === innings.bowlingTeamId ? match.teamA.name : match.teamB.name,
        currentRunRate: innings.currentRunRate,
        requiredRunRate: innings.requiredRunRate,
        timestamp: Date.now(),
      };
    }

    if (match.sport === 'football' && match.footballState) {
      return {
        matchId,
        sport: 'football',
        scoreText: `${match.footballState.homeScore} - ${match.footballState.awayScore}`,
        oversOrTime: `${match.footballState.minute}'`,
        battingTeam: match.teamA.name,
        bowlingTeam: match.teamB.name,
        timestamp: Date.now(),
      };
    }

    return null;
  }
}

/**
 * Simulated Live Sports Feed for broadcaster training and demo streams
 */
export class LiveFeedSimulator {
  private activeIntervals: Map<string, NodeJS.Timeout> = new Map();

  startSimulation(
    matchId: string,
    onBallGenerated: (ball: Partial<BallEvent>) => void,
    intervalMs = 4000
  ) {
    if (this.activeIntervals.has(matchId)) return;

    const outcomes: { batRuns: number; isWicket?: boolean; isWide?: boolean; isNoBall?: boolean }[] = [
      { batRuns: 0 },
      { batRuns: 1 },
      { batRuns: 0 },
      { batRuns: 4 },
      { batRuns: 1 },
      { batRuns: 2 },
      { batRuns: 0 },
      { batRuns: 6 },
      { batRuns: 1 },
      { batRuns: 0, isWicket: true },
      { batRuns: 0, isWide: true },
      { batRuns: 1 },
      { batRuns: 4 },
    ];

    let outcomeIndex = 0;

    const timer = setInterval(() => {
      const outcome = outcomes[outcomeIndex % outcomes.length];
      outcomeIndex++;

      onBallGenerated({
        runsOffBat: outcome.batRuns,
        isWicket: outcome.isWicket || false,
        isWide: outcome.isWide || false,
        isNoBall: outcome.isNoBall || false,
        wicketType: outcome.isWicket ? 'caught' : undefined,
        fielderName: outcome.isWicket ? 'Smith' : undefined,
      });
    }, intervalMs);

    this.activeIntervals.set(matchId, timer);
  }

  stopSimulation(matchId: string) {
    const timer = this.activeIntervals.get(matchId);
    if (timer) {
      clearInterval(timer);
      this.activeIntervals.delete(matchId);
    }
  }

  isSimulating(matchId: string): boolean {
    return this.activeIntervals.has(matchId);
  }
}
