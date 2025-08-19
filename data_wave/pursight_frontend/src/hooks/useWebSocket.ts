import { useEffect, useRef, useState, useCallback } from 'react';
import { showToast } from '../components/common/Toast';
import { handleApiError } from '../utils/errorHandling';

interface WebSocketMessage {
  data: string;
  type: string;
  timestamp: number;
}

export const useWebSocket = (url: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return;
      }

      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        showToast.success('Connected', 'Real-time updates connected');
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Only show toast on first error, not on every reconnect attempt
        if (isConnected) {
          showToast.error('Disconnected', 'Real-time updates disconnected. Attempting to reconnect...');
        }
        setIsConnected(false);
      };

      wsRef.current.onmessage = (event) => {
        const message: WebSocketMessage = {
          data: event.data,
          type: 'message',
          timestamp: Date.now(),
        };
        setLastMessage(message);
      };
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
      const errorMessage = handleApiError(error);
      showToast.error('Connection Failed', `Failed to connect to real-time updates: ${errorMessage}`);
    }
  }, [url]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback(
    (message: string | object) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        showToast.error('Not Connected', 'Not connected to real-time updates');
        return;
      }

      try {
        const messageString =
          typeof message === 'string' ? message : JSON.stringify(message);
        wsRef.current.send(messageString);
      } catch (error) {
        console.error('Failed to send message:', error);
        const errorMessage = handleApiError(error);
        showToast.error('Send Failed', `Failed to send update: ${errorMessage}`);
      }
    },
    []
  );

  return {
    isConnected,
    lastMessage,
    sendMessage,
  };
};