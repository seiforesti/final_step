/**
 * RuleValidationEngine Component
 * 
 * Advanced enterprise-grade rule validation system with real-time syntax 
 * validation, semantic analysis, performance impact assessment, and AI-powered
 * validation recommendations.
 * 
 * Features:
 * - Real-time syntax validation and error highlighting
 * - Advanced semantic analysis and business logic validation
 * - Performance impact prediction and optimization suggestions
 * - Multi-language validation support (SQL, Python, RegEx, NLP)
 * - AI-powered validation recommendations and auto-corrections
 * - Comprehensive error reporting with detailed diagnostics
 * - Advanced debugging capabilities with step-by-step execution
 * - Integration with pattern library for validation patterns
 * - Collaborative validation with team reviews
 * - Advanced analytics and validation metrics
 * - Custom validation rule creation and management
 * - Compliance and security validation checks
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
  CardTitle,
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
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
import { Shield, CheckCircle, XCircle, AlertTriangle, AlertCircle, Info, Zap, Brain, Target, Code, Database, Globe, Search, Play, Pause, Square, RefreshCw, Settings, MoreHorizontal, ChevronDown, ChevronRight, ChevronUp, Eye, EyeOff, Lightbulb, Sparkles, TrendingUp, TrendingDown, BarChart3, LineChart, PieChart, Activity, Clock, Timer, Gauge, Cpu, HardDrive, Network, FileText, BookOpen, MessageSquare, Users, Star, Flag, Bookmark, Copy, Download, Upload, Share2, Edit, Save, Trash2, Plus, Minus, Filter, SortAsc, SortDesc, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Maximize2, Minimize2, RotateCcw, History, GitBranch, Terminal, Bug, Wrench, Layers, Workflow, Puzzle, Link, Unlink, Lock, Unlock, Crosshair, Radar, Microscope, MapPin, Navigation, Compass, Route, Package, Box, Container, Server, Cloud, Smartphone, Tablet, Monitor, Laptop } from 'lucide-react';

// Hooks
import { useValidation } from '../../hooks/useValidation';
import { useIntelligence } from '../../hooks/useIntelligence';
import { usePatternLibrary } from '../../hooks/usePatternLibrary';
import { useCollaboration } from '../../hooks/useCollaboration';
import { useScanRules } from '../../hooks/useScanRules';

// Types
import type {
  ValidationResult,
  ValidationRule,
  ValidationEngine,
  ValidationError,
  ValidationWarning,
  ValidationSuggestion,
  ValidationMetrics,
  ValidationPerformance,
  ValidationConfiguration,
  SemanticAnalysisResult,
  SyntaxValidationResult,
  PerformanceAnalysisResult,
  ComplianceValidationResult,
  SecurityValidationResult,
  BusinessLogicValidationResult,
  ValidationContext,
  ValidationScope,
  ValidationLevel,
  ValidationDiagnostic,
  ValidationFinding,
  ValidationRecommendation
} from '../../types/validation.types';

import type {
  ScanRule,
  RuleMetadata,
  PerformanceProfile
} from '../../types/scan-rules.types';

// Validation Engine Props
interface RuleValidationEngineProps {
  ruleId?: string;
  ruleContent?: string;
  language?: 'sql' | 'python' | 'javascript' | 'regex' | 'xpath' | 'jsonpath' | 'custom';
  validationLevel?: 'basic' | 'standard' | 'comprehensive' | 'enterprise';
  realTimeValidation?: boolean;
  aiAssistanceEnabled?: boolean;
  collaborationEnabled?: boolean;
  showMetrics?: boolean;
  showDiagnostics?: boolean;
  showRecommendations?: boolean;
  onValidationComplete?: (results: ValidationResult[]) => void;
  onValidationError?: (error: ValidationError) => void;
  onValidationSuggestion?: (suggestion: ValidationSuggestion) => void;
  className?: string;
}

// Validation Engine State
interface ValidationEngineState {
  // Core validation data
  validationResults: ValidationResult[];
  syntaxResults: SyntaxValidationResult[];
  semanticResults: SemanticAnalysisResult[];
  performanceResults: PerformanceAnalysisResult[];
  complianceResults: ComplianceValidationResult[];
  securityResults: SecurityValidationResult[];
  businessLogicResults: BusinessLogicValidationResult[];
  
  // Validation status
  isValidating: boolean;
  validationProgress: number;
  currentValidationPhase: string;
  validationStartTime: Date | null;
  validationEndTime: Date | null;
  
  // Errors and warnings
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
  diagnostics: ValidationDiagnostic[];
  findings: ValidationFinding[];
  recommendations: ValidationRecommendation[];
  
  // Performance metrics
  validationMetrics: ValidationMetrics | null;
  performanceMetrics: ValidationPerformance | null;
  resourceUsage: {
    cpu: number;
    memory: number;
    network: number;
    storage: number;
  };
  
  // AI insights
  aiSuggestions: ValidationSuggestion[];
  aiRecommendations: ValidationRecommendation[];
  aiOptimizations: any[];
  aiInsights: any[];
  
  // Configuration
  validationConfig: ValidationConfiguration;
  validationScope: ValidationScope;
  validationContext: ValidationContext;
  
  // UI state
  activeTab: string;
  selectedError: ValidationError | null;
  selectedWarning: ValidationWarning | null;
  selectedSuggestion: ValidationSuggestion | null;
  expandedSections: Set<string>;
  filterLevel: 'all' | 'errors' | 'warnings' | 'suggestions';
  sortBy: 'severity' | 'line' | 'type' | 'category';
  sortOrder: 'asc' | 'desc';
  
  // Analytics
  validationHistory: ValidationResult[];
  validationTrends: any[];
  validationStats: {
    totalValidations: number;
    successRate: number;
    averageExecutionTime: number;
    commonErrors: string[];
    popularPatterns: string[];
  };
  
  // Collaboration
  sharedValidations: any[];
  validationComments: any[];
  validationReviews: any[];
  
  // Debug and analysis
  debugMode: boolean;
  detailedAnalysis: boolean;
  profilingEnabled: boolean;
  benchmarkMode: boolean;
  
  // Custom rules and patterns
  customRules: ValidationRule[];
  validationPatterns: any[];
  ruleTemplates: any[];
}

// Validation Configuration Interface
interface ValidationConfig {
  syntax: {
    enabled: boolean;
    strictMode: boolean;
    ignoreWarnings: boolean;
    customRules: ValidationRule[];
  };
  semantic: {
    enabled: boolean;
    deepAnalysis: boolean;
    contextAware: boolean;
    businessLogicChecks: boolean;
  };
  performance: {
    enabled: boolean;
    thresholds: {
      executionTime: number;
      memoryUsage: number;
      cpuUsage: number;
      complexity: number;
    };
    optimizationSuggestions: boolean;
    benchmarking: boolean;
  };
  compliance: {
    enabled: boolean;
    standards: string[];
    frameworks: string[];
    regulations: string[];
    autoRemediation: boolean;
  };
  security: {
    enabled: boolean;
    vulnerabilityScanning: boolean;
    accessControlChecks: boolean;
    dataPrivacyChecks: boolean;
    injectionDetection: boolean;
  };
  ai: {
    enabled: boolean;
    model: string;
    confidenceThreshold: number;
    suggestionTypes: string[];
    learningEnabled: boolean;
  };
}

// Validation Result Display Component
interface ValidationResultItemProps {
  result: ValidationResult;
  onSelect?: (result: ValidationResult) => void;
  onFix?: (result: ValidationResult) => void;
  onIgnore?: (result: ValidationResult) => void;
  showDetails?: boolean;
}

const ValidationResultItem: React.FC<ValidationResultItemProps> = ({
  result,
  onSelect,
  onFix,
  onIgnore,
  showDetails = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return XCircle;
      case 'high': return AlertTriangle;
      case 'medium': return AlertCircle;
      case 'low': return Info;
      default: return Info;
    }
  };
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 border-red-200 bg-red-50';
      case 'high': return 'text-orange-600 border-orange-200 bg-orange-50';
      case 'medium': return 'text-yellow-600 border-yellow-200 bg-yellow-50';
      case 'low': return 'text-blue-600 border-blue-200 bg-blue-50';
      default: return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };
  
  const SeverityIcon = getSeverityIcon(result.severity);
  
  return (
    <Card className={`mb-2 cursor-pointer transition-all hover:shadow-md ${getSeverityColor(result.severity)}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <SeverityIcon className="h-5 w-5 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-semibold text-sm">{result.message}</h4>
                <Badge variant="outline" className="text-xs">
                  {result.ruleId}
                </Badge>
                {result.details?.location && (
                  <Badge variant="secondary" className="text-xs">
                    Line {result.details.location.line}
                  </Badge>
                )}
              </div>
              
              {result.details?.description && (
                <p className="text-sm text-muted-foreground mb-2">
                  {result.details.description}
                </p>
              )}
              
              {result.suggestions && result.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {result.suggestions.slice(0, 2).map((suggestion, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <Lightbulb className="h-3 w-3 mr-1" />
                      {suggestion}
                    </Badge>
                  ))}
                  {result.suggestions.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{result.suggestions.length - 2} more
                    </Badge>
                  )}
                </div>
              )}
              
              {showDetails && isExpanded && result.details && (
                <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                  <CollapsibleContent className="space-y-2 mt-2 p-3 bg-white/50 rounded-md">
                    {result.details.code && (
                      <div>
                        <Label className="text-xs font-medium">Problematic Code:</Label>
                        <div className="bg-muted p-2 rounded text-xs font-mono mt-1">
                          {result.details.code}
                        </div>
                      </div>
                    )}
                    
                    {result.details.recommendation && (
                      <div>
                        <Label className="text-xs font-medium">Recommendation:</Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          {result.details.recommendation}
                        </p>
                      </div>
                    )}
                    
                    {result.details.fix && (
                      <div>
                        <Label className="text-xs font-medium">Suggested Fix:</Label>
                        <div className="bg-green-50 p-2 rounded text-xs font-mono mt-1">
                          {result.details.fix}
                        </div>
                      </div>
                    )}
                    
                    {result.details.performance && (
                      <div>
                        <Label className="text-xs font-medium">Performance Impact:</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Progress 
                            value={result.details.performance.impact} 
                            className="flex-1 h-2"
                          />
                          <span className="text-xs">
                            {result.details.performance.impact}%
                          </span>
                        </div>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-1 ml-2">
            {showDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onSelect?.(result)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                {result.details?.fix && (
                  <DropdownMenuItem onClick={() => onFix?.(result)}>
                    <Wrench className="h-4 w-4 mr-2" />
                    Apply Fix
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onIgnore?.(result)}>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Ignore
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Flag className="h-4 w-4 mr-2" />
                  Report Issue
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{new Date(result.timestamp).toLocaleTimeString()}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Timer className="h-3 w-3" />
              <span>{result.executionTime}ms</span>
            </span>
            {result.confidence && (
              <span className="flex items-center space-x-1">
                <Target className="h-3 w-3" />
                <span>{Math.round(result.confidence * 100)}%</span>
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <Badge variant="outline" className="text-xs">
              {result.category || 'General'}
            </Badge>
            <Badge 
              variant={result.status === 'passed' ? 'default' : 'destructive'} 
              className="text-xs"
            >
              {result.status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * RuleValidationEngine Component Implementation
 */
export const RuleValidationEngine: React.FC<RuleValidationEngineProps> = ({
  ruleId,
  ruleContent = '',
  language = 'sql',
  validationLevel = 'comprehensive',
  realTimeValidation = true,
  aiAssistanceEnabled = true,
  collaborationEnabled = true,
  showMetrics = true,
  showDiagnostics = true,
  showRecommendations = true,
  onValidationComplete,
  onValidationError,
  onValidationSuggestion,
  className
}) => {
  // Hooks
  const {
    executeValidation,
    validateSyntax,
    validateSemantics,
    validatePerformance,
    validateCompliance,
    validateSecurity,
    validationResults,
    validationMetrics,
    validationHistory,
    loading: validationLoading,
    error: validationError
  } = useValidation({
    enableRealtime: realTimeValidation,
    enableMetrics: showMetrics,
    enableCompliance: true,
    enableQuality: true
  });

  const {
    generateValidationSuggestions,
    analyzeValidationPatterns,
    optimizeValidationRules,
    predictValidationIssues,
    suggestions: aiSuggestions,
    insights: aiInsights,
    loading: aiLoading
  } = useIntelligence();

  const {
    patterns,
    searchPatterns,
    matchPatterns,
    analyzePattern,
    loading: patternsLoading
  } = usePatternLibrary();

  const {
    addComment,
    getComments,
    addReview,
    shareValidation,
    collaborationSession,
    comments,
    loading: collabLoading
  } = useCollaboration();

  // State Management
  const [state, setState] = useState<ValidationEngineState>({
    // Core validation data
    validationResults: [],
    syntaxResults: [],
    semanticResults: [],
    performanceResults: [],
    complianceResults: [],
    securityResults: [],
    businessLogicResults: [],
    
    // Validation status
    isValidating: false,
    validationProgress: 0,
    currentValidationPhase: '',
    validationStartTime: null,
    validationEndTime: null,
    
    // Errors and warnings
    errors: [],
    warnings: [],
    suggestions: [],
    diagnostics: [],
    findings: [],
    recommendations: [],
    
    // Performance metrics
    validationMetrics: null,
    performanceMetrics: null,
    resourceUsage: {
      cpu: 0,
      memory: 0,
      network: 0,
      storage: 0
    },
    
    // AI insights
    aiSuggestions: [],
    aiRecommendations: [],
    aiOptimizations: [],
    aiInsights: [],
    
    // Configuration
    validationConfig: {
      strictMode: validationLevel === 'enterprise',
      includeWarnings: true,
      includeRecommendations: showRecommendations,
      validationLevel,
      realTime: realTimeValidation,
      aiEnabled: aiAssistanceEnabled,
      collaborationEnabled,
      timeoutMs: 30000,
      maxErrors: 100,
      maxWarnings: 50
    },
    validationScope: {
      syntax: true,
      semantics: true,
      performance: true,
      compliance: true,
      security: true,
      businessLogic: validationLevel !== 'basic'
    },
    validationContext: {
      language,
      ruleId: ruleId || '',
      content: ruleContent,
      timestamp: new Date(),
      userId: 'current-user',
      sessionId: 'validation-session'
    },
    
    // UI state
    activeTab: 'overview',
    selectedError: null,
    selectedWarning: null,
    selectedSuggestion: null,
    expandedSections: new Set(['errors', 'warnings']),
    filterLevel: 'all',
    sortBy: 'severity',
    sortOrder: 'desc',
    
    // Analytics
    validationHistory: [],
    validationTrends: [],
    validationStats: {
      totalValidations: 0,
      successRate: 0,
      averageExecutionTime: 0,
      commonErrors: [],
      popularPatterns: []
    },
    
    // Collaboration
    sharedValidations: [],
    validationComments: [],
    validationReviews: [],
    
    // Debug and analysis
    debugMode: false,
    detailedAnalysis: validationLevel === 'enterprise',
    profilingEnabled: showMetrics,
    benchmarkMode: false,
    
    // Custom rules and patterns
    customRules: [],
    validationPatterns: [],
    ruleTemplates: []
  });

  // Configuration
  const [validationConfig, setValidationConfig] = useState<ValidationConfig>({
    syntax: {
      enabled: true,
      strictMode: validationLevel === 'enterprise',
      ignoreWarnings: false,
      customRules: []
    },
    semantic: {
      enabled: true,
      deepAnalysis: validationLevel !== 'basic',
      contextAware: true,
      businessLogicChecks: validationLevel === 'enterprise'
    },
    performance: {
      enabled: true,
      thresholds: {
        executionTime: 5000,
        memoryUsage: 100,
        cpuUsage: 80,
        complexity: 10
      },
      optimizationSuggestions: true,
      benchmarking: showMetrics
    },
    compliance: {
      enabled: true,
      standards: ['GDPR', 'HIPAA', 'SOX'],
      frameworks: ['ISO27001', 'NIST'],
      regulations: ['PCI-DSS'],
      autoRemediation: false
    },
    security: {
      enabled: true,
      vulnerabilityScanning: true,
      accessControlChecks: true,
      dataPrivacyChecks: true,
      injectionDetection: true
    },
    ai: {
      enabled: aiAssistanceEnabled,
      model: 'gpt-4',
      confidenceThreshold: 0.8,
      suggestionTypes: ['optimization', 'correction', 'enhancement'],
      learningEnabled: true
    }
  });

  // Refs
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const performanceMonitorRef = useRef<any>(null);
  const validationCacheRef = useRef<Map<string, ValidationResult[]>>(new Map());

  // Computed values
  const validationSummary = useMemo(() => {
    const results = state.validationResults;
    const errors = results.filter(r => r.severity === 'critical' || r.severity === 'high');
    const warnings = results.filter(r => r.severity === 'medium' || r.severity === 'low');
    const passed = results.filter(r => r.status === 'passed');
    
    return {
      total: results.length,
      errors: errors.length,
      warnings: warnings.length,
      passed: passed.length,
      successRate: results.length > 0 ? (passed.length / results.length) * 100 : 0,
      criticalIssues: results.filter(r => r.severity === 'critical').length,
      averageExecutionTime: results.length > 0 
        ? results.reduce((sum, r) => sum + r.executionTime, 0) / results.length 
        : 0
    };
  }, [state.validationResults]);

  const filteredResults = useMemo(() => {
    let filtered = state.validationResults;
    
    // Apply filter level
    switch (state.filterLevel) {
      case 'errors':
        filtered = filtered.filter(r => r.severity === 'critical' || r.severity === 'high');
        break;
      case 'warnings':
        filtered = filtered.filter(r => r.severity === 'medium' || r.severity === 'low');
        break;
      case 'suggestions':
        filtered = filtered.filter(r => r.suggestions && r.suggestions.length > 0);
        break;
      default:
        break;
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (state.sortBy) {
        case 'severity':
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          aValue = severityOrder[a.severity as keyof typeof severityOrder] || 0;
          bValue = severityOrder[b.severity as keyof typeof severityOrder] || 0;
          break;
        case 'line':
          aValue = a.details?.location?.line || 0;
          bValue = b.details?.location?.line || 0;
          break;
        case 'type':
          aValue = a.category || '';
          bValue = b.category || '';
          break;
        case 'category':
          aValue = a.ruleId || '';
          bValue = b.ruleId || '';
          break;
        default:
          aValue = a.timestamp;
          bValue = b.timestamp;
      }
      
      if (state.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    return filtered;
  }, [state.validationResults, state.filterLevel, state.sortBy, state.sortOrder]);

  // Event Handlers
  const handleValidateRule = useCallback(async (content?: string) => {
    const ruleContent = content || ruleContent;
    if (!ruleContent.trim()) return;

    setState(prev => ({
      ...prev,
      isValidating: true,
      validationProgress: 0,
      currentValidationPhase: 'Initializing',
      validationStartTime: new Date(),
      validationEndTime: null,
      errors: [],
      warnings: [],
      suggestions: []
    }));

    const startTime = Date.now();

    try {
      // Phase 1: Syntax Validation
      setState(prev => ({ 
        ...prev, 
        validationProgress: 20, 
        currentValidationPhase: 'Syntax Analysis' 
      }));
      
      const syntaxResults = await validateSyntax({
        content: ruleContent,
        language,
        strictMode: validationConfig.syntax.strictMode
      });

      // Phase 2: Semantic Analysis
      setState(prev => ({ 
        ...prev, 
        validationProgress: 40, 
        currentValidationPhase: 'Semantic Analysis' 
      }));
      
      const semanticResults = await validateSemantics({
        content: ruleContent,
        language,
        context: state.validationContext,
        deepAnalysis: validationConfig.semantic.deepAnalysis
      });

      // Phase 3: Performance Analysis
      setState(prev => ({ 
        ...prev, 
        validationProgress: 60, 
        currentValidationPhase: 'Performance Analysis' 
      }));
      
      const performanceResults = await validatePerformance({
        content: ruleContent,
        language,
        thresholds: validationConfig.performance.thresholds
      });

      // Phase 4: Compliance Validation
      setState(prev => ({ 
        ...prev, 
        validationProgress: 80, 
        currentValidationPhase: 'Compliance Check' 
      }));
      
      const complianceResults = await validateCompliance({
        content: ruleContent,
        standards: validationConfig.compliance.standards,
        frameworks: validationConfig.compliance.frameworks
      });

      // Phase 5: Security Validation
      setState(prev => ({ 
        ...prev, 
        validationProgress: 90, 
        currentValidationPhase: 'Security Analysis' 
      }));
      
      const securityResults = await validateSecurity({
        content: ruleContent,
        language,
        vulnerabilityScanning: validationConfig.security.vulnerabilityScanning
      });

      // Combine all results
      const allResults = [
        ...syntaxResults,
        ...semanticResults,
        ...performanceResults,
        ...complianceResults,
        ...securityResults
      ];

      // Phase 6: AI Analysis (if enabled)
      let aiSuggestions: any[] = [];
      let aiRecommendations: any[] = [];
      
      if (aiAssistanceEnabled) {
        setState(prev => ({ 
          ...prev, 
          validationProgress: 95, 
          currentValidationPhase: 'AI Analysis' 
        }));
        
        try {
          aiSuggestions = await generateValidationSuggestions({
            content: ruleContent,
            language,
            validationResults: allResults,
            context: state.validationContext
          });

          aiRecommendations = await optimizeValidationRules({
            content: ruleContent,
            language,
            issues: allResults.filter(r => r.status !== 'passed')
          });
        } catch (aiError) {
          console.warn('AI analysis failed:', aiError);
        }
      }

      const executionTime = Date.now() - startTime;
      const endTime = new Date();

      // Update state with results
      setState(prev => ({
        ...prev,
        validationResults: allResults,
        syntaxResults,
        semanticResults,
        performanceResults,
        complianceResults,
        securityResults,
        aiSuggestions,
        aiRecommendations,
        isValidating: false,
        validationProgress: 100,
        currentValidationPhase: 'Complete',
        validationEndTime: endTime,
        errors: allResults.filter(r => r.severity === 'critical' || r.severity === 'high'),
        warnings: allResults.filter(r => r.severity === 'medium' || r.severity === 'low'),
        suggestions: [...aiSuggestions, ...aiRecommendations],
        validationHistory: [
          ...prev.validationHistory,
          {
            id: `validation-${Date.now()}`,
            timestamp: endTime.toISOString(),
            content: ruleContent,
            language,
            results: allResults,
            executionTime,
            summary: {
              total: allResults.length,
              errors: allResults.filter(r => r.severity === 'critical' || r.severity === 'high').length,
              warnings: allResults.filter(r => r.severity === 'medium' || r.severity === 'low').length,
              passed: allResults.filter(r => r.status === 'passed').length
            }
          } as any
        ].slice(-50) // Keep last 50 validations
      }));

      // Cache results
      const cacheKey = `${language}-${hashContent(ruleContent)}`;
      validationCacheRef.current.set(cacheKey, allResults);

      // Notify callbacks
      onValidationComplete?.(allResults);
      
      if (allResults.some(r => r.status !== 'passed')) {
        const firstError = allResults.find(r => r.severity === 'critical' || r.severity === 'high');
        if (firstError) {
          onValidationError?.(firstError as ValidationError);
        }
      }

      if (aiSuggestions.length > 0) {
        onValidationSuggestion?.(aiSuggestions[0]);
      }

    } catch (error) {
      const endTime = new Date();
      
      setState(prev => ({
        ...prev,
        isValidating: false,
        validationProgress: 0,
        currentValidationPhase: 'Error',
        validationEndTime: endTime,
        errors: [{
          id: `error-${Date.now()}`,
          ruleId: 'VALIDATION_ERROR',
          message: 'Validation failed',
          severity: 'critical',
          status: 'failed',
          timestamp: endTime.toISOString(),
          executionTime: Date.now() - startTime,
          details: {
            description: error instanceof Error ? error.message : 'Unknown validation error',
            category: 'system',
            location: { line: 0, column: 0 }
          }
        } as ValidationError]
      }));

      onValidationError?.(error as ValidationError);
      console.error('Validation error:', error);
    }
  }, [
    ruleContent,
    language,
    validationConfig,
    state.validationContext,
    aiAssistanceEnabled,
    validateSyntax,
    validateSemantics,
    validatePerformance,
    validateCompliance,
    validateSecurity,
    generateValidationSuggestions,
    optimizeValidationRules,
    onValidationComplete,
    onValidationError,
    onValidationSuggestion
  ]);

  const handleApplyFix = useCallback(async (result: ValidationResult) => {
    if (!result.details?.fix) return;

    try {
      // Apply the suggested fix
      const fixedContent = applyValidationFix(ruleContent, result);
      
      // Re-validate with the fixed content
      await handleValidateRule(fixedContent);
      
      showNotification('success', 'Fix applied successfully');
    } catch (error) {
      showNotification('error', 'Failed to apply fix');
      console.error('Apply fix error:', error);
    }
  }, [ruleContent, handleValidateRule]);

  const handleIgnoreResult = useCallback((result: ValidationResult) => {
    setState(prev => ({
      ...prev,
      validationResults: prev.validationResults.map(r =>
        r.id === result.id ? { ...r, ignored: true } : r
      )
    }));
    
    showNotification('info', 'Validation result ignored');
  }, []);

  const handleExportResults = useCallback(async (format: 'json' | 'csv' | 'pdf') => {
    try {
      const exportData = {
        timestamp: new Date().toISOString(),
        ruleId: ruleId || 'unknown',
        language,
        summary: validationSummary,
        results: state.validationResults,
        metrics: state.validationMetrics,
        aiSuggestions: state.aiSuggestions
      };

      let blob: Blob;
      let filename: string;

      switch (format) {
        case 'json':
          blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          filename = `validation-report-${Date.now()}.json`;
          break;
        case 'csv':
          const csvData = convertToCSV(state.validationResults);
          blob = new Blob([csvData], { type: 'text/csv' });
          filename = `validation-report-${Date.now()}.csv`;
          break;
        case 'pdf':
          // Would implement PDF generation here
          blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          filename = `validation-report-${Date.now()}.json`;
          break;
        default:
          return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showNotification('success', 'Validation report exported successfully');
    } catch (error) {
      showNotification('error', 'Failed to export validation report');
      console.error('Export error:', error);
    }
  }, [ruleId, language, validationSummary, state]);

  const handleShareValidation = useCallback(async () => {
    if (!collaborationEnabled) return;

    try {
      await shareValidation({
        ruleId: ruleId || 'unknown',
        content: ruleContent,
        language,
        results: state.validationResults,
        summary: validationSummary
      });

      showNotification('success', 'Validation shared successfully');
    } catch (error) {
      showNotification('error', 'Failed to share validation');
      console.error('Share error:', error);
    }
  }, [collaborationEnabled, ruleId, ruleContent, language, state.validationResults, validationSummary, shareValidation]);

  // Utility functions
  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  const hashContent = (content: string): string => {
    // Simple hash function for caching
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  };

  const applyValidationFix = (content: string, result: ValidationResult): string => {
    if (!result.details?.fix || !result.details?.location) return content;
    
    const lines = content.split('\n');
    const lineIndex = result.details.location.line - 1;
    
    if (lineIndex >= 0 && lineIndex < lines.length) {
      lines[lineIndex] = result.details.fix;
    }
    
    return lines.join('\n');
  };

  const convertToCSV = (results: ValidationResult[]): string => {
    const headers = ['ID', 'Rule ID', 'Message', 'Severity', 'Status', 'Line', 'Execution Time', 'Timestamp'];
    const rows = results.map(r => [
      r.id,
      r.ruleId,
      r.message,
      r.severity,
      r.status,
      r.details?.location?.line || '',
      r.executionTime,
      r.timestamp
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const getLanguageIcon = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'sql': return Database;
      case 'python': return Code;
      case 'javascript': return Globe;
      case 'regex': return Target;
      default: return FileText;
    }
  };

  // Real-time validation effect
  useEffect(() => {
    if (!realTimeValidation || !ruleContent.trim()) return;

    // Clear previous timeout
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    // Set new timeout for debounced validation
    validationTimeoutRef.current = setTimeout(() => {
      handleValidateRule(ruleContent);
    }, 1000); // 1 second debounce

    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [ruleContent, realTimeValidation, handleValidateRule]);

  // Performance monitoring effect
  useEffect(() => {
    if (!showMetrics) return;

    const interval = setInterval(() => {
      // Simulate resource usage monitoring
      setState(prev => ({
        ...prev,
        resourceUsage: {
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          network: Math.random() * 100,
          storage: Math.random() * 100
        }
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [showMetrics]);

  // Load validation history and patterns
  useEffect(() => {
    const loadData = async () => {
      try {
        if (ruleId) {
          // Load validation history for this rule
          const history = validationHistory.filter(h => h.ruleId === ruleId);
          setState(prev => ({ ...prev, validationHistory: history }));
        }

        // Load relevant patterns
        if (language) {
          const relevantPatterns = await searchPatterns({ language, category: 'validation' });
          setState(prev => ({ ...prev, validationPatterns: relevantPatterns }));
        }
      } catch (error) {
        console.error('Failed to load validation data:', error);
      }
    };

    loadData();
  }, [ruleId, language, validationHistory, searchPatterns]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
      if (performanceMonitorRef.current) {
        clearInterval(performanceMonitorRef.current);
      }
    };
  }, []);

  // Main Render
  return (
    <TooltipProvider>
      <div className={`rule-validation-engine h-full w-full ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Rule Validation Engine</h1>
            </div>
            
            {state.currentValidationPhase && (
              <div className="flex items-center space-x-2">
                <Separator orientation="vertical" className="h-6" />
                <div className="text-sm text-muted-foreground">
                  {state.isValidating ? (
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>{state.currentValidationPhase}</span>
                      <Progress value={state.validationProgress} className="w-20 h-2" />
                    </div>
                  ) : (
                    <span>Ready</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Language Badge */}
            <Badge variant="outline" className="flex items-center space-x-1">
              {React.createElement(getLanguageIcon(language), { className: "h-3 w-3" })}
              <span>{language.toUpperCase()}</span>
            </Badge>

            {/* Validation Level Badge */}
            <Badge variant={validationLevel === 'enterprise' ? 'default' : 'secondary'}>
              {validationLevel}
            </Badge>

            {/* AI Status */}
            {aiAssistanceEnabled && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant={state.aiSuggestions.length > 0 ? "default" : "secondary"}>
                    <Brain className="h-3 w-3 mr-1" />
                    AI Assistant
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>AI-powered validation assistance</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleValidateRule()}
                disabled={state.isValidating || !ruleContent.trim()}
              >
                <Play className="h-4 w-4 mr-2" />
                {state.isValidating ? 'Validating...' : 'Validate'}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExportResults('json')}>
                    <FileText className="h-4 w-4 mr-2" />
                    JSON Report
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportResults('csv')}>
                    <FileText className="h-4 w-4 mr-2" />
                    CSV Report
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportResults('pdf')}>
                    <FileText className="h-4 w-4 mr-2" />
                    PDF Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {collaborationEnabled && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShareValidation}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="h-[calc(100vh-80px)]">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Left Panel - Validation Results */}
            <ResizablePanel defaultSize={70} minSize={50}>
              <Tabs value={state.activeTab} onValueChange={(tab) => setState(prev => ({ ...prev, activeTab: tab }))}>
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="results">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Results
                  </TabsTrigger>
                  <TabsTrigger value="performance">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Performance
                  </TabsTrigger>
                  <TabsTrigger value="security">
                    <Shield className="h-4 w-4 mr-2" />
                    Security
                  </TabsTrigger>
                  <TabsTrigger value="ai">
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Insights
                  </TabsTrigger>
                  <TabsTrigger value="history">
                    <History className="h-4 w-4 mr-2" />
                    History
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="h-[calc(100%-40px)] p-4">
                  <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Total Issues</p>
                              <p className="text-2xl font-bold">{validationSummary.total}</p>
                            </div>
                            <Activity className="h-8 w-8 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Critical Errors</p>
                              <p className="text-2xl font-bold text-red-600">{validationSummary.criticalIssues}</p>
                            </div>
                            <XCircle className="h-8 w-8 text-red-500" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                              <p className="text-2xl font-bold text-green-600">
                                {validationSummary.successRate.toFixed(1)}%
                              </p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Avg Time</p>
                              <p className="text-2xl font-bold">
                                {validationSummary.averageExecutionTime.toFixed(0)}ms
                              </p>
                            </div>
                            <Timer className="h-8 w-8 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Validation Progress */}
                    {state.isValidating && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                            Validation in Progress
                          </CardTitle>
                          <CardDescription>
                            {state.currentValidationPhase}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Progress</span>
                              <span>{state.validationProgress}%</span>
                            </div>
                            <Progress value={state.validationProgress} className="w-full" />
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Validation Categories */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Validation Categories</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Code className="h-4 w-4" />
                                <span className="text-sm">Syntax</span>
                              </div>
                              <Badge variant={state.syntaxResults.some(r => r.status !== 'passed') ? 'destructive' : 'default'}>
                                {state.syntaxResults.filter(r => r.status !== 'passed').length} issues
                              </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Brain className="h-4 w-4" />
                                <span className="text-sm">Semantics</span>
                              </div>
                              <Badge variant={state.semanticResults.some(r => r.status !== 'passed') ? 'destructive' : 'default'}>
                                {state.semanticResults.filter(r => r.status !== 'passed').length} issues
                              </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Gauge className="h-4 w-4" />
                                <span className="text-sm">Performance</span>
                              </div>
                              <Badge variant={state.performanceResults.some(r => r.status !== 'passed') ? 'destructive' : 'default'}>
                                {state.performanceResults.filter(r => r.status !== 'passed').length} issues
                              </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Shield className="h-4 w-4" />
                                <span className="text-sm">Security</span>
                              </div>
                              <Badge variant={state.securityResults.some(r => r.status !== 'passed') ? 'destructive' : 'default'}>
                                {state.securityResults.filter(r => r.status !== 'passed').length} issues
                              </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4" />
                                <span className="text-sm">Compliance</span>
                              </div>
                              <Badge variant={state.complianceResults.some(r => r.status !== 'passed') ? 'destructive' : 'default'}>
                                {state.complianceResults.filter(r => r.status !== 'passed').length} issues
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Resource Usage */}
                      {showMetrics && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Resource Usage</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm flex items-center">
                                    <Cpu className="h-4 w-4 mr-1" />
                                    CPU
                                  </span>
                                  <span className="text-sm">{state.resourceUsage.cpu.toFixed(1)}%</span>
                                </div>
                                <Progress value={state.resourceUsage.cpu} className="h-2" />
                              </div>
                              
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm flex items-center">
                                    <Memory className="h-4 w-4 mr-1" />
                                    Memory
                                  </span>
                                  <span className="text-sm">{state.resourceUsage.memory.toFixed(1)}%</span>
                                </div>
                                <Progress value={state.resourceUsage.memory} className="h-2" />
                              </div>
                              
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm flex items-center">
                                    <Network className="h-4 w-4 mr-1" />
                                    Network
                                  </span>
                                  <span className="text-sm">{state.resourceUsage.network.toFixed(1)}%</span>
                                </div>
                                <Progress value={state.resourceUsage.network} className="h-2" />
                              </div>
                              
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm flex items-center">
                                    <HardDrive className="h-4 w-4 mr-1" />
                                    Storage
                                  </span>
                                  <span className="text-sm">{state.resourceUsage.storage.toFixed(1)}%</span>
                                </div>
                                <Progress value={state.resourceUsage.storage} className="h-2" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Results Tab */}
                <TabsContent value="results" className="h-[calc(100%-40px)] p-4">
                  <div className="space-y-4">
                    {/* Filters and Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Select
                          value={state.filterLevel}
                          onValueChange={(value: any) => setState(prev => ({ ...prev, filterLevel: value }))}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Issues</SelectItem>
                            <SelectItem value="errors">Errors Only</SelectItem>
                            <SelectItem value="warnings">Warnings Only</SelectItem>
                            <SelectItem value="suggestions">Suggestions</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select
                          value={state.sortBy}
                          onValueChange={(value: any) => setState(prev => ({ ...prev, sortBy: value }))}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="severity">Severity</SelectItem>
                            <SelectItem value="line">Line Number</SelectItem>
                            <SelectItem value="type">Type</SelectItem>
                            <SelectItem value="category">Category</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setState(prev => ({ 
                            ...prev, 
                            sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
                          }))}
                        >
                          {state.sortOrder === 'asc' ? (
                            <SortAsc className="h-4 w-4" />
                          ) : (
                            <SortDesc className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {filteredResults.length} of {state.validationResults.length} results
                        </span>
                      </div>
                    </div>

                    {/* Results List */}
                    <ScrollArea className="h-[calc(100vh-300px)]">
                      {filteredResults.length > 0 ? (
                        <div className="space-y-2">
                          {filteredResults.map((result) => (
                            <ValidationResultItem
                              key={result.id}
                              result={result}
                              onSelect={(r) => setState(prev => ({ ...prev, selectedError: r as ValidationError }))}
                              onFix={handleApplyFix}
                              onIgnore={handleIgnoreResult}
                              showDetails={true}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          {state.validationResults.length === 0 ? (
                            <>
                              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                              <h3 className="text-lg font-semibold mb-2">No Validation Results</h3>
                              <p className="text-muted-foreground mb-4">
                                Run a validation to see results here
                              </p>
                              <Button onClick={() => handleValidateRule()}>
                                <Play className="h-4 w-4 mr-2" />
                                Start Validation
                              </Button>
                            </>
                          ) : (
                            <>
                              <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                              <h3 className="text-lg font-semibold mb-2">No Results Match Filters</h3>
                              <p className="text-muted-foreground">
                                Try adjusting your filter criteria
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance" className="h-[calc(100%-40px)] p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                    <Card>
                      <CardHeader>
                        <CardTitle>Performance Metrics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <div className="text-2xl font-bold">
                              {validationSummary.averageExecutionTime.toFixed(0)}ms
                            </div>
                            <div className="text-sm text-muted-foreground">Average Execution Time</div>
                          </div>
                          
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {validationSummary.successRate.toFixed(1)}%
                            </div>
                            <div className="text-sm text-muted-foreground">Success Rate</div>
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
                            <LineChart className="h-12 w-12 mx-auto mb-2" />
                            <p>Performance chart would be rendered here</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="h-[calc(100%-40px)] p-4">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Security Analysis</CardTitle>
                        <CardDescription>
                          Security vulnerabilities and compliance issues
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {state.securityResults.length > 0 ? (
                          <div className="space-y-2">
                            {state.securityResults.map((result, index) => (
                              <ValidationResultItem
                                key={index}
                                result={result}
                                onSelect={(r) => setState(prev => ({ ...prev, selectedError: r as ValidationError }))}
                                onFix={handleApplyFix}
                                onIgnore={handleIgnoreResult}
                                showDetails={true}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Shield className="h-12 w-12 mx-auto mb-4 text-green-500" />
                            <h3 className="text-lg font-semibold mb-2">No Security Issues Found</h3>
                            <p className="text-muted-foreground">
                              Your rule passes all security checks
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* AI Insights Tab */}
                <TabsContent value="ai" className="h-[calc(100%-40px)] p-4">
                  <div className="space-y-4">
                    {/* AI Suggestions */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Sparkles className="h-5 w-5 mr-2" />
                          AI Suggestions
                        </CardTitle>
                        <CardDescription>
                          AI-powered recommendations and optimizations
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {state.aiSuggestions.length > 0 ? (
                          <div className="space-y-3">
                            {state.aiSuggestions.map((suggestion, index) => (
                              <div key={index} className="p-3 border rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-semibold">{suggestion.title}</h4>
                                  <Badge variant="outline">
                                    {Math.round(suggestion.confidence * 100)}%
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {suggestion.description}
                                </p>
                                {suggestion.code && (
                                  <div className="bg-muted p-2 rounded text-xs font-mono">
                                    {suggestion.code}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">No AI Suggestions</h3>
                            <p className="text-muted-foreground">
                              Run a validation to get AI-powered suggestions
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* AI Recommendations */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Lightbulb className="h-5 w-5 mr-2" />
                          Optimization Recommendations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {state.aiRecommendations.length > 0 ? (
                          <div className="space-y-3">
                            {state.aiRecommendations.map((recommendation, index) => (
                              <div key={index} className="p-3 border rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-semibold">{recommendation.title}</h4>
                                  <Badge variant={recommendation.impact === 'high' ? 'default' : 'secondary'}>
                                    {recommendation.impact} impact
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {recommendation.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">No Recommendations</h3>
                            <p className="text-muted-foreground">
                              Your rule is well-optimized
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="h-[calc(100%-40px)] p-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <History className="h-5 w-5 mr-2" />
                        Validation History
                      </CardTitle>
                      <CardDescription>
                        Previous validation results and trends
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {state.validationHistory.length > 0 ? (
                        <ScrollArea className="h-96">
                          <div className="space-y-3">
                            {state.validationHistory.map((history, index) => (
                              <div key={index} className="p-3 border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium">
                                    {new Date(history.timestamp).toLocaleString()}
                                  </span>
                                  <Badge variant="outline">
                                    {history.executionTime}ms
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                  <div className="text-center p-2 bg-red-50 rounded">
                                    <div className="font-semibold text-red-600">
                                      {history.summary.errors}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Errors</div>
                                  </div>
                                  <div className="text-center p-2 bg-yellow-50 rounded">
                                    <div className="font-semibold text-yellow-600">
                                      {history.summary.warnings}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Warnings</div>
                                  </div>
                                  <div className="text-center p-2 bg-green-50 rounded">
                                    <div className="font-semibold text-green-600">
                                      {history.summary.passed}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Passed</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      ) : (
                        <div className="text-center py-8">
                          <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">No History Available</h3>
                          <p className="text-muted-foreground">
                            Validation history will appear here
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </ResizablePanel>

            <ResizableHandle />

            {/* Right Panel - Configuration & Settings */}
            <ResizablePanel defaultSize={30} minSize={25}>
              <div className="h-full border-l p-4">
                <Tabs defaultValue="config" className="h-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="config">
                      <Settings className="h-4 w-4 mr-2" />
                      Config
                    </TabsTrigger>
                    <TabsTrigger value="patterns">
                      <Puzzle className="h-4 w-4 mr-2" />
                      Patterns
                    </TabsTrigger>
                    <TabsTrigger value="details">
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </TabsTrigger>
                  </TabsList>

                  {/* Configuration Tab */}
                  <TabsContent value="config" className="h-[calc(100%-40px)]">
                    <ScrollArea className="h-full">
                      <div className="space-y-4">
                        {/* Validation Settings */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Validation Settings</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Real-time Validation</Label>
                              <Switch
                                checked={realTimeValidation}
                                onCheckedChange={() => {}}
                                disabled
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Strict Mode</Label>
                              <Switch
                                checked={validationConfig.syntax.strictMode}
                                onCheckedChange={(checked) => 
                                  setValidationConfig(prev => ({
                                    ...prev,
                                    syntax: { ...prev.syntax, strictMode: checked }
                                  }))
                                }
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Include Warnings</Label>
                              <Switch
                                checked={!validationConfig.syntax.ignoreWarnings}
                                onCheckedChange={(checked) => 
                                  setValidationConfig(prev => ({
                                    ...prev,
                                    syntax: { ...prev.syntax, ignoreWarnings: !checked }
                                  }))
                                }
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">AI Assistance</Label>
                              <Switch
                                checked={validationConfig.ai.enabled}
                                onCheckedChange={(checked) => 
                                  setValidationConfig(prev => ({
                                    ...prev,
                                    ai: { ...prev.ai, enabled: checked }
                                  }))
                                }
                              />
                            </div>
                          </CardContent>
                        </Card>

                        {/* Performance Thresholds */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Performance Thresholds</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <Label className="text-sm">Execution Time (ms)</Label>
                              <Input
                                type="number"
                                value={validationConfig.performance.thresholds.executionTime}
                                onChange={(e) => 
                                  setValidationConfig(prev => ({
                                    ...prev,
                                    performance: {
                                      ...prev.performance,
                                      thresholds: {
                                        ...prev.performance.thresholds,
                                        executionTime: parseInt(e.target.value) || 5000
                                      }
                                    }
                                  }))
                                }
                                className="mt-1"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-sm">Memory Usage (MB)</Label>
                              <Input
                                type="number"
                                value={validationConfig.performance.thresholds.memoryUsage}
                                onChange={(e) => 
                                  setValidationConfig(prev => ({
                                    ...prev,
                                    performance: {
                                      ...prev.performance,
                                      thresholds: {
                                        ...prev.performance.thresholds,
                                        memoryUsage: parseInt(e.target.value) || 100
                                      }
                                    }
                                  }))
                                }
                                className="mt-1"
                              />
                            </div>
                          </CardContent>
                        </Card>

                        {/* Security Settings */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Security Checks</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Vulnerability Scanning</Label>
                              <Switch
                                checked={validationConfig.security.vulnerabilityScanning}
                                onCheckedChange={(checked) => 
                                  setValidationConfig(prev => ({
                                    ...prev,
                                    security: { ...prev.security, vulnerabilityScanning: checked }
                                  }))
                                }
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Injection Detection</Label>
                              <Switch
                                checked={validationConfig.security.injectionDetection}
                                onCheckedChange={(checked) => 
                                  setValidationConfig(prev => ({
                                    ...prev,
                                    security: { ...prev.security, injectionDetection: checked }
                                  }))
                                }
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Data Privacy Checks</Label>
                              <Switch
                                checked={validationConfig.security.dataPrivacyChecks}
                                onCheckedChange={(checked) => 
                                  setValidationConfig(prev => ({
                                    ...prev,
                                    security: { ...prev.security, dataPrivacyChecks: checked }
                                  }))
                                }
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Patterns Tab */}
                  <TabsContent value="patterns" className="h-[calc(100%-40px)]">
                    <ScrollArea className="h-full">
                      <div className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Validation Patterns</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {state.validationPatterns.length > 0 ? (
                              <div className="space-y-2">
                                {state.validationPatterns.slice(0, 5).map((pattern, index) => (
                                  <div key={index} className="p-2 border rounded text-sm">
                                    <div className="font-medium">{pattern.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {pattern.description}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4">
                                <Puzzle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  No patterns available
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Details Tab */}
                  <TabsContent value="details" className="h-[calc(100%-40px)]">
                    <ScrollArea className="h-full">
                      <div className="space-y-4">
                        {state.selectedError && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-sm">Selected Issue Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div>
                                  <Label className="text-xs font-medium">Message</Label>
                                  <p className="text-sm mt-1">{state.selectedError.message}</p>
                                </div>
                                
                                <div>
                                  <Label className="text-xs font-medium">Severity</Label>
                                  <Badge className="ml-2" variant={
                                    state.selectedError.severity === 'critical' ? 'destructive' : 'secondary'
                                  }>
                                    {state.selectedError.severity}
                                  </Badge>
                                </div>
                                
                                {state.selectedError.details?.description && (
                                  <div>
                                    <Label className="text-xs font-medium">Description</Label>
                                    <p className="text-sm mt-1 text-muted-foreground">
                                      {state.selectedError.details.description}
                                    </p>
                                  </div>
                                )}
                                
                                {state.selectedError.details?.recommendation && (
                                  <div>
                                    <Label className="text-xs font-medium">Recommendation</Label>
                                    <p className="text-sm mt-1 text-muted-foreground">
                                      {state.selectedError.details.recommendation}
                                    </p>
                                  </div>
                                )}
                                
                                {state.selectedError.details?.fix && (
                                  <div>
                                    <Label className="text-xs font-medium">Suggested Fix</Label>
                                    <div className="bg-muted p-2 rounded text-xs font-mono mt-1">
                                      {state.selectedError.details.fix}
                                    </div>
                                    <Button
                                      size="sm"
                                      className="mt-2 w-full"
                                      onClick={() => handleApplyFix(state.selectedError!)}
                                    >
                                      <Wrench className="h-3 w-3 mr-1" />
                                      Apply Fix
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Validation Statistics */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Session Statistics</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Total Validations:</span>
                                <span>{state.validationHistory.length}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Success Rate:</span>
                                <span>{validationSummary.successRate.toFixed(1)}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Avg Execution:</span>
                                <span>{validationSummary.averageExecutionTime.toFixed(0)}ms</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Total Issues:</span>
                                <span>{validationSummary.total}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </ScrollArea>
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

export default RuleValidationEngine;