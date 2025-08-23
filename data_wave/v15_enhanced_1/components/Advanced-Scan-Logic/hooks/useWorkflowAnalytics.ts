// Advanced Workflow Analytics Hooks
// Comprehensive React hooks for workflow analytics and insights

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  WorkflowAnalytics,
  WorkflowMetrics,
  WorkflowPerformance,
  WorkflowTrends,
  WorkflowInsights,
  WorkflowRecommendations,
  WorkflowStatistics,
  WorkflowKPIs,
  WorkflowDashboard,
  WorkflowReport,
  WorkflowBenchmark,
  WorkflowOptimization,
  WorkflowPrediction,
  WorkflowAnomaly,
  WorkflowAlert,
  WorkflowNotification,
  WorkflowAudit,
  WorkflowHistory,
  WorkflowComparison,
  WorkflowCorrelation,
  WorkflowSegmentation,
  WorkflowCohort,
  WorkflowFunnel,
  WorkflowJourney,
  WorkflowTimeline,
  WorkflowHeatmap,
  WorkflowDistribution,
  WorkflowRegression,
  WorkflowClustering,
  WorkflowClassification,
  WorkflowForecasting,
  AnalyticsFilter,
  AnalyticsQuery,
  AnalyticsVisualization,
  AnalyticsExport,
  AnalyticsConfiguration
} from '../types/workflow.types';

import {
  aggregateWorkflowData,
  detectWorkflowAnomalies,
  predictWorkflowOutcomes,
  exportAnalyticsData
} from '../services/scan-workflow-apis';

import {
  calculateStandardDeviation,
  calculateVariance,
  calculateSeasonality,
  calculateCyclicality,
  calculateForecast,
  calculateReliability,
  calculateStability,
  formatTimestamp
} from '../utils/workflow-analytics';

// Hook options interface
interface UseWorkflowAnalyticsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealTimeUpdates?: boolean;
  enableAnomalyDetection?: boolean;
  enablePredictions?: boolean;
  onAnomalyDetected?: (anomaly: WorkflowAnomaly) => void;
  onPredictionGenerated?: (prediction: WorkflowPrediction) => void;
  onError?: (error: Error) => void;
}

// Main analytics hook
export const useWorkflowAnalytics = (options: UseWorkflowAnalyticsOptions = {}) => {
  const {
    autoRefresh = true,
    refreshInterval = 30000,
    enableRealTimeUpdates = true,
    enableAnomalyDetection = true,
    enablePredictions = true,
    onAnomalyDetected,
    onPredictionGenerated,
    onError
  } = options;

  const queryClient = useQueryClient();

  // Analytics data queries
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics
  } = useQuery({
    queryKey: ['workflow-analytics'],
    queryFn: async () => {
      const response = await fetch('/api/workflow/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics data');
      return response.json();
    },
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 60000
  });

  // Anomaly detection
  const {
    data: anomalies,
    isLoading: anomaliesLoading,
    error: anomaliesError
  } = useQuery({
    queryKey: ['workflow-anomalies'],
    queryFn: async () => {
      if (!enableAnomalyDetection) return [];
      return detectWorkflowAnomalies(analyticsData?.workflows || []);
    },
    enabled: enableAnomalyDetection && !!analyticsData,
    refetchInterval: autoRefresh ? refreshInterval : false
  });

  // Predictions
  const {
    data: predictions,
    isLoading: predictionsLoading,
    error: predictionsError
  } = useQuery({
    queryKey: ['workflow-predictions'],
    queryFn: async () => {
      if (!enablePredictions) return [];
      const predictions = [];
      for (const workflow of analyticsData?.workflows || []) {
        const prediction = await predictWorkflowOutcomes(workflow.id, {});
        predictions.push(prediction);
      }
      return predictions;
    },
    enabled: enablePredictions && !!analyticsData,
    refetchInterval: autoRefresh ? refreshInterval : false
  });

  // Export analytics data
  const exportMutation = useMutation({
    mutationFn: async ({ filters, format }: { filters: AnalyticsFilter; format: string }) => {
      return exportAnalyticsData(filters, format);
    },
    onSuccess: (data) => {
      toast.success('Analytics data exported successfully');
      return data;
    },
    onError: (error) => {
      toast.error('Failed to export analytics data');
      onError?.(error as Error);
    }
  });

  // Notify about anomalies
  useEffect(() => {
    if (anomalies && onAnomalyDetected) {
      anomalies.forEach(anomaly => {
        onAnomalyDetected(anomaly);
      });
    }
  }, [anomalies, onAnomalyDetected]);

  // Notify about predictions
  useEffect(() => {
    if (predictions && onPredictionGenerated) {
      predictions.forEach(prediction => {
        onPredictionGenerated(prediction);
      });
    }
  }, [predictions, onPredictionGenerated]);

  return {
    // Data
    analytics: analyticsData,
    anomalies,
    predictions,
    
    // Loading states
    analyticsLoading,
    anomaliesLoading,
    predictionsLoading,
    isLoading: analyticsLoading || anomaliesLoading || predictionsLoading,
    
    // Errors
    analyticsError,
    anomaliesError,
    predictionsError,
    error: analyticsError || anomaliesError || predictionsError,
    
    // Actions
    refetchAnalytics,
    exportAnalytics: exportMutation.mutate,
    exportLoading: exportMutation.isPending
  };
};

// Metrics hook
export const useWorkflowMetrics = (workflowId?: string) => {
  const {
    data: metrics,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workflow-metrics', workflowId],
    queryFn: async () => {
      const response = await fetch(`/api/workflow/metrics${workflowId ? `?workflowId=${workflowId}` : ''}`);
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    },
    enabled: !!workflowId || true
  });

  return { metrics, isLoading, error };
};

// Performance hook
export const useWorkflowPerformance = (workflowId?: string) => {
  const {
    data: performance,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workflow-performance', workflowId],
    queryFn: async () => {
      const response = await fetch(`/api/workflow/performance${workflowId ? `?workflowId=${workflowId}` : ''}`);
      if (!response.ok) throw new Error('Failed to fetch performance data');
      return response.json();
    },
    enabled: !!workflowId || true
  });

  return { performance, isLoading, error };
};

// Trends hook
export const useWorkflowTrends = (timeRange: string = '7d') => {
  const {
    data: trends,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workflow-trends', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/workflow/trends?timeRange=${timeRange}`);
      if (!response.ok) throw new Error('Failed to fetch trends');
      return response.json();
    }
  });

  return { trends, isLoading, error };
};

// Insights hook
export const useWorkflowInsights = () => {
  const {
    data: insights,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workflow-insights'],
    queryFn: async () => {
      const response = await fetch('/api/workflow/insights');
      if (!response.ok) throw new Error('Failed to fetch insights');
      return response.json();
    }
  });

  return { insights, isLoading, error };
};

// Recommendations hook
export const useWorkflowRecommendations = () => {
  const {
    data: recommendations,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workflow-recommendations'],
    queryFn: async () => {
      const response = await fetch('/api/workflow/recommendations');
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      return response.json();
    }
  });

  return { recommendations, isLoading, error };
};

// Statistics hook
export const useWorkflowStatistics = () => {
  const {
    data: statistics,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workflow-statistics'],
    queryFn: async () => {
      const response = await fetch('/api/workflow/statistics');
      if (!response.ok) throw new Error('Failed to fetch statistics');
      return response.json();
    }
  });

  return { statistics, isLoading, error };
};

// KPIs hook
export const useWorkflowKPIs = () => {
  const {
    data: kpis,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workflow-kpis'],
    queryFn: async () => {
      const response = await fetch('/api/workflow/kpis');
      if (!response.ok) throw new Error('Failed to fetch KPIs');
      return response.json();
    }
  });

  return { kpis, isLoading, error };
};

// Dashboard hook
export const useWorkflowDashboard = () => {
  const {
    data: dashboard,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workflow-dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/workflow/dashboard');
      if (!response.ok) throw new Error('Failed to fetch dashboard');
      return response.json();
    }
  });

  return { dashboard, isLoading, error };
};

// Reports hook
export const useWorkflowReports = () => {
  const {
    data: reports,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workflow-reports'],
    queryFn: async () => {
      const response = await fetch('/api/workflow/reports');
      if (!response.ok) throw new Error('Failed to fetch reports');
      return response.json();
    }
  });

  return { reports, isLoading, error };
};

// Benchmarks hook
export const useWorkflowBenchmarks = () => {
  const {
    data: benchmarks,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workflow-benchmarks'],
    queryFn: async () => {
      const response = await fetch('/api/workflow/benchmarks');
      if (!response.ok) throw new Error('Failed to fetch benchmarks');
      return response.json();
    }
  });

  return { benchmarks, isLoading, error };
};

// Optimization hook
export const useWorkflowOptimization = () => {
  const {
    data: optimization,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workflow-optimization'],
    queryFn: async () => {
      const response = await fetch('/api/workflow/optimization');
      if (!response.ok) throw new Error('Failed to fetch optimization data');
      return response.json();
    }
  });

  return { optimization, isLoading, error };
};

// Predictions hook
export const useWorkflowPredictions = () => {
  const {
    data: predictions,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workflow-predictions'],
    queryFn: async () => {
      const response = await fetch('/api/workflow/predictions');
      if (!response.ok) throw new Error('Failed to fetch predictions');
      return response.json();
    }
  });

  return { predictions, isLoading, error };
};

// Anomalies hook
export const useWorkflowAnomalies = () => {
  const {
    data: anomalies,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workflow-anomalies'],
    queryFn: async () => {
      const response = await fetch('/api/workflow/anomalies');
      if (!response.ok) throw new Error('Failed to fetch anomalies');
      return response.json();
    }
  });

  return { anomalies, isLoading, error };
};

// Alerts hook
export const useWorkflowAlerts = () => {
  const {
    data: alerts,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workflow-alerts'],
    queryFn: async () => {
      const response = await fetch('/api/workflow/alerts');
      if (!response.ok) throw new Error('Failed to fetch alerts');
      return response.json();
    }
  });

  return { alerts, isLoading, error };
};

// Notifications hook
export const useWorkflowNotifications = () => {
  const {
    data: notifications,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workflow-notifications'],
    queryFn: async () => {
      const response = await fetch('/api/workflow/notifications');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    }
  });

  return { notifications, isLoading, error };
};

// Audits hook
export const useWorkflowAudits = () => {
  const {
    data: audits,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workflow-audits'],
    queryFn: async () => {
      const response = await fetch('/api/workflow/audits');
      if (!response.ok) throw new Error('Failed to fetch audits');
      return response.json();
    }
  });

  return { audits, isLoading, error };
};

// History hook
export const useWorkflowHistory = () => {
  const {
    data: history,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workflow-history'],
    queryFn: async () => {
      const response = await fetch('/api/workflow/history');
      if (!response.ok) throw new Error('Failed to fetch history');
      return response.json();
    }
  });

  return { history, isLoading, error };
};

// Comparisons hook
export const useWorkflowComparisons = () => {
  const {
    data: comparisons,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workflow-comparisons'],
    queryFn: async () => {
      const response = await fetch('/api/workflow/comparisons');
      if (!response.ok) throw new Error('Failed to fetch comparisons');
      return response.json();
    }
  });

  return { comparisons, isLoading, error };
};

// Correlations hook
export const useWorkflowCorrelations = () => {
  const {
    data: correlations,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workflow-correlations'],
    queryFn: async () => {
      const response = await fetch('/api/workflow/correlations');
      if (!response.ok) throw new Error('Failed to fetch correlations');
      return response.json();
    }
  });

  return { correlations, isLoading, error };
};

// Segmentation hook
export const useWorkflowSegmentation = () => {
  const {
    data: segmentation,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workflow-segmentation'],
    queryFn: async () => {
      const response = await fetch('/api/workflow/segmentation');
      if (!response.ok) throw new Error('Failed to fetch segmentation');
      return response.json();
    }
  });

  return { segmentation, isLoading, error };
};

// Cohorts hook
export const useWorkflowCohorts = () => {
  const {
    data: cohorts,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workflow-cohorts'],
    queryFn: async () => {
      const response = await fetch('/api/workflow/cohorts');
      if (!response.ok) throw new Error('Failed to fetch cohorts');
      return response.json();
    }
  });

  return { cohorts, isLoading, error };
};

// Funnels hook
export const useWorkflowFunnels = () => {
  const {
    data: funnels,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workflow-funnels'],
    queryFn: async () => {
      const response = await fetch('/api/workflow/funnels');
      if (!response.ok) throw new Error('Failed to fetch funnels');
      return response.json();
    }
  });

  return { funnels, isLoading, error };
};

// Journeys hook
export const useWorkflowJourneys = () => {
  const {
    data: journeys,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workflow-journeys'],
    queryFn: async () => {
      const response = await fetch('/api/workflow/journeys');
      if (!response.ok) throw new Error('Failed to fetch journeys');
      return response.json();
    }
  });

  return { journeys, isLoading, error };
};

// Timelines hook
export const useWorkflowTimelines = () => {
  const {
    data: timelines,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workflow-timelines'],
    queryFn: async () => {
      const response = await fetch('/api/workflow/timelines');
      if (!response.ok) throw new Error('Failed to fetch timelines');
      return response.json();
    }
  });

  return { timelines, isLoading, error };
};

// Heatmaps hook
export const useWorkflowHeatmaps = () => {
  const {
    data: heatmaps,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workflow-heatmaps'],
    queryFn: async () => {
      const response = await fetch('/api/workflow/heatmaps');
      if (!response.ok) throw new Error('Failed to fetch heatmaps');
      return response.json();
    }
  });

  return { heatmaps, isLoading, error };
};

// Distributions hook
export const useWorkflowDistributions = () => {
  const {
    data: distributions,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workflow-distributions'],
    queryFn: async () => {
      const response = await fetch('/api/workflow/distributions');
      if (!response.ok) throw new Error('Failed to fetch distributions');
      return response.json();
    }
  });

  return { distributions, isLoading, error };
};

// Regression hook
export const useWorkflowRegression = () => {
  const {
    data: regression,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workflow-regression'],
    queryFn: async () => {
      const response = await fetch('/api/workflow/regression');
      if (!response.ok) throw new Error('Failed to fetch regression data');
      return response.json();
    }
  });

  return { regression, isLoading, error };
};

// Clustering hook
export const useWorkflowClustering = () => {
  const {
    data: clustering,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workflow-clustering'],
    queryFn: async () => {
      const response = await fetch('/api/workflow/clustering');
      if (!response.ok) throw new Error('Failed to fetch clustering data');
      return response.json();
    }
  });

  return { clustering, isLoading, error };
};

// Classification hook
export const useWorkflowClassification = () => {
  const {
    data: classification,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workflow-classification'],
    queryFn: async () => {
      const response = await fetch('/api/workflow/classification');
      if (!response.ok) throw new Error('Failed to fetch classification data');
      return response.json();
    }
  });

  return { classification, isLoading, error };
};

// Forecasting hook
export const useWorkflowForecasting = () => {
  const {
    data: forecasting,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workflow-forecasting'],
    queryFn: async () => {
      const response = await fetch('/api/workflow/forecasting');
      if (!response.ok) throw new Error('Failed to fetch forecasting data');
      return response.json();
    }
  });

  return { forecasting, isLoading, error };
};

// Analytics filters hook
export const useAnalyticsFilters = () => {
  const [filters, setFilters] = useState<AnalyticsFilter>({});

  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return { filters, updateFilter, clearFilters };
};

// Analytics queries hook
export const useAnalyticsQueries = () => {
  const [queries, setQueries] = useState<AnalyticsQuery[]>([]);

  const addQuery = useCallback((query: AnalyticsQuery) => {
    setQueries(prev => [...prev, query]);
  }, []);

  const removeQuery = useCallback((queryId: string) => {
    setQueries(prev => prev.filter(q => q.id !== queryId));
  }, []);

  const updateQuery = useCallback((queryId: string, updates: Partial<AnalyticsQuery>) => {
    setQueries(prev => prev.map(q => q.id === queryId ? { ...q, ...updates } : q));
  }, []);

  return { queries, addQuery, removeQuery, updateQuery };
};

// Analytics visualizations hook
export const useAnalyticsVisualizations = () => {
  const [visualizations, setVisualizations] = useState<AnalyticsVisualization[]>([]);

  const addVisualization = useCallback((visualization: AnalyticsVisualization) => {
    setVisualizations(prev => [...prev, visualization]);
  }, []);

  const removeVisualization = useCallback((visualizationId: string) => {
    setVisualizations(prev => prev.filter(v => v.id !== visualizationId));
  }, []);

  const updateVisualization = useCallback((visualizationId: string, updates: Partial<AnalyticsVisualization>) => {
    setVisualizations(prev => prev.map(v => v.id === visualizationId ? { ...v, ...updates } : v));
  }, []);

  return { visualizations, addVisualization, removeVisualization, updateVisualization };
};

// Analytics exports hook
export const useAnalyticsExports = () => {
  const [exports, setExports] = useState<AnalyticsExport[]>([]);

  const addExport = useCallback((exportData: AnalyticsExport) => {
    setExports(prev => [...prev, exportData]);
  }, []);

  const removeExport = useCallback((exportId: string) => {
    setExports(prev => prev.filter(e => e.id !== exportId));
  }, []);

  return { exports, addExport, removeExport };
};

// Analytics configuration hook
export const useAnalyticsConfiguration = () => {
  const [configuration, setConfiguration] = useState<AnalyticsConfiguration>({
    refreshInterval: 30000,
    enableRealTimeUpdates: true,
    enableAnomalyDetection: true,
    enablePredictions: true,
    chartTheme: 'light',
    dataRetention: '30d'
  });

  const updateConfiguration = useCallback((updates: Partial<AnalyticsConfiguration>) => {
    setConfiguration(prev => ({ ...prev, ...updates }));
  }, []);

  return { configuration, updateConfiguration };
};
