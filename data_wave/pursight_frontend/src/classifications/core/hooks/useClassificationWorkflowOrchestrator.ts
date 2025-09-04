// ============================================================================
// CLASSIFICATION WORKFLOW ORCHESTRATOR HOOK
// Enterprise-grade workflow orchestration for Classifications management
// Advanced workflow templates and automation for classification operations
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useClassificationsRBAC } from './useClassificationsRBAC'
import { ClassificationApi } from '../api/classificationApi'
import { mlApi } from '../api/mlApi'
import { aiApi } from '../api/aiApi'

// Workflow Types
export interface WorkflowStep {
  id: string
  name: string
  description: string
  type: 'manual' | 'ml' | 'ai' | 'validation' | 'approval'
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  dependencies: string[]
  estimatedDuration: number
  actualDuration?: number
  startTime?: string
  endTime?: string
  progress: number
  output?: any
  error?: string
  retryCount: number
  maxRetries: number
  configuration: Record<string, any>
  permissions: string[]
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: 'onboarding' | 'quality' | 'lineage' | 'compliance' | 'analytics' | 'maintenance'
  version: 'v1' | 'v2' | 'v3' | 'cross-version'
  steps: WorkflowStep[]
  estimatedTotalDuration: number
  complexity: 'simple' | 'moderate' | 'complex' | 'expert'
  prerequisites: string[]
  permissions: string[]
  tags: string[]
}

export interface WorkflowExecution {
  id: string
  templateId: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused'
  progress: number
  currentStepIndex: number
  steps: WorkflowStep[]
  startTime: string
  endTime?: string
  duration?: number
  triggeredBy: string
  context: Record<string, any>
  results: Record<string, any>
  notifications: boolean
  priority: 'low' | 'normal' | 'high' | 'critical'
}

export interface WorkflowMetrics {
  totalExecutions: number
  successRate: number
  averageDuration: number
  mostUsedTemplates: string[]
  failureReasons: Record<string, number>
  performanceTrends: Array<{
    date: string
    executions: number
    successRate: number
    avgDuration: number
  }>
}

// Pre-built Workflow Templates
const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'complete_asset_onboarding',
    name: 'Complete Asset Onboarding',
    description: 'Comprehensive 6-step workflow for complete asset onboarding with AI enrichment',
    category: 'onboarding',
    version: 'cross-version',
    complexity: 'complex',
    estimatedTotalDuration: 1800, // 30 minutes
    prerequisites: ['asset_access', 'classification_framework'],
    permissions: ['classification.workflows.execute', 'classification.frameworks.view'],
    tags: ['onboarding', 'comprehensive', 'ai-enhanced'],
    steps: [
      {
        id: 'asset_discovery',
        name: 'Asset Discovery',
        description: 'Discover and inventory assets using intelligent scanning',
        type: 'manual',
        status: 'pending',
        dependencies: [],
        estimatedDuration: 300,
        progress: 0,
        retryCount: 0,
        maxRetries: 3,
        configuration: {
          scan_depth: 'deep',
          include_metadata: true,
          auto_classify: true
        },
        permissions: ['classification.frameworks.view']
      },
      {
        id: 'data_profiling',
        name: 'Data Profiling',
        description: 'Profile data quality and characteristics using ML analysis',
        type: 'ml',
        status: 'pending',
        dependencies: ['asset_discovery'],
        estimatedDuration: 240,
        progress: 0,
        retryCount: 0,
        maxRetries: 2,
        configuration: {
          profile_depth: 'comprehensive',
          statistical_analysis: true,
          pattern_detection: true
        },
        permissions: ['classification.ml.feature_engineering']
      },
      {
        id: 'lineage_tracking',
        name: 'Lineage Tracking',
        description: 'Trace data lineage and dependencies',
        type: 'manual',
        status: 'pending',
        dependencies: ['data_profiling'],
        estimatedDuration: 180,
        progress: 0,
        retryCount: 0,
        maxRetries: 3,
        configuration: {
          trace_depth: 5,
          include_transformations: true,
          business_context: true
        },
        permissions: ['classification.workflows.view']
      },
      {
        id: 'ai_enrichment',
        name: 'AI Enrichment',
        description: 'Enrich assets with AI-powered insights and recommendations',
        type: 'ai',
        status: 'pending',
        dependencies: ['lineage_tracking'],
        estimatedDuration: 420,
        progress: 0,
        retryCount: 0,
        maxRetries: 2,
        configuration: {
          ai_models: ['gpt-4', 'claude-opus'],
          enrichment_types: ['semantic_tags', 'business_context', 'recommendations'],
          confidence_threshold: 0.8
        },
        permissions: ['classification.ai.view_intelligence']
      },
      {
        id: 'quality_assessment',
        name: 'Quality Assessment',
        description: 'Comprehensive quality assessment with automated validation',
        type: 'ml',
        status: 'pending',
        dependencies: ['ai_enrichment'],
        estimatedDuration: 360,
        progress: 0,
        retryCount: 0,
        maxRetries: 3,
        configuration: {
          quality_dimensions: ['completeness', 'consistency', 'validity', 'accuracy'],
          automated_fixes: false,
          generate_report: true
        },
        permissions: ['classification.ml.view_analytics']
      },
      {
        id: 'analytics_generation',
        name: 'Analytics Generation',
        description: 'Generate comprehensive analytics and business intelligence reports',
        type: 'manual',
        status: 'pending',
        dependencies: ['quality_assessment'],
        estimatedDuration: 300,
        progress: 0,
        retryCount: 0,
        maxRetries: 2,
        configuration: {
          report_types: ['executive_summary', 'technical_details', 'recommendations'],
          include_visualizations: true,
          export_formats: ['pdf', 'excel']
        },
        permissions: ['classification.bi.view']
      }
    ]
  },
  {
    id: 'deep_quality_assessment',
    name: 'Deep Quality Assessment',
    description: 'Comprehensive 5-step quality assessment with ML-driven insights',
    category: 'quality',
    version: 'v2',
    complexity: 'moderate',
    estimatedTotalDuration: 900, // 15 minutes
    prerequisites: ['dataset_access'],
    permissions: ['classification.ml.view_analytics'],
    tags: ['quality', 'ml-driven', 'comprehensive'],
    steps: [
      {
        id: 'statistical_profiling',
        name: 'Statistical Profiling',
        description: 'Comprehensive statistical analysis of data patterns',
        type: 'ml',
        status: 'pending',
        dependencies: [],
        estimatedDuration: 180,
        progress: 0,
        retryCount: 0,
        maxRetries: 2,
        configuration: {
          statistical_tests: ['normality', 'correlation', 'outlier_detection'],
          confidence_level: 0.95
        },
        permissions: ['classification.ml.feature_engineering']
      },
      {
        id: 'pattern_analysis',
        name: 'Pattern Analysis',
        description: 'ML-powered pattern recognition and anomaly detection',
        type: 'ml',
        status: 'pending',
        dependencies: ['statistical_profiling'],
        estimatedDuration: 240,
        progress: 0,
        retryCount: 0,
        maxRetries: 2,
        configuration: {
          algorithms: ['isolation_forest', 'local_outlier_factor'],
          sensitivity: 0.1
        },
        permissions: ['classification.ml.view_analytics']
      },
      {
        id: 'anomaly_detection',
        name: 'Anomaly Detection',
        description: 'Advanced anomaly detection using ensemble methods',
        type: 'ml',
        status: 'pending',
        dependencies: ['pattern_analysis'],
        estimatedDuration: 180,
        progress: 0,
        retryCount: 0,
        maxRetries: 3,
        configuration: {
          ensemble_methods: true,
          anomaly_threshold: 0.05
        },
        permissions: ['classification.ml.monitor_drift']
      },
      {
        id: 'quality_rules_validation',
        name: 'Quality Rules Validation',
        description: 'Validate data against predefined quality rules',
        type: 'validation',
        status: 'pending',
        dependencies: ['anomaly_detection'],
        estimatedDuration: 120,
        progress: 0,
        retryCount: 0,
        maxRetries: 2,
        configuration: {
          rule_types: ['completeness', 'format', 'range', 'business_rules'],
          strict_validation: true
        },
        permissions: ['classification.rules.validate']
      },
      {
        id: 'report_generation',
        name: 'Report Generation',
        description: 'Generate comprehensive quality assessment report',
        type: 'manual',
        status: 'pending',
        dependencies: ['quality_rules_validation'],
        estimatedDuration: 180,
        progress: 0,
        retryCount: 0,
        maxRetries: 2,
        configuration: {
          report_format: 'comprehensive',
          include_recommendations: true,
          export_formats: ['pdf', 'excel', 'json']
        },
        permissions: ['classification.bi.export_reports']
      }
    ]
  },
  {
    id: 'comprehensive_lineage_analysis',
    name: 'Comprehensive Lineage Analysis',
    description: 'Complete 5-step lineage tracing with impact analysis',
    category: 'lineage',
    version: 'cross-version',
    complexity: 'complex',
    estimatedTotalDuration: 1200, // 20 minutes
    prerequisites: ['lineage_access'],
    permissions: ['classification.workflows.view'],
    tags: ['lineage', 'impact-analysis', 'comprehensive'],
    steps: [
      {
        id: 'upstream_discovery',
        name: 'Upstream Discovery',
        description: 'Discover all upstream data sources and dependencies',
        type: 'manual',
        status: 'pending',
        dependencies: [],
        estimatedDuration: 240,
        progress: 0,
        retryCount: 0,
        maxRetries: 3,
        configuration: {
          trace_depth: 10,
          include_transformations: true
        },
        permissions: ['classification.workflows.view']
      },
      {
        id: 'downstream_discovery',
        name: 'Downstream Discovery',
        description: 'Discover all downstream consumers and dependencies',
        type: 'manual',
        status: 'pending',
        dependencies: ['upstream_discovery'],
        estimatedDuration: 240,
        progress: 0,
        retryCount: 0,
        maxRetries: 3,
        configuration: {
          trace_depth: 10,
          include_consumers: true
        },
        permissions: ['classification.workflows.view']
      },
      {
        id: 'impact_analysis',
        name: 'Impact Analysis',
        description: 'Analyze potential impact of changes using ML models',
        type: 'ml',
        status: 'pending',
        dependencies: ['downstream_discovery'],
        estimatedDuration: 300,
        progress: 0,
        retryCount: 0,
        maxRetries: 2,
        configuration: {
          impact_models: ['change_propagation', 'risk_assessment'],
          scenario_analysis: true
        },
        permissions: ['classification.ml.view_analytics']
      },
      {
        id: 'dependency_mapping',
        name: 'Dependency Mapping',
        description: 'Create comprehensive dependency map with AI insights',
        type: 'ai',
        status: 'pending',
        dependencies: ['impact_analysis'],
        estimatedDuration: 240,
        progress: 0,
        retryCount: 0,
        maxRetries: 2,
        configuration: {
          visualization_type: 'interactive_graph',
          ai_annotations: true
        },
        permissions: ['classification.ai.view_intelligence']
      },
      {
        id: 'visualization',
        name: 'Visualization',
        description: 'Generate interactive lineage visualizations',
        type: 'manual',
        status: 'pending',
        dependencies: ['dependency_mapping'],
        estimatedDuration: 180,
        progress: 0,
        retryCount: 0,
        maxRetries: 2,
        configuration: {
          visualization_formats: ['graph', 'tree', 'flow'],
          interactive_features: true
        },
        permissions: ['classification.bi.view']
      }
    ]
  }
];

export function useClassificationWorkflowOrchestrator() {
  const rbac = useClassificationsRBAC();
  const queryClient = useQueryClient();
  
  // State
  const [activeWorkflows, setActiveWorkflows] = useState<WorkflowExecution[]>([]);
  const [workflowHistory, setWorkflowHistory] = useState<WorkflowExecution[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  // Get available templates based on permissions
  const availableTemplates = useMemo(() => {
    return WORKFLOW_TEMPLATES.filter(template => 
      template.permissions.every(permission => rbac.hasPermission(permission))
    );
  }, [rbac]);

  // Workflow execution queries
  const { data: workflowMetrics } = useQuery({
    queryKey: ['workflow-metrics'],
    queryFn: async () => {
      const response = await ClassificationApi.getWorkflowMetrics();
      return response.data;
    },
    enabled: rbac.classificationPermissions.canViewWorkflows,
    staleTime: 5 * 60 * 1000,
  });

  const { data: activeWorkflowsData } = useQuery({
    queryKey: ['active-workflows'],
    queryFn: async () => {
      const response = await ClassificationApi.getActiveWorkflows();
      return response.data;
    },
    enabled: rbac.classificationPermissions.canViewWorkflows,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Update active workflows
  useEffect(() => {
    if (activeWorkflowsData?.workflows) {
      setActiveWorkflows(activeWorkflowsData.workflows);
    }
  }, [activeWorkflowsData]);

  // Execute workflow mutation
  const executeWorkflowMutation = useMutation({
    mutationFn: async ({ templateId, context }: { templateId: string; context?: Record<string, any> }) => {
      const template = WORKFLOW_TEMPLATES.find(t => t.id === templateId);
      if (!template) throw new Error('Template not found');

      // Check permissions
      if (!template.permissions.every(permission => rbac.hasPermission(permission))) {
        throw new Error('Insufficient permissions to execute workflow');
      }

      const execution: WorkflowExecution = {
        id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        templateId,
        name: template.name,
        status: 'running',
        progress: 0,
        currentStepIndex: 0,
        steps: template.steps.map(step => ({ ...step, status: 'pending' })),
        startTime: new Date().toISOString(),
        triggeredBy: rbac.currentUser?.id.toString() || 'unknown',
        context: context || {},
        results: {},
        notifications: true,
        priority: 'normal'
      };

      // Log workflow start
      rbac.logUserAction('start_workflow', 'classification_workflow', undefined, {
        templateId,
        workflowName: template.name,
        context
      });

      return ClassificationApi.executeWorkflow(execution);
    },
    onSuccess: (data) => {
      setActiveWorkflows(prev => [...prev, data.execution]);
      queryClient.invalidateQueries({ queryKey: ['active-workflows'] });
    },
    onError: (error) => {
      console.error('Workflow execution failed:', error);
    }
  });

  // Step execution functions
  const executeStep = useCallback(async (
    workflowId: string, 
    stepId: string, 
    stepConfig?: Record<string, any>
  ) => {
    const workflow = activeWorkflows.find(w => w.id === workflowId);
    if (!workflow) throw new Error('Workflow not found');

    const step = workflow.steps.find(s => s.id === stepId);
    if (!step) throw new Error('Step not found');

    // Check step permissions
    if (!step.permissions.every(permission => rbac.hasPermission(permission))) {
      throw new Error('Insufficient permissions for this step');
    }

    try {
      // Update step status to running
      setActiveWorkflows(prev => prev.map(w => 
        w.id === workflowId ? {
          ...w,
          steps: w.steps.map(s => 
            s.id === stepId ? { ...s, status: 'running', startTime: new Date().toISOString() } : s
          )
        } : w
      ));

      let result;
      
      // Execute step based on type
      switch (step.type) {
        case 'manual':
          result = await ClassificationApi.executeManualStep(stepId, stepConfig);
          break;
        case 'ml':
          result = await mlApi.executeMLStep(stepId, stepConfig);
          break;
        case 'ai':
          result = await aiApi.executeAIStep(stepId, stepConfig);
          break;
        case 'validation':
          result = await ClassificationApi.executeValidationStep(stepId, stepConfig);
          break;
        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      // Update step status to completed
      setActiveWorkflows(prev => prev.map(w => 
        w.id === workflowId ? {
          ...w,
          steps: w.steps.map(s => 
            s.id === stepId ? { 
              ...s, 
              status: 'completed', 
              endTime: new Date().toISOString(),
              output: result.data,
              progress: 100
            } : s
          )
        } : w
      ));

      // Log step completion
      rbac.logUserAction('complete_workflow_step', 'classification_workflow_step', undefined, {
        workflowId,
        stepId,
        stepName: step.name,
        duration: Date.now() - new Date(step.startTime || '').getTime()
      });

      return result;

    } catch (error) {
      // Update step status to failed
      setActiveWorkflows(prev => prev.map(w => 
        w.id === workflowId ? {
          ...w,
          steps: w.steps.map(s => 
            s.id === stepId ? { 
              ...s, 
              status: 'failed', 
              error: error instanceof Error ? error.message : 'Step execution failed',
              endTime: new Date().toISOString()
            } : s
          )
        } : w
      ));

      throw error;
    }
  }, [activeWorkflows, rbac]);

  // Workflow control functions
  const pauseWorkflow = useCallback(async (workflowId: string) => {
    const workflow = activeWorkflows.find(w => w.id === workflowId);
    if (!workflow) return;

    setActiveWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, status: 'paused' } : w
    ));

    rbac.logUserAction('pause_workflow', 'classification_workflow', undefined, {
      workflowId,
      workflowName: workflow.name
    });
  }, [activeWorkflows, rbac]);

  const resumeWorkflow = useCallback(async (workflowId: string) => {
    const workflow = activeWorkflows.find(w => w.id === workflowId);
    if (!workflow) return;

    setActiveWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, status: 'running' } : w
    ));

    rbac.logUserAction('resume_workflow', 'classification_workflow', undefined, {
      workflowId,
      workflowName: workflow.name
    });
  }, [activeWorkflows, rbac]);

  const cancelWorkflow = useCallback(async (workflowId: string) => {
    const workflow = activeWorkflows.find(w => w.id === workflowId);
    if (!workflow) return;

    setActiveWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, status: 'cancelled', endTime: new Date().toISOString() } : w
    ));

    rbac.logUserAction('cancel_workflow', 'classification_workflow', undefined, {
      workflowId,
      workflowName: workflow.name,
      reason: 'user_cancelled'
    });
  }, [activeWorkflows, rbac]);

  // Auto-execution for workflows
  const executeWorkflow = useCallback(async (
    templateId: string, 
    context?: Record<string, any>
  ) => {
    if (!rbac.classificationPermissions.canExecuteWorkflows) {
      throw new Error('Insufficient permissions to execute workflows');
    }

    setIsExecuting(true);
    try {
      const result = await executeWorkflowMutation.mutateAsync({ templateId, context });
      return result;
    } finally {
      setIsExecuting(false);
    }
  }, [rbac, executeWorkflowMutation]);

  // Get workflow progress
  const getWorkflowProgress = useCallback((workflowId: string): number => {
    const workflow = activeWorkflows.find(w => w.id === workflowId);
    if (!workflow) return 0;

    const completedSteps = workflow.steps.filter(s => s.status === 'completed').length;
    return (completedSteps / workflow.steps.length) * 100;
  }, [activeWorkflows]);

  // Get next executable step
  const getNextExecutableStep = useCallback((workflowId: string): WorkflowStep | null => {
    const workflow = activeWorkflows.find(w => w.id === workflowId);
    if (!workflow) return null;

    return workflow.steps.find(step => 
      step.status === 'pending' && 
      step.dependencies.every(depId => 
        workflow.steps.find(s => s.id === depId)?.status === 'completed'
      )
    ) || null;
  }, [activeWorkflows]);

  // Workflow recommendations
  const getRecommendedWorkflows = useCallback((context: Record<string, any>): WorkflowTemplate[] => {
    // Simple recommendation logic based on context
    const userCapabilities = Object.keys(rbac.classificationPermissions)
      .filter(key => rbac.classificationPermissions[key as keyof typeof rbac.classificationPermissions]);

    return availableTemplates
      .filter(template => {
        // Filter based on user capabilities and context
        if (context.assetType === 'new' && template.category === 'onboarding') return true;
        if (context.focus === 'quality' && template.category === 'quality') return true;
        if (context.focus === 'lineage' && template.category === 'lineage') return true;
        return false;
      })
      .sort((a, b) => {
        // Sort by complexity and user experience
        const complexityOrder = { simple: 0, moderate: 1, complex: 2, expert: 3 };
        return complexityOrder[a.complexity] - complexityOrder[b.complexity];
      });
  }, [availableTemplates, rbac]);

  return {
    // Templates and executions
    availableTemplates,
    activeWorkflows,
    workflowHistory,
    workflowMetrics,
    
    // State
    isExecuting,
    
    // Actions
    executeWorkflow,
    executeStep,
    pauseWorkflow,
    resumeWorkflow,
    cancelWorkflow,
    
    // Utilities
    getWorkflowProgress,
    getNextExecutableStep,
    getRecommendedWorkflows,
    
    // Permission checks
    canExecuteWorkflows: rbac.classificationPermissions.canExecuteWorkflows,
    canManageWorkflows: rbac.classificationPermissions.canManageWorkflows,
    canMonitorWorkflows: rbac.classificationPermissions.canMonitorWorkflows,
  };
}

export { WORKFLOW_TEMPLATES };
export type { WorkflowStep, WorkflowTemplate, WorkflowExecution, WorkflowMetrics };