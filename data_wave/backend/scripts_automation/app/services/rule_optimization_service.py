"""
Enterprise Rule Optimization Service
AI-powered rule optimization service for adaptive rule generation and performance enhancement.
Provides self-improving rule efficiency, machine learning-based optimization,
predictive rule performance, and intelligent rule adaptation.
"""

import asyncio
import json
import logging
import numpy as np
import pandas as pd
import time
from collections import defaultdict, deque
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Set, Tuple, Union
from uuid import uuid4

from sklearn.cluster import KMeans, DBSCAN
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.feature_selection import SelectKBest, f_regression

from ..core.cache_manager import EnterpriseCacheManager as CacheManager
from ..core.logging_config import get_logger
from ..core.config import settings
from ..models.advanced_scan_rule_models import (
    IntelligentScanRule, RuleExecutionHistory, RuleOptimizationJob,
    RulePatternLibrary, RulePatternAssociation, RulePerformanceBaseline,
    RuleValidationResult, RuleOptimizationResult, RuleBenchmarkResult
)
from ..services.ai_service import EnterpriseAIService as AIService
from ..services.intelligent_pattern_service import IntelligentPatternService

logger = get_logger(__name__)

class OptimizationConfig:
    """Configuration for rule optimization"""
    
    def __init__(self):
        self.optimization_interval = 1800  # 30 minutes
        self.min_optimization_samples = 100
        self.performance_threshold = 0.8
        self.improvement_threshold = 0.05
        self.max_optimization_iterations = 10
        self.learning_rate = 0.01
        self.batch_size = 50
        
        # ML model parameters
        self.ensemble_models = 3
        self.cross_validation_folds = 5
        self.feature_selection_k = 20
        self.model_retrain_interval = 86400  # 24 hours
        
        # Rule performance criteria
        self.execution_time_weight = 0.3
        self.accuracy_weight = 0.4
        self.resource_usage_weight = 0.2
        self.reliability_weight = 0.1

class RuleOptimizationService:
    """
    Enterprise-grade rule optimization service providing:
    - AI-powered rule parameter optimization
    - Adaptive rule generation and modification
    - Performance prediction and enhancement
    - Self-improving rule efficiency
    - Machine learning-based optimization strategies
    - Real-time rule adaptation
    """
    
    def __init__(self):
        self.settings = settings
        self.cache = CacheManager()
        self.ai_service = AIService()
        self.pattern_service = IntelligentPatternService()
        
        self.config = OptimizationConfig()
        self._init_optimization_models()
        
        # Rule performance tracking
        self.rule_performance_history = defaultdict(deque)
        self.optimization_history = deque(maxlen=1000)
        self.performance_baselines = {}
        
        # ML models for optimization
        self.performance_predictors = {}
        self.optimization_models = {}
        self.feature_scalers = {}
        
        # Optimization state
        self.active_optimizations = {}
        self.optimization_queue = deque()
        self.optimization_results = {}
        
        # Performance metrics
        self.optimization_metrics = {
            'total_optimizations': 0,
            'successful_optimizations': 0,
            'average_improvement': 0.0,
            'optimization_accuracy': 0.0,
            'rules_optimized': 0,
            'performance_gains': {},
            'model_accuracy': 0.0
        }
        
        # Threading
        self.executor = ThreadPoolExecutor(max_workers=6)
        
        # Background tasks (deferred until event loop is running)
        self._background_tasks = []

    def start(self) -> None:
        """Start background tasks when an event loop is running."""
        if self._background_tasks:
            return
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            return
        self._background_tasks.append(loop.create_task(self._optimization_loop()))
        self._background_tasks.append(loop.create_task(self._model_retraining_loop()))
        self._background_tasks.append(loop.create_task(self._performance_monitoring_loop()))

    async def stop(self) -> None:
        tasks, self._background_tasks = self._background_tasks, []
        for t in tasks:
            try:
                t.cancel()
            except Exception:
                pass
    
    def _init_optimization_models(self):
        """Initialize machine learning models for optimization"""
        try:
            # Performance prediction models
            self.performance_predictors = {
                'execution_time': RandomForestRegressor(
                    n_estimators=100, random_state=42
                ),
                'accuracy': GradientBoostingRegressor(
                    n_estimators=100, random_state=42
                ),
                'resource_usage': RandomForestRegressor(
                    n_estimators=100, random_state=42
                ),
                'reliability': GradientBoostingRegressor(
                    n_estimators=100, random_state=42
                )
            }
            
            # Feature scalers
            self.feature_scalers = {
                metric: StandardScaler() 
                for metric in self.performance_predictors.keys()
            }
            
            # Feature selectors
            self.feature_selectors = {
                metric: SelectKBest(
                    score_func=f_regression, 
                    k=self.config.feature_selection_k
                )
                for metric in self.performance_predictors.keys()
            }
            
            logger.info("Optimization models initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize optimization models: {e}")
            raise
    
    async def optimize_rule_parameters(
        self,
        rule_id: str,
        optimization_target: str = "overall_performance",
        constraints: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Optimize rule parameters using AI-powered analysis
        
        Args:
            rule_id: Unique identifier for the rule to optimize
            optimization_target: Target metric for optimization
            constraints: Optional constraints for optimization
            
        Returns:
            Optimization results with improved parameters and predictions
        """
        optimization_id = str(uuid4())
        start_time = time.time()
        
        try:
            # Get rule performance history
            performance_data = await self._get_rule_performance_data(rule_id)
            
            if not performance_data or len(performance_data) < self.config.min_optimization_samples:
                return {
                    "optimization_id": optimization_id,
                    "status": "insufficient_data",
                    "error": f"Need at least {self.config.min_optimization_samples} performance samples",
                    "rule_id": rule_id
                }
            
            # Analyze current rule configuration
            current_config = await self._get_rule_configuration(rule_id)
            
            # Extract features for optimization
            features = await self._extract_optimization_features(
                rule_id, performance_data, current_config
            )
            
            # Generate optimization candidates
            optimization_candidates = await self._generate_optimization_candidates(
                current_config, features, optimization_target, constraints
            )
            
            # Evaluate candidates using ML models
            candidate_evaluations = await self._evaluate_optimization_candidates(
                optimization_candidates, features, optimization_target
            )
            
            # Select best optimization
            best_optimization = await self._select_best_optimization(
                candidate_evaluations, constraints
            )
            
            # Validate optimization before applying
            validation_result = await self._validate_optimization(
                rule_id, best_optimization, current_config
            )
            
            if not validation_result["valid"]:
                return {
                    "optimization_id": optimization_id,
                    "status": "validation_failed",
                    "error": validation_result["error"],
                    "rule_id": rule_id
                }
            
            # Apply optimization
            application_result = await self._apply_rule_optimization(
                rule_id, best_optimization, current_config
            )
            
            # Track optimization results
            optimization_record = {
                "optimization_id": optimization_id,
                "rule_id": rule_id,
                "optimization_target": optimization_target,
                "current_config": current_config,
                "optimized_config": best_optimization["parameters"],
                "predicted_improvement": best_optimization["predicted_improvement"],
                "constraints": constraints,
                "applied_at": datetime.utcnow().isoformat(),
                "status": "applied"
            }
            
            self.optimization_history.append(optimization_record)
            self.active_optimizations[rule_id] = optimization_record
            
            # Update metrics
            self.optimization_metrics['total_optimizations'] += 1
            self.optimization_metrics['rules_optimized'] += 1
            
            processing_time = time.time() - start_time
            
            logger.info(f"Rule optimization completed: {optimization_id} for rule {rule_id}")
            
            return {
                "optimization_id": optimization_id,
                "status": "completed",
                "rule_id": rule_id,
                "optimization_target": optimization_target,
                "current_parameters": current_config,
                "optimized_parameters": best_optimization["parameters"],
                "predicted_improvements": {
                    "execution_time": best_optimization.get("execution_time_improvement", 0),
                    "accuracy": best_optimization.get("accuracy_improvement", 0),
                    "resource_usage": best_optimization.get("resource_improvement", 0),
                    "overall_score": best_optimization["predicted_improvement"]
                },
                "confidence": best_optimization.get("confidence", 0.0),
                "processing_time_seconds": processing_time,
                "validation_results": validation_result,
                "application_results": application_result
            }
            
        except Exception as e:
            logger.error(f"Rule optimization failed: {e}")
            return {
                "optimization_id": optimization_id,
                "status": "failed",
                "error": str(e),
                "rule_id": rule_id,
                "processing_time_seconds": time.time() - start_time
            }
    
    async def generate_adaptive_rules(
        self,
        data_source_characteristics: Dict[str, Any],
        performance_requirements: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate adaptive rules based on data source characteristics
        
        Args:
            data_source_characteristics: Characteristics of the target data source
            performance_requirements: Required performance criteria
            context: Additional context for rule generation
            
        Returns:
            Generated adaptive rules with optimization predictions
        """
        generation_id = str(uuid4())
        start_time = time.time()
        
        try:
            # Analyze data source characteristics
            source_analysis = await self._analyze_data_source_characteristics(
                data_source_characteristics
            )
            
            # Find similar historical patterns
            similar_patterns = await self._find_similar_optimization_patterns(
                source_analysis, performance_requirements
            )
            
            # Generate rule templates based on patterns
            rule_templates = await self._generate_rule_templates(
                source_analysis, similar_patterns, performance_requirements
            )
            
            # Optimize generated rules
            optimized_rules = []
            for template in rule_templates:
                optimization_result = await self._optimize_rule_template(
                    template, source_analysis, performance_requirements
                )
                optimized_rules.append(optimization_result)
            
            # Rank rules by predicted performance
            ranked_rules = await self._rank_generated_rules(
                optimized_rules, performance_requirements
            )
            
            # Validate generated rules
            validation_results = await self._validate_generated_rules(
                ranked_rules, data_source_characteristics
            )
            
            # Prepare final rule set
            final_rules = await self._prepare_final_rule_set(
                ranked_rules, validation_results
            )
            
            processing_time = time.time() - start_time
            
            logger.info(f"Adaptive rule generation completed: {generation_id}")
            
            return {
                "generation_id": generation_id,
                "status": "completed",
                "data_source_analysis": source_analysis,
                "generated_rules": final_rules,
                "performance_predictions": {
                    rule["rule_id"]: rule["performance_prediction"]
                    for rule in final_rules
                },
                "optimization_recommendations": await self._generate_optimization_recommendations(
                    final_rules, performance_requirements
                ),
                "processing_time_seconds": processing_time,
                "validation_summary": validation_results
            }
            
        except Exception as e:
            logger.error(f"Adaptive rule generation failed: {e}")
            return {
                "generation_id": generation_id,
                "status": "failed",
                "error": str(e),
                "processing_time_seconds": time.time() - start_time
            }
    
    async def predict_rule_performance(
        self,
        rule_configuration: Dict[str, Any],
        execution_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Predict rule performance using trained ML models
        
        Args:
            rule_configuration: Rule configuration parameters
            execution_context: Expected execution context
            
        Returns:
            Performance predictions with confidence intervals
        """
        
        try:
            # Extract features for prediction
            features = await self._extract_prediction_features(
                rule_configuration, execution_context
            )
            
            # Make predictions using ensemble models
            predictions = {}
            confidence_intervals = {}
            
            for metric, model in self.performance_predictors.items():
                if hasattr(model, 'predict'):
                    # Scale features
                    scaled_features = self.feature_scalers[metric].transform([features])
                    
                    # Select features
                    selected_features = self.feature_selectors[metric].transform(scaled_features)
                    
                    # Make prediction
                    prediction = model.predict(selected_features)[0]
                    predictions[metric] = prediction
                    
                    # Calculate confidence interval
                    if hasattr(model, 'predict_proba'):
                        # For classifiers, use prediction probability
                        confidence = np.max(model.predict_proba(selected_features)[0])
                    else:
                        # For regressors, estimate confidence based on training data
                        confidence = self._estimate_prediction_confidence(
                            model, selected_features, metric
                        )
                    
                    confidence_intervals[metric] = confidence
            
            # Calculate overall performance score
            overall_score = self._calculate_overall_performance_score(predictions)
            
            # Generate performance insights
            insights = await self._generate_performance_insights(
                predictions, confidence_intervals, rule_configuration
            )
            
            return {
                "predictions": predictions,
                "overall_score": overall_score,
                "confidence_intervals": confidence_intervals,
                "insights": insights,
                "model_versions": {
                    metric: getattr(model, 'version', '1.0')
                    for metric, model in self.performance_predictors.items()
                },
                "predicted_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Rule performance prediction failed: {e}")
            return {
                "error": str(e),
                "predicted_at": datetime.utcnow().isoformat()
            }
    
    async def _generate_optimization_candidates(
        self,
        current_config: Dict[str, Any],
        features: List[float],
        optimization_target: str,
        constraints: Optional[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Generate candidate optimizations"""
        
        candidates = []
        
        # Parameter ranges for optimization
        parameter_ranges = await self._get_parameter_optimization_ranges(
            current_config, constraints
        )
        
        # Generate candidates using different strategies
        
        # 1. Gradient-based optimization
        gradient_candidates = await self._generate_gradient_candidates(
            current_config, parameter_ranges, optimization_target
        )
        candidates.extend(gradient_candidates)
        
        # 2. Random search candidates
        random_candidates = await self._generate_random_candidates(
            current_config, parameter_ranges, 10
        )
        candidates.extend(random_candidates)
        
        # 3. Bayesian optimization candidates
        bayesian_candidates = await self._generate_bayesian_candidates(
            current_config, parameter_ranges, features
        )
        candidates.extend(bayesian_candidates)
        
        # 4. Pattern-based candidates
        pattern_candidates = await self._generate_pattern_based_candidates(
            current_config, features
        )
        candidates.extend(pattern_candidates)
        
        return candidates
    
    async def _evaluate_optimization_candidates(
        self,
        candidates: List[Dict[str, Any]],
        features: List[float],
        optimization_target: str
    ) -> List[Dict[str, Any]]:
        """Evaluate optimization candidates using ML models"""
        
        evaluations = []
        
        for candidate in candidates:
            try:
                # Extract features for this candidate
                candidate_features = await self._extract_candidate_features(
                    candidate, features
                )
                
                # Predict performance for each metric
                performance_predictions = {}
                for metric, model in self.performance_predictors.items():
                    if hasattr(model, 'predict'):
                        scaled_features = self.feature_scalers[metric].transform([candidate_features])
                        selected_features = self.feature_selectors[metric].transform(scaled_features)
                        prediction = model.predict(selected_features)[0]
                        performance_predictions[metric] = prediction
                
                # Calculate overall improvement score
                improvement_score = self._calculate_improvement_score(
                    performance_predictions, optimization_target
                )
                
                # Estimate confidence
                confidence = self._estimate_candidate_confidence(
                    candidate_features, performance_predictions
                )
                
                evaluation = {
                    "candidate": candidate,
                    "performance_predictions": performance_predictions,
                    "improvement_score": improvement_score,
                    "confidence": confidence,
                    "predicted_improvement": improvement_score
                }
                
                evaluations.append(evaluation)
                
            except Exception as e:
                logger.warning(f"Failed to evaluate candidate: {e}")
                continue
        
        # Sort by improvement score
        evaluations.sort(key=lambda x: x["improvement_score"], reverse=True)
        
        return evaluations
    
    async def _apply_rule_optimization(
        self,
        rule_id: str,
        optimization: Dict[str, Any],
        current_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Apply optimization to rule configuration"""
        
        try:
            # Create optimized configuration
            optimized_config = current_config.copy()
            optimized_config.update(optimization["parameters"])
            
            # Update rule configuration in database using enterprise rule engine
            update_result = await self._update_rule_configuration(
                rule_id, optimized_config
            )
            
            # Schedule validation scan
            validation_scan_id = await self._schedule_validation_scan(
                rule_id, optimized_config
            )
            
            # Track optimization application
            application_record = {
                "rule_id": rule_id,
                "optimization_applied": optimization,
                "previous_config": current_config,
                "new_config": optimized_config,
                "validation_scan_id": validation_scan_id,
                "applied_at": datetime.utcnow().isoformat()
            }
            
            return {
                "status": "applied",
                "update_result": update_result,
                "validation_scan_id": validation_scan_id,
                "application_record": application_record
            }
            
        except Exception as e:
            logger.error(f"Failed to apply rule optimization: {e}")
            return {
                "status": "failed",
                "error": str(e)
            }
    
    # Utility methods for optimization
    async def _get_rule_performance_data(self, rule_id: str) -> List[Dict[str, Any]]:
        """Get historical performance data for a rule"""
        try:
            # Pull from DB via models if available, else fallback to in-memory history
            from ..models.advanced_scan_rule_models import RulePerformanceMetric
            from ..db_session import get_session as _get_sync_session
            with _get_sync_session() as s:
                rows = s.exec(
                    select(RulePerformanceMetric).where(RulePerformanceMetric.rule_id == rule_id).order_by(RulePerformanceMetric.measured_at.desc())
                ).all()
                data = []
                for r in rows:
                    data.append({
                        "measured_at": getattr(r, "measured_at", None),
                        "accuracy": getattr(r, "accuracy", None),
                        "precision": getattr(r, "precision", None),
                        "recall": getattr(r, "recall", None),
                        "f1_score": getattr(r, "f1_score", None),
                        "execution_time_ms": getattr(r, "execution_time_ms", None),
                        "throughput_records_per_second": getattr(r, "throughput_records_per_second", None),
                        "error_rate": getattr(r, "error_rate", None),
                        "cpu_usage_percent": getattr(r, "cpu_usage_percent", None),
                        "memory_usage_mb": getattr(r, "memory_usage_mb", None),
                        "custom_metrics": getattr(r, "custom_metrics", {})
                    })
                if data:
                    return data
        except Exception:
            pass
        return list(self.rule_performance_history.get(rule_id, []))

    async def _update_rule_configuration(self, rule_id: str, new_config: Dict[str, Any]) -> Dict[str, Any]:
        """Persist optimized rule configuration using the enterprise rule engine and DB."""
        try:
            # Update via EnterpriseIntelligentRuleEngine if available
            from .enterprise_scan_rule_service import get_enterprise_rule_engine
            engine = await get_enterprise_rule_engine()
            try:
                await engine.update_rule(rule_id, {"parameters": new_config.get("parameters", {}), **new_config})
            except Exception:
                logger.warning("Engine update failed; attempting direct DB update")
                from ..models.advanced_scan_rule_models import IntelligentScanRule
                from ..db_session import get_session as _get_sync_session
                with _get_sync_session() as s:
                    rule = s.exec(select(IntelligentScanRule).where(IntelligentScanRule.rule_id == rule_id)).first()
                    if rule is not None:
                        rule.parameters = new_config.get("parameters", rule.parameters)
                        rule.timeout_seconds = new_config.get("timeout", rule.timeout_seconds)
                        rule.parallel_execution = new_config.get("parallel_execution", rule.parallel_execution)
                        rule.updated_at = datetime.utcnow()
                        s.add(rule)
                        s.commit()
            return {"status": "updated", "rule_id": rule_id}
        except Exception as e:
            logger.error(f"Failed to update rule configuration: {e}")
            return {"status": "failed", "error": str(e)}

    async def _schedule_validation_scan(self, rule_id: str, optimized_config: Dict[str, Any]) -> str:
        """Schedule a validation scan through the orchestration service."""
        try:
            from .scan_orchestration_service import ScanOrchestrationService
            service = ScanOrchestrationService()
            # Build a minimal orchestration request leveraging the rule under test
            scan_request = {
                "orchestration_id": f"validate_{uuid4().hex[:12]}",
                "strategy": "adaptive",
                "priority": 5,
                "rules": [{"id": rule_id, "parameters": optimized_config.get("parameters", {})}],
                "data_sources": optimized_config.get("data_sources", []),
            }
            try:
                await service.orchestrate_scan_execution(scan_request, strategy="adaptive", priority=5)
            except TypeError:
                # Some versions accept positional-only request objects; ignore execution
                pass
            return scan_request["orchestration_id"]
        except Exception as e:
            logger.warning(f"Validation scan scheduling fallback due to error: {e}")
            return f"validate_{uuid4().hex[:12]}"

    async def _extract_candidate_features(self, candidate: Dict[str, Any], base_features: List[float]) -> List[float]:
        """Derive candidate-specific feature vector by appending normalized parameter deltas."""
        try:
            params = candidate.get("parameters", {})
            deltas = []
            for key in sorted(params.keys()):
                val = params[key]
                try:
                    deltas.append(float(val))
                except Exception:
                    deltas.append(0.0)
            features = list(base_features) + deltas[:20]
            return features
        except Exception:
            return list(base_features)

    async def _generate_gradient_candidates(self, current_config: Dict[str, Any], ranges: Dict[str, Tuple[float,float]], target: str) -> List[Dict[str, Any]]:
        """Create candidates by stepping parameters toward presumed gradient directions for the target metric."""
        candidates = []
        params = current_config.get("parameters", {})
        for name, (lo, hi) in ranges.items():
            if name in params and isinstance(params[name], (int, float)):
                step = (hi - lo) * 0.1
                candidates.append({"parameters": {**params, name: max(lo, min(hi, params[name] + step))}})
                candidates.append({"parameters": {**params, name: max(lo, min(hi, params[name] - step))}})
        return candidates[:10]

    async def _generate_random_candidates(self, current_config: Dict[str, Any], ranges: Dict[str, Tuple[float,float]], count: int) -> List[Dict[str, Any]]:
        """Random parameter sampling within provided ranges."""
        rng = np.random.default_rng(42)
        params = current_config.get("parameters", {})
        out = []
        for _ in range(count):
            new_params = dict(params)
            for name, (lo, hi) in ranges.items():
                new_params[name] = float(rng.uniform(lo, hi))
            out.append({"parameters": new_params})
        return out

    async def _generate_bayesian_candidates(self, current_config: Dict[str, Any], ranges: Dict[str, Tuple[float,float]], features: List[float]) -> List[Dict[str, Any]]:
        """Heuristic Bayesian-like exploration using prior means and uncertainty spread from history."""
        out = []
        history = list(self.optimization_history)[-50:]
        priors: Dict[str, Tuple[float, float]] = {}
        for rec in history:
            for k, v in rec.get("optimized_config", {}).get("parameters", {}).items():
                vals = priors.setdefault(k, [])
                vals.append(float(v) if isinstance(v, (int, float)) else 0.0)
        mu_sigma = {k: (float(np.mean(v)), float(np.std(v) if len(v) > 1 else 0.1)) for k, v in priors.items()}
        params = current_config.get("parameters", {})
        for _ in range(5):
            cand = dict(params)
            for name, (lo, hi) in ranges.items():
                mu, sigma = mu_sigma.get(name, ((lo + hi) / 2.0, (hi - lo) / 6.0))
                val = float(np.clip(np.random.normal(mu, max(0.01, sigma)), lo, hi))
                cand[name] = val
            out.append({"parameters": cand})
        return out

    async def _generate_pattern_based_candidates(self, current_config: Dict[str, Any], features: List[float]) -> List[Dict[str, Any]]:
        """Leverage pattern service insights to suggest parameter tweaks aligned with observed data patterns."""
        suggestions: List[Dict[str, Any]] = []
        try:
            if hasattr(self.pattern_service, "get_optimization_suggestions"):
                ps = await self.pattern_service.get_optimization_suggestions()
                for s in ps[:5]:
                    merged = dict(current_config.get("parameters", {}))
                    merged.update(s.get("parameter_adjustments", {}))
                    suggestions.append({"parameters": merged})
        except Exception:
            pass
        return suggestions

    async def _get_parameter_optimization_ranges(self, current_config: Dict[str, Any], constraints: Optional[Dict[str, Any]]) -> Dict[str, Tuple[float, float]]:
        """Derive per-parameter allowed ranges with safety bounds and constraints."""
        ranges: Dict[str, Tuple[float, float]] = {}
        params = current_config.get("parameters", {})
        for name, value in params.items():
            if isinstance(value, (int, float)):
                lo, hi = 0.0, max(1.0, float(value) * 5)
                if constraints and name in constraints:
                    c = constraints[name]
                    lo = float(c.get("min", lo))
                    hi = float(c.get("max", hi))
                ranges[name] = (lo, hi)
        return ranges

    
    async def _get_rule_configuration(self, rule_id: str) -> Dict[str, Any]:
        """Get current rule configuration"""
        try:
            # Integrate with rule management storage
            from sqlmodel import select
            from app.db_session import get_session as _get_sync_session
            from app.models.advanced_scan_rule_models import ScanRuleConfiguration
            with _get_sync_session() as s:
                row = s.exec(select(ScanRuleConfiguration).where(ScanRuleConfiguration.rule_id == rule_id)).first()
                if row:
                    return {
                        "rule_id": rule_id,
                        "type": getattr(row, "rule_type", "data_quality"),
                        "parameters": getattr(row, "parameters", {}) or {},
                    }
        except Exception:
            pass
        # Fallback defaults
        return {
            "rule_id": rule_id,
            "type": "data_quality",
            "parameters": {"threshold": 0.95, "timeout": 300, "batch_size": 1000, "retry_count": 3},
        }
    
    def _calculate_improvement_score(
        self,
        predictions: Dict[str, float],
        optimization_target: str
    ) -> float:
        """Calculate overall improvement score"""
        
        if optimization_target == "overall_performance":
            # Weighted combination of all metrics
            weights = {
                'execution_time': self.config.execution_time_weight,
                'accuracy': self.config.accuracy_weight,
                'resource_usage': self.config.resource_usage_weight,
                'reliability': self.config.reliability_weight
            }
            
            score = 0.0
            total_weight = 0.0
            
            for metric, prediction in predictions.items():
                if metric in weights:
                    weight = weights[metric]
                    # For execution_time and resource_usage, lower is better
                    if metric in ['execution_time', 'resource_usage']:
                        normalized_score = 1.0 / (1.0 + prediction)
                    else:
                        normalized_score = prediction
                    
                    score += normalized_score * weight
                    total_weight += weight
            
            return score / total_weight if total_weight > 0 else 0.0
        
        else:
            # Target specific metric
            return predictions.get(optimization_target, 0.0)
    
    def _estimate_prediction_confidence(
        self,
        model: Any,
        features: np.ndarray,
        metric: str
    ) -> float:
        """Estimate prediction confidence"""
        try:
            # If classifier with probabilities
            if hasattr(model, "predict_proba"):
                proba = model.predict_proba(features.reshape(1, -1))[0]
                confidence = float(np.max(proba))
                return max(0.05, min(0.99, confidence))

            # If ensemble model (e.g., RandomForest), use disagreement (variance) across estimators
            if hasattr(model, "estimators_") and isinstance(model.estimators_, (list, tuple)) and len(model.estimators_) > 0:
                try:
                    # Try regression-style estimators
                    est_preds = [est.predict(features.reshape(1, -1))[0] for est in model.estimators_]
                except Exception:
                    # Fall back to class probabilities if available on base estimators
                    est_preds = []
                    for est in model.estimators_:
                        if hasattr(est, "predict_proba"):
                            p = est.predict_proba(features.reshape(1, -1))[0]
                            est_preds.append(float(np.max(p)))
                    if not est_preds:
                        est_preds = [float(model.predict(features.reshape(1, -1))[0])]
                std = float(np.std(est_preds))
                # Map std to confidence: higher variance → lower confidence
                confidence = float(np.exp(-std))  # e^{-std} in (0,1]
                return max(0.05, min(0.99, confidence))

            # Fallback: distance to decision boundary if decision_function exists
            if hasattr(model, "decision_function"):
                df = model.decision_function(features.reshape(1, -1))
                # Normalize via logistic
                confidence = float(1 / (1 + np.exp(-abs(df))))
                return max(0.05, min(0.99, confidence))

            # Final fallback: neutral confidence based on metric criticality
            critical_metrics = {"accuracy", "reliability"}
            return 0.7 if metric in critical_metrics else 0.6
        except Exception:
            return 0.6
    
    # Performance monitoring support methods
    async def _monitor_rule_performance(self):
        """Monitor rule performance metrics for optimization opportunities"""
        try:
            # Collect current performance metrics
            current_metrics = await self._collect_current_performance_metrics()
            
            # Update performance history
            self._update_performance_history(current_metrics)
            
            # Check for performance degradation
            await self._check_performance_degradation(current_metrics)
            
            logger.debug("Completed rule performance monitoring cycle")
            
        except Exception as e:
            logger.error(f"Error monitoring rule performance: {e}")
    
    async def _collect_current_performance_metrics(self) -> Dict[str, Any]:
        """Collect current rule performance metrics"""
        try:
            # Simulate collecting current performance metrics
            # In real implementation, this would query actual rule execution data
            import random
            
            metrics = {
                "total_rules": random.randint(100, 500),
                "active_rules": random.randint(80, 200),
                "avg_execution_time": random.uniform(50, 300),
                "success_rate": random.uniform(0.85, 0.98),
                "false_positive_rate": random.uniform(0.01, 0.15),
                "false_negative_rate": random.uniform(0.01, 0.10),
                "timestamp": datetime.utcnow().isoformat()
            }
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error collecting current performance metrics: {e}")
            return {}
    
    def _update_performance_history(self, current_metrics: Dict[str, Any]):
        """Update performance history with current metrics"""
        try:
            # Store current metrics in history
            for metric_name, metric_value in current_metrics.items():
                if metric_name != "timestamp":
                    if metric_name not in self.performance_baselines:
                        self.performance_baselines[metric_name] = deque(maxlen=1000)
                    
                    self.performance_baselines[metric_name].append({
                        "value": metric_value,
                        "timestamp": current_metrics["timestamp"]
                    })
            
        except Exception as e:
            logger.error(f"Error updating performance history: {e}")
    
    async def _check_performance_degradation(self, current_metrics: Dict[str, Any]):
        """Check for performance degradation and trigger optimization if needed"""
        try:
            # Check success rate degradation
            success_rate = current_metrics.get("success_rate", 1.0)
            if success_rate < 0.90:  # Below 90% success rate
                await self._trigger_optimization_for_degradation("success_rate", success_rate)
            
            # Check execution time degradation
            avg_execution_time = current_metrics.get("avg_execution_time", 0)
            if avg_execution_time > 300:  # Above 5 minutes
                await self._trigger_optimization_for_degradation("execution_time", avg_execution_time)
            
            # Check false positive rate degradation
            false_positive_rate = current_metrics.get("false_positive_rate", 0)
            if false_positive_rate > 0.20:  # Above 20% false positive rate
                await self._trigger_optimization_for_degradation("false_positive_rate", false_positive_rate)
            
        except Exception as e:
            logger.error(f"Error checking performance degradation: {e}")
    
    async def _trigger_optimization_for_degradation(self, metric_name: str, current_value: float):
        """Trigger optimization for specific performance degradation"""
        try:
            # Create optimization request
            optimization_request = {
                "id": str(uuid4()),
                "type": "performance_degradation",
                "metric": metric_name,
                "current_value": current_value,
                "priority": "high",
                "triggered_at": datetime.utcnow().isoformat(),
                "status": "pending"
            }
            
            # Add to optimization queue
            self.optimization_queue.append(optimization_request)
            
            logger.warning(f"Triggered optimization for {metric_name} degradation: {current_value}")
            
        except Exception as e:
            logger.error(f"Error triggering optimization for degradation: {e}")
    
    async def _identify_underperforming_rules(self):
        """Identify rules that are underperforming and need optimization"""
        try:
            # Analyze performance baselines to identify underperforming rules
            underperforming_rules = []
            
            # Check for rules with consistently low success rates
            if "success_rate" in self.performance_baselines:
                recent_success_rates = [entry["value"] for entry in list(self.performance_baselines["success_rate"])[-10:]]
                if recent_success_rates and all(rate < 0.85 for rate in recent_success_rates):
                    underperforming_rules.append({
                        "issue": "low_success_rate",
                        "severity": "high",
                        "description": "Consistently low success rate detected",
                        "recommendation": "Review rule logic and data quality"
                    })
            
            # Check for rules with high execution times
            if "avg_execution_time" in self.performance_baselines:
                recent_execution_times = [entry["value"] for entry in list(self.performance_baselines["avg_execution_time"])[-10:]]
                if recent_execution_times and all(time > 200 for time in recent_execution_times):
                    underperforming_rules.append({
                        "issue": "high_execution_time",
                        "severity": "medium",
                        "description": "Consistently high execution time detected",
                        "recommendation": "Optimize rule algorithms and resource allocation"
                    })
            
            # Log underperforming rules
            if underperforming_rules:
                logger.warning(f"Identified {len(underperforming_rules)} underperforming rule patterns")
                for rule in underperforming_rules:
                    logger.warning(f"Underperforming rule: {rule['description']} - {rule['recommendation']}")
            
        except Exception as e:
            logger.error(f"Error identifying underperforming rules: {e}")
    
    # Background task loops
    async def _optimization_loop(self):
        """Main optimization loop"""
        while True:
            try:
                await asyncio.sleep(self.config.optimization_interval)
                
                # Process optimization queue
                await self._process_optimization_queue()
                
                # Check for rules that need optimization
                await self._identify_optimization_candidates()
                
                # Update optimization metrics
                await self._update_optimization_metrics()
                
            except Exception as e:
                logger.error(f"Optimization loop error: {e}")
    
    async def _model_retraining_loop(self):
        """Model retraining loop"""
        while True:
            try:
                await asyncio.sleep(self.config.model_retrain_interval)
                
                # Retrain performance prediction models
                await self._retrain_performance_models()
                
                # Update model accuracy metrics
                await self._evaluate_model_performance()
                
            except Exception as e:
                logger.error(f"Model retraining loop error: {e}")
    
    async def _performance_monitoring_loop(self):
        """Monitor rule performance for optimization opportunities"""
        while True:
            try:
                await asyncio.sleep(300)  # Check every 5 minutes
                
                # Monitor rule performance
                await self._monitor_rule_performance()
                
                # Identify underperforming rules
                await self._identify_underperforming_rules()
                
            except Exception as e:
                logger.error(f"Performance monitoring loop error: {e}")
    
    async def get_optimization_insights(self) -> Dict[str, Any]:
        """Get comprehensive optimization insights"""
        
        return {
            "optimization_metrics": self.optimization_metrics.copy(),
            "active_optimizations": len(self.active_optimizations),
            "optimization_queue_size": len(self.optimization_queue),
            "optimization_history_size": len(self.optimization_history),
            "model_status": {
                metric: {
                    "trained": hasattr(model, 'predict'),
                    "accuracy": getattr(model, 'score_', 0.0)
                }
                for metric, model in self.performance_predictors.items()
            },
            "performance_baselines": len(self.performance_baselines),
            "configuration": {
                "optimization_interval": self.config.optimization_interval,
                "min_optimization_samples": self.config.min_optimization_samples,
                "performance_threshold": self.config.performance_threshold,
                "improvement_threshold": self.config.improvement_threshold,
                "learning_rate": self.config.learning_rate
            }
        }