export interface ScanConfig {
  id: string
  name: string
  description: string
  dataSourceId: string
  dataSourceName: string
  scanType: "full" | "incremental" | "sample"
  scope: {
    databases?: string[]
    schemas?: string[]
    tables?: string[]
  }
  settings: {
    enablePII: boolean
    enableClassification: boolean
    enableLineage: boolean
    enableQuality: boolean
    sampleSize?: number
    parallelism: number
  }
  schedule?: {
    enabled: boolean
    cron: string
    timezone: string
  }
  createdAt: string
  updatedAt: string
  createdBy: string
  status: "active" | "inactive" | "draft"
}

export interface ScanRun {
  id: string
  scanId: string
  scanName: string
  status: "pending" | "running" | "completed" | "failed" | "cancelled"
  startTime: string
  endTime?: string
  duration?: number
  progress: number
  entitiesScanned: number
  entitiesTotal: number
  issuesFound: number
  dataSourceName: string
  triggeredBy: "manual" | "scheduled" | "api"
  logs: ScanLog[]
  results?: ScanResults
}

export interface ScanLog {
  id: string
  timestamp: string
  level: "info" | "warning" | "error" | "debug"
  message: string
  details?: any
}

export interface ScanResults {
  summary: {
    entitiesScanned: number
    tablesScanned: number
    columnsScanned: number
    issuesFound: number
    classificationsApplied: number
    piiDetected: number
  }
  entities: DiscoveredEntity[]
  issues: ScanIssue[]
  classifications: Classification[]
  recommendations: Recommendation[]
}

export interface DiscoveredEntity {
  id: string
  name: string
  type: "table" | "view" | "column" | "schema" | "database"
  path: string
  dataSource: string
  schema?: string
  table?: string
  dataType?: string
  nullable?: boolean
  primaryKey?: boolean
  foreignKey?: boolean
  classifications: string[]
  piiTags: string[]
  qualityScore: number
  lastModified?: string
  rowCount?: number
  size?: number
  description?: string
}

export interface ScanIssue {
  id: string
  severity: "critical" | "high" | "medium" | "low"
  type: "data_quality" | "security" | "compliance" | "performance" | "governance"
  title: string
  description: string
  entity: string
  recommendation: string
  impact: string
  status: "open" | "resolved" | "ignored"
}

export interface Classification {
  id: string
  name: string
  category: string
  confidence: number
  entity: string
  appliedBy: "system" | "user"
  appliedAt: string
}

export interface Recommendation {
  id: string
  type: "optimization" | "security" | "governance" | "quality"
  priority: "high" | "medium" | "low"
  title: string
  description: string
  impact: string
  effort: "low" | "medium" | "high"
  entities: string[]
}

export interface ScanSchedule {
  id: string
  scanId: string
  scanName: string
  enabled: boolean
  cron: string
  timezone: string
  nextRun: string
  lastRun?: string
  lastStatus?: "success" | "failed"
  createdAt: string
  updatedAt: string
}
