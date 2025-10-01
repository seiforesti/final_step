import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { 
  Settings, Brain, Zap, Workflow, Building, Package, Search, CheckCircle,
  Network, GitBranch, TrendingUp, Target, AlertTriangle, Boxes, MessageSquare,
  Eye, Tag, Cpu, Activity, Lightbulb, PieChart, Plus, Upload, Download, Play, Calendar
} from 'lucide-react';

// Import optimized components
import {
  ClassificationHeader,
  ClassificationSidebar,
  ClassificationMain,
  ClassificationCommandPalette,
  ClassificationNotifications,
  ClassificationSettings,
  ClassificationAuth
} from './components';

// Import hooks and utilities
import { useClassificationState } from './core/hooks/useClassificationState';
import { useMLIntelligence } from './core/hooks/useMLIntelligence';
import { useAIIntelligence } from './core/hooks/useAIIntelligence';
import { useRealTimeMonitoring } from './core/hooks/useRealTimeMonitoring';
import { useClassificationWorkflowOrchestrator } from './core/hooks/useClassificationWorkflowOrchestrator';
import { useClassificationsRBAC } from './core/hooks/useClassificationsRBAC.tsx';

// Import types
import type { 
  ClassificationVersion, 
  QuickAction, 
  SystemService, 
  UserPreferences, 
  AuthState,
  SystemMetrics,
  RecentActivity
} from './components/types';

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

const CLASSIFICATION_VERSIONS: ClassificationVersion[] = [
  {
    id: 'v1-manual',
    name: 'Manual & Rule-Based',
    description: 'Traditional classification with manual rules and policies',
    icon: Settings,
    color: 'blue',
    components: [
      { id: 'framework-manager', name: 'Framework Manager', icon: Building },
      { id: 'rule-engine', name: 'Rule Engine', icon: Zap },
      { id: 'policy-orchestrator', name: 'Policy Orchestrator', icon: Settings },
      { id: 'bulk-operation-center', name: 'Bulk Operation Center', icon: Package },
      { id: 'audit-trail-analyzer', name: 'Audit Trail Analyzer', icon: Search },
      { id: 'compliance-dashboard', name: 'Compliance Dashboard', icon: CheckCircle }
    ],
    stats: {
      total: 1250,
      active: 45,
      accuracy: 94,
      performance: 87
    }
  },
  {
    id: 'v2-ml',
    name: 'ML-Driven',
    description: 'Machine learning powered classification and analysis',
    icon: Brain,
    color: 'green',
    components: [
      { id: 'ml-model-orchestrator', name: 'ML Model Orchestrator', icon: Network },
      { id: 'training-pipeline-manager', name: 'Training Pipeline Manager', icon: GitBranch },
      { id: 'adaptive-learning-center', name: 'Adaptive Learning Center', icon: TrendingUp },
      { id: 'hyperparameter-optimizer', name: 'Hyperparameter Optimizer', icon: Target },
      { id: 'drift-detection-monitor', name: 'Drift Detection Monitor', icon: AlertTriangle },
      { id: 'feature-engineering-studio', name: 'Feature Engineering Studio', icon: Settings },
      { id: 'model-ensemble-builder', name: 'Model Ensemble Builder', icon: Boxes },
      { id: 'ml-analytics-dashboard', name: 'ML Analytics Dashboard', icon: Activity }
    ],
    stats: {
      total: 890,
      active: 32,
      accuracy: 97,
      performance: 92
    }
  },
  {
    id: 'v3-ai',
    name: 'AI-Intelligent',
    description: 'Advanced AI with cognitive processing and reasoning',
    icon: Zap,
    color: 'purple',
    components: [
      { id: 'ai-intelligence-orchestrator', name: 'AI Intelligence Orchestrator', icon: Brain },
      { id: 'conversation-manager', name: 'Conversation Manager', icon: MessageSquare },
      { id: 'explainable-reasoning-viewer', name: 'Explainable Reasoning Viewer', icon: Eye },
      { id: 'auto-tagging-engine', name: 'Auto Tagging Engine', icon: Tag },
      { id: 'workload-optimizer', name: 'Workload Optimizer', icon: Cpu },
      { id: 'real-time-intelligence-stream', name: 'Real-Time Intelligence Stream', icon: Activity },
      { id: 'knowledge-synthesizer', name: 'Knowledge Synthesizer', icon: Lightbulb },
      { id: 'ai-analytics-dashboard', name: 'AI Analytics Dashboard', icon: PieChart }
    ],
    stats: {
      total: 567,
      active: 28,
      accuracy: 98,
      performance: 95
    }
  },
  {
    id: 'orchestration',
    name: 'Orchestration',
    description: 'Cross-version coordination and business intelligence',
    icon: Workflow,
    color: 'orange',
    components: [
      { id: 'classification-workflow', name: 'Classification Workflow', icon: GitBranch },
      { id: 'intelligence-coordinator', name: 'Intelligence Coordinator', icon: Network },
      { id: 'business-intelligence-hub', name: 'Business Intelligence Hub', icon: Activity }
    ],
    stats: {
      total: 234,
      active: 15,
      accuracy: 96,
      performance: 89
    }
  }
];

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'new-classification', name: 'New Classification', icon: Plus, shortcut: 'Ctrl+N', category: 'action' },
  { id: 'import-data', name: 'Import Data', icon: Upload, shortcut: 'Ctrl+I', category: 'action' },
  { id: 'export-results', name: 'Export Results', icon: Download, shortcut: 'Ctrl+E', category: 'action' },
  { id: 'run-analysis', name: 'Run Analysis', icon: Play, shortcut: 'Ctrl+R', category: 'action' },
  { id: 'schedule-task', name: 'Schedule Task', icon: Calendar, shortcut: 'Ctrl+S', category: 'action' }
];

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'auto',
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  notifications: {
    email: true,
    push: true,
    desktop: true,
    sound: false
  },
  dashboard: {
    refreshInterval: 30,
    defaultView: 'dashboard',
    showMetrics: true,
    compactMode: false
  },
  performance: {
    animationsEnabled: true,
    autoRefresh: true,
    cacheEnabled: true,
    maxConcurrentRequests: 5
  },
  security: {
    sessionTimeout: 120,
    requireMFA: false,
    auditLogging: true
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface ClassificationsSPAProps {
  initialView?: string;
  embedded?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  developmentMode?: boolean;
}

const ClassificationsSPA: React.FC<ClassificationsSPAProps> = ({
  initialView = 'dashboard',
  embedded = false,
  theme = 'auto',
  developmentMode = false
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [currentVersion, setCurrentVersion] = useState('dashboard');
  const [currentComponent, setCurrentComponent] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isDirty, setIsDirty] = useState(false);
  const [localNotifications, setLocalNotifications] = useState<any[]>([]);

  // ============================================================================
  // HOOKS INTEGRATION
  // ============================================================================
  
  // RBAC Integration with error handling
  const rbac = (() => {
    try {
      return useClassificationsRBAC();
    } catch (error) {
      console.warn('RBAC hook not available, using fallback:', error);
      return {
        isAuthenticated: developmentMode || true,
        isLoading: false,
        error: null,
        user: {
          name: 'Development User',
          email: 'dev@datawave.com',
          role: 'Administrator',
          permissions: ['*'] // Give full admin access
        },
        hasPermission: () => true
      };
    }
  })();

  // Hook integrations with fallbacks
  const classificationState = (() => {
    try {
      const state = useClassificationState();
      return {
        classifications: (state as any).classifications || [],
        frameworks: (state as any).frameworks || [],
        rules: (state as any).rules || [],
        isLoading: (state as any).isLoading || false,
        error: (state as any).error || null,
        refreshData: (state as any).refreshData || (async () => {})
      };
    } catch (error) {
      console.warn('Classification state hook not available, using fallback:', error);
      return {
        classifications: [],
        frameworks: [],
        rules: [],
        isLoading: false,
        error: null,
        refreshData: async () => {}
      };
    }
  })();
  
  const {
    classifications,
    frameworks,
    rules,
    isLoading: classificationsLoading,
    error: classificationsError,
    refreshData
  } = classificationState;

  const mlState = (() => {
    try {
      const state = useMLIntelligence();
      return {
        models: state.models || [],
        predictions: state.predictions || [],
        isLoading: (state as any).isLoading || (state as any).loading || false,
        error: (state as any).error || (state as any).errors || null
      };
    } catch (error) {
      console.warn('ML Intelligence hook not available, using fallback:', error);
      return {
        models: [],
        predictions: [],
        isLoading: false,
        error: null
      };
    }
  })();
  
  const {
    models,
    predictions,
    isLoading: mlLoading,
    error: mlError
  } = mlState;

  const aiState = (() => {
    try {
      const state = useAIIntelligence();
      return {
        conversations: state.conversations || [],
        knowledge: (state as any).knowledge || [],
        isLoading: (state as any).isLoading || (state as any).loading || false,
        error: (state as any).error || (state as any).errors || null
      };
    } catch (error) {
      console.warn('AI Intelligence hook not available, using fallback:', error);
      return {
        conversations: [],
        knowledge: [],
        isLoading: false,
        error: null
      };
    }
  })();
  
  const {
    conversations,
    knowledge,
    isLoading: aiLoading,
    error: aiError
  } = aiState;

  const monitoringState = (() => {
    try {
      const state = useRealTimeMonitoring();
      return {
        systemMetrics: (state as any).systemMetrics || null,
        notifications: (state as any).notifications || [],
        isLoading: (state as any).isLoading || false
      };
    } catch (error) {
      console.warn('Real-time monitoring hook not available, using fallback:', error);
      return {
        systemMetrics: null,
        notifications: [],
        isLoading: false
      };
    }
  })();
  
  const {
    systemMetrics,
    notifications,
    isLoading: monitoringLoading
  } = monitoringState;

  const workflowState = (() => {
    try {
      const state = useClassificationWorkflowOrchestrator();
      return {
        workflows: (state as any).workflows || [],
        isLoading: (state as any).isLoading || false
      };
    } catch (error) {
      console.warn('Workflow orchestrator hook not available, using fallback:', error);
      return {
        workflows: [],
        isLoading: false
      };
    }
  })();
  
  const {
    workflows,
    isLoading: workflowLoading
  } = workflowState;

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  const isLoading = classificationsLoading || mlLoading || aiLoading || monitoringLoading || workflowLoading;

  // Mock system services for demo
  const systemServices: SystemService[] = useMemo(() => [
    { id: 'api', name: 'API Gateway', status: 'healthy', uptime: 99.9 },
    { id: 'db', name: 'Database', status: 'healthy', uptime: 99.8 },
    { id: 'ml', name: 'ML Engine', status: 'warning', uptime: 98.5 },
    { id: 'ai', name: 'AI Service', status: 'healthy', uptime: 99.7 }
  ], []);

  // Mock performance data
  const performanceData = useMemo(() => [
    { date: '2024-01', accuracy: 94, speed: 87 },
    { date: '2024-02', accuracy: 95, speed: 89 },
    { date: '2024-03', accuracy: 97, speed: 92 },
    { date: '2024-04', accuracy: 96, speed: 90 },
    { date: '2024-05', accuracy: 98, speed: 95 }
  ], []);

  // Mock recent activities
  const recentActivities: RecentActivity[] = useMemo(() => [
    {
      id: '1',
      type: 'classification',
      title: 'New classification completed',
      description: 'Document batch #1234 processed successfully',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      status: 'success'
    },
    {
      id: '2',
      type: 'training',
      title: 'ML model training started',
      description: 'Training new sentiment analysis model',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      status: 'pending'
    },
    {
      id: '3',
      type: 'deployment',
      title: 'Model deployment failed',
      description: 'Version 2.1.3 deployment encountered errors',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      status: 'error'
    }
  ], []);

  // Mock auth state
  const authState: AuthState = useMemo(() => {
    const rbacUser = (rbac as any).currentUser || (rbac as any).user;
    return {
      isAuthenticated: developmentMode || rbac.isAuthenticated,
      isLoading: rbac.isLoading,
      error: rbac.error,
      user: rbacUser && typeof rbacUser === 'object' ? {
        name: rbacUser.name || 'John Doe',
        email: rbacUser.email || 'john.doe@datawave.com',
        role: rbacUser.role || 'Administrator',
        permissions: rbacUser.permissions || ['*']
      } : {
        name: 'John Doe',
        email: 'john.doe@datawave.com',
        role: 'Administrator',
        permissions: ['*'] // Full admin access
      }
    };
  }, [rbac, developmentMode]);

  // Mock system metrics
  const mockSystemMetrics: SystemMetrics = useMemo(() => ({
    totalClassifications: 2941,
    activeFrameworks: 120,
    averageAccuracy: 96.2,
    systemHealth: 'healthy',
    processingSpeed: 245,
    costEfficiency: 87
  }), []);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleVersionChange = useCallback((versionId: string) => {
    setCurrentVersion(versionId);
    setCurrentComponent(null);
  }, []);

  const handleComponentSelect = useCallback((componentId: string) => {
    setCurrentComponent(componentId);
  }, []);

  // ============================================================================
  // QUICK ACTION HANDLERS - Advanced Enterprise Logic
  // ============================================================================

  const handleNewClassification = useCallback(async () => {
    try {
      console.log('Starting new classification workflow...');
      
      // Simulate intelligent workflow selection
      const workflowConfig = {
        type: 'hybrid',
        frameworks: ['document-classification', 'image-recognition'],
        rules: ['data-privacy', 'quality-control'],
        dataSource: 'user-input',
        outputFormat: 'json',
        realTimeProcessing: true,
        qualityThreshold: 0.8,
        parallelProcessing: true,
        auditEnabled: true
      };

      // Simulate workflow execution
      const executionId = `workflow_${Date.now()}`;
      
      setLocalNotifications(prev => [...prev, {
        id: `workflow_${Date.now()}`,
        type: 'success',
        title: 'Classification Workflow Started',
        message: `New classification workflow ${executionId} has been initiated`,
        timestamp: new Date().toISOString(),
        read: false,
        actionable: true,
        actions: [{
          label: 'View Progress',
          action: () => console.log('View workflow progress'),
          variant: 'default'
        }]
      }]);

      // Navigate to workflow view
      setCurrentVersion('orchestration');
      setCurrentComponent('classification-workflow');
      
    } catch (error) {
      console.error('Failed to start new classification:', error);
      throw error;
    }
  }, []);

  const handleDataImport = useCallback(async () => {
    try {
      console.log('Starting data import...');
      
      // Create file input dialog
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.multiple = true;
      fileInput.accept = '.csv,.json,.xlsx,.pdf,.txt';
      
      fileInput.onchange = async (event: any) => {
        const files = Array.from(event.target.files || []);
        
        for (const file of files) {
          const fileObj = file as File;
          console.log('Importing file:', fileObj.name);
          
          // Simulate import processing
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          setLocalNotifications(prev => [...prev, {
            id: `import_${Date.now()}`,
            type: 'success',
            title: 'Data Import Successful',
            message: `Successfully imported ${fileObj.name}`,
            timestamp: new Date().toISOString(),
            read: false,
            actionable: false,
            actions: []
          }]);
        }
      };
      
      fileInput.click();
      
    } catch (error) {
      console.error('Data import failed:', error);
      throw error;
    }
  }, []);

  const handleExportResults = useCallback(async () => {
    try {
      console.log('Starting data export...');
      
      // Simulate export processing
      const exportData = {
        format: 'json',
        includeMetadata: true,
        includeAuditTrail: true,
        compression: true,
        encryption: false
      };
      
      // Create mock export data
      const mockData = {
        classifications: classifications || [],
        frameworks: frameworks || [],
        rules: rules || [],
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };
      
      // Create download
      const blob = new Blob([JSON.stringify(mockData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `classifications_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setLocalNotifications(prev => [...prev, {
        id: `export_${Date.now()}`,
        type: 'success',
        title: 'Export Completed',
        message: 'Results exported successfully',
        timestamp: new Date().toISOString(),
        read: false,
        actionable: false,
        actions: []
      }]);
      
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }, [classifications, frameworks, rules]);

  const handleRunAnalysis = useCallback(async () => {
    try {
      console.log('Starting multi-version analysis...');
      
      // Simulate analysis configuration
      const analysisConfig = {
        v1Config: {
          type: 'manual',
          frameworks: frameworks || [],
          rules: rules || [],
          dataSource: 'current-dataset',
          outputFormat: 'json',
          realTimeProcessing: true,
          qualityThreshold: 0.85,
          parallelProcessing: true,
          auditEnabled: true
        },
        v2Config: {
          modelIds: models || [],
          trainingData: 'current-dataset',
          validationSplit: 0.2,
          hyperparameterOptimization: true,
          ensembleMethod: 'voting',
          driftDetection: true,
          autoRetraining: false,
          performanceThreshold: 0.9
        },
        v3Config: {
          conversationContext: 'classification-analysis',
          reasoningDepth: 'deep',
          explainabilityLevel: 'detailed',
          knowledgeSources: knowledge || [],
          realTimeInference: true,
          confidenceThreshold: 0.8,
          multiAgentCoordination: true
        },
        orchestrationStrategy: 'adaptive',
        consensusAlgorithm: 'confidence-based',
        qualityAssurance: true
      };
      
      // Simulate analysis execution
      const executionId = `analysis_${Date.now()}`;
      
      setLocalNotifications(prev => [...prev, {
        id: `analysis_${Date.now()}`,
        type: 'info',
        title: 'Analysis Started',
        message: `Multi-version analysis ${executionId} is running`,
        timestamp: new Date().toISOString(),
        read: false,
        actionable: true,
        actions: [{
          label: 'View Results',
          action: () => console.log('View analysis results'),
          variant: 'default'
        }]
      }]);
      
      // Navigate to analysis view
      setCurrentVersion('orchestration');
      setCurrentComponent('business-intelligence-hub');
      
    } catch (error) {
      console.error('Analysis failed:', error);
      throw error;
    }
  }, [frameworks, rules, models, knowledge]);

  const handleScheduleTask = useCallback(async () => {
    try {
      console.log('Starting task scheduling...');
      
      // Simulate resource optimization
      const resourceOptimization = {
        currentAllocation: {
          cpu: { allocated: 60, utilized: 45, reserved: 15, cost: 100 },
          memory: { allocated: 80, utilized: 60, reserved: 20, cost: 80 },
          storage: { allocated: 100, utilized: 70, reserved: 30, cost: 50 },
          network: { allocated: 40, utilized: 30, reserved: 10, cost: 30 }
        },
        recommendedAllocation: {
          cpu: { allocated: 70, utilized: 45, reserved: 25, cost: 120 },
          memory: { allocated: 90, utilized: 60, reserved: 30, cost: 90 },
          storage: { allocated: 110, utilized: 70, reserved: 40, cost: 55 },
          network: { allocated: 50, utilized: 30, reserved: 20, cost: 35 }
        },
        potentialSavings: 15,
        performanceImpact: 5
      };
      
      const taskConfig = {
        type: 'scheduled-classification',
        schedule: {
          frequency: 'daily',
          time: '02:00',
          timezone: 'UTC',
          nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        resourceAllocation: resourceOptimization.recommendedAllocation,
        autoScaling: true,
        priorityBasedExecution: true,
        failoverStrategy: 'retry-with-backoff'
      };
      
      setLocalNotifications(prev => [...prev, {
        id: `schedule_${Date.now()}`,
        type: 'info',
        title: 'Task Scheduled',
        message: `Task scheduled for optimal execution at ${taskConfig.schedule.nextRun}`,
        timestamp: new Date().toISOString(),
        read: false,
        actionable: true,
        actions: [{
          label: 'View Schedule',
          action: () => console.log('View task schedule'),
          variant: 'default'
        }]
      }]);
      
    } catch (error) {
      console.error('Task scheduling failed:', error);
      throw error;
    }
  }, []);

  const handleQuickAction = useCallback(async (actionId: string) => {
    console.log('Quick action:', actionId);
    
    try {
      switch (actionId) {
        case 'new-classification':
          await handleNewClassification();
          break;
        case 'import-data':
          await handleDataImport();
          break;
        case 'export-results':
          await handleExportResults();
          break;
        case 'run-analysis':
          await handleRunAnalysis();
          break;
        case 'schedule-task':
          await handleScheduleTask();
          break;
        default:
          console.warn('Unknown quick action:', actionId);
      }
    } catch (error) {
      console.error('Quick action failed:', error);
      // Show error notification
      setLocalNotifications(prev => [...prev, {
        id: `error_${Date.now()}`,
        type: 'error',
        title: 'Action Failed',
        message: `Failed to execute ${actionId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
        read: false,
        actionable: false,
        actions: []
      }]);
    }
  }, [handleNewClassification, handleDataImport, handleExportResults, handleRunAnalysis, handleScheduleTask]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (query.trim()) {
      // Mock search results
      setSearchResults({
        query,
        totalResults: 42,
        categories: {
          frameworks: [
            { name: 'Document Classification', description: 'PDF and document processing' },
            { name: 'Image Recognition', description: 'Computer vision models' }
          ],
          models: [
            { name: 'Sentiment Analysis v2.1', description: 'Latest sentiment model' },
            { name: 'Entity Extraction', description: 'NER model for entities' }
          ],
          workflows: [
            { name: 'Batch Processing', description: 'Large scale document processing' }
          ]
        }
      });
    } else {
      setSearchResults(null);
    }
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults(null);
  }, []);

  const handleRefreshData = useCallback(async () => {
    await refreshData();
  }, [refreshData]);

  const handleLogin = useCallback(() => {
    // Implement login logic
    console.log('Login requested');
  }, []);

  const handleLogout = useCallback(() => {
    // Implement logout logic
    console.log('Logout requested');
  }, []);

  const handleRetry = useCallback(() => {
    // Implement retry logic
    handleRefreshData();
  }, [handleRefreshData]);

  const handleSavePreferences = useCallback((newPreferences: UserPreferences) => {
    setPreferences(newPreferences);
    setIsDirty(false);
    // Save to backend
    console.log('Preferences saved:', newPreferences);
  }, []);

  const handleResetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    setIsDirty(false);
  }, []);

  const handleNotificationAction = useCallback((notificationId: string, action: string) => {
    console.log('Notification action:', notificationId, action);
    // Implement notification actions
  }, []);

  const handleViewActivity = useCallback((activityId: string) => {
    console.log('View activity:', activityId);
    // Navigate to activity details
  }, []);

  // ============================================================================
  // KEYBOARD SHORTCUTS
  // ============================================================================
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            setCommandPaletteOpen(true);
            break;
          case 'n':
            e.preventDefault();
            handleQuickAction('new-classification');
            break;
          case 'r':
            e.preventDefault();
            handleRefreshData();
            break;
          case ',':
            e.preventDefault();
            setSettingsOpen(true);
            break;
        }
      }
      
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setNotificationsOpen(false);
        setSettingsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleQuickAction, handleRefreshData]);

  // ============================================================================
  // ERROR BOUNDARY FALLBACK
  // ============================================================================
  
  const ErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reload Page
        </button>
      </div>
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ClassificationAuth
        authState={authState}
        onLogin={handleLogin}
        onRetry={handleRetry}
        developmentMode={developmentMode}
      >
        <div className="h-screen flex flex-col bg-background relative">
          {/* Header */}
          <ClassificationHeader
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            searchResults={searchResults}
            onClearSearch={handleClearSearch}
            notifications={localNotifications || []}
            onOpenNotifications={() => setNotificationsOpen(true)}
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            onRefreshData={handleRefreshData}
            isLoading={isLoading}
            user={authState.user || { name: 'User', email: 'user@example.com', role: 'User' }}
            onLogout={handleLogout}
          />

          <div className="flex flex-1 overflow-hidden relative z-10">
            {/* Sidebar */}
            <ClassificationSidebar
              isOpen={sidebarOpen}
              isExpanded={sidebarExpanded}
              currentVersion={currentVersion}
              onVersionChange={handleVersionChange}
              onComponentSelect={handleComponentSelect}
              onQuickAction={handleQuickAction}
              onToggleExpanded={() => setSidebarExpanded(!sidebarExpanded)}
              versions={CLASSIFICATION_VERSIONS}
              quickActions={QUICK_ACTIONS}
              systemServices={systemServices}
            />

            {/* Main Content */}
            <ClassificationMain
              currentComponent={currentComponent}
              currentVersion={currentVersion}
              hasPermission={(permission: string) => authState.user?.permissions.includes(permission) || false}
              userPermissions={authState.user?.permissions || []}
              userRole={authState.user?.role || 'Viewer'}
              versions={CLASSIFICATION_VERSIONS}
              systemMetrics={mockSystemMetrics}
              recentActivities={recentActivities}
              performanceData={performanceData}
              onVersionSelect={handleVersionChange}
              onViewActivity={handleViewActivity}
              className={sidebarOpen ? (sidebarExpanded ? 'ml-64' : 'ml-16') : 'ml-0'}
            />
          </div>

          {/* Command Palette */}
          <ClassificationCommandPalette
            isOpen={commandPaletteOpen}
            onClose={() => setCommandPaletteOpen(false)}
            onQuickAction={handleQuickAction}
            onVersionChange={handleVersionChange}
            onComponentSelect={handleComponentSelect}
            quickActions={QUICK_ACTIONS}
            versions={CLASSIFICATION_VERSIONS}
          />

          {/* Notifications Panel */}
          <ClassificationNotifications
            isOpen={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
            notifications={localNotifications || []}
            onMarkAsRead={(id) => handleNotificationAction(id, 'mark-read')}
            onMarkAsUnread={(id) => handleNotificationAction(id, 'mark-unread')}
            onDelete={(id) => handleNotificationAction(id, 'delete')}
            onClearAll={() => handleNotificationAction('all', 'clear')}
            onNavigate={(url) => console.log('Navigate to:', url)}
          />

          {/* Settings Panel */}
          <ClassificationSettings
            isOpen={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            preferences={preferences}
            onSave={handleSavePreferences}
            onReset={handleResetPreferences}
            isDirty={isDirty}
          />
        </div>
      </ClassificationAuth>
    </ErrorBoundary>
  );
};

export default ClassificationsSPA;
