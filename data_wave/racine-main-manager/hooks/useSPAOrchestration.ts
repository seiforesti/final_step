"use client";

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface SPAContext {
  id: string;
  name: string;
  type: 'rbac' | 'data-sources' | 'scan-rule-sets' | 'classifications' | 'compliance-rules' | 'advanced-catalog' | 'scan-logic';
  status: 'active' | 'inactive' | 'loading' | 'error';
  metadata: Record<string, any>;
  lastAccessed: Date;
  userPermissions: string[];
}

export interface SPAOrchestrationState {
  activeSPAs: SPAContext[];
  currentSPA: SPAContext | null;
  spaHistory: SPAContext[];
  orchestrationMode: 'sequential' | 'parallel' | 'adaptive';
  performanceMetrics: {
    loadTime: number;
    memoryUsage: number;
    cpuUsage: number;
    networkLatency: number;
  };
}

export interface SPANavigationOptions {
  preserveState?: boolean;
  clearHistory?: boolean;
  preloadDependencies?: boolean;
  validatePermissions?: boolean;
}

// =============================================================================
// MOCK API FUNCTIONS
// =============================================================================

const mockSPAOrchestrationAPI = {
  // Get all available SPAs
  getAvailableSPAs: async (): Promise<SPAContext[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [
      {
        id: 'rbac-system',
        name: 'RBAC System',
        type: 'rbac',
        status: 'active',
        metadata: { version: '2.1.0', features: ['role-management', 'permission-control'] },
        lastAccessed: new Date(),
        userPermissions: ['read', 'write', 'admin']
      },
      {
        id: 'data-sources',
        name: 'Data Sources',
        type: 'data-sources',
        status: 'active',
        metadata: { version: '1.8.5', features: ['connection-management', 'monitoring'] },
        lastAccessed: new Date(),
        userPermissions: ['read', 'write']
      },
      {
        id: 'scan-rule-sets',
        name: 'Scan Rule Sets',
        type: 'scan-rule-sets',
        status: 'active',
        metadata: { version: '3.2.1', features: ['rule-engine', 'validation'] },
        lastAccessed: new Date(),
        userPermissions: ['read', 'write', 'execute']
      },
      {
        id: 'classifications',
        name: 'Classifications',
        type: 'classifications',
        status: 'active',
        metadata: { version: '2.0.3', features: ['auto-classification', 'ml-models'] },
        lastAccessed: new Date(),
        userPermissions: ['read', 'write']
      },
      {
        id: 'compliance-rules',
        name: 'Compliance Rules',
        type: 'compliance-rules',
        status: 'active',
        metadata: { version: '1.9.7', features: ['audit-trail', 'compliance-checking'] },
        lastAccessed: new Date(),
        userPermissions: ['read', 'write', 'audit']
      },
      {
        id: 'advanced-catalog',
        name: 'Advanced Catalog',
        type: 'advanced-catalog',
        status: 'active',
        metadata: { version: '4.0.1', features: ['lineage-tracking', 'metadata-management'] },
        lastAccessed: new Date(),
        userPermissions: ['read', 'write', 'admin']
      },
      {
        id: 'scan-logic',
        name: 'Scan Logic',
        type: 'scan-logic',
        status: 'active',
        metadata: { version: '2.5.2', features: ['custom-scanning', 'workflow-engine'] },
        lastAccessed: new Date(),
        userPermissions: ['read', 'write', 'execute']
      }
    ];
  },

  // Navigate to a specific SPA
  navigateToSPA: async (spaId: string, options?: SPANavigationOptions): Promise<SPAContext> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const spas = await mockSPAOrchestrationAPI.getAvailableSPAs();
    const spa = spas.find(s => s.id === spaId);
    if (!spa) {
      throw new Error(`SPA with id ${spaId} not found`);
    }
    return { ...spa, lastAccessed: new Date() };
  },

  // Get SPA performance metrics
  getSPAPerformanceMetrics: async (spaId: string): Promise<SPAOrchestrationState['performanceMetrics']> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return {
      loadTime: Math.random() * 1000 + 200,
      memoryUsage: Math.random() * 50 + 20,
      cpuUsage: Math.random() * 30 + 10,
      networkLatency: Math.random() * 100 + 20
    };
  },

  // Update SPA orchestration mode
  updateOrchestrationMode: async (mode: SPAOrchestrationState['orchestrationMode']): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log(`Orchestration mode updated to: ${mode}`);
  },

  // Preload SPA dependencies
  preloadSPADependencies: async (spaId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`Preloading dependencies for SPA: ${spaId}`);
  }
};

// =============================================================================
// MAIN HOOK
// =============================================================================

export const useSPAOrchestration = () => {
  const queryClient = useQueryClient();
  const [orchestrationState, setOrchestrationState] = useState<SPAOrchestrationState>({
    activeSPAs: [],
    currentSPA: null,
    spaHistory: [],
    orchestrationMode: 'adaptive',
    performanceMetrics: {
      loadTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      networkLatency: 0
    }
  });

  // Query for available SPAs
  const { data: availableSPAs = [], isLoading: isLoadingSPAs } = useQuery(
    ['spa-orchestration', 'available-spas'],
    mockSPAOrchestrationAPI.getAvailableSPAs,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000 // 10 minutes
    }
  );

  // Mutation for navigating to SPA
  const navigateToSPAMutation = useMutation({
    mutationFn: ({ spaId, options }: { spaId: string; options?: SPANavigationOptions }) =>
      mockSPAOrchestrationAPI.navigateToSPA(spaId, options),
    onSuccess: (spa) => {
      setOrchestrationState(prev => ({
        ...prev,
        currentSPA: spa,
        spaHistory: [...prev.spaHistory, spa],
        activeSPAs: prev.activeSPAs.some(s => s.id === spa.id) 
          ? prev.activeSPAs 
          : [...prev.activeSPAs, spa]
      }));
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['spa-orchestration'] });
    }
  });

  // Mutation for updating orchestration mode
  const updateOrchestrationModeMutation = useMutation({
    mutationFn: mockSPAOrchestrationAPI.updateOrchestrationMode,
    onSuccess: (_, mode) => {
      setOrchestrationState(prev => ({
        ...prev,
        orchestrationMode: mode
      }));
    }
  });

  // Navigation functions
  const navigateToSPA = useCallback((spaId: string, options?: SPANavigationOptions) => {
    navigateToSPAMutation.mutate({ spaId, options });
  }, [navigateToSPAMutation]);

  const navigateBack = useCallback(() => {
    setOrchestrationState(prev => {
      const newHistory = [...prev.spaHistory];
      newHistory.pop(); // Remove current
      const previousSPA = newHistory[newHistory.length - 1] || null;
      
      return {
        ...prev,
        currentSPA: previousSPA,
        spaHistory: newHistory
      };
    });
  }, []);

  const clearSPAHistory = useCallback(() => {
    setOrchestrationState(prev => ({
      ...prev,
      spaHistory: [],
      currentSPA: null
    }));
  }, []);

  // Performance monitoring
  const refreshPerformanceMetrics = useCallback(async (spaId?: string) => {
    const targetSpaId = spaId || orchestrationState.currentSPA?.id;
    if (!targetSpaId) return;

    try {
      const metrics = await mockSPAOrchestrationAPI.getSPAPerformanceMetrics(targetSpaId);
      setOrchestrationState(prev => ({
        ...prev,
        performanceMetrics: metrics
      }));
    } catch (error) {
      console.error('Failed to refresh performance metrics:', error);
    }
  }, [orchestrationState.currentSPA?.id]);

  // Preloading
  const preloadSPA = useCallback(async (spaId: string) => {
    try {
      await mockSPAOrchestrationAPI.preloadSPADependencies(spaId);
    } catch (error) {
      console.error('Failed to preload SPA:', error);
    }
  }, []);

  // Computed values
  const canNavigateBack = useMemo(() => {
    return orchestrationState.spaHistory.length > 1;
  }, [orchestrationState.spaHistory.length]);

  const activeSPACount = useMemo(() => {
    return orchestrationState.activeSPAs.length;
  }, [orchestrationState.activeSPAs.length]);

  const isSPAActive = useCallback((spaId: string) => {
    return orchestrationState.activeSPAs.some(spa => spa.id === spaId);
  }, [orchestrationState.activeSPAs]);

  return {
    // State
    orchestrationState,
    availableSPAs,
    currentSPA: orchestrationState.currentSPA,
    activeSPAs: orchestrationState.activeSPAs,
    spaHistory: orchestrationState.spaHistory,
    performanceMetrics: orchestrationState.performanceMetrics,
    
    // Loading states
    isLoadingSPAs,
    isNavigating: navigateToSPAMutation.isPending,
    isUpdatingMode: updateOrchestrationModeMutation.isPending,
    
    // Computed values
    canNavigateBack,
    activeSPACount,
    isSPAActive,
    
    // Actions
    navigateToSPA,
    navigateBack,
    clearSPAHistory,
    refreshPerformanceMetrics,
    preloadSPA,
    updateOrchestrationMode: updateOrchestrationModeMutation.mutate,
    
    // Error handling
    navigationError: navigateToSPAMutation.error,
    modeUpdateError: updateOrchestrationModeMutation.error
  };
};

export default useSPAOrchestration;
