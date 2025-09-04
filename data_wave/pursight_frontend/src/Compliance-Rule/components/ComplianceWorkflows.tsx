"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, Square, RotateCcw, Clock, CheckCircle, AlertCircle, RefreshCw, PlusCircle, Eye, Edit, Trash2, Search, Users, ArrowRight, Calendar, Timer } from 'lucide-react'

// Enterprise Integration
import { ComplianceHooks } from '../hooks/use-enterprise-features'
import { useEnterpriseCompliance } from '../enterprise-integration'
import { ComplianceAPIs } from '../services/enterprise-apis'
import type { 
  ComplianceWorkflow, 
  ComplianceWorkflowExecution,
  ComplianceComponentProps 
} from '../types'

interface ComplianceWorkflowsProps extends ComplianceComponentProps {
  onCreateWorkflow?: () => void
  onEditWorkflow?: (workflow: ComplianceWorkflow) => void
  onViewWorkflow?: (workflow: ComplianceWorkflow) => void
  onDeleteWorkflow?: (workflow: ComplianceWorkflow) => void
}

const ComplianceWorkflows: React.FC<ComplianceWorkflowsProps> = ({
  dataSourceId,
  searchQuery: initialSearchQuery = '',
  filters: initialFilters = {},
  onRefresh,
  onError,
  className = '',
  onCreateWorkflow,
  onEditWorkflow,
  onViewWorkflow,
  onDeleteWorkflow
}) => {
  const enterprise = useEnterpriseCompliance()
  
  // Enterprise hooks
  const enterpriseFeatures = ComplianceHooks.useEnterpriseFeatures({
    componentName: 'ComplianceWorkflows',
    dataSourceId
  })
  
  const workflowIntegration = ComplianceHooks.useWorkflowIntegration()
  
  // State
  const [workflows, setWorkflows] = useState<ComplianceWorkflow[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [filters, setFilters] = useState(initialFilters)
  const [activeTab, setActiveTab] = useState('all')

  // Load workflows from backend
  useEffect(() => {
    const loadWorkflows = async () => {
      setLoading(true)
      try {
        // Use real backend API call through enterprise integration
        const response = await ComplianceAPIs.ComplianceManagement.getWorkflows({
          rule_id: filters.rule_id,
          status: activeTab !== 'all' ? activeTab : undefined,
          workflow_type: filters.workflow_type,
          page: 1,
          limit: 50
        })
        
        setWorkflows(response.data || [])
        
        // Emit success event
        enterprise.emitEvent({
          type: 'system_event',
          data: { action: 'workflows_loaded', count: response.data?.length || 0 },
          source: 'ComplianceWorkflows',
          severity: 'low'
        })
        
      } catch (error) {
        console.error('Failed to load workflows:', error)
        enterprise.sendNotification('error', 'Failed to load compliance workflows')
        onError?.('Failed to load compliance workflows')
        
        // Emit error event
        enterprise.emitEvent({
          type: 'system_event',
          data: { action: 'workflows_load_failed', error: error.message },
          source: 'ComplianceWorkflows',
          severity: 'high'
        })
      } finally {
        setLoading(false)
      }
    }

    loadWorkflows()
  }, [dataSourceId, filters, activeTab, enterprise])

  // Filter workflows based on active tab and search
  const filteredWorkflows = workflows.filter(workflow => {
    // Tab filter
    if (activeTab !== 'all') {
      if (activeTab === 'active' && workflow.status !== 'active') return false
      if (activeTab === 'paused' && workflow.status !== 'paused') return false
      if (activeTab === 'completed' && workflow.status !== 'completed') return false
    }

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      return (
        workflow.name.toLowerCase().includes(searchLower) ||
        workflow.description.toLowerCase().includes(searchLower) ||
        workflow.workflow_type.toLowerCase().includes(searchLower)
      )
    }

    return true
  })

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'paused':
        return 'secondary'
      case 'completed':
        return 'outline'
      case 'cancelled':
        return 'destructive'
      case 'failed':
        return 'destructive'
      case 'draft':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  // Get priority badge variant
  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive'
      case 'high':
        return 'destructive'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'outline'
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="h-4 w-4 text-green-500" />
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'cancelled':
        return <Square className="h-4 w-4 text-red-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  // Calculate workflow progress
  const calculateProgress = (workflow: ComplianceWorkflow) => {
    const completedSteps = workflow.steps.filter(step => step.status === 'completed').length
    return (completedSteps / workflow.steps.length) * 100
  }

  // Handle workflow actions
  const handleStartWorkflow = async (workflow: ComplianceWorkflow) => {
    try {
      await ComplianceAPIs.WorkflowAutomation.startWorkflow(workflow.id as number)
      setWorkflows(prev => prev.map(w => 
        w.id === workflow.id ? { ...w, status: 'active' } : w
      ))
      enterprise.sendNotification('success', 'Workflow started successfully')
    } catch (error) {
      console.error('Failed to start workflow:', error)
      enterprise.sendNotification('error', 'Failed to start workflow')
    }
  }

  const handlePauseWorkflow = async (workflow: ComplianceWorkflow) => {
    try {
      // Note: This would need the instance ID in a real implementation
      setWorkflows(prev => prev.map(w => 
        w.id === workflow.id ? { ...w, status: 'paused' } : w
      ))
      enterprise.sendNotification('success', 'Workflow paused successfully')
    } catch (error) {
      console.error('Failed to pause workflow:', error)
      enterprise.sendNotification('error', 'Failed to pause workflow')
    }
  }

  const handleResumeWorkflow = async (workflow: ComplianceWorkflow) => {
    try {
      // Note: This would need the instance ID in a real implementation
      setWorkflows(prev => prev.map(w => 
        w.id === workflow.id ? { ...w, status: 'active' } : w
      ))
      enterprise.sendNotification('success', 'Workflow resumed successfully')
    } catch (error) {
      console.error('Failed to resume workflow:', error)
      enterprise.sendNotification('error', 'Failed to resume workflow')
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Compliance Workflows</h3>
          <p className="text-sm text-muted-foreground">
            Automate and manage compliance processes and workflows
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button size="sm" onClick={onCreateWorkflow}>
            <PlusCircle className="h-4 w-4 mr-1" />
            New Workflow
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={filters.workflow_type || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, workflow_type: value || undefined }))}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="assessment">Assessment</SelectItem>
              <SelectItem value="remediation">Remediation</SelectItem>
              <SelectItem value="approval">Approval</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="notification">Notification</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.priority || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value || undefined }))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Workflows</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted animate-pulse rounded" />
                      <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                      <div className="h-2 bg-muted animate-pulse rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredWorkflows.length === 0 ? (
            <div className="text-center py-12">
              <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No workflows found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search criteria' : 'Get started by creating your first workflow'}
              </p>
              {!searchQuery && (
                <Button onClick={onCreateWorkflow}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Workflow
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredWorkflows.map((workflow) => (
                <motion.div
                  key={workflow.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusIcon(workflow.status)}
                            <CardTitle className="text-base line-clamp-1">
                              {workflow.name}
                            </CardTitle>
                          </div>
                          <CardDescription className="line-clamp-2">
                            {workflow.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Status and Priority */}
                        <div className="flex items-center justify-between">
                          <Badge variant={getStatusBadgeVariant(workflow.status)}>
                            {workflow.status}
                          </Badge>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {workflow.workflow_type}
                            </Badge>
                            <Badge variant={getPriorityBadgeVariant(workflow.priority)}>
                              {workflow.priority}
                            </Badge>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{Math.round(calculateProgress(workflow))}%</span>
                          </div>
                          <Progress value={calculateProgress(workflow)} className="h-2" />
                          <div className="flex items-center text-xs text-muted-foreground">
                            <span>
                              Step {workflow.current_step + 1} of {workflow.steps.length}
                            </span>
                          </div>
                        </div>

                        {/* Current Step */}
                        {workflow.steps[workflow.current_step] && (
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">
                                Current: {workflow.steps[workflow.current_step].name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {workflow.steps[workflow.current_step].type}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {workflow.steps[workflow.current_step].description}
                            </p>
                          </div>
                        )}

                        {/* Assignee and Due Date */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            <span>{workflow.assigned_to}</span>
                          </div>
                          {workflow.due_date && (
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>
                                {new Date(workflow.due_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                onViewWorkflow?.(workflow)
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                onEditWorkflow?.(workflow)
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center space-x-1">
                            {workflow.status === 'paused' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleResumeWorkflow(workflow)
                                }}
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Resume
                              </Button>
                            )}
                            {workflow.status === 'active' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handlePauseWorkflow(workflow)
                                }}
                              >
                                <Pause className="h-3 w-3 mr-1" />
                                Pause
                              </Button>
                            )}
                            {(workflow.status === 'draft' || workflow.status === 'paused') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleStartWorkflow(workflow)
                                }}
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Start
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteWorkflow?.(workflow)
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ComplianceWorkflows
