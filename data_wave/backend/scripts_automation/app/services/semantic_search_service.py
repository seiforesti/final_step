"""
Enterprise Semantic Search Service
Advanced semantic search service for intelligent data discovery and natural language understanding.
Provides NLP-powered search, contextual recommendations, smart tagging,
and AI-driven data asset discovery with semantic understanding.
"""

import asyncio
import json
import logging
import numpy as np
import re
import spacy
import time
from collections import defaultdict, deque
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Set, Tuple, Union
from uuid import uuid4

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans
from sklearn.decomposition import LatentDirichletAllocation
from transformers import (
    AutoTokenizer, AutoModel, pipeline,
    BertTokenizer, BertModel
)
import torch
import faiss

from ..core.cache_manager import EnterpriseCacheManager as CacheManager
from ..core.logging_config import get_logger
from ..core.settings import get_settings_manager
from ..models.catalog_intelligence_models import *
from ..services.ai_service import EnterpriseAIService as AIService

logger = get_logger(__name__)

class SemanticSearchConfig:
    """Configuration for semantic search"""
    
    def __init__(self):
        self.max_search_results = 50
        self.semantic_similarity_threshold = 0.7
        self.contextual_boost_factor = 1.5
        self.cache_ttl = 3600
        self.vector_dimension = 768
        self.faiss_index_type = "IVF"
        self.search_timeout = 30
        
        # NLP model configurations
        self.sentence_transformer_model = "sentence-transformers/all-MiniLM-L6-v2"
        self.bert_model = "bert-base-uncased"
        self.spacy_model = "en_core_web_lg"
        
        # Search enhancement
        self.query_expansion_enabled = True
        self.auto_correct_enabled = True
        self.synonym_expansion_enabled = True
        self.contextual_search_enabled = True
        
        # Ranking factors
        self.semantic_weight = 0.4
        self.keyword_weight = 0.3
        self.popularity_weight = 0.2
        self.recency_weight = 0.1

class SemanticSearchService:
    """
    Enterprise-grade semantic search service providing:
    - Natural language search across data assets
    - Semantic understanding and context awareness
    - Intelligent query expansion and correction
    - Contextual recommendations
    - Multi-modal search capabilities
    - Real-time search optimization
    """
    
    def __init__(self):
        self.settings = get_settings_manager()
        self.cache = CacheManager()
        self.ai_service = AIService()
        
        self.config = SemanticSearchConfig()
        self._init_nlp_models()
        self._init_search_indices()
        
        # Search state
        self.asset_embeddings = {}
        self.asset_metadata = {}
        self.search_history = deque(maxlen=10000)
        self.query_statistics = defaultdict(int)
        
        # Search optimization
        self.popular_queries = deque(maxlen=1000)
        self.query_patterns = {}
        self.search_performance = {}
        
        # Search metrics
        self.search_metrics = {
            'total_searches': 0,
            'successful_searches': 0,
            'average_response_time': 0.0,
            'semantic_search_ratio': 0.0,
            'query_expansion_ratio': 0.0,
            'click_through_rate': 0.0,
            'search_satisfaction': 0.0
        }
        
        # Threading
        self.executor = ThreadPoolExecutor(max_workers=8)
        
        # Background tasks
        asyncio.create_task(self._index_optimization_loop())
        asyncio.create_task(self._search_analytics_loop())
        asyncio.create_task(self._model_update_loop())
    
    def _init_nlp_models(self):
        """Initialize NLP models for semantic search"""
        try:
            # Load spaCy model
            self.nlp = spacy.load(self.config.spacy_model)
            
            # Load sentence transformer for embeddings
            self.sentence_tokenizer = AutoTokenizer.from_pretrained(
                self.config.sentence_transformer_model
            )
            self.sentence_model = AutoModel.from_pretrained(
                self.config.sentence_transformer_model
            )
            
            # Load BERT for advanced understanding
            self.bert_tokenizer = BertTokenizer.from_pretrained(
                self.config.bert_model
            )
            self.bert_model = BertModel.from_pretrained(
                self.config.bert_model
            )
            
            # Initialize text processing pipelines
            self.summarization_pipeline = pipeline(
                "summarization",
                model="facebook/bart-large-cnn"
            )
            
            self.question_answering_pipeline = pipeline(
                "question-answering",
                model="deepset/roberta-base-squad2"
            )
            
            self.text_classification_pipeline = pipeline(
                "text-classification",
                model="microsoft/DialoGPT-medium"
            )
            
            # TF-IDF vectorizer for keyword search
            self.tfidf_vectorizer = TfidfVectorizer(
                max_features=10000,
                stop_words='english',
                ngram_range=(1, 3)
            )
            
            # Topic modeling
            self.topic_model = LatentDirichletAllocation(
                n_components=20,
                random_state=42
            )
            
            logger.info("NLP models initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize NLP models: {e}")
            raise
    
    def _init_search_indices(self):
        """Initialize FAISS search indices"""
        try:
            # Create FAISS index for semantic similarity
            self.semantic_index = faiss.IndexFlatIP(self.config.vector_dimension)
            
            # Create index with clustering for large datasets
            self.clustered_index = faiss.IndexIVFFlat(
                faiss.IndexFlatIP(self.config.vector_dimension),
                self.config.vector_dimension,
                100  # number of clusters
            )
            
            # Mapping from index position to asset IDs
            self.index_to_asset_id = {}
            self.asset_id_to_index = {}
            
            logger.info("Search indices initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize search indices: {e}")
            raise
    
    async def semantic_search(
        self,
        query: str,
        search_context: Optional[Dict[str, Any]] = None,
        filters: Optional[Dict[str, Any]] = None,
        limit: int = 20
    ) -> Dict[str, Any]:
        """
        Perform semantic search across data assets
        
        Args:
            query: Natural language search query
            search_context: Additional context for search
            filters: Search filters (asset type, tags, etc.)
            limit: Maximum number of results
            
        Returns:
            Search results with semantic scores and recommendations
        """
        search_id = str(uuid4())
        start_time = time.time()
        
        try:
            # Preprocess and enhance query
            enhanced_query = await self._enhance_search_query(query, search_context)
            
            # Extract query embeddings
            query_embedding = await self._get_query_embedding(enhanced_query["text"])
            
            # Perform multi-modal search
            search_results = await self._perform_multi_modal_search(
                enhanced_query, query_embedding, filters, limit
            )
            
            # Apply contextual ranking
            ranked_results = await self._apply_contextual_ranking(
                search_results, enhanced_query, search_context
            )
            
            # Generate search insights
            search_insights = await self._generate_search_insights(
                query, enhanced_query, ranked_results
            )
            
            # Generate recommendations
            recommendations = await self._generate_search_recommendations(
                ranked_results, search_context
            )
            
            # Track search metrics
            processing_time = time.time() - start_time
            await self._track_search_metrics(
                search_id, query, enhanced_query, ranked_results, processing_time
            )
            
            # Store search history
            search_record = {
                "search_id": search_id,
                "original_query": query,
                "enhanced_query": enhanced_query,
                "results_count": len(ranked_results),
                "processing_time": processing_time,
                "timestamp": datetime.utcnow().isoformat()
            }
            self.search_history.append(search_record)
            
            logger.info(f"Semantic search completed: {search_id} - {len(ranked_results)} results")
            
            return {
                "search_id": search_id,
                "query": query,
                "enhanced_query": enhanced_query,
                "results": ranked_results[:limit],
                "total_results": len(ranked_results),
                "search_insights": search_insights,
                "recommendations": recommendations,
                "processing_time_ms": processing_time * 1000,
                "search_metadata": {
                    "semantic_similarity_used": True,
                    "query_expansion_applied": enhanced_query.get("expanded", False),
                    "contextual_boost_applied": search_context is not None,
                    "filters_applied": filters is not None
                }
            }
            
        except Exception as e:
            logger.error(f"Semantic search failed: {e}")
            return {
                "search_id": search_id,
                "query": query,
                "error": str(e),
                "results": [],
                "processing_time_ms": (time.time() - start_time) * 1000
            }
    
    async def _enhance_search_query(
        self,
        query: str,
        context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Enhance search query with NLP processing"""
        
        try:
            enhanced_query = {
                "original": query,
                "text": query,
                "expanded": False,
                "corrected": False,
                "intent": None,
                "entities": [],
                "keywords": [],
                "synonyms": []
            }
            
            # Process with spaCy
            doc = self.nlp(query)
            
            # Extract entities
            entities = []
            for ent in doc.ents:
                entities.append({
                    "text": ent.text,
                    "label": ent.label_,
                    "start": ent.start_char,
                    "end": ent.end_char
                })
            enhanced_query["entities"] = entities
            
            # Extract keywords (important terms)
            keywords = []
            for token in doc:
                if (not token.is_stop and not token.is_punct and 
                    token.pos_ in ['NOUN', 'PROPN', 'ADJ', 'VERB']):
                    keywords.append({
                        "text": token.text,
                        "lemma": token.lemma_,
                        "pos": token.pos_,
                        "importance": self._calculate_token_importance(token)
                    })
            enhanced_query["keywords"] = keywords
            
            # Query correction
            if self.config.auto_correct_enabled:
                corrected_query = await self._correct_query_spelling(query)
                if corrected_query != query:
                    enhanced_query["text"] = corrected_query
                    enhanced_query["corrected"] = True
            
            # Query expansion
            if self.config.query_expansion_enabled:
                expanded_query = await self._expand_query(enhanced_query["text"], entities, keywords)
                if expanded_query != enhanced_query["text"]:
                    enhanced_query["text"] = expanded_query
                    enhanced_query["expanded"] = True
            
            # Detect search intent
            enhanced_query["intent"] = await self._detect_search_intent(
                enhanced_query["text"], entities, keywords, context
            )
            
            # Add synonyms
            if self.config.synonym_expansion_enabled:
                synonyms = await self._get_query_synonyms(keywords)
                enhanced_query["synonyms"] = synonyms
            
            return enhanced_query
            
        except Exception as e:
            logger.error(f"Query enhancement failed: {e}")
            return {
                "original": query,
                "text": query,
                "error": str(e)
            }
    
    async def _get_query_embedding(self, query: str) -> np.ndarray:
        """Generate semantic embedding for query"""
        
        try:
            # Tokenize query
            inputs = self.sentence_tokenizer(
                query,
                return_tensors="pt",
                truncation=True,
                padding=True,
                max_length=512
            )
            
            # Generate embeddings
            with torch.no_grad():
                outputs = self.sentence_model(**inputs)
                
                # Use mean pooling
                embeddings = outputs.last_hidden_state.mean(dim=1)
                
                # Normalize embeddings
                embeddings = torch.nn.functional.normalize(embeddings, p=2, dim=1)
                
                return embeddings.cpu().numpy()[0]
        
        except Exception as e:
            logger.error(f"Query embedding generation failed: {e}")
            return np.zeros(self.config.vector_dimension)
    
    async def _perform_multi_modal_search(
        self,
        enhanced_query: Dict[str, Any],
        query_embedding: np.ndarray,
        filters: Optional[Dict[str, Any]],
        limit: int
    ) -> List[Dict[str, Any]]:
        """Perform multi-modal search combining semantic and keyword approaches"""
        
        try:
            search_results = []
            
            # 1. Semantic similarity search
            semantic_results = await self._semantic_similarity_search(
                query_embedding, limit * 2
            )
            
            # 2. Keyword-based search
            keyword_results = await self._keyword_based_search(
                enhanced_query["text"], limit * 2
            )
            
            # 3. Entity-based search
            entity_results = await self._entity_based_search(
                enhanced_query["entities"], limit
            )
            
            # 4. Intent-based search
            intent_results = await self._intent_based_search(
                enhanced_query["intent"], enhanced_query, limit
            )
            
            # Combine and deduplicate results
            combined_results = self._combine_search_results([
                semantic_results,
                keyword_results,
                entity_results,
                intent_results
            ])
            
            # Apply filters
            if filters:
                combined_results = await self._apply_search_filters(
                    combined_results, filters
                )
            
            # Calculate hybrid scores
            for result in combined_results:
                result["hybrid_score"] = self._calculate_hybrid_score(
                    result, enhanced_query, query_embedding
                )
            
            # Sort by hybrid score
            combined_results.sort(key=lambda x: x["hybrid_score"], reverse=True)
            
            return combined_results
            
        except Exception as e:
            logger.error(f"Multi-modal search failed: {e}")
            return []
    
    async def _semantic_similarity_search(
        self,
        query_embedding: np.ndarray,
        limit: int
    ) -> List[Dict[str, Any]]:
        """Perform semantic similarity search using FAISS"""
        
        try:
            if self.semantic_index.ntotal == 0:
                return []
            
            # Search in FAISS index
            query_vector = query_embedding.reshape(1, -1).astype('float32')
            similarities, indices = self.semantic_index.search(query_vector, min(limit, self.semantic_index.ntotal))
            
            results = []
            for i, (similarity, index) in enumerate(zip(similarities[0], indices[0])):
                if index >= 0 and similarity >= self.config.semantic_similarity_threshold:
                    asset_id = self.index_to_asset_id.get(index)
                    if asset_id and asset_id in self.asset_metadata:
                        result = self.asset_metadata[asset_id].copy()
                        result.update({
                            "search_score": float(similarity),
                            "search_method": "semantic",
                            "rank": i + 1
                        })
                        results.append(result)
            
            return results
            
        except Exception as e:
            logger.error(f"Semantic similarity search failed: {e}")
            return []
    
    async def _keyword_based_search(
        self,
        query: str,
        limit: int
    ) -> List[Dict[str, Any]]:
        """Perform keyword-based search using TF-IDF"""
        
        try:
            if not hasattr(self, 'asset_texts') or not self.asset_texts:
                return []
            
            # Vectorize query
            query_vector = self.tfidf_vectorizer.transform([query])
            
            # Calculate similarities
            similarities = cosine_similarity(query_vector, self.asset_text_vectors).flatten()
            
            # Get top results
            top_indices = np.argsort(similarities)[::-1][:limit]
            
            results = []
            for i, index in enumerate(top_indices):
                if similarities[index] > 0:
                    asset_id = list(self.asset_texts.keys())[index]
                    if asset_id in self.asset_metadata:
                        result = self.asset_metadata[asset_id].copy()
                        result.update({
                            "search_score": float(similarities[index]),
                            "search_method": "keyword",
                            "rank": i + 1
                        })
                        results.append(result)
            
            return results
            
        except Exception as e:
            logger.error(f"Keyword-based search failed: {e}")
            return []
    
    async def _entity_based_search(
        self,
        entities: List[Dict[str, Any]],
        limit: int
    ) -> List[Dict[str, Any]]:
        """Search based on named entities"""
        
        try:
            if not entities:
                return []
            
            results = []
            
            for entity in entities:
                entity_text = entity["text"].lower()
                entity_type = entity["label"]
                
                # Search in asset metadata for entity matches
                for asset_id, metadata in self.asset_metadata.items():
                    score = 0.0
                    
                    # Check in asset name
                    if entity_text in metadata.get("name", "").lower():
                        score += 1.0
                    
                    # Check in description
                    if entity_text in metadata.get("description", "").lower():
                        score += 0.7
                    
                    # Check in tags
                    tags = metadata.get("tags", [])
                    if any(entity_text in tag.lower() for tag in tags):
                        score += 0.8
                    
                    # Check in schema/column names
                    schema = metadata.get("schema", {})
                    if isinstance(schema, dict):
                        for column_name in schema.get("columns", []):
                            if entity_text in column_name.lower():
                                score += 0.6
                    
                    if score > 0:
                        result = metadata.copy()
                        result.update({
                            "search_score": score,
                            "search_method": "entity",
                            "matched_entity": entity,
                            "rank": len(results) + 1
                        })
                        results.append(result)
            
            # Remove duplicates and sort by score
            unique_results = {}
            for result in results:
                asset_id = result.get("asset_id")
                if asset_id not in unique_results or result["search_score"] > unique_results[asset_id]["search_score"]:
                    unique_results[asset_id] = result
            
            sorted_results = sorted(unique_results.values(), key=lambda x: x["search_score"], reverse=True)
            
            return sorted_results[:limit]
            
        except Exception as e:
            logger.error(f"Entity-based search failed: {e}")
            return []
    
    async def _intent_based_search(
        self,
        intent: Optional[str],
        enhanced_query: Dict[str, Any],
        limit: int
    ) -> List[Dict[str, Any]]:
        """Search based on detected intent"""
        
        try:
            if not intent:
                return []
            
            results = []
            
            # Different search strategies based on intent
            if intent == "find_schema":
                results = await self._search_by_schema_intent(enhanced_query, limit)
            elif intent == "find_data_quality":
                results = await self._search_by_quality_intent(enhanced_query, limit)
            elif intent == "find_lineage":
                results = await self._search_by_lineage_intent(enhanced_query, limit)
            elif intent == "find_usage":
                results = await self._search_by_usage_intent(enhanced_query, limit)
            elif intent == "find_similar":
                results = await self._search_by_similarity_intent(enhanced_query, limit)
            
            return results
            
        except Exception as e:
            logger.error(f"Intent-based search failed: {e}")
            return []
    
    def _combine_search_results(
        self,
        result_sets: List[List[Dict[str, Any]]]
    ) -> List[Dict[str, Any]]:
        """Combine and deduplicate search results from different methods"""
        
        combined = {}
        
        for result_set in result_sets:
            for result in result_set:
                asset_id = result.get("asset_id")
                if asset_id:
                    if asset_id not in combined:
                        combined[asset_id] = result
                        combined[asset_id]["search_methods"] = [result.get("search_method")]
                        combined[asset_id]["method_scores"] = {result.get("search_method"): result.get("search_score", 0)}
                    else:
                        # Combine scores from multiple methods
                        method = result.get("search_method")
                        if method not in combined[asset_id]["search_methods"]:
                            combined[asset_id]["search_methods"].append(method)
                            combined[asset_id]["method_scores"][method] = result.get("search_score", 0)
        
        return list(combined.values())
    
    def _calculate_hybrid_score(
        self,
        result: Dict[str, Any],
        enhanced_query: Dict[str, Any],
        query_embedding: np.ndarray
    ) -> float:
        """Calculate hybrid score combining multiple search methods"""
        
        try:
            method_scores = result.get("method_scores", {})
            
            # Base scores from different methods
            semantic_score = method_scores.get("semantic", 0.0)
            keyword_score = method_scores.get("keyword", 0.0)
            entity_score = method_scores.get("entity", 0.0)
            intent_score = method_scores.get("intent", 0.0)
            
            # Apply weights
            weighted_score = (
                semantic_score * self.config.semantic_weight +
                keyword_score * self.config.keyword_weight +
                entity_score * 0.2 +
                intent_score * 0.1
            )
            
            # Apply popularity boost
            popularity_score = result.get("popularity_score", 0.0)
            weighted_score += popularity_score * self.config.popularity_weight
            
            # Apply recency boost
            recency_score = self._calculate_recency_score(result)
            weighted_score += recency_score * self.config.recency_weight
            
            # Contextual boost
            if result.get("contextual_relevance"):
                weighted_score *= self.config.contextual_boost_factor
            
            return weighted_score
            
        except Exception as e:
            logger.error(f"Hybrid score calculation failed: {e}")
            return 0.0
    
    async def index_asset(
        self,
        asset_id: str,
        asset_metadata: Dict[str, Any],
        asset_content: str
    ) -> Dict[str, Any]:
        """Index a data asset for semantic search"""
        
        try:
            # Generate semantic embedding
            embedding = await self._get_query_embedding(asset_content)
            
            # Store asset metadata
            self.asset_metadata[asset_id] = asset_metadata
            
            # Add to FAISS index
            if asset_id not in self.asset_id_to_index:
                index_position = self.semantic_index.ntotal
                self.semantic_index.add(embedding.reshape(1, -1).astype('float32'))
                
                self.index_to_asset_id[index_position] = asset_id
                self.asset_id_to_index[asset_id] = index_position
                
                # Store embedding
                self.asset_embeddings[asset_id] = embedding
            
            # Update text corpus for TF-IDF
            if not hasattr(self, 'asset_texts'):
                self.asset_texts = {}
            
            self.asset_texts[asset_id] = asset_content
            
            # Retrain TF-IDF if needed
            if len(self.asset_texts) % 100 == 0:  # Retrain every 100 assets
                await self._retrain_tfidf_vectorizer()
            
            logger.info(f"Asset indexed successfully: {asset_id}")
            
            return {
                "status": "indexed",
                "asset_id": asset_id,
                "index_position": self.asset_id_to_index.get(asset_id),
                "embedding_dimension": len(embedding)
            }
            
        except Exception as e:
            logger.error(f"Asset indexing failed: {e}")
            return {
                "status": "failed",
                "asset_id": asset_id,
                "error": str(e)
            }
    
    async def _retrain_tfidf_vectorizer(self):
        """Retrain TF-IDF vectorizer with current asset texts"""
        
        try:
            texts = list(self.asset_texts.values())
            self.asset_text_vectors = self.tfidf_vectorizer.fit_transform(texts)
            logger.info("TF-IDF vectorizer retrained successfully")
            
        except Exception as e:
            logger.error(f"TF-IDF retraining failed: {e}")
    
    # Utility methods
    def _calculate_token_importance(self, token) -> float:
        """Calculate importance score for a token"""
        
        importance = 0.5  # Base importance
        
        # Boost for certain POS tags
        if token.pos_ in ['PROPN', 'NOUN']:
            importance += 0.3
        elif token.pos_ in ['ADJ', 'VERB']:
            importance += 0.2
        
        # Boost for named entities
        if token.ent_type_:
            importance += 0.4
        
        # Reduce for very common words
        if token.is_alpha and len(token.text) > 1:
            importance += 0.1
        
        return min(1.0, importance)
    
    def _calculate_recency_score(self, result: Dict[str, Any]) -> float:
        """Calculate recency score for search result"""
        
        try:
            last_modified = result.get("last_modified")
            if not last_modified:
                return 0.0
            
            if isinstance(last_modified, str):
                last_modified = datetime.fromisoformat(last_modified.replace('Z', '+00:00'))
            
            days_old = (datetime.utcnow() - last_modified.replace(tzinfo=None)).days
            
            # Decay function for recency
            if days_old <= 7:
                return 1.0
            elif days_old <= 30:
                return 0.8
            elif days_old <= 90:
                return 0.5
            elif days_old <= 365:
                return 0.2
            else:
                return 0.1
                
        except Exception:
            return 0.0
    
    # Background task loops
    async def _index_optimization_loop(self):
        """Optimize search indices periodically"""
        while True:
            try:
                await asyncio.sleep(3600)  # Run every hour
                
                # Optimize FAISS index
                if self.semantic_index.ntotal > 1000:
                    await self._optimize_faiss_index()
                
                # Clean up old search history
                await self._cleanup_search_history()
                
            except Exception as e:
                logger.error(f"Index optimization loop error: {e}")
    
    async def _search_analytics_loop(self):
        """Analyze search patterns and update recommendations"""
        while True:
            try:
                await asyncio.sleep(1800)  # Run every 30 minutes
                
                # Analyze search patterns
                await self._analyze_search_patterns()
                
                # Update popular queries
                await self._update_popular_queries()
                
                # Update search performance metrics
                await self._update_search_metrics()
                
            except Exception as e:
                logger.error(f"Search analytics loop error: {e}")
    
    async def _model_update_loop(self):
        """Update and retrain models periodically"""
        while True:
            try:
                await asyncio.sleep(86400)  # Run daily
                
                # Update topic models
                await self._update_topic_models()
                
                # Retrain classification models
                await self._retrain_classification_models()
                
            except Exception as e:
                logger.error(f"Model update loop error: {e}")
    
    async def get_search_insights(self) -> Dict[str, Any]:
        """Get comprehensive search service insights"""
        
        return {
            "search_metrics": self.search_metrics.copy(),
            "indexed_assets": len(self.asset_metadata),
            "search_history_size": len(self.search_history),
            "popular_queries": len(self.popular_queries),
            "index_status": {
                "semantic_index_size": self.semantic_index.ntotal,
                "tfidf_vocabulary_size": getattr(self.tfidf_vectorizer, 'vocabulary_', {}) and len(self.tfidf_vectorizer.vocabulary_),
                "embeddings_stored": len(self.asset_embeddings)
            },
            "configuration": {
                "max_search_results": self.config.max_search_results,
                "semantic_similarity_threshold": self.config.semantic_similarity_threshold,
                "vector_dimension": self.config.vector_dimension,
                "query_expansion_enabled": self.config.query_expansion_enabled,
                "auto_correct_enabled": self.config.auto_correct_enabled
            },
            "model_status": {
                "nlp_model_loaded": self.nlp is not None,
                "sentence_transformer_loaded": self.sentence_model is not None,
                "bert_model_loaded": self.bert_model is not None
            }
        }