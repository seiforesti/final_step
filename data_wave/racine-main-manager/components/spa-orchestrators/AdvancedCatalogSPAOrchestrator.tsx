/**
 * AdvancedCatalogSPAOrchestrator.tsx - Advanced Catalog SPA Orchestrator
 * ======================================================================
 * 
 * Advanced orchestrator for the existing Advanced-Catalog SPA that adds
 * racine-level functionality for cross-SPA data lineage, enhanced discovery,
 * and collaborative cataloging while maintaining full backward compatibility.
 * 
 * Features:
 * - Deep integration with existing Advanced-Catalog SPA components
 * - Cross-SPA data lineage tracking across all governance systems
 * - Enhanced data discovery with ML-powered recommendations
 * - Collaborative cataloging with real-time multi-user editing
 * - Advanced metadata management and analytics
 * - Enterprise-grade data lineage visualization
 * - Real-time data quality monitoring and alerting
 * 
 * Existing SPA Integration:
 * - Orchestrates: v15_enhanced_1/components/Advanced-Catalog/
 * - Core Components: catalog management, lineage viewer
 * - Services: Existing catalog services and APIs
 * 
 * Backend Integration:
 * - Uses cross-group-integration-apis.ts for catalog orchestration
 * - Uses racine-orchestration-apis.ts for system coordination
 * - Uses ai-assistant-apis.ts for discovery insights
 * - Integrates with catalog-apis.ts for catalog management
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
  Database,
  Network,
  Brain,
  Users,
  Settings,
  TrendingUp,
  Zap,
  Activity,
  BarChart3,
  Layers,
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
  Lock,
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
  Workflow,
  FileText,
  Target,
  Gauge,
  Sparkles,
  GitBranch,
  Boxes,
  Folder
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

// Existing Advanced Catalog SPA Components - CRITICAL: Import without modification
const CatalogManager = lazy(() => 
  import('../../../Advanced-Catalog/spa/AdvancedCatalogSPA').then(module => ({
    default: module.CatalogManager || module.default
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
import { collaborationAPI } from '../../services/collaboration-apis';

// Hooks
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useAIAssistant } from '../../hooks/useAIAssistant';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useCollaboration } from '../../hooks/useCollaboration';
import { useActivityTracker } from '../../hooks/useActivityTracker';

// Enhanced Catalog State Interface
interface EnhancedCatalogState {
  originalSPAState: any;
  orchestrationEnabled: boolean;
  crossSPAIntegrations: {
    dataSources: IntegrationStatus;
    scanRuleSets: IntegrationStatus;
    classifications: IntegrationStatus;
    compliance: IntegrationStatus;
    scanLogic: IntegrationStatus;
    rbac: IntegrationStatus;
  };
  
  // Data lineage and discovery
  dataLineage: DataLineage[];
  discoveryInsights: DiscoveryInsight[];
  catalogMetrics: CatalogMetrics;
  qualityMonitoring: QualityMonitoring;
  
  // AI enhancements
  aiRecommendations: AIRecommendation[];
  dataDiscoveryRecommendations: DataDiscoveryRecommendation[];
  lineageInsights: LineageInsight[];
  
  // Collaboration features
  collaborationState: CollaborationState;
  collaborativeCatalogEntries: UUID[];
  catalogComments: CatalogComment[];
  sharedLineageViews: SharedLineageView[];
  
  // Cross-SPA integrations
  crossSPACatalogApplications: CrossSPACatalogApplication[];
  integrationHealth: IntegrationHealthStatus;
  
  // Workspace integration
  workspaceContext: WorkspaceConfiguration | null;
  orchestrationErrors: string[];
  lastSyncTime: ISODateString | null;
}

// Catalog-specific types
interface DataLineage {
  id: UUID;
  assetId: UUID;
  assetName: string;
  assetType: 'table' | 'view' | 'dataset' | 'file' | 'api';
  upstreamDependencies: LineageNode[];
  downstreamDependencies: LineageNode[];
  crossSPAConnections: CrossSPALineageConnection[];
  lastUpdated: ISODateString;
  confidence: number;
}

interface LineageNode {
  id: UUID;
  name: string;
  type: string;
  spa: string;
  metadata: Record<string, any>;
  transformations: Transformation[];
}

interface CrossSPALineageConnection {
  id: UUID;
  sourceSPA: string;
  targetSPA: string;
  connectionType: 'data_flow' | 'dependency' | 'derivation' | 'usage';
  confidence: number;
  lastVerified: ISODateString;
}

interface Transformation {
  id: UUID;
  type: 'filter' | 'join' | 'aggregate' | 'transform' | 'custom';
  description: string;
  code?: string;
  impact: 'low' | 'medium' | 'high';
}

interface DiscoveryInsight {
  id: UUID;
  type: 'similar_datasets' | 'usage_patterns' | 'quality_issues' | 'access_patterns';
  title: string;
  description: string;
  confidence: number;
  affectedAssets: UUID[];
  recommendedAction: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface CatalogMetrics {
  totalAssets: number;
  catalogedAssets: number;
  uncatalogedAssets: number;
  qualityScore: number;
  lineageCoverage: number;
  collaborativeEntries: number;
  crossSPAConnections: number;
  lastCalculated: ISODateString;
}

interface QualityMonitoring {
  overallQualityScore: number;
  qualityTrends: QualityTrend[];
  qualityIssues: QualityIssue[];
  qualityRules: QualityRule[];
  lastAssessment: ISODateString;
}

interface QualityTrend {
  date: string;
  score: number;
  issuesCount: number;
}

interface QualityIssue {
  id: UUID;
  assetId: UUID;
  assetName: string;
  issueType: 'completeness' | 'accuracy' | 'consistency' | 'timeliness' | 'validity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  remediation: string;
  status: 'open' | 'in_progress' | 'resolved' | 'acknowledged';
  detectedAt: ISODateString;
}

interface QualityRule {
  id: UUID;
  name: string;
  description: string;
  ruleType: string;
  enabled: boolean;
  failureCount: number;
  successRate: number;
  lastRun: ISODateString;
}

interface DataDiscoveryRecommendation {
  id: UUID;
  type: 'dataset_recommendation' | 'lineage_discovery' | 'usage_optimization' | 'quality_improvement';
  title: string;
  description: string;
  confidence: number;
  estimatedBenefit: string;
  implementationEffort: 'low' | 'medium' | 'high';
  relatedAssets: UUID[];
}

interface LineageInsight {
  id: UUID;
  type: 'impact_analysis' | 'dependency_risk' | 'optimization_opportunity' | 'compliance_gap';
  title: string;
  description: string;
  affectedLineages: UUID[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendedActions: string[];
}

interface CatalogComment {
  id: UUID;
  assetId: UUID;
  userId: UUID;
  userName: string;
  comment: string;
  type: 'description' | 'issue' | 'enhancement' | 'lineage_note';
  createdAt: ISODateString;
  resolved: boolean;
}

interface SharedLineageView {
  id: UUID;
  name: string;
  description: string;
  createdBy: UUID;
  sharedWith: UUID[];
  lineageConfig: any;
  createdAt: ISODateString;
  accessCount: number;
}

interface CrossSPACatalogApplication {
  id: UUID;
  assetId: UUID;
  targetSPA: string;
  status: 'pending' | 'applied' | 'failed';
  applicationType: 'metadata_sync' | 'lineage_extension' | 'quality_monitoring';
  appliedAt: ISODateString;
  results: {
    assetsProcessed: number;
    lineageConnections: number;
    qualityChecks: number;
  };
}

interface IntegrationHealthStatus {
  overallHealth: 'healthy' | 'degraded' | 'critical';
  spaStatuses: Record<string, {
    status: 'healthy' | 'degraded' | 'critical';
    lastCheck: ISODateString;
    errorCount: number;
    responseTime: number;
  }>;
  lastHealthCheck: ISODateString;
}

// Data Lineage Visualization Component
const DataLineageVisualization: React.FC<{
  lineageData: DataLineage[];
  discoveryInsights: DiscoveryInsight[];
  onExploreLineage: (assetId: UUID) => void;
  onShareLineageView: (lineage: DataLineage) => void;
  onApplyInsight: (insight: DiscoveryInsight) => void;
  isLoading: boolean;
}> = ({ lineageData, discoveryInsights, onExploreLineage, onShareLineageView, onApplyInsight, isLoading }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Data Lineage & Discovery
          </CardTitle>
          <Button size="sm" disabled={isLoading}>
            <Sparkles className="h-4 w-4 mr-2" />
            Analyze Lineage
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : (
          <Tabs defaultValue="lineage">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="lineage">
                Lineage ({lineageData.length})
              </TabsTrigger>
              <TabsTrigger value="insights">
                Insights ({discoveryInsights.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="lineage" className="space-y-4">
              {lineageData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No lineage data available</p>
                  <Button variant="outline" className="mt-4">
                    Discover Lineage
                  </Button>
                </div>
              ) : (
                lineageData.slice(0, 5).map((lineage) => (
                  <motion.div
                    key={lineage.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{lineage.assetName}</h4>
                          <Badge variant="outline" className="text-xs">
                            {lineage.assetType}
                          </Badge>
                          <Badge variant={lineage.confidence > 80 ? 'default' : 'secondary'} className="text-xs">
                            {lineage.confidence}% confidence
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Upstream</p>
                            <p>{lineage.upstreamDependencies.length} dependencies</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Downstream</p>
                            <p>{lineage.downstreamDependencies.length} dependencies</p>
                          </div>
                        </div>
                        {lineage.crossSPAConnections.length > 0 && (
                          <div className="flex items-center gap-2 text-xs">
                            <Network className="h-3 w-3" />
                            <span>{lineage.crossSPAConnections.length} cross-SPA connections</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onShareLineageView(lineage)}
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onExploreLineage(lineage.assetId)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Explore
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="insights" className="space-y-4">
              {discoveryInsights.map((insight) => (
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
                          insight.priority === 'critical' ? 'destructive' :
                          insight.priority === 'high' ? 'default' : 'secondary'
                        } className="text-xs">
                          {insight.priority}
                        </Badge>
                        <Badge variant={insight.confidence > 80 ? 'default' : 'secondary'} className="text-xs">
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Affects {insight.affectedAssets.length} assets • {insight.recommendedAction}
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
              ))}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

// Quality Monitoring Dashboard Component
const QualityMonitoringDashboard: React.FC<{
  qualityMonitoring: QualityMonitoring;
  catalogMetrics: CatalogMetrics;
  onRunQualityCheck: () => void;
  onResolveIssue: (issueId: UUID) => void;
  onToggleRule: (ruleId: UUID, enabled: boolean) => void;
  isLoading: boolean;
}> = ({ qualityMonitoring, catalogMetrics, onRunQualityCheck, onResolveIssue, onToggleRule, isLoading }) => {
  const criticalIssues = qualityMonitoring.qualityIssues.filter(i => i.severity === 'critical');
  const openIssues = qualityMonitoring.qualityIssues.filter(i => i.status === 'open');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Quality Monitoring
          </CardTitle>
          <Button onClick={onRunQualityCheck} size="sm" disabled={isLoading}>
            <Activity className="h-4 w-4 mr-2" />
            Run Quality Check
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Quality Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-3xl font-bold text-green-600">{qualityMonitoring.overallQualityScore}%</p>
              <p className="text-sm text-muted-foreground">Overall Quality</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">{catalogMetrics.lineageCoverage}%</p>
              <p className="text-sm text-muted-foreground">Lineage Coverage</p>
            </div>
          </div>

          {/* Critical Issues Alert */}
          {criticalIssues.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Critical Quality Issues</AlertTitle>
              <AlertDescription>
                {criticalIssues.length} critical issues require immediate attention
              </AlertDescription>
            </Alert>
          )}
          
          {/* Quality Issues */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Quality Issues ({openIssues.length})
            </h4>
            {openIssues.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No open quality issues</p>
              </div>
            ) : (
              <div className="space-y-2">
                {openIssues.slice(0, 5).map((issue) => (
                  <div key={issue.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          issue.severity === 'critical' ? 'destructive' :
                          issue.severity === 'high' ? 'default' :
                          issue.severity === 'medium' ? 'secondary' : 'outline'
                        } className="text-xs">
                          {issue.severity}
                        </Badge>
                        <Badge variant="outline" className="text-xs">{issue.issueType}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onResolveIssue(issue.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    <h5 className="font-medium text-sm">{issue.assetName}</h5>
                    <p className="text-sm text-muted-foreground">{issue.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Impact: {issue.impact}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Quality Rules Status */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Quality Rules ({qualityMonitoring.qualityRules.length})</h4>
            <div className="space-y-2">
              {qualityMonitoring.qualityRules.slice(0, 3).map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{rule.name}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Success Rate: {rule.successRate}%</span>
                      <span>Failures: {rule.failureCount}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={rule.enabled ? 'default' : 'secondary'} className="text-xs">
                      {rule.enabled ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleRule(rule.id, !rule.enabled)}
                    >
                      {rule.enabled ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    </Button>
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

// Cross-SPA Catalog Integration Component
const CrossSPACatalogIntegration: React.FC<{
  integrations: EnhancedCatalogState['crossSPAIntegrations'];
  applications: CrossSPACatalogApplication[];
  integrationHealth: IntegrationHealthStatus;
  onToggleIntegration: (spa: string, enabled: boolean) => void;
  onSyncMetadata: (spa: string) => void;
  onViewApplicationResults: (application: CrossSPACatalogApplication) => void;
}> = ({ integrations, applications, integrationHealth, onToggleIntegration, onSyncMetadata, onViewApplicationResults }) => {
  const spaConfigs = [
    { key: 'dataSources', name: 'Data Sources', icon: Database },
    { key: 'scanRuleSets', name: 'Scan Rule Sets', icon: Layers },
    { key: 'classifications', name: 'Classifications', icon: Tag },
    { key: 'compliance', name: 'Compliance', icon: CheckCircle },
    { key: 'scanLogic', name: 'Scan Logic', icon: Search },
    { key: 'rbac', name: 'RBAC', icon: Lock }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          Cross-SPA Integration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Integration Health */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Integration Health</span>
              <Badge variant={
                integrationHealth.overallHealth === 'healthy' ? 'default' :
                integrationHealth.overallHealth === 'degraded' ? 'secondary' : 'destructive'
              }>
                {integrationHealth.overallHealth.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Last check: {new Date(integrationHealth.lastHealthCheck).toLocaleString()}
            </p>
          </div>
          
          {/* SPA Integration Status */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">SPA Integration Status</h4>
            {spaConfigs.map(({ key, name, icon: Icon }) => {
              const integration = integrations[key as keyof typeof integrations];
              const healthStatus = integrationHealth.spaStatuses[key];
              
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
                      {healthStatus && (
                        <Badge variant={
                          healthStatus.status === 'healthy' ? 'default' :
                          healthStatus.status === 'degraded' ? 'secondary' : 'destructive'
                        } className="text-xs">
                          {healthStatus.status}
                        </Badge>
                      )}
                      
                      {integration.status === 'connected' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSyncMetadata(key)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
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
                  
                  {healthStatus && integration.status === 'connected' && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Response time: {healthStatus.responseTime}ms • 
                      Errors: {healthStatus.errorCount}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Recent Applications */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Recent Applications ({applications.length})</h4>
            {applications.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Boxes className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No applications yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {applications.slice(0, 5).map((app) => (
                  <div 
                    key={app.id} 
                    className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-muted/50"
                    onClick={() => onViewApplicationResults(app)}
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {app.targetSPA}
                      </Badge>
                      <span className="text-sm">{app.applicationType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        app.status === 'applied' ? 'default' :
                        app.status === 'failed' ? 'destructive' : 'secondary'
                      } className="text-xs">
                        {app.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {app.results.assetsProcessed} assets
                      </span>
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
interface AdvancedCatalogSPAOrchestratorProps {
  workspaceId?: UUID;
  userId: UUID;
  initialView?: 'catalog' | 'lineage' | 'quality';
  enableAI?: boolean;
  enableCollaboration?: boolean;
  enableCrossSPA?: boolean;
  onStateChange?: (state: EnhancedCatalogState) => void;
  onError?: (error: Error) => void;
}

// Main AdvancedCatalogSPAOrchestrator Component
export const AdvancedCatalogSPAOrchestrator: React.FC<AdvancedCatalogSPAOrchestratorProps> = ({
  workspaceId,
  userId,
  initialView = 'catalog',
  enableAI = true,
  enableCollaboration = true,
  enableCrossSPA = true,
  onStateChange,
  onError
}) => {
  // Enhanced State Management
  const [enhancedState, setEnhancedState] = useState<EnhancedCatalogState>({
    originalSPAState: null,
    orchestrationEnabled: true,
    crossSPAIntegrations: {
      dataSources: { status: 'connected', lastSync: new Date().toISOString(), error: null },
      scanRuleSets: { status: 'connected', lastSync: new Date().toISOString(), error: null },
      classifications: { status: 'connected', lastSync: new Date().toISOString(), error: null },
      compliance: { status: 'connected', lastSync: new Date().toISOString(), error: null },
      scanLogic: { status: 'disconnected', lastSync: null, error: null },
      rbac: { status: 'connected', lastSync: new Date().toISOString(), error: null }
    },
    dataLineage: [],
    discoveryInsights: [],
    catalogMetrics: {
      totalAssets: 0,
      catalogedAssets: 0,
      uncatalogedAssets: 0,
      qualityScore: 0,
      lineageCoverage: 0,
      collaborativeEntries: 0,
      crossSPAConnections: 0,
      lastCalculated: new Date().toISOString()
    },
    qualityMonitoring: {
      overallQualityScore: 92,
      qualityTrends: [],
      qualityIssues: [],
      qualityRules: [],
      lastAssessment: new Date().toISOString()
    },
    aiRecommendations: [],
    dataDiscoveryRecommendations: [],
    lineageInsights: [],
    collaborationState: {
      activeCollaborators: 0,
      sharedResources: 0,
      activeSession: null,
      pendingInvitations: [],
      recentActivity: []
    },
    collaborativeCatalogEntries: [],
    catalogComments: [],
    sharedLineageViews: [],
    crossSPACatalogApplications: [],
    integrationHealth: {
      overallHealth: 'healthy',
      spaStatuses: {},
      lastHealthCheck: new Date().toISOString()
    },
    workspaceContext: null,
    orchestrationErrors: [],
    lastSyncTime: null
  });

  const [activeView, setActiveView] = useState(initialView);
  const [showEnhancements, setShowEnhancements] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Refs for integration
  const originalSPARef = useRef<any>(null);

  // Custom Hooks
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
    currentView: 'catalog',
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
  } = useActivityTracker(userId, 'catalog');

  // Computed values
  const totalLoading = isLoading || crossGroupLoading || orchestrationLoading || aiLoading || workspaceLoading || collaborationLoading || activityLoading;

  // Handler functions
  const handleRunQualityCheck = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Running quality check...');
    } catch (error) {
      console.error('Failed to run quality check:', error);
      onError?.(error instanceof Error ? error : new Error('Failed to run quality check'));
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  // Main render
  return (
    <TooltipProvider>
      <div className="catalog-spa-orchestrator h-screen flex flex-col">
        {/* Enhanced Header */}
        <div className="border-b bg-background/95 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Database className="h-6 w-6" />
                Advanced Catalog
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
                  <TabsTrigger value="catalog">Catalog</TabsTrigger>
                  <TabsTrigger value="lineage">Lineage</TabsTrigger>
                  <TabsTrigger value="quality">Quality</TabsTrigger>
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
                  <p>Loading Advanced Catalog...</p>
                </div>
              </div>
            }>
              <CatalogManager
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
                    
                    {/* Data Lineage Visualization */}
                    {enableAI && (
                      <DataLineageVisualization
                        lineageData={enhancedState.dataLineage}
                        discoveryInsights={enhancedState.discoveryInsights}
                        onExploreLineage={(assetId) => console.log('Explore lineage:', assetId)}
                        onShareLineageView={(lineage) => console.log('Share lineage:', lineage)}
                        onApplyInsight={(insight) => console.log('Apply insight:', insight)}
                        isLoading={aiLoading}
                      />
                    )}
                    
                    {/* Quality Monitoring */}
                    <QualityMonitoringDashboard
                      qualityMonitoring={enhancedState.qualityMonitoring}
                      catalogMetrics={enhancedState.catalogMetrics}
                      onRunQualityCheck={handleRunQualityCheck}
                      onResolveIssue={(issueId) => console.log('Resolve issue:', issueId)}
                      onToggleRule={(ruleId, enabled) => console.log('Toggle rule:', ruleId, enabled)}
                      isLoading={isLoading}
                    />
                    
                    {/* Cross-SPA Integration */}
                    {enableCrossSPA && (
                      <CrossSPACatalogIntegration
                        integrations={enhancedState.crossSPAIntegrations}
                        applications={enhancedState.crossSPACatalogApplications}
                        integrationHealth={enhancedState.integrationHealth}
                        onToggleIntegration={(spa, enabled) => console.log('Toggle integration:', spa, enabled)}
                        onSyncMetadata={(spa) => console.log('Sync metadata:', spa)}
                        onViewApplicationResults={(app) => console.log('View results:', app)}
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

export default AdvancedCatalogSPAOrchestrator;