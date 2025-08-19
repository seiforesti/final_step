import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useClassificationState } from './useClassificationState';
import { useMLIntelligence } from './useMLIntelligence';
import { useAIIntelligence } from './useAIIntelligence';
import { websocketApi, WebSocketEventType } from '../api/websocketApi';

// Workflow types
export enum WorkflowType {
  MANUAL_CLASSIFICATION = 'manual_classification',
  ML_TRAINING = 'ml_training',
  AI_INFERENCE = 'ai_inference',
  BULK_OPERATION = 'bulk_operation',
  AUDIT_ANALYSIS = 'audit_analysis',
  COMPLIANCE_CHECK = 'compliance_check',
  CROSS_VERSION = 'cross_version',
  HYBRID_WORKFLOW = 'hybrid_workflow'
}

// Workflow status
export enum WorkflowStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  RETRYING = 'retrying'
}

// Workflow priority
export enum WorkflowPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Workflow step interface
export interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  status: WorkflowStatus;
  startTime?: string;
  endTime?: string;
  duration?: number;
  progress: number;
  dependencies: string[];
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
  metadata?: any;
  outputs?: any;
}

// Workflow definition
export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  type: WorkflowType;
  priority: WorkflowPriority;
  status: WorkflowStatus;
  steps: WorkflowStep[];
  currentStep?: string;
  startTime?: string;
  endTime?: string;
  totalDuration?: number;
  progress: number;
  retryCount: number;
  maxRetries: number;
  timeout?: number;
  tags: string[];
  metadata: {
    createdBy: string;
    version: string;
    environment: string;
    estimatedDuration?: number;
    resourceRequirements?: {
      cpu: number;
      memory: number;
      storage: number;
    };
    dependencies?: string[];
    triggers?: string[];
  };
  configuration: any;
  results?: any;
  errorLog?: string[];
}

// Workflow execution context
export interface WorkflowExecutionContext {
  workflowId: string;
  stepId: string;
  data: any;
  environment: {
    variables: Record<string, any>;
    secrets: Record<string, string>;
    resources: {
      cpu: number;
      memory: number;
      storage: number;
    };
  };
  state: any;
  history: any[];
}

// Workflow trigger
export interface WorkflowTrigger {
  id: string;
  name: string;
  type: 'manual' | 'scheduled' | 'event' | 'webhook' | 'api';
  condition: any;
  workflowId: string;
  enabled: boolean;
  lastTriggered?: string;
  triggerCount: number;
}

// Workflow template
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: WorkflowType;
  steps: Omit<WorkflowStep, 'id' | 'status' | 'progress' | 'retryCount'>[];
  defaultConfiguration: any;
  estimatedDuration: number;
  complexity: 'simple' | 'medium' | 'complex';
  tags: string[];
}

// Intelligent routing configuration
export interface IntelligentRouting {
  enabled: boolean;
  algorithm: 'round_robin' | 'least_loaded' | 'priority_based' | 'ml_optimized';
  loadBalancing: {
    maxConcurrentWorkflows: number;
    resourceThreshold: number;
    priorityWeighting: boolean;
  };
  autoScaling: {
    enabled: boolean;
    minInstances: number;
    maxInstances: number;
    scaleUpThreshold: number;
    scaleDownThreshold: number;
  };
  failover: {
    enabled: boolean;
    retryAttempts: number;
    backoffStrategy: 'linear' | 'exponential';
    alternativeRoutes: string[];
  };
}

// Workflow orchestration state
export interface WorkflowOrchestrationState {
  workflows: WorkflowDefinition[];
  activeWorkflows: WorkflowDefinition[];
  templates: WorkflowTemplate[];
  triggers: WorkflowTrigger[];
  executionQueue: string[];
  runningCount: number;
  completedCount: number;
  failedCount: number;
  totalExecutionTime: number;
  averageExecutionTime: number;
  throughput: number;
  errorRate: number;
  resourceUtilization: {
    cpu: number;
    memory: number;
    storage: number;
  };
  routing: IntelligentRouting;
  isInitialized: boolean;
  isProcessing: boolean;
}

// Workflow orchestration configuration
export interface WorkflowOrchestrationConfig {
  maxConcurrentWorkflows: number;
  defaultTimeout: number;
  retryPolicy: {
    maxRetries: number;
    backoffStrategy: 'linear' | 'exponential';
    retryDelay: number;
  };
  monitoring: {
    enabled: boolean;
    metricsInterval: number;
    alertThresholds: {
      errorRate: number;
      executionTime: number;
      queueSize: number;
    };
  };
  persistence: {
    enabled: boolean;
    saveInterval: number;
    maxHistorySize: number;
  };
  optimization: {
    enabled: boolean;
    algorithm: 'genetic' | 'simulated_annealing' | 'gradient_descent';
    learningRate: number;
  };
}

// Default configuration
const defaultConfig: WorkflowOrchestrationConfig = {
  maxConcurrentWorkflows: 10,
  defaultTimeout: 300000, // 5 minutes
  retryPolicy: {
    maxRetries: 3,
    backoffStrategy: 'exponential',
    retryDelay: 1000
  },
  monitoring: {
    enabled: true,
    metricsInterval: 10000, // 10 seconds
    alertThresholds: {
      errorRate: 0.1, // 10%
      executionTime: 600000, // 10 minutes
      queueSize: 50
    }
  },
  persistence: {
    enabled: true,
    saveInterval: 30000, // 30 seconds
    maxHistorySize: 1000
  },
  optimization: {
    enabled: true,
    algorithm: 'genetic',
    learningRate: 0.01
  }
};

// Workflow orchestration hook
export const useWorkflowOrchestration = (config: Partial<WorkflowOrchestrationConfig> = {}) => {
  const finalConfig = useMemo(() => ({ ...defaultConfig, ...config }), [config]);
  
  // State management
  const [state, setState] = useState<WorkflowOrchestrationState>({
    workflows: [],
    activeWorkflows: [],
    templates: [],
    triggers: [],
    executionQueue: [],
    runningCount: 0,
    completedCount: 0,
    failedCount: 0,
    totalExecutionTime: 0,
    averageExecutionTime: 0,
    throughput: 0,
    errorRate: 0,
    resourceUtilization: {
      cpu: 0,
      memory: 0,
      storage: 0
    },
    routing: {
      enabled: true,
      algorithm: 'ml_optimized',
      loadBalancing: {
        maxConcurrentWorkflows: finalConfig.maxConcurrentWorkflows,
        resourceThreshold: 0.8,
        priorityWeighting: true
      },
      autoScaling: {
        enabled: true,
        minInstances: 1,
        maxInstances: 5,
        scaleUpThreshold: 0.8,
        scaleDownThreshold: 0.3
      },
      failover: {
        enabled: true,
        retryAttempts: 3,
        backoffStrategy: 'exponential',
        alternativeRoutes: []
      }
    },
    isInitialized: false,
    isProcessing: false
  });

  // Hooks integration
  const classificationState = useClassificationState();
  const mlIntelligence = useMLIntelligence();
  const aiIntelligence = useAIIntelligence();

  // Refs for tracking
  const executionContext = useRef<Map<string, WorkflowExecutionContext>>(new Map());
  const metricsInterval = useRef<NodeJS.Timeout | null>(null);
  const persistenceInterval = useRef<NodeJS.Timeout | null>(null);
  const optimizationHistory = useRef<any[]>([]);

  // WebSocket instance
  const wsInstance = useMemo(() => websocketApi.getInstance(), []);

  // Initialize workflow orchestration
  const initialize = useCallback(async () => {
    try {
      // Load saved workflows from persistence
      await loadPersistedWorkflows();

      // Initialize workflow templates
      await initializeTemplates();

      // Setup WebSocket subscriptions
      if (wsInstance) {
        wsInstance.subscribe(
          WebSocketEventType.WORKFLOW_STATUS,
          handleWorkflowStatusUpdate,
          { priority: 15 }
        );
      }

      // Start monitoring
      if (finalConfig.monitoring.enabled) {
        startMonitoring();
      }

      // Start persistence
      if (finalConfig.persistence.enabled) {
        startPersistence();
      }

      setState(prev => ({
        ...prev,
        isInitialized: true
      }));

    } catch (error) {
      console.error('Failed to initialize workflow orchestration:', error);
    }
  }, [finalConfig, wsInstance]);

  // Create workflow from template
  const createWorkflowFromTemplate = useCallback((templateId: string, configuration: any = {}): WorkflowDefinition => {
    const template = state.templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const workflow: WorkflowDefinition = {
      id: workflowId,
      name: template.name,
      description: template.description,
      type: template.type,
      priority: WorkflowPriority.MEDIUM,
      status: WorkflowStatus.PENDING,
      steps: template.steps.map((step, index) => ({
        ...step,
        id: `${workflowId}_step_${index}`,
        status: WorkflowStatus.PENDING,
        progress: 0,
        retryCount: 0,
        maxRetries: finalConfig.retryPolicy.maxRetries
      })),
      progress: 0,
      retryCount: 0,
      maxRetries: finalConfig.retryPolicy.maxRetries,
      timeout: finalConfig.defaultTimeout,
      tags: template.tags,
      metadata: {
        createdBy: 'system',
        version: '1.0',
        environment: 'production',
        estimatedDuration: template.estimatedDuration
      },
      configuration: { ...template.defaultConfiguration, ...configuration }
    };

    return workflow;
  }, [state.templates, finalConfig]);

  // Execute workflow
  const executeWorkflow = useCallback(async (workflowId: string): Promise<void> => {
    const workflow = state.workflows.find(w => w.id === workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    // Check if we can execute (not exceeding max concurrent)
    if (state.runningCount >= finalConfig.maxConcurrentWorkflows) {
      // Add to queue
      setState(prev => ({
        ...prev,
        executionQueue: [...prev.executionQueue, workflowId]
      }));
      return;
    }

    try {
      setState(prev => ({
        ...prev,
        isProcessing: true,
        workflows: prev.workflows.map(w =>
          w.id === workflowId
            ? { ...w, status: WorkflowStatus.RUNNING, startTime: new Date().toISOString() }
            : w
        ),
        activeWorkflows: [...prev.activeWorkflows, workflow],
        runningCount: prev.runningCount + 1
      }));

      // Create execution context
      const context: WorkflowExecutionContext = {
        workflowId,
        stepId: workflow.steps[0]?.id || '',
        data: {},
        environment: {
          variables: {},
          secrets: {},
          resources: {
            cpu: 1,
            memory: 1024,
            storage: 1024
          }
        },
        state: {},
        history: []
      };

      executionContext.current.set(workflowId, context);

      // Execute workflow steps
      await executeWorkflowSteps(workflow, context);

    } catch (error) {
      console.error(`Workflow execution failed: ${workflowId}`, error);
      await handleWorkflowError(workflowId, error);
    }
  }, [state.workflows, state.runningCount, finalConfig.maxConcurrentWorkflows]);

  // Execute workflow steps
  const executeWorkflowSteps = useCallback(async (workflow: WorkflowDefinition, context: WorkflowExecutionContext): Promise<void> => {
    for (const step of workflow.steps) {
      try {
        // Check dependencies
        const dependenciesMet = await checkStepDependencies(step, workflow);
        if (!dependenciesMet) {
          throw new Error(`Dependencies not met for step: ${step.name}`);
        }

        // Update step status
        setState(prev => ({
          ...prev,
          workflows: prev.workflows.map(w =>
            w.id === workflow.id
              ? {
                  ...w,
                  currentStep: step.id,
                  steps: w.steps.map(s =>
                    s.id === step.id
                      ? { ...s, status: WorkflowStatus.RUNNING, startTime: new Date().toISOString() }
                      : s
                  )
                }
              : w
          )
        }));

        // Execute step
        const stepResult = await executeWorkflowStep(step, context);

        // Update step completion
        setState(prev => ({
          ...prev,
          workflows: prev.workflows.map(w =>
            w.id === workflow.id
              ? {
                  ...w,
                  steps: w.steps.map(s =>
                    s.id === step.id
                      ? {
                          ...s,
                          status: WorkflowStatus.COMPLETED,
                          endTime: new Date().toISOString(),
                          progress: 100,
                          outputs: stepResult
                        }
                      : s
                  )
                }
              : w
          )
        }));

        // Update context with step results
        context.data = { ...context.data, [step.id]: stepResult };
        context.history.push({
          stepId: step.id,
          timestamp: new Date().toISOString(),
          result: stepResult
        });

      } catch (error) {
        await handleStepError(workflow.id, step.id, error);
        
        // If step failed and no more retries, fail the workflow
        if (step.retryCount >= step.maxRetries) {
          throw error;
        }
      }
    }

    // Complete workflow
    await completeWorkflow(workflow.id);
  }, []);

  // Execute individual workflow step
  const executeWorkflowStep = useCallback(async (step: WorkflowStep, context: WorkflowExecutionContext): Promise<any> => {
    // Route step execution based on type
    switch (step.type) {
      case 'classification':
        return await executeClassificationStep(step, context);
      case 'ml_training':
        return await executeMLTrainingStep(step, context);
      case 'ai_inference':
        return await executeAIInferenceStep(step, context);
      case 'bulk_operation':
        return await executeBulkOperationStep(step, context);
      case 'audit_analysis':
        return await executeAuditAnalysisStep(step, context);
      case 'compliance_check':
        return await executeComplianceCheckStep(step, context);
      case 'data_transformation':
        return await executeDataTransformationStep(step, context);
      case 'notification':
        return await executeNotificationStep(step, context);
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }, []);

  // Execute classification step
  const executeClassificationStep = useCallback(async (step: WorkflowStep, context: WorkflowExecutionContext): Promise<any> => {
    // Simulate classification step execution
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      classified: true,
      accuracy: 0.95,
      processedItems: 100,
      timestamp: new Date().toISOString()
    };
  }, []);

  // Execute ML training step
  const executeMLTrainingStep = useCallback(async (step: WorkflowStep, context: WorkflowExecutionContext): Promise<any> => {
    // Integrate with ML intelligence
    const trainingJob = await mlIntelligence.startTraining({
      modelType: step.metadata?.modelType || 'classification',
      dataset: step.metadata?.dataset,
      parameters: step.metadata?.parameters
    });

    return {
      jobId: trainingJob.id,
      status: 'completed',
      accuracy: trainingJob.metrics?.accuracy,
      duration: trainingJob.duration
    };
  }, [mlIntelligence]);

  // Execute AI inference step
  const executeAIInferenceStep = useCallback(async (step: WorkflowStep, context: WorkflowExecutionContext): Promise<any> => {
    // Integrate with AI intelligence
    const inference = await aiIntelligence.runInference({
      modelId: step.metadata?.modelId,
      input: context.data,
      options: step.metadata?.options
    });

    return {
      predictions: inference.predictions,
      confidence: inference.confidence,
      processingTime: inference.processingTime
    };
  }, [aiIntelligence]);

  // Execute bulk operation step
  const executeBulkOperationStep = useCallback(async (step: WorkflowStep, context: WorkflowExecutionContext): Promise<any> => {
    // Simulate bulk operation
    const totalItems = step.metadata?.itemCount || 1000;
    const batchSize = step.metadata?.batchSize || 100;
    const batches = Math.ceil(totalItems / batchSize);

    for (let i = 0; i < batches; i++) {
      // Update progress
      const progress = ((i + 1) / batches) * 100;
      setState(prev => ({
        ...prev,
        workflows: prev.workflows.map(w =>
          w.id === context.workflowId
            ? {
                ...w,
                steps: w.steps.map(s =>
                  s.id === step.id ? { ...s, progress } : s
                )
              }
            : w
        )
      }));

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return {
      processedItems: totalItems,
      successCount: totalItems * 0.95,
      errorCount: totalItems * 0.05,
      duration: batches * 100
    };
  }, []);

  // Execute audit analysis step
  const executeAuditAnalysisStep = useCallback(async (step: WorkflowStep, context: WorkflowExecutionContext): Promise<any> => {
    // Simulate audit analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      auditResults: {
        totalRecords: 5000,
        anomalies: 25,
        complianceScore: 0.98,
        recommendations: [
          'Review access controls',
          'Update classification policies',
          'Implement additional monitoring'
        ]
      }
    };
  }, []);

  // Execute compliance check step
  const executeComplianceCheckStep = useCallback(async (step: WorkflowStep, context: WorkflowExecutionContext): Promise<any> => {
    // Simulate compliance check
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      complianceStatus: 'passed',
      score: 0.96,
      violations: [],
      recommendations: [
        'Update data retention policies',
        'Review user access permissions'
      ]
    };
  }, []);

  // Execute data transformation step
  const executeDataTransformationStep = useCallback(async (step: WorkflowStep, context: WorkflowExecutionContext): Promise<any> => {
    // Simulate data transformation
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      transformedRecords: 10000,
      transformationRules: step.metadata?.rules || [],
      outputFormat: step.metadata?.outputFormat || 'json',
      qualityScore: 0.97
    };
  }, []);

  // Execute notification step
  const executeNotificationStep = useCallback(async (step: WorkflowStep, context: WorkflowExecutionContext): Promise<any> => {
    // Simulate notification
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      notificationsSent: step.metadata?.recipients?.length || 1,
      channels: step.metadata?.channels || ['email'],
      deliveryStatus: 'success'
    };
  }, []);

  // Check step dependencies
  const checkStepDependencies = useCallback(async (step: WorkflowStep, workflow: WorkflowDefinition): Promise<boolean> => {
    if (step.dependencies.length === 0) return true;

    return step.dependencies.every(depId => {
      const dependentStep = workflow.steps.find(s => s.id === depId);
      return dependentStep?.status === WorkflowStatus.COMPLETED;
    });
  }, []);

  // Handle step error
  const handleStepError = useCallback(async (workflowId: string, stepId: string, error: any): Promise<void> => {
    setState(prev => ({
      ...prev,
      workflows: prev.workflows.map(w =>
        w.id === workflowId
          ? {
              ...w,
              steps: w.steps.map(s =>
                s.id === stepId
                  ? {
                      ...s,
                      status: WorkflowStatus.FAILED,
                      retryCount: s.retryCount + 1,
                      errorMessage: error.message || 'Unknown error'
                    }
                  : s
              )
            }
          : w
      )
    }));

    // Retry if possible
    const workflow = state.workflows.find(w => w.id === workflowId);
    const step = workflow?.steps.find(s => s.id === stepId);
    
    if (step && step.retryCount < step.maxRetries) {
      // Schedule retry with backoff
      const delay = finalConfig.retryPolicy.retryDelay * Math.pow(2, step.retryCount);
      setTimeout(() => {
        // Retry step execution
        const context = executionContext.current.get(workflowId);
        if (context) {
          executeWorkflowStep(step, context).catch(err => {
            handleStepError(workflowId, stepId, err);
          });
        }
      }, delay);
    }
  }, [state.workflows, finalConfig.retryPolicy]);

  // Handle workflow error
  const handleWorkflowError = useCallback(async (workflowId: string, error: any): Promise<void> => {
    setState(prev => ({
      ...prev,
      workflows: prev.workflows.map(w =>
        w.id === workflowId
          ? {
              ...w,
              status: WorkflowStatus.FAILED,
              endTime: new Date().toISOString(),
              errorLog: [...(w.errorLog || []), error.message || 'Unknown error']
            }
          : w
      ),
      activeWorkflows: prev.activeWorkflows.filter(w => w.id !== workflowId),
      runningCount: prev.runningCount - 1,
      failedCount: prev.failedCount + 1
    }));

    // Clean up execution context
    executionContext.current.delete(workflowId);

    // Process next workflow in queue
    processQueue();
  }, []);

  // Complete workflow
  const completeWorkflow = useCallback(async (workflowId: string): Promise<void> => {
    const workflow = state.workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    const endTime = new Date().toISOString();
    const duration = workflow.startTime 
      ? new Date(endTime).getTime() - new Date(workflow.startTime).getTime()
      : 0;

    setState(prev => ({
      ...prev,
      workflows: prev.workflows.map(w =>
        w.id === workflowId
          ? {
              ...w,
              status: WorkflowStatus.COMPLETED,
              endTime,
              totalDuration: duration,
              progress: 100
            }
          : w
      ),
      activeWorkflows: prev.activeWorkflows.filter(w => w.id !== workflowId),
      runningCount: prev.runningCount - 1,
      completedCount: prev.completedCount + 1,
      totalExecutionTime: prev.totalExecutionTime + duration
    }));

    // Clean up execution context
    executionContext.current.delete(workflowId);

    // Process next workflow in queue
    processQueue();

    // Notify completion via WebSocket
    if (wsInstance) {
      wsInstance.send({
        type: WebSocketEventType.WORKFLOW_STATUS,
        payload: {
          workflowId,
          status: WorkflowStatus.COMPLETED,
          duration
        }
      });
    }
  }, [state.workflows, wsInstance]);

  // Process execution queue
  const processQueue = useCallback(() => {
    if (state.executionQueue.length > 0 && state.runningCount < finalConfig.maxConcurrentWorkflows) {
      const nextWorkflowId = state.executionQueue[0];
      setState(prev => ({
        ...prev,
        executionQueue: prev.executionQueue.slice(1)
      }));
      executeWorkflow(nextWorkflowId);
    }
  }, [state.executionQueue, state.runningCount, finalConfig.maxConcurrentWorkflows, executeWorkflow]);

  // Handle WebSocket workflow status updates
  const handleWorkflowStatusUpdate = useCallback((message: any) => {
    const { workflowId, status, progress, error } = message.payload;
    
    setState(prev => ({
      ...prev,
      workflows: prev.workflows.map(w =>
        w.id === workflowId
          ? { ...w, status, progress: progress || w.progress, errorLog: error ? [...(w.errorLog || []), error] : w.errorLog }
          : w
      )
    }));
  }, []);

  // Load persisted workflows
  const loadPersistedWorkflows = useCallback(async (): Promise<void> => {
    try {
      // Simulate loading from persistence layer
      const savedWorkflows = localStorage.getItem('workflow_orchestration_state');
      if (savedWorkflows) {
        const parsed = JSON.parse(savedWorkflows);
        setState(prev => ({
          ...prev,
          workflows: parsed.workflows || [],
          templates: parsed.templates || [],
          triggers: parsed.triggers || []
        }));
      }
    } catch (error) {
      console.error('Failed to load persisted workflows:', error);
    }
  }, []);

  // Initialize workflow templates
  const initializeTemplates = useCallback(async (): Promise<void> => {
    const defaultTemplates: WorkflowTemplate[] = [
      {
        id: 'template_classification_basic',
        name: 'Basic Classification Workflow',
        description: 'Standard classification workflow with validation',
        category: 'Classification',
        type: WorkflowType.MANUAL_CLASSIFICATION,
        steps: [
          {
            name: 'Data Validation',
            type: 'data_validation',
            dependencies: [],
            maxRetries: 2
          },
          {
            name: 'Classification',
            type: 'classification',
            dependencies: ['data_validation'],
            maxRetries: 3
          },
          {
            name: 'Quality Check',
            type: 'quality_check',
            dependencies: ['classification'],
            maxRetries: 1
          }
        ],
        defaultConfiguration: {
          batchSize: 100,
          qualityThreshold: 0.95
        },
        estimatedDuration: 300000, // 5 minutes
        complexity: 'simple',
        tags: ['classification', 'basic', 'validation']
      },
      {
        id: 'template_ml_training',
        name: 'ML Model Training Workflow',
        description: 'Complete ML model training and validation pipeline',
        category: 'Machine Learning',
        type: WorkflowType.ML_TRAINING,
        steps: [
          {
            name: 'Data Preparation',
            type: 'data_transformation',
            dependencies: [],
            maxRetries: 2
          },
          {
            name: 'Feature Engineering',
            type: 'feature_engineering',
            dependencies: ['data_preparation'],
            maxRetries: 2
          },
          {
            name: 'Model Training',
            type: 'ml_training',
            dependencies: ['feature_engineering'],
            maxRetries: 1
          },
          {
            name: 'Model Validation',
            type: 'model_validation',
            dependencies: ['model_training'],
            maxRetries: 2
          },
          {
            name: 'Model Deployment',
            type: 'model_deployment',
            dependencies: ['model_validation'],
            maxRetries: 3
          }
        ],
        defaultConfiguration: {
          modelType: 'classification',
          validationSplit: 0.2,
          epochs: 100
        },
        estimatedDuration: 1800000, // 30 minutes
        complexity: 'complex',
        tags: ['ml', 'training', 'pipeline', 'validation']
      },
      {
        id: 'template_ai_inference',
        name: 'AI Inference Workflow',
        description: 'AI-powered inference and reasoning workflow',
        category: 'Artificial Intelligence',
        type: WorkflowType.AI_INFERENCE,
        steps: [
          {
            name: 'Input Processing',
            type: 'data_transformation',
            dependencies: [],
            maxRetries: 2
          },
          {
            name: 'AI Inference',
            type: 'ai_inference',
            dependencies: ['input_processing'],
            maxRetries: 3
          },
          {
            name: 'Result Analysis',
            type: 'result_analysis',
            dependencies: ['ai_inference'],
            maxRetries: 1
          },
          {
            name: 'Notification',
            type: 'notification',
            dependencies: ['result_analysis'],
            maxRetries: 2
          }
        ],
        defaultConfiguration: {
          modelId: 'default_ai_model',
          confidenceThreshold: 0.8
        },
        estimatedDuration: 600000, // 10 minutes
        complexity: 'medium',
        tags: ['ai', 'inference', 'reasoning', 'notification']
      }
    ];

    setState(prev => ({
      ...prev,
      templates: defaultTemplates
    }));
  }, []);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    metricsInterval.current = setInterval(() => {
      // Calculate metrics
      const totalWorkflows = state.workflows.length;
      const avgExecutionTime = totalWorkflows > 0 
        ? state.totalExecutionTime / (state.completedCount || 1)
        : 0;
      const errorRate = totalWorkflows > 0 
        ? state.failedCount / totalWorkflows 
        : 0;
      const throughput = state.completedCount / (Date.now() / 1000 / 60); // per minute

      setState(prev => ({
        ...prev,
        averageExecutionTime: avgExecutionTime,
        errorRate,
        throughput
      }));

      // Check alert thresholds
      if (errorRate > finalConfig.monitoring.alertThresholds.errorRate) {
        console.warn(`High error rate detected: ${(errorRate * 100).toFixed(2)}%`);
      }

      if (state.executionQueue.length > finalConfig.monitoring.alertThresholds.queueSize) {
        console.warn(`Large execution queue detected: ${state.executionQueue.length} workflows`);
      }
    }, finalConfig.monitoring.metricsInterval);
  }, [state, finalConfig.monitoring]);

  // Start persistence
  const startPersistence = useCallback(() => {
    persistenceInterval.current = setInterval(() => {
      try {
        const stateToSave = {
          workflows: state.workflows.slice(-finalConfig.persistence.maxHistorySize),
          templates: state.templates,
          triggers: state.triggers
        };
        localStorage.setItem('workflow_orchestration_state', JSON.stringify(stateToSave));
      } catch (error) {
        console.error('Failed to persist workflow state:', error);
      }
    }, finalConfig.persistence.saveInterval);
  }, [state, finalConfig.persistence]);

  // Pause workflow
  const pauseWorkflow = useCallback((workflowId: string) => {
    setState(prev => ({
      ...prev,
      workflows: prev.workflows.map(w =>
        w.id === workflowId
          ? { ...w, status: WorkflowStatus.PAUSED }
          : w
      )
    }));
  }, []);

  // Resume workflow
  const resumeWorkflow = useCallback((workflowId: string) => {
    setState(prev => ({
      ...prev,
      workflows: prev.workflows.map(w =>
        w.id === workflowId
          ? { ...w, status: WorkflowStatus.RUNNING }
          : w
      )
    }));
  }, []);

  // Cancel workflow
  const cancelWorkflow = useCallback((workflowId: string) => {
    setState(prev => ({
      ...prev,
      workflows: prev.workflows.map(w =>
        w.id === workflowId
          ? { ...w, status: WorkflowStatus.CANCELLED, endTime: new Date().toISOString() }
          : w
      ),
      activeWorkflows: prev.activeWorkflows.filter(w => w.id !== workflowId),
      runningCount: Math.max(0, prev.runningCount - 1)
    }));

    // Clean up execution context
    executionContext.current.delete(workflowId);
  }, []);

  // Get workflow statistics
  const getWorkflowStats = useCallback(() => {
    return {
      total: state.workflows.length,
      running: state.runningCount,
      completed: state.completedCount,
      failed: state.failedCount,
      queued: state.executionQueue.length,
      averageExecutionTime: state.averageExecutionTime,
      throughput: state.throughput,
      errorRate: state.errorRate
    };
  }, [state]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (metricsInterval.current) {
        clearInterval(metricsInterval.current);
      }
      if (persistenceInterval.current) {
        clearInterval(persistenceInterval.current);
      }
    };
  }, []);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Export orchestration interface
  return {
    // State
    ...state,
    
    // Configuration
    config: finalConfig,
    
    // Actions
    initialize,
    createWorkflowFromTemplate,
    executeWorkflow,
    pauseWorkflow,
    resumeWorkflow,
    cancelWorkflow,
    
    // Data access
    getWorkflowStats,
    
    // Computed values
    isHealthy: state.errorRate < 0.1,
    hasQueuedWorkflows: state.executionQueue.length > 0,
    isProcessingWorkflows: state.runningCount > 0,
    resourceUtilization: state.resourceUtilization,
    
    // Real-time status
    activeWorkflowCount: state.activeWorkflows.length,
    queueSize: state.executionQueue.length,
    totalWorkflows: state.workflows.length
  };
};

export default useWorkflowOrchestration;