"""
Enterprise Rule Validation Engine
Advanced rule validation service for comprehensive scan rule validation including
syntax checking, semantic validation, performance impact analysis, and automated
rule testing with intelligent validation recommendations.
"""

import asyncio
import ast
import json
import logging
import re
import time
from collections import defaultdict, deque
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Set, Tuple, Union
from uuid import uuid4

import pandas as pd
from sqlalchemy import text

from ..core.cache_manager import EnterpriseCacheManager as CacheManager
from ..core.logging_config import get_logger
from ..core.settings import get_settings_manager
from ..models.advanced_scan_rule_models import (
    IntelligentScanRule, RuleExecutionHistory, RuleOptimizationJob,
    RulePatternLibrary, RulePatternAssociation, RulePerformanceBaseline
)
from ..services.ai_service import EnterpriseAIService as AIService

logger = get_logger(__name__)

class ValidationConfig:
    """Configuration for rule validation"""
    
    def __init__(self):
        self.max_validation_time = 300  # 5 minutes
        self.syntax_validation_enabled = True
        self.semantic_validation_enabled = True
        self.performance_validation_enabled = True
        self.security_validation_enabled = True
        
        # Validation thresholds
        self.max_execution_time_ms = 10000  # 10 seconds
        self.max_memory_usage_mb = 500
        self.max_complexity_score = 1000
        self.min_confidence_score = 0.7
        
        # Rule testing
        self.auto_test_enabled = True
        self.test_data_samples = 100
        self.test_timeout_seconds = 30
        
        # Performance benchmarks
        self.performance_baseline_samples = 10
        self.performance_regression_threshold = 0.2  # 20% performance degradation

class RuleValidationEngine:
    """
    Enterprise-grade rule validation engine providing:
    - Comprehensive syntax and semantic validation
    - Performance impact analysis and benchmarking
    - Security vulnerability assessment
    - Automated rule testing with sample data
    - Intelligent validation recommendations
    - Cross-rule dependency validation
    """
    
    def __init__(self):
        self.settings = get_settings_manager()
        self.cache = CacheManager()
        self.ai_service = AIService()
        
        self.config = ValidationConfig()
        self._init_validation_components()
        
        # Validation state
        self.validation_history = deque(maxlen=1000)
        self.validation_cache = {}
        self.performance_baselines = {}
        
        # Rule testing
        self.test_data_cache = {}
        self.test_results = deque(maxlen=500)
        
        # Validation patterns and rules
        self.syntax_patterns = {}
        self.semantic_rules = {}
        self.security_patterns = {}
        
        # Validation metrics
        self.validation_metrics = {
            'total_validations': 0,
            'successful_validations': 0,
            'syntax_errors': 0,
            'semantic_errors': 0,
            'performance_warnings': 0,
            'security_warnings': 0,
            'average_validation_time': 0.0,
            'cache_hit_rate': 0.0
        }
        
        # Threading
        self.executor = ThreadPoolExecutor(max_workers=8)
        
        # Background tasks (defer until loop exists)
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(self._validation_cache_cleanup_loop())
            loop.create_task(self._performance_baseline_update_loop())
        except RuntimeError:
            pass

    def start(self) -> None:
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(self._validation_cache_cleanup_loop())
            loop.create_task(self._performance_baseline_update_loop())
        except RuntimeError:
            pass
    
    def _init_validation_components(self):
        """Initialize validation components and patterns"""
        try:
            # Initialize syntax patterns for different rule types
            self.syntax_patterns = {
                RuleType.SQL_BASED: {
                    'patterns': [
                        r'\bSELECT\b.*\bFROM\b',
                        r'\bINSERT\b.*\bINTO\b',
                        r'\bUPDATE\b.*\bSET\b',
                        r'\bDELETE\b.*\bFROM\b'
                    ],
                    'forbidden': [
                        r'\bDROP\b',
                        r'\bTRUNCATE\b',
                        r'\bALTER\b',
                        r'--',
                        r'/\*.*\*/',
                        r';\s*\w+'  # Multiple statements
                    ]
                },
                RuleType.REGEX_PATTERN: {
                    'validation_func': self._validate_regex_pattern
                },
                RuleType.PYTHON_EXPRESSION: {
                    'validation_func': self._validate_python_expression
                },
                RuleType.JSON_SCHEMA: {
                    'validation_func': self._validate_json_schema
                }
            }
            
            # Initialize semantic validation rules
            self.semantic_rules = {
                'data_type_consistency': self._validate_data_type_consistency,
                'column_existence': self._validate_column_existence,
                'table_existence': self._validate_table_existence,
                'function_validity': self._validate_function_validity,
                'logical_consistency': self._validate_logical_consistency
            }
            
            # Initialize security patterns
            self.security_patterns = {
                'sql_injection': [
                    r'(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+',
                    r'(\bOR\b|\bAND\b)\s+[\'"]\w*[\'"]\s*=\s*[\'"]\w*[\'"]',
                    r'\bUNION\b.*\bSELECT\b',
                    r'\b(DROP|DELETE|TRUNCATE|ALTER)\b'
                ],
                'code_injection': [
                    r'__import__',
                    r'\beval\b',
                    r'\bexec\b',
                    r'\bcompile\b',
                    r'\bopen\b\s*\(',
                    r'\bfile\b\s*\('
                ],
                'path_traversal': [
                    r'\.\./+',
                    r'\.\.\\+',
                    r'/etc/',
                    r'\\windows\\'
                ]
            }
            
            logger.info("Rule validation components initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize validation components: {e}")
            raise
    
    async def validate_rule(
        self,
        rule_definition: Dict[str, Any],
        validation_options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Comprehensive rule validation with all checks
        
        Args:
            rule_definition: Rule definition to validate
            validation_options: Optional validation configuration
            
        Returns:
            Complete validation results with recommendations
        """
        validation_id = str(uuid4())
        start_time = time.time()
        
        try:
            # Check cache first
            cache_key = self._generate_cache_key(rule_definition)
            if cache_key in self.validation_cache:
                cached_result = self.validation_cache[cache_key]
                self.validation_metrics['cache_hit_rate'] += 1
                return cached_result
            
            # Initialize validation results
            validation_results = {
                "validation_id": validation_id,
                "rule_id": rule_definition.get("rule_id"),
                "rule_type": rule_definition.get("rule_type"),
                "overall_status": "unknown",
                "validation_stages": {},
                "errors": [],
                "warnings": [],
                "recommendations": [],
                "performance_analysis": {},
                "security_analysis": {},
                "test_results": {}
            }
            
            # Stage 1: Syntax Validation
            if self.config.syntax_validation_enabled:
                syntax_result = await self._validate_syntax(rule_definition)
                validation_results["validation_stages"]["syntax"] = syntax_result
                
                if not syntax_result["valid"]:
                    validation_results["errors"].extend(syntax_result["errors"])
                    validation_results["overall_status"] = "failed"
                    return self._finalize_validation_result(validation_results, start_time)
            
            # Stage 2: Semantic Validation
            if self.config.semantic_validation_enabled:
                semantic_result = await self._validate_semantics(rule_definition)
                validation_results["validation_stages"]["semantic"] = semantic_result
                
                if not semantic_result["valid"]:
                    validation_results["errors"].extend(semantic_result["errors"])
                    if validation_results["overall_status"] != "failed":
                        validation_results["overall_status"] = "warning"
                
                validation_results["warnings"].extend(semantic_result.get("warnings", []))
            
            # Stage 3: Security Validation
            if self.config.security_validation_enabled:
                security_result = await self._validate_security(rule_definition)
                validation_results["validation_stages"]["security"] = security_result
                validation_results["security_analysis"] = security_result
                
                if security_result.get("vulnerabilities"):
                    validation_results["errors"].extend(
                        [f"Security vulnerability: {v}" for v in security_result["vulnerabilities"]]
                    )
                    validation_results["overall_status"] = "failed"
                
                validation_results["warnings"].extend(security_result.get("warnings", []))
            
            # Stage 4: Performance Validation
            if self.config.performance_validation_enabled:
                performance_result = await self._validate_performance(rule_definition)
                validation_results["validation_stages"]["performance"] = performance_result
                validation_results["performance_analysis"] = performance_result
                
                if performance_result.get("performance_issues"):
                    validation_results["warnings"].extend(
                        [f"Performance issue: {issue}" for issue in performance_result["performance_issues"]]
                    )
                    if validation_results["overall_status"] == "unknown":
                        validation_results["overall_status"] = "warning"
            
            # Stage 5: Automated Testing
            if self.config.auto_test_enabled:
                test_result = await self._perform_automated_testing(rule_definition)
                validation_results["validation_stages"]["testing"] = test_result
                validation_results["test_results"] = test_result
                
                if not test_result.get("all_tests_passed", True):
                    validation_results["warnings"].append("Some automated tests failed")
            
            # Generate recommendations
            recommendations = await self._generate_validation_recommendations(
                rule_definition, validation_results
            )
            validation_results["recommendations"] = recommendations
            
            # Determine final status
            if validation_results["overall_status"] == "unknown":
                validation_results["overall_status"] = "passed"
            
            # Cache result
            self.validation_cache[cache_key] = validation_results
            
            return self._finalize_validation_result(validation_results, start_time)
            
        except Exception as e:
            logger.error(f"Rule validation failed: {e}")
            return {
                "validation_id": validation_id,
                "overall_status": "error",
                "error": str(e),
                "processing_time_seconds": time.time() - start_time
            }
    
    async def _validate_syntax(self, rule_definition: Dict[str, Any]) -> Dict[str, Any]:
        """Validate rule syntax"""
        
        try:
            rule_type = RuleType(rule_definition.get("rule_type", "custom"))
            rule_expression = rule_definition.get("rule_expression", "")
            
            syntax_result = {
                "valid": True,
                "errors": [],
                "warnings": [],
                "syntax_score": 1.0
            }
            
            # Get validation patterns for rule type
            patterns = self.syntax_patterns.get(rule_type, {})
            
            if rule_type == RuleType.SQL_BASED:
                syntax_result = await self._validate_sql_syntax(rule_expression, patterns)
            
            elif rule_type == RuleType.REGEX_PATTERN:
                syntax_result = await self._validate_regex_syntax(rule_expression)
            
            elif rule_type == RuleType.PYTHON_EXPRESSION:
                syntax_result = await self._validate_python_syntax(rule_expression)
            
            elif rule_type == RuleType.JSON_SCHEMA:
                syntax_result = await self._validate_json_syntax(rule_expression)
            
            else:
                # Generic validation for custom rules
                syntax_result = await self._validate_generic_syntax(rule_expression)
            
            # Update metrics
            if not syntax_result["valid"]:
                self.validation_metrics['syntax_errors'] += 1
            
            return syntax_result
            
        except Exception as e:
            return {
                "valid": False,
                "errors": [f"Syntax validation error: {str(e)}"],
                "warnings": [],
                "syntax_score": 0.0
            }
    
    async def _validate_sql_syntax(
        self,
        sql_expression: str,
        patterns: Dict[str, List[str]]
    ) -> Dict[str, Any]:
        """Validate SQL syntax"""
        
        result = {
            "valid": True,
            "errors": [],
            "warnings": [],
            "syntax_score": 1.0
        }
        
        try:
            # Check for forbidden patterns
            forbidden_patterns = patterns.get("forbidden", [])
            for pattern in forbidden_patterns:
                if re.search(pattern, sql_expression, re.IGNORECASE):
                    result["valid"] = False
                    result["errors"].append(f"Forbidden SQL pattern detected: {pattern}")
            
            # Check for required patterns
            required_patterns = patterns.get("patterns", [])
            pattern_found = False
            for pattern in required_patterns:
                if re.search(pattern, sql_expression, re.IGNORECASE):
                    pattern_found = True
                    break
            
            if required_patterns and not pattern_found:
                result["warnings"].append("SQL expression doesn't match expected patterns")
                result["syntax_score"] *= 0.8
            
            # Basic SQL parsing validation
            # Remove comments and normalize whitespace
            normalized_sql = re.sub(r'--.*', '', sql_expression)
            normalized_sql = re.sub(r'/\*.*?\*/', '', normalized_sql, flags=re.DOTALL)
            normalized_sql = ' '.join(normalized_sql.split())
            
            # Check for basic SQL structure
            if normalized_sql and not re.search(r'\b(SELECT|INSERT|UPDATE|DELETE|WITH)\b', normalized_sql, re.IGNORECASE):
                result["warnings"].append("SQL expression may not be a valid SQL statement")
                result["syntax_score"] *= 0.7
            
            # Check for balanced parentheses
            paren_count = sql_expression.count('(') - sql_expression.count(')')
            if paren_count != 0:
                result["valid"] = False
                result["errors"].append("Unbalanced parentheses in SQL expression")
            
            # Check for balanced quotes
            single_quote_count = sql_expression.count("'") % 2
            double_quote_count = sql_expression.count('"') % 2
            if single_quote_count != 0 or double_quote_count != 0:
                result["valid"] = False
                result["errors"].append("Unbalanced quotes in SQL expression")
            
        except Exception as e:
            result["valid"] = False
            result["errors"].append(f"SQL syntax validation error: {str(e)}")
        
        return result
    
    async def _validate_regex_syntax(self, regex_pattern: str) -> Dict[str, Any]:
        """Validate regex pattern syntax"""
        
        result = {
            "valid": True,
            "errors": [],
            "warnings": [],
            "syntax_score": 1.0
        }
        
        try:
            # Test regex compilation
            compiled_pattern = re.compile(regex_pattern)
            
            # Check for common regex issues
            if len(regex_pattern) > 1000:
                result["warnings"].append("Regex pattern is very long and may impact performance")
                result["syntax_score"] *= 0.9
            
            # Check for potentially problematic patterns
            problematic_patterns = [
                r'\.\*\.\*',  # Multiple greedy quantifiers
                r'\+\+',      # Nested quantifiers
                r'\*\*',      # Nested quantifiers
                r'\(\?\:.*\(\?\:.*\(\?\:'  # Deep nesting
            ]
            
            for pattern in problematic_patterns:
                if re.search(pattern, regex_pattern):
                    result["warnings"].append(f"Potentially problematic regex pattern: {pattern}")
                    result["syntax_score"] *= 0.8
            
        except re.error as e:
            result["valid"] = False
            result["errors"].append(f"Invalid regex pattern: {str(e)}")
        except Exception as e:
            result["valid"] = False
            result["errors"].append(f"Regex validation error: {str(e)}")
        
        return result
    
    async def _validate_python_syntax(self, python_expression: str) -> Dict[str, Any]:
        """Validate Python expression syntax"""
        
        result = {
            "valid": True,
            "errors": [],
            "warnings": [],
            "syntax_score": 1.0
        }
        
        try:
            # Parse Python expression
            parsed = ast.parse(python_expression, mode='eval')
            
            # Security check for dangerous functions
            dangerous_funcs = ['eval', 'exec', 'compile', '__import__', 'open', 'file']
            for node in ast.walk(parsed):
                if isinstance(node, ast.Name) and node.id in dangerous_funcs:
                    result["valid"] = False
                    result["errors"].append(f"Dangerous function detected: {node.id}")
                
                if isinstance(node, ast.Call) and hasattr(node.func, 'id'):
                    if node.func.id in dangerous_funcs:
                        result["valid"] = False
                        result["errors"].append(f"Dangerous function call: {node.func.id}")
            
            # Check complexity
            node_count = len(list(ast.walk(parsed)))
            if node_count > 100:
                result["warnings"].append("Python expression is complex and may impact performance")
                result["syntax_score"] *= 0.9
            
        except SyntaxError as e:
            result["valid"] = False
            result["errors"].append(f"Python syntax error: {str(e)}")
        except Exception as e:
            result["valid"] = False
            result["errors"].append(f"Python validation error: {str(e)}")
        
        return result
    
    async def _validate_json_syntax(self, json_expression: str) -> Dict[str, Any]:
        """Validate JSON schema syntax"""
        
        result = {
            "valid": True,
            "errors": [],
            "warnings": [],
            "syntax_score": 1.0
        }
        
        try:
            # Parse JSON
            parsed_json = json.loads(json_expression)
            
            # Basic JSON schema validation
            if isinstance(parsed_json, dict):
                # Check for required schema properties
                schema_properties = ['type', 'properties', 'required']
                present_properties = [prop for prop in schema_properties if prop in parsed_json]
                
                if not present_properties:
                    result["warnings"].append("JSON doesn't appear to be a valid schema")
                    result["syntax_score"] *= 0.8
            
        except json.JSONDecodeError as e:
            result["valid"] = False
            result["errors"].append(f"Invalid JSON: {str(e)}")
        except Exception as e:
            result["valid"] = False
            result["errors"].append(f"JSON validation error: {str(e)}")
        
        return result
    
    async def _validate_semantics(self, rule_definition: Dict[str, Any]) -> Dict[str, Any]:
        """Validate rule semantics"""
        
        semantic_result = {
            "valid": True,
            "errors": [],
            "warnings": [],
            "semantic_score": 1.0
        }
        
        try:
            # Run all semantic validation rules
            for rule_name, validation_func in self.semantic_rules.items():
                try:
                    rule_result = await validation_func(rule_definition)
                    
                    if not rule_result.get("valid", True):
                        semantic_result["valid"] = False
                        semantic_result["errors"].extend(rule_result.get("errors", []))
                    
                    semantic_result["warnings"].extend(rule_result.get("warnings", []))
                    
                    # Adjust semantic score based on rule result
                    rule_score = rule_result.get("score", 1.0)
                    semantic_result["semantic_score"] *= rule_score
                    
                except Exception as e:
                    semantic_result["warnings"].append(
                        f"Semantic validation rule '{rule_name}' failed: {str(e)}"
                    )
            
            # Update metrics
            if not semantic_result["valid"]:
                self.validation_metrics['semantic_errors'] += 1
            
        except Exception as e:
            semantic_result["valid"] = False
            semantic_result["errors"].append(f"Semantic validation error: {str(e)}")
        
        return semantic_result
    
    async def _validate_security(self, rule_definition: Dict[str, Any]) -> Dict[str, Any]:
        """Validate rule security"""
        
        security_result = {
            "secure": True,
            "vulnerabilities": [],
            "warnings": [],
            "security_score": 1.0,
            "risk_level": "low"
        }
        
        try:
            rule_expression = rule_definition.get("rule_expression", "")
            
            # Check against security patterns
            for vulnerability_type, patterns in self.security_patterns.items():
                for pattern in patterns:
                    if re.search(pattern, rule_expression, re.IGNORECASE):
                        security_result["secure"] = False
                        security_result["vulnerabilities"].append(
                            f"{vulnerability_type}: {pattern}"
                        )
                        security_result["security_score"] *= 0.5
            
            # Determine risk level
            if len(security_result["vulnerabilities"]) > 3:
                security_result["risk_level"] = "high"
            elif len(security_result["vulnerabilities"]) > 1:
                security_result["risk_level"] = "medium"
            elif len(security_result["vulnerabilities"]) > 0:
                security_result["risk_level"] = "low"
            
            # Additional security checks
            if rule_definition.get("requires_admin_privileges"):
                security_result["warnings"].append(
                    "Rule requires admin privileges - ensure proper access control"
                )
            
            if rule_definition.get("accesses_external_resources"):
                security_result["warnings"].append(
                    "Rule accesses external resources - validate network security"
                )
            
            # Update metrics
            if security_result["vulnerabilities"]:
                self.validation_metrics['security_warnings'] += 1
            
        except Exception as e:
            security_result["secure"] = False
            security_result["vulnerabilities"].append(f"Security validation error: {str(e)}")
        
        return security_result
    
    async def _validate_performance(self, rule_definition: Dict[str, Any]) -> Dict[str, Any]:
        """Validate rule performance characteristics"""
        
        performance_result = {
            "efficient": True,
            "performance_issues": [],
            "warnings": [],
            "performance_score": 1.0,
            "estimated_execution_time": 0.0,
            "estimated_memory_usage": 0.0,
            "complexity_score": 0.0
        }
        
        try:
            rule_expression = rule_definition.get("rule_expression", "")
            rule_type = RuleType(rule_definition.get("rule_type", "custom"))
            
            # Calculate complexity score
            complexity_score = await self._calculate_complexity_score(rule_expression, rule_type)
            performance_result["complexity_score"] = complexity_score
            
            if complexity_score > self.config.max_complexity_score:
                performance_result["efficient"] = False
                performance_result["performance_issues"].append(
                    f"High complexity score: {complexity_score}"
                )
            
            # Estimate execution time based on complexity and rule type
            base_time = {
                RuleType.SQL_BASED: 100,  # ms
                RuleType.REGEX_PATTERN: 10,
                RuleType.PYTHON_EXPRESSION: 50,
                RuleType.JSON_SCHEMA: 20
            }.get(rule_type, 30)
            
            estimated_time = base_time * (1 + complexity_score / 1000)
            performance_result["estimated_execution_time"] = estimated_time
            
            if estimated_time > self.config.max_execution_time_ms:
                performance_result["efficient"] = False
                performance_result["performance_issues"].append(
                    f"Estimated execution time too high: {estimated_time}ms"
                )
            
            # Estimate memory usage
            estimated_memory = len(rule_expression) * 0.001 + complexity_score * 0.1  # MB
            performance_result["estimated_memory_usage"] = estimated_memory
            
            if estimated_memory > self.config.max_memory_usage_mb:
                performance_result["warnings"].append(
                    f"High estimated memory usage: {estimated_memory}MB"
                )
            
            # Check for performance anti-patterns
            if rule_type == RuleType.SQL_BASED:
                await self._check_sql_performance_patterns(rule_expression, performance_result)
            elif rule_type == RuleType.REGEX_PATTERN:
                await self._check_regex_performance_patterns(rule_expression, performance_result)
            
            # Update metrics
            if performance_result["performance_issues"]:
                self.validation_metrics['performance_warnings'] += 1
            
        except Exception as e:
            performance_result["efficient"] = False
            performance_result["performance_issues"].append(f"Performance validation error: {str(e)}")
        
        return performance_result
    
    async def _perform_automated_testing(self, rule_definition: Dict[str, Any]) -> Dict[str, Any]:
        """Perform automated testing of the rule"""
        
        test_result = {
            "all_tests_passed": True,
            "tests_run": 0,
            "tests_passed": 0,
            "test_details": [],
            "test_coverage": 0.0,
            "execution_stats": {}
        }
        
        try:
            rule_type = RuleType(rule_definition.get("rule_type", "custom"))
            rule_expression = rule_definition.get("rule_expression", "")
            
            # Generate test data
            test_data = await self._generate_test_data(rule_definition)
            
            if not test_data:
                test_result["all_tests_passed"] = False
                test_result["test_details"].append({
                    "test_name": "data_generation",
                    "status": "failed",
                    "error": "Could not generate test data"
                })
                return test_result
            
            # Run tests with different data scenarios
            test_scenarios = [
                {"name": "valid_data", "data": test_data["valid"]},
                {"name": "invalid_data", "data": test_data["invalid"]},
                {"name": "edge_cases", "data": test_data["edge_cases"]},
                {"name": "large_dataset", "data": test_data["large_dataset"]}
            ]
            
            for scenario in test_scenarios:
                test_name = scenario["name"]
                test_data_set = scenario["data"]
                
                try:
                    # Execute rule with test data
                    execution_result = await self._execute_rule_with_test_data(
                        rule_definition, test_data_set
                    )
                    
                    test_result["tests_run"] += 1
                    
                    if execution_result["success"]:
                        test_result["tests_passed"] += 1
                        test_result["test_details"].append({
                            "test_name": test_name,
                            "status": "passed",
                            "execution_time": execution_result["execution_time"],
                            "memory_usage": execution_result.get("memory_usage", 0)
                        })
                    else:
                        test_result["all_tests_passed"] = False
                        test_result["test_details"].append({
                            "test_name": test_name,
                            "status": "failed",
                            "error": execution_result["error"],
                            "execution_time": execution_result.get("execution_time", 0)
                        })
                
                except Exception as e:
                    test_result["all_tests_passed"] = False
                    test_result["test_details"].append({
                        "test_name": test_name,
                        "status": "error",
                        "error": str(e)
                    })
            
            # Calculate test coverage
            if test_result["tests_run"] > 0:
                test_result["test_coverage"] = test_result["tests_passed"] / test_result["tests_run"]
            
            # Generate execution statistics
            execution_times = [
                detail.get("execution_time", 0) 
                for detail in test_result["test_details"] 
                if detail.get("execution_time")
            ]
            
            if execution_times:
                test_result["execution_stats"] = {
                    "avg_execution_time": sum(execution_times) / len(execution_times),
                    "max_execution_time": max(execution_times),
                    "min_execution_time": min(execution_times)
                }
            
        except Exception as e:
            test_result["all_tests_passed"] = False
            test_result["test_details"].append({
                "test_name": "automated_testing",
                "status": "error",
                "error": str(e)
            })
        
        return test_result
    
    async def _generate_validation_recommendations(
        self,
        rule_definition: Dict[str, Any],
        validation_results: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate intelligent validation recommendations"""
        
        recommendations = []
        
        try:
            # Syntax recommendations
            syntax_stage = validation_results.get("validation_stages", {}).get("syntax", {})
            if not syntax_stage.get("valid", True):
                recommendations.append({
                    "type": "syntax",
                    "priority": "high",
                    "title": "Fix Syntax Errors",
                    "description": "Rule contains syntax errors that must be fixed",
                    "suggestions": [
                        "Review rule expression for syntax compliance",
                        "Validate against rule type requirements",
                        "Check for balanced parentheses and quotes"
                    ]
                })
            
            # Performance recommendations
            performance_stage = validation_results.get("validation_stages", {}).get("performance", {})
            if performance_stage.get("performance_issues"):
                recommendations.append({
                    "type": "performance",
                    "priority": "medium",
                    "title": "Optimize Performance",
                    "description": "Rule may have performance issues",
                    "suggestions": [
                        "Simplify complex expressions",
                        "Add appropriate indexes for SQL-based rules",
                        "Consider rule execution frequency",
                        "Test with representative data volumes"
                    ]
                })
            
            # Security recommendations
            security_stage = validation_results.get("validation_stages", {}).get("security", {})
            if security_stage.get("vulnerabilities"):
                recommendations.append({
                    "type": "security",
                    "priority": "high",
                    "title": "Address Security Vulnerabilities",
                    "description": "Rule contains potential security vulnerabilities",
                    "suggestions": [
                        "Remove or escape dangerous patterns",
                        "Implement proper input validation",
                        "Use parameterized queries for SQL rules",
                        "Review access permissions"
                    ]
                })
            
            # Testing recommendations
            test_stage = validation_results.get("validation_stages", {}).get("testing", {})
            if not test_stage.get("all_tests_passed", True):
                recommendations.append({
                    "type": "testing",
                    "priority": "medium",
                    "title": "Improve Test Coverage",
                    "description": "Some automated tests failed",
                    "suggestions": [
                        "Review failed test scenarios",
                        "Add more comprehensive test data",
                        "Validate rule logic with edge cases",
                        "Consider rule behavior with invalid inputs"
                    ]
                })
            
            # General best practices
            if validation_results.get("overall_status") == "passed":
                recommendations.append({
                    "type": "best_practice",
                    "priority": "low",
                    "title": "Consider Best Practices",
                    "description": "Additional improvements for rule quality",
                    "suggestions": [
                        "Add comprehensive documentation",
                        "Implement error handling",
                        "Consider rule monitoring and alerting",
                        "Plan for rule maintenance and updates"
                    ]
                })
            
        except Exception as e:
            logger.error(f"Failed to generate recommendations: {e}")
        
        return recommendations
    
    def _finalize_validation_result(
        self,
        validation_results: Dict[str, Any],
        start_time: float
    ) -> Dict[str, Any]:
        """Finalize validation result with timing and metrics"""
        
        processing_time = time.time() - start_time
        validation_results["processing_time_seconds"] = processing_time
        validation_results["validated_at"] = datetime.utcnow().isoformat()
        
        # Update service metrics
        self.validation_metrics['total_validations'] += 1
        self.validation_metrics['average_validation_time'] = (
            (self.validation_metrics['average_validation_time'] * (self.validation_metrics['total_validations'] - 1) + processing_time) /
            self.validation_metrics['total_validations']
        )
        
        if validation_results["overall_status"] in ["passed", "warning"]:
            self.validation_metrics['successful_validations'] += 1
        
        # Store in validation history
        self.validation_history.append({
            "validation_id": validation_results["validation_id"],
            "rule_id": validation_results.get("rule_id"),
            "status": validation_results["overall_status"],
            "processing_time": processing_time,
            "timestamp": datetime.utcnow()
        })
        
        return validation_results
    
    # Utility methods
    def _generate_cache_key(self, rule_definition: Dict[str, Any]) -> str:
        """Generate cache key for validation result"""
        key_data = {
            "rule_type": rule_definition.get("rule_type"),
            "rule_expression": rule_definition.get("rule_expression"),
            "validation_options": rule_definition.get("validation_options", {})
        }
        return str(hash(json.dumps(key_data, sort_keys=True)))
    
    # Background task loops
    async def _validation_cache_cleanup_loop(self):
        """Clean up validation cache periodically"""
        while True:
            try:
                await asyncio.sleep(3600)  # Run every hour
                
                # Remove old cache entries
                current_time = time.time()
                cache_ttl = 7200  # 2 hours
                
                expired_keys = [
                    key for key, result in self.validation_cache.items()
                    if (current_time - result.get("cached_at", 0)) > cache_ttl
                ]
                
                for key in expired_keys:
                    del self.validation_cache[key]
                
                logger.info(f"Cleaned up {len(expired_keys)} expired validation cache entries")
                
            except Exception as e:
                logger.error(f"Validation cache cleanup error: {e}")
    
    async def _performance_baseline_update_loop(self):
        """Update performance baselines periodically"""
        while True:
            try:
                await asyncio.sleep(86400)  # Run daily
                
                # Update performance baselines based on recent validations
                await self._update_performance_baselines()
                
            except Exception as e:
                logger.error(f"Performance baseline update error: {e}")
    
    async def get_validation_insights(self) -> Dict[str, Any]:
        """Get comprehensive validation service insights"""
        
        return {
            "validation_metrics": self.validation_metrics.copy(),
            "validation_cache_size": len(self.validation_cache),
            "validation_history_size": len(self.validation_history),
            "test_results_size": len(self.test_results),
            "performance_baselines": len(self.performance_baselines),
            "configuration": {
                "max_validation_time": self.config.max_validation_time,
                "syntax_validation_enabled": self.config.syntax_validation_enabled,
                "semantic_validation_enabled": self.config.semantic_validation_enabled,
                "performance_validation_enabled": self.config.performance_validation_enabled,
                "security_validation_enabled": self.config.security_validation_enabled,
                "auto_test_enabled": self.config.auto_test_enabled
            },
            "validation_patterns": {
                "syntax_patterns": len(self.syntax_patterns),
                "semantic_rules": len(self.semantic_rules),
                "security_patterns": len(self.security_patterns)
            }
        }