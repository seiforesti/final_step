"""
Models Package for Enterprise Data Governance Platform
=====================================================

This package contains all the SQLAlchemy/SQLModel models for the enterprise data governance platform.
It includes models for all 7 core groups plus the Racine Main Manager system.

Core Groups:
- Data Sources
- Compliance Rules  
- Classifications
- Scan-Rule-Sets
- Data Catalog
- Scan Logic
- RBAC System

Racine Main Manager:
- Orchestration Models
- Workspace Models
- Workflow Models
- Pipeline Models
- AI Models
- Activity Models
- Dashboard Models
- Collaboration Models
- Integration Models
"""

# Import all model modules to ensure they are registered with SQLAlchemy
from . import (
    # Core Models
    auth_models,
    scan_models,
    compliance_models,
    classification_models,
    catalog_models,
    # scan_orchestration_models,  # Models moved to scan_models.py
    
    # Advanced Models
    advanced_catalog_models,
    advanced_scan_rule_models,
    ai_models,
    analytics_models,
    
    # Extended Models
    compliance_rule_models,
    compliance_extended_models,
    catalog_quality_models,
    catalog_collaboration_models,
    catalog_intelligence_models,
    scan_intelligence_models,
    scan_performance_models,
    scan_workflow_models,
    
    # Supporting Models
    workflow_models,
    task_models,
    version_models,
    tag_models,
    schema_models,
    security_models,
    report_models,
    performance_models,
    integration_models,
    ml_models,
    notification_models,
    email_verification_code,
    data_lineage_models,
    collaboration_models,
    backup_models,
    access_control_models,
    
    # Racine Models
    racine_models,
)

# Import specific models for easy access
from .auth_models import User, Role, Permission
from .scan_models import Scan, ScanResult, DataSource
from .compliance_rule_models import ComplianceRule
from .compliance_models import ComplianceValidation
from .classification_models import ClassificationRule
from .scan_models import DataClassification
from .catalog_models import CatalogItem
from .scan_models import ScanOrchestrationJob, ScanWorkflowExecution

# Import Racine models
from .racine_models import (
    RacineOrchestrationMaster,
    RacineWorkspace,
    RacineJobWorkflow,
    RacinePipeline,
    RacineAIConversation,
    RacineActivity,
    RacineDashboard,
    RacineCollaboration,
    RacineCrossGroupIntegration
)

__all__ = [
    # Core Models
    "User", "Role", "Permission",
    "Scan", "ScanResult", "DataSource",
    "ComplianceRule", "ComplianceValidation",
    "ClassificationRule", "DataClassification",
    "CatalogItem",
    "ScanOrchestrationJob", "ScanWorkflowExecution",
    
    # Racine Models
    "RacineOrchestrationMaster",
    "RacineWorkspace", 
    "RacineJobWorkflow",
    "RacinePipeline",
    "RacineAIConversation",
    "RacineActivity",
    "RacineDashboard",
    "RacineCollaboration",
    "RacineCrossGroupIntegration"
]
