"""
API Routes Package

This package contains all API route definitions organized by domain.
"""

# Core API Routes
from .health_routes import router as health_router
from .auth_routes import router as auth_router

# Data Catalog Routes
from .data_catalog_routes import (
    data_sources_router,
    data_assets_router,
    schemas_router,
    lineage_router
)

# Governance Routes
from .governance_routes import (
    policies_router,
    compliance_router,
    classification_router,
    sensitivity_router
)

# Access Control Routes
from .access_control_routes import (
    users_router,
    roles_router,
    permissions_router
)

# Workflow Routes
from .workflow_routes import (
    workflows_router,
    tasks_router,
    approvals_router
)

# Monitoring Routes
from .monitoring_routes import (
    audit_router,
    metrics_router,
    alerts_router
)

# Integration Routes
from .integration_routes import (
    connectors_router,
    sync_router,
    external_systems_router
)

# Scan and Discovery Routes
from .scan_routes import (
    scans_router,
    discovery_router,
    rules_router
)

# Analytics Routes
from .analytics_routes import (
    analytics_router,
    ml_router,
    insights_router
)

# WebSocket Routes
from .websocket_routes import websocket_router

__all__ = [
    # Core
    "health_router", "auth_router",
    
    # Data Catalog
    "data_sources_router", "data_assets_router", "schemas_router", "lineage_router",
    
    # Governance
    "policies_router", "compliance_router", "classification_router", "sensitivity_router",
    
    # Access Control
    "users_router", "roles_router", "permissions_router",
    
    # Workflow
    "workflows_router", "tasks_router", "approvals_router",
    
    # Monitoring
    "audit_router", "metrics_router", "alerts_router",
    
    # Integration
    "connectors_router", "sync_router", "external_systems_router",
    
    # Scan and Discovery
    "scans_router", "discovery_router", "rules_router",
    
    # Analytics
    "analytics_router", "ml_router", "insights_router",
    
    # WebSocket
    "websocket_router"
]