'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Eye,
  Edit,
  Copy,
  Trash2,
  Users,
  Crown,
  Database,
  Server,
  FileText,
  Tag,
  Search,
  Activity,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Calendar,
  Target,
  Zap,
  Network,
  ExternalLink,
  BookOpen,
  Key,
  Settings,
  Globe,
  Layers,
  GitBranch,
  Workflow,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  ArrowLeft,
  BarChart3,
  PieChart,
  LineChart,
  History,
  Download,
  Share2,
  MessageSquare,
  Bell,
  X,
  Plus,
  RefreshCw,
  Filter,
  Code,
  Terminal,
  Monitor,
  Smartphone,
  Wifi,
  HardDrive,
  Cpu
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { useRoles } from '../../hooks/useRoles';
import { useToast } from '@/components/ui/use-toast';
import {
  Permission,
  PermissionUsage,
  PermissionValidation,
  PermissionScope,
  EffectivePermission
} from '../../types/permission.types';
import { Role } from '../../types/role.types';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface PermissionDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  permission: Permission | null;
  usage?: PermissionUsage;
  onEdit?: (permission: Permission) => void;
  onDuplicate?: (permission: Permission) => void;
  onDelete?: (permission: Permission) => void;
}

interface DependencyInfo {
  roles: Role[];
  users: any[];
  resources: any[];
  conditions: any[];
  inheritance: any[];
}

interface UsageAnalytics {
  dailyUsage: Array<{ date: string; count: number }>;
  topRoles: Array<{ role: Role; usage: number }>;
  topUsers: Array<{ user: any; usage: number }>;
  timeDistribution: Array<{ hour: number; count: number }>;
  resourceAccess: Array<{ resource: string; count: number }>;
}

const getResourceIcon = (resource: string) => {
  const resourceType = resource.split('.')[0];
  
  const iconMap: Record<string, any> = {
    datasource: Database,
    catalog: BookOpen,
    scan: Search,
    compliance: Shield,
    classification: Tag,
    workflow: Workflow,
    user: Users,
    role: Crown,
    system: Server,
    analytics: Activity,
    security: Lock,
    network: Network,
    file: FileText
  };
  
  return iconMap[resourceType] || Target;
};

const formatConditions = (conditions: string) => {
  try {
    const parsed = JSON.parse(conditions);
    return Object.entries(parsed).map(([key, value]) => ({
      key,
      value: typeof value === 'string' ? value : JSON.stringify(value),
      type: typeof value
    }));
  } catch {
    return [{ key: 'raw', value: conditions, type: 'string' }];
  }
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString(),
    relative: getRelativeTime(date)
  };
};

const getRelativeTime = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  } else {
    return 'Just now';
  }
};

export function PermissionDetails({
  isOpen,
  onClose,
  permission,
  usage,
  onEdit,
  onDuplicate,
  onDelete
}: PermissionDetailsProps) {
  const { user, hasPermission } = useAuth();
  const { 
    getPermissionDependencies,
    getPermissionAnalytics,
    getPermissionAuditTrail,
    validatePermission
  } = usePermissions();
  const { roles } = useRoles();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [dependencies, setDependencies] = useState<DependencyInfo | null>(null);
  const [analytics, setAnalytics] = useState<UsageAnalytics | null>(null);
  const [auditTrail, setAuditTrail] = useState<any[]>([]);
  const [validation, setValidation] = useState<PermissionValidation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load permission data when dialog opens
  useEffect(() => {
    if (isOpen && permission) {
      loadPermissionData();
    }
  }, [isOpen, permission]);

  const loadPermissionData = async () => {
    if (!permission) return;
    
    setIsLoading(true);
    
    try {
      const [depData, analyticsData, auditData, validationData] = await Promise.all([
        getPermissionDependencies(permission.id),
        getPermissionAnalytics?.(permission.id),
        getPermissionAuditTrail?.(permission.id),
        validatePermission(permission)
      ]);
      
      setDependencies(depData);
      setAnalytics(analyticsData);
      setAuditTrail(auditData || []);
      setValidation(validationData);
    } catch (error) {
      console.error('Failed to load permission data:', error);
      toast({
        title: 'Load Failed',
        description: 'Failed to load permission details.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (permission && onEdit) {
      onEdit(permission);
    }
  };

  const handleDuplicate = () => {
    if (permission && onDuplicate) {
      onDuplicate(permission);
    }
  };

  const handleDelete = () => {
    if (permission && onDelete) {
      onDelete(permission);
    }
  };

  if (!permission) return null;

  const ResourceIcon = getResourceIcon(permission.resource);
  const hasConditions = !!permission.conditions;
  const conditionsList = hasConditions ? formatConditions(permission.conditions) : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-purple-600" />
            <div>
              <div className="flex items-center gap-2">
                <span>{permission.action}</span>
                {hasConditions && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Lock className="h-4 w-4 text-yellow-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Has ABAC conditions</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <p className="text-sm text-muted-foreground font-normal">
                {permission.resource}
              </p>
            </div>
          </DialogTitle>
          
          <DialogDescription>
            Detailed information about this permission and its usage across the system
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Usage
            </TabsTrigger>
            <TabsTrigger value="dependencies" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Dependencies
            </TabsTrigger>
            <TabsTrigger value="conditions" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Conditions
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Audit
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Basic Information */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ResourceIcon className="h-5 w-5" />
                    Permission Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Action</Label>
                      <p className="font-medium">{permission.action}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Resource</Label>
                      <p className="font-medium">{permission.resource}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Permission ID</Label>
                      <p className="font-mono text-sm">{permission.id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Has Conditions</Label>
                      <div className="flex items-center gap-2">
                        {hasConditions ? (
                          <>
                            <Lock className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">Yes</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="h-4 w-4 text-green-500" />
                            <span className="text-sm">No</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {hasConditions && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Conditions Preview</Label>
                        <div className="mt-2 p-3 bg-muted rounded-lg">
                          <pre className="text-xs overflow-x-auto">
                            {JSON.stringify(JSON.parse(permission.conditions), null, 2)}
                          </pre>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Usage Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {usage ? (
                    <>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{usage.role_count}</p>
                        <p className="text-sm text-muted-foreground">Assigned Roles</p>
                      </div>
                      
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{usage.user_count}</p>
                        <p className="text-sm text-muted-foreground">Affected Users</p>
                      </div>
                      
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{usage.usage_frequency}</p>
                        <p className="text-sm text-muted-foreground">Usage Frequency</p>
                      </div>
                      
                      <div className="text-center p-4 border rounded-lg">
                        <div className="flex items-center justify-center gap-2">
                          {usage.usage_trend === 'increasing' ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : usage.usage_trend === 'decreasing' ? (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          ) : (
                            <Minus className="h-4 w-4 text-gray-500" />
                          )}
                          <span className="text-sm font-medium capitalize">{usage.usage_trend}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Trend</p>
                      </div>
                      
                      {usage.last_used && (
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-sm font-medium">{formatDateTime(usage.last_used).relative}</p>
                          <p className="text-sm text-muted-foreground">Last Used</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No usage data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Validation Results */}
            {validation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {validation.is_valid ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                    Validation Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {validation.errors.length > 0 && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Validation Errors</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc list-inside mt-2">
                          {validation.errors.map((error, idx) => (
                            <li key={idx}>{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {validation.warnings.length > 0 && (
                    <Alert className="mb-4">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Warnings</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc list-inside mt-2">
                          {validation.warnings.map((warning, idx) => (
                            <li key={idx}>{warning}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {validation.suggestions.length > 0 && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Suggestions</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc list-inside mt-2">
                          {validation.suggestions.map((suggestion, idx) => (
                            <li key={idx}>{suggestion}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Assigned Roles</CardTitle>
                </CardHeader>
                <CardContent>
                  {dependencies?.roles && dependencies.roles.length > 0 ? (
                    <div className="space-y-2">
                      {dependencies.roles.map((role) => (
                        <div key={role.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4 text-purple-500" />
                            <span className="font-medium">{role.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {role.users?.length || 0} users
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Crown className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Not assigned to any roles</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Usage Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 border rounded">
                          <p className="text-lg font-bold">{analytics.topRoles.length}</p>
                          <p className="text-xs text-muted-foreground">Active Roles</p>
                        </div>
                        <div className="text-center p-3 border rounded">
                          <p className="text-lg font-bold">{analytics.topUsers.length}</p>
                          <p className="text-xs text-muted-foreground">Active Users</p>
                        </div>
                      </div>
                      
                      {analytics.dailyUsage.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium">Daily Usage (Last 7 days)</Label>
                          <div className="mt-2 h-32 bg-muted rounded flex items-end gap-1 p-2">
                            {analytics.dailyUsage.map((day, idx) => (
                              <div
                                key={idx}
                                className="bg-blue-500 rounded-t flex-1"
                                style={{ height: `${(day.count / Math.max(...analytics.dailyUsage.map(d => d.count))) * 100}%` }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No analytics data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Dependencies Tab */}
          <TabsContent value="dependencies" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Permission Dependencies</CardTitle>
                  <CardDescription>
                    Resources, roles, and users that depend on this permission
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
                      <p>Loading dependencies...</p>
                    </div>
                  ) : dependencies ? (
                    <div className="space-y-6">
                      {/* Roles */}
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          Roles ({dependencies.roles.length})
                        </h4>
                        {dependencies.roles.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {dependencies.roles.map((role) => (
                              <div key={role.id} className="flex items-center gap-2 p-2 border rounded">
                                <Crown className="h-4 w-4 text-purple-500" />
                                <span>{role.name}</span>
                                <Badge variant="outline" className="ml-auto text-xs">
                                  {role.users?.length || 0} users
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No roles assigned</p>
                        )}
                      </div>

                      <Separator />

                      {/* Users */}
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Affected Users ({dependencies.users.length})
                        </h4>
                        {dependencies.users.length > 0 ? (
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {dependencies.users.map((user, idx) => (
                              <div key={idx} className="flex items-center gap-2 p-2 border rounded">
                                <Users className="h-4 w-4 text-blue-500" />
                                <span>{user.email || user.name}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No users affected</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Network className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No dependency data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Conditions Tab */}
          <TabsContent value="conditions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">ABAC Conditions</CardTitle>
                <CardDescription>
                  Attribute-based access control conditions for this permission
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hasConditions ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Raw JSON</h4>
                      <pre className="text-sm overflow-x-auto">
                        {JSON.stringify(JSON.parse(permission.conditions), null, 2)}
                      </pre>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Parsed Conditions</h4>
                      <div className="space-y-2">
                        {conditionsList.map((condition, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <span className="font-medium">{condition.key}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {condition.type}
                              </Badge>
                            </div>
                            <span className="text-sm text-muted-foreground font-mono">
                              {condition.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {validation?.condition_validation && (
                      <Alert variant={validation.condition_validation.is_valid ? "default" : "destructive"}>
                        <Code className="h-4 w-4" />
                        <AlertTitle>Condition Validation</AlertTitle>
                        <AlertDescription>
                          {validation.condition_validation.is_valid ? (
                            "Conditions are valid and properly formatted"
                          ) : (
                            <div>
                              <p>Validation errors found:</p>
                              <ul className="list-disc list-inside mt-2">
                                {validation.condition_validation.syntax_errors?.map((error, idx) => (
                                  <li key={idx}>{error}</li>
                                ))}
                                {validation.condition_validation.semantic_errors?.map((error, idx) => (
                                  <li key={idx}>{error}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Unlock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <h3 className="font-medium mb-2">No Conditions</h3>
                    <p>This permission has no ABAC conditions attached</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Tab */}
          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Audit Trail</CardTitle>
                <CardDescription>
                  Historical changes and access attempts for this permission
                </CardDescription>
              </CardHeader>
              <CardContent>
                {auditTrail.length > 0 ? (
                  <div className="space-y-4">
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {auditTrail.map((entry, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 border rounded">
                            <div className="mt-1">
                              <History className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{entry.action}</p>
                              <p className="text-xs text-muted-foreground">{entry.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">
                                  {entry.performed_by}
                                </span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDateTime(entry.timestamp).relative}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No audit trail available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">ID: {permission.id}</Badge>
            <Badge variant={hasConditions ? "default" : "secondary"}>
              {hasConditions ? "Conditional" : "Unconditional"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {hasPermission('rbac.permission.edit') && onEdit && (
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            
            {hasPermission('rbac.permission.create') && onDuplicate && (
              <Button variant="outline" onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
            )}
            
            {hasPermission('rbac.permission.delete') && onDelete && (
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}