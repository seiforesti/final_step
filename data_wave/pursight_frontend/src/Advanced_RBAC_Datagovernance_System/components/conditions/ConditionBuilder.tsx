'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DroppableProps,
  DraggableProps,
} from '@hello-pangea/dnd';
import {
  Plus,
  Minus,
  X,
  Save,
  ArrowLeft,
  Settings,
  Code,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Move,
  MoreVertical,
  Check,
  AlertTriangle,
  Info,
  HelpCircle,
  RefreshCw,
  Play,
  Pause,
  Square,
  FileText,
  Download,
  Upload,
  Search,
  Filter,
  Tag,
  Clock,
  MapPin,
  Crown,
  Database,
  Network,
  Globe,
  Users,
  User,
  Building,
  Target,
  Shield,
  Key,
  Lock,
  Unlock,
  Activity,
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  Star,
  Heart,
  Bookmark,
  Share,
  GitBranch,
  Layers,
  Workflow,
  Zap,
  Bell,
  Mail,
  Phone,
  Home,
  Archive,
  BookOpen,
  Terminal,
  Monitor,
  Cpu,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';

// Hooks and Services
import { useConditions } from '../../hooks/useConditions';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissions } from '../../hooks/usePermissions';

// Types
import type { 
  Condition, 
  ConditionTemplate, 
  ConditionNode,
  ConditionOperator,
  ConditionAttribute,
  ConditionValidationResult 
} from '../../types/condition.types';

// Utils
import { hasPermission } from '../../utils/permission.utils';
import { formatDate } from '../../utils/format.utils';

// Validation Schema
const conditionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  description: z.string().optional(),
  type: z.enum(['time', 'location', 'attribute', 'role', 'resource', 'network', 'custom']),
  status: z.enum(['active', 'inactive', 'draft']).default('draft'),
  expression: z.string().min(1, 'Expression is required'),
  metadata: z.object({
    complexity: z.number().optional(),
    dependencies: z.array(z.string()).optional(),
    variables: z.array(z.string()).optional(),
    functions: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
  is_template: z.boolean().default(false),
  is_policy: z.boolean().default(false),
  priority: z.number().min(1).max(100).default(50),
  cache_ttl: z.number().min(0).optional(),
});

interface ConditionBuilderProps {
  condition?: Condition;
  templates: ConditionTemplate[];
  onSave: (conditionData: Partial<Condition>) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

interface ExpressionNode {
  id: string;
  type: 'operator' | 'attribute' | 'value' | 'function' | 'group';
  value: string;
  operator?: string;
  children?: ExpressionNode[];
  parent?: string;
  position: { x: number; y: number };
  metadata?: {
    dataType?: string;
    required?: boolean;
    validation?: string;
    description?: string;
  };
}

interface AttributeDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  category: 'user' | 'resource' | 'environment' | 'time' | 'location' | 'custom';
  description: string;
  examples: string[];
  validation?: string;
  source?: string;
}

interface OperatorDefinition {
  name: string;
  symbol: string;
  category: 'comparison' | 'logical' | 'arithmetic' | 'string' | 'array' | 'time' | 'custom';
  operands: number;
  dataTypes: string[];
  description: string;
  examples: string[];
}

interface FunctionDefinition {
  name: string;
  category: 'time' | 'string' | 'math' | 'array' | 'custom';
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  returnType: string;
  description: string;
  examples: string[];
}

const CONDITION_TYPES = [
  { value: 'time', label: 'Time-based', icon: Clock, color: 'bg-blue-100 text-blue-800' },
  { value: 'location', label: 'Location-based', icon: MapPin, color: 'bg-green-100 text-green-800' },
  { value: 'attribute', label: 'Attribute-based', icon: Tag, color: 'bg-purple-100 text-purple-800' },
  { value: 'role', label: 'Role-based', icon: Crown, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'resource', label: 'Resource-based', icon: Database, color: 'bg-red-100 text-red-800' },
  { value: 'network', label: 'Network-based', icon: Network, color: 'bg-indigo-100 text-indigo-800' },
  { value: 'custom', label: 'Custom', icon: Settings, color: 'bg-gray-100 text-gray-800' },
];

const PREDEFINED_ATTRIBUTES: AttributeDefinition[] = [
  {
    name: 'user.id',
    type: 'string',
    category: 'user',
    description: 'Current user identifier',
    examples: ['user-123', 'admin-456'],
    source: 'authentication'
  },
  {
    name: 'user.roles',
    type: 'array',
    category: 'user',
    description: 'User assigned roles',
    examples: ['["admin", "user"]', '["manager"]'],
    source: 'rbac'
  },
  {
    name: 'user.department',
    type: 'string',
    category: 'user',
    description: 'User department',
    examples: ['IT', 'Sales', 'HR'],
    source: 'user_profile'
  },
  {
    name: 'resource.type',
    type: 'string',
    category: 'resource',
    description: 'Type of resource being accessed',
    examples: ['database', 'file', 'api'],
    source: 'resource_metadata'
  },
  {
    name: 'resource.classification',
    type: 'string',
    category: 'resource',
    description: 'Data classification level',
    examples: ['public', 'internal', 'confidential', 'restricted'],
    source: 'classification_engine'
  },
  {
    name: 'time.current',
    type: 'date',
    category: 'time',
    description: 'Current timestamp',
    examples: ['2024-01-15T10:30:00Z'],
    source: 'system'
  },
  {
    name: 'time.hour',
    type: 'number',
    category: 'time',
    description: 'Current hour (0-23)',
    examples: ['9', '14', '22'],
    source: 'system'
  },
  {
    name: 'location.country',
    type: 'string',
    category: 'location',
    description: 'User country code',
    examples: ['US', 'CA', 'UK'],
    source: 'geolocation'
  },
  {
    name: 'location.ip',
    type: 'string',
    category: 'location',
    description: 'User IP address',
    examples: ['192.168.1.1', '10.0.0.1'],
    source: 'network'
  },
  {
    name: 'environment.trusted',
    type: 'boolean',
    category: 'environment',
    description: 'Whether environment is trusted',
    examples: ['true', 'false'],
    source: 'environment_scanner'
  }
];

const PREDEFINED_OPERATORS: OperatorDefinition[] = [
  {
    name: 'equals',
    symbol: '==',
    category: 'comparison',
    operands: 2,
    dataTypes: ['string', 'number', 'boolean'],
    description: 'Checks if two values are equal',
    examples: ['user.department == "IT"', 'time.hour == 9']
  },
  {
    name: 'not_equals',
    symbol: '!=',
    category: 'comparison',
    operands: 2,
    dataTypes: ['string', 'number', 'boolean'],
    description: 'Checks if two values are not equal',
    examples: ['user.status != "inactive"']
  },
  {
    name: 'greater_than',
    symbol: '>',
    category: 'comparison',
    operands: 2,
    dataTypes: ['number', 'date'],
    description: 'Checks if first value is greater than second',
    examples: ['time.hour > 8', 'user.login_count > 100']
  },
  {
    name: 'less_than',
    symbol: '<',
    category: 'comparison',
    operands: 2,
    dataTypes: ['number', 'date'],
    description: 'Checks if first value is less than second',
    examples: ['time.hour < 18']
  },
  {
    name: 'contains',
    symbol: 'contains',
    category: 'string',
    operands: 2,
    dataTypes: ['string', 'array'],
    description: 'Checks if string contains substring or array contains element',
    examples: ['user.roles contains "admin"', 'resource.tags contains "sensitive"']
  },
  {
    name: 'in',
    symbol: 'in',
    category: 'array',
    operands: 2,
    dataTypes: ['string', 'number'],
    description: 'Checks if value is in array',
    examples: ['user.department in ["IT", "Engineering"]']
  },
  {
    name: 'and',
    symbol: '&&',
    category: 'logical',
    operands: 2,
    dataTypes: ['boolean'],
    description: 'Logical AND operation',
    examples: ['user.active && user.verified']
  },
  {
    name: 'or',
    symbol: '||',
    category: 'logical',
    operands: 2,
    dataTypes: ['boolean'],
    description: 'Logical OR operation',
    examples: ['user.role == "admin" || user.role == "manager"']
  },
  {
    name: 'not',
    symbol: '!',
    category: 'logical',
    operands: 1,
    dataTypes: ['boolean'],
    description: 'Logical NOT operation',
    examples: ['!user.suspended']
  }
];

const PREDEFINED_FUNCTIONS: FunctionDefinition[] = [
  {
    name: 'now',
    category: 'time',
    parameters: [],
    returnType: 'date',
    description: 'Returns current timestamp',
    examples: ['now()', 'now() > user.last_login']
  },
  {
    name: 'dateAdd',
    category: 'time',
    parameters: [
      { name: 'date', type: 'date', required: true, description: 'Base date' },
      { name: 'amount', type: 'number', required: true, description: 'Amount to add' },
      { name: 'unit', type: 'string', required: true, description: 'Time unit (days, hours, etc.)' }
    ],
    returnType: 'date',
    description: 'Adds time to a date',
    examples: ['dateAdd(now(), 7, "days")', 'dateAdd(user.created_at, 30, "days")']
  },
  {
    name: 'length',
    category: 'string',
    parameters: [
      { name: 'value', type: 'string', required: true, description: 'String to measure' }
    ],
    returnType: 'number',
    description: 'Returns length of string',
    examples: ['length(user.name) > 5']
  },
  {
    name: 'uppercase',
    category: 'string',
    parameters: [
      { name: 'value', type: 'string', required: true, description: 'String to convert' }
    ],
    returnType: 'string',
    description: 'Converts string to uppercase',
    examples: ['uppercase(user.department) == "IT"']
  },
  {
    name: 'size',
    category: 'array',
    parameters: [
      { name: 'array', type: 'array', required: true, description: 'Array to measure' }
    ],
    returnType: 'number',
    description: 'Returns size of array',
    examples: ['size(user.roles) > 1']
  }
];

export const ConditionBuilder: React.FC<ConditionBuilderProps> = ({
  condition,
  templates,
  onSave,
  onCancel,
  className = ''
}) => {
  // State Management
  const [expressionTree, setExpressionTree] = useState<ExpressionNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<ExpressionNode | null>(null);
  const [validationResult, setValidationResult] = useState<ConditionValidationResult | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('visual');
  
  // UI State
  const [showAttributePanel, setShowAttributePanel] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [draggedItem, setDraggedItem] = useState<any>(null);
  
  // Search and Filter
  const [attributeSearch, setAttributeSearch] = useState('');
  const [operatorSearch, setOperatorSearch] = useState('');
  const [functionSearch, setFunctionSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  // Hooks
  const { user: currentUser } = useCurrentUser();
  const { validateCondition, parseExpression, generateExpression } = useConditions();
  const { checkPermission } = usePermissions();

  // Form Setup
  const form = useForm<z.infer<typeof conditionSchema>>({
    resolver: zodResolver(conditionSchema),
    defaultValues: {
      name: condition?.name || '',
      description: condition?.description || '',
      type: (condition?.type as any) || 'custom',
      status: (condition?.status as any) || 'draft',
      expression: condition?.expression || '',
      metadata: {
        complexity: condition?.metadata?.complexity || 0,
        dependencies: condition?.metadata?.dependencies || [],
        variables: condition?.metadata?.variables || [],
        functions: condition?.metadata?.functions || [],
        tags: condition?.metadata?.tags || [],
      },
      is_template: condition?.is_template || false,
      is_policy: condition?.is_policy || false,
      priority: condition?.priority || 50,
      cache_ttl: condition?.cache_ttl || 300,
    }
  });

  const isEditing = !!condition;
  const canManageConditions = currentUser && hasPermission(currentUser, 'condition:manage');

  // Computed Properties
  const filteredAttributes = useMemo(() => {
    let filtered = PREDEFINED_ATTRIBUTES;

    if (attributeSearch) {
      filtered = filtered.filter(attr =>
        attr.name.toLowerCase().includes(attributeSearch.toLowerCase()) ||
        attr.description.toLowerCase().includes(attributeSearch.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(attr => attr.category === categoryFilter);
    }

    return filtered;
  }, [attributeSearch, categoryFilter]);

  const filteredOperators = useMemo(() => {
    let filtered = PREDEFINED_OPERATORS;

    if (operatorSearch) {
      filtered = filtered.filter(op =>
        op.name.toLowerCase().includes(operatorSearch.toLowerCase()) ||
        op.description.toLowerCase().includes(operatorSearch.toLowerCase())
      );
    }

    return filtered;
  }, [operatorSearch]);

  const filteredFunctions = useMemo(() => {
    let filtered = PREDEFINED_FUNCTIONS;

    if (functionSearch) {
      filtered = filtered.filter(func =>
        func.name.toLowerCase().includes(functionSearch.toLowerCase()) ||
        func.description.toLowerCase().includes(functionSearch.toLowerCase())
      );
    }

    return filtered;
  }, [functionSearch]);

  const generatedExpression = useMemo(() => {
    if (expressionTree.length === 0) return '';
    
    try {
      return generateExpressionFromTree(expressionTree);
    } catch (err) {
      return 'Invalid expression tree';
    }
  }, [expressionTree]);

  // Helper Functions
  const generateId = useCallback(() => {
    return `node-${nextId.current++}`;
  }, []);

  const generateExpressionFromTree = useCallback((nodes: ExpressionNode[]): string => {
    if (nodes.length === 0) return '';
    
    const rootNode = nodes.find(node => !node.parent);
    if (!rootNode) return '';

    const buildExpression = (node: ExpressionNode): string => {
      if (node.type === 'value') {
        return node.value;
      }

      if (node.type === 'attribute') {
        return node.value;
      }

      if (node.type === 'function') {
        const children = nodes.filter(n => n.parent === node.id);
        const params = children.map(child => buildExpression(child)).join(', ');
        return `${node.value}(${params})`;
      }

      if (node.type === 'operator') {
        const children = nodes.filter(n => n.parent === node.id).sort((a, b) => 
          a.position.x - b.position.x
        );
        
        if (node.operator === '!') {
          return `!(${children.map(child => buildExpression(child)).join('')})`;
        }

        if (children.length === 2) {
          return `(${buildExpression(children[0])} ${node.operator} ${buildExpression(children[1])})`;
        }

        return children.map(child => buildExpression(child)).join(` ${node.operator} `);
      }

      if (node.type === 'group') {
        const children = nodes.filter(n => n.parent === node.id);
        return `(${children.map(child => buildExpression(child)).join(' ')})`;
      }

      return node.value;
    };

    return buildExpression(rootNode);
  }, []);

  const parseExpressionToTree = useCallback(async (expression: string): Promise<ExpressionNode[]> => {
    try {
      const parsed = await parseExpression(expression);
      // Convert parsed structure to visual tree nodes
      const nodes: ExpressionNode[] = [];
      let currentId = 1;

      const convertNode = (node: any, parent?: string, x = 0, y = 0): ExpressionNode => {
        const id = `node-${currentId++}`;
        const visualNode: ExpressionNode = {
          id,
          type: node.type,
          value: node.value,
          operator: node.operator,
          parent,
          position: { x, y }
        };
        
        nodes.push(visualNode);

        if (node.children) {
          node.children.forEach((child: any, index: number) => {
            convertNode(child, id, x + (index * 150), y + 100);
          });
        }

        return visualNode;
      };

      convertNode(parsed);
      return nodes;
    } catch (err) {
      console.error('Error parsing expression:', err);
      return [];
    }
  }, [parseExpression]);

  // Event Handlers
  const handleAddNode = useCallback((type: 'attribute' | 'operator' | 'value' | 'function', data: any) => {
    const newNode: ExpressionNode = {
      id: generateId(),
      type,
      value: data.name || data.value || '',
      operator: data.symbol,
      position: { x: Math.random() * 400, y: Math.random() * 300 },
      metadata: data
    };

    setExpressionTree(prev => [...prev, newNode]);
  }, [generateId]);

  const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<ExpressionNode>) => {
    setExpressionTree(prev => prev.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ));
  }, []);

  const handleNodeDelete = useCallback((nodeId: string) => {
    setExpressionTree(prev => {
      // Remove node and all its children
      const toRemove = new Set([nodeId]);
      const findChildren = (parentId: string) => {
        prev.forEach(node => {
          if (node.parent === parentId) {
            toRemove.add(node.id);
            findChildren(node.id);
          }
        });
      };
      findChildren(nodeId);

      return prev.filter(node => !toRemove.has(node.id));
    });
  }, []);

  const handleNodeConnect = useCallback((parentId: string, childId: string) => {
    setExpressionTree(prev => prev.map(node => 
      node.id === childId ? { ...node, parent: parentId } : node
    ));
  }, []);

  const handleValidateExpression = useCallback(async () => {
    const expression = form.getValues('expression') || generatedExpression;
    
    if (!expression) {
      setValidationResult({
        isValid: false,
        errors: ['Expression is required'],
        warnings: [],
        suggestions: []
      });
      return;
    }

    try {
      setLoading(true);
      const result = await validateCondition({
        expression,
        type: form.getValues('type'),
        metadata: form.getValues('metadata')
      });
      setValidationResult(result);
    } catch (err) {
      console.error('Error validating expression:', err);
      setValidationResult({
        isValid: false,
        errors: ['Validation failed'],
        warnings: [],
        suggestions: []
      });
    } finally {
      setLoading(false);
    }
  }, [validateCondition, form, generatedExpression]);

  const handleSave = useCallback(async (data: z.infer<typeof conditionSchema>) => {
    if (!canManageConditions) return;

    setSaving(true);
    setError(null);

    try {
      const expression = data.expression || generatedExpression;
      
      // Final validation before save
      const validation = await validateCondition({
        expression,
        type: data.type,
        metadata: data.metadata
      });

      if (!validation.isValid) {
        setError('Cannot save invalid condition. Please fix validation errors.');
        setValidationResult(validation);
        return;
      }

      const conditionData = {
        ...data,
        expression,
        metadata: {
          ...data.metadata,
          tree_nodes: expressionTree,
          generated_at: new Date().toISOString(),
        }
      };

      await onSave(conditionData);
    } catch (err) {
      console.error('Error saving condition:', err);
      setError('Failed to save condition');
    } finally {
      setSaving(false);
    }
  }, [canManageConditions, onSave, validateCondition, generatedExpression, expressionTree]);

  const handleLoadTemplate = useCallback(async (template: ConditionTemplate) => {
    try {
      // Load template into form
      form.reset({
        name: `${template.name} (Copy)`,
        description: template.description,
        type: template.type as any,
        expression: template.expression,
        metadata: template.metadata,
        is_template: false,
        is_policy: false,
        priority: 50,
      });

      // Parse template expression into visual tree
      const tree = await parseExpressionToTree(template.expression);
      setExpressionTree(tree);
    } catch (err) {
      console.error('Error loading template:', err);
      setError('Failed to load template');
    }
  }, [form, parseExpressionToTree]);

  // Initial Load
  useEffect(() => {
    if (condition?.expression) {
      parseExpressionToTree(condition.expression).then(setExpressionTree);
    }
  }, [condition, parseExpressionToTree]);

  // Auto-update expression when tree changes
  useEffect(() => {
    if (activeTab === 'visual' && expressionTree.length > 0) {
      form.setValue('expression', generatedExpression);
    }
  }, [expressionTree, generatedExpression, form, activeTab]);

  // Render Methods
  const renderHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {isEditing ? `Edit ${condition?.name}` : 'Create New Condition'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Build ABAC conditions using visual interface or direct expression editing
        </p>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button variant="outline" onClick={() => setShowHelp(true)}>
          <HelpCircle className="h-4 w-4 mr-2" />
          Help
        </Button>
        
        <Button variant="outline" onClick={handleValidateExpression} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          Validate
        </Button>

        <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
          {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          Preview
        </Button>
      </div>
    </div>
  );

  const renderBasicInfo = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter condition name" {...field} />
                </FormControl>
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
                      <SelectValue placeholder="Select condition type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CONDITION_TYPES.map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center space-x-2">
                            <IconComponent className="h-4 w-4" />
                            <span>{type.label}</span>
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
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the purpose and logic of this condition..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
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
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>1-100 (higher = more priority)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cache_ttl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cache TTL (seconds)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center space-x-6">
          <FormField
            control={form.control}
            name="is_template"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Save as Template</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_policy"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Use in Policy</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderToolPanel = () => (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Components</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAttributePanel(!showAttributePanel)}
          >
            {showAttributePanel ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      {showAttributePanel && (
        <CardContent>
          <Tabs defaultValue="attributes" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="attributes">Attributes</TabsTrigger>
              <TabsTrigger value="operators">Operators</TabsTrigger>
              <TabsTrigger value="functions">Functions</TabsTrigger>
            </TabsList>

            <TabsContent value="attributes" className="space-y-4">
              <div className="space-y-3">
                <Input
                  placeholder="Search attributes..."
                  value={attributeSearch}
                  onChange={(e) => setAttributeSearch(e.target.value)}
                  className="text-sm"
                />
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="resource">Resource</SelectItem>
                    <SelectItem value="environment">Environment</SelectItem>
                    <SelectItem value="time">Time</SelectItem>
                    <SelectItem value="location">Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {filteredAttributes.map((attr) => (
                    <motion.div
                      key={attr.name}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleAddNode('attribute', attr)}
                    >
                      <div className="font-medium text-sm">{attr.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{attr.description}</div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {attr.type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {attr.category}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="operators" className="space-y-4">
              <Input
                placeholder="Search operators..."
                value={operatorSearch}
                onChange={(e) => setOperatorSearch(e.target.value)}
                className="text-sm"
              />

              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {filteredOperators.map((op) => (
                    <motion.div
                      key={op.name}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleAddNode('operator', op)}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{op.name}</span>
                        <code className="text-xs bg-gray-100 px-1 rounded">{op.symbol}</code>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{op.description}</div>
                      <Badge variant="outline" className="text-xs mt-2">
                        {op.category}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="functions" className="space-y-4">
              <Input
                placeholder="Search functions..."
                value={functionSearch}
                onChange={(e) => setFunctionSearch(e.target.value)}
                className="text-sm"
              />

              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {filteredFunctions.map((func) => (
                    <motion.div
                      key={func.name}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleAddNode('function', func)}
                    >
                      <div className="font-medium text-sm">{func.name}()</div>
                      <div className="text-xs text-gray-500 mt-1">{func.description}</div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {func.category}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          → {func.returnType}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );

  const renderVisualBuilder = () => (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Visual Builder</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpressionTree([])}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={canvasRef}
          className="relative w-full h-96 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-900 overflow-hidden"
        >
          {expressionTree.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Drag components here to build your condition</p>
                <p className="text-sm mt-2">Or use the text editor below</p>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full">
              {expressionTree.map((node) => (
                <motion.div
                  key={node.id}
                  className={`absolute p-3 rounded-lg border-2 cursor-pointer ${
                    selectedNode?.id === node.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                  style={{
                    left: node.position.x,
                    top: node.position.y,
                  }}
                  drag
                  dragMomentum={false}
                  onDrag={(event, info) => {
                    handleNodeUpdate(node.id, {
                      position: { x: info.offset.x, y: info.offset.y }
                    });
                  }}
                  onClick={() => setSelectedNode(node)}
                  whileHover={{ scale: 1.05 }}
                  whileDrag={{ scale: 1.1 }}
                >
                  <div className="flex items-center space-x-2">
                    {node.type === 'attribute' && <Tag className="h-4 w-4 text-purple-500" />}
                    {node.type === 'operator' && <Settings className="h-4 w-4 text-blue-500" />}
                    {node.type === 'function' && <Code className="h-4 w-4 text-green-500" />}
                    {node.type === 'value' && <FileText className="h-4 w-4 text-orange-500" />}
                    
                    <span className="text-sm font-medium">{node.value}</span>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNodeDelete(node.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {node.operator && (
                    <div className="text-xs text-gray-500 mt-1">
                      {node.operator}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Node Properties Panel */}
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 border rounded-lg bg-gray-50"
          >
            <h4 className="font-medium mb-3">Node Properties</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Type</Label>
                <div className="text-sm text-gray-600">{selectedNode.type}</div>
              </div>
              <div>
                <Label className="text-sm">Value</Label>
                <Input
                  value={selectedNode.value}
                  onChange={(e) => handleNodeUpdate(selectedNode.id, { value: e.target.value })}
                  className="text-sm"
                />
              </div>
              {selectedNode.type === 'operator' && (
                <div>
                  <Label className="text-sm">Operator</Label>
                  <Select
                    value={selectedNode.operator}
                    onValueChange={(value) => handleNodeUpdate(selectedNode.id, { operator: value })}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PREDEFINED_OPERATORS.map((op) => (
                        <SelectItem key={op.name} value={op.symbol}>
                          {op.name} ({op.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );

  const renderTextEditor = () => (
    <Card>
      <CardHeader>
        <CardTitle>Expression Editor</CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="expression"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Enter your condition expression..."
                  className="min-h-32 font-mono text-sm"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Write your condition using attributes, operators, and functions
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Generated Expression Display */}
        {activeTab === 'visual' && generatedExpression && (
          <div className="mt-4">
            <Label className="text-sm font-medium">Generated Expression</Label>
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <code className="text-sm">{generatedExpression}</code>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderValidationResults = () => {
    if (!validationResult) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4"
      >
        <Alert variant={validationResult.isValid ? 'default' : 'destructive'}>
          {validationResult.isValid ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertTitle>
            {validationResult.isValid ? 'Valid Expression' : 'Validation Failed'}
          </AlertTitle>
          <AlertDescription>
            {validationResult.isValid ? (
              'Your condition expression is valid and ready to use.'
            ) : (
              <div className="space-y-2">
                {validationResult.errors.map((error, index) => (
                  <div key={index}>• {error}</div>
                ))}
              </div>
            )}
          </AlertDescription>
        </Alert>

        {validationResult.warnings.length > 0 && (
          <Alert className="mt-2">
            <Info className="h-4 w-4" />
            <AlertTitle>Warnings</AlertTitle>
            <AlertDescription>
              <div className="space-y-1">
                {validationResult.warnings.map((warning, index) => (
                  <div key={index}>• {warning}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {validationResult.suggestions.length > 0 && (
          <Alert className="mt-2">
            <Info className="h-4 w-4" />
            <AlertTitle>Suggestions</AlertTitle>
            <AlertDescription>
              <div className="space-y-1">
                {validationResult.suggestions.map((suggestion, index) => (
                  <div key={index}>• {suggestion}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </motion.div>
    );
  };

  const renderTemplateLoader = () => {
    if (templates.length === 0) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Load from Template</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.slice(0, 6).map((template) => (
              <motion.div
                key={template.id}
                className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                whileHover={{ scale: 1.02 }}
                onClick={() => handleLoadTemplate(template)}
              >
                <div className="font-medium">{template.name}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {template.description?.substring(0, 80)}...
                </div>
                <div className="flex items-center space-x-2 mt-3">
                  <Badge variant="outline" className="text-xs">
                    {template.type}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Template
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!canManageConditions) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You don't have permission to manage conditions.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`space-y-6 ${className}`}
    >
      {renderHeader()}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
          {renderBasicInfo()}
          {renderTemplateLoader()}

          {/* Main Builder Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Tool Panel */}
            <div className="lg:col-span-1">
              {renderToolPanel()}
            </div>

            {/* Builder Area */}
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="visual">Visual Builder</TabsTrigger>
                  <TabsTrigger value="text">Text Editor</TabsTrigger>
                </TabsList>

                <TabsContent value="visual" className="mt-6">
                  {renderVisualBuilder()}
                </TabsContent>

                <TabsContent value="text" className="mt-6">
                  {renderTextEditor()}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Validation Results */}
          {renderValidationResults()}

          {/* Preview Panel */}
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <code className="text-sm">
                      {form.getValues('expression') || generatedExpression || 'No expression defined'}
                    </code>
                  </div>
                  
                  {form.getValues('metadata') && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Metadata</h4>
                      <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                        {JSON.stringify(form.getValues('metadata'), null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
              disabled={saving || (validationResult && !validationResult.isValid)}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update Condition' : 'Create Condition'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
};

