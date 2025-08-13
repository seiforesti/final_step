// ============================================================================
// USE DATA LINEAGE HOOK - ADVANCED ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// React hook for data lineage operations with real backend integration
// Maps to: advanced_lineage_service.py, lineage_service.py
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { advancedLineageService, ImpactAnalysisRequest, RiskAssessmentRequest, CostAnalysisRequest, BusinessImpactRequest, ROICalculationRequest } from '../services/advanced-lineage.service';
import {
  EnterpriseDataLineage,
  DataLineageNode,
  DataLineageEdge,
  LineageVisualization,
  LineageAnalysisResult,
  LineageImpactAnalysis,
  LineageRiskAssessment,
  LineageCostAnalysis,
  LineageBusinessImpact,
  LineageROIMetrics,
  LineageEfficiencyMetrics,
  LineageUsageStatistics,
  LineageHealthMetrics,
  LineageReliabilityMetrics,
  LineageAvailabilityMetrics,
  LineageScalabilityMetrics,
  LineagePerformanceMetrics,
  LineageQualityContext,
  LineageSecurityContext,
  LineageComplianceContext,
  LineageOperationalContext,
  LineageBusinessContext,
  LineageDataContext,
  LineageTechnicalContext,
  LineageGovernanceContext,
  LineageMetadata,
  LineageValidationResult,
  LineageOptimizationSuggestion,
  LineageComplianceStatus,
  LineageSecurityClassification,
  TimeRange
} from '../types';

// ============================================================================
// HOOK INTERFACES
// ============================================================================

export interface UseDataLineageOptions {
  enableRealTimeUpdates?: boolean;
  autoRefreshInterval?: number;
  maxRetries?: number;
  onError?: (error: Error) => void;
}

export interface UseDataLineageReturn {
  // Data
  lineageData: EnterpriseDataLineage | null;
  nodes: DataLineageNode[];
  edges: DataLineageEdge[];
  
  // States
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  
  // Analysis
  impactAnalysis: LineageImpactAnalysis | null;
  riskAssessment: LineageRiskAssessment | null;
  costAnalysis: LineageCostAnalysis | null;
  businessImpact: LineageBusinessImpact | null;
  roiMetrics: LineageROIMetrics | null;
  
  // Metrics
  efficiencyMetrics: LineageEfficiencyMetrics | null;
  usageStatistics: LineageUsageStatistics | null;
  healthMetrics: LineageHealthMetrics | null;
  reliabilityMetrics: LineageReliabilityMetrics | null;
  availabilityMetrics: LineageAvailabilityMetrics | null;
  scalabilityMetrics: LineageScalabilityMetrics | null;
  performanceMetrics: LineagePerformanceMetrics | null;
  
  // Context
  qualityContext: LineageQualityContext | null;
  securityContext: LineageSecurityContext | null;
  complianceContext: LineageComplianceContext | null;
  operationalContext: LineageOperationalContext | null;
  businessContext: LineageBusinessContext | null;
  dataContext: LineageDataContext | null;
  technicalContext: LineageTechnicalContext | null;
  governanceContext: LineageGovernanceContext | null;
  
  // Validation and Optimization
  validation: LineageValidationResult | null;
  optimizationSuggestions: LineageOptimizationSuggestion[];
  complianceStatus: LineageComplianceStatus | null;
  securityClassification: LineageSecurityClassification | null;
  
  // Actions
  refetch: () => Promise<void>;
  createLineage: (request: any) => Promise<void>;
  updateLineage: (id: string, updates: any) => Promise<void>;
  deleteLineage: (id: string) => Promise<void>;
  analyzeImpact: (request: ImpactAnalysisRequest) => Promise<LineageImpactAnalysis>;
  assessRisk: (request: RiskAssessmentRequest) => Promise<LineageRiskAssessment>;
  analyzeCost: (request: CostAnalysisRequest) => Promise<LineageCostAnalysis>;
  generateBusinessImpact: (request: BusinessImpactRequest) => Promise<LineageBusinessImpact>;
  calculateROI: (request: ROICalculationRequest) => Promise<LineageROIMetrics>;
  validateLineage: (lineageId: string) => Promise<LineageValidationResult>;
  
  // Metrics Actions
  refreshMetrics: (assetId: string, timeRange?: TimeRange) => Promise<void>;
  refreshContexts: (assetId: string) => Promise<void>;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export const useDataLineage = (
  lineageId?: string,
  options: UseDataLineageOptions = {}
): UseDataLineageReturn => {
  const {
    enableRealTimeUpdates = false,
    autoRefreshInterval = 30000,
    maxRetries = 3,
    onError
  } = options;

  const queryClient = useQueryClient();
  
  // Analysis State
  const [impactAnalysis, setImpactAnalysis] = useState<LineageImpactAnalysis | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<LineageRiskAssessment | null>(null);
  const [costAnalysis, setCostAnalysis] = useState<LineageCostAnalysis | null>(null);
  const [businessImpact, setBusinessImpact] = useState<LineageBusinessImpact | null>(null);
  const [roiMetrics, setROIMetrics] = useState<LineageROIMetrics | null>(null);
  
  // Metrics State
  const [efficiencyMetrics, setEfficiencyMetrics] = useState<LineageEfficiencyMetrics | null>(null);
  const [usageStatistics, setUsageStatistics] = useState<LineageUsageStatistics | null>(null);
  const [healthMetrics, setHealthMetrics] = useState<LineageHealthMetrics | null>(null);
  const [reliabilityMetrics, setReliabilityMetrics] = useState<LineageReliabilityMetrics | null>(null);
  const [availabilityMetrics, setAvailabilityMetrics] = useState<LineageAvailabilityMetrics | null>(null);
  const [scalabilityMetrics, setScalabilityMetrics] = useState<LineageScalabilityMetrics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<LineagePerformanceMetrics | null>(null);
  
  // Context State
  const [qualityContext, setQualityContext] = useState<LineageQualityContext | null>(null);
  const [securityContext, setSecurityContext] = useState<LineageSecurityContext | null>(null);
  const [complianceContext, setComplianceContext] = useState<LineageComplianceContext | null>(null);
  const [operationalContext, setOperationalContext] = useState<LineageOperationalContext | null>(null);
  const [businessContext, setBusinessContext] = useState<LineageBusinessContext | null>(null);
  const [dataContext, setDataContext] = useState<LineageDataContext | null>(null);
  const [technicalContext, setTechnicalContext] = useState<LineageTechnicalContext | null>(null);
  const [governanceContext, setGovernanceContext] = useState<LineageGovernanceContext | null>(null);
  
  // Validation and Optimization State
  const [validation, setValidation] = useState<LineageValidationResult | null>(null);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<LineageOptimizationSuggestion[]>([]);
  const [complianceStatus, setComplianceStatus] = useState<LineageComplianceStatus | null>(null);
  const [securityClassification, setSecurityClassification] = useState<LineageSecurityClassification | null>(null);

  // ============================================================================
  // QUERIES
  // ============================================================================

  // Main lineage query
  const {
    data: lineageData,
    isLoading,
    isError,
    error,
    refetch: refetchQuery
  } = useQuery({
    queryKey: ['lineage', lineageId],
    queryFn: async () => {
      if (!lineageId) return null;
      return await advancedLineageService.getLineageById(lineageId);
    },
    enabled: !!lineageId,
    retry: maxRetries,
    refetchInterval: enableRealTimeUpdates ? autoRefreshInterval : false,
    onError: (err: Error) => {
      console.error('Lineage query error:', err);
      onError?.(err);
    }
  });

  // Lineage visualization query
  const { data: visualizationData } = useQuery({
    queryKey: ['lineage-visualization', lineageId],
    queryFn: async () => {
      if (!lineageId) return null;
      return await advancedLineageService.getLineageVisualization({
        assetId: lineageId,
        config: {
          enableInteractivity: true,
          showMetadata: true,
          enableFiltering: true,
          enableSearch: true,
          enableExport: true,
          theme: 'modern',
          colorScheme: 'default'
        },
        direction: 'BOTH',
        maxDepth: 5,
        includeLabels: true,
        layoutType: 'HIERARCHICAL'
      });
    },
    enabled: !!lineageId,
    retry: maxRetries
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const createLineageMutation = useMutation({
    mutationFn: (request: any) => advancedLineageService.createLineage(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lineage'] });
    },
    onError: (err: Error) => {
      console.error('Create lineage error:', err);
      onError?.(err);
    }
  });

  const updateLineageMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      advancedLineageService.updateLineage(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lineage'] });
    },
    onError: (err: Error) => {
      console.error('Update lineage error:', err);
      onError?.(err);
    }
  });

  const deleteLineageMutation = useMutation({
    mutationFn: (id: string) => advancedLineageService.deleteLineage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lineage'] });
    },
    onError: (err: Error) => {
      console.error('Delete lineage error:', err);
      onError?.(err);
    }
  });

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const refetch = useCallback(async () => {
    await refetchQuery();
    queryClient.invalidateQueries({ queryKey: ['lineage'] });
  }, [refetchQuery, queryClient]);

  const createLineage = useCallback(async (request: any) => {
    await createLineageMutation.mutateAsync(request);
  }, [createLineageMutation]);

  const updateLineage = useCallback(async (id: string, updates: any) => {
    await updateLineageMutation.mutateAsync({ id, updates });
  }, [updateLineageMutation]);

  const deleteLineage = useCallback(async (id: string) => {
    await deleteLineageMutation.mutateAsync(id);
  }, [deleteLineageMutation]);

  const analyzeImpact = useCallback(async (request: ImpactAnalysisRequest): Promise<LineageImpactAnalysis> => {
    try {
      const analysis = await advancedLineageService.performImpactAnalysis(request);
      setImpactAnalysis(analysis);
      return analysis;
    } catch (error) {
      console.error('Impact analysis error:', error);
      onError?.(error as Error);
      throw error;
    }
  }, [onError]);

  const assessRisk = useCallback(async (request: RiskAssessmentRequest): Promise<LineageRiskAssessment> => {
    try {
      const assessment = await advancedLineageService.assessLineageRisk(request);
      setRiskAssessment(assessment);
      return assessment;
    } catch (error) {
      console.error('Risk assessment error:', error);
      onError?.(error as Error);
      throw error;
    }
  }, [onError]);

  const analyzeCost = useCallback(async (request: CostAnalysisRequest): Promise<LineageCostAnalysis> => {
    try {
      const analysis = await advancedLineageService.analyzeLineageCost(request);
      setCostAnalysis(analysis);
      return analysis;
    } catch (error) {
      console.error('Cost analysis error:', error);
      onError?.(error as Error);
      throw error;
    }
  }, [onError]);

  const generateBusinessImpact = useCallback(async (request: BusinessImpactRequest): Promise<LineageBusinessImpact> => {
    try {
      const impact = await advancedLineageService.generateBusinessImpact(request);
      setBusinessImpact(impact);
      return impact;
    } catch (error) {
      console.error('Business impact analysis error:', error);
      onError?.(error as Error);
      throw error;
    }
  }, [onError]);

  const calculateROI = useCallback(async (request: ROICalculationRequest): Promise<LineageROIMetrics> => {
    try {
      const roi = await advancedLineageService.calculateROIMetrics(request);
      setROIMetrics(roi);
      return roi;
    } catch (error) {
      console.error('ROI calculation error:', error);
      onError?.(error as Error);
      throw error;
    }
  }, [onError]);

  const validateLineage = useCallback(async (lineageId: string): Promise<LineageValidationResult> => {
    try {
      const validationResult = await advancedLineageService.validateLineage(lineageId);
      setValidation(validationResult);
      return validationResult;
    } catch (error) {
      console.error('Lineage validation error:', error);
      onError?.(error as Error);
      throw error;
    }
  }, [onError]);

  const refreshMetrics = useCallback(async (assetId: string, timeRange?: TimeRange) => {
    try {
      const [
        efficiency,
        usage,
        health,
        reliability,
        availability,
        scalability,
        performance
      ] = await Promise.allSettled([
        advancedLineageService.getEfficiencyMetrics(assetId, timeRange),
        advancedLineageService.getUsageStatistics(assetId, timeRange),
        advancedLineageService.getHealthMetrics(assetId),
        advancedLineageService.getReliabilityMetrics(assetId, timeRange),
        advancedLineageService.getAvailabilityMetrics(assetId, timeRange),
        advancedLineageService.getScalabilityMetrics(assetId),
        advancedLineageService.getPerformanceMetrics(assetId, timeRange)
      ]);

      if (efficiency.status === 'fulfilled') setEfficiencyMetrics(efficiency.value);
      if (usage.status === 'fulfilled') setUsageStatistics(usage.value);
      if (health.status === 'fulfilled') setHealthMetrics(health.value);
      if (reliability.status === 'fulfilled') setReliabilityMetrics(reliability.value);
      if (availability.status === 'fulfilled') setAvailabilityMetrics(availability.value);
      if (scalability.status === 'fulfilled') setScalabilityMetrics(scalability.value);
      if (performance.status === 'fulfilled') setPerformanceMetrics(performance.value);
    } catch (error) {
      console.error('Failed to refresh metrics:', error);
      onError?.(error as Error);
    }
  }, [onError]);

  const refreshContexts = useCallback(async (assetId: string) => {
    try {
      const [
        quality,
        security,
        compliance,
        operational,
        business,
        data,
        technical,
        governance,
        optimizations,
        complianceStatusResult,
        securityClassificationResult
      ] = await Promise.allSettled([
        advancedLineageService.getQualityContext(assetId),
        advancedLineageService.getSecurityContext(assetId),
        advancedLineageService.getComplianceContext(assetId),
        advancedLineageService.getOperationalContext(assetId),
        advancedLineageService.getBusinessContext(assetId),
        advancedLineageService.getDataContext(assetId),
        advancedLineageService.getTechnicalContext(assetId),
        advancedLineageService.getGovernanceContext(assetId),
        advancedLineageService.getOptimizationSuggestions(assetId),
        advancedLineageService.getComplianceStatus(assetId),
        advancedLineageService.getSecurityClassification(assetId)
      ]);

      if (quality.status === 'fulfilled') setQualityContext(quality.value);
      if (security.status === 'fulfilled') setSecurityContext(security.value);
      if (compliance.status === 'fulfilled') setComplianceContext(compliance.value);
      if (operational.status === 'fulfilled') setOperationalContext(operational.value);
      if (business.status === 'fulfilled') setBusinessContext(business.value);
      if (data.status === 'fulfilled') setDataContext(data.value);
      if (technical.status === 'fulfilled') setTechnicalContext(technical.value);
      if (governance.status === 'fulfilled') setGovernanceContext(governance.value);
      if (optimizations.status === 'fulfilled') setOptimizationSuggestions(optimizations.value);
      if (complianceStatusResult.status === 'fulfilled') setComplianceStatus(complianceStatusResult.value);
      if (securityClassificationResult.status === 'fulfilled') setSecurityClassification(securityClassificationResult.value);
    } catch (error) {
      console.error('Failed to refresh contexts:', error);
      onError?.(error as Error);
    }
  }, [onError]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const nodes = useMemo(() => {
    if (!lineageData?.nodes) return [];
    return lineageData.nodes;
  }, [lineageData]);

  const edges = useMemo(() => {
    if (!lineageData?.edges) return [];
    return lineageData.edges;
  }, [lineageData]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Data
    lineageData: lineageData || null,
    nodes,
    edges,
    
    // States
    isLoading,
    isError,
    error: error as Error | null,
    
    // Analysis
    impactAnalysis,
    riskAssessment,
    costAnalysis,
    businessImpact,
    roiMetrics,
    
    // Metrics
    efficiencyMetrics,
    usageStatistics,
    healthMetrics,
    reliabilityMetrics,
    availabilityMetrics,
    scalabilityMetrics,
    performanceMetrics,
    
    // Context
    qualityContext,
    securityContext,
    complianceContext,
    operationalContext,
    businessContext,
    dataContext,
    technicalContext,
    governanceContext,
    
    // Validation and Optimization
    validation,
    optimizationSuggestions,
    complianceStatus,
    securityClassification,
    
    // Actions
    refetch,
    createLineage,
    updateLineage,
    deleteLineage,
    analyzeImpact,
    assessRisk,
    analyzeCost,
    generateBusinessImpact,
    calculateROI,
    validateLineage,
    refreshMetrics,
    refreshContexts
  };
};