'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Workflow, Play, Pause, Square, SkipForward, RotateCcw, Save, Download, Upload, Copy, Trash2, Edit3, Settings, Plus, Minus, ZoomIn, ZoomOut, Maximize2, Minimize2, Grid, Move, CornerDownRight, ArrowRight, ArrowDown, ArrowUp, ArrowLeft, Circle, Diamond, Triangle, Star, Database, Search, Filter, Eye, EyeOff, Lock, Unlock, Clock, AlertTriangle, CheckCircle, XCircle, Info, Zap, Target, Layers, GitBranch, GitCommit, GitMerge, Code, Terminal, FileText, FolderOpen, Package, Cpu, HardDrive, Activity, TrendingUp, BarChart3, PieChart, LineChart, Users, User, Shield, Key, Globe, Monitor, Smartphone, Server, Cloud, Wifi, Link2, Unlink2, RefreshCw, MoreHorizontal, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, X, Check, FastForward, Rewind, Volume2, VolumeX, Mic, Camera, Image, Video, Music, Headphones } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

// Racine System Imports
import { useJobWorkflow } from '../../hooks/useJobWorkflow';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useActivityTracker } from '../../hooks/useActivityTracker';

// Types
import { 
  WorkflowDefinition,
  WorkflowStep,
  WorkflowConnection,
  WorkflowExecution,
  WorkflowTemplate,
  StepConfiguration,
  ValidationResult,
  ExecutionStatus,
  WorkflowNode,
  NodeType,
  ConnectionType,
  CanvasPosition,
  WorkflowMetrics,
  WorkflowVariable,
  ParameterBinding,
  ConditionalExpression,
  RetryPolicy,
  TimeoutPolicy,
  ResourceRequirements,
  WorkflowSchedule,
  TriggerDefinition
} from '../../types/job-workflow.types';

import {
  SPAIntegration,
  CrossGroupWorkflow,
  SystemHealth,
  UserPermissions
} from '../../types/racine-core.types';

// Utilities
import {
  validateWorkflowStructure,
  optimizeWorkflowPath,
  generateWorkflowCode,
  parseWorkflowJSON,
  calculateWorkflowMetrics,
  detectWorkflowCycles,
  suggestWorkflowOptimizations
} from '../../utils/job-workflow-utils';

import {
  coordinateWorkflowExecution,
  validateCrossGroupOperation,
  optimizeResourceAllocation
} from '../../utils/cross-group-orchestrator';

// Constants
import {
  WORKFLOW_NODE_TYPES,
  WORKFLOW_TEMPLATES,
  CANVAS_CONFIG,
  EXECUTION_CONFIG,
  VALIDATION_RULES
} from '../../constants/job-workflow-constants';

interface JobWorkflowBuilderProps {
  className?: string;
  initialWorkflow?: Partial<WorkflowDefinition>;
  onWorkflowChange?: (workflow: WorkflowDefinition) => void;
  onWorkflowExecute?: (workflow: WorkflowDefinition) => void;
  onWorkflowSave?: (workflow: WorkflowDefinition) => void;
  readOnly?: boolean;
  showToolbar?: boolean;
  showMinimap?: boolean;
}

interface WorkflowCanvasProps {
  workflow: WorkflowDefinition;
  selectedNode: string | null;
  onNodeSelect: (nodeId: string | null) => void;
  onNodeMove: (nodeId: string, position: CanvasPosition) => void;
  onNodeConnect: (sourceId: string, targetId: string, connectionType: ConnectionType) => void;
  onNodeDelete: (nodeId: string) => void;
  onCanvasClick: (position: CanvasPosition) => void;
  zoom: number;
  panOffset: CanvasPosition;
  onPanChange: (offset: CanvasPosition) => void;
  isExecuting: boolean;
  executionStatus: Map<string, ExecutionStatus>;
}

interface NodePaletteProps {
  onNodeCreate: (nodeType: NodeType, position: CanvasPosition) => void;
  availableNodeTypes: NodeType[];
  spaIntegrations: SPAIntegration[];
}

interface PropertiesPanelProps {
  selectedNode: WorkflowNode | null;
  onNodeUpdate: (nodeId: string, updates: Partial<WorkflowNode>) => void;
  workflow: WorkflowDefinition;
  validationResults: ValidationResult[];
}

interface ExecutionPanelProps {
  workflow: WorkflowDefinition;
  execution: WorkflowExecution | null;
  onExecutionStart: () => void;
  onExecutionStop: () => void;
  onExecutionPause: () => void;
  onExecutionResume: () => void;
  metrics: WorkflowMetrics | null;
}

interface WorkflowToolbarProps {
  workflow: WorkflowDefinition;
  onSave: () => void;
  onLoad: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onGridToggle: () => void;
  onValidate: () => void;
  canUndo: boolean;
  canRedo: boolean;
  validationResults: ValidationResult[];
}

interface MinimapProps {
  workflow: WorkflowDefinition;
  canvasBounds: DOMRect;
  viewportBounds: DOMRect;
  onViewportChange: (bounds: DOMRect) => void;
}

export const JobWorkflowBuilder: React.FC<JobWorkflowBuilderProps> = ({
  className = "",
  initialWorkflow,
  onWorkflowChange,
  onWorkflowExecute,
  onWorkflowSave,
  readOnly = false,
  showToolbar = true,
  showMinimap = true
}) => {
  // Hooks
  const {
    workflow,
    execution,
    templates,
    validationResults,
    metrics,
    createWorkflow,
    updateWorkflow,
    executeWorkflow,
    stopExecution,
    pauseExecution,
    resumeExecution,
    validateWorkflow,
    saveWorkflow,
    loadWorkflow,
    exportWorkflow,
    importWorkflow,
    cloneWorkflow,
    deleteWorkflow,
    optimizeWorkflow,
    isExecuting,
    error
  } = useJobWorkflow(initialWorkflow);

  const {
    systemHealth,
    orchestrateWorkflow,
    monitorExecution,
    optimizeResources
  } = useRacineOrchestration();

  const {
    activeSPAContext,
    spaIntegrations,
    coordinateNavigation,
    getAllSPAStatus
  } = useCrossGroupIntegration();

  const {
    currentUser,
    userPermissions,
    hasPermission
  } = useUserManagement();

  const {
    activeWorkspace,
    workspaceContext
  } = useWorkspaceManagement();

  const {
    trackActivity
  } = useActivityTracker();

  // State
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState<CanvasPosition>({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [draggedNodeType, setDraggedNodeType] = useState<NodeType | null>(null);
  const [connectionMode, setConnectionMode] = useState(false);
  const [sourceNodeId, setSourceNodeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'canvas' | 'code' | 'execution' | 'templates'>('canvas');
  const [undoStack, setUndoStack] = useState<WorkflowDefinition[]>([]);
  const [redoStack, setRedoStack] = useState<WorkflowDefinition[]>([]);
  const [executionStatus, setExecutionStatus] = useState<Map<string, ExecutionStatus>>(new Map());
  const [isValidating, setIsValidating] = useState(false);
  const [showNodeDetails, setShowNodeDetails] = useState(true);
  const [canvasSize, setCanvasSize] = useState({ width: 5000, height: 3000 });
  const [viewportBounds, setViewportBounds] = useState<DOMRect | null>(null);

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Computed Values
  const selectedNodeData = useMemo(() => {
    return selectedNode ? workflow?.nodes?.find(node => node.id === selectedNode) : null;
  }, [selectedNode, workflow?.nodes]);

  const availableNodeTypes = useMemo(() => {
    const baseTypes = Object.values(WORKFLOW_NODE_TYPES);
    const spaTypes = spaIntegrations.map(spa => ({
      id: `spa_${spa.id}`,
      name: `${spa.name} Action`,
      category: 'spa-integration',
      icon: spa.icon,
      description: `Execute action in ${spa.name} SPA`,
      inputs: spa.inputs || [],
      outputs: spa.outputs || [],
      configuration: spa.configuration || {}
    }));
    return [...baseTypes, ...spaTypes];
  }, [spaIntegrations]);

  const workflowMetrics = useMemo(() => {
    if (!workflow) return null;
    return calculateWorkflowMetrics(workflow);
  }, [workflow]);

  const canExecute = useMemo(() => {
    return (
      workflow && 
      workflow.nodes && 
      workflow.nodes.length > 0 && 
      validationResults.every(result => result.level !== 'error') &&
      hasPermission('workflow:execute') &&
      !readOnly
    );
  }, [workflow, validationResults, hasPermission, readOnly]);

  const canModify = useMemo(() => {
    return hasPermission('workflow:edit') && !readOnly;
  }, [hasPermission, readOnly]);

  // Effects
  useEffect(() => {
    if (workflow && onWorkflowChange) {
      onWorkflowChange(workflow);
    }
  }, [workflow, onWorkflowChange]);

  useEffect(() => {
    if (execution) {
      const statusMap = new Map<string, ExecutionStatus>();
      execution.stepExecutions?.forEach(stepExecution => {
        statusMap.set(stepExecution.stepId, stepExecution.status);
      });
      setExecutionStatus(statusMap);
    }
  }, [execution]);

  useEffect(() => {
    // Auto-validate workflow when it changes
    if (workflow && workflow.nodes && workflow.nodes.length > 0) {
      const timeoutId = setTimeout(() => {
        setIsValidating(true);
        validateWorkflow().finally(() => setIsValidating(false));
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [workflow, validateWorkflow]);

  // Handlers
  const handleNodeCreate = useCallback((nodeType: NodeType, position: CanvasPosition) => {
    if (!canModify) return;

    const newNode: WorkflowNode = {
      id: crypto.randomUUID(),
      type: nodeType.id,
      name: nodeType.name,
      description: nodeType.description || '',
      position,
      configuration: { ...nodeType.configuration },
      inputs: [...(nodeType.inputs || [])],
      outputs: [...(nodeType.outputs || [])],
      status: 'idle',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save current state for undo
    if (workflow) {
      setUndoStack(prev => [...prev.slice(-19), workflow]);
      setRedoStack([]);
    }

    const updatedWorkflow = {
      ...workflow,
      nodes: [...(workflow?.nodes || []), newNode],
      updatedAt: new Date()
    } as WorkflowDefinition;

    updateWorkflow(updatedWorkflow);

    trackActivity({
      type: 'workflow_node_created',
      details: {
        nodeId: newNode.id,
        nodeType: nodeType.id,
        workflowId: workflow?.id
      }
    });
  }, [canModify, workflow, updateWorkflow, trackActivity]);

  const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<WorkflowNode>) => {
    if (!canModify || !workflow) return;

    // Save current state for undo
    setUndoStack(prev => [...prev.slice(-19), workflow]);
    setRedoStack([]);

    const updatedWorkflow = {
      ...workflow,
      nodes: workflow.nodes?.map(node => 
        node.id === nodeId 
          ? { ...node, ...updates, updatedAt: new Date() }
          : node
      ) || [],
      updatedAt: new Date()
    };

    updateWorkflow(updatedWorkflow);

    trackActivity({
      type: 'workflow_node_updated',
      details: {
        nodeId,
        updates: Object.keys(updates),
        workflowId: workflow.id
      }
    });
  }, [canModify, workflow, updateWorkflow, trackActivity]);

  const handleNodeDelete = useCallback((nodeId: string) => {
    if (!canModify || !workflow) return;

    // Save current state for undo
    setUndoStack(prev => [...prev.slice(-19), workflow]);
    setRedoStack([]);

    const updatedWorkflow = {
      ...workflow,
      nodes: workflow.nodes?.filter(node => node.id !== nodeId) || [],
      connections: workflow.connections?.filter(conn => 
        conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId
      ) || [],
      updatedAt: new Date()
    };

    updateWorkflow(updatedWorkflow);

    if (selectedNode === nodeId) {
      setSelectedNode(null);
    }

    trackActivity({
      type: 'workflow_node_deleted',
      details: {
        nodeId,
        workflowId: workflow.id
      }
    });
  }, [canModify, workflow, updateWorkflow, selectedNode, trackActivity]);

  const handleNodeConnect = useCallback((sourceId: string, targetId: string, connectionType: ConnectionType = 'success') => {
    if (!canModify || !workflow) return;

    // Check if connection already exists
    const existingConnection = workflow.connections?.find(conn => 
      conn.sourceNodeId === sourceId && conn.targetNodeId === targetId
    );

    if (existingConnection) return;

    // Save current state for undo
    setUndoStack(prev => [...prev.slice(-19), workflow]);
    setRedoStack([]);

    const newConnection: WorkflowConnection = {
      id: crypto.randomUUID(),
      sourceNodeId: sourceId,
      targetNodeId: targetId,
      type: connectionType,
      condition: connectionType === 'conditional' ? '' : undefined,
      createdAt: new Date()
    };

    const updatedWorkflow = {
      ...workflow,
      connections: [...(workflow.connections || []), newConnection],
      updatedAt: new Date()
    };

    updateWorkflow(updatedWorkflow);

    trackActivity({
      type: 'workflow_connection_created',
      details: {
        sourceNodeId: sourceId,
        targetNodeId: targetId,
        connectionType,
        workflowId: workflow.id
      }
    });
  }, [canModify, workflow, updateWorkflow, trackActivity]);

  const handleNodeMove = useCallback((nodeId: string, position: CanvasPosition) => {
    if (!canModify || !workflow) return;

    // Debounce undo stack updates for moves
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }

    undoTimeoutRef.current = setTimeout(() => {
      setUndoStack(prev => [...prev.slice(-19), workflow]);
      setRedoStack([]);
    }, 1000);

    const updatedWorkflow = {
      ...workflow,
      nodes: workflow.nodes?.map(node => 
        node.id === nodeId 
          ? { ...node, position, updatedAt: new Date() }
          : node
      ) || [],
      updatedAt: new Date()
    };

    updateWorkflow(updatedWorkflow);
  }, [canModify, workflow, updateWorkflow]);

  const handleExecutionStart = useCallback(async () => {
    if (!canExecute || !workflow) return;

    try {
      const execution = await executeWorkflow(workflow.id);
      
      if (onWorkflowExecute) {
        onWorkflowExecute(workflow);
      }

      trackActivity({
        type: 'workflow_execution_started',
        details: {
          workflowId: workflow.id,
          executionId: execution.id
        }
      });
    } catch (error) {
      console.error('Failed to start workflow execution:', error);
    }
  }, [canExecute, workflow, executeWorkflow, onWorkflowExecute, trackActivity]);

  const handleExecutionStop = useCallback(async () => {
    if (!execution) return;

    try {
      await stopExecution(execution.id);
      
      trackActivity({
        type: 'workflow_execution_stopped',
        details: {
          workflowId: workflow?.id,
          executionId: execution.id
        }
      });
    } catch (error) {
      console.error('Failed to stop workflow execution:', error);
    }
  }, [execution, stopExecution, workflow?.id, trackActivity]);

  const handleSave = useCallback(async () => {
    if (!workflow || !canModify) return;

    try {
      await saveWorkflow(workflow);
      
      if (onWorkflowSave) {
        onWorkflowSave(workflow);
      }

      trackActivity({
        type: 'workflow_saved',
        details: {
          workflowId: workflow.id
        }
      });
    } catch (error) {
      console.error('Failed to save workflow:', error);
    }
  }, [workflow, canModify, saveWorkflow, onWorkflowSave, trackActivity]);

  const handleExport = useCallback(() => {
    if (!workflow) return;

    try {
      const workflowJson = JSON.stringify(workflow, null, 2);
      const blob = new Blob([workflowJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${workflow.name || 'workflow'}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

      trackActivity({
        type: 'workflow_exported',
        details: {
          workflowId: workflow.id
        }
      });
    } catch (error) {
      console.error('Failed to export workflow:', error);
    }
  }, [workflow, trackActivity]);

  const handleImport = useCallback((file: File) => {
    if (!canModify) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const workflowData = JSON.parse(e.target?.result as string);
        const importedWorkflow = await importWorkflow(workflowData);
        
        trackActivity({
          type: 'workflow_imported',
          details: {
            workflowId: importedWorkflow.id,
            fileName: file.name
          }
        });
      } catch (error) {
        console.error('Failed to import workflow:', error);
      }
    };
    reader.readAsText(file);
  }, [canModify, importWorkflow, trackActivity]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0 || !canModify) return;

    const previousWorkflow = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    
    if (workflow) {
      setRedoStack(prev => [...prev, workflow]);
    }

    updateWorkflow(previousWorkflow);
  }, [undoStack, canModify, workflow, updateWorkflow]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0 || !canModify) return;

    const nextWorkflow = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    
    if (workflow) {
      setUndoStack(prev => [...prev, workflow]);
    }

    updateWorkflow(nextWorkflow);
  }, [redoStack, canModify, workflow, updateWorkflow]);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.1, 0.1));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const handleCanvasClick = useCallback((position: CanvasPosition) => {
    if (draggedNodeType) {
      handleNodeCreate(draggedNodeType, position);
      setDraggedNodeType(null);
    } else {
      setSelectedNode(null);
    }
  }, [draggedNodeType, handleNodeCreate]);

  // Render Methods
  const renderToolbar = () => showToolbar && (
    <WorkflowToolbar
      workflow={workflow}
      onSave={handleSave}
      onLoad={() => fileInputRef.current?.click()}
      onExport={handleExport}
      onImport={handleImport}
      onUndo={handleUndo}
      onRedo={handleRedo}
      onZoomIn={handleZoomIn}
      onZoomOut={handleZoomOut}
      onZoomReset={handleZoomReset}
      onGridToggle={() => setShowGrid(!showGrid)}
      onValidate={() => validateWorkflow()}
      canUndo={undoStack.length > 0}
      canRedo={redoStack.length > 0}
      validationResults={validationResults}
    />
  );

  const renderCanvas = () => (
    <WorkflowCanvas
      workflow={workflow}
      selectedNode={selectedNode}
      onNodeSelect={setSelectedNode}
      onNodeMove={handleNodeMove}
      onNodeConnect={handleNodeConnect}
      onNodeDelete={handleNodeDelete}
      onCanvasClick={handleCanvasClick}
      zoom={zoom}
      panOffset={panOffset}
      onPanChange={setPanOffset}
      isExecuting={isExecuting}
      executionStatus={executionStatus}
    />
  );

  const renderNodePalette = () => (
    <NodePalette
      onNodeCreate={handleNodeCreate}
      availableNodeTypes={availableNodeTypes}
      spaIntegrations={spaIntegrations}
    />
  );

  const renderPropertiesPanel = () => showNodeDetails && (
    <PropertiesPanel
      selectedNode={selectedNodeData}
      onNodeUpdate={handleNodeUpdate}
      workflow={workflow}
      validationResults={validationResults}
    />
  );

  const renderExecutionPanel = () => (
    <ExecutionPanel
      workflow={workflow}
      execution={execution}
      onExecutionStart={handleExecutionStart}
      onExecutionStop={handleExecutionStop}
      onExecutionPause={() => execution && pauseExecution(execution.id)}
      onExecutionResume={() => execution && resumeExecution(execution.id)}
      metrics={metrics}
    />
  );

  const renderMinimap = () => showMinimap && canvasRef.current && (
    <div className="absolute bottom-4 right-4 z-10">
      <Minimap
        workflow={workflow}
        canvasBounds={canvasRef.current.getBoundingClientRect()}
        viewportBounds={viewportBounds || canvasRef.current.getBoundingClientRect()}
        onViewportChange={setViewportBounds}
      />
    </div>
  );

  return (
    <TooltipProvider>
      <div className={`h-full flex flex-col bg-background ${className}`}>
        {renderToolbar()}

        <div className="flex-1 flex overflow-hidden">
          <ResizablePanelGroup direction="horizontal">
            {/* Node Palette */}
            <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
              <div className="h-full border-r bg-muted/30">
                {renderNodePalette()}
              </div>
            </ResizablePanel>

            <ResizableHandle />

            {/* Main Canvas Area */}
            <ResizablePanel defaultSize={55} minSize={40}>
              <div className="h-full relative">
                <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="h-full">
                  <div className="border-b px-4">
                    <TabsList>
                      <TabsTrigger value="canvas" className="flex items-center gap-2">
                        <Grid className="h-4 w-4" />
                        Canvas
                      </TabsTrigger>
                      <TabsTrigger value="code" className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Code
                      </TabsTrigger>
                      <TabsTrigger value="execution" className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        Execution
                      </TabsTrigger>
                      <TabsTrigger value="templates" className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Templates
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="canvas" className="h-full p-0">
                    <div ref={canvasRef} className="h-full relative overflow-hidden">
                      {renderCanvas()}
                      {renderMinimap()}
                    </div>
                  </TabsContent>

                  <TabsContent value="code" className="h-full p-4">
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle>Generated Code</CardTitle>
                        <CardDescription>
                          Generated workflow execution code
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-96">
                          <pre className="text-sm bg-muted p-4 rounded">
                            {workflow ? generateWorkflowCode(workflow) : 'No workflow defined'}
                          </pre>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="execution" className="h-full p-0">
                    {renderExecutionPanel()}
                  </TabsContent>

                  <TabsContent value="templates" className="h-full p-4">
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle>Workflow Templates</CardTitle>
                        <CardDescription>
                          Pre-built workflow templates for common scenarios
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {templates.map((template) => (
                            <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">{template.name}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-xs text-muted-foreground mb-2">
                                  {template.description}
                                </p>
                                <Button 
                                  size="sm" 
                                  className="w-full"
                                  onClick={() => {
                                    const newWorkflow = { ...template, id: crypto.randomUUID() };
                                    updateWorkflow(newWorkflow);
                                  }}
                                >
                                  Use Template
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </ResizablePanel>

            <ResizableHandle />

            {/* Properties Panel */}
            <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
              <div className="h-full border-l bg-muted/30">
                {renderPropertiesPanel()}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Hidden file input for importing workflows */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImport(file);
          }}
          style={{ display: 'none' }}
        />

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 left-4 right-4 z-50"
            >
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Workflow Builder Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

// Workflow Canvas Component
const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  workflow,
  selectedNode,
  onNodeSelect,
  onNodeMove,
  onNodeConnect,
  onNodeDelete,
  onCanvasClick,
  zoom,
  panOffset,
  onPanChange,
  isExecuting,
  executionStatus
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<CanvasPosition>({ x: 0, y: 0 });

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  }, [panOffset]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      onPanChange({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart, onPanChange]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      const position = {
        x: (e.clientX - rect.left - panOffset.x) / zoom,
        y: (e.clientY - rect.top - panOffset.y) / zoom
      };
      onCanvasClick(position);
    }
  }, [onCanvasClick, panOffset, zoom]);

  return (
    <div 
      className="w-full h-full bg-grid-pattern bg-grid-size cursor-move overflow-hidden"
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onClick={handleCanvasClick}
      style={{
        backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
        backgroundSize: `${20 * zoom}px ${20 * zoom}px`
      }}
    >
      <div
        className="relative"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: '0 0'
        }}
      >
        {/* Render Connections */}
        <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
          {workflow?.connections?.map((connection) => {
            const sourceNode = workflow.nodes?.find(n => n.id === connection.sourceNodeId);
            const targetNode = workflow.nodes?.find(n => n.id === connection.targetNodeId);
            
            if (!sourceNode || !targetNode) return null;

            const sourceX = sourceNode.position.x + 100; // Node width / 2
            const sourceY = sourceNode.position.y + 25; // Node height / 2
            const targetX = targetNode.position.x + 100;
            const targetY = targetNode.position.y + 25;

            const connectionColor = 
              connection.type === 'error' ? '#ef4444' :
              connection.type === 'conditional' ? '#f59e0b' :
              '#10b981';

            return (
              <g key={connection.id}>
                <path
                  d={`M ${sourceX} ${sourceY} Q ${sourceX + 50} ${sourceY} ${targetX - 50} ${targetY} T ${targetX} ${targetY}`}
                  stroke={connectionColor}
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                />
              </g>
            );
          })}
          
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
                fill="#10b981"
              />
            </marker>
          </defs>
        </svg>

        {/* Render Nodes */}
        {workflow?.nodes?.map((node) => (
          <WorkflowNode
            key={node.id}
            node={node}
            isSelected={selectedNode === node.id}
            isExecuting={isExecuting && executionStatus.get(node.id) === 'running'}
            executionStatus={executionStatus.get(node.id)}
            onSelect={() => onNodeSelect(node.id)}
            onMove={(position) => onNodeMove(node.id, position)}
            onDelete={() => onNodeDelete(node.id)}
            onConnectStart={(nodeId) => {
              // Start connection mode
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Workflow Node Component
interface WorkflowNodeProps {
  node: WorkflowNode;
  isSelected: boolean;
  isExecuting: boolean;
  executionStatus?: ExecutionStatus;
  onSelect: () => void;
  onMove: (position: CanvasPosition) => void;
  onDelete: () => void;
  onConnectStart: (nodeId: string) => void;
}

const WorkflowNode: React.FC<WorkflowNodeProps> = ({
  node,
  isSelected,
  isExecuting,
  executionStatus,
  onSelect,
  onMove,
  onDelete,
  onConnectStart
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<CanvasPosition>({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y
    });
    onSelect();
  }, [node.position, onSelect]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      onMove({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart, onMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const getStatusColor = () => {
    switch (executionStatus) {
      case 'running': return 'border-blue-500 bg-blue-50';
      case 'completed': return 'border-green-500 bg-green-50';
      case 'failed': return 'border-red-500 bg-red-50';
      case 'cancelled': return 'border-gray-500 bg-gray-50';
      default: return isSelected ? 'border-primary bg-primary/10' : 'border-border bg-background';
    }
  };

  const getStatusIcon = () => {
    switch (executionStatus) {
      case 'running': return <Activity className="h-3 w-3 text-blue-500 animate-pulse" />;
      case 'completed': return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'failed': return <XCircle className="h-3 w-3 text-red-500" />;
      case 'cancelled': return <XCircle className="h-3 w-3 text-gray-500" />;
      default: return null;
    }
  };

  return (
    <motion.div
      className={`absolute cursor-move select-none ${getStatusColor()}`}
      style={{
        left: node.position.x,
        top: node.position.y,
        zIndex: isSelected ? 10 : 5
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className={`w-48 border-2 ${getStatusColor()}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <CardTitle className="text-sm truncate">{node.name}</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              {getStatusIcon()}
              {isSelected && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground truncate">
            {node.description || node.type}
          </p>
          {executionStatus && (
            <Badge variant="outline" className="mt-2 text-xs">
              {executionStatus}
            </Badge>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Node Palette Component  
const NodePalette: React.FC<NodePaletteProps> = ({
  onNodeCreate,
  availableNodeTypes,
  spaIntegrations
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = new Set(['all']);
    availableNodeTypes.forEach(type => {
      if (type.category) cats.add(type.category);
    });
    return Array.from(cats);
  }, [availableNodeTypes]);

  const filteredNodeTypes = useMemo(() => {
    return availableNodeTypes.filter(type => {
      const matchesSearch = type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           type.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || type.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [availableNodeTypes, searchTerm, selectedCategory]);

  return (
    <div className="h-full p-4">
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Node Palette</h3>
          <Input
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-2"
          />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="h-96">
          <div className="space-y-2">
            {filteredNodeTypes.map((nodeType) => (
              <Card
                key={nodeType.id}
                className="cursor-pointer hover:shadow-md transition-shadow p-2"
                onClick={async () => {
                  // Generate optimized position
                  const optimal = await calculateOptimalNodePosition(existingNodes, canvasSize);
                  const position = {
                    x: optimal.x || 150,
                    y: optimal.y || 150
                  };
                  onNodeCreate(nodeType, position);
                }}
              >
                <div className="flex items-start gap-2">
                  <nodeType.icon className="h-4 w-4 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{nodeType.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {nodeType.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

// Properties Panel Component
const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedNode,
  onNodeUpdate,
  workflow,
  validationResults
}) => {
  if (!selectedNode) {
    return (
      <div className="h-full p-4">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Settings className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Node Selected</h3>
          <p className="text-muted-foreground text-sm">
            Select a node to view and edit its properties.
          </p>
        </div>
      </div>
    );
  }

  const nodeValidationResults = validationResults.filter(result => 
    result.nodeId === selectedNode.id
  );

  return (
    <div className="h-full p-4">
      <ScrollArea className="h-full">
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-4">Node Properties</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="node-name">Name</Label>
                <Input
                  id="node-name"
                  value={selectedNode.name}
                  onChange={(e) => onNodeUpdate(selectedNode.id, { name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="node-description">Description</Label>
                <Textarea
                  id="node-description"
                  value={selectedNode.description}
                  onChange={(e) => onNodeUpdate(selectedNode.id, { description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label>Type</Label>
                <Input value={selectedNode.type} disabled />
              </div>

              <div>
                <Label>Position</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={Math.round(selectedNode.position.x)}
                    onChange={(e) => onNodeUpdate(selectedNode.id, {
                      position: { ...selectedNode.position, x: parseInt(e.target.value) || 0 }
                    })}
                    placeholder="X"
                  />
                  <Input
                    value={Math.round(selectedNode.position.y)}
                    onChange={(e) => onNodeUpdate(selectedNode.id, {
                      position: { ...selectedNode.position, y: parseInt(e.target.value) || 0 }
                    })}
                    placeholder="Y"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Section */}
          <div>
            <h4 className="font-medium mb-2">Configuration</h4>
            <Card>
              <CardContent className="p-4">
                {Object.keys(selectedNode.configuration || {}).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(selectedNode.configuration || {}).map(([key, value]) => (
                      <div key={key}>
                        <Label htmlFor={`config-${key}`} className="capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Label>
                        <Input
                          id={`config-${key}`}
                          value={String(value)}
                          onChange={(e) => onNodeUpdate(selectedNode.id, {
                            configuration: {
                              ...selectedNode.configuration,
                              [key]: e.target.value
                            }
                          })}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No configuration options available for this node type.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Validation Results */}
          {nodeValidationResults.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Validation Results</h4>
              <div className="space-y-2">
                {nodeValidationResults.map((result, index) => (
                  <Alert
                    key={index}
                    variant={result.level === 'error' ? 'destructive' : 'default'}
                  >
                    {result.level === 'error' ? 
                      <AlertTriangle className="h-4 w-4" /> : 
                      <Info className="h-4 w-4" />
                    }
                    <AlertDescription>{result.message}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          {/* Inputs/Outputs */}
          <div>
            <h4 className="font-medium mb-2">Inputs & Outputs</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Inputs</Label>
                <div className="mt-1 space-y-1">
                  {selectedNode.inputs?.map((input, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {input.name}: {input.type}
                    </Badge>
                  )) || <p className="text-xs text-muted-foreground">No inputs</p>}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Outputs</Label>
                <div className="mt-1 space-y-1">
                  {selectedNode.outputs?.map((output, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {output.name}: {output.type}
                    </Badge>
                  )) || <p className="text-xs text-muted-foreground">No outputs</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

// Execution Panel Component
const ExecutionPanel: React.FC<ExecutionPanelProps> = ({
  workflow,
  execution,
  onExecutionStart,
  onExecutionStop,
  onExecutionPause,
  onExecutionResume,
  metrics
}) => {
  return (
    <div className="h-full p-4">
      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-4">Workflow Execution</h3>
          
          <div className="flex items-center gap-2 mb-4">
            <Button
              onClick={onExecutionStart}
              disabled={!workflow || execution?.status === 'running'}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Start
            </Button>
            
            <Button
              variant="outline"
              onClick={onExecutionStop}
              disabled={!execution || execution.status !== 'running'}
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Square
            </Button>

            <Button
              variant="outline"
              onClick={execution?.status === 'paused' ? onExecutionResume : onExecutionPause}
              disabled={!execution || execution.status === 'completed'}
              className="flex items-center gap-2"
            >
              {execution?.status === 'paused' ? (
                <>
                  <Play className="h-4 w-4" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4" />
                  Pause
                </>
              )}
            </Button>
          </div>
        </div>

        {execution && (
          <div>
            <h4 className="font-medium mb-2">Current Execution</h4>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge variant={
                      execution.status === 'completed' ? 'default' :
                      execution.status === 'failed' ? 'destructive' :
                      execution.status === 'running' ? 'secondary' : 'outline'
                    }>
                      {execution.status}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Started:</span>
                    <span className="text-sm text-muted-foreground">
                      {execution.startedAt.toLocaleTimeString()}
                    </span>
                  </div>

                  {execution.completedAt && (
                    <div className="flex justify-between">
                      <span className="text-sm">Completed:</span>
                      <span className="text-sm text-muted-foreground">
                        {execution.completedAt.toLocaleTimeString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-sm">Duration:</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round((Date.now() - execution.startedAt.getTime()) / 1000)}s
                    </span>
                  </div>

                  {execution.stepExecutions && (
                    <div>
                      <span className="text-sm">Progress:</span>
                      <Progress 
                        value={
                          (execution.stepExecutions.filter(step => step.status === 'completed').length / 
                           execution.stepExecutions.length) * 100
                        }
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {metrics && (
          <div>
            <h4 className="font-medium mb-2">Metrics</h4>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{metrics.totalNodes}</div>
                  <p className="text-xs text-muted-foreground">Total Nodes</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{metrics.totalConnections}</div>
                  <p className="text-xs text-muted-foreground">Connections</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{metrics.estimatedDuration}s</div>
                  <p className="text-xs text-muted-foreground">Est. Duration</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{metrics.complexity}</div>
                  <p className="text-xs text-muted-foreground">Complexity</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Workflow Toolbar Component
const WorkflowToolbar: React.FC<WorkflowToolbarProps> = ({
  workflow,
  onSave,
  onLoad,
  onExport,
  onImport,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onGridToggle,
  onValidate,
  canUndo,
  canRedo,
  validationResults
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasErrors = validationResults.some(result => result.level === 'error');
  const hasWarnings = validationResults.some(result => result.level === 'warning');

  return (
    <div className="flex items-center justify-between p-2 border-b bg-muted/30">
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={onSave}>
                <Save className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save Workflow</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={onLoad}>
                <Upload className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Load Workflow</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export Workflow</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={onUndo} disabled={!canUndo}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={onRedo} disabled={!canRedo}>
                <RotateCcw className="h-4 w-4 scale-x-[-1]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={onZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom In</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={onZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={onZoomReset}>
                <Target className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset Zoom</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={onGridToggle}>
                <Grid className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Grid</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onValidate}
          className={
            hasErrors ? 'border-red-500 text-red-600' :
            hasWarnings ? 'border-yellow-500 text-yellow-600' :
            'border-green-500 text-green-600'
          }
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Validate
          {validationResults.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {validationResults.length}
            </Badge>
          )}
        </Button>

        <div className="text-sm text-muted-foreground">
          {workflow?.name || 'Untitled Workflow'}
        </div>
      </div>
    </div>
  );
};

// Minimap Component
const Minimap: React.FC<MinimapProps> = ({
  workflow,
  canvasBounds,
  viewportBounds,
  onViewportChange
}) => {
  return (
    <Card className="w-48 h-32">
      <CardContent className="p-2">
        <div className="relative w-full h-full bg-muted/30 rounded">
          {workflow?.nodes?.map((node) => (
            <div
              key={node.id}
              className="absolute w-1 h-1 bg-primary rounded"
              style={{
                left: `${(node.position.x / 5000) * 100}%`,
                top: `${(node.position.y / 3000) * 100}%`
              }}
            />
          ))}
          
          <div 
            className="absolute border border-primary bg-primary/20 rounded"
            style={{
              left: `${(viewportBounds.left / canvasBounds.width) * 100}%`,
              top: `${(viewportBounds.top / canvasBounds.height) * 100}%`,
              width: `${(viewportBounds.width / canvasBounds.width) * 100}%`,
              height: `${(viewportBounds.height / canvasBounds.height) * 100}%`
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default JobWorkflowBuilder;