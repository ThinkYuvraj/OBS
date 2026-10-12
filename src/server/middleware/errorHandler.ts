import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

/**
 * 404 Route Not Found Handler
 */
export function notFoundHandler(req: Request, res: Response) {
  // If it's an API route, return JSON
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      error: 'Not Found',
      message: `API route ${req.method} ${req.path} does not exist`,
      timestamp: Date.now(),
    });
  }

  // SPA fallback is handled by static router in production or Vite in development
  res.status(404).send('Resource Not Found');
}

/**
 * Production Global Error Handler
 * Sanitizes stack traces in production to prevent leaking sensitive system paths or credentials.
 */
export function globalErrorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const status = err.status || err.statusCode || 500;
  const isProd = config.isProd;

  console.error(`[FATAL ERROR] ${req.method} ${req.path}:`, err);

  res.status(status).json({
    error: err.name || 'InternalServerError',
    message: isProd && status === 500 ? 'An unexpected server error occurred' : err.message || 'Internal Server Error',
    ...(isProd ? {} : { stack: err.stack }),
    timestamp: Date.now(),
  });
}
