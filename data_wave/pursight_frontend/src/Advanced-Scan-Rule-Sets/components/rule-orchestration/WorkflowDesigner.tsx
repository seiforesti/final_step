import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Play, Pause, Square, SkipForward, SkipBack, RotateCcw, Save, Download, Upload, Copy, Trash2, Edit, Eye, EyeOff, Settings, Filter, Search, Plus, Minus, ChevronRight, ChevronDown, ChevronUp, ChevronLeft, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Maximize, Minimize, RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock, Calendar, User, Users, Database, Server, Cpu, HardDrive, Network, Zap, Target, TrendingUp, TrendingDown, BarChart3, PieChart, LineChart, Activity, Bell, BellOff, Mail, MessageSquare, Phone, Video, Share, Link, ExternalLink, FileText, File, Folder, FolderOpen, Archive, Bookmark, Star, Heart, ThumbsUp, ThumbsDown, Flag, Info, HelpCircle, Lock, Unlock, Shield, Key, Fingerprint, Scan, QrCode, Camera, Image, PlayCircle, StopCircle, PauseCircle, Timer, Layers, GitBranch, GitCommit, GitMerge, Code, Terminal, Bug, Wrench, Hammer, Package, Box, Cube } from 'lucide-react';
import { useOrchestration } from '../../hooks/useOrchestration';
import { useValidation } from '../../hooks/useValidation';
import { useCollaboration } from '../../hooks/useCollaboration';
import { 
  WorkflowDefinition, 
  WorkflowStep, 
  WorkflowExecution, 
  DependencyGraph, 
  ConditionalLogic,
  WorkflowTemplate,
  WorkflowValidationResult,
  StepConfiguration,
  ConnectionRule,
  ExecutionContext,
  WorkflowVariable,
  TriggerDefinition,
  ActionDefinition,
  ConditionDefinition,
  LoopDefinition,
  BranchDefinition,
  WorkflowMetrics,
  ResourceRequirement,
  NotificationSettings,
  ApprovalSettings,
  ErrorHandlingSettings,
  RetryPolicy,
  TimeoutSettings,
  ParallelExecution,
  SequentialExecution,
  ConditionalExecution,
  WorkflowStatus,
  StepStatus,
  ExecutionHistory,
  PerformanceMetrics,
  ValidationRules,
  ComplianceRules,
  SecurityRules,
  QualityRules,
  BusinessRules
} from '../../types/orchestration.types';

// Drag and Drop Implementation
import { 
  DndContext, 
  DragEndEvent, 
  DragOverEvent, 
  DragStartEvent, 
  PointerSensor, 
  useSensor, 
  useSensors,
  closestCenter,
  closestCorners,
  rectIntersection,
  getFirstCollision,
  UniqueIdentifier,
  Over,
  Active
} from '@dnd-kit/core';
import { 
  SortableContext, 
  useSortable, 
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  rectSwappingStrategy,
  arrayMove 
} from '@dnd-kit/sortable';
import { 
  CSS 
} from '@dnd-kit/utilities';

// React Flow for Visual Workflow Design
import ReactFlow, { 
  Node, 
  Edge, 
  Background, 
  Controls, 
  MiniMap, 
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  Panel,
  NodeTypes,
  EdgeTypes,
  ConnectionMode,
  MarkerType,
  Position,
  Handle
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom Node Components
const WorkflowStartNode = ({ data, isConnectable }: any) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-gradient-to-r from-green-400 to-green-600 border border-green-300 text-white">
      <div className="flex items-center gap-2">
        <PlayCircle className="w-4 h-4" />
        <div className="font-bold text-sm">Start</div>
      </div>
      <div className="text-xs opacity-80">{data.label}</div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-white border border-green-300"
      />
    </div>
  );
};

const WorkflowActionNode = ({ data, isConnectable }: any) => {
  const isActive = data.status === 'running';
  const isCompleted = data.status === 'completed';
  const hasError = data.status === 'error';
  
  return (
    <div className={`px-4 py-2 shadow-md rounded-md border-2 min-w-[160px] ${
      hasError ? 'bg-red-50 border-red-300' :
      isCompleted ? 'bg-green-50 border-green-300' :
      isActive ? 'bg-blue-50 border-blue-300 animate-pulse' :
      'bg-white border-gray-300'
    }`}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-gray-400"
      />
      <div className="flex items-center gap-2 mb-1">
        {data.icon && <data.icon className="w-4 h-4" />}
        <div className="font-semibold text-sm">{data.label}</div>
        {isActive && <Activity className="w-3 h-3 text-blue-500 animate-spin" />}
        {isCompleted && <CheckCircle className="w-3 h-3 text-green-500" />}
        {hasError && <XCircle className="w-3 h-3 text-red-500" />}
      </div>
      <div className="text-xs text-gray-600">{data.description}</div>
      {data.progress !== undefined && (
        <Progress value={data.progress} className="mt-2 h-1" />
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-gray-400"
      />
    </div>
  );
};

const WorkflowDecisionNode = ({ data, isConnectable }: any) => {
  return (
    <div className="relative">
      <div className="px-4 py-2 shadow-md rounded-md bg-yellow-50 border-2 border-yellow-300 min-w-[140px] transform rotate-45">
        <div className="transform -rotate-45">
          <div className="flex items-center gap-2 mb-1">
            <GitBranch className="w-4 h-4" />
            <div className="font-semibold text-sm">{data.label}</div>
          </div>
          <div className="text-xs text-gray-600">{data.condition}</div>
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-gray-400"
        style={{ top: '-8px', left: '50%', transform: 'translateX(-50%)' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-green-400"
        id="true"
        style={{ top: '50%', right: '-8px', transform: 'translateY(-50%)' }}
      />
      <Handle
        type="source"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-red-400"
        id="false"
        style={{ top: '50%', left: '-8px', transform: 'translateY(-50%)' }}
      />
    </div>
  );
};

const WorkflowEndNode = ({ data, isConnectable }: any) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-gradient-to-r from-red-400 to-red-600 border border-red-300 text-white">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-white border border-red-300"
      />
      <div className="flex items-center gap-2">
        <StopCircle className="w-4 h-4" />
        <div className="font-bold text-sm">End</div>
      </div>
      <div className="text-xs opacity-80">{data.label}</div>
    </div>
  );
};

const WorkflowParallelNode = ({ data, isConnectable }: any) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-purple-50 border-2 border-purple-300 min-w-[160px]">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-gray-400"
      />
      <div className="flex items-center gap-2 mb-1">
        <Layers className="w-4 h-4" />
        <div className="font-semibold text-sm">{data.label}</div>
      </div>
      <div className="text-xs text-gray-600">Parallel Execution</div>
      <div className="flex justify-between mt-2">
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          className="w-2 h-2 bg-gray-400"
          id="branch1"
          style={{ left: '25%' }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          className="w-2 h-2 bg-gray-400"
          id="branch2"
          style={{ left: '75%' }}
        />
      </div>
    </div>
  );
};

const WorkflowLoopNode = ({ data, isConnectable }: any) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-indigo-50 border-2 border-indigo-300 min-w-[160px]">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-gray-400"
      />
      <div className="flex items-center gap-2 mb-1">
        <RotateCcw className="w-4 h-4" />
        <div className="font-semibold text-sm">{data.label}</div>
      </div>
      <div className="text-xs text-gray-600">{data.loopType}: {data.iterations}</div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-gray-400"
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-orange-400"
        id="loop"
        style={{ top: '50%', right: '-8px', transform: 'translateY(-50%)' }}
      />
    </div>
  );
};

// Custom Edge Components
const ConditionalEdge = ({ 
  id, 
  sourceX, 
  sourceY, 
  targetX, 
  targetY, 
  sourcePosition, 
  targetPosition, 
  style = {}, 
  data,
  markerEnd 
}: any) => {
  const edgePath = `M${sourceX},${sourceY} L${targetX},${targetY}`;
  const isTrue = data?.condition === 'true';
  
  return (
    <>
      <path
        id={id}
        style={{
          ...style,
          stroke: isTrue ? '#10b981' : '#ef4444',
          strokeWidth: 2,
          strokeDasharray: data?.condition ? '5,5' : 'none'
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {data?.label && (
        <text>
          <textPath href={`#${id}`} style={{ fontSize: 12 }} startOffset="50%" textAnchor="middle">
            {data.label}
          </textPath>
        </text>
      )}
    </>
  );
};

// Node Types Configuration
const nodeTypes: NodeTypes = {
  start: WorkflowStartNode,
  action: WorkflowActionNode,
  decision: WorkflowDecisionNode,
  end: WorkflowEndNode,
  parallel: WorkflowParallelNode,
  loop: WorkflowLoopNode,
};

// Edge Types Configuration
const edgeTypes: EdgeTypes = {
  conditional: ConditionalEdge,
};

// Main WorkflowDesigner Component
interface WorkflowDesignerProps {
  workflowId?: string;
  readOnly?: boolean;
  onSave?: (workflow: WorkflowDefinition) => void;
  onExecute?: (workflow: WorkflowDefinition) => void;
  onValidate?: (workflow: WorkflowDefinition) => Promise<WorkflowValidationResult>;
}

const WorkflowDesigner: React.FC<WorkflowDesignerProps> = ({
  workflowId,
  readOnly = false,
  onSave,
  onExecute,
  onValidate
}) => {
  // Hooks
  const { 
    workflows, 
    currentWorkflow, 
    isLoading, 
    error,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    validateWorkflow,
    executeWorkflow,
    getWorkflowHistory,
    getWorkflowMetrics,
    getWorkflowTemplates,
    cloneWorkflow,
    exportWorkflow,
    importWorkflow
  } = useOrchestration();

  const {
    validateWorkflowStructure,
    validateWorkflowLogic,
    validateWorkflowPerformance,
    validateWorkflowSecurity,
    validateWorkflowCompliance
  } = useValidation();

  const {
    shareWorkflow,
    reviewWorkflow,
    commentOnWorkflow,
    approveWorkflow
  } = useCollaboration();

  // State Management
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [workflowSettings, setWorkflowSettings] = useState<Partial<WorkflowDefinition>>({
    name: 'New Workflow',
    description: '',
    version: '1.0.0',
    tags: [],
    variables: [],
    triggers: [],
    notifications: [],
    approvals: [],
    errorHandling: {
      retryPolicy: { maxRetries: 3, backoffStrategy: 'exponential' },
      timeoutSettings: { stepTimeout: 300, workflowTimeout: 3600 },
      errorActions: []
    }
  });

  const [isExecuting, setIsExecuting] = useState(false);
  const [executionHistory, setExecutionHistory] = useState<ExecutionHistory[]>([]);
  const [validationResults, setValidationResults] = useState<WorkflowValidationResult | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [draggedNodeType, setDraggedNodeType] = useState<string | null>(null);
  const [isSnapToGrid, setIsSnapToGrid] = useState(true);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [showBackground, setShowBackground] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('designer');

  // React Flow Instance
  const reactFlowInstance = useReactFlow();

  // Drag and Drop Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Available Node Types for Palette
  const nodeTypePalette = [
    { type: 'start', label: 'Start', icon: PlayCircle, description: 'Workflow start point' },
    { type: 'action', label: 'Action', icon: Zap, description: 'Execute an action' },
    { type: 'decision', label: 'Decision', icon: GitBranch, description: 'Conditional branching' },
    { type: 'parallel', label: 'Parallel', icon: Layers, description: 'Parallel execution' },
    { type: 'loop', label: 'Loop', icon: RotateCcw, description: 'Iterative execution' },
    { type: 'end', label: 'End', icon: StopCircle, description: 'Workflow end point' },
  ];

  // Action Templates
  const actionTemplates = [
    { 
      id: 'scan-rule', 
      label: 'Execute Scan Rule', 
      icon: Scan, 
      category: 'scanning',
      description: 'Execute a specific scan rule',
      parameters: ['ruleId', 'dataSource', 'options']
    },
    { 
      id: 'validate-data', 
      label: 'Validate Data', 
      icon: CheckCircle, 
      category: 'validation',
      description: 'Validate data quality',
      parameters: ['validationRules', 'threshold', 'action']
    },
    { 
      id: 'classify-data', 
      label: 'Classify Data', 
      icon: Tag, 
      category: 'classification',
      description: 'Apply data classification',
      parameters: ['classificationRules', 'confidence', 'overwrite']
    },
    { 
      id: 'send-notification', 
      label: 'Send Notification', 
      icon: Bell, 
      category: 'notification',
      description: 'Send notification to users',
      parameters: ['recipients', 'message', 'priority']
    },
    { 
      id: 'generate-report', 
      label: 'Generate Report', 
      icon: FileText, 
      category: 'reporting',
      description: 'Generate custom report',
      parameters: ['template', 'data', 'format']
    },
    { 
      id: 'api-call', 
      label: 'API Call', 
      icon: Network, 
      category: 'integration',
      description: 'Call external API',
      parameters: ['endpoint', 'method', 'headers', 'body']
    },
    { 
      id: 'wait-approval', 
      label: 'Wait for Approval', 
      icon: Clock, 
      category: 'approval',
      description: 'Wait for user approval',
      parameters: ['approvers', 'timeout', 'escalation']
    },
    { 
      id: 'transform-data', 
      label: 'Transform Data', 
      icon: Code, 
      category: 'transformation',
      description: 'Transform data using script',
      parameters: ['script', 'input', 'output']
    }
  ];

  // Load workflow on mount
  useEffect(() => {
    if (workflowId && currentWorkflow?.id === workflowId) {
      loadWorkflowToCanvas(currentWorkflow);
    }
  }, [workflowId, currentWorkflow]);

  // Load workflow data to canvas
  const loadWorkflowToCanvas = useCallback((workflow: WorkflowDefinition) => {
    const workflowNodes: Node[] = workflow.steps.map((step, index) => ({
      id: step.id,
      type: step.type,
      position: step.position || { x: 100 + (index % 5) * 200, y: 100 + Math.floor(index / 5) * 150 },
      data: {
        label: step.name,
        description: step.description,
        icon: getStepIcon(step.type),
        status: step.status,
        progress: step.progress,
        ...step.configuration
      }
    }));

    const workflowEdges: Edge[] = workflow.dependencies.map((dep, index) => ({
      id: `edge-${index}`,
      source: dep.sourceStepId,
      target: dep.targetStepId,
      type: dep.type || 'default',
      data: {
        label: dep.label,
        condition: dep.condition
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
      }
    }));

    setNodes(workflowNodes);
    setEdges(workflowEdges);
    setWorkflowSettings(workflow);
  }, [setNodes, setEdges]);

  // Get step icon based on type
  const getStepIcon = (type: string) => {
    const iconMap: { [key: string]: any } = {
      'scan-rule': Scan,
      'validate-data': CheckCircle,
      'classify-data': Tag,
      'send-notification': Bell,
      'generate-report': FileText,
      'api-call': Network,
      'wait-approval': Clock,
      'transform-data': Code,
      'start': PlayCircle,
      'end': StopCircle,
      'decision': GitBranch,
      'parallel': Layers,
      'loop': RotateCcw,
      'action': Zap
    };
    return iconMap[type] || Zap;
  };

  // Handle connection between nodes
  const onConnect = useCallback((params: any) => {
    const newEdge = {
      ...params,
      type: 'conditional',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
      }
    };
    setEdges((eds) => addEdge(newEdge, eds));
  }, [setEdges]);

  // Handle node drag end
  const onNodeDragStop = useCallback((event: any, node: Node) => {
    console.log('Node dragged:', node);
  }, []);

  // Handle node selection
  const onNodeClick = useCallback((event: any, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  // Handle edge selection
  const onEdgeClick = useCallback((event: any, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  // Add new node to canvas
  const addNodeToCanvas = useCallback((nodeType: string, position?: { x: number; y: number }) => {
    const id = `${nodeType}-${Date.now()}`;
    const newNode: Node = {
      id,
      type: nodeType === 'start' || nodeType === 'end' || nodeType === 'decision' || nodeType === 'parallel' || nodeType === 'loop' ? nodeType : 'action',
      position: position || { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data: {
        label: `New ${nodeType}`,
        description: `New ${nodeType} step`,
        icon: getStepIcon(nodeType),
        status: 'idle',
        ...getDefaultNodeData(nodeType)
      }
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedNode(newNode);
  }, [setNodes]);

  // Get default data for node type
  const getDefaultNodeData = (nodeType: string) => {
    const template = actionTemplates.find(t => t.id === nodeType);
    if (template) {
      return {
        actionType: nodeType,
        category: template.category,
        parameters: template.parameters.reduce((acc: any, param: string) => {
          acc[param] = '';
          return acc;
        }, {})
      };
    }
    return {};
  };

  // Delete selected node or edge
  const deleteSelected = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
      setSelectedNode(null);
    }
    if (selectedEdge) {
      setEdges((eds) => eds.filter((e) => e.id !== selectedEdge.id));
      setSelectedEdge(null);
    }
  }, [selectedNode, selectedEdge, setNodes, setEdges]);

  // Update node data
  const updateNodeData = useCallback((nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      )
    );
  }, [setNodes]);

  // Update edge data
  const updateEdgeData = useCallback((edgeId: string, data: any) => {
    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === edgeId
          ? { ...edge, data: { ...edge.data, ...data } }
          : edge
      )
    );
  }, [setEdges]);

  // Save workflow
  const handleSave = useCallback(async () => {
    const workflowData: WorkflowDefinition = {
      ...workflowSettings,
      id: workflowId || `workflow-${Date.now()}`,
      steps: nodes.map((node) => ({
        id: node.id,
        name: node.data.label,
        description: node.data.description,
        type: node.data.actionType || node.type,
        position: node.position,
        configuration: node.data,
        status: node.data.status || 'idle',
        progress: node.data.progress || 0
      })),
      dependencies: edges.map((edge) => ({
        id: edge.id,
        sourceStepId: edge.source,
        targetStepId: edge.target,
        type: edge.type || 'default',
        condition: edge.data?.condition,
        label: edge.data?.label
      }))
    };

    try {
      if (workflowId) {
        await updateWorkflow(workflowId, workflowData);
      } else {
        await createWorkflow(workflowData);
      }
      onSave?.(workflowData);
    } catch (error) {
      console.error('Failed to save workflow:', error);
    }
  }, [workflowSettings, nodes, edges, workflowId, updateWorkflow, createWorkflow, onSave]);

  // Validate workflow
  const handleValidate = useCallback(async () => {
    const workflowData: WorkflowDefinition = {
      ...workflowSettings,
      id: workflowId || `workflow-${Date.now()}`,
      steps: nodes.map((node) => ({
        id: node.id,
        name: node.data.label,
        description: node.data.description,
        type: node.data.actionType || node.type,
        position: node.position,
        configuration: node.data,
        status: node.data.status || 'idle',
        progress: node.data.progress || 0
      })),
      dependencies: edges.map((edge) => ({
        id: edge.id,
        sourceStepId: edge.source,
        targetStepId: edge.target,
        type: edge.type || 'default',
        condition: edge.data?.condition,
        label: edge.data?.label
      }))
    };

    try {
      const results = await Promise.all([
        validateWorkflowStructure(workflowData),
        validateWorkflowLogic(workflowData),
        validateWorkflowPerformance(workflowData),
        validateWorkflowSecurity(workflowData),
        validateWorkflowCompliance(workflowData)
      ]);

      const combinedResults: WorkflowValidationResult = {
        isValid: results.every(r => r.isValid),
        errors: results.flatMap(r => r.errors || []),
        warnings: results.flatMap(r => r.warnings || []),
        suggestions: results.flatMap(r => r.suggestions || []),
        structureValidation: results[0],
        logicValidation: results[1],
        performanceValidation: results[2],
        securityValidation: results[3],
        complianceValidation: results[4]
      };

      setValidationResults(combinedResults);
      setShowValidation(true);
      onValidate?.(workflowData);
    } catch (error) {
      console.error('Failed to validate workflow:', error);
    }
  }, [
    workflowSettings, 
    nodes, 
    edges, 
    workflowId,
    validateWorkflowStructure,
    validateWorkflowLogic,
    validateWorkflowPerformance,
    validateWorkflowSecurity,
    validateWorkflowCompliance,
    onValidate
  ]);

  // Execute workflow
  const handleExecute = useCallback(async () => {
    const workflowData: WorkflowDefinition = {
      ...workflowSettings,
      id: workflowId || `workflow-${Date.now()}`,
      steps: nodes.map((node) => ({
        id: node.id,
        name: node.data.label,
        description: node.data.description,
        type: node.data.actionType || node.type,
        position: node.position,
        configuration: node.data,
        status: node.data.status || 'idle',
        progress: node.data.progress || 0
      })),
      dependencies: edges.map((edge) => ({
        id: edge.id,
        sourceStepId: edge.source,
        targetStepId: edge.target,
        type: edge.type || 'default',
        condition: edge.data?.condition,
        label: edge.data?.label
      }))
    };

    try {
      setIsExecuting(true);
      await executeWorkflow(workflowData.id!, {});
      onExecute?.(workflowData);
    } catch (error) {
      console.error('Failed to execute workflow:', error);
    } finally {
      setIsExecuting(false);
    }
  }, [workflowSettings, nodes, edges, workflowId, executeWorkflow, onExecute]);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setSelectedEdge(null);
  }, [setNodes, setEdges]);

  // Auto-layout workflow
  const autoLayout = useCallback(() => {
    // Simple auto-layout algorithm
    const layoutedNodes = nodes.map((node, index) => ({
      ...node,
      position: {
        x: 100 + (index % 5) * 200,
        y: 100 + Math.floor(index / 5) * 150
      }
    }));
    setNodes(layoutedNodes);
  }, [nodes, setNodes]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 's':
            event.preventDefault();
            handleSave();
            break;
          case 'v':
            event.preventDefault();
            handleValidate();
            break;
          case 'r':
            event.preventDefault();
            handleExecute();
            break;
          case 'l':
            event.preventDefault();
            autoLayout();
            break;
          case 'Delete':
          case 'Backspace':
            event.preventDefault();
            deleteSelected();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleValidate, handleExecute, autoLayout, deleteSelected]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading workflow designer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <GitBranch className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold">Workflow Designer</h1>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <Input
                placeholder="Workflow name..."
                value={workflowSettings.name}
                onChange={(e) => setWorkflowSettings(prev => ({ ...prev, name: e.target.value }))}
                className="w-64"
              />
              <Badge variant={isExecuting ? "secondary" : "outline"}>
                {isExecuting ? 'Running' : 'Draft'}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={clearCanvas}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <Button variant="outline" size="sm" onClick={autoLayout}>
              <Target className="w-4 h-4 mr-2" />
              Auto Layout
            </Button>
            <Button variant="outline" size="sm" onClick={handleValidate}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Validate
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button 
              size="sm" 
              onClick={handleExecute}
              disabled={isExecuting || nodes.length === 0}
            >
              {isExecuting ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Execute
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Node Palette */}
        <div className="w-80 bg-white border-r border-gray-200 p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="palette">Palette</TabsTrigger>
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="palette" className="mt-4 h-full">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Basic Nodes</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {nodeTypePalette.map((nodeType) => (
                        <TooltipProvider key={nodeType.type}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-16 flex flex-col gap-1"
                                onClick={() => addNodeToCanvas(nodeType.type)}
                              >
                                <nodeType.icon className="w-5 h-5" />
                                <span className="text-xs">{nodeType.label}</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{nodeType.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-medium mb-2">Action Templates</h3>
                    <div className="space-y-2">
                      {actionTemplates.map((template) => (
                        <Card 
                          key={template.id} 
                          className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => addNodeToCanvas(template.id)}
                        >
                          <div className="flex items-center gap-2">
                            <template.icon className="w-4 h-4" />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{template.label}</div>
                              <div className="text-xs text-gray-500">{template.description}</div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="properties" className="mt-4 h-full">
              <ScrollArea className="h-full">
                {selectedNode ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Node Properties</h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="node-name">Name</Label>
                          <Input
                            id="node-name"
                            value={selectedNode.data.label || ''}
                            onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="node-description">Description</Label>
                          <Textarea
                            id="node-description"
                            value={selectedNode.data.description || ''}
                            onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
                            rows={3}
                          />
                        </div>
                        {selectedNode.data.actionType && (
                          <div>
                            <Label>Action Type</Label>
                            <Select
                              value={selectedNode.data.actionType}
                              onValueChange={(value) => updateNodeData(selectedNode.id, { actionType: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {actionTemplates.map((template) => (
                                  <SelectItem key={template.id} value={template.id}>
                                    {template.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        {selectedNode.data.parameters && (
                          <div>
                            <Label>Parameters</Label>
                            <div className="space-y-2 mt-2">
                              {Object.entries(selectedNode.data.parameters).map(([key, value]) => (
                                <div key={key}>
                                  <Label className="text-xs">{key}</Label>
                                  <Input
                                    value={value as string || ''}
                                    onChange={(e) => updateNodeData(selectedNode.id, {
                                      parameters: { ...selectedNode.data.parameters, [key]: e.target.value }
                                    })}
                                    placeholder={`Enter ${key}...`}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : selectedEdge ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Edge Properties</h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="edge-label">Label</Label>
                          <Input
                            id="edge-label"
                            value={selectedEdge.data?.label || ''}
                            onChange={(e) => updateEdgeData(selectedEdge.id, { label: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edge-condition">Condition</Label>
                          <Input
                            id="edge-condition"
                            value={selectedEdge.data?.condition || ''}
                            onChange={(e) => updateEdgeData(selectedEdge.id, { condition: e.target.value })}
                            placeholder="e.g., status === 'success'"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 mt-8">
                    <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a node or edge to edit properties</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="settings" className="mt-4 h-full">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Workflow Settings</h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="workflow-version">Version</Label>
                        <Input
                          id="workflow-version"
                          value={workflowSettings.version || ''}
                          onChange={(e) => setWorkflowSettings(prev => ({ ...prev, version: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="workflow-description">Description</Label>
                        <Textarea
                          id="workflow-description"
                          value={workflowSettings.description || ''}
                          onChange={(e) => setWorkflowSettings(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="workflow-tags">Tags</Label>
                        <Input
                          id="workflow-tags"
                          value={workflowSettings.tags?.join(', ') || ''}
                          onChange={(e) => setWorkflowSettings(prev => ({ 
                            ...prev, 
                            tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                          }))}
                          placeholder="tag1, tag2, tag3"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-medium mb-2">Execution Settings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="parallel-execution"
                          checked={workflowSettings.allowParallelExecution || false}
                          onCheckedChange={(checked) => setWorkflowSettings(prev => ({ 
                            ...prev, 
                            allowParallelExecution: checked 
                          }))}
                        />
                        <Label htmlFor="parallel-execution">Allow Parallel Execution</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="auto-retry"
                          checked={workflowSettings.errorHandling?.retryPolicy?.maxRetries > 0 || false}
                          onCheckedChange={(checked) => setWorkflowSettings(prev => ({ 
                            ...prev,
                            errorHandling: {
                              ...prev.errorHandling,
                              retryPolicy: {
                                ...prev.errorHandling?.retryPolicy,
                                maxRetries: checked ? 3 : 0
                              }
                            }
                          }))}
                        />
                        <Label htmlFor="auto-retry">Auto Retry on Failure</Label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-medium mb-2">Canvas Settings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="snap-to-grid"
                          checked={isSnapToGrid}
                          onCheckedChange={setIsSnapToGrid}
                        />
                        <Label htmlFor="snap-to-grid">Snap to Grid</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="show-minimap"
                          checked={showMiniMap}
                          onCheckedChange={setShowMiniMap}
                        />
                        <Label htmlFor="show-minimap">Show Mini Map</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="show-background"
                          checked={showBackground}
                          onCheckedChange={setShowBackground}
                        />
                        <Label htmlFor="show-background">Show Background</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Workflow Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            connectionMode={ConnectionMode.Loose}
            snapToGrid={isSnapToGrid}
            snapGrid={[15, 15]}
            fitView
            className="bg-gray-100"
          >
            {showBackground && <Background color="#aaa" gap={16} />}
            <Controls />
            {showMiniMap && <MiniMap />}
            
            <Panel position="top-right" className="bg-white rounded-lg shadow-sm border p-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMiniMap(!showMiniMap)}
                >
                  {showMiniMap ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBackground(!showBackground)}
                >
                  <Target className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => reactFlowInstance.fitView()}
                >
                  <Maximize className="w-4 h-4" />
                </Button>
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>

      {/* Validation Results Dialog */}
      <Dialog open={showValidation} onOpenChange={setShowValidation}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Workflow Validation Results</DialogTitle>
            <DialogDescription>
              Review validation results for your workflow
            </DialogDescription>
          </DialogHeader>
          
          {validationResults && (
            <ScrollArea className="h-96">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {validationResults.isValid ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    {validationResults.isValid ? 'Workflow is valid' : 'Workflow has validation issues'}
                  </span>
                </div>

                {validationResults.errors && validationResults.errors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-700 mb-2">Errors</h4>
                    <div className="space-y-2">
                      {validationResults.errors.map((error, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                          <span>{error}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {validationResults.warnings && validationResults.warnings.length > 0 && (
                  <div>
                    <h4 className="font-medium text-yellow-700 mb-2">Warnings</h4>
                    <div className="space-y-2">
                      {validationResults.warnings.map((warning, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                          <span>{warning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {validationResults.suggestions && validationResults.suggestions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-blue-700 mb-2">Suggestions</h4>
                    <div className="space-y-2">
                      {validationResults.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                          <span>{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 max-w-md">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <div className="font-medium text-red-800">Error</div>
                  <div className="text-sm text-red-600">{error}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WorkflowDesigner;