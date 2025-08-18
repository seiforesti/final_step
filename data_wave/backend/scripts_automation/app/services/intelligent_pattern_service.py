"""
Enterprise Intelligent Pattern Recognition Service
AI-powered pattern detection and analysis service for advanced scan rule optimization.
Provides machine learning-based pattern recognition, adaptive rule generation,
predictive scanning capabilities, and intelligent optimization recommendations.
"""

import asyncio
import json
import logging
import numpy as np
import pandas as pd
import re
import time
from collections import defaultdict, deque
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Set, Tuple, Union
from uuid import uuid4

import os
import spacy
from sklearn.cluster import DBSCAN, KMeans
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import silhouette_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from transformers import pipeline, AutoModel, AutoTokenizer

from ..core.cache_manager import EnterpriseCacheManager as CacheManager
from ..core.logging_config import get_logger
from ..core.config import settings
from ..models.advanced_scan_rule_models import (
    IntelligentScanRule, RuleExecutionHistory, RuleOptimizationJob,
    RulePatternLibrary, RulePatternAssociation, RulePerformanceBaseline,
    PatternRecognitionType
)
from ..services.ai_service import EnterpriseAIService as AIService

logger = get_logger(__name__)

class PatternRecognitionConfig:
    """Configuration for pattern recognition"""
    
    def __init__(self):
        self.min_pattern_confidence = 0.7
        self.max_patterns_per_analysis = 100
        self.clustering_min_samples = 5
        self.anomaly_detection_contamination = 0.1
        self.text_similarity_threshold = 0.8
        self.temporal_window_hours = 24
        self.min_frequency_threshold = 3
        self.pattern_decay_factor = 0.95
        self.learning_rate = 0.001
        self.batch_size = 32
        self.model_update_interval = 3600  # seconds

class IntelligentPatternService:
    """
    Enterprise-grade intelligent pattern recognition service providing:
    - AI-powered pattern detection
    - Machine learning-based classification
    - Adaptive rule optimization
    - Predictive scanning capabilities
    - Real-time pattern analysis
    """
    
    def __init__(self):
        self.settings = settings
        self.cache = CacheManager()
        self.ai_service = AIService()
        
        self.config = PatternRecognitionConfig()
        
        # Defer ML component initialization to prevent startup failures
        self.nlp = None
        self.clustering_model = None
        self.anomaly_detector = None
        self.text_vectorizer = None
        self.classifier = None
        self.semantic_model = None
        self.tokenizer = None
        self.sentiment_analyzer = None
        
        # Pattern storage and management
        self.known_patterns = {}
        self.pattern_hierarchy = defaultdict(set)
        self.pattern_performance = {}
        self.temporal_patterns = deque(maxlen=10000)
        
        # Learning and adaptation
        self.pattern_buffer = deque(maxlen=1000)
        self.feedback_buffer = deque(maxlen=500)
        self.model_versions = {}
        
        # Performance tracking
        self.metrics = {
            'patterns_detected': 0,
            'patterns_validated': 0,
            'false_positives': 0,
            'model_accuracy': 0.0,
            'processing_time_ms': 0.0,
            'cache_hit_rate': 0.0
        }
        
        # Threading
        self.executor = ThreadPoolExecutor(max_workers=8)
        
        # Background tasks (deferred until an event loop is running)
        self._background_tasks = []
        self._ml_components_initialized = False

    def start(self) -> None:
        """Start background tasks when an event loop is running."""
        if self._background_tasks:
            return
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            # No running loop at import time; caller should invoke start() from FastAPI startup
            return
        
        # Initialize ML components if not already done
        if not self._ml_components_initialized:
            self._init_ml_components()
            self._ml_components_initialized = True
        
        self._background_tasks.append(loop.create_task(self._pattern_learning_loop()))
        self._background_tasks.append(loop.create_task(self._model_update_loop()))

    async def stop(self) -> None:
        """Cancel background tasks gracefully."""
        tasks, self._background_tasks = self._background_tasks, []
        for t in tasks:
            try:
                t.cancel()
            except Exception:
                pass
    
    def _init_ml_components(self):
        """Initialize machine learning components"""
        try:
            lightweight = os.environ.get("LIGHTWEIGHT_STARTUP", "1") == "1"
            # Load spaCy model for NLP
            self.nlp = spacy.load("en_core_web_sm")
            
            # Initialize clustering models
            self.clustering_model = DBSCAN(
                eps=0.3,
                min_samples=self.config.clustering_min_samples
            )
            
            # Initialize anomaly detection
            self.anomaly_detector = IsolationForest(
                contamination=self.config.anomaly_detection_contamination,
                random_state=42
            )
            
            # Initialize text vectorizer
            self.text_vectorizer = TfidfVectorizer(
                max_features=1000,
                stop_words='english',
                ngram_range=(1, 3)
            )
            
            # Initialize classifier
            self.classifier = RandomForestClassifier(
                n_estimators=100,
                random_state=42,
                n_jobs=-1
            )
            
            # Initialize semantic model
            self.semantic_model = None
            try:
                from sentence_transformers import SentenceTransformer
                self.semantic_model = SentenceTransformer('all-MiniLM-L6-v2')
            except ImportError:
                logger.warning("Sentence transformers not available, using fallback")
            
            # Initialize tokenizer
            self.tokenizer = None
            try:
                from transformers import AutoTokenizer
                self.tokenizer = AutoTokenizer.from_pretrained('distilbert-base-uncased')
            except ImportError:
                logger.warning("Transformers not available, using fallback")
            
            # Initialize sentiment analyzer
            self.sentiment_analyzer = None
            try:
                from textblob import TextBlob
                self.sentiment_analyzer = TextBlob
            except ImportError:
                logger.warning("TextBlob not available, using fallback")
                
            logger.info("ML components initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize ML components: {e}")
            # Set fallback components
            self.nlp = None
            self.clustering_model = None
            self.anomaly_detector = None
            self.text_vectorizer = None
            self.classifier = None
            self.semantic_model = None
            self.tokenizer = None
            self.sentiment_analyzer = None
    
    def _ensure_ml_components(self):
        """Ensure ML components are initialized before use"""
        if not self._ml_components_initialized:
            self._init_ml_components()
            self._ml_components_initialized = True
    
    async def detect_patterns(
        self,
        data: List[Dict[str, Any]],
        pattern_types: Optional[List[PatternRecognitionType]] = None,
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Detect patterns in data using multiple ML approaches
        
        Args:
            data: Input data for pattern detection
            pattern_types: Types of patterns to detect
            options: Additional detection options
            
        Returns:
            Detected patterns with confidence scores and metadata
        """
        start_time = time.time()
        
        try:
            # Ensure ML components are initialized
            self._ensure_ml_components()
            
            # Validate input
            if not data:
                return {"patterns": [], "metadata": {"error": "No data provided"}}
            
            # Set default pattern types
            if pattern_types is None:
                pattern_types = [
                    PatternRecognitionType.GRAPH_BASED,
                    PatternRecognitionType.BEHAVIORAL,
                    PatternRecognitionType.AI_SEMANTIC,
                    PatternRecognitionType.TEMPORAL
                ]
            
            # Initialize results
            detected_patterns = []
            analysis_metadata = {
                "data_size": len(data),
                "pattern_types": [pt.value for pt in pattern_types],
                "detection_time": None,
                "confidence_distribution": {},
                "processing_stats": {}
            }
            
            # Parallel pattern detection
            detection_tasks = []
            
            for pattern_type in pattern_types:
                if pattern_type == PatternRecognitionType.GRAPH_BASED:
                    detection_tasks.append(
                        self._detect_structural_patterns(data, options)
                    )
                elif pattern_type == PatternRecognitionType.BEHAVIORAL:
                    detection_tasks.append(
                        self._detect_behavioral_patterns(data, options)
                    )
                elif pattern_type == PatternRecognitionType.AI_SEMANTIC:
                    detection_tasks.append(
                        self._detect_semantic_patterns(data, options)
                    )
                elif pattern_type == PatternRecognitionType.TEMPORAL:
                    detection_tasks.append(
                        self._detect_temporal_patterns(data, options)
                    )
                elif pattern_type == PatternRecognitionType.ANOMALY:
                    detection_tasks.append(
                        self._detect_anomaly_patterns(data, options)
                    )
            
            # Execute detection tasks
            pattern_results = await asyncio.gather(*detection_tasks, return_exceptions=True)
            
            # Consolidate results
            for i, result in enumerate(pattern_results):
                if isinstance(result, Exception):
                    logger.error(f"Pattern detection failed for {pattern_types[i]}: {result}")
                    continue
                
                if result and "patterns" in result:
                    detected_patterns.extend(result["patterns"])
                    
                    # Update metadata
                    pattern_type_name = pattern_types[i].value
                    analysis_metadata["processing_stats"][pattern_type_name] = result.get("metadata", {})
            
            # Post-process patterns
            processed_patterns = await self._post_process_patterns(detected_patterns, data)
            
            # Calculate confidence distribution
            confidences = [p.get("confidence", 0.0) for p in processed_patterns]
            if confidences:
                analysis_metadata["confidence_distribution"] = {
                    "mean": np.mean(confidences),
                    "std": np.std(confidences),
                    "min": np.min(confidences),
                    "max": np.max(confidences)
                }
            
            # Update metrics
            processing_time = (time.time() - start_time) * 1000
            analysis_metadata["detection_time"] = processing_time
            self.metrics["patterns_detected"] += len(processed_patterns)
            self.metrics["processing_time_ms"] = processing_time
            
            # Cache results if beneficial
            if len(processed_patterns) > 0:
                cache_key = f"patterns_{hash(str(data))}"
                await self.cache.set(cache_key, processed_patterns, ttl=3600)
            
            logger.info(f"Pattern detection completed: {len(processed_patterns)} patterns found")
            
            return {
                "patterns": processed_patterns,
                "metadata": analysis_metadata
            }
            
        except Exception as e:
            logger.error(f"Pattern detection failed: {e}")
            return {
                "patterns": [],
                "metadata": {"error": str(e), "detection_time": (time.time() - start_time) * 1000}
            }
    
    async def _detect_structural_patterns(
        self,
        data: List[Dict[str, Any]],
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Detect structural patterns in data"""
        
        try:
            patterns = []
            
            # Extract structural features
            structural_features = []
            for item in data:
                features = self._extract_structural_features(item)
                structural_features.append(features)
            
            if not structural_features:
                return {"patterns": patterns, "metadata": {"feature_count": 0}}
            
            # Convert to numpy array
            feature_matrix = np.array(structural_features)
            
            # Normalize features
            scaler = StandardScaler()
            normalized_features = scaler.fit_transform(feature_matrix)
            
            # Perform clustering
            clusters = self.clustering_model.fit_predict(normalized_features)
            
            # Analyze clusters
            unique_clusters = set(clusters)
            for cluster_id in unique_clusters:
                if cluster_id == -1:  # Noise points
                    continue
                
                cluster_indices = np.where(clusters == cluster_id)[0]
                if len(cluster_indices) < self.config.clustering_min_samples:
                    continue
                
                # Calculate cluster characteristics
                cluster_center = np.mean(normalized_features[cluster_indices], axis=0)
                cluster_variance = np.var(normalized_features[cluster_indices], axis=0)
                
                # Create pattern
                pattern = {
                    "pattern_id": str(uuid4()),
                    "type": "structural",
                    "subtype": "clustering",
                    "description": f"Structural cluster {cluster_id}",
                    "confidence": self._calculate_cluster_confidence(
                        normalized_features, cluster_indices, cluster_center
                    ),
                    "characteristics": {
                        "cluster_id": int(cluster_id),
                        "size": len(cluster_indices),
                        "center": cluster_center.tolist(),
                        "variance": cluster_variance.tolist(),
                        "member_indices": cluster_indices.tolist()
                    },
                    "metadata": {
                        "detection_method": "dbscan_clustering",
                        "feature_dimensions": len(cluster_center),
                        "silhouette_score": silhouette_score(
                            normalized_features, clusters
                        ) if len(unique_clusters) > 1 else 0.0
                    }
                }
                
                patterns.append(pattern)
            
            return {
                "patterns": patterns,
                "metadata": {
                    "feature_count": len(structural_features[0]) if structural_features else 0,
                    "cluster_count": len(unique_clusters) - (1 if -1 in unique_clusters else 0),
                    "noise_points": np.sum(clusters == -1)
                }
            }
            
        except Exception as e:
            logger.error(f"Structural pattern detection failed: {e}")
            return {"patterns": [], "metadata": {"error": str(e)}}
    
    async def _detect_behavioral_patterns(
        self,
        data: List[Dict[str, Any]],
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Detect behavioral patterns in data"""
        
        try:
            patterns = []
            
            # Extract behavioral sequences
            sequences = []
            for item in data:
                sequence = self._extract_behavioral_sequence(item)
                if sequence:
                    sequences.append(sequence)
            
            if not sequences:
                return {"patterns": patterns, "metadata": {"sequence_count": 0}}
            
            # Find frequent subsequences
            frequent_patterns = self._find_frequent_subsequences(sequences)
            
            # Analyze transition patterns
            transition_patterns = self._analyze_transitions(sequences)
            
            # Convert to pattern objects
            for i, (subsequence, frequency) in enumerate(frequent_patterns.items()):
                if frequency < self.config.min_frequency_threshold:
                    continue
                
                pattern = {
                    "pattern_id": str(uuid4()),
                    "type": "behavioral",
                    "subtype": "frequent_sequence",
                    "description": f"Frequent behavioral sequence: {subsequence}",
                    "confidence": min(frequency / len(sequences), 1.0),
                    "characteristics": {
                        "sequence": list(subsequence),
                        "frequency": frequency,
                        "relative_frequency": frequency / len(sequences),
                        "length": len(subsequence)
                    },
                    "metadata": {
                        "detection_method": "frequent_subsequence_mining",
                        "support": frequency / len(sequences),
                        "total_sequences": len(sequences)
                    }
                }
                
                patterns.append(pattern)
            
            # Add transition patterns
            for transition, prob in transition_patterns.items():
                if prob < 0.1:  # Skip low-probability transitions
                    continue
                
                pattern = {
                    "pattern_id": str(uuid4()),
                    "type": "behavioral",
                    "subtype": "transition",
                    "description": f"Behavioral transition: {transition[0]} -> {transition[1]}",
                    "confidence": prob,
                    "characteristics": {
                        "from_state": transition[0],
                        "to_state": transition[1],
                        "probability": prob,
                        "transition_type": "state_transition"
                    },
                    "metadata": {
                        "detection_method": "markov_chain_analysis",
                        "transition_strength": prob
                    }
                }
                
                patterns.append(pattern)
            
            return {
                "patterns": patterns,
                "metadata": {
                    "sequence_count": len(sequences),
                    "frequent_pattern_count": len(frequent_patterns),
                    "transition_count": len(transition_patterns)
                }
            }
            
        except Exception as e:
            logger.error(f"Behavioral pattern detection failed: {e}")
            return {"patterns": [], "metadata": {"error": str(e)}}
    
    async def _detect_semantic_patterns(
        self,
        data: List[Dict[str, Any]],
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Detect semantic patterns using NLP"""
        
        try:
            patterns = []
            
            # Extract text content
            texts = []
            text_metadata = []
            for item in data:
                text_content = self._extract_text_content(item)
                if text_content:
                    texts.append(text_content)
                    text_metadata.append(item)
            
            if not texts:
                return {"patterns": patterns, "metadata": {"text_count": 0}}
            
            # Vectorize texts
            text_vectors = self.text_vectorizer.fit_transform(texts)
            
            # Perform semantic clustering
            kmeans = KMeans(n_clusters=min(len(texts) // 5, 10), random_state=42)
            semantic_clusters = kmeans.fit_predict(text_vectors.toarray())
            
            # Analyze each cluster
            for cluster_id in set(semantic_clusters):
                cluster_indices = np.where(semantic_clusters == cluster_id)[0]
                if len(cluster_indices) < 2:
                    continue
                
                cluster_texts = [texts[i] for i in cluster_indices]
                
                # Extract common themes
                common_keywords = self._extract_common_keywords(cluster_texts)
                semantic_similarity = self._calculate_semantic_similarity(cluster_texts)
                
                # Sentiment analysis
                sentiments = []
                for text in cluster_texts[:10]:  # Limit for performance
                    sentiment = self.sentiment_analyzer(text[:512])  # Limit text length
                    sentiments.append(sentiment[0]['label'])
                
                dominant_sentiment = max(set(sentiments), key=sentiments.count) if sentiments else "NEUTRAL"
                
                pattern = {
                    "pattern_id": str(uuid4()),
                    "type": "semantic",
                    "subtype": "thematic_cluster",
                    "description": f"Semantic cluster with theme: {', '.join(common_keywords[:3])}",
                    "confidence": semantic_similarity,
                    "characteristics": {
                        "cluster_id": int(cluster_id),
                        "size": len(cluster_indices),
                        "common_keywords": common_keywords,
                        "dominant_sentiment": dominant_sentiment,
                        "semantic_similarity": semantic_similarity,
                        "member_indices": cluster_indices.tolist()
                    },
                    "metadata": {
                        "detection_method": "semantic_clustering",
                        "vectorization": "tfidf",
                        "clustering_algorithm": "kmeans",
                        "sentiment_distribution": dict(pd.Series(sentiments).value_counts()) if sentiments else {}
                    }
                }
                
                patterns.append(pattern)
            
            # Named entity patterns
            entity_patterns = await self._detect_entity_patterns(texts, text_metadata)
            patterns.extend(entity_patterns)
            
            return {
                "patterns": patterns,
                "metadata": {
                    "text_count": len(texts),
                    "semantic_cluster_count": len(set(semantic_clusters)),
                    "entity_pattern_count": len(entity_patterns)
                }
            }
            
        except Exception as e:
            logger.error(f"Semantic pattern detection failed: {e}")
            return {"patterns": [], "metadata": {"error": str(e)}}
    
    async def _detect_temporal_patterns(
        self,
        data: List[Dict[str, Any]],
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Detect temporal patterns in data"""
        
        try:
            patterns = []
            
            # Extract temporal data
            temporal_data = []
            for item in data:
                timestamp = self._extract_timestamp(item)
                if timestamp:
                    temporal_data.append({
                        "timestamp": timestamp,
                        "data": item
                    })
            
            if not temporal_data:
                return {"patterns": patterns, "metadata": {"temporal_entries": 0}}
            
            # Sort by timestamp
            temporal_data.sort(key=lambda x: x["timestamp"])
            
            # Detect periodic patterns
            periodic_patterns = self._detect_periodic_patterns(temporal_data)
            patterns.extend(periodic_patterns)
            
            # Detect trend patterns
            trend_patterns = self._detect_trend_patterns(temporal_data)
            patterns.extend(trend_patterns)
            
            # Detect burst patterns
            burst_patterns = self._detect_burst_patterns(temporal_data)
            patterns.extend(burst_patterns)
            
            return {
                "patterns": patterns,
                "metadata": {
                    "temporal_entries": len(temporal_data),
                    "time_span": (
                        temporal_data[-1]["timestamp"] - temporal_data[0]["timestamp"]
                    ).total_seconds() if len(temporal_data) > 1 else 0,
                    "periodic_patterns": len(periodic_patterns),
                    "trend_patterns": len(trend_patterns),
                    "burst_patterns": len(burst_patterns)
                }
            }
            
        except Exception as e:
            logger.error(f"Temporal pattern detection failed: {e}")
            return {"patterns": [], "metadata": {"error": str(e)}}
    
    async def _detect_anomaly_patterns(
        self,
        data: List[Dict[str, Any]],
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Detect anomalous patterns in data"""
        
        try:
            patterns = []
            
            # Extract numerical features
            numerical_features = []
            for item in data:
                features = self._extract_numerical_features(item)
                if features:
                    numerical_features.append(features)
            
            if not numerical_features:
                return {"patterns": patterns, "metadata": {"feature_count": 0}}
            
            # Convert to numpy array
            feature_matrix = np.array(numerical_features)
            
            # Normalize features
            scaler = StandardScaler()
            normalized_features = scaler.fit_transform(feature_matrix)
            
            # Detect anomalies
            anomaly_scores = self.anomaly_detector.fit_predict(normalized_features)
            
            # Find anomalous points
            anomaly_indices = np.where(anomaly_scores == -1)[0]
            
            if len(anomaly_indices) > 0:
                # Group nearby anomalies
                anomaly_groups = self._group_anomalies(anomaly_indices, normalized_features)
                
                for group_id, group_indices in anomaly_groups.items():
                    if len(group_indices) < 2:
                        continue
                    
                    # Calculate group characteristics
                    group_center = np.mean(normalized_features[group_indices], axis=0)
                    group_variance = np.var(normalized_features[group_indices], axis=0)
                    
                    pattern = {
                        "pattern_id": str(uuid4()),
                        "type": "anomaly",
                        "subtype": "outlier_cluster",
                        "description": f"Anomalous pattern group {group_id}",
                        "confidence": 1.0 - (len(group_indices) / len(data)),  # Rarer = higher confidence
                        "characteristics": {
                            "group_id": group_id,
                            "size": len(group_indices),
                            "center": group_center.tolist(),
                            "variance": group_variance.tolist(),
                            "member_indices": group_indices.tolist(),
                            "anomaly_strength": np.mean(np.abs(group_center))
                        },
                        "metadata": {
                            "detection_method": "isolation_forest",
                            "contamination_rate": self.config.anomaly_detection_contamination,
                            "total_anomalies": len(anomaly_indices)
                        }
                    }
                    
                    patterns.append(pattern)
            
            return {
                "patterns": patterns,
                "metadata": {
                    "feature_count": len(numerical_features[0]) if numerical_features else 0,
                    "total_anomalies": len(anomaly_indices),
                    "anomaly_rate": len(anomaly_indices) / len(data) if data else 0
                }
            }
            
        except Exception as e:
            logger.error(f"Anomaly pattern detection failed: {e}")
            return {"patterns": [], "metadata": {"error": str(e)}}
    
    async def _post_process_patterns(
        self,
        patterns: List[Dict[str, Any]],
        original_data: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Post-process detected patterns"""
        
        try:
            # Remove duplicates
            unique_patterns = self._remove_duplicate_patterns(patterns)
            
            # Filter by confidence
            filtered_patterns = [
                p for p in unique_patterns
                if p.get("confidence", 0) >= self.config.min_pattern_confidence
            ]
            
            # Rank patterns
            ranked_patterns = self._rank_patterns(filtered_patterns)
            
            # Limit number of patterns
            if len(ranked_patterns) > self.config.max_patterns_per_analysis:
                ranked_patterns = ranked_patterns[:self.config.max_patterns_per_analysis]
            
            # Add timestamps and metadata
            for pattern in ranked_patterns:
                pattern["detected_at"] = datetime.utcnow().isoformat()
                pattern["data_hash"] = hash(str(original_data))
                
                # Add statistical significance
                pattern["statistical_significance"] = self._calculate_statistical_significance(
                    pattern, original_data
                )
            
            return ranked_patterns
            
        except Exception as e:
            logger.error(f"Pattern post-processing failed: {e}")
            return patterns
    
    def _extract_structural_features(self, item: Dict[str, Any]) -> List[float]:
        """Extract structural features from data item"""
        features = []
        
        # Basic structural features
        features.append(len(str(item)))  # Size
        features.append(len(item) if isinstance(item, dict) else 0)  # Key count
        features.append(self._calculate_nesting_depth(item))  # Nesting depth
        features.append(self._count_data_types(item))  # Data type variety
        
        # Advanced structural features
        features.append(self._calculate_key_entropy(item))  # Key entropy
        features.append(self._calculate_value_entropy(item))  # Value entropy
        features.append(self._calculate_structural_complexity(item))  # Complexity
        
        return features
    
    def _extract_behavioral_sequence(self, item: Dict[str, Any]) -> Optional[Tuple[str, ...]]:
        """Extract behavioral sequence from data item"""
        try:
            # Look for action sequences, event chains, etc.
            if "actions" in item:
                return tuple(item["actions"])
            elif "events" in item:
                return tuple(item["events"])
            elif "sequence" in item:
                return tuple(item["sequence"])
            else:
                # Generate sequence from data structure
                sequence = []
                for key, value in item.items():
                    if isinstance(value, (list, tuple)):
                        sequence.extend([f"{key}_{v}" for v in value[:5]])  # Limit length
                    else:
                        sequence.append(f"{key}_{type(value).__name__}")
                
                return tuple(sequence) if sequence else None
                
        except Exception:
            return None
    
    def _extract_text_content(self, item: Dict[str, Any]) -> Optional[str]:
        """Extract text content from data item"""
        text_parts = []
        
        def extract_text_recursive(obj):
            if isinstance(obj, str):
                text_parts.append(obj)
            elif isinstance(obj, dict):
                for value in obj.values():
                    extract_text_recursive(value)
            elif isinstance(obj, (list, tuple)):
                for value in obj:
                    extract_text_recursive(value)
        
        extract_text_recursive(item)
        
        return " ".join(text_parts) if text_parts else None
    
    def _extract_timestamp(self, item: Dict[str, Any]) -> Optional[datetime]:
        """Extract timestamp from data item"""
        timestamp_keys = ["timestamp", "created_at", "updated_at", "date", "time"]
        
        for key in timestamp_keys:
            if key in item:
                try:
                    if isinstance(item[key], str):
                        return datetime.fromisoformat(item[key].replace('Z', '+00:00'))
                    elif isinstance(item[key], (int, float)):
                        return datetime.fromtimestamp(item[key])
                except Exception:
                    continue
        
        return None
    
    def _extract_numerical_features(self, item: Dict[str, Any]) -> Optional[List[float]]:
        """Extract numerical features from data item"""
        features = []
        
        def extract_numbers_recursive(obj):
            if isinstance(obj, (int, float)):
                features.append(float(obj))
            elif isinstance(obj, dict):
                for value in obj.values():
                    extract_numbers_recursive(value)
            elif isinstance(obj, (list, tuple)):
                for value in obj:
                    extract_numbers_recursive(value)
        
        extract_numbers_recursive(item)
        
        return features if features else None
    
    # Utility methods for pattern analysis
    def _calculate_nesting_depth(self, obj: Any, current_depth: int = 0) -> int:
        """Calculate nesting depth of data structure"""
        if isinstance(obj, dict):
            if not obj:
                return current_depth
            return max(self._calculate_nesting_depth(v, current_depth + 1) for v in obj.values())
        elif isinstance(obj, (list, tuple)):
            if not obj:
                return current_depth
            return max(self._calculate_nesting_depth(v, current_depth + 1) for v in obj)
        else:
            return current_depth
    
    def _count_data_types(self, obj: Any) -> int:
        """Count unique data types in structure"""
        types = set()
        
        def collect_types(o):
            types.add(type(o).__name__)
            if isinstance(o, dict):
                for v in o.values():
                    collect_types(v)
            elif isinstance(o, (list, tuple)):
                for v in o:
                    collect_types(v)
        
        collect_types(obj)
        return len(types)
    
    def _calculate_key_entropy(self, obj: Dict[str, Any]) -> float:
        """Calculate entropy of keys"""
        if not isinstance(obj, dict) or not obj:
            return 0.0
        
        key_lengths = [len(str(k)) for k in obj.keys()]
        return np.std(key_lengths) if key_lengths else 0.0
    
    def _calculate_value_entropy(self, obj: Dict[str, Any]) -> float:
        """Calculate entropy of values"""
        if not isinstance(obj, dict) or not obj:
            return 0.0
        
        value_types = [type(v).__name__ for v in obj.values()]
        type_counts = pd.Series(value_types).value_counts()
        probs = type_counts / len(value_types)
        
        return -np.sum(probs * np.log2(probs + 1e-10))
    
    def _calculate_structural_complexity(self, obj: Any) -> float:
        """Calculate structural complexity score"""
        depth = self._calculate_nesting_depth(obj)
        size = len(str(obj))
        types = self._count_data_types(obj)
        
        return (depth * 0.4 + np.log10(size + 1) * 0.4 + types * 0.2)
    
    async def generate_adaptive_rules(
        self,
        patterns: List[Dict[str, Any]],
        context: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate adaptive scan rules from detected patterns"""
        
        try:
            adaptive_rules = []
            
            for pattern in patterns:
                # Generate rule based on pattern type
                if pattern["type"] == "structural":
                    rule = await self._generate_structural_rule(pattern, context)
                elif pattern["type"] == "behavioral":
                    rule = await self._generate_behavioral_rule(pattern, context)
                elif pattern["type"] == "semantic":
                    rule = await self._generate_semantic_rule(pattern, context)
                elif pattern["type"] == "temporal":
                    rule = await self._generate_temporal_rule(pattern, context)
                elif pattern["type"] == "anomaly":
                    rule = await self._generate_anomaly_rule(pattern, context)
                else:
                    continue
                
                if rule:
                    adaptive_rules.append(rule)
            
            # Optimize rule set
            optimized_rules = await self._optimize_rule_set(adaptive_rules)
            
            logger.info(f"Generated {len(optimized_rules)} adaptive rules from {len(patterns)} patterns")
            
            return optimized_rules
            
        except Exception as e:
            logger.error(f"Adaptive rule generation failed: {e}")
            return []
    
    async def predict_scan_outcomes(
        self,
        scan_request: Dict[str, Any],
        historical_patterns: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Predict scan outcomes based on patterns"""
        
        try:
            prediction = {
                "predicted_duration": 0.0,
                "predicted_findings": 0,
                "confidence": 0.0,
                "risk_factors": [],
                "optimization_suggestions": [],
                "resource_requirements": {}
            }
            
            # Analyze similar historical scans
            similar_scans = self._find_similar_scans(scan_request, historical_patterns)
            
            if similar_scans:
                # Predict duration
                durations = [s.get("duration", 0) for s in similar_scans]
                prediction["predicted_duration"] = np.mean(durations)
                
                # Predict findings
                findings = [s.get("findings_count", 0) for s in similar_scans]
                prediction["predicted_findings"] = int(np.mean(findings))
                
                # Calculate confidence
                prediction["confidence"] = min(len(similar_scans) / 10, 1.0)
                
                # Identify risk factors
                prediction["risk_factors"] = self._identify_risk_factors(similar_scans)
                
                # Generate optimization suggestions
                prediction["optimization_suggestions"] = self._generate_optimization_suggestions(
                    scan_request, similar_scans
                )
                
                # Estimate resource requirements
                prediction["resource_requirements"] = self._estimate_resource_requirements(
                    scan_request, similar_scans
                )
            
            return prediction
            
        except Exception as e:
            logger.error(f"Scan outcome prediction failed: {e}")
            return {"error": str(e)}
    
    async def _pattern_learning_loop(self):
        """Background task for continuous pattern learning"""
        while True:
            try:
                await asyncio.sleep(300)  # Run every 5 minutes
                
                if len(self.pattern_buffer) >= 10:
                    # Learn from accumulated patterns
                    await self._update_pattern_knowledge()
                    
                    # Clear buffer
                    self.pattern_buffer.clear()
                
            except Exception as e:
                logger.error(f"Pattern learning loop error: {e}")
    
    async def _model_update_loop(self):
        """Background task for model updates"""
        while True:
            try:
                await asyncio.sleep(self.config.model_update_interval)
                
                # Update models with new data
                await self._update_ml_models()
                
                # Cleanup old patterns
                await self._cleanup_old_patterns()
                
            except Exception as e:
                logger.error(f"Model update loop error: {e}")
    
    async def get_pattern_insights(self) -> Dict[str, Any]:
        """Get insights about pattern detection performance"""
        
        return {
            "metrics": self.metrics.copy(),
            "pattern_statistics": {
                "known_patterns": len(self.known_patterns),
                "pattern_hierarchy_levels": len(self.pattern_hierarchy),
                "temporal_patterns": len(self.temporal_patterns),
                "buffer_size": len(self.pattern_buffer)
            },
            "model_info": {
                "clustering_model": str(type(self.clustering_model)),
                "anomaly_detector": str(type(self.anomaly_detector)),
                "classifier": str(type(self.classifier)),
                "nlp_model": "en_core_web_sm"
            },
            "configuration": {
                "min_pattern_confidence": self.config.min_pattern_confidence,
                "max_patterns_per_analysis": self.config.max_patterns_per_analysis,
                "clustering_min_samples": self.config.clustering_min_samples,
                "anomaly_contamination": self.config.anomaly_detection_contamination
            }
        }