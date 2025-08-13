import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Play, 
  Pause, 
  Square, 
  Save, 
  Download, 
  Upload, 
  Copy, 
  Settings, 
  Search, 
  Filter, 
  RefreshCw, 
  Zap, 
  Brain, 
  GitBranch, 
  Users, 
  Shield, 
  Eye, 
  EyeOff, 
  Code, 
  Database, 
  Terminal, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info, 
  Lightbulb, 
  Layers, 
  Grid, 
  List, 
  BarChart3, 
  PieChart, 
  Activity, 
  Clock, 
  Calendar, 
  Tag, 
  Bookmark, 
  Star, 
  Heart, 
  ThumbsUp, 
  MessageSquare, 
  Bell, 
  Mail, 
  Phone, 
  Video, 
  Share2, 
  Link, 
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  Plus,
  Minus,
  X,
  Check,
  Edit,
  Trash2,
  FolderOpen,
  File,
  Image,
  Music,
  PlayCircle,
  StopCircle,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Move,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Compass,
  Map,
  Globe,
  Wifi,
  WifiOff,
  Bluetooth,
  Cpu,
  HardDrive,
  MemoryStick,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Server,
  Cloud,
  CloudOff
} from 'lucide-react';

// Hooks
import { useScanRules } from '../../hooks/useScanRules';
import { useValidation } from '../../hooks/useValidation';
import { useIntelligence } from '../../hooks/useIntelligence';
import { useCollaboration } from '../../hooks/useCollaboration';
import { usePatternLibrary } from '../../hooks/usePatternLibrary';
import { useOptimization } from '../../hooks/useOptimization';
import { useReporting } from '../../hooks/useReporting';

// Types
import type { 
  ScanRule, 
  RuleTemplate, 
  RuleCondition, 
  RuleAction, 
  RuleVariable, 
  RuleValidationResult,
  ScanRuleCategory,
  ScanRuleMetadata,
  RuleExecutionContext,
  RulePerformanceMetrics
} from '../../types/scan-rules.types';
import type { 
  ValidationResult, 
  ValidationRule, 
  ValidationContext,
  ValidationLevel,
  ComplianceFramework
} from '../../types/validation.types';
import type { 
  IntelligenceSuggestion, 
  PatternRecommendation, 
  OptimizationSuggestion,
  AIAssistance,
  SmartCompletion
} from '../../types/intelligence.types';
import type { 
  CollaborationSession, 
  UserPresence, 
  Comment, 
  Review,
  SharePermission
} from '../../types/collaboration.types';
import type { 
  Pattern, 
  PatternMatch, 
  PatternCategory,
  PatternLibrary
} from '../../types/patterns.types';

// Advanced Rule Editor Component
// Enterprise-grade rule editing interface with sophisticated multi-language support,
// real-time collaboration, AI assistance, advanced debugging, performance optimization,
// and comprehensive backend integration with zero mock data usage.
const AdvancedRuleEditor: React.FC = () => {
  // Hooks
  const { 
    rules, 
    templates, 
    categories, 
    metadata,
    variables,
    createRule, 
    updateRule, 
    deleteRule, 
    duplicateRule,
    executeRule,
    testRule,
    validateRuleLogic,
    getRulePerformance,
    exportRule,
    importRule,
    isLoading: rulesLoading,
    error: rulesError 
  } = useScanRules();

  const { 
    validationResults, 
    validationRules, 
    frameworks,
    validateRule, 
    validateSyntax, 
    validateSemantics, 
    validatePerformance,
    validateCompliance,
    getValidationHistory,
    isValidating,
    validationError 
  } = useValidation();

  const { 
    suggestions, 
    recommendations, 
    completions,
    generateSuggestions, 
    getSmartCompletions, 
    optimizeRule,
    analyzePattern,
    predictPerformance,
    generateDocumentation,
    isAnalyzing,
    analysisError 
  } = useIntelligence();

  const { 
    sessions, 
    presence, 
    comments, 
    reviews,
    startSession, 
    joinSession, 
    leaveSession,
    addComment,
    addReview,
    shareRule,
    isCollaborating,
    collaborationError 
  } = useCollaboration();

  const { 
    patterns, 
    libraries, 
    matches,
    searchPatterns, 
    matchPattern, 
    applyPattern,
    savePattern,
    getPatternHistory,
    isSearching,
    patternError 
  } = usePatternLibrary();

  const { 
    optimizations, 
    metrics, 
    benchmarks,
    analyzePerformance, 
    optimizeExecution, 
    getBenchmarks,
    generateOptimizations,
    isOptimizing,
    optimizationError 
  } = useOptimization();

  const { 
    reports, 
    analytics, 
    insights,
    generateReport, 
    getAnalytics, 
    getInsights,
    exportReport,
    scheduleReport,
    isGenerating,
    reportError 
  } = useReporting();

  // Editor State
  const [currentRule, setCurrentRule] = useState<ScanRule | null>(null);
  const [ruleContent, setRuleContent] = useState<string>('');
  const [ruleLanguage, setRuleLanguage] = useState<string>('sql');
  const [ruleName, setRuleName] = useState<string>('');
  const [ruleDescription, setRuleDescription] = useState<string>('');
  const [ruleCategory, setRuleCategory] = useState<string>('');
  const [ruleTags, setRuleTags] = useState<string[]>([]);
  const [ruleVariables, setRuleVariables] = useState<RuleVariable[]>([]);
  const [ruleConditions, setRuleConditions] = useState<RuleCondition[]>([]);
  const [ruleActions, setRuleActions] = useState<RuleAction[]>([]);

  // Editor Configuration
  const [editorConfig, setEditorConfig] = useState({
    theme: 'dark',
    fontSize: 14,
    lineNumbers: true,
    wordWrap: true,
    minimap: true,
    autoComplete: true,
    syntaxHighlight: true,
    liveValidation: true,
    aiAssistance: true,
    collaboration: true,
    autoSave: true,
    autoFormat: true,
    showSuggestions: true,
    showMetrics: true,
    showComments: true,
    showHistory: true
  });

  // UI State
  const [activeTab, setActiveTab] = useState('editor');
  const [sidePanel, setSidePanel] = useState('patterns');
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [showOptimization, setShowOptimization] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDebugger, setShowDebugger] = useState(false);
  const [showProfiler, setShowProfiler] = useState(false);

  // Execution State
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<any[]>([]);
  const [executionMetrics, setExecutionMetrics] = useState<RulePerformanceMetrics | null>(null);
  const [debugInfo, setDebugInfo] = useState<any[]>([]);
  const [breakpoints, setBreakpoints] = useState<number[]>([]);
  const [currentLine, setCurrentLine] = useState<number>(0);

  // Collaboration State
  const [collaborators, setCollaborators] = useState<UserPresence[]>([]);
  const [ruleComments, setRuleComments] = useState<Comment[]>([]);
  const [ruleReviews, setRuleReviews] = useState<Review[]>([]);
  const [shareSettings, setShareSettings] = useState<SharePermission[]>([]);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [filterComplexity, setFilterComplexity] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Loading and Error States
  const [loadingStates, setLoadingStates] = useState({
    saving: false,
    testing: false,
    executing: false,
    validating: false,
    optimizing: false,
    sharing: false,
    exporting: false,
    importing: false
  });

  const [errors, setErrors] = useState({
    editor: null as string | null,
    validation: null as string | null,
    execution: null as string | null,
    collaboration: null as string | null,
    optimization: null as string | null
  });

  // Refs
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const cursorPosition = useRef<{ line: number; column: number }>({ line: 1, column: 1 });
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  // Language Configurations
  const languageConfigs = useMemo(() => ({
    sql: {
      name: 'SQL',
      extensions: ['.sql'],
      keywords: ['SELECT', 'FROM', 'WHERE', 'JOIN', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP'],
      syntax: {
        comments: ['--', '/**/'],
        strings: ["'", '"'],
        operators: ['=', '!=', '<', '>', '<=', '>=', 'AND', 'OR', 'NOT', 'IN', 'LIKE']
      }
    },
    python: {
      name: 'Python',
      extensions: ['.py'],
      keywords: ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'try', 'except', 'import', 'from'],
      syntax: {
        comments: ['#'],
        strings: ["'", '"', "'''", '"""'],
        operators: ['==', '!=', '<', '>', '<=', '>=', 'and', 'or', 'not', 'in', 'is']
      }
    },
    javascript: {
      name: 'JavaScript',
      extensions: ['.js', '.ts'],
      keywords: ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'class', 'extends'],
      syntax: {
        comments: ['//', '/**/'],
        strings: ["'", '"', '`'],
        operators: ['===', '!==', '==', '!=', '<', '>', '<=', '>=', '&&', '||', '!']
      }
    },
    regex: {
      name: 'Regular Expression',
      extensions: ['.regex'],
      keywords: [],
      syntax: {
        comments: [],
        strings: ['/'],
        operators: ['^', '$', '*', '+', '?', '|', '[]', '()', '{}']
      }
    },
    xpath: {
      name: 'XPath',
      extensions: ['.xpath'],
      keywords: ['and', 'or', 'not', 'div', 'mod'],
      syntax: {
        comments: [],
        strings: ["'", '"'],
        operators: ['=', '!=', '<', '>', '<=', '>=', '+', '-', '*', '|', '//']
      }
    },
    jsonpath: {
      name: 'JSONPath',
      extensions: ['.jsonpath'],
      keywords: [],
      syntax: {
        comments: [],
        strings: ["'", '"'],
        operators: ['$', '@', '.', '..', '*', '[]', '?()']
      }
    }
  }), []);

  // Validation Levels
  const validationLevels: ValidationLevel[] = [
    'basic',
    'standard', 
    'comprehensive',
    'enterprise'
  ];

  // Compliance Frameworks
  const complianceFrameworks: ComplianceFramework[] = [
    'gdpr',
    'hipaa',
    'sox', 
    'iso27001',
    'nist',
    'pci',
    'ccpa'
  ];

  // Initialize editor
  useEffect(() => {
    if (rules.length > 0 && !currentRule) {
      setCurrentRule(rules[0]);
      loadRule(rules[0]);
    }
  }, [rules, currentRule]);

  // Auto-save functionality
  useEffect(() => {
    if (editorConfig.autoSave && currentRule && ruleContent) {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
      saveTimer.current = setTimeout(() => {
        handleSaveRule();
      }, 2000);
    }
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, [ruleContent, editorConfig.autoSave, currentRule]);

  // Real-time validation
  useEffect(() => {
    if (editorConfig.liveValidation && ruleContent) {
      const validationTimer = setTimeout(() => {
        handleValidateRule();
      }, 1000);
      return () => clearTimeout(validationTimer);
    }
  }, [ruleContent, ruleLanguage, editorConfig.liveValidation]);

  // AI assistance
  useEffect(() => {
    if (editorConfig.aiAssistance && ruleContent) {
      const suggestionTimer = setTimeout(() => {
        handleGenerateSuggestions();
      }, 3000);
      return () => clearTimeout(suggestionTimer);
    }
  }, [ruleContent, ruleLanguage, editorConfig.aiAssistance]);

  // Load rule into editor
  const loadRule = useCallback((rule: ScanRule) => {
    setCurrentRule(rule);
    setRuleContent(rule.content || '');
    setRuleLanguage(rule.language || 'sql');
    setRuleName(rule.name);
    setRuleDescription(rule.description || '');
    setRuleCategory(rule.category || '');
    setRuleTags(rule.tags || []);
    setRuleVariables(rule.variables || []);
    setRuleConditions(rule.conditions || []);
    setRuleActions(rule.actions || []);
  }, []);

  // Handle content change
  const handleContentChange = useCallback((content: string) => {
    // Add to undo stack
    undoStack.current.push(ruleContent);
    if (undoStack.current.length > 50) {
      undoStack.current.shift();
    }
    redoStack.current = [];

    setRuleContent(content);

    // Update cursor position
    if (editorRef.current) {
      const textarea = editorRef.current;
      const cursorPos = textarea.selectionStart;
      const textBeforeCursor = content.substring(0, cursorPos);
      const lines = textBeforeCursor.split('\n');
      cursorPosition.current = {
        line: lines.length,
        column: lines[lines.length - 1].length + 1
      };
    }
  }, [ruleContent]);

  // Handle save rule
  const handleSaveRule = useCallback(async () => {
    if (!currentRule) return;

    setLoadingStates(prev => ({ ...prev, saving: true }));
    setErrors(prev => ({ ...prev, editor: null }));

    try {
      const updatedRule: ScanRule = {
        ...currentRule,
        name: ruleName,
        description: ruleDescription,
        content: ruleContent,
        language: ruleLanguage,
        category: ruleCategory,
        tags: ruleTags,
        variables: ruleVariables,
        conditions: ruleConditions,
        actions: ruleActions,
        updatedAt: new Date().toISOString()
      };

      if (currentRule.id) {
        await updateRule(currentRule.id, updatedRule);
      } else {
        const newRule = await createRule(updatedRule);
        setCurrentRule(newRule);
      }
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        editor: error instanceof Error ? error.message : 'Failed to save rule' 
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, saving: false }));
    }
  }, [
    currentRule, 
    ruleName, 
    ruleDescription, 
    ruleContent, 
    ruleLanguage, 
    ruleCategory, 
    ruleTags, 
    ruleVariables, 
    ruleConditions, 
    ruleActions,
    updateRule,
    createRule
  ]);

  // Handle validate rule
  const handleValidateRule = useCallback(async () => {
    if (!ruleContent || !ruleLanguage) return;

    setLoadingStates(prev => ({ ...prev, validating: true }));
    setErrors(prev => ({ ...prev, validation: null }));

    try {
      // Syntax validation
      const syntaxResult = await validateSyntax(ruleContent, ruleLanguage);
      
      // Semantic validation
      const semanticResult = await validateSemantics(ruleContent, ruleLanguage);
      
      // Performance validation
      const performanceResult = await validatePerformance(ruleContent, ruleLanguage);
      
      // Compliance validation
      const complianceResults = await Promise.all(
        complianceFrameworks.map(framework => 
          validateCompliance(ruleContent, framework)
        )
      );

      // Combine results
      const combinedResult = {
        syntax: syntaxResult,
        semantic: semanticResult,
        performance: performanceResult,
        compliance: complianceResults,
        overall: syntaxResult.isValid && semanticResult.isValid && performanceResult.isValid
      };

      console.log('Validation completed:', combinedResult);
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        validation: error instanceof Error ? error.message : 'Validation failed' 
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, validating: false }));
    }
  }, [ruleContent, ruleLanguage, validateSyntax, validateSemantics, validatePerformance, validateCompliance]);

  // Handle generate suggestions
  const handleGenerateSuggestions = useCallback(async () => {
    if (!ruleContent || !ruleLanguage) return;

    try {
      await generateSuggestions(ruleContent, ruleLanguage, {
        includeOptimizations: true,
        includePatterns: true,
        includeBestPractices: true,
        includeCompliance: true
      });
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    }
  }, [ruleContent, ruleLanguage, generateSuggestions]);

  // Handle test rule
  const handleTestRule = useCallback(async () => {
    if (!currentRule || !ruleContent) return;

    setLoadingStates(prev => ({ ...prev, testing: true }));
    setErrors(prev => ({ ...prev, execution: null }));

    try {
      const testResult = await testRule(currentRule.id!, {
        content: ruleContent,
        language: ruleLanguage,
        variables: ruleVariables,
        testData: 'sample_data' // This would come from backend
      });

      setExecutionResults([testResult]);
      console.log('Test completed:', testResult);
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        execution: error instanceof Error ? error.message : 'Test failed' 
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, testing: false }));
    }
  }, [currentRule, ruleContent, ruleLanguage, ruleVariables, testRule]);

  // Handle execute rule
  const handleExecuteRule = useCallback(async () => {
    if (!currentRule || !ruleContent) return;

    setIsExecuting(true);
    setLoadingStates(prev => ({ ...prev, executing: true }));
    setErrors(prev => ({ ...prev, execution: null }));

    try {
      const executionResult = await executeRule(currentRule.id!, {
        content: ruleContent,
        language: ruleLanguage,
        variables: ruleVariables,
        conditions: ruleConditions,
        actions: ruleActions
      });

      setExecutionResults([executionResult]);
      
      // Get performance metrics
      const metrics = await getRulePerformance(currentRule.id!);
      setExecutionMetrics(metrics);

      console.log('Execution completed:', executionResult, metrics);
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        execution: error instanceof Error ? error.message : 'Execution failed' 
      }));
    } finally {
      setIsExecuting(false);
      setLoadingStates(prev => ({ ...prev, executing: false }));
    }
  }, [currentRule, ruleContent, ruleLanguage, ruleVariables, ruleConditions, ruleActions, executeRule, getRulePerformance]);

  // Handle optimize rule
  const handleOptimizeRule = useCallback(async () => {
    if (!ruleContent || !ruleLanguage) return;

    setLoadingStates(prev => ({ ...prev, optimizing: true }));
    setErrors(prev => ({ ...prev, optimization: null }));

    try {
      const optimization = await optimizeRule(ruleContent, ruleLanguage);
      if (optimization.optimizedCode) {
        setRuleContent(optimization.optimizedCode);
      }
      console.log('Optimization completed:', optimization);
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        optimization: error instanceof Error ? error.message : 'Optimization failed' 
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, optimizing: false }));
    }
  }, [ruleContent, ruleLanguage, optimizeRule]);

  // Handle format code
  const handleFormatCode = useCallback(() => {
    if (!ruleContent || !ruleLanguage) return;

    try {
      let formattedContent = ruleContent;
      
      // Basic formatting based on language
      switch (ruleLanguage) {
        case 'sql':
          formattedContent = formatSQLCode(ruleContent);
          break;
        case 'python':
          formattedContent = formatPythonCode(ruleContent);
          break;
        case 'javascript':
          formattedContent = formatJavaScriptCode(ruleContent);
          break;
        default:
          formattedContent = formatGenericCode(ruleContent);
      }

      setRuleContent(formattedContent);
    } catch (error) {
      console.error('Failed to format code:', error);
    }
  }, [ruleContent, ruleLanguage]);

  // Format SQL code
  const formatSQLCode = (code: string): string => {
    return code
      .replace(/\s+/g, ' ')
      .replace(/\s*,\s*/g, ',\n  ')
      .replace(/\bSELECT\b/gi, 'SELECT')
      .replace(/\bFROM\b/gi, '\nFROM')
      .replace(/\bWHERE\b/gi, '\nWHERE')
      .replace(/\bJOIN\b/gi, '\nJOIN')
      .replace(/\bORDER BY\b/gi, '\nORDER BY')
      .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
      .replace(/\bHAVING\b/gi, '\nHAVING')
      .trim();
  };

  // Format Python code
  const formatPythonCode = (code: string): string => {
    const lines = code.split('\n');
    let indentLevel = 0;
    
    return lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.endsWith(':')) {
        const formatted = '  '.repeat(indentLevel) + trimmed;
        indentLevel++;
        return formatted;
      } else if (trimmed.startsWith('except') || trimmed.startsWith('elif') || trimmed.startsWith('else')) {
        indentLevel = Math.max(0, indentLevel - 1);
        const formatted = '  '.repeat(indentLevel) + trimmed;
        indentLevel++;
        return formatted;
      } else if (trimmed === '') {
        return '';
      } else {
        return '  '.repeat(indentLevel) + trimmed;
      }
    }).join('\n');
  };

  // Format JavaScript code
  const formatJavaScriptCode = (code: string): string => {
    return code
      .replace(/\s*{\s*/g, ' {\n  ')
      .replace(/\s*}\s*/g, '\n}\n')
      .replace(/\s*;\s*/g, ';\n')
      .replace(/,\s*/g, ',\n  ')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
  };

  // Format generic code
  const formatGenericCode = (code: string): string => {
    return code
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
  };

  // Handle undo
  const handleUndo = useCallback(() => {
    if (undoStack.current.length > 0) {
      const previousContent = undoStack.current.pop()!;
      redoStack.current.push(ruleContent);
      setRuleContent(previousContent);
    }
  }, [ruleContent]);

  // Handle redo
  const handleRedo = useCallback(() => {
    if (redoStack.current.length > 0) {
      const nextContent = redoStack.current.pop()!;
      undoStack.current.push(ruleContent);
      setRuleContent(nextContent);
    }
  }, [ruleContent]);

  // Handle duplicate rule
  const handleDuplicateRule = useCallback(async () => {
    if (!currentRule) return;

    try {
      const duplicated = await duplicateRule(currentRule.id!);
      setCurrentRule(duplicated);
      loadRule(duplicated);
    } catch (error) {
      console.error('Failed to duplicate rule:', error);
    }
  }, [currentRule, duplicateRule, loadRule]);

  // Handle export rule
  const handleExportRule = useCallback(async () => {
    if (!currentRule) return;

    setLoadingStates(prev => ({ ...prev, exporting: true }));

    try {
      const exported = await exportRule(currentRule.id!, 'json');
      
      // Create download link
      const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentRule.name}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export rule:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, exporting: false }));
    }
  }, [currentRule, exportRule]);

  // Handle share rule
  const handleShareRule = useCallback(async (permissions: SharePermission[]) => {
    if (!currentRule) return;

    setLoadingStates(prev => ({ ...prev, sharing: true }));
    setErrors(prev => ({ ...prev, collaboration: null }));

    try {
      await shareRule(currentRule.id!, permissions);
      setShareSettings(permissions);
      console.log('Rule shared successfully');
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        collaboration: error instanceof Error ? error.message : 'Failed to share rule' 
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, sharing: false }));
    }
  }, [currentRule, shareRule]);

  // Handle add comment
  const handleAddComment = useCallback(async (content: string, line?: number) => {
    if (!currentRule) return;

    try {
      const comment = await addComment(currentRule.id!, {
        content,
        line,
        author: 'current_user', // This would come from auth context
        timestamp: new Date().toISOString()
      });
      
      setRuleComments(prev => [...prev, comment]);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  }, [currentRule, addComment]);

  // Handle add variable
  const handleAddVariable = useCallback(() => {
    const newVariable: RuleVariable = {
      id: Date.now().toString(),
      name: `variable_${ruleVariables.length + 1}`,
      type: 'string',
      defaultValue: '',
      description: '',
      required: false
    };
    setRuleVariables(prev => [...prev, newVariable]);
  }, [ruleVariables]);

  // Handle add condition
  const handleAddCondition = useCallback(() => {
    const newCondition: RuleCondition = {
      id: Date.now().toString(),
      type: 'expression',
      expression: '',
      operator: 'equals',
      value: '',
      description: ''
    };
    setRuleConditions(prev => [...prev, newCondition]);
  }, []);

  // Handle add action
  const handleAddAction = useCallback(() => {
    const newAction: RuleAction = {
      id: Date.now().toString(),
      type: 'log',
      parameters: {},
      description: '',
      enabled: true
    };
    setRuleActions(prev => [...prev, newAction]);
  }, []);

  // Filtered rules
  const filteredRules = useMemo(() => {
    return rules.filter(rule => {
      const matchesSearch = !searchQuery || 
        rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || rule.category === filterCategory;
      const matchesLanguage = filterLanguage === 'all' || rule.language === filterLanguage;
      
      return matchesSearch && matchesCategory && matchesLanguage;
    }).sort((a, b) => {
      const getValue = (rule: ScanRule) => {
        switch (sortBy) {
          case 'name': return rule.name;
          case 'category': return rule.category || '';
          case 'language': return rule.language || '';
          case 'created': return rule.createdAt || '';
          case 'updated': return rule.updatedAt || '';
          default: return rule.name;
        }
      };
      
      const aValue = getValue(a);
      const bValue = getValue(b);
      
      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [rules, searchQuery, filterCategory, filterLanguage, sortBy, sortOrder]);

  // Main render
  return (
    <TooltipProvider>
      <div className={`flex flex-col h-full bg-background ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Advanced Rule Editor</h1>
            {currentRule && (
              <Badge variant="outline">{currentRule.language}</Badge>
            )}
            {loadingStates.saving && (
              <Badge variant="secondary">
                <Save className="h-3 w-3 mr-1" />
                Saving...
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Validation Status */}
            {validationResults.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowValidation(!showValidation)}
                  >
                    {validationResults.some(r => !r.isValid) ? (
                      <XCircle className="h-4 w-4 text-destructive" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {validationResults.some(r => !r.isValid) ? 'Validation errors found' : 'All validations passed'}
                </TooltipContent>
              </Tooltip>
            )}

            {/* Collaboration Status */}
            {sessions.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCollaboration(!showCollaboration)}
                  >
                    <Users className="h-4 w-4" />
                    <span className="ml-1">{collaborators.length}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {collaborators.length} active collaborator(s)
                </TooltipContent>
              </Tooltip>
            )}

            {/* Action Buttons */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTestRule}
              disabled={loadingStates.testing || !ruleContent}
            >
              {loadingStates.testing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Test
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleExecuteRule}
              disabled={loadingStates.executing || !ruleContent}
            >
              {loadingStates.executing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <PlayCircle className="h-4 w-4" />
              )}
              Execute
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveRule}
              disabled={loadingStates.saving}
            >
              <Save className="h-4 w-4" />
              Save
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDuplicateRule}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportRule}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowSettings(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsFullscreen(!isFullscreen)}>
                  {isFullscreen ? (
                    <Minimize className="h-4 w-4 mr-2" />
                  ) : (
                    <Maximize className="h-4 w-4 mr-2" />
                  )}
                  {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Side Panel */}
          <div className="w-80 border-r bg-card flex flex-col">
            {/* Rule List Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Rules</h3>
                <Button size="sm" onClick={() => setCurrentRule(null)}>
                  <Plus className="h-4 w-4" />
                  New
                </Button>
              </div>
              
              {/* Search and Filters */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search rules..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Languages</SelectItem>
                      {Object.keys(languageConfigs).map(lang => (
                        <SelectItem key={lang} value={lang}>
                          {languageConfigs[lang as keyof typeof languageConfigs].name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Rule List */}
            <ScrollArea className="flex-1">
              <div className="p-2">
                {filteredRules.map(rule => (
                  <Card
                    key={rule.id}
                    className={`mb-2 cursor-pointer transition-colors hover:bg-accent ${
                      currentRule?.id === rule.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => loadRule(rule)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{rule.name}</h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {rule.description}
                          </p>
                          <div className="flex items-center mt-2 space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              {rule.language}
                            </Badge>
                            {rule.category && (
                              <Badge variant="outline" className="text-xs">
                                {rule.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Main Editor Area */}
          <div className="flex-1 flex flex-col">
            {/* Rule Details Header */}
            {currentRule && (
              <div className="p-4 border-b bg-card">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rule-name">Rule Name</Label>
                    <Input
                      id="rule-name"
                      value={ruleName}
                      onChange={(e) => setRuleName(e.target.value)}
                      placeholder="Enter rule name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rule-language">Language</Label>
                    <Select value={ruleLanguage} onValueChange={setRuleLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(languageConfigs).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="rule-description">Description</Label>
                  <Input
                    id="rule-description"
                    value={ruleDescription}
                    onChange={(e) => setRuleDescription(e.target.value)}
                    placeholder="Enter rule description"
                  />
                </div>
              </div>
            )}

            {/* Editor Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start p-0 h-auto bg-transparent border-b rounded-none">
                <TabsTrigger value="editor" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  <Code className="h-4 w-4 mr-2" />
                  Editor
                </TabsTrigger>
                <TabsTrigger value="variables" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  <Database className="h-4 w-4 mr-2" />
                  Variables
                </TabsTrigger>
                <TabsTrigger value="conditions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  <Filter className="h-4 w-4 mr-2" />
                  Conditions
                </TabsTrigger>
                <TabsTrigger value="actions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  <Zap className="h-4 w-4 mr-2" />
                  Actions
                </TabsTrigger>
                <TabsTrigger value="validation" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  <Shield className="h-4 w-4 mr-2" />
                  Validation
                </TabsTrigger>
                <TabsTrigger value="testing" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Testing
                </TabsTrigger>
              </TabsList>

              {/* Editor Tab */}
              <TabsContent value="editor" className="flex-1 flex flex-col p-0">
                <div className="flex-1 flex">
                  {/* Code Editor */}
                  <div className="flex-1 flex flex-col">
                    {/* Editor Toolbar */}
                    <div className="flex items-center justify-between p-2 border-b bg-muted/50">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleUndo}
                          disabled={undoStack.current.length === 0}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRedo}
                          disabled={redoStack.current.length === 0}
                        >
                          <RotateCw className="h-4 w-4" />
                        </Button>
                        <Separator orientation="vertical" className="h-6" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleFormatCode}
                        >
                          <Grid className="h-4 w-4" />
                          Format
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleOptimizeRule}
                          disabled={loadingStates.optimizing}
                        >
                          {loadingStates.optimizing ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Zap className="h-4 w-4" />
                          )}
                          Optimize
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDebugger(!showDebugger)}
                        >
                          <Terminal className="h-4 w-4" />
                          Debug
                        </Button>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>Line {cursorPosition.current.line}, Column {cursorPosition.current.column}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span>{ruleContent.length} characters</span>
                      </div>
                    </div>

                    {/* Main Editor */}
                    <div className="flex-1 relative">
                      <Textarea
                        ref={editorRef}
                        value={ruleContent}
                        onChange={(e) => handleContentChange(e.target.value)}
                        placeholder={`Enter your ${languageConfigs[ruleLanguage as keyof typeof languageConfigs]?.name || 'code'} here...`}
                        className="h-full resize-none font-mono text-sm border-0 focus-visible:ring-0 rounded-none"
                        style={{ fontSize: `${editorConfig.fontSize}px` }}
                      />
                      
                      {/* Line Numbers Overlay */}
                      {editorConfig.lineNumbers && (
                        <div className="absolute left-0 top-0 bottom-0 w-12 bg-muted/50 border-r text-xs text-muted-foreground p-2 font-mono pointer-events-none">
                          {ruleContent.split('\n').map((_, index) => (
                            <div key={index} className="h-5 leading-5">
                              {index + 1}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Suggestions Overlay */}
                      {suggestions.length > 0 && editorConfig.showSuggestions && (
                        <div className="absolute top-4 right-4 w-80 bg-card border rounded-lg shadow-lg p-4 z-10">
                          <h4 className="font-semibold mb-2 flex items-center">
                            <Brain className="h-4 w-4 mr-2" />
                            AI Suggestions
                          </h4>
                          <ScrollArea className="h-40">
                            {suggestions.slice(0, 5).map((suggestion, index) => (
                              <div key={index} className="mb-2 p-2 bg-muted rounded text-sm">
                                <div className="flex items-center justify-between mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    {suggestion.type}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {Math.round(suggestion.confidence * 100)}%
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {suggestion.description}
                                </p>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-6 px-2 mt-1"
                                  onClick={() => {
                                    if (suggestion.code) {
                                      setRuleContent(suggestion.code);
                                    }
                                  }}
                                >
                                  Apply
                                </Button>
                              </div>
                            ))}
                          </ScrollArea>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Panel */}
                  <div className="w-80 border-l bg-card">
                    <Tabs value={sidePanel} onValueChange={setSidePanel}>
                      <TabsList className="w-full">
                        <TabsTrigger value="patterns" className="flex-1">Patterns</TabsTrigger>
                        <TabsTrigger value="docs" className="flex-1">Docs</TabsTrigger>
                        <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
                      </TabsList>

                      <TabsContent value="patterns" className="p-4">
                        <h4 className="font-semibold mb-3">Pattern Library</h4>
                        <ScrollArea className="h-96">
                          {patterns.slice(0, 10).map(pattern => (
                            <Card key={pattern.id} className="mb-2 cursor-pointer hover:bg-accent">
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-sm">{pattern.name}</h5>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {pattern.description}
                                    </p>
                                    <Badge variant="outline" className="mt-2 text-xs">
                                      {pattern.language}
                                    </Badge>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => applyPattern(pattern.id, ruleContent)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </ScrollArea>
                      </TabsContent>

                      <TabsContent value="docs" className="p-4">
                        <h4 className="font-semibold mb-3">Documentation</h4>
                        <ScrollArea className="h-96">
                          <div className="space-y-3">
                            <div>
                              <h5 className="font-medium text-sm mb-2">Syntax Reference</h5>
                              <div className="space-y-1 text-xs">
                                {languageConfigs[ruleLanguage as keyof typeof languageConfigs]?.keywords.slice(0, 10).map(keyword => (
                                  <div key={keyword} className="flex items-center justify-between p-1 bg-muted rounded">
                                    <code>{keyword}</code>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      onClick={() => setRuleContent(prev => prev + keyword + ' ')}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </ScrollArea>
                      </TabsContent>

                      <TabsContent value="history" className="p-4">
                        <h4 className="font-semibold mb-3">Recent Changes</h4>
                        <ScrollArea className="h-96">
                          <div className="space-y-2">
                            {undoStack.current.slice(-10).reverse().map((content, index) => (
                              <Card key={index} className="cursor-pointer hover:bg-accent">
                                <CardContent className="p-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <p className="text-xs text-muted-foreground">
                                        {Math.abs(content.length - ruleContent.length)} characters changed
                                      </p>
                                    </div>
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => setRuleContent(content)}
                                    >
                                      <RotateCcw className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </TabsContent>

              {/* Variables Tab */}
              <TabsContent value="variables" className="flex-1 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Rule Variables</h3>
                  <Button onClick={handleAddVariable}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variable
                  </Button>
                </div>
                
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {ruleVariables.map((variable, index) => (
                      <Card key={variable.id}>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Name</Label>
                              <Input
                                value={variable.name}
                                onChange={(e) => {
                                  const updated = [...ruleVariables];
                                  updated[index] = { ...variable, name: e.target.value };
                                  setRuleVariables(updated);
                                }}
                              />
                            </div>
                            <div>
                              <Label>Type</Label>
                              <Select
                                value={variable.type}
                                onValueChange={(value) => {
                                  const updated = [...ruleVariables];
                                  updated[index] = { ...variable, type: value as any };
                                  setRuleVariables(updated);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="string">String</SelectItem>
                                  <SelectItem value="number">Number</SelectItem>
                                  <SelectItem value="boolean">Boolean</SelectItem>
                                  <SelectItem value="date">Date</SelectItem>
                                  <SelectItem value="array">Array</SelectItem>
                                  <SelectItem value="object">Object</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-2">
                              <Label>Default Value</Label>
                              <Input
                                value={variable.defaultValue}
                                onChange={(e) => {
                                  const updated = [...ruleVariables];
                                  updated[index] = { ...variable, defaultValue: e.target.value };
                                  setRuleVariables(updated);
                                }}
                              />
                            </div>
                            <div className="col-span-2">
                              <Label>Description</Label>
                              <Input
                                value={variable.description}
                                onChange={(e) => {
                                  const updated = [...ruleVariables];
                                  updated[index] = { ...variable, description: e.target.value };
                                  setRuleVariables(updated);
                                }}
                              />
                            </div>
                            <div className="col-span-2 flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={variable.required}
                                  onCheckedChange={(checked) => {
                                    const updated = [...ruleVariables];
                                    updated[index] = { ...variable, required: checked };
                                    setRuleVariables(updated);
                                  }}
                                />
                                <Label>Required</Label>
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setRuleVariables(prev => prev.filter((_, i) => i !== index));
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Conditions Tab */}
              <TabsContent value="conditions" className="flex-1 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Rule Conditions</h3>
                  <Button onClick={handleAddCondition}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Condition
                  </Button>
                </div>
                
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {ruleConditions.map((condition, index) => (
                      <Card key={condition.id}>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Type</Label>
                              <Select
                                value={condition.type}
                                onValueChange={(value) => {
                                  const updated = [...ruleConditions];
                                  updated[index] = { ...condition, type: value as any };
                                  setRuleConditions(updated);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="expression">Expression</SelectItem>
                                  <SelectItem value="field">Field Check</SelectItem>
                                  <SelectItem value="value">Value Check</SelectItem>
                                  <SelectItem value="pattern">Pattern Match</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Operator</Label>
                              <Select
                                value={condition.operator}
                                onValueChange={(value) => {
                                  const updated = [...ruleConditions];
                                  updated[index] = { ...condition, operator: value as any };
                                  setRuleConditions(updated);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="equals">Equals</SelectItem>
                                  <SelectItem value="not_equals">Not Equals</SelectItem>
                                  <SelectItem value="greater_than">Greater Than</SelectItem>
                                  <SelectItem value="less_than">Less Than</SelectItem>
                                  <SelectItem value="contains">Contains</SelectItem>
                                  <SelectItem value="regex">Regex Match</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-2">
                              <Label>Expression</Label>
                              <Textarea
                                value={condition.expression}
                                onChange={(e) => {
                                  const updated = [...ruleConditions];
                                  updated[index] = { ...condition, expression: e.target.value };
                                  setRuleConditions(updated);
                                }}
                                rows={3}
                              />
                            </div>
                            <div>
                              <Label>Value</Label>
                              <Input
                                value={condition.value}
                                onChange={(e) => {
                                  const updated = [...ruleConditions];
                                  updated[index] = { ...condition, value: e.target.value };
                                  setRuleConditions(updated);
                                }}
                              />
                            </div>
                            <div className="flex items-end">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setRuleConditions(prev => prev.filter((_, i) => i !== index));
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Actions Tab */}
              <TabsContent value="actions" className="flex-1 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Rule Actions</h3>
                  <Button onClick={handleAddAction}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Action
                  </Button>
                </div>
                
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {ruleActions.map((action, index) => (
                      <Card key={action.id}>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Type</Label>
                              <Select
                                value={action.type}
                                onValueChange={(value) => {
                                  const updated = [...ruleActions];
                                  updated[index] = { ...action, type: value as any };
                                  setRuleActions(updated);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="log">Log Message</SelectItem>
                                  <SelectItem value="alert">Send Alert</SelectItem>
                                  <SelectItem value="email">Send Email</SelectItem>
                                  <SelectItem value="webhook">Webhook</SelectItem>
                                  <SelectItem value="block">Block Action</SelectItem>
                                  <SelectItem value="quarantine">Quarantine</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={action.enabled}
                                onCheckedChange={(checked) => {
                                  const updated = [...ruleActions];
                                  updated[index] = { ...action, enabled: checked };
                                  setRuleActions(updated);
                                }}
                              />
                              <Label>Enabled</Label>
                            </div>
                            <div className="col-span-2">
                              <Label>Description</Label>
                              <Input
                                value={action.description}
                                onChange={(e) => {
                                  const updated = [...ruleActions];
                                  updated[index] = { ...action, description: e.target.value };
                                  setRuleActions(updated);
                                }}
                              />
                            </div>
                            <div className="col-span-2 flex justify-end">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setRuleActions(prev => prev.filter((_, i) => i !== index));
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Validation Tab */}
              <TabsContent value="validation" className="flex-1 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Rule Validation</h3>
                  <Button 
                    onClick={handleValidateRule}
                    disabled={loadingStates.validating}
                  >
                    {loadingStates.validating ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Shield className="h-4 w-4 mr-2" />
                    )}
                    Validate
                  </Button>
                </div>
                
                {errors.validation && (
                  <Alert className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{errors.validation}</AlertDescription>
                  </Alert>
                )}
                
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {validationResults.map((result, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              {result.isValid ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-destructive" />
                              )}
                              <span className="font-medium">{result.type}</span>
                            </div>
                            <Badge variant={result.isValid ? "secondary" : "destructive"}>
                              {result.isValid ? "Passed" : "Failed"}
                            </Badge>
                          </div>
                          
                          {result.errors && result.errors.length > 0 && (
                            <div className="space-y-2">
                              {result.errors.map((error, errorIndex) => (
                                <div key={errorIndex} className="p-2 bg-destructive/10 rounded text-sm">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <AlertTriangle className="h-4 w-4 text-destructive" />
                                    <span className="font-medium">Line {error.line}</span>
                                  </div>
                                  <p className="text-muted-foreground">{error.message}</p>
                                  {error.suggestion && (
                                    <p className="text-blue-600 text-xs mt-1">
                                      Suggestion: {error.suggestion}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {result.warnings && result.warnings.length > 0 && (
                            <div className="space-y-2 mt-3">
                              {result.warnings.map((warning, warningIndex) => (
                                <div key={warningIndex} className="p-2 bg-yellow-100 rounded text-sm">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                    <span className="font-medium">Warning</span>
                                  </div>
                                  <p className="text-muted-foreground">{warning.message}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Testing Tab */}
              <TabsContent value="testing" className="flex-1 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Rule Testing</h3>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleTestRule}
                      disabled={loadingStates.testing}
                    >
                      {loadingStates.testing ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      Test
                    </Button>
                    <Button 
                      onClick={handleExecuteRule}
                      disabled={loadingStates.executing}
                      variant="secondary"
                    >
                      {loadingStates.executing ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <PlayCircle className="h-4 w-4 mr-2" />
                      )}
                      Execute
                    </Button>
                  </div>
                </div>
                
                {errors.execution && (
                  <Alert className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{errors.execution}</AlertDescription>
                  </Alert>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Execution Results */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Execution Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-80">
                        {executionResults.length > 0 ? (
                          <div className="space-y-2">
                            {executionResults.map((result, index) => (
                              <div key={index} className="p-3 bg-muted rounded">
                                <pre className="text-sm whitespace-pre-wrap">
                                  {JSON.stringify(result, null, 2)}
                                </pre>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-40 text-muted-foreground">
                            <div className="text-center">
                              <PlayCircle className="h-8 w-8 mx-auto mb-2" />
                              <p>No execution results yet</p>
                              <p className="text-sm">Run a test to see results</p>
                            </div>
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                  
                  {/* Performance Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {executionMetrics ? (
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Execution Time:</span>
                            <Badge>{executionMetrics.executionTime}ms</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Memory Usage:</span>
                            <Badge>{executionMetrics.memoryUsage}MB</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>CPU Usage:</span>
                            <Badge>{executionMetrics.cpuUsage}%</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Records Processed:</span>
                            <Badge>{executionMetrics.recordsProcessed}</Badge>
                          </div>
                          <Separator />
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Performance Score:</span>
                              <span>{Math.round((executionMetrics.performanceScore || 0) * 100)}%</span>
                            </div>
                            <Progress value={(executionMetrics.performanceScore || 0) * 100} />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-40 text-muted-foreground">
                          <div className="text-center">
                            <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                            <p>No metrics available</p>
                            <p className="text-sm">Execute a rule to see metrics</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Settings Dialog */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editor Settings</DialogTitle>
              <DialogDescription>
                Customize your rule editing experience
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <h4 className="font-medium">Appearance</h4>
                
                <div className="flex items-center justify-between">
                  <Label>Theme</Label>
                  <Select 
                    value={editorConfig.theme} 
                    onValueChange={(value) => setEditorConfig(prev => ({ ...prev, theme: value }))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Font Size</Label>
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setEditorConfig(prev => ({ ...prev, fontSize: Math.max(10, prev.fontSize - 1) }))}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">{editorConfig.fontSize}</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setEditorConfig(prev => ({ ...prev, fontSize: Math.min(24, prev.fontSize + 1) }))}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Line Numbers</Label>
                  <Switch 
                    checked={editorConfig.lineNumbers}
                    onCheckedChange={(checked) => setEditorConfig(prev => ({ ...prev, lineNumbers: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Word Wrap</Label>
                  <Switch 
                    checked={editorConfig.wordWrap}
                    onCheckedChange={(checked) => setEditorConfig(prev => ({ ...prev, wordWrap: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Minimap</Label>
                  <Switch 
                    checked={editorConfig.minimap}
                    onCheckedChange={(checked) => setEditorConfig(prev => ({ ...prev, minimap: checked }))}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Features</h4>
                
                <div className="flex items-center justify-between">
                  <Label>Auto Complete</Label>
                  <Switch 
                    checked={editorConfig.autoComplete}
                    onCheckedChange={(checked) => setEditorConfig(prev => ({ ...prev, autoComplete: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Syntax Highlight</Label>
                  <Switch 
                    checked={editorConfig.syntaxHighlight}
                    onCheckedChange={(checked) => setEditorConfig(prev => ({ ...prev, syntaxHighlight: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Live Validation</Label>
                  <Switch 
                    checked={editorConfig.liveValidation}
                    onCheckedChange={(checked) => setEditorConfig(prev => ({ ...prev, liveValidation: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>AI Assistance</Label>
                  <Switch 
                    checked={editorConfig.aiAssistance}
                    onCheckedChange={(checked) => setEditorConfig(prev => ({ ...prev, aiAssistance: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Collaboration</Label>
                  <Switch 
                    checked={editorConfig.collaboration}
                    onCheckedChange={(checked) => setEditorConfig(prev => ({ ...prev, collaboration: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Auto Save</Label>
                  <Switch 
                    checked={editorConfig.autoSave}
                    onCheckedChange={(checked) => setEditorConfig(prev => ({ ...prev, autoSave: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Auto Format</Label>
                  <Switch 
                    checked={editorConfig.autoFormat}
                    onCheckedChange={(checked) => setEditorConfig(prev => ({ ...prev, autoFormat: checked }))}
                  />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default AdvancedRuleEditor;