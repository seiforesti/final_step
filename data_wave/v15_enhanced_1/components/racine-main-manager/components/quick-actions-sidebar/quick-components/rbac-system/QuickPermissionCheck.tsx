'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger 
} from '@/components/ui/tooltip';
import {
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  Alert, AlertDescription, AlertTitle
} from '@/components/ui/alert';
import {
  Search, Shield, CheckCircle, XCircle, AlertTriangle, X, Eye, 
  Lock, Unlock, User, Users, Key, Fingerprint, Crown, Zap,
  Brain, Sparkles, Activity, TrendingUp, BarChart3, Target,
  Clock, Calendar, Globe, Database, Table, FileText, Settings,
  RefreshCw, Download, Upload, Save, Copy, Edit, Trash, Plus,
  Minus, Info, HelpCircle, Star, Flag, Filter, SortAsc,
  ChevronDown, ChevronRight, MoreHorizontal, ExternalLink
} from 'lucide-react';

import { useRBAC } from '../../../hooks/useRBAC';
import { useWorkspaceManagement } from '../../../hooks/useWorkspaceManagement';
import { useUserManagement } from '../../../hooks/useUserManagement';
import { useAIAssistant } from '../../../hooks/useAIAssistant';
import { useCrossGroupIntegration } from '../../../hooks/useCrossGroupIntegration';
import { useActivityTracking } from '../../../hooks/useActivityTracking';

interface Permission {
  id: string;
  resource: string;
  action: string;
  scope: string;
  conditions?: any[];
  inherited: boolean;
  source: 'direct' | 'role' | 'group' | 'policy';
  effectiveFrom: string;
  effectiveUntil?: string;
}

interface PermissionCheckResult {
  allowed: boolean;
  reason: string;
  matchedPolicies: string[];
  deniedBy?: string[];
  conditions?: any[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  auditInfo: {
    checkedAt: string;
    checkedBy: string;
    context: any;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  groups: string[];
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  permissions: Permission[];
  riskScore: number;
}

interface Resource {
  id: string;
  name: string;
  type: 'data' | 'system' | 'api' | 'ui';
  category: string;
  sensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
  actions: string[];
  requiredPermissions: string[];
  parentResource?: string;
  metadata: any;
}

interface QuickPermissionCheckProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

const QuickPermissionCheck: React.FC<QuickPermissionCheckProps> = ({
  isVisible, onClose, className = '',
}) => {
  // Core State Management
  const [activeTab, setActiveTab] = useState<string>('check');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedResource, setSelectedResource] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [checkContext, setCheckContext] = useState<any>({});
  
  // Data State
  const [users, setUsers] = useState<User[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [checkResult, setCheckResult] = useState<PermissionCheckResult | null>(null);
  const [checkHistory, setCheckHistory] = useState<any[]>([]);
  const [bulkCheckResults, setBulkCheckResults] = useState<any[]>([]);
  
  // Analysis State
  const [permissionInsights, setPermissionInsights] = useState<any[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<any[]>([]);
  const [accessPatterns, setAccessPatterns] = useState<any>(null);
  
  // UI State
  const [isChecking, setIsChecking] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [filterCriteria, setFilterCriteria] = useState({
    userStatus: '',
    resourceType: '',
    sensitivity: '',
    riskLevel: '',
  });

  // Hooks
  const { 
    checkUserPermission,
    bulkCheckPermissions,
    getUserPermissions,
    getResourcePermissions,
    getPermissionInsights,
    getAccessPatterns,
    loading,
    error 
  } = useRBAC();
  const { currentWorkspace } = useWorkspaceManagement();
  const { currentUser, getAllUsers } = useUserManagement();
  const { analyzePermissionPatterns, getSecurityRecommendations } = useAIAssistant();
  const { getCrossGroupPermissions } = useCrossGroupIntegration();
  const { trackActivity } = useActivityTracking();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const resultVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
  };

  // Load initial data
  const loadData = useCallback(async () => {
    if (!isVisible) return;

    try {
      const [usersData, resourcesData, insightsData, patternsData] = await Promise.all([
        getAllUsers(currentWorkspace?.id),
        getResourcePermissions(currentWorkspace?.id),
        getPermissionInsights(currentWorkspace?.id),
        getAccessPatterns(currentWorkspace?.id, { timeRange: '30d' })
      ]);

      setUsers(usersData || []);
      setResources(resourcesData || []);
      setPermissionInsights(insightsData?.insights || []);
      setAccessPatterns(patternsData);

      // AI Analysis if enabled
      if (usersData?.length && currentUser?.preferences?.aiEnabled) {
        const securityAnalysis = await analyzePermissionPatterns(usersData, resourcesData);
        setSecurityAlerts(securityAnalysis?.alerts || []);
      }

      trackActivity({
        action: 'permission_check_opened',
        component: 'QuickPermissionCheck',
        metadata: { 
          workspace: currentWorkspace?.id,
          usersCount: usersData?.length || 0,
          resourcesCount: resourcesData?.length || 0
        },
      });
    } catch (error) {
      console.error('Failed to load RBAC data:', error);
    }
  }, [isVisible, currentWorkspace, currentUser, getAllUsers, getResourcePermissions, getPermissionInsights, getAccessPatterns, analyzePermissionPatterns, trackActivity]);

  // Handle single permission check
  const handlePermissionCheck = useCallback(async () => {
    if (!selectedUser || !selectedResource || !selectedAction) return;

    setIsChecking(true);
    try {
      const result = await checkUserPermission({
        userId: selectedUser,
        resource: selectedResource,
        action: selectedAction,
        context: checkContext,
        workspaceId: currentWorkspace?.id
      });

      setCheckResult(result);
      
      // Add to history
      setCheckHistory(prev => [{
        id: Date.now().toString(),
        userId: selectedUser,
        resource: selectedResource,
        action: selectedAction,
        result: result.allowed,
        timestamp: new Date().toISOString(),
        riskLevel: result.riskLevel
      }, ...prev.slice(0, 9)]);

      trackActivity({
        action: 'permission_checked',
        component: 'QuickPermissionCheck',
        metadata: { 
          userId: selectedUser,
          resource: selectedResource,
          action: selectedAction,
          allowed: result.allowed
        },
      });
    } catch (error) {
      console.error('Permission check failed:', error);
    } finally {
      setIsChecking(false);
    }
  }, [selectedUser, selectedResource, selectedAction, checkContext, currentWorkspace, checkUserPermission, trackActivity]);

  // Handle bulk permission check
  const handleBulkCheck = useCallback(async () => {
    if (selectedUsers.length === 0 || selectedResources.length === 0 || !selectedAction) return;

    setIsChecking(true);
    try {
      const checks = selectedUsers.flatMap(userId =>
        selectedResources.map(resource => ({
          userId,
          resource,
          action: selectedAction,
          context: checkContext
        }))
      );

      const results = await bulkCheckPermissions(checks, currentWorkspace?.id);
      setBulkCheckResults(results || []);

      trackActivity({
        action: 'bulk_permission_check',
        component: 'QuickPermissionCheck',
        metadata: { 
          usersCount: selectedUsers.length,
          resourcesCount: selectedResources.length,
          checksCount: checks.length
        },
      });
    } catch (error) {
      console.error('Bulk permission check failed:', error);
    } finally {
      setIsChecking(false);
    }
  }, [selectedUsers, selectedResources, selectedAction, checkContext, currentWorkspace, bulkCheckPermissions, trackActivity]);

  // Filter users and resources
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (filterCriteria.userStatus && user.status !== filterCriteria.userStatus) return false;
      if (filterCriteria.riskLevel) {
        const riskLevel = user.riskScore > 80 ? 'critical' : 
                         user.riskScore > 60 ? 'high' :
                         user.riskScore > 30 ? 'medium' : 'low';
        if (riskLevel !== filterCriteria.riskLevel) return false;
      }
      return true;
    });
  }, [users, filterCriteria]);

  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      if (filterCriteria.resourceType && resource.type !== filterCriteria.resourceType) return false;
      if (filterCriteria.sensitivity && resource.sensitivity !== filterCriteria.sensitivity) return false;
      return true;
    });
  }, [resources, filterCriteria]);

  // Load data when component becomes visible
  useEffect(() => {
    if (isVisible) {
      loadData();
    }
  }, [isVisible, loadData]);

  // Render Functions
  const renderRiskBadge = (riskLevel: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-green-100 text-green-800 border-green-300',
    };

    return (
      <Badge variant="outline" className={colors[riskLevel as keyof typeof colors]}>
        {riskLevel.toUpperCase()}
      </Badge>
    );
  };

  const renderSensitivityBadge = (sensitivity: string) => {
    const colors = {
      restricted: 'bg-red-100 text-red-800 border-red-300',
      confidential: 'bg-orange-100 text-orange-800 border-orange-300',
      internal: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      public: 'bg-blue-100 text-blue-800 border-blue-300',
    };

    return (
      <Badge variant="outline" className={colors[sensitivity as keyof typeof colors]}>
        {sensitivity.toUpperCase()}
      </Badge>
    );
  };

  const renderCheckTab = () => (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="bulk-mode"
            checked={bulkMode}
            onCheckedChange={setBulkMode}
          />
          <Label htmlFor="bulk-mode" className="text-sm">Bulk Check Mode</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="advanced-mode"
            checked={showAdvanced}
            onCheckedChange={setShowAdvanced}
          />
          <Label htmlFor="advanced-mode" className="text-sm">Advanced Options</Label>
        </div>
      </div>

      {/* Single Check Mode */}
      {!bulkMode ? (
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Select User</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose user to check" />
                </SelectTrigger>
                <SelectContent>
                  {filteredUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-gray-500">({user.email})</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {user.roles.slice(0, 2).map((role) => (
                            <Badge key={role} variant="secondary" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                          {user.riskScore > 70 && (
                            <AlertTriangle className="h-3 w-3 text-orange-500" />
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Select Resource</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedResource} onValueChange={setSelectedResource}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose resource to check" />
                </SelectTrigger>
                <SelectContent>
                  {filteredResources.map((resource) => (
                    <SelectItem key={resource.id} value={resource.id}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{resource.name}</span>
                          <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                        </div>
                        {renderSensitivityBadge(resource.sensitivity)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center space-x-2">
                <Key className="h-4 w-4" />
                <span>Select Action</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose action to check" />
                </SelectTrigger>
                <SelectContent>
                  {['read', 'write', 'delete', 'execute', 'admin', 'share', 'export'].map((action) => (
                    <SelectItem key={action} value={action}>
                      <div className="flex items-center space-x-2">
                        <span className="capitalize">{action}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Bulk Check Mode */
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Bulk Permission Check</CardTitle>
              <CardDescription>Check permissions for multiple users and resources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Select Users</Label>
                  <div className="max-h-32 overflow-y-auto border rounded-lg p-2">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="flex items-center space-x-2 p-1">
                        <Checkbox
                          id={user.id}
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedUsers(prev => [...prev, user.id]);
                            } else {
                              setSelectedUsers(prev => prev.filter(id => id !== user.id));
                            }
                          }}
                        />
                        <Label htmlFor={user.id} className="text-sm flex-1">
                          {user.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedUsers.length} users selected
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Select Resources</Label>
                  <div className="max-h-32 overflow-y-auto border rounded-lg p-2">
                    {filteredResources.map((resource) => (
                      <div key={resource.id} className="flex items-center space-x-2 p-1">
                        <Checkbox
                          id={resource.id}
                          checked={selectedResources.includes(resource.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedResources(prev => [...prev, resource.id]);
                            } else {
                              setSelectedResources(prev => prev.filter(id => id !== resource.id));
                            }
                          }}
                        />
                        <Label htmlFor={resource.id} className="text-sm flex-1">
                          {resource.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedResources.length} resources selected
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Action</Label>
                <Select value={selectedAction} onValueChange={setSelectedAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose action to check" />
                  </SelectTrigger>
                  <SelectContent>
                    {['read', 'write', 'delete', 'execute', 'admin'].map((action) => (
                      <SelectItem key={action} value={action}>
                        <span className="capitalize">{action}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Advanced Context */}
      {showAdvanced && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Advanced Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">IP Address</Label>
                <Input
                  placeholder="192.168.1.1"
                  value={checkContext.ipAddress || ''}
                  onChange={(e) => setCheckContext(prev => ({ ...prev, ipAddress: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Time Constraint</Label>
                <Select 
                  value={checkContext.timeConstraint || ''}
                  onValueChange={(value) => setCheckContext(prev => ({ ...prev, timeConstraint: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select constraint" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business_hours">Business Hours</SelectItem>
                    <SelectItem value="weekdays">Weekdays Only</SelectItem>
                    <SelectItem value="none">No Constraint</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Additional Context</Label>
              <Textarea
                placeholder="Any additional context for the permission check..."
                value={checkContext.notes || ''}
                onChange={(e) => setCheckContext(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Check Button */}
      <Button
        onClick={bulkMode ? handleBulkCheck : handlePermissionCheck}
        disabled={isChecking || (!bulkMode && (!selectedUser || !selectedResource || !selectedAction)) || (bulkMode && (selectedUsers.length === 0 || selectedResources.length === 0 || !selectedAction))}
        className="w-full"
        size="lg"
      >
        {isChecking ? (
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Shield className="h-4 w-4 mr-2" />
        )}
        {isChecking ? 'Checking...' : bulkMode ? `Check ${selectedUsers.length × selectedResources.length} Permissions` : 'Check Permission'}
      </Button>

      {/* Single Check Result */}
      <AnimatePresence>
        {checkResult && !bulkMode && (
          <motion.div
            variants={resultVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className={`border-2 ${checkResult.allowed ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2">
                  {checkResult.allowed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={checkResult.allowed ? 'text-green-800' : 'text-red-800'}>
                    {checkResult.allowed ? 'Access Granted' : 'Access Denied'}
                  </span>
                  {renderRiskBadge(checkResult.riskLevel)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Reason</Label>
                  <p className="text-sm">{checkResult.reason}</p>
                </div>

                {checkResult.matchedPolicies.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Matched Policies</Label>
                    <div className="flex flex-wrap gap-1">
                      {checkResult.matchedPolicies.map((policy) => (
                        <Badge key={policy} variant="outline" className="text-xs">
                          {policy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {checkResult.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Recommendations</Label>
                    <ul className="space-y-1">
                      {checkResult.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Checked at: {new Date(checkResult.auditInfo.checkedAt).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Check Results */}
      {bulkCheckResults.length > 0 && bulkMode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Bulk Check Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bulkCheckResults.map((result, index) => (
                <div key={index} className={`p-3 rounded-lg border ${result.allowed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {result.allowed ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm font-medium">
                        {users.find(u => u.id === result.userId)?.name} → {resources.find(r => r.id === result.resource)?.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {renderRiskBadge(result.riskLevel)}
                      <Badge variant={result.allowed ? "outline" : "destructive"} className="text-xs">
                        {result.allowed ? 'Allowed' : 'Denied'}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{result.reason}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-4">
      {/* History List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Recent Permission Checks</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {checkHistory.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm font-medium text-gray-900">No permission checks yet</p>
              <p className="text-xs text-gray-500 mt-1">Start checking permissions to see history</p>
            </div>
          ) : (
            <div className="space-y-3">
              {checkHistory.map((check) => (
                <div key={check.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {check.result ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {users.find(u => u.id === check.userId)?.name || 'Unknown User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {check.action} on {resources.find(r => r.id === check.resource)?.name || check.resource}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {renderRiskBadge(check.riskLevel)}
                    <span className="text-xs text-gray-500">
                      {new Date(check.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Insights */}
      {securityAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2">
              <Brain className="h-4 w-4 text-purple-600" />
              <span>Security Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {securityAlerts.slice(0, 3).map((alert, index) => (
                <Alert key={index} className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertTitle className="text-sm text-orange-800">{alert.title}</AlertTitle>
                  <AlertDescription className="text-xs text-orange-700">
                    {alert.description}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderFiltersTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filter Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">User Status</Label>
              <Select 
                value={filterCriteria.userStatus} 
                onValueChange={(value) => setFilterCriteria(prev => ({ ...prev, userStatus: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Resource Type</Label>
              <Select 
                value={filterCriteria.resourceType} 
                onValueChange={(value) => setFilterCriteria(prev => ({ ...prev, resourceType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="data">Data</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="ui">UI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Sensitivity Level</Label>
              <Select 
                value={filterCriteria.sensitivity} 
                onValueChange={(value) => setFilterCriteria(prev => ({ ...prev, sensitivity: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Levels</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="confidential">Confidential</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Risk Level</Label>
              <Select 
                value={filterCriteria.riskLevel} 
                onValueChange={(value) => setFilterCriteria(prev => ({ ...prev, riskLevel: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Levels</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={() => setFilterCriteria({ userStatus: '', resourceType: '', sensitivity: '', riskLevel: '' })}
            className="w-full"
          >
            Clear All Filters
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Current View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-xs text-gray-500">Filtered Users</Label>
              <p className="font-medium">{filteredUsers.length}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Filtered Resources</Label>
              <p className="font-medium">{filteredResources.length}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Total Checks</Label>
              <p className="font-medium">{checkHistory.length}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Security Alerts</Label>
              <p className="font-medium text-orange-600">{securityAlerts.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
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
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Permission Checker</h3>
              <p className="text-xs text-gray-500">
                {currentWorkspace?.name || 'All Workspaces'} • Advanced Access Validation
              </p>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="check">Check</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[calc(85vh-200px)]">
              <TabsContent value="check">{renderCheckTab()}</TabsContent>
              <TabsContent value="history">{renderHistoryTab()}</TabsContent>
              <TabsContent value="filters">{renderFiltersTab()}</TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default QuickPermissionCheck;