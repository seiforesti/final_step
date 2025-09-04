import {
  CollaborationSession,
  CollaborationEvent,
  CollaborationUser,
  CollaborationPermission,
  ConflictResolution,
  WorkflowState,
  ReviewProcess,
  ApprovalChain,
  CommentThread,
  ChangeHistory,
  NotificationPreference,
  ActivityFeed,
  TeamMember,
  CollaborationMetrics,
  RealTimeUpdate,
  DocumentVersion,
  LockStatus,
  AccessControl,
  AuditLog,
  WorkspaceSettings
} from '../types/collaboration.types';

import {
  ScanRule,
  EnhancedScanRuleSet,
  RuleVersion,
  RuleReview
} from '../types/scan-rules.types';

import {
  BusinessRuleContext,
  IntelligentRecommendation
} from '../types/intelligence.types';

/**
 * Advanced Collaboration Utilities for Enterprise Data Governance
 * Provides comprehensive team collaboration features including real-time
 * synchronization, conflict resolution, and workflow management
 */

// =============================================================================
// REAL-TIME COLLABORATION MANAGER
// =============================================================================

export class RealTimeCollaborationManager {
  private readonly apiEndpoint = '/api/v1/collaboration';
  private activeSessions = new Map<string, CollaborationSession>();
  private websocketConnection: WebSocket | null = null;
  private eventHandlers = new Map<string, Function[]>();
  private userPresence = new Map<string, CollaborationUser>();
  private documentLocks = new Map<string, LockStatus>();

  constructor() {
    this.initializeWebSocketConnection();
    this.setupEventHandlers();
  }

  /**
   * Start a collaboration session for rule editing
   */
  async startCollaborationSession(
    ruleId: string,
    userId: string,
    sessionConfig: any = {}
  ): Promise<CollaborationSession> {
    try {
      const sessionRequest = {
        ruleId: ruleId,
        userId: userId,
        sessionType: sessionConfig.type || 'editing',
        permissions: sessionConfig.permissions || ['read', 'write', 'comment'],
        features: {
          realTimeSync: sessionConfig.realTimeSync !== false,
          conflictResolution: sessionConfig.conflictResolution !== false,
          changeTracking: sessionConfig.changeTracking !== false,
          liveComments: sessionConfig.liveComments !== false,
          presenceIndicators: sessionConfig.presenceIndicators !== false
        },
        timeout: sessionConfig.timeout || 3600 // 1 hour
      };

      const response = await fetch(`${this.apiEndpoint}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionRequest)
      });

      if (!response.ok) {
        throw new Error(`Session creation failed: ${response.statusText}`);
      }

      const session: CollaborationSession = await response.json();
      
      // Store session locally
      this.activeSessions.set(session.id, session);
      
      // Join WebSocket room for real-time updates
      this.joinSessionRoom(session.id);
      
      // Initialize user presence
      await this.updateUserPresence(userId, session.id, 'active');

      return session;
    } catch (error) {
      console.error('Collaboration Session Error:', error);
      throw new Error(`Failed to start collaboration session: ${error.message}`);
    }
  }

  /**
   * Join an existing collaboration session
   */
  async joinSession(
    sessionId: string,
    userId: string,
    joinConfig: any = {}
  ): Promise<CollaborationSession> {
    try {
      const joinRequest = {
        sessionId: sessionId,
        userId: userId,
        permissions: joinConfig.permissions || ['read', 'comment'],
        readonly: joinConfig.readonly || false
      };

      const response = await fetch(`${this.apiEndpoint}/sessions/${sessionId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(joinRequest)
      });

      if (!response.ok) {
        throw new Error(`Session join failed: ${response.statusText}`);
      }

      const session: CollaborationSession = await response.json();
      
      // Update local session
      this.activeSessions.set(sessionId, session);
      
      // Join WebSocket room
      this.joinSessionRoom(sessionId);
      
      // Update presence
      await this.updateUserPresence(userId, sessionId, 'active');

      // Notify other participants
      this.broadcastEvent(sessionId, {
        type: 'user-joined',
        userId: userId,
        timestamp: new Date().toISOString(),
        data: { permissions: joinRequest.permissions }
      });

      return session;
    } catch (error) {
      console.error('Session Join Error:', error);
      throw new Error(`Failed to join session: ${error.message}`);
    }
  }

  /**
   * Leave a collaboration session
   */
  async leaveSession(sessionId: string, userId: string): Promise<void> {
    try {
      await fetch(`${this.apiEndpoint}/sessions/${sessionId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      // Clean up local state
      this.activeSessions.delete(sessionId);
      this.userPresence.delete(userId);
      
      // Leave WebSocket room
      this.leaveSessionRoom(sessionId);
      
      // Notify other participants
      this.broadcastEvent(sessionId, {
        type: 'user-left',
        userId: userId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Leave Session Error:', error);
    }
  }

  /**
   * Broadcast real-time changes to all session participants
   */
  async broadcastChange(
    sessionId: string,
    userId: string,
    change: any
  ): Promise<void> {
    try {
      const changeEvent: CollaborationEvent = {
        id: this.generateEventId(),
        type: 'content-change',
        sessionId: sessionId,
        userId: userId,
        timestamp: new Date().toISOString(),
        data: change,
        version: await this.getDocumentVersion(change.documentId)
      };

      // Send to backend for persistence
      await fetch(`${this.apiEndpoint}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changeEvent)
      });

      // Broadcast to other participants
      this.broadcastEvent(sessionId, changeEvent);
    } catch (error) {
      console.error('Broadcast Change Error:', error);
    }
  }

  /**
   * Handle incoming real-time updates
   */
  onRealTimeUpdate(callback: (update: RealTimeUpdate) => void): void {
    this.addEventListener('real-time-update', callback);
  }

  /**
   * Sync changes with other participants
   */
  async syncChanges(
    sessionId: string,
    localChanges: any[],
    lastSyncVersion: number
  ): Promise<any[]> {
    try {
      const syncRequest = {
        sessionId: sessionId,
        localChanges: localChanges,
        lastSyncVersion: lastSyncVersion,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(`${this.apiEndpoint}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(syncRequest)
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }

      const syncResult = await response.json();
      
      // Apply remote changes that don't conflict
      const remoteChanges = syncResult.remoteChanges || [];
      const conflicts = syncResult.conflicts || [];

      // Handle conflicts if any
      if (conflicts.length > 0) {
        await this.handleConflicts(sessionId, conflicts);
      }

      return remoteChanges;
    } catch (error) {
      console.error('Sync Changes Error:', error);
      throw new Error(`Failed to sync changes: ${error.message}`);
    }
  }

  // =============================================================================
  // CONFLICT RESOLUTION
  // =============================================================================

  /**
   * Handle merge conflicts between collaborators
   */
  async handleConflicts(
    sessionId: string,
    conflicts: any[]
  ): Promise<ConflictResolution[]> {
    try {
      const resolutions: ConflictResolution[] = [];

      for (const conflict of conflicts) {
        const resolution = await this.resolveConflict(sessionId, conflict);
        resolutions.push(resolution);
      }

      // Notify participants about conflict resolutions
      this.broadcastEvent(sessionId, {
        type: 'conflicts-resolved',
        userId: 'system',
        timestamp: new Date().toISOString(),
        data: { resolutions }
      });

      return resolutions;
    } catch (error) {
      console.error('Conflict Resolution Error:', error);
      throw new Error(`Failed to resolve conflicts: ${error.message}`);
    }
  }

  /**
   * Resolve individual conflict using intelligent strategies
   */
  async resolveConflict(
    sessionId: string,
    conflict: any
  ): Promise<ConflictResolution> {
    try {
      const resolutionRequest = {
        sessionId: sessionId,
        conflict: conflict,
        strategy: this.selectResolutionStrategy(conflict),
        context: await this.getConflictContext(conflict)
      };

      const response = await fetch(`${this.apiEndpoint}/resolve-conflict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resolutionRequest)
      });

      if (!response.ok) {
        throw new Error(`Conflict resolution failed: ${response.statusText}`);
      }

      const resolution: ConflictResolution = await response.json();
      
      // Log conflict resolution
      await this.logConflictResolution(sessionId, conflict, resolution);

      return resolution;
    } catch (error) {
      console.error('Individual Conflict Resolution Error:', error);
      throw new Error(`Failed to resolve conflict: ${error.message}`);
    }
  }

  /**
   * Get active conflicts in a session
   */
  async getActiveConflicts(sessionId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiEndpoint}/sessions/${sessionId}/conflicts`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch conflicts: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get Conflicts Error:', error);
      return [];
    }
  }

  // =============================================================================
  // DOCUMENT LOCKING AND ACCESS CONTROL
  // =============================================================================

  /**
   * Acquire lock on a document or section
   */
  async acquireLock(
    documentId: string,
    userId: string,
    lockScope: 'document' | 'section' | 'line',
    scopeId?: string
  ): Promise<LockStatus> {
    try {
      const lockRequest = {
        documentId: documentId,
        userId: userId,
        lockScope: lockScope,
        scopeId: scopeId,
        timeout: 300, // 5 minutes
        exclusive: lockScope === 'document'
      };

      const response = await fetch(`${this.apiEndpoint}/locks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lockRequest)
      });

      if (!response.ok) {
        throw new Error(`Lock acquisition failed: ${response.statusText}`);
      }

      const lockStatus: LockStatus = await response.json();
      
      // Store lock locally
      const lockKey = this.generateLockKey(documentId, lockScope, scopeId);
      this.documentLocks.set(lockKey, lockStatus);

      return lockStatus;
    } catch (error) {
      console.error('Lock Acquisition Error:', error);
      throw new Error(`Failed to acquire lock: ${error.message}`);
    }
  }

  /**
   * Release lock on a document or section
   */
  async releaseLock(
    documentId: string,
    userId: string,
    lockScope: 'document' | 'section' | 'line',
    scopeId?: string
  ): Promise<void> {
    try {
      const releaseRequest = {
        documentId: documentId,
        userId: userId,
        lockScope: lockScope,
        scopeId: scopeId
      };

      await fetch(`${this.apiEndpoint}/locks/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(releaseRequest)
      });

      // Remove from local cache
      const lockKey = this.generateLockKey(documentId, lockScope, scopeId);
      this.documentLocks.delete(lockKey);
    } catch (error) {
      console.error('Lock Release Error:', error);
    }
  }

  /**
   * Check if document or section is locked
   */
  async checkLockStatus(
    documentId: string,
    lockScope: 'document' | 'section' | 'line',
    scopeId?: string
  ): Promise<LockStatus | null> {
    try {
      const lockKey = this.generateLockKey(documentId, lockScope, scopeId);
      
      // Check local cache first
      if (this.documentLocks.has(lockKey)) {
        return this.documentLocks.get(lockKey)!;
      }

      // Query backend
      const queryParams = new URLSearchParams({
        documentId,
        lockScope,
        ...(scopeId && { scopeId })
      });

      const response = await fetch(`${this.apiEndpoint}/locks/status?${queryParams}`);
      
      if (!response.ok) {
        return null;
      }

      const lockStatus = await response.json();
      
      // Cache the result
      if (lockStatus) {
        this.documentLocks.set(lockKey, lockStatus);
      }

      return lockStatus;
    } catch (error) {
      console.error('Check Lock Status Error:', error);
      return null;
    }
  }

  // =============================================================================
  // USER PRESENCE AND ACTIVITY
  // =============================================================================

  /**
   * Update user presence in a session
   */
  async updateUserPresence(
    userId: string,
    sessionId: string,
    status: 'active' | 'idle' | 'away' | 'offline'
  ): Promise<void> {
    try {
      const presenceUpdate = {
        userId: userId,
        sessionId: sessionId,
        status: status,
        timestamp: new Date().toISOString(),
        location: await this.getCurrentUserLocation(userId, sessionId)
      };

      await fetch(`${this.apiEndpoint}/presence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(presenceUpdate)
      });

      // Update local presence
      this.userPresence.set(userId, {
        id: userId,
        name: '', // Will be populated from backend
        status: status,
        lastActivity: new Date().toISOString(),
        currentDocument: sessionId
      });

      // Broadcast presence update
      this.broadcastEvent(sessionId, {
        type: 'presence-update',
        userId: userId,
        timestamp: new Date().toISOString(),
        data: { status, location: presenceUpdate.location }
      });
    } catch (error) {
      console.error('Presence Update Error:', error);
    }
  }

  /**
   * Get all active users in a session
   */
  async getActiveUsers(sessionId: string): Promise<CollaborationUser[]> {
    try {
      const response = await fetch(`${this.apiEndpoint}/sessions/${sessionId}/users`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch active users: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get Active Users Error:', error);
      return [];
    }
  }

  /**
   * Track user activity for analytics
   */
  async trackUserActivity(
    userId: string,
    sessionId: string,
    activity: string,
    metadata?: any
  ): Promise<void> {
    try {
      const activityEvent = {
        userId: userId,
        sessionId: sessionId,
        activity: activity,
        metadata: metadata,
        timestamp: new Date().toISOString()
      };

      await fetch(`${this.apiEndpoint}/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityEvent)
      });
    } catch (error) {
      console.error('Activity Tracking Error:', error);
    }
  }

  // =============================================================================
  // NOTIFICATIONS AND ALERTS
  // =============================================================================

  /**
   * Send notification to collaboration participants
   */
  async sendNotification(
    sessionId: string,
    notification: {
      type: string;
      title: string;
      message: string;
      priority: 'low' | 'medium' | 'high' | 'urgent';
      recipients?: string[];
      actionUrl?: string;
    }
  ): Promise<void> {
    try {
      const notificationRequest = {
        sessionId: sessionId,
        ...notification,
        timestamp: new Date().toISOString()
      };

      await fetch(`${this.apiEndpoint}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationRequest)
      });

      // Also broadcast as real-time event
      this.broadcastEvent(sessionId, {
        type: 'notification',
        userId: 'system',
        timestamp: new Date().toISOString(),
        data: notification
      });
    } catch (error) {
      console.error('Send Notification Error:', error);
    }
  }

  /**
   * Subscribe to collaboration notifications
   */
  async subscribeToNotifications(
    userId: string,
    preferences: NotificationPreference
  ): Promise<void> {
    try {
      await fetch(`${this.apiEndpoint}/notifications/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, preferences })
      });
    } catch (error) {
      console.error('Notification Subscription Error:', error);
    }
  }

  // =============================================================================
  // COLLABORATION METRICS AND ANALYTICS
  // =============================================================================

  /**
   * Get collaboration metrics for a session
   */
  async getCollaborationMetrics(
    sessionId: string,
    timeRange?: string
  ): Promise<CollaborationMetrics> {
    try {
      const queryParams = new URLSearchParams();
      if (timeRange) queryParams.set('timeRange', timeRange);

      const response = await fetch(
        `${this.apiEndpoint}/sessions/${sessionId}/metrics?${queryParams}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get Metrics Error:', error);
      throw new Error(`Failed to get collaboration metrics: ${error.message}`);
    }
  }

  /**
   * Generate collaboration report
   */
  async generateCollaborationReport(
    sessionId: string,
    reportType: 'summary' | 'detailed' | 'analytics'
  ): Promise<any> {
    try {
      const response = await fetch(
        `${this.apiEndpoint}/sessions/${sessionId}/report/${reportType}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw new Error(`Report generation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Generate Report Error:', error);
      throw new Error(`Failed to generate report: ${error.message}`);
    }
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  private initializeWebSocketConnection(): void {
    try {
      const wsUrl = `${this.apiEndpoint.replace('http', 'ws')}/ws`;
      this.websocketConnection = new WebSocket(wsUrl);

      this.websocketConnection.onopen = () => {
        console.log('WebSocket connection established');
      };

      this.websocketConnection.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleWebSocketMessage(data);
      };

      this.websocketConnection.onclose = () => {
        console.log('WebSocket connection closed');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.initializeWebSocketConnection(), 5000);
      };

      this.websocketConnection.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('WebSocket initialization failed:', error);
    }
  }

  private setupEventHandlers(): void {
    // Set up default event handlers
    this.addEventListener('user-joined', (event) => {
      console.log(`User ${event.userId} joined session ${event.sessionId}`);
    });

    this.addEventListener('user-left', (event) => {
      console.log(`User ${event.userId} left session ${event.sessionId}`);
    });

    this.addEventListener('content-change', (event) => {
      // Handle real-time content changes
      this.triggerEvent('real-time-update', {
        type: 'content-change',
        data: event.data,
        userId: event.userId,
        timestamp: event.timestamp
      });
    });
  }

  private handleWebSocketMessage(data: any): void {
    try {
      const event: CollaborationEvent = data;
      
      // Trigger appropriate event handlers
      this.triggerEvent(event.type, event);
      
      // Update local state based on event type
      switch (event.type) {
        case 'user-joined':
        case 'user-left':
          this.updateSessionParticipants(event.sessionId, event);
          break;
        case 'content-change':
          this.applyRemoteChange(event);
          break;
        case 'presence-update':
          this.updateUserPresenceFromEvent(event);
          break;
      }
    } catch (error) {
      console.error('WebSocket message handling error:', error);
    }
  }

  private joinSessionRoom(sessionId: string): void {
    if (this.websocketConnection?.readyState === WebSocket.OPEN) {
      this.websocketConnection.send(JSON.stringify({
        action: 'join-room',
        sessionId: sessionId
      }));
    }
  }

  private leaveSessionRoom(sessionId: string): void {
    if (this.websocketConnection?.readyState === WebSocket.OPEN) {
      this.websocketConnection.send(JSON.stringify({
        action: 'leave-room',
        sessionId: sessionId
      }));
    }
  }

  private broadcastEvent(sessionId: string, event: CollaborationEvent): void {
    if (this.websocketConnection?.readyState === WebSocket.OPEN) {
      this.websocketConnection.send(JSON.stringify({
        action: 'broadcast',
        sessionId: sessionId,
        event: event
      }));
    }
  }

  private addEventListener(eventType: string, handler: Function): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  private triggerEvent(eventType: string, eventData: any): void {
    const handlers = this.eventHandlers.get(eventType) || [];
    handlers.forEach(handler => {
      try {
        handler(eventData);
      } catch (error) {
        console.error(`Event handler error for ${eventType}:`, error);
      }
    });
  }

  private selectResolutionStrategy(conflict: any): string {
    // Simple strategy selection logic
    if (conflict.type === 'text-conflict') {
      return 'merge-changes';
    } else if (conflict.type === 'structural-conflict') {
      return 'user-decision';
    }
    return 'latest-wins';
  }

  private async getConflictContext(conflict: any): Promise<any> {
    // Get additional context for conflict resolution
    return {
      documentType: 'scan-rule',
      conflictLocation: conflict.location,
      participants: conflict.participants
    };
  }

  private async logConflictResolution(
    sessionId: string,
    conflict: any,
    resolution: ConflictResolution
  ): Promise<void> {
    // Log conflict resolution for audit and learning
    try {
      await fetch(`${this.apiEndpoint}/audit/conflict-resolution`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          conflict,
          resolution,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Conflict resolution logging failed:', error);
    }
  }

  private async getDocumentVersion(documentId: string): Promise<number> {
    // Get current document version
    try {
      const response = await fetch(`${this.apiEndpoint}/documents/${documentId}/version`);
      if (response.ok) {
        const data = await response.json();
        return data.version;
      }
    } catch (error) {
      console.error('Failed to get document version:', error);
    }
    return 1;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateLockKey(
    documentId: string,
    lockScope: string,
    scopeId?: string
  ): string {
    return `${documentId}_${lockScope}_${scopeId || 'global'}`;
  }

  private async getCurrentUserLocation(
    userId: string,
    sessionId: string
  ): Promise<any> {
    // Get current user location within the document
    return {
      documentId: sessionId,
      line: 0,
      column: 0,
      section: 'main'
    };
  }

  private updateSessionParticipants(sessionId: string, event: CollaborationEvent): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      // Update participant list based on join/leave events
      // Implementation would update the session object
    }
  }

  private applyRemoteChange(event: CollaborationEvent): void {
    // Apply remote changes to local document
    // This would integrate with the document editor
    console.log('Applying remote change:', event.data);
  }

  private updateUserPresenceFromEvent(event: CollaborationEvent): void {
    // Update user presence based on received event
    const presenceData = event.data;
    this.userPresence.set(event.userId, {
      id: event.userId,
      name: presenceData.name || '',
      status: presenceData.status,
      lastActivity: event.timestamp,
      currentDocument: event.sessionId
    });
  }
}

// =============================================================================
// WORKFLOW MANAGEMENT UTILITIES
// =============================================================================

export class WorkflowManager {
  private readonly apiEndpoint = '/api/v1/collaboration/workflows';

  /**
   * Create a new workflow for rule review and approval
   */
  async createWorkflow(
    ruleId: string,
    workflowType: 'review' | 'approval' | 'testing',
    participants: TeamMember[],
    config: any = {}
  ): Promise<WorkflowState> {
    try {
      const workflowRequest = {
        ruleId: ruleId,
        workflowType: workflowType,
        participants: participants,
        stages: config.stages || this.getDefaultStages(workflowType),
        settings: {
          parallelReview: config.parallelReview || false,
          requiredApprovals: config.requiredApprovals || 1,
          autoProgress: config.autoProgress || false,
          timeoutHours: config.timeoutHours || 72
        },
        notifications: config.notifications || {
          onStageChange: true,
          onAssignment: true,
          onDeadline: true
        }
      };

      const response = await fetch(`${this.apiEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowRequest)
      });

      if (!response.ok) {
        throw new Error(`Workflow creation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Workflow Creation Error:', error);
      throw new Error(`Failed to create workflow: ${error.message}`);
    }
  }

  /**
   * Progress workflow to next stage
   */
  async progressWorkflow(
    workflowId: string,
    userId: string,
    decision: 'approve' | 'reject' | 'request-changes',
    comments?: string
  ): Promise<WorkflowState> {
    try {
      const progressRequest = {
        workflowId: workflowId,
        userId: userId,
        decision: decision,
        comments: comments,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(`${this.apiEndpoint}/${workflowId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progressRequest)
      });

      if (!response.ok) {
        throw new Error(`Workflow progress failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Workflow Progress Error:', error);
      throw new Error(`Failed to progress workflow: ${error.message}`);
    }
  }

  private getDefaultStages(workflowType: string): any[] {
    switch (workflowType) {
      case 'review':
        return [
          { name: 'initial-review', type: 'review', required: true },
          { name: 'technical-review', type: 'review', required: true },
          { name: 'final-approval', type: 'approval', required: true }
        ];
      case 'approval':
        return [
          { name: 'manager-approval', type: 'approval', required: true },
          { name: 'compliance-approval', type: 'approval', required: false }
        ];
      case 'testing':
        return [
          { name: 'unit-testing', type: 'testing', required: true },
          { name: 'integration-testing', type: 'testing', required: true },
          { name: 'user-acceptance', type: 'testing', required: false }
        ];
      default:
        return [{ name: 'review', type: 'review', required: true }];
    }
  }
}

// =============================================================================
// COMMENT AND ANNOTATION UTILITIES
// =============================================================================

export class CommentManager {
  private readonly apiEndpoint = '/api/v1/collaboration/comments';

  /**
   * Add comment to a rule or specific line
   */
  async addComment(
    ruleId: string,
    userId: string,
    comment: {
      content: string;
      type: 'general' | 'suggestion' | 'issue' | 'question';
      line?: number;
      section?: string;
      mentions?: string[];
    }
  ): Promise<CommentThread> {
    try {
      const commentRequest = {
        ruleId: ruleId,
        userId: userId,
        ...comment,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(`${this.apiEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentRequest)
      });

      if (!response.ok) {
        throw new Error(`Comment creation failed: ${response.statusText}`);
      }

      const commentThread = await response.json();
      
      // Send notifications to mentioned users
      if (comment.mentions && comment.mentions.length > 0) {
        await this.notifyMentionedUsers(commentThread.id, comment.mentions);
      }

      return commentThread;
    } catch (error) {
      console.error('Add Comment Error:', error);
      throw new Error(`Failed to add comment: ${error.message}`);
    }
  }

  /**
   * Reply to an existing comment thread
   */
  async replyToComment(
    threadId: string,
    userId: string,
    content: string
  ): Promise<CommentThread> {
    try {
      const replyRequest = {
        threadId: threadId,
        userId: userId,
        content: content,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(`${this.apiEndpoint}/${threadId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(replyRequest)
      });

      if (!response.ok) {
        throw new Error(`Reply creation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Reply Comment Error:', error);
      throw new Error(`Failed to reply to comment: ${error.message}`);
    }
  }

  /**
   * Resolve a comment thread
   */
  async resolveComment(threadId: string, userId: string): Promise<void> {
    try {
      await fetch(`${this.apiEndpoint}/${threadId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, timestamp: new Date().toISOString() })
      });
    } catch (error) {
      console.error('Resolve Comment Error:', error);
    }
  }

  private async notifyMentionedUsers(
    commentThreadId: string,
    mentionedUsers: string[]
  ): Promise<void> {
    try {
      await fetch('/api/v1/collaboration/notifications/mentions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentThreadId,
          mentionedUsers,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Mention notification failed:', error);
    }
  }
}

// =============================================================================
// EXPORT UTILITIES AND INSTANCES
// =============================================================================

// Create singleton instances
export const collaborationManager = new RealTimeCollaborationManager();
export const workflowManager = new WorkflowManager();
export const commentManager = new CommentManager();

// Export utility classes
export {
  RealTimeCollaborationManager,
  WorkflowManager,
  CommentManager
};

// Export utility functions
export const CollaborationUtils = {
  /**
   * Format user presence status
   */
  formatPresenceStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'active': '🟢 Active',
      'idle': '🟡 Idle',
      'away': '🔴 Away',
      'offline': '⚫ Offline'
    };
    return statusMap[status] || status;
  },

  /**
   * Calculate collaboration score
   */
  calculateCollaborationScore(metrics: CollaborationMetrics): number {
    const weights = {
      participation: 0.3,
      communication: 0.25,
      resolution: 0.25,
      efficiency: 0.2
    };

    return (
      metrics.participationRate * weights.participation +
      metrics.communicationQuality * weights.communication +
      metrics.conflictResolutionRate * weights.resolution +
      metrics.workflowEfficiency * weights.efficiency
    );
  },

  /**
   * Generate activity summary
   */
  generateActivitySummary(activities: any[]): string {
    const summary = activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(summary)
      .map(([type, count]) => `${count} ${type}${count !== 1 ? 's' : ''}`)
      .join(', ');
  },

  /**
   * Validate collaboration permissions
   */
  validatePermissions(
    userPermissions: CollaborationPermission[],
    requiredPermission: string
  ): boolean {
    return userPermissions.some(p => 
      p.permission === requiredPermission || p.permission === 'admin'
    );
  }
};