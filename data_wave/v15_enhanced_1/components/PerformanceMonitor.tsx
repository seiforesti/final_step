import React, { useEffect, useState } from "react";
import {
  usePerformanceMonitor,
  formatMetrics,
  getOptimizationRecommendations,
} from "../hooks/usePerformanceMonitor";

interface PerformanceMonitorProps {
  showRecommendations?: boolean;
  onPerformanceAlert?: (recommendations: string[]) => void;
  minimized?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  showRecommendations = true,
  onPerformanceAlert,
  minimized = false,
}) => {
  const metrics = usePerformanceMonitor({ enabled: true });
  const [isExpanded, setIsExpanded] = useState(!minimized);
  const formattedMetrics = formatMetrics(metrics);

  useEffect(() => {
    if (onPerformanceAlert) {
      const recommendations = getOptimizationRecommendations(metrics);
      if (recommendations.length > 0) {
        onPerformanceAlert(recommendations);
      }
    }
  }, [metrics, onPerformanceAlert]);

  if (!isExpanded) {
    return (
      <div
        className="fixed bottom-4 right-4 bg-slate-800 text-white p-2 rounded-lg shadow-lg cursor-pointer hover:bg-slate-700 transition-colors"
        onClick={() => setIsExpanded(true)}
      >
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              metrics.fps < 30
                ? "bg-red-500"
                : metrics.fps < 50
                ? "bg-yellow-500"
                : "bg-green-500"
            }`}
          />
          <span>{formattedMetrics.fps}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-slate-800 text-white p-4 rounded-lg shadow-lg max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Performance Monitor</h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          Minimize
        </button>
      </div>

      <div className="space-y-4">
        {/* Basic Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-slate-400 text-sm">FPS</div>
            <div
              className={`text-lg font-medium ${
                metrics.fps < 30
                  ? "text-red-400"
                  : metrics.fps < 50
                  ? "text-yellow-400"
                  : "text-green-400"
              }`}
            >
              {formattedMetrics.fps}
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-sm">Memory Usage</div>
            <div className="text-lg font-medium">
              {formattedMetrics.memory.used} / {formattedMetrics.memory.total}
            </div>
          </div>
        </div>

        {/* Network & Interactions */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-slate-400 text-sm">Network Requests</div>
            <div className="text-sm">
              <div>Total: {formattedMetrics.network.total}</div>
              <div>Failed: {formattedMetrics.network.failed}</div>
              <div>Avg Response: {formattedMetrics.network.avgResponse}</div>
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-sm">Interaction Delay</div>
            <div
              className={`text-lg font-medium ${
                metrics.interactionDelay > 300
                  ? "text-red-400"
                  : metrics.interactionDelay > 100
                  ? "text-yellow-400"
                  : "text-green-400"
              }`}
            >
              {formattedMetrics.interaction}
            </div>
          </div>
        </div>

        {/* Long Tasks & Resource Hints */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-slate-400 text-sm">Long Tasks</div>
            <div
              className={`text-lg font-medium ${
                metrics.longTasks > 10
                  ? "text-red-400"
                  : metrics.longTasks > 5
                  ? "text-yellow-400"
                  : "text-green-400"
              }`}
            >
              {formattedMetrics.longTasks}
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-sm">Resource Hints</div>
            <div className="text-sm">
              <div>Preload: {formattedMetrics.resourceHints.preload}</div>
              <div>Prefetch: {formattedMetrics.resourceHints.prefetch}</div>
              <div>Preconnect: {formattedMetrics.resourceHints.preconnect}</div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {showRecommendations && (
          <div className="mt-4">
            <div className="text-slate-400 text-sm mb-2">Recommendations</div>
            <div className="space-y-2">
              {getOptimizationRecommendations(metrics).map(
                (recommendation, index) => (
                  <div
                    key={index}
                    className={`text-sm p-2 rounded ${
                      recommendation.startsWith("Critical")
                        ? "bg-red-900/50 text-red-200"
                        : recommendation.startsWith("Warning")
                        ? "bg-yellow-900/50 text-yellow-200"
                        : "bg-slate-700/50 text-slate-200"
                    }`}
                  >
                    {recommendation}
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceMonitor;
