from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlmodel import Session
from pydantic import BaseModel

from app.db_session import get_session
from app.services.scan_rule_set_service import ScanRuleSetService
from app.services.data_source_service import DataSourceService
from app.services.pattern_validation_service import PatternValidationService
from app.api.security import get_current_user, require_permission
from app.api.security.rbac import (
    PERMISSION_SCAN_VIEW, PERMISSION_SCAN_CREATE, 
    PERMISSION_SCAN_EDIT, PERMISSION_SCAN_DELETE
)
import logging

# Setup logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/scan/rule-sets", tags=["scan-rule-sets"])


class ValidationRequest(BaseModel):
    data_source_id: int
    include_patterns: List[str]
    exclude_patterns: List[str]
    scan_level: Optional[str] = "column"


class ValidationResponse(BaseModel):
    total_entities: int
    included_entities: int
    excluded_entities: int
    entity_types: List[Dict[str, Any]]


@router.post("/validate-patterns", response_model=ValidationResponse)
async def validate_patterns(
    validation_request: ValidationRequest = Body(...),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
) -> Dict[str, Any]:
    """Validate scan rule set patterns against a data source.
    
    This endpoint allows users to validate include and exclude patterns
    against a data source to see which entities would be included or excluded
    based on the patterns.
    """
    try:
        # Verify data source exists
        data_source = DataSourceService.get_data_source(session, validation_request.data_source_id)
        if not data_source:
            raise HTTPException(status_code=404, detail="Data source not found")
        
        # Get metadata from data source
        metadata = PatternValidationService.get_metadata(data_source)
        
        # Create a temporary rule set for validation
        temp_rule_set = {
            "include_patterns": validation_request.include_patterns,
            "exclude_patterns": validation_request.exclude_patterns,
            "scan_level": validation_request.scan_level
        }
        
        # Apply patterns to metadata
        result = PatternValidationService.apply_patterns(temp_rule_set, metadata)
        
        # Calculate statistics
        total_entities = result["total_entities"]
        included_entities = result["included_entities"]
        excluded_entities = result["excluded_entities"]
        entity_types = result["entity_types"]
        
        return {
            "total_entities": total_entities,
            "included_entities": included_entities,
            "excluded_entities": excluded_entities,
            "entity_types": entity_types
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error validating patterns: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error validating patterns: {str(e)}")


@router.post("/validate", response_model=ValidationResponse)
async def validate_scan_rule_set(
    validation_request: ValidationRequest = Body(...),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
) -> Dict[str, Any]:
    """Validate scan rule set against a data source.
    
    This is an alias for the validate-patterns endpoint to maintain
    compatibility with both frontend implementations.
    """
    return await validate_patterns(validation_request, session, current_user)