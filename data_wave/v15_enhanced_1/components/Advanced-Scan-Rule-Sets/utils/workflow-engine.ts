/**
 * Advanced Workflow Engine
 * Handles workflow execution, orchestration, state management, and complex workflow operations
 */

import { EventEmitter } from 'events';

// Types
export interface WorkflowNode {
  id: string;
  type: 'start' | 'action' | 'decision' | 'parallel' | 'merge' | 'end' | 'loop' | 'delay' | 'condition';
  name: string;
  description?: string;
  configuration: Record<string, any>;
  position: { x: number; y: number };
  metadata?: {
    timeout?: number;
    retries?: number;
    errorHandling?: 'stop' | 'continue' | 'retry' | 'fallback';
    fallbackNode?: string;
    tags?: string[];
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type: 'default' | 'conditional' | 'error' | 'timeout';
  condition?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'matches';
    value: any;
  };
  label?: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: Record<string, any>;
  settings: {
    timeout?: number;
    maxRetries?: number;
    errorHandling?: 'stop' | 'continue' | 'rollback';
    persistence?: boolean;
    logging?: boolean;
    notifications?: boolean;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    tags: string[];
    category: string;
  };
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
  startTime: Date;
  endTime?: Date;
  currentNode?: string;
  context: Record<string, any>;
  executionPath: ExecutionStep[];
  errors: WorkflowError[];
  metrics: ExecutionMetrics;
  triggeredBy: string;
  parentExecutionId?: string;
}

export interface ExecutionStep {
  nodeId: string;
  nodeName: string;
  startTime: Date;
  endTime?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: WorkflowError;
  duration?: number;
  retryCount?: number;
}

export interface WorkflowError {
  id: string;
  nodeId: string;
  type: 'execution' | 'timeout' | 'validation' | 'system' | 'user';
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  recoverable: boolean;
  retryable: boolean;
}

export interface ExecutionMetrics {
  totalDuration: number;
  nodeExecutions: number;
  successfulNodes: number;
  failedNodes: number;
  retries: number;
  memoryUsage: number;
  cpuUsage: number;
  throughput: number;
}

export interface WorkflowTrigger {
  id: string;
  type: 'manual' | 'schedule' | 'event' | 'webhook' | 'condition';
  configuration: Record<string, any>;
  enabled: boolean;
  workflowId: string;
}

export interface ScheduleTrigger extends WorkflowTrigger {
  type: 'schedule';
  configuration: {
    cron: string;
    timezone: string;
    startDate?: Date;
    endDate?: Date;
    maxExecutions?: number;
  };
}

export interface EventTrigger extends WorkflowTrigger {
  type: 'event';
  configuration: {
    eventType: string;
    filter?: Record<string, any>;
    debounce?: number;
    throttle?: number;
  };
}

export interface ConditionTrigger extends WorkflowTrigger {
  type: 'condition';
  configuration: {
    conditions: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
    checkInterval: number;
    consecutiveChecks?: number;
  };
}

// Node Executors
export interface NodeExecutor {
  execute(node: WorkflowNode, context: Record<string, any>): Promise<NodeExecutionResult>;
  validate(node: WorkflowNode): Promise<ValidationResult>;
  getSchema(): NodeSchema;
}

export interface NodeExecutionResult {
  success: boolean;
  output?: Record<string, any>;
  error?: WorkflowError;
  nextNodes?: string[];
  shouldStop?: boolean;
  variables?: Record<string, any>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface NodeSchema {
  type: string;
  properties: Record<string, {
    type: string;
    required: boolean;
    description: string;
    default?: any;
    enum?: any[];
  }>;
}

// Workflow Engine Implementation
export class WorkflowEngine extends EventEmitter {
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private triggers: Map<string, WorkflowTrigger> = new Map();
  private nodeExecutors: Map<string, NodeExecutor> = new Map();
  private scheduledJobs: Map<string, NodeJS.Timeout> = new Map();
  private isRunning: boolean = false;
  private maxConcurrentExecutions: number = 10;
  private currentExecutions: number = 0;

  constructor() {
    super();
    this.registerDefaultExecutors();
  }

  // Workflow Management
  async registerWorkflow(workflow: WorkflowDefinition): Promise<void> {
    const validationResult = await this.validateWorkflow(workflow);
    if (!validationResult.valid) {
      throw new Error(`Invalid workflow: ${validationResult.errors.join(', ')}`);
    }

    this.workflows.set(workflow.id, workflow);
    this.emit('workflowRegistered', workflow);
  }

  async unregisterWorkflow(workflowId: string): Promise<void> {
    // Cancel any running executions
    const runningExecutions = Array.from(this.executions.values())
      .filter(exec => exec.workflowId === workflowId && exec.status === 'running');
    
    for (const execution of runningExecutions) {
      await this.cancelExecution(execution.id);
    }

    // Remove triggers
    const workflowTriggers = Array.from(this.triggers.values())
      .filter(trigger => trigger.workflowId === workflowId);
    
    for (const trigger of workflowTriggers) {
      await this.removeTrigger(trigger.id);
    }

    this.workflows.delete(workflowId);
    this.emit('workflowUnregistered', workflowId);
  }

  async validateWorkflow(workflow: WorkflowDefinition): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for required nodes
    const startNodes = workflow.nodes.filter(n => n.type === 'start');
    const endNodes = workflow.nodes.filter(n => n.type === 'end');

    if (startNodes.length === 0) {
      errors.push('Workflow must have at least one start node');
    }
    if (startNodes.length > 1) {
      warnings.push('Multiple start nodes found, only first will be used');
    }
    if (endNodes.length === 0) {
      warnings.push('Workflow has no end nodes');
    }

    // Validate node connectivity
    const nodeIds = new Set(workflow.nodes.map(n => n.id));
    for (const edge of workflow.edges) {
      if (!nodeIds.has(edge.source)) {
        errors.push(`Edge references non-existent source node: ${edge.source}`);
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`Edge references non-existent target node: ${edge.target}`);
      }
    }

    // Check for unreachable nodes
    const reachableNodes = this.findReachableNodes(workflow);
    const unreachableNodes = workflow.nodes.filter(n => !reachableNodes.has(n.id));
    if (unreachableNodes.length > 0) {
      warnings.push(`Unreachable nodes found: ${unreachableNodes.map(n => n.name).join(', ')}`);
    }

    // Validate individual nodes
    for (const node of workflow.nodes) {
      const executor = this.nodeExecutors.get(node.type);
      if (!executor) {
        errors.push(`No executor found for node type: ${node.type}`);
        continue;
      }

      const nodeValidation = await executor.validate(node);
      if (!nodeValidation.valid) {
        errors.push(...nodeValidation.errors.map(e => `Node ${node.name}: ${e}`));
        warnings.push(...nodeValidation.warnings.map(w => `Node ${node.name}: ${w}`));
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  private findReachableNodes(workflow: WorkflowDefinition): Set<string> {
    const reachable = new Set<string>();
    const startNodes = workflow.nodes.filter(n => n.type === 'start');
    
    if (startNodes.length === 0) return reachable;

    const queue = [startNodes[0].id];
    const adjacencyList = new Map<string, string[]>();

    // Build adjacency list
    for (const edge of workflow.edges) {
      if (!adjacencyList.has(edge.source)) {
        adjacencyList.set(edge.source, []);
      }
      adjacencyList.get(edge.source)!.push(edge.target);
    }

    // BFS to find all reachable nodes
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (reachable.has(nodeId)) continue;
      
      reachable.add(nodeId);
      const neighbors = adjacencyList.get(nodeId) || [];
      queue.push(...neighbors);
    }

    return reachable;
  }

  // Execution Management
  async executeWorkflow(
    workflowId: string, 
    context: Record<string, any> = {}, 
    triggeredBy: string = 'manual'
  ): Promise<string> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    if (this.currentExecutions >= this.maxConcurrentExecutions) {
      throw new Error('Maximum concurrent executions reached');
    }

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      status: 'pending',
      startTime: new Date(),
      context: { ...workflow.variables, ...context },
      executionPath: [],
      errors: [],
      metrics: {
        totalDuration: 0,
        nodeExecutions: 0,
        successfulNodes: 0,
        failedNodes: 0,
        retries: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        throughput: 0
      },
      triggeredBy
    };

    this.executions.set(executionId, execution);
    this.currentExecutions++;

    // Start execution asynchronously
    this.runExecution(executionId).catch(error => {
      this.handleExecutionError(executionId, error);
    });

    return executionId;
  }

  private async runExecution(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) return;

    const workflow = this.workflows.get(execution.workflowId);
    if (!workflow) return;

    try {
      execution.status = 'running';
      this.emit('executionStarted', execution);

      const startNode = workflow.nodes.find(n => n.type === 'start');
      if (!startNode) {
        throw new Error('No start node found');
      }

      await this.executeNode(executionId, startNode.id);

      if (execution.status === 'running') {
        execution.status = 'completed';
        execution.endTime = new Date();
        execution.metrics.totalDuration = execution.endTime.getTime() - execution.startTime.getTime();
      }

    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.errors.push({
        id: `error_${Date.now()}`,
        nodeId: execution.currentNode || 'unknown',
        type: 'execution',
        code: 'EXECUTION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        recoverable: false,
        retryable: false
      });
    } finally {
      this.currentExecutions--;
      this.emit('executionCompleted', execution);
    }
  }

  private async executeNode(executionId: string, nodeId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    const workflow = this.workflows.get(execution!.workflowId);
    if (!execution || !workflow) return;

    const node = workflow.nodes.find(n => n.id === nodeId);
    if (!node) {
      throw new Error(`Node not found: ${nodeId}`);
    }

    execution.currentNode = nodeId;
    
    const step: ExecutionStep = {
      nodeId,
      nodeName: node.name,
      startTime: new Date(),
      status: 'running',
      input: { ...execution.context },
      retryCount: 0
    };

    execution.executionPath.push(step);
    execution.metrics.nodeExecutions++;

    try {
      const executor = this.nodeExecutors.get(node.type);
      if (!executor) {
        throw new Error(`No executor found for node type: ${node.type}`);
      }

      // Execute with retry logic
      let result: NodeExecutionResult | null = null;
      const maxRetries = node.metadata?.retries || workflow.settings.maxRetries || 0;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          step.retryCount = attempt;
          result = await this.executeWithTimeout(
            () => executor.execute(node, execution.context),
            node.metadata?.timeout || workflow.settings.timeout || 30000
          );
          break;
        } catch (error) {
          if (attempt === maxRetries) {
            throw error;
          }
          execution.metrics.retries++;
          await this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
        }
      }

      if (!result) {
        throw new Error('Node execution failed');
      }

      step.status = result.success ? 'completed' : 'failed';
      step.endTime = new Date();
      step.duration = step.endTime.getTime() - step.startTime.getTime();
      step.output = result.output;

      if (result.success) {
        execution.metrics.successfulNodes++;
        
        // Update context with output variables
        if (result.variables) {
          Object.assign(execution.context, result.variables);
        }
        if (result.output) {
          execution.context[`${nodeId}_output`] = result.output;
        }

        // Handle stop condition
        if (result.shouldStop || node.type === 'end') {
          return;
        }

        // Find next nodes
        const nextNodes = result.nextNodes || this.getNextNodes(workflow, nodeId, execution.context);
        
        // Execute next nodes based on type
        if (node.type === 'parallel') {
          // Execute all next nodes in parallel
          await Promise.all(nextNodes.map(nextNodeId => this.executeNode(executionId, nextNodeId)));
        } else {
          // Execute next nodes sequentially
          for (const nextNodeId of nextNodes) {
            await this.executeNode(executionId, nextNodeId);
          }
        }

      } else {
        execution.metrics.failedNodes++;
        step.error = result.error;
        
        if (result.error) {
          execution.errors.push(result.error);
        }

        // Handle error based on configuration
        const errorHandling = node.metadata?.errorHandling || workflow.settings.errorHandling || 'stop';
        
        switch (errorHandling) {
          case 'continue':
            // Continue to next nodes despite error
            const nextNodes = this.getNextNodes(workflow, nodeId, execution.context);
            for (const nextNodeId of nextNodes) {
              await this.executeNode(executionId, nextNodeId);
            }
            break;
            
          case 'fallback':
            if (node.metadata?.fallbackNode) {
              await this.executeNode(executionId, node.metadata.fallbackNode);
            }
            break;
            
          case 'stop':
          default:
            throw new Error(`Node execution failed: ${result.error?.message}`);
        }
      }

    } catch (error) {
      step.status = 'failed';
      step.endTime = new Date();
      step.duration = step.endTime.getTime() - step.startTime.getTime();
      step.error = {
        id: `error_${Date.now()}`,
        nodeId,
        type: 'execution',
        code: 'NODE_EXECUTION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        recoverable: false,
        retryable: true
      };
      
      execution.metrics.failedNodes++;
      throw error;
    }
  }

  private getNextNodes(workflow: WorkflowDefinition, nodeId: string, context: Record<string, any>): string[] {
    const edges = workflow.edges.filter(e => e.source === nodeId);
    const nextNodes: string[] = [];

    for (const edge of edges) {
      if (edge.type === 'conditional' && edge.condition) {
        if (this.evaluateCondition(edge.condition, context)) {
          nextNodes.push(edge.target);
        }
      } else if (edge.type === 'default') {
        nextNodes.push(edge.target);
      }
    }

    return nextNodes;
  }

  private evaluateCondition(condition: any, context: Record<string, any>): boolean {
    const fieldValue = this.getNestedValue(context, condition.field);
    const compareValue = condition.value;

    switch (condition.operator) {
      case 'equals':
        return fieldValue === compareValue;
      case 'not_equals':
        return fieldValue !== compareValue;
      case 'greater_than':
        return Number(fieldValue) > Number(compareValue);
      case 'less_than':
        return Number(fieldValue) < Number(compareValue);
      case 'contains':
        return String(fieldValue).includes(String(compareValue));
      case 'matches':
        return new RegExp(compareValue).test(String(fieldValue));
      default:
        return false;
    }
  }

  private getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private async executeWithTimeout<T>(fn: () => Promise<T>, timeout: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Execution timeout'));
      }, timeout);

      fn().then(
        result => {
          clearTimeout(timer);
          resolve(result);
        },
        error => {
          clearTimeout(timer);
          reject(error);
        }
      );
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async cancelExecution(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution || execution.status !== 'running') {
      return;
    }

    execution.status = 'cancelled';
    execution.endTime = new Date();
    this.currentExecutions--;
    this.emit('executionCancelled', execution);
  }

  async pauseExecution(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution || execution.status !== 'running') {
      return;
    }

    execution.status = 'paused';
    this.emit('executionPaused', execution);
  }

  async resumeExecution(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution || execution.status !== 'paused') {
      return;
    }

    execution.status = 'running';
    this.emit('executionResumed', execution);
    
    // Resume from current node
    if (execution.currentNode) {
      await this.executeNode(executionId, execution.currentNode);
    }
  }

  // Trigger Management
  async addTrigger(trigger: WorkflowTrigger): Promise<void> {
    this.triggers.set(trigger.id, trigger);
    
    if (trigger.enabled) {
      await this.activateTrigger(trigger);
    }
    
    this.emit('triggerAdded', trigger);
  }

  async removeTrigger(triggerId: string): Promise<void> {
    const trigger = this.triggers.get(triggerId);
    if (!trigger) return;

    await this.deactivateTrigger(trigger);
    this.triggers.delete(triggerId);
    this.emit('triggerRemoved', triggerId);
  }

  private async activateTrigger(trigger: WorkflowTrigger): Promise<void> {
    switch (trigger.type) {
      case 'schedule':
        await this.activateScheduleTrigger(trigger as ScheduleTrigger);
        break;
      case 'event':
        await this.activateEventTrigger(trigger as EventTrigger);
        break;
      case 'condition':
        await this.activateConditionTrigger(trigger as ConditionTrigger);
        break;
    }
  }

  private async deactivateTrigger(trigger: WorkflowTrigger): Promise<void> {
    const jobId = `trigger_${trigger.id}`;
    const job = this.scheduledJobs.get(jobId);
    if (job) {
      clearInterval(job);
      this.scheduledJobs.delete(jobId);
    }
  }

  private async activateScheduleTrigger(trigger: ScheduleTrigger): Promise<void> {
    // Implementation would use a proper cron scheduler like node-cron
    // For now, simplified implementation
    const interval = this.parseCronToInterval(trigger.configuration.cron);
    const jobId = `trigger_${trigger.id}`;
    
    const job = setInterval(async () => {
      try {
        await this.executeWorkflow(trigger.workflowId, {}, `schedule:${trigger.id}`);
      } catch (error) {
        this.emit('triggerError', { trigger, error });
      }
    }, interval);

    this.scheduledJobs.set(jobId, job);
  }

  private parseCronToInterval(cron: string): number {
    // Simplified cron parsing - in production use proper cron parser
    // For now, default to 1 hour intervals
    return 60 * 60 * 1000;
  }

  private async activateEventTrigger(trigger: EventTrigger): Promise<void> {
    // Event triggers would listen to system events
    this.on(trigger.configuration.eventType, async (eventData: any) => {
      if (this.matchesEventFilter(eventData, trigger.configuration.filter)) {
        await this.executeWorkflow(trigger.workflowId, eventData, `event:${trigger.id}`);
      }
    });
  }

  private matchesEventFilter(eventData: any, filter?: Record<string, any>): boolean {
    if (!filter) return true;
    
    for (const [key, value] of Object.entries(filter)) {
      if (eventData[key] !== value) {
        return false;
      }
    }
    return true;
  }

  private async activateConditionTrigger(trigger: ConditionTrigger): Promise<void> {
    const jobId = `trigger_${trigger.id}`;
    let consecutiveMatches = 0;
    
    const job = setInterval(async () => {
      try {
        // This would check external conditions in a real implementation
        const conditionMet = await this.checkConditions(trigger.configuration.conditions);
        
        if (conditionMet) {
          consecutiveMatches++;
          const requiredChecks = trigger.configuration.consecutiveChecks || 1;
          
          if (consecutiveMatches >= requiredChecks) {
            await this.executeWorkflow(trigger.workflowId, {}, `condition:${trigger.id}`);
            consecutiveMatches = 0; // Reset after triggering
          }
        } else {
          consecutiveMatches = 0;
        }
      } catch (error) {
        this.emit('triggerError', { trigger, error });
      }
    }, trigger.configuration.checkInterval);

    this.scheduledJobs.set(jobId, job);
  }

  private async checkConditions(conditions: Array<{ field: string; operator: string; value: any }>): Promise<boolean> {
    // This would check actual system conditions in a real implementation
    // For now, return false to avoid unnecessary triggers
    return false;
  }

  private handleExecutionError(executionId: string, error: any): void {
    const execution = this.executions.get(executionId);
    if (execution) {
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.errors.push({
        id: `error_${Date.now()}`,
        nodeId: execution.currentNode || 'unknown',
        type: 'system',
        code: 'EXECUTION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        recoverable: false,
        retryable: false
      });
      this.currentExecutions--;
      this.emit('executionFailed', execution);
    }
  }

  // Node Executor Registration
  registerNodeExecutor(type: string, executor: NodeExecutor): void {
    this.nodeExecutors.set(type, executor);
  }

  private registerDefaultExecutors(): void {
    // Register basic node executors
    this.registerNodeExecutor('start', new StartNodeExecutor());
    this.registerNodeExecutor('end', new EndNodeExecutor());
    this.registerNodeExecutor('action', new ActionNodeExecutor());
    this.registerNodeExecutor('decision', new DecisionNodeExecutor());
    this.registerNodeExecutor('delay', new DelayNodeExecutor());
  }

  // Query Methods
  getWorkflow(workflowId: string): WorkflowDefinition | undefined {
    return this.workflows.get(workflowId);
  }

  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }

  getExecutionsByWorkflow(workflowId: string): WorkflowExecution[] {
    return Array.from(this.executions.values()).filter(e => e.workflowId === workflowId);
  }

  getRunningExecutions(): WorkflowExecution[] {
    return Array.from(this.executions.values()).filter(e => e.status === 'running');
  }

  getWorkflowMetrics(workflowId: string): WorkflowMetrics {
    const executions = this.getExecutionsByWorkflow(workflowId);
    const completed = executions.filter(e => e.status === 'completed');
    const failed = executions.filter(e => e.status === 'failed');
    
    return {
      totalExecutions: executions.length,
      successfulExecutions: completed.length,
      failedExecutions: failed.length,
      averageDuration: completed.reduce((sum, e) => sum + e.metrics.totalDuration, 0) / completed.length || 0,
      successRate: executions.length > 0 ? (completed.length / executions.length) * 100 : 0,
      lastExecution: executions.length > 0 ? Math.max(...executions.map(e => e.startTime.getTime())) : null
    };
  }

  // Lifecycle
  start(): void {
    this.isRunning = true;
    this.emit('engineStarted');
  }

  stop(): void {
    this.isRunning = false;
    
    // Cancel all running executions
    const runningExecutions = this.getRunningExecutions();
    runningExecutions.forEach(exec => this.cancelExecution(exec.id));
    
    // Clear all scheduled jobs
    this.scheduledJobs.forEach(job => clearInterval(job));
    this.scheduledJobs.clear();
    
    this.emit('engineStopped');
  }

  cleanup(): void {
    this.stop();
    this.workflows.clear();
    this.executions.clear();
    this.triggers.clear();
    this.nodeExecutors.clear();
    this.removeAllListeners();
  }
}

// Default Node Executors
class StartNodeExecutor implements NodeExecutor {
  async execute(node: WorkflowNode, context: Record<string, any>): Promise<NodeExecutionResult> {
    return {
      success: true,
      output: { message: 'Workflow started' }
    };
  }

  async validate(node: WorkflowNode): Promise<ValidationResult> {
    return { valid: true, errors: [], warnings: [] };
  }

  getSchema(): NodeSchema {
    return {
      type: 'start',
      properties: {}
    };
  }
}

class EndNodeExecutor implements NodeExecutor {
  async execute(node: WorkflowNode, context: Record<string, any>): Promise<NodeExecutionResult> {
    return {
      success: true,
      output: { message: 'Workflow completed' },
      shouldStop: true
    };
  }

  async validate(node: WorkflowNode): Promise<ValidationResult> {
    return { valid: true, errors: [], warnings: [] };
  }

  getSchema(): NodeSchema {
    return {
      type: 'end',
      properties: {}
    };
  }
}

class ActionNodeExecutor implements NodeExecutor {
  async execute(node: WorkflowNode, context: Record<string, any>): Promise<NodeExecutionResult> {
    const action = node.configuration.action;
    const parameters = node.configuration.parameters || {};
    
    // Simulate action execution
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      success: true,
      output: {
        action,
        parameters,
        result: 'Action completed successfully'
      }
    };
  }

  async validate(node: WorkflowNode): Promise<ValidationResult> {
    const errors: string[] = [];
    
    if (!node.configuration.action) {
      errors.push('Action is required');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  getSchema(): NodeSchema {
    return {
      type: 'action',
      properties: {
        action: { type: 'string', required: true, description: 'Action to execute' },
        parameters: { type: 'object', required: false, description: 'Action parameters' }
      }
    };
  }
}

class DecisionNodeExecutor implements NodeExecutor {
  async execute(node: WorkflowNode, context: Record<string, any>): Promise<NodeExecutionResult> {
    const condition = node.configuration.condition;
    const result = this.evaluateCondition(condition, context);
    
    return {
      success: true,
      output: { decision: result },
      nextNodes: result ? node.configuration.trueNodes : node.configuration.falseNodes
    };
  }

  private evaluateCondition(condition: any, context: Record<string, any>): boolean {
    // Simple condition evaluation
    const fieldValue = context[condition.field];
    const compareValue = condition.value;
    
    switch (condition.operator) {
      case 'equals': return fieldValue === compareValue;
      case 'greater_than': return Number(fieldValue) > Number(compareValue);
      case 'less_than': return Number(fieldValue) < Number(compareValue);
      default: return false;
    }
  }

  async validate(node: WorkflowNode): Promise<ValidationResult> {
    const errors: string[] = [];
    
    if (!node.configuration.condition) {
      errors.push('Condition is required');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  getSchema(): NodeSchema {
    return {
      type: 'decision',
      properties: {
        condition: { type: 'object', required: true, description: 'Decision condition' },
        trueNodes: { type: 'array', required: false, description: 'Nodes to execute if true' },
        falseNodes: { type: 'array', required: false, description: 'Nodes to execute if false' }
      }
    };
  }
}

class DelayNodeExecutor implements NodeExecutor {
  async execute(node: WorkflowNode, context: Record<string, any>): Promise<NodeExecutionResult> {
    const delay = node.configuration.delay || 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return {
      success: true,
      output: { delayed: delay }
    };
  }

  async validate(node: WorkflowNode): Promise<ValidationResult> {
    const warnings: string[] = [];
    
    if (node.configuration.delay > 60000) {
      warnings.push('Long delays may impact workflow performance');
    }
    
    return {
      valid: true,
      errors: [],
      warnings
    };
  }

  getSchema(): NodeSchema {
    return {
      type: 'delay',
      properties: {
        delay: { type: 'number', required: false, description: 'Delay in milliseconds', default: 1000 }
      }
    };
  }
}

// Additional Types
export interface WorkflowMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageDuration: number;
  successRate: number;
  lastExecution: number | null;
}

// Utility Functions
export function createWorkflowEngine(): WorkflowEngine {
  return new WorkflowEngine();
}

export function validateWorkflowDefinition(workflow: WorkflowDefinition): ValidationResult {
  const engine = new WorkflowEngine();
  return engine.validateWorkflow(workflow);
}

export function generateWorkflowId(): string {
  return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateExecutionId(): string {
  return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Export singleton instance
export const workflowEngine = createWorkflowEngine();