import { EventEmitter } from "../browser-event-emitter";
import { v4 as uuidv4 } from 'uuid'
import { eventBus, EventBusEvent, EventPriority } from './event-bus'

// ============================================================================
// CORE STATE INTERFACES
// ============================================================================

export interface StateDefinition<T = any> {
  id: string
  name: string
  namespace: string
  initialValue: T
  schema?: StateSchema
  validators: StateValidator<T>[]
  middleware: StateMiddleware<T>[]
  persistence: PersistenceConfig
  reactivity: ReactivityConfig
  security: SecurityConfig
  metadata: StateMetadata
}

export interface StateInstance<T = any> {
  id: string
  definitionId: string
  namespace: string
  currentValue: T
  previousValue?: T
  version: number
  history: StateHistoryEntry<T>[]
  subscriptions: Map<string, StateSubscription<T>>
  computedStates: Map<string, ComputedState<T>>
  status: StateStatus
  createdAt: Date
  updatedAt: Date
  metadata: StateInstanceMetadata
}

export interface StateHistoryEntry<T = any> {
  version: number
  value: T
  timestamp: Date
  action: StateAction
  context: StateContext
  diff?: StateDiff
}

export interface StateAction {
  type: string
  payload: any
  source: string
  timestamp: Date
  userId?: string
  metadata: Record<string, any>
}

export interface StateContext {
  userId?: string
  sessionId?: string
  workflowId?: string
  componentId?: string
  transactionId?: string
  metadata: Record<string, any>
}

export interface StateSubscription<T = any> {
  id: string
  selector: StateSelector<T>
  callback: StateCallback<T>
  options: SubscriptionOptions
  metadata: SubscriptionMetadata
}

export interface ComputedState<T = any> {
  id: string
  dependencies: string[]
  computeFn: ComputeFunction<T>
  cachedValue?: any
  lastComputed?: Date
  options: ComputedOptions
}

// ============================================================================
// REACTIVE SYSTEM
// ============================================================================

export interface StateSelector<T = any> {
  (state: T): any
}

export interface StateCallback<T = any> {
  (newValue: any, oldValue: any, action: StateAction, context: StateContext): void | Promise<void>
}

export interface ComputeFunction<T = any> {
  (...dependencies: any[]): any
}

export interface StateDiff {
  type: DiffType
  path: string
  oldValue: any
  newValue: any
  operation: DiffOperation
}

export interface StateValidator<T = any> {
  name: string
  validate: (value: T, action: StateAction, context: StateContext) => ValidationResult
  async?: boolean
}

export interface StateMiddleware<T = any> {
  name: string
  priority: number
  before?: (value: T, action: StateAction, context: StateContext) => T | Promise<T>
  after?: (value: T, action: StateAction, context: StateContext) => void | Promise<void>
  error?: (error: Error, value: T, action: StateAction, context: StateContext) => void | Promise<void>
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

// ============================================================================
// TRANSACTION SYSTEM
// ============================================================================

export interface StateTransaction {
  id: string
  states: string[] // state instance IDs
  operations: TransactionOperation[]
  status: TransactionStatus
  startTime: Date
  endTime?: Date
  rollbackData?: Map<string, any>
  isolation: IsolationLevel
  timeout: number
}

export interface TransactionOperation {
  stateId: string
  action: StateAction
  expectedVersion?: number
  optimisticValue?: any
}

export interface TransactionResult {
  success: boolean
  transactionId: string
  operations: OperationResult[]
  errors: TransactionError[]
  duration: number
}

export interface OperationResult {
  stateId: string
  success: boolean
  newVersion: number
  error?: string
}

// ============================================================================
// PERSISTENCE AND SYNCHRONIZATION
// ============================================================================

export interface PersistenceConfig {
  enabled: boolean
  strategy: PersistenceStrategy
  adapter: string
  options: PersistenceOptions
  encryption?: EncryptionConfig
}

export interface PersistenceOptions {
  debounceMs: number
  batchSize: number
  compression: boolean
  versioning: boolean
  retention: RetentionPolicy
}

export interface SynchronizationConfig {
  enabled: boolean
  strategy: SyncStrategy
  conflictResolution: ConflictResolutionStrategy
  peers: PeerConfig[]
  encryption?: EncryptionConfig
}

export interface PeerConfig {
  id: string
  endpoint: string
  priority: number
  authentication: AuthConfig
}

export interface StateSnapshot {
  id: string
  timestamp: Date
  states: Map<string, any>
  metadata: SnapshotMetadata
  checksum: string
}

// ============================================================================
// ENUMS AND TYPES
// ============================================================================

export enum StateStatus {
  INITIALIZING = 'initializing',
  ACTIVE = 'active',
  UPDATING = 'updating',
  SYNCING = 'syncing',
  ERROR = 'error',
  DESTROYED = 'destroyed'
}

export enum TransactionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMMITTING = 'committing',
  COMMITTED = 'committed',
  ROLLING_BACK = 'rolling_back',
  ROLLED_BACK = 'rolled_back',
  FAILED = 'failed'
}

export enum IsolationLevel {
  READ_UNCOMMITTED = 'read_uncommitted',
  READ_COMMITTED = 'read_committed',
  REPEATABLE_READ = 'repeatable_read',
  SERIALIZABLE = 'serializable'
}

export enum PersistenceStrategy {
  NONE = 'none',
  IMMEDIATE = 'immediate',
  DEBOUNCED = 'debounced',
  PERIODIC = 'periodic',
  ON_DEMAND = 'on_demand'
}

export enum SyncStrategy {
  NONE = 'none',
  REAL_TIME = 'real_time',
  PERIODIC = 'periodic',
  ON_CHANGE = 'on_change',
  EVENTUAL = 'eventual'
}

export enum ConflictResolutionStrategy {
  LAST_WRITE_WINS = 'last_write_wins',
  FIRST_WRITE_WINS = 'first_write_wins',
  MERGE = 'merge',
  MANUAL = 'manual'
}

export enum DiffType {
  PRIMITIVE = 'primitive',
  OBJECT = 'object',
  ARRAY = 'array'
}

export enum DiffOperation {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  MOVE = 'move'
}

// ============================================================================
// STATE MANAGER IMPLEMENTATION
// ============================================================================

export class StateManager extends EventEmitter {
  private definitions: Map<string, StateDefinition> = new Map()
  private instances: Map<string, StateInstance> = new Map()
  private transactions: Map<string, StateTransaction> = new Map()
  private snapshots: StateSnapshot[] = []
  private persistenceManager: PersistenceManager
  private syncManager: SynchronizationManager
  private transactionManager: TransactionManager
  private reactivityEngine: ReactivityEngine
  private timeTravel: TimeTravelManager
  
  constructor(config?: StateManagerConfig) {
    super()
    this.persistenceManager = new PersistenceManager(this, config?.persistence)
    this.syncManager = new SynchronizationManager(this, config?.synchronization)
    this.transactionManager = new TransactionManager(this)
    this.reactivityEngine = new ReactivityEngine(this)
    this.timeTravel = new TimeTravelManager(this)
    
    this.setupEventHandlers()
  }

  // ========================================================================
  // STATE DEFINITION MANAGEMENT
  // ========================================================================

  async defineState<T>(definition: StateDefinition<T>): Promise<void> {
    try {
      // Validate definition
      this.validateStateDefinition(definition)
      
      // Check for conflicts
      if (this.definitions.has(definition.id)) {
        console.warn(`State ${definition.id} is already defined, skipping duplicate definition`)
        return
      }

      // Store definition
      this.definitions.set(definition.id, definition)

      // Emit definition event
      await eventBus.publish({
        type: 'state:defined',
        source: 'state-manager',
        payload: { definition },
        priority: EventPriority.NORMAL,
        metadata: {
          tags: ['state', 'definition'],
          namespace: 'state-manager',
          version: '1.0',
          headers: {}
        }
      })

      console.log(`State defined: ${definition.name} (${definition.id})`)

    } catch (error) {
      console.error('Failed to define state:', error)
      throw error
    }
  }

  async undefineState(definitionId: string): Promise<void> {
    const definition = this.definitions.get(definitionId)
    if (!definition) {
      throw new Error(`State definition ${definitionId} not found`)
    }

    // Check for active instances
    const activeInstances = this.getInstancesByDefinition(definitionId)
    if (activeInstances.length > 0) {
      throw new Error(`Cannot undefine state ${definitionId}: has active instances`)
    }

    this.definitions.delete(definitionId)

    await eventBus.publish({
      type: 'state:undefined',
      source: 'state-manager',
      payload: { definitionId, definition },
      priority: EventPriority.NORMAL,
      metadata: {
        tags: ['state', 'undefinition'],
        namespace: 'state-manager',
        version: '1.0',
        headers: {}
      }
    })

    console.log(`State undefined: ${definition.name} (${definitionId})`)
  }

  // ========================================================================
  // STATE INSTANCE MANAGEMENT
  // ========================================================================

  async createState<T>(
    definitionId: string,
    namespace?: string,
    initialValue?: T,
    context?: Partial<StateContext>
  ): Promise<string> {
    const definition = this.definitions.get(definitionId)
    if (!definition) {
      throw new Error(`State definition ${definitionId} not found`)
    }

    const instanceId = uuidv4()
    const stateNamespace = namespace || definition.namespace
    const value = initialValue !== undefined ? initialValue : definition.initialValue

    const instance: StateInstance<T> = {
      id: instanceId,
      definitionId,
      namespace: stateNamespace,
      currentValue: value,
      version: 1,
      history: [{
        version: 1,
        value,
        timestamp: new Date(),
        action: {
          type: 'INITIALIZE',
          payload: value,
          source: 'state-manager',
          timestamp: new Date(),
          userId: context?.userId,
          metadata: context?.metadata || {}
        },
        context: {
          userId: context?.userId,
          sessionId: context?.sessionId,
          workflowId: context?.workflowId,
          componentId: context?.componentId,
          metadata: context?.metadata || {}
        }
      }],
      subscriptions: new Map(),
      computedStates: new Map(),
      status: StateStatus.INITIALIZING,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        tags: [],
        owner: context?.userId || 'system',
        description: ''
      }
    }

    this.instances.set(instanceId, instance)

    try {
      // Validate initial value
      await this.validateState(instance, definition, instance.history[0].action, instance.history[0].context)

      // Setup persistence
      if (definition.persistence.enabled) {
        await this.persistenceManager.setupPersistence(instanceId)
      }

      // Setup reactivity
      if (definition.reactivity.enabled) {
        this.reactivityEngine.setupReactivity(instanceId)
      }

      instance.status = StateStatus.ACTIVE

      // Emit creation event
      await eventBus.publish({
        type: 'state:created',
        source: 'state-manager',
        payload: { instanceId, definitionId, instance },
        priority: EventPriority.NORMAL,
        metadata: {
          tags: ['state', 'creation'],
          namespace: stateNamespace,
          version: '1.0',
          headers: {}
        }
      })

      console.log(`State created: ${stateNamespace}/${instanceId}`)
      return instanceId

    } catch (error) {
      // Cleanup on failure
      this.instances.delete(instanceId)
      console.error('Failed to create state:', error)
      throw error
    }
  }

  async destroyState(instanceId: string): Promise<void> {
    const instance = this.instances.get(instanceId)
    if (!instance) {
      throw new Error(`State instance ${instanceId} not found`)
    }

    try {
      instance.status = StateStatus.DESTROYED

      // Cleanup subscriptions
      for (const subscription of instance.subscriptions.values()) {
        await this.unsubscribe(instanceId, subscription.id)
      }

      // Cleanup persistence
      await this.persistenceManager.cleanup(instanceId)

      // Cleanup reactivity
      this.reactivityEngine.cleanup(instanceId)

      // Remove from registry
      this.instances.delete(instanceId)

      // Emit destruction event
      await eventBus.publish({
        type: 'state:destroyed',
        source: 'state-manager',
        payload: { instanceId, instance },
        priority: EventPriority.NORMAL,
        metadata: {
          tags: ['state', 'destruction'],
          namespace: instance.namespace,
          version: '1.0',
          headers: {}
        }
      })

      console.log(`State destroyed: ${instance.namespace}/${instanceId}`)

    } catch (error) {
      console.error('Failed to destroy state:', error)
      throw error
    }
  }

  // ========================================================================
  // STATE OPERATIONS
  // ========================================================================

  async updateState<T>(
    instanceId: string,
    value: T,
    action: Partial<StateAction>,
    context?: Partial<StateContext>
  ): Promise<void> {
    const instance = this.instances.get(instanceId) as StateInstance<T>
    if (!instance) {
      throw new Error(`State instance ${instanceId} not found`)
    }

    const definition = this.definitions.get(instance.definitionId) as StateDefinition<T>
    if (!definition) {
      throw new Error(`State definition ${instance.definitionId} not found`)
    }

    const fullAction: StateAction = {
      type: action.type || 'UPDATE',
      payload: value,
      source: action.source || 'unknown',
      timestamp: new Date(),
      userId: action.userId || context?.userId,
      metadata: { ...action.metadata, ...context?.metadata }
    }

    const fullContext: StateContext = {
      userId: context?.userId,
      sessionId: context?.sessionId,
      workflowId: context?.workflowId,
      componentId: context?.componentId,
      transactionId: context?.transactionId,
      metadata: context?.metadata || {}
    }

    try {
      instance.status = StateStatus.UPDATING

      // Apply middleware (before)
      let processedValue = value
      for (const middleware of definition.middleware) {
        if (middleware.before) {
          processedValue = await middleware.before(processedValue, fullAction, fullContext)
        }
      }

      // Validate new state
      await this.validateState(instance, definition, fullAction, fullContext)

      // Calculate diff
      const diff = this.calculateDiff(instance.currentValue, processedValue)

      // Update state
      const previousValue = instance.currentValue
      instance.previousValue = previousValue
      instance.currentValue = processedValue
      instance.version++
      instance.updatedAt = new Date()

      // Add to history
      const historyEntry: StateHistoryEntry<T> = {
        version: instance.version,
        value: processedValue,
        timestamp: new Date(),
        action: fullAction,
        context: fullContext,
        diff
      }
      instance.history.push(historyEntry)

      // Persist state
      if (definition.persistence.enabled) {
        await this.persistenceManager.persistState(instanceId, historyEntry)
      }

      // Apply middleware (after)
      for (const middleware of definition.middleware) {
        if (middleware.after) {
          await middleware.after(processedValue, fullAction, fullContext)
        }
      }

      instance.status = StateStatus.ACTIVE

      // Notify reactivity engine
      this.reactivityEngine.notifyChange(instanceId, processedValue, previousValue, fullAction, fullContext)

      // Emit update event
      await eventBus.publish({
        type: 'state:updated',
        source: 'state-manager',
        payload: { 
          instanceId, 
          newValue: processedValue, 
          previousValue, 
          action: fullAction,
          diff
        },
        priority: EventPriority.HIGH,
        metadata: {
          tags: ['state', 'update'],
          namespace: instance.namespace,
          version: '1.0',
          headers: {}
        }
      })

    } catch (error) {
      instance.status = StateStatus.ERROR

      // Apply middleware (error)
      for (const middleware of definition.middleware) {
        if (middleware.error) {
          await middleware.error(error as Error, value, fullAction, fullContext)
        }
      }

      console.error('Failed to update state:', error)
      throw error
    }
  }

  async getState<T>(instanceId: string): Promise<T | undefined> {
    const instance = this.instances.get(instanceId) as StateInstance<T>
    return instance?.currentValue
  }

  async setState<T>(
    instanceId: string,
    selector: StateSelector<T>,
    value: any,
    action?: Partial<StateAction>,
    context?: Partial<StateContext>
  ): Promise<void> {
    const instance = this.instances.get(instanceId) as StateInstance<T>
    if (!instance) {
      throw new Error(`State instance ${instanceId} not found`)
    }

    // Apply selector to get new state
    const newState = this.applySelector(instance.currentValue, selector, value)
    
    await this.updateState(instanceId, newState, action || { type: 'SET' }, context)
  }

  // ========================================================================
  // SUBSCRIPTIONS AND REACTIVITY
  // ========================================================================

  async subscribe<T>(
    instanceId: string,
    selector: StateSelector<T>,
    callback: StateCallback<T>,
    options?: Partial<SubscriptionOptions>
  ): Promise<string> {
    const instance = this.instances.get(instanceId) as StateInstance<T>
    if (!instance) {
      throw new Error(`State instance ${instanceId} not found`)
    }

    const subscriptionId = uuidv4()
    const subscription: StateSubscription<T> = {
      id: subscriptionId,
      selector,
      callback,
      options: {
        immediate: true,
        debounceMs: 0,
        throttleMs: 0,
        deep: true,
        ...options
      },
      metadata: {
        subscribedAt: new Date(),
        triggerCount: 0,
        lastTriggered: undefined
      }
    }

    instance.subscriptions.set(subscriptionId, subscription)

    // Trigger immediate callback if requested
    if (subscription.options.immediate) {
      const currentValue = selector(instance.currentValue)
      await this.triggerCallback(subscription, currentValue, undefined, {
        type: 'INITIAL',
        payload: currentValue,
        source: 'subscription',
        timestamp: new Date(),
        metadata: {}
      }, {
        userId: undefined,
        metadata: {}
      })
    }

    return subscriptionId
  }

  async unsubscribe(instanceId: string, subscriptionId: string): Promise<boolean> {
    const instance = this.instances.get(instanceId)
    if (!instance) {
      return false
    }

    return instance.subscriptions.delete(subscriptionId)
  }

  async computed<T>(
    instanceId: string,
    dependencies: string[],
    computeFn: ComputeFunction<T>,
    options?: Partial<ComputedOptions>
  ): Promise<string> {
    const instance = this.instances.get(instanceId) as StateInstance<T>
    if (!instance) {
      throw new Error(`State instance ${instanceId} not found`)
    }

    const computedId = uuidv4()
    const computed: ComputedState<T> = {
      id: computedId,
      dependencies,
      computeFn,
      options: {
        cache: true,
        lazy: false,
        ...options
      }
    }

    instance.computedStates.set(computedId, computed)

    // Compute initial value if not lazy
    if (!computed.options.lazy) {
      await this.recomputeValue(instanceId, computedId)
    }

    return computedId
  }

  private async recomputeValue(instanceId: string, computedId: string): Promise<void> {
    const instance = this.instances.get(instanceId)
    if (!instance) return

    const computed = instance.computedStates.get(computedId)
    if (!computed) return

    try {
      // Get dependency values
      const dependencyValues = computed.dependencies.map(depInstanceId => {
        const depInstance = this.instances.get(depInstanceId)
        return depInstance?.currentValue
      })

      // Compute new value
      const newValue = computed.computeFn(...dependencyValues)

      // Cache result
      if (computed.options.cache) {
        computed.cachedValue = newValue
        computed.lastComputed = new Date()
      }

    } catch (error) {
      console.error(`Error computing value for ${computedId}:`, error)
    }
  }

  // ========================================================================
  // TRANSACTION MANAGEMENT
  // ========================================================================

  async beginTransaction(
    stateIds: string[],
    isolation: IsolationLevel = IsolationLevel.READ_COMMITTED,
    timeout: number = 30000
  ): Promise<string> {
    return this.transactionManager.beginTransaction(stateIds, isolation, timeout)
  }

  async commitTransaction(transactionId: string): Promise<TransactionResult> {
    return this.transactionManager.commitTransaction(transactionId)
  }

  async rollbackTransaction(transactionId: string): Promise<void> {
    return this.transactionManager.rollbackTransaction(transactionId)
  }

  async transactional<T>(
    stateIds: string[],
    operations: () => Promise<T>,
    isolation: IsolationLevel = IsolationLevel.READ_COMMITTED
  ): Promise<T> {
    const transactionId = await this.beginTransaction(stateIds, isolation)
    
    try {
      const result = await operations()
      await this.commitTransaction(transactionId)
      return result
    } catch (error) {
      await this.rollbackTransaction(transactionId)
      throw error
    }
  }

  // ========================================================================
  // TIME TRAVEL AND DEBUGGING
  // ========================================================================

  async createSnapshot(label?: string): Promise<string> {
    return this.timeTravel.createSnapshot(label)
  }

  async restoreSnapshot(snapshotId: string): Promise<void> {
    return this.timeTravel.restoreSnapshot(snapshotId)
  }

  async revertToVersion(instanceId: string, version: number): Promise<void> {
    return this.timeTravel.revertToVersion(instanceId, version)
  }

  getHistory(instanceId: string): StateHistoryEntry[] {
    const instance = this.instances.get(instanceId)
    return instance?.history || []
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  private validateStateDefinition<T>(definition: StateDefinition<T>): void {
    if (!definition.id || !definition.name || !definition.namespace) {
      throw new Error('State definition must have id, name, and namespace')
    }

    if (definition.initialValue === undefined) {
      throw new Error('State definition must have initial value')
    }
  }

  private async validateState<T>(
    instance: StateInstance<T>,
    definition: StateDefinition<T>,
    action: StateAction,
    context: StateContext
  ): Promise<void> {
    for (const validator of definition.validators) {
      const result = validator.validate(instance.currentValue, action, context)
      
      if (!result.valid) {
        const errors = result.errors.map(e => e.message).join(', ')
        throw new Error(`State validation failed: ${errors}`)
      }
    }
  }

  private calculateDiff(oldValue: any, newValue: any): StateDiff {
    // Simple diff calculation - in production, use a proper diff library
    if (oldValue === newValue) {
      return {
        type: DiffType.PRIMITIVE,
        path: '',
        oldValue,
        newValue,
        operation: DiffOperation.UPDATE
      }
    }

    if (typeof oldValue !== typeof newValue) {
      return {
        type: DiffType.PRIMITIVE,
        path: '',
        oldValue,
        newValue,
        operation: DiffOperation.UPDATE
      }
    }

    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      return {
        type: DiffType.ARRAY,
        path: '',
        oldValue,
        newValue,
        operation: DiffOperation.UPDATE
      }
    }

    if (typeof oldValue === 'object' && typeof newValue === 'object') {
      return {
        type: DiffType.OBJECT,
        path: '',
        oldValue,
        newValue,
        operation: DiffOperation.UPDATE
      }
    }

    return {
      type: DiffType.PRIMITIVE,
      path: '',
      oldValue,
      newValue,
      operation: DiffOperation.UPDATE
    }
  }

  private applySelector<T>(state: T, selector: StateSelector<T>, value: any): T {
    // Simple selector application - in production, use immutability helpers
    if (typeof state === 'object' && state !== null) {
      return { ...state as any, ...value }
    }
    return value
  }

  private async triggerCallback<T>(
    subscription: StateSubscription<T>,
    newValue: any,
    oldValue: any,
    action: StateAction,
    context: StateContext
  ): Promise<void> {
    try {
      await subscription.callback(newValue, oldValue, action, context)
      subscription.metadata.triggerCount++
      subscription.metadata.lastTriggered = new Date()
    } catch (error) {
      console.error(`Error in subscription callback ${subscription.id}:`, error)
    }
  }

  private getInstancesByDefinition(definitionId: string): StateInstance[] {
    return Array.from(this.instances.values()).filter(instance => 
      instance.definitionId === definitionId
    )
  }

  private setupEventHandlers(): void {
    // Listen for workflow events
    eventBus.subscribe('workflow:*', async (event: EventBusEvent) => {
      // Update states involved in workflows
      for (const instance of this.instances.values()) {
        if (instance.metadata.workflowId === event.metadata.workflowId) {
          instance.updatedAt = new Date()
        }
      }
    })

    // Listen for component events
    eventBus.subscribe('component:*', async (event: EventBusEvent) => {
      // Handle component lifecycle changes
      if (event.type === 'component:instance:destroyed') {
        const componentId = event.payload?.instanceId
        if (componentId) {
          // Cleanup states associated with destroyed component
          for (const [instanceId, instance] of this.instances.entries()) {
            if (instance.metadata.componentId === componentId) {
              await this.destroyState(instanceId)
            }
          }
        }
      }
    })
  }

  // ========================================================================
  // PUBLIC API
  // ========================================================================

  getDefinition(definitionId: string): StateDefinition | undefined {
    return this.definitions.get(definitionId)
  }

  getInstance(instanceId: string): StateInstance | undefined {
    return this.instances.get(instanceId)
  }

  getAllDefinitions(): StateDefinition[] {
    return Array.from(this.definitions.values())
  }

  getAllInstances(): StateInstance[] {
    return Array.from(this.instances.values())
  }

  getInstancesByNamespace(namespace: string): StateInstance[] {
    return Array.from(this.instances.values()).filter(instance => 
      instance.namespace === namespace
    )
  }

  getSnapshots(): StateSnapshot[] {
    return [...this.snapshots]
  }

  getActiveTransactions(): StateTransaction[] {
    return Array.from(this.transactions.values()).filter(tx =>
      tx.status === TransactionStatus.ACTIVE || tx.status === TransactionStatus.PENDING
    )
  }
}

// ============================================================================
// SUPPORTING CLASSES
// ============================================================================

class PersistenceManager {
  constructor(
    private stateManager: StateManager,
    private config?: PersistenceConfig
  ) {}

  async setupPersistence(instanceId: string): Promise<void> {
    // Setup persistence for state instance
    console.debug(`Setting up persistence for state ${instanceId}`)
  }

  async persistState(instanceId: string, historyEntry: StateHistoryEntry): Promise<void> {
    // Persist state change
    console.debug(`Persisting state ${instanceId} version ${historyEntry.version}`)
  }

  async cleanup(instanceId: string): Promise<void> {
    // Cleanup persistence data
    console.debug(`Cleaning up persistence for state ${instanceId}`)
  }
}

class SynchronizationManager {
  constructor(
    private stateManager: StateManager,
    private config?: SynchronizationConfig
  ) {}

  async syncState(instanceId: string): Promise<void> {
    // Synchronize state with peers
    console.debug(`Synchronizing state ${instanceId}`)
  }

  async handleConflict(instanceId: string, conflict: StateConflict): Promise<void> {
    // Handle synchronization conflict
    console.debug(`Handling conflict for state ${instanceId}`)
  }
}

class TransactionManager {
  private transactions: Map<string, StateTransaction> = new Map()

  constructor(private stateManager: StateManager) {}

  async beginTransaction(
    stateIds: string[],
    isolation: IsolationLevel,
    timeout: number
  ): Promise<string> {
    const transactionId = uuidv4()
    const transaction: StateTransaction = {
      id: transactionId,
      states: stateIds,
      operations: [],
      status: TransactionStatus.PENDING,
      startTime: new Date(),
      rollbackData: new Map(),
      isolation,
      timeout
    }

    this.transactions.set(transactionId, transaction)
    
    // Set timeout
    setTimeout(() => {
      if (transaction.status === TransactionStatus.PENDING || transaction.status === TransactionStatus.ACTIVE) {
        this.rollbackTransaction(transactionId)
      }
    }, timeout)

    return transactionId
  }

  async commitTransaction(transactionId: string): Promise<TransactionResult> {
    const transaction = this.transactions.get(transactionId)
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`)
    }

    transaction.status = TransactionStatus.COMMITTING

    const results: OperationResult[] = []
    const errors: TransactionError[] = []

    try {
      // Apply all operations
      for (const operation of transaction.operations) {
        try {
          // Apply operation
          const instance = this.stateManager.getInstance(operation.stateId)
          if (instance) {
            await this.stateManager.updateState(
              operation.stateId,
              operation.optimisticValue,
              operation.action
            )
            
            results.push({
              stateId: operation.stateId,
              success: true,
              newVersion: instance.version
            })
          }
        } catch (error) {
          errors.push({
            stateId: operation.stateId,
            error: error instanceof Error ? error.message : 'Unknown error',
            operation: operation.action.type
          })
        }
      }

      if (errors.length === 0) {
        transaction.status = TransactionStatus.COMMITTED
        transaction.endTime = new Date()
      } else {
        await this.rollbackTransaction(transactionId)
        transaction.status = TransactionStatus.FAILED
      }

      return {
        success: errors.length === 0,
        transactionId,
        operations: results,
        errors,
        duration: transaction.endTime!.getTime() - transaction.startTime.getTime()
      }

    } catch (error) {
      transaction.status = TransactionStatus.FAILED
      throw error
    }
  }

  async rollbackTransaction(transactionId: string): Promise<void> {
    const transaction = this.transactions.get(transactionId)
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`)
    }

    transaction.status = TransactionStatus.ROLLING_BACK

    // Restore original values
    for (const [stateId, originalValue] of transaction.rollbackData!) {
      try {
        await this.stateManager.updateState(stateId, originalValue, {
          type: 'ROLLBACK',
          source: 'transaction-manager'
        })
      } catch (error) {
        console.error(`Failed to rollback state ${stateId}:`, error)
      }
    }

    transaction.status = TransactionStatus.ROLLED_BACK
    transaction.endTime = new Date()
  }
}

class ReactivityEngine {
  private watchers: Map<string, Set<string>> = new Map()

  constructor(private stateManager: StateManager) {}

  setupReactivity(instanceId: string): void {
    // Setup reactive watching
    console.debug(`Setting up reactivity for state ${instanceId}`)
  }

  notifyChange(
    instanceId: string,
    newValue: any,
    oldValue: any,
    action: StateAction,
    context: StateContext
  ): void {
    const instance = this.stateManager.getInstance(instanceId)
    if (!instance) return

    // Trigger subscriptions
    for (const subscription of instance.subscriptions.values()) {
      const selectedNew = subscription.selector(newValue)
      const selectedOld = subscription.selector(oldValue)
      
      if (selectedNew !== selectedOld) {
        this.triggerSubscription(subscription, selectedNew, selectedOld, action, context)
      }
    }

    // Recompute computed states
    for (const [computedId] of instance.computedStates) {
      this.recomputeValue(instanceId, computedId)
    }
  }

  private async triggerSubscription<T>(
    subscription: StateSubscription<T>,
    newValue: any,
    oldValue: any,
    action: StateAction,
    context: StateContext
  ): Promise<void> {
    try {
      // Apply debouncing/throttling if configured
      if (subscription.options.debounceMs && subscription.options.debounceMs > 0) {
        // Implement debouncing
        setTimeout(() => {
          subscription.callback(newValue, oldValue, action, context)
        }, subscription.options.debounceMs)
      } else {
        await subscription.callback(newValue, oldValue, action, context)
      }

      subscription.metadata.triggerCount++
      subscription.metadata.lastTriggered = new Date()
    } catch (error) {
      console.error(`Error in subscription ${subscription.id}:`, error)
    }
  }

  private async recomputeValue(instanceId: string, computedId: string): Promise<void> {
    // Recompute computed state value
    console.debug(`Recomputing value for ${computedId}`)
  }

  cleanup(instanceId: string): void {
    this.watchers.delete(instanceId)
  }
}

class TimeTravelManager {
  private snapshots: Map<string, StateSnapshot> = new Map()

  constructor(private stateManager: StateManager) {}

  async createSnapshot(label?: string): Promise<string> {
    const snapshotId = uuidv4()
    const states = new Map<string, any>()

    // Capture current state of all instances
    for (const [instanceId, instance] of this.stateManager.getAllInstances().entries()) {
      states.set(instanceId, structuredClone(instance.currentValue))
    }

    const snapshot: StateSnapshot = {
      id: snapshotId,
      timestamp: new Date(),
      states,
      metadata: {
        label: label || `Snapshot ${snapshotId.substr(0, 8)}`,
        stateCount: states.size,
        creator: 'system'
      },
      checksum: this.calculateChecksum(states)
    }

    this.snapshots.set(snapshotId, snapshot)
    return snapshotId
  }

  async restoreSnapshot(snapshotId: string): Promise<void> {
    const snapshot = this.snapshots.get(snapshotId)
    if (!snapshot) {
      throw new Error(`Snapshot ${snapshotId} not found`)
    }

    // Restore all states
    for (const [instanceId, value] of snapshot.states.entries()) {
      try {
        await this.stateManager.updateState(instanceId, value, {
          type: 'RESTORE_SNAPSHOT',
          source: 'time-travel-manager'
        })
      } catch (error) {
        console.error(`Failed to restore state ${instanceId}:`, error)
      }
    }
  }

  async revertToVersion(instanceId: string, version: number): Promise<void> {
    const instance = this.stateManager.getInstance(instanceId)
    if (!instance) {
      throw new Error(`State instance ${instanceId} not found`)
    }

    const historyEntry = instance.history.find(entry => entry.version === version)
    if (!historyEntry) {
      throw new Error(`Version ${version} not found for state ${instanceId}`)
    }

    await this.stateManager.updateState(instanceId, historyEntry.value, {
      type: 'REVERT_TO_VERSION',
      source: 'time-travel-manager'
    })
  }

  private calculateChecksum(states: Map<string, any>): string {
    // Simple checksum calculation
    const data = JSON.stringify(Array.from(states.entries()))
    return btoa(data).substr(0, 16)
  }
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

interface StateSchema {
  type: string
  properties?: Record<string, any>
  required?: string[]
  additionalProperties?: boolean
}

interface ReactivityConfig {
  enabled: boolean
  debounceMs: number
  batchUpdates: boolean
  deepWatching: boolean
}

interface SecurityConfig {
  encryption: boolean
  accessControl: boolean
  auditLog: boolean
  permissions: string[]
}

interface StateMetadata {
  tags: string[]
  description: string
  author?: string
  version?: string
}

interface StateInstanceMetadata {
  tags: string[]
  owner: string
  description: string
  workflowId?: string
  componentId?: string
}

interface SubscriptionOptions {
  immediate: boolean
  debounceMs: number
  throttleMs: number
  deep: boolean
  once?: boolean
}

interface SubscriptionMetadata {
  subscribedAt: Date
  triggerCount: number
  lastTriggered?: Date
}

interface ComputedOptions {
  cache: boolean
  lazy: boolean
  dependencies?: string[]
}

interface ValidationError {
  field: string
  message: string
  code: string
}

interface ValidationWarning {
  field: string
  message: string
  code: string
}

interface TransactionError {
  stateId: string
  error: string
  operation: string
}

interface RetentionPolicy {
  maxHistory: number
  maxAge: number // days
  compression: boolean
}

interface EncryptionConfig {
  algorithm: string
  keyId: string
  rotationInterval: number
}

interface AuthConfig {
  type: string
  credentials: Record<string, any>
}

interface SnapshotMetadata {
  label: string
  stateCount: number
  creator: string
}

interface StateConflict {
  stateId: string
  localValue: any
  remoteValue: any
  localVersion: number
  remoteVersion: number
}

interface StateManagerConfig {
  persistence?: PersistenceConfig
  synchronization?: SynchronizationConfig
  reactivity?: ReactivityConfig
  timeTravel?: {
    enabled: boolean
    maxSnapshots: number
    autoSnapshot: boolean
  }
}

// Export singleton instance
export const stateManager = new StateManager()
export default stateManager
