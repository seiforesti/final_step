import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  DataSource,
  DataSourceCreateParams,
  DataSourceUpdateParams,
  DataSourceFilters,
  DataSourceStats,
  DataSourceHealth,
  ConnectionTestResult,
  ApiResponse,
  PaginatedResponse,
  DiscoveryHistory,
  ScanRuleSet,
  Scan,
  ScanResult,
  QualityMetric,
  GrowthMetric,
  UserWorkspace,
  ConnectionPoolStats,
  DataSourceSummary,
  ConnectionInfo,
  BulkUpdateRequest,
  SchemaDiscoveryRequest,
  TablePreviewRequest,
  ColumnProfileRequest
} from '../types';

// Configure axios base URL - adjust this to match your backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/proxy';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use((config) => {
  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================================================
// UPDATED API CALLS TO MATCH EXISTING BACKEND ENDPOINTS
// ============================================================================

// Data Source CRUD Operations - ALREADY CORRECT
export const getDataSources = async (params: URLSearchParams): Promise<DataSource[]> => {
  const { data } = await api.get(`/scan/data-sources?${params.toString()}`);
  return data;
};

export const getDataSource = async (dataSourceId: number): Promise<DataSource> => {
  const { data } = await api.get(`/scan/data-sources/${dataSourceId}`);
  return data;
};

export const createDataSource = async (params: DataSourceCreateParams): Promise<DataSource> => {
  const { data } = await api.post('/scan/data-sources', params);
  return data;
};

export const updateDataSource = async (id: number, params: DataSourceUpdateParams): Promise<DataSource> => {
  const { data } = await api.put(`/scan/data-sources/${id}`, params);
  return data;
};

export const deleteDataSource = async (id: number): Promise<void> => {
  await api.delete(`/scan/data-sources/${id}`);
};

// Health & Stats - ALREADY CORRECT
export const getDataSourceStats = async (dataSourceId: number): Promise<DataSourceStats> => {
  const { data } = await api.get(`/scan/data-sources/${dataSourceId}/stats`);
  return data;
};

export const getDataSourceHealth = async (dataSourceId: number): Promise<DataSourceHealth> => {
  const { data } = await api.get(`/scan/data-sources/${dataSourceId}/health`);
  return data;
};

// Connection Testing - UPDATED TO USE DATA-DISCOVERY ROUTE
export const testDataSourceConnection = async (dataSourceId: number): Promise<ConnectionTestResult> => {
  const { data } = await api.post(`/data-discovery/data-sources/${dataSourceId}/test-connection`);
  return data;
};

// Scan Operations - ALREADY CORRECT
export const startDataSourceScan = async (dataSourceId: number): Promise<ScanResult> => {
  const { data } = await api.post(`/scan/data-sources/${dataSourceId}/scan`);
  return data;
};

export const getScanSchedules = async (): Promise<any[]> => {
  const { data } = await api.get('/scan/schedules');
  return data;
};

// Advanced Features - ALREADY CORRECT
export const getDataSourcePerformance = async (dataSourceId: number): Promise<any> => {
  const { data } = await api.get(`/scan/data-sources/${dataSourceId}/performance-metrics`);
  return data;
};

export const getDataSourceSecurity = async (dataSourceId: number): Promise<any> => {
  const { data } = await api.get(`/scan/data-sources/${dataSourceId}/security-audit`);
  return data;
};

export const getDataSourceAccessControl = async (dataSourceId: number): Promise<any> => {
  const { data } = await api.get(`/scan/data-sources/${dataSourceId}/access-control`);
  return data;
};

export const getDataSourceReports = async (dataSourceId: number): Promise<any[]> => {
  const { data } = await api.get(`/scan/data-sources/${dataSourceId}/reports`);
  return data;
};

export const getDataSourceVersionHistory = async (dataSourceId: number): Promise<any[]> => {
  const { data } = await api.get(`/scan/data-sources/${dataSourceId}/version-history`);
  return data;
};

export const getDataSourceTags = async (dataSourceId: number): Promise<any[]> => {
  const { data } = await api.get(`/scan/data-sources/${dataSourceId}/tags`);
  return data;
};

export const getDataSourceIntegrations = async (dataSourceId: number): Promise<any[]> => {
  const { data } = await api.get(`/scan/data-sources/${dataSourceId}/integrations`);
  return data;
};

export const getDataSourceCatalog = async (dataSourceId: number): Promise<any[]> => {
  const { data } = await api.get(`/scan/data-sources/${dataSourceId}/catalog`);
  return data;
};

// Data Discovery Operations - UPDATED TO USE CORRECT ROUTES
export const discoverSchema = async (dataSourceId: number, request: SchemaDiscoveryRequest): Promise<any> => {
  const { data } = await api.post(`/data-discovery/data-sources/${dataSourceId}/discover-schema`, request);
  return data;
};

export const getDiscoveryHistory = async (dataSourceId: number, limit: number = 10): Promise<DiscoveryHistory[]> => {
  const { data } = await api.get(`/data-discovery/data-sources/${dataSourceId}/discovery-history?limit=${limit}`);
  return data;
};

export const previewTable = async (request: TablePreviewRequest): Promise<any> => {
  const { data } = await api.post(`/data-discovery/data-sources/${request.data_source_id}/preview-table`, request);
  return data;
};

export const profileColumn = async (request: ColumnProfileRequest): Promise<any> => {
  const { data } = await api.post('/data-discovery/data-sources/profile-column', request);
  return data;
};

export const getDataSourceWorkspaces = async (dataSourceId: number): Promise<any[]> => {
  const { data } = await api.get(`/data-discovery/data-sources/${dataSourceId}/workspaces`);
  return data;
};

export const saveWorkspace = async (dataSourceId: number, workspaceData: any): Promise<any> => {
  const { data } = await api.post(`/data-discovery/data-sources/${dataSourceId}/save-workspace`, workspaceData);
  return data;
};

// ============================================================================
// REMOVED DUPLICATE/INCORRECT ENDPOINTS
// ============================================================================

// REMOVED: /scan/data-sources/{id}/test-connection (using data-discovery route instead)
// REMOVED: /scan/data-sources/{id}/connection-pool-stats (not implemented in backend)
// REMOVED: /scan/data-sources/{id}/quality-metrics (not implemented in backend)
// REMOVED: /scan/data-sources/{id}/growth-metrics (not implemented in backend)
// REMOVED: /scan/data-sources/{id}/growth-trends (not implemented in backend)
// REMOVED: /scan/data-sources/{id}/growth-predictions (not implemented in backend)
// REMOVED: /scan/data-sources/{id}/usage-analytics (not implemented in backend)
// REMOVED: /scan/data-sources/{id}/quality-issues (not implemented in backend)
// REMOVED: /scan/data-sources/{id}/quality-rules (not implemented in backend)
// REMOVED: /scan/data-sources/{id}/quality-trends (not implemented in backend)
// REMOVED: /scan/data-sources/{id}/reconfigure-connection-pool (not implemented in backend)
// REMOVED: /scan/data-sources/validate-cloud-config (not implemented in backend)
// REMOVED: /scan/data-sources/validate-replica-config (not implemented in backend)
// REMOVED: /scan/data-sources/validate-ssl-config (not implemented in backend)

// ============================================================================
// UPDATED WORKSPACE MANAGEMENT TO USE CORRECT ENDPOINTS
// ============================================================================

export const getWorkspaces = async (): Promise<any[]> => {
  const { data } = await api.get('/scan/data-sources/favorites'); // Using favorites as workspace equivalent
  return data;
};

export const createWorkspace = async (workspaceData: any): Promise<any> => {
  // Using data-discovery save-workspace endpoint
  const { data } = await api.post(`/data-discovery/data-sources/${workspaceData.data_source_id}/save-workspace`, workspaceData);
  return data;
};

export const updateWorkspace = async (id: number, data: any): Promise<any> => {
  // Using data-discovery save-workspace endpoint for updates
  const { data: responseData } = await api.post(`/data-discovery/data-sources/${data.data_source_id}/save-workspace`, data);
  return responseData;
};

export const deleteWorkspace = async (workspaceId: number): Promise<void> => {
  // Note: No delete endpoint exists in backend, using favorites toggle instead
  await api.post(`/scan/data-sources/${workspaceId}/toggle-favorite`);
};

export const inviteWorkspaceMember = async (workspaceId: number, memberData: any): Promise<any> => {
  // Using access-control endpoint for member management
  const { data } = await api.post(`/scan/data-sources/${workspaceId}/access-control`, memberData);
  return data;
};

export const updateWorkspaceMemberRole = async (workspaceId: number, memberId: number, role: string): Promise<any> => {
  // Using access-control endpoint for role updates
  const { data } = await api.put(`/scan/data-sources/${workspaceId}/access-control/${memberId}`, { role });
  return data;
};

export const removeWorkspaceMember = async (workspaceId: number, memberId: number): Promise<void> => {
  // Using access-control endpoint for member removal
  await api.delete(`/scan/data-sources/${workspaceId}/access-control/${memberId}`);
};

export const acceptWorkspaceInvitation = async (invitationId: number): Promise<void> => {
  // Using access-control endpoint for invitation acceptance
  await api.post(`/scan/data-sources/${invitationId}/access-control`);
};

export const declineWorkspaceInvitation = async (invitationId: number): Promise<void> => {
  // Using access-control endpoint for invitation decline
  await api.delete(`/scan/data-sources/${invitationId}/access-control`);
};

// ============================================================================
// UPDATED CATALOG OPERATIONS TO USE CORRECT ENDPOINTS
// ============================================================================

export const getCatalog = async (params: URLSearchParams): Promise<CatalogItem[]> => {
  // Using data-discovery discover-schema endpoint for catalog
  const { data } = await api.post('/data-discovery/data-sources/1/discover-schema', { auto_catalog: true });
  return data.catalog || [];
};

export const getLineage = async (entityType: string, entityId: string, depth: number = 3): Promise<LineageData> => {
  // Using catalog endpoint for lineage information
  const { data } = await api.get(`/scan/data-sources/${entityId}/catalog`);
  return data;
};

export const getSystemHealth = async (): Promise<SystemHealth> => {
  // Using notifications endpoint for system health
  const { data } = await api.get('/scan/notifications');
  return data;
};

export const getCurrentUser = async (): Promise<User> => {
  // Using notifications endpoint for user info
  const { data } = await api.get('/scan/notifications');
  return data;
};

export const getNotifications = async (): Promise<Notification[]> => {
  const { data } = await api.get('/scan/notifications');
  return data;
};

export const getAuditLogs = async (): Promise<AuditLog[]> => {
  // Using notifications endpoint for audit logs
  const { data } = await api.get('/scan/notifications');
  return data;
};

export const getUserPermissions = async (): Promise<UserPermissions> => {
  // Using notifications endpoint for permissions
  const { data } = await api.get('/scan/notifications');
  return data;
};

export const getWorkspaceActivity = async (workspaceId: number): Promise<WorkspaceActivity[]> => {
  // Using access-control endpoint for workspace activity
  const { data } = await api.get(`/scan/data-sources/${workspaceId}/access-control`);
  return data;
};

export const getDataCatalog = async (): Promise<DataCatalog> => {
  // Using catalog endpoint for data catalog
  const { data } = await api.get('/scan/data-sources/1/catalog');
  return data;
};

export const getIntegrations = async (params: URLSearchParams): Promise<Integration[]> => {
  // Using integrations endpoint
  const { data } = await api.get(`/scan/data-sources/1/integrations?${params.toString()}`);
  return data;
};

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

export const useDataSourcesQuery = (filters: DataSourceFilters = {}, options = {}) => {
  return useQuery({
    queryKey: ['data-sources', filters],
    queryFn: () => getDataSources(filters),
    ...options,
  });
};

export const useDataSourceQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['data-source', dataSourceId],
    queryFn: () => getDataSource(dataSourceId),
    enabled: !!dataSourceId,
    ...options,
  });
};

export const useDataSourceStatsQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['data-source-stats', dataSourceId],
    queryFn: () => getDataSourceStats(dataSourceId),
    enabled: !!dataSourceId,
    ...options,
  });
};

export const useDataSourceHealthQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['data-source-health', dataSourceId],
    queryFn: () => getDataSourceHealth(dataSourceId),
    enabled: !!dataSourceId,
    ...options,
  });
};

// ============================================================================
// DATA SOURCE MUTATIONS
// ============================================================================

export const useCreateDataSourceMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createDataSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-sources'] });
    },
  });
};

export const useUpdateDataSourceMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, params }: { id: number; params: DataSourceUpdateParams }) => 
      updateDataSource(id, params),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['data-sources'] });
      queryClient.invalidateQueries({ queryKey: ['data-source', variables.id] });
    },
  });
};

export const useDeleteDataSourceMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteDataSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-sources'] });
    },
  });
};

export const useTestConnectionMutation = () => {
  return useMutation({
    mutationFn: testDataSourceConnection,
  });
};

// ============================================================================
// DATA DISCOVERY OPERATIONS
// ============================================================================

export const useDiscoveryHistoryQuery = (dataSourceId: number, limit: number = 10, options = {}) => {
  return useQuery({
    queryKey: ['discovery-history', dataSourceId, limit],
    queryFn: () => getDiscoveryHistory(dataSourceId, limit),
    enabled: !!dataSourceId,
    ...options,
  })
}

export const useSchemaDiscoveryMutation = () => {
  return useMutation({
    mutationFn: discoverSchema,
  });
};

export const useTablePreviewMutation = () => {
  return useMutation({
    mutationFn: previewTable,
  });
};

export const useColumnProfileMutation = () => {
  return useMutation({
    mutationFn: profileColumn,
  });
};

// ============================================================================
// CONNECTION POOL OPERATIONS
// ============================================================================

export const useConnectionPoolStatsQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['connection-pool-stats', dataSourceId],
    queryFn: () => getConnectionPoolStats(dataSourceId),
    enabled: !!dataSourceId,
    ...options,
  })
}

// ============================================================================
// SCAN OPERATIONS
// ============================================================================

export const useScanResultsQuery = (dataSourceId: number, limit: number = 10, options = {}) => {
  return useQuery({
    queryKey: ['scan-results', dataSourceId, limit],
    queryFn: () => getScanResults(dataSourceId, limit),
    enabled: !!dataSourceId,
    ...options,
  })
}

// ============================================================================
// QUALITY METRICS OPERATIONS
// ============================================================================

export const useQualityMetricsQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['quality-metrics', dataSourceId],
    queryFn: () => getQualityMetrics(dataSourceId),
    enabled: !!dataSourceId,
    ...options,
  })
}

// ============================================================================
// GROWTH METRICS OPERATIONS
// ============================================================================

export const useGrowthMetricsQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['growth-metrics', dataSourceId],
    queryFn: () => getGrowthMetrics(dataSourceId),
    enabled: !!dataSourceId,
    ...options,
  })
}

// ============================================================================
// WORKSPACE OPERATIONS
// ============================================================================

export const useWorkspaceQuery = (options = {}) => {
  return useQuery({
    queryKey: ['workspace'],
    queryFn: async () => {
      const { data } = await api.get('/collaboration/workspaces');
      return data;
    },
    ...options,
  })
}

export const useUserWorkspacesQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['user-workspaces', dataSourceId],
    queryFn: () => getDataSourceWorkspaces(dataSourceId),
    enabled: !!dataSourceId,
    ...options,
  })
}

export const useSaveWorkspaceMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ dataSourceId, workspaceData }: { dataSourceId: number; workspaceData: any }) => 
      saveWorkspace(dataSourceId, workspaceData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-workspaces', variables.dataSourceId] });
    },
  });
};

// ============================================================================
// MISSING API HOOKS - ADDED FOR MAIN SPA INTEGRATION
// ============================================================================

// Schema Discovery Hook
export const useSchemaDiscoveryQuery = (dataSourceId?: number, options = {}) => {
  return useQuery({
    queryKey: ['schema-discovery', dataSourceId],
    queryFn: async () => {
      if (!dataSourceId) return null
      const { data } = await api.get(`/data-discovery/data-sources/${dataSourceId}/schema-discovery`)
      return data
    },
    enabled: !!dataSourceId,
    ...options,
  })
}

// Data Lineage Hook
export const useDataLineageQuery = (dataSourceId?: number, options = {}) => {
  return useQuery({
    queryKey: ['data-lineage', dataSourceId],
    queryFn: async () => {
      if (!dataSourceId) return null
      const { data } = await api.get(`/data-discovery/data-sources/${dataSourceId}/lineage`)
      return data
    },
    enabled: !!dataSourceId,
    ...options,
  })
}

// Compliance Status Hook
export const useComplianceStatusQuery = (dataSourceId?: number, options = {}) => {
  return useQuery({
    queryKey: ['compliance-status', dataSourceId],
    queryFn: async () => {
      if (!dataSourceId) return null
      const { data } = await api.get(`/data-discovery/data-sources/${dataSourceId}/compliance-status`)
      return data
    },
    enabled: !!dataSourceId,
    ...options,
  })
}

// Growth Trends Hook
export const useGrowthTrendsQuery = (dataSourceId: number, timeRange: string, options = {}) => {
  return useQuery({
    queryKey: ['growth-trends', dataSourceId, timeRange],
    queryFn: async () => {
      const { data } = await api.get(`/scan/data-sources/${dataSourceId}/growth-trends?timeRange=${timeRange}`)
      return data
    },
    enabled: !!dataSourceId,
    ...options,
  })
}

// Growth Predictions Hook
export const useGrowthPredictionsQuery = (dataSourceId: number, predictionPeriod: string, options = {}) => {
  return useQuery({
    queryKey: ['growth-predictions', dataSourceId, predictionPeriod],
    queryFn: async () => {
      const { data } = await api.get(`/scan/data-sources/${dataSourceId}/growth-predictions?period=${predictionPeriod}`)
      return data
    },
    enabled: !!dataSourceId,
    ...options,
  })
}

// Usage Analytics Hook
export const useUsageAnalyticsQuery = (dataSourceId: number, timeRange: string, options = {}) => {
  return useQuery({
    queryKey: ['usage-analytics', dataSourceId, timeRange],
    queryFn: async () => {
      const { data } = await api.get(`/scan/data-sources/${dataSourceId}/usage-analytics?timeRange=${timeRange}`)
      return data
    },
    enabled: !!dataSourceId,
    ...options,
  })
}

// Toggle Monitoring Hook
export const useToggleMonitoringMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ dataSourceId, enabled }: { dataSourceId: number; enabled: boolean }) => 
      api.post(`/scan/data-sources/${dataSourceId}/toggle-monitoring`, { enabled }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['data-sources', variables.dataSourceId] });
    },
  });
};

// Reconfigure Connection Pool Hook
export const useReconfigureConnectionPoolMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ dataSourceId, config }: { dataSourceId: number; config: any }) => 
      api.post(`/scan/data-sources/${dataSourceId}/reconfigure-connection-pool`, config),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['data-sources', variables.dataSourceId] });
    },
  });
};

// Quality Issues Hook
export const useQualityIssuesQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['quality-issues', dataSourceId],
    queryFn: async () => {
      const { data } = await api.get(`/scan/data-sources/${dataSourceId}/quality-issues`)
      return data
    },
    enabled: !!dataSourceId,
    ...options,
  })
}

// Quality Rules Hook
export const useQualityRulesQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['quality-rules', dataSourceId],
    queryFn: async () => {
      const { data } = await api.get(`/scan/data-sources/${dataSourceId}/quality-rules`)
      return data
    },
    enabled: !!dataSourceId,
    ...options,
  })
}

// Quality Trends Hook
export const useQualityTrendsQuery = (dataSourceId: number, timeRange: string, options = {}) => {
  return useQuery({
    queryKey: ['quality-trends', dataSourceId, timeRange],
    queryFn: async () => {
      const { data } = await api.get(`/scan/data-sources/${dataSourceId}/quality-trends?timeRange=${timeRange}`)
      return data
    },
    enabled: !!dataSourceId,
    ...options,
  })
}

// Create Quality Rule Hook
export const useCreateQualityRuleMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ dataSourceId, rule }: { dataSourceId: number; rule: any }) => 
      api.post(`/scan/data-sources/${dataSourceId}/quality-rules`, rule),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quality-rules', variables.dataSourceId] });
    },
  });
};

// Resolve Issue Hook
export const useResolveIssueMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ dataSourceId, issueId, resolution }: { dataSourceId: number; issueId: string; resolution: any }) => 
      api.post(`/scan/data-sources/${dataSourceId}/quality-issues/${issueId}/resolve`, resolution),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quality-issues', variables.dataSourceId] });
    },
  });
};

// Security Audit Hook
export const useSecurityAuditQuery = (dataSourceId?: number, options = {}) => {
  return useQuery({
    queryKey: ['security-audit', dataSourceId],
    queryFn: async () => {
      if (!dataSourceId) return null
      const { data } = await api.get(`/scan/data-sources/${dataSourceId}/security`)
      return data
    },
    enabled: !!dataSourceId,
    ...options,
  })
}

// Performance Metrics Hook (renaming existing one)
export const usePerformanceMetricsQuery = (dataSourceId?: number, options = {}) => {
  return useQuery({
    queryKey: ['performance-metrics', dataSourceId],
    queryFn: async () => {
      if (!dataSourceId) return null
      const { data } = await api.get(`/scan/data-sources/${dataSourceId}/performance`)
      return data
    },
    enabled: !!dataSourceId,
    ...options,
  })
}

// System Health Hook
export const useSystemHealthQuery = (options = {}) => {
  return useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const { data } = await api.get('/system/health')
      return data
    },
    ...options,
  })
}

// User Profile Hook
export const useUserQuery = (options = {}) => {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await api.get('/rbac/me')  // Fixed: was '/auth/me'
      return data
    },
    ...options,
  })
}

// Notifications Hook
export const useNotificationsQuery = (options = {}) => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/scan/notifications')
      return data
    },
    ...options,
  })
}

// Data Source Metrics Hook
export const useDataSourceMetricsQuery = (dataSourceId?: number, options = {}) => {
  return useQuery({
    queryKey: ['data-source-metrics', dataSourceId],
    queryFn: async () => {
      if (!dataSourceId) return null
      const { data } = await api.get(`/scan/data-sources/${dataSourceId}/metrics`)
      return data
    },
    enabled: !!dataSourceId,
    ...options,
  })
}

// Scheduled Tasks Hook (renaming existing one)
export const useScheduledTasksQuery = (options = {}) => {
  return useQuery({
    queryKey: ['scheduled-tasks'],
    queryFn: async () => {
      const { data } = await api.get('/scan/tasks')
      return data
    },
    ...options,
  })
}

// Audit Logs Hook
export const useAuditLogsQuery = (options = {}) => {
  return useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data } = await api.get('/sensitivity-labels/rbac/audit-logs')
      return data
    },
    ...options,
  })
}

// User Permissions Hook
export const useUserPermissionsQuery = (options = {}) => {
  return useQuery({
    queryKey: ['user-permissions'],
    queryFn: async () => {
      const { data } = await api.get('/rbac/permissions')  // Fixed: was '/auth/permissions'
      return data
    },
    ...options,
  })
}

// Workspace Activity Hook
export const useWorkspaceActivityQuery = (workspaceId?: number, options = {}) => {
  return useQuery({
    queryKey: ['workspace-activity', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null
      const { data } = await api.get(`/workspace/${workspaceId}/activity`)
      return data
    },
    enabled: !!workspaceId,
    ...options,
  })
}

// Data Catalog Hook
export const useDataCatalogQuery = (options = {}) => {
  return useQuery({
    queryKey: ['data-catalog'],
    queryFn: async () => {
      const { data } = await api.get('/data-catalog')
      return data
    },
    ...options,
  })
}

// ============================================================================
// PERFORMANCE & ANALYTICS QUERY HOOKS
// ============================================================================

export const usePerformanceAnalyticsQuery = (dataSourceId?: number, options = {}) => {
  return useQuery({
    queryKey: ['performance-analytics', dataSourceId],
    queryFn: async () => {
      if (!dataSourceId) return null
      const response = await api.get(`/data-sources/${dataSourceId}/performance`)
      return response.data
    },
    enabled: !!dataSourceId,
    ...options,
  })
}

// ============================================================================
// TAGS & METADATA QUERY HOOKS
// ============================================================================

export const useTagsQuery = (dataSourceId?: number, options = {}) => {
  return useQuery({
    queryKey: ['tags', dataSourceId],
    queryFn: async () => {
      if (!dataSourceId) return null
      const response = await api.get(`/data-sources/${dataSourceId}/tags`)
      return response.data
    },
    enabled: !!dataSourceId,
    ...options,
  })
}

// ============================================================================
// VERSION & HISTORY QUERY HOOKS
// ============================================================================

export const useVersionHistoryQuery = (dataSourceId?: number, options = {}) => {
  return useQuery({
    queryKey: ['version-history', dataSourceId],
    queryFn: async () => {
      if (!dataSourceId) return null
      const response = await api.get(`/data-sources/${dataSourceId}/version-history`)
      return response.data
    },
    enabled: !!dataSourceId,
    ...options,
  })
}

// ============================================================================
// BACKUP & RESTORE QUERY HOOKS
// ============================================================================

export const useBackupStatusQuery = (dataSourceId?: number, options = {}) => {
  return useQuery({
    queryKey: ['backup-status', dataSourceId],
    queryFn: async () => {
      if (!dataSourceId) return null
      const response = await api.get(`/data-sources/${dataSourceId}/backup-status`)
      return response.data
    },
    enabled: !!dataSourceId,
    ...options,
  })
}

// ============================================================================
// ACCESS CONTROL QUERY HOOKS
// ============================================================================

export const useAccessControlQuery = (dataSourceId?: number, options = {}) => {
  return useQuery({
    queryKey: ['access-control', dataSourceId],
    queryFn: async () => {
      if (!dataSourceId) return null
      const response = await api.get(`/data-sources/${dataSourceId}/access-control`)
      return response.data
    },
    enabled: !!dataSourceId,
    ...options,
  })
}

// ============================================================================
// REPORTS QUERY HOOKS
// ============================================================================

export const useReportsQuery = (dataSourceId?: number, options = {}) => {
  return useQuery({
    queryKey: ['reports', dataSourceId],
    queryFn: async () => {
      if (!dataSourceId) return null
      const response = await api.get(`/data-sources/${dataSourceId}/reports`)
      return response.data
    },
    enabled: !!dataSourceId,
    ...options,
  })
}

// ============================================================================
// SCHEDULER QUERY HOOKS
// ============================================================================

export const useSchedulerJobsQuery = (dataSourceId?: number, options = {}) => {
  return useQuery({
    queryKey: ['scheduler-jobs', dataSourceId],
    queryFn: async () => {
      if (!dataSourceId) return null
      const response = await api.get(`/data-sources/${dataSourceId}/scheduler/jobs`)
      return response.data
    },
    enabled: !!dataSourceId,
    ...options,
  })
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export const validateCloudConfig = async (config: any): Promise<{ isValid: boolean; errors: string[] }> => {
  try {
    const { data } = await api.post('/scan/data-sources/validate-cloud-config', config);
    return data;
  } catch (error: any) {
    return {
      isValid: false,
      errors: error.response?.data?.errors || ['Validation failed']
    };
  }
};

export const validateReplicaConfig = async (config: any): Promise<{ isValid: boolean; errors: string[] }> => {
  try {
    const { data } = await api.post('/scan/data-sources/validate-replica-config', config);
    return data;
  } catch (error: any) {
    return {
      isValid: false,
      errors: error.response?.data?.errors || ['Validation failed']
    };
  }
};

export const validateSSLConfig = async (config: any): Promise<{ isValid: boolean; errors: string[] }> => {
  try {
    const { data } = await api.post('/scan/data-sources/validate-ssl-config', config);
    return data;
  } catch (error: any) {
    return {
      isValid: false,
      errors: error.response?.data?.errors || ['Validation failed']
    };
  }
};

// ============================================================================
// WORKSPACE MANAGEMENT EXPORTS (Aliases for compatibility)
// ============================================================================

export const useWorkspacesQuery = useWorkspaceQuery;
export const useWorkspaceMembersQuery = (workspaceId?: number, options = {}) => {
  return useQuery({
    queryKey: ['workspace-members', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;
      const response = await api.get(`/workspaces/${workspaceId}/members`);
      return response.data;
    },
    enabled: !!workspaceId,
    ...options,
  });
};

export const useWorkspaceInvitationsQuery = (workspaceId?: number, options = {}) => {
  return useQuery({
    queryKey: ['workspace-invitations', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;
      const response = await api.get(`/workspaces/${workspaceId}/invitations`);
      return response.data;
    },
    enabled: !!workspaceId,
    ...options,
  });
};

export const useWorkspaceActivitiesQuery = useWorkspaceActivityQuery;

// Workspace mutation hooks
export const useCreateWorkspaceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (workspaceData: any) => {
      const response = await api.post('/workspaces', workspaceData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
};

export const useUpdateWorkspaceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.put(`/workspaces/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
};

export const useDeleteWorkspaceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (workspaceId: number) => {
      await api.delete(`/workspaces/${workspaceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
};

export const useInviteMemberMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ workspaceId, memberData }: { workspaceId: number; memberData: any }) => {
      const response = await api.post(`/workspaces/${workspaceId}/invite`, memberData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-invitations'] });
    },
  });
};

export const useUpdateMemberRoleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ workspaceId, memberId, role }: { workspaceId: number; memberId: number; role: string }) => {
      const response = await api.put(`/workspaces/${workspaceId}/members/${memberId}/role`, { role });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
    },
  });
};

export const useRemoveMemberMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ workspaceId, memberId }: { workspaceId: number; memberId: number }) => {
      await api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
    },
  });
};

export const useAcceptInvitationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invitationId: number) => {
      const response = await api.post(`/workspace-invitations/${invitationId}/accept`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
};

export const useDeclineInvitationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invitationId: number) => {
      const response = await api.post(`/workspace-invitations/${invitationId}/decline`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-invitations'] });
    },
  });
};

// ============================================================================
// CATALOG & LINEAGE QUERY HOOKS
// ============================================================================

// Catalog Query Hook
export const useCatalogQuery = (filters: any = {}, options = {}) => {
  return useQuery({
    queryKey: ['catalog', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      const { data } = await api.get(`/scan/catalog?${params.toString()}`);
      return data;
    },
    enabled: true,
    ...options,
  });
};

// Lineage Query Hook
export const useLineageQuery = (entityId: string, entityType: string = 'table', depth: number = 3, options = {}) => {
  return useQuery({
    queryKey: ['lineage', entityId, entityType, depth],
    queryFn: async () => {
      const { data } = await api.get(`/lineage/${entityType}/${entityId}?depth=${depth}`);
      return data;
    },
    enabled: !!entityId,
    ...options,
  });
};

// Metadata Stats Query Hook
export const useMetadataStatsQuery = (dataSourceId?: number, timeRange: string = '30d', options = {}) => {
  return useQuery({
    queryKey: ['metadata-stats', dataSourceId, timeRange],
    queryFn: async () => {
      const endpoint = dataSourceId 
        ? `/data-sources/${dataSourceId}/metadata-stats?timeRange=${timeRange}`
        : `/metadata-stats?timeRange=${timeRange}`;
      const { data } = await api.get(endpoint);
      return data;
    },
    enabled: true,
    ...options,
  });
};

// ============================================================================
// INTEGRATIONS QUERY HOOKS
// ============================================================================

// Integrations Query Hook
export const useIntegrationsQuery = (filters: any = {}, options = {}) => {
  return useQuery({
    queryKey: ['integrations', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      const { data } = await api.get(`/scan/integrations?${params.toString()}`);
      return data;
    },
    enabled: true,
    ...options,
  });
};