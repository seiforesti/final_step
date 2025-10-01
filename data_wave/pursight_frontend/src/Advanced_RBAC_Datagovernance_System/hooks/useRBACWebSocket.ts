// useRBACWebSocket Hook - Real-time RBAC events and notifications via WebSocket
// Maps to backend websocket service with comprehensive event handling

import { useState, useEffect, useCallback, useRef } from 'react';
import { rbacWebSocketService } from '../services/websocket.service';
import type { RBACEvent, WebSocketConnectionStatus } from '../types/websocket.types';
import { useAuth } from './useAuth';

export interface RBACWebSocketState {
  isConnected: boolean;
  connectionStatus: WebSocketConnectionStatus;
  lastEvent: RBACEvent | null;
  eventHistory: RBACEvent[];
  error: string | null;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  subscriptions: string[];
}

export interface RBACWebSocketMethods {
  // Connection Management
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  
  // Event Subscriptions
  subscribeToPermissionChanges: (filters?: any) => string;
  subscribeToRoleAssignments: (filters?: any) => string;
  subscribeToAccessRequests: (filters?: any) => string;
  subscribeToAuditAlerts: (filters?: any) => string;
  subscribeToUserActivity: (filters?: any) => string;
  subscribeToSystemNotifications: (filters?: any) => string;
  
  // Subscription Management
  unsubscribe: (subscriptionId: string) => void;
  unsubscribeAll: () => void;
  updateSubscriptionFilters: (subscriptionId: string, filters: any) => void;
  
  // Event Handlers
  onPermissionChanged: (handler: (event: any) => void, filters?: any) => string;
  onRoleAssigned: (handler: (event: any) => void, filters?: any) => string;
  onAccessRequest: (handler: (event: any) => void, filters?: any) => string;
  onAuditAlert: (handler: (event: any) => void, filters?: any) => string;
  onUserActivity: (handler: (event: any) => void, filters?: any) => string;
  onSystemNotification: (handler: (event: any) => void, filters?: any) => string;
  
  // Custom Events
  sendCustomMessage: (message: any) => void;
  requestCurrentPermissions: () => void;
  requestSystemStatus: () => void;
  
  // Utility
  clearEventHistory: () => void;
  getSubscriptionStats: () => any;
}

export interface UseRBACWebSocketReturn extends RBACWebSocketState, RBACWebSocketMethods {}

const MAX_EVENT_HISTORY = 100;
const DEFAULT_MAX_RECONNECT_ATTEMPTS = 5;

export function useRBACWebSocket(autoConnect = true, maxReconnectAttempts = DEFAULT_MAX_RECONNECT_ATTEMPTS): UseRBACWebSocketReturn {
  const { sessionToken } = useAuth();
  const [state, setState] = useState<RBACWebSocketState>({
    isConnected: false,
    connectionStatus: 'disconnected',
    lastEvent: null,
    eventHistory: [],
    error: null,
    reconnectAttempts: 0,
    maxReconnectAttempts,
    subscriptions: []
  });

  const eventHandlersRef = useRef<Map<string, (event: any) => void>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect]);

  // Set up WebSocket event listeners
  useEffect(() => {
    if (rbacWebSocketService.isConnected()) {
      // Connection events
      rbacWebSocketService.onConnect(() => {
        setState(prev => ({
          ...prev,
          isConnected: true,
          connectionStatus: 'connected',
          error: null,
          reconnectAttempts: 0
        }));
      });

      rbacWebSocketService.onDisconnect(() => {
        setState(prev => ({
          ...prev,
          isConnected: false,
          connectionStatus: 'disconnected'
        }));
        
        // Attempt reconnection
        if (state.reconnectAttempts < state.maxReconnectAttempts) {
          const timeout = Math.pow(2, state.reconnectAttempts) * 1000; // Exponential backoff
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnect();
          }, timeout);
        }
      });

      rbacWebSocketService.onError((error) => {
        setState(prev => ({
          ...prev,
          error: error.message || 'WebSocket connection error',
          connectionStatus: 'error'
        }));
      });

      // Set up general event handler
      const handleRBACEvent = (event: RBACEvent) => {
        setState(prev => {
          const newEventHistory = [event, ...prev.eventHistory].slice(0, MAX_EVENT_HISTORY);
          return {
            ...prev,
            lastEvent: event,
            eventHistory: newEventHistory
          };
        });

        // Call registered event handlers
        eventHandlersRef.current.forEach((handler, subscriptionId) => {
          try {
            handler(event);
          } catch (error) {
            console.error(`Error in event handler ${subscriptionId}:`, error);
          }
        });
      };

      // Subscribe to all RBAC events
      rbacWebSocketService.subscribe('rbac_event', handleRBACEvent);
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [state.reconnectAttempts, state.maxReconnectAttempts]);

  // === Connection Management ===

  const connect = useCallback(() => {
    try {
      setState(prev => ({ ...prev, connectionStatus: 'connecting', error: null }));
      // Prefer auth provider token; fallback to common storage/cookie keys
      const token = (() => {
        if (sessionToken) return sessionToken;
        try {
          if (typeof window === 'undefined') return null;
          const fromLocal = localStorage.getItem('auth_token') || localStorage.getItem('authToken');
          const fromSession = sessionStorage.getItem('auth_token') || sessionStorage.getItem('authToken');
          const cookie = (() => {
            const value = `; ${document.cookie}`;
            const pick = (name: string) => {
              const parts = value.split(`; ${name}=`);
              if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
              return null;
            };
            return pick('session_token') || pick('auth_token');
          })();
          return fromLocal || fromSession || cookie || null;
        } catch {
          return null;
        }
      })();

      if (!token) {
        setState(prev => ({ ...prev, error: 'Authentication token required for WebSocket connection', connectionStatus: 'error' }));
        return;
      }

      rbacWebSocketService.connect(token);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to connect',
        connectionStatus: 'error'
      }));
    }
  }, [sessionToken]);

  const disconnect = useCallback(() => {
    try {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      rbacWebSocketService.disconnect();
      setState(prev => ({
        ...prev,
        isConnected: false,
        connectionStatus: 'disconnected',
        subscriptions: []
      }));
      
      eventHandlersRef.current.clear();
    } catch (error) {
      console.error('Error disconnecting WebSocket:', error);
    }
  }, []);

  const reconnect = useCallback(() => {
    setState(prev => ({
      ...prev,
      reconnectAttempts: prev.reconnectAttempts + 1,
      connectionStatus: 'reconnecting'
    }));
    
    connect();
  }, [connect]);

  // === Event Subscriptions ===

  const subscribeToPermissionChanges = useCallback((filters?: any): string => {
    const subscriptionId = rbacWebSocketService.subscribeToPermissionChanges(filters);
    setState(prev => ({
      ...prev,
      subscriptions: [...prev.subscriptions, subscriptionId]
    }));
    return subscriptionId;
  }, []);

  const subscribeToRoleAssignments = useCallback((filters?: any): string => {
    const subscriptionId = rbacWebSocketService.subscribeToRoleAssignments(filters);
    setState(prev => ({
      ...prev,
      subscriptions: [...prev.subscriptions, subscriptionId]
    }));
    return subscriptionId;
  }, []);

  const subscribeToAccessRequests = useCallback((filters?: any): string => {
    const subscriptionId = rbacWebSocketService.subscribeToAccessRequests(filters);
    setState(prev => ({
      ...prev,
      subscriptions: [...prev.subscriptions, subscriptionId]
    }));
    return subscriptionId;
  }, []);

  const subscribeToAuditAlerts = useCallback((filters?: any): string => {
    const subscriptionId = rbacWebSocketService.subscribeToAuditAlerts(filters);
    setState(prev => ({
      ...prev,
      subscriptions: [...prev.subscriptions, subscriptionId]
    }));
    return subscriptionId;
  }, []);

  const subscribeToUserActivity = useCallback((filters?: any): string => {
    const subscriptionId = rbacWebSocketService.subscribeToUserActivity(filters);
    setState(prev => ({
      ...prev,
      subscriptions: [...prev.subscriptions, subscriptionId]
    }));
    return subscriptionId;
  }, []);

  const subscribeToSystemNotifications = useCallback((filters?: any): string => {
    const subscriptionId = rbacWebSocketService.subscribeToSystemNotifications(filters);
    setState(prev => ({
      ...prev,
      subscriptions: [...prev.subscriptions, subscriptionId]
    }));
    return subscriptionId;
  }, []);

  // === Subscription Management ===

  const unsubscribe = useCallback((subscriptionId: string): void => {
    rbacWebSocketService.unsubscribe(subscriptionId);
    eventHandlersRef.current.delete(subscriptionId);
    setState(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.filter(id => id !== subscriptionId)
    }));
  }, []);

  const unsubscribeAll = useCallback((): void => {
    rbacWebSocketService.unsubscribeAll();
    eventHandlersRef.current.clear();
    setState(prev => ({
      ...prev,
      subscriptions: []
    }));
  }, []);

  const updateSubscriptionFilters = useCallback((subscriptionId: string, filters: any): void => {
    rbacWebSocketService.updateSubscriptionFilters(subscriptionId, filters);
  }, []);

  // === Event Handlers ===

  const onPermissionChanged = useCallback((handler: (event: any) => void, filters?: any): string => {
    const subscriptionId = rbacWebSocketService.onPermissionChanged(handler, filters);
    eventHandlersRef.current.set(subscriptionId, handler);
    setState(prev => ({
      ...prev,
      subscriptions: [...prev.subscriptions, subscriptionId]
    }));
    return subscriptionId;
  }, []);

  const onRoleAssigned = useCallback((handler: (event: any) => void, filters?: any): string => {
    const subscriptionId = rbacWebSocketService.onRoleAssigned(handler, filters);
    eventHandlersRef.current.set(subscriptionId, handler);
    setState(prev => ({
      ...prev,
      subscriptions: [...prev.subscriptions, subscriptionId]
    }));
    return subscriptionId;
  }, []);

  const onAccessRequest = useCallback((handler: (event: any) => void, filters?: any): string => {
    const subscriptionId = rbacWebSocketService.onAccessRequest(handler, filters);
    eventHandlersRef.current.set(subscriptionId, handler);
    setState(prev => ({
      ...prev,
      subscriptions: [...prev.subscriptions, subscriptionId]
    }));
    return subscriptionId;
  }, []);

  const onAuditAlert = useCallback((handler: (event: any) => void, filters?: any): string => {
    const subscriptionId = rbacWebSocketService.onAuditAlert(handler, filters);
    eventHandlersRef.current.set(subscriptionId, handler);
    setState(prev => ({
      ...prev,
      subscriptions: [...prev.subscriptions, subscriptionId]
    }));
    return subscriptionId;
  }, []);

  const onUserActivity = useCallback((handler: (event: any) => void, filters?: any): string => {
    const subscriptionId = rbacWebSocketService.onUserActivity(handler, filters);
    eventHandlersRef.current.set(subscriptionId, handler);
    setState(prev => ({
      ...prev,
      subscriptions: [...prev.subscriptions, subscriptionId]
    }));
    return subscriptionId;
  }, []);

  const onSystemNotification = useCallback((handler: (event: any) => void, filters?: any): string => {
    const subscriptionId = rbacWebSocketService.onSystemNotification(handler, filters);
    eventHandlersRef.current.set(subscriptionId, handler);
    setState(prev => ({
      ...prev,
      subscriptions: [...prev.subscriptions, subscriptionId]
    }));
    return subscriptionId;
  }, []);

  // === Custom Events ===

  const sendCustomMessage = useCallback((message: any): void => {
    try {
      rbacWebSocketService.sendCustomMessage(message);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to send custom message'
      }));
    }
  }, []);

  const requestCurrentPermissions = useCallback((): void => {
    try {
      rbacWebSocketService.requestCurrentPermissions();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to request current permissions'
      }));
    }
  }, []);

  const requestSystemStatus = useCallback((): void => {
    try {
      rbacWebSocketService.requestSystemStatus();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to request system status'
      }));
    }
  }, []);

  // === Utility ===

  const clearEventHistory = useCallback((): void => {
    setState(prev => ({
      ...prev,
      eventHistory: [],
      lastEvent: null
    }));
  }, []);

  const getSubscriptionStats = useCallback((): any => {
    return rbacWebSocketService.getSubscriptionStats();
  }, []);

  return {
    ...state,
    
    // Connection Management
    connect,
    disconnect,
    reconnect,
    
    // Event Subscriptions
    subscribeToPermissionChanges,
    subscribeToRoleAssignments,
    subscribeToAccessRequests,
    subscribeToAuditAlerts,
    subscribeToUserActivity,
    subscribeToSystemNotifications,
    
    // Subscription Management
    unsubscribe,
    unsubscribeAll,
    updateSubscriptionFilters,
    
    // Event Handlers
    onPermissionChanged,
    onRoleAssigned,
    onAccessRequest,
    onAuditAlert,
    onUserActivity,
    onSystemNotification,
    
    // Custom Events
    sendCustomMessage,
    requestCurrentPermissions,
    requestSystemStatus,
    
    // Utility
    clearEventHistory,
    getSubscriptionStats
  };
}

export default useRBACWebSocket;