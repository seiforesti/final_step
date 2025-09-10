import { EventEmitter } from "../browser-event-emitter";
import { v4 as uuidv4 } from 'uuid'
import { eventBus, EventBusEvent, EventPriority } from '../core/event-bus'
import { workflowEngine, WorkflowDefinition } from '../core/workflow-engine'
import { stateManager } from '../core/state-manager'

// ============================================================================
// CORE APPROVAL INTERFACES
// ============================================================================

// Export a WorkflowEngine type for consumers that import it for typing only
export type WorkflowEngine = typeof workflowEngine

export interface ApprovalRequest {
  id: string
  type: ApprovalType
  title: string
  description: string
  requestedBy: string
  requestedAt: Date
  requiredApprovals: ApprovalRequirement[]
  currentApprovals: ApprovalDecision[]
  status: ApprovalStatus
  priority: ApprovalPriority
  deadline?: Date
  escalationPolicy: EscalationPolicy
  context: ApprovalContext
  attachments: ApprovalAttachment[]
  metadata: ApprovalMetadata
  workflow: ApprovalWorkflow
}

export interface ApprovalRequirement {
  id: string
  level: number
  requiredRole: string
  requiredUsers?: string[]
  requiredCount: number
  optional: boolean
  condition?: string
  delegationAllowed: boolean
  timeLimit?: number // minutes
}

export interface ApprovalDecision {
  id: string
  requirementId: string
  approver: string
  decision: DecisionType
  timestamp: Date
  reason?: string
  delegation?: DelegationInfo
  conditions?: ApprovalCondition[]
  attachments: ApprovalAttachment[]
  metadata: DecisionMetadata
}

export interface ApprovalWorkflow {
  stages: ApprovalStage[]
  currentStage: number
  parallelApprovals: boolean
  autoAdvance: boolean
  rollbackPolicy: RollbackPolicy
  notificationPolicy: NotificationPolicy
}

export interface ApprovalStage {
  id: string
  name: string
  description: string
  requirements: ApprovalRequirement[]
  timeLimit?: number
  escalation?: EscalationConfig
  conditions: StageCondition[]
  actions: StageAction[]
}

// ============================================================================
// DELEGATION AND ESCALATION
// ============================================================================

export interface DelegationInfo {
  delegatedBy: string
  delegatedTo: string
  delegatedAt: Date
  reason: string
  timeLimit?: Date
  revocable: boolean
  notifyOriginal: boolean
}

export interface EscalationPolicy {
  enabled: boolean
  levels: EscalationLevel[]
  autoEscalate: boolean
  escalationDelay: number // minutes
  notificationTemplate: string
}

export interface EscalationLevel {
  level: number
  escalateTo: string[]
  timeLimit: number
  notification: EscalationNotification
  actions: EscalationAction[]
}

export interface EscalationNotification {
  channels: NotificationChannel[]
  template: string
  urgency: NotificationUrgency
  retryPolicy: NotificationRetryPolicy
}

export interface EscalationAction {
  type: ActionType
  target: string
  parameters: Record<string, any>
  condition?: string
}

// ============================================================================
// APPROVAL POLICIES
// ============================================================================

export interface ApprovalPolicy {
  id: string
  name: string
  description: string
  scope: PolicyScope
  conditions: PolicyCondition[]
  requirements: ApprovalRequirement[]
  exceptions: PolicyException[]
  automation: PolicyAutomation
  metadata: PolicyMetadata
  enabled: boolean
}

export interface PolicyCondition {
  field: string
  operator: ConditionOperator
  value: any
  type: ConditionType
}

export interface PolicyException {
  condition: string
  action: ExceptionAction
  approvers: string[]
  reason: string
}

export interface PolicyAutomation {
  autoApprove: AutoApproveRule[]
  autoReject: AutoRejectRule[]
  preValidation: ValidationRule[]
  postApproval: PostApprovalAction[]
}

// ============================================================================
// ENUMS AND TYPES
// ============================================================================

export enum ApprovalType {
  DATA_SOURCE_CREATION = 'data_source_creation',
  DATA_SOURCE_MODIFICATION = 'data_source_modification',
  DATA_SOURCE_DELETION = 'data_source_deletion',
  SCHEMA_CHANGE = 'schema_change',
  ACCESS_GRANT = 'access_grant',
  ACCESS_REVOKE = 'access_revoke',
  POLICY_CHANGE = 'policy_change',
  WORKFLOW_DEPLOYMENT = 'workflow_deployment',
  CONFIGURATION_CHANGE = 'configuration_change',
  SECURITY_EXCEPTION = 'security_exception',
  COMPLIANCE_OVERRIDE = 'compliance_override',
  CUSTOM = 'custom'
}

export enum ApprovalStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  ESCALATED = 'escalated',
  DELEGATED = 'delegated'
}

export enum ApprovalPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  URGENT = 4,
  CRITICAL = 5
}

export enum DecisionType {
  APPROVE = 'approve',
  REJECT = 'reject',
  REQUEST_CHANGES = 'request_changes',
  DELEGATE = 'delegate',
  ABSTAIN = 'abstain'
}

export enum ActionType {
  NOTIFY = 'notify',
  ESCALATE = 'escalate',
  AUTO_APPROVE = 'auto_approve',
  AUTO_REJECT = 'auto_reject',
  EXECUTE_WORKFLOW = 'execute_workflow',
  SEND_EMAIL = 'send_email',
  CREATE_TICKET = 'create_ticket'
}

export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  CONTAINS = 'contains',
  IN = 'in',
  NOT_IN = 'not_in',
  MATCHES = 'matches'
}

export enum ConditionType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  ARRAY = 'array',
  OBJECT = 'object'
}

export enum ExceptionAction {
  SKIP_APPROVAL = 'skip_approval',
  REDUCE_REQUIREMENTS = 'reduce_requirements',
  CHANGE_APPROVERS = 'change_approvers',
  EXTEND_DEADLINE = 'extend_deadline'
}

export enum NotificationChannel {
  EMAIL = 'email',
  SLACK = 'slack',
  TEAMS = 'teams',
  SMS = 'sms',
  IN_APP = 'in_app',
  WEBHOOK = 'webhook'
}

export enum NotificationUrgency {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

// ============================================================================
// APPROVAL SYSTEM IMPLEMENTATION
// ============================================================================

export class ApprovalSystem extends EventEmitter {
  private requests: Map<string, ApprovalRequest> = new Map()
  private policies: Map<string, ApprovalPolicy> = new Map()
  private templates: Map<string, ApprovalTemplate> = new Map()
  private delegations: Map<string, DelegationInfo[]> = new Map()
  private escalationManager: EscalationManager
  private policyEngine: PolicyEngine
  private notificationManager: NotificationManager
  private analyticsCollector: ApprovalAnalytics

  constructor() {
    super()
    this.escalationManager = new EscalationManager(this)
    this.policyEngine = new PolicyEngine(this)
    this.notificationManager = new NotificationManager(this)
    this.analyticsCollector = new ApprovalAnalytics(this)
    
    this.setupEventHandlers()
    this.startPeriodicTasks()
  }

  // ========================================================================
  // APPROVAL REQUEST MANAGEMENT
  // ========================================================================

  async createApprovalRequest(
    type: ApprovalType,
    title: string,
    description: string,
    requestedBy: string,
    context: Partial<ApprovalContext>,
    options?: Partial<ApprovalRequestOptions>
  ): Promise<string> {
    try {
      const requestId = uuidv4()
      
      // Apply policies to determine requirements
      const applicablePolicies = await this.policyEngine.getApplicablePolicies(type, context)
      const requirements = await this.policyEngine.generateRequirements(applicablePolicies, context)
      
      // Check for auto-approval conditions
      const autoApprovalResult = await this.policyEngine.checkAutoApproval(type, context, requestedBy)
      if (autoApprovalResult.autoApprove) {
        return this.autoApproveRequest(requestId, autoApprovalResult.reason)
      }

      const request: ApprovalRequest = {
        id: requestId,
        type,
        title,
        description,
        requestedBy,
        requestedAt: new Date(),
        requiredApprovals: requirements,
        currentApprovals: [],
        status: ApprovalStatus.PENDING,
        priority: options?.priority || ApprovalPriority.NORMAL,
        deadline: options?.deadline,
        escalationPolicy: options?.escalationPolicy || this.getDefaultEscalationPolicy(),
        context: {
          dataSourceId: context.dataSourceId,
          workflowId: context.workflowId,
          componentId: context.componentId,
          resourceType: context.resourceType,
          resourceId: context.resourceId,
          changeType: context.changeType,
          businessJustification: context.businessJustification,
          riskLevel: context.riskLevel || 'medium',
          compliance: context.compliance || [],
          metadata: context.metadata || {}
        },
        attachments: options?.attachments || [],
        metadata: {
          tags: options?.tags || [],
          category: options?.category || 'general',
          source: options?.source || 'manual',
          externalId: options?.externalId
        },
        workflow: this.createApprovalWorkflow(requirements)
      }

      this.requests.set(requestId, request)

      // Start the approval workflow
      await this.startApprovalWorkflow(request)

      // Emit creation event
      await eventBus.publish({
        type: 'approval:request:created',
        source: 'approval-system',
        payload: { request },
        priority: this.getPriorityLevel(request.priority),
        metadata: {
          tags: ['approval', 'creation'],
          namespace: 'approval-system',
          version: '1.0',
          headers: {}
        }
      })

      console.log(`Approval request created: ${title} (${requestId})`)
      return requestId

    } catch (error) {
      console.error('Failed to create approval request:', error)
      throw error
    }
  }

  async submitDecision(
    requestId: string,
    requirementId: string,
    approver: string,
    decision: DecisionType,
    reason?: string,
    attachments?: ApprovalAttachment[]
  ): Promise<void> {
    const request = this.requests.get(requestId)
    if (!request) {
      throw new Error(`Approval request ${requestId} not found`)
    }

    if (request.status !== ApprovalStatus.PENDING && request.status !== ApprovalStatus.IN_PROGRESS) {
      throw new Error(`Cannot submit decision for request in status: ${request.status}`)
    }

    // Validate approver authorization
    const requirement = request.requiredApprovals.find(req => req.id === requirementId)
    if (!requirement) {
      throw new Error(`Approval requirement ${requirementId} not found`)
    }

    const isAuthorized = await this.validateApprover(approver, requirement)
    if (!isAuthorized) {
      throw new Error(`User ${approver} is not authorized to approve this requirement`)
    }

    // Check for existing decision
    const existingDecision = request.currentApprovals.find(
      approval => approval.requirementId === requirementId && approval.approver === approver
    )
    if (existingDecision) {
      throw new Error(`Decision already submitted by ${approver} for requirement ${requirementId}`)
    }

    // Create decision
    const decisionRecord: ApprovalDecision = {
      id: uuidv4(),
      requirementId,
      approver,
      decision,
      timestamp: new Date(),
      reason,
      attachments: attachments || [],
      metadata: {
        ipAddress: 'unknown',
        userAgent: 'unknown',
        sessionId: 'unknown'
      }
    }

    request.currentApprovals.push(decisionRecord)
    request.status = ApprovalStatus.IN_PROGRESS

    // Check if this stage is complete
    await this.evaluateApprovalProgress(request)

    // Emit decision event
    await eventBus.publish({
      type: 'approval:decision:submitted',
      source: 'approval-system',
      payload: { requestId, decision: decisionRecord },
      priority: this.getPriorityLevel(request.priority),
      metadata: {
        tags: ['approval', 'decision'],
        namespace: 'approval-system',
        version: '1.0',
        headers: {}
      }
    })

    console.log(`Decision submitted: ${decision} by ${approver} for ${requestId}`)
  }

  async delegateApproval(
    requestId: string,
    requirementId: string,
    delegator: string,
    delegatee: string,
    reason: string,
    timeLimit?: Date
  ): Promise<void> {
    const request = this.requests.get(requestId)
    if (!request) {
      throw new Error(`Approval request ${requestId} not found`)
    }

    const requirement = request.requiredApprovals.find(req => req.id === requirementId)
    if (!requirement || !requirement.delegationAllowed) {
      throw new Error(`Delegation not allowed for requirement ${requirementId}`)
    }

    // Validate delegator authorization
    const isAuthorized = await this.validateApprover(delegator, requirement)
    if (!isAuthorized) {
      throw new Error(`User ${delegator} is not authorized to delegate this approval`)
    }

    // Create delegation record
    const delegation: DelegationInfo = {
      delegatedBy: delegator,
      delegatedTo: delegatee,
      delegatedAt: new Date(),
      reason,
      timeLimit,
      revocable: true,
      notifyOriginal: true
    }

    // Store delegation
    if (!this.delegations.has(delegatee)) {
      this.delegations.set(delegatee, [])
    }
    this.delegations.get(delegatee)!.push(delegation)

    // Update requirement to include delegatee
    if (!requirement.requiredUsers) {
      requirement.requiredUsers = []
    }
    requirement.requiredUsers.push(delegatee)

    request.status = ApprovalStatus.DELEGATED

    // Emit delegation event
    await eventBus.publish({
      type: 'approval:delegated',
      source: 'approval-system',
      payload: { requestId, delegation },
      priority: EventPriority.NORMAL,
      metadata: {
        tags: ['approval', 'delegation'],
        namespace: 'approval-system',
        version: '1.0',
        headers: {}
      }
    })

    // Notify delegatee
    await this.notificationManager.sendDelegationNotification(delegation, request)
  }

  // ========================================================================
  // WORKFLOW MANAGEMENT
  // ========================================================================

  private async startApprovalWorkflow(request: ApprovalRequest): Promise<void> {
    try {
      // Set initial status
      request.status = ApprovalStatus.IN_PROGRESS

      // Start with first stage
      const firstStage = request.workflow.stages[0]
      if (firstStage) {
        await this.processApprovalStage(request, firstStage)
      }

      // Start escalation monitoring
      this.escalationManager.startMonitoring(request.id)

      // Send initial notifications
      await this.notificationManager.sendApprovalRequestNotifications(request)

    } catch (error) {
      request.status = ApprovalStatus.PENDING
      throw error
    }
  }

  private async processApprovalStage(request: ApprovalRequest, stage: ApprovalStage): Promise<void> {
    // Execute stage conditions
    for (const condition of stage.conditions) {
      const result = await this.evaluateStageCondition(condition, request)
      if (!result) {
        console.warn(`Stage condition failed for ${request.id}: ${condition.expression}`)
        return
      }
    }

    // Execute stage actions
    for (const action of stage.actions) {
      await this.executeStageAction(action, request)
    }

    // Set stage timeout if specified
    if (stage.timeLimit) {
      setTimeout(() => {
        this.handleStageTimeout(request.id, stage.id)
      }, stage.timeLimit * 60 * 1000) // Convert minutes to milliseconds
    }
  }

  private async evaluateApprovalProgress(request: ApprovalRequest): Promise<void> {
    const currentStage = request.workflow.stages[request.workflow.currentStage]
    if (!currentStage) return

    // Check if current stage requirements are met
    const stageComplete = await this.isStageComplete(request, currentStage)
    
    if (stageComplete) {
      // Move to next stage or complete approval
      if (request.workflow.currentStage < request.workflow.stages.length - 1) {
        request.workflow.currentStage++
        const nextStage = request.workflow.stages[request.workflow.currentStage]
        await this.processApprovalStage(request, nextStage)
      } else {
        // All stages complete - approve request
        await this.completeApproval(request)
      }
    }

    // Check for rejection
    const hasRejection = request.currentApprovals.some(approval => approval.decision === DecisionType.REJECT)
    if (hasRejection) {
      await this.rejectApproval(request)
    }
  }

  private async isStageComplete(request: ApprovalRequest, stage: ApprovalStage): Promise<boolean> {
    for (const requirement of stage.requirements) {
      const approvals = request.currentApprovals.filter(
        approval => approval.requirementId === requirement.id && 
                   approval.decision === DecisionType.APPROVE
      )

      if (approvals.length < requirement.requiredCount && !requirement.optional) {
        return false
      }
    }
    return true
  }

  private async completeApproval(request: ApprovalRequest): Promise<void> {
    request.status = ApprovalStatus.APPROVED

    // Execute post-approval actions
    await this.executePostApprovalActions(request)

    // Stop escalation monitoring
    this.escalationManager.stopMonitoring(request.id)

    // Send completion notifications
    await this.notificationManager.sendApprovalCompletionNotification(request)

    // Emit completion event
    await eventBus.publish({
      type: 'approval:completed',
      source: 'approval-system',
      payload: { request },
      priority: this.getPriorityLevel(request.priority),
      metadata: {
        tags: ['approval', 'completion'],
        namespace: 'approval-system',
        version: '1.0',
        headers: {}
      }
    })

    console.log(`Approval completed: ${request.title} (${request.id})`)
  }

  private async rejectApproval(request: ApprovalRequest): Promise<void> {
    request.status = ApprovalStatus.REJECTED

    // Stop escalation monitoring
    this.escalationManager.stopMonitoring(request.id)

    // Send rejection notifications
    await this.notificationManager.sendApprovalRejectionNotification(request)

    // Emit rejection event
    await eventBus.publish({
      type: 'approval:rejected',
      source: 'approval-system',
      payload: { request },
      priority: this.getPriorityLevel(request.priority),
      metadata: {
        tags: ['approval', 'rejection'],
        namespace: 'approval-system',
        version: '1.0',
        headers: {}
      }
    })

    console.log(`Approval rejected: ${request.title} (${request.id})`)
  }

  // ========================================================================
  // POLICY MANAGEMENT
  // ========================================================================

  async createPolicy(policy: ApprovalPolicy): Promise<void> {
    // Validate policy
    await this.validatePolicy(policy)
    
    this.policies.set(policy.id, policy)

    await eventBus.publish({
      type: 'approval:policy:created',
      source: 'approval-system',
      payload: { policy },
      priority: EventPriority.NORMAL,
      metadata: {
        tags: ['approval', 'policy'],
        namespace: 'approval-system',
        version: '1.0',
        headers: {}
      }
    })

    console.log(`Approval policy created: ${policy.name} (${policy.id})`)
  }

  async updatePolicy(policyId: string, updates: Partial<ApprovalPolicy>): Promise<void> {
    const policy = this.policies.get(policyId)
    if (!policy) {
      throw new Error(`Policy ${policyId} not found`)
    }

    const updatedPolicy = { ...policy, ...updates }
    await this.validatePolicy(updatedPolicy)
    
    this.policies.set(policyId, updatedPolicy)

    await eventBus.publish({
      type: 'approval:policy:updated',
      source: 'approval-system',
      payload: { policy: updatedPolicy },
      priority: EventPriority.NORMAL,
      metadata: {
        tags: ['approval', 'policy'],
        namespace: 'approval-system',
        version: '1.0',
        headers: {}
      }
    })
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  private createApprovalWorkflow(requirements: ApprovalRequirement[]): ApprovalWorkflow {
    // Group requirements by level to create stages
    const stages: ApprovalStage[] = []
    const levelGroups = requirements.reduce((groups, req) => {
      if (!groups[req.level]) {
        groups[req.level] = []
      }
      groups[req.level].push(req)
      return groups
    }, {} as Record<number, ApprovalRequirement[]>)

    Object.entries(levelGroups)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([level, reqs]) => {
        stages.push({
          id: `stage-${level}`,
          name: `Approval Stage ${level}`,
          description: `Level ${level} approvals`,
          requirements: reqs,
          conditions: [],
          actions: []
        })
      })

    return {
      stages,
      currentStage: 0,
      parallelApprovals: true,
      autoAdvance: true,
      rollbackPolicy: {
        enabled: false,
        conditions: []
      },
      notificationPolicy: {
        enabled: true,
        channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
        templates: {}
      }
    }
  }

  private getDefaultEscalationPolicy(): EscalationPolicy {
    return {
      enabled: true,
      levels: [
        {
          level: 1,
          escalateTo: ['manager'],
          timeLimit: 24 * 60, // 24 hours
          notification: {
            channels: [NotificationChannel.EMAIL],
            template: 'escalation-level-1',
            urgency: NotificationUrgency.NORMAL,
            retryPolicy: {
              maxAttempts: 3,
              delayMinutes: 60
            }
          },
          actions: []
        }
      ],
      autoEscalate: true,
      escalationDelay: 24 * 60, // 24 hours
      notificationTemplate: 'default-escalation'
    }
  }

  private async validateApprover(approver: string, requirement: ApprovalRequirement): Promise<boolean> {
    // Check role-based authorization
    if (requirement.requiredRole) {
      const hasRole = await this.checkUserRole(approver, requirement.requiredRole)
      if (!hasRole) return false
    }

    // Check user-specific authorization
    if (requirement.requiredUsers && requirement.requiredUsers.length > 0) {
      return requirement.requiredUsers.includes(approver)
    }

    return true
  }

  private async checkUserRole(user: string, role: string): Promise<boolean> {
    // This would integrate with your user management system
    // For now, return true as a placeholder
    return true
  }

  private getPriorityLevel(priority: ApprovalPriority): EventPriority {
    switch (priority) {
      case ApprovalPriority.CRITICAL:
      case ApprovalPriority.URGENT:
        return EventPriority.CRITICAL
      case ApprovalPriority.HIGH:
        return EventPriority.HIGH
      default:
        return EventPriority.NORMAL
    }
  }

  private async autoApproveRequest(requestId: string, reason: string): Promise<string> {
    // Create auto-approved request
    // Implementation would create a request with pre-approved status
    console.log(`Auto-approved request ${requestId}: ${reason}`)
    return requestId
  }

  private async validatePolicy(policy: ApprovalPolicy): Promise<void> {
    if (!policy.id || !policy.name) {
      throw new Error('Policy must have id and name')
    }

    // Validate conditions
    for (const condition of policy.conditions) {
      if (!condition.field || !condition.operator) {
        throw new Error('Policy condition must have field and operator')
      }
    }
  }

  private async evaluateStageCondition(condition: StageCondition, request: ApprovalRequest): Promise<boolean> {
    // Evaluate stage condition logic
    return true // Placeholder
  }

  private async executeStageAction(action: StageAction, request: ApprovalRequest): Promise<void> {
    // Execute stage action
    console.debug(`Executing stage action: ${action.type}`)
  }

  private async handleStageTimeout(requestId: string, stageId: string): Promise<void> {
    const request = this.requests.get(requestId)
    if (!request) return

    console.warn(`Stage timeout for request ${requestId}, stage ${stageId}`)
    
    // Trigger escalation
    await this.escalationManager.escalateRequest(requestId, 'stage_timeout')
  }

  private async executePostApprovalActions(request: ApprovalRequest): Promise<void> {
    // Execute any post-approval automation
    console.debug(`Executing post-approval actions for ${request.id}`)
  }

  private setupEventHandlers(): void {
    // Listen for workflow events
    eventBus.subscribe('workflow:*', async (event) => {
      // Handle workflow-related approval events
    })

    // Listen for user events
    eventBus.subscribe('user:*', async (event) => {
      // Handle user-related approval events
    })
  }

  private startPeriodicTasks(): void {
    // Start cleanup tasks
    setInterval(() => {
      this.cleanupExpiredRequests()
    }, 60 * 60 * 1000) // Every hour

    // Start metrics collection
    setInterval(() => {
      this.analyticsCollector.collectMetrics()
    }, 5 * 60 * 1000) // Every 5 minutes
  }

  private cleanupExpiredRequests(): void {
    const now = new Date()
    
    for (const [requestId, request] of this.requests.entries()) {
      if (request.deadline && request.deadline < now && 
          request.status === ApprovalStatus.PENDING) {
        request.status = ApprovalStatus.EXPIRED
        this.notificationManager.sendExpirationNotification(request)
      }
    }
  }

  // ========================================================================
  // PUBLIC API
  // ========================================================================

  getRequest(requestId: string): ApprovalRequest | undefined {
    return this.requests.get(requestId)
  }

  getRequestsByUser(userId: string): ApprovalRequest[] {
    return Array.from(this.requests.values()).filter(request =>
      request.requestedBy === userId ||
      request.requiredApprovals.some(req => 
        req.requiredUsers?.includes(userId)
      )
    )
  }

  getPendingApprovals(userId: string): ApprovalRequest[] {
    return Array.from(this.requests.values()).filter(request =>
      request.status === ApprovalStatus.PENDING &&
      request.requiredApprovals.some(req => 
        req.requiredUsers?.includes(userId) &&
        !request.currentApprovals.some(approval => 
          approval.requirementId === req.id && approval.approver === userId
        )
      )
    )
  }

  getPolicy(policyId: string): ApprovalPolicy | undefined {
    return this.policies.get(policyId)
  }

  getAllPolicies(): ApprovalPolicy[] {
    return Array.from(this.policies.values())
  }

  getMetrics(): ApprovalMetrics {
    return this.analyticsCollector.getMetrics()
  }
}

// ============================================================================
// SUPPORTING CLASSES
// ============================================================================

class EscalationManager {
  private monitoredRequests: Set<string> = new Set()
  private escalationTimers: Map<string, NodeJS.Timeout> = new Map()

  constructor(private approvalSystem: ApprovalSystem) {}

  startMonitoring(requestId: string): void {
    this.monitoredRequests.add(requestId)
    this.scheduleEscalation(requestId)
  }

  stopMonitoring(requestId: string): void {
    this.monitoredRequests.delete(requestId)
    const timer = this.escalationTimers.get(requestId)
    if (timer) {
      clearTimeout(timer)
      this.escalationTimers.delete(requestId)
    }
  }

  async escalateRequest(requestId: string, reason: string): Promise<void> {
    const request = this.approvalSystem.getRequest(requestId)
    if (!request) return

    console.log(`Escalating request ${requestId}: ${reason}`)
    
    // Implementation would handle escalation logic
    request.status = ApprovalStatus.ESCALATED
  }

  private scheduleEscalation(requestId: string): void {
    const request = this.approvalSystem.getRequest(requestId)
    if (!request || !request.escalationPolicy.enabled) return

    const delay = request.escalationPolicy.escalationDelay * 60 * 1000
    const timer = setTimeout(() => {
      this.escalateRequest(requestId, 'timeout')
    }, delay)

    this.escalationTimers.set(requestId, timer)
  }
}

class PolicyEngine {
  constructor(private approvalSystem: ApprovalSystem) {}

  async getApplicablePolicies(type: ApprovalType, context: Partial<ApprovalContext>): Promise<ApprovalPolicy[]> {
    const policies = this.approvalSystem.getAllPolicies()
    return policies.filter(policy => this.isPolicyApplicable(policy, type, context))
  }

  async generateRequirements(policies: ApprovalPolicy[], context: Partial<ApprovalContext>): Promise<ApprovalRequirement[]> {
    const requirements: ApprovalRequirement[] = []
    
    for (const policy of policies) {
      requirements.push(...policy.requirements)
    }

    return requirements
  }

  async checkAutoApproval(type: ApprovalType, context: Partial<ApprovalContext>, requestedBy: string): Promise<AutoApprovalResult> {
    // Check auto-approval rules
    return { autoApprove: false, reason: '' }
  }

  private isPolicyApplicable(policy: ApprovalPolicy, type: ApprovalType, context: Partial<ApprovalContext>): boolean {
    // Evaluate policy conditions
    return policy.enabled
  }
}

class NotificationManager {
  constructor(private approvalSystem: ApprovalSystem) {}

  async sendApprovalRequestNotifications(request: ApprovalRequest): Promise<void> {
    console.log(`Sending approval request notifications for ${request.id}`)
  }

  async sendDelegationNotification(delegation: DelegationInfo, request: ApprovalRequest): Promise<void> {
    console.log(`Sending delegation notification to ${delegation.delegatedTo}`)
  }

  async sendApprovalCompletionNotification(request: ApprovalRequest): Promise<void> {
    console.log(`Sending completion notification for ${request.id}`)
  }

  async sendApprovalRejectionNotification(request: ApprovalRequest): Promise<void> {
    console.log(`Sending rejection notification for ${request.id}`)
  }

  async sendExpirationNotification(request: ApprovalRequest): Promise<void> {
    console.log(`Sending expiration notification for ${request.id}`)
  }
}

class ApprovalAnalytics {
  private metrics: ApprovalMetrics = {
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    averageApprovalTime: 0,
    escalationRate: 0,
    autoApprovalRate: 0,
    delegationRate: 0,
    lastUpdated: new Date()
  }

  constructor(private approvalSystem: ApprovalSystem) {}

  collectMetrics(): void {
    // Collect approval system metrics
    console.debug('Collecting approval metrics')
  }

  getMetrics(): ApprovalMetrics {
    return { ...this.metrics }
  }
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

interface ApprovalContext {
  dataSourceId?: number
  workflowId?: string
  componentId?: string
  resourceType?: string
  resourceId?: string
  changeType?: string
  businessJustification?: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  compliance: string[]
  metadata: Record<string, any>
}

interface ApprovalAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadedBy: string
  uploadedAt: Date
}

interface ApprovalMetadata {
  tags: string[]
  category: string
  source: string
  externalId?: string
}

interface DecisionMetadata {
  ipAddress: string
  userAgent: string
  sessionId: string
}

interface PolicyMetadata {
  author: string
  version: string
  lastModified: Date
  tags: string[]
}

interface PolicyScope {
  types: ApprovalType[]
  departments: string[]
  riskLevels: string[]
  resourceTypes: string[]
}

interface AutoApproveRule {
  condition: string
  reason: string
  enabled: boolean
}

interface AutoRejectRule {
  condition: string
  reason: string
  enabled: boolean
}

interface ValidationRule {
  name: string
  condition: string
  message: string
}

interface PostApprovalAction {
  type: string
  target: string
  parameters: Record<string, any>
}

interface ApprovalTemplate {
  id: string
  name: string
  type: ApprovalType
  requirements: ApprovalRequirement[]
  workflow: ApprovalWorkflow
}

interface StageCondition {
  expression: string
  type: string
}

interface StageAction {
  type: string
  target: string
  parameters: Record<string, any>
}

interface RollbackPolicy {
  enabled: boolean
  conditions: string[]
}

interface NotificationPolicy {
  enabled: boolean
  channels: NotificationChannel[]
  templates: Record<string, string>
}

interface EscalationConfig {
  enabled: boolean
  timeLimit: number
  escalateTo: string[]
}

interface NotificationRetryPolicy {
  maxAttempts: number
  delayMinutes: number
}

interface ApprovalCondition {
  type: string
  value: any
}

interface ApprovalRequestOptions {
  priority: ApprovalPriority
  deadline: Date
  escalationPolicy: EscalationPolicy
  attachments: ApprovalAttachment[]
  tags: string[]
  category: string
  source: string
  externalId: string
}

interface AutoApprovalResult {
  autoApprove: boolean
  reason: string
}

interface ApprovalMetrics {
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
  averageApprovalTime: number
  escalationRate: number
  autoApprovalRate: number
  delegationRate: number
  lastUpdated: Date
}

// Export singleton instance
export const approvalSystem = new ApprovalSystem()
export default approvalSystem

// Export WorkflowEngine for component integration
export const WorkflowEngine = approvalSystem