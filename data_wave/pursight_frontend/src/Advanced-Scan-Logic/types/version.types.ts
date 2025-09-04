// Advanced Version Control Types - aligned to backend

export interface WorkflowVersion {
  id: string;
  workflowId: string;
  name: string;
  version: string;
  status: 'draft' | 'published' | 'archived' | 'deprecated';
  description?: string;
  author?: string;
  branch?: string;
  tags?: string[];
  isMerged?: boolean;
  hasConflicts?: boolean;
  changeCount?: number;
  commitCount?: number;
  contributorCount?: number;
  createdAt: string;
  updatedAt?: string;
  metadata?: Record<string, any>;
}

export interface VersionBranch {
  id: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  isProtected?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface VersionCommit {
  id: string;
  versionId: string;
  author: string;
  message: string;
  createdAt: string;
  changes?: ChangeRecord[];
}

export interface VersionTag {
  id: string;
  name: string;
  description?: string;
  versionId: string;
  author?: string;
  createdAt: string;
}

export interface VersionMerge {
  id: string;
  sourceVersionId: string;
  targetVersionId: string;
  status: 'pending' | 'completed' | 'aborted' | 'conflicted';
  strategy?: 'merge-commit' | 'squash' | 'rebase';
  conflicts?: VersionConflict[];
  createdAt: string;
  completedAt?: string;
}

export interface VersionConflict {
  id: string;
  filePath: string;
  conflictType: 'content' | 'delete/modify' | 'rename/modify' | 'rename/delete' | 'mode/change';
  ours?: string;
  theirs?: string;
  base?: string;
  resolved?: boolean;
  resolution?: 'ours' | 'theirs' | 'manual';
}

export interface VersionDiff {
  version1Id: string;
  version2Id: string;
  changes: ChangeRecord[];
  summary: {
    totalChanges: number;
    additions: number;
    modifications: number;
    deletions: number;
  };
}

export interface ChangeRecord {
  field: string;
  type: 'added' | 'modified' | 'deleted';
  oldValue?: any;
  newValue?: any;
  timestamp?: string;
}

export interface VersionHistory {
  id: string;
  versionId: string;
  action: string;
  actor: string;
  details?: any;
  timestamp: string;
}

export interface VersionMetadata {
  [key: string]: any;
}

export interface VersionSnapshot {
  id: string;
  versionId: string;
  data: any;
  createdAt: string;
}

export interface VersionRestore {
  id: string;
  versionId: string;
  restoredFromSnapshotId?: string;
  restoredAt: string;
  restoredBy: string;
}

export interface VersionBackup {
  id: string;
  versionId: string;
  location: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

export interface VersionMigration {
  id: string;
  fromVersion: string;
  toVersion: string;
  status: 'pending' | 'completed' | 'failed';
  details?: any;
}

export interface VersionPolicy {
  id: string;
  name: string;
  rules: any[];
  enforced: boolean;
}

export interface VersionPermission {
  id: string;
  name: string;
  description?: string;
}

export interface VersionAudit {
  id: string;
  event: string;
  actor: string;
  metadata?: any;
  timestamp: string;
}

export interface VersionEvent {
  id: string;
  type: string;
  payload: any;
  timestamp: string;
}

export interface VersionLog {
  id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

export interface VersionTrace {
  id: string;
  spanId: string;
  parentSpanId?: string;
  operation: string;
  durationMs: number;
  timestamp: string;
}

export interface VersionConfiguration {
  maxVersions: number;
  retentionPeriod: number;
  autoTag: boolean;
  autoMerge: boolean;
  conflictResolution: 'manual' | 'auto';
  branchingStrategy: 'gitflow' | 'trunk' | 'feature-branch';
  mergingStrategy: 'merge-commit' | 'squash' | 'rebase';
  versionNaming: 'semantic' | 'sequential' | 'timestamp';
  compression: boolean;
  encryption: boolean;
  validation: boolean;
  testing: boolean;
  monitoring: boolean;
  analytics: boolean;
  audit: boolean;
  backup: boolean;
  restore: boolean;
  migration: boolean;
  optimization: boolean;
}

export interface VersionStrategy {
  name: string;
  description?: string;
  settings?: Record<string, any>;
}

export interface VersionWorkflow {
  id: string;
  name: string;
  steps: any[];
}

export interface VersionRelease {
  id: string;
  name: string;
  versionId: string;
  notes?: string;
  createdAt: string;
}

export interface VersionDeployment {
  id: string;
  versionId: string;
  environment: string;
  status: 'pending' | 'deployed' | 'failed' | 'rolled_back';
  startedAt: string;
  completedAt?: string;
}

export interface VersionRollback {
  id: string;
  fromVersionId: string;
  toVersionId: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface VersionComparison {
  version1Id: string;
  version2Id: string;
  diff: VersionDiff;
}

export interface VersionAnalytics {
  metrics: Record<string, number>;
  trends?: any;
}

export interface VersionReport {
  id: string;
  name: string;
  content: any;
  createdAt: string;
}

export interface VersionInsights {
  id: string;
  title: string;
  description?: string;
  severity: 'low' | 'medium' | 'high';
  recommendations?: string[];
}

