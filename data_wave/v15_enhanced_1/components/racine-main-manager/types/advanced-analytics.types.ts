/**
 * Advanced Analytics Types - Enterprise Analytics and Intelligence
 * ================================================================
 *
 * This file contains comprehensive TypeScript type definitions for advanced analytics,
 * system intelligence, automation, monitoring, and business intelligence features.
 * These types are extracted from the main RacineMainManagerSPA component to ensure
 * proper separation of concerns and maintainability.
 */

import { ISODateString, UUID, JSONValue } from './racine-core.types';

// =============================================================================
// ADVANCED ANALYTICS TYPES
// =============================================================================

export interface AnalyticsMetrics {
  dataVolume: {
    ingested: number;
    processed: number;
    stored: number;
    trend: "up" | "down" | "stable";
  };
  userActivity: {
    activeUsers: number;
    sessionsToday: number;
    averageSessionDuration: number;
    topActions: Array<{ action: string; count: number }>;
  };
  systemPerformance: {
    uptime: number;
    averageResponseTime: number;
    errorRate: number;
    throughput: number;
  };
  complianceMetrics: {
    overallScore: number;
    violations: number;
    resolvedIssues: number;
    pendingReviews: number;
  };
  costOptimization: {
    currentCost: number;
    projectedSavings: number;
    optimizationOpportunities: number;
    efficiency: number;
  };
}

// =============================================================================
// SYSTEM INTELLIGENCE TYPES
// =============================================================================

export interface SystemIntelligence {
  anomalyDetection: {
    enabled: boolean;
    sensitivity: "low" | "medium" | "high";
    detectedAnomalies: Anomaly[];
    predictions: Prediction[];
  };
  predictiveAnalytics: {
    enabled: boolean;
    forecastHorizon: number; // days
    accuracy: number; // percentage
    trends: Trend[];
    recommendations: IntelligentRecommendation[];
  };
  autoOptimization: {
    enabled: boolean;
    aggressiveness: "conservative" | "balanced" | "aggressive";
    lastOptimization: ISODateString;
    optimizationHistory: OptimizationEvent[];
  };
  learningEngine: {
    enabled: boolean;
    modelVersion: string;
    trainingData: {
      samples: number;
      lastUpdate: ISODateString;
      accuracy: number;
    };
    adaptations: AdaptationEvent[];
  };
}

export interface Anomaly {
  id: string;
  type: "performance" | "security" | "data_quality" | "compliance" | "usage";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  detectedAt: ISODateString;
  affectedResources: string[];
  suggestedActions: string[];
  confidence: number;
  resolved: boolean;
}

export interface Prediction {
  id: string;
  type: "capacity" | "performance" | "cost" | "compliance" | "usage";
  timeframe: "short" | "medium" | "long"; // 1 day, 1 week, 1 month
  prediction: {
    value: number;
    unit: string;
    confidence: number;
    range: { min: number; max: number };
  };
  factors: string[];
  recommendations: string[];
}

export interface Trend {
  id: string;
  metric: string;
  direction: "increasing" | "decreasing" | "stable" | "volatile";
  velocity: number; // rate of change
  significance: "low" | "medium" | "high";
  timespan: number; // days
  dataPoints: Array<{ timestamp: ISODateString; value: number }>;
}

export interface IntelligentRecommendation {
  id: string;
  type: "optimization" | "security" | "compliance" | "cost_saving" | "workflow";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  impact: {
    performance: number; // percentage improvement
    cost: number; // cost savings
    compliance: number; // compliance improvement
    security: number; // security improvement
  };
  effort: "low" | "medium" | "high";
  estimatedTime: number; // hours
  prerequisites: string[];
  steps: string[];
  confidence: number;
}

export interface OptimizationEvent {
  id: string;
  timestamp: ISODateString;
  type: "automatic" | "manual" | "scheduled";
  target: string;
  changes: Record<string, any>;
  results: {
    before: Record<string, number>;
    after: Record<string, number>;
    improvement: Record<string, number>;
  };
  success: boolean;
}

export interface AdaptationEvent {
  id: string;
  timestamp: ISODateString;
  trigger:
    | "user_behavior"
    | "system_change"
    | "data_pattern"
    | "performance_issue";
  adaptation: string;
  impact: string;
  confidence: number;
}

// =============================================================================
// INTELLIGENT AUTOMATION TYPES
// =============================================================================

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  schedule?: CronSchedule;
  priority: number;
  lastExecuted?: ISODateString;
  executionCount: number;
  successRate: number;
  averageExecutionTime: number;
}

export interface AutomationTrigger {
  type: "event" | "schedule" | "threshold" | "api" | "manual";
  configuration: Record<string, any>;
  eventFilters?: EventFilter[];
}

export interface EventFilter {
  field: string;
  operator: "equals" | "contains" | "greater_than" | "less_than" | "regex";
  value: any;
}

export interface AutomationCondition {
  id: string;
  type:
    | "data_quality"
    | "system_health"
    | "user_context"
    | "time"
    | "resource_availability"
    | "custom";
  operator: "and" | "or" | "not";
  configuration: Record<string, any>;
  required: boolean;
}

export interface AutomationAction {
  id: string;
  type:
    | "notification"
    | "workflow_execution"
    | "data_operation"
    | "system_command"
    | "api_call"
    | "custom";
  configuration: Record<string, any>;
  timeout: number;
  retryPolicy: {
    enabled: boolean;
    maxRetries: number;
    backoffStrategy: "linear" | "exponential";
  };
  onSuccess?: AutomationAction[];
  onFailure?: AutomationAction[];
}

export interface CronSchedule {
  expression: string;
  timezone: string;
  nextExecution: ISODateString;
  enabled: boolean;
}

export interface AutomationExecution {
  id: string;
  ruleId: string;
  startTime: ISODateString;
  endTime?: ISODateString;
  status: "running" | "completed" | "failed" | "cancelled";
  trigger: string;
  steps: ExecutionStep[];
  result: Record<string, any>;
  logs: ExecutionLog[];
}

export interface ExecutionStep {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  startTime: ISODateString;
  endTime?: ISODateString;
  result?: any;
  error?: string;
}

export interface ExecutionLog {
  timestamp: ISODateString;
  level: "debug" | "info" | "warning" | "error";
  message: string;
  metadata?: Record<string, any>;
}

// =============================================================================
// ADVANCED MONITORING TYPES
// =============================================================================

export interface MonitoringConfiguration {
  metrics: {
    enabled: string[];
    thresholds: Record<string, { warning: number; critical: number }>;
    aggregation: Record<string, "avg" | "sum" | "max" | "min" | "count">;
    retention: Record<string, number>; // days
  };
  alerting: {
    channels: AlertChannel[];
    rules: AlertRule[];
    escalation: EscalationPolicy[];
    suppressions: AlertSuppression[];
  };
  dashboards: {
    realTime: DashboardConfig[];
    historical: DashboardConfig[];
    custom: DashboardConfig[];
  };
}

export interface AlertChannel {
  id: string;
  type: "email" | "slack" | "webhook" | "sms" | "teams" | "pagerduty";
  name: string;
  configuration: Record<string, any>;
  enabled: boolean;
  testStatus: "untested" | "success" | "failed";
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: {
    operator: "gt" | "lt" | "eq" | "ne" | "gte" | "lte";
    value: number;
    duration: number; // seconds
  };
  severity: "info" | "warning" | "critical";
  channels: string[];
  enabled: boolean;
  lastTriggered?: ISODateString;
  triggerCount: number;
}

export interface EscalationPolicy {
  id: string;
  name: string;
  rules: Array<{
    delay: number; // minutes
    channels: string[];
    condition: "unacknowledged" | "unresolved" | "severity_increase";
  }>;
  enabled: boolean;
}

export interface AlertSuppression {
  id: string;
  pattern: string;
  reason: string;
  startTime: ISODateString;
  endTime: ISODateString;
  enabled: boolean;
}

export interface DashboardConfig {
  id: string;
  name: string;
  description: string;
  layout: "grid" | "flow" | "timeline" | "network";
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  autoRefresh: number; // seconds
  permissions: string[];
}

export interface DashboardWidget {
  id: string;
  type: "metric" | "chart" | "table" | "map" | "text" | "alert_list" | "custom";
  title: string;
  position: { x: number; y: number; width: number; height: number };
  configuration: Record<string, any>;
  dataSource: string;
  refreshInterval: number;
}

export interface DashboardFilter {
  field: string;
  operator:
    | "equals"
    | "not_equals"
    | "greater_than"
    | "less_than"
    | "between"
    | "in"
    | "not_in";
  value: any;
  dynamic?: boolean; // if true, value is calculated at runtime
}

// =============================================================================
// DATA GOVERNANCE VISUALIZATION TYPES
// =============================================================================

export interface DataGovernanceNode {
  id: string;
  name: string;
  type: "core" | "integration" | "ai" | "monitoring";
  position: { x: number; y: number };
  connections: string[];
  status: "healthy" | "degraded" | "critical" | "unknown";
  metrics: {
    health: number;
    performance: number;
    activity: number;
  };
  icon: React.ComponentType;
  color: string;
}

export interface SystemOverview {
  totalAssets: number;
  activeWorkflows: number;
  activePipelines: number;
  systemHealth: number;
  complianceScore: number;
  performanceScore: number;
  collaborationActivity: number;
  aiInsights: number;
}

export interface QuickActionContext {
  currentView: string;
  activeWorkspace: UUID;
  userRole: string;
  recentActions: string[];
  systemHealth: any;
}

// =============================================================================
// WORKFLOW ORCHESTRATION TYPES
// =============================================================================

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category:
    | "data_ingestion"
    | "compliance_check"
    | "quality_assessment"
    | "lineage_mapping"
    | "custom";
  complexity: "simple" | "moderate" | "complex" | "enterprise";
  estimatedDuration: number;
  requiredPermissions: string[];
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  conditions: WorkflowCondition[];
  outputs: WorkflowOutput[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: "scan" | "classify" | "validate" | "transform" | "notify" | "custom";
  configuration: Record<string, any>;
  dependencies: string[];
  timeout: number;
  retryPolicy: {
    maxRetries: number;
    backoffStrategy: "linear" | "exponential";
    delayMs: number;
  };
}

export interface WorkflowTrigger {
  id: string;
  type: "schedule" | "event" | "manual" | "api" | "data_change";
  configuration: Record<string, any>;
  enabled: boolean;
}

export interface WorkflowCondition {
  id: string;
  type: "data_quality" | "system_health" | "compliance" | "custom";
  operator: "equals" | "greater_than" | "less_than" | "contains" | "regex";
  value: any;
  required: boolean;
}

export interface WorkflowOutput {
  id: string;
  type:
    | "report"
    | "notification"
    | "data_export"
    | "api_response"
    | "dashboard";
  configuration: Record<string, any>;
  format: string;
  destination: string;
}