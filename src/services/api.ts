import { BallEvent, Match, OverlayConfig, SportType } from '../types/sports';

const API_BASE = '/api';

export async function fetchMatches(): Promise<Match[]> {
  const res = await fetch(`${API_BASE}/matches`);
  if (!res.ok) throw new Error('Failed to fetch matches');
  const data = await res.json();
  return data.matches;
}

export async function fetchMatch(id: string): Promise<Match> {
  const res = await fetch(`${API_BASE}/matches/${id}`);
  if (!res.ok) throw new Error('Match not found');
  const data = await res.json();
  return data.match;
}

export async function createMatch(matchData: Partial<Match>): Promise<Match> {
  const res = await fetch(`${API_BASE}/matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(matchData),
  });
  if (!res.ok) throw new Error('Failed to create match');
  const data = await res.json();
  return data.match;
}

export async function updateMatch(id: string, matchData: Partial<Match>): Promise<Match> {
  const res = await fetch(`${API_BASE}/matches/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(matchData),
  });
  if (!res.ok) throw new Error('Failed to update match');
  const data = await res.json();
  return data.match;
}

export async function deleteMatch(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/matches/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete match');
  return true;
}

export async function postBallEvent(
  matchId: string,
  event: Partial<BallEvent>
): Promise<{ match: Match; event: BallEvent }> {
  const res = await fetch(`${API_BASE}/matches/${matchId}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to submit ball event');
  }
  return res.json();
}

export async function undoBallEvent(
  matchId: string
): Promise<{ match: Match; undoneEvent: BallEvent }> {
  const res = await fetch(`${API_BASE}/matches/${matchId}/undo`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to undo ball event');
  return res.json();
}

export async function redoBallEvent(
  matchId: string
): Promise<{ match: Match; redoneEvent: BallEvent }> {
  const res = await fetch(`${API_BASE}/matches/${matchId}/redo`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to redo ball event');
  return res.json();
}

export async function simulateNextBall(matchId: string): Promise<{ match: Match; event: BallEvent }> {
  const res = await fetch(`${API_BASE}/matches/${matchId}/simulate-next-ball`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to simulate ball');
  return res.json();
}

export async function toggleSimulation(
  matchId: string
): Promise<{ simulating: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/matches/${matchId}/toggle-simulation`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to toggle simulation');
  return res.json();
}

export async function fetchOverlay(
  token: string
): Promise<{ match: Match; config: OverlayConfig }> {
  const res = await fetch(`${API_BASE}/overlays/${token}`);
  if (!res.ok) throw new Error('Overlay not found');
  return res.json();
}

export async function updateOverlayConfig(
  token: string,
  config: Partial<OverlayConfig>
): Promise<{ success: boolean; config: OverlayConfig }> {
  const res = await fetch(`${API_BASE}/overlays/${token}/config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error('Failed to update overlay configuration');
  return res.json();
}

export async function triggerOverlayTest(
  token: string,
  alert: { type: string; title: string; subtitle: string; player?: string }
): Promise<any> {
  const res = await fetch(`${API_BASE}/overlays/${token}/trigger-test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(alert),
  });
  if (!res.ok) throw new Error('Failed to trigger overlay test');
  return res.json();
}

export async function generateNewOverlayToken(matchId: string): Promise<string> {
  const res = await fetch(`${API_BASE}/overlays/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matchId }),
  });
  if (!res.ok) throw new Error('Failed to generate overlay token');
  const data = await res.json();
  return data.token;
}

export async function revokeOverlayToken(token: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/overlays/${token}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to revoke overlay token');
  return true;
}

export async function postFootballEvent(
  matchId: string,
  eventData: { type: string; minute: number; teamId: string; player: string; detail?: string }
): Promise<Match> {
  const res = await fetch(`${API_BASE}/matches/${matchId}/football/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });
  if (!res.ok) throw new Error('Failed to record football event');
  const data = await res.json();
  return data.match;
}
