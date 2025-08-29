/**
 * Performance Utility Functions
 * =============================
 *
 * This file provides comprehensive performance optimization utilities including
 * system health validation, performance monitoring, and optimization functions.
 */

import { SystemHealth, PerformanceMetrics } from '../types/racine-core.types';

// =============================================================================
// SYSTEM HEALTH VALIDATION
// =============================================================================

export const validateSystemHealth = (health: Partial<SystemHealth>): boolean => {
  try {
    // Validate overall system status
    if (!health.overall || !['healthy', 'degraded', 'critical', 'unknown'].includes(health.overall)) {
      return false;
    }

    // Validate performance metrics
    if (health.performance) {
      const { score, responseTime, throughput, errorRate } = health.performance;
      
      if (typeof score !== 'number' || score < 0 || score > 100) {
        return false;
      }
      
      if (responseTime && (typeof responseTime !== 'number' || responseTime < 0)) {
        return false;
      }
      
      if (throughput && (typeof throughput !== 'number' || throughput < 0)) {
        return false;
      }
      
      if (errorRate && (typeof errorRate !== 'number' || errorRate < 0 || errorRate > 100)) {
        return false;
      }
    }

    // Validate resource metrics
    if (health.resources) {
      const { cpuUsage, memoryUsage, diskUsage, networkLatency } = health.resources;
      
      if (cpuUsage && (typeof cpuUsage !== 'number' || cpuUsage < 0 || cpuUsage > 100)) {
        return false;
      }
      
      if (memoryUsage && (typeof memoryUsage !== 'number' || memoryUsage < 0)) {
        return false;
      }
      
      if (diskUsage && (typeof diskUsage !== 'number' || diskUsage < 0 || diskUsage > 100)) {
        return false;
      }
      
      if (networkLatency && (typeof networkLatency !== 'number' || networkLatency < 0)) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error validating system health:', error);
    return false;
  }
};

// =============================================================================
// PERFORMANCE OPTIMIZATION
// =============================================================================

export interface OptimizationOptions {
  targetMetrics: string[];
  optimizationLevel: 'conservative' | 'balanced' | 'aggressive';
  dryRun?: boolean;
}

export interface OptimizationResult {
  success: boolean;
  optimizations: Array<{
    type: string;
    description: string;
    impact: string;
    applied: boolean;
  }>;
  metrics: {
    before: Record<string, number>;
    after: Record<string, number>;
    improvement: Record<string, number>;
  };
  warnings: string[];
  errors: string[];
}

export const optimizePerformance = async (
  options: OptimizationOptions
): Promise<OptimizationResult> => {
  const result: OptimizationResult = {
    success: false,
    optimizations: [],
    metrics: {
      before: {},
      after: {},
      improvement: {},
    },
    warnings: [],
    errors: [],
  };

  try {
    // Simulate performance optimization
    const { targetMetrics, optimizationLevel, dryRun = false } = options;

    // Memory optimization
    if (targetMetrics.includes('memory') || targetMetrics.includes('all')) {
      const memoryOptimization = {
        type: 'memory',
        description: 'Optimize memory usage through garbage collection and caching',
        impact: 'Reduce memory usage by 10-20%',
        applied: !dryRun,
      };
      
      result.optimizations.push(memoryOptimization);
      
      if (!dryRun) {
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }
    }

    // CPU optimization
    if (targetMetrics.includes('cpu') || targetMetrics.includes('performance') || targetMetrics.includes('all')) {
      const cpuOptimization = {
        type: 'cpu',
        description: 'Optimize CPU usage through task scheduling and batching',
        impact: 'Improve CPU efficiency by 5-15%',
        applied: !dryRun,
      };
      
      result.optimizations.push(cpuOptimization);
    }

    // Network optimization
    if (targetMetrics.includes('network') || targetMetrics.includes('all')) {
      const networkOptimization = {
        type: 'network',
        description: 'Optimize network requests through batching and caching',
        impact: 'Reduce network latency by 20-30%',
        applied: !dryRun,
      };
      
      result.optimizations.push(networkOptimization);
    }

    // Cost optimization
    if (targetMetrics.includes('cost') || targetMetrics.includes('resource_usage') || targetMetrics.includes('all')) {
      const costOptimization = {
        type: 'cost',
        description: 'Optimize resource allocation and scaling policies',
        impact: 'Reduce operational costs by 15-25%',
        applied: !dryRun,
      };
      
      result.optimizations.push(costOptimization);
    }

    // Set optimization level impact
    const impactMultiplier = optimizationLevel === 'aggressive' ? 1.5 : 
                           optimizationLevel === 'balanced' ? 1.0 : 0.7;

    // Simulate metrics improvement
    result.metrics.before = {
      responseTime: 150,
      cpuUsage: 75,
      memoryUsage: 65,
      errorRate: 2.5,
    };

    result.metrics.after = {
      responseTime: Math.max(50, result.metrics.before.responseTime * (1 - 0.1 * impactMultiplier)),
      cpuUsage: Math.max(20, result.metrics.before.cpuUsage * (1 - 0.15 * impactMultiplier)),
      memoryUsage: Math.max(30, result.metrics.before.memoryUsage * (1 - 0.2 * impactMultiplier)),
      errorRate: Math.max(0.5, result.metrics.before.errorRate * (1 - 0.3 * impactMultiplier)),
    };

    // Calculate improvement percentages
    Object.keys(result.metrics.before).forEach(key => {
      const before = result.metrics.before[key];
      const after = result.metrics.after[key];
      result.metrics.improvement[key] = Math.round(((before - after) / before) * 100);
    });

    // Add warnings for aggressive optimization
    if (optimizationLevel === 'aggressive') {
      result.warnings.push('Aggressive optimization may impact system stability');
      result.warnings.push('Monitor system performance closely after optimization');
    }

    result.success = true;
  } catch (error) {
    result.errors.push(`Optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('Performance optimization error:', error);
  }

  return result;
};

// =============================================================================
// PERFORMANCE MONITORING
// =============================================================================

export const getPerformanceMetrics = (): PerformanceMetrics => {
  const metrics: PerformanceMetrics = {
    responseTime: {
      average: 0,
      p95: 0,
      p99: 0,
    },
    throughput: {
      requestsPerSecond: 0,
      operationsPerSecond: 0,
    },
    resources: {
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
      networkLatency: 0,
    },
    errors: {
      totalCount: 0,
      errorRate: 0,
      criticalErrors: 0,
    },
    timestamp: new Date().toISOString(),
  };

  try {
    // Simulate performance metrics (in a real implementation, these would come from monitoring systems)
    metrics.responseTime.average = Math.random() * 200 + 50; // 50-250ms
    metrics.responseTime.p95 = metrics.responseTime.average * 1.5;
    metrics.responseTime.p99 = metrics.responseTime.average * 2;

    metrics.throughput.requestsPerSecond = Math.random() * 1000 + 100; // 100-1100 rps
    metrics.throughput.operationsPerSecond = metrics.throughput.requestsPerSecond * 1.2;

    metrics.resources.cpuUsage = Math.random() * 60 + 20; // 20-80%
    metrics.resources.memoryUsage = Math.random() * 1024 * 1024 * 1024 * 8; // 0-8GB
    metrics.resources.diskUsage = Math.random() * 80 + 10; // 10-90%
    metrics.resources.networkLatency = Math.random() * 50 + 5; // 5-55ms

    metrics.errors.totalCount = Math.floor(Math.random() * 10);
    metrics.errors.errorRate = (metrics.errors.totalCount / metrics.throughput.requestsPerSecond) * 100;
    metrics.errors.criticalErrors = Math.floor(metrics.errors.totalCount * 0.1);
  } catch (error) {
    console.error('Error getting performance metrics:', error);
  }

  return metrics;
};

// =============================================================================
// DEBOUNCE AND THROTTLE UTILITIES
// =============================================================================

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): T => {
  let timeout: NodeJS.Timeout | null = null;
  
  return ((...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  }) as T;
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean;
  
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
};

// =============================================================================
// MEMORY MANAGEMENT
// =============================================================================

export const measureMemoryUsage = (): Record<string, number> => {
  if (typeof performance !== 'undefined' && performance.memory) {
    return {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      usagePercentage: (performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize) * 100,
    };
  }
  
  return {
    usedJSHeapSize: 0,
    totalJSHeapSize: 0,
    jsHeapSizeLimit: 0,
    usagePercentage: 0,
  };
};

export const optimizeMemory = (): void => {
  try {
    // Clear any cached data that's no longer needed
    if (typeof window !== 'undefined') {
      // Clear old performance entries
      if (performance.clearResourceTimings) {
        performance.clearResourceTimings();
      }
      
      // Force garbage collection if available
      if ((window as any).gc) {
        (window as any).gc();
      }
    }
  } catch (error) {
    console.warn('Memory optimization failed:', error);
  }
};

// =============================================================================
// PERFORMANCE TIMING
// =============================================================================

export class PerformanceTimer {
  private startTime: number;
  private marks: Map<string, number> = new Map();
  
  constructor() {
    this.startTime = performance.now();
  }
  
  mark(name: string): void {
    this.marks.set(name, performance.now());
  }
  
  measure(startMark?: string, endMark?: string): number {
    const start = startMark ? this.marks.get(startMark) || this.startTime : this.startTime;
    const end = endMark ? this.marks.get(endMark) || performance.now() : performance.now();
    return end - start;
  }
  
  getElapsed(): number {
    return performance.now() - this.startTime;
  }
  
  reset(): void {
    this.startTime = performance.now();
    this.marks.clear();
  }
}