'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Users,
  User,
  Crown,
  Shield,
  Building,
  Target,
  Tag,
  Plus,
  Minus,
  X,
  Save,
  ArrowLeft,
  Check,
  ChevronsUpDown,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  HelpCircle,
  RefreshCw,
  Settings,
  Key,
  Lock,
  Unlock,
  Globe,
  Network,
  Database,
  Server,
  FileText,
  Archive,
  BookOpen,
  Layers,
  Workflow,
  Activity,
  BarChart3,
  PieChart,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Home,
  Code,
  Terminal,
  Monitor,
  Cpu,
} from 'lucide-react';

// Hooks and Services
import { useGroups } from '../../hooks/useGroups';
import { useUsers } from '../../hooks/useUsers';
import { useRoles } from '../../hooks/useRoles';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissions } from '../../hooks/usePermissions';

// Types
import type { Group } from '../../types/group.types';
import type { User as UserType } from '../../types/user.types';
import type { Role } from '../../types/role.types';

// Utils
import { hasPermission } from '../../utils/permission.utils';
import { formatDate } from '../../utils/format.utils';

// Validation Schema
const groupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  description: z.string().optional(),
  type: z.enum(['department', 'project', 'security', 'custom']),
  is_active: z.boolean().default(true),
  parent_group_id: z.number().optional(),
  owner_id: z.number().optional(),
  auto_assignment_rules: z.array(z.object({
    condition: z.string(),
    action: z.string(),
    priority: z.number()
  })).optional(),
  settings: z.object({
    allow_self_join: z.boolean().default(false),
    require_approval: z.boolean().default(true),
    auto_remove_inactive: z.boolean().default(false),
    max_members: z.number().optional(),
    notification_settings: z.object({
      member_added: z.boolean().default(true),
      member_removed: z.boolean().default(true),
      role_changed: z.boolean().default(true),
      settings_updated: z.boolean().default(false),
    }).optional(),
    compliance_settings: z.object({
      data_classification: z.string().optional(),
      retention_policy: z.string().optional(),
      audit_level: z.enum(['basic', 'detailed', 'comprehensive']).default('basic'),
      require_justification: z.boolean().default(false),
    }).optional(),
    integration_settings: z.object({
      ldap_sync: z.boolean().default(false),
      ldap_group_dn: z.string().optional(),
      sync_schedule: z.string().optional(),
      external_id: z.string().optional(),
    }).optional(),
  }).optional(),
  metadata: z.object({
    tags: z.array(z.string()).optional(),
    custom_fields: z.record(z.string(), z.any()).optional(),
    cost_center: z.string().optional(),
    department_code: z.string().optional(),
    project_code: z.string().optional(),
    manager_email: z.string().email().optional(),
    budget_allocated: z.number().optional(),
    review_schedule: z.string().optional(),
  }).optional(),
});

interface GroupCreateEditProps {
  group?: Group;
  onSave: (groupData: Partial<Group>) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
  className?: string;
}

interface AutoAssignmentRule {
  id: string;
  condition: string;
  action: string;
  priority: number;
  enabled: boolean;
}

interface NotificationSettings {
  member_added: boolean;
  member_removed: boolean;
  role_changed: boolean;
  settings_updated: boolean;
}

interface ComplianceSettings {
  data_classification?: string;
  retention_policy?: string;
  audit_level: 'basic' | 'detailed' | 'comprehensive';
  require_justification: boolean;
}

interface IntegrationSettings {
  ldap_sync: boolean;
  ldap_group_dn?: string;
  sync_schedule?: string;
  external_id?: string;
}

const GROUP_TYPES = [
  { 
    value: 'department', 
    label: 'Department', 
    icon: Building, 
    color: 'bg-blue-100 text-blue-800',
    description: 'Organizational department or division'
  },
  { 
    value: 'project', 
    label: 'Project', 
    icon: Target, 
    color: 'bg-green-100 text-green-800',
    description: 'Project team or working group'
  },
  { 
    value: 'security', 
    label: 'Security', 
    icon: Shield, 
    color: 'bg-red-100 text-red-800',
    description: 'Security or compliance group'
  },
  { 
    value: 'custom', 
    label: 'Custom', 
    icon: Tag, 
    color: 'bg-purple-100 text-purple-800',
    description: 'Custom group type'
  },
];

const AUDIT_LEVELS = [
  { value: 'basic', label: 'Basic', description: 'Log major actions only' },
  { value: 'detailed', label: 'Detailed', description: 'Log all member actions' },
  { value: 'comprehensive', label: 'Comprehensive', description: 'Log all actions with metadata' },
];

const DATA_CLASSIFICATIONS = [
  { value: 'public', label: 'Public', color: 'bg-green-100 text-green-800' },
  { value: 'internal', label: 'Internal', color: 'bg-blue-100 text-blue-800' },
  { value: 'confidential', label: 'Confidential', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'restricted', label: 'Restricted', color: 'bg-red-100 text-red-800' },
];

const SYNC_SCHEDULES = [
  { value: 'hourly', label: 'Every Hour' },
  { value: 'daily', label: 'Daily at 2 AM' },
  { value: 'weekly', label: 'Weekly (Sunday)' },
  { value: 'manual', label: 'Manual Only' },
];

export const GroupCreateEdit: React.FC<GroupCreateEditProps> = ({
  group,
  onSave,
  onCancel,
  saving,
  className = ''
}) => {
  // State Management
  const [availableUsers, setAvailableUsers] = useState<UserType[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [parentGroups, setParentGroups] = useState<Group[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<UserType | null>(null);
  const [selectedParent, setSelectedParent] = useState<Group | null>(null);
  const [autoRules, setAutoRules] = useState<AutoAssignmentRule[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Popup State
  const [ownerSearchOpen, setOwnerSearchOpen] = useState(false);
  const [parentSearchOpen, setParentSearchOpen] = useState(false);

  const isEditing = !!group;

  // Hooks
  const { user: currentUser } = useCurrentUser();
  const { getGroups, validateGroupName } = useGroups();
  const { getUsers } = useUsers();
  const { getRoles } = useRoles();
  const { checkPermission } = usePermissions();

  // Form Setup
  const form = useForm<z.infer<typeof groupSchema>>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: group?.name || '',
      description: group?.description || '',
      type: (group?.type as any) || 'custom',
      is_active: group?.is_active !== undefined ? group.is_active : true,
      parent_group_id: group?.parent_group_id || undefined,
      owner_id: group?.owner_id || currentUser?.id,
      settings: {
        allow_self_join: group?.settings?.allow_self_join || false,
        require_approval: group?.settings?.require_approval !== undefined ? group.settings.require_approval : true,
        auto_remove_inactive: group?.settings?.auto_remove_inactive || false,
        max_members: group?.settings?.max_members || undefined,
        notification_settings: {
          member_added: group?.settings?.notification_settings?.member_added !== undefined ? group.settings.notification_settings.member_added : true,
          member_removed: group?.settings?.notification_settings?.member_removed !== undefined ? group.settings.notification_settings.member_removed : true,
          role_changed: group?.settings?.notification_settings?.role_changed !== undefined ? group.settings.notification_settings.role_changed : true,
          settings_updated: group?.settings?.notification_settings?.settings_updated || false,
        },
        compliance_settings: {
          data_classification: group?.settings?.compliance_settings?.data_classification || 'internal',
          retention_policy: group?.settings?.compliance_settings?.retention_policy || '',
          audit_level: (group?.settings?.compliance_settings?.audit_level as any) || 'basic',
          require_justification: group?.settings?.compliance_settings?.require_justification || false,
        },
        integration_settings: {
          ldap_sync: group?.settings?.integration_settings?.ldap_sync || false,
          ldap_group_dn: group?.settings?.integration_settings?.ldap_group_dn || '',
          sync_schedule: group?.settings?.integration_settings?.sync_schedule || 'daily',
          external_id: group?.settings?.integration_settings?.external_id || '',
        },
      },
      metadata: {
        tags: group?.metadata?.tags || [],
        custom_fields: group?.metadata?.custom_fields || {},
        cost_center: group?.metadata?.cost_center || '',
        department_code: group?.metadata?.department_code || '',
        project_code: group?.metadata?.project_code || '',
        manager_email: group?.metadata?.manager_email || '',
        budget_allocated: group?.metadata?.budget_allocated || undefined,
        review_schedule: group?.metadata?.review_schedule || '',
      },
    }
  });

  const watchedType = form.watch('type');
  const watchedLdapSync = form.watch('settings.integration_settings.ldap_sync');

  // Computed Properties
  const selectedGroupType = useMemo(() => {
    return GROUP_TYPES.find(type => type.value === watchedType);
  }, [watchedType]);

  const canManageGroups = useMemo(() => {
    return currentUser && hasPermission(currentUser, 'group:manage');
  }, [currentUser]);

  const canSetOwner = useMemo(() => {
    return currentUser && hasPermission(currentUser, 'group:set_owner');
  }, [currentUser]);

  // Data Loading
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersData, rolesData, groupsData] = await Promise.all([
        getUsers(),
        getRoles(),
        getGroups({ exclude_id: group?.id })
      ]);

      setAvailableUsers(usersData.items);
      setAvailableRoles(rolesData.items);
      setParentGroups(groupsData.items);

      // Set selected owner if editing
      if (group?.owner_id) {
        const owner = usersData.items.find(u => u.id === group.owner_id);
        setSelectedOwner(owner || null);
      }

      // Set selected parent if editing
      if (group?.parent_group_id) {
        const parent = groupsData.items.find(g => g.id === group.parent_group_id);
        setSelectedParent(parent || null);
      }

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load form data');
    } finally {
      setLoading(false);
    }
  }, [group, getUsers, getRoles, getGroups]);

  // Initial Load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Form Handlers
  const onSubmit = useCallback(async (data: z.infer<typeof groupSchema>) => {
    if (!canManageGroups) return;

    setError(null);
    setValidationErrors({});

    try {
      // Validate group name uniqueness
      if (!isEditing || data.name !== group?.name) {
        const nameValid = await validateGroupName(data.name);
        if (!nameValid) {
          setValidationErrors({ name: 'Group name already exists' });
          return;
        }
      }

      // Prepare data for save
      const saveData = {
        ...data,
        owner_id: selectedOwner?.id || currentUser?.id,
        parent_group_id: selectedParent?.id || undefined,
      };

      await onSave(saveData);
    } catch (error) {
      console.error('Error saving group:', error);
      setError('Failed to save group');
    }
  }, [canManageGroups, isEditing, group, validateGroupName, selectedOwner, selectedParent, currentUser, onSave]);

  const handleNameValidation = useCallback(async (name: string) => {
    if (!name || name === group?.name) return;

    try {
      const isValid = await validateGroupName(name);
      if (!isValid) {
        form.setError('name', { message: 'Group name already exists' });
      }
    } catch (err) {
      console.error('Error validating name:', err);
    }
  }, [group?.name, validateGroupName, form]);

  const handleAddTag = useCallback(() => {
    if (!tagInput.trim()) return;
    
    const currentTags = form.getValues('metadata.tags') || [];
    if (!currentTags.includes(tagInput.trim())) {
      form.setValue('metadata.tags', [...currentTags, tagInput.trim()]);
      setTagInput('');
    }
  }, [tagInput, form]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    const currentTags = form.getValues('metadata.tags') || [];
    form.setValue('metadata.tags', currentTags.filter(tag => tag !== tagToRemove));
  }, [form]);

  const handleAddAutoRule = useCallback(() => {
    const newRule: AutoAssignmentRule = {
      id: Date.now().toString(),
      condition: '',
      action: '',
      priority: autoRules.length + 1,
      enabled: true,
    };
    setAutoRules([...autoRules, newRule]);
  }, [autoRules]);

  const handleRemoveAutoRule = useCallback((ruleId: string) => {
    setAutoRules(autoRules.filter(rule => rule.id !== ruleId));
  }, [autoRules]);

  const handleUpdateAutoRule = useCallback((ruleId: string, updates: Partial<AutoAssignmentRule>) => {
    setAutoRules(autoRules.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
  }, [autoRules]);

  // Render Methods
  const renderBasicTab = () => (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name *</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter group name"
                {...field}
                onBlur={(e) => {
                  field.onBlur();
                  handleNameValidation(e.target.value);
                }}
              />
            </FormControl>
            <FormDescription>
              A unique identifier for this group
            </FormDescription>
            <FormMessage />
            {validationErrors.name && (
              <div className="text-sm text-red-600">{validationErrors.name}</div>
            )}
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select group type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {GROUP_TYPES.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-2">
                        <IconComponent className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {selectedGroupType && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start space-x-3">
            {React.createElement(selectedGroupType.icon, { className: "h-5 w-5 text-blue-600 mt-0.5" })}
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                {selectedGroupType.label} Group
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                {selectedGroupType.description}
              </p>
            </div>
          </div>
        </div>
      )}

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe the purpose and scope of this group..."
                className="resize-none"
                rows={3}
                {...field}
              />
            </FormControl>
            <FormDescription>
              A detailed description of the group's purpose and responsibilities
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Owner Selection */}
      {canSetOwner && (
        <div>
          <Label className="text-sm font-medium">Group Owner</Label>
          <Popover open={ownerSearchOpen} onOpenChange={setOwnerSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between mt-2"
              >
                {selectedOwner ? (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{selectedOwner.first_name} {selectedOwner.last_name}</span>
                  </div>
                ) : (
                  "Select group owner"
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search users..." />
                <CommandEmpty>No users found.</CommandEmpty>
                <CommandGroup>
                  {availableUsers.map((user) => (
                    <CommandItem
                      key={user.id}
                      onSelect={() => {
                        setSelectedOwner(user);
                        form.setValue('owner_id', user.id);
                        setOwnerSearchOpen(false);
                      }}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          selectedOwner?.id === user.id ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <div>
                          <div>{user.first_name} {user.last_name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <div className="text-sm text-gray-500 mt-1">
            The user responsible for managing this group
          </div>
        </div>
      )}

      {/* Parent Group Selection */}
      <div>
        <Label className="text-sm font-medium">Parent Group (Optional)</Label>
        <Popover open={parentSearchOpen} onOpenChange={setParentSearchOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between mt-2"
            >
              {selectedParent ? (
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>{selectedParent.name}</span>
                </div>
              ) : (
                "Select parent group"
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search groups..." />
              <CommandEmpty>No groups found.</CommandEmpty>
              <CommandGroup>
                {parentGroups.map((group) => (
                  <CommandItem
                    key={group.id}
                    onSelect={() => {
                      setSelectedParent(group);
                      form.setValue('parent_group_id', group.id);
                      setParentSearchOpen(false);
                    }}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        selectedParent?.id === group.id ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <div>
                        <div>{group.name}</div>
                        <div className="text-xs text-gray-500">{group.type}</div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        <div className="text-sm text-gray-500 mt-1">
          Place this group under another group in the hierarchy
        </div>
      </div>

      <FormField
        control={form.control}
        name="is_active"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Active Group</FormLabel>
              <FormDescription>
                When enabled, this group is active and members can be assigned
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
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      {/* Membership Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Membership Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="settings.allow_self_join"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Allow Self-Join</FormLabel>
                  <FormDescription>
                    Users can request to join this group themselves
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
            name="settings.require_approval"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Require Approval</FormLabel>
                  <FormDescription>
                    New members must be approved by group administrators
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
            name="settings.auto_remove_inactive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Auto-Remove Inactive</FormLabel>
                  <FormDescription>
                    Automatically remove members who haven't been active for 90 days
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
            name="settings.max_members"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Members</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="No limit"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>
                  Leave empty for no limit
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="settings.notification_settings.member_added"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm">Member Added</FormLabel>
                  <FormDescription className="text-xs">
                    Notify when new members are added
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
            name="settings.notification_settings.member_removed"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm">Member Removed</FormLabel>
                  <FormDescription className="text-xs">
                    Notify when members are removed
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
            name="settings.notification_settings.role_changed"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm">Role Changed</FormLabel>
                  <FormDescription className="text-xs">
                    Notify when member roles are changed
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
            name="settings.notification_settings.settings_updated"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm">Settings Updated</FormLabel>
                  <FormDescription className="text-xs">
                    Notify when group settings are modified
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
    </div>
  );

  const renderComplianceTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Compliance Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="settings.compliance_settings.data_classification"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Classification</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select classification" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DATA_CLASSIFICATIONS.map((classification) => (
                      <SelectItem key={classification.value} value={classification.value}>
                        <div className="flex items-center space-x-2">
                          <Badge className={classification.color}>
                            {classification.label}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Classification level for data access and handling
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="settings.compliance_settings.retention_policy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Retention Policy</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., 7 years, 90 days, indefinite"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  How long group data and membership records should be retained
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="settings.compliance_settings.audit_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Audit Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audit level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {AUDIT_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <div>
                          <div className="font-medium">{level.label}</div>
                          <div className="text-xs text-gray-500">{level.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="settings.compliance_settings.require_justification"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Require Justification</FormLabel>
                  <FormDescription>
                    Require justification for membership changes
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
    </div>
  );

  const renderIntegrationTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Network className="h-5 w-5" />
            <span>LDAP Integration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="settings.integration_settings.ldap_sync"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Enable LDAP Sync</FormLabel>
                  <FormDescription>
                    Synchronize group membership with LDAP directory
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

          {watchedLdapSync && (
            <>
              <FormField
                control={form.control}
                name="settings.integration_settings.ldap_group_dn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LDAP Group DN</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="cn=GroupName,ou=Groups,dc=company,dc=com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Distinguished Name of the LDAP group to sync with
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="settings.integration_settings.sync_schedule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sync Schedule</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sync schedule" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SYNC_SCHEDULES.map((schedule) => (
                          <SelectItem key={schedule.value} value={schedule.value}>
                            {schedule.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="settings.integration_settings.external_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>External ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="External system identifier"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Unique identifier from external system
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderMetadataTab = () => (
    <div className="space-y-6">
      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Tag className="h-5 w-5" />
            <span>Tags</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button type="button" size="sm" onClick={handleAddTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(form.getValues('metadata.tags') || []).map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <span>{tag}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Business Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="metadata.cost_center"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost Center</FormLabel>
                  <FormControl>
                    <Input placeholder="CC-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metadata.department_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Code</FormLabel>
                  <FormControl>
                    <Input placeholder="IT-DEV" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="metadata.project_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Code</FormLabel>
                  <FormControl>
                    <Input placeholder="PRJ-2024-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metadata.manager_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manager Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="manager@company.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="metadata.budget_allocated"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Allocated</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="100000"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metadata.review_schedule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review Schedule</FormLabel>
                  <FormControl>
                    <Input placeholder="Quarterly" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {isEditing ? `Edit ${group?.name}` : 'Create New Group'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isEditing 
                ? 'Update group settings and configuration'
                : 'Configure a new group with all necessary details'
              }
            </p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="integration">Integration</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-6">
              {renderBasicTab()}
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              {renderSettingsTab()}
            </TabsContent>

            <TabsContent value="compliance" className="mt-6">
              {renderComplianceTab()}
            </TabsContent>

            <TabsContent value="integration" className="mt-6">
              {renderIntegrationTab()}
            </TabsContent>

            <TabsContent value="metadata" className="mt-6">
              {renderMetadataTab()}
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !canManageGroups}
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update Group' : 'Create Group'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
};

