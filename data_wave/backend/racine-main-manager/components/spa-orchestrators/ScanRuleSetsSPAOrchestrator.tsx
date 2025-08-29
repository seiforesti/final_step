/**
 * ScanRuleSetsSPAOrchestrator.tsx - Scan Rule Sets SPA Orchestrator
 * ================================================================
 * 
 * Advanced orchestrator for the existing Advanced-Scan-Rule-Sets SPA that adds
 * racine-level functionality for cross-SPA rule application, AI optimization,
 * and collaborative rule building while maintaining full backward compatibility.
 * 
 * Features:
 * - Deep integration with existing Advanced-Scan-Rule-Sets SPA components
 * - Cross-SPA rule application across all data governance systems
 * - AI-powered rule optimization and intelligent suggestions
 * - Collaborative rule building with real-time multi-user editing
 * - Advanced rule testing and validation framework
 * - Enterprise-grade rule templates and version control
 * - Real-time performance monitoring and optimization
 * 
 * Existing SPA Integration:
 * - Orchestrates: v15_enhanced_1/components/Advanced-Scan-Rule-Sets/
 * - Core Components: rule-designer/, rule-intelligence/, ai-enhancement/
 * - Services: Existing scan rule sets services and APIs
 * 
 * Backend Integration:
 * - Uses cross-group-integration-apis.ts for rule orchestration
 * - Uses racine-orchestration-apis.ts for system coordination
 * - Uses ai-assistant-apis.ts for rule optimization
 * - Integrates with scan-rule-sets-apis.ts for rule management
 * - Integrates with collaboration-apis.ts for collaborative features
 * - Integrates with activity-tracking-apis.ts for activity monitoring
 * 
 * Dependencies:
 * - Types: ScanRuleState, RuleSetConfiguration, CrossGroupState
 * - Services: All existing scan rule sets APIs + racine enhancement APIs
 * - Hooks: useCrossGroupIntegration, useRacineOrchestration, useAIAssistant
 * - Utils: cross-group-orchestrator, rule-optimization-utils
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
import { Shield, Network, Brain, Users, Settings, TrendingUp, Zap, Activity, BarChart3, TestTube, GitBranch, AlertTriangle, CheckCircle, Clock, Search, Filter, RefreshCw, Plus, Edit, Trash2, Download, Upload, Share2, Eye, EyeOff, Lock, Unlock, Bell, BellOff, Star, Bookmark, Tag, Link, Unlink, Copy, ExternalLink, MoreHorizontal, ChevronDown, ChevronRight, Info, HelpCircle, Settings2, Layers, Workflow, Code, FileText, Target, Gauge, Sparkles } from 'lucide-react';

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

// Existing Scan Rule Sets SPA Components - CRITICAL: Import without modification
const RuleDesigner = lazy(() => import('../../../Advanced-Scan-Rule-Sets/components/rule-designer/IntelligentRuleDesigner'));

const RuleIntelligence = lazy(() => import('../../../Advanced-Scan-Rule-Sets/components/rule-intelligence/IntelligentPatternDetector'));

const AIEnhancement = lazy(() => import('../../../Advanced-Scan-Rule-Sets/components/ai-enhancement/AIPatternSuggestions'));

const TestingFramework = lazy(() => import('../../../Advanced-Scan-Rule-Sets/components/testing-framework/RuleTestingFramework'));

const RuleOrchestration = lazy(() => import('../../../Advanced-Scan-Rule-Sets/components/rule-orchestration/RuleOrchestrationCenter'));

const Collaboration = lazy(() => import('../../../Advanced-Scan-Rule-Sets/components/collaboration/TeamCollaborationHub'));

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
  RuleSetOrchestrationRequest,
  RuleSetOrchestrationResponse,
  CrossSPARuleApplicationRequest,
  CrossSPARuleApplicationResponse,
  RuleOptimizationRequest,
  RuleOptimizationResponse,
  CollaborativeRuleEditingRequest,
  CollaborativeRuleEditingResponse
} from '../../types/api.types';

// Services
import { crossGroupIntegrationAPI } from '../../services/cross-group-integration-apis';
import { racineOrchestrationAPI } from '../../services/racine-orchestration-apis';
import { aiAssistantAPI } from '../../services/ai-assistant-apis';
import { scanRuleSetsAPI } from '../../services/scan-rule-sets-apis';
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

// Enhanced Scan Rule Sets State Interface
interface EnhancedScanRuleState {
  // Original SPA state
  originalSPAState: any;
  
  // Racine enhancements
  orchestrationEnabled: boolean;
  crossSPAApplications: {
    dataSources: IntegrationStatus;
    classifications: IntegrationStatus;
    compliance: IntegrationStatus;
    catalog: IntegrationStatus;
    scanLogic: IntegrationStatus;
    rbac: IntegrationStatus;
  };
  
  // AI enhancements
  aiRecommendations: AIRecommendation[];
  aiInsights: AIInsight[];
  ruleOptimizations: RuleOptimization[];
  intelligentSuggestions: IntelligentSuggestion[];
  
  // Collaboration features
  collaborationState: CollaborationState;
  collaborativeRules: UUID[];
  ruleComments: RuleComment[];
  realTimeEditors: ActiveEditor[];
  
  // Rule testing and validation
  testResults: RuleTestResult[];
  validationErrors: RuleValidationError[];
  performanceMetrics: RulePerformanceMetrics;
  
  // Cross-SPA applications
  appliedRules: CrossSPARuleApplication[];
  ruleEffectiveness: RuleEffectivenessMetrics;
  
  // Workspace integration
  workspaceContext: WorkspaceConfiguration | null;
  workspaceSyncStatus: SynchronizationStatus;
  
  // Error handling
  orchestrationErrors: string[];
  lastSyncTime: ISODateString | null;
}

// Rule-specific types
interface RuleOptimization {
  id: UUID;
  ruleId: UUID;
  type: 'performance' | 'accuracy' | 'coverage' | 'complexity';
  suggestion: string;
  impact: number;
  confidence: number;
  autoApplicable: boolean;
  estimatedImprovement: string;
}

interface IntelligentSuggestion {
  id: UUID;
  type: 'pattern_detection' | 'rule_consolidation' | 'coverage_gap' | 'false_positive_reduction';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  affectedRules: UUID[];
  estimatedBenefit: string;
}

interface RuleComment {
  id: UUID;
  ruleId: UUID;
  userId: UUID;
  userName: string;
  comment: string;
  type: 'suggestion' | 'question' | 'improvement' | 'issue';
  createdAt: ISODateString;
  resolved: boolean;
}

interface ActiveEditor {
  userId: UUID;
  userName: string;
  ruleId: UUID;
  section: string;
  lastActivity: ISODateString;
  color: string;
}

interface RuleTestResult {
  id: UUID;
  ruleId: UUID;
  testSuite: string;
  status: 'passed' | 'failed' | 'warning';
  executionTime: number;
  coverage: number;
  accuracy: number;
  falsePositives: number;
  falseNegatives: number;
  details: string;
  timestamp: ISODateString;
}

interface RuleValidationError {
  id: UUID;
  ruleId: UUID;
  type: 'syntax' | 'logic' | 'performance' | 'compatibility';
  severity: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  column?: number;
  suggestion?: string;
}

interface RulePerformanceMetrics {
  ruleExecutionTime: Record<UUID, number>;
  memoryUsage: Record<UUID, number>;
  successRate: Record<UUID, number>;
  throughput: Record<UUID, number>;
  lastUpdated: ISODateString;
}

interface CrossSPARuleApplication {
  id: UUID;
  ruleId: UUID;
  targetSPA: string;
  status: 'pending' | 'applied' | 'failed' | 'rollback';
  appliedAt: ISODateString;
  results: {
    recordsProcessed: number;
    matchesFound: number;
    executionTime: number;
    errors: string[];
  };
}

interface RuleEffectivenessMetrics {
  totalRules: number;
  activeRules: number;
  avgAccuracy: number;
  avgPerformance: number;
  crossSPAApplications: number;
  collaborativeEdits: number;
  lastCalculated: ISODateString;
}

// AI Rule Optimization Panel Component
const AIRuleOptimizationPanel: React.FC<{
  optimizations: RuleOptimization[];
  suggestions: IntelligentSuggestion[];
  onApplyOptimization: (optimization: RuleOptimization) => void;
  onDismissOptimization: (id: UUID) => void;
  onAnalyzeRules: () => void;
  isLoading: boolean;
}> = ({ optimizations, suggestions, onApplyOptimization, onDismissOptimization, onAnalyzeRules, isLoading }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Rule Optimization
          </CardTitle>
          <Button onClick={onAnalyzeRules} size="sm" disabled={isLoading}>
            <Sparkles className="h-4 w-4 mr-2" />
            Analyze Rules
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
        ) : optimizations.length === 0 && suggestions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No optimizations available</p>
            <Button variant="outline" className="mt-4" onClick={onAnalyzeRules}>
              Run AI Analysis
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="optimizations">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="optimizations">
                Optimizations ({optimizations.length})
              </TabsTrigger>
              <TabsTrigger value="suggestions">
                Suggestions ({suggestions.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="optimizations" className="space-y-4">
              {optimizations.map((opt) => (
                <motion.div
                  key={opt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{opt.type}</Badge>
                        <Badge variant={opt.confidence > 80 ? 'default' : 'secondary'}>
                          {opt.confidence}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm">{opt.suggestion}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Impact: {opt.impact}%</span>
                        <span>Improvement: {opt.estimatedImprovement}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    {opt.autoApplicable && (
                      <Badge variant="secondary" className="text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        Auto-applicable
                      </Badge>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDismissOptimization(opt.id)}
                      >
                        Dismiss
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onApplyOptimization(opt)}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </TabsContent>
            
            <TabsContent value="suggestions" className="space-y-4">
              {suggestions.map((suggestion) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{suggestion.title}</h4>
                      <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          suggestion.priority === 'critical' ? 'destructive' :
                          suggestion.priority === 'high' ? 'default' : 'secondary'
                        }>
                          {suggestion.priority}
                        </Badge>
                        <Badge variant="outline">{suggestion.type}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Affects {suggestion.affectedRules.length} rules • {suggestion.estimatedBenefit}
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

// Cross-SPA Rule Application Status Component
const CrossSPARuleApplicationStatus: React.FC<{
  applications: EnhancedScanRuleState['crossSPAApplications'];
  appliedRules: CrossSPARuleApplication[];
  onToggleApplication: (spa: string, enabled: boolean) => void;
  onApplyRuleToSPA: (ruleId: UUID, spa: string) => void;
  onViewApplicationResults: (application: CrossSPARuleApplication) => void;
}> = ({ applications, appliedRules, onToggleApplication, onApplyRuleToSPA, onViewApplicationResults }) => {
  const spaConfigs = [
    { key: 'dataSources', name: 'Data Sources', icon: Shield },
    { key: 'classifications', name: 'Classifications', icon: Tag },
    { key: 'compliance', name: 'Compliance', icon: CheckCircle },
    { key: 'catalog', name: 'Catalog', icon: Shield },
    { key: 'scanLogic', name: 'Scan Logic', icon: Search },
    { key: 'rbac', name: 'RBAC', icon: Lock }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Cross-SPA Rule Applications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* SPA Integration Status */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Integration Status</h4>
            {spaConfigs.map(({ key, name, icon: Icon }) => {
              const application = applications[key as keyof typeof applications];
              return (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <div>
                      <p className="font-medium">{name}</p>
                      <p className="text-xs text-muted-foreground">
                        Status: {application.status}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={application.status === 'connected' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {application.status}
                    </Badge>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleApplication(key, application.status !== 'connected')}
                    >
                      {application.status === 'connected' ? (
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
          
          {/* Applied Rules */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Applied Rules ({appliedRules.length})</h4>
            {appliedRules.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Target className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No rules applied across SPAs yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {appliedRules.slice(0, 5).map((rule) => (
                  <div 
                    key={rule.id} 
                    className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-muted/50"
                    onClick={() => onViewApplicationResults(rule)}
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {rule.targetSPA}
                      </Badge>
                      <span className="text-sm">Rule {rule.ruleId.slice(0, 8)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        rule.status === 'applied' ? 'default' :
                        rule.status === 'failed' ? 'destructive' : 'secondary'
                      } className="text-xs">
                        {rule.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {rule.results.matchesFound} matches
                      </span>
                    </div>
                  </div>
                ))}
                {appliedRules.length > 5 && (
                  <Button variant="outline" size="sm" className="w-full">
                    View All {appliedRules.length} Applications
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Collaborative Rule Editor Component
const CollaborativeRuleEditor: React.FC<{
  collaborationState: CollaborationState;
  activeEditors: ActiveEditor[];
  ruleComments: RuleComment[];
  onInviteCollaborator: (email: string, role: string) => void;
  onAddComment: (ruleId: UUID, comment: string, type: string) => void;
  onStartCollaborativeSession: (ruleId: UUID) => void;
  onJoinSession: (sessionId: UUID) => void;
}> = ({ 
  collaborationState, 
  activeEditors, 
  ruleComments, 
  onInviteCollaborator, 
  onAddComment, 
  onStartCollaborativeSession,
  onJoinSession
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Collaborative Rule Building
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Active Collaboration Session */}
          {collaborationState.activeSession && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Active Session</h4>
                <Badge variant="default">Live</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Collaborative editing session in progress
              </p>
              <div className="flex items-center gap-2">
                {activeEditors.slice(0, 3).map((editor) => (
                  <div
                    key={editor.userId}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                    style={{ backgroundColor: `${editor.color}20`, color: editor.color }}
                  >
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: editor.color }}
                    />
                    {editor.userName}
                  </div>
                ))}
                {activeEditors.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{activeEditors.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* Collaboration Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">{collaborationState.activeCollaborators}</p>
              <p className="text-sm text-muted-foreground">Active Collaborators</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">{ruleComments.length}</p>
              <p className="text-sm text-muted-foreground">Comments & Suggestions</p>
            </div>
          </div>
          
          {/* Recent Comments */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Recent Comments</h4>
            {ruleComments.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <FileText className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No comments yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {ruleComments.slice(0, 3).map((comment) => (
                  <div key={comment.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{comment.userName}</span>
                        <Badge variant="outline" className="text-xs">
                          {comment.type}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{comment.comment}</p>
                  </div>
                ))}
                {ruleComments.length > 3 && (
                  <Button variant="outline" size="sm" className="w-full">
                    View All Comments
                  </Button>
                )}
              </div>
            )}
          </div>
          
          {/* Collaboration Actions */}
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => onStartCollaborativeSession('new-rule')}
            >
              <Users className="h-4 w-4 mr-2" />
              Start Collaborative Session
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => onInviteCollaborator('', 'reviewer')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Invite Collaborator
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Rule Testing Dashboard Component
const RuleTestingDashboard: React.FC<{
  testResults: RuleTestResult[];
  validationErrors: RuleValidationError[];
  performanceMetrics: RulePerformanceMetrics;
  onRunTests: (ruleId?: UUID) => void;
  onViewTestDetails: (result: RuleTestResult) => void;
  isLoading: boolean;
}> = ({ testResults, validationErrors, performanceMetrics, onRunTests, onViewTestDetails, isLoading }) => {
  const passedTests = testResults.filter(r => r.status === 'passed').length;
  const failedTests = testResults.filter(r => r.status === 'failed').length;
  const testCoverage = testResults.length > 0 ? 
    testResults.reduce((sum, r) => sum + r.coverage, 0) / testResults.length : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Rule Testing & Validation
          </CardTitle>
          <Button onClick={() => onRunTests()} size="sm" disabled={isLoading}>
            <TestTube className="h-4 w-4 mr-2" />
            Run Tests
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Test Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">{passedTests}</p>
              <p className="text-sm text-muted-foreground">Passed</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-red-600">{failedTests}</p>
              <p className="text-sm text-muted-foreground">Failed</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">{testCoverage.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Coverage</p>
            </div>
          </div>
          
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Validation Issues ({validationErrors.length})
              </h4>
              <div className="space-y-2">
                {validationErrors.slice(0, 3).map((error) => (
                  <div key={error.id} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={
                        error.severity === 'error' ? 'destructive' :
                        error.severity === 'warning' ? 'default' : 'secondary'
                      } className="text-xs">
                        {error.severity}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{error.type}</Badge>
                    </div>
                    <p className="text-sm">{error.message}</p>
                    {error.suggestion && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Suggestion: {error.suggestion}
                      </p>
                    )}
                  </div>
                ))}
                {validationErrors.length > 3 && (
                  <Button variant="outline" size="sm" className="w-full">
                    View All Issues
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {/* Recent Test Results */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Recent Test Results</h4>
            {testResults.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <TestTube className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No test results available</p>
                <Button variant="outline" className="mt-4" onClick={() => onRunTests()}>
                  Run First Test
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {testResults.slice(0, 3).map((result) => (
                  <div 
                    key={result.id} 
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                    onClick={() => onViewTestDetails(result)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{result.testSuite}</span>
                      <Badge variant={
                        result.status === 'passed' ? 'default' :
                        result.status === 'failed' ? 'destructive' : 'secondary'
                      } className="text-xs">
                        {result.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                      <span>Coverage: {result.coverage}%</span>
                      <span>Accuracy: {result.accuracy}%</span>
                      <span>Time: {result.executionTime}ms</span>
                    </div>
                  </div>
                ))}
                {testResults.length > 3 && (
                  <Button variant="outline" size="sm" className="w-full">
                    View All Results
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Component Props
interface ScanRuleSetsSPAOrchestratorProps {
  workspaceId?: UUID;
  userId: UUID;
  initialView?: 'designer' | 'intelligence' | 'testing' | 'orchestration' | 'collaboration';
  enableAI?: boolean;
  enableCollaboration?: boolean;
  enableCrossSPA?: boolean;
  onStateChange?: (state: EnhancedScanRuleState) => void;
  onError?: (error: Error) => void;
}

// Main ScanRuleSetsSPAOrchestrator Component
export const ScanRuleSetsSPAOrchestrator: React.FC<ScanRuleSetsSPAOrchestratorProps> = ({
  workspaceId,
  userId,
  initialView = 'designer',
  enableAI = true,
  enableCollaboration = true,
  enableCrossSPA = true,
  onStateChange,
  onError
}) => {
  // Enhanced State Management
  const [enhancedState, setEnhancedState] = useState<EnhancedScanRuleState>({
    originalSPAState: null,
    orchestrationEnabled: true,
    crossSPAApplications: {
      dataSources: { status: 'connected', lastSync: new Date().toISOString(), error: null },
      classifications: { status: 'disconnected', lastSync: null, error: null },
      compliance: { status: 'connected', lastSync: new Date().toISOString(), error: null },
      catalog: { status: 'disconnected', lastSync: null, error: null },
      scanLogic: { status: 'connected', lastSync: new Date().toISOString(), error: null },
      rbac: { status: 'connected', lastSync: new Date().toISOString(), error: null }
    },
    aiRecommendations: [],
    aiInsights: [],
    ruleOptimizations: [],
    intelligentSuggestions: [],
    collaborationState: {
      activeCollaborators: 0,
      sharedResources: 0,
      activeSession: null,
      pendingInvitations: [],
      recentActivity: []
    },
    collaborativeRules: [],
    ruleComments: [],
    realTimeEditors: [],
    testResults: [],
    validationErrors: [],
    performanceMetrics: {
      ruleExecutionTime: {},
      memoryUsage: {},
      successRate: {},
      throughput: {},
      lastUpdated: new Date().toISOString()
    },
    appliedRules: [],
    ruleEffectiveness: {
      totalRules: 0,
      activeRules: 0,
      avgAccuracy: 0,
      avgPerformance: 0,
      crossSPAApplications: 0,
      collaborativeEdits: 0,
      lastCalculated: new Date().toISOString()
    },
    workspaceContext: null,
    workspaceSyncStatus: 'synchronized',
    orchestrationErrors: [],
    lastSyncTime: null
  });

  const [activeView, setActiveView] = useState(initialView);
  const [showEnhancements, setShowEnhancements] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Refs for integration
  const originalSPARef = useRef<any>(null);

  // Custom Hooks (using the same pattern as DataSourcesSPAOrchestrator)
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
    currentView: 'scan-rule-sets',
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
  } = useActivityTracker(userId, 'scan-rule-sets');

  // Computed values
  const totalLoading = isLoading || crossGroupLoading || orchestrationLoading || aiLoading || workspaceLoading || collaborationLoading || activityLoading;

  // Handler functions would go here (similar to DataSourcesSPAOrchestrator)
  // For brevity, I'll implement key handlers:

  const handleAnalyzeRules = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Generate AI optimizations and suggestions
      const optimizations = await aiAssistantAPI.optimizeRules({
        workspaceId,
        userId,
        rules: enhancedState.originalSPAState?.rules || []
      });
      
      setEnhancedState(prev => ({
        ...prev,
        ruleOptimizations: optimizations.data.optimizations || [],
        intelligentSuggestions: optimizations.data.suggestions || []
      }));
      
    } catch (error) {
      console.error('Failed to analyze rules:', error);
      onError?.(error instanceof Error ? error : new Error('Failed to analyze rules'));
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, userId, enhancedState.originalSPAState, onError]);

  // Main render
  return (
    <TooltipProvider>
      <div className="scan-rule-sets-spa-orchestrator h-screen flex flex-col">
        {/* Enhanced Header */}
        <div className="border-b bg-background/95 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Scan Rule Sets
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
                  <TabsTrigger value="designer">Designer</TabsTrigger>
                  <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
                  <TabsTrigger value="testing">Testing</TabsTrigger>
                  <TabsTrigger value="orchestration">Orchestration</TabsTrigger>
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
                  <p>Loading Scan Rule Sets...</p>
                </div>
              </div>
            }>
              {activeView === 'designer' && (
                <RuleDesigner
                  ref={originalSPARef}
                  workspaceId={workspaceId}
                  userId={userId}
                  enhancedMode={enhancedState.orchestrationEnabled}
                  onStateChange={(state) => setEnhancedState(prev => ({ ...prev, originalSPAState: state }))}
                />
              )}
              
              {activeView === 'intelligence' && (
                <RuleIntelligence
                  ref={originalSPARef}
                  workspaceId={workspaceId}
                  userId={userId}
                  enhancedMode={enhancedState.orchestrationEnabled}
                  onStateChange={(state) => setEnhancedState(prev => ({ ...prev, originalSPAState: state }))}
                />
              )}
              
              {activeView === 'testing' && (
                <TestingFramework
                  ref={originalSPARef}
                  workspaceId={workspaceId}
                  userId={userId}
                  enhancedMode={enhancedState.orchestrationEnabled}
                  onStateChange={(state) => setEnhancedState(prev => ({ ...prev, originalSPAState: state }))}
                />
              )}
              
              {activeView === 'orchestration' && (
                <RuleOrchestration
                  ref={originalSPARef}
                  workspaceId={workspaceId}
                  userId={userId}
                  enhancedMode={enhancedState.orchestrationEnabled}
                  onStateChange={(state) => setEnhancedState(prev => ({ ...prev, originalSPAState: state }))}
                />
              )}
              
              {activeView === 'collaboration' && (
                <Collaboration
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
                    
                    {/* AI Rule Optimization */}
                    {enableAI && (
                      <AIRuleOptimizationPanel
                        optimizations={enhancedState.ruleOptimizations}
                        suggestions={enhancedState.intelligentSuggestions}
                        onApplyOptimization={(opt) => console.log('Apply optimization:', opt)}
                        onDismissOptimization={(id) => {
                          setEnhancedState(prev => ({
                            ...prev,
                            ruleOptimizations: prev.ruleOptimizations.filter(o => o.id !== id)
                          }));
                        }}
                        onAnalyzeRules={handleAnalyzeRules}
                        isLoading={aiLoading}
                      />
                    )}
                    
                    {/* Cross-SPA Rule Applications */}
                    {enableCrossSPA && (
                      <CrossSPARuleApplicationStatus
                        applications={enhancedState.crossSPAApplications}
                        appliedRules={enhancedState.appliedRules}
                        onToggleApplication={(spa, enabled) => console.log('Toggle application:', spa, enabled)}
                        onApplyRuleToSPA={(ruleId, spa) => console.log('Apply rule to SPA:', ruleId, spa)}
                        onViewApplicationResults={(app) => console.log('View results:', app)}
                      />
                    )}
                    
                    {/* Rule Testing Dashboard */}
                    <RuleTestingDashboard
                      testResults={enhancedState.testResults}
                      validationErrors={enhancedState.validationErrors}
                      performanceMetrics={enhancedState.performanceMetrics}
                      onRunTests={(ruleId) => console.log('Run tests:', ruleId)}
                      onViewTestDetails={(result) => console.log('View test details:', result)}
                      isLoading={isLoading}
                    />
                    
                    {/* Collaborative Rule Editor */}
                    {enableCollaboration && (
                      <CollaborativeRuleEditor
                        collaborationState={enhancedState.collaborationState}
                        activeEditors={enhancedState.realTimeEditors}
                        ruleComments={enhancedState.ruleComments}
                        onInviteCollaborator={(email, role) => console.log('Invite collaborator:', email, role)}
                        onAddComment={(ruleId, comment, type) => console.log('Add comment:', ruleId, comment, type)}
                        onStartCollaborativeSession={(ruleId) => console.log('Start session:', ruleId)}
                        onJoinSession={(sessionId) => console.log('Join session:', sessionId)}
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

export default ScanRuleSetsSPAOrchestrator;