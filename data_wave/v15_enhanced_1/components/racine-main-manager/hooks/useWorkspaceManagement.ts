/**
 * useWorkspaceManagement Hook
 * ===========================
 *
 * React hook for managing workspace state, operations, and real-time updates.
 * Maps to the workspace management API service and provides reactive state
 * management for workspace functionality.
 *
 * Features:
 * - Reactive workspace state management
 * - Real-time workspace updates via WebSockets
 * - Resource linking and dependency tracking
 * - Member management and permissions
 * - Template and analytics integration
 * - Optimistic updates and error handling
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  workspaceManagementAPI,
  WorkspaceEventType,
  type WorkspaceEvent,
  type WorkspaceEventHandler,
} from "../services/workspace-management-apis";
import {
  RacineWorkspace,
  WorkspaceTemplate,
  WorkspaceMember,
  SharedResource,
  WorkspaceAnalytics,
  ResourceDependency,
  UUID,
} from "../types/racine-core.types";
import {
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  WorkspaceResponse,
  WorkspaceListResponse,
  PaginationRequest,
  FilterRequest,
  SortRequest,
} from "../types/api.types";

/**
 * Workspace state interface
 */
interface WorkspaceState {
  workspaces: RacineWorkspace[];
  currentWorkspace: RacineWorkspace | null;
  templates: WorkspaceTemplate[];
  members: WorkspaceMember[];
  resources: SharedResource[];
  dependencies: ResourceDependency[];
  analytics: WorkspaceAnalytics | null;
  loading: {
    workspaces: boolean;
    currentWorkspace: boolean;
    members: boolean;
    resources: boolean;
    analytics: boolean;
  };
  errors: {
    workspaces: string | null;
    currentWorkspace: string | null;
    members: string | null;
    resources: string | null;
    analytics: string | null;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Initial state
 */
const initialState: WorkspaceState = {
  workspaces: [],
  currentWorkspace: null,
  templates: [],
  members: [],
  resources: [],
  dependencies: [],
  analytics: null,
  loading: {
    workspaces: false,
    currentWorkspace: false,
    members: false,
    resources: false,
    analytics: false,
  },
  errors: {
    workspaces: null,
    currentWorkspace: null,
    members: null,
    resources: null,
    analytics: null,
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasNext: false,
    hasPrev: false,
  },
};

/**
 * Hook options interface
 */
interface UseWorkspaceManagementOptions {
  autoLoadWorkspaces?: boolean;
  enableRealTimeUpdates?: boolean;
  defaultPagination?: Partial<PaginationRequest>;
  onWorkspaceChange?: (workspace: RacineWorkspace | null) => void;
  onError?: (error: string, operation: string) => void;
}

/**
 * useWorkspaceManagement hook
 */
export function useWorkspaceManagement(
  options: UseWorkspaceManagementOptions = {}
) {
  const {
    autoLoadWorkspaces = true,
    enableRealTimeUpdates = true,
    defaultPagination = { page: 1, limit: 20 },
    onWorkspaceChange,
    onError,
  } = options;

  const [state, setState] = useState<WorkspaceState>(initialState);
  const eventSubscriptions = useRef<UUID[]>([]);
  const isInitialized = useRef(false);

  // =============================================================================
  // STATE MANAGEMENT HELPERS
  // =============================================================================

  const updateState = useCallback(
    (
      updater:
        | Partial<WorkspaceState>
        | ((prev: WorkspaceState) => WorkspaceState)
    ) => {
      setState((prev) =>
        typeof updater === "function" ? updater(prev) : { ...prev, ...updater }
      );
    },
    []
  );

  const setLoading = useCallback(
    (key: keyof WorkspaceState["loading"], value: boolean) => {
      updateState((prev) => ({
        ...prev,
        loading: { ...prev.loading, [key]: value },
      }));
    },
    [updateState]
  );

  const setError = useCallback(
    (key: keyof WorkspaceState["errors"], error: string | null) => {
      updateState((prev) => ({
        ...prev,
        errors: { ...prev.errors, [key]: error },
      }));

      if (error && onError) {
        onError(error, key);
      }
    },
    [updateState, onError]
  );

  // =============================================================================
  // WORKSPACE CRUD OPERATIONS
  // =============================================================================

  const createWorkspace = useCallback(
    async (
      request: CreateWorkspaceRequest
    ): Promise<RacineWorkspace | null> => {
      setLoading("workspaces", true);
      setError("workspaces", null);

      try {
        const response = await workspaceManagementAPI.createWorkspace(request);
        const newWorkspace = response.workspace;

        // Optimistic update
        updateState((prev) => ({
          ...prev,
          workspaces: [newWorkspace, ...prev.workspaces],
        }));

        return newWorkspace;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to create workspace";
        setError("workspaces", message);
        return null;
      } finally {
        setLoading("workspaces", false);
      }
    },
    [setLoading, setError, updateState]
  );

  const loadWorkspace = useCallback(
    async (workspaceId: UUID): Promise<RacineWorkspace | null> => {
      setLoading("currentWorkspace", true);
      setError("currentWorkspace", null);

      try {
        const response = await workspaceManagementAPI.getWorkspace(workspaceId);
        const workspace = response.workspace;

        updateState((prev) => ({
          ...prev,
          currentWorkspace: workspace,
        }));

        if (onWorkspaceChange) {
          onWorkspaceChange(workspace);
        }

        return workspace;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load workspace";
        setError("currentWorkspace", message);
        return null;
      } finally {
        setLoading("currentWorkspace", false);
      }
    },
    [setLoading, setError, updateState, onWorkspaceChange]
  );

  const loadWorkspaces = useCallback(
    async (
      pagination?: PaginationRequest,
      filters?: FilterRequest,
      sort?: SortRequest
    ): Promise<void> => {
      setLoading("workspaces", true);
      setError("workspaces", null);

      try {
        const response = await workspaceManagementAPI.listWorkspaces(
          pagination || defaultPagination,
          filters,
          sort
        );

        updateState((prev) => ({
          ...prev,
          workspaces: response.workspaces,
          pagination: {
            page: response.pagination?.page || 1,
            limit: response.pagination?.limit || 20,
            total: response.pagination?.total || 0,
            hasNext: response.pagination?.hasNext || false,
            hasPrev: response.pagination?.hasPrev || false,
          },
        }));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load workspaces";
        setError("workspaces", message);
      } finally {
        setLoading("workspaces", false);
      }
    },
    [setLoading, setError, updateState, defaultPagination]
  );

  const updateWorkspace = useCallback(
    async (
      workspaceId: UUID,
      request: UpdateWorkspaceRequest
    ): Promise<RacineWorkspace | null> => {
      setLoading("currentWorkspace", true);
      setError("currentWorkspace", null);

      try {
        const response = await workspaceManagementAPI.updateWorkspace(
          workspaceId,
          request
        );
        const updatedWorkspace = response.workspace;

        // Update in both current workspace and workspaces list
        updateState((prev) => ({
          ...prev,
          currentWorkspace:
            prev.currentWorkspace?.id === workspaceId
              ? updatedWorkspace
              : prev.currentWorkspace,
          workspaces: prev.workspaces.map((w) =>
            w.id === workspaceId ? updatedWorkspace : w
          ),
        }));

        return updatedWorkspace;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to update workspace";
        setError("currentWorkspace", message);
        return null;
      } finally {
        setLoading("currentWorkspace", false);
      }
    },
    [setLoading, setError, updateState]
  );

  const deleteWorkspace = useCallback(
    async (workspaceId: UUID): Promise<boolean> => {
      setLoading("workspaces", true);
      setError("workspaces", null);

      try {
        await workspaceManagementAPI.deleteWorkspace(workspaceId);

        // Remove from state
        updateState((prev) => ({
          ...prev,
          workspaces: prev.workspaces.filter((w) => w.id !== workspaceId),
          currentWorkspace:
            prev.currentWorkspace?.id === workspaceId
              ? null
              : prev.currentWorkspace,
        }));

        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete workspace";
        setError("workspaces", message);
        return false;
      } finally {
        setLoading("workspaces", false);
      }
    },
    [setLoading, setError, updateState]
  );

  // =============================================================================
  // RESOURCE MANAGEMENT
  // =============================================================================

  const loadWorkspaceResources = useCallback(
    async (workspaceId: UUID): Promise<void> => {
      setLoading("resources", true);
      setError("resources", null);

      try {
        const resources = await workspaceManagementAPI.getWorkspaceResources(
          workspaceId
        );
        updateState((prev) => ({ ...prev, resources }));
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load workspace resources";
        setError("resources", message);
      } finally {
        setLoading("resources", false);
      }
    },
    [setLoading, setError, updateState]
  );

  const linkResource = useCallback(
    async (
      workspaceId: UUID,
      resourceType: string,
      resourceId: UUID,
      metadata?: Record<string, any>
    ): Promise<boolean> => {
      try {
        await workspaceManagementAPI.linkResource(workspaceId, {
          resourceType,
          resourceId,
          metadata,
        });

        // Reload resources to get updated list
        await loadWorkspaceResources(workspaceId);
        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to link resource";
        setError("resources", message);
        return false;
      }
    },
    [loadWorkspaceResources, setError]
  );

  const unlinkResource = useCallback(
    async (workspaceId: UUID, resourceId: UUID): Promise<boolean> => {
      try {
        await workspaceManagementAPI.unlinkResource(workspaceId, resourceId);

        // Remove from local state
        updateState((prev) => ({
          ...prev,
          resources: prev.resources.filter((r) => r.id !== resourceId),
        }));

        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to unlink resource";
        setError("resources", message);
        return false;
      }
    },
    [updateState, setError]
  );

  // =============================================================================
  // MEMBER MANAGEMENT
  // =============================================================================

  const loadWorkspaceMembers = useCallback(
    async (workspaceId: UUID): Promise<void> => {
      setLoading("members", true);
      setError("members", null);

      try {
        const members = await workspaceManagementAPI.getWorkspaceMembers(
          workspaceId
        );
        updateState((prev) => ({ ...prev, members }));
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load workspace members";
        setError("members", message);
      } finally {
        setLoading("members", false);
      }
    },
    [setLoading, setError, updateState]
  );

  const addMember = useCallback(
    async (
      workspaceId: UUID,
      userId: UUID,
      role: string,
      permissions: string[]
    ): Promise<boolean> => {
      try {
        await workspaceManagementAPI.addMember(workspaceId, {
          userId,
          role,
          permissions,
        });

        // Reload members to get updated list
        await loadWorkspaceMembers(workspaceId);
        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to add member";
        setError("members", message);
        return false;
      }
    },
    [loadWorkspaceMembers, setError]
  );

  const removeMember = useCallback(
    async (workspaceId: UUID, memberId: UUID): Promise<boolean> => {
      try {
        await workspaceManagementAPI.removeMember(workspaceId, memberId);

        // Remove from local state
        updateState((prev) => ({
          ...prev,
          members: prev.members.filter((m) => m.id !== memberId),
        }));

        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to remove member";
        setError("members", message);
        return false;
      }
    },
    [updateState, setError]
  );

  // =============================================================================
  // TEMPLATES AND ANALYTICS
  // =============================================================================

  const loadTemplates = useCallback(async (): Promise<void> => {
    try {
      const templates = await workspaceManagementAPI.getTemplates();
      updateState((prev) => ({ ...prev, templates }));
    } catch (error) {
      console.error("Failed to load workspace templates:", error);
    }
  }, [updateState]);

  const createFromTemplate = useCallback(
    async (
      templateId: UUID,
      name: string,
      customizations?: Record<string, any>
    ): Promise<RacineWorkspace | null> => {
      setLoading("workspaces", true);

      try {
        const response = await workspaceManagementAPI.createFromTemplate({
          templateId,
          name,
          customizations,
        });

        // Add to workspaces list
        updateState((prev) => ({
          ...prev,
          workspaces: [response.workspace, ...prev.workspaces],
        }));

        return response.workspace;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to create workspace from template";
        setError("workspaces", message);
        return null;
      } finally {
        setLoading("workspaces", false);
      }
    },
    [setLoading, setError, updateState]
  );

  const loadAnalytics = useCallback(
    async (workspaceId: UUID): Promise<void> => {
      setLoading("analytics", true);
      setError("analytics", null);

      try {
        const analytics = await workspaceManagementAPI.getWorkspaceAnalytics(
          workspaceId
        );
        updateState((prev) => ({ ...prev, analytics }));
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load workspace analytics";
        setError("analytics", message);
      } finally {
        setLoading("analytics", false);
      }
    },
    [setLoading, setError, updateState]
  );

  // =============================================================================
  // REAL-TIME EVENT HANDLING
  // =============================================================================

  const handleWorkspaceEvent: WorkspaceEventHandler = useCallback(
    (event: WorkspaceEvent) => {
      switch (event.type) {
        case WorkspaceEventType.WORKSPACE_CREATED:
          if (event.data.workspace) {
            updateState((prev) => ({
              ...prev,
              workspaces: [event.data.workspace, ...prev.workspaces],
            }));
          }
          break;

        case WorkspaceEventType.WORKSPACE_UPDATED:
          if (event.data.workspace) {
            updateState((prev) => ({
              ...prev,
              workspaces: prev.workspaces.map((w) =>
                w.id === event.workspaceId ? event.data.workspace : w
              ),
              currentWorkspace:
                prev.currentWorkspace?.id === event.workspaceId
                  ? event.data.workspace
                  : prev.currentWorkspace,
            }));
          }
          break;

        case WorkspaceEventType.WORKSPACE_DELETED:
          updateState((prev) => ({
            ...prev,
            workspaces: prev.workspaces.filter(
              (w) => w.id !== event.workspaceId
            ),
            currentWorkspace:
              prev.currentWorkspace?.id === event.workspaceId
                ? null
                : prev.currentWorkspace,
          }));
          break;

        case WorkspaceEventType.RESOURCE_LINKED:
          if (event.data.resource) {
            updateState((prev) => ({
              ...prev,
              resources: [...prev.resources, event.data.resource],
            }));
          }
          break;

        case WorkspaceEventType.RESOURCE_UNLINKED:
          updateState((prev) => ({
            ...prev,
            resources: prev.resources.filter(
              (r) => r.id !== event.data.resourceId
            ),
          }));
          break;

        case WorkspaceEventType.MEMBER_ADDED:
          if (event.data.member) {
            updateState((prev) => ({
              ...prev,
              members: [...prev.members, event.data.member],
            }));
          }
          break;

        case WorkspaceEventType.MEMBER_REMOVED:
          updateState((prev) => ({
            ...prev,
            members: prev.members.filter((m) => m.id !== event.data.memberId),
          }));
          break;
      }
    },
    [updateState]
  );

  // =============================================================================
  // INITIALIZATION AND CLEANUP
  // =============================================================================

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;

      // Initialize real-time updates
      if (enableRealTimeUpdates) {
        workspaceManagementAPI.initializeRealTimeUpdates();

        // Subscribe to all workspace events
        const subscriptionId = workspaceManagementAPI.subscribeToEvents(
          WorkspaceEventType.WORKSPACE_CREATED,
          handleWorkspaceEvent
        );
        eventSubscriptions.current.push(subscriptionId);

        // Subscribe to other event types
        Object.values(WorkspaceEventType).forEach((eventType) => {
          if (eventType !== WorkspaceEventType.WORKSPACE_CREATED) {
            const id = workspaceManagementAPI.subscribeToEvents(
              eventType,
              handleWorkspaceEvent
            );
            eventSubscriptions.current.push(id);
          }
        });
      }

      // Auto-load workspaces if enabled
      if (autoLoadWorkspaces) {
        loadWorkspaces();
      }

      // Load templates
      loadTemplates();
    }

    return () => {
      // Cleanup subscriptions
      eventSubscriptions.current.forEach((id) => {
        workspaceManagementAPI.unsubscribeFromEvents(id);
      });
      eventSubscriptions.current = [];
    };
  }, [
    enableRealTimeUpdates,
    autoLoadWorkspaces,
    handleWorkspaceEvent,
    loadWorkspaces,
    loadTemplates,
  ]);

  // =============================================================================
  // RETURN HOOK INTERFACE
  // =============================================================================

  return {
    // State
    ...state,

    // Loading states
    isLoading: Object.values(state.loading).some(Boolean),

    // Actions
    createWorkspace,
    loadWorkspace,
    loadWorkspaces,
    updateWorkspace,
    deleteWorkspace,

    // Resource management
    loadWorkspaceResources,
    linkResource,
    unlinkResource,

    // Member management
    loadWorkspaceMembers,
    addMember,
    removeMember,

    // Templates and analytics
    loadTemplates,
    createFromTemplate,
    loadAnalytics,

    // Utility functions
    clearErrors: useCallback(() => {
      updateState((prev) => ({
        ...prev,
        errors: {
          workspaces: null,
          currentWorkspace: null,
          members: null,
          resources: null,
          analytics: null,
        },
      }));
    }, [updateState]),

    refresh: useCallback(() => {
      loadWorkspaces();
      loadTemplates();
    }, [loadWorkspaces, loadTemplates]),
  };
}
