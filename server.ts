import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { storage } from './src/server/storage';
import { realtimeHub } from './src/server/websocket';
import { LiveFeedSimulator, ManualScoringProvider } from './src/engine/sportsDataProvider';
import {
  BaseballEngine,
  BasketballEngine,
  FieldHockeyEngine,
  FootballEngine,
  RugbyEngine,
  TennisEngine,
} from './src/engine/sportsEngine';
import { OverlayAlert } from './src/types/sports';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || '3000', 10);

const app = express();
app.use(express.json());

const simulator = new LiveFeedSimulator();
const scoringProvider = new ManualScoringProvider((id) => storage.getMatch(id));
const footballEngine = new FootballEngine();
const basketballEngine = new BasketballEngine();
const tennisEngine = new TennisEngine();
const baseballEngine = new BaseballEngine();
const rugbyEngine = new RugbyEngine();
const fieldHockeyEngine = new FieldHockeyEngine();

// --- REST APIs ---

// 1. Matches API
app.get('/api/matches', (_req: Request, res: Response) => {
  const matches = storage.getMatches();
  res.json({ matches });
});

app.post('/api/matches', (req: Request, res: Response) => {
  const newMatch = storage.createMatch(req.body);
  realtimeHub.broadcastMatchUpdate(newMatch.id, newMatch);
  res.status(201).json({ match: newMatch });
});

app.get('/api/matches/:id', (req: Request, res: Response) => {
  const match = storage.getMatch(req.params.id);
  if (!match) {
    return res.status(404).json({ error: 'Match not found' });
  }
  res.json({ match });
});

app.put('/api/matches/:id', (req: Request, res: Response) => {
  const updated = storage.updateMatch(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Match not found' });
  }
  realtimeHub.broadcastMatchUpdate(updated.id, updated);
  res.json({ match: updated });
});

app.delete('/api/matches/:id', (req: Request, res: Response) => {
  simulator.stopSimulation(req.params.id);
  const success = storage.deleteMatch(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Match not found' });
  }
  res.json({ success: true });
});

// 2. Ball-by-Ball Cricket Events API
app.get('/api/matches/:id/events', (req: Request, res: Response) => {
  const events = storage.getBallEvents(req.params.id);
  res.json({ events });
});

app.post('/api/matches/:id/events', (req: Request, res: Response) => {
  const result = storage.addBallEvent(req.params.id, req.body);
  if (!result) {
    return res.status(400).json({ error: 'Failed to record ball event or invalid match' });
  }
  const inn = result.match.cricketState?.innings[result.match.cricketState.currentInningsIndex];
  if (inn) {
    realtimeHub.broadcastScoreUpdate(
      result.match.id,
      { runs: inn.runs, wickets: inn.wickets, overs: inn.oversFormatted },
      result.match
    );
  }
  realtimeHub.broadcastMatchUpdate(result.match.id, result.match);
  res.status(201).json(result);
});

app.post('/api/matches/:id/undo', (req: Request, res: Response) => {
  const result = storage.undoLastEvent(req.params.id);
  if (!result) {
    return res.status(400).json({ error: 'Nothing to undo' });
  }
  const inn = result.match.cricketState?.innings[result.match.cricketState.currentInningsIndex];
  if (inn) {
    realtimeHub.broadcastScoreUpdate(
      result.match.id,
      { runs: inn.runs, wickets: inn.wickets, overs: inn.oversFormatted },
      result.match
    );
  }
  realtimeHub.broadcastMatchUpdate(result.match.id, result.match);
  res.json(result);
});

app.post('/api/matches/:id/redo', (req: Request, res: Response) => {
  const result = storage.redoEvent(req.params.id);
  if (!result) {
    return res.status(400).json({ error: 'Nothing to redo' });
  }
  const inn = result.match.cricketState?.innings[result.match.cricketState.currentInningsIndex];
  if (inn) {
    realtimeHub.broadcastScoreUpdate(
      result.match.id,
      { runs: inn.runs, wickets: inn.wickets, overs: inn.oversFormatted },
      result.match
    );
  }
  realtimeHub.broadcastMatchUpdate(result.match.id, result.match);
  res.json(result);
});

// 3. Multi-Sport Events APIs (Football, Basketball, Tennis, Badminton, Table Tennis, Volleyball, Field Hockey, Baseball, Rugby)

// Football
app.post('/api/matches/:id/football/event', (req: Request, res: Response) => {
  const match = storage.getMatch(req.params.id);
  if (!match || match.sport !== 'football' || !match.footballState) {
    return res.status(400).json({ error: 'Invalid football match' });
  }

  const nextState = footballEngine.processEvent(match.footballState, {
    id: `fev_${Date.now()}`,
    minute: req.body.minute ?? match.footballState.minute,
    clock: req.body.clock,
    extraTime: req.body.extraTime,
    half: req.body.half,
    isTimerRunning: req.body.isTimerRunning,
    type: req.body.type,
    teamId: req.body.teamId,
    player: req.body.player || 'Player',
    detail: req.body.detail,
    timestamp: Date.now(),
  });

  let activeAlert = match.overlayConfig.activeAlert;
  if (req.body.type === 'goal') {
    activeAlert = {
      id: `alert_goal_${Date.now()}`,
      type: 'goal',
      title: 'GOAL!',
      subtitle: `${req.body.player || 'Goal'} scores for ${
        req.body.teamId === 'home' ? match.teamA.name : match.teamB.name
      }!`,
      player: req.body.player || (req.body.teamId === 'home' ? match.teamA.name : match.teamB.name),
      timestamp: Date.now(),
      durationMs: 5000,
    };
  }

  const updated = storage.updateMatch(match.id, {
    footballState: nextState,
    eventsCount: match.eventsCount + 1,
    overlayConfig: { ...match.overlayConfig, activeAlert },
  });

  if (updated) {
    realtimeHub.broadcastMatchUpdate(updated.id, updated);
  }

  res.json({ match: updated });
});

// Basketball
app.post('/api/matches/:id/basketball/event', (req: Request, res: Response) => {
  const match = storage.getMatch(req.params.id);
  if (!match || match.sport !== 'basketball' || !match.basketballState) {
    return res.status(400).json({ error: 'Invalid basketball match' });
  }

  const nextState = basketballEngine.processEvent(match.basketballState, {
    id: `bb_${Date.now()}`,
    type: req.body.type || 'score',
    teamId: req.body.teamId,
    points: req.body.points,
    player: req.body.player,
    quarter: req.body.quarter,
    clock: req.body.clock,
    shotClock: req.body.shotClock,
    isTimerRunning: req.body.isTimerRunning,
  });

  let activeAlert = match.overlayConfig.activeAlert;
  if (req.body.type === 'score' && req.body.points === 3) {
    const teamName = req.body.teamId === 'home' ? match.teamA.name : match.teamB.name;
    activeAlert = {
      id: `alert_3pt_${Date.now()}`,
      type: 'three_pointer',
      title: 'THREE POINTER!',
      subtitle: `Downtown splash for ${teamName}!`,
      player: req.body.player || teamName,
      timestamp: Date.now(),
      durationMs: 4000,
    };
  }

  const updated = storage.updateMatch(match.id, {
    basketballState: nextState,
    eventsCount: match.eventsCount + 1,
    overlayConfig: { ...match.overlayConfig, activeAlert },
  });

  if (updated) {
    realtimeHub.broadcastMatchUpdate(updated.id, updated);
  }
  res.json({ match: updated });
});

// Tennis
app.post('/api/matches/:id/tennis/point', (req: Request, res: Response) => {
  const match = storage.getMatch(req.params.id);
  if (!match || match.sport !== 'tennis' || !match.tennisState) {
    return res.status(400).json({ error: 'Invalid tennis match' });
  }

  const nextState = tennisEngine.processEvent(match.tennisState, {
    id: `ten_${Date.now()}`,
    winner: req.body.winner || 'home',
    isAce: Boolean(req.body.isAce),
  });

  let activeAlert = match.overlayConfig.activeAlert;
  if (req.body.isAce) {
    const playerName = req.body.winner === 'home' ? match.teamA.name : match.teamB.name;
    activeAlert = {
      id: `alert_ace_${Date.now()}`,
      type: 'ace',
      title: 'SERVICE ACE!',
      subtitle: `Unreturnable serve down the T!`,
      player: playerName,
      timestamp: Date.now(),
      durationMs: 3500,
    };
  }

  const updated = storage.updateMatch(match.id, {
    tennisState: nextState,
    eventsCount: match.eventsCount + 1,
    overlayConfig: { ...match.overlayConfig, activeAlert },
  });
  if (updated) {
    realtimeHub.broadcastMatchUpdate(updated.id, updated);
  }
  res.json({ match: updated });
});

// Badminton
app.post('/api/matches/:id/badminton/point', (req: Request, res: Response) => {
  const match = storage.getMatch(req.params.id);
  if (!match || match.sport !== 'badminton' || !match.badmintonState) {
    return res.status(400).json({ error: 'Invalid badminton match' });
  }

  const bs = JSON.parse(JSON.stringify(match.badmintonState));
  const winner = req.body.winner || 'home';
  if (winner === 'home') {
    bs.homePoints += 1;
    bs.server = 'home';
  } else {
    bs.awayPoints += 1;
    bs.server = 'away';
  }

  if (bs.sets[bs.currentSet]) {
    bs.sets[bs.currentSet].home = bs.homePoints;
    bs.sets[bs.currentSet].away = bs.awayPoints;
  }

  // Check set completion (21 points win by 2, or 30 cap)
  if (
    ((bs.homePoints >= 21 || bs.awayPoints >= 21) &&
      Math.abs(bs.homePoints - bs.awayPoints) >= 2) ||
    bs.homePoints === 30 ||
    bs.awayPoints === 30
  ) {
    if (bs.currentSet < 2) {
      bs.sets.push({ home: 0, away: 0 });
      bs.currentSet += 1;
      bs.homePoints = 0;
      bs.awayPoints = 0;
    }
  }

  bs.isGamePoint =
    (bs.homePoints >= 20 || bs.awayPoints >= 20) &&
    Math.abs(bs.homePoints - bs.awayPoints) >= 1;

  const updated = storage.updateMatch(match.id, {
    badmintonState: bs,
    eventsCount: match.eventsCount + 1,
  });
  if (updated) {
    realtimeHub.broadcastMatchUpdate(updated.id, updated);
  }
  res.json({ match: updated });
});

// Table Tennis
app.post('/api/matches/:id/table-tennis/point', (req: Request, res: Response) => {
  const match = storage.getMatch(req.params.id);
  if (!match || match.sport !== 'table_tennis' || !match.tableTennisState) {
    return res.status(400).json({ error: 'Invalid table tennis match' });
  }

  const tts = JSON.parse(JSON.stringify(match.tableTennisState));
  const winner = req.body.winner || 'home';
  if (winner === 'home') {
    tts.homePoints += 1;
  } else {
    tts.awayPoints += 1;
  }

  if (!tts.sets[tts.currentSet]) {
    tts.sets[tts.currentSet] = { home: 0, away: 0 };
  }
  tts.sets[tts.currentSet].home = tts.homePoints;
  tts.sets[tts.currentSet].away = tts.awayPoints;

  const totalPoints = tts.homePoints + tts.awayPoints;
  if (tts.homePoints >= 10 && tts.awayPoints >= 10) {
    tts.server = tts.server === 'home' ? 'away' : 'home';
  } else if (totalPoints % 2 === 0) {
    tts.server = tts.server === 'home' ? 'away' : 'home';
  }

  if (
    (tts.homePoints >= 11 || tts.awayPoints >= 11) &&
    Math.abs(tts.homePoints - tts.awayPoints) >= 2
  ) {
    tts.sets.push({ home: 0, away: 0 });
    tts.currentSet += 1;
    tts.homePoints = 0;
    tts.awayPoints = 0;
  }

  tts.isGamePoint =
    (tts.homePoints >= 10 || tts.awayPoints >= 10) &&
    Math.abs(tts.homePoints - tts.awayPoints) >= 1;

  const updated = storage.updateMatch(match.id, {
    tableTennisState: tts,
    eventsCount: match.eventsCount + 1,
  });
  if (updated) {
    realtimeHub.broadcastMatchUpdate(updated.id, updated);
  }
  res.json({ match: updated });
});

// Volleyball
app.post('/api/matches/:id/volleyball/point', (req: Request, res: Response) => {
  const match = storage.getMatch(req.params.id);
  if (!match || match.sport !== 'volleyball' || !match.volleyballState) {
    return res.status(400).json({ error: 'Invalid volleyball match' });
  }

  const vs = JSON.parse(JSON.stringify(match.volleyballState));
  if (req.body.type === 'timeout') {
    if (req.body.teamId === 'home') vs.homeTimeouts = Math.min(2, vs.homeTimeouts + 1);
    else vs.awayTimeouts = Math.min(2, vs.awayTimeouts + 1);
  } else {
    const winner = req.body.winner || 'home';
    if (winner === 'home') {
      vs.homeScore += 1;
      vs.server = 'home';
    } else {
      vs.awayScore += 1;
      vs.server = 'away';
    }
  }

  if (!vs.sets[vs.currentSet]) {
    vs.sets[vs.currentSet] = { home: 0, away: 0 };
  }
  vs.sets[vs.currentSet].home = vs.homeScore;
  vs.sets[vs.currentSet].away = vs.awayScore;

  const pointCap = vs.currentSet === 4 ? 15 : 25;
  if (
    (vs.homeScore >= pointCap || vs.awayScore >= pointCap) &&
    Math.abs(vs.homeScore - vs.awayScore) >= 2
  ) {
    if (vs.currentSet < 4) {
      vs.sets.push({ home: 0, away: 0 });
      vs.currentSet += 1;
      vs.homeScore = 0;
      vs.awayScore = 0;
    }
  }

  vs.isSetPoint =
    (vs.homeScore >= pointCap - 1 || vs.awayScore >= pointCap - 1) &&
    Math.abs(vs.homeScore - vs.awayScore) >= 1;

  const updated = storage.updateMatch(match.id, {
    volleyballState: vs,
    eventsCount: match.eventsCount + 1,
  });
  if (updated) {
    realtimeHub.broadcastMatchUpdate(updated.id, updated);
  }
  res.json({ match: updated });
});

// Field Hockey
app.post('/api/matches/:id/field-hockey/event', (req: Request, res: Response) => {
  const match = storage.getMatch(req.params.id);
  if (!match || match.sport !== 'field_hockey' || !match.fieldHockeyState) {
    return res.status(400).json({ error: 'Invalid field hockey match' });
  }

  const nextState = fieldHockeyEngine.processEvent(match.fieldHockeyState, {
    type: req.body.type || 'goal',
    teamId: req.body.teamId || 'home',
    player: req.body.player,
    quarter: req.body.quarter,
    minute: req.body.minute,
  });

  let activeAlert: OverlayAlert | null | undefined = match.overlayConfig.activeAlert;
  if (req.body.type === 'goal') {
    const teamName = req.body.teamId === 'home' ? match.teamA.name : match.teamB.name;
    activeAlert = {
      id: `alert_hk_${Date.now()}`,
      type: 'goal',
      title: 'GOAL!',
      subtitle: `Field Hockey Strike for ${teamName}!`,
      player: req.body.player || teamName,
      timestamp: Date.now(),
      durationMs: 4500,
    };
  }

  const updated = storage.updateMatch(match.id, {
    fieldHockeyState: nextState,
    eventsCount: match.eventsCount + 1,
    overlayConfig: { ...match.overlayConfig, activeAlert },
  });
  if (updated) {
    realtimeHub.broadcastMatchUpdate(updated.id, updated);
  }
  res.json({ match: updated });
});

// Baseball
app.post('/api/matches/:id/baseball/event', (req: Request, res: Response) => {
  const match = storage.getMatch(req.params.id);
  if (!match || match.sport !== 'baseball' || !match.baseballState) {
    return res.status(400).json({ error: 'Invalid baseball match' });
  }

  const nextState = baseballEngine.processEvent(match.baseballState, {
    type: req.body.type,
    teamId: req.body.teamId,
    base: req.body.base,
    player: req.body.player,
  });

  let activeAlert = match.overlayConfig.activeAlert;
  if (req.body.type === 'home_run') {
    activeAlert = {
      id: `alert_hr_${Date.now()}`,
      type: 'home_run',
      title: 'HOME RUN!',
      subtitle: 'Deep into the bleachers! Outta here!',
      player: req.body.player || 'Slugger',
      timestamp: Date.now(),
      durationMs: 4500,
    };
  }

  const updated = storage.updateMatch(match.id, {
    baseballState: nextState,
    eventsCount: match.eventsCount + 1,
    overlayConfig: { ...match.overlayConfig, activeAlert },
  });
  if (updated) {
    realtimeHub.broadcastMatchUpdate(updated.id, updated);
  }
  res.json({ match: updated });
});

// Rugby
app.post('/api/matches/:id/rugby/event', (req: Request, res: Response) => {
  const match = storage.getMatch(req.params.id);
  if (!match || match.sport !== 'rugby' || !match.rugbyState) {
    return res.status(400).json({ error: 'Invalid rugby match' });
  }

  const nextState = rugbyEngine.processEvent(match.rugbyState, {
    type: req.body.type,
    teamId: req.body.teamId || 'home',
    player: req.body.player,
    minute: req.body.minute,
    half: req.body.half,
  });

  let activeAlert = match.overlayConfig.activeAlert;
  if (req.body.type === 'try') {
    const teamName = req.body.teamId === 'home' ? match.teamA.name : match.teamB.name;
    activeAlert = {
      id: `alert_try_${Date.now()}`,
      type: 'try',
      title: 'TRY! +5 PTS',
      subtitle: `Grounded over the line for ${teamName}!`,
      player: req.body.player || teamName,
      timestamp: Date.now(),
      durationMs: 4500,
    };
  }

  const updated = storage.updateMatch(match.id, {
    rugbyState: nextState,
    eventsCount: match.eventsCount + 1,
    overlayConfig: { ...match.overlayConfig, activeAlert },
  });
  if (updated) {
    realtimeHub.broadcastMatchUpdate(updated.id, updated);
  }
  res.json({ match: updated });
});

// 4. Live score summary provider
app.get('/api/matches/:id/live', async (req: Request, res: Response) => {
  const liveScore = await scoringProvider.getLiveScore(req.params.id);
  if (!liveScore) {
    return res.status(404).json({ error: 'Live score unavailable' });
  }
  res.json({ liveScore });
});

// 5. Automated Ball Simulation for Broadcaster Testing
app.post('/api/matches/:id/simulate-next-ball', (req: Request, res: Response) => {
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

app.post('/api/matches/:id/toggle-simulation', (req: Request, res: Response) => {
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

// 6. Overlay Endpoints
app.get('/api/overlays/:token', (req: Request, res: Response) => {
  const data = storage.getOverlayByToken(req.params.token);
  if (!data) {
    return res.status(404).json({ error: 'Overlay not found or token revoked' });
  }
  res.json(data);
});

app.put('/api/overlays/:token/config', (req: Request, res: Response) => {
  const updatedMatch = storage.updateOverlayConfig(req.params.token, req.body);
  if (!updatedMatch) {
    return res.status(404).json({ error: 'Overlay not found' });
  }
  realtimeHub.broadcastOverlayUpdate(req.params.token, {
    match: updatedMatch,
    config: updatedMatch.overlayConfig,
  });
  realtimeHub.broadcastMatchUpdate(updatedMatch.id, updatedMatch);
  res.json({ success: true, config: updatedMatch.overlayConfig });
});

app.post('/api/overlays/:token/trigger-test', (req: Request, res: Response) => {
  const { type, title, subtitle, player } = req.body;
  const alert = {
    id: `alert_test_${Date.now()}`,
    type: type || 'four',
    title: title || 'TEST ALERT',
    subtitle: subtitle || 'Broadcast Graphic Test',
    player: player || 'Striker',
    timestamp: Date.now(),
    durationMs: 4000,
  };

  const updatedMatch = storage.triggerOverlayAlert(req.params.token, alert);
  if (!updatedMatch) {
    return res.status(404).json({ error: 'Overlay not found' });
  }

  realtimeHub.broadcastAlert(req.params.token, alert);
  realtimeHub.broadcastOverlayUpdate(req.params.token, {
    match: updatedMatch,
    config: updatedMatch.overlayConfig,
  });
  res.json({ success: true, alert });
});

app.post('/api/overlays/generate', (req: Request, res: Response) => {
  const { matchId } = req.body;
  const token = storage.generateOverlayToken(matchId);
  if (!token) {
    return res.status(404).json({ error: 'Match not found' });
  }
  const match = storage.getMatch(matchId);
  if (match) {
    realtimeHub.broadcastMatchUpdate(match.id, match);
  }
  res.status(201).json({ token });
});

app.delete('/api/overlays/:token', (req: Request, res: Response) => {
  const success = storage.revokeOverlayToken(req.params.token);
  if (!success) {
    return res.status(404).json({ error: 'Overlay token not found' });
  }
  res.json({ success: true });
});

// --- Server Lifecycle & Vite Middlewares ---
async function startServer() {
  const server = http.createServer(app);
  realtimeHub.initialize(server);

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Sports Overlay server ready on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server boot error:', err);
  process.exit(1);
});
