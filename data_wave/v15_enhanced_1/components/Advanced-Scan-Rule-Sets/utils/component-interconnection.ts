/**
 * Component Interconnection Utility
 * 
 * Ensures seamless communication and data flow between all components
 * in the Advanced Scan Rule Sets group. Provides a centralized event
 * system, shared state management, and component orchestration.
 * 
 * Features:
 * - Cross-component event broadcasting
 * - Shared state synchronization
 * - Component lifecycle coordination
 * - Data flow orchestration
 * - Real-time updates propagation
 * - RBAC-aware component communication
 * 
 * @version 2.0.0
 * @enterprise-grade
 */

import React from 'react';
import { EventEmitter } from 'events';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { filter, map, distinctUntilChanged } from 'rxjs/operators';

// Types for component interconnection
export interface ComponentEvent {
  type: string;
  source: string;
  target?: string;
  payload: any;
  timestamp: Date;
  userId?: string;
  rbacContext?: any;
}

export interface ComponentState {
  componentId: string;
  state: any;
  lastUpdated: Date;
  version: number;
  rbacContext?: any;
}

export interface ComponentConnection {
  sourceId: string;
  targetId: string;
  eventTypes: string[];
  bidirectional: boolean;
  rbacRequired: boolean;
}

export interface InterconnectionMetrics {
  totalComponents: number;
  activeConnections: number;
  eventsPerSecond: number;
  averageLatency: number;
  errorRate: number;
  componentHealth: Record<string, 'healthy' | 'degraded' | 'error'>;
}

/**
 * Central Component Interconnection Manager
 * Orchestrates communication between all Advanced Scan Rule Sets components
 */
export class ComponentInterconnectionManager {
  private eventEmitter: EventEmitter;
  private stateSubjects: Map<string, BehaviorSubject<any>>;
  private eventSubject: Subject<ComponentEvent>;
  private connections: Map<string, ComponentConnection[]>;
  private componentRegistry: Map<string, any>;
  private metrics: InterconnectionMetrics;
  private rbacManager: any;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.stateSubjects = new Map();
    this.eventSubject = new Subject<ComponentEvent>();
    this.connections = new Map();
    this.componentRegistry = new Map();
    this.metrics = {
      totalComponents: 0,
      activeConnections: 0,
      eventsPerSecond: 0,
      averageLatency: 0,
      errorRate: 0,
      componentHealth: {}
    };
    this.initializeConnections();
  }

  /**
   * Initialize predefined component connections
   */
  private initializeConnections(): void {
    // Define component interconnections
    const connections: ComponentConnection[] = [
      // Rule Designer <-> Pattern Library
      {
        sourceId: 'rule-designer',
        targetId: 'pattern-library',
        eventTypes: ['pattern-request', 'pattern-applied', 'pattern-feedback'],
        bidirectional: true,
        rbacRequired: true
      },
      // Rule Designer <-> AI Enhancement
      {
        sourceId: 'rule-designer',
        targetId: 'ai-enhancement',
        eventTypes: ['ai-suggestion-request', 'ai-pattern-applied', 'ai-feedback'],
        bidirectional: true,
        rbacRequired: true
      },
      // Orchestration <-> All Components
      {
        sourceId: 'orchestration-center',
        targetId: '*',
        eventTypes: ['workflow-start', 'workflow-stop', 'resource-allocation', 'execution-update'],
        bidirectional: true,
        rbacRequired: true
      },
      // Intelligence <-> All Analytics Components
      {
        sourceId: 'pattern-detector',
        targetId: 'reporting',
        eventTypes: ['pattern-detected', 'anomaly-found', 'insight-generated'],
        bidirectional: false,
        rbacRequired: true
      },
      // Collaboration <-> All Components
      {
        sourceId: 'collaboration-hub',
        targetId: '*',
        eventTypes: ['team-activity', 'review-request', 'approval-needed', 'knowledge-shared'],
        bidirectional: true,
        rbacRequired: true
      },
      // Reporting <-> All Data Components
      {
        sourceId: 'enterprise-reporting',
        targetId: '*',
        eventTypes: ['data-request', 'metrics-update', 'report-generated'],
        bidirectional: false,
        rbacRequired: true
      }
    ];

    connections.forEach(connection => {
      this.addConnection(connection);
    });
  }

  /**
   * Register a component with the interconnection manager
   */
  registerComponent(componentId: string, component: any, rbacContext?: any): void {
    this.componentRegistry.set(componentId, component);
    this.stateSubjects.set(componentId, new BehaviorSubject(component.state || {}));
    this.metrics.totalComponents++;
    this.metrics.componentHealth[componentId] = 'healthy';

    // Emit registration event
    this.emitEvent({
      type: 'component-registered',
      source: 'interconnection-manager',
      target: componentId,
      payload: { componentId, timestamp: new Date() },
      timestamp: new Date(),
      rbacContext
    });
  }

  /**
   * Unregister a component
   */
  unregisterComponent(componentId: string): void {
    this.componentRegistry.delete(componentId);
    this.stateSubjects.get(componentId)?.complete();
    this.stateSubjects.delete(componentId);
    this.metrics.totalComponents--;
    delete this.metrics.componentHealth[componentId];

    // Emit unregistration event
    this.emitEvent({
      type: 'component-unregistered',
      source: 'interconnection-manager',
      payload: { componentId, timestamp: new Date() },
      timestamp: new Date()
    });
  }

  /**
   * Add a connection between components
   */
  addConnection(connection: ComponentConnection): void {
    if (!this.connections.has(connection.sourceId)) {
      this.connections.set(connection.sourceId, []);
    }
    this.connections.get(connection.sourceId)!.push(connection);
    this.metrics.activeConnections++;
  }

  /**
   * Emit an event to connected components
   */
  emitEvent(event: ComponentEvent): void {
    // RBAC check if required
    if (event.rbacContext && !this.checkEventPermission(event)) {
      console.warn(`Event blocked by RBAC: ${event.type} from ${event.source}`);
      return;
    }

    // Emit to event emitter for immediate listeners
    this.eventEmitter.emit(event.type, event);

    // Emit to RxJS subject for reactive listeners
    this.eventSubject.next(event);

    // Route to specific targets based on connections
    this.routeEvent(event);

    // Update metrics
    this.updateMetrics(event);
  }

  /**
   * Subscribe to events from a specific component
   */
  subscribeToComponent(componentId: string, eventTypes: string[] = []): Observable<ComponentEvent> {
    return this.eventSubject.pipe(
      filter(event => 
        event.source === componentId && 
        (eventTypes.length === 0 || eventTypes.includes(event.type))
      )
    );
  }

  /**
   * Subscribe to state changes of a specific component
   */
  subscribeToComponentState(componentId: string): Observable<any> {
    const subject = this.stateSubjects.get(componentId);
    if (!subject) {
      throw new Error(`Component ${componentId} not registered`);
    }
    return subject.asObservable().pipe(distinctUntilChanged());
  }

  /**
   * Update component state and notify subscribers
   */
  updateComponentState(componentId: string, newState: any, rbacContext?: any): void {
    const subject = this.stateSubjects.get(componentId);
    if (!subject) {
      console.warn(`Component ${componentId} not registered for state updates`);
      return;
    }

    // RBAC check for state updates
    if (rbacContext && !this.checkStateUpdatePermission(componentId, rbacContext)) {
      console.warn(`State update blocked by RBAC for component: ${componentId}`);
      return;
    }

    subject.next(newState);

    // Emit state change event
    this.emitEvent({
      type: 'state-changed',
      source: componentId,
      payload: { componentId, newState, previousState: subject.value },
      timestamp: new Date(),
      rbacContext
    });
  }

  /**
   * Get current state of a component
   */
  getComponentState(componentId: string): any {
    const subject = this.stateSubjects.get(componentId);
    return subject?.value || null;
  }

  /**
   * Broadcast an event to all connected components
   */
  broadcast(event: Omit<ComponentEvent, 'timestamp'>): void {
    this.emitEvent({
      ...event,
      timestamp: new Date()
    });
  }

  /**
   * Request data from another component
   */
  async requestData(sourceId: string, targetId: string, dataType: string, params: any = {}, rbacContext?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Set up response listener
      const responseHandler = (event: ComponentEvent) => {
        if (event.payload.requestId === requestId) {
          this.eventEmitter.off('data-response', responseHandler);
          if (event.payload.error) {
            reject(new Error(event.payload.error));
          } else {
            resolve(event.payload.data);
          }
        }
      };

      this.eventEmitter.on('data-response', responseHandler);

      // Send data request
      this.emitEvent({
        type: 'data-request',
        source: sourceId,
        target: targetId,
        payload: { requestId, dataType, params },
        timestamp: new Date(),
        rbacContext
      });

      // Set timeout for request
      setTimeout(() => {
        this.eventEmitter.off('data-response', responseHandler);
        reject(new Error('Data request timeout'));
      }, 10000);
    });
  }

  /**
   * Coordinate workflow between multiple components
   */
  async coordinateWorkflow(workflowId: string, steps: Array<{
    componentId: string;
    action: string;
    params: any;
    waitForCompletion?: boolean;
  }>, rbacContext?: any): Promise<any[]> {
    const results: any[] = [];

    for (const step of steps) {
      try {
        // RBAC check for workflow step
        if (rbacContext && !this.checkWorkflowStepPermission(step, rbacContext)) {
          throw new Error(`Workflow step blocked by RBAC: ${step.action} on ${step.componentId}`);
        }

        // Execute workflow step
        const result = await this.executeWorkflowStep(workflowId, step, rbacContext);
        results.push(result);

        // Emit workflow step completion
        this.emitEvent({
          type: 'workflow-step-completed',
          source: 'interconnection-manager',
          target: step.componentId,
          payload: { workflowId, step, result },
          timestamp: new Date(),
          rbacContext
        });

      } catch (error) {
        // Emit workflow step error
        this.emitEvent({
          type: 'workflow-step-error',
          source: 'interconnection-manager',
          target: step.componentId,
          payload: { workflowId, step, error: (error as Error).message },
          timestamp: new Date(),
          rbacContext
        });

        throw error;
      }
    }

    return results;
  }

  /**
   * Get interconnection metrics
   */
  getMetrics(): InterconnectionMetrics {
    return { ...this.metrics };
  }

  /**
   * Get component health status
   */
  getComponentHealth(componentId?: string): Record<string, 'healthy' | 'degraded' | 'error'> | string {
    if (componentId) {
      return this.metrics.componentHealth[componentId] || 'error';
    }
    return { ...this.metrics.componentHealth };
  }

  /**
   * Set RBAC manager for permission checks
   */
  setRBACManager(rbacManager: any): void {
    this.rbacManager = rbacManager;
  }

  // Private helper methods
  private routeEvent(event: ComponentEvent): void {
    const connections = this.connections.get(event.source) || [];
    
    connections.forEach(connection => {
      if (connection.eventTypes.includes(event.type)) {
        if (connection.targetId === '*') {
          // Broadcast to all components except source
          this.componentRegistry.forEach((component, componentId) => {
            if (componentId !== event.source) {
              this.deliverEvent({ ...event, target: componentId }, componentId);
            }
          });
        } else if (event.target === connection.targetId || !event.target) {
          this.deliverEvent({ ...event, target: connection.targetId }, connection.targetId);
        }
      }
    });
  }

  private deliverEvent(event: ComponentEvent, targetId: string): void {
    const targetComponent = this.componentRegistry.get(targetId);
    if (targetComponent && typeof targetComponent.handleInterconnectionEvent === 'function') {
      try {
        targetComponent.handleInterconnectionEvent(event);
      } catch (error) {
        console.error(`Error delivering event to ${targetId}:`, error);
        this.metrics.componentHealth[targetId] = 'error';
      }
    }
  }

  private async executeWorkflowStep(workflowId: string, step: any, rbacContext?: any): Promise<any> {
    const targetComponent = this.componentRegistry.get(step.componentId);
    if (!targetComponent) {
      throw new Error(`Component ${step.componentId} not found`);
    }

    if (typeof targetComponent.executeWorkflowStep === 'function') {
      return await targetComponent.executeWorkflowStep(step.action, step.params, rbacContext);
    } else {
      throw new Error(`Component ${step.componentId} does not support workflow execution`);
    }
  }

  private checkEventPermission(event: ComponentEvent): boolean {
    if (!this.rbacManager || !event.rbacContext) {
      return true; // Allow if no RBAC manager or context
    }

    // Check if user has permission to emit this event type
    return this.rbacManager.checkEventPermission(
      event.rbacContext.userId,
      event.type,
      event.source,
      event.target
    );
  }

  private checkStateUpdatePermission(componentId: string, rbacContext: any): boolean {
    if (!this.rbacManager) {
      return true;
    }

    return this.rbacManager.checkStateUpdatePermission(
      rbacContext.userId,
      componentId
    );
  }

  private checkWorkflowStepPermission(step: any, rbacContext: any): boolean {
    if (!this.rbacManager) {
      return true;
    }

    return this.rbacManager.checkWorkflowStepPermission(
      rbacContext.userId,
      step.componentId,
      step.action
    );
  }

  private updateMetrics(event: ComponentEvent): void {
    // Update events per second (simplified)
    this.metrics.eventsPerSecond++;
    
    // Reset counter every second
    setTimeout(() => {
      this.metrics.eventsPerSecond = Math.max(0, this.metrics.eventsPerSecond - 1);
    }, 1000);
  }
}

/**
 * Global interconnection manager instance
 */
export const interconnectionManager = new ComponentInterconnectionManager();

/**
 * React hook for component interconnection
 */
export function useComponentInterconnection(componentId: string, rbacContext?: any) {
  const [isRegistered, setIsRegistered] = React.useState(false);
  const componentRef = React.useRef<any>(null);

  // Register component on mount
  React.useEffect(() => {
    if (componentRef.current) {
      interconnectionManager.registerComponent(componentId, componentRef.current, rbacContext);
      setIsRegistered(true);
    }

    return () => {
      interconnectionManager.unregisterComponent(componentId);
      setIsRegistered(false);
    };
  }, [componentId, rbacContext]);

  // Set RBAC manager
  React.useEffect(() => {
    if (rbacContext?.rbacManager) {
      interconnectionManager.setRBACManager(rbacContext.rbacManager);
    }
  }, [rbacContext]);

  const emitEvent = React.useCallback((type: string, payload: any, target?: string) => {
    interconnectionManager.emitEvent({
      type,
      source: componentId,
      target,
      payload,
      timestamp: new Date(),
      rbacContext
    });
  }, [componentId, rbacContext]);

  const subscribeToEvents = React.useCallback((eventTypes: string[] = []) => {
    return interconnectionManager.subscribeToComponent(componentId, eventTypes);
  }, [componentId]);

  const subscribeToState = React.useCallback((targetComponentId: string) => {
    return interconnectionManager.subscribeToComponentState(targetComponentId);
  }, []);

  const updateState = React.useCallback((newState: any) => {
    interconnectionManager.updateComponentState(componentId, newState, rbacContext);
  }, [componentId, rbacContext]);

  const requestData = React.useCallback(async (targetId: string, dataType: string, params: any = {}) => {
    return interconnectionManager.requestData(componentId, targetId, dataType, params, rbacContext);
  }, [componentId, rbacContext]);

  const coordinateWorkflow = React.useCallback(async (workflowId: string, steps: any[]) => {
    return interconnectionManager.coordinateWorkflow(workflowId, steps, rbacContext);
  }, [rbacContext]);

  const broadcast = React.useCallback((type: string, payload: any) => {
    interconnectionManager.broadcast({
      type,
      source: componentId,
      payload,
      rbacContext
    });
  }, [componentId, rbacContext]);

  return {
    isRegistered,
    componentRef,
    emitEvent,
    subscribeToEvents,
    subscribeToState,
    updateState,
    requestData,
    coordinateWorkflow,
    broadcast,
    metrics: interconnectionManager.getMetrics(),
    health: interconnectionManager.getComponentHealth()
  };
}

/**
 * Component interconnection decorator
 * Automatically adds interconnection capabilities to components
 */
export function withInterconnection<T extends object>(
  Component: React.ComponentType<T>,
  componentId: string
) {
  return React.forwardRef<any, T & { rbacContext?: any }>((props, ref) => {
    const { rbacContext, ...componentProps } = props;
    const interconnection = useComponentInterconnection(componentId, rbacContext);

    // Merge refs
    const mergedRef = React.useCallback((instance: any) => {
      interconnection.componentRef.current = instance;
      if (typeof ref === 'function') {
        ref(instance);
      } else if (ref) {
        ref.current = instance;
      }
    }, [ref, interconnection.componentRef]);

    return (
      <Component
        {...(componentProps as T)}
        ref={mergedRef}
        interconnection={interconnection}
      />
    );
  });
}

/**
 * Higher-order component for adding interconnection
 */
export function connectComponent<T extends object>(
  componentId: string,
  Component: React.ComponentType<T & { interconnection?: any }>
) {
  return withInterconnection(Component, componentId);
}

/**
 * Utility functions for component communication
 */
export const ComponentCommunication = {
  // Send data between components
  sendData: (fromId: string, toId: string, data: any, rbacContext?: any) => {
    interconnectionManager.emitEvent({
      type: 'data-transfer',
      source: fromId,
      target: toId,
      payload: { data },
      timestamp: new Date(),
      rbacContext
    });
  },

  // Request action from another component
  requestAction: (fromId: string, toId: string, action: string, params: any, rbacContext?: any) => {
    interconnectionManager.emitEvent({
      type: 'action-request',
      source: fromId,
      target: toId,
      payload: { action, params },
      timestamp: new Date(),
      rbacContext
    });
  },

  // Notify about status changes
  notifyStatusChange: (componentId: string, status: any, rbacContext?: any) => {
    interconnectionManager.broadcast({
      type: 'status-change',
      source: componentId,
      payload: { componentId, status },
      rbacContext
    });
  },

  // Synchronize data across components
  synchronizeData: (componentId: string, dataType: string, data: any, rbacContext?: any) => {
    interconnectionManager.broadcast({
      type: 'data-sync',
      source: componentId,
      payload: { dataType, data },
      rbacContext
    });
  }
};

/**
 * Component lifecycle events
 */
export const ComponentLifecycle = {
  // Component mounted
  mounted: (componentId: string, rbacContext?: any) => {
    interconnectionManager.emitEvent({
      type: 'component-mounted',
      source: componentId,
      payload: { componentId },
      timestamp: new Date(),
      rbacContext
    });
  },

  // Component updated
  updated: (componentId: string, changes: any, rbacContext?: any) => {
    interconnectionManager.emitEvent({
      type: 'component-updated',
      source: componentId,
      payload: { componentId, changes },
      timestamp: new Date(),
      rbacContext
    });
  },

  // Component unmounted
  unmounted: (componentId: string, rbacContext?: any) => {
    interconnectionManager.emitEvent({
      type: 'component-unmounted',
      source: componentId,
      payload: { componentId },
      timestamp: new Date(),
      rbacContext
    });
  }
};

export default interconnectionManager;