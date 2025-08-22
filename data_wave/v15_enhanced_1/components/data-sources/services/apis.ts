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
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

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
// DATA SOURCE CRUD OPERATIONS
// ============================================================================

export const getDataSources = async (filters: DataSourceFilters = {}): Promise<DataSource[]> => {
  const params = new URLSearchParams();
  if (filters.type && filters.type !== 'all') params.append('type', filters.type);
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  if (filters.location && filters.location !== 'all') params.append('location', filters.location);
  if (filters.environment && filters.environment !== 'all') params.append('environment', filters.environment);
  if (filters.criticality && filters.criticality !== 'all') params.append('criticality', filters.criticality);
  if (filters.owner && filters.owner !== 'all') params.append('owner', filters.owner);
  if (filters.team && filters.team !== 'all') params.append('team', filters.team);
  if (filters.cloud_provider) params.append('cloud_provider', filters.cloud_provider);
  if (filters.monitoring_enabled !== undefined) params.append('monitoring_enabled', filters.monitoring_enabled.toString());
  if (filters.backup_enabled !== undefined) params.append('backup_enabled', filters.backup_enabled.toString());
  if (filters.encryption_enabled !== undefined) params.append('encryption_enabled', filters.encryption_enabled.toString());
  
  const { data } = await api.get(`/scan/data-sources?${params.toString()}`);
  return data;
};

export const getDataSourceById = async (dataSourceId: number): Promise<DataSource> => {
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

// ============================================================================
// DATA SOURCE MONITORING & HEALTH
// ============================================================================

export const getDataSourceStats = async (dataSourceId: number): Promise<DataSourceStats> => {
  const { data } = await api.get(`/scan/data-sources/${dataSourceId}/stats`);
  return data;
};

export const getDataSourceHealth = async (dataSourceId: number): Promise<DataSourceHealth> => {
  const { data } = await api.get(`/scan/data-sources/${dataSourceId}/health`);
  return data;
};

export const testDataSourceConnection = async (dataSourceId: number): Promise<ConnectionTestResult> => {
  const { data } = await api.post(`/scan/data-sources/${dataSourceId}/test-connection`);
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
    queryFn: () => getDataSourceById(dataSourceId),
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

export const getDiscoveryHistory = async (dataSourceId: number, limit: number = 10) => {
  const { data } = await api.get(`/data-discovery/data-sources/${dataSourceId}/discovery-history?limit=${limit}`);
  return data;
};

export const discoverSchema = async (request: SchemaDiscoveryRequest) => {
  const { data } = await api.post('/data-discovery/discover-schema', request);
  return data;
};

export const previewTable = async (request: TablePreviewRequest) => {
  const { data } = await api.post('/data-discovery/preview-table', request);
  return data;
};

export const profileColumn = async (request: ColumnProfileRequest) => {
  const { data } = await api.post('/data-discovery/profile-column', request);
  return data;
};

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

export const getConnectionPoolStats = async (dataSourceId: number) => {
  const { data } = await api.get(`/scan/data-sources/${dataSourceId}/connection-pool-stats`);
  return data;
};

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

export const getScanResults = async (dataSourceId: number, limit: number = 10) => {
  const { data } = await api.get(`/scan/data-sources/${dataSourceId}/scan-results?limit=${limit}`);
  return data;
};

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

export const getQualityMetrics = async (dataSourceId: number) => {
  const { data } = await api.get(`/scan/data-sources/${dataSourceId}/quality-metrics`);
  return data;
};

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

export const getGrowthMetrics = async (dataSourceId: number) => {
  const { data } = await api.get(`/scan/data-sources/${dataSourceId}/growth-metrics`);
  return data;
};

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

export const getUserWorkspaces = async (dataSourceId: number) => {
  const { data } = await api.get(`/data-discovery/data-sources/${dataSourceId}/workspaces`);
  return data;
};

export const saveWorkspace = async (dataSourceId: number, workspaceData: any) => {
  const { data } = await api.post(`/data-discovery/data-sources/${dataSourceId}/save-workspace`, workspaceData);
  return data;
};

export const useWorkspaceQuery = (options = {}) => {
  return useQuery({
    queryKey: ['workspace'],
    queryFn: async () => {
      const { data } = await api.get('/workspace');
      return data;
    },
    ...options,
  })
}

export const useUserWorkspacesQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['user-workspaces', dataSourceId],
    queryFn: () => getUserWorkspaces(dataSourceId),
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
      const { data } = await api.get(`/scan/data-sources/${dataSourceId}/compliance`)
      return data
    },
    enabled: !!dataSourceId,
    ...options,
  })
}

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
      const { data } = await api.get('/auth/me')
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
      const { data } = await api.get('/notifications')
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
      const { data } = await api.get('/scan/schedules')
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
      const { data } = await api.get('/audit-logs')
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
      const { data } = await api.get('/auth/permissions')
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