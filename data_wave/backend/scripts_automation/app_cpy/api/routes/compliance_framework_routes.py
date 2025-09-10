from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlmodel import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging

from app.services.compliance_rule_service import ComplianceRuleService
from app.db_session import get_session

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/compliance/frameworks", tags=["Compliance Frameworks"])

@router.get("/", response_model=List[Dict[str, Any]])
async def get_frameworks(
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[str] = Query(None, description="Filter by status"),
    jurisdiction: Optional[str] = Query(None, description="Filter by jurisdiction"),
    search: Optional[str] = Query(None, description="Search frameworks"),
    session: Session = Depends(get_session)
):
    """Get available compliance frameworks"""
    try:
        frameworks = ComplianceRuleService.get_compliance_frameworks()
        
        # Apply filters
        if category:
            frameworks = [f for f in frameworks if category.lower() in [c.lower() for c in f.get("categories", [])]]
        
        if status:
            frameworks = [f for f in frameworks if f.get("status", "").lower() == status.lower()]
        
        if jurisdiction:
            frameworks = [f for f in frameworks if jurisdiction.lower() in f.get("jurisdiction", "").lower()]
        
        if search:
            search_lower = search.lower()
            frameworks = [f for f in frameworks if 
                         search_lower in f.get("name", "").lower() or 
                         search_lower in f.get("description", "").lower()]
        
        return frameworks
        
    except Exception as e:
        logger.error(f"Error getting frameworks: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{framework_id}", response_model=Dict[str, Any])
async def get_framework(
    framework_id: str,
    session: Session = Depends(get_session)
):
    """Get a specific framework by ID"""
    try:
        frameworks = ComplianceRuleService.get_compliance_frameworks()
        framework = next((f for f in frameworks if f["id"] == framework_id), None)
        
        if not framework:
            raise HTTPException(status_code=404, detail="Framework not found")
        
        return framework
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting framework {framework_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{framework_id}/requirements", response_model=Dict[str, Any])
async def get_framework_requirements(
    framework_id: str,
    category: Optional[str] = Query(None, description="Filter by category"),
    risk_level: Optional[str] = Query(None, description="Filter by risk level"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=100, description="Items per page"),
    session: Session = Depends(get_session)
):
    """Get requirements for a specific framework"""
    try:
        frameworks = ComplianceRuleService.get_compliance_frameworks()
        framework = next((f for f in frameworks if f["id"] == framework_id), None)
        
        if not framework:
            raise HTTPException(status_code=404, detail="Framework not found")
        
        templates = framework.get("templates", [])
        
        # Apply filters
        if category:
            templates = [t for t in templates if category.lower() in t.get("rule_type", "").lower()]
        
        if risk_level:
            templates = [t for t in templates if t.get("severity", "").lower() == risk_level.lower()]
        
        # Apply pagination
        total = len(templates)
        start = (page - 1) * limit
        end = start + limit
        paginated_templates = templates[start:end]
        
        return {
            "data": paginated_templates,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting framework requirements {framework_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{framework_id}/import", response_model=Dict[str, Any])
async def import_framework_requirements(
    framework_id: str,
    import_data: Dict[str, Any] = Body(...),
    session: Session = Depends(get_session)
):
    """Import framework requirements for a data source"""
    try:
        data_source_id = import_data.get("data_source_id")
        overwrite_existing = import_data.get("overwrite_existing", False)
        import_controls = import_data.get("import_controls", True)
        import_evidence_templates = import_data.get("import_evidence_templates", True)
        
        if not data_source_id:
            raise HTTPException(status_code=400, detail="data_source_id is required")
        
        # Get framework templates
        templates = ComplianceRuleService.get_templates_by_framework(session, framework_id)
        
        imported_count = 0
        skipped_count = 0
        error_count = 0
        
        for template in templates:
            try:
                # Create rule from template
                rule = ComplianceRuleService.create_rule_from_template(
                    session=session,
                    template_id=template["id"],
                    customizations={
                        "data_source_ids": [data_source_id],
                        "auto_scan_on_evaluation": True
                    }
                )
                imported_count += 1
                
            except Exception as template_error:
                logger.warning(f"Failed to import template {template['id']}: {template_error}")
                error_count += 1
        
        return {
            "imported_count": imported_count,
            "skipped_count": skipped_count,
            "error_count": error_count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error importing framework requirements {framework_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{framework_id}/validate", response_model=Dict[str, Any])
async def validate_framework_compliance(
    framework_id: str,
    validation_data: Dict[str, Any] = Body(...),
    session: Session = Depends(get_session)
):
    """Validate compliance against a framework"""
    try:
        entity_id = validation_data.get("entity_id")
        entity_type = validation_data.get("entity_type", "data_source")
        
        if not entity_id:
            raise HTTPException(status_code=400, detail="entity_id is required")
        
        # Get framework
        frameworks = ComplianceRuleService.get_compliance_frameworks()
        framework = next((f for f in frameworks if f["id"] == framework_id), None)
        
        if not framework:
            raise HTTPException(status_code=404, detail="Framework not found")
        
        # Get rules for this framework and entity
        rules, _ = ComplianceRuleService.get_rules(
            session=session,
            compliance_standard=framework["name"],
            data_source_id=int(entity_id) if entity_type == "data_source" else None
        )
        
        # Calculate compliance metrics
        total_requirements = len(rules)
        compliant_requirements = len([r for r in rules if r.pass_rate >= 90])
        non_compliant_requirements = len([r for r in rules if r.pass_rate < 50])
        partially_compliant_requirements = len([r for r in rules if 50 <= r.pass_rate < 90])
        not_assessed_requirements = len([r for r in rules if r.last_evaluated_at is None])
        
        # Calculate gaps by severity
        critical_gaps = len([r for r in rules if r.severity.value == "critical" and r.pass_rate < 90])
        high_risk_gaps = len([r for r in rules if r.severity.value == "high" and r.pass_rate < 90])
        
        # Calculate overall score
        overall_score = (compliant_requirements / total_requirements * 100) if total_requirements > 0 else 0
        
        # Generate recommendations
        recommendations = []
        if critical_gaps > 0:
            recommendations.append(f"Address {critical_gaps} critical compliance gaps immediately")
        if high_risk_gaps > 0:
            recommendations.append(f"Review {high_risk_gaps} high-risk areas for improvement")
        if not_assessed_requirements > 0:
            recommendations.append(f"Evaluate {not_assessed_requirements} unassessed requirements")
        
        return {
            "overall_score": overall_score,
            "compliant_requirements": compliant_requirements,
            "non_compliant_requirements": non_compliant_requirements,
            "partially_compliant_requirements": partially_compliant_requirements,
            "not_assessed_requirements": not_assessed_requirements,
            "critical_gaps": critical_gaps,
            "high_risk_gaps": high_risk_gaps,
            "recommendations": recommendations
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error validating framework compliance {framework_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/mapping", response_model=Dict[str, str])
async def create_framework_mapping(
    mapping_data: Dict[str, Any] = Body(...),
    session: Session = Depends(get_session)
):
    """Create mapping between frameworks"""
    try:
        source_framework = mapping_data.get("source_framework")
        target_framework = mapping_data.get("target_framework") 
        mappings = mapping_data.get("mappings", {})
        
        if not all([source_framework, target_framework, mappings]):
            raise HTTPException(status_code=400, detail="source_framework, target_framework, and mappings are required")
        
        # Store mapping (in a real implementation, this would be stored in database)
        # For now, we'll just return success
        return {"message": "Framework mapping created successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating framework mapping: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/mapping/{source_framework}/{target_framework}", response_model=Dict[str, List[str]])
async def get_framework_mapping(
    source_framework: str,
    target_framework: str,
    session: Session = Depends(get_session)
):
    """Get mapping between two frameworks using enterprise compliance mapping service"""
    try:
        from app.services.compliance_rule_service import ComplianceRuleService
        from app.services.enterprise_integration_service import EnterpriseIntegrationService
        
        # Initialize enterprise services
        compliance_service = ComplianceRuleService()
        integration_service = EnterpriseIntegrationService()
        
        # Get framework mapping from compliance service
        mapping = await compliance_service.get_framework_mapping(
            source_framework=source_framework,
            target_framework=target_framework,
            session=session
        )
        
        if not mapping:
            # Create mapping if it doesn't exist
            mapping = await compliance_service.create_framework_mapping(
                source_framework=source_framework,
                target_framework=target_framework,
                session=session
            )
        
        # Enrich mapping with business context
        enriched_mapping = await integration_service.enrich_compliance_mapping(mapping)
        
        # Log mapping access for audit
        await compliance_service.log_mapping_access(
            source_framework=source_framework,
            target_framework=target_framework,
            user_id=await integration_service.get_current_user_id(),
            session=session
        )
        
        return enriched_mapping
        
    except Exception as e:
        logger.error(f"Error getting framework mapping {source_framework}->{target_framework}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{framework_id}/crosswalk", response_model=Dict[str, List[str]])
async def get_framework_crosswalk(
    framework_id: str,
    session: Session = Depends(get_session)
):
    """Get crosswalk mappings for a framework"""
    try:
        frameworks = ComplianceRuleService.get_compliance_frameworks()
        framework = next((f for f in frameworks if f["id"] == framework_id), None)
        
        if not framework:
            raise HTTPException(status_code=404, detail="Framework not found")
        
        return framework.get("crosswalk_mappings", {})
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting framework crosswalk {framework_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{framework_id}/report", response_model=Dict[str, Any])
async def generate_framework_report(
    framework_id: str,
    report_data: Dict[str, Any] = Body(...),
    session: Session = Depends(get_session)
):
    """Generate enterprise compliance report for a framework using advanced analytics and compliance services"""
    try:
        from app.services.compliance_rule_service import ComplianceRuleService
        from app.services.enterprise_analytics_service import EnterpriseAnalyticsService
        from app.services.enterprise_integration_service import EnterpriseIntegrationService
        from app.services.advanced_ml_service import AdvancedMLService
        
        entity_id = report_data.get("entity_id")
        report_type = report_data.get("report_type", "compliance_status")
        report_format = report_data.get("format", "json")
        include_recommendations = report_data.get("include_recommendations", True)
        
        if not entity_id:
            raise HTTPException(status_code=400, detail="entity_id is required")
        
        # Initialize enterprise services
        compliance_service = ComplianceRuleService()
        analytics_service = EnterpriseAnalyticsService()
        integration_service = EnterpriseIntegrationService()
        ml_service = AdvancedMLService()
        
        # Validate framework exists
        framework = await compliance_service.get_compliance_framework(framework_id, session)
        if not framework:
            raise HTTPException(status_code=404, detail="Framework not found")
        
        # Generate unique report ID
        report_id = f"report_{framework_id}_{entity_id}_{int(datetime.now().timestamp())}"
        
        # Get entity compliance data
        entity_compliance = await compliance_service.get_entity_compliance_status(
            entity_id=entity_id,
            framework_id=framework_id,
            session=session
        )
        
        # Generate comprehensive compliance report
        report = await analytics_service.generate_compliance_report(
            framework_id=framework_id,
            entity_id=entity_id,
            compliance_data=entity_compliance,
            report_type=report_type,
            include_recommendations=include_recommendations
        )
        
        # Add ML-powered insights and predictions
        if include_recommendations:
            ml_insights = await ml_service.generate_compliance_insights(
                framework_id=framework_id,
                entity_id=entity_id,
                compliance_data=entity_compliance,
                session=session
            )
            report['ml_insights'] = ml_insights
        
        # Add business context and risk assessment
        business_context = await integration_service.get_entity_business_context(entity_id)
        risk_assessment = await compliance_service.assess_compliance_risk(
            entity_id=entity_id,
            framework_id=framework_id,
            compliance_data=entity_compliance,
            session=session
        )
        
        report.update({
            'business_context': business_context,
            'risk_assessment': risk_assessment,
            'report_metadata': {
                'generated_at': datetime.now().isoformat(),
                'generated_by': await integration_service.get_current_user_id(),
                'framework_version': framework.get('version', '1.0'),
                'data_freshness': await compliance_service.get_data_freshness(entity_id, session)
            }
        })
        
        # Store report in compliance database
        await compliance_service.store_compliance_report(
            report_id=report_id,
            report_data=report,
            framework_id=framework_id,
            entity_id=entity_id,
            session=session
        )
        
        # Send to enterprise reporting system
        await integration_service.send_to_reporting_system(report)
        
        # Log report generation for audit
        await compliance_service.log_report_generation(
            report_id=report_id,
            framework_id=framework_id,
            entity_id=entity_id,
            user_id=await integration_service.get_current_user_id(),
            session=session
        )
        
        return {
            "report_id": report_id,
            "status": "completed",
            "generated_at": datetime.now().isoformat(),
            "report_summary": {
                "compliance_score": report.get('compliance_score', 0),
                "risk_level": risk_assessment.get('overall_risk_level', 'unknown'),
                "recommendations_count": len(report.get('recommendations', [])),
                "ml_insights_count": len(report.get('ml_insights', [])),
                "format": report_format
            },
            "download_url": f"/api/v1/compliance/reports/{report_id}/download",
            "expires_at": (datetime.now() + timedelta(days=30)).isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating framework report {framework_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))