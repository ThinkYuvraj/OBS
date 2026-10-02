import {
  BallEvent,
  CricketInnings,
  CricketMatchState,
  WicketType,
} from '../types/sports';

export function formatOvers(legalBalls: number): string {
  const overs = Math.floor(legalBalls / 6);
  const balls = legalBalls % 6;
  return `${overs}.${balls}`;
}

export function calculateCRR(runs: number, legalBalls: number): number {
  if (legalBalls === 0) return 0;
  const overs = legalBalls / 6;
  return Number((runs / overs).toFixed(2));
}

export function calculateRRR(
  runs: number,
  target: number | undefined,
  legalBalls: number,
  maxOvers: number
): number | undefined {
  if (target === undefined) return undefined;
  const remainingRuns = target - runs;
  const remainingBalls = maxOvers * 6 - legalBalls;
  if (remainingRuns <= 0) return 0;
  if (remainingBalls <= 0) return 99.99;
  const remainingOvers = remainingBalls / 6;
  return Number((remainingRuns / remainingOvers).toFixed(2));
}

export function processBallEvent(
  state: CricketMatchState,
  event: BallEvent
): CricketMatchState {
  // Clone current innings
  const inningsIndex = state.currentInningsIndex;
  const currentInnings = state.innings[inningsIndex];
  if (!currentInnings) return state;

  const innings: CricketInnings = JSON.parse(JSON.stringify(currentInnings));

  // Determine legal ball status
  const isLegalBall = !event.isWide && !event.isNoBall;
  event.isLegalBall = isLegalBall;

  // Calculate runs breakdown
  let runsOffBat = event.runsOffBat || 0;
  let extraRuns = 0;

  if (event.isWide) extraRuns += 1;
  if (event.isNoBall) extraRuns += 1;
  if (event.isBye || event.isLegBye) {
    extraRuns += event.runsOffBat;
    runsOffBat = 0; // Batters don't get runs for byes/leg-byes
  }
  if (event.penaltyRuns) extraRuns += event.penaltyRuns;

  const totalBallRuns = runsOffBat + extraRuns;
  event.totalRuns = totalBallRuns;

  // Update total innings runs and extras
  innings.runs += totalBallRuns;
  if (event.isWide) innings.extras.wides += 1;
  if (event.isNoBall) innings.extras.noBalls += 1;
  if (event.isBye) innings.extras.byes += event.runsOffBat;
  if (event.isLegBye) innings.extras.legByes += event.runsOffBat;
  if (event.penaltyRuns) innings.extras.penalty += event.penaltyRuns;
  innings.extras.total =
    innings.extras.wides +
    innings.extras.noBalls +
    innings.extras.byes +
    innings.extras.legByes +
    innings.extras.penalty;

  // Update legal balls
  if (isLegalBall) {
    innings.legalBalls += 1;
  }
  innings.oversFormatted = formatOvers(innings.legalBalls);

  // Update Batters
  let striker = innings.batters.find((b) => b.playerId === event.strikerId);
  if (!striker) {
    striker = {
      playerId: event.strikerId,
      name: event.strikerName,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      strikeRate: 0,
      isOut: false,
    };
    innings.batters.push(striker);
  }

  // Wide ball is not counted in balls faced
  if (!event.isWide) {
    striker.balls += 1;
  }
  striker.runs += runsOffBat;
  if (runsOffBat === 4) striker.fours += 1;
  if (runsOffBat === 6) striker.sixes += 1;
  striker.strikeRate =
    striker.balls > 0 ? Number(((striker.runs / striker.balls) * 100).toFixed(1)) : 0;

  // Non-striker check
  let nonStriker = innings.batters.find((b) => b.playerId === event.nonStrikerId);
  if (!nonStriker) {
    nonStriker = {
      playerId: event.nonStrikerId,
      name: event.nonStrikerName,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      strikeRate: 0,
      isOut: false,
    };
    innings.batters.push(nonStriker);
  }

  // Update Bowler
  let bowler = innings.bowlers.find((b) => b.playerId === event.bowlerId);
  if (!bowler) {
    bowler = {
      playerId: event.bowlerId,
      name: event.bowlerName,
      overs: '0.0',
      legalBalls: 0,
      maidens: 0,
      runsConceded: 0,
      wickets: 0,
      economy: 0,
    };
    innings.bowlers.push(bowler);
  }

  if (isLegalBall) {
    bowler.legalBalls += 1;
  }
  bowler.overs = formatOvers(bowler.legalBalls);

  // Bowler concedes bat runs + wides + no-balls (byes and leg byes do not go against bowler)
  let bowlerRuns = runsOffBat;
  if (event.isWide) bowlerRuns += 1;
  if (event.isNoBall) bowlerRuns += 1;
  bowler.runsConceded += bowlerRuns;

  // Wicket logic
  if (event.isWicket) {
    innings.wickets += 1;
    // Bowler gets credit for wicket unless run out or retired hurt
    if (event.wicketType !== 'run_out' && event.wicketType !== 'retired_hurt') {
      bowler.wickets += 1;
    }

    const dismissedId = event.dismissedBatterId || event.strikerId;
    const dismissedBatter = innings.batters.find((b) => b.playerId === dismissedId);
    let dismissalText = formatDismissal(
      event.wicketType || 'bowled',
      event.bowlerName,
      event.fielderName
    );

    if (dismissedBatter) {
      dismissedBatter.isOut = true;
      dismissedBatter.dismissal = dismissalText;
    }

    innings.fallOfWickets.push({
      wicketNumber: innings.wickets,
      score: innings.runs,
      overs: innings.oversFormatted,
      batterName: dismissedBatter ? dismissedBatter.name : event.strikerName,
      dismissal: dismissalText,
    });

    // Reset partnership on wicket
    innings.currentPartnership = { runs: 0, balls: 0 };

    // Set new batter
    if (event.nextBatterId && event.nextBatterName) {
      if (dismissedId === event.strikerId) {
        innings.currentStrikerId = event.nextBatterId;
        if (!innings.batters.some((b) => b.playerId === event.nextBatterId)) {
          innings.batters.push({
            playerId: event.nextBatterId,
            name: event.nextBatterName,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            strikeRate: 0,
            isOut: false,
          });
        }
      } else {
        innings.currentNonStrikerId = event.nextBatterId;
        if (!innings.batters.some((b) => b.playerId === event.nextBatterId)) {
          innings.batters.push({
            playerId: event.nextBatterId,
            name: event.nextBatterName,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            strikeRate: 0,
            isOut: false,
          });
        }
      }
    }
  } else {
    // Add to partnership
    innings.currentPartnership.runs += totalBallRuns;
    if (isLegalBall) {
      innings.currentPartnership.balls += 1;
    }
  }

  // Update Bowler economy
  if (bowler.legalBalls > 0) {
    bowler.economy = Number(
      (bowler.runsConceded / (bowler.legalBalls / 6)).toFixed(2)
    );
  }

  // Strike rotation logic:
  // Runs 1, 3 rotate strike
  let shouldSwapStrike = false;
  const runsRan = event.runsOffBat || 0;
  if (runsRan % 2 === 1) {
    shouldSwapStrike = !shouldSwapStrike;
  }

  // Over completion check (6 legal balls)
  const isOverComplete = isLegalBall && innings.legalBalls % 6 === 0;

  if (isOverComplete) {
    // At end of over, batsmen swap ends (unless odd runs ran on last ball, where it rotates back)
    shouldSwapStrike = !shouldSwapStrike;
  }

  if (shouldSwapStrike) {
    const temp = innings.currentStrikerId;
    innings.currentStrikerId = innings.currentNonStrikerId;
    innings.currentNonStrikerId = temp;
  }

  // Update over history
  const currentOverIndex = Math.max(0, Math.floor((innings.legalBalls - (isLegalBall ? 1 : 0)) / 6));
  let overSummary = innings.oversHistory.find(
    (o) => o.overNumber === currentOverIndex
  );
  if (!overSummary) {
    overSummary = {
      overNumber: currentOverIndex,
      bowlerName: event.bowlerName,
      balls: [],
      totalRuns: 0,
    };
    innings.oversHistory.push(overSummary);
  }

  let ballText = formatBallChipText(event);
  overSummary.balls.push({
    text: ballText,
    runs: totalBallRuns,
    isWicket: event.isWicket,
    isBoundary: runsOffBat === 4 || runsOffBat === 6,
  });
  overSummary.totalRuns += totalBallRuns;

  // Check maiden over
  if (isOverComplete && overSummary.balls.length >= 6 && overSummary.totalRuns === 0) {
    bowler.maidens += 1;
  }

  // Update rates
  innings.currentRunRate = calculateCRR(innings.runs, innings.legalBalls);
  innings.requiredRunRate = calculateRRR(
    innings.runs,
    state.target,
    innings.legalBalls,
    state.maxOvers
  );

  // Check if target chased or innings completed
  if (state.target && innings.runs >= state.target) {
    innings.isCompleted = true;
  }
  if (innings.legalBalls >= state.maxOvers * 6 || innings.wickets >= 10) {
    innings.isCompleted = true;
  }

  // Update state copy
  const updatedInnings = [...state.innings];
  updatedInnings[inningsIndex] = innings;

  return {
    ...state,
    innings: updatedInnings,
    lastBallEvent: event,
  };
}

export function formatDismissal(
  type: WicketType,
  bowlerName: string,
  fielderName?: string
): string {
  switch (type) {
    case 'bowled':
      return `b ${bowlerName}`;
    case 'caught':
      return fielderName ? `c ${fielderName} b ${bowlerName}` : `c & b ${bowlerName}`;
    case 'lbw':
      return `lbw b ${bowlerName}`;
    case 'run_out':
      return fielderName ? `run out (${fielderName})` : 'run out';
    case 'stumped':
      return fielderName ? `st ${fielderName} b ${bowlerName}` : `stumped b ${bowlerName}`;
    case 'hit_wicket':
      return `hit wicket b ${bowlerName}`;
    case 'retired_hurt':
      return 'retired hurt';
    default:
      return `out b ${bowlerName}`;
  }
}

export function formatBallChipText(event: BallEvent): string {
  if (event.isWicket) {
    return 'W';
  }
  if (event.isWide) {
    return event.runsOffBat > 0 ? `Wd+${event.runsOffBat}` : 'Wd';
  }
  if (event.isNoBall) {
    return event.runsOffBat > 0 ? `Nb+${event.runsOffBat}` : 'Nb';
  }
  if (event.isBye) {
    return `B${event.runsOffBat}`;
  }
  if (event.isLegBye) {
    return `LB${event.runsOffBat}`;
  }
  return `${event.runsOffBat}`;
}

export function rebuildCricketState(
  initialState: CricketMatchState,
  events: BallEvent[]
): CricketMatchState {
  let state = JSON.parse(JSON.stringify(initialState)) as CricketMatchState;
  // Sort events by sequence
  const sorted = [...events].sort((a, b) => a.sequence - b.sequence);
  for (const event of sorted) {
    state = processBallEvent(state, event);
  }
  return state;
}
