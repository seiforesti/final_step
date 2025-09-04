'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxTrigger,
} from '@/components/ui/combobox';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Shield,
  Lock,
  Unlock,
  Plus,
  Minus,
  Eye,
  Edit,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Info,
  Code,
  TestTube,
  Lightbulb,
  Zap,
  Database,
  Server,
  Users,
  Crown,
  FileText,
  Tag,
  Search,
  Activity,
  Settings,
  Network,
  Globe,
  Layers,
  Target,
  BookOpen,
  RefreshCw,
  Copy,
  Download,
  Upload,
  MoreVertical,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Filter,
  HelpCircle
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { useRoles } from '../../hooks/useRoles';
import { useToast } from '@/components/ui/use-toast';
import {
  Permission,
  PermissionCreate,
  PermissionUpdate,
  PermissionValidation,
  PermissionTemplate
} from '../../types/permission.types';
import { cn } from '@/lib copie/utils';

interface PermissionCreateEditProps {
  isOpen: boolean;
  onClose: () => void;
  permission?: Permission | null;
  mode: 'create' | 'edit' | 'duplicate';
  onSuccess?: (permission: Permission) => void;
}

// Enhanced validation schema
const permissionSchema = z.object({
  action: z.string()
    .min(1, 'Action is required')
    .regex(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/, 'Action must follow dot notation (e.g., scan.view)'),
  resource: z.string()
    .min(1, 'Resource is required')
    .regex(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/, 'Resource must follow dot notation (e.g., datasource.database)'),
  description: z.string().optional(),
  conditions: z.string().optional().refine((value) => {
    if (!value || value.trim() === '') return true;
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }, 'Conditions must be valid JSON'),
  category: z.string().optional(),
  priority: z.number().min(1).max(100).default(50),
  isSystemPermission: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.any()).optional()
});

type PermissionFormData = z.infer<typeof permissionSchema>;

interface ConditionBuilder {
  type: 'user' | 'role' | 'resource' | 'time' | 'location' | 'custom';
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains' | 'regex' | 'greater_than' | 'less_than';
  field: string;
  value: string | string[] | number | boolean;
  enabled: boolean;
}

const resourceTypes = [
  { value: 'datasource', label: 'Data Sources', icon: Database, description: 'Database connections and data sources' },
  { value: 'catalog', label: 'Data Catalog', icon: BookOpen, description: 'Data catalog and metadata' },
  { value: 'scan', label: 'Scan Operations', icon: Search, description: 'Data scanning and discovery' },
  { value: 'compliance', label: 'Compliance', icon: Shield, description: 'Compliance rules and policies' },
  { value: 'classification', label: 'Classifications', icon: Tag, description: 'Data classification and tagging' },
  { value: 'workflow', label: 'Workflows', icon: Activity, description: 'Workflow management and automation' },
  { value: 'user', label: 'User Management', icon: Users, description: 'User accounts and profiles' },
  { value: 'role', label: 'Role Management', icon: Crown, description: 'Role definitions and assignments' },
  { value: 'system', label: 'System', icon: Server, description: 'System administration and configuration' },
  { value: 'analytics', label: 'Analytics', icon: Activity, description: 'Analytics and reporting' }
];

const actionTypes = [
  { value: 'create', label: 'Create', description: 'Create new resources' },
  { value: 'read', label: 'Read', description: 'View and read resources' },
  { value: 'update', label: 'Update', description: 'Modify existing resources' },
  { value: 'delete', label: 'Delete', description: 'Remove resources' },
  { value: 'execute', label: 'Execute', description: 'Execute operations or scripts' },
  { value: 'manage', label: 'Manage', description: 'Full management access' },
  { value: 'approve', label: 'Approve', description: 'Approve requests and workflows' },
  { value: 'export', label: 'Export', description: 'Export data and configurations' },
  { value: 'import', label: 'Import', description: 'Import data and configurations' },
  { value: 'configure', label: 'Configure', description: 'Configure settings and parameters' }
];

const permissionCategories = [
  { value: 'data', label: 'Data Access', color: 'bg-blue-500' },
  { value: 'system', label: 'System Admin', color: 'bg-red-500' },
  { value: 'workflow', label: 'Workflow', color: 'bg-green-500' },
  { value: 'security', label: 'Security', color: 'bg-yellow-500' },
  { value: 'analytics', label: 'Analytics', color: 'bg-purple-500' },
  { value: 'collaboration', label: 'Collaboration', color: 'bg-orange-500' },
  { value: 'governance', label: 'Governance', color: 'bg-indigo-500' },
  { value: 'integration', label: 'Integration', color: 'bg-teal-500' }
];

const conditionTypes = [
  { value: 'user', label: 'User Attributes', description: 'Conditions based on user properties' },
  { value: 'role', label: 'Role Attributes', description: 'Conditions based on role properties' },
  { value: 'resource', label: 'Resource Attributes', description: 'Conditions based on resource properties' },
  { value: 'time', label: 'Time Constraints', description: 'Time-based access conditions' },
  { value: 'location', label: 'Location Constraints', description: 'Location-based access conditions' },
  { value: 'custom', label: 'Custom Logic', description: 'Custom conditional logic' }
];

const operators = [
  { value: 'equals', label: 'Equals', description: 'Exact match' },
  { value: 'not_equals', label: 'Not Equals', description: 'Not equal to' },
  { value: 'in', label: 'In', description: 'Value in list' },
  { value: 'not_in', label: 'Not In', description: 'Value not in list' },
  { value: 'contains', label: 'Contains', description: 'String contains' },
  { value: 'regex', label: 'Regex Match', description: 'Regular expression match' },
  { value: 'greater_than', label: 'Greater Than', description: 'Numeric comparison' },
  { value: 'less_than', label: 'Less Than', description: 'Numeric comparison' }
];

export function PermissionCreateEdit({
  isOpen,
  onClose,
  permission,
  mode,
  onSuccess
}: PermissionCreateEditProps) {
  const { user, hasPermission } = useAuth();
  const {
    createPermission,
    updatePermission,
    validatePermission,
    testPermission,
    getPermissionTemplates,
    permissionTemplates
  } = usePermissions();
  const { roles } = useRoles();
  const { toast } = useToast();

  // State management
  const [activeTab, setActiveTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [validation, setValidation] = useState<PermissionValidation | null>(null);
  const [conditions, setConditions] = useState<ConditionBuilder[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [testResults, setTestResults] = useState<any>(null);
  const [templates, setTemplates] = useState<PermissionTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [previewMode, setPreviewMode] = useState(false);

  // Form setup
  const form = useForm<PermissionFormData>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      action: '',
      resource: '',
      description: '',
      conditions: '',
      category: '',
      priority: 50,
      isSystemPermission: false,
      tags: [],
      metadata: {}
    }
  });

  const { watch, setValue, getValues, formState: { errors, isDirty } } = form;
  const watchedValues = watch();

  // Load data when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      initializeForm();
    }
  }, [isOpen, permission, mode]);

  // Real-time validation
  useEffect(() => {
    if (isDirty) {
      const debounceTimer = setTimeout(() => {
        performValidation();
      }, 500);
      return () => clearTimeout(debounceTimer);
    }
  }, [watchedValues, isDirty]);

  const loadTemplates = async () => {
    try {
      await getPermissionTemplates();
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const initializeForm = () => {
    if (permission && (mode === 'edit' || mode === 'duplicate')) {
      const formData: PermissionFormData = {
        action: mode === 'duplicate' ? `${permission.action}_copy` : permission.action,
        resource: permission.resource,
        description: permission.description || '',
        conditions: permission.conditions || '',
        category: permission.category || '',
        priority: permission.priority || 50,
        isSystemPermission: permission.is_system || false,
        tags: permission.tags || [],
        metadata: permission.metadata || {}
      };

      // Reset form with permission data
      form.reset(formData);
      setTags(permission.tags || []);

      // Parse conditions if they exist
      if (permission.conditions) {
        try {
          const parsedConditions = JSON.parse(permission.conditions);
          parseConditionsToBuilder(parsedConditions);
        } catch (error) {
          console.error('Failed to parse conditions:', error);
        }
      }
    } else {
      // Reset form for create mode
      form.reset({
        action: '',
        resource: '',
        description: '',
        conditions: '',
        category: '',
        priority: 50,
        isSystemPermission: false,
        tags: [],
        metadata: {}
      });
      setTags([]);
      setConditions([]);
    }
    
    setValidation(null);
    setTestResults(null);
    setSelectedTemplate('');
  };

  const parseConditionsToBuilder = (conditionsObj: any) => {
    // Parse existing conditions into builder format
    const builders: ConditionBuilder[] = [];
    
    if (typeof conditionsObj === 'object' && conditionsObj !== null) {
      Object.entries(conditionsObj).forEach(([key, value]: [string, any]) => {
        if (typeof value === 'object' && value.operator && value.value !== undefined) {
          builders.push({
            type: 'custom',
            operator: value.operator,
            field: key,
            value: value.value,
            enabled: true
          });
        }
      });
    }
    
    setConditions(builders);
  };

  const performValidation = async () => {
    try {
      const formData = getValues();
      const permissionData: PermissionCreate = {
        action: formData.action,
        resource: formData.resource,
        description: formData.description,
        conditions: formData.conditions || undefined,
        category: formData.category,
        priority: formData.priority,
        is_system: formData.isSystemPermission,
        tags: tags,
        metadata: formData.metadata
      };

      const validationResult = await validatePermission(permissionData);
      setValidation(validationResult);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const buildConditionsJSON = () => {
    const conditionsObj: any = {};
    
    conditions.filter(c => c.enabled && c.field && c.value).forEach(condition => {
      conditionsObj[condition.field] = {
        operator: condition.operator,
        value: condition.value
      };
    });
    
    return Object.keys(conditionsObj).length > 0 ? JSON.stringify(conditionsObj, null, 2) : '';
  };

  const addCondition = () => {
    setConditions(prev => [...prev, {
      type: 'user',
      operator: 'equals',
      field: '',
      value: '',
      enabled: true
    }]);
  };

  const removeCondition = (index: number) => {
    setConditions(prev => prev.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, updates: Partial<ConditionBuilder>) => {
    setConditions(prev => prev.map((condition, i) => 
      i === index ? { ...condition, ...updates } : condition
    ));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      setValue('tags', updatedTags);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    setValue('tags', updatedTags);
  };

  const applyTemplate = (templateId: string) => {
    const template = permissionTemplates?.find(t => t.id === templateId);
    if (!template) return;

    // Apply template data to form
    setValue('action', template.action_pattern || '');
    setValue('resource', template.resource_pattern || '');
    setValue('description', template.description || '');
    setValue('category', template.category || '');
    setValue('conditions', template.default_conditions || '');
    setTags(template.tags || []);

    // Parse template conditions
    if (template.default_conditions) {
      try {
        const parsedConditions = JSON.parse(template.default_conditions);
        parseConditionsToBuilder(parsedConditions);
      } catch (error) {
        console.error('Failed to parse template conditions:', error);
      }
    }

    toast({
      title: 'Template Applied',
      description: `Applied template: ${template.name}`,
    });
  };

  const testPermissionLogic = async () => {
    try {
      setIsLoading(true);
      const formData = getValues();
      
      const testData = {
        action: formData.action,
        resource: formData.resource,
        conditions: buildConditionsJSON(),
        test_scenarios: [
          { user_id: user?.id, context: { department: 'engineering' } },
          { user_id: user?.id, context: { department: 'marketing' } },
          { user_id: user?.id, context: { time: new Date().toISOString() } }
        ]
      };

      const results = await testPermission?.(testData);
      setTestResults(results);
      
      toast({
        title: 'Test Complete',
        description: 'Permission logic tested successfully',
      });
    } catch (error) {
      toast({
        title: 'Test Failed',
        description: 'Failed to test permission logic',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: PermissionFormData) => {
    if (!hasPermission(mode === 'create' ? 'rbac.permission.create' : 'rbac.permission.edit')) {
      toast({
        title: 'Access Denied',
        description: `You do not have permission to ${mode} permissions.`,
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      // Build final conditions JSON
      const conditionsJSON = buildConditionsJSON();
      
      const permissionData = {
        action: data.action,
        resource: data.resource,
        description: data.description || undefined,
        conditions: conditionsJSON || undefined,
        category: data.category || undefined,
        priority: data.priority,
        is_system: data.isSystemPermission,
        tags: tags,
        metadata: data.metadata
      };

      let result: Permission;

      if (mode === 'create' || mode === 'duplicate') {
        result = await createPermission(permissionData as PermissionCreate);
        toast({
          title: 'Permission Created',
          description: `Permission "${result.action}" has been created successfully.`,
        });
      } else {
        result = await updatePermission(permission!.id, permissionData as PermissionUpdate);
        toast({
          title: 'Permission Updated',
          description: `Permission "${result.action}" has been updated successfully.`,
        });
      }

      onSuccess?.(result);
      onClose();
    } catch (error) {
      toast({
        title: `${mode === 'create' ? 'Create' : 'Update'} Failed`,
        description: error instanceof Error ? error.message : `Failed to ${mode} permission.`,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit = form.formState.isValid && !isLoading;
  const title = mode === 'create' ? 'Create Permission' : mode === 'edit' ? 'Edit Permission' : 'Duplicate Permission';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-purple-600" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Create a new permission with specific access controls and conditions'
              : mode === 'edit'
              ? 'Modify the permission settings and access controls'
              : 'Create a copy of this permission with modifications'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Basic
                </TabsTrigger>
                <TabsTrigger value="conditions" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Conditions
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Advanced
                </TabsTrigger>
                <TabsTrigger value="test" className="flex items-center gap-2">
                  <TestTube className="h-4 w-4" />
                  Test
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Permission Definition</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="action"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Action *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select action" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {actionTypes.map(action => (
                                    <SelectItem key={action.value} value={action.value}>
                                      <div>
                                        <p className="font-medium">{action.label}</p>
                                        <p className="text-xs text-muted-foreground">{action.description}</p>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Type of action this permission allows
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="resource"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Resource *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select resource" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {resourceTypes.map(resource => (
                                    <SelectItem key={resource.value} value={resource.value}>
                                      <div className="flex items-center gap-2">
                                        <resource.icon className="h-4 w-4" />
                                        <div>
                                          <p className="font-medium">{resource.label}</p>
                                          <p className="text-xs text-muted-foreground">{resource.description}</p>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Resource this permission applies to
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe what this permission allows..."
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Optional description explaining the permission's purpose
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {permissionCategories.map(category => (
                                    <SelectItem key={category.value} value={category.value}>
                                      <div className="flex items-center gap-2">
                                        <div className={cn("w-3 h-3 rounded", category.color)} />
                                        {category.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Logical grouping for this permission
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Priority</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  max="100"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 50)}
                                />
                              </FormControl>
                              <FormDescription>
                                Priority level (1-100, higher = more important)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Templates & Quick Start</CardTitle>
                      <CardDescription>
                        Use predefined templates to quickly create common permissions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {permissionTemplates && permissionTemplates.length > 0 && (
                        <div>
                          <FormLabel>Apply Template</FormLabel>
                          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a template..." />
                            </SelectTrigger>
                            <SelectContent>
                              {permissionTemplates.map(template => (
                                <SelectItem key={template.id} value={template.id}>
                                  <div>
                                    <p className="font-medium">{template.name}</p>
                                    <p className="text-xs text-muted-foreground">{template.description}</p>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selectedTemplate && (
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full mt-2"
                              onClick={() => applyTemplate(selectedTemplate)}
                            >
                              <Lightbulb className="h-4 w-4 mr-2" />
                              Apply Template
                            </Button>
                          )}
                        </div>
                      )}

                      <Separator />

                      <div>
                        <FormLabel>Tags</FormLabel>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add tag..."
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                            />
                            <Button type="button" variant="outline" onClick={addTag}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="gap-1">
                                {tag}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-3 w-3 p-0"
                                  onClick={() => removeTag(tag)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Conditions Tab */}
              <TabsContent value="conditions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      ABAC Conditions
                    </CardTitle>
                    <CardDescription>
                      Define attribute-based access control conditions for fine-grained permission control
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Conditions allow you to create dynamic permissions based on user attributes, context, and other factors.
                      </p>
                      <Button type="button" variant="outline" onClick={addCondition}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Condition
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {conditions.map((condition, index) => (
                        <Card key={index} className="p-4">
                          <div className="grid grid-cols-12 gap-4 items-end">
                            <div className="col-span-2">
                              <FormLabel className="text-xs">Type</FormLabel>
                              <Select
                                value={condition.type}
                                onValueChange={(value) => updateCondition(index, { type: value as any })}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {conditionTypes.map(type => (
                                    <SelectItem key={type.value} value={type.value}>
                                      <div>
                                        <p className="text-xs font-medium">{type.label}</p>
                                        <p className="text-xs text-muted-foreground">{type.description}</p>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="col-span-3">
                              <FormLabel className="text-xs">Field</FormLabel>
                              <Input
                                className="h-8"
                                placeholder="e.g., user.department"
                                value={condition.field}
                                onChange={(e) => updateCondition(index, { field: e.target.value })}
                              />
                            </div>

                            <div className="col-span-2">
                              <FormLabel className="text-xs">Operator</FormLabel>
                              <Select
                                value={condition.operator}
                                onValueChange={(value) => updateCondition(index, { operator: value as any })}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {operators.map(op => (
                                    <SelectItem key={op.value} value={op.value}>
                                      <div>
                                        <p className="text-xs font-medium">{op.label}</p>
                                        <p className="text-xs text-muted-foreground">{op.description}</p>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="col-span-3">
                              <FormLabel className="text-xs">Value</FormLabel>
                              <Input
                                className="h-8"
                                placeholder="Condition value"
                                value={condition.value as string}
                                onChange={(e) => updateCondition(index, { value: e.target.value })}
                              />
                            </div>

                            <div className="col-span-1">
                              <div className="flex items-center gap-1">
                                <Checkbox
                                  checked={condition.enabled}
                                  onCheckedChange={(checked) => updateCondition(index, { enabled: checked === true })}
                                />
                              </div>
                            </div>

                            <div className="col-span-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => removeCondition(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {conditions.length > 0 && (
                      <div>
                        <FormLabel>Generated JSON</FormLabel>
                        <div className="p-3 bg-muted rounded-lg">
                          <pre className="text-xs overflow-x-auto">
                            {buildConditionsJSON() || '{}'}
                          </pre>
                        </div>
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="conditions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Raw JSON (Advanced)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder='{"user.department": {"operator": "equals", "value": "engineering"}}'
                              className="resize-none font-mono text-sm"
                              rows={4}
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setValue('conditions', buildConditionsJSON());
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Advanced users can directly edit the JSON conditions
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">System Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="isSystemPermission"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>System Permission</FormLabel>
                              <FormDescription>
                                Mark as a system-level permission (cannot be deleted)
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <Separator />

                      <div>
                        <FormLabel>Metadata</FormLabel>
                        <FormDescription className="mb-2">
                          Additional key-value data for this permission
                        </FormDescription>
                        <Textarea
                          placeholder='{"source": "api", "version": "1.0"}'
                          className="font-mono text-sm"
                          rows={3}
                          onChange={(e) => {
                            try {
                              const metadata = JSON.parse(e.target.value || '{}');
                              setValue('metadata', metadata);
                            } catch {
                              // Invalid JSON, ignore
                            }
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Validation Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {validation ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            {validation.is_valid ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm font-medium">
                              {validation.is_valid ? 'Valid Permission' : 'Validation Failed'}
                            </span>
                          </div>

                          {validation.errors.length > 0 && (
                            <Alert variant="destructive">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertTitle>Errors</AlertTitle>
                              <AlertDescription>
                                <ul className="list-disc list-inside text-xs">
                                  {validation.errors.map((error, idx) => (
                                    <li key={idx}>{error}</li>
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
                                <ul className="list-disc list-inside text-xs">
                                  {validation.warnings.map((warning, idx) => (
                                    <li key={idx}>{warning}</li>
                                  ))}
                                </ul>
                              </AlertDescription>
                            </Alert>
                          )}

                          {validation.suggestions.length > 0 && (
                            <Alert>
                              <Lightbulb className="h-4 w-4" />
                              <AlertTitle>Suggestions</AlertTitle>
                              <AlertDescription>
                                <ul className="list-disc list-inside text-xs">
                                  {validation.suggestions.map((suggestion, idx) => (
                                    <li key={idx}>{suggestion}</li>
                                  ))}
                                </ul>
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <RefreshCw className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Start typing to see validation results</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Test Tab */}
              <TabsContent value="test" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TestTube className="h-4 w-4" />
                      Permission Testing
                    </CardTitle>
                    <CardDescription>
                      Test how this permission behaves under different conditions and scenarios
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Run tests to validate permission logic with real scenarios
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={testPermissionLogic}
                        disabled={isLoading || !watchedValues.action || !watchedValues.resource}
                      >
                        {isLoading ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <TestTube className="h-4 w-4 mr-2" />
                        )}
                        Run Tests
                      </Button>
                    </div>

                    {testResults && (
                      <div className="space-y-3">
                        <h4 className="font-medium">Test Results</h4>
                        <div className="space-y-2">
                          {testResults.scenarios?.map((result: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-2 border rounded">
                              <span className="text-sm">{result.scenario}</span>
                              <div className="flex items-center gap-2">
                                {result.allowed ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <X className="h-4 w-4 text-red-500" />
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {result.allowed ? 'Allowed' : 'Denied'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preview Tab */}
              <TabsContent value="preview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Permission Preview</CardTitle>
                    <CardDescription>
                      Review the complete permission configuration before saving
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FormLabel className="text-xs">Action</FormLabel>
                        <p className="font-medium">{watchedValues.action || 'Not specified'}</p>
                      </div>
                      <div>
                        <FormLabel className="text-xs">Resource</FormLabel>
                        <p className="font-medium">{watchedValues.resource || 'Not specified'}</p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <FormLabel className="text-xs">Description</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        {watchedValues.description || 'No description provided'}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <FormLabel className="text-xs">Category</FormLabel>
                        <p className="text-sm">{watchedValues.category || 'Uncategorized'}</p>
                      </div>
                      <div>
                        <FormLabel className="text-xs">Priority</FormLabel>
                        <p className="text-sm">{watchedValues.priority}</p>
                      </div>
                      <div>
                        <FormLabel className="text-xs">System Permission</FormLabel>
                        <p className="text-sm">{watchedValues.isSystemPermission ? 'Yes' : 'No'}</p>
                      </div>
                    </div>

                    <div>
                      <FormLabel className="text-xs">Tags</FormLabel>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tags.length > 0 ? tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        )) : (
                          <p className="text-sm text-muted-foreground">No tags</p>
                        )}
                      </div>
                    </div>

                    {buildConditionsJSON() && (
                      <div>
                        <FormLabel className="text-xs">Conditions</FormLabel>
                        <div className="mt-1 p-3 bg-muted rounded-lg">
                          <pre className="text-xs overflow-x-auto">
                            {buildConditionsJSON()}
                          </pre>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </form>
        </Form>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {validation && (
              <Badge variant={validation.is_valid ? "default" : "destructive"}>
                {validation.is_valid ? "Valid" : "Invalid"}
              </Badge>
            )}
            {isDirty && (
              <Badge variant="outline">Unsaved changes</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
              onClick={form.handleSubmit(handleSubmit)}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {mode === 'create' ? 'Create Permission' : mode === 'edit' ? 'Update Permission' : 'Duplicate Permission'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}