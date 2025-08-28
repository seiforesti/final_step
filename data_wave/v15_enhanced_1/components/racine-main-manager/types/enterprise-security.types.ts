/**
 * Enterprise Security Types - Advanced Security and Compliance
 * ============================================================
 *
 * This file contains comprehensive TypeScript type definitions for enterprise security,
 * audit systems, compliance frameworks, and encryption management.
 */

import { ISODateString, UUID } from './racine-core.types';

// =============================================================================
// ENTERPRISE SECURITY TYPES
// =============================================================================

export interface SecurityConfiguration {
  authentication: {
    methods: ("password" | "mfa" | "sso" | "certificate" | "biometric")[];
    passwordPolicy: PasswordPolicy;
    sessionManagement: SessionConfig;
    ssoProviders: SSOProvider[];
  };
  authorization: {
    rbacEnabled: boolean;
    abacEnabled: boolean;
    policies: AuthorizationPolicy[];
    roleHierarchy: RoleHierarchy[];
  };
  audit: {
    enabled: boolean;
    retention: number; // days
    categories: string[];
    realTimeMonitoring: boolean;
    complianceReporting: boolean;
  };
  encryption: {
    atRest: EncryptionConfig;
    inTransit: EncryptionConfig;
    keyManagement: KeyManagementConfig;
  };
  compliance: {
    frameworks: ("SOX" | "GDPR" | "HIPAA" | "PCI_DSS" | "ISO_27001" | "NIST")[];
    automaticScanning: boolean;
    reportingSchedule: string;
    violations: ComplianceViolation[];
  };
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge: number; // days
  historyCount: number;
  lockoutThreshold: number;
  lockoutDuration: number; // minutes
}

export interface SessionConfig {
  timeout: number; // minutes
  maxConcurrent: number;
  requireReauth: string[]; // sensitive operations
  ipRestriction: boolean;
  deviceTracking: boolean;
}

export interface SSOProvider {
  id: string;
  name: string;
  type: "saml" | "oauth" | "oidc";
  configuration: Record<string, any>;
  enabled: boolean;
  userMapping: Record<string, string>;
}

export interface AuthorizationPolicy {
  id: string;
  name: string;
  description: string;
  effect: "allow" | "deny";
  resources: string[];
  actions: string[];
  conditions: PolicyCondition[];
  priority: number;
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

export interface RoleHierarchy {
  parentRole: string;
  childRole: string;
  inheritPermissions: boolean;
  restrictions: string[];
}

export interface EncryptionConfig {
  algorithm: string;
  keySize: number;
  enabled: boolean;
  rotationSchedule: string;
}

export interface KeyManagementConfig {
  provider: "aws_kms" | "azure_key_vault" | "hashicorp_vault" | "internal";
  configuration: Record<string, any>;
  backupStrategy: string;
  accessLogging: boolean;
}

export interface ComplianceViolation {
  id: string;
  framework: string;
  rule: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  detectedAt: ISODateString;
  affectedResources: string[];
  remediation: string[];
  status: "open" | "in_progress" | "resolved" | "false_positive";
  assignedTo?: string;
  dueDate?: ISODateString;
}

// =============================================================================
// DATA LINEAGE AND IMPACT ANALYSIS TYPES
// =============================================================================

export interface DataLineageGraph {
  nodes: LineageNode[];
  edges: LineageEdge[];
  metadata: {
    totalNodes: number;
    totalEdges: number;
    depth: number;
    complexity: "simple" | "moderate" | "complex" | "enterprise";
    lastUpdated: ISODateString;
  };
}

export interface LineageNode {
  id: string;
  name: string;
  type:
    | "source"
    | "transformation"
    | "destination"
    | "process"
    | "user"
    | "system";
  category: string;
  properties: Record<string, any>;
  position: { x: number; y: number };
  level: number; // depth in lineage
  criticality: "low" | "medium" | "high" | "critical";
  tags: string[];
  lastAccessed: ISODateString;
  accessCount: number;
}

export interface LineageEdge {
  id: string;
  source: string;
  target: string;
  type: "data_flow" | "dependency" | "transformation" | "trigger" | "access";
  properties: {
    volume: number;
    frequency: string;
    latency: number;
    quality: number;
  };
  metadata: Record<string, any>;
  strength: number; // 0-1 indicating relationship strength
}

export interface ImpactAnalysis {
  targetResource: string;
  impactType: "change" | "deletion" | "modification" | "access_restriction";
  upstreamImpact: {
    affectedResources: string[];
    severity: "low" | "medium" | "high" | "critical";
    estimatedDowntime: number; // minutes
    businessImpact: string;
  };
  downstreamImpact: {
    affectedResources: string[];
    severity: "low" | "medium" | "high" | "critical";
    cascadeEffects: string[];
    mitigationStrategies: string[];
  };
  recommendations: {
    preChange: string[];
    duringChange: string[];
    postChange: string[];
    rollbackPlan: string[];
  };
}