export interface ScanRuleSet {
  id: number
  name: string
  description: string
  type: "system" | "custom"
  status: "active" | "inactive" | "draft"
  version: string
  createdAt: string
  updatedAt: string
  createdBy: string
  rules: ScanRule[]
  dataSourceTypes: string[]
  tags: string[]
  priority: "low" | "medium" | "high" | "critical"
  executionCount: number
  successRate: number
  lastExecuted?: string
  estimatedDuration: number
  resourceUsage: {
    cpu: number
    memory: number
    storage: number
  }
  compliance: {
    gdpr: boolean
    hipaa: boolean
    sox: boolean
    pci: boolean
  }
  schedule?: {
    enabled: boolean
    cron: string
    timezone: string
    nextRun?: string
  }
}

export interface ScanRule {
  id: number
  name: string
  description: string
  type: "classification" | "quality" | "lineage" | "profiling"
  pattern: string
  confidence: number
  enabled: boolean
  parameters: Record<string, any>
  conditions: ScanCondition[]
  actions: ScanAction[]
  metadata: {
    category: string
    subcategory: string
    severity: "low" | "medium" | "high" | "critical"
    tags: string[]
  }
}

export interface ScanCondition {
  id: number
  field: string
  operator: "equals" | "contains" | "regex" | "range" | "exists"
  value: any
  logicalOperator?: "AND" | "OR"
}

export interface ScanAction {
  id: number
  type: "tag" | "classify" | "alert" | "quarantine" | "encrypt"
  parameters: Record<string, any>
  enabled: boolean
}

export interface CustomScanRule {
  id: number
  name: string
  description: string
  code: string
  language: "python" | "sql" | "javascript"
  version: string
  status: "active" | "inactive" | "testing"
  createdAt: string
  updatedAt: string
  createdBy: string
  testResults?: TestResult[]
  dependencies: string[]
  performance: {
    avgExecutionTime: number
    memoryUsage: number
    successRate: number
  }
}

export interface TestResult {
  id: number
  testCase: string
  input: any
  expectedOutput: any
  actualOutput: any
  status: "passed" | "failed" | "skipped"
  executionTime: number
  timestamp: string
}

export interface ScanExecution {
  id: number
  ruleSetId: number
  dataSourceId: number
  status: "pending" | "running" | "completed" | "failed" | "cancelled"
  startTime: string
  endTime?: string
  duration?: number
  recordsProcessed: number
  recordsMatched: number
  errors: ScanError[]
  results: ScanResult[]
  metrics: ExecutionMetrics
}

export interface ScanError {
  id: number
  type: "validation" | "execution" | "timeout" | "resource"
  message: string
  details: string
  timestamp: string
  severity: "low" | "medium" | "high" | "critical"
}

export interface ScanResult {
  id: number
  ruleId: number
  entityId: string
  entityType: string
  confidence: number
  matches: Match[]
  metadata: Record<string, any>
  timestamp: string
}

export interface Match {
  field: string
  value: any
  position?: {
    start: number
    end: number
  }
  context?: string
}

export interface ExecutionMetrics {
  totalRecords: number
  processedRecords: number
  matchedRecords: number
  errorCount: number
  warningCount: number
  executionTime: number
  resourceUsage: {
    cpu: number
    memory: number
    io: number
  }
  throughput: number
}

export interface ScanRuleSetFilter {
  search?: string
  type?: "system" | "custom" | "all"
  status?: "active" | "inactive" | "draft" | "all"
  dataSourceType?: string
  tags?: string[]
  priority?: "low" | "medium" | "high" | "critical"
  createdBy?: string
  dateRange?: {
    start: string
    end: string
  }
}

export interface ScanRuleSetSort {
  field: "name" | "createdAt" | "updatedAt" | "executionCount" | "successRate" | "priority"
  direction: "asc" | "desc"
}

export interface PaginationParams {
  page: number
  pageSize: number
  total?: number
}

export interface ApiResponse<T> {
  data: T
  pagination?: PaginationParams
  metadata?: {
    totalCount: number
    filteredCount: number
    executionTime: number
  }
}

export interface BulkOperation {
  action: "activate" | "deactivate" | "delete" | "duplicate" | "export"
  ruleSetIds: number[]
  parameters?: Record<string, any>
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationWarning {
  field: string
  message: string
  code: string
}

export interface PerformanceMetrics {
  avgExecutionTime: number
  minExecutionTime: number
  maxExecutionTime: number
  throughput: number
  errorRate: number
  resourceUtilization: {
    cpu: number
    memory: number
    storage: number
  }
  trends: {
    period: string
    values: number[]
  }[]
}
