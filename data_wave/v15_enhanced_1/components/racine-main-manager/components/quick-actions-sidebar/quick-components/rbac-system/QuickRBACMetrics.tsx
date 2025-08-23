'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger 
} from '@/components/ui/tooltip';
import {
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover';
import {
  Alert, AlertDescription, AlertTitle
} from '@/components/ui/alert';
import { Shield, BarChart3, PieChart, TrendingUp, TrendingDown, Users, Crown, Key, Lock, Unlock, Eye, EyeOff, Activity, Target, Brain, Sparkles, AlertTriangle, CheckCircle, XCircle, Clock, Calendar, User, Globe, Database, Settings, RefreshCw, Download, Search, Filter, Info, HelpCircle, Star, Flag, Zap, Network, Layers, GitBranch, Route, Workflow, Component, X, Plus, Minus, Edit, Trash, Copy, Share, ExternalLink, MoreHorizontal } from 'lucide-react';

import { useRBACSystem as useRBAC } from '../../../../hooks/useRBACSystem';
import { useWorkspaceManagement } from '../../../../hooks/useWorkspaceManagement';
import { useUserManagement } from '../../../../hooks/useUserManagement';
import { useAIAssistant } from '../../../../hooks/useAIAssistant';
import { useCrossGroupIntegration } from '../../../../hooks/useCrossGroupIntegration';
import { useActivityTracking } from '../../../../hooks/useActivityTracking';

interface RBACMetrics {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  activeRoles: number;
  totalPolicies: number;
  activePolicies: number;
  totalPermissions: number;
  accessRequests: {
    pending: number;
    approved: number;
    denied: number;
    total: number;
  };
  securityScore: number;
  complianceScore: number;
  riskScore: number;
  accessViolations: number;
  privilegedUsers: number;
  orphanedPermissions: number;
  roleEffectiveness: number;
  accessPatterns: {
    peakHours: string[];
    topResources: any[];
    riskiestActions: any[];
  };
}

interface RoleAnalysis {
  id: string;
  name: string;
  usersCount: number;
  permissionsCount: number;
  effectiveness: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUsed: string;
  isOrphaned: boolean;
  recommendations: string[];
}

interface SecurityInsight {
  id: string;
  type: 'security' | 'compliance' | 'optimization' | 'risk';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  affectedUsers: number;
  affectedResources: number;
  recommendation: string;
  confidence: number;
}

interface QuickRBACMetricsProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

const QuickRBACMetrics: React.FC<QuickRBACMetricsProps> = ({
  isVisible, onClose, className = '',
}) => {
  // Core State Management
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['users', 'roles', 'security', 'compliance']);
  const [viewMode, setViewMode] = useState<'chart' | 'table' | 'cards'>('chart');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(30000);

  // Data State
  const [rbacMetrics, setRbacMetrics] = useState<RBACMetrics | null>(null);
  const [roleAnalysis, setRoleAnalysis] = useState<RoleAnalysis[]>([]);
  const [securityInsights, setSecurityInsights] = useState<SecurityInsight[]>([]);
  const [trendsData, setTrendsData] = useState<any[]>([]);
  const [complianceData, setComplianceData] = useState<any>(null);

  // Analysis State
  const [aiRecommendations, setAIRecommendations] = useState<any[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<any[]>([]);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<any[]>([]);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [showAIInsights, setShowAIInsights] = useState(false);

  // Hooks
  const { 
    getRBACMetrics,
    getRoleAnalysis,
    getSecurityInsights,
    getRBACTrends,
    getComplianceReport,
    loading,
    error 
  } = useRBAC();
  const { currentWorkspace, workspaceMetrics } = useWorkspaceManagement();
  const { currentUser } = useUserManagement();
  const { analyzeRBACPatterns, getRBACOptimizations } = useAIAssistant();
  const { getCrossGroupRBACMetrics } = useCrossGroupIntegration();
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

  // Load RBAC metrics
  const loadRBACMetrics = useCallback(async () => {
    if (!isVisible) return;

    setIsLoading(true);
    try {
      const [
        metricsData,
        rolesData,
        insightsData,
        trendsData,
        complianceData,
        crossGroupData
      ] = await Promise.all([
        getRBACMetrics(timeRange, currentWorkspace?.id),
        getRoleAnalysis(currentWorkspace?.id),
        getSecurityInsights(currentWorkspace?.id),
        getRBACTrends(timeRange, currentWorkspace?.id),
        getComplianceReport(currentWorkspace?.id),
        getCrossGroupRBACMetrics(currentWorkspace?.id)
      ]);

      setRbacMetrics(metricsData || {
        totalUsers: 1247,
        activeUsers: 1089,
        totalRoles: 45,
        activeRoles: 38,
        totalPolicies: 156,
        activePolicies: 142,
        totalPermissions: 423,
        accessRequests: { pending: 23, approved: 187, denied: 12, total: 222 },
        securityScore: 87,
        complianceScore: 92,
        riskScore: 23,
        accessViolations: 8,
        privilegedUsers: 24,
        orphanedPermissions: 15,
        roleEffectiveness: 85,
        accessPatterns: { peakHours: ['9-11', '14-16'], topResources: [], riskiestActions: [] }
      });

      setRoleAnalysis(rolesData || [
        { id: '1', name: 'Data Analyst', usersCount: 342, permissionsCount: 15, effectiveness: 89, riskLevel: 'low', lastUsed: '2024-01-15', isOrphaned: false, recommendations: ['Consider consolidating similar permissions'] },
        { id: '2', name: 'Admin', usersCount: 12, permissionsCount: 156, effectiveness: 95, riskLevel: 'high', lastUsed: '2024-01-16', isOrphaned: false, recommendations: ['Review admin access frequency', 'Consider role separation'] },
        { id: '3', name: 'Viewer', usersCount: 523, permissionsCount: 8, effectiveness: 78, riskLevel: 'low', lastUsed: '2024-01-16', isOrphaned: false, recommendations: ['Optimize read permissions'] }
      ]);

      setSecurityInsights(insightsData?.insights || [
        { id: '1', type: 'security', severity: 'warning', title: 'Excessive Admin Privileges', description: 'Multiple users have unnecessary admin access', affectedUsers: 8, affectedResources: 45, recommendation: 'Review and reduce admin permissions', confidence: 87 },
        { id: '2', type: 'compliance', severity: 'critical', title: 'SOX Compliance Gap', description: 'Financial data access lacks proper segregation', affectedUsers: 23, affectedResources: 12, recommendation: 'Implement segregation of duties', confidence: 94 }
      ]);

      setTrendsData(trendsData || []);
      setComplianceData(complianceData || {
        frameworks: [
          { id: '1', name: 'SOX', status: 'compliant', score: 92, controlsMet: 45, totalControls: 49 },
          { id: '2', name: 'GDPR', status: 'partial', score: 78, controlsMet: 34, totalControls: 44 }
        ]
      });

      // AI Analysis if enabled
      if (currentUser?.preferences?.aiEnabled) {
        const mockAIRecommendations = [
          { id: '1', title: 'Role Optimization', description: 'Consolidate similar roles to reduce complexity', impact: 'high', confidence: 89 },
          { id: '2', title: 'Permission Cleanup', description: 'Remove unused permissions from inactive roles', impact: 'medium', confidence: 76 }
        ];
        
        const mockRiskAlerts = [
          { id: '1', message: 'Privileged access concentration detected', severity: 'high', affectedUsers: 8 },
          { id: '2', message: 'Unusual access pattern identified', severity: 'medium', affectedUsers: 15 }
        ];

        setAIRecommendations(mockAIRecommendations);
        setRiskAlerts(mockRiskAlerts);
        setOptimizationSuggestions(mockAIRecommendations);
      }

      trackActivity({
        action: 'rbac_metrics_loaded',
        component: 'QuickRBACMetrics',
        metadata: { 
          timeRange,
          workspaceId: currentWorkspace?.id,
          metricsCount: selectedMetrics.length
        },
      });
    } catch (error) {
      console.error('Failed to load RBAC metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, currentWorkspace, selectedMetrics, currentUser, isVisible, getRBACMetrics, getRoleAnalysis, getSecurityInsights, getRBACTrends, getComplianceReport, getCrossGroupRBACMetrics, trackActivity]);

  const handleExport = useCallback(async () => {
    if (!rbacMetrics) return;

    setIsExporting(true);
    try {
      // Export logic would be implemented here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate export
      
      trackActivity({
        action: 'rbac_metrics_exported',
        component: 'QuickRBACMetrics',
        metadata: { format: exportFormat, timeRange },
      });
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [rbacMetrics, exportFormat, timeRange, trackActivity]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && isVisible) {
      loadRBACMetrics(); // Initial load
      const intervalId = setInterval(loadRBACMetrics, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [autoRefresh, isVisible, refreshInterval, loadRBACMetrics]);

  // Load data when time range changes
  useEffect(() => {
    if (isVisible) {
      loadRBACMetrics();
    }
  }, [timeRange, loadRBACMetrics, isVisible]);

  // Track component visibility
  useEffect(() => {
    if (isVisible) {
      trackActivity({
        action: 'quick_rbac_metrics_opened',
        component: 'QuickRBACMetrics',
        metadata: { workspace: currentWorkspace?.id },
      });
    }
  }, [isVisible, currentWorkspace, trackActivity]);

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

  const renderSeverityBadge = (severity: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      info: 'bg-blue-100 text-blue-800 border-blue-300',
    };

    return (
      <Badge variant="outline" className={colors[severity as keyof typeof colors]}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Risk Alerts Banner */}
      {riskAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4"
        >
          <div className="flex items-center space-x-3 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="font-semibold text-red-800">Security Risk Alerts ({riskAlerts.length})</span>
          </div>
          <div className="space-y-2">
            {riskAlerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between text-sm">
                <span className="text-red-700">{alert.message}</span>
                <Badge variant="outline" className="text-red-600 border-red-300">
                  {alert.severity}
                </Badge>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Key Metrics Cards */}
      {rbacMetrics && (
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">Active Users</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {rbacMetrics.activeUsers.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 text-sm text-blue-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>+8%</span>
                </div>
                <p className="text-xs text-blue-500">vs last period</p>
              </div>
            </div>
            <Progress value={(rbacMetrics.activeUsers / rbacMetrics.totalUsers) * 100} className="h-2" />
          </motion.div>

          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Crown className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-900">Active Roles</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {rbacMetrics.activeRoles}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 text-sm text-purple-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>+3%</span>
                </div>
                <p className="text-xs text-purple-500">role efficiency</p>
              </div>
            </div>
            <Progress value={rbacMetrics.roleEffectiveness} className="h-2" />
          </motion.div>

          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-900">Security Score</p>
                  <p className="text-2xl font-bold text-green-700">
                    {rbacMetrics.securityScore}%
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>+5%</span>
                </div>
                <p className="text-xs text-green-500">improvement</p>
              </div>
            </div>
            <Progress value={rbacMetrics.securityScore} className="h-2" />
          </motion.div>

          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-900">Risk Score</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {rbacMetrics.riskScore}%
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 text-sm text-orange-600">
                  <TrendingDown className="h-4 w-4" />
                  <span>-7%</span>
                </div>
                <p className="text-xs text-orange-500">risk reduction</p>
              </div>
            </div>
            <Progress value={100 - rbacMetrics.riskScore} className="h-2" />
          </motion.div>
        </div>
      )}

      {/* Access Requests Summary */}
      {rbacMetrics?.accessRequests && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2">
              <Key className="h-4 w-4" />
              <span>Access Requests</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{rbacMetrics.accessRequests.pending}</div>
                <div className="text-xs text-yellow-500">Pending</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{rbacMetrics.accessRequests.approved}</div>
                <div className="text-xs text-green-500">Approved</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{rbacMetrics.accessRequests.denied}</div>
                <div className="text-xs text-red-500">Denied</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{rbacMetrics.accessRequests.total}</div>
                <div className="text-xs text-blue-500">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI-Powered Insights */}
      <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-purple-900">AI Security Insights</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAIInsights(true)}
            disabled={aiRecommendations.length === 0}
          >
            View All ({aiRecommendations.length})
          </Button>
        </div>
        
        <div className="space-y-3">
          {securityInsights.slice(0, 3).map((insight) => (
            <div key={insight.id} className="p-4 bg-white rounded-lg border border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-1 bg-purple-100 rounded">
                    <Sparkles className="h-3 w-3 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-purple-900">{insight.title}</p>
                      {renderSeverityBadge(insight.severity)}
                    </div>
                    <p className="text-xs text-purple-600 mb-2">{insight.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{insight.affectedUsers} users affected</span>
                      <span>{insight.affectedResources} resources</span>
                      <span>{insight.confidence}% confidence</span>
                    </div>
                  </div>
                </div>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs text-purple-600">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="justify-start">
            <Users className="h-4 w-4 mr-2" />
            Manage Users
          </Button>
          <Button variant="outline" size="sm" className="justify-start">
            <Crown className="h-4 w-4 mr-2" />
            Role Analysis
          </Button>
          <Button variant="outline" size="sm" className="justify-start">
            <Shield className="h-4 w-4 mr-2" />
            Security Audit
          </Button>
          <Button variant="outline" size="sm" className="justify-start">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
    </div>
  );

  const renderRolesTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <Crown className="h-4 w-4" />
            <span>Role Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {roleAnalysis.slice(0, 5).map((role) => (
              <div key={role.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <Crown className="h-4 w-4 text-purple-600" />
                    <div>
                      <h4 className="font-medium text-sm">{role.name}</h4>
                      <p className="text-xs text-gray-500">
                        {role.usersCount} users • {role.permissionsCount} permissions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {renderRiskBadge(role.riskLevel)}
                    {role.isOrphaned && (
                      <Badge variant="outline" className="text-gray-600 border-gray-300">
                        Orphaned
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Effectiveness</span>
                    <span>{role.effectiveness}%</span>
                  </div>
                  <Progress value={role.effectiveness} className="h-2" />
                </div>

                {role.recommendations.length > 0 && (
                  <div className="mt-3">
                    <Label className="text-xs text-gray-500">Recommendations</Label>
                    <ul className="mt-1 space-y-1">
                      {role.recommendations.slice(0, 2).map((rec, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-start">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    Last used: {new Date(role.lastUsed).toLocaleDateString()}
                  </span>
                  <Button variant="ghost" size="sm" className="h-auto p-1 text-xs">
                    Analyze
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Effectiveness Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Role Effectiveness Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg flex items-center justify-center border border-gray-200">
            <div className="text-center text-gray-500">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-sm font-medium">Role Effectiveness Chart</p>
              <p className="text-xs mt-1">Visual analysis of role performance</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderComplianceTab = () => (
    <div className="space-y-4">
      {/* Compliance Score */}
      {rbacMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Compliance Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {rbacMetrics.complianceScore}%
              </div>
              <p className="text-sm text-gray-600">Overall Compliance Score</p>
              <Progress value={rbacMetrics.complianceScore} className="h-3 mt-3" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-lg font-bold text-green-900">
                  {rbacMetrics.totalPolicies - rbacMetrics.accessViolations}
                </div>
                <div className="text-xs text-green-600">Compliant Policies</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                <div className="text-lg font-bold text-red-900">
                  {rbacMetrics.accessViolations}
                </div>
                <div className="text-xs text-red-600">Violations</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compliance Details */}
      {complianceData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Compliance Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complianceData.frameworks?.map((framework: any) => (
                <div key={framework.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{framework.name}</h4>
                    <Badge variant={framework.status === 'compliant' ? 'outline' : 'destructive'}>
                      {framework.status}
                    </Badge>
                  </div>
                  <Progress value={framework.score} className="h-2 mb-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{framework.controlsMet}/{framework.totalControls} controls met</span>
                    <span>{framework.score}% compliant</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimization Suggestions */}
      {optimizationSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2">
              <Zap className="h-4 w-4 text-yellow-600" />
              <span>Optimization Suggestions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {optimizationSuggestions.slice(0, 3).map((suggestion, index) => (
                <div key={index} className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="flex items-start space-x-3">
                    <div className="p-1 bg-yellow-100 rounded">
                      <Sparkles className="h-3 w-3 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-900">{suggestion.title}</p>
                      <p className="text-xs text-yellow-700 mt-1">{suggestion.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                          Impact: {suggestion.impact}
                        </Badge>
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs text-yellow-600">
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

  const renderSettingsTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Display Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-refresh">Auto-Refresh Metrics</Label>
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs">Time Range</Label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Export Format</Label>
            <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Report</SelectItem>
                <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                <SelectItem value="csv">CSV Data</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleExport} 
            disabled={isExporting || !rbacMetrics}
            className="w-full"
          >
            {isExporting ? 'Exporting...' : 'Export RBAC Report'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Visible Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { id: 'users', label: 'User Metrics' },
              { id: 'roles', label: 'Role Analysis' },
              { id: 'security', label: 'Security Score' },
              { id: 'compliance', label: 'Compliance Score' },
            ].map((metric) => (
              <div key={metric.id} className="flex items-center space-x-2">
                <Checkbox
                  id={metric.id}
                  checked={selectedMetrics.includes(metric.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedMetrics(prev => [...prev, metric.id]);
                    } else {
                      setSelectedMetrics(prev => prev.filter(m => m !== metric.id));
                    }
                  }}
                />
                <Label htmlFor={metric.id} className="text-sm">{metric.label}</Label>
              </div>
            ))}
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
            <div className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">RBAC Analytics</h3>
              <p className="text-xs text-gray-500">
                {currentWorkspace?.name || 'All Workspaces'} • Security & Compliance Metrics
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${autoRefresh && isLoading ? 'animate-spin' : ''}`} />
              Auto
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-1" />
              )}
              Export
            </Button>
            
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[calc(85vh-200px)]">
              <TabsContent value="overview">{renderOverviewTab()}</TabsContent>
              <TabsContent value="roles">{renderRolesTab()}</TabsContent>
              <TabsContent value="compliance">{renderComplianceTab()}</TabsContent>
              <TabsContent value="settings">{renderSettingsTab()}</TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default QuickRBACMetrics;