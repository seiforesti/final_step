from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlmodel import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging

# **INTERCONNECTED: Import enhanced service and models**
from app.services.compliance_rule_service import ComplianceRuleService
from app.services.compliance_production_services import ComplianceAuditService, ComplianceAnalyticsService
from app.models.compliance_rule_models import (
    ComplianceRuleResponse, ComplianceRuleEvaluationResponse, ComplianceIssueResponse, ComplianceWorkflowResponse,
    ComplianceRuleCreate, ComplianceRuleUpdate, ComplianceIssueCreate, ComplianceIssueUpdate,
    ComplianceWorkflowCreate, ComplianceWorkflowUpdate,
    ComplianceRuleType, ComplianceRuleSeverity, ComplianceRuleStatus, ComplianceRuleScope
)
from app.db_session import get_session

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/compliance/rules", tags=["Compliance Rules"])

# **INTERCONNECTED: Enhanced CRUD Operations**
@router.get("/", response_model=Dict[str, Any])
async def get_compliance_rules(
    rule_type: Optional[ComplianceRuleType] = Query(None, description="Filter by rule type"),
    severity: Optional[ComplianceRuleSeverity] = Query(None, description="Filter by severity"),
    status: Optional[ComplianceRuleStatus] = Query(None, description="Filter by status"),
    scope: Optional[ComplianceRuleScope] = Query(None, description="Filter by scope"),
    data_source_id: Optional[int] = Query(None, description="Filter by data source"),
    compliance_standard: Optional[str] = Query(None, description="Filter by compliance standard"),
    tags: Optional[str] = Query(None, description="Filter by tags (comma-separated)"),
    search: Optional[str] = Query(None, description="Search in name, description, and standard"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=100, description="Items per page"),
    sort: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", description="Sort order (asc/desc)"),
    session: Session = Depends(get_session)
):
    """Get compliance rules with comprehensive filtering and pagination"""
    try:
        # Parse tags
        tag_list = [tag.strip() for tag in tags.split(",")] if tags else None
        
        rules, total = ComplianceRuleService.get_rules(
            session=session,
            rule_type=rule_type,
            severity=severity,
            status=status,
            scope=scope,
            data_source_id=data_source_id,
            compliance_standard=compliance_standard,
            tags=tag_list,
            search=search,
            page=page,
            limit=limit,
            sort=sort,
            sort_order=sort_order
        )
        
        return {
            "data": rules,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
        
    except Exception as e:
        logger.error(f"Error getting compliance rules: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{rule_id}", response_model=ComplianceRuleResponse)
async def get_compliance_rule(
    rule_id: int,
    session: Session = Depends(get_session)
):
    """Get a specific compliance rule by ID"""
    try:
        rule = ComplianceRuleService.get_rule(session, rule_id)
        if not rule:
            raise HTTPException(status_code=404, detail="Compliance rule not found")
        
        return rule
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting compliance rule {rule_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=ComplianceRuleResponse)
async def create_compliance_rule(
    rule_data: ComplianceRuleCreate,
    created_by: Optional[str] = Query(None, description="User creating the rule"),
    session: Session = Depends(get_session)
):
    """Create a new compliance rule"""
    try:
        rule = ComplianceRuleService.create_rule(session, rule_data, created_by)
        return rule
        
    except Exception as e:
        logger.error(f"Error creating compliance rule: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{rule_id}", response_model=ComplianceRuleResponse)
async def update_compliance_rule(
    rule_id: int,
    rule_data: ComplianceRuleUpdate,
    updated_by: Optional[str] = Query(None, description="User updating the rule"),
    session: Session = Depends(get_session)
):
    """Update an existing compliance rule"""
    try:
        rule = ComplianceRuleService.update_rule(session, rule_id, rule_data, updated_by)
        if not rule:
            raise HTTPException(status_code=404, detail="Compliance rule not found")
        
        return rule
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating compliance rule {rule_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{rule_id}")
async def delete_compliance_rule(
    rule_id: int,
    session: Session = Depends(get_session)
):
    """Delete a compliance rule"""
    try:
        success = ComplianceRuleService.delete_rule(session, rule_id)
        if not success:
            raise HTTPException(status_code=404, detail="Compliance rule not found or cannot be deleted")
        
        return {"message": "Compliance rule deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting compliance rule {rule_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# **INTERCONNECTED: Framework and Template Operations**
@router.get("/frameworks", response_model=List[Dict[str, Any]])
async def get_frameworks():
    """Get available compliance frameworks"""
    try:
        frameworks = ComplianceRuleService.get_compliance_frameworks()
        return frameworks
        
    except Exception as e:
        logger.error(f"Error getting frameworks: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/templates", response_model=List[Dict[str, Any]])
async def get_templates():
    """Get all compliance rule templates"""
    try:
        frameworks = ComplianceRuleService.get_compliance_frameworks()
        all_templates = []
        
        for framework in frameworks:
            templates = framework.get("templates", [])
            for template in templates:
                template["framework"] = framework["id"]
                template["framework_name"] = framework["name"]
                all_templates.append(template)
        
        return all_templates
        
    except Exception as e:
        logger.error(f"Error getting templates: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/templates/by-framework/{framework}", response_model=List[Dict[str, Any]])
async def get_templates_by_framework(
    framework: str,
    session: Session = Depends(get_session)
):
    """Get templates for a specific framework"""
    try:
        templates = ComplianceRuleService.get_templates_by_framework(session, framework)
        return templates
        
    except Exception as e:
        logger.error(f"Error getting templates for framework {framework}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/from-template", response_model=ComplianceRuleResponse)
async def create_rule_from_template(
    template_data: Dict[str, Any] = Body(..., description="Template and customization data"),
    created_by: Optional[str] = Query(None, description="User creating the rule"),
    session: Session = Depends(get_session)
):
    """Create a compliance rule from a template"""
    try:
        template_id = template_data.get("template_id")
        customizations = template_data.get("customizations", {})
        
        if not template_id:
            raise HTTPException(status_code=400, detail="template_id is required")
        
        rule = ComplianceRuleService.create_rule_from_template(
            session=session,
            template_id=template_id,
            customizations=customizations,
            created_by=created_by
        )
        return rule
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating rule from template: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# **INTERCONNECTED: Data Source Integration**
@router.get("/data-sources", response_model=List[Dict[str, Any]])
async def get_applicable_data_sources(
    rule_type: Optional[ComplianceRuleType] = Query(None, description="Filter by rule type"),
    compliance_standard: Optional[str] = Query(None, description="Filter by compliance standard"),
    environment: Optional[str] = Query(None, description="Filter by environment"),
    data_classification: Optional[str] = Query(None, description="Filter by data classification"),
    session: Session = Depends(get_session)
):
    """Get data sources applicable for compliance rules"""
    try:
        # Convert string enums if provided
        env_enum = None
        if environment:
            from app.models.scan_models import Environment
            try:
                env_enum = Environment(environment)
            except ValueError:
                pass
        
        classification_enum = None
        if data_classification:
            from app.models.scan_models import DataClassification
            try:
                classification_enum = DataClassification(data_classification)
            except ValueError:
                pass
        
        data_sources = ComplianceRuleService.get_applicable_data_sources(
            session=session,
            rule_type=rule_type,
            compliance_standard=compliance_standard,
            environment=env_enum,
            data_classification=classification_enum
        )
        
        return data_sources
        
    except Exception as e:
        logger.error(f"Error getting applicable data sources: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# **INTERCONNECTED: Scan Rule Integration**
@router.get("/{rule_id}/scan-rules", response_model=List[Dict[str, Any]])
async def get_related_scan_rules(
    rule_id: int,
    session: Session = Depends(get_session)
):
    """Get scan rules related to a compliance rule"""
    try:
        scan_rules = ComplianceRuleService.get_related_scan_rules(session, rule_id)
        return scan_rules
        
    except Exception as e:
        logger.error(f"Error getting related scan rules for rule {rule_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# **INTERCONNECTED: Rule Evaluation and Testing**
@router.post("/{rule_id}/evaluate-with-sources", response_model=ComplianceRuleEvaluationResponse)
async def evaluate_rule_with_data_sources(
    rule_id: int,
    evaluation_params: Dict[str, Any] = Body(..., description="Evaluation parameters"),
    session: Session = Depends(get_session)
):
    """Evaluate a compliance rule with data sources and optional scan triggering"""
    try:
        data_source_ids = evaluation_params.get("data_source_ids")
        run_scans = evaluation_params.get("run_scans", False)
        include_performance_check = evaluation_params.get("include_performance_check", True)
        include_security_check = evaluation_params.get("include_security_check", True)
        
        evaluation = ComplianceRuleService.evaluate_rule_with_data_sources(
            session=session,
            rule_id=rule_id,
            data_source_ids=data_source_ids,
            run_scans=run_scans,
            include_performance_check=include_performance_check,
            include_security_check=include_security_check
        )
        
        return evaluation
        
    except Exception as e:
        logger.error(f"Error evaluating rule {rule_id} with data sources: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/test", response_model=Dict[str, Any])
async def test_rule(
    rule_data: Dict[str, Any] = Body(..., description="Rule data to test"),
    session: Session = Depends(get_session)
):
    """Test a compliance rule before creating it"""
    try:
        result = ComplianceRuleService.test_rule(session, rule_data)
        return result
        
    except Exception as e:
        logger.error(f"Error testing rule: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{rule_id}/validate", response_model=Dict[str, Any])
async def validate_rule(
    rule_id: int,
    session: Session = Depends(get_session)
):
    """Validate an existing compliance rule"""
    try:
        result = ComplianceRuleService.validate_rule(session, rule_id)
        return result
        
    except Exception as e:
        logger.error(f"Error validating rule {rule_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{rule_id}/evaluations", response_model=Dict[str, Any])
async def get_evaluation_history(
    rule_id: int,
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=100, description="Items per page"),
    session: Session = Depends(get_session)
):
    """Get evaluation history for a rule"""
    try:
        evaluations, total = ComplianceRuleService.get_evaluation_history(
            session=session,
            rule_id=rule_id,
            page=page,
            limit=limit
        )
        
        return {
            "data": evaluations,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
        
    except Exception as e:
        logger.error(f"Error getting evaluation history for rule {rule_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# **INTERCONNECTED: Issues Management**
@router.get("/issues", response_model=Dict[str, Any])
async def get_issues(
    rule_id: Optional[int] = Query(None, description="Filter by rule ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    severity: Optional[ComplianceRuleSeverity] = Query(None, description="Filter by severity"),
    assigned_to: Optional[str] = Query(None, description="Filter by assignee"),
    data_source_id: Optional[int] = Query(None, description="Filter by data source"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=100, description="Items per page"),
    session: Session = Depends(get_session)
):
    """Get compliance issues with filtering"""
    try:
        issues, total = ComplianceRuleService.get_issues(
            session=session,
            rule_id=rule_id,
            status=status,
            severity=severity,
            assigned_to=assigned_to,
            data_source_id=data_source_id,
            page=page,
            limit=limit
        )
        
        return {
            "data": issues,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
        
    except Exception as e:
        logger.error(f"Error getting compliance issues: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/issues", response_model=ComplianceIssueResponse)
async def create_issue(
    issue_data: ComplianceIssueCreate,
    session: Session = Depends(get_session)
):
    """Create a new compliance issue"""
    try:
        issue = ComplianceRuleService.create_issue(session, issue_data)
        return issue
        
    except Exception as e:
        logger.error(f"Error creating compliance issue: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/issues/{issue_id}", response_model=ComplianceIssueResponse)
async def update_issue(
    issue_id: int,
    issue_data: ComplianceIssueUpdate,
    session: Session = Depends(get_session)
):
    """Update an existing compliance issue"""
    try:
        issue = ComplianceRuleService.update_issue(session, issue_id, issue_data)
        if not issue:
            raise HTTPException(status_code=404, detail="Compliance issue not found")
        
        return issue
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating compliance issue {issue_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# **INTERCONNECTED: Workflows Management**
@router.get("/workflows", response_model=Dict[str, Any])
async def get_workflows(
    rule_id: Optional[int] = Query(None, description="Filter by rule ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    workflow_type: Optional[str] = Query(None, description="Filter by workflow type"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=100, description="Items per page"),
    session: Session = Depends(get_session)
):
    """Get compliance workflows with filtering"""
    try:
        # Convert status string to enum if provided
        status_enum = None
        if status:
            from app.models.compliance_rule_models import WorkflowStatus
            try:
                status_enum = WorkflowStatus(status)
            except ValueError:
                pass
        
        workflows, total = ComplianceRuleService.get_workflows(
            session=session,
            rule_id=rule_id,
            status=status_enum,
            workflow_type=workflow_type,
            page=page,
            limit=limit
        )
        
        return {
            "data": workflows,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
        
    except Exception as e:
        logger.error(f"Error getting compliance workflows: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/workflows", response_model=ComplianceWorkflowResponse)
async def create_workflow(
    workflow_data: ComplianceWorkflowCreate,
    session: Session = Depends(get_session)
):
    """Create a new compliance workflow"""
    try:
        workflow = ComplianceRuleService.create_workflow(session, workflow_data)
        return workflow
        
    except Exception as e:
        logger.error(f"Error creating compliance workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/workflows/{workflow_id}", response_model=ComplianceWorkflowResponse)
async def update_workflow(
    workflow_id: int,
    workflow_data: ComplianceWorkflowUpdate,
    session: Session = Depends(get_session)
):
    """Update an existing compliance workflow"""
    try:
        workflow = ComplianceRuleService.update_workflow(session, workflow_id, workflow_data)
        if not workflow:
            raise HTTPException(status_code=404, detail="Compliance workflow not found")
        
        return workflow
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating compliance workflow {workflow_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/workflows/{workflow_id}/execute", response_model=Dict[str, Any])
async def execute_workflow(
    workflow_id: int,
    execution_params: Optional[Dict[str, Any]] = Body(default=None, description="Execution parameters"),
    session: Session = Depends(get_session)
):
    """Execute a compliance workflow"""
    try:
        result = ComplianceRuleService.execute_workflow(session, workflow_id, execution_params)
        return result
        
    except Exception as e:
        logger.error(f"Error executing workflow {workflow_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# **INTERCONNECTED: Analytics and Insights**
@router.get("/analytics/dashboard", response_model=Dict[str, Any])
async def get_compliance_dashboard_analytics(
    data_source_id: Optional[int] = Query(None, description="Filter by data source"),
    time_range: str = Query("30d", description="Time range for analytics"),
    session: Session = Depends(get_session)
):
    """Get comprehensive compliance analytics for dashboard"""
    try:
        analytics = ComplianceRuleService.get_compliance_dashboard_analytics(
            session=session,
            data_source_id=data_source_id,
            time_range=time_range
        )
        return analytics
        
    except Exception as e:
        logger.error(f"Error getting compliance dashboard analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/integration/status", response_model=Dict[str, Any])
async def get_integration_status(
    session: Session = Depends(get_session)
):
    """Get status of compliance system integrations"""
    try:
        status = ComplianceRuleService.get_integration_status(session)
        return status
        
    except Exception as e:
        logger.error(f"Error getting integration status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# **INTERCONNECTED: Additional Utility Endpoints**
@router.get("/insights", response_model=List[Dict[str, Any]])
async def get_insights(
    rule_id: Optional[int] = Query(None, description="Filter by rule ID"),
    days: Optional[int] = Query(30, description="Number of days for insights"),
    session: Session = Depends(get_session)
):
    """Get compliance insights"""
    try:
        # This would integrate with analytics service in a real implementation
        insights = [
            {
                "id": "insight_1",
                "type": "performance",
                "title": "Rule Performance Optimization",
                "description": "Several rules are showing slow evaluation times",
                "severity": "medium",
                "created_at": datetime.now().isoformat()
            },
            {
                "id": "insight_2", 
                "type": "compliance",
                "title": "Framework Coverage Gap",
                "description": "GDPR coverage is below recommended threshold",
                "severity": "high",
                "created_at": datetime.now().isoformat()
            }
        ]
        
        return insights
        
    except Exception as e:
        logger.error(f"Error getting insights: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/trends", response_model=List[Dict[str, Any]])
async def get_trends(
    rule_id: Optional[int] = Query(None, description="Filter by rule ID"),
    days: Optional[int] = Query(30, description="Number of days for trends"),
    session: Session = Depends(get_session)
):
    """Get real compliance trends from evaluation data"""
    try:
        trends = ComplianceAnalyticsService.get_compliance_trends(
            session=session,
            rule_id=rule_id,
            days=days
        )
        
        return trends
        
    except Exception as e:
        logger.error(f"Error getting trends: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/statistics", response_model=Dict[str, Any])
async def get_statistics(
    session: Session = Depends(get_session)
):
    """Get comprehensive compliance statistics"""
    try:
        statistics = ComplianceAnalyticsService.get_dashboard_statistics(session)
        return statistics
        
    except Exception as e:
        logger.error(f"Error getting statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# **COMPREHENSIVE: Bulk Operations**
@router.post("/bulk-update", response_model=List[ComplianceRuleResponse])
async def bulk_update_requirements(
    updates: Dict[str, Any] = Body(..., description="Bulk update data"),
    session: Session = Depends(get_session)
):
    """Bulk update compliance requirements"""
    try:
        update_list = updates.get("updates", [])
        results = []
        
        for update_item in update_list:
            rule_id = update_item.get("id")
            rule_data = update_item.get("data", {})
            
            if rule_id and rule_data:
                # Convert dict to ComplianceRuleUpdate model
                from app.models.compliance_rule_models import ComplianceRuleUpdate
                update_model = ComplianceRuleUpdate(**rule_data)
                
                updated_rule = ComplianceRuleService.update_rule(session, rule_id, update_model)
                if updated_rule:
                    results.append(updated_rule)
        
        return results
        
    except Exception as e:
        logger.error(f"Error in bulk update: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/bulk-delete", response_model=Dict[str, Any])
async def bulk_delete_requirements(
    delete_data: Dict[str, Any] = Body(..., description="Bulk delete data"),
    session: Session = Depends(get_session)
):
    """Bulk delete compliance requirements"""
    try:
        ids = delete_data.get("ids", [])
        deleted_count = 0
        failed_ids = []
        
        for rule_id in ids:
            try:
                success = ComplianceRuleService.delete_rule(session, rule_id)
                if success:
                    deleted_count += 1
                else:
                    failed_ids.append(rule_id)
            except Exception as e:
                logger.warning(f"Failed to delete rule {rule_id}: {str(e)}")
                failed_ids.append(rule_id)
        
        return {
            "message": f"Successfully deleted {deleted_count} compliance rules",
            "deleted_count": deleted_count,
            "failed_ids": failed_ids,
            "total_requested": len(ids)
        }
        
    except Exception as e:
        logger.error(f"Error in bulk delete: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# **COMPREHENSIVE: Audit and History**
@router.get("/{rule_id}/history", response_model=List[Dict[str, Any]])
async def get_audit_history(
    rule_id: int,
    limit: int = Query(50, ge=1, le=100, description="Number of history items to return"),
    session: Session = Depends(get_session)
):
    """Get real audit history for a compliance rule"""
    try:
        # Verify rule exists
        rule = ComplianceRuleService.get_rule(session, rule_id)
        if not rule:
            raise HTTPException(status_code=404, detail="Compliance rule not found")
        
        history = ComplianceAuditService.get_audit_history(
            session=session,
            entity_type="rule",
            entity_id=rule_id,
            limit=limit
        )
        
        return history
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting audit history for rule {rule_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))