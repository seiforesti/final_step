"use client";
import { useEffect, useRef, useState, useCallback } from 'react';

type WebSocketStatus = 'connecting' | 'open' | 'closing' | 'closed' | 'error';

export function useWebSocket(url: string, protocols?: string | string[]) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<WebSocketStatus>('connecting');
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [error, setError] = useState<Event | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url, protocols);
    wsRef.current = ws;
    setStatus('connecting');

    ws.onopen = () => setStatus('open');
    ws.onmessage = (evt) => setLastMessage(evt);
    ws.onerror = (evt) => { setStatus('error'); setError(evt); };
    ws.onclose = () => setStatus('closed');

    return () => {
      if (ws.readyState === WebSocket.OPEN) ws.close();
      wsRef.current = null;
    };
  }, [url, Array.isArray(protocols) ? protocols.join(',') : protocols]);

  const send = useCallback((data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
      return true;
    }
    return false;
  }, []);

  return { status, lastMessage, send, error };
}

export default useWebSocket;

