/**
 * Pattern Library Hook
 * Advanced React hook for pattern library management, detection engines,
 * pattern matching, and analytics with real-time capabilities
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { patternLibraryAPIService } from '../services/pattern-library-apis';
import {
  PatternLibrary,
  PatternCategory,
  Pattern,
  PatternDetectionEngine,
  PatternMatcher,
  PatternDetectionResult,
  PatternMatchResult,
  PatternLibraryMetrics,
  PatternAnalytics,
  PatternOptimization,
  PatternValidation,
  PatternDeployment,
  APIResponse,
  APIError
} from '../types/patterns.types';

interface UsePatternLibraryConfig {
  enableRealTime?: boolean;
  enableCaching?: boolean;
  cacheTimeout?: number;
  enableMetrics?: boolean;
  enableOptimization?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  maxRetries?: number;
  errorRetryDelay?: number;
}

interface PatternLibraryState {
  libraries: PatternLibrary[];
  categories: PatternCategory[];
  patterns: Pattern[];
  detectionEngines: PatternDetectionEngine[];
  matchers: PatternMatcher[];
  detectionResults: PatternDetectionResult[];
  matchResults: PatternMatchResult[];
  metrics: PatternLibraryMetrics | null;
  analytics: PatternAnalytics | null;
  optimizations: PatternOptimization[];
  validations: PatternValidation[];
  deployments: PatternDeployment[];
  currentLibrary: PatternLibrary | null;
  currentPattern: Pattern | null;
  loading: boolean;
  error: APIError | null;
  realTimeConnected: boolean;
  lastUpdate: Date | null;
  updateCount: number;
}

interface PatternLibraryOperations {
  // Library Management
  loadLibraries: () => Promise<void>;
  getLibrary: (libraryId: string) => Promise<PatternLibrary | null>;
  createLibrary: (library: Partial<PatternLibrary>) => Promise<PatternLibrary | null>;
  updateLibrary: (libraryId: string, updates: Partial<PatternLibrary>) => Promise<PatternLibrary | null>;
  deleteLibrary: (libraryId: string) => Promise<boolean>;
  
  // Category Management
  loadCategories: (libraryId: string) => Promise<void>;
  createCategory: (libraryId: string, category: Partial<PatternCategory>) => Promise<PatternCategory | null>;
  updateCategory: (libraryId: string, categoryId: string, updates: Partial<PatternCategory>) => Promise<PatternCategory | null>;
  deleteCategory: (libraryId: string, categoryId: string) => Promise<boolean>;
  
  // Pattern Management
  loadPatterns: (libraryId: string, categoryId?: string) => Promise<void>;
  getPattern: (libraryId: string, patternId: string) => Promise<Pattern | null>;
  createPattern: (libraryId: string, categoryId: string, pattern: Partial<Pattern>) => Promise<Pattern | null>;
  updatePattern: (libraryId: string, patternId: string, updates: Partial<Pattern>) => Promise<Pattern | null>;
  deletePattern: (libraryId: string, patternId: string) => Promise<boolean>;
  
  // Detection Engine Management
  loadDetectionEngines: () => Promise<void>;
  createDetectionEngine: (engine: Partial<PatternDetectionEngine>) => Promise<PatternDetectionEngine | null>;
  updateDetectionEngine: (engineId: string, updates: Partial<PatternDetectionEngine>) => Promise<PatternDetectionEngine | null>;
  
  // Pattern Detection
  startPatternDetection: (request: any) => Promise<PatternDetectionResult | null>;
  getDetectionResults: (detectionId: string) => Promise<PatternDetectionResult | null>;
  
  // Pattern Matching
  loadPatternMatchers: () => Promise<void>;
  createPatternMatcher: (matcher: Partial<PatternMatcher>) => Promise<PatternMatcher | null>;
  executePatternMatching: (request: any) => Promise<PatternMatchResult | null>;
  getMatchingResults: (matchId: string) => Promise<PatternMatchResult | null>;
  
  // Analytics
  getPatternAnalytics: (request: any) => Promise<PatternAnalytics | null>;
  getLibraryMetrics: (libraryId: string) => Promise<PatternLibraryMetrics | null>;
  
  // Optimization
  startPatternOptimization: (request: any) => Promise<PatternOptimization | null>;
  getOptimizationResults: (optimizationId: string) => Promise<PatternOptimization | null>;
  applyOptimization: (optimizationId: string) => Promise<boolean>;
  
  // Validation
  validatePattern: (patternId: string, options?: any) => Promise<PatternValidation | null>;
  getValidationResults: (validationId: string) => Promise<PatternValidation | null>;
  
  // Deployment
  deployPattern: (patternId: string, options: any) => Promise<PatternDeployment | null>;
  getDeploymentStatus: (deploymentId: string) => Promise<PatternDeployment | null>;
  
  // Utility Operations
  refreshData: () => Promise<void>;
  clearCache: () => void;
  resetState: () => void;
}

export const usePatternLibrary = (config: UsePatternLibraryConfig = {}): [PatternLibraryState, PatternLibraryOperations] => {
  const hookConfig = useMemo(() => ({
    enableRealTime: true,
    enableCaching: true,
    cacheTimeout: 300000,
    enableMetrics: true,
    enableOptimization: true,
    autoRefresh: true,
    refreshInterval: 30000,
    maxRetries: 3,
    errorRetryDelay: 1000,
    ...config
  }), [config]);

  const [state, setState] = useState<PatternLibraryState>({
    libraries: [],
    categories: [],
    patterns: [],
    detectionEngines: [],
    matchers: [],
    detectionResults: [],
    matchResults: [],
    metrics: null,
    analytics: null,
    optimizations: [],
    validations: [],
    deployments: [],
    currentLibrary: null,
    currentPattern: null,
    loading: false,
    error: null,
    realTimeConnected: false,
    lastUpdate: null,
    updateCount: 0
  });

  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wsUnsubscribeRef = useRef<(() => void) | null>(null);
  const cacheRef = useRef<Map<string, { data: any; timestamp: number }>>(new Map());

  const updateState = useCallback((updates: Partial<PatternLibraryState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleError = useCallback(async (error: APIError, operation: () => Promise<any>, retryCount = 0) => {
    console.error('Pattern Library operation error:', error);
    updateState({ error, loading: false });

    if (retryCount < hookConfig.maxRetries) {
      setTimeout(async () => {
        try {
          await operation();
        } catch (retryError) {
          await handleError(retryError as APIError, operation, retryCount + 1);
        }
      }, hookConfig.errorRetryDelay * Math.pow(2, retryCount));
    }
  }, [hookConfig.maxRetries, hookConfig.errorRetryDelay, updateState]);

  const getCachedData = useCallback((key: string) => {
    if (!hookConfig.enableCaching) return null;
    const cached = cacheRef.current.get(key);
    if (cached && Date.now() - cached.timestamp < hookConfig.cacheTimeout) {
      return cached.data;
    }
    return null;
  }, [hookConfig.enableCaching, hookConfig.cacheTimeout]);

  const setCachedData = useCallback((key: string, data: any) => {
    if (hookConfig.enableCaching) {
      cacheRef.current.set(key, { data, timestamp: Date.now() });
    }
  }, [hookConfig.enableCaching]);

  // Library Management
  const loadLibraries = useCallback(async () => {
    const cacheKey = 'pattern-libraries';
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      updateState({ libraries: cachedData });
      return;
    }

    updateState({ loading: true, error: null });
    try {
      const response = await patternLibraryAPIService.getPatternLibraries();
      if (response.success) {
        updateState({ libraries: response.data, loading: false });
        setCachedData(cacheKey, response.data);
      }
    } catch (error) {
      await handleError(error as APIError, loadLibraries);
    }
  }, [getCachedData, setCachedData, updateState, handleError]);

  const getLibrary = useCallback(async (libraryId: string): Promise<PatternLibrary | null> => {
    try {
      const response = await patternLibraryAPIService.getPatternLibrary(libraryId);
      if (response.success) {
        updateState({ currentLibrary: response.data });
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => getLibrary(libraryId));
    }
    return null;
  }, [updateState, handleError]);

  const createLibrary = useCallback(async (library: Partial<PatternLibrary>): Promise<PatternLibrary | null> => {
    updateState({ loading: true, error: null });
    try {
      const response = await patternLibraryAPIService.createPatternLibrary(library);
      if (response.success) {
        updateState(prev => ({
          libraries: [...prev.libraries, response.data],
          currentLibrary: response.data,
          loading: false
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => createLibrary(library));
    }
    return null;
  }, [updateState, handleError]);

  const updateLibrary = useCallback(async (libraryId: string, updates: Partial<PatternLibrary>): Promise<PatternLibrary | null> => {
    try {
      const response = await patternLibraryAPIService.updatePatternLibrary(libraryId, updates);
      if (response.success) {
        updateState(prev => ({
          libraries: prev.libraries.map(lib => 
            lib.id === libraryId ? { ...lib, ...response.data } : lib
          )
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => updateLibrary(libraryId, updates));
    }
    return null;
  }, [updateState, handleError]);

  const deleteLibrary = useCallback(async (libraryId: string): Promise<boolean> => {
    try {
      const response = await patternLibraryAPIService.deletePatternLibrary(libraryId);
      if (response.success) {
        updateState(prev => ({
          libraries: prev.libraries.filter(lib => lib.id !== libraryId)
        }));
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => deleteLibrary(libraryId));
    }
    return false;
  }, [updateState, handleError]);

  // Category Management
  const loadCategories = useCallback(async (libraryId: string) => {
    const cacheKey = `pattern-categories-${libraryId}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      updateState({ categories: cachedData });
      return;
    }

    try {
      const response = await patternLibraryAPIService.getPatternCategories(libraryId);
      if (response.success) {
        updateState({ categories: response.data });
        setCachedData(cacheKey, response.data);
      }
    } catch (error) {
      await handleError(error as APIError, () => loadCategories(libraryId));
    }
  }, [getCachedData, setCachedData, updateState, handleError]);

  const createCategory = useCallback(async (libraryId: string, category: Partial<PatternCategory>): Promise<PatternCategory | null> => {
    try {
      const response = await patternLibraryAPIService.createPatternCategory(libraryId, category);
      if (response.success) {
        updateState(prev => ({
          categories: [...prev.categories, response.data]
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => createCategory(libraryId, category));
    }
    return null;
  }, [updateState, handleError]);

  const updateCategory = useCallback(async (libraryId: string, categoryId: string, updates: Partial<PatternCategory>): Promise<PatternCategory | null> => {
    try {
      const response = await patternLibraryAPIService.updatePatternCategory(libraryId, categoryId, updates);
      if (response.success) {
        updateState(prev => ({
          categories: prev.categories.map(cat => 
            cat.id === categoryId ? { ...cat, ...response.data } : cat
          )
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => updateCategory(libraryId, categoryId, updates));
    }
    return null;
  }, [updateState, handleError]);

  const deleteCategory = useCallback(async (libraryId: string, categoryId: string): Promise<boolean> => {
    try {
      const response = await patternLibraryAPIService.deletePatternCategory(libraryId, categoryId);
      if (response.success) {
        updateState(prev => ({
          categories: prev.categories.filter(cat => cat.id !== categoryId)
        }));
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => deleteCategory(libraryId, categoryId));
    }
    return false;
  }, [updateState, handleError]);

  // Pattern Management
  const loadPatterns = useCallback(async (libraryId: string, categoryId?: string) => {
    const cacheKey = `patterns-${libraryId}-${categoryId || 'all'}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      updateState({ patterns: cachedData });
      return;
    }

    try {
      const response = await patternLibraryAPIService.getPatterns(libraryId, categoryId);
      if (response.success) {
        updateState({ patterns: response.data });
        setCachedData(cacheKey, response.data);
      }
    } catch (error) {
      await handleError(error as APIError, () => loadPatterns(libraryId, categoryId));
    }
  }, [getCachedData, setCachedData, updateState, handleError]);

  const getPattern = useCallback(async (libraryId: string, patternId: string): Promise<Pattern | null> => {
    try {
      const response = await patternLibraryAPIService.getPattern(libraryId, patternId);
      if (response.success) {
        updateState({ currentPattern: response.data });
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => getPattern(libraryId, patternId));
    }
    return null;
  }, [updateState, handleError]);

  const createPattern = useCallback(async (libraryId: string, categoryId: string, pattern: Partial<Pattern>): Promise<Pattern | null> => {
    updateState({ loading: true, error: null });
    try {
      const response = await patternLibraryAPIService.createPattern(libraryId, categoryId, pattern);
      if (response.success) {
        updateState(prev => ({
          patterns: [...prev.patterns, response.data],
          currentPattern: response.data,
          loading: false
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => createPattern(libraryId, categoryId, pattern));
    }
    return null;
  }, [updateState, handleError]);

  const updatePattern = useCallback(async (libraryId: string, patternId: string, updates: Partial<Pattern>): Promise<Pattern | null> => {
    try {
      const response = await patternLibraryAPIService.updatePattern(libraryId, patternId, updates);
      if (response.success) {
        updateState(prev => ({
          patterns: prev.patterns.map(pattern => 
            pattern.id === patternId ? { ...pattern, ...response.data } : pattern
          )
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => updatePattern(libraryId, patternId, updates));
    }
    return null;
  }, [updateState, handleError]);

  const deletePattern = useCallback(async (libraryId: string, patternId: string): Promise<boolean> => {
    try {
      const response = await patternLibraryAPIService.deletePattern(libraryId, patternId);
      if (response.success) {
        updateState(prev => ({
          patterns: prev.patterns.filter(pattern => pattern.id !== patternId)
        }));
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => deletePattern(libraryId, patternId));
    }
    return false;
  }, [updateState, handleError]);

  // Detection Engine Management
  const loadDetectionEngines = useCallback(async () => {
    const cacheKey = 'detection-engines';
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      updateState({ detectionEngines: cachedData });
      return;
    }

    try {
      const response = await patternLibraryAPIService.getDetectionEngines();
      if (response.success) {
        updateState({ detectionEngines: response.data });
        setCachedData(cacheKey, response.data);
      }
    } catch (error) {
      await handleError(error as APIError, loadDetectionEngines);
    }
  }, [getCachedData, setCachedData, updateState, handleError]);

  const createDetectionEngine = useCallback(async (engine: Partial<PatternDetectionEngine>): Promise<PatternDetectionEngine | null> => {
    try {
      const response = await patternLibraryAPIService.createDetectionEngine(engine);
      if (response.success) {
        updateState(prev => ({
          detectionEngines: [...prev.detectionEngines, response.data]
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => createDetectionEngine(engine));
    }
    return null;
  }, [updateState, handleError]);

  const updateDetectionEngine = useCallback(async (engineId: string, updates: Partial<PatternDetectionEngine>): Promise<PatternDetectionEngine | null> => {
    try {
      const response = await patternLibraryAPIService.updateDetectionEngine(engineId, updates);
      if (response.success) {
        updateState(prev => ({
          detectionEngines: prev.detectionEngines.map(engine => 
            engine.id === engineId ? { ...engine, ...response.data } : engine
          )
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => updateDetectionEngine(engineId, updates));
    }
    return null;
  }, [updateState, handleError]);

  // Pattern Detection
  const startPatternDetection = useCallback(async (request: any): Promise<PatternDetectionResult | null> => {
    updateState({ loading: true, error: null });
    try {
      const response = await patternLibraryAPIService.startPatternDetection(request);
      if (response.success) {
        updateState(prev => ({
          detectionResults: [...prev.detectionResults, response.data],
          loading: false
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => startPatternDetection(request));
    }
    return null;
  }, [updateState, handleError]);

  const getDetectionResults = useCallback(async (detectionId: string): Promise<PatternDetectionResult | null> => {
    try {
      const response = await patternLibraryAPIService.getDetectionResults(detectionId);
      if (response.success) {
        updateState(prev => ({
          detectionResults: prev.detectionResults.map(result => 
            result.id === detectionId ? response.data : result
          )
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => getDetectionResults(detectionId));
    }
    return null;
  }, [updateState, handleError]);

  // Pattern Matching
  const loadPatternMatchers = useCallback(async () => {
    const cacheKey = 'pattern-matchers';
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      updateState({ matchers: cachedData });
      return;
    }

    try {
      const response = await patternLibraryAPIService.getPatternMatchers();
      if (response.success) {
        updateState({ matchers: response.data });
        setCachedData(cacheKey, response.data);
      }
    } catch (error) {
      await handleError(error as APIError, loadPatternMatchers);
    }
  }, [getCachedData, setCachedData, updateState, handleError]);

  const createPatternMatcher = useCallback(async (matcher: Partial<PatternMatcher>): Promise<PatternMatcher | null> => {
    try {
      const response = await patternLibraryAPIService.createPatternMatcher(matcher);
      if (response.success) {
        updateState(prev => ({
          matchers: [...prev.matchers, response.data]
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => createPatternMatcher(matcher));
    }
    return null;
  }, [updateState, handleError]);

  const executePatternMatching = useCallback(async (request: any): Promise<PatternMatchResult | null> => {
    updateState({ loading: true, error: null });
    try {
      const response = await patternLibraryAPIService.executePatternMatching(request);
      if (response.success) {
        updateState(prev => ({
          matchResults: [...prev.matchResults, response.data],
          loading: false
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => executePatternMatching(request));
    }
    return null;
  }, [updateState, handleError]);

  const getMatchingResults = useCallback(async (matchId: string): Promise<PatternMatchResult | null> => {
    try {
      const response = await patternLibraryAPIService.getMatchingResults(matchId);
      if (response.success) {
        updateState(prev => ({
          matchResults: prev.matchResults.map(result => 
            result.id === matchId ? response.data : result
          )
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => getMatchingResults(matchId));
    }
    return null;
  }, [updateState, handleError]);

  // Analytics
  const getPatternAnalytics = useCallback(async (request: any): Promise<PatternAnalytics | null> => {
    try {
      const response = await patternLibraryAPIService.getPatternAnalytics(request);
      if (response.success) {
        updateState({ analytics: response.data });
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => getPatternAnalytics(request));
    }
    return null;
  }, [updateState, handleError]);

  const getLibraryMetrics = useCallback(async (libraryId: string): Promise<PatternLibraryMetrics | null> => {
    try {
      const response = await patternLibraryAPIService.getLibraryMetrics(libraryId);
      if (response.success) {
        updateState({ metrics: response.data });
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => getLibraryMetrics(libraryId));
    }
    return null;
  }, [updateState, handleError]);

  // Optimization
  const startPatternOptimization = useCallback(async (request: any): Promise<PatternOptimization | null> => {
    updateState({ loading: true, error: null });
    try {
      const response = await patternLibraryAPIService.startPatternOptimization(request);
      if (response.success) {
        updateState(prev => ({
          optimizations: [...prev.optimizations, response.data],
          loading: false
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => startPatternOptimization(request));
    }
    return null;
  }, [updateState, handleError]);

  const getOptimizationResults = useCallback(async (optimizationId: string): Promise<PatternOptimization | null> => {
    try {
      const response = await patternLibraryAPIService.getOptimizationResults(optimizationId);
      if (response.success) {
        updateState(prev => ({
          optimizations: prev.optimizations.map(opt => 
            opt.id === optimizationId ? response.data : opt
          )
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => getOptimizationResults(optimizationId));
    }
    return null;
  }, [updateState, handleError]);

  const applyOptimization = useCallback(async (optimizationId: string): Promise<boolean> => {
    try {
      const response = await patternLibraryAPIService.applyOptimization(optimizationId);
      if (response.success) {
        updateState(prev => ({
          optimizations: prev.optimizations.map(opt => 
            opt.id === optimizationId ? { ...opt, status: 'applied' } : opt
          )
        }));
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => applyOptimization(optimizationId));
    }
    return false;
  }, [updateState, handleError]);

  // Validation
  const validatePattern = useCallback(async (patternId: string, options?: any): Promise<PatternValidation | null> => {
    try {
      const response = await patternLibraryAPIService.validatePattern(patternId, options);
      if (response.success) {
        updateState(prev => ({
          validations: [...prev.validations, response.data]
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => validatePattern(patternId, options));
    }
    return null;
  }, [updateState, handleError]);

  const getValidationResults = useCallback(async (validationId: string): Promise<PatternValidation | null> => {
    try {
      const response = await patternLibraryAPIService.getValidationResults(validationId);
      if (response.success) {
        updateState(prev => ({
          validations: prev.validations.map(val => 
            val.id === validationId ? response.data : val
          )
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => getValidationResults(validationId));
    }
    return null;
  }, [updateState, handleError]);

  // Deployment
  const deployPattern = useCallback(async (patternId: string, options: any): Promise<PatternDeployment | null> => {
    updateState({ loading: true, error: null });
    try {
      const response = await patternLibraryAPIService.deployPattern(patternId, options);
      if (response.success) {
        updateState(prev => ({
          deployments: [...prev.deployments, response.data],
          loading: false
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => deployPattern(patternId, options));
    }
    return null;
  }, [updateState, handleError]);

  const getDeploymentStatus = useCallback(async (deploymentId: string): Promise<PatternDeployment | null> => {
    try {
      const response = await patternLibraryAPIService.getDeploymentStatus(deploymentId);
      if (response.success) {
        updateState(prev => ({
          deployments: prev.deployments.map(dep => 
            dep.id === deploymentId ? response.data : dep
          )
        }));
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => getDeploymentStatus(deploymentId));
    }
    return null;
  }, [updateState, handleError]);

  // Utility Operations
  const refreshData = useCallback(async () => {
    updateState({ loading: true, error: null });
    try {
      await Promise.all([
        loadLibraries(),
        loadDetectionEngines(),
        loadPatternMatchers()
      ]);
      updateState({ 
        loading: false, 
        lastUpdate: new Date(),
        updateCount: state.updateCount + 1
      });
    } catch (error) {
      await handleError(error as APIError, refreshData);
    }
  }, [loadLibraries, loadDetectionEngines, loadPatternMatchers, state.updateCount, updateState, handleError]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const resetState = useCallback(() => {
    setState({
      libraries: [],
      categories: [],
      patterns: [],
      detectionEngines: [],
      matchers: [],
      detectionResults: [],
      matchResults: [],
      metrics: null,
      analytics: null,
      optimizations: [],
      validations: [],
      deployments: [],
      currentLibrary: null,
      currentPattern: null,
      loading: false,
      error: null,
      realTimeConnected: false,
      lastUpdate: null,
      updateCount: 0
    });
    clearCache();
  }, [clearCache]);

  // Effects
  useEffect(() => {
    if (hookConfig.enableRealTime) {
      const unsubscribe = patternLibraryAPIService.subscribe('pattern_updated', (data) => {
        updateState(prev => ({
          ...prev,
          lastUpdate: new Date(),
          updateCount: prev.updateCount + 1,
          realTimeConnected: true
        }));
      });
      wsUnsubscribeRef.current = unsubscribe;
      return () => {
        if (wsUnsubscribeRef.current) {
          wsUnsubscribeRef.current();
        }
      };
    }
  }, [hookConfig.enableRealTime, updateState]);

  useEffect(() => {
    if (hookConfig.autoRefresh && hookConfig.refreshInterval > 0) {
      refreshTimerRef.current = setInterval(refreshData, hookConfig.refreshInterval);
      return () => {
        if (refreshTimerRef.current) {
          clearInterval(refreshTimerRef.current);
        }
      };
    }
  }, [hookConfig.autoRefresh, hookConfig.refreshInterval, refreshData]);

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
      if (wsUnsubscribeRef.current) {
        wsUnsubscribeRef.current();
      }
    };
  }, []);

  const operations: PatternLibraryOperations = {
    // Library Management
    loadLibraries,
    getLibrary,
    createLibrary,
    updateLibrary,
    deleteLibrary,
    
    // Category Management
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    
    // Pattern Management
    loadPatterns,
    getPattern,
    createPattern,
    updatePattern,
    deletePattern,
    
    // Detection Engine Management
    loadDetectionEngines,
    createDetectionEngine,
    updateDetectionEngine,
    
    // Pattern Detection
    startPatternDetection,
    getDetectionResults,
    
    // Pattern Matching
    loadPatternMatchers,
    createPatternMatcher,
    executePatternMatching,
    getMatchingResults,
    
    // Analytics
    getPatternAnalytics,
    getLibraryMetrics,
    
    // Optimization
    startPatternOptimization,
    getOptimizationResults,
    applyOptimization,
    
    // Validation
    validatePattern,
    getValidationResults,
    
    // Deployment
    deployPattern,
    getDeploymentStatus,
    
    // Utility Operations
    refreshData,
    clearCache,
    resetState
  };

  return [state, operations];
};

export default usePatternLibrary;