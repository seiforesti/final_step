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