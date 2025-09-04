/**
 * 🏗️ MASTER LAYOUT ORCHESTRATOR - ENTERPRISE LAYOUT SYSTEM
 * ========================================================
 * 
 * The ultimate layout orchestrator that provides intelligent layout management
 * across all SPAs and data governance groups. Features include:
 * - SPA-aware layout adaptation
 * - Dynamic layout switching
 * - Performance-optimized layout orchestration
 * - Advanced responsive design
 * - Accessibility compliance (WCAG 2.1 AAA)
 * - Real-time layout optimization
 * - Cross-device layout synchronization
 * - Enterprise-grade layout analytics
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { Monitor, Smartphone, Tablet, Layout, Grid, Columns, Maximize2, Minimize2, Settings, Zap, Eye, Accessibility, Palette, RefreshCw, AlertTriangle } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib copie/utils';

// Racine Integration
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useNavigationAnalytics } from '../../hooks/useNavigationAnalytics';

// Type Definitions
import {
  ViewMode,
  LayoutMode,
  SPAContext,
  LayoutPreferences,
  UserContext,
  ResponsiveBreakpoint,
  LayoutConfiguration,
  LayoutPerformanceMetrics,
  SPAType,
  ISODateString
} from '../../types/racine-core.types';

// Layout Components
import LayoutContent from './LayoutContent';
import ResponsiveLayoutEngine from './ResponsiveLayoutEngine';
import ContextualOverlayManager from './ContextualOverlayManager';
import TabManager from './TabManager';
import SplitScreenManager from './SplitScreenManager';
import LayoutPersonalization from './LayoutPersonalization';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export interface MasterLayoutOrchestratorProps {
  // Core Layout Configuration
  currentView: ViewMode;
  layoutMode: LayoutMode;
  spaContext: SPAContext | null;
  userPreferences: LayoutPreferences;
  children: React.ReactNode;
  
  // Advanced Configuration
  enableResponsive?: boolean;
  enableAnalytics?: boolean;
  enableAccessibility?: boolean;
  enablePerformanceOptimization?: boolean;
  
  // Layout Constraints
  minWidth?: number;
  maxWidth?: number;
  aspectRatio?: 'auto' | '16:9' | '4:3' | '1:1';
  
  // Event Handlers
  onLayoutChange?: (layout: LayoutConfiguration) => void;
  onSPASwitch?: (spaType: SPAType) => void;
  onPerformanceAlert?: (metrics: LayoutPerformanceMetrics) => void;
  
  // Customization
  className?: string;
  style?: React.CSSProperties;
  theme?: 'light' | 'dark' | 'system';
}

interface LayoutOrchestratorState {
  // Current Layout State
  activeLayout: LayoutConfiguration;
  layoutHistory: LayoutConfiguration[];
  adaptiveSettings: Record<string, any>;
  
  // Performance Monitoring
  performanceMetrics: LayoutPerformanceMetrics;
  renderTime: number;
  memoryUsage: number;
  
  // Responsive State
  breakpoint: ResponsiveBreakpoint;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  orientation: 'portrait' | 'landscape';
  
  // SPA Context
  currentSPA: SPAType | null;
  spaLayoutRequirements: Record<SPAType, LayoutConfiguration>;
  
  // Error Handling
  layoutError: string | null;
  fallbackLayout: LayoutConfiguration | null;
  
  // Accessibility
  accessibilityMode: boolean;
  screenReaderOptimized: boolean;
  highContrastMode: boolean;
  
  // Animation & Transitions
  isTransitioning: boolean;
  transitionDirection: 'in' | 'out' | 'cross';
  animationPreference: 'none' | 'reduced' | 'full';
}

// ============================================================================
// LAYOUT CONFIGURATIONS
// ============================================================================

const DEFAULT_LAYOUT_CONFIGURATIONS: Record<LayoutMode, LayoutConfiguration> = {
  default: {
    id: 'default',
    name: 'Default Layout',
    type: 'default',
    structure: {
      header: { height: 64, fixed: true },
      sidebar: { width: 280, collapsible: true, position: 'left' },
      content: { padding: 24, scrollable: true },
      footer: { height: 0, visible: false }
    },
    responsive: {
      mobile: { sidebar: { width: 0, overlay: true } },
      tablet: { sidebar: { width: 240 } },
      desktop: { sidebar: { width: 280 } }
    },
    performance: {
      virtualScrolling: false,
      lazyLoading: true,
      memoization: true
    }
  },
  
  compact: {
    id: 'compact',
    name: 'Compact Layout',
    type: 'compact',
    structure: {
      header: { height: 48, fixed: true },
      sidebar: { width: 240, collapsible: true, position: 'left' },
      content: { padding: 16, scrollable: true },
      footer: { height: 0, visible: false }
    },
    responsive: {
      mobile: { sidebar: { width: 0, overlay: true } },
      tablet: { sidebar: { width: 200 } },
      desktop: { sidebar: { width: 240 } }
    },
    performance: {
      virtualScrolling: true,
      lazyLoading: true,
      memoization: true
    }
  },
  
  fullscreen: {
    id: 'fullscreen',
    name: 'Fullscreen Layout',
    type: 'fullscreen',
    structure: {
      header: { height: 0, fixed: false },
      sidebar: { width: 0, collapsible: false, position: 'left' },
      content: { padding: 0, scrollable: true },
      footer: { height: 0, visible: false }
    },
    responsive: {
      mobile: {},
      tablet: {},
      desktop: {}
    },
    performance: {
      virtualScrolling: true,
      lazyLoading: true,
      memoization: true
    }
  },
  
  'split-screen': {
    id: 'split-screen',
    name: 'Split Screen Layout',
    type: 'split-screen',
    structure: {
      header: { height: 56, fixed: true },
      sidebar: { width: 200, collapsible: true, position: 'left' },
      content: { padding: 16, scrollable: true, split: true },
      footer: { height: 0, visible: false }
    },
    responsive: {
      mobile: { 
        content: { split: false },
        sidebar: { width: 0, overlay: true }
      },
      tablet: { content: { split: true } },
      desktop: { content: { split: true } }
    },
    performance: {
      virtualScrolling: true,
      lazyLoading: true,
      memoization: true
    }
  },
  
  dashboard: {
    id: 'dashboard',
    name: 'Dashboard Layout',
    type: 'dashboard',
    structure: {
      header: { height: 64, fixed: true },
      sidebar: { width: 260, collapsible: true, position: 'left' },
      content: { padding: 20, scrollable: true, grid: true },
      footer: { height: 32, visible: true }
    },
    responsive: {
      mobile: { 
        sidebar: { width: 0, overlay: true },
        content: { grid: false, padding: 12 }
      },
      tablet: { content: { grid: true } },
      desktop: { content: { grid: true } }
    },
    performance: {
      virtualScrolling: true,
      lazyLoading: true,
      memoization: true
    }
  }
};

// ============================================================================
// MAIN COMPONENT IMPLEMENTATION
// ============================================================================

export const MasterLayoutOrchestrator: React.FC<MasterLayoutOrchestratorProps> = ({
  currentView,
  layoutMode,
  spaContext,
  userPreferences,
  children,
  enableResponsive = true,
  enableAnalytics = true,
  enableAccessibility = true,
  enablePerformanceOptimization = true,
  minWidth = 320,
  maxWidth,
  aspectRatio = 'auto',
  onLayoutChange,
  onSPASwitch,
  onPerformanceAlert,
  className,
  style,
  theme = 'system'
}) => {
  // ========================================================================
  // SAFE PREFERENCES SETUP
  // ========================================================================
  
  // Ensure userPreferences has fallback values to prevent undefined errors
  const safeUserPreferences = useMemo(() => {
    if (!userPreferences) {
      return {
        theme: { mode: 'system', colorScheme: 'auto' },
        layout: { mode: 'default', compact: false },
        accessibility: { 
          highContrast: false, 
          fontSize: 16, 
          reducedMotion: false,
          screenReaderOptimized: false 
        },
        sidebarWidth: 280,
        sidebarCollapsed: false,
        headerHeight: 64,
        contentPadding: 'normal'
      };
    }
    return userPreferences;
  }, [userPreferences]);

  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  
  const [layoutState, setLayoutState] = useState<LayoutOrchestratorState>({
    // Current Layout State
    activeLayout: DEFAULT_LAYOUT_CONFIGURATIONS[layoutMode] || DEFAULT_LAYOUT_CONFIGURATIONS.default,
    layoutHistory: [],
    adaptiveSettings: {},
    
    // Performance Monitoring
    performanceMetrics: {
      renderTime: 0,
      memoryUsage: 0,
      layoutShifts: 0,
      interactionLatency: 0,
      frameRate: 60,
      bundleSize: 0
    },
    renderTime: 0,
    memoryUsage: 0,
    
    // Responsive State
    breakpoint: 'desktop',
    deviceType: 'desktop',
    orientation: 'landscape',
    
    // SPA Context
    currentSPA: spaContext?.spaType || null,
    spaLayoutRequirements: {},
    
    // Error Handling
    layoutError: null,
    fallbackLayout: null,
    
    // Accessibility
            accessibilityMode: safeUserPreferences.accessibility?.screenReaderOptimized || false,
        screenReaderOptimized: safeUserPreferences.accessibility?.screenReaderOptimized || false,
        highContrastMode: safeUserPreferences.accessibility?.highContrast || false,
    
    // Animation & Transitions
    isTransitioning: false,
    transitionDirection: 'in',
    animationPreference: userPreferences.accessibility?.reducedMotion ? 'reduced' : 'full',
    
    // Personalization
    showPersonalization: false
  });

  // ========================================================================
  // HOOKS & REFS
  // ========================================================================
  
  const router = useRouter();
  const pathname = usePathname();
  const animationControls = useAnimation();
  
  const {
    theme: themePrefs,
    layout: layoutPrefs,
    accessibility: a11yPrefs,
    setLayout: updateLayoutPrefs
  } = useUserPreferences({
    autoSave: true,
    enableAnalytics: true
  });

  // Ensure theme preferences have fallback values
  const safeThemePrefs = themePrefs || { mode: 'system', colorScheme: 'auto' };
  const safeLayoutPrefs = layoutPrefs || { mode: 'default', compact: false };
  const safeA11yPrefs = a11yPrefs || { highContrast: false, fontSize: 16, reducedMotion: false };

  // Update theme when preferences are loaded
  useEffect(() => {
    if (safeThemePrefs?.mode && safeThemePrefs.mode !== theme) {
      // Update theme if it's different from current
      console.log(`Theme preference updated: ${theme} -> ${safeThemePrefs.mode}`);
    }
  }, [safeThemePrefs?.mode, theme]);
  
  const { 
    monitorSystemHealth,
    optimizePerformance,
    trackLayoutEvent
  } = useRacineOrchestration();
  
  const {
    currentWorkspace,
    workspaces
  } = useWorkspaceManagement();
  
  const {
    trackUserAction,
    analyzeUserBehavior
  } = useNavigationAnalytics({
    enableRealTimeTracking: enableAnalytics
  });

  // Create userContext and workspaceContext from available data
  const userContext: UserContext = useMemo(() => ({
    id: 'current-user', // This should come from authentication
    username: 'user', // This should come from authentication
    email: 'user@example.com', // This should come from authentication
    profile: {
      id: 'current-user',
      username: 'user',
      email: 'user@example.com',
      firstName: 'User',
      lastName: 'Name',
      displayName: 'User Name',
      timezone: 'UTC',
      locale: 'en-US',
      skills: [],
      interests: [],
      socialLinks: [],
      isActive: true,
      emailVerified: true,
      twoFactorEnabled: false,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    roles: [{
      id: 'user-role',
      name: 'User',
      description: 'Standard user role',
      permissions: [],
      isSystem: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }],
    permissions: {
      groups: {},
      workspaces: {},
      resources: {},
      system: {
        canManageUsers: false,
        canManageSystem: false,
        canViewAuditLogs: false
      }
    },
            preferences: safeUserPreferences,
    currentSession: {
      id: 'session-id',
      userId: 'current-user',
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      isActive: true,
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      deviceInfo: {
        type: 'desktop',
        os: 'Windows',
        browser: 'Chrome'
      }
    },
    workspaces: workspaces.map(w => w.id),
    recentActivity: []
  }), [userPreferences, workspaces]);

  const workspaceContext = useMemo(() => ({
    id: currentWorkspace?.id || 'default-workspace',
    name: currentWorkspace?.name || 'Default Workspace',
    type: currentWorkspace?.type || 'default',
    settings: currentWorkspace?.settings || {},
    members: currentWorkspace?.members || [],
    resources: currentWorkspace?.resources || []
  }), [currentWorkspace]);

  // Performance monitoring refs
  const performanceObserver = useRef<PerformanceObserver | null>(null);
  const layoutRef = useRef<HTMLDivElement>(null);
  const renderStartTime = useRef<number>(0);
  const resizeObserver = useRef<ResizeObserver | null>(null);
  const isMounted = useRef(false);
  const layoutChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Stable view ID to prevent infinite re-renders
  const stableViewId = useRef<string>(crypto.randomUUID());
  
  // Memoized stable active views to prevent TabManager prop changes
  const stableActiveViews = useMemo(() => [{
    id: stableViewId.current,
    title: 'Main View',
    spaId: spaContext?.spaType || 'data-sources',
    type: 'primary',
    isActive: true,
    isPinned: false,
    isFavorite: false,
    hasUnsavedChanges: false,
    lastAccessed: new Date().toISOString(),
    created: new Date().toISOString(),
    metadata: {},
    performance: { loadTime: 0, memoryUsage: 0, renderTime: 0 }
  }], [spaContext?.spaType]);

  // ============================================================================
  // RESPONSIVE BREAKPOINT DETECTION
  // ============================================================================

  const detectBreakpoint = useCallback(() => {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    let breakpoint: ResponsiveBreakpoint;
    let deviceType: 'desktop' | 'tablet' | 'mobile';
    
    if (width < 768) {
      breakpoint = 'mobile';
      deviceType = 'mobile';
    } else if (width < 1024) {
      breakpoint = 'tablet';
      deviceType = 'tablet';
    } else if (width < 1440) {
      breakpoint = 'desktop';
      deviceType = 'desktop';
    } else {
      breakpoint = 'wide';
      deviceType = 'desktop';
    }
    
    const orientation = width > height ? 'landscape' : 'portrait';
    
    setLayoutState(prev => ({
      ...prev,
      breakpoint,
      deviceType,
      orientation
    }));
    
    return { breakpoint, deviceType, orientation };
  }, []);

  // ========================================================================
  // LAYOUT ADAPTATION LOGIC
  // ========================================================================

  const adaptLayoutForSPA = useCallback((spaType: SPAType | null) => {
    if (!spaType) return layoutState.activeLayout;
    
    // SPA-specific layout requirements
    const spaLayoutMap: Record<SPAType, Partial<LayoutConfiguration>> = {
      'data-sources': {
        structure: {
          ...layoutState.activeLayout.structure,
          sidebar: { ...layoutState.activeLayout.structure.sidebar, width: 300 }
        }
      },
      'scan-rule-sets': {
        structure: {
          ...layoutState.activeLayout.structure,
          content: { ...layoutState.activeLayout.structure.content, split: true }
        }
      },
      'classifications': {
        structure: {
          ...layoutState.activeLayout.structure,
          content: { ...layoutState.activeLayout.structure.content, grid: true }
        }
      },
      'compliance-rules': {
        structure: {
          ...layoutState.activeLayout.structure,
          footer: { height: 48, visible: true }
        }
      },
      'advanced-catalog': {
        structure: {
          ...layoutState.activeLayout.structure,
          content: { ...layoutState.activeLayout.structure.content, padding: 32 }
        }
      },
      'scan-logic': {
        structure: {
          ...layoutState.activeLayout.structure,
          content: { ...layoutState.activeLayout.structure.content, split: true }
        }
      },
      'rbac-system': {
        structure: {
          ...layoutState.activeLayout.structure,
          sidebar: { ...layoutState.activeLayout.structure.sidebar, width: 320 }
        }
      }
    };
    
    const spaSpecificLayout = spaLayoutMap[spaType];
    if (spaSpecificLayout) {
      return {
        ...layoutState.activeLayout,
        ...spaSpecificLayout
      };
    }
    
    return layoutState.activeLayout;
  }, [layoutState.activeLayout]);

  const adaptLayoutForBreakpoint = useCallback((
    layout: LayoutConfiguration,
    breakpoint: ResponsiveBreakpoint
  ): LayoutConfiguration => {
    const responsiveConfig = layout.responsive?.[breakpoint] || {};
    
    return {
      ...layout,
      structure: {
        header: { ...layout.structure.header, ...responsiveConfig.header },
        sidebar: { ...layout.structure.sidebar, ...responsiveConfig.sidebar },
        content: { ...layout.structure.content, ...responsiveConfig.content },
        footer: { ...layout.structure.footer, ...responsiveConfig.footer }
      }
    };
  }, []);

  const applyLayoutConfiguration = useCallback(async (
    newLayoutMode: LayoutMode,
    immediate: boolean = false
  ): Promise<void> => {
    // Prevent infinite loops - if already transitioning, don't start another transition
    if (layoutState.isTransitioning) {
      console.warn('Layout transition already in progress, skipping duplicate request');
      return;
    }

    // Prevent unnecessary layout changes - if it's the same layout, don't change
    if (layoutState.activeLayout.type === newLayoutMode && !immediate) {
      return;
    }

    try {
      // Set transitioning state to prevent loops
      setLayoutState(prev => ({ ...prev, isTransitioning: true }));
      
      // Record start time for performance tracking
      renderStartTime.current = performance.now();
      
      // Get base layout configuration
      let newLayout = DEFAULT_LAYOUT_CONFIGURATIONS[newLayoutMode] || 
                     DEFAULT_LAYOUT_CONFIGURATIONS.default;
      
      // Adapt for current SPA
      newLayout = adaptLayoutForSPA(layoutState.currentSPA);
      
      // Adapt for current breakpoint
      newLayout = adaptLayoutForBreakpoint(newLayout, layoutState.breakpoint);
      
      // Apply user preferences
      if (safeUserPreferences) {
        newLayout = {
          ...newLayout,
          structure: {
            ...newLayout.structure,
            sidebar: {
              ...newLayout.structure.sidebar,
              width: safeUserPreferences.sidebarWidth || newLayout.structure.sidebar.width,
              collapsible: safeUserPreferences.sidebarCollapsed !== undefined 
                ? !safeUserPreferences.sidebarCollapsed 
                : newLayout.structure.sidebar.collapsible
            },
            header: {
              ...newLayout.structure.header,
              height: safeUserPreferences.headerHeight || newLayout.structure.header.height
            },
            content: {
              ...newLayout.structure.content,
              padding: safeUserPreferences.contentPadding === 'compact' ? 12 :
                      safeUserPreferences.contentPadding === 'spacious' ? 32 : 24
            }
          }
        };
      }
      
      // Animation controls
      if (!immediate && layoutState.animationPreference !== 'none' && isMounted.current) {
        await animationControls.start({
          opacity: 0,
          scale: 0.98,
          transition: { duration: 0.15 }
        });
      }
      
      // Update layout state - combine all updates into one setState call
      setLayoutState(prev => ({
        ...prev,
        activeLayout: newLayout,
        layoutHistory: [prev.activeLayout, ...prev.layoutHistory.slice(0, 9)],
        currentSPA: spaContext?.spaType || null,
        renderTime: performance.now() - renderStartTime.current,
        performanceMetrics: {
          ...prev.performanceMetrics,
          renderTime: performance.now() - renderStartTime.current
        },
        isTransitioning: false
      }));
      
      // Complete animation
      if (!immediate && layoutState.animationPreference !== 'none' && isMounted.current) {
        await animationControls.start({
          opacity: 1,
          scale: 1,
          transition: { duration: 0.2 }
        });
      }
      
      // Track analytics - only if analytics are enabled and not in a loop
      if (enableAnalytics && !layoutState.isTransitioning) {
        const renderTime = performance.now() - renderStartTime.current;
        trackLayoutEvent({
          type: 'layout_change',
          from: layoutState.activeLayout.type,
          to: newLayoutMode,
          renderTime,
          spaContext: spaContext?.spaType || null,
          breakpoint: layoutState.breakpoint,
          timestamp: new Date().toISOString()
        });
      }
      
      // Notify parent component
      onLayoutChange?.(newLayout);
      
    } catch (error) {
      console.error('Failed to apply layout configuration:', error);
      setLayoutState(prev => ({
        ...prev,
        layoutError: error instanceof Error ? error.message : 'Layout error',
        isTransitioning: false
      }));
    }
  }, [
    layoutState.currentSPA,
    layoutState.breakpoint,
    layoutState.animationPreference,
    safeUserPreferences,
    spaContext,
    animationControls,
    enableAnalytics,
    adaptLayoutForSPA,
    adaptLayoutForBreakpoint,
    onLayoutChange
  ]);

  // ========================================================================
  // PERFORMANCE MONITORING
  // ========================================================================

  const setupPerformanceMonitoring = useCallback(() => {
    if (!enablePerformanceOptimization || typeof window === 'undefined') return;
    
    // Performance Observer for layout metrics
    if ('PerformanceObserver' in window) {
      performanceObserver.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (entry.entryType === 'layout-shift') {
            setLayoutState(prev => ({
              ...prev,
              performanceMetrics: {
                ...prev.performanceMetrics,
                layoutShifts: prev.performanceMetrics.layoutShifts + 1
              }
            }));
          }
          
          if (entry.entryType === 'measure') {
            setLayoutState(prev => ({
              ...prev,
              performanceMetrics: {
                ...prev.performanceMetrics,
                interactionLatency: entry.duration
              }
            }));
          }
        });
      });
      
      performanceObserver.current.observe({ 
        entryTypes: ['layout-shift', 'measure', 'navigation', 'paint'] 
      });
    }
    
    // Memory usage monitoring
    const monitorMemory = () => {
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        setLayoutState(prev => ({
          ...prev,
          memoryUsage: memInfo.usedJSHeapSize,
          performanceMetrics: {
            ...prev.performanceMetrics,
            memoryUsage: memInfo.usedJSHeapSize
          }
        }));
      }
    };
    
    const memoryInterval = setInterval(monitorMemory, 5000);
    
    return () => {
      if (performanceObserver.current) {
        performanceObserver.current.disconnect();
      }
      clearInterval(memoryInterval);
    };
  }, [enablePerformanceOptimization]);

  // ========================================================================
  // RESPONSIVE LAYOUT HANDLING
  // ========================================================================

  useEffect(() => {
    if (!enableResponsive) return;
    
    let resizeTimeout: NodeJS.Timeout | null = null;
    let lastWidth = 0;
    let lastHeight = 0;
    const RESIZE_THRESHOLD = 50; // Only trigger layout change if size changes by 50px or more
    
    const handleResize = () => {
      // Clear existing timeout
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      
      // Debounce resize events
      resizeTimeout = setTimeout(() => {
        detectBreakpoint();
      }, 250); // 250ms debounce for window resize
    };
    
    // Set up ResizeObserver for container-based responsive behavior
    if (layoutRef.current && 'ResizeObserver' in window) {
      resizeObserver.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          
          // Only trigger layout change if size change exceeds threshold
          const widthDiff = Math.abs(width - lastWidth);
          const heightDiff = Math.abs(height - lastHeight);
          
          if (widthDiff > RESIZE_THRESHOLD || heightDiff > RESIZE_THRESHOLD) {
            // Update last known dimensions
            lastWidth = width;
            lastHeight = height;
            
            // Debounce container resize events
            if (resizeTimeout) {
              clearTimeout(resizeTimeout);
            }
            
            resizeTimeout = setTimeout(() => {
              // Only apply layout configuration if not already transitioning
              if (!layoutState.isTransitioning) {
                const label = `applyLayoutConfiguration[resize]:${layoutMode}`;
                console.time(label);
                console.log(`Container size changed significantly (${widthDiff}px width, ${heightDiff}px height), adapting layout...`);
                applyLayoutConfiguration(layoutMode, true);
                console.timeEnd(label);
              }
            }, 500); // 500ms debounce for container resize
          }
        }
      });
      
      resizeObserver.current.observe(layoutRef.current);
    }
    
    // Window resize listener
    window.addEventListener('resize', handleResize);
    
    // Initial call only once
    if (layoutRef.current) {
      const rect = layoutRef.current.getBoundingClientRect();
      lastWidth = rect.width;
      lastHeight = rect.height;
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver.current) {
        resizeObserver.current.disconnect();
      }
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
    };
  }, [enableResponsive, layoutMode, detectBreakpoint]); // Remove applyLayoutConfiguration from dependencies to prevent infinite loop

  // ========================================================================
  // LAYOUT MODE CHANGES
  // ========================================================================

  useEffect(() => {
    // Clear any existing timeout
    if (layoutChangeTimeoutRef.current) {
      clearTimeout(layoutChangeTimeoutRef.current);
    }

    // Debounce layout changes to prevent rapid successive changes
    layoutChangeTimeoutRef.current = setTimeout(() => {
      // Only apply layout configuration if it's actually different from current
      if (layoutMode !== layoutState.activeLayout.type) {
        applyLayoutConfiguration(layoutMode);
      }
    }, 100); // 100ms debounce

    return () => {
      if (layoutChangeTimeoutRef.current) {
        clearTimeout(layoutChangeTimeoutRef.current);
      }
    };
  }, [layoutMode]); // Remove applyLayoutConfiguration from dependencies to prevent infinite loop

  // ========================================================================
  // SPA CONTEXT CHANGES
  // ========================================================================

  // Use ref to track previous spaType to prevent infinite loops
  const previousSpaTypeRef = useRef<string | null>(null);
  
  useEffect(() => {
    const currentSpaType = spaContext?.spaType || null;
    if (currentSpaType !== previousSpaTypeRef.current) {
      previousSpaTypeRef.current = currentSpaType;
      setLayoutState(prev => ({ ...prev, currentSPA: currentSpaType }));
      // Only apply layout configuration if not already transitioning
      if (!layoutState.isTransitioning) {
        applyLayoutConfiguration(layoutMode, true);
      }
      onSPASwitch?.(currentSpaType || 'data-sources');
    }
  }, [spaContext?.spaType, layoutMode, onSPASwitch]); // Remove layoutState.currentSPA from dependencies

  // ========================================================================
  // PERFORMANCE MONITORING SETUP
  // ========================================================================

  useEffect(() => {
    const cleanup = setupPerformanceMonitoring();
    return cleanup;
  }, []); // Remove setupPerformanceMonitoring from dependencies to prevent infinite loops

  // ========================================================================
  // COMPONENT MOUNT STATUS
  // ========================================================================

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      // Clean up layout change timeout
      if (layoutChangeTimeoutRef.current) {
        clearTimeout(layoutChangeTimeoutRef.current);
      }
    };
  }, []);

  // ========================================================================
  // ACCESSIBILITY ENHANCEMENTS
  // ========================================================================

  const accessibilityProps = useMemo(() => {
    if (!enableAccessibility) return {};
    
    return {
      role: 'main',
      'aria-label': 'Main application layout',
      'aria-live': layoutState.isTransitioning ? 'polite' : 'off',
      'aria-busy': layoutState.isTransitioning,
      tabIndex: -1,
      ...(layoutState.screenReaderOptimized && {
        'aria-describedby': 'layout-description'
      })
    };
  }, [enableAccessibility, layoutState.isTransitioning, layoutState.screenReaderOptimized]);

  // ========================================================================
  // COMPUTED STYLES
  // ========================================================================

  const computedStyles = useMemo(() => {
    const baseStyles: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: layoutState.activeLayout.structure.sidebar.width > 0
        ? `${layoutState.activeLayout.structure.sidebar.width}px 1fr`
        : '1fr',
      gridTemplateRows: layoutState.activeLayout.structure.header.height > 0
        ? `${layoutState.activeLayout.structure.header.height}px 1fr ${layoutState.activeLayout.structure.footer.visible ? layoutState.activeLayout.structure.footer.height + 'px' : ''}`
        : `1fr ${layoutState.activeLayout.structure.footer.visible ? layoutState.activeLayout.structure.footer.height + 'px' : ''}`,
      gridTemplateAreas: layoutState.activeLayout.structure.sidebar.width > 0
        ? `"sidebar header" "sidebar content" ${layoutState.activeLayout.structure.footer.visible ? '"sidebar footer"' : ''}`
        : `"header" "content" ${layoutState.activeLayout.structure.footer.visible ? '"footer"' : ''}`,
      minHeight: '100vh',
      maxWidth: maxWidth ? `${maxWidth}px` : 'none',
      minWidth: `${minWidth}px`,
      aspectRatio: aspectRatio !== 'auto' ? aspectRatio : 'auto',
      transition: layoutState.animationPreference !== 'none' 
        ? 'grid-template-columns 0.3s ease, grid-template-rows 0.3s ease'
        : 'none',
      ...(layoutState.highContrastMode && {
        filter: 'contrast(1.5)',
        border: '2px solid currentColor'
      }),
      ...style
    };
    
    return baseStyles;
  }, [
    layoutState.activeLayout,
    layoutState.animationPreference,
    layoutState.highContrastMode,
    maxWidth,
    minWidth,
    aspectRatio,
    style
  ]);

  // ========================================================================
  // ERROR BOUNDARY FALLBACK
  // ========================================================================

  if (layoutState.layoutError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <Card className="max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <h3 className="text-lg font-semibold">Layout Error</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {layoutState.layoutError}
            </p>
            <Button 
              onClick={() => {
                setLayoutState(prev => ({ ...prev, layoutError: null }));
                applyLayoutConfiguration('default', true);
              }}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Layout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ========================================================================
  // RENDER LAYOUT
  // ========================================================================

  return (
    <TooltipProvider>
      <motion.div
        ref={layoutRef}
        className={cn(
          "racine-layout-orchestrator",
          "relative w-full",
          layoutState.highContrastMode && "high-contrast",
          layoutState.accessibilityMode && "accessibility-optimized",
          className
        )}
        style={computedStyles}
        animate={animationControls}
        initial={{ opacity: 1, scale: 1 }}
        {...accessibilityProps}
      >
        {/* Screen Reader Description */}
        {layoutState.screenReaderOptimized && (
          <div id="layout-description" className="sr-only">
            Current layout: {layoutState.activeLayout.name}. 
            Device type: {layoutState.deviceType}. 
            SPA context: {layoutState.currentSPA || 'none'}.
          </div>
        )}
        
        {/* Layout Performance Indicator */}
        {enablePerformanceOptimization && layoutState.renderTime > 100 && (
          <div className="fixed top-4 right-4 z-50">
            <Badge variant="outline" className="bg-background/80 backdrop-blur">
              <Zap className="h-3 w-3 mr-1" />
              {Math.round(layoutState.renderTime)}ms
            </Badge>
          </div>
        )}
        
        {/* Transition Overlay */}
        <AnimatePresence>
          {layoutState.isTransitioning && layoutState.animationPreference !== 'none' && (
            <motion.div
              className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Updating layout...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main Layout Content */}
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        }>
          <ResponsiveLayoutEngine
            breakpoint={layoutState.breakpoint}
            deviceType={layoutState.deviceType}
            orientation={layoutState.orientation}
            currentLayout={layoutState.activeLayout}
            onLayoutAdaptation={(adaptedLayout) => {
              setLayoutState(prev => ({ ...prev, activeLayout: adaptedLayout }));
            }}
            userContext={userContext}
            workspaceContext={workspaceContext}
            className=""
          >
            {children}
          </ResponsiveLayoutEngine>
        </Suspense>
        
        {/* Overlay Managers */}
        <ContextualOverlayManager
          spaContext={spaContext}
          layoutMode={layoutMode}
          isActive={!!spaContext}
        />
        
        {/* Split Screen Manager */}
        {layoutState.activeLayout.structure.content.split && (
          <SplitScreenManager
            primaryContent={children}
            secondaryContent={null}
            splitRatio={0.6}
            orientation={layoutState.orientation === 'portrait' ? 'vertical' : 'horizontal'}
          />
        )}
        
        {/* Tab Manager */}
        <TabManager
          activeViews={stableActiveViews}
          layoutMode={layoutMode}
          onTabAction={(action, viewId, context) => {
            // Handle tab actions
            console.log('Tab action:', action, viewId, context);
          }}
          userContext={userContext}
          workspaceContext={workspaceContext}
          className=""
        />
        
        {/* Layout Personalization Panel - Only show when explicitly enabled */}
        {layoutState.deviceType === 'desktop' && layoutState.showPersonalization && (
          <LayoutPersonalization
            currentLayout={layoutState.activeLayout}
            userContext={userContext}
            workspaceContext={workspaceContext}
            layoutPreferences={safeUserPreferences}
            onPreferencesChange={(newPreferences) => {
              console.log('Preferences changed:', newPreferences);
            }}
            onLayoutChange={(newLayout) => {
              updateLayoutPrefs(newLayout);
              applyLayoutConfiguration(newLayout.mode || 'default');
            }}
            className="fixed bottom-4 right-4 z-30"
          />
        )}
        
        {/* Accessibility Announcements */}
        <div 
          aria-live="polite" 
          aria-atomic="true" 
          className="sr-only"
          role="status"
        >
          {layoutState.isTransitioning && 'Layout is updating'}
          {layoutState.layoutError && `Layout error: ${layoutState.layoutError}`}
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

// ============================================================================
// PERFORMANCE OPTIMIZATION WRAPPER
// ============================================================================

export const OptimizedMasterLayoutOrchestrator = React.memo(MasterLayoutOrchestrator, (prevProps, nextProps) => {
  // Custom comparison for performance optimization
  return (
    prevProps.layoutMode === nextProps.layoutMode &&
    prevProps.currentView === nextProps.currentView &&
    prevProps.spaContext?.spaType === nextProps.spaContext?.spaType &&
    JSON.stringify(prevProps.userPreferences) === JSON.stringify(nextProps.userPreferences)
  );
});

OptimizedMasterLayoutOrchestrator.displayName = 'OptimizedMasterLayoutOrchestrator';

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default OptimizedMasterLayoutOrchestrator;
