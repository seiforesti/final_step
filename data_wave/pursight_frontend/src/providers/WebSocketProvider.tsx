"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface WebSocketContextType {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  retryConnection: () => void;
  lastError?: string;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
  endpoints?: string[];
  retryInterval?: number;
  maxRetries?: number;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  endpoints = [
    'ws://localhost:8000/v3/ai/realtime',
    'ws://localhost:8000/ws/validation',
    'ws://localhost:8000/orchestration'
  ],
  retryInterval = 5000,
  maxRetries = 3
}) => {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [isConnected, setIsConnected] = useState(false);
  const [lastError, setLastError] = useState<string>();
  const [retryCount, setRetryCount] = useState(0);
  const [connections, setConnections] = useState<Map<string, WebSocket>>(new Map());

  const retryConnection = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setConnectionStatus('connecting');
      initializeConnections();
    }
  };

  const initializeConnections = () => {
    const newConnections = new Map<string, WebSocket>();
    let connectedCount = 0;
    let errorCount = 0;

    // Check if we're in development mode and backend might not be available
    const isDevelopment = (typeof window !== 'undefined' && (window as any).ENV?.NODE_ENV) === 'development' || 
                         (typeof window !== 'undefined' && (
                           window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1'
                         ));

    if (isDevelopment) {
      console.log('Development environment detected, checking backend availability...');
      // In development, we'll be more lenient with WebSocket connections
      // and won't treat failures as critical errors
    }

    endpoints.forEach(endpoint => {
      try {
        const ws = new WebSocket(endpoint);
        
        // Set connection timeout
        const connectionTimeout = setTimeout(() => {
          if (ws.readyState === WebSocket.CONNECTING) {
            console.warn(`WebSocket connection timeout for ${endpoint}`);
            ws.close();
            errorCount++;
            if (errorCount === endpoints.length) {
              setConnectionStatus('error');
              setIsConnected(false);
            }
          }
        }, 10000); // 10 second timeout
        
        ws.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log(`WebSocket connected to ${endpoint}`);
          connectedCount++;
          newConnections.set(endpoint, ws);
          
          if (connectedCount > 0) {
            setIsConnected(true);
            setConnectionStatus('connected');
            setLastError(undefined);
          }
        };

        ws.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.warn(`WebSocket error for ${endpoint} (handled gracefully):`, error);
          errorCount++;
          setLastError(`Failed to connect to ${endpoint}`);
          
          if (errorCount === endpoints.length) {
            setConnectionStatus('error');
            setIsConnected(false);
          }
        };

        ws.onclose = () => {
          clearTimeout(connectionTimeout);
          console.log(`WebSocket disconnected from ${endpoint}`);
          newConnections.delete(endpoint);
          
          if (newConnections.size === 0) {
            setIsConnected(false);
            setConnectionStatus('disconnected');
          }
        };

      } catch (error) {
        console.warn(`Failed to create WebSocket for ${endpoint} (handled gracefully):`, error);
        errorCount++;
        setLastError(`Failed to create connection to ${endpoint}`);
      }
    });

    setConnections(newConnections);
  };

  useEffect(() => {
    // Only attempt connections in browser environment
    if (typeof window !== 'undefined') {
      initializeConnections();
    }

    return () => {
      // Cleanup connections on unmount
      connections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      });
    };
  }, []);

  // Auto-retry on connection failure
  useEffect(() => {
    if (connectionStatus === 'error' && retryCount < maxRetries) {
      const timer = setTimeout(() => {
        retryConnection();
      }, retryInterval);

      return () => clearTimeout(timer);
    } else if (retryCount >= maxRetries) {
      // After max retries, wait longer before allowing manual retry
      const timer = setTimeout(() => {
        setRetryCount(0);
        setConnectionStatus('disconnected');
      }, 30000); // Wait 30 seconds before resetting

      return () => clearTimeout(timer);
    }
  }, [connectionStatus, retryCount, retryInterval, maxRetries]);

  const contextValue: WebSocketContextType = {
    isConnected,
    connectionStatus,
    retryConnection,
    lastError
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};
