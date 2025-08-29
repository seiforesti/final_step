'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Icons
import { Workflow, Play, Pause, Square, Save, Copy, Edit, Trash, Plus, Minus, X, Check, AlertCircle, Info, Settings, MoreHorizontal, ChevronDown, ChevronRight, ArrowUpRight, ArrowDownRight, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Download, Upload, Share, Eye, EyeOff, Lock, Unlock, Clock, Calendar, User, Users, Tag, Tags, Layers, GitBranch, Activity, TrendingUp, TrendingDown, BarChart3, PieChart, LineChart, Zap, Brain, Sparkles, Target, Grid, List, MapPin, Globe, Network, Shield, Database, Table, FileText, Folder, FolderOpen, Search, Filter, RefreshCw, ExternalLink, LinkIcon, Unlink, Move, RotateCcw, RotateCw, ZoomIn, ZoomOut, Maximize, Minimize, Circle, Triangle, Diamond, Star, Heart, Bookmark, Flag, Bell, BellOff, Volume2, VolumeX, Mic, MicOff, Camera, Video, Image, File, Code, Terminal, Cpu, HardDrive, Wifi, WifiOff, Bluetooth, Usb, Power, Battery, BatteryLow, Sun, Moon, CloudRain, CloudSnow, Thermometer, Wind, Compass, Navigation, Map, Route, Car, Plane, Train, Ship, Bike, Walk,  } from 'lucide-react';

// Import hooks and services (wired via Racine orchestrator hooks)
import { useJobWorkflow } from '../../../../hooks/useJobWorkflow';
import { useWorkspaceManagement } from '../../../../hooks/useWorkspaceManagement';
import { useUserManagement } from '../../../../hooks/useUserManagement';
import { useAIAssistant } from '../../../../hooks/useAIAssistant';
import { useCrossGroupIntegration } from '../../../../hooks/useCrossGroupIntegration';
import { useActivityTracking } from '../../../../hooks/useActivityTracking';
import { usePipelineManager } from '../../../../hooks/usePipelineManager';
import { useAdvancedCatalog } from '../../../../hooks/useAdvancedCatalog';
import { useDataSources } from '../../../../hooks/useDataSources';
import { useScanRuleSets } from '../../../../hooks/useScanRuleSets';
import { useClassifications } from '../../../../hooks/useClassifications';
import { useComplianceRules as useComplianceRule } from '../../../../hooks/useComplianceRules';
import { useScanLogic } from '../../../../hooks/useScanLogic';
import { useRBACSystem as useRBAC } from '../../../../hooks/useRBACSystem';

// Types
interface WorkflowStep {
  id: string;
  type: 'data-source' | 'scan-rule' | 'classification' | 'compliance' | 'catalog' | 'scan-logic' | 'rbac' | 'custom';
  name: string;
  description: string;
  position: { x: number; y: number };
  config: Record<string, any>;
  dependencies: string[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  duration?: number;
  startTime?: string;
  endTime?: string;
  logs?: string[];
  metrics?: Record<string, any>;
  outputs?: Record<string, any>;
}

interface WorkflowConnection {
  id: string;
  sourceStepId: string;
  targetStepId: string;
  condition?: string;
  label?: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: WorkflowStep[];
  connections: WorkflowConnection[];
  variables: Record<string, any>;
  schedule?: {
    enabled: boolean;
    cron: string;
    timezone: string;
  };
}

interface QuickWorkflowCreateProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
  initialTemplate?: WorkflowTemplate;
}

const QuickWorkflowCreate: React.FC<QuickWorkflowCreateProps> = ({
  isVisible,
  onClose,
  className = '',
  initialTemplate,
}) => {
  // State management
  const [activeTab, setActiveTab] = useState<string>('design');
  const [workflowName, setWorkflowName] = useState<string>('');
  const [workflowDescription, setWorkflowDescription] = useState<string>('');
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [connections, setConnections] = useState<WorkflowConnection[]>([]);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionProgress, setExecutionProgress] = useState<number>(0);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'visual' | 'code' | 'json'>('visual');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [canvasOffset, setCanvasOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showMinimap, setShowMinimap] = useState<boolean>(true);
  const [autoSave, setAutoSave] = useState<boolean>(true);
  const [lastSaved, setLastSaved] = useState<string>('');
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [showTemplateDialog, setShowTemplateDialog] = useState<boolean>(false);
  const [showVariablesDialog, setShowVariablesDialog] = useState<boolean>(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState<boolean>(false);
  const [workflowVariables, setWorkflowVariables] = useState<Record<string, any>>({});
  const [scheduleConfig, setScheduleConfig] = useState<any>({});
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [aiSuggestions, setAISuggestions] = useState<any[]>([]);
  const [showAISuggestions, setShowAISuggestions] = useState<boolean>(false);

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // Hooks
  const { 
    createWorkflow, 
    executeWorkflow, 
    getWorkflowTemplates, 
    validateWorkflow,
    getWorkflowMetrics,
    loading: workflowLoading 
  } = useJobWorkflow();
  
  const { currentWorkspace } = useWorkspaceManagement();
  const { currentUser } = useUserManagement();
  const { getAISuggestions, analyzeWorkflow } = useAIAssistant();
  const { coordinateWorkflow } = useCrossGroupIntegration();
  const { trackActivity } = useActivityTracking();

  // Cross-SPA integration hooks
  const { getDataSources } = useDataSources();
  const { getScanRules } = useScanRuleSets();
  const { getClassifications } = useClassifications();
  const { getComplianceRules } = useComplianceRule();
  const { getCatalogAssets } = useAdvancedCatalog();
  const { getScanLogic } = useScanLogic();
  const { getUsers, getRoles } = useRBAC();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const stepVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    hover: { scale: 1.05, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
  };

  // Load initial data
  useEffect(() => {
    if (isVisible) {
      loadTemplates();
      if (initialTemplate) {
        loadTemplate(initialTemplate);
      }
    }
  }, [isVisible, initialTemplate]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && isDirty && workflowName) {
      const timeoutId = setTimeout(() => {
        saveWorkflow();
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [steps, connections, workflowName, workflowDescription, isDirty, autoSave]);

  // Load workflow templates
  const loadTemplates = useCallback(async () => {
    try {
      const templateData = await getWorkflowTemplates();
      setTemplates(templateData);
    } catch (error) {
      console.error('Failed to load workflow templates:', error);
    }
  }, [getWorkflowTemplates]);

  // Load template
  const loadTemplate = useCallback((template: WorkflowTemplate) => {
    setWorkflowName(template.name);
    setWorkflowDescription(template.description);
    setSteps(template.steps);
    setConnections(template.connections);
    setWorkflowVariables(template.variables);
    if (template.schedule) {
      setScheduleConfig(template.schedule);
    }
    setIsDirty(false);
  }, []);

  // Save workflow
  const saveWorkflow = useCallback(async () => {
    try {
      const workflowData = {
        name: workflowName,
        description: workflowDescription,
        steps,
        connections,
        variables: workflowVariables,
        schedule: scheduleConfig,
        workspace: currentWorkspace?.id,
        createdBy: currentUser?.id,
      };

      await createWorkflow(workflowData);
      setLastSaved(new Date().toLocaleTimeString());
      setIsDirty(false);
      
      trackActivity({
        action: 'workflow_saved',
        resource: 'workflow',
        details: { name: workflowName, stepsCount: steps.length }
      });
    } catch (error) {
      console.error('Failed to save workflow:', error);
    }
  }, [workflowName, workflowDescription, steps, connections, workflowVariables, scheduleConfig, currentWorkspace, currentUser, createWorkflow, trackActivity]);

  // Execute workflow
  const executeWorkflowHandler = useCallback(async () => {
    if (!workflowName || steps.length === 0) return;

    setIsExecuting(true);
    setExecutionProgress(0);
    setExecutionLogs([]);

    try {
      const workflowData = {
        name: workflowName,
        steps,
        connections,
        variables: workflowVariables,
      };

      // Validate workflow before execution
      const validation = await validateWorkflow(workflowData);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        setIsExecuting(false);
        return;
      }

      // Execute workflow with real-time updates
      await executeWorkflow(workflowData, {
        onProgress: (progress: number) => setExecutionProgress(progress),
        onLog: (log: string) => setExecutionLogs(prev => [...prev, log]),
        onStepUpdate: (stepId: string, status: string, metrics?: any) => {
          setSteps(prev => prev.map(step => 
            step.id === stepId 
              ? { ...step, status: status as any, metrics }
              : step
          ));
        }
      });

      trackActivity({
        action: 'workflow_executed',
        resource: 'workflow',
        details: { name: workflowName, stepsCount: steps.length }
      });
    } catch (error) {
      console.error('Workflow execution failed:', error);
      setExecutionLogs(prev => [...prev, `Error: ${error.message}`]);
    } finally {
      setIsExecuting(false);
    }
  }, [workflowName, steps, connections, workflowVariables, validateWorkflow, executeWorkflow, trackActivity]);

  // Add workflow step
  const addStep = useCallback((stepType: WorkflowStep['type'], position: { x: number; y: number }) => {
    const newStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      type: stepType,
      name: `${stepType.charAt(0).toUpperCase() + stepType.slice(1)} Step`,
      description: '',
      position,
      config: {},
      dependencies: [],
      status: 'pending',
    };

    setSteps(prev => [...prev, newStep]);
    setSelectedStep(newStep.id);
    setIsDirty(true);
  }, []);

  // Remove workflow step
  const removeStep = useCallback((stepId: string) => {
    setSteps(prev => prev.filter(step => step.id !== stepId));
    setConnections(prev => prev.filter(conn => 
      conn.sourceStepId !== stepId && conn.targetStepId !== stepId
    ));
    setSelectedStep(null);
    setIsDirty(true);
  }, []);

  // Update step
  const updateStep = useCallback((stepId: string, updates: Partial<WorkflowStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
    setIsDirty(true);
  }, []);

  // Add connection
  const addConnection = useCallback((sourceStepId: string, targetStepId: string) => {
    const newConnection: WorkflowConnection = {
      id: `conn_${Date.now()}`,
      sourceStepId,
      targetStepId,
    };

    setConnections(prev => [...prev, newConnection]);
    setIsDirty(true);
  }, []);

  // Remove connection
  const removeConnection = useCallback((connectionId: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
    setSelectedConnection(null);
    setIsDirty(true);
  }, []);

  // Get AI suggestions
  const getAISuggestionsHandler = useCallback(async () => {
    try {
      const suggestions = await getAISuggestions({
        context: 'workflow_design',
        currentSteps: steps,
        connections,
        workspace: currentWorkspace?.id,
      });
      setAISuggestions(suggestions);
      setShowAISuggestions(true);
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
    }
  }, [steps, connections, currentWorkspace, getAISuggestions]);

  // Render step toolbox
  const renderStepToolbox = () => (
    <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Workflow Steps</h3>
      
      <div className="space-y-3">
        <div>
          <h4 className="text-xs font-medium text-gray-600 mb-2">Data Sources</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="justify-start h-8 text-xs"
              onClick={() => addStep('data-source', { x: 100, y: 100 })}
            >
              <Database className="h-3 w-3 mr-1" />
              Data Source
            </Button>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium text-gray-600 mb-2">Processing</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="justify-start h-8 text-xs"
              onClick={() => addStep('scan-rule', { x: 200, y: 100 })}
            >
              <Search className="h-3 w-3 mr-1" />
              Scan Rule
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start h-8 text-xs"
              onClick={() => addStep('classification', { x: 300, y: 100 })}
            >
              <Tag className="h-3 w-3 mr-1" />
              Classify
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start h-8 text-xs"
              onClick={() => addStep('scan-logic', { x: 400, y: 100 })}
            >
              <Zap className="h-3 w-3 mr-1" />
              Scan Logic
            </Button>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium text-gray-600 mb-2">Governance</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="justify-start h-8 text-xs"
              onClick={() => addStep('compliance', { x: 500, y: 100 })}
            >
              <Shield className="h-3 w-3 mr-1" />
              Compliance
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start h-8 text-xs"
              onClick={() => addStep('catalog', { x: 600, y: 100 })}
            >
              <Layers className="h-3 w-3 mr-1" />
              Catalog
            </Button>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium text-gray-600 mb-2">Security</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="justify-start h-8 text-xs"
              onClick={() => addStep('rbac', { x: 700, y: 100 })}
            >
              <Lock className="h-3 w-3 mr-1" />
              RBAC
            </Button>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium text-gray-600 mb-2">Custom</h4>
          <Button
            variant="outline"
            size="sm"
            className="justify-start h-8 text-xs w-full"
            onClick={() => addStep('custom', { x: 800, y: 100 })}
          >
            <Code className="h-3 w-3 mr-1" />
            Custom Step
          </Button>
        </div>
      </div>
    </div>
  );

  // Render workflow canvas
  const renderWorkflowCanvas = () => (
    <div className="relative bg-gray-50 rounded-xl border border-gray-200 overflow-hidden" style={{ height: '600px' }}>
      {/* Canvas Controls */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
        <div className="bg-white rounded-lg border border-gray-200 p-2 flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 2))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600">{Math.round(zoomLevel * 100)}%</span>
          <Button variant="outline" size="sm" onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.5))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <Button
            variant={showGrid ? "default" : "outline"}
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative w-full h-full cursor-move"
        style={{
          transform: `scale(${zoomLevel}) translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
          backgroundImage: showGrid ? 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)' : 'none',
          backgroundSize: showGrid ? '20px 20px' : 'none',
        }}
      >
        {/* Connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          {connections.map(connection => {
            const sourceStep = steps.find(step => step.id === connection.sourceStepId);
            const targetStep = steps.find(step => step.id === connection.targetStepId);
            
            if (!sourceStep || !targetStep) return null;
            
            const startX = sourceStep.position.x + 120; // Step width / 2
            const startY = sourceStep.position.y + 40; // Step height / 2
            const endX = targetStep.position.x + 120;
            const endY = targetStep.position.y + 40;
            
            return (
              <g key={connection.id}>
                <defs>
                  <marker
                    id={`arrowhead-${connection.id}`}
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill="#6366f1"
                    />
                  </marker>
                </defs>
                <path
                  d={`M ${startX} ${startY} Q ${(startX + endX) / 2} ${startY - 50} ${endX} ${endY}`}
                  stroke="#6366f1"
                  strokeWidth="2"
                  fill="none"
                  markerEnd={`url(#arrowhead-${connection.id})`}
                  className={`transition-colors ${selectedConnection === connection.id ? 'stroke-blue-600' : 'hover:stroke-blue-500'}`}
                  onClick={() => setSelectedConnection(connection.id)}
                  style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                />
              </g>
            );
          })}
        </svg>

        {/* Workflow Steps */}
        {steps.map(step => (
          <motion.div
            key={step.id}
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            whileHover="hover"
            drag
            dragMomentum={false}
            dragElastic={0}
            onDragEnd={(event, info) => {
              updateStep(step.id, {
                position: {
                  x: step.position.x + info.offset.x,
                  y: step.position.y + info.offset.y,
                }
              });
            }}
            className={`absolute cursor-pointer ${selectedStep === step.id ? 'z-20' : 'z-10'}`}
            style={{
              left: step.position.x,
              top: step.position.y,
              width: '240px',
            }}
            onClick={() => setSelectedStep(step.id)}
          >
            <Card className={`${selectedStep === step.id ? 'ring-2 ring-blue-500 border-blue-300' : 'border-gray-200'} hover:shadow-lg transition-all`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-lg ${
                      step.type === 'data-source' ? 'bg-blue-100' :
                      step.type === 'scan-rule' ? 'bg-green-100' :
                      step.type === 'classification' ? 'bg-purple-100' :
                      step.type === 'compliance' ? 'bg-orange-100' :
                      step.type === 'catalog' ? 'bg-indigo-100' :
                      step.type === 'scan-logic' ? 'bg-yellow-100' :
                      step.type === 'rbac' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      {step.type === 'data-source' && <Database className="h-4 w-4 text-blue-600" />}
                      {step.type === 'scan-rule' && <Search className="h-4 w-4 text-green-600" />}
                      {step.type === 'classification' && <Tag className="h-4 w-4 text-purple-600" />}
                      {step.type === 'compliance' && <Shield className="h-4 w-4 text-orange-600" />}
                      {step.type === 'catalog' && <Layers className="h-4 w-4 text-indigo-600" />}
                      {step.type === 'scan-logic' && <Zap className="h-4 w-4 text-yellow-600" />}
                      {step.type === 'rbac' && <Lock className="h-4 w-4 text-red-600" />}
                      {step.type === 'custom' && <Code className="h-4 w-4 text-gray-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {step.name}
                      </h4>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${
                      step.status === 'completed' ? 'bg-green-500' :
                      step.status === 'running' ? 'bg-blue-500' :
                      step.status === 'failed' ? 'bg-red-500' :
                      step.status === 'cancelled' ? 'bg-gray-500' : 'bg-yellow-500'
                    }`} />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Step Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setSelectedStep(step.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Step
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {}}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => removeStep(step.id)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete Step
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {step.description && (
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {step.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="capitalize">{step.type.replace('-', ' ')}</span>
                  {step.duration && (
                    <span>{Math.round(step.duration / 1000)}s</span>
                  )}
                </div>
                {step.status === 'running' && (
                  <div className="mt-2">
                    <Progress value={50} className="h-1" />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Minimap */}
      {showMinimap && (
        <div className="absolute bottom-4 right-4 w-32 h-24 bg-white rounded-lg border border-gray-200 p-2">
          <div className="relative w-full h-full bg-gray-50 rounded overflow-hidden">
            {steps.map(step => (
              <div
                key={step.id}
                className="absolute w-2 h-2 bg-blue-500 rounded-sm"
                style={{
                  left: `${(step.position.x / 1000) * 100}%`,
                  top: `${(step.position.y / 600) * 100}%`,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render step properties panel
  const renderStepProperties = () => {
    const step = steps.find(s => s.id === selectedStep);
    if (!step) return null;

    return (
      <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Step Properties</h3>
          <Button variant="ghost" size="sm" onClick={() => setSelectedStep(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="step-name" className="text-xs font-medium text-gray-700">
              Step Name
            </Label>
            <Input
              id="step-name"
              value={step.name}
              onChange={(e) => updateStep(step.id, { name: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="step-description" className="text-xs font-medium text-gray-700">
              Description
            </Label>
            <Textarea
              id="step-description"
              value={step.description}
              onChange={(e) => updateStep(step.id, { description: e.target.value })}
              className="mt-1 h-20"
              placeholder="Describe what this step does..."
            />
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-700">
              Step Type
            </Label>
            <Select
              value={step.type}
              onValueChange={(value: WorkflowStep['type']) => updateStep(step.id, { type: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="data-source">Data Source</SelectItem>
                <SelectItem value="scan-rule">Scan Rule</SelectItem>
                <SelectItem value="classification">Classification</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="catalog">Catalog</SelectItem>
                <SelectItem value="scan-logic">Scan Logic</SelectItem>
                <SelectItem value="rbac">RBAC</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Step-specific configuration */}
          {step.type === 'data-source' && (
            <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-900">Data Source Configuration</h4>
              <div>
                <Label className="text-xs text-blue-700">Source Type</Label>
                <Select
                  value={step.config.sourceType || ''}
                  onValueChange={(value) => updateStep(step.id, { 
                    config: { ...step.config, sourceType: value }
                  })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select source type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="file">File System</SelectItem>
                    <SelectItem value="api">REST API</SelectItem>
                    <SelectItem value="cloud">Cloud Storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step.type === 'scan-rule' && (
            <div className="space-y-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="text-sm font-medium text-green-900">Scan Rule Configuration</h4>
              <div>
                <Label className="text-xs text-green-700">Rule Pattern</Label>
                <Input
                  value={step.config.pattern || ''}
                  onChange={(e) => updateStep(step.id, { 
                    config: { ...step.config, pattern: e.target.value }
                  })}
                  placeholder="Enter regex pattern..."
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {step.type === 'classification' && (
            <div className="space-y-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="text-sm font-medium text-purple-900">Classification Configuration</h4>
              <div>
                <Label className="text-xs text-purple-700">Classification Type</Label>
                <Select
                  value={step.config.classificationType || ''}
                  onValueChange={(value) => updateStep(step.id, { 
                    config: { ...step.config, classificationType: value }
                  })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select classification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pii">PII</SelectItem>
                    <SelectItem value="sensitive">Sensitive</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="confidential">Confidential</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div>
            <Label className="text-xs font-medium text-gray-700">
              Dependencies
            </Label>
            <div className="mt-2 space-y-2">
              {steps.filter(s => s.id !== step.id).map(otherStep => (
                <div key={otherStep.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`dep-${otherStep.id}`}
                    checked={step.dependencies.includes(otherStep.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateStep(step.id, {
                          dependencies: [...step.dependencies, otherStep.id]
                        });
                        addConnection(otherStep.id, step.id);
                      } else {
                        updateStep(step.id, {
                          dependencies: step.dependencies.filter(dep => dep !== otherStep.id)
                        });
                        const connection = connections.find(conn => 
                          conn.sourceStepId === otherStep.id && conn.targetStepId === step.id
                        );
                        if (connection) {
                          removeConnection(connection.id);
                        }
                      }
                    }}
                  />
                  <Label htmlFor={`dep-${otherStep.id}`} className="text-xs">
                    {otherStep.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render execution monitor
  const renderExecutionMonitor = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Workflow Execution</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="default"
              size="sm"
              onClick={executeWorkflowHandler}
              disabled={isExecuting || steps.length === 0}
            >
              {isExecuting ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isExecuting ? 'Executing...' : 'Execute Workflow'}
            </Button>
            {isExecuting && (
              <Button variant="outline" size="sm" onClick={() => setIsExecuting(false)}>
                <Square className="h-4 w-4 mr-2" />
Stop
              </Button>
            )}
          </div>
        </div>

        {isExecuting && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="text-gray-900">{Math.round(executionProgress)}%</span>
              </div>
              <Progress value={executionProgress} className="h-2" />
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Execution Logs</h4>
              <ScrollArea className="h-32 w-full rounded border border-gray-200 p-3">
                <div className="space-y-1">
                  {executionLogs.map((log, index) => (
                    <div key={index} className="text-xs font-mono text-gray-600">
                      {log}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}

        {!isExecuting && executionLogs.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Last Execution Logs</h4>
            <ScrollArea className="h-32 w-full rounded border border-gray-200 p-3">
              <div className="space-y-1">
                {executionLogs.slice(-10).map((log, index) => (
                  <div key={index} className="text-xs font-mono text-gray-600">
                    {log}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Step Status</h3>
        <div className="space-y-3">
          {steps.map(step => (
            <div key={step.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  step.status === 'completed' ? 'bg-green-500' :
                  step.status === 'running' ? 'bg-blue-500 animate-pulse' :
                  step.status === 'failed' ? 'bg-red-500' :
                  step.status === 'cancelled' ? 'bg-gray-500' : 'bg-yellow-500'
                }`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{step.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{step.status}</p>
                </div>
              </div>
              <div className="text-right">
                {step.duration && (
                  <p className="text-xs text-gray-500">
                    {Math.round(step.duration / 1000)}s
                  </p>
                )}
                {step.metrics && (
                  <p className="text-xs text-blue-600">
                    {Object.keys(step.metrics).length} metrics
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render AI suggestions panel
  const renderAISuggestions = () => (
    <AnimatePresence>
      {showAISuggestions && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="absolute top-0 right-0 w-80 h-full bg-white border-l border-gray-200 z-30"
        >
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">AI Suggestions</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAISuggestions(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {aiSuggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Brain className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-indigo-900 mb-1">
                        {suggestion.title}
                      </h4>
                      <p className="text-xs text-indigo-700 mb-2">
                        {suggestion.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-indigo-300 text-xs">
                          {suggestion.confidence}% confidence
                        </Badge>
                        <Button variant="outline" size="sm" className="h-6 text-xs">
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {aiSuggestions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No AI suggestions available</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={getAISuggestionsHandler}>
                    Get Suggestions
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!isVisible) return null;

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`bg-white rounded-xl shadow-xl border border-gray-200 ${className}`}
        style={{ width: '95vw', maxWidth: '1600px', height: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Workflow className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Workflow Builder</h2>
              <p className="text-sm text-gray-500">Create and execute cross-SPA workflows</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isDirty && (
              <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                Unsaved changes
              </Badge>
            )}
            {lastSaved && (
              <span className="text-xs text-gray-500">
                Last saved: {lastSaved}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={saveWorkflow} disabled={workflowLoading}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={getAISuggestionsHandler}>
              <Brain className="h-4 w-4 mr-2" />
              AI Assist
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Workflow Info */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workflow-name" className="text-sm font-medium text-gray-700">
                Workflow Name
              </Label>
              <Input
                id="workflow-name"
                value={workflowName}
                onChange={(e) => {
                  setWorkflowName(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Enter workflow name..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="workflow-description" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <Input
                id="workflow-description"
                value={workflowDescription}
                onChange={(e) => {
                  setWorkflowDescription(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Describe your workflow..."
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 relative">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="execute">Execute</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="design" className="h-full">
              <div className="grid grid-cols-12 gap-6 h-full">
                {/* Toolbox */}
                <div className="col-span-3 space-y-4">
                  {renderStepToolbox()}
                  {selectedStep && renderStepProperties()}
                </div>

                {/* Canvas */}
                <div className="col-span-9">
                  {renderWorkflowCanvas()}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="execute" className="h-full">
              {renderExecutionMonitor()}
            </TabsContent>

            <TabsContent value="templates" className="h-full">
              <div className="grid grid-cols-3 gap-4">
                {templates.map(template => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{template.category}</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadTemplate(template)}
                        >
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="h-full">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Workflow Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="auto-save"
                        checked={autoSave}
                        onCheckedChange={setAutoSave}
                      />
                      <Label htmlFor="auto-save">Auto-save workflow</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="show-grid"
                        checked={showGrid}
                        onCheckedChange={setShowGrid}
                      />
                      <Label htmlFor="show-grid">Show grid</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="show-minimap"
                        checked={showMinimap}
                        onCheckedChange={setShowMinimap}
                      />
                      <Label htmlFor="show-minimap">Show minimap</Label>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* AI Suggestions Panel */}
          {renderAISuggestions()}
        </div>
      </motion.div>
    </>
  );
};

export default QuickWorkflowCreate;