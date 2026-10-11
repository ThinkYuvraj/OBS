import { useEffect, useRef, useState, useCallback } from 'react';
import { Match, OverlayConfig, WebSocketMessage } from '../types/sports';

interface UseRealtimeSocketProps {
  matchId?: string;
  token?: string;
  onMatchUpdate?: (match: Match) => void;
  onOverlayUpdate?: (data: { match: Match; config: OverlayConfig }) => void;
  onAlertTrigger?: (alert: any) => void;
}

export function useRealtimeSocket({
  matchId,
  token,
  onMatchUpdate,
  onOverlayUpdate,
  onAlertTrigger,
}: UseRealtimeSocketProps) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDigestRef = useRef<string>('');

  // Keep latest subscription targets in refs so socket doesn't tear down on switch
  const matchIdRef = useRef(matchId);
  matchIdRef.current = matchId;
  const tokenRef = useRef(token);
  tokenRef.current = token;

  // Keep callback refs fresh without re-binding WebSocket listeners
  const onMatchUpdateRef = useRef(onMatchUpdate);
  onMatchUpdateRef.current = onMatchUpdate;
  const onOverlayUpdateRef = useRef(onOverlayUpdate);
  onOverlayUpdateRef.current = onOverlayUpdate;
  const onAlertTriggerRef = useRef(onAlertTrigger);
  onAlertTriggerRef.current = onAlertTrigger;

  const sendSubscription = useCallback((ws: WebSocket, mId?: string, tok?: string) => {
    if (ws.readyState === WebSocket.OPEN && (mId || tok)) {
      ws.send(
        JSON.stringify({
          type: 'subscribe',
          matchId: mId,
          token: tok,
          timestamp: Date.now(),
        })
      );
    }
  }, []);

  const connect = useCallback(() => {
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        sendSubscription(ws, matchIdRef.current, tokenRef.current);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as WebSocketMessage;
          if ((msg.type === 'match:update' || msg.type === 'score:update') && msg.payload) {
            const incoming = msg.payload as Match;
            const digest = `${incoming.id}:${incoming.lastUpdated}:${incoming.eventsCount}:${incoming.overlayConfig?.activeAlert?.id || ''}`;
            if (digest !== lastDigestRef.current) {
              lastDigestRef.current = digest;
              onMatchUpdateRef.current?.(incoming);
            }
          } else if (msg.type === 'overlay:update' && msg.payload) {
            const incomingMatch = msg.payload.match as Match;
            const digest = `ov:${incomingMatch?.id}:${incomingMatch?.lastUpdated}:${msg.payload.config?.scale}:${msg.payload.config?.opacity}:${msg.payload.config?.tickerText}:${msg.payload.config?.activeAlert?.id || ''}:${msg.payload.config?.streamFeed?.activeSource || ''}:${msg.payload.config?.streamFeed?.youtubeUrl || ''}`;
            if (digest !== lastDigestRef.current) {
              lastDigestRef.current = digest;
              onOverlayUpdateRef.current?.(msg.payload);
            }
          } else if (msg.type === 'alert:trigger' && msg.payload) {
            onAlertTriggerRef.current?.(msg.payload);
          }
        } catch (err) {
          console.error('Error handling socket message:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 2000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    }
  }, [sendSubscription]);

  // Establish persistent connection once per mount
  useEffect(() => {
    connect();

    const pingInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, 25000);

    return () => {
      clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Dynamically re-subscribe when matchId or token changes without closing socket
  useEffect(() => {
    lastDigestRef.current = '';
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      sendSubscription(wsRef.current, matchId, token);
    }
  }, [matchId, token, sendSubscription]);

  return { isConnected };
}
