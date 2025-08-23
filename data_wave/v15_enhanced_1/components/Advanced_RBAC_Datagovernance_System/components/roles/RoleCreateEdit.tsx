'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Users,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Search,
  Plus,
  X,
  AlertTriangle,
  CheckCircle,
  Info,
  Settings,
  Copy,
  Save,
  RotateCcw,
  Database,
  Server,
  FileText,
  UserCheck,
  Crown,
  Zap,
  Clock,
  TreePine,
  Network,
  Filter,
  ChevronDown,
  ChevronRight,
  Layers,
  GitBranch,
  Workflow,
  Target,
  Gauge
} from 'lucide-react';

import { useRoles } from '../../hooks/useRoles';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import {
  Role,
  RoleCreate,
  RoleUpdate,
  RoleInheritance,
  RoleValidation,
  RoleTemplate,
  RoleConflict
} from '../../types/role.types';
import {
  Permission,
  PermissionGroup,
  EffectivePermission
} from '../../types/permission.types';
import { cn } from '@/lib/utils';

// Enhanced validation schema with enterprise requirements
const roleFormSchema = z.object({
  name: z.string()
    .min(3, 'Role name must be at least 3 characters')
    .max(50, 'Role name must not exceed 50 characters')
    .regex(/^[a-zA-Z0-9_-\s]+$/, 'Role name can only contain letters, numbers, spaces, hyphens, and underscores'),
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  category: z.string().optional(),
  priority: z.number().min(1).max(100).default(50),
  isActive: z.boolean().default(true),
  isSystemRole: z.boolean().default(false),
  expiresAt: z.string().optional(),
  maxUsers: z.number().min(0).optional(),
  requireApproval: z.boolean().default(false),
  autoAssign: z.boolean().default(false),
  conditions: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

type RoleFormData = z.infer<typeof roleFormSchema>;

interface RoleCreateEditProps {
  isOpen: boolean;
  onClose: () => void;
  role?: Role | null;
  mode: 'create' | 'edit' | 'duplicate';
  onSuccess?: (role: Role) => void;
  parentRole?: Role;
  template?: RoleTemplate;
}

const roleCategories = [
  { value: 'administrative', label: 'Administrative', icon: Crown, color: 'bg-purple-500' },
  { value: 'operational', label: 'Operational', icon: Workflow, color: 'bg-blue-500' },
  { value: 'analytical', label: 'Analytical', icon: Gauge, color: 'bg-green-500' },
  { value: 'security', label: 'Security', icon: Shield, color: 'bg-red-500' },
  { value: 'compliance', label: 'Compliance', icon: FileText, color: 'bg-yellow-500' },
  { value: 'custom', label: 'Custom', icon: Settings, color: 'bg-gray-500' }
];

const permissionGroups: PermissionGroup[] = [
  {
    name: 'Data Sources',
    description: 'Permissions for data source management',
    permissions: [],
    color: 'bg-blue-500',
    icon: 'database'
  },
  {
    name: 'Catalog',
    description: 'Permissions for data catalog operations',
    permissions: [],
    color: 'bg-green-500',
    icon: 'book'
  },
  {
    name: 'Compliance',
    description: 'Permissions for compliance management',
    permissions: [],
    color: 'bg-yellow-500',
    icon: 'shield'
  },
  {
    name: 'Scan Logic',
    description: 'Permissions for scan operations',
    permissions: [],
    color: 'bg-purple-500',
    icon: 'search'
  },
  {
    name: 'Classifications',
    description: 'Permissions for data classification',
    permissions: [],
    color: 'bg-orange-500',
    icon: 'tag'
  },
  {
    name: 'Administration',
    description: 'System administration permissions',
    permissions: [],
    color: 'bg-red-500',
    icon: 'settings'
  }
];

export function RoleCreateEdit({
  isOpen,
  onClose,
  role,
  mode,
  onSuccess,
  parentRole,
  template
}: RoleCreateEditProps) {
  const { user, hasPermission } = useAuth();
  const { 
    createRole, 
    updateRole, 
    validateRole,
    getRoleTemplates,
    checkRoleConflicts,
    previewRoleChanges,
    duplicateRole
  } = useRoles();
  const { 
    permissions, 
    getPermissionsByGroup,
    getEffectivePermissions
  } = usePermissions();
  const { toast } = useToast();

  // Form and UI state
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());
  const [inheritedRoles, setInheritedRoles] = useState<Role[]>([]);
  const [roleValidation, setRoleValidation] = useState<RoleValidation | null>(null);
  const [conflicts, setConflicts] = useState<RoleConflict[]>([]);
  const [permissionSearch, setPermissionSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Data Sources']));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [effectivePermissions, setEffectivePermissions] = useState<EffectivePermission[]>([]);

  // Initialize form
  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'custom',
      priority: 50,
      isActive: true,
      isSystemRole: false,
      requireApproval: false,
      autoAssign: false
    }
  });

  // Initialize form data based on mode and role
  useEffect(() => {
    if (isOpen) {
      let initialData: Partial<RoleFormData> = {};

      if (mode === 'edit' && role) {
        initialData = {
          name: role.name,
          description: role.description || '',
          category: 'custom', // Would come from role metadata
          priority: 50, // Would come from role metadata
          isActive: true, // Would come from role metadata
          isSystemRole: false,
          requireApproval: false,
          autoAssign: false
        };
        
        // Set selected permissions
        if (role.permissions) {
          setSelectedPermissions(new Set(role.permissions.map(p => p.id)));
        }
        
        // Set inherited roles
        if (role.parents) {
          setInheritedRoles(role.parents);
        }
      } else if (mode === 'duplicate' && role) {
        initialData = {
          name: `${role.name} (Copy)`,
          description: role.description || '',
          category: 'custom',
          priority: 50,
          isActive: true,
          isSystemRole: false,
          requireApproval: false,
          autoAssign: false
        };
        
        if (role.permissions) {
          setSelectedPermissions(new Set(role.permissions.map(p => p.id)));
        }
      } else if (template) {
        initialData = {
          name: template.name,
          description: template.description,
          category: template.category,
          priority: 50,
          isActive: true,
          isSystemRole: template.is_builtin,
          requireApproval: false,
          autoAssign: false
        };
        
        setSelectedPermissions(new Set(template.permissions.map(p => p.id)));
      } else if (parentRole) {
        initialData = {
          name: '',
          description: `Child role of ${parentRole.name}`,
          category: 'custom',
          priority: 50,
          isActive: true,
          isSystemRole: false,
          requireApproval: false,
          autoAssign: false
        };
        
        setInheritedRoles([parentRole]);
      }

      // Reset form with initial data
      form.reset(initialData);
      
      // Reset other state
      setRoleValidation(null);
      setConflicts([]);
      setPermissionSearch('');
      setPreviewMode(false);
      setActiveTab('basic');
    }
  }, [isOpen, mode, role, template, parentRole, form]);

  // Real-time validation
  const validateRoleRealTime = useCallback(async (data: Partial<RoleFormData>) => {
    if (!data.name) return;

    try {
      const validation = await validateRole({
        name: data.name,
        description: data.description,
        permissions: Array.from(selectedPermissions),
        inheritedRoles: inheritedRoles.map(r => r.id)
      });
      
      setRoleValidation(validation);
      
      // Check for conflicts
      const conflictCheck = await checkRoleConflicts({
        name: data.name,
        permissions: Array.from(selectedPermissions),
        excludeRoleId: role?.id
      });
      
      setConflicts(conflictCheck);
    } catch (error) {
      console.error('Real-time validation failed:', error);
    }
  }, [selectedPermissions, inheritedRoles, role?.id, validateRole, checkRoleConflicts]);

  // Watch form changes for real-time validation
  const watchedValues = form.watch();
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateRoleRealTime(watchedValues);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [watchedValues, validateRoleRealTime]);

  // Calculate effective permissions
  useEffect(() => {
    const calculateEffective = async () => {
      if (selectedPermissions.size > 0 || inheritedRoles.length > 0) {
        try {
          const effective = await getEffectivePermissions({
            directPermissions: Array.from(selectedPermissions),
            inheritedRoles: inheritedRoles.map(r => r.id)
          });
          setEffectivePermissions(effective);
        } catch (error) {
          console.error('Failed to calculate effective permissions:', error);
        }
      } else {
        setEffectivePermissions([]);
      }
    };

    calculateEffective();
  }, [selectedPermissions, inheritedRoles, getEffectivePermissions]);

  // Handle permission selection
  const handlePermissionToggle = useCallback((permissionId: number) => {
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  }, []);

  // Handle group expansion
  const toggleGroup = useCallback((groupName: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  }, []);

  // Handle form submission
  const onSubmit = async (data: RoleFormData) => {
    if (!hasPermission('rbac.role.create') && mode === 'create') {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to create roles.',
        variant: 'destructive'
      });
      return;
    }

    if (!hasPermission('rbac.role.edit') && mode === 'edit') {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to edit roles.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      let result: Role;
      
      const roleData = {
        name: data.name,
        description: data.description,
        permissions: Array.from(selectedPermissions),
        inheritedRoles: inheritedRoles.map(r => r.id),
        metadata: {
          category: data.category,
          priority: data.priority,
          isActive: data.isActive,
          isSystemRole: data.isSystemRole,
          requireApproval: data.requireApproval,
          autoAssign: data.autoAssign,
          expiresAt: data.expiresAt,
          maxUsers: data.maxUsers,
          conditions: data.conditions,
          createdBy: user?.id,
          createdAt: new Date().toISOString()
        }
      };

      if (mode === 'create' || mode === 'duplicate') {
        if (mode === 'duplicate' && role) {
          result = await duplicateRole(role.id, roleData);
        } else {
          result = await createRole(roleData);
        }
        
        toast({
          title: 'Role Created',
          description: `Role "${data.name}" has been created successfully.`,
        });
      } else {
        if (!role) throw new Error('Role is required for edit mode');
        
        result = await updateRole(role.id, roleData);
        
        toast({
          title: 'Role Updated',
          description: `Role "${data.name}" has been updated successfully.`,
        });
      }

      onSuccess?.(result);
      onClose();
    } catch (error) {
      console.error('Role operation failed:', error);
      toast({
        title: 'Operation Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle preview mode
  const handlePreview = async () => {
    const formData = form.getValues();
    try {
      const preview = await previewRoleChanges({
        roleId: role?.id,
        changes: {
          name: formData.name,
          description: formData.description,
          permissions: Array.from(selectedPermissions),
          inheritedRoles: inheritedRoles.map(r => r.id)
        }
      });
      
      setPreviewMode(true);
      // Handle preview results
    } catch (error) {
      toast({
        title: 'Preview Failed',
        description: 'Unable to generate preview. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Filter permissions based on search
  const filteredPermissions = permissions.filter(permission =>
    permission.action.toLowerCase().includes(permissionSearch.toLowerCase()) ||
    permission.resource.toLowerCase().includes(permissionSearch.toLowerCase())
  );

  // Group permissions by resource type
  const groupedPermissions = filteredPermissions.reduce((groups, permission) => {
    const group = permission.resource.split('.')[0] || 'Other';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(permission);
    return groups;
  }, {} as Record<string, Permission[]>);

  const title = mode === 'create' ? 'Create New Role' : 
                mode === 'edit' ? 'Edit Role' : 'Duplicate Role';

  const description = mode === 'create' ? 'Create a new role with specific permissions and inheritance settings.' :
                     mode === 'edit' ? 'Modify the role settings, permissions, and inheritance.' :
                     'Create a copy of the existing role with modified settings.';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Basic
                </TabsTrigger>
                <TabsTrigger value="permissions" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Permissions
                </TabsTrigger>
                <TabsTrigger value="inheritance" className="flex items-center gap-2">
                  <TreePine className="h-4 w-4" />
                  Inheritance
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Advanced
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role Name *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter role name"
                              className={cn(
                                roleValidation && !roleValidation.is_valid && 
                                roleValidation.errors.some(e => e.includes('name')) &&
                                'border-red-500'
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                          {roleValidation && roleValidation.errors.map((error, idx) => (
                            error.includes('name') && (
                              <p key={idx} className="text-sm text-red-500">{error}</p>
                            )
                          ))}
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Describe the role's purpose and responsibilities"
                              className="min-h-[100px]"
                            />
                          </FormControl>
                          <FormDescription>
                            Provide a clear description of what this role is intended for.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {roleCategories.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  <div className="flex items-center gap-2">
                                    <div className={cn("w-3 h-3 rounded-full", category.color)} />
                                    <category.icon className="h-4 w-4" />
                                    {category.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Role Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Active Role</FormLabel>
                                <FormDescription className="text-xs">
                                  Whether this role can be assigned to users
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

                        <FormField
                          control={form.control}
                          name="requireApproval"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Require Approval</FormLabel>
                                <FormDescription className="text-xs">
                                  Role assignments require manager approval
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

                        <FormField
                          control={form.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Priority (1-100)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  max={100}
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription className="text-xs">
                                Higher priority roles take precedence in conflicts
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    {/* Validation Results */}
                    {roleValidation && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            {roleValidation.is_valid ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                            Validation Results
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {roleValidation.errors.length > 0 && (
                            <Alert variant="destructive" className="mb-2">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertTitle>Errors</AlertTitle>
                              <AlertDescription>
                                <ul className="list-disc list-inside space-y-1">
                                  {roleValidation.errors.map((error, idx) => (
                                    <li key={idx} className="text-xs">{error}</li>
                                  ))}
                                </ul>
                              </AlertDescription>
                            </Alert>
                          )}
                          
                          {roleValidation.warnings.length > 0 && (
                            <Alert className="mb-2">
                              <Info className="h-4 w-4" />
                              <AlertTitle>Warnings</AlertTitle>
                              <AlertDescription>
                                <ul className="list-disc list-inside space-y-1">
                                  {roleValidation.warnings.map((warning, idx) => (
                                    <li key={idx} className="text-xs">{warning}</li>
                                  ))}
                                </ul>
                              </AlertDescription>
                            </Alert>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Permissions Tab */}
              <TabsContent value="permissions" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Permission Assignment</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search permissions..."
                        value={permissionSearch}
                        onChange={(e) => setPermissionSearch(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                    <Badge variant="secondary">
                      {selectedPermissions.size} selected
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Available Permissions</CardTitle>
                      <CardDescription>
                        Select permissions to assign to this role
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[500px]">
                        <div className="space-y-2">
                          {Object.entries(groupedPermissions).map(([groupName, groupPermissions]) => (
                            <div key={groupName}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleGroup(groupName)}
                                className="w-full justify-start"
                              >
                                {expandedGroups.has(groupName) ? (
                                  <ChevronDown className="h-4 w-4 mr-2" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 mr-2" />
                                )}
                                {groupName}
                                <Badge variant="outline" className="ml-auto">
                                  {groupPermissions.length}
                                </Badge>
                              </Button>
                              
                              <AnimatePresence>
                                {expandedGroups.has(groupName) && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="pl-6 space-y-1">
                                      {groupPermissions.map((permission) => (
                                        <div
                                          key={permission.id}
                                          className="flex items-center space-x-2 p-2 rounded hover:bg-muted cursor-pointer"
                                          onClick={() => handlePermissionToggle(permission.id)}
                                        >
                                          <Checkbox
                                            checked={selectedPermissions.has(permission.id)}
                                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                                          />
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                              {permission.action}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                              {permission.resource}
                                            </p>
                                          </div>
                                          {permission.conditions && (
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger>
                                                  <Lock className="h-3 w-3 text-yellow-500" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  <p>Has conditions</p>
                                                </TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Effective Permissions</CardTitle>
                      <CardDescription>
                        All permissions this role will have (including inherited)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[500px]">
                        <div className="space-y-2">
                          {effectivePermissions.map((permission) => (
                            <div
                              key={permission.id}
                              className={cn(
                                "flex items-center justify-between p-2 rounded border",
                                permission.is_effective ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                              )}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {permission.action}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {permission.resource}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Source: {permission.source}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {permission.is_effective ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <X className="h-4 w-4 text-red-500" />
                                )}
                                {permission.conditions && (
                                  <Lock className="h-3 w-3 text-yellow-500" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Inheritance Tab */}
              <TabsContent value="inheritance" className="space-y-4">
                <div className="flex items-center gap-2">
                  <TreePine className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Role Inheritance</h3>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Parent Roles</CardTitle>
                      <CardDescription>
                        Roles this role inherits permissions from
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {inheritedRoles.map((parentRole) => (
                          <div
                            key={parentRole.id}
                            className="flex items-center justify-between p-3 border rounded"
                          >
                            <div>
                              <p className="font-medium">{parentRole.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {parentRole.description}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setInheritedRoles(prev => 
                                  prev.filter(r => r.id !== parentRole.id)
                                );
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        
                        {inheritedRoles.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <TreePine className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No parent roles assigned</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Inheritance Hierarchy</CardTitle>
                      <CardDescription>
                        Visual representation of the inheritance chain
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {/* Inheritance visualization would go here */}
                        <div className="text-center py-8 text-muted-foreground">
                          <Network className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>Inheritance diagram</p>
                          <p className="text-xs">Shows the complete inheritance tree</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Advanced Settings</h3>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="maxUsers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Users</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              placeholder="No limit"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum number of users that can have this role
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expiresAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiration Date</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            When this role expires and becomes inactive
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="conditions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Access Conditions (JSON)</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder='{"department": "Engineering", "region": "US"}'
                              className="min-h-[100px] font-mono text-xs"
                            />
                          </FormControl>
                          <FormDescription>
                            ABAC conditions for role assignment and access
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">System Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="isSystemRole"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>System Role</FormLabel>
                                <FormDescription className="text-xs">
                                  Built-in role that cannot be deleted
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={!hasPermission('rbac.system.manage')}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="autoAssign"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Auto-Assign</FormLabel>
                                <FormDescription className="text-xs">
                                  Automatically assign to new users
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
                      </CardContent>
                    </Card>

                    {/* Conflicts Display */}
                    {conflicts.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            Detected Conflicts
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {conflicts.map((conflict, idx) => (
                              <Alert key={idx} variant="destructive">
                                <AlertTitle className="text-sm">{conflict.type}</AlertTitle>
                                <AlertDescription className="text-xs">
                                  {conflict.description}
                                </AlertDescription>
                              </Alert>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Preview Tab */}
              <TabsContent value="preview" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Role Preview</h3>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreview}
                    disabled={isLoading}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Refresh Preview
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Role Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium">Name</p>
                          <p className="text-sm text-muted-foreground">{form.watch('name')}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Description</p>
                          <p className="text-sm text-muted-foreground">
                            {form.watch('description') || 'No description'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Category</p>
                          <p className="text-sm text-muted-foreground">
                            {roleCategories.find(c => c.value === form.watch('category'))?.label}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Direct Permissions</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedPermissions.size} permissions
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Inherited Roles</p>
                          <p className="text-sm text-muted-foreground">
                            {inheritedRoles.length} parent roles
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Effective Permissions</p>
                          <p className="text-sm text-muted-foreground">
                            {effectivePermissions.filter(p => p.is_effective).length} total permissions
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Impact Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Validation Status</span>
                          {roleValidation?.is_valid ? (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Valid
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Issues Found
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Conflicts</span>
                          <Badge variant={conflicts.length > 0 ? "destructive" : "default"}>
                            {conflicts.length} conflicts
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Estimated Users Affected</span>
                          <Badge variant="outline">
                            {mode === 'edit' ? (role?.users?.length || 0) : 0} users
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {mode === 'edit' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    disabled={isLoading}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || (roleValidation && !roleValidation.is_valid)}
                  className="min-w-[100px]"
                >
                  {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />}
                  {mode === 'create' || mode === 'duplicate' ? 'Create Role' : 'Update Role'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}