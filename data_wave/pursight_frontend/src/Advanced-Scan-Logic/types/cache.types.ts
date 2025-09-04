// Advanced-Scan-Logic/types/cache.types.ts
// Type definitions for cache management and optimization

export interface CacheInstance {
  id: string;
  name: string;
  type: string;
  status: string;
  capacity: number;
  used: number;
  hitRate: number;
  missRate: number;
  created_at: string;
  updated_at: string;
}

export interface CachePool {
  id: string;
  name: string;
  instances: CacheInstance[];
  totalCapacity: number;
  usedCapacity: number;
  status: string;
}

export interface CacheMetric {
  id: string;
  instanceId: string;
  metricType: string;
  value: number;
  timestamp: string;
}

export interface CacheOperation {
  id: string;
  type: string;
  status: string;
  result: any;
  timestamp: string;
}

export interface CacheConfiguration {
  id: string;
  instanceId: string;
  settings: Record<string, any>;
  policies: CachePolicy[];
  created_at: string;
  updated_at: string;
}

export interface CachePolicy {
  id: string;
  name: string;
  type: string;
  rules: CacheRule[];
  priority: number;
  enabled: boolean;
}

export interface CacheRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  parameters: Record<string, any>;
}

export interface CacheMonitoring {
  id: string;
  instanceId: string;
  metrics: CacheMetric[];
  alerts: CacheAlert[];
  health: CacheHealth;
  timestamp: string;
}

export interface CacheAlert {
  id: string;
  type: string;
  severity: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface CacheHealth {
  status: string;
  score: number;
  issues: string[];
  recommendations: string[];
}

export interface CacheOptimization {
  id: string;
  instanceId: string;
  type: string;
  status: string;
  improvements: CacheImprovement[];
  timestamp: string;
}

export interface CacheImprovement {
  id: string;
  type: string;
  description: string;
  impact: string;
  implementation: string;
}

export interface CacheAnalysis {
  id: string;
  instanceId: string;
  analysisType: string;
  results: any;
  insights: string[];
  recommendations: string[];
  timestamp: string;
}

export interface CacheReplication {
  id: string;
  sourceInstanceId: string;
  targetInstanceId: string;
  status: string;
  syncStatus: string;
  lastSync: string;
}

export interface CachePartitioning {
  id: string;
  instanceId: string;
  strategy: string;
  partitions: CachePartition[];
  distribution: Record<string, number>;
}

export interface CachePartition {
  id: string;
  name: string;
  size: number;
  used: number;
  keys: string[];
}

export interface CacheEviction {
  id: string;
  instanceId: string;
  policy: string;
  statistics: EvictionStatistics;
  lastEviction: string;
}

export interface EvictionStatistics {
  totalEvictions: number;
  evictionRate: number;
  evictedKeys: string[];
  reasons: Record<string, number>;
}

export interface CacheStatistics {
  id: string;
  instanceId: string;
  metrics: Record<string, number>;
  trends: Record<string, number[]>;
  summary: CacheSummary;
  timestamp: string;
}

export interface CacheSummary {
  totalRequests: number;
  hitRate: number;
  missRate: number;
  averageResponseTime: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface CacheHealthCheck {
  id: string;
  instanceId: string;
  status: string;
  checks: HealthCheck[];
  overallHealth: string;
  timestamp: string;
}

export interface HealthCheck {
  name: string;
  status: string;
  details: string;
  duration: number;
}

export interface CacheBackup {
  id: string;
  instanceId: string;
  backupType: string;
  status: string;
  size: number;
  location: string;
  created_at: string;
}

export interface CacheAudit {
  id: string;
  instanceId: string;
  auditType: string;
  findings: AuditFinding[];
  compliance: ComplianceStatus;
  timestamp: string;
}

export interface AuditFinding {
  id: string;
  severity: string;
  description: string;
  recommendation: string;
  status: string;
}

export interface ComplianceStatus {
  compliant: boolean;
  violations: string[];
  score: number;
}

export interface CacheMigration {
  id: string;
  sourceInstanceId: string;
  targetInstanceId: string;
  status: string;
  progress: number;
  startTime: string;
  endTime?: string;
}

export interface CacheUpgrade {
  id: string;
  instanceId: string;
  fromVersion: string;
  toVersion: string;
  status: string;
  changes: string[];
  timestamp: string;
}

export interface CacheMonitoring {
  id: string;
  instanceId: string;
  metrics: CacheMetric[];
  alerts: CacheAlert[];
  health: CacheHealth;
  timestamp: string;
}

export interface CacheHealthCheck {
  id: string;
  instanceId: string;
  status: string;
  checks: HealthCheck[];
  overallHealth: string;
  timestamp: string;
}

