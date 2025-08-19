"""
NLP Analysis Service
==================

Enterprise NLP analysis service for natural language processing,
text analysis, and conversation understanding.

This service provides:
- Text sentiment analysis
- Topic extraction and classification
- Named entity recognition
- Intent detection and classification
- Conversation flow analysis
- Text summarization
- Language detection
- Keyword extraction
- Semantic similarity analysis
"""

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import re
import json
from collections import Counter
import hashlib

logger = logging.getLogger(__name__)


class NLPAnalysisService:
    """Enterprise NLP analysis service"""
    
    def __init__(self):
        self.sentiment_lexicon = self._load_sentiment_lexicon()
        self.topic_keywords = self._load_topic_keywords()
        self.intent_patterns = self._load_intent_patterns()
    
    def _load_sentiment_lexicon(self) -> Dict[str, float]:
        """Load sentiment lexicon for analysis"""
        return {
            # Positive words
            'good': 0.5, 'great': 0.8, 'excellent': 1.0, 'amazing': 0.9, 'wonderful': 0.8,
            'helpful': 0.6, 'useful': 0.5, 'perfect': 1.0, 'awesome': 0.9, 'fantastic': 0.8,
            'thanks': 0.3, 'thank': 0.3, 'appreciate': 0.6, 'love': 0.8, 'like': 0.4,
            'success': 0.7, 'improve': 0.5, 'better': 0.6, 'best': 0.8, 'optimal': 0.7,
            
            # Negative words
            'bad': -0.5, 'terrible': -0.8, 'awful': -0.9, 'horrible': -0.9, 'worst': -0.8,
            'wrong': -0.6, 'error': -0.7, 'failed': -0.8, 'broken': -0.7, 'useless': -0.8,
            'confused': -0.5, 'frustrated': -0.6, 'angry': -0.7, 'hate': -0.8, 'dislike': -0.5,
            'problem': -0.4, 'issue': -0.4, 'difficult': -0.3, 'hard': -0.3, 'complex': -0.2
        }
    
    def _load_topic_keywords(self) -> Dict[str, List[str]]:
        """Load topic keywords for classification"""
        return {
            'data_analysis': ['data', 'analysis', 'insights', 'metrics', 'performance', 'statistics', 'report'],
            'compliance': ['compliance', 'regulation', 'policy', 'audit', 'gdpr', 'legal', 'requirement'],
            'security': ['security', 'access', 'permission', 'authentication', 'authorization', 'encryption'],
            'scanning': ['scan', 'discovery', 'rule', 'pattern', 'detect', 'find', 'search'],
            'catalog': ['catalog', 'asset', 'metadata', 'lineage', 'inventory', 'registry'],
            'optimization': ['optimize', 'improve', 'efficiency', 'performance', 'speed', 'faster'],
            'classification': ['classify', 'sensitive', 'label', 'category', 'type', 'group'],
            'workflow': ['workflow', 'process', 'automation', 'pipeline', 'orchestration'],
            'monitoring': ['monitor', 'alert', 'watch', 'track', 'observe', 'surveillance'],
            'integration': ['integrate', 'connect', 'link', 'sync', 'merge', 'combine']
        }
    
    def _load_intent_patterns(self) -> Dict[str, List[str]]:
        """Load intent patterns for classification"""
        return {
            'question': [r'\?$', r'what', r'how', r'why', r'when', r'where', r'which', r'who'],
            'request': [r'please', r'can you', r'could you', r'would you', r'help me', r'i need'],
            'command': [r'run', r'execute', r'start', r'stop', r'create', r'delete', r'update'],
            'feedback': [r'good', r'bad', r'great', r'terrible', r'thanks', r'helpful', r'useless'],
            'explanation': [r'explain', r'describe', r'tell me', r'show me', r'detail', r'information']
        }
    
    async def analyze_conversation(
        self,
        conversation_text: str,
        messages: List[Any]
    ) -> List[Dict[str, Any]]:
        """Analyze conversation using NLP techniques"""
        try:
            insights = []
            
            # Sentiment analysis
            sentiment = self.analyze_sentiment(conversation_text)
            insights.append({
                "type": "sentiment_analysis",
                "insight": f"Conversation sentiment: {self._get_sentiment_label(sentiment)}",
                "confidence": abs(sentiment),
                "timestamp": datetime.utcnow().isoformat()
            })
            
            # Topic extraction
            topics = self.extract_topics(conversation_text)
            if topics:
                insights.append({
                    "type": "topic_extraction",
                    "insight": f"Main topics: {', '.join(topics[:3])}",
                    "confidence": 0.8,
                    "timestamp": datetime.utcnow().isoformat()
                })
            
            # Intent classification
            intents = self.classify_intents(conversation_text)
            if intents:
                insights.append({
                    "type": "intent_classification",
                    "insight": f"Primary intent: {intents[0]}",
                    "confidence": 0.7,
                    "timestamp": datetime.utcnow().isoformat()
                })
            
            # Entity recognition
            entities = self.extract_entities(conversation_text)
            if entities:
                insights.append({
                    "type": "entity_recognition",
                    "insight": f"Key entities: {', '.join(entities[:5])}",
                    "confidence": 0.6,
                    "timestamp": datetime.utcnow().isoformat()
                })
            
            # Conversation flow analysis
            flow_analysis = self.analyze_conversation_flow(messages)
            if flow_analysis:
                insights.append({
                    "type": "conversation_flow",
                    "insight": f"Flow pattern: {flow_analysis}",
                    "confidence": 0.5,
                    "timestamp": datetime.utcnow().isoformat()
                })
            
            return insights
            
        except Exception as e:
            logger.error(f"Error analyzing conversation: {e}")
            return []
    
    def analyze_sentiment(self, text: str) -> float:
        """Analyze text sentiment"""
        try:
            if not text:
                return 0.0
            
            words = re.findall(r'\b\w+\b', text.lower())
            if not words:
                return 0.0
            
            sentiment_score = 0.0
            sentiment_count = 0
            
            for word in words:
                if word in self.sentiment_lexicon:
                    sentiment_score += self.sentiment_lexicon[word]
                    sentiment_count += 1
            
            if sentiment_count == 0:
                return 0.0
            
            # Normalize sentiment score
            avg_sentiment = sentiment_score / sentiment_count
            return max(-1.0, min(1.0, avg_sentiment))
            
        except Exception as e:
            logger.error(f"Error analyzing sentiment: {e}")
            return 0.0
    
    def extract_topics(self, text: str) -> List[str]:
        """Extract topics from text"""
        try:
            if not text:
                return []
            
            text_lower = text.lower()
            topic_scores = {}
            
            for topic, keywords in self.topic_keywords.items():
                score = 0
                for keyword in keywords:
                    if keyword in text_lower:
                        score += 1
                if score > 0:
                    topic_scores[topic] = score
            
            # Return topics sorted by score
            sorted_topics = sorted(topic_scores.items(), key=lambda x: x[1], reverse=True)
            return [topic for topic, score in sorted_topics if score >= 1]
            
        except Exception as e:
            logger.error(f"Error extracting topics: {e}")
            return []
    
    def classify_intents(self, text: str) -> List[str]:
        """Classify text intents"""
        try:
            if not text:
                return []
            
            text_lower = text.lower()
            intent_scores = {}
            
            for intent, patterns in self.intent_patterns.items():
                score = 0
                for pattern in patterns:
                    if re.search(pattern, text_lower):
                        score += 1
                if score > 0:
                    intent_scores[intent] = score
            
            # Return intents sorted by score
            sorted_intents = sorted(intent_scores.items(), key=lambda x: x[1], reverse=True)
            return [intent for intent, score in sorted_intents if score >= 1]
            
        except Exception as e:
            logger.error(f"Error classifying intents: {e}")
            return []
    
    def extract_entities(self, text: str) -> List[str]:
        """Extract named entities from text"""
        try:
            if not text:
                return []
            
            entities = []
            
            # Extract potential entities (capitalized words, numbers, etc.)
            # This is a simplified version - in production would use proper NER
            words = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', text)
            numbers = re.findall(r'\b\d+(?:\.\d+)?\b', text)
            
            # Filter out common words
            common_words = {'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
            filtered_words = [word for word in words if word.lower() not in common_words]
            
            entities.extend(filtered_words[:5])  # Limit to 5 entities
            entities.extend(numbers[:3])  # Limit to 3 numbers
            
            return entities
            
        except Exception as e:
            logger.error(f"Error extracting entities: {e}")
            return []
    
    def analyze_conversation_flow(self, messages: List[Any]) -> str:
        """Analyze conversation flow pattern"""
        try:
            if not messages or len(messages) < 2:
                return "single_message"
            
            # Analyze message types
            user_messages = [m for m in messages if hasattr(m, 'sender_type') and m.sender_type == "user"]
            ai_messages = [m for m in messages if hasattr(m, 'sender_type') and m.sender_type == "assistant"]
            
            if len(user_messages) == 0:
                return "ai_monologue"
            elif len(ai_messages) == 0:
                return "user_monologue"
            elif len(user_messages) == 1 and len(ai_messages) == 1:
                return "simple_exchange"
            elif len(user_messages) > len(ai_messages):
                return "user_dominated"
            elif len(ai_messages) > len(user_messages):
                return "ai_dominated"
            else:
                return "balanced_conversation"
                
        except Exception as e:
            logger.error(f"Error analyzing conversation flow: {e}")
            return "unknown"
    
    def _get_sentiment_label(self, sentiment_score: float) -> str:
        """Get sentiment label from score"""
        if sentiment_score >= 0.3:
            return "Positive"
        elif sentiment_score <= -0.3:
            return "Negative"
        else:
            return "Neutral"
    
    async def summarize_text(self, text: str, max_length: int = 200) -> str:
        """Generate text summary"""
        try:
            if not text:
                return ""
            
            # Simple extractive summarization
            sentences = re.split(r'[.!?]+', text)
            sentences = [s.strip() for s in sentences if s.strip()]
            
            if len(sentences) <= 2:
                return text
            
            # Score sentences by word frequency
            word_freq = Counter()
            for sentence in sentences:
                words = re.findall(r'\b\w+\b', sentence.lower())
                word_freq.update(words)
            
            sentence_scores = {}
            for sentence in sentences:
                words = re.findall(r'\b\w+\b', sentence.lower())
                score = sum(word_freq[word] for word in words)
                sentence_scores[sentence] = score
            
            # Select top sentences
            sorted_sentences = sorted(sentence_scores.items(), key=lambda x: x[1], reverse=True)
            summary_sentences = []
            current_length = 0
            
            for sentence, score in sorted_sentences:
                if current_length + len(sentence) <= max_length:
                    summary_sentences.append(sentence)
                    current_length += len(sentence)
                else:
                    break
            
            return '. '.join(summary_sentences) + '.'
            
        except Exception as e:
            logger.error(f"Error summarizing text: {e}")
            return text[:max_length] if text else ""
    
    async def extract_keywords(self, text: str, max_keywords: int = 10) -> List[str]:
        """Extract keywords from text"""
        try:
            if not text:
                return []
            
            # Remove common stop words
            stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'}
            
            words = re.findall(r'\b\w+\b', text.lower())
            filtered_words = [word for word in words if word not in stop_words and len(word) > 2]
            
            # Count word frequency
            word_freq = Counter(filtered_words)
            
            # Return most common words
            return [word for word, count in word_freq.most_common(max_keywords)]
            
        except Exception as e:
            logger.error(f"Error extracting keywords: {e}")
            return []
    
    async def calculate_semantic_similarity(self, text1: str, text2: str) -> float:
        """Calculate semantic similarity between two texts"""
        try:
            if not text1 or not text2:
                return 0.0
            
            # Simple similarity based on word overlap
            words1 = set(re.findall(r'\b\w+\b', text1.lower()))
            words2 = set(re.findall(r'\b\w+\b', text2.lower()))
            
            if not words1 or not words2:
                return 0.0
            
            intersection = words1.intersection(words2)
            union = words1.union(words2)
            
            similarity = len(intersection) / len(union) if union else 0.0
            return similarity
            
        except Exception as e:
            logger.error(f"Error calculating semantic similarity: {e}")
            return 0.0

