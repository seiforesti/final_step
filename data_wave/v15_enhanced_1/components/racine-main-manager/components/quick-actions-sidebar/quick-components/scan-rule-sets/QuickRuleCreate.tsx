/**
 * Quick Rule Create Component
 * ===========================
 * 
 * Enterprise-grade quick access component for creating scan rules.
 * Integrates with existing Advanced-Scan-Rule-Sets SPA without recreation.
 * Provides streamlined rule creation workflow with advanced features.
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Save, 
  Copy, 
  Settings, 
  Search, 
  Filter, 
  Database, 
  FileText, 
  Target, 
  Zap,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  Code,
  Eye,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Minus,
  Edit,
  Trash2,
  HelpCircle,
  Lightbulb,
  GitBranch,
  Users,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Import types and services from the established foundation
import type { 
  ScanRule, 
  ScanRuleType, 
  ScanRuleTarget, 
  ScanRuleCondition,
  ScanRuleAction,
  ScanRuleTemplate,
  ScanRuleValidation,
  DataPattern,
  ComplianceStandard,
  SecurityClassification,
  RulePerformanceMetrics
} from '../../../types/racine-core.types';

import { useScanRuleSets } from '../../../hooks/useScanRuleSets';
import { useWorkspaceManagement } from '../../../hooks/useWorkspaceManagement';
import { useUserManagement } from '../../../hooks/useUserManagement';
import { useAIAssistant } from '../../../hooks/useAIAssistant';
import { useCrossGroupIntegration } from '../../../hooks/useCrossGroupIntegration';

// Component props interface
interface QuickRuleCreateProps {
  isVisible?: boolean;
  onClose?: () => void;
  initialTemplate?: ScanRuleTemplate;
  contextData?: {
    sourceType?: string;
    targetAssets?: string[];
    suggestedPatterns?: DataPattern[];
  };
  onRuleCreated?: (rule: ScanRule) => void;
  className?: string;
}

// Rule creation form data interface
interface RuleFormData {
  name: string;
  description: string;
  type: ScanRuleType;
  targets: ScanRuleTarget[];
  conditions: ScanRuleCondition[];
  actions: ScanRuleAction[];
  enabled: boolean;
  priority: number;
  schedule?: string;
  tags: string[];
  complianceStandards: ComplianceStandard[];
  securityClassification: SecurityClassification;
  metadata: Record<string, any>;
}

// Animation variants
const slideInVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 }
};

const staggerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

/**
 * QuickRuleCreate Component
 * 
 * Advanced quick component for creating scan rules with:
 * - Template-based rule creation
 * - AI-powered rule suggestions
 * - Real-time validation
 * - Integration with existing SPA
 * - Advanced pattern matching
 * - Compliance integration
 */
export const QuickRuleCreate: React.FC<QuickRuleCreateProps> = ({
  isVisible = true,
  onClose,
  initialTemplate,
  contextData,
  onRuleCreated,
  className = ''
}) => {
  // Hooks for data management and integration
  const {
    createRule,
    validateRule,
    getRuleTemplates,
    getPatternSuggestions,
    isLoading,
    error,
    ruleTemplates,
    validationResults
  } = useScanRuleSets();

  const { currentWorkspace } = useWorkspaceManagement();
  const { currentUser, userPermissions } = useUserManagement();
  const { getRuleSuggestions, analyzePattern } = useAIAssistant();
  const { getDataSourceTypes, getComplianceRequirements } = useCrossGroupIntegration();

  // Component state
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<RuleFormData>({
    name: '',
    description: '',
    type: 'data_discovery',
    targets: [],
    conditions: [],
    actions: [],
    enabled: true,
    priority: 50,
    tags: [],
    complianceStandards: [],
    securityClassification: 'public',
    metadata: {}
  });

  const [selectedTemplate, setSelectedTemplate] = useState<ScanRuleTemplate | null>(initialTemplate || null);
  const [validating, setValidating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Memoized computed values
  const canCreate = useMemo(() => {
    return userPermissions?.includes('scan_rules:create') && 
           formData.name.length >= 3 && 
           formData.targets.length > 0;
  }, [userPermissions, formData.name, formData.targets]);

  const completionProgress = useMemo(() => {
    const requiredFields = ['name', 'type', 'targets', 'conditions'];
    const completedFields = requiredFields.filter(field => {
      const value = formData[field as keyof RuleFormData];
      return Array.isArray(value) ? value.length > 0 : Boolean(value);
    });
    return (completedFields.length / requiredFields.length) * 100;
  }, [formData]);

  // Initialize component
  useEffect(() => {
    if (isVisible) {
      // Load templates and suggestions
      getRuleTemplates();
      
      // Load AI suggestions if context provided
      if (contextData) {
        loadAISuggestions();
      }
    }
  }, [isVisible, contextData]);

  // Load AI-powered suggestions
  const loadAISuggestions = useCallback(async () => {
    if (!contextData) return;
    
    try {
      const suggestions = await getRuleSuggestions({
        sourceType: contextData.sourceType,
        targetAssets: contextData.targetAssets,
        patterns: contextData.suggestedPatterns
      });
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to load AI suggestions:', error);
    }
  }, [contextData, getRuleSuggestions]);

  // Handle template selection
  const handleTemplateSelect = useCallback((template: ScanRuleTemplate) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      type: template.type,
      targets: template.defaultTargets || [],
      conditions: template.defaultConditions || [],
      actions: template.defaultActions || [],
      tags: template.tags || [],
      complianceStandards: template.complianceStandards || []
    }));
    toast.success(`Template "${template.name}" applied`);
  }, []);

  // Handle form field updates
  const updateFormData = useCallback((field: keyof RuleFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handle target addition
  const addTarget = useCallback(() => {
    const newTarget: ScanRuleTarget = {
      id: `target_${Date.now()}`,
      type: 'table',
      pattern: '',
      includeSubItems: true,
      filters: {}
    };
    
    updateFormData('targets', [...formData.targets, newTarget]);
  }, [formData.targets, updateFormData]);

  // Handle condition addition
  const addCondition = useCallback(() => {
    const newCondition: ScanRuleCondition = {
      id: `condition_${Date.now()}`,
      type: 'pattern_match',
      field: '',
      operator: 'contains',
      value: '',
      caseSensitive: false
    };
    
    updateFormData('conditions', [...formData.conditions, newCondition]);
  }, [formData.conditions, updateFormData]);

  // Handle action addition
  const addAction = useCallback(() => {
    const newAction: ScanRuleAction = {
      id: `action_${Date.now()}`,
      type: 'classify',
      configuration: {}
    };
    
    updateFormData('actions', [...formData.actions, newAction]);
  }, [formData.actions, updateFormData]);

  // Validate rule in real-time
  const handleValidation = useCallback(async () => {
    if (!canCreate) return;
    
    setValidating(true);
    try {
      await validateRule(formData);
      toast.success('Rule validation passed');
    } catch (error) {
      toast.error('Rule validation failed');
    } finally {
      setValidating(false);
    }
  }, [formData, canCreate, validateRule]);

  // Handle rule creation
  const handleCreateRule = useCallback(async () => {
    if (!canCreate) return;
    
    try {
      const newRule = await createRule({
        ...formData,
        workspaceId: currentWorkspace?.id,
        createdBy: currentUser?.id,
        createdAt: new Date()
      });
      
      toast.success(`Rule "${newRule.name}" created successfully`);
      onRuleCreated?.(newRule);
      onClose?.();
    } catch (error) {
      toast.error('Failed to create rule');
      console.error('Rule creation error:', error);
    }
  }, [formData, canCreate, createRule, currentWorkspace, currentUser, onRuleCreated, onClose]);

  // Handle rule preview
  const handlePreview = useCallback(() => {
    setShowPreview(true);
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={slideInVariants}
      className={`quick-rule-create ${className}`}
    >
      <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Plus className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Quick Rule Create
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Create advanced scan rules with AI assistance
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {completionProgress.toFixed(0)}% Complete
              </Badge>
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  ×
                </Button>
              )}
            </div>
          </div>
          
          {/* Progress indicator */}
          <div className="mt-4">
            <Progress value={completionProgress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="p-6 space-y-6">
              
              {/* Error display */}
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* AI Suggestions */}
              {aiSuggestions.length > 0 && (
                <motion.div
                  variants={staggerVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">
                      AI Suggestions
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {aiSuggestions.slice(0, 3).map((suggestion, index) => (
                      <motion.div
                        key={index}
                        variants={slideInVariants}
                        className="p-3 bg-white/60 rounded-md cursor-pointer hover:bg-white/80 transition-colors"
                        onClick={() => handleTemplateSelect(suggestion)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            {suggestion.name}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {suggestion.confidence}% match
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {suggestion.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Rule Templates */}
              {ruleTemplates && ruleTemplates.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Quick Templates
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {ruleTemplates.slice(0, 4).map((template) => (
                      <Button
                        key={template.id}
                        variant="outline"
                        size="sm"
                        className="h-auto p-3 text-left"
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <div className="flex flex-col items-start">
                          <span className="text-xs font-medium truncate w-full">
                            {template.name}
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            {template.type}
                          </span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Form */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="basic" className="text-xs">Basic</TabsTrigger>
                  <TabsTrigger value="conditions" className="text-xs">Conditions</TabsTrigger>
                  <TabsTrigger value="advanced" className="text-xs">Advanced</TabsTrigger>
                </TabsList>

                {/* Basic Tab */}
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="ruleName" className="text-sm font-medium">
                        Rule Name *
                      </Label>
                      <Input
                        id="ruleName"
                        value={formData.name}
                        onChange={(e) => updateFormData('name', e.target.value)}
                        placeholder="Enter rule name..."
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="ruleDescription" className="text-sm font-medium">
                        Description
                      </Label>
                      <Textarea
                        id="ruleDescription"
                        value={formData.description}
                        onChange={(e) => updateFormData('description', e.target.value)}
                        placeholder="Describe what this rule does..."
                        rows={3}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Rule Type *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => updateFormData('type', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="data_discovery">Data Discovery</SelectItem>
                          <SelectItem value="pii_detection">PII Detection</SelectItem>
                          <SelectItem value="data_quality">Data Quality</SelectItem>
                          <SelectItem value="compliance_check">Compliance Check</SelectItem>
                          <SelectItem value="security_scan">Security Scan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Rule Priority</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{formData.priority}</span>
                        <Input
                          type="range"
                          min="1"
                          max="100"
                          value={formData.priority}
                          onChange={(e) => updateFormData('priority', parseInt(e.target.value))}
                          className="w-20"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Enable Rule</Label>
                      <Switch
                        checked={formData.enabled}
                        onCheckedChange={(checked) => updateFormData('enabled', checked)}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Conditions Tab */}
                <TabsContent value="conditions" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Scan Targets *</Label>
                      <Button size="sm" variant="outline" onClick={addTarget}>
                        <Plus className="h-3 w-3 mr-1" />
                        Add Target
                      </Button>
                    </div>
                    
                    {formData.targets.map((target, index) => (
                      <div key={target.id} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">Target {index + 1}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const newTargets = formData.targets.filter((_, i) => i !== index);
                              updateFormData('targets', newTargets);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <Select
                          value={target.type}
                          onValueChange={(value) => {
                            const newTargets = [...formData.targets];
                            newTargets[index] = { ...target, type: value as any };
                            updateFormData('targets', newTargets);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="table">Table</SelectItem>
                            <SelectItem value="column">Column</SelectItem>
                            <SelectItem value="database">Database</SelectItem>
                            <SelectItem value="schema">Schema</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          value={target.pattern}
                          onChange={(e) => {
                            const newTargets = [...formData.targets];
                            newTargets[index] = { ...target, pattern: e.target.value };
                            updateFormData('targets', newTargets);
                          }}
                          placeholder="Enter pattern (e.g., *.customer_*)"
                        />
                      </div>
                    ))}

                    <Separator />

                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Conditions</Label>
                      <Button size="sm" variant="outline" onClick={addCondition}>
                        <Plus className="h-3 w-3 mr-1" />
                        Add Condition
                      </Button>
                    </div>

                    {formData.conditions.map((condition, index) => (
                      <div key={condition.id} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">Condition {index + 1}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const newConditions = formData.conditions.filter((_, i) => i !== index);
                              updateFormData('conditions', newConditions);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            value={condition.type}
                            onValueChange={(value) => {
                              const newConditions = [...formData.conditions];
                              newConditions[index] = { ...condition, type: value as any };
                              updateFormData('conditions', newConditions);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pattern_match">Pattern Match</SelectItem>
                              <SelectItem value="data_type">Data Type</SelectItem>
                              <SelectItem value="value_range">Value Range</SelectItem>
                              <SelectItem value="null_check">Null Check</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            value={condition.field}
                            onChange={(e) => {
                              const newConditions = [...formData.conditions];
                              newConditions[index] = { ...condition, field: e.target.value };
                              updateFormData('conditions', newConditions);
                            }}
                            placeholder="Field name"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            value={condition.operator}
                            onValueChange={(value) => {
                              const newConditions = [...formData.conditions];
                              newConditions[index] = { ...condition, operator: value as any };
                              updateFormData('conditions', newConditions);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="contains">Contains</SelectItem>
                              <SelectItem value="equals">Equals</SelectItem>
                              <SelectItem value="starts_with">Starts With</SelectItem>
                              <SelectItem value="ends_with">Ends With</SelectItem>
                              <SelectItem value="regex">Regex</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            value={condition.value}
                            onChange={(e) => {
                              const newConditions = [...formData.conditions];
                              newConditions[index] = { ...condition, value: e.target.value };
                              updateFormData('conditions', newConditions);
                            }}
                            placeholder="Value"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Advanced Tab */}
                <TabsContent value="advanced" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Actions</Label>
                      <Button size="sm" variant="outline" onClick={addAction}>
                        <Plus className="h-3 w-3 mr-1" />
                        Add Action
                      </Button>
                    </div>

                    {formData.actions.map((action, index) => (
                      <div key={action.id} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">Action {index + 1}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const newActions = formData.actions.filter((_, i) => i !== index);
                              updateFormData('actions', newActions);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <Select
                          value={action.type}
                          onValueChange={(value) => {
                            const newActions = [...formData.actions];
                            newActions[index] = { ...action, type: value as any };
                            updateFormData('actions', newActions);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="classify">Classify Data</SelectItem>
                            <SelectItem value="tag">Add Tags</SelectItem>
                            <SelectItem value="alert">Send Alert</SelectItem>
                            <SelectItem value="quarantine">Quarantine</SelectItem>
                            <SelectItem value="log">Log Event</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}

                    <Separator />

                    <div>
                      <Label className="text-sm font-medium">Tags</Label>
                      <Input
                        value={formData.tags.join(', ')}
                        onChange={(e) => {
                          const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                          updateFormData('tags', tags);
                        }}
                        placeholder="Enter tags separated by commas"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Security Classification</Label>
                      <Select
                        value={formData.securityClassification}
                        onValueChange={(value) => updateFormData('securityClassification', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="internal">Internal</SelectItem>
                          <SelectItem value="confidential">Confidential</SelectItem>
                          <SelectItem value="restricted">Restricted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex gap-2">
                  <Button
                    onClick={handleValidation}
                    variant="outline"
                    size="sm"
                    disabled={!canCreate || validating}
                    className="flex-1"
                  >
                    {validating ? (
                      <>
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Validate
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handlePreview}
                    variant="outline"
                    size="sm"
                    disabled={!canCreate}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                </div>
                
                <Button
                  onClick={handleCreateRule}
                  disabled={!canCreate || isLoading}
                  className="w-full"
                  size="sm"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-3 w-3 mr-1" />
                      Create Rule
                    </>
                  )}
                </Button>
              </div>

              {/* Performance Metrics */}
              {validationResults && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">
                      Validation Results
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Performance Score:</span>
                      <span className="font-medium text-green-600">
                        {validationResults.performanceScore}/100
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Est. Runtime:</span>
                      <span className="font-medium">
                        {validationResults.estimatedRuntime}ms
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuickRuleCreate;