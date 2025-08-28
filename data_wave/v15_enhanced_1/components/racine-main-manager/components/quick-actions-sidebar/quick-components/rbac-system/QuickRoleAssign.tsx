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
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog';
import {
  Alert, AlertDescription, AlertTitle
} from '@/components/ui/alert';
import { Search, UserPlus, Crown, Users, X, Check, AlertTriangle, Eye, Brain, Sparkles, Activity, TrendingUp, BarChart3, Target, Clock, Calendar, User, Globe, Database, Settings, RefreshCw, Download, Upload, Save, Copy, Edit, Trash, Plus, Minus, Info, HelpCircle, Star, Flag, Zap, Network, Layers, GitBranch, Route, Workflow, Component, Fingerprint, Shield, Key, Lock, Unlock, Filter, SortAsc, ChevronDown, ChevronRight, MoreHorizontal } from 'lucide-react';

import { useRBACSystem as useRBAC } from '../../../../hooks/useRBACSystem';
import { useWorkspaceManagement } from '../hooks/optimized/useOptimizedWorkspaceManagement';
import { useUserManagement } from '../hooks/optimized/useOptimizedUserManagement';
import { useAIAssistant } from '../../../../hooks/useAIAssistant';
import { useCrossGroupIntegration } from '../hooks/optimized/useOptimizedCrossGroupIntegration';
import { useActivityTracking } from '../../../../hooks/useActivityTracking';

interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  status: 'active' | 'inactive' | 'pending';
  currentRoles: Role[];
  lastLogin: string;
  riskScore: number;
  manager?: string;
  location: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  isSystem: boolean;
  inheritsFrom?: string[];
  conflictsWith?: string[];
  requiresApproval: boolean;
  maxDuration?: number;
  metadata: {
    createdAt: string;
    createdBy: string;
    lastModified: string;
    usageCount: number;
  };
}

interface Permission {
  id: string;
  resource: string;
  action: string;
  scope: string;
  conditions?: any[];
}

interface RoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  assignedBy: string;
  assignedAt: string;
  expiresAt?: string;
  status: 'active' | 'pending' | 'expired' | 'revoked';
  justification: string;
  approvals?: ApprovalRecord[];
}

interface ApprovalRecord {
  id: string;
  approver: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  comments?: string;
}

interface BulkAssignment {
  users: string[];
  roles: string[];
  justification: string;
  expirationDate?: string;
  requireApproval: boolean;
}

interface QuickRoleAssignProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

const QuickRoleAssign: React.FC<QuickRoleAssignProps> = ({
  isVisible, onClose, className = '',
}) => {
  // Core State Management
  const [activeTab, setActiveTab] = useState<string>('assign');
  const [assignmentMode, setAssignmentMode] = useState<'single' | 'bulk'>('single');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleSearchTerm, setRoleSearchTerm] = useState<string>('');

  // Data State
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [assignments, setAssignments] = useState<RoleAssignment[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<RoleAssignment[]>([]);

  // Assignment Configuration
  const [assignmentConfig, setAssignmentConfig] = useState({
    justification: '',
    expirationDate: '',
    requireApproval: true,
    notifyUser: true,
    effectiveDate: '',
    bulkMode: false,
    inheritanceMode: 'replace', // 'replace', 'append', 'merge'
  });

  // Analysis State
  const [roleConflicts, setRoleConflicts] = useState<any[]>([]);
  const [riskAssessment, setRiskAssessment] = useState<any>(null);
  const [aiRecommendations, setAIRecommendations] = useState<any[]>([]);
  const [inheritanceTree, setInheritanceTree] = useState<any[]>([]);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showConflicts, setShowConflicts] = useState(false);
  const [expandedRoles, setExpandedRoles] = useState<string[]>([]);
  const [filterCriteria, setFilterCriteria] = useState({
    department: '',
    status: '',
    riskLevel: '',
    roleCategory: '',
  });

  // Hooks
  const { 
    getAllUsers,
    getAllRoles,
    assignRoles,
    bulkAssignRoles,
    getRoleAssignments,
    checkRoleConflicts,
    assessAssignmentRisk,
    loading,
    error 
  } = useRBAC();
  const { currentWorkspace } = useWorkspaceManagement();
  const { currentUser } = useUserManagement();
  const { analyzeRoleAssignment, getRoleRecommendations } = useAIAssistant();
  const { getCrossGroupRoles } = useCrossGroupIntegration();
  const { trackActivity } = useActivityTracking();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const cardVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
    hover: { scale: 1.02, opacity: 1 },
  };

  // Load initial data
  const loadData = useCallback(async () => {
    if (!isVisible) return;

    setIsLoading(true);
    try {
      const [usersData, rolesData, assignmentsData, crossGroupRoles] = await Promise.all([
        getAllUsers(currentWorkspace?.id),
        getAllRoles(currentWorkspace?.id),
        getRoleAssignments(currentWorkspace?.id),
        getCrossGroupRoles(currentWorkspace?.id)
      ]);

      setUsers(usersData || [
        { id: '1', name: 'John Doe', email: 'john@company.com', department: 'Engineering', status: 'active', currentRoles: [], lastLogin: '2024-01-15', riskScore: 25, location: 'New York' },
        { id: '2', name: 'Jane Smith', email: 'jane@company.com', department: 'Data Science', status: 'active', currentRoles: [], lastLogin: '2024-01-16', riskScore: 45, location: 'San Francisco' },
        { id: '3', name: 'Mike Johnson', email: 'mike@company.com', department: 'Finance', status: 'active', currentRoles: [], lastLogin: '2024-01-14', riskScore: 15, location: 'Chicago' }
      ]);

      setRoles(rolesData || [
        { id: 'admin', name: 'System Administrator', description: 'Full system access with all privileges', permissions: [], riskLevel: 'critical', category: 'System', isSystem: true, requiresApproval: true, metadata: { createdAt: '2024-01-01', createdBy: 'system', lastModified: '2024-01-15', usageCount: 12 } },
        { id: 'analyst', name: 'Data Analyst', description: 'Access to data analysis tools and datasets', permissions: [], riskLevel: 'medium', category: 'Data', isSystem: false, requiresApproval: false, metadata: { createdAt: '2024-01-01', createdBy: 'admin', lastModified: '2024-01-10', usageCount: 45 } },
        { id: 'steward', name: 'Data Steward', description: 'Data governance and quality management', permissions: [], riskLevel: 'medium', category: 'Data', isSystem: false, requiresApproval: true, metadata: { createdAt: '2024-01-01', createdBy: 'admin', lastModified: '2024-01-12', usageCount: 23 } },
        { id: 'viewer', name: 'Data Viewer', description: 'Read-only access to approved datasets', permissions: [], riskLevel: 'low', category: 'Data', isSystem: false, requiresApproval: false, metadata: { createdAt: '2024-01-01', createdBy: 'admin', lastModified: '2024-01-08', usageCount: 156 } }
      ]);

      setAssignments(assignmentsData || []);

      trackActivity({
        action: 'role_assign_opened',
        component: 'QuickRoleAssign',
        metadata: { 
          workspace: currentWorkspace?.id,
          usersCount: usersData?.length || 0,
          rolesCount: rolesData?.length || 0
        },
      });
    } catch (error) {
      console.error('Failed to load role assignment data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isVisible, currentWorkspace, getAllUsers, getAllRoles, getRoleAssignments, getCrossGroupRoles, trackActivity]);

  // Handle role assignment
  const handleAssignRoles = useCallback(async () => {
    if (selectedUsers.length === 0 || selectedRoles.length === 0) return;

    setIsLoading(true);
    try {
      // Check for conflicts
      const conflicts = await checkRoleConflicts(selectedUsers, selectedRoles);
      if (conflicts?.length > 0) {
        setRoleConflicts(conflicts);
        setShowConflicts(true);
        return;
      }

      // Assess risk
      const risk = await assessAssignmentRisk(selectedUsers, selectedRoles);
      setRiskAssessment(risk);

      // AI Analysis if enabled
      if (currentUser?.preferences?.aiEnabled) {
        const analysis = await analyzeRoleAssignment(selectedUsers, selectedRoles);
        setAIRecommendations(analysis?.recommendations || []);
      }

      if (assignmentMode === 'bulk') {
        await bulkAssignRoles({
          users: selectedUsers,
          roles: selectedRoles,
          justification: assignmentConfig.justification,
          expirationDate: assignmentConfig.expirationDate,
          requireApproval: assignmentConfig.requireApproval
        });
      } else {
        for (const userId of selectedUsers) {
          await assignRoles(userId, selectedRoles, {
            justification: assignmentConfig.justification,
            expirationDate: assignmentConfig.expirationDate,
            requireApproval: assignmentConfig.requireApproval
          });
        }
      }

      // Reset selections
      setSelectedUsers([]);
      setSelectedRoles([]);
      setAssignmentConfig(prev => ({ ...prev, justification: '' }));

      // Reload data
      await loadData();

      trackActivity({
        action: 'roles_assigned',
        component: 'QuickRoleAssign',
        metadata: { 
          usersCount: selectedUsers.length,
          rolesCount: selectedRoles.length,
          mode: assignmentMode
        },
      });
    } catch (error) {
      console.error('Role assignment failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedUsers, selectedRoles, assignmentConfig, assignmentMode, currentUser, checkRoleConflicts, assessAssignmentRisk, analyzeRoleAssignment, bulkAssignRoles, assignRoles, loadData, trackActivity]);

  // Filter users and roles
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = !filterCriteria.department || user.department === filterCriteria.department;
      const matchesStatus = !filterCriteria.status || user.status === filterCriteria.status;
      const matchesRisk = !filterCriteria.riskLevel || (
        filterCriteria.riskLevel === 'low' && user.riskScore < 30 ||
        filterCriteria.riskLevel === 'medium' && user.riskScore >= 30 && user.riskScore < 70 ||
        filterCriteria.riskLevel === 'high' && user.riskScore >= 70
      );
      
      return matchesSearch && matchesDepartment && matchesStatus && matchesRisk;
    });
  }, [users, searchTerm, filterCriteria]);

  const filteredRoles = useMemo(() => {
    return roles.filter(role => {
      const matchesSearch = role.name.toLowerCase().includes(roleSearchTerm.toLowerCase()) ||
                           role.description.toLowerCase().includes(roleSearchTerm.toLowerCase());
      const matchesCategory = !filterCriteria.roleCategory || role.category === filterCriteria.roleCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [roles, roleSearchTerm, filterCriteria]);

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

  const renderStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-300',
      inactive: 'bg-gray-100 text-gray-800 border-gray-300',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    };

    return (
      <Badge variant="outline" className={colors[status as keyof typeof colors]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const renderAssignTab = () => (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="bulk-mode"
            checked={assignmentMode === 'bulk'}
            onCheckedChange={(checked) => setAssignmentMode(checked ? 'bulk' : 'single')}
          />
          <Label htmlFor="bulk-mode" className="text-sm">Bulk Assignment Mode</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(true)}
            disabled={selectedUsers.length === 0 || selectedRoles.length === 0}
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
        </div>
      </div>

      {/* User Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Select Users ({selectedUsers.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <ScrollArea className="h-64">
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
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
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{user.name}</span>
                          {renderStatusBadge(user.status)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.email} • {user.department} • Risk: {user.riskScore}%
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          {user.currentRoles.slice(0, 2).map((role) => (
                            <Badge key={role.id} variant="secondary" className="text-xs">
                              {role.name}
                            </Badge>
                          ))}
                          {user.currentRoles.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{user.currentRoles.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Role Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <Crown className="h-4 w-4" />
            <span>Select Roles ({selectedRoles.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search roles..."
                value={roleSearchTerm}
                onChange={(e) => setRoleSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <ScrollArea className="h-64">
              <div className="space-y-2">
                {filteredRoles.map((role) => (
                  <div
                    key={role.id}
                    className="border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id={role.id}
                          checked={selectedRoles.includes(role.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedRoles(prev => [...prev, role.id]);
                            } else {
                              setSelectedRoles(prev => prev.filter(id => id !== role.id));
                            }
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">{role.name}</span>
                            {renderRiskBadge(role.riskLevel)}
                            {role.requiresApproval && (
                              <Badge variant="outline" className="text-xs">
                                Approval Required
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                            <span>Category: {role.category}</span>
                            <span>Used by: {role.metadata.usageCount} users</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (expandedRoles.includes(role.id)) {
                            setExpandedRoles(prev => prev.filter(id => id !== role.id));
                          } else {
                            setExpandedRoles(prev => [...prev, role.id]);
                          }
                        }}
                      >
                        {expandedRoles.includes(role.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Expanded Role Details */}
                    <AnimatePresence>
                      {expandedRoles.includes(role.id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-3 pb-3"
                        >
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <Label className="text-gray-500">Created</Label>
                                <p>{new Date(role.metadata.createdAt).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <Label className="text-gray-500">Last Modified</Label>
                                <p>{new Date(role.metadata.lastModified).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <Label className="text-gray-500">Permissions</Label>
                                <p>{role.permissions.length} permissions</p>
                              </div>
                              <div>
                                <Label className="text-gray-500">System Role</Label>
                                <p>{role.isSystem ? 'Yes' : 'No'}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Assignment Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Justification *</Label>
            <Textarea
              placeholder="Provide business justification for this role assignment..."
              value={assignmentConfig.justification}
              onChange={(e) => setAssignmentConfig(prev => ({ ...prev, justification: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Effective Date</Label>
              <Input
                type="date"
                value={assignmentConfig.effectiveDate}
                onChange={(e) => setAssignmentConfig(prev => ({ ...prev, effectiveDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Expiration Date</Label>
              <Input
                type="date"
                value={assignmentConfig.expirationDate}
                onChange={(e) => setAssignmentConfig(prev => ({ ...prev, expirationDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="require-approval" className="text-sm">Require Approval</Label>
            <Switch
              id="require-approval"
              checked={assignmentConfig.requireApproval}
              onCheckedChange={(checked) => setAssignmentConfig(prev => ({ ...prev, requireApproval: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notify-user" className="text-sm">Notify User</Label>
            <Switch
              id="notify-user"
              checked={assignmentConfig.notifyUser}
              onCheckedChange={(checked) => setAssignmentConfig(prev => ({ ...prev, notifyUser: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Assignment Actions */}
      <div className="flex space-x-2">
        <Button 
          className="flex-1"
          onClick={handleAssignRoles}
          disabled={selectedUsers.length === 0 || selectedRoles.length === 0 || !assignmentConfig.justification.trim() || isLoading}
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Check className="h-4 w-4 mr-2" />
          )}
          {assignmentMode === 'bulk' ? `Assign to ${selectedUsers.length} Users` : 'Assign Roles'}
        </Button>
        
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => {
            setSelectedUsers([]);
            setSelectedRoles([]);
            setAssignmentConfig(prev => ({ ...prev, justification: '' }));
          }}
        >
          Clear Selection
        </Button>
      </div>

      {/* Risk Assessment Alert */}
      {riskAssessment && riskAssessment.riskLevel !== 'low' && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-sm text-orange-800">Risk Assessment</AlertTitle>
          <AlertDescription className="text-xs text-orange-700">
            This assignment has been assessed as {riskAssessment.riskLevel} risk. 
            {riskAssessment.reasons && ` Reasons: ${riskAssessment.reasons.join(', ')}`}
          </AlertDescription>
        </Alert>
      )}

      {/* AI Recommendations */}
      {aiRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2">
              <Brain className="h-4 w-4 text-purple-600" />
              <span>AI Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiRecommendations.slice(0, 3).map((recommendation, index) => (
                <div key={index} className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                  <div className="flex items-start space-x-3">
                    <div className="p-1 bg-purple-100 rounded">
                      <Sparkles className="h-3 w-3 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-purple-900">{recommendation.title}</p>
                      <p className="text-xs text-purple-700 mt-1">{recommendation.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-purple-600 border-purple-300">
                          Confidence: {recommendation.confidence}%
                        </Badge>
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs text-purple-600">
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
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
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Recent Assignments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assignments.slice(0, 10).map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="text-sm font-medium">
                      {users.find(u => u.id === assignment.userId)?.name || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Assigned {roles.find(r => r.id === assignment.roleId)?.name || 'Unknown Role'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(assignment.assignedAt).toLocaleDateString()} by {assignment.assignedBy}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {renderStatusBadge(assignment.status)}
                  {assignment.expiresAt && (
                    <Badge variant="outline" className="text-xs">
                      Expires {new Date(assignment.expiresAt).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
              <Label className="text-sm">Department</Label>
              <Select 
                value={filterCriteria.department} 
                onValueChange={(value) => setFilterCriteria(prev => ({ ...prev, department: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Departments</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Data Science">Data Science</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">User Status</Label>
              <Select 
                value={filterCriteria.status} 
                onValueChange={(value) => setFilterCriteria(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
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
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Role Category</Label>
              <Select 
                value={filterCriteria.roleCategory} 
                onValueChange={(value) => setFilterCriteria(prev => ({ ...prev, roleCategory: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="System">System</SelectItem>
                  <SelectItem value="Data">Data</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={() => setFilterCriteria({ department: '', status: '', riskLevel: '', roleCategory: '' })}
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
              <Label className="text-xs text-gray-500">Available Roles</Label>
              <p className="font-medium">{filteredRoles.length}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Selected Users</Label>
              <p className="font-medium text-blue-600">{selectedUsers.length}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Selected Roles</Label>
              <p className="font-medium text-purple-600">{selectedRoles.length}</p>
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
              <UserPlus className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Role Assignment</h3>
              <p className="text-xs text-gray-500">
                {currentWorkspace?.name || 'All Workspaces'} • Advanced Role Management
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
              <TabsTrigger value="assign">Assign</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[calc(85vh-200px)]">
              <TabsContent value="assign">{renderAssignTab()}</TabsContent>
              <TabsContent value="history">{renderHistoryTab()}</TabsContent>
              <TabsContent value="filters">{renderFiltersTab()}</TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Conflicts Dialog */}
        <Dialog open={showConflicts} onOpenChange={setShowConflicts}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Role Conflicts Detected</DialogTitle>
              <DialogDescription>
                The following conflicts were found in your role assignment:
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {roleConflicts.map((conflict, index) => (
                <Alert key={index} className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-sm text-red-800">{conflict.type}</AlertTitle>
                  <AlertDescription className="text-xs text-red-700">
                    {conflict.description}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConflicts(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setShowConflicts(false);
                handleAssignRoles();
              }}>
                Proceed Anyway
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </TooltipProvider>
  );
};

export default QuickRoleAssign;