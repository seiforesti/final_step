// Advanced-Scan-Logic/types/monitoring.types.ts
// Real-time monitoring types

export interface MonitoringMetrics {
  id: string;
  timestamp: string;
  scan_id: string;
  metric_type: MetricType;
  value: number;
  unit: string;
  labels: Record<string, string>;
  alerts: MonitoringAlert[];
}

export enum MetricType {
  PERFORMANCE = 'performance',
  RESOURCE_USAGE = 'resource_usage',
  ERROR_RATE = 'error_rate',
  THROUGHPUT = 'throughput',
  LATENCY = 'latency',
  AVAILABILITY = 'availability'
}

export interface MonitoringAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  triggered_at: string;
  resolved_at?: string;
  threshold_value: number;
  actual_value: number;
  actions: AlertAction[];
}

export enum AlertSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export interface MonitoringDashboard {
  id: string;
  name: string;
  widgets: MonitoringWidget[];
  refresh_interval_seconds: number;
  filters: DashboardFilter[];
}

export interface MonitoringWidget {
  id: string;
  type: WidgetType;
  title: string;
  data_source: string;
  configuration: WidgetConfiguration;
  position: WidgetPosition;
}

export enum WidgetType {
  LINE_CHART = 'line_chart',
  BAR_CHART = 'bar_chart',
  GAUGE = 'gauge',
  TABLE = 'table',
  HEATMAP = 'heatmap',
  STATUS_INDICATOR = 'status_indicator'
}

export enum MonitoringScope {
  SYSTEM = 'system',
  APPLICATION = 'application',
  DATABASE = 'database',
  NETWORK = 'network',
  INFRASTRUCTURE = 'infrastructure',
  BUSINESS = 'business',
  SECURITY = 'security',
  COMPLIANCE = 'compliance',
  CUSTOM = 'custom'
}

export enum AlertStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  ESCALATED = 'escalated',
  SUPPRESSED = 'suppressed'
}