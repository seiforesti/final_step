'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Download, 
  Upload, 
  Search, 
  Filter, 
  Star, 
  StarOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Code,
  FileText,
  Layers,
  Zap,
  Shield,
  RefreshCw
} from 'lucide-react';
import { useWorkflowManagement } from '../../hooks/useWorkflowManagement';
import { useFailureRecovery } from '../../hooks/useWorkflowManagement';
import { 
  createFailureTemplate, 
  updateFailureTemplate, 
  deleteFailureTemplate, 
  duplicateFailureTemplate,
  exportFailureTemplate,
  importFailureTemplate,
  validateFailureTemplate,
  testFailureTemplate,
  getFailureTemplateAnalytics,
  applyFailureTemplate
} from '../../services/scan-workflow-apis';
import { 
  FAILURE_TYPES, 
  RECOVERY_STRATEGIES, 
  SEVERITY_LEVELS, 
  TEMPLATE_CATEGORIES,
  FAILURE_PATTERNS,
  RECOVERY_POLICIES
} from '../../constants/workflow-templates';
import { 
  FailureTemplate, 
  FailurePattern, 
  RecoveryStrategy, 
  TemplateValidation,
  TemplateAnalytics
} from '../../types/workflow.types';
import { cn } from '@/lib copie/utils';

interface FailureTemplatePanelProps {
  className?: string;
  onTemplateSelect?: (template: FailureTemplate) => void;
  onTemplateApply?: (template: FailureTemplate) => void;
}

export function FailureTemplatePanel({ 
  className, 
  onTemplateSelect, 
  onTemplateApply 
}: FailureTemplatePanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<FailureTemplate | null>(null);
  const [activeTab, setActiveTab] = useState('templates');

  const {
    failureTemplates,
    failureTemplateStats,
    isLoadingTemplates,
    error: templatesError,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    exportTemplate,
    importTemplate,
    validateTemplate,
    testTemplate,
    getTemplateAnalytics,
    applyTemplate
  } = useFailureRecovery();

  const {
    workflowTypes,
    failurePatterns,
    recoveryStrategies
  } = useWorkflowManagement();

  // Filter templates based on search and filters
  const filteredTemplates = useMemo(() => {
    return failureTemplates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesSeverity = selectedSeverity === 'all' || template.severity === selectedSeverity;
      
      return matchesSearch && matchesCategory && matchesSeverity;
    });
  }, [failureTemplates, searchTerm, selectedCategory, selectedSeverity]);

  // Group templates by category
  const templatesByCategory = useMemo(() => {
    const grouped = filteredTemplates.reduce((acc, template) => {
      const category = template.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(template);
      return acc;
    }, {} as Record<string, FailureTemplate[]>);
    
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredTemplates]);

  // Handle template creation
  const handleCreateTemplate = useCallback(async (templateData: Partial<FailureTemplate>) => {
    try {
      await createTemplate(templateData);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  }, [createTemplate]);

  // Handle template update
  const handleUpdateTemplate = useCallback(async (templateId: string, templateData: Partial<FailureTemplate>) => {
    try {
      await updateTemplate(templateId, templateData);
      setIsEditDialogOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Failed to update template:', error);
    }
  }, [updateTemplate]);

  // Handle template deletion
  const handleDeleteTemplate = useCallback(async (templateId: string) => {
    try {
      await deleteTemplate(templateId);
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  }, [deleteTemplate]);

  // Handle template duplication
  const handleDuplicateTemplate = useCallback(async (templateId: string) => {
    try {
      await duplicateTemplate(templateId);
    } catch (error) {
      console.error('Failed to duplicate template:', error);
    }
  }, [duplicateTemplate]);

  // Handle template export
  const handleExportTemplate = useCallback(async (templateId: string) => {
    try {
      const exportedData = await exportTemplate(templateId);
      const blob = new Blob([JSON.stringify(exportedData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `failure-template-${templateId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export template:', error);
    }
  }, [exportTemplate]);

  // Handle template import
  const handleImportTemplate = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const templateData = JSON.parse(text);
      await importTemplate(templateData);
      setIsImportDialogOpen(false);
    } catch (error) {
      console.error('Failed to import template:', error);
    }
  }, [importTemplate]);

  // Handle template validation
  const handleValidateTemplate = useCallback(async (templateId: string) => {
    try {
      const validation = await validateTemplate(templateId);
      return validation;
    } catch (error) {
      console.error('Failed to validate template:', error);
      return null;
    }
  }, [validateTemplate]);

  // Handle template testing
  const handleTestTemplate = useCallback(async (templateId: string) => {
    try {
      const testResult = await testTemplate(templateId);
      return testResult;
    } catch (error) {
      console.error('Failed to test template:', error);
      return null;
    }
  }, [testTemplate]);

  // Handle template application
  const handleApplyTemplate = useCallback(async (templateId: string) => {
    try {
      const template = failureTemplates.find(t => t.id === templateId);
      if (template) {
        await applyTemplate(templateId);
        onTemplateApply?.(template);
      }
    } catch (error) {
      console.error('Failed to apply template:', error);
    }
  }, [applyTemplate, failureTemplates, onTemplateApply]);

  // Get template analytics
  const handleGetTemplateAnalytics = useCallback(async (templateId: string) => {
    try {
      const analytics = await getTemplateAnalytics(templateId);
      return analytics;
    } catch (error) {
      console.error('Failed to get template analytics:', error);
      return null;
    }
  }, [getTemplateAnalytics]);

  // Render template card
  const renderTemplateCard = (template: FailureTemplate) => (
    <Card key={template.id} className="group hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              {template.name}
              {template.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
            </CardTitle>
            <CardDescription className="mt-1 text-sm text-muted-foreground">
              {template.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit Template</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicateTemplate(template.id)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Duplicate Template</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExportTemplate(template.id)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export Template</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete Template</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant={template.severity === 'critical' ? 'destructive' : template.severity === 'high' ? 'default' : 'secondary'}>
            {template.severity}
          </Badge>
          <Badge variant="outline">{template.category}</Badge>
          <Badge variant="outline">{template.failureType}</Badge>
          {template.isActive && <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Recovery Strategy:</span>
            <span className="font-medium">{template.recoveryStrategy}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Success Rate:</span>
            <span className="font-medium">{template.successRate}%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Avg Recovery Time:</span>
            <span className="font-medium">{template.avgRecoveryTime}ms</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Usage Count:</span>
            <span className="font-medium">{template.usageCount}</span>
          </div>
        </div>
        <Separator className="my-3" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleValidateTemplate(template.id)}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Validate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTestTemplate(template.id)}
            >
              <Zap className="h-4 w-4 mr-1" />
              Test
            </Button>
          </div>
          <Button
            size="sm"
            onClick={() => handleApplyTemplate(template.id)}
          >
            <Layers className="h-4 w-4 mr-1" />
            Apply
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoadingTemplates) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Loading failure templates...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (templatesError) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load failure templates: {templatesError.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Failure Recovery Templates</h2>
          <p className="text-muted-foreground">
            Manage and configure failure recovery templates for automated error handling
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsImportDialogOpen(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Templates</p>
                <p className="text-2xl font-bold">{failureTemplateStats.totalTemplates}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Templates</p>
                <p className="text-2xl font-bold">{failureTemplateStats.activeTemplates}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Success Rate</p>
                <p className="text-2xl font-bold">{failureTemplateStats.avgSuccessRate}%</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Usage</p>
                <p className="text-2xl font-bold">{failureTemplateStats.totalUsage}</p>
              </div>
              <Layers className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.values(TEMPLATE_CATEGORIES).map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                {Object.values(SEVERITY_LEVELS).map(severity => (
                  <SelectItem key={severity} value={severity}>{severity}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(renderTemplateCard)}
        
        {filteredTemplates.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No templates found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm || selectedCategory !== 'all' || selectedSeverity !== 'all'
                  ? 'Try adjusting your search criteria or filters'
                  : 'Create your first failure recovery template to get started'
                }
              </p>
              {!searchTerm && selectedCategory === 'all' && selectedSeverity === 'all' && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Template Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Failure Recovery Template</DialogTitle>
            <DialogDescription>
              Configure a new failure recovery template with advanced settings and strategies
            </DialogDescription>
          </DialogHeader>
          <FailureTemplateForm
            onSubmit={handleCreateTemplate}
            onCancel={() => setIsCreateDialogOpen(false)}
            workflowTypes={workflowTypes}
            failurePatterns={failurePatterns}
            recoveryStrategies={recoveryStrategies}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Failure Recovery Template</DialogTitle>
            <DialogDescription>
              Modify the selected failure recovery template
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <FailureTemplateForm
              template={selectedTemplate}
              onSubmit={(data) => handleUpdateTemplate(selectedTemplate.id, data)}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedTemplate(null);
              }}
              workflowTypes={workflowTypes}
              failurePatterns={failurePatterns}
              recoveryStrategies={recoveryStrategies}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Import Template Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Failure Recovery Template</DialogTitle>
            <DialogDescription>
              Upload a JSON file containing failure recovery template configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop a JSON file here, or click to select
              </p>
              <Input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImportTemplate(file);
                  }
                }}
                className="hidden"
                id="template-import"
              />
              <Label htmlFor="template-import" className="cursor-pointer">
                <Button variant="outline" size="sm">
                  Select File
                </Button>
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Failure Template Form Component
interface FailureTemplateFormProps {
  template?: FailureTemplate;
  onSubmit: (data: Partial<FailureTemplate>) => void;
  onCancel: () => void;
  workflowTypes: string[];
  failurePatterns: FailurePattern[];
  recoveryStrategies: RecoveryStrategy[];
}

function FailureTemplateForm({
  template,
  onSubmit,
  onCancel,
  workflowTypes,
  failurePatterns,
  recoveryStrategies
}: FailureTemplateFormProps) {
  const [formData, setFormData] = useState<Partial<FailureTemplate>>({
    name: template?.name || '',
    description: template?.description || '',
    category: template?.category || TEMPLATE_CATEGORIES.NETWORK,
    severity: template?.severity || SEVERITY_LEVELS.MEDIUM,
    failureType: template?.failureType || FAILURE_TYPES.NETWORK_TIMEOUT,
    recoveryStrategy: template?.recoveryStrategy || RECOVERY_STRATEGIES.RETRY,
    isActive: template?.isActive ?? true,
    isFavorite: template?.isFavorite ?? false,
    tags: template?.tags || [],
    conditions: template?.conditions || [],
    actions: template?.actions || [],
    retryPolicy: template?.retryPolicy || {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2,
      maxRetryDelay: 10000
    },
    circuitBreaker: template?.circuitBreaker || {
      failureThreshold: 5,
      recoveryTimeout: 60000,
      halfOpenState: true
    },
    fallbackPolicy: template?.fallbackPolicy || {
      enabled: true,
      fallbackAction: 'use_cached_data',
      timeout: 5000
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter template name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TEMPLATE_CATEGORIES).map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the failure scenario and recovery approach"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="severity">Severity Level</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) => setFormData({ ...formData, severity: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(SEVERITY_LEVELS).map(severity => (
                    <SelectItem key={severity} value={severity}>{severity}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="failureType">Failure Type</Label>
              <Select
                value={formData.failureType}
                onValueChange={(value) => setFormData({ ...formData, failureType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select failure type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(FAILURE_TYPES).map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">Active Template</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isFavorite"
              checked={formData.isFavorite}
              onCheckedChange={(checked) => setFormData({ ...formData, isFavorite: checked })}
            />
            <Label htmlFor="isFavorite">Mark as Favorite</Label>
          </div>
        </TabsContent>

        <TabsContent value="strategy" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recoveryStrategy">Recovery Strategy</Label>
            <Select
              value={formData.recoveryStrategy}
              onValueChange={(value) => setFormData({ ...formData, recoveryStrategy: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select recovery strategy" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(RECOVERY_STRATEGIES).map(strategy => (
                  <SelectItem key={strategy} value={strategy}>{strategy}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="conditions">Failure Conditions</Label>
            <Textarea
              id="conditions"
              value={formData.conditions?.join('\n') || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                conditions: e.target.value.split('\n').filter(line => line.trim()) 
              })}
              placeholder="Enter failure conditions (one per line)"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="actions">Recovery Actions</Label>
            <Textarea
              id="actions"
              value={formData.actions?.join('\n') || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                actions: e.target.value.split('\n').filter(line => line.trim()) 
              })}
              placeholder="Enter recovery actions (one per line)"
              rows={4}
            />
          </div>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Retry Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxRetries">Max Retries</Label>
                  <Input
                    id="maxRetries"
                    type="number"
                    value={formData.retryPolicy?.maxRetries}
                    onChange={(e) => setFormData({
                      ...formData,
                      retryPolicy: { ...formData.retryPolicy, maxRetries: parseInt(e.target.value) }
                    })}
                    min="1"
                    max="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retryDelay">Retry Delay (ms)</Label>
                  <Input
                    id="retryDelay"
                    type="number"
                    value={formData.retryPolicy?.retryDelay}
                    onChange={(e) => setFormData({
                      ...formData,
                      retryPolicy: { ...formData.retryPolicy, retryDelay: parseInt(e.target.value) }
                    })}
                    min="100"
                    step="100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Circuit Breaker</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="failureThreshold">Failure Threshold</Label>
                  <Input
                    id="failureThreshold"
                    type="number"
                    value={formData.circuitBreaker?.failureThreshold}
                    onChange={(e) => setFormData({
                      ...formData,
                      circuitBreaker: { ...formData.circuitBreaker, failureThreshold: parseInt(e.target.value) }
                    })}
                    min="1"
                    max="20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recoveryTimeout">Recovery Timeout (ms)</Label>
                  <Input
                    id="recoveryTimeout"
                    type="number"
                    value={formData.circuitBreaker?.recoveryTimeout}
                    onChange={(e) => setFormData({
                      ...formData,
                      circuitBreaker: { ...formData.circuitBreaker, recoveryTimeout: parseInt(e.target.value) }
                    })}
                    min="1000"
                    step="1000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags?.join(', ') || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
              })}
              placeholder="Enter tags separated by commas"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metadata">Additional Metadata (JSON)</Label>
            <Textarea
              id="metadata"
              value={JSON.stringify(formData.metadata || {}, null, 2)}
              onChange={(e) => {
                try {
                  const metadata = JSON.parse(e.target.value);
                  setFormData({ ...formData, metadata });
                } catch (error) {
                  // Invalid JSON, ignore
                }
              }}
              placeholder="Enter additional metadata as JSON"
              rows={4}
            />
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {template ? 'Update Template' : 'Create Template'}
        </Button>
      </DialogFooter>
    </form>
  );
}
