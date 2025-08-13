#!/usr/bin/env python3
"""
Database migration script for compliance rule tables
Creates all necessary tables and initializes sample data
"""

import sys
import os
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.append(str(backend_dir))

from sqlmodel import SQLModel, create_engine
from app.db_session import get_engine, get_session
from app.models.compliance_rule_models import (
    ComplianceRule, ComplianceRuleTemplate, ComplianceRuleEvaluation,
    ComplianceIssue, ComplianceWorkflow, ComplianceWorkflowExecution
)
from app.services.compliance_rule_init_service import ComplianceRuleInitService
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def create_compliance_rule_tables():
    """Create compliance rule tables"""
    try:
        logger.info("Creating compliance rule tables...")
        
        # Get database engine
        engine = get_engine()
        
        # Create all tables
        SQLModel.metadata.create_all(engine)
        
        logger.info("Compliance rule tables created successfully")
        
        # Initialize sample data
        logger.info("Initializing compliance rule sample data...")
        
        with get_session() as session:
            ComplianceRuleInitService.initialize_compliance_data(session)
        
        logger.info("Compliance rule migration completed successfully")
        
    except Exception as e:
        logger.error(f"Error during compliance rule migration: {str(e)}")
        raise


if __name__ == "__main__":
    create_compliance_rule_tables()