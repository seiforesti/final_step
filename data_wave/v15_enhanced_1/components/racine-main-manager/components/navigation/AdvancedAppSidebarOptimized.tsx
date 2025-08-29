"use client";

import React from "react";
import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useDeferredValue,
  useTransition,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";

// Animation and Layout Constants
const ANIMATION_CONFIG = {
  duration: 0.2,
  ease: "easeInOut",
} as const;

const SIDEBAR_WIDTHS = {
  expanded: 280,
  collapsed: 64,
  mini: 48,
} as const;

// Import existing SPAs and RACINE feature metadata...

// Performance monitoring hook with batching
const usePerformanceMonitor = () => {
  const metricsRef = useRef({
    renderTime: 0,
    memoryUsage: 0,
    apiLatency: 0,
    lastUpdate: 0
  });
  const [metrics, setMetrics] = useState(metricsRef.current);
  
  const updateMetrics = useCallback((updates: Partial<typeof metricsRef.current>) => {
    const now = Date.now();
    // Only update metrics every 1000ms to prevent excessive renders
    if (now - metricsRef.current.lastUpdate > 1000) {
      metricsRef.current = {
        ...metricsRef.current,
        ...updates,
        lastUpdate: now
      };
      setMetrics(metricsRef.current);
    }
  }, []);

  const measureRender = useCallback((startTime: number) => {
    updateMetrics({ renderTime: performance.now() - startTime });
  }, [updateMetrics]);

  const measureApiCall = useCallback(async (apiCall: () => Promise<any>) => {
    const start = performance.now();
    try {
      const result = await apiCall();
      updateMetrics({ apiLatency: performance.now() - start });
      return result;
    } catch (error) {
      updateMetrics({ apiLatency: performance.now() - start });
      throw error;
    }
  }, [updateMetrics]);

  return { metrics, measureRender, measureApiCall };
};

// Health monitoring with batched updates
const useHealthMonitor = () => {
  const [healthStatus, setHealthStatus] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const healthCheckQueue = useRef<Array<{ endpoint: string; key: string }>>([]);
  const isProcessing = useRef(false);

  const processHealthCheckQueue = useCallback(async () => {
    if (isProcessing.current || healthCheckQueue.current.length === 0) return;
    
    isProcessing.current = true;
    const batchSize = 3; // Process 3 health checks at a time
    
    try {
      while (healthCheckQueue.current.length > 0) {
        const batch = healthCheckQueue.current.splice(0, batchSize);
        await Promise.all(batch.map(async ({ endpoint, key }) => {
          try {
            const response = await fetch(endpoint);
            const status = response.ok ? "healthy" : "error";
            setHealthStatus(prev => ({ ...prev, [key]: status }));
          } catch (error) {
            setHealthStatus(prev => ({ ...prev, [key]: "error" }));
          }
        }));
        
        // Small delay between batches to prevent UI blocking
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } finally {
      isProcessing.current = false;
    }
  }, []);

  const checkHealth = useCallback(async (endpoint: string, key: string) => {
    healthCheckQueue.current.push({ endpoint, key });
    processHealthCheckQueue();
  }, [processHealthCheckQueue]);

  const refreshAllHealth = useCallback(async () => {
    const healthChecks = [
      ...Object.entries(EXISTING_SPA_METADATA).map(([key, metadata]) => 
        checkHealth(metadata.healthEndpoint, key)
      ),
      ...Object.entries(RACINE_FEATURE_METADATA).map(([key, metadata]) => 
        checkHealth(metadata.healthEndpoint, key)
      )
    ];
    
    await Promise.allSettled(healthChecks);
  }, [checkHealth]);

  return { healthStatus, loading, checkHealth, refreshAllHealth };
};

export const AdvancedAppSidebar: React.FC<AdvancedAppSidebarProps> = ({
  className,
  onQuickActionsTrigger,
  isQuickActionsSidebarOpen = false,
  isCollapsed: externalCollapsed,
  onCollapsedChange,
}) => {
  const startTime = useRef(performance.now());
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const statusUpdateRef = useRef<NodeJS.Timeout>();
  
  // Performance monitoring
  const { metrics, measureRender, measureApiCall } = usePerformanceMonitor();
  
  // Health monitoring with batched updates
  const { healthStatus, loading: healthLoading, refreshAllHealth } = useHealthMonitor();

  // Debounced search state
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [isPending, startTransition] = useTransition();

  // Core state management
  const [state, setState] = useState<SidebarState>({
    collapsed: false,
    expandedSections: {
      spas: true,
      racine: true,
      favorites: true,
      recent: false,
    },
    favorites: [],
    recentItems: [],
    isPinned: false,
    loading: false,
    error: null,
    healthStatus: {},
    performanceMetrics: {
      renderTime: 0,
      memoryUsage: 0,
      apiLatency: 0,
    },
  });

  // Memoized handlers to prevent re-renders
  const handleSearchChange = useCallback((value: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      startTransition(() => {
        setSearchQuery(value);
      });
    }, 150); // Debounce time
  }, []);

  // Filter items with deferred value
  const filteredSPAs = useMemo(() => {
    if (!deferredSearchQuery) return accessibleSPAs;
    const query = deferredSearchQuery.toLowerCase();
    return accessibleSPAs.filter(([spaKey, metadata]) => {
      return (
        metadata.name.toLowerCase().includes(query) ||
        metadata.description.toLowerCase().includes(query) ||
        metadata.category.toLowerCase().includes(query) ||
        metadata.keywords?.some(keyword => keyword.toLowerCase().includes(query))
      );
    });
  }, [accessibleSPAs, deferredSearchQuery]);

  const filteredRacineFeatures = useMemo(() => {
    if (!deferredSearchQuery) return Object.entries(RACINE_FEATURE_METADATA);
    const query = deferredSearchQuery.toLowerCase();
    return Object.entries(RACINE_FEATURE_METADATA).filter(([featureKey, metadata]) => {
      return (
        metadata.name.toLowerCase().includes(query) ||
        metadata.description.toLowerCase().includes(query) ||
        metadata.category.toLowerCase().includes(query) ||
        metadata.keywords?.some(keyword => keyword.toLowerCase().includes(query))
      );
    });
  }, [deferredSearchQuery]);

  // Cleanup effects
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (statusUpdateRef.current) {
        clearInterval(statusUpdateRef.current);
      }
    };
  }, []);

  // Measure initial render time
  useEffect(() => {
    measureRender(startTime.current);
  }, [measureRender]);

  // Rest of your component implementation...
  
  return (
    <ErrorBoundary>
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? SIDEBAR_WIDTHS.collapsed : SIDEBAR_WIDTHS.expanded,
        }}
        transition={ANIMATION_CONFIG}
        className={cn(
          "fixed left-0 top-16 bottom-0 z-40",
          "bg-background/95 backdrop-blur-sm border-r border-border/50",
          className
        )}
      >
        {/* Your existing sidebar content */}
      </motion.aside>
    </ErrorBoundary>
  );
};

export default AdvancedAppSidebar;
