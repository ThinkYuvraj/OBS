import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

/**
 * Production Security & OBS Compatibility Middleware
 * Ensures:
 * 1. OBS Studio, vMix, Wirecast, and external production switchers can embed overlays in iframes.
 * 2. Cross-Origin Resource Sharing (CORS) is handled cleanly for broadcast decks.
 * 3. Secure transport headers are enabled without breaking live WebSocket streaming.
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', config.corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // OBS Studio Compatibility: Allow embedding across any broadcast canvas or iframe
  // Overriding default frame denial to ensure transparent overlays render in switchers
  res.setHeader('Content-Security-Policy', "frame-ancestors * 'self';");
  res.removeHeader('X-Frame-Options');

  // MIME type sniffing protection
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Cache policy: dynamic API and overlay routes shouldn't be stale-cached
  if (req.path.startsWith('/api') || req.path.startsWith('/overlay')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
}
