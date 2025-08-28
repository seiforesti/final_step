/**
 * Cost Optimization Types - Enterprise Cost Management
 * ====================================================
 *
 * This file contains comprehensive TypeScript type definitions for cost optimization,
 * budget management, spending policies, and financial analytics features.
 */

import { ISODateString, UUID } from './racine-core.types';

// =============================================================================
// COST OPTIMIZATION TYPES
// =============================================================================

export interface CostOptimization {
  currentCosts: {
    total: number;
    breakdown: CostBreakdown[];
    trends: CostTrend[];
    projections: CostProjection[];
  };
  optimizations: {
    identified: OptimizationOpportunity[];
    implemented: ImplementedOptimization[];
    recommended: RecommendedOptimization[];
  };
  budgets: {
    allocated: Budget[];
    alerts: BudgetAlert[];
    forecasts: BudgetForecast[];
  };
  policies: {
    spending: SpendingPolicy[];
    approval: ApprovalPolicy[];
    allocation: AllocationPolicy[];
  };
}

export interface CostBreakdown {
  category:
    | "compute"
    | "storage"
    | "network"
    | "licensing"
    | "support"
    | "other";
  subcategory: string;
  amount: number;
  percentage: number;
  trend: "increasing" | "decreasing" | "stable";
  drivers: string[];
}

export interface CostTrend {
  period: "daily" | "weekly" | "monthly" | "quarterly";
  data: Array<{ timestamp: ISODateString; amount: number }>;
  growth: number; // percentage
  seasonality: boolean;
  anomalies: Array<{
    timestamp: ISODateString;
    deviation: number;
    reason?: string;
  }>;
}

export interface CostProjection {
  timeframe: "month" | "quarter" | "year";
  projected: number;
  confidence: number;
  factors: string[];
  scenarios: Array<{
    name: string;
    probability: number;
    amount: number;
    assumptions: string[];
  }>;
}

export interface OptimizationOpportunity {
  id: string;
  type:
    | "resource_rightsizing"
    | "unused_resources"
    | "scheduling"
    | "automation"
    | "licensing"
    | "architecture";
  title: string;
  description: string;
  potentialSavings: {
    amount: number;
    percentage: number;
    confidence: number;
  };
  effort: "low" | "medium" | "high";
  risk: "low" | "medium" | "high";
  timeline: number; // days to implement
  prerequisites: string[];
  impact: string[];
}

export interface ImplementedOptimization {
  id: string;
  opportunityId: string;
  implementedAt: ISODateString;
  actualSavings: number;
  projectedSavings: number;
  effectiveness: number; // 0-1
  sideEffects: string[];
  rollbackPlan: string;
}

export interface RecommendedOptimization {
  id: string;
  priority: number;
  recommendation: string;
  justification: string;
  quickWins: string[];
  longTermBenefits: string[];
  implementationSteps: string[];
}

export interface Budget {
  id: string;
  name: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  period: "monthly" | "quarterly" | "yearly";
  startDate: ISODateString;
  endDate: ISODateString;
  owner: string;
  approvers: string[];
}

export interface BudgetAlert {
  id: string;
  budgetId: string;
  type: "threshold" | "projection" | "anomaly";
  threshold: number; // percentage
  triggered: boolean;
  message: string;
  severity: "info" | "warning" | "critical";
  timestamp: ISODateString;
}

export interface BudgetForecast {
  budgetId: string;
  projectedSpend: number;
  projectedOverrun: number;
  confidence: number;
  factors: string[];
  recommendations: string[];
}

export interface SpendingPolicy {
  id: string;
  name: string;
  rules: PolicyRule[];
  enforcement: "advisory" | "blocking";
  exceptions: PolicyException[];
}

export interface ApprovalPolicy {
  id: string;
  name: string;
  thresholds: Array<{
    amount: number;
    approvers: string[];
    timeLimit: number; // hours
  }>;
  autoApproval: {
    enabled: boolean;
    conditions: PolicyCondition[];
    maxAmount: number;
  };
}

export interface AllocationPolicy {
  id: string;
  name: string;
  strategy: "equal" | "proportional" | "priority_based" | "usage_based";
  parameters: Record<string, any>;
  rebalancing: {
    frequency: "daily" | "weekly" | "monthly";
    triggers: string[];
    automatic: boolean;
  };
}

export interface PolicyRule {
  condition: string;
  action: "allow" | "deny" | "require_approval" | "warn";
  parameters: Record<string, any>;
}

export interface PolicyException {
  id: string;
  reason: string;
  approvedBy: string;
  validUntil: ISODateString;
  conditions: string[];
}

export interface PolicyCondition {
  attribute: string;
  operator:
    | "equals"
    | "not_equals"
    | "in"
    | "not_in"
    | "greater_than"
    | "less_than";
  value: any;
}