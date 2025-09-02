"""
Racine Routes
============

Comprehensive Racine Main Manager routes for orchestration and workspace management.
This file imports and registers existing Racine routes that are already implemented.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime, timedelta
import json

from app.db_session import get_session
from app.api.security.rbac import get_current_user
from app.models.auth_models import User

# Import existing Racine routes
from app.api.routes.racine_routes.racine_orchestration_routes import router as racine_orchestration_router
from app.api.routes.racine_routes.racine_workspace_routes import router as racine_workspace_router
from app.api.routes.racine_routes.racine_collaboration_routes import router as racine_collaboration_router
from app.api.routes.racine_routes.racine_dashboard_routes import router as racine_dashboard_router
from app.api.routes.racine_routes.racine_activity_routes import router as racine_activity_router
from app.api.routes.racine_routes.racine_ai_routes import router as racine_ai_router
from app.api.routes.racine_routes.racine_integration_routes import router as racine_integration_router
from app.api.routes.racine_routes.racine_pipeline_routes import router as racine_pipeline_router
from app.api.routes.racine_routes.racine_workflow_routes import router as racine_workflow_router

logger = logging.getLogger(__name__)

# =============================================================================
# ROUTER REGISTRATION
# =============================================================================

# Dictionary of available routers for easy registration
available_routers = [
    ("orchestration", racine_orchestration_router),
    ("workspace", racine_workspace_router),
    ("collaboration", racine_collaboration_router),
    ("dashboard", racine_dashboard_router),
    ("activity", racine_activity_router),
    ("ai", racine_ai_router),
    ("integration", racine_integration_router),
    ("pipeline", racine_pipeline_router),
    ("workflow", racine_workflow_router),
]
