/**
 * Reporting Hook
 * Advanced React hook for reporting, analytics, dashboards,
 * and business intelligence with real-time capabilities
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { reportingAPIService } from '../services/reporting-apis';
import {
  Report,
  ReportTemplate,
  Dashboard,
  ReportMetrics,
  ReportAnalytics,
  ExecutiveReport,
  OperationalReport,
  ComplianceReport,
  PerformanceReport,
  CustomReport,
  ReportSchedule,
  ReportExport,
  APIResponse,
  APIError
} from '../types/reporting.types';

interface UseReportingConfig {
  enableRealTime?: boolean;
  enableCaching?: boolean;
  cacheTimeout?: number;
  enableMetrics?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  maxRetries?: number;
  errorRetryDelay?: number;
}

interface ReportingState {
  reports: Report[];
  templates: ReportTemplate[];
  dashboards: Dashboard[];
  executiveReports: ExecutiveReport[];
  operationalReports: OperationalReport[];
  complianceReports: ComplianceReport[];
  performanceReports: PerformanceReport[];
  customReports: CustomReport[];
  schedules: ReportSchedule[];
  exports: ReportExport[];
  metrics: ReportMetrics | null;
  analytics: ReportAnalytics | null;
  currentReport: Report | null;
  currentDashboard: Dashboard | null;
  loading: boolean;
  error: APIError | null;
  realTimeConnected: boolean;
  lastUpdate: Date | null;
  updateCount: number;
}

interface ReportingOperations {
  // Report Management
  loadReports: () => Promise<void>;
  getReport: (reportId: string) => Promise<Report | null>;
  createReport: (report: Partial<Report>) => Promise<Report | null>;
  updateReport: (reportId: string, updates: Partial<Report>) => Promise<Report | null>;
  deleteReport: (reportId: string) => Promise<boolean>;
  generateReport: (reportId: string, params?: any) => Promise<any>;
  
  // Template Management
  loadTemplates: () => Promise<void>;
  createTemplate: (template: Partial<ReportTemplate>) => Promise<ReportTemplate | null>;
  updateTemplate: (templateId: string, updates: Partial<ReportTemplate>) => Promise<ReportTemplate | null>;
  deleteTemplate: (templateId: string) => Promise<boolean>;
  
  // Dashboard Management
  loadDashboards: () => Promise<void>;
  createDashboard: (dashboard: Partial<Dashboard>) => Promise<Dashboard | null>;
  updateDashboard: (dashboardId: string, updates: Partial<Dashboard>) => Promise<Dashboard | null>;
  deleteDashboard: (dashboardId: string) => Promise<boolean>;
  
  // Executive Reporting
  getExecutiveDashboard: () => Promise<ExecutiveReport | null>;
  generateExecutiveReport: (params: any) => Promise<ExecutiveReport | null>;
  
  // Operational Reporting
  getOperationalDashboard: () => Promise<OperationalReport | null>;
  generateOperationalReport: (params: any) => Promise<OperationalReport | null>;
  
  // Compliance Reporting
  getComplianceReports: () => Promise<void>;
  generateComplianceReport: (params: any) => Promise<ComplianceReport | null>;
  
  // Performance Reporting
  getPerformanceReports: () => Promise<void>;
  generatePerformanceReport: (params: any) => Promise<PerformanceReport | null>;
  
  // Custom Reporting
  getCustomReports: () => Promise<void>;
  createCustomReport: (report: Partial<CustomReport>) => Promise<CustomReport | null>;
  
  // Scheduling
  loadSchedules: () => Promise<void>;
  createSchedule: (schedule: Partial<ReportSchedule>) => Promise<ReportSchedule | null>;
  updateSchedule: (scheduleId: string, updates: Partial<ReportSchedule>) => Promise<ReportSchedule | null>;
  deleteSchedule: (scheduleId: string) => Promise<boolean>;
  
  // Export Management
  exportReport: (reportId: string, format: string) => Promise<ReportExport | null>;
  getExports: () => Promise<void>;
  downloadExport: (exportId: string) => Promise<Blob | null>;
  
  // Analytics
  getMetrics: () => Promise<ReportMetrics | null>;
  getAnalytics: (request: any) => Promise<ReportAnalytics | null>;
  
  // Utility Operations
  refreshData: () => Promise<void>;
  clearCache: () => void;
  resetState: () => void;
}

export const useReporting = (config: UseReportingConfig = {}): [ReportingState, ReportingOperations] => {
  const hookConfig = useMemo(() => ({
    enableRealTime: true,
    enableCaching: true,
    cacheTimeout: 300000,
    enableMetrics: true,
    autoRefresh: true,
    refreshInterval: 60000,
    maxRetries: 3,
    errorRetryDelay: 1000,
    ...config
  }), [config]);

  const [state, setState] = useState<ReportingState>({
    reports: [],
    templates: [],
    dashboards: [],
    executiveReports: [],
    operationalReports: [],
    complianceReports: [],
    performanceReports: [],
    customReports: [],
    schedules: [],
    exports: [],
    metrics: null,
    analytics: null,
    currentReport: null,
    currentDashboard: null,
    loading: false,
    error: null,
    realTimeConnected: false,
    lastUpdate: null,
    updateCount: 0
  });

  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wsUnsubscribeRef = useRef<(() => void) | null>(null);
  const cacheRef = useRef<Map<string, { data: any; timestamp: number }>>(new Map());

  const updateState = useCallback((updates: Partial<ReportingState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleError = useCallback(async (error: APIError, operation: () => Promise<any>, retryCount = 0) => {
    console.error('Reporting operation error:', error);
    updateState({ error, loading: false });

    if (retryCount < hookConfig.maxRetries) {
      setTimeout(async () => {
        try {
          await operation();
        } catch (retryError) {
          await handleError(retryError as APIError, operation, retryCount + 1);
        }
      }, hookConfig.errorRetryDelay * Math.pow(2, retryCount));
    }
  }, [hookConfig.maxRetries, hookConfig.errorRetryDelay, updateState]);

  const getCachedData = useCallback((key: string) => {
    if (!hookConfig.enableCaching) return null;
    const cached = cacheRef.current.get(key);
    if (cached && Date.now() - cached.timestamp < hookConfig.cacheTimeout) {
      return cached.data;
    }
    return null;
  }, [hookConfig.enableCaching, hookConfig.cacheTimeout]);

  const setCachedData = useCallback((key: string, data: any) => {
    if (hookConfig.enableCaching) {
      cacheRef.current.set(key, { data, timestamp: Date.now() });
    }
  }, [hookConfig.enableCaching]);

  // Report Management
  const loadReports = useCallback(async () => {
    const cacheKey = 'reports';
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      updateState({ reports: cachedData });
      return;
    }

    updateState({ loading: true, error: null });
    try {
      const response = await reportingAPIService.getReports();
      if (response.success) {
        updateState({ reports: response.data, loading: false });
        setCachedData(cacheKey, response.data);
      }
    } catch (error) {
      await handleError(error as APIError, loadReports);
    }
  }, [getCachedData, setCachedData, updateState, handleError]);

  const getReport = useCallback(async (reportId: string): Promise<Report | null> => {
    try {
      const response = await reportingAPIService.getReport(reportId);
      return response.success ? response.data : null;
    } catch (error) {
      await handleError(error as APIError, () => getReport(reportId));
      return null;
    }
  }, [handleError]);

  const createReport = useCallback(async (report: Partial<Report>): Promise<Report | null> => {
    updateState({ loading: true, error: null });
    try {
      const response = await reportingAPIService.createReport(report);
      if (response.success) {
        updateState(prev => ({
          reports: [...prev.reports, response.data],
          currentReport: response.data,
          loading: false
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => createReport(report));
    }
    return null;
  }, [updateState, handleError]);

  const updateReport = useCallback(async (reportId: string, updates: Partial<Report>): Promise<Report | null> => {
    try {
      const response = await reportingAPIService.updateReport(reportId, updates);
      if (response.success) {
        updateState(prev => ({
          reports: prev.reports.map(report => 
            report.id === reportId ? { ...report, ...response.data } : report
          )
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => updateReport(reportId, updates));
    }
    return null;
  }, [updateState, handleError]);

  const deleteReport = useCallback(async (reportId: string): Promise<boolean> => {
    try {
      const response = await reportingAPIService.deleteReport(reportId);
      if (response.success) {
        updateState(prev => ({
          reports: prev.reports.filter(report => report.id !== reportId)
        }));
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => deleteReport(reportId));
    }
    return false;
  }, [updateState, handleError]);

  const generateReport = useCallback(async (reportId: string, params?: any): Promise<any> => {
    updateState({ loading: true, error: null });
    try {
      const response = await reportingAPIService.generateReport(reportId, params);
      updateState({ loading: false });
      return response.success ? response.data : null;
    } catch (error) {
      await handleError(error as APIError, () => generateReport(reportId, params));
      return null;
    }
  }, [updateState, handleError]);

  // Template Management
  const loadTemplates = useCallback(async () => {
    const cacheKey = 'report-templates';
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      updateState({ templates: cachedData });
      return;
    }

    try {
      const response = await reportingAPIService.getReportTemplates();
      if (response.success) {
        updateState({ templates: response.data });
        setCachedData(cacheKey, response.data);
      }
    } catch (error) {
      await handleError(error as APIError, loadTemplates);
    }
  }, [getCachedData, setCachedData, updateState, handleError]);

  const createTemplate = useCallback(async (template: Partial<ReportTemplate>): Promise<ReportTemplate | null> => {
    try {
      const response = await reportingAPIService.createReportTemplate(template);
      if (response.success) {
        updateState(prev => ({
          templates: [...prev.templates, response.data]
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => createTemplate(template));
    }
    return null;
  }, [updateState, handleError]);

  const updateTemplate = useCallback(async (templateId: string, updates: Partial<ReportTemplate>): Promise<ReportTemplate | null> => {
    try {
      const response = await reportingAPIService.updateReportTemplate(templateId, updates);
      if (response.success) {
        updateState(prev => ({
          templates: prev.templates.map(template => 
            template.id === templateId ? { ...template, ...response.data } : template
          )
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => updateTemplate(templateId, updates));
    }
    return null;
  }, [updateState, handleError]);

  const deleteTemplate = useCallback(async (templateId: string): Promise<boolean> => {
    try {
      const response = await reportingAPIService.deleteReportTemplate(templateId);
      if (response.success) {
        updateState(prev => ({
          templates: prev.templates.filter(template => template.id !== templateId)
        }));
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => deleteTemplate(templateId));
    }
    return false;
  }, [updateState, handleError]);

  // Dashboard Management
  const loadDashboards = useCallback(async () => {
    const cacheKey = 'dashboards';
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      updateState({ dashboards: cachedData });
      return;
    }

    try {
      const response = await reportingAPIService.getDashboards();
      if (response.success) {
        updateState({ dashboards: response.data });
        setCachedData(cacheKey, response.data);
      }
    } catch (error) {
      await handleError(error as APIError, loadDashboards);
    }
  }, [getCachedData, setCachedData, updateState, handleError]);

  const createDashboard = useCallback(async (dashboard: Partial<Dashboard>): Promise<Dashboard | null> => {
    try {
      const response = await reportingAPIService.createDashboard(dashboard);
      if (response.success) {
        updateState(prev => ({
          dashboards: [...prev.dashboards, response.data],
          currentDashboard: response.data
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => createDashboard(dashboard));
    }
    return null;
  }, [updateState, handleError]);

  const updateDashboard = useCallback(async (dashboardId: string, updates: Partial<Dashboard>): Promise<Dashboard | null> => {
    try {
      const response = await reportingAPIService.updateDashboard(dashboardId, updates);
      if (response.success) {
        updateState(prev => ({
          dashboards: prev.dashboards.map(dashboard => 
            dashboard.id === dashboardId ? { ...dashboard, ...response.data } : dashboard
          )
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => updateDashboard(dashboardId, updates));
    }
    return null;
  }, [updateState, handleError]);

  const deleteDashboard = useCallback(async (dashboardId: string): Promise<boolean> => {
    try {
      const response = await reportingAPIService.deleteDashboard(dashboardId);
      if (response.success) {
        updateState(prev => ({
          dashboards: prev.dashboards.filter(dashboard => dashboard.id !== dashboardId)
        }));
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => deleteDashboard(dashboardId));
    }
    return false;
  }, [updateState, handleError]);

  // Executive Reporting
  const getExecutiveDashboard = useCallback(async (): Promise<ExecutiveReport | null> => {
    try {
      const response = await reportingAPIService.getExecutiveDashboard();
      if (response.success) {
        updateState(prev => ({
          executiveReports: [response.data, ...prev.executiveReports.slice(0, 9)]
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, getExecutiveDashboard);
    }
    return null;
  }, [updateState, handleError]);

  const generateExecutiveReport = useCallback(async (params: any): Promise<ExecutiveReport | null> => {
    updateState({ loading: true, error: null });
    try {
      const response = await reportingAPIService.generateExecutiveReport(params);
      if (response.success) {
        updateState(prev => ({
          executiveReports: [response.data, ...prev.executiveReports],
          loading: false
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => generateExecutiveReport(params));
    }
    return null;
  }, [updateState, handleError]);

  // Operational Reporting
  const getOperationalDashboard = useCallback(async (): Promise<OperationalReport | null> => {
    try {
      const response = await reportingAPIService.getOperationalDashboard();
      if (response.success) {
        updateState(prev => ({
          operationalReports: [response.data, ...prev.operationalReports.slice(0, 9)]
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, getOperationalDashboard);
    }
    return null;
  }, [updateState, handleError]);

  const generateOperationalReport = useCallback(async (params: any): Promise<OperationalReport | null> => {
    try {
      const response = await reportingAPIService.generateOperationalReport(params);
      if (response.success) {
        updateState(prev => ({
          operationalReports: [response.data, ...prev.operationalReports]
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => generateOperationalReport(params));
    }
    return null;
  }, [updateState, handleError]);

  // Compliance Reporting
  const getComplianceReports = useCallback(async () => {
    try {
      const response = await reportingAPIService.getComplianceReports();
      if (response.success) {
        updateState({ complianceReports: response.data });
      }
    } catch (error) {
      await handleError(error as APIError, getComplianceReports);
    }
  }, [updateState, handleError]);

  const generateComplianceReport = useCallback(async (params: any): Promise<ComplianceReport | null> => {
    try {
      const response = await reportingAPIService.generateComplianceReport(params);
      if (response.success) {
        updateState(prev => ({
          complianceReports: [response.data, ...prev.complianceReports]
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => generateComplianceReport(params));
    }
    return null;
  }, [updateState, handleError]);

  // Performance Reporting
  const getPerformanceReports = useCallback(async () => {
    try {
      const response = await reportingAPIService.getPerformanceReports();
      if (response.success) {
        updateState({ performanceReports: response.data });
      }
    } catch (error) {
      await handleError(error as APIError, getPerformanceReports);
    }
  }, [updateState, handleError]);

  const generatePerformanceReport = useCallback(async (params: any): Promise<PerformanceReport | null> => {
    try {
      const response = await reportingAPIService.generatePerformanceReport(params);
      if (response.success) {
        updateState(prev => ({
          performanceReports: [response.data, ...prev.performanceReports]
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => generatePerformanceReport(params));
    }
    return null;
  }, [updateState, handleError]);

  // Custom Reporting
  const getCustomReports = useCallback(async () => {
    try {
      const response = await reportingAPIService.getCustomReports();
      if (response.success) {
        updateState({ customReports: response.data });
      }
    } catch (error) {
      await handleError(error as APIError, getCustomReports);
    }
  }, [updateState, handleError]);

  const createCustomReport = useCallback(async (report: Partial<CustomReport>): Promise<CustomReport | null> => {
    try {
      const response = await reportingAPIService.createCustomReport(report);
      if (response.success) {
        updateState(prev => ({
          customReports: [...prev.customReports, response.data]
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => createCustomReport(report));
    }
    return null;
  }, [updateState, handleError]);

  // Scheduling
  const loadSchedules = useCallback(async () => {
    try {
      const response = await reportingAPIService.getReportSchedules();
      if (response.success) {
        updateState({ schedules: response.data });
      }
    } catch (error) {
      await handleError(error as APIError, loadSchedules);
    }
  }, [updateState, handleError]);

  const createSchedule = useCallback(async (schedule: Partial<ReportSchedule>): Promise<ReportSchedule | null> => {
    try {
      const response = await reportingAPIService.createReportSchedule(schedule);
      if (response.success) {
        updateState(prev => ({
          schedules: [...prev.schedules, response.data]
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => createSchedule(schedule));
    }
    return null;
  }, [updateState, handleError]);

  const updateSchedule = useCallback(async (scheduleId: string, updates: Partial<ReportSchedule>): Promise<ReportSchedule | null> => {
    try {
      const response = await reportingAPIService.updateReportSchedule(scheduleId, updates);
      if (response.success) {
        updateState(prev => ({
          schedules: prev.schedules.map(schedule => 
            schedule.id === scheduleId ? { ...schedule, ...response.data } : schedule
          )
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => updateSchedule(scheduleId, updates));
    }
    return null;
  }, [updateState, handleError]);

  const deleteSchedule = useCallback(async (scheduleId: string): Promise<boolean> => {
    try {
      const response = await reportingAPIService.deleteReportSchedule(scheduleId);
      if (response.success) {
        updateState(prev => ({
          schedules: prev.schedules.filter(schedule => schedule.id !== scheduleId)
        }));
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => deleteSchedule(scheduleId));
    }
    return false;
  }, [updateState, handleError]);

  // Export Management
  const exportReport = useCallback(async (reportId: string, format: string): Promise<ReportExport | null> => {
    try {
      const response = await reportingAPIService.exportReport(reportId, { format });
      if (response.success) {
        updateState(prev => ({
          exports: [...prev.exports, response.data]
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => exportReport(reportId, format));
    }
    return null;
  }, [updateState, handleError]);

  const getExports = useCallback(async () => {
    try {
      const response = await reportingAPIService.getReportExports();
      if (response.success) {
        updateState({ exports: response.data });
      }
    } catch (error) {
      await handleError(error as APIError, getExports);
    }
  }, [updateState, handleError]);

  const downloadExport = useCallback(async (exportId: string): Promise<Blob | null> => {
    try {
      const response = await reportingAPIService.downloadReportExport(exportId);
      return response.success ? response.data : null;
    } catch (error) {
      await handleError(error as APIError, () => downloadExport(exportId));
      return null;
    }
  }, [handleError]);

  // Analytics
  const getMetrics = useCallback(async (): Promise<ReportMetrics | null> => {
    try {
      const response = await reportingAPIService.getReportingMetrics();
      if (response.success) {
        updateState({ metrics: response.data });
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, getMetrics);
    }
    return null;
  }, [updateState, handleError]);

  const getAnalytics = useCallback(async (request: any): Promise<ReportAnalytics | null> => {
    try {
      const response = await reportingAPIService.getReportingAnalytics(request);
      if (response.success) {
        updateState({ analytics: response.data });
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => getAnalytics(request));
    }
    return null;
  }, [updateState, handleError]);

  // Utility Operations
  const refreshData = useCallback(async () => {
    updateState({ loading: true, error: null });
    try {
      await Promise.all([
        loadReports(),
        loadTemplates(),
        loadDashboards(),
        loadSchedules(),
        getExports(),
        getMetrics()
      ]);
      updateState({ 
        loading: false, 
        lastUpdate: new Date(),
        updateCount: state.updateCount + 1
      });
    } catch (error) {
      await handleError(error as APIError, refreshData);
    }
  }, [loadReports, loadTemplates, loadDashboards, loadSchedules, getExports, getMetrics, state.updateCount, updateState, handleError]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const resetState = useCallback(() => {
    setState({
      reports: [],
      templates: [],
      dashboards: [],
      executiveReports: [],
      operationalReports: [],
      complianceReports: [],
      performanceReports: [],
      customReports: [],
      schedules: [],
      exports: [],
      metrics: null,
      analytics: null,
      currentReport: null,
      currentDashboard: null,
      loading: false,
      error: null,
      realTimeConnected: false,
      lastUpdate: null,
      updateCount: 0
    });
    clearCache();
  }, [clearCache]);

  // Effects
  useEffect(() => {
    if (hookConfig.enableRealTime) {
      const unsubscribe = reportingAPIService.subscribe('reporting_updated', (data) => {
        updateState(prev => ({
          ...prev,
          lastUpdate: new Date(),
          updateCount: prev.updateCount + 1,
          realTimeConnected: true
        }));
      });
      wsUnsubscribeRef.current = unsubscribe;
      return () => {
        if (wsUnsubscribeRef.current) {
          wsUnsubscribeRef.current();
        }
      };
    }
  }, [hookConfig.enableRealTime, updateState]);

  useEffect(() => {
    if (hookConfig.autoRefresh && hookConfig.refreshInterval > 0) {
      refreshTimerRef.current = setInterval(refreshData, hookConfig.refreshInterval);
      return () => {
        if (refreshTimerRef.current) {
          clearInterval(refreshTimerRef.current);
        }
      };
    }
  }, [hookConfig.autoRefresh, hookConfig.refreshInterval, refreshData]);

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
      if (wsUnsubscribeRef.current) {
        wsUnsubscribeRef.current();
      }
    };
  }, []);

  const operations: ReportingOperations = {
    // Report Management
    loadReports,
    getReport,
    createReport,
    updateReport,
    deleteReport,
    generateReport,
    
    // Template Management
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    
    // Dashboard Management
    loadDashboards,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    
    // Executive Reporting
    getExecutiveDashboard,
    generateExecutiveReport,
    
    // Operational Reporting
    getOperationalDashboard,
    generateOperationalReport,
    
    // Compliance Reporting
    getComplianceReports,
    generateComplianceReport,
    
    // Performance Reporting
    getPerformanceReports,
    generatePerformanceReport,
    
    // Custom Reporting
    getCustomReports,
    createCustomReport,
    
    // Scheduling
    loadSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    
    // Export Management
    exportReport,
    getExports,
    downloadExport,
    
    // Analytics
    getMetrics,
    getAnalytics,
    
    // Utility Operations
    refreshData,
    clearCache,
    resetState
  };

  return [state, operations];
};

export default useReporting;