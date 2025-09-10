import { EventEmitter } from "../browser-event-emitter";
import { v4 as uuidv4 } from 'uuid'
import { eventBus, EventBusEvent, EventPriority } from './event-bus'
import { WorkflowDefinition, workflowEngine } from './workflow-engine'

// ============================================================================
// CORE COMPONENT INTERFACES
// ============================================================================

export interface ComponentDefinition {
  id: string
  name: string
  type: ComponentType
  category: ComponentCategory
  version: string
  description: string
  dependencies: ComponentDependency[]
  capabilities: ComponentCapability[]
  lifecycle: ComponentLifecycle
  metadata: ComponentMetadata
  configuration: ComponentConfiguration
  apis: ComponentAPI[]
  events: ComponentEventDefinition[]
  workflows: string[] // workflow IDs this component participates in
  permissions: ComponentPermissions
}

export interface ComponentInstance {
  id: string
  definitionId: string
  name: string
  status: ComponentStatus
  health: ComponentHealth
  createdAt: Date
  lastActive: Date
  configuration: Record<string, any>
  dependencies: ResolvedDependency[]
  metrics: ComponentMetrics
  context: ComponentContext
  eventHandlers: Map<string, Function>
  workflowSubscriptions: string[]
}

export interface ComponentDependency {
  id: string
  type: DependencyType
  required: boolean
  version?: string
  capabilities?: string[]
  fallback?: string // fallback component ID
  condition?: string // when this dependency is needed
}

export interface ResolvedDependency {
  dependencyId: string
  componentId: string
  instanceId: string
  status: DependencyStatus
  lastResolved: Date
  failureCount: number
}

export interface ComponentCapability {
  id: string
  name: string
  type: CapabilityType
  description: string
  inputs: CapabilityInput[]
  outputs: CapabilityOutput[]
  constraints: CapabilityConstraint[]
  performance: PerformanceProfile
}

// ============================================================================
// LIFECYCLE AND HEALTH
// ============================================================================

export interface ComponentLifecycle {
  phases: LifecyclePhase[]
  hooks: LifecycleHooks
  dependencies: LifecycleDependency[]
  timeout: number
  retryPolicy: LifecycleRetryPolicy
}

export interface LifecyclePhase {
  name: string
  order: number
  required: boolean
  timeout: number
  rollback?: boolean
  validation?: string
}

export interface LifecycleHooks {
  beforeInitialize?: () => Promise<void>
  afterInitialize?: () => Promise<void>
  beforeStart?: () => Promise<void>
  afterStart?: () => Promise<void>
  beforeStop?: () => Promise<void>
  afterStop?: () => Promise<void>
  beforeDestroy?: () => Promise<void>
  afterDestroy?: () => Promise<void>
  onError?: (error: Error, phase: string) => Promise<void>
  onHealthCheck?: () => Promise<ComponentHealth>
}

export interface ComponentHealth {
  status: HealthStatus
  score: number // 0-100
  lastCheck: Date
  checks: HealthCheck[]
  dependencies: DependencyHealth[]
  resources: ResourceUsage
  errors: HealthError[]
}

export interface HealthCheck {
  name: string
  status: HealthStatus
  message: string
  duration: number
  timestamp: Date
}

// ============================================================================
// CONFIGURATION AND APIS
// ============================================================================

export interface ComponentConfiguration {
  schema: ConfigurationSchema
  defaults: Record<string, any>
  validation: ValidationRule[]
  secrets: string[]
  environment: EnvironmentConfig
}

export interface ComponentAPI {
  id: string
  name: string
  type: APIType
  endpoint?: string
  method?: string
  schema: APISchema
  authentication?: AuthenticationConfig
  rateLimit?: RateLimitConfig
  cache?: CacheConfig
}

export interface ComponentEventDefinition {
  type: string
  description: string
  schema: EventSchema
  priority: EventPriority
  retryable: boolean
}

export interface ComponentContext {
  instanceId: string
  userId?: string
  sessionId?: string
  workspaceId?: string
  dataSourceId?: number
  variables: Map<string, any>
  sharedState: Map<string, any>
  permissions: string[]
  metadata: Record<string, any>
}

// ============================================================================
// ENUMS AND TYPES
// ============================================================================

export enum ComponentType {
  DATA_SOURCE = 'data_source',
  TRANSFORMER = 'transformer',
  VALIDATOR = 'validator',
  CONNECTOR = 'connector',
  ANALYZER = 'analyzer',
  VISUALIZER = 'visualizer',
  PROCESSOR = 'processor',
  MONITOR = 'monitor',
  UTILITY = 'utility',
  INTEGRATION = 'integration'
}

export enum ComponentCategory {
  CORE = 'core',
  DATA_MANAGEMENT = 'data_management',
  ANALYTICS = 'analytics',
  SECURITY = 'security',
  MONITORING = 'monitoring',
  INTEGRATION = 'integration',
  WORKFLOW = 'workflow',
  UI = 'ui',
  INFRASTRUCTURE = 'infrastructure'
}

export enum ComponentStatus {
  REGISTERED = 'registered',
  INITIALIZING = 'initializing',
  READY = 'ready',
  RUNNING = 'running',
  PAUSED = 'paused',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
  ERROR = 'error',
  DESTROYED = 'destroyed'
}

export enum HealthStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning',
  CRITICAL = 'critical',
  UNKNOWN = 'unknown'
}

export enum DependencyType {
  COMPONENT = 'component',
  SERVICE = 'service',
  DATA_SOURCE = 'data_source',
  LIBRARY = 'library',
  CONFIGURATION = 'configuration'
}

export enum DependencyStatus {
  RESOLVED = 'resolved',
  PENDING = 'pending',
  FAILED = 'failed',
  OPTIONAL = 'optional'
}

export enum CapabilityType {
  DATA_PROCESSING = 'data_processing',
  VALIDATION = 'validation',
  TRANSFORMATION = 'transformation',
  ANALYSIS = 'analysis',
  MONITORING = 'monitoring',
  COMMUNICATION = 'communication',
  STORAGE = 'storage',
  COMPUTATION = 'computation'
}

export enum APIType {
  REST = 'rest',
  GRAPHQL = 'graphql',
  WEBSOCKET = 'websocket',
  RPC = 'rpc',
  EVENT = 'event'
}

// ============================================================================
// COMPONENT REGISTRY IMPLEMENTATION
// ============================================================================

export class ComponentRegistry extends EventEmitter {
  private definitions: Map<string, ComponentDefinition> = new Map()
  private instances: Map<string, ComponentInstance> = new Map()
  private dependencyGraph: Map<string, Set<string>> = new Map()
  private capabilityIndex: Map<string, ComponentDefinition[]> = new Map()
  private typeIndex: Map<ComponentType, ComponentDefinition[]> = new Map()
  private categoryIndex: Map<ComponentCategory, ComponentDefinition[]> = new Map()
  private healthMonitor: HealthMonitor
  private lifecycleManager: LifecycleManager
  private dependencyResolver: DependencyResolver

  constructor() {
    super()
    this.healthMonitor = new HealthMonitor(this)
    this.lifecycleManager = new LifecycleManager(this)
    this.dependencyResolver = new DependencyResolver(this)
    
    this.setupEventHandlers()
    this.startHealthMonitoring()
  }

  // ========================================================================
  // COMPONENT DEFINITION MANAGEMENT
  // ========================================================================

  async registerComponent(definition: ComponentDefinition): Promise<void> {
    try {
      // Validate definition
      this.validateComponentDefinition(definition)
      
      // Check for conflicts
      if (this.definitions.has(definition.id)) {
        throw new Error(`Component ${definition.id} is already registered`)
      }

      // Store definition
      this.definitions.set(definition.id, definition)
      
      // Update indexes
      this.updateIndexes(definition)
      
      // Update dependency graph
      this.updateDependencyGraph(definition)
      
      // Validate dependencies
      await this.validateDependencies(definition)

      // Emit registration event
      await eventBus.publish({
        type: 'component:registered',
        source: 'component-registry',
        payload: { definition },
        priority: EventPriority.NORMAL,
        metadata: {
          tags: ['component', 'registration'],
          namespace: 'component-registry',
          version: '1.0',
          headers: {}
        }
      })

      console.log(`Component registered: ${definition.name} (${definition.id})`)

    } catch (error) {
      console.error('Failed to register component:', error)
      throw error
    }
  }

  async unregisterComponent(componentId: string): Promise<void> {
    const definition = this.definitions.get(componentId)
    if (!definition) {
      throw new Error(`Component ${componentId} not found`)
    }

    // Check for dependent instances
    const dependentInstances = this.findDependentInstances(componentId)
    if (dependentInstances.length > 0) {
      throw new Error(`Cannot unregister component ${componentId}: has dependent instances`)
    }

    // Remove from indexes
    this.removeFromIndexes(definition)
    
    // Remove from dependency graph
    this.removeDependencyGraph(componentId)
    
    // Remove definition
    this.definitions.delete(componentId)

    // Emit unregistration event
    await eventBus.publish({
      type: 'component:unregistered',
      source: 'component-registry',
      payload: { componentId, definition },
      priority: EventPriority.NORMAL,
      metadata: {
        tags: ['component', 'unregistration'],
        namespace: 'component-registry',
        version: '1.0',
        headers: {}
      }
    })

    console.log(`Component unregistered: ${definition.name} (${componentId})`)
  }

  // ========================================================================
  // COMPONENT INSTANCE MANAGEMENT
  // ========================================================================

  async createInstance(
    componentId: string,
    config?: Record<string, any>,
    context?: Partial<ComponentContext>
  ): Promise<string> {
    const definition = this.definitions.get(componentId)
    if (!definition) {
      throw new Error(`Component ${componentId} not found`)
    }

    const instanceId = uuidv4()
    const instanceContext: ComponentContext = {
      instanceId,
      userId: context?.userId,
      sessionId: context?.sessionId,
      workspaceId: context?.workspaceId,
      dataSourceId: context?.dataSourceId,
      variables: context?.variables || new Map(),
      sharedState: context?.sharedState || new Map(),
      permissions: context?.permissions || [],
      metadata: context?.metadata || {}
    }

    const instance: ComponentInstance = {
      id: instanceId,
      definitionId: componentId,
      name: `${definition.name}-${instanceId.substr(0, 8)}`,
      status: ComponentStatus.REGISTERED,
      health: {
        status: HealthStatus.UNKNOWN,
        score: 0,
        lastCheck: new Date(),
        checks: [],
        dependencies: [],
        resources: {
          cpu: 0,
          memory: 0,
          storage: 0,
          network: 0
        },
        errors: []
      },
      createdAt: new Date(),
      lastActive: new Date(),
      configuration: { ...definition.configuration.defaults, ...config },
      dependencies: [],
      metrics: {
        startTime: new Date(),
        uptime: 0,
        requestCount: 0,
        errorCount: 0,
        averageResponseTime: 0,
        throughput: 0,
        lastRequest: new Date()
      },
      context: instanceContext,
      eventHandlers: new Map(),
      workflowSubscriptions: []
    }

    this.instances.set(instanceId, instance)

    try {
      // Resolve dependencies
      await this.dependencyResolver.resolveDependencies(instance, definition)
      
      // Initialize instance
      await this.lifecycleManager.initializeInstance(instance, definition)
      
      // Start health monitoring
      this.healthMonitor.startMonitoring(instanceId)

      // Emit instance creation event
      await eventBus.publish({
        type: 'component:instance:created',
        source: 'component-registry',
        payload: { instanceId, componentId, instance },
        priority: EventPriority.NORMAL,
        metadata: {
          tags: ['component', 'instance', 'creation'],
          namespace: 'component-registry',
          version: '1.0',
          headers: {}
        }
      })

      console.log(`Component instance created: ${instance.name} (${instanceId})`)
      return instanceId

    } catch (error) {
      // Cleanup on failure
      this.instances.delete(instanceId)
      console.error('Failed to create component instance:', error)
      throw error
    }
  }

  async destroyInstance(instanceId: string): Promise<void> {
    const instance = this.instances.get(instanceId)
    if (!instance) {
      throw new Error(`Instance ${instanceId} not found`)
    }

    const definition = this.definitions.get(instance.definitionId)
    if (!definition) {
      throw new Error(`Definition ${instance.definitionId} not found`)
    }

    try {
      // Stop health monitoring
      this.healthMonitor.stopMonitoring(instanceId)
      
      // Destroy instance
      await this.lifecycleManager.destroyInstance(instance, definition)
      
      // Remove from registry
      this.instances.delete(instanceId)

      // Emit instance destruction event
      await eventBus.publish({
        type: 'component:instance:destroyed',
        source: 'component-registry',
        payload: { instanceId, instance },
        priority: EventPriority.NORMAL,
        metadata: {
          tags: ['component', 'instance', 'destruction'],
          namespace: 'component-registry',
          version: '1.0',
          headers: {}
        }
      })

      console.log(`Component instance destroyed: ${instance.name} (${instanceId})`)

    } catch (error) {
      console.error('Failed to destroy component instance:', error)
      throw error
    }
  }

  // ========================================================================
  // SMART DISCOVERY AND MATCHING
  // ========================================================================

  findComponentsByCapability(capabilityType: CapabilityType): ComponentDefinition[] {
    const components: ComponentDefinition[] = []
    
    for (const definition of this.definitions.values()) {
      const hasCapability = definition.capabilities.some(cap => cap.type === capabilityType)
      if (hasCapability) {
        components.push(definition)
      }
    }
    
    return components.sort((a, b) => this.calculateCapabilityScore(b, capabilityType) - this.calculateCapabilityScore(a, capabilityType))
  }

  findCompatibleComponents(requirements: ComponentRequirements): ComponentMatch[] {
    const matches: ComponentMatch[] = []
    
    for (const definition of this.definitions.values()) {
      const score = this.calculateCompatibilityScore(definition, requirements)
      if (score > 0) {
        matches.push({
          definition,
          score,
          reasons: this.getMatchReasons(definition, requirements)
        })
      }
    }
    
    return matches.sort((a, b) => b.score - a.score)
  }

  suggestDependencies(componentId: string): DependencySuggestion[] {
    const definition = this.definitions.get(componentId)
    if (!definition) {
      return []
    }

    const suggestions: DependencySuggestion[] = []
    
    // Analyze missing capabilities
    for (const dependency of definition.dependencies) {
      if (dependency.required && !this.isDependencyResolved(componentId, dependency.id)) {
        const candidates = this.findComponentsByCapability(dependency.capabilities?.[0] as CapabilityType)
        
        if (candidates.length > 0) {
          suggestions.push({
            dependency,
            candidates: candidates.slice(0, 3), // Top 3 candidates
            reason: 'Required dependency not resolved',
            priority: 'high'
          })
        }
      }
    }
    
    return suggestions
  }

  // ========================================================================
  // DEPENDENCY MANAGEMENT
  // ========================================================================

  async resolveDependency(instanceId: string, dependencyId: string): Promise<boolean> {
    const instance = this.instances.get(instanceId)
    if (!instance) {
      throw new Error(`Instance ${instanceId} not found`)
    }

    const definition = this.definitions.get(instance.definitionId)
    if (!definition) {
      throw new Error(`Definition ${instance.definitionId} not found`)
    }

    return this.dependencyResolver.resolveSingleDependency(instance, definition, dependencyId)
  }

  getDependencyTree(componentId: string): DependencyTree {
    const visited = new Set<string>()
    const tree: DependencyTree = {
      componentId,
      dependencies: []
    }

    this.buildDependencyTree(componentId, tree, visited)
    return tree
  }

  private buildDependencyTree(componentId: string, tree: DependencyTree, visited: Set<string>): void {
    if (visited.has(componentId)) {
      return // Circular dependency
    }

    visited.add(componentId)
    const dependencies = this.dependencyGraph.get(componentId)
    
    if (dependencies) {
      for (const depId of dependencies) {
        const subTree: DependencyTree = {
          componentId: depId,
          dependencies: []
        }
        tree.dependencies.push(subTree)
        this.buildDependencyTree(depId, subTree, visited)
      }
    }
    
    visited.delete(componentId)
  }

  // ========================================================================
  // WORKFLOW INTEGRATION
  // ========================================================================

  async attachToWorkflow(instanceId: string, workflowId: string): Promise<void> {
    const instance = this.instances.get(instanceId)
    if (!instance) {
      throw new Error(`Instance ${instanceId} not found`)
    }

    const workflow = workflowEngine.getWorkflow(workflowId)
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`)
    }

    // Add workflow subscription
    instance.workflowSubscriptions.push(workflowId)

    // Subscribe to workflow events
    const subscriptionId = eventBus.subscribe(
      `workflow:${workflowId}:*`,
      async (event: EventBusEvent) => {
        await this.handleWorkflowEvent(instanceId, event)
      },
      { priority: 2 }
    )

    // Store subscription for cleanup
    instance.eventHandlers.set(workflowId, subscriptionId)

    await eventBus.publish({
      type: 'component:workflow:attached',
      source: 'component-registry',
      payload: { instanceId, workflowId },
      priority: EventPriority.NORMAL,
      metadata: {
        tags: ['component', 'workflow', 'attachment'],
        namespace: 'component-registry',
        version: '1.0',
        headers: {}
      }
    })
  }

  private async handleWorkflowEvent(instanceId: string, event: EventBusEvent): Promise<void> {
    const instance = this.instances.get(instanceId)
    if (!instance) return

    // Update instance context with workflow information
    instance.context.metadata.lastWorkflowEvent = event.type
    instance.context.metadata.workflowId = event.metadata.workflowId
    instance.lastActive = new Date()

    // Trigger instance-specific handling
    // This would integrate with the component's workflow handlers
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  private validateComponentDefinition(definition: ComponentDefinition): void {
    if (!definition.id || !definition.name || !definition.type) {
      throw new Error('Component definition must have id, name, and type')
    }

    if (!definition.version) {
      throw new Error('Component definition must have version')
    }

    // Validate dependencies
    if (definition.dependencies && Array.isArray(definition.dependencies)) {
      for (const dep of definition.dependencies) {
        if (!dep.id || !dep.type) {
          throw new Error('Component dependency must have id and type')
        }
      }
    }

    // Validate capabilities
    if (definition.capabilities && Array.isArray(definition.capabilities)) {
      for (const cap of definition.capabilities) {
        if (!cap.id || !cap.name || !cap.type) {
          throw new Error('Component capability must have id, name, and type')
        }
      }
    }
  }

  private updateIndexes(definition: ComponentDefinition): void {
    // Type index
    if (!this.typeIndex.has(definition.type)) {
      this.typeIndex.set(definition.type, [])
    }
    this.typeIndex.get(definition.type)!.push(definition)

    // Category index
    if (!this.categoryIndex.has(definition.category)) {
      this.categoryIndex.set(definition.category, [])
    }
    this.categoryIndex.get(definition.category)!.push(definition)

    // Capability index
    if (definition.capabilities && Array.isArray(definition.capabilities)) {
      for (const capability of definition.capabilities) {
        const key = capability.type
        if (!this.capabilityIndex.has(key)) {
          this.capabilityIndex.set(key, [])
        }
        this.capabilityIndex.get(key)!.push(definition)
      }
    }
  }

  private removeFromIndexes(definition: ComponentDefinition): void {
    // Type index
    const typeComponents = this.typeIndex.get(definition.type)
    if (typeComponents) {
      const index = typeComponents.findIndex(c => c.id === definition.id)
      if (index !== -1) {
        typeComponents.splice(index, 1)
      }
    }

    // Category index
    const categoryComponents = this.categoryIndex.get(definition.category)
    if (categoryComponents) {
      const index = categoryComponents.findIndex(c => c.id === definition.id)
      if (index !== -1) {
        categoryComponents.splice(index, 1)
      }
    }

    // Capability index
    for (const capability of definition.capabilities) {
      const key = capability.type
      const capComponents = this.capabilityIndex.get(key)
      if (capComponents) {
        const index = capComponents.findIndex(c => c.id === definition.id)
        if (index !== -1) {
          capComponents.splice(index, 1)
        }
      }
    }
  }

  private updateDependencyGraph(definition: ComponentDefinition): void {
    const dependencies = new Set(definition.dependencies.map(d => d.id))
    this.dependencyGraph.set(definition.id, dependencies)
  }

  private removeDependencyGraph(componentId: string): void {
    this.dependencyGraph.delete(componentId)
    
    // Remove from other components' dependencies
    for (const [id, deps] of this.dependencyGraph.entries()) {
      deps.delete(componentId)
    }
  }

  private async validateDependencies(definition: ComponentDefinition): Promise<void> {
    for (const dependency of definition.dependencies) {
      if (dependency.required && !this.definitions.has(dependency.id)) {
        if (!dependency.fallback) {
          console.warn(`Required dependency ${dependency.id} not found for component ${definition.id}`)
        }
      }
    }
  }

  private findDependentInstances(componentId: string): ComponentInstance[] {
    const dependents: ComponentInstance[] = []
    
    for (const instance of this.instances.values()) {
      const hasDependency = instance.dependencies.some(dep => dep.componentId === componentId)
      if (hasDependency) {
        dependents.push(instance)
      }
    }
    
    return dependents
  }

  private calculateCapabilityScore(definition: ComponentDefinition, capabilityType: CapabilityType): number {
    let score = 0
    
    for (const capability of definition.capabilities) {
      if (capability.type === capabilityType) {
        score += 10
        // Add performance bonus
        if (capability.performance.latency < 100) score += 5
        if (capability.performance.throughput > 1000) score += 5
      }
    }
    
    return score
  }

  private calculateCompatibilityScore(definition: ComponentDefinition, requirements: ComponentRequirements): number {
    let score = 0
    
    // Type matching
    if (requirements.type && definition.type === requirements.type) {
      score += 20
    }
    
    // Category matching
    if (requirements.category && definition.category === requirements.category) {
      score += 15
    }
    
    // Capability matching
    if (requirements.capabilities) {
      for (const reqCap of requirements.capabilities) {
        const hasCapability = definition.capabilities.some(cap => cap.type === reqCap)
        if (hasCapability) {
          score += 10
        }
      }
    }
    
    // Version compatibility
    if (requirements.version && definition.version === requirements.version) {
      score += 5
    }
    
    return score
  }

  private getMatchReasons(definition: ComponentDefinition, requirements: ComponentRequirements): string[] {
    const reasons: string[] = []
    
    if (requirements.type && definition.type === requirements.type) {
      reasons.push(`Matches required type: ${requirements.type}`)
    }
    
    if (requirements.category && definition.category === requirements.category) {
      reasons.push(`Matches required category: ${requirements.category}`)
    }
    
    return reasons
  }

  private isDependencyResolved(componentId: string, dependencyId: string): boolean {
    // Check if dependency is resolved for any instance of this component
    for (const instance of this.instances.values()) {
      if (instance.definitionId === componentId) {
        const resolved = instance.dependencies.some(dep => 
          dep.dependencyId === dependencyId && dep.status === DependencyStatus.RESOLVED
        )
        if (resolved) return true
      }
    }
    return false
  }

  private setupEventHandlers(): void {
    // Listen for workflow events
    eventBus.subscribe('workflow:*', async (event: EventBusEvent) => {
      // Update component instances involved in workflows
      for (const instance of this.instances.values()) {
        if (instance.workflowSubscriptions.includes(event.metadata.workflowId || '')) {
          instance.lastActive = new Date()
        }
      }
    })

    // Listen for component health events
    eventBus.subscribe('component:health:*', async (event: EventBusEvent) => {
      const instanceId = event.payload?.instanceId
      if (instanceId && this.instances.has(instanceId)) {
        // Update instance health
        const instance = this.instances.get(instanceId)!
        instance.health = event.payload.health
        instance.lastActive = new Date()
      }
    })
  }

  private startHealthMonitoring(): void {
    setInterval(async () => {
      for (const instance of this.instances.values()) {
        if (instance.status === ComponentStatus.RUNNING) {
          await this.healthMonitor.checkHealth(instance.id)
        }
      }
    }, 30000) // Check every 30 seconds
  }

  // ========================================================================
  // PUBLIC API
  // ========================================================================

  getComponent(componentId: string): ComponentDefinition | undefined {
    return this.definitions.get(componentId)
  }

  getInstance(instanceId: string): ComponentInstance | undefined {
    return this.instances.get(instanceId)
  }

  getAllComponents(): ComponentDefinition[] {
    return Array.from(this.definitions.values())
  }

  getAllInstances(): ComponentInstance[] {
    return Array.from(this.instances.values())
  }

  getComponentsByType(type: ComponentType): ComponentDefinition[] {
    return this.typeIndex.get(type) || []
  }

  getComponentsByCategory(category: ComponentCategory): ComponentDefinition[] {
    return this.categoryIndex.get(category) || []
  }

  getInstancesByComponent(componentId: string): ComponentInstance[] {
    return Array.from(this.instances.values()).filter(instance => 
      instance.definitionId === componentId
    )
  }

  getHealthStatus(instanceId: string): ComponentHealth | undefined {
    const instance = this.instances.get(instanceId)
    return instance?.health
  }
}

// ============================================================================
// SUPPORTING CLASSES
// ============================================================================

class HealthMonitor {
  private monitoredInstances: Set<string> = new Set()

  constructor(private registry: ComponentRegistry) {}

  startMonitoring(instanceId: string): void {
    this.monitoredInstances.add(instanceId)
  }

  stopMonitoring(instanceId: string): void {
    this.monitoredInstances.delete(instanceId)
  }

  async checkHealth(instanceId: string): Promise<ComponentHealth> {
    const instance = this.registry.getInstance(instanceId)
    if (!instance) {
      throw new Error(`Instance ${instanceId} not found`)
    }

    const health: ComponentHealth = {
      status: HealthStatus.HEALTHY,
      score: 100,
      lastCheck: new Date(),
      checks: [],
      dependencies: [],
      resources: {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        storage: Math.random() * 100,
        network: Math.random() * 100
      },
      errors: []
    }

    // Perform health checks
    // This would integrate with actual health check implementations

    instance.health = health
    return health
  }
}

class LifecycleManager {
  constructor(private registry: ComponentRegistry) {}

  async initializeInstance(instance: ComponentInstance, definition: ComponentDefinition): Promise<void> {
    try {
      instance.status = ComponentStatus.INITIALIZING

      // Execute lifecycle phases
      for (const phase of definition.lifecycle.phases) {
        await this.executePhase(instance, definition, phase)
      }

      instance.status = ComponentStatus.READY
      instance.lastActive = new Date()

    } catch (error) {
      instance.status = ComponentStatus.ERROR
      throw error
    }
  }

  async destroyInstance(instance: ComponentInstance, definition: ComponentDefinition): Promise<void> {
    try {
      instance.status = ComponentStatus.STOPPING

      // Execute destruction hooks
      if (definition.lifecycle.hooks.beforeDestroy) {
        await definition.lifecycle.hooks.beforeDestroy()
      }

      instance.status = ComponentStatus.DESTROYED

      if (definition.lifecycle.hooks.afterDestroy) {
        await definition.lifecycle.hooks.afterDestroy()
      }

    } catch (error) {
      instance.status = ComponentStatus.ERROR
      throw error
    }
  }

  private async executePhase(
    instance: ComponentInstance,
    definition: ComponentDefinition,
    phase: LifecyclePhase
  ): Promise<void> {
    // Execute phase logic
    // This would integrate with actual phase implementations
    console.debug(`Executing phase ${phase.name} for instance ${instance.id}`)
  }
}

class DependencyResolver {
  constructor(private registry: ComponentRegistry) {}

  async resolveDependencies(instance: ComponentInstance, definition: ComponentDefinition): Promise<void> {
    for (const dependency of definition.dependencies) {
      await this.resolveSingleDependency(instance, definition, dependency.id)
    }
  }

  async resolveSingleDependency(
    instance: ComponentInstance,
    definition: ComponentDefinition,
    dependencyId: string
  ): Promise<boolean> {
    const dependency = definition.dependencies.find(d => d.id === dependencyId)
    if (!dependency) {
      return false
    }

    try {
      // Find suitable component
      const targetComponent = this.registry.getComponent(dependency.id)
      if (!targetComponent) {
        if (dependency.fallback) {
          // Try fallback
          return this.resolveSingleDependency(instance, definition, dependency.fallback)
        }
        
        if (dependency.required) {
          throw new Error(`Required dependency ${dependency.id} not found`)
        }
        
        return false
      }

      // Create or find existing instance
      const targetInstances = this.registry.getInstancesByComponent(dependency.id)
      let targetInstanceId: string

      if (targetInstances.length > 0) {
        // Use existing instance
        targetInstanceId = targetInstances[0].id
      } else {
        // Create new instance
        targetInstanceId = await this.registry.createInstance(dependency.id)
      }

      // Add resolved dependency
      const resolvedDependency: ResolvedDependency = {
        dependencyId: dependency.id,
        componentId: dependency.id,
        instanceId: targetInstanceId,
        status: DependencyStatus.RESOLVED,
        lastResolved: new Date(),
        failureCount: 0
      }

      instance.dependencies.push(resolvedDependency)
      return true

    } catch (error) {
      console.error(`Failed to resolve dependency ${dependency.id}:`, error)
      
      const failedDependency: ResolvedDependency = {
        dependencyId: dependency.id,
        componentId: dependency.id,
        instanceId: '',
        status: DependencyStatus.FAILED,
        lastResolved: new Date(),
        failureCount: 1
      }

      instance.dependencies.push(failedDependency)
      return false
    }
  }
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

interface ComponentMetadata {
  author: string
  license: string
  tags: string[]
  documentation: string
  repository?: string
  homepage?: string
  keywords: string[]
}

interface ComponentPermissions {
  execute: string[]
  configure: string[]
  monitor: string[]
  destroy: string[]
}

interface ComponentMetrics {
  startTime: Date
  uptime: number
  requestCount: number
  errorCount: number
  averageResponseTime: number
  throughput: number
  lastRequest: Date
}

interface CapabilityInput {
  name: string
  type: string
  required: boolean
  description: string
  schema?: any
}

interface CapabilityOutput {
  name: string
  type: string
  description: string
  schema?: any
}

interface CapabilityConstraint {
  type: string
  value: any
  description: string
}

interface PerformanceProfile {
  latency: number // ms
  throughput: number // ops/sec
  memory: number // MB
  cpu: number // %
}

interface LifecycleDependency {
  phase: string
  dependsOn: string[]
  optional: boolean
}

interface LifecycleRetryPolicy {
  maxAttempts: number
  delay: number
  backoffMultiplier: number
}

interface DependencyHealth {
  dependencyId: string
  status: HealthStatus
  lastCheck: Date
  latency: number
}

interface ResourceUsage {
  cpu: number
  memory: number
  storage: number
  network: number
}

interface HealthError {
  code: string
  message: string
  timestamp: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface ConfigurationSchema {
  properties: Record<string, any>
  required: string[]
  additionalProperties: boolean
}

interface ValidationRule {
  field: string
  type: string
  rules: any[]
}

interface EnvironmentConfig {
  development: Record<string, any>
  staging: Record<string, any>
  production: Record<string, any>
}

interface APISchema {
  input?: any
  output?: any
  errors?: any[]
}

interface AuthenticationConfig {
  type: string
  config: Record<string, any>
}

interface RateLimitConfig {
  requestsPerMinute: number
  burstLimit: number
}

interface CacheConfig {
  ttl: number
  maxSize: number
  strategy: string
}

interface EventSchema {
  properties: Record<string, any>
  required: string[]
}

interface ComponentRequirements {
  type?: ComponentType
  category?: ComponentCategory
  capabilities?: CapabilityType[]
  version?: string
  performance?: Partial<PerformanceProfile>
}

interface ComponentMatch {
  definition: ComponentDefinition
  score: number
  reasons: string[]
}

interface DependencySuggestion {
  dependency: ComponentDependency
  candidates: ComponentDefinition[]
  reason: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}

interface DependencyTree {
  componentId: string
  dependencies: DependencyTree[]
}

// Export singleton instance
export const componentRegistry = new ComponentRegistry()
export default componentRegistry
