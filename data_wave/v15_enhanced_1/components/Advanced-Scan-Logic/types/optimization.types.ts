// Advanced-Scan-Logic/types/optimization.types.ts
// Optimization types

export interface OptimizationRecommendation {
  id: string;
  type: OptimizationType;
  priority: OptimizationPriority;
  title: string;
  description: string;
  current_state: OptimizationState;
  target_state: OptimizationState;
  expected_improvement: ExpectedImprovement;
  implementation_plan: ImplementationPlan;
  risks: OptimizationRisk[];
  benefits: OptimizationBenefit[];
}

export enum OptimizationType {
  PERFORMANCE = 'performance',
  COST = 'cost',
  RESOURCE = 'resource',
  WORKFLOW = 'workflow',
  QUALITY = 'quality',
  EFFICIENCY = 'efficiency'
}

export enum OptimizationPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export interface OptimizationState {
  metrics: Record<string, number>;
  configuration: Record<string, any>;
  resource_allocation: ResourceAllocation;
  performance_indicators: PerformanceIndicator[];
}

export interface ExpectedImprovement {
  performance_gain_percent: number;
  cost_savings_percent: number;
  efficiency_improvement_percent: number;
  roi_percent: number;
  payback_period_months: number;
}

export interface ImplementationPlan {
  steps: ImplementationStep[];
  estimated_duration_hours: number;
  required_resources: string[];
  prerequisites: string[];
  rollback_strategy: RollbackStrategy;
}

export interface OptimizationRisk {
  description: string;
  probability: RiskProbability;
  impact: RiskImpact;
  mitigation_strategy: string;
}

export enum RiskProbability {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum RiskImpact {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}