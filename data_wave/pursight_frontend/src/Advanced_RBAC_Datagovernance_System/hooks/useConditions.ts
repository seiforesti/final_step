// useConditions Hook - Comprehensive ABAC condition management with template creation, validation, and evaluation
// Maps to backend condition service with enterprise-grade functionality

import { useState, useEffect, useCallback, useMemo } from 'react';
import { conditionService } from '../services/condition.service';
import { rbacWebSocketService } from '../services/websocket.service';
import type { ConditionTemplate, ConditionTemplateCreate, ConditionTemplateUpdate, ConditionFilters, ConditionPagination } from '../types/condition.types';

export interface ConditionsState {
  conditionTemplates: ConditionTemplate[];
  totalCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  selectedConditions: ConditionTemplate[];
  filters: ConditionFilters;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  lastUpdated: Date | null;
  conditionHelpers: {
    operators: string[];
    attributes: string[];
    functions: string[];
  };
  conditionLibrary: any[];
  conditionPresets: any[];
}

export interface ConditionsMethods {
  // Data Loading
  loadConditionTemplates: (page?: number) => Promise<void>;
  refreshConditionTemplates: () => Promise<void>;
  searchConditionTemplates: (query: string) => Promise<void>;
  loadConditionHelpers: () => Promise<void>;
  loadConditionLibrary: () => Promise<void>;
  loadConditionPresets: () => Promise<void>;
  
  // Filtering & Sorting
  setFilters: (filters: Partial<ConditionFilters>) => void;
  clearFilters: () => void;
  setSorting: (sortBy: string, sortOrder?: 'asc' | 'desc') => void;
  setPagination: (page: number, pageSize?: number) => void;
  
  // Condition Template Operations
  createConditionTemplate: (templateData: ConditionTemplateCreate) => Promise<ConditionTemplate>;
  updateConditionTemplate: (templateId: number, updates: ConditionTemplateUpdate) => Promise<ConditionTemplate>;
  deleteConditionTemplate: (templateId: number) => Promise<void>;
  getConditionTemplate: (templateId: number) => Promise<ConditionTemplate | null>;
  
  // Condition Validation & Testing
  validateCondition: (condition: string, context?: Record<string, any>) => Promise<{ valid: boolean; errors: string[] }>;
  testCondition: (condition: string, context: Record<string, any>) => Promise<boolean>;
  batchTestConditions: (tests: Array<{ condition: string; context: Record<string, any> }>) => Promise<Record<string, boolean>>;
  evaluateConditionTemplate: (templateId: number, context: Record<string, any>) => Promise<boolean>;
  
  // Condition Helpers & Metadata
  getConditionOperators: () => string[];
  getConditionAttributes: () => string[];
  getConditionFunctions: () => string[];
  getConditionExamples: () => Promise<any[]>;
  
  // Library & Presets
  createFromPreset: (presetId: string, customizations?: any) => Promise<ConditionTemplate>;
  
  // Advanced Operations
  parseNaturalLanguageCondition: (naturalLanguage: string) => Promise<string>;
  generateConditionExplanation: (condition: string) => Promise<string>;
  optimizeCondition: (condition: string) => Promise<string>;
  detectConditionConflicts: (conditions: string[]) => Promise<any[]>;
  
  // Analytics
  getConditionUsageAnalytics: (templateId?: number) => Promise<any>;
  getConditionComplexityAnalysis: (condition: string) => Promise<any>;
  
  // Import/Export
  exportConditionTemplates: (templateIds?: number[], format?: 'json' | 'yaml' | 'csv') => Promise<void>;
  importConditionTemplates: (file: File, options?: { skipDuplicates?: boolean; updateExisting?: boolean }) => Promise<{ imported: number; skipped: number; errors: string[] }>;
  
  // Search & Discovery
  findSimilarConditionTemplates: (templateId: number) => Promise<ConditionTemplate[]>;
  getConditionRecommendations: (context: Record<string, any>) => Promise<ConditionTemplate[]>;
  
  // Selection Management
  selectCondition: (condition: ConditionTemplate) => void;
  deselectCondition: (conditionId: number) => void;
  selectAllConditions: () => void;
  clearSelection: () => void;
  toggleConditionSelection: (condition: ConditionTemplate) => void;
  
  // Utility
  clearCache: () => void;
  resetPagination: () => void;
}

export interface UseConditionsReturn extends ConditionsState, ConditionsMethods {}

const DEFAULT_PAGE_SIZE = 25;
const DEFAULT_FILTERS: ConditionFilters = {};

export function useConditions(initialFilters: ConditionFilters = {}, autoLoad = true): UseConditionsReturn {
  const [state, setState] = useState<ConditionsState>({
    conditionTemplates: [],
    totalCount: 0,
    isLoading: false,
    isRefreshing: false,
    error: null,
    currentPage: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    hasNextPage: false,
    hasPreviousPage: false,
    selectedConditions: [],
    filters: { ...DEFAULT_FILTERS, ...initialFilters },
    sortBy: 'name',
    sortOrder: 'asc',
    lastUpdated: null,
    conditionHelpers: {
      operators: [],
      attributes: [],
      functions: []
    },
    conditionLibrary: [],
    conditionPresets: []
  });

  // Auto-load condition templates on mount
  useEffect(() => {
    if (autoLoad) {
      Promise.all([
        loadConditionTemplates(1),
        loadConditionHelpers(),
        loadConditionLibrary(),
        loadConditionPresets()
      ]).catch(console.error);
    }
  }, [autoLoad]);

  // Set up real-time updates
  useEffect(() => {
    // Subscribe to condition template changes
    const conditionSubscription = rbacWebSocketService.subscribe('condition_changed', (event) => {
      setState(prev => ({
        ...prev,
        conditionTemplates: prev.conditionTemplates.map(template => 
          template.id === event.templateId 
            ? { ...template, lastUpdated: new Date() }
            : template
        )
      }));
    });

    return () => {
      rbacWebSocketService.unsubscribe(conditionSubscription);
    };
  }, []);

  // === Data Loading ===

  const loadConditionTemplates = useCallback(async (page: number = state.currentPage): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const pagination: ConditionPagination = {
        page,
        pageSize: state.pageSize,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder
      };

      const response = await conditionService.getConditionTemplates(state.filters, pagination);
      
      setState(prev => ({
        ...prev,
        conditionTemplates: response.data.items,
        totalCount: response.data.total,
        currentPage: response.data.page,
        hasNextPage: response.data.hasNextPage,
        hasPreviousPage: response.data.hasPreviousPage,
        isLoading: false,
        lastUpdated: new Date()
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load condition templates'
      }));
    }
  }, [state.currentPage, state.pageSize, state.sortBy, state.sortOrder, state.filters]);

  const refreshConditionTemplates = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isRefreshing: true }));
      await loadConditionTemplates(state.currentPage);
      setState(prev => ({ ...prev, isRefreshing: false }));
    } catch (error) {
      setState(prev => ({ ...prev, isRefreshing: false }));
    }
  }, [loadConditionTemplates, state.currentPage]);

  const searchConditionTemplates = useCallback(async (query: string): Promise<void> => {
    const searchFilters: ConditionFilters = {
      ...state.filters,
      search: query
    };
    
    setState(prev => ({ ...prev, filters: searchFilters, currentPage: 1 }));
    await loadConditionTemplates(1);
  }, [state.filters, loadConditionTemplates]);

  const loadConditionHelpers = useCallback(async (): Promise<void> => {
    try {
      const response = await conditionService.getConditionHelpers();
      setState(prev => ({
        ...prev,
        conditionHelpers: response.data
      }));
    } catch (error) {
      console.error('Failed to load condition helpers:', error);
    }
  }, []);

  const loadConditionLibrary = useCallback(async (): Promise<void> => {
    try {
      const response = await conditionService.getConditionLibrary();
      setState(prev => ({
        ...prev,
        conditionLibrary: response.data
      }));
    } catch (error) {
      console.error('Failed to load condition library:', error);
    }
  }, []);

  const loadConditionPresets = useCallback(async (): Promise<void> => {
    try {
      const response = await conditionService.getConditionPresets();
      setState(prev => ({
        ...prev,
        conditionPresets: response.data
      }));
    } catch (error) {
      console.error('Failed to load condition presets:', error);
    }
  }, []);

  // === Filtering & Sorting ===

  const setFilters = useCallback((newFilters: Partial<ConditionFilters>): void => {
    const updatedFilters = { ...state.filters, ...newFilters };
    setState(prev => ({ ...prev, filters: updatedFilters, currentPage: 1 }));
    loadConditionTemplates(1);
  }, [state.filters, loadConditionTemplates]);

  const clearFilters = useCallback((): void => {
    setState(prev => ({ ...prev, filters: DEFAULT_FILTERS, currentPage: 1 }));
    loadConditionTemplates(1);
  }, [loadConditionTemplates]);

  const setSorting = useCallback((sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): void => {
    setState(prev => ({ ...prev, sortBy, sortOrder, currentPage: 1 }));
    loadConditionTemplates(1);
  }, [loadConditionTemplates]);

  const setPagination = useCallback((page: number, pageSize: number = state.pageSize): void => {
    setState(prev => ({ ...prev, currentPage: page, pageSize }));
    loadConditionTemplates(page);
  }, [state.pageSize, loadConditionTemplates]);

  // === Condition Template Operations ===

  const createConditionTemplate = useCallback(async (templateData: ConditionTemplateCreate): Promise<ConditionTemplate> => {
    try {
      const response = await conditionService.createConditionTemplate(templateData);
      const newTemplate = response.data;
      
      setState(prev => ({
        ...prev,
        conditionTemplates: [newTemplate, ...prev.conditionTemplates],
        totalCount: prev.totalCount + 1,
        lastUpdated: new Date()
      }));
      
      return newTemplate;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create condition template'
      }));
      throw error;
    }
  }, []);

  const updateConditionTemplate = useCallback(async (templateId: number, updates: ConditionTemplateUpdate): Promise<ConditionTemplate> => {
    try {
      const response = await conditionService.updateConditionTemplate(templateId, updates);
      const updatedTemplate = response.data;
      
      setState(prev => ({
        ...prev,
        conditionTemplates: prev.conditionTemplates.map(template => 
          template.id === templateId ? updatedTemplate : template
        ),
        selectedConditions: prev.selectedConditions.map(template => 
          template.id === templateId ? updatedTemplate : template
        ),
        lastUpdated: new Date()
      }));
      
      return updatedTemplate;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update condition template'
      }));
      throw error;
    }
  }, []);

  const deleteConditionTemplate = useCallback(async (templateId: number): Promise<void> => {
    try {
      await conditionService.deleteConditionTemplate(templateId);
      
      setState(prev => ({
        ...prev,
        conditionTemplates: prev.conditionTemplates.filter(template => template.id !== templateId),
        selectedConditions: prev.selectedConditions.filter(template => template.id !== templateId),
        totalCount: prev.totalCount - 1,
        lastUpdated: new Date()
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete condition template'
      }));
      throw error;
    }
  }, []);

  const getConditionTemplate = useCallback(async (templateId: number): Promise<ConditionTemplate | null> => {
    try {
      const response = await conditionService.getConditionTemplate(templateId);
      return response.data;
    } catch (error) {
      console.error('Failed to get condition template:', error);
      return null;
    }
  }, []);

  // === Condition Validation & Testing ===

  const validateCondition = useCallback(async (
    condition: string, 
    context?: Record<string, any>
  ): Promise<{ valid: boolean; errors: string[] }> => {
    try {
      const response = await conditionService.validateCondition(condition, context);
      return response.data;
    } catch (error) {
      console.error('Failed to validate condition:', error);
      return { valid: false, errors: ['Validation failed'] };
    }
  }, []);

  const testCondition = useCallback(async (condition: string, context: Record<string, any>): Promise<boolean> => {
    try {
      const response = await conditionService.testCondition(condition, context);
      return response.data.result;
    } catch (error) {
      console.error('Failed to test condition:', error);
      return false;
    }
  }, []);

  const batchTestConditions = useCallback(async (
    tests: Array<{ condition: string; context: Record<string, any> }>
  ): Promise<Record<string, boolean>> => {
    try {
      const response = await conditionService.batchTestConditions(tests);
      return response.data;
    } catch (error) {
      console.error('Failed to batch test conditions:', error);
      return {};
    }
  }, []);

  const evaluateConditionTemplate = useCallback(async (
    templateId: number, 
    context: Record<string, any>
  ): Promise<boolean> => {
    try {
      const response = await conditionService.evaluateConditionTemplate(templateId, context);
      return response.data.result;
    } catch (error) {
      console.error('Failed to evaluate condition template:', error);
      return false;
    }
  }, []);

  // === Condition Helpers & Metadata ===

  const getConditionOperators = useCallback((): string[] => {
    return state.conditionHelpers.operators;
  }, [state.conditionHelpers.operators]);

  const getConditionAttributes = useCallback((): string[] => {
    return state.conditionHelpers.attributes;
  }, [state.conditionHelpers.attributes]);

  const getConditionFunctions = useCallback((): string[] => {
    return state.conditionHelpers.functions;
  }, [state.conditionHelpers.functions]);

  const getConditionExamples = useCallback(async (): Promise<any[]> => {
    try {
      const response = await conditionService.getConditionExamples();
      return response.data;
    } catch (error) {
      console.error('Failed to get condition examples:', error);
      return [];
    }
  }, []);

  // === Library & Presets ===

  const createFromPreset = useCallback(async (presetId: string, customizations?: any): Promise<ConditionTemplate> => {
    try {
      const response = await conditionService.createFromPreset(presetId, customizations);
      const newTemplate = response.data;
      
      setState(prev => ({
        ...prev,
        conditionTemplates: [newTemplate, ...prev.conditionTemplates],
        totalCount: prev.totalCount + 1,
        lastUpdated: new Date()
      }));
      
      return newTemplate;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create from preset'
      }));
      throw error;
    }
  }, []);

  // === Advanced Operations ===

  const parseNaturalLanguageCondition = useCallback(async (naturalLanguage: string): Promise<string> => {
    try {
      const response = await conditionService.parseNaturalLanguageCondition(naturalLanguage);
      return response.data.condition;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to parse natural language condition'
      }));
      throw error;
    }
  }, []);

  const generateConditionExplanation = useCallback(async (condition: string): Promise<string> => {
    try {
      const response = await conditionService.generateConditionExplanation(condition);
      return response.data.explanation;
    } catch (error) {
      console.error('Failed to generate condition explanation:', error);
      return 'Explanation not available';
    }
  }, []);

  const optimizeCondition = useCallback(async (condition: string): Promise<string> => {
    try {
      const response = await conditionService.optimizeCondition(condition);
      return response.data.optimizedCondition;
    } catch (error) {
      console.error('Failed to optimize condition:', error);
      return condition; // Return original if optimization fails
    }
  }, []);

  const detectConditionConflicts = useCallback(async (conditions: string[]): Promise<any[]> => {
    try {
      const response = await conditionService.detectConditionConflicts(conditions);
      return response.data.conflicts;
    } catch (error) {
      console.error('Failed to detect condition conflicts:', error);
      return [];
    }
  }, []);

  // === Analytics ===

  const getConditionUsageAnalytics = useCallback(async (templateId?: number): Promise<any> => {
    try {
      const response = await conditionService.getConditionUsageAnalytics(templateId);
      return response.data;
    } catch (error) {
      console.error('Failed to get condition usage analytics:', error);
      return null;
    }
  }, []);

  const getConditionComplexityAnalysis = useCallback(async (condition: string): Promise<any> => {
    try {
      const response = await conditionService.getConditionComplexityAnalysis(condition);
      return response.data;
    } catch (error) {
      console.error('Failed to get condition complexity analysis:', error);
      return null;
    }
  }, []);

  // === Import/Export ===

  const exportConditionTemplates = useCallback(async (
    templateIds?: number[], 
    format: 'json' | 'yaml' | 'csv' = 'json'
  ): Promise<void> => {
    try {
      await conditionService.exportConditionTemplates(templateIds, format);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to export condition templates'
      }));
      throw error;
    }
  }, []);

  const importConditionTemplates = useCallback(async (
    file: File, 
    options: { skipDuplicates?: boolean; updateExisting?: boolean } = {}
  ): Promise<{ imported: number; skipped: number; errors: string[] }> => {
    try {
      const response = await conditionService.importConditionTemplates(file, options);
      await refreshConditionTemplates();
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to import condition templates'
      }));
      throw error;
    }
  }, [refreshConditionTemplates]);

  // === Search & Discovery ===

  const findSimilarConditionTemplates = useCallback(async (templateId: number): Promise<ConditionTemplate[]> => {
    try {
      const response = await conditionService.findSimilarConditionTemplates(templateId);
      return response.data;
    } catch (error) {
      console.error('Failed to find similar condition templates:', error);
      return [];
    }
  }, []);

  const getConditionRecommendations = useCallback(async (context: Record<string, any>): Promise<ConditionTemplate[]> => {
    try {
      const response = await conditionService.getConditionRecommendations(context);
      return response.data;
    } catch (error) {
      console.error('Failed to get condition recommendations:', error);
      return [];
    }
  }, []);

  // === Selection Management ===

  const selectCondition = useCallback((condition: ConditionTemplate): void => {
    setState(prev => ({
      ...prev,
      selectedConditions: prev.selectedConditions.find(c => c.id === condition.id) 
        ? prev.selectedConditions 
        : [...prev.selectedConditions, condition]
    }));
  }, []);

  const deselectCondition = useCallback((conditionId: number): void => {
    setState(prev => ({
      ...prev,
      selectedConditions: prev.selectedConditions.filter(condition => condition.id !== conditionId)
    }));
  }, []);

  const selectAllConditions = useCallback((): void => {
    setState(prev => ({ ...prev, selectedConditions: [...prev.conditionTemplates] }));
  }, []);

  const clearSelection = useCallback((): void => {
    setState(prev => ({ ...prev, selectedConditions: [] }));
  }, []);

  const toggleConditionSelection = useCallback((condition: ConditionTemplate): void => {
    setState(prev => ({
      ...prev,
      selectedConditions: prev.selectedConditions.find(c => c.id === condition.id)
        ? prev.selectedConditions.filter(c => c.id !== condition.id)
        : [...prev.selectedConditions, condition]
    }));
  }, []);

  // === Utility ===

  const clearCache = useCallback((): void => {
    setState(prev => ({
      ...prev,
      conditionTemplates: [],
      totalCount: 0,
      selectedConditions: [],
      conditionLibrary: [],
      conditionPresets: [],
      lastUpdated: null,
      error: null
    }));
  }, []);

  const resetPagination = useCallback((): void => {
    setState(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  // Computed values
  const computedValues = useMemo(() => ({
    activeTemplates: state.conditionTemplates.filter(template => template.isActive),
    inactiveTemplates: state.conditionTemplates.filter(template => !template.isActive),
    systemTemplates: state.conditionTemplates.filter(template => template.isSystem),
    customTemplates: state.conditionTemplates.filter(template => !template.isSystem),
    complexTemplates: state.conditionTemplates.filter(template => template.complexity === 'high'),
    simpleTemplates: state.conditionTemplates.filter(template => template.complexity === 'low'),
    totalPages: Math.ceil(state.totalCount / state.pageSize),
    isAllSelected: state.selectedConditions.length === state.conditionTemplates.length && state.conditionTemplates.length > 0,
    isPartiallySelected: state.selectedConditions.length > 0 && state.selectedConditions.length < state.conditionTemplates.length,
    selectedConditionIds: state.selectedConditions.map(condition => condition.id),
    hasData: state.conditionTemplates.length > 0,
    isEmpty: !state.isLoading && state.conditionTemplates.length === 0,
    canLoadMore: state.hasNextPage,
    hasHelpers: state.conditionHelpers.operators.length > 0
  }), [state]);

  return {
    ...state,
    ...computedValues,
    
    // Data Loading
    loadConditionTemplates,
    refreshConditionTemplates,
    searchConditionTemplates,
    loadConditionHelpers,
    loadConditionLibrary,
    loadConditionPresets,
    
    // Filtering & Sorting
    setFilters,
    clearFilters,
    setSorting,
    setPagination,
    
    // Condition Template Operations
    createConditionTemplate,
    updateConditionTemplate,
    deleteConditionTemplate,
    getConditionTemplate,
    
    // Condition Validation & Testing
    validateCondition,
    testCondition,
    batchTestConditions,
    evaluateConditionTemplate,
    
    // Condition Helpers & Metadata
    getConditionOperators,
    getConditionAttributes,
    getConditionFunctions,
    getConditionExamples,
    
    // Library & Presets
    createFromPreset,
    
    // Advanced Operations
    parseNaturalLanguageCondition,
    generateConditionExplanation,
    optimizeCondition,
    detectConditionConflicts,
    
    // Analytics
    getConditionUsageAnalytics,
    getConditionComplexityAnalysis,
    
    // Import/Export
    exportConditionTemplates,
    importConditionTemplates,
    
    // Search & Discovery
    findSimilarConditionTemplates,
    getConditionRecommendations,
    
    // Selection Management
    selectCondition,
    deselectCondition,
    selectAllConditions,
    clearSelection,
    toggleConditionSelection,
    
    // Utility
    clearCache,
    resetPagination
  };
}

export default useConditions;