import { EventEmitter } from "../browser-event-emitter";
import { v4 as uuidv4 } from 'uuid'

// ============================================================================
// CORE EVENT INTERFACES
// ============================================================================

export interface EventBusEvent {
  id: string
  type: string
  source: string
  target?: string
  timestamp: Date
  payload: any
  metadata: EventMetadata
  priority: EventPriority
  ttl?: number // time to live in milliseconds
  retry?: RetryPolicy
  correlation?: CorrelationInfo
  causation?: CausationInfo
}

export interface EventMetadata {
  userId?: string
  sessionId?: string
  workflowId?: string
  executionId?: string
  dataSourceId?: number
  tags: string[]
  version: string
  namespace: string
  headers: Record<string, string>
}

export interface EventSubscription {
  id: string
  pattern: string | RegExp
  handler: EventHandler
  options: SubscriptionOptions
  metadata: SubscriptionMetadata
}

export interface EventHandler {
  (event: EventBusEvent, context: EventContext): Promise<EventResult | void>
}

export interface EventContext {
  subscriptionId: string
  retry: number
  originalEvent: EventBusEvent
  sharedState: Map<string, any>
  logger: EventLogger
}

export interface EventResult {
  success: boolean
  data?: any
  error?: string
  nextEvents?: Partial<EventBusEvent>[]
  delay?: number
}

export interface SubscriptionOptions {
  priority: SubscriptionPriority
  maxRetries: number
  retryDelay: number
  timeout: number
  filter?: EventFilter
  transform?: EventTransform
  batchSize?: number
  batchTimeout?: number
  persistent: boolean
  acknowledgeRequired: boolean
}

export interface SubscriptionMetadata {
  subscribedAt: Date
  lastTriggered?: Date
  triggerCount: number
  errorCount: number
  averageProcessingTime: number
  tags: string[]
  owner: string
}

// ============================================================================
// ADVANCED FEATURES
// ============================================================================

export interface EventFilter {
  (event: EventBusEvent): boolean
}

export interface EventTransform {
  (event: EventBusEvent): EventBusEvent
}

export interface EventMiddleware {
  name: string
  priority: number
  before?: (event: EventBusEvent) => Promise<EventBusEvent | null>
  after?: (event: EventBusEvent, result: any) => Promise<void>
  error?: (event: EventBusEvent, error: Error) => Promise<void>
}

export interface EventPattern {
  type?: string | RegExp
  source?: string | RegExp
  target?: string | RegExp
  metadata?: Partial<EventMetadata>
  customMatcher?: (event: EventBusEvent) => boolean
}

export interface EventStore {
  save(event: EventBusEvent): Promise<void>
  find(criteria: EventSearchCriteria): Promise<EventBusEvent[]>
  findById(id: string): Promise<EventBusEvent | null>
  delete(id: string): Promise<void>
  cleanup(olderThan: Date): Promise<number>
}

export interface EventSearchCriteria {
  types?: string[]
  sources?: string[]
  targets?: string[]
  startTime?: Date
  endTime?: Date
  tags?: string[]
  metadata?: Partial<EventMetadata>
  limit?: number
  offset?: number
}

// ============================================================================
// ENUMS AND TYPES
// ============================================================================

export enum EventPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  CRITICAL = 4,
  EMERGENCY = 5
}

export enum SubscriptionPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  CRITICAL = 4
}

export enum EventStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  RETRYING = 'retrying',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

// ============================================================================
// EVENT BUS IMPLEMENTATION
// ============================================================================

export class EventBus extends EventEmitter {
  private subscriptions: Map<string, EventSubscription> = new Map()
  private middleware: EventMiddleware[] = []
  private eventStore?: EventStore
  private processingQueue: Map<EventPriority, EventBusEvent[]> = new Map()
  private isProcessing: boolean = false
  private metricsCollector: EventMetrics = new EventMetrics()
  private deadLetterQueue: EventBusEvent[] = []
  private batchProcessors: Map<string, BatchProcessor> = new Map()

  constructor(config?: EventBusConfig) {
    super()
    // Support many subscribers when underlying emitter supports it (Node.js API)
    const maybeSetMax = (this as unknown as { setMaxListeners?: (n: number) => void }).setMaxListeners
    if (typeof maybeSetMax === 'function') {
      try { maybeSetMax.call(this, 1000) } catch { /* noop for browser shim */ }
    }
    this.initializePriorityQueues()
    this.startProcessingLoop()
    
    if (config?.eventStore) {
      this.eventStore = config.eventStore
    }
    
    if (config?.enableMetrics !== false) {
      this.enableMetricsCollection()
    }
  }

  // ========================================================================
  // CORE PUBLISHING
  // ========================================================================

  async publish(eventData: Partial<EventBusEvent>): Promise<string> {
    const event: EventBusEvent = {
      id: eventData.id || uuidv4(),
      type: eventData.type || 'unknown',
      source: eventData.source || 'unknown',
      target: eventData.target,
      timestamp: new Date(),
      payload: eventData.payload,
      metadata: {
        tags: [],
        version: '1.0',
        namespace: 'default',
        headers: {},
        ...eventData.metadata
      },
      priority: eventData.priority || EventPriority.NORMAL,
      ttl: eventData.ttl,
      retry: eventData.retry,
      correlation: eventData.correlation,
      causation: eventData.causation
    }

    try {
      // Apply middleware - before hooks
      const processedEvent = await this.applyBeforeMiddleware(event)
      if (!processedEvent) {
        console.warn(`Event ${event.id} was filtered out by middleware`)
        return event.id
      }

      // Store event if persistence is enabled
      if (this.eventStore) {
        await this.eventStore.save(processedEvent)
      }

      // Add to priority queue
      this.addToQueue(processedEvent)

      // Update metrics
      this.metricsCollector.recordPublish(processedEvent)

      // Emit for real-time listeners
      this.emit('event:published', processedEvent)

      console.debug(`Event published: ${processedEvent.type} (${processedEvent.id})`)
      return processedEvent.id

    } catch (error) {
      console.error('Failed to publish event:', error)
      this.metricsCollector.recordError(event, error as Error)
      throw error
    }
  }

  async publishBatch(events: Partial<EventBusEvent>[]): Promise<string[]> {
    const publishPromises = events.map(event => this.publish(event))
    return Promise.all(publishPromises)
  }

  // ========================================================================
  // SUBSCRIPTION MANAGEMENT
  // ========================================================================

  subscribe(
    pattern: string | RegExp | EventPattern,
    handler: EventHandler,
    options?: Partial<SubscriptionOptions>
  ): string {
    const subscriptionId = uuidv4()
    
    const subscription: EventSubscription = {
      id: subscriptionId,
      pattern: this.normalizePattern(pattern),
      handler,
      options: {
        priority: SubscriptionPriority.NORMAL,
        maxRetries: 3,
        retryDelay: 1000,
        timeout: 30000,
        persistent: false,
        acknowledgeRequired: false,
        ...options
      },
      metadata: {
        subscribedAt: new Date(),
        triggerCount: 0,
        errorCount: 0,
        averageProcessingTime: 0,
        tags: [],
        owner: 'unknown'
      }
    }

    this.subscriptions.set(subscriptionId, subscription)

    // Setup batch processing if needed
    if (subscription.options.batchSize && subscription.options.batchSize > 1) {
      this.setupBatchProcessor(subscriptionId, subscription)
    }

    this.emit('subscription:created', subscription)
    console.debug(`Subscription created: ${subscriptionId}`)
    
    return subscriptionId
  }

  unsubscribe(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId)
    if (!subscription) {
      return false
    }

    this.subscriptions.delete(subscriptionId)
    
    // Cleanup batch processor
    this.batchProcessors.delete(subscriptionId)

    this.emit('subscription:removed', subscription)
    console.debug(`Subscription removed: ${subscriptionId}`)
    
    return true
  }

  // ========================================================================
  // PATTERN MATCHING
  // ========================================================================

  private matchesPattern(event: EventBusEvent, pattern: string | RegExp): boolean {
    if (typeof pattern === 'string') {
      return this.matchStringPattern(event, pattern)
    } else if (pattern instanceof RegExp) {
      return pattern.test(event.type)
    }
    return false
  }

  private matchStringPattern(event: EventBusEvent, pattern: string): boolean {
    // Support glob-like patterns
    if (pattern === '*') return true
    if (pattern.includes('*')) {
      const regexPattern = pattern
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.')
      return new RegExp(`^${regexPattern}$`).test(event.type)
    }
    return event.type === pattern
  }

  private matchesEventPattern(event: EventBusEvent, pattern: EventPattern): boolean {
    // Type matching
    if (pattern.type) {
      if (typeof pattern.type === 'string') {
        if (!this.matchStringPattern(event, pattern.type)) return false
      } else if (pattern.type instanceof RegExp) {
        if (!pattern.type.test(event.type)) return false
      }
    }

    // Source matching
    if (pattern.source) {
      if (typeof pattern.source === 'string') {
        if (!this.matchStringPattern({ type: event.source } as EventBusEvent, pattern.source)) return false
      } else if (pattern.source instanceof RegExp) {
        if (!pattern.source.test(event.source)) return false
      }
    }

    // Target matching
    if (pattern.target && event.target) {
      if (typeof pattern.target === 'string') {
        if (!this.matchStringPattern({ type: event.target } as EventBusEvent, pattern.target)) return false
      } else if (pattern.target instanceof RegExp) {
        if (!pattern.target.test(event.target)) return false
      }
    }

    // Metadata matching
    if (pattern.metadata) {
      for (const [key, value] of Object.entries(pattern.metadata)) {
        if (event.metadata[key as keyof EventMetadata] !== value) return false
      }
    }

    // Custom matcher
    if (pattern.customMatcher) {
      return pattern.customMatcher(event)
    }

    return true
  }

  // ========================================================================
  // EVENT PROCESSING
  // ========================================================================

  private initializePriorityQueues(): void {
    Object.values(EventPriority).forEach(priority => {
      if (typeof priority === 'number') {
        this.processingQueue.set(priority, [])
      }
    })
  }

  private addToQueue(event: EventBusEvent): void {
    const queue = this.processingQueue.get(event.priority)
    if (queue) {
      queue.push(event)
    }
  }

  private startProcessingLoop(): void {
    setInterval(async () => {
      if (!this.isProcessing) {
        await this.processQueue()
      }
    }, 100) // Process every 100ms

    // Also process immediately when events are published
    this.on('event:published', () => {
      if (!this.isProcessing) {
        // Use setTimeout with 0 delay as browser-compatible alternative to setImmediate
        setTimeout(() => this.processQueue(), 0)
      }
    })
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return
    
    this.isProcessing = true
    try {
      // Process events by priority (highest first)
      const priorities = [
        EventPriority.EMERGENCY,
        EventPriority.CRITICAL,
        EventPriority.HIGH,
        EventPriority.NORMAL,
        EventPriority.LOW
      ]

      for (const priority of priorities) {
        const queue = this.processingQueue.get(priority)
        if (queue && queue.length > 0) {
          const event = queue.shift()!
          await this.processEvent(event)
          break // Process one event per loop to maintain responsiveness
        }
      }
    } finally {
      this.isProcessing = false
    }
  }

  private async processEvent(event: EventBusEvent): Promise<void> {
    try {
      // Check TTL
      if (event.ttl && Date.now() - event.timestamp.getTime() > event.ttl) {
        console.warn(`Event ${event.id} expired, moving to dead letter queue`)
        this.deadLetterQueue.push(event)
        return
      }

      // Find matching subscriptions
      const matchingSubscriptions = this.findMatchingSubscriptions(event)
      
      if (matchingSubscriptions.length === 0) {
        console.debug(`No subscriptions found for event: ${event.type}`)
        return
      }

      // Sort by priority
      matchingSubscriptions.sort((a, b) => b.options.priority - a.options.priority)

      // Process subscriptions
      const processingPromises = matchingSubscriptions.map(subscription => 
        this.processSubscription(event, subscription)
      )

      await Promise.allSettled(processingPromises)

      // Apply after middleware
      await this.applyAfterMiddleware(event, null)

    } catch (error) {
      console.error(`Error processing event ${event.id}:`, error)
      await this.applyErrorMiddleware(event, error as Error)
      this.metricsCollector.recordError(event, error as Error)
    }
  }

  private findMatchingSubscriptions(event: EventBusEvent): EventSubscription[] {
    const matching: EventSubscription[] = []

    for (const subscription of this.subscriptions.values()) {
      try {
        let matches = false

        if (typeof subscription.pattern === 'object' && 'type' in subscription.pattern) {
          // EventPattern
          matches = this.matchesEventPattern(event, subscription.pattern as EventPattern)
        } else {
          // String or RegExp pattern
          matches = this.matchesPattern(event, subscription.pattern as string | RegExp)
        }

        if (matches) {
          // Apply filter if present
          if (subscription.options.filter && !subscription.options.filter(event)) {
            continue
          }

          matching.push(subscription)
        }
      } catch (error) {
        console.error(`Error matching subscription ${subscription.id}:`, error)
      }
    }

    return matching
  }

  private async processSubscription(
    event: EventBusEvent,
    subscription: EventSubscription
  ): Promise<void> {
    const startTime = Date.now()

    try {
      // Apply transform if present
      let processedEvent = event
      if (subscription.options.transform) {
        processedEvent = subscription.options.transform(event)
      }

      // Batch processing
      if (subscription.options.batchSize && subscription.options.batchSize > 1) {
        await this.addToBatch(subscription.id, processedEvent)
        return
      }

      // Single event processing
      await this.executeHandler(processedEvent, subscription, 0)

      // Update metrics
      const duration = Date.now() - startTime
      this.updateSubscriptionMetrics(subscription, duration, false)

    } catch (error) {
      console.error(`Error in subscription ${subscription.id}:`, error)
      this.updateSubscriptionMetrics(subscription, Date.now() - startTime, true)
      
      // Retry logic
      if (subscription.options.maxRetries > 0) {
        await this.retryHandler(event, subscription, error as Error, 1)
      }
    }
  }

  private async executeHandler(
    event: EventBusEvent,
    subscription: EventSubscription,
    retryCount: number
  ): Promise<void> {
    const context: EventContext = {
      subscriptionId: subscription.id,
      retry: retryCount,
      originalEvent: event,
      sharedState: new Map(),
      logger: new EventLogger(subscription.id, event.id)
    }

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Handler timeout')), subscription.options.timeout)
    })

    const handlerPromise = subscription.handler(event, context)

    const result = await Promise.race([handlerPromise, timeoutPromise]) as EventResult | void

    // Handle result
    if (result && result.nextEvents) {
      for (const nextEvent of result.nextEvents) {
        if (result.delay) {
          setTimeout(() => this.publish(nextEvent), result.delay)
        } else {
          await this.publish(nextEvent)
        }
      }
    }

    subscription.metadata.lastTriggered = new Date()
    subscription.metadata.triggerCount++
  }

  // ========================================================================
  // MIDDLEWARE SYSTEM
  // ========================================================================

  addMiddleware(middleware: EventMiddleware): void {
    this.middleware.push(middleware)
    this.middleware.sort((a, b) => b.priority - a.priority)
  }

  removeMiddleware(name: string): boolean {
    const index = this.middleware.findIndex(m => m.name === name)
    if (index !== -1) {
      this.middleware.splice(index, 1)
      return true
    }
    return false
  }

  private async applyBeforeMiddleware(event: EventBusEvent): Promise<EventBusEvent | null> {
    let processedEvent = event
    
    for (const middleware of this.middleware) {
      if (middleware.before) {
        try {
          const result = await middleware.before(processedEvent)
          if (result === null) {
            return null // Event filtered out
          }
          processedEvent = result
        } catch (error) {
          console.error(`Error in middleware ${middleware.name}:`, error)
        }
      }
    }
    
    return processedEvent
  }

  private async applyAfterMiddleware(event: EventBusEvent, result: any): Promise<void> {
    for (const middleware of this.middleware) {
      if (middleware.after) {
        try {
          await middleware.after(event, result)
        } catch (error) {
          console.error(`Error in after middleware ${middleware.name}:`, error)
        }
      }
    }
  }

  private async applyErrorMiddleware(event: EventBusEvent, error: Error): Promise<void> {
    for (const middleware of this.middleware) {
      if (middleware.error) {
        try {
          await middleware.error(event, error)
        } catch (middlewareError) {
          console.error(`Error in error middleware ${middleware.name}:`, middlewareError)
        }
      }
    }
  }

  // ========================================================================
  // BATCH PROCESSING
  // ========================================================================

  private setupBatchProcessor(subscriptionId: string, subscription: EventSubscription): void {
    const processor = new BatchProcessor(subscription, this)
    this.batchProcessors.set(subscriptionId, processor)
  }

  private async addToBatch(subscriptionId: string, event: EventBusEvent): Promise<void> {
    const processor = this.batchProcessors.get(subscriptionId)
    if (processor) {
      await processor.addEvent(event)
    }
  }

  // ========================================================================
  // RETRY LOGIC
  // ========================================================================

  private async retryHandler(
    event: EventBusEvent,
    subscription: EventSubscription,
    error: Error,
    retryCount: number
  ): Promise<void> {
    if (retryCount > subscription.options.maxRetries) {
      console.error(`Max retries exceeded for subscription ${subscription.id}`)
      this.deadLetterQueue.push(event)
      return
    }

    const delay = subscription.options.retryDelay * Math.pow(2, retryCount - 1) // Exponential backoff
    
    setTimeout(async () => {
      try {
        await this.executeHandler(event, subscription, retryCount)
      } catch (retryError) {
        await this.retryHandler(event, subscription, retryError as Error, retryCount + 1)
      }
    }, delay)
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  private normalizePattern(pattern: string | RegExp | EventPattern): string | RegExp {
    if (typeof pattern === 'object' && 'type' in pattern) {
      return pattern as any // EventPattern
    }
    return pattern as string | RegExp
  }

  private updateSubscriptionMetrics(
    subscription: EventSubscription,
    duration: number,
    isError: boolean
  ): void {
    const metadata = subscription.metadata
    
    if (isError) {
      metadata.errorCount++
    }
    
    // Update average processing time
    const totalTime = metadata.averageProcessingTime * metadata.triggerCount + duration
    metadata.averageProcessingTime = totalTime / (metadata.triggerCount + 1)
  }

  private enableMetricsCollection(): void {
    setInterval(() => {
      this.metricsCollector.collectMetrics(this)
    }, 60000) // Collect metrics every minute
  }

  // ========================================================================
  // PUBLIC API
  // ========================================================================

  getSubscription(subscriptionId: string): EventSubscription | undefined {
    return this.subscriptions.get(subscriptionId)
  }

  getAllSubscriptions(): EventSubscription[] {
    return Array.from(this.subscriptions.values())
  }

  getMetrics(): EventBusMetrics {
    return this.metricsCollector.getMetrics()
  }

  getDeadLetterQueue(): EventBusEvent[] {
    return [...this.deadLetterQueue]
  }

  clearDeadLetterQueue(): void {
    this.deadLetterQueue.length = 0
  }

  async replay(eventId: string): Promise<boolean> {
    if (!this.eventStore) {
      throw new Error('Event store not configured')
    }

    const event = await this.eventStore.findById(eventId)
    if (!event) {
      return false
    }

    await this.processEvent(event)
    return true
  }

  async searchEvents(criteria: EventSearchCriteria): Promise<EventBusEvent[]> {
    if (!this.eventStore) {
      throw new Error('Event store not configured')
    }

    return this.eventStore.find(criteria)
  }
}

// ============================================================================
// BATCH PROCESSOR
// ============================================================================

class BatchProcessor {
  private events: EventBusEvent[] = []
  private timer?: NodeJS.Timeout

  constructor(
    private subscription: EventSubscription,
    private eventBus: EventBus
  ) {}

  async addEvent(event: EventBusEvent): Promise<void> {
    this.events.push(event)

    // Check if batch is ready
    if (this.events.length >= (this.subscription.options.batchSize || 1)) {
      await this.processBatch()
    } else if (!this.timer && this.subscription.options.batchTimeout) {
      // Start timeout timer
      this.timer = setTimeout(() => {
        this.processBatch()
      }, this.subscription.options.batchTimeout)
    }
  }

  private async processBatch(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = undefined
    }

    if (this.events.length === 0) return

    const batchEvents = [...this.events]
    this.events.length = 0

    const context: EventContext = {
      subscriptionId: this.subscription.id,
      retry: 0,
      originalEvent: batchEvents[0],
      sharedState: new Map(),
      logger: new EventLogger(this.subscription.id, 'batch')
    }

    try {
      // Create a batch event
      const batchEvent: EventBusEvent = {
        id: uuidv4(),
        type: 'batch',
        source: 'event-bus',
        timestamp: new Date(),
        payload: batchEvents,
        metadata: {
          tags: ['batch'],
          version: '1.0',
          namespace: 'default',
          headers: {}
        },
        priority: EventPriority.NORMAL
      }

      await this.subscription.handler(batchEvent, context)
    } catch (error) {
      console.error(`Error processing batch for subscription ${this.subscription.id}:`, error)
    }
  }
}

// ============================================================================
// METRICS COLLECTION
// ============================================================================

class EventMetrics {
  private metrics: EventBusMetrics = {
    eventsPublished: 0,
    eventsProcessed: 0,
    eventsFailed: 0,
    averageProcessingTime: 0,
    subscriptionsActive: 0,
    queueSize: 0,
    deadLetterQueueSize: 0,
    lastUpdated: new Date()
  }

  recordPublish(event: EventBusEvent): void {
    this.metrics.eventsPublished++
  }

  recordError(event: EventBusEvent, error: Error): void {
    this.metrics.eventsFailed++
  }

  collectMetrics(eventBus: any): void {
    this.metrics.subscriptionsActive = eventBus.subscriptions.size
    this.metrics.queueSize = Array.from(eventBus.processingQueue.values())
      .reduce((total, queue) => total + queue.length, 0)
    this.metrics.deadLetterQueueSize = eventBus.deadLetterQueue.length
    this.metrics.lastUpdated = new Date()
  }

  getMetrics(): EventBusMetrics {
    return { ...this.metrics }
  }
}

// ============================================================================
// EVENT LOGGER
// ============================================================================

class EventLogger {
  constructor(
    private subscriptionId: string,
    private eventId: string
  ) {}

  info(message: string, data?: any): void {
    console.log(`[${this.subscriptionId}:${this.eventId}] INFO: ${message}`, data)
  }

  warn(message: string, data?: any): void {
    console.warn(`[${this.subscriptionId}:${this.eventId}] WARN: ${message}`, data)
  }

  error(message: string, data?: any): void {
    console.error(`[${this.subscriptionId}:${this.eventId}] ERROR: ${message}`, data)
  }

  debug(message: string, data?: any): void {
    console.debug(`[${this.subscriptionId}:${this.eventId}] DEBUG: ${message}`, data)
  }
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

interface EventBusConfig {
  eventStore?: EventStore
  enableMetrics?: boolean
  maxQueueSize?: number
  processingInterval?: number
}

interface EventBusMetrics {
  eventsPublished: number
  eventsProcessed: number
  eventsFailed: number
  averageProcessingTime: number
  subscriptionsActive: number
  queueSize: number
  deadLetterQueueSize: number
  lastUpdated: Date
}

interface RetryPolicy {
  maxAttempts: number
  delayMs: number
  backoffMultiplier: number
}

interface CorrelationInfo {
  id: string
  context: Record<string, any>
}

interface CausationInfo {
  eventId: string
  causedBy: string
}

// Export singleton instance
export const eventBus = new EventBus()
export default eventBus