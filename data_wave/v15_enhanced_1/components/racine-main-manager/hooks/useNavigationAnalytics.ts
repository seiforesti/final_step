/**
 * 📊 NAVIGATION ANALYTICS HOOK - ENTERPRISE ANALYTICS SYSTEM
 * ==========================================================
 * 
 * Advanced navigation analytics hook that provides intelligent tracking
 * and insights into user navigation patterns across all SPAs. Features include:
 * - Real-time navigation pattern analysis
 * - User behavior tracking and insights
 * - Performance optimization recommendations
 * - Cross-SPA navigation flow analysis
 * - Advanced heatmap and usage analytics
 * - Predictive navigation suggestions
 * - Enterprise-grade reporting and metrics
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Backend API Integration
import { racineOrchestrationAPI } from '../services/racine-orchestration-apis';
import { crossGroupIntegrationAPI } from '../services/cross-group-integration-apis';
import { activityTrackingAPI } from '../services/activity-tracking-apis';

// Type Definitions
import {
  NavigationPattern,
  RouteMetrics,
  EfficiencyMetrics,
  HeatmapData,
  NavigationPerformance,
  UserBehaviorInsights,
  NavigationPath,
  SPAUsageMetrics,
  SessionAnalytics,
  UUID,
  ISODateString,
  SPAType
} from '../types/racine-core.types';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export interface NavigationAnalyticsState {
  // Core Analytics Data
  userNavigationPattern: NavigationPattern;
  popularRoutes: RouteMetrics[];
  navigationEfficiency: EfficiencyMetrics;
  usageHeatmap: HeatmapData;
  performanceMetrics: NavigationPerformance;
  
  // User Behavior Insights
  behaviorInsights: UserBehaviorInsights;
  sessionAnalytics: SessionAnalytics;
  crossSPAFlows: NavigationPath[];
  
  // SPA-Specific Analytics
  spaUsageMetrics: Record<SPAType, SPAUsageMetrics>;
  mostUsedFeatures: Array<{
    feature: string;
    spaType: SPAType;
    usageCount: number;
    averageTime: number;
  }>;
  
  // Performance & Optimization
  bottlenecks: Array<{
    route: string;
    averageLoadTime: number;
    errorRate: number;
    recommendation: string;
  }>;
  optimizationSuggestions: Array<{
    type: 'performance' | 'usability' | 'accessibility';
    priority: 'high' | 'medium' | 'low';
    description: string;
    implementation: string;
  }>;
  
  // Real-time Tracking
  currentSession: {
    startTime: ISODateString;
    navigationCount: number;
    timeSpent: Record<string, number>;
    currentPath: string;
    previousPath: string | null;
  };
  
  // Analytics Status
  isTracking: boolean;
  isAnalyzing: boolean;
  lastUpdated: ISODateString | null;
  error: string | null;
}

export interface NavigationAnalyticsActions {
  // Tracking Management
  startTracking: () => void;
  stopTracking: () => void;
  pauseTracking: () => void;
  resumeTracking: () => void;
  
  // Event Tracking
  trackNavigation: (from: string, to: string, metadata?: Record<string, any>) => void;
  trackPageView: (path: string, metadata?: Record<string, any>) => void;
  trackUserAction: (action: string, context: string, metadata?: Record<string, any>) => void;
  trackSPAInteraction: (spaType: SPAType, interaction: string, metadata?: Record<string, any>) => void;
  
  // Analytics Queries
  getRouteAnalytics: (route: string, timeRange?: { start: Date; end: Date }) => Promise<RouteMetrics>;
  getSPAAnalytics: (spaType: SPAType, timeRange?: { start: Date; end: Date }) => Promise<SPAUsageMetrics>;
  getUserJourney: (userId?: string, timeRange?: { start: Date; end: Date }) => Promise<NavigationPath[]>;
  getPerformanceInsights: (timeRange?: { start: Date; end: Date }) => Promise<NavigationPerformance>;
  
  // Behavior Analysis
  analyzeUserBehavior: (timeRange?: { start: Date; end: Date }) => Promise<UserBehaviorInsights>;
  identifyUsagePatterns: () => Promise<NavigationPattern[]>;
  generateHeatmap: (spaType?: SPAType) => Promise<HeatmapData>;
  detectAnomalies: () => Promise<Array<{ type: string; description: string; severity: 'low' | 'medium' | 'high' }>>;
  
  // Optimization & Recommendations
  generateOptimizationReport: () => Promise<{
    performanceIssues: any[];
    usabilityImprovements: any[];
    recommendations: any[];
  }>;
  identifyBottlenecks: () => Promise<Array<{ route: string; issue: string; impact: number }>>;
  suggestNavigationImprovements: () => Promise<Array<{ suggestion: string; impact: string }>>;
  
  // Reporting & Export
  generateAnalyticsReport: (format: 'json' | 'csv' | 'pdf', timeRange?: { start: Date; end: Date }) => Promise<Blob>;
  exportHeatmapData: (format: 'json' | 'csv') => Promise<Blob>;
  schedulePeriodicReports: (frequency: 'daily' | 'weekly' | 'monthly', recipients: string[]) => Promise<void>;
  
  // Real-time Analytics
  subscribeToRealTimeAnalytics: (callback: (analytics: Partial<NavigationAnalyticsState>) => void) => () => void;
  getCurrentSessionMetrics: () => SessionAnalytics;
  getLiveUserCount: () => Promise<number>;
  
  // Configuration
  updateTrackingSettings: (settings: {
    enableHeatmap?: boolean;
    enablePerformanceTracking?: boolean;
    enableBehaviorAnalysis?: boolean;
    samplingRate?: number;
  }) => void;
  
  // Data Management
  clearAnalyticsData: (olderThan?: Date) => Promise<void>;
  exportUserData: (userId: string) => Promise<any>;
  anonymizeUserData: (userId: string) => Promise<void>;
}

// ============================================================================
// MAIN HOOK IMPLEMENTATION
// ============================================================================

export const useNavigationAnalytics = (
  options?: {
    enableRealTimeTracking?: boolean;
    enableHeatmapGeneration?: boolean;
    enablePerformanceMonitoring?: boolean;
    trackingInterval?: number;
    maxSessionDuration?: number;
  }
): NavigationAnalyticsState & NavigationAnalyticsActions => {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  
  const [analyticsState, setAnalyticsState] = useState<NavigationAnalyticsState>({
    // Core Analytics Data
    userNavigationPattern: {
      id: '',
      userId: '',
      patterns: [],
      frequency: {},
      preferences: {},
      efficiency: 0,
      commonPaths: [],
      timeSpentPerRoute: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    popularRoutes: [],
    navigationEfficiency: {
      averageNavigationTime: 0,
      successRate: 0,
      bounceRate: 0,
      taskCompletionRate: 0,
      userSatisfactionScore: 0,
      navigationDepth: 0,
      backtrackingRate: 0
    },
    usageHeatmap: {
      id: '',
      data: [],
      maxValue: 0,
      minValue: 0,
      generatedAt: new Date().toISOString(),
      spaType: null,
      timeRange: {
        start: new Date().toISOString(),
        end: new Date().toISOString()
      }
    },
    performanceMetrics: {
      averageLoadTime: 0,
      navigationSpeed: 0,
      errorRate: 0,
      cacheHitRate: 0,
      resourceLoadTime: 0,
      timeToInteractive: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0
    },
    
    // User Behavior Insights
    behaviorInsights: {
      id: '',
      userId: '',
      sessionPatterns: [],
      preferredFeatures: [],
      usageTimeDistribution: {},
      interactionFrequency: {},
      abandonmentPoints: [],
      conversionFunnels: [],
      generatedAt: new Date().toISOString()
    },
    sessionAnalytics: {
      id: '',
      userId: '',
      startTime: new Date().toISOString(),
      endTime: null,
      totalDuration: 0,
      pageViews: 0,
      uniquePageViews: 0,
      bounceRate: 0,
      exitPage: null,
      landingPage: '',
      deviceInfo: {},
      browserInfo: {},
      navigationEvents: []
    },
    crossSPAFlows: [],
    
    // SPA-Specific Analytics
    spaUsageMetrics: {} as Record<SPAType, SPAUsageMetrics>,
    mostUsedFeatures: [],
    
    // Performance & Optimization
    bottlenecks: [],
    optimizationSuggestions: [],
    
    // Real-time Tracking
    currentSession: {
      startTime: new Date().toISOString(),
      navigationCount: 0,
      timeSpent: {},
      currentPath: typeof window !== 'undefined' ? window.location.pathname : '',
      previousPath: null
    },
    
    // Analytics Status
    isTracking: false,
    isAnalyzing: false,
    lastUpdated: null,
    error: null
  });

  // ========================================================================
  // REFS & PERFORMANCE
  // ========================================================================
  
  const trackingInterval = useRef<NodeJS.Timeout | null>(null);
  const sessionStartTime = useRef<Date>(new Date());
  const navigationEvents = useRef<Array<{
    timestamp: Date;
    from: string;
    to: string;
    duration: number;
    metadata?: Record<string, any>;
  }>>([]);
  const performanceObserver = useRef<PerformanceObserver | null>(null);
  const realtimeSubscriptions = useRef<Set<(analytics: Partial<NavigationAnalyticsState>) => void>>(new Set());

  // ========================================================================
  // TRACKING FUNCTIONS
  // ========================================================================

  const startTracking = useCallback(() => {
    if (analyticsState.isTracking) return;
    
    setAnalyticsState(prev => ({ ...prev, isTracking: true }));
    sessionStartTime.current = new Date();
    
    // Set up performance observer
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      performanceObserver.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          trackPerformanceEntry(entry);
        });
      });
      
      performanceObserver.current.observe({ entryTypes: ['navigation', 'resource', 'measure'] });
    }
    
    // Set up periodic analytics updates
    if (options?.enableRealTimeTracking) {
      trackingInterval.current = setInterval(() => {
        updateRealTimeAnalytics();
      }, options?.trackingInterval || 30000); // 30 seconds default
    }
    
    // Track initial page load
    trackPageView(window.location.pathname, {
      sessionStart: true,
      userAgent: navigator.userAgent,
      referrer: document.referrer
    });
    
  }, [analyticsState.isTracking, options]);

  const stopTracking = useCallback(() => {
    setAnalyticsState(prev => ({ ...prev, isTracking: false }));
    
    if (trackingInterval.current) {
      clearInterval(trackingInterval.current);
      trackingInterval.current = null;
    }
    
    if (performanceObserver.current) {
      performanceObserver.current.disconnect();
      performanceObserver.current = null;
    }
    
    // Send final session data
    sendSessionAnalytics();
  }, []);

  const trackNavigation = useCallback((from: string, to: string, metadata?: Record<string, any>) => {
    if (!analyticsState.isTracking) return;
    
    const timestamp = new Date();
    const duration = timestamp.getTime() - (navigationEvents.current[navigationEvents.current.length - 1]?.timestamp.getTime() || sessionStartTime.current.getTime());
    
    const navigationEvent = {
      timestamp,
      from,
      to,
      duration,
      metadata
    };
    
    navigationEvents.current.push(navigationEvent);
    
    // Update current session
    setAnalyticsState(prev => ({
      ...prev,
      currentSession: {
        ...prev.currentSession,
        navigationCount: prev.currentSession.navigationCount + 1,
        previousPath: from,
        currentPath: to,
        timeSpent: {
          ...prev.currentSession.timeSpent,
          [from]: (prev.currentSession.timeSpent[from] || 0) + duration
        }
      }
    }));
    
    // Send to backend
    racineOrchestrationAPI.trackNavigationEvent({
      from,
      to,
      timestamp: timestamp.toISOString(),
      duration,
      sessionId: analyticsState.currentSession.startTime,
      metadata
    }).catch(error => {
      console.warn('Failed to track navigation event:', error);
    });
    
    // Notify real-time subscribers
    realtimeSubscriptions.current.forEach(callback => {
      callback({ currentSession: analyticsState.currentSession });
    });
    
  }, [analyticsState.isTracking, analyticsState.currentSession]);

  const trackPageView = useCallback((path: string, metadata?: Record<string, any>) => {
    if (!analyticsState.isTracking) return;
    
    const timestamp = new Date().toISOString();
    
    // Track page view
    activityTrackingAPI.trackPageView({
      path,
      timestamp,
      sessionId: analyticsState.currentSession.startTime,
      metadata
    }).catch(error => {
      console.warn('Failed to track page view:', error);
    });
    
  }, [analyticsState.isTracking, analyticsState.currentSession.startTime]);

  const trackUserAction = useCallback((action: string, context: string, metadata?: Record<string, any>) => {
    if (!analyticsState.isTracking) return;
    
    racineOrchestrationAPI.trackUserAction({
      action,
      context,
      timestamp: new Date().toISOString(),
      sessionId: analyticsState.currentSession.startTime,
      currentPath: analyticsState.currentSession.currentPath,
      metadata
    }).catch(error => {
      console.warn('Failed to track user action:', error);
    });
    
  }, [analyticsState.isTracking, analyticsState.currentSession]);

  const trackSPAInteraction = useCallback((spaType: SPAType, interaction: string, metadata?: Record<string, any>) => {
    if (!analyticsState.isTracking) return;
    
    crossGroupIntegrationAPI.trackSPAInteraction({
      spaType,
      interaction,
      timestamp: new Date().toISOString(),
      sessionId: analyticsState.currentSession.startTime,
      metadata
    }).catch(error => {
      console.warn('Failed to track SPA interaction:', error);
    });
    
  }, [analyticsState.isTracking, analyticsState.currentSession.startTime]);

  // ========================================================================
  // ANALYTICS FUNCTIONS
  // ========================================================================

  const updateRealTimeAnalytics = useCallback(async () => {
    try {
      setAnalyticsState(prev => ({ ...prev, isAnalyzing: true }));
      
      const [
        routeMetrics,
        performanceData,
        behaviorInsights
      ] = await Promise.all([
        racineOrchestrationAPI.getRealTimeRouteMetrics(),
        racineOrchestrationAPI.getPerformanceMetrics(),
        racineOrchestrationAPI.getBehaviorInsights()
      ]);
      
      setAnalyticsState(prev => ({
        ...prev,
        popularRoutes: routeMetrics,
        performanceMetrics: performanceData,
        behaviorInsights: behaviorInsights,
        lastUpdated: new Date().toISOString(),
        isAnalyzing: false
      }));
      
      // Notify subscribers
      realtimeSubscriptions.current.forEach(callback => {
        callback({
          popularRoutes: routeMetrics,
          performanceMetrics: performanceData,
          behaviorInsights: behaviorInsights
        });
      });
      
    } catch (error: any) {
      console.error('Failed to update real-time analytics:', error);
      setAnalyticsState(prev => ({
        ...prev,
        error: error.message || 'Failed to update analytics',
        isAnalyzing: false
      }));
    }
  }, []);

  const analyzeUserBehavior = useCallback(async (timeRange?: { start: Date; end: Date }): Promise<UserBehaviorInsights> => {
    try {
      const insights = await racineOrchestrationAPI.analyzeUserBehavior({
        timeRange,
        includeSessionData: true,
        includeNavigationPatterns: true
      });
      
      setAnalyticsState(prev => ({
        ...prev,
        behaviorInsights: insights
      }));
      
      return insights;
    } catch (error: any) {
      console.error('Failed to analyze user behavior:', error);
      throw error;
    }
  }, []);

  const generateHeatmap = useCallback(async (spaType?: SPAType): Promise<HeatmapData> => {
    try {
      const heatmapData = await racineOrchestrationAPI.generateNavigationHeatmap({
        spaType,
        includeClickData: true,
        includeScrollData: true,
        includeTimeSpentData: true
      });
      
      setAnalyticsState(prev => ({
        ...prev,
        usageHeatmap: heatmapData
      }));
      
      return heatmapData;
    } catch (error: any) {
      console.error('Failed to generate heatmap:', error);
      throw error;
    }
  }, []);

  const identifyBottlenecks = useCallback(async () => {
    try {
      const bottlenecks = await racineOrchestrationAPI.identifyNavigationBottlenecks({
        includePerformanceData: true,
        includeUserFeedback: true,
        minimumImpact: 0.1
      });
      
      setAnalyticsState(prev => ({
        ...prev,
        bottlenecks: bottlenecks.map(b => ({
          route: b.route,
          averageLoadTime: b.averageLoadTime,
          errorRate: b.errorRate,
          recommendation: b.recommendation
        }))
      }));
      
      return bottlenecks;
    } catch (error: any) {
      console.error('Failed to identify bottlenecks:', error);
      throw error;
    }
  }, []);

  // ========================================================================
  // HELPER FUNCTIONS
  // ========================================================================

  const trackPerformanceEntry = useCallback((entry: PerformanceEntry) => {
    if (entry.entryType === 'navigation') {
      const navEntry = entry as PerformanceNavigationTiming;
      
      setAnalyticsState(prev => ({
        ...prev,
        performanceMetrics: {
          ...prev.performanceMetrics,
          averageLoadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
          timeToInteractive: navEntry.domInteractive - navEntry.navigationStart,
          firstContentfulPaint: navEntry.domContentLoadedEventEnd - navEntry.navigationStart
        }
      }));
    }
  }, []);

  const sendSessionAnalytics = useCallback(async () => {
    try {
      const sessionData = {
        ...analyticsState.currentSession,
        endTime: new Date().toISOString(),
        totalDuration: Date.now() - new Date(analyticsState.currentSession.startTime).getTime(),
        navigationEvents: navigationEvents.current
      };
      
      await activityTrackingAPI.sendSessionAnalytics(sessionData);
    } catch (error) {
      console.error('Failed to send session analytics:', error);
    }
  }, [analyticsState.currentSession]);

  // ========================================================================
  // LIFECYCLE & EFFECTS
  // ========================================================================

  // Auto-start tracking if enabled
  useEffect(() => {
    if (options?.enableRealTimeTracking) {
      startTracking();
    }
    
    return () => {
      stopTracking();
    };
  }, [startTracking, stopTracking, options?.enableRealTimeTracking]);

  // Track route changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleRouteChange = () => {
      const newPath = window.location.pathname;
      const previousPath = analyticsState.currentSession.currentPath;
      
      if (newPath !== previousPath) {
        trackNavigation(previousPath, newPath);
      }
    };
    
    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [trackNavigation, analyticsState.currentSession.currentPath]);

  // ========================================================================
  // RETURN HOOK INTERFACE
  // ========================================================================

  return {
    // State
    ...analyticsState,
    
    // Tracking Management
    startTracking,
    stopTracking,
    pauseTracking: () => setAnalyticsState(prev => ({ ...prev, isTracking: false })),
    resumeTracking: () => setAnalyticsState(prev => ({ ...prev, isTracking: true })),
    
    // Event Tracking
    trackNavigation,
    trackPageView,
    trackUserAction,
    trackSPAInteraction,
    
    // Analytics Queries
    getRouteAnalytics: async (route: string, timeRange?) => {
      return await racineOrchestrationAPI.getRouteAnalytics({ route, timeRange });
    },
    getSPAAnalytics: async (spaType: SPAType, timeRange?) => {
      return await crossGroupIntegrationAPI.getSPAAnalytics({ spaType, timeRange });
    },
    getUserJourney: async (userId?, timeRange?) => {
      return await racineOrchestrationAPI.getUserJourney({ userId, timeRange });
    },
    getPerformanceInsights: async (timeRange?) => {
      return await racineOrchestrationAPI.getPerformanceInsights({ timeRange });
    },
    
    // Behavior Analysis
    analyzeUserBehavior,
    identifyUsagePatterns: async () => {
      return await racineOrchestrationAPI.identifyUsagePatterns();
    },
    generateHeatmap,
    detectAnomalies: async () => {
      return await racineOrchestrationAPI.detectNavigationAnomalies();
    },
    
    // Optimization & Recommendations
    generateOptimizationReport: async () => {
      return await racineOrchestrationAPI.generateOptimizationReport();
    },
    identifyBottlenecks,
    suggestNavigationImprovements: async () => {
      return await racineOrchestrationAPI.suggestNavigationImprovements();
    },
    
    // Reporting & Export
    generateAnalyticsReport: async (format, timeRange?) => {
      return await racineOrchestrationAPI.generateAnalyticsReport({ format, timeRange });
    },
    exportHeatmapData: async (format) => {
      return await racineOrchestrationAPI.exportHeatmapData({ format });
    },
    schedulePeriodicReports: async (frequency, recipients) => {
      return await racineOrchestrationAPI.schedulePeriodicReports({ frequency, recipients });
    },
    
    // Real-time Analytics
    subscribeToRealTimeAnalytics: (callback) => {
      realtimeSubscriptions.current.add(callback);
      return () => {
        realtimeSubscriptions.current.delete(callback);
      };
    },
    getCurrentSessionMetrics: () => analyticsState.sessionAnalytics,
    getLiveUserCount: async () => {
      return await racineOrchestrationAPI.getLiveUserCount();
    },
    
    // Configuration
    updateTrackingSettings: (settings) => {
      // Update tracking configuration
      racineOrchestrationAPI.updateTrackingSettings(settings).catch(error => {
        console.warn('Failed to update tracking settings:', error);
      });
    },
    
    // Data Management
    clearAnalyticsData: async (olderThan?) => {
      await racineOrchestrationAPI.clearAnalyticsData({ olderThan });
    },
    exportUserData: async (userId) => {
      return await racineOrchestrationAPI.exportUserData({ userId });
    },
    anonymizeUserData: async (userId) => {
      await racineOrchestrationAPI.anonymizeUserData({ userId });
    }
  };
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default useNavigationAnalytics;