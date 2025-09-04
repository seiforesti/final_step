import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { PlusIcon, PlayIcon, PauseIcon, StopIcon, ArrowPathIcon, DocumentDuplicateIcon, ShareIcon, EyeIcon, CogIcon, ExclamationTriangleIcon, CheckCircleIcon, ClockIcon, BoltIcon, DocumentTextIcon, CircleStackIcon, CodeBracketIcon, FunnelIcon, ArrowRightIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { DndContext, DragEndEvent, DragStartEvent, useDraggable, useDroppable } from '@dnd-kit/core'

// Import our enterprise systems
import { workflowEngine, WorkflowDefinition, WorkflowStep, WorkflowExecution } from '../../core/workflow-engine'
import { eventBus } from '../../core/event-bus'
import { realTimeCollaborationManager } from '../../collaboration/realtime-collaboration'
import { approvalSystem } from '../../workflows/approval-system'

// Import enterprise hooks and APIs
import { 
  useEnterpriseFeatures, 
  useWorkflowIntegration,
  useCollaborationFeatures 
} from '../../hooks/use-enterprise-features'
import { 
  useWorkflowDefinitionsQuery,
  useWorkflowExecutionsQuery,
  useWorkflowTemplatesQuery,
  useWorkflowApprovalQuery
} from '../../services/enterprise-apis'
import { useDataSourcesQuery } from '../../services/apis'

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

interface WorkflowNode {
  id: string
  type: NodeType
  position: { x: number; y: number }
  data: NodeData
  connections: Connection[]
  status: NodeStatus
  metadata: NodeMetadata
}

interface Connection {
  id: string
  sourceId: string
  targetId: string
  sourceHandle: string
  targetHandle: string
  type: ConnectionType
  condition?: string
  label?: string
}

interface NodeData {
  label: string
  description?: string
  icon?: string
  config?: Record<string, any>
  inputs?: NodeInput[]
  outputs?: NodeOutput[]
  validation?: ValidationRule[]
}

interface NodeInput {
  id: string
  name: string
  type: string
  required: boolean
  description?: string
}

interface NodeOutput {
  id: string
  name: string
  type: string
  description?: string
}

interface ValidationRule {
  field: string
  rule: string
  message: string
}

interface NodeMetadata {
  createdAt: Date
  createdBy: string
  lastModified: Date
  version: number
  tags: string[]
}

interface DesignerState {
  nodes: WorkflowNode[]
  connections: Connection[]
  selectedNode?: string
  selectedConnection?: string
  isRunning: boolean
  execution?: WorkflowExecution
  collaborators: Collaborator[]
  viewMode: 'design' | 'execution' | 'debug'
  zoom: number
  pan: { x: number; y: number }
}

interface Collaborator {
  id: string
  name: string
  avatar?: string
  cursor?: { x: number; y: number }
  selection?: string
  color: string
}

// ============================================================================
// ENUMS
// ============================================================================

enum NodeType {
  START = 'start',
  END = 'end',
  COMPONENT = 'component',
  API = 'api',
  SQL = 'sql',
  CONDITION = 'condition',
  TRANSFORM = 'transform',
  VALIDATE = 'validate',
  APPROVAL = 'approval',
  NOTIFICATION = 'notification',
  DELAY = 'delay',
  LOOP = 'loop',
  MERGE = 'merge',
  SPLIT = 'split'
}

enum NodeStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  WAITING = 'waiting',
  SKIPPED = 'skipped'
}

enum ConnectionType {
  SEQUENCE = 'sequence',
  CONDITION = 'condition',
  ERROR = 'error',
  SUCCESS = 'success'
}

// ============================================================================
// NODE TEMPLATES
// ============================================================================

const NODE_TEMPLATES: Record<NodeType, Partial<NodeData>> = {
  [NodeType.START]: {
    label: 'Start',
    icon: 'play',
    outputs: [{ id: 'output', name: 'Output', type: 'any' }]
  },
  [NodeType.END]: {
    label: 'End',
    icon: 'stop',
    inputs: [{ id: 'input', name: 'Input', type: 'any', required: true }]
  },
  [NodeType.COMPONENT]: {
    label: 'Component',
    icon: 'component',
    inputs: [{ id: 'input', name: 'Input', type: 'data', required: true }],
    outputs: [{ id: 'output', name: 'Output', type: 'data' }]
  },
  [NodeType.API]: {
    label: 'API Call',
    icon: 'api',
    inputs: [{ id: 'input', name: 'Request', type: 'object', required: true }],
    outputs: [
      { id: 'success', name: 'Success', type: 'object' },
      { id: 'error', name: 'Error', type: 'error' }
    ]
  },
  [NodeType.SQL]: {
    label: 'SQL Query',
    icon: 'database',
    inputs: [{ id: 'params', name: 'Parameters', type: 'object', required: false }],
    outputs: [
      { id: 'result', name: 'Result', type: 'array' },
      { id: 'error', name: 'Error', type: 'error' }
    ]
  },
  [NodeType.CONDITION]: {
    label: 'Condition',
    icon: 'branch',
    inputs: [{ id: 'input', name: 'Input', type: 'any', required: true }],
    outputs: [
      { id: 'true', name: 'True', type: 'any' },
      { id: 'false', name: 'False', type: 'any' }
    ]
  },
  [NodeType.TRANSFORM]: {
    label: 'Transform',
    icon: 'transform',
    inputs: [{ id: 'input', name: 'Input', type: 'any', required: true }],
    outputs: [{ id: 'output', name: 'Output', type: 'any' }]
  },
  [NodeType.VALIDATE]: {
    label: 'Validate',
    icon: 'validate',
    inputs: [{ id: 'input', name: 'Input', type: 'any', required: true }],
    outputs: [
      { id: 'valid', name: 'Valid', type: 'any' },
      { id: 'invalid', name: 'Invalid', type: 'error' }
    ]
  },
  [NodeType.APPROVAL]: {
    label: 'Approval',
    icon: 'approval',
    inputs: [{ id: 'request', name: 'Request', type: 'object', required: true }],
    outputs: [
      { id: 'approved', name: 'Approved', type: 'object' },
      { id: 'rejected', name: 'Rejected', type: 'object' }
    ]
  },
  [NodeType.NOTIFICATION]: {
    label: 'Notification',
    icon: 'notification',
    inputs: [{ id: 'message', name: 'Message', type: 'string', required: true }],
    outputs: [{ id: 'sent', name: 'Sent', type: 'boolean' }]
  },
  [NodeType.DELAY]: {
    label: 'Delay',
    icon: 'clock',
    inputs: [{ id: 'input', name: 'Input', type: 'any', required: true }],
    outputs: [{ id: 'output', name: 'Output', type: 'any' }]
  },
  [NodeType.LOOP]: {
    label: 'Loop',
    icon: 'loop',
    inputs: [
      { id: 'items', name: 'Items', type: 'array', required: true },
      { id: 'body', name: 'Body', type: 'any', required: true }
    ],
    outputs: [{ id: 'results', name: 'Results', type: 'array' }]
  },
  [NodeType.MERGE]: {
    label: 'Merge',
    icon: 'merge',
    inputs: [
      { id: 'input1', name: 'Input 1', type: 'any', required: true },
      { id: 'input2', name: 'Input 2', type: 'any', required: true }
    ],
    outputs: [{ id: 'output', name: 'Output', type: 'any' }]
  },
  [NodeType.SPLIT]: {
    label: 'Split',
    icon: 'split',
    inputs: [{ id: 'input', name: 'Input', type: 'array', required: true }],
    outputs: [
      { id: 'output1', name: 'Output 1', type: 'any' },
      { id: 'output2', name: 'Output 2', type: 'any' }
    ]
  }
}

// ============================================================================
// WORKFLOW DESIGNER COMPONENT
// ============================================================================

export const WorkflowDesigner: React.FC = () => {
  const [state, setState] = useState<DesignerState>({
    nodes: [],
    connections: [],
    isRunning: false,
    collaborators: [],
    viewMode: 'design',
    zoom: 1,
    pan: { x: 0, y: 0 }
  })

  const [selectedTool, setSelectedTool] = useState<NodeType | null>(null)
  const [showNodePanel, setShowNodePanel] = useState(false)
  const [showPropertyPanel, setShowPropertyPanel] = useState(true)
  const [collaborationSession, setCollaborationSession] = useState<string | null>(null)
  const [draggedItem, setDraggedItem] = useState<NodeType | null>(null)

  const canvasRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // ========================================================================
  // COLLABORATION INTEGRATION
  // ========================================================================

  useEffect(() => {
    const initCollaboration = async () => {
      try {
        const sessionId = await realTimeCollaborationManager.createSession(
          'Workflow Design Session',
          'Collaborative workflow design',
          'workflow_design' as any,
          'current-user'
        )
        setCollaborationSession(sessionId)

        // Subscribe to collaboration events
        eventBus.subscribe('collaboration:operation:broadcast', handleCollaborationEvent)
        eventBus.subscribe('collaboration:participant:joined', handleParticipantJoined)
        eventBus.subscribe('collaboration:participant:left', handleParticipantLeft)

      } catch (error) {
        console.error('Failed to initialize collaboration:', error)
      }
    }

    initCollaboration()
    return () => {
      eventBus.unsubscribe('collaboration:*', handleCollaborationEvent)
    }
  }, [])

  const handleCollaborationEvent = useCallback((event: any) => {
    if (event.payload?.operation?.type === 'workflow_update') {
      // Update workflow state based on collaborative changes
      const { nodes, connections } = event.payload.operation.content
      setState(prev => ({ ...prev, nodes, connections }))
    }
  }, [])

  const handleParticipantJoined = useCallback((event: any) => {
    const participant = event.payload?.participant
    if (participant) {
      setState(prev => ({
        ...prev,
        collaborators: [...prev.collaborators, {
          id: participant.id,
          name: participant.name,
          color: getRandomColor()
        }]
      }))
    }
  }, [])

  const handleParticipantLeft = useCallback((event: any) => {
    const participant = event.payload?.participant
    if (participant) {
      setState(prev => ({
        ...prev,
        collaborators: prev.collaborators.filter(c => c.id !== participant.id)
      }))
    }
  }, [])

  // ========================================================================
  // NODE MANAGEMENT
  // ========================================================================

  const addNode = useCallback((type: NodeType, position: { x: number; y: number }) => {
    const template = NODE_TEMPLATES[type]
    const nodeId = `node_${Date.now()}`

    const newNode: WorkflowNode = {
      id: nodeId,
      type,
      position,
      data: {
        label: template.label || 'New Node',
        description: template.description,
        icon: template.icon,
        inputs: template.inputs || [],
        outputs: template.outputs || [],
        config: {}
      },
      connections: [],
      status: NodeStatus.IDLE,
      metadata: {
        createdAt: new Date(),
        createdBy: 'current-user',
        lastModified: new Date(),
        version: 1,
        tags: []
      }
    }

    setState(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      selectedNode: nodeId
    }))

    // Broadcast change to collaborators
    broadcastWorkflowChange('node_added', { node: newNode })
  }, [])

  const updateNode = useCallback((nodeId: string, updates: Partial<WorkflowNode>) => {
    setState(prev => ({
      ...prev,
      nodes: prev.nodes.map(node =>
        node.id === nodeId
          ? { ...node, ...updates, metadata: { ...node.metadata, lastModified: new Date() } }
          : node
      )
    }))

    broadcastWorkflowChange('node_updated', { nodeId, updates })
  }, [])

  const deleteNode = useCallback((nodeId: string) => {
    setState(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId),
      connections: prev.connections.filter(conn => 
        conn.sourceId !== nodeId && conn.targetId !== nodeId
      ),
      selectedNode: prev.selectedNode === nodeId ? undefined : prev.selectedNode
    }))

    broadcastWorkflowChange('node_deleted', { nodeId })
  }, [])

  // ========================================================================
  // CONNECTION MANAGEMENT
  // ========================================================================

  const addConnection = useCallback((
    sourceId: string,
    targetId: string,
    sourceHandle: string,
    targetHandle: string,
    type: ConnectionType = ConnectionType.SEQUENCE
  ) => {
    const connectionId = `conn_${Date.now()}`
    
    const newConnection: Connection = {
      id: connectionId,
      sourceId,
      targetId,
      sourceHandle,
      targetHandle,
      type
    }

    setState(prev => ({
      ...prev,
      connections: [...prev.connections, newConnection]
    }))

    broadcastWorkflowChange('connection_added', { connection: newConnection })
  }, [])

  const deleteConnection = useCallback((connectionId: string) => {
    setState(prev => ({
      ...prev,
      connections: prev.connections.filter(conn => conn.id !== connectionId),
      selectedConnection: prev.selectedConnection === connectionId ? undefined : prev.selectedConnection
    }))

    broadcastWorkflowChange('connection_deleted', { connectionId })
  }, [])

  // ========================================================================
  // WORKFLOW EXECUTION
  // ========================================================================

  const executeWorkflow = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isRunning: true }))

      // Convert designer state to workflow definition
      const workflowDef = convertToWorkflowDefinition(state.nodes, state.connections)
      
      // Execute through workflow engine
      const execution = await workflowEngine.executeWorkflow(workflowDef.id, {})
      
      setState(prev => ({ ...prev, execution, viewMode: 'execution' }))

      // Subscribe to execution events
      eventBus.subscribe('workflow:step:started', handleStepStarted)
      eventBus.subscribe('workflow:step:completed', handleStepCompleted)
      eventBus.subscribe('workflow:step:failed', handleStepFailed)

    } catch (error) {
      console.error('Failed to execute workflow:', error)
      setState(prev => ({ ...prev, isRunning: false }))
    }
  }, [state.nodes, state.connections])

  const stopWorkflow = useCallback(async () => {
    if (state.execution) {
      await workflowEngine.cancelExecution(state.execution.id)
      setState(prev => ({ ...prev, isRunning: false, execution: undefined, viewMode: 'design' }))
    }
  }, [state.execution])

  const handleStepStarted = useCallback((event: any) => {
    const stepId = event.payload?.stepId
    if (stepId) {
      setState(prev => ({
        ...prev,
        nodes: prev.nodes.map(node =>
          node.id === stepId ? { ...node, status: NodeStatus.RUNNING } : node
        )
      }))
    }
  }, [])

  const handleStepCompleted = useCallback((event: any) => {
    const stepId = event.payload?.stepId
    if (stepId) {
      setState(prev => ({
        ...prev,
        nodes: prev.nodes.map(node =>
          node.id === stepId ? { ...node, status: NodeStatus.COMPLETED } : node
        )
      }))
    }
  }, [])

  const handleStepFailed = useCallback((event: any) => {
    const stepId = event.payload?.stepId
    if (stepId) {
      setState(prev => ({
        ...prev,
        nodes: prev.nodes.map(node =>
          node.id === stepId ? { ...node, status: NodeStatus.FAILED } : node
        )
      }))
    }
  }, [])

  // ========================================================================
  // DRAG AND DROP
  // ========================================================================

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const nodeType = event.active.data.current?.nodeType as NodeType
    setDraggedItem(nodeType)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { over } = event
    
    if (over && over.id === 'canvas' && draggedItem) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        const position = {
          x: event.delta.x + 100,
          y: event.delta.y + 100
        }
        addNode(draggedItem, position)
      }
    }
    
    setDraggedItem(null)
  }, [draggedItem, addNode])

  // ========================================================================
  // UTILITY FUNCTIONS
  // ========================================================================

  const broadcastWorkflowChange = useCallback((action: string, data: any) => {
    if (collaborationSession) {
      realTimeCollaborationManager.applyOperation(
        collaborationSession,
        'current-user',
        {
          type: 'workflow_update' as any,
          position: { line: 0, column: 0 },
          content: { action, data, nodes: state.nodes, connections: state.connections }
        }
      )
    }
  }, [collaborationSession, state.nodes, state.connections])

  const convertToWorkflowDefinition = (nodes: WorkflowNode[], connections: Connection[]): WorkflowDefinition => {
    const steps: WorkflowStep[] = nodes.map(node => ({
      id: node.id,
      type: node.type as any,
      name: node.data.label,
      config: node.data.config || {},
      dependencies: connections
        .filter(conn => conn.targetId === node.id)
        .map(conn => conn.sourceId),
      retryPolicy: {
        maxAttempts: 3,
        backoffMs: 1000,
        backoffMultiplier: 2
      },
      timeout: 300000
    }))

    return {
      id: `workflow_${Date.now()}`,
      name: 'Designer Workflow',
      description: 'Workflow created in designer',
      version: '1.0.0',
      steps,
      triggers: [],
      variables: {},
      metadata: {
        tags: ['designer'],
        createdBy: 'current-user',
        createdAt: new Date()
      }
    }
  }

  const getRandomColor = () => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // ========================================================================
  // RENDER HELPERS
  // ========================================================================

  const renderNode = (node: WorkflowNode) => (
    <WorkflowNodeComponent
      key={node.id}
      node={node}
      isSelected={state.selectedNode === node.id}
      onSelect={() => setState(prev => ({ ...prev, selectedNode: node.id }))}
      onUpdate={(updates) => updateNode(node.id, updates)}
      onDelete={() => deleteNode(node.id)}
      onConnect={addConnection}
    />
  )

  const renderConnection = (connection: Connection) => (
    <ConnectionComponent
      key={connection.id}
      connection={connection}
      nodes={state.nodes}
      isSelected={state.selectedConnection === connection.id}
      onSelect={() => setState(prev => ({ ...prev, selectedConnection: connection.id }))}
      onDelete={() => deleteConnection(connection.id)}
    />
  )

  const renderToolbox = () => (
    <div className="bg-white border-r border-gray-200 w-64 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Toolbox</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {Object.entries(NODE_TEMPLATES).map(([type, template]) => (
            <DraggableNodeType
              key={type}
              type={type as NodeType}
              template={template}
              onAdd={(nodeType) => setSelectedTool(nodeType)}
            />
          ))}
        </div>
      </div>
    </div>
  )

  const renderPropertyPanel = () => {
    const selectedNode = state.nodes.find(n => n.id === state.selectedNode)
    const selectedConnection = state.connections.find(c => c.id === state.selectedConnection)

    return (
      <div className="bg-white border-l border-gray-200 w-80 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Properties</h3>
          <button
            onClick={() => setShowPropertyPanel(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {selectedNode && (
            <NodePropertyEditor
              node={selectedNode}
              onUpdate={(updates) => updateNode(selectedNode.id, updates)}
            />
          )}
          
          {selectedConnection && (
            <ConnectionPropertyEditor
              connection={selectedConnection}
              onUpdate={(updates) => {
                setState(prev => ({
                  ...prev,
                  connections: prev.connections.map(conn =>
                    conn.id === selectedConnection.id ? { ...conn, ...updates } : conn
                  )
                }))
              }}
            />
          )}
          
          {!selectedNode && !selectedConnection && (
            <div className="text-gray-500 text-center py-8">
              Select a node or connection to edit properties
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderToolbar = () => (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={executeWorkflow}
            disabled={state.isRunning || state.nodes.length === 0}
            className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlayIcon className="h-4 w-4 mr-1" />
            Run
          </button>
          
          <button
            onClick={stopWorkflow}
            disabled={!state.isRunning}
            className="flex items-center px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <StopIcon className="h-4 w-4 mr-1" />
            Stop
          </button>
          
          <button
            onClick={() => setState(prev => ({ ...prev, viewMode: prev.viewMode === 'design' ? 'execution' : 'design' }))}
            className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            {state.viewMode === 'design' ? 'Execution View' : 'Design View'}
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300" />

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowNodePanel(!showNodePanel)}
            className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <DocumentTextIcon className="h-4 w-4 mr-1" />
            Nodes
          </button>
          
          <button
            onClick={() => setShowPropertyPanel(!showPropertyPanel)}
            className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <CogIcon className="h-4 w-4 mr-1" />
            Properties
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Collaborators */}
        <div className="flex items-center space-x-1">
          {state.collaborators.map(collaborator => (
            <div
              key={collaborator.id}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
              style={{ backgroundColor: collaborator.color }}
              title={collaborator.name}
            >
              {collaborator.name.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>

        <button
          className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <ShareIcon className="h-4 w-4 mr-1" />
          Share
        </button>
      </div>
    </div>
  )

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {renderToolbar()}
      
      <div className="flex-1 flex">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {/* Toolbox */}
          <AnimatePresence>
            {showNodePanel && (
              <motion.div
                initial={{ x: -256 }}
                animate={{ x: 0 }}
                exit={{ x: -256 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {renderToolbox()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Canvas */}
          <div className="flex-1 relative overflow-hidden">
            <CanvasComponent
              ref={canvasRef}
              nodes={state.nodes}
              connections={state.connections}
              zoom={state.zoom}
              pan={state.pan}
              onPanZoom={(zoom, pan) => setState(prev => ({ ...prev, zoom, pan }))}
              onNodeAdd={addNode}
              onCanvasClick={() => setState(prev => ({ 
                ...prev, 
                selectedNode: undefined, 
                selectedConnection: undefined 
              }))}
            >
              {state.nodes.map(renderNode)}
              <svg
                ref={svgRef}
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: 1 }}
              >
                {state.connections.map(renderConnection)}
              </svg>
            </CanvasComponent>
          </div>

          {/* Property Panel */}
          <AnimatePresence>
            {showPropertyPanel && (
              <motion.div
                initial={{ x: 320 }}
                animate={{ x: 0 }}
                exit={{ x: 320 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {renderPropertyPanel()}
              </motion.div>
            )}
          </AnimatePresence>
        </DndContext>
      </div>
    </div>
  )
}

// ============================================================================
// SUPPORTING COMPONENTS
// ============================================================================

interface DraggableNodeTypeProps {
  type: NodeType
  template: Partial<NodeData>
  onAdd: (type: NodeType) => void
}

const DraggableNodeType: React.FC<DraggableNodeTypeProps> = ({ type, template, onAdd }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `draggable-${type}`,
    data: { nodeType: type }
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-3 border border-gray-200 rounded-lg cursor-grab hover:bg-gray-50 transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-blue-600 rounded" />
        </div>
        <div>
          <div className="font-medium text-gray-900">{template.label}</div>
          <div className="text-xs text-gray-500">{template.description || 'Click or drag to add'}</div>
        </div>
      </div>
    </div>
  )
}

interface CanvasComponentProps {
  nodes: WorkflowNode[]
  connections: Connection[]
  zoom: number
  pan: { x: number; y: number }
  onPanZoom: (zoom: number, pan: { x: number; y: number }) => void
  onNodeAdd: (type: NodeType, position: { x: number; y: number }) => void
  onCanvasClick: () => void
  children: React.ReactNode
}

const CanvasComponent = React.forwardRef<HTMLDivElement, CanvasComponentProps>(
  ({ children, onCanvasClick }, ref) => {
    const { setNodeRef } = useDroppable({ id: 'canvas' })

    return (
      <div
        ref={(node) => {
          setNodeRef(node)
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        className="w-full h-full bg-gray-100 relative overflow-hidden"
        onClick={onCanvasClick}
        style={{
          backgroundImage: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      >
        {children}
      </div>
    )
  }
)

interface WorkflowNodeComponentProps {
  node: WorkflowNode
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<WorkflowNode>) => void
  onDelete: () => void
  onConnect: (sourceId: string, targetId: string, sourceHandle: string, targetHandle: string) => void
}

const WorkflowNodeComponent: React.FC<WorkflowNodeComponentProps> = ({
  node,
  isSelected,
  onSelect,
  onUpdate,
  onDelete
}) => {
  const dragControls = useDragControls()

  const getStatusColor = (status: NodeStatus) => {
    switch (status) {
      case NodeStatus.RUNNING: return 'border-blue-500 bg-blue-50'
      case NodeStatus.COMPLETED: return 'border-green-500 bg-green-50'
      case NodeStatus.FAILED: return 'border-red-500 bg-red-50'
      case NodeStatus.WAITING: return 'border-yellow-500 bg-yellow-50'
      default: return 'border-gray-300 bg-white'
    }
  }

  const getStatusIcon = (status: NodeStatus) => {
    switch (status) {
      case NodeStatus.RUNNING: return <BoltIcon className="h-4 w-4 text-blue-600" />
      case NodeStatus.COMPLETED: return <CheckCircleIcon className="h-4 w-4 text-green-600" />
      case NodeStatus.FAILED: return <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
      case NodeStatus.WAITING: return <ClockIcon className="h-4 w-4 text-yellow-600" />
      default: return null
    }
  }

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragMomentum={false}
      whileDrag={{ scale: 1.05 }}
      style={{ x: node.position.x, y: node.position.y }}
      className="absolute"
      onDragEnd={(event, info) => {
        onUpdate({
          position: {
            x: node.position.x + info.offset.x,
            y: node.position.y + info.offset.y
          }
        })
      }}
    >
      <div
        className={`min-w-[160px] border-2 rounded-lg shadow-sm cursor-pointer transition-all ${
          getStatusColor(node.status)
        } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
      >
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded" />
              </div>
              <span className="font-medium text-gray-900">{node.data.label}</span>
            </div>
            {getStatusIcon(node.status)}
          </div>
          
          {node.data.description && (
            <p className="text-xs text-gray-600 mb-2">{node.data.description}</p>
          )}

          {/* Input/Output handles would be rendered here */}
          <div className="flex justify-between">
            <div className="flex flex-col space-y-1">
              {node.data.inputs?.map(input => (
                <div
                  key={input.id}
                  className="w-3 h-3 bg-gray-400 rounded-full cursor-pointer hover:bg-gray-600"
                  title={input.name}
                />
              ))}
            </div>
            <div className="flex flex-col space-y-1">
              {node.data.outputs?.map(output => (
                <div
                  key={output.id}
                  className="w-3 h-3 bg-blue-400 rounded-full cursor-pointer hover:bg-blue-600"
                  title={output.name}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

interface ConnectionComponentProps {
  connection: Connection
  nodes: WorkflowNode[]
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
}

const ConnectionComponent: React.FC<ConnectionComponentProps> = ({
  connection,
  nodes,
  isSelected,
  onSelect,
  onDelete
}) => {
  const sourceNode = nodes.find(n => n.id === connection.sourceId)
  const targetNode = nodes.find(n => n.id === connection.targetId)

  if (!sourceNode || !targetNode) return null

  const sourcePos = { 
    x: sourceNode.position.x + 160, 
    y: sourceNode.position.y + 40 
  }
  const targetPos = { 
    x: targetNode.position.x, 
    y: targetNode.position.y + 40 
  }

  const getConnectionColor = (type: ConnectionType) => {
    switch (type) {
      case ConnectionType.SUCCESS: return '#10B981'
      case ConnectionType.ERROR: return '#EF4444'
      case ConnectionType.CONDITION: return '#F59E0B'
      default: return '#6B7280'
    }
  }

  const pathData = `M ${sourcePos.x} ${sourcePos.y} C ${sourcePos.x + 50} ${sourcePos.y} ${targetPos.x - 50} ${targetPos.y} ${targetPos.x} ${targetPos.y}`

  return (
    <g onClick={onSelect}>
      <path
        d={pathData}
        stroke={getConnectionColor(connection.type)}
        strokeWidth={isSelected ? 3 : 2}
        fill="none"
        className="cursor-pointer hover:stroke-blue-500"
        markerEnd="url(#arrowhead)"
      />
      
      {/* Arrow marker */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={getConnectionColor(connection.type)}
          />
        </marker>
      </defs>
      
      {connection.label && (
        <text
          x={(sourcePos.x + targetPos.x) / 2}
          y={(sourcePos.y + targetPos.y) / 2 - 10}
          textAnchor="middle"
          className="text-xs fill-gray-600 pointer-events-none"
        >
          {connection.label}
        </text>
      )}
    </g>
  )
}

interface NodePropertyEditorProps {
  node: WorkflowNode
  onUpdate: (updates: Partial<WorkflowNode>) => void
}

const NodePropertyEditor: React.FC<NodePropertyEditorProps> = ({ node, onUpdate }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Label
        </label>
        <input
          type="text"
          value={node.data.label}
          onChange={(e) => onUpdate({
            data: { ...node.data, label: e.target.value }
          })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={node.data.description || ''}
          onChange={(e) => onUpdate({
            data: { ...node.data, description: e.target.value }
          })}
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Configuration
        </label>
        <div className="space-y-2">
          {/* Dynamic configuration fields based on node type */}
          <div className="text-sm text-gray-500">
            Configuration options will be displayed here based on the node type.
          </div>
        </div>
      </div>
    </div>
  )
}

interface ConnectionPropertyEditorProps {
  connection: Connection
  onUpdate: (updates: Partial<Connection>) => void
}

const ConnectionPropertyEditor: React.FC<ConnectionPropertyEditorProps> = ({ connection, onUpdate }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type
        </label>
        <select
          value={connection.type}
          onChange={(e) => onUpdate({ type: e.target.value as ConnectionType })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={ConnectionType.SEQUENCE}>Sequence</option>
          <option value={ConnectionType.CONDITION}>Condition</option>
          <option value={ConnectionType.SUCCESS}>Success</option>
          <option value={ConnectionType.ERROR}>Error</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Label
        </label>
        <input
          type="text"
          value={connection.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {connection.type === ConnectionType.CONDITION && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Condition
          </label>
          <input
            type="text"
            value={connection.condition || ''}
            onChange={(e) => onUpdate({ condition: e.target.value })}
            placeholder="e.g., result.status === 'success'"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  )
}

export default WorkflowDesigner