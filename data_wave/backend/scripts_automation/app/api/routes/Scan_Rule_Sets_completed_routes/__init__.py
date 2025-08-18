"""
Scan-Rule-Sets Completed Routes Package

This package contains all the advanced API routes for the scan-rule-sets group,
including rule templates, version control, collaboration, reviews, knowledge base,
and advanced reporting.
"""

# Import all routers for easy access
from .rule_template_routes import router as rule_template_router
from .rule_version_control_routes import router as rule_version_control_router
from .enhanced_collaboration_routes import router as enhanced_collaboration_router
from .rule_reviews_routes import router as rule_reviews_router
from .knowledge_base_routes import router as knowledge_base_router
from .advanced_reporting_routes import router as advanced_reporting_router

__all__ = [
    "rule_template_router",
    "rule_version_control_router", 
    "enhanced_collaboration_router",
    "rule_reviews_router",
    "knowledge_base_router",
    "advanced_reporting_router"
]