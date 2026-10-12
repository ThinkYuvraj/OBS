import {
  BallEvent,
  BroadcastLicense,
  Match,
  OverlayConfig,
  PassPlan,
  UserProfile,
} from '../types/sports';

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

export async function postTennisEvent(
  matchId: string,
  eventData: { winner: 'home' | 'away'; isAce?: boolean }
): Promise<Match> {
  const res = await fetch(`${API_BASE}/matches/${matchId}/tennis/point`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });
  if (!res.ok) throw new Error('Failed to record tennis point');
  const data = await res.json();
  return data.match;
}

export async function postBadmintonEvent(
  matchId: string,
  eventData: {
    type?: 'point' | 'swap_server' | 'reset_set';
    winner?: 'home' | 'away';
    delta?: number;
  }
): Promise<Match> {
  const res = await fetch(`${API_BASE}/matches/${matchId}/badminton/point`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });
  if (!res.ok) throw new Error('Failed to record badminton event');
  const data = await res.json();
  return data.match;
}

export async function postTableTennisEvent(
  matchId: string,
  eventData: {
    type?: 'point' | 'swap_server' | 'reset_set';
    winner?: 'home' | 'away';
    delta?: number;
  }
): Promise<Match> {
  const res = await fetch(`${API_BASE}/matches/${matchId}/table-tennis/point`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });
  if (!res.ok) throw new Error('Failed to record table tennis event');
  const data = await res.json();
  return data.match;
}

export async function postVolleyballEvent(
  matchId: string,
  eventData: {
    type?: 'point' | 'timeout' | 'swap_server' | 'reset_set';
    winner?: 'home' | 'away';
    teamId?: 'home' | 'away';
    delta?: number;
  }
): Promise<Match> {
  const res = await fetch(`${API_BASE}/matches/${matchId}/volleyball/point`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });
  if (!res.ok) throw new Error('Failed to record volleyball event');
  const data = await res.json();
  return data.match;
}

export async function postFootballEvent(
  matchId: string,
  eventData: {
    type: string;
    minute?: number;
    clock?: string;
    extraTime?: number;
    half?: string;
    isTimerRunning?: boolean;
    teamId: string;
    player?: string;
    detail?: string;
  }
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

export async function postBasketballEvent(
  matchId: string,
  eventData: {
    type: string;
    teamId?: 'home' | 'away';
    points?: number;
    player?: string;
    quarter?: 1 | 2 | 3 | 4 | 'OT';
    clock?: string;
    shotClock?: number;
    isTimerRunning?: boolean;
  }
): Promise<Match> {
  const res = await fetch(`${API_BASE}/matches/${matchId}/basketball/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });
  if (!res.ok) throw new Error('Failed to record basketball event');
  const data = await res.json();
  return data.match;
}

export async function postFieldHockeyEvent(
  matchId: string,
  eventData: {
    type: string;
    teamId: 'home' | 'away';
    player?: string;
    quarter?: 1 | 2 | 3 | 4 | 'SO';
    minute?: number;
  }
): Promise<Match> {
  const res = await fetch(`${API_BASE}/matches/${matchId}/field-hockey/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });
  if (!res.ok) throw new Error('Failed to record field hockey event');
  const data = await res.json();
  return data.match;
}

export async function postBaseballEvent(
  matchId: string,
  eventData: {
    type: string;
    teamId?: 'home' | 'away';
    base?: 'first' | 'second' | 'third';
    player?: string;
  }
): Promise<Match> {
  const res = await fetch(`${API_BASE}/matches/${matchId}/baseball/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });
  if (!res.ok) throw new Error('Failed to record baseball event');
  const data = await res.json();
  return data.match;
}

export async function postRugbyEvent(
  matchId: string,
  eventData: {
    type: string;
    teamId: 'home' | 'away';
    player?: string;
    minute?: number;
    half?: string;
  }
): Promise<Match> {
  const res = await fetch(`${API_BASE}/matches/${matchId}/rugby/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });
  if (!res.ok) throw new Error('Failed to record rugby event');
  const data = await res.json();
  return data.match;
}

export interface HostingerDatabaseStatus {
  configured: boolean;
  connected: boolean;
  host: string;
  port: number;
  database: string;
  user: string;
  lastSyncAt: number | null;
  syncedMatchesCount: number;
  syncedEventsCount: number;
  mode: 'hostinger_mysql_live' | 'hybrid_memory_staging';
  errorMessage?: string;
}

export async function fetchHostingerDbStatus(): Promise<HostingerDatabaseStatus> {
  const res = await fetch(`${API_BASE}/database/hostinger/status`);
  if (!res.ok) throw new Error('Failed to fetch Hostinger DB status');
  return res.json();
}

export async function syncHostingerDatabase(): Promise<{
  success: boolean;
  mode: string;
  syncedMatches: number;
  syncedEvents: number;
  message: string;
  status: HostingerDatabaseStatus;
}> {
  const res = await fetch(`${API_BASE}/database/hostinger/sync`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to sync with Hostinger MySQL');
  return res.json();
}

export async function fetchHostingerSqlExport(): Promise<{
  sql: string;
  database: string;
  tables: string[];
  recordsCount: number;
}> {
  const res = await fetch(`${API_BASE}/database/hostinger/schema`);
  if (!res.ok) throw new Error('Failed to generate Hostinger SQL dump');
  return res.json();
}

// Kabaddi
export async function postKabaddiEvent(
  matchId: string,
  event: any
): Promise<{ match: Match }> {
  const res = await fetch(`${API_BASE}/matches/${matchId}/kabaddi/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  if (!res.ok) throw new Error('Failed to record kabaddi event');
  return res.json();
}

// Operator & Setup Profiles
export async function fetchUsers(): Promise<{ users: UserProfile[]; activeUser: UserProfile }> {
  const res = await fetch(`${API_BASE}/users`);
  if (!res.ok) throw new Error('Failed to fetch operator users');
  return res.json();
}

export async function fetchActiveUser(): Promise<{ activeUser: UserProfile }> {
  const res = await fetch(`${API_BASE}/users/active`);
  if (!res.ok) throw new Error('Failed to fetch active operator');
  return res.json();
}

export async function switchActiveUser(userId: string): Promise<{ activeUser: UserProfile }> {
  const res = await fetch(`${API_BASE}/users/active`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Failed to switch operator profile');
  return res.json();
}

export async function createOperatorUser(user: Partial<UserProfile>): Promise<{ user: UserProfile }> {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error('Failed to create operator user');
  return res.json();
}

// Payment Gateway & License Passes (Razorpay)
export async function fetchLicenseStatus(): Promise<{
  isActive: boolean;
  validUntil: number;
  plan: PassPlan | 'none';
  remainingHours: number;
  remainingMinutes: number;
  license?: BroadcastLicense;
}> {
  const res = await fetch(`${API_BASE}/payment/status`);
  if (!res.ok) throw new Error('Failed to fetch license status');
  return res.json();
}

export async function fetchLicenses(): Promise<{ licenses: BroadcastLicense[] }> {
  const res = await fetch(`${API_BASE}/payment/licenses`);
  if (!res.ok) throw new Error('Failed to fetch broadcast licenses');
  return res.json();
}

export async function createPaymentOrder(
  plan: PassPlan,
  customerInfo?: { name?: string; email?: string }
): Promise<{
  orderId: string;
  amount: number;
  amountINR: number;
  currency: 'INR';
  keyId: string;
  plan: PassPlan;
  customerName: string;
  customerEmail: string;
}> {
  const res = await fetch(`${API_BASE}/payment/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, customerName: customerInfo?.name, customerEmail: customerInfo?.email }),
  });
  if (!res.ok) throw new Error('Failed to create payment order');
  return res.json();
}

export async function verifyPayment(paymentDetails: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature?: string;
  plan: PassPlan;
  customerName?: string;
  customerEmail?: string;
}): Promise<{ success: boolean; license: BroadcastLicense; status: any }> {
  const res = await fetch(`${API_BASE}/payment/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentDetails),
  });
  if (!res.ok) throw new Error('Failed to verify payment');
  return res.json();
}


