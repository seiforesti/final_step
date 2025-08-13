/**
 * RBACSystemSPAOrchestrator.tsx - RBAC System SPA Orchestrator (Admin Only)
 * =========================================================================
 * 
 * Advanced orchestrator for the existing Advanced_RBAC_Datagovernance_System SPA 
 * that adds racine-level functionality for cross-SPA access control, advanced 
 * analytics, and enterprise integration while maintaining full backward compatibility.
 * 
 * ⚠️  ADMIN ONLY ACCESS - This orchestrator requires administrative privileges
 * 
 * Features:
 * - Deep integration with existing Advanced_RBAC_Datagovernance_System SPA
 * - Cross-SPA access control orchestration across all governance systems
 * - Advanced RBAC analytics and security insights
 * - Enterprise-grade identity and access management
 * - Real-time permission monitoring and alerts
 * - Policy enforcement and compliance tracking
 * - Advanced audit trails and security reporting
 * 
 * Existing SPA Integration:
 * - Orchestrates: v15_enhanced_1/components/Advanced_RBAC_Datagovernance_System/
 * - Core Components: RBAC management, access control, identity management
 * - Services: Existing RBAC services and APIs
 * 
 * Backend Integration:
 * - Uses cross-group-integration-apis.ts for RBAC orchestration
 * - Uses racine-orchestration-apis.ts for system coordination
 * - Uses ai-assistant-apis.ts for security insights
 * - Integrates with rbac-apis.ts for access management
 */

'use client';

import React, { 
  useState, 
  useEffect, 
  useCallback, 
  useMemo, 
  useRef,
  Suspense,
  lazy
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock,
  Network,
  Brain,
  Users,
  Settings,
  TrendingUp,
  Zap,
  Activity,
  BarChart3,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Share2,
  Eye,
  EyeOff,
  Unlock,
  Bell,
  BellOff,
  Star,
  Bookmark,
  Tag,
  Link,
  Unlink,
  Copy,
  ExternalLink,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Info,
  HelpCircle,
  Settings2,
  Layers,
  Workflow,
  FileText,
  Target,
  Gauge,
  Sparkles,
  UserCheck,
  UserX,
  KeyRound,
  ShieldAlert,
  Database,
  Crown
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

// Existing RBAC System SPA Components - CRITICAL: Import without modification
const RBACManager = lazy(() => 
  import('../../../Advanced_RBAC_Datagovernance_System').then(module => ({
    default: module.RBACManager || module.default
  }))
);

// Core Types
import {
  UUID,
  ISODateString,
  CrossGroupState,
  WorkspaceConfiguration,
  IntegrationStatus,
  AIRecommendation,
  AIInsight,
  CollaborationState,
  ActivityRecord
} from '../../types/racine-core.types';

// Services
import { crossGroupIntegrationAPI } from '../../services/cross-group-integration-apis';
import { racineOrchestrationAPI } from '../../services/racine-orchestration-apis';
import { aiAssistantAPI } from '../../services/ai-assistant-apis';
import { rbacAPI } from '../../services/rbac-apis';
import { collaborationAPI } from '../../services/collaboration-apis';

// Hooks
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useAIAssistant } from '../../hooks/useAIAssistant';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useCollaboration } from '../../hooks/useCollaboration';
import { useActivityTracker } from '../../hooks/useActivityTracker';

// Enhanced RBAC State Interface
interface EnhancedRBACState {
  originalSPAState: any;
  orchestrationEnabled: boolean;
  crossSPAIntegrations: {
    dataSources: IntegrationStatus;
    scanRuleSets: IntegrationStatus;
    classifications: IntegrationStatus;
    compliance: IntegrationStatus;
    catalog: IntegrationStatus;
    scanLogic: IntegrationStatus;
  };
  
  // Access control orchestration
  accessControlPolicies: AccessControlPolicy[];
  activePermissions: ActivePermission[];
  roleHierarchy: RoleHierarchy[];
  securityAlerts: SecurityAlert[];
  
  // Analytics and monitoring
  accessAnalytics: AccessAnalytics;
  securityMetrics: SecurityMetrics;
  complianceReport: ComplianceReport;
  auditTrail: AuditEntry[];
  
  // AI enhancements
  aiRecommendations: AIRecommendation[];
  securityInsights: SecurityInsight[];
  riskAssessments: RiskAssessment[];
  
  // Identity management
  identityProviders: IdentityProvider[];
  userSessions: UserSession[];
  accessRequests: AccessRequest[];
  
  // Cross-SPA enforcement
  crossSPAPolicyEnforcement: CrossSPAPolicyEnforcement[];
  policyViolations: PolicyViolation[];
  
  // Enterprise integration
  enterpriseIntegrations: EnterpriseIntegration[];
  ssoConfigurations: SSOConfiguration[];
  
  // Workspace integration
  workspaceContext: WorkspaceConfiguration | null;
  orchestrationErrors: string[];
  lastSyncTime: ISODateString | null;
}

// RBAC-specific types
interface AccessControlPolicy {
  id: UUID;
  name: string;
  description: string;
  type: 'role_based' | 'attribute_based' | 'discretionary' | 'mandatory';
  scope: 'global' | 'spa_specific' | 'resource_specific';
  targetSPAs: string[];
  rules: PolicyRule[];
  status: 'active' | 'inactive' | 'pending_approval';
  priority: number;
  createdBy: UUID;
  createdAt: ISODateString;
  lastModified: ISODateString;
}

interface PolicyRule {
  id: UUID;
  type: 'allow' | 'deny' | 'conditional';
  subject: string; // user, role, or group
  action: string; // read, write, delete, execute, etc.
  resource: string; // specific resource or pattern
  conditions: PolicyCondition[];
  effect: 'allow' | 'deny';
}

interface PolicyCondition {
  attribute: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'greater_than' | 'less_than';
  value: any;
  required: boolean;
}

interface ActivePermission {
  id: UUID;
  userId: UUID;
  userName: string;
  roleId: UUID;
  roleName: string;
  spa: string;
  resourceType: string;
  resourceId?: UUID;
  permissions: string[];
  grantedAt: ISODateString;
  expiresAt?: ISODateString;
  grantedBy: UUID;
  status: 'active' | 'expired' | 'revoked' | 'suspended';
}

interface RoleHierarchy {
  id: UUID;
  parentRoleId?: UUID;
  childRoleId: UUID;
  roleName: string;
  level: number;
  permissions: Permission[];
  inheritedPermissions: Permission[];
  userCount: number;
  isSystemRole: boolean;
}

interface Permission {
  id: UUID;
  name: string;
  description: string;
  resource: string;
  actions: string[];
  scope: 'global' | 'spa' | 'resource';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface SecurityAlert {
  id: UUID;
  type: 'unauthorized_access' | 'privilege_escalation' | 'policy_violation' | 'suspicious_activity' | 'failed_authentication';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  userId?: UUID;
  affectedSPAs: string[];
  detectedAt: ISODateString;
  acknowledged: boolean;
  resolvedAt?: ISODateString;
  riskScore: number;
  indicators: SecurityIndicator[];
}

interface SecurityIndicator {
  type: string;
  value: string;
  confidence: number;
  description: string;
}

interface AccessAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  activeRoles: number;
  totalPermissions: number;
  accessRequests: {
    pending: number;
    approved: number;
    denied: number;
    total: number;
  };
  crossSPAAccess: {
    [spa: string]: {
      activeUsers: number;
      totalAccesses: number;
      averageSessionDuration: number;
    };
  };
  lastCalculated: ISODateString;
}

interface SecurityMetrics {
  overallSecurityScore: number;
  policyCompliance: number;
  accessRiskScore: number;
  authenticationSuccessRate: number;
  privilegedAccessUsage: number;
  securityTrends: SecurityTrend[];
  vulnerabilityMetrics: VulnerabilityMetric[];
  lastAssessment: ISODateString;
}

interface SecurityTrend {
  date: string;
  securityScore: number;
  incidents: number;
  accessViolations: number;
  privilegedAccess: number;
}

interface VulnerabilityMetric {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  count: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

interface ComplianceReport {
  overallComplianceScore: number;
  frameworks: FrameworkCompliance[];
  violations: ComplianceViolation[];
  recommendations: ComplianceRecommendation[];
  lastGenerated: ISODateString;
}

interface FrameworkCompliance {
  framework: string;
  version: string;
  score: number;
  controlsTotal: number;
  controlsCompliant: number;
  status: 'compliant' | 'partial' | 'non_compliant';
}

interface ComplianceViolation {
  id: UUID;
  framework: string;
  control: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedUsers: UUID[];
  detectedAt: ISODateString;
  remediation: string;
}

interface ComplianceRecommendation {
  id: UUID;
  type: 'policy_update' | 'role_adjustment' | 'access_review' | 'training';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedEffort: string;
  expectedBenefit: string;
}

interface AuditEntry {
  id: UUID;
  timestamp: ISODateString;
  userId: UUID;
  userName: string;
  action: string;
  resource: string;
  spa: string;
  result: 'success' | 'failure' | 'blocked';
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  riskScore: number;
}

interface SecurityInsight {
  id: UUID;
  type: 'access_pattern' | 'privilege_analysis' | 'risk_prediction' | 'policy_optimization';
  title: string;
  description: string;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  affectedUsers: UUID[];
  recommendedActions: string[];
  detectedAt: ISODateString;
}

interface RiskAssessment {
  id: UUID;
  userId: UUID;
  userName: string;
  overallRiskScore: number;
  riskFactors: RiskFactor[];
  mitigationStrategies: string[];
  lastAssessed: ISODateString;
  nextAssessment: ISODateString;
}

interface RiskFactor {
  type: 'excessive_permissions' | 'dormant_account' | 'privileged_access' | 'external_access' | 'policy_violations';
  score: number;
  description: string;
  evidence: string[];
}

interface IdentityProvider {
  id: UUID;
  name: string;
  type: 'ldap' | 'active_directory' | 'oauth' | 'saml' | 'custom';
  status: 'active' | 'inactive' | 'error';
  connectedUsers: number;
  lastSync: ISODateString;
  configuration: Record<string, any>;
  healthStatus: 'healthy' | 'degraded' | 'critical';
}

interface UserSession {
  id: UUID;
  userId: UUID;
  userName: string;
  spa: string;
  startTime: ISODateString;
  lastActivity: ISODateString;
  ipAddress: string;
  userAgent: string;
  status: 'active' | 'expired' | 'terminated';
  permissions: string[];
  riskScore: number;
}

interface AccessRequest {
  id: UUID;
  requesterId: UUID;
  requesterName: string;
  requestedPermissions: Permission[];
  targetSPAs: string[];
  justification: string;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  requestedAt: ISODateString;
  reviewedBy?: UUID;
  reviewedAt?: ISODateString;
  reviewComments?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

interface CrossSPAPolicyEnforcement {
  id: UUID;
  policyId: UUID;
  policyName: string;
  targetSPA: string;
  status: 'enforced' | 'pending' | 'failed' | 'bypassed';
  enforcedAt: ISODateString;
  violations: number;
  lastCheck: ISODateString;
  configuration: Record<string, any>;
}

interface PolicyViolation {
  id: UUID;
  policyId: UUID;
  policyName: string;
  userId: UUID;
  userName: string;
  spa: string;
  violationType: 'unauthorized_access' | 'permission_exceeded' | 'time_restriction' | 'location_restriction';
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: ISODateString;
  resolvedAt?: ISODateString;
  details: string;
  evidence: Record<string, any>;
}

interface EnterpriseIntegration {
  id: UUID;
  name: string;
  type: 'directory_service' | 'identity_provider' | 'security_system' | 'audit_system';
  vendor: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync: ISODateString;
  syncedEntities: number;
  configuration: Record<string, any>;
  healthMetrics: Record<string, number>;
}

interface SSOConfiguration {
  id: UUID;
  name: string;
  provider: string;
  protocol: 'saml' | 'oauth' | 'openid_connect';
  status: 'active' | 'inactive' | 'testing';
  connectedSPAs: string[];
  userCount: number;
  lastUsed: ISODateString;
  configuration: Record<string, any>;
  securitySettings: Record<string, any>;
}

// Access Control Dashboard Component
const AccessControlDashboard: React.FC<{
  accessAnalytics: AccessAnalytics;
  securityMetrics: SecurityMetrics;
  securityAlerts: SecurityAlert[];
  onAcknowledgeAlert: (alertId: UUID) => void;
  onReviewAccess: () => void;
  onGenerateReport: () => void;
  isLoading: boolean;
}> = ({ 
  accessAnalytics, 
  securityMetrics, 
  securityAlerts, 
  onAcknowledgeAlert, 
  onReviewAccess,
  onGenerateReport,
  isLoading 
}) => {
  const criticalAlerts = securityAlerts.filter(alert => alert.severity === 'critical' && !alert.acknowledged);
  const pendingRequests = accessAnalytics.accessRequests.pending;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Access Control Dashboard
            <Crown className="h-4 w-4 text-amber-500" title="Admin Only" />
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={onReviewAccess} size="sm" variant="outline">
              <UserCheck className="h-4 w-4 mr-2" />
              Review Access
            </Button>
            <Button onClick={onGenerateReport} size="sm" disabled={isLoading}>
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Security Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-3xl font-bold text-green-600">{securityMetrics.overallSecurityScore}%</p>
              <p className="text-sm text-muted-foreground">Security Score</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">{accessAnalytics.activeUsers}</p>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
          </div>

          {/* Critical Alerts */}
          {criticalAlerts.length > 0 && (
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Critical Security Alerts</AlertTitle>
              <AlertDescription>
                {criticalAlerts.length} critical security alerts require immediate attention
              </AlertDescription>
            </Alert>
          )}

          {/* Access Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <p className="text-xl font-bold">{accessAnalytics.totalRoles}</p>
              <p className="text-xs text-muted-foreground">Total Roles</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-xl font-bold">{accessAnalytics.totalPermissions}</p>
              <p className="text-xs text-muted-foreground">Permissions</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-xl font-bold">{pendingRequests}</p>
              <p className="text-xs text-muted-foreground">Pending Requests</p>
            </div>
          </div>
          
          {/* Security Alerts */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Security Alerts ({securityAlerts.filter(a => !a.acknowledged).length})
            </h4>
            {securityAlerts.filter(a => !a.acknowledged).length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No active security alerts</p>
              </div>
            ) : (
              <div className="space-y-2">
                {securityAlerts.filter(a => !a.acknowledged).slice(0, 5).map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 border rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          alert.severity === 'critical' ? 'destructive' :
                          alert.severity === 'high' ? 'default' :
                          alert.severity === 'medium' ? 'secondary' : 'outline'
                        } className="text-xs">
                          {alert.severity}
                        </Badge>
                        <Badge variant="outline" className="text-xs">{alert.type}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAcknowledgeAlert(alert.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    <h5 className="font-medium text-sm">{alert.title}</h5>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                      <span>Risk Score: {alert.riskScore}</span>
                      <span>SPAs: {alert.affectedSPAs.join(', ')}</span>
                      <span>{new Date(alert.detectedAt).toLocaleString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
          
          {/* Cross-SPA Access Stats */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Cross-SPA Access</h4>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(accessAnalytics.crossSPAAccess).slice(0, 4).map(([spa, stats]) => (
                <div key={spa} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{spa}</span>
                    <Badge variant="outline" className="text-xs">
                      {stats.activeUsers} users
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stats.totalAccesses} accesses • 
                    Avg session: {Math.round(stats.averageSessionDuration / 60)}min
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Security Insights & Analytics Component
const SecurityInsightsAnalytics: React.FC<{
  securityInsights: SecurityInsight[];
  riskAssessments: RiskAssessment[];
  complianceReport: ComplianceReport;
  onApplyInsight: (insight: SecurityInsight) => void;
  onReviewRisk: (assessment: RiskAssessment) => void;
  onRunSecurityAnalysis: () => void;
  isLoading: boolean;
}> = ({ 
  securityInsights, 
  riskAssessments, 
  complianceReport,
  onApplyInsight, 
  onReviewRisk,
  onRunSecurityAnalysis,
  isLoading 
}) => {
  const highRiskUsers = riskAssessments.filter(r => r.overallRiskScore > 70);
  const criticalViolations = complianceReport.violations.filter(v => v.severity === 'critical');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Security Insights & Analytics
          </CardTitle>
          <Button onClick={onRunSecurityAnalysis} size="sm" disabled={isLoading}>
            <Sparkles className="h-4 w-4 mr-2" />
            Run Analysis
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="insights">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="insights">
              Insights ({securityInsights.length})
            </TabsTrigger>
            <TabsTrigger value="risks">
              Risk ({highRiskUsers.length})
            </TabsTrigger>
            <TabsTrigger value="compliance">
              Compliance ({complianceReport.overallComplianceScore}%)
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="insights" className="space-y-4">
            {securityInsights.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No security insights available</p>
                <Button variant="outline" className="mt-4" onClick={onRunSecurityAnalysis}>
                  Run Security Analysis
                </Button>
              </div>
            ) : (
              securityInsights.map((insight) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{insight.type}</Badge>
                        <Badge variant={
                          insight.riskLevel === 'critical' ? 'destructive' :
                          insight.riskLevel === 'high' ? 'default' : 'secondary'
                        } className="text-xs">
                          {insight.riskLevel} risk
                        </Badge>
                        <Badge variant={insight.confidence > 80 ? 'default' : 'secondary'} className="text-xs">
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Affects {insight.affectedUsers.length} users • 
                    Detected: {new Date(insight.detectedAt).toLocaleDateString()}
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Recommended Actions:</p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      {insight.recommendedActions.slice(0, 2).map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={() => onApplyInsight(insight)}
                    >
                      Apply Insight
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="risks" className="space-y-4">
            {highRiskUsers.map((assessment) => (
              <motion.div
                key={assessment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{assessment.userName}</span>
                      <Badge variant={
                        assessment.overallRiskScore > 90 ? 'destructive' :
                        assessment.overallRiskScore > 70 ? 'default' : 'secondary'
                      } className="text-xs">
                        Risk Score: {assessment.overallRiskScore}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {assessment.riskFactors.slice(0, 2).map((factor, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {factor.description} (Score: {factor.score})
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => onReviewRisk(assessment)}
                  >
                    Review Risk
                  </Button>
                </div>
              </motion.div>
            ))}
          </TabsContent>
          
          <TabsContent value="compliance" className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">Overall Compliance</span>
                <Badge variant={
                  complianceReport.overallComplianceScore > 90 ? 'default' :
                  complianceReport.overallComplianceScore > 70 ? 'secondary' : 'destructive'
                }>
                  {complianceReport.overallComplianceScore}%
                </Badge>
              </div>
              <Progress value={complianceReport.overallComplianceScore} className="h-2" />
            </div>
            
            {criticalViolations.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-medium text-sm">Critical Violations</h5>
                {criticalViolations.map((violation) => (
                  <div key={violation.id} className="p-3 border rounded-lg bg-red-50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{violation.framework} - {violation.control}</span>
                      <Badge variant="destructive" className="text-xs">Critical</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{violation.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Affects {violation.affectedUsers.length} users
                    </p>
                  </div>
                ))}
              </div>
            )}
            
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Framework Compliance</h5>
              {complianceReport.frameworks.map((framework) => (
                <div key={framework.framework} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{framework.framework} v{framework.version}</span>
                    <Badge variant={
                      framework.status === 'compliant' ? 'default' :
                      framework.status === 'partial' ? 'secondary' : 'destructive'
                    } className="text-xs">
                      {framework.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Score: {framework.score}%</span>
                    <span>Controls: {framework.controlsCompliant}/{framework.controlsTotal}</span>
                  </div>
                  <Progress value={framework.score} className="h-1" />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Cross-SPA Policy Enforcement Component
const CrossSPAPolicyEnforcement: React.FC<{
  integrations: EnhancedRBACState['crossSPAIntegrations'];
  policyEnforcement: CrossSPAPolicyEnforcement[];
  policyViolations: PolicyViolation[];
  accessControlPolicies: AccessControlPolicy[];
  onToggleIntegration: (spa: string, enabled: boolean) => void;
  onEnforcePolicy: (policyId: UUID, spa: string) => void;
  onCreatePolicy: () => void;
  onReviewViolation: (violation: PolicyViolation) => void;
}> = ({ 
  integrations, 
  policyEnforcement, 
  policyViolations,
  accessControlPolicies,
  onToggleIntegration, 
  onEnforcePolicy,
  onCreatePolicy,
  onReviewViolation 
}) => {
  const spaConfigs = [
    { key: 'dataSources', name: 'Data Sources', icon: Database },
    { key: 'scanRuleSets', name: 'Scan Rule Sets', icon: Shield },
    { key: 'classifications', name: 'Classifications', icon: Tag },
    { key: 'compliance', name: 'Compliance', icon: CheckCircle },
    { key: 'catalog', name: 'Catalog', icon: Database },
    { key: 'scanLogic', name: 'Scan Logic', icon: Search }
  ];

  const recentViolations = policyViolations.slice(0, 5);
  const activePolicies = accessControlPolicies.filter(p => p.status === 'active');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Cross-SPA Policy Enforcement
          </CardTitle>
          <Button onClick={onCreatePolicy} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Policy
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* SPA Integration Status */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">SPA Integration Status</h4>
            {spaConfigs.map(({ key, name, icon: Icon }) => {
              const integration = integrations[key as keyof typeof integrations];
              const enforcement = policyEnforcement.find(p => p.targetSPA === key);
              
              return (
                <div key={key} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <div>
                        <p className="font-medium">{name}</p>
                        <p className="text-xs text-muted-foreground">
                          Status: {integration.status}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {enforcement && (
                        <Badge variant={
                          enforcement.status === 'enforced' ? 'default' :
                          enforcement.status === 'failed' ? 'destructive' : 'secondary'
                        } className="text-xs">
                          {enforcement.status}
                        </Badge>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleIntegration(key, integration.status !== 'connected')}
                      >
                        {integration.status === 'connected' ? (
                          <Unlink className="h-4 w-4" />
                        ) : (
                          <Link className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {enforcement && integration.status === 'connected' && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Policies enforced: {enforcement.violations} violations detected • 
                      Last check: {new Date(enforcement.lastCheck).toLocaleString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Active Policies */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Active Policies ({activePolicies.length})</h4>
            <div className="space-y-2">
              {activePolicies.slice(0, 3).map((policy) => (
                <div key={policy.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{policy.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{policy.type}</Badge>
                      <Badge variant={policy.scope === 'global' ? 'default' : 'secondary'} className="text-xs">
                        {policy.scope}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{policy.description}</p>
                  <div className="text-xs text-muted-foreground mt-1">
                    SPAs: {policy.targetSPAs.join(', ')} • Rules: {policy.rules.length} • 
                    Priority: {policy.priority}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recent Violations */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Recent Policy Violations ({recentViolations.length})</h4>
            {recentViolations.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent policy violations</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentViolations.map((violation) => (
                  <div 
                    key={violation.id} 
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                    onClick={() => onReviewViolation(violation)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{violation.userName}</span>
                        <Badge variant={
                          violation.severity === 'critical' ? 'destructive' :
                          violation.severity === 'high' ? 'default' : 'secondary'
                        } className="text-xs">
                          {violation.severity}
                        </Badge>
                        <Badge variant="outline" className="text-xs">{violation.violationType}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(violation.detectedAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{violation.details}</p>
                    <div className="text-xs text-muted-foreground mt-1">
                      Policy: {violation.policyName} • SPA: {violation.spa}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Component Props
interface RBACSystemSPAOrchestratorProps {
  workspaceId?: UUID;
  userId: UUID;
  userRole: string; // Required for admin check
  initialView?: 'dashboard' | 'insights' | 'enforcement';
  enableAI?: boolean;
  enableCollaboration?: boolean;
  enableCrossSPA?: boolean;
  onStateChange?: (state: EnhancedRBACState) => void;
  onError?: (error: Error) => void;
  onUnauthorized?: () => void;
}

// Main RBACSystemSPAOrchestrator Component
export const RBACSystemSPAOrchestrator: React.FC<RBACSystemSPAOrchestratorProps> = ({
  workspaceId,
  userId,
  userRole,
  initialView = 'dashboard',
  enableAI = true,
  enableCollaboration = true,
  enableCrossSPA = true,
  onStateChange,
  onError,
  onUnauthorized
}) => {
  // Admin Access Check
  const isAdmin = useMemo(() => {
    return ['admin', 'super_admin', 'system_admin'].includes(userRole.toLowerCase());
  }, [userRole]);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      onUnauthorized?.();
      return;
    }
  }, [isAdmin, onUnauthorized]);

  // Enhanced State Management
  const [enhancedState, setEnhancedState] = useState<EnhancedRBACState>({
    originalSPAState: null,
    orchestrationEnabled: true,
    crossSPAIntegrations: {
      dataSources: { status: 'connected', lastSync: new Date().toISOString(), error: null },
      scanRuleSets: { status: 'connected', lastSync: new Date().toISOString(), error: null },
      classifications: { status: 'connected', lastSync: new Date().toISOString(), error: null },
      compliance: { status: 'connected', lastSync: new Date().toISOString(), error: null },
      catalog: { status: 'connected', lastSync: new Date().toISOString(), error: null },
      scanLogic: { status: 'connected', lastSync: new Date().toISOString(), error: null }
    },
    accessControlPolicies: [],
    activePermissions: [],
    roleHierarchy: [],
    securityAlerts: [],
    accessAnalytics: {
      totalUsers: 0,
      activeUsers: 0,
      totalRoles: 0,
      activeRoles: 0,
      totalPermissions: 0,
      accessRequests: { pending: 0, approved: 0, denied: 0, total: 0 },
      crossSPAAccess: {},
      lastCalculated: new Date().toISOString()
    },
    securityMetrics: {
      overallSecurityScore: 95,
      policyCompliance: 92,
      accessRiskScore: 15,
      authenticationSuccessRate: 99.5,
      privilegedAccessUsage: 12,
      securityTrends: [],
      vulnerabilityMetrics: [],
      lastAssessment: new Date().toISOString()
    },
    complianceReport: {
      overallComplianceScore: 94,
      frameworks: [],
      violations: [],
      recommendations: [],
      lastGenerated: new Date().toISOString()
    },
    auditTrail: [],
    aiRecommendations: [],
    securityInsights: [],
    riskAssessments: [],
    identityProviders: [],
    userSessions: [],
    accessRequests: [],
    crossSPAPolicyEnforcement: [],
    policyViolations: [],
    enterpriseIntegrations: [],
    ssoConfigurations: [],
    workspaceContext: null,
    orchestrationErrors: [],
    lastSyncTime: null
  });

  const [activeView, setActiveView] = useState(initialView);
  const [showEnhancements, setShowEnhancements] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Refs for integration
  const originalSPARef = useRef<any>(null);

  // Custom Hooks (following same pattern)
  const {
    crossGroupState,
    integrateWithSPA,
    isLoading: crossGroupLoading
  } = useCrossGroupIntegration(workspaceId);

  const {
    orchestrationState,
    isLoading: orchestrationLoading
  } = useRacineOrchestration(userId, {
    isInitialized: true,
    currentView: 'rbac',
    activeWorkspaceId: workspaceId || '',
    layoutMode: 'single-pane',
    sidebarCollapsed: false,
    loading: isLoading,
    error: null,
    systemHealth: {
      status: 'healthy',
      services: {},
      lastCheck: new Date().toISOString(),
      uptime: 0,
      version: '1.0.0'
    },
    lastActivity: new Date(),
    performanceMetrics: {
      memoryUsage: 0,
      cpuUsage: 0,
      responseTime: 0,
      activeConnections: 0,
      lastUpdate: new Date().toISOString()
    }
  });

  const {
    recommendations,
    insights,
    generateRecommendations,
    isLoading: aiLoading
  } = useAIAssistant(userId, enhancedState.originalSPAState);

  const {
    currentWorkspace,
    isLoading: workspaceLoading
  } = useWorkspaceManagement(workspaceId);

  const {
    collaborationState,
    isLoading: collaborationLoading
  } = useCollaboration(userId, workspaceId);

  const {
    isLoading: activityLoading
  } = useActivityTracker(userId, 'rbac');

  // Computed values
  const totalLoading = isLoading || crossGroupLoading || orchestrationLoading || aiLoading || workspaceLoading || collaborationLoading || activityLoading;

  // Handler functions
  const handleRunSecurityAnalysis = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Running security analysis...');
    } catch (error) {
      console.error('Failed to run security analysis:', error);
      onError?.(error instanceof Error ? error : new Error('Failed to run security analysis'));
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  // Early return if not admin
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <Lock className="h-16 w-16 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">Administrator privileges required to access RBAC System.</p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <TooltipProvider>
      <div className="rbac-spa-orchestrator h-screen flex flex-col">
        {/* Enhanced Header */}
        <div className="border-b bg-background/95 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Lock className="h-6 w-6" />
                RBAC System
                <Crown className="h-5 w-5 text-amber-500" title="Admin Only" />
              </h1>
              
              {currentWorkspace && (
                <Badge variant="outline">
                  Workspace: {currentWorkspace.name}
                </Badge>
              )}
              
              {enhancedState.orchestrationEnabled && (
                <Badge variant="default" className="flex items-center gap-1">
                  <Network className="h-3 w-3" />
                  Enhanced
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Tabs value={activeView} onValueChange={setActiveView}>
                <TabsList>
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                  <TabsTrigger value="enforcement">Enforcement</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEnhancements(!showEnhancements)}
              >
                {showEnhancements ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showEnhancements ? 'Hide' : 'Show'} Enhancements
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          {/* Main SPA Content */}
          <div className="flex-1 overflow-hidden">
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto" />
                  <p>Loading RBAC System...</p>
                </div>
              </div>
            }>
              <RBACManager
                ref={originalSPARef}
                workspaceId={workspaceId}
                userId={userId}
                enhancedMode={enhancedState.orchestrationEnabled}
                onStateChange={(state) => setEnhancedState(prev => ({ ...prev, originalSPAState: state }))}
              />
            </Suspense>
          </div>
          
          {/* Enhanced Features Sidebar */}
          <AnimatePresence>
            {showEnhancements && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 400, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="border-l bg-muted/20 overflow-hidden"
              >
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-6">
                    {/* Loading Indicator */}
                    {totalLoading && (
                      <Alert>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <AlertTitle>Processing</AlertTitle>
                        <AlertDescription>
                          Updating enhanced features...
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Access Control Dashboard */}
                    <AccessControlDashboard
                      accessAnalytics={enhancedState.accessAnalytics}
                      securityMetrics={enhancedState.securityMetrics}
                      securityAlerts={enhancedState.securityAlerts}
                      onAcknowledgeAlert={(alertId) => console.log('Acknowledge alert:', alertId)}
                      onReviewAccess={() => console.log('Review access')}
                      onGenerateReport={() => console.log('Generate report')}
                      isLoading={isLoading}
                    />
                    
                    {/* Security Insights & Analytics */}
                    {enableAI && (
                      <SecurityInsightsAnalytics
                        securityInsights={enhancedState.securityInsights}
                        riskAssessments={enhancedState.riskAssessments}
                        complianceReport={enhancedState.complianceReport}
                        onApplyInsight={(insight) => console.log('Apply insight:', insight)}
                        onReviewRisk={(assessment) => console.log('Review risk:', assessment)}
                        onRunSecurityAnalysis={handleRunSecurityAnalysis}
                        isLoading={aiLoading}
                      />
                    )}
                    
                    {/* Cross-SPA Policy Enforcement */}
                    {enableCrossSPA && (
                      <CrossSPAPolicyEnforcement
                        integrations={enhancedState.crossSPAIntegrations}
                        policyEnforcement={enhancedState.crossSPAPolicyEnforcement}
                        policyViolations={enhancedState.policyViolations}
                        accessControlPolicies={enhancedState.accessControlPolicies}
                        onToggleIntegration={(spa, enabled) => console.log('Toggle integration:', spa, enabled)}
                        onEnforcePolicy={(policyId, spa) => console.log('Enforce policy:', policyId, spa)}
                        onCreatePolicy={() => console.log('Create policy')}
                        onReviewViolation={(violation) => console.log('Review violation:', violation)}
                      />
                    )}
                  </div>
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default RBACSystemSPAOrchestrator;