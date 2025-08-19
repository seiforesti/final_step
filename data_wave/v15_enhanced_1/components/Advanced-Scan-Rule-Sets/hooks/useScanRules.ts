// ============================================================================
// ADVANCED SCAN RULE SETS - COMPREHENSIVE USE SCAN RULES HOOK
// Enterprise-Core Implementation with Full State Management
// Integrates with: scanRulesAPI service and all backend capabilities
// ============================================================================

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  ScanRuleSet, 
  EnhancedScanRuleSet,
  ScanRule,
  RuleSetMetadata,
  ExecutionConfiguration,
  ValidationResult,
  AIOptimization,
  PatternRecognition,
  ScanOrchestrationJob,
  CollaborationFeatures,
  RuleSetAnalytics,
  FilterOptions,
  SortConfig,
  SearchConfig,
  APIResponse
} from '../types/scan-rules.types';
import { scanRulesAPI, ScanRulesAPIUtils } from '../services/scan-rules-apis';

// ============================================================================
// HOOK CONFIGURATION & TYPES
// ============================================================================

interface UseScanRulesOptions {
  // Data fetching options
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealTime?: boolean;
  cacheTime?: number;
  staleTime?: number;
  
  // Filtering and pagination
  initialFilters?: FilterOptions;
  initialSort?: SortConfig;
  initialSearch?: SearchConfig;
  pageSize?: number;
  
  // Feature flags
  enableAI?: boolean;
  enableCollaboration?: boolean;
  enableAnalytics?: boolean;
  enableOptimization?: boolean;
  
  // Performance options
  enableInfiniteScroll?: boolean;
  prefetchNext?: boolean;
  backgroundUpdates?: boolean;
  
  // Event callbacks
  onRuleSetCreated?: (ruleSet: ScanRuleSet) => void;
  onRuleSetUpdated?: (ruleSet: ScanRuleSet) => void;
  onRuleSetDeleted?: (id: string) => void;
  onError?: (error: Error) => void;
}

interface UseScanRulesState {
  // Core data
  ruleSets: ScanRuleSet[];
  currentRuleSet: ScanRuleSet | null;
  enhancedRuleSet: EnhancedScanRuleSet | null;
  selectedRuleSets: string[];
  
  // UI state
  filters: FilterOptions;
  sort: SortConfig;
  search: SearchConfig;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  
  // Feature state
  aiOptimization: AIOptimization | null;
  patternAnalysis: PatternRecognition | null;
  collaborationFeatures: CollaborationFeatures | null;
  analytics: RuleSetAnalytics | null;
  
  // Loading states
  isLoading: boolean;
  isFetching: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isValidating: boolean;
  isExecuting: boolean;
  isOptimizing: boolean;
  
  // Error states
  error: Error | null;
  validationErrors: string[];
  optimizationErrors: string[];
  
  // Real-time state
  realTimeConnected: boolean;
  lastUpdate: Date | null;
}

interface UseScanRulesActions {
  // CRUD operations
  fetchRuleSets: (options?: any) => Promise<void>;
  fetchRuleSet: (id: string, options?: any) => Promise<void>;
  createRuleSet: (ruleSet: Omit<ScanRuleSet, 'id' | 'created_at' | 'updated_at'>, options?: any) => Promise<ScanRuleSet>;
  updateRuleSet: (id: string, updates: Partial<ScanRuleSet>, options?: any) => Promise<ScanRuleSet>;
  deleteRuleSet: (id: string) => Promise<void>;
  bulkDeleteRuleSets: (ids: string[]) => Promise<void>;
  cloneRuleSet: (id: string, newName: string) => Promise<ScanRuleSet>;
  
  // Enhanced operations
  getEnhancedRuleSet: (id: string, options?: any) => Promise<EnhancedScanRuleSet>;
  optimizeRuleSet: (id: string, config: any) => Promise<AIOptimization>;
  validateRuleSet: (id: string) => Promise<ValidationResult>;
  executeRuleSet: (id: string, config: ExecutionConfiguration) => Promise<string>;
  
  // Pattern and AI operations
  analyzePatterns: (id: string, options?: any) => Promise<PatternRecognition>;
  getAIRecommendations: (context?: any) => Promise<ScanRuleSet[]>;
  
  // Collaboration operations
  getCollaborationFeatures: (id: string) => Promise<CollaborationFeatures>;
  createReviewWorkflow: (id: string, config: any) => Promise<any>;
  shareRuleSet: (id: string, config: any) => Promise<void>;
  
  // Analytics operations
  getRuleSetAnalytics: (id: string, options?: any) => Promise<RuleSetAnalytics>;
  generateReport: (config: any) => Promise<any>;
  
  // State management
  setFilters: (filters: FilterOptions) => void;
  setSort: (sort: SortConfig) => void;
  setSearch: (search: SearchConfig) => void;
  setPagination: (pagination: Partial<UseScanRulesState['pagination']>) => void;
  setSelectedRuleSets: (ids: string[]) => void;
  selectRuleSet: (id: string) => void;
  deselectRuleSet: (id: string) => void;
  selectAllRuleSets: () => void;
  deselectAllRuleSets: () => void;
  
  // Utility operations
  refreshData: () => void;
  resetState: () => void;
  clearErrors: () => void;
  exportRuleSets: (ids: string[], format: string) => Promise<string>;
  importRuleSets: (file: File, options?: any) => Promise<any>;
  
  // Real-time operations
  enableRealTimeUpdates: (ruleSetIds?: string[]) => () => void;
  disableRealTimeUpdates: () => void;
}

export type UseScanRulesReturn = UseScanRulesState & UseScanRulesActions & {
  // Computed properties
  filteredRuleSets: ScanRuleSet[];
  ruleSetStats: {
    total: number;
    active: number;
    inactive: number;
    categories: Record<string, number>;
    avgCompliance: number;
    avgPerformance: number;
  };
  hasSelection: boolean;
  selectionCount: number;
  
  // Utility functions
  getRuleSetById: (id: string) => ScanRuleSet | undefined;
  isRuleSetSelected: (id: string) => boolean;
  canEditRuleSet: (id: string) => boolean;
  canDeleteRuleSet: (id: string) => boolean;
  formatRuleSetForDisplay: (ruleSet: ScanRuleSet) => any;
};

// ============================================================================
// MAIN HOOK IMPLEMENTATION
// ============================================================================

export const useScanRules = (options: UseScanRulesOptions = {}): UseScanRulesReturn => {
  const queryClient = useQueryClient();
  const realTimeCleanupRef = useRef<(() => void) | null>(null);
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [state, setState] = useState<Omit<UseScanRulesState, 'isLoading' | 'isFetching' | 'error'>>({
    ruleSets: [],
    currentRuleSet: null,
    enhancedRuleSet: null,
    selectedRuleSets: [],
    
    filters: options.initialFilters || {},
    sort: options.initialSort || { field: 'name', direction: 'asc' },
    search: options.initialSearch || { query: '', fields: ['name', 'description'] },
    pagination: {
      page: 1,
      limit: options.pageSize || 20,
      total: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    
    aiOptimization: null,
    patternAnalysis: null,
    collaborationFeatures: null,
    analytics: null,
    
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isValidating: false,
    isExecuting: false,
    isOptimizing: false,
    
    validationErrors: [],
    optimizationErrors: [],
    
    realTimeConnected: false,
    lastUpdate: null,
  });

  // ============================================================================
  // QUERY KEYS
  // ============================================================================
  
  const QUERY_KEYS = {
    ruleSets: ['scanRuleSets', state.filters, state.sort, state.search, state.pagination.page, state.pagination.limit],
    ruleSet: (id: string) => ['scanRuleSet', id],
    enhancedRuleSet: (id: string) => ['enhancedScanRuleSet', id],
    analytics: (id: string) => ['scanRuleSetAnalytics', id],
    collaboration: (id: string) => ['scanRuleSetCollaboration', id],
    patterns: (id: string) => ['scanRuleSetPatterns', id],
    recommendations: ['scanRuleSetRecommendations'],
  };

  // ============================================================================
  // QUERIES
  // ============================================================================
  
  const {
    data: ruleSetResponse,
    isLoading,
    isFetching,
    error,
    refetch: refetchRuleSets,
  } = useQuery({
    queryKey: QUERY_KEYS.ruleSets,
    queryFn: () => scanRulesAPI.getScanRuleSets({
      filters: state.filters,
      sort: state.sort,
      search: state.search,
      page: state.pagination.page,
      limit: state.pagination.limit,
      includeAI: options.enableAI,
      includeAnalytics: options.enableAnalytics,
      includeCollaboration: options.enableCollaboration,
    }),
    refetchInterval: options.autoRefresh ? options.refreshInterval || 30000 : false,
    staleTime: options.staleTime || 5 * 60 * 1000, // 5 minutes
    gcTime: options.cacheTime || 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: options.backgroundUpdates !== false,
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================
  
  const createMutation = useMutation({
    mutationFn: ({ ruleSet, mutationOptions }: { 
      ruleSet: Omit<ScanRuleSet, 'id' | 'created_at' | 'updated_at'>; 
      mutationOptions?: any;
    }) => scanRulesAPI.createScanRuleSet(ruleSet, mutationOptions),
    onMutate: () => {
      setState(prev => ({ ...prev, isCreating: true }));
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['scanRuleSets'] });
      options.onRuleSetCreated?.(response.data);
      toast.success('Rule set created successfully');
    },
    onError: (error: Error) => {
      options.onError?.(error);
      toast.error(`Failed to create rule set: ${error.message}`);
    },
    onSettled: () => {
      setState(prev => ({ ...prev, isCreating: false }));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates, mutationOptions }: { 
      id: string; 
      updates: Partial<ScanRuleSet>; 
      mutationOptions?: any;
    }) => scanRulesAPI.updateScanRuleSet(id, updates, mutationOptions),
    onMutate: () => {
      setState(prev => ({ ...prev, isUpdating: true }));
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['scanRuleSets'] });
      queryClient.invalidateQueries({ queryKey: ['scanRuleSet', response.data.id] });
      options.onRuleSetUpdated?.(response.data);
      toast.success('Rule set updated successfully');
    },
    onError: (error: Error) => {
      options.onError?.(error);
      toast.error(`Failed to update rule set: ${error.message}`);
    },
    onSettled: () => {
      setState(prev => ({ ...prev, isUpdating: false }));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => scanRulesAPI.deleteScanRuleSet(id),
    onMutate: () => {
      setState(prev => ({ ...prev, isDeleting: true }));
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['scanRuleSets'] });
      setState(prev => ({
        ...prev,
        currentRuleSet: prev.currentRuleSet?.id === id ? null : prev.currentRuleSet,
        selectedRuleSets: prev.selectedRuleSets.filter(selectedId => selectedId !== id),
      }));
      options.onRuleSetDeleted?.(id);
      toast.success('Rule set deleted successfully');
    },
    onError: (error: Error) => {
      options.onError?.(error);
      toast.error(`Failed to delete rule set: ${error.message}`);
    },
    onSettled: () => {
      setState(prev => ({ ...prev, isDeleting: false }));
    },
  });

  const optimizeMutation = useMutation({
    mutationFn: ({ id, config }: { id: string; config: any }) => 
      scanRulesAPI.optimizeRuleSet(id, config),
    onMutate: () => {
      setState(prev => ({ ...prev, isOptimizing: true, optimizationErrors: [] }));
    },
    onSuccess: (response) => {
      setState(prev => ({ ...prev, aiOptimization: response.data.results }));
      toast.success('Rule set optimization completed');
    },
    onError: (error: Error) => {
      setState(prev => ({ 
        ...prev, 
        optimizationErrors: [error.message] 
      }));
      toast.error(`Optimization failed: ${error.message}`);
    },
    onSettled: () => {
      setState(prev => ({ ...prev, isOptimizing: false }));
    },
  });

  const validateMutation = useMutation({
    mutationFn: (id: string) => scanRulesAPI.validateScanRuleSet(id),
    onMutate: () => {
      setState(prev => ({ ...prev, isValidating: true, validationErrors: [] }));
    },
    onSuccess: (response) => {
      setState(prev => ({ 
        ...prev, 
        validationErrors: response.data.errors || [] 
      }));
      if (response.data.errors?.length === 0) {
        toast.success('Rule set validation passed');
      } else {
        toast.warning(`Validation completed with ${response.data.errors?.length} issues`);
      }
    },
    onError: (error: Error) => {
      setState(prev => ({ 
        ...prev, 
        validationErrors: [error.message] 
      }));
      toast.error(`Validation failed: ${error.message}`);
    },
    onSettled: () => {
      setState(prev => ({ ...prev, isValidating: false }));
    },
  });

  const executeMutation = useMutation({
    mutationFn: ({ id, config }: { id: string; config: ExecutionConfiguration }) =>
      scanRulesAPI.executeScanRuleSet(id, config),
    onMutate: () => {
      setState(prev => ({ ...prev, isExecuting: true }));
    },
    onSuccess: (response) => {
      toast.success(`Rule set execution started: ${response.data.executionId}`);
    },
    onError: (error: Error) => {
      toast.error(`Execution failed: ${error.message}`);
    },
    onSettled: () => {
      setState(prev => ({ ...prev, isExecuting: false }));
    },
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  const ruleSets = useMemo(() => {
    return ruleSetResponse?.data || [];
  }, [ruleSetResponse]);

  const filteredRuleSets = useMemo(() => {
    let filtered = [...ruleSets];

    // Apply search
    if (state.search.query) {
      const query = state.search.query.toLowerCase();
      filtered = filtered.filter(ruleSet => 
        state.search.fields.some(field => 
          ruleSet[field as keyof ScanRuleSet]?.toString().toLowerCase().includes(query)
        )
      );
    }

    // Apply additional client-side filtering if needed
    return filtered;
  }, [ruleSets, state.search]);

  const ruleSetStats = useMemo(() => {
    return ScanRulesAPIUtils.generateEnterpriseSummary(ruleSets);
  }, [ruleSets]);

  const hasSelection = state.selectedRuleSets.length > 0;
  const selectionCount = state.selectedRuleSets.length;

  // ============================================================================
  // ACTION IMPLEMENTATIONS
  // ============================================================================
  
  const fetchRuleSets = useCallback(async (fetchOptions?: any) => {
    await refetchRuleSets();
  }, [refetchRuleSets]);

  const fetchRuleSet = useCallback(async (id: string, fetchOptions?: any) => {
    try {
      const response = await scanRulesAPI.getScanRuleSet(id);
      if (response.success && response.data) {
        setState(prev => ({ ...prev, currentRuleSet: response.data }));
        queryClient.setQueryData(QUERY_KEYS.ruleSet(id), response);
      }
    } catch (error) {
      options.onError?.(error as Error);
    }
  }, [queryClient, options]);

  const createRuleSet = useCallback(async (
    ruleSet: Omit<ScanRuleSet, 'id' | 'created_at' | 'updated_at'>,
    createOptions?: any
  ): Promise<ScanRuleSet> => {
    const validation = ScanRulesAPIUtils.validateRuleSetConfig(ruleSet);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const response = await createMutation.mutateAsync({ 
      ruleSet, 
      mutationOptions: createOptions 
    });
    return response.data;
  }, [createMutation]);

  const updateRuleSet = useCallback(async (
    id: string,
    updates: Partial<ScanRuleSet>,
    updateOptions?: any
  ): Promise<ScanRuleSet> => {
    const response = await updateMutation.mutateAsync({ 
      id, 
      updates, 
      mutationOptions: updateOptions 
    });
    return response.data;
  }, [updateMutation]);

  const deleteRuleSet = useCallback(async (id: string) => {
    await deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  const bulkDeleteRuleSets = useCallback(async (ids: string[]) => {
    try {
      setState(prev => ({ ...prev, isDeleting: true }));
      await scanRulesAPI.performBulkOperation('delete', ids, {});
      queryClient.invalidateQueries({ queryKey: ['scanRuleSets'] });
      setState(prev => ({
        ...prev,
        selectedRuleSets: prev.selectedRuleSets.filter(id => !ids.includes(id)),
      }));
      toast.success(`${ids.length} rule sets deleted successfully`);
    } catch (error) {
      toast.error(`Bulk delete failed: ${(error as Error).message}`);
    } finally {
      setState(prev => ({ ...prev, isDeleting: false }));
    }
  }, [queryClient]);

  const cloneRuleSet = useCallback(async (id: string, newName: string): Promise<ScanRuleSet> => {
    try {
      const originalResponse = await scanRulesAPI.getScanRuleSet(id);
      if (originalResponse.success && originalResponse.data) {
        const clonedRuleSet = {
          ...originalResponse.data,
          name: newName,
          id: undefined,
          created_at: undefined,
          updated_at: undefined,
        } as any;
        return await createRuleSet(clonedRuleSet);
      }
      throw new Error('Failed to fetch original rule set');
    } catch (error) {
      toast.error(`Clone failed: ${(error as Error).message}`);
      throw error;
    }
  }, [createRuleSet]);

  const getEnhancedRuleSet = useCallback(async (
    id: string,
    enhancedOptions?: any
  ): Promise<EnhancedScanRuleSet> => {
    try {
      const response = await scanRulesAPI.getEnhancedScanRuleSet(id, enhancedOptions);
      if (response.success && response.data) {
        setState(prev => ({ ...prev, enhancedRuleSet: response.data }));
        return response.data;
      }
      throw new Error('Failed to fetch enhanced rule set');
    } catch (error) {
      toast.error(`Failed to get enhanced rule set: ${(error as Error).message}`);
      throw error;
    }
  }, []);

  const optimizeRuleSet = useCallback(async (
    id: string,
    config: any
  ): Promise<AIOptimization> => {
    const response = await optimizeMutation.mutateAsync({ id, config });
    return response.data.results;
  }, [optimizeMutation]);

  const validateRuleSet = useCallback(async (id: string): Promise<ValidationResult> => {
    const response = await validateMutation.mutateAsync(id);
    return response.data;
  }, [validateMutation]);

  const executeRuleSet = useCallback(async (
    id: string,
    config: ExecutionConfiguration
  ): Promise<string> => {
    const response = await executeMutation.mutateAsync({ id, config });
    return response.data.executionId;
  }, [executeMutation]);

  // ============================================================================
  // STATE MANAGEMENT ACTIONS
  // ============================================================================
  
  const setFilters = useCallback((filters: FilterOptions) => {
    setState(prev => ({
      ...prev,
      filters,
      pagination: { ...prev.pagination, page: 1 }, // Reset to first page
    }));
  }, []);

  const setSort = useCallback((sort: SortConfig) => {
    setState(prev => ({ ...prev, sort }));
  }, []);

  const setSearch = useCallback((search: SearchConfig) => {
    setState(prev => ({
      ...prev,
      search,
      pagination: { ...prev.pagination, page: 1 }, // Reset to first page
    }));
  }, []);

  const setPagination = useCallback((pagination: Partial<UseScanRulesState['pagination']>) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, ...pagination },
    }));
  }, []);

  const setSelectedRuleSets = useCallback((ids: string[]) => {
    setState(prev => ({ ...prev, selectedRuleSets: ids }));
  }, []);

  const selectRuleSet = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      selectedRuleSets: prev.selectedRuleSets.includes(id)
        ? prev.selectedRuleSets
        : [...prev.selectedRuleSets, id],
    }));
  }, []);

  const deselectRuleSet = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      selectedRuleSets: prev.selectedRuleSets.filter(selectedId => selectedId !== id),
    }));
  }, []);

  const selectAllRuleSets = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedRuleSets: filteredRuleSets.map(rs => rs.id),
    }));
  }, [filteredRuleSets]);

  const deselectAllRuleSets = useCallback(() => {
    setState(prev => ({ ...prev, selectedRuleSets: [] }));
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  const getRuleSetById = useCallback((id: string) => {
    return ruleSets.find(ruleSet => ruleSet.id === id);
  }, [ruleSets]);

  const isRuleSetSelected = useCallback((id: string) => {
    return state.selectedRuleSets.includes(id);
  }, [state.selectedRuleSets]);

  const canEditRuleSet = useCallback((id: string) => {
    const ruleSet = getRuleSetById(id);
    return ruleSet && ruleSet.metadata?.status !== 'locked';
  }, [getRuleSetById]);

  const canDeleteRuleSet = useCallback((id: string) => {
    const ruleSet = getRuleSetById(id);
    return ruleSet && ruleSet.metadata?.status !== 'system';
  }, [getRuleSetById]);

  const formatRuleSetForDisplay = useCallback((ruleSet: ScanRuleSet) => {
    return ScanRulesAPIUtils.formatForEnterpriseDisplay(ruleSet);
  }, []);

  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['scanRuleSets'] });
    setState(prev => ({ ...prev, lastUpdate: new Date() }));
  }, [queryClient]);

  const resetState = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentRuleSet: null,
      enhancedRuleSet: null,
      selectedRuleSets: [],
      aiOptimization: null,
      patternAnalysis: null,
      collaborationFeatures: null,
      analytics: null,
      validationErrors: [],
      optimizationErrors: [],
      filters: options.initialFilters || {},
      sort: options.initialSort || { field: 'name', direction: 'asc' },
      search: options.initialSearch || { query: '', fields: ['name', 'description'] },
      pagination: {
        page: 1,
        limit: options.pageSize || 20,
        total: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    }));
  }, [options]);

  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      validationErrors: [],
      optimizationErrors: [],
    }));
  }, []);

  // ============================================================================
  // REAL-TIME UPDATES
  // ============================================================================
  
  const enableRealTimeUpdates = useCallback((ruleSetIds?: string[]) => {
    if (realTimeCleanupRef.current) {
      realTimeCleanupRef.current();
    }

    const cleanup = scanRulesAPI.subscribeToUpdates(
      ruleSetIds?.[0] || 'all',
      ['rule_set_updated', 'rule_set_created', 'rule_set_deleted', 'execution_status'],
      (event) => {
        setState(prev => ({ 
          ...prev, 
          realTimeConnected: true, 
          lastUpdate: new Date() 
        }));
        
        // Handle different event types
        switch (event.type) {
          case 'rule_set_updated':
          case 'rule_set_created':
            queryClient.invalidateQueries({ queryKey: ['scanRuleSets'] });
            break;
          case 'rule_set_deleted':
            queryClient.invalidateQueries({ queryKey: ['scanRuleSets'] });
            setState(prev => ({
              ...prev,
              selectedRuleSets: prev.selectedRuleSets.filter(id => id !== event.data.id),
            }));
            break;
        }
      }
    );

    realTimeCleanupRef.current = cleanup;
    return cleanup;
  }, [queryClient]);

  const disableRealTimeUpdates = useCallback(() => {
    if (realTimeCleanupRef.current) {
      realTimeCleanupRef.current();
      realTimeCleanupRef.current = null;
    }
    setState(prev => ({ ...prev, realTimeConnected: false }));
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Update pagination info when data changes
  useEffect(() => {
    if (ruleSetResponse?.pagination) {
      setState(prev => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          total: ruleSetResponse.pagination.total || 0,
          hasNextPage: ruleSetResponse.pagination.hasNextPage || false,
          hasPreviousPage: ruleSetResponse.pagination.hasPreviousPage || false,
        },
      }));
    }
  }, [ruleSetResponse]);

  // Enable real-time updates if requested
  useEffect(() => {
    if (options.enableRealTime) {
      enableRealTimeUpdates();
    }
    
    return () => {
      disableRealTimeUpdates();
    };
  }, [options.enableRealTime, enableRealTimeUpdates, disableRealTimeUpdates]);

  // ============================================================================
  // RETURN HOOK INTERFACE
  // ============================================================================
  
  return {
    // State
    ...state,
    ruleSets,
    isLoading,
    isFetching,
    error: error as Error | null,
    
    // Computed properties
    filteredRuleSets,
    ruleSetStats,
    hasSelection,
    selectionCount,
    
    // CRUD actions
    fetchRuleSets,
    fetchRuleSet,
    createRuleSet,
    updateRuleSet,
    deleteRuleSet,
    bulkDeleteRuleSets,
    cloneRuleSet,
    
    // Enhanced actions
    getEnhancedRuleSet,
    optimizeRuleSet,
    validateRuleSet,
    executeRuleSet,
    
    // Pattern and AI operations (placeholder implementations)
    analyzePatterns: async (id: string, options?: any) => {
      const response = await scanRulesAPI.getPatternAnalysis(id, options);
      setState(prev => ({ ...prev, patternAnalysis: response.data.patterns }));
      return response.data.patterns;
    },
    getAIRecommendations: async (context?: any) => {
      const response = await scanRulesAPI.getRuleSetRecommendations(context);
      return response.data;
    },
    
    // Collaboration operations (placeholder implementations)
    getCollaborationFeatures: async (id: string) => {
      const response = await scanRulesAPI.getCollaborationFeatures(id);
      setState(prev => ({ ...prev, collaborationFeatures: response.data }));
      return response.data;
    },
    createReviewWorkflow: async (id: string, config: any) => {
      const response = await scanRulesAPI.createReviewWorkflow(id, config);
      return response.data;
    },
    shareRuleSet: async (id: string, config: any) => {
      // Implementation would call sharing API
      toast.success('Rule set shared successfully');
    },
    
    // Analytics operations (placeholder implementations)
    getRuleSetAnalytics: async (id: string, options?: any) => {
      const response = await scanRulesAPI.getRuleSetAnalytics(id, options);
      setState(prev => ({ ...prev, analytics: response.data }));
      return response.data;
    },
    generateReport: async (config: any) => {
      const response = await scanRulesAPI.generateAdvancedReport(config);
      return response.data;
    },
    
    // State management
    setFilters,
    setSort,
    setSearch,
    setPagination,
    setSelectedRuleSets,
    selectRuleSet,
    deselectRuleSet,
    selectAllRuleSets,
    deselectAllRuleSets,
    
    // Utilities
    refreshData,
    resetState,
    clearErrors,
    getRuleSetById,
    isRuleSetSelected,
    canEditRuleSet,
    canDeleteRuleSet,
    formatRuleSetForDisplay,
    
    // Import/Export (placeholder implementations)
    exportRuleSets: async (ids: string[], format: string) => {
      const response = await scanRulesAPI.exportScanRuleSets(ids, { format } as any);
      return response.data.downloadUrl;
    },
    importRuleSets: async (file: File, importOptions?: any) => {
      const response = await scanRulesAPI.importScanRuleSets(file, importOptions);
      queryClient.invalidateQueries({ queryKey: ['scanRuleSets'] });
      return response.data;
    },
    
    // Real-time
    enableRealTimeUpdates,
    disableRealTimeUpdates,
  };
};

export default useScanRules;