// useAuditLogs Hook - Comprehensive audit trail management, compliance reporting, and forensic analysis
// Maps to backend audit service with enterprise-grade functionality

import { useState, useEffect, useCallback, useMemo } from 'react';
import { auditService } from '../services/audit.service';
import { rbacWebSocketService } from '../services/websocket.service';
import type { AuditLog, AuditLogFilters, AuditLogPagination } from '../types/audit.types';

export interface AuditLogsState {
  auditLogs: AuditLog[];
  totalCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  filters: AuditLogFilters;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  lastUpdated: Date | null;
  alerts: any[];
  policies: any[];
  analytics: any;
}

export interface AuditLogsMethods {
  // Data Loading
  loadAuditLogs: (page?: number) => Promise<void>;
  refreshAuditLogs: () => Promise<void>;
  filterAuditLogs: (filters: AuditLogFilters) => Promise<void>;
  searchAuditLogs: (query: string) => Promise<void>;
  
  // Filtering & Sorting
  setFilters: (filters: Partial<AuditLogFilters>) => void;
  clearFilters: () => void;
  setSorting: (sortBy: string, sortOrder?: 'asc' | 'desc') => void;
  setPagination: (page: number, pageSize?: number) => void;
  
  // Log Operations
  getAuditLogEntry: (logId: string) => Promise<AuditLog | null>;
  getEntityAuditHistory: (entityType: string, entityId: string) => Promise<AuditLog[]>;
  
  // Event-Specific Logs
  getAccessEvents: (timeRange?: { start: string; end: string }) => Promise<AuditLog[]>;
  getChangeEvents: (timeRange?: { start: string; end: string }) => Promise<AuditLog[]>;
  getSecurityEvents: (timeRange?: { start: string; end: string }) => Promise<AuditLog[]>;
  getPrivacyEvents: (timeRange?: { start: string; end: string }) => Promise<AuditLog[]>;
  
  // Analytics & Reporting
  getAuditAnalytics: (timeRange?: { start: string; end: string }) => Promise<any>;
  generateAuditReport: (reportType: string, options: any) => Promise<string>;
  getAuditReportStatus: (reportId: string) => Promise<any>;
  downloadAuditReport: (reportId: string) => Promise<void>;
  generateComplianceReport: (framework: string, timeRange?: { start: string; end: string }) => Promise<string>;
  
  // Alert Management
  getAuditAlerts: (status?: string) => Promise<any[]>;
  createAuditAlert: (alertData: any) => Promise<any>;
  updateAuditAlert: (alertId: string, updates: any) => Promise<any>;
  acknowledgeAuditAlert: (alertId: string) => Promise<void>;
  resolveAuditAlert: (alertId: string, resolution: string) => Promise<void>;
  
  // Policy Management
  getAuditPolicies: () => Promise<any[]>;
  createAuditPolicy: (policyData: any) => Promise<any>;
  updateAuditPolicy: (policyId: string, updates: any) => Promise<any>;
  testAuditPolicy: (policyId: string, testData: any) => Promise<any>;
  
  // Forensic Analysis
  performForensicAnalysis: (criteria: any) => Promise<any>;
  getAnomalyDetection: (timeRange?: { start: string; end: string }) => Promise<any>;
  
  // Data Retention & Archival
  getRetentionPolicies: () => Promise<any[]>;
  applyRetentionPolicy: (policyId: string, options?: any) => Promise<void>;
  exportForArchival: (criteria: any, format: 'json' | 'csv' | 'parquet') => Promise<void>;
  
  // Advanced Search & Query
  buildAuditQuery: (criteria: any) => Promise<AuditLog[]>;
  
  // Utility
  clearCache: () => void;
  resetPagination: () => void;
}

export interface UseAuditLogsReturn extends AuditLogsState, AuditLogsMethods {}

const DEFAULT_PAGE_SIZE = 50;
const DEFAULT_FILTERS: AuditLogFilters = {};

export function useAuditLogs(initialFilters: AuditLogFilters = {}, autoLoad = true): UseAuditLogsReturn {
  const [state, setState] = useState<AuditLogsState>({
    auditLogs: [],
    totalCount: 0,
    isLoading: false,
    isRefreshing: false,
    error: null,
    currentPage: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    hasNextPage: false,
    hasPreviousPage: false,
    filters: { ...DEFAULT_FILTERS, ...initialFilters },
    sortBy: 'timestamp',
    sortOrder: 'desc',
    lastUpdated: null,
    alerts: [],
    policies: [],
    analytics: null
  });

  // Auto-load audit logs on mount
  useEffect(() => {
    if (autoLoad) {
      Promise.all([
        loadAuditLogs(1),
        loadAuditAlerts(),
        loadAuditPolicies()
      ]).catch(console.error);
    }
  }, [autoLoad]);

  // Set up real-time updates
  useEffect(() => {
    // Subscribe to new audit events
    const auditSubscription = rbacWebSocketService.onAuditAlert(
      (event) => {
        // Add new audit log in real-time
        setState(prev => ({
          ...prev,
          auditLogs: [event.auditLog, ...prev.auditLogs.slice(0, prev.pageSize - 1)],
          totalCount: prev.totalCount + 1
        }));
      }
    );

    // Subscribe to audit alerts
    const alertSubscription = rbacWebSocketService.onAuditAlert(
      (event) => {
        setState(prev => ({
          ...prev,
          alerts: [event.alert, ...prev.alerts]
        }));
      }
    );

    return () => {
      rbacWebSocketService.unsubscribe(auditSubscription);
      rbacWebSocketService.unsubscribe(alertSubscription);
    };
  }, []);

  // === Data Loading ===

  const loadAuditLogs = useCallback(async (page: number = state.currentPage): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const pagination: AuditLogPagination = {
        page,
        pageSize: state.pageSize,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder
      };

      const response = await auditService.getAuditLogs(state.filters, pagination);
      
      setState(prev => ({
        ...prev,
        auditLogs: response.data.items,
        totalCount: response.data.total,
        currentPage: response.data.page,
        hasNextPage: response.data.hasNextPage,
        hasPreviousPage: response.data.hasPreviousPage,
        isLoading: false,
        lastUpdated: new Date()
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load audit logs'
      }));
    }
  }, [state.currentPage, state.pageSize, state.sortBy, state.sortOrder, state.filters]);

  const refreshAuditLogs = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isRefreshing: true }));
      await loadAuditLogs(state.currentPage);
      setState(prev => ({ ...prev, isRefreshing: false }));
    } catch (error) {
      setState(prev => ({ ...prev, isRefreshing: false }));
    }
  }, [loadAuditLogs, state.currentPage]);

  const filterAuditLogs = useCallback(async (filters: AuditLogFilters): Promise<void> => {
    setState(prev => ({ ...prev, filters, currentPage: 1 }));
    await loadAuditLogs(1);
  }, [loadAuditLogs]);

  const searchAuditLogs = useCallback(async (query: string): Promise<void> => {
    const searchFilters: AuditLogFilters = {
      ...state.filters,
      search: query
    };
    
    setState(prev => ({ ...prev, filters: searchFilters, currentPage: 1 }));
    await loadAuditLogs(1);
  }, [state.filters, loadAuditLogs]);

  // === Filtering & Sorting ===

  const setFilters = useCallback((newFilters: Partial<AuditLogFilters>): void => {
    const updatedFilters = { ...state.filters, ...newFilters };
    setState(prev => ({ ...prev, filters: updatedFilters, currentPage: 1 }));
    loadAuditLogs(1);
  }, [state.filters, loadAuditLogs]);

  const clearFilters = useCallback((): void => {
    setState(prev => ({ ...prev, filters: DEFAULT_FILTERS, currentPage: 1 }));
    loadAuditLogs(1);
  }, [loadAuditLogs]);

  const setSorting = useCallback((sortBy: string, sortOrder: 'asc' | 'desc' = 'desc'): void => {
    setState(prev => ({ ...prev, sortBy, sortOrder, currentPage: 1 }));
    loadAuditLogs(1);
  }, [loadAuditLogs]);

  const setPagination = useCallback((page: number, pageSize: number = state.pageSize): void => {
    setState(prev => ({ ...prev, currentPage: page, pageSize }));
    loadAuditLogs(page);
  }, [state.pageSize, loadAuditLogs]);

  // === Log Operations ===

  const getAuditLogEntry = useCallback(async (logId: string): Promise<AuditLog | null> => {
    try {
      const response = await auditService.getAuditLogEntry(logId);
      return response.data;
    } catch (error) {
      console.error('Failed to get audit log entry:', error);
      return null;
    }
  }, []);

  const getEntityAuditHistory = useCallback(async (entityType: string, entityId: string): Promise<AuditLog[]> => {
    try {
      const response = await auditService.getEntityAuditHistory(entityType, entityId);
      return response.data;
    } catch (error) {
      console.error('Failed to get entity audit history:', error);
      return [];
    }
  }, []);

  // === Event-Specific Logs ===

  const getAccessEvents = useCallback(async (timeRange?: { start: string; end: string }): Promise<AuditLog[]> => {
    try {
      const response = await auditService.getAccessEvents(timeRange);
      return response.data;
    } catch (error) {
      console.error('Failed to get access events:', error);
      return [];
    }
  }, []);

  const getChangeEvents = useCallback(async (timeRange?: { start: string; end: string }): Promise<AuditLog[]> => {
    try {
      const response = await auditService.getChangeEvents(timeRange);
      return response.data;
    } catch (error) {
      console.error('Failed to get change events:', error);
      return [];
    }
  }, []);

  const getSecurityEvents = useCallback(async (timeRange?: { start: string; end: string }): Promise<AuditLog[]> => {
    try {
      const response = await auditService.getSecurityEvents(timeRange);
      return response.data;
    } catch (error) {
      console.error('Failed to get security events:', error);
      return [];
    }
  }, []);

  const getPrivacyEvents = useCallback(async (timeRange?: { start: string; end: string }): Promise<AuditLog[]> => {
    try {
      const response = await auditService.getPrivacyEvents(timeRange);
      return response.data;
    } catch (error) {
      console.error('Failed to get privacy events:', error);
      return [];
    }
  }, []);

  // === Analytics & Reporting ===

  const getAuditAnalytics = useCallback(async (timeRange?: { start: string; end: string }): Promise<any> => {
    try {
      const response = await auditService.getAuditAnalytics(timeRange);
      const analytics = response.data;
      
      setState(prev => ({
        ...prev,
        analytics
      }));
      
      return analytics;
    } catch (error) {
      console.error('Failed to get audit analytics:', error);
      return null;
    }
  }, []);

  const generateAuditReport = useCallback(async (reportType: string, options: any): Promise<string> => {
    try {
      const response = await auditService.generateAuditReport(reportType, options);
      return response.data.reportId;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to generate audit report'
      }));
      throw error;
    }
  }, []);

  const getAuditReportStatus = useCallback(async (reportId: string): Promise<any> => {
    try {
      const response = await auditService.getAuditReportStatus(reportId);
      return response.data;
    } catch (error) {
      console.error('Failed to get audit report status:', error);
      return null;
    }
  }, []);

  const downloadAuditReport = useCallback(async (reportId: string): Promise<void> => {
    try {
      await auditService.downloadAuditReport(reportId);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to download audit report'
      }));
      throw error;
    }
  }, []);

  const generateComplianceReport = useCallback(async (
    framework: string, 
    timeRange?: { start: string; end: string }
  ): Promise<string> => {
    try {
      const response = await auditService.generateComplianceReport(framework, timeRange);
      return response.data.reportId;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to generate compliance report'
      }));
      throw error;
    }
  }, []);

  // === Alert Management ===

  const loadAuditAlerts = useCallback(async (): Promise<void> => {
    try {
      const response = await auditService.getAuditAlerts();
      setState(prev => ({
        ...prev,
        alerts: response.data
      }));
    } catch (error) {
      console.error('Failed to load audit alerts:', error);
    }
  }, []);

  const getAuditAlerts = useCallback(async (status?: string): Promise<any[]> => {
    try {
      const response = await auditService.getAuditAlerts(status);
      return response.data;
    } catch (error) {
      console.error('Failed to get audit alerts:', error);
      return [];
    }
  }, []);

  const createAuditAlert = useCallback(async (alertData: any): Promise<any> => {
    try {
      const response = await auditService.createAuditAlert(alertData);
      const newAlert = response.data;
      
      setState(prev => ({
        ...prev,
        alerts: [newAlert, ...prev.alerts]
      }));
      
      return newAlert;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create audit alert'
      }));
      throw error;
    }
  }, []);

  const updateAuditAlert = useCallback(async (alertId: string, updates: any): Promise<any> => {
    try {
      const response = await auditService.updateAuditAlert(alertId, updates);
      const updatedAlert = response.data;
      
      setState(prev => ({
        ...prev,
        alerts: prev.alerts.map(alert => 
          alert.id === alertId ? updatedAlert : alert
        )
      }));
      
      return updatedAlert;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update audit alert'
      }));
      throw error;
    }
  }, []);

  const acknowledgeAuditAlert = useCallback(async (alertId: string): Promise<void> => {
    try {
      await auditService.acknowledgeAuditAlert(alertId);
      
      setState(prev => ({
        ...prev,
        alerts: prev.alerts.map(alert => 
          alert.id === alertId ? { ...alert, status: 'acknowledged' } : alert
        )
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to acknowledge audit alert'
      }));
      throw error;
    }
  }, []);

  const resolveAuditAlert = useCallback(async (alertId: string, resolution: string): Promise<void> => {
    try {
      await auditService.resolveAuditAlert(alertId, resolution);
      
      setState(prev => ({
        ...prev,
        alerts: prev.alerts.map(alert => 
          alert.id === alertId ? { ...alert, status: 'resolved', resolution } : alert
        )
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to resolve audit alert'
      }));
      throw error;
    }
  }, []);

  // === Policy Management ===

  const loadAuditPolicies = useCallback(async (): Promise<void> => {
    try {
      const response = await auditService.getAuditPolicies();
      setState(prev => ({
        ...prev,
        policies: response.data
      }));
    } catch (error) {
      console.error('Failed to load audit policies:', error);
    }
  }, []);

  const getAuditPolicies = useCallback(async (): Promise<any[]> => {
    try {
      const response = await auditService.getAuditPolicies();
      return response.data;
    } catch (error) {
      console.error('Failed to get audit policies:', error);
      return [];
    }
  }, []);

  const createAuditPolicy = useCallback(async (policyData: any): Promise<any> => {
    try {
      const response = await auditService.createAuditPolicy(policyData);
      const newPolicy = response.data;
      
      setState(prev => ({
        ...prev,
        policies: [newPolicy, ...prev.policies]
      }));
      
      return newPolicy;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create audit policy'
      }));
      throw error;
    }
  }, []);

  const updateAuditPolicy = useCallback(async (policyId: string, updates: any): Promise<any> => {
    try {
      const response = await auditService.updateAuditPolicy(policyId, updates);
      const updatedPolicy = response.data;
      
      setState(prev => ({
        ...prev,
        policies: prev.policies.map(policy => 
          policy.id === policyId ? updatedPolicy : policy
        )
      }));
      
      return updatedPolicy;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update audit policy'
      }));
      throw error;
    }
  }, []);

  const testAuditPolicy = useCallback(async (policyId: string, testData: any): Promise<any> => {
    try {
      const response = await auditService.testAuditPolicy(policyId, testData);
      return response.data;
    } catch (error) {
      console.error('Failed to test audit policy:', error);
      return null;
    }
  }, []);

  // === Forensic Analysis ===

  const performForensicAnalysis = useCallback(async (criteria: any): Promise<any> => {
    try {
      const response = await auditService.performForensicAnalysis(criteria);
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to perform forensic analysis'
      }));
      throw error;
    }
  }, []);

  const getAnomalyDetection = useCallback(async (timeRange?: { start: string; end: string }): Promise<any> => {
    try {
      const response = await auditService.getAnomalyDetection(timeRange);
      return response.data;
    } catch (error) {
      console.error('Failed to get anomaly detection:', error);
      return null;
    }
  }, []);

  // === Data Retention & Archival ===

  const getRetentionPolicies = useCallback(async (): Promise<any[]> => {
    try {
      const response = await auditService.getRetentionPolicies();
      return response.data;
    } catch (error) {
      console.error('Failed to get retention policies:', error);
      return [];
    }
  }, []);

  const applyRetentionPolicy = useCallback(async (policyId: string, options?: any): Promise<void> => {
    try {
      await auditService.applyRetentionPolicy(policyId, options);
      setState(prev => ({ ...prev, lastUpdated: new Date() }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to apply retention policy'
      }));
      throw error;
    }
  }, []);

  const exportForArchival = useCallback(async (
    criteria: any, 
    format: 'json' | 'csv' | 'parquet'
  ): Promise<void> => {
    try {
      await auditService.exportForArchival(criteria, format);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to export for archival'
      }));
      throw error;
    }
  }, []);

  // === Advanced Search & Query ===

  const buildAuditQuery = useCallback(async (criteria: any): Promise<AuditLog[]> => {
    try {
      const response = await auditService.buildAuditQuery(criteria);
      return response.data;
    } catch (error) {
      console.error('Failed to build audit query:', error);
      return [];
    }
  }, []);

  // === Utility ===

  const clearCache = useCallback((): void => {
    setState(prev => ({
      ...prev,
      auditLogs: [],
      totalCount: 0,
      alerts: [],
      policies: [],
      analytics: null,
      lastUpdated: null,
      error: null
    }));
  }, []);

  const resetPagination = useCallback((): void => {
    setState(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  // Computed values
  const computedValues = useMemo(() => ({
    accessEvents: state.auditLogs.filter(log => log.eventType === 'access'),
    changeEvents: state.auditLogs.filter(log => log.eventType === 'change'),
    securityEvents: state.auditLogs.filter(log => log.eventType === 'security'),
    privacyEvents: state.auditLogs.filter(log => log.eventType === 'privacy'),
    criticalEvents: state.auditLogs.filter(log => log.severity === 'critical'),
    warningEvents: state.auditLogs.filter(log => log.severity === 'warning'),
    totalPages: Math.ceil(state.totalCount / state.pageSize),
    hasData: state.auditLogs.length > 0,
    isEmpty: !state.isLoading && state.auditLogs.length === 0,
    canLoadMore: state.hasNextPage,
    pendingAlerts: state.alerts.filter(alert => alert.status === 'pending'),
    acknowledgedAlerts: state.alerts.filter(alert => alert.status === 'acknowledged'),
    resolvedAlerts: state.alerts.filter(alert => alert.status === 'resolved'),
    activePolicies: state.policies.filter(policy => policy.isActive),
    inactivePolicies: state.policies.filter(policy => !policy.isActive)
  }), [state]);

  return {
    ...state,
    ...computedValues,
    
    // Data Loading
    loadAuditLogs,
    refreshAuditLogs,
    filterAuditLogs,
    searchAuditLogs,
    
    // Filtering & Sorting
    setFilters,
    clearFilters,
    setSorting,
    setPagination,
    
    // Log Operations
    getAuditLogEntry,
    getEntityAuditHistory,
    
    // Event-Specific Logs
    getAccessEvents,
    getChangeEvents,
    getSecurityEvents,
    getPrivacyEvents,
    
    // Analytics & Reporting
    getAuditAnalytics,
    generateAuditReport,
    getAuditReportStatus,
    downloadAuditReport,
    generateComplianceReport,
    
    // Alert Management
    getAuditAlerts,
    createAuditAlert,
    updateAuditAlert,
    acknowledgeAuditAlert,
    resolveAuditAlert,
    
    // Policy Management
    getAuditPolicies,
    createAuditPolicy,
    updateAuditPolicy,
    testAuditPolicy,
    
    // Forensic Analysis
    performForensicAnalysis,
    getAnomalyDetection,
    
    // Data Retention & Archival
    getRetentionPolicies,
    applyRetentionPolicy,
    exportForArchival,
    
    // Advanced Search & Query
    buildAuditQuery,
    
    // Utility
    clearCache,
    resetPagination
  };
}

export default useAuditLogs;