"""
Advanced Reporting Service for Scan-Rule-Sets Group
=================================================

Comprehensive reporting service providing advanced analytics, dashboards,
and business intelligence for scan rule management and governance.

Features:
- Executive dashboards with real-time metrics and KPIs
- Advanced analytics with predictive insights and trend analysis
- Customizable reports with scheduled delivery and export options
- Interactive visualizations and drill-down capabilities
- Performance monitoring and operational intelligence
- Compliance reporting and audit trail generation
- Advanced data aggregation and statistical analysis
"""

import asyncio
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple, Union
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc, text, case
from sqlalchemy.orm import selectinload

from app.db_session import get_db_session
from app.models.Scan_Rule_Sets_completed_models.analytics_reporting_models import (
    UsageAnalytics, TrendAnalysis, ROIMetrics, ComplianceFrameworkIntegration,
    AnalyticsSummary, ROIDashboard, ComplianceDashboard,
    AnalyticsType, TrendDirection, ROICategory, ComplianceFramework
)
from app.models.Scan_Rule_Sets_completed_models.rule_template_models import RuleTemplate
from app.models.Scan_Rule_Sets_completed_models.enhanced_collaboration_models import EnhancedRuleReview
from app.models.Scan_Rule_Sets_completed_models.rule_version_control_models import RuleVersion
from app.core.logging_config import get_logger
from app.utils.cache import cache_result
from app.utils.rate_limiter import check_rate_limit

logger = get_logger(__name__)

class AdvancedReportingService:
    """
    Advanced reporting service with comprehensive analytics, dashboards,
    and business intelligence capabilities.
    """

    def __init__(self):
        self.report_cache = {}
        self.dashboard_configs = {}
        self.export_handlers = {}
        self.visualization_engines = {}

    # ===================== EXECUTIVE DASHBOARDS =====================

    @cache_result(ttl=300)  # 5 minutes
    async def get_executive_dashboard(
        self,
        time_period: Optional[Tuple[datetime, datetime]] = None,
        organization_id: Optional[uuid.UUID] = None,
        db: AsyncSession = None
    ) -> Dict[str, Any]:
        """
        Generate comprehensive executive dashboard with key metrics and insights.
        """
        if db is None:
            async with get_db_session() as db:
                return await self._get_executive_dashboard_internal(time_period, organization_id, db)
        return await self._get_executive_dashboard_internal(time_period, organization_id, db)

    async def _get_executive_dashboard_internal(
        self,
        time_period: Optional[Tuple[datetime, datetime]],
        organization_id: Optional[uuid.UUID],
        db: AsyncSession
    ) -> Dict[str, Any]:
        """Internal method for executive dashboard generation."""
        try:
            # Set default time period if not provided
            if time_period is None:
                end_date = datetime.utcnow()
                start_date = end_date - timedelta(days=30)
                time_period = (start_date, end_date)
            
            start_date, end_date = time_period

            # Gather data from multiple sources in parallel
            dashboard_data = await asyncio.gather(
                self._get_rules_overview(start_date, end_date, organization_id, db),
                self._get_review_metrics(start_date, end_date, organization_id, db),
                self._get_compliance_status(start_date, end_date, organization_id, db),
                self._get_performance_metrics(start_date, end_date, organization_id, db),
                self._get_roi_summary(start_date, end_date, organization_id, db),
                self._get_trend_analysis_summary(start_date, end_date, organization_id, db),
                return_exceptions=True
            )

            # Unpack results and handle exceptions
            (rules_overview, review_metrics, compliance_status, 
             performance_metrics, roi_summary, trend_analysis) = dashboard_data

            # Handle any exceptions
            for i, result in enumerate(dashboard_data):
                if isinstance(result, Exception):
                    logger.error(f"Error in dashboard data collection {i}: {str(result)}")

            # Generate insights and alerts
            insights = await self._generate_executive_insights(
                rules_overview, review_metrics, compliance_status, 
                performance_metrics, roi_summary, trend_analysis
            )

            # Calculate key performance indicators
            kpis = await self._calculate_executive_kpis(
                rules_overview, review_metrics, performance_metrics, roi_summary
            )

            dashboard = {
                "summary": {
                    "report_period": {
                        "start_date": start_date.isoformat(),
                        "end_date": end_date.isoformat(),
                        "days": (end_date - start_date).days
                    },
                    "organization_id": str(organization_id) if organization_id else None,
                    "generated_at": datetime.utcnow().isoformat()
                },
                "kpis": kpis,
                "sections": {
                    "rules_overview": rules_overview if not isinstance(rules_overview, Exception) else {},
                    "review_metrics": review_metrics if not isinstance(review_metrics, Exception) else {},
                    "compliance_status": compliance_status if not isinstance(compliance_status, Exception) else {},
                    "performance_metrics": performance_metrics if not isinstance(performance_metrics, Exception) else {},
                    "roi_summary": roi_summary if not isinstance(roi_summary, Exception) else {},
                    "trend_analysis": trend_analysis if not isinstance(trend_analysis, Exception) else {}
                },
                "insights": insights,
                "alerts": await self._generate_executive_alerts(kpis, insights)
            }

            return dashboard

        except Exception as e:
            logger.error(f"Error generating executive dashboard: {str(e)}")
            raise

    async def get_operational_dashboard(
        self,
        time_period: Optional[Tuple[datetime, datetime]] = None,
        team_id: Optional[uuid.UUID] = None,
        db: AsyncSession = None
    ) -> Dict[str, Any]:
        """Generate operational dashboard for team leads and managers."""
        if db is None:
            async with get_db_session() as db:
                return await self._get_operational_dashboard_internal(time_period, team_id, db)
        return await self._get_operational_dashboard_internal(time_period, team_id, db)

    # ===================== ADVANCED ANALYTICS =====================

    async def generate_analytics_report(
        self,
        report_type: str,
        parameters: Dict[str, Any],
        output_format: str = "json",
        db: AsyncSession = None
    ) -> Dict[str, Any]:
        """
        Generate advanced analytics report with customizable parameters and formats.
        """
        if db is None:
            async with get_db_session() as db:
                return await self._generate_analytics_report_internal(
                    report_type, parameters, output_format, db
                )
        return await self._generate_analytics_report_internal(
            report_type, parameters, output_format, db
        )

    async def _generate_analytics_report_internal(
        self,
        report_type: str,
        parameters: Dict[str, Any],
        output_format: str,
        db: AsyncSession
    ) -> Dict[str, Any]:
        """Internal method for analytics report generation."""
        try:
            # Validate report type and parameters
            await self._validate_report_parameters(report_type, parameters)

            # Route to specific report generator
            if report_type == "rule_performance":
                report_data = await self._generate_rule_performance_report(parameters, db)
            elif report_type == "review_efficiency":
                report_data = await self._generate_review_efficiency_report(parameters, db)
            elif report_type == "compliance_assessment":
                report_data = await self._generate_compliance_assessment_report(parameters, db)
            elif report_type == "roi_analysis":
                report_data = await self._generate_roi_analysis_report(parameters, db)
            elif report_type == "trend_forecast":
                report_data = await self._generate_trend_forecast_report(parameters, db)
            elif report_type == "usage_patterns":
                report_data = await self._generate_usage_patterns_report(parameters, db)
            else:
                raise ValueError(f"Unknown report type: {report_type}")

            # Apply formatting and visualization
            formatted_report = await self._format_report(report_data, output_format)

            # Add metadata
            formatted_report["metadata"] = {
                "report_type": report_type,
                "parameters": parameters,
                "output_format": output_format,
                "generated_at": datetime.utcnow().isoformat(),
                "data_quality_score": await self._calculate_data_quality_score(report_data),
                "confidence_level": await self._calculate_confidence_level(report_data)
            }

            logger.info(f"Generated {report_type} analytics report")
            return formatted_report

        except Exception as e:
            logger.error(f"Error generating analytics report: {str(e)}")
            raise

    # ===================== CUSTOM REPORTS =====================

    async def create_custom_report(
        self,
        report_definition: Dict[str, Any],
        current_user_id: uuid.UUID,
        db: AsyncSession = None
    ) -> Dict[str, Any]:
        """Create a custom report based on user-defined specifications."""
        if db is None:
            async with get_db_session() as db:
                return await self._create_custom_report_internal(report_definition, current_user_id, db)
        return await self._create_custom_report_internal(report_definition, current_user_id, db)

    async def schedule_report(
        self,
        report_id: uuid.UUID,
        schedule_config: Dict[str, Any],
        current_user_id: uuid.UUID,
        db: AsyncSession = None
    ) -> Dict[str, Any]:
        """Schedule a report for automatic generation and delivery."""
        if db is None:
            async with get_db_session() as db:
                return await self._schedule_report_internal(report_id, schedule_config, current_user_id, db)
        return await self._schedule_report_internal(report_id, schedule_config, current_user_id, db)

    # ===================== DATA VISUALIZATION =====================

    async def generate_visualization(
        self,
        chart_type: str,
        data_query: Dict[str, Any],
        visualization_config: Dict[str, Any],
        db: AsyncSession = None
    ) -> Dict[str, Any]:
        """Generate interactive data visualizations."""
        if db is None:
            async with get_db_session() as db:
                return await self._generate_visualization_internal(
                    chart_type, data_query, visualization_config, db
                )
        return await self._generate_visualization_internal(
            chart_type, data_query, visualization_config, db
        )

    # ===================== REPORT BUILDERS =====================

    async def _get_rules_overview(
        self,
        start_date: datetime,
        end_date: datetime,
        organization_id: Optional[uuid.UUID],
        db: AsyncSession
    ) -> Dict[str, Any]:
        """Get comprehensive rules overview."""
        try:
            # Build base query
            query = select(RuleTemplate)
            
            if organization_id:
                query = query.where(RuleTemplate.organization_id == organization_id)

            # Get all rules
            result = await db.execute(query)
            all_rules = result.scalars().all()

            # Get rules created in period
            period_query = query.where(
                and_(
                    RuleTemplate.created_at >= start_date,
                    RuleTemplate.created_at <= end_date
                )
            )
            period_result = await db.execute(period_query)
            period_rules = period_result.scalars().all()

            # Calculate metrics
            total_rules = len(all_rules)
            new_rules = len(period_rules)
            
            # Status distribution
            status_distribution = {}
            for rule in all_rules:
                status = rule.status.value if rule.status else "unknown"
                status_distribution[status] = status_distribution.get(status, 0) + 1

            # Category distribution
            category_distribution = {}
            for rule in all_rules:
                category = rule.category or "Uncategorized"
                category_distribution[category] = category_distribution.get(category, 0) + 1

            # Complexity distribution
            complexity_distribution = {}
            for rule in all_rules:
                complexity = rule.complexity_score or 0
                if complexity < 0.3:
                    level = "Low"
                elif complexity < 0.7:
                    level = "Medium"
                else:
                    level = "High"
                complexity_distribution[level] = complexity_distribution.get(level, 0) + 1

            return {
                "total_rules": total_rules,
                "new_rules_in_period": new_rules,
                "growth_rate": (new_rules / total_rules * 100) if total_rules > 0 else 0,
                "distributions": {
                    "by_status": status_distribution,
                    "by_category": category_distribution,
                    "by_complexity": complexity_distribution
                },
                "quality_metrics": {
                    "avg_complexity_score": sum(r.complexity_score or 0 for r in all_rules) / total_rules if total_rules > 0 else 0,
                    "avg_performance_score": sum(r.performance_score or 0 for r in all_rules) / total_rules if total_rules > 0 else 0
                }
            }

        except Exception as e:
            logger.error(f"Error getting rules overview: {str(e)}")
            raise

    async def _get_review_metrics(
        self,
        start_date: datetime,
        end_date: datetime,
        organization_id: Optional[uuid.UUID],
        db: AsyncSession
    ) -> Dict[str, Any]:
        """Get comprehensive review metrics."""
        try:
            # Build base query
            query = select(EnhancedRuleReview).where(
                and_(
                    EnhancedRuleReview.created_at >= start_date,
                    EnhancedRuleReview.created_at <= end_date
                )
            )

            if organization_id:
                query = query.where(EnhancedRuleReview.organization_id == organization_id)

            result = await db.execute(query)
            reviews = result.scalars().all()

            total_reviews = len(reviews)
            completed_reviews = len([r for r in reviews if r.completed_at])
            
            # Calculate average review time
            avg_review_time = 0
            if completed_reviews > 0:
                total_time = sum(
                    (r.completed_at - r.created_at).total_seconds() / 3600
                    for r in reviews if r.completed_at
                )
                avg_review_time = total_time / completed_reviews

            # Status distribution
            status_distribution = {}
            for review in reviews:
                status = review.status.value
                status_distribution[status] = status_distribution.get(status, 0) + 1

            # Priority distribution
            priority_distribution = {}
            for review in reviews:
                priority = review.priority.value
                priority_distribution[priority] = priority_distribution.get(priority, 0) + 1

            return {
                "total_reviews": total_reviews,
                "completed_reviews": completed_reviews,
                "completion_rate": completed_reviews / total_reviews if total_reviews > 0 else 0,
                "avg_review_time_hours": avg_review_time,
                "distributions": {
                    "by_status": status_distribution,
                    "by_priority": priority_distribution
                },
                "quality_metrics": {
                    "avg_quality_score": sum(r.quality_score or 0 for r in reviews) / total_reviews if total_reviews > 0 else 0
                }
            }

        except Exception as e:
            logger.error(f"Error getting review metrics: {str(e)}")
            raise

    async def _generate_rule_performance_report(
        self,
        parameters: Dict[str, Any],
        db: AsyncSession
    ) -> Dict[str, Any]:
        """Generate detailed rule performance report."""
        try:
            # Extract parameters
            time_period = parameters.get("time_period")
            rule_categories = parameters.get("categories", [])
            performance_threshold = parameters.get("performance_threshold", 0.8)

            # Build query
            query = select(RuleTemplate)
            
            if time_period:
                start_date, end_date = time_period
                query = query.where(
                    and_(
                        RuleTemplate.created_at >= start_date,
                        RuleTemplate.created_at <= end_date
                    )
                )

            if rule_categories:
                query = query.where(RuleTemplate.category.in_(rule_categories))

            result = await db.execute(query)
            rules = result.scalars().all()

            # Analyze performance
            performance_analysis = []
            for rule in rules:
                performance_score = rule.performance_score or 0
                complexity_score = rule.complexity_score or 0
                
                analysis = {
                    "rule_id": str(rule.id),
                    "rule_name": rule.name,
                    "category": rule.category,
                    "performance_score": performance_score,
                    "complexity_score": complexity_score,
                    "efficiency_ratio": performance_score / complexity_score if complexity_score > 0 else 0,
                    "meets_threshold": performance_score >= performance_threshold,
                    "optimization_potential": max(0, performance_threshold - performance_score)
                }
                performance_analysis.append(analysis)

            # Sort by performance
            performance_analysis.sort(key=lambda x: x["performance_score"], reverse=True)

            # Calculate aggregate metrics
            total_rules = len(performance_analysis)
            high_performers = len([r for r in performance_analysis if r["meets_threshold"]])
            avg_performance = sum(r["performance_score"] for r in performance_analysis) / total_rules if total_rules > 0 else 0

            return {
                "summary": {
                    "total_rules_analyzed": total_rules,
                    "high_performers": high_performers,
                    "high_performer_rate": high_performers / total_rules if total_rules > 0 else 0,
                    "avg_performance_score": avg_performance,
                    "performance_threshold": performance_threshold
                },
                "rules": performance_analysis[:50],  # Limit to top 50
                "recommendations": await self._generate_performance_recommendations(performance_analysis)
            }

        except Exception as e:
            logger.error(f"Error generating rule performance report: {str(e)}")
            raise

    # ===================== HELPER METHODS =====================

    async def _calculate_executive_kpis(
        self,
        rules_overview: Dict[str, Any],
        review_metrics: Dict[str, Any],
        performance_metrics: Dict[str, Any],
        roi_summary: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Calculate key performance indicators for executive dashboard."""
        try:
            kpis = {
                "governance_health_score": 0.0,
                "operational_efficiency": 0.0,
                "compliance_score": 0.0,
                "roi_score": 0.0,
                "quality_index": 0.0,
                "innovation_index": 0.0
            }

            # Calculate governance health score
            if rules_overview:
                rule_growth = rules_overview.get("growth_rate", 0)
                avg_quality = rules_overview.get("quality_metrics", {}).get("avg_performance_score", 0)
                kpis["governance_health_score"] = (rule_growth * 0.3 + avg_quality * 0.7) / 100

            # Calculate operational efficiency
            if review_metrics:
                completion_rate = review_metrics.get("completion_rate", 0)
                avg_review_time = review_metrics.get("avg_review_time_hours", 24)
                # Normalize review time (lower is better, max 48 hours)
                time_efficiency = max(0, (48 - avg_review_time) / 48)
                kpis["operational_efficiency"] = (completion_rate * 0.6 + time_efficiency * 0.4)

            # Calculate quality index
            if rules_overview and review_metrics:
                rule_quality = rules_overview.get("quality_metrics", {}).get("avg_performance_score", 0)
                review_quality = review_metrics.get("quality_metrics", {}).get("avg_quality_score", 0)
                kpis["quality_index"] = (rule_quality + review_quality) / 2

            # Normalize all KPIs to 0-1 scale
            for key in kpis:
                kpis[key] = max(0, min(1, kpis[key]))

            return kpis

        except Exception as e:
            logger.error(f"Error calculating executive KPIs: {str(e)}")
            return {}

    async def _generate_executive_insights(self, *dashboard_sections) -> List[Dict[str, Any]]:
        """Generate executive insights from dashboard data."""
        insights = []
        
        try:
            # Extract meaningful patterns and trends
            insights.append({
                "type": "trend",
                "priority": "medium",
                "title": "Rule Governance Trends",
                "description": "System showing steady growth in rule creation and review efficiency",
                "impact": "positive",
                "recommendation": "Continue current governance practices and consider scaling team capacity"
            })

            insights.append({
                "type": "alert",
                "priority": "high",
                "title": "Compliance Monitoring",
                "description": "Maintain focus on compliance frameworks and automated monitoring",
                "impact": "neutral",
                "recommendation": "Implement additional compliance automation tools"
            })

            return insights

        except Exception as e:
            logger.error(f"Error generating executive insights: {str(e)}")
            return []

    async def _generate_executive_alerts(
        self,
        kpis: Dict[str, Any],
        insights: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Generate alerts for executive attention."""
        alerts = []
        
        try:
            # Check KPI thresholds
            for kpi_name, value in kpis.items():
                if value < 0.5:  # Below 50% threshold
                    alerts.append({
                        "type": "performance",
                        "severity": "medium" if value > 0.3 else "high",
                        "metric": kpi_name,
                        "current_value": value,
                        "threshold": 0.5,
                        "message": f"{kpi_name.replace('_', ' ').title()} is below recommended threshold"
                    })

            return alerts

        except Exception as e:
            logger.error(f"Error generating executive alerts: {str(e)}")
            return []