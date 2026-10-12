import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { realtimeHub } from '../websocket';
import { LiveFeedSimulator, ManualScoringProvider } from '../../engine/sportsDataProvider';

const router = Router();
const simulator = new LiveFeedSimulator();
const scoringProvider = new ManualScoringProvider((id) => storage.getMatch(id));

// 1. Matches CRUD
router.get('/', (_req: Request, res: Response) => {
  const matches = storage.getMatches();
  res.json({ matches });
});

router.post('/', (req: Request, res: Response) => {
  const newMatch = storage.createMatch(req.body);
  realtimeHub.broadcastMatchUpdate(newMatch.id, newMatch);
  res.status(201).json({ match: newMatch });
});

router.get('/:id', (req: Request, res: Response) => {
  const match = storage.getMatch(req.params.id);
  if (!match) {
    return res.status(404).json({ error: 'Match not found' });
  }
  res.json({ match });
});

router.put('/:id', (req: Request, res: Response) => {
  const updated = storage.updateMatch(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Match not found' });
  }
  realtimeHub.broadcastMatchUpdate(updated.id, updated);
  res.json({ match: updated });
});

router.delete('/:id', (req: Request, res: Response) => {
  simulator.stopSimulation(req.params.id);
  const success = storage.deleteMatch(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Match not found' });
  }
  res.json({ success: true });
});

// 2. Ball-by-Ball Cricket Events API
router.get('/:id/events', (req: Request, res: Response) => {
  const events = storage.getBallEvents(req.params.id);
  res.json({ events });
});

router.post('/:id/events', (req: Request, res: Response) => {
  const result = storage.addBallEvent(req.params.id, req.body);
  if (!result) {
    return res.status(400).json({ error: 'Failed to record ball event or invalid match' });
  }
  realtimeHub.broadcastMatchUpdate(result.match.id, result.match);
  res.status(201).json(result);
});

router.post('/:id/undo', (req: Request, res: Response) => {
  const result = storage.undoLastEvent(req.params.id);
  if (!result) {
    return res.status(400).json({ error: 'Nothing to undo' });
  }
  realtimeHub.broadcastMatchUpdate(result.match.id, result.match);
  res.json(result);
});

router.post('/:id/redo', (req: Request, res: Response) => {
  const result = storage.redoEvent(req.params.id);
  if (!result) {
    return res.status(400).json({ error: 'Nothing to redo' });
  }
  realtimeHub.broadcastMatchUpdate(result.match.id, result.match);
  res.json(result);
});

// 3. Live Score Summary Provider
router.get('/:id/live', async (req: Request, res: Response) => {
  const liveScore = await scoringProvider.getLiveScore(req.params.id);
  if (!liveScore) {
    return res.status(404).json({ error: 'Live score unavailable' });
  }
  res.json({ liveScore });
});

// 4. Automated Simulation
router.post('/:id/simulate-next-ball', (req: Request, res: Response) => {
  const match = storage.getMatch(req.params.id);
  if (!match || match.sport !== 'cricket' || !match.cricketState) {
    return res.status(400).json({ error: 'Invalid match for cricket simulation' });
  }

  const outcomes: { runs: number; isWicket?: boolean; isWide?: boolean; isNoBall?: boolean; wicketType?: any }[] = [
    { runs: 1 },
    { runs: 0 },
    { runs: 4 },
    { runs: 2 },
    { runs: 6 },
    { runs: 0, isWide: true },
    { runs: 1 },
    { runs: 0, isWicket: true, wicketType: 'caught' },
  ];

  const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
  const result = storage.addBallEvent(match.id, {
    runsOffBat: outcome.runs,
    isWicket: outcome.isWicket || false,
    wicketType: outcome.wicketType,
    isWide: outcome.isWide || false,
    isNoBall: outcome.isNoBall || false,
  });

  if (result) {
    realtimeHub.broadcastMatchUpdate(result.match.id, result.match);
  }
  res.json(result);
});

router.post('/:id/toggle-simulation', (req: Request, res: Response) => {
  const matchId = req.params.id;
  const isRunning = simulator.isSimulating(matchId);

  if (isRunning) {
    simulator.stopSimulation(matchId);
    return res.json({ simulating: false, message: 'Simulation stopped' });
  } else {
    simulator.startSimulation(
      matchId,
      (ball) => {
        const resBall = storage.addBallEvent(matchId, ball);
        if (resBall) {
          realtimeHub.broadcastMatchUpdate(resBall.match.id, resBall.match);
        }
      },
      3500
    );
    return res.json({ simulating: true, message: 'Simulation active' });
  }
});

export default router;
