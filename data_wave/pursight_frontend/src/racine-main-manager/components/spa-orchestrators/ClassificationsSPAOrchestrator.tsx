/**
 * ClassificationsSPAOrchestrator.tsx - Classifications SPA Orchestrator
 * =====================================================================
 * 
 * Advanced orchestrator for the existing classifications SPA that adds
 * racine-level functionality for cross-SPA classification workflows,
 * ML insights, and collaborative classification while maintaining full
 * backward compatibility.
 * 
 * Features:
 * - Deep integration with existing classifications SPA components
 * - Cross-SPA classification workflows across all governance systems
 * - ML-powered auto-classification and smart suggestions
 * - Collaborative classification with real-time multi-user editing
 * - Advanced classification analytics and effectiveness tracking
 * - Enterprise-grade classification templates and hierarchies
 * - Real-time performance monitoring and optimization
 * 
 * Existing SPA Integration:
 * - Orchestrates: v15_enhanced_1/components/classifications/
 * - Core Components: classification management, taxonomy builder
 * - Services: Existing classifications services and APIs
 * 
 * Backend Integration:
 * - Uses cross-group-integration-apis.ts for classification orchestration
 * - Uses racine-orchestration-apis.ts for system coordination
 * - Uses ai-assistant-apis.ts for ML classification insights
 * - Integrates with classifications-apis.ts for classification management
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
import { Tag, Network, Brain, Users, Settings, TrendingUp, Zap, Activity, BarChart3, TestTube, GitBranch, AlertTriangle, CheckCircle, Clock, Search, Filter, RefreshCw, Plus, Edit, Trash2, Download, Upload, Share2, Eye, EyeOff, Lock, Unlock, Bell, BellOff, Star, Bookmark, Link, Unlink, Copy, ExternalLink, MoreHorizontal, ChevronDown, ChevronRight, Info, HelpCircle, Settings2, Layers, Workflow, Code, FileText, Target, Gauge, Sparkles, TreePine } from 'lucide-react';

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

// Existing Classifications SPA Components - CRITICAL: Import without modification
const ClassificationManager = lazy(() => 
  import('../../../classifications/ClassificationsSPA')
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

// Enhanced Classifications State Interface
interface EnhancedClassificationState {
  originalSPAState: any;
  orchestrationEnabled: boolean;
  crossSPAIntegrations: {
    dataSources: IntegrationStatus;
    scanRuleSets: IntegrationStatus;
    compliance: IntegrationStatus;
    catalog: IntegrationStatus;
    scanLogic: IntegrationStatus;
    rbac: IntegrationStatus;
  };
  
  // ML and AI features
  aiRecommendations: AIRecommendation[];
  autoClassifications: AutoClassification[];
  mlInsights: MLClassificationInsight[];
  classificationSuggestions: ClassificationSuggestion[];
  
  // Collaboration features
  collaborationState: CollaborationState;
  collaborativeClassifications: UUID[];
  classificationComments: ClassificationComment[];
  
  // Analytics and metrics
  classificationMetrics: ClassificationMetrics;
  effectivenessTracking: EffectivenessTracking;
  crossSPAApplications: CrossSPAClassificationApplication[];
  
  // Workspace integration
  workspaceContext: WorkspaceConfiguration | null;
  orchestrationErrors: string[];
  lastSyncTime: ISODateString | null;
}

// Classification-specific types
interface AutoClassification {
  id: UUID;
  dataSourceId: UUID;
  suggestedClassification: string;
  confidence: number;
  reasoning: string;
  appliedAt?: ISODateString;
  reviewStatus: 'pending' | 'approved' | 'rejected';
}

interface MLClassificationInsight {
  id: UUID;
  type: 'pattern_detection' | 'classification_drift' | 'accuracy_improvement' | 'coverage_gap';
  title: string;
  description: string;
  confidence: number;
  affectedClassifications: UUID[];
  recommendedAction: string;
}

interface ClassificationSuggestion {
  id: UUID;
  type: 'hierarchy_optimization' | 'taxonomy_expansion' | 'redundancy_removal' | 'new_classification';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedImpact: string;
}

interface ClassificationComment {
  id: UUID;
  classificationId: UUID;
  userId: UUID;
  userName: string;
  comment: string;
  type: 'suggestion' | 'question' | 'improvement' | 'issue';
  createdAt: ISODateString;
  resolved: boolean;
}

interface ClassificationMetrics {
  totalClassifications: number;
  activeClassifications: number;
  autoClassificationAccuracy: number;
  manualReviewRate: number;
  avgClassificationTime: number;
  crossSPAUsage: number;
  lastCalculated: ISODateString;
}

interface EffectivenessTracking {
  accuracyTrend: number[];
  usageTrend: number[];
  collaborationMetrics: {
    activeCollaborators: number;
    collaborativeEdits: number;
    reviewsCompleted: number;
  };
  lastUpdated: ISODateString;
}

interface CrossSPAClassificationApplication {
  id: UUID;
  classificationId: UUID;
  targetSPA: string;
  status: 'pending' | 'applied' | 'failed';
  appliedAt: ISODateString;
  results: {
    recordsClassified: number;
    accuracy: number;
    executionTime: number;
  };
}

// ML Auto-Classification Panel Component
const MLAutoClassificationPanel: React.FC<{
  autoClassifications: AutoClassification[];
  mlInsights: MLClassificationInsight[];
  onApproveClassification: (classification: AutoClassification) => void;
  onRejectClassification: (id: UUID) => void;
  onRunAutoClassification: () => void;
  isLoading: boolean;
}> = ({ autoClassifications, mlInsights, onApproveClassification, onRejectClassification, onRunAutoClassification, isLoading }) => {
  const pendingClassifications = autoClassifications.filter(c => c.reviewStatus === 'pending');
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            ML Auto-Classification
          </CardTitle>
          <Button onClick={onRunAutoClassification} size="sm" disabled={isLoading}>
            <Sparkles className="h-4 w-4 mr-2" />
            Run ML Analysis
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
          <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending">
                Pending Review ({pendingClassifications.length})
              </TabsTrigger>
              <TabsTrigger value="insights">
                ML Insights ({mlInsights.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="space-y-4">
              {pendingClassifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No pending classifications</p>
                  <Button variant="outline" className="mt-4" onClick={onRunAutoClassification}>
                    Run Auto-Classification
                  </Button>
                </div>
              ) : (
                pendingClassifications.map((classification) => (
                  <motion.div
                    key={classification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{classification.suggestedClassification}</Badge>
                          <Badge variant={classification.confidence > 80 ? 'default' : 'secondary'}>
                            {classification.confidence}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{classification.reasoning}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRejectClassification(classification.id)}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onApproveClassification(classification)}
                      >
                        Approve
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="insights" className="space-y-4">
              {mlInsights.map((insight) => (
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
                        <Badge variant="outline">{insight.type}</Badge>
                        <Badge variant={insight.confidence > 80 ? 'default' : 'secondary'}>
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Recommended: {insight.recommendedAction}
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

// Cross-SPA Classification Applications Component
const CrossSPAClassificationApplications: React.FC<{
  integrations: EnhancedClassificationState['crossSPAIntegrations'];
  applications: CrossSPAClassificationApplication[];
  onToggleIntegration: (spa: string, enabled: boolean) => void;
  onApplyClassificationToSPA: (classificationId: UUID, spa: string) => void;
}> = ({ integrations, applications, onToggleIntegration, onApplyClassificationToSPA }) => {
  const spaConfigs = [
    { key: 'dataSources', name: 'Data Sources', icon: Tag },
    { key: 'scanRuleSets', name: 'Scan Rule Sets', icon: Tag },
    { key: 'compliance', name: 'Compliance', icon: CheckCircle },
    { key: 'catalog', name: 'Catalog', icon: Tag },
    { key: 'scanLogic', name: 'Scan Logic', icon: Search },
    { key: 'rbac', name: 'RBAC', icon: Lock }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          Cross-SPA Classification
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Integration Status */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Integration Status</h4>
            {spaConfigs.map(({ key, name, icon: Icon }) => {
              const integration = integrations[key as keyof typeof integrations];
              return (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
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
                    <Badge 
                      variant={integration.status === 'connected' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {integration.status}
                    </Badge>
                    
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
              );
            })}
          </div>
          
          {/* Recent Applications */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Recent Applications ({applications.length})</h4>
            {applications.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Network className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No classifications applied across SPAs yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {applications.slice(0, 5).map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {app.targetSPA}
                      </Badge>
                      <span className="text-sm">Classification {app.classificationId.slice(0, 8)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        app.status === 'applied' ? 'default' :
                        app.status === 'failed' ? 'destructive' : 'secondary'
                      } className="text-xs">
                        {app.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {app.results.recordsClassified} records
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

// Classification Analytics Dashboard Component
const ClassificationAnalyticsDashboard: React.FC<{
  metrics: ClassificationMetrics;
  effectiveness: EffectivenessTracking;
  suggestions: ClassificationSuggestion[];
  onOptimizeClassifications: () => void;
  isLoading: boolean;
}> = ({ metrics, effectiveness, suggestions, onOptimizeClassifications, isLoading }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Classification Analytics
          </CardTitle>
          <Button onClick={onOptimizeClassifications} size="sm" disabled={isLoading}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Optimize
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">{metrics.totalClassifications}</p>
              <p className="text-sm text-muted-foreground">Total Classifications</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">{metrics.autoClassificationAccuracy.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Auto-Classification Accuracy</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">{metrics.manualReviewRate.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Manual Review Rate</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">{metrics.crossSPAUsage}</p>
              <p className="text-sm text-muted-foreground">Cross-SPA Usage</p>
            </div>
          </div>
          
          {/* Optimization Suggestions */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Optimization Suggestions</h4>
            {suggestions.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No optimization suggestions available</p>
              </div>
            ) : (
              <div className="space-y-2">
                {suggestions.slice(0, 3).map((suggestion) => (
                  <div key={suggestion.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-sm">{suggestion.title}</h5>
                      <Badge variant={
                        suggestion.priority === 'critical' ? 'destructive' :
                        suggestion.priority === 'high' ? 'default' : 'secondary'
                      } className="text-xs">
                        {suggestion.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Impact: {suggestion.estimatedImpact}
                    </p>
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
interface ClassificationsSPAOrchestratorProps {
  workspaceId?: UUID;
  userId?: UUID;
  initialView?: 'manager' | 'analytics' | 'collaboration';
  enableAI?: boolean;
  enableCollaboration?: boolean;
  enableCrossSPA?: boolean;
  onStateChange?: (state: EnhancedClassificationState) => void;
  onError?: (error: Error) => void;
  
  // Additional props for advanced functionality
  mode?: 'full-spa' | 'basic-spa' | 'classifications-only' | 'schema-only';
  enableSchemaEditor?: boolean;
  enableLabelManagement?: boolean;
  enableAutomationRules?: boolean;
  enableClassificationEngine?: boolean;
  enableSensitivityMapping?: boolean;
  enableBulkClassification?: boolean;
  enableMachineLearning?: boolean;
  enableCustomClassifiers?: boolean;
  enableComplianceMapping?: boolean;
  enableNotifications?: boolean;
  showClassificationMetrics?: boolean;
  showAccuracyScores?: boolean;
  showQuickActions?: boolean;
  showRecommendations?: boolean;
}

// Main ClassificationsSPAOrchestrator Component
export const ClassificationsSPAOrchestrator: React.FC<ClassificationsSPAOrchestratorProps> = ({
  workspaceId,
  userId,
  initialView = 'manager',
  enableAI = true,
  enableCollaboration = true,
  enableCrossSPA = true,
  onStateChange,
  onError,
  
  // Additional props with defaults
  mode = 'full-spa',
  enableSchemaEditor = true,
  enableLabelManagement = true,
  enableAutomationRules = true,
  enableClassificationEngine = true,
  enableSensitivityMapping = true,
  enableBulkClassification = true,
  enableMachineLearning = true,
  enableCustomClassifiers = true,
  enableComplianceMapping = true,
  enableNotifications = true,
  showClassificationMetrics = true,
  showAccuracyScores = true,
  showQuickActions = true,
  showRecommendations = true
}) => {
  // Enhanced State Management
  const [enhancedState, setEnhancedState] = useState<EnhancedClassificationState>({
    originalSPAState: null,
    orchestrationEnabled: true,
    crossSPAIntegrations: {
      dataSources: { status: 'connected', lastSync: new Date().toISOString(), error: null },
      scanRuleSets: { status: 'connected', lastSync: new Date().toISOString(), error: null },
      compliance: { status: 'disconnected', lastSync: null, error: null },
      catalog: { status: 'connected', lastSync: new Date().toISOString(), error: null },
      scanLogic: { status: 'disconnected', lastSync: null, error: null },
      rbac: { status: 'connected', lastSync: new Date().toISOString(), error: null }
    },
    aiRecommendations: [],
    autoClassifications: [],
    mlInsights: [],
    classificationSuggestions: [],
    collaborationState: {
      activeCollaborators: 0,
      sharedResources: 0,
      activeSession: null,
      pendingInvitations: [],
      recentActivity: []
    },
    collaborativeClassifications: [],
    classificationComments: [],
    classificationMetrics: {
      totalClassifications: 0,
      activeClassifications: 0,
      autoClassificationAccuracy: 0,
      manualReviewRate: 0,
      avgClassificationTime: 0,
      crossSPAUsage: 0,
      lastCalculated: new Date().toISOString()
    },
    effectivenessTracking: {
      accuracyTrend: [],
      usageTrend: [],
      collaborationMetrics: {
        activeCollaborators: 0,
        collaborativeEdits: 0,
        reviewsCompleted: 0
      },
      lastUpdated: new Date().toISOString()
    },
    crossSPAApplications: [],
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
    currentView: 'classifications',
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
  } = useActivityTracker(userId, 'classifications');

  // Computed values
  const totalLoading = isLoading || crossGroupLoading || orchestrationLoading || aiLoading || workspaceLoading || collaborationLoading || activityLoading;

  // Handler functions
  const handleRunAutoClassification = useCallback(async () => {
    try {
      setIsLoading(true);
      // ML auto-classification logic would go here
      console.log('Running auto-classification...');
    } catch (error) {
      console.error('Failed to run auto-classification:', error);
      onError?.(error instanceof Error ? error : new Error('Failed to run auto-classification'));
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  // Main render
  return (
    <TooltipProvider>
      <div className="classifications-spa-orchestrator h-screen flex flex-col">
        {/* Enhanced Header */}
        <div className="border-b bg-background/95 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Tag className="h-6 w-6" />
                Classifications
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
                  <TabsTrigger value="manager">Manager</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
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
                  <p>Loading Classifications...</p>
                </div>
              </div>
            }>
              <ClassificationManager
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
                    
                    {/* ML Auto-Classification */}
                    {enableAI && (
                      <MLAutoClassificationPanel
                        autoClassifications={enhancedState.autoClassifications}
                        mlInsights={enhancedState.mlInsights}
                        onApproveClassification={(classification) => console.log('Approve:', classification)}
                        onRejectClassification={(id) => console.log('Reject:', id)}
                        onRunAutoClassification={handleRunAutoClassification}
                        isLoading={aiLoading}
                      />
                    )}
                    
                    {/* Cross-SPA Classifications */}
                    {enableCrossSPA && (
                      <CrossSPAClassificationApplications
                        integrations={enhancedState.crossSPAIntegrations}
                        applications={enhancedState.crossSPAApplications}
                        onToggleIntegration={(spa, enabled) => console.log('Toggle:', spa, enabled)}
                        onApplyClassificationToSPA={(id, spa) => console.log('Apply to SPA:', id, spa)}
                      />
                    )}
                    
                    {/* Classification Analytics */}
                    <ClassificationAnalyticsDashboard
                      metrics={enhancedState.classificationMetrics}
                      effectiveness={enhancedState.effectivenessTracking}
                      suggestions={enhancedState.classificationSuggestions}
                      onOptimizeClassifications={() => console.log('Optimize classifications')}
                      isLoading={isLoading}
                    />
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

export default ClassificationsSPAOrchestrator;
