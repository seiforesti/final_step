// Advanced-Scan-Logic/types/security.types.ts
// Security and compliance types

export interface SecurityScan {
  id: string;
  scan_type: SecurityScanType;
  status: SecurityScanStatus;
  vulnerabilities: Vulnerability[];
  compliance_checks: ComplianceCheck[];
  threat_intelligence: ThreatIntelligence[];
  security_score: number;
  risk_level: RiskLevel;
  remediation_actions: RemediationAction[];
}

export enum SecurityScanType {
  VULNERABILITY_SCAN = 'vulnerability_scan',
  COMPLIANCE_AUDIT = 'compliance_audit',
  THREAT_DETECTION = 'threat_detection',
  ACCESS_REVIEW = 'access_review',
  DATA_PRIVACY = 'data_privacy'
}

export enum SecurityScanStatus {
  PENDING = 'pending',
  SCANNING = 'scanning',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface Vulnerability {
  id: string;
  cve_id?: string;
  severity: VulnerabilitySeverity;
  title: string;
  description: string;
  affected_components: string[];
  remediation_priority: RemediationPriority;
  patch_available: boolean;
}

export enum VulnerabilitySeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

export enum RemediationPriority {
  IMMEDIATE = 'immediate',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum RiskLevel {
  VERY_HIGH = 'very_high',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  VERY_LOW = 'very_low'
}