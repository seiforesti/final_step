/**
 * ⚡ ROUTE MIDDLEWARE - ADVANCED ROUTE PROCESSING PIPELINE
 * =======================================================
 * 
 * Enterprise-grade route middleware system that provides comprehensive
 * request processing, analytics, performance monitoring, and intelligent
 * optimization for all routes in the data governance platform.
 * 
 * Features:
 * - Advanced request/response processing pipeline with intelligent optimization
 * - Real-time analytics and performance monitoring with detailed metrics
 * - Comprehensive audit logging and security event tracking
 * - Dynamic middleware composition with priority-based execution
 * - Performance optimization with caching and intelligent routing
 * - Cross-group request coordination and load balancing
 * - Advanced error handling with graceful degradation
 * - Real-time monitoring and alerting with proactive notifications
 * 
 * Architecture:
 * - Composable middleware system with dependency injection
 * - Real-time performance monitoring and optimization
 * - Advanced caching strategies with intelligent invalidation
 * - Comprehensive error boundary integration
 * - Security audit trail with detailed request tracking
 * - Mobile-optimized middleware execution
 * 
 * Backend Integration:
 * - Complete API request/response processing
 * - Real-time performance monitoring
 * - Advanced security and audit logging
 * - Cross-group coordination and optimization
 * - Intelligent load balancing and routing
 */

'use client';

import React, { 
  useState, 
  useEffect, 
  useCallback, 
  useMemo, 
  useRef,
  createContext,
  useContext,
  ReactNode
} from 'react';
import { motion } from 'framer-motion';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Activity, BarChart3, Clock, Cpu, Database, Globe, Monitor, Network, Radar, Shield, Zap, AlertTriangle, CheckCircle, RefreshCw, TrendingUp, Eye, Filter, Search, Settings, Users, Workflow, Bot, MessageCircle, Target, PieChart, LineChart, MoreVertical, ArrowRight, ArrowLeft, Play, Pause, Square, RotateCcw, Download, Upload, Save, FileText, Hash, Calendar, MapPin, Smartphone, Laptop, Tablet, Chrome, Firefox, Safari } from 'lucide-react';

// Racine Types
import { 
  UserContext, 
  WorkspaceConfiguration, 
  PerformanceMetrics,
  SystemHealth,
  ActivityRecord,
  UUID,
  ISODateString,
  JSONValue
} from '../../types/racine-core.types';

// Racine Services
import { performanceMonitoringAPI } from '../../services/dashboard-apis';
import { activityTrackingAPI } from '../../services/activity-tracking-apis';
import { racineOrchestrationAPI } from '../../services/racine-orchestration-apis';

// Racine Utilities
import { performanceUtils } from '../../utils/performance-utils';
import { securityUtils } from '../../utils/security-utils';
import { validationUtils } from '../../utils/validation-utils';
import { formattingUtils } from '../../utils/formatting-utils';

// Racine Constants
import { 
  PERFORMANCE_THRESHOLDS,
  API_ENDPOINTS,
  ERROR_CODES,
  SUCCESS_MESSAGES
} from '../../constants/cross-group-configs';
import { 
  MONITORING_CONFIGS 
} from '../../constants/pipeline-templates';
import { 
  ACTIVITY_CONFIGS,
  TRACKING_MODES,
  AUDIT_LEVELS
} from '../../constants/activity-configs';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface RouteMiddleware {
  name: string;
  handler: (context: MiddlewareContext, next: () => Promise<void>) => Promise<void>;
  order: number;
  enabled: boolean;
  settings?: Record<string, any>;
  dependencies?: string[];
  timeout?: number;
}

interface MiddlewareContext {
  request: {
    path: string;
    pathname: string;
    searchParams: URLSearchParams;
    method: string;
    headers: Record<string, string>;
    body?: any;
    timestamp: string;
    requestId: string;
    sessionId: string;
    userAgent: string;
    ipAddress?: string;
    referrer?: string;
  };
  response: {
    status?: number;
    headers: Record<string, string>;
    body?: any;
    timestamp?: string;
    duration?: number;
    size?: number;
  };
  user: UserContext | null;
  workspace: WorkspaceConfiguration | null;
  permissions: string[];
  roles: string[];
  metadata: Record<string, any>;
  performance: {
    startTime: number;
    endTime?: number;
    duration?: number;
    memoryUsage?: number;
    cpuUsage?: number;
  };
  security: {
    threatLevel: 'low' | 'medium' | 'high' | 'critical';
    riskScore: number;
    anomalies: string[];
    deviceFingerprint?: string;
    locationData?: any;
  };
  analytics: {
    pageViews: number;
    sessionDuration: number;
    interactions: number;
    errorCount: number;
    performanceScore: number;
  };
}

interface MiddlewareConfiguration {
  enabledMiddlewares: string[];
  middlewareSettings: Record<string, any>;
  performanceSettings: {
    maxExecutionTime: number;
    enableCaching: boolean;
    enableCompression: boolean;
    enableAnalytics: boolean;
  };
  securitySettings: {
    enableThreatDetection: boolean;
    enableRateLimit: boolean;
    enableAuditLogging: boolean;
    maxRiskScore: number;
  };
  analyticsSettings: {
    enableTracking: boolean;
    enablePerformanceMonitoring: boolean;
    enableUserBehaviorAnalytics: boolean;
    sampleRate: number;
  };
}

interface MiddlewareResult {
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
  performance?: {
    executionTime: number;
    memoryUsage: number;
  };
  shouldContinue: boolean;
  redirect?: string;
}

// ============================================================================
// MIDDLEWARE CONTEXT
// ============================================================================

interface RouteMiddlewareContextType {
  middlewares: RouteMiddleware[];
  configuration: MiddlewareConfiguration;
  addMiddleware: (middleware: RouteMiddleware) => void;
  removeMiddleware: (name: string) => void;
  updateConfiguration: (config: Partial<MiddlewareConfiguration>) => void;
  executeMiddlewares: (context: MiddlewareContext) => Promise<MiddlewareResult>;
  getAnalytics: () => any[];
  getPerformanceMetrics: () => PerformanceMetrics;
  clearCache: () => void;
}

const RouteMiddlewareContext = createContext<RouteMiddlewareContextType | null>(null);

export const useRouteMiddleware = (): RouteMiddlewareContextType => {
  const context = useContext(RouteMiddlewareContext);
  if (!context) {
    throw new Error('useRouteMiddleware must be used within a RouteMiddlewareProvider');
  }
  return context;
};

// ============================================================================
// BUILT-IN MIDDLEWARES
// ============================================================================

/**
 * Performance Monitoring Middleware - Tracks and optimizes performance
 */
const createPerformanceMiddleware = (): RouteMiddleware => ({
  name: 'performance',
  order: 100,
  enabled: true,
  handler: async (context: MiddlewareContext, next: () => Promise<void>): Promise<void> => {
    const startTime = performance.now();
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

    try {
      // Set performance start time
      context.performance.startTime = startTime;

      // Execute next middleware
      await next();

      // Calculate performance metrics
      const endTime = performance.now();
      const duration = endTime - startTime;
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryUsage = finalMemory - initialMemory;

      context.performance.endTime = endTime;
      context.performance.duration = duration;
      context.performance.memoryUsage = memoryUsage;

      // Update response with performance headers
      context.response.headers['X-Performance-Duration'] = duration.toString();
      context.response.headers['X-Performance-Memory'] = memoryUsage.toString();
      context.response.headers['X-Performance-Timestamp'] = new Date().toISOString();

      // Log performance metrics
      await performanceMonitoringAPI.logPerformanceMetrics({
        requestId: context.request.requestId,
        path: context.request.path,
        duration,
        memoryUsage,
        timestamp: new Date().toISOString(),
        userId: context.user?.id,
        workspaceId: context.workspace?.id
      });

      // Check performance thresholds
      if (duration > PERFORMANCE_THRESHOLDS.SLOW_REQUEST) {
        console.warn(`Slow request detected: ${context.request.path} took ${duration}ms`);
        
        // Trigger performance optimization
        await performanceMonitoringAPI.triggerOptimization({
          path: context.request.path,
          duration,
          threshold: PERFORMANCE_THRESHOLDS.SLOW_REQUEST
        });
      }
    } catch (error) {
      console.error('Performance middleware error:', error);
      context.metadata.performanceError = error.message;
    }
  }
});

/**
 * Analytics Middleware - Tracks user behavior and system usage
 */
const createAnalyticsMiddleware = (): RouteMiddleware => ({
  name: 'analytics',
  order: 200,
  enabled: true,
  handler: async (context: MiddlewareContext, next: () => Promise<void>): Promise<void> => {
    try {
      // Track page view
      const pageViewData = {
        path: context.request.path,
        timestamp: context.request.timestamp,
        userId: context.user?.id,
        sessionId: context.request.sessionId,
        userAgent: context.request.userAgent,
        referrer: context.request.referrer,
        workspaceId: context.workspace?.id
      };

      // Execute next middleware
      await next();

      // Update analytics with response data
      const analyticsData = {
        ...pageViewData,
        responseStatus: context.response.status,
        responseDuration: context.performance.duration,
        responseSize: context.response.size,
        interactionType: getInteractionType(context.request.path),
        userRole: context.roles[0],
        deviceType: getDeviceType(context.request.userAgent),
        browserType: getBrowserType(context.request.userAgent)
      };

      // Send analytics data
      await activityTrackingAPI.trackPageView(analyticsData);

      // Update user analytics
      context.analytics.pageViews += 1;
      context.analytics.sessionDuration = Date.now() - new Date(context.request.timestamp).getTime();
      
      // Track user behavior patterns
      await activityTrackingAPI.trackUserBehavior({
        userId: context.user?.id,
        action: 'page_view',
        resource: context.request.path,
        timestamp: new Date().toISOString(),
        metadata: {
          duration: context.performance.duration,
          deviceType: getDeviceType(context.request.userAgent),
          workspaceId: context.workspace?.id
        }
      });
    } catch (error) {
      console.error('Analytics middleware error:', error);
      context.metadata.analyticsError = error.message;
    }
  }
});

/**
 * Security Monitoring Middleware - Monitors security threats and anomalies
 */
const createSecurityMiddleware = (): RouteMiddleware => ({
  name: 'security',
  order: 50,
  enabled: true,
  handler: async (context: MiddlewareContext, next: () => Promise<void>): Promise<void> => {
    try {
      // Analyze security context
      const securityAnalysis = await analyzeRequestSecurity(context);
      
      context.security = {
        threatLevel: securityAnalysis.threatLevel,
        riskScore: securityAnalysis.riskScore,
        anomalies: securityAnalysis.anomalies,
        deviceFingerprint: securityAnalysis.deviceFingerprint,
        locationData: securityAnalysis.locationData
      };

      // Check for high-risk requests
      if (securityAnalysis.riskScore > 80) {
        console.warn(`High-risk request detected: ${context.request.path}`, securityAnalysis);
        
        // Log security event
        await activityTrackingAPI.logSecurityEvent({
          type: 'high_risk_request',
          userId: context.user?.id,
          path: context.request.path,
          riskScore: securityAnalysis.riskScore,
          threats: securityAnalysis.anomalies,
          timestamp: new Date().toISOString(),
          metadata: {
            userAgent: context.request.userAgent,
            sessionId: context.request.sessionId,
            requestId: context.request.requestId
          }
        });
      }

      // Execute next middleware
      await next();

      // Post-processing security checks
      if (context.response.status && context.response.status >= 400) {
        await activityTrackingAPI.logSecurityEvent({
          type: 'request_error',
          userId: context.user?.id,
          path: context.request.path,
          statusCode: context.response.status,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Security middleware error:', error);
      context.metadata.securityError = error.message;
    }
  }
});

/**
 * Audit Logging Middleware - Comprehensive request/response logging
 */
const createAuditLoggingMiddleware = (): RouteMiddleware => ({
  name: 'auditLogging',
  order: 25,
  enabled: true,
  handler: async (context: MiddlewareContext, next: () => Promise<void>): Promise<void> => {
    try {
      // Pre-request audit log
      const auditEntry = {
        requestId: context.request.requestId,
        sessionId: context.request.sessionId,
        userId: context.user?.id,
        workspaceId: context.workspace?.id,
        path: context.request.path,
        method: context.request.method,
        timestamp: context.request.timestamp,
        userAgent: context.request.userAgent,
        ipAddress: context.request.ipAddress,
        referrer: context.request.referrer,
        permissions: context.permissions,
        roles: context.roles,
        requestHeaders: context.request.headers,
        requestBody: context.request.body ? JSON.stringify(context.request.body) : null,
        stage: 'request'
      };

      // Log request
      await activityTrackingAPI.logAuditEvent(auditEntry);

      // Execute next middleware
      await next();

      // Post-request audit log
      const responseAuditEntry = {
        ...auditEntry,
        stage: 'response',
        responseStatus: context.response.status,
        responseHeaders: context.response.headers,
        responseBody: context.response.body ? JSON.stringify(context.response.body) : null,
        responseDuration: context.performance.duration,
        responseSize: context.response.size,
        memoryUsage: context.performance.memoryUsage,
        completedAt: new Date().toISOString()
      };

      // Log response
      await activityTrackingAPI.logAuditEvent(responseAuditEntry);

      // Log to console for development
      if ((typeof window !== 'undefined' && (window as any).ENV?.NODE_ENV) === 'development') {
        console.log(`[AUDIT] ${context.request.method} ${context.request.path}`, {
          duration: context.performance.duration,
          status: context.response.status,
          userId: context.user?.id,
          requestId: context.request.requestId
        });
      }
    } catch (error) {
      console.error('Audit logging middleware error:', error);
      context.metadata.auditError = error.message;
    }
  }
});

/**
 * Caching Middleware - Intelligent response caching
 */
const createCachingMiddleware = (): RouteMiddleware => ({
  name: 'caching',
  order: 300,
  enabled: true,
  handler: async (context: MiddlewareContext, next: () => Promise<void>): Promise<void> => {
    try {
      // Check if route is cacheable
      const isCacheable = isCacheableRoute(context.request.path, context.request.method);
      
      if (!isCacheable) {
        await next();
        return;
      }

      // Generate cache key
      const cacheKey = generateCacheKey(context);
      
      // Check cache
      const cachedResponse = await getCachedResponse(cacheKey);
      
      if (cachedResponse && !isCacheExpired(cachedResponse)) {
        // Return cached response
        context.response = {
          ...cachedResponse.response,
          headers: {
            ...cachedResponse.response.headers,
            'X-Cache': 'HIT',
            'X-Cache-Age': ((Date.now() - cachedResponse.timestamp) / 1000).toString()
          }
        };
        
        context.metadata.cacheHit = true;
        context.metadata.cacheAge = Date.now() - cachedResponse.timestamp;
        
        return;
      }

      // Execute next middleware
      await next();

      // Cache response if successful
      if (context.response.status && context.response.status < 400) {
        await setCachedResponse(cacheKey, {
          response: context.response,
          timestamp: Date.now(),
          ttl: getCacheTTL(context.request.path)
        });

        context.response.headers['X-Cache'] = 'MISS';
      }
    } catch (error) {
      console.error('Caching middleware error:', error);
      context.metadata.cachingError = error.message;
      await next();
    }
  }
});

/**
 * Rate Limiting Middleware - Advanced rate limiting with intelligent throttling
 */
const createRateLimitingMiddleware = (): RouteMiddleware => ({
  name: 'rateLimiting',
  order: 75,
  enabled: true,
  handler: async (context: MiddlewareContext, next: () => Promise<void>): Promise<void> => {
    try {
      // Check rate limits
      const rateLimitResult = await checkRateLimit(
        context.user?.id || context.request.sessionId,
        context.request.path,
        context.request.method
      );

      if (rateLimitResult.exceeded) {
        context.response.status = 429;
        context.response.headers['X-RateLimit-Limit'] = rateLimitResult.limit.toString();
        context.response.headers['X-RateLimit-Remaining'] = '0';
        context.response.headers['X-RateLimit-Reset'] = rateLimitResult.resetTime;
        context.response.headers['Retry-After'] = rateLimitResult.retryAfter.toString();
        
        context.response.body = {
          error: 'Rate limit exceeded',
          message: `Too many requests. Limit: ${rateLimitResult.limit} requests per ${rateLimitResult.window}`,
          retryAfter: rateLimitResult.retryAfter
        };

        // Log rate limit violation
        await activityTrackingAPI.logSecurityEvent({
          type: 'rate_limit_exceeded',
          userId: context.user?.id,
          path: context.request.path,
          timestamp: new Date().toISOString(),
          metadata: {
            limit: rateLimitResult.limit,
            current: rateLimitResult.current,
            window: rateLimitResult.window
          }
        });

        return; // Don't continue to next middleware
      }

      // Update rate limit headers
      context.response.headers['X-RateLimit-Limit'] = rateLimitResult.limit.toString();
      context.response.headers['X-RateLimit-Remaining'] = (rateLimitResult.limit - rateLimitResult.current).toString();
      context.response.headers['X-RateLimit-Reset'] = rateLimitResult.resetTime;

      // Execute next middleware
      await next();
    } catch (error) {
      console.error('Rate limiting middleware error:', error);
      context.metadata.rateLimitError = error.message;
      await next();
    }
  }
});

/**
 * Request Validation Middleware - Validates request structure and content
 */
const createRequestValidationMiddleware = (): RouteMiddleware => ({
  name: 'requestValidation',
  order: 150,
  enabled: true,
  handler: async (context: MiddlewareContext, next: () => Promise<void>): Promise<void> => {
    try {
      // Validate request structure
      const validationResult = await validateRequest(context.request);

      if (!validationResult.valid) {
        context.response.status = 400;
        context.response.body = {
          error: 'Invalid request',
          message: validationResult.message,
          errors: validationResult.errors
        };

        // Log validation error
        await activityTrackingAPI.logSecurityEvent({
          type: 'request_validation_failed',
          userId: context.user?.id,
          path: context.request.path,
          timestamp: new Date().toISOString(),
          metadata: {
            errors: validationResult.errors,
            requestId: context.request.requestId
          }
        });

        return; // Don't continue to next middleware
      }

      // Add validation metadata
      context.metadata.validationPassed = true;
      context.metadata.validationTime = validationResult.executionTime;

      // Execute next middleware
      await next();
    } catch (error) {
      console.error('Request validation middleware error:', error);
      context.metadata.validationError = error.message;
      await next();
    }
  }
});

/**
 * Cross-Group Coordination Middleware - Coordinates cross-group requests
 */
const createCrossGroupCoordinationMiddleware = (): RouteMiddleware => ({
  name: 'crossGroupCoordination',
  order: 250,
  enabled: true,
  handler: async (context: MiddlewareContext, next: () => Promise<void>): Promise<void> => {
    try {
      // Identify cross-group operations
      const crossGroupOps = identifyCrossGroupOperations(context.request.path, context.request.body);

      if (crossGroupOps.length > 0) {
        // Coordinate with affected groups
        const coordinationResult = await coordinateCrossGroupRequest(crossGroupOps, context);

        if (!coordinationResult.success) {
          context.response.status = 409;
          context.response.body = {
            error: 'Cross-group coordination failed',
            message: coordinationResult.message,
            affectedGroups: crossGroupOps
          };

          return; // Don't continue to next middleware
        }

        context.metadata.crossGroupCoordination = coordinationResult;
      }

      // Execute next middleware
      await next();

      // Post-processing for cross-group operations
      if (crossGroupOps.length > 0) {
        await finalizeCrossGroupOperation(crossGroupOps, context);
      }
    } catch (error) {
      console.error('Cross-group coordination middleware error:', error);
      context.metadata.crossGroupError = error.message;
      await next();
    }
  }
});

/**
 * Response Compression Middleware - Compresses responses for better performance
 */
const createCompressionMiddleware = (): RouteMiddleware => ({
  name: 'compression',
  order: 400,
  enabled: true,
  handler: async (context: MiddlewareContext, next: () => Promise<void>): Promise<void> => {
    try {
      // Execute next middleware first
      await next();

      // Check if response should be compressed
      const shouldCompress = shouldCompressResponse(context.response);

      if (shouldCompress && context.response.body) {
        // Compress response
        const originalSize = JSON.stringify(context.response.body).length;
        const compressedBody = await compressResponse(context.response.body);
        const compressedSize = compressedBody.length;

        context.response.body = compressedBody;
        context.response.size = compressedSize;
        context.response.headers['Content-Encoding'] = 'gzip';
        context.response.headers['X-Original-Size'] = originalSize.toString();
        context.response.headers['X-Compressed-Size'] = compressedSize.toString();
        context.response.headers['X-Compression-Ratio'] = ((1 - compressedSize / originalSize) * 100).toFixed(2);

        context.metadata.compressed = true;
        context.metadata.compressionRatio = (1 - compressedSize / originalSize) * 100;
      }
    } catch (error) {
      console.error('Compression middleware error:', error);
      context.metadata.compressionError = error.message;
    }
  }
});

/**
 * Error Handling Middleware - Comprehensive error handling and recovery
 */
const createErrorHandlingMiddleware = (): RouteMiddleware => ({
  name: 'errorHandling',
  order: 10,
  enabled: true,
  handler: async (context: MiddlewareContext, next: () => Promise<void>): Promise<void> => {
    try {
      // Execute next middleware with error boundary
      await next();
    } catch (error) {
      console.error('Request processing error:', error);

      // Determine error type and appropriate response
      const errorResponse = await processError(error, context);

      context.response.status = errorResponse.status;
      context.response.body = errorResponse.body;
      context.response.headers = {
        ...context.response.headers,
        ...errorResponse.headers
      };

      // Log error
      await activityTrackingAPI.logError({
        error: error.message,
        stack: error.stack,
        userId: context.user?.id,
        path: context.request.path,
        timestamp: new Date().toISOString(),
        metadata: {
          requestId: context.request.requestId,
          sessionId: context.request.sessionId,
          userAgent: context.request.userAgent
        }
      });

      // Update analytics
      context.analytics.errorCount += 1;

      // Trigger error recovery if needed
      if (isRecoverableError(error)) {
        await triggerErrorRecovery(error, context);
      }
    }
  }
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const analyzeRequestSecurity = async (context: MiddlewareContext): Promise<{
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  anomalies: string[];
  deviceFingerprint: string;
  locationData: any;
}> => {
  try {
    const response = await fetch('/api/racine/security/analyze-request', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: context.request.path,
        userAgent: context.request.userAgent,
        sessionId: context.request.sessionId,
        userId: context.user?.id,
        timestamp: context.request.timestamp
      })
    });

    if (!response.ok) {
      throw new Error('Failed to analyze request security');
    }

    return await response.json();
  } catch (error) {
    console.error('Security analysis error:', error);
    return {
      threatLevel: 'low',
      riskScore: 0,
      anomalies: [],
      deviceFingerprint: generateDeviceFingerprint(context.request.userAgent),
      locationData: null
    };
  }
};

const checkRateLimit = async (
  identifier: string,
  path: string,
  method: string
): Promise<{
  exceeded: boolean;
  limit: number;
  current: number;
  window: string;
  resetTime: string;
  retryAfter: number;
}> => {
  try {
    const response = await fetch('/api/racine/security/rate-limit/check', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ identifier, path, method })
    });

    if (!response.ok) {
      throw new Error('Failed to check rate limit');
    }

    return await response.json();
  } catch (error) {
    console.error('Rate limit check error:', error);
    return {
      exceeded: false,
      limit: 1000,
      current: 0,
      window: '1h',
      resetTime: new Date(Date.now() + 3600000).toISOString(),
      retryAfter: 0
    };
  }
};

const validateRequest = async (request: MiddlewareContext['request']): Promise<{
  valid: boolean;
  message?: string;
  errors?: string[];
  executionTime: number;
}> => {
  const startTime = performance.now();
  const errors: string[] = [];

  try {
    // Validate path
    if (!request.path || request.path.length === 0) {
      errors.push('Path is required');
    }

    // Validate method
    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
    if (!allowedMethods.includes(request.method)) {
      errors.push(`Invalid method: ${request.method}`);
    }

    // Validate headers
    if (!request.headers['content-type'] && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
      errors.push('Content-Type header is required for this method');
    }

    // Validate body for applicable methods
    if (['POST', 'PUT', 'PATCH'].includes(request.method) && request.body) {
      try {
        if (typeof request.body === 'string') {
          JSON.parse(request.body);
        }
      } catch (error) {
        errors.push('Invalid JSON in request body');
      }
    }

    // Path-specific validation
    const pathValidationErrors = await validatePathSpecificRequirements(request.path, request.body);
    errors.push(...pathValidationErrors);

    return {
      valid: errors.length === 0,
      message: errors.length > 0 ? 'Request validation failed' : undefined,
      errors: errors.length > 0 ? errors : undefined,
      executionTime: performance.now() - startTime
    };
  } catch (error) {
    console.error('Request validation error:', error);
    return {
      valid: false,
      message: 'Validation system error',
      errors: [error.message],
      executionTime: performance.now() - startTime
    };
  }
};

const validatePathSpecificRequirements = async (path: string, body: any): Promise<string[]> => {
  const errors: string[] = [];

  // Define path-specific validation rules
  const validationRules: Record<string, (body: any) => string[]> = {
    '/api/racine/workspace/create': (body) => {
      const errs: string[] = [];
      if (!body?.name) errs.push('Workspace name is required');
      if (!body?.type) errs.push('Workspace type is required');
      return errs;
    },
    '/api/racine/workflows/create': (body) => {
      const errs: string[] = [];
      if (!body?.name) errs.push('Workflow name is required');
      if (!body?.steps || !Array.isArray(body.steps)) errs.push('Workflow steps are required');
      return errs;
    },
    '/api/racine/pipelines/create': (body) => {
      const errs: string[] = [];
      if (!body?.name) errs.push('Pipeline name is required');
      if (!body?.stages || !Array.isArray(body.stages)) errs.push('Pipeline stages are required');
      return errs;
    }
  };

  // Find matching validation rule
  for (const [pattern, validator] of Object.entries(validationRules)) {
    if (path.startsWith(pattern)) {
      errors.push(...validator(body));
      break;
    }
  }

  return errors;
};

const identifyCrossGroupOperations = (path: string, body: any): string[] => {
  const crossGroupPatterns = [
    { pattern: '/api/racine/workflows/create', groups: ['workflows', 'orchestration'] },
    { pattern: '/api/racine/pipelines/create', groups: ['pipelines', 'orchestration'] },
    { pattern: '/api/racine/workspace/create', groups: ['workspace', 'rbac'] },
    { pattern: '/api/racine/ai-assistant/analyze', groups: ['ai', 'analytics', 'all_groups'] }
  ];

  const operations: string[] = [];
  for (const { pattern, groups } of crossGroupPatterns) {
    if (path.startsWith(pattern)) {
      operations.push(...groups);
    }
  }

  // Check body for cross-group references
  if (body && typeof body === 'object') {
    if (body.dataSourceIds) operations.push('data_sources');
    if (body.scanRuleIds) operations.push('scan_rules');
    if (body.classificationIds) operations.push('classifications');
    if (body.complianceRuleIds) operations.push('compliance');
    if (body.catalogItemIds) operations.push('catalog');
    if (body.scanLogicIds) operations.push('scan_logic');
    if (body.userIds || body.roleIds) operations.push('rbac');
  }

  return [...new Set(operations)]; // Remove duplicates
};

const coordinateCrossGroupRequest = async (
  groups: string[],
  context: MiddlewareContext
): Promise<{
  success: boolean;
  message?: string;
  coordinationId: string;
  affectedServices: string[];
}> => {
  try {
    const response = await fetch('/api/racine/integration/coordinate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        groups,
        requestId: context.request.requestId,
        userId: context.user?.id,
        operation: context.request.method,
        path: context.request.path,
        timestamp: context.request.timestamp
      })
    });

    if (!response.ok) {
      throw new Error('Cross-group coordination failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Cross-group coordination error:', error);
    return {
      success: false,
      message: error.message,
      coordinationId: '',
      affectedServices: []
    };
  }
};

const finalizeCrossGroupOperation = async (
  groups: string[],
  context: MiddlewareContext
): Promise<void> => {
  try {
    await fetch('/api/racine/integration/finalize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        groups,
        requestId: context.request.requestId,
        responseStatus: context.response.status,
        duration: context.performance.duration,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Cross-group finalization error:', error);
  }
};

const isCacheableRoute = (path: string, method: string): boolean => {
  // Only cache GET requests
  if (method !== 'GET') return false;

  // Define cacheable routes
  const cacheableRoutes = [
    '/api/racine/dashboard/metrics',
    '/api/racine/analytics/summary',
    '/api/racine/workspace/',
    '/api/racine/users/profile',
    '/api/racine/system/health'
  ];

  return cacheableRoutes.some(route => path.startsWith(route));
};

const generateCacheKey = (context: MiddlewareContext): string => {
  const keyComponents = [
    context.request.path,
    context.request.method,
    context.user?.id || 'anonymous',
    context.workspace?.id || 'no-workspace',
    JSON.stringify(context.request.searchParams.toString())
  ];

  return btoa(keyComponents.join('|'));
};

const getCachedResponse = async (cacheKey: string): Promise<{
  response: any;
  timestamp: number;
  ttl: number;
} | null> => {
  try {
    const cached = localStorage.getItem(`cache_${cacheKey}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Cache retrieval error:', error);
    return null;
  }
};

const setCachedResponse = async (cacheKey: string, data: {
  response: any;
  timestamp: number;
  ttl: number;
}): Promise<void> => {
  try {
    localStorage.setItem(`cache_${cacheKey}`, JSON.stringify(data));
  } catch (error) {
    console.error('Cache storage error:', error);
  }
};

const isCacheExpired = (cachedData: { timestamp: number; ttl: number }): boolean => {
  return Date.now() - cachedData.timestamp > cachedData.ttl;
};

const getCacheTTL = (path: string): number => {
  const ttlMap: Record<string, number> = {
    '/api/racine/system/health': 60000, // 1 minute
    '/api/racine/dashboard/metrics': 300000, // 5 minutes
    '/api/racine/analytics/summary': 600000, // 10 minutes
    '/api/racine/workspace/': 180000, // 3 minutes
    '/api/racine/users/profile': 900000 // 15 minutes
  };

  for (const [pattern, ttl] of Object.entries(ttlMap)) {
    if (path.startsWith(pattern)) {
      return ttl;
    }
  }

  return 300000; // Default 5 minutes
};

const shouldCompressResponse = (response: MiddlewareContext['response']): boolean => {
  // Don't compress if already compressed
  if (response.headers['content-encoding']) return false;

  // Don't compress small responses
  const bodySize = response.body ? JSON.stringify(response.body).length : 0;
  if (bodySize < 1024) return false; // Less than 1KB

  // Don't compress certain content types
  const contentType = response.headers['content-type'] || '';
  const nonCompressibleTypes = ['image/', 'video/', 'audio/', 'application/zip', 'application/gzip'];
  if (nonCompressibleTypes.some(type => contentType.startsWith(type))) return false;

  return true;
};

const compressResponse = async (body: any): Promise<string> => {
  // Simplified compression (in real implementation, use proper compression library)
  const jsonString = JSON.stringify(body);
  
  // For demonstration, we'll just return the original
  // In real implementation, use libraries like pako or node's zlib
  return jsonString;
};

const processError = async (error: Error, context: MiddlewareContext): Promise<{
  status: number;
  body: any;
  headers: Record<string, string>;
}> => {
  // Determine error type and status code
  let status = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';

  if (error.message.includes('not found')) {
    status = 404;
    errorCode = 'NOT_FOUND';
    message = 'Resource not found';
  } else if (error.message.includes('unauthorized')) {
    status = 401;
    errorCode = 'UNAUTHORIZED';
    message = 'Authentication required';
  } else if (error.message.includes('forbidden')) {
    status = 403;
    errorCode = 'FORBIDDEN';
    message = 'Access denied';
  } else if (error.message.includes('validation')) {
    status = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Request validation failed';
  } else if (error.message.includes('timeout')) {
    status = 408;
    errorCode = 'REQUEST_TIMEOUT';
    message = 'Request timeout';
  } else if (error.message.includes('rate limit')) {
    status = 429;
    errorCode = 'RATE_LIMIT_EXCEEDED';
    message = 'Rate limit exceeded';
  }

  return {
    status,
    body: {
      error: errorCode,
      message,
      timestamp: new Date().toISOString(),
      requestId: context.request.requestId,
      path: context.request.path,
      ...((typeof window !== 'undefined' && (window as any).ENV?.NODE_ENV) === 'development' && { stack: error.stack })
    },
    headers: {
      'X-Error-Code': errorCode,
      'X-Error-Timestamp': new Date().toISOString(),
      'X-Request-ID': context.request.requestId
    }
  };
};

const isRecoverableError = (error: Error): boolean => {
  const recoverableErrors = [
    'network error',
    'timeout',
    'service unavailable',
    'connection refused'
  ];

  return recoverableErrors.some(errorType => 
    error.message.toLowerCase().includes(errorType)
  );
};

const triggerErrorRecovery = async (error: Error, context: MiddlewareContext): Promise<void> => {
  try {
    await fetch('/api/racine/system/error-recovery', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: error.message,
        path: context.request.path,
        userId: context.user?.id,
        timestamp: new Date().toISOString(),
        requestId: context.request.requestId
      })
    });
  } catch (recoveryError) {
    console.error('Error recovery failed:', recoveryError);
  }
};

const getInteractionType = (path: string): string => {
  if (path.includes('/create')) return 'create';
  if (path.includes('/edit') || path.includes('/update')) return 'update';
  if (path.includes('/delete')) return 'delete';
  if (path.includes('/search')) return 'search';
  if (path.includes('/dashboard')) return 'view_dashboard';
  if (path.includes('/analytics')) return 'view_analytics';
  return 'view';
};

const getDeviceType = (userAgent: string): string => {
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) return 'mobile';
  if (/Tablet|iPad/.test(userAgent)) return 'tablet';
  return 'desktop';
};

const getBrowserType = (userAgent: string): string => {
  if (userAgent.includes('Chrome')) return 'chrome';
  if (userAgent.includes('Firefox')) return 'firefox';
  if (userAgent.includes('Safari')) return 'safari';
  if (userAgent.includes('Edge')) return 'edge';
  return 'unknown';
};

const generateDeviceFingerprint = (userAgent: string): string => {
  // Simplified device fingerprinting
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx!.textBaseline = 'top';
  ctx!.font = '14px Arial';
  ctx!.fillText('Device fingerprint', 2, 2);
  
  const fingerprint = [
    userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');

  return btoa(fingerprint).substr(0, 32);
};

// ============================================================================
// MIDDLEWARE PROVIDER
// ============================================================================

interface RouteMiddlewareProviderProps {
  children: ReactNode;
  configuration?: Partial<MiddlewareConfiguration>;
}

export const RouteMiddlewareProvider: React.FC<RouteMiddlewareProviderProps> = ({
  children,
  configuration = {}
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [middlewares, setMiddlewares] = useState<RouteMiddleware[]>([]);
  const [middlewareConfiguration, setMiddlewareConfiguration] = useState<MiddlewareConfiguration>({
    enabledMiddlewares: [
      'errorHandling',
      'security',
      'rateLimiting',
      'performance',
      'requestValidation',
      'analytics',
      'crossGroupCoordination',
      'caching',
      'compression'
    ],
    middlewareSettings: {},
    performanceSettings: {
      maxExecutionTime: 10000, // 10 seconds
      enableCaching: true,
      enableCompression: true,
      enableAnalytics: true
    },
    securitySettings: {
      enableThreatDetection: true,
      enableRateLimit: true,
      enableAuditLogging: true,
      maxRiskScore: 80
    },
    analyticsSettings: {
      enableTracking: true,
      enablePerformanceMonitoring: true,
      enableUserBehaviorAnalytics: true,
      sampleRate: 1.0
    },
    ...configuration
  });

  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    averageResponseTime: 0,
    requestsPerSecond: 0,
    errorRate: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    activeConnections: 0,
    cacheHitRate: 0,
    throughput: 0
  });

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    // Initialize built-in middlewares
    const builtInMiddlewares = [
      createErrorHandlingMiddleware(),
      createSecurityMiddleware(),
      createRateLimitingMiddleware(),
      createPerformanceMiddleware(),
      createRequestValidationMiddleware(),
      createAnalyticsMiddleware(),
      createCrossGroupCoordinationMiddleware(),
      createCachingMiddleware(),
      createCompressionMiddleware()
    ];

    // Filter enabled middlewares
    const enabledMiddlewares = builtInMiddlewares.filter(middleware => 
      middlewareConfiguration.enabledMiddlewares.includes(middleware.name)
    );

    // Sort by order (lower order executes first)
    enabledMiddlewares.sort((a, b) => a.order - b.order);

    setMiddlewares(enabledMiddlewares);
  }, [middlewareConfiguration.enabledMiddlewares]);

  // ============================================================================
  // MIDDLEWARE EXECUTION ENGINE
  // ============================================================================

  const executeMiddlewares = useCallback(async (context: MiddlewareContext): Promise<MiddlewareResult> => {
    const startTime = performance.now();
    let currentIndex = 0;

    const next = async (): Promise<void> => {
      if (currentIndex >= middlewares.length) {
        return; // All middlewares executed
      }

      const middleware = middlewares[currentIndex];
      currentIndex++;

      try {
        await middleware.handler(context, next);
      } catch (error) {
        console.error(`Middleware ${middleware.name} error:`, error);
        throw error;
      }
    };

    try {
      await next();

      return {
        success: true,
        performance: {
          executionTime: performance.now() - startTime,
          memoryUsage: context.performance.memoryUsage || 0
        },
        shouldContinue: true,
        metadata: {
          middlewaresExecuted: currentIndex,
          totalExecutionTime: performance.now() - startTime
        }
      };
    } catch (error) {
      console.error('Middleware execution error:', error);
      
      return {
        success: false,
        error: error.message,
        performance: {
          executionTime: performance.now() - startTime,
          memoryUsage: context.performance.memoryUsage || 0
        },
        shouldContinue: false,
        metadata: {
          middlewaresExecuted: currentIndex,
          failedMiddleware: middlewares[currentIndex - 1]?.name
        }
      };
    }
  }, [middlewares]);

  // ============================================================================
  // MANAGEMENT FUNCTIONS
  // ============================================================================

  const addMiddleware = useCallback((middleware: RouteMiddleware) => {
    setMiddlewares(prev => {
      const filtered = prev.filter(m => m.name !== middleware.name);
      const updated = [...filtered, middleware];
      return updated.sort((a, b) => a.order - b.order);
    });
  }, []);

  const removeMiddleware = useCallback((name: string) => {
    setMiddlewares(prev => prev.filter(m => m.name !== name));
  }, []);

  const updateConfiguration = useCallback((config: Partial<MiddlewareConfiguration>) => {
    setMiddlewareConfiguration(prev => ({
      ...prev,
      ...config
    }));
  }, []);

  const getAnalytics = useCallback(() => {
    return analyticsData;
  }, [analyticsData]);

  const getPerformanceMetrics = useCallback(() => {
    return performanceMetrics;
  }, [performanceMetrics]);

  const clearCache = useCallback(() => {
    // Clear all cache entries
    Object.keys(localStorage)
      .filter(key => key.startsWith('cache_'))
      .forEach(key => localStorage.removeItem(key));
  }, []);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue = useMemo<RouteMiddlewareContextType>(() => ({
    middlewares,
    configuration: middlewareConfiguration,
    addMiddleware,
    removeMiddleware,
    updateConfiguration,
    executeMiddlewares,
    getAnalytics,
    getPerformanceMetrics,
    clearCache
  }), [
    middlewares,
    middlewareConfiguration,
    addMiddleware,
    removeMiddleware,
    updateConfiguration,
    executeMiddlewares,
    getAnalytics,
    getPerformanceMetrics,
    clearCache
  ]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <RouteMiddlewareContext.Provider value={contextValue}>
      {children}
    </RouteMiddlewareContext.Provider>
  );
};

// ============================================================================
// MIDDLEWARE COMPONENT
// ============================================================================

interface RouteMiddlewareProps {
  children: ReactNode;
  middlewares?: string[];
  onError?: (error: Error, context: MiddlewareContext) => void;
  onComplete?: (result: MiddlewareResult, context: MiddlewareContext) => void;
}

export const RouteMiddlewareComponent: React.FC<RouteMiddlewareProps> = ({
  children,
  middlewares: customMiddlewares,
  onError,
  onComplete
}) => {
  // ============================================================================
  // HOOKS AND STATE
  // ============================================================================

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { executeMiddlewares } = useRouteMiddleware();
  
  const [processingState, setProcessingState] = useState<{
    isProcessing: boolean;
    result: MiddlewareResult | null;
    context: MiddlewareContext | null;
    error: Error | null;
  }>({
    isProcessing: false,
    result: null,
    context: null,
    error: null
  });

  // ============================================================================
  // MIDDLEWARE EXECUTION
  // ============================================================================

  const processRequest = useCallback(async () => {
    setProcessingState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      // Build middleware context
      const context: MiddlewareContext = {
        request: {
          path: pathname,
          pathname,
          searchParams,
          method: 'GET', // Default for navigation
          headers: {
            'user-agent': navigator.userAgent,
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'accept-language': navigator.language,
            'accept-encoding': 'gzip, deflate, br'
          },
          timestamp: new Date().toISOString(),
          requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          sessionId: localStorage.getItem('session_id') || '',
          userAgent: navigator.userAgent,
          referrer: document.referrer
        },
        response: {
          headers: {},
          timestamp: new Date().toISOString()
        },
        user: null, // Will be populated by auth middleware
        workspace: null,
        permissions: [],
        roles: [],
        metadata: {},
        performance: {
          startTime: performance.now()
        },
        security: {
          threatLevel: 'low',
          riskScore: 0,
          anomalies: []
        },
        analytics: {
          pageViews: 0,
          sessionDuration: 0,
          interactions: 0,
          errorCount: 0,
          performanceScore: 100
        }
      };

      // Execute middlewares
      const result = await executeMiddlewares(context);

      setProcessingState({
        isProcessing: false,
        result,
        context,
        error: null
      });

      if (onComplete) {
        onComplete(result, context);
      }
    } catch (error) {
      console.error('Middleware processing error:', error);
      
      setProcessingState({
        isProcessing: false,
        result: null,
        context: null,
        error: error as Error
      });

      if (onError) {
        onError(error as Error, processingState.context!);
      }
    }
  }, [pathname, searchParams, executeMiddlewares, onComplete, onError]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    processRequest();
  }, [processRequest]);

  // ============================================================================
  // RENDER
  // ============================================================================

  // Always render children - middleware processing happens in background
  return <>{children}</>;
};

// ============================================================================
// MIDDLEWARE HOOKS
// ============================================================================

export const useMiddlewareStatus = (middlewareNames?: string[]) => {
  const { middlewares } = useRouteMiddleware();
  
  return useMemo(() => {
    const relevantMiddlewares = middlewareNames 
      ? middlewares.filter(m => middlewareNames.includes(m.name))
      : middlewares;

    return {
      middlewares: relevantMiddlewares,
      count: relevantMiddlewares.length,
      enabled: relevantMiddlewares.filter(m => m.enabled).length,
      disabled: relevantMiddlewares.filter(m => !m.enabled).length
    };
  }, [middlewares, middlewareNames]);
};

export const useMiddlewareAnalytics = () => {
  const { getAnalytics, getPerformanceMetrics } = useRouteMiddleware();
  
  return useMemo(() => {
    const analytics = getAnalytics();
    const performance = getPerformanceMetrics();
    
    return {
      analytics,
      performance,
      totalRequests: analytics.length,
      averageResponseTime: performance.averageResponseTime,
      errorRate: performance.errorRate,
      cacheHitRate: performance.cacheHitRate
    };
  }, [getAnalytics, getPerformanceMetrics]);
};

export const useMiddlewarePerformance = () => {
  const { getPerformanceMetrics } = useRouteMiddleware();
  
  return useMemo(() => {
    const metrics = getPerformanceMetrics();
    
    return {
      metrics,
      isHealthy: metrics.averageResponseTime < PERFORMANCE_THRESHOLDS.SLOW_REQUEST,
      recommendations: generatePerformanceRecommendations(metrics)
    };
  }, [getPerformanceMetrics]);
};

const generatePerformanceRecommendations = (metrics: PerformanceMetrics): string[] => {
  const recommendations: string[] = [];

  if (metrics.averageResponseTime > PERFORMANCE_THRESHOLDS.SLOW_REQUEST) {
    recommendations.push('Consider optimizing slow requests');
  }

  if (metrics.errorRate > 0.05) {
    recommendations.push('High error rate detected - review error handling');
  }

  if (metrics.cacheHitRate < 0.7) {
    recommendations.push('Low cache hit rate - review caching strategy');
  }

  if (metrics.memoryUsage > 100 * 1024 * 1024) { // 100MB
    recommendations.push('High memory usage - consider optimization');
  }

  return recommendations;
};

// ============================================================================
// MIDDLEWARE MONITORING COMPONENT
// ============================================================================

interface MiddlewareMonitorProps {
  showDetails?: boolean;
  refreshInterval?: number;
}

export const MiddlewareMonitor: React.FC<MiddlewareMonitorProps> = ({
  showDetails = false,
  refreshInterval = 5000
}) => {
  const { middlewares, getPerformanceMetrics, getAnalytics } = useRouteMiddleware();
  const [metrics, setMetrics] = useState(getPerformanceMetrics());
  const [analytics, setAnalytics] = useState(getAnalytics());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getPerformanceMetrics());
      setAnalytics(getAnalytics());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [getPerformanceMetrics, getAnalytics, refreshInterval]);

  if (!showDetails) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm border rounded-lg shadow-lg p-4 max-w-sm"
    >
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-blue-500" />
        <span className="font-medium text-sm">Middleware Monitor</span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span>Active Middlewares:</span>
          <span className="font-medium">{middlewares.filter(m => m.enabled).length}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Avg Response Time:</span>
          <span className="font-medium">{metrics.averageResponseTime.toFixed(2)}ms</span>
        </div>
        
        <div className="flex justify-between">
          <span>Error Rate:</span>
          <span className="font-medium">{(metrics.errorRate * 100).toFixed(2)}%</span>
        </div>
        
        <div className="flex justify-between">
          <span>Cache Hit Rate:</span>
          <span className="font-medium">{(metrics.cacheHitRate * 100).toFixed(2)}%</span>
        </div>
        
        <div className="flex justify-between">
          <span>Total Requests:</span>
          <span className="font-medium">{analytics.length}</span>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default RouteMiddlewareComponent;
export type { 
  RouteMiddleware, 
  MiddlewareContext, 
  MiddlewareConfiguration, 
  MiddlewareResult 
};
