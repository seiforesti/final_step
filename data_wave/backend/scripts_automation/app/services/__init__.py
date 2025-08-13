"""
Services Package for Enterprise Data Governance Platform
=======================================================

This package contains all the business logic services for the enterprise data governance platform.
It includes services for all 7 core groups plus the Racine Main Manager system.

Core Groups:
- Data Sources
- Compliance Rules  
- Classifications
- Scan-Rule-Sets
- Data Catalog
- Scan Logic
- RBAC System

Racine Main Manager:
- Orchestration Services
- Workspace Services
- Workflow Services
- Pipeline Services
- AI Services
- Activity Services
- Dashboard Services
- Collaboration Services
- Integration Services
"""

# Import all service modules
from . import (
    # Core Services
    auth_service,
    data_source_service,
    compliance_rule_service,
    classification_service,
    catalog_service,
    scan_orchestration_service,
    
    # Advanced Services
    enterprise_catalog_service,
    enterprise_scan_rule_service,
    enterprise_scan_orchestrator,
    enterprise_integration_service,
    ai_service,
    advanced_ai_service,
    advanced_ai_tuning_service,
    advanced_analytics_service,
    advanced_collaboration_service,
    advanced_lineage_service,
    advanced_ml_service,
    advanced_pattern_matching_service,
    advanced_scan_scheduler,
    advanced_workflow_service,
    
    # Extended Services
    compliance_service,
    compliance_rule_init_service,
    compliance_production_services,
    catalog_analytics_service,
    catalog_collaboration_service,
    catalog_quality_service,
    catalog_recommendation_service,
    scan_analytics_service,
    scan_coordination_service,
    scan_intelligence_service,
    scan_optimization_service,
    scan_performance_service,
    scan_workflow_engine,
    
    # Supporting Services
    access_control_service,
    analytics_service,
    backup_service,
    collaboration_service,
    comprehensive_analytics_service,
    custom_scan_rule_service,
    dashboard_service,
    data_profiling_service,
    data_sensitivity_service,
    distributed_caching_service,
    edge_computing_service,
    email_service,
    email_service_alternative,
    extraction_service,
    intelligent_discovery_service,
    intelligent_pattern_service,
    intelligent_scan_coordinator,
    incremental_scan_service,
    integration_service,
    lineage_service,
    ml_service,
    notification_service,
    performance_service,
    purview_uploader,
    real_time_streaming_service,
    report_service,
    resource_service,
    rbac_service,
    role_service,
    rule_marketplace_service,
    rule_optimization_service,
    rule_validation_engine,
    scan_rule_set_service,
    scan_service,
    scan_scheduler_service,
    scheduler,
    secret_manager,
    security_service,
    semantic_search_service,
    tag_service,
    task_service,
    unified_governance_coordinator,
    unified_scan_manager,
    unified_scan_orchestrator,
    version_service,
    
    # Racine Services
    racine_services,
)

# Import specific services for easy access
from .auth_service import AuthService
from .data_source_service import DataSourceService
from .compliance_rule_service import ComplianceRuleService
from .classification_service import ClassificationService
from .catalog_service import CatalogService
from .scan_orchestration_service import ScanOrchestrationService

# Import Racine services
from .racine_services import (
    RacineOrchestrationService,
    RacineWorkspaceService,
    RacineWorkflowService,
    RacinePipelineService,
    RacineAIService,
    RacineActivityService,
    RacineDashboardService,
    RacineCollaborationService,
    RacineIntegrationService
)

__all__ = [
    # Core Services
    "AuthService",
    "DataSourceService", 
    "ComplianceRuleService",
    "ClassificationService",
    "CatalogService",
    "ScanOrchestrationService",
    
    # Racine Services
    "RacineOrchestrationService",
    "RacineWorkspaceService",
    "RacineWorkflowService", 
    "RacinePipelineService",
    "RacineAIService",
    "RacineActivityService",
    "RacineDashboardService",
    "RacineCollaborationService",
    "RacineIntegrationService"
]

