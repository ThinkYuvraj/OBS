import { Request, Response, NextFunction } from 'express';

/**
 * High-performance Structured Production Logger
 * Logs incoming HTTP transactions with timestamp, method, path, response status, and latency.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  // Skip spammy asset polls or healthcheck pings in development if desired
  if (req.path.startsWith('/assets/') || req.path === '/favicon.ico') {
    return next();
  }

  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const timestamp = new Date().toISOString();
    const status = res.statusCode;
    const method = req.method;
    const url = req.originalUrl || req.url;

    // Fast status color classification
    const level = status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'INFO';
    console.log(`[${timestamp}] [${level}] ${method} ${url} ${status} (${duration}ms)`);
  });

  next();
}
