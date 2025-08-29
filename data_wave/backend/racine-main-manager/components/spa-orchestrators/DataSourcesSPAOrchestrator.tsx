/**
 * DataSourcesSPAOrchestrator.tsx - Data Sources SPA Orchestrator
 * ==============================================================
 * 
 * Advanced orchestrator for the existing Data Sources SPA that adds racine-level
 * functionality without modifying the original SPA. This component provides
 * enhanced orchestration, cross-SPA integration, AI-powered insights, and
 * collaborative features while maintaining full backward compatibility.
 * 
 * Features:
 * - Deep integration with existing data-sources SPA components
 * - Cross-SPA workflow orchestration with other governance systems
 * - AI-powered data source recommendations and optimization
 * - Enhanced collaboration features for team data governance
 * - Advanced analytics and insights aggregation
 * - Real-time synchronization across workspaces
 * - Enterprise-grade security and access control
 * 
 * Existing SPA Integration:
 * - Orchestrates: v15_enhanced_1/components/data-sources/
 * - Main Component: enhanced-data-sources-app.tsx (113KB)
 * - Core Components: data-source-catalog.tsx, data-source-grid.tsx, etc.
 * - Services: Existing data sources services and APIs
 * 
 * Backend Integration:
 * - Uses cross-group-integration-apis.ts for orchestration
 * - Uses racine-orchestration-apis.ts for system coordination
 * - Uses ai-assistant-apis.ts for AI recommendations
 * - Integrates with workspace-management-apis.ts
 * 
 * Dependencies:
 * - Types: DataSourceState, CrossGroupState, WorkspaceConfiguration
 * - Services: All existing data sources APIs + racine enhancement APIs
 * - Hooks: useCrossGroupIntegration, useRacineOrchestration
 * - Utils: cross-group-orchestrator, ai-integration-utils
 */

'use client';

import React, { 
  useState, 
  useEffect, 
  useCallback, 
  useMemo, 
  useRef,
  Suspense,
  ComponentType,
  lazy
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Network, Settings, TrendingUp, Users, Shield, Zap, Activity, BarChart3, GitBranch, AlertTriangle, CheckCircle, Clock, Search, Filter, RefreshCw, Plus, Edit, Trash2, Download, Upload, Share2, Eye, EyeOff, Lock, Unlock, Bell, BellOff, Star, Bookmark, Tag, Link, Unlink, Copy, ExternalLink, MoreHorizontal, ChevronDown, ChevronRight, Info, HelpCircle, Settings2, Layers, Workflow } from 'lucide-react';

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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
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

// Existing Data Sources SPA Components - CRITICAL: Import without modification
const EnhancedDataSourcesApp = lazy(() => 
  import('../../../data-sources/enhanced-data-sources-app').then(module => ({
    default: module.EnhancedDataSourcesApp || module.default
  }))
);

const DataSourceCatalog = lazy(() => 
  import('../../../data-sources/data-source-catalog').then(module => ({
    default: module.DataSourceCatalog || module.default
  }))
);

const DataSourceGrid = lazy(() => 
  import('../../../data-sources/data-source-grid').then(module => ({
    default: module.DataSourceGrid || module.default
  }))
);

const DataSourceMonitoringDashboard = lazy(() => 
  import('../../../data-sources/data-source-monitoring-dashboard').then(module => ({
    default: module.DataSourceMonitoringDashboard || module.default
  }))
);

const DataSourceAnalytics = lazy(() => 
  import('../../../data-sources/data-source-growth-analytics').then(module => ({
    default: module.default
  }))
);

// Core Types
import {
  UUID,
  ISODateString,
  CrossGroupState,
  WorkspaceConfiguration,
  WorkspaceState,
  UserContext,
  SystemHealth,
  PerformanceMetrics,
  OrchestrationState,
  IntegrationStatus,
  SynchronizationStatus,
  AIRecommendation,
  AIInsight,
  CollaborationState,
  ActivityRecord
} from '../../types/racine-core.types';

// API Types
import {
  APIResponse,
  DataSourceOrchestrationRequest,
  DataSourceOrchestrationResponse,
  CrossSPAWorkflowRequest,
  CrossSPAWorkflowResponse,
  AIRecommendationRequest,
  AIRecommendationResponse,
  CollaborationRequest,
  CollaborationResponse
} from '../../types/api.types';

// Services
import { crossGroupIntegrationAPI } from '../../services/cross-group-integration-apis';
import { racineOrchestrationAPI } from '../../services/racine-orchestration-apis';
import { aiAssistantAPI } from '../../services/ai-assistant-apis';
import { workspaceManagementAPI } from '../../services/workspace-management-apis';
import { collaborationAPI } from '../../services/collaboration-apis';
import { activityTrackingAPI } from '../../services/activity-tracking-apis';

// Hooks
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useAIAssistant } from '../../hooks/useAIAssistant';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useCollaboration } from '../../hooks/useCollaboration';
import { useActivityTracker } from '../../hooks/useActivityTracker';

// Utils
import { crossGroupOrchestrator } from '../../utils/cross-group-orchestrator';
import { aiIntegrationUtils } from '../../utils/ai-integration-utils';
import { collaborationUtils } from '../../utils/collaboration-utils';
import { performanceUtils } from '../../utils/performance-utils';

// Constants
import {
  SUPPORTED_GROUPS,
  CROSS_GROUP_WORKFLOWS,
  AI_RECOMMENDATION_TYPES,
  COLLABORATION_FEATURES
} from '../../constants/cross-group-configs';

// Enhanced Data Source State Interface
interface EnhancedDataSourceState {
  // Original SPA state
  originalSPAState: any;
  
  // Racine enhancements
  orchestrationEnabled: boolean;
  crossSPAIntegrations: {
    scanRuleSets: IntegrationStatus;
    classifications: IntegrationStatus;
    compliance: IntegrationStatus;
    catalog: IntegrationStatus;
    scanLogic: IntegrationStatus;
    rbac: IntegrationStatus;
  };
  
  // AI enhancements
  aiRecommendations: AIRecommendation[];
  aiInsights: AIInsight[];
  aiOptimizationEnabled: boolean;
  
  // Collaboration features
  collaborationState: CollaborationState;
  sharedDataSources: UUID[];
  teamWorkspaces: UUID[];
  
  // Analytics and monitoring
  performanceMetrics: PerformanceMetrics;
  crossSPAActivities: ActivityRecord[];
  
  // Workspace integration
  workspaceContext: WorkspaceConfiguration | null;
  workspaceSyncStatus: SynchronizationStatus;
  
  // Error handling
  orchestrationErrors: string[];
  lastSyncTime: ISODateString | null;
}

// Cross-SPA Workflow Types for Data Sources
interface DataSourceWorkflow {
  id: UUID;
  name: string;
  description: string;
  targetSPAs: string[];
  steps: DataSourceWorkflowStep[];
  status: 'draft' | 'active' | 'paused' | 'completed' | 'failed';
  createdAt: ISODateString;
  updatedAt: ISODateString;
  createdBy: UUID;
}

interface DataSourceWorkflowStep {
  id: UUID;
  type: 'data-source-action' | 'cross-spa-action' | 'ai-analysis' | 'collaboration';
  spa: string;
  action: string;
  parameters: Record<string, any>;
  dependencies: UUID[];
  status: 'pending' | 'running' | 'completed' | 'failed';
}

// AI Recommendations Panel Component
const AIRecommendationsPanel: React.FC<{
  recommendations: AIRecommendation[];
  onApplyRecommendation: (recommendation: AIRecommendation) => void;
  onDismissRecommendation: (id: UUID) => void;
  isLoading: boolean;
}> = ({ recommendations, onApplyRecommendation, onDismissRecommendation, isLoading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          AI Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No recommendations available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                  </div>
                  <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                    {rec.priority}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    Impact: {rec.impact}%
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDismissRecommendation(rec.id)}
                    >
                      Dismiss
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onApplyRecommendation(rec)}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Cross-SPA Integration Status Component
const CrossSPAIntegrationStatus: React.FC<{
  integrations: EnhancedDataSourceState['crossSPAIntegrations'];
  onToggleIntegration: (spa: string, enabled: boolean) => void;
  onConfigureIntegration: (spa: string) => void;
}> = ({ integrations, onToggleIntegration, onConfigureIntegration }) => {
  const spaConfigs = [
    { key: 'scanRuleSets', name: 'Scan Rule Sets', icon: Shield },
    { key: 'classifications', name: 'Classifications', icon: Tag },
    { key: 'compliance', name: 'Compliance', icon: CheckCircle },
    { key: 'catalog', name: 'Catalog', icon: Database },
    { key: 'scanLogic', name: 'Scan Logic', icon: Search },
    { key: 'rbac', name: 'RBAC', icon: Lock }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          Cross-SPA Integrations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
                  
                  {integration.status === 'connected' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onConfigureIntegration(key)}
                    >
                      <Settings className="h-4 w-4" />
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
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Workflow Builder Component
const DataSourceWorkflowBuilder: React.FC<{
  workflows: DataSourceWorkflow[];
  onCreateWorkflow: () => void;
  onEditWorkflow: (workflow: DataSourceWorkflow) => void;
  onDeleteWorkflow: (id: UUID) => void;
  onExecuteWorkflow: (id: UUID) => void;
  isLoading: boolean;
}> = ({ workflows, onCreateWorkflow, onEditWorkflow, onDeleteWorkflow, onExecuteWorkflow, isLoading }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Cross-SPA Workflows
          </CardTitle>
          <Button onClick={onCreateWorkflow} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : workflows.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Workflow className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No workflows created yet</p>
            <Button variant="outline" className="mt-4" onClick={onCreateWorkflow}>
              Create Your First Workflow
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {workflows.map((workflow) => (
              <motion.div
                key={workflow.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="border rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">{workflow.name}</h4>
                    <p className="text-sm text-muted-foreground">{workflow.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>SPAs: {workflow.targetSPAs.join(', ')}</span>
                      <span>Steps: {workflow.steps.length}</span>
                      <span>Created: {new Date(workflow.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      workflow.status === 'active' ? 'default' :
                      workflow.status === 'completed' ? 'secondary' :
                      workflow.status === 'failed' ? 'destructive' : 'outline'
                    }>
                      {workflow.status}
                    </Badge>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onExecuteWorkflow(workflow.id)}>
                          <Activity className="h-4 w-4 mr-2" />
                          Execute
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditWorkflow(workflow)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDeleteWorkflow(workflow.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Collaboration Panel Component
const CollaborationPanel: React.FC<{
  collaborationState: CollaborationState;
  onInviteUser: (email: string, role: string) => void;
  onShareDataSource: (dataSourceId: UUID, userIds: UUID[]) => void;
  onStartCollaboration: (type: string) => void;
}> = ({ collaborationState, onInviteUser, onShareDataSource, onStartCollaboration }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Collaboration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">{collaborationState.activeCollaborators}</p>
              <p className="text-sm text-muted-foreground">Active Collaborators</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">{collaborationState.sharedResources}</p>
              <p className="text-sm text-muted-foreground">Shared Resources</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => onStartCollaboration('data-discovery')}
            >
              <Search className="h-4 w-4 mr-2" />
              Collaborative Data Discovery
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => onStartCollaboration('quality-review')}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Quality Review Session
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => onStartCollaboration('governance-planning')}
            >
              <Shield className="h-4 w-4 mr-2" />
              Governance Planning
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Component Props
interface DataSourcesSPAOrchestratorProps {
  workspaceId?: UUID;
  userId: UUID;
  initialView?: 'catalog' | 'grid' | 'monitoring' | 'analytics';
  enableAI?: boolean;
  enableCollaboration?: boolean;
  enableCrossSPA?: boolean;
  onStateChange?: (state: EnhancedDataSourceState) => void;
  onError?: (error: Error) => void;
}

// Main DataSourcesSPAOrchestrator Component
export const DataSourcesSPAOrchestrator: React.FC<DataSourcesSPAOrchestratorProps> = ({
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
  const [enhancedState, setEnhancedState] = useState<EnhancedDataSourceState>({
    originalSPAState: null,
    orchestrationEnabled: true,
    crossSPAIntegrations: {
      scanRuleSets: { status: 'disconnected', lastSync: null, error: null },
      classifications: { status: 'disconnected', lastSync: null, error: null },
      compliance: { status: 'disconnected', lastSync: null, error: null },
      catalog: { status: 'disconnected', lastSync: null, error: null },
      scanLogic: { status: 'disconnected', lastSync: null, error: null },
      rbac: { status: 'connected', lastSync: new Date().toISOString(), error: null }
    },
    aiRecommendations: [],
    aiInsights: [],
    aiOptimizationEnabled: enableAI,
    collaborationState: {
      activeCollaborators: 0,
      sharedResources: 0,
      activeSession: null,
      pendingInvitations: [],
      recentActivity: []
    },
    sharedDataSources: [],
    teamWorkspaces: [],
    performanceMetrics: {
      memoryUsage: 0,
      cpuUsage: 0,
      responseTime: 0,
      activeConnections: 0,
      lastUpdate: new Date().toISOString()
    },
    crossSPAActivities: [],
    workspaceContext: null,
    workspaceSyncStatus: 'synchronized',
    orchestrationErrors: [],
    lastSyncTime: null
  });

  const [activeView, setActiveView] = useState(initialView);
  const [workflows, setWorkflows] = useState<DataSourceWorkflow[]>([]);
  const [showEnhancements, setShowEnhancements] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Refs for integration
  const originalSPARef = useRef<any>(null);

  // Custom Hooks
  const {
    crossGroupState,
    integrateWithSPA,
    orchestrateWorkflow,
    getIntegrationStatus,
    isLoading: crossGroupLoading
  } = useCrossGroupIntegration(workspaceId);

  const {
    orchestrationState,
    coordinateServices,
    monitorHealth,
    isLoading: orchestrationLoading
  } = useRacineOrchestration(userId, {
    isInitialized: true,
    currentView: 'data-sources',
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
    performanceMetrics: enhancedState.performanceMetrics
  });

  const {
    recommendations,
    insights,
    generateRecommendations,
    analyzeDataSources,
    isLoading: aiLoading
  } = useAIAssistant(userId, enhancedState.originalSPAState);

  const {
    workspaceState,
    currentWorkspace,
    isLoading: workspaceLoading
  } = useWorkspaceManagement(workspaceId);

  const {
    collaborationState,
    startCollaboration,
    inviteCollaborator,
    shareResource,
    isLoading: collaborationLoading
  } = useCollaboration(userId, workspaceId);

  const {
    activities,
    trackActivity,
    isLoading: activityLoading
  } = useActivityTracker(userId, 'data-sources');

  // Integration Management
  const handleToggleIntegration = useCallback(async (spa: string, enabled: boolean) => {
    try {
      setIsLoading(true);
      
      if (enabled) {
        const integrationResult = await integrateWithSPA('data-sources', spa, {
          workspaceId,
          userId,
          permissions: ['read', 'write'],
          syncBidirectional: true
        });
        
        setEnhancedState(prev => ({
          ...prev,
          crossSPAIntegrations: {
            ...prev.crossSPAIntegrations,
            [spa]: {
              status: 'connected',
              lastSync: new Date().toISOString(),
              error: null
            }
          }
        }));
        
        // Track integration activity
        await trackActivity({
          type: 'integration',
          action: 'spa_connected',
          target: spa,
          metadata: { integrationId: integrationResult.id }
        });
        
      } else {
        // Disconnect integration
        setEnhancedState(prev => ({
          ...prev,
          crossSPAIntegrations: {
            ...prev.crossSPAIntegrations,
            [spa]: {
              status: 'disconnected',
              lastSync: null,
              error: null
            }
          }
        }));
      }
    } catch (error) {
      console.error('Failed to toggle integration:', error);
      setEnhancedState(prev => ({
        ...prev,
        orchestrationErrors: [...prev.orchestrationErrors, `Failed to ${enabled ? 'connect' : 'disconnect'} ${spa}`]
      }));
      onError?.(error instanceof Error ? error : new Error('Integration failed'));
    } finally {
      setIsLoading(false);
    }
  }, [integrateWithSPA, workspaceId, userId, trackActivity, onError]);

  // AI Recommendations Management
  const handleApplyRecommendation = useCallback(async (recommendation: AIRecommendation) => {
    try {
      setIsLoading(true);
      
      // Apply recommendation through cross-group orchestrator
      const result = await crossGroupOrchestrator.applyRecommendation(recommendation, {
        spa: 'data-sources',
        workspaceId,
        userId
      });
      
      // Update state
      setEnhancedState(prev => ({
        ...prev,
        aiRecommendations: prev.aiRecommendations.filter(r => r.id !== recommendation.id)
      }));
      
      // Track activity
      await trackActivity({
        type: 'ai-action',
        action: 'recommendation_applied',
        target: recommendation.id,
        metadata: { result }
      });
      
    } catch (error) {
      console.error('Failed to apply recommendation:', error);
      onError?.(error instanceof Error ? error : new Error('Failed to apply recommendation'));
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, userId, trackActivity, onError]);

  // Workflow Management
  const handleCreateWorkflow = useCallback(async () => {
    try {
      // Open workflow builder modal
      // This would integrate with the job-workflow-space components
      console.log('Opening workflow builder...');
    } catch (error) {
      console.error('Failed to create workflow:', error);
      onError?.(error instanceof Error ? error : new Error('Failed to create workflow'));
    }
  }, [onError]);

  const handleExecuteWorkflow = useCallback(async (workflowId: UUID) => {
    try {
      setIsLoading(true);
      
      const result = await orchestrateWorkflow(workflowId, {
        sourceSPA: 'data-sources',
        workspaceId,
        userId
      });
      
      // Update workflow status
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId 
          ? { ...w, status: 'active' as const }
          : w
      ));
      
      await trackActivity({
        type: 'workflow',
        action: 'workflow_executed',
        target: workflowId,
        metadata: { result }
      });
      
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId 
          ? { ...w, status: 'failed' as const }
          : w
      ));
      onError?.(error instanceof Error ? error : new Error('Failed to execute workflow'));
    } finally {
      setIsLoading(false);
    }
  }, [orchestrateWorkflow, workspaceId, userId, trackActivity, onError]);

  // Collaboration Management
  const handleStartCollaboration = useCallback(async (type: string) => {
    try {
      const session = await startCollaboration(type, {
        spa: 'data-sources',
        resources: enhancedState.sharedDataSources,
        permissions: ['read', 'comment', 'suggest']
      });
      
      setEnhancedState(prev => ({
        ...prev,
        collaborationState: {
          ...prev.collaborationState,
          activeSession: session
        }
      }));
      
    } catch (error) {
      console.error('Failed to start collaboration:', error);
      onError?.(error instanceof Error ? error : new Error('Failed to start collaboration'));
    }
  }, [startCollaboration, enhancedState.sharedDataSources, onError]);

  // Initialize Enhanced Features
  useEffect(() => {
    const initializeEnhancements = async () => {
      try {
        setIsLoading(true);
        
        // Load workspace context
        if (workspaceId && currentWorkspace) {
          setEnhancedState(prev => ({
            ...prev,
            workspaceContext: currentWorkspace
          }));
        }
        
        // Generate AI recommendations if enabled
        if (enableAI && enhancedState.originalSPAState) {
          const recs = await generateRecommendations('data-sources', {
            workspaceId,
            userId,
            context: enhancedState.originalSPAState
          });
          
          setEnhancedState(prev => ({
            ...prev,
            aiRecommendations: recs
          }));
        }
        
        // Load collaboration state if enabled
        if (enableCollaboration) {
          setEnhancedState(prev => ({
            ...prev,
            collaborationState: collaborationState
          }));
        }
        
        // Load cross-SPA activities
        const crossSPAActivities = await activityTrackingAPI.getCrossSPAActivities({
          spa: 'data-sources',
          workspaceId,
          userId,
          limit: 50
        });
        
        setEnhancedState(prev => ({
          ...prev,
          crossSPAActivities: crossSPAActivities.data || []
        }));
        
      } catch (error) {
        console.error('Failed to initialize enhancements:', error);
        setEnhancedState(prev => ({
          ...prev,
          orchestrationErrors: [...prev.orchestrationErrors, 'Failed to initialize enhancements']
        }));
      } finally {
        setIsLoading(false);
      }
    };

    initializeEnhancements();
  }, [
    workspaceId,
    userId,
    currentWorkspace,
    enableAI,
    enableCollaboration,
    generateRecommendations,
    collaborationState,
    enhancedState.originalSPAState
  ]);

  // State change notification
  useEffect(() => {
    onStateChange?.(enhancedState);
  }, [enhancedState, onStateChange]);

  // Computed values
  const totalLoading = isLoading || crossGroupLoading || orchestrationLoading || aiLoading || workspaceLoading || collaborationLoading || activityLoading;

  // Main render
  return (
    <TooltipProvider>
      <div className="data-sources-spa-orchestrator h-screen flex flex-col">
        {/* Enhanced Header */}
        <div className="border-b bg-background/95 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Database className="h-6 w-6" />
                Data Sources
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
                  <TabsTrigger value="grid">Grid</TabsTrigger>
                  <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                  <p>Loading Data Sources...</p>
                </div>
              </div>
            }>
              {activeView === 'catalog' && (
                <DataSourceCatalog
                  ref={originalSPARef}
                  workspaceId={workspaceId}
                  userId={userId}
                  enhancedMode={enhancedState.orchestrationEnabled}
                  onStateChange={(state) => setEnhancedState(prev => ({ ...prev, originalSPAState: state }))}
                />
              )}
              
              {activeView === 'grid' && (
                <DataSourceGrid
                  ref={originalSPARef}
                  workspaceId={workspaceId}
                  userId={userId}
                  enhancedMode={enhancedState.orchestrationEnabled}
                  onStateChange={(state) => setEnhancedState(prev => ({ ...prev, originalSPAState: state }))}
                />
              )}
              
              {activeView === 'monitoring' && (
                <DataSourceMonitoringDashboard
                  ref={originalSPARef}
                  workspaceId={workspaceId}
                  userId={userId}
                  enhancedMode={enhancedState.orchestrationEnabled}
                  onStateChange={(state) => setEnhancedState(prev => ({ ...prev, originalSPAState: state }))}
                />
              )}
              
              {activeView === 'analytics' && (
                <DataSourceAnalytics
                  ref={originalSPARef}
                  workspaceId={workspaceId}
                  userId={userId}
                  enhancedMode={enhancedState.orchestrationEnabled}
                  onStateChange={(state) => setEnhancedState(prev => ({ ...prev, originalSPAState: state }))}
                />
              )}
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
                    
                    {/* Error Alerts */}
                    {enhancedState.orchestrationErrors.length > 0 && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Enhancement Errors</AlertTitle>
                        <AlertDescription>
                          {enhancedState.orchestrationErrors[0]}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {/* AI Recommendations */}
                    {enableAI && (
                      <AIRecommendationsPanel
                        recommendations={enhancedState.aiRecommendations}
                        onApplyRecommendation={handleApplyRecommendation}
                        onDismissRecommendation={(id) => {
                          setEnhancedState(prev => ({
                            ...prev,
                            aiRecommendations: prev.aiRecommendations.filter(r => r.id !== id)
                          }));
                        }}
                        isLoading={aiLoading}
                      />
                    )}
                    
                    {/* Cross-SPA Integrations */}
                    {enableCrossSPA && (
                      <CrossSPAIntegrationStatus
                        integrations={enhancedState.crossSPAIntegrations}
                        onToggleIntegration={handleToggleIntegration}
                        onConfigureIntegration={(spa) => {
                          console.log('Configure integration:', spa);
                        }}
                      />
                    )}
                    
                    {/* Workflow Builder */}
                    <DataSourceWorkflowBuilder
                      workflows={workflows}
                      onCreateWorkflow={handleCreateWorkflow}
                      onEditWorkflow={(workflow) => {
                        console.log('Edit workflow:', workflow);
                      }}
                      onDeleteWorkflow={(id) => {
                        setWorkflows(prev => prev.filter(w => w.id !== id));
                      }}
                      onExecuteWorkflow={handleExecuteWorkflow}
                      isLoading={isLoading}
                    />
                    
                    {/* Collaboration */}
                    {enableCollaboration && (
                      <CollaborationPanel
                        collaborationState={enhancedState.collaborationState}
                        onInviteUser={(email, role) => {
                          console.log('Invite user:', email, role);
                        }}
                        onShareDataSource={(dataSourceId, userIds) => {
                          console.log('Share data source:', dataSourceId, userIds);
                        }}
                        onStartCollaboration={handleStartCollaboration}
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

export default DataSourcesSPAOrchestrator;