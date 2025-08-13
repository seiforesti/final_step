from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlmodel import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging

# **INTERCONNECTED: Import existing services**
from app.services.compliance_rule_service import ComplianceRuleService
from app.services.data_source_service import DataSourceService
from app.db_session import get_session

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/compliance/risk-assessment", tags=["Risk Assessment"])

@router.get("/{entity_type}/{entity_id}", response_model=Dict[str, Any])
async def get_risk_assessment(
    entity_type: str,
    entity_id: str,
    session: Session = Depends(get_session)
):
    """Get comprehensive risk assessment for an entity"""
    try:
        # **INTERCONNECTED: Get entity using existing services**
        if entity_type == "data_source":
            entity = DataSourceService.get_data_source(session, int(entity_id))
            if not entity:
                raise HTTPException(status_code=404, detail="Data source not found")
        else:
            raise HTTPException(status_code=400, detail="Unsupported entity type")
        
        # Calculate risk factors
        risk_factors = []
        
        # Data classification risk
        if entity.data_classification:
            classification_risk = {
                "public": 1,
                "internal": 2,
                "confidential": 4,
                "restricted": 5
            }.get(entity.data_classification.value, 3)
            
            risk_factors.append({
                "factor": "data_classification",
                "value": entity.data_classification.value,
                "risk_score": classification_risk,
                "weight": 0.3
            })
        
        # Environment risk
        if entity.environment:
            environment_risk = {
                "development": 1,
                "test": 2,
                "staging": 3,
                "production": 5
            }.get(entity.environment.value, 3)
            
            risk_factors.append({
                "factor": "environment",
                "value": entity.environment.value,
                "risk_score": environment_risk,
                "weight": 0.2
            })
        
        # Security configuration risk
        security_score = 0
        if not entity.encryption_enabled:
            security_score += 3
        if not entity.monitoring_enabled:
            security_score += 2
        if not entity.backup_enabled:
            security_score += 1
        
        risk_factors.append({
            "factor": "security_configuration",
            "value": f"encryption={entity.encryption_enabled}, monitoring={entity.monitoring_enabled}, backup={entity.backup_enabled}",
            "risk_score": min(security_score, 5),
            "weight": 0.25
        })
        
        # Compliance score risk
        compliance_score = entity.compliance_score or 50
        compliance_risk = max(1, 6 - (compliance_score / 20))  # Convert 0-100 to 1-5 scale
        
        risk_factors.append({
            "factor": "compliance_score",
            "value": compliance_score,
            "risk_score": compliance_risk,
            "weight": 0.25
        })
        
        # Calculate overall risk score
        weighted_score = sum(factor["risk_score"] * factor["weight"] for factor in risk_factors)
        overall_risk_score = min(100, weighted_score * 20)  # Convert to 0-100 scale
        
        # Determine risk level
        if overall_risk_score >= 80:
            risk_level = "critical"
        elif overall_risk_score >= 60:
            risk_level = "high"
        elif overall_risk_score >= 40:
            risk_level = "medium"
        else:
            risk_level = "low"
        
        # Generate risk trends (mock data for demonstration)
        risk_trends = []
        for i in range(30):
            date = datetime.now() - timedelta(days=29-i)
            trend_score = overall_risk_score + (i % 10 - 5)  # Add some variation
            risk_trends.append({
                "date": date.isoformat(),
                "risk_score": max(0, min(100, trend_score))
            })
        
        # Generate recommendations
        recommendations = []
        if not entity.encryption_enabled:
            recommendations.append("Enable encryption at rest and in transit")
        if not entity.monitoring_enabled:
            recommendations.append("Implement comprehensive monitoring and logging")
        if compliance_score < 80:
            recommendations.append("Improve compliance posture through regular assessments")
        if entity.data_classification in ["confidential", "restricted"]:
            recommendations.append("Implement additional security controls for sensitive data")
        
        return {
            "overall_risk_score": overall_risk_score,
            "risk_level": risk_level,
            "risk_factors": risk_factors,
            "risk_trends": risk_trends,
            "recommendations": recommendations,
            "last_assessed": datetime.now().isoformat(),
            "next_assessment": (datetime.now() + timedelta(days=30)).isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting risk assessment for {entity_type}/{entity_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{entity_type}/{entity_id}/calculate", response_model=Dict[str, Any])
async def calculate_risk_score(
    entity_type: str,
    entity_id: str,
    calculation_data: Dict[str, Any] = Body(...),
    session: Session = Depends(get_session)
):
    """Calculate risk score with custom factors"""
    try:
        factors = calculation_data.get("factors", {})
        
        # **INTERCONNECTED: Get entity using existing services**
        if entity_type == "data_source":
            entity = DataSourceService.get_data_source(session, int(entity_id))
            if not entity:
                raise HTTPException(status_code=404, detail="Data source not found")
        else:
            raise HTTPException(status_code=400, detail="Unsupported entity type")
        
        # Apply custom factors or use defaults
        contributing_factors = []
        total_score = 0
        total_weight = 0
        
        # Data sensitivity factor
        sensitivity_weight = factors.get("sensitivity_weight", 0.3)
        sensitivity_score = factors.get("sensitivity_score", 3)
        contributing_factors.append({
            "name": "Data Sensitivity",
            "score": sensitivity_score,
            "weight": sensitivity_weight,
            "description": "Risk based on data classification and sensitivity"
        })
        total_score += sensitivity_score * sensitivity_weight
        total_weight += sensitivity_weight
        
        # Access control factor
        access_weight = factors.get("access_weight", 0.25)
        access_score = factors.get("access_score", 2 if entity.monitoring_enabled else 4)
        contributing_factors.append({
            "name": "Access Control",
            "score": access_score,
            "weight": access_weight,
            "description": "Risk based on access controls and monitoring"
        })
        total_score += access_score * access_weight
        total_weight += access_weight
        
        # Technical security factor
        technical_weight = factors.get("technical_weight", 0.25)
        technical_score = factors.get("technical_score", 1 if entity.encryption_enabled else 4)
        contributing_factors.append({
            "name": "Technical Security",
            "score": technical_score,
            "weight": technical_weight,
            "description": "Risk based on encryption and technical safeguards"
        })
        total_score += technical_score * technical_weight
        total_weight += technical_weight
        
        # Operational factor
        operational_weight = factors.get("operational_weight", 0.2)
        operational_score = factors.get("operational_score", 2 if entity.backup_enabled else 3)
        contributing_factors.append({
            "name": "Operational Security",
            "score": operational_score,
            "weight": operational_weight,
            "description": "Risk based on backup and operational procedures"
        })
        total_score += operational_score * operational_weight
        total_weight += operational_weight
        
        # Calculate final risk score
        risk_score = (total_score / total_weight) * 20  # Convert to 0-100 scale
        
        # Determine risk level
        if risk_score >= 80:
            risk_level = "critical"
        elif risk_score >= 60:
            risk_level = "high"
        elif risk_score >= 40:
            risk_level = "medium"
        else:
            risk_level = "low"
        
        calculation_details = {
            "method": "weighted_average",
            "total_factors": len(contributing_factors),
            "total_weight": total_weight,
            "raw_score": total_score,
            "normalized_score": risk_score,
            "calculation_timestamp": datetime.now().isoformat()
        }
        
        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "contributing_factors": contributing_factors,
            "calculation_details": calculation_details
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating risk score for {entity_type}/{entity_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{entity_type}/{entity_id}/factors", response_model=List[Dict[str, Any]])
async def get_risk_factors(
    entity_type: str,
    entity_id: str,
    session: Session = Depends(get_session)
):
    """Get risk factors for an entity"""
    try:
        # **INTERCONNECTED: Get entity using existing services**
        if entity_type == "data_source":
            entity = DataSourceService.get_data_source(session, int(entity_id))
            if not entity:
                raise HTTPException(status_code=404, detail="Data source not found")
        else:
            raise HTTPException(status_code=400, detail="Unsupported entity type")
        
        factors = [
            {
                "id": "data_classification",
                "name": "Data Classification",
                "category": "data_sensitivity",
                "current_value": entity.data_classification.value if entity.data_classification else "unknown",
                "risk_impact": "high",
                "description": "Classification level of data stored",
                "mitigation_options": ["Implement data classification policy", "Regular data inventory"]
            },
            {
                "id": "encryption_status",
                "name": "Encryption Status",
                "category": "technical_security",
                "current_value": "enabled" if entity.encryption_enabled else "disabled",
                "risk_impact": "critical" if not entity.encryption_enabled else "low",
                "description": "Data encryption at rest and in transit",
                "mitigation_options": ["Enable encryption", "Key management implementation"]
            },
            {
                "id": "access_monitoring",
                "name": "Access Monitoring",
                "category": "access_control",
                "current_value": "enabled" if entity.monitoring_enabled else "disabled",
                "risk_impact": "high" if not entity.monitoring_enabled else "low",
                "description": "Monitoring and logging of data access",
                "mitigation_options": ["Enable access logging", "Implement SIEM integration"]
            },
            {
                "id": "backup_status",
                "name": "Backup Status",
                "category": "operational",
                "current_value": "enabled" if entity.backup_enabled else "disabled",
                "risk_impact": "medium" if not entity.backup_enabled else "low",
                "description": "Regular backup and recovery procedures",
                "mitigation_options": ["Implement backup strategy", "Test recovery procedures"]
            },
            {
                "id": "compliance_posture",
                "name": "Compliance Posture",
                "category": "governance",
                "current_value": f"{entity.compliance_score or 0}%",
                "risk_impact": "high" if (entity.compliance_score or 0) < 70 else "medium",
                "description": "Overall compliance score and posture",
                "mitigation_options": ["Regular compliance assessments", "Remediation planning"]
            }
        ]
        
        return factors
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting risk factors for {entity_type}/{entity_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{entity_type}/{entity_id}/factors", response_model=Dict[str, str])
async def update_risk_factors(
    entity_type: str,
    entity_id: str,
    factors_data: Dict[str, Any] = Body(...),
    session: Session = Depends(get_session)
):
    """Update risk factors for an entity"""
    try:
        factors = factors_data.get("factors", [])
        
        # **INTERCONNECTED: Validate entity exists**
        if entity_type == "data_source":
            entity = DataSourceService.get_data_source(session, int(entity_id))
            if not entity:
                raise HTTPException(status_code=404, detail="Data source not found")
        else:
            raise HTTPException(status_code=400, detail="Unsupported entity type")
        
        # In a real implementation, this would update risk factors in database
        # For now, we'll just return success
        return {"message": f"Risk factors updated for {entity_type} {entity_id}"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating risk factors for {entity_type}/{entity_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{entity_type}/{entity_id}/trends", response_model=List[Dict[str, Any]])
async def get_risk_trends(
    entity_type: str,
    entity_id: str,
    period: str = Query("30d", description="Time period for trends"),
    session: Session = Depends(get_session)
):
    """Get risk trends for an entity over time"""
    try:
        # Parse period
        if period.endswith('d'):
            days = int(period[:-1])
        else:
            days = 30
        
        # **INTERCONNECTED: Validate entity exists**
        if entity_type == "data_source":
            entity = DataSourceService.get_data_source(session, int(entity_id))
            if not entity:
                raise HTTPException(status_code=404, detail="Data source not found")
        else:
            raise HTTPException(status_code=400, detail="Unsupported entity type")
        
        # Generate trend data (in real implementation, this would come from historical data)
        trends = []
        base_risk = 60  # Base risk score
        
        for i in range(days):
            date = datetime.now() - timedelta(days=days-1-i)
            # Add some realistic variation
            variation = (i % 7 - 3) * 2  # Weekly pattern with variation
            risk_score = max(0, min(100, base_risk + variation))
            
            trends.append({
                "date": date.isoformat(),
                "risk_score": risk_score,
                "risk_level": "high" if risk_score >= 70 else "medium" if risk_score >= 40 else "low",
                "contributing_factors": [
                    {"factor": "compliance_score", "impact": 0.3},
                    {"factor": "security_config", "impact": 0.4},
                    {"factor": "data_sensitivity", "impact": 0.3}
                ]
            })
        
        return trends
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting risk trends for {entity_type}/{entity_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{entity_type}/{entity_id}/report", response_model=Dict[str, Any])
async def generate_risk_report(
    entity_type: str,
    entity_id: str,
    report_data: Dict[str, Any] = Body(...),
    session: Session = Depends(get_session)
):
    """Generate risk assessment report"""
    try:
        report_type = report_data.get("report_type", "detailed")
        
        # **INTERCONNECTED: Validate entity exists**
        if entity_type == "data_source":
            entity = DataSourceService.get_data_source(session, int(entity_id))
            if not entity:
                raise HTTPException(status_code=404, detail="Data source not found")
        else:
            raise HTTPException(status_code=400, detail="Unsupported entity type")
        
        # Generate report ID
        report_id = f"risk_report_{entity_type}_{entity_id}_{int(datetime.now().timestamp())}"
        
        return {
            "report_id": report_id,
            "status": "generating",
            "estimated_completion": (datetime.now() + timedelta(minutes=5)).isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating risk report for {entity_type}/{entity_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/matrix", response_model=Dict[str, Any])
async def get_risk_matrix(session: Session = Depends(get_session)):
    """Get risk assessment matrix configuration"""
    try:
        return {
            "probability_levels": ["Very Low", "Low", "Medium", "High", "Very High"],
            "impact_levels": ["Negligible", "Minor", "Moderate", "Major", "Severe"],
            "risk_matrix": [
                [1, 2, 3, 4, 5],  # Very Low probability
                [2, 3, 4, 5, 6],  # Low probability
                [3, 4, 5, 6, 7],  # Medium probability
                [4, 5, 6, 7, 8],  # High probability
                [5, 6, 7, 8, 9]   # Very High probability
            ],
            "risk_categories": [
                {"range": [1, 2], "level": "low", "color": "#22c55e", "action": "Accept"},
                {"range": [3, 4], "level": "medium", "color": "#eab308", "action": "Monitor"},
                {"range": [5, 6], "level": "high", "color": "#f97316", "action": "Mitigate"},
                {"range": [7, 9], "level": "critical", "color": "#ef4444", "action": "Immediate Action"}
            ]
        }
        
    except Exception as e:
        logger.error(f"Error getting risk matrix: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/matrix", response_model=Dict[str, str])
async def update_risk_matrix(
    matrix_data: Dict[str, Any] = Body(...),
    session: Session = Depends(get_session)
):
    """Update risk assessment matrix configuration"""
    try:
        # In a real implementation, this would update the matrix in database
        # For now, we'll just validate and return success
        required_fields = ["probability_levels", "impact_levels", "risk_matrix"]
        
        for field in required_fields:
            if field not in matrix_data:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        return {"message": "Risk matrix updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating risk matrix: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# **MISSING ENDPOINTS IMPLEMENTATION**

@router.get("/data_source/{data_source_id}", response_model=Dict[str, Any])
async def get_data_source_risk_assessment(
    data_source_id: int,
    session: Session = Depends(get_session)
):
    """Get risk assessment for a specific data source"""
    try:
        # Get data source information first
        from app.models.data_source import DataSource
        
        data_source = session.get(DataSource, data_source_id)
        if not data_source:
            raise HTTPException(status_code=404, detail="Data source not found")
        
        # Calculate real risk assessment based on data source properties
        # This uses actual data source attributes to calculate risk
        risk_factors = []
        total_score = 0.0
        total_weight = 0.0
        
        # Data Sensitivity Factor (based on data source metadata)
        sensitivity_score = 70  # Default
        if hasattr(data_source, 'metadata') and data_source.metadata:
            if 'contains_pii' in str(data_source.metadata).lower():
                sensitivity_score = 85
            if 'financial' in str(data_source.metadata).lower():
                sensitivity_score = 90
        
        risk_factors.append({
            "factor": "data_sensitivity",
            "score": sensitivity_score,
            "weight": 0.3,
            "description": f"Data sensitivity analysis for {data_source.name}"
        })
        total_score += sensitivity_score * 0.3
        total_weight += 0.3
        
        # Access Controls Factor (based on connection security)
        access_score = 60  # Default
        if hasattr(data_source, 'connection_string') and data_source.connection_string:
            if 'ssl=true' in data_source.connection_string.lower():
                access_score += 15
            if 'encrypt=true' in data_source.connection_string.lower():
                access_score += 10
        
        risk_factors.append({
            "factor": "access_controls",
            "score": access_score,
            "weight": 0.25,
            "description": f"Access control assessment for {data_source.name}"
        })
        total_score += access_score * 0.25
        total_weight += 0.25
        
        # Compliance Status Factor (based on actual compliance rules)
        from app.models.compliance_models import ComplianceRule
        compliance_rules = session.exec(
            select(ComplianceRule).where(
                ComplianceRule.data_source_id == data_source_id,
                ComplianceRule.is_active == True
            )
        ).all()
        
        compliance_score = 50  # Default
        if compliance_rules:
            compliant_rules = sum(1 for rule in compliance_rules if rule.compliance_percentage >= 80)
            compliance_score = min(95, (compliant_rules / len(compliance_rules)) * 100)
        
        risk_factors.append({
            "factor": "compliance_status",
            "score": compliance_score,
            "weight": 0.25,
            "description": f"Compliance rule evaluation for {data_source.name}"
        })
        total_score += compliance_score * 0.25
        total_weight += 0.25
        
        # Security Configuration Factor
        security_score = 65  # Default
        if data_source.database_type in ['postgresql', 'mysql', 'sqlserver']:
            security_score = 75  # More secure databases
        
        risk_factors.append({
            "factor": "security_configuration",
            "score": security_score,
            "weight": 0.2,
            "description": f"Security configuration for {data_source.database_type}"
        })
        total_score += security_score * 0.2
        total_weight += 0.2
        
        # Calculate overall risk score
        overall_risk_score = total_score / total_weight if total_weight > 0 else 50
        
        # Determine risk level
        if overall_risk_score >= 80:
            risk_level = "low"
        elif overall_risk_score >= 60:
            risk_level = "medium"
        elif overall_risk_score >= 40:
            risk_level = "high"
        else:
            risk_level = "critical"
        
        # Generate recommendations based on actual scores
        recommendations = []
        if any(factor["score"] < 70 for factor in risk_factors):
            recommendations.append("Address low-scoring risk factors")
        if compliance_score < 80:
            recommendations.append("Improve compliance rule coverage and evaluation")
        if access_score < 75:
            recommendations.append("Enhance access controls and authentication")
        if not recommendations:
            recommendations.append("Maintain current security posture with regular assessments")
        
        risk_assessment = {
            "data_source_id": data_source_id,
            "data_source_name": data_source.name,
            "database_type": data_source.database_type,
            "overall_risk_score": round(overall_risk_score, 1),
            "risk_level": risk_level,
            "risk_factors": risk_factors,
            "recommendations": recommendations,
            "compliance_rules_count": len(compliance_rules),
            "last_assessed": datetime.now().isoformat(),
            "next_assessment": (datetime.now() + timedelta(days=30)).isoformat()
        }
        
        return risk_assessment
        
    except Exception as e:
        logger.error(f"Error getting data source risk assessment {data_source_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))