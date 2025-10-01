/**
 * Advanced Classification State Management Hook
 * Enterprise-grade state orchestration for all three classification versions
 * Comprehensive workflow state management with intelligent caching and real-time updates
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { persist, createJSONStorage } from 'zustand/middleware'

// Import the API clients for backend integration
import { 
  ClassificationFrameworkApi, 
  ClassificationRulesApi, 
  BulkOperationsApi, 
  ClassificationResultsApi, 
  AuditTrailApi 
} from '../api/classificationApi'

import {
  ClassificationFramework,
  ClassificationRule,
  ClassificationResult,
  MLModelConfiguration,
  AIModelConfiguration,
  Conversation,
  KnowledgeEntry,
  TrainingJob,
  MLPrediction,
  BulkOperation,
  WorkflowState,
  RealTimeEvent,
  ApiResponse,
  LoadingState,
  ClassificationStatus,
  TrainingStatus,
  ConversationStatus
} from '../types'

// ============================================================================
// ADVANCED STATE INTERFACES
// ============================================================================

interface ClassificationMetrics {
  totalFrameworks: number
  activeFrameworks: number
  totalRules: number
  activeRules: number
  totalClassifications: number
  accuracyRate: number
  complianceScore: number
  lastUpdated: string
}

interface MLIntelligenceMetrics {
  totalModels: number
  trainingModels: number
  productionModels: number
  averageAccuracy: number
  totalPredictions: number
  costOptimization: number
  lastTrainingCompleted: string
}

interface AIIntelligenceMetrics {
  totalAIModels: number
  activeConversations: number
  knowledgeEntries: number
  averageResponseTime: number
  satisfactionScore: number
  tokenEfficiency: number
  lastKnowledgeUpdate: string
}

interface BusinessIntelligence {
  roiMetrics: {
    totalInvestment: number
    costSavings: number
    productivityGains: number
    riskReduction: number
    paybackPeriod: number
  }
  performanceKPIs: {
    systemUptime: number
    averageProcessingTime: number
    errorRate: number
    userSatisfaction: number
    complianceRate: number
  }
  operationalMetrics: {
    dailyClassifications: number
    weeklyTrends: number[]
    monthlyGrowth: number
    resourceUtilization: number
    capacityPlanning: number
  }
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical' | 'maintenance'
  lastChecked: string
  components: {
    api: 'online' | 'offline' | 'degraded'
    database: 'online' | 'offline' | 'degraded'
    cache: 'online' | 'offline' | 'degraded'
    websocket: 'connected' | 'disconnected' | 'reconnecting'
    ml_pipeline: 'running' | 'stopped' | 'error'
    ai_service: 'available' | 'unavailable' | 'limited'
  }
  alerts: SystemAlert[]
  recommendations: SystemRecommendation[]
}

interface SystemAlert {
  id: string
  type: 'info' | 'warning' | 'error' | 'critical'
  title: string
  message: string
  timestamp: string
  acknowledged: boolean
  autoResolve: boolean
  affectedComponents: string[]
  suggestedActions: string[]
}

interface SystemRecommendation {
  id: string
  category: 'performance' | 'cost' | 'security' | 'compliance' | 'user_experience'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  impact: string
  effort: 'low' | 'medium' | 'high'
  estimatedBenefit: string
  implementationSteps: string[]
}

interface UserWorkflowContext {
  currentWorkflow: string | null
  workflowStep: number
  workflowProgress: number
  workflowData: Record<string, any>
  workflowHistory: WorkflowHistoryEntry[]
  pendingActions: PendingAction[]
  userPreferences: UserPreferences
  recentActivity: ActivityEntry[]
}

interface WorkflowHistoryEntry {
  id: string
  workflowId: string
  stepName: string
  timestamp: string
  duration: number
  outcome: 'success' | 'failure' | 'cancelled' | 'skipped'
  data: Record<string, any>
  userActions: string[]
}

interface PendingAction {
  id: string
  type: 'approval' | 'review' | 'configuration' | 'validation' | 'deployment'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate: string
  estimatedTime: number
  requiredRole: string
  metadata: Record<string, any>
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
  notifications: {
    email: boolean
    push: boolean
    inApp: boolean
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
    categories: string[]
  }
  dashboard: {
    layout: 'compact' | 'comfortable' | 'spacious'
    widgets: string[]
    refreshInterval: number
    autoRefresh: boolean
  }
  workflow: {
    autoSave: boolean
    confirmations: boolean
    shortcuts: Record<string, string>
    defaultViews: Record<string, string>
  }
}

interface ActivityEntry {
  id: string
  type: 'create' | 'update' | 'delete' | 'view' | 'approve' | 'execute'
  entityType: string
  entityId: string
  entityName: string
  timestamp: string
  outcome: 'success' | 'failure' | 'pending'
  metadata: Record<string, any>
}

// ============================================================================
// MAIN CLASSIFICATION STATE INTERFACE
// ============================================================================

interface ClassificationState {
  // Version 1: Manual & Rule-Based Classification
  frameworks: ClassificationFramework[]
  rules: ClassificationRule[]
  policies: any[]
  bulkOperations: BulkOperation[]
  classificationResults: ClassificationResult[]
  
  // Version 2: ML-Driven Classification
  mlModels: MLModelConfiguration[]
  trainingJobs: TrainingJob[]
  predictions: MLPrediction[]
  modelVersions: any[]
  experiments: any[]
  
  // Version 3: AI-Intelligent Classification
  aiModels: AIModelConfiguration[]
  conversations: Conversation[]
  knowledgeBase: KnowledgeEntry[]
  promptTemplates: any[]
  reasoningChains: any[]
  
  // Cross-Version Analytics and Intelligence
  metrics: {
    classification: ClassificationMetrics
    mlIntelligence: MLIntelligenceMetrics
    aiIntelligence: AIIntelligenceMetrics
  }
  
  businessIntelligence: BusinessIntelligence
  systemHealth: SystemHealth
  userWorkflowContext: UserWorkflowContext
  
  // Real-Time State Management
  realTimeEvents: RealTimeEvent[]
  activeConnections: Map<string, WebSocket>
  subscriptions: Map<string, Set<string>>
  
  // Loading and Error States
  loadingStates: Map<string, LoadingState>
  errors: Map<string, string>
  
  // Cache Management
  cache: Map<string, { data: any; timestamp: number; ttl: number }>
  cacheHits: number
  cacheMisses: number
  
  // Advanced State Management
  optimisticUpdates: Map<string, any>
  rollbackStack: any[]
  stateSnapshot: any
  lastSyncTimestamp: string
}

// ============================================================================
// ADVANCED STATE ACTIONS
// ============================================================================

interface ClassificationActions {
  // Framework Management
  setFrameworks: (frameworks: ClassificationFramework[]) => void
  addFramework: (framework: ClassificationFramework) => void
  updateFramework: (framework: ClassificationFramework) => void
  deleteFramework: (frameworkId: number) => void
  activateFramework: (frameworkId: number) => void
  deactivateFramework: (frameworkId: number) => void
  
  // Rule Management
  setRules: (rules: ClassificationRule[]) => void
  addRule: (rule: ClassificationRule) => void
  updateRule: (rule: ClassificationRule) => void
  deleteRule: (ruleId: number) => void
  validateRule: (ruleId: number) => Promise<boolean>
  optimizeRule: (ruleId: number) => Promise<void>
  
  // ML Model Management
  setMLModels: (models: MLModelConfiguration[]) => void
  addMLModel: (model: MLModelConfiguration) => void
  updateMLModel: (model: MLModelConfiguration) => void
  deleteMLModel: (modelId: number) => void
  deployMLModel: (modelId: number, environment: string) => Promise<void>
  
  // Training Job Management
  setTrainingJobs: (jobs: TrainingJob[]) => void
  addTrainingJob: (job: TrainingJob) => void
  updateTrainingJob: (job: TrainingJob) => void
  cancelTrainingJob: (jobId: number) => Promise<void>
  monitorTrainingProgress: (jobId: number) => void
  
  // AI Model Management
  setAIModels: (models: AIModelConfiguration[]) => void
  addAIModel: (model: AIModelConfiguration) => void
  updateAIModel: (model: AIModelConfiguration) => void
  deleteAIModel: (modelId: number) => void
  
  // Conversation Management
  setConversations: (conversations: Conversation[]) => void
  addConversation: (conversation: Conversation) => void
  updateConversation: (conversation: Conversation) => void
  archiveConversation: (conversationId: number) => void
  
  // Knowledge Base Management
  setKnowledgeBase: (entries: KnowledgeEntry[]) => void
  addKnowledgeEntry: (entry: KnowledgeEntry) => void
  updateKnowledgeEntry: (entry: KnowledgeEntry) => void
  deleteKnowledgeEntry: (entryId: number) => void
  
  // Bulk Operations
  addBulkOperation: (operation: BulkOperation) => void
  updateBulkOperation: (operation: BulkOperation) => void
  cancelBulkOperation: (operationId: string) => Promise<void>
  
  // Real-Time Event Management
  addRealTimeEvent: (event: RealTimeEvent) => void
  processRealTimeEvent: (event: RealTimeEvent) => void
  clearRealTimeEvents: () => void
  
  // Workflow Management
  startWorkflow: (workflowType: string, initialData?: any) => void
  updateWorkflowStep: (step: number, data?: any) => void
  completeWorkflow: (outcome: any) => void
  cancelWorkflow: () => void
  saveWorkflowProgress: () => void
  restoreWorkflowProgress: () => void
  
  // Cache Management
  getCachedData: (key: string) => any | null
  setCachedData: (key: string, data: any, ttl?: number) => void
  invalidateCache: (pattern?: string) => void
  clearCache: () => void
  
  // Optimistic Updates
  performOptimisticUpdate: (key: string, updateFn: (current: any) => any) => void
  commitOptimisticUpdate: (key: string) => void
  rollbackOptimisticUpdate: (key: string) => void
  rollbackAllOptimisticUpdates: () => void
  
  // State Synchronization
  syncWithServer: () => Promise<void>
  createStateSnapshot: () => void
  restoreStateSnapshot: () => void
  
  // Loading and Error Management
  setLoading: (key: string, state: LoadingState) => void
  setError: (key: string, error: string | null) => void
  clearErrors: () => void
  
  // Metrics and Analytics
  updateMetrics: (metricsType: 'classification' | 'mlIntelligence' | 'aiIntelligence', metrics: any) => void
  updateBusinessIntelligence: (bi: Partial<BusinessIntelligence>) => void
  updateSystemHealth: (health: Partial<SystemHealth>) => void
  
  // User Context Management
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void
  addPendingAction: (action: PendingAction) => void
  completePendingAction: (actionId: string, outcome: any) => void
  addActivityEntry: (entry: ActivityEntry) => void
  
  // Advanced Analytics
  calculateROI: () => Promise<number>
  predictPerformance: (timeframe: string) => Promise<any>
  generateInsights: () => Promise<any[]>
  optimizeResources: () => Promise<any>
}

// ============================================================================
// ZUSTAND STORE IMPLEMENTATION
// ============================================================================

export const useClassificationStore = create<ClassificationState & ClassificationActions>()(
  subscribeWithSelector(
    immer(
      persist(
        (set, get) => ({
          // Initial State
          frameworks: [],
          rules: [],
          policies: [],
          bulkOperations: [],
          classificationResults: [],
          mlModels: [],
          trainingJobs: [],
          predictions: [],
          modelVersions: [],
          experiments: [],
          aiModels: [],
          conversations: [],
          knowledgeBase: [],
          promptTemplates: [],
          reasoningChains: [],
          
          metrics: {
            classification: {
              totalFrameworks: 0,
              activeFrameworks: 0,
              totalRules: 0,
              activeRules: 0,
              totalClassifications: 0,
              accuracyRate: 0,
              complianceScore: 0,
              lastUpdated: new Date().toISOString()
            },
            mlIntelligence: {
              totalModels: 0,
              trainingModels: 0,
              productionModels: 0,
              averageAccuracy: 0,
              totalPredictions: 0,
              costOptimization: 0,
              lastTrainingCompleted: new Date().toISOString()
            },
            aiIntelligence: {
              totalAIModels: 0,
              activeConversations: 0,
              knowledgeEntries: 0,
              averageResponseTime: 0,
              satisfactionScore: 0,
              tokenEfficiency: 0,
              lastKnowledgeUpdate: new Date().toISOString()
            }
          },
          
          businessIntelligence: {
            roiMetrics: {
              totalInvestment: 0,
              costSavings: 0,
              productivityGains: 0,
              riskReduction: 0,
              paybackPeriod: 0
            },
            performanceKPIs: {
              systemUptime: 99.9,
              averageProcessingTime: 250,
              errorRate: 0.02,
              userSatisfaction: 4.7,
              complianceRate: 98.5
            },
            operationalMetrics: {
              dailyClassifications: 0,
              weeklyTrends: [0, 0, 0, 0, 0, 0, 0],
              monthlyGrowth: 0,
              resourceUtilization: 0,
              capacityPlanning: 0
            }
          },
          
          systemHealth: {
            status: 'healthy',
            lastChecked: new Date().toISOString(),
            components: {
              api: 'online',
              database: 'online',
              cache: 'online',
              websocket: 'connected',
              ml_pipeline: 'running',
              ai_service: 'available'
            },
            alerts: [],
            recommendations: []
          },
          
          userWorkflowContext: {
            currentWorkflow: null,
            workflowStep: 0,
            workflowProgress: 0,
            workflowData: {},
            workflowHistory: [],
            pendingActions: [],
            userPreferences: {
              theme: 'auto',
              language: 'en',
              timezone: 'UTC',
              notifications: {
                email: true,
                push: true,
                inApp: true,
                frequency: 'immediate',
                categories: ['critical', 'workflow', 'training']
              },
              dashboard: {
                layout: 'comfortable',
                widgets: ['metrics', 'recent_activity', 'pending_actions'],
                refreshInterval: 30,
                autoRefresh: true
              },
              workflow: {
                autoSave: true,
                confirmations: true,
                shortcuts: {},
                defaultViews: {}
              }
            },
            recentActivity: []
          },
          
          realTimeEvents: [],
          activeConnections: new Map(),
          subscriptions: new Map(),
          loadingStates: new Map(),
          errors: new Map(),
          cache: new Map(),
          cacheHits: 0,
          cacheMisses: 0,
          optimisticUpdates: new Map(),
          rollbackStack: [],
          stateSnapshot: null,
          lastSyncTimestamp: new Date().toISOString(),
          
          // Framework Management Actions
          setFrameworks: (frameworks) => set((state) => {
            state.frameworks = frameworks
            state.metrics.classification.totalFrameworks = frameworks.length
            state.metrics.classification.activeFrameworks = frameworks.filter(f => f.status === ClassificationStatus.ACTIVE).length
            state.metrics.classification.lastUpdated = new Date().toISOString()
          }),
          
          addFramework: (framework) => set((state) => {
            state.frameworks.push(framework)
            state.metrics.classification.totalFrameworks += 1
            if (framework.status === ClassificationStatus.ACTIVE) {
              state.metrics.classification.activeFrameworks += 1
            }
            state.userWorkflowContext.recentActivity.unshift({
              id: `activity_${Date.now()}`,
              type: 'create',
              entityType: 'framework',
              entityId: framework.id.toString(),
              entityName: framework.name,
              timestamp: new Date().toISOString(),
              outcome: 'success',
              metadata: { domain: framework.domain, category: framework.category }
            })
          }),
          
          updateFramework: (framework) => set((state) => {
            const index = state.frameworks.findIndex(f => f.id === framework.id)
            if (index !== -1) {
              const oldFramework = state.frameworks[index]
              state.frameworks[index] = framework
              
              // Update metrics if status changed
              if (oldFramework.status !== framework.status) {
                if (framework.status === ClassificationStatus.ACTIVE) {
                  state.metrics.classification.activeFrameworks += 1
                } else if (oldFramework.status === ClassificationStatus.ACTIVE) {
                  state.metrics.classification.activeFrameworks -= 1
                }
              }
              
              state.userWorkflowContext.recentActivity.unshift({
                id: `activity_${Date.now()}`,
                type: 'update',
                entityType: 'framework',
                entityId: framework.id.toString(),
                entityName: framework.name,
                timestamp: new Date().toISOString(),
                outcome: 'success',
                metadata: { changes: ['status', 'configuration'] }
              })
            }
          }),
          
          deleteFramework: (frameworkId) => set((state) => {
            const index = state.frameworks.findIndex(f => f.id === frameworkId)
            if (index !== -1) {
              const framework = state.frameworks[index]
              state.frameworks.splice(index, 1)
              state.metrics.classification.totalFrameworks -= 1
              if (framework.status === ClassificationStatus.ACTIVE) {
                state.metrics.classification.activeFrameworks -= 1
              }
              
              state.userWorkflowContext.recentActivity.unshift({
                id: `activity_${Date.now()}`,
                type: 'delete',
                entityType: 'framework',
                entityId: frameworkId.toString(),
                entityName: framework.name,
                timestamp: new Date().toISOString(),
                outcome: 'success',
                metadata: { permanent: true }
              })
            }
          }),
          
          activateFramework: (frameworkId) => set((state) => {
            const framework = state.frameworks.find(f => f.id === frameworkId)
            if (framework && framework.status !== ClassificationStatus.ACTIVE) {
              framework.status = ClassificationStatus.ACTIVE
              state.metrics.classification.activeFrameworks += 1
            }
          }),
          
          deactivateFramework: (frameworkId) => set((state) => {
            const framework = state.frameworks.find(f => f.id === frameworkId)
            if (framework && framework.status === ClassificationStatus.ACTIVE) {
              framework.status = ClassificationStatus.INACTIVE
              state.metrics.classification.activeFrameworks -= 1
            }
          }),
          
          // Rule Management Actions
          setRules: (rules) => set((state) => {
            state.rules = rules
            state.metrics.classification.totalRules = rules.length
            state.metrics.classification.activeRules = rules.filter(r => r.is_active).length
          }),
          
          addRule: (rule) => set((state) => {
            state.rules.push(rule)
            state.metrics.classification.totalRules += 1
            if (rule.is_active) {
              state.metrics.classification.activeRules += 1
            }
          }),
          
          updateRule: (rule) => set((state) => {
            const index = state.rules.findIndex(r => r.id === rule.id)
            if (index !== -1) {
              const oldRule = state.rules[index]
              state.rules[index] = rule
              
              if (oldRule.is_active !== rule.is_active) {
                if (rule.is_active) {
                  state.metrics.classification.activeRules += 1
                } else {
                  state.metrics.classification.activeRules -= 1
                }
              }
            }
          }),
          
          deleteRule: (ruleId) => set((state) => {
            const index = state.rules.findIndex(r => r.id === ruleId)
            if (index !== -1) {
              const rule = state.rules[index]
              state.rules.splice(index, 1)
              state.metrics.classification.totalRules -= 1
              if (rule.is_active) {
                state.metrics.classification.activeRules -= 1
              }
            }
          }),
          
          validateRule: async (ruleId) => {
            // Implementation for rule validation
            return true
          },
          
          optimizeRule: async (ruleId) => {
            // Implementation for rule optimization
          },
          
          // ML Model Management Actions
          setMLModels: (models) => set((state) => {
            state.mlModels = models
            state.metrics.mlIntelligence.totalModels = models.length
            state.metrics.mlIntelligence.productionModels = models.filter(m => m.status === 'production').length
          }),
          
          addMLModel: (model) => set((state) => {
            state.mlModels.push(model)
            state.metrics.mlIntelligence.totalModels += 1
          }),
          
          updateMLModel: (model) => set((state) => {
            const index = state.mlModels.findIndex(m => m.id === model.id)
            if (index !== -1) {
              state.mlModels[index] = model
            }
          }),
          
          deleteMLModel: (modelId) => set((state) => {
            const index = state.mlModels.findIndex(m => m.id === modelId)
            if (index !== -1) {
              state.mlModels.splice(index, 1)
              state.metrics.mlIntelligence.totalModels -= 1
            }
          }),
          
          deployMLModel: async (modelId, environment) => {
            // Implementation for model deployment
          },
          
          // Training Job Management
          setTrainingJobs: (jobs) => set((state) => {
            state.trainingJobs = jobs
            state.metrics.mlIntelligence.trainingModels = jobs.filter(j => j.status === TrainingStatus.TRAINING).length
          }),
          
          addTrainingJob: (job) => set((state) => {
            state.trainingJobs.push(job)
            if (job.status === TrainingStatus.TRAINING) {
              state.metrics.mlIntelligence.trainingModels += 1
            }
          }),
          
          updateTrainingJob: (job) => set((state) => {
            const index = state.trainingJobs.findIndex(j => j.id === job.id)
            if (index !== -1) {
              const oldJob = state.trainingJobs[index]
              state.trainingJobs[index] = job
              
              // Update training count
              if (oldJob.status === TrainingStatus.TRAINING && job.status !== TrainingStatus.TRAINING) {
                state.metrics.mlIntelligence.trainingModels -= 1
              } else if (oldJob.status !== TrainingStatus.TRAINING && job.status === TrainingStatus.TRAINING) {
                state.metrics.mlIntelligence.trainingModels += 1
              }
              
              if (job.status === TrainingStatus.COMPLETED) {
                state.metrics.mlIntelligence.lastTrainingCompleted = new Date().toISOString()
              }
            }
          }),
          
          cancelTrainingJob: async (jobId) => {
            // Implementation for canceling training job
          },
          
          monitorTrainingProgress: (jobId) => {
            // Implementation for monitoring training progress
          },
          
          // AI Model Management
          setAIModels: (models) => set((state) => {
            state.aiModels = models
            state.metrics.aiIntelligence.totalAIModels = models.length
          }),
          
          addAIModel: (model) => set((state) => {
            state.aiModels.push(model)
            state.metrics.aiIntelligence.totalAIModels += 1
          }),
          
          updateAIModel: (model) => set((state) => {
            const index = state.aiModels.findIndex(m => m.id === model.id)
            if (index !== -1) {
              state.aiModels[index] = model
            }
          }),
          
          deleteAIModel: (modelId) => set((state) => {
            const index = state.aiModels.findIndex(m => m.id === modelId)
            if (index !== -1) {
              state.aiModels.splice(index, 1)
              state.metrics.aiIntelligence.totalAIModels -= 1
            }
          }),
          
          // Conversation Management
          setConversations: (conversations) => set((state) => {
            state.conversations = conversations
            state.metrics.aiIntelligence.activeConversations = conversations.filter(c => c.status === ConversationStatus.ACTIVE).length
          }),
          
          addConversation: (conversation) => set((state) => {
            state.conversations.push(conversation)
            if (conversation.status === ConversationStatus.ACTIVE) {
              state.metrics.aiIntelligence.activeConversations += 1
            }
          }),
          
          updateConversation: (conversation) => set((state) => {
            const index = state.conversations.findIndex(c => c.id === conversation.id)
            if (index !== -1) {
              const oldConversation = state.conversations[index]
              state.conversations[index] = conversation
              
              if (oldConversation.status === ConversationStatus.ACTIVE && conversation.status !== ConversationStatus.ACTIVE) {
                state.metrics.aiIntelligence.activeConversations -= 1
              } else if (oldConversation.status !== ConversationStatus.ACTIVE && conversation.status === ConversationStatus.ACTIVE) {
                state.metrics.aiIntelligence.activeConversations += 1
              }
            }
          }),
          
          archiveConversation: (conversationId) => set((state) => {
            const conversation = state.conversations.find(c => c.id === conversationId)
            if (conversation && conversation.status === ConversationStatus.ACTIVE) {
              conversation.status = ConversationStatus.COMPLETED
              state.metrics.aiIntelligence.activeConversations -= 1
            }
          }),
          
          // Knowledge Base Management
          setKnowledgeBase: (entries) => set((state) => {
            state.knowledgeBase = entries
            state.metrics.aiIntelligence.knowledgeEntries = entries.length
            state.metrics.aiIntelligence.lastKnowledgeUpdate = new Date().toISOString()
          }),
          
          addKnowledgeEntry: (entry) => set((state) => {
            state.knowledgeBase.push(entry)
            state.metrics.aiIntelligence.knowledgeEntries += 1
            state.metrics.aiIntelligence.lastKnowledgeUpdate = new Date().toISOString()
          }),
          
          updateKnowledgeEntry: (entry) => set((state) => {
            const index = state.knowledgeBase.findIndex(e => e.id === entry.id)
            if (index !== -1) {
              state.knowledgeBase[index] = entry
              state.metrics.aiIntelligence.lastKnowledgeUpdate = new Date().toISOString()
            }
          }),
          
          deleteKnowledgeEntry: (entryId) => set((state) => {
            const index = state.knowledgeBase.findIndex(e => e.id === entryId)
            if (index !== -1) {
              state.knowledgeBase.splice(index, 1)
              state.metrics.aiIntelligence.knowledgeEntries -= 1
            }
          }),
          
          // Bulk Operations
          addBulkOperation: (operation) => set((state) => {
            state.bulkOperations.push(operation)
          }),
          
          updateBulkOperation: (operation) => set((state) => {
            const index = state.bulkOperations.findIndex(o => o.operation_id === operation.operation_id)
            if (index !== -1) {
              state.bulkOperations[index] = operation
            }
          }),
          
          cancelBulkOperation: async (operationId) => {
            // Implementation for canceling bulk operation
          },
          
          // Real-Time Event Management
          addRealTimeEvent: (event) => set((state) => {
            state.realTimeEvents.unshift(event)
            if (state.realTimeEvents.length > 1000) {
              state.realTimeEvents = state.realTimeEvents.slice(0, 1000)
            }
          }),
          
          processRealTimeEvent: (event) => set((state) => {
            // Process different types of real-time events
            switch (event.type) {
              case 'framework_updated':
                const framework = state.frameworks.find(f => f.id === event.data.frameworkId)
                if (framework) {
                  Object.assign(framework, event.data.updates)
                }
                break
              case 'training_progress':
                const job = state.trainingJobs.find(j => j.id === event.data.jobId)
                if (job) {
                  job.progress = event.data.progress
                }
                break
              case 'conversation_message':
                const conversation = state.conversations.find(c => c.id === event.data.conversationId)
                if (conversation) {
                  conversation.messages.push(event.data.message)
                }
                break
            }
          }),
          
          clearRealTimeEvents: () => set((state) => {
            state.realTimeEvents = []
          }),
          
          // Workflow Management
          startWorkflow: (workflowType, initialData) => set((state) => {
            state.userWorkflowContext.currentWorkflow = workflowType
            state.userWorkflowContext.workflowStep = 0
            state.userWorkflowContext.workflowProgress = 0
            state.userWorkflowContext.workflowData = initialData || {}
          }),
          
          updateWorkflowStep: (step, data) => set((state) => {
            state.userWorkflowContext.workflowStep = step
            state.userWorkflowContext.workflowProgress = (step / 10) * 100 // Assuming 10 steps max
            if (data) {
              Object.assign(state.userWorkflowContext.workflowData, data)
            }
          }),
          
          completeWorkflow: (outcome) => set((state) => {
            if (state.userWorkflowContext.currentWorkflow) {
              state.userWorkflowContext.workflowHistory.push({
                id: `workflow_${Date.now()}`,
                workflowId: state.userWorkflowContext.currentWorkflow,
                stepName: 'completed',
                timestamp: new Date().toISOString(),
                duration: 0, // Calculate actual duration
                outcome: 'success',
                data: outcome,
                userActions: []
              })
            }
            
            state.userWorkflowContext.currentWorkflow = null
            state.userWorkflowContext.workflowStep = 0
            state.userWorkflowContext.workflowProgress = 0
            state.userWorkflowContext.workflowData = {}
          }),
          
          cancelWorkflow: () => set((state) => {
            state.userWorkflowContext.currentWorkflow = null
            state.userWorkflowContext.workflowStep = 0
            state.userWorkflowContext.workflowProgress = 0
            state.userWorkflowContext.workflowData = {}
          }),
          
          saveWorkflowProgress: () => set((state) => {
            // Save current workflow state to localStorage or server
          }),
          
          restoreWorkflowProgress: () => set((state) => {
            // Restore workflow state from localStorage or server
          }),
          
          // Cache Management
          getCachedData: (key) => {
            const cached = get().cache.get(key)
            if (cached && Date.now() - cached.timestamp < cached.ttl) {
              set((state) => { state.cacheHits += 1 })
              return cached.data
            }
            set((state) => { state.cacheMisses += 1 })
            return null
          },
          
          setCachedData: (key, data, ttl = 300000) => set((state) => {
            state.cache.set(key, {
              data,
              timestamp: Date.now(),
              ttl
            })
          }),
          
          invalidateCache: (pattern) => set((state) => {
            if (pattern) {
              for (const key of state.cache.keys()) {
                if (key.includes(pattern)) {
                  state.cache.delete(key)
                }
              }
            } else {
              state.cache.clear()
            }
          }),
          
          clearCache: () => set((state) => {
            state.cache.clear()
            state.cacheHits = 0
            state.cacheMisses = 0
          }),
          
          // Optimistic Updates
          performOptimisticUpdate: (key, updateFn) => set((state) => {
            const current = state[key as keyof ClassificationState] as any
            const backup = JSON.parse(JSON.stringify(current))
            state.optimisticUpdates.set(key, backup)
            
            const updated = updateFn(current)
            ;(state as any)[key] = updated
          }),
          
          commitOptimisticUpdate: (key) => set((state) => {
            state.optimisticUpdates.delete(key)
          }),
          
          rollbackOptimisticUpdate: (key) => set((state) => {
            const backup = state.optimisticUpdates.get(key)
            if (backup) {
              ;(state as any)[key] = backup
              state.optimisticUpdates.delete(key)
            }
          }),
          
          rollbackAllOptimisticUpdates: () => set((state) => {
            for (const [key, backup] of state.optimisticUpdates) {
              ;(state as any)[key] = backup
            }
            state.optimisticUpdates.clear()
          }),
          
          // State Synchronization
          syncWithServer: async () => {
            // Implementation for server synchronization
          },
          
          createStateSnapshot: () => set((state) => {
            state.stateSnapshot = JSON.parse(JSON.stringify(state))
          }),
          
          restoreStateSnapshot: () => set((state) => {
            if (state.stateSnapshot) {
              Object.assign(state, state.stateSnapshot)
            }
          }),
          
          // Loading and Error Management
          setLoading: (key, loadingState) => set((state) => {
            state.loadingStates.set(key, loadingState)
          }),
          
          setError: (key, error) => set((state) => {
            if (error) {
              state.errors.set(key, error)
            } else {
              state.errors.delete(key)
            }
          }),
          
          clearErrors: () => set((state) => {
            state.errors.clear()
          }),
          
          // Metrics and Analytics
          updateMetrics: (metricsType, metrics) => set((state) => {
            state.metrics[metricsType] = { ...state.metrics[metricsType], ...metrics }
          }),
          
          updateBusinessIntelligence: (bi) => set((state) => {
            state.businessIntelligence = { ...state.businessIntelligence, ...bi }
          }),
          
          updateSystemHealth: (health) => set((state) => {
            state.systemHealth = { ...state.systemHealth, ...health }
          }),
          
          // User Context Management
          updateUserPreferences: (preferences) => set((state) => {
            state.userWorkflowContext.userPreferences = {
              ...state.userWorkflowContext.userPreferences,
              ...preferences
            }
          }),
          
          addPendingAction: (action) => set((state) => {
            state.userWorkflowContext.pendingActions.push(action)
          }),
          
          completePendingAction: (actionId, outcome) => set((state) => {
            const index = state.userWorkflowContext.pendingActions.findIndex(a => a.id === actionId)
            if (index !== -1) {
              state.userWorkflowContext.pendingActions.splice(index, 1)
            }
          }),
          
          addActivityEntry: (entry) => set((state) => {
            state.userWorkflowContext.recentActivity.unshift(entry)
            if (state.userWorkflowContext.recentActivity.length > 100) {
              state.userWorkflowContext.recentActivity = state.userWorkflowContext.recentActivity.slice(0, 100)
            }
          }),
          
          // Advanced Analytics
          calculateROI: async () => {
            // Implementation for ROI calculation
            return 0
          },
          
          predictPerformance: async (timeframe) => {
            // Implementation for performance prediction
            return {}
          },
          
          generateInsights: async () => {
            // Implementation for insight generation
            return []
          },
          
          optimizeResources: async () => {
            // Implementation for resource optimization
            return {}
          }
        }),
        {
          name: 'classification-state',
          storage: createJSONStorage(() => localStorage),
          partialize: (state) => ({
            frameworks: state.frameworks,
            rules: state.rules,
            userWorkflowContext: state.userWorkflowContext,
            metrics: state.metrics,
            businessIntelligence: state.businessIntelligence
          })
        }
      )
    )
  )
)

// ============================================================================
// CUSTOM HOOK IMPLEMENTATION
// ============================================================================

export const useClassificationState = () => {
  const store = useClassificationStore()
  
  // Computed values
  const computedValues = useMemo(() => {
    const {
      frameworks,
      rules,
      mlModels,
      aiModels,
      conversations,
      knowledgeBase,
      trainingJobs,
      metrics,
      businessIntelligence,
      systemHealth,
      userWorkflowContext
    } = store
    
    return {
      // Quick access metrics
      totalEntities: frameworks.length + rules.length + mlModels.length + aiModels.length,
      activeFrameworks: frameworks.filter(f => f.status === ClassificationStatus.ACTIVE),
      recentActivity: userWorkflowContext.recentActivity.slice(0, 10),
      pendingActions: userWorkflowContext.pendingActions,
      
      // Health indicators
      systemHealthScore: calculateSystemHealthScore(systemHealth),
      complianceStatus: metrics.classification.complianceScore >= 95 ? 'compliant' : 'needs_attention',
      
      // Performance indicators
      averageAccuracy: (
        metrics.classification.accuracyRate +
        metrics.mlIntelligence.averageAccuracy +
        metrics.aiIntelligence.satisfactionScore
      ) / 3,
      
      // Business insights
      roiTrend: businessIntelligence.roiMetrics.costSavings > businessIntelligence.roiMetrics.totalInvestment ? 'positive' : 'negative',
      capacityUtilization: businessIntelligence.operationalMetrics.resourceUtilization,
      
      // Workflow state
      hasActiveWorkflow: userWorkflowContext.currentWorkflow !== null,
      workflowProgress: userWorkflowContext.workflowProgress,
      
      // Real-time indicators
      lastUpdateTime: store.lastSyncTimestamp,
      cachePerformance: {
        hitRate: store.cacheHits / (store.cacheHits + store.cacheMisses) || 0,
        totalHits: store.cacheHits,
        totalMisses: store.cacheMisses
      }
    }
  }, [store])
  
  // Advanced hooks for specific functionality
  const useFrameworkManagement = () => ({
    frameworks: store.frameworks,
    addFramework: store.addFramework,
    updateFramework: store.updateFramework,
    deleteFramework: store.deleteFramework,
    activateFramework: store.activateFramework,
    deactivateFramework: store.deactivateFramework
  })
  
  const useMLIntelligence = () => ({
    models: store.mlModels,
    trainingJobs: store.trainingJobs,
    predictions: store.predictions,
    metrics: store.metrics.mlIntelligence,
    addModel: store.addMLModel,
    updateModel: store.updateMLModel,
    deployModel: store.deployMLModel,
    monitorTraining: store.monitorTrainingProgress
  })
  
  const useAIIntelligence = () => ({
    models: store.aiModels,
    conversations: store.conversations,
    knowledgeBase: store.knowledgeBase,
    metrics: store.metrics.aiIntelligence,
    addModel: store.addAIModel,
    updateModel: store.updateAIModel,
    addConversation: store.addConversation,
    updateConversation: store.updateConversation
  })
  
  const useWorkflowManagement = () => ({
    currentWorkflow: store.userWorkflowContext.currentWorkflow,
    workflowStep: store.userWorkflowContext.workflowStep,
    workflowProgress: store.userWorkflowContext.workflowProgress,
    workflowData: store.userWorkflowContext.workflowData,
    workflowHistory: store.userWorkflowContext.workflowHistory,
    startWorkflow: store.startWorkflow,
    updateWorkflowStep: store.updateWorkflowStep,
    completeWorkflow: store.completeWorkflow,
    cancelWorkflow: store.cancelWorkflow
  })
  
  const useBusinessIntelligence = () => ({
    businessIntelligence: store.businessIntelligence,
    systemHealth: store.systemHealth,
    updateBI: store.updateBusinessIntelligence,
    updateHealth: store.updateSystemHealth,
    calculateROI: store.calculateROI,
    predictPerformance: store.predictPerformance,
    generateInsights: store.generateInsights
  })
  
  return {
    // Full state access
    state: store,
    
    // Computed values
    ...computedValues,
    
    // Specialized hooks
    useFrameworkManagement,
    useMLIntelligence,
    useAIIntelligence,
    useWorkflowManagement,
    useBusinessIntelligence,
    
    // Core actions
    actions: {
      setLoading: store.setLoading,
      setError: store.setError,
      clearErrors: store.clearErrors,
      invalidateCache: store.invalidateCache,
      performOptimisticUpdate: store.performOptimisticUpdate,
      commitOptimisticUpdate: store.commitOptimisticUpdate,
      rollbackOptimisticUpdate: store.rollbackOptimisticUpdate,
      syncWithServer: store.syncWithServer,
      addRealTimeEvent: store.addRealTimeEvent,
      processRealTimeEvent: store.processRealTimeEvent
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function calculateSystemHealthScore(health: SystemHealth): number {
  const componentWeights = {
    api: 0.3,
    database: 0.25,
    cache: 0.15,
    websocket: 0.1,
    ml_pipeline: 0.1,
    ai_service: 0.1
  }
  
  let score = 0
  for (const [component, status] of Object.entries(health.components)) {
    const weight = componentWeights[component as keyof typeof componentWeights] || 0
    const componentScore = status === 'online' || status === 'connected' || status === 'running' || status === 'available' ? 1 : 0
    score += componentScore * weight
  }
  
  return Math.round(score * 100)
}

export default useClassificationState