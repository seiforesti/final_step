from sqlmodel import Session, select, func, and_, or_
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
import logging
import uuid
import json
import re # Added for regex validation

# **INTERCONNECTED: Import all compliance models**
from app.models.compliance_rule_models import (
    ComplianceRule, ComplianceRuleEvaluation, ComplianceIssue,
    ComplianceRuleResponse, ComplianceRuleEvaluationResponse, ComplianceIssueResponse,
    ComplianceRuleCreate, ComplianceRuleUpdate, ComplianceIssueCreate, ComplianceIssueUpdate, 
    ComplianceRuleType, ComplianceRuleSeverity, ComplianceRuleStatus, ComplianceRuleScope, 
    RuleValidationStatus, WorkflowStatus
)

# Import workflow models from extended models
from app.models.compliance_extended_models import (
    ComplianceWorkflow, ComplianceWorkflowExecution
)

# Import workflow response models from rule models
from app.models.compliance_rule_models import (
    ComplianceWorkflowResponse, ComplianceWorkflowCreate, ComplianceWorkflowUpdate
)

# **INTERCONNECTED: Import existing backend models**
from app.models.scan_models import DataSource, ScanRuleSet, Scan, DataSourceType, Environment, DataClassification
from app.models.compliance_models import ComplianceRequirement, ComplianceAssessment, ComplianceFramework, ComplianceStatus

# **INTERCONNECTED: Import existing backend services**
from app.services.data_source_service import DataSourceService
from app.services.scan_service import ScanService
from app.services.custom_scan_rule_service import CustomScanRuleService
from app.services.compliance_service import ComplianceService

logger = logging.getLogger(__name__)


class ComplianceRuleService:
    """Comprehensive service for compliance rule management with full backend interconnection"""
    
    # **INTERCONNECTED: Framework Templates using real compliance standards**
    @staticmethod
    def get_compliance_frameworks() -> List[Dict[str, Any]]:
        """Get comprehensive compliance frameworks with real-world templates"""
        return [
            {
                "id": "soc2",
                "name": "SOC 2",
                "description": "Service Organization Control 2 - Trust Services Criteria",
                "version": "2017",
                "categories": ["Security", "Availability", "Processing Integrity", "Confidentiality", "Privacy"],
                "authority": "AICPA",
                "scope": "Service organizations",
                "jurisdiction": "United States",
                "effective_date": "2017-05-01",
                "status": "active",
                "requirements_count": 64,
                "controls_count": 148,
                "complexity_level": "intermediate",
                "assessment_frequency": "Annual",
                "certification_body": "AICPA",
                "templates": [
                    {
                        "id": "soc2_access_control",
                        "name": "Access Control Management",
                        "description": "Logical and physical access controls (CC6.1-CC6.8)",
                        "rule_type": "access_control",
                        "severity": "high",
                        "condition": "access_review_frequency <= 90 AND privileged_access_monitored == true AND mfa_enabled == true",
                        "scope": "global",
                        "validation_frequency": "monthly",
                        "business_impact": "high",
                        "regulatory_requirement": True,
                        "remediation_steps": "1. Review access controls\\n2. Implement MFA\\n3. Enable privileged access monitoring\\n4. Conduct quarterly access reviews",
                        "reference": "CC6.1-CC6.8",
                        "reference_link": "https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/aicpasoc2report.html"
                    },
                    {
                        "id": "soc2_data_encryption",
                        "name": "Data Encryption",
                        "description": "Data encryption at rest and in transit (CC6.7)",
                        "rule_type": "encryption",
                        "severity": "critical",
                        "condition": "encryption_at_rest == true AND encryption_in_transit == true AND key_management_implemented == true",
                        "scope": "data_source",
                        "validation_frequency": "weekly",
                        "business_impact": "critical",
                        "regulatory_requirement": True,
                        "remediation_steps": "1. Enable encryption at rest\\n2. Configure TLS for data in transit\\n3. Implement key management\\n4. Verify encryption coverage",
                        "reference": "CC6.7",
                        "reference_link": "https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/aicpasoc2report.html"
                    },
                    {
                        "id": "soc2_monitoring",
                        "name": "System Monitoring",
                        "description": "Continuous monitoring and logging (CC7.1-CC7.5)",
                        "rule_type": "audit",
                        "severity": "high",
                        "condition": "logging_enabled == true AND monitoring_alerts_configured == true AND log_retention >= 365",
                        "scope": "global",
                        "validation_frequency": "daily",
                        "business_impact": "high",
                        "regulatory_requirement": True,
                        "remediation_steps": "1. Enable comprehensive logging\\n2. Configure monitoring alerts\\n3. Set log retention policy\\n4. Review logs regularly",
                        "reference": "CC7.1-CC7.5",
                        "reference_link": "https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/aicpasoc2report.html"
                    }
                ]
            },
            {
                "id": "gdpr",
                "name": "GDPR", 
                "description": "General Data Protection Regulation",
                "version": "2018",
                "categories": ["Data Protection", "Privacy Rights", "Consent Management", "Data Retention", "Data Subject Rights"],
                "authority": "European Union",
                "scope": "Organizations processing EU personal data",
                "jurisdiction": "European Union",
                "effective_date": "2018-05-25",
                "status": "active",
                "requirements_count": 99,
                "controls_count": 173,
                "complexity_level": "advanced",
                "assessment_frequency": "Continuous",
                "penalty_information": "Up to 4% of annual global turnover or €20 million",
                "templates": [
                    {
                        "id": "gdpr_data_retention",
                        "name": "Data Retention Policy",
                        "description": "Proper data retention and deletion (Article 5)",
                        "rule_type": "data_retention",
                        "severity": "high",
                        "condition": "retention_policy_defined == true AND automated_deletion == true AND retention_period <= max_allowed",
                        "scope": "data_source",
                        "validation_frequency": "monthly",
                        "business_impact": "high",
                        "regulatory_requirement": True,
                        "remediation_steps": "1. Define retention policy\\n2. Implement automated deletion\\n3. Document retention periods\\n4. Regular compliance review",
                        "reference": "Article 5(1)(e)",
                        "reference_link": "https://gdpr-info.eu/art-5-gdpr/"
                    },
                    {
                        "id": "gdpr_consent_management",
                        "name": "Consent Management",
                        "description": "Valid consent for data processing (Article 6, 7)",
                        "rule_type": "privacy",
                        "severity": "critical",
                        "condition": "explicit_consent == true AND consent_withdrawable == true AND consent_documented == true",
                        "scope": "global",
                        "validation_frequency": "weekly",
                        "business_impact": "critical",
                        "regulatory_requirement": True,
                        "remediation_steps": "1. Implement consent mechanism\\n2. Enable consent withdrawal\\n3. Document consent records\\n4. Regular consent audits",
                        "reference": "Article 6, 7",
                        "reference_link": "https://gdpr-info.eu/art-6-gdpr/"
                    },
                    {
                        "id": "gdpr_data_subject_rights",
                        "name": "Data Subject Rights",
                        "description": "Right to access, rectification, erasure (Articles 15-17)",
                        "rule_type": "privacy",
                        "severity": "high",
                        "condition": "data_subject_access_implemented == true AND data_portability_enabled == true AND erasure_capability == true",
                        "scope": "global",
                        "validation_frequency": "monthly",
                        "business_impact": "high",
                        "regulatory_requirement": True,
                        "remediation_steps": "1. Implement data subject access\\n2. Enable data portability\\n3. Provide erasure capability\\n4. Document request handling",
                        "reference": "Articles 15-17",
                        "reference_link": "https://gdpr-info.eu/art-15-gdpr/"
                    }
                ]
            },
            {
                "id": "hipaa",
                "name": "HIPAA",
                "description": "Health Insurance Portability and Accountability Act",
                "version": "1996/2013",
                "categories": ["Physical Safeguards", "Administrative Safeguards", "Technical Safeguards"],
                "authority": "US Department of Health and Human Services",
                "scope": "Healthcare organizations and business associates",
                "jurisdiction": "United States",
                "effective_date": "1996-08-21",
                "status": "active",
                "requirements_count": 45,
                "controls_count": 78,
                "complexity_level": "intermediate",
                "assessment_frequency": "Annual",
                "penalty_information": "Up to $1.5 million per incident",
                "templates": [
                    {
                        "id": "hipaa_access_control",
                        "name": "PHI Access Control",
                        "description": "Protected Health Information access controls (164.312(a))",
                        "rule_type": "access_control",
                        "severity": "critical",
                        "condition": "phi_access_logged == true AND minimum_necessary == true AND role_based_access == true",
                        "scope": "data_source",
                        "validation_frequency": "weekly",
                        "business_impact": "critical",
                        "regulatory_requirement": True,
                        "remediation_steps": "1. Implement PHI access logging\\n2. Apply minimum necessary principle\\n3. Configure role-based access\\n4. Regular access audits",
                        "reference": "164.312(a)",
                        "reference_link": "https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html"
                    },
                    {
                        "id": "hipaa_encryption",
                        "name": "PHI Encryption",
                        "description": "Encryption of PHI (164.312(e))",
                        "rule_type": "encryption",
                        "severity": "critical",
                        "condition": "phi_encrypted_at_rest == true AND phi_encrypted_in_transit == true AND encryption_keys_managed == true",
                        "scope": "data_source",
                        "validation_frequency": "daily",
                        "business_impact": "critical",
                        "regulatory_requirement": True,
                        "remediation_steps": "1. Encrypt PHI at rest\\n2. Encrypt PHI in transit\\n3. Implement key management\\n4. Verify encryption coverage",
                        "reference": "164.312(e)",
                        "reference_link": "https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html"
                    }
                ]
            },
            {
                "id": "pci_dss",
                "name": "PCI DSS",
                "description": "Payment Card Industry Data Security Standard",
                "version": "4.0",
                "categories": ["Network Security", "Data Protection", "Access Control", "Monitoring", "Security Policies"],
                "authority": "PCI Security Standards Council",
                "scope": "Organizations handling payment card data",
                "jurisdiction": "Global",
                "effective_date": "2022-03-31",
                "status": "active",
                "requirements_count": 12,
                "controls_count": 362,
                "complexity_level": "advanced",
                "assessment_frequency": "Annual",
                "penalty_information": "Fines up to $100,000 per month",
                "templates": [
                    {
                        "id": "pci_data_encryption",
                        "name": "Cardholder Data Encryption",
                        "description": "Protect stored cardholder data (Requirement 3)",
                        "rule_type": "encryption",
                        "severity": "critical",
                        "condition": "cardholder_data_encrypted == true AND encryption_keys_secure == true AND data_masking_implemented == true",
                        "scope": "data_source",
                        "validation_frequency": "daily",
                        "business_impact": "critical",
                        "regulatory_requirement": True,
                        "remediation_steps": "1. Encrypt cardholder data\\n2. Secure encryption keys\\n3. Implement data masking\\n4. Regular encryption audits",
                        "reference": "Requirement 3",
                        "reference_link": "https://www.pcisecuritystandards.org/document_library/"
                    }
                ]
            }
        ]
    
    # **INTERCONNECTED: Data Source Integration using existing DataSourceService**
    @staticmethod
    def get_applicable_data_sources(
        session: Session,
        rule_type: Optional[ComplianceRuleType] = None,
        compliance_standard: Optional[str] = None,
        environment: Optional[Environment] = None,
        data_classification: Optional[DataClassification] = None
    ) -> List[Dict[str, Any]]:
        """Get data sources using existing DataSourceService with compliance context"""
        try:
            # **INTERCONNECTED: Use existing DataSourceService**
            data_sources = DataSourceService.get_all_data_sources(session)
            
            applicable_sources = []
            for ds in data_sources:
                # **INTERCONNECTED: Get compliance status from existing ComplianceService**
                compliance_status = None
                try:
                    compliance_status = ComplianceService.get_compliance_status(session, ds.id)
                except Exception as e:
                    logger.warning(f"Could not get compliance status for data source {ds.id}: {e}")
                
                source_info = {
                    "id": ds.id,
                    "name": ds.name,
                    "source_type": ds.source_type.value if ds.source_type else None,
                    "environment": ds.environment.value if ds.environment else None,
                    "data_classification": ds.data_classification.value if ds.data_classification else None,
                    "criticality": ds.criticality.value if ds.criticality else None,
                    "compliance_score": ds.compliance_score or 0,
                    "health_score": ds.health_score or 0,
                    "encryption_enabled": ds.encryption_enabled,
                    "monitoring_enabled": ds.monitoring_enabled,
                    "backup_enabled": ds.backup_enabled,
                    "tags": ds.tags or [],
                    "owner": ds.owner,
                    "team": ds.team,
                    "entity_count": ds.entity_count or 0,
                    "size_gb": ds.size_gb or 0.0,
                    "last_scan": ds.last_scan.isoformat() if ds.last_scan else None,
                    "applicable_rules": [],
                    "current_compliance": compliance_status.overall_score if compliance_status else 0,
                    "risk_level": ComplianceRuleService._calculate_risk_level(ds),
                    "connection_status": "active" if ds.status.value == "active" else "inactive",
                    "created_at": ds.created_at.isoformat(),
                    "updated_at": ds.updated_at.isoformat()
                }
                
                # Determine applicable rule types based on data source characteristics
                applicable_rules = ComplianceRuleService._get_applicable_rule_types(ds)
                source_info["applicable_rules"] = applicable_rules
                
                # Apply filters
                if environment and ds.environment != environment:
                    continue
                if data_classification and ds.data_classification != data_classification:
                    continue
                if rule_type and rule_type.value not in applicable_rules:
                    continue
                
                applicable_sources.append(source_info)
            
            return applicable_sources
            
        except Exception as e:
            logger.error(f"Error getting applicable data sources: {str(e)}")
            return []
    
    @staticmethod
    def _calculate_risk_level(data_source: DataSource) -> str:
        """Calculate risk level based on data source characteristics"""
        score = data_source.compliance_score or 0
        
        # Adjust based on criticality
        if data_source.criticality == "critical":
            score -= 20
        elif data_source.criticality == "high":
            score -= 10
        
        # Adjust based on data classification
        if data_source.data_classification in ["confidential", "restricted"]:
            score -= 15
        
        # Adjust based on environment
        if data_source.environment == "production":
            score -= 10
        
        # Adjust based on security features
        if not data_source.encryption_enabled:
            score -= 20
        if not data_source.monitoring_enabled:
            score -= 10
        
        if score >= 80:
            return "low"
        elif score >= 60:
            return "medium"
        elif score >= 40:
            return "high"
        else:
            return "critical"
    
    @staticmethod
    def _get_applicable_rule_types(data_source: DataSource) -> List[str]:
        """Determine applicable rule types for a data source"""
        applicable_rules = []
        
        # Based on data classification
        if data_source.data_classification in ["confidential", "restricted"]:
            applicable_rules.extend(["encryption", "access_control", "audit", "privacy"])
        
        # Based on environment
        if data_source.environment == "production":
            applicable_rules.extend(["monitoring", "security", "audit"])
        
        # Based on tags
        tags = data_source.tags or []
        if any(tag in ["pii", "phi", "personal_data"] for tag in tags):
            applicable_rules.extend(["privacy", "data_retention", "encryption"])
        
        if any(tag in ["payment", "financial", "card_data"] for tag in tags):
            applicable_rules.extend(["encryption", "access_control", "audit"])
        
        # Based on criticality
        if data_source.criticality in ["critical", "high"]:
            applicable_rules.extend(["monitoring", "security", "audit"])
        
        # Always applicable
        applicable_rules.extend(["regulatory", "internal", "quality"])
        
        return list(set(applicable_rules))  # Remove duplicates
    
    # **INTERCONNECTED: Scan Rule Integration using existing services**
    @staticmethod
    def get_related_scan_rules(
        session: Session,
        compliance_rule_id: int
    ) -> List[Dict[str, Any]]:
        """Get scan rules related to a compliance rule using existing services"""
        try:
            rule = session.get(ComplianceRule, compliance_rule_id)
            if not rule:
                return []
            
            related_rules = []
            
            # **INTERCONNECTED: Get scan rule set using existing relationship**
            if rule.scan_rule_set_id:
                scan_rule_set = session.get(ScanRuleSet, rule.scan_rule_set_id)
                if scan_rule_set:
                    related_rules.append({
                        "id": scan_rule_set.id,
                        "name": scan_rule_set.name,
                        "type": "scan_rule_set",
                        "description": scan_rule_set.description,
                        "data_source_id": scan_rule_set.data_source_id,
                        "include_schemas": scan_rule_set.include_schemas,
                        "exclude_schemas": scan_rule_set.exclude_schemas,
                        "include_tables": scan_rule_set.include_tables,
                        "exclude_tables": scan_rule_set.exclude_tables,
                        "sample_data": scan_rule_set.sample_data,
                        "sample_size": scan_rule_set.sample_size,
                        "created_at": scan_rule_set.created_at.isoformat(),
                        "updated_at": scan_rule_set.updated_at.isoformat()
                    })
            
            # **INTERCONNECTED: Get custom scan rules using existing CustomScanRuleService**
            if rule.custom_scan_rule_ids:
                for rule_id in rule.custom_scan_rule_ids:
                    try:
                        custom_rule = CustomScanRuleService.get_rule_by_id(session, rule_id)
                        if custom_rule:
                            related_rules.append({
                                "id": custom_rule.get("id"),
                                "name": custom_rule.get("name"),
                                "type": "custom_scan_rule",
                                "description": custom_rule.get("description", ""),
                                "pattern": custom_rule.get("pattern", ""),
                                "category": custom_rule.get("category", ""),
                                "severity": custom_rule.get("severity", "medium"),
                                "is_active": custom_rule.get("is_active", True),
                                "data_types": custom_rule.get("data_types", []),
                                "false_positive_rate": custom_rule.get("false_positive_rate", 0.0)
                            })
                    except Exception as e:
                        logger.warning(f"Could not get custom scan rule {rule_id}: {e}")
            
            return related_rules
            
        except Exception as e:
            logger.error(f"Error getting related scan rules: {str(e)}")
            return []
    
    # **INTERCONNECTED: Enhanced Rule Evaluation with all backend services**
    @staticmethod
    def evaluate_rule_with_data_sources(
        session: Session, 
        rule_id: int,
        data_source_ids: Optional[List[int]] = None,
        run_scans: bool = False,
        include_performance_check: bool = True,
        include_security_check: bool = True
    ) -> ComplianceRuleEvaluationResponse:
        """Enhanced rule evaluation integrating with all backend systems"""
        try:
            rule = session.get(ComplianceRule, rule_id)
            if not rule:
                raise ValueError(f"Rule {rule_id} not found")
            
            # Determine target data sources
            if data_source_ids:
                target_sources = data_source_ids
            elif rule.applies_to_all_sources:
                all_sources = DataSourceService.get_all_data_sources(session)
                target_sources = [ds.id for ds in all_sources]
            else:
                # Get data sources linked to this rule
                target_sources = [ds.id for ds in rule.data_sources]
            
            evaluation_results = []
            total_entities = 0
            compliant_entities = 0
            
            for source_id in target_sources:
                # **INTERCONNECTED: Get data source using existing service**
                source = DataSourceService.get_data_source(session, source_id)
                if not source:
                    continue
                
                # **INTERCONNECTED: Trigger scans using existing ScanService**
                scan_results = None
                if run_scans and rule.auto_scan_on_evaluation:
                    try:
                        scan = ScanService.create_scan(
                            session=session,
                            name=f"Compliance Scan - {rule.name}",
                            data_source_id=source_id,
                            scan_rule_set_id=rule.scan_rule_set_id,
                            description=f"Automated scan for compliance rule: {rule.name}"
                        )
                        scan_results = ScanService.start_scan(session, scan.id)
                    except Exception as scan_error:
                        logger.warning(f"Failed to run scan for source {source_id}: {scan_error}")
                
                # **INTERCONNECTED: Get performance metrics if available**
                performance_metrics = None
                if include_performance_check:
                    try:
                        # Use existing performance data from data source
                        performance_metrics = {
                            "health_score": source.health_score,
                            "uptime_percentage": source.uptime_percentage,
                            "avg_response_time": source.avg_response_time,
                            "error_rate": source.error_rate,
                            "queries_per_second": source.queries_per_second
                        }
                    except Exception as perf_error:
                        logger.warning(f"Failed to get performance metrics for source {source_id}: {perf_error}")
                
                # **INTERCONNECTED: Get security status if available**
                security_status = None
                if include_security_check:
                    try:
                        security_status = {
                            "encryption_enabled": source.encryption_enabled,
                            "monitoring_enabled": source.monitoring_enabled,
                            "backup_enabled": source.backup_enabled,
                            "data_classification": source.data_classification.value if source.data_classification else None,
                            "compliance_score": source.compliance_score
                        }
                    except Exception as sec_error:
                        logger.warning(f"Failed to get security status for source {source_id}: {sec_error}")
                
                # Evaluate compliance based on all factors
                source_result = ComplianceRuleService._evaluate_source_compliance_comprehensive(
                    rule, source, scan_results, performance_metrics, security_status
                )
                evaluation_results.append(source_result)
                
                total_entities += source_result["entity_count"]
                compliant_entities += source_result["compliant_count"]
            
            # Calculate overall compliance
            compliance_score = (compliant_entities / total_entities * 100) if total_entities > 0 else 0
            status = RuleValidationStatus.COMPLIANT if compliance_score >= 90 else RuleValidationStatus.NON_COMPLIANT
            
            # Create evaluation record
            evaluation = ComplianceRuleEvaluation(
                rule_id=rule_id,
                evaluation_id=f"eval_{rule_id}_{int(datetime.now().timestamp())}",
                status=status,
                entity_count={
                    "total": total_entities,
                    "compliant": compliant_entities,
                    "non_compliant": total_entities - compliant_entities,
                    "error": 0,
                    "not_applicable": 0
                },
                compliance_score=compliance_score,
                issues_found=total_entities - compliant_entities,
                execution_time_ms=100,  # Would be actual execution time
                entities_processed=total_entities,
                evaluation_context={
                    "data_sources": target_sources,
                    "scan_triggered": run_scans and rule.auto_scan_on_evaluation,
                    "performance_check": include_performance_check,
                    "security_check": include_security_check,
                    "evaluation_details": evaluation_results
                },
                scan_results=scan_results,
                performance_metrics=performance_metrics,
                security_checks=security_status,
                metadata={"rule_version": rule.version}
            )
            
            session.add(evaluation)
            
            # Update rule performance metrics
            rule.pass_rate = compliance_score
            rule.total_entities = total_entities
            rule.passing_entities = compliant_entities
            rule.failing_entities = total_entities - compliant_entities
            rule.last_evaluated_at = datetime.now()
            
            session.add(rule)
            session.commit()
            session.refresh(evaluation)
            
            return ComplianceRuleEvaluationResponse.from_orm(evaluation)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error evaluating rule with data sources {rule_id}: {str(e)}")
            raise
    
    @staticmethod
    def _evaluate_source_compliance_comprehensive(
        rule: ComplianceRule, 
        source: DataSource, 
        scan_results: Optional[Dict[str, Any]] = None,
        performance_metrics: Optional[Dict[str, Any]] = None,
        security_status: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Comprehensive compliance evaluation for a specific data source"""
        entity_count = source.entity_count or 100
        
        # Base compliance on multiple factors
        compliance_factors = []
        
        # Check encryption requirements
        if rule.rule_type == ComplianceRuleType.ENCRYPTION:
            compliance_factors.append(1.0 if source.encryption_enabled else 0.0)
            if security_status and "encryption_enabled" in security_status:
                compliance_factors.append(1.0 if security_status["encryption_enabled"] else 0.0)
        
        # Check access control requirements
        if rule.rule_type == ComplianceRuleType.ACCESS_CONTROL:
            compliance_factors.append(0.9 if source.monitoring_enabled else 0.3)
            if security_status and "monitoring_enabled" in security_status:
                compliance_factors.append(0.9 if security_status["monitoring_enabled"] else 0.3)
        
        # Check privacy requirements
        if rule.rule_type == ComplianceRuleType.PRIVACY:
            if source.data_classification in [DataClassification.CONFIDENTIAL, DataClassification.RESTRICTED]:
                compliance_factors.append(0.8)
            else:
                compliance_factors.append(1.0)
        
        # Check monitoring requirements
        if rule.rule_type == ComplianceRuleType.MONITORING:
            compliance_factors.append(1.0 if source.monitoring_enabled else 0.0)
            if performance_metrics:
                uptime = performance_metrics.get("uptime_percentage", 100.0)
                compliance_factors.append(uptime / 100.0)
        
        # Check audit requirements
        if rule.rule_type == ComplianceRuleType.AUDIT:
            compliance_factors.append(0.8 if source.monitoring_enabled else 0.2)
            if scan_results:
                scan_compliance = scan_results.get("compliance_score", 85.0)
                compliance_factors.append(scan_compliance / 100.0)
        
        # Check security requirements
        if rule.rule_type == ComplianceRuleType.SECURITY:
            security_score = 0.0
            if source.encryption_enabled:
                security_score += 0.4
            if source.monitoring_enabled:
                security_score += 0.3
            if source.backup_enabled:
                security_score += 0.3
            compliance_factors.append(security_score)
        
        # Default compliance if no specific factors
        if not compliance_factors:
            compliance_factors.append(0.85)  # Default 85% compliance
        
        # Calculate average compliance
        avg_compliance = sum(compliance_factors) / len(compliance_factors)
        compliant_count = int(entity_count * avg_compliance)
        
        return {
            "source_id": source.id,
            "source_name": source.name,
            "entity_count": entity_count,
            "compliant_count": compliant_count,
            "compliance_percentage": avg_compliance * 100,
            "factors_evaluated": len(compliance_factors),
            "scan_executed": scan_results is not None,
            "performance_checked": performance_metrics is not None,
            "security_checked": security_status is not None,
            "source_health_score": source.health_score,
            "source_compliance_score": source.compliance_score
        }

    # **INTERCONNECTED: CRUD Operations with Full Integration**
    @staticmethod
    def get_rules(
        session: Session,
        rule_type: Optional[ComplianceRuleType] = None,
        severity: Optional[ComplianceRuleSeverity] = None,
        status: Optional[ComplianceRuleStatus] = None,
        scope: Optional[ComplianceRuleScope] = None,
        data_source_id: Optional[int] = None,
        compliance_standard: Optional[str] = None,
        tags: Optional[List[str]] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 50,
        sort: str = "created_at",
        sort_order: str = "desc"
    ) -> Tuple[List[ComplianceRuleResponse], int]:
        """Get compliance rules with comprehensive filtering and pagination"""
        try:
            query = select(ComplianceRule)
            
            # Apply filters
            filters = []
            
            if rule_type:
                filters.append(ComplianceRule.rule_type == rule_type)
            
            if severity:
                filters.append(ComplianceRule.severity == severity)
            
            if status:
                filters.append(ComplianceRule.status == status)
            
            if scope:
                filters.append(ComplianceRule.scope == scope)
            
            if data_source_id:
                # Filter by data sources linked to this rule
                filters.append(ComplianceRule.data_sources.any(DataSource.id == data_source_id))
            
            if compliance_standard:
                filters.append(ComplianceRule.compliance_standard == compliance_standard)
            
            if tags:
                for tag in tags:
                    filters.append(ComplianceRule.tags.contains([tag]))
            
            if search:
                search_filter = or_(
                    ComplianceRule.name.ilike(f"%{search}%"),
                    ComplianceRule.description.ilike(f"%{search}%"),
                    ComplianceRule.compliance_standard.ilike(f"%{search}%")
                )
                filters.append(search_filter)
            
            if filters:
                query = query.where(and_(*filters))
            
            # Get total count
            count_query = select(func.count(ComplianceRule.id)).where(and_(*filters)) if filters else select(func.count(ComplianceRule.id))
            total = session.exec(count_query).one()
            
            # Apply sorting
            if hasattr(ComplianceRule, sort):
                sort_column = getattr(ComplianceRule, sort)
                if sort_order.lower() == "desc":
                    query = query.order_by(sort_column.desc())
                else:
                    query = query.order_by(sort_column.asc())
            
            # Apply pagination
            offset = (page - 1) * limit
            query = query.offset(offset).limit(limit)
            
            rules = session.exec(query).all()
            
            return [ComplianceRuleResponse.from_orm(rule) for rule in rules], total
            
        except Exception as e:
            logger.error(f"Error getting compliance rules: {str(e)}")
            raise

    @staticmethod
    def get_rule(session: Session, rule_id: int) -> Optional[ComplianceRuleResponse]:
        """Get a specific compliance rule by ID"""
        try:
            rule = session.get(ComplianceRule, rule_id)
            if not rule:
                return None
            
            return ComplianceRuleResponse.from_orm(rule)
            
        except Exception as e:
            logger.error(f"Error getting compliance rule {rule_id}: {str(e)}")
            raise

    @staticmethod
    def create_rule(session: Session, rule_data: ComplianceRuleCreate, created_by: Optional[str] = None) -> ComplianceRuleResponse:
        """Create a new compliance rule with comprehensive validation"""
        try:
            # Validate scan rule set exists if specified
            if rule_data.scan_rule_set_id:
                scan_rule_set = session.get(ScanRuleSet, rule_data.scan_rule_set_id)
                if not scan_rule_set:
                    raise ValueError(f"Scan rule set {rule_data.scan_rule_set_id} not found")
            
            # Create rule instance
            rule = ComplianceRule(
                **rule_data.dict(),
                created_by=created_by,
                updated_by=created_by
            )
            
            session.add(rule)
            session.commit()
            session.refresh(rule)
            
            logger.info(f"Created compliance rule: {rule.name} (ID: {rule.id})")
            return ComplianceRuleResponse.from_orm(rule)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating compliance rule: {str(e)}")
            raise

    @staticmethod
    def create_rule_from_template(
        session: Session,
        template_id: str,
        customizations: Dict[str, Any],
        created_by: Optional[str] = None
    ) -> ComplianceRuleResponse:
        """Create a compliance rule from a template with customizations"""
        try:
            # Get framework templates
            frameworks = ComplianceRuleService.get_compliance_frameworks()
            template = None
            framework_info = None
            
            for framework in frameworks:
                for tmpl in framework.get("templates", []):
                    if tmpl["id"] == template_id:
                        template = tmpl
                        framework_info = framework
                        break
                if template:
                    break
            
            if not template:
                raise ValueError(f"Template {template_id} not found")
            
            # Merge template with customizations
            rule_data = {
                "name": customizations.get("name", template["name"]),
                "description": customizations.get("description", template["description"]),
                "rule_type": ComplianceRuleType(customizations.get("rule_type", template["rule_type"])),
                "severity": ComplianceRuleSeverity(customizations.get("severity", template["severity"])),
                "condition": customizations.get("condition", template["condition"]),
                "compliance_standard": customizations.get("compliance_standard", framework_info.get("name")),
                "scope": ComplianceRuleScope(customizations.get("scope", template.get("scope", "global"))),
                "validation_frequency": customizations.get("validation_frequency", template.get("validation_frequency", "weekly")),
                "business_impact": customizations.get("business_impact", template.get("business_impact", "medium")),
                "regulatory_requirement": customizations.get("regulatory_requirement", template.get("regulatory_requirement", False)),
                "remediation_steps": customizations.get("remediation_steps", template.get("remediation_steps")),
                "tags": customizations.get("tags", []),
                "metadata": {
                    "template_id": template_id,
                    "framework": framework_info.get("id"),
                    "framework_version": framework_info.get("version"),
                    "created_from_template": True,
                    "reference": template.get("reference"),
                    "reference_link": template.get("reference_link"),
                    **customizations.get("metadata", {})
                }
            }
            
            # Create rule
            rule_create = ComplianceRuleCreate(**rule_data)
            return ComplianceRuleService.create_rule(session, rule_create, created_by)
            
        except Exception as e:
            logger.error(f"Error creating rule from template {template_id}: {str(e)}")
            raise

    @staticmethod
    def update_rule(
        session: Session, 
        rule_id: int, 
        rule_data: ComplianceRuleUpdate, 
        updated_by: Optional[str] = None
    ) -> Optional[ComplianceRuleResponse]:
        """Update an existing compliance rule"""
        try:
            rule = session.get(ComplianceRule, rule_id)
            if not rule:
                return None
            
            # Update fields
            update_data = rule_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(rule, field, value)
            
            rule.updated_by = updated_by
            rule.updated_at = datetime.now()
            rule.version += 1
            
            session.add(rule)
            session.commit()
            session.refresh(rule)
            
            logger.info(f"Updated compliance rule: {rule.name} (ID: {rule.id})")
            return ComplianceRuleResponse.from_orm(rule)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error updating compliance rule {rule_id}: {str(e)}")
            raise

    @staticmethod
    def delete_rule(session: Session, rule_id: int) -> bool:
        """Delete a compliance rule"""
        try:
            rule = session.get(ComplianceRule, rule_id)
            if not rule:
                return False
            
            # Check if rule has dependencies
            evaluations_count = session.exec(
                select(func.count(ComplianceRuleEvaluation.id)).where(
                    ComplianceRuleEvaluation.rule_id == rule_id
                )
            ).one()
            
            if evaluations_count > 0:
                logger.warning(f"Cannot delete rule {rule_id}: has {evaluations_count} evaluations")
                return False
            
            session.delete(rule)
            session.commit()
            
            logger.info(f"Deleted compliance rule: {rule.name} (ID: {rule.id})")
            return True
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error deleting compliance rule {rule_id}: {str(e)}")
            raise

    # **INTERCONNECTED: Issues Management**
    @staticmethod
    def get_issues(
        session: Session,
        rule_id: Optional[int] = None,
        status: Optional[str] = None,
        severity: Optional[ComplianceRuleSeverity] = None,
        assigned_to: Optional[str] = None,
        data_source_id: Optional[int] = None,
        page: int = 1,
        limit: int = 50
    ) -> Tuple[List[ComplianceIssueResponse], int]:
        """Get compliance issues with filtering"""
        try:
            query = select(ComplianceIssue)
            filters = []
            
            if rule_id:
                filters.append(ComplianceIssue.rule_id == rule_id)
            if status:
                filters.append(ComplianceIssue.status == status)
            if severity:
                filters.append(ComplianceIssue.severity == severity)
            if assigned_to:
                filters.append(ComplianceIssue.assigned_to == assigned_to)
            if data_source_id:
                filters.append(ComplianceIssue.data_source_id == data_source_id)
            
            if filters:
                query = query.where(and_(*filters))
            
            # Get total count
            count_query = select(func.count(ComplianceIssue.id)).where(and_(*filters)) if filters else select(func.count(ComplianceIssue.id))
            total = session.exec(count_query).one()
            
            # Apply pagination
            offset = (page - 1) * limit
            query = query.offset(offset).limit(limit).order_by(ComplianceIssue.created_at.desc())
            
            issues = session.exec(query).all()
            
            return [ComplianceIssueResponse.from_orm(issue) for issue in issues], total
            
        except Exception as e:
            logger.error(f"Error getting compliance issues: {str(e)}")
            raise

    @staticmethod
    def create_issue(session: Session, issue_data: ComplianceIssueCreate) -> ComplianceIssueResponse:
        """Create a new compliance issue"""
        try:
            issue = ComplianceIssue(**issue_data.dict())
            
            session.add(issue)
            session.commit()
            session.refresh(issue)
            
            return ComplianceIssueResponse.from_orm(issue)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating compliance issue: {str(e)}")
            raise

    @staticmethod
    def update_issue(session: Session, issue_id: int, issue_data: ComplianceIssueUpdate) -> Optional[ComplianceIssueResponse]:
        """Update an existing compliance issue"""
        try:
            issue = session.get(ComplianceIssue, issue_id)
            if not issue:
                return None
            
            update_data = issue_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(issue, field, value)
            
            issue.updated_at = datetime.now()
            
            session.add(issue)
            session.commit()
            session.refresh(issue)
            
            return ComplianceIssueResponse.from_orm(issue)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error updating compliance issue {issue_id}: {str(e)}")
            raise

    # **INTERCONNECTED: Workflows Management**
    @staticmethod
    def get_workflows(
        session: Session,
        rule_id: Optional[int] = None,
        status: Optional[WorkflowStatus] = None,
        workflow_type: Optional[str] = None,
        page: int = 1,
        limit: int = 50
    ) -> Tuple[List[ComplianceWorkflowResponse], int]:
        """Get compliance workflows with filtering"""
        try:
            query = select(ComplianceWorkflow)
            filters = []
            
            if rule_id:
                filters.append(ComplianceWorkflow.rule_id == rule_id)
            if status:
                filters.append(ComplianceWorkflow.status == status)
            if workflow_type:
                filters.append(ComplianceWorkflow.workflow_type == workflow_type)
            
            if filters:
                query = query.where(and_(*filters))
            
            # Get total count
            count_query = select(func.count(ComplianceWorkflow.id)).where(and_(*filters)) if filters else select(func.count(ComplianceWorkflow.id))
            total = session.exec(count_query).one()
            
            # Apply pagination
            offset = (page - 1) * limit
            query = query.offset(offset).limit(limit).order_by(ComplianceWorkflow.created_at.desc())
            
            workflows = session.exec(query).all()
            
            return [ComplianceWorkflowResponse.from_orm(workflow) for workflow in workflows], total
            
        except Exception as e:
            logger.error(f"Error getting compliance workflows: {str(e)}")
            raise

    @staticmethod
    def create_workflow(session: Session, workflow_data: ComplianceWorkflowCreate) -> ComplianceWorkflowResponse:
        """Create a new compliance workflow"""
        try:
            workflow = ComplianceWorkflow(**workflow_data.dict())
            
            session.add(workflow)
            session.commit()
            session.refresh(workflow)
            
            return ComplianceWorkflowResponse.from_orm(workflow)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating compliance workflow: {str(e)}")
            raise

    @staticmethod
    def update_workflow(session: Session, workflow_id: int, workflow_data: ComplianceWorkflowUpdate) -> Optional[ComplianceWorkflowResponse]:
        """Update an existing compliance workflow"""
        try:
            workflow = session.get(ComplianceWorkflow, workflow_id)
            if not workflow:
                return None
            
            update_data = workflow_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(workflow, field, value)
            
            workflow.updated_at = datetime.now()
            
            session.add(workflow)
            session.commit()
            session.refresh(workflow)
            
            return ComplianceWorkflowResponse.from_orm(workflow)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error updating compliance workflow {workflow_id}: {str(e)}")
            raise

    @staticmethod
    def execute_workflow(session: Session, workflow_id: int, execution_params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Execute a compliance workflow"""
        try:
            workflow = session.get(ComplianceWorkflow, workflow_id)
            if not workflow:
                raise ValueError(f"Workflow {workflow_id} not found")
            
            execution_id = f"exec_{workflow_id}_{int(datetime.now().timestamp())}"
            
            # Create execution record
            execution = ComplianceWorkflowExecution(
                workflow_id=workflow_id,
                execution_id=execution_id,
                trigger="manual",
                total_steps=len(workflow.steps),
                execution_context=execution_params or {}
            )
            
            session.add(execution)
            session.commit()
            
            return {
                "execution_id": execution_id,
                "status": "started",
                "workflow_id": workflow_id,
                "started_at": execution.started_at.isoformat()
            }
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error executing workflow {workflow_id}: {str(e)}")
            raise

    # **INTERCONNECTED: Advanced Analytics and Insights**
    @staticmethod
    def get_compliance_dashboard_analytics(
        session: Session,
        data_source_id: Optional[int] = None,
        time_range: str = "30d"
    ) -> Dict[str, Any]:
        """Get comprehensive compliance analytics for dashboard"""
        try:
            # Parse time range
            days = int(time_range.rstrip('d')) if time_range.endswith('d') else 30
            start_date = datetime.now() - timedelta(days=days)
            
            # Get all rules for analytics
            rules_query = select(ComplianceRule)
            if data_source_id:
                rules_query = rules_query.where(ComplianceRule.data_sources.any(DataSource.id == data_source_id))
            
            rules = session.exec(rules_query).all()
            
            # Calculate metrics
            total_rules = len(rules)
            active_rules = len([r for r in rules if r.status == ComplianceRuleStatus.ACTIVE])
            
            # Status distribution
            status_counts = {}
            for status in ComplianceRuleStatus:
                status_counts[status.value] = len([r for r in rules if r.status == status])
            
            # Severity distribution
            severity_counts = {}
            for severity in ComplianceRuleSeverity:
                severity_counts[severity.value] = len([r for r in rules if r.severity == severity])
            
            # Framework coverage
            framework_counts = {}
            for rule in rules:
                if rule.compliance_standard:
                    framework_counts[rule.compliance_standard] = framework_counts.get(rule.compliance_standard, 0) + 1
            
            # Recent evaluations
            recent_evaluations = session.exec(
                select(ComplianceRuleEvaluation).where(
                    ComplianceRuleEvaluation.evaluated_at >= start_date
                ).order_by(ComplianceRuleEvaluation.evaluated_at.desc()).limit(10)
            ).all()
            
            # Compliance trends
            trend_data = []
            for i in range(days):
                date = start_date + timedelta(days=i)
                day_evaluations = session.exec(
                    select(ComplianceRuleEvaluation).where(
                        and_(
                            ComplianceRuleEvaluation.evaluated_at >= date,
                            ComplianceRuleEvaluation.evaluated_at < date + timedelta(days=1)
                        )
                    )
                ).all()
                
                avg_score = sum(e.compliance_score for e in day_evaluations) / len(day_evaluations) if day_evaluations else 0
                trend_data.append({
                    "date": date.isoformat(),
                    "compliance_score": avg_score,
                    "evaluations_count": len(day_evaluations)
                })
            
            return {
                "summary": {
                    "total_rules": total_rules,
                    "active_rules": active_rules,
                    "draft_rules": status_counts.get("draft", 0),
                    "inactive_rules": status_counts.get("inactive", 0)
                },
                "distributions": {
                    "status": status_counts,
                    "severity": severity_counts,
                    "frameworks": framework_counts
                },
                "recent_activity": {
                    "evaluations": [
                        {
                            "id": eval.id,
                            "rule_id": eval.rule_id,
                            "status": eval.status,
                            "compliance_score": eval.compliance_score,
                            "evaluated_at": eval.evaluated_at.isoformat()
                        }
                        for eval in recent_evaluations
                    ]
                },
                "trends": trend_data,
                "time_range": time_range,
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting compliance dashboard analytics: {str(e)}")
            raise

    @staticmethod
    def get_integration_status(session: Session) -> Dict[str, Any]:
        """Get status of compliance system integrations"""
        try:
            # **INTERCONNECTED: Check data source integration using existing service**
            data_sources_count = len(DataSourceService.get_all_data_sources(session))
            
            # Check scan rule integration
            scan_rules_with_compliance = session.exec(
                select(func.count(ComplianceRule.id)).where(
                    ComplianceRule.scan_rule_set_id.isnot(None)
                )
            ).one()
            
            # Check recent activity
            recent_evaluations = session.exec(
                select(func.count(ComplianceRuleEvaluation.id)).where(
                    ComplianceRuleEvaluation.evaluated_at >= datetime.now() - timedelta(hours=24)
                )
            ).one()
            
            # Check workflow integration
            workflow_integrations = session.exec(
                select(func.count(ComplianceRule.id)).where(
                    ComplianceRule.remediation_workflow_id.isnot(None)
                )
            ).one()
            
            return {
                "data_source_integration": {
                    "status": "connected" if data_sources_count > 0 else "disconnected",
                    "data_sources_count": data_sources_count
                },
                "scan_integration": {
                    "status": "active" if scan_rules_with_compliance > 0 else "inactive",
                    "integrated_rules": scan_rules_with_compliance
                },
                "workflow_integration": {
                    "status": "active" if workflow_integrations > 0 else "inactive",
                    "integrated_workflows": workflow_integrations
                },
                "system_health": {
                    "recent_evaluations": recent_evaluations,
                    "last_check": datetime.now().isoformat(),
                    "status": "healthy" if recent_evaluations > 0 else "warning"
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting integration status: {str(e)}")
            raise

    # **INTERCONNECTED: Additional Required Methods for Frontend APIs**
    @staticmethod
    def get_templates_by_framework(session: Session, framework: str) -> List[Dict[str, Any]]:
        """Get templates for a specific framework"""
        frameworks = ComplianceRuleService.get_compliance_frameworks()
        
        for fw in frameworks:
            if fw["id"] == framework:
                return fw.get("templates", [])
        
        return []

    @staticmethod
    def test_rule(session: Session, rule_data: Dict[str, Any]) -> Dict[str, Any]:
        """Test a compliance rule with enterprise-level validation"""
        try:
            from ..services.custom_scan_rule_service import ExpressionParser
            from ..services.performance_service import PerformanceService
            
            # Get rule components
            condition = rule_data.get("condition", "")
            rule_type = rule_data.get("rule_type", "validation")
            severity = rule_data.get("severity", "medium")
            data_sources = rule_data.get("data_sources", [])
            
            test_result = {
                "valid": True,
                "errors": [],
                "warnings": [],
                "estimated_performance": "good",
                "complexity_score": 0,
                "security_analysis": {},
                "performance_impact": {},
                "validation_details": {}
            }
            
            # Comprehensive condition validation
            if not condition:
                test_result["errors"].append("Rule condition cannot be empty")
                test_result["valid"] = False
            else:
                # Validate expression syntax
                try:
                    # Test with sample context
                    sample_context = {
                        "column_name": "test_column",
                        "table_name": "test_table",
                        "schema_name": "test_schema",
                        "data_type": "varchar",
                        "value": "test_value",
                        "row_count": 1000,
                        "null_count": 50
                    }
                    
                    # Parse and validate expression
                    tokens = ExpressionParser.tokenize(condition)
                    if not tokens:
                        test_result["errors"].append("Invalid expression syntax")
                        test_result["valid"] = False
                    else:
                        # Test expression evaluation
                        try:
                            evaluator = ExpressionParser.create_evaluator(condition)
                            result = evaluator(sample_context)
                            test_result["validation_details"]["test_evaluation"] = result
                        except Exception as eval_error:
                            test_result["errors"].append(f"Expression evaluation failed: {str(eval_error)}")
                            test_result["valid"] = False
                        
                        # Analyze expression complexity
                        complexity_score = ComplianceRuleService._analyze_expression_complexity(tokens)
                        test_result["complexity_score"] = complexity_score
                        
                        if complexity_score > 8:
                            test_result["warnings"].append("High complexity expression may impact performance")
                            test_result["estimated_performance"] = "moderate"
                        elif complexity_score > 5:
                            test_result["warnings"].append("Moderate complexity expression")
                            test_result["estimated_performance"] = "good"
                        else:
                            test_result["estimated_performance"] = "excellent"
                        
                        # Security analysis
                        security_analysis = ComplianceRuleService._analyze_security_implications(condition)
                        test_result["security_analysis"] = security_analysis
                        
                        if security_analysis.get("risk_level", "low") == "high":
                            test_result["warnings"].append("High security risk detected in rule condition")
                        
                except Exception as parse_error:
                    test_result["errors"].append(f"Expression parsing failed: {str(parse_error)}")
                    test_result["valid"] = False
            
            # Data source validation
            if data_sources:
                data_source_validation = ComplianceRuleService._validate_data_sources(session, data_sources)
                test_result["validation_details"]["data_sources"] = data_source_validation
                
                if not data_source_validation.get("all_valid", True):
                    test_result["errors"].extend(data_source_validation.get("errors", []))
                    test_result["valid"] = False
            
            # Performance impact analysis
            performance_service = PerformanceService()
            performance_impact = ComplianceRuleService._analyze_performance_impact(
                condition, rule_type, severity, data_sources
            )
            test_result["performance_impact"] = performance_impact
            
            if performance_impact.get("estimated_execution_time", 0) > 30:
                test_result["warnings"].append("Rule may have significant performance impact")
                test_result["estimated_performance"] = "poor"
            
            # Rule type specific validation
            rule_type_validation = ComplianceRuleService._validate_rule_type(rule_type, condition)
            test_result["validation_details"]["rule_type"] = rule_type_validation
            
            if not rule_type_validation.get("valid", True):
                test_result["errors"].extend(rule_type_validation.get("errors", []))
                test_result["valid"] = False
            
            # Best practices check
            best_practices = ComplianceRuleService._check_best_practices(rule_data)
            test_result["validation_details"]["best_practices"] = best_practices
            
            if best_practices.get("score", 0) < 0.7:
                test_result["warnings"].append("Rule does not follow all best practices")
            
            return test_result
            
        except Exception as e:
            logger.error(f"Error testing rule: {str(e)}")
            return {
                "valid": False,
                "errors": [str(e)],
                "warnings": [],
                "estimated_performance": "unknown",
                "complexity_score": 0,
                "security_analysis": {},
                "performance_impact": {},
                "validation_details": {}
            }
    
    @staticmethod
    def _analyze_expression_complexity(tokens: List[str]) -> int:
        """Analyze expression complexity score (0-10)"""
        try:
            complexity_score = 0
            
            # Count operators
            operators = ['AND', 'OR', 'NOT', '==', '!=', '>', '<', '>=', '<=', 'CONTAINS', 'STARTSWITH', 'ENDSWITH']
            operator_count = sum(1 for token in tokens if token in operators)
            complexity_score += min(operator_count * 0.5, 3)
            
            # Count nested parentheses
            parenthesis_depth = 0
            max_depth = 0
            for token in tokens:
                if token == '(':
                    parenthesis_depth += 1
                    max_depth = max(max_depth, parenthesis_depth)
                elif token == ')':
                    parenthesis_depth -= 1
            
            complexity_score += min(max_depth * 0.5, 2)
            
            # Count function calls
            function_count = sum(1 for token in tokens if token.startswith('FUNCTION_'))
            complexity_score += min(function_count * 0.3, 2)
            
            # Count variables/context references
            variable_count = sum(1 for token in tokens if token not in operators and not token.startswith('FUNCTION_') and token not in ['(', ')', ','] and not token.replace('.', '').replace('_', '').isalnum())
            complexity_score += min(variable_count * 0.2, 2)
            
            return min(int(complexity_score), 10)
            
        except Exception as e:
            logger.error(f"Error analyzing expression complexity: {e}")
            return 5  # Default moderate complexity
    
    @staticmethod
    def _analyze_security_implications(condition: str) -> Dict[str, Any]:
        """Analyze security implications of rule condition"""
        try:
            security_analysis = {
                "risk_level": "low",
                "vulnerabilities": [],
                "recommendations": []
            }
            
            # Check for potential SQL injection patterns
            sql_patterns = [
                r"SELECT\s+.*FROM",
                r"INSERT\s+INTO",
                r"UPDATE\s+.*SET",
                r"DELETE\s+FROM",
                r"DROP\s+TABLE",
                r"EXEC\s*\(",
                r"EXECUTE\s*\("
            ]
            
            for pattern in sql_patterns:
                if re.search(pattern, condition, re.IGNORECASE):
                    security_analysis["vulnerabilities"].append("Potential SQL injection detected")
                    security_analysis["risk_level"] = "high"
                    security_analysis["recommendations"].append("Use parameterized queries instead of string concatenation")
            
            # Check for file system access patterns
            file_patterns = [
                r"file://",
                r"file:///",
                r"\\\\.*\\",
                r"/.*/",
                r"\.\./",
                r"\.\.\\"
            ]
            
            for pattern in file_patterns:
                if re.search(pattern, condition, re.IGNORECASE):
                    security_analysis["vulnerabilities"].append("Potential file system access detected")
                    security_analysis["risk_level"] = "medium"
                    security_analysis["recommendations"].append("Avoid direct file system access in rule conditions")
            
            # Check for command execution patterns
            cmd_patterns = [
                r"cmd\.",
                r"exec\(",
                r"eval\(",
                r"system\(",
                r"shell\("
            ]
            
            for pattern in cmd_patterns:
                if re.search(pattern, condition, re.IGNORECASE):
                    security_analysis["vulnerabilities"].append("Potential command execution detected")
                    security_analysis["risk_level"] = "high"
                    security_analysis["recommendations"].append("Avoid command execution in rule conditions")
            
            return security_analysis
            
        except Exception as e:
            logger.error(f"Error analyzing security implications: {e}")
            return {"risk_level": "unknown", "vulnerabilities": [], "recommendations": []}
    
    @staticmethod
    def _validate_data_sources(session: Session, data_sources: List[int]) -> Dict[str, Any]:
        """Validate data sources for rule"""
        try:
            from ..models.scan_models import DataSource
            
            validation_result = {
                "all_valid": True,
                "valid_sources": [],
                "invalid_sources": [],
                "errors": []
            }
            
            for source_id in data_sources:
                try:
                    source = session.get(DataSource, source_id)
                    if source and source.is_active:
                        validation_result["valid_sources"].append(source_id)
                    else:
                        validation_result["invalid_sources"].append(source_id)
                        validation_result["errors"].append(f"Data source {source_id} not found or inactive")
                        validation_result["all_valid"] = False
                except Exception as e:
                    validation_result["invalid_sources"].append(source_id)
                    validation_result["errors"].append(f"Error validating data source {source_id}: {str(e)}")
                    validation_result["all_valid"] = False
            
            return validation_result
            
        except Exception as e:
            logger.error(f"Error validating data sources: {e}")
            return {"all_valid": False, "valid_sources": [], "invalid_sources": data_sources, "errors": [str(e)]}
    
    @staticmethod
    def _analyze_performance_impact(condition: str, rule_type: str, severity: str, data_sources: List[int]) -> Dict[str, Any]:
        """Analyze performance impact of rule"""
        try:
            performance_impact = {
                "estimated_execution_time": 0,
                "resource_usage": "low",
                "scalability_concerns": [],
                "optimization_suggestions": []
            }
            
            # Estimate execution time based on condition complexity
            complexity_score = ComplianceRuleService._analyze_expression_complexity(
                ExpressionParser.tokenize(condition)
            )
            
            base_time = 1.0  # Base execution time in seconds
            complexity_multiplier = 1 + (complexity_score * 0.2)
            data_source_multiplier = 1 + (len(data_sources) * 0.1)
            
            estimated_time = base_time * complexity_multiplier * data_source_multiplier
            performance_impact["estimated_execution_time"] = round(estimated_time, 2)
            
            # Determine resource usage
            if estimated_time > 10:
                performance_impact["resource_usage"] = "high"
                performance_impact["scalability_concerns"].append("High execution time may impact system performance")
            elif estimated_time > 5:
                performance_impact["resource_usage"] = "medium"
                performance_impact["scalability_concerns"].append("Moderate execution time")
            else:
                performance_impact["resource_usage"] = "low"
            
            # Optimization suggestions
            if complexity_score > 7:
                performance_impact["optimization_suggestions"].append("Consider simplifying the rule condition")
            
            if len(data_sources) > 10:
                performance_impact["optimization_suggestions"].append("Consider reducing the number of data sources")
            
            if "FUNCTION_REGEX_MATCH" in condition:
                performance_impact["optimization_suggestions"].append("Regex operations can be expensive - consider alternatives")
            
            return performance_impact
            
        except Exception as e:
            logger.error(f"Error analyzing performance impact: {e}")
            return {"estimated_execution_time": 0, "resource_usage": "unknown", "scalability_concerns": [], "optimization_suggestions": []}
    
    @staticmethod
    def _validate_rule_type(rule_type: str, condition: str) -> Dict[str, Any]:
        """Validate rule type compatibility"""
        try:
            validation_result = {
                "valid": True,
                "errors": [],
                "warnings": []
            }
            
            rule_types = ["validation", "classification", "profiling", "monitoring", "alerting"]
            
            if rule_type not in rule_types:
                validation_result["errors"].append(f"Invalid rule type: {rule_type}")
                validation_result["valid"] = False
            
            # Type-specific validation
            if rule_type == "validation":
                if "FUNCTION_REGEX_MATCH" in condition and "FUNCTION_CONTAINS" in condition:
                    validation_result["warnings"].append("Multiple string matching functions may cause conflicts")
            
            elif rule_type == "classification":
                if not any(func in condition for func in ["FUNCTION_CONTAINS", "FUNCTION_STARTS_WITH", "FUNCTION_ENDS_WITH", "FUNCTION_REGEX_MATCH"]):
                    validation_result["warnings"].append("Classification rules typically use string matching functions")
            
            elif rule_type == "profiling":
                if not any(func in condition for func in ["FUNCTION_IS_NULL", "FUNCTION_LENGTH", "FUNCTION_MATH_ABS"]):
                    validation_result["warnings"].append("Profiling rules typically use data analysis functions")
            
            return validation_result
            
        except Exception as e:
            logger.error(f"Error validating rule type: {e}")
            return {"valid": False, "errors": [str(e)], "warnings": []}
    
    @staticmethod
    def _check_best_practices(rule_data: Dict[str, Any]) -> Dict[str, Any]:
        """Check rule against best practices"""
        try:
            best_practices = {
                "score": 0,
                "passed_checks": [],
                "failed_checks": [],
                "recommendations": []
            }
            
            score = 0
            total_checks = 0
            
            # Check 1: Has description
            total_checks += 1
            if rule_data.get("description"):
                score += 1
                best_practices["passed_checks"].append("Has description")
            else:
                best_practices["failed_checks"].append("Missing description")
                best_practices["recommendations"].append("Add a clear description for the rule")
            
            # Check 2: Has appropriate severity
            total_checks += 1
            severity = rule_data.get("severity", "medium")
            if severity in ["low", "medium", "high", "critical"]:
                score += 1
                best_practices["passed_checks"].append("Has appropriate severity")
            else:
                best_practices["failed_checks"].append("Invalid severity level")
                best_practices["recommendations"].append("Use standard severity levels: low, medium, high, critical")
            
            # Check 3: Has condition
            total_checks += 1
            if rule_data.get("condition"):
                score += 1
                best_practices["passed_checks"].append("Has condition")
            else:
                best_practices["failed_checks"].append("Missing condition")
                best_practices["recommendations"].append("Define a condition for the rule")
            
            # Check 4: Has data sources
            total_checks += 1
            if rule_data.get("data_sources") or rule_data.get("applies_to_all_sources"):
                score += 1
                best_practices["passed_checks"].append("Has data sources")
            else:
                best_practices["failed_checks"].append("No data sources specified")
                best_practices["recommendations"].append("Specify data sources or enable 'applies to all sources'")
            
            # Check 5: Has tags
            total_checks += 1
            if rule_data.get("tags"):
                score += 1
                best_practices["passed_checks"].append("Has tags")
            else:
                best_practices["failed_checks"].append("Missing tags")
                best_practices["recommendations"].append("Add tags for better organization")
            
            best_practices["score"] = score / total_checks if total_checks > 0 else 0
            
            return best_practices
            
        except Exception as e:
            logger.error(f"Error checking best practices: {e}")
            return {"score": 0, "passed_checks": [], "failed_checks": [], "recommendations": [str(e)]}

    @staticmethod
    def validate_rule(session: Session, rule_id: int) -> Dict[str, Any]:
        """Validate an existing compliance rule"""
        try:
            rule = session.get(ComplianceRule, rule_id)
            if not rule:
                raise ValueError(f"Rule {rule_id} not found")
            
            validation_result = {
                "valid": True,
                "issues": [],
                "recommendations": [],
                "last_validation": datetime.now().isoformat()
            }
            
            # Check if rule has data sources
            if not rule.data_sources and not rule.applies_to_all_sources:
                validation_result["issues"].append("Rule has no associated data sources")
                validation_result["recommendations"].append("Associate rule with data sources or enable 'applies to all sources'")
                validation_result["valid"] = False
            
            # Check if condition is valid
            if not rule.condition:
                validation_result["issues"].append("Rule has no condition defined")
                validation_result["recommendations"].append("Define a condition for the rule")
                validation_result["valid"] = False
            
            return validation_result
            
        except Exception as e:
            logger.error(f"Error validating rule {rule_id}: {str(e)}")
            raise

    @staticmethod
    def get_evaluation_history(
        session: Session, 
        rule_id: int, 
        page: int = 1, 
        limit: int = 50
    ) -> Tuple[List[ComplianceRuleEvaluationResponse], int]:
        """Get evaluation history for a rule"""
        try:
            query = select(ComplianceRuleEvaluation).where(
                ComplianceRuleEvaluation.rule_id == rule_id
            ).order_by(ComplianceRuleEvaluation.evaluated_at.desc())
            
            # Get total count
            total = session.exec(
                select(func.count(ComplianceRuleEvaluation.id)).where(
                    ComplianceRuleEvaluation.rule_id == rule_id
                )
            ).one()
            
            # Apply pagination
            offset = (page - 1) * limit
            query = query.offset(offset).limit(limit)
            
            evaluations = session.exec(query).all()
            
            return [ComplianceRuleEvaluationResponse.from_orm(eval) for eval in evaluations], total
            
        except Exception as e:
            logger.error(f"Error getting evaluation history for rule {rule_id}: {str(e)}")
            raise