"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// ============================================================================
// AI ANALYTICS INTEGRATION TYPES
// ============================================================================

export interface AIAnalyticsConfig {
  enableRecommendations?: boolean
  enablePredictiveAnalytics?: boolean
  enableAnomalyDetection?: boolean
  enablePatternRecognition?: boolean
  enableOptimizationSuggestions?: boolean
  enableTrendForecasting?: boolean
  enableRiskAssessment?: boolean
  enablePerformanceInsights?: boolean
  refreshInterval?: number
  confidenceThreshold?: number
  modelVersion?: string
}

export interface AIRecommendation {
  id: string
  type: RecommendationType
  title: string
  description: string
  impact: ImpactLevel
  confidence: number
  priority: PriorityLevel
  category: RecommendationCategory
  dataSourceId?: number
  assetId?: string
  metadata: RecommendationMetadata
  actions: RecommendedAction[]
  createdAt: string
  expiresAt?: string
  status: RecommendationStatus
}

export interface RecommendationMetadata {
  analysisType: string
  modelUsed: string
  dataPoints: number
  timeRange: string
  correlations: string[]
  tags: string[]
  relatedRecommendations: string[]
}

export interface RecommendedAction {
  id: string
  label: string
  description: string
  type: ActionType
  parameters: Record<string, any>
  estimatedImpact: string
  estimatedEffort: string
  prerequisites: string[]
  automated: boolean
}

export interface PredictiveInsight {
  id: string
  type: InsightType
  title: string
  description: string
  prediction: PredictionData
  confidence: number
  timeframe: string
  dataSourceId?: number
  assetId?: string
  metadata: InsightMetadata
  visualizations: VisualizationData[]
  createdAt: string
}

export interface PredictionData {
  metric: string
  currentValue: number
  predictedValue: number
  trend: TrendDirection
  changePercentage: number
  factors: PredictionFactor[]
  scenarios: PredictionScenario[]
}

export interface PredictionFactor {
  name: string
  importance: number
  impact: number
  description: string
}

export interface PredictionScenario {
  name: string
  probability: number
  outcome: number
  description: string
}

export interface InsightMetadata {
  algorithm: string
  dataQuality: number
  sampleSize: number
  timeRange: string
  correlationStrength: number
  statisticalSignificance: number
}

export interface VisualizationData {
  type: VisualizationType
  data: any[]
  config: Record<string, any>
  title: string
  description: string
}

export interface AnomalyDetection {
  id: string
  type: AnomalyType
  severity: SeverityLevel
  title: string
  description: string
  detectedAt: string
  dataSourceId?: number
  assetId?: string
  metric: string
  expectedValue: number
  actualValue: number
  deviation: number
  context: AnomalyContext
  recommendations: string[]
  status: AnomalyStatus
}

export interface AnomalyContext {
  timeWindow: string
  historicalPattern: string
  seasonality: string
  externalFactors: string[]
  relatedMetrics: string[]
}

export interface PatternInsight {
  id: string
  type: PatternType
  title: string
  description: string
  pattern: PatternData
  confidence: number
  dataSourceId?: number
  assetId?: string
  metadata: PatternMetadata
  implications: string[]
  createdAt: string
}

export interface PatternData {
  patternType: string
  frequency: string
  strength: number
  duration: string
  occurrences: number
  examples: any[]
}

export interface PatternMetadata {
  algorithm: string
  dataPoints: number
  timeRange: string
  correlations: string[]
  statisticalMeasures: Record<string, number>
}

export interface OptimizationSuggestion {
  id: string
  type: OptimizationType
  title: string
  description: string
  currentState: OptimizationState
  suggestedState: OptimizationState
  expectedBenefit: ExpectedBenefit
  implementation: ImplementationPlan
  dataSourceId?: number
  assetId?: string
  priority: PriorityLevel
  complexity: ComplexityLevel
  createdAt: string
}

export interface OptimizationState {
  metric: string
  value: number
  configuration: Record<string, any>
  performance: PerformanceMetrics
}

export interface ExpectedBenefit {
  performanceImprovement: number
  costReduction: number
  timesSaving: number
  qualityImprovement: number
  riskReduction: number
}

export interface ImplementationPlan {
  steps: ImplementationStep[]
  estimatedDuration: string
  requiredResources: string[]
  risks: string[]
  rollbackPlan: string
}

export interface ImplementationStep {
  id: string
  title: string
  description: string
  order: number
  estimatedTime: string
  dependencies: string[]
  automated: boolean
}

export interface PerformanceMetrics {
  throughput: number
  latency: number
  errorRate: number
  resourceUtilization: number
  availability: number
}

// ============================================================================
// ENUMS
// ============================================================================

export enum RecommendationType {
  PERFORMANCE_OPTIMIZATION = 'performance_optimization',
  SECURITY_ENHANCEMENT = 'security_enhancement',
  DATA_QUALITY_IMPROVEMENT = 'data_quality_improvement',
  COST_OPTIMIZATION = 'cost_optimization',
  CAPACITY_PLANNING = 'capacity_planning',
  WORKFLOW_OPTIMIZATION = 'workflow_optimization',
  SCHEMA_OPTIMIZATION = 'schema_optimization',
  INDEX_OPTIMIZATION = 'index_optimization',
  BACKUP_STRATEGY = 'backup_strategy',
  DISCOVERY_ENHANCEMENT = 'discovery_enhancement'
}

export enum ImpactLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum PriorityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum RecommendationCategory {
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  QUALITY = 'quality',
  COST = 'cost',
  COMPLIANCE = 'compliance',
  OPERATIONS = 'operations'
}

export enum ActionType {
  CONFIGURATION_CHANGE = 'configuration_change',
  SCHEMA_MODIFICATION = 'schema_modification',
  QUERY_OPTIMIZATION = 'query_optimization',
  INDEX_CREATION = 'index_creation',
  SECURITY_UPDATE = 'security_update',
  BACKUP_SCHEDULE = 'backup_schedule',
  MONITORING_SETUP = 'monitoring_setup',
  WORKFLOW_AUTOMATION = 'workflow_automation'
}

export enum RecommendationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  IMPLEMENTED = 'implemented',
  EXPIRED = 'expired'
}

export enum InsightType {
  TREND_ANALYSIS = 'trend_analysis',
  CAPACITY_FORECAST = 'capacity_forecast',
  USAGE_PREDICTION = 'usage_prediction',
  PERFORMANCE_FORECAST = 'performance_forecast',
  RISK_ASSESSMENT = 'risk_assessment',
  GROWTH_PROJECTION = 'growth_projection'
}

export enum TrendDirection {
  INCREASING = 'increasing',
  DECREASING = 'decreasing',
  STABLE = 'stable',
  VOLATILE = 'volatile'
}

export enum VisualizationType {
  LINE_CHART = 'line_chart',
  BAR_CHART = 'bar_chart',
  SCATTER_PLOT = 'scatter_plot',
  HEATMAP = 'heatmap',
  HISTOGRAM = 'histogram',
  BOX_PLOT = 'box_plot'
}

export enum AnomalyType {
  STATISTICAL = 'statistical',
  PATTERN_BASED = 'pattern_based',
  THRESHOLD_BASED = 'threshold_based',
  SEASONAL = 'seasonal'
}

export enum SeverityLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export enum AnomalyStatus {
  ACTIVE = 'active',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  FALSE_POSITIVE = 'false_positive'
}

export enum PatternType {
  TEMPORAL = 'temporal',
  USAGE = 'usage',
  PERFORMANCE = 'performance',
  ERROR = 'error',
  ACCESS = 'access'
}

export enum OptimizationType {
  QUERY_PERFORMANCE = 'query_performance',
  STORAGE_OPTIMIZATION = 'storage_optimization',
  NETWORK_OPTIMIZATION = 'network_optimization',
  RESOURCE_ALLOCATION = 'resource_allocation',
  CACHING_STRATEGY = 'caching_strategy'
}

export enum ComplexityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  EXPERT = 'expert'
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

const aiAnalyticsApi = {
  async getRecommendations(dataSourceId?: number, filters?: any) {
    const params = new URLSearchParams({
      ...(dataSourceId && { data_source_id: dataSourceId.toString() }),
      ...filters
    })
    const response = await fetch(`/api/ai-analytics/recommendations?${params}`)
    if (!response.ok) throw new Error('Failed to fetch AI recommendations')
    return response.json()
  },

  async getPredictiveInsights(dataSourceId?: number, timeframe?: string) {
    const params = new URLSearchParams({
      ...(dataSourceId && { data_source_id: dataSourceId.toString() }),
      ...(timeframe && { timeframe })
    })
    const response = await fetch(`/api/ai-analytics/predictive-insights?${params}`)
    if (!response.ok) throw new Error('Failed to fetch predictive insights')
    return response.json()
  },

  async getAnomalyDetections(dataSourceId?: number, severity?: SeverityLevel) {
    const params = new URLSearchParams({
      ...(dataSourceId && { data_source_id: dataSourceId.toString() }),
      ...(severity && { severity })
    })
    const response = await fetch(`/api/ai-analytics/anomaly-detections?${params}`)
    if (!response.ok) throw new Error('Failed to fetch anomaly detections')
    return response.json()
  },

  async getPatternInsights(dataSourceId?: number, patternType?: PatternType) {
    const params = new URLSearchParams({
      ...(dataSourceId && { data_source_id: dataSourceId.toString() }),
      ...(patternType && { pattern_type: patternType })
    })
    const response = await fetch(`/api/ai-analytics/pattern-insights?${params}`)
    if (!response.ok) throw new Error('Failed to fetch pattern insights')
    return response.json()
  },

  async getOptimizationSuggestions(dataSourceId?: number, optimizationType?: OptimizationType) {
    const params = new URLSearchParams({
      ...(dataSourceId && { data_source_id: dataSourceId.toString() }),
      ...(optimizationType && { optimization_type: optimizationType })
    })
    const response = await fetch(`/api/ai-analytics/optimization-suggestions?${params}`)
    if (!response.ok) throw new Error('Failed to fetch optimization suggestions')
    return response.json()
  },

  async generateInsights(dataSourceId: number, analysisType: string, parameters: any) {
    const response = await fetch('/proxy/ai-analytics/generate-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data_source_id: dataSourceId,
        analysis_type: analysisType,
        parameters
      })
    })
    if (!response.ok) throw new Error('Failed to generate insights')
    return response.json()
  },

  async acceptRecommendation(recommendationId: string) {
    const response = await fetch(`/api/ai-analytics/recommendations/${recommendationId}/accept`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to accept recommendation')
    return response.json()
  },

  async rejectRecommendation(recommendationId: string, reason?: string) {
    const response = await fetch(`/api/ai-analytics/recommendations/${recommendationId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    })
    if (!response.ok) throw new Error('Failed to reject recommendation')
    return response.json()
  },

  async implementRecommendation(recommendationId: string, actionId: string) {
    const response = await fetch(`/api/ai-analytics/recommendations/${recommendationId}/implement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action_id: actionId })
    })
    if (!response.ok) throw new Error('Failed to implement recommendation')
    return response.json()
  },

  async acknowledgeAnomaly(anomalyId: string) {
    const response = await fetch(`/api/ai-analytics/anomalies/${anomalyId}/acknowledge`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to acknowledge anomaly')
    return response.json()
  },

  async resolveAnomaly(anomalyId: string, resolution: string) {
    const response = await fetch(`/api/ai-analytics/anomalies/${anomalyId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolution })
    })
    if (!response.ok) throw new Error('Failed to resolve anomaly')
    return response.json()
  },

  async getAnalyticsSettings() {
    const response = await fetch('/proxy/ai-analytics/settings')
    if (!response.ok) throw new Error('Failed to fetch analytics settings')
    return response.json()
  },

  async updateAnalyticsSettings(settings: Partial<AIAnalyticsConfig>) {
    const response = await fetch('/proxy/ai-analytics/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    })
    if (!response.ok) throw new Error('Failed to update analytics settings')
    return response.json()
  }
}

// ============================================================================
// AI ANALYTICS INTEGRATION HOOK
// ============================================================================

export function useAIAnalyticsIntegration(config: AIAnalyticsConfig = {}) {
  const queryClient = useQueryClient()
  
  const defaultConfig: Required<AIAnalyticsConfig> = {
    enableRecommendations: true,
    enablePredictiveAnalytics: true,
    enableAnomalyDetection: true,
    enablePatternRecognition: true,
    enableOptimizationSuggestions: true,
    enableTrendForecasting: true,
    enableRiskAssessment: true,
    enablePerformanceInsights: true,
    refreshInterval: 300000, // 5 minutes
    confidenceThreshold: 0.7,
    modelVersion: 'v2.1',
    ...config
  }

  // ============================================================================
  // DATA QUERIES
  // ============================================================================

  const { 
    data: recommendationsData, 
    isLoading: recommendationsLoading,
    error: recommendationsError,
    refetch: refetchRecommendations 
  } = useQuery({
    queryKey: ['ai-recommendations'],
    queryFn: () => aiAnalyticsApi.getRecommendations(),
    enabled: defaultConfig.enableRecommendations,
    refetchInterval: defaultConfig.refreshInterval,
    staleTime: defaultConfig.refreshInterval / 2
  })

  const { 
    data: predictiveInsightsData, 
    isLoading: predictiveInsightsLoading,
    error: predictiveInsightsError 
  } = useQuery({
    queryKey: ['predictive-insights'],
    queryFn: () => aiAnalyticsApi.getPredictiveInsights(),
    enabled: defaultConfig.enablePredictiveAnalytics,
    refetchInterval: defaultConfig.refreshInterval,
    staleTime: defaultConfig.refreshInterval / 2
  })

  const { 
    data: anomalyDetectionsData, 
    isLoading: anomalyDetectionsLoading,
    error: anomalyDetectionsError 
  } = useQuery({
    queryKey: ['anomaly-detections'],
    queryFn: () => aiAnalyticsApi.getAnomalyDetections(),
    enabled: defaultConfig.enableAnomalyDetection,
    refetchInterval: defaultConfig.refreshInterval / 2, // More frequent for anomalies
    staleTime: defaultConfig.refreshInterval / 4
  })

  const { 
    data: patternInsightsData, 
    isLoading: patternInsightsLoading,
    error: patternInsightsError 
  } = useQuery({
    queryKey: ['pattern-insights'],
    queryFn: () => aiAnalyticsApi.getPatternInsights(),
    enabled: defaultConfig.enablePatternRecognition,
    refetchInterval: defaultConfig.refreshInterval,
    staleTime: defaultConfig.refreshInterval / 2
  })

  const { 
    data: optimizationSuggestionsData, 
    isLoading: optimizationSuggestionsLoading,
    error: optimizationSuggestionsError 
  } = useQuery({
    queryKey: ['optimization-suggestions'],
    queryFn: () => aiAnalyticsApi.getOptimizationSuggestions(),
    enabled: defaultConfig.enableOptimizationSuggestions,
    refetchInterval: defaultConfig.refreshInterval,
    staleTime: defaultConfig.refreshInterval / 2
  })

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const generateInsightsMutation = useMutation({
    mutationFn: ({ dataSourceId, analysisType, parameters }: { 
      dataSourceId: number, 
      analysisType: string, 
      parameters: any 
    }) => aiAnalyticsApi.generateInsights(dataSourceId, analysisType, parameters),
    onSuccess: () => {
      toast.success('AI insights generated successfully')
      queryClient.invalidateQueries({ queryKey: ['predictive-insights'] })
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] })
    },
    onError: (error: any) => {
      toast.error(`Failed to generate insights: ${error.message}`)
    }
  })

  const acceptRecommendationMutation = useMutation({
    mutationFn: (recommendationId: string) => aiAnalyticsApi.acceptRecommendation(recommendationId),
    onSuccess: () => {
      toast.success('Recommendation accepted')
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] })
    },
    onError: (error: any) => {
      toast.error(`Failed to accept recommendation: ${error.message}`)
    }
  })

  const rejectRecommendationMutation = useMutation({
    mutationFn: ({ recommendationId, reason }: { recommendationId: string, reason?: string }) => 
      aiAnalyticsApi.rejectRecommendation(recommendationId, reason),
    onSuccess: () => {
      toast.success('Recommendation rejected')
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] })
    },
    onError: (error: any) => {
      toast.error(`Failed to reject recommendation: ${error.message}`)
    }
  })

  const implementRecommendationMutation = useMutation({
    mutationFn: ({ recommendationId, actionId }: { recommendationId: string, actionId: string }) => 
      aiAnalyticsApi.implementRecommendation(recommendationId, actionId),
    onSuccess: () => {
      toast.success('Recommendation implementation started')
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] })
    },
    onError: (error: any) => {
      toast.error(`Failed to implement recommendation: ${error.message}`)
    }
  })

  const acknowledgeAnomalyMutation = useMutation({
    mutationFn: (anomalyId: string) => aiAnalyticsApi.acknowledgeAnomaly(anomalyId),
    onSuccess: () => {
      toast.success('Anomaly acknowledged')
      queryClient.invalidateQueries({ queryKey: ['anomaly-detections'] })
    },
    onError: (error: any) => {
      toast.error(`Failed to acknowledge anomaly: ${error.message}`)
    }
  })

  const resolveAnomalyMutation = useMutation({
    mutationFn: ({ anomalyId, resolution }: { anomalyId: string, resolution: string }) => 
      aiAnalyticsApi.resolveAnomaly(anomalyId, resolution),
    onSuccess: () => {
      toast.success('Anomaly resolved')
      queryClient.invalidateQueries({ queryKey: ['anomaly-detections'] })
    },
    onError: (error: any) => {
      toast.error(`Failed to resolve anomaly: ${error.message}`)
    }
  })

  // ============================================================================
  // PROCESSED DATA
  // ============================================================================

  const recommendations: AIRecommendation[] = useMemo(() => {
    if (!recommendationsData?.data?.recommendations) return []
    
    return recommendationsData.data.recommendations
      .filter((rec: any) => rec.confidence >= defaultConfig.confidenceThreshold)
      .map((rec: any) => ({
        id: rec.id,
        type: rec.type,
        title: rec.title,
        description: rec.description,
        impact: rec.impact,
        confidence: rec.confidence,
        priority: rec.priority,
        category: rec.category,
        dataSourceId: rec.data_source_id,
        assetId: rec.asset_id,
        metadata: rec.metadata,
        actions: rec.actions || [],
        createdAt: rec.created_at,
        expiresAt: rec.expires_at,
        status: rec.status
      }))
  }, [recommendationsData, defaultConfig.confidenceThreshold])

  const predictiveInsights: PredictiveInsight[] = useMemo(() => {
    if (!predictiveInsightsData?.data?.insights) return []
    
    return predictiveInsightsData.data.insights
      .filter((insight: any) => insight.confidence >= defaultConfig.confidenceThreshold)
      .map((insight: any) => ({
        id: insight.id,
        type: insight.type,
        title: insight.title,
        description: insight.description,
        prediction: insight.prediction,
        confidence: insight.confidence,
        timeframe: insight.timeframe,
        dataSourceId: insight.data_source_id,
        assetId: insight.asset_id,
        metadata: insight.metadata,
        visualizations: insight.visualizations || [],
        createdAt: insight.created_at
      }))
  }, [predictiveInsightsData, defaultConfig.confidenceThreshold])

  const anomalyDetections: AnomalyDetection[] = useMemo(() => {
    if (!anomalyDetectionsData?.data?.anomalies) return []
    
    return anomalyDetectionsData.data.anomalies.map((anomaly: any) => ({
      id: anomaly.id,
      type: anomaly.type,
      severity: anomaly.severity,
      title: anomaly.title,
      description: anomaly.description,
      detectedAt: anomaly.detected_at,
      dataSourceId: anomaly.data_source_id,
      assetId: anomaly.asset_id,
      metric: anomaly.metric,
      expectedValue: anomaly.expected_value,
      actualValue: anomaly.actual_value,
      deviation: anomaly.deviation,
      context: anomaly.context,
      recommendations: anomaly.recommendations || [],
      status: anomaly.status
    }))
  }, [anomalyDetectionsData])

  const patternInsights: PatternInsight[] = useMemo(() => {
    if (!patternInsightsData?.data?.patterns) return []
    
    return patternInsightsData.data.patterns
      .filter((pattern: any) => pattern.confidence >= defaultConfig.confidenceThreshold)
      .map((pattern: any) => ({
        id: pattern.id,
        type: pattern.type,
        title: pattern.title,
        description: pattern.description,
        pattern: pattern.pattern,
        confidence: pattern.confidence,
        dataSourceId: pattern.data_source_id,
        assetId: pattern.asset_id,
        metadata: pattern.metadata,
        implications: pattern.implications || [],
        createdAt: pattern.created_at
      }))
  }, [patternInsightsData, defaultConfig.confidenceThreshold])

  const optimizationSuggestions: OptimizationSuggestion[] = useMemo(() => {
    if (!optimizationSuggestionsData?.data?.suggestions) return []
    
    return optimizationSuggestionsData.data.suggestions.map((suggestion: any) => ({
      id: suggestion.id,
      type: suggestion.type,
      title: suggestion.title,
      description: suggestion.description,
      currentState: suggestion.current_state,
      suggestedState: suggestion.suggested_state,
      expectedBenefit: suggestion.expected_benefit,
      implementation: suggestion.implementation,
      dataSourceId: suggestion.data_source_id,
      assetId: suggestion.asset_id,
      priority: suggestion.priority,
      complexity: suggestion.complexity,
      createdAt: suggestion.created_at
    }))
  }, [optimizationSuggestionsData])

  // ============================================================================
  // ANALYTICS SUMMARY
  // ============================================================================

  const analyticsSummary = useMemo(() => {
    const criticalRecommendations = recommendations.filter(r => r.impact === ImpactLevel.CRITICAL).length
    const highPriorityRecommendations = recommendations.filter(r => r.priority === PriorityLevel.HIGH || r.priority === PriorityLevel.URGENT).length
    const activeAnomalies = anomalyDetections.filter(a => a.status === AnomalyStatus.ACTIVE).length
    const criticalAnomalies = anomalyDetections.filter(a => a.severity === SeverityLevel.CRITICAL).length
    const highConfidenceInsights = predictiveInsights.filter(i => i.confidence >= 0.8).length
    const strongPatterns = patternInsights.filter(p => p.confidence >= 0.8).length

    return {
      totalRecommendations: recommendations.length,
      criticalRecommendations,
      highPriorityRecommendations,
      totalPredictiveInsights: predictiveInsights.length,
      highConfidenceInsights,
      totalAnomalies: anomalyDetections.length,
      activeAnomalies,
      criticalAnomalies,
      totalPatterns: patternInsights.length,
      strongPatterns,
      totalOptimizations: optimizationSuggestions.length,
      averageConfidence: recommendations.length > 0 
        ? recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length 
        : 0
    }
  }, [recommendations, predictiveInsights, anomalyDetections, patternInsights, optimizationSuggestions])

  // ============================================================================
  // CONVENIENCE METHODS
  // ============================================================================

  const getRecommendationsByDataSource = useCallback((dataSourceId: number) => {
    return recommendations.filter(r => r.dataSourceId === dataSourceId)
  }, [recommendations])

  const getAnomaliesByDataSource = useCallback((dataSourceId: number) => {
    return anomalyDetections.filter(a => a.dataSourceId === dataSourceId)
  }, [anomalyDetections])

  const getInsightsByDataSource = useCallback((dataSourceId: number) => {
    return predictiveInsights.filter(i => i.dataSourceId === dataSourceId)
  }, [predictiveInsights])

  const getOptimizationsByDataSource = useCallback((dataSourceId: number) => {
    return optimizationSuggestions.filter(o => o.dataSourceId === dataSourceId)
  }, [optimizationSuggestions])

  const generateDataSourceInsights = useCallback(async (dataSourceId: number, analysisTypes: string[] = ['comprehensive']) => {
    for (const analysisType of analysisTypes) {
      await generateInsightsMutation.mutateAsync({
        dataSourceId,
        analysisType,
        parameters: {
          confidence_threshold: defaultConfig.confidenceThreshold,
          model_version: defaultConfig.modelVersion,
          include_predictions: defaultConfig.enablePredictiveAnalytics,
          include_anomalies: defaultConfig.enableAnomalyDetection,
          include_patterns: defaultConfig.enablePatternRecognition
        }
      })
    }
  }, [generateInsightsMutation, defaultConfig])

  // ============================================================================
  // RETURN INTERFACE
  // ============================================================================

  return {
    // Configuration
    config: defaultConfig,
    
    // Data
    recommendations,
    predictiveInsights,
    anomalyDetections,
    patternInsights,
    optimizationSuggestions,
    
    // Loading States
    isLoading: recommendationsLoading || predictiveInsightsLoading || anomalyDetectionsLoading || 
               patternInsightsLoading || optimizationSuggestionsLoading,
    recommendationsLoading,
    predictiveInsightsLoading,
    anomalyDetectionsLoading,
    patternInsightsLoading,
    optimizationSuggestionsLoading,
    
    // Errors
    errors: {
      recommendations: recommendationsError,
      predictiveInsights: predictiveInsightsError,
      anomalyDetections: anomalyDetectionsError,
      patternInsights: patternInsightsError,
      optimizationSuggestions: optimizationSuggestionsError
    },
    
    // Actions
    generateInsights: generateInsightsMutation.mutateAsync,
    acceptRecommendation: acceptRecommendationMutation.mutateAsync,
    rejectRecommendation: rejectRecommendationMutation.mutateAsync,
    implementRecommendation: implementRecommendationMutation.mutateAsync,
    acknowledgeAnomaly: acknowledgeAnomalyMutation.mutateAsync,
    resolveAnomaly: resolveAnomalyMutation.mutateAsync,
    
    // Data Refresh
    refetch: {
      recommendations: refetchRecommendations,
      all: () => {
        refetchRecommendations()
        queryClient.invalidateQueries({ queryKey: ['predictive-insights'] })
        queryClient.invalidateQueries({ queryKey: ['anomaly-detections'] })
        queryClient.invalidateQueries({ queryKey: ['pattern-insights'] })
        queryClient.invalidateQueries({ queryKey: ['optimization-suggestions'] })
      }
    },
    
    // Convenience Methods
    getRecommendationsByDataSource,
    getAnomaliesByDataSource,
    getInsightsByDataSource,
    getOptimizationsByDataSource,
    generateDataSourceInsights,
    
    // Summary
    summary: analyticsSummary,
    
    // Types and Enums (for convenience)
    Types: {
      RecommendationType,
      ImpactLevel,
      PriorityLevel,
      RecommendationCategory,
      ActionType,
      RecommendationStatus,
      InsightType,
      TrendDirection,
      AnomalyType,
      SeverityLevel,
      AnomalyStatus,
      PatternType,
      OptimizationType,
      ComplexityLevel
    }
  }
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type {
  AIAnalyticsConfig,
  AIRecommendation,
  PredictiveInsight,
  AnomalyDetection,
  PatternInsight,
  OptimizationSuggestion,
  RecommendationMetadata,
  RecommendedAction,
  PredictionData,
  InsightMetadata,
  VisualizationData,
  AnomalyContext,
  PatternData,
  OptimizationState,
  ExpectedBenefit,
  ImplementationPlan
}