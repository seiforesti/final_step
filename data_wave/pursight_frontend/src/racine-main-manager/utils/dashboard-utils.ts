/**
 * Advanced Dashboard Utilities
 * Provides comprehensive utilities for the intelligent dashboard system
 */

import {
  DashboardConfiguration,
  DashboardWidget,
  DashboardKPI,
  DashboardAlert,
  DashboardAnalytics,
  DashboardFilter,
  DashboardLayout,
  DashboardPersonalization,
  PredictiveInsight,
  CrossGroupVisualization,
  DashboardTheme,
  DashboardExport,
  DashboardNotification
} from '../types/dashboard.types';

import { UUID, ISODateString } from '../types/racine-core.types';

/**
 * Advanced Dashboard Utilities
 * Provides comprehensive utilities for the intelligent dashboard system
 */

// ============================================================================
// DASHBOARD CONFIGURATION MANAGEMENT
// ============================================================================

export class DashboardConfigurationManager {
  private dashboards: Map<UUID, DashboardConfiguration> = new Map();
  private templates: Map<string, DashboardConfiguration> = new Map();

  /**
   * Create new dashboard configuration
   */
  createDashboard(
    name: string,
    type: 'executive' | 'operational' | 'analytical' | 'compliance' | 'custom',
    ownerId: UUID,
    config: {
      description?: string;
      groups: string[];
      refreshInterval?: number;
      isPublic?: boolean;
      allowSharing?: boolean;
      enableRealTime?: boolean;
    }
  ): DashboardConfiguration {
    const dashboardId = this.generateDashboardId();
    
    const dashboard: DashboardConfiguration = {
      id: dashboardId,
      name,
      description: config.description || '',
      type,
      ownerId,
      groups: config.groups,
      widgets: [],
      layout: this.createDefaultLayout(type),
      filters: [],
      theme: this.getDefaultTheme(),
      personalization: {
        userId: ownerId,
        customizations: {},
        preferences: {
          defaultView: 'grid',
          refreshInterval: config.refreshInterval || 300000, // 5 minutes
          enableAnimations: true,
          compactMode: false,
          showLegends: true
        },
        savedViews: [],
        bookmarks: [],
        notifications: {
          enabled: true,
          types: ['alerts', 'updates', 'insights'],
          channels: ['in-app', 'email']
        }
      },
      permissions: {
        read: config.isPublic ? ['*'] : [ownerId],
        write: [ownerId],
        share: config.allowSharing ? [ownerId] : [],
        admin: [ownerId]
      },
      settings: {
        refreshInterval: config.refreshInterval || 300000,
        enableRealTime: config.enableRealTime || false,
        enableExport: true,
        enableFilters: true,
        enableDrillDown: true,
        maxWidgets: 50,
        cacheTimeout: 60000
      },
      analytics: this.initializeDashboardAnalytics(),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastViewed: new Date(),
      version: 1
    };

    this.dashboards.set(dashboardId, dashboard);
    return dashboard;
  }

  /**
   * Clone dashboard with modifications
   */
  cloneDashboard(
    sourceId: UUID,
    newName: string,
    ownerId: UUID,
    modifications?: Partial<DashboardConfiguration>
  ): DashboardConfiguration {
    const source = this.dashboards.get(sourceId);
    if (!source) throw new Error('Source dashboard not found');

    const clonedDashboard: DashboardConfiguration = {
      ...source,
      id: this.generateDashboardId(),
      name: newName,
      ownerId,
      widgets: source.widgets.map(widget => ({ ...widget, id: this.generateWidgetId() })),
      permissions: {
        read: [ownerId],
        write: [ownerId],
        share: [ownerId],
        admin: [ownerId]
      },
      analytics: this.initializeDashboardAnalytics(),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastViewed: new Date(),
      version: 1,
      ...modifications
    };

    this.dashboards.set(clonedDashboard.id, clonedDashboard);
    return clonedDashboard;
  }

  /**
   * Create dashboard template
   */
  createTemplate(
    name: string,
    type: string,
    configuration: Partial<DashboardConfiguration>
  ): void {
    const template: DashboardConfiguration = {
      id: this.generateDashboardId(),
      name,
      description: `Template for ${type} dashboards`,
      type: 'custom',
      ownerId: 'system' as UUID,
      groups: [],
      widgets: [],
      layout: this.createDefaultLayout('custom'),
      filters: [],
      theme: this.getDefaultTheme(),
      personalization: {
        userId: 'system' as UUID,
        customizations: {},
        preferences: {
          defaultView: 'grid',
          refreshInterval: 300000,
          enableAnimations: true,
          compactMode: false,
          showLegends: true
        },
        savedViews: [],
        bookmarks: [],
        notifications: {
          enabled: true,
          types: ['alerts', 'updates', 'insights'],
          channels: ['in-app']
        }
      },
      permissions: {
        read: ['*'],
        write: [],
        share: [],
        admin: ['system' as UUID]
      },
      settings: {
        refreshInterval: 300000,
        enableRealTime: false,
        enableExport: true,
        enableFilters: true,
        enableDrillDown: true,
        maxWidgets: 50,
        cacheTimeout: 60000
      },
      analytics: this.initializeDashboardAnalytics(),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastViewed: new Date(),
      version: 1,
      ...configuration
    };

    this.templates.set(name, template);
  }

  private createDefaultLayout(type: string): DashboardLayout {
    const layouts: Record<string, DashboardLayout> = {
      executive: {
        type: 'grid',
        columns: 4,
        rows: 3,
        responsive: true,
        breakpoints: {
          lg: { columns: 4, width: 1200 },
          md: { columns: 3, width: 996 },
          sm: { columns: 2, width: 768 },
          xs: { columns: 1, width: 480 }
        },
        widgets: []
      },
      operational: {
        type: 'masonry',
        columns: 3,
        rows: 4,
        responsive: true,
        breakpoints: {
          lg: { columns: 3, width: 1200 },
          md: { columns: 2, width: 996 },
          sm: { columns: 2, width: 768 },
          xs: { columns: 1, width: 480 }
        },
        widgets: []
      },
      analytical: {
        type: 'flex',
        columns: 2,
        rows: 2,
        responsive: true,
        breakpoints: {
          lg: { columns: 2, width: 1200 },
          md: { columns: 2, width: 996 },
          sm: { columns: 1, width: 768 },
          xs: { columns: 1, width: 480 }
        },
        widgets: []
      },
      compliance: {
        type: 'grid',
        columns: 3,
        rows: 4,
        responsive: true,
        breakpoints: {
          lg: { columns: 3, width: 1200 },
          md: { columns: 2, width: 996 },
          sm: { columns: 2, width: 768 },
          xs: { columns: 1, width: 480 }
        },
        widgets: []
      }
    };

    return layouts[type] || layouts.custom || {
      type: 'grid',
      columns: 3,
      rows: 3,
      responsive: true,
      breakpoints: {
        lg: { columns: 3, width: 1200 },
        md: { columns: 2, width: 996 },
        sm: { columns: 2, width: 768 },
        xs: { columns: 1, width: 480 }
      },
      widgets: []
    };
  }

  private getDefaultTheme(): DashboardTheme {
    return {
      name: 'default',
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1e293b',
        border: '#e2e8f0'
      },
      typography: {
        fontFamily: 'Inter, sans-serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem'
        },
        fontWeight: {
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        }
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem'
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
      }
    };
  }

  private initializeDashboardAnalytics(): DashboardAnalytics {
    return {
      views: 0,
      uniqueUsers: 0,
      avgViewDuration: 0,
      interactionCount: 0,
      exportCount: 0,
      shareCount: 0,
      widgetInteractions: {},
      filterUsage: {},
      performanceMetrics: {
        loadTime: 0,
        renderTime: 0,
        dataFetchTime: 0,
        errorRate: 0
      },
      userBehavior: {
        mostViewedWidgets: [],
        commonFilters: [],
        peakUsageHours: [],
        deviceTypes: {}
      },
      lastUpdated: new Date().toISOString() as ISODateString
    };
  }

  private generateDashboardId(): UUID {
    return `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as UUID;
  }

  private generateWidgetId(): UUID {
    return `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as UUID;
  }
}

// ============================================================================
// WIDGET MANAGEMENT UTILITIES
// ============================================================================

export class DashboardWidgetManager {
  private widgets: Map<UUID, DashboardWidget> = new Map();
  private widgetTemplates: Map<string, Partial<DashboardWidget>> = new Map();

  /**
   * Create new dashboard widget
   */
  createWidget(
    type: 'chart' | 'table' | 'metric' | 'gauge' | 'map' | 'text' | 'iframe' | 'custom',
    title: string,
    config: {
      dataSource: string;
      query?: string;
      visualization?: any;
      size?: { width: number; height: number };
      position?: { x: number; y: number };
      refreshInterval?: number;
      filters?: DashboardFilter[];
    }
  ): DashboardWidget {
    const widgetId = this.generateWidgetId();
    
    const widget: DashboardWidget = {
      id: widgetId,
      type,
      title,
      description: '',
      dataSource: config.dataSource,
      query: config.query || '',
      visualization: config.visualization || this.getDefaultVisualization(type),
      data: null,
      loading: false,
      error: null,
      size: config.size || this.getDefaultSize(type),
      position: config.position || { x: 0, y: 0 },
      zIndex: 1,
      visible: true,
      interactive: true,
      refreshInterval: config.refreshInterval || 300000,
      lastRefresh: new Date().toISOString() as ISODateString,
      filters: config.filters || [],
      permissions: {
        read: ['*'],
        edit: [],
        delete: []
      },
      settings: {
        enableExport: true,
        enableFullscreen: true,
        enableRefresh: true,
        enableFilters: true,
        showHeader: true,
        showBorder: true
      },
      analytics: {
        views: 0,
        interactions: 0,
        exports: 0,
        errors: 0,
        avgLoadTime: 0,
        lastInteraction: new Date().toISOString() as ISODateString
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.widgets.set(widgetId, widget);
    return widget;
  }

  /**
   * Update widget data
   */
  updateWidgetData(widgetId: UUID, data: any, metadata?: any): void {
    const widget = this.widgets.get(widgetId);
    if (!widget) throw new Error('Widget not found');

    widget.data = data;
    widget.loading = false;
    widget.error = null;
    widget.lastRefresh = new Date().toISOString() as ISODateString;
    widget.updatedAt = new Date();

    if (metadata) {
      widget.metadata = { ...widget.metadata, ...metadata };
    }

    // Update analytics
    widget.analytics.views++;
  }

  /**
   * Update widget error state
   */
  updateWidgetError(widgetId: UUID, error: string): void {
    const widget = this.widgets.get(widgetId);
    if (!widget) throw new Error('Widget not found');

    widget.loading = false;
    widget.error = error;
    widget.updatedAt = new Date();
    widget.analytics.errors++;
  }

  /**
   * Apply filters to widget
   */
  applyFilters(widgetId: UUID, filters: DashboardFilter[]): void {
    const widget = this.widgets.get(widgetId);
    if (!widget) throw new Error('Widget not found');

    widget.filters = filters;
    widget.updatedAt = new Date();
    
    // Trigger data refresh
    this.refreshWidget(widgetId);
  }

  /**
   * Refresh widget data
   */
  refreshWidget(widgetId: UUID): void {
    const widget = this.widgets.get(widgetId);
    if (!widget) throw new Error('Widget not found');

    widget.loading = true;
    widget.error = null;
    widget.updatedAt = new Date();
  }

  /**
   * Resize widget
   */
  resizeWidget(widgetId: UUID, size: { width: number; height: number }): void {
    const widget = this.widgets.get(widgetId);
    if (!widget) throw new Error('Widget not found');

    widget.size = size;
    widget.updatedAt = new Date();
    widget.analytics.interactions++;
  }

  /**
   * Move widget position
   */
  moveWidget(widgetId: UUID, position: { x: number; y: number }): void {
    const widget = this.widgets.get(widgetId);
    if (!widget) throw new Error('Widget not found');

    widget.position = position;
    widget.updatedAt = new Date();
    widget.analytics.interactions++;
  }

  private getDefaultVisualization(type: string): any {
    const visualizations: Record<string, any> = {
      chart: {
        type: 'line',
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { display: true },
            y: { display: true }
          },
          plugins: {
            legend: { display: true, position: 'top' },
            tooltip: { enabled: true }
          }
        }
      },
      table: {
        columns: [],
        pagination: true,
        sorting: true,
        filtering: true,
        pageSize: 10
      },
      metric: {
        format: 'number',
        unit: '',
        precision: 2,
        showTrend: true,
        trendPeriod: '7d'
      },
      gauge: {
        min: 0,
        max: 100,
        unit: '%',
        thresholds: [
          { value: 70, color: '#10b981' },
          { value: 90, color: '#f59e0b' },
          { value: 100, color: '#ef4444' }
        ]
      },
      map: {
        center: [0, 0],
        zoom: 2,
        style: 'light',
        markers: [],
        heatmap: false
      },
      text: {
        content: '',
        markdown: true,
        fontSize: 'base',
        alignment: 'left'
      }
    };

    return visualizations[type] || {};
  }

  private getDefaultSize(type: string): { width: number; height: number } {
    const sizes: Record<string, { width: number; height: number }> = {
      chart: { width: 400, height: 300 },
      table: { width: 600, height: 400 },
      metric: { width: 200, height: 120 },
      gauge: { width: 250, height: 200 },
      map: { width: 500, height: 400 },
      text: { width: 300, height: 150 },
      iframe: { width: 400, height: 300 },
      custom: { width: 300, height: 200 }
    };

    return sizes[type] || { width: 300, height: 200 };
  }

  private generateWidgetId(): UUID {
    return `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as UUID;
  }
}

// ============================================================================
// KPI CALCULATION UTILITIES
// ============================================================================

export class DashboardKPICalculator {
  /**
   * Calculate KPI value with trend analysis
   */
  calculateKPI(
    data: any[],
    config: {
      metric: string;
      aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median';
      timeField?: string;
      valueField: string;
      filters?: Record<string, any>;
      trendPeriod?: string;
    }
  ): DashboardKPI {
    // Filter data if filters provided
    let filteredData = data;
    if (config.filters) {
      filteredData = this.applyFilters(data, config.filters);
    }

    // Calculate current value
    const currentValue = this.calculateAggregation(filteredData, config.valueField, config.aggregation);

    // Calculate trend if time field provided
    let trend = null;
    if (config.timeField && config.trendPeriod) {
      trend = this.calculateTrend(filteredData, config.timeField, config.valueField, config.aggregation, config.trendPeriod);
    }

    return {
      id: `kpi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as UUID,
      name: config.metric,
      value: currentValue,
      unit: '',
      format: 'number',
      trend: trend ? {
        direction: trend.direction,
        percentage: trend.percentage,
        period: config.trendPeriod || '7d',
        previousValue: trend.previousValue
      } : undefined,
      status: this.determineKPIStatus(currentValue, trend),
      thresholds: [],
      description: `${config.aggregation} of ${config.valueField}`,
      category: 'general',
      priority: 'medium',
      lastUpdated: new Date().toISOString() as ISODateString,
      source: 'calculated',
      metadata: {
        dataPoints: filteredData.length,
        calculation: config.aggregation,
        filters: config.filters
      }
    };
  }

  /**
   * Calculate multiple KPIs in batch
   */
  calculateBatchKPIs(
    data: any[],
    configs: Array<{
      metric: string;
      aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median';
      timeField?: string;
      valueField: string;
      filters?: Record<string, any>;
      trendPeriod?: string;
    }>
  ): DashboardKPI[] {
    return configs.map(config => this.calculateKPI(data, config));
  }

  /**
   * Calculate cross-group KPIs
   */
  calculateCrossGroupKPIs(
    groupData: Record<string, any[]>,
    config: {
      groups: string[];
      metric: string;
      aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median';
      valueField: string;
      correlationAnalysis?: boolean;
    }
  ): {
    individual: Record<string, DashboardKPI>;
    combined: DashboardKPI;
    correlations?: Array<{ group1: string; group2: string; correlation: number }>;
  } {
    const individual: Record<string, DashboardKPI> = {};
    const allData: any[] = [];

    // Calculate individual KPIs for each group
    config.groups.forEach(group => {
      if (groupData[group]) {
        const groupKPI = this.calculateKPI(groupData[group], {
          metric: `${config.metric} (${group})`,
          aggregation: config.aggregation,
          valueField: config.valueField
        });
        individual[group] = groupKPI;
        allData.push(...groupData[group]);
      }
    });

    // Calculate combined KPI
    const combined = this.calculateKPI(allData, {
      metric: `${config.metric} (Combined)`,
      aggregation: config.aggregation,
      valueField: config.valueField
    });

    // Calculate correlations if requested
    let correlations: Array<{ group1: string; group2: string; correlation: number }> | undefined;
    if (config.correlationAnalysis) {
      correlations = this.calculateCorrelations(groupData, config.groups, config.valueField);
    }

    return {
      individual,
      combined,
      correlations
    };
  }

  private applyFilters(data: any[], filters: Record<string, any>): any[] {
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (Array.isArray(value)) {
          return value.includes(item[key]);
        }
        if (typeof value === 'object' && value !== null) {
          if (value.min !== undefined && item[key] < value.min) return false;
          if (value.max !== undefined && item[key] > value.max) return false;
          return true;
        }
        return item[key] === value;
      });
    });
  }

  private calculateAggregation(
    data: any[],
    field: string,
    aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median'
  ): number {
    if (data.length === 0) return 0;

    const values = data.map(item => Number(item[field]) || 0);

    switch (aggregation) {
      case 'sum':
        return values.reduce((sum, val) => sum + val, 0);
      case 'avg':
        return values.reduce((sum, val) => sum + val, 0) / values.length;
      case 'count':
        return data.length;
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      case 'median':
        const sorted = values.sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
      default:
        return 0;
    }
  }

  private calculateTrend(
    data: any[],
    timeField: string,
    valueField: string,
    aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median',
    period: string
  ): { direction: 'up' | 'down' | 'stable'; percentage: number; previousValue: number } {
    const now = new Date();
    const periodMs = this.parsePeriod(period);
    const cutoffDate = new Date(now.getTime() - periodMs);

    const currentData = data.filter(item => new Date(item[timeField]) >= cutoffDate);
    const previousData = data.filter(item => {
      const itemDate = new Date(item[timeField]);
      return itemDate >= new Date(cutoffDate.getTime() - periodMs) && itemDate < cutoffDate;
    });

    const currentValue = this.calculateAggregation(currentData, valueField, aggregation);
    const previousValue = this.calculateAggregation(previousData, valueField, aggregation);

    if (previousValue === 0) {
      return { direction: 'stable', percentage: 0, previousValue };
    }

    const percentage = ((currentValue - previousValue) / previousValue) * 100;
    const direction = Math.abs(percentage) < 1 ? 'stable' : percentage > 0 ? 'up' : 'down';

    return { direction, percentage: Math.abs(percentage), previousValue };
  }

  private parsePeriod(period: string): number {
    const match = period.match(/^(\d+)([hdwmy])$/);
    if (!match) return 24 * 60 * 60 * 1000; // Default to 1 day

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      case 'w': return value * 7 * 24 * 60 * 60 * 1000;
      case 'm': return value * 30 * 24 * 60 * 60 * 1000;
      case 'y': return value * 365 * 24 * 60 * 60 * 1000;
      default: return 24 * 60 * 60 * 1000;
    }
  }

  private determineKPIStatus(
    value: number,
    trend?: { direction: 'up' | 'down' | 'stable'; percentage: number }
  ): 'good' | 'warning' | 'critical' | 'neutral' {
    // Simplified status determination - real implementation would use thresholds
    if (!trend) return 'neutral';
    
    if (trend.direction === 'up' && trend.percentage > 10) return 'good';
    if (trend.direction === 'down' && trend.percentage > 10) return 'warning';
    if (trend.direction === 'down' && trend.percentage > 25) return 'critical';
    
    return 'neutral';
  }

  private calculateCorrelations(
    groupData: Record<string, any[]>,
    groups: string[],
    valueField: string
  ): Array<{ group1: string; group2: string; correlation: number }> {
    const correlations: Array<{ group1: string; group2: string; correlation: number }> = [];

    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        const group1 = groups[i];
        const group2 = groups[j];
        
        if (groupData[group1] && groupData[group2]) {
          const correlation = this.calculatePearsonCorrelation(
            groupData[group1].map(item => Number(item[valueField]) || 0),
            groupData[group2].map(item => Number(item[valueField]) || 0)
          );
          
          correlations.push({ group1, group2, correlation });
        }
      }
    }

    return correlations;
  }

  private calculatePearsonCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n === 0) return 0;

    const sumX = x.slice(0, n).reduce((sum, val) => sum + val, 0);
    const sumY = y.slice(0, n).reduce((sum, val) => sum + val, 0);
    const sumXY = x.slice(0, n).reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.slice(0, n).reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.slice(0, n).reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }
}

// ============================================================================
// ALERT PROCESSING UTILITIES
// ============================================================================

export class DashboardAlertProcessor {
  private alerts: Map<UUID, DashboardAlert> = new Map();
  private alertRules: Map<UUID, any> = new Map();

  /**
   * Process alerts for dashboard data
   */
  processAlerts(
    data: any,
    rules: Array<{
      id: string;
      condition: string;
      threshold: number;
      comparison: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'ne';
      field: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      message: string;
    }>
  ): DashboardAlert[] {
    const alerts: DashboardAlert[] = [];

    rules.forEach(rule => {
      const value = this.extractValue(data, rule.field);
      const triggered = this.evaluateCondition(value, rule.threshold, rule.comparison);

      if (triggered) {
        const alert: DashboardAlert = {
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as UUID,
          ruleId: rule.id as UUID,
          title: rule.message,
          message: `${rule.field} is ${value} (threshold: ${rule.threshold})`,
          severity: rule.severity,
          status: 'active',
          value,
          threshold: rule.threshold,
          field: rule.field,
          source: 'dashboard',
          category: 'threshold',
          actions: [],
          metadata: {
            rule: rule.condition,
            comparison: rule.comparison,
            triggeredAt: new Date().toISOString()
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          acknowledgedAt: undefined,
          resolvedAt: undefined
        };

        alerts.push(alert);
        this.alerts.set(alert.id, alert);
      }
    });

    return alerts;
  }

  /**
   * Create anomaly detection alert
   */
  createAnomalyAlert(
    data: number[],
    config: {
      field: string;
      sensitivity: number;
      windowSize: number;
      threshold: number;
    }
  ): DashboardAlert | null {
    const anomalies = this.detectAnomalies(data, config.sensitivity, config.windowSize);
    
    if (anomalies.length > 0) {
      const latestAnomaly = anomalies[anomalies.length - 1];
      
      return {
        id: `anomaly_alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as UUID,
        ruleId: 'anomaly_detection' as UUID,
        title: 'Anomaly Detected',
        message: `Anomalous value detected in ${config.field}: ${latestAnomaly.value}`,
        severity: latestAnomaly.severity,
        status: 'active',
        value: latestAnomaly.value,
        threshold: config.threshold,
        field: config.field,
        source: 'anomaly_detection',
        category: 'anomaly',
        actions: ['investigate', 'acknowledge'],
        metadata: {
          anomalyScore: latestAnomaly.score,
          expectedRange: latestAnomaly.expectedRange,
          detectionMethod: 'statistical'
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        acknowledgedAt: undefined,
        resolvedAt: undefined
      };
    }

    return null;
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: UUID, userId: UUID, comment?: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledgedAt = new Date().toISOString() as ISODateString;
      alert.status = 'acknowledged';
      alert.updatedAt = new Date();
      
      if (comment) {
        alert.metadata = { ...alert.metadata, acknowledgmentComment: comment, acknowledgedBy: userId };
      }
    }
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: UUID, userId: UUID, resolution?: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.resolvedAt = new Date().toISOString() as ISODateString;
      alert.status = 'resolved';
      alert.updatedAt = new Date();
      
      if (resolution) {
        alert.metadata = { ...alert.metadata, resolution, resolvedBy: userId };
      }
    }
  }

  private extractValue(data: any, field: string): number {
    const keys = field.split('.');
    let value = data;
    
    for (const key of keys) {
      value = value?.[key];
    }
    
    return Number(value) || 0;
  }

  private evaluateCondition(
    value: number,
    threshold: number,
    comparison: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'ne'
  ): boolean {
    switch (comparison) {
      case 'gt': return value > threshold;
      case 'lt': return value < threshold;
      case 'eq': return value === threshold;
      case 'gte': return value >= threshold;
      case 'lte': return value <= threshold;
      case 'ne': return value !== threshold;
      default: return false;
    }
  }

  private detectAnomalies(
    data: number[],
    sensitivity: number,
    windowSize: number
  ): Array<{
    index: number;
    value: number;
    score: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    expectedRange: { min: number; max: number };
  }> {
    const anomalies: Array<{
      index: number;
      value: number;
      score: number;
      severity: 'low' | 'medium' | 'high' | 'critical';
      expectedRange: { min: number; max: number };
    }> = [];

    if (data.length < windowSize) return anomalies;

    for (let i = windowSize; i < data.length; i++) {
      const window = data.slice(i - windowSize, i);
      const mean = window.reduce((sum, val) => sum + val, 0) / window.length;
      const variance = window.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / window.length;
      const stdDev = Math.sqrt(variance);
      
      const currentValue = data[i];
      const zScore = Math.abs((currentValue - mean) / stdDev);
      
      if (zScore > sensitivity) {
        const severity = this.determineSeverity(zScore);
        const expectedRange = {
          min: mean - (sensitivity * stdDev),
          max: mean + (sensitivity * stdDev)
        };
        
        anomalies.push({
          index: i,
          value: currentValue,
          score: zScore,
          severity,
          expectedRange
        });
      }
    }

    return anomalies;
  }

  private determineSeverity(zScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (zScore > 4) return 'critical';
    if (zScore > 3) return 'high';
    if (zScore > 2) return 'medium';
    return 'low';
  }
}

// ============================================================================
// PREDICTIVE INSIGHTS UTILITIES
// ============================================================================

export class PredictiveInsightsEngine {
  /**
   * Generate predictive insights from historical data
   */
  generateInsights(
    historicalData: any[],
    config: {
      timeField: string;
      valueField: string;
      predictionHorizon: number; // days
      confidence: number; // 0-1
      includeSeasonality: boolean;
    }
  ): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];

    // Trend analysis
    const trendInsight = this.analyzeTrend(historicalData, config);
    if (trendInsight) insights.push(trendInsight);

    // Seasonality analysis
    if (config.includeSeasonality) {
      const seasonalityInsight = this.analyzeSeasonality(historicalData, config);
      if (seasonalityInsight) insights.push(seasonalityInsight);
    }

    // Forecast
    const forecastInsight = this.generateForecast(historicalData, config);
    if (forecastInsight) insights.push(forecastInsight);

    // Anomaly prediction
    const anomalyInsight = this.predictAnomalies(historicalData, config);
    if (anomalyInsight) insights.push(anomalyInsight);

    return insights;
  }

  private analyzeTrend(
    data: any[],
    config: { timeField: string; valueField: string; confidence: number }
  ): PredictiveInsight | null {
    if (data.length < 2) return null;

    const sortedData = data.sort((a, b) => new Date(a[config.timeField]).getTime() - new Date(b[config.timeField]).getTime());
    const values = sortedData.map(item => Number(item[config.valueField]) || 0);
    
    // Simple linear regression
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * values[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R-squared
    const yMean = sumY / n;
    const totalSumSquares = values.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
    const residualSumSquares = values.reduce((sum, val, i) => {
      const predicted = slope * i + intercept;
      return sum + Math.pow(val - predicted, 2);
    }, 0);
    const rSquared = 1 - (residualSumSquares / totalSumSquares);
    
    const direction = slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable';
    const strength = Math.abs(slope) > 0.1 ? 'strong' : Math.abs(slope) > 0.05 ? 'moderate' : 'weak';
    
    return {
      id: `trend_insight_${Date.now()}` as UUID,
      type: 'trend',
      title: `${direction.charAt(0).toUpperCase() + direction.slice(1)} Trend Detected`,
      description: `The data shows a ${strength} ${direction} trend with ${(rSquared * 100).toFixed(1)}% confidence`,
      confidence: rSquared,
      impact: slope > 0.2 || slope < -0.2 ? 'high' : slope > 0.1 || slope < -0.1 ? 'medium' : 'low',
      category: 'trend_analysis',
      timeframe: 'historical',
      predictions: [],
      recommendations: [
        direction === 'increasing' ? 'Monitor for potential capacity issues' : 'Investigate causes of decline',
        'Consider adjusting thresholds based on trend'
      ],
      metadata: {
        slope,
        intercept,
        rSquared,
        direction,
        strength
      },
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };
  }

  private analyzeSeasonality(
    data: any[],
    config: { timeField: string; valueField: string }
  ): PredictiveInsight | null {
    if (data.length < 14) return null; // Need at least 2 weeks of data

    const sortedData = data.sort((a, b) => new Date(a[config.timeField]).getTime() - new Date(b[config.timeField]).getTime());
    
    // Group by day of week
    const dayOfWeekData: Record<number, number[]> = {};
    sortedData.forEach(item => {
      const date = new Date(item[config.timeField]);
      const dayOfWeek = date.getDay();
      const value = Number(item[config.valueField]) || 0;
      
      if (!dayOfWeekData[dayOfWeek]) dayOfWeekData[dayOfWeek] = [];
      dayOfWeekData[dayOfWeek].push(value);
    });

    // Calculate averages for each day
    const dayAverages: Record<number, number> = {};
    Object.entries(dayOfWeekData).forEach(([day, values]) => {
      dayAverages[Number(day)] = values.reduce((sum, val) => sum + val, 0) / values.length;
    });

    // Check for significant variation
    const allAverages = Object.values(dayAverages);
    const overallAverage = allAverages.reduce((sum, val) => sum + val, 0) / allAverages.length;
    const variance = allAverages.reduce((sum, val) => sum + Math.pow(val - overallAverage, 2), 0) / allAverages.length;
    const coefficientOfVariation = Math.sqrt(variance) / overallAverage;

    if (coefficientOfVariation > 0.1) { // Significant seasonal pattern
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const peakDay = Object.entries(dayAverages).reduce((peak, [day, avg]) => 
        avg > peak.avg ? { day: Number(day), avg } : peak, { day: 0, avg: 0 });
      
      return {
        id: `seasonality_insight_${Date.now()}` as UUID,
        type: 'seasonality',
        title: 'Weekly Seasonality Pattern Detected',
        description: `Data shows significant weekly patterns with peak activity on ${dayNames[peakDay.day]}`,
        confidence: Math.min(coefficientOfVariation * 2, 0.95),
        impact: coefficientOfVariation > 0.3 ? 'high' : coefficientOfVariation > 0.2 ? 'medium' : 'low',
        category: 'seasonality_analysis',
        timeframe: 'weekly',
        predictions: [],
        recommendations: [
          `Plan for increased activity on ${dayNames[peakDay.day]}`,
          'Consider day-of-week specific thresholds',
          'Optimize resource allocation based on weekly patterns'
        ],
        metadata: {
          dayAverages,
          coefficientOfVariation,
          peakDay: dayNames[peakDay.day],
          overallAverage
        },
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
      };
    }

    return null;
  }

  private generateForecast(
    data: any[],
    config: { timeField: string; valueField: string; predictionHorizon: number; confidence: number }
  ): PredictiveInsight | null {
    if (data.length < 5) return null;

    const sortedData = data.sort((a, b) => new Date(a[config.timeField]).getTime() - new Date(b[config.timeField]).getTime());
    const values = sortedData.map(item => Number(item[config.valueField]) || 0);
    
    // Simple moving average forecast
    const windowSize = Math.min(5, values.length);
    const recentValues = values.slice(-windowSize);
    const forecast = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
    
    // Calculate prediction interval
    const variance = recentValues.reduce((sum, val) => sum + Math.pow(val - forecast, 2), 0) / recentValues.length;
    const stdDev = Math.sqrt(variance);
    const margin = stdDev * 1.96; // 95% confidence interval
    
    const predictions = [];
    const lastDate = new Date(sortedData[sortedData.length - 1][config.timeField]);
    
    for (let i = 1; i <= config.predictionHorizon; i++) {
      const predictionDate = new Date(lastDate.getTime() + i * 24 * 60 * 60 * 1000);
      predictions.push({
        date: predictionDate.toISOString(),
        value: forecast,
        lowerBound: forecast - margin,
        upperBound: forecast + margin,
        confidence: config.confidence
      });
    }

    return {
      id: `forecast_insight_${Date.now()}` as UUID,
      type: 'forecast',
      title: `${config.predictionHorizon}-Day Forecast`,
      description: `Predicted value: ${forecast.toFixed(2)} (±${margin.toFixed(2)})`,
      confidence: config.confidence,
      impact: 'medium',
      category: 'forecasting',
      timeframe: `${config.predictionHorizon}d`,
      predictions,
      recommendations: [
        'Monitor actual values against predictions',
        'Update forecast model with new data',
        'Consider external factors that may affect predictions'
      ],
      metadata: {
        method: 'moving_average',
        windowSize,
        forecast,
        margin,
        lastDataPoint: sortedData[sortedData.length - 1]
      },
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + config.predictionHorizon * 24 * 60 * 60 * 1000)
    };
  }

  private predictAnomalies(
    data: any[],
    config: { timeField: string; valueField: string; confidence: number }
  ): PredictiveInsight | null {
    if (data.length < 10) return null;

    const values = data.map(item => Number(item[config.valueField]) || 0);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Count recent anomalies
    const recentData = values.slice(-7); // Last 7 data points
    const recentAnomalies = recentData.filter(val => Math.abs(val - mean) > 2 * stdDev).length;
    
    if (recentAnomalies > 0) {
      const anomalyRate = recentAnomalies / recentData.length;
      const riskLevel = anomalyRate > 0.3 ? 'high' : anomalyRate > 0.15 ? 'medium' : 'low';
      
      return {
        id: `anomaly_prediction_${Date.now()}` as UUID,
        type: 'anomaly_prediction',
        title: 'Increased Anomaly Risk Detected',
        description: `${(anomalyRate * 100).toFixed(1)}% of recent data points are anomalous`,
        confidence: Math.min(anomalyRate * 3, 0.95),
        impact: riskLevel === 'high' ? 'high' : 'medium',
        category: 'anomaly_detection',
        timeframe: 'near_term',
        predictions: [],
        recommendations: [
          'Increase monitoring frequency',
          'Review recent changes that may cause anomalies',
          'Consider adjusting alert thresholds',
          'Investigate root causes of anomalous behavior'
        ],
        metadata: {
          anomalyRate,
          recentAnomalies,
          mean,
          stdDev,
          riskLevel
        },
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
      };
    }

    return null;
  }
}

// ============================================================================
// MAIN DASHBOARD UTILITIES EXPORT
// ============================================================================

export const dashboardUtils = {
  configurationManager: new DashboardConfigurationManager(),
  widgetManager: new DashboardWidgetManager(),
  kpiCalculator: new DashboardKPICalculator(),
  alertProcessor: new DashboardAlertProcessor(),
  predictiveEngine: new PredictiveInsightsEngine()
};

// Utility functions for common operations
export const createDashboardId = (): UUID => {
  return `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as UUID;
};

export const createWidgetId = (): UUID => {
  return `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as UUID;
};

export const formatDashboardValue = (
  value: number,
  format: 'number' | 'currency' | 'percentage' | 'bytes',
  precision: number = 2
): string => {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: precision,
        maximumFractionDigits: precision
      }).format(value);
    case 'percentage':
      return `${(value * 100).toFixed(precision)}%`;
    case 'bytes':
      const units = ['B', 'KB', 'MB', 'GB', 'TB'];
      let size = value;
      let unitIndex = 0;
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }
      return `${size.toFixed(precision)} ${units[unitIndex]}`;
    case 'number':
    default:
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision
      }).format(value);
  }
};

export const calculateWidgetPerformance = (widget: DashboardWidget): {
  score: number;
  metrics: {
    loadTime: number;
    errorRate: number;
    interactionRate: number;
    viewFrequency: number;
  };
} => {
  const metrics = {
    loadTime: widget.analytics?.avgLoadTime || 0,
    errorRate: widget.analytics?.errors / Math.max(widget.analytics?.views || 1, 1),
    interactionRate: widget.analytics?.interactions / Math.max(widget.analytics?.views || 1, 1),
    viewFrequency: widget.analytics?.views || 0
  };

  // Calculate performance score (0-100)
  let score = 100;
  
  // Penalize slow load times
  if (metrics.loadTime > 2000) score -= 20;
  else if (metrics.loadTime > 1000) score -= 10;
  
  // Penalize high error rates
  if (metrics.errorRate > 0.1) score -= 30;
  else if (metrics.errorRate > 0.05) score -= 15;
  
  // Reward high interaction rates
  if (metrics.interactionRate > 0.5) score += 10;
  else if (metrics.interactionRate > 0.2) score += 5;
  
  // Reward high view frequency
  if (metrics.viewFrequency > 100) score += 10;
  else if (metrics.viewFrequency > 50) score += 5;

  return {
    score: Math.max(0, Math.min(100, score)),
    metrics
  };
};

export const generateDashboardReport = (dashboard: DashboardConfiguration): {
  summary: string;
  performance: any;
  recommendations: string[];
  usage: any;
} => {
  const widgetCount = dashboard.widgets?.length || 0;
  const lastViewed = dashboard.lastViewed ? new Date(dashboard.lastViewed) : new Date();
  const daysSinceViewed = Math.floor((Date.now() - lastViewed.getTime()) / (1000 * 60 * 60 * 24));
  
  const summary = `Dashboard "${dashboard.name}" contains ${widgetCount} widgets, last viewed ${daysSinceViewed} days ago. Type: ${dashboard.type}, Groups: ${dashboard.groups?.join(', ') || 'none'}.`;
  
  const performance = {
    totalViews: dashboard.analytics?.views || 0,
    avgLoadTime: dashboard.analytics?.performanceMetrics?.loadTime || 0,
    errorRate: dashboard.analytics?.performanceMetrics?.errorRate || 0,
    interactionCount: dashboard.analytics?.interactionCount || 0
  };
  
  const recommendations: string[] = [];
  
  if (daysSinceViewed > 30) {
    recommendations.push('Dashboard has not been viewed recently - consider archiving or promoting');
  }
  
  if (widgetCount > 20) {
    recommendations.push('Consider splitting dashboard into multiple focused dashboards');
  }
  
  if (performance.errorRate > 0.05) {
    recommendations.push('High error rate detected - review widget configurations');
  }
  
  if (performance.avgLoadTime > 3000) {
    recommendations.push('Slow loading times - optimize queries and reduce data volume');
  }
  
  const usage = {
    dailyViews: Math.round((performance.totalViews / Math.max(daysSinceViewed, 1))),
    popularWidgets: dashboard.analytics?.userBehavior?.mostViewedWidgets || [],
    commonFilters: dashboard.analytics?.userBehavior?.commonFilters || []
  };
  
  return {
    summary,
    performance,
    recommendations,
    usage
  };
};
