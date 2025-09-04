"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// INTERFACES
// ============================================================================

export interface RealTimeUpdate {
  id: string;
  type: 'data' | 'status' | 'metric' | 'alert' | 'event';
  source: string;
  timestamp: Date;
  data: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  metadata?: Record<string, any>;
}

export interface RealTimeConfig {
  enabled: boolean;
  updateInterval: number;
  maxUpdates: number;
  filters: {
    types: string[];
    sources: string[];
    priorities: string[];
  };
  autoRefresh: boolean;
  batchUpdates: boolean;
  compression: boolean;
}

export interface RealTimeState {
  isConnected: boolean;
  isSubscribed: boolean;
  lastUpdate: Date | null;
  updateCount: number;
  errorCount: number;
  performance: {
    averageLatency: number;
    updateRate: number;
    droppedUpdates: number;
  };
}

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

const mockRealTimeAPI = {
  // Subscribe to real-time updates
  subscribe: async (config: RealTimeConfig): Promise<{ subscriptionId: string }> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { subscriptionId: `sub_${Date.now()}` };
  },

  // Unsubscribe from real-time updates
  unsubscribe: async (subscriptionId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 50));
  },

  // Get real-time updates
  getUpdates: async (subscriptionId: string, lastUpdateId?: string): Promise<RealTimeUpdate[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const mockUpdates: RealTimeUpdate[] = [
      {
        id: `update_${Date.now()}_1`,
        type: 'data',
        source: 'data-sources',
        timestamp: new Date(),
        data: { 
          sourceId: 'ds_001',
          status: 'active',
          metrics: { throughput: 1250, latency: 45 }
        },
        priority: 'medium',
        category: 'performance'
      },
      {
        id: `update_${Date.now()}_2`,
        type: 'metric',
        source: 'scan-logic',
        timestamp: new Date(),
        data: {
          scanId: 'scan_001',
          progress: 75,
          findings: 12
        },
        priority: 'low',
        category: 'monitoring'
      },
      {
        id: `update_${Date.now()}_3`,
        type: 'alert',
        source: 'compliance-rules',
        timestamp: new Date(),
        data: {
          ruleId: 'rule_001',
          severity: 'high',
          message: 'Compliance violation detected'
        },
        priority: 'high',
        category: 'security'
      }
    ];

    return mockUpdates;
  },

  // Send real-time update
  sendUpdate: async (update: Omit<RealTimeUpdate, 'id' | 'timestamp'>): Promise<RealTimeUpdate> => {
    await new Promise(resolve => setTimeout(resolve, 150));
    return {
      ...update,
      id: `update_${Date.now()}`,
      timestamp: new Date()
    };
  },

  // Get connection status
  getConnectionStatus: async (): Promise<{ connected: boolean; latency: number }> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return { connected: true, latency: Math.random() * 100 };
  }
};

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export const useRealTimeUpdates = (config: Partial<RealTimeConfig> = {}) => {
  const queryClient = useQueryClient();
  
  // Default configuration
  const defaultConfig: RealTimeConfig = {
    enabled: true,
    updateInterval: 5000,
    maxUpdates: 1000,
    filters: {
      types: ['data', 'status', 'metric', 'alert', 'event'],
      sources: [],
      priorities: ['low', 'medium', 'high', 'critical']
    },
    autoRefresh: true,
    batchUpdates: true,
    compression: true,
    ...config
  };

  // State management
  const [state, setState] = useState<RealTimeState>({
    isConnected: false,
    isSubscribed: false,
    lastUpdate: null,
    updateCount: 0,
    errorCount: 0,
    performance: {
      averageLatency: 0,
      updateRate: 0,
      droppedUpdates: 0
    }
  });

  const [updates, setUpdates] = useState<RealTimeUpdate[]>([]);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  
  // Refs for cleanup
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const connectionRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateIdRef = useRef<string | null>(null);

  // ============================================================================
  // QUERIES
  // ============================================================================

  // Query for connection status
  const { data: connectionStatus } = useQuery(
    ['real-time', 'connection-status'],
    mockRealTimeAPI.getConnectionStatus,
    {
      refetchInterval: 30000, // Check every 30 seconds
      staleTime: 10000,
      cacheTime: 60000
    }
  );

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  // Subscribe to real-time updates
  const subscribeMutation = useMutation(
    mockRealTimeAPI.subscribe,
    {
      onSuccess: (data) => {
        setSubscriptionId(data.subscriptionId);
        setState(prev => ({ ...prev, isSubscribed: true }));
      },
      onError: (error) => {
        console.error('Failed to subscribe to real-time updates:', error);
        setState(prev => ({ 
          ...prev, 
          errorCount: prev.errorCount + 1,
          isSubscribed: false 
        }));
      }
    }
  );

  // Unsubscribe from real-time updates
  const unsubscribeMutation = useMutation(
    mockRealTimeAPI.unsubscribe,
    {
      onSuccess: () => {
        setSubscriptionId(null);
        setState(prev => ({ ...prev, isSubscribed: false }));
      },
      onError: (error) => {
        console.error('Failed to unsubscribe from real-time updates:', error);
      }
    }
  );

  // Send real-time update
  const sendUpdateMutation = useMutation(
    mockRealTimeAPI.sendUpdate,
    {
      onSuccess: (newUpdate) => {
        setUpdates(prev => [newUpdate, ...prev.slice(0, defaultConfig.maxUpdates - 1)]);
        setState(prev => ({ 
          ...prev, 
          updateCount: prev.updateCount + 1,
          lastUpdate: new Date()
        }));
      },
      onError: (error) => {
        console.error('Failed to send real-time update:', error);
        setState(prev => ({ 
          ...prev, 
          errorCount: prev.errorCount + 1 
        }));
      }
    }
  );

  // ============================================================================
  // CORE FUNCTIONS
  // ============================================================================

  // Subscribe to real-time updates
  const subscribe = useCallback(async () => {
    if (!defaultConfig.enabled || state.isSubscribed) return;
    
    try {
      await subscribeMutation.mutateAsync(defaultConfig);
    } catch (error) {
      console.error('Subscription failed:', error);
    }
  }, [defaultConfig, state.isSubscribed, subscribeMutation]);

  // Unsubscribe from real-time updates
  const unsubscribe = useCallback(async () => {
    if (!subscriptionId) return;
    
    try {
      await unsubscribeMutation.mutateAsync(subscriptionId);
    } catch (error) {
      console.error('Unsubscription failed:', error);
    }
  }, [subscriptionId, unsubscribeMutation]);

  // Send a real-time update
  const sendUpdate = useCallback(async (updateData: Omit<RealTimeUpdate, 'id' | 'timestamp'>) => {
    try {
      await sendUpdateMutation.mutateAsync(updateData);
    } catch (error) {
      console.error('Failed to send update:', error);
    }
  }, [sendUpdateMutation]);

  // Fetch updates
  const fetchUpdates = useCallback(async () => {
    if (!subscriptionId || !state.isSubscribed) return;
    
    try {
      const newUpdates = await mockRealTimeAPI.getUpdates(subscriptionId, lastUpdateIdRef.current);
      
      if (newUpdates.length > 0) {
        setUpdates(prev => {
          const combined = [...newUpdates, ...prev];
          return combined.slice(0, defaultConfig.maxUpdates);
        });
        
        setState(prev => ({
          ...prev,
          updateCount: prev.updateCount + newUpdates.length,
          lastUpdate: new Date(),
          performance: {
            ...prev.performance,
            updateRate: newUpdates.length / (defaultConfig.updateInterval / 1000)
          }
        }));
        
        lastUpdateIdRef.current = newUpdates[0]?.id || null;
      }
    } catch (error) {
      console.error('Failed to fetch updates:', error);
      setState(prev => ({ 
        ...prev, 
        errorCount: prev.errorCount + 1 
      }));
    }
  }, [subscriptionId, state.isSubscribed, defaultConfig]);

  // Filter updates
  const filterUpdates = useCallback((updatesToFilter: RealTimeUpdate[]) => {
    return updatesToFilter.filter(update => {
      const typeMatch = defaultConfig.filters.types.includes(update.type);
      const sourceMatch = defaultConfig.filters.sources.length === 0 || 
                         defaultConfig.filters.sources.includes(update.source);
      const priorityMatch = defaultConfig.filters.priorities.includes(update.priority);
      
      return typeMatch && sourceMatch && priorityMatch;
    });
  }, [defaultConfig.filters]);

  // Clear updates
  const clearUpdates = useCallback(() => {
    setUpdates([]);
    setState(prev => ({ ...prev, updateCount: 0 }));
  }, []);

  // Get filtered updates
  const filteredUpdates = filterUpdates(updates);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Handle connection status updates
  useEffect(() => {
    if (connectionStatus) {
      setState(prev => ({
        ...prev,
        isConnected: connectionStatus.connected,
        performance: {
          ...prev.performance,
          averageLatency: connectionStatus.latency
        }
      }));
    }
  }, [connectionStatus]);

  // Setup subscription
  useEffect(() => {
    if (defaultConfig.enabled && !state.isSubscribed) {
      subscribe();
    }
    
    return () => {
      if (subscriptionId) {
        unsubscribe();
      }
    };
  }, [defaultConfig.enabled, state.isSubscribed, subscribe, unsubscribe, subscriptionId]);

  // Setup update polling
  useEffect(() => {
    if (defaultConfig.enabled && state.isSubscribed && defaultConfig.autoRefresh) {
      intervalRef.current = setInterval(fetchUpdates, defaultConfig.updateInterval);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [defaultConfig.enabled, state.isSubscribed, defaultConfig.autoRefresh, defaultConfig.updateInterval, fetchUpdates]);

  // ============================================================================
  // RETURN VALUES
  // ============================================================================

  return {
    // State
    updates: filteredUpdates,
    state,
    config: defaultConfig,
    
    // Actions
    subscribe,
    unsubscribe,
    sendUpdate,
    fetchUpdates,
    clearUpdates,
    filterUpdates,
    
    // Mutations
    subscribeMutation,
    unsubscribeMutation,
    sendUpdateMutation,
    
    // Utilities
    isConnected: state.isConnected,
    isSubscribed: state.isSubscribed,
    hasUpdates: filteredUpdates.length > 0,
    lastUpdate: state.lastUpdate,
    updateCount: state.updateCount,
    errorCount: state.errorCount
  };
};

export default useRealTimeUpdates;
