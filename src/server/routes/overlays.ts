import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { realtimeHub } from '../websocket';

const router = Router();

router.get('/:token', (req: Request, res: Response) => {
  const data = storage.getOverlayByToken(req.params.token);
  if (!data) {
    return res.status(404).json({ error: 'Overlay not found or token revoked' });
  }
  res.json(data);
});

router.put('/:token/config', (req: Request, res: Response) => {
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

router.post('/:token/trigger-test', (req: Request, res: Response) => {
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

router.post('/generate', (req: Request, res: Response) => {
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

router.delete('/:token', (req: Request, res: Response) => {
  const success = storage.revokeOverlayToken(req.params.token);
  if (!success) {
    return res.status(404).json({ error: 'Overlay token not found' });
  }
  res.json({ success: true });
});

export default router;
