/**
 * ScanSummaryStats model representing statistics for data scanning operations
 */
export interface ScanSummaryStats {
  // General scan statistics
  totalScans: number;
  successfulScans: number;
  failedScans: number;
  inProgressScans: number;
  cancelledScans: number;
  scanSuccessRate: number; // Percentage
  
  // Time-based scan statistics
  scansLastHour: number;
  scansLastDay: number;
  scansLastWeek: number;
  scansLastMonth: number;
  
  // Duration statistics
  averageScanDuration: number; // in seconds
  fastestScan: number; // in seconds
  slowestScan: number; // in seconds
  totalScanTime: number; // in seconds
  
  // Entity statistics
  totalEntitiesScanned: number;
  entitiesScannedByType: Record<string, number>; // e.g., { 'table': 120, 'column': 1500, ... }
  entitiesAddedByLastScan: number;
  entitiesUpdatedByLastScan: number;
  entitiesRemovedByLastScan: number;
  
  // Data source statistics
  scansByDataSource: Record<string, number>; // Data source ID to scan count
  failuresByDataSource: Record<string, number>; // Data source ID to failure count
  
  // Error statistics
  commonErrors: Array<{
    errorCode: string;
    errorMessage: string;
    occurrences: number;
    affectedDataSources: string[];
  }>;
  
  // Performance statistics
  scanThroughput: number; // Entities per second
  resourceUtilization: {
    cpu: number; // Percentage
    memory: number; // Percentage
    disk: number; // Percentage
    network: number; // Bytes per second
  };
  
  // Recent scans
  recentScans: ScanOperation[];
  
  // Time-based information
  lastUpdated: string;
  timeRange: {
    start: string;
    end: string;
  };
}

/**
 * Individual scan operation details
 */
export interface ScanOperation {
  id: string;
  dataSourceId: string;
  dataSourceName: string;
  dataSourceType: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  scanType: 'full' | 'incremental' | 'metadata_only' | 'custom';
  priority: 'low' | 'normal' | 'high';
  startTime?: string;
  endTime?: string;
  duration?: number; // in seconds
  progress?: number; // Percentage
  
  // Scan results
  entitiesScanned: number;
  entitiesAdded: number;
  entitiesUpdated: number;
  entitiesRemoved: number;
  entitiesWithErrors: number;
  
  // Error information
  error?: {
    code: string;
    message: string;
    details?: string;
  };
  warnings?: string[];
  
  // Performance metrics
  performanceMetrics?: {
    throughput: number; // Entities per second
    cpuUsage: number; // Percentage
    memoryUsage: number; // Percentage
    diskUsage: number; // Percentage
    networkUsage: number; // Bytes per second
  };
  
  // User information
  triggeredBy: string;
  cancelledBy?: string;
  
  // Additional information
  scanParameters?: Record<string, any>; // Scan-specific parameters
  tags?: string[];
  notes?: string;
}

/**
 * Scan schedule configuration
 */
export interface ScanSchedule {
  id: string;
  dataSourceId: string;
  dataSourceName: string;
  enabled: boolean;
  scanType: 'full' | 'incremental' | 'metadata_only' | 'custom';
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom';
  cronExpression?: string; // For custom schedules
  startTime?: string; // For one-time scheduled scans
  priority: 'low' | 'normal' | 'high';
  parameters?: Record<string, any>; // Scan-specific parameters
  lastRun?: {
    id: string;
    status: 'completed' | 'failed' | 'cancelled';
    startTime: string;
    endTime?: string;
  };
  nextRun?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

/**
 * Scan history for a data source
 */
export interface ScanHistory {
  dataSourceId: string;
  dataSourceName: string;
  totalScans: number;
  successfulScans: number;
  failedScans: number;
  scans: Array<{
    id: string;
    status: 'completed' | 'failed' | 'cancelled';
    scanType: 'full' | 'incremental' | 'metadata_only' | 'custom';
    startTime: string;
    endTime?: string;
    duration?: number; // in seconds
    entitiesScanned: number;
    entitiesAdded: number;
    entitiesUpdated: number;
    entitiesRemoved: number;
    triggeredBy: string;
    error?: {
      code: string;
      message: string;
    };
  }>;
  scanTrend: Array<{
    period: string; // e.g., '2023-01-01', '2023-W01', '2023-01'
    scanCount: number;
    successRate: number; // Percentage
    averageDuration: number; // in seconds
  }>;
}