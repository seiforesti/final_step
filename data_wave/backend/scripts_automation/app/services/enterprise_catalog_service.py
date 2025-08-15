"""
Enterprise Data Catalog Service - Advanced Production Implementation
==================================================================

This service provides enterprise-grade data catalog management with AI/ML capabilities,
intelligent asset discovery, comprehensive lineage tracking, and advanced quality
management with seamless integration across all data governance systems.

Key Features:
- AI-powered asset discovery and classification
- Intelligent lineage tracking with graph analysis
- Comprehensive data quality management
- Business glossary integration with semantic understanding
- Real-time monitoring and alerting
- Advanced analytics and insights
- Seamless integration with scan rules, compliance, and classification systems

Production Requirements:
- 99.9% uptime with intelligent error recovery
- Sub-second response times for 95% of operations
- Horizontal scalability to handle 100M+ assets
- Real-time monitoring with predictive analytics
- Zero-downtime updates and migrations
"""

from typing import List, Dict, Any, Optional, Union, Tuple, Set, AsyncGenerator
from datetime import datetime, timedelta
import asyncio
import uuid
import json
import re
import logging
import time
import threading
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor, as_completed
from contextlib import asynccontextmanager
from dataclasses import dataclass, field
from enum import Enum
import traceback
import networkx as nx
from collections import defaultdict, deque

# FastAPI and Database imports
from fastapi import HTTPException, BackgroundTasks
from sqlalchemy import select, update, delete, and_, or_, func, text, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload
from sqlmodel import Session

# AI/ML imports
import numpy as np
from sklearn.cluster import KMeans, DBSCAN
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.metrics.pairwise import cosine_similarity
import torch
from transformers import AutoTokenizer, AutoModel
import spacy

# Graph analysis imports
import networkx as nx
from networkx.algorithms import centrality, community

# Core application imports
from ..models.advanced_catalog_models import (
    IntelligentDataAsset, EnterpriseDataLineage, DataQualityAssessment,
    BusinessGlossaryTerm, BusinessGlossaryAssociation, AssetUsageMetrics,
    DataProfilingResult, AssetType, AssetStatus, DataQuality, LineageDirection,
    LineageType, DiscoveryMethod, AssetCriticality, DataSensitivity,
    UsageFrequency, IntelligentAssetResponse, AssetCreateRequest,
    AssetUpdateRequest, AssetSearchRequest, LineageResponse,
    QualityAssessmentResponse, BusinessGlossaryResponse, AssetDiscoveryEvent,
    LineageGraph, CatalogAnalytics
)
from ..models.scan_models import DataSource, ScanResult
from ..db_session import get_session
from ..core.config import settings
from ..core.monitoring import MetricsCollector, AlertManager
from ..api.security.rbac import get_current_user
from ..utils.cache import get_cache
# Monitoring imports - using logging for now
from ..core.logging_config import get_logger

# Integration imports
from .data_source_service import DataSourceService
from .classification_service import ClassificationService
from .compliance_service import ComplianceService
from .enterprise_scan_rule_service import EnterpriseIntelligentRuleEngine

# Configure logging
logger = logging.getLogger(__name__)


# ===================== CONFIGURATION AND CONSTANTS =====================

@dataclass
class EnterpriseCatalogConfig:
    """Configuration for the enterprise catalog service"""
    max_concurrent_discoveries: int = 20
    discovery_timeout_seconds: int = 600
    ai_model_path: str = "/models/catalog_intelligence"
    lineage_cache_ttl: int = 7200  # 2 hours
    quality_assessment_interval: int = 86400  # 24 hours
    profiling_sample_size: int = 10000
    max_retry_attempts: int = 3
    resource_pool_size: int = 15
    monitoring_interval: int = 30  # seconds
    lineage_max_depth: int = 10
    semantic_similarity_threshold: float = 0.75
    quality_alert_threshold: float = 0.7
    business_value_threshold: float = 6.0


class CatalogEngineStatus(str, Enum):
    """Status of the catalog engine"""
    INITIALIZING = "initializing"
    RUNNING = "running"
    DISCOVERING = "discovering"
    ANALYZING = "analyzing"
    MAINTENANCE = "maintenance"
    ERROR = "error"
    SHUTDOWN = "shutdown"


class DiscoveryTrigger(str, Enum):
    """Triggers for asset discovery"""
    SCHEDULED = "scheduled"
    DATA_SOURCE_CHANGE = "data_source_change"
    MANUAL = "manual"
    API_REQUEST = "api_request"
    SCAN_RESULT = "scan_result"
    ML_RECOMMENDATION = "ml_recommendation"


# ===================== ENTERPRISE INTELLIGENT CATALOG SERVICE =====================

class EnterpriseIntelligentCatalogService:
    """
    Advanced enterprise catalog service with AI/ML capabilities, intelligent discovery,
    and comprehensive integration with all data governance systems.
    
    This service serves as the central intelligence hub for data asset management,
    providing automated discovery, intelligent classification, quality monitoring,
    and advanced analytics with enterprise-grade reliability and performance.
    """
    
    def __init__(self):
        self.config = EnterpriseCatalogConfig()
        self.status = CatalogEngineStatus.INITIALIZING
        # Use in-process async cache to avoid external dependency during startup
        try:
            from ..core.cache import RedisCache
            self.cache = RedisCache()
        except Exception:
            # Fallback minimal async cache
            class _FallbackCache:
                async def get(self, key, default=None):
                    return default
                async def set(self, key, value, ttl=None):
                    return True
                async def delete(self, key):
                    return True
            self.cache = _FallbackCache()
        self.metrics = MetricsCollector()
        self.alerts = AlertManager()
        self.logger = logger
        
        # AI/ML Components
        self.nlp_model = None
        self.embedding_model = None
        self.clustering_model = None
        self.quality_predictor = None
        self.anomaly_detector = None
        self.semantic_vectorizer = None
        
        # Graph Analysis Components
        self.lineage_graph = nx.DiGraph()
        self.graph_analytics = {}
        
        # Resource Management
        self.thread_pool = ThreadPoolExecutor(max_workers=self.config.max_concurrent_discoveries)
        self.process_pool = ProcessPoolExecutor(max_workers=self.config.resource_pool_size)
        self.discovery_semaphore = asyncio.Semaphore(self.config.max_concurrent_discoveries)
        
        # Performance Tracking
        self.discovery_metrics = {}
        self.quality_metrics = {}
        self.lineage_metrics = {}
        self.usage_analytics = {}
        
        # Integration Services
        self.data_source_service = None
        self.classification_service = None
        self.compliance_service = None
        self.scan_rule_engine = None
        
        # Background Tasks
        self.discovery_task = None
        self.quality_monitoring_task = None
        self.lineage_analysis_task = None
        self.analytics_task = None
        
        # Synchronization
        self._lock = threading.RLock()
        self._shutdown_event = threading.Event()


    async def initialize(self) -> None:
        """
        Initialize the enterprise catalog service with all required components,
        AI models, and integration services.
        """
        try:
            self.logger.info("Initializing Enterprise Intelligent Catalog Service")
            start_time = time.time()
            
            # Initialize AI/ML components
            await self._initialize_ai_models()
            
            # Initialize integration services
            await self._initialize_integration_services()
            
            # Load existing assets and lineage
            await self._load_existing_catalog()
            
            # Initialize graph analytics
            await self._initialize_graph_analytics()
            
            # Start background tasks
            try:
                await self._start_background_tasks()
            except RuntimeError:
                pass
            
            # Set status to running
            self.status = CatalogEngineStatus.RUNNING
            
            initialization_time = time.time() - start_time
            self.logger.info(
                "Enterprise Catalog Service initialized successfully",
                extra={
                    "initialization_time": initialization_time,
                    "status": self.status.value,
                    "loaded_assets": len(self.discovery_metrics),
                    "lineage_nodes": self.lineage_graph.number_of_nodes(),
                    "lineage_edges": self.lineage_graph.number_of_edges()
                }
            )
            
            # Record initialization metrics
            await self.metrics.record_gauge(
                "catalog_engine_initialization_time", 
                initialization_time
            )
            await self.metrics.increment_counter("catalog_engine_initializations")
            
        except Exception as e:
            self.status = CatalogEngineStatus.ERROR
            self.logger.error(
                "Failed to initialize Enterprise Catalog Service",
                extra={"error": str(e), "traceback": traceback.format_exc()}
            )
            raise HTTPException(
                status_code=500,
                detail=f"Catalog service initialization failed: {str(e)}"
            )


    async def perform_impact_analysis(
        self,
        lineage_graph: "LineageGraph",
        change_type: str,
        include_business_impact: bool,
        session: AsyncSession,
        user_id: str
    ) -> Dict[str, Any]:
        """Compute and persist a DB-backed impact analysis for a change across lineage."""
        start_time = time.time()
        try:
            affected_assets: List[int] = []
            edges: List[Tuple[int, int]] = []
            
            # Extract nodes/edges from lineage graph
            nodes = lineage_graph.nodes if hasattr(lineage_graph, 'nodes') else lineage_graph.get('nodes', [])
            rels = lineage_graph.edges if hasattr(lineage_graph, 'edges') else lineage_graph.get('edges', [])
            
            # Build comprehensive graph for analysis
            node_ids = [n.get('id') if isinstance(n, dict) else getattr(n, 'id', None) for n in nodes]
            node_metadata = {}
            
            for n in nodes:
                if isinstance(n, dict):
                    node_id = n.get('id')
                    if node_id:
                        node_metadata[node_id] = n
                else:
                    node_id = getattr(n, 'id', None)
                    if node_id:
                        node_metadata[node_id] = {
                            'id': node_id,
                            'name': getattr(n, 'name', str(node_id)),
                            'type': getattr(n, 'type', 'unknown'),
                            'criticality': getattr(n, 'criticality', 'medium')
                        }
            
            # Build directed graph for traversal
            g = nx.DiGraph()
            g.add_nodes_from([n for n in node_ids if n is not None])
            
            for r in rels:
                src = r.get('source') if isinstance(r, dict) else getattr(r, 'source', None)
                tgt = r.get('target') if isinstance(r, dict) else getattr(r, 'target', None)
                if src is not None and tgt is not None:
                    edges.append((src, tgt))
                    g.add_edge(src, tgt)
            
            # Find all affected assets through BFS traversal
            start_nodes = [n for n in g.nodes if g.in_degree(n) == 0]
            visited: Set[int] = set()
            
            for start in start_nodes:
                for _, tgt in nx.edge_bfs(g, start):
                    if tgt not in visited:
                        visited.add(tgt)
                        affected_assets.append(tgt)
            
            # Critical path analysis using alternative approach
            critical_path_assets = []
            if len(g.nodes) > 1:
                try:
                    # Find critical path using highest in-degree nodes and path analysis
                    # Sort nodes by in-degree (most dependent nodes first)
                    sorted_nodes = sorted(g.nodes, key=lambda x: g.in_degree(x), reverse=True)
                    
                    # Find the longest path from any start node to any end node
                    start_nodes = [n for n in g.nodes if g.in_degree(n) == 0]
                    end_nodes = [n for n in g.nodes if g.out_degree(n) == 0]
                    
                    if start_nodes and end_nodes:
                        max_path_length = 0
                        critical_path = []
                        
                        for start in start_nodes[:3]:  # Check top 3 start nodes
                            for end in end_nodes[:3]:  # Check top 3 end nodes
                                try:
                                    if nx.has_path(g, start, end):
                                        path = nx.shortest_path(g, start, end)
                                        if len(path) > max_path_length:
                                            max_path_length = len(path)
                                            critical_path = path
                                except Exception:
                                    continue
                        
                        if critical_path:
                            critical_path_assets = [str(asset_id) for asset_id in critical_path]
                        else:
                            # Fallback to nodes with highest in-degree as critical
                            critical_path_assets = [str(n) for n in sorted_nodes[:3]]
                    else:
                        # Fallback to nodes with highest in-degree as critical
                        critical_path_assets = [str(n) for n in sorted_nodes[:3]]
                        
                except Exception:
                    # Fallback to nodes with highest in-degree as critical
                    critical_path_assets = [str(n) for n in sorted(g.nodes, key=lambda x: g.in_degree(x), reverse=True)[:3]]
            
            # Aggregate comprehensive metrics from database
            quality_scores: List[float] = []
            usage_scores: List[float] = []
            sensitivity_flags: List[bool] = []
            business_terms: Set[str] = set()
            criticality_scores: List[float] = []
            
            try:
                from ..models.advanced_catalog_models import (
                    DataQualityAssessment, DataProfilingResult, AssetUsageMetrics, BusinessGlossaryAssociation
                )
                from ..models.catalog_intelligence_models import ImpactAnalysisSnapshot
            except Exception:
                DataQualityAssessment = None  # type: ignore
                DataProfilingResult = None  # type: ignore
                AssetUsageMetrics = None  # type: ignore
                BusinessGlossaryAssociation = None  # type: ignore
                ImpactAnalysisSnapshot = None  # type: ignore

            if affected_assets and (DataQualityAssessment or AssetUsageMetrics):
                # Quality assessment aggregation
                if DataQualityAssessment:
                    result = await session.execute(
                        select(DataQualityAssessment).where(DataQualityAssessment.asset_id.in_(affected_assets))
                    )
                    for row in result.scalars().all():
                        score = getattr(row, 'overall_score', None)
                        if score is not None:
                            quality_scores.append(float(score))
                
                # Usage metrics aggregation
                if AssetUsageMetrics:
                    result = await session.execute(
                        select(AssetUsageMetrics).where(AssetUsageMetrics.asset_id.in_(affected_assets))
                    )
                    for row in result.scalars().all():
                        access_count = getattr(row, 'access_count', 0) or 0
                        usage_scores.append(float(access_count))
                
                # Data profiling and sensitivity
                if DataProfilingResult:
                    result = await session.execute(
                        select(DataProfilingResult).where(DataProfilingResult.asset_id.in_(affected_assets))
                    )
                    for row in result.scalars().all():
                        sensitivity_flags.append(bool(getattr(row, 'sensitive_data_detected', False)))
                
                # Business glossary associations
                if include_business_impact and BusinessGlossaryAssociation:
                    result = await session.execute(
                        select(BusinessGlossaryAssociation).where(BusinessGlossaryAssociation.asset_id.in_(affected_assets))
                    )
                    for row in result.scalars().all():
                        term = getattr(row, 'term_key', None) or getattr(row, 'term_name', None)
                        if term:
                            business_terms.add(str(term))
                
                # Criticality assessment from node metadata
                for asset_id in affected_assets:
                    metadata = node_metadata.get(asset_id, {})
                    criticality = metadata.get('criticality', 'medium')
                    criticality_map = {'low': 0.3, 'medium': 0.6, 'high': 0.8, 'critical': 1.0}
                    criticality_scores.append(criticality_map.get(criticality, 0.6))

            # Calculate comprehensive impact metrics
            def avg(vals: List[float]) -> float:
                return float(sum(vals) / len(vals)) if vals else 0.0
            
            def safe_ratio(numerator: float, denominator: float) -> float:
                return numerator / max(denominator, 1.0)
            
            quality_impact = 1.0 - avg(quality_scores) if quality_scores else 0.0
            usage_impact = avg(usage_scores) if usage_scores else 0.0
            sensitivity_impact = (sum(1 for f in sensitivity_flags if f) / max(1, len(sensitivity_flags))) if sensitivity_flags else 0.0
            criticality_impact = avg(criticality_scores) if criticality_scores else 0.6
            
            # Advanced change type weighting with business context
            change_weights = {
                "schema_change": 1.0,
                "data_change": 0.7, 
                "deprecation": 1.2,
                "performance_tuning": 0.5,
                "access_restriction": 1.1,
                "quality_degradation": 1.3,
                "location_change": 0.8,
                "deletion": 1.5
            }
            
            # Multi-dimensional impact scoring
            base_impact = change_weights.get(change_type, 0.8)
            total_impact_score = base_impact * (
                0.35 * quality_impact + 
                0.25 * sensitivity_impact + 
                0.20 * criticality_impact + 
                0.20 * safe_ratio(usage_impact, max(usage_impact, 1.0))
            )
            
            # Risk level assessment
            risk_level = "low"
            if total_impact_score > 0.8:
                risk_level = "critical"
            elif total_impact_score > 0.6:
                risk_level = "high"
            elif total_impact_score > 0.4:
                risk_level = "medium"
            
            # Confidence scoring based on data availability
            confidence_factors = [
                1.0 if quality_scores else 0.5,
                1.0 if usage_scores else 0.5,
                1.0 if sensitivity_flags else 0.5,
                1.0 if business_terms else 0.5
            ]
            confidence_score = avg(confidence_factors)
            
            analysis_duration_ms = int((time.time() - start_time) * 1000)
            
            # Comprehensive analysis result
            analysis = {
                "affected_assets": affected_assets,
                "affected_assets_count": len(affected_assets),
                "quality_impact": round(quality_impact, 4),
                "sensitivity_impact": round(sensitivity_impact, 4),
                "usage_signal": round(usage_impact, 4),
                "criticality_impact": round(criticality_impact, 4),
                "business_terms": sorted(business_terms),
                "critical_path_assets": critical_path_assets,
                "change_type": change_type,
                "total_impact_score": round(total_impact_score, 4),
                "risk_level": risk_level,
                "confidence_score": round(confidence_score, 4),
                "analysis_depth": len(affected_assets),
                "analysis_duration_ms": analysis_duration_ms,
                "analysis_generated_at": datetime.utcnow().isoformat(),
                "lineage_graph_summary": {
                    "total_nodes": len(g.nodes),
                    "total_edges": len(g.edges),
                    "start_nodes": len(start_nodes),
                    "max_depth": max([len(nx.shortest_path(g, start, target)) for start in start_nodes for target in g.nodes if nx.has_path(g, start, target)], default=0)
                }
            }

            # Persist comprehensive snapshot using the new model
            if ImpactAnalysisSnapshot:
                try:
                    snapshot = ImpactAnalysisSnapshot(
                        snapshot_id=str(uuid.uuid4()),
                        user_id=str(user_id),
                        change_type=change_type,
                        analysis_data=analysis,
                        affected_assets=len(affected_assets),
                        total_impact_score=total_impact_score,
                        quality_impact=quality_impact,
                        sensitivity_impact=sensitivity_impact,
                        usage_signal=usage_impact,
                        business_terms=sorted(business_terms),
                        critical_path_assets=critical_path_assets,
                        risk_level=risk_level,
                        analysis_depth=len(affected_assets),
                        confidence_score=confidence_score,
                        analysis_duration_ms=analysis_duration_ms,
                        created_at=datetime.utcnow(),
                        expires_at=datetime.utcnow() + timedelta(days=90),  # 90-day retention
                        tags=[change_type, risk_level, f"depth_{len(affected_assets)}"],
                        custom_properties={
                            "lineage_graph_summary": analysis["lineage_graph_summary"],
                            "change_weights": change_weights,
                            "confidence_factors": confidence_factors
                        }
                    )
                    session.add(snapshot)
                    await session.commit()
                    
                    # Log successful persistence
                    self.logger.info(
                        "Impact analysis snapshot persisted successfully",
                        extra={
                            "snapshot_id": snapshot.snapshot_id,
                            "affected_assets": len(affected_assets),
                            "impact_score": total_impact_score,
                            "risk_level": risk_level
                        }
                    )
                    
                except Exception as e:
                    await session.rollback()
                    self.logger.warning(
                        "Failed to persist impact analysis snapshot",
                        extra={"error": str(e), "analysis": analysis}
                    )

            return analysis
            
        except HTTPException:
            raise
        except Exception as e:
            self.logger.error("Impact analysis error", extra={"error": str(e), "traceback": traceback.format_exc()})
            raise HTTPException(status_code=500, detail=f"Impact analysis error: {str(e)}")

    async def discover_assets_intelligent(
        self,
        data_source_id: int,
        discovery_config: Dict[str, Any],
        session: AsyncSession,
        user_id: str,
        trigger: DiscoveryTrigger = DiscoveryTrigger.MANUAL
    ) -> Dict[str, Any]:
        """
        Perform intelligent asset discovery with AI-powered metadata extraction,
        pattern recognition, and automatic classification.
        """
        async with self.discovery_semaphore:
            try:
                discovery_id = f"discovery_{uuid.uuid4().hex[:12]}"
                start_time = time.time()
                
                self.logger.info(
                    "Starting intelligent asset discovery",
                    extra={
                        "discovery_id": discovery_id,
                        "data_source_id": data_source_id,
                        "trigger": trigger.value,
                        "user_id": user_id
                    }
                )
                
                # Load data source details
                data_source = await self._load_data_source(data_source_id, session)
                if not data_source:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Data source with ID {data_source_id} not found"
                    )
                
                # Initialize discovery context
                discovery_context = {
                    "discovery_id": discovery_id,
                    "data_source": data_source,
                    "config": discovery_config,
                    "start_time": start_time,
                    "discovered_assets": [],
                    "enhanced_assets": [],
                    "lineage_discovered": [],
                    "quality_assessments": [],
                    "errors": [],
                    "warnings": [],
                    "metrics": {
                        "assets_discovered": 0,
                        "assets_enhanced": 0,
                        "lineage_relationships": 0,
                        "quality_checks_performed": 0,
                        "ai_confidence_avg": 0.0
                    }
                }
                
                # Perform multi-stage discovery
                await self._discover_schema_metadata(discovery_context, session)
                await self._enhance_with_ai_analysis(discovery_context, session)
                await self._detect_lineage_relationships(discovery_context, session)
                await self._perform_quality_assessment(discovery_context, session)
                await self._enrich_business_context(discovery_context, session)
                
                # Process discovered assets
                processed_assets = await self._process_discovered_assets(
                    discovery_context,
                    session
                )
                
                # Generate discovery insights
                discovery_insights = await self._generate_discovery_insights(
                    discovery_context,
                    processed_assets
                )
                
                # Update metrics and analytics
                await self._update_discovery_metrics(discovery_context)
                
                discovery_time = time.time() - start_time
                
                # Final results
                discovery_results = {
                    "discovery_id": discovery_id,
                    "status": "completed",
                    "data_source_id": data_source_id,
                    "trigger": trigger.value,
                    "discovery_time": discovery_time,
                    "metrics": discovery_context["metrics"],
                    "discovered_assets": processed_assets,
                    "lineage_relationships": discovery_context["lineage_discovered"],
                    "quality_assessments": discovery_context["quality_assessments"],
                    "insights": discovery_insights,
                    "errors": discovery_context["errors"],
                    "warnings": discovery_context["warnings"]
                }
                
                # Record comprehensive metrics
                await self.metrics.record_histogram(
                    "asset_discovery_duration",
                    discovery_time
                )
                await self.metrics.increment_counter(
                    "asset_discoveries_completed",
                    tags={
                        "data_source_type": data_source.source_type.value,
                        "trigger": trigger.value
                    }
                )
                
                self.logger.info(
                    "Intelligent asset discovery completed successfully",
                    extra={
                        "discovery_id": discovery_id,
                        "discovery_time": discovery_time,
                        "assets_discovered": discovery_context["metrics"]["assets_discovered"],
                        "lineage_relationships": discovery_context["metrics"]["lineage_relationships"],
                        "ai_confidence": discovery_context["metrics"]["ai_confidence_avg"]
                    }
                )
                
                return discovery_results
                
            except Exception as e:
                self.logger.error(
                    "Intelligent asset discovery failed",
                    extra={
                        "discovery_id": discovery_id,
                        "data_source_id": data_source_id,
                        "error": str(e),
                        "traceback": traceback.format_exc()
                    }
                )
                
                await self.metrics.increment_counter(
                    "asset_discovery_errors",
                    tags={"error_type": type(e).__name__}
                )
                
                raise HTTPException(
                    status_code=500,
                    detail=f"Asset discovery failed: {str(e)}"
                )


    async def build_comprehensive_lineage(
        self,
        asset_id: int,
        session: AsyncSession,
        user_id: str,
        direction: LineageDirection = LineageDirection.BIDIRECTIONAL,
        max_depth: int = None
    ) -> LineageGraph:
        """
        Build comprehensive lineage graph with AI-powered relationship detection,
        impact analysis, and graph analytics.
        """
        try:
            lineage_id = f"lineage_{uuid.uuid4().hex[:12]}"
            start_time = time.time()
            max_depth = max_depth or self.config.lineage_max_depth
            
            self.logger.info(
                "Building comprehensive lineage graph",
                extra={
                    "lineage_id": lineage_id,
                    "asset_id": asset_id,
                    "direction": direction.value,
                    "max_depth": max_depth,
                    "user_id": user_id
                }
            )
            
            # Load root asset
            root_asset = await self._load_asset_with_relationships(asset_id, session)
            if not root_asset:
                raise HTTPException(
                    status_code=404,
                    detail=f"Asset with ID {asset_id} not found"
                )
            
            # Initialize lineage graph
            lineage_graph = nx.DiGraph()
            visited_assets = set()
            lineage_context = {
                "lineage_id": lineage_id,
                "root_asset_id": asset_id,
                "direction": direction,
                "max_depth": max_depth,
                "graph": lineage_graph,
                "visited": visited_assets,
                "assets_metadata": {},
                "relationship_strength": {},
                "transformation_logic": {},
                "business_impact": {},
                "critical_paths": [],
                "metrics": {
                    "nodes_discovered": 0,
                    "edges_discovered": 0,
                    "ai_relationships": 0,
                    "manual_relationships": 0,
                    "confidence_avg": 0.0
                }
            }
            
            # Build lineage graph recursively
            await self._build_lineage_recursive(
                asset_id,
                0,
                lineage_context,
                session
            )
            
            # Enhance with AI-detected relationships
            await self._enhance_lineage_with_ai(lineage_context, session)
            
            # Perform graph analytics
            graph_analytics = await self._analyze_lineage_graph(lineage_context)
            
            # Identify critical paths and impact analysis
            critical_paths = await self._identify_critical_paths(lineage_context)
            impact_analysis = await self._perform_impact_analysis(lineage_context)
            
            # Generate lineage insights
            lineage_insights = await self._generate_lineage_insights(
                lineage_context,
                graph_analytics,
                critical_paths,
                impact_analysis
            )
            
            # Convert to response format
            nodes = []
            edges = []
            
            for node_id in lineage_context["graph"].nodes():
                node_data = lineage_context["assets_metadata"][node_id]
                nodes.append({
                    "id": node_id,
                    "qualified_name": node_data["qualified_name"],
                    "display_name": node_data["display_name"],
                    "asset_type": node_data["asset_type"],
                    "business_criticality": node_data.get("business_criticality", "medium"),
                    "quality_score": node_data.get("quality_score", 0.0),
                    "centrality_score": graph_analytics["centrality_scores"].get(node_id, 0.0),
                    "is_critical_path": node_id in [node for path in critical_paths for node in path]
                })
            
            for source, target, edge_data in lineage_context["graph"].edges(data=True):
                edges.append({
                    "source": source,
                    "target": target,
                    "lineage_type": edge_data.get("lineage_type", "unknown"),
                    "confidence_score": edge_data.get("confidence_score", 0.0),
                    "transformation_logic": edge_data.get("transformation_logic"),
                    "business_impact": edge_data.get("business_impact", "medium")
                })
            
            lineage_time = time.time() - start_time
            
            # Create LineageGraph response
            lineage_result = LineageGraph(
                graph_id=lineage_id,
                root_asset_id=asset_id,
                direction=direction,
                max_depth=max_depth,
                nodes=nodes,
                edges=edges,
                graph_metrics=graph_analytics["graph_metrics"],
                critical_paths=critical_paths,
                bottlenecks=graph_analytics["bottlenecks"],
                impact_analysis=impact_analysis,
                complexity_score=graph_analytics["complexity_score"]
            )
            
            # Record lineage metrics
            await self.metrics.record_histogram(
                "lineage_build_duration",
                lineage_time
            )
            await self.metrics.increment_counter(
                "lineage_graphs_built",
                tags={
                    "direction": direction.value,
                    "depth": str(max_depth)
                }
            )
            
            self.logger.info(
                "Comprehensive lineage graph built successfully",
                extra={
                    "lineage_id": lineage_id,
                    "asset_id": asset_id,
                    "lineage_time": lineage_time,
                    "nodes": len(nodes),
                    "edges": len(edges),
                    "critical_paths": len(critical_paths),
                    "complexity_score": graph_analytics["complexity_score"]
                }
            )
            
            return lineage_result
            
        except Exception as e:
            self.logger.error(
                "Failed to build comprehensive lineage",
                extra={
                    "asset_id": asset_id,
                    "error": str(e),
                    "traceback": traceback.format_exc()
                }
            )
            
            await self.metrics.increment_counter(
                "lineage_build_errors",
                tags={"error_type": type(e).__name__}
            )
            
            raise HTTPException(
                status_code=500,
                detail=f"Failed to build lineage graph: {str(e)}"
            )


    async def semantic_search(
        self,
        search_request: AssetSearchRequest,
        session: AsyncSession,
        user_id: str,
        enable_ai_ranking: bool = True
    ) -> List[IntelligentAssetResponse]:
        """
        Perform semantic search across data assets with AI-powered ranking,
        contextual understanding, and personalized recommendations.
        """
        try:
            search_id = f"search_{uuid.uuid4().hex[:12]}"
            start_time = time.time()
            
            self.logger.info(
                "Performing semantic search",
                extra={
                    "search_id": search_id,
                    "query": search_request.query,
                    "user_id": user_id,
                    "ai_ranking": enable_ai_ranking
                }
            )
            
            # Build base query
            query = select(IntelligentDataAsset).options(
                selectinload(IntelligentDataAsset.quality_assessments),
                selectinload(IntelligentDataAsset.usage_metrics),
                selectinload(IntelligentDataAsset.business_glossary_terms)
            )
            
            # Apply filters
            query = await self._apply_search_filters(query, search_request)
            
            # Execute base query
            result = await session.execute(query)
            assets = result.scalars().all()
            
            # Perform semantic ranking if query provided and AI enabled
            if search_request.query and enable_ai_ranking and self.semantic_vectorizer:
                assets = await self._perform_semantic_ranking(
                    assets,
                    search_request.query,
                    user_id
                )
            
            # Apply personalized recommendations
            if enable_ai_ranking:
                assets = await self._apply_personalized_recommendations(
                    assets,
                    user_id,
                    session
                )
            
            # Convert to response models
            response_assets = []
            for asset in assets:
                response_assets.append(IntelligentAssetResponse.from_orm(asset))
            
            search_time = time.time() - start_time
            
            # Record search metrics
            await self.metrics.record_histogram(
                "semantic_search_duration",
                search_time
            )
            await self.metrics.increment_counter(
                "semantic_searches",
                tags={
                    "has_query": str(bool(search_request.query)),
                    "ai_ranking": str(enable_ai_ranking)
                }
            )
            
            self.logger.info(
                "Semantic search completed successfully",
                extra={
                    "search_id": search_id,
                    "search_time": search_time,
                    "results_count": len(response_assets),
                    "query_length": len(search_request.query) if search_request.query else 0
                }
            )
            
            return response_assets
            
        except Exception as e:
            self.logger.error(
                "Semantic search failed",
                extra={
                    "search_request": search_request.dict(),
                    "error": str(e),
                    "traceback": traceback.format_exc()
                }
            )
            
            await self.metrics.increment_counter(
                "semantic_search_errors",
                tags={"error_type": type(e).__name__}
            )
            
            raise HTTPException(
                status_code=500,
                detail=f"Semantic search failed: {str(e)}"
            )


    # ===================== AI/ML ANALYSIS METHODS =====================

    async def _initialize_ai_models(self) -> None:
        """Initialize AI/ML models for catalog intelligence."""
        try:
            self.logger.info("Initializing AI/ML models for catalog intelligence")
            
            # Load NLP model for semantic understanding
            self.nlp_model = spacy.load("en_core_web_sm")
            
            # Initialize text vectorizer for semantic search
            self.semantic_vectorizer = TfidfVectorizer(
                max_features=10000,
                ngram_range=(1, 3),
                stop_words='english'
            )
            
            # Initialize clustering model for asset grouping
            self.clustering_model = KMeans(n_clusters=20, random_state=42)
            
            # Initialize quality predictor
            self.quality_predictor = RandomForestRegressor(
                n_estimators=100,
                random_state=42
            )
            
            # Initialize anomaly detector for data profiling
            self.anomaly_detector = IsolationForest(
                contamination=0.1,
                random_state=42
            )
            
            # Initialize transformer model for embeddings
            try:
                self.embedding_model = AutoModel.from_pretrained(
                    "sentence-transformers/all-MiniLM-L6-v2"
                )
                self.tokenizer = AutoTokenizer.from_pretrained(
                    "sentence-transformers/all-MiniLM-L6-v2"
                )
            except Exception as e:
                self.logger.warning(
                    "Could not load transformer model, using fallback",
                    extra={"error": str(e)}
                )
                self.embedding_model = None
                self.tokenizer = None
            
            self.logger.info("AI/ML models initialized successfully")
            
        except Exception as e:
            self.logger.error(
                "Failed to initialize AI/ML models",
                extra={"error": str(e)}
            )
            raise


    async def _enhance_with_ai_analysis(
        self,
        discovery_context: Dict[str, Any],
        session: AsyncSession
    ) -> None:
        """Enhance discovered assets with AI-powered analysis and classification."""
        try:
            for asset_data in discovery_context["discovered_assets"]:
                # Generate AI description
                ai_description = await self._generate_ai_description(asset_data)
                asset_data["ai_generated_description"] = ai_description
                
                # Extract semantic tags
                semantic_tags = await self._extract_semantic_tags(asset_data)
                asset_data["semantic_tags"] = semantic_tags
                
                # Calculate AI confidence score
                confidence_score = await self._calculate_ai_confidence(asset_data)
                asset_data["ai_confidence_score"] = confidence_score
                
                # Generate semantic embedding
                embedding = await self._generate_semantic_embedding(asset_data)
                asset_data["semantic_embedding"] = embedding
                
                # Predict business value
                business_value = await self._predict_business_value(asset_data)
                asset_data["business_value_score"] = business_value
                
                # Detect PII and sensitivity
                pii_results = await self._detect_pii_and_sensitivity(asset_data)
                asset_data.update(pii_results)
                
                discovery_context["metrics"]["assets_enhanced"] += 1
                
            # Update average AI confidence
            if discovery_context["discovered_assets"]:
                avg_confidence = sum(
                    asset["ai_confidence_score"] 
                    for asset in discovery_context["discovered_assets"]
                ) / len(discovery_context["discovered_assets"])
                discovery_context["metrics"]["ai_confidence_avg"] = avg_confidence
                
        except Exception as e:
            self.logger.error(
                "AI enhancement failed",
                extra={"error": str(e)}
            )
            discovery_context["errors"].append(f"AI enhancement error: {str(e)}")


    async def _generate_ai_description(self, asset_data: Dict[str, Any]) -> str:
        """Generate AI-powered description for the asset."""
        try:
            # Extract relevant information
            name = asset_data.get("display_name", "")
            columns = asset_data.get("columns_info", [])
            data_types = asset_data.get("data_types", [])
            
            # Build context
            context_parts = [name]
            if columns:
                column_names = [col.get("name", "") for col in columns[:10]]  # Limit to 10
                context_parts.append(f"Contains columns: {', '.join(column_names)}")
            
            if data_types:
                unique_types = list(set(data_types[:10]))  # Limit to 10 unique types
                context_parts.append(f"Data types: {', '.join(unique_types)}")
            
            context = ". ".join(context_parts)
            
            # Use NLP model for analysis
            if self.nlp_model:
                doc = self.nlp_model(context)
                entities = [ent.text for ent in doc.ents]
                
                # Generate description based on analysis
                if entities:
                    description = f"Data asset containing information related to {', '.join(entities[:3])}"
                else:
                    description = f"Data asset with {len(columns)} columns containing {', '.join(unique_types[:3]) if data_types else 'various'} data"
            else:
                # Fallback description
                description = f"Data asset containing {len(columns)} columns with various data types"
            
            return description
            
        except Exception as e:
            self.logger.error(f"Error generating AI description: {str(e)}")
            return "Data asset with automated discovery"


    async def _extract_semantic_tags(self, asset_data: Dict[str, Any]) -> List[str]:
        """Extract semantic tags using NLP analysis."""
        try:
            tags = []
            
            # Analyze name and description
            text_content = " ".join([
                asset_data.get("display_name", ""),
                asset_data.get("description", ""),
                asset_data.get("ai_generated_description", "")
            ])
            
            if self.nlp_model and text_content.strip():
                doc = self.nlp_model(text_content)
                
                # Extract entities as tags
                for ent in doc.ents:
                    if ent.label_ in ["ORG", "PERSON", "GPE", "PRODUCT", "EVENT"]:
                        tags.append(ent.text.lower())
                
                # Extract key nouns
                for token in doc:
                    if token.pos_ == "NOUN" and len(token.text) > 3:
                        tags.append(token.text.lower())
            
            # Analyze column names for domain-specific tags
            columns = asset_data.get("columns_info", [])
            for column in columns:
                column_name = column.get("name", "").lower()
                
                # Common business domain patterns
                if any(pattern in column_name for pattern in ["customer", "client", "user"]):
                    tags.append("customer_data")
                elif any(pattern in column_name for pattern in ["order", "purchase", "transaction"]):
                    tags.append("transaction_data")
                elif any(pattern in column_name for pattern in ["product", "item", "inventory"]):
                    tags.append("product_data")
                elif any(pattern in column_name for pattern in ["employee", "staff", "hr"]):
                    tags.append("employee_data")
                elif any(pattern in column_name for pattern in ["financial", "revenue", "cost", "price"]):
                    tags.append("financial_data")
            
            # Remove duplicates and limit
            return list(set(tags))[:10]
            
        except Exception as e:
            self.logger.error(f"Error extracting semantic tags: {str(e)}")
            return []


    # ===================== INTEGRATION METHODS =====================

    async def integrate_with_scan_results(
        self,
        scan_results: List[Dict[str, Any]],
        session: AsyncSession,
        user_id: str
    ) -> Dict[str, Any]:
        """
        Integrate scan results with catalog assets for enrichment and discovery.
        """
        try:
            integration_id = f"scan_integration_{uuid.uuid4().hex[:12]}"
            start_time = time.time()
            
            self.logger.info(
                "Integrating scan results with catalog",
                extra={
                    "integration_id": integration_id,
                    "scan_results_count": len(scan_results),
                    "user_id": user_id
                }
            )
            
            integration_results = {
                "integration_id": integration_id,
                "assets_discovered": 0,
                "assets_updated": 0,
                "assets_enriched": 0,
                "lineage_detected": 0,
                "quality_insights": [],
                "compliance_mappings": [],
                "errors": []
            }
            
            for scan_result in scan_results:
                try:
                    # Find or create corresponding asset
                    asset = await self._find_or_create_asset_from_scan(
                        scan_result,
                        session,
                        user_id
                    )
                    
                    if asset:
                        # Enrich asset with scan insights
                        await self._enrich_asset_with_scan_data(
                            asset,
                            scan_result,
                            session
                        )
                        
                        # Update classification results
                        if scan_result.get("classification_labels"):
                            asset.classification_results.update({
                                "scan_classification": scan_result["classification_labels"],
                                "confidence": scan_result.get("confidence", 0.0),
                                "updated_at": datetime.utcnow().isoformat()
                            })
                        
                        # Update compliance information
                        if scan_result.get("compliance_issues"):
                            compliance_mapping = {
                                "scan_compliance": scan_result["compliance_issues"],
                                "severity": scan_result.get("severity", "medium"),
                                "updated_at": datetime.utcnow().isoformat()
                            }
                            integration_results["compliance_mappings"].append(compliance_mapping)
                        
                        # Track quality insights
                        if scan_result.get("quality_metrics"):
                            quality_insight = {
                                "asset_id": asset.id,
                                "quality_metrics": scan_result["quality_metrics"],
                                "recommendations": scan_result.get("recommendations", [])
                            }
                            integration_results["quality_insights"].append(quality_insight)
                        
                        integration_results["assets_enriched"] += 1
                        await session.commit()
                        
                except Exception as e:
                    integration_results["errors"].append({
                        "scan_result": scan_result.get("id", "unknown"),
                        "error": str(e)
                    })
                    self.logger.error(
                        "Error processing scan result",
                        extra={"scan_result": scan_result, "error": str(e)}
                    )
            
            integration_time = time.time() - start_time
            integration_results["integration_time"] = integration_time
            
            # Record integration metrics
            await self.metrics.record_histogram(
                "scan_integration_duration",
                integration_time
            )
            await self.metrics.increment_counter(
                "scan_integrations_completed",
                tags={"user_id": user_id}
            )
            
            self.logger.info(
                "Scan results integration completed",
                extra={
                    "integration_id": integration_id,
                    "integration_time": integration_time,
                    "assets_enriched": integration_results["assets_enriched"],
                    "errors_count": len(integration_results["errors"])
                }
            )
            
            return integration_results
            
        except Exception as e:
            self.logger.error(
                "Scan results integration failed",
                extra={
                    "error": str(e),
                    "traceback": traceback.format_exc()
                }
            )
            raise


    async def integrate_with_compliance_requirements(
        self,
        asset_id: int,
        compliance_frameworks: List[str],
        session: AsyncSession,
        user_id: str
    ) -> Dict[str, Any]:
        """
        Integrate asset with compliance framework requirements for automated
        compliance monitoring and reporting.
        """
        try:
            if not self.compliance_service:
                self.compliance_service = ComplianceService()
            
            integration_results = {
                "compliance_mappings": {},
                "requirements_mapped": 0,
                "monitoring_rules": [],
                "reporting_config": {},
                "risk_assessment": {}
            }
            
            # Load asset
            asset = await self._load_asset_with_relationships(asset_id, session)
            if not asset:
                raise HTTPException(
                    status_code=404,
                    detail=f"Asset with ID {asset_id} not found"
                )
            
            for framework in compliance_frameworks:
                try:
                    # Get framework requirements
                    framework_details = await self.compliance_service.get_compliance_framework(
                        framework,
                        session
                    )
                    
                    if framework_details:
                        # Map asset to compliance requirements
                        compliance_mapping = await self._map_asset_to_compliance(
                            asset,
                            framework_details
                        )
                        
                        integration_results["compliance_mappings"][framework] = compliance_mapping
                        integration_results["requirements_mapped"] += len(
                            compliance_mapping.get("requirements", [])
                        )
                        
                        # Generate monitoring rules
                        monitoring_rules = await self._generate_compliance_monitoring_rules(
                            asset,
                            framework_details
                        )
                        
                        integration_results["monitoring_rules"].extend(monitoring_rules)
                        
                except Exception as e:
                    self.logger.error(
                        f"Error integrating with compliance framework {framework}",
                        extra={"error": str(e)}
                    )
            
            # Update asset compliance information
            asset.compliance_requirements.extend(compliance_frameworks)
            asset.compliance_score = await self._calculate_asset_compliance_score(
                integration_results
            )
            
            await session.commit()
            
            self.logger.info(
                "Compliance integration completed",
                extra={
                    "asset_id": asset_id,
                    "compliance_frameworks": compliance_frameworks,
                    "requirements_mapped": integration_results["requirements_mapped"]
                }
            )
            
            return integration_results
            
        except Exception as e:
            self.logger.error(
                "Compliance integration failed",
                extra={
                    "asset_id": asset_id,
                    "error": str(e),
                    "traceback": traceback.format_exc()
                }
            )
            raise


    async def integrate_with_classification_intelligence(
        self,
        asset_id: int,
        classification_config: Dict[str, Any],
        session: AsyncSession,
        user_id: str
    ) -> Dict[str, Any]:
        """
        Integrate asset with the advanced classification system to enhance
        automatic tagging and semantic understanding.
        """
        try:
            if not self.classification_service:
                self.classification_service = ClassificationService()
            
            integration_results = {
                "classification_mappings": {},
                "ai_enhancements": [],
                "semantic_enrichments": {},
                "confidence_scores": {}
            }
            
            # Load asset
            asset = await self._load_asset_with_relationships(asset_id, session)
            if not asset:
                raise HTTPException(
                    status_code=404,
                    detail=f"Asset with ID {asset_id} not found"
                )
            
            # Get available classification models
            classification_models = await self.classification_service.get_available_models(
                session
            )
            
            # Apply classification models to asset
            for model in classification_models:
                try:
                    # Apply classification model
                    classification_result = await self._apply_classification_model(
                        asset,
                        model,
                        classification_config
                    )
                    
                    if classification_result["confidence"] > classification_config.get(
                        "confidence_threshold", 0.85
                    ):
                        integration_results["classification_mappings"][model["id"]] = classification_result
                        integration_results["confidence_scores"][model["id"]] = classification_result["confidence"]
                        
                        # Apply AI enhancements
                        ai_enhancement = await self._generate_classification_enhancement(
                            asset,
                            classification_result
                        )
                        integration_results["ai_enhancements"].append(ai_enhancement)
                        
                except Exception as e:
                    self.logger.error(
                        f"Error applying classification model {model['id']}",
                        extra={"error": str(e)}
                    )
            
            # Update asset classification information
            asset.classification_results.update({
                "models": integration_results["classification_mappings"],
                "ai_enhancements": integration_results["ai_enhancements"],
                "last_updated": datetime.utcnow().isoformat()
            })
            
            # Update auto-classification confidence
            if integration_results["confidence_scores"]:
                asset.auto_classification_confidence = sum(
                    integration_results["confidence_scores"].values()
                ) / len(integration_results["confidence_scores"])
            
            await session.commit()
            
            self.logger.info(
                "Classification intelligence integration completed",
                extra={
                    "asset_id": asset_id,
                    "models_applied": len(integration_results["classification_mappings"]),
                    "avg_confidence": asset.auto_classification_confidence
                }
            )
            
            return integration_results
            
        except Exception as e:
            self.logger.error(
                "Classification intelligence integration failed",
                extra={
                    "asset_id": asset_id,
                    "error": str(e),
                    "traceback": traceback.format_exc()
                }
            )
            raise


    # ===================== ANALYTICS AND INSIGHTS METHODS =====================

    async def generate_catalog_analytics(
        self,
        analytics_config: Dict[str, Any],
        session: AsyncSession,
        user_id: str
    ) -> CatalogAnalytics:
        """
        Generate comprehensive catalog analytics with business insights,
        trends analysis, and recommendations.
        """
        try:
            analytics_id = f"analytics_{uuid.uuid4().hex[:12]}"
            start_time = time.time()
            
            self.logger.info(
                "Generating catalog analytics",
                extra={
                    "analytics_id": analytics_id,
                    "user_id": user_id,
                    "config": analytics_config
                }
            )
            
            # Collect basic metrics
            total_assets = await self._count_total_assets(session)
            assets_by_type = await self._count_assets_by_type(session)
            coverage_by_source = await self._calculate_coverage_by_source(session)
            quality_distribution = await self._analyze_quality_distribution(session)
            
            # Business value analysis
            business_metrics = await self._analyze_business_value(session)
            
            # Usage pattern analysis
            usage_analytics = await self._analyze_usage_patterns(session)
            
            # Quality insights
            quality_insights = await self._generate_quality_insights(session)
            
            # Compliance analysis
            compliance_metrics = await self._analyze_compliance_status(session)
            
            # Generate analytics result
            analytics_result = CatalogAnalytics(
                analytics_id=analytics_id,
                generated_at=datetime.utcnow(),
                
                # Coverage Metrics
                total_assets=total_assets,
                assets_by_type=assets_by_type,
                coverage_by_source=coverage_by_source,
                quality_distribution=quality_distribution,
                
                # Business Value
                high_value_assets=business_metrics["high_value_assets"],
                business_critical_assets=business_metrics["business_critical_assets"],
                total_business_value=business_metrics["total_business_value"],
                avg_business_value=business_metrics["avg_business_value"],
                
                # Usage Patterns
                most_accessed_assets=usage_analytics["most_accessed_assets"],
                usage_trends=usage_analytics["usage_trends"],
                user_engagement_metrics=usage_analytics["user_engagement_metrics"],
                
                # Quality Insights
                quality_trends=quality_insights["quality_trends"],
                common_issues=quality_insights["common_issues"],
                improvement_opportunities=quality_insights["improvement_opportunities"],
                
                # Compliance Status
                pii_asset_count=compliance_metrics["pii_asset_count"],
                compliance_coverage=compliance_metrics["compliance_coverage"],
                risk_assessment=compliance_metrics["risk_assessment"]
            )
            
            analytics_time = time.time() - start_time
            
            # Record analytics metrics
            await self.metrics.record_histogram(
                "catalog_analytics_generation_duration",
                analytics_time
            )
            await self.metrics.increment_counter(
                "catalog_analytics_generated",
                tags={"user_id": user_id}
            )
            
            self.logger.info(
                "Catalog analytics generated successfully",
                extra={
                    "analytics_id": analytics_id,
                    "analytics_time": analytics_time,
                    "total_assets": total_assets,
                    "high_value_assets": business_metrics["high_value_assets"]
                }
            )
            
            return analytics_result
            
        except Exception as e:
            self.logger.error(
                "Catalog analytics generation failed",
                extra={
                    "error": str(e),
                    "traceback": traceback.format_exc()
                }
            )
            
            await self.metrics.increment_counter(
                "catalog_analytics_errors",
                tags={"error_type": type(e).__name__}
            )
            
            raise HTTPException(
                status_code=500,
                detail=f"Catalog analytics generation failed: {str(e)}"
            )


    # ===================== BACKGROUND TASKS AND MONITORING =====================

    async def _start_background_tasks(self) -> None:
        """Start background monitoring and analytics tasks."""
        try:
            # Start asset discovery monitoring
            self.discovery_task = asyncio.create_task(
                self._discovery_monitoring_loop()
            )
            
            # Start quality monitoring
            self.quality_monitoring_task = asyncio.create_task(
                self._quality_monitoring_loop()
            )
            
            # Start lineage analysis
            self.lineage_analysis_task = asyncio.create_task(
                self._lineage_analysis_loop()
            )
            
            # Start analytics generation
            self.analytics_task = asyncio.create_task(
                self._analytics_generation_loop()
            )
            
            self.logger.info("Background tasks started successfully")
            
        except Exception as e:
            self.logger.error(
                "Error starting background tasks",
                extra={"error": str(e)}
            )
            raise


    async def _discovery_monitoring_loop(self) -> None:
        """Continuous monitoring for new assets and changes."""
        while not self._shutdown_event.is_set():
            try:
                # Monitor for data source changes
                await self._monitor_data_source_changes()
                
                # Check for automated discovery triggers
                await self._check_discovery_triggers()
                
                # Update discovery metrics
                await self._update_discovery_dashboards()
                
                # Wait for next monitoring cycle
                await asyncio.sleep(self.config.monitoring_interval)
                
            except Exception as e:
                self.logger.error(
                    "Error in discovery monitoring loop",
                    extra={"error": str(e)}
                )
                await asyncio.sleep(self.config.monitoring_interval)


    async def shutdown(self) -> None:
        """Gracefully shutdown the enterprise catalog service."""
        try:
            self.logger.info("Shutting down Enterprise Intelligent Catalog Service")
            self.status = CatalogEngineStatus.SHUTDOWN
            
            # Signal shutdown to background tasks
            self._shutdown_event.set()
            
            # Cancel background tasks
            if self.discovery_task:
                self.discovery_task.cancel()
            if self.quality_monitoring_task:
                self.quality_monitoring_task.cancel()
            if self.lineage_analysis_task:
                self.lineage_analysis_task.cancel()
            if self.analytics_task:
                self.analytics_task.cancel()
            
            # Shutdown thread pools
            self.thread_pool.shutdown(wait=True)
            self.process_pool.shutdown(wait=True)
            
            # Final metrics collection
            await self.metrics.flush()
            
            self.logger.info("Enterprise Catalog Service shutdown completed")
            
        except Exception as e:
            self.logger.error(
                "Error during shutdown",
                extra={"error": str(e)}
            )


# ===================== GLOBAL CATALOG SERVICE INSTANCE =====================

# Global instance of the enterprise catalog service
enterprise_catalog_service = None

async def get_enterprise_catalog_service() -> EnterpriseIntelligentCatalogService:
    """Get or create the global enterprise catalog service instance."""
    global enterprise_catalog_service
    
    if enterprise_catalog_service is None:
        enterprise_catalog_service = EnterpriseIntelligentCatalogService()
        await enterprise_catalog_service.initialize()
    
    return enterprise_catalog_service


# ===================== EXPORTS =====================

__all__ = [
    "EnterpriseIntelligentCatalogService",
    "EnterpriseCatalogConfig",
    "CatalogEngineStatus",
    "DiscoveryTrigger",
    "get_enterprise_catalog_service"
]