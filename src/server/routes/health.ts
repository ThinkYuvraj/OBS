import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { hostingerDb } from '../hostingerDb';
import { realtimeHub } from '../websocket';
import { config } from '../config/env';

const router = Router();
const serverStartTime = Date.now();

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptimeSeconds: number;
  uptimeFormatted: string;
  timestamp: string;
  environment: string;
  version: string;
  memory: {
    rssMb: number;
    heapUsedMb: number;
    heapTotalMb: number;
  };
  metrics: {
    matchesInMemory: number;
    totalBallEvents: number;
    activeWebSocketClients: number;
    activeLicenses: number;
  };
  storage: {
    type: string;
    hostingerDbConfigured: boolean;
    hostingerHost?: string;
  };
}

const formatUptime = (seconds: number): string => {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d > 0 ? `${d}d ` : ''}${h}h ${m}m ${s}s`;
};

router.get(['/', '/health', '/api/health'], (_req: Request, res: Response) => {
  const uptimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000);
  const mem = process.memoryUsage();
  const matches = storage.getMatches();
  const totalBallEvents = matches.reduce((sum, m) => sum + storage.getBallEvents(m.id).length, 0);

  const healthData: HealthResponse = {
    status: 'healthy',
    uptimeSeconds,
    uptimeFormatted: formatUptime(uptimeSeconds),
    timestamp: new Date().toISOString(),
    environment: config.env,
    version: '2.4.0-production',
    memory: {
      rssMb: Math.round((mem.rss / 1024 / 1024) * 10) / 10,
      heapUsedMb: Math.round((mem.heapUsed / 1024 / 1024) * 10) / 10,
      heapTotalMb: Math.round((mem.heapTotal / 1024 / 1024) * 10) / 10,
    },
    metrics: {
      matchesInMemory: matches.length,
      totalBallEvents,
      activeWebSocketClients: (realtimeHub as any).clients?.size || 0,
      activeLicenses: storage.getLicenses().length,
    },
    storage: {
      type: 'Hybrid (In-Memory Hot Store + Hostinger MySQL Cold Tier)',
      hostingerDbConfigured: Boolean(process.env.HOSTINGER_DB_HOST),
      hostingerHost: process.env.HOSTINGER_DB_HOST || 'srv1234.hstgr.io',
    },
  };

  res.status(200).json(healthData);
});

export default router;
