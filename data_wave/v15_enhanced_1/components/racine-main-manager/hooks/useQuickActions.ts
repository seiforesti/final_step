/**
 * ⚡ QUICK ACTIONS HOOK - ENTERPRISE QUICK ACTIONS SYSTEM
 * ======================================================
 * 
 * Advanced quick actions hook that provides intelligent contextual actions
 * across all SPAs and data governance groups. Features include:
 * - Context-aware action discovery
 * - Cross-SPA quick actions
 * - Personalized action favorites
 * - Performance-optimized action execution
 * - Advanced action categories and filtering
 * - Integration with all SPA quick actions
 * - Real-time action availability updates
 */

'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Backend API Integration
import { crossGroupIntegrationAPI } from '../services/cross-group-integration-apis';
import { racineOrchestrationAPI } from '../services/racine-orchestration-apis';
import { userManagementAPI } from '../services/user-management-apis';

// Type Definitions
import {
  QuickAction,
  ActionCategory,
  ActionContext,
  NavigationContext,
  UserPermissions,
  SPAType,
  ActionExecutionResult,
  ActionMetrics,
  UUID,
  ISODateString
} from '../types/racine-core.types';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export interface QuickActionsState {
  // Core Actions State
  availableActions: QuickAction[];
  contextualActions: QuickAction[];
  favoriteActions: QuickAction[];
  recentActions: QuickAction[];
  
  // Organization & Filtering
  actionCategories: ActionCategory[];
  filteredActions: QuickAction[];
  searchQuery: string;
  selectedCategory: string | null;
  
  // Performance & Analytics
  actionMetrics: ActionMetrics;
  executionHistory: ActionExecutionResult[];
  
  // Context Awareness
  currentContext: NavigationContext | null;
  contextualAvailability: Record<string, boolean>;
  
  // User Personalization
  userPreferences: {
    pinnedActions: string[];
    hiddenActions: string[];
    customCategories: ActionCategory[];
    actionOrder: string[];
  };
  
  // Loading & Error States
  isLoading: boolean;
  isExecuting: Record<string, boolean>;
  error: string | null;
  
  // Advanced Features
  smartSuggestionsEnabled: boolean;
  autoExecuteEnabled: boolean;
  bulkActionsEnabled: boolean;
}

export interface QuickActionsManager {
  // Primary Action Management
  executeAction: (actionId: string, context?: ActionContext, params?: Record<string, any>) => Promise<ActionExecutionResult>;
  executeBulkActions: (actionIds: string[], context?: ActionContext) => Promise<ActionExecutionResult[]>;
  cancelExecution: (executionId: string) => void;
  
  // Context-Aware Actions
  getContextualActions: (context: NavigationContext) => QuickAction[];
  refreshContextualActions: (context: NavigationContext) => Promise<void>;
  setCurrentContext: (context: NavigationContext) => void;
  
  // Action Organization
  getActionsByCategory: (category: string) => QuickAction[];
  searchActions: (query: string) => QuickAction[];
  filterActionsByPermissions: (permissions: UserPermissions) => QuickAction[];
  
  // Favorites & Personalization
  addToFavorites: (actionId: string) => Promise<void>;
  removeFromFavorites: (actionId: string) => Promise<void>;
  reorderFavorites: (actionIds: string[]) => Promise<void>;
  
  // Categories Management
  createCustomCategory: (category: ActionCategory) => Promise<void>;
  updateCategory: (categoryId: string, updates: Partial<ActionCategory>) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  
  // Action Discovery
  discoverActionsForSPA: (spaType: SPAType) => Promise<QuickAction[]>;
  getSmartSuggestions: (context: NavigationContext) => Promise<QuickAction[]>;
  
  // Performance & Analytics
  getActionMetrics: () => ActionMetrics;
  getExecutionHistory: (limit?: number) => ActionExecutionResult[];
  optimizeActionPerformance: () => Promise<void>;
  
  // Bulk Operations
  enableBulkMode: () => void;
  disableBulkMode: () => void;
  selectMultipleActions: (actionIds: string[]) => void;
  clearSelection: () => void;
  
  // Search & Filtering
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (categoryId: string | null) => void;
  applyFilters: (filters: ActionFilters) => void;
  clearFilters: () => void;
}

interface ActionFilters {
  categories?: string[];
  spaTypes?: SPAType[];
  permissions?: string[];
  availability?: 'available' | 'unavailable' | 'all';
  recency?: 'recent' | 'older' | 'all';
}

interface ActionExecutionContext {
  navigationContext: NavigationContext;
  userPermissions: UserPermissions;
  currentSPA?: SPAType;
  selectedItems?: any[];
  additionalData?: Record<string, any>;
}

// ============================================================================
// MAIN HOOK IMPLEMENTATION
// ============================================================================

export const useQuickActions = (
  context?: NavigationContext,
  options?: {
    enableSmartSuggestions?: boolean;
    enableAutoExecute?: boolean;
    maxRecentActions?: number;
    refreshInterval?: number;
  }
): QuickActionsState & QuickActionsManager => {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  
  const [actionsState, setActionsState] = useState<QuickActionsState>({
    // Core Actions State
    availableActions: [],
    contextualActions: [],
    favoriteActions: [],
    recentActions: [],
    
    // Organization & Filtering
    actionCategories: [],
    filteredActions: [],
    searchQuery: '',
    selectedCategory: null,
    
    // Performance & Analytics
    actionMetrics: {
      totalExecutions: 0,
      averageExecutionTime: 0,
      successRate: 0,
      mostUsedActions: [],
      errorRate: 0,
      performanceScore: 0
    },
    executionHistory: [],
    
    // Context Awareness
    currentContext: context || null,
    contextualAvailability: {},
    
    // User Personalization
    userPreferences: {
      pinnedActions: [],
      hiddenActions: [],
      customCategories: [],
      actionOrder: []
    },
    
    // Loading & Error States
    isLoading: false,
    isExecuting: {},
    error: null,
    
    // Advanced Features
    smartSuggestionsEnabled: options?.enableSmartSuggestions ?? true,
    autoExecuteEnabled: options?.enableAutoExecute ?? false,
    bulkActionsEnabled: false
  });

  // ========================================================================
  // REFS & PERFORMANCE
  // ========================================================================
  
  const actionCache = useRef<Map<string, QuickAction>>(new Map());
  const executionQueue = useRef<Map<string, AbortController>>(new Map());
  const metricsRef = useRef<ActionMetrics>(actionsState.actionMetrics);
  const contextCache = useRef<Map<string, QuickAction[]>>(new Map());

  // ========================================================================
  // ACTION DISCOVERY & LOADING
  // ========================================================================

  const loadAvailableActions = useCallback(async (forceRefresh = false) => {
    if (actionsState.isLoading && !forceRefresh) return;
    
    try {
      setActionsState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Load actions from all sources
      const safeRacineAPI: any = racineOrchestrationAPI as any;
      const safeCrossAPI: any = crossGroupIntegrationAPI as any;
      const safeUserAPI: any = userManagementAPI as any;

      const [
        coreActions,
        spaActions,
        customActions,
        userPreferences,
        categories
      ] = await Promise.all([
        (safeRacineAPI?.getCoreQuickActions?.() ?? Promise.resolve([])),
        (safeCrossAPI?.getAllSPAQuickActions?.() ?? Promise.resolve([])),
        (safeUserAPI?.getUserCustomActions?.() ?? Promise.resolve([])),
        (safeUserAPI?.getUserActionPreferences?.() ?? Promise.resolve({ recentActions: [], favoriteActions: [] })),
        (safeRacineAPI?.getActionCategories?.() ?? Promise.resolve([]))
      ]);

      // Combine and organize actions
      const allActions = [...coreActions, ...spaActions, ...customActions];
      
      // Cache actions for performance
      allActions.forEach(action => {
        actionCache.current.set(action.id, action);
      });

      // Load recent and favorite actions
      const recentActionIds = userPreferences.recentActions || [];
      const favoriteActionIds = userPreferences.favoriteActions || [];
      
      const recentActions = recentActionIds
        .map(id => actionCache.current.get(id))
        .filter(Boolean) as QuickAction[];
        
      const favoriteActions = favoriteActionIds
        .map(id => actionCache.current.get(id))
        .filter(Boolean) as QuickAction[];

      setActionsState(prev => ({
        ...prev,
        availableActions: allActions,
        filteredActions: allActions,
        recentActions,
        favoriteActions,
        actionCategories: categories,
        userPreferences: {
          ...prev.userPreferences,
          ...userPreferences
        },
        isLoading: false
      }));

    } catch (error: any) {
      console.error('Failed to load quick actions:', error);
      setActionsState(prev => ({
        ...prev,
        error: error.message || 'Failed to load actions',
        isLoading: false
      }));
    }
  }, [actionsState.isLoading]);

  const loadContextualActions = useCallback(async (context: NavigationContext) => {
    const contextKey = JSON.stringify(context);
    
    // Check cache first
    const cached = contextCache.current.get(contextKey);
    if (cached) {
      setActionsState(prev => ({ ...prev, contextualActions: cached }));
      return cached;
    }

    try {
      // Get contextual actions based on current context
      const contextualActions = await crossGroupIntegrationAPI.getContextualActions({
        context,
        includePermissionCheck: true,
        maxActions: 20
      });

      // Cache for future use
      contextCache.current.set(contextKey, contextualActions);
      
      setActionsState(prev => ({
        ...prev,
        contextualActions,
        currentContext: context
      }));

      return contextualActions;
      
    } catch (error) {
      console.error('Failed to load contextual actions:', error);
      return [];
    }
  }, []);

  // ========================================================================
  // ACTION EXECUTION
  // ========================================================================

  const executeAction = useCallback(async (
    actionId: string,
    context?: ActionContext,
    params?: Record<string, any>
  ): Promise<ActionExecutionResult> => {
    const action = actionCache.current.get(actionId);
    if (!action) {
      throw new Error(`Action not found: ${actionId}`);
    }

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const abortController = new AbortController();
    
    try {
      // Set execution state
      setActionsState(prev => ({
        ...prev,
        isExecuting: { ...prev.isExecuting, [actionId]: true }
      }));
      
      executionQueue.current.set(executionId, abortController);
      
      const startTime = performance.now();
      
      // Execute the action
      const executionContext: ActionExecutionContext = {
        navigationContext: context || actionsState.currentContext || {
          currentPath: window.location.pathname,
          spaType: null,
          viewMode: 'dashboard',
          metadata: {}
        },
        userPermissions: await userManagementAPI.getCurrentUserPermissions(),
        currentSPA: actionsState.currentContext?.spaType || undefined,
        additionalData: params
      };

      let result: ActionExecutionResult;
      
      // Route to appropriate execution handler
      switch (action.type) {
        case 'navigation':
          result = await executeNavigationAction(action, executionContext);
          break;
        case 'spaAction':
          result = await executeSPAAction(action, executionContext);
          break;
        case 'workflow':
          result = await executeWorkflowAction(action, executionContext);
          break;
        case 'api':
          result = await executeAPIAction(action, executionContext);
          break;
        default:
          result = await executeGenericAction(action, executionContext);
      }
      
      const executionTime = performance.now() - startTime;
      
      // Update metrics
      metricsRef.current = {
        ...metricsRef.current,
        totalExecutions: metricsRef.current.totalExecutions + 1,
        averageExecutionTime: (metricsRef.current.averageExecutionTime + executionTime) / 2
      };

      // Add to recent actions
      addToRecentActions(action);
      
      // Track execution
      const finalResult: ActionExecutionResult = {
        ...result,
        actionId,
        executionId,
        executionTime,
        timestamp: new Date().toISOString(),
        context: executionContext
      };

      setActionsState(prev => ({
        ...prev,
        executionHistory: [finalResult, ...prev.executionHistory.slice(0, 99)],
        isExecuting: { ...prev.isExecuting, [actionId]: false }
      }));

      return finalResult;
      
    } catch (error: any) {
      console.error(`Failed to execute action ${actionId}:`, error);
      
      const errorResult: ActionExecutionResult = {
        actionId,
        executionId,
        success: false,
        error: error.message || 'Execution failed',
        timestamp: new Date().toISOString(),
        context: {} as ActionExecutionContext,
        executionTime: 0
      };

      setActionsState(prev => ({
        ...prev,
        executionHistory: [errorResult, ...prev.executionHistory.slice(0, 99)],
        isExecuting: { ...prev.isExecuting, [actionId]: false }
      }));

      throw error;
    } finally {
      executionQueue.current.delete(executionId);
    }
  }, [actionsState.currentContext]);

  // ========================================================================
  // ACTION EXECUTION HANDLERS
  // ========================================================================

  const executeNavigationAction = async (
    action: QuickAction,
    context: ActionExecutionContext
  ): Promise<ActionExecutionResult> => {
    const { target, params } = action.execution;
    
    // Use racine router for navigation
    await racineOrchestrationAPI.navigateToTarget({
      target,
      params,
      context: context.navigationContext
    });

    return {
      success: true,
      message: `Navigated to ${target}`,
      data: { target, params }
    } as ActionExecutionResult;
  };

  const executeSPAAction = async (
    action: QuickAction,
    context: ActionExecutionContext
  ): Promise<ActionExecutionResult> => {
    const { spaType, method, params } = action.execution;
    
    return await crossGroupIntegrationAPI.executeSPAAction({
      spaType,
      method,
      params,
      context: context.navigationContext
    });
  };

  const executeWorkflowAction = async (
    action: QuickAction,
    context: ActionExecutionContext
  ): Promise<ActionExecutionResult> => {
    const { workflowId, params } = action.execution;
    
    return await racineOrchestrationAPI.executeWorkflow({
      workflowId,
      params,
      context: context.navigationContext
    });
  };

  const executeAPIAction = async (
    action: QuickAction,
    context: ActionExecutionContext
  ): Promise<ActionExecutionResult> => {
    const { endpoint, method, params } = action.execution;
    
    return await racineOrchestrationAPI.executeAPIAction({
      endpoint,
      method,
      params,
      context: context.navigationContext
    });
  };

  const executeGenericAction = async (
    action: QuickAction,
    context: ActionExecutionContext
  ): Promise<ActionExecutionResult> => {
    // Handle custom/generic actions
    return await racineOrchestrationAPI.executeGenericAction({
      actionId: action.id,
      execution: action.execution,
      context: context.navigationContext
    });
  };

  // ========================================================================
  // ACTION MANAGEMENT HELPERS
  // ========================================================================

  const addToRecentActions = useCallback((action: QuickAction) => {
    setActionsState(prev => {
      const maxRecent = options?.maxRecentActions || 10;
      const newRecent = [
        action,
        ...prev.recentActions.filter(a => a.id !== action.id)
      ].slice(0, maxRecent);
      
      // Save to backend
      userManagementAPI.updateRecentActions(newRecent.map(a => a.id)).catch(error => {
        console.warn('Failed to save recent actions:', error);
      });
      
      return { ...prev, recentActions: newRecent };
    });
  }, [options?.maxRecentActions]);

  const applyFiltersToActions = useCallback((filters: ActionFilters) => {
    const filtered = actionsState.availableActions.filter(action => {
      // Category filter
      if (filters.categories && filters.categories.length > 0) {
        if (!filters.categories.includes(action.category)) return false;
      }
      
      // SPA type filter
      if (filters.spaTypes && filters.spaTypes.length > 0) {
        if (!filters.spaTypes.includes(action.spaType)) return false;
      }
      
      // Permission filter
      if (filters.permissions && filters.permissions.length > 0) {
        if (!action.requiredPermissions?.some(p => filters.permissions!.includes(p))) return false;
      }
      
      // Search query filter
      if (actionsState.searchQuery) {
        const query = actionsState.searchQuery.toLowerCase();
        if (!action.name.toLowerCase().includes(query) && 
            !action.description?.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      return true;
    });
    
    setActionsState(prev => ({ ...prev, filteredActions: filtered }));
  }, [actionsState.availableActions, actionsState.searchQuery]);

  // ========================================================================
  // ACTION IMPLEMENTATIONS
  // ========================================================================

  const getContextualActions = useCallback((context: NavigationContext): QuickAction[] => {
    return actionsState.contextualActions.filter(action => {
      // Filter based on context relevance
      if (action.contextRequirements) {
        return action.contextRequirements.every(req => {
          switch (req.type) {
            case 'spaType':
              return context.spaType === req.value;
            case 'viewMode':
              return context.viewMode === req.value;
            case 'path':
              return context.currentPath.includes(req.value);
            default:
              return true;
          }
        });
      }
      return true;
    });
  }, [actionsState.contextualActions]);

  const searchActions = useCallback((query: string): QuickAction[] => {
    if (!query.trim()) return actionsState.availableActions;
    
    const lowerQuery = query.toLowerCase();
    return actionsState.availableActions.filter(action =>
      action.name.toLowerCase().includes(lowerQuery) ||
      action.description?.toLowerCase().includes(lowerQuery) ||
      action.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }, [actionsState.availableActions]);

  const getActionsByCategory = useCallback((category: string): QuickAction[] => {
    return actionsState.availableActions.filter(action => action.category === category);
  }, [actionsState.availableActions]);

  const addToFavorites = useCallback(async (actionId: string): Promise<void> => {
    try {
      await userManagementAPI.addActionToFavorites(actionId);
      
      const action = actionCache.current.get(actionId);
      if (action) {
        setActionsState(prev => ({
          ...prev,
          favoriteActions: [...prev.favoriteActions, action],
          userPreferences: {
            ...prev.userPreferences,
            pinnedActions: [...prev.userPreferences.pinnedActions, actionId]
          }
        }));
      }
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      throw error;
    }
  }, []);

  const removeFromFavorites = useCallback(async (actionId: string): Promise<void> => {
    try {
      await userManagementAPI.removeActionFromFavorites(actionId);
      
      setActionsState(prev => ({
        ...prev,
        favoriteActions: prev.favoriteActions.filter(a => a.id !== actionId),
        userPreferences: {
          ...prev.userPreferences,
          pinnedActions: prev.userPreferences.pinnedActions.filter(id => id !== actionId)
        }
      }));
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      throw error;
    }
  }, []);

  // ========================================================================
  // LIFECYCLE & EFFECTS
  // ========================================================================

  // Load actions on mount and context change
  useEffect(() => {
    loadAvailableActions();
  }, []);

  useEffect(() => {
    if (actionsState.currentContext) {
      loadContextualActions(actionsState.currentContext);
    }
  }, [actionsState.currentContext, loadContextualActions]);

  // Auto-refresh actions
  useEffect(() => {
    const refreshInterval = options?.refreshInterval || 300000; // 5 minutes
    const interval = setInterval(() => {
      loadAvailableActions(true);
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [loadAvailableActions, options?.refreshInterval]);

  // ========================================================================
  // RETURN HOOK INTERFACE
  // ========================================================================

  return {
    // State
    ...actionsState,
    
    // Actions
    executeAction,
    executeBulkActions: async (actionIds: string[], context?: ActionContext) => {
      return await Promise.all(
        actionIds.map(id => executeAction(id, context))
      );
    },
    cancelExecution: (executionId: string) => {
      const controller = executionQueue.current.get(executionId);
      if (controller) {
        controller.abort();
        executionQueue.current.delete(executionId);
      }
    },
    getContextualActions,
    refreshContextualActions: loadContextualActions,
    setCurrentContext: (context: NavigationContext) => {
      setActionsState(prev => ({ ...prev, currentContext: context }));
    },
    getActionsByCategory,
    searchActions,
    filterActionsByPermissions: (permissions: UserPermissions) => {
      return actionsState.availableActions.filter(action =>
        !action.requiredPermissions || 
        action.requiredPermissions.every(p => permissions.includes(p))
      );
    },
    addToFavorites,
    removeFromFavorites,
    reorderFavorites: async (actionIds: string[]) => {
      await userManagementAPI.reorderFavoriteActions(actionIds);
      const reorderedFavorites = actionIds
        .map(id => actionCache.current.get(id))
        .filter(Boolean) as QuickAction[];
      setActionsState(prev => ({ ...prev, favoriteActions: reorderedFavorites }));
    },
    createCustomCategory: async (category: ActionCategory) => {
      await racineOrchestrationAPI.createActionCategory(category);
      setActionsState(prev => ({
        ...prev,
        actionCategories: [...prev.actionCategories, category]
      }));
    },
    updateCategory: async (categoryId: string, updates: Partial<ActionCategory>) => {
      await racineOrchestrationAPI.updateActionCategory(categoryId, updates);
      setActionsState(prev => ({
        ...prev,
        actionCategories: prev.actionCategories.map(cat =>
          cat.id === categoryId ? { ...cat, ...updates } : cat
        )
      }));
    },
    deleteCategory: async (categoryId: string) => {
      await racineOrchestrationAPI.deleteActionCategory(categoryId);
      setActionsState(prev => ({
        ...prev,
        actionCategories: prev.actionCategories.filter(cat => cat.id !== categoryId)
      }));
    },
    discoverActionsForSPA: async (spaType: SPAType) => {
      return await crossGroupIntegrationAPI.discoverSPAActions(spaType);
    },
    getSmartSuggestions: async (context: NavigationContext) => {
      if (!actionsState.smartSuggestionsEnabled) return [];
      return await racineOrchestrationAPI.getSmartActionSuggestions(context);
    },
    getActionMetrics: () => metricsRef.current,
    getExecutionHistory: (limit = 50) => actionsState.executionHistory.slice(0, limit),
    optimizeActionPerformance: async () => {
      // Clear old cache entries and optimize performance
      const now = Date.now();
      const cacheExpiry = 10 * 60 * 1000; // 10 minutes
      
      for (const [key, entry] of contextCache.current.entries()) {
        if (now - (entry as any).timestamp > cacheExpiry) {
          contextCache.current.delete(key);
        }
      }
    },
    enableBulkMode: () => {
      setActionsState(prev => ({ ...prev, bulkActionsEnabled: true }));
    },
    disableBulkMode: () => {
      setActionsState(prev => ({ ...prev, bulkActionsEnabled: false }));
    },
    selectMultipleActions: (actionIds: string[]) => {
      // Implementation for bulk selection
    },
    clearSelection: () => {
      // Implementation for clearing bulk selection
    },
    setSearchQuery: (query: string) => {
      setActionsState(prev => ({ ...prev, searchQuery: query }));
    },
    setSelectedCategory: (categoryId: string | null) => {
      setActionsState(prev => ({ ...prev, selectedCategory: categoryId }));
    },
    applyFilters: applyFiltersToActions,
    clearFilters: () => {
      setActionsState(prev => ({
        ...prev,
        searchQuery: '',
        selectedCategory: null,
        filteredActions: prev.availableActions
      }));
    }
  };
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default useQuickActions;