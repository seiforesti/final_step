from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlmodel import Session

from app.db_session import get_session
from app.services.custom_scan_rule_service import CustomScanRuleService
from app.api.security import get_current_user, require_permission
from app.api.security.rbac import (
    PERMISSION_CUSTOM_SCAN_RULES_VIEW, PERMISSION_CUSTOM_SCAN_RULES_CREATE,
    PERMISSION_CUSTOM_SCAN_RULES_EDIT, PERMISSION_CUSTOM_SCAN_RULES_DELETE
)
from app.models.scan_models import CustomScanRule, CustomScanRuleCreate, CustomScanRuleUpdate

router = APIRouter(prefix="/custom-scan-rules", tags=["custom-scan-rules"])

@router.post("/", response_model=CustomScanRule)
async def create_custom_scan_rule(
    rule_data: CustomScanRuleCreate = Body(...),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_CUSTOM_SCAN_RULES_CREATE))
) -> CustomScanRule:
    """Create a new custom scan rule."""
    service = CustomScanRuleService(session)
    try:
        return service.create_custom_scan_rule(rule_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[CustomScanRule])
async def get_custom_scan_rules(
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_CUSTOM_SCAN_RULES_VIEW))
) -> List[CustomScanRule]:
    """Get all custom scan rules."""
    service = CustomScanRuleService(session)
    return service.get_custom_scan_rules()

@router.get("/{rule_id}", response_model=CustomScanRule)
async def get_custom_scan_rule(
    rule_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_CUSTOM_SCAN_RULES_VIEW))
) -> CustomScanRule:
    """Get a specific custom scan rule by ID."""
    service = CustomScanRuleService(session)
    rule = service.get_custom_scan_rule(rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Custom scan rule not found")
    return rule

@router.put("/{rule_id}", response_model=CustomScanRule)
async def update_custom_scan_rule(
    rule_id: int,
    rule_data: CustomScanRuleUpdate = Body(...),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_CUSTOM_SCAN_RULES_EDIT))
) -> CustomScanRule:
    """Update a custom scan rule."""
    service = CustomScanRuleService(session)
    try:
        rule = service.update_custom_scan_rule(rule_id, rule_data)
        if not rule:
            raise HTTPException(status_code=404, detail="Custom scan rule not found")
        return rule
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{rule_id}", response_model=Dict[str, bool])
async def delete_custom_scan_rule(
    rule_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_CUSTOM_SCAN_RULES_DELETE))
) -> Dict[str, bool]:
    """Delete a custom scan rule."""
    service = CustomScanRuleService(session)
    success = service.delete_custom_scan_rule(rule_id)
    if not success:
        raise HTTPException(status_code=404, detail="Custom scan rule not found")
    return {"success": True}

@router.post("/validate-expression")
async def validate_expression(
    expression: str = Body(..., embed=True),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_CUSTOM_SCAN_RULES_CREATE))
) -> Dict[str, bool]:
    """Validate a custom scan rule expression."""
    service = CustomScanRuleService(session)
    try:
        service.validate_expression(expression)
        return {"valid": True}
    except ValueError as e:
        return {"valid": False, "error": str(e)}

@router.post("/test-expression")
async def test_expression(
    expression: str = Body(...),
    test_data: Dict[str, Any] = Body(...),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_CUSTOM_SCAN_RULES_CREATE))
) -> Dict[str, Any]:
    """Test a custom scan rule expression against sample data."""
    service = CustomScanRuleService(session)
    try:
        result = service.test_expression(expression, test_data)
        return {"result": result, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")