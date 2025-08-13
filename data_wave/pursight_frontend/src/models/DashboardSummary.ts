/**
 * DashboardSummary model representing the main dashboard overview statistics
 */
export interface DashboardSummary {
  // General statistics
  totalDataSources: number;
  activeDataSources: number;
  totalEntities: number;
  entitiesByType: Record<string, number>; // e.g., { 'table': 120, 'column': 1500, ... }
  
  // Scan statistics
  scansLastDay: number;
  scansLastWeek: number;
  scansLastMonth: number;
  successfulScans: number;
  failedScans: number;
  scanSuccessRate: number; // Percentage
  lastScanTime?: string;
  nextScheduledScan?: string;
  
  // Classification and sensitivity
  classifiedEntities: number;
  classificationCoverage: number; // Percentage
  sensitiveEntities: number;
  sensitivityByLabel: Record<string, number>; // e.g., { 'PII': 50, 'Confidential': 30, ... }
  
  // Compliance
  complianceScore: number; // Overall compliance score (percentage)
  openComplianceIssues: number;
  criticalComplianceIssues: number;
  resolvedComplianceIssues: number;
  
  // Data quality
  dataQualityScore: number; // Overall data quality score (percentage)
  dataQualityIssues: number;
  
  // Usage statistics
  topQueriedEntities: Array<{
    id: string;
    name: string;
    type: string;
    queryCount: number;
  }>;
  totalUsers: number;
  activeUsers: number;
  
  // System health
  systemStatus: 'healthy' | 'degraded' | 'maintenance';
  apiResponseTime: number; // in ms
  storageUsage: {
    used: number; // in bytes
    total: number; // in bytes
    percentage: number;
  };
  
  // Time-based information
  lastUpdated: string;
  timeRange: {
    start: string;
    end: string;
  };
  
  // Growth metrics
  growth: {
    entities: number; // Percentage growth
    scans: number;
    users: number;
    dataVolume: number;
  };
}

/**
 * Dashboard widget configuration
 */
export interface DashboardWidget {
  id: string;
  type: string; // Widget type identifier
  title: string;
  description?: string;
  size: 'small' | 'medium' | 'large' | 'full';
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: Record<string, any>; // Widget-specific configuration
  dataSource?: {
    type: 'api' | 'static' | 'function';
    source: string; // API endpoint, static data reference, or function name
    refreshInterval?: number; // in seconds
    parameters?: Record<string, any>;
  };
  permissions?: string[]; // Required permissions to view this widget
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

/**
 * Dashboard layout configuration
 */
export interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  widgets: DashboardWidget[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isSystem: boolean; // Whether this is a system-provided layout
  isShared: boolean; // Whether this layout is shared with other users
  permissions?: {
    viewUsers: string[];
    editUsers: string[];
  };
}

/**
 * Dashboard filter state
 */
export interface DashboardFilter {
  timeRange: {
    type: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
    start?: string; // For custom time range
    end?: string; // For custom time range
  };
  dataSourceIds?: string[];
  entityTypes?: string[];
  tags?: string[];
  sensitivityLabels?: string[];
  owners?: string[];
  searchText?: string;
  [key: string]: any; // Additional custom filters
}