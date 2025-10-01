// ============================================================================
// COMPONENT PERMISSIONS MAPPING
// Defines required permissions for each classification component
// ============================================================================

export interface ComponentPermission {
  componentId: string;
  componentName: string;
  requiredPermissions: string[];
  description: string;
  category: 'manual' | 'ml' | 'ai' | 'orchestration' | 'dashboard';
}

export const COMPONENT_PERMISSIONS: Record<string, ComponentPermission> = {
  // Dashboard
  'dashboard': {
    componentId: 'dashboard',
    componentName: 'Classifications Dashboard',
    requiredPermissions: ['classifications.view'],
    description: 'Main dashboard with system overview and metrics',
    category: 'dashboard'
  },

  // V1 - Manual & Rule-Based Components
  'framework-manager': {
    componentId: 'framework-manager',
    componentName: 'Framework Manager',
    requiredPermissions: ['classifications.manage', 'frameworks.manage'],
    description: 'Manage classification frameworks and structures',
    category: 'manual'
  },
  'rule-engine': {
    componentId: 'rule-engine',
    componentName: 'Rule Engine',
    requiredPermissions: ['classifications.manage', 'rules.manage'],
    description: 'Create and manage classification rules',
    category: 'manual'
  },
  'policy-orchestrator': {
    componentId: 'policy-orchestrator',
    componentName: 'Policy Orchestrator',
    requiredPermissions: ['classifications.manage', 'policies.manage'],
    description: 'Orchestrate and manage classification policies',
    category: 'manual'
  },
  'bulk-operation-center': {
    componentId: 'bulk-operation-center',
    componentName: 'Bulk Operation Center',
    requiredPermissions: ['classifications.manage', 'bulk.operations'],
    description: 'Perform bulk classification operations',
    category: 'manual'
  },
  'audit-trail-analyzer': {
    componentId: 'audit-trail-analyzer',
    componentName: 'Audit Trail Analyzer',
    requiredPermissions: ['classifications.view', 'audit.access'],
    description: 'Analyze classification audit trails and logs',
    category: 'manual'
  },
  'compliance-dashboard': {
    componentId: 'compliance-dashboard',
    componentName: 'Compliance Dashboard',
    requiredPermissions: ['classifications.view', 'compliance.access'],
    description: 'Monitor compliance and regulatory requirements',
    category: 'manual'
  },

  // V2 - ML-Driven Components
  'ml-model-orchestrator': {
    componentId: 'ml-model-orchestrator',
    componentName: 'ML Model Orchestrator',
    requiredPermissions: ['classifications.manage', 'ml.models.manage'],
    description: 'Orchestrate and manage ML classification models',
    category: 'ml'
  },
  'training-pipeline-manager': {
    componentId: 'training-pipeline-manager',
    componentName: 'Training Pipeline Manager',
    requiredPermissions: ['classifications.manage', 'ml.training.manage'],
    description: 'Manage ML model training pipelines',
    category: 'ml'
  },
  'adaptive-learning-center': {
    componentId: 'adaptive-learning-center',
    componentName: 'Adaptive Learning Center',
    requiredPermissions: ['classifications.manage', 'ml.learning.manage'],
    description: 'Manage adaptive learning and model improvement',
    category: 'ml'
  },
  'hyperparameter-optimizer': {
    componentId: 'hyperparameter-optimizer',
    componentName: 'Hyperparameter Optimizer',
    requiredPermissions: ['classifications.manage', 'ml.optimization.manage'],
    description: 'Optimize ML model hyperparameters',
    category: 'ml'
  },
  'drift-detection-monitor': {
    componentId: 'drift-detection-monitor',
    componentName: 'Drift Detection Monitor',
    requiredPermissions: ['classifications.view', 'ml.monitoring.access'],
    description: 'Monitor ML model drift and performance',
    category: 'ml'
  },
  'feature-engineering-studio': {
    componentId: 'feature-engineering-studio',
    componentName: 'Feature Engineering Studio',
    requiredPermissions: ['classifications.manage', 'ml.features.manage'],
    description: 'Design and manage feature engineering',
    category: 'ml'
  },
  'model-ensemble-builder': {
    componentId: 'model-ensemble-builder',
    componentName: 'Model Ensemble Builder',
    requiredPermissions: ['classifications.manage', 'ml.ensemble.manage'],
    description: 'Build and manage model ensembles',
    category: 'ml'
  },
  'ml-analytics-dashboard': {
    componentId: 'ml-analytics-dashboard',
    componentName: 'ML Analytics Dashboard',
    requiredPermissions: ['classifications.view', 'ml.analytics.access'],
    description: 'View ML model analytics and performance',
    category: 'ml'
  },

  // V3 - AI-Intelligent Components
  'ai-intelligence-orchestrator': {
    componentId: 'ai-intelligence-orchestrator',
    componentName: 'AI Intelligence Orchestrator',
    requiredPermissions: ['classifications.manage', 'ai.orchestration.manage'],
    description: 'Orchestrate AI-powered classification intelligence',
    category: 'ai'
  },
  'conversation-manager': {
    componentId: 'conversation-manager',
    componentName: 'Conversation Manager',
    requiredPermissions: ['classifications.manage', 'ai.conversations.manage'],
    description: 'Manage AI conversation and interaction flows',
    category: 'ai'
  },
  'explainable-reasoning-viewer': {
    componentId: 'explainable-reasoning-viewer',
    componentName: 'Explainable Reasoning Viewer',
    requiredPermissions: ['classifications.view', 'ai.reasoning.access'],
    description: 'View AI reasoning and decision explanations',
    category: 'ai'
  },
  'auto-tagging-engine': {
    componentId: 'auto-tagging-engine',
    componentName: 'Auto Tagging Engine',
    requiredPermissions: ['classifications.manage', 'ai.tagging.manage'],
    description: 'Manage AI-powered auto-tagging systems',
    category: 'ai'
  },
  'workload-optimizer': {
    componentId: 'workload-optimizer',
    componentName: 'Workload Optimizer',
    requiredPermissions: ['classifications.manage', 'ai.optimization.manage'],
    description: 'Optimize AI workload distribution and performance',
    category: 'ai'
  },
  'real-time-intelligence-stream': {
    componentId: 'real-time-intelligence-stream',
    componentName: 'Real-Time Intelligence Stream',
    requiredPermissions: ['classifications.view', 'ai.realtime.access'],
    description: 'Monitor real-time AI intelligence streams',
    category: 'ai'
  },
  'knowledge-synthesizer': {
    componentId: 'knowledge-synthesizer',
    componentName: 'Knowledge Synthesizer',
    requiredPermissions: ['classifications.manage', 'ai.knowledge.manage'],
    description: 'Synthesize and manage AI knowledge bases',
    category: 'ai'
  },
  'ai-analytics-dashboard': {
    componentId: 'ai-analytics-dashboard',
    componentName: 'AI Analytics Dashboard',
    requiredPermissions: ['classifications.view', 'ai.analytics.access'],
    description: 'View AI system analytics and insights',
    category: 'ai'
  },

  // Orchestration Components
  'classification-workflow': {
    componentId: 'classification-workflow',
    componentName: 'Classification Workflow',
    requiredPermissions: ['classifications.manage', 'workflows.manage'],
    description: 'Manage classification workflow orchestration',
    category: 'orchestration'
  },
  'intelligence-coordinator': {
    componentId: 'intelligence-coordinator',
    componentName: 'Intelligence Coordinator',
    requiredPermissions: ['classifications.manage', 'intelligence.coordinate'],
    description: 'Coordinate cross-system intelligence operations',
    category: 'orchestration'
  },
  'business-intelligence-hub': {
    componentId: 'business-intelligence-hub',
    componentName: 'Business Intelligence Hub',
    requiredPermissions: ['classifications.view', 'business.intelligence.access'],
    description: 'Access business intelligence and reporting',
    category: 'orchestration'
  }
};

// Helper function to get permissions for a component
export const getComponentPermissions = (componentId: string): ComponentPermission | null => {
  return COMPONENT_PERMISSIONS[componentId] || null;
};

// Helper function to check if user has required permissions
export const hasRequiredPermissions = (
  userPermissions: string[], 
  requiredPermissions: string[]
): boolean => {
  // Admin wildcard permission
  if (userPermissions.includes('*') || userPermissions.includes('admin')) {
    return true;
  }
  
  // Check if user has all required permissions
  return requiredPermissions.every(permission => 
    userPermissions.includes(permission)
  );
};

// Get permissions by category
export const getPermissionsByCategory = (category: ComponentPermission['category']): ComponentPermission[] => {
  return Object.values(COMPONENT_PERMISSIONS).filter(perm => perm.category === category);
};

// Default permissions for different user roles
export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  'Administrator': ['*'],
  'Classification Manager': [
    'classifications.manage', 'classifications.view',
    'frameworks.manage', 'rules.manage', 'policies.manage',
    'bulk.operations', 'audit.access', 'compliance.access',
    'dashboard.access'
  ],
  'ML Engineer': [
    'classifications.view', 'classifications.manage',
    'ml.models.manage', 'ml.training.manage', 'ml.learning.manage',
    'ml.optimization.manage', 'ml.monitoring.access', 'ml.features.manage',
    'ml.ensemble.manage', 'ml.analytics.access', 'dashboard.access'
  ],
  'AI Specialist': [
    'classifications.view', 'classifications.manage',
    'ai.orchestration.manage', 'ai.conversations.manage', 'ai.reasoning.access',
    'ai.tagging.manage', 'ai.optimization.manage', 'ai.realtime.access',
    'ai.knowledge.manage', 'ai.analytics.access', 'dashboard.access'
  ],
  'Business Analyst': [
    'classifications.view', 'dashboard.access', 'compliance.access',
    'audit.access', 'ml.analytics.access', 'ai.analytics.access',
    'business.intelligence.access'
  ],
  'Viewer': [
    'classifications.view', 'dashboard.access'
  ]
};
