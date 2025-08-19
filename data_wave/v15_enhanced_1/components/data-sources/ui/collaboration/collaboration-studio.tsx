import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  UserGroupIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  PencilIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  LockClosedIcon,
  LockOpenIcon,
  ArrowPathIcon,
  ShareIcon,
  BellIcon,
  HandRaisedIcon,
  CursorArrowRaysIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { Editor } from '@monaco-editor/react'

// Import our enterprise systems
import { 
  realTimeCollaborationManager, 
  CollaborationSession, 
  Participant, 
  Operation, 
  Conflict 
} from '../../collaboration/realtime-collaboration'
import { eventBus } from '../../core/event-bus'
import { approvalSystem } from '../../workflows/approval-system'

// Import enterprise hooks and APIs
import { 
  useEnterpriseFeatures, 
  useCollaborationFeatures,
  useWorkflowIntegration 
} from '../../hooks/use-enterprise-features'
import { 
  useCollaborationSessionsQuery,
  useCollaborationOperationsQuery,
  useWorkflowIntegrationQuery
} from '../../services/enterprise-apis'

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

interface CollaborationStudioState {
  session: CollaborationSession | null
  participants: Participant[]
  currentUser: Participant | null
  document: CollaborativeDocument
  operations: Operation[]
  conflicts: Conflict[]
  comments: Comment[]
  annotations: Annotation[]
  cursors: CursorInfo[]
  selections: SelectionInfo[]
  activities: ActivityInfo[]
  isConnected: boolean
  viewMode: 'editor' | 'preview' | 'comments' | 'history'
  sidebarOpen: boolean
  chatOpen: boolean
}

interface CollaborativeDocument {
  id: string
  title: string
  content: string
  language: string
  version: number
  lastModified: Date
  locks: DocumentLock[]
}

interface CursorInfo {
  participantId: string
  position: { line: number; column: number }
  color: string
  visible: boolean
}

interface SelectionInfo {
  participantId: string
  range: { start: { line: number; column: number }; end: { line: number; column: number } }
  color: string
}

interface ActivityInfo {
  id: string
  type: 'edit' | 'comment' | 'join' | 'leave' | 'conflict' | 'approval'
  participantId: string
  timestamp: Date
  description: string
  metadata?: Record<string, any>
}

interface DocumentLock {
  id: string
  participantId: string
  range: { start: { line: number; column: number }; end: { line: number; column: number } }
  type: 'read' | 'write' | 'exclusive'
  acquired: Date
  expires?: Date
}

interface Comment {
  id: string
  participantId: string
  content: string
  position: { line: number; column: number }
  resolved: boolean
  timestamp: Date
  replies: CommentReply[]
  reactions: Reaction[]
}

interface CommentReply {
  id: string
  participantId: string
  content: string
  timestamp: Date
}

interface Reaction {
  emoji: string
  participantId: string
  timestamp: Date
}

interface Annotation {
  id: string
  type: 'highlight' | 'note' | 'suggestion' | 'question'
  participantId: string
  range: { start: { line: number; column: number }; end: { line: number; column: number } }
  content: string
  timestamp: Date
}

// ============================================================================
// COLLABORATION STUDIO COMPONENT
// ============================================================================

export const CollaborationStudio: React.FC = () => {
  const [session, setSession] = useState<CollaborationSession | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [currentUser, setCurrentUser] = useState<Participant | null>(null)
  const [document, setDocument] = useState<CollaborativeDocument>({
    id: 'doc_1',
    title: 'Data Pipeline Configuration',
    content: '# Loading document from backend...',
    language: 'yaml',
    version: 1,
    lastModified: new Date(),
    locks: []
  })
  const [operations, setOperations] = useState<Operation[]>([])
  const [conflicts, setConflicts] = useState<Conflict[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [cursors, setCursors] = useState<CursorInfo[]>([])
  const [selections, setSelections] = useState<SelectionInfo[]>([])
  const [activities, setActivities] = useState<ActivityInfo[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'comments' | 'history'>('editor')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newComment, setNewComment] = useState('')
  const [selectedRange, setSelectedRange] = useState<any>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')

  // Enterprise features integration
  const enterpriseFeatures = useEnterpriseFeatures({
    componentName: 'CollaborationStudio',
    enableAnalytics: true,
    enableCollaboration: true,
    enableWorkflows: true,
    enableRealTimeUpdates: true,
    enableNotifications: true,
    enableAuditLogging: true
  })

  const collaborationFeatures = useCollaborationFeatures({
    componentId: 'collaboration-studio',
    enableRealTimeEditing: true,
    enableConflictResolution: true,
    enableComments: true,
    enableCursors: true
  })

  const workflowIntegration = useWorkflowIntegration({
    componentId: 'collaboration-studio',
    enableApprovals: true,
    enableVersioning: true,
    enableNotifications: true
  })

  // Backend data queries
  const { data: collaborationSessions } = useCollaborationSessionsQuery('collaboration-studio')
  const { data: collaborationOperations } = useCollaborationOperationsQuery(session?.id)
  const { data: workflowData } = useWorkflowIntegrationQuery('collaboration')

  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  // ========================================================================
  // SESSION INITIALIZATION
  // ========================================================================

  useEffect(() => {
    const initializeSession = async () => {
      try {
        setConnectionStatus('connecting')
        
        // Create or join collaboration session
        const sessionId = await realTimeCollaborationManager.createSession(
          'Data Pipeline Configuration',
          'Collaborative editing session for data pipeline setup',
          'document_editing' as any,
          'current-user'
        )

        // Join as current user
        const participant = await realTimeCollaborationManager.joinSession(
          sessionId,
          'current-user',
          'editor' as any
        )

        const session = realTimeCollaborationManager.getSession(sessionId)
        
        if (session) {
          setState(prev => ({
            ...prev,
            session,
            currentUser: participant,
            participants: session.participants,
            isConnected: true
          }))
          
          setConnectionStatus('connected')
          
          // Add initial activity
          addActivity('join', participant.id, `${participant.name} joined the session`)
        }

        // Subscribe to collaboration events
        eventBus.subscribe('collaboration:participant:joined', handleParticipantJoined)
        eventBus.subscribe('collaboration:participant:left', handleParticipantLeft)
        eventBus.subscribe('collaboration:operation:broadcast', handleOperationReceived)
        eventBus.subscribe('collaboration:conflict', handleConflictDetected)

        // Simulate some existing participants
        setTimeout(() => {
          simulateExistingParticipants()
        }, 2000)

      } catch (error) {
        console.error('Failed to initialize collaboration session:', error)
        setConnectionStatus('disconnected')
      }
    }

    initializeSession()

    return () => {
      eventBus.unsubscribe('collaboration:*', handleParticipantJoined)
    }
  }, [])

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleParticipantJoined = useCallback((event: any) => {
    const participant = event.payload?.participant
    if (participant && participant.id !== state.currentUser?.id) {
      setState(prev => ({
        ...prev,
        participants: [...prev.participants, participant]
      }))
      
      addActivity('join', participant.id, `${participant.name} joined the session`)
      
      // Show notification
      showNotification(`${participant.name} joined the session`, 'info')
    }
  }, [state.currentUser])

  const handleParticipantLeft = useCallback((event: any) => {
    const participant = event.payload?.participant
    if (participant) {
      setState(prev => ({
        ...prev,
        participants: prev.participants.filter(p => p.id !== participant.id),
        cursors: prev.cursors.filter(c => c.participantId !== participant.id),
        selections: prev.selections.filter(s => s.participantId !== participant.id)
      }))
      
      addActivity('leave', participant.id, `${participant.name} left the session`)
    }
  }, [])

  const handleOperationReceived = useCallback((event: any) => {
    const operation = event.payload?.operation
    if (operation && operation.userId !== state.currentUser?.userId) {
      // Apply operation to document
      applyOperation(operation)
      
      // Add to activities
      addActivity('edit', operation.userId, `Made an edit to the document`)
    }
  }, [state.currentUser])

  const handleConflictDetected = useCallback((event: any) => {
    const conflict = event.payload
    if (conflict) {
      setState(prev => ({
        ...prev,
        conflicts: [...prev.conflicts, conflict]
      }))
      
      addActivity('conflict', 'system', 'Conflict detected and resolved automatically')
      showNotification('Conflict detected and resolved', 'warning')
    }
  }, [])

  // ========================================================================
  // EDITOR OPERATIONS
  // ========================================================================

  const handleEditorChange = useCallback(async (value: string | undefined, event: any) => {
    if (!value || !state.session || !state.currentUser) return

    // Update local document
    setState(prev => ({
      ...prev,
      document: {
        ...prev.document,
        content: value,
        version: prev.document.version + 1,
        lastModified: new Date()
      }
    }))

    // Send operation to other participants
    try {
      await realTimeCollaborationManager.applyOperation(
        state.session.id,
        state.currentUser.userId,
        {
          type: 'replace' as any,
          position: { line: 0, column: 0 },
          content: value
        }
      )
    } catch (error) {
      console.error('Failed to apply operation:', error)
    }
  }, [state.session, state.currentUser])

  const handleCursorPositionChange = useCallback((event: any) => {
    if (!state.session || !state.currentUser) return

    const position = event.position
    
    // Update local cursor
    setState(prev => ({
      ...prev,
      cursors: prev.cursors.map(cursor =>
        cursor.participantId === state.currentUser!.id
          ? { ...cursor, position, visible: true }
          : cursor
      )
    }))

    // Broadcast cursor position
    realTimeCollaborationManager.updatePresence(
      state.session.id,
      state.currentUser.userId,
      {
        cursor: position,
        activity: 'typing' as any
      }
    ).catch(console.error)
  }, [state.session, state.currentUser])

  const handleSelectionChange = useCallback((event: any) => {
    if (!state.session || !state.currentUser) return

    const selection = event.selection
    setSelectedRange(selection)
    
    // Update local selection
    setState(prev => ({
      ...prev,
      selections: prev.selections.map(sel =>
        sel.participantId === state.currentUser!.id
          ? { ...sel, range: { start: selection.getStartPosition(), end: selection.getEndPosition() } }
          : sel
      )
    }))

    // Broadcast selection
    realTimeCollaborationManager.updatePresence(
      state.session.id,
      state.currentUser.userId,
      {
        selection: { start: selection.getStartPosition(), end: selection.getEndPosition() }
      }
    ).catch(console.error)
  }, [state.session, state.currentUser])

  // ========================================================================
  // COMMENTS AND ANNOTATIONS
  // ========================================================================

  const addComment = useCallback(async (content: string, position?: { line: number; column: number }) => {
    if (!state.session || !state.currentUser || !content.trim()) return

    const comment: Comment = {
      id: `comment_${Date.now()}`,
      participantId: state.currentUser.id,
      content: content.trim(),
      position: position || { line: 1, column: 1 },
      resolved: false,
      timestamp: new Date(),
      replies: [],
      reactions: []
    }

    setState(prev => ({
      ...prev,
      comments: [...prev.comments, comment]
    }))

    // Broadcast comment
    await realTimeCollaborationManager.addComment(
      state.session.id,
      state.currentUser.userId,
      content.trim(),
      comment.position
    )

    addActivity('comment', state.currentUser.id, 'Added a comment')
    setNewComment('')
  }, [state.session, state.currentUser])

  const addAnnotation = useCallback(async (
    type: 'highlight' | 'note' | 'suggestion' | 'question',
    content: string,
    range: { start: { line: number; column: number }; end: { line: number; column: number } }
  ) => {
    if (!state.session || !state.currentUser) return

    const annotation: Annotation = {
      id: `annotation_${Date.now()}`,
      type,
      participantId: state.currentUser.id,
      range,
      content,
      timestamp: new Date()
    }

    setState(prev => ({
      ...prev,
      annotations: [...prev.annotations, annotation]
    }))

    addActivity('comment', state.currentUser.id, `Added a ${type}`)
  }, [state.session, state.currentUser])

  // ========================================================================
  // CHAT FUNCTIONALITY
  // ========================================================================

  const sendChatMessage = useCallback((message: string) => {
    if (!message.trim() || !state.currentUser) return

    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      participantId: state.currentUser.id,
      content: message.trim(),
      timestamp: new Date(),
      type: 'message'
    }

    setChatMessages(prev => [...prev, chatMessage])
    
    // Scroll to bottom
    setTimeout(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
      }
    }, 100)
  }, [state.currentUser])

  // ========================================================================
  // UTILITY FUNCTIONS
  // ========================================================================

  const applyOperation = (operation: Operation) => {
    // Apply the operation to the document
    setState(prev => ({
      ...prev,
      operations: [...prev.operations, operation]
    }))
  }

  const addActivity = (type: ActivityInfo['type'], participantId: string, description: string) => {
    const activity: ActivityInfo = {
      id: `activity_${Date.now()}`,
      type,
      participantId,
      timestamp: new Date(),
      description
    }

    setState(prev => ({
      ...prev,
      activities: [activity, ...prev.activities.slice(0, 49)] // Keep last 50 activities
    }))
  }

  const showNotification = (message: string, type: 'info' | 'warning' | 'error' | 'success') => {
    // This would integrate with a notification system
    console.log(`${type.toUpperCase()}: ${message}`)
  }

  const initializeRealTimeCollaboration = () => {
    // Use real collaboration data from enterprise hooks
    if (collaborationFeatures.participants && collaborationFeatures.participants.length > 0) {
      setParticipants(collaborationFeatures.participants)
      
      // Set up real cursors and selections from collaboration data
      const realCursors = collaborationFeatures.participants.map(participant => ({
        participantId: participant.userId,
        position: participant.presence?.cursor || { line: 1, column: 1 },
        color: participant.color || '#3B82F6',
        visible: participant.presence?.isOnline || false
      }))
      setCursors(realCursors)
      
      // Add activity for each participant joining
      collaborationFeatures.participants.forEach(participant => {
        setActivities(prev => [...prev, {
          id: `join-${participant.userId}`,
          type: 'collaboration',
          participantId: participant.userId,
          timestamp: participant.joinedAt,
          description: `${participant.name} joined the session`,
          metadata: participant
        }])
      })
    }
  }

  const getParticipantName = (participantId: string) => {
    const participant = state.participants.find(p => p.id === participantId || p.userId === participantId)
    return participant?.name || 'Unknown User'
  }

  const getParticipantColor = (participantId: string) => {
    const participant = state.participants.find(p => p.id === participantId || p.userId === participantId)
    return participant ? '#3B82F6' : '#6B7280'
  }

  // ========================================================================
  // RENDER HELPERS
  // ========================================================================

  const renderParticipantList = () => (
    <div className="space-y-3">
      {state.participants.map(participant => (
        <motion.div
          key={participant.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
            style={{ backgroundColor: getParticipantColor(participant.id) }}
          >
            {participant.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">{participant.name}</div>
            <div className="text-xs text-gray-500 flex items-center">
              <div className={`w-2 h-2 rounded-full mr-1 ${
                participant.presence.isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              {participant.presence.isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
          <div className="text-xs text-gray-400">
            {participant.role}
          </div>
        </motion.div>
      ))}
    </div>
  )

  const renderActivityFeed = () => (
    <div className="space-y-2">
      {state.activities.slice(0, 10).map(activity => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start space-x-3 p-2 text-sm"
        >
          <div className={`w-2 h-2 rounded-full mt-2 ${
            activity.type === 'join' ? 'bg-green-500' :
            activity.type === 'leave' ? 'bg-red-500' :
            activity.type === 'edit' ? 'bg-blue-500' :
            activity.type === 'comment' ? 'bg-purple-500' :
            activity.type === 'conflict' ? 'bg-yellow-500' :
            'bg-gray-500'
          }`} />
          <div className="flex-1">
            <div className="text-gray-900">
              <span className="font-medium">{getParticipantName(activity.participantId)}</span>
              {' '}{activity.description}
            </div>
            <div className="text-xs text-gray-500">
              {activity.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )

  const renderComments = () => (
    <div className="space-y-4">
      {state.comments.map(comment => (
        <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
              style={{ backgroundColor: getParticipantColor(comment.participantId) }}
            >
              {getParticipantName(comment.participantId).charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-sm text-gray-900">
                  {getParticipantName(comment.participantId)}
                </span>
                <span className="text-xs text-gray-500">
                  Line {comment.position.line}
                </span>
                <span className="text-xs text-gray-500">
                  {comment.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="text-sm text-gray-700">{comment.content}</div>
              {comment.replies.length > 0 && (
                <div className="mt-2 space-y-1">
                  {comment.replies.map(reply => (
                    <div key={reply.id} className="text-sm text-gray-600 pl-4 border-l-2 border-gray-200">
                      <span className="font-medium">{getParticipantName(reply.participantId)}</span>: {reply.content}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      
      <div className="border-t pt-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addComment(newComment)
              }
            }}
          />
          <button
            onClick={() => addComment(newComment)}
            disabled={!newComment.trim()}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )

  const renderChat = () => (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={chatScrollRef}>
        {chatMessages.map(message => (
          <div key={message.id} className="flex items-start space-x-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
              style={{ backgroundColor: getParticipantColor(message.participantId) }}
            >
              {getParticipantName(message.participantId).charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-sm text-gray-900">
                  {getParticipantName(message.participantId)}
                </span>
                <span className="text-xs text-gray-500">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="text-sm text-gray-700">{message.content}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t p-4">
        <ChatInput onSend={sendChatMessage} />
      </div>
    </div>
  )

  const renderToolbar = () => (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' :
            connectionStatus === 'connecting' ? 'bg-yellow-500' :
            'bg-red-500'
          }`} />
          <span className="text-sm font-medium text-gray-900">
            {state.document.title}
          </span>
          <span className="text-xs text-gray-500">
            v{state.document.version} • {state.participants.length} collaborators
          </span>
        </div>

        {state.conflicts.length > 0 && (
          <div className="flex items-center space-x-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <span className="text-xs font-medium">{state.conflicts.length} conflicts</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <select
          value={state.viewMode}
          onChange={(e) => setState(prev => ({ ...prev, viewMode: e.target.value as any }))}
          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="editor">Editor</option>
          <option value="preview">Preview</option>
          <option value="comments">Comments</option>
          <option value="history">History</option>
        </select>

        <button
          onClick={() => setState(prev => ({ ...prev, chatOpen: !prev.chatOpen }))}
          className={`p-2 rounded-md transition-colors ${
            state.chatOpen ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
          }`}
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5" />
        </button>

        <button className="p-2 hover:bg-gray-100 rounded-md">
          <VideoCameraIcon className="h-5 w-5" />
        </button>

        <button className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <ShareIcon className="h-4 w-4 mr-1" />
          Share
        </button>
      </div>
    </div>
  )

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  if (connectionStatus === 'connecting') {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to collaboration session...</p>
        </div>
      </div>
    )
  }

  if (connectionStatus === 'disconnected') {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-medium mb-2">Connection Failed</p>
          <p className="text-gray-600">Unable to connect to the collaboration session.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {renderToolbar()}
      
      <div className="flex-1 flex">
        {/* Sidebar */}
        <AnimatePresence>
          {state.sidebarOpen && (
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-80 bg-white border-r border-gray-200 flex flex-col"
            >
              <div className="border-b border-gray-200">
                <nav className="flex">
                  <button
                    onClick={() => setState(prev => ({ ...prev, viewMode: 'editor' }))}
                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      state.viewMode === 'editor'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <UserGroupIcon className="h-4 w-4 mx-auto mb-1" />
                    People
                  </button>
                  <button
                    onClick={() => setState(prev => ({ ...prev, viewMode: 'comments' }))}
                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      state.viewMode === 'comments'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mx-auto mb-1" />
                    Comments
                  </button>
                  <button
                    onClick={() => setState(prev => ({ ...prev, viewMode: 'history' }))}
                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      state.viewMode === 'history'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <ClockIcon className="h-4 w-4 mx-auto mb-1" />
                    Activity
                  </button>
                </nav>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {state.viewMode === 'editor' && renderParticipantList()}
                {state.viewMode === 'comments' && renderComments()}
                {state.viewMode === 'history' && renderActivityFeed()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Editor */}
        <div className="flex-1 flex">
          <div className="flex-1">
            <Editor
              height="100%"
              language={state.document.language}
              value={state.document.content}
              onChange={handleEditorChange}
              onMount={(editor, monaco) => {
                editorRef.current = editor
                monacoRef.current = monaco
                
                // Set up cursor and selection tracking
                editor.onDidChangeCursorPosition(handleCursorPositionChange)
                editor.onDidChangeCursorSelection(handleSelectionChange)
              }}
              options={{
                minimap: { enabled: true },
                wordWrap: 'on',
                fontSize: 14,
                lineNumbers: 'on',
                renderWhitespace: 'selection',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                theme: 'vs'
              }}
            />
            
            {/* Collaborative Cursors Overlay */}
            <CollaborativeCursors 
              cursors={state.cursors.filter(c => c.participantId !== state.currentUser?.id)}
              getParticipantName={getParticipantName}
            />
          </div>

          {/* Chat Panel */}
          <AnimatePresence>
            {state.chatOpen && (
              <motion.div
                initial={{ x: 400 }}
                animate={{ x: 0 }}
                exit={{ x: 400 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-80 bg-white border-l border-gray-200"
              >
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">Team Chat</h3>
                    <button
                      onClick={() => setState(prev => ({ ...prev, chatOpen: false }))}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                  {renderChat()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// SUPPORTING COMPONENTS
// ============================================================================

interface CollaborativeCursorsProps {
  cursors: CursorInfo[]
  getParticipantName: (id: string) => string
}

const CollaborativeCursors: React.FC<CollaborativeCursorsProps> = ({ cursors, getParticipantName }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {cursors.map(cursor => (
        <motion.div
          key={cursor.participantId}
          initial={{ opacity: 0 }}
          animate={{ opacity: cursor.visible ? 1 : 0 }}
          className="absolute z-10"
          style={{
            top: `${cursor.position.line * 19}px`, // Approximate line height
            left: `${cursor.position.column * 7}px`, // Approximate character width
          }}
        >
          <div
            className="w-0.5 h-5 animate-pulse"
            style={{ backgroundColor: cursor.color }}
          />
          <div
            className="absolute top-0 left-1 px-2 py-1 text-xs text-white rounded whitespace-nowrap"
            style={{ backgroundColor: cursor.color }}
          >
            {getParticipantName(cursor.participantId)}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

interface ChatInputProps {
  onSend: (message: string) => void
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (message.trim()) {
      onSend(message)
      setMessage('')
    }
  }

  return (
    <div className="flex space-x-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleSend()
          }
        }}
      />
      <button
        onClick={handleSend}
        disabled={!message.trim()}
        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Send
      </button>
    </div>
  )
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

interface ChatMessage {
  id: string
  participantId: string
  content: string
  timestamp: Date
  type: 'message' | 'system'
}

export default CollaborationStudio