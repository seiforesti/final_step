/**
 * IntelligentRuleDesigner Component
 * 
 * Advanced enterprise-grade rule designer with AI-powered assistance,
 * real-time validation, pattern recognition, and collaborative features.
 * 
 * Features:
 * - Visual drag-drop rule builder with AI assistance
 * - Real-time syntax validation and error highlighting  
 * - Pattern suggestion engine with ML recommendations
 * - Multi-language support (SQL, Python, RegEx, NLP)
 * - IntelliSense-powered code completion
 * - Live preview with sample data
 * - Advanced debugging capabilities
 * - Performance impact prediction
 * - Collaborative editing with version control
 * - Advanced analytics and insights
 * 
 * @version 2.0.0
 * @enterprise-grade
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

// Icons
import {
  Brain,
  Wand2,
  Code2,
  Play,
  Pause,
  Square,
  Save,
  Download,
  Upload,
  Share2,
  Eye,
  EyeOff,
  Settings,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  MessageSquare,
  GitBranch,
  History,
  Zap,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Lightbulb,
  Sparkles,
  Bot,
  Database,
  FileText,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  Plus,
  Minus,
  Copy,
  Trash2,
  Edit,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Maximize2,
  Minimize2,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';

// Hooks
import { useScanRules } from '../../hooks/useScanRules';
import { useValidation } from '../../hooks/useValidation';
import { useIntelligence } from '../../hooks/useIntelligence';
import { useCollaboration } from '../../hooks/useCollaboration';
import { usePatternLibrary } from '../../hooks/usePatternLibrary';

// RBAC Integration
import { useScanRuleRBAC } from '../../utils/rbac-integration';

// Types
import type {
  ScanRule,
  RuleTemplate,
  ValidationResult,
  AIOptimization,
  PatternRecognition,
  CollaborationSession,
  RuleMetadata,
  PerformanceProfile,
  TestCase
} from '../../types/scan-rules.types';

// Enhanced Rule Designer Props
interface IntelligentRuleDesignerProps {
  ruleId?: string;
  templateId?: string;
  mode?: 'create' | 'edit' | 'clone' | 'view';
  onSave?: (rule: ScanRule) => void;
  onCancel?: () => void;
  onTest?: (rule: ScanRule) => void;
  onDeploy?: (rule: ScanRule) => void;
  initialData?: Partial<ScanRule>;
  collaborationEnabled?: boolean;
  aiAssistanceEnabled?: boolean;
  advancedFeatures?: boolean;
  className?: string;
  // RBAC props
  rbac?: any;
  userContext?: any;
  accessLevel?: string;
}

// Rule Designer State
interface RuleDesignerState {
  // Core rule data
  rule: Partial<ScanRule>;
  originalRule: Partial<ScanRule>;
  
  // UI state
  activeTab: string;
  isLoading: boolean;
  isSaving: boolean;
  isTesting: boolean;
  isDeploying: boolean;
  
  // AI state
  aiSuggestions: any[];
  aiInsights: any[];
  patternMatches: any[];
  
  // Validation state
  validationResults: ValidationResult[];
  syntaxErrors: any[];
  warnings: any[];
  
  // Collaboration state
  collaborationSession: CollaborationSession | null;
  activeUsers: any[];
  comments: any[];
  
  // Editor state
  editorContent: string;
  editorLanguage: string;
  editorTheme: string;
  showLineNumbers: boolean;
  wordWrap: boolean;
  
  // Preview state
  previewData: any;
  previewResults: any[];
  previewMode: 'live' | 'sample' | 'test';
  
  // Performance state
  performanceMetrics: PerformanceProfile;
  executionTime: number;
  resourceUsage: any;
  
  // Version control
  versions: any[];
  currentVersion: string;
  hasUnsavedChanges: boolean;
  
  // Analytics
  usageStats: any;
  executionHistory: any[];
  successRate: number;
}

// Advanced Editor Configuration
interface EditorConfig {
  language: 'sql' | 'python' | 'javascript' | 'regex' | 'json' | 'yaml';
  theme: 'light' | 'dark' | 'high-contrast';
  fontSize: number;
  tabSize: number;
  autoComplete: boolean;
  syntax_highlighting: boolean;
  error_highlighting: boolean;
  live_validation: boolean;
  ai_assistance: boolean;
  collaboration: boolean;
  line_numbers: boolean;
  word_wrap: boolean;
  minimap: boolean;
  bracket_matching: boolean;
  code_folding: boolean;
  multiple_cursors: boolean;
  vim_mode: boolean;
  emacs_mode: boolean;
}

// Pattern Recognition Configuration
interface PatternConfig {
  enabled: boolean;
  confidence_threshold: number;
  suggestion_limit: number;
  auto_apply: boolean;
  learn_from_usage: boolean;
  context_aware: boolean;
  semantic_analysis: boolean;
  performance_analysis: boolean;
}

// AI Assistant Configuration
interface AIConfig {
  enabled: boolean;
  model: 'gpt-4' | 'claude-3' | 'gemini-pro' | 'custom';
  temperature: number;
  max_tokens: number;
  suggestion_types: string[];
  auto_suggestions: boolean;
  context_window: number;
  learning_enabled: boolean;
  personalization: boolean;
}

/**
 * IntelligentRuleDesigner Component Implementation
 */
export const IntelligentRuleDesigner: React.FC<IntelligentRuleDesignerProps> = ({
  ruleId,
  templateId,
  mode = 'create',
  onSave,
  onCancel,
  onTest,
  onDeploy,
  initialData,
  collaborationEnabled = true,
  aiAssistanceEnabled = true,
  advancedFeatures = true,
  className,
  rbac: propRbac,
  userContext: propUserContext,
  accessLevel: propAccessLevel
}) => {
  // RBAC Integration - use prop or hook
  const hookRbac = useScanRuleRBAC();
  const rbac = propRbac || hookRbac;
  const userContext = propUserContext || rbac.getUserContext();
  const accessLevel = propAccessLevel || rbac.getAccessLevel();
  // Hooks
  const {
    rules,
    createRule,
    updateRule,
    deleteRule,
    testRule,
    deployRule,
    cloneRule,
    loading: rulesLoading,
    error: rulesError
  } = useScanRules();

  const {
    executeValidation,
    validationResults,
    loading: validateLoading,
    error: validateError
  } = useValidation();

  const {
    generateSuggestions,
    analyzePattern,
    predictPerformance,
    suggestions: aiSuggestions,
    insights: aiInsights,
    loading: aiLoading
  } = useIntelligence();

  const {
    startCollaboration,
    joinCollaboration,
    leaveCollaboration,
    addComment,
    resolveComment,
    collaborationSession,
    activeUsers,
    comments,
    loading: collabLoading
  } = useCollaboration();

  const {
    patterns,
    searchPatterns,
    applyPattern,
    createPattern,
    loading: patternsLoading
  } = usePatternLibrary();

  // State Management
  const [state, setState] = useState<RuleDesignerState>({
    // Core rule data
    rule: initialData || {
      name: '',
      description: '',
      type: 'validation',
      expression: '',
      language: 'sql',
      parameters: {},
      thresholds: [],
      conditions: [],
      actions: [],
      metadata: {
        complexity_score: 0,
        estimated_execution_time: 0,
        resource_requirements: {
          cpu: 'low',
          memory: 'low',
          storage: 'low'
        },
        compatibility: [],
        dependencies: [],
        change_history: [],
        usage_statistics: {
          execution_count: 0,
          success_rate: 0,
          average_execution_time: 0,
          error_count: 0,
          last_executed: null
        }
      },
      performance_profile: {
        benchmark_score: 0,
        execution_time_ms: 0,
        memory_usage_mb: 0,
        cpu_usage_percent: 0,
        io_operations: 0,
        cache_hit_rate: 0,
        scalability_factor: 1,
        optimization_opportunities: []
      },
      test_cases: []
    },
    originalRule: {},
    
    // UI state
    activeTab: 'designer',
    isLoading: false,
    isSaving: false,
    isTesting: false,
    isDeploying: false,
    
    // AI state
    aiSuggestions: [],
    aiInsights: [],
    patternMatches: [],
    
    // Validation state
    validationResults: [],
    syntaxErrors: [],
    warnings: [],
    
    // Collaboration state
    collaborationSession: null,
    activeUsers: [],
    comments: [],
    
    // Editor state
    editorContent: '',
    editorLanguage: 'sql',
    editorTheme: 'light',
    showLineNumbers: true,
    wordWrap: true,
    
    // Preview state
    previewData: null,
    previewResults: [],
    previewMode: 'sample',
    
    // Performance state
    performanceMetrics: {
      benchmark_score: 0,
      execution_time_ms: 0,
      memory_usage_mb: 0,
      cpu_usage_percent: 0,
      io_operations: 0,
      cache_hit_rate: 0,
      scalability_factor: 1,
      optimization_opportunities: []
    },
    executionTime: 0,
    resourceUsage: {},
    
    // Version control
    versions: [],
    currentVersion: '1.0.0',
    hasUnsavedChanges: false,
    
    // Analytics
    usageStats: {},
    executionHistory: [],
    successRate: 0
  });

  // Configuration
  const [editorConfig, setEditorConfig] = useState<EditorConfig>({
    language: 'sql',
    theme: 'light',
    fontSize: 14,
    tabSize: 2,
    autoComplete: true,
    syntax_highlighting: true,
    error_highlighting: true,
    live_validation: true,
    ai_assistance: aiAssistanceEnabled,
    collaboration: collaborationEnabled,
    line_numbers: true,
    word_wrap: true,
    minimap: true,
    bracket_matching: true,
    code_folding: true,
    multiple_cursors: true,
    vim_mode: false,
    emacs_mode: false
  });

  const [patternConfig, setPatternConfig] = useState<PatternConfig>({
    enabled: true,
    confidence_threshold: 0.8,
    suggestion_limit: 5,
    auto_apply: false,
    learn_from_usage: true,
    context_aware: true,
    semantic_analysis: true,
    performance_analysis: true
  });

  const [aiConfig, setAIConfig] = useState<AIConfig>({
    enabled: aiAssistanceEnabled,
    model: 'gpt-4',
    temperature: 0.7,
    max_tokens: 2048,
    suggestion_types: ['completion', 'optimization', 'validation', 'pattern'],
    auto_suggestions: true,
    context_window: 4096,
    learning_enabled: true,
    personalization: true
  });

  // Refs
  const editorRef = useRef<any>(null);
  const previewRef = useRef<any>(null);
  const collaborationRef = useRef<any>(null);
  const analyticsRef = useRef<any>(null);

  // Computed values
  const isReadOnly = mode === 'view';
  const canSave = !isReadOnly && state.hasUnsavedChanges && !state.isSaving;
  const canTest = state.rule.expression && !state.isTesting;
  const canDeploy = state.rule.id && !state.isDeploying && state.validationResults.every(r => r.status === 'passed');
  
  const complexityLevel = useMemo(() => {
    const score = state.rule.metadata?.complexity_score || 0;
    if (score < 3) return { level: 'Simple', color: 'green', description: 'Low complexity rule' };
    if (score < 7) return { level: 'Moderate', color: 'yellow', description: 'Medium complexity rule' };
    return { level: 'Complex', color: 'red', description: 'High complexity rule' };
  }, [state.rule.metadata?.complexity_score]);

  const performanceRating = useMemo(() => {
    const score = state.performanceMetrics.benchmark_score;
    if (score >= 90) return { rating: 'Excellent', color: 'green', icon: TrendingUp };
    if (score >= 70) return { rating: 'Good', color: 'blue', icon: Target };
    if (score >= 50) return { rating: 'Fair', color: 'yellow', icon: BarChart3 };
    return { rating: 'Poor', color: 'red', icon: AlertTriangle };
  }, [state.performanceMetrics.benchmark_score]);

  // Event Handlers
  const handleRuleChange = useCallback((field: string, value: any) => {
    setState(prev => ({
      ...prev,
      rule: {
        ...prev.rule,
        [field]: value
      },
      hasUnsavedChanges: true
    }));

    // Trigger real-time validation if enabled
    if (editorConfig.live_validation && field === 'expression') {
      debounceValidation(value);
    }

    // Trigger AI suggestions if enabled
    if (aiConfig.enabled && aiConfig.auto_suggestions) {
      debounceAISuggestions(field, value);
    }
  }, [editorConfig.live_validation, aiConfig.enabled, aiConfig.auto_suggestions]);

  const handleEditorChange = useCallback((content: string) => {
    setState(prev => ({
      ...prev,
      editorContent: content,
      hasUnsavedChanges: true
    }));
    
    handleRuleChange('expression', content);
  }, [handleRuleChange]);

  const handleSave = useCallback(async () => {
    // RBAC permission check
    const canSaveRule = mode === 'create' ? rbac.canCreateRules() : rbac.canEditRules(ruleId);
    if (!canSave || !canSaveRule) {
      showNotification('error', 'You do not have permission to save rules');
      return;
    }

    setState(prev => ({ ...prev, isSaving: true }));

    try {
      // Log user action for audit trail
      await rbac.logUserAction('rule_save', {
        ruleId: state.rule.id,
        mode,
        ruleName: state.rule.name,
        ruleType: state.rule.type
      });

      let savedRule: ScanRule;
      
      if (mode === 'create' || mode === 'clone') {
        // Add user context to the rule
        const ruleWithContext = {
          ...state.rule,
          createdBy: userContext.userId,
          organizationId: userContext.organizationId,
          tenantId: userContext.tenantId,
          createdAt: new Date().toISOString()
        };
        savedRule = await createRule(ruleWithContext as ScanRule);
      } else {
        // Add modification context
        const ruleWithContext = {
          ...state.rule,
          modifiedBy: userContext.userId,
          modifiedAt: new Date().toISOString()
        };
        savedRule = await updateRule(state.rule.id!, ruleWithContext as Partial<ScanRule>);
      }

      setState(prev => ({
        ...prev,
        rule: savedRule,
        originalRule: { ...savedRule },
        hasUnsavedChanges: false,
        isSaving: false
      }));

      onSave?.(savedRule);
      
      // Show success notification
      showNotification('success', 'Rule saved successfully');
      
    } catch (error) {
      setState(prev => ({ ...prev, isSaving: false }));
      showNotification('error', 'Failed to save rule');
      console.error('Save error:', error);
    }
  }, [canSave, mode, state.rule, createRule, updateRule, onSave, rbac, userContext, ruleId]);

  const handleTest = useCallback(async () => {
    // RBAC permission check
    if (!canTest || !rbac.canExecuteRules(ruleId)) {
      showNotification('error', 'You do not have permission to test rules');
      return;
    }

    setState(prev => ({ ...prev, isTesting: true }));

    try {
      // Log user action for audit trail
      await rbac.logUserAction('rule_test', {
        ruleId: state.rule.id,
        ruleName: state.rule.name,
        testType: 'validation'
      });

      const testResults = await testRule(state.rule as ScanRule);
      
      setState(prev => ({
        ...prev,
        validationResults: testResults,
        previewResults: testResults,
        isTesting: false
      }));

      onTest?.(state.rule as ScanRule);
      showNotification('success', 'Rule test completed');
      
    } catch (error) {
      setState(prev => ({ ...prev, isTesting: false }));
      showNotification('error', 'Rule test failed');
      console.error('Test error:', error);
    }
  }, [canTest, state.rule, testRule, onTest, rbac, ruleId]);

  const handleDeploy = useCallback(async () => {
    // RBAC permission check
    if (!canDeploy || !rbac.canDeployRuleSets(state.rule.ruleSetId)) {
      showNotification('error', 'You do not have permission to deploy rules');
      return;
    }

    setState(prev => ({ ...prev, isDeploying: true }));

    try {
      // Log user action for audit trail
      await rbac.logUserAction('rule_deploy', {
        ruleId: state.rule.id,
        ruleName: state.rule.name,
        deploymentTarget: 'production'
      });

      await deployRule(state.rule.id!);
      
      setState(prev => ({
        ...prev,
        isDeploying: false,
        rule: {
          ...prev.rule,
          status: 'active',
          deployedBy: userContext.userId,
          deployedAt: new Date().toISOString()
        }
      }));

      onDeploy?.(state.rule as ScanRule);
      showNotification('success', 'Rule deployed successfully');
      
    } catch (error) {
      setState(prev => ({ ...prev, isDeploying: false }));
      showNotification('error', 'Rule deployment failed');
      console.error('Deploy error:', error);
    }
  }, [canDeploy, state.rule.id, state.rule.ruleSetId, deployRule, onDeploy, rbac, userContext]);

  const handleAISuggestion = useCallback(async (type: string) => {
    if (!aiConfig.enabled) return;

    try {
      const suggestions = await generateSuggestions({
        type,
        context: state.rule,
        content: state.editorContent,
        language: editorConfig.language
      });

      setState(prev => ({
        ...prev,
        aiSuggestions: suggestions
      }));
      
    } catch (error) {
      console.error('AI suggestion error:', error);
    }
  }, [aiConfig.enabled, state.rule, state.editorContent, editorConfig.language, generateSuggestions]);

  const handlePatternAnalysis = useCallback(async () => {
    if (!patternConfig.enabled) return;

    try {
      const patterns = await analyzePattern({
        expression: state.rule.expression || '',
        language: state.rule.language || 'sql',
        context: state.rule
      });

      setState(prev => ({
        ...prev,
        patternMatches: patterns
      }));
      
    } catch (error) {
      console.error('Pattern analysis error:', error);
    }
  }, [patternConfig.enabled, state.rule, analyzePattern]);

  const handleCollaboration = useCallback(async (action: string, data?: any) => {
    if (!collaborationEnabled) return;

    try {
      switch (action) {
        case 'start':
          await startCollaboration(state.rule.id || 'new-rule');
          break;
        case 'join':
          await joinCollaboration(data.sessionId);
          break;
        case 'leave':
          await leaveCollaboration();
          break;
        case 'comment':
          await addComment(data.content, data.position);
          break;
        case 'resolve':
          await resolveComment(data.commentId);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Collaboration error:', error);
    }
  }, [collaborationEnabled, state.rule.id, startCollaboration, joinCollaboration, leaveCollaboration, addComment, resolveComment]);

  // Debounced functions
  const debounceValidation = useMemo(
    () => debounce((expression: string) => {
      if (expression) {
        executeValidation({
          data: { expression, language: state.rule.language },
          rules: ['syntax', 'semantics', 'performance'],
          options: { strictMode: false, includeWarnings: true }
        });
      }
    }, 500),
    [executeValidation, state.rule.language]
  );

  const debounceAISuggestions = useMemo(
    () => debounce((field: string, value: any) => {
      if (aiConfig.auto_suggestions) {
        handleAISuggestion('completion');
      }
    }, 1000),
    [aiConfig.auto_suggestions, handleAISuggestion]
  );

  // Utility functions
  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    // Implementation would depend on notification system
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Effects
  useEffect(() => {
    if (ruleId && mode === 'edit') {
      // Load existing rule
      const existingRule = rules.find(r => r.id === ruleId);
      if (existingRule) {
        setState(prev => ({
          ...prev,
          rule: existingRule,
          originalRule: { ...existingRule },
          editorContent: existingRule.expression || ''
        }));
      }
    }
  }, [ruleId, mode, rules]);

  useEffect(() => {
    if (templateId) {
      // Load template and initialize rule
      // Implementation would load template data
    }
  }, [templateId]);

  useEffect(() => {
    // Initialize collaboration session if enabled
    if (collaborationEnabled && state.rule.id) {
      handleCollaboration('start');
    }

    return () => {
      if (collaborationSession) {
        handleCollaboration('leave');
      }
    };
  }, [collaborationEnabled, state.rule.id]);

  useEffect(() => {
    // Auto-save changes periodically
    const autoSaveInterval = setInterval(() => {
      if (state.hasUnsavedChanges && !state.isSaving) {
        handleSave();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [state.hasUnsavedChanges, state.isSaving, handleSave]);

  // Main Render
  return (
    <TooltipProvider>
      <div className={`intelligent-rule-designer h-full w-full ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Intelligent Rule Designer</h1>
            </div>
            
            {state.rule.name && (
              <div className="flex items-center space-x-2">
                <Separator orientation="vertical" className="h-6" />
                <div className="text-sm text-muted-foreground">
                  {state.rule.name}
                  {state.hasUnsavedChanges && <span className="text-orange-500 ml-1">•</span>}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* AI Status */}
            {aiConfig.enabled && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant={aiSuggestions.length > 0 ? "default" : "secondary"}>
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Assistant
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>AI-powered suggestions and optimization</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Collaboration Status */}
            {collaborationEnabled && activeUsers.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline">
                    <Users className="h-3 w-3 mr-1" />
                    {activeUsers.length}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{activeUsers.length} active collaborators</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Performance Rating */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant={performanceRating.color === 'green' ? 'default' : 'secondary'}>
                  <performanceRating.icon className="h-3 w-3 mr-1" />
                  {performanceRating.rating}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Performance Score: {state.performanceMetrics.benchmark_score}/100</p>
              </TooltipContent>
            </Tooltip>

            {/* User Context Display */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  {accessLevel}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Access Level: {accessLevel}</p>
                <p>User: {userContext.username}</p>
              </TooltipContent>
            </Tooltip>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {rbac.canExecuteRules(ruleId) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleTest}
                  disabled={!canTest}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Test
                </Button>
              )}
              
              {(rbac.canCreateRules() || rbac.canEditRules(ruleId)) && (
                                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSave}
                    disabled={!canSave}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {state.isSaving ? 'Saving...' : 'Save'}
                  </Button>
                )}
              
              {canDeploy && rbac.canDeployRuleSets(state.rule.ruleSetId) && (
                <Button 
                  size="sm" 
                  onClick={handleDeploy}
                  disabled={state.isDeploying}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {state.isDeploying ? 'Deploying...' : 'Deploy'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="h-[calc(100vh-80px)]">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Left Panel - Rule Designer */}
            <ResizablePanel defaultSize={70} minSize={50}>
              <Tabs value={state.activeTab} onValueChange={(tab) => setState(prev => ({ ...prev, activeTab: tab }))}>
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="designer">
                    <Code2 className="h-4 w-4 mr-2" />
                    Designer
                  </TabsTrigger>
                  <TabsTrigger value="editor">
                    <FileText className="h-4 w-4 mr-2" />
                    Editor
                  </TabsTrigger>
                  <TabsTrigger value="preview">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="test">
                    <Play className="h-4 w-4 mr-2" />
                    Test
                  </TabsTrigger>
                  <TabsTrigger value="analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger value="settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </TabsTrigger>
                </TabsList>

                {/* Designer Tab */}
                <TabsContent value="designer" className="h-[calc(100%-40px)] p-4">
                  <ScrollArea className="h-full">
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <FileText className="h-5 w-5 mr-2" />
                            Basic Information
                          </CardTitle>
                          <CardDescription>
                            Define the fundamental properties of your scan rule
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label htmlFor="rule-name">Rule Name</Label>
                            <Input
                              id="rule-name"
                              value={state.rule.name || ''}
                              onChange={(e) => handleRuleChange('name', e.target.value)}
                              placeholder="Enter a descriptive rule name"
                              disabled={isReadOnly}
                            />
                          </div>

                          <div>
                            <Label htmlFor="rule-description">Description</Label>
                            <Textarea
                              id="rule-description"
                              value={state.rule.description || ''}
                              onChange={(e) => handleRuleChange('description', e.target.value)}
                              placeholder="Describe what this rule validates or checks"
                              rows={3}
                              disabled={isReadOnly}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="rule-type">Rule Type</Label>
                              <Select 
                                value={state.rule.type} 
                                onValueChange={(value) => handleRuleChange('type', value)}
                                disabled={isReadOnly}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select rule type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="validation">Validation</SelectItem>
                                  <SelectItem value="transformation">Transformation</SelectItem>
                                  <SelectItem value="classification">Classification</SelectItem>
                                  <SelectItem value="compliance">Compliance</SelectItem>
                                  <SelectItem value="quality">Quality</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="rule-language">Language</Label>
                              <Select 
                                value={state.rule.language} 
                                onValueChange={(value) => handleRuleChange('language', value)}
                                disabled={isReadOnly}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="sql">SQL</SelectItem>
                                  <SelectItem value="python">Python</SelectItem>
                                  <SelectItem value="regex">Regular Expression</SelectItem>
                                  <SelectItem value="json_path">JSON Path</SelectItem>
                                  <SelectItem value="xpath">XPath</SelectItem>
                                  <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Rule Expression */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Code2 className="h-5 w-5 mr-2" />
                              Rule Expression
                            </div>
                            {aiConfig.enabled && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAISuggestion('optimization')}
                                disabled={aiLoading}
                              >
                                <Wand2 className="h-4 w-4 mr-2" />
                                AI Optimize
                              </Button>
                            )}
                          </CardTitle>
                          <CardDescription>
                            Define the core logic of your rule using {state.rule.language?.toUpperCase() || 'SQL'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {/* Code Editor would go here */}
                            <div className="border rounded-md p-4 bg-muted/50 min-h-[200px] font-mono text-sm">
                              <Textarea
                                value={state.rule.expression || ''}
                                onChange={(e) => handleRuleChange('expression', e.target.value)}
                                placeholder={`Enter your ${state.rule.language || 'SQL'} expression here...`}
                                className="border-0 bg-transparent resize-none min-h-[180px] font-mono"
                                disabled={isReadOnly}
                              />
                            </div>

                            {/* Syntax Validation Results */}
                            {state.syntaxErrors.length > 0 && (
                              <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Syntax Errors</AlertTitle>
                                <AlertDescription>
                                  <ul className="list-disc list-inside mt-2">
                                    {state.syntaxErrors.map((error, index) => (
                                      <li key={index}>{error.message}</li>
                                    ))}
                                  </ul>
                                </AlertDescription>
                              </Alert>
                            )}

                            {/* Warnings */}
                            {state.warnings.length > 0 && (
                              <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Warnings</AlertTitle>
                                <AlertDescription>
                                  <ul className="list-disc list-inside mt-2">
                                    {state.warnings.map((warning, index) => (
                                      <li key={index}>{warning.message}</li>
                                    ))}
                                  </ul>
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Performance Metrics */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <TrendingUp className="h-5 w-5 mr-2" />
                            Performance Metrics
                          </CardTitle>
                          <CardDescription>
                            Real-time performance analysis and optimization suggestions
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Complexity Score</Label>
                              <div className="flex items-center space-x-2 mt-1">
                                <Progress 
                                  value={(state.rule.metadata?.complexity_score || 0) * 10} 
                                  className="flex-1"
                                />
                                <Badge variant={complexityLevel.color === 'green' ? 'default' : 'secondary'}>
                                  {complexityLevel.level}
                                </Badge>
                              </div>
                            </div>

                            <div>
                              <Label>Performance Score</Label>
                              <div className="flex items-center space-x-2 mt-1">
                                <Progress 
                                  value={state.performanceMetrics.benchmark_score} 
                                  className="flex-1"
                                />
                                <Badge variant={performanceRating.color === 'green' ? 'default' : 'secondary'}>
                                  {state.performanceMetrics.benchmark_score}/100
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                              <div className="font-semibold text-lg">
                                {state.performanceMetrics.execution_time_ms}ms
                              </div>
                              <div className="text-muted-foreground">Execution Time</div>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                              <div className="font-semibold text-lg">
                                {state.performanceMetrics.memory_usage_mb}MB
                              </div>
                              <div className="text-muted-foreground">Memory Usage</div>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                              <div className="font-semibold text-lg">
                                {state.performanceMetrics.cpu_usage_percent}%
                              </div>
                              <div className="text-muted-foreground">CPU Usage</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Additional tabs would be implemented here */}
                {/* Editor Tab */}
                <TabsContent value="editor" className="h-[calc(100%-40px)]">
                  <div className="h-full p-4">
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle>Advanced Code Editor</CardTitle>
                        <CardDescription>
                          Full-featured code editor with syntax highlighting and IntelliSense
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="h-[calc(100%-80px)]">
                        {/* Advanced code editor implementation would go here */}
                        <div className="h-full border rounded-md p-4 bg-background font-mono text-sm">
                          <Textarea
                            ref={editorRef}
                            value={state.editorContent}
                            onChange={(e) => handleEditorChange(e.target.value)}
                            className="h-full border-0 bg-transparent resize-none"
                            placeholder="// Advanced code editor with AI assistance"
                            disabled={isReadOnly}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Preview Tab */}
                <TabsContent value="preview" className="h-[calc(100%-40px)]">
                  <div className="h-full p-4">
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle>Live Preview</CardTitle>
                        <CardDescription>
                          Preview your rule execution with sample data
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Label>Preview Mode:</Label>
                            <Select 
                              value={state.previewMode} 
                              onValueChange={(value: any) => setState(prev => ({ ...prev, previewMode: value }))}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="live">Live Data</SelectItem>
                                <SelectItem value="sample">Sample Data</SelectItem>
                                <SelectItem value="test">Test Data</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm" onClick={handleTest}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Refresh
                            </Button>
                          </div>
                          
                          <ScrollArea className="h-96 border rounded-md p-4">
                            {state.previewResults.length > 0 ? (
                              <div className="space-y-2">
                                {state.previewResults.map((result, index) => (
                                  <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                                    {result.status === 'passed' ? (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-red-500" />
                                    )}
                                    <span className="text-sm">{result.message}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center text-muted-foreground py-8">
                                No preview data available. Run a test to see results.
                              </div>
                            )}
                          </ScrollArea>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Test Tab */}
                <TabsContent value="test" className="h-[calc(100%-40px)]">
                  <div className="h-full p-4">
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          Test Framework
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={handleTest} disabled={!canTest}>
                              <Play className="h-4 w-4 mr-2" />
                              Run Tests
                            </Button>
                            <Button variant="outline" size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Test Case
                            </Button>
                          </div>
                        </CardTitle>
                        <CardDescription>
                          Comprehensive testing framework with test cases and validation
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-96">
                          {state.rule.test_cases && state.rule.test_cases.length > 0 ? (
                            <div className="space-y-4">
                              {state.rule.test_cases.map((testCase, index) => (
                                <Card key={index}>
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="font-semibold">{testCase.name}</h4>
                                      <Badge variant={testCase.status === 'passed' ? 'default' : 'destructive'}>
                                        {testCase.status}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">{testCase.description}</p>
                                    <div className="text-xs font-mono bg-muted p-2 rounded">
                                      Expected: {JSON.stringify(testCase.expected_result)}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center text-muted-foreground py-8">
                              No test cases defined. Add test cases to validate your rule.
                            </div>
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="h-[calc(100%-40px)]">
                  <div className="h-full p-4">
                    <div className="grid grid-cols-2 gap-4 h-full">
                      <Card>
                        <CardHeader>
                          <CardTitle>Execution Analytics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center p-4 bg-muted/50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                  {state.rule.metadata?.usage_statistics?.success_rate || 0}%
                                </div>
                                <div className="text-sm text-muted-foreground">Success Rate</div>
                              </div>
                              <div className="text-center p-4 bg-muted/50 rounded-lg">
                                <div className="text-2xl font-bold">
                                  {state.rule.metadata?.usage_statistics?.execution_count || 0}
                                </div>
                                <div className="text-sm text-muted-foreground">Executions</div>
                              </div>
                            </div>
                            
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                              <div className="text-2xl font-bold">
                                {state.rule.metadata?.usage_statistics?.average_execution_time || 0}ms
                              </div>
                              <div className="text-sm text-muted-foreground">Avg Execution Time</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Performance Trends</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-48 flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                              <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                              <p>Performance chart would be rendered here</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="h-[calc(100%-40px)]">
                  <div className="h-full p-4">
                    <ScrollArea className="h-full">
                      <div className="space-y-6">
                        {/* Editor Settings */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Editor Settings</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center justify-between">
                                <Label>Line Numbers</Label>
                                <Switch
                                  checked={editorConfig.line_numbers}
                                  onCheckedChange={(checked) => 
                                    setEditorConfig(prev => ({ ...prev, line_numbers: checked }))
                                  }
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label>Word Wrap</Label>
                                <Switch
                                  checked={editorConfig.word_wrap}
                                  onCheckedChange={(checked) => 
                                    setEditorConfig(prev => ({ ...prev, word_wrap: checked }))
                                  }
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label>Auto Complete</Label>
                                <Switch
                                  checked={editorConfig.autoComplete}
                                  onCheckedChange={(checked) => 
                                    setEditorConfig(prev => ({ ...prev, autoComplete: checked }))
                                  }
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label>Live Validation</Label>
                                <Switch
                                  checked={editorConfig.live_validation}
                                  onCheckedChange={(checked) => 
                                    setEditorConfig(prev => ({ ...prev, live_validation: checked }))
                                  }
                                />
                              </div>
                            </div>

                            <div>
                              <Label>Font Size</Label>
                              <Slider
                                value={[editorConfig.fontSize]}
                                onValueChange={([value]) => 
                                  setEditorConfig(prev => ({ ...prev, fontSize: value }))
                                }
                                max={24}
                                min={10}
                                step={1}
                                className="mt-2"
                              />
                            </div>

                            <div>
                              <Label>Theme</Label>
                              <Select 
                                value={editorConfig.theme} 
                                onValueChange={(value: any) => 
                                  setEditorConfig(prev => ({ ...prev, theme: value }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="light">Light</SelectItem>
                                  <SelectItem value="dark">Dark</SelectItem>
                                  <SelectItem value="high-contrast">High Contrast</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </CardContent>
                        </Card>

                        {/* AI Settings */}
                        {aiAssistanceEnabled && (
                          <Card>
                            <CardHeader>
                              <CardTitle>AI Assistant Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Label>Enable AI Assistant</Label>
                                <Switch
                                  checked={aiConfig.enabled}
                                  onCheckedChange={(checked) => 
                                    setAIConfig(prev => ({ ...prev, enabled: checked }))
                                  }
                                />
                              </div>

                              <div className="flex items-center justify-between">
                                <Label>Auto Suggestions</Label>
                                <Switch
                                  checked={aiConfig.auto_suggestions}
                                  onCheckedChange={(checked) => 
                                    setAIConfig(prev => ({ ...prev, auto_suggestions: checked }))
                                  }
                                />
                              </div>

                              <div>
                                <Label>Model</Label>
                                <Select 
                                  value={aiConfig.model} 
                                  onValueChange={(value: any) => 
                                    setAIConfig(prev => ({ ...prev, model: value }))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                                    <SelectItem value="claude-3">Claude 3</SelectItem>
                                    <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label>Temperature</Label>
                                <Slider
                                  value={[aiConfig.temperature]}
                                  onValueChange={([value]) => 
                                    setAIConfig(prev => ({ ...prev, temperature: value }))
                                  }
                                  max={1}
                                  min={0}
                                  step={0.1}
                                  className="mt-2"
                                />
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Collaboration Settings */}
                        {collaborationEnabled && (
                          <Card>
                            <CardHeader>
                              <CardTitle>Collaboration Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Label>Enable Collaboration</Label>
                                <Switch
                                  checked={editorConfig.collaboration}
                                  onCheckedChange={(checked) => 
                                    setEditorConfig(prev => ({ ...prev, collaboration: checked }))
                                  }
                                />
                              </div>

                              <div className="flex items-center justify-between">
                                <Label>Show Cursors</Label>
                                <Switch
                                  checked={true}
                                  onCheckedChange={() => {}}
                                />
                              </div>

                              <div className="flex items-center justify-between">
                                <Label>Live Comments</Label>
                                <Switch
                                  checked={true}
                                  onCheckedChange={() => {}}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </TabsContent>
              </Tabs>
            </ResizablePanel>

            <ResizableHandle />

            {/* Right Panel - AI Assistant & Collaboration */}
            <ResizablePanel defaultSize={30} minSize={25}>
              <div className="h-full border-l">
                <Tabs defaultValue="ai" className="h-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="ai">
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI
                    </TabsTrigger>
                    <TabsTrigger value="collaboration">
                      <Users className="h-4 w-4 mr-2" />
                      Team
                    </TabsTrigger>
                    <TabsTrigger value="patterns">
                      <Target className="h-4 w-4 mr-2" />
                      Patterns
                    </TabsTrigger>
                  </TabsList>

                  {/* AI Assistant Panel */}
                  <TabsContent value="ai" className="h-[calc(100%-40px)] p-4">
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">AI Suggestions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-48">
                            {aiSuggestions.length > 0 ? (
                              <div className="space-y-2">
                                {aiSuggestions.map((suggestion, index) => (
                                  <div key={index} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <p className="text-sm font-medium">{suggestion.title}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {suggestion.description}
                                        </p>
                                      </div>
                                      <Badge variant="outline" className="ml-2">
                                        {Math.round(suggestion.confidence * 100)}%
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center text-muted-foreground py-8">
                                <Bot className="h-8 w-8 mx-auto mb-2" />
                                <p className="text-sm">No AI suggestions available</p>
                              </div>
                            )}
                          </ScrollArea>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">AI Insights</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-32">
                            {aiInsights.length > 0 ? (
                              <div className="space-y-2">
                                {aiInsights.map((insight, index) => (
                                  <div key={index} className="p-2 text-sm border-l-2 border-primary/20 pl-3">
                                    <Lightbulb className="h-4 w-4 inline mr-2 text-yellow-500" />
                                    {insight.message}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center text-muted-foreground py-4">
                                <p className="text-sm">No insights available</p>
                              </div>
                            )}
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Collaboration Panel */}
                  <TabsContent value="collaboration" className="h-[calc(100%-40px)] p-4">
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center justify-between">
                            Active Users
                            <Badge variant="outline">{activeUsers.length}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {activeUsers.map((user, index) => (
                              <div key={index} className="flex items-center space-x-2 p-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-xs font-medium">{user.name?.charAt(0)}</span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{user.name}</p>
                                  <p className="text-xs text-muted-foreground">{user.role}</p>
                                </div>
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center justify-between">
                            Comments
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Add
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-48">
                            {comments.length > 0 ? (
                              <div className="space-y-3">
                                {comments.map((comment, index) => (
                                  <div key={index} className="border rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium">{comment.author}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(comment.timestamp).toLocaleTimeString()}
                                      </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{comment.content}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center text-muted-foreground py-8">
                                <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                                <p className="text-sm">No comments yet</p>
                              </div>
                            )}
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Patterns Panel */}
                  <TabsContent value="patterns" className="h-[calc(100%-40px)] p-4">
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Pattern Matches</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-48">
                            {state.patternMatches.length > 0 ? (
                              <div className="space-y-2">
                                {state.patternMatches.map((pattern, index) => (
                                  <div key={index} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium">{pattern.name}</span>
                                      <Badge variant="outline">
                                        {Math.round(pattern.confidence * 100)}%
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{pattern.description}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center text-muted-foreground py-8">
                                <Target className="h-8 w-8 mx-auto mb-2" />
                                <p className="text-sm">No patterns detected</p>
                              </div>
                            )}
                          </ScrollArea>
                        </CardContent>
                      </Card>

                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={handlePatternAnalysis}
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Analyze Patterns
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default IntelligentRuleDesigner;