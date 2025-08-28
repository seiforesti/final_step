'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Play, Pause, Save, Download, Upload, Copy, Trash2, Edit3, Settings, Plus, Minus, ZoomIn, ZoomOut, Grid, Target, ArrowRight, Database, Search, Shield, Users, Brain, CheckCircle, AlertTriangle, Loader2, RefreshCw, MoreHorizontal, X, Variable, GitBranch, Repeat, Terminal, WorkflowIcon, Package, Eye, EyeOff, Layers, Map, Activity } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Monaco Editor for advanced code editing
import Editor from '@monaco-editor/react';

// Racine System Imports
import { useJobWorkflow } from '../../hooks/useJobWorkflow';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../hooks/optimized/useOptimizedCrossGroupIntegration';
import { useUserManagement } from '../hooks/optimized/useOptimizedUserManagement';
import { useWorkspaceManagement } from '../hooks/optimized/useOptimizedWorkspaceManagement';
import { useActivityTracker } from '../hooks/optimized/useOptimizedActivityTracker';
import { useAIAssistant } from '../../hooks/useAIAssistant';

// Types
import { 
  ScriptNode,
  ScriptConnection,
  ScriptParameter,
  ScriptValidation,
  CodeGenerationRequest,
  CodeGenerationResponse,
  ScriptExecution,
  VisualScriptDefinition,
  ScriptNodeType,
  ValidationResult,
  ExecutionContext,
  ScriptMetrics
} from '../../types/racine-core.types';

/**
 * Advanced Visual Scripting Engine Component
 * 
 * Enterprise-grade visual programming interface with Databricks-style capabilities:
 * - Drag-and-drop visual script building with advanced node system
 * - Real-time code generation and syntax validation
 * - Cross-SPA script integration with all 7 existing SPAs
 * - Advanced parameter binding and data flow visualization
 * - Conditional logic builder with visual if/else constructs
 * - Loop constructors and advanced control flow
 * - Error handling framework with visual try/catch blocks
 * - Custom function library with reusable components
 * - Real-time debugging and execution monitoring
 * - AI-powered script optimization and suggestions
 * - Monaco Editor integration for advanced code editing
 * - Performance profiling and optimization recommendations
 * - Security analysis and vulnerability detection
 */

// Advanced Script Node Types for Cross-SPA Integration
const SCRIPT_NODE_TYPES = {
  // Basic Programming Constructs
  VARIABLE: { 
    type: 'variable', 
    icon: Variable, 
    color: 'bg-blue-500', 
    category: 'Variables',
    description: 'Variable declaration and assignment',
    inputs: [{ name: 'value', type: 'any' }],
    outputs: [{ name: 'variable', type: 'any' }],
    parameters: [
      { name: 'name', type: 'string', required: true },
      { name: 'type', type: 'select', options: ['string', 'number', 'boolean', 'object', 'array'] },
      { name: 'default_value', type: 'any' }
    ]
  },
  FUNCTION: { 
    type: 'function', 
    icon: Code, 
    color: 'bg-green-500', 
    category: 'Functions',
    description: 'Function definition and call',
    inputs: [{ name: 'parameters', type: 'array' }],
    outputs: [{ name: 'result', type: 'any' }],
    parameters: [
      { name: 'function_name', type: 'string', required: true },
      { name: 'return_type', type: 'string' },
      { name: 'async', type: 'boolean', default: false }
    ]
  },
  CONDITION: { 
    type: 'condition', 
    icon: GitBranch, 
    color: 'bg-yellow-500', 
    category: 'Control Flow',
    description: 'Conditional logic (if/else)',
    inputs: [{ name: 'condition', type: 'boolean' }, { name: 'true_branch', type: 'any' }, { name: 'false_branch', type: 'any' }],
    outputs: [{ name: 'result', type: 'any' }],
    parameters: [
      { name: 'operator', type: 'select', options: ['==', '!=', '>', '<', '>=', '<=', '&&', '||'] },
      { name: 'left_operand', type: 'any' },
      { name: 'right_operand', type: 'any' }
    ]
  },
  LOOP: { 
    type: 'loop', 
    icon: Repeat, 
    color: 'bg-orange-500', 
    category: 'Control Flow',
    description: 'Loop constructs (for/while)',
    inputs: [{ name: 'iterable', type: 'array' }, { name: 'body', type: 'any' }],
    outputs: [{ name: 'result', type: 'array' }],
    parameters: [
      { name: 'loop_type', type: 'select', options: ['for', 'while', 'forEach', 'map', 'filter'] },
      { name: 'iterator_name', type: 'string', default: 'item' },
      { name: 'max_iterations', type: 'number', default: 1000 }
    ]
  },

  // Cross-SPA Integration Nodes - Data Sources
  DATA_SOURCE_CONNECT: { 
    type: 'data_source_connect', 
    icon: Database, 
    color: 'bg-emerald-500', 
    category: 'Data Sources',
    description: 'Connect to data source',
    inputs: [],
    outputs: [{ name: 'connection', type: 'DataSourceConnection' }],
    parameters: [
      { name: 'data_source_id', type: 'string', required: true },
      { name: 'connection_params', type: 'object' },
      { name: 'timeout', type: 'number', default: 30 }
    ]
  },
  DATA_SOURCE_QUERY: { 
    type: 'data_source_query', 
    icon: Search, 
    color: 'bg-emerald-600', 
    category: 'Data Sources',
    description: 'Execute data source query',
    inputs: [{ name: 'connection', type: 'DataSourceConnection' }, { name: 'query', type: 'string' }],
    outputs: [{ name: 'results', type: 'array' }],
    parameters: [
      { name: 'query_type', type: 'select', options: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'] },
      { name: 'limit', type: 'number', default: 1000 },
      { name: 'cache_results', type: 'boolean', default: true }
    ]
  },

  // Cross-SPA Integration Nodes - Scan Rules
  SCAN_RULE_CREATE: { 
    type: 'scan_rule_create', 
    icon: Plus, 
    color: 'bg-violet-500', 
    category: 'Scan Rules',
    description: 'Create new scan rule',
    inputs: [{ name: 'rule_definition', type: 'object' }],
    outputs: [{ name: 'rule_id', type: 'string' }],
    parameters: [
      { name: 'rule_name', type: 'string', required: true },
      { name: 'rule_type', type: 'select', options: ['regex', 'ml', 'custom'] },
      { name: 'sensitivity_level', type: 'select', options: ['low', 'medium', 'high', 'critical'] }
    ]
  },
  SCAN_RULE_EXECUTE: { 
    type: 'scan_rule_execute', 
    icon: Play, 
    color: 'bg-violet-600', 
    category: 'Scan Rules',
    description: 'Execute scan rule',
    inputs: [{ name: 'rule_id', type: 'string' }, { name: 'target_data', type: 'any' }],
    outputs: [{ name: 'scan_results', type: 'array' }],
    parameters: [
      { name: 'parallel_execution', type: 'boolean', default: true },
      { name: 'result_format', type: 'select', options: ['detailed', 'summary', 'minimal'] }
    ]
  },

  // Cross-SPA Integration Nodes - Classifications
  CLASSIFICATION_APPLY: { 
    type: 'classification_apply', 
    icon: Settings, 
    color: 'bg-pink-500', 
    category: 'Classifications',
    description: 'Apply data classification',
    inputs: [{ name: 'data', type: 'any' }, { name: 'classification_rules', type: 'array' }],
    outputs: [{ name: 'classified_data', type: 'object' }],
    parameters: [
      { name: 'classification_level', type: 'select', options: ['public', 'internal', 'confidential', 'restricted'] },
      { name: 'auto_tag', type: 'boolean', default: true },
      { name: 'confidence_threshold', type: 'number', default: 0.8 }
    ]
  },

  // Cross-SPA Integration Nodes - Compliance
  COMPLIANCE_CHECK: { 
    type: 'compliance_check', 
    icon: Shield, 
    color: 'bg-rose-500', 
    category: 'Compliance',
    description: 'Execute compliance check',
    inputs: [{ name: 'data', type: 'any' }, { name: 'compliance_rules', type: 'array' }],
    outputs: [{ name: 'compliance_results', type: 'object' }],
    parameters: [
      { name: 'regulation_type', type: 'select', options: ['GDPR', 'HIPAA', 'SOX', 'PCI-DSS', 'Custom'] },
      { name: 'severity_level', type: 'select', options: ['info', 'warning', 'error', 'critical'] },
      { name: 'generate_report', type: 'boolean', default: true }
    ]
  },

  // Cross-SPA Integration Nodes - Catalog
  CATALOG_REGISTER: { 
    type: 'catalog_register', 
    icon: Package, 
    color: 'bg-amber-500', 
    category: 'Catalog',
    description: 'Register asset in catalog',
    inputs: [{ name: 'asset_metadata', type: 'object' }],
    outputs: [{ name: 'catalog_entry_id', type: 'string' }],
    parameters: [
      { name: 'asset_type', type: 'select', options: ['dataset', 'model', 'report', 'dashboard'] },
      { name: 'visibility', type: 'select', options: ['private', 'team', 'organization', 'public'] },
      { name: 'auto_discover_lineage', type: 'boolean', default: true }
    ]
  },

  // Cross-SPA Integration Nodes - Scan Logic
  SCAN_EXECUTE: { 
    type: 'scan_execute', 
    icon: Activity, 
    color: 'bg-lime-500', 
    category: 'Scan Logic',
    description: 'Execute scan operation',
    inputs: [{ name: 'scan_config', type: 'object' }, { name: 'target', type: 'any' }],
    outputs: [{ name: 'scan_results', type: 'object' }],
    parameters: [
      { name: 'scan_type', type: 'select', options: ['full', 'incremental', 'targeted'] },
      { name: 'parallel_workers', type: 'number', default: 4 },
      { name: 'timeout_minutes', type: 'number', default: 60 }
    ]
  },

  // Cross-SPA Integration Nodes - RBAC
  RBAC_CHECK_PERMISSION: { 
    type: 'rbac_check_permission', 
    icon: Users, 
    color: 'bg-slate-500', 
    category: 'RBAC',
    description: 'Check user permissions',
    inputs: [{ name: 'user_id', type: 'string' }, { name: 'resource', type: 'string' }, { name: 'action', type: 'string' }],
    outputs: [{ name: 'has_permission', type: 'boolean' }],
    parameters: [
      { name: 'permission_type', type: 'select', options: ['read', 'write', 'execute', 'admin'] },
      { name: 'check_inheritance', type: 'boolean', default: true }
    ]
  },

  // AI-Powered Operations
  AI_ANALYZE: { 
    type: 'ai_analyze', 
    icon: Brain, 
    color: 'bg-purple-500', 
    category: 'AI Operations',
    description: 'AI-powered data analysis',
    inputs: [{ name: 'data', type: 'any' }, { name: 'analysis_type', type: 'string' }],
    outputs: [{ name: 'insights', type: 'object' }],
    parameters: [
      { name: 'model_type', type: 'select', options: ['classification', 'regression', 'clustering', 'anomaly_detection'] },
      { name: 'confidence_level', type: 'number', default: 0.9 },
      { name: 'include_explanations', type: 'boolean', default: true }
    ]
  }
};

// Node Categories for Organization
const SCRIPT_CATEGORIES = [
  { id: 'variables', name: 'Variables', icon: Variable, color: 'text-blue-500' },
      { id: 'functions', name: 'Functions', icon: Code, color: 'text-green-500' },
  { id: 'control_flow', name: 'Control Flow', icon: GitBranch, color: 'text-yellow-500' },
  { id: 'data_sources', name: 'Data Sources', icon: Database, color: 'text-emerald-500' },
  { id: 'scan_rules', name: 'Scan Rules', icon: Search, color: 'text-violet-500' },
  { id: 'classifications', name: 'Classifications', icon: Settings, color: 'text-pink-500' },
  { id: 'compliance', name: 'Compliance', icon: Shield, color: 'text-rose-500' },
  { id: 'catalog', name: 'Catalog', icon: Package, color: 'text-amber-500' },
  { id: 'scan_logic', name: 'Scan Logic', icon: Activity, color: 'text-lime-500' },
  { id: 'rbac', name: 'RBAC', icon: Users, color: 'text-slate-500' },
  { id: 'ai_operations', name: 'AI Operations', icon: Brain, color: 'text-purple-500' }
];

interface VisualScriptingEngineProps {
  workflowId?: string;
  scriptId?: string;
  initialScript?: VisualScriptDefinition;
  onScriptChange?: (script: VisualScriptDefinition) => void;
  onScriptExecute?: (script: VisualScriptDefinition) => void;
  onScriptSave?: (script: VisualScriptDefinition) => void;
  readonly?: boolean;
  className?: string;
}

const VisualScriptingEngine: React.FC<VisualScriptingEngineProps> = ({
  workflowId,
  scriptId,
  initialScript,
  onScriptChange,
  onScriptExecute,
  onScriptSave,
  readonly = false,
  className = ''
}) => {
  // Hooks for Backend Integration
  const { 
    generateScript,
    validateScript,
    executeScript,
    optimizeScript,
    getScriptMetrics,
    saveScript,
    loadScript
  } = useJobWorkflow();
  
  const { 
    orchestrateScriptExecution,
    getSystemContext,
    validateCrossGroupScript
  } = useRacineOrchestration();
  
  const { 
    getAllSPAMethods,
    generateCrossGroupScript,
    validateSPAIntegration
  } = useCrossGroupIntegration();
  
  const { getCurrentUser, getUserPermissions } = useUserManagement();
  const { getActiveWorkspace } = useWorkspaceManagement();
  const { trackActivity } = useActivityTracker();
  const { 
    analyzeScript,
    optimizeScriptWithAI,
    suggestScriptImprovements,
    detectScriptVulnerabilities
  } = useAIAssistant();

  // State Management
  const [script, setScript] = useState<VisualScriptDefinition>(initialScript || {
    id: scriptId || '',
    name: 'New Visual Script',
    description: '',
    nodes: [],
    connections: [],
    parameters: [],
    variables: [],
    functions: [],
    metadata: {
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: '1.0.0',
      language: 'typescript',
      complexity_score: 0,
      performance_score: 100,
      security_score: 100,
      quality_score: 100
    }
  });

  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [selectedConnections, setSelectedConnections] = useState<string[]>([]);
  const [draggedNode, setDraggedNode] = useState<any>(null);
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Editor States
  const [showCodeView, setShowCodeView] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('typescript');
  const [syntaxErrors, setSyntaxErrors] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // UI States
  const [showNodeLibrary, setShowNodeLibrary] = useState(true);
  const [showProperties, setShowProperties] = useState(true);
  const [showDebugger, setShowDebugger] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);

  // Performance and Analytics States
  const [scriptMetrics, setScriptMetrics] = useState<ScriptMetrics | null>(null);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<any[]>([]);

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);

  // Canvas Operations
  const handleCanvasDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    
    if (!draggedNode || readonly) return;

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const x = (event.clientX - canvasRect.left - canvasPosition.x) / canvasZoom;
    const y = (event.clientY - canvasRect.top - canvasPosition.y) / canvasZoom;

    const newNode: ScriptNode = {
      id: `node_${Date.now()}_${generateUniqueNodeId()}`,
      type: draggedNode.type as ScriptNodeType,
      position: { x, y },
      data: {
        label: draggedNode.description || draggedNode.type.replace(/_/g, ' '),
        parameters: draggedNode.parameters || [],
        inputs: draggedNode.inputs || [],
        outputs: draggedNode.outputs || [],
        config: {}
      },
      metadata: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: draggedNode.category || 'general',
        description: draggedNode.description || '',
        version: '1.0.0'
      }
    };

    setScript(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      metadata: {
        ...prev.metadata,
        updated_at: new Date().toISOString()
      }
    }));

    setDraggedNode(null);
    
    // Track activity
    trackActivity({
      action: 'script_node_added',
      resource_type: 'visual_script',
      resource_id: script.id,
      details: {
        node_type: newNode.type,
        position: { x, y }
      }
    });

    onScriptChange?.(script);
  }, [draggedNode, canvasPosition, canvasZoom, readonly, script, onScriptChange, trackActivity]);

  // Code Generation with Full Backend Integration
  const generateCodeFromScript = useCallback(async () => {
    if (!script || script.nodes.length === 0) return;

    setIsGenerating(true);
    
    try {
      const codeRequest: CodeGenerationRequest = {
        script_definition: script,
        target_language: codeLanguage as any,
        optimization_level: 'high',
        include_comments: true,
        include_error_handling: true,
        include_logging: true,
        cross_spa_integration: true,
        performance_optimization: true,
        security_checks: true
      };

      const response = await generateScript(codeRequest);
      
      if (response.success && response.data) {
        setGeneratedCode(response.data.generated_code);
        setSyntaxErrors(response.data.validation_results || []);
        
        // Update script with generated code and metrics
        setScript(prev => ({
          ...prev,
          generated_code: response.data.generated_code,
          metadata: {
            ...prev.metadata,
            last_generated: new Date().toISOString(),
            complexity_score: response.data.complexity_score || prev.metadata.complexity_score,
            performance_score: response.data.performance_score || prev.metadata.performance_score,
            quality_score: response.data.quality_score || prev.metadata.quality_score,
            lines_of_code: response.data.generated_code.split('\n').length
          }
        }));

        // Track activity
        trackActivity({
          action: 'script_code_generated',
          resource_type: 'visual_script',
          resource_id: script.id,
          details: {
            language: codeLanguage,
            lines_of_code: response.data.generated_code.split('\n').length,
            complexity_score: response.data.complexity_score,
            has_cross_spa_integration: true
          }
        });
      }
    } catch (error) {
      console.error('Code generation failed:', error);
      setSyntaxErrors([{
        type: 'error',
        message: 'Code generation failed. Please check your script structure.',
        node_id: '',
        severity: 'high'
      }]);
    } finally {
      setIsGenerating(false);
    }
  }, [script, codeLanguage, generateScript, trackActivity]);

  // Script Validation with Cross-SPA Integration
  const validateScriptStructure = useCallback(async () => {
    if (!script || script.nodes.length === 0) return;

    setIsValidating(true);

    try {
      // Validate script structure
      const validation = await validateScript(script);
      
      // Validate cross-SPA integration
      const crossSpaValidation = await validateCrossGroupScript(script);
      
      const combinedErrors = [
        ...(validation.errors || []),
        ...(crossSpaValidation.errors || [])
      ];
      
      setSyntaxErrors(combinedErrors);
      
      // Update script metadata
      setScript(prev => ({
        ...prev,
        validation_results: {
          ...validation,
          cross_spa_validation: crossSpaValidation,
          errors: combinedErrors
        },
        metadata: {
          ...prev.metadata,
          last_validated: new Date().toISOString(),
          is_valid: combinedErrors.length === 0,
          error_count: combinedErrors.length,
          cross_spa_compatible: crossSpaValidation.is_valid
        }
      }));

      // Track validation activity
      trackActivity({
        action: 'script_validated',
        resource_type: 'visual_script',
        resource_id: script.id,
        details: {
          is_valid: combinedErrors.length === 0,
          error_count: combinedErrors.length,
          cross_spa_compatible: crossSpaValidation.is_valid
        }
      });
    } catch (error) {
      console.error('Script validation failed:', error);
      setSyntaxErrors([{
        type: 'error',
        message: 'Script validation failed. Please try again.',
        node_id: '',
        severity: 'high'
      }]);
    } finally {
      setIsValidating(false);
    }
  }, [script, validateScript, validateCrossGroupScript, trackActivity]);

  // Script Execution with Full Orchestration
  const executeScriptWithDebug = useCallback(async () => {
    if (!script || script.nodes.length === 0 || readonly) return;

    setIsExecuting(true);

    try {
      const executionContext: ExecutionContext = {
        script_id: script.id,
        user_id: getCurrentUser()?.id || '',
        workspace_id: getActiveWorkspace()?.id || '',
        debug_mode: showDebugger,
        execution_mode: 'visual',
        cross_spa_integration: true,
        performance_monitoring: true,
        security_checks: true
      };

      // Execute script through orchestration service
      const execution = await orchestrateScriptExecution(script, executionContext);
      
      if (execution.success) {
        // Update script metrics
        if (execution.metrics) {
          setScriptMetrics(execution.metrics);
        }

        // Track successful execution
        trackActivity({
          action: 'script_executed',
          resource_type: 'visual_script',
          resource_id: script.id,
          details: {
            execution_time: execution.execution_time,
            success: execution.success,
            cross_spa_operations: execution.cross_spa_operations || 0,
            performance_score: execution.performance_score
          }
        });

        onScriptExecute?.(script);
      }
    } catch (error) {
      console.error('Script execution failed:', error);
      trackActivity({
        action: 'script_execution_failed',
        resource_type: 'visual_script',
        resource_id: script.id,
        details: {
          error: error.message,
          execution_time: 0
        }
      });
    } finally {
      setIsExecuting(false);
    }
  }, [script, showDebugger, readonly, getCurrentUser, getActiveWorkspace, orchestrateScriptExecution, trackActivity, onScriptExecute]);

  // AI-Powered Script Analysis and Optimization
  const getAIOptimizations = useCallback(async () => {
    if (!script || script.nodes.length === 0) return;

    try {
      const [analysis, optimizations, suggestions, vulnerabilities] = await Promise.all([
        analyzeScript(script),
        optimizeScriptWithAI(script),
        suggestScriptImprovements(script),
        detectScriptVulnerabilities(script)
      ]);

      setOptimizationSuggestions(optimizations);
      
      // Update script with AI insights
      setScript(prev => ({
        ...prev,
        ai_analysis: analysis,
        optimization_suggestions: optimizations,
        improvement_suggestions: suggestions,
        security_analysis: vulnerabilities,
        metadata: {
          ...prev.metadata,
          last_ai_analysis: new Date().toISOString(),
          ai_optimization_score: analysis?.optimization_score || prev.metadata.performance_score,
          security_score: vulnerabilities?.security_score || prev.metadata.security_score
        }
      }));

      // Track AI analysis
      trackActivity({
        action: 'script_ai_analyzed',
        resource_type: 'visual_script',
        resource_id: script.id,
        details: {
          optimization_suggestions: optimizations.length,
          improvement_suggestions: suggestions.length,
          security_issues: vulnerabilities?.issues?.length || 0,
          ai_confidence: analysis?.confidence || 0
        }
      });

      setShowAISuggestions(true);
    } catch (error) {
      console.error('AI analysis failed:', error);
    }
  }, [script, analyzeScript, optimizeScriptWithAI, suggestScriptImprovements, detectScriptVulnerabilities, trackActivity]);

  // Node Library Render with Advanced Search and Filtering
  const renderNodeLibrary = () => {
    const filteredCategories = SCRIPT_CATEGORIES.filter(category => 
      activeCategory === 'all' || category.id === activeCategory
    );

    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Node Library</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowNodeLibrary(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <Input
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8"
            />
            <Select value={activeCategory} onValueChange={setActiveCategory}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {SCRIPT_CATEGORIES.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center space-x-2">
                      <category.icon className={`h-4 w-4 ${category.color}`} />
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="p-4 space-y-4">
              {filteredCategories.map(category => {
                const categoryNodes = Object.values(SCRIPT_NODE_TYPES).filter(nodeType => 
                  nodeType.category.toLowerCase().replace(/\s+/g, '_') === category.id &&
                  (searchQuery === '' || 
                   nodeType.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   nodeType.type.toLowerCase().includes(searchQuery.toLowerCase()))
                );

                if (categoryNodes.length === 0) return null;

                return (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center space-x-2 sticky top-0 bg-white py-1">
                      <category.icon className={`h-4 w-4 ${category.color}`} />
                      <h4 className="text-sm font-medium">{category.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {categoryNodes.length}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {categoryNodes.map(nodeType => (
                        <TooltipProvider key={nodeType.type}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="flex items-center p-2 rounded-md border border-gray-200 hover:border-gray-300 cursor-grab active:cursor-grabbing transition-all hover:shadow-sm"
                                draggable
                                onDragStart={() => setDraggedNode(nodeType)}
                              >
                                <div className={`p-1 rounded ${nodeType.color} text-white mr-2 shadow-sm`}>
                                  <nodeType.icon className="h-3 w-3" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">
                                    {nodeType.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">{nodeType.description}</p>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                              <div className="space-y-2">
                                <h4 className="font-medium">{nodeType.type.replace(/_/g, ' ')}</h4>
                                <p className="text-sm">{nodeType.description}</p>
                                {nodeType.parameters && nodeType.parameters.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium mb-1">Parameters:</p>
                                    <ul className="text-xs space-y-1">
                                      {nodeType.parameters.slice(0, 3).map((param, index) => (
                                        <li key={index}>• {param.name} ({param.type})</li>
                                      ))}
                                      {nodeType.parameters.length > 3 && (
                                        <li>• ... and {nodeType.parameters.length - 3} more</li>
                                      )}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  // Advanced Canvas with Grid, Minimap, and Node Rendering
  const renderCanvas = () => (
    <div className="relative flex-1 bg-gray-50 overflow-hidden">
      {/* Advanced Grid System */}
      {showGrid && (
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, #e5e7eb 1px, transparent 1px),
              linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
            `,
            backgroundSize: `${20 * canvasZoom}px ${20 * canvasZoom}px`,
            transform: `translate(${canvasPosition.x % (20 * canvasZoom)}px, ${canvasPosition.y % (20 * canvasZoom)}px)`
          }}
        />
      )}

      {/* Canvas Content */}
      <div
        ref={canvasRef}
        className="absolute inset-0 cursor-move"
        onDrop={handleCanvasDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px) scale(${canvasZoom})`
        }}
      >
        {/* Connection Lines SVG Layer */}
        <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
          {script.connections?.map(connection => (
            <g key={connection.id}>
              {/* Advanced connection rendering would go here */}
              <path
                d={`M ${connection.source_position?.x || 0} ${connection.source_position?.y || 0} 
                   L ${connection.target_position?.x || 100} ${connection.target_position?.y || 100}`}
                stroke="#3b82f6"
                strokeWidth="2"
                fill="none"
                className="drop-shadow-sm"
              />
            </g>
          ))}
        </svg>

        {/* Nodes Layer */}
        <div className="relative" style={{ zIndex: 2 }}>
          {script.nodes.map(node => {
            const nodeType = SCRIPT_NODE_TYPES[node.type as keyof typeof SCRIPT_NODE_TYPES];
            const isSelected = selectedNodes.includes(node.id);
            
            return (
              <ContextMenu key={node.id}>
                <ContextMenuTrigger>
                  <motion.div
                    className={`absolute p-3 bg-white rounded-lg border-2 shadow-sm cursor-pointer select-none min-w-[150px] ${
                      isSelected ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                    style={{
                      left: node.position.x,
                      top: node.position.y
                    }}
                    onClick={() => setSelectedNodes([node.id])}
                    drag
                    dragMomentum={false}
                    onDrag={(event, info) => {
                      if (!readonly) {
                        setScript(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => 
                            n.id === node.id 
                              ? { 
                                  ...n, 
                                  position: { 
                                    x: n.position.x + info.delta.x / canvasZoom, 
                                    y: n.position.y + info.delta.y / canvasZoom 
                                  }
                                }
                              : n
                          )
                        }));
                      }
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    whileDrag={{ scale: 1.05, zIndex: 1000 }}
                  >
                    {/* Node Header */}
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`p-1.5 rounded ${nodeType?.color || 'bg-gray-500'} text-white shadow-sm`}>
                        {nodeType?.icon && <nodeType.icon className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{node.data.label}</p>
                        <p className="text-xs text-gray-500 truncate">{node.type}</p>
                      </div>
                      {isSelected && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!readonly) {
                              setScript(prev => ({
                                ...prev,
                                nodes: prev.nodes.filter(n => n.id !== node.id),
                                connections: prev.connections?.filter(c => 
                                  c.source_node_id !== node.id && c.target_node_id !== node.id
                                ) || []
                              }));
                              setSelectedNodes([]);
                            }
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    {/* Node Ports */}
                    <div className="flex justify-between items-center">
                      {/* Input Ports */}
                      <div className="flex flex-col space-y-1">
                        {nodeType?.inputs?.map((input, index) => (
                          <TooltipProvider key={index}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className="w-3 h-3 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600 transition-colors shadow-sm"
                                  style={{ marginLeft: -6 }}
                                />
                              </TooltipTrigger>
                              <TooltipContent side="left">
                                <p>{input.name} ({input.type})</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                      
                      {/* Output Ports */}
                      <div className="flex flex-col space-y-1">
                        {nodeType?.outputs?.map((output, index) => (
                          <TooltipProvider key={index}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className="w-3 h-3 bg-green-500 rounded-full cursor-pointer hover:bg-green-600 transition-colors shadow-sm"
                                  style={{ marginRight: -6 }}
                                />
                              </TooltipTrigger>
                              <TooltipContent side="right">
                                <p>{output.name} ({output.type})</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    </div>
                    
                    {/* Node Status Indicators */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      <div className="flex space-x-1">
                        {node.metadata?.has_errors && (
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                        )}
                        {node.metadata?.has_warnings && (
                          <AlertTriangle className="h-3 w-3 text-yellow-500" />
                        )}
                        {node.metadata?.is_optimized && (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {nodeType?.category}
                      </Badge>
                    </div>
                  </motion.div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => setSelectedNodes([node.id])}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Properties
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => {/* Copy node logic */}}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </ContextMenuItem>
                  <ContextMenuItem 
                    onClick={() => {
                      if (!readonly) {
                        setScript(prev => ({
                          ...prev,
                          nodes: prev.nodes.filter(n => n.id !== node.id)
                        }));
                      }
                    }}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          })}
        </div>
      </div>

      {/* Advanced Canvas Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        {/* Zoom and View Controls */}
        <div className="flex space-x-1 bg-white rounded-lg border shadow-sm p-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCanvasZoom(prev => Math.min(prev * 1.2, 3))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In (Ctrl + +)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCanvasZoom(prev => Math.max(prev / 1.2, 0.1))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out (Ctrl + -)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCanvasZoom(1);
                    setCanvasPosition({ x: 0, y: 0 });
                  }}
                >
                  <Target className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset View (Ctrl + 0)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Display Options */}
        <div className="flex space-x-1 bg-white rounded-lg border shadow-sm p-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showGrid ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setShowGrid(!showGrid)}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Grid (G)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showMinimap ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setShowMinimap(!showMinimap)}
                >
                  <Map className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Minimap (M)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Current Zoom Level Display */}
        <div className="bg-white rounded-lg border shadow-sm px-2 py-1">
          <span className="text-xs font-mono text-gray-600">
            {Math.round(canvasZoom * 100)}%
          </span>
        </div>
      </div>

      {/* Advanced Minimap */}
      {showMinimap && (
        <div className="absolute bottom-4 right-4 w-48 h-32 bg-white border rounded-lg shadow-sm overflow-hidden">
          <div className="h-6 px-2 py-1 bg-gray-50 border-b flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Minimap</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
              onClick={() => setShowMinimap(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="w-full h-full bg-gray-50 relative overflow-hidden p-1">
            {/* Minimap Nodes */}
            {script.nodes.map(node => (
              <div
                key={node.id}
                className="absolute w-2 h-2 bg-blue-500 rounded cursor-pointer hover:bg-blue-600"
                style={{
                  left: `${Math.max(0, Math.min((node.position.x / 2000) * 100, 95))}%`,
                  top: `${Math.max(0, Math.min((node.position.y / 2000) * 100, 85))}%`
                }}
                onClick={() => {
                  setCanvasPosition({
                    x: -node.position.x * canvasZoom + 400,
                    y: -node.position.y * canvasZoom + 300
                  });
                }}
              />
            ))}
            
            {/* Viewport Indicator */}
            <div 
              className="absolute border-2 border-red-500 bg-red-100 bg-opacity-20 pointer-events-none"
              style={{
                left: `${Math.max(0, Math.min((-canvasPosition.x / (2000 * canvasZoom)) * 100, 90))}%`,
                top: `${Math.max(0, Math.min((-canvasPosition.y / (2000 * canvasZoom)) * 100, 80))}%`,
                width: `${Math.min((100 / canvasZoom), 90)}%`,
                height: `${Math.min((100 / canvasZoom), 80)}%`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );

  // Advanced Code View with Monaco Editor
  const renderCodeView = () => (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-4">
          <h3 className="text-sm font-medium">Generated Code</h3>
          <Select value={codeLanguage} onValueChange={setCodeLanguage}>
            <SelectTrigger className="h-8 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="sql">SQL</SelectItem>
              <SelectItem value="csharp">C#</SelectItem>
              <SelectItem value="java">Java</SelectItem>
            </SelectContent>
          </Select>
          {script.metadata && (
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Badge variant="outline">{script.metadata.lines_of_code || 0} lines</Badge>
              <Badge variant="outline">Complexity: {script.metadata.complexity_score}</Badge>
              <Badge variant="outline">Quality: {script.metadata.quality_score}%</Badge>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generateCodeFromScript}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Generate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigator.clipboard.writeText(generatedCode)}
            disabled={!generatedCode}
          >
            <Copy className="h-4 w-4" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const blob = new Blob([generatedCode], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${script.name}.${codeLanguage === 'typescript' ? 'ts' : codeLanguage}`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            disabled={!generatedCode}
          >
            <Download className="h-4 w-4" />
            ArrowDownTrayIcon
          </Button>
        </div>
      </div>
      
      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={codeLanguage}
          value={generatedCode || '// Generated code will appear here...\n// Add nodes to your visual script and click Generate'}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: 'on',
            folding: true,
            wordWrap: 'on',
            automaticLayout: true,
            renderWhitespace: 'selection',
            bracketPairColorization: { enabled: true },
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            renderLineHighlight: 'line',
            contextmenu: true,
            mouseWheelZoom: true
          }}
          onMount={(editor) => {
            editorRef.current = editor;
            // Add custom themes and configurations
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyG, () => {
              generateCodeFromScript();
            });
          }}
        />
      </div>
      
      {/* Syntax Errors and Validation Results */}
      {syntaxErrors.length > 0 && (
        <div className="border-t bg-red-50 p-4 max-h-40 overflow-y-auto">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">
              {syntaxErrors.length} Error{syntaxErrors.length !== 1 ? 's' : ''} Found
            </span>
          </div>
          <div className="space-y-1">
            {syntaxErrors.map((error, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="flex-shrink-0 mt-0.5">
                  <div className={`w-2 h-2 rounded-full ${
                    error.severity === 'high' ? 'bg-red-500' :
                    error.severity === 'medium' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-red-700">{error.message}</p>
                  {error.node_id && (
                    <p className="text-xs text-red-600">Node: {error.node_id}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Properties Panel with Advanced Node Configuration
  const renderPropertiesPanel = () => {
    const selectedNode = selectedNodes.length === 1 ? 
      script.nodes.find(node => node.id === selectedNodes[0]) : null;
    
    const nodeType = selectedNode ? 
      SCRIPT_NODE_TYPES[selectedNode.type as keyof typeof SCRIPT_NODE_TYPES] : null;

    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowProperties(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-200px)]">
            {!selectedNode ? (
              <div className="text-center text-gray-500 py-8">
                <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a node to view properties</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Node Basic Info */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1 rounded ${nodeType?.color || 'bg-gray-500'} text-white`}>
                      {nodeType?.icon && <nodeType.icon className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{selectedNode.data.label}</p>
                      <p className="text-xs text-gray-500">{selectedNode.type}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Node ID</Label>
                    <Input value={selectedNode.id} disabled className="h-8 text-xs font-mono" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Label</Label>
                    <Input 
                      value={selectedNode.data.label} 
                      onChange={(e) => {
                        if (!readonly) {
                          setScript(prev => ({
                            ...prev,
                            nodes: prev.nodes.map(node => 
                              node.id === selectedNode.id 
                                ? { ...node, data: { ...node.data, label: e.target.value } }
                                : node
                            )
                          }));
                        }
                      }}
                      className="h-8 text-xs" 
                      disabled={readonly}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">X Position</Label>
                      <Input 
                        type="number"
                        value={Math.round(selectedNode.position.x)} 
                        onChange={(e) => {
                          if (!readonly) {
                            setScript(prev => ({
                              ...prev,
                              nodes: prev.nodes.map(node => 
                                node.id === selectedNode.id 
                                  ? { ...node, position: { ...node.position, x: parseInt(e.target.value) || 0 } }
                                  : node
                              )
                            }));
                          }
                        }}
                        className="h-8 text-xs" 
                        disabled={readonly}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Y Position</Label>
                      <Input 
                        type="number"
                        value={Math.round(selectedNode.position.y)} 
                        onChange={(e) => {
                          if (!readonly) {
                            setScript(prev => ({
                              ...prev,
                              nodes: prev.nodes.map(node => 
                                node.id === selectedNode.id 
                                  ? { ...node, position: { ...node.position, y: parseInt(e.target.value) || 0 } }
                                  : node
                              )
                            }));
                          }
                        }}
                        className="h-8 text-xs" 
                        disabled={readonly}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Node Parameters Configuration */}
                {nodeType?.parameters && nodeType.parameters.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Parameters</h4>
                    {nodeType.parameters.map((param, index) => (
                      <div key={index} className="space-y-2">
                        <Label className="text-xs font-medium">
                          {param.name}
                          {param.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {param.type === 'select' ? (
                          <Select
                            value={selectedNode.data.config?.[param.name] || param.default || ''}
                            onValueChange={(value) => {
                              if (!readonly) {
                                setScript(prev => ({
                                  ...prev,
                                  nodes: prev.nodes.map(node => 
                                    node.id === selectedNode.id 
                                      ? { 
                                          ...node, 
                                          data: { 
                                            ...node.data, 
                                            config: { 
                                              ...node.data.config, 
                                              [param.name]: value 
                                            } 
                                          } 
                                        }
                                      : node
                                  )
                                }));
                              }
                            }}
                            disabled={readonly}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder={`Select ${param.name}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {param.options?.map(option => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : param.type === 'boolean' ? (
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={selectedNode.data.config?.[param.name] || param.default || false}
                              onCheckedChange={(checked) => {
                                if (!readonly) {
                                  setScript(prev => ({
                                    ...prev,
                                    nodes: prev.nodes.map(node => 
                                      node.id === selectedNode.id 
                                        ? { 
                                            ...node, 
                                            data: { 
                                              ...node.data, 
                                              config: { 
                                                ...node.data.config, 
                                                [param.name]: checked 
                                              } 
                                            } 
                                          }
                                        : node
                                    )
                                  }));
                                }
                              }}
                              disabled={readonly}
                            />
                            <Label className="text-xs">{param.name}</Label>
                          </div>
                        ) : param.type === 'number' ? (
                          <Input
                            type="number"
                            value={selectedNode.data.config?.[param.name] || param.default || ''}
                            onChange={(e) => {
                              if (!readonly) {
                                setScript(prev => ({
                                  ...prev,
                                  nodes: prev.nodes.map(node => 
                                    node.id === selectedNode.id 
                                      ? { 
                                          ...node, 
                                          data: { 
                                            ...node.data, 
                                            config: { 
                                              ...node.data.config, 
                                              [param.name]: parseFloat(e.target.value) || param.default 
                                            } 
                                          } 
                                        }
                                      : node
                                  )
                                }));
                              }
                            }}
                            className="h-8 text-xs"
                            disabled={readonly}
                            placeholder={param.default?.toString() || ''}
                          />
                        ) : (
                          <Input
                            value={selectedNode.data.config?.[param.name] || param.default || ''}
                            onChange={(e) => {
                              if (!readonly) {
                                setScript(prev => ({
                                  ...prev,
                                  nodes: prev.nodes.map(node => 
                                    node.id === selectedNode.id 
                                      ? { 
                                          ...node, 
                                          data: { 
                                            ...node.data, 
                                            config: { 
                                              ...node.data.config, 
                                              [param.name]: e.target.value 
                                            } 
                                          } 
                                        }
                                      : node
                                  )
                                }));
                              }
                            }}
                            className="h-8 text-xs"
                            disabled={readonly}
                            placeholder={param.default?.toString() || `Enter ${param.name}`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <Separator />

                {/* Node Inputs/Outputs */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Connections</h4>
                  
                  {nodeType?.inputs && nodeType.inputs.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-blue-600">Inputs</Label>
                      {nodeType.inputs.map((input, index) => (
                        <div key={index} className="flex items-center space-x-2 text-xs">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <span>{input.name}</span>
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {input.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {nodeType?.outputs && nodeType.outputs.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-green-600">Outputs</Label>
                      {nodeType.outputs.map((output, index) => (
                        <div key={index} className="flex items-center space-x-2 text-xs">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span>{output.name}</span>
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {output.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Node Metadata */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Metadata</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <Label className="text-xs text-gray-500">Created</Label>
                      <p className="truncate">
                        {new Date(selectedNode.metadata?.created_at || '').toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Updated</Label>
                      <p className="truncate">
                        {new Date(selectedNode.metadata?.updated_at || '').toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Category</Label>
                      <p className="truncate">{selectedNode.metadata?.category}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Version</Label>
                      <p className="truncate">{selectedNode.metadata?.version}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  // Effects for Auto-validation and Code Generation
  useEffect(() => {
    if (initialScript) {
      setScript(initialScript);
    }
  }, [initialScript]);

  useEffect(() => {
    // Auto-validate script when nodes change
    const debounceTimeout = setTimeout(() => {
      if (script.nodes.length > 0) {
        validateScriptStructure();
      }
    }, 1000);

    return () => clearTimeout(debounceTimeout);
  }, [script.nodes, validateScriptStructure]);

  useEffect(() => {
    // Auto-generate code when script changes and code view is active
    const debounceTimeout = setTimeout(() => {
      if (script.nodes.length > 0 && showCodeView) {
        generateCodeFromScript();
      }
    }, 2000);

    return () => clearTimeout(debounceTimeout);
  }, [script.nodes, script.connections, showCodeView, generateCodeFromScript]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 's':
            event.preventDefault();
            onScriptSave?.(script);
            break;
          case 'r':
            event.preventDefault();
            executeScriptWithDebug();
            break;
          case 'g':
            event.preventDefault();
            generateCodeFromScript();
            break;
          case 'a':
            event.preventDefault();
            setSelectedNodes(script.nodes.map(node => node.id));
            break;
          case '=':
          case '+':
            event.preventDefault();
            setCanvasZoom(prev => Math.min(prev * 1.2, 3));
            break;
          case '-':
            event.preventDefault();
            setCanvasZoom(prev => Math.max(prev / 1.2, 0.1));
            break;
          case '0':
            event.preventDefault();
            setCanvasZoom(1);
            setCanvasPosition({ x: 0, y: 0 });
            break;
        }
      }
      
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedNodes.length > 0 && !readonly) {
          event.preventDefault();
          setScript(prev => ({
            ...prev,
            nodes: prev.nodes.filter(node => !selectedNodes.includes(node.id)),
            connections: prev.connections?.filter(conn => 
              !selectedNodes.includes(conn.source_node_id) && !selectedNodes.includes(conn.target_node_id)
            ) || []
          }));
          setSelectedNodes([]);
        }
      }
      
      switch (event.key) {
        case 'g':
          if (!event.ctrlKey && !event.metaKey) {
            setShowGrid(!showGrid);
          }
          break;
        case 'm':
          setShowMinimap(!showMinimap);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [script, selectedNodes, readonly, onScriptSave, executeScriptWithDebug, generateCodeFromScript, showGrid, showMinimap]);

  // Main Render
  return (
    <div className={`flex h-full bg-white ${className}`}>
      <TooltipProvider>
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Node Library Panel */}
          {showNodeLibrary && (
            <>
              <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                {renderNodeLibrary()}
              </ResizablePanel>
              <ResizableHandle />
            </>
          )}

          {/* Main Canvas/Code View Panel */}
          <ResizablePanel defaultSize={showNodeLibrary && showProperties ? 60 : 80}>
            <div className="h-full flex flex-col">
              {/* Advanced Toolbar */}
              <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-white to-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <WorkflowIcon className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-semibold">{script.name}</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{script.nodes.length} nodes</Badge>
                    {script.connections && script.connections.length > 0 && (
                      <Badge variant="outline">{script.connections.length} connections</Badge>
                    )}
                    {syntaxErrors.length > 0 && (
                      <Badge variant="destructive">{syntaxErrors.length} errors</Badge>
                    )}
                    {script.metadata?.complexity_score !== undefined && (
                      <Badge variant="outline">Complexity: {script.metadata.complexity_score}</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* View Toggle */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <Button
                      variant={!showCodeView ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setShowCodeView(false)}
                    >
                      <WorkflowIcon className="h-4 w-4 mr-1" />
                      Visual
                    </Button>
                    <Button
                      variant={showCodeView ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setShowCodeView(true)}
                    >
                      <Code className="h-4 w-4 mr-1" />
                      Code
                    </Button>
                  </div>
                  
                  {/* Action Buttons */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={validateScriptStructure}
                    disabled={isValidating}
                  >
                    {isValidating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Validate
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={executeScriptWithDebug}
                    disabled={isExecuting || readonly || script.nodes.length === 0}
                  >
                    {isExecuting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    Execute
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onScriptSave?.(script)}
                    disabled={readonly}
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                  
                  {/* Advanced Options Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={getAIOptimizations}>
                        <Brain className="h-4 w-4 mr-2" />
                        AI Analysis & Optimization
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowDebugger(!showDebugger)}>
                        <Terminal className="h-4 w-4 mr-2" />
                        Toggle Debugger
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowPerformance(!showPerformance)}>
                        <Activity className="h-4 w-4 mr-2" />
                        Performance Monitor
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowAISuggestions(!showAISuggestions)}>
                        <Lightbulb className="h-4 w-4 mr-2" />
                        AI Suggestions
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        const exportData = {
                          script,
                          metadata: {
                            exported_at: new Date().toISOString(),
                            exported_by: getCurrentUser()?.id,
                            version: script.metadata?.version || '1.0.0'
                          }
                        };
                        const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
                          type: 'application/json' 
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${script.name}.racine-script.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Script
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Canvas or Code View */}
              <div className="flex-1">
                {showCodeView ? renderCodeView() : renderCanvas()}
              </div>
            </div>
          </ResizablePanel>

          {/* Properties Panel */}
          {showProperties && (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                {renderPropertiesPanel()}
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>

        {/* Toggle Buttons for Hidden Panels */}
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2">
          {!showNodeLibrary && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNodeLibrary(true)}
                    className="rotate-90 origin-center"
                  >
                    <Package className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Show Node Library</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2">
          {!showProperties && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowProperties(true)}
                    className="-rotate-90 origin-center"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">Show Properties</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* AI Suggestions Panel */}
        {showAISuggestions && optimizationSuggestions.length > 0 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-96 max-h-64 bg-white border rounded-lg shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center space-x-2">
                <Brain className="h-4 w-4 text-purple-600" />
                <h3 className="text-sm font-medium">AI Suggestions</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAISuggestions(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="max-h-48 p-3">
              <div className="space-y-2">
                {optimizationSuggestions.slice(0, 5).map((suggestion, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                    <p className="font-medium text-gray-800">{suggestion.title}</p>
                    <p className="text-gray-600 text-xs mt-1">{suggestion.description}</p>
                    {suggestion.impact && (
                      <Badge variant="outline" className="text-xs mt-1">
                        Impact: {suggestion.impact}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </TooltipProvider>
    </div>
  );
};

export default VisualScriptingEngine;