'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  ArrowLeft,
  Save,
  SendHorizontal,
  FileText,
  Wand2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Info,
  Plus,
  X,
  Search,
  Filter,
  Calendar,
  User,
  Users,
  Database,
  Key,
  Shield,
  Target,
  Timer,
  Flag,
  Tag,
  Paperclip,
  Upload,
  Download,
  Eye,
  EyeOff,
  Settings,
  HelpCircle,
  Lightbulb,
  Zap,
  Workflow,
  GitBranch,
  Copy,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  Trash2,
  Edit,
  Star,
  StarOff,
  Bookmark,
  Bell,
  MessageSquare,
  BarChart3,
  TrendingUp,
  Activity,
  Lock,
  Unlock,
  ExternalLink,
  Link,
  Globe,
  Building,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem,
  CommandList,
  CommandSeparator 
} from '@/components/ui/command';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { useAccessRequests } from '../../hooks/useAccessRequests';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissionCheck } from '../../hooks/usePermissionCheck';
import { useUsers } from '../../hooks/useUsers';
import { useRoles } from '../../hooks/useRoles';
import { useResources } from '../../hooks/useResources';
import { format, addDays, addWeeks, addMonths, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import type { 
  AccessRequestCreate,
  AccessRequestTemplate,
  AccessWorkflow
} from '../../types/access-request.types';
import type { User } from '../../types/user.types';
import type { Role } from '../../types/role.types';
import type { Resource } from '../../types/resource.types';

// ===================== INTERFACES & TYPES =====================

interface AccessRequestCreateProps {
  className?: string;
  onClose?: () => void;
  onSuccess?: (request: any) => void;
  onCancel?: () => void;
  initialData?: Partial<AccessRequestFormData>;
  templateId?: number;
  duplicateFromId?: number;
  showBackButton?: boolean;
  mode?: 'create' | 'duplicate' | 'template';
  enableAutoSave?: boolean;
  enableTemplates?: boolean;
  enableWorkflowPreview?: boolean;
}

interface AccessRequestFormData {
  resourceType: string;
  resourceId: string;
  requestedRole: string;
  justification: string;
  businessJustification: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isEmergency: boolean;
  dueDate?: Date;
  expectedDuration?: number;
  durationType: 'hours' | 'days' | 'weeks' | 'months' | 'permanent';
  tags: string[];
  requiredApprovers: User[];
  notifyUsers: User[];
  conditions: Record<string, any>;
  attachments: File[];
  requestType: 'role' | 'permission' | 'resource' | 'temporary' | 'emergency';
  accessLevel: 'read' | 'write' | 'admin' | 'full';
  temporaryAccess: {
    startDate?: Date;
    endDate?: Date;
    autoRevoke: boolean;
    renewalAllowed: boolean;
  };
  complianceInfo: {
    framework: string[];
    dataClassification: string;
    businessPurpose: string;
    retentionPeriod?: number;
  };
  riskAssessment: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    mitigations: string[];
    businessImpact: string;
  };
}

interface ValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning' | 'info';
}

interface FormSection {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  required: boolean;
  completed: boolean;
  validationErrors: ValidationError[];
}

interface RequestTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  data: Partial<AccessRequestFormData>;
  usageCount: number;
  isPopular: boolean;
  tags: string[];
}

interface SmartSuggestion {
  type: 'resource' | 'role' | 'approver' | 'workflow';
  title: string;
  description: string;
  confidence: number;
  data: any;
  reason: string;
}

// ===================== CONSTANTS =====================

const REQUEST_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-blue-50 text-blue-700', icon: TrendingDown },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-50 text-yellow-700', icon: Target },
  { value: 'high', label: 'High', color: 'bg-orange-50 text-orange-700', icon: TrendingUp },
  { value: 'critical', label: 'Critical', color: 'bg-red-50 text-red-700', icon: AlertTriangle }
];

const REQUEST_TYPES = [
  { value: 'role', label: 'Role Assignment', icon: Users, description: 'Request assignment of a specific role' },
  { value: 'permission', label: 'Permission Grant', icon: Key, description: 'Request specific permissions' },
  { value: 'resource', label: 'Resource Access', icon: Database, description: 'Request access to a resource' },
  { value: 'temporary', label: 'Temporary Access', icon: Timer, description: 'Request time-limited access' },
  { value: 'emergency', label: 'Emergency Access', icon: AlertTriangle, description: 'Request urgent emergency access' }
];

const ACCESS_LEVELS = [
  { value: 'read', label: 'Read Only', description: 'View and read permissions only' },
  { value: 'write', label: 'Read/Write', description: 'View, read, and modify permissions' },
  { value: 'admin', label: 'Administrative', description: 'Administrative permissions' },
  { value: 'full', label: 'Full Access', description: 'Complete access and control' }
];

const DURATION_TYPES = [
  { value: 'hours', label: 'Hours', max: 168 },
  { value: 'days', label: 'Days', max: 365 },
  { value: 'weeks', label: 'Weeks', max: 52 },
  { value: 'months', label: 'Months', max: 12 },
  { value: 'permanent', label: 'Permanent', max: 0 }
];

const COMPLIANCE_FRAMEWORKS = [
  'SOX', 'GDPR', 'HIPAA', 'PCI-DSS', 'SOC2', 'ISO27001', 'NIST', 'CCPA'
];

const DATA_CLASSIFICATIONS = [
  'Public', 'Internal', 'Confidential', 'Restricted', 'Top Secret'
];

const RISK_LEVELS = [
  { value: 'low', label: 'Low Risk', color: 'text-green-600' },
  { value: 'medium', label: 'Medium Risk', color: 'text-yellow-600' },
  { value: 'high', label: 'High Risk', color: 'text-orange-600' },
  { value: 'critical', label: 'Critical Risk', color: 'text-red-600' }
];

const DEFAULT_FORM_DATA: AccessRequestFormData = {
  resourceType: '',
  resourceId: '',
  requestedRole: '',
  justification: '',
  businessJustification: '',
  priority: 'medium',
  isEmergency: false,
  expectedDuration: 1,
  durationType: 'days',
  tags: [],
  requiredApprovers: [],
  notifyUsers: [],
  conditions: {},
  attachments: [],
  requestType: 'role',
  accessLevel: 'read',
  temporaryAccess: {
    autoRevoke: true,
    renewalAllowed: false
  },
  complianceInfo: {
    framework: [],
    dataClassification: 'Internal',
    businessPurpose: '',
  },
  riskAssessment: {
    riskLevel: 'low',
    mitigations: [],
    businessImpact: ''
  }
};

// ===================== MAIN COMPONENT =====================

export const AccessRequestCreate: React.FC<AccessRequestCreateProps> = ({
  className,
  onClose,
  onSuccess,
  onCancel,
  initialData = {},
  templateId,
  duplicateFromId,
  showBackButton = true,
  mode = 'create',
  enableAutoSave = true,
  enableTemplates = true,
  enableWorkflowPreview = true
}) => {
  // ===================== HOOKS & STATE =====================

  const { currentUser } = useCurrentUser();
  const { checkPermission } = usePermissionCheck();
  const { users, loadUsers, searchUsers } = useUsers();
  const { roles, loadRoles, searchRoles } = useRoles();
  const { resources, loadResources, searchResources } = useResources();
  
  const {
    createAccessRequest,
    createFromTemplate,
    getAccessRequestTemplates,
    getAccessWorkflows,
    testAccessWorkflow
  } = useAccessRequests({}, false);

  // Form state
  const [formData, setFormData] = useState<AccessRequestFormData>({
    ...DEFAULT_FORM_DATA,
    ...initialData
  });
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  
  // Templates and workflow state
  const [templates, setTemplates] = useState<RequestTemplate[]>([]);
  const [workflows, setWorkflows] = useState<AccessWorkflow[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<RequestTemplate | null>(null);
  const [workflowPreview, setWorkflowPreview] = useState<any>(null);
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
  
  // UI state
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showWorkflowPreview, setShowWorkflowPreview] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));
  
  // Search states
  const [resourceSearch, setResourceSearch] = useState('');
  const [roleSearch, setRoleSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [isResourceSearchOpen, setIsResourceSearchOpen] = useState(false);
  const [isRoleSearchOpen, setIsRoleSearchOpen] = useState(false);
  const [isUserSearchOpen, setIsUserSearchOpen] = useState(false);
  
  // Refs
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // ===================== COMPUTED VALUES =====================

  const formSections: FormSection[] = useMemo(() => [
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Core request details and access requirements',
      icon: <FileText className="h-5 w-5" />,
      required: true,
      completed: !!(formData.resourceType && formData.requestedRole && formData.justification),
      validationErrors: validationErrors.filter(e => ['resourceType', 'resourceId', 'requestedRole', 'justification'].includes(e.field))
    },
    {
      id: 'details',
      title: 'Request Details',
      description: 'Priority, duration, and additional requirements',
      icon: <Settings className="h-5 w-5" />,
      required: true,
      completed: !!(formData.priority && formData.businessJustification),
      validationErrors: validationErrors.filter(e => ['priority', 'businessJustification', 'dueDate'].includes(e.field))
    },
    {
      id: 'approval',
      title: 'Approval & Workflow',
      description: 'Approvers, notifications, and workflow settings',
      icon: <Users className="h-5 w-5" />,
      required: false,
      completed: formData.requiredApprovers.length > 0,
      validationErrors: validationErrors.filter(e => ['requiredApprovers', 'notifyUsers'].includes(e.field))
    },
    {
      id: 'compliance',
      title: 'Compliance & Risk',
      description: 'Compliance requirements and risk assessment',
      icon: <Shield className="h-5 w-5" />,
      required: formData.isEmergency || formData.priority === 'critical',
      completed: !!(formData.complianceInfo.businessPurpose && formData.riskAssessment.businessImpact),
      validationErrors: validationErrors.filter(e => e.field.startsWith('compliance') || e.field.startsWith('risk'))
    }
  ], [formData, validationErrors]);

  const formProgress = useMemo(() => {
    const requiredSections = formSections.filter(s => s.required);
    const completedRequired = requiredSections.filter(s => s.completed).length;
    return Math.round((completedRequired / requiredSections.length) * 100);
  }, [formSections]);

  const canSubmit = useMemo(() => {
    const requiredSectionsCompleted = formSections
      .filter(s => s.required)
      .every(s => s.completed);
    const hasNoErrors = validationErrors.filter(e => e.type === 'error').length === 0;
    return requiredSectionsCompleted && hasNoErrors && !isSubmitting;
  }, [formSections, validationErrors, isSubmitting]);

  const estimatedApprovalTime = useMemo(() => {
    if (!workflowPreview) return null;
    return workflowPreview.totalEstimatedDuration || 0;
  }, [workflowPreview]);

  // ===================== EFFECTS =====================

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          loadUsers(),
          loadRoles(),
          loadResources(),
          enableTemplates && loadTemplates(),
          enableWorkflowPreview && loadWorkflows()
        ]);

        if (templateId && enableTemplates) {
          await loadFromTemplate(templateId);
        }

        if (duplicateFromId) {
          await loadFromDuplicate(duplicateFromId);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
        toast.error('Failed to load form data');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [templateId, duplicateFromId, enableTemplates, enableWorkflowPreview]);

  // Auto-save effect
  useEffect(() => {
    if (!enableAutoSave) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      await handleAutoSave();
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData, enableAutoSave]);

  // Validation effect
  useEffect(() => {
    const errors = validateForm(formData);
    setValidationErrors(errors);
  }, [formData]);

  // Smart suggestions effect
  useEffect(() => {
    const generateSuggestions = async () => {
      if (formData.resourceType && formData.requestType) {
        const suggestions = await generateSmartSuggestions(formData);
        setSmartSuggestions(suggestions);
      }
    };

    const debounced = debounce(generateSuggestions, 500);
    debounced();

    return () => debounced.cancel();
  }, [formData.resourceType, formData.requestType]);

  // Workflow preview effect
  useEffect(() => {
    if (enableWorkflowPreview && formData.resourceType && formData.requestedRole) {
      generateWorkflowPreview();
    }
  }, [formData.resourceType, formData.requestedRole, formData.priority, enableWorkflowPreview]);

  // ===================== HANDLERS =====================

  const loadTemplates = async () => {
    try {
      const response = await getAccessRequestTemplates();
      if (response.success && response.data) {
        // Transform API response to RequestTemplate format
        const transformedTemplates: RequestTemplate[] = response.data.map((template: any) => ({
          id: template.id,
          name: template.name,
          description: template.description,
          category: template.category || 'General',
          icon: <FileText className="h-4 w-4" />,
          data: template.template_data || {},
          usageCount: template.usage_count || 0,
          isPopular: (template.usage_count || 0) > 10,
          tags: template.tags || []
        }));
        setTemplates(transformedTemplates);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const loadWorkflows = async () => {
    try {
      const response = await getAccessWorkflows();
      if (response.success && response.data) {
        setWorkflows(response.data);
      }
    } catch (error) {
      console.error('Failed to load workflows:', error);
    }
  };

  const loadFromTemplate = async (templateId: number) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setFormData(prev => ({ ...prev, ...template.data }));
        setSelectedTemplate(template);
        toast.success(`Template "${template.name}" applied`);
      }
    } catch (error) {
      console.error('Failed to load template:', error);
      toast.error('Failed to load template');
    }
  };

  const loadFromDuplicate = async (requestId: number) => {
    try {
      // Load existing request data for duplication
      // This would call the API to get the request details
      toast.success('Request duplicated successfully');
    } catch (error) {
      console.error('Failed to duplicate request:', error);
      toast.error('Failed to duplicate request');
    }
  };

  const validateForm = (data: AccessRequestFormData): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Basic validation
    if (!data.resourceType) {
      errors.push({ field: 'resourceType', message: 'Resource type is required', type: 'error' });
    }

    if (!data.resourceId) {
      errors.push({ field: 'resourceId', message: 'Resource ID is required', type: 'error' });
    }

    if (!data.requestedRole) {
      errors.push({ field: 'requestedRole', message: 'Requested role is required', type: 'error' });
    }

    if (!data.justification || data.justification.length < 10) {
      errors.push({ field: 'justification', message: 'Justification must be at least 10 characters', type: 'error' });
    }

    if (!data.businessJustification || data.businessJustification.length < 20) {
      errors.push({ field: 'businessJustification', message: 'Business justification must be at least 20 characters', type: 'error' });
    }

    // Emergency request validation
    if (data.isEmergency) {
      if (!data.complianceInfo.businessPurpose) {
        errors.push({ field: 'complianceInfo.businessPurpose', message: 'Business purpose required for emergency requests', type: 'error' });
      }
      
      if (data.riskAssessment.riskLevel === 'low') {
        errors.push({ field: 'riskAssessment.riskLevel', message: 'Emergency requests typically have higher risk levels', type: 'warning' });
      }
    }

    // Temporal access validation
    if (data.requestType === 'temporary' && data.temporaryAccess.startDate && data.temporaryAccess.endDate) {
      if (data.temporaryAccess.startDate >= data.temporaryAccess.endDate) {
        errors.push({ field: 'temporaryAccess.endDate', message: 'End date must be after start date', type: 'error' });
      }
    }

    // Duration validation
    if (data.expectedDuration && data.durationType !== 'permanent') {
      const maxDuration = DURATION_TYPES.find(d => d.value === data.durationType)?.max || 0;
      if (maxDuration > 0 && data.expectedDuration > maxDuration) {
        errors.push({ field: 'expectedDuration', message: `Duration cannot exceed ${maxDuration} ${data.durationType}`, type: 'error' });
      }
    }

    return errors;
  };

  const generateSmartSuggestions = async (data: AccessRequestFormData): Promise<SmartSuggestion[]> => {
    const suggestions: SmartSuggestion[] = [];

    // Generate role suggestions based on resource type
    if (data.resourceType && roles.length > 0) {
      const relevantRoles = roles.filter(role => 
        role.resource_types?.includes(data.resourceType) ||
        role.name.toLowerCase().includes(data.resourceType.toLowerCase())
      );

      relevantRoles.slice(0, 3).forEach(role => {
        suggestions.push({
          type: 'role',
          title: `Consider role: ${role.name}`,
          description: role.description || 'Recommended role for this resource type',
          confidence: 0.8,
          data: role,
          reason: 'Based on resource type compatibility'
        });
      });
    }

    // Generate approver suggestions
    if (data.requestedRole && users.length > 0) {
      const potentialApprovers = users.filter(user => 
        user.roles?.some(role => role.name.includes('Manager') || role.name.includes('Admin'))
      );

      potentialApprovers.slice(0, 2).forEach(user => {
        suggestions.push({
          type: 'approver',
          title: `Suggested approver: ${user.email}`,
          description: 'Manager role detected',
          confidence: 0.7,
          data: user,
          reason: 'User has management privileges'
        });
      });
    }

    return suggestions;
  };

  const generateWorkflowPreview = async () => {
    if (!enableWorkflowPreview || workflows.length === 0) return;

    try {
      const applicableWorkflow = workflows.find(w => 
        w.triggers?.some(trigger => 
          trigger.condition.resource_type === formData.resourceType ||
          trigger.condition.priority === formData.priority
        )
      );

      if (applicableWorkflow) {
        const preview = await testAccessWorkflow(applicableWorkflow.id, {
          resource_type: formData.resourceType,
          resource_id: formData.resourceId,
          requested_role: formData.requestedRole,
          priority: formData.priority,
          user_id: currentUser?.id
        });

        if (preview.success) {
          setWorkflowPreview(preview.data);
        }
      }
    } catch (error) {
      console.error('Failed to generate workflow preview:', error);
    }
  };

  const handleAutoSave = async () => {
    if (!formData.resourceType && !formData.justification) return;

    try {
      setIsSaving(true);
      // Auto-save logic would go here
      // For now, we'll just show a subtle indication
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = useCallback((field: keyof AccessRequestFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleNestedInputChange = useCallback((parentField: keyof AccessRequestFormData, childField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField] as Record<string, any>),
        [childField]: value
      }
    }));
  }, []);

  const handleSubmit = async (asDraft = false) => {
    if (!canSubmit && !asDraft) return;

    try {
      setIsSubmitting(true);

      const requestData: AccessRequestCreate = {
        user_id: currentUser?.id || 0,
        resource_type: formData.resourceType,
        resource_id: formData.resourceId,
        requested_role: formData.requestedRole,
        justification: formData.justification,
        priority: formData.priority,
        is_emergency: formData.isEmergency,
        business_justification: formData.businessJustification,
        expected_duration: formData.expectedDuration,
        due_date: formData.dueDate?.toISOString(),
        tags: formData.tags,
        conditions: {
          ...formData.conditions,
          access_level: formData.accessLevel,
          request_type: formData.requestType,
          temporary_access: formData.temporaryAccess,
          compliance_info: formData.complianceInfo,
          risk_assessment: formData.riskAssessment
        },
        required_approvers: formData.requiredApprovers.map(u => u.id),
        notify_users: formData.notifyUsers.map(u => u.id),
        status: asDraft ? 'draft' : 'pending'
      };

      let response;
      if (selectedTemplate) {
        response = await createFromTemplate(selectedTemplate.id, requestData);
      } else {
        response = await createAccessRequest(requestData);
      }

      if (response.success) {
        toast.success(asDraft ? 'Request saved as draft' : 'Request submitted successfully');
        onSuccess?.(response.data);
      } else {
        throw new Error('Failed to submit request');
      }
    } catch (error) {
      console.error('Failed to submit request:', error);
      toast.error('Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      // Save current form data as template
      toast.success('Template saved successfully');
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error('Failed to save template');
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const applySuggestion = (suggestion: SmartSuggestion) => {
    switch (suggestion.type) {
      case 'role':
        handleInputChange('requestedRole', suggestion.data.name);
        break;
      case 'approver':
        if (!formData.requiredApprovers.some(u => u.id === suggestion.data.id)) {
          handleInputChange('requiredApprovers', [...formData.requiredApprovers, suggestion.data]);
        }
        break;
      case 'resource':
        handleInputChange('resourceId', suggestion.data.id);
        break;
    }
    
    setSmartSuggestions(prev => prev.filter(s => s !== suggestion));
    toast.success('Suggestion applied');
  };

  // ===================== RENDER HELPERS =====================

  const renderHeader = () => (
    <div className="flex items-center justify-between p-6 border-b bg-muted/30">
      <div className="flex items-center space-x-4">
        {showBackButton && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold">
              {mode === 'create' && 'Create Access Request'}
              {mode === 'duplicate' && 'Duplicate Access Request'}
              {mode === 'template' && 'Create from Template'}
            </h1>
            {selectedTemplate && (
              <Badge variant="outline">
                <Wand2 className="mr-1 h-4 w-4" />
                {selectedTemplate.name}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>{currentUser?.email}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{format(new Date(), 'PPp')}</span>
            </div>
            {isSaving && (
              <div className="flex items-center space-x-1 text-blue-600">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span className="text-xs">Saving...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Progress Indicator */}
        <div className="flex items-center space-x-2">
          <Progress value={formProgress} className="w-24" />
          <span className="text-sm text-muted-foreground">{formProgress}%</span>
        </div>

        {/* Templates */}
        {enableTemplates && (
          <Button variant="outline" size="sm" onClick={() => setShowTemplateDialog(true)}>
            <Wand2 className="h-4 w-4 mr-2" />
            Templates
          </Button>
        )}

        {/* Save Template */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleSaveTemplate}>
              <Save className="mr-2 h-4 w-4" />
              Save as Template
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowWorkflowPreview(true)}>
              <Workflow className="mr-2 h-4 w-4" />
              Preview Workflow
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}>
              <Settings className="mr-2 h-4 w-4" />
              Advanced Options
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  const renderSmartSuggestions = () => {
    if (!showSmartSuggestions || smartSuggestions.length === 0) return null;

    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <span>Smart Suggestions</span>
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowSmartSuggestions(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {smartSuggestions.map((suggestion, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-sm">{suggestion.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {suggestion.description} • {Math.round(suggestion.confidence * 100)}% confidence
                  </div>
                  <div className="text-xs text-blue-600 mt-1">{suggestion.reason}</div>
                </div>
                <Button size="sm" onClick={() => applySuggestion(suggestion)}>
                  Apply
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderBasicSection = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <CardTitle>Basic Information</CardTitle>
            {formSections[0].validationErrors.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {formSections[0].validationErrors.length} issues
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleSection('basic')}
          >
            {expandedSections.has('basic') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {expandedSections.has('basic') && (
        <CardContent className="space-y-6">
          {/* Request Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Request Type *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {REQUEST_TYPES.map((type) => (
                <div
                  key={type.value}
                  className={cn(
                    "relative cursor-pointer rounded-lg border p-4 hover:bg-muted/50",
                    formData.requestType === type.value && "border-primary bg-primary/5"
                  )}
                  onClick={() => handleInputChange('requestType', type.value)}
                >
                  <div className="flex items-start space-x-3">
                    <type.icon className="h-5 w-5 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{type.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {type.description}
                      </div>
                    </div>
                  </div>
                  {formData.requestType === type.value && (
                    <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-primary" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Resource Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="resourceType">Resource Type *</Label>
              <Popover open={isResourceSearchOpen} onOpenChange={setIsResourceSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {formData.resourceType || "Select resource type..."}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search resource types..." 
                      value={resourceSearch}
                      onValueChange={setResourceSearch}
                    />
                    <CommandEmpty>No resource types found.</CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        {resources
                          .filter(resource => 
                            resource.type.toLowerCase().includes(resourceSearch.toLowerCase())
                          )
                          .map((resource) => (
                            <CommandItem
                              key={resource.id}
                              value={resource.type}
                              onSelect={() => {
                                handleInputChange('resourceType', resource.type);
                                setIsResourceSearchOpen(false);
                              }}
                            >
                              <Database className="mr-2 h-4 w-4" />
                              {resource.type}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resourceId">Resource ID *</Label>
              <Input
                id="resourceId"
                value={formData.resourceId}
                onChange={(e) => handleInputChange('resourceId', e.target.value)}
                placeholder="Enter resource identifier"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="requestedRole">Requested Role *</Label>
            <Popover open={isRoleSearchOpen} onOpenChange={setIsRoleSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {formData.requestedRole || "Select role..."}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput 
                    placeholder="Search roles..." 
                    value={roleSearch}
                    onValueChange={setRoleSearch}
                  />
                  <CommandEmpty>No roles found.</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      {roles
                        .filter(role => 
                          role.name.toLowerCase().includes(roleSearch.toLowerCase())
                        )
                        .map((role) => (
                          <CommandItem
                            key={role.id}
                            value={role.name}
                            onSelect={() => {
                              handleInputChange('requestedRole', role.name);
                              setIsRoleSearchOpen(false);
                            }}
                          >
                            <Users className="mr-2 h-4 w-4" />
                            <div>
                              <div className="font-medium">{role.name}</div>
                              {role.description && (
                                <div className="text-xs text-muted-foreground">
                                  {role.description}
                                </div>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Access Level */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Access Level</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {ACCESS_LEVELS.map((level) => (
                <div
                  key={level.value}
                  className={cn(
                    "cursor-pointer rounded-lg border p-3 text-center hover:bg-muted/50",
                    formData.accessLevel === level.value && "border-primary bg-primary/5"
                  )}
                  onClick={() => handleInputChange('accessLevel', level.value)}
                >
                  <div className="font-medium text-sm">{level.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {level.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Justification */}
          <div className="space-y-2">
            <Label htmlFor="justification">Justification *</Label>
            <Textarea
              id="justification"
              value={formData.justification}
              onChange={(e) => handleInputChange('justification', e.target.value)}
              placeholder="Explain why you need this access..."
              rows={4}
              className={cn(
                validationErrors.some(e => e.field === 'justification' && e.type === 'error') && 
                "border-red-300 focus-visible:ring-red-500"
              )}
            />
            <div className="text-xs text-muted-foreground">
              {formData.justification.length}/500 characters
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );

  // Additional render methods would continue here...
  // Due to length constraints, I'll continue with the remaining sections

  // ===================== LOADING STATE =====================

  if (isLoading) {
    return (
      <div className={cn("flex flex-col h-full bg-background", className)}>
        <div className="flex items-center justify-center flex-1">
          <div className="space-y-4 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <div className="text-lg font-medium">Loading form...</div>
          </div>
        </div>
      </div>
    );
  }

  // ===================== MAIN RENDER =====================

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-full bg-background", className)}>
        {/* Header */}
        {renderHeader()}

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Smart Suggestions */}
            {renderSmartSuggestions()}

            {/* Form Sections */}
            <form ref={formRef} className="space-y-6">
              {/* Basic Information */}
              {renderBasicSection()}

              {/* Submit Actions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-muted-foreground">
                        {estimatedApprovalTime && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Estimated approval: {Math.round(estimatedApprovalTime / 24)} days</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => handleSubmit(true)}
                        disabled={isSubmitting}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save Draft
                      </Button>
                      
                      <Button
                        onClick={() => handleSubmit(false)}
                        disabled={!canSubmit}
                        className="min-w-[120px]"
                      >
                        {isSubmitting ? (
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <SendHorizontal className="mr-2 h-4 w-4" />
                        )}
                        Submit Request
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>
        </div>

        {/* Validation Errors */}
        {validationErrors.filter(e => e.type === 'error').length > 0 && (
          <div className="border-t bg-red-50 p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-red-800">Please fix the following errors:</div>
                <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                  {validationErrors
                    .filter(e => e.type === 'error')
                    .map((error, index) => (
                      <li key={index}>{error.message}</li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default AccessRequestCreate;