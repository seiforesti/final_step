import { useState, useEffect, useRef, useMemo } from "react";

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  cpuUsage?: number;
  longTasks: number;
  networkRequests: {
    total: number;
    failed: number;
    averageResponseTime: number;
  };
  resourceHints: {
    preload: number;
    prefetch: number;
    preconnect: number;
  };
  interactionDelay: number;
}

export function usePerformanceMonitor(options = { enabled: true }) {
  // Stabilize options to prevent infinite re-renders
  const stableOptions = useMemo(() => options, [options.enabled]);
  
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memoryUsage: {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0,
    },
    longTasks: 0,
    networkRequests: {
      total: 0,
      failed: 0,
      averageResponseTime: 0,
    },
    resourceHints: {
      preload: 0,
      prefetch: 0,
      preconnect: 0,
    },
    interactionDelay: 0,
  });

  // Use refs to store observers and intervals to prevent recreation on every render
  const observersRef = useRef<{
    longTask: PerformanceObserver | null;
    network: PerformanceObserver | null;
    interaction: PerformanceObserver | null;
  }>({ longTask: null, network: null, interaction: null });

  const intervalsRef = useRef<{
    memory: NodeJS.Timeout | null;
    hints: NodeJS.Timeout | null;
    cpu: NodeJS.Timeout | null;
  }>({ memory: null, hints: null, cpu: null });

  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stableOptions.enabled) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    // FPS Tracking
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      const elapsedTime = currentTime - lastTime;

      if (elapsedTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / elapsedTime);
        setMetrics((prev) => ({ ...prev, fps }));
        frameCount = 0;
        lastTime = currentTime;
      }

      animationFrameRef.current = requestAnimationFrame(measureFPS);
    };

    // Memory Usage
    const trackMemory = () => {
      if ("memory" in performance) {
        const memory = (performance as any).memory;
        setMetrics((prev) => ({
          ...prev,
          memoryUsage: {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
          },
        }));
      }
    };

    // Long Tasks
    const longTaskObserver = new PerformanceObserver((list) => {
      const longTasks = list.getEntries().length;
      setMetrics((prev) => ({
        ...prev,
        longTasks: prev.longTasks + longTasks,
      }));
    });

    // Network Requests
    const networkObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceResourceTiming[];
      const failedRequests = entries.filter(
        (entry) => !entry.responseEnd
      ).length;
      const responseTime =
        entries.reduce((acc, entry) => acc + entry.duration, 0) /
        entries.length;

      setMetrics((prev) => ({
        ...prev,
        networkRequests: {
          total: prev.networkRequests.total + entries.length,
          failed: prev.networkRequests.failed + failedRequests,
          averageResponseTime:
            responseTime || prev.networkRequests.averageResponseTime,
        },
      }));
    });

    // Interaction Delay
    const interactionObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceEventTiming[];
      const maxDelay = Math.max(...entries.map((entry) => entry.duration));

      setMetrics((prev) => ({
        ...prev,
        interactionDelay: maxDelay,
      }));
    });

    // Resource Hints
    function countResourceHints() {
      const hints = {
        preload: document.querySelectorAll('link[rel="preload"]').length,
        prefetch: document.querySelectorAll('link[rel="prefetch"]').length,
        preconnect: document.querySelectorAll('link[rel="preconnect"]').length,
      };

      setMetrics((prev) => ({
        ...prev,
        resourceHints: hints,
      }));
    }

    // Start monitoring
    try {
      animationFrameRef.current = requestAnimationFrame(measureFPS);

      intervalsRef.current.memory = setInterval(trackMemory, 5000);

      observersRef.current.longTask = longTaskObserver;
      observersRef.current.network = networkObserver;
      observersRef.current.interaction = interactionObserver;

      longTaskObserver.observe({ entryTypes: ["longtask"] });
      networkObserver.observe({ entryTypes: ["resource"] });
      interactionObserver.observe({ entryTypes: ["event"] });

      intervalsRef.current.hints = setInterval(countResourceHints, 10000);

      // CPU Usage (experimental)
      if ("cpuUsage" in process) {
        intervalsRef.current.cpu = setInterval(() => {
          const usage = (process as any).cpuUsage();
          const total = usage.user + usage.system;
          const cpuPercentage = (total / (process.uptime() * 1000000)) * 100;
          setMetrics((prev) => ({ ...prev, cpuUsage: cpuPercentage }));
        }, 5000);

        return () => {
          if (intervalsRef.current.cpu) clearInterval(intervalsRef.current.cpu);
          if (intervalsRef.current.memory) clearInterval(intervalsRef.current.memory);
          if (intervalsRef.current.hints) clearInterval(intervalsRef.current.hints);
          if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
          if (observersRef.current.longTask) observersRef.current.longTask.disconnect();
          if (observersRef.current.network) observersRef.current.network.disconnect();
          if (observersRef.current.interaction) observersRef.current.interaction.disconnect();
        };
      }

      return () => {
        if (intervalsRef.current.memory) clearInterval(intervalsRef.current.memory);
        if (intervalsRef.current.hints) clearInterval(intervalsRef.current.hints);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (observersRef.current.longTask) observersRef.current.longTask.disconnect();
        if (observersRef.current.network) observersRef.current.network.disconnect();
        if (observersRef.current.interaction) observersRef.current.interaction.disconnect();
      };
    } catch (error) {
      console.error("Performance monitoring setup failed:", error);
      return () => {};
    }
  }, [stableOptions.enabled]);

  // Cleanup effect to reset refs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up any remaining intervals and observers
      if (intervalsRef.current.memory) clearInterval(intervalsRef.current.memory);
      if (intervalsRef.current.hints) clearInterval(intervalsRef.current.hints);
      if (intervalsRef.current.cpu) clearInterval(intervalsRef.current.cpu);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (observersRef.current.longTask) observersRef.current.longTask.disconnect();
      if (observersRef.current.network) observersRef.current.network.disconnect();
      if (observersRef.current.interaction) observersRef.current.interaction.disconnect();
    };
  }, []);

  return metrics;
}

// Helper function to format metrics for display
export function formatMetrics(metrics: PerformanceMetrics) {
  return {
    fps: `${metrics.fps} FPS`,
    memory: {
      used: `${Math.round(metrics.memoryUsage.usedJSHeapSize / 1048576)}MB`,
      total: `${Math.round(metrics.memoryUsage.totalJSHeapSize / 1048576)}MB`,
      limit: `${Math.round(metrics.memoryUsage.jsHeapSizeLimit / 1048576)}MB`,
    },
    longTasks: `${metrics.longTasks} long tasks`,
    network: {
      total: `${metrics.networkRequests.total} requests`,
      failed: `${metrics.networkRequests.failed} failed`,
      avgResponse: `${Math.round(
        metrics.networkRequests.averageResponseTime
      )}ms`,
    },
    resourceHints: {
      preload: `${metrics.resourceHints.preload} preloaded`,
      prefetch: `${metrics.resourceHints.prefetch} prefetched`,
      preconnect: `${metrics.resourceHints.preconnect} preconnected`,
    },
    interaction: `${Math.round(metrics.interactionDelay)}ms delay`,
  };
}

// Performance thresholds for alerting
export const PERFORMANCE_THRESHOLDS = {
  fps: {
    warning: 30,
    critical: 15,
  },
  memoryUsage: {
    warning: 0.7, // 70% of total
    critical: 0.9, // 90% of total
  },
  longTasks: {
    warning: 5,
    critical: 10,
  },
  networkResponseTime: {
    warning: 1000, // 1 second
    critical: 3000, // 3 seconds
  },
  interactionDelay: {
    warning: 100, // 100ms
    critical: 300, // 300ms
  },
};

// Performance optimization recommendations
export function getOptimizationRecommendations(metrics: PerformanceMetrics) {
  const recommendations: string[] = [];

  // FPS Recommendations
  if (metrics.fps < PERFORMANCE_THRESHOLDS.fps.critical) {
    recommendations.push(
      "Critical: Severe frame rate issues. Consider reducing animations and visual effects."
    );
  } else if (metrics.fps < PERFORMANCE_THRESHOLDS.fps.warning) {
    recommendations.push(
      "Warning: Frame rate is below optimal. Review animations and heavy UI operations."
    );
  }

  // Memory Recommendations
  const memoryUsageRatio =
    metrics.memoryUsage.usedJSHeapSize / metrics.memoryUsage.totalJSHeapSize;
  if (memoryUsageRatio > PERFORMANCE_THRESHOLDS.memoryUsage.critical) {
    recommendations.push(
      "Critical: Memory usage is very high. Check for memory leaks and implement cleanup."
    );
  } else if (memoryUsageRatio > PERFORMANCE_THRESHOLDS.memoryUsage.warning) {
    recommendations.push(
      "Warning: Memory usage is high. Consider implementing memory optimization strategies."
    );
  }

  // Long Tasks Recommendations
  if (metrics.longTasks > PERFORMANCE_THRESHOLDS.longTasks.critical) {
    recommendations.push(
      "Critical: Too many long tasks detected. Review and optimize heavy computations."
    );
  } else if (metrics.longTasks > PERFORMANCE_THRESHOLDS.longTasks.warning) {
    recommendations.push(
      "Warning: Long tasks may be affecting performance. Consider breaking down operations."
    );
  }

  // Network Recommendations
  if (
    metrics.networkRequests.averageResponseTime >
    PERFORMANCE_THRESHOLDS.networkResponseTime.critical
  ) {
    recommendations.push(
      "Critical: Network response times are very slow. Review API calls and implement caching."
    );
  } else if (
    metrics.networkRequests.averageResponseTime >
    PERFORMANCE_THRESHOLDS.networkResponseTime.warning
  ) {
    recommendations.push(
      "Warning: Network response times are high. Consider optimization techniques like prefetching."
    );
  }

  // Interaction Delay Recommendations
  if (
    metrics.interactionDelay > PERFORMANCE_THRESHOLDS.interactionDelay.critical
  ) {
    recommendations.push(
      "Critical: Significant interaction delays detected. Review event handlers and UI blocking code."
    );
  } else if (
    metrics.interactionDelay > PERFORMANCE_THRESHOLDS.interactionDelay.warning
  ) {
    recommendations.push(
      "Warning: Interaction delays may affect user experience. Consider optimizing event handlers."
    );
  }

  // Resource Hints Recommendations
  const totalHints = Object.values(metrics.resourceHints).reduce(
    (a, b) => a + b,
    0
  );
  if (totalHints === 0) {
    recommendations.push(
      "Consider implementing resource hints (preload, prefetch, preconnect) for better performance."
    );
  }

  return recommendations;
}
