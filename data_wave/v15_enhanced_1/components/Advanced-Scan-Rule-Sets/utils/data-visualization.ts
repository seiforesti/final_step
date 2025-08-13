/**
 * Advanced Data Visualization Utility
 * Comprehensive utility for chart generation, data formatting, and interactive visualizations
 */

import { CHART_COLORS, COLOR_SCHEMES } from '../constants';

// Types
export interface ChartDataPoint {
  name: string;
  value: number;
  category?: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

export interface TimeSeriesDataPoint {
  timestamp: Date;
  value: number;
  label?: string;
  category?: string;
}

export interface MultiSeriesDataPoint {
  name: string;
  [key: string]: string | number;
}

export interface ChartConfiguration {
  type: ChartType;
  title?: string;
  subtitle?: string;
  width?: number;
  height?: number;
  responsive?: boolean;
  animation?: AnimationConfig;
  colors?: string[];
  theme?: ChartTheme;
  legend?: LegendConfig;
  tooltip?: TooltipConfig;
  axis?: AxisConfig;
  margins?: MarginConfig;
}

export type ChartType = 
  | 'line'
  | 'area'
  | 'bar'
  | 'column'
  | 'pie'
  | 'donut'
  | 'scatter'
  | 'bubble'
  | 'radar'
  | 'gauge'
  | 'heatmap'
  | 'treemap'
  | 'funnel'
  | 'waterfall'
  | 'candlestick'
  | 'sankey'
  | 'network';

export interface AnimationConfig {
  enabled: boolean;
  duration: number;
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  delay?: number;
}

export interface ChartTheme {
  background: string;
  foreground: string;
  grid: string;
  accent: string;
  text: string;
  border: string;
}

export interface LegendConfig {
  show: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
  align: 'start' | 'center' | 'end';
  orientation: 'horizontal' | 'vertical';
}

export interface TooltipConfig {
  enabled: boolean;
  format?: TooltipFormat;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  showTitle?: boolean;
  showValue?: boolean;
  showCategory?: boolean;
  customFormatter?: (data: any) => string;
}

export interface TooltipFormat {
  valuePrefix?: string;
  valueSuffix?: string;
  valueDecimals?: number;
  dateFormat?: string;
  percentageFormat?: boolean;
}

export interface AxisConfig {
  x?: AxisSettings;
  y?: AxisSettings;
}

export interface AxisSettings {
  show: boolean;
  title?: string;
  min?: number;
  max?: number;
  type?: 'linear' | 'logarithmic' | 'datetime' | 'category';
  tickCount?: number;
  tickFormat?: string;
  gridLines?: boolean;
  reversed?: boolean;
}

export interface MarginConfig {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: ChartType;
  data: any[];
  config: ChartConfiguration;
  size: WidgetSize;
  position: WidgetPosition;
  refreshInterval?: number;
  dataSource?: string;
  filters?: WidgetFilter[];
}

export interface WidgetSize {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface WidgetPosition {
  x: number;
  y: number;
  zIndex?: number;
}

export interface WidgetFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'between';
  value: any;
  label?: string;
}

export interface VisualizationMetrics {
  performanceScore: number;
  accuracyTrend: TimeSeriesDataPoint[];
  resourceUtilization: ChartDataPoint[];
  costBreakdown: ChartDataPoint[];
  benchmarkComparison: MultiSeriesDataPoint[];
  optimizationOpportunities: ChartDataPoint[];
}

export interface HeatmapData {
  x: string;
  y: string;
  value: number;
  label?: string;
}

export interface NetworkNode {
  id: string;
  label: string;
  group?: string;
  size?: number;
  color?: string;
  x?: number;
  y?: number;
}

export interface NetworkEdge {
  source: string;
  target: string;
  weight?: number;
  color?: string;
  type?: 'solid' | 'dashed' | 'dotted';
}

export interface NetworkData {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

// Data Visualization Class
export class DataVisualizationEngine {
  private defaultConfig: ChartConfiguration;
  private themes: Record<string, ChartTheme>;
  private colorPalettes: Record<string, string[]>;

  constructor() {
    this.defaultConfig = this.createDefaultConfig();
    this.themes = this.createThemes();
    this.colorPalettes = this.createColorPalettes();
  }

  // Chart Generation
  generateChart(data: any[], config: Partial<ChartConfiguration>): ChartConfiguration {
    const mergedConfig = { ...this.defaultConfig, ...config };
    
    // Auto-detect optimal chart type if not specified
    if (!mergedConfig.type) {
      mergedConfig.type = this.detectOptimalChartType(data);
    }

    // Apply data-driven configurations
    this.applyDataDrivenConfig(data, mergedConfig);

    // Optimize for accessibility
    this.optimizeForAccessibility(mergedConfig);

    return mergedConfig;
  }

  // Time Series Visualization
  createTimeSeriesChart(
    data: TimeSeriesDataPoint[],
    config: Partial<ChartConfiguration> = {}
  ): ChartConfiguration {
    const processedData = this.processTimeSeriesData(data);
    
    return this.generateChart(processedData, {
      type: 'line',
      axis: {
        x: {
          show: true,
          type: 'datetime',
          gridLines: true,
        },
        y: {
          show: true,
          type: 'linear',
          gridLines: true,
        },
      },
      ...config,
    });
  }

  // Performance Dashboard
  createPerformanceDashboard(metrics: VisualizationMetrics): DashboardWidget[] {
    const widgets: DashboardWidget[] = [
      // Performance Score Gauge
      {
        id: 'performance-score',
        title: 'Overall Performance Score',
        type: 'gauge',
        data: [{ name: 'Score', value: metrics.performanceScore }],
        config: this.generateChart([], { type: 'gauge' }),
        size: { width: 300, height: 200 },
        position: { x: 0, y: 0 },
      },

      // Accuracy Trend Line Chart
      {
        id: 'accuracy-trend',
        title: 'Accuracy Trend',
        type: 'line',
        data: metrics.accuracyTrend,
        config: this.createTimeSeriesChart(metrics.accuracyTrend),
        size: { width: 600, height: 300 },
        position: { x: 320, y: 0 },
      },

      // Resource Utilization Pie Chart
      {
        id: 'resource-utilization',
        title: 'Resource Utilization',
        type: 'pie',
        data: metrics.resourceUtilization,
        config: this.generateChart(metrics.resourceUtilization, { type: 'pie' }),
        size: { width: 400, height: 300 },
        position: { x: 0, y: 220 },
      },

      // Cost Breakdown Bar Chart
      {
        id: 'cost-breakdown',
        title: 'Cost Breakdown',
        type: 'bar',
        data: metrics.costBreakdown,
        config: this.generateChart(metrics.costBreakdown, { type: 'bar' }),
        size: { width: 500, height: 300 },
        position: { x: 420, y: 220 },
      },

      // Benchmark Comparison
      {
        id: 'benchmark-comparison',
        title: 'Benchmark Comparison',
        type: 'radar',
        data: metrics.benchmarkComparison,
        config: this.generateChart(metrics.benchmarkComparison, { type: 'radar' }),
        size: { width: 400, height: 350 },
        position: { x: 0, y: 540 },
      },

      // Optimization Opportunities
      {
        id: 'optimization-opportunities',
        title: 'Optimization Opportunities',
        type: 'bubble',
        data: metrics.optimizationOpportunities,
        config: this.generateChart(metrics.optimizationOpportunities, { type: 'bubble' }),
        size: { width: 520, height: 350 },
        position: { x: 420, y: 540 },
      },
    ];

    return widgets;
  }

  // Heatmap Generation
  createHeatmap(
    data: HeatmapData[],
    config: Partial<ChartConfiguration> = {}
  ): ChartConfiguration {
    const processedData = this.processHeatmapData(data);
    
    return this.generateChart(processedData, {
      type: 'heatmap',
      colors: this.generateHeatmapColors(),
      ...config,
    });
  }

  // Network Diagram
  createNetworkDiagram(
    data: NetworkData,
    config: Partial<ChartConfiguration> = {}
  ): ChartConfiguration {
    const processedData = this.processNetworkData(data);
    
    return this.generateChart(processedData, {
      type: 'network',
      ...config,
    });
  }

  // Data Processing Methods
  private processTimeSeriesData(data: TimeSeriesDataPoint[]): any[] {
    return data.map(point => ({
      x: point.timestamp.getTime(),
      y: point.value,
      category: point.category,
      label: point.label,
    })).sort((a, b) => a.x - b.x);
  }

  private processHeatmapData(data: HeatmapData[]): any[] {
    return data.map(point => ({
      x: point.x,
      y: point.y,
      z: point.value,
      label: point.label || `${point.x}, ${point.y}: ${point.value}`,
    }));
  }

  private processNetworkData(data: NetworkData): any {
    return {
      nodes: data.nodes.map(node => ({
        id: node.id,
        label: node.label,
        group: node.group || 'default',
        size: node.size || 10,
        color: node.color || this.getColorForGroup(node.group),
        x: node.x,
        y: node.y,
      })),
      edges: data.edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        weight: edge.weight || 1,
        color: edge.color || '#999',
        type: edge.type || 'solid',
      })),
    };
  }

  // Chart Type Detection
  private detectOptimalChartType(data: any[]): ChartType {
    if (!data || data.length === 0) return 'bar';

    const sample = data[0];
    
    // Time series data
    if (sample.timestamp || sample.date) {
      return 'line';
    }

    // Categorical data with single value
    if (typeof sample.value === 'number' && sample.name) {
      if (data.length <= 10) {
        return 'pie';
      }
      return 'bar';
    }

    // Multi-dimensional data
    if (Object.keys(sample).length > 3) {
      return 'scatter';
    }

    // Default to bar chart
    return 'bar';
  }

  // Configuration Methods
  private createDefaultConfig(): ChartConfiguration {
    return {
      type: 'bar',
      responsive: true,
      animation: {
        enabled: true,
        duration: 300,
        easing: 'ease-out',
      },
      colors: CHART_COLORS,
      theme: this.themes.light,
      legend: {
        show: true,
        position: 'bottom',
        align: 'center',
        orientation: 'horizontal',
      },
      tooltip: {
        enabled: true,
        showTitle: true,
        showValue: true,
        showCategory: true,
      },
      axis: {
        x: {
          show: true,
          gridLines: false,
        },
        y: {
          show: true,
          gridLines: true,
        },
      },
      margins: {
        top: 20,
        right: 20,
        bottom: 40,
        left: 40,
      },
    };
  }

  private createThemes(): Record<string, ChartTheme> {
    return {
      light: {
        background: '#ffffff',
        foreground: '#f8fafc',
        grid: '#e2e8f0',
        accent: '#3b82f6',
        text: '#1e293b',
        border: '#cbd5e1',
      },
      dark: {
        background: '#0f172a',
        foreground: '#1e293b',
        grid: '#334155',
        accent: '#60a5fa',
        text: '#f1f5f9',
        border: '#475569',
      },
      high_contrast: {
        background: '#000000',
        foreground: '#ffffff',
        grid: '#666666',
        accent: '#ffff00',
        text: '#ffffff',
        border: '#ffffff',
      },
    };
  }

  private createColorPalettes(): Record<string, string[]> {
    return {
      default: CHART_COLORS,
      categorical: [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
        '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1',
      ],
      sequential: [
        '#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8',
        '#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e',
      ],
      diverging: [
        '#7f1d1d', '#dc2626', '#f87171', '#fecaca', '#f3f4f6',
        '#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8', '#1e3a8a',
      ],
      accessibility: [
        '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
        '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
      ],
    };
  }

  private applyDataDrivenConfig(data: any[], config: ChartConfiguration): void {
    // Adjust colors based on data size
    if (data.length > config.colors!.length) {
      config.colors = this.generateColorPalette(data.length);
    }

    // Optimize for data density
    if (data.length > 100) {
      config.animation!.enabled = false; // Disable animation for large datasets
    }

    // Adjust margins based on label length
    const maxLabelLength = Math.max(
      ...data.map(d => (d.name || d.label || '').toString().length)
    );
    
    if (maxLabelLength > 10) {
      config.margins!.bottom = Math.max(60, maxLabelLength * 4);
    }
  }

  private optimizeForAccessibility(config: ChartConfiguration): void {
    // Ensure sufficient color contrast
    if (config.theme) {
      config.theme = this.ensureColorContrast(config.theme);
    }

    // Add alternative text descriptions
    config.tooltip!.customFormatter = this.createAccessibleTooltipFormatter();

    // Ensure keyboard navigation support
    // This would be implemented in the actual chart rendering
  }

  private generateColorPalette(count: number): string[] {
    const basePalette = this.colorPalettes.default;
    const colors: string[] = [];

    for (let i = 0; i < count; i++) {
      if (i < basePalette.length) {
        colors.push(basePalette[i]);
      } else {
        // Generate additional colors using HSL
        const hue = (i * 137.508) % 360; // Golden angle approximation
        const saturation = 70 + (i % 3) * 10; // Vary saturation
        const lightness = 50 + (i % 2) * 20; // Vary lightness
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
      }
    }

    return colors;
  }

  private generateHeatmapColors(): string[] {
    return [
      '#fff5f5', '#fed7d7', '#feb2b2', '#fc8181', '#f56565',
      '#e53e3e', '#c53030', '#9b2c2c', '#742a2a', '#4a1a1a',
    ];
  }

  private getColorForGroup(group?: string): string {
    if (!group) return this.colorPalettes.default[0];
    
    const hash = this.hashString(group);
    const index = hash % this.colorPalettes.default.length;
    return this.colorPalettes.default[index];
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private ensureColorContrast(theme: ChartTheme): ChartTheme {
    // Simple contrast enhancement - in production would use proper contrast ratio calculations
    return {
      ...theme,
      text: this.isLightBackground(theme.background) ? '#000000' : '#ffffff',
    };
  }

  private isLightBackground(color: string): boolean {
    // Simple lightness check - in production would use proper luminance calculation
    return color === '#ffffff' || color.includes('f');
  }

  private createAccessibleTooltipFormatter(): (data: any) => string {
    return (data: any) => {
      const parts = [];
      
      if (data.category) {
        parts.push(`Category: ${data.category}`);
      }
      
      if (data.name) {
        parts.push(`Item: ${data.name}`);
      }
      
      if (data.value !== undefined) {
        parts.push(`Value: ${this.formatNumber(data.value)}`);
      }
      
      return parts.join(', ');
    };
  }

  private formatNumber(value: number): string {
    if (Math.abs(value) >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (Math.abs(value) >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    } else {
      return value.toLocaleString();
    }
  }

  // Public Utility Methods
  exportChartData(data: any[], format: 'json' | 'csv' | 'excel'): string | Blob {
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      
      case 'csv':
        return this.convertToCSV(data);
      
      case 'excel':
        return this.convertToExcel(data);
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' ? `"${value}"` : value;
        }).join(',')
      )
    ];
    
    return csvRows.join('\n');
  }

  private convertToExcel(data: any[]): Blob {
    // Simplified Excel export - in production would use a proper library like SheetJS
    const csvData = this.convertToCSV(data);
    return new Blob([csvData], { type: 'application/vnd.ms-excel' });
  }

  // Theme Management
  getTheme(name: string): ChartTheme {
    return this.themes[name] || this.themes.light;
  }

  setCustomTheme(name: string, theme: ChartTheme): void {
    this.themes[name] = theme;
  }

  // Color Palette Management
  getColorPalette(name: string): string[] {
    return this.colorPalettes[name] || this.colorPalettes.default;
  }

  setCustomPalette(name: string, colors: string[]): void {
    this.colorPalettes[name] = colors;
  }
}

// Utility Functions
export function formatChartValue(
  value: number,
  format: 'number' | 'percentage' | 'currency' | 'bytes' = 'number',
  locale: string = 'en-US'
): string {
  switch (format) {
    case 'percentage':
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }).format(value);
    
    case 'currency':
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD',
      }).format(value);
    
    case 'bytes':
      return formatBytes(value);
    
    case 'number':
    default:
      return new Intl.NumberFormat(locale).format(value);
  }
}

export function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

export function generateRandomData(
  count: number,
  type: 'time_series' | 'categorical' | 'multi_dimensional' = 'categorical'
): any[] {
  const data: any[] = [];
  
  switch (type) {
    case 'time_series':
      const startDate = new Date(Date.now() - (count * 24 * 60 * 60 * 1000));
      for (let i = 0; i < count; i++) {
        data.push({
          timestamp: new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000)),
          value: Math.random() * 100,
        });
      }
      break;
    
    case 'categorical':
      for (let i = 0; i < count; i++) {
        data.push({
          name: `Category ${i + 1}`,
          value: Math.random() * 100,
        });
      }
      break;
    
    case 'multi_dimensional':
      for (let i = 0; i < count; i++) {
        data.push({
          name: `Item ${i + 1}`,
          x: Math.random() * 100,
          y: Math.random() * 100,
          z: Math.random() * 100,
          category: `Group ${Math.floor(Math.random() * 5) + 1}`,
        });
      }
      break;
  }
  
  return data;
}

// Export singleton instance
export const dataVisualization = new DataVisualizationEngine();