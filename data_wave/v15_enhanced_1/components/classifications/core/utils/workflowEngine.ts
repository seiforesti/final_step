import { WorkflowDefinition, WorkflowStep, WorkflowStatus, WorkflowType, WorkflowPriority } from '../hooks/useWorkflowOrchestration';

// Workflow execution engine
export class WorkflowEngine {
  private static instance: WorkflowEngine;
  private executionQueue: Map<string, WorkflowDefinition> = new Map();
  private runningWorkflows: Map<string, WorkflowExecution> = new Map();
  private completedWorkflows: Map<string, WorkflowResult> = new Map();
  private maxConcurrentExecutions: number = 10;
  private executionStrategies: Map<WorkflowType, ExecutionStrategy> = new Map();

  private constructor() {
    this.initializeExecutionStrategies();
  }

  public static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine();
    }
    return WorkflowEngine.instance;
  }

  // Initialize execution strategies for different workflow types
  private initializeExecutionStrategies(): void {
    this.executionStrategies.set(WorkflowType.MANUAL_CLASSIFICATION, new ManualClassificationStrategy());
    this.executionStrategies.set(WorkflowType.ML_TRAINING, new MLTrainingStrategy());
    this.executionStrategies.set(WorkflowType.AI_INFERENCE, new AIInferenceStrategy());
    this.executionStrategies.set(WorkflowType.BULK_OPERATION, new BulkOperationStrategy());
    this.executionStrategies.set(WorkflowType.AUDIT_ANALYSIS, new AuditAnalysisStrategy());
    this.executionStrategies.set(WorkflowType.COMPLIANCE_CHECK, new ComplianceCheckStrategy());
    this.executionStrategies.set(WorkflowType.CROSS_VERSION, new CrossVersionStrategy());
    this.executionStrategies.set(WorkflowType.HYBRID_WORKFLOW, new HybridWorkflowStrategy());
  }

  // Execute workflow
  public async executeWorkflow(workflow: WorkflowDefinition): Promise<string> {
    const executionId = this.generateExecutionId();
    
    // Validate workflow
    const validation = this.validateWorkflow(workflow);
    if (!validation.isValid) {
      throw new Error(`Workflow validation failed: ${validation.errors.join(', ')}`);
    }

    // Check capacity
    if (this.runningWorkflows.size >= this.maxConcurrentExecutions) {
      this.executionQueue.set(executionId, workflow);
      return executionId;
    }

    // Start execution
    const execution = new WorkflowExecution(executionId, workflow);
    this.runningWorkflows.set(executionId, execution);

    try {
      const result = await this.runWorkflow(execution);
      this.completedWorkflows.set(executionId, result);
      this.runningWorkflows.delete(executionId);
      
      // Process queue
      this.processQueue();
      
      return executionId;
    } catch (error) {
      this.runningWorkflows.delete(executionId);
      throw error;
    }
  }

  // Run workflow with appropriate strategy
  private async runWorkflow(execution: WorkflowExecution): Promise<WorkflowResult> {
    const strategy = this.executionStrategies.get(execution.workflow.type);
    if (!strategy) {
      throw new Error(`No execution strategy found for workflow type: ${execution.workflow.type}`);
    }

    return await strategy.execute(execution);
  }

  // Validate workflow definition
  private validateWorkflow(workflow: WorkflowDefinition): ValidationResult {
    const errors: string[] = [];

    // Basic validation
    if (!workflow.id) errors.push('Workflow ID is required');
    if (!workflow.name) errors.push('Workflow name is required');
    if (!workflow.steps || workflow.steps.length === 0) errors.push('Workflow must have at least one step');

    // Step validation
    workflow.steps.forEach((step, index) => {
      if (!step.id) errors.push(`Step ${index} is missing ID`);
      if (!step.name) errors.push(`Step ${index} is missing name`);
      if (!step.type) errors.push(`Step ${index} is missing type`);

      // Dependency validation
      step.dependencies.forEach(depId => {
        const dependentStep = workflow.steps.find(s => s.id === depId);
        if (!dependentStep) {
          errors.push(`Step ${step.name} has invalid dependency: ${depId}`);
        }
      });
    });

    // Circular dependency check
    if (this.hasCircularDependencies(workflow.steps)) {
      errors.push('Workflow has circular dependencies');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Check for circular dependencies
  private hasCircularDependencies(steps: WorkflowStep[]): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (stepId: string): boolean => {
      if (recursionStack.has(stepId)) return true;
      if (visited.has(stepId)) return false;

      visited.add(stepId);
      recursionStack.add(stepId);

      const step = steps.find(s => s.id === stepId);
      if (step) {
        for (const depId of step.dependencies) {
          if (hasCycle(depId)) return true;
        }
      }

      recursionStack.delete(stepId);
      return false;
    };

    for (const step of steps) {
      if (hasCycle(step.id)) return true;
    }

    return false;
  }

  // Process execution queue
  private processQueue(): void {
    if (this.executionQueue.size > 0 && this.runningWorkflows.size < this.maxConcurrentExecutions) {
      const [executionId, workflow] = this.executionQueue.entries().next().value;
      this.executionQueue.delete(executionId);
      
      const execution = new WorkflowExecution(executionId, workflow);
      this.runningWorkflows.set(executionId, execution);
      
      this.runWorkflow(execution)
        .then(result => {
          this.completedWorkflows.set(executionId, result);
          this.runningWorkflows.delete(executionId);
          this.processQueue();
        })
        .catch(error => {
          console.error(`Workflow execution failed: ${executionId}`, error);
          this.runningWorkflows.delete(executionId);
          this.processQueue();
        });
    }
  }

  // Generate unique execution ID
  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get execution status
  public getExecutionStatus(executionId: string): ExecutionStatus {
    if (this.runningWorkflows.has(executionId)) {
      const execution = this.runningWorkflows.get(executionId)!;
      return {
        id: executionId,
        status: 'running',
        progress: execution.getProgress(),
        currentStep: execution.getCurrentStep(),
        startTime: execution.startTime,
        estimatedCompletion: execution.getEstimatedCompletion()
      };
    }

    if (this.completedWorkflows.has(executionId)) {
      const result = this.completedWorkflows.get(executionId)!;
      return {
        id: executionId,
        status: result.success ? 'completed' : 'failed',
        progress: 100,
        currentStep: null,
        startTime: result.startTime,
        endTime: result.endTime,
        duration: result.duration,
        result: result.data
      };
    }

    if (this.executionQueue.has(executionId)) {
      return {
        id: executionId,
        status: 'queued',
        progress: 0,
        currentStep: null,
        queuePosition: Array.from(this.executionQueue.keys()).indexOf(executionId) + 1
      };
    }

    throw new Error(`Execution not found: ${executionId}`);
  }

  // Cancel execution
  public cancelExecution(executionId: string): void {
    if (this.runningWorkflows.has(executionId)) {
      const execution = this.runningWorkflows.get(executionId)!;
      execution.cancel();
      this.runningWorkflows.delete(executionId);
    } else if (this.executionQueue.has(executionId)) {
      this.executionQueue.delete(executionId);
    }
  }

  // Get statistics
  public getStatistics(): WorkflowEngineStats {
    return {
      totalExecutions: this.completedWorkflows.size + this.runningWorkflows.size + this.executionQueue.size,
      runningExecutions: this.runningWorkflows.size,
      queuedExecutions: this.executionQueue.size,
      completedExecutions: this.completedWorkflows.size,
      successRate: this.calculateSuccessRate(),
      averageExecutionTime: this.calculateAverageExecutionTime(),
      throughput: this.calculateThroughput()
    };
  }

  private calculateSuccessRate(): number {
    if (this.completedWorkflows.size === 0) return 0;
    const successful = Array.from(this.completedWorkflows.values()).filter(r => r.success).length;
    return successful / this.completedWorkflows.size;
  }

  private calculateAverageExecutionTime(): number {
    if (this.completedWorkflows.size === 0) return 0;
    const totalTime = Array.from(this.completedWorkflows.values()).reduce((sum, r) => sum + r.duration, 0);
    return totalTime / this.completedWorkflows.size;
  }

  private calculateThroughput(): number {
    // Calculate executions per hour
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const recentExecutions = Array.from(this.completedWorkflows.values())
      .filter(r => new Date(r.endTime).getTime() > oneHourAgo);
    return recentExecutions.length;
  }
}

// Workflow execution class
export class WorkflowExecution {
  public readonly id: string;
  public readonly workflow: WorkflowDefinition;
  public readonly startTime: string;
  private currentStepIndex: number = 0;
  private stepResults: Map<string, any> = new Map();
  private cancelled: boolean = false;

  constructor(id: string, workflow: WorkflowDefinition) {
    this.id = id;
    this.workflow = workflow;
    this.startTime = new Date().toISOString();
  }

  public getProgress(): number {
    if (this.workflow.steps.length === 0) return 0;
    return (this.currentStepIndex / this.workflow.steps.length) * 100;
  }

  public getCurrentStep(): WorkflowStep | null {
    if (this.currentStepIndex >= this.workflow.steps.length) return null;
    return this.workflow.steps[this.currentStepIndex];
  }

  public getEstimatedCompletion(): string {
    const remainingSteps = this.workflow.steps.length - this.currentStepIndex;
    const avgStepTime = this.workflow.metadata.estimatedDuration || 60000; // 1 minute default
    const estimatedMs = remainingSteps * (avgStepTime / this.workflow.steps.length);
    return new Date(Date.now() + estimatedMs).toISOString();
  }

  public setStepResult(stepId: string, result: any): void {
    this.stepResults.set(stepId, result);
  }

  public getStepResult(stepId: string): any {
    return this.stepResults.get(stepId);
  }

  public nextStep(): void {
    this.currentStepIndex++;
  }

  public cancel(): void {
    this.cancelled = true;
  }

  public isCancelled(): boolean {
    return this.cancelled;
  }
}

// Execution strategies
export abstract class ExecutionStrategy {
  abstract execute(execution: WorkflowExecution): Promise<WorkflowResult>;

  protected async executeStep(step: WorkflowStep, execution: WorkflowExecution): Promise<any> {
    // Check if execution is cancelled
    if (execution.isCancelled()) {
      throw new Error('Execution cancelled');
    }

    // Check dependencies
    const dependenciesMet = this.checkDependencies(step, execution);
    if (!dependenciesMet) {
      throw new Error(`Dependencies not met for step: ${step.name}`);
    }

    // Execute step based on type
    switch (step.type) {
      case 'data_validation':
        return await this.executeDataValidation(step, execution);
      case 'classification':
        return await this.executeClassification(step, execution);
      case 'ml_training':
        return await this.executeMLTraining(step, execution);
      case 'ai_inference':
        return await this.executeAIInference(step, execution);
      case 'bulk_operation':
        return await this.executeBulkOperation(step, execution);
      case 'audit_analysis':
        return await this.executeAuditAnalysis(step, execution);
      case 'compliance_check':
        return await this.executeComplianceCheck(step, execution);
      case 'notification':
        return await this.executeNotification(step, execution);
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  protected checkDependencies(step: WorkflowStep, execution: WorkflowExecution): boolean {
    return step.dependencies.every(depId => execution.getStepResult(depId) !== undefined);
  }

  // Step execution methods (to be overridden by specific strategies)
  protected async executeDataValidation(step: WorkflowStep, execution: WorkflowExecution): Promise<any> {
    // Default implementation
    await this.simulateProcessing(1000);
    return { validated: true, errors: [] };
  }

  protected async executeClassification(step: WorkflowStep, execution: WorkflowExecution): Promise<any> {
    await this.simulateProcessing(2000);
    return { classified: true, accuracy: 0.95 };
  }

  protected async executeMLTraining(step: WorkflowStep, execution: WorkflowExecution): Promise<any> {
    await this.simulateProcessing(5000);
    return { modelId: 'model_123', accuracy: 0.92, loss: 0.08 };
  }

  protected async executeAIInference(step: WorkflowStep, execution: WorkflowExecution): Promise<any> {
    await this.simulateProcessing(3000);
    return { predictions: [], confidence: 0.88 };
  }

  protected async executeBulkOperation(step: WorkflowStep, execution: WorkflowExecution): Promise<any> {
    await this.simulateProcessing(4000);
    return { processed: 1000, success: 950, failed: 50 };
  }

  protected async executeAuditAnalysis(step: WorkflowStep, execution: WorkflowExecution): Promise<any> {
    await this.simulateProcessing(3500);
    return { anomalies: 5, complianceScore: 0.96 };
  }

  protected async executeComplianceCheck(step: WorkflowStep, execution: WorkflowExecution): Promise<any> {
    await this.simulateProcessing(2500);
    return { compliant: true, violations: [] };
  }

  protected async executeNotification(step: WorkflowStep, execution: WorkflowExecution): Promise<any> {
    await this.simulateProcessing(500);
    return { sent: true, recipients: 1 };
  }

  protected async simulateProcessing(duration: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, duration));
  }
}

// Specific execution strategies
export class ManualClassificationStrategy extends ExecutionStrategy {
  async execute(execution: WorkflowExecution): Promise<WorkflowResult> {
    const startTime = Date.now();
    const results: any[] = [];

    try {
      for (const step of execution.workflow.steps) {
        const result = await this.executeStep(step, execution);
        execution.setStepResult(step.id, result);
        execution.nextStep();
        results.push({ stepId: step.id, result });
      }

      return {
        executionId: execution.id,
        success: true,
        startTime: execution.startTime,
        endTime: new Date().toISOString(),
        duration: Date.now() - startTime,
        data: { steps: results }
      };
    } catch (error) {
      return {
        executionId: execution.id,
        success: false,
        startTime: execution.startTime,
        endTime: new Date().toISOString(),
        duration: Date.now() - startTime,
        error: error.message,
        data: { steps: results }
      };
    }
  }
}

export class MLTrainingStrategy extends ExecutionStrategy {
  async execute(execution: WorkflowExecution): Promise<WorkflowResult> {
    const startTime = Date.now();
    const results: any[] = [];

    try {
      // Enhanced ML training workflow
      for (const step of execution.workflow.steps) {
        let result;
        
        if (step.type === 'ml_training') {
          // Enhanced ML training with progress tracking
          result = await this.executeMLTrainingWithProgress(step, execution);
        } else {
          result = await this.executeStep(step, execution);
        }
        
        execution.setStepResult(step.id, result);
        execution.nextStep();
        results.push({ stepId: step.id, result });
      }

      return {
        executionId: execution.id,
        success: true,
        startTime: execution.startTime,
        endTime: new Date().toISOString(),
        duration: Date.now() - startTime,
        data: { steps: results, modelMetrics: this.calculateModelMetrics(results) }
      };
    } catch (error) {
      return {
        executionId: execution.id,
        success: false,
        startTime: execution.startTime,
        endTime: new Date().toISOString(),
        duration: Date.now() - startTime,
        error: error.message,
        data: { steps: results }
      };
    }
  }

  private async executeMLTrainingWithProgress(step: WorkflowStep, execution: WorkflowExecution): Promise<any> {
    const epochs = step.metadata?.epochs || 100;
    const results = {
      modelId: `model_${Date.now()}`,
      epochs: epochs,
      history: [] as any[],
      finalAccuracy: 0,
      finalLoss: 0
    };

    for (let epoch = 1; epoch <= epochs; epoch++) {
      await this.simulateProcessing(50); // Simulate epoch training
      
      const accuracy = 0.5 + (epoch / epochs) * 0.45; // Simulate improving accuracy
      const loss = 1.0 - (epoch / epochs) * 0.9; // Simulate decreasing loss
      
      results.history.push({ epoch, accuracy, loss });
      
      if (epoch % 10 === 0) {
        // Update progress every 10 epochs
        console.log(`Training progress: Epoch ${epoch}/${epochs}, Accuracy: ${accuracy.toFixed(3)}, Loss: ${loss.toFixed(3)}`);
      }
    }

    results.finalAccuracy = results.history[results.history.length - 1].accuracy;
    results.finalLoss = results.history[results.history.length - 1].loss;

    return results;
  }

  private calculateModelMetrics(results: any[]): any {
    const trainingStep = results.find(r => r.stepId.includes('training'));
    if (trainingStep) {
      return {
        accuracy: trainingStep.result.finalAccuracy,
        loss: trainingStep.result.finalLoss,
        convergence: true,
        overfitting: false
      };
    }
    return {};
  }
}

export class AIInferenceStrategy extends ExecutionStrategy {
  async execute(execution: WorkflowExecution): Promise<WorkflowResult> {
    const startTime = Date.now();
    const results: any[] = [];

    try {
      for (const step of execution.workflow.steps) {
        let result;
        
        if (step.type === 'ai_inference') {
          result = await this.executeAIInferenceWithReasoning(step, execution);
        } else {
          result = await this.executeStep(step, execution);
        }
        
        execution.setStepResult(step.id, result);
        execution.nextStep();
        results.push({ stepId: step.id, result });
      }

      return {
        executionId: execution.id,
        success: true,
        startTime: execution.startTime,
        endTime: new Date().toISOString(),
        duration: Date.now() - startTime,
        data: { steps: results, reasoning: this.extractReasoning(results) }
      };
    } catch (error) {
      return {
        executionId: execution.id,
        success: false,
        startTime: execution.startTime,
        endTime: new Date().toISOString(),
        duration: Date.now() - startTime,
        error: error.message,
        data: { steps: results }
      };
    }
  }

  private async executeAIInferenceWithReasoning(step: WorkflowStep, execution: WorkflowExecution): Promise<any> {
    await this.simulateProcessing(3000);
    
    return {
      predictions: [
        { class: 'confidential', confidence: 0.92 },
        { class: 'public', confidence: 0.08 }
      ],
      reasoning: {
        factors: ['contains_pii', 'sensitive_keywords', 'document_classification'],
        explanation: 'Document contains personally identifiable information and sensitive keywords',
        confidence: 0.92
      },
      metadata: {
        processingTime: 2850,
        modelVersion: '2.1.0',
        features: 156
      }
    };
  }

  private extractReasoning(results: any[]): any {
    const inferenceStep = results.find(r => r.stepId.includes('inference'));
    if (inferenceStep && inferenceStep.result.reasoning) {
      return inferenceStep.result.reasoning;
    }
    return null;
  }
}

export class BulkOperationStrategy extends ExecutionStrategy {
  async execute(execution: WorkflowExecution): Promise<WorkflowResult> {
    const startTime = Date.now();
    const results: any[] = [];

    try {
      for (const step of execution.workflow.steps) {
        let result;
        
        if (step.type === 'bulk_operation') {
          result = await this.executeBulkOperationWithProgress(step, execution);
        } else {
          result = await this.executeStep(step, execution);
        }
        
        execution.setStepResult(step.id, result);
        execution.nextStep();
        results.push({ stepId: step.id, result });
      }

      return {
        executionId: execution.id,
        success: true,
        startTime: execution.startTime,
        endTime: new Date().toISOString(),
        duration: Date.now() - startTime,
        data: { steps: results, summary: this.calculateBulkSummary(results) }
      };
    } catch (error) {
      return {
        executionId: execution.id,
        success: false,
        startTime: execution.startTime,
        endTime: new Date().toISOString(),
        duration: Date.now() - startTime,
        error: error.message,
        data: { steps: results }
      };
    }
  }

  private async executeBulkOperationWithProgress(step: WorkflowStep, execution: WorkflowExecution): Promise<any> {
    const totalItems = step.metadata?.itemCount || 10000;
    const batchSize = step.metadata?.batchSize || 100;
    const batches = Math.ceil(totalItems / batchSize);
    
    const results = {
      totalItems,
      processedItems: 0,
      successfulItems: 0,
      failedItems: 0,
      batches: [] as any[]
    };

    for (let i = 0; i < batches; i++) {
      if (execution.isCancelled()) break;
      
      await this.simulateProcessing(100);
      
      const batchItems = Math.min(batchSize, totalItems - (i * batchSize));
      const successful = Math.floor(batchItems * 0.95); // 95% success rate
      const failed = batchItems - successful;
      
      results.processedItems += batchItems;
      results.successfulItems += successful;
      results.failedItems += failed;
      
      results.batches.push({
        batchNumber: i + 1,
        items: batchItems,
        successful,
        failed,
        timestamp: new Date().toISOString()
      });
      
      if ((i + 1) % 10 === 0) {
        console.log(`Bulk operation progress: ${results.processedItems}/${totalItems} items processed`);
      }
    }

    return results;
  }

  private calculateBulkSummary(results: any[]): any {
    const bulkStep = results.find(r => r.stepId.includes('bulk'));
    if (bulkStep) {
      const data = bulkStep.result;
      return {
        totalProcessed: data.processedItems,
        successRate: data.processedItems > 0 ? data.successfulItems / data.processedItems : 0,
        errorRate: data.processedItems > 0 ? data.failedItems / data.processedItems : 0,
        throughput: data.batches.length > 0 ? data.processedItems / data.batches.length : 0
      };
    }
    return {};
  }
}

export class AuditAnalysisStrategy extends ExecutionStrategy {
  async execute(execution: WorkflowExecution): Promise<WorkflowResult> {
    // Implementation similar to other strategies but focused on audit analysis
    return await this.executeGenericWorkflow(execution);
  }

  private async executeGenericWorkflow(execution: WorkflowExecution): Promise<WorkflowResult> {
    const startTime = Date.now();
    const results: any[] = [];

    try {
      for (const step of execution.workflow.steps) {
        const result = await this.executeStep(step, execution);
        execution.setStepResult(step.id, result);
        execution.nextStep();
        results.push({ stepId: step.id, result });
      }

      return {
        executionId: execution.id,
        success: true,
        startTime: execution.startTime,
        endTime: new Date().toISOString(),
        duration: Date.now() - startTime,
        data: { steps: results }
      };
    } catch (error) {
      return {
        executionId: execution.id,
        success: false,
        startTime: execution.startTime,
        endTime: new Date().toISOString(),
        duration: Date.now() - startTime,
        error: error.message,
        data: { steps: results }
      };
    }
  }
}

export class ComplianceCheckStrategy extends ExecutionStrategy {
  async execute(execution: WorkflowExecution): Promise<WorkflowResult> {
    return await this.executeGenericWorkflow(execution);
  }

  private async executeGenericWorkflow(execution: WorkflowExecution): Promise<WorkflowResult> {
    const startTime = Date.now();
    const results: any[] = [];

    try {
      for (const step of execution.workflow.steps) {
        const result = await this.executeStep(step, execution);
        execution.setStepResult(step.id, result);
        execution.nextStep();
        results.push({ stepId: step.id, result });
      }

      return {
        executionId: execution.id,
        success: true,
        startTime: execution.startTime,
        endTime: new Date().toISOString(),
        duration: Date.now() - startTime,
        data: { steps: results }
      };
    } catch (error) {
      return {
        executionId: execution.id,
        success: false,
        startTime: execution.startTime,
        endTime: new Date().toISOString(),
        duration: Date.now() - startTime,
        error: error.message,
        data: { steps: results }
      };
    }
  }
}

export class CrossVersionStrategy extends ExecutionStrategy {
  async execute(execution: WorkflowExecution): Promise<WorkflowResult> {
    return await this.executeGenericWorkflow(execution);
  }

  private async executeGenericWorkflow(execution: WorkflowExecution): Promise<WorkflowResult> {
    const startTime = Date.now();
    const results: any[] = [];

    try {
      for (const step of execution.workflow.steps) {
        const result = await this.executeStep(step, execution);
        execution.setStepResult(step.id, result);
        execution.nextStep();
        results.push({ stepId: step.id, result });
      }

      return {
        executionId: execution.id,
        success: true,
        startTime: execution.startTime,
        endTime: new Date().toISOString(),
        duration: Date.now() - startTime,
        data: { steps: results }
      };
    } catch (error) {
      return {
        executionId: execution.id,
        success: false,
        startTime: execution.startTime,
        endTime: new Date().toISOString(),
        duration: Date.now() - startTime,
        error: error.message,
        data: { steps: results }
      };
    }
  }
}

export class HybridWorkflowStrategy extends ExecutionStrategy {
  async execute(execution: WorkflowExecution): Promise<WorkflowResult> {
    return await this.executeGenericWorkflow(execution);
  }

  private async executeGenericWorkflow(execution: WorkflowExecution): Promise<WorkflowResult> {
    const startTime = Date.now();
    const results: any[] = [];

    try {
      for (const step of execution.workflow.steps) {
        const result = await this.executeStep(step, execution);
        execution.setStepResult(step.id, result);
        execution.nextStep();
        results.push({ stepId: step.id, result });
      }

      return {
        executionId: execution.id,
        success: true,
        startTime: execution.startTime,
        endTime: new Date().toISOString(),
        duration: Date.now() - startTime,
        data: { steps: results }
      };
    } catch (error) {
      return {
        executionId: execution.id,
        success: false,
        startTime: execution.startTime,
        endTime: new Date().toISOString(),
        duration: Date.now() - startTime,
        error: error.message,
        data: { steps: results }
      };
    }
  }
}

// Interfaces
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface WorkflowResult {
  executionId: string;
  success: boolean;
  startTime: string;
  endTime: string;
  duration: number;
  data?: any;
  error?: string;
}

export interface ExecutionStatus {
  id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  currentStep: WorkflowStep | null;
  startTime?: string;
  endTime?: string;
  duration?: number;
  result?: any;
  queuePosition?: number;
  estimatedCompletion?: string;
}

export interface WorkflowEngineStats {
  totalExecutions: number;
  runningExecutions: number;
  queuedExecutions: number;
  completedExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  throughput: number;
}

// Export singleton instance
export const workflowEngine = WorkflowEngine.getInstance();