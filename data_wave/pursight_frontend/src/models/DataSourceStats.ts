/**
 * DataSourceStats model representing statistics for data sources
 */
export interface DataSourceStats {
  // General statistics
  totalDataSources: number;
  activeDataSources: number;
  inactiveDataSources: number;
  dataSourcesByType: Record<string, number>; // e.g., { 'mysql': 5, 'postgresql': 3, ... }
  dataSourcesByStatus: {
    active: number;
    inactive: number;
    error: number;
    pending: number;
  };
  
  // Connection statistics
  connectionSuccessRate: number; // Percentage
  averageConnectionTime: number; // in ms
  connectionFailures: number;
  connectionFailuresByReason: Record<string, number>; // e.g., { 'auth_failure': 3, 'timeout': 2, ... }
  
  // Entity statistics
  totalEntities: number;
  entitiesByDataSource: Record<string, number>; // Data source ID to entity count
  entitiesByType: Record<string, number>; // e.g., { 'table': 120, 'column': 1500, ... }
  
  // Size statistics
  totalDataSize: number; // in bytes
  dataSizeByDataSource: Record<string, number>; // Data source ID to size in bytes
  largestDataSources: Array<{
    id: string;
    name: string;
    type: string;
    size: number; // in bytes
  }>;
  
  // Growth statistics
  growthRate: number; // Percentage growth in entities
  newEntitiesLastDay: number;
  newEntitiesLastWeek: number;
  newEntitiesLastMonth: number;
  
  // Usage statistics
  mostQueriedDataSources: Array<{
    id: string;
    name: string;
    type: string;
    queryCount: number;
  }>;
  
  // Health statistics
  healthStatus: {
    healthy: number;
    warning: number;
    error: number;
    unknown: number;
  };
  dataSourcesNeedingAttention: Array<{
    id: string;
    name: string;
    type: string;
    issue: string;
    severity: 'high' | 'medium' | 'low';
  }>;
  
  // Time-based information
  lastUpdated: string;
  timeRange: {
    start: string;
    end: string;
  };
}

/**
 * Individual data source statistics
 */
export interface SingleDataSourceStats {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error' | 'pending';
  
  // Connection statistics
  connectionSuccessRate: number; // Percentage
  lastSuccessfulConnection?: string;
  lastConnectionAttempt?: string;
  averageConnectionTime: number; // in ms
  connectionFailures: number;
  connectionFailureReasons?: string[];
  
  // Entity statistics
  totalEntities: number;
  entitiesByType: Record<string, number>; // e.g., { 'table': 120, 'column': 1500, ... }
  
  // Size statistics
  totalDataSize: number; // in bytes
  dataSizeByEntityType: Record<string, number>; // Entity type to size in bytes
  
  // Growth statistics
  growthRate: number; // Percentage growth in entities
  newEntitiesLastDay: number;
  newEntitiesLastWeek: number;
  newEntitiesLastMonth: number;
  
  // Usage statistics
  queryCount: number;
  uniqueUsers: number;
  mostQueriedEntities: Array<{
    id: string;
    name: string;
    type: string;
    queryCount: number;
  }>;
  
  // Classification and sensitivity
  classifiedEntities: number;
  classificationCoverage: number; // Percentage
  sensitiveEntities: number;
  sensitivityByLabel: Record<string, number>; // e.g., { 'PII': 50, 'Confidential': 30, ... }
  
  // Compliance
  complianceScore: number; // Overall compliance score (percentage)
  openComplianceIssues: number;
  criticalComplianceIssues: number;
  
  // Time-based information
  lastUpdated: string;
  createdAt: string;
  lastScannedAt?: string;
  nextScheduledScan?: string;
}

/**
 * Data source connection test result
 */
export interface DataSourceConnectionTest {
  dataSourceId: string;
  timestamp: string;
  success: boolean;
  connectionTimeMs: number;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
  warnings?: string[];
}

/**
 * Data source health check
 */
export interface DataSourceHealthCheck {
  dataSourceId: string;
  timestamp: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  checks: Array<{
    name: string;
    status: 'passed' | 'warning' | 'failed' | 'skipped';
    message?: string;
    details?: Record<string, any>;
  }>;
  recommendations?: string[];
}