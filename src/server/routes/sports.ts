import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { realtimeHub } from '../websocket';
import { OverlayAlert } from '../../types/sports';
import {
  BadmintonEngine,
  BaseballEngine,
  BasketballEngine,
  FieldHockeyEngine,
  FootballEngine,
  RugbyEngine,
  TableTennisEngine,
  TennisEngine,
  VolleyballEngine,
  KabaddiEngine,
} from '../../engine/sportsEngine';

const router = Router();

const footballEngine = new FootballEngine();
const basketballEngine = new BasketballEngine();
const tennisEngine = new TennisEngine();
const badmintonEngine = new BadmintonEngine();
const tableTennisEngine = new TableTennisEngine();
const volleyballEngine = new VolleyballEngine();
const baseballEngine = new BaseballEngine();
const rugbyEngine = new RugbyEngine();
const fieldHockeyEngine = new FieldHockeyEngine();
const kabaddiEngine = new KabaddiEngine();

// 1. Football
router.post('/:id/football/event', (req: Request, res: Response) => {
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

// 2. Basketball
router.post('/:id/basketball/event', (req: Request, res: Response) => {
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

// 3. Tennis
router.post('/:id/tennis/point', (req: Request, res: Response) => {
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

// 4. Badminton
router.post('/:id/badminton/point', (req: Request, res: Response) => {
  const match = storage.getMatch(req.params.id);
  if (!match || match.sport !== 'badminton' || !match.badmintonState) {
    return res.status(400).json({ error: 'Invalid badminton match' });
  }

  const nextState = badmintonEngine.processEvent(match.badmintonState, {
    type: req.body.type || 'point',
    winner: req.body.winner || 'home',
    delta: typeof req.body.delta === 'number' ? req.body.delta : 1,
  });

  const updated = storage.updateMatch(match.id, {
    badmintonState: nextState,
    eventsCount: match.eventsCount + 1,
  });
  if (updated) {
    realtimeHub.broadcastMatchUpdate(updated.id, updated);
  }
  res.json({ match: updated });
});

// 5. Table Tennis
router.post('/:id/table-tennis/point', (req: Request, res: Response) => {
  const match = storage.getMatch(req.params.id);
  if (!match || match.sport !== 'table_tennis' || !match.tableTennisState) {
    return res.status(400).json({ error: 'Invalid table tennis match' });
  }

  const nextState = tableTennisEngine.processEvent(match.tableTennisState, {
    type: req.body.type || 'point',
    winner: req.body.winner || 'home',
    delta: typeof req.body.delta === 'number' ? req.body.delta : 1,
  });

  const updated = storage.updateMatch(match.id, {
    tableTennisState: nextState,
    eventsCount: match.eventsCount + 1,
  });
  if (updated) {
    realtimeHub.broadcastMatchUpdate(updated.id, updated);
  }
  res.json({ match: updated });
});

// 6. Volleyball
router.post('/:id/volleyball/point', (req: Request, res: Response) => {
  const match = storage.getMatch(req.params.id);
  if (!match || match.sport !== 'volleyball' || !match.volleyballState) {
    return res.status(400).json({ error: 'Invalid volleyball match' });
  }

  const nextState = volleyballEngine.processEvent(match.volleyballState, {
    type: req.body.type || 'point',
    winner: req.body.winner || 'home',
    teamId: req.body.teamId,
    delta: typeof req.body.delta === 'number' ? req.body.delta : 1,
  });

  const updated = storage.updateMatch(match.id, {
    volleyballState: nextState,
    eventsCount: match.eventsCount + 1,
  });
  if (updated) {
    realtimeHub.broadcastMatchUpdate(updated.id, updated);
  }
  res.json({ match: updated });
});

// 7. Field Hockey
router.post('/:id/field-hockey/event', (req: Request, res: Response) => {
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

// 8. Baseball
router.post('/:id/baseball/event', (req: Request, res: Response) => {
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

// 9. Rugby
router.post('/:id/rugby/event', (req: Request, res: Response) => {
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

// 10. Pro Kabaddi
router.post('/:id/kabaddi/event', (req: Request, res: Response) => {
  const match = storage.getMatch(req.params.id);
  if (!match || match.sport !== 'kabaddi' || !match.kabaddiState) {
    return res.status(400).json({ error: 'Invalid kabaddi match' });
  }

  const nextState = kabaddiEngine.processEvent(match.kabaddiState, req.body);

  let activeAlert = match.overlayConfig.activeAlert;
  if (req.body.type === 'super_raid') {
    activeAlert = {
      id: `alert_sr_${Date.now()}`,
      type: 'super_raid',
      title: 'SUPER RAID! 🔥',
      subtitle: `${req.body.touchCount || 3}+ Points by ${req.body.player || 'Raider'}!`,
      player: req.body.player || 'Raider',
      timestamp: Date.now(),
      durationMs: 4500,
    };
  } else if (req.body.type === 'super_tackle') {
    activeAlert = {
      id: `alert_st_${Date.now()}`,
      type: 'super_tackle',
      title: 'SUPER TACKLE! 🛡️',
      subtitle: `2 Defense Points! Defender brilliance!`,
      player: req.body.player || 'Defense',
      timestamp: Date.now(),
      durationMs: 4000,
    };
  } else if (req.body.type === 'all_out') {
    activeAlert = {
      id: `alert_ao_${Date.now()}`,
      type: 'all_out',
      title: 'ALL OUT! 💥',
      subtitle: `2 Bonus Points awarded & Court Revived!`,
      player: 'All Out',
      timestamp: Date.now(),
      durationMs: 5000,
    };
  }

  const updated = storage.updateMatch(match.id, {
    kabaddiState: nextState,
    eventsCount: match.eventsCount + 1,
    overlayConfig: { ...match.overlayConfig, activeAlert },
  });
  if (updated) {
    realtimeHub.broadcastMatchUpdate(updated.id, updated);
  }
  res.json({ match: updated });
});

export default router;
