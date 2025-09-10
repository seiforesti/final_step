from sqlmodel import Session, select, func, and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from app.models.compliance_models import (
    ComplianceRequirement, ComplianceAssessment, ComplianceGap, ComplianceEvidence,
    ComplianceRequirementResponse, ComplianceAssessmentResponse, ComplianceGapResponse,
    ComplianceStatusResponse, ComplianceRequirementCreate, ComplianceAssessmentCreate,
    ComplianceGapCreate, ComplianceRequirementUpdate, ComplianceGapUpdate,
    ComplianceFramework, ComplianceStatus, AssessmentStatus
)
from app.models.scan_models import DataSource
import logging
import statistics

logger = logging.getLogger(__name__)


class ComplianceService:
    """Service layer for compliance management"""
    
    @staticmethod
    def get_compliance_status(session: Session, data_source_id: int) -> ComplianceStatusResponse:
        """Get comprehensive compliance status for a data source"""
        try:
            # Verify data source exists
            data_source = session.get(DataSource, data_source_id)
            if not data_source:
                raise ValueError(f"Data source {data_source_id} not found")
            
            # Get requirements
            requirements = ComplianceService.get_requirements(session, data_source_id)
            
            # Get recent assessments
            recent_assessments = ComplianceService.get_recent_assessments(session, data_source_id)
            
            # Get gaps
            gaps = ComplianceService.get_compliance_gaps(session, data_source_id)
            
            # Calculate overall score
            overall_score = ComplianceService._calculate_overall_score(requirements)
            
            # Get framework summary
            frameworks = ComplianceService._get_framework_summary(session, data_source_id)
            
            # Generate recommendations
            recommendations = ComplianceService._generate_recommendations(
                requirements, gaps, recent_assessments
            )
            
            # Get next assessment due
            next_assessment_due = ComplianceService._get_next_assessment_due(session, data_source_id)
            
            return ComplianceStatusResponse(
                overall_score=overall_score,
                frameworks=frameworks,
                requirements=requirements,
                recent_assessments=recent_assessments,
                gaps=gaps,
                recommendations=recommendations,
                next_assessment_due=next_assessment_due
            )
            
        except Exception as e:
            logger.error(f"Error getting compliance status for data source {data_source_id}: {str(e)}")
            raise
    
    @staticmethod
    def get_requirements(
        session: Session, 
        data_source_id: int,
        framework: Optional[ComplianceFramework] = None
    ) -> List[ComplianceRequirementResponse]:
        """Get compliance requirements for a data source"""
        try:
            query = select(ComplianceRequirement).where(
                ComplianceRequirement.data_source_id == data_source_id
            )
            
            if framework:
                query = query.where(ComplianceRequirement.framework == framework)
            
            requirements = session.execute(
                query.order_by(ComplianceRequirement.framework, ComplianceRequirement.category)
            ).all()
            
            return [ComplianceRequirementResponse.from_orm(req) for req in requirements]
            
        except Exception as e:
            logger.error(f"Error getting requirements for data source {data_source_id}: {str(e)}")
            return []
    
    @staticmethod
    def get_recent_assessments(
        session: Session, 
        data_source_id: int,
        limit: int = 10
    ) -> List[ComplianceAssessmentResponse]:
        """Get recent compliance assessments for a data source"""
        try:
            query = select(ComplianceAssessment).where(
                ComplianceAssessment.data_source_id == data_source_id
            ).order_by(ComplianceAssessment.created_at.desc()).limit(limit)
            
            assessments = session.execute(query).scalars().all()
            
            return [ComplianceAssessmentResponse.from_orm(assessment) for assessment in assessments]
            
        except Exception as e:
            logger.error(f"Error getting assessments for data source {data_source_id}: {str(e)}")
            return []
    
    @staticmethod
    def get_compliance_gaps(
        session: Session, 
        data_source_id: int,
        status: Optional[str] = None
    ) -> List[ComplianceGapResponse]:
        """Get compliance gaps for a data source"""
        try:
            query = select(ComplianceGap).where(
                ComplianceGap.data_source_id == data_source_id
            )
            
            if status:
                query = query.where(ComplianceGap.status == status)
            
            gaps = session.execute(
                query.order_by(ComplianceGap.severity.desc(), ComplianceGap.created_at.desc())
            ).all()
            
            return [ComplianceGapResponse.from_orm(gap) for gap in gaps]
            
        except Exception as e:
            logger.error(f"Error getting gaps for data source {data_source_id}: {str(e)}")
            return []
    
    @staticmethod
    def create_requirement(
        session: Session,
        req_data: ComplianceRequirementCreate,
        user_id: str
    ) -> ComplianceRequirementResponse:
        """Create a new compliance requirement"""
        try:
            # Verify data source exists
            data_source = session.get(DataSource, req_data.data_source_id)
            if not data_source:
                raise ValueError(f"Data source {req_data.data_source_id} not found")
            
            requirement = ComplianceRequirement(
                data_source_id=req_data.data_source_id,
                framework=req_data.framework,
                requirement_id=req_data.requirement_id,
                title=req_data.title,
                description=req_data.description,
                category=req_data.category,
                risk_level=req_data.risk_level,
                remediation_plan=req_data.remediation_plan,
                remediation_deadline=req_data.remediation_deadline,
                metadata=req_data.metadata
            )
            
            session.add(requirement)
            session.commit()
            session.refresh(requirement)
            
            return ComplianceRequirementResponse.from_orm(requirement)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating compliance requirement: {str(e)}")
            raise
    
    @staticmethod
    def update_requirement(
        session: Session,
        requirement_id: int,
        update_data: ComplianceRequirementUpdate,
        user_id: str
    ) -> ComplianceRequirementResponse:
        """Update a compliance requirement"""
        try:
            requirement = session.get(ComplianceRequirement, requirement_id)
            if not requirement:
                raise ValueError(f"Requirement {requirement_id} not found")
            
            # Update fields
            if update_data.status is not None:
                requirement.status = update_data.status
                requirement.last_assessed = datetime.now()
            
            if update_data.compliance_percentage is not None:
                requirement.compliance_percentage = update_data.compliance_percentage
            
            if update_data.assessment_notes is not None:
                requirement.assessment_notes = update_data.assessment_notes
            
            if update_data.remediation_plan is not None:
                requirement.remediation_plan = update_data.remediation_plan
            
            if update_data.remediation_deadline is not None:
                requirement.remediation_deadline = update_data.remediation_deadline
            
            if update_data.remediation_owner is not None:
                requirement.remediation_owner = update_data.remediation_owner
            
            requirement.updated_at = datetime.now()
            
            session.add(requirement)
            session.commit()
            session.refresh(requirement)
            
            return ComplianceRequirementResponse.from_orm(requirement)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error updating requirement {requirement_id}: {str(e)}")
            raise
    
    @staticmethod
    def start_assessment(
        session: Session,
        assessment_data: ComplianceAssessmentCreate,
        user_id: str
    ) -> ComplianceAssessmentResponse:
        """Start a new compliance assessment"""
        try:
            # Verify data source exists
            data_source = session.get(DataSource, assessment_data.data_source_id)
            if not data_source:
                raise ValueError(f"Data source {assessment_data.data_source_id} not found")
            
            assessment = ComplianceAssessment(
                data_source_id=assessment_data.data_source_id,
                framework=assessment_data.framework,
                assessment_type=assessment_data.assessment_type,
                title=assessment_data.title,
                description=assessment_data.description,
                scheduled_date=assessment_data.scheduled_date,
                assessor=assessment_data.assessor,
                status=AssessmentStatus.IN_PROGRESS,
                started_date=datetime.now()
            )
            
            session.add(assessment)
            session.commit()
            session.refresh(assessment)
            
            return ComplianceAssessmentResponse.from_orm(assessment)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error starting assessment: {str(e)}")
            raise
    
    @staticmethod
    def create_gap(
        session: Session,
        gap_data: ComplianceGapCreate,
        user_id: str
    ) -> ComplianceGapResponse:
        """Create a new compliance gap"""
        try:
            # Verify data source and requirement exist
            data_source = session.get(DataSource, gap_data.data_source_id)
            if not data_source:
                raise ValueError(f"Data source {gap_data.data_source_id} not found")
            
            requirement = session.get(ComplianceRequirement, gap_data.requirement_id)
            if not requirement:
                raise ValueError(f"Requirement {gap_data.requirement_id} not found")
            
            gap = ComplianceGap(
                data_source_id=gap_data.data_source_id,
                requirement_id=gap_data.requirement_id,
                gap_title=gap_data.gap_title,
                gap_description=gap_data.gap_description,
                severity=gap_data.severity,
                remediation_plan=gap_data.remediation_plan,
                assigned_to=gap_data.assigned_to,
                due_date=gap_data.due_date
            )
            
            session.add(gap)
            session.commit()
            session.refresh(gap)
            
            return ComplianceGapResponse.from_orm(gap)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating compliance gap: {str(e)}")
            raise
    
    @staticmethod
    def _calculate_overall_score(requirements: List[ComplianceRequirementResponse]) -> float:
        """Calculate overall compliance score"""
        if not requirements:
            return 0.0
        
        total_score = 0.0
        for req in requirements:
            if req.status == ComplianceStatus.COMPLIANT:
                total_score += 100
            elif req.status == ComplianceStatus.PARTIALLY_COMPLIANT:
                total_score += req.compliance_percentage
            elif req.status == ComplianceStatus.NON_COMPLIANT:
                total_score += 0
            else:  # NOT_ASSESSED or IN_PROGRESS
                total_score += 50  # Neutral score
        
        return total_score / len(requirements)
    
    @staticmethod
    def _get_framework_summary(session: Session, data_source_id: int) -> List[Dict[str, Any]]:
        """Get framework compliance summary"""
        try:
            # Get all requirements grouped by framework
            query = select(ComplianceRequirement).where(
                ComplianceRequirement.data_source_id == data_source_id
            )
            
            requirements = session.execute(query).scalars().all()
            
            frameworks = {}
            for req in requirements:
                if req.framework not in frameworks:
                    frameworks[req.framework] = {
                        "name": req.framework.value,
                        "display_name": req.framework.value.upper(),
                        "total_requirements": 0,
                        "compliant": 0,
                        "non_compliant": 0,
                        "partially_compliant": 0,
                        "not_assessed": 0,
                        "compliance_percentage": 0.0,
                        "last_assessment": None
                    }
                
                frameworks[req.framework]["total_requirements"] += 1
                
                if req.status == ComplianceStatus.COMPLIANT:
                    frameworks[req.framework]["compliant"] += 1
                elif req.status == ComplianceStatus.NON_COMPLIANT:
                    frameworks[req.framework]["non_compliant"] += 1
                elif req.status == ComplianceStatus.PARTIALLY_COMPLIANT:
                    frameworks[req.framework]["partially_compliant"] += 1
                else:
                    frameworks[req.framework]["not_assessed"] += 1
                
                # Track latest assessment
                if req.last_assessed:
                    if (not frameworks[req.framework]["last_assessment"] or 
                        req.last_assessed > frameworks[req.framework]["last_assessment"]):
                        frameworks[req.framework]["last_assessment"] = req.last_assessed
            
            # Calculate compliance percentages
            for framework in frameworks.values():
                if framework["total_requirements"] > 0:
                    framework["compliance_percentage"] = (
                        (framework["compliant"] + framework["partially_compliant"] * 0.5) / 
                        framework["total_requirements"]
                    ) * 100
            
            return list(frameworks.values())
            
        except Exception as e:
            logger.error(f"Error getting framework summary: {str(e)}")
            return []
    
    @staticmethod
    def _generate_recommendations(
        requirements: List[ComplianceRequirementResponse],
        gaps: List[ComplianceGapResponse],
        assessments: List[ComplianceAssessmentResponse]
    ) -> List[str]:
        """Generate compliance recommendations"""
        recommendations = []
        
        # Check for non-compliant requirements
        non_compliant = [r for r in requirements if r.status == ComplianceStatus.NON_COMPLIANT]
        if non_compliant:
            recommendations.append(f"Address {len(non_compliant)} non-compliant requirements")
        
        # Check for overdue remediation
        overdue = [
            r for r in requirements 
            if r.remediation_deadline and r.remediation_deadline < datetime.now()
        ]
        if overdue:
            recommendations.append(f"Complete {len(overdue)} overdue remediation tasks")
        
        # Check for open gaps
        open_gaps = [g for g in gaps if g.status == "open"]
        if open_gaps:
            recommendations.append(f"Resolve {len(open_gaps)} open compliance gaps")
        
        # Check for missing assessments
        not_assessed = [r for r in requirements if r.status == ComplianceStatus.NOT_ASSESSED]
        if not_assessed:
            recommendations.append(f"Complete assessments for {len(not_assessed)} requirements")
        
        # Check for outdated assessments
        outdated = [
            r for r in requirements 
            if r.last_assessed and r.last_assessed < datetime.now() - timedelta(days=365)
        ]
        if outdated:
            recommendations.append(f"Update {len(outdated)} outdated assessments")
        
        # Check for failed assessments
        failed_assessments = [a for a in assessments if a.status == AssessmentStatus.FAILED]
        if failed_assessments:
            recommendations.append("Review and address failed assessments")
        
        return recommendations
    
    @staticmethod
    def _get_next_assessment_due(session: Session, data_source_id: int) -> Optional[datetime]:
        """Get the next assessment due date"""
        try:
            query = select(ComplianceRequirement).where(
                and_(
                    ComplianceRequirement.data_source_id == data_source_id,
                    ComplianceRequirement.next_assessment.is_not(None)
                )
            ).order_by(ComplianceRequirement.next_assessment.asc()).limit(1)
            
            requirement = session.execute(query).scalars().first()
            return requirement.next_assessment if requirement else None
            
        except Exception as e:
            logger.error(f"Error getting next assessment due: {str(e)}")
            return None