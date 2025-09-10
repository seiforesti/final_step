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

# Lazy import mechanism to avoid circular dependencies while keeping a rich API
import importlib as _importlib
import sys as _sys

_LAZY_MODULES = {
    # Core Services
    'auth_service','data_source_service','compliance_rule_service','classification_service','catalog_service','scan_orchestration_service',
    # Advanced Services
    'enterprise_catalog_service','enterprise_scan_rule_service','enterprise_scan_orchestrator','enterprise_integration_service',
    'ai_service','advanced_ai_service','advanced_ai_tuning_service','advanced_analytics_service','advanced_collaboration_service',
    'advanced_lineage_service','advanced_ml_service','advanced_pattern_matching_service','advanced_scan_scheduler','advanced_workflow_service',
    # Extended Services
    'compliance_service','compliance_rule_init_service','compliance_production_services','catalog_analytics_service','catalog_collaboration_service',
    'catalog_quality_service','catalog_recommendation_service','scan_analytics_service','scan_coordination_service','scan_intelligence_service',
    'scan_optimization_service','scan_performance_service','scan_workflow_engine',
    # Supporting Services
    'access_control_service','analytics_service','backup_service','collaboration_service','comprehensive_analytics_service','custom_scan_rule_service',
    'dashboard_service','data_profiling_service','data_sensitivity_service','distributed_caching_service','edge_computing_service','email_service',
    'email_service_alternative','extraction_service','intelligent_discovery_service','intelligent_pattern_service','intelligent_scan_coordinator',
    'incremental_scan_service','integration_service','lineage_service','ml_service','notification_service','performance_service','purview_uploader',
    'real_time_streaming_service','report_service','resource_service','rbac_service','role_service','rule_marketplace_service','rule_optimization_service',
    'rule_validation_engine','scan_rule_set_service','scan_service','scan_scheduler_service','scheduler','secret_manager','security_service',
    'semantic_search_service','tag_service','task_service','unified_governance_coordinator','unified_scan_manager','unified_scan_orchestrator',
    'version_service',
    # Racine package
    'racine_services',
}

_LAZY_CLASSES = {
    # Commonly imported service classes mapped for direct attribute access
    'AuthService': ('auth_service', 'AuthService'),
    'DataSourceService': ('data_source_service', 'DataSourceService'),
    'ComplianceRuleService': ('compliance_rule_service', 'ComplianceRuleService'),
    'ClassificationService': ('classification_service', 'ClassificationService'),
    'CatalogService': ('catalog_service', 'CatalogService'),
    'ScanOrchestrationService': ('scan_orchestration_service', 'ScanOrchestrationService'),
    # Racine Facades
    'RacineOrchestrationService': ('racine_services.racine_orchestration_service', 'RacineOrchestrationService'),
    'RacineWorkspaceService': ('racine_services.racine_workspace_service', 'RacineWorkspaceService'),
    'RacineWorkflowService': ('racine_services.racine_workflow_service', 'RacineWorkflowService'),
    'RacinePipelineService': ('racine_services.racine_pipeline_service', 'RacinePipelineService'),
    'RacineAIService': ('racine_services.racine_ai_service', 'RacineAIService'),
    'RacineActivityService': ('racine_services.racine_activity_service', 'RacineActivityService'),
    'RacineDashboardService': ('racine_services.racine_dashboard_service', 'RacineDashboardService'),
    'RacineCollaborationService': ('racine_services.racine_collaboration_service', 'RacineCollaborationService'),
    'RacineIntegrationService': ('racine_services.racine_integration_service', 'RacineIntegrationService'),
}

def __getattr__(name):
    if name in _LAZY_MODULES:
        mod = _importlib.import_module(f".{name}", __name__)
        setattr(_sys.modules[__name__], name, mod)
        return mod
    target = _LAZY_CLASSES.get(name)
    if target:
        module_name, class_name = target
        mod = _importlib.import_module(f".{module_name}", __name__)
        obj = getattr(mod, class_name)
        setattr(_sys.modules[__name__], name, obj)
        return obj
    raise AttributeError(f"module '{__name__}' has no attribute '{name}'")

# Public API (lazy-resolved)
AuthService = __getattr__('AuthService')
DataSourceService = __getattr__('DataSourceService')
ComplianceRuleService = __getattr__('ComplianceRuleService')
ClassificationService = __getattr__('ClassificationService')
CatalogService = __getattr__('CatalogService')
ScanOrchestrationService = __getattr__('ScanOrchestrationService')

RacineOrchestrationService = __getattr__('RacineOrchestrationService')
RacineWorkspaceService = __getattr__('RacineWorkspaceService')
RacineWorkflowService = __getattr__('RacineWorkflowService')
RacinePipelineService = __getattr__('RacinePipelineService')
RacineAIService = __getattr__('RacineAIService')
RacineActivityService = __getattr__('RacineActivityService')
RacineDashboardService = __getattr__('RacineDashboardService')
RacineCollaborationService = __getattr__('RacineCollaborationService')
RacineIntegrationService = __getattr__('RacineIntegrationService')

__all__ = [
    # Core Services (lazy)
    "AuthService","DataSourceService","ComplianceRuleService","ClassificationService","CatalogService","ScanOrchestrationService",
    # Racine Services (lazy)
    "RacineOrchestrationService","RacineWorkspaceService","RacineWorkflowService","RacinePipelineService","RacineAIService",
    "RacineActivityService","RacineDashboardService","RacineCollaborationService","RacineIntegrationService"
]

