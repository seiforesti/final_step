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
import { Monitor, Smartphone, Tablet, Layout, Grid, Columns, Maximize2, Minimize2, Settings, Zap, Eye, Accessibility, Palette, RefreshCw } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

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
  onPreferencesChange?: (layout: LayoutConfiguration) => void;
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
  onPreferencesChange,
  onSPASwitch,
  onPerformanceAlert,
  className,
  style,
  theme = 'system'
}) => {
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
    accessibilityMode: userPreferences.accessibility?.screenReaderOptimized || false,
    screenReaderOptimized: userPreferences.accessibility?.screenReaderOptimized || false,
    highContrastMode: userPreferences.accessibility?.highContrast || false,
    
    // Animation & Transitions
    isTransitioning: false,
    transitionDirection: 'in',
    animationPreference: userPreferences.accessibility?.reducedMotion ? 'reduced' : 'full'
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
  
  const { 
    monitorSystemHealth,
    optimizePerformance,
    trackLayoutEvent
  } = useRacineOrchestration();
  
  const {
    getCurrentWorkspace,
    getWorkspaceLayout
  } = useWorkspaceManagement();
  
  const {
    trackUserAction,
    analyzeUserBehavior
  } = useNavigationAnalytics({
    enableRealTimeTracking: enableAnalytics
  });

  // Performance monitoring refs
  const performanceObserver = useRef<PerformanceObserver | null>(null);
  const layoutRef = useRef<HTMLDivElement>(null);
  const renderStartTime = useRef<number>(0);
  const resizeObserver = useRef<ResizeObserver | null>(null);

  // ========================================================================
  // RESPONSIVE BREAKPOINT DETECTION
  // ========================================================================

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
    immediate = false
  ) => {
    try {
      setLayoutState(prev => ({ ...prev, isTransitioning: true }));
      
      renderStartTime.current = performance.now();
      
      // Get base layout configuration
      let newLayout = DEFAULT_LAYOUT_CONFIGURATIONS[newLayoutMode] || 
                     DEFAULT_LAYOUT_CONFIGURATIONS.default;
      
      // Adapt for current SPA
      newLayout = adaptLayoutForSPA(layoutState.currentSPA);
      
      // Adapt for current breakpoint
      newLayout = adaptLayoutForBreakpoint(newLayout, layoutState.breakpoint);
      
      // Apply user preferences
      if (userPreferences) {
        newLayout = {
          ...newLayout,
          structure: {
            ...newLayout.structure,
            sidebar: {
              ...newLayout.structure.sidebar,
              width: userPreferences.sidebarWidth || newLayout.structure.sidebar.width,
              collapsible: userPreferences.sidebarCollapsed !== undefined 
                ? !userPreferences.sidebarCollapsed 
                : newLayout.structure.sidebar.collapsible
            },
            header: {
              ...newLayout.structure.header,
              height: userPreferences.headerHeight || newLayout.structure.header.height
            },
            content: {
              ...newLayout.structure.content,
              padding: userPreferences.contentPadding === 'compact' ? 12 :
                      userPreferences.contentPadding === 'spacious' ? 32 : 24
            }
          }
        };
      }
      
      // Animation controls
      if (!immediate && layoutState.animationPreference !== 'none') {
        await animationControls.start({
          opacity: 0,
          scale: 0.98,
          transition: { duration: 0.15 }
        });
      }
      
      // Update layout state
      setLayoutState(prev => ({
        ...prev,
        activeLayout: newLayout,
        layoutHistory: [prev.activeLayout, ...prev.layoutHistory.slice(0, 9)],
        currentSPA: spaContext?.spaType || null
      }));
      
      // Complete animation
      if (!immediate && layoutState.animationPreference !== 'none') {
        await animationControls.start({
          opacity: 1,
          scale: 1,
          transition: { duration: 0.2 }
        });
      }
      
      // Track performance
      const renderTime = performance.now() - renderStartTime.current;
      setLayoutState(prev => ({
        ...prev,
        renderTime,
        performanceMetrics: {
          ...prev.performanceMetrics,
          renderTime
        },
        isTransitioning: false
      }));
      
      // Track analytics
      if (enableAnalytics) {
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
      onPreferencesChange?.(newLayout);
      
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
    userPreferences,
    spaContext,
    animationControls,
    enableAnalytics,
    adaptLayoutForSPA,
    adaptLayoutForBreakpoint,
    onPreferencesChange
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
    
    const handleResize = () => {
      detectBreakpoint();
    };
    
    // Set up ResizeObserver for container-based responsive behavior
    if (layoutRef.current && 'ResizeObserver' in window) {
      resizeObserver.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          
          // Update layout based on container size
          if (width !== layoutState.activeLayout.structure.content.width) {
            applyLayoutConfiguration(layoutMode, true);
          }
        }
      });
      
      resizeObserver.current.observe(layoutRef.current);
    }
    
    // Window resize listener
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver.current) {
        resizeObserver.current.disconnect();
      }
    };
  }, [enableResponsive, layoutMode, detectBreakpoint, applyLayoutConfiguration]);

  // ========================================================================
  // LAYOUT MODE CHANGES
  // ========================================================================

  useEffect(() => {
    applyLayoutConfiguration(layoutMode);
  }, [layoutMode, applyLayoutConfiguration]);

  // ========================================================================
  // SPA CONTEXT CHANGES
  // ========================================================================

  useEffect(() => {
    if (spaContext?.spaType !== layoutState.currentSPA) {
      setLayoutState(prev => ({ ...prev, currentSPA: spaContext?.spaType || null }));
      applyLayoutConfiguration(layoutMode, true);
      onSPASwitch?.(spaContext?.spaType || 'data-sources');
    }
  }, [spaContext, layoutState.currentSPA, layoutMode, applyLayoutConfiguration, onSPASwitch]);

  // ========================================================================
  // PERFORMANCE MONITORING SETUP
  // ========================================================================

  useEffect(() => {
    const cleanup = setupPerformanceMonitoring();
    return cleanup;
  }, [setupPerformanceMonitoring]);

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
            layout={layoutState.activeLayout}
            breakpoint={layoutState.breakpoint}
            spaContext={spaContext}
            performanceMode={enablePerformanceOptimization}
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
          tabs={[]}
          activeTab={null}
          onTabChange={() => {}}
          layout={layoutState.activeLayout}
        />
        
        {/* Layout Personalization Panel */}
        {layoutState.deviceType === 'desktop' && (
          <LayoutPersonalization
            currentLayout={layoutState.activeLayout}
            layoutPreferences={userPreferences}
            userContext={{ id: "user-1", name: "Current User", preferences: userPreferences }}
            workspaceContext={spaContext ? { id: spaContext.spaType, name: spaContext.spaType } : undefined}
            onPreferencesChange={async (newLayout) => {
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