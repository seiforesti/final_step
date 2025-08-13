// ============================================================================
// IMPACT ANALYSIS SERVICE - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Advanced impact analysis capabilities for data assets and changes
// Maps to backend advanced_lineage_service.py impact analysis endpoints
// ============================================================================

import axios, { AxiosResponse } from 'axios';
import { 
  CatalogApiResponse,
  API_CONFIG,
  buildUrl,
  buildPaginatedUrl 
} from '../constants';

// Import base lineage service for underlying functionality
import { advancedLineageService } from './advanced-lineage.service';
import { catalogAnalyticsService } from './catalog-analytics.service';

// ============================================================================
// IMPACT ANALYSIS INTERFACES
// ============================================================================

export interface ImpactAnalysisRequest {
  assetIds: string[];
  changeType: 'schema' | 'data' | 'location' | 'access' | 'deletion';
  scope: 'immediate' | 'full' | 'critical_path';
  includeDownstream?: boolean;
  includeUpstream?: boolean;
  maxDepth?: number;
  businessCriticality?: 'low' | 'medium' | 'high' | 'critical';
}

export interface ImpactAnalysisResult {
  analysisId: string;
  request: ImpactAnalysisRequest;
  impactedAssets: ImpactedAsset[];
  impactSummary: ImpactSummary;
  riskAssessment: RiskAssessment;
  recommendations: ImpactRecommendation[];
  executionPlan?: ExecutionPlan;
  estimatedEffort: EffortEstimate;
  businessImpact: BusinessImpact;
  technicalImpact: TechnicalImpact;
  complianceImpact: ComplianceImpact;
  createdAt: string;
  completedAt?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface ImpactedAsset {
  assetId: string;
  assetName: string;
  assetType: string;
  impactLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  impactType: string[];
  dependencyPath: string[];
  estimatedDowntime?: number;
  requiredActions: string[];
  riskFactors: string[];
  businessCriticality: string;
  lastUsed?: string;
  usageFrequency: string;
  stakeholders: string[];
  mitigationStrategies: string[];
}

export interface ImpactSummary {
  totalAssets: number;
  criticalAssets: number;
  highImpactAssets: number;
  mediumImpactAssets: number;
  lowImpactAssets: number;
  businessProcessesAffected: number;
  usersAffected: number;
  systemsAffected: number;
  estimatedTotalDowntime: number;
  maxImpactRadius: number;
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: RiskFactor[];
  mitigationStrategies: MitigationStrategy[];
  contingencyPlans: ContingencyPlan[];
  riskScore: number;
  confidenceLevel: number;
}

export interface RiskFactor {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  likelihood: number;
  impact: number;
  affectedAssets: string[];
}

export interface MitigationStrategy {
  id: string;
  type: string;
  description: string;
  effort: 'low' | 'medium' | 'high';
  effectiveness: number;
  timeframe: string;
  dependencies: string[];
  cost: number;
}

export interface ContingencyPlan {
  id: string;
  scenario: string;
  triggerConditions: string[];
  actions: string[];
  rollbackPlan: string[];
  estimatedRecoveryTime: number;
  requiredResources: string[];
}

export interface ImpactRecommendation {
  id: string;
  type: 'preventive' | 'corrective' | 'optimization';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  rationale: string;
  implementation: string[];
  estimatedEffort: number;
  expectedBenefit: string;
  risks: string[];
  dependencies: string[];
}

export interface ExecutionPlan {
  phases: ExecutionPhase[];
  totalDuration: number;
  criticalPath: string[];
  resourceRequirements: ResourceRequirement[];
  milestones: Milestone[];
  rollbackPlan: RollbackStep[];
}

export interface ExecutionPhase {
  id: string;
  name: string;
  description: string;
  order: number;
  estimatedDuration: number;
  dependencies: string[];
  tasks: Task[];
  resources: string[];
  risks: string[];
}

export interface Task {
  id: string;
  name: string;
  description: string;
  type: string;
  estimatedDuration: number;
  dependencies: string[];
  assignee?: string;
  automation?: boolean;
  validation: ValidationRule[];
}

export interface ValidationRule {
  type: string;
  condition: string;
  expectedResult: string;
  severity: string;
}

export interface ResourceRequirement {
  type: 'human' | 'system' | 'tool' | 'budget';
  description: string;
  quantity: number;
  unit: string;
  timeframe: string;
  criticality: string;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  targetDate: string;
  dependencies: string[];
  successCriteria: string[];
}

export interface RollbackStep {
  id: string;
  name: string;
  description: string;
  order: number;
  condition: string;
  action: string;
  validation: string;
  estimatedDuration: number;
}

export interface EffortEstimate {
  developmentHours: number;
  testingHours: number;
  deploymentHours: number;
  totalHours: number;
  complexity: 'low' | 'medium' | 'high' | 'very_high';
  confidence: number;
  assumptions: string[];
  risks: string[];
}

export interface BusinessImpact {
  revenue: {
    potential_loss: number;
    timeframe: string;
    confidence: number;
  };
  customers: {
    affected_count: number;
    impact_level: string;
    satisfaction_score: number;
  };
  operations: {
    processes_affected: string[];
    efficiency_impact: number;
    automation_impact: string;
  };
  compliance: {
    regulations_affected: string[];
    risk_level: string;
    remediation_required: boolean;
  };
}

export interface TechnicalImpact {
  performance: {
    expected_degradation: number;
    affected_systems: string[];
    recovery_time: number;
  };
  availability: {
    downtime_estimate: number;
    affected_services: string[];
    cascade_effects: string[];
  };
  security: {
    vulnerabilities: string[];
    data_exposure_risk: string;
    access_changes: string[];
  };
  maintenance: {
    ongoing_effort: number;
    monitoring_requirements: string[];
    support_impact: string;
  };
}

export interface ComplianceImpact {
  regulations: RegulationImpact[];
  auditRequirements: string[];
  dataRetention: DataRetentionImpact;
  privacyImpact: PrivacyImpact;
  reportingRequirements: string[];
}

export interface RegulationImpact {
  regulation: string;
  impact_level: string;
  requirements: string[];
  deadlines: string[];
  penalties: string[];
}

export interface DataRetentionImpact {
  affected_policies: string[];
  retention_changes: string[];
  archival_requirements: string[];
  deletion_timeline: string[];
}

export interface PrivacyImpact {
  data_categories: string[];
  consent_requirements: string[];
  notification_obligations: string[];
  right_to_erasure: boolean;
}

// ============================================================================
// IMPACT ANALYSIS SERVICE CLASS
// ============================================================================

export class ImpactAnalysisService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  /**
   * Perform comprehensive impact analysis
   */
  async analyzeImpact(request: ImpactAnalysisRequest): Promise<CatalogApiResponse<ImpactAnalysisResult>> {
    const url = buildUrl('/api/v1/catalog/impact-analysis');
    
    const response = await axios.post<CatalogApiResponse<ImpactAnalysisResult>>(url, request, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Get impact analysis by ID
   */
  async getImpactAnalysis(analysisId: string): Promise<CatalogApiResponse<ImpactAnalysisResult>> {
    const url = buildUrl(`/api/v1/catalog/impact-analysis/${analysisId}`);
    
    const response = await axios.get<CatalogApiResponse<ImpactAnalysisResult>>(url, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Get impact analysis history for an asset
   */
  async getAssetImpactHistory(assetId: string): Promise<CatalogApiResponse<ImpactAnalysisResult[]>> {
    const url = buildUrl(`/api/v1/catalog/assets/${assetId}/impact-history`);
    
    const response = await axios.get<CatalogApiResponse<ImpactAnalysisResult[]>>(url, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Perform quick impact assessment (simplified)
   */
  async quickImpactAssessment(assetId: string, changeType: string): Promise<CatalogApiResponse<ImpactSummary>> {
    const url = buildUrl(`/api/v1/catalog/assets/${assetId}/quick-impact`);
    
    const response = await axios.post<CatalogApiResponse<ImpactSummary>>(url, {
      change_type: changeType,
      scope: 'immediate'
    }, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Get impact analysis templates
   */
  async getAnalysisTemplates(): Promise<CatalogApiResponse<any[]>> {
    const url = buildUrl('/api/v1/catalog/impact-analysis/templates');
    
    const response = await axios.get<CatalogApiResponse<any[]>>(url, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Validate impact analysis request
   */
  async validateAnalysisRequest(request: ImpactAnalysisRequest): Promise<CatalogApiResponse<any>> {
    const url = buildUrl('/api/v1/catalog/impact-analysis/validate');
    
    const response = await axios.post<CatalogApiResponse<any>>(url, request, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Export impact analysis report
   */
  async exportAnalysis(analysisId: string, format: 'pdf' | 'xlsx' | 'json' = 'pdf'): Promise<CatalogApiResponse<string>> {
    const url = buildUrl(`/api/v1/catalog/impact-analysis/${analysisId}/export`);
    
    const response = await axios.post<CatalogApiResponse<string>>(url, {
      format
    }, {
      timeout: this.timeout * 2 // Export might take longer
    });
    
    return response.data;
  }

  /**
   * Get aggregated impact metrics
   */
  async getImpactMetrics(timeRange?: { start: string; end: string }): Promise<CatalogApiResponse<any>> {
    const url = buildUrl('/api/v1/catalog/impact-analysis/metrics', timeRange);
    
    const response = await axios.get<CatalogApiResponse<any>>(url, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Simulate impact for what-if analysis
   */
  async simulateImpact(scenario: any): Promise<CatalogApiResponse<ImpactAnalysisResult>> {
    const url = buildUrl('/api/v1/catalog/impact-analysis/simulate');
    
    const response = await axios.post<CatalogApiResponse<ImpactAnalysisResult>>(url, scenario, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Create impact analysis from lineage
   */
  async createFromLineage(assetId: string, options?: any): Promise<CatalogApiResponse<ImpactAnalysisResult>> {
    // Use the advanced lineage service to get lineage data
    const lineageData = await advancedLineageService.traceLineage(assetId, options?.depth || 3);
    
    // Convert lineage data to impact analysis request
    const impactRequest: ImpactAnalysisRequest = {
      assetIds: [assetId],
      changeType: options?.changeType || 'data',
      scope: options?.scope || 'full',
      includeDownstream: true,
      includeUpstream: true,
      maxDepth: options?.depth || 3
    };
    
    return this.analyzeImpact(impactRequest);
  }
}

// ============================================================================
// SERVICE INSTANCE
// ============================================================================

export const impactAnalysisService = new ImpactAnalysisService();

// Default export
export default impactAnalysisService;