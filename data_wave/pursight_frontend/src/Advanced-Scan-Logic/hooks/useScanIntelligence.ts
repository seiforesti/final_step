// Advanced-Scan-Logic/hooks/useScanIntelligence.ts
// Comprehensive React hook for scan intelligence with AI-powered insights

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ScanIntelligenceInsight,
  PatternRecognitionResult,
  AnomalyDetectionResult,
  PredictiveModel,
  BehavioralAnalysis,
  ThreatDetection,
  ContextualIntelligence,
  IntelligenceReport,
  IntelligenceAnalysisRequest,
  IntelligenceAnalysisResponse,
  IntelligenceMetrics,
  IntelligenceConfiguration,
  IntelligenceInsightType,
  IntelligenceCategory,
  IntelligenceSeverity,
  IntelligenceFilters,
  IntelligenceSort
} from '../types/intelligence.types';
import { scanIntelligenceAPI } from '../services/scan-intelligence-apis';

// Hook options interface
interface UseScanIntelligenceOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealTimeUpdates?: boolean;
  enableThreatMonitoring?: boolean;
  onInsightDetected?: (insight: ScanIntelligenceInsight) => void;
  onThreatDetected?: (threat: ThreatDetection) => void;
  onAnomalyDetected?: (anomaly: AnomalyDetectionResult) => void;
  onError?: (error: Error) => void;
}

// Pagination state
interface PaginationState {
  page: number;
  size: number;
  total: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Hook return type
interface UseScanIntelligenceReturn {
  // Intelligence data
  insights: ScanIntelligenceInsight[];
  selectedInsight: ScanIntelligenceInsight | null;
  analysisResults: IntelligenceAnalysisResponse | null;
  isLoading: boolean;
  isAnalyzing: boolean;
  error: Error | null;
  
  // Pagination and filtering
  pagination: PaginationState;
  filters: IntelligenceFilters;
  sort: IntelligenceSort;
  
  // Intelligence operations
  performAnalysis: (request: IntelligenceAnalysisRequest) => Promise<IntelligenceAnalysisResponse>;
  getInsights: (params?: any) => Promise<void>;
  updateInsight: (insightId: string, updates: Partial<ScanIntelligenceInsight>) => Promise<ScanIntelligenceInsight>;
  dismissInsight: (insightId: string) => Promise<void>;
  
  // Pattern recognition
  recognizePatterns: (scanId: string, config?: any) => Promise<PatternRecognitionResult[]>;
  getPatternHistory: (params?: any) => Promise<PatternRecognitionResult[]>;
  
  // Anomaly detection
  detectAnomalies: (params: any) => Promise<AnomalyDetectionResult[]>;
  getAnomalyInsights: (anomalyId: string) => Promise<any>;
  resolveAnomaly: (anomalyId: string, resolution: any) => Promise<void>;
  
  // Predictive analytics
  getPredictiveModels: () => Promise<PredictiveModel[]>;
  createPredictiveModel: (config: any) => Promise<PredictiveModel>;
  runPrediction: (modelId: string, params: any) => Promise<any>;
  
  // Behavioral analysis
  analyzeBehavior: (params: any) => Promise<BehavioralAnalysis>;
  getBehavioralInsights: (params?: any) => Promise<BehavioralAnalysis[]>;
  
  // Threat detection
  detectThreats: (params: any) => Promise<ThreatDetection[]>;
  getActiveThreatsSummary: () => Promise<any>;
  investigateThreat: (threatId: string) => Promise<any>;
  mitigateThreat: (threatId: string, action: any) => Promise<void>;
  
  // Contextual intelligence
  getContextualInsights: (context: any) => Promise<ContextualIntelligence>;
  enrichContext: (contextId: string, enrichment: any) => Promise<ContextualIntelligence>;
  
  // Reports and metrics
  generateIntelligenceReport: (config: any) => Promise<IntelligenceReport>;
  getIntelligenceMetrics: (params?: any) => Promise<IntelligenceMetrics>;
  getIntelligenceConfiguration: () => Promise<IntelligenceConfiguration>;
  updateIntelligenceConfiguration: (config: Partial<IntelligenceConfiguration>) => Promise<IntelligenceConfiguration>;
  
  // Selection and filtering
  selectInsight: (insight: ScanIntelligenceInsight | null) => void;
  setFilters: (filters: Partial<IntelligenceFilters>) => void;
  setSort: (sort: IntelligenceSort) => void;
  setPagination: (pagination: Partial<PaginationState>) => void;
  clearFilters: () => void;
  
  // Real-time monitoring
  subscribeToIntelligenceUpdates: () => void;
  unsubscribeFromIntelligenceUpdates: () => void;
  subscribeToThreatUpdates: () => void;
  unsubscribeFromThreatUpdates: () => void;
  
  // Utility functions
  refreshInsights: () => Promise<void>;
  getInsightStatusColor: (severity: IntelligenceSeverity) => string;
  getInsightPriorityLabel: (category: IntelligenceCategory) => string;
  calculateRiskScore: (insight: ScanIntelligenceInsight) => number;
  formatConfidenceScore: (score: number) => string;
}

export const useScanIntelligence = (options: UseScanIntelligenceOptions = {}): UseScanIntelligenceReturn => {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    enableRealTimeUpdates = true,
    enableThreatMonitoring = true,
    onInsightDetected,
    onThreatDetected,
    onAnomalyDetected,
    onError
  } = options;

  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const threatWsRef = useRef<WebSocket | null>(null);

  // State management
  const [selectedInsight, setSelectedInsight] = useState<ScanIntelligenceInsight | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<IntelligenceAnalysisResponse | null>(null);
  
  const [pagination, setPaginationState] = useState<PaginationState>({
    page: 1,
    size: 20,
    total: 0,
    hasNext: false,
    hasPrevious: false
  });

  const [filters, setFiltersState] = useState<IntelligenceFilters>({
    severity: [],
    category: [],
    insight_type: [],
    confidence_threshold: 0.7,
    time_range: { start: '', end: '' },
    search: '',
    status: []
  });

  const [sort, setSortState] = useState<IntelligenceSort>({
    field: 'created_at',
    direction: 'desc'
  });

  // Query for fetching insights
  const {
    data: insightsResponse,
    isLoading,
    error,
    refetch: refetchInsights
  } = useQuery({
    queryKey: ['scan-intelligence-insights', pagination, filters, sort],
    queryFn: async () => {
      return scanIntelligenceAPI.getIntelligenceInsights({
        page: pagination.page,
        size: pagination.size,
        filters,
        sort
      });
    },
    enabled: true,
    refetchInterval: autoRefresh ? refreshInterval : false,
    onSuccess: (data) => {
      setPaginationState(prev => ({
        ...prev,
        total: data.total,
        hasNext: data.has_next,
        hasPrevious: data.has_previous
      }));
    },
    onError: (err) => {
      console.error('Failed to fetch intelligence insights:', err);
      onError?.(err as Error);
    }
  });

  // Mutations for intelligence operations
  const analysisRequestMutation = useMutation({
    mutationFn: (request: IntelligenceAnalysisRequest) => 
      scanIntelligenceAPI.performIntelligenceAnalysis(request),
    onMutate: () => setIsAnalyzing(true),
    onSuccess: (data) => {
      setAnalysisResults(data);
      setIsAnalyzing(false);
      toast.success('Intelligence analysis completed successfully');
      queryClient.invalidateQueries(['scan-intelligence-insights']);
    },
    onError: (error) => {
      setIsAnalyzing(false);
      const message = error instanceof Error ? error.message : 'Analysis failed';
      toast.error(`Analysis failed: ${message}`);
      onError?.(error as Error);
    }
  });

  const updateInsightMutation = useMutation({
    mutationFn: ({ insightId, updates }: { insightId: string; updates: Partial<ScanIntelligenceInsight> }) =>
      scanIntelligenceAPI.updateIntelligenceInsight(insightId, updates),
    onSuccess: (updatedInsight) => {
      toast.success('Insight updated successfully');
      queryClient.invalidateQueries(['scan-intelligence-insights']);
      if (selectedInsight?.id === updatedInsight.id) {
        setSelectedInsight(updatedInsight);
      }
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Update failed';
      toast.error(`Failed to update insight: ${message}`);
      onError?.(error as Error);
    }
  });

  const dismissInsightMutation = useMutation({
    mutationFn: (insightId: string) => scanIntelligenceAPI.dismissIntelligenceInsight(insightId),
    onSuccess: () => {
      toast.success('Insight dismissed successfully');
      queryClient.invalidateQueries(['scan-intelligence-insights']);
      if (selectedInsight) {
        setSelectedInsight(null);
      }
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Dismiss failed';
      toast.error(`Failed to dismiss insight: ${message}`);
      onError?.(error as Error);
    }
  });

  const patternRecognitionMutation = useMutation({
    mutationFn: ({ scanId, config }: { scanId: string; config?: any }) =>
      scanIntelligenceAPI.recognizePatterns(scanId, config),
    onSuccess: () => {
      toast.success('Pattern recognition completed');
      queryClient.invalidateQueries(['scan-intelligence-insights']);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Pattern recognition failed';
      toast.error(`Pattern recognition failed: ${message}`);
      onError?.(error as Error);
    }
  });

  const anomalyDetectionMutation = useMutation({
    mutationFn: (params: any) => scanIntelligenceAPI.detectAnomalies(params),
    onSuccess: (anomalies) => {
      toast.success(`Detected ${anomalies.length} anomalies`);
      queryClient.invalidateQueries(['scan-intelligence-insights']);
      anomalies.forEach(anomaly => onAnomalyDetected?.(anomaly));
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Anomaly detection failed';
      toast.error(`Anomaly detection failed: ${message}`);
      onError?.(error as Error);
    }
  });

  const threatDetectionMutation = useMutation({
    mutationFn: (params: any) => scanIntelligenceAPI.detectThreats(params),
    onSuccess: (threats) => {
      toast.success(`Detected ${threats.length} potential threats`);
      queryClient.invalidateQueries(['scan-intelligence-insights']);
      threats.forEach(threat => onThreatDetected?.(threat));
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Threat detection failed';
      toast.error(`Threat detection failed: ${message}`);
      onError?.(error as Error);
    }
  });

  // Utility functions
  const getInsightStatusColor = useCallback((severity: IntelligenceSeverity): string => {
    const colors = {
      [IntelligenceSeverity.CRITICAL]: 'text-red-600 bg-red-50',
      [IntelligenceSeverity.HIGH]: 'text-orange-600 bg-orange-50',
      [IntelligenceSeverity.MEDIUM]: 'text-yellow-600 bg-yellow-50',
      [IntelligenceSeverity.LOW]: 'text-green-600 bg-green-50',
      [IntelligenceSeverity.INFO]: 'text-blue-600 bg-blue-50'
    };
    return colors[severity] || colors[IntelligenceSeverity.INFO];
  }, []);

  const getInsightPriorityLabel = useCallback((category: IntelligenceCategory): string => {
    const labels = {
      [IntelligenceCategory.SECURITY]: 'Security',
      [IntelligenceCategory.PERFORMANCE]: 'Performance',
      [IntelligenceCategory.QUALITY]: 'Quality',
      [IntelligenceCategory.COMPLIANCE]: 'Compliance',
      [IntelligenceCategory.OPERATIONAL]: 'Operational',
      [IntelligenceCategory.BUSINESS]: 'Business'
    };
    return labels[category] || 'Unknown';
  }, []);

  const calculateRiskScore = useCallback((insight: ScanIntelligenceInsight): number => {
    const severityWeights = {
      [IntelligenceSeverity.CRITICAL]: 1.0,
      [IntelligenceSeverity.HIGH]: 0.8,
      [IntelligenceSeverity.MEDIUM]: 0.6,
      [IntelligenceSeverity.LOW]: 0.4,
      [IntelligenceSeverity.INFO]: 0.2
    };
    
    const severityWeight = severityWeights[insight.severity] || 0.5;
    const confidenceWeight = insight.confidence_score;
    const impactWeight = insight.impact_score || 0.5;
    
    return Math.round((severityWeight * 0.4 + confidenceWeight * 0.3 + impactWeight * 0.3) * 100);
  }, []);

  const formatConfidenceScore = useCallback((score: number): string => {
    return `${Math.round(score * 100)}%`;
  }, []);

  // Real-time updates subscription
  const subscribeToIntelligenceUpdates = useCallback(() => {
    if (!enableRealTimeUpdates || wsRef.current) return;

    try {
      wsRef.current = scanIntelligenceAPI.subscribeToIntelligenceUpdates(
        { insight_types: filters.insight_type },
        (data) => {
          // Handle real-time intelligence updates
          if (data.type === 'insight_created' || data.type === 'insight_updated') {
            queryClient.invalidateQueries(['scan-intelligence-insights']);
            if (data.insight) {
              onInsightDetected?.(data.insight);
            }
          }
        },
        (error) => {
          console.error('Intelligence WebSocket error:', error);
          onError?.(new Error('Real-time updates connection failed'));
        }
      );
    } catch (error) {
      console.error('Failed to subscribe to intelligence updates:', error);
    }
  }, [enableRealTimeUpdates, filters.insight_type, queryClient, onInsightDetected, onError]);

  const unsubscribeFromIntelligenceUpdates = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const subscribeToThreatUpdates = useCallback(() => {
    if (!enableThreatMonitoring || threatWsRef.current) return;

    try {
      threatWsRef.current = scanIntelligenceAPI.subscribeToThreatUpdates(
        (threat) => {
          onThreatDetected?.(threat);
          queryClient.invalidateQueries(['scan-intelligence-insights']);
        },
        (error) => {
          console.error('Threat monitoring WebSocket error:', error);
          onError?.(new Error('Threat monitoring connection failed'));
        }
      );
    } catch (error) {
      console.error('Failed to subscribe to threat updates:', error);
    }
  }, [enableThreatMonitoring, queryClient, onThreatDetected, onError]);

  const unsubscribeFromThreatUpdates = useCallback(() => {
    if (threatWsRef.current) {
      threatWsRef.current.close();
      threatWsRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeFromIntelligenceUpdates();
      unsubscribeFromThreatUpdates();
    };
  }, [unsubscribeFromIntelligenceUpdates, unsubscribeFromThreatUpdates]);

  // Load initial data and setup subscriptions
  useEffect(() => {
    if (enableRealTimeUpdates) {
      subscribeToIntelligenceUpdates();
    }
    if (enableThreatMonitoring) {
      subscribeToThreatUpdates();
    }
  }, [enableRealTimeUpdates, enableThreatMonitoring, subscribeToIntelligenceUpdates, subscribeToThreatUpdates]);

  return {
    // Intelligence data
    insights: insightsResponse?.insights || [],
    selectedInsight,
    analysisResults,
    isLoading,
    isAnalyzing,
    error: error as Error | null,
    
    // Pagination and filtering
    pagination,
    filters,
    sort,
    
    // Intelligence operations
    performAnalysis: analysisRequestMutation.mutateAsync,
    getInsights: async (params?: any) => {
      await refetchInsights();
    },
    updateInsight: (insightId: string, updates: Partial<ScanIntelligenceInsight>) =>
      updateInsightMutation.mutateAsync({ insightId, updates }),
    dismissInsight: dismissInsightMutation.mutateAsync,
    
    // Pattern recognition
    recognizePatterns: (scanId: string, config?: any) =>
      patternRecognitionMutation.mutateAsync({ scanId, config }),
    getPatternHistory: scanIntelligenceAPI.getPatternHistory,
    
    // Anomaly detection
    detectAnomalies: anomalyDetectionMutation.mutateAsync,
    getAnomalyInsights: scanIntelligenceAPI.getAnomalyInsights,
    resolveAnomaly: scanIntelligenceAPI.resolveAnomaly,
    
    // Predictive analytics
    getPredictiveModels: scanIntelligenceAPI.getPredictiveModels,
    createPredictiveModel: scanIntelligenceAPI.createPredictiveModel,
    runPrediction: scanIntelligenceAPI.runPrediction,
    
    // Behavioral analysis
    analyzeBehavior: scanIntelligenceAPI.analyzeBehavior,
    getBehavioralInsights: scanIntelligenceAPI.getBehavioralInsights,
    
    // Threat detection
    detectThreats: threatDetectionMutation.mutateAsync,
    getActiveThreatsSummary: scanIntelligenceAPI.getActiveThreatsSummary,
    investigateThreat: scanIntelligenceAPI.investigateThreat,
    mitigateThreat: scanIntelligenceAPI.mitigateThreat,
    
    // Contextual intelligence
    getContextualInsights: scanIntelligenceAPI.getContextualInsights,
    enrichContext: scanIntelligenceAPI.enrichContext,
    
    // Reports and metrics
    generateIntelligenceReport: scanIntelligenceAPI.generateIntelligenceReport,
    getIntelligenceMetrics: scanIntelligenceAPI.getIntelligenceMetrics,
    getIntelligenceConfiguration: scanIntelligenceAPI.getIntelligenceConfiguration,
    updateIntelligenceConfiguration: scanIntelligenceAPI.updateIntelligenceConfiguration,
    
    // Selection and filtering
    selectInsight: setSelectedInsight,
    setFilters: (newFilters: Partial<IntelligenceFilters>) => {
      setFiltersState(prev => ({ ...prev, ...newFilters }));
      setPaginationState(prev => ({ ...prev, page: 1 })); // Reset to first page
    },
    setSort: setSortState,
    setPagination: (newPagination: Partial<PaginationState>) => {
      setPaginationState(prev => ({ ...prev, ...newPagination }));
    },
    clearFilters: () => {
      setFiltersState({
        severity: [],
        category: [],
        insight_type: [],
        confidence_threshold: 0.7,
        time_range: { start: '', end: '' },
        search: '',
        status: []
      });
      setPaginationState(prev => ({ ...prev, page: 1 }));
    },
    
    // Real-time monitoring
    subscribeToIntelligenceUpdates,
    unsubscribeFromIntelligenceUpdates,
    subscribeToThreatUpdates,
    unsubscribeFromThreatUpdates,
    
    // Utility functions
    refreshInsights: async () => {
      await refetchInsights();
    },
    getInsightStatusColor,
    getInsightPriorityLabel,
    calculateRiskScore,
    formatConfidenceScore
  };
};