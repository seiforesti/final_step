from sqlmodel import Session, select
from typing import List, Dict, Any
import logging
from datetime import datetime

# **INTERCONNECTED: Import all models and services**
from app.models.compliance_rule_models import (
    ComplianceRule, ComplianceRuleCreate, ComplianceRuleType, 
    ComplianceRuleSeverity, ComplianceRuleStatus, ComplianceRuleScope
)
from app.models.scan_models import DataSource, ScanRuleSet
from app.services.compliance_rule_service import ComplianceRuleService
from app.services.data_source_service import DataSourceService
from app.db_session import get_session

logger = logging.getLogger(__name__)


class ComplianceRuleInitService:
    """Service for initializing compliance rules and framework integrations"""
    
    @staticmethod
    def initialize_default_compliance_rules(session: Session) -> Dict[str, Any]:
        """Initialize default compliance rules from all frameworks"""
        try:
            # Get all frameworks and their templates
            frameworks = ComplianceRuleService.get_compliance_frameworks()
            
            created_rules = []
            skipped_rules = []
            error_rules = []
            
            for framework in frameworks:
                framework_id = framework["id"]
                framework_name = framework["name"]
                templates = framework.get("templates", [])
                
                logger.info(f"Initializing rules for framework: {framework_name}")
                
                for template in templates:
                    try:
                        # Check if rule already exists
                        existing_rules = session.exec(
                            select(ComplianceRule).where(
                                ComplianceRule.name == template["name"]
                            )
                        ).all()
                        
                        if existing_rules:
                            skipped_rules.append({
                                "template_id": template["id"],
                                "name": template["name"],
                                "reason": "Rule already exists"
                            })
                            continue
                        
                        # Create rule from template
                        rule_data = ComplianceRuleCreate(
                            name=template["name"],
                            description=template["description"],
                            rule_type=ComplianceRuleType(template["rule_type"]),
                            severity=ComplianceRuleSeverity(template["severity"]),
                            scope=ComplianceRuleScope(template.get("scope", "global")),
                            condition=template["condition"],
                            compliance_standard=framework_name,
                            business_impact=template.get("business_impact", "medium"),
                            regulatory_requirement=template.get("regulatory_requirement", False),
                            remediation_steps=template.get("remediation_steps"),
                            validation_frequency=template.get("validation_frequency", "weekly"),
                            tags=[framework_id, template["rule_type"]],
                            metadata={
                                "framework_id": framework_id,
                                "template_id": template["id"],
                                "reference": template.get("reference"),
                                "reference_link": template.get("reference_link"),
                                "is_built_in": True,
                                "created_from_init": True
                            }
                        )
                        
                        rule = ComplianceRuleService.create_rule(
                            session=session,
                            rule_data=rule_data,
                            created_by="system_init"
                        )
                        
                        created_rules.append({
                            "id": rule.id,
                            "name": rule.name,
                            "framework": framework_name,
                            "template_id": template["id"]
                        })
                        
                        logger.info(f"Created rule: {rule.name} (ID: {rule.id})")
                        
                    except Exception as rule_error:
                        error_rules.append({
                            "template_id": template["id"],
                            "name": template["name"],
                            "error": str(rule_error)
                        })
                        logger.error(f"Failed to create rule from template {template['id']}: {rule_error}")
            
            result = {
                "frameworks_processed": len(frameworks),
                "rules_created": len(created_rules),
                "rules_skipped": len(skipped_rules),
                "rules_failed": len(error_rules),
                "created_rules": created_rules,
                "skipped_rules": skipped_rules,
                "error_rules": error_rules,
                "initialized_at": datetime.now().isoformat()
            }
            
            logger.info(f"Compliance rule initialization complete: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Error initializing compliance rules: {str(e)}")
            raise
    
    @staticmethod
    def link_rules_to_data_sources(session: Session, auto_link: bool = True) -> Dict[str, Any]:
        """Link compliance rules to appropriate data sources based on their characteristics"""
        try:
            # **INTERCONNECTED: Get all data sources using existing service**
            data_sources = DataSourceService.get_all_data_sources(session)
            
            # Get all compliance rules
            rules = session.exec(select(ComplianceRule)).all()
            
            linked_count = 0
            link_details = []
            
            for rule in rules:
                applicable_sources = []
                
                for ds in data_sources:
                    is_applicable = ComplianceRuleInitService._is_rule_applicable_to_source(rule, ds)
                    
                    if is_applicable:
                        applicable_sources.append(ds)
                
                # Link rule to applicable data sources
                if applicable_sources and auto_link:
                    try:
                        # Clear existing relationships
                        rule.data_sources.clear()
                        
                        # Add new relationships
                        for ds in applicable_sources:
                            rule.data_sources.append(ds)
                        
                        session.add(rule)
                        linked_count += 1
                        
                        link_details.append({
                            "rule_id": rule.id,
                            "rule_name": rule.name,
                            "linked_sources": len(applicable_sources),
                            "source_ids": [ds.id for ds in applicable_sources]
                        })
                        
                        logger.info(f"Linked rule {rule.name} to {len(applicable_sources)} data sources")
                        
                    except Exception as link_error:
                        logger.error(f"Failed to link rule {rule.id} to data sources: {link_error}")
            
            if auto_link:
                session.commit()
            
            return {
                "rules_processed": len(rules),
                "rules_linked": linked_count,
                "total_data_sources": len(data_sources),
                "link_details": link_details,
                "linked_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error linking rules to data sources: {str(e)}")
            raise
    
    @staticmethod
    def _is_rule_applicable_to_source(rule: ComplianceRule, data_source: DataSource) -> bool:
        """Determine if a compliance rule is applicable to a specific data source"""
        try:
            # Global rules apply to all sources
            if rule.scope == ComplianceRuleScope.GLOBAL and rule.applies_to_all_sources:
                return True
            
            # Check rule type applicability
            if rule.rule_type == ComplianceRuleType.ENCRYPTION:
                # Encryption rules apply to all sources, especially sensitive ones
                return True
            
            elif rule.rule_type == ComplianceRuleType.ACCESS_CONTROL:
                # Access control rules apply to monitored sources
                return data_source.monitoring_enabled or data_source.criticality.value in ["critical", "high"]
            
            elif rule.rule_type == ComplianceRuleType.PRIVACY:
                # Privacy rules apply to sources with personal data
                if data_source.data_classification and data_source.data_classification.value in ["confidential", "restricted"]:
                    return True
                if data_source.tags and any(tag in ["pii", "phi", "personal_data"] for tag in data_source.tags):
                    return True
            
            elif rule.rule_type == ComplianceRuleType.AUDIT:
                # Audit rules apply to production and critical sources
                if data_source.environment and data_source.environment.value == "production":
                    return True
                if data_source.criticality and data_source.criticality.value in ["critical", "high"]:
                    return True
            
            elif rule.rule_type == ComplianceRuleType.MONITORING:
                # Monitoring rules apply to all production sources
                return data_source.environment and data_source.environment.value == "production"
            
            elif rule.rule_type == ComplianceRuleType.DATA_RETENTION:
                # Data retention rules apply to sources with retention requirements
                if data_source.tags and any(tag in ["retention", "archival", "backup"] for tag in data_source.tags):
                    return True
                return data_source.backup_enabled
            
            elif rule.rule_type == ComplianceRuleType.SECURITY:
                # Security rules apply to all sources with security requirements
                return data_source.criticality and data_source.criticality.value in ["critical", "high", "medium"]
            
            # Check compliance standard applicability
            if rule.compliance_standard:
                standard_lower = rule.compliance_standard.lower()
                
                # HIPAA applies to healthcare data
                if "hipaa" in standard_lower:
                    if data_source.tags and any(tag in ["healthcare", "phi", "medical"] for tag in data_source.tags):
                        return True
                
                # PCI DSS applies to payment data
                elif "pci" in standard_lower:
                    if data_source.tags and any(tag in ["payment", "financial", "card_data"] for tag in data_source.tags):
                        return True
                
                # GDPR applies to EU personal data
                elif "gdpr" in standard_lower:
                    if data_source.tags and any(tag in ["eu", "personal_data", "pii"] for tag in data_source.tags):
                        return True
                
                # SOC 2 applies to service organizations (general applicability)
                elif "soc" in standard_lower:
                    return True
            
            # Default: apply to production and critical sources
            return (data_source.environment and data_source.environment.value == "production") or \
                   (data_source.criticality and data_source.criticality.value in ["critical", "high"])
                   
        except Exception as e:
            logger.warning(f"Error determining rule applicability: {e}")
            return False
    
    @staticmethod
    def create_scan_rule_integrations(session: Session) -> Dict[str, Any]:
        """Create scan rule set integrations for compliance rules"""
        try:
            # **INTERCONNECTED: Get existing scan rule sets**
            scan_rule_sets = session.exec(select(ScanRuleSet)).all()
            
            # Get compliance rules that need scan integration
            rules = session.exec(
                select(ComplianceRule).where(
                    ComplianceRule.auto_scan_on_evaluation == True
                )
            ).all()
            
            integrated_count = 0
            integration_details = []
            
            for rule in rules:
                if rule.scan_rule_set_id:
                    continue  # Already has scan integration
                
                # Find appropriate scan rule set
                suitable_scan_set = None
                
                # Look for scan sets associated with the same data sources
                for scan_set in scan_rule_sets:
                    if scan_set.data_source_id:
                        # Check if any of the rule's data sources match
                        rule_source_ids = [ds.id for ds in rule.data_sources]
                        if scan_set.data_source_id in rule_source_ids:
                            suitable_scan_set = scan_set
                            break
                
                # If no specific scan set found, use a general one or create default
                if not suitable_scan_set and scan_rule_sets:
                    suitable_scan_set = scan_rule_sets[0]  # Use first available
                
                if suitable_scan_set:
                    rule.scan_rule_set_id = suitable_scan_set.id
                    session.add(rule)
                    integrated_count += 1
                    
                    integration_details.append({
                        "rule_id": rule.id,
                        "rule_name": rule.name,
                        "scan_rule_set_id": suitable_scan_set.id,
                        "scan_rule_set_name": suitable_scan_set.name
                    })
                    
                    logger.info(f"Integrated rule {rule.name} with scan rule set {suitable_scan_set.name}")
            
            session.commit()
            
            return {
                "rules_processed": len(rules),
                "integrations_created": integrated_count,
                "available_scan_sets": len(scan_rule_sets),
                "integration_details": integration_details,
                "integrated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating scan rule integrations: {str(e)}")
            raise
    
    @staticmethod
    def initialize_complete_system(session: Session) -> Dict[str, Any]:
        """Initialize the complete compliance system with all integrations"""
        try:
            logger.info("Starting complete compliance system initialization...")
            
            # Step 1: Initialize default compliance rules
            rules_result = ComplianceRuleInitService.initialize_default_compliance_rules(session)
            
            # Step 2: Link rules to data sources
            linking_result = ComplianceRuleInitService.link_rules_to_data_sources(session, auto_link=True)
            
            # Step 3: Create scan rule integrations
            scan_integration_result = ComplianceRuleInitService.create_scan_rule_integrations(session)
            
            complete_result = {
                "initialization_complete": True,
                "steps_completed": 3,
                "rules_initialization": rules_result,
                "data_source_linking": linking_result,
                "scan_integration": scan_integration_result,
                "system_ready": True,
                "completed_at": datetime.now().isoformat()
            }
            
            logger.info("Complete compliance system initialization finished successfully")
            return complete_result
            
        except Exception as e:
            logger.error(f"Error in complete system initialization: {str(e)}")
            raise
    
    @staticmethod
    def get_system_status(session: Session) -> Dict[str, Any]:
        """Get the current status of the compliance system"""
        try:
            # Count rules by framework
            rules = session.exec(select(ComplianceRule)).all()
            framework_counts = {}
            
            for rule in rules:
                framework = rule.compliance_standard or "Unknown"
                framework_counts[framework] = framework_counts.get(framework, 0) + 1
            
            # Count data source relationships
            linked_rules = len([r for r in rules if r.data_sources])
            
            # Count scan integrations
            scan_integrated_rules = len([r for r in rules if r.scan_rule_set_id])
            
            # **INTERCONNECTED: Get data source count using existing service**
            data_sources = DataSourceService.get_all_data_sources(session)
            
            return {
                "total_rules": len(rules),
                "framework_distribution": framework_counts,
                "rules_linked_to_sources": linked_rules,
                "rules_with_scan_integration": scan_integrated_rules,
                "total_data_sources": len(data_sources),
                "system_health": "healthy" if len(rules) > 0 else "needs_initialization",
                "last_checked": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting system status: {str(e)}")
            return {
                "system_health": "error",
                "error": str(e),
                "last_checked": datetime.now().isoformat()
            }