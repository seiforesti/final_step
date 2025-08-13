"""
Racine Main Manager Models Package
==================================

This package contains all the advanced models for the Racine Main Manager system,
which serves as the ultimate orchestrator for the entire data governance platform.

The Racine models provide:
- Master orchestration across all 7 groups (Data Sources, Scan Rule Sets, Classifications, 
  Compliance Rules, Advanced Catalog, Scan Logic, RBAC System)
- Multi-workspace management with cross-group resource linking
- Databricks-style workflow management with cross-group orchestration
- Advanced pipeline management with AI-driven optimization
- Context-aware AI assistant with cross-group intelligence
- Comprehensive activity tracking and audit trails
- Intelligent dashboard and analytics system
- Master collaboration system with real-time features
- Cross-group integration management

All models are designed for seamless integration with existing backend implementations
while providing enterprise-grade scalability, performance, and security.
"""

# Import all racine models for easy access
from .racine_orchestration_models import (
    RacineOrchestrationMaster,
    RacineWorkflowExecution,
    RacineSystemHealth,
    RacineCrossGroupIntegration,
    RacinePerformanceMetrics,
    RacineResourceAllocation,
    RacineErrorLog,
    RacineIntegrationStatus
)

from .racine_workspace_models import (
    RacineWorkspace,
    RacineWorkspaceMember,
    RacineWorkspaceResource,
    RacineWorkspaceTemplate,
    RacineWorkspaceAnalytics,
    RacineWorkspaceSettings,
    RacineWorkspaceAudit,
    RacineWorkspaceNotification
)

from .racine_workflow_models import (
    RacineJobWorkflow,
    RacineJobExecution,
    RacineWorkflowTemplate,
    RacineWorkflowSchedule,
    RacineWorkflowStep,
    RacineStepExecution,
    RacineWorkflowMetrics,
    RacineWorkflowAudit
)

from .racine_pipeline_models import (
    RacinePipeline,
    RacinePipelineExecution,
    RacinePipelineStage,
    RacineStageExecution,
    RacinePipelineTemplate,
    RacinePipelineOptimization,
    RacinePipelineMetrics,
    RacinePipelineAudit
)

from .racine_ai_models import (
    RacineAIConversation,
    RacineAIMessage,
    RacineAIRecommendation,
    RacineAIInsight,
    RacineAILearning,
    RacineAIKnowledge,
    RacineAIMetrics
)

from .racine_activity_models import (
    RacineActivity,
    RacineActivityLog,
    RacineActivityStream,
    RacineActivityStreamEvent,
    RacineActivityCorrelation,
    RacineActivityAnalytics,
    RacineActivityMetrics,
    RacineActivityAlert,
    RacineActivityAudit
)

from .racine_dashboard_models import (
    RacineDashboard,
    RacineDashboardWidget,
    RacineDashboardLayout,
    RacineDashboardPersonalization,
    RacineDashboardAnalytics,
    RacineDashboardWidgetData,
    RacineDashboardAlert,
    RacineDashboardTemplate,
    RacineDashboardAudit
)

from .racine_collaboration_models import (
    RacineCollaboration,
    RacineCollaborationParticipant,
    RacineCollaborationSession,
    RacineCollaborationMessage,
    RacineCollaborationDocument,
    RacineCollaborationDocumentEdit,
    RacineExpertConsultation,
    RacineKnowledgeSharing,
    RacineCollaborationAnalytics,
    RacineCollaborationAudit
)

from .racine_integration_models import (
    RacineIntegration,
    RacineIntegrationEndpoint,
    RacineDataFlow,
    RacineDataFlowExecution,
    RacineIntegrationMessage,
    RacineIntegrationHealthCheck,
    RacineServiceMesh,
    RacineAPIGateway,
    RacineIntegrationAudit
)

__all__ = [
    # Orchestration Models
    "RacineOrchestrationMaster",
    "RacineWorkflowExecution", 
    "RacineSystemHealth",
    "RacineCrossGroupIntegration",
    "RacinePerformanceMetrics",
    "RacineResourceAllocation",
    "RacineErrorLog",
    "RacineIntegrationStatus",
    
    # Workspace Models
    "RacineWorkspace",
    "RacineWorkspaceMember",
    "RacineWorkspaceResource",
    "RacineWorkspaceTemplate",
    "RacineWorkspaceAnalytics",
    "RacineWorkspaceSettings",
    "RacineWorkspaceAudit",
    "RacineWorkspaceNotification",
    
    # Workflow Models
    "RacineJobWorkflow",
    "RacineJobExecution",
    "RacineWorkflowTemplate",
    "RacineWorkflowSchedule",
    "RacineWorkflowStep",
    "RacineStepExecution",
    "RacineWorkflowMetrics",
    "RacineWorkflowAudit",
    
    # Pipeline Models
    "RacinePipeline",
    "RacinePipelineExecution",
    "RacinePipelineStage",
    "RacineStageExecution",
    "RacinePipelineTemplate",
    "RacinePipelineOptimization",
    "RacinePipelineMetrics",
    "RacinePipelineAudit",
    
    # AI Models
    "RacineAIConversation",
    "RacineAIMessage",
    "RacineAIRecommendation",
    "RacineAIInsight",
    "RacineAILearning",
    "RacineAIKnowledge",
    "RacineAIMetrics",
    
    # Activity Models
    "RacineActivity",
    "RacineActivityLog",
    "RacineActivityStream",
    "RacineActivityStreamEvent",
    "RacineActivityCorrelation",
    "RacineActivityAnalytics",
    "RacineActivityMetrics",
    "RacineActivityAlert",
    "RacineActivityAudit",
    
    # Dashboard Models
    "RacineDashboard",
    "RacineDashboardWidget",
    "RacineDashboardLayout",
    "RacineDashboardPersonalization",
    "RacineDashboardAnalytics",
    "RacineDashboardWidgetData",
    "RacineDashboardAlert",
    "RacineDashboardTemplate",
    "RacineDashboardAudit",
    
    # Collaboration Models
    "RacineCollaboration",
    "RacineCollaborationParticipant",
    "RacineCollaborationSession",
    "RacineCollaborationMessage",
    "RacineCollaborationDocument",
    "RacineCollaborationDocumentEdit",
    "RacineExpertConsultation",
    "RacineKnowledgeSharing",
    "RacineCollaborationAnalytics",
    "RacineCollaborationAudit",
    
    # Integration Models
    "RacineIntegration",
    "RacineIntegrationEndpoint",
    "RacineDataFlow",
    "RacineDataFlowExecution",
    "RacineIntegrationMessage",
    "RacineIntegrationHealthCheck",
    "RacineServiceMesh",
    "RacineAPIGateway",
    "RacineIntegrationAudit"
]