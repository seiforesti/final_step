import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  GitBranch, 
  Workflow,
  Network,
  Target,
  Brain,
  Lightbulb,
  Search,
  Filter,
  Settings,
  RefreshCw,
  Play,
  Pause,
  Square,
  Clock,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Save,
  Copy,
  MoreHorizontal,
  ExternalLink,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  FileText,
  Code,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  Gauge,
  Layers,
  Database,
  Cpu,
  Memory,
  Shield,
  Key,
  Lock,
  Unlock,
  Link,
  Unlink,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Share,
  Tag,
  Bookmark,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Custom Hooks
import { useIntelligence } from '../../hooks/useIntelligence';
import { useScanRules } from '../../hooks/useScanRules';
import { useReporting } from '../../hooks/useReporting';

// API Services
import { intelligenceAPI } from '../../services/intelligence-apis';
import { scanRulesAPI } from '../../services/scan-rules-apis';

// Types
import type { 
  BusinessRule,
  RuleMapping,
  BusinessLogic,
  RuleRelationship,
  BusinessProcess,
  RuleHierarchy,
  BusinessContext,
  RuleTranslation,
  MappingMetrics,
  BusinessRequirement,
  ComplianceMapping,
  RuleGovernance,
  BusinessImpact,
  RuleValidation,
  BusinessEntity,
  RulePolicy,
  BusinessFlow,
  RuleOwnership,
  MappingValidation,
  BusinessObjective,
  RulePriority,
  BusinessConstraint,
  RuleEffectiveness
} from '../../types/intelligence.types';

import type { 
  ScanRule,
  RuleSet,
  RulePattern
} from '../../types/scan-rules.types';

// Utilities
import { aiHelpers } from '../../utils/ai-helpers';
import { performanceCalculator } from '../../utils/performance-calculator';

interface BusinessRuleMapperProps {
  className?: string;
  onRuleMapped?: (mapping: RuleMapping) => void;
  onRelationshipCreated?: (relationship: RuleRelationship) => void;
  onValidationCompleted?: (validation: MappingValidation) => void;
}

interface BusinessRuleMapperState {
  businessRules: BusinessRule[];
  scanRules: ScanRule[];
  mappings: RuleMapping[];
  relationships: RuleRelationship[];
  processes: BusinessProcess[];
  hierarchies: RuleHierarchy[];
  translations: RuleTranslation[];
  validations: MappingValidation[];
  metrics: MappingMetrics;
  requirements: BusinessRequirement[];
  entities: BusinessEntity[];
  policies: RulePolicy[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date;
  totalMappings: number;
  activeMappings: number;
  validatedMappings: number;
  businessProcesses: number;
  ruleRelationships: number;
  translationAccuracy: number;
  coveragePercentage: number;
  complianceScore: number;
  effectivenessRating: number;
  governanceCompliance: number;
}

interface BusinessRuleViewState {
  currentView: 'overview' | 'mappings' | 'relationships' | 'processes' | 'validation' | 'governance';
  selectedMapping?: RuleMapping;
  selectedRelationship?: RuleRelationship;
  selectedProcess?: BusinessProcess;
  mappingMode: 'automatic' | 'manual' | 'hybrid';
  validationLevel: 'basic' | 'comprehensive' | 'strict';
  showTranslations: boolean;
  showRelationships: boolean;
  autoValidation: boolean;
  realTimeMapping: boolean;
  showMetrics: boolean;
  highlightConflicts: boolean;
  searchQuery: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  selectedTimeRange: 'day' | 'week' | 'month' | 'quarter';
  filterCategory: string;
  filterStatus: string;
  filterPriority: string;
}

const DEFAULT_VIEW_STATE: BusinessRuleViewState = {
  currentView: 'overview',
  mappingMode: 'hybrid',
  validationLevel: 'comprehensive',
  showTranslations: true,
  showRelationships: true,
  autoValidation: true,
  realTimeMapping: true,
  showMetrics: true,
  highlightConflicts: true,
  searchQuery: '',
  sortBy: 'priority',
  sortOrder: 'desc',
  selectedTimeRange: 'month',
  filterCategory: 'all',
  filterStatus: 'all',
  filterPriority: 'all'
};

const MAPPING_MODES = [
  { value: 'automatic', label: 'Automatic', description: 'AI-powered automatic mapping', icon: Brain },
  { value: 'manual', label: 'Manual', description: 'Human-guided mapping', icon: Edit },
  { value: 'hybrid', label: 'Hybrid', description: 'AI-assisted with human validation', icon: Workflow }
];

const VALIDATION_LEVELS = [
  { value: 'basic', label: 'Basic', description: 'Essential validations only' },
  { value: 'comprehensive', label: 'Comprehensive', description: 'Full validation suite' },
  { value: 'strict', label: 'Strict', description: 'Maximum validation rigor' }
];

const BUSINESS_CATEGORIES = [
  { value: 'compliance', label: 'Compliance', icon: Shield, color: 'text-blue-600' },
  { value: 'security', label: 'Security', icon: Lock, color: 'text-red-600' },
  { value: 'quality', label: 'Quality', icon: CheckCircle2, color: 'text-green-600' },
  { value: 'performance', label: 'Performance', icon: Gauge, color: 'text-yellow-600' },
  { value: 'governance', label: 'Governance', icon: Building2, color: 'text-purple-600' },
  { value: 'operations', label: 'Operations', icon: Activity, color: 'text-orange-600' }
];

const RULE_PRIORITIES = [
  { value: 'critical', label: 'Critical', color: 'text-red-600 bg-red-100' },
  { value: 'high', label: 'High', color: 'text-orange-600 bg-orange-100' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-100' },
  { value: 'low', label: 'Low', color: 'text-green-600 bg-green-100' }
];

const MAPPING_STATUSES = [
  { value: 'mapped', label: 'Mapped', color: 'text-green-600 bg-green-100', icon: CheckCircle2 },
  { value: 'partial', label: 'Partial', color: 'text-yellow-600 bg-yellow-100', icon: AlertTriangle },
  { value: 'unmapped', label: 'Unmapped', color: 'text-red-600 bg-red-100', icon: XCircle },
  { value: 'conflicting', label: 'Conflicting', color: 'text-purple-600 bg-purple-100', icon: AlertTriangle },
  { value: 'validating', label: 'Validating', color: 'text-blue-600 bg-blue-100', icon: Clock }
];

export const BusinessRuleMapper: React.FC<BusinessRuleMapperProps> = ({
  className,
  onRuleMapped,
  onRelationshipCreated,
  onValidationCompleted
}) => {
  // State Management
  const [viewState, setViewState] = useState<BusinessRuleViewState>(DEFAULT_VIEW_STATE);
  const [mapperState, setMapperState] = useState<BusinessRuleMapperState>({
    businessRules: [],
    scanRules: [],
    mappings: [],
    relationships: [],
    processes: [],
    hierarchies: [],
    translations: [],
    validations: [],
    metrics: {} as MappingMetrics,
    requirements: [],
    entities: [],
    policies: [],
    loading: false,
    error: null,
    lastUpdated: new Date(),
    totalMappings: 0,
    activeMappings: 0,
    validatedMappings: 0,
    businessProcesses: 0,
    ruleRelationships: 0,
    translationAccuracy: 0,
    coveragePercentage: 0,
    complianceScore: 0,
    effectivenessRating: 0,
    governanceCompliance: 0
  });

  const [mappingDialogOpen, setMappingDialogOpen] = useState(false);
  const [relationshipDialogOpen, setRelationshipDialogOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);

  // Form States
  const [mappingForm, setMappingForm] = useState({
    businessRuleId: '',
    scanRuleIds: [] as string[],
    mappingType: 'direct',
    confidence: 0.8,
    validationRequired: true,
    autoTranslate: true,
    tags: [] as string[],
    description: ''
  });

  const [relationshipForm, setRelationshipForm] = useState({
    sourceRuleId: '',
    targetRuleId: '',
    relationshipType: 'depends_on',
    strength: 0.8,
    bidirectional: false,
    description: ''
  });

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const mappingCanvasRef = useRef<HTMLCanvasElement>(null);

  // Custom Hooks
  const {
    getInsights,
    analyzePerformance,
    generatePredictions,
    loading: intelligenceLoading
  } = useIntelligence();

  const {
    scanRules,
    ruleSets,
    getRules,
    loading: rulesLoading
  } = useScanRules();

  const {
    generateReport,
    getAnalytics,
    loading: reportingLoading
  } = useReporting();

  // Initialize WebSocket Connection
  useEffect(() => {
    if (viewState.realTimeMapping) {
      wsRef.current = new WebSocket(`${process.env.REACT_APP_WS_URL}/business-rule-mapper`);
      
      wsRef.current.onopen = () => {
        console.log('Business Rule Mapper WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };

      wsRef.current.onerror = (error) => {
        console.error('Business Rule Mapper WebSocket error:', error);
      };

      wsRef.current.onclose = () => {
        console.log('Business Rule Mapper WebSocket disconnected');
      };
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [viewState.realTimeMapping]);

  // Handle WebSocket Messages
  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'mapping_created':
        setMapperState(prev => ({
          ...prev,
          mappings: [...prev.mappings, data.mapping],
          totalMappings: prev.totalMappings + 1,
          activeMappings: prev.activeMappings + 1
        }));
        if (onRuleMapped) onRuleMapped(data.mapping);
        break;
      case 'relationship_created':
        setMapperState(prev => ({
          ...prev,
          relationships: [...prev.relationships, data.relationship],
          ruleRelationships: prev.ruleRelationships + 1
        }));
        if (onRelationshipCreated) onRelationshipCreated(data.relationship);
        break;
      case 'validation_completed':
        setMapperState(prev => ({
          ...prev,
          validations: [...prev.validations, data.validation],
          validatedMappings: prev.validatedMappings + 1
        }));
        if (onValidationCompleted) onValidationCompleted(data.validation);
        break;
      case 'translation_generated':
        setMapperState(prev => ({
          ...prev,
          translations: [...prev.translations, data.translation]
        }));
        break;
      case 'metrics_updated':
        setMapperState(prev => ({
          ...prev,
          metrics: data.metrics,
          lastUpdated: new Date()
        }));
        break;
    }
  }, [onRuleMapped, onRelationshipCreated, onValidationCompleted]);

  // Data Loading
  const refreshData = useCallback(async () => {
    try {
      setMapperState(prev => ({ ...prev, loading: true, error: null }));

      const [businessRulesData, scanRulesData, mappingsData, relationshipsData, metricsData] = await Promise.all([
        intelligenceAPI.getBusinessRules({ category: viewState.filterCategory }),
        scanRulesAPI.getRules({ includeMetadata: true }),
        intelligenceAPI.getRuleMappings({ 
          status: viewState.filterStatus,
          priority: viewState.filterPriority,
          timeRange: viewState.selectedTimeRange
        }),
        intelligenceAPI.getRuleRelationships(),
        intelligenceAPI.getMappingMetrics()
      ]);

      setMapperState(prev => ({
        ...prev,
        businessRules: businessRulesData.rules,
        scanRules: scanRulesData.rules,
        mappings: mappingsData.mappings,
        relationships: relationshipsData.relationships,
        metrics: metricsData,
        totalMappings: mappingsData.total,
        activeMappings: mappingsData.mappings.filter(m => m.status === 'mapped').length,
        validatedMappings: mappingsData.mappings.filter(m => m.validated).length,
        ruleRelationships: relationshipsData.total,
        businessProcesses: businessRulesData.processes || 0,
        loading: false,
        lastUpdated: new Date()
      }));

      // Calculate derived metrics
      const coveragePercentage = businessRulesData.rules.length > 0 
        ? (mappingsData.mappings.length / businessRulesData.rules.length) * 100 
        : 0;

      const translationAccuracy = metricsData.averageAccuracy || 0;
      const complianceScore = metricsData.complianceScore || 0;
      const effectivenessRating = metricsData.effectivenessRating || 0;
      const governanceCompliance = metricsData.governanceCompliance || 0;

      setMapperState(prev => ({
        ...prev,
        coveragePercentage,
        translationAccuracy,
        complianceScore,
        effectivenessRating,
        governanceCompliance
      }));

    } catch (error) {
      console.error('Failed to refresh business rule mapper data:', error);
      setMapperState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load data'
      }));
    }
  }, [viewState.filterCategory, viewState.filterStatus, viewState.filterPriority, viewState.selectedTimeRange]);

  // Initial Data Load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Mapping Functions
  const createRuleMapping = useCallback(async () => {
    try {
      const mapping = await intelligenceAPI.createRuleMapping({
        businessRuleId: mappingForm.businessRuleId,
        scanRuleIds: mappingForm.scanRuleIds,
        mappingType: mappingForm.mappingType,
        confidence: mappingForm.confidence,
        validationRequired: mappingForm.validationRequired,
        autoTranslate: mappingForm.autoTranslate,
        tags: mappingForm.tags,
        description: mappingForm.description,
        mode: viewState.mappingMode
      });

      setMapperState(prev => ({
        ...prev,
        mappings: [...prev.mappings, mapping],
        totalMappings: prev.totalMappings + 1,
        activeMappings: prev.activeMappings + 1
      }));

      if (onRuleMapped) onRuleMapped(mapping);
      setMappingDialogOpen(false);

      // Auto-validate if enabled
      if (viewState.autoValidation) {
        await validateMapping(mapping.id);
      }

    } catch (error) {
      console.error('Failed to create rule mapping:', error);
    }
  }, [mappingForm, viewState.mappingMode, viewState.autoValidation, onRuleMapped]);

  const createRuleRelationship = useCallback(async () => {
    try {
      const relationship = await intelligenceAPI.createRuleRelationship({
        sourceRuleId: relationshipForm.sourceRuleId,
        targetRuleId: relationshipForm.targetRuleId,
        relationshipType: relationshipForm.relationshipType,
        strength: relationshipForm.strength,
        bidirectional: relationshipForm.bidirectional,
        description: relationshipForm.description
      });

      setMapperState(prev => ({
        ...prev,
        relationships: [...prev.relationships, relationship],
        ruleRelationships: prev.ruleRelationships + 1
      }));

      if (onRelationshipCreated) onRelationshipCreated(relationship);
      setRelationshipDialogOpen(false);

    } catch (error) {
      console.error('Failed to create rule relationship:', error);
    }
  }, [relationshipForm, onRelationshipCreated]);

  const validateMapping = useCallback(async (mappingId: string) => {
    try {
      const validation = await intelligenceAPI.validateMapping({
        mappingId: mappingId,
        validationLevel: viewState.validationLevel,
        includeCompliance: true,
        checkConflicts: true,
        validateTranslation: true
      });

      setMapperState(prev => ({
        ...prev,
        validations: [...prev.validations, validation],
        validatedMappings: prev.validatedMappings + 1
      }));

      if (onValidationCompleted) onValidationCompleted(validation);

    } catch (error) {
      console.error('Failed to validate mapping:', error);
    }
  }, [viewState.validationLevel, onValidationCompleted]);

  const generateRuleTranslation = useCallback(async (mappingId: string) => {
    try {
      const translation = await intelligenceAPI.generateRuleTranslation({
        mappingId: mappingId,
        includeBusinessContext: true,
        includeCompliance: true,
        language: 'business_natural'
      });

      setMapperState(prev => ({
        ...prev,
        translations: [...prev.translations, translation]
      }));

    } catch (error) {
      console.error('Failed to generate rule translation:', error);
    }
  }, []);

  const analyzeBusinessImpact = useCallback(async (businessRuleId: string) => {
    try {
      const impact = await intelligenceAPI.analyzeBusinessImpact({
        businessRuleId: businessRuleId,
        includeFinancial: true,
        includeOperational: true,
        includeCompliance: true,
        timeHorizon: '12months'
      });

      return impact;
    } catch (error) {
      console.error('Failed to analyze business impact:', error);
      return null;
    }
  }, []);

  const optimizeMappings = useCallback(async () => {
    try {
      const optimization = await intelligenceAPI.optimizeRuleMappings({
        mappingIds: mapperState.mappings.map(m => m.id),
        optimizationGoals: ['accuracy', 'coverage', 'efficiency'],
        includeAIRecommendations: true
      });

      // Apply optimization suggestions
      if (optimization.suggestions) {
        setMapperState(prev => ({
          ...prev,
          mappings: optimization.optimizedMappings,
          coveragePercentage: optimization.newCoverage,
          translationAccuracy: optimization.newAccuracy
        }));
      }

    } catch (error) {
      console.error('Failed to optimize mappings:', error);
    }
  }, [mapperState.mappings]);

  // Utility Functions
  const getStatusColor = useCallback((status: string) => {
    const statusConfig = MAPPING_STATUSES.find(s => s.value === status);
    return statusConfig ? statusConfig.color : 'text-gray-600 bg-gray-100';
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    const statusConfig = MAPPING_STATUSES.find(s => s.value === status);
    if (statusConfig) {
      const IconComponent = statusConfig.icon;
      return <IconComponent className="h-4 w-4" />;
    }
    return <Info className="h-4 w-4" />;
  }, []);

  const getPriorityColor = useCallback((priority: string) => {
    const priorityConfig = RULE_PRIORITIES.find(p => p.value === priority);
    return priorityConfig ? priorityConfig.color : 'text-gray-600 bg-gray-100';
  }, []);

  const getCategoryIcon = useCallback((category: string) => {
    const cat = BUSINESS_CATEGORIES.find(c => c.value === category);
    if (cat) {
      const IconComponent = cat.icon;
      return <IconComponent className="h-4 w-4" />;
    }
    return <Building2 className="h-4 w-4" />;
  }, []);

  const getCategoryColor = useCallback((category: string) => {
    const cat = BUSINESS_CATEGORIES.find(c => c.value === category);
    return cat ? cat.color : 'text-gray-600';
  }, []);

  // Filter Functions
  const filteredMappings = useMemo(() => {
    let filtered = mapperState.mappings;

    if (viewState.searchQuery) {
      filtered = filtered.filter(mapping => 
        mapping.businessRuleName?.toLowerCase().includes(viewState.searchQuery.toLowerCase()) ||
        mapping.description?.toLowerCase().includes(viewState.searchQuery.toLowerCase())
      );
    }

    if (viewState.filterStatus !== 'all') {
      filtered = filtered.filter(mapping => mapping.status === viewState.filterStatus);
    }

    if (viewState.filterPriority !== 'all') {
      filtered = filtered.filter(mapping => mapping.priority === viewState.filterPriority);
    }

    if (viewState.filterCategory !== 'all') {
      filtered = filtered.filter(mapping => mapping.category === viewState.filterCategory);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (viewState.sortBy) {
        case 'priority':
          aValue = RULE_PRIORITIES.findIndex(p => p.value === a.priority);
          bValue = RULE_PRIORITIES.findIndex(p => p.value === b.priority);
          break;
        case 'confidence':
          aValue = a.confidence || 0;
          bValue = b.confidence || 0;
          break;
        case 'created':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = RULE_PRIORITIES.findIndex(p => p.value === a.priority);
          bValue = RULE_PRIORITIES.findIndex(p => p.value === b.priority);
      }

      if (viewState.sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    return filtered;
  }, [mapperState.mappings, viewState.searchQuery, viewState.filterStatus, viewState.filterPriority, viewState.filterCategory, viewState.sortBy, viewState.sortOrder]);

  // Render Functions
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Mapping Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mappings</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mapperState.totalMappings}</div>
            <p className="text-xs text-muted-foreground">
              {mapperState.activeMappings} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {mapperState.coveragePercentage.toFixed(1)}%
            </div>
            <Progress value={mapperState.coveragePercentage} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Translation Accuracy</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(mapperState.translationAccuracy * 100).toFixed(1)}%
            </div>
            <Progress value={mapperState.translationAccuracy * 100} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {(mapperState.complianceScore * 100).toFixed(1)}%
            </div>
            <Progress value={mapperState.complianceScore * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Business Categories Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Business Categories Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {BUSINESS_CATEGORIES.map(category => {
              const count = filteredMappings.filter(m => m.category === category.value).length;
              const percentage = mapperState.totalMappings > 0 
                ? (count / mapperState.totalMappings) * 100 
                : 0;
              
              return (
                <div key={category.value} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <category.icon className={`h-5 w-5 ${category.color}`} />
                    <span className="text-sm font-medium">{category.label}</span>
                  </div>
                  <div className={`text-lg font-bold ${category.color}`}>{count}</div>
                  <Progress value={percentage} className="mt-2" />
                  <div className="text-xs text-gray-500 mt-1">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Mapping Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Mapping Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {MAPPING_STATUSES.map(status => {
              const count = filteredMappings.filter(m => m.status === status.value).length;
              const percentage = mapperState.totalMappings > 0 
                ? (count / mapperState.totalMappings) * 100 
                : 0;
              
              return (
                <div key={status.value} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <status.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{status.label}</span>
                  </div>
                  <div className="text-lg font-bold">{count}</div>
                  <Progress value={percentage} className="mt-2" />
                  <div className="text-xs text-gray-500 mt-1">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Mappings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Mappings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredMappings.slice(0, 5).map(mapping => (
              <div key={mapping.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getCategoryIcon(mapping.category)}
                  <div>
                    <div className="font-medium">{mapping.businessRuleName}</div>
                    <div className="text-sm text-gray-500">
                      {mapping.scanRuleCount} scan rules mapped
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(mapping.status)}
                    <Badge className={getStatusColor(mapping.status)}>
                      {mapping.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(mapping.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Effectiveness Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Effectiveness Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Overall Effectiveness</span>
                <span className="text-lg font-bold text-green-600">
                  {(mapperState.effectivenessRating * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={mapperState.effectivenessRating * 100} />
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Governance Compliance</span>
                <span className="text-lg font-bold text-blue-600">
                  {(mapperState.governanceCompliance * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={mapperState.governanceCompliance * 100} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-purple-600">
                    {mapperState.businessProcesses}
                  </div>
                  <div className="text-xs text-gray-500">Business Processes</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-600">
                    {mapperState.ruleRelationships}
                  </div>
                  <div className="text-xs text-gray-500">Rule Relationships</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-green-600">
                    {mapperState.validatedMappings}
                  </div>
                  <div className="text-xs text-gray-500">Validated Mappings</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">
                    {mapperState.translations.length}
                  </div>
                  <div className="text-xs text-gray-500">Translations</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderMappings = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Rule Mappings</h3>
        <div className="flex items-center gap-2">
          <Select
            value={viewState.mappingMode}
            onValueChange={(value) => setViewState(prev => ({ ...prev, mappingMode: value as any }))}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MAPPING_MODES.map(mode => (
                <SelectItem key={mode.value} value={mode.value}>
                  {mode.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMappingDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Mapping
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={optimizeMappings}
          >
            <Brain className="h-4 w-4 mr-2" />
            Optimize
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredMappings.map(mapping => (
          <Card key={mapping.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(mapping.category)}
                    <h4 className="font-medium">{mapping.businessRuleName}</h4>
                    <Badge className={getPriorityColor(mapping.priority)}>
                      {mapping.priority}
                    </Badge>
                    {getStatusIcon(mapping.status)}
                    <Badge className={getStatusColor(mapping.status)}>
                      {mapping.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{mapping.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{mapping.scanRuleCount} scan rules</span>
                    <span>Confidence: {(mapping.confidence * 100).toFixed(0)}%</span>
                    {mapping.validated && <span className="text-green-600">✓ Validated</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => validateMapping(mapping.id)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => generateRuleTranslation(mapping.id)}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Main Render
  return (
    <TooltipProvider>
      <div className={`h-full flex flex-col bg-gray-50 ${className}`}>
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold">Business Rule Mapper</h1>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  mapperState.coveragePercentage >= 80 ? 'bg-green-500' :
                  mapperState.coveragePercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-sm text-gray-600">
                  Coverage: {mapperState.coveragePercentage.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={viewState.mappingMode}
                onValueChange={(value) => setViewState(prev => ({ ...prev, mappingMode: value as any }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MAPPING_MODES.map(mode => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={mapperState.loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${mapperState.loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Switch
                checked={viewState.realTimeMapping}
                onCheckedChange={(checked) => setViewState(prev => ({ ...prev, realTimeMapping: checked }))}
              />
              <span className="text-sm text-gray-600">Real-time</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Tabs value={viewState.currentView} onValueChange={(value) => setViewState(prev => ({ ...prev, currentView: value as any }))}>
            <div className="border-b bg-white">
              <TabsList className="h-12 p-1 bg-transparent">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="mappings" className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Mappings
                </TabsTrigger>
                <TabsTrigger value="relationships" className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  Relationships
                </TabsTrigger>
                <TabsTrigger value="processes" className="flex items-center gap-2">
                  <Workflow className="h-4 w-4" />
                  Processes
                </TabsTrigger>
                <TabsTrigger value="validation" className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Validation
                </TabsTrigger>
                <TabsTrigger value="governance" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Governance
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="overview">
                {renderOverview()}
              </TabsContent>
              <TabsContent value="mappings">
                {renderMappings()}
              </TabsContent>
              <TabsContent value="relationships">
                <div>Rule Relationships Management (To be implemented)</div>
              </TabsContent>
              <TabsContent value="processes">
                <div>Business Process Mapping (To be implemented)</div>
              </TabsContent>
              <TabsContent value="validation">
                <div>Mapping Validation Dashboard (To be implemented)</div>
              </TabsContent>
              <TabsContent value="governance">
                <div>Rule Governance Framework (To be implemented)</div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Mapping Dialog */}
        <Dialog open={mappingDialogOpen} onOpenChange={setMappingDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Rule Mapping</DialogTitle>
              <DialogDescription>
                Map business rules to scan rules with AI assistance
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="business-rule">Business Rule</Label>
                <Select 
                  value={mappingForm.businessRuleId}
                  onValueChange={(value) => setMappingForm(prev => ({ ...prev, businessRuleId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select business rule" />
                  </SelectTrigger>
                  <SelectContent>
                    {mapperState.businessRules.map(rule => (
                      <SelectItem key={rule.id} value={rule.id}>
                        {rule.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="mapping-type">Mapping Type</Label>
                <Select 
                  value={mappingForm.mappingType}
                  onValueChange={(value) => setMappingForm(prev => ({ ...prev, mappingType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">Direct</SelectItem>
                    <SelectItem value="indirect">Indirect</SelectItem>
                    <SelectItem value="conditional">Conditional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  value={mappingForm.description}
                  onChange={(e) => setMappingForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the mapping relationship..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setMappingDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={createRuleMapping}
                  disabled={!mappingForm.businessRuleId}
                >
                  Create Mapping
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default BusinessRuleMapper;