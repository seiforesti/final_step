'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ShieldAlert, ShieldCheckIcon, ShieldX, Lock, Unlock, Key, KeyRound, Eye, EyeOff, Users, User, UserCheck, UserX, Crown, AlertTriangle, AlertCircle, CheckCircle, XCircle, Activity, TrendingUp, TrendingDown, BarChart3, Settings, Filter, Search, RefreshCw, Download, Clock, Calendar, MapPin, Globe, Smartphone, Fingerprint, Scan, Camera, Wifi, WifiOff, Database, Server, Cloud, HardDrive, Cpu, Bug, Zap, Target, Crosshair, Radar, FileText, Clipboard, Archive, Trash2, Mail, Bell, Phone, MessageSquare, Plus, Minus, Edit, Save, X, Check, ChevronDown, ChevronRight, ChevronLeft, MoreHorizontal, MoreVertical, ExternalLink } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { useWorkspaceManagement } from '../hooks/optimized/useOptimizedWorkspaceManagement'
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration'
import { useUserManagement } from '../hooks/optimized/useOptimizedUserManagement'
import { useAIAssistant } from '../../hooks/useAIAssistant'
import { useCrossGroupIntegration } from '../hooks/optimized/useOptimizedCrossGroupIntegration'

import { 
  activityTrackingAPI, 
  rbacAdminAPI, 
  workspaceManagementAPI as wsAPI 
} from '../../services'

import { 
  WorkspaceConfiguration, 
  WorkspaceMember,
  WorkspaceResource,
  WorkspaceSettings,
  WorkspaceAnalytics,
  WorkspacePermissions,
  SecurityPolicy,
  SecurityThreat,
  SecurityAudit,
  AccessControl,
  ComplianceRule
} from '../../types/racine-core.types'

// Security-specific types
interface SecurityEvent {
  id: string
  type: 'login' | 'logout' | 'access_denied' | 'permission_change' | 'data_access' | 'suspicious_activity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  userId: string
  userName: string
  workspaceId: string
  workspaceName: string
  timestamp: string
  details: Record<string, any>
  ipAddress: string
  userAgent: string
  location?: {
    country: string
    city: string
    coordinates: [number, number]
  }
  resolved: boolean
  assignedTo?: string
  notes?: string
}

interface ThreatIntelligence {
  id: string
  type: 'malware' | 'phishing' | 'data_breach' | 'unauthorized_access' | 'insider_threat'
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  description: string
  indicators: string[]
  mitigations: string[]
  affectedResources: string[]
  detectionTime: string
  status: 'active' | 'investigating' | 'mitigated' | 'resolved'
  analyst?: string
}

interface ComplianceFramework {
  id: string
  name: string
  version: string
  requirements: ComplianceRequirement[]
  status: 'compliant' | 'non_compliant' | 'partial' | 'unknown'
  lastAssessment: string
  nextAssessment: string
  complianceScore: number
}

interface ComplianceRequirement {
  id: string
  title: string
  description: string
  category: string
  mandatory: boolean
  status: 'compliant' | 'non_compliant' | 'partial' | 'not_applicable'
  evidence: string[]
  lastChecked: string
  responsibleParty: string
}

interface SecurityMetrics {
  overallSecurityScore: number
  threatLevel: 'low' | 'medium' | 'high' | 'critical'
  activeThreats: number
  resolvedThreats: number
  complianceScore: number
  accessViolations: number
  securityIncidents: number
  vulnerabilities: {
    critical: number
    high: number
    medium: number
    low: number
  }
  trends: {
    period: string
    securityScore: number[]
    threatCount: number[]
    complianceScore: number[]
  }
}

const WorkspaceSecurityManager: React.FC = () => {
  // Hooks
  const { workspaces, currentWorkspace, updateWorkspaceSettings } = useWorkspaceManagement()
  const { orchestrationStatus, globalMetrics } = useRacineOrchestration()
  const { currentUser, users, updateUserPermissions } = useUserManagement()
  const { generateRecommendations, analyzeSecurityRisks } = useAIAssistant()
  const { crossGroupResources, integrationStatus } = useCrossGroupIntegration()

  // State
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [threatIntelligence, setThreatIntelligence] = useState<ThreatIntelligence[]>([])
  const [complianceFrameworks, setComplianceFrameworks] = useState<ComplianceFramework[]>([])
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null)
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>(currentWorkspace?.id || '')
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('7d')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showCreatePolicy, setShowCreatePolicy] = useState<boolean>(false)
  const [showThreatDetails, setShowThreatDetails] = useState<boolean>(false)
  const [selectedThreat, setSelectedThreat] = useState<ThreatIntelligence | null>(null)
  const [showComplianceDetails, setShowComplianceDetails] = useState<boolean>(false)
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | null>(null)

  // Security Policies State
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([])
  const [newPolicyForm, setNewPolicyForm] = useState({
    name: '',
    description: '',
    category: 'access_control',
    severity: 'medium',
    rules: [],
    enabled: true
  })

  // Access Control State
  const [accessControlRules, setAccessControlRules] = useState<AccessControl[]>([])
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [permissionChanges, setPermissionChanges] = useState<Record<string, any>>({})

  // Real-time Security Monitoring
  useEffect(() => {
    const fetchSecurityData = async () => {
      if (!selectedWorkspace) return

      setIsLoading(true)
      try {
        // Fetch security events
        const events = await fetchSecurityEvents(selectedWorkspace, selectedTimeRange)
        setSecurityEvents(events)

        // Fetch threat intelligence
        const threats = await fetchThreatIntelligence(selectedWorkspace)
        setThreatIntelligence(threats)

        // Fetch compliance data
        const compliance = await fetchComplianceFrameworks(selectedWorkspace)
        setComplianceFrameworks(compliance)

        // Fetch security metrics
        const metrics = await fetchSecurityMetrics(selectedWorkspace, selectedTimeRange)
        setSecurityMetrics(metrics)

        // Fetch security policies
        const policies = await fetchSecurityPolicies(selectedWorkspace)
        setSecurityPolicies(policies)

        // Fetch access control rules
        const accessRules = await fetchAccessControlRules(selectedWorkspace)
        setAccessControlRules(accessRules)
      } catch (error) {
        console.error('Error fetching security data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSecurityData()
    
    // Set up real-time updates
    const interval = setInterval(fetchSecurityData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [selectedWorkspace, selectedTimeRange])

  // Backend API functions using activityTrackingAPI
  const fetchSecurityEvents = async (workspaceId: string, timeRange: string): Promise<SecurityEvent[]> => {
    try {
      const endDate = new Date().toISOString()
      const startDate = new Date(Date.now() - (timeRange === '1d' ? 86400000 : timeRange === '7d' ? 604800000 : timeRange === '30d' ? 2592000000 : 7776000000)).toISOString()
      
      const response = await activityTrackingAPI.getActivitiesByWorkspace(workspaceId, {
        start_date: startDate,
        end_date: endDate,
        activity_types: ['security_event', 'access_violation', 'authentication_failure', 'suspicious_activity'],
        include_metadata: true
      })

      // Transform backend activity records to SecurityEvent format
      return response.activities.map(activity => ({
        id: activity.id,
        type: activity.activity_type as any,
        severity: activity.metadata?.severity || 'medium',
        userId: activity.user_id,
        userName: activity.metadata?.user_name || 'Unknown',
        workspaceId: activity.workspace_id || workspaceId,
        workspaceName: activity.metadata?.workspace_name || 'Unknown',
        timestamp: activity.timestamp,
        details: activity.metadata?.details || {},
        ipAddress: activity.metadata?.ip_address || 'Unknown',
        userAgent: activity.metadata?.user_agent || 'Unknown',
        location: activity.metadata?.location,
        resolved: activity.metadata?.resolved || false,
        assignedTo: activity.metadata?.assigned_to,
        notes: activity.metadata?.notes
      }))
    } catch (error) {
      console.error('Error fetching security events:', error)
      return []
    }
  }

  const fetchThreatIntelligence = async (workspaceId: string): Promise<ThreatIntelligence[]> => {
    try {
      const response = await activityTrackingAPI.getAnomalies({
        workspace_id: workspaceId,
        anomaly_types: ['security_threat', 'unauthorized_access', 'suspicious_activity'],
        time_range: '24h',
        include_analysis: true
      })

      // Transform backend anomalies to ThreatIntelligence format
      return response.anomalies.map(anomaly => ({
        id: anomaly.id,
        type: anomaly.anomaly_type as any,
        riskLevel: anomaly.severity,
        description: anomaly.description,
        indicators: anomaly.metadata?.indicators || [],
        mitigations: anomaly.metadata?.recommended_actions || [],
        affectedResources: anomaly.metadata?.affected_resources || [],
        detectionTime: anomaly.detected_at,
        status: anomaly.status === 'active' ? 'active' : anomaly.status === 'resolved' ? 'resolved' : 'investigating',
        analyst: anomaly.metadata?.assigned_analyst
      }))
    } catch (error) {
      console.error('Error fetching threat intelligence:', error)
      return []
    }
  }

  const fetchComplianceFrameworks = async (workspaceId: string): Promise<ComplianceFramework[]> => {
    try {
      const response = await rbacAdminAPI.getComplianceFrameworks({
        workspace_id: workspaceId,
        include_requirements: true,
        include_assessment_history: true
      })

      // Transform backend compliance data to ComplianceFramework format
      return response.frameworks.map(framework => ({
        id: framework.id,
        name: framework.name,
        version: framework.version,
        requirements: framework.requirements?.map(req => ({
          id: req.id,
          title: req.title,
          description: req.description,
          category: req.category,
          mandatory: req.mandatory,
          status: req.compliance_status,
          evidence: req.evidence_files || [],
          lastChecked: req.last_checked,
          responsibleParty: req.responsible_party
        })) || [],
        status: framework.compliance_status,
        lastAssessment: framework.last_assessment,
        nextAssessment: framework.next_assessment,
        complianceScore: framework.compliance_score
      }))
    } catch (error) {
      console.error('Error fetching compliance frameworks:', error)
      return []
    }
  }

  const fetchSecurityMetrics = async (workspaceId: string, timeRange: string): Promise<SecurityMetrics> => {
    try {
      const endDate = new Date().toISOString()
      const startDate = new Date(Date.now() - (timeRange === '1d' ? 86400000 : timeRange === '7d' ? 604800000 : timeRange === '30d' ? 2592000000 : 7776000000)).toISOString()
      
      // Fetch security analytics from activity tracking
      const securityAnalytics = await activityTrackingAPI.getActivityAnalytics({
        workspace_id: workspaceId,
        start_date: startDate,
        end_date: endDate,
        analytics_types: ['security_metrics', 'threat_analysis', 'compliance_metrics'],
        include_trends: true
      })

      // Fetch workspace security status
      const securityStatus = await wsAPI.getWorkspaceSecurity(workspaceId)

      return {
        overallSecurityScore: securityStatus.security_score || 85,
        threatLevel: securityStatus.threat_level || 'medium',
        activeThreats: securityAnalytics.metrics?.active_threats || 0,
        resolvedThreats: securityAnalytics.metrics?.resolved_threats || 0,
        complianceScore: securityStatus.compliance_score || 90,
        accessViolations: securityAnalytics.metrics?.access_violations || 0,
        securityIncidents: securityAnalytics.metrics?.security_incidents || 0,
        vulnerabilities: {
          critical: securityStatus.vulnerabilities?.critical || 0,
          high: securityStatus.vulnerabilities?.high || 0,
          medium: securityStatus.vulnerabilities?.medium || 0,
          low: securityStatus.vulnerabilities?.low || 0
        },
        trends: {
          period: timeRange,
          securityScore: securityAnalytics.trends?.security_score || [],
          threatCount: securityAnalytics.trends?.threat_count || [],
          complianceScore: securityAnalytics.trends?.compliance_score || []
        }
      }
    } catch (error) {
      console.error('Error fetching security metrics:', error)
      return {
        overallSecurityScore: 0,
        threatLevel: 'unknown',
        activeThreats: 0,
        resolvedThreats: 0,
        complianceScore: 0,
        accessViolations: 0,
        securityIncidents: 0,
        vulnerabilities: { critical: 0, high: 0, medium: 0, low: 0 },
        trends: { period: timeRange, securityScore: [], threatCount: [], complianceScore: [] }
      }
    }
  }

  const fetchSecurityPolicies = async (workspaceId: string): Promise<SecurityPolicy[]> => {
    try {
      const response = await rbacAdminAPI.getSecurityPolicies({
        workspace_id: workspaceId,
        include_rules: true,
        include_enforcement_history: true
      })

      return response.policies || []
    } catch (error) {
      console.error('Error fetching security policies:', error)
      return []
    }
  }

  const fetchAccessControlRules = async (workspaceId: string): Promise<AccessControl[]> => {
    try {
      const response = await rbacAdminAPI.getAccessControlRules({
        workspace_id: workspaceId,
        include_permissions: true,
        include_inheritance: true
      })

      return response.access_rules || []
    } catch (error) {
      console.error('Error fetching access control rules:', error)
      return []
    }
  }

  // Filtered and sorted data
  const filteredSecurityEvents = useMemo(() => {
    return securityEvents.filter(event => {
      const matchesSeverity = filterSeverity === 'all' || event.severity === filterSeverity
      const matchesStatus = filterStatus === 'all' || (filterStatus === 'resolved' ? event.resolved : !event.resolved)
      const matchesSearch = searchQuery === '' || 
        event.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.type.toLowerCase().includes(searchQuery.toLowerCase())
      
      return matchesSeverity && matchesStatus && matchesSearch
    })
  }, [securityEvents, filterSeverity, filterStatus, searchQuery])

  // Handlers
  const handleCreateSecurityPolicy = async () => {
    try {
      setIsLoading(true)
      
      await rbacAdminAPI.createSecurityPolicy({
        workspace_id: selectedWorkspace,
        name: newPolicyForm.name,
        description: newPolicyForm.description,
        category: newPolicyForm.category,
        severity: newPolicyForm.severity,
        rules: newPolicyForm.rules,
        enabled: newPolicyForm.enabled
      })

      // Refresh security policies
      const updatedPolicies = await fetchSecurityPolicies(selectedWorkspace)
      setSecurityPolicies(updatedPolicies)
      
      setShowCreatePolicy(false)
      setNewPolicyForm({
        name: '',
        description: '',
        category: 'access_control',
        severity: 'medium',
        rules: [],
        enabled: true
      })
    } catch (error) {
      console.error('Error creating security policy:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResolveSecurityEvent = async (eventId: string) => {
    try {
      setIsLoading(true)
      
      await activityTrackingAPI.updateActivity(eventId, {
        metadata: { resolved: true, resolved_at: new Date().toISOString(), resolved_by: currentUser?.id }
      })

      // Refresh security events
      const updatedEvents = await fetchSecurityEvents(selectedWorkspace, selectedTimeRange)
      setSecurityEvents(updatedEvents)
    } catch (error) {
      console.error('Error resolving security event:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMitigateThreat = async (threatId: string) => {
    try {
      setIsLoading(true)
      
      await activityTrackingAPI.resolveAnomaly(threatId, {
        resolution_status: 'mitigated',
        resolution_notes: 'Threat mitigated through security controls',
        resolved_by: currentUser?.id,
        mitigation_actions: ['security_policy_applied', 'access_restricted']
      })

      // Refresh threat intelligence
      const updatedThreats = await fetchThreatIntelligence(selectedWorkspace)
      setThreatIntelligence(updatedThreats)
    } catch (error) {
      console.error('Error mitigating threat:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdatePermissions = async (userId: string, permissions: any) => {
    try {
      setIsLoading(true)
      await updateUserPermissions(userId, permissions)
      setPermissionChanges({})
    } catch (error) {
      console.error('Error updating permissions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'secondary'
    }
  }

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <TooltipProvider>
      <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
        {/* Header */}
        <div className="flex-none p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Workspace Security Manager
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Enterprise-grade security controls and threat management
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select workspace" />
                </SelectTrigger>
                <SelectContent>
                  {workspaces.map((workspace) => (
                    <SelectItem key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Security Metrics Overview */}
        {securityMetrics && (
          <div className="flex-none p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Security Score</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {securityMetrics.overallSecurityScore}%
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className={`h-5 w-5 ${getThreatLevelColor(securityMetrics.threatLevel)}`} />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Threat Level</p>
                    <p className={`text-2xl font-bold capitalize ${getThreatLevelColor(securityMetrics.threatLevel)}`}>
                      {securityMetrics.threatLevel}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Active Threats</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {securityMetrics.activeThreats}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Compliance</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {securityMetrics.complianceScore}%
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Violations</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {securityMetrics.accessViolations}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Incidents</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {securityMetrics.securityIncidents}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <Bug className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Vulnerabilities</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {Object.values(securityMetrics.vulnerabilities).reduce((a, b) => a + b, 0)}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="flex-none px-6 pt-4">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="events">Security Events</TabsTrigger>
                <TabsTrigger value="threats">Threat Intelligence</TabsTrigger>
                <TabsTrigger value="policies">Security Policies</TabsTrigger>
                <TabsTrigger value="access">Access Control</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              {/* Overview Tab */}
              <TabsContent value="overview" className="h-full p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Security Trends */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5" />
                        <span>Security Trends</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Security Score Trend</span>
                            <span className="text-green-600">+2.3%</span>
                          </div>
                          <Progress value={85} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Threat Mitigation</span>
                            <span className="text-green-600">+15%</span>
                          </div>
                          <Progress value={78} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Compliance Score</span>
                            <span className="text-blue-600">Stable</span>
                          </div>
                          <Progress value={92} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Threats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Radar className="h-5 w-5" />
                        <span>Recent Threats</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {threatIntelligence.slice(0, 5).map((threat) => (
                          <div key={threat.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`w-2 h-2 rounded-full ${
                                threat.riskLevel === 'critical' ? 'bg-red-500' :
                                threat.riskLevel === 'high' ? 'bg-orange-500' :
                                threat.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                              }`} />
                              <div>
                                <p className="font-medium text-sm">{threat.type.replace('_', ' ')}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                  {new Date(threat.detectionTime).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            <Badge variant={threat.status === 'active' ? 'destructive' : 'secondary'}>
                              {threat.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Vulnerability Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bug className="h-5 w-5" />
                      <span>Vulnerability Assessment</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {securityMetrics && (
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                          <p className="text-2xl font-bold text-red-600">{securityMetrics.vulnerabilities.critical}</p>
                          <p className="text-sm text-red-700 dark:text-red-400">Critical</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                          <p className="text-2xl font-bold text-orange-600">{securityMetrics.vulnerabilities.high}</p>
                          <p className="text-sm text-orange-700 dark:text-orange-400">High</p>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                          <p className="text-2xl font-bold text-yellow-600">{securityMetrics.vulnerabilities.medium}</p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">Medium</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">{securityMetrics.vulnerabilities.low}</p>
                          <p className="text-sm text-green-700 dark:text-green-400">Low</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Events Tab */}
              <TabsContent value="events" className="h-full p-6">
                <div className="h-full flex flex-col space-y-4">
                  {/* Filters */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search events..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Severity</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="unresolved">Unresolved</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={() => {}}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>

                  {/* Events Table */}
                  <Card className="flex-1">
                    <CardContent className="p-0">
                      <ScrollArea className="h-[600px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Event</TableHead>
                              <TableHead>Severity</TableHead>
                              <TableHead>User</TableHead>
                              <TableHead>Workspace</TableHead>
                              <TableHead>Time</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredSecurityEvents.map((event) => (
                              <TableRow key={event.id}>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    {event.type === 'suspicious_activity' && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                                    {event.type === 'access_denied' && <ShieldX className="h-4 w-4 text-red-500" />}
                                    {event.type === 'login' && <User className="h-4 w-4 text-blue-500" />}
                                    {event.type === 'logout' && <UserX className="h-4 w-4 text-gray-500" />}
                                    <span className="font-medium">{event.type.replace('_', ' ')}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={getSeverityColor(event.severity)}>
                                    {event.severity}
                                  </Badge>
                                </TableCell>
                                <TableCell>{event.userName}</TableCell>
                                <TableCell>{event.workspaceName}</TableCell>
                                <TableCell>
                                  {new Date(event.timestamp).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  {event.location ? `${event.location.city}, ${event.location.country}` : 'Unknown'}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={event.resolved ? 'secondary' : 'destructive'}>
                                    {event.resolved ? 'Resolved' : 'Active'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      <DropdownMenuItem onClick={() => console.log('View details', event.id)}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      {!event.resolved && (
                                        <DropdownMenuItem onClick={() => handleResolveSecurityEvent(event.id)}>
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Mark Resolved
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem>
                                        <User className="h-4 w-4 mr-2" />
                                        Assign to Analyst
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Threat Intelligence Tab */}
              <TabsContent value="threats" className="h-full p-6">
                <div className="h-full flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Active Threat Intelligence</h3>
                    <Button onClick={() => {}}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Threat Indicator
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    {threatIntelligence.map((threat) => (
                      <Card key={threat.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className={`w-3 h-3 rounded-full mt-1 ${
                              threat.riskLevel === 'critical' ? 'bg-red-500' :
                              threat.riskLevel === 'high' ? 'bg-orange-500' :
                              threat.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`} />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-semibold">{threat.type.replace('_', ' ').toUpperCase()}</h4>
                                <Badge variant={
                                  threat.riskLevel === 'critical' ? 'destructive' :
                                  threat.riskLevel === 'high' ? 'destructive' :
                                  threat.riskLevel === 'medium' ? 'default' : 'secondary'
                                }>
                                  {threat.riskLevel} Risk
                                </Badge>
                                <Badge variant={
                                  threat.status === 'active' ? 'destructive' :
                                  threat.status === 'investigating' ? 'default' :
                                  threat.status === 'mitigated' ? 'secondary' : 'secondary'
                                }>
                                  {threat.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                {threat.description}
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="font-medium mb-1">Indicators:</p>
                                  <ul className="list-disc list-inside text-slate-600 dark:text-slate-400">
                                    {threat.indicators.map((indicator, index) => (
                                      <li key={index}>{indicator}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <p className="font-medium mb-1">Affected Resources:</p>
                                  <ul className="list-disc list-inside text-slate-600 dark:text-slate-400">
                                    {threat.affectedResources.map((resource, index) => (
                                      <li key={index}>{resource}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <p className="font-medium mb-1">Recommended Actions:</p>
                                  <ul className="list-disc list-inside text-slate-600 dark:text-slate-400">
                                    {threat.mitigations.map((mitigation, index) => (
                                      <li key={index}>{mitigation}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedThreat(threat)
                                setShowThreatDetails(true)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Details
                            </Button>
                            {threat.status === 'active' && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleMitigateThreat(threat.id)}
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Mitigate
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Security Policies Tab */}
              <TabsContent value="policies" className="h-full p-6">
                <div className="h-full flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Security Policies</h3>
                    <Button onClick={() => setShowCreatePolicy(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Policy
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    {securityPolicies.map((policy) => (
                      <Card key={policy.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-lg ${
                              policy.category === 'access_control' ? 'bg-blue-100 dark:bg-blue-900' :
                              policy.category === 'data_protection' ? 'bg-green-100 dark:bg-green-900' :
                              policy.category === 'network_security' ? 'bg-purple-100 dark:bg-purple-900' :
                              'bg-gray-100 dark:bg-gray-900'
                            }`}>
                              <Shield className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{policy.name}</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{policy.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={policy.enabled ? 'default' : 'secondary'}>
                              {policy.enabled ? 'Active' : 'Inactive'}
                            </Badge>
                            <Switch checked={policy.enabled} />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Access Control Tab */}
              <TabsContent value="access" className="h-full p-6">
                <div className="h-full flex flex-col space-y-4">
                  <h3 className="text-lg font-semibold">Access Control Management</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>User Permissions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <Select value={selectedUser} onValueChange={setSelectedUser}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select user" />
                            </SelectTrigger>
                            <SelectContent>
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.name} ({user.email})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {selectedUser && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="read-permission">Read Access</Label>
                                <Switch id="read-permission" />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label htmlFor="write-permission">Write Access</Label>
                                <Switch id="write-permission" />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label htmlFor="admin-permission">Admin Access</Label>
                                <Switch id="admin-permission" />
                              </div>
                              <Button className="w-full">
                                Update Permissions
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Role-Based Access</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Available Roles</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <Badge variant="outline">Data Analyst</Badge>
                              <Badge variant="outline">Data Engineer</Badge>
                              <Badge variant="outline">Data Scientist</Badge>
                              <Badge variant="outline">Security Admin</Badge>
                              <Badge variant="outline">Compliance Officer</Badge>
                              <Badge variant="outline">System Admin</Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Compliance Tab */}
              <TabsContent value="compliance" className="h-full p-6">
                <div className="h-full flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Compliance Management</h3>
                    <Button onClick={() => {}}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Framework
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    {complianceFrameworks.map((framework) => (
                      <Card key={framework.id} className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{framework.name} ({framework.version})</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                Compliance Score: {framework.complianceScore}%
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={
                              framework.status === 'compliant' ? 'default' :
                              framework.status === 'non_compliant' ? 'destructive' :
                              framework.status === 'partial' ? 'secondary' : 'outline'
                            }>
                              {framework.status.replace('_', ' ')}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedFramework(framework)
                                setShowComplianceDetails(true)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Details
                            </Button>
                          </div>
                        </div>
                        <Progress value={framework.complianceScore} className="h-2" />
                        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mt-2">
                          <span>Last Assessment: {new Date(framework.lastAssessment).toLocaleDateString()}</span>
                          <span>Next Assessment: {new Date(framework.nextAssessment).toLocaleDateString()}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Create Security Policy Dialog */}
        <Dialog open={showCreatePolicy} onOpenChange={setShowCreatePolicy}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Security Policy</DialogTitle>
              <DialogDescription>
                Define a new security policy for your workspace
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="policy-name">Policy Name</Label>
                <Input
                  id="policy-name"
                  value={newPolicyForm.name}
                  onChange={(e) => setNewPolicyForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter policy name"
                />
              </div>
              <div>
                <Label htmlFor="policy-description">Description</Label>
                <Textarea
                  id="policy-description"
                  value={newPolicyForm.description}
                  onChange={(e) => setNewPolicyForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the policy"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="policy-category">Category</Label>
                  <Select value={newPolicyForm.category} onValueChange={(value) => setNewPolicyForm(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="access_control">Access Control</SelectItem>
                      <SelectItem value="data_protection">Data Protection</SelectItem>
                      <SelectItem value="network_security">Network Security</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="policy-severity">Severity</Label>
                  <Select value={newPolicyForm.severity} onValueChange={(value) => setNewPolicyForm(prev => ({ ...prev, severity: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="policy-enabled"
                  checked={newPolicyForm.enabled}
                  onCheckedChange={(checked) => setNewPolicyForm(prev => ({ ...prev, enabled: checked }))}
                />
                <Label htmlFor="policy-enabled">Enable policy immediately</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreatePolicy(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSecurityPolicy} disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Policy'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Threat Details Dialog */}
        <Dialog open={showThreatDetails} onOpenChange={setShowThreatDetails}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Threat Intelligence Details</DialogTitle>
            </DialogHeader>
            {selectedThreat && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Threat Type</Label>
                    <p className="font-medium">{selectedThreat.type.replace('_', ' ').toUpperCase()}</p>
                  </div>
                  <div>
                    <Label>Risk Level</Label>
                    <Badge variant={
                      selectedThreat.riskLevel === 'critical' ? 'destructive' :
                      selectedThreat.riskLevel === 'high' ? 'destructive' :
                      selectedThreat.riskLevel === 'medium' ? 'default' : 'secondary'
                    }>
                      {selectedThreat.riskLevel}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <p>{selectedThreat.description}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Threat Indicators</Label>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedThreat.indicators.map((indicator, index) => (
                        <li key={index} className="text-sm">{indicator}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <Label>Affected Resources</Label>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedThreat.affectedResources.map((resource, index) => (
                        <li key={index} className="text-sm">{resource}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <Label>Recommended Mitigations</Label>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedThreat.mitigations.map((mitigation, index) => (
                        <li key={index} className="text-sm">{mitigation}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowThreatDetails(false)}>
                    Close
                  </Button>
                  {selectedThreat.status === 'active' && (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleMitigateThreat(selectedThreat.id)
                        setShowThreatDetails(false)
                      }}
                    >
                      Initiate Mitigation
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Compliance Details Dialog */}
        <Dialog open={showComplianceDetails} onOpenChange={setShowComplianceDetails}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Compliance Framework Details</DialogTitle>
            </DialogHeader>
            {selectedFramework && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Framework</Label>
                    <p className="font-medium">{selectedFramework.name} ({selectedFramework.version})</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge variant={
                      selectedFramework.status === 'compliant' ? 'default' :
                      selectedFramework.status === 'non_compliant' ? 'destructive' :
                      selectedFramework.status === 'partial' ? 'secondary' : 'outline'
                    }>
                      {selectedFramework.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <Label>Compliance Score</Label>
                    <p className="font-medium">{selectedFramework.complianceScore}%</p>
                  </div>
                </div>
                
                <div>
                  <Label>Requirements</Label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedFramework.requirements.map((requirement) => (
                      <div key={requirement.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{requirement.title}</h4>
                          <Badge variant={
                            requirement.status === 'compliant' ? 'default' :
                            requirement.status === 'non_compliant' ? 'destructive' :
                            requirement.status === 'partial' ? 'secondary' : 'outline'
                          }>
                            {requirement.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{requirement.description}</p>
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Category: {requirement.category}</span>
                          <span>Responsible: {requirement.responsibleParty}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setShowComplianceDetails(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

export default WorkspaceSecurityManager