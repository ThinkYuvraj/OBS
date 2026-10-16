import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './src/server/config/env';
import { securityHeaders } from './src/server/middleware/security';
import { requestLogger } from './src/server/middleware/logger';
import { globalErrorHandler, notFoundHandler } from './src/server/middleware/errorHandler';
import apiRouter from './src/server/routes/index';
import healthRouter from './src/server/routes/health';
import { realtimeHub } from './src/server/websocket';
import { hostingerDb } from './src/server/hostingerDb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Core Production Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(securityHeaders);
app.use(requestLogger);

// 2. High-Availability Healthcheck Root Endpoint
app.use('/health', healthRouter);

// 3. Central Modular REST APIs
app.use('/api', apiRouter);

// 4. Server Lifecycle & Static Asset Serving
async function startServer() {
  const server = http.createServer(app);

  // Initialize Real-Time WebSocket Broadcast Engine
  realtimeHub.initialize(server);

  if (!config.isProd) {
    // Development Environment: Dynamic Vite Middleware Mode
    console.log('[ENV] Starting MarketinGlu broadcast engine in DEVELOPMENT mode with Vite HMR...');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Development SPA Fallback for client-side routing
    app.use('*', async (req: Request, res: Response, next) => {
      if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/health')) {
        return next();
      }
      try {
        const fs = await import('fs/promises');
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = await fs.readFile(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    // Production Environment: High-Speed Static Asset Serving with Caching
    console.log('[ENV] Starting MarketinGlu broadcast engine in PRODUCTION mode...');
    const distPath = path.resolve(__dirname, 'dist');

    // Static assets with immutable caching headers
    app.use(
      '/assets',
      express.static(path.join(distPath, 'assets'), {
        maxAge: '1y',
        immutable: true,
      })
    );

    // Root public static assets
    app.use(
      express.static(distPath, {
        maxAge: '1h',
        index: false,
      })
    );

    // Single Page Application (SPA) Fallback Route for Dashboard and Overlays
    app.get('*', (_req: Request, res: Response) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 5. Global Error Handlers
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  // 6. Bind HTTP & WebSocket Server to Port
  server.listen(config.port, config.host, () => {
    console.log('================================================================');
    console.log(`🚀 MarketinGlu Sub-Second OBS Broadcast Engine Online`);
    console.log(`🌐 Environment:    ${config.env.toUpperCase()}`);
    console.log(`📡 Local Gateway:  http://${config.host}:${config.port}`);
    if (!config.isProd) {
      console.log(`💻 Vite Frontend:  http://localhost:5173 (Port 5173 Proxying to Engine :${config.port})`);
    }
    console.log(`❤️  Health Monitor: http://${config.host}:${config.port}/health`);
    console.log(`⚡ WebSocket Hub:   ws://${config.host}:${config.port}/ws`);
    console.log('================================================================');
  });

  // 7. Production Graceful Shutdown Protocol
  const gracefulShutdown = (signal: string) => {
    console.log(`\n[SHUTDOWN] Received ${signal}. Initiating graceful drainage of active broadcast streams...`);

    // Stop accepting new HTTP connections
    server.close(() => {
      console.log('[SHUTDOWN] HTTP server closed.');

      // Drain database pool if active
      if (hostingerDb && typeof (hostingerDb as any).closePool === 'function') {
        (hostingerDb as any).closePool();
        console.log('[SHUTDOWN] Hostinger MySQL connection pool drained.');
      }

      console.log('[SHUTDOWN] Graceful shutdown completed cleanly. Exiting process.');
      process.exit(0);
    });

    // Forced exit timeout in case connections linger
    setTimeout(() => {
      console.error('[SHUTDOWN] Forceful termination triggered after 10s timeout.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

// Global Unhandled Rejection & Uncaught Exception Safety Net
process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Promise Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception thrown:', err);
  // Log and allow process manager (e.g. Docker / PM2) to handle restart if necessary
});

startServer().catch((err) => {
  console.error('[FATAL] Server boot failure:', err);
  process.exit(1);
});
