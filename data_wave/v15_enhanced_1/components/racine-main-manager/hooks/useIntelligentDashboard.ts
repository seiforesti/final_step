/**
 * Racine Intelligent Dashboard Hook
 * ==================================
 * 
 * Comprehensive React hook for intelligent dashboard functionality that provides
 * state management, API integration, and real-time updates for the master
 * dashboard system across all 7 data governance groups.
 * 
 * Features:
 * - Real-time dashboard orchestration and management
 * - Cross-group KPI visualization and monitoring
 * - Predictive analytics and AI-driven insights
 * - Custom dashboard builder with drag-drop widgets
 * - Executive reporting and performance monitoring
 * - Alerting and notification center integration
 * - Dashboard personalization and user preferences
 * - Advanced filtering and drill-down capabilities
 * 
 * Backend Integration:
 * - Maps to: RacineDashboardService
 * - Uses: dashboard-apis.ts
 * - Real-time: WebSocket events for live dashboard updates
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  dashboardAPI,
  DashboardEventType,
  DashboardEvent,
  DashboardEventHandler
} from '../services/dashboard-apis';

import {
  DashboardResponse,
  CreateDashboardRequest,
  UpdateDashboardRequest,
  DashboardWidget,
  CreateWidgetRequest,
  UpdateWidgetRequest,
  DashboardKPI,
  DashboardAlert,
  DashboardFilter,
  DashboardAnalyticsResponse,
  ExecutiveReportResponse,
  PerformanceMetricsResponse,
  PredictiveInsightResponse,
  UUID,
  ISODateString,
  OperationStatus,
  PaginationRequest,
  FilterRequest
} from '../types/api.types';

import {
  DashboardState,
  DashboardConfiguration,
  Widget,
  WidgetConfiguration,
  KPIMetric,
  AlertRule,
  DashboardLayout,
  DashboardTheme,
  DrillDownConfiguration,
  VisualizationConfig
} from '../types/racine-core.types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * Dashboard hook state interface
 */
export interface DashboardHookState {
  // Dashboards
  dashboards: DashboardResponse[];
  currentDashboard: DashboardResponse | null;
  defaultDashboard: DashboardResponse | null;
  
  // Widgets and components
  widgets: Record<UUID, DashboardWidget>;
  widgetData: Record<UUID, any>;
  widgetLoading: Record<UUID, boolean>;
  widgetErrors: Record<UUID, string | null>;
  
  // KPIs and metrics
  kpis: Record<UUID, DashboardKPI>;
  crossGroupMetrics: Record<string, any>;
  performanceMetrics: PerformanceMetricsResponse | null;
  
  // Alerts and notifications
  alerts: DashboardAlert[];
  activeAlerts: DashboardAlert[];
  acknowledgedAlerts: Set<UUID>;
  criticalAlerts: number;
  
  // Analytics and insights
  dashboardAnalytics: DashboardAnalyticsResponse | null;
  predictiveInsights: PredictiveInsightResponse[];
  executiveReports: ExecutiveReportResponse[];
  
  // Filters and drill-down
  activeFilters: Record<string, any>;
  drillDownPath: string[];
  filterHistory: DashboardFilter[];
  
  // Layout and personalization
  currentLayout: DashboardLayout;
  availableThemes: DashboardTheme[];
  currentTheme: DashboardTheme;
  userPreferences: Record<string, any>;
  
  // Real-time updates
  isRealTimeEnabled: boolean;
  lastDataUpdate: ISODateString | null;
  updateFrequency: number;
  
  // Connection status
  isConnected: boolean;
  lastSync: ISODateString | null;
  websocketConnected: boolean;
}

/**
 * Dashboard hook operations interface
 */
export interface DashboardHookOperations {
  // Dashboard management
  createDashboard: (request: CreateDashboardRequest) => Promise<DashboardResponse>;
  updateDashboard: (dashboardId: UUID, request: UpdateDashboardRequest) => Promise<DashboardResponse>;
  deleteDashboard: (dashboardId: UUID) => Promise<void>;
  cloneDashboard: (dashboardId: UUID, name: string) => Promise<DashboardResponse>;
  switchDashboard: (dashboardId: UUID) => Promise<void>;
  
  // Widget management
  addWidget: (dashboardId: UUID, request: CreateWidgetRequest) => Promise<DashboardWidget>;
  updateWidget: (widgetId: UUID, request: UpdateWidgetRequest) => Promise<DashboardWidget>;
  removeWidget: (widgetId: UUID) => Promise<void>;
  moveWidget: (widgetId: UUID, newPosition: { x: number; y: number; width: number; height: number }) => Promise<void>;
  refreshWidget: (widgetId: UUID) => Promise<void>;
  
  // Data and metrics
  refreshDashboard: (dashboardId?: UUID) => Promise<void>;
  refreshAllWidgets: () => Promise<void>;
  getKPIData: (kpiId: UUID, timeRange?: string) => Promise<any>;
  getCrossGroupMetrics: (groups: string[], timeRange?: string) => Promise<Record<string, any>>;
  
  // Alerts and notifications
  acknowledgeAlert: (alertId: UUID) => Promise<void>;
  dismissAlert: (alertId: UUID) => Promise<void>;
  createAlert: (alertRule: AlertRule) => Promise<DashboardAlert>;
  updateAlert: (alertId: UUID, alertRule: AlertRule) => Promise<DashboardAlert>;
  
  // Analytics and insights
  getDashboardAnalytics: (dashboardId?: UUID, timeRange?: string) => Promise<DashboardAnalyticsResponse>;
  getPredictiveInsights: (scope: string[], timeRange?: string) => Promise<PredictiveInsightResponse[]>;
  generateExecutiveReport: (reportType: string, parameters: Record<string, any>) => Promise<ExecutiveReportResponse>;
  
  // Filtering and drill-down
  applyFilter: (filter: DashboardFilter) => Promise<void>;
  removeFilter: (filterId: string) => Promise<void>;
  clearAllFilters: () => Promise<void>;
  drillDown: (path: string, parameters: Record<string, any>) => Promise<void>;
  drillUp: () => Promise<void>;
  
  // Layout and personalization
  updateLayout: (layout: DashboardLayout) => Promise<void>;
  saveUserPreferences: (preferences: Record<string, any>) => Promise<void>;
  changeTheme: (themeId: string) => Promise<void>;
  resetLayout: () => Promise<void>;
  
  // Real-time updates
  enableRealTime: () => void;
  disableRealTime: () => void;
  setUpdateFrequency: (frequency: number) => void;
  
  // Utilities
  refresh: () => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;
  exportDashboard: (dashboardId: UUID, format: 'pdf' | 'png' | 'json') => Promise<Blob>;
}

/**
 * Dashboard hook configuration
 */
export interface DashboardHookConfig {
  userId: UUID;
  defaultDashboardId?: UUID;
  autoConnect?: boolean;
  enableRealTime?: boolean;
  updateFrequency?: number;
  maxAlerts?: number;
  refreshInterval?: number;
  retryAttempts?: number;
}

// =============================================================================
// MAIN HOOK IMPLEMENTATION
// =============================================================================

/**
 * Main intelligent dashboard hook
 */
export const useIntelligentDashboard = (config?: Partial<DashboardHookConfig>): [DashboardHookState, DashboardHookOperations] => {
  const safeConfig = (config || {}) as Partial<DashboardHookConfig>;
  const {
    userId,
    defaultDashboardId,
    autoConnect = true,
    enableRealTime = true,
    updateFrequency = 30000,
    maxAlerts = 100,
    refreshInterval = 60000,
    retryAttempts = 3
  } = safeConfig;

  // State management
  const [state, setState] = useState<DashboardHookState>({
    dashboards: [],
    currentDashboard: null,
    defaultDashboard: null,
    widgets: {},
    widgetData: {},
    widgetLoading: {},
    widgetErrors: {},
    kpis: {},
    crossGroupMetrics: {},
    performanceMetrics: null,
    alerts: [],
    activeAlerts: [],
    acknowledgedAlerts: new Set(),
    criticalAlerts: 0,
    dashboardAnalytics: null,
    predictiveInsights: [],
    executiveReports: [],
    activeFilters: {},
    drillDownPath: [],
    filterHistory: [],
    currentLayout: {
      type: 'grid',
      columns: 12,
      rowHeight: 100,
      margin: [10, 10],
      containerPadding: [10, 10],
      breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
      cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }
    },
    availableThemes: [],
    currentTheme: {
      id: 'default',
      name: 'Default',
      colors: {},
      fonts: {},
      spacing: {}
    },
    userPreferences: {},
    isRealTimeEnabled: enableRealTime,
    lastDataUpdate: null,
    updateFrequency,
    isConnected: false,
    lastSync: null,
    websocketConnected: false
  });

  // Refs for managing subscriptions and intervals
  const eventHandlersRef = useRef<Map<DashboardEventType, DashboardEventHandler>>(new Map());
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleDashboardEvent = useCallback((event: DashboardEvent) => {
    setState(prevState => {
      const newState = { ...prevState };

      switch (event.type) {
        case DashboardEventType.DASHBOARD_CREATED:
          const dashboard = event.data as DashboardResponse;
          newState.dashboards.push(dashboard);
          break;

        case DashboardEventType.DASHBOARD_UPDATED:
          const updatedDashboard = event.data as DashboardResponse;
          const dashboardIndex = newState.dashboards.findIndex(d => d.id === updatedDashboard.id);
          if (dashboardIndex !== -1) {
            newState.dashboards[dashboardIndex] = updatedDashboard;
            if (newState.currentDashboard?.id === updatedDashboard.id) {
              newState.currentDashboard = updatedDashboard;
            }
          }
          break;

        case DashboardEventType.WIDGET_DATA_UPDATED:
          const { widgetId, data } = event.data as { widgetId: UUID; data: any };
          newState.widgetData[widgetId] = data;
          newState.widgetLoading[widgetId] = false;
          newState.widgetErrors[widgetId] = null;
          break;

        case DashboardEventType.WIDGET_ERROR:
          const { widgetId: errorWidgetId, error } = event.data as { widgetId: UUID; error: string };
          newState.widgetLoading[errorWidgetId] = false;
          newState.widgetErrors[errorWidgetId] = error;
          break;

        case DashboardEventType.ALERT_TRIGGERED:
          const alert = event.data as DashboardAlert;
          newState.alerts.push(alert);
          newState.activeAlerts.push(alert);
          if (alert.severity === 'critical') {
            newState.criticalAlerts++;
          }
          if (newState.alerts.length > maxAlerts) {
            newState.alerts = newState.alerts.slice(-maxAlerts);
          }
          break;

        case DashboardEventType.ALERT_RESOLVED:
          const resolvedAlertId = event.data.alertId as UUID;
          newState.activeAlerts = newState.activeAlerts.filter(a => a.id !== resolvedAlertId);
          const resolvedAlert = newState.alerts.find(a => a.id === resolvedAlertId);
          if (resolvedAlert?.severity === 'critical') {
            newState.criticalAlerts = Math.max(0, newState.criticalAlerts - 1);
          }
          break;

        case DashboardEventType.KPI_UPDATED:
          const kpi = event.data as DashboardKPI;
          newState.kpis[kpi.id] = kpi;
          break;

        case DashboardEventType.METRICS_UPDATED:
          const metrics = event.data as Record<string, any>;
          newState.crossGroupMetrics = { ...newState.crossGroupMetrics, ...metrics };
          break;

        case DashboardEventType.PREDICTIVE_INSIGHT_GENERATED:
          const insight = event.data as PredictiveInsightResponse;
          newState.predictiveInsights.push(insight);
          break;

        case DashboardEventType.CONNECTION_STATUS_CHANGED:
          newState.websocketConnected = event.data.connected as boolean;
          break;

        default:
          console.warn('Unknown dashboard event type:', event.type);
      }

      newState.lastDataUpdate = new Date().toISOString();
      newState.lastSync = new Date().toISOString();
      return newState;
    });
  }, [maxAlerts]);

  // =============================================================================
  // DASHBOARD MANAGEMENT OPERATIONS
  // =============================================================================

  const createDashboard = useCallback(async (request: CreateDashboardRequest): Promise<DashboardResponse> => {
    try {
      const dashboard = await dashboardAPI.createDashboard(request);
      setState(prevState => ({
        ...prevState,
        dashboards: [...prevState.dashboards, dashboard],
        lastSync: new Date().toISOString()
      }));
      return dashboard;
    } catch (error) {
      console.error('Failed to create dashboard:', error);
      throw error;
    }
  }, []);

  const updateDashboard = useCallback(async (dashboardId: UUID, request: UpdateDashboardRequest): Promise<DashboardResponse> => {
    try {
      const dashboard = await dashboardAPI.updateDashboard(dashboardId, request);
      setState(prevState => ({
        ...prevState,
        dashboards: prevState.dashboards.map(d => d.id === dashboardId ? dashboard : d),
        currentDashboard: prevState.currentDashboard?.id === dashboardId ? dashboard : prevState.currentDashboard,
        lastSync: new Date().toISOString()
      }));
      return dashboard;
    } catch (error) {
      console.error('Failed to update dashboard:', error);
      throw error;
    }
  }, []);

  const deleteDashboard = useCallback(async (dashboardId: UUID): Promise<void> => {
    try {
      await dashboardAPI.deleteDashboard(dashboardId);
      setState(prevState => ({
        ...prevState,
        dashboards: prevState.dashboards.filter(d => d.id !== dashboardId),
        currentDashboard: prevState.currentDashboard?.id === dashboardId ? null : prevState.currentDashboard,
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to delete dashboard:', error);
      throw error;
    }
  }, []);

  const cloneDashboard = useCallback(async (dashboardId: UUID, name: string): Promise<DashboardResponse> => {
    try {
      const dashboard = await dashboardAPI.cloneDashboard(dashboardId, name);
      setState(prevState => ({
        ...prevState,
        dashboards: [...prevState.dashboards, dashboard],
        lastSync: new Date().toISOString()
      }));
      return dashboard;
    } catch (error) {
      console.error('Failed to clone dashboard:', error);
      throw error;
    }
  }, []);

  const switchDashboard = useCallback(async (dashboardId: UUID): Promise<void> => {
    try {
      const dashboard = await dashboardAPI.getDashboard(dashboardId);
      const widgets = await dashboardAPI.getDashboardWidgets(dashboardId);
      
      setState(prevState => ({
        ...prevState,
        currentDashboard: dashboard,
        widgets: widgets.reduce((acc, widget) => {
          acc[widget.id] = widget;
          return acc;
        }, {} as Record<UUID, DashboardWidget>),
        lastSync: new Date().toISOString()
      }));

      // Load widget data
      await refreshAllWidgets();
    } catch (error) {
      console.error('Failed to switch dashboard:', error);
      throw error;
    }
  }, []);

  // =============================================================================
  // WIDGET MANAGEMENT OPERATIONS
  // =============================================================================

  const addWidget = useCallback(async (dashboardId: UUID, request: CreateWidgetRequest): Promise<DashboardWidget> => {
    try {
      const widget = await dashboardAPI.createWidget(dashboardId, request);
      setState(prevState => ({
        ...prevState,
        widgets: { ...prevState.widgets, [widget.id]: widget },
        widgetLoading: { ...prevState.widgetLoading, [widget.id]: true },
        lastSync: new Date().toISOString()
      }));
      
      // Load widget data
      await refreshWidget(widget.id);
      return widget;
    } catch (error) {
      console.error('Failed to add widget:', error);
      throw error;
    }
  }, []);

  const updateWidget = useCallback(async (widgetId: UUID, request: UpdateWidgetRequest): Promise<DashboardWidget> => {
    try {
      const widget = await dashboardAPI.updateWidget(widgetId, request);
      setState(prevState => ({
        ...prevState,
        widgets: { ...prevState.widgets, [widgetId]: widget },
        lastSync: new Date().toISOString()
      }));
      return widget;
    } catch (error) {
      console.error('Failed to update widget:', error);
      throw error;
    }
  }, []);

  const removeWidget = useCallback(async (widgetId: UUID): Promise<void> => {
    try {
      await dashboardAPI.deleteWidget(widgetId);
      setState(prevState => {
        const newWidgets = { ...prevState.widgets };
        const newWidgetData = { ...prevState.widgetData };
        const newWidgetLoading = { ...prevState.widgetLoading };
        const newWidgetErrors = { ...prevState.widgetErrors };
        
        delete newWidgets[widgetId];
        delete newWidgetData[widgetId];
        delete newWidgetLoading[widgetId];
        delete newWidgetErrors[widgetId];
        
        return {
          ...prevState,
          widgets: newWidgets,
          widgetData: newWidgetData,
          widgetLoading: newWidgetLoading,
          widgetErrors: newWidgetErrors,
          lastSync: new Date().toISOString()
        };
      });
    } catch (error) {
      console.error('Failed to remove widget:', error);
      throw error;
    }
  }, []);

  const moveWidget = useCallback(async (widgetId: UUID, newPosition: { x: number; y: number; width: number; height: number }): Promise<void> => {
    try {
      await dashboardAPI.updateWidgetPosition(widgetId, newPosition);
      setState(prevState => ({
        ...prevState,
        widgets: {
          ...prevState.widgets,
          [widgetId]: {
            ...prevState.widgets[widgetId],
            position: newPosition
          }
        },
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to move widget:', error);
      throw error;
    }
  }, []);

  const refreshWidget = useCallback(async (widgetId: UUID): Promise<void> => {
    try {
      setState(prevState => ({
        ...prevState,
        widgetLoading: { ...prevState.widgetLoading, [widgetId]: true },
        widgetErrors: { ...prevState.widgetErrors, [widgetId]: null }
      }));
      
      const data = await dashboardAPI.getWidgetData(widgetId);
      setState(prevState => ({
        ...prevState,
        widgetData: { ...prevState.widgetData, [widgetId]: data },
        widgetLoading: { ...prevState.widgetLoading, [widgetId]: false },
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to refresh widget:', error);
      setState(prevState => ({
        ...prevState,
        widgetLoading: { ...prevState.widgetLoading, [widgetId]: false },
        widgetErrors: { ...prevState.widgetErrors, [widgetId]: error.message }
      }));
      throw error;
    }
  }, []);

  // =============================================================================
  // DATA AND METRICS OPERATIONS
  // =============================================================================

  const refreshDashboard = useCallback(async (dashboardId?: UUID): Promise<void> => {
    try {
      const targetDashboardId = dashboardId || state.currentDashboard?.id;
      if (!targetDashboardId) return;

      setState(prevState => ({ ...prevState, isConnected: false }));
      
      const [dashboard, widgets, kpis, metrics, alerts] = await Promise.all([
        dashboardAPI.getDashboard(targetDashboardId),
        dashboardAPI.getDashboardWidgets(targetDashboardId),
        dashboardAPI.getDashboardKPIs(targetDashboardId),
        dashboardAPI.getCrossGroupMetrics(),
        dashboardAPI.getDashboardAlerts(targetDashboardId)
      ]);

      setState(prevState => ({
        ...prevState,
        currentDashboard: dashboard,
        widgets: widgets.reduce((acc, widget) => {
          acc[widget.id] = widget;
          return acc;
        }, {} as Record<UUID, DashboardWidget>),
        kpis: kpis.reduce((acc, kpi) => {
          acc[kpi.id] = kpi;
          return acc;
        }, {} as Record<UUID, DashboardKPI>),
        crossGroupMetrics: metrics,
        alerts: alerts,
        activeAlerts: alerts.filter(alert => alert.status === 'active'),
        criticalAlerts: alerts.filter(alert => alert.severity === 'critical' && alert.status === 'active').length,
        isConnected: true,
        lastSync: new Date().toISOString()
      }));

      // Load all widget data
      await refreshAllWidgets();
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
      setState(prevState => ({ ...prevState, isConnected: false }));
      throw error;
    }
  }, [state.currentDashboard]);

  const refreshAllWidgets = useCallback(async (): Promise<void> => {
    try {
      const widgetIds = Object.keys(state.widgets);
      if (widgetIds.length === 0) return;

      // Set all widgets to loading
      setState(prevState => ({
        ...prevState,
        widgetLoading: widgetIds.reduce((acc, id) => {
          acc[id] = true;
          return acc;
        }, {} as Record<UUID, boolean>),
        widgetErrors: widgetIds.reduce((acc, id) => {
          acc[id] = null;
          return acc;
        }, {} as Record<UUID, string | null>)
      }));

      // Load all widget data in parallel
      const widgetDataPromises = widgetIds.map(async (widgetId) => {
        try {
          const data = await dashboardAPI.getWidgetData(widgetId);
          return { widgetId, data, error: null };
        } catch (error) {
          return { widgetId, data: null, error: error.message };
        }
      });

      const results = await Promise.all(widgetDataPromises);

      setState(prevState => {
        const newWidgetData = { ...prevState.widgetData };
        const newWidgetLoading = { ...prevState.widgetLoading };
        const newWidgetErrors = { ...prevState.widgetErrors };

        results.forEach(({ widgetId, data, error }) => {
          newWidgetLoading[widgetId] = false;
          if (error) {
            newWidgetErrors[widgetId] = error;
          } else {
            newWidgetData[widgetId] = data;
            newWidgetErrors[widgetId] = null;
          }
        });

        return {
          ...prevState,
          widgetData: newWidgetData,
          widgetLoading: newWidgetLoading,
          widgetErrors: newWidgetErrors,
          lastSync: new Date().toISOString()
        };
      });
    } catch (error) {
      console.error('Failed to refresh all widgets:', error);
      throw error;
    }
  }, [state.widgets]);

  const getKPIData = useCallback(async (kpiId: UUID, timeRange = '24h'): Promise<any> => {
    try {
      return await dashboardAPI.getKPIData(kpiId, timeRange);
    } catch (error) {
      console.error('Failed to get KPI data:', error);
      throw error;
    }
  }, []);

  const getCrossGroupMetrics = useCallback(async (groups: string[], timeRange = '24h'): Promise<Record<string, any>> => {
    try {
      const metrics = await dashboardAPI.getCrossGroupMetrics(groups, timeRange);
      setState(prevState => ({
        ...prevState,
        crossGroupMetrics: { ...prevState.crossGroupMetrics, ...metrics },
        lastSync: new Date().toISOString()
      }));
      return metrics;
    } catch (error) {
      console.error('Failed to get cross-group metrics:', error);
      throw error;
    }
  }, []);

  // =============================================================================
  // ALERT MANAGEMENT OPERATIONS
  // =============================================================================

  const acknowledgeAlert = useCallback(async (alertId: UUID): Promise<void> => {
    try {
      await dashboardAPI.acknowledgeAlert(alertId);
      setState(prevState => ({
        ...prevState,
        acknowledgedAlerts: new Set([...prevState.acknowledgedAlerts, alertId]),
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      throw error;
    }
  }, []);

  const dismissAlert = useCallback(async (alertId: UUID): Promise<void> => {
    try {
      await dashboardAPI.dismissAlert(alertId);
      setState(prevState => ({
        ...prevState,
        activeAlerts: prevState.activeAlerts.filter(alert => alert.id !== alertId),
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
      throw error;
    }
  }, []);

  const createAlert = useCallback(async (alertRule: AlertRule): Promise<DashboardAlert> => {
    try {
      const alert = await dashboardAPI.createAlert(alertRule);
      setState(prevState => ({
        ...prevState,
        alerts: [...prevState.alerts, alert],
        lastSync: new Date().toISOString()
      }));
      return alert;
    } catch (error) {
      console.error('Failed to create alert:', error);
      throw error;
    }
  }, []);

  const updateAlert = useCallback(async (alertId: UUID, alertRule: AlertRule): Promise<DashboardAlert> => {
    try {
      const alert = await dashboardAPI.updateAlert(alertId, alertRule);
      setState(prevState => ({
        ...prevState,
        alerts: prevState.alerts.map(a => a.id === alertId ? alert : a),
        lastSync: new Date().toISOString()
      }));
      return alert;
    } catch (error) {
      console.error('Failed to update alert:', error);
      throw error;
    }
  }, []);

  // =============================================================================
  // ANALYTICS AND INSIGHTS OPERATIONS
  // =============================================================================

  const getDashboardAnalytics = useCallback(async (dashboardId?: UUID, timeRange = '7d'): Promise<DashboardAnalyticsResponse> => {
    try {
      const targetDashboardId = dashboardId || state.currentDashboard?.id;
      if (!targetDashboardId) throw new Error('No dashboard selected');

      const analytics = await dashboardAPI.getDashboardAnalytics(targetDashboardId, timeRange);
      setState(prevState => ({
        ...prevState,
        dashboardAnalytics: analytics,
        lastSync: new Date().toISOString()
      }));
      return analytics;
    } catch (error) {
      console.error('Failed to get dashboard analytics:', error);
      throw error;
    }
  }, [state.currentDashboard]);

  const getPredictiveInsights = useCallback(async (scope: string[], timeRange = '30d'): Promise<PredictiveInsightResponse[]> => {
    try {
      const insights = await dashboardAPI.getPredictiveInsights(scope, timeRange);
      setState(prevState => ({
        ...prevState,
        predictiveInsights: insights,
        lastSync: new Date().toISOString()
      }));
      return insights;
    } catch (error) {
      console.error('Failed to get predictive insights:', error);
      throw error;
    }
  }, []);

  const generateExecutiveReport = useCallback(async (reportType: string, parameters: Record<string, any>): Promise<ExecutiveReportResponse> => {
    try {
      const report = await dashboardAPI.generateExecutiveReport(reportType, parameters);
      setState(prevState => ({
        ...prevState,
        executiveReports: [...prevState.executiveReports, report],
        lastSync: new Date().toISOString()
      }));
      return report;
    } catch (error) {
      console.error('Failed to generate executive report:', error);
      throw error;
    }
  }, []);

  // =============================================================================
  // FILTERING AND DRILL-DOWN OPERATIONS
  // =============================================================================

  const applyFilter = useCallback(async (filter: DashboardFilter): Promise<void> => {
    try {
      setState(prevState => ({
        ...prevState,
        activeFilters: { ...prevState.activeFilters, [filter.id]: filter },
        filterHistory: [...prevState.filterHistory, filter]
      }));
      
      // Refresh widgets with new filter
      await refreshAllWidgets();
    } catch (error) {
      console.error('Failed to apply filter:', error);
      throw error;
    }
  }, [refreshAllWidgets]);

  const removeFilter = useCallback(async (filterId: string): Promise<void> => {
    try {
      setState(prevState => {
        const newActiveFilters = { ...prevState.activeFilters };
        delete newActiveFilters[filterId];
        return {
          ...prevState,
          activeFilters: newActiveFilters
        };
      });
      
      // Refresh widgets without the filter
      await refreshAllWidgets();
    } catch (error) {
      console.error('Failed to remove filter:', error);
      throw error;
    }
  }, [refreshAllWidgets]);

  const clearAllFilters = useCallback(async (): Promise<void> => {
    try {
      setState(prevState => ({
        ...prevState,
        activeFilters: {},
        drillDownPath: []
      }));
      
      // Refresh widgets without filters
      await refreshAllWidgets();
    } catch (error) {
      console.error('Failed to clear all filters:', error);
      throw error;
    }
  }, [refreshAllWidgets]);

  const drillDown = useCallback(async (path: string, parameters: Record<string, any>): Promise<void> => {
    try {
      setState(prevState => ({
        ...prevState,
        drillDownPath: [...prevState.drillDownPath, path],
        activeFilters: { ...prevState.activeFilters, ...parameters }
      }));
      
      // Refresh widgets with drill-down context
      await refreshAllWidgets();
    } catch (error) {
      console.error('Failed to drill down:', error);
      throw error;
    }
  }, [refreshAllWidgets]);

  const drillUp = useCallback(async (): Promise<void> => {
    try {
      setState(prevState => ({
        ...prevState,
        drillDownPath: prevState.drillDownPath.slice(0, -1)
      }));
      
      // Refresh widgets with updated drill-down context
      await refreshAllWidgets();
    } catch (error) {
      console.error('Failed to drill up:', error);
      throw error;
    }
  }, [refreshAllWidgets]);

  // =============================================================================
  // LAYOUT AND PERSONALIZATION OPERATIONS
  // =============================================================================

  const updateLayout = useCallback(async (layout: DashboardLayout): Promise<void> => {
    try {
      await dashboardAPI.updateDashboardLayout(state.currentDashboard?.id || '', layout);
      setState(prevState => ({
        ...prevState,
        currentLayout: layout,
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to update layout:', error);
      throw error;
    }
  }, [state.currentDashboard]);

  const saveUserPreferences = useCallback(async (preferences: Record<string, any>): Promise<void> => {
    try {
      if (userId) {
        await dashboardAPI.saveUserPreferences(userId, preferences);
      } else {
        console.warn('saveUserPreferences called without userId; applying locally only');
      }
      setState(prevState => ({
        ...prevState,
        userPreferences: { ...prevState.userPreferences, ...preferences },
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to save user preferences:', error);
      throw error;
    }
  }, [userId]);

  const changeTheme = useCallback(async (themeId: string): Promise<void> => {
    try {
      const theme = state.availableThemes.find(t => t.id === themeId);
      if (!theme) throw new Error('Theme not found');

      if (userId) {
        await dashboardAPI.updateUserTheme(userId, themeId);
      } else {
        console.warn('changeTheme called without userId; updating UI state only');
      }
      setState(prevState => ({
        ...prevState,
        currentTheme: theme,
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to change theme:', error);
      throw error;
    }
  }, [userId, state.availableThemes]);

  const resetLayout = useCallback(async (): Promise<void> => {
    try {
      const defaultLayout: DashboardLayout = {
        type: 'grid',
        columns: 12,
        rowHeight: 100,
        margin: [10, 10],
        containerPadding: [10, 10],
        breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
        cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }
      };
      
      await updateLayout(defaultLayout);
    } catch (error) {
      console.error('Failed to reset layout:', error);
      throw error;
    }
  }, [updateLayout]);

  // =============================================================================
  // REAL-TIME UPDATE OPERATIONS
  // =============================================================================

  const enableRealTimeUpdates = useCallback((): void => {
    setState(prevState => ({ ...prevState, isRealTimeEnabled: true }));
    
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }
    
    updateIntervalRef.current = setInterval(() => {
      refreshAllWidgets().catch(console.error);
    }, state.updateFrequency);
  }, [state.updateFrequency, refreshAllWidgets]);

  const disableRealTimeUpdates = useCallback((): void => {
    setState(prevState => ({ ...prevState, isRealTimeEnabled: false }));
    
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
  }, []);

  const setUpdateFrequency = useCallback((frequency: number): void => {
    setState(prevState => ({ ...prevState, updateFrequency: frequency }));
    
    if (state.isRealTimeEnabled) {
      disableRealTimeUpdates();
      enableRealTimeUpdates();
    }
  }, [state.isRealTimeEnabled, disableRealTimeUpdates, enableRealTimeUpdates]);

  // =============================================================================
  // UTILITY OPERATIONS
  // =============================================================================

  const refresh = useCallback(async (): Promise<void> => {
    try {
      setState(prevState => ({ ...prevState, isConnected: false }));
      
      // Fetch all dashboard data
      const [dashboards, themes, preferences] = await Promise.all([
        dashboardAPI.getDashboards(),
        dashboardAPI.getAvailableThemes(),
        userId ? dashboardAPI.getUserPreferences(userId) : Promise.resolve({})
      ]);

      setState(prevState => ({
        ...prevState,
        dashboards,
        availableThemes: themes,
        userPreferences: preferences,
        isConnected: true,
        lastSync: new Date().toISOString()
      }));

      // Load default dashboard if specified
      if (defaultDashboardId && !state.currentDashboard) {
        await switchDashboard(defaultDashboardId);
      }
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
      setState(prevState => ({ ...prevState, isConnected: false }));
      throw error;
    }
  }, [userId, defaultDashboardId, state.currentDashboard, switchDashboard]);

  const disconnect = useCallback((): void => {
    if (enableRealTime) {
      dashboardAPI.unsubscribeFromEvents();
    }
    
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
    
    setState(prevState => ({
      ...prevState,
      isConnected: false,
      websocketConnected: false,
      isRealTimeEnabled: false
    }));
  }, [enableRealTime]);

  const reconnect = useCallback(async (): Promise<void> => {
    disconnect();
    
    if (autoConnect) {
      try {
        await refresh();
        
        if (enableRealTime) {
          dashboardAPI.subscribeToEvents(handleDashboardEvent);
          enableRealTimeUpdates();
        }
        
        // Set up refresh interval
        refreshIntervalRef.current = setInterval(refresh, refreshInterval);
        
        setState(prevState => ({
          ...prevState,
          websocketConnected: enableRealTime
        }));
      } catch (error) {
        console.error('Failed to reconnect:', error);
        
        // Retry with exponential backoff
        if (retryAttempts > 0) {
          retryTimeoutRef.current = setTimeout(() => {
            reconnect();
          }, Math.min(30000, 1000 * Math.pow(2, 3 - retryAttempts)));
        }
      }
    }
  }, [autoConnect, enableRealTime, refresh, refreshInterval, retryAttempts, handleDashboardEvent, disconnect, enableRealTimeUpdates]);

  const exportDashboard = useCallback(async (dashboardId: UUID, format: 'pdf' | 'png' | 'json'): Promise<Blob> => {
    try {
      return await dashboardAPI.exportDashboard(dashboardId, format);
    } catch (error) {
      console.error('Failed to export dashboard:', error);
      throw error;
    }
  }, []);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Initialize dashboard connection
  useEffect(() => {
    if (autoConnect) {
      reconnect();
    }
    
    return () => {
      disconnect();
    };
  }, [autoConnect, reconnect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // =============================================================================
  // MEMOIZED OPERATIONS
  // =============================================================================

  const operations = useMemo<DashboardHookOperations>(() => ({
    createDashboard,
    updateDashboard,
    deleteDashboard,
    cloneDashboard,
    switchDashboard,
    addWidget,
    updateWidget,
    removeWidget,
    moveWidget,
    refreshWidget,
    refreshDashboard,
    refreshAllWidgets,
    getKPIData,
    getCrossGroupMetrics,
    acknowledgeAlert,
    dismissAlert,
    createAlert,
    updateAlert,
    getDashboardAnalytics,
    getPredictiveInsights,
    generateExecutiveReport,
    applyFilter,
    removeFilter,
    clearAllFilters,
    drillDown,
    drillUp,
    updateLayout,
    saveUserPreferences,
    changeTheme,
    resetLayout,
    enableRealTime: enableRealTimeUpdates,
    disableRealTime: disableRealTimeUpdates,
    setUpdateFrequency,
    refresh,
    disconnect,
    reconnect,
    exportDashboard
  }), [
    createDashboard,
    updateDashboard,
    deleteDashboard,
    cloneDashboard,
    switchDashboard,
    addWidget,
    updateWidget,
    removeWidget,
    moveWidget,
    refreshWidget,
    refreshDashboard,
    refreshAllWidgets,
    getKPIData,
    getCrossGroupMetrics,
    acknowledgeAlert,
    dismissAlert,
    createAlert,
    updateAlert,
    getDashboardAnalytics,
    getPredictiveInsights,
    generateExecutiveReport,
    applyFilter,
    removeFilter,
    clearAllFilters,
    drillDown,
    drillUp,
    updateLayout,
    saveUserPreferences,
    changeTheme,
    resetLayout,
    enableRealTimeUpdates,
    disableRealTimeUpdates,
    setUpdateFrequency,
    refresh,
    disconnect,
    reconnect,
    exportDashboard
  ]);

  return [state, operations];
};

export default useIntelligentDashboard;