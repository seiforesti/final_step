from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, Query, Path
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field, validator
from datetime import datetime
import json
import csv
import io
import uuid
from enum import Enum

# Import existing database session
from ...db_session import get_session
from ...services.classification_service import EnterpriseClassificationService

# Import models
from ...models.classification_models import (
    ClassificationFramework, ClassificationPolicy, ClassificationRule, ClassificationDictionary,
    ClassificationResult, ClassificationAuditLog, ClassificationTag, ClassificationException,
    ClassificationMetrics, DataSourceClassificationSetting, ScanResultClassification,
    CatalogItemClassification, SensitivityLevel, ClassificationRuleType, ClassificationScope,
    ClassificationStatus, ClassificationConfidenceLevel, ClassificationMethod
)

# Import existing models for integration
from ...models.scan_models import DataSource, Scan, ScanResult
from ...models.catalog_models import CatalogItem
from ...models.compliance_models import ComplianceRule

router = APIRouter(prefix="/api/classifications", tags=["Enterprise Classifications"])

# Initialize classification service
classification_service = EnterpriseClassificationService()

# ==================== PYDANTIC SCHEMAS ====================

class SensitivityLevelEnum(str, Enum):
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"
    TOP_SECRET = "top_secret"
    PII = "pii"
    PHI = "phi"
    PCI = "pci"
    GDPR = "gdpr"
    CCPA = "ccpa"
    HIPAA = "hipaa"
    SOX = "sox"
    FINANCIAL = "financial"
    INTELLECTUAL_PROPERTY = "intellectual_property"
    TRADE_SECRET = "trade_secret"
    CUSTOMER_DATA = "customer_data"
    EMPLOYEE_DATA = "employee_data"
    PARTNER_DATA = "partner_data"

class ClassificationRuleTypeEnum(str, Enum):
    REGEX_PATTERN = "regex_pattern"
    DICTIONARY_LOOKUP = "dictionary_lookup"
    COLUMN_NAME_PATTERN = "column_name_pattern"
    TABLE_NAME_PATTERN = "table_name_pattern"
    DATA_TYPE_PATTERN = "data_type_pattern"
    VALUE_RANGE_PATTERN = "value_range_pattern"
    STATISTICAL_PATTERN = "statistical_pattern"
    METADATA_PATTERN = "metadata_pattern"
    COMPOSITE_PATTERN = "composite_pattern"
    ML_INFERENCE = "ml_inference"
    AI_INFERENCE = "ai_inference"
    CUSTOM_FUNCTION = "custom_function"

class ClassificationScopeEnum(str, Enum):
    GLOBAL = "global"
    DATA_SOURCE = "data_source"
    SCHEMA = "schema"
    TABLE = "table"
    COLUMN = "column"
    CUSTOM = "custom"

# Framework Schemas
class ClassificationFrameworkCreate(BaseModel):
    name: str = Field(..., description="Framework name", min_length=1, max_length=255)
    description: Optional[str] = Field(None, description="Framework description")
    version: str = Field(default="1.0.0", description="Framework version")
    is_default: bool = Field(default=False, description="Whether this is the default framework")
    is_active: bool = Field(default=True, description="Whether this framework is active")
    applies_to_data_sources: bool = Field(default=True)
    applies_to_schemas: bool = Field(default=True)
    applies_to_tables: bool = Field(default=True)
    applies_to_columns: bool = Field(default=True)
    compliance_frameworks: Optional[List[int]] = Field(default=None, description="List of compliance framework IDs")
    regulatory_requirements: Optional[Dict[str, Any]] = Field(default=None)
    owner: Optional[str] = Field(None, description="Framework owner")
    steward: Optional[str] = Field(None, description="Framework steward")
    approval_required: bool = Field(default=True)

class ClassificationFrameworkResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    version: str
    is_default: bool
    is_active: bool
    applies_to_data_sources: bool
    applies_to_schemas: bool
    applies_to_tables: bool
    applies_to_columns: bool
    compliance_frameworks: Optional[List[int]]
    regulatory_requirements: Optional[Dict[str, Any]]
    owner: Optional[str]
    steward: Optional[str]
    approval_required: bool
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str]
    updated_by: Optional[str]

    class Config:
        from_attributes = True

class ClassificationFrameworkUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    version: Optional[str] = None
    is_default: Optional[bool] = None
    is_active: Optional[bool] = None
    applies_to_data_sources: Optional[bool] = None
    applies_to_schemas: Optional[bool] = None
    applies_to_tables: Optional[bool] = None
    applies_to_columns: Optional[bool] = None
    compliance_frameworks: Optional[List[int]] = None
    regulatory_requirements: Optional[Dict[str, Any]] = None
    owner: Optional[str] = None
    steward: Optional[str] = None
    approval_required: Optional[bool] = None

# Rule Schemas
class ClassificationRuleCreate(BaseModel):
    framework_id: Optional[int] = Field(None, description="Framework ID this rule belongs to")
    name: str = Field(..., description="Rule name", min_length=1, max_length=255)
    description: Optional[str] = Field(None, description="Rule description")
    rule_type: ClassificationRuleTypeEnum = Field(..., description="Type of classification rule")
    pattern: str = Field(..., description="Pattern, regex, or dictionary name", min_length=1)
    sensitivity_level: SensitivityLevelEnum = Field(..., description="Sensitivity level to assign")
    confidence_threshold: float = Field(default=0.8, ge=0.0, le=1.0, description="Confidence threshold")
    is_active: bool = Field(default=True, description="Whether rule is active")
    priority: int = Field(default=100, description="Rule priority (lower = higher priority)")
    scope: ClassificationScopeEnum = Field(default=ClassificationScopeEnum.GLOBAL, description="Rule scope")
    scope_filter: Optional[Dict[str, Any]] = Field(default=None, description="Scope filter criteria")
    case_sensitive: bool = Field(default=False, description="Case sensitive matching")
    whole_word_only: bool = Field(default=False, description="Match whole words only")
    negate_match: bool = Field(default=False, description="Negate the match result")
    conditions: Optional[Dict[str, Any]] = Field(default=None, description="Additional conditions")
    context_requirements: Optional[Dict[str, Any]] = Field(default=None, description="Context requirements")
    applies_to_scan_results: bool = Field(default=True)
    applies_to_catalog_items: bool = Field(default=True)
    compliance_rule_id: Optional[int] = Field(None, description="Associated compliance rule ID")

    @validator('pattern')
    def validate_pattern(cls, v, values):
        if 'rule_type' in values:
            rule_type = values['rule_type']
            if rule_type == ClassificationRuleTypeEnum.REGEX_PATTERN:
                # Validate regex pattern
                import re
                try:
                    re.compile(v)
                except re.error as e:
                    raise ValueError(f"Invalid regex pattern: {str(e)}")
        return v

class ClassificationRuleResponse(BaseModel):
    id: int
    framework_id: Optional[int]
    name: str
    description: Optional[str]
    rule_type: str
    pattern: str
    sensitivity_level: str
    confidence_threshold: float
    is_active: bool
    priority: int
    scope: str
    scope_filter: Optional[Dict[str, Any]]
    case_sensitive: bool
    whole_word_only: bool
    negate_match: bool
    conditions: Optional[Dict[str, Any]]
    context_requirements: Optional[Dict[str, Any]]
    applies_to_scan_results: bool
    applies_to_catalog_items: bool
    compliance_rule_id: Optional[int]
    execution_count: int
    success_count: int
    false_positive_count: int
    last_executed: Optional[datetime]
    avg_execution_time_ms: Optional[float]
    version: str
    parent_rule_id: Optional[int]
    is_deprecated: bool
    deprecation_reason: Optional[str]
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str]
    updated_by: Optional[str]

    class Config:
        from_attributes = True

class ClassificationRuleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    pattern: Optional[str] = None
    sensitivity_level: Optional[SensitivityLevelEnum] = None
    confidence_threshold: Optional[float] = Field(None, ge=0.0, le=1.0)
    is_active: Optional[bool] = None
    priority: Optional[int] = None
    scope: Optional[ClassificationScopeEnum] = None
    scope_filter: Optional[Dict[str, Any]] = None
    case_sensitive: Optional[bool] = None
    whole_word_only: Optional[bool] = None
    negate_match: Optional[bool] = None
    conditions: Optional[Dict[str, Any]] = None
    context_requirements: Optional[Dict[str, Any]] = None
    applies_to_scan_results: Optional[bool] = None
    applies_to_catalog_items: Optional[bool] = None
    compliance_rule_id: Optional[int] = None

# Dictionary Schemas
class ClassificationDictionaryCreate(BaseModel):
    name: str = Field(..., description="Dictionary name", min_length=1, max_length=255)
    description: Optional[str] = Field(None, description="Dictionary description")
    language: str = Field(default="en", description="Language code")
    encoding: str = Field(default="utf-8", description="Text encoding")
    is_case_sensitive: bool = Field(default=False, description="Case sensitive matching")
    entries: Dict[str, Any] = Field(..., description="Dictionary entries")
    category: Optional[str] = Field(None, description="Dictionary category")
    subcategory: Optional[str] = Field(None, description="Dictionary subcategory")
    tags: Optional[List[str]] = Field(default=None, description="Dictionary tags")
    source_type: str = Field(default="manual", description="Source type")
    source_reference: Optional[str] = Field(None, description="Source reference")
    imported_from: Optional[str] = Field(None, description="Import source")

    @validator('entries')
    def validate_entries(cls, v):
        if not isinstance(v, dict):
            raise ValueError("Entries must be a dictionary")
        if len(v) == 0:
            raise ValueError("Dictionary must contain at least one entry")
        return v

class ClassificationDictionaryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    language: str
    encoding: str
    is_case_sensitive: bool
    entries: Dict[str, Any]
    entry_count: int
    category: Optional[str]
    subcategory: Optional[str]
    tags: Optional[List[str]]
    source_type: str
    source_reference: Optional[str]
    imported_from: Optional[str]
    validation_status: str
    validation_notes: Optional[str]
    quality_score: float
    usage_count: int
    last_used: Optional[datetime]
    version: str
    parent_dictionary_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str]
    updated_by: Optional[str]

    class Config:
        from_attributes = True

# Application Request Schemas
class ApplyRulesToScanRequest(BaseModel):
    scan_id: int = Field(..., description="Scan ID to apply rules to")
    force_reclassify: bool = Field(default=False, description="Force reclassification of already classified items")

class ApplyRulesToCatalogRequest(BaseModel):
    catalog_item_ids: List[int] = Field(..., description="List of catalog item IDs")
    framework_id: Optional[int] = Field(None, description="Optional framework ID to use")

class BulkUploadRequest(BaseModel):
    file_type: str = Field(..., description="File type: csv, json, excel")
    framework_id: Optional[int] = Field(None, description="Framework to associate rules with")
    validate_only: bool = Field(default=False, description="Only validate, don't import")

class DataSourceSettingUpdate(BaseModel):
    auto_classify: bool = Field(default=True)
    classification_framework_id: Optional[int] = None
    default_sensitivity_level: SensitivityLevelEnum = Field(default=SensitivityLevelEnum.INTERNAL)
    classify_on_scan: bool = Field(default=True)
    classification_frequency: str = Field(default="daily")
    inherit_schema_classification: bool = Field(default=True)
    inherit_table_classification: bool = Field(default=True)
    inherit_column_classification: bool = Field(default=False)
    batch_size: int = Field(default=1000, ge=1, le=10000)
    max_parallel_jobs: int = Field(default=4, ge=1, le=20)

# Classification Result Schemas
class ClassificationResultResponse(BaseModel):
    id: int
    uuid: str
    entity_type: str
    entity_id: str
    entity_name: Optional[str]
    entity_path: Optional[str]
    rule_id: Optional[int]
    sensitivity_level: str
    classification_method: str
    confidence_score: float
    confidence_level: str
    data_source_id: Optional[int]
    scan_id: Optional[int]
    scan_result_id: Optional[int]
    catalog_item_id: Optional[int]
    matched_patterns: Optional[List[str]]
    matched_values: Optional[List[str]]
    context_data: Optional[Dict[str, Any]]
    sample_data: Optional[Dict[str, Any]]
    sample_size: Optional[int]
    total_records: Optional[int]
    match_percentage: Optional[float]
    is_validated: bool
    validation_status: str
    validation_notes: Optional[str]
    validation_date: Optional[datetime]
    validated_by: Optional[str]
    inherited_from_id: Optional[int]
    propagated_to: Optional[List[str]]
    inheritance_depth: int
    is_override: bool
    override_reason: Optional[str]
    override_approved_by: Optional[str]
    override_approved_at: Optional[datetime]
    processing_time_ms: Optional[float]
    memory_usage_mb: Optional[float]
    status: str
    effective_date: datetime
    expiry_date: Optional[datetime]
    compliance_checked: bool
    compliance_status: Optional[str]
    compliance_notes: Optional[str]
    version: str
    revision_number: int
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str]
    updated_by: Optional[str]

    class Config:
        from_attributes = True

# Audit Log Schema
class ClassificationAuditLogResponse(BaseModel):
    id: int
    uuid: str
    event_type: str
    event_category: str
    event_description: str
    target_type: str
    target_id: Optional[str]
    target_name: Optional[str]
    classification_result_id: Optional[int]
    old_values: Optional[Dict[str, Any]]
    new_values: Optional[Dict[str, Any]]
    event_data: Optional[Dict[str, Any]]
    user_id: Optional[str]
    user_role: Optional[str]
    session_id: Optional[str]
    ip_address: Optional[str]
    user_agent: Optional[str]
    system_version: Optional[str]
    api_version: Optional[str]
    request_id: Optional[str]
    correlation_id: Optional[str]
    risk_level: str
    compliance_impact: bool
    requires_notification: bool
    processing_time_ms: Optional[float]
    success: bool
    error_message: Optional[str]
    error_stack: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# ==================== FRAMEWORK ENDPOINTS ====================

@router.post("/frameworks", response_model=ClassificationFrameworkResponse)
async def create_classification_framework(
    framework_data: ClassificationFrameworkCreate,
    user: str = Query(..., description="User creating the framework"),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    session: Session = Depends(get_session)
):
    """Create a new classification framework with enterprise features"""
    try:
        framework = await classification_service.create_classification_framework(
            session, framework_data.dict(), user
        )
        
        # Schedule background task to update dependent systems
        background_tasks.add_task(
            _notify_framework_creation, framework.id, str(current_user["id"])
        )
        
        return ClassificationFrameworkResponse.from_orm(framework)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating framework: {str(e)}")

@router.get("/frameworks", response_model=List[ClassificationFrameworkResponse])
async def list_classification_frameworks(
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    is_default: Optional[bool] = Query(None, description="Filter by default status"),
    owner: Optional[str] = Query(None, description="Filter by owner"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    session: Session = Depends(get_session)
):
    """List classification frameworks with filtering and pagination"""
    try:
        query = session.query(ClassificationFramework)
        
        if is_active is not None:
            query = query.filter(ClassificationFramework.is_active == is_active)
        if is_default is not None:
            query = query.filter(ClassificationFramework.is_default == is_default)
        if owner:
            query = query.filter(ClassificationFramework.owner.ilike(f"%{owner}%"))
        
        frameworks = query.offset(skip).limit(limit).all()
        return [ClassificationFrameworkResponse.from_orm(f) for f in frameworks]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing frameworks: {str(e)}")

@router.get("/frameworks/{framework_id}", response_model=ClassificationFrameworkResponse)
async def get_classification_framework(
    framework_id: int = Path(..., description="Framework ID"),
    session: Session = Depends(get_session)
):
    """Get a specific classification framework by ID"""
    framework = session.get(ClassificationFramework, framework_id)
    if not framework:
        raise HTTPException(status_code=404, detail="Framework not found")
    
    return ClassificationFrameworkResponse.from_orm(framework)

@router.put("/frameworks/{framework_id}", response_model=ClassificationFrameworkResponse)
async def update_classification_framework(
    framework_id: int = Path(..., description="Framework ID"),
    framework_update: ClassificationFrameworkUpdate = ...,
    user: str = Query(..., description="User updating the framework"),
    session: Session = Depends(get_session)
):
    """Update a classification framework"""
    try:
        framework = session.get(ClassificationFramework, framework_id)
        if not framework:
            raise HTTPException(status_code=404, detail="Framework not found")
        
        # Store old values for audit
        old_values = {
            'name': framework.name,
            'description': framework.description,
            'is_active': framework.is_active
        }
        
        # Update fields
        for field, value in framework_update.dict(exclude_unset=True).items():
            setattr(framework, field, value)
        
        framework.updated_by = user
        framework.updated_at = datetime.utcnow()
        
        session.commit()
        session.refresh(framework)
        
        # Create audit log
        await classification_service._log_audit_event(
            session,
            event_type="update_framework",
            event_category="framework_management",
            event_description=f"Updated classification framework: {framework.name}",
            target_type="framework",
            target_id=str(framework.id),
            target_name=framework.name,
            user_id=user,
            old_values=old_values,
            new_values=framework_update.dict(exclude_unset=True)
        )
        session.commit()
        
        return ClassificationFrameworkResponse.from_orm(framework)
        
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating framework: {str(e)}")

@router.delete("/frameworks/{framework_id}")
async def delete_classification_framework(
    framework_id: int = Path(..., description="Framework ID"),
    user: str = Query(..., description="User deleting the framework"),
    force: bool = Query(default=False, description="Force delete even if rules exist"),
    session: Session = Depends(get_session)
):
    """Delete a classification framework"""
    try:
        framework = session.get(ClassificationFramework, framework_id)
        if not framework:
            raise HTTPException(status_code=404, detail="Framework not found")
        
        # Check for dependent rules
        rule_count = session.query(ClassificationRule).filter_by(framework_id=framework_id).count()
        if rule_count > 0 and not force:
            raise HTTPException(
                status_code=400, 
                detail=f"Cannot delete framework with {rule_count} dependent rules. Use force=true to override."
            )
        
        # Create audit log before deletion
        await classification_service._log_audit_event(
            session,
            event_type="delete_framework",
            event_category="framework_management",
            event_description=f"Deleted classification framework: {framework.name}",
            target_type="framework",
            target_id=str(framework.id),
            target_name=framework.name,
            user_id=user,
            old_values={'name': framework.name, 'id': framework.id}
        )
        
        session.delete(framework)
        session.commit()
        
        return {"message": f"Framework {framework.name} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting framework: {str(e)}")

# ==================== RULE ENDPOINTS ====================

@router.post("/rules", response_model=ClassificationRuleResponse)
async def create_classification_rule(
    rule_data: ClassificationRuleCreate,
    background_tasks: BackgroundTasks,
    user: str = Query(..., description="User creating the rule"),
    validate_only: bool = Query(default=False, description="Only validate, don't create"),
    session: Session = Depends(get_session)
):
    """Create a new classification rule with validation"""
    try:
        if validate_only:
            # Perform validation without creating
            await classification_service._validate_rule_pattern(rule_data.dict())
            return {"message": "Rule validation successful", "valid": True}
        
        rule = await classification_service.create_classification_rule(
            session, rule_data.dict(), user
        )
        
        # Add background notification for rule creation
        background_tasks.add_task(
            _notify_rule_creation, rule.id, rule.framework_id, user
        )
        
        return ClassificationRuleResponse.from_orm(rule)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating rule: {str(e)}")

@router.get("/rules", response_model=List[ClassificationRuleResponse])
async def list_classification_rules(
    framework_id: Optional[int] = Query(None, description="Filter by framework ID"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    rule_type: Optional[ClassificationRuleTypeEnum] = Query(None, description="Filter by rule type"),
    sensitivity_level: Optional[SensitivityLevelEnum] = Query(None, description="Filter by sensitivity level"),
    scope: Optional[ClassificationScopeEnum] = Query(None, description="Filter by scope"),
    search: Optional[str] = Query(None, description="Search in name and description"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    session: Session = Depends(get_session)
):
    """List classification rules with comprehensive filtering"""
    try:
        query = session.query(ClassificationRule)
        
        if framework_id is not None:
            query = query.filter(ClassificationRule.framework_id == framework_id)
        if is_active is not None:
            query = query.filter(ClassificationRule.is_active == is_active)
        if rule_type:
            query = query.filter(ClassificationRule.rule_type == rule_type)
        if sensitivity_level:
            query = query.filter(ClassificationRule.sensitivity_level == sensitivity_level)
        if scope:
            query = query.filter(ClassificationRule.scope == scope)
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                (ClassificationRule.name.ilike(search_pattern)) |
                (ClassificationRule.description.ilike(search_pattern))
            )
        
        rules = query.order_by(ClassificationRule.priority).offset(skip).limit(limit).all()
        return [ClassificationRuleResponse.from_orm(rule) for rule in rules]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing rules: {str(e)}")

@router.get("/rules/{rule_id}", response_model=ClassificationRuleResponse)
async def get_classification_rule(
    rule_id: int = Path(..., description="Rule ID"),
    session: Session = Depends(get_session)
):
    """Get a specific classification rule by ID"""
    rule = session.get(ClassificationRule, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    return ClassificationRuleResponse.from_orm(rule)

@router.put("/rules/{rule_id}", response_model=ClassificationRuleResponse)
async def update_classification_rule(
    rule_id: int = Path(..., description="Rule ID"),
    rule_update: ClassificationRuleUpdate = ...,
    user: str = Query(..., description="User updating the rule"),
    session: Session = Depends(get_session)
):
    """Update a classification rule"""
    try:
        rule = session.get(ClassificationRule, rule_id)
        if not rule:
            raise HTTPException(status_code=404, detail="Rule not found")
        
        # Store old values for audit
        old_values = {
            'name': rule.name,
            'pattern': rule.pattern,
            'sensitivity_level': rule.sensitivity_level.value,
            'is_active': rule.is_active
        }
        
        # Update fields
        for field, value in rule_update.dict(exclude_unset=True).items():
            setattr(rule, field, value)
        
        rule.updated_by = user
        rule.updated_at = datetime.utcnow()
        
        # Increment version for significant changes
        if any(field in rule_update.dict(exclude_unset=True) for field in ['pattern', 'sensitivity_level', 'rule_type']):
            version_parts = rule.version.split('.')
            version_parts[-1] = str(int(version_parts[-1]) + 1)
            rule.version = '.'.join(version_parts)
        
        session.commit()
        session.refresh(rule)
        
        # Clear pattern cache since rule changed
        classification_service._compiled_patterns.clear()
        
        # Create audit log
        await classification_service._log_audit_event(
            session,
            event_type="update_rule",
            event_category="rule_management",
            event_description=f"Updated classification rule: {rule.name}",
            target_type="rule",
            target_id=str(rule.id),
            target_name=rule.name,
            user_id=user,
            old_values=old_values,
            new_values=rule_update.dict(exclude_unset=True)
        )
        session.commit()
        
        return ClassificationRuleResponse.from_orm(rule)
        
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating rule: {str(e)}")

# ==================== APPLICATION ENDPOINTS ====================

@router.post("/apply/scan-results")
async def apply_rules_to_scan_results(
    request: ApplyRulesToScanRequest,
    user: str = Query(..., description="User applying the rules"),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    session: Session = Depends(get_session)
):
    """Apply classification rules to scan results"""
    try:
        # Validate scan exists
        scan = session.get(Scan, request.scan_id)
        if not scan:
            raise HTTPException(status_code=404, detail="Scan not found")
        
        # For large scans, process in background
        scan_result_count = session.query(ScanResult).filter_by(scan_id=request.scan_id).count()
        
        if scan_result_count > 1000:
            # Process in background for large datasets
            background_tasks.add_task(
                _apply_rules_to_scan_background,
                request.scan_id,
                user,
                request.force_reclassify
            )
            
            return {
                "message": f"Classification started for {scan_result_count} scan results in background",
                "scan_id": request.scan_id,
                "estimated_completion": datetime.utcnow().isoformat() + "Z"
            }
        else:
            # Process immediately for smaller datasets
            results = await classification_service.apply_rules_to_scan_results(
                session, request.scan_id, user, request.force_reclassify
            )
            
            return {
                "message": f"Successfully classified {len(results)} scan results",
                "scan_id": request.scan_id,
                "classification_count": len(results),
                "results": [{"id": r.id, "entity_id": r.entity_id, "sensitivity_level": r.sensitivity_level.value} for r in results[:10]]  # Return first 10 for preview
            }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error applying rules to scan results: {str(e)}")

@router.post("/apply/catalog-items")
async def apply_rules_to_catalog_items(
    request: ApplyRulesToCatalogRequest,
    user: str = Query(..., description="User applying the rules"),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    session: Session = Depends(get_session)
):
    """Apply classification rules to catalog items"""
    try:
        # Validate catalog items exist
        existing_items = session.query(CatalogItem).filter(
            CatalogItem.id.in_(request.catalog_item_ids)
        ).all()
        
        if len(existing_items) != len(request.catalog_item_ids):
            missing_ids = set(request.catalog_item_ids) - {item.id for item in existing_items}
            raise HTTPException(
                status_code=404, 
                detail=f"Catalog items not found: {list(missing_ids)}"
            )
        
        # Process in background for large requests
        if len(request.catalog_item_ids) > 500:
            background_tasks.add_task(
                _apply_rules_to_catalog_background,
                request.catalog_item_ids,
                user,
                request.framework_id
            )
            
            return {
                "message": f"Classification started for {len(request.catalog_item_ids)} catalog items in background",
                "catalog_item_count": len(request.catalog_item_ids)
            }
        else:
            # Process immediately
            results = await classification_service.apply_rules_to_catalog_items(
                session, request.catalog_item_ids, user, request.framework_id
            )
            
            return {
                "message": f"Successfully classified {len(results)} catalog items",
                "catalog_item_count": len(request.catalog_item_ids),
                "classification_count": len(results),
                "results": [{"id": r.id, "entity_id": r.entity_id, "sensitivity_level": r.sensitivity_level.value} for r in results[:10]]
            }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error applying rules to catalog items: {str(e)}")

# ==================== BULK UPLOAD ENDPOINTS ====================

@router.post("/bulk-upload")
async def bulk_upload_classification_data(
    file: UploadFile = File(..., description="Classification file (CSV, JSON, Excel)"),
    framework_id: Optional[int] = Query(None, description="Framework ID to associate rules with"),
    validate_only: bool = Query(default=False, description="Only validate, don't import"),
    user: str = Query(..., description="User performing the upload"),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    session: Session = Depends(get_session)
):
    """Bulk upload classification rules and dictionaries"""
    try:
        # Validate file type
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        file_extension = file.filename.split('.')[-1].lower()
        if file_extension not in ['csv', 'json', 'xlsx', 'xls']:
            raise HTTPException(
                status_code=400, 
                detail="Unsupported file type. Supported types: CSV, JSON, Excel"
            )
        
        # Read file content
        file_content = await file.read()
        
        # Parse file based on type
        if file_extension == 'csv':
            file_data = _parse_csv_content(file_content)
        elif file_extension == 'json':
            file_data = _parse_json_content(file_content)
        elif file_extension in ['xlsx', 'xls']:
            file_data = _parse_excel_content(file_content)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        if validate_only:
            # Validate only without importing
            validation_results = []
            for idx, entry in enumerate(file_data):
                validation_result = await classification_service._validate_bulk_entry(entry, file_extension)
                if not validation_result['valid']:
                    validation_results.append({
                        'row': idx + 1,
                        'errors': validation_result['errors']
                    })
            
            return {
                "message": "Validation completed",
                "total_entries": len(file_data),
                "validation_errors": validation_results,
                "valid_entries": len(file_data) - len(validation_results)
            }
        
        # For large files, process in background
        if len(file_data) > 100:
            operation_id = f"bulk_upload_{uuid.uuid4().hex[:12]}"
            background_tasks.add_task(
                _process_bulk_upload_background,
                file_data,
                file_extension,
                framework_id,
                user,
                operation_id
            )
            
            # Send initial progress notification
            background_tasks.add_task(
                _notify_bulk_operation_progress,
                operation_id,
                {"percentage": 0, "status": "started", "total_entries": len(file_data)},
                user
            )
            
            return {
                "message": f"Bulk upload started for {len(file_data)} entries in background",
                "total_entries": len(file_data),
                "operation_id": operation_id
            }
        else:
            # Process immediately for smaller files
            results = await classification_service.bulk_upload_classification_files(
                session, file_data, file_extension, framework_id, user
            )
            
            return {
                "message": "Bulk upload completed",
                "results": results
            }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in bulk upload: {str(e)}")

# ==================== DATA SOURCE SETTINGS ====================

@router.put("/data-sources/{data_source_id}/settings")
async def update_data_source_classification_settings(
    data_source_id: int = Path(..., description="Data source ID"),
    settings: DataSourceSettingUpdate = ...,
    user: str = Query(..., description="User updating the settings"),
    session: Session = Depends(get_session)
):
    """Update classification settings for a data source"""
    try:
        # Validate data source exists
        data_source = session.get(DataSource, data_source_id)
        if not data_source:
            raise HTTPException(status_code=404, detail="Data source not found")
        
        # Get or create settings
        existing_setting = session.query(DataSourceClassificationSetting).filter_by(
            data_source_id=data_source_id
        ).first()
        
        if existing_setting:
            # Update existing settings
            for field, value in settings.dict(exclude_unset=True).items():
                setattr(existing_setting, field, value)
            existing_setting.updated_by = user
            existing_setting.updated_at = datetime.utcnow()
            setting = existing_setting
        else:
            # Create new settings
            setting = DataSourceClassificationSetting(
                data_source_id=data_source_id,
                **settings.dict(),
                created_by=user,
                updated_by=user
            )
            session.add(setting)
        
        session.commit()
        session.refresh(setting)
        
        # Trigger classification if auto_classify is enabled
        if setting.auto_classify:
            await classification_service._trigger_data_source_classification(
                session, data_source_id, user
            )
        
        return {
            "message": "Data source classification settings updated successfully",
            "data_source_id": data_source_id,
            "settings": {
                "auto_classify": setting.auto_classify,
                "classification_framework_id": setting.classification_framework_id,
                "default_sensitivity_level": setting.default_sensitivity_level.value
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating data source settings: {str(e)}")

@router.get("/data-sources/{data_source_id}/settings")
async def get_data_source_classification_settings(
    data_source_id: int = Path(..., description="Data source ID"),
    session: Session = Depends(get_session)
):
    """Get classification settings for a data source"""
    try:
        # Validate data source exists
        data_source = session.get(DataSource, data_source_id)
        if not data_source:
            raise HTTPException(status_code=404, detail="Data source not found")
        
        setting = session.query(DataSourceClassificationSetting).filter_by(
            data_source_id=data_source_id
        ).first()
        
        if not setting:
            # Return default settings
            return {
                "data_source_id": data_source_id,
                "auto_classify": True,
                "classification_framework_id": None,
                "default_sensitivity_level": SensitivityLevelEnum.INTERNAL.value,
                "classify_on_scan": True,
                "classification_frequency": "daily",
                "inherit_schema_classification": True,
                "inherit_table_classification": True,
                "inherit_column_classification": False,
                "batch_size": 1000,
                "max_parallel_jobs": 4
            }
        
        return {
            "data_source_id": setting.data_source_id,
            "auto_classify": setting.auto_classify,
            "classification_framework_id": setting.classification_framework_id,
            "default_sensitivity_level": setting.default_sensitivity_level.value,
            "classify_on_scan": setting.classify_on_scan,
            "classification_frequency": setting.classification_frequency,
            "inherit_schema_classification": setting.inherit_schema_classification,
            "inherit_table_classification": setting.inherit_table_classification,
            "inherit_column_classification": setting.inherit_column_classification,
            "batch_size": setting.batch_size,
            "max_parallel_jobs": setting.max_parallel_jobs,
            "created_at": setting.created_at,
            "updated_at": setting.updated_at,
            "created_by": setting.created_by,
            "updated_by": setting.updated_by
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting data source settings: {str(e)}")

# ==================== HELPER FUNCTIONS ====================

def _parse_csv_content(content: bytes) -> List[Dict[str, Any]]:
    """Parse CSV content into list of dictionaries"""
    try:
        csv_content = content.decode('utf-8')
        reader = csv.DictReader(io.StringIO(csv_content))
        return [dict(row) for row in reader]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing CSV: {str(e)}")

def _parse_json_content(content: bytes) -> List[Dict[str, Any]]:
    """Parse JSON content into list of dictionaries"""
    try:
        json_content = content.decode('utf-8')
        data = json.loads(json_content)
        if isinstance(data, list):
            return data
        elif isinstance(data, dict):
            return [data]
        else:
            raise ValueError("JSON must contain a list or dictionary")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing JSON: {str(e)}")

def _parse_excel_content(content: bytes) -> List[Dict[str, Any]]:
    """Parse Excel content into list of dictionaries"""
    try:
        import pandas as pd
        df = pd.read_excel(io.BytesIO(content))
        return df.to_dict('records')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing Excel: {str(e)}")

# Background task functions
async def _apply_rules_to_scan_background(scan_id: int, user: str, force_reclassify: bool):
    """Background task for applying rules to scan results"""
    try:
        with get_session() as session:
            await classification_service.apply_rules_to_scan_results(
                session, scan_id, user, force_reclassify
            )
    except Exception as e:
        logger.error(f"Error in background scan classification: {str(e)}")

async def _apply_rules_to_catalog_background(catalog_item_ids: List[int], user: str, framework_id: Optional[int]):
    """Background task for applying rules to catalog items"""
    try:
        with get_session() as session:
            await classification_service.apply_rules_to_catalog_items(
                session, catalog_item_ids, user, framework_id
            )
    except Exception as e:
        logger.error(f"Error in background catalog classification: {str(e)}")

async def _process_bulk_upload_background(file_data: List[Dict[str, Any]], file_type: str, framework_id: Optional[int], user: str, operation_id: str):
    """Background task for bulk upload processing"""
    try:
        with get_session() as session:
            # Send progress notification at 50%
            await _notify_bulk_operation_progress(
                operation_id,
                {"percentage": 50, "status": "processing", "total_entries": len(file_data)},
                user
            )
            
            await classification_service.bulk_upload_classification_files(
                session, file_data, file_type, framework_id, user
            )
            
            # Send completion notification
            await _notify_bulk_operation_progress(
                operation_id,
                {"percentage": 100, "status": "completed", "total_entries": len(file_data)},
                user
            )
            
    except Exception as e:
        logger.error(f"Error in background bulk upload: {str(e)}")
        # Send failure notification
        await _notify_classification_failure(
            {"error": str(e), "operation_id": operation_id, "operation_type": "bulk_upload"},
            user
        )

async def _notify_framework_creation(framework_id: int, user: str):
    """Background task to notify systems about framework creation"""
    try:
        from ...services.notification_service import NotificationService
        
        notification_service = NotificationService()
        
        # Send notification to user
        await notification_service.send_notification(
            user_id=user,
            title="Classification Framework Created",
            message=f"Classification framework {framework_id} has been successfully created",
            notification_type="classification_framework_created",
            metadata={
                "framework_id": framework_id,
                "action": "created",
                "timestamp": datetime.utcnow().isoformat()
            }
        )
        
        # Send notification to administrators
        await notification_service.send_notification_to_role(
            role="administrator",
            title="New Classification Framework",
            message=f"User {user} created classification framework {framework_id}",
            notification_type="admin_alert",
            metadata={
                "framework_id": framework_id,
                "created_by": user,
                "action": "framework_created"
            }
        )
        
        # Trigger system integration notifications
        await notification_service.send_system_notification(
            system="data_catalog",
            event_type="framework_created",
            payload={
                "framework_id": framework_id,
                "created_by": user,
                "requires_integration": True
            }
        )
        
        logger.info(f"Successfully sent notifications for framework {framework_id} creation")
        
    except Exception as e:
        logger.error(f"Error notifying framework creation: {str(e)}")

async def _notify_rule_creation(rule_id: int, framework_id: int, user: str):
    """Background task to notify systems about rule creation"""
    try:
        from ...services.notification_service import NotificationService
        
        notification_service = NotificationService()
        
        # Send notification to user
        await notification_service.send_notification(
            user_id=user,
            title="Classification Rule Created",
            message=f"Classification rule {rule_id} has been added to framework {framework_id}",
            notification_type="classification_rule_created",
            metadata={
                "rule_id": rule_id,
                "framework_id": framework_id,
                "action": "created"
            }
        )
        
        # Notify team members working on the same framework
        await notification_service.send_notification_to_framework_team(
            framework_id=framework_id,
            title="New Classification Rule",
            message=f"A new rule has been added to the classification framework",
            notification_type="team_update",
            exclude_user=user
        )
        
        logger.info(f"Successfully sent notifications for rule {rule_id} creation")
        
    except Exception as e:
        logger.error(f"Error notifying rule creation: {str(e)}")

async def _notify_classification_completion(result_id: int, user: str, classification_type: str):
    """Background task to notify about classification completion"""
    try:
        from ...services.notification_service import NotificationService
        
        notification_service = NotificationService()
        
        # Send completion notification
        await notification_service.send_notification(
            user_id=user,
            title=f"{classification_type.title()} Classification Complete",
            message=f"Classification process completed successfully. Result ID: {result_id}",
            notification_type="classification_completed",
            metadata={
                "result_id": result_id,
                "classification_type": classification_type,
                "status": "completed"
            }
        )
        
        # Send analytics notification
        await notification_service.send_system_notification(
            system="analytics",
            event_type="classification_completed",
            payload={
                "result_id": result_id,
                "classification_type": classification_type,
                "user_id": user,
                "completion_time": datetime.utcnow().isoformat()
            }
        )
        
        logger.info(f"Successfully sent completion notifications for result {result_id}")
        
    except Exception as e:
        logger.error(f"Error notifying classification completion: {str(e)}")

async def _notify_classification_failure(error_details: Dict[str, Any], user: str):
    """Background task to notify about classification failures"""
    try:
        from ...services.notification_service import NotificationService
        
        notification_service = NotificationService()
        
        # Send failure notification to user
        await notification_service.send_notification(
            user_id=user,
            title="Classification Process Failed",
            message=f"Classification failed: {error_details.get('error', 'Unknown error')}",
            notification_type="classification_failed",
            priority="high",
            metadata={
                "error_details": error_details,
                "failure_time": datetime.utcnow().isoformat()
            }
        )
        
        # Send alert to support team
        await notification_service.send_notification_to_role(
            role="support",
            title="Classification Process Failure",
            message=f"Classification failed for user {user}",
            notification_type="system_alert",
            priority="high",
            metadata=error_details
        )
        
        logger.info(f"Successfully sent failure notifications for user {user}")
        
    except Exception as e:
        logger.error(f"Error notifying classification failure: {str(e)}")

async def _notify_bulk_operation_progress(operation_id: str, progress: Dict[str, Any], user: str):
    """Background task to notify about bulk operation progress"""
    try:
        from ...services.notification_service import NotificationService
        
        notification_service = NotificationService()
        
        # Send progress update
        await notification_service.send_notification(
            user_id=user,
            title="Bulk Classification Progress",
            message=f"Bulk operation {operation_id}: {progress.get('percentage', 0)}% complete",
            notification_type="bulk_operation_progress",
            metadata={
                "operation_id": operation_id,
                "progress": progress,
                "update_time": datetime.utcnow().isoformat()
            }
        )
        
        logger.info(f"Successfully sent progress notification for operation {operation_id}")
        
    except Exception as e:
        logger.error(f"Error notifying bulk operation progress: {str(e)}")

# ==================== ADDITIONAL ENDPOINTS ====================

@router.get("/results", response_model=List[ClassificationResultResponse])
async def list_classification_results(
    entity_type: Optional[str] = Query(None, description="Filter by entity type"),
    entity_id: Optional[str] = Query(None, description="Filter by entity ID"),
    sensitivity_level: Optional[SensitivityLevelEnum] = Query(None, description="Filter by sensitivity level"),
    data_source_id: Optional[int] = Query(None, description="Filter by data source ID"),
    is_validated: Optional[bool] = Query(None, description="Filter by validation status"),
    confidence_threshold: Optional[float] = Query(None, ge=0.0, le=1.0, description="Minimum confidence score"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    session: Session = Depends(get_session)
):
    """List classification results with filtering"""
    try:
        query = session.query(ClassificationResult)
        
        if entity_type:
            query = query.filter(ClassificationResult.entity_type == entity_type)
        if entity_id:
            query = query.filter(ClassificationResult.entity_id == entity_id)
        if sensitivity_level:
            query = query.filter(ClassificationResult.sensitivity_level == sensitivity_level)
        if data_source_id:
            query = query.filter(ClassificationResult.data_source_id == data_source_id)
        if is_validated is not None:
            query = query.filter(ClassificationResult.is_validated == is_validated)
        if confidence_threshold is not None:
            query = query.filter(ClassificationResult.confidence_score >= confidence_threshold)
        
        results = query.order_by(ClassificationResult.created_at.desc()).offset(skip).limit(limit).all()
        return [ClassificationResultResponse.from_orm(result) for result in results]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing classification results: {str(e)}")

@router.get("/audit", response_model=List[ClassificationAuditLogResponse])
async def get_classification_audit_logs(
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    event_category: Optional[str] = Query(None, description="Filter by event category"),
    target_type: Optional[str] = Query(None, description="Filter by target type"),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    start_date: Optional[datetime] = Query(None, description="Start date for filtering"),
    end_date: Optional[datetime] = Query(None, description="End date for filtering"),
    risk_level: Optional[str] = Query(None, description="Filter by risk level"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    session: Session = Depends(get_session)
):
    """Get classification audit logs with filtering"""
    try:
        query = session.query(ClassificationAuditLog)
        
        if event_type:
            query = query.filter(ClassificationAuditLog.event_type == event_type)
        if event_category:
            query = query.filter(ClassificationAuditLog.event_category == event_category)
        if target_type:
            query = query.filter(ClassificationAuditLog.target_type == target_type)
        if user_id:
            query = query.filter(ClassificationAuditLog.user_id == user_id)
        if start_date:
            query = query.filter(ClassificationAuditLog.created_at >= start_date)
        if end_date:
            query = query.filter(ClassificationAuditLog.created_at <= end_date)
        if risk_level:
            query = query.filter(ClassificationAuditLog.risk_level == risk_level)
        
        logs = query.order_by(ClassificationAuditLog.created_at.desc()).offset(skip).limit(limit).all()
        return [ClassificationAuditLogResponse.from_orm(log) for log in logs]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting audit logs: {str(e)}")

@router.get("/health")
async def classification_health_check():
    """Health check endpoint for classification service"""
    try:
        # Check service health
        stats = classification_service._performance_stats
        
        return {
            "status": "healthy",
            "service": "Enterprise Classification Service",
            "version": "1.0.0",
            "statistics": {
                "total_classifications": stats['total_classifications'],
                "average_processing_time": stats['avg_processing_time'],
                "cache_hit_ratio": stats['cache_hits'] / max(1, stats['cache_hits'] + stats['cache_misses']),
                "cache_hits": stats['cache_hits'],
                "cache_misses": stats['cache_misses']
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

# ============================================================================
# ADVANCED API ENDPOINTS - MISSING IMPLEMENTATIONS
# ============================================================================

# Framework Validation and Management Endpoints
@router.post("/frameworks/validate")
async def validate_frameworks(
    request: Dict[str, Any],
    session: Session = Depends(get_session)
):
    """Advanced framework validation with conflict detection"""
    try:
        framework_ids = request.get('frameworkIds', [])
        
        # Validate framework existence and status
        validation_results = []
        for framework_id in framework_ids:
            framework = session.query(ClassificationFramework).filter_by(id=framework_id).first()
            if not framework:
                validation_results.append({
                    'frameworkId': framework_id,
                    'isValid': False,
                    'message': f'Framework {framework_id} not found'
                })
                continue
                
            if not framework.is_active:
                validation_results.append({
                    'frameworkId': framework_id,
                    'isValid': False,
                    'message': f'Framework {framework_id} is inactive'
                })
                continue
                
            # Check framework dependencies
            dependencies_valid = await classification_service.validate_framework_dependencies(framework_id, session)
            if not dependencies_valid:
                validation_results.append({
                    'frameworkId': framework_id,
                    'isValid': False,
                    'message': f'Framework {framework_id} has unmet dependencies'
                })
                continue
                
            validation_results.append({
                'frameworkId': framework_id,
                'isValid': True,
                'message': f'Framework {framework_id} is valid'
            })
        
        overall_valid = all(result['isValid'] for result in validation_results)
        return {
            'success': True,
            'data': {
                'isValid': overall_valid,
                'message': 'All frameworks valid' if overall_valid else 'Some frameworks are invalid',
                'details': validation_results
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Framework validation failed: {str(e)}")

@router.post("/frameworks/check-conflicts")
async def check_framework_conflicts(
    request: Dict[str, Any],
    session: Session = Depends(get_session)
):
    """Check for conflicts between frameworks"""
    try:
        framework_ids = request.get('frameworkIds', [])
        
        conflicts = await classification_service.detect_framework_conflicts(framework_ids, session)
        
        return {
            'success': True,
            'data': {
                'hasConflicts': len(conflicts) > 0,
                'conflicts': conflicts
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conflict detection failed: {str(e)}")

@router.get("/frameworks/{framework_id}/capabilities")
async def get_framework_capabilities(
    framework_id: str,
    session: Session = Depends(get_session)
):
    """Get framework capabilities and limitations"""
    try:
        capabilities = await classification_service.get_framework_capabilities(framework_id, session)
        
        return {
            'success': True,
            'data': capabilities
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get capabilities: {str(e)}")

@router.get("/frameworks/{framework_id}/security-validation")
async def validate_framework_security(
    framework_id: str,
    session: Session = Depends(get_session)
):
    """Validate framework security"""
    try:
        security_status = await classification_service.validate_framework_security(framework_id, session)
        
        return {
            'success': True,
            'data': security_status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Security validation failed: {str(e)}")

@router.get("/frameworks/{framework_id}/fallback")
async def get_fallback_framework(
    framework_id: str,
    session: Session = Depends(get_session)
):
    """Get fallback framework for the specified framework"""
    try:
        fallback = await classification_service.get_fallback_framework(framework_id, session)
        
        return {
            'success': True,
            'data': fallback
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get fallback framework: {str(e)}")

# Rule Validation and Management Endpoints
@router.post("/rules/validate")
async def validate_rules(
    request: Dict[str, Any],
    session: Session = Depends(get_session)
):
    """Advanced rule validation"""
    try:
        rule_ids = request.get('ruleIds', [])
        
        validation_result = await classification_service.validate_rules(rule_ids, session)
        
        return {
            'success': True,
            'data': validation_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rule validation failed: {str(e)}")

@router.post("/rules/analyze-performance")
async def analyze_rule_performance(
    request: Dict[str, Any],
    session: Session = Depends(get_session)
):
    """Analyze rule performance impact"""
    try:
        rule_ids = request.get('ruleIds', [])
        
        performance_analysis = await classification_service.analyze_rule_performance(rule_ids, session)
        
        return {
            'success': True,
            'data': performance_analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Performance analysis failed: {str(e)}")

@router.post("/rules/optimize")
async def optimize_rules(
    config: Dict[str, Any],
    session: Session = Depends(get_session)
):
    """Optimize rules for better performance"""
    try:
        optimized_rules = await classification_service.optimize_rules(config, session)
        
        return {
            'success': True,
            'data': {
                'optimizedRules': optimized_rules
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rule optimization failed: {str(e)}")

@router.post("/rules/security-validation")
async def validate_rules_security(
    request: Dict[str, Any],
    session: Session = Depends(get_session)
):
    """Validate rules for security risks"""
    try:
        rule_ids = request.get('ruleIds', [])
        
        security_validation = await classification_service.validate_rules_security(rule_ids, session)
        
        return {
            'success': True,
            'data': security_validation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Security validation failed: {str(e)}")

# Data Source Management Endpoints
@router.get("/data-sources/{data_source:path}/metadata")
async def get_data_source_metadata(
    data_source: str,
    session: Session = Depends(get_session)
):
    """Get comprehensive data source metadata"""
    try:
        metadata = await classification_service.get_data_source_metadata(data_source, session)
        
        return {
            'success': True,
            'data': metadata
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get metadata: {str(e)}")

@router.post("/data-sources/validate-access")
async def validate_data_source_access(
    request: Dict[str, Any],
    session: Session = Depends(get_session)
):
    """Validate data source accessibility"""
    try:
        data_source = request.get('dataSource')
        
        access_validation = await classification_service.validate_data_source_access(data_source, session)
        
        return {
            'success': True,
            'data': access_validation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Access validation failed: {str(e)}")

@router.post("/data-sources/validate-schema")
async def validate_data_source_schema(
    request: Dict[str, Any],
    session: Session = Depends(get_session)
):
    """Validate data source schema compatibility"""
    try:
        data_source = request.get('dataSource')
        
        schema_validation = await classification_service.validate_data_source_schema(data_source, session)
        
        return {
            'success': True,
            'data': schema_validation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Schema validation failed: {str(e)}")

@router.post("/data-sources/security-validation")
async def validate_data_source_security(
    request: Dict[str, Any],
    session: Session = Depends(get_session)
):
    """Validate data source security"""
    try:
        data_source = request.get('dataSource')
        
        security_validation = await classification_service.validate_data_source_security(data_source, session)
        
        return {
            'success': True,
            'data': security_validation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Security validation failed: {str(e)}")

@router.get("/data-sources/{data_source:path}/sensitivity")
async def check_data_sensitivity(
    data_source: str,
    session: Session = Depends(get_session)
):
    """Check data sensitivity requirements"""
    try:
        sensitivity_info = await classification_service.check_data_sensitivity(data_source, session)
        
        return {
            'success': True,
            'data': sensitivity_info
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sensitivity check failed: {str(e)}")

@router.post("/data-sources/preprocess")
async def preprocess_data(
    config: Dict[str, Any],
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session)
):
    """Advanced data preprocessing"""
    try:
        # Start preprocessing in background for large datasets
        task_id = str(uuid.uuid4())
        background_tasks.add_task(
            classification_service.preprocess_data_async,
            config, task_id, session
        )
        
        # For smaller datasets, process synchronously
        if config.get('synchronous', False):
            result = await classification_service.preprocess_data(config, session)
            return {
                'success': True,
                'data': result
            }
        else:
            return {
                'success': True,
                'data': {
                    'taskId': task_id,
                    'status': 'processing',
                    'message': 'Data preprocessing started'
                }
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preprocessing failed: {str(e)}")

@router.post("/data-sources/assess-quality")
async def assess_data_quality(
    request: Dict[str, Any],
    session: Session = Depends(get_session)
):
    """Assess data quality with comprehensive metrics"""
    try:
        data = request.get('data')
        
        quality_assessment = await classification_service.assess_data_quality(data, session)
        
        return {
            'success': True,
            'data': quality_assessment
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quality assessment failed: {str(e)}")

@router.post("/data-sources/enrich")
async def enrich_data(
    config: Dict[str, Any],
    session: Session = Depends(get_session)
):
    """Enrich data with additional features and metadata"""
    try:
        enriched_data = await classification_service.enrich_data(config, session)
        
        return {
            'success': True,
            'data': enriched_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data enrichment failed: {str(e)}")

@router.post("/data-sources/sample")
async def sample_data(
    config: Dict[str, Any],
    session: Session = Depends(get_session)
):
    """Intelligent data sampling for large datasets"""
    try:
        sampled_data = await classification_service.sample_data(config, session)
        
        return {
            'success': True,
            'data': sampled_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data sampling failed: {str(e)}")

# Data Preparation Endpoints
@router.post("/data-preparation/text")
async def prepare_text_data(
    config: Dict[str, Any],
    session: Session = Depends(get_session)
):
    """Prepare text data for classification"""
    try:
        prepared_data = await classification_service.prepare_text_data(config, session)
        
        return {
            'success': True,
            'data': prepared_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text preparation failed: {str(e)}")

@router.post("/data-preparation/structured")
async def prepare_structured_data(
    config: Dict[str, Any],
    session: Session = Depends(get_session)
):
    """Prepare structured data for classification"""
    try:
        prepared_data = await classification_service.prepare_structured_data(config, session)
        
        return {
            'success': True,
            'data': prepared_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Structured data preparation failed: {str(e)}")

@router.post("/data-preparation/image")
async def prepare_image_data(
    config: Dict[str, Any],
    session: Session = Depends(get_session)
):
    """Prepare image data for classification"""
    try:
        prepared_data = await classification_service.prepare_image_data(config, session)
        
        return {
            'success': True,
            'data': prepared_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image preparation failed: {str(e)}")

# Classification Execution Endpoints
@router.post("/classification/execute")
async def execute_classification(
    config: Dict[str, Any],
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session)
):
    """Execute advanced classification with intelligent orchestration"""
    try:
        # Create execution context
        execution_id = str(uuid.uuid4())
        
        # Start classification in background if not real-time
        if not config.get('realTime', False):
            background_tasks.add_task(
                classification_service.execute_classification_async,
                config, execution_id, session
            )
            
            return {
                'success': True,
                'data': {
                    'executionId': execution_id,
                    'status': 'processing',
                    'estimatedCompletion': await classification_service.estimate_completion_time(config)
                }
            }
        else:
            # Execute synchronously for real-time processing
            results = await classification_service.execute_classification(config, session)
            
            return {
                'success': True,
                'data': results
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification execution failed: {str(e)}")

@router.post("/classification/execute-simple")
async def execute_simple_classification(
    config: Dict[str, Any],
    session: Session = Depends(get_session)
):
    """Execute simple rule-based classification"""
    try:
        results = await classification_service.execute_simple_classification(config, session)
        
        return {
            'success': True,
            'data': results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simple classification failed: {str(e)}")

# System Health and Monitoring Endpoints
@router.get("/system/health")
async def get_system_health(session: Session = Depends(get_session)):
    """Get comprehensive system health status"""
    try:
        health_status = await classification_service.get_system_health(session)
        
        return {
            'success': True,
            'data': health_status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

@router.get("/system/performance")
async def get_performance_metrics(session: Session = Depends(get_session)):
    """Get system performance metrics"""
    try:
        performance_metrics = await classification_service.get_performance_metrics(session)
        
        return {
            'success': True,
            'data': performance_metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Performance metrics failed: {str(e)}")

@router.get("/system/capacity")
async def get_capacity_metrics(session: Session = Depends(get_session)):
    """Get system capacity metrics"""
    try:
        capacity_metrics = await classification_service.get_capacity_metrics(session)
        
        return {
            'success': True,
            'data': capacity_metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Capacity metrics failed: {str(e)}")

@router.get("/system/compliance")
async def get_compliance_metrics(session: Session = Depends(get_session)):
    """Get compliance metrics"""
    try:
        compliance_metrics = await classification_service.get_compliance_metrics(session)
        
        return {
            'success': True,
            'data': compliance_metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Compliance metrics failed: {str(e)}")

# Advanced Search Endpoints
@router.post("/search/classifications")
async def search_classifications(
    config: Dict[str, Any],
    session: Session = Depends(get_session)
):
    """Advanced AI-powered classification search"""
    try:
        search_results = await classification_service.search_classifications(config, session)
        
        return {
            'success': True,
            'data': search_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.post("/search/workflows")
async def search_workflows(
    config: Dict[str, Any],
    session: Session = Depends(get_session)
):
    """Search classification workflows"""
    try:
        search_results = await classification_service.search_workflows(config, session)
        
        return {
            'success': True,
            'data': search_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Workflow search failed: {str(e)}")

@router.post("/search/frameworks")
async def search_frameworks(
    config: Dict[str, Any],
    session: Session = Depends(get_session)
):
    """Search classification frameworks"""
    try:
        search_results = await classification_service.search_frameworks(config, session)
        
        return {
            'success': True,
            'data': search_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Framework search failed: {str(e)}")

@router.post("/search/rules")
async def search_rules(
    config: Dict[str, Any],
    session: Session = Depends(get_session)
):
    """Search classification rules"""
    try:
        search_results = await classification_service.search_rules(config, session)
        
        return {
            'success': True,
            'data': search_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rule search failed: {str(e)}")

@router.post("/search/users")
async def search_users(
    config: Dict[str, Any],
    session: Session = Depends(get_session)
):
    """Search users and permissions"""
    try:
        search_results = await classification_service.search_users(config, session)
        
        return {
            'success': True,
            'data': search_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"User search failed: {str(e)}")

@router.post("/search/reports")
async def search_reports(
    config: Dict[str, Any],
    session: Session = Depends(get_session)
):
    """Search classification reports"""
    try:
        search_results = await classification_service.search_reports(config, session)
        
        return {
            'success': True,
            'data': search_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report search failed: {str(e)}")

@router.post("/search/suggestions")
async def get_search_suggestions(
    config: Dict[str, Any],
    session: Session = Depends(get_session)
):
    """Get intelligent search suggestions"""
    try:
        suggestions = await classification_service.get_search_suggestions(config, session)
        
        return {
            'success': True,
            'data': suggestions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search suggestions failed: {str(e)}")

@router.post("/search/related-queries")
async def get_related_queries(
    config: Dict[str, Any],
    session: Session = Depends(get_session)
):
    """Get related search queries"""
    try:
        related_queries = await classification_service.get_related_queries(config, session)
        
        return {
            'success': True,
            'data': related_queries
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Related queries failed: {str(e)}")

@router.post("/search/rank-results")
async def rank_search_results(
    config: Dict[str, Any],
    session: Session = Depends(get_session)
):
    """Apply intelligent ranking to search results"""
    try:
        ranked_results = await classification_service.rank_search_results(config, session)
        
        return {
            'success': True,
            'data': ranked_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Result ranking failed: {str(e)}")

# Analytics and Tracking Endpoints
@router.post("/search/track-analytics")
async def track_search_analytics(
    data: Dict[str, Any],
    session: Session = Depends(get_session)
):
    """Track search analytics"""
    try:
        await classification_service.track_search_analytics(data, session)
        
        return {
            'success': True,
            'message': 'Analytics tracked successfully'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics tracking failed: {str(e)}")

@router.post("/search/track-interaction")
async def track_search_interaction(
    data: Dict[str, Any],
    session: Session = Depends(get_session)
):
    """Track search interactions"""
    try:
        await classification_service.track_search_interaction(data, session)
        
        return {
            'success': True,
            'message': 'Interaction tracked successfully'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Interaction tracking failed: {str(e)}")

# Emergency Response
@router.post("/system/emergency-response")
async def trigger_emergency_response(session: Session = Depends(get_session)):
    """Trigger emergency response protocols"""
    try:
        await classification_service.trigger_emergency_response(session)
        
        return {
            'success': True,
            'message': 'Emergency response activated'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Emergency response failed: {str(e)}")

# Export router for main application integration
__all__ = ["router"]