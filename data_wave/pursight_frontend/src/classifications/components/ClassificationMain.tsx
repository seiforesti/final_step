import React, { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';
import ClassificationDashboard from './ClassificationDashboard';
import AccessControlGate from './AccessControlGate';
import { getComponentPermissions, DEFAULT_ROLE_PERMISSIONS } from '../core/permissions/componentPermissions';

// Lazy load version-specific components
const FrameworkManager = React.lazy(() => import('../v1-manual/FrameworkManager'));
const RuleEngine = React.lazy(() => import('../v1-manual/RuleEngine').then(module => ({ default: module as any })));
const PolicyOrchestrator = React.lazy(() => import('../v1-manual/PolicyOrchestrator').then(module => ({ default: module as any })));
const BulkOperationCenter = React.lazy(() => import('../v1-manual/BulkOperationCenter'));
const AuditTrailAnalyzer = React.lazy(() => import('../v1-manual/AuditTrailAnalyzer'));
const ComplianceDashboard = React.lazy(() => import('../v1-manual/ComplianceDashboard'));

const MLModelOrchestrator = React.lazy(() => import('../v2-ml/MLModelOrchestrator'));
const TrainingPipelineManager = React.lazy(() => import('../v2-ml/TrainingPipelineManager'));
const AdaptiveLearningCenter = React.lazy(() => import('../v2-ml/AdaptiveLearningCenter'));
const HyperparameterOptimizer = React.lazy(() => import('../v2-ml/HyperparameterOptimizer'));
const DriftDetectionMonitor = React.lazy(() => import('../v2-ml/DriftDetectionMonitor'));
const FeatureEngineeringStudio = React.lazy(() => import('../v2-ml/FeatureEngineeringStudio'));
const ModelEnsembleBuilder = React.lazy(() => import('../v2-ml/ModelEnsembleBuilder'));
const MLAnalyticsDashboard = React.lazy(() => import('../v2-ml/MLAnalyticsDashboard'));

const AIIntelligenceOrchestrator = React.lazy(() => import('../v3-ai/AIIntelligenceOrchestrator'));
const ConversationManager = React.lazy(() => import('../v3-ai/ConversationManager'));
const ExplainableReasoningViewer = React.lazy(() => import('../v3-ai/ExplainableReasoningViewer'));
const AutoTaggingEngine = React.lazy(() => import('../v3-ai/AutoTaggingEngine'));
const WorkloadOptimizer = React.lazy(() => import('../v3-ai/WorkloadOptimizer'));
const RealTimeIntelligenceStream = React.lazy(() => import('../v3-ai/RealTimeIntelligenceStream'));
const KnowledgeSynthesizer = React.lazy(() => import('../v3-ai/KnowledgeSynthesizer'));
const AIAnalyticsDashboard = React.lazy(() => import('../v3-ai/AIAnalyticsDashboard'));

const ClassificationWorkflow = React.lazy(() => import('../orchestration/ClassificationWorkflow'));
const IntelligenceCoordinator = React.lazy(() => import('../orchestration/IntelligenceCoordinator'));
const BusinessIntelligenceHub = React.lazy(() => import('../orchestration/BusinessIntelligenceHub'));
interface ClassificationMainProps {
  currentComponent: string | null;
  currentVersion: string;
  hasPermission: (permission: string) => boolean;
  userPermissions: string[];
  userRole: string;
  versions: any[];
  systemMetrics: any;
  recentActivities: any[];
  performanceData: any[];
  onVersionSelect: (version: string) => void;
  onViewActivity: (activityId: string) => void;
  className?: string;
}

// Loading component
const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  </div>
);

// Error boundary component
const ErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Component Error</h3>
      <p className="text-muted-foreground mb-4">
        {error.message || 'An unexpected error occurred'}
      </p>
      <Button onClick={() => window.location.reload()}>
        Reload Page
      </Button>
    </div>
  </div>
);

const ClassificationMain: React.FC<ClassificationMainProps> = ({
  currentComponent,
  currentVersion,
  hasPermission,
  userPermissions,
  userRole,
  versions,
  systemMetrics,
  recentActivities,
  performanceData,
  onVersionSelect,
  onViewActivity,
  className = ''
}) => {
  // Helper function to render component with access control
  const renderWithAccessControl = (componentId: string, ComponentToRender: React.ComponentType<any>) => {
    const permissions = getComponentPermissions(componentId);
    
    if (!permissions) {
      return (
        <ErrorFallback 
          error={new Error(`Component permissions not found for: ${componentId}`)} 
        />
      );
    }

    // Get user permissions (fallback to role-based permissions)
    const effectivePermissions = userPermissions.length > 0 
      ? userPermissions 
      : DEFAULT_ROLE_PERMISSIONS[userRole] || [];

    // Debug logging (can be removed in production)
    // console.log('ClassificationMain - renderWithAccessControl');
    // console.log('Component ID:', componentId);
    // console.log('User Role:', userRole);
    // console.log('User Permissions:', userPermissions);
    // console.log('Effective Permissions:', effectivePermissions);
    // console.log('Required Permissions:', permissions.requiredPermissions);

    return (
      <AccessControlGate
        componentId={componentId}
        componentName={permissions.componentName}
        requiredPermissions={permissions.requiredPermissions}
        userPermissions={effectivePermissions}
        onAccessGranted={() => {
          console.log(`Access granted to ${permissions.componentName}`);
        }}
        onAccessDenied={() => {
          console.log(`Access denied to ${permissions.componentName}`);
        }}
      >
        <Suspense fallback={<LoadingSpinner message={`Loading ${permissions.componentName}...`} />}>
          <ComponentToRender />
        </Suspense>
      </AccessControlGate>
    );
  };

  // Component mapping for dynamic rendering
  const componentMap: Record<string, React.ComponentType<any>> = {
    // V1 Manual Components
    'framework-manager': FrameworkManager,
    'rule-engine': RuleEngine,
    'policy-orchestrator': PolicyOrchestrator,
    'bulk-operation-center': BulkOperationCenter,
    'audit-trail-analyzer': AuditTrailAnalyzer,
    'compliance-dashboard': ComplianceDashboard,

    // V2 ML Components
    'ml-model-orchestrator': MLModelOrchestrator,
    'training-pipeline-manager': TrainingPipelineManager,
    'adaptive-learning-center': AdaptiveLearningCenter,
    'hyperparameter-optimizer': HyperparameterOptimizer,
    'drift-detection-monitor': DriftDetectionMonitor,
    'feature-engineering-studio': FeatureEngineeringStudio,
    'model-ensemble-builder': ModelEnsembleBuilder,
    'ml-analytics-dashboard': MLAnalyticsDashboard,

    // V3 AI Components
    'ai-intelligence-orchestrator': AIIntelligenceOrchestrator,
    'conversation-manager': ConversationManager,
    'explainable-reasoning-viewer': ExplainableReasoningViewer,
    'auto-tagging-engine': AutoTaggingEngine,
    'workload-optimizer': WorkloadOptimizer,
    'real-time-intelligence-stream': RealTimeIntelligenceStream,
    'knowledge-synthesizer': KnowledgeSynthesizer,
    'ai-analytics-dashboard': AIAnalyticsDashboard,

    // Orchestration Components
    'classification-workflow': ClassificationWorkflow,
    'intelligence-coordinator': IntelligenceCoordinator,
    'business-intelligence-hub': BusinessIntelligenceHub
  };

  // Remove old permission mapping - now using centralized permission system

  // Render specific component
  const renderComponent = () => {
    if (!currentComponent) {
      // Show dashboard when no specific component is selected - also with access control
      const DashboardComponent = () => (
        <ClassificationDashboard
          versions={versions}
          systemMetrics={systemMetrics}
          recentActivities={recentActivities}
          performanceData={performanceData}
          onVersionSelect={onVersionSelect}
          onViewActivity={onViewActivity}
        />
      );
      return renderWithAccessControl('dashboard', DashboardComponent);
    }

    const Component = componentMap[currentComponent];
    if (!Component) {
      return (
        <Card className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Component Not Found</h3>
            <p className="text-gray-600">The requested component "{currentComponent}" could not be loaded.</p>
          </div>
        </Card>
      );
    }

    // Render component with access control gate
    return renderWithAccessControl(currentComponent, Component);
  };

  return (
    <main className={`flex-1 overflow-auto relative z-20 pointer-events-auto ${className}`}>
      <div className="container mx-auto p-6 relative z-20 pointer-events-auto">
        {renderComponent()}
      </div>
    </main>
  );
};

export default ClassificationMain;
