// Advanced-Scan-Logic/types/coordination.types.ts
// Coordination types aligned with backend coordination services

export interface ScanCoordination {
  id: string;
  coordination_type: CoordinationType;
  status: CoordinationStatus;
  coordinated_scans: CoordinatedScan[];
  cross_system_dependencies: CrossSystemDependency[];
  resource_conflicts: ResourceConflict[];
  priority_resolution: PriorityResolution;
  load_balancing_config: LoadBalancingConfig;
  synchronization_settings: SynchronizationSettings;
  conflict_resolution_strategy: ConflictResolutionStrategy;
}

export enum CoordinationType {
  CROSS_SYSTEM = 'cross_system',
  MULTI_TENANT = 'multi_tenant',
  RESOURCE_SHARING = 'resource_sharing',
  LOAD_BALANCING = 'load_balancing',
  PRIORITY_BASED = 'priority_based',
  TIME_BASED = 'time_based'
}

export enum CoordinationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  COORDINATING = 'coordinating',
  RESOLVING_CONFLICTS = 'resolving_conflicts',
  ERROR = 'error'
}

export interface CoordinatedScan {
  scan_id: string;
  system_id: string;
  priority: number;
  resource_requirements: ResourceRequirements;
  estimated_duration_minutes: number;
  dependencies: string[];
  coordination_metadata: CoordinationMetadata;
}

export interface CrossSystemDependency {
  id: string;
  source_system: string;
  target_system: string;
  dependency_type: DependencyType;
  status: DependencyStatus;
  resolution_strategy: ResolutionStrategy;
}

export interface ResourceConflict {
  id: string;
  conflicting_scans: string[];
  resource_type: ResourceType;
  conflict_severity: ConflictSeverity;
  resolution_action: ResolutionAction;
  resolved_at?: string;
}

export enum ConflictSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum ResolutionAction {
  QUEUE = 'queue',
  REDISTRIBUTE = 'redistribute',
  SCALE_UP = 'scale_up',
  CANCEL_LOWER_PRIORITY = 'cancel_lower_priority',
  MANUAL_INTERVENTION = 'manual_intervention'
}

// Missing enum types referenced by components
export enum SynchronizationMode {
  IMMEDIATE = 'immediate',
  BATCHED = 'batched',
  SCHEDULED = 'scheduled',
  EVENT_DRIVEN = 'event_driven',
  PRIORITY_BASED = 'priority_based',
  RESOURCE_AWARE = 'resource_aware',
  CASCADING = 'cascading',
  PARALLEL = 'parallel',
  SEQUENTIAL = 'sequential',
  CONDITIONAL = 'conditional'
}

export enum FailureHandling {
  RETRY = 'retry',
  FALLBACK = 'fallback',
  CIRCUIT_BREAKER = 'circuit_breaker',
  GRACEFUL_DEGRADATION = 'graceful_degradation',
  FAIL_FAST = 'fail_fast',
  IGNORE = 'ignore',
  ESCALATE = 'escalate',
  COMPENSATE = 'compensate',
  ROLLBACK = 'rollback',
  MANUAL_RECOVERY = 'manual_recovery'
}

export enum ResourceAllocationStrategy {
  ROUND_ROBIN = 'round_robin',
  WEIGHTED_ROUND_ROBIN = 'weighted_round_robin',
  LEAST_CONNECTIONS = 'least_connections',
  LEAST_RESPONSE_TIME = 'least_response_time',
  PRIORITY_BASED = 'priority_based',
  RESOURCE_AWARE = 'resource_aware',
  LOAD_BALANCED = 'load_balanced',
  FAIR_SHARE = 'fair_share',
  FIRST_FIT = 'first_fit',
  BEST_FIT = 'best_fit',
  WORST_FIT = 'worst_fit',
  DYNAMIC = 'dynamic'
}

// Supporting types for the missing enums
export enum DependencyType {
  DATA_DEPENDENCY = 'data_dependency',
  RESOURCE_DEPENDENCY = 'resource_dependency',
  SEQUENCE_DEPENDENCY = 'sequence_dependency',
  PRIORITY_DEPENDENCY = 'priority_dependency'
}

export enum DependencyStatus {
  PENDING = 'pending',
  RESOLVED = 'resolved',
  FAILED = 'failed',
  TIMEOUT = 'timeout'
}

export enum ResolutionStrategy {
  IMMEDIATE = 'immediate',
  DEFERRED = 'deferred',
  CONDITIONAL = 'conditional',
  MANUAL = 'manual'
}

export enum ResourceType {
  CPU = 'cpu',
  MEMORY = 'memory',
  STORAGE = 'storage',
  NETWORK = 'network',
  DATABASE = 'database',
  EXTERNAL_API = 'external_api'
}

export interface ResourceRequirements {
  cpu_cores?: number;
  memory_gb?: number;
  storage_gb?: number;
  network_bandwidth_mbps?: number;
  concurrent_connections?: number;
}

export interface CoordinationMetadata {
  created_at: string;
  updated_at: string;
  created_by: string;
  coordination_rules: Record<string, any>;
  metrics: Record<string, number>;
}

export interface PriorityResolution {
  strategy: ResourceAllocationStrategy;
  weights: Record<string, number>;
  thresholds: Record<string, number>;
}

export interface LoadBalancingConfig {
  strategy: ResourceAllocationStrategy;
  health_check_interval: number;
  max_retries: number;
  timeout_seconds: number;
}

export interface SynchronizationSettings {
  mode: SynchronizationMode;
  frequency_seconds?: number;
  batch_size?: number;
  failure_handling: FailureHandling;
}

export interface ConflictResolutionStrategy {
  priority_levels: number[];
  timeout_handling: FailureHandling;
  resource_allocation: ResourceAllocationStrategy;
  escalation_rules: Record<string, any>;
}

// API Error type for service compatibility
export interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  request_id?: string;
}