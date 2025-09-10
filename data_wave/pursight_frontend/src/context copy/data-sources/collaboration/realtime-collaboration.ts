import { EventEmitter } from "../browser-event-emitter";
import { v4 as uuidv4 } from 'uuid'
import { eventBus, EventBusEvent, EventPriority } from '../core/event-bus'
import { stateManager } from '../core/state-manager'

// ============================================================================
// CORE COLLABORATION INTERFACES
// ============================================================================

export interface CollaborationSession {
  id: string
  name: string
  description: string
  type: SessionType
  status: SessionStatus
  createdBy: string
  createdAt: Date
  lastActivity: Date
  participants: Participant[]
  document: CollaborativeDocument
  workspace: CollaborativeWorkspace
  permissions: SessionPermissions
  settings: SessionSettings
  metadata: SessionMetadata
}

export interface Participant {
  id: string
  userId: string
  sessionId: string
  name: string
  avatar?: string
  role: ParticipantRole
  status: ParticipantStatus
  permissions: ParticipantPermissions
  presence: PresenceInfo
  activity: ActivityInfo
  joinedAt: Date
  lastActiveAt: Date
  connection: ConnectionInfo
}

export interface CollaborativeDocument {
  id: string
  sessionId: string
  type: DocumentType
  title: string
  content: DocumentContent
  version: number
  revisions: Revision[]
  operations: Operation[]
  locks: DocumentLock[]
  comments: Comment[]
  annotations: Annotation[]
  metadata: DocumentMetadata
}

export interface CollaborativeWorkspace {
  id: string
  sessionId: string
  layout: WorkspaceLayout
  components: WorkspaceComponent[]
  views: WorkspaceView[]
  tools: CollaborationTool[]
  state: WorkspaceState
  sync: SyncConfiguration
}

export interface Operation {
  id: string
  type: OperationType
  userId: string
  timestamp: Date
  position: DocumentPosition
  content: any
  metadata: OperationMetadata
  state: OperationState
  conflicts: Conflict[]
  resolution: ConflictResolution
}

export interface Conflict {
  id: string
  type: ConflictType
  operations: string[] // operation IDs
  participants: string[] // user IDs
  severity: ConflictSeverity
  autoResolvable: boolean
  resolution: ConflictResolution
  timestamp: Date
}

export interface PresenceInfo {
  isOnline: boolean
  lastSeen: Date
  cursor: CursorPosition
  selection: SelectionRange
  viewport: ViewportInfo
  activity: ActivityType
  focus: FocusInfo
  device: DeviceInfo
}

// ============================================================================
// REAL-TIME SYNCHRONIZATION
// ============================================================================

export interface SyncConfiguration {
  strategy: SyncStrategy
  frequency: number
  conflictResolution: ConflictResolutionStrategy
  persistence: PersistenceConfig
  optimization: SyncOptimization
  backup: BackupConfig
}

export interface Revision {
  id: string
  documentId: string
  version: number
  userId: string
  timestamp: Date
  operations: string[] // operation IDs
  checkpoint: boolean
  description?: string
  metadata: RevisionMetadata
}

export interface DocumentLock {
  id: string
  userId: string
  section: DocumentSection
  type: LockType
  acquired: Date
  expires?: Date
  exclusive: boolean
  metadata: LockMetadata
}

export interface Comment {
  id: string
  userId: string
  content: string
  position: DocumentPosition
  thread: CommentThread
  reactions: Reaction[]
  resolved: boolean
  timestamp: Date
  metadata: CommentMetadata
}

export interface Annotation {
  id: string
  type: AnnotationType
  userId: string
  position: DocumentPosition
  content: AnnotationContent
  visibility: AnnotationVisibility
  timestamp: Date
  metadata: AnnotationMetadata
}

// ============================================================================
// ENUMS AND TYPES
// ============================================================================

export enum SessionType {
  DOCUMENT_EDITING = 'document_editing',
  WORKFLOW_DESIGN = 'workflow_design',
  DATA_MODELING = 'data_modeling',
  CODE_REVIEW = 'code_review',
  MEETING = 'meeting',
  PRESENTATION = 'presentation',
  BRAINSTORMING = 'brainstorming',
  PLANNING = 'planning'
}

export enum SessionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  ENDED = 'ended',
  ARCHIVED = 'archived'
}

export enum ParticipantRole {
  OWNER = 'owner',
  EDITOR = 'editor',
  VIEWER = 'viewer',
  COMMENTER = 'commenter',
  REVIEWER = 'reviewer',
  GUEST = 'guest'
}

export enum ParticipantStatus {
  ACTIVE = 'active',
  IDLE = 'idle',
  AWAY = 'away',
  OFFLINE = 'offline',
  BUSY = 'busy'
}

export enum DocumentType {
  TEXT = 'text',
  WORKFLOW = 'workflow',
  DIAGRAM = 'diagram',
  SPREADSHEET = 'spreadsheet',
  PRESENTATION = 'presentation',
  CODE = 'code',
  CONFIGURATION = 'configuration'
}

export enum OperationType {
  INSERT = 'insert',
  DELETE = 'delete',
  REPLACE = 'replace',
  MOVE = 'move',
  FORMAT = 'format',
  ANNOTATION = 'annotation',
  COMMENT = 'comment',
  LOCK = 'lock',
  UNLOCK = 'unlock'
}

export enum ConflictType {
  CONCURRENT_EDIT = 'concurrent_edit',
  LOCK_CONFLICT = 'lock_conflict',
  VERSION_MISMATCH = 'version_mismatch',
  PERMISSION_CONFLICT = 'permission_conflict',
  STRUCTURAL_CONFLICT = 'structural_conflict'
}

export enum ConflictSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ActivityType {
  TYPING = 'typing',
  SELECTING = 'selecting',
  SCROLLING = 'scrolling',
  COMMENTING = 'commenting',
  REVIEWING = 'reviewing',
  IDLE = 'idle'
}

export enum SyncStrategy {
  REAL_TIME = 'real_time',
  PERIODIC = 'periodic',
  ON_CHANGE = 'on_change',
  MANUAL = 'manual'
}

export enum ConflictResolutionStrategy {
  LAST_WRITER_WINS = 'last_writer_wins',
  FIRST_WRITER_WINS = 'first_writer_wins',
  MERGE = 'merge',
  MANUAL = 'manual',
  COLLABORATIVE = 'collaborative'
}

export enum LockType {
  READ = 'read',
  WRITE = 'write',
  EXCLUSIVE = 'exclusive',
  SECTION = 'section'
}

export enum AnnotationType {
  HIGHLIGHT = 'highlight',
  NOTE = 'note',
  SUGGESTION = 'suggestion',
  QUESTION = 'question',
  WARNING = 'warning',
  ERROR = 'error'
}

// ============================================================================
// REAL-TIME COLLABORATION MANAGER
// ============================================================================

export class RealTimeCollaborationManager extends EventEmitter {
  private sessions: Map<string, CollaborationSession> = new Map()
  private participants: Map<string, Participant> = new Map()
  private operations: Map<string, Operation> = new Map()
  private conflicts: Map<string, Conflict> = new Map()
  private connectionManager: ConnectionManager
  private conflictResolver: ConflictResolver
  private presenceManager: PresenceManager
  private operationalTransform: OperationalTransform
  private documentSyncer: DocumentSyncer
  private permissionManager: PermissionManager

  constructor() {
    super()
    this.connectionManager = new ConnectionManager(this)
    this.conflictResolver = new ConflictResolver(this)
    this.presenceManager = new PresenceManager(this)
    this.operationalTransform = new OperationalTransform()
    this.documentSyncer = new DocumentSyncer(this)
    this.permissionManager = new PermissionManager()
    
    this.setupEventHandlers()
    this.startHeartbeat()
  }

  // ========================================================================
  // SESSION MANAGEMENT
  // ========================================================================

  async createSession(
    name: string,
    description: string,
    type: SessionType,
    createdBy: string,
    settings?: Partial<SessionSettings>
  ): Promise<string> {
    try {
      const sessionId = uuidv4()
      
      const session: CollaborationSession = {
        id: sessionId,
        name,
        description,
        type,
        status: SessionStatus.ACTIVE,
        createdBy,
        createdAt: new Date(),
        lastActivity: new Date(),
        participants: [],
        document: this.createDocument(sessionId, type),
        workspace: this.createWorkspace(sessionId),
        permissions: this.createDefaultPermissions(),
        settings: {
          maxParticipants: 50,
          allowGuests: true,
          autoSave: true,
          autoSaveInterval: 30000,
          trackChanges: true,
          enableComments: true,
          enableAnnotations: true,
          conflictResolution: ConflictResolutionStrategy.MERGE,
          syncStrategy: SyncStrategy.REAL_TIME,
          ...settings
        },
        metadata: {
          tags: [],
          category: 'collaboration',
          priority: 'normal'
        }
      }

      this.sessions.set(sessionId, session)

      // Emit session creation event
      await eventBus.publish({
        type: 'collaboration:session:created',
        source: 'collaboration-manager',
        payload: { session },
        priority: EventPriority.NORMAL,
        metadata: {
          tags: ['collaboration', 'session'],
          namespace: 'collaboration',
          version: '1.0',
          headers: {}
        }
      })

      console.log(`Collaboration session created: ${name} (${sessionId})`)
      return sessionId

    } catch (error) {
      console.error('Failed to create collaboration session:', error)
      throw error
    }
  }

  async joinSession(sessionId: string, userId: string, role?: ParticipantRole): Promise<Participant> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    if (session.status !== SessionStatus.ACTIVE) {
      throw new Error(`Cannot join session in status: ${session.status}`)
    }

    // Check if user is already in session
    let participant = session.participants.find(p => p.userId === userId)
    if (participant) {
      // Update existing participant
      participant.status = ParticipantStatus.ACTIVE
      participant.lastActiveAt = new Date()
      participant.presence.isOnline = true
    } else {
      // Create new participant
      const participantId = uuidv4()
      participant = {
        id: participantId,
        userId,
        sessionId,
        name: await this.getUserName(userId),
        role: role || ParticipantRole.EDITOR,
        status: ParticipantStatus.ACTIVE,
        permissions: await this.permissionManager.getParticipantPermissions(role || ParticipantRole.EDITOR),
        presence: {
          isOnline: true,
          lastSeen: new Date(),
          cursor: { line: 0, column: 0 },
          selection: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
          viewport: { top: 0, left: 0, width: 0, height: 0 },
          activity: ActivityType.IDLE,
          focus: { elementId: '', type: 'document' },
          device: { type: 'desktop', browser: 'unknown', os: 'unknown' }
        },
        activity: {
          operationsCount: 0,
          lastOperation: new Date(),
          sessionDuration: 0
        },
        joinedAt: new Date(),
        lastActiveAt: new Date(),
        connection: {
          id: uuidv4(),
          status: 'connected',
          quality: 'good',
          latency: 0
        }
      }

      session.participants.push(participant)
      this.participants.set(participantId, participant)
    }

    session.lastActivity = new Date()

    // Start presence tracking
    await this.presenceManager.startTracking(participant.id)

    // Emit join event
    await eventBus.publish({
      type: 'collaboration:participant:joined',
      source: 'collaboration-manager',
      payload: { sessionId, participant },
      priority: EventPriority.NORMAL,
      metadata: {
        tags: ['collaboration', 'participant'],
        namespace: 'collaboration',
        version: '1.0',
        headers: {}
      }
    })

    console.log(`User ${userId} joined session ${sessionId}`)
    return participant
  }

  async leaveSession(sessionId: string, userId: string): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    const participantIndex = session.participants.findIndex(p => p.userId === userId)
    if (participantIndex === -1) {
      throw new Error(`User ${userId} not found in session ${sessionId}`)
    }

    const participant = session.participants[participantIndex]
    
    // Update participant status
    participant.status = ParticipantStatus.OFFLINE
    participant.presence.isOnline = false
    participant.presence.lastSeen = new Date()

    // Stop presence tracking
    await this.presenceManager.stopTracking(participant.id)

    // Release any locks held by this participant
    await this.releaseLocks(sessionId, userId)

    // Remove participant after a delay (for potential reconnection)
    setTimeout(() => {
      const currentSession = this.sessions.get(sessionId)
      if (currentSession) {
        const currentParticipantIndex = currentSession.participants.findIndex(p => p.userId === userId)
        if (currentParticipantIndex !== -1) {
          const currentParticipant = currentSession.participants[currentParticipantIndex]
          if (currentParticipant.status === ParticipantStatus.OFFLINE) {
            currentSession.participants.splice(currentParticipantIndex, 1)
            this.participants.delete(currentParticipant.id)
          }
        }
      }
    }, 30000) // 30 second grace period

    session.lastActivity = new Date()

    // Emit leave event
    await eventBus.publish({
      type: 'collaboration:participant:left',
      source: 'collaboration-manager',
      payload: { sessionId, participant },
      priority: EventPriority.NORMAL,
      metadata: {
        tags: ['collaboration', 'participant'],
        namespace: 'collaboration',
        version: '1.0',
        headers: {}
      }
    })

    console.log(`User ${userId} left session ${sessionId}`)
  }

  // ========================================================================
  // REAL-TIME OPERATIONS
  // ========================================================================

  async applyOperation(
    sessionId: string,
    userId: string,
    operation: Partial<Operation>
  ): Promise<Operation> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    const participant = session.participants.find(p => p.userId === userId)
    if (!participant) {
      throw new Error(`User ${userId} not found in session ${sessionId}`)
    }

    // Create operation
    const fullOperation: Operation = {
      id: uuidv4(),
      type: operation.type!,
      userId,
      timestamp: new Date(),
      position: operation.position!,
      content: operation.content,
      metadata: {
        participantId: participant.id,
        sessionId,
        version: session.document.version,
        ...operation.metadata
      },
      state: OperationState.PENDING,
      conflicts: [],
      resolution: { strategy: ConflictResolutionStrategy.MERGE, resolved: false }
    }

    // Check for conflicts
    const conflicts = await this.detectConflicts(session, fullOperation)
    if (conflicts.length > 0) {
      fullOperation.conflicts = conflicts
      await this.handleConflicts(session, fullOperation, conflicts)
    }

    // Apply operational transformation
    const transformedOperation = await this.operationalTransform.transform(
      session.document,
      fullOperation
    )

    // Apply to document
    await this.applyToDocument(session, transformedOperation)

    // Store operation
    this.operations.set(transformedOperation.id, transformedOperation)
    session.document.operations.push(transformedOperation)

    // Update document version
    session.document.version++
    session.lastActivity = new Date()

    // Update participant activity
    participant.activity.operationsCount++
    participant.activity.lastOperation = new Date()
    participant.lastActiveAt = new Date()

    // Broadcast operation to all participants
    await this.broadcastOperation(session, transformedOperation)

    // Auto-save if enabled
    if (session.settings.autoSave) {
      await this.autoSave(session)
    }

    return transformedOperation
  }

  private async detectConflicts(session: CollaborationSession, operation: Operation): Promise<Conflict[]> {
    const conflicts: Conflict[] = []

    // Check for concurrent edits in the same region
    const recentOperations = session.document.operations.filter(op => 
      op.timestamp > new Date(Date.now() - 5000) && // Last 5 seconds
      op.userId !== operation.userId &&
      this.operationsOverlap(op, operation)
    )

    if (recentOperations.length > 0) {
      const conflict: Conflict = {
        id: uuidv4(),
        type: ConflictType.CONCURRENT_EDIT,
        operations: [operation.id, ...recentOperations.map(op => op.id)],
        participants: [operation.userId, ...recentOperations.map(op => op.userId)],
        severity: ConflictSeverity.MEDIUM,
        autoResolvable: true,
        resolution: { strategy: ConflictResolutionStrategy.MERGE, resolved: false },
        timestamp: new Date()
      }
      conflicts.push(conflict)
    }

    // Check for lock conflicts
    const lockConflict = this.checkLockConflict(session, operation)
    if (lockConflict) {
      conflicts.push(lockConflict)
    }

    return conflicts
  }

  private async handleConflicts(
    session: CollaborationSession,
    operation: Operation,
    conflicts: Conflict[]
  ): Promise<void> {
    for (const conflict of conflicts) {
      this.conflicts.set(conflict.id, conflict)
      
      if (conflict.autoResolvable) {
        const resolution = await this.conflictResolver.autoResolve(conflict, session)
        conflict.resolution = resolution
      } else {
        // Notify participants of manual conflict resolution needed
        await this.notifyConflict(session, conflict)
      }
    }
  }

  private operationsOverlap(op1: Operation, op2: Operation): boolean {
    // Check if two operations affect overlapping regions
    const pos1 = op1.position
    const pos2 = op2.position
    
    // Simple overlap detection - would be more complex for different document types
    return Math.abs(pos1.line - pos2.line) <= 1 && 
           Math.abs(pos1.column - pos2.column) <= 10
  }

  private checkLockConflict(session: CollaborationSession, operation: Operation): Conflict | null {
    const locks = session.document.locks
    const operationSection = this.getOperationSection(operation)
    
    for (const lock of locks) {
      if (lock.userId !== operation.userId && 
          this.sectionsOverlap(lock.section, operationSection) &&
          (lock.type === LockType.WRITE || lock.type === LockType.EXCLUSIVE)) {
        return {
          id: uuidv4(),
          type: ConflictType.LOCK_CONFLICT,
          operations: [operation.id],
          participants: [operation.userId, lock.userId],
          severity: ConflictSeverity.HIGH,
          autoResolvable: false,
          resolution: { strategy: ConflictResolutionStrategy.MANUAL, resolved: false },
          timestamp: new Date()
        }
      }
    }
    
    return null
  }

  private async applyToDocument(session: CollaborationSession, operation: Operation): Promise<void> {
    const document = session.document

    switch (operation.type) {
      case OperationType.INSERT:
        await this.documentSyncer.applyInsert(document, operation)
        break
      case OperationType.DELETE:
        await this.documentSyncer.applyDelete(document, operation)
        break
      case OperationType.REPLACE:
        await this.documentSyncer.applyReplace(document, operation)
        break
      // Handle other operation types...
    }

    operation.state = OperationState.APPLIED
  }

  private async broadcastOperation(session: CollaborationSession, operation: Operation): Promise<void> {
    // Broadcast to all active participants except the author
    const activeParticipants = session.participants.filter(p => 
      p.userId !== operation.userId && 
      p.status === ParticipantStatus.ACTIVE
    )

    for (const participant of activeParticipants) {
      await this.connectionManager.sendToParticipant(participant.id, {
        type: 'operation',
        payload: operation
      })
    }

    // Emit broadcast event
    await eventBus.publish({
      type: 'collaboration:operation:broadcast',
      source: 'collaboration-manager',
      payload: { sessionId: session.id, operation },
      priority: EventPriority.HIGH,
      metadata: {
        tags: ['collaboration', 'operation'],
        namespace: 'collaboration',
        version: '1.0',
        headers: {}
      }
    })
  }

  // ========================================================================
  // PRESENCE MANAGEMENT
  // ========================================================================

  async updatePresence(
    sessionId: string,
    userId: string,
    presence: Partial<PresenceInfo>
  ): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    const participant = session.participants.find(p => p.userId === userId)
    if (!participant) {
      throw new Error(`User ${userId} not found in session ${sessionId}`)
    }

    // Update presence information
    Object.assign(participant.presence, presence)
    participant.presence.lastSeen = new Date()
    participant.lastActiveAt = new Date()

    // Broadcast presence update
    await this.broadcastPresence(session, participant)
  }

  private async broadcastPresence(session: CollaborationSession, participant: Participant): Promise<void> {
    const otherParticipants = session.participants.filter(p => 
      p.id !== participant.id && 
      p.status === ParticipantStatus.ACTIVE
    )

    for (const otherParticipant of otherParticipants) {
      await this.connectionManager.sendToParticipant(otherParticipant.id, {
        type: 'presence',
        payload: {
          participantId: participant.id,
          presence: participant.presence
        }
      })
    }
  }

  // ========================================================================
  // DOCUMENT MANAGEMENT
  // ========================================================================

  async createRevision(sessionId: string, userId: string, description?: string): Promise<Revision> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    const revision: Revision = {
      id: uuidv4(),
      documentId: session.document.id,
      version: session.document.version,
      userId,
      timestamp: new Date(),
      operations: session.document.operations.map(op => op.id),
      checkpoint: true,
      description,
      metadata: {
        participantCount: session.participants.length,
        operationCount: session.document.operations.length
      }
    }

    session.document.revisions.push(revision)

    // Emit revision creation event
    await eventBus.publish({
      type: 'collaboration:revision:created',
      source: 'collaboration-manager',
      payload: { sessionId, revision },
      priority: EventPriority.NORMAL,
      metadata: {
        tags: ['collaboration', 'revision'],
        namespace: 'collaboration',
        version: '1.0',
        headers: {}
      }
    })

    return revision
  }

  async addComment(
    sessionId: string,
    userId: string,
    content: string,
    position: DocumentPosition,
    threadId?: string
  ): Promise<Comment> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    const comment: Comment = {
      id: uuidv4(),
      userId,
      content,
      position,
      thread: {
        id: threadId || uuidv4(),
        comments: [],
        resolved: false,
        createdAt: new Date()
      },
      reactions: [],
      resolved: false,
      timestamp: new Date(),
      metadata: {
        sessionId,
        version: session.document.version
      }
    }

    session.document.comments.push(comment)

    // Broadcast comment to all participants
    await this.broadcastComment(session, comment)

    return comment
  }

  private async broadcastComment(session: CollaborationSession, comment: Comment): Promise<void> {
    const activeParticipants = session.participants.filter(p => 
      p.status === ParticipantStatus.ACTIVE
    )

    for (const participant of activeParticipants) {
      await this.connectionManager.sendToParticipant(participant.id, {
        type: 'comment',
        payload: comment
      })
    }
  }

  // ========================================================================
  // LOCKING MECHANISM
  // ========================================================================

  async acquireLock(
    sessionId: string,
    userId: string,
    section: DocumentSection,
    type: LockType,
    exclusive: boolean = false
  ): Promise<DocumentLock> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    // Check for existing locks
    const conflictingLocks = session.document.locks.filter(lock =>
      this.sectionsOverlap(lock.section, section) &&
      (lock.exclusive || exclusive || lock.type === LockType.WRITE)
    )

    if (conflictingLocks.length > 0) {
      throw new Error('Lock conflict: section already locked')
    }

    const lock: DocumentLock = {
      id: uuidv4(),
      userId,
      section,
      type,
      acquired: new Date(),
      exclusive,
      metadata: {
        sessionId,
        participantId: session.participants.find(p => p.userId === userId)?.id
      }
    }

    session.document.locks.push(lock)

    // Broadcast lock acquisition
    await this.broadcastLock(session, lock, 'acquired')

    return lock
  }

  async releaseLock(sessionId: string, lockId: string): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    const lockIndex = session.document.locks.findIndex(lock => lock.id === lockId)
    if (lockIndex === -1) {
      throw new Error(`Lock ${lockId} not found`)
    }

    const lock = session.document.locks[lockIndex]
    session.document.locks.splice(lockIndex, 1)

    // Broadcast lock release
    await this.broadcastLock(session, lock, 'released')
  }

  private async releaseLocks(sessionId: string, userId: string): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (!session) return

    const userLocks = session.document.locks.filter(lock => lock.userId === userId)
    
    for (const lock of userLocks) {
      await this.releaseLock(sessionId, lock.id)
    }
  }

  private async broadcastLock(session: CollaborationSession, lock: DocumentLock, action: string): Promise<void> {
    const activeParticipants = session.participants.filter(p => 
      p.status === ParticipantStatus.ACTIVE
    )

    for (const participant of activeParticipants) {
      await this.connectionManager.sendToParticipant(participant.id, {
        type: 'lock',
        payload: { lock, action }
      })
    }
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  private createDocument(sessionId: string, type: SessionType): CollaborativeDocument {
    return {
      id: uuidv4(),
      sessionId,
      type: this.getDocumentType(type),
      title: 'Untitled Document',
      content: {
        text: '',
        data: {},
        format: 'plain'
      },
      version: 0,
      revisions: [],
      operations: [],
      locks: [],
      comments: [],
      annotations: [],
      metadata: {
        createdAt: new Date(),
        lastModified: new Date(),
        size: 0
      }
    }
  }

  private createWorkspace(sessionId: string): CollaborativeWorkspace {
    return {
      id: uuidv4(),
      sessionId,
      layout: {
        type: 'grid',
        columns: 2,
        rows: 1,
        areas: []
      },
      components: [],
      views: [],
      tools: [],
      state: {
        zoom: 1.0,
        pan: { x: 0, y: 0 },
        selection: null
      },
      sync: {
        strategy: SyncStrategy.REAL_TIME,
        frequency: 1000,
        conflictResolution: ConflictResolutionStrategy.MERGE,
        persistence: {
          enabled: true,
          interval: 30000
        },
        optimization: {
          debounce: 100,
          batch: true,
          compression: true
        },
        backup: {
          enabled: true,
          interval: 300000
        }
      }
    }
  }

  private createDefaultPermissions(): SessionPermissions {
    return {
      read: true,
      write: true,
      comment: true,
      share: false,
      admin: false,
      roles: {
        [ParticipantRole.OWNER]: {
          read: true,
          write: true,
          comment: true,
          share: true,
          admin: true
        },
        [ParticipantRole.EDITOR]: {
          read: true,
          write: true,
          comment: true,
          share: false,
          admin: false
        },
        [ParticipantRole.VIEWER]: {
          read: true,
          write: false,
          comment: true,
          share: false,
          admin: false
        }
      }
    }
  }

  private getDocumentType(sessionType: SessionType): DocumentType {
    switch (sessionType) {
      case SessionType.WORKFLOW_DESIGN:
        return DocumentType.WORKFLOW
      case SessionType.DATA_MODELING:
        return DocumentType.DIAGRAM
      case SessionType.CODE_REVIEW:
        return DocumentType.CODE
      default:
        return DocumentType.TEXT
    }
  }

  private async getUserName(userId: string): Promise<string> {
    // This would integrate with your user management system
    return `User ${userId.substring(0, 8)}`
  }

  private getOperationSection(operation: Operation): DocumentSection {
    return {
      start: operation.position,
      end: operation.position // Simplified
    }
  }

  private sectionsOverlap(section1: DocumentSection, section2: DocumentSection): boolean {
    // Check if two document sections overlap
    return !(section1.end.line < section2.start.line || 
             section2.end.line < section1.start.line)
  }

  private async autoSave(session: CollaborationSession): Promise<void> {
    if (Date.now() - session.lastActivity.getTime() >= session.settings.autoSaveInterval) {
      // Perform auto-save
      console.debug(`Auto-saving session ${session.id}`)
      
      // Create automatic revision
      await this.createRevision(session.id, 'system', 'Auto-save')
    }
  }

  private async notifyConflict(session: CollaborationSession, conflict: Conflict): Promise<void> {
    // Notify participants of conflict requiring manual resolution
    const participantsToNotify = session.participants.filter(p => 
      conflict.participants.includes(p.userId) && 
      p.status === ParticipantStatus.ACTIVE
    )

    for (const participant of participantsToNotify) {
      await this.connectionManager.sendToParticipant(participant.id, {
        type: 'conflict',
        payload: conflict
      })
    }
  }

  private setupEventHandlers(): void {
    // Listen for user events
    eventBus.subscribe('user:*', async (event) => {
      // Handle user-related collaboration events
    })

    // Listen for system events
    eventBus.subscribe('system:*', async (event) => {
      // Handle system events affecting collaboration
    })
  }

  private startHeartbeat(): void {
    // Start heartbeat for active sessions
    setInterval(() => {
      this.checkActiveParticipants()
    }, 30000) // Every 30 seconds

    // Start cleanup tasks
    setInterval(() => {
      this.cleanupInactiveSessions()
    }, 300000) // Every 5 minutes
  }

  private checkActiveParticipants(): void {
    const now = new Date()
    
    for (const session of this.sessions.values()) {
      for (const participant of session.participants) {
        const inactiveTime = now.getTime() - participant.lastActiveAt.getTime()
        
        if (inactiveTime > 300000 && participant.status === ParticipantStatus.ACTIVE) { // 5 minutes
          participant.status = ParticipantStatus.IDLE
        } else if (inactiveTime > 1800000) { // 30 minutes
          participant.status = ParticipantStatus.AWAY
        }
      }
    }
  }

  private cleanupInactiveSessions(): void {
    const now = new Date()
    
    for (const [sessionId, session] of this.sessions.entries()) {
      const inactiveTime = now.getTime() - session.lastActivity.getTime()
      
      // Archive sessions inactive for more than 24 hours
      if (inactiveTime > 86400000 && session.status === SessionStatus.ACTIVE) {
        session.status = SessionStatus.ARCHIVED
      }
      
      // Remove very old archived sessions
      if (inactiveTime > 604800000 && session.status === SessionStatus.ARCHIVED) { // 7 days
        this.sessions.delete(sessionId)
      }
    }
  }

  // ========================================================================
  // PUBLIC API
  // ========================================================================

  getSession(sessionId: string): CollaborationSession | undefined {
    return this.sessions.get(sessionId)
  }

  getAllSessions(): CollaborationSession[] {
    return Array.from(this.sessions.values())
  }

  getActiveSessions(): CollaborationSession[] {
    return Array.from(this.sessions.values()).filter(s => s.status === SessionStatus.ACTIVE)
  }

  getSessionsByUser(userId: string): CollaborationSession[] {
    return Array.from(this.sessions.values()).filter(session =>
      session.participants.some(p => p.userId === userId)
    )
  }

  getParticipant(participantId: string): Participant | undefined {
    return this.participants.get(participantId)
  }

  getOperation(operationId: string): Operation | undefined {
    return this.operations.get(operationId)
  }

  getConflict(conflictId: string): Conflict | undefined {
    return this.conflicts.get(conflictId)
  }
}

// ============================================================================
// SUPPORTING CLASSES
// ============================================================================

class ConnectionManager {
  private connections: Map<string, Connection> = new Map()

  constructor(private manager: RealTimeCollaborationManager) {}

  async sendToParticipant(participantId: string, message: any): Promise<void> {
    const connection = this.connections.get(participantId)
    if (connection && connection.status === 'connected') {
      // Send message through WebSocket or similar real-time connection
      console.debug(`Sending message to participant ${participantId}:`, message.type)
    }
  }

  async broadcastToSession(sessionId: string, message: any, excludeParticipant?: string): Promise<void> {
    // Broadcast message to all participants in session
    console.debug(`Broadcasting to session ${sessionId}:`, message.type)
  }
}

class ConflictResolver {
  constructor(private manager: RealTimeCollaborationManager) {}

  async autoResolve(conflict: Conflict, session: CollaborationSession): Promise<ConflictResolution> {
    switch (conflict.type) {
      case ConflictType.CONCURRENT_EDIT:
        return await this.resolveConcurrentEdit(conflict, session)
      case ConflictType.LOCK_CONFLICT:
        return await this.resolveLockConflict(conflict, session)
      default:
        return { strategy: ConflictResolutionStrategy.MANUAL, resolved: false }
    }
  }

  private async resolveConcurrentEdit(conflict: Conflict, session: CollaborationSession): Promise<ConflictResolution> {
    // Implement three-way merge or operational transformation
    return {
      strategy: ConflictResolutionStrategy.MERGE,
      resolved: true,
      mergedContent: 'merged content', // Actual merge logic would go here
      timestamp: new Date()
    }
  }

  private async resolveLockConflict(conflict: Conflict, session: CollaborationSession): Promise<ConflictResolution> {
    // Queue operation until lock is released
    return {
      strategy: ConflictResolutionStrategy.MANUAL,
      resolved: false,
      queuedUntil: new Date(Date.now() + 60000) // Queue for 1 minute
    }
  }
}

class PresenceManager {
  private trackedParticipants: Set<string> = new Set()

  constructor(private manager: RealTimeCollaborationManager) {}

  async startTracking(participantId: string): Promise<void> {
    this.trackedParticipants.add(participantId)
    console.debug(`Started presence tracking for ${participantId}`)
  }

  async stopTracking(participantId: string): Promise<void> {
    this.trackedParticipants.delete(participantId)
    console.debug(`Stopped presence tracking for ${participantId}`)
  }

  async updatePresence(participantId: string, presence: Partial<PresenceInfo>): Promise<void> {
    if (this.trackedParticipants.has(participantId)) {
      // Update presence information
      console.debug(`Updated presence for ${participantId}`)
    }
  }
}

class OperationalTransform {
  async transform(document: CollaborativeDocument, operation: Operation): Promise<Operation> {
    // Implement operational transformation algorithms
    // This would handle concurrent operations and maintain document consistency
    return operation
  }
}

class DocumentSyncer {
  constructor(private manager: RealTimeCollaborationManager) {}

  async applyInsert(document: CollaborativeDocument, operation: Operation): Promise<void> {
    // Apply insert operation to document
    console.debug(`Applying insert operation to document ${document.id}`)
  }

  async applyDelete(document: CollaborativeDocument, operation: Operation): Promise<void> {
    // Apply delete operation to document
    console.debug(`Applying delete operation to document ${document.id}`)
  }

  async applyReplace(document: CollaborativeDocument, operation: Operation): Promise<void> {
    // Apply replace operation to document
    console.debug(`Applying replace operation to document ${document.id}`)
  }
}

class PermissionManager {
  async getParticipantPermissions(role: ParticipantRole): Promise<ParticipantPermissions> {
    switch (role) {
      case ParticipantRole.OWNER:
        return { read: true, write: true, comment: true, share: true, admin: true }
      case ParticipantRole.EDITOR:
        return { read: true, write: true, comment: true, share: false, admin: false }
      case ParticipantRole.VIEWER:
        return { read: true, write: false, comment: true, share: false, admin: false }
      default:
        return { read: true, write: false, comment: false, share: false, admin: false }
    }
  }
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

interface SessionPermissions {
  read: boolean
  write: boolean
  comment: boolean
  share: boolean
  admin: boolean
  roles: Record<ParticipantRole, ParticipantPermissions>
}

interface ParticipantPermissions {
  read: boolean
  write: boolean
  comment: boolean
  share: boolean
  admin: boolean
}

interface SessionSettings {
  maxParticipants: number
  allowGuests: boolean
  autoSave: boolean
  autoSaveInterval: number
  trackChanges: boolean
  enableComments: boolean
  enableAnnotations: boolean
  conflictResolution: ConflictResolutionStrategy
  syncStrategy: SyncStrategy
}

interface SessionMetadata {
  tags: string[]
  category: string
  priority: string
}

interface ActivityInfo {
  operationsCount: number
  lastOperation: Date
  sessionDuration: number
}

interface ConnectionInfo {
  id: string
  status: string
  quality: string
  latency: number
}

interface DocumentContent {
  text: string
  data: any
  format: string
}

interface DocumentMetadata {
  createdAt: Date
  lastModified: Date
  size: number
}

interface DocumentPosition {
  line: number
  column: number
}

interface DocumentSection {
  start: DocumentPosition
  end: DocumentPosition
}

interface CursorPosition {
  line: number
  column: number
}

interface SelectionRange {
  start: DocumentPosition
  end: DocumentPosition
}

interface ViewportInfo {
  top: number
  left: number
  width: number
  height: number
}

interface FocusInfo {
  elementId: string
  type: string
}

interface DeviceInfo {
  type: string
  browser: string
  os: string
}

interface OperationMetadata {
  participantId: string
  sessionId: string
  version: number
  [key: string]: any
}

enum OperationState {
  PENDING = 'pending',
  APPLIED = 'applied',
  CONFLICTED = 'conflicted',
  RESOLVED = 'resolved'
}

interface ConflictResolution {
  strategy: ConflictResolutionStrategy
  resolved: boolean
  mergedContent?: any
  queuedUntil?: Date
  timestamp?: Date
}

interface CommentThread {
  id: string
  comments: string[]
  resolved: boolean
  createdAt: Date
}

interface Reaction {
  emoji: string
  userId: string
  timestamp: Date
}

interface CommentMetadata {
  sessionId: string
  version: number
}

interface AnnotationContent {
  text?: string
  data?: any
  style?: any
}

interface AnnotationVisibility {
  public: boolean
  participants: string[]
}

interface AnnotationMetadata {
  sessionId: string
  version: number
}

interface RevisionMetadata {
  participantCount: number
  operationCount: number
}

interface LockMetadata {
  sessionId: string
  participantId?: string
}

interface WorkspaceLayout {
  type: string
  columns: number
  rows: number
  areas: any[]
}

interface WorkspaceComponent {
  id: string
  type: string
  position: any
  properties: any
}

interface WorkspaceView {
  id: string
  name: string
  layout: any
  filters: any[]
}

interface CollaborationTool {
  id: string
  type: string
  enabled: boolean
  settings: any
}

interface WorkspaceState {
  zoom: number
  pan: { x: number; y: number }
  selection: any
}

interface PersistenceConfig {
  enabled: boolean
  interval: number
}

interface SyncOptimization {
  debounce: number
  batch: boolean
  compression: boolean
}

interface BackupConfig {
  enabled: boolean
  interval: number
}

interface Connection {
  id: string
  status: string
  quality: string
  latency: number
}

// Export singleton instance
export const realTimeCollaborationManager = new RealTimeCollaborationManager()
export default realTimeCollaborationManager