from sqlmodel import Session
from typing import Dict, Any, List
import logging
from datetime import datetime

from app.models.compliance_extended_models import (
    ComplianceReportTemplate, ReportType,
    ComplianceWorkflowTemplate, WorkflowType,
    ComplianceIntegration, IntegrationType, IntegrationStatus
)

logger = logging.getLogger(__name__)


class ComplianceDataSeeder:
    """Service to seed compliance tables with initial template data"""
    
    @staticmethod
    def seed_report_templates(session: Session):
        """Seed report templates"""
        try:
            # Check if templates already exist
            existing_templates = session.query(ComplianceReportTemplate).count()
            if existing_templates > 0:
                logger.info("Report templates already exist, skipping seeding")
                return
            
            templates = [
                {
                    "name": "SOC 2 Status Report",
                    "template_id": "soc2_status",
                    "description": "Standard SOC 2 compliance status report",
                    "framework": "soc2",
                    "report_type": ReportType.COMPLIANCE_STATUS,
                    "sections": [
                        {"name": "Executive Summary", "required": True},
                        {"name": "Control Status", "required": True},
                        {"name": "Findings", "required": True},
                        {"name": "Recommendations", "required": False}
                    ],
                    "file_formats": ["pdf", "excel"],
                    "default_parameters": {
                        "include_charts": True,
                        "include_trends": True,
                        "detail_level": "summary"
                    },
                    "category": "security",
                    "complexity_level": "intermediate",
                    "estimated_generation_time": 15
                },
                {
                    "name": "GDPR Gap Analysis",
                    "template_id": "gdpr_gap_analysis",
                    "description": "GDPR compliance gap analysis report",
                    "framework": "gdpr",
                    "report_type": ReportType.GAP_ANALYSIS,
                    "sections": [
                        {"name": "Overview", "required": True},
                        {"name": "Gap Analysis", "required": True},
                        {"name": "Risk Assessment", "required": True},
                        {"name": "Remediation Plan", "required": True}
                    ],
                    "file_formats": ["pdf", "excel"],
                    "default_parameters": {
                        "include_risk_matrix": True,
                        "include_timeline": True,
                        "detail_level": "detailed"
                    },
                    "category": "privacy",
                    "complexity_level": "advanced",
                    "estimated_generation_time": 25
                },
                {
                    "name": "Executive Dashboard",
                    "template_id": "executive_dashboard",
                    "description": "High-level compliance overview for executives",
                    "framework": "all",
                    "report_type": ReportType.EXECUTIVE_SUMMARY,
                    "sections": [
                        {"name": "Compliance Score", "required": True},
                        {"name": "Key Metrics", "required": True},
                        {"name": "Risk Summary", "required": True},
                        {"name": "Priorities", "required": True}
                    ],
                    "file_formats": ["pdf", "html"],
                    "default_parameters": {
                        "executive_summary": True,
                        "visual_format": True,
                        "detail_level": "summary"
                    },
                    "category": "executive",
                    "complexity_level": "basic",
                    "estimated_generation_time": 10
                },
                {
                    "name": "PCI DSS Assessment",
                    "template_id": "pci_dss_assessment",
                    "description": "PCI DSS compliance assessment report",
                    "framework": "pci",
                    "report_type": ReportType.COMPLIANCE_STATUS,
                    "sections": [
                        {"name": "Requirements Overview", "required": True},
                        {"name": "Testing Results", "required": True},
                        {"name": "Vulnerabilities", "required": True},
                        {"name": "Remediation Actions", "required": True}
                    ],
                    "file_formats": ["pdf", "excel"],
                    "default_parameters": {
                        "include_evidence": True,
                        "include_scan_results": True,
                        "detail_level": "detailed"
                    },
                    "category": "financial",
                    "complexity_level": "advanced",
                    "estimated_generation_time": 30
                }
            ]
            
            for template_data in templates:
                template = ComplianceReportTemplate(**template_data)
                session.add(template)
            
            session.commit()
            logger.info(f"Seeded {len(templates)} report templates")
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error seeding report templates: {str(e)}")
            raise
    
    @staticmethod
    def seed_workflow_templates(session: Session):
        """Seed workflow templates"""
        try:
            # Check if templates already exist
            existing_templates = session.query(ComplianceWorkflowTemplate).count()
            if existing_templates > 0:
                logger.info("Workflow templates already exist, skipping seeding")
                return
            
            templates = [
                {
                    "name": "SOC 2 Assessment",
                    "template_id": "soc2_assessment",
                    "description": "Standard SOC 2 compliance assessment workflow",
                    "workflow_type": WorkflowType.ASSESSMENT,
                    "framework": "soc2",
                    "steps_template": [
                        {
                            "name": "Planning",
                            "type": "manual",
                            "description": "Plan the assessment scope and timeline",
                            "estimated_duration_hours": 16,
                            "required_roles": ["compliance_manager"],
                            "outputs": ["assessment_plan", "scope_document"]
                        },
                        {
                            "name": "Data Collection",
                            "type": "automated",
                            "description": "Collect evidence and documentation",
                            "estimated_duration_hours": 8,
                            "required_roles": ["system"],
                            "outputs": ["evidence_package", "data_inventory"]
                        },
                        {
                            "name": "Control Testing",
                            "type": "manual",
                            "description": "Test effectiveness of controls",
                            "estimated_duration_hours": 40,
                            "required_roles": ["auditor", "compliance_analyst"],
                            "outputs": ["test_results", "findings_report"]
                        },
                        {
                            "name": "Review",
                            "type": "approval",
                            "description": "Review findings and approve report",
                            "estimated_duration_hours": 8,
                            "required_roles": ["compliance_manager"],
                            "outputs": ["approved_report"]
                        },
                        {
                            "name": "Report Generation",
                            "type": "automated",
                            "description": "Generate final compliance report",
                            "estimated_duration_hours": 2,
                            "required_roles": ["system"],
                            "outputs": ["compliance_report", "certificate"]
                        }
                    ],
                    "triggers_template": [
                        {"type": "manual", "name": "Manual Start"},
                        {"type": "scheduled", "name": "Annual Assessment", "cron": "0 0 1 1 *"}
                    ],
                    "default_variables": {
                        "assessment_period": "annual",
                        "evidence_retention": "7_years",
                        "notification_channels": ["email", "slack"]
                    },
                    "estimated_completion_hours": 74,
                    "complexity_level": "intermediate",
                    "required_roles": ["compliance_manager", "auditor", "compliance_analyst"],
                    "category": "security"
                },
                {
                    "name": "GDPR Gap Analysis",
                    "template_id": "gdpr_gap_analysis",
                    "description": "GDPR compliance gap analysis workflow",
                    "workflow_type": WorkflowType.ASSESSMENT,
                    "framework": "gdpr",
                    "steps_template": [
                        {
                            "name": "Data Mapping",
                            "type": "manual",
                            "description": "Map personal data processing activities",
                            "estimated_duration_hours": 24,
                            "required_roles": ["privacy_officer", "data_analyst"],
                            "outputs": ["data_map", "processing_inventory"]
                        },
                        {
                            "name": "Privacy Impact Assessment",
                            "type": "manual",
                            "description": "Conduct privacy impact assessment",
                            "estimated_duration_hours": 16,
                            "required_roles": ["privacy_officer", "legal_counsel"],
                            "outputs": ["pia_report", "risk_assessment"]
                        },
                        {
                            "name": "Gap Identification",
                            "type": "automated",
                            "description": "Identify compliance gaps automatically",
                            "estimated_duration_hours": 4,
                            "required_roles": ["system"],
                            "outputs": ["gap_analysis", "compliance_matrix"]
                        },
                        {
                            "name": "Remediation Planning",
                            "type": "manual",
                            "description": "Create remediation action plan",
                            "estimated_duration_hours": 16,
                            "required_roles": ["privacy_officer", "compliance_manager"],
                            "outputs": ["remediation_plan", "timeline"]
                        }
                    ],
                    "triggers_template": [
                        {"type": "manual", "name": "Manual Start"},
                        {"type": "event", "name": "New Data Processing", "event": "data_processing_added"}
                    ],
                    "default_variables": {
                        "assessment_scope": "all_processing",
                        "legal_basis_review": True,
                        "dpo_involvement": True
                    },
                    "estimated_completion_hours": 60,
                    "complexity_level": "advanced",
                    "required_roles": ["privacy_officer", "data_analyst", "legal_counsel"],
                    "category": "privacy"
                },
                {
                    "name": "Incident Response",
                    "template_id": "incident_response",
                    "description": "Standard compliance incident response workflow",
                    "workflow_type": WorkflowType.INCIDENT_RESPONSE,
                    "framework": "all",
                    "steps_template": [
                        {
                            "name": "Incident Detection",
                            "type": "automated",
                            "description": "Detect and classify the incident",
                            "estimated_duration_hours": 0.5,
                            "required_roles": ["system"],
                            "outputs": ["incident_alert", "classification"]
                        },
                        {
                            "name": "Impact Assessment",
                            "type": "manual",
                            "description": "Assess the impact of the incident",
                            "estimated_duration_hours": 2,
                            "required_roles": ["incident_manager", "compliance_officer"],
                            "outputs": ["impact_assessment", "severity_rating"]
                        },
                        {
                            "name": "Containment",
                            "type": "manual",
                            "description": "Contain the incident to prevent further damage",
                            "estimated_duration_hours": 4,
                            "required_roles": ["security_team", "it_operations"],
                            "outputs": ["containment_report", "affected_systems"]
                        },
                        {
                            "name": "Remediation",
                            "type": "manual",
                            "description": "Remediate the root cause",
                            "estimated_duration_hours": 16,
                            "required_roles": ["development_team", "security_team"],
                            "outputs": ["remediation_report", "fix_verification"]
                        },
                        {
                            "name": "Recovery Validation",
                            "type": "manual",
                            "description": "Validate full recovery and functionality",
                            "estimated_duration_hours": 4,
                            "required_roles": ["qa_team", "compliance_officer"],
                            "outputs": ["recovery_report", "compliance_validation"]
                        },
                        {
                            "name": "Post-Incident Review",
                            "type": "manual",
                            "description": "Conduct post-incident review and lessons learned",
                            "estimated_duration_hours": 8,
                            "required_roles": ["incident_manager", "compliance_officer"],
                            "outputs": ["pir_report", "lessons_learned", "improvements"]
                        }
                    ],
                    "triggers_template": [
                        {"type": "event", "name": "Security Alert", "event": "security_incident"},
                        {"type": "event", "name": "Compliance Violation", "event": "compliance_violation"}
                    ],
                    "default_variables": {
                        "escalation_time": "2_hours",
                        "notification_required": True,
                        "external_reporting": False
                    },
                    "estimated_completion_hours": 35,
                    "complexity_level": "advanced",
                    "required_roles": ["incident_manager", "security_team", "compliance_officer"],
                    "category": "incident"
                }
            ]
            
            for template_data in templates:
                template = ComplianceWorkflowTemplate(**template_data)
                session.add(template)
            
            session.commit()
            logger.info(f"Seeded {len(templates)} workflow templates")
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error seeding workflow templates: {str(e)}")
            raise
    
    @staticmethod
    def seed_integration_catalog(session: Session):
        """Seed integration catalog with available integrations"""
        try:
            # This would typically be done through the regular API, but we can seed some examples
            # In production, this would be managed through the integration management interface
            
            # Ensure a minimal set of integrations are present
            from app.models.compliance_models import ComplianceIntegration
            existing = {i.name for i in session.query(ComplianceIntegration).all()}
            defaults = [
                {"name": "Slack", "type": "notification", "config": {"webhook": ""}},
                {"name": "Jira", "type": "ticketing", "config": {"project": ""}},
                {"name": "ServiceNow", "type": "it_sm", "config": {}},
            ]
            created = 0
            for d in defaults:
                if d["name"] not in existing:
                    session.add(ComplianceIntegration(name=d["name"], integration_type=d["type"], config=d["config"]))
                    created += 1
            if created:
                session.commit()
                logger.info(f"Seeded {created} compliance integrations (Slack/Jira/ServiceNow)")
            else:
                logger.info("Compliance integrations already present; no seeding required")
            
        except Exception as e:
            logger.error(f"Error seeding integration catalog: {str(e)}")
            raise
    
    @staticmethod
    def seed_all(session: Session):
        """Seed all compliance template data"""
        try:
            logger.info("Starting compliance data seeding...")
            
            ComplianceDataSeeder.seed_report_templates(session)
            ComplianceDataSeeder.seed_workflow_templates(session)
            ComplianceDataSeeder.seed_integration_catalog(session)
            
            logger.info("Compliance data seeding completed successfully")
            
        except Exception as e:
            logger.error(f"Error during compliance data seeding: {str(e)}")
            raise