import { EventEmitter } from "../browser-event-emitter";
import { v4 as uuidv4 } from 'uuid'

// ============================================================================
// CORE WORKFLOW INTERFACES
// ============================================================================

export interface WorkflowDefinition {
  id: string
  name: string
  description: string
  version: string
  category: WorkflowCategory
  steps: WorkflowStep[]
  triggers: WorkflowTrigger[]
  conditions: WorkflowCondition[]
  metadata: WorkflowMetadata
  timeout: number // milliseconds
  retryPolicy: GlobalRetryPolicy
  dependencies: string[] // other workflow IDs
  permissions: WorkflowPermissions
  schedule?: WorkflowSchedule
}

export interface WorkflowStep {
  id: string
  name: string
  type: WorkflowStepType
  component?: string
  apiEndpoint?: string
  sqlQuery?: string
  condition?: string
  parameters: Record<string, any>
  dependencies: string[] // step IDs
  retryPolicy: StepRetryPolicy
  timeout: number
  errorHandling: ErrorHandlingStrategy
  outputs: OutputMapping[]
  parallel?: boolean
  critical?: boolean // if fails, entire workflow fails
}

export interface WorkflowTrigger {
  id: string
  type: TriggerType
  source: string
  condition: string
  parameters: Record<string, any>
  enabled: boolean
}

export interface WorkflowCondition {
  id: string
  expression: string
  type: ConditionType
  parameters: Record<string, any>
}

export interface WorkflowMetadata {
  author: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
  documentation: string
  changelog: ChangelogEntry[]
  approvals: ApprovalRecord[]
}

// ============================================================================
// EXECUTION INTERFACES
// ============================================================================

export interface WorkflowExecution {
  id: string
  workflowId: string
  status: ExecutionStatus
  startTime: Date
  endTime?: Date
  duration?: number
  context: WorkflowContext
  steps: StepExecution[]
  errors: ExecutionError[]
  metrics: ExecutionMetrics
  triggeredBy: string
  triggerType: TriggerType
}

export interface StepExecution {
  id: string
  stepId: string
  status: ExecutionStatus
  startTime: Date
  endTime?: Date
  duration?: number
  attempts: number
  outputs: Record<string, any>
  errors: ExecutionError[]
  logs: LogEntry[]
}

export interface WorkflowContext {
  executionId: string
  workflowId: string
  userId: string
  dataSourceId?: number
  variables: Record<string, any>
  sharedState: Record<string, any>
  metadata: Record<string, any>
}

export interface WorkflowResult {
  executionId: string
  success: boolean
  outputs: Record<string, any>
  metrics: ExecutionMetrics
  errors: ExecutionError[]
  duration: number
}

// ============================================================================
// ENUMS AND TYPES
// ============================================================================

export enum WorkflowCategory {
  DATA_INGESTION = 'data_ingestion',
  DATA_QUALITY = 'data_quality',
  COMPLIANCE = 'compliance',
  SECURITY = 'security',
  MONITORING = 'monitoring',
  BACKUP = 'backup',
  DISCOVERY = 'discovery',
  ANALYTICS = 'analytics',
  GOVERNANCE = 'governance',
  CUSTOM = 'custom'
}

export enum WorkflowStepType {
  COMPONENT = 'component',
  API_CALL = 'api_call',
  SQL_QUERY = 'sql_query',
  CONDITION = 'condition',
  PARALLEL = 'parallel',
  SEQUENTIAL = 'sequential',
  DELAY = 'delay',
  NOTIFICATION = 'notification',
  APPROVAL = 'approval',
  TRANSFORM = 'transform',
  VALIDATE = 'validate'
}

export enum TriggerType {
  MANUAL = 'manual',
  SCHEDULED = 'scheduled',
  EVENT = 'event',
  WEBHOOK = 'webhook',
  DATA_CHANGE = 'data_change',
  THRESHOLD = 'threshold',
  SYSTEM = 'system'
}

export enum ConditionType {
  EXPRESSION = 'expression',
  SCRIPT = 'script',
  API_CHECK = 'api_check',
  DATA_VALIDATION = 'data_validation'
}

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PAUSED = 'paused',
  RETRYING = 'retrying',
  SKIPPED = 'skipped'
}

export enum ErrorHandlingStrategy {
  FAIL_FAST = 'fail_fast',
  CONTINUE = 'continue',
  RETRY = 'retry',
  SKIP = 'skip',
  ESCALATE = 'escalate'
}

// ============================================================================
// WORKFLOW ENGINE IMPLEMENTATION
// ============================================================================

export class WorkflowEngine extends EventEmitter {
  private workflows: Map<string, WorkflowDefinition> = new Map()
  private executions: Map<string, WorkflowExecution> = new Map()
  private activeExecutions: Set<string> = new Set()
  private stepExecutors: Map<WorkflowStepType, StepExecutor> = new Map()
  private triggers: Map<string, WorkflowTrigger[]> = new Map()
  private isRunning: boolean = false

  constructor() {
    super()
    this.initializeStepExecutors()
    this.startExecutionLoop()
  }

  // ========================================================================
  // WORKFLOW MANAGEMENT
  // ========================================================================

  async registerWorkflow(definition: WorkflowDefinition): Promise<void> {
    try {
      // Validate workflow definition
      this.validateWorkflowDefinition(definition)
      
      // Store workflow
      this.workflows.set(definition.id, definition)
      
      // Register triggers
      this.registerTriggers(definition)
      
      this.emit('workflow:registered', definition)
      console.log(`Workflow registered: ${definition.name} (${definition.id})`)
    } catch (error) {
      console.error('Failed to register workflow:', error)
      throw error
    }
  }

  async executeWorkflow(
    workflowId: string, 
    context: Partial<WorkflowContext>,
    triggeredBy: string = 'manual'
  ): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`)
    }

    const executionId = uuidv4()
    const fullContext: WorkflowContext = {
      executionId,
      workflowId,
      userId: context.userId || 'system',
      dataSourceId: context.dataSourceId,
      variables: context.variables || {},
      sharedState: context.sharedState || {},
      metadata: context.metadata || {}
    }

    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      status: ExecutionStatus.PENDING,
      startTime: new Date(),
      context: fullContext,
      steps: [],
      errors: [],
      metrics: {
        stepsTotal: workflow.steps.length,
        stepsCompleted: 0,
        stepsFailed: 0,
        stepsSkipped: 0,
        averageStepDuration: 0,
        totalDataProcessed: 0,
        resourcesUsed: {}
      },
      triggeredBy,
      triggerType: TriggerType.MANUAL
    }

    this.executions.set(executionId, execution)
    this.activeExecutions.add(executionId)

    this.emit('workflow:started', execution)
    
    // Start execution asynchronously
    this.executeWorkflowSteps(execution, workflow)

    return execution
  }

  async pauseWorkflow(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId)
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`)
    }

    execution.status = ExecutionStatus.PAUSED
    this.emit('workflow:paused', execution)
  }

  async resumeWorkflow(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId)
    if (!execution || execution.status !== ExecutionStatus.PAUSED) {
      throw new Error(`Cannot resume execution: ${executionId}`)
    }

    execution.status = ExecutionStatus.RUNNING
    this.emit('workflow:resumed', execution)
  }

  async cancelWorkflow(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId)
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`)
    }

    execution.status = ExecutionStatus.CANCELLED
    execution.endTime = new Date()
    execution.duration = execution.endTime.getTime() - execution.startTime.getTime()
    
    this.activeExecutions.delete(executionId)
    this.emit('workflow:cancelled', execution)
  }

  // ========================================================================
  // STEP EXECUTION ENGINE
  // ========================================================================

  private async executeWorkflowSteps(
    execution: WorkflowExecution, 
    workflow: WorkflowDefinition
  ): Promise<void> {
    try {
      execution.status = ExecutionStatus.RUNNING
      this.emit('workflow:running', execution)

      // Build execution graph
      const executionGraph = this.buildExecutionGraph(workflow.steps)
      
      // Execute steps according to dependencies
      await this.executeStepsWithDependencies(execution, workflow, executionGraph)

      // Complete execution
      execution.status = ExecutionStatus.COMPLETED
      execution.endTime = new Date()
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime()
      
      this.activeExecutions.delete(execution.id)
      this.emit('workflow:completed', execution)

    } catch (error) {
      execution.status = ExecutionStatus.FAILED
      execution.endTime = new Date()
      execution.duration = execution.endTime!.getTime() - execution.startTime.getTime()
      execution.errors.push({
        stepId: 'workflow',
        type: 'execution_error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        severity: 'critical',
        context: execution.context
      })

      this.activeExecutions.delete(execution.id)
      this.emit('workflow:failed', execution, error)
    }
  }

  private async executeStepsWithDependencies(
    execution: WorkflowExecution,
    workflow: WorkflowDefinition,
    executionGraph: Map<string, string[]>
  ): Promise<void> {
    const completedSteps = new Set<string>()
    const pendingSteps = new Set(workflow.steps.map(s => s.id))
    
    while (pendingSteps.size > 0 && execution.status === ExecutionStatus.RUNNING) {
      // Find steps that can be executed (all dependencies completed)
      const readySteps = Array.from(pendingSteps).filter(stepId => {
        const dependencies = executionGraph.get(stepId) || []
        return dependencies.every(depId => completedSteps.has(depId))
      })

      if (readySteps.length === 0) {
        throw new Error('Circular dependency detected or no executable steps')
      }

      // Execute ready steps (potentially in parallel)
      const parallelSteps = readySteps.filter(stepId => {
        const step = workflow.steps.find(s => s.id === stepId)
        return step?.parallel
      })

      const sequentialSteps = readySteps.filter(stepId => !parallelSteps.includes(stepId))

      // Execute parallel steps
      if (parallelSteps.length > 0) {
        const parallelPromises = parallelSteps.map(stepId => 
          this.executeStep(execution, workflow.steps.find(s => s.id === stepId)!)
        )
        
        await Promise.allSettled(parallelPromises)
        parallelSteps.forEach(stepId => {
          completedSteps.add(stepId)
          pendingSteps.delete(stepId)
        })
      }

      // Execute sequential steps
      for (const stepId of sequentialSteps) {
        const step = workflow.steps.find(s => s.id === stepId)!
        await this.executeStep(execution, step)
        completedSteps.add(stepId)
        pendingSteps.delete(stepId)
      }
    }
  }

  private async executeStep(execution: WorkflowExecution, step: WorkflowStep): Promise<void> {
    const stepExecution: StepExecution = {
      id: uuidv4(),
      stepId: step.id,
      status: ExecutionStatus.RUNNING,
      startTime: new Date(),
      attempts: 0,
      outputs: {},
      errors: [],
      logs: []
    }

    execution.steps.push(stepExecution)

    try {
      // Get step executor
      const executor = this.stepExecutors.get(step.type)
      if (!executor) {
        throw new Error(`No executor found for step type: ${step.type}`)
      }

      // Execute step with retry logic
      let lastError: Error | null = null
      for (let attempt = 1; attempt <= (step.retryPolicy.maxAttempts || 1); attempt++) {
        stepExecution.attempts = attempt
        
        try {
          const result = await this.executeWithTimeout(
            () => executor.execute(step, execution.context, stepExecution),
            step.timeout
          )

          stepExecution.outputs = result
          stepExecution.status = ExecutionStatus.COMPLETED
          stepExecution.endTime = new Date()
          stepExecution.duration = stepExecution.endTime.getTime() - stepExecution.startTime.getTime()

          this.emit('step:completed', stepExecution, execution)
          return

        } catch (error) {
          lastError = error as Error
          stepExecution.errors.push({
            stepId: step.id,
            type: 'step_error',
            message: lastError.message,
            timestamp: new Date(),
            severity: 'error',
            context: execution.context
          })

          if (attempt < (step.retryPolicy.maxAttempts || 1)) {
            await this.delay(step.retryPolicy.delayMs || 1000)
            stepExecution.status = ExecutionStatus.RETRYING
            this.emit('step:retrying', stepExecution, execution, attempt)
          }
        }
      }

      // Handle step failure
      stepExecution.status = ExecutionStatus.FAILED
      stepExecution.endTime = new Date()
      stepExecution.duration = stepExecution.endTime.getTime() - stepExecution.startTime.getTime()

      if (step.critical || step.errorHandling === ErrorHandlingStrategy.FAIL_FAST) {
        throw lastError
      }

      this.emit('step:failed', stepExecution, execution, lastError)

    } catch (error) {
      stepExecution.status = ExecutionStatus.FAILED
      stepExecution.endTime = new Date()
      stepExecution.duration = stepExecution.endTime!.getTime() - stepExecution.startTime.getTime()
      
      this.emit('step:failed', stepExecution, execution, error)
      throw error
    }
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  private buildExecutionGraph(steps: WorkflowStep[]): Map<string, string[]> {
    const graph = new Map<string, string[]>()
    
    steps.forEach(step => {
      graph.set(step.id, step.dependencies)
    })
    
    return graph
  }

  private validateWorkflowDefinition(definition: WorkflowDefinition): void {
    if (!definition.id || !definition.name) {
      throw new Error('Workflow must have id and name')
    }

    if (!definition.steps || definition.steps.length === 0) {
      throw new Error('Workflow must have at least one step')
    }

    // Validate step dependencies
    const stepIds = new Set(definition.steps.map(s => s.id))
    definition.steps.forEach(step => {
      step.dependencies.forEach(depId => {
        if (!stepIds.has(depId)) {
          throw new Error(`Step ${step.id} has invalid dependency: ${depId}`)
        }
      })
    })

    // Check for circular dependencies
    this.detectCircularDependencies(definition.steps)
  }

  private detectCircularDependencies(steps: WorkflowStep[]): void {
    const visited = new Set<string>()
    const visiting = new Set<string>()

    const visit = (stepId: string) => {
      if (visiting.has(stepId)) {
        throw new Error(`Circular dependency detected involving step: ${stepId}`)
      }
      if (visited.has(stepId)) {
        return
      }

      visiting.add(stepId)
      const step = steps.find(s => s.id === stepId)
      if (step) {
        step.dependencies.forEach(depId => visit(depId))
      }
      visiting.delete(stepId)
      visited.add(stepId)
    }

    steps.forEach(step => visit(step.id))
  }

  private registerTriggers(workflow: WorkflowDefinition): void {
    workflow.triggers.forEach(trigger => {
      if (!this.triggers.has(trigger.source)) {
        this.triggers.set(trigger.source, [])
      }
      this.triggers.get(trigger.source)!.push(trigger)
    })
  }

  private initializeStepExecutors(): void {
    this.stepExecutors.set(WorkflowStepType.COMPONENT, new ComponentStepExecutor())
    this.stepExecutors.set(WorkflowStepType.API_CALL, new ApiStepExecutor())
    this.stepExecutors.set(WorkflowStepType.SQL_QUERY, new SqlStepExecutor())
    this.stepExecutors.set(WorkflowStepType.CONDITION, new ConditionStepExecutor())
    this.stepExecutors.set(WorkflowStepType.NOTIFICATION, new NotificationStepExecutor())
    this.stepExecutors.set(WorkflowStepType.DELAY, new DelayStepExecutor())
    this.stepExecutors.set(WorkflowStepType.TRANSFORM, new TransformStepExecutor())
    this.stepExecutors.set(WorkflowStepType.VALIDATE, new ValidationStepExecutor())
  }

  private async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`))
      }, timeoutMs)

      operation()
        .then(result => {
          clearTimeout(timer)
          resolve(result)
        })
        .catch(error => {
          clearTimeout(timer)
          reject(error)
        })
    })
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private startExecutionLoop(): void {
    this.isRunning = true
    setInterval(() => {
      this.processScheduledWorkflows()
      this.cleanupCompletedExecutions()
    }, 10000) // Check every 10 seconds
  }

  private processScheduledWorkflows(): void {
    // Implementation for scheduled workflow processing
    // This would check for workflows that need to be triggered based on schedule
  }

  private cleanupCompletedExecutions(): void {
    // Keep only recent executions to prevent memory leaks
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
    
    for (const [executionId, execution] of this.executions.entries()) {
      if (execution.endTime && execution.endTime < cutoff) {
        this.executions.delete(executionId)
      }
    }
  }

  // ========================================================================
  // PUBLIC API
  // ========================================================================

  getWorkflow(workflowId: string): WorkflowDefinition | undefined {
    return this.workflows.get(workflowId)
  }

  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId)
  }

  getActiveExecutions(): WorkflowExecution[] {
    return Array.from(this.activeExecutions)
      .map(id => this.executions.get(id)!)
      .filter(Boolean)
  }

  getWorkflowHistory(workflowId: string): WorkflowExecution[] {
    return Array.from(this.executions.values())
      .filter(execution => execution.workflowId === workflowId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
  }
}

// ============================================================================
// STEP EXECUTORS
// ============================================================================

interface StepExecutor {
  execute(
    step: WorkflowStep,
    context: WorkflowContext,
    stepExecution: StepExecution
  ): Promise<Record<string, any>>
}

class ComponentStepExecutor implements StepExecutor {
  async execute(step: WorkflowStep, context: WorkflowContext): Promise<Record<string, any>> {
    // Execute component-based workflow step
    // This would integrate with the component registry
    return { componentResult: 'executed', data: step.parameters }
  }
}

class ApiStepExecutor implements StepExecutor {
  async execute(step: WorkflowStep, context: WorkflowContext): Promise<Record<string, any>> {
    // Execute API call
    const response = await fetch(step.apiEndpoint!, {
      method: step.parameters.method || 'GET',
      headers: step.parameters.headers || {},
      body: step.parameters.body ? JSON.stringify(step.parameters.body) : undefined
    })
    
    const result = await response.json()
    return { apiResponse: result, status: response.status }
  }
}

class SqlStepExecutor implements StepExecutor {
  async execute(step: WorkflowStep, context: WorkflowContext): Promise<Record<string, any>> {
    // Execute SQL query (would integrate with database)
    return { queryResult: 'executed', affectedRows: 0 }
  }
}

class ConditionStepExecutor implements StepExecutor {
  async execute(step: WorkflowStep, context: WorkflowContext): Promise<Record<string, any>> {
    // Evaluate condition
    const result = this.evaluateCondition(step.condition!, context)
    return { conditionResult: result }
  }

  private evaluateCondition(condition: string, context: WorkflowContext): boolean {
    // Simple condition evaluation (in production, use a proper expression evaluator)
    try {
      // Replace context variables in condition
      let evaluableCondition = condition
      Object.entries(context.variables).forEach(([key, value]) => {
        evaluableCondition = evaluableCondition.replace(
          new RegExp(`\\$\{${key}\}`, 'g'),
          JSON.stringify(value)
        )
      })
      
      return Function(`"use strict"; return (${evaluableCondition})`)()
    } catch {
      return false
    }
  }
}

class NotificationStepExecutor implements StepExecutor {
  async execute(step: WorkflowStep, context: WorkflowContext): Promise<Record<string, any>> {
    // Send notification
    console.log(`Notification: ${step.parameters.message}`)
    return { notificationSent: true, recipient: step.parameters.recipient }
  }
}

class DelayStepExecutor implements StepExecutor {
  async execute(step: WorkflowStep, context: WorkflowContext): Promise<Record<string, any>> {
    const delayMs = step.parameters.delayMs || 1000
    await new Promise(resolve => setTimeout(resolve, delayMs))
    return { delayed: delayMs }
  }
}

class TransformStepExecutor implements StepExecutor {
  async execute(step: WorkflowStep, context: WorkflowContext): Promise<Record<string, any>> {
    // Transform data based on parameters
    const input = step.parameters.input || context.variables
    const transformedData = this.applyTransformation(input, step.parameters.transformation)
    return { transformedData }
  }

  private applyTransformation(data: any, transformation: any): any {
    // Apply data transformation logic
    return { ...data, transformed: true, timestamp: new Date().toISOString() }
  }
}

class ValidationStepExecutor implements StepExecutor {
  async execute(step: WorkflowStep, context: WorkflowContext): Promise<Record<string, any>> {
    // Validate data according to rules
    const data = step.parameters.data || context.variables
    const rules = step.parameters.rules || []
    
    const validationResults = rules.map((rule: any) => ({
      rule: rule.name,
      passed: this.validateRule(data, rule),
      message: rule.message
    }))

    const allPassed = validationResults.every(r => r.passed)
    
    if (!allPassed && step.parameters.strict) {
      throw new Error('Validation failed: ' + validationResults
        .filter(r => !r.passed)
        .map(r => r.message)
        .join(', '))
    }

    return { validationResults, allPassed }
  }

  private validateRule(data: any, rule: any): boolean {
    // Simple validation logic
    switch (rule.type) {
      case 'required':
        return data[rule.field] !== undefined && data[rule.field] !== null
      case 'type':
        return typeof data[rule.field] === rule.expectedType
      case 'range':
        const value = data[rule.field]
        return value >= rule.min && value <= rule.max
      default:
        return true
    }
  }
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

interface GlobalRetryPolicy {
  maxAttempts: number
  delayMs: number
  backoffMultiplier: number
  maxDelayMs: number
}

interface StepRetryPolicy {
  maxAttempts: number
  delayMs: number
  backoffMultiplier: number
}

interface WorkflowPermissions {
  execute: string[]
  modify: string[]
  view: string[]
  approve: string[]
}

interface WorkflowSchedule {
  cronExpression: string
  timezone: string
  enabled: boolean
  startDate?: Date
  endDate?: Date
}

interface OutputMapping {
  from: string
  to: string
  transform?: string
}

interface ChangelogEntry {
  version: string
  date: Date
  author: string
  changes: string[]
}

interface ApprovalRecord {
  approver: string
  date: Date
  status: 'approved' | 'rejected'
  comments?: string
}

interface ExecutionError {
  stepId: string
  type: string
  message: string
  timestamp: Date
  severity: 'info' | 'warning' | 'error' | 'critical'
  context: WorkflowContext
}

interface ExecutionMetrics {
  stepsTotal: number
  stepsCompleted: number
  stepsFailed: number
  stepsSkipped: number
  averageStepDuration: number
  totalDataProcessed: number
  resourcesUsed: Record<string, any>
}

interface LogEntry {
  timestamp: Date
  level: 'info' | 'warning' | 'error' | 'debug'
  message: string
  data?: any
}

// Export singleton instance
export const workflowEngine = new WorkflowEngine()
export default workflowEngine