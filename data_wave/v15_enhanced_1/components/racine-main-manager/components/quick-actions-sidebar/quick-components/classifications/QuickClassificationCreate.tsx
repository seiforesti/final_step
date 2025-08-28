/**
 * Quick Classification Create Component
 * ====================================
 * 
 * Enterprise-grade quick access component for creating data classifications.
 * Integrates with existing classifications SPA without recreation.
 * Provides streamlined classification creation with AI assistance.
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tag, Save, Sparkles, Target, Shield, Eye, Lock, CheckCircle, AlertTriangle, Clock, BarChart3, FileText, Search, RefreshCw, Plus, Minus, Edit, Trash2, HelpCircle, Lightbulb, Database, Users, Settings, Star, Crown, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Import types and services
import type { 
  Classification, 
  ClassificationType, 
  ClassificationLevel, 
  ClassificationRule,
  DataSensitivity,
  ComplianceStandard,
  ClassificationTemplate
} from '../../../../types/racine-core.types';

import { useClassifications } from '../../../../hooks/useClassifications';
import { useWorkspaceManagement } from '../hooks/optimized/useOptimizedWorkspaceManagement';
import { useUserManagement } from '../hooks/optimized/useOptimizedUserManagement';
import { useAIAssistant } from '../../../../hooks/useAIAssistant';

interface QuickClassificationCreateProps {
  isVisible?: boolean;
  onClose?: () => void;
  initialTemplate?: ClassificationTemplate;
  suggestedType?: ClassificationType;
  onClassificationCreated?: (classification: Classification) => void;
  className?: string;
}

interface ClassificationFormData {
  name: string;
  description: string;
  type: ClassificationType;
  level: ClassificationLevel;
  sensitivity: DataSensitivity;
  rules: ClassificationRule[];
  complianceStandards: ComplianceStandard[];
  retentionPeriod?: number;
  accessControls: {
    readRoles: string[];
    writeRoles: string[];
    adminRoles: string[];
  };
  tags: string[];
  autoApply: boolean;
  metadata: Record<string, any>;
}

export const QuickClassificationCreate: React.FC<QuickClassificationCreateProps> = ({
  isVisible = true,
  onClose,
  initialTemplate,
  suggestedType,
  onClassificationCreated,
  className = ''
}) => {
  // Hooks
  const {
    createClassification,
    validateClassification,
    getClassificationTemplates,
    getClassificationSuggestions,
    isLoading,
    error,
    templates
  } = useClassifications();

  const { currentWorkspace } = useWorkspaceManagement();
  const { currentUser, userPermissions } = useUserManagement();
  const { getClassificationSuggestions: getAISuggestions } = useAIAssistant();

  // State
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<ClassificationFormData>({
    name: '',
    description: '',
    type: suggestedType || 'pii',
    level: 'medium',
    sensitivity: 'internal',
    rules: [],
    complianceStandards: [],
    accessControls: {
      readRoles: [],
      writeRoles: [],
      adminRoles: []
    },
    tags: [],
    autoApply: false,
    metadata: {}
  });

  const [selectedTemplate, setSelectedTemplate] = useState<ClassificationTemplate | null>(initialTemplate || null);
  const [validating, setValidating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  // Memoized computed values
  const canCreate = useMemo(() => {
    return userPermissions?.includes('classifications:create') && 
           formData.name.length >= 3 && 
           formData.rules.length > 0;
  }, [userPermissions, formData.name, formData.rules]);

  const completionProgress = useMemo(() => {
    const requiredFields = ['name', 'type', 'level', 'sensitivity', 'rules'];
    const completedFields = requiredFields.filter(field => {
      const value = formData[field as keyof ClassificationFormData];
      return Array.isArray(value) ? value.length > 0 : Boolean(value);
    });
    return (completedFields.length / requiredFields.length) * 100;
  }, [formData]);

  // Load templates and suggestions
  useEffect(() => {
    if (isVisible) {
      getClassificationTemplates();
      if (suggestedType) {
        loadAISuggestions();
      }
    }
  }, [isVisible, suggestedType]);

  const loadAISuggestions = useCallback(async () => {
    try {
      const suggestions = await getAISuggestions({
        type: suggestedType,
        context: 'quick_create'
      });
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to load AI suggestions:', error);
    }
  }, [suggestedType, getAISuggestions]);

  // Handle template selection
  const handleTemplateSelect = useCallback((template: ClassificationTemplate) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      type: template.type,
      level: template.level,
      sensitivity: template.sensitivity,
      rules: template.defaultRules || [],
      complianceStandards: template.complianceStandards || [],
      tags: template.tags || []
    }));
    toast.success(`Template "${template.name}" applied`);
  }, []);

  // Handle form updates
  const updateFormData = useCallback((field: keyof ClassificationFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handle rule addition
  const addRule = useCallback(() => {
    const newRule: ClassificationRule = {
      id: `rule_${Date.now()}`,
      type: 'pattern_match',
      pattern: '',
      confidence: 0.8,
      conditions: []
    };
    
    updateFormData('rules', [...formData.rules, newRule]);
  }, [formData.rules, updateFormData]);

  // Handle validation
  const handleValidation = useCallback(async () => {
    if (!canCreate) return;
    
    setValidating(true);
    try {
      await validateClassification(formData);
      toast.success('Classification validation passed');
    } catch (error) {
      toast.error('Classification validation failed');
    } finally {
      setValidating(false);
    }
  }, [formData, canCreate, validateClassification]);

  // Handle creation
  const handleCreateClassification = useCallback(async () => {
    if (!canCreate) return;
    
    try {
      const newClassification = await createClassification({
        ...formData,
        workspaceId: currentWorkspace?.id,
        createdBy: currentUser?.id,
        createdAt: new Date()
      });
      
      toast.success(`Classification "${newClassification.name}" created successfully`);
      onClassificationCreated?.(newClassification);
      onClose?.();
    } catch (error) {
      toast.error('Failed to create classification');
      console.error('Classification creation error:', error);
    }
  }, [formData, canCreate, createClassification, currentWorkspace, currentUser, onClassificationCreated, onClose]);

  // Get level color
  const getLevelColor = useCallback((level: ClassificationLevel) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  // Get sensitivity icon
  const getSensitivityIcon = useCallback((sensitivity: DataSensitivity) => {
    switch (sensitivity) {
      case 'public': return Eye;
      case 'internal': return Users;
      case 'confidential': return Shield;
      case 'restricted': return Lock;
      default: return FileText;
    }
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`quick-classification-create ${className}`}
    >
      <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-purple-50/50 to-pink-50/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Tag className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Quick Classification Create
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Create data classifications with AI assistance
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">
                      AI Classification Suggestions
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {aiSuggestions.slice(0, 3).map((suggestion, index) => (
                      <motion.div
                        key={index}
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

              {/* Templates */}
              {templates && templates.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Classification Templates
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {templates.slice(0, 4).map((template) => (
                      <Button
                        key={template.id}
                        variant="outline"
                        size="sm"
                        className="h-auto p-3 text-left"
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <div className="flex flex-col items-start w-full">
                          <div className="flex items-center gap-2 w-full">
                            <span className="text-xs font-medium truncate flex-1">
                              {template.name}
                            </span>
                            <Badge className={`text-xs ${getLevelColor(template.level)}`}>
                              {template.level}
                            </Badge>
                          </div>
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
                  <TabsTrigger value="rules" className="text-xs">Rules</TabsTrigger>
                  <TabsTrigger value="access" className="text-xs">Access</TabsTrigger>
                </TabsList>

                {/* Basic Tab */}
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="classificationName" className="text-sm font-medium">
                        Classification Name *
                      </Label>
                      <Input
                        id="classificationName"
                        value={formData.name}
                        onChange={(e) => updateFormData('name', e.target.value)}
                        placeholder="Enter classification name..."
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="classificationDescription" className="text-sm font-medium">
                        Description
                      </Label>
                      <Textarea
                        id="classificationDescription"
                        value={formData.description}
                        onChange={(e) => updateFormData('description', e.target.value)}
                        placeholder="Describe this classification..."
                        rows={3}
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm font-medium">Classification Type *</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) => updateFormData('type', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pii">PII Data</SelectItem>
                            <SelectItem value="financial">Financial Data</SelectItem>
                            <SelectItem value="health">Health Data</SelectItem>
                            <SelectItem value="intellectual_property">IP Data</SelectItem>
                            <SelectItem value="operational">Operational Data</SelectItem>
                            <SelectItem value="public">Public Data</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Classification Level *</Label>
                        <Select
                          value={formData.level}
                          onValueChange={(value) => updateFormData('level', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Data Sensitivity</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {['public', 'internal', 'confidential', 'restricted'].map((sensitivity) => {
                          const SensitivityIcon = getSensitivityIcon(sensitivity as DataSensitivity);
                          return (
                            <Button
                              key={sensitivity}
                              variant={formData.sensitivity === sensitivity ? 'default' : 'outline'}
                              size="sm"
                              className="h-auto p-3"
                              onClick={() => updateFormData('sensitivity', sensitivity)}
                            >
                              <div className="flex flex-col items-center gap-1">
                                <SensitivityIcon className="h-4 w-4" />
                                <span className="text-xs capitalize">{sensitivity}</span>
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Retention Period (days)</Label>
                      <Input
                        type="number"
                        value={formData.retentionPeriod || ''}
                        onChange={(e) => updateFormData('retentionPeriod', parseInt(e.target.value) || undefined)}
                        placeholder="Optional retention period..."
                        className="mt-1"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Auto-apply Classification</Label>
                      <Switch
                        checked={formData.autoApply}
                        onCheckedChange={(checked) => updateFormData('autoApply', checked)}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Rules Tab */}
                <TabsContent value="rules" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Classification Rules *</Label>
                      <Button size="sm" variant="outline" onClick={addRule}>
                        <Plus className="h-3 w-3 mr-1" />
                        Add Rule
                      </Button>
                    </div>

                    {formData.rules.map((rule, index) => (
                      <div key={rule.id} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">Rule {index + 1}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const newRules = formData.rules.filter((_, i) => i !== index);
                              updateFormData('rules', newRules);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            value={rule.type}
                            onValueChange={(value) => {
                              const newRules = [...formData.rules];
                              newRules[index] = { ...rule, type: value as any };
                              updateFormData('rules', newRules);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pattern_match">Pattern Match</SelectItem>
                              <SelectItem value="keyword">Keyword</SelectItem>
                              <SelectItem value="regex">Regular Expression</SelectItem>
                              <SelectItem value="data_type">Data Type</SelectItem>
                              <SelectItem value="metadata">Metadata</SelectItem>
                            </SelectContent>
                          </Select>

                          <Input
                            value={rule.pattern}
                            onChange={(e) => {
                              const newRules = [...formData.rules];
                              newRules[index] = { ...rule, pattern: e.target.value };
                              updateFormData('rules', newRules);
                            }}
                            placeholder="Pattern or expression"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Confidence Threshold</Label>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{(rule.confidence * 100).toFixed(0)}%</span>
                            <Input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={rule.confidence}
                              onChange={(e) => {
                                const newRules = [...formData.rules];
                                newRules[index] = { ...rule, confidence: parseFloat(e.target.value) };
                                updateFormData('rules', newRules);
                              }}
                              className="w-20"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {formData.rules.length === 0 && (
                      <div className="text-center py-6 text-gray-500 border-2 border-dashed rounded-lg">
                        <Target className="h-6 w-6 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No classification rules defined</p>
                        <p className="text-xs">Add rules to automatically classify data</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Access Tab */}
                <TabsContent value="access" className="space-y-4 mt-4">
                  <div className="space-y-3">
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
                      <Label className="text-sm font-medium">Compliance Standards</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {['GDPR', 'HIPAA', 'SOX', 'PCI-DSS', 'CCPA', 'ISO27001'].map((standard) => {
                          const isSelected = formData.complianceStandards.includes(standard as ComplianceStandard);
                          return (
                            <Button
                              key={standard}
                              variant={isSelected ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => {
                                const standards = isSelected
                                  ? formData.complianceStandards.filter(s => s !== standard)
                                  : [...formData.complianceStandards, standard as ComplianceStandard];
                                updateFormData('complianceStandards', standards);
                              }}
                            >
                              <span className="text-xs">{standard}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Access Control Summary</Label>
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-600">Read Access:</span>
                            <span className="ml-1 font-medium">Workspace Members</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Write Access:</span>
                            <span className="ml-1 font-medium">Data Stewards</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Admin Access:</span>
                            <span className="ml-1 font-medium">Data Governance Team</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Sensitivity:</span>
                            <span className="ml-1 font-medium capitalize">{formData.sensitivity}</span>
                          </div>
                        </div>
                      </div>
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
                    onClick={() => setShowPreview(true)}
                    variant="outline"
                    size="sm"
                    disabled={!canCreate}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                </div>
                
                <Button
                  onClick={handleCreateClassification}
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
                      Create Classification
                    </>
                  )}
                </Button>
              </div>

              {/* Preview */}
              {selectedTemplate && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Template Applied: {selectedTemplate.name}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{selectedTemplate.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Level:</span>
                      <Badge className={`text-xs ${getLevelColor(selectedTemplate.level)}`}>
                        {selectedTemplate.level}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rules:</span>
                      <span className="font-medium">{selectedTemplate.defaultRules?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Standards:</span>
                      <span className="font-medium">{selectedTemplate.complianceStandards?.length || 0}</span>
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

export default QuickClassificationCreate;