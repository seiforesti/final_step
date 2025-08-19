'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Database,
  Server,
  FileText,
  Settings,
  Plus,
  Minus,
  Save,
  X,
  Upload,
  Download,
  Eye,
  EyeOff,
  Check,
  ChevronsUpDown,
  Calendar,
  Clock,
  Tag,
  Shield,
  Lock,
  Key,
  Globe,
  Network,
  Activity,
  AlertTriangle,
  Info,
  HelpCircle,
  Lightbulb,
  Zap,
  Target,
  Layers,
  Archive,
  BookOpen,
  Workflow,
  BarChart3,
  PieChart,
  Search,
  Filter,
  RefreshCw,
  Copy,
  Trash2,
  Edit,
  Share,
  Star,
  Heart,
  Bookmark,
  Flag,
  MessageSquare,
  Bell,
  Mail,
  Phone,
  Building,
  Home,
  Code,
  Terminal,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Watch,
  Tv,
  Camera,
  Mic,
  Volume2,
  Headphones,
  Radio,
  Bluetooth,
  Wifi,
  Signal,
  Battery,
  Power,
  Plug,
  Cpu,
  HardDrive,
  Memory,
  Usb,
  Printer,
  Scanner,
  Gamepad2,
  Joystick,
  MousePointer,
  Keyboard,
  Speaker,
} from 'lucide-react';

// Hooks and Services
import { useResources } from '../../hooks/useResources';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissions } from '../../hooks/usePermissions';

// Types
import type {
  Resource,
  ResourceCreate,
  ResourceUpdate,
  DataSourceResource,
  SchemaResource,
  TableResource,
  ColumnResource,
} from '../../types/resource.types';
import type { User } from '../../types/user.types';

// Utils
import { validateResourceAccess, hasPermission } from '../../utils/permission.utils';
import { formatBytes, formatNumber } from '../../utils/format.utils';

// Validation Schema
const baseResourceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  type: z.string().min(1, 'Type is required'),
  parent_id: z.number().optional(),
  engine: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  classification: z.string().optional(),
  sensitivity: z.enum(['public', 'internal', 'confidential', 'restricted']).optional(),
  retention_period: z.string().optional(),
  encryption_enabled: z.boolean().optional(),
  backup_enabled: z.boolean().optional(),
  monitoring_enabled: z.boolean().optional(),
  compliance_frameworks: z.array(z.string()).optional(),
});

const dataSourceSchema = baseResourceSchema.extend({
  type: z.literal('data_source'),
  connection_string: z.string().optional(),
  host: z.string().optional(),
  port: z.number().optional(),
  database_name: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  ssl_enabled: z.boolean().optional(),
  timeout: z.number().optional(),
  pool_size: z.number().optional(),
});

const databaseSchema = baseResourceSchema.extend({
  type: z.literal('database'),
  charset: z.string().optional(),
  collation: z.string().optional(),
  size_limit: z.number().optional(),
  backup_schedule: z.string().optional(),
});

const tableSchema = baseResourceSchema.extend({
  type: z.literal('table'),
  row_count: z.number().optional(),
  column_count: z.number().optional(),
  size_bytes: z.number().optional(),
  partition_key: z.string().optional(),
  sort_key: z.string().optional(),
  indexes: z.array(z.string()).optional(),
});

const resourceSchema = z.discriminatedUnion('type', [
  dataSourceSchema,
  databaseSchema,
  tableSchema,
  baseResourceSchema.extend({
    type: z.enum(['schema', 'view', 'column', 'file', 'folder', 'api', 'service', 'pipeline', 'job', 'report', 'dashboard', 'collection', 'document'])
  })
]);

interface ResourceCreateEditProps {
  resource?: Resource;
  parentResource?: Resource;
  onSave?: (resource: Resource) => void;
  onCancel?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: any;
  latency?: number;
}

interface ValidationResult {
  field: string;
  valid: boolean;
  message: string;
  suggestion?: string;
}

const RESOURCE_TYPES = [
  { value: 'data_source', label: 'Data Source', icon: Server, description: 'External data connection' },
  { value: 'database', label: 'Database', icon: Database, description: 'Database instance' },
  { value: 'schema', label: 'Schema', icon: Layers, description: 'Database schema' },
  { value: 'table', label: 'Table', icon: FileText, description: 'Data table' },
  { value: 'view', label: 'View', icon: Eye, description: 'Database view' },
  { value: 'column', label: 'Column', icon: Tag, description: 'Table column' },
  { value: 'file', label: 'File', icon: FileText, description: 'Data file' },
  { value: 'folder', label: 'Folder', icon: Archive, description: 'File directory' },
  { value: 'api', label: 'API', icon: Network, description: 'API endpoint' },
  { value: 'service', label: 'Service', icon: Zap, description: 'Data service' },
  { value: 'pipeline', label: 'Pipeline', icon: Workflow, description: 'Data pipeline' },
  { value: 'job', label: 'Job', icon: Activity, description: 'Data processing job' },
  { value: 'report', label: 'Report', icon: BarChart3, description: 'Analytics report' },
  { value: 'dashboard', label: 'Dashboard', icon: PieChart, description: 'Data dashboard' },
  { value: 'collection', label: 'Collection', icon: Archive, description: 'Document collection' },
  { value: 'document', label: 'Document', icon: BookOpen, description: 'Data document' },
];

const ENGINES = [
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'oracle', label: 'Oracle' },
  { value: 'sqlserver', label: 'SQL Server' },
  { value: 'mongodb', label: 'MongoDB' },
  { value: 'redis', label: 'Redis' },
  { value: 'elasticsearch', label: 'Elasticsearch' },
  { value: 'cassandra', label: 'Cassandra' },
  { value: 'snowflake', label: 'Snowflake' },
  { value: 'bigquery', label: 'BigQuery' },
  { value: 'redshift', label: 'Redshift' },
  { value: 's3', label: 'Amazon S3' },
  { value: 'azure_blob', label: 'Azure Blob' },
  { value: 'gcs', label: 'Google Cloud Storage' },
];

const CLASSIFICATION_LEVELS = [
  { value: 'public', label: 'Public', color: 'bg-green-100 text-green-800' },
  { value: 'internal', label: 'Internal', color: 'bg-blue-100 text-blue-800' },
  { value: 'confidential', label: 'Confidential', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'restricted', label: 'Restricted', color: 'bg-red-100 text-red-800' },
];

const COMPLIANCE_FRAMEWORKS = [
  'GDPR', 'HIPAA', 'SOX', 'PCI-DSS', 'CCPA', 'SOC2', 'ISO27001', 'NIST'
];

const ResourceCreateEdit: React.FC<ResourceCreateEditProps> = ({
  resource,
  parentResource,
  onSave,
  onCancel,
  open = true,
  onOpenChange,
  className = ''
}) => {
  // State Management
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [showPassword, setShowPassword] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [selectedParent, setSelectedParent] = useState<Resource | null>(parentResource || null);
  const [parentSearchOpen, setParentSearchOpen] = useState(false);

  const isEditing = !!resource;

  // Hooks
  const { user: currentUser } = useCurrentUser();
  const {
    createResource,
    updateResource,
    getResourcesByType,
    testResourceConnection,
    validateResourceConfig
  } = useResources();
  const { checkPermission } = usePermissions();

  // Form Setup
  const form = useForm<z.infer<typeof resourceSchema>>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      name: resource?.name || '',
      type: resource?.type || 'table',
      parent_id: resource?.parent_id || parentResource?.id,
      engine: resource?.engine || '',
      description: resource?.details?.description || '',
      tags: resource?.details?.tags || [],
      classification: resource?.details?.classification || 'internal',
      sensitivity: resource?.details?.sensitivity || 'internal',
      retention_period: resource?.details?.retention_period || '',
      encryption_enabled: resource?.details?.encryption_enabled || true,
      backup_enabled: resource?.details?.backup_enabled || true,
      monitoring_enabled: resource?.details?.monitoring_enabled || true,
      compliance_frameworks: resource?.details?.compliance_frameworks || [],
      ...(resource?.details || {})
    }
  });

  const watchedType = form.watch('type');
  const watchedParentId = form.watch('parent_id');

  // Computed Properties
  const canCreate = useMemo(() => {
    return currentUser && hasPermission(currentUser, 'resource:create');
  }, [currentUser]);

  const canEdit = useMemo(() => {
    return currentUser && resource && hasPermission(currentUser, 'resource:update', resource);
  }, [currentUser, resource]);

  const selectedResourceType = useMemo(() => {
    return RESOURCE_TYPES.find(type => type.value === watchedType);
  }, [watchedType]);

  const availableParents = useMemo(() => {
    // Logic to determine available parents based on resource type hierarchy
    if (!watchedType) return [];
    
    const hierarchyRules: Record<string, string[]> = {
      'database': ['data_source'],
      'schema': ['database'],
      'table': ['schema', 'database'],
      'view': ['schema', 'database'],
      'column': ['table', 'view'],
      'file': ['folder', 'data_source'],
      'folder': ['data_source', 'folder'],
    };

    return hierarchyRules[watchedType] || [];
  }, [watchedType]);

  // Form Handlers
  const onSubmit = useCallback(async (data: z.infer<typeof resourceSchema>) => {
    if (!canCreate && !canEdit) return;

    setLoading(true);
    try {
      let savedResource: Resource;

      if (isEditing && resource) {
        const updateData: ResourceUpdate = {
          name: data.name !== resource.name ? data.name : undefined,
          engine: data.engine !== resource.engine ? data.engine : undefined,
          details: {
            ...resource.details,
            ...data,
          }
        };
        savedResource = await updateResource(resource.id, updateData);
      } else {
        const createData: ResourceCreate = {
          name: data.name,
          type: data.type,
          parent_id: data.parent_id,
          engine: data.engine,
          details: data
        };
        savedResource = await createResource(createData);
      }

      if (onSave) {
        onSave(savedResource);
      }

      if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error saving resource:', error);
    } finally {
      setLoading(false);
    }
  }, [canCreate, canEdit, isEditing, resource, createResource, updateResource, onSave, onOpenChange]);

  const handleTestConnection = useCallback(async () => {
    const formData = form.getValues();
    
    if (formData.type !== 'data_source') return;

    setTesting(true);
    try {
      const result = await testResourceConnection({
        type: formData.type,
        host: formData.host,
        port: formData.port,
        database_name: formData.database_name,
        username: formData.username,
        password: formData.password,
        ssl_enabled: formData.ssl_enabled,
        engine: formData.engine
      });
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Connection test failed',
        details: error
      });
    } finally {
      setTesting(false);
    }
  }, [form, testResourceConnection]);

  const handleValidateConfig = useCallback(async () => {
    const formData = form.getValues();
    
    try {
      const results = await validateResourceConfig(formData);
      setValidationResults(results);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  }, [form, validateResourceConfig]);

  const handleAddTag = useCallback(() => {
    if (!tagInput.trim()) return;
    
    const currentTags = form.getValues('tags') || [];
    if (!currentTags.includes(tagInput.trim())) {
      form.setValue('tags', [...currentTags, tagInput.trim()]);
      setTagInput('');
    }
  }, [tagInput, form]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  }, [form]);

  const handleParentSelect = useCallback((parent: Resource) => {
    setSelectedParent(parent);
    form.setValue('parent_id', parent.id);
    setParentSearchOpen(false);
  }, [form]);

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
              <Input placeholder="Enter resource name" {...field} />
            </FormControl>
            <FormDescription>
              A unique identifier for this resource
            </FormDescription>
            <FormMessage />
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
                  <SelectValue placeholder="Select resource type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {RESOURCE_TYPES.map((type) => {
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

      {selectedResourceType && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start space-x-3">
            {React.createElement(selectedResourceType.icon, { className: "h-5 w-5 text-blue-600 mt-0.5" })}
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                {selectedResourceType.label}
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                {selectedResourceType.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {availableParents.length > 0 && (
        <FormField
          control={form.control}
          name="parent_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Resource</FormLabel>
              <Popover open={parentSearchOpen} onOpenChange={setParentSearchOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      {selectedParent ? selectedParent.name : "Select parent resource"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search parent resources..." />
                    <CommandEmpty>No parent resources found.</CommandEmpty>
                    <CommandGroup>
                      {/* This would be populated with actual parent resources */}
                      <CommandItem onSelect={() => handleParentSelect({ id: 1, name: 'Sample Parent', type: 'database' } as Resource)}>
                        <Check className="mr-2 h-4 w-4" />
                        Sample Parent
                      </CommandItem>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                Choose a parent resource if this resource belongs to a hierarchy
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {(watchedType === 'data_source' || watchedType === 'database' || watchedType === 'table') && (
        <FormField
          control={form.control}
          name="engine"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Engine</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select engine" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ENGINES.map((engine) => (
                    <SelectItem key={engine.value} value={engine.value}>
                      {engine.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                The underlying technology or database engine
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe this resource..."
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormDescription>
              A detailed description of the resource and its purpose
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderConnectionTab = () => {
    if (watchedType !== 'data_source') {
      return (
        <div className="text-center py-8 text-gray-500">
          Connection settings are only available for data sources
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Connection Settings</h3>
          <Button
            type="button"
            variant="outline"
            onClick={handleTestConnection}
            disabled={testing}
          >
            {testing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Test Connection
              </>
            )}
          </Button>
        </div>

        {testResult && (
          <Alert variant={testResult.success ? "default" : "destructive"}>
            {testResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertTitle>
              {testResult.success ? 'Connection Successful' : 'Connection Failed'}
            </AlertTitle>
            <AlertDescription>{testResult.message}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="host"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Host</FormLabel>
                <FormControl>
                  <Input placeholder="localhost" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="port"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Port</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="5432"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="database_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Database Name</FormLabel>
              <FormControl>
                <Input placeholder="my_database" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="password"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="ssl_enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">SSL Enabled</FormLabel>
                  <FormDescription>
                    Use SSL/TLS encryption for the connection
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

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="timeout"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timeout (seconds)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="30"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pool_size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Connection Pool Size</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="10"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderClassificationTab = () => (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="classification"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data Classification</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select classification level" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {CLASSIFICATION_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div className="flex items-center space-x-2">
                      <Badge className={level.color}>
                        {level.label}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              Classification level determines access controls and handling requirements
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="sensitivity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sensitivity Level</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select sensitivity level" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="confidential">Confidential</SelectItem>
                <SelectItem value="restricted">Restricted</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="retention_period"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Retention Period</FormLabel>
            <FormControl>
              <Input placeholder="e.g., 7 years, 90 days" {...field} />
            </FormControl>
            <FormDescription>
              How long this data should be retained
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <Label className="text-sm font-medium">Compliance Frameworks</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {COMPLIANCE_FRAMEWORKS.map((framework) => (
            <div key={framework} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={framework}
                checked={(form.getValues('compliance_frameworks') || []).includes(framework)}
                onChange={(e) => {
                  const current = form.getValues('compliance_frameworks') || [];
                  if (e.target.checked) {
                    form.setValue('compliance_frameworks', [...current, framework]);
                  } else {
                    form.setValue('compliance_frameworks', current.filter(f => f !== framework));
                  }
                }}
              />
              <Label htmlFor={framework} className="text-sm">
                {framework}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="encryption_enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Encryption Enabled</FormLabel>
                <FormDescription>
                  Encrypt data at rest and in transit
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
          name="backup_enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Backup Enabled</FormLabel>
                <FormDescription>
                  Automatically backup this resource
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
          name="monitoring_enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Monitoring Enabled</FormLabel>
                <FormDescription>
                  Monitor access and usage patterns
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
    </div>
  );

  const renderMetadataTab = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium">Tags</Label>
        <div className="flex items-center space-x-2 mt-2">
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
        <div className="flex flex-wrap gap-2 mt-2">
          {(form.getValues('tags') || []).map((tag, index) => (
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

      {watchedType === 'table' && (
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="row_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Row Count</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="column_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Column Count</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="size_bytes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size (bytes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {watchedType === 'database' && (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="charset"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Character Set</FormLabel>
                <FormControl>
                  <Input placeholder="utf8" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="collation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Collation</FormLabel>
                <FormControl>
                  <Input placeholder="utf8_general_ci" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      <div className="border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleValidateConfig}
          className="w-full"
        >
          <Shield className="h-4 w-4 mr-2" />
          Validate Configuration
        </Button>

        {validationResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {validationResults.map((result, index) => (
              <Alert key={index} variant={result.valid ? "default" : "destructive"}>
                {result.valid ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <AlertTitle>{result.field}</AlertTitle>
                <AlertDescription>
                  {result.message}
                  {result.suggestion && (
                    <div className="mt-1 text-sm font-medium">
                      Suggestion: {result.suggestion}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {selectedResourceType && React.createElement(selectedResourceType.icon, { className: "h-5 w-5" })}
            <span>
              {isEditing ? `Edit ${resource?.name}` : 'Create New Resource'}
            </span>
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the resource configuration and settings'
              : 'Configure a new resource with all necessary details'
            }
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="connection">Connection</TabsTrigger>
                  <TabsTrigger value="classification">Classification</TabsTrigger>
                  <TabsTrigger value="metadata">Metadata</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="mt-6">
                  {renderBasicTab()}
                </TabsContent>

                <TabsContent value="connection" className="mt-6">
                  {renderConnectionTab()}
                </TabsContent>

                <TabsContent value="classification" className="mt-6">
                  {renderClassificationTab()}
                </TabsContent>

                <TabsContent value="metadata" className="mt-6">
                  {renderMetadataTab()}
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={loading || (!canCreate && !canEdit)}
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Update Resource' : 'Create Resource'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceCreateEdit;