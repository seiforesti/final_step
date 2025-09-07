// ============================================================================
// PHASE 1 CORE INFRASTRUCTURE - UNIFIED EXPORTS AND INITIALIZATION
// ============================================================================

// Core system exports
export * from "./workflow-engine";
export * from "./event-bus";
export * from "./component-registry";
export * from "./state-manager";

// Individual component imports for initialization
import { workflowEngine, WorkflowEngine } from "./workflow-engine";
import { eventBus, EventBus } from "./event-bus";
import { componentRegistry, ComponentRegistry } from "./component-registry";
import { stateManager, StateManager } from "./state-manager";

// Enterprise API integration
import {
  // Collaboration APIs
  useCollaborationWorkspacesQuery,
  useActiveCollaborationSessionsQuery,
  useCreateCollaborationWorkspaceMutation,
  useCreateSharedDocumentMutation,
  useAddDocumentCommentMutation,
  useInviteToWorkspaceMutation,

  // Workflow APIs
  useWorkflowDefinitionsQuery,
  useWorkflowExecutionsQuery,
  usePendingApprovalsQuery,
  useCreateWorkflowDefinitionMutation,
  useExecuteWorkflowMutation,
  useApproveRequestMutation,
  useRejectRequestMutation,
  useCreateBulkOperationMutation,

  // Performance APIs
  useSystemHealthQuery,
  useEnhancedPerformanceMetricsQuery,
  usePerformanceAlertsQuery,
  useAcknowledgePerformanceAlertMutation,
  useResolvePerformanceAlertMutation,
  useStartRealTimeMonitoringMutation,
  useStopRealTimeMonitoringMutation,

  // Security APIs
  useEnhancedSecurityAuditQuery,
  useVulnerabilityAssessmentsQuery,
  useSecurityIncidentsQuery,
  useCreateEnhancedSecurityScanMutation,
  useRemediateVulnerabilityMutation,
  useCreateSecurityIncidentMutation,
  useStartSecurityMonitoringMutation,
} from "../services/enterprise-apis";

// ============================================================================
// CORE INFRASTRUCTURE ORCHESTRATOR
// ============================================================================

export interface CoreInfrastructureConfig {
  workflowEngine?: {
    enabled: boolean;
    maxConcurrentWorkflows?: number;
    defaultTimeout?: number;
  };
  eventBus?: {
    enabled: boolean;
    maxListeners?: number;
    enablePersistence?: boolean;
  };
  componentRegistry?: {
    enabled: boolean;
    autoDiscovery?: boolean;
    healthCheckInterval?: number;
  };
  stateManager?: {
    enabled: boolean;
    enableTimeTravel?: boolean;
    maxHistoryLength?: number;
  };
  integration?: {
    crossSystemEvents: boolean;
    sharedState: boolean;
    workflowComponentBinding: boolean;
  };
}

export class CoreInfrastructure {
  private static instance: CoreInfrastructure;
  private initialized: boolean = false;
  private config: CoreInfrastructureConfig;

  // Core system references
  public readonly workflowEngine: WorkflowEngine;
  public readonly eventBus: EventBus;
  public readonly componentRegistry: ComponentRegistry;
  public readonly stateManager: StateManager;

  private constructor(config: CoreInfrastructureConfig = {}) {
    this.config = {
      workflowEngine: {
        enabled: true,
        maxConcurrentWorkflows: 100,
        defaultTimeout: 300000,
        ...config.workflowEngine,
      },
      eventBus: {
        enabled: true,
        maxListeners: 1000,
        enablePersistence: false,
        ...config.eventBus,
      },
      componentRegistry: {
        enabled: true,
        autoDiscovery: true,
        healthCheckInterval: 30000,
        ...config.componentRegistry,
      },
      stateManager: {
        enabled: true,
        enableTimeTravel: true,
        maxHistoryLength: 100,
        ...config.stateManager,
      },
      integration: {
        crossSystemEvents: true,
        sharedState: true,
        workflowComponentBinding: true,
        ...config.integration,
      },
    };

    // Use singleton instances
    this.workflowEngine = workflowEngine;
    this.eventBus = eventBus;
    this.componentRegistry = componentRegistry;
    this.stateManager = stateManager;
  }

  public static getInstance(
    config?: CoreInfrastructureConfig
  ): CoreInfrastructure {
    if (!CoreInfrastructure.instance) {
      CoreInfrastructure.instance = new CoreInfrastructure(config);
    }
    return CoreInfrastructure.instance;
  }

  // ========================================================================
  // INITIALIZATION AND LIFECYCLE
  // ========================================================================

  public async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn("Core infrastructure already initialized");
      return;
    }

    console.log("🚀 Initializing Phase 1 Core Infrastructure...");

    try {
      // Step 1: Initialize Event Bus
      if (this.config.eventBus?.enabled) {
        await this.initializeEventBus();
      }

      // Step 2: Initialize State Manager
      if (this.config.stateManager?.enabled) {
        await this.initializeStateManager();
      }

      // Step 3: Initialize Component Registry
      if (this.config.componentRegistry?.enabled) {
        await this.initializeComponentRegistry();
      }

      // Step 4: Initialize Workflow Engine
      if (this.config.workflowEngine?.enabled) {
        await this.initializeWorkflowEngine();
      }

      // Step 5: Setup Integration Bindings
      if (this.config.integration) {
        await this.setupIntegrations();
      }

      // Step 6: Register Core Event Handlers
      await this.registerCoreEventHandlers();

      // Step 7: Setup Health Monitoring
      await this.setupHealthMonitoring();

      this.initialized = true;
      console.log("✅ Core Infrastructure initialized successfully");

      // Emit initialization complete event
      await this.eventBus.publish({
        type: "core:infrastructure:initialized",
        source: "core-infrastructure",
        payload: {
          timestamp: new Date(),
          systems: this.getSystemStatus(),
        },
        priority: 1, // High priority
        metadata: {
          tags: ["core", "infrastructure", "initialization"],
          namespace: "core",
          version: "1.0",
          headers: {},
        },
      });
    } catch (error) {
      console.error("❌ Failed to initialize core infrastructure:", error);
      throw error;
    }
  }

  public async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    console.log("🛑 Shutting down Core Infrastructure...");

    try {
      // Emit shutdown event
      await this.eventBus.publish({
        type: "core:infrastructure:shutdown",
        source: "core-infrastructure",
        payload: { timestamp: new Date() },
        priority: 1,
        metadata: {
          tags: ["core", "infrastructure", "shutdown"],
          namespace: "core",
          version: "1.0",
          headers: {},
        },
      });

      // Cleanup in reverse order
      // Note: Individual systems handle their own cleanup

      this.initialized = false;
      console.log("✅ Core Infrastructure shutdown complete");
    } catch (error) {
      console.error("❌ Error during shutdown:", error);
      throw error;
    }
  }

  // ========================================================================
  // INDIVIDUAL SYSTEM INITIALIZATION
  // ========================================================================

  private async initializeEventBus(): Promise<void> {
    console.log("📡 Initializing Event Bus...");

    // Event bus is self-initializing, but we can configure it
    if (this.config.eventBus?.maxListeners) {
      const maybeSetMax = (this.eventBus as unknown as { setMaxListeners?: (n: number) => void }).setMaxListeners
      if (typeof maybeSetMax === 'function') {
        try { maybeSetMax.call(this.eventBus, this.config.eventBus.maxListeners) } catch {}
      }
    }

    // Add core middleware
    this.eventBus.addMiddleware({
      name: "core-logging",
      priority: 1000,
      before: async (event) => {
        console.debug(`📡 Event: ${event.type} from ${event.source}`);
        return event;
      },
      error: async (event, error) => {
        console.error(`📡 Event Error: ${event.type} - ${error.message}`);
      },
    });

    console.log("✅ Event Bus initialized");
  }

  private async initializeStateManager(): Promise<void> {
    console.log("🗃️ Initializing State Manager...");

    // State manager is self-initializing, but we can define core states
    await this.defineCoreStates();

    console.log("✅ State Manager initialized");
  }

  private async initializeComponentRegistry(): Promise<void> {
    console.log("🧩 Initializing Component Registry...");

    // Component registry is self-initializing
    // We can register core components here if needed

    console.log("✅ Component Registry initialized");
  }

  private async initializeWorkflowEngine(): Promise<void> {
    console.log("⚙️ Initializing Workflow Engine...");

    // Workflow engine is self-initializing
    // We can register core workflows here if needed
    await this.registerCoreWorkflows();

    console.log("✅ Workflow Engine initialized");
  }

  // ========================================================================
  // INTEGRATION SETUP
  // ========================================================================

  private async setupIntegrations(): Promise<void> {
    console.log("🔗 Setting up system integrations...");

    if (this.config.integration?.crossSystemEvents) {
      await this.setupCrossSystemEvents();
    }

    if (this.config.integration?.sharedState) {
      await this.setupSharedState();
    }

    if (this.config.integration?.workflowComponentBinding) {
      await this.setupWorkflowComponentBinding();
    }

    console.log("✅ System integrations configured");
  }

  private async setupCrossSystemEvents(): Promise<void> {
    // Workflow -> Component events
    this.eventBus.subscribe("workflow:*", async (event) => {
      if (event.metadata.componentId) {
        const instance = this.componentRegistry.getInstance(
          event.metadata.componentId
        );
        if (instance) {
          instance.lastActive = new Date();
        }
      }
    });

    // Component -> State events
    this.eventBus.subscribe("component:*", async (event) => {
      if (
        event.type === "component:instance:created" &&
        event.payload?.instanceId
      ) {
        // Create corresponding state for component
        const componentInstance = this.componentRegistry.getInstance(
          event.payload.instanceId
        );
        if (componentInstance) {
          await this.stateManager.createState(
            "component-state",
            `component:${componentInstance.id}`,
            {
              status: componentInstance.status,
              health: componentInstance.health,
              lastActive: componentInstance.lastActive,
            },
            { componentId: componentInstance.id }
          );
        }
      }
    });

    // State -> Workflow events
    this.eventBus.subscribe("state:updated", async (event) => {
      if (event.payload?.instanceId && event.metadata.workflowId) {
        // Notify workflow of state changes
        await this.eventBus.publish({
          type: "workflow:state:updated",
          source: "core-integration",
          payload: {
            workflowId: event.metadata.workflowId,
            stateId: event.payload.instanceId,
            newValue: event.payload.newValue,
          },
          priority: 2,
          metadata: {
            tags: ["integration", "workflow", "state"],
            namespace: "core",
            version: "1.0",
            headers: {},
          },
        });
      }
    });
  }

  private async setupSharedState(): Promise<void> {
    // Define shared application state
    await this.stateManager.defineState({
      id: "app-global-state",
      name: "Application Global State",
      namespace: "app",
      initialValue: {
        activeWorkflows: [],
        activeComponents: [],
        systemMetrics: {
          eventsProcessed: 0,
          workflowsExecuted: 0,
          componentsActive: 0,
          statesManaged: 0,
        },
        userSession: null,
      },
      validators: [],
      middleware: [],
      persistence: {
        enabled: false,
        strategy: "none" as any,
        adapter: "",
        options: {} as any,
      },
      reactivity: {
        enabled: true,
        debounceMs: 100,
        batchUpdates: true,
        deepWatching: true,
      },
      security: {
        encryption: false,
        accessControl: false,
        auditLog: true,
        permissions: ["read", "write"],
      },
      metadata: {
        tags: ["global", "shared"],
        description: "Global application state for cross-system coordination",
        author: "core-infrastructure",
      },
    });

    // Create the global state instance
    const globalStateId = await this.stateManager.createState(
      "app-global-state",
      "global"
    );

    // Setup global state subscribers
    await this.stateManager.subscribe(
      globalStateId,
      (state: any) => state.systemMetrics,
      (newMetrics, oldMetrics) => {
        console.debug("📊 System metrics updated:", newMetrics);
      }
    );
  }

  private async setupWorkflowComponentBinding(): Promise<void> {
    // Auto-attach components to workflows when they're created
    this.eventBus.subscribe("component:instance:created", async (event) => {
      const componentId = event.payload?.instanceId;
      const workflowId = event.payload?.instance?.context?.workflowId;

      if (componentId && workflowId) {
        try {
          await this.componentRegistry.attachToWorkflow(
            componentId,
            workflowId
          );
          console.debug(
            `🔗 Component ${componentId} attached to workflow ${workflowId}`
          );
        } catch (error) {
          console.error("Failed to attach component to workflow:", error);
        }
      }
    });

    // Auto-create component instances for workflow steps
    this.eventBus.subscribe("workflow:step:executing", async (event) => {
      const step = event.payload?.step;
      if (step?.type === "component" && step.component) {
        try {
          const componentId = await this.componentRegistry.createInstance(
            step.component,
            step.parameters,
            { workflowId: event.payload?.workflowId }
          );
          console.debug(
            `🧩 Component ${componentId} created for workflow step`
          );
        } catch (error) {
          console.error("Failed to create component for workflow:", error);
        }
      }
    });
  }

  // ========================================================================
  // CORE REGISTRATIONS
  // ========================================================================

  private async defineCoreStates(): Promise<void> {
    // Define system health state
    await this.stateManager.defineState({
      id: "system-health",
      name: "System Health State",
      namespace: "system",
      initialValue: {
        overall: "healthy",
        components: {},
        workflows: {},
        events: { processed: 0, failed: 0 },
        lastCheck: new Date(),
      },
      validators: [
        {
          name: "health-validator",
          validate: (value) => ({
            valid:
              value.overall &&
              ["healthy", "warning", "critical"].includes(value.overall),
            errors: [],
            warnings: [],
          }),
        },
      ],
      middleware: [],
      persistence: {
        enabled: false,
        strategy: "none" as any,
        adapter: "",
        options: {} as any,
      },
      reactivity: {
        enabled: true,
        debounceMs: 1000,
        batchUpdates: true,
        deepWatching: true,
      },
      security: {
        encryption: false,
        accessControl: true,
        auditLog: true,
        permissions: ["read"],
      },
      metadata: {
        tags: ["system", "health", "monitoring"],
        description: "System-wide health monitoring state",
        author: "core-infrastructure",
      },
    });
  }

  private async registerCoreWorkflows(): Promise<void> {
    // Register system health check workflow
    await this.workflowEngine.registerWorkflow({
      id: "system-health-check",
      name: "System Health Check",
      description: "Periodic system health monitoring workflow",
      version: "1.0",
      category: "monitoring" as any,
      steps: [
        {
          id: "check-event-bus",
          name: "Check Event Bus Health",
          type: "api_call" as any,
          apiEndpoint: "/proxy/health/event-bus",
          parameters: {},
          dependencies: [],
          retryPolicy: { maxAttempts: 3, delayMs: 1000, backoffMultiplier: 2 },
          timeout: 5000,
          errorHandling: "continue" as any,
          outputs: [],
          parallel: true,
        },
        {
          id: "check-components",
          name: "Check Component Registry Health",
          type: "api_call" as any,
          apiEndpoint: "/proxy/health/components",
          parameters: {},
          dependencies: [],
          retryPolicy: { maxAttempts: 3, delayMs: 1000, backoffMultiplier: 2 },
          timeout: 5000,
          errorHandling: "continue" as any,
          outputs: [],
          parallel: true,
        },
        {
          id: "update-health-state",
          name: "Update System Health State",
          type: "api_call" as any,
          apiEndpoint: "/proxy/health/update",
          parameters: {},
          dependencies: ["check-event-bus", "check-components"],
          retryPolicy: { maxAttempts: 1, delayMs: 0, backoffMultiplier: 1 },
          timeout: 2000,
          errorHandling: "fail_fast" as any,
          outputs: [],
        },
      ],
      triggers: [
        {
          id: "health-check-schedule",
          type: "scheduled" as any,
          source: "scheduler",
          condition: "*/5 * * * *", // Every 5 minutes
          parameters: { enabled: true },
          enabled: true,
        },
      ],
      conditions: [],
      metadata: {
        author: "core-infrastructure",
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ["system", "health", "monitoring"],
        documentation: "Monitors overall system health",
        changelog: [],
        approvals: [],
      },
      timeout: 30000,
      retryPolicy: {
        maxAttempts: 3,
        delayMs: 5000,
        backoffMultiplier: 2,
        maxDelayMs: 30000,
      },
      dependencies: [],
      permissions: {
        execute: ["system"],
        modify: ["admin"],
        view: ["all"],
        approve: ["admin"],
      },
    });
  }

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  private async registerCoreEventHandlers(): Promise<void> {
    // Global error handler
    this.eventBus.subscribe("*:error", async (event) => {
      console.error("🚨 System Error:", event.payload);

      // Update system health if critical
      if (event.payload?.severity === "critical") {
        // This would update the system health state
      }
    });

    // Lifecycle event logging
    this.eventBus.subscribe("*:*:created", async (event) => {
      console.info(
        `🎉 Created: ${event.type} - ${event.payload?.id || "unknown"}`
      );
    });

    this.eventBus.subscribe("*:*:destroyed", async (event) => {
      console.info(
        `🗑️ Destroyed: ${event.type} - ${event.payload?.id || "unknown"}`
      );
    });

    // Performance monitoring
    this.eventBus.subscribe("workflow:completed", async (event) => {
      const duration = event.payload?.duration;
      if (duration) {
        console.debug(
          `⚡ Workflow completed in ${duration}ms: ${event.payload?.workflowId}`
        );
      }
    });
  }

  // ========================================================================
  // HEALTH MONITORING
  // ========================================================================

  private async setupHealthMonitoring(): Promise<void> {
    // Start periodic health checks
    setInterval(async () => {
      try {
        const health = await this.getSystemHealth();

        // Publish health update
        await this.eventBus.publish({
          type: "system:health:update",
          source: "core-infrastructure",
          payload: health,
          priority: 1,
          metadata: {
            tags: ["system", "health"],
            namespace: "core",
            version: "1.0",
            headers: {},
          },
        });
      } catch (error) {
        console.error("Health check failed:", error);
      }
    }, this.config.componentRegistry?.healthCheckInterval || 30000);
  }

  // ========================================================================
  // PUBLIC API
  // ========================================================================

  public isInitialized(): boolean {
    return this.initialized;
  }

  public getConfig(): CoreInfrastructureConfig {
    return { ...this.config };
  }

  public getSystemStatus(): CoreSystemStatus {
    return {
      eventBus: {
        enabled: this.config.eventBus?.enabled || false,
        subscriptions: this.eventBus.getAllSubscriptions().length,
        metrics: this.eventBus.getMetrics(),
      },
      stateManager: {
        enabled: this.config.stateManager?.enabled || false,
        definitions: this.stateManager.getAllDefinitions().length,
        instances: this.stateManager.getAllInstances().length,
        transactions: this.stateManager.getActiveTransactions().length,
      },
      componentRegistry: {
        enabled: this.config.componentRegistry?.enabled || false,
        definitions: this.componentRegistry.getAllComponents().length,
        instances: this.componentRegistry.getAllInstances().length,
      },
      workflowEngine: {
        enabled: this.config.workflowEngine?.enabled || false,
        activeExecutions: this.workflowEngine.getActiveExecutions().length,
      },
    };
  }

  public async getSystemHealth(): Promise<SystemHealth> {
    const status = this.getSystemStatus();

    return {
      overall: SystemStatus.HEALTHY, // This would be calculated based on component health
      lastCheck: new Date().toISOString(),
      groups: {},
      services: {
        eventBus: {
          serviceId: "eventBus",
          serviceName: "Event Bus",
          status: status.eventBus.enabled
            ? SystemStatus.HEALTHY
            : SystemStatus.FAILED,
          responseTime: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          uptime: 0,
          lastCheck: new Date().toISOString(),
        },
        stateManager: {
          serviceId: "stateManager",
          serviceName: "State Manager",
          status: status.stateManager.enabled
            ? SystemStatus.HEALTHY
            : SystemStatus.FAILED,
          responseTime: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          uptime: 0,
          lastCheck: new Date().toISOString(),
        },
        componentRegistry: {
          serviceId: "componentRegistry",
          serviceName: "Component Registry",
          status: status.componentRegistry.enabled
            ? SystemStatus.HEALTHY
            : SystemStatus.FAILED,
          responseTime: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          uptime: 0,
          lastCheck: new Date().toISOString(),
        },
        workflowEngine: {
          serviceId: "workflowEngine",
          serviceName: "Workflow Engine",
          status: status.workflowEngine.enabled
            ? SystemStatus.HEALTHY
            : SystemStatus.FAILED,
          responseTime: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          uptime: 0,
          lastCheck: new Date().toISOString(),
        },
      },
      integrations: {},
      performance: {
        averageResponseTime: 0,
        throughput: status.eventBus.metrics?.eventsPublished || 0,
        errorRate: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        diskUsage: 0,
        networkLatency: 0,
      },
      uptime: Date.now() - (this.initialized ? Date.now() : 0),
      version: "1.0.0",
    };
  }

  // Convenience methods for accessing systems
  public getWorkflowEngine(): WorkflowEngine {
    return this.workflowEngine;
  }
  public getEventBus(): EventBus {
    return this.eventBus;
  }
  public getComponentRegistry(): ComponentRegistry {
    return this.componentRegistry;
  }
  public getStateManager(): StateManager {
    return this.stateManager;
  }

  // ============================================================================
  // ENTERPRISE API INTEGRATION BRIDGE
  // ============================================================================

  /**
   * Creates a bridge between the three-phase architecture and enterprise APIs
   * This connects all core systems to real backend data and operations
   */
  public createEnterpriseAPIBridge(hookProvider: any) {
    return {
      // Collaboration integration
      collaboration: {
        workspaces: hookProvider.useCollaborationWorkspacesQuery,
        activeSessions: hookProvider.useActiveCollaborationSessionsQuery,
        createWorkspace: hookProvider.useCreateCollaborationWorkspaceMutation,
        createDocument: hookProvider.useCreateSharedDocumentMutation,
        addComment: hookProvider.useAddDocumentCommentMutation,
        inviteUser: hookProvider.useInviteToWorkspaceMutation,
      },

      // Workflow integration
      workflows: {
        definitions: hookProvider.useWorkflowDefinitionsQuery,
        executions: hookProvider.useWorkflowExecutionsQuery,
        pendingApprovals: hookProvider.usePendingApprovalsQuery,
        createWorkflow: hookProvider.useCreateWorkflowDefinitionMutation,
        executeWorkflow: hookProvider.useExecuteWorkflowMutation,
        approveRequest: hookProvider.useApproveRequestMutation,
        rejectRequest: hookProvider.useRejectRequestMutation,
        createBulkOperation: hookProvider.useCreateBulkOperationMutation,
      },

      // Performance integration
      performance: {
        systemHealth: hookProvider.useSystemHealthQuery,
        enhancedMetrics: hookProvider.useEnhancedPerformanceMetricsQuery,
        alerts: hookProvider.usePerformanceAlertsQuery,
        acknowledgeAlert: hookProvider.useAcknowledgePerformanceAlertMutation,
        resolveAlert: hookProvider.useResolvePerformanceAlertMutation,
        startMonitoring: hookProvider.useStartRealTimeMonitoringMutation,
        stopMonitoring: hookProvider.useStopRealTimeMonitoringMutation,
      },

      // Security integration
      security: {
        audit: hookProvider.useEnhancedSecurityAuditQuery,
        vulnerabilities: hookProvider.useVulnerabilityAssessmentsQuery,
        incidents: hookProvider.useSecurityIncidentsQuery,
        createScan: hookProvider.useCreateEnhancedSecurityScanMutation,
        remediateVulnerability: hookProvider.useRemediateVulnerabilityMutation,
        createIncident: hookProvider.useCreateSecurityIncidentMutation,
        startMonitoring: hookProvider.useStartSecurityMonitoringMutation,
      },
    };
  }

  /**
   * Connects three-phase events to enterprise API actions
   * This enables automatic backend synchronization
   */
  public enableEnterpriseSync(apiActions: any) {
    // Sync workflow events to backend
    this.eventBus.subscribe("workflow:created", async (event) => {
      try {
        await apiActions.workflows.createWorkflow.mutateAsync(event.payload);
      } catch (error) {
        console.error("Failed to sync workflow creation:", error);
      }
    });

    this.eventBus.subscribe("workflow:executed", async (event) => {
      try {
        await apiActions.workflows.executeWorkflow.mutateAsync({
          workflowId: event.payload.workflowId,
          executionData: event.payload.data,
        });
      } catch (error) {
        console.error("Failed to sync workflow execution:", error);
      }
    });

    // Sync collaboration events to backend
    this.eventBus.subscribe(
      "collaboration:workspace:created",
      async (event) => {
        try {
          await apiActions.collaboration.createWorkspace.mutateAsync(
            event.payload
          );
        } catch (error) {
          console.error("Failed to sync workspace creation:", error);
        }
      }
    );

    this.eventBus.subscribe("collaboration:document:created", async (event) => {
      try {
        await apiActions.collaboration.createDocument.mutateAsync({
          workspaceId: event.payload.workspaceId,
          documentData: event.payload.data,
        });
      } catch (error) {
        console.error("Failed to sync document creation:", error);
      }
    });

    // Sync performance events to backend
    this.eventBus.subscribe("performance:alert:triggered", async (event) => {
      try {
        await apiActions.performance.acknowledgeAlert.mutateAsync({
          alertId: event.payload.alertId,
          acknowledgmentData: { auto_acknowledged: true },
        });
      } catch (error) {
        console.error("Failed to sync alert acknowledgment:", error);
      }
    });

    // Sync security events to backend
    this.eventBus.subscribe(
      "security:vulnerability:detected",
      async (event) => {
        try {
          await apiActions.security.createScan.mutateAsync({
            data_source_ids: [event.payload.dataSourceId],
            scan_types: ["vulnerability"],
          });
        } catch (error) {
          console.error("Failed to sync vulnerability scan:", error);
        }
      }
    );

    this.eventBus.subscribe("security:incident:created", async (event) => {
      try {
        await apiActions.security.createIncident.mutateAsync(event.payload);
      } catch (error) {
        console.error("Failed to sync incident creation:", error);
      }
    });
  }
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

export interface CoreSystemStatus {
  eventBus: {
    enabled: boolean;
    subscriptions: number;
    metrics: any;
  };
  stateManager: {
    enabled: boolean;
    definitions: number;
    instances: number;
    transactions: number;
  };
  componentRegistry: {
    enabled: boolean;
    definitions: number;
    instances: number;
  };
  workflowEngine: {
    enabled: boolean;
    activeExecutions: number;
  };
}

import type { SystemHealth } from "../../racine-main-manager/types/racine-core.types";
import { SystemStatus } from "../../racine-main-manager/types/racine-core.types";

// ============================================================================
// SINGLETON EXPORT AND INITIALIZATION HELPERS
// ============================================================================

// Create singleton instance
let coreInfrastructure: CoreInfrastructure | null = null;

export function getCoreInfrastructure(
  config?: CoreInfrastructureConfig
): CoreInfrastructure {
  coreInfrastructure ??= CoreInfrastructure.getInstance(config);
  return coreInfrastructure;
}

export async function initializeCoreInfrastructure(
  config?: CoreInfrastructureConfig
): Promise<CoreInfrastructure> {
  const core = getCoreInfrastructure(config);
  await core.initialize();
  return core;
}

export async function shutdownCoreInfrastructure(): Promise<void> {
  if (coreInfrastructure?.isInitialized()) {
    await coreInfrastructure?.shutdown();
  }
}

// Re-export singleton instances for direct use
export { workflowEngine, eventBus, componentRegistry, stateManager };

// Default export
export default CoreInfrastructure;
