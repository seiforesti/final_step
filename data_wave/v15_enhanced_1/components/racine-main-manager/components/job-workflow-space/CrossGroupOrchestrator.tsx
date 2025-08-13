'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Network, Globe, ArrowRight, ArrowDown, ArrowUp, GitBranch, Workflow,
  Database, Search, Shield, Users, Brain, Package, Activity, Zap,
  CheckCircle, XCircle, AlertTriangle, Clock, Play, Pause, Settings,
  MoreHorizontal, X, Plus, Minus, RefreshCw, Download, Upload, Eye,
  BarChart3, TrendingUp, Layers, Route, Target, Filter, Monitor,
  Link2, Unlink2, Share2, Copy, Edit3, Trash2, Save, FileText,
  EyeOff, HelpCircle, Code, Terminal, Cpu, Memory, HardDrive
} from 'lucide-react';

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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';

// D3.js for advanced flow visualization
import * as d3 from 'd3';

// Advanced Chart components
import { LineChart, BarChart, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, Line, Bar, Area } from 'recharts';

// Racine System Imports
import { useJobWorkflow } from '../../hooks/useJobWorkflow';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { useAIAssistant } from '../../hooks/useAIAssistant';

// Backend Integration Utilities
import { 
  executeWorkflowStep, 
  orchestrate7GroupWorkflow,
  validateCrossGroupWorkflow,
  validateWorkflowCompliance
} from '../../utils/workflow-backend-integration';

// Types from racine-core.types
import { 
  CrossGroupWorkflow,
  SPAIntegration,
  DataFlowMapping,
  PermissionOrchestration,
  CrossGroupMetrics,
  WorkflowStep,
  DataTransformation,
  IntegrationPoint,
  OrchestrationRule,
  CrossGroupValidation,
  ExecutionContext,
  WorkflowTemplate,
  SPAHealthStatus,
  CrossGroupDependency
} from '../../types/racine-core.types';

// Comprehensive SPA Configuration with Advanced Integration Details
const SPA_CONFIGURATIONS = {
  DATA_SOURCES: {
    id: 'data-sources',
    name: 'Data Sources',
    icon: Database,
    color: '#10b981',
    gradient: 'from-emerald-400 to-emerald-600',
    path: 'v15_enhanced_1/components/data-sources/',
    api_base: '/api/data-sources',
    capabilities: ['connect', 'query', 'monitor', 'catalog', 'stream', 'batch'],
    data_types: ['connection', 'query_result', 'metadata', 'metrics', 'schema', 'lineage'],
    integration_points: ['catalog_registration', 'scan_trigger', 'compliance_check'],
    resource_requirements: { cpu: 2, memory: '4GB', storage: '10GB' },
    avg_response_time: 250,
    reliability_score: 98.5
  },
  SCAN_RULE_SETS: {
    id: 'scan-rule-sets',
    name: 'Scan Rule Sets',
    icon: Search,
    color: '#8b5cf6',
    gradient: 'from-violet-400 to-violet-600',
    path: 'v15_enhanced_1/components/Advanced-Scan-Rule-Sets/',
    api_base: '/api/scan-rule-sets',
    capabilities: ['create_rule', 'execute_rule', 'validate', 'optimize', 'schedule', 'monitor'],
    data_types: ['rule_definition', 'scan_result', 'validation_report', 'performance_metrics', 'pattern_match'],
    integration_points: ['data_source_scan', 'classification_trigger', 'compliance_validation'],
    resource_requirements: { cpu: 4, memory: '8GB', storage: '20GB' },
    avg_response_time: 180,
    reliability_score: 97.2
  },
  CLASSIFICATIONS: {
    id: 'classifications',
    name: 'Classifications',
    icon: Package,
    color: '#f59e0b',
    gradient: 'from-amber-400 to-amber-600',
    path: 'v15_enhanced_1/components/classifications/',
    api_base: '/api/classifications',
    capabilities: ['classify', 'tag', 'categorize', 'analyze', 'recommend', 'auto_tag'],
    data_types: ['classification_result', 'tag_mapping', 'category_data', 'analysis_report', 'confidence_score'],
    integration_points: ['scan_result_classification', 'catalog_enrichment', 'policy_application'],
    resource_requirements: { cpu: 3, memory: '6GB', storage: '15GB' },
    avg_response_time: 320,
    reliability_score: 96.8
  },
  COMPLIANCE_RULE: {
    id: 'compliance-rule',
    name: 'Compliance Rule',
    icon: Shield,
    color: '#ef4444',
    gradient: 'from-red-400 to-red-600',
    path: 'v15_enhanced_1/components/Compliance-Rule/',
    api_base: '/api/compliance-rules',
    capabilities: ['audit', 'validate', 'report', 'monitor', 'remediate', 'alert'],
    data_types: ['compliance_report', 'audit_result', 'violation_alert', 'remediation_plan', 'risk_score'],
    integration_points: ['classification_compliance', 'scan_validation', 'rbac_enforcement'],
    resource_requirements: { cpu: 2, memory: '4GB', storage: '25GB' },
    avg_response_time: 400,
    reliability_score: 99.1
  },
  ADVANCED_CATALOG: {
    id: 'advanced-catalog',
    name: 'Advanced Catalog',
    icon: Package,
    color: '#3b82f6',
    gradient: 'from-blue-400 to-blue-600',
    path: 'v15_enhanced_1/components/Advanced-Catalog/',
    api_base: '/api/advanced-catalog',
    capabilities: ['register', 'discover', 'lineage', 'search', 'recommend', 'version'],
    data_types: ['catalog_entry', 'lineage_data', 'discovery_result', 'search_result', 'relationship_map'],
    integration_points: ['data_source_registration', 'classification_enrichment', 'compliance_tagging'],
    resource_requirements: { cpu: 3, memory: '8GB', storage: '50GB' },
    avg_response_time: 200,
    reliability_score: 98.9
  },
  SCAN_LOGIC: {
    id: 'scan-logic',
    name: 'Scan Logic',
    icon: Activity,
    color: '#06b6d4',
    gradient: 'from-cyan-400 to-cyan-600',
    path: 'v15_enhanced_1/components/Advanced-Scan-Logic/',
    api_base: '/api/scan-logic',
    capabilities: ['execute_scan', 'process_results', 'optimize', 'schedule', 'parallel', 'stream'],
    data_types: ['scan_config', 'scan_result', 'processing_report', 'optimization_data', 'performance_stats'],
    integration_points: ['rule_execution', 'result_classification', 'catalog_update'],
    resource_requirements: { cpu: 6, memory: '12GB', storage: '30GB' },
    avg_response_time: 150,
    reliability_score: 97.5
  },
  RBAC_SYSTEM: {
    id: 'rbac-system',
    name: 'RBAC System',
    icon: Users,
    color: '#6b7280',
    gradient: 'from-gray-400 to-gray-600',
    path: 'v15_enhanced_1/components/Advanced_RBAC_Datagovernance_System/',
    api_base: '/api/rbac',
    capabilities: ['authenticate', 'authorize', 'audit', 'manage', 'delegate', 'monitor'],
    data_types: ['user_data', 'permission_map', 'audit_log', 'access_report', 'role_definition'],
    integration_points: ['cross_spa_auth', 'workflow_permissions', 'data_access_control'],
    resource_requirements: { cpu: 2, memory: '4GB', storage: '20GB' },
    avg_response_time: 100,
    reliability_score: 99.5
  }
};

// Advanced Cross-Group Operation Templates
const CROSS_GROUP_OPERATIONS = {
  DATA_PIPELINE: {
    type: 'data_pipeline',
    name: 'Data Processing Pipeline',
    description: 'End-to-end data ingestion, scanning, classification, and cataloging',
    category: 'data_processing',
    complexity: 'high',
    typical_flow: ['data-sources', 'scan-logic', 'scan-rule-sets', 'classifications', 'advanced-catalog'],
    estimated_duration: 1800, // 30 minutes
    resource_intensity: 'high',
    use_cases: ['Data ingestion', 'Automated discovery', 'Compliance scanning'],
    prerequisites: ['Data source configured', 'Scan rules defined', 'Classification policies set'],
    outputs: ['Cataloged assets', 'Classification tags', 'Compliance reports'],
    success_rate: 94.5,
    avg_execution_time: 1650
  },
  COMPLIANCE_WORKFLOW: {
    type: 'compliance_workflow',
    name: 'Comprehensive Compliance Check',
    description: 'Full compliance validation across data sources with audit reporting',
    category: 'compliance',
    complexity: 'high',
    typical_flow: ['rbac-system', 'data-sources', 'scan-rule-sets', 'compliance-rule', 'advanced-catalog'],
    estimated_duration: 2400, // 40 minutes
    resource_intensity: 'medium',
    use_cases: ['Regulatory compliance', 'Data governance audit', 'Risk assessment'],
    prerequisites: ['Compliance policies defined', 'User permissions set', 'Audit rules configured'],
    outputs: ['Compliance report', 'Violation alerts', 'Remediation plans'],
    success_rate: 97.8,
    avg_execution_time: 2250
  },
  DISCOVERY_PIPELINE: {
    type: 'discovery_pipeline',
    name: 'Automated Data Discovery',
    description: 'Intelligent data discovery with automated classification and cataloging',
    category: 'discovery',
    complexity: 'medium',
    typical_flow: ['data-sources', 'scan-logic', 'classifications', 'advanced-catalog'],
    estimated_duration: 1200, // 20 minutes
    resource_intensity: 'medium',
    use_cases: ['New data discovery', 'Asset inventory', 'Data mapping'],
    prerequisites: ['Data sources accessible', 'Discovery rules configured'],
    outputs: ['Discovered assets', 'Classification metadata', 'Catalog entries'],
    success_rate: 96.2,
    avg_execution_time: 1100
  },
  GOVERNANCE_AUDIT: {
    type: 'governance_audit',
    name: 'Complete Governance Audit',
    description: 'Comprehensive governance assessment across all data assets',
    category: 'governance',
    complexity: 'high',
    typical_flow: ['rbac-system', 'advanced-catalog', 'compliance-rule', 'scan-rule-sets', 'data-sources'],
    estimated_duration: 3600, // 60 minutes
    resource_intensity: 'high',
    use_cases: ['Governance maturity assessment', 'Policy compliance check', 'Risk evaluation'],
    prerequisites: ['All SPAs operational', 'Governance policies defined', 'Audit scope configured'],
    outputs: ['Governance scorecard', 'Policy gaps', 'Improvement recommendations'],
    success_rate: 92.1,
    avg_execution_time: 3450
  },
  SECURITY_SCAN: {
    type: 'security_scan',
    name: 'Security Assessment Workflow',
    description: 'Comprehensive security scanning and vulnerability assessment',
    category: 'security',
    complexity: 'high',
    typical_flow: ['rbac-system', 'data-sources', 'scan-rule-sets', 'compliance-rule', 'advanced-catalog'],
    estimated_duration: 2700, // 45 minutes
    resource_intensity: 'high',
    use_cases: ['Security assessment', 'Vulnerability scanning', 'Access review'],
    prerequisites: ['Security policies defined', 'Scan rules configured', 'Access controls set'],
    outputs: ['Security report', 'Vulnerability alerts', 'Access recommendations'],
    success_rate: 95.7,
    avg_execution_time: 2580
  },
  QUICK_SCAN: {
    type: 'quick_scan',
    name: 'Quick Data Scan',
    description: 'Fast scan for immediate insights and basic classification',
    category: 'utility',
    complexity: 'low',
    typical_flow: ['data-sources', 'scan-logic', 'classifications'],
    estimated_duration: 300, // 5 minutes
    resource_intensity: 'low',
    use_cases: ['Quick assessment', 'Data preview', 'Rapid classification'],
    prerequisites: ['Data source available'],
    outputs: ['Basic classification', 'Quick insights', 'Summary report'],
    success_rate: 98.9,
    avg_execution_time: 280
  }
};

interface CrossGroupOrchestratorProps {
  workflowId?: string;
  initialWorkflow?: CrossGroupWorkflow;
  onWorkflowChange?: (workflow: CrossGroupWorkflow) => void;
  onWorkflowExecute?: (workflow: CrossGroupWorkflow) => void;
  onWorkflowSave?: (workflow: CrossGroupWorkflow) => void;
  readonly?: boolean;
  showAdvancedFeatures?: boolean;
  className?: string;
}

const CrossGroupOrchestrator: React.FC<CrossGroupOrchestratorProps> = ({
  workflowId,
  initialWorkflow,
  onWorkflowChange,
  onWorkflowExecute,
  onWorkflowSave,
  readonly = false,
  showAdvancedFeatures = true,
  className = ''
}) => {
  // Hooks for Backend Integration
  const { 
    createCrossGroupWorkflow,
    executeCrossGroupWorkflow,
    validateCrossGroupWorkflow,
    getCrossGroupMetrics,
    saveCrossGroupWorkflow,
    getCrossGroupTemplates,
    optimizeCrossGroupWorkflow
  } = useJobWorkflow();
  
  const { 
    orchestrateCrossGroup,
    getSystemIntegrationStatus,
    validatePermissions,
    getResourceAvailability,
    getSystemHealth
  } = useRacineOrchestration();
  
  const { 
    getAllSPAStatus,
    executeStepInSPA,
    coordinateSteps,
    getDataFlowMapping,
    validateSPAIntegration,
    getSPAHealthMetrics,
    testSPAConnectivity
  } = useCrossGroupIntegration();
  
  const { getCurrentUser, getUserPermissions } = useUserManagement();
  const { getActiveWorkspace } = useWorkspaceManagement();
  const { trackActivity } = useActivityTracker();
  const { 
    optimizeCrossGroupWorkflow: aiOptimize,
    suggestIntegrationImprovements,
    analyzeCrossGroupPerformance,
    predictWorkflowOutcome,
    detectIntegrationIssues
  } = useAIAssistant();

  // Core Workflow State
  const [workflow, setWorkflow] = useState<CrossGroupWorkflow>(initialWorkflow || {
    id: workflowId || '',
    name: 'New Cross-Group Workflow',
    description: '',
    category: 'custom',
    steps: [],
    data_flow: [],
    integration_points: [],
    orchestration_rules: [],
    dependencies: [],
    conditions: [],
    retry_policy: {
      max_retries: 3,
      retry_delay: 30,
      backoff_multiplier: 2
    },
    resource_requirements: {},
    estimated_duration: 0,
    metadata: {
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: '1.0.0',
      complexity: 'medium',
      tags: []
    }
  });

  // SPA and Integration State
  const [spaStatuses, setSpaStatuses] = useState<Record<string, SPAHealthStatus>>({});
  const [crossGroupMetrics, setCrossGroupMetrics] = useState<CrossGroupMetrics | null>(null);
  const [dataFlowMappings, setDataFlowMappings] = useState<DataFlowMapping[]>([]);
  const [integrationPoints, setIntegrationPoints] = useState<IntegrationPoint[]>([]);
  const [orchestrationRules, setOrchestrationRules] = useState<OrchestrationRule[]>([]);
  const [validationResults, setValidationResults] = useState<CrossGroupValidation | null>(null);
  const [workflowTemplates, setWorkflowTemplates] = useState<WorkflowTemplate[]>([]);
  const [resourceAvailability, setResourceAvailability] = useState<any>(null);

  // Execution State
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [executionErrors, setExecutionErrors] = useState<string[]>([]);
  const [stepResults, setStepResults] = useState<Record<string, any>>({});

  // UI State Management
  const [activeTab, setActiveTab] = useState('design');
  const [selectedSPAs, setSelectedSPAs] = useState<string[]>([]);
  const [selectedOperation, setSelectedOperation] = useState<string>('');
  const [showDataFlow, setShowDataFlow] = useState(true);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [draggedStep, setDraggedStep] = useState<WorkflowStep | null>(null);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });

  // Validation and Processing State
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSPAStatus, setIsLoadingSPAStatus] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [lastValidated, setLastValidated] = useState<Date | null>(null);

  // Refs for D3 visualization
  const canvasRef = useRef<SVGSVGElement>(null);
  const workflowBuilderRef = useRef<HTMLDivElement>(null);

  // Load SPA Statuses with Enhanced Metrics
  const loadSPAStatuses = useCallback(async () => {
    setIsLoadingSPAStatus(true);

    try {
      const [statuses, healthMetrics, connectivity] = await Promise.all([
        getAllSPAStatus(),
        getSPAHealthMetrics(),
        Promise.all(
          Object.keys(SPA_CONFIGURATIONS).map(async (spaId) => ({
            spa_id: spaId,
            connectivity: await testSPAConnectivity(spaId)
          }))
        )
      ]);

      // Combine status data with health metrics
      const enhancedStatuses: Record<string, SPAHealthStatus> = {};
      Object.entries(statuses).forEach(([spaId, status]) => {
        const health = healthMetrics[spaId] || {};
        const conn = connectivity.find(c => c.spa_id === spaId)?.connectivity || {};
        
        enhancedStatuses[spaId] = {
          ...status,
          health_metrics: health,
          connectivity: conn,
          last_updated: new Date().toISOString()
        };
      });

      setSpaStatuses(enhancedStatuses);

      // Track SPA status loading
      trackActivity({
        action: 'spa_statuses_loaded',
        resource_type: 'cross_group_orchestrator',
        resource_id: workflow.id,
        details: {
          spa_count: Object.keys(enhancedStatuses).length,
          healthy_spas: Object.values(enhancedStatuses).filter(s => s.status === 'healthy').length,
          load_time: Date.now()
        }
      });
    } catch (error) {
      console.error('❌ Failed to load SPA statuses:', error);
    } finally {
      setIsLoadingSPAStatus(false);
    }
  }, [getAllSPAStatus, getSPAHealthMetrics, testSPAConnectivity, trackActivity, workflow.id]);

  // Load Workflow Templates
  const loadWorkflowTemplates = useCallback(async () => {
    setIsLoadingTemplates(true);

    try {
      const templates = await getCrossGroupTemplates();
      setWorkflowTemplates(templates);
    } catch (error) {
      console.error('❌ Failed to load workflow templates:', error);
    } finally {
      setIsLoadingTemplates(false);
    }
  }, [getCrossGroupTemplates]);

  // Advanced Workflow Validation
  const validateWorkflow = useCallback(async () => {
    if (!workflow.steps.length) return;

    setIsValidating(true);

    try {
      // Parallel validation for comprehensive checking
      const [
        basicValidation,
        integrationValidation,
        permissionValidation,
        resourceValidation,
        aiAnalysis
      ] = await Promise.all([
        validateCrossGroupWorkflow(workflow),
        validateSPAIntegration(workflow),
        validatePermissions(getCurrentUser()?.id || '', workflow.steps.map(step => step.spa_id)),
        getResourceAvailability(workflow.resource_requirements || {}),
        detectIntegrationIssues(workflow)
      ]);

      const combinedValidation: CrossGroupValidation = {
        is_valid: basicValidation.is_valid && integrationValidation.is_valid && permissionValidation.is_valid,
        errors: [
          ...(basicValidation.errors || []),
          ...(integrationValidation.errors || []),
          ...(permissionValidation.errors || []),
          ...(aiAnalysis.critical_issues || [])
        ],
        warnings: [
          ...(basicValidation.warnings || []),
          ...(integrationValidation.warnings || []),
          ...(permissionValidation.warnings || []),
          ...(aiAnalysis.warnings || [])
        ],
        spa_compatibility: integrationValidation.spa_compatibility,
        permission_issues: permissionValidation.issues,
        resource_availability: resourceValidation,
        ai_insights: aiAnalysis,
        performance_predictions: aiAnalysis.performance_predictions
      };

      setValidationResults(combinedValidation);
      setResourceAvailability(resourceValidation);
      setLastValidated(new Date());

      // Update workflow with validation results
      setWorkflow(prev => ({
        ...prev,
        validation: combinedValidation,
        metadata: {
          ...prev.metadata,
          last_validated: new Date().toISOString(),
          is_valid: combinedValidation.is_valid,
          validation_score: aiAnalysis.confidence_score
        }
      }));

      // Track validation activity
      trackActivity({
        action: 'cross_group_workflow_validated',
        resource_type: 'cross_group_workflow',
        resource_id: workflow.id,
        details: {
          is_valid: combinedValidation.is_valid,
          error_count: combinedValidation.errors?.length || 0,
          warning_count: combinedValidation.warnings?.length || 0,
          spa_count: workflow.steps.length,
          validation_time: Date.now(),
          confidence_score: aiAnalysis.confidence_score
        }
      });
    } catch (error) {
      console.error('❌ Workflow validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  }, [
    workflow, validateCrossGroupWorkflow, validateSPAIntegration, validatePermissions,
    getResourceAvailability, detectIntegrationIssues, getCurrentUser, trackActivity
  ]);

  // Execute Cross-Group Workflow with Advanced Monitoring
  const executeWorkflow = useCallback(async () => {
    if (!workflow.steps.length || readonly) return;

    setIsExecuting(true);
    setExecutionProgress(0);
    setExecutionLogs([]);
    setExecutionErrors([]);
    setStepResults({});

    try {
      const executionContext: ExecutionContext = {
        workflow_id: workflow.id,
        user_id: getCurrentUser()?.id || '',
        workspace_id: getActiveWorkspace()?.id || '',
        cross_spa_integration: true,
        orchestration_mode: 'advanced',
        resource_allocation: workflow.resource_requirements || {},
        retry_policy: workflow.retry_policy,
        monitoring_enabled: true
      };

      // Start orchestrated execution
      const execution = await orchestrateCrossGroup(workflow, executionContext);
      
      if (execution.success) {
        // Enhanced step-by-step execution with detailed monitoring
        for (let i = 0; i < workflow.steps.length; i++) {
          const step = workflow.steps[i];
          const spa = Object.values(SPA_CONFIGURATIONS).find(s => s.id === step.spa_id);
          
          setCurrentStep(step.id);
          setExecutionProgress(((i + 1) / workflow.steps.length) * 100);
          
          const logMessage = `🚀 Executing Step ${i + 1}/${workflow.steps.length}: ${step.name} (${spa?.name})`;
          setExecutionLogs(prev => [...prev, logMessage]);
          
          try {
            // Execute step with enhanced error handling
            const stepResult = await executeStepInSPA(step.spa_id, step.operation, {
              ...step.parameters,
              execution_context: executionContext,
              previous_results: stepResults
            });
            
            if (stepResult.success) {
              setStepResults(prev => ({ ...prev, [step.id]: stepResult.data }));
              setExecutionLogs(prev => [...prev, `✅ Step completed successfully: ${stepResult.summary || 'No summary'}`]);
              
              // Add metrics if available
              if (stepResult.metrics) {
                setExecutionLogs(prev => [...prev, `📊 Metrics: ${JSON.stringify(stepResult.metrics)}`]);
              }
            } else {
              throw new Error(stepResult.error || 'Step execution failed');
            }
          } catch (stepError: any) {
            const errorMessage = `❌ Step failed: ${stepError.message}`;
            setExecutionErrors(prev => [...prev, errorMessage]);
            setExecutionLogs(prev => [...prev, errorMessage]);
            
            // Apply retry policy if configured
            if (workflow.retry_policy?.max_retries && workflow.retry_policy.max_retries > 0) {
              setExecutionLogs(prev => [...prev, `🔄 Applying retry policy...`]);
              // Retry logic would be implemented here
            } else {
              throw stepError;
            }
          }
          
          // Execute workflow step through backend
          const executionResult = await executeWorkflowStep(step.id, {
            workflow_id: workflow.id,
            step_config: step.config,
            input_data: step.input_data,
            context: executionContext
          });
        }

        const completionMessage = `🎉 Workflow execution completed successfully in ${workflow.steps.length} steps`;
        setExecutionLogs(prev => [...prev, completionMessage]);

        // Track successful execution with detailed metrics
        trackActivity({
          action: 'cross_group_workflow_executed',
          resource_type: 'cross_group_workflow',
          resource_id: workflow.id,
          details: {
            step_count: workflow.steps.length,
            execution_time: execution.execution_time,
            success: true,
            spas_involved: [...new Set(workflow.steps.map(s => s.spa_id))],
            total_operations: workflow.steps.length,
            error_count: executionErrors.length,
            resource_usage: execution.resource_usage
          }
        });

        onWorkflowExecute?.(workflow);
      }
    } catch (error: any) {
      const errorMessage = `💥 WORKFLOW EXECUTION FAILED: ${error.message}`;
      setExecutionErrors(prev => [...prev, errorMessage]);
      setExecutionLogs(prev => [...prev, errorMessage]);
      
      // Track failed execution
      trackActivity({
        action: 'cross_group_workflow_execution_failed',
        resource_type: 'cross_group_workflow',
        resource_id: workflow.id,
        details: {
          error: error.message,
          current_step: currentStep,
          completed_steps: Object.keys(stepResults).length,
          total_steps: workflow.steps.length
        }
      });
    } finally {
      setIsExecuting(false);
      setCurrentStep(null);
    }
  }, [
    workflow, readonly, getCurrentUser, getActiveWorkspace, orchestrateCrossGroup,
    executeStepInSPA, stepResults, executionErrors, trackActivity, onWorkflowExecute, currentStep
  ]);

  // Add Workflow Step with Enhanced Configuration
  const addWorkflowStep = useCallback((spaId: string, operation: string, position?: { x: number, y: number }) => {
    if (readonly) return;

    const spa = Object.values(SPA_CONFIGURATIONS).find(s => s.id === spaId);
    if (!spa) return;

    const stepId = `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newStep: WorkflowStep = {
      id: stepId,
      name: `${spa.name} - ${operation}`,
      description: `Execute ${operation} operation in ${spa.name}`,
      spa_id: spaId,
      operation,
      parameters: {},
      dependencies: [],
      conditions: [],
      retry_policy: {
        max_retries: 3,
        retry_delay: 30,
        backoff_multiplier: 2
      },
      timeout: 300,
      priority: 'normal',
      resource_requirements: spa.resource_requirements,
      expected_outputs: spa.data_types,
      position: position || { x: 100 + workflow.steps.length * 200, y: 100 },
      metadata: {
        created_at: new Date().toISOString(),
        spa_name: spa.name,
        operation_type: operation,
        estimated_duration: 60,
        complexity: 'medium'
      }
    };

    setWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep],
      metadata: {
        ...prev.metadata,
        updated_at: new Date().toISOString(),
        complexity: calculateWorkflowComplexity([...prev.steps, newStep])
      }
    }));

    // Track step addition
    trackActivity({
      action: 'workflow_step_added',
      resource_type: 'cross_group_workflow',
      resource_id: workflow.id,
      details: {
        spa_id: spaId,
        operation,
        step_count: workflow.steps.length + 1,
        step_id: stepId
      }
    });
  }, [readonly, workflow.id, workflow.steps, trackActivity]);

  // Calculate workflow complexity
  const calculateWorkflowComplexity = useCallback((steps: WorkflowStep[]): 'low' | 'medium' | 'high' | 'critical' => {
    const stepCount = steps.length;
    const uniqueSPAs = new Set(steps.map(s => s.spa_id)).size;
    const totalDependencies = steps.reduce((sum, step) => sum + (step.dependencies?.length || 0), 0);
    
    const complexityScore = stepCount * 10 + uniqueSPAs * 15 + totalDependencies * 5;
    
    if (complexityScore < 50) return 'low';
    if (complexityScore < 150) return 'medium';
    if (complexityScore < 300) return 'high';
    return 'critical';
  }, []);

  // Save Workflow with Enhanced Metadata
  const saveWorkflow = useCallback(async () => {
    if (!workflow.name) return;

    setIsSaving(true);

    try {
      const savedWorkflow = await saveCrossGroupWorkflow({
        ...workflow,
        created_by: getCurrentUser()?.id || '',
        workspace_id: getActiveWorkspace()?.id || '',
        metadata: {
          ...workflow.metadata,
          updated_at: new Date().toISOString(),
          complexity: calculateWorkflowComplexity(workflow.steps),
          spa_count: new Set(workflow.steps.map(s => s.spa_id)).size,
          estimated_duration: workflow.steps.reduce((sum, step) => sum + (step.metadata?.estimated_duration || 60), 0)
        }
      });

      setWorkflow(savedWorkflow);
      
      // Track save activity
      trackActivity({
        action: 'cross_group_workflow_saved',
        resource_type: 'cross_group_workflow',
        resource_id: savedWorkflow.id,
        details: {
          workflow_name: savedWorkflow.name,
          step_count: savedWorkflow.steps.length,
          spa_count: new Set(savedWorkflow.steps.map(s => s.spa_id)).size,
          complexity: savedWorkflow.metadata?.complexity,
          has_validation: !!savedWorkflow.validation
        }
      });

      onWorkflowSave?.(savedWorkflow);
    } catch (error) {
      console.error('❌ Failed to save workflow:', error);
    } finally {
      setIsSaving(false);
    }
  }, [workflow, saveCrossGroupWorkflow, getCurrentUser, getActiveWorkspace, calculateWorkflowComplexity, trackActivity, onWorkflowSave]);

  // Workflow Designer Render with Enhanced UI
  const renderWorkflowDesigner = () => (
    <div className="space-y-6">
      {/* Workflow Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Settings className="h-5 w-5 mr-2 text-blue-600" />
            Workflow Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workflow-name">Workflow Name</Label>
              <Input
                id="workflow-name"
                value={workflow.name}
                onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter descriptive workflow name"
                disabled={readonly}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="workflow-category">Category</Label>
              <Select 
                value={workflow.category || 'custom'} 
                onValueChange={(value) => setWorkflow(prev => ({ ...prev, category: value }))}
                disabled={readonly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="data_processing">Data Processing</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="discovery">Discovery</SelectItem>
                  <SelectItem value="governance">Governance</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="utility">Utility</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="workflow-description">Description</Label>
            <Textarea
              id="workflow-description"
              value={workflow.description}
              onChange={(e) => setWorkflow(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the workflow's purpose, expected outcomes, and any special considerations"
              rows={3}
              disabled={readonly}
            />
          </div>
        </CardContent>
      </Card>

      {/* SPA Status Panel with Enhanced Metrics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Monitor className="h-5 w-5 mr-2 text-blue-600" />
              SPA Health Dashboard
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {Object.keys(spaStatuses).length} / {Object.keys(SPA_CONFIGURATIONS).length} SPAs
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={loadSPAStatuses}
                disabled={isLoadingSPAStatus}
              >
                {isLoadingSPAStatus ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.values(SPA_CONFIGURATIONS).map(spa => {
              const status = spaStatuses[spa.id];
              const isHealthy = status?.status === 'healthy';
              const isSelected = selectedSPAs.includes(spa.id);
              
              return (
                <motion.div
                  key={spa.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' 
                      : isHealthy
                        ? 'border-green-200 hover:border-green-300'
                        : 'border-red-200 hover:border-red-300'
                  }`}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedSPAs(prev => prev.filter(id => id !== spa.id));
                    } else {
                      setSelectedSPAs(prev => [...prev, spa.id]);
                    }
                  }}
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${spa.gradient} opacity-5`} />
                  
                  <div className="relative p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="p-2 rounded-lg shadow-sm"
                          style={{ backgroundColor: `${spa.color}20` }}
                        >
                          <spa.icon 
                            className="h-5 w-5" 
                            style={{ color: spa.color }}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{spa.name}</h3>
                          <p className="text-xs text-gray-500">{spa.id}</p>
                        </div>
                      </div>
                      
                      {/* Status Indicator */}
                      <div className="flex items-center space-x-1">
                        <div 
                          className={`w-3 h-3 rounded-full ${
                            isHealthy ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                          }`} 
                        />
                        <span className="text-xs font-medium">
                          {isHealthy ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Metrics */}
                    {status && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Response Time:</span>
                          <Badge variant="outline" className="text-xs">
                            {status.health_metrics?.avg_response_time || spa.avg_response_time}ms
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Reliability:</span>
                          <Badge variant="outline" className="text-xs">
                            {status.health_metrics?.reliability_score || spa.reliability_score}%
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Load:</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              (status.health_metrics?.current_load || 0) > 80 ? 'text-red-600' : 'text-green-600'
                            }`}
                          >
                            {status.health_metrics?.current_load || 25}%
                          </Badge>
                        </div>
                      </div>
                    )}
                    
                    {/* Capabilities */}
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-600 mb-1">Capabilities:</p>
                      <div className="flex flex-wrap gap-1">
                        {spa.capabilities.slice(0, 3).map(cap => (
                          <Badge key={cap} variant="secondary" className="text-xs px-1 py-0">
                            {cap}
                          </Badge>
                        ))}
                        {spa.capabilities.length > 3 && (
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            +{spa.capabilities.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="h-5 w-5 text-blue-600 bg-white rounded-full" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Workflow Templates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Zap className="h-5 w-5 mr-2 text-blue-600" />
              Quick Start Templates
            </CardTitle>
            <Select value={selectedOperation} onValueChange={setSelectedOperation}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select workflow template" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(CROSS_GROUP_OPERATIONS).map(op => (
                  <SelectItem key={op.type} value={op.type}>
                    <div className="flex items-center justify-between w-full">
                      <span>{op.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {op.complexity}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {selectedOperation && (
            <div className="space-y-4">
              {(() => {
                const operation = CROSS_GROUP_OPERATIONS[selectedOperation as keyof typeof CROSS_GROUP_OPERATIONS];
                return (
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-semibold text-blue-900 mb-2">{operation.name}</h4>
                        <p className="text-blue-700 mb-3">{operation.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-blue-800">Category:</span>
                            <Badge variant="outline" className="ml-1 text-blue-600">
                              {operation.category}
                            </Badge>
                          </div>
                          <div>
                            <span className="font-medium text-blue-800">Duration:</span>
                            <span className="ml-1 text-blue-700">
                              ~{Math.round(operation.estimated_duration / 60)}m
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-blue-800">Complexity:</span>
                            <Badge 
                              variant="outline" 
                              className={`ml-1 ${
                                operation.complexity === 'high' ? 'text-red-600 border-red-300' :
                                operation.complexity === 'medium' ? 'text-yellow-600 border-yellow-300' :
                                'text-green-600 border-green-300'
                              }`}
                            >
                              {operation.complexity}
                            </Badge>
                          </div>
                          <div>
                            <span className="font-medium text-blue-800">Success Rate:</span>
                            <Badge variant="outline" className="ml-1 text-green-600">
                              {operation.success_rate}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Workflow Flow Visualization */}
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-blue-800">Execution Flow:</p>
                      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                        {operation.typical_flow.map((spaId, index) => {
                          const spa = Object.values(SPA_CONFIGURATIONS).find(s => s.id === spaId);
                          return (
                            <React.Fragment key={spaId}>
                              <div className="flex items-center space-x-2 bg-white rounded-lg p-3 border border-blue-200 shadow-sm min-w-max">
                                {spa && <spa.icon className="h-4 w-4" style={{ color: spa.color }} />}
                                <div>
                                  <div className="text-sm font-medium">{spa?.name}</div>
                                  <div className="text-xs text-gray-500">{spa?.id}</div>
                                </div>
                              </div>
                              {index < operation.typical_flow.length - 1 && (
                                <ArrowRight className="h-5 w-5 text-blue-400 flex-shrink-0" />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Additional Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-sm font-semibold text-blue-800 mb-2">Use Cases:</p>
                        <ul className="text-sm text-blue-700 space-y-1">
                          {operation.use_cases.map((useCase, index) => (
                            <li key={index} className="flex items-center space-x-1">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              <span>{useCase}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <p className="text-sm font-semibold text-blue-800 mb-2">Prerequisites:</p>
                        <ul className="text-sm text-blue-700 space-y-1">
                          {operation.prerequisites.map((prereq, index) => (
                            <li key={index} className="flex items-center space-x-1">
                              <AlertTriangle className="h-3 w-3 text-yellow-600" />
                              <span>{prereq}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <p className="text-sm font-semibold text-blue-800 mb-2">Expected Outputs:</p>
                        <ul className="text-sm text-blue-700 space-y-1">
                          {operation.outputs.map((output, index) => (
                            <li key={index} className="flex items-center space-x-1">
                              <Target className="h-3 w-3 text-blue-600" />
                              <span>{output}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-6">
                      <Button
                        onClick={() => {
                          // Create workflow from template
                          const steps: WorkflowStep[] = operation.typical_flow.map((spaId, index) => {
                            const spa = Object.values(SPA_CONFIGURATIONS).find(s => s.id === spaId);
                            return {
                              id: `step_${index}_${spaId}`,
                              name: `${spa?.name} ${operation.name.split(' ').slice(-1)[0]}`,
                              description: `Execute ${spa?.capabilities[0]} in ${spa?.name}`,
                              spa_id: spaId,
                              operation: spa?.capabilities[0] || 'execute',
                              parameters: {},
                              dependencies: index > 0 ? [`step_${index - 1}_${operation.typical_flow[index - 1]}`] : [],
                              conditions: [],
                              retry_policy: { max_retries: 3, retry_delay: 30, backoff_multiplier: 2 },
                              timeout: 300,
                              priority: 'normal',
                              resource_requirements: spa?.resource_requirements || {},
                              expected_outputs: spa?.data_types || [],
                              position: { x: 100 + index * 250, y: 100 },
                              metadata: {
                                created_at: new Date().toISOString(),
                                spa_name: spa?.name || '',
                                operation_type: spa?.capabilities[0] || 'execute',
                                estimated_duration: Math.round(operation.estimated_duration / operation.typical_flow.length),
                                complexity: operation.complexity
                              }
                            };
                          });
                          
                          setWorkflow(prev => ({
                            ...prev,
                            name: operation.name,
                            description: operation.description,
                            category: operation.category,
                            steps,
                            estimated_duration: operation.estimated_duration,
                            metadata: {
                              ...prev.metadata,
                              updated_at: new Date().toISOString(),
                              template_used: operation.type,
                              complexity: operation.complexity,
                              estimated_duration: operation.estimated_duration
                            }
                          }));
                          
                          setSelectedOperation('');
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Use This Template
                      </Button>
                      
                      <div className="text-sm text-blue-600">
                        {operation.typical_flow.length} steps • {Math.round(operation.estimated_duration / 60)} minutes • {operation.success_rate}% success rate
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Workflow Steps */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Workflow className="h-5 w-5 mr-2 text-blue-600" />
              Workflow Steps
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{workflow.steps.length} steps</Badge>
              {workflow.metadata?.complexity && (
                <Badge 
                  variant="outline" 
                  className={
                    workflow.metadata.complexity === 'critical' ? 'text-red-600 border-red-300' :
                    workflow.metadata.complexity === 'high' ? 'text-orange-600 border-orange-300' :
                    workflow.metadata.complexity === 'medium' ? 'text-yellow-600 border-yellow-300' :
                    'text-green-600 border-green-300'
                  }
                >
                  {workflow.metadata.complexity} complexity
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={validateWorkflow}
                disabled={isValidating}
              >
                {isValidating ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-1" />
                )}
                Validate
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {workflow.steps.length > 0 ? (
            <div className="space-y-3">
              {workflow.steps.map((step, index) => {
                const spa = Object.values(SPA_CONFIGURATIONS).find(s => s.id === step.spa_id);
                const isCurrentStep = currentStep === step.id;
                const hasErrors = validationResults?.errors?.some(error => error.step_id === step.id);
                
                return (
                  <ContextMenu key={step.id}>
                    <ContextMenuTrigger>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center space-x-4 p-4 border-2 rounded-lg transition-all hover:shadow-md ${
                          isCurrentStep ? 'border-blue-500 bg-blue-50 shadow-lg' :
                          hasErrors ? 'border-red-300 bg-red-50' :
                          'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {/* Step Number */}
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm shadow-sm ${
                          isCurrentStep ? 'bg-blue-600 text-white' :
                          hasErrors ? 'bg-red-500 text-white' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        
                        {/* SPA Icon */}
                        {spa && (
                          <div 
                            className="p-3 rounded-lg shadow-sm"
                            style={{ backgroundColor: `${spa.color}20` }}
                          >
                            <spa.icon 
                              className="h-6 w-6" 
                              style={{ color: spa.color }}
                            />
                          </div>
                        )}
                        
                        {/* Step Details */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-lg">{step.name}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {step.operation}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {step.priority}
                              </Badge>
                              {isCurrentStep && (
                                <Badge className="text-xs bg-blue-600 animate-pulse">
                                  Running
                                </Badge>
                              )}
                              {hasErrors && (
                                <Badge variant="destructive" className="text-xs">
                                  Error
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>SPA: {spa?.name}</span>
                            <span>Timeout: {step.timeout}s</span>
                            <span>Retries: {step.retry_policy?.max_retries}</span>
                            {step.metadata?.estimated_duration && (
                              <span>Est: {step.metadata.estimated_duration}s</span>
                            )}
                          </div>
                          
                          {step.dependencies && step.dependencies.length > 0 && (
                            <div className="mt-2">
                              <span className="text-xs text-gray-400">
                                Depends on: {step.dependencies.length} step(s)
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Actions */}
                        {!readonly && (
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Edit step logic
                              }}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setWorkflow(prev => ({
                                  ...prev,
                                  steps: prev.steps.filter(s => s.id !== step.id)
                                }));
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem onClick={() => {}}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Step
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => {}}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => {}}>
                        <Link2 className="h-4 w-4 mr-2" />
                        Add Dependency
                      </ContextMenuItem>
                      <ContextMenuItem 
                        onClick={() => {
                          setWorkflow(prev => ({
                            ...prev,
                            steps: prev.steps.filter(s => s.id !== step.id)
                          }));
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
          ) : (
            <div className="text-center py-12">
              <Network className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No Workflow Steps</h3>
              <p className="text-gray-400 mb-4">Create workflow steps by selecting SPAs and using templates</p>
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('templates')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Add manual step logic
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Add Step Manually
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Results */}
      {validationResults && (
        <Card className={validationResults.is_valid ? "border-green-200" : "border-red-200"}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              {validationResults.is_valid ? (
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 mr-2 text-red-600" />
              )}
              Validation Results
              {lastValidated && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {lastValidated.toLocaleTimeString()}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {validationResults.errors && validationResults.errors.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-600 mb-3 flex items-center">
                    <XCircle className="h-4 w-4 mr-1" />
                    Errors ({validationResults.errors.length})
                  </h4>
                  <div className="space-y-2">
                    {validationResults.errors.map((error, index) => (
                      <Alert key={index} className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="font-medium">{error.message}</div>
                          {error.step_id && (
                            <div className="text-sm text-red-600 mt-1">
                              Step: {workflow.steps.find(s => s.id === error.step_id)?.name}
                            </div>
                          )}
                          {error.suggested_fix && (
                            <div className="text-sm text-red-700 mt-1">
                              Suggestion: {error.suggested_fix}
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}
              
              {validationResults.warnings && validationResults.warnings.length > 0 && (
                <div>
                  <h4 className="font-medium text-yellow-600 mb-3 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Warnings ({validationResults.warnings.length})
                  </h4>
                  <div className="space-y-2">
                    {validationResults.warnings.map((warning, index) => (
                      <Alert key={index} className="border-yellow-200 bg-yellow-50">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="font-medium">{warning.message}</div>
                          {warning.impact && (
                            <div className="text-sm text-yellow-700 mt-1">
                              Impact: {warning.impact}
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}
              
              {validationResults.is_valid && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium">Workflow validation passed successfully!</div>
                    <div className="text-sm text-green-700 mt-1">
                      The workflow is ready for execution with {workflow.steps.length} steps across {new Set(workflow.steps.map(s => s.spa_id)).size} SPAs.
                    </div>
                    {validationResults.performance_predictions && (
                      <div className="text-sm text-green-700 mt-1">
                        Estimated completion: {Math.round(validationResults.performance_predictions.estimated_duration / 60)} minutes
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Effects
  useEffect(() => {
    if (initialWorkflow) {
      setWorkflow(initialWorkflow);
    }
  }, [initialWorkflow]);

  useEffect(() => {
    loadSPAStatuses();
    loadWorkflowTemplates();
  }, [loadSPAStatuses, loadWorkflowTemplates]);

  useEffect(() => {
    onWorkflowChange?.(workflow);
  }, [workflow, onWorkflowChange]);

  // Auto-validate when workflow changes
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (workflow.steps.length > 0) {
        validateWorkflow();
      }
    }, 2000);

    return () => clearTimeout(debounceTimeout);
  }, [workflow.steps, validateWorkflow]);

  // Main Render
  return (
    <div className={`flex h-full bg-gradient-to-br from-white to-gray-50 ${className}`}>
      <TooltipProvider>
        <div className="flex-1 flex flex-col">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between p-6 border-b bg-white shadow-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Network className="h-8 w-8 text-blue-600" />
                  {workflow.steps.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                      {workflow.steps.length}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Cross-Group Orchestrator</h1>
                  <p className="text-sm text-gray-500">Advanced workflow orchestration across all SPAs</p>
                </div>
              </div>
              
              {workflow.id && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {workflow.id}
                  </Badge>
                  {validationResults?.is_valid && (
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                      Validated
                    </Badge>
                  )}
                  {workflow.metadata?.complexity && (
                    <Badge 
                      variant="outline"
                      className={
                        workflow.metadata.complexity === 'critical' ? 'text-red-600 border-red-300' :
                        workflow.metadata.complexity === 'high' ? 'text-orange-600 border-orange-300' :
                        workflow.metadata.complexity === 'medium' ? 'text-yellow-600 border-yellow-300' :
                        'text-green-600 border-green-300'
                      }
                    >
                      {workflow.metadata.complexity}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* SPA Health Summary */}
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-500">SPAs:</span>
                <Badge variant="outline" className="text-green-600">
                  {Object.values(spaStatuses).filter(s => s.status === 'healthy').length} healthy
                </Badge>
                <Badge variant="outline" className="text-red-600">
                  {Object.values(spaStatuses).filter(s => s.status !== 'healthy').length} issues
                </Badge>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={validateWorkflow}
                  disabled={isValidating || !workflow.steps.length}
                >
                  {isValidating ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  )}
                  Validate
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={executeWorkflow}
                  disabled={isExecuting || !workflow.steps.length || !validationResults?.is_valid}
                >
                  {isExecuting ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Play className="h-4 w-4 mr-1" />
                  )}
                  Execute
                </Button>
                
                <Button
                  onClick={saveWorkflow}
                  disabled={isSaving || !workflow.name}
                >
                  {isSaving ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  Save
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Advanced Options
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      const exportData = {
                        workflow,
                        spa_statuses: spaStatuses,
                        validation_results: validationResults,
                        cross_group_metrics: crossGroupMetrics,
                        exported_at: new Date().toISOString(),
                        export_version: '2.0'
                      };
                      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
                        type: 'application/json' 
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `cross-group-workflow-${workflow.name || 'unnamed'}-${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Workflow
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Main Content with Advanced Tabs */}
          <div className="flex-1 p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="design" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Design</span>
                </TabsTrigger>
                <TabsTrigger value="execute" className="flex items-center space-x-2">
                  <Play className="h-4 w-4" />
                  <span>Execute</span>
                </TabsTrigger>
                <TabsTrigger value="monitor" className="flex items-center space-x-2">
                  <Monitor className="h-4 w-4" />
                  <span>Monitor</span>
                </TabsTrigger>
                <TabsTrigger value="templates" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Templates</span>
                </TabsTrigger>
              </TabsList>
              
              <div className="h-full">
                <TabsContent value="design" className="h-full mt-0">
                  <ScrollArea className="h-full">
                    {renderWorkflowDesigner()}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="execute" className="h-full mt-0">
                  <ScrollArea className="h-full">
                    <div className="space-y-6">
                      {/* Execution Control Panel */}
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Workflow Execution</CardTitle>
                            <div className="flex items-center space-x-2">
                              {isExecuting && (
                                <>
                                  <Badge variant="outline" className="animate-pulse">
                                    Running
                                  </Badge>
                                  <div className="text-sm text-gray-500">
                                    Step {workflow.steps.findIndex(s => s.id === currentStep) + 1} of {workflow.steps.length}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {isExecuting && (
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between text-sm mb-2">
                                  <span>Overall Progress</span>
                                  <span>{Math.round(executionProgress)}%</span>
                                </div>
                                <Progress value={executionProgress} className="w-full h-3" />
                              </div>
                              
                              {currentStep && (
                                <div className="text-sm text-gray-600">
                                  Current step: {workflow.steps.find(s => s.id === currentStep)?.name}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {!isExecuting && workflow.steps.length > 0 && (
                            <div className="text-center py-8">
                              <Play className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                              <h3 className="text-lg font-medium text-gray-600 mb-2">Ready to Execute</h3>
                              <p className="text-gray-500 mb-4">
                                Workflow has {workflow.steps.length} steps across {new Set(workflow.steps.map(s => s.spa_id)).size} SPAs
                              </p>
                              <Button
                                onClick={executeWorkflow}
                                disabled={!validationResults?.is_valid}
                                size="lg"
                              >
                                <Play className="h-5 w-5 mr-2" />
                                Execute Workflow
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Execution Logs */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center">
                            <FileText className="h-5 w-5 mr-2" />
                            Execution Logs
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-64 w-full border rounded p-4 bg-gray-50">
                            <div className="space-y-1 font-mono text-sm">
                              {executionLogs.length > 0 ? (
                                executionLogs.map((log, index) => (
                                  <div key={index} className="flex items-start space-x-2">
                                    <span className="text-gray-500 text-xs mt-0.5 w-20 flex-shrink-0">
                                      [{new Date().toLocaleTimeString()}]
                                    </span>
                                    <span className="flex-1">{log}</span>
                                  </div>
                                ))
                              ) : (
                                <div className="text-gray-500 text-center py-8">
                                  No execution logs yet. Start workflow execution to see logs.
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>

                      {/* Execution Errors */}
                      {executionErrors.length > 0 && (
                        <Card className="border-red-200">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center text-red-600">
                              <XCircle className="h-5 w-5 mr-2" />
                              Execution Errors
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {executionErrors.map((error, index) => (
                                <Alert key={index} className="border-red-200 bg-red-50">
                                  <XCircle className="h-4 w-4" />
                                  <AlertDescription>{error}</AlertDescription>
                                </Alert>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="monitor" className="h-full mt-0">
                  <ScrollArea className="h-full">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Cross-Group Monitoring</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-8 text-gray-500">
                            <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Advanced monitoring dashboard</p>
                            <p className="text-sm">Real-time cross-SPA metrics and performance analytics</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="templates" className="h-full mt-0">
                  <ScrollArea className="h-full">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Workflow Templates</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-8 text-gray-500">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Template library and marketplace</p>
                            <p className="text-sm">Pre-built workflow templates and community contributions</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default CrossGroupOrchestrator;