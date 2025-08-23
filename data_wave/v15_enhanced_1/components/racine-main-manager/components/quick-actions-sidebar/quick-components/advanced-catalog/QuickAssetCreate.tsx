'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Plus, X, Upload, FileText, Database, Table, BarChart3, GitBranch, Brain, Network, Layers, Zap, Sparkles, Wand2, Target, Tag, User, Users, Clock, Calendar, MapPin, Globe, Shield, Lock, Unlock, Eye, EyeOff, CheckCircle, AlertCircle, Info, HelpCircle, Settings, Save, RefreshCw, Download, Share, Copy, Edit, Trash, Star, Heart, Bookmark, Flag, Search, Filter, Grid, List, ChevronDown, ChevronRight, ArrowRight, ExternalLink, Link, Unlink, PlusCircle, MinusCircle, Check, AlertTriangle, TrendingUp, Activity, Gauge,  } from 'lucide-react';

// Import hooks and services
import { useAdvancedCatalog } from '../../../../hooks/useAdvancedCatalog';
import { useWorkspaceManagement } from '../../../../hooks/useWorkspaceManagement';
import { useUserManagement } from '../../../../hooks/useUserManagement';
import { useAIAssistant } from '../../../../hooks/useAIAssistant';
import { useCrossGroupIntegration } from '../../../../hooks/useCrossGroupIntegration';
import { useActivityTracking } from '../../../../hooks/useActivityTracking';

// Import types
import {
  CatalogAsset,
  AssetType,
  AssetCategory,
  AssetTemplate,
  AssetMetadata,
  AssetSchema,
  AssetValidation,
  DataLineage,
} from '../../../types/racine-core.types';

interface QuickAssetCreateProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

interface AssetConfiguration {
  name: string;
  description: string;
  type: AssetType;
  category: AssetCategory;
  template?: string;
  metadata: {
    tags: string[];
    owner: string;
    department: string;
    classification: string;
    sensitivity: string;
    compliance: string[];
    customFields: Record<string, any>;
  };
  schema?: AssetSchema;
  connections: {
    source?: string;
    dependencies: string[];
    outputs: string[];
  };
  settings: {
    autoClassify: boolean;
    enableLineage: boolean;
    autoGenerate: boolean;
    validateSchema: boolean;
    requireApproval: boolean;
  };
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  completeness: number;
}

const QuickAssetCreate: React.FC<QuickAssetCreateProps> = ({
  isVisible,
  onClose,
  className = '',
}) => {
  // State management
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [assetConfig, setAssetConfig] = useState<AssetConfiguration>({
    name: '',
    description: '',
    type: 'table',
    category: 'analytics',
    metadata: {
      tags: [],
      owner: '',
      department: '',
      classification: 'internal',
      sensitivity: 'medium',
      compliance: [],
      customFields: {},
    },
    connections: {
      dependencies: [],
      outputs: [],
    },
    settings: {
      autoClassify: true,
      enableLineage: true,
      autoGenerate: false,
      validateSchema: true,
      requireApproval: false,
    },
  });
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [availableTemplates, setAvailableTemplates] = useState<AssetTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<AssetTemplate | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [customTagInput, setCustomTagInput] = useState('');

  // Hooks
  const {
    createAsset,
    getAssetTemplates,
    validateAssetConfig,
    generateAssetMetadata,
    previewAsset,
    loading: catalogLoading,
    error: catalogError,
  } = useAdvancedCatalog();

  const { currentWorkspace, workspaceUsers } = useWorkspaceManagement();
  const { currentUser, hasPermission } = useUserManagement();
  const { generateSuggestions, enhanceDescription } = useAIAssistant();
  const { getDataSources, getClassifications } = useCrossGroupIntegration();
  const { trackActivity } = useActivityTracking();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerChildren = {
    visible: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  // Computed values
  const assetTypeIcons = {
    table: Database,
    view: Table,
    dashboard: BarChart3,
    report: FileText,
    dataset: Layers,
    pipeline: GitBranch,
    model: Brain,
    api: Network,
  };

  const canCreateAsset = useMemo(() => {
    return hasPermission('catalog:create_assets') && currentWorkspace;
  }, [hasPermission, currentWorkspace]);

  const formCompleteness = useMemo(() => {
    const required = ['name', 'description', 'type', 'category'];
    const optional = ['owner', 'department', 'tags'];
    
    const requiredComplete = required.filter(field => {
      if (field === 'name') return assetConfig.name.length > 0;
      if (field === 'description') return assetConfig.description.length > 0;
      if (field === 'type') return assetConfig.type;
      if (field === 'category') return assetConfig.category;
      return false;
    });
    
    const optionalComplete = optional.filter(field => {
      if (field === 'owner') return assetConfig.metadata.owner.length > 0;
      if (field === 'department') return assetConfig.metadata.department.length > 0;
      if (field === 'tags') return assetConfig.metadata.tags.length > 0;
      return false;
    });
    
    return Math.round(((requiredComplete.length * 2 + optionalComplete.length) / (required.length * 2 + optional.length)) * 100);
  }, [assetConfig]);

  // Effects
  useEffect(() => {
    if (isVisible && currentUser) {
      trackActivity({
        action: 'quick_asset_create_opened',
        component: 'QuickAssetCreate',
        metadata: { workspace: currentWorkspace?.id },
      });
      loadTemplates();
      if (!assetConfig.metadata.owner) {
        handleConfigChange('metadata', {
          ...assetConfig.metadata,
          owner: currentUser.email,
        });
      }
    }
  }, [isVisible, currentUser, trackActivity, currentWorkspace]);

  useEffect(() => {
    if (assetConfig.name || assetConfig.description) {
      validateConfiguration();
      generateAISuggestions();
    }
  }, [assetConfig]);

  // Handlers
  const loadTemplates = useCallback(async () => {
    try {
      const templates = await getAssetTemplates({
        workspaceId: currentWorkspace?.id,
        category: assetConfig.category,
      });
      setAvailableTemplates(templates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  }, [getAssetTemplates, currentWorkspace, assetConfig.category]);

  const validateConfiguration = useCallback(async () => {
    try {
      const result = await validateAssetConfig(assetConfig);
      setValidation(result);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  }, [validateAssetConfig, assetConfig]);

  const generateAISuggestions = useCallback(async () => {
    if (!assetConfig.name && !assetConfig.description) return;

    try {
      const suggestions = await generateSuggestions({
        context: 'asset_creation',
        data: {
          name: assetConfig.name,
          description: assetConfig.description,
          type: assetConfig.type,
          category: assetConfig.category,
        },
      });
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error);
    }
  }, [generateSuggestions, assetConfig]);

  const handleConfigChange = useCallback((key: keyof AssetConfiguration, value: any) => {
    setAssetConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleMetadataChange = useCallback((key: string, value: any) => {
    setAssetConfig(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [key]: value,
      },
    }));
  }, []);

  const handleTemplateSelect = useCallback((template: AssetTemplate) => {
    setSelectedTemplate(template);
    setAssetConfig(prev => ({
      ...prev,
      ...template.configuration,
      template: template.id,
    }));
  }, []);

  const handleAddTag = useCallback(() => {
    if (customTagInput.trim() && !assetConfig.metadata.tags.includes(customTagInput.trim())) {
      handleMetadataChange('tags', [...assetConfig.metadata.tags, customTagInput.trim()]);
      setCustomTagInput('');
    }
  }, [customTagInput, assetConfig.metadata.tags, handleMetadataChange]);

  const handleRemoveTag = useCallback((tag: string) => {
    handleMetadataChange('tags', assetConfig.metadata.tags.filter(t => t !== tag));
  }, [assetConfig.metadata.tags, handleMetadataChange]);

  const handleCreateAsset = useCallback(async () => {
    if (!currentWorkspace || !validation?.isValid || !canCreateAsset) return;

    setIsCreating(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 300);

      const asset = await createAsset({
        workspaceId: currentWorkspace.id,
        ...assetConfig,
      });

      clearInterval(progressInterval);
      setProgress(100);

      // Track successful creation
      trackActivity({
        action: 'asset_created',
        component: 'QuickAssetCreate',
        metadata: {
          workspace: currentWorkspace.id,
          assetType: assetConfig.type,
          assetCategory: assetConfig.category,
          templateUsed: selectedTemplate?.id,
          aiEnhanced: aiSuggestions.length > 0,
        },
      });

      // Reset form or close
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Asset creation failed:', error);
    } finally {
      setIsCreating(false);
    }
  }, [currentWorkspace, validation, canCreateAsset, assetConfig, createAsset, trackActivity, selectedTemplate, aiSuggestions, onClose]);

  const renderBasicTab = () => (
    <motion.div
      variants={staggerChildren}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Asset Type Selection */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Asset Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(assetTypeIcons).map(([type, IconComponent]) => (
                <Button
                  key={type}
                  variant={assetConfig.type === type ? 'default' : 'outline'}
                  onClick={() => handleConfigChange('type', type as AssetType)}
                  className="h-16 flex-col space-y-2"
                >
                  <IconComponent className="h-6 w-6" />
                  <span className="text-xs capitalize">{type}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Basic Information */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="asset-name">Name *</Label>
              <Input
                id="asset-name"
                value={assetConfig.name}
                onChange={(e) => handleConfigChange('name', e.target.value)}
                placeholder="Enter asset name..."
              />
            </div>

            <div>
              <Label htmlFor="asset-description">Description *</Label>
              <Textarea
                id="asset-description"
                value={assetConfig.description}
                onChange={(e) => handleConfigChange('description', e.target.value)}
                placeholder="Describe the asset purpose and contents..."
                rows={3}
              />
              {assetConfig.description && (
                <div className="flex items-center space-x-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => enhanceDescription(assetConfig.description)}
                    disabled={catalogLoading}
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Enhance
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={assetConfig.category}
                  onValueChange={(value: AssetCategory) => handleConfigChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="owner">Owner</Label>
                <Select
                  value={assetConfig.metadata.owner}
                  onValueChange={(value) => handleMetadataChange('owner', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {workspaceUsers?.map((user) => (
                      <SelectItem key={user.id} value={user.email}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Templates */}
      {availableTemplates.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <Wand2 className="h-4 w-4 mr-2" />
                Quick Start Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {availableTemplates.slice(0, 3).map((template) => (
                  <Button
                    key={template.id}
                    variant={selectedTemplate?.id === template.id ? 'default' : 'outline'}
                    onClick={() => handleTemplateSelect(template)}
                    className="justify-start h-auto p-3"
                  >
                    <div className="text-left">
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{template.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <Brain className="h-4 w-4 mr-2 text-purple-500" />
                AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {aiSuggestions.slice(0, 3).map((suggestion, index) => (
                  <div key={index} className="p-2 bg-purple-50 rounded border border-purple-200">
                    <div className="text-xs font-medium text-purple-800">{suggestion.type}</div>
                    <div className="text-sm text-purple-700 mt-1">{suggestion.suggestion}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Progress Indicator */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Form Completion</span>
              <span className="text-sm text-gray-500">{formCompleteness}%</span>
            </div>
            <Progress value={formCompleteness} className="h-2" />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderMetadataTab = () => (
    <motion.div
      variants={staggerChildren}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Tags */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex space-x-2">
              <Input
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                placeholder="Add tag..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                className="flex-1"
              />
              <Button onClick={handleAddTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {assetConfig.metadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {assetConfig.metadata.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                    <span>{tag}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveTag(tag)}
                      className="h-4 w-4 p-0 hover:bg-transparent"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Security & Compliance */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Security & Compliance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Classification</Label>
                <Select
                  value={assetConfig.metadata.classification}
                  onValueChange={(value) => handleMetadataChange('classification', value)}
                >
                  <SelectTrigger>
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

              <div>
                <Label>Sensitivity</Label>
                <Select
                  value={assetConfig.metadata.sensitivity}
                  onValueChange={(value) => handleMetadataChange('sensitivity', value)}
                >
                  <SelectTrigger>
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
              <Label>Department</Label>
              <Select
                value={assetConfig.metadata.department}
                onValueChange={(value) => handleMetadataChange('department', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="data">Data</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="hr">Human Resources</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Settings */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Asset Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-classify">Auto-classify data</Label>
                <p className="text-xs text-gray-500">Automatically detect and classify sensitive data</p>
              </div>
              <Switch
                id="auto-classify"
                checked={assetConfig.settings.autoClassify}
                onCheckedChange={(checked) =>
                  handleConfigChange('settings', {
                    ...assetConfig.settings,
                    autoClassify: checked,
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enable-lineage">Enable lineage tracking</Label>
                <p className="text-xs text-gray-500">Track data lineage and dependencies</p>
              </div>
              <Switch
                id="enable-lineage"
                checked={assetConfig.settings.enableLineage}
                onCheckedChange={(checked) =>
                  handleConfigChange('settings', {
                    ...assetConfig.settings,
                    enableLineage: checked,
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="validate-schema">Validate schema</Label>
                <p className="text-xs text-gray-500">Perform schema validation during creation</p>
              </div>
              <Switch
                id="validate-schema"
                checked={assetConfig.settings.validateSchema}
                onCheckedChange={(checked) =>
                  handleConfigChange('settings', {
                    ...assetConfig.settings,
                    validateSchema: checked,
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="require-approval">Require approval</Label>
                <p className="text-xs text-gray-500">Require approval before asset is published</p>
              </div>
              <Switch
                id="require-approval"
                checked={assetConfig.settings.requireApproval}
                onCheckedChange={(checked) =>
                  handleConfigChange('settings', {
                    ...assetConfig.settings,
                    requireApproval: checked,
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderValidationTab = () => (
    <motion.div
      variants={staggerChildren}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Validation Results */}
      {validation && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                {validation.isValid ? (
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                )}
                Validation Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {validation.errors.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Errors</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {validation.errors.map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {validation.warnings.length > 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Warnings</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {validation.warnings.map((warning, index) => (
                        <li key={index} className="text-sm">{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {validation.suggestions.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Suggestions</h4>
                  <div className="space-y-2">
                    {validation.suggestions.map((suggestion, index) => (
                      <div key={index} className="p-2 bg-blue-50 rounded border border-blue-200">
                        <div className="text-sm text-blue-700">{suggestion}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-sm font-medium">Completeness</span>
                <div className="flex items-center space-x-2">
                  <Progress value={validation.completeness} className="w-20 h-2" />
                  <span className="text-sm">{validation.completeness}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Preview */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Asset Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {React.createElement(assetTypeIcons[assetConfig.type] || Database, {
                  className: "h-8 w-8 text-blue-600"
                })}
                <div>
                  <h3 className="font-medium">{assetConfig.name || 'Untitled Asset'}</h3>
                  <p className="text-sm text-gray-500">{assetConfig.description || 'No description'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500">Type:</span>
                  <span className="ml-2 capitalize">{assetConfig.type}</span>
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>
                  <span className="ml-2 capitalize">{assetConfig.category}</span>
                </div>
                <div>
                  <span className="text-gray-500">Owner:</span>
                  <span className="ml-2">{assetConfig.metadata.owner || 'Unassigned'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Classification:</span>
                  <span className="ml-2 capitalize">{assetConfig.metadata.classification}</span>
                </div>
              </div>

              {assetConfig.metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {assetConfig.metadata.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Creation Progress */}
      {isCreating && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Creating Asset...</span>
                <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="mt-2 text-xs text-gray-500">
                {progress < 30 ? 'Validating configuration...' :
                 progress < 60 ? 'Generating metadata...' :
                 progress < 90 ? 'Creating asset...' :
                 'Finalizing...'}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );

  if (!isVisible) return null;

  return (
    <TooltipProvider>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`bg-white rounded-xl shadow-xl border border-gray-200 ${className}`}
        style={{ width: '420px', maxHeight: '85vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Plus className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Create Asset
              </h2>
              <p className="text-sm text-gray-500">
                Add new asset to catalog
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic" className="text-xs">Basic Info</TabsTrigger>
              <TabsTrigger value="metadata" className="text-xs">Metadata</TabsTrigger>
              <TabsTrigger value="validation" className="text-xs">Review</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              {renderBasicTab()}
            </TabsContent>

            <TabsContent value="metadata" className="space-y-4">
              {renderMetadataTab()}
            </TabsContent>

            <TabsContent value="validation" className="space-y-4">
              {renderValidationTab()}
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex space-x-2 mt-6">
            <Button
              onClick={handleCreateAsset}
              disabled={isCreating || !validation?.isValid || !canCreateAsset}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              {isCreating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Asset
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              disabled={!assetConfig.name}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default QuickAssetCreate;