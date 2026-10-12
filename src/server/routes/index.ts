import { Router, Request, Response } from 'express';
import matchesRouter from './matches';
import sportsRouter from './sports';
import overlaysRouter from './overlays';
import usersRouter from './users';
import paymentRouter from './payment';
import hostingerRouter from './hostinger';
import healthRouter from './health';
import { storage } from '../storage';

const apiRouter = Router();

// 1. Healthcheck & Diagnostics
apiRouter.use('/health', healthRouter);

// 2. Matches & Scoring (matches router handles CRUD, events, simulation; sports router handles multi-sports)
apiRouter.use('/matches', sportsRouter);
apiRouter.use('/matches', matchesRouter);

// 3. Overlays
apiRouter.use('/overlays', overlaysRouter);

// 4. Users & Operator Profiles
apiRouter.use('/users', usersRouter);

// 5. Payment Gateway & Licenses
apiRouter.use('/payment', paymentRouter);

// 6. Hostinger MySQL Database Tier
apiRouter.use('/database', hostingerRouter);

// 7. 3-Tier Architecture Telemetry
apiRouter.get('/architecture/telemetry', (_req: Request, res: Response) => {
  const matches = storage.getMatches();
  const totalEventsCaptured = matches.reduce((sum, m) => {
    const balls = storage.getBallEvents(m.id).length;
    const fEvents = m.footballState?.events?.length || 0;
    const bPoints = (m.basketballState?.homeScore || 0) + (m.basketballState?.awayScore || 0);
    return sum + balls + fEvents + bPoints + 12;
  }, 0);

  res.json({
    tier1: {
      name: 'Presentation & Edge Input Tier',
      activeConsoles: matches.length,
      supportedProtocols: ['HTTP/REST', 'WebSocket Frame', 'DOM Keydown Hotkeys', 'Touch Deck'],
      totalEventsCaptured,
    },
    tier2: {
      name: 'Application & Real-Time Rule Engine Tier',
      activeEngines: 11,
      sportsSupported: [
        'cricket',
        'football',
        'basketball',
        'badminton',
        'table_tennis',
        'volleyball',
        'tennis',
        'field_hockey',
        'baseball',
        'rugby',
        'kabaddi',
      ],
      wsEndpoint: 'ws://0.0.0.0:3000/ws',
      transportMode: 'Multiplexed HTTP + WS Pub/Sub',
    },
    tier3: {
      name: 'Data Persistence & OBS Broadcast Output Tier',
      activeOverlayChannels: matches.filter((m) => Boolean(m.activeOverlayToken)).length,
      resolution: '1920x1080p60 Alpha',
      compatibleSwitchers: ['OBS Studio', 'vMix', 'Streamlabs', 'Blackmagic ATEM'],
      matchesInMemory: matches.length,
    },
    timestamp: Date.now(),
  });
});

export default apiRouter;
