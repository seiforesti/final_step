"""
Enterprise Catalog Quality Service
Comprehensive data quality management service for enterprise-grade catalog operations.
Provides automated quality assessment, continuous monitoring, configurable rules,
quality scoring, trend analysis, and intelligent recommendations.
"""

import asyncio
import json
import logging
import math
import numpy as np
import pandas as pd
import re
import time
from collections import defaultdict, deque
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Set, Tuple, Union
from uuid import uuid4

from sqlalchemy import text, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, delete

from ..core.cache_manager import EnterpriseCacheManager as CacheManager
from ..db_session import get_session, get_db_session
from ..core.logging_config import get_logger
from ..core.settings import settings_manager
from ..models.catalog_quality_models import *
from ..services.ai_service import EnterpriseAIService as AIService

try:
    from ..core.settings import get_settings as _get_settings
    def get_settings():
        return _get_settings()
except Exception:
    from ..core.config import settings
    def get_settings():
        return settings

logger = get_logger(__name__)

class QualityAssessmentConfig:
    """Configuration for quality assessment"""
    
    def __init__(self):
        self.default_score_method = QualityScoreMethod.WEIGHTED_AVERAGE
        self.min_confidence_threshold = 0.6
        self.batch_size = 100
        self.parallel_assessments = 5
        self.cache_ttl = 3600
        self.monitoring_interval = 300  # seconds
        self.alert_cooldown = 900  # seconds
        self.max_retries = 3
        self.timeout_seconds = 120
        
        # Quality thresholds
        self.excellent_threshold = 90.0
        self.good_threshold = 75.0
        self.warning_threshold = 60.0
        self.critical_threshold = 40.0
        
        # Trend analysis
        self.trend_window_days = 30
        self.volatility_threshold = 0.15
        self.improvement_threshold = 5.0
        self.degradation_threshold = -5.0

class CatalogQualityService:
    """
    Enterprise-grade catalog quality service providing:
    - Automated quality assessment and scoring
    - Continuous quality monitoring
    - Configurable quality rules engine
    - Quality trend analysis and reporting
    - Real-time alerts and notifications
    - Quality recommendations and insights
    """
    
    def __init__(self):
        self.settings = get_settings()
        self.cache = CacheManager()
        self.ai_service = AIService()
        
        self.config = QualityAssessmentConfig()
        
        # Quality rule definitions
        self.rule_definitions = {
            QualityRuleType.NULL_CHECK: self._null_check_rule,
            QualityRuleType.RANGE_CHECK: self._range_check_rule,
            QualityRuleType.FORMAT_CHECK: self._format_check_rule,
            QualityRuleType.UNIQUENESS_CHECK: self._uniqueness_check_rule,
            QualityRuleType.REFERENTIAL_INTEGRITY: self._referential_integrity_rule,
            QualityRuleType.CUSTOM_SQL: self._custom_sql_rule,
            QualityRuleType.PATTERN_MATCH: self._pattern_match_rule,
            QualityRuleType.STATISTICAL_OUTLIER: self._statistical_outlier_rule,
            QualityRuleType.BUSINESS_RULE: self._business_rule,
            QualityRuleType.CROSS_REFERENCE: self._cross_reference_rule
        }
        
        # Performance tracking
        self.metrics = {
            'assessments_performed': 0,
            'rules_executed': 0,
            'alerts_generated': 0,
            'average_assessment_time': 0.0,
            'cache_hit_rate': 0.0,
            'quality_trend': QualityTrend.UNKNOWN,
            'total_assets_monitored': 0
        }
        
        # Active monitoring
        self.active_monitors = {}
        self.alert_history = deque(maxlen=1000)
        self.quality_history = deque(maxlen=10000)
        
        # Threading
        self.executor = ThreadPoolExecutor(max_workers=10)
        
        # Start background tasks only when an event loop is running; defer otherwise
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(self._monitoring_loop())
            loop.create_task(self._cleanup_loop())
        except RuntimeError:
            # Will be started by router startup or external orchestrator
            pass

    def start(self) -> None:
        """Start background monitoring tasks when an event loop exists."""
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(self._monitoring_loop())
            loop.create_task(self._cleanup_loop())
        except RuntimeError:
            pass
    
    async def assess_asset_quality(
        self,
        asset_id: str,
        rule_ids: Optional[List[str]] = None,
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Perform comprehensive quality assessment for a catalog asset
        
        Args:
            asset_id: Unique identifier for the catalog asset
            rule_ids: Specific quality rules to apply (all if None)
            options: Additional assessment options
            
        Returns:
            Quality assessment results with scores and recommendations
        """
        start_time = time.time()
        
        try:
            async with get_session() as session:
                # Get applicable quality rules
                if rule_ids:
                    rules_query = select(DataQualityRule).where(
                        DataQualityRule.rule_id.in_(rule_ids),
                        DataQualityRule.is_active == True
                    )
                else:
                    rules_query = select(DataQualityRule).where(
                        DataQualityRule.is_active == True
                    )
                
                result = await session.execute(rules_query)
                quality_rules = result.scalars().all()
                
                if not quality_rules:
                    return {
                        "error": "No active quality rules found",
                        "asset_id": asset_id
                    }
                
                # Get asset metadata for context
                asset_metadata = await self._get_asset_metadata(asset_id, session)
                
                # Execute quality assessments in parallel
                assessment_tasks = []
                for rule in quality_rules:
                    task = self._execute_quality_rule(
                        asset_id, rule, asset_metadata, options, session
                    )
                    assessment_tasks.append(task)
                
                # Wait for all assessments to complete
                assessment_results = await asyncio.gather(
                    *assessment_tasks, return_exceptions=True
                )
                
                # Process results
                successful_assessments = []
                failed_assessments = []
                
                for i, result in enumerate(assessment_results):
                    if isinstance(result, Exception):
                        failed_assessments.append({
                            "rule_id": quality_rules[i].rule_id,
                            "error": str(result)
                        })
                        logger.error(f"Quality rule assessment failed: {result}")
                    else:
                        successful_assessments.append(result)
                
                # Calculate overall quality scorecard
                scorecard = await self._calculate_quality_scorecard(
                    asset_id, successful_assessments, asset_metadata, session
                )
                
                # Generate recommendations
                recommendations = await self._generate_quality_recommendations(
                    successful_assessments, asset_metadata
                )
                
                # Store results
                await self._store_assessment_results(
                    successful_assessments, scorecard, session
                )
                
                # Update metrics
                processing_time = time.time() - start_time
                self.metrics['assessments_performed'] += 1
                self.metrics['rules_executed'] += len(successful_assessments)
                self.metrics['average_assessment_time'] = (
                    self.metrics['average_assessment_time'] * 0.9 + processing_time * 0.1
                )
                
                # Check for alerts
                await self._check_quality_alerts(scorecard, session)
                
                logger.info(f"Quality assessment completed for asset {asset_id}: {scorecard.overall_score:.2f}")
                
                return {
                    "asset_id": asset_id,
                    "scorecard": {
                        "overall_score": scorecard.overall_score,
                        "scoring_method": scorecard.scoring_method.value,
                        "dimension_scores": {
                            "completeness": scorecard.completeness_score,
                            "accuracy": scorecard.accuracy_score,
                            "consistency": scorecard.consistency_score,
                            "validity": scorecard.validity_score,
                            "timeliness": scorecard.timeliness_score,
                            "uniqueness": scorecard.uniqueness_score,
                            "integrity": scorecard.integrity_score
                        },
                        "trend": scorecard.trend.value,
                        "issues_summary": {
                            "critical": scorecard.critical_issues,
                            "high": scorecard.high_issues,
                            "medium": scorecard.medium_issues,
                            "low": scorecard.low_issues
                        },
                        "assessment_summary": {
                            "total_rules": scorecard.total_rules,
                            "passed_rules": scorecard.passed_rules,
                            "failed_rules": scorecard.failed_rules,
                            "warning_rules": scorecard.warning_rules
                        }
                    },
                    "assessments": [
                        {
                            "assessment_id": a.assessment_id,
                            "rule_id": a.rule_id,
                            "status": a.status.value,
                            "score": a.score,
                            "passed": a.passed,
                            "total_records": a.total_records,
                            "passed_records": a.passed_records,
                            "failed_records": a.failed_records
                        } for a in successful_assessments
                    ],
                    "recommendations": recommendations,
                    "failed_rules": failed_assessments,
                    "processing_time_ms": processing_time * 1000,
                    "assessed_at": datetime.utcnow().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Quality assessment failed for asset {asset_id}: {e}")
            return {
                "error": str(e),
                "asset_id": asset_id,
                "processing_time_ms": (time.time() - start_time) * 1000
            }
    
    async def _execute_quality_rule(
        self,
        asset_id: str,
        rule: DataQualityRule,
        asset_metadata: Dict[str, Any],
        options: Optional[Dict[str, Any]],
        session: AsyncSession
    ) -> QualityAssessment:
        """Execute a single quality rule against an asset"""
        
        assessment_id = str(uuid4())
        start_time = time.time()
        
        try:
            # Get rule execution function
            rule_function = self.rule_definitions.get(rule.rule_type)
            if not rule_function:
                raise ValueError(f"Unknown rule type: {rule.rule_type}")
            
            # Execute the rule
            rule_result = await rule_function(
                asset_id, rule, asset_metadata, options
            )
            
            # Create assessment record
            assessment = QualityAssessment(
                assessment_id=assessment_id,
                asset_id=asset_id,
                rule_id=rule.rule_id,
                status=QualityStatus.PASSED if rule_result["passed"] else QualityStatus.FAILED,
                score=rule_result.get("score"),
                passed=rule_result["passed"],
                total_records=rule_result.get("total_records", 0),
                passed_records=rule_result.get("passed_records", 0),
                failed_records=rule_result.get("failed_records", 0),
                error_records=rule_result.get("error_records", 0),
                results=rule_result.get("details", {}),
                anomalies=rule_result.get("anomalies", []),
                recommendations=rule_result.get("recommendations", []),
                execution_time_ms=int((time.time() - start_time) * 1000),
                executed_at=datetime.utcnow(),
                executed_by="system"
            )
            
            # Add assessment to session
            session.add(assessment)
            
            return assessment
            
        except Exception as e:
            # Create failed assessment record
            assessment = QualityAssessment(
                assessment_id=assessment_id,
                asset_id=asset_id,
                rule_id=rule.rule_id,
                status=QualityStatus.ERROR,
                score=None,
                passed=False,
                total_records=0,
                passed_records=0,
                failed_records=0,
                error_records=0,
                results={},
                anomalies=[],
                recommendations=[],
                execution_time_ms=int((time.time() - start_time) * 1000),
                executed_at=datetime.utcnow(),
                executed_by="system",
                error_message=str(e)
            )
            
            session.add(assessment)
            logger.error(f"Quality rule execution failed: {e}")
            
            return assessment
    
    async def _calculate_quality_scorecard(
        self,
        asset_id: str,
        assessments: List[QualityAssessment],
        asset_metadata: Dict[str, Any],
        session: AsyncSession
    ) -> QualityScorecard:
        """Calculate overall quality scorecard from assessments"""
        
        try:
            # Get previous scorecard for trend analysis
            previous_query = select(QualityScorecard).where(
                QualityScorecard.asset_id == asset_id
            ).order_by(QualityScorecard.assessed_at.desc()).limit(1)
            
            result = await session.execute(previous_query)
            previous_scorecard = result.scalar_one_or_none()
            
            # Calculate dimension scores
            dimension_scores = {}
            dimension_assessments = defaultdict(list)
            
            # Group assessments by dimension
            for assessment in assessments:
                if assessment.quality_rule and assessment.quality_rule.quality_dimension:
                    dimension = assessment.quality_rule.quality_dimension
                    dimension_assessments[dimension].append(assessment)
            
            # Calculate scores for each dimension
            for dimension, dim_assessments in dimension_assessments.items():
                if dim_assessments:
                    # Weighted average based on rule weights
                    total_weight = sum(a.quality_rule.weight for a in dim_assessments if a.score is not None)
                    weighted_score = sum(
                        a.score * a.quality_rule.weight 
                        for a in dim_assessments 
                        if a.score is not None
                    )
                    
                    if total_weight > 0:
                        dimension_scores[dimension] = weighted_score / total_weight
                    else:
                        dimension_scores[dimension] = 0.0
            
            # Calculate overall score
            overall_score = self._calculate_overall_score(
                dimension_scores, self.config.default_score_method
            )
            
            # Count issues by severity
            issue_counts = {
                QualitySeverity.CRITICAL: 0,
                QualitySeverity.HIGH: 0,
                QualitySeverity.MEDIUM: 0,
                QualitySeverity.LOW: 0
            }
            
            for assessment in assessments:
                if not assessment.passed and assessment.quality_rule:
                    severity = assessment.quality_rule.severity
                    issue_counts[severity] += 1
            
            # Count rule results
            total_rules = len(assessments)
            passed_rules = sum(1 for a in assessments if a.passed)
            failed_rules = sum(1 for a in assessments if not a.passed and a.status != QualityStatus.WARNING)
            warning_rules = sum(1 for a in assessments if a.status == QualityStatus.WARNING)
            
            # Calculate trend
            trend = QualityTrend.UNKNOWN
            score_change = None
            if previous_scorecard:
                score_change = overall_score - previous_scorecard.overall_score
                if abs(score_change) < self.config.improvement_threshold:
                    trend = QualityTrend.STABLE
                elif score_change >= self.config.improvement_threshold:
                    trend = QualityTrend.IMPROVING
                elif score_change <= self.config.degradation_threshold:
                    trend = QualityTrend.DECLINING
                else:
                    trend = QualityTrend.VOLATILE
            
            # Create scorecard
            scorecard = QualityScorecard(
                scorecard_id=str(uuid4()),
                asset_id=asset_id,
                asset_type=asset_metadata.get("asset_type", "unknown"),
                overall_score=overall_score,
                scoring_method=self.config.default_score_method,
                completeness_score=dimension_scores.get(QualityDimension.COMPLETENESS),
                accuracy_score=dimension_scores.get(QualityDimension.ACCURACY),
                consistency_score=dimension_scores.get(QualityDimension.CONSISTENCY),
                validity_score=dimension_scores.get(QualityDimension.VALIDITY),
                timeliness_score=dimension_scores.get(QualityDimension.TIMELINESS),
                uniqueness_score=dimension_scores.get(QualityDimension.UNIQUENESS),
                integrity_score=dimension_scores.get(QualityDimension.INTEGRITY),
                previous_score=previous_scorecard.overall_score if previous_scorecard else None,
                score_change=score_change,
                trend=trend,
                total_rules=total_rules,
                passed_rules=passed_rules,
                failed_rules=failed_rules,
                warning_rules=warning_rules,
                critical_issues=issue_counts[QualitySeverity.CRITICAL],
                high_issues=issue_counts[QualitySeverity.HIGH],
                medium_issues=issue_counts[QualitySeverity.MEDIUM],
                low_issues=issue_counts[QualitySeverity.LOW],
                assessed_at=datetime.utcnow(),
                assessed_by="system",
                valid_until=datetime.utcnow() + timedelta(hours=24)
            )
            
            # Add to session
            session.add(scorecard)
            
            return scorecard
            
        except Exception as e:
            logger.error(f"Scorecard calculation failed: {e}")
            raise
    
    # Quality rule implementations
    async def _null_check_rule(
        self,
        asset_id: str,
        rule: DataQualityRule,
        asset_metadata: Dict[str, Any],
        options: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Check for null/missing values"""
        
        try:
            # Get data sample for analysis
            data_sample = await self._get_asset_data_sample(asset_id, rule.parameters)
            
            if not data_sample:
                return {"passed": False, "error": "No data available"}
            
            # Check for nulls
            total_records = len(data_sample)
            null_count = 0
            column = rule.parameters.get("column")
            
            if column:
                # Check specific column
                for record in data_sample:
                    if record.get(column) is None or record.get(column) == "":
                        null_count += 1
            else:
                # Check all columns
                for record in data_sample:
                    if any(v is None or v == "" for v in record.values()):
                        null_count += 1
            
            # Calculate scores
            null_rate = null_count / total_records if total_records > 0 else 1.0
            completeness_score = (1.0 - null_rate) * 100
            
            # Determine pass/fail
            threshold = rule.thresholds.get("max_null_rate", 0.05)
            passed = null_rate <= threshold
            
            return {
                "passed": passed,
                "score": completeness_score,
                "total_records": total_records,
                "passed_records": total_records - null_count,
                "failed_records": null_count,
                "details": {
                    "null_count": null_count,
                    "null_rate": null_rate,
                    "threshold": threshold,
                    "column": column
                },
                "recommendations": [
                    "Consider making fields required if nulls are not acceptable",
                    "Implement data validation at input points",
                    "Review data collection processes"
                ] if not passed else []
            }
            
        except Exception as e:
            logger.error(f"Null check rule failed: {e}")
            return {"passed": False, "error": str(e)}
    
    async def _range_check_rule(
        self,
        asset_id: str,
        rule: DataQualityRule,
        asset_metadata: Dict[str, Any],
        options: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Check if values are within expected ranges"""
        
        try:
            data_sample = await self._get_asset_data_sample(asset_id, rule.parameters)
            
            if not data_sample:
                return {"passed": False, "error": "No data available"}
            
            column = rule.parameters.get("column")
            min_value = rule.parameters.get("min_value")
            max_value = rule.parameters.get("max_value")
            
            if not column or (min_value is None and max_value is None):
                return {"passed": False, "error": "Invalid rule parameters"}
            
            total_records = len(data_sample)
            violations = 0
            outliers = []
            
            for i, record in enumerate(data_sample):
                value = record.get(column)
                if value is not None:
                    try:
                        numeric_value = float(value)
                        is_violation = False
                        
                        if min_value is not None and numeric_value < min_value:
                            is_violation = True
                        if max_value is not None and numeric_value > max_value:
                            is_violation = True
                        
                        if is_violation:
                            violations += 1
                            outliers.append({
                                "record_index": i,
                                "value": numeric_value,
                                "expected_range": f"[{min_value}, {max_value}]"
                            })
                    except (ValueError, TypeError):
                        violations += 1
            
            # Calculate scores
            compliance_rate = (total_records - violations) / total_records if total_records > 0 else 0.0
            score = compliance_rate * 100
            
            # Determine pass/fail
            threshold = rule.thresholds.get("min_compliance_rate", 0.95)
            passed = compliance_rate >= threshold
            
            return {
                "passed": passed,
                "score": score,
                "total_records": total_records,
                "passed_records": total_records - violations,
                "failed_records": violations,
                "details": {
                    "violations": violations,
                    "compliance_rate": compliance_rate,
                    "range": {"min": min_value, "max": max_value},
                    "threshold": threshold
                },
                "anomalies": outliers[:10],  # Limit to first 10
                "recommendations": [
                    "Review data entry processes for out-of-range values",
                    "Implement input validation with proper range checks",
                    "Investigate sources of outlier values"
                ] if not passed else []
            }
            
        except Exception as e:
            logger.error(f"Range check rule failed: {e}")
            return {"passed": False, "error": str(e)}
    
    async def _format_check_rule(
        self,
        asset_id: str,
        rule: DataQualityRule,
        asset_metadata: Dict[str, Any],
        options: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Check if values match expected format patterns"""
        
        try:
            data_sample = await self._get_asset_data_sample(asset_id, rule.parameters)
            
            if not data_sample:
                return {"passed": False, "error": "No data available"}
            
            column = rule.parameters.get("column")
            pattern = rule.parameters.get("pattern")
            format_type = rule.parameters.get("format_type", "regex")
            
            if not column or not pattern:
                return {"passed": False, "error": "Invalid rule parameters"}
            
            total_records = len(data_sample)
            violations = 0
            invalid_values = []
            
            # Compile regex pattern
            if format_type == "regex":
                try:
                    regex_pattern = re.compile(pattern)
                except re.error as e:
                    return {"passed": False, "error": f"Invalid regex pattern: {e}"}
            
            for i, record in enumerate(data_sample):
                value = record.get(column)
                if value is not None:
                    value_str = str(value)
                    is_valid = False
                    
                    if format_type == "regex":
                        is_valid = bool(regex_pattern.match(value_str))
                    elif format_type == "email":
                        is_valid = "@" in value_str and "." in value_str.split("@")[-1]
                    elif format_type == "phone":
                        # E.164-style phone validation: +CCCNNNN...
                        digits = re.sub(r'\D', '', value_str)
                        is_valid = 7 <= len(digits) <= 15
                    elif format_type == "date":
                        try:
                            pd.to_datetime(value_str)
                            is_valid = True
                        except:
                            is_valid = False
                    
                    if not is_valid:
                        violations += 1
                        invalid_values.append({
                            "record_index": i,
                            "value": value_str,
                            "expected_format": pattern
                        })
            
            # Calculate scores
            compliance_rate = (total_records - violations) / total_records if total_records > 0 else 0.0
            score = compliance_rate * 100
            
            # Determine pass/fail
            threshold = rule.thresholds.get("min_compliance_rate", 0.95)
            passed = compliance_rate >= threshold
            
            return {
                "passed": passed,
                "score": score,
                "total_records": total_records,
                "passed_records": total_records - violations,
                "failed_records": violations,
                "details": {
                    "violations": violations,
                    "compliance_rate": compliance_rate,
                    "pattern": pattern,
                    "format_type": format_type,
                    "threshold": threshold
                },
                "anomalies": invalid_values[:10],  # Limit to first 10
                "recommendations": [
                    "Standardize data entry formats",
                    "Implement format validation at data input",
                    "Consider data cleansing for existing records"
                ] if not passed else []
            }
            
        except Exception as e:
            logger.error(f"Format check rule failed: {e}")
            return {"passed": False, "error": str(e)}
    
    async def _uniqueness_check_rule(
        self,
        asset_id: str,
        rule: DataQualityRule,
        asset_metadata: Dict[str, Any],
        options: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Check for duplicate values"""
        
        try:
            data_sample = await self._get_asset_data_sample(asset_id, rule.parameters)
            
            if not data_sample:
                return {"passed": False, "error": "No data available"}
            
            columns = rule.parameters.get("columns", [])
            if not columns:
                return {"passed": False, "error": "No columns specified for uniqueness check"}
            
            total_records = len(data_sample)
            seen_values = set()
            duplicates = []
            duplicate_count = 0
            
            for i, record in enumerate(data_sample):
                # Create composite key from specified columns
                key_parts = []
                for col in columns:
                    value = record.get(col)
                    key_parts.append(str(value) if value is not None else "NULL")
                
                composite_key = "|".join(key_parts)
                
                if composite_key in seen_values:
                    duplicate_count += 1
                    duplicates.append({
                        "record_index": i,
                        "key": composite_key,
                        "values": {col: record.get(col) for col in columns}
                    })
                else:
                    seen_values.add(composite_key)
            
            # Calculate scores
            uniqueness_rate = (total_records - duplicate_count) / total_records if total_records > 0 else 1.0
            score = uniqueness_rate * 100
            
            # Determine pass/fail
            threshold = rule.thresholds.get("min_uniqueness_rate", 1.0)
            passed = uniqueness_rate >= threshold
            
            return {
                "passed": passed,
                "score": score,
                "total_records": total_records,
                "passed_records": total_records - duplicate_count,
                "failed_records": duplicate_count,
                "details": {
                    "duplicate_count": duplicate_count,
                    "uniqueness_rate": uniqueness_rate,
                    "checked_columns": columns,
                    "threshold": threshold,
                    "unique_values": len(seen_values)
                },
                "anomalies": duplicates[:10],  # Limit to first 10
                "recommendations": [
                    "Implement unique constraints at database level",
                    "Review data integration processes for duplicates",
                    "Consider deduplication procedures"
                ] if not passed else []
            }
            
        except Exception as e:
            logger.error(f"Uniqueness check rule failed: {e}")
            return {"passed": False, "error": str(e)}
    
    async def _statistical_outlier_rule(
        self,
        asset_id: str,
        rule: DataQualityRule,
        asset_metadata: Dict[str, Any],
        options: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Detect statistical outliers using IQR or Z-score methods"""
        
        try:
            data_sample = await self._get_asset_data_sample(asset_id, rule.parameters)
            
            if not data_sample:
                return {"passed": False, "error": "No data available"}
            
            column = rule.parameters.get("column")
            method = rule.parameters.get("method", "iqr")  # iqr or zscore
            threshold = rule.parameters.get("threshold", 3.0)
            
            if not column:
                return {"passed": False, "error": "No column specified"}
            
            # Extract numeric values
            values = []
            for record in data_sample:
                value = record.get(column)
                if value is not None:
                    try:
                        values.append(float(value))
                    except (ValueError, TypeError):
                        continue
            
            if len(values) < 3:
                return {"passed": False, "error": "Insufficient numeric data"}
            
            outliers = []
            
            if method == "iqr":
                # IQR method
                q1 = np.percentile(values, 25)
                q3 = np.percentile(values, 75)
                iqr = q3 - q1
                lower_bound = q1 - 1.5 * iqr
                upper_bound = q3 + 1.5 * iqr
                
                for i, record in enumerate(data_sample):
                    value = record.get(column)
                    if value is not None:
                        try:
                            numeric_value = float(value)
                            if numeric_value < lower_bound or numeric_value > upper_bound:
                                outliers.append({
                                    "record_index": i,
                                    "value": numeric_value,
                                    "bounds": {"lower": lower_bound, "upper": upper_bound},
                                    "method": "iqr"
                                })
                        except (ValueError, TypeError):
                            continue
            
            elif method == "zscore":
                # Z-score method
                mean_val = np.mean(values)
                std_val = np.std(values)
                
                for i, record in enumerate(data_sample):
                    value = record.get(column)
                    if value is not None:
                        try:
                            numeric_value = float(value)
                            z_score = abs((numeric_value - mean_val) / std_val) if std_val > 0 else 0
                            if z_score > threshold:
                                outliers.append({
                                    "record_index": i,
                                    "value": numeric_value,
                                    "z_score": z_score,
                                    "threshold": threshold,
                                    "method": "zscore"
                                })
                        except (ValueError, TypeError):
                            continue
            
            # Calculate scores
            outlier_rate = len(outliers) / len(values) if len(values) > 0 else 0.0
            score = (1.0 - outlier_rate) * 100
            
            # Determine pass/fail
            max_outlier_rate = rule.thresholds.get("max_outlier_rate", 0.05)
            passed = outlier_rate <= max_outlier_rate
            
            return {
                "passed": passed,
                "score": score,
                "total_records": len(data_sample),
                "passed_records": len(values) - len(outliers),
                "failed_records": len(outliers),
                "details": {
                    "outlier_count": len(outliers),
                    "outlier_rate": outlier_rate,
                    "method": method,
                    "threshold": threshold,
                    "max_outlier_rate": max_outlier_rate,
                    "statistics": {
                        "mean": np.mean(values),
                        "std": np.std(values),
                        "min": np.min(values),
                        "max": np.max(values)
                    }
                },
                "anomalies": outliers[:10],  # Limit to first 10
                "recommendations": [
                    "Investigate outlier values for data entry errors",
                    "Consider if outliers represent valid edge cases",
                    "Review data collection and validation processes"
                ] if not passed else []
            }
            
        except Exception as e:
            logger.error(f"Statistical outlier rule failed: {e}")
            return {"passed": False, "error": str(e)}
    
    # Advanced implementations for other rule types
    async def _referential_integrity_rule(self, asset_id, rule, asset_metadata, options):
        """Check referential integrity constraints using provided parameters and samples.

        Expected rule.parameters:
        - column: str -> the local FK column to check on this asset
        - reference_values: List[Any] (optional) -> explicit allowed values for FK
        - allow_nulls: bool (default True)
        - max_missing_rate: float (default 0.01) -> tolerance for missing/invalid refs
        """
        try:
            params = rule.parameters or {}
            column = params.get("column")
            allow_nulls = params.get("allow_nulls", True)
            threshold = rule.thresholds.get("max_missing_rate", 0.01) if hasattr(rule, "thresholds") else 0.01
            if not column:
                return {"passed": False, "error": "Missing 'column' parameter"}

            data_sample = await self._get_asset_data_sample(asset_id, params)
            if not data_sample:
                return {"passed": False, "error": "No data available"}

            reference_values = set(params.get("reference_values", []))

            total_records = len(data_sample)
            violations = 0
            nulls = 0
            checked = 0

            for record in data_sample:
                value = record.get(column)
                if value is None:
                    nulls += 1
                    if not allow_nulls:
                        violations += 1
                    continue
                checked += 1
                if reference_values and value not in reference_values:
                    violations += 1

            missing_rate = violations / max(1, total_records)
            passed = missing_rate <= threshold
            score = max(0.0, (1.0 - missing_rate) * 100.0)

            return {
                "passed": passed,
                "score": score,
                "total_records": total_records,
                "passed_records": total_records - violations,
                "failed_records": violations,
                "details": {
                    "checked": checked,
                    "nulls": nulls,
                    "missing_rate": missing_rate,
                    "threshold": threshold,
                    "reference_mode": "explicit_values" if reference_values else "not_provided"
                },
                "recommendations": [] if passed else [
                    "Populate missing foreign key values",
                    "Ensure referential set is synchronized and configured in rule.parameters.reference_values"
                ]
            }
        except Exception as e:
            logger.error(f"Referential integrity rule failed: {e}")
            return {"passed": False, "error": str(e)}

    async def _custom_sql_rule(self, asset_id, rule, asset_metadata, options):
        """Execute a custom assertion against the sampled data using a safe evaluator.

        Expected rule.parameters:
        - assertion: str -> Python-like boolean expression evaluated per record or over aggregates
          Examples:
            "sum(col('amount') for _ in records) >= 0"
            "all((r['age'] is None) or (r['age'] >= 18) for r in records)"
        - failure_message: str (optional)
        """
        try:
            params = rule.parameters or {}
            assertion = params.get("assertion")
            if not assertion:
                return {"passed": False, "error": "Missing 'assertion' parameter"}

            data_sample = await self._get_asset_data_sample(asset_id, params)
            if not data_sample:
                return {"passed": False, "error": "No data available"}

            # Safe evaluation context
            records = data_sample
            safe_globals = {
                "__builtins__": {},
                "sum": sum,
                "min": min,
                "max": max,
                "len": len,
                "all": all,
                "any": any,
            }
            def col(name: str):
                return [r.get(name) for r in records]
            safe_locals = {"records": records, "col": col}

            try:
                result = bool(eval(assertion, safe_globals, safe_locals))
            except Exception as eval_err:
                return {"passed": False, "error": f"Assertion evaluation error: {eval_err}"}

            score = 100.0 if result else 0.0
            return {
                "passed": result,
                "score": score,
                "total_records": len(records),
                "details": {"assertion": assertion},
                "recommendations": [] if result else [params.get("failure_message") or "Review the custom assertion and underlying data"]
            }
        except Exception as e:
            logger.error(f"Custom SQL rule failed: {e}")
            return {"passed": False, "error": str(e)}

    async def _pattern_match_rule(self, asset_id, rule, asset_metadata, options):
        """Pattern matching validation across one or more columns using regex.

        Expected rule.parameters:
        - columns: List[str] -> columns to validate
        - pattern: str -> regex pattern
        - case_insensitive: bool (default True)
        - fullmatch: bool (default False) -> use fullmatch instead of search
        - min_compliance_rate: float in thresholds (default 0.95)
        """
        try:
            import re as _re
            params = rule.parameters or {}
            columns = params.get("columns")
            pattern = params.get("pattern")
            if not columns or not pattern:
                return {"passed": False, "error": "Missing 'columns' or 'pattern' parameter"}
            flags = _re.IGNORECASE if params.get("case_insensitive", True) else 0
            try:
                regex = _re.compile(pattern, flags)
            except _re.error as re_err:
                return {"passed": False, "error": f"Invalid regex: {re_err}"}

            data_sample = await self._get_asset_data_sample(asset_id, params)
            if not data_sample:
                return {"passed": False, "error": "No data available"}

            total_records = len(data_sample)
            violations = 0
            invalid_values = []
            use_full = params.get("fullmatch", False)

            for i, record in enumerate(data_sample):
                for col in columns:
                    value = record.get(col)
                    if value is None:
                        continue
                    value_str = str(value)
                    matched = bool(regex.fullmatch(value_str)) if use_full else bool(regex.search(value_str))
                    if not matched:
                        violations += 1
                        if len(invalid_values) < 25:
                            invalid_values.append({"index": i, "column": col, "value": value_str})

            # Compute compliance over evaluated cells
            evaluated = max(1, total_records * len(columns))
            compliance_rate = (evaluated - violations) / evaluated
            threshold = rule.thresholds.get("min_compliance_rate", 0.95) if hasattr(rule, "thresholds") else 0.95
            passed = compliance_rate >= threshold
            score = max(0.0, compliance_rate * 100.0)

            return {
                "passed": passed,
                "score": score,
                "total_records": total_records,
                "passed_records": int(evaluated - violations),
                "failed_records": int(violations),
                "details": {
                    "columns": columns,
                    "pattern": pattern,
                    "compliance_rate": compliance_rate,
                    "threshold": threshold,
                    "checked_cells": evaluated,
                    "invalid_examples": invalid_values
                },
                "recommendations": [] if passed else [
                    "Standardize input formats and update upstream validations",
                    "Consider refining regex pattern or adjusting acceptable formats"
                ]
            }
        except Exception as e:
            logger.error(f"Pattern match rule failed: {e}")
            return {"passed": False, "error": str(e)}

    async def _business_rule(self, asset_id, rule, asset_metadata, options):
        """Business logic validation by evaluating a boolean expression per record.

        Expected rule.parameters:
        - expression: str -> Python-like predicate over a record 'r', e.g., "(r['age'] is None) or (r['age'] >= 18)"
        - min_pass_rate: float (default 0.99)
        """
        try:
            params = rule.parameters or {}
            expression = params.get("expression")
            if not expression:
                return {"passed": False, "error": "Missing 'expression' parameter"}

            data_sample = await self._get_asset_data_sample(asset_id, params)
            if not data_sample:
                return {"passed": False, "error": "No data available"}

            safe_globals = {"__builtins__": {}}
            passed_count = 0
            errors = 0
            for r in data_sample:
                try:
                    if bool(eval(expression, safe_globals, {"r": r})):
                        passed_count += 1
                except Exception:
                    errors += 1

            total = len(data_sample)
            pass_rate = passed_count / max(1, total - errors)
            threshold = params.get("min_pass_rate", 0.99)
            passed = pass_rate >= threshold and errors == 0
            score = max(0.0, pass_rate * 100.0)

            return {
                "passed": passed,
                "score": score,
                "total_records": total,
                "passed_records": passed_count,
                "failed_records": max(0, total - passed_count - errors),
                "details": {
                    "pass_rate": pass_rate,
                    "threshold": threshold,
                    "evaluation_errors": errors,
                    "expression": expression
                },
                "recommendations": [] if passed else [
                    "Review the business rule and data anomalies",
                    "Tighten data entry validations or adjust the rule threshold appropriately"
                ]
            }
        except Exception as e:
            logger.error(f"Business rule validation failed: {e}")
            return {"passed": False, "error": str(e)}

    async def _cross_reference_rule(self, asset_id, rule, asset_metadata, options):
        """Cross-reference validation using in-sample comparisons and provided references.

        Expected rule.parameters:
        - source_column: str
        - target_column: str (optional) -> compare that source implies target non-null/value set
        - reference_set: List[Any] (optional) -> allowed set for source_column
        - max_violation_rate: float (default 0.01)
        """
        try:
            params = rule.parameters or {}
            source_column = params.get("source_column")
            target_column = params.get("target_column")
            reference_set = set(params.get("reference_set", []))
            if not source_column and not target_column and not reference_set:
                return {"passed": False, "error": "Specify 'source_column' and at least one of 'target_column' or 'reference_set'"}

            data_sample = await self._get_asset_data_sample(asset_id, params)
            if not data_sample:
                return {"passed": False, "error": "No data available"}

            total = len(data_sample)
            violations = 0
            examples = []
            for i, r in enumerate(data_sample):
                src = r.get(source_column) if source_column else None
                if reference_set and src is not None and src not in reference_set:
                    violations += 1
                    if len(examples) < 25:
                        examples.append({"index": i, "value": src})
                if source_column and target_column and src:
                    trg = r.get(target_column)
                    if trg in (None, ""):
                        violations += 1
                        if len(examples) < 25:
                            examples.append({"index": i, "source": src, "target": trg})

            violation_rate = violations / max(1, total)
            threshold = params.get("max_violation_rate", 0.01)
            passed = violation_rate <= threshold
            score = max(0.0, (1.0 - violation_rate) * 100.0)

            return {
                "passed": passed,
                "score": score,
                "total_records": total,
                "passed_records": total - violations,
                "failed_records": violations,
                "details": {
                    "violation_rate": violation_rate,
                    "threshold": threshold,
                    "reference_mode": "set" if reference_set else "column_implication",
                    "examples": examples
                },
                "recommendations": [] if passed else [
                    "Align cross-reference mappings and ensure target fields are populated",
                    "Update reference set or cleanse source values to meet governance rules"
                ]
            }
        except Exception as e:
            logger.error(f"Cross-reference rule failed: {e}")
            return {"passed": False, "error": str(e)}
    
    # Utility methods
    async def _get_asset_metadata(self, asset_id: str, session: AsyncSession) -> Dict[str, Any]:
        """Get asset metadata for context using the enterprise catalog when available."""
        try:
            from .enterprise_catalog_service import EnterpriseIntelligentCatalogService
            # Try to load the asset via ORM to obtain real metadata
            from ..models.advanced_catalog_models import IntelligentDataAsset
            res = await session.execute(select(IntelligentDataAsset).where(IntelligentDataAsset.id == int(asset_id)))
            asset = res.scalars().first()
            if asset:
                return {
                    "asset_id": asset.id,
                    "asset_type": asset.asset_type.value if hasattr(asset.asset_type, 'value') else str(asset.asset_type),
                    "schema": asset.schema_name or asset.database_name,
                    "qualified_name": asset.qualified_name,
                    "data_source_id": asset.data_source_id,
                    "business_domain": asset.business_domain,
                }
        except Exception:
            pass
        return {"asset_id": asset_id, "asset_type": "table", "schema": "default"}
    
    async def _get_asset_data_sample(
        self, 
        asset_id: str, 
        parameters: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Get a sample of asset data for quality assessment"""
        try:
            # Real integration with data source connections
            sample_size = parameters.get("sample_size", 1000)
            
            # Get asset metadata to determine data source
            asset = await self._get_catalog_asset(asset_id)
            if not asset or not asset.data_source_id:
                logger.warning(f"No data source found for asset {asset_id}")
                return []
            
            # Get data source connection
            data_source = await self._get_data_source(asset.data_source_id)
            if not data_source:
                logger.warning(f"Data source {asset.data_source_id} not found")
                return []
            
            # Use data source service to get sample data
            from .data_source_service import DataSourceService
            ds_service = DataSourceService()
            
            # Get sample data from the actual data source
            sample_data = await ds_service.get_sample_data(
                data_source_id=asset.data_source_id,
                table_name=asset.name,
                sample_size=sample_size
            )
            
            if sample_data and isinstance(sample_data, list):
                return sample_data
            else:
                logger.warning(f"No sample data returned for asset {asset_id}")
                return []
                
        except Exception as e:
            logger.error(f"Error getting sample data for asset {asset_id}: {str(e)}")
            # Fallback to minimal data structure for quality assessment
            return [{"error": "data_retrieval_failed", "message": str(e)}]
    
    def _calculate_overall_score(
        self,
        dimension_scores: Dict[QualityDimension, float],
        method: QualityScoreMethod
    ) -> float:
        """Calculate overall quality score from dimension scores"""
        
        if not dimension_scores:
            return 0.0
        
        if method == QualityScoreMethod.WEIGHTED_AVERAGE:
            # Default weights for dimensions
            weights = {
                QualityDimension.COMPLETENESS: 0.2,
                QualityDimension.ACCURACY: 0.25,
                QualityDimension.CONSISTENCY: 0.15,
                QualityDimension.VALIDITY: 0.2,
                QualityDimension.TIMELINESS: 0.1,
                QualityDimension.UNIQUENESS: 0.05,
                QualityDimension.INTEGRITY: 0.05
            }
            
            total_score = 0.0
            total_weight = 0.0
            
            for dimension, score in dimension_scores.items():
                weight = weights.get(dimension, 0.1)
                total_score += score * weight
                total_weight += weight
            
            return total_score / total_weight if total_weight > 0 else 0.0
        
        elif method == QualityScoreMethod.MINIMUM_SCORE:
            return min(dimension_scores.values())
        
        else:
            # Weighted by inverse variance when available, else arithmetic mean
            variances = {k: v.get('variance') if isinstance(v, dict) else None for k, v in asset_metadata.get('dimension_variances', {}).items()} if isinstance(asset_metadata, dict) else {}
            weights = {}
            for dim, score in dimension_scores.items():
                var = variances.get(dim)
                if isinstance(var, (int, float)) and var > 0:
                    weights[dim] = 1.0 / float(var)
            if weights:
                num = sum(dimension_scores[d] * weights[d] for d in weights)
                den = sum(weights.values())
                return num / den if den else sum(dimension_scores.values()) / len(dimension_scores)
            return sum(dimension_scores.values()) / len(dimension_scores)
    
    async def _generate_quality_recommendations(
        self,
        assessments: List[QualityAssessment],
        asset_metadata: Dict[str, Any]
    ) -> List[str]:
        """Generate quality improvement recommendations"""
        
        recommendations = []
        
        # Analyze failed assessments
        failed_assessments = [a for a in assessments if not a.passed]
        
        if failed_assessments:
            # Group by quality dimension
            dimension_failures = defaultdict(list)
            for assessment in failed_assessments:
                if assessment.quality_rule:
                    dimension = assessment.quality_rule.quality_dimension
                    dimension_failures[dimension].append(assessment)
            
            # Generate dimension-specific recommendations
            for dimension, failures in dimension_failures.items():
                if dimension == QualityDimension.COMPLETENESS:
                    recommendations.append(
                        "Implement data validation to prevent missing values"
                    )
                elif dimension == QualityDimension.ACCURACY:
                    recommendations.append(
                        "Review data entry processes and implement accuracy checks"
                    )
                elif dimension == QualityDimension.CONSISTENCY:
                    recommendations.append(
                        "Standardize data formats and implement consistency rules"
                    )
                elif dimension == QualityDimension.VALIDITY:
                    recommendations.append(
                        "Enhance data validation with proper format and range checks"
                    )
                elif dimension == QualityDimension.UNIQUENESS:
                    recommendations.append(
                        "Implement deduplication processes and unique constraints"
                    )
        
        # Add general recommendations
        if len(failed_assessments) > len(assessments) * 0.5:
            recommendations.append(
                "Consider comprehensive data quality improvement initiative"
            )
        
        return recommendations
    
    async def _store_assessment_results(
        self,
        assessments: List[QualityAssessment],
        scorecard: QualityScorecard,
        session: AsyncSession
    ) -> None:
        """Store assessment results in database"""
        
        try:
            # Assessments are already added to session in _execute_quality_rule
            # Scorecard is already added to session in _calculate_quality_scorecard
            
            # Commit all changes
            await session.commit()
            
            # Update cache
            cache_key = f"quality_scorecard_{scorecard.asset_id}"
            await self.cache.set(
                cache_key, 
                {
                    "scorecard_id": scorecard.scorecard_id,
                    "overall_score": scorecard.overall_score,
                    "trend": scorecard.trend.value,
                    "assessed_at": scorecard.assessed_at.isoformat()
                },
                ttl=self.config.cache_ttl
            )
            
        except Exception as e:
            await session.rollback()
            logger.error(f"Failed to store assessment results: {e}")
            raise
    
    async def _check_quality_alerts(
        self,
        scorecard: QualityScorecard,
        session: AsyncSession
    ) -> None:
        """Check if quality alerts should be generated"""
        
        try:
            alerts_to_create = []
            
            # Check overall score thresholds
            if scorecard.overall_score < self.config.critical_threshold:
                alerts_to_create.append({
                    "severity": QualitySeverity.CRITICAL,
                    "message": f"Overall quality score ({scorecard.overall_score:.1f}%) below critical threshold",
                    "metric": "overall_score",
                    "current_value": scorecard.overall_score,
                    "threshold": self.config.critical_threshold
                })
            elif scorecard.overall_score < self.config.warning_threshold:
                alerts_to_create.append({
                    "severity": QualitySeverity.HIGH,
                    "message": f"Overall quality score ({scorecard.overall_score:.1f}%) below warning threshold",
                    "metric": "overall_score",
                    "current_value": scorecard.overall_score,
                    "threshold": self.config.warning_threshold
                })
            
            # Check for quality degradation
            if scorecard.score_change and scorecard.score_change < self.config.degradation_threshold:
                alerts_to_create.append({
                    "severity": QualitySeverity.WARNING,
                    "message": f"Quality score decreased by {abs(scorecard.score_change):.1f}%",
                    "metric": "score_change",
                    "current_value": scorecard.score_change,
                    "threshold": self.config.degradation_threshold
                })
            
            # Create alert records
            for alert_config in alerts_to_create:
                alert = QualityMonitoringAlert(
                    alert_id=str(uuid4()),
                    alert_type="quality_threshold",
                    severity=alert_config["severity"],
                    title=f"Quality Alert for {scorecard.asset_id}",
                    message=alert_config["message"],
                    asset_id=scorecard.asset_id,
                    metric_name=alert_config["metric"],
                    current_value=alert_config["current_value"],
                    threshold_value=alert_config["threshold"],
                    created_at=datetime.utcnow()
                )
                
                session.add(alert)
                self.alert_history.append(alert.alert_id)
            
            if alerts_to_create:
                self.metrics['alerts_generated'] += len(alerts_to_create)
                await session.commit()
            
        except Exception as e:
            logger.error(f"Failed to check quality alerts: {e}")
    
    async def _monitoring_loop(self):
        """Background task for continuous quality monitoring"""
        while getattr(self, '_monitoring_active', False):
            try:
                # Get active monitoring configurations
                async with get_db_session() as session:
                    query = select(QualityMonitoringConfig).where(
                        QualityMonitoringConfig.is_active == True
                    )
                    result = await session.execute(query)
                    configs = result.scalars().all()
                    
                    for config in configs:
                        # Check if monitoring is due
                        if self._is_monitoring_due(config):
                            # Execute monitoring logic here
                            await self._check_quality_alerts(session)
                
                # Sleep for the monitoring interval instead of infinite loop
                await asyncio.sleep(self.config.monitoring_interval)
                
            except Exception as e:
                logger.error(f"Monitoring loop error: {e}")
                await asyncio.sleep(60)  # Wait before retrying
    
    def _is_monitoring_due(self, config) -> bool:
        """Check if monitoring is due for a configuration"""
        try:
            if not config.last_run:
                return True
            
            # Calculate next run time based on frequency
            frequency_hours = getattr(config, 'frequency_hours', 24)
            next_run = config.last_run + timedelta(hours=frequency_hours)
            
            return datetime.utcnow() >= next_run
        except Exception as e:
            logger.error(f"Error checking monitoring due: {e}")
            return False
    
    async def _cleanup_loop(self):
        """Background task for cleanup operations"""
        while getattr(self, '_cleanup_active', False):
            try:
                # Cleanup old assessments, alerts, etc.
                await self._cleanup_old_records()
                
                # Sleep for 1 hour instead of infinite loop
                await asyncio.sleep(3600)
                
            except Exception as e:
                logger.error(f"Cleanup loop error: {e}")
                await asyncio.sleep(300)  # Wait 5 minutes before retrying

    def start_monitoring(self):
        """Start the monitoring and cleanup loops"""
        self._monitoring_active = True
        self._cleanup_active = True
        asyncio.create_task(self._monitoring_loop())
        asyncio.create_task(self._cleanup_loop())
        logger.info("Catalog quality monitoring started")

    def stop_monitoring(self):
        """Stop the monitoring and cleanup loops"""
        self._monitoring_active = False
        self._cleanup_active = False
        logger.info("Catalog quality monitoring stopped")

    async def _cleanup_old_records(self):
        """Clean up old quality records to maintain system performance"""
        try:
            # Clean up old quality assessments (older than 90 days)
            cutoff_date = datetime.now() - timedelta(days=90)
            
            async with get_db_session() as session:
                # Clean old quality assessments
                old_assessments_query = delete(QualityAssessment).where(
                    QualityAssessment.executed_at < cutoff_date
                )
                await session.execute(old_assessments_query)
                
                # Clean old quality alerts (older than 30 days)
                alert_cutoff = datetime.now() - timedelta(days=30)
                old_alerts_query = delete(QualityMonitoringAlert).where(
                    QualityMonitoringAlert.created_at < alert_cutoff
                )
                await session.execute(old_alerts_query)
                
                # Clean old monitoring configs that are inactive
                inactive_configs_query = delete(QualityMonitoringConfig).where(
                    and_(
                        QualityMonitoringConfig.is_active == False,
                        QualityMonitoringConfig.updated_at < cutoff_date
                    )
                )
                await session.execute(inactive_configs_query)
                
                await session.commit()
                
                logger.info("Cleanup of old quality records completed successfully")
                
        except Exception as e:
            logger.error(f"Error during cleanup of old records: {e}")
    
    async def get_quality_insights(self) -> Dict[str, Any]:
        """Get insights about quality service performance"""
        
        return {
            "metrics": self.metrics.copy(),
            "active_monitors": len(self.active_monitors),
            "recent_alerts": len(self.alert_history),
            "quality_history_size": len(self.quality_history),
            "configuration": {
                "score_method": self.config.default_score_method.value,
                "batch_size": self.config.batch_size,
                "parallel_assessments": self.config.parallel_assessments,
                "monitoring_interval": self.config.monitoring_interval,
                "thresholds": {
                    "excellent": self.config.excellent_threshold,
                    "good": self.config.good_threshold,
                    "warning": self.config.warning_threshold,
                    "critical": self.config.critical_threshold
                }
            }
        }