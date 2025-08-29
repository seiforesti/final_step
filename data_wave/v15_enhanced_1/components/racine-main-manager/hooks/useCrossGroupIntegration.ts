/**
 * Cross-Group Integration Hooks
 * =============================
 *
 * Comprehensive React hooks for cross-group integration functionality that provide
 * state management, API integration, and real-time updates for seamless coordination
 * across all 7 data governance groups.
 *
 * Features:
 * - Cross-group resource discovery and linking
 * - Inter-group dependency management
 * - Unified search across all groups
 * - Cross-group workflow orchestration
 * - Group health monitoring
 * - Resource synchronization
 * - Integration analytics and insights
 * - Conflict detection and resolution
 *
 * Backend Integration:
 * - Maps to: RacineIntegrationService
 * - Uses: cross-group-integration-apis.ts
 * - Real-time: WebSocket events
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  crossGroupIntegrationAPI,
  IntegrationEventType,
  IntegrationEvent,
  IntegrationEventHandler,
} from "../services/cross-group-integration-apis";

import {
  CrossGroupSearchRequest,
  CrossGroupSearchResponse,
  ResourceLinkRequest,
  ResourceLinkResponse,
  DependencyMappingRequest,
  DependencyMappingResponse,
  GroupSyncRequest,
  GroupSyncResponse,
  IntegrationHealthResponse,
  CrossGroupAnalyticsResponse,
  ConflictDetectionResponse,
  IntegrationEndpointResponse,
  ServiceRegistryResponse,
  IntegrationJobResponse,
  SyncJobResponse,
  UUID,
  ISODateString,
  SystemStatus,
  OperationStatus,
  PaginationRequest,
  FilterRequest,
} from "../types/racine-core.types";

// ============================================================================
// CROSS-GROUP INTEGRATION HOOK STATE INTERFACES
// ============================================================================

export interface CrossGroupIntegrationHookState {
  // Loading and error states
  loading: boolean;
  error: string | null;
  operationInProgress: string | null;

  // Cross-group search
  searchResults: CrossGroupSearchResponse | null;
  searchHistory: CrossGroupSearchRequest[];
  activeSearch: CrossGroupSearchRequest | null;
  searchLoading: boolean;

  // Resource linking
  resourceLinks: ResourceLinkResponse[];
  linkingInProgress: boolean;
  linkingErrors: Record<string, string>;

  // Dependency management
  dependencyMap: DependencyMappingResponse | null;
  dependencyLoading: boolean;
  dependencyConflicts: string[];

  // Group synchronization
  syncJobs: SyncJobResponse[];
  activeSyncJobs: SyncJobResponse[];
  syncProgress: Record<string, number>;
  syncErrors: Record<string, string>;

  // Integration health
  integrationHealth: IntegrationHealthResponse | null;
  groupStatuses: Record<string, SystemStatus>;
  healthMetrics: Record<string, number>;
  healthAlerts: string[];

  // Analytics and insights
  analytics: CrossGroupAnalyticsResponse | null;
  analyticsLoading: boolean;
  insights: Record<string, any>;
  trends: Record<string, any>;

  // Conflict detection
  conflicts: ConflictDetectionResponse[];
  conflictResolution: Record<string, string>;
  activeConflicts: number;

  // Integration endpoints
  endpoints: IntegrationEndpointResponse[];
  endpointTests: Record<string, boolean>;
  endpointHealth: Record<string, SystemStatus>;

  // Service registry
  registeredServices: ServiceRegistryResponse[];
  serviceHealth: Record<string, SystemStatus>;
  serviceMetrics: Record<string, Record<string, number>>;

  // Integration jobs
  integrationJobs: IntegrationJobResponse[];
  jobExecutions: Record<string, any>;
  jobSchedules: Record<string, string>;

  // Real-time updates
  realTimeEnabled: boolean;
  connectionStatus: "connected" | "disconnected" | "connecting";
  lastUpdate: ISODateString | null;
  eventLog: IntegrationEvent[];
}

export interface CrossGroupIntegrationHookOperations {
  // Cross-group search operations
  searchCrossGroups: (
    request: CrossGroupSearchRequest
  ) => Promise<CrossGroupSearchResponse | null>;
  clearSearchResults: () => void;
  getSearchHistory: () => CrossGroupSearchRequest[];

  // Resource linking operations
  linkResources: (
    request: ResourceLinkRequest
  ) => Promise<ResourceLinkResponse | null>;
  linkCrossGroupResource: (params: {
    sourceResourceId: string;
    sourceGroup: string;
    targetGroup: string;
    linkType: string;
    configuration: Record<string, any>;
    syncSettings: Record<string, any>;
  }) => Promise<{ success: boolean; link?: any; error?: string }>;
  unlinkCrossGroupResource: (
    resourceId: string,
    targetGroup: string
  ) => Promise<{ success: boolean; error?: string }>;
  unlinkResources: (linkId: string) => Promise<boolean>;
  getResourceLinks: (resourceId?: string) => Promise<ResourceLinkResponse[]>;

  // Dependency management operations
  mapDependencies: (
    request: DependencyMappingRequest
  ) => Promise<DependencyMappingResponse | null>;
  validateDependencies: (groupId: string) => Promise<boolean>;
  resolveDependencyConflicts: (conflicts: string[]) => Promise<boolean>;

  // Group synchronization operations
  startGroupSync: (
    request: GroupSyncRequest
  ) => Promise<SyncJobResponse | null>;
  monitorSyncProgress: (jobId: string) => Promise<SyncJobResponse | null>;
  cancelSync: (jobId: string) => Promise<boolean>;

  // Integration health operations
  checkIntegrationHealth: () => Promise<IntegrationHealthResponse | null>;
  getGroupHealth: (groupId: string) => Promise<SystemStatus>;
  refreshHealthMetrics: () => Promise<void>;

  // Analytics operations
  generateAnalytics: (
    request: CrossGroupAnalyticsRequest
  ) => Promise<CrossGroupAnalyticsResponse | null>;
  getInsights: (timeRange?: string) => Promise<Record<string, any>>;
  getTrends: (metric: string) => Promise<Record<string, any>>;

  // Conflict detection and resolution
  detectConflicts: (
    request: ConflictDetectionRequest
  ) => Promise<ConflictDetectionResponse[]>;
  resolveConflict: (conflictId: string, resolution: string) => Promise<boolean>;
  getActiveConflicts: () => Promise<ConflictDetectionResponse[]>;

  // Integration endpoint management
  createEndpoint: (
    request: CreateIntegrationEndpointRequest
  ) => Promise<IntegrationEndpointResponse | null>;
  testEndpoint: (endpointId: string) => Promise<boolean>;
  getEndpoints: () => Promise<IntegrationEndpointResponse[]>;

  // Service registry operations
  registerService: (request: ServiceRegistrationRequest) => Promise<boolean>;
  getRegisteredServices: () => Promise<ServiceRegistryResponse[]>;
  sendHeartbeat: (serviceId: string) => Promise<boolean>;

  // Integration job management
  createJob: (
    request: CreateIntegrationJobRequest
  ) => Promise<IntegrationJobResponse | null>;
  executeJob: (jobId: string) => Promise<boolean>;
  scheduleJob: (jobId: string, schedule: string) => Promise<boolean>;

  // Real-time operations
  enableRealTime: () => void;
  disableRealTime: () => void;
  subscribeToEvents: (eventTypes: IntegrationEventType[]) => void;
  unsubscribeFromEvents: () => void;

  // Utility operations
  refresh: () => Promise<void>;
  reset: () => void;
  exportData: () => Promise<Blob>;
}

export interface CrossGroupIntegrationHookConfig {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealTime?: boolean;
  searchOptions?: {
    maxResults?: number;
    includeHistory?: boolean;
    enableAutoComplete?: boolean;
  };
  syncOptions?: {
    maxConcurrentJobs?: number;
    defaultTimeout?: number;
    retryAttempts?: number;
  };
  healthOptions?: {
    checkInterval?: number;
    alertThresholds?: Record<string, number>;
    enableAutoHealing?: boolean;
  };
  analyticsOptions?: {
    enableTrending?: boolean;
    retentionDays?: number;
    insightLevel?: "basic" | "advanced" | "expert";
  };
}

// ============================================================================
// MAIN CROSS-GROUP INTEGRATION HOOK
// ============================================================================

export function useCrossGroupIntegration(
  config: CrossGroupIntegrationHookConfig = {}
) {
  // State management
  const [state, setState] = useState<CrossGroupIntegrationHookState>({
    loading: false,
    error: null,
    operationInProgress: null,
    searchResults: null,
    searchHistory: [],
    activeSearch: null,
    searchLoading: false,
    resourceLinks: [],
    linkingInProgress: false,
    linkingErrors: {},
    dependencyMap: null,
    dependencyLoading: false,
    dependencyConflicts: [],
    syncJobs: [],
    activeSyncJobs: [],
    syncProgress: {},
    syncErrors: {},
    integrationHealth: null,
    groupStatuses: {},
    healthMetrics: {},
    healthAlerts: [],
    analytics: null,
    analyticsLoading: false,
    insights: {},
    trends: {},
    conflicts: [],
    conflictResolution: {},
    activeConflicts: 0,
    endpoints: [],
    endpointTests: {},
    endpointHealth: {},
    registeredServices: [],
    serviceHealth: {},
    serviceMetrics: {},
    integrationJobs: [],
    jobExecutions: {},
    jobSchedules: {},
    realTimeEnabled: config.enableRealTime ?? false,
    connectionStatus: "disconnected",
    lastUpdate: null,
    eventLog: [],
  });

  // Refs for cleanup and state management
  const wsRef = useRef<WebSocket | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const healthCheckRef = useRef<NodeJS.Timeout | null>(null);
  const eventHandlersRef = useRef<
    Map<IntegrationEventType, IntegrationEventHandler>
  >(new Map());

  // Update state helper
  const updateState = useCallback(
    (updates: Partial<CrossGroupIntegrationHookState>) => {
      setState((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  // Error handling
  const handleError = useCallback(
    (error: unknown, operation: string) => {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error(`Cross-group integration error in ${operation}:`, error);
      updateState({
        error: errorMessage,
        loading: false,
        operationInProgress: null,
      });
    },
    [updateState]
  );

  // Cross-group search operations
  const searchCrossGroups = useCallback(
    async (
      request: CrossGroupSearchRequest
    ): Promise<CrossGroupSearchResponse | null> => {
      try {
        updateState({
          searchLoading: true,
          error: null,
          activeSearch: request,
        });

        const response = await crossGroupIntegrationAPI.searchCrossGroups(
          request
        );

        updateState({
          searchResults: response,
          searchHistory: [...state.searchHistory, request].slice(-10), // Keep last 10 searches
          searchLoading: false,
          activeSearch: null,
        });

        return response;
      } catch (error) {
        handleError(error, "searchCrossGroups");
        updateState({ searchLoading: false, activeSearch: null });
        return null;
      }
    },
    [state.searchHistory, updateState, handleError]
  );

  // Resource linking operations
  const linkResources = useCallback(
    async (
      request: ResourceLinkRequest
    ): Promise<ResourceLinkResponse | null> => {
      try {
        updateState({ linkingInProgress: true, error: null });

        const response = await crossGroupIntegrationAPI.linkResources(request);

        if (response) {
          updateState({
            resourceLinks: [...state.resourceLinks, response],
            linkingInProgress: false,
          });
        }

        return response;
      } catch (error) {
        handleError(error, "linkResources");
        updateState({ linkingInProgress: false });
        return null;
      }
    },
    [state.resourceLinks, updateState, handleError]
  );

  // Dependency management operations
  const mapDependencies = useCallback(
    async (
      request: DependencyMappingRequest
    ): Promise<DependencyMappingResponse | null> => {
      try {
        updateState({ dependencyLoading: true, error: null });

        const response = await crossGroupIntegrationAPI.mapDependencies(
          request
        );

        updateState({
          dependencyMap: response,
          dependencyLoading: false,
        });

        return response;
      } catch (error) {
        handleError(error, "mapDependencies");
        updateState({ dependencyLoading: false });
        return null;
      }
    },
    [updateState, handleError]
  );

  // Group synchronization operations
  const startGroupSync = useCallback(
    async (request: GroupSyncRequest): Promise<SyncJobResponse | null> => {
      try {
        updateState({ operationInProgress: "sync", error: null });

        const response = await crossGroupIntegrationAPI.startGroupSync(request);

        if (response) {
          updateState({
            syncJobs: [...state.syncJobs, response],
            activeSyncJobs: [...state.activeSyncJobs, response],
            operationInProgress: null,
          });
        }

        return response;
      } catch (error) {
        handleError(error, "startGroupSync");
        return null;
      }
    },
    [state.syncJobs, state.activeSyncJobs, updateState, handleError]
  );

  // Integration health operations
  const checkIntegrationHealth =
    useCallback(async (): Promise<IntegrationHealthResponse | null> => {
      try {
        const response =
          await crossGroupIntegrationAPI.checkIntegrationHealth();

        updateState({
          integrationHealth: response,
          lastUpdate: new Date().toISOString(),
        });

        return response;
      } catch (error) {
        handleError(error, "checkIntegrationHealth");
        return null;
      }
    }, [updateState, handleError]);

  // Analytics operations
  const generateAnalytics = useCallback(
    async (
      request: CrossGroupAnalyticsRequest
    ): Promise<CrossGroupAnalyticsResponse | null> => {
      try {
        updateState({ analyticsLoading: true, error: null });

        const response = await crossGroupIntegrationAPI.generateAnalytics(
          request
        );

        updateState({
          analytics: response,
          analyticsLoading: false,
        });

        return response;
      } catch (error) {
        handleError(error, "generateAnalytics");
        updateState({ analyticsLoading: false });
        return null;
      }
    },
    [updateState, handleError]
  );

  // Real-time WebSocket setup
  const setupWebSocket = useCallback(() => {
    if (wsRef.current) return;

    try {
      const ws = new WebSocket(
        process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/integration"
      );
      wsRef.current = ws;

      ws.onopen = () => {
        updateState({ connectionStatus: "connected" });
        console.log("Cross-group integration WebSocket connected");
      };

      ws.onmessage = (event) => {
        try {
          const integrationEvent: IntegrationEvent = JSON.parse(event.data);

          // Update event log
          updateState((prev) => ({
            eventLog: [...prev.eventLog.slice(-99), integrationEvent], // Keep last 100 events
            lastUpdate: new Date().toISOString(),
          }));

          // Handle specific event types
          const handler = eventHandlersRef.current.get(integrationEvent.type);
          if (handler) {
            handler(integrationEvent);
          }

          // Update relevant state based on event type
          switch (integrationEvent.type) {
            case IntegrationEventType.SYNC_PROGRESS:
              updateState((prev) => ({
                syncProgress: {
                  ...prev.syncProgress,
                  [integrationEvent.data.jobId]: integrationEvent.data.progress,
                },
              }));
              break;
            case IntegrationEventType.HEALTH_UPDATE:
              updateState((prev) => ({
                groupStatuses: {
                  ...prev.groupStatuses,
                  [integrationEvent.data.groupId]: integrationEvent.data.status,
                },
              }));
              break;
            case IntegrationEventType.CONFLICT_DETECTED:
              updateState((prev) => ({
                conflicts: [...prev.conflicts, integrationEvent.data],
                activeConflicts: prev.activeConflicts + 1,
              }));
              break;
          }
        } catch (error) {
          console.error(
            "Error processing integration WebSocket message:",
            error
          );
        }
      };

      ws.onclose = () => {
        updateState({ connectionStatus: "disconnected" });
        wsRef.current = null;
        console.log("Cross-group integration WebSocket disconnected");
      };

      ws.onerror = (error) => {
        console.error("Cross-group integration WebSocket error:", error);
        updateState({ connectionStatus: "disconnected" });
      };
    } catch (error) {
      console.error(
        "Failed to setup cross-group integration WebSocket:",
        error
      );
      updateState({ connectionStatus: "disconnected" });
    }
  }, [updateState]);

  // Enable real-time updates
  const enableRealTime = useCallback(() => {
    updateState({ realTimeEnabled: true, connectionStatus: "connecting" });
    setupWebSocket();
  }, [updateState, setupWebSocket]);

  // Disable real-time updates
  const disableRealTime = useCallback(() => {
    updateState({ realTimeEnabled: false, connectionStatus: "disconnected" });
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, [updateState]);

  // Subscribe to events
  const subscribeToEvents = useCallback(
    (eventTypes: IntegrationEventType[]) => {
      eventTypes.forEach((eventType) => {
        eventHandlersRef.current.set(eventType, (event: IntegrationEvent) => {
          console.log(`Received integration event: ${eventType}`, event);
        });
      });
    },
    []
  );

  // Auto-refresh setup
  useEffect(() => {
    if (config.autoRefresh && config.refreshInterval) {
      refreshIntervalRef.current = setInterval(() => {
        checkIntegrationHealth();
      }, config.refreshInterval);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [config.autoRefresh, config.refreshInterval, checkIntegrationHealth]);

  // Health check setup
  useEffect(() => {
    if (config.healthOptions?.checkInterval) {
      healthCheckRef.current = setInterval(() => {
        checkIntegrationHealth();
      }, config.healthOptions.checkInterval);
    }

    return () => {
      if (healthCheckRef.current) {
        clearInterval(healthCheckRef.current);
      }
    };
  }, [config.healthOptions?.checkInterval, checkIntegrationHealth]);

  // Initial setup
  useEffect(() => {
    if (config.enableRealTime) {
      enableRealTime();
    }

    // Initial health check
    checkIntegrationHealth();

    return () => {
      disableRealTime();
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (healthCheckRef.current) {
        clearInterval(healthCheckRef.current);
      }
    };
  }, []);

  // Additional operations
  const operations: CrossGroupIntegrationHookOperations = {
    // Search operations
    searchCrossGroups,
    clearSearchResults: () => updateState({ searchResults: null }),
    getSearchHistory: () => state.searchHistory,

    // Resource linking operations
    linkResources,
    linkCrossGroupResource: async (params: {
      sourceResourceId: string;
      sourceGroup: string;
      targetGroup: string;
      linkType: string;
      configuration: Record<string, any>;
      syncSettings: Record<string, any>;
    }) => {
      try {
        const result = await crossGroupIntegrationAPI.linkCrossGroupResource(
          params
        );
        if (result.success) {
          updateState({
            resourceLinks: [...state.resourceLinks, result.link],
          });
        }
        return result;
      } catch (error) {
        handleError(error, "linkCrossGroupResource");
        return { success: false, error: "Failed to link cross-group resource" };
      }
    },
    unlinkCrossGroupResource: async (
      resourceId: string,
      targetGroup: string
    ) => {
      try {
        const result = await crossGroupIntegrationAPI.unlinkCrossGroupResource(
          resourceId,
          targetGroup
        );
        if (result.success) {
          updateState({
            resourceLinks: state.resourceLinks.filter(
              (link) =>
                !(
                  link.sourceResourceId === resourceId &&
                  link.targetGroup === targetGroup
                )
            ),
          });
        }
        return result;
      } catch (error) {
        handleError(error, "unlinkCrossGroupResource");
        return {
          success: false,
          error: "Failed to unlink cross-group resource",
        };
      }
    },
    unlinkResources: async (linkId: string) => {
      try {
        await crossGroupIntegrationAPI.unlinkResources(linkId);
        updateState({
          resourceLinks: state.resourceLinks.filter(
            (link) => link.id !== linkId
          ),
        });
        return true;
      } catch (error) {
        handleError(error, "unlinkResources");
        return false;
      }
    },
    getResourceLinks: async (resourceId?: string) => {
      try {
        const links = await crossGroupIntegrationAPI.getResourceLinks(
          resourceId
        );
        updateState({ resourceLinks: links });
        return links;
      } catch (error) {
        handleError(error, "getResourceLinks");
        return [];
      }
    },

    // Dependency operations
    mapDependencies,
    validateDependencies: async (groupId: string) => {
      try {
        return await crossGroupIntegrationAPI.validateDependencies(groupId);
      } catch (error) {
        handleError(error, "validateDependencies");
        return false;
      }
    },
    resolveDependencyConflicts: async (conflicts: string[]) => {
      try {
        return await crossGroupIntegrationAPI.resolveDependencyConflicts(
          conflicts
        );
      } catch (error) {
        handleError(error, "resolveDependencyConflicts");
        return false;
      }
    },

    // Sync operations
    startGroupSync,
    monitorSyncProgress: async (jobId: string) => {
      try {
        return await crossGroupIntegrationAPI.monitorSyncProgress(jobId);
      } catch (error) {
        handleError(error, "monitorSyncProgress");
        return null;
      }
    },
    cancelSync: async (jobId: string) => {
      try {
        const result = await crossGroupIntegrationAPI.cancelSync(jobId);
        if (result) {
          updateState({
            activeSyncJobs: state.activeSyncJobs.filter(
              (job) => job.id !== jobId
            ),
          });
        }
        return result;
      } catch (error) {
        handleError(error, "cancelSync");
        return false;
      }
    },

    // Health operations
    checkIntegrationHealth,
    getGroupHealth: async (groupId: string) => {
      try {
        return await crossGroupIntegrationAPI.getGroupHealth(groupId);
      } catch (error) {
        handleError(error, "getGroupHealth");
        return SystemStatus.FAILED;
      }
    },
    refreshHealthMetrics: async () => {
      await checkIntegrationHealth();
    },

    // Analytics operations
    generateAnalytics,
    getInsights: async (timeRange?: string) => {
      try {
        return await crossGroupIntegrationAPI.getInsights(timeRange);
      } catch (error) {
        handleError(error, "getInsights");
        return {};
      }
    },
    getTrends: async (metric: string) => {
      try {
        return await crossGroupIntegrationAPI.getTrends(metric);
      } catch (error) {
        handleError(error, "getTrends");
        return {};
      }
    },

    // Conflict operations
    detectConflicts: async (request: ConflictDetectionRequest) => {
      try {
        const conflicts = await crossGroupIntegrationAPI.detectConflicts(
          request
        );
        updateState({ conflicts });
        return conflicts;
      } catch (error) {
        handleError(error, "detectConflicts");
        return [];
      }
    },
    resolveConflict: async (conflictId: string, resolution: string) => {
      try {
        const result = await crossGroupIntegrationAPI.resolveConflict(
          conflictId,
          resolution
        );
        if (result) {
          updateState({
            conflicts: state.conflicts.filter((c) => c.id !== conflictId),
            activeConflicts: Math.max(0, state.activeConflicts - 1),
          });
        }
        return result;
      } catch (error) {
        handleError(error, "resolveConflict");
        return false;
      }
    },
    getActiveConflicts: async () => {
      try {
        const conflicts = await crossGroupIntegrationAPI.getActiveConflicts();
        updateState({ conflicts, activeConflicts: conflicts.length });
        return conflicts;
      } catch (error) {
        handleError(error, "getActiveConflicts");
        return [];
      }
    },

    // Endpoint operations
    createEndpoint: async (request: CreateIntegrationEndpointRequest) => {
      try {
        const endpoint =
          await crossGroupIntegrationAPI.createIntegrationEndpoint(request);
        if (endpoint) {
          updateState({
            endpoints: [...state.endpoints, endpoint],
          });
        }
        return endpoint;
      } catch (error) {
        handleError(error, "createEndpoint");
        return null;
      }
    },
    testEndpoint: async (endpointId: string) => {
      try {
        const result = await crossGroupIntegrationAPI.testIntegrationEndpoint(
          endpointId
        );
        updateState({
          endpointTests: { ...state.endpointTests, [endpointId]: result },
        });
        return result;
      } catch (error) {
        handleError(error, "testEndpoint");
        return false;
      }
    },
    getEndpoints: async () => {
      try {
        const endpoints =
          await crossGroupIntegrationAPI.getIntegrationEndpoints();
        updateState({ endpoints });
        return endpoints;
      } catch (error) {
        handleError(error, "getEndpoints");
        return [];
      }
    },

    // Service registry operations
    registerService: async (request: ServiceRegistrationRequest) => {
      try {
        return await crossGroupIntegrationAPI.registerService(request);
      } catch (error) {
        handleError(error, "registerService");
        return false;
      }
    },
    getRegisteredServices: async () => {
      try {
        const services = await crossGroupIntegrationAPI.getRegisteredServices();
        updateState({ registeredServices: services });
        return services;
      } catch (error) {
        handleError(error, "getRegisteredServices");
        return [];
      }
    },
    sendHeartbeat: async (serviceId: string) => {
      try {
        return await crossGroupIntegrationAPI.sendServiceHeartbeat(serviceId);
      } catch (error) {
        handleError(error, "sendHeartbeat");
        return false;
      }
    },

    // Job operations
    createJob: async (request: CreateIntegrationJobRequest) => {
      try {
        const job = await crossGroupIntegrationAPI.createIntegrationJob(
          request
        );
        if (job) {
          updateState({
            integrationJobs: [...state.integrationJobs, job],
          });
        }
        return job;
      } catch (error) {
        handleError(error, "createJob");
        return null;
      }
    },
    executeJob: async (jobId: string) => {
      try {
        return await crossGroupIntegrationAPI.executeIntegrationJob(jobId);
      } catch (error) {
        handleError(error, "executeJob");
        return false;
      }
    },
    scheduleJob: async (jobId: string, schedule: string) => {
      try {
        const result = await crossGroupIntegrationAPI.scheduleIntegrationJob(
          jobId,
          schedule
        );
        if (result) {
          updateState({
            jobSchedules: { ...state.jobSchedules, [jobId]: schedule },
          });
        }
        return result;
      } catch (error) {
        handleError(error, "scheduleJob");
        return false;
      }
    },

    // Real-time operations
    enableRealTime,
    disableRealTime,
    subscribeToEvents,
    unsubscribeFromEvents: () => {
      eventHandlersRef.current.clear();
    },

    // Utility operations
    refresh: async () => {
      await checkIntegrationHealth();
    },
    reset: () => {
      setState({
        loading: false,
        error: null,
        operationInProgress: null,
        searchResults: null,
        searchHistory: [],
        activeSearch: null,
        searchLoading: false,
        resourceLinks: [],
        linkingInProgress: false,
        linkingErrors: {},
        dependencyMap: null,
        dependencyLoading: false,
        dependencyConflicts: [],
        syncJobs: [],
        activeSyncJobs: [],
        syncProgress: {},
        syncErrors: {},
        integrationHealth: null,
        groupStatuses: {},
        healthMetrics: {},
        healthAlerts: [],
        analytics: null,
        analyticsLoading: false,
        insights: {},
        trends: {},
        conflicts: [],
        conflictResolution: {},
        activeConflicts: 0,
        endpoints: [],
        endpointTests: {},
        endpointHealth: {},
        registeredServices: [],
        serviceHealth: {},
        serviceMetrics: {},
        integrationJobs: [],
        jobExecutions: {},
        jobSchedules: {},
        realTimeEnabled: false,
        connectionStatus: "disconnected",
        lastUpdate: null,
        eventLog: [],
      });
    },
    exportData: async () => {
      const data = {
        state,
        timestamp: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      return blob;
    },
  };

  // Memoized return value
  // Compatibility methods expected by UI components (e.g., AppSidebar)
  const refreshSPAStatus = useCallback(() => {
    // Refresh integration health metrics (SPA statuses)
    operations.refreshHealthMetrics();
  }, [operations]);

  const getExistingSPAStatus = useCallback(
    (spaKey: string) => {
      return state.groupStatuses?.[spaKey] ?? (SystemStatus as any)?.UNKNOWN ?? 'unknown';
    },
    [state.groupStatuses]
  );

  const getAllGroupsStatus = useCallback(() => {
    return state.groupStatuses || {};
  }, [state.groupStatuses]);

  const coordinateNavigation = useCallback(
    async (spaKey: string, _options?: Record<string, any>) => {
      // Placeholder for cross-group coordinated navigation hooks/integration
      // Intentionally lightweight to keep UI responsive
      try {
        // Could emit an integration event here if backend supports it
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  const navigateToSPA = useCallback(async (spaKey: string) => {
    // No-op helper kept for API compatibility
    return !!spaKey;
  }, []);

  return useMemo(
    () => ({
      state,
      operations,
      config,
      // Aliases and helpers expected by consumers
      crossGroupState: state,
      refreshSPAStatus,
      getExistingSPAStatus,
      getAllGroupsStatus,
      coordinateNavigation,
      navigateToSPA,
    }),
    [state, operations, config, refreshSPAStatus, getExistingSPAStatus, getAllGroupsStatus, coordinateNavigation, navigateToSPA]
  );
}

export default useCrossGroupIntegration;
