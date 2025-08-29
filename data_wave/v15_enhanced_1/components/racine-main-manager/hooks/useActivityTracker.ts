/**
 * useActivityTracker Hook
 * ========================
 * 
 * React hook for managing comprehensive activity tracking and monitoring.
 * Maps to the activity tracking API service and provides reactive state
 * management for activity logging, analytics, and audit trails.
 * 
 * Features:
 * - Real-time activity monitoring and logging
 * - Advanced filtering and search capabilities
 * - Cross-group activity correlation
 * - Activity analytics with visualizations
 * - Audit trail management and export
 * - Anomaly detection and alerts
 * - Performance metrics and insights
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  activityTrackingAPI, 
  ActivityEventType, 
  type ActivityEvent,
  type ActivityEventHandler
} from '../services/activity-tracking-apis';
import {
  RacineActivity,
  ActivityFilter,
  ActivityAnalytics,
  ActivityTimeline,
  ActivityHeatmap,
  AuditTrail,
  ActivityAnomaly,
  ActivityCorrelation,
  UUID
} from '../types/racine-core.types';
import {
  LogActivityRequest,
  BatchLogActivityRequest,
  ActivitySearchRequest,
  ActivityAnalyticsRequest,
  AuditTrailRequest,
  PaginationRequest,
  FilterRequest,
  SortRequest
} from '../types/api.types';

/**
 * Activity tracker state interface
 */
interface ActivityTrackerState {
  activities: RacineActivity[];
  filteredActivities: RacineActivity[];
  userActivities: Map<UUID, RacineActivity[]>;
  groupActivities: Map<string, RacineActivity[]>;
  analytics: ActivityAnalytics | null;
  timeline: ActivityTimeline | null;
  heatmap: ActivityHeatmap | null;
  auditTrails: AuditTrail[];
  anomalies: ActivityAnomaly[];
  correlations: ActivityCorrelation[];
  filters: {
    active: ActivityFilter[];
    saved: ActivityFilter[];
    quick: ActivityFilter[];
  };
  searchState: {
    query: string;
    results: RacineActivity[];
    correlationResults: ActivityCorrelation[];
    isSearching: boolean;
  };
  streamState: {
    isStreaming: boolean;
    streamFilters: ActivityFilter[];
    bufferSize: number;
    realTimeBuffer: RacineActivity[];
  };
  loading: {
    activities: boolean;
    analytics: boolean;
    search: boolean;
    auditTrail: boolean;
    anomalies: boolean;
  };
  errors: {
    activities: string | null;
    analytics: string | null;
    search: string | null;
    auditTrail: string | null;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Initial state
 */
const initialState: ActivityTrackerState = {
  activities: [],
  filteredActivities: [],
  userActivities: new Map(),
  groupActivities: new Map(),
  analytics: null,
  timeline: null,
  heatmap: null,
  auditTrails: [],
  anomalies: [],
  correlations: [],
  filters: {
    active: [],
    saved: [],
    quick: [
      { id: 'today', name: 'Today', dateRange: { start: new Date().toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] } },
      { id: 'week', name: 'This Week', dateRange: { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), end: new Date().toISOString() } },
      { id: 'errors', name: 'Errors Only', severity: ['error', 'critical'] },
      { id: 'user-actions', name: 'User Actions', activityTypes: ['user_action', 'workflow_execution', 'resource_access'] }
    ]
  },
  searchState: {
    query: '',
    results: [],
    correlationResults: [],
    isSearching: false
  },
  streamState: {
    isStreaming: false,
    streamFilters: [],
    bufferSize: 100,
    realTimeBuffer: []
  },
  loading: {
    activities: false,
    analytics: false,
    search: false,
    auditTrail: false,
    anomalies: false
  },
  errors: {
    activities: null,
    analytics: null,
    search: null,
    auditTrail: null
  },
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    hasNext: false,
    hasPrev: false
  }
};

/**
 * Hook options interface
 */
interface UseActivityTrackerOptions {
  autoLoadActivities?: boolean;
  enableRealTimeUpdates?: boolean;
  enableAutoRefresh?: boolean;
  autoRefreshInterval?: number;
  defaultPagination?: Partial<PaginationRequest>;
  maxBufferSize?: number;
  onNewActivity?: (activity: RacineActivity) => void;
  onAnomalyDetected?: (anomaly: ActivityAnomaly) => void;
  onError?: (error: string, operation: string) => void;
}

/**
 * useActivityTracker hook
 */
export function useActivityTracker(options: UseActivityTrackerOptions = {}) {
  const {
    autoLoadActivities = true,
    enableRealTimeUpdates = true,
    enableAutoRefresh = false,
    autoRefreshInterval = 30000,
    defaultPagination = { page: 1, limit: 50 },
    maxBufferSize = 1000,
    onNewActivity,
    onAnomalyDetected,
    onError
  } = options;

  const [state, setState] = useState<ActivityTrackerState>(initialState);
  const eventSubscriptions = useRef<UUID[]>([]);
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);
  const activityBuffer = useRef<RacineActivity[]>([]);
  const isInitialized = useRef(false);

  // =============================================================================
  // STATE MANAGEMENT HELPERS
  // =============================================================================

  const updateState = useCallback((updater: Partial<ActivityTrackerState> | ((prev: ActivityTrackerState) => ActivityTrackerState)) => {
    setState(prev => typeof updater === 'function' ? updater(prev) : { ...prev, ...updater });
  }, []);

  const setLoading = useCallback((key: keyof ActivityTrackerState['loading'], value: boolean) => {
    updateState(prev => ({
      ...prev,
      loading: { ...prev.loading, [key]: value }
    }));
  }, [updateState]);

  const setError = useCallback((key: keyof ActivityTrackerState['errors'], error: string | null) => {
    updateState(prev => ({
      ...prev,
      errors: { ...prev.errors, [key]: error }
    }));
    
    if (error && onError) {
      onError(error, key);
    }
  }, [updateState, onError]);

  // =============================================================================
  // ACTIVITY LOGGING
  // =============================================================================

  const logActivity = useCallback(async (request: LogActivityRequest): Promise<boolean> => {
    try {
      const activity = await activityTrackingAPI.logActivity(request);
      
      // Add to buffer for batch processing
      activityBuffer.current.push(activity);
      
      // Process buffer if it gets too large
      if (activityBuffer.current.length > 10) {
        updateState(prev => ({
          ...prev,
          activities: [...activityBuffer.current, ...prev.activities].slice(0, maxBufferSize)
        }));
        activityBuffer.current = [];
      }

      if (onNewActivity) {
        onNewActivity(activity);
      }

      return true;
    } catch (error) {
      console.error('Failed to log activity:', error);
      return false;
    }
  }, [updateState, maxBufferSize, onNewActivity]);

  const batchLogActivities = useCallback(async (request: BatchLogActivityRequest): Promise<boolean> => {
    try {
      const activities = await activityTrackingAPI.batchLogActivities(request);
      
      updateState(prev => ({
        ...prev,
        activities: [...activities, ...prev.activities].slice(0, maxBufferSize)
      }));

      return true;
    } catch (error) {
      console.error('Failed to batch log activities:', error);
      return false;
    }
  }, [updateState, maxBufferSize]);

  // =============================================================================
  // ACTIVITY RETRIEVAL
  // =============================================================================

  const loadActivities = useCallback(async (
    pagination?: PaginationRequest,
    filters?: FilterRequest,
    sort?: SortRequest
  ): Promise<void> => {
    setLoading('activities', true);
    setError('activities', null);

    try {
      const response = await activityTrackingAPI.listActivities(
        pagination || defaultPagination,
        filters,
        sort
      );

      updateState(prev => ({
        ...prev,
        activities: response.activities,
        filteredActivities: response.activities,
        pagination: {
          page: response.pagination?.page || 1,
          limit: response.pagination?.limit || 50,
          total: response.pagination?.total || 0,
          hasNext: response.pagination?.hasNext || false,
          hasPrev: response.pagination?.hasPrev || false
        }
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load activities';
      setError('activities', message);
    } finally {
      setLoading('activities', false);
    }
  }, [setLoading, setError, updateState, defaultPagination]);

  const loadActivity = useCallback(async (activityId: UUID): Promise<RacineActivity | null> => {
    try {
      return await activityTrackingAPI.getActivity(activityId);
    } catch (error) {
      console.error('Failed to load activity:', error);
      return null;
    }
  }, []);

  const loadUserActivities = useCallback(async (userId: UUID): Promise<void> => {
    try {
      const activities = await activityTrackingAPI.getUserActivities(userId);
      
      updateState(prev => {
        const newUserActivities = new Map(prev.userActivities);
        newUserActivities.set(userId, activities);
        return { ...prev, userActivities: newUserActivities };
      });
    } catch (error) {
      console.error('Failed to load user activities:', error);
    }
  }, [updateState]);

  const loadGroupActivities = useCallback(async (groupId: string): Promise<void> => {
    try {
      const activities = await activityTrackingAPI.getGroupActivities(groupId);
      
      updateState(prev => {
        const newGroupActivities = new Map(prev.groupActivities);
        newGroupActivities.set(groupId, activities);
        return { ...prev, groupActivities: newGroupActivities };
      });
    } catch (error) {
      console.error('Failed to load group activities:', error);
    }
  }, [updateState]);

  // =============================================================================
  // SEARCH AND FILTERING
  // =============================================================================

  const searchActivities = useCallback(async (request: ActivitySearchRequest): Promise<void> => {
    setLoading('search', true);
    setError('search', null);
    
    updateState(prev => ({
      ...prev,
      searchState: { ...prev.searchState, isSearching: true, query: request.query || '' }
    }));

    try {
      const results = await activityTrackingAPI.searchActivities(request);
      
      updateState(prev => ({
        ...prev,
        searchState: {
          ...prev.searchState,
          results,
          isSearching: false
        },
        filteredActivities: results
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to search activities';
      setError('search', message);
      
      updateState(prev => ({
        ...prev,
        searchState: { ...prev.searchState, isSearching: false }
      }));
    } finally {
      setLoading('search', false);
    }
  }, [setLoading, setError, updateState]);

  const searchCorrelations = useCallback(async (
    activityId: UUID,
    timeWindow?: number
  ): Promise<void> => {
    try {
      const correlations = await activityTrackingAPI.searchCorrelations({
        activity_id: activityId,
        time_window: timeWindow || 3600 // 1 hour default
      });
      
      updateState(prev => ({
        ...prev,
        correlations,
        searchState: { ...prev.searchState, correlationResults: correlations }
      }));
    } catch (error) {
      console.error('Failed to search correlations:', error);
    }
  }, [updateState]);

  const applyFilter = useCallback((filter: ActivityFilter): void => {
    updateState(prev => {
      const newActiveFilters = [...prev.filters.active, filter];
      
      // Apply filters to activities
      let filtered = prev.activities;
      
      newActiveFilters.forEach(f => {
        if (f.dateRange) {
          filtered = filtered.filter(a => {
            const activityDate = new Date(a.timestamp);
            const start = new Date(f.dateRange!.start);
            const end = new Date(f.dateRange!.end);
            return activityDate >= start && activityDate <= end;
          });
        }
        
        if (f.activityTypes) {
          filtered = filtered.filter(a => f.activityTypes!.includes(a.activityType));
        }
        
        if (f.severity) {
          filtered = filtered.filter(a => f.severity!.includes(a.severity));
        }
        
        if (f.userIds) {
          filtered = filtered.filter(a => f.userIds!.includes(a.userId));
        }
        
        if (f.groupIds) {
          filtered = filtered.filter(a => f.groupIds!.includes(a.groupId));
        }
      });
      
      return {
        ...prev,
        filters: { ...prev.filters, active: newActiveFilters },
        filteredActivities: filtered
      };
    });
  }, [updateState]);

  const removeFilter = useCallback((filterId: string): void => {
    updateState(prev => {
      const newActiveFilters = prev.filters.active.filter(f => f.id !== filterId);
      
      // Re-apply remaining filters
      let filtered = prev.activities;
      newActiveFilters.forEach(f => {
        // Apply filter logic (same as above)
        if (f.dateRange) {
          filtered = filtered.filter(a => {
            const activityDate = new Date(a.timestamp);
            const start = new Date(f.dateRange!.start);
            const end = new Date(f.dateRange!.end);
            return activityDate >= start && activityDate <= end;
          });
        }
        // ... other filter logic
      });
      
      return {
        ...prev,
        filters: { ...prev.filters, active: newActiveFilters },
        filteredActivities: filtered
      };
    });
  }, [updateState]);

  const clearFilters = useCallback((): void => {
    updateState(prev => ({
      ...prev,
      filters: { ...prev.filters, active: [] },
      filteredActivities: prev.activities
    }));
  }, [updateState]);

  // =============================================================================
  // ANALYTICS
  // =============================================================================

  const loadAnalytics = useCallback(async (request: ActivityAnalyticsRequest): Promise<void> => {
    setLoading('analytics', true);
    setError('analytics', null);

    try {
      const analytics = await activityTrackingAPI.getAnalytics(request);
      updateState(prev => ({ ...prev, analytics }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load analytics';
      setError('analytics', message);
    } finally {
      setLoading('analytics', false);
    }
  }, [setLoading, setError, updateState]);

  const loadTimeline = useCallback(async (
    timeRange: { start: string; end: string },
    granularity: 'hour' | 'day' | 'week' = 'day'
  ): Promise<void> => {
    try {
      const timeline = await activityTrackingAPI.getTimeline(timeRange, granularity);
      updateState(prev => ({ ...prev, timeline }));
    } catch (error) {
      console.error('Failed to load timeline:', error);
    }
  }, [updateState]);

  const loadHeatmap = useCallback(async (
    timeRange: { start: string; end: string }
  ): Promise<void> => {
    try {
      const heatmap = await activityTrackingAPI.getHeatmap(timeRange);
      updateState(prev => ({ ...prev, heatmap }));
    } catch (error) {
      console.error('Failed to load heatmap:', error);
    }
  }, [updateState]);

  // =============================================================================
  // AUDIT TRAILS
  // =============================================================================

  const generateAuditTrail = useCallback(async (request: AuditTrailRequest): Promise<void> => {
    setLoading('auditTrail', true);
    setError('auditTrail', null);

    try {
      const auditTrail = await activityTrackingAPI.generateAuditTrail(request);
      
      updateState(prev => ({
        ...prev,
        auditTrails: [auditTrail, ...prev.auditTrails]
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate audit trail';
      setError('auditTrail', message);
    } finally {
      setLoading('auditTrail', false);
    }
  }, [setLoading, setError, updateState]);

  const exportAuditTrail = useCallback(async (
    auditTrailId: UUID,
    format: 'pdf' | 'csv' | 'json' = 'pdf'
  ): Promise<Blob | null> => {
    try {
      return await activityTrackingAPI.exportAuditTrail(auditTrailId, format);
    } catch (error) {
      console.error('Failed to export audit trail:', error);
      return null;
    }
  }, []);

  // =============================================================================
  // ANOMALY DETECTION
  // =============================================================================

  const loadAnomalies = useCallback(async (): Promise<void> => {
    setLoading('anomalies', true);

    try {
      const anomalies = await activityTrackingAPI.getAnomalies();
      updateState(prev => ({ ...prev, anomalies }));
      
      // Notify about new anomalies
      if (onAnomalyDetected && anomalies.length > 0) {
        anomalies.forEach(anomaly => onAnomalyDetected(anomaly));
      }
    } catch (error) {
      console.error('Failed to load anomalies:', error);
    } finally {
      setLoading('anomalies', false);
    }
  }, [setLoading, updateState, onAnomalyDetected]);

  const reportAnomaly = useCallback(async (
    activityId: UUID,
    description: string,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<boolean> => {
    try {
      await activityTrackingAPI.reportAnomaly({
        activity_id: activityId,
        description,
        severity
      });
      
      // Refresh anomalies
      await loadAnomalies();
      return true;
    } catch (error) {
      console.error('Failed to report anomaly:', error);
      return false;
    }
  }, [loadAnomalies]);

  // =============================================================================
  // REAL-TIME STREAMING
  // =============================================================================

  const startActivityStream = useCallback((filters?: ActivityFilter[]): void => {
    updateState(prev => ({
      ...prev,
      streamState: {
        ...prev.streamState,
        isStreaming: true,
        streamFilters: filters || []
      }
    }));
  }, [updateState]);

  const stopActivityStream = useCallback((): void => {
    updateState(prev => ({
      ...prev,
      streamState: {
        ...prev.streamState,
        isStreaming: false,
        realTimeBuffer: []
      }
    }));
  }, [updateState]);

  // =============================================================================
  // AUTO REFRESH
  // =============================================================================

  const setupAutoRefresh = useCallback(() => {
    if (refreshTimer.current) {
      clearInterval(refreshTimer.current);
    }

    if (enableAutoRefresh) {
      refreshTimer.current = setInterval(() => {
        loadActivities();
      }, autoRefreshInterval);
    }
  }, [enableAutoRefresh, autoRefreshInterval, loadActivities]);

  // =============================================================================
  // REAL-TIME EVENT HANDLING
  // =============================================================================

  const handleActivityEvent: ActivityEventHandler = useCallback((event: ActivityEvent) => {
    switch (event.type) {
      case ActivityEventType.ACTIVITY_LOGGED:
        if (event.data.activity) {
          const activity = event.data.activity;
          
          updateState(prev => {
            // Check if streaming and matches filters
            const matchesStreamFilters = prev.streamState.isStreaming && 
              (prev.streamState.streamFilters.length === 0 || 
               prev.streamState.streamFilters.some(filter => {
                 // Apply filter matching logic
                 return true; // Simplified for now
               }));
            
            const newState = {
              ...prev,
              activities: [activity, ...prev.activities].slice(0, maxBufferSize)
            };
            
            if (matchesStreamFilters) {
              newState.streamState = {
                ...prev.streamState,
                realTimeBuffer: [activity, ...prev.streamState.realTimeBuffer].slice(0, prev.streamState.bufferSize)
              };
            }
            
            return newState;
          });

          if (onNewActivity) {
            onNewActivity(event.data.activity);
          }
        }
        break;

      case ActivityEventType.ANOMALY_DETECTED:
        if (event.data.anomaly) {
          updateState(prev => ({
            ...prev,
            anomalies: [event.data.anomaly, ...prev.anomalies]
          }));

          if (onAnomalyDetected) {
            onAnomalyDetected(event.data.anomaly);
          }
        }
        break;
    }
  }, [updateState, maxBufferSize, onNewActivity, onAnomalyDetected]);

  // =============================================================================
  // INITIALIZATION AND CLEANUP
  // =============================================================================

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;

      // Initialize real-time updates
      if (enableRealTimeUpdates) {
        try {
          (activityTrackingAPI as any)?.initializeRealTimeUpdates?.();
        } catch (_) { /* noop */ }

        try {
          Object.values(ActivityEventType).forEach(eventType => {
            try {
              const id = (activityTrackingAPI as any)?.subscribeToEvents?.(eventType, handleActivityEvent);
              if (id) {
                eventSubscriptions.current.push(id as any);
              }
            } catch (_) { /* noop */ }
          });
        } catch (_) { /* noop */ }
      }

      // Auto-load activities if enabled
      if (autoLoadActivities) {
        loadActivities();
      }
    }

    return () => {
      // Cleanup subscriptions
      eventSubscriptions.current.forEach(id => {
        try { (activityTrackingAPI as any)?.unsubscribeFromEvents?.(id); } catch (_) { /* noop */ }
      });
      eventSubscriptions.current = [];

      // Cleanup timers
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
    };
  }, [enableRealTimeUpdates, autoLoadActivities, handleActivityEvent, loadActivities]);

  // Setup auto refresh
  useEffect(() => {
    setupAutoRefresh();
  }, [setupAutoRefresh]);

  // Flush activity buffer periodically
  useEffect(() => {
    const flushTimer = setInterval(() => {
      if (activityBuffer.current.length > 0) {
        updateState(prev => ({
          ...prev,
          activities: [...activityBuffer.current, ...prev.activities].slice(0, maxBufferSize)
        }));
        activityBuffer.current = [];
      }
    }, 5000);

    return () => clearInterval(flushTimer);
  }, [updateState, maxBufferSize]);

  // =============================================================================
  // RETURN HOOK INTERFACE
  // =============================================================================

  return {
    // State
    ...state,
    
    // Loading states
    isLoading: Object.values(state.loading).some(Boolean),
    
    // Activity logging
    logActivity,
    batchLogActivities,
    
    // Activity retrieval
    loadActivities,
    loadActivity,
    loadUserActivities,
    loadGroupActivities,
    
    // Search and filtering
    searchActivities,
    searchCorrelations,
    applyFilter,
    removeFilter,
    clearFilters,
    
    // Analytics
    loadAnalytics,
    loadTimeline,
    loadHeatmap,
    
    // Audit trails
    generateAuditTrail,
    exportAuditTrail,
    
    // Anomaly detection
    loadAnomalies,
    reportAnomaly,
    
    // Real-time streaming
    startActivityStream,
    stopActivityStream,
    
    // Utility functions
    clearErrors: useCallback(() => {
      updateState(prev => ({
        ...prev,
        errors: {
          activities: null,
          analytics: null,
          search: null,
          auditTrail: null
        }
      }));
    }, [updateState]),
    
    refresh: useCallback(() => {
      loadActivities();
      loadAnomalies();
    }, [loadActivities, loadAnomalies])
  };
}
