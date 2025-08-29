'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthProvider';
import toast from 'react-hot-toast';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  subscribe: (event: string, callback: (data: any) => void) => void;
  unsubscribe: (event: string, callback?: (data: any) => void) => void;
  emit: (event: string, data: any) => void;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token, isAuthenticated } = useAuth();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (!isAuthenticated || !token) {
      // Disconnect if not authenticated
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Create socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8000', {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: true,
    });

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('WebSocket connected:', socketInstance.id);
      setIsConnected(true);
      reconnectAttempts.current = 0;
      
      // Join user-specific room
      if (user?.id) {
        socketInstance.emit('join-user-room', user.id);
      }

      toast.success('Real-time connection established', {
        duration: 2000,
      });
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect automatically
        return;
      }
      
      // Show reconnection toast for client-side disconnects
      toast.error('Connection lost. Attempting to reconnect...', {
        duration: 3000,
      });
    });

    socketInstance.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
      
      reconnectAttempts.current++;
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        toast.error('Failed to establish real-time connection', {
          duration: 5000,
        });
      }
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts');
      toast.success('Connection restored', {
        duration: 2000,
      });
    });

    // Global event listeners
    socketInstance.on('system-notification', (data) => {
      toast(data.message, {
        icon: data.type === 'info' ? 'ℹ️' : data.type === 'warning' ? '⚠️' : '🔔',
        duration: data.duration || 4000,
      });
    });

    socketInstance.on('scan-progress', (data) => {
      // Handle scan progress updates
      console.log('Scan progress:', data);
    });

    socketInstance.on('system-health-update', (data) => {
      // Handle system health updates
      console.log('System health update:', data);
    });

    socketInstance.on('user-activity', (data) => {
      // Handle user activity updates
      console.log('User activity:', data);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [isAuthenticated, token, user?.id]);

  const subscribe = (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const unsubscribe = (event: string, callback?: (data: any) => void) => {
    if (socket) {
      if (callback) {
        socket.off(event, callback);
      } else {
        socket.off(event);
      }
    }
  };

  const emit = (event: string, data: any) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    } else {
      console.warn('Cannot emit event: WebSocket not connected');
    }
  };

  const joinRoom = (room: string) => {
    if (socket && isConnected) {
      socket.emit('join-room', room);
    }
  };

  const leaveRoom = (room: string) => {
    if (socket && isConnected) {
      socket.emit('leave-room', room);
    }
  };

  const contextValue: WebSocketContextType = {
    socket,
    isConnected,
    subscribe,
    unsubscribe,
    emit,
    joinRoom,
    leaveRoom,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}