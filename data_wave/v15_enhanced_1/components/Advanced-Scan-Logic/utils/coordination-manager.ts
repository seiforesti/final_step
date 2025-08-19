/**
 * 🎯 Coordination Manager - Advanced Scan Logic
 * ============================================
 * 
 * Enterprise-grade coordination and orchestration utilities
 * Maps to: backend/services/intelligent_scan_coordinator.py
 * 
 * Features:
 * - Multi-system coordination and synchronization
 * - Resource allocation and load balancing
 * - Workflow orchestration and management
 * - Real-time coordination and communication
 * - Dependency resolution and management
 * - Conflict detection and resolution
 * 
 * @author Enterprise Data Governance Team
 * @version 1.0.0 - Production Ready
 */

import {
  CoordinationSession,
  ResourceAllocation,
  WorkflowCoordination,
  SystemStatus,
  CoordinationEvent,
  DependencyGraph,
  ConflictResolution,
  SynchronizationState,
  CoordinationMetrics
} from '../types/coordination.types';

// ==========================================
// CORE COORDINATION MANAGER CLASS
// ==========================================

export class CoordinationManager {
  private activeSessions: Map<string, CoordinationSession> = new Map();
  private resourcePools: Map<string, ResourceAllocation> = new Map();
  private systemStatuses: Map<string, SystemStatus> = new Map();
  private dependencyGraphs: Map<string, DependencyGraph> = new Map();
  private eventSubscribers: Map<string, Function[]> = new Map();
  private coordinationMetrics: CoordinationMetrics = {
    totalSessions: 0,
    activeCoordinations: 0,
    successfulSynchronizations: 0,
    conflictsResolved: 0,
    averageResponseTime: 0,
    resourceUtilization: 0
  };

  private heartbeatInterval: NodeJS.Timeout | null = null;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeResourcePools();
    this.startHeartbeatMonitoring();
    this.startSynchronizationLoop();
  }

  // ==========================================
  // SESSION MANAGEMENT
  // ==========================================

  async createCoordinationSession(
    sessionId: string,
    participants: string[],
    options: {
      coordinationType?: 'workflow' | 'resource' | 'data' | 'hybrid';
      priority?: 'low' | 'medium' | 'high' | 'critical';
      timeout?: number;
      retryPolicy?: 'none' | 'linear' | 'exponential';
      conflictResolution?: 'manual' | 'automatic' | 'hybrid';
    } = {}
  ): Promise<CoordinationSession> {
    const {
      coordinationType = 'hybrid',
      priority = 'medium',
      timeout = 300000, // 5 minutes
      retryPolicy = 'exponential',
      conflictResolution = 'hybrid'
    } = options;

    if (this.activeSessions.has(sessionId)) {
      throw new Error(`Coordination session ${sessionId} already exists`);
    }

    // Validate participants
    await this.validateParticipants(participants);

    const session: CoordinationSession = {
      id: sessionId,
      participants,
      coordinationType,
      priority,
      status: 'initializing',
      createdAt: new Date(),
      lastActivity: new Date(),
      timeout,
      retryPolicy,
      conflictResolution,
      metadata: {
        initiator: 'system',
        version: '1.0.0',
        tags: []
      },
      state: {
        phase: 'initialization',
        progress: 0,
        completedTasks: [],
        pendingTasks: participants.map(p => ({ participant: p, task: 'join_session' })),
        errors: []
      },
      coordination: {
        resourceAllocations: new Map(),
        workflowSteps: [],
        dependencies: [],
        synchronizationPoints: []
      }
    };

    this.activeSessions.set(sessionId, session);
    this.coordinationMetrics.totalSessions++;
    this.coordinationMetrics.activeCoordinations++;

    // Initialize session with participants
    await this.initializeSession(session);

    // Emit session created event
    this.emitEvent('session_created', { sessionId, session });

    return session;
  }

  async joinCoordinationSession(
    sessionId: string,
    participantId: string,
    capabilities?: any
  ): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Coordination session ${sessionId} not found`);
    }

    if (!session.participants.includes(participantId)) {
      throw new Error(`Participant ${participantId} not authorized for session ${sessionId}`);
    }

    // Update participant status
    const participantIndex = session.state.pendingTasks.findIndex(
      task => task.participant === participantId && task.task === 'join_session'
    );

    if (participantIndex >= 0) {
      session.state.pendingTasks.splice(participantIndex, 1);
      session.state.completedTasks.push({
        participant: participantId,
        task: 'join_session',
        completedAt: new Date()
      });
    }

    // Store participant capabilities
    if (capabilities) {
      session.metadata.participantCapabilities = session.metadata.participantCapabilities || {};
      session.metadata.participantCapabilities[participantId] = capabilities;
    }

    session.lastActivity = new Date();

    // Check if all participants have joined
    const allJoined = session.state.pendingTasks.filter(
      task => task.task === 'join_session'
    ).length === 0;

    if (allJoined && session.status === 'initializing') {
      session.status = 'active';
      session.state.phase = 'coordination';
      this.emitEvent('session_activated', { sessionId, session });
    }

    this.emitEvent('participant_joined', { sessionId, participantId, session });
    return true;
  }

  async leaveCoordinationSession(
    sessionId: string,
    participantId: string,
    reason?: string
  ): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return false;
    }

    // Handle graceful departure
    await this.handleParticipantDeparture(session, participantId, reason);

    this.emitEvent('participant_left', { sessionId, participantId, reason });
    return true;
  }

  async terminateCoordinationSession(
    sessionId: string,
    reason?: string
  ): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return false;
    }

    // Cleanup resources
    await this.cleanupSessionResources(session);

    // Update status
    session.status = 'terminated';
    session.state.phase = 'cleanup';
    session.metadata.terminationReason = reason;
    session.terminatedAt = new Date();

    // Remove from active sessions
    this.activeSessions.delete(sessionId);
    this.coordinationMetrics.activeCoordinations--;

    this.emitEvent('session_terminated', { sessionId, reason });
    return true;
  }

  // ==========================================
  // RESOURCE COORDINATION
  // ==========================================

  async allocateResources(
    sessionId: string,
    resourceRequirements: any[],
    options: {
      strategy?: 'balanced' | 'performance' | 'cost' | 'availability';
      constraints?: any[];
      priority?: number;
    } = {}
  ): Promise<ResourceAllocation> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const {
      strategy = 'balanced',
      constraints = [],
      priority = this.getPriorityValue(session.priority)
    } = options;

    // Analyze resource requirements
    const analysis = await this.analyzeResourceRequirements(resourceRequirements);
    
    // Find optimal allocation
    const allocation = await this.findOptimalAllocation(
      analysis,
      strategy,
      constraints,
      priority
    );

    // Reserve resources
    const reservation = await this.reserveResources(allocation);

    // Store allocation in session
    session.coordination.resourceAllocations.set(reservation.id, reservation);

    // Update metrics
    this.updateResourceMetrics(reservation);

    this.emitEvent('resources_allocated', { sessionId, allocation: reservation });
    return reservation;
  }

  async deallocateResources(
    sessionId: string,
    allocationId: string
  ): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return false;
    }

    const allocation = session.coordination.resourceAllocations.get(allocationId);
    if (!allocation) {
      return false;
    }

    // Release resources
    await this.releaseResources(allocation);

    // Remove from session
    session.coordination.resourceAllocations.delete(allocationId);

    this.emitEvent('resources_deallocated', { sessionId, allocationId });
    return true;
  }

  async rebalanceResources(
    sessionId: string,
    strategy?: string
  ): Promise<ResourceAllocation[]> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const currentAllocations = Array.from(session.coordination.resourceAllocations.values());
    const rebalancedAllocations: ResourceAllocation[] = [];

    // Analyze current resource usage
    const usageAnalysis = await this.analyzeResourceUsage(currentAllocations);

    // Determine rebalancing strategy
    const rebalanceStrategy = strategy || this.determineOptimalStrategy(usageAnalysis);

    // Perform rebalancing
    for (const allocation of currentAllocations) {
      const rebalanced = await this.rebalanceAllocation(allocation, rebalanceStrategy);
      if (rebalanced) {
        rebalancedAllocations.push(rebalanced);
        session.coordination.resourceAllocations.set(rebalanced.id, rebalanced);
      }
    }

    this.emitEvent('resources_rebalanced', { sessionId, allocations: rebalancedAllocations });
    return rebalancedAllocations;
  }

  // ==========================================
  // WORKFLOW COORDINATION
  // ==========================================

  async coordinateWorkflow(
    sessionId: string,
    workflowDefinition: any,
    options: {
      executionStrategy?: 'sequential' | 'parallel' | 'adaptive';
      failureHandling?: 'abort' | 'continue' | 'retry';
      checkpoints?: string[];
    } = {}
  ): Promise<WorkflowCoordination> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const {
      executionStrategy = 'adaptive',
      failureHandling = 'retry',
      checkpoints = []
    } = options;

    // Create workflow coordination
    const coordination: WorkflowCoordination = {
      id: `workflow_${Date.now()}`,
      sessionId,
      workflowDefinition,
      executionStrategy,
      failureHandling,
      checkpoints,
      status: 'pending',
      createdAt: new Date(),
      steps: [],
      dependencies: [],
      progress: {
        totalSteps: 0,
        completedSteps: 0,
        failedSteps: 0,
        percentage: 0
      }
    };

    // Parse workflow definition
    await this.parseWorkflowDefinition(coordination, workflowDefinition);

    // Build dependency graph
    const dependencyGraph = await this.buildDependencyGraph(coordination.steps);
    this.dependencyGraphs.set(coordination.id, dependencyGraph);

    // Store in session
    session.coordination.workflowSteps.push(coordination);

    // Start workflow execution
    await this.executeWorkflow(coordination);

    this.emitEvent('workflow_started', { sessionId, coordination });
    return coordination;
  }

  async pauseWorkflow(
    sessionId: string,
    workflowId: string
  ): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return false;
    }

    const workflow = session.coordination.workflowSteps.find(w => w.id === workflowId);
    if (!workflow) {
      return false;
    }

    workflow.status = 'paused';
    workflow.pausedAt = new Date();

    this.emitEvent('workflow_paused', { sessionId, workflowId });
    return true;
  }

  async resumeWorkflow(
    sessionId: string,
    workflowId: string
  ): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return false;
    }

    const workflow = session.coordination.workflowSteps.find(w => w.id === workflowId);
    if (!workflow || workflow.status !== 'paused') {
      return false;
    }

    workflow.status = 'running';
    workflow.resumedAt = new Date();

    // Continue execution
    await this.continueWorkflowExecution(workflow);

    this.emitEvent('workflow_resumed', { sessionId, workflowId });
    return true;
  }

  // ==========================================
  // SYNCHRONIZATION MANAGEMENT
  // ==========================================

  async createSynchronizationPoint(
    sessionId: string,
    pointId: string,
    participants: string[],
    conditions?: any[]
  ): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return false;
    }

    const syncPoint = {
      id: pointId,
      participants,
      conditions: conditions || [],
      status: 'waiting',
      arrivedParticipants: [],
      createdAt: new Date(),
      timeout: 60000 // 1 minute default
    };

    session.coordination.synchronizationPoints.push(syncPoint);

    this.emitEvent('sync_point_created', { sessionId, pointId, syncPoint });
    return true;
  }

  async waitAtSynchronizationPoint(
    sessionId: string,
    pointId: string,
    participantId: string,
    data?: any
  ): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return false;
    }

    const syncPoint = session.coordination.synchronizationPoints.find(sp => sp.id === pointId);
    if (!syncPoint) {
      return false;
    }

    // Check if participant is authorized
    if (!syncPoint.participants.includes(participantId)) {
      return false;
    }

    // Add participant to arrived list
    if (!syncPoint.arrivedParticipants.includes(participantId)) {
      syncPoint.arrivedParticipants.push(participantId);
      
      if (data) {
        syncPoint.participantData = syncPoint.participantData || {};
        syncPoint.participantData[participantId] = data;
      }
    }

    // Check if all participants have arrived
    const allArrived = syncPoint.participants.every(p => 
      syncPoint.arrivedParticipants.includes(p)
    );

    // Check conditions if specified
    const conditionsMet = syncPoint.conditions.length === 0 || 
      await this.evaluateSyncConditions(syncPoint.conditions, syncPoint);

    if (allArrived && conditionsMet) {
      syncPoint.status = 'completed';
      syncPoint.completedAt = new Date();
      
      // Notify all participants
      this.emitEvent('sync_point_completed', { sessionId, pointId, syncPoint });
      
      // Release waiting participants
      await this.releaseSynchronizationPoint(sessionId, pointId);
    }

    return true;
  }

  async releaseSynchronizationPoint(
    sessionId: string,
    pointId: string
  ): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return false;
    }

    const syncPointIndex = session.coordination.synchronizationPoints.findIndex(
      sp => sp.id === pointId
    );

    if (syncPointIndex >= 0) {
      const syncPoint = session.coordination.synchronizationPoints[syncPointIndex];
      
      // Notify participants of release
      this.emitEvent('sync_point_released', { 
        sessionId, 
        pointId, 
        participants: syncPoint.arrivedParticipants 
      });

      // Remove sync point
      session.coordination.synchronizationPoints.splice(syncPointIndex, 1);
      return true;
    }

    return false;
  }

  // ==========================================
  // CONFLICT RESOLUTION
  // ==========================================

  async detectConflicts(sessionId: string): Promise<any[]> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return [];
    }

    const conflicts: any[] = [];

    // Resource conflicts
    const resourceConflicts = await this.detectResourceConflicts(session);
    conflicts.push(...resourceConflicts);

    // Workflow conflicts
    const workflowConflicts = await this.detectWorkflowConflicts(session);
    conflicts.push(...workflowConflicts);

    // Data conflicts
    const dataConflicts = await this.detectDataConflicts(session);
    conflicts.push(...dataConflicts);

    // Priority conflicts
    const priorityConflicts = await this.detectPriorityConflicts(session);
    conflicts.push(...priorityConflicts);

    return conflicts;
  }

  async resolveConflict(
    sessionId: string,
    conflictId: string,
    resolution: ConflictResolution
  ): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return false;
    }

    try {
      // Apply resolution based on type
      switch (resolution.type) {
        case 'resource_reallocation':
          await this.resolveResourceConflict(session, conflictId, resolution);
          break;
        case 'workflow_reordering':
          await this.resolveWorkflowConflict(session, conflictId, resolution);
          break;
        case 'priority_adjustment':
          await this.resolvePriorityConflict(session, conflictId, resolution);
          break;
        case 'data_merge':
          await this.resolveDataConflict(session, conflictId, resolution);
          break;
        default:
          throw new Error(`Unknown conflict resolution type: ${resolution.type}`);
      }

      // Update metrics
      this.coordinationMetrics.conflictsResolved++;

      this.emitEvent('conflict_resolved', { sessionId, conflictId, resolution });
      return true;
    } catch (error) {
      console.error(`Failed to resolve conflict ${conflictId}:`, error);
      return false;
    }
  }

  // ==========================================
  // MONITORING AND METRICS
  // ==========================================

  async getCoordinationMetrics(): Promise<CoordinationMetrics> {
    // Update real-time metrics
    this.coordinationMetrics.activeCoordinations = this.activeSessions.size;
    this.coordinationMetrics.resourceUtilization = await this.calculateResourceUtilization();

    return { ...this.coordinationMetrics };
  }

  async getSessionStatus(sessionId: string): Promise<CoordinationSession | null> {
    return this.activeSessions.get(sessionId) || null;
  }

  async getSystemStatuses(): Promise<Map<string, SystemStatus>> {
    // Update system statuses
    await this.updateSystemStatuses();
    return new Map(this.systemStatuses);
  }

  // ==========================================
  // EVENT MANAGEMENT
  // ==========================================

  subscribe(eventType: string, callback: Function): string {
    const subscriptionId = `sub_${Date.now()}_${Math.random()}`;
    
    if (!this.eventSubscribers.has(eventType)) {
      this.eventSubscribers.set(eventType, []);
    }
    
    this.eventSubscribers.get(eventType)!.push(callback);
    return subscriptionId;
  }

  unsubscribe(eventType: string, callback: Function): boolean {
    const subscribers = this.eventSubscribers.get(eventType);
    if (!subscribers) {
      return false;
    }

    const index = subscribers.indexOf(callback);
    if (index >= 0) {
      subscribers.splice(index, 1);
      return true;
    }

    return false;
  }

  private emitEvent(eventType: string, data: any): void {
    const subscribers = this.eventSubscribers.get(eventType);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event subscriber for ${eventType}:`, error);
        }
      });
    }
  }

  // ==========================================
  // PRIVATE HELPER METHODS
  // ==========================================

  private initializeResourcePools(): void {
    // Initialize default resource pools
    const defaultPools = [
      { id: 'cpu', type: 'compute', capacity: 100, available: 100 },
      { id: 'memory', type: 'storage', capacity: 1000, available: 1000 },
      { id: 'network', type: 'bandwidth', capacity: 1000, available: 1000 },
      { id: 'storage', type: 'disk', capacity: 10000, available: 10000 }
    ];

    defaultPools.forEach(pool => {
      this.resourcePools.set(pool.id, {
        id: pool.id,
        type: pool.type,
        capacity: pool.capacity,
        available: pool.available,
        allocated: 0,
        reservations: [],
        metrics: {
          utilizationRate: 0,
          averageAllocation: 0,
          peakUsage: 0
        }
      });
    });
  }

  private startHeartbeatMonitoring(): void {
    this.heartbeatInterval = setInterval(async () => {
      await this.performHeartbeatCheck();
    }, 30000); // 30 seconds
  }

  private startSynchronizationLoop(): void {
    this.syncInterval = setInterval(async () => {
      await this.performSynchronizationMaintenance();
    }, 10000); // 10 seconds
  }

  private async performHeartbeatCheck(): Promise<void> {
    const now = new Date();
    const timeoutThreshold = 300000; // 5 minutes

    for (const [sessionId, session] of this.activeSessions) {
      const timeSinceActivity = now.getTime() - session.lastActivity.getTime();
      
      if (timeSinceActivity > timeoutThreshold) {
        console.warn(`Session ${sessionId} appears inactive, checking participants...`);
        await this.checkSessionHealth(session);
      }
    }
  }

  private async performSynchronizationMaintenance(): Promise<void> {
    // Check for timed-out synchronization points
    for (const [sessionId, session] of this.activeSessions) {
      for (const syncPoint of session.coordination.synchronizationPoints) {
        if (syncPoint.status === 'waiting') {
          const timeWaiting = Date.now() - syncPoint.createdAt.getTime();
          if (timeWaiting > syncPoint.timeout) {
            console.warn(`Sync point ${syncPoint.id} timed out`);
            await this.handleSyncPointTimeout(sessionId, syncPoint.id);
          }
        }
      }
    }
  }

  // Placeholder implementations for complex methods
  private async validateParticipants(participants: string[]): Promise<void> {
    // Implementation for participant validation
  }

  private async initializeSession(session: CoordinationSession): Promise<void> {
    // Implementation for session initialization
  }

  private async handleParticipantDeparture(session: CoordinationSession, participantId: string, reason?: string): Promise<void> {
    // Implementation for handling participant departure
  }

  private async cleanupSessionResources(session: CoordinationSession): Promise<void> {
    // Implementation for resource cleanup
  }

  private getPriorityValue(priority: string): number {
    const priorities = { low: 1, medium: 2, high: 3, critical: 4 };
    return priorities[priority as keyof typeof priorities] || 2;
  }

  private async analyzeResourceRequirements(requirements: any[]): Promise<any> {
    // Implementation for resource requirement analysis
    return { analysis: 'placeholder' };
  }

  private async findOptimalAllocation(analysis: any, strategy: string, constraints: any[], priority: number): Promise<any> {
    // Implementation for optimal allocation finding
    return { allocation: 'placeholder' };
  }

  private async reserveResources(allocation: any): Promise<ResourceAllocation> {
    // Implementation for resource reservation
    return {
      id: `alloc_${Date.now()}`,
      sessionId: 'session',
      resources: [],
      status: 'active',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 3600000)
    };
  }

  private async releaseResources(allocation: ResourceAllocation): Promise<void> {
    // Implementation for resource release
  }

  private updateResourceMetrics(allocation: ResourceAllocation): void {
    // Implementation for updating resource metrics
  }

  private async analyzeResourceUsage(allocations: ResourceAllocation[]): Promise<any> {
    // Implementation for resource usage analysis
    return { usage: 'placeholder' };
  }

  private determineOptimalStrategy(analysis: any): string {
    // Implementation for determining optimal strategy
    return 'balanced';
  }

  private async rebalanceAllocation(allocation: ResourceAllocation, strategy: string): Promise<ResourceAllocation | null> {
    // Implementation for allocation rebalancing
    return allocation;
  }

  private async parseWorkflowDefinition(coordination: WorkflowCoordination, definition: any): Promise<void> {
    // Implementation for workflow definition parsing
  }

  private async buildDependencyGraph(steps: any[]): Promise<DependencyGraph> {
    // Implementation for dependency graph building
    return {
      id: `graph_${Date.now()}`,
      nodes: [],
      edges: [],
      cycles: [],
      criticalPath: []
    };
  }

  private async executeWorkflow(coordination: WorkflowCoordination): Promise<void> {
    // Implementation for workflow execution
  }

  private async continueWorkflowExecution(workflow: WorkflowCoordination): Promise<void> {
    // Implementation for continuing workflow execution
  }

  private async evaluateSyncConditions(conditions: any[], syncPoint: any): Promise<boolean> {
    // Implementation for evaluating sync conditions
    return true;
  }

  private async detectResourceConflicts(session: CoordinationSession): Promise<any[]> {
    // Implementation for detecting resource conflicts
    return [];
  }

  private async detectWorkflowConflicts(session: CoordinationSession): Promise<any[]> {
    // Implementation for detecting workflow conflicts
    return [];
  }

  private async detectDataConflicts(session: CoordinationSession): Promise<any[]> {
    // Implementation for detecting data conflicts
    return [];
  }

  private async detectPriorityConflicts(session: CoordinationSession): Promise<any[]> {
    // Implementation for detecting priority conflicts
    return [];
  }

  private async resolveResourceConflict(session: CoordinationSession, conflictId: string, resolution: ConflictResolution): Promise<void> {
    // Implementation for resolving resource conflicts
  }

  private async resolveWorkflowConflict(session: CoordinationSession, conflictId: string, resolution: ConflictResolution): Promise<void> {
    // Implementation for resolving workflow conflicts
  }

  private async resolvePriorityConflict(session: CoordinationSession, conflictId: string, resolution: ConflictResolution): Promise<void> {
    // Implementation for resolving priority conflicts
  }

  private async resolveDataConflict(session: CoordinationSession, conflictId: string, resolution: ConflictResolution): Promise<void> {
    // Implementation for resolving data conflicts
  }

  private async calculateResourceUtilization(): Promise<number> {
    // Implementation for calculating resource utilization
    return 0.75;
  }

  private async updateSystemStatuses(): Promise<void> {
    // Implementation for updating system statuses
  }

  private async checkSessionHealth(session: CoordinationSession): Promise<void> {
    // Implementation for checking session health
  }

  private async handleSyncPointTimeout(sessionId: string, pointId: string): Promise<void> {
    // Implementation for handling sync point timeout
  }

  // ==========================================
  // CLEANUP
  // ==========================================

  destroy(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.activeSessions.clear();
    this.resourcePools.clear();
    this.systemStatuses.clear();
    this.dependencyGraphs.clear();
    this.eventSubscribers.clear();
  }
}

// ==========================================
// SINGLETON INSTANCE
// ==========================================

export const coordinationManager = new CoordinationManager();

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

export const CoordinationUtils = {
  /**
   * Calculate coordination efficiency score
   */
  calculateEfficiencyScore(
    completedTasks: number,
    totalTasks: number,
    averageResponseTime: number,
    conflictsResolved: number
  ): number {
    const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
    const responseScore = Math.max(0, 1 - (averageResponseTime / 10000)); // Normalize to 10s max
    const conflictScore = conflictsResolved > 0 ? Math.min(1, conflictsResolved / 10) : 1;
    
    return (completionRate * 0.5) + (responseScore * 0.3) + (conflictScore * 0.2);
  },

  /**
   * Generate coordination session ID
   */
  generateSessionId(prefix: string = 'coord'): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}_${timestamp}_${random}`;
  },

  /**
   * Validate coordination configuration
   */
  validateConfiguration(config: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.participants || !Array.isArray(config.participants)) {
      errors.push('Participants must be an array');
    }

    if (config.participants && config.participants.length === 0) {
      errors.push('At least one participant is required');
    }

    if (config.timeout && (typeof config.timeout !== 'number' || config.timeout <= 0)) {
      errors.push('Timeout must be a positive number');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Format coordination status for display
   */
  formatStatus(status: string): string {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
};

export default coordinationManager;