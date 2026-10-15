import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { hostingerDb } from '../hostingerDb';

const router = Router();

// Hostinger MySQL Status
router.get('/hostinger/status', (_req: Request, res: Response) => {
  const matches = storage.getMatches();
  const totalEvents = matches.reduce((sum, m) => sum + storage.getBallEvents(m.id).length, 0);
  const totalUsers = storage.getUsers().length;
  res.json(hostingerDb.getStatus(matches.length, totalEvents, totalUsers));
});

// Hostinger phpMyAdmin SQL DDL Schema Export (with users table)
router.get('/hostinger/schema', (_req: Request, res: Response) => {
  const matches = storage.getMatches();
  const allEvents = matches.flatMap((m) => storage.getBallEvents(m.id));
  const allUsers = storage.getUsers();
  const sql = hostingerDb.getDDLSchema(matches, allEvents, allUsers);
  res.json({
    sql,
    database: hostingerDb.getStatus(matches.length, allEvents.length, allUsers.length).database,
    tables: ['broadcast_users', 'broadcast_matches', 'broadcast_events_log', 'broadcast_overlay_tokens'],
    recordsCount: matches.length + allUsers.length,
    usersCount: allUsers.length,
    matchesCount: matches.length,
  });
});

// Hostinger Live Table Sync
router.post('/hostinger/sync', async (_req: Request, res: Response) => {
  const matches = storage.getMatches();
  const allEvents = matches.flatMap((m) => storage.getBallEvents(m.id));
  const allUsers = storage.getUsers();
  const result = await hostingerDb.ensureTablesAndSync(matches, allEvents, allUsers);
  res.json({
    ...result,
    status: hostingerDb.getStatus(matches.length, allEvents.length, allUsers.length),
  });
});

export default router;
