// React Query hooks for Dashboard Analytics
import axios from './axiosConfig';
import { DashboardSummary } from '../models/DashboardSummary';
import { DataSourceStats } from '../models/DataSourceStats';
import { ScanSummaryStats } from '../models/ScanSummaryStats';
import { MetadataStats } from '../models/MetadataStats';
import { ComplianceStats } from '../models/ComplianceStats';
import { TimeSeriesData } from '../models/TimeSeriesData';

// API prefix for all dashboard endpoints
const DASHBOARD_PREFIX = '/dashboard';

// Common interface for time range and data source filters
interface DashboardQueryParams {
  timeRange: 'day' | 'week' | 'month' | 'quarter' | 'year';
  dataSourceId?: string;
}

// Interface for time series data query parameters
interface TimeSeriesQueryParams extends DashboardQueryParams {
  metrics: ('scans' | 'issues' | 'sensitivity' | 'compliance')[];
}

/**
 * Fetch dashboard summary data
 * @param params Query parameters for filtering
 */
export const fetchDashboardSummary = async (params: DashboardQueryParams): Promise<DashboardSummary> => {
  try {
    const { data } = await axios.get(`${DASHBOARD_PREFIX}/summary`, { params });
    return data;
  } catch (error) {
    console.error('Failed to fetch dashboard summary:', error);
    // Return default empty data structure
    return {
      totalDataSources: 0,
      totalScans: 0,
      totalIssues: 0,
      sensitivityCoverage: 0,
      complianceScore: 0,
      recentActivity: [],
      lastUpdated: new Date().toISOString()
    };
  }
};

/**
 * Fetch data source statistics
 * @param params Query parameters for filtering
 */
export const fetchDataSourceStats = async (params: DashboardQueryParams): Promise<DataSourceStats[]> => {
  try {
    const { data } = await axios.get(`${DASHBOARD_PREFIX}/data-sources`, { params });
    return data;
  } catch (error) {
    console.error('Failed to fetch data source statistics:', error);
    return [];
  }
};

/**
 * Fetch scan summary statistics
 * @param params Query parameters for filtering
 */
export const fetchScanSummaryStats = async (params: DashboardQueryParams): Promise<ScanSummaryStats> => {
  try {
    const { data } = await axios.get(`${DASHBOARD_PREFIX}/scans`, { params });
    return data;
  } catch (error) {
    console.error('Failed to fetch scan summary statistics:', error);
    // Return default empty data structure
    return {
      totalScans: 0,
      successfulScans: 0,
      failedScans: 0,
      inProgressScans: 0,
      scansByType: {},
      scansByStatus: {},
      averageScanDuration: 0,
      lastScanTime: null
    };
  }
};

/**
 * Fetch metadata statistics
 * @param params Query parameters for filtering
 */
export const fetchMetadataStats = async (params: DashboardQueryParams): Promise<MetadataStats> => {
  try {
    const { data } = await axios.get(`${DASHBOARD_PREFIX}/metadata`, { params });
    return data;
  } catch (error) {
    console.error('Failed to fetch metadata statistics:', error);
    // Return default empty data structure
    return {
      totalTables: 0,
      totalColumns: 0,
      totalSchemas: 0,
      sensitivityDistribution: {},
      topSensitiveColumns: [],
      topAccessedTables: [],
      metadataCompleteness: 0
    };
  }
};

/**
 * Fetch compliance statistics
 * @param params Query parameters for filtering
 */
export const fetchComplianceStats = async (params: DashboardQueryParams): Promise<ComplianceStats> => {
  try {
    const { data } = await axios.get(`${DASHBOARD_PREFIX}/compliance`, { params });
    return data;
  } catch (error) {
    console.error('Failed to fetch compliance statistics:', error);
    // Return default empty data structure
    return {
      totalRules: 0,
      passedRules: 0,
      issuesBySeverity: {},
      issuesByType: {},
      topFailingRules: [],
      complianceTrend: []
    };
  }
};

/**
 * Fetch time series data for dashboard charts
 * @param params Query parameters for filtering
 */
export const fetchTimeSeriesData = async (params: TimeSeriesQueryParams): Promise<TimeSeriesData> => {
  try {
    const { data } = await axios.get(`${DASHBOARD_PREFIX}/time-series`, { params });
    return data;
  } catch (error) {
    console.error('Failed to fetch time series data:', error);
    // Return default empty data structure
    return {
      timePoints: [],
      metrics: {},
      interval: params.timeRange
    };
  }
};