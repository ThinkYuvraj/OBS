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
  const [lastPing, setLastPing] = useState<number>(Date.now());
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep callback refs fresh
  const onMatchUpdateRef = useRef(onMatchUpdate);
  onMatchUpdateRef.current = onMatchUpdate;
  const onOverlayUpdateRef = useRef(onOverlayUpdate);
  onOverlayUpdateRef.current = onOverlayUpdate;
  const onAlertTriggerRef = useRef(onAlertTrigger);
  onAlertTriggerRef.current = onAlertTrigger;

  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        // Subscribe to relevant rooms
        ws.send(
          JSON.stringify({
            type: 'subscribe',
            matchId,
            token,
            timestamp: Date.now(),
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as WebSocketMessage;
          if ((msg.type === 'match:update' || msg.type === 'score:update') && msg.payload) {
            onMatchUpdateRef.current?.(msg.payload);
          } else if (msg.type === 'overlay:update' && msg.payload) {
            onOverlayUpdateRef.current?.(msg.payload);
          } else if (msg.type === 'alert:trigger' && msg.payload) {
            onAlertTriggerRef.current?.(msg.payload);
          } else if (msg.type === 'pong') {
            setLastPing(Date.now());
          }
        } catch (err) {
          console.error('Error handling socket message:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;
        // Auto-reconnect after 2 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 2000);
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        ws.close();
      };
    } catch (err) {
      console.error('WebSocket connection failed:', err);
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    }
  }, [matchId, token]);

  useEffect(() => {
    connect();

    // Heartbeat ping every 25s
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

  return { isConnected, lastPing };
}
