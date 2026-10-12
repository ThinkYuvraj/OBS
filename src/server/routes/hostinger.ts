import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { hostingerDb } from '../hostingerDb';

const router = Router();

// Hostinger MySQL Status
router.get('/hostinger/status', (_req: Request, res: Response) => {
  const matches = storage.getMatches();
  const totalEvents = matches.reduce((sum, m) => sum + storage.getBallEvents(m.id).length, 0);
  res.json(hostingerDb.getStatus(matches.length, totalEvents));
});

// Hostinger phpMyAdmin SQL DDL Schema Export
router.get('/hostinger/schema', (_req: Request, res: Response) => {
  const matches = storage.getMatches();
  const allEvents = matches.flatMap((m) => storage.getBallEvents(m.id));
  const sql = hostingerDb.getDDLSchema(matches, allEvents);
  res.json({
    sql,
    database: process.env.HOSTINGER_DB_NAME || 'u123456789_broadcast_db',
    tables: ['broadcast_matches', 'broadcast_events_log', 'broadcast_overlay_tokens'],
    recordsCount: matches.length,
  });
});

// Hostinger Live Table Sync
router.post('/hostinger/sync', async (_req: Request, res: Response) => {
  const matches = storage.getMatches();
  const allEvents = matches.flatMap((m) => storage.getBallEvents(m.id));
  const result = await hostingerDb.ensureTablesAndSync(matches, allEvents);
  res.json({
    ...result,
    status: hostingerDb.getStatus(matches.length, allEvents.length),
  });
});

export default router;
