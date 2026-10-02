import { Server as HttpServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { WebSocketMessage } from '../types/sports';
import { storage } from './storage';

interface ClientConnection {
  ws: WebSocket;
  isAlive: boolean;
  subscriptions: Set<string>; // set of channels e.g. 'match:123', 'overlay:token_abc'
}

class RealtimeHub {
  private wss: WebSocketServer | null = null;
  private clients: Map<WebSocket, ClientConnection> = new Map();

  initialize(server: HttpServer) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      const conn: ClientConnection = {
        ws,
        isAlive: true,
        subscriptions: new Set(),
      };
      this.clients.set(ws, conn);

      ws.on('pong', () => {
        conn.isAlive = true;
      });

      ws.on('message', (data: string) => {
        try {
          const msg = JSON.parse(data.toString()) as WebSocketMessage;
          this.handleClientMessage(conn, msg);
        } catch (err) {
          console.error('Error parsing WS message:', err);
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
      });

      ws.on('error', (err) => {
        console.error('WebSocket client error:', err);
        this.clients.delete(ws);
      });
    });

    // Heartbeat every 30s
    const interval = setInterval(() => {
      this.clients.forEach((conn, ws) => {
        if (!conn.isAlive) {
          ws.terminate();
          this.clients.delete(ws);
          return;
        }
        conn.isAlive = false;
        ws.ping();
      });
    }, 30000);

    this.wss.on('close', () => {
      clearInterval(interval);
    });
  }

  private handleClientMessage(conn: ClientConnection, msg: WebSocketMessage) {
    if (msg.type === 'subscribe') {
      if (msg.matchId) {
        const channel = `match:${msg.matchId}`;
        conn.subscriptions.add(channel);
        const match = storage.getMatch(msg.matchId);
        if (match) {
          conn.ws.send(
            JSON.stringify({
              type: 'match:update',
              matchId: match.id,
              payload: match,
              timestamp: Date.now(),
            })
          );
        }
      }

      if (msg.token) {
        const channel = `overlay:${msg.token}`;
        conn.subscriptions.add(channel);
        const overlayData = storage.getOverlayByToken(msg.token);
        if (overlayData) {
          conn.ws.send(
            JSON.stringify({
              type: 'overlay:update',
              token: msg.token,
              payload: overlayData,
              timestamp: Date.now(),
            })
          );
        }
      }

      conn.ws.send(
        JSON.stringify({
          type: 'subscribed',
          matchId: msg.matchId,
          token: msg.token,
          timestamp: Date.now(),
        })
      );
    } else if (msg.type === 'ping') {
      conn.ws.send(
        JSON.stringify({
          type: 'pong',
          timestamp: Date.now(),
        })
      );
    }
  }

  broadcastScoreUpdate(matchId: string, score: { runs: number; wickets: number; overs: string }, fullMatch?: any) {
    const payload = JSON.stringify({
      type: 'score:update',
      matchId,
      score,
      payload: fullMatch,
      timestamp: Date.now(),
    });

    const matchChannel = `match:${matchId}`;
    this.clients.forEach((conn) => {
      // Send to anyone subscribed to this match channel or overlay tokens of this match
      let isSubscribed = conn.subscriptions.has(matchChannel);
      if (!isSubscribed && fullMatch?.overlayTokens) {
        for (const tok of fullMatch.overlayTokens) {
          if (conn.subscriptions.has(`overlay:${tok}`)) {
            isSubscribed = true;
            break;
          }
        }
      }
      if (isSubscribed && conn.ws.readyState === WebSocket.OPEN) {
        conn.ws.send(payload);
      }
    });
  }

  broadcastMatchUpdate(matchId: string, matchData: any) {
    const channel = `match:${matchId}`;
    const payload = JSON.stringify({
      type: 'match:update',
      matchId,
      payload: matchData,
      timestamp: Date.now(),
    });

    this.clients.forEach((conn) => {
      if (conn.subscriptions.has(channel) && conn.ws.readyState === WebSocket.OPEN) {
        conn.ws.send(payload);
      }
    });

    // Also broadcast to any overlay subscriber watching tokens for this match
    if (matchData.overlayTokens) {
      for (const token of matchData.overlayTokens) {
        this.broadcastOverlayUpdate(token, {
          match: matchData,
          config: matchData.overlayConfig,
        });
      }
    }
  }

  broadcastOverlayUpdate(token: string, data: any) {
    const channel = `overlay:${token}`;
    const payload = JSON.stringify({
      type: 'overlay:update',
      token,
      payload: data,
      timestamp: Date.now(),
    });

    this.clients.forEach((conn) => {
      if (conn.subscriptions.has(channel) && conn.ws.readyState === WebSocket.OPEN) {
        conn.ws.send(payload);
      }
    });
  }

  broadcastAlert(tokenOrMatchId: string, alert: any) {
    const payload = JSON.stringify({
      type: 'alert:trigger',
      payload: alert,
      timestamp: Date.now(),
    });

    this.clients.forEach((conn) => {
      if (
        (conn.subscriptions.has(`match:${tokenOrMatchId}`) ||
          conn.subscriptions.has(`overlay:${tokenOrMatchId}`)) &&
        conn.ws.readyState === WebSocket.OPEN
      ) {
        conn.ws.send(payload);
      }
    });
  }
}

export const realtimeHub = new RealtimeHub();
