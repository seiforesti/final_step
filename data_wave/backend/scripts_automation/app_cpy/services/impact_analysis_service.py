"""
Enterprise-level ImpactAnalysisService for comprehensive impact analysis
Provides business, technical, compliance, and dependency impact assessment
"""

import logging
import json
import hashlib
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
import asyncio
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)


class ImpactLevel(Enum):
    """Impact level enumeration"""
    NEGLIGIBLE = "negligible"
    MINOR = "minor"
    MODERATE = "moderate"
    SIGNIFICANT = "significant"
    CRITICAL = "critical"


class ImpactCategory(Enum):
    """Impact category enumeration"""
    BUSINESS = "business"
    TECHNICAL = "technical"
    COMPLIANCE = "compliance"
    SECURITY = "security"
    PERFORMANCE = "performance"
    USER_EXPERIENCE = "user_experience"
    DEPENDENCY = "dependency"
    DATA_QUALITY = "data_quality"


class ImpactAnalysisService:
    """
    Enterprise-level service for analyzing impacts of changes across multiple dimensions
    Provides comprehensive business, technical, and compliance impact assessment
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    async def analyze_business_impact_changes(
        self,
        old_content: Dict[str, Any],
        new_content: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Analyze business impact of content changes
        """
        try:
            impacts = []
            
            # 1. Analyze business-critical field changes
            business_fields = [
                'business_rules', 'pricing', 'contract_terms', 'service_levels',
                'customer_data', 'financial_data', 'compliance_requirements'
            ]
            
            for field in business_fields:
                if field in old_content and field in new_content:
                    if old_content[field] != new_content[field]:
                        impact = await self._assess_business_field_impact(
                            field, old_content[field], new_content[field]
                        )
                        impacts.append(impact)
            
            # 2. Analyze workflow and process changes
            workflow_impacts = await self._analyze_workflow_impacts(old_content, new_content)
            impacts.extend(workflow_impacts)
            
            # 3. Analyze customer impact
            customer_impacts = await self._analyze_customer_impacts(old_content, new_content)
            impacts.extend(customer_impacts)
            
            # 4. Analyze financial impact
            financial_impacts = await self._analyze_financial_impacts(old_content, new_content)
            impacts.extend(financial_impacts)
            
            return impacts
            
        except Exception as e:
            self.logger.error(f"Error analyzing business impact changes: {e}")
            return []
    
    async def analyze_dependency_impact_changes(
        self,
        old_content: Dict[str, Any],
        new_content: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Analyze dependency impact of content changes
        """
        try:
            impacts = []
            
            # 1. Analyze API dependency changes
            api_impacts = await self._analyze_api_dependencies(old_content, new_content)
            impacts.extend(api_impacts)
            
            # 2. Analyze database dependency changes
            db_impacts = await self._analyze_database_dependencies(old_content, new_content)
            impacts.extend(db_impacts)
            
            # 3. Analyze external service dependencies
            external_impacts = await self._analyze_external_dependencies(old_content, new_content)
            impacts.extend(external_impacts)
            
            # 4. Analyze internal service dependencies
            internal_impacts = await self._analyze_internal_dependencies(old_content, new_content)
            impacts.extend(internal_impacts)
            
            return impacts
            
        except Exception as e:
            self.logger.error(f"Error analyzing dependency impact changes: {e}")
            return []
    
    async def _assess_business_field_impact(
        self,
        field: str,
        old_value: Any,
        new_value: Any
    ) -> Dict[str, Any]:
        """
        Assess the business impact of a specific field change
        """
        try:
            # Determine impact level based on field type and change magnitude
            if field in ['pricing', 'contract_terms', 'financial_data']:
                impact_level = ImpactLevel.SIGNIFICANT
                risk_score = 0.8
                category = ImpactCategory.BUSINESS
            elif field in ['business_rules', 'service_levels']:
                impact_level = ImpactLevel.MODERATE
                risk_score = 0.6
                category = ImpactCategory.BUSINESS
            elif field in ['customer_data', 'compliance_requirements']:
                impact_level = ImpactLevel.CRITICAL
                risk_score = 0.9
                category = ImpactCategory.COMPLIANCE
            else:
                impact_level = ImpactLevel.MINOR
                risk_score = 0.4
                category = ImpactCategory.BUSINESS
            
            # Generate mitigation strategies
            mitigation_strategies = self._generate_business_mitigation_strategies(field, impact_level)
            
            return {
                "type": "business_impact",
                "category": category.value,
                "severity": impact_level.value,
                "confidence": 0.85,
                "description": f"Business impact from {field} change",
                "affected_components": [field],
                "risk_score": risk_score,
                "mitigation_strategies": mitigation_strategies,
                "estimated_effort": "medium",
                "business_value": "high",
                "field": field,
                "old_value": str(old_value)[:100] if old_value else None,
                "new_value": str(new_value)[:100] if new_value else None
            }
            
        except Exception as e:
            self.logger.error(f"Error assessing business field impact: {e}")
            return {
                "type": "business_impact",
                "category": "business",
                "severity": "moderate",
                "confidence": 0.5,
                "description": f"Business impact assessment failed for {field}",
                "affected_components": [field],
                "risk_score": 0.5,
                "mitigation_strategies": ["Review and validate changes"],
                "estimated_effort": "unknown",
                "business_value": "unknown"
            }
    
    async def _analyze_workflow_impacts(
        self,
        old_content: Dict[str, Any],
        new_content: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Analyze workflow and process impact changes
        """
        try:
            impacts = []
            
            # Check for workflow-related changes
            workflow_fields = ['workflow_steps', 'approval_process', 'escalation_rules', 'sla_requirements']
            
            for field in workflow_fields:
                if field in old_content and field in new_content:
                    if old_content[field] != new_content[field]:
                        impact = {
                            "type": "workflow_impact",
                            "category": "business",
                            "severity": "moderate",
                            "confidence": 0.8,
                            "description": f"Workflow impact from {field} change",
                            "affected_components": [field],
                            "risk_score": 0.6,
                            "mitigation_strategies": [
                                "Update process documentation",
                                "Train affected teams",
                                "Monitor workflow performance"
                            ],
                            "estimated_effort": "medium",
                            "business_value": "medium",
                            "field": field
                        }
                        impacts.append(impact)
            
            return impacts
            
        except Exception as e:
            self.logger.error(f"Error analyzing workflow impacts: {e}")
            return []
    
    async def _analyze_customer_impacts(
        self,
        old_content: Dict[str, Any],
        new_content: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Analyze customer-facing impact changes
        """
        try:
            impacts = []
            
            # Check for customer-impacting changes
            customer_fields = ['user_interface', 'api_endpoints', 'data_format', 'response_times']
            
            for field in customer_fields:
                if field in old_content and field in new_content:
                    if old_content[field] != new_content[field]:
                        impact = {
                            "type": "customer_impact",
                            "category": "user_experience",
                            "severity": "moderate",
                            "confidence": 0.8,
                            "description": f"Customer impact from {field} change",
                            "affected_components": [field],
                            "risk_score": 0.7,
                            "mitigation_strategies": [
                                "Communicate changes to customers",
                                "Provide migration guidance",
                                "Monitor customer feedback"
                            ],
                            "estimated_effort": "medium",
                            "business_value": "high",
                            "field": field
                        }
                        impacts.append(impact)
            
            return impacts
            
        except Exception as e:
            self.logger.error(f"Error analyzing customer impacts: {e}")
            return []
    
    async def _analyze_financial_impacts(
        self,
        old_content: Dict[str, Any],
        new_content: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Analyze financial impact changes
        """
        try:
            impacts = []
            
            # Check for financial-impacting changes
            financial_fields = ['cost_structure', 'pricing_model', 'revenue_streams', 'budget_allocation']
            
            for field in financial_fields:
                if field in old_content and field in new_content:
                    if old_content[field] != new_content[field]:
                        impact = {
                            "type": "financial_impact",
                            "category": "business",
                            "severity": "significant",
                            "confidence": 0.9,
                            "description": f"Financial impact from {field} change",
                            "affected_components": [field],
                            "risk_score": 0.8,
                            "mitigation_strategies": [
                                "Financial impact assessment",
                                "Stakeholder approval",
                                "Risk mitigation planning"
                            ],
                            "estimated_effort": "high",
                            "business_value": "critical",
                            "field": field
                        }
                        impacts.append(impact)
            
            return impacts
            
        except Exception as e:
            self.logger.error(f"Error analyzing financial impacts: {e}")
            return []
    
    async def _analyze_api_dependencies(
        self,
        old_content: Dict[str, Any],
        new_content: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Analyze API dependency impact changes
        """
        try:
            impacts = []
            
            # Check for API-related changes
            api_fields = ['api_version', 'endpoints', 'authentication', 'rate_limits']
            
            for field in api_fields:
                if field in old_content and field in new_content:
                    if old_content[field] != new_content[field]:
                        impact = {
                            "type": "api_dependency_impact",
                            "category": "dependency",
                            "severity": "moderate",
                            "confidence": 0.8,
                            "description": f"API dependency impact from {field} change",
                            "affected_components": [field],
                            "risk_score": 0.6,
                            "mitigation_strategies": [
                                "Update API documentation",
                                "Notify dependent services",
                                "Version compatibility testing"
                            ],
                            "estimated_effort": "medium",
                            "business_value": "medium",
                            "field": field
                        }
                        impacts.append(impact)
            
            return impacts
            
        except Exception as e:
            self.logger.error(f"Error analyzing API dependencies: {e}")
            return []
    
    async def _analyze_database_dependencies(
        self,
        old_content: Dict[str, Any],
        new_content: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Analyze database dependency impact changes
        """
        try:
            impacts = []
            
            # Check for database-related changes
            db_fields = ['schema', 'indexes', 'constraints', 'stored_procedures']
            
            for field in db_fields:
                if field in old_content and field in new_content:
                    if old_content[field] != new_content[field]:
                        impact = {
                            "type": "database_dependency_impact",
                            "category": "dependency",
                            "severity": "significant",
                            "confidence": 0.9,
                            "description": f"Database dependency impact from {field} change",
                            "affected_components": [field],
                            "risk_score": 0.8,
                            "mitigation_strategies": [
                                "Database migration planning",
                                "Data integrity validation",
                                "Rollback procedures"
                            ],
                            "estimated_effort": "high",
                            "business_value": "high",
                            "field": field
                        }
                        impacts.append(impact)
            
            return impacts
            
        except Exception as e:
            self.logger.error(f"Error analyzing database dependencies: {e}")
            return []
    
    async def _analyze_external_dependencies(
        self,
        old_content: Dict[str, Any],
        new_content: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Analyze external service dependency impact changes
        """
        try:
            impacts = []
            
            # Check for external service changes
            external_fields = ['third_party_services', 'webhooks', 'integrations', 'external_apis']
            
            for field in external_fields:
                if field in old_content and field in new_content:
                    if old_content[field] != new_content[field]:
                        impact = {
                            "type": "external_dependency_impact",
                            "category": "dependency",
                            "severity": "moderate",
                            "confidence": 0.8,
                            "description": f"External dependency impact from {field} change",
                            "affected_components": [field],
                            "risk_score": 0.7,
                            "mitigation_strategies": [
                                "External service validation",
                                "Fallback mechanisms",
                                "Monitoring and alerting"
                            ],
                            "estimated_effort": "medium",
                            "business_value": "medium",
                            "field": field
                        }
                        impacts.append(impact)
            
            return impacts
            
        except Exception as e:
            self.logger.error(f"Error analyzing external dependencies: {e}")
            return []
    
    async def _analyze_internal_dependencies(
        self,
        old_content: Dict[str, Any],
        new_content: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Analyze internal service dependency impact changes
        """
        try:
            impacts = []
            
            # Check for internal service changes
            internal_fields = ['microservices', 'internal_apis', 'service_contracts', 'data_flows']
            
            for field in internal_fields:
                if field in old_content and field in new_content:
                    if old_content[field] != new_content[field]:
                        impact = {
                            "type": "internal_dependency_impact",
                            "category": "dependency",
                            "severity": "moderate",
                            "confidence": 0.8,
                            "description": f"Internal dependency impact from {field} change",
                            "affected_components": [field],
                            "risk_score": 0.6,
                            "mitigation_strategies": [
                                "Service contract updates",
                                "Integration testing",
                                "Deployment coordination"
                            ],
                            "estimated_effort": "medium",
                            "business_value": "medium",
                            "field": field
                        }
                        impacts.append(impact)
            
            return impacts
            
        except Exception as e:
            self.logger.error(f"Error analyzing internal dependencies: {e}")
            return []
    
    def _generate_business_mitigation_strategies(
        self,
        field: str,
        impact_level: ImpactLevel
    ) -> List[str]:
        """
        Generate appropriate mitigation strategies for business impacts
        """
        if impact_level == ImpactLevel.CRITICAL:
            return [
                "Immediate stakeholder notification",
                "Business impact assessment",
                "Risk mitigation planning",
                "Rollback procedures",
                "Executive approval required"
            ]
        elif impact_level == ImpactLevel.SIGNIFICANT:
            return [
                "Business review and approval",
                "Impact assessment",
                "Change management planning",
                "Stakeholder communication"
            ]
        elif impact_level == ImpactLevel.MODERATE:
            return [
                "Business review",
                "Impact documentation",
                "Team notification"
            ]
        else:
            return [
                "Document changes",
                "Team awareness"
            ]
    
    async def get_impact_summary(
        self,
        impacts: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generate a summary of all impacts
        """
        try:
            if not impacts:
                return {
                    "total_impacts": 0,
                    "impact_categories": {},
                    "severity_distribution": {},
                    "overall_risk_score": 0.0
                }
            
            # Count impacts by category and severity
            categories = {}
            severities = {}
            total_risk_score = 0.0
            
            for impact in impacts:
                category = impact.get('category', 'unknown')
                severity = impact.get('severity', 'unknown')
                risk_score = impact.get('risk_score', 0.0)
                
                categories[category] = categories.get(category, 0) + 1
                severities[severity] = severities.get(severity, 0) + 1
                total_risk_score += risk_score
            
            avg_risk_score = total_risk_score / len(impacts) if impacts else 0.0
            
            # Determine overall risk level
            if avg_risk_score >= 0.8:
                overall_risk = "critical"
            elif avg_risk_score >= 0.6:
                overall_risk = "high"
            elif avg_risk_score >= 0.4:
                overall_risk = "medium"
            else:
                overall_risk = "low"
            
            return {
                "total_impacts": len(impacts),
                "impact_categories": categories,
                "severity_distribution": severities,
                "overall_risk_score": round(avg_risk_score, 2),
                "overall_risk_level": overall_risk,
                "critical_impacts": len([i for i in impacts if i.get('severity') == 'critical']),
                "high_priority_impacts": len([i for i in impacts if i.get('severity') in ['critical', 'significant']])
            }
            
        except Exception as e:
            self.logger.error(f"Error generating impact summary: {e}")
            return {
                "total_impacts": 0,
                "error": str(e)
            }
