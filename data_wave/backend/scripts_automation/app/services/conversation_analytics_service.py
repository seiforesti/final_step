"""
Conversation Analytics Service
=============================

Enterprise conversation analytics service for analyzing AI conversations,
user interactions, and providing insights for conversation optimization.

This service provides:
- Conversation sentiment analysis
- User interaction patterns
- Conversation flow analysis
- Response quality metrics
- User satisfaction tracking
- Conversation optimization insights
- Real-time conversation monitoring
- Historical conversation analytics
"""

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, desc
import json
import re

from app.models.racine_models.racine_ai_models import RacineAIMessage, RacineAIConversation
from app.db_session import get_db

logger = logging.getLogger(__name__)


class ConversationAnalyticsService:
    """Enterprise conversation analytics service"""
    
    def __init__(self, db_session: Optional[Session] = None):
        self.db = db_session
    
    async def get_conversation_insights(
        self,
        conversation_id: str,
        messages: List[Any]
    ) -> List[Dict[str, Any]]:
        """Get AI-powered insights for a conversation"""
        try:
            insights = []
            
            # Analyze conversation length
            if len(messages) > 0:
                insights.append({
                    "type": "conversation_length",
                    "metric": "message_count",
                    "value": len(messages),
                    "insight": f"Conversation has {len(messages)} messages",
                    "timestamp": datetime.utcnow().isoformat()
                })
            
            # Analyze response times
            response_times = self._analyze_response_times(messages)
            if response_times:
                avg_response_time = sum(response_times) / len(response_times)
                insights.append({
                    "type": "response_time",
                    "metric": "average_response_time_seconds",
                    "value": avg_response_time,
                    "insight": f"Average response time: {avg_response_time:.2f} seconds",
                    "timestamp": datetime.utcnow().isoformat()
                })
            
            # Analyze conversation topics
            topics = self._analyze_conversation_topics(messages)
            if topics:
                insights.append({
                    "type": "conversation_topics",
                    "metric": "topic_count",
                    "value": len(topics),
                    "insight": f"Conversation covers {len(topics)} main topics: {', '.join(topics[:3])}",
                    "timestamp": datetime.utcnow().isoformat()
                })
            
            # Analyze user engagement
            engagement_score = self._calculate_engagement_score(messages)
            insights.append({
                "type": "user_engagement",
                "metric": "engagement_score",
                "value": engagement_score,
                "insight": f"User engagement score: {engagement_score:.2f}/10",
                "timestamp": datetime.utcnow().isoformat()
            })
            
            # Analyze conversation sentiment
            sentiment = self._analyze_conversation_sentiment(messages)
            insights.append({
                "type": "conversation_sentiment",
                "metric": "sentiment_score",
                "value": sentiment,
                "insight": f"Conversation sentiment: {self._get_sentiment_label(sentiment)}",
                "timestamp": datetime.utcnow().isoformat()
            })
            
            return insights
            
        except Exception as e:
            logger.error(f"Error getting conversation insights: {e}")
            return []
    
    def _analyze_response_times(self, messages: List[Any]) -> List[float]:
        """Analyze response times between messages"""
        try:
            response_times = []
            for i in range(1, len(messages)):
                if hasattr(messages[i], 'created_at') and hasattr(messages[i-1], 'created_at'):
                    time_diff = (messages[i].created_at - messages[i-1].created_at).total_seconds()
                    if time_diff > 0 and time_diff < 3600:  # Filter out unreasonable times
                        response_times.append(time_diff)
            return response_times
        except Exception as e:
            logger.error(f"Error analyzing response times: {e}")
            return []
    
    def _analyze_conversation_topics(self, messages: List[Any]) -> List[str]:
        """Analyze conversation topics based on message content"""
        try:
            topics = set()
            topic_keywords = {
                'data_analysis': ['data', 'analysis', 'insights', 'metrics', 'performance'],
                'compliance': ['compliance', 'regulation', 'policy', 'audit', 'gdpr'],
                'security': ['security', 'access', 'permission', 'authentication'],
                'scanning': ['scan', 'discovery', 'rule', 'pattern'],
                'catalog': ['catalog', 'asset', 'metadata', 'lineage'],
                'optimization': ['optimize', 'improve', 'efficiency', 'performance'],
                'classification': ['classify', 'sensitive', 'label', 'category']
            }
            
            for message in messages:
                if hasattr(message, 'content') and message.content:
                    content_lower = message.content.lower()
                    for topic, keywords in topic_keywords.items():
                        if any(keyword in content_lower for keyword in keywords):
                            topics.add(topic)
            
            return list(topics)
        except Exception as e:
            logger.error(f"Error analyzing conversation topics: {e}")
            return []
    
    def _calculate_engagement_score(self, messages: List[Any]) -> float:
        """Calculate user engagement score based on conversation patterns"""
        try:
            if not messages:
                return 0.0
            
            score = 0.0
            
            # Message count factor
            message_count = len(messages)
            if message_count >= 10:
                score += 3.0
            elif message_count >= 5:
                score += 2.0
            elif message_count >= 2:
                score += 1.0
            
            # Message length factor
            total_length = sum(len(m.content) for m in messages if hasattr(m, 'content') and m.content)
            avg_length = total_length / len(messages) if messages else 0
            if avg_length > 100:
                score += 2.0
            elif avg_length > 50:
                score += 1.5
            elif avg_length > 20:
                score += 1.0
            
            # Response time factor
            response_times = self._analyze_response_times(messages)
            if response_times:
                avg_response_time = sum(response_times) / len(response_times)
                if avg_response_time < 60:  # Quick responses indicate engagement
                    score += 2.0
                elif avg_response_time < 300:
                    score += 1.0
            
            # Question factor (user asking questions indicates engagement)
            question_count = sum(1 for m in messages if hasattr(m, 'content') and m.content and '?' in m.content)
            if question_count >= 3:
                score += 2.0
            elif question_count >= 1:
                score += 1.0
            
            return min(10.0, score)
            
        except Exception as e:
            logger.error(f"Error calculating engagement score: {e}")
            return 5.0
    
    def _analyze_conversation_sentiment(self, messages: List[Any]) -> float:
        """Analyze conversation sentiment"""
        try:
            if not messages:
                return 0.0
            
            positive_words = ['good', 'great', 'excellent', 'helpful', 'thanks', 'thank you', 'awesome', 'perfect']
            negative_words = ['bad', 'terrible', 'wrong', 'error', 'failed', 'broken', 'useless', 'confused']
            
            positive_count = 0
            negative_count = 0
            total_words = 0
            
            for message in messages:
                if hasattr(message, 'content') and message.content:
                    content_lower = message.content.lower()
                    words = re.findall(r'\b\w+\b', content_lower)
                    total_words += len(words)
                    
                    for word in words:
                        if word in positive_words:
                            positive_count += 1
                        elif word in negative_words:
                            negative_count += 1
            
            if total_words == 0:
                return 0.0
            
            # Calculate sentiment score (-1 to 1)
            sentiment = (positive_count - negative_count) / total_words
            return max(-1.0, min(1.0, sentiment))
            
        except Exception as e:
            logger.error(f"Error analyzing conversation sentiment: {e}")
            return 0.0
    
    def _get_sentiment_label(self, sentiment_score: float) -> str:
        """Get sentiment label from score"""
        if sentiment_score >= 0.3:
            return "Positive"
        elif sentiment_score <= -0.3:
            return "Negative"
        else:
            return "Neutral"
    
    async def get_conversation_metrics(
        self,
        conversation_id: str,
        time_range: Optional[Dict[str, datetime]] = None
    ) -> Dict[str, Any]:
        """Get comprehensive conversation metrics"""
        try:
            if not self.db:
                self.db = get_db()
            
            # Get conversation messages
            query = self.db.query(RacineAIMessage).filter(
                RacineAIMessage.conversation_id == conversation_id
            )
            
            if time_range:
                if time_range.get('start_date'):
                    query = query.filter(RacineAIMessage.created_at >= time_range['start_date'])
                if time_range.get('end_date'):
                    query = query.filter(RacineAIMessage.created_at <= time_range['end_date'])
            
            messages = query.order_by(RacineAIMessage.created_at).all()
            
            if not messages:
                return {
                    "conversation_id": conversation_id,
                    "message_count": 0,
                    "duration_minutes": 0,
                    "avg_response_time_seconds": 0,
                    "user_message_count": 0,
                    "ai_message_count": 0,
                    "engagement_score": 0.0,
                    "sentiment_score": 0.0
                }
            
            # Calculate metrics
            user_messages = [m for m in messages if m.sender_type == "user"]
            ai_messages = [m for m in messages if m.sender_type == "assistant"]
            
            duration_minutes = 0
            if len(messages) >= 2:
                duration = messages[-1].created_at - messages[0].created_at
                duration_minutes = duration.total_seconds() / 60
            
            response_times = self._analyze_response_times(messages)
            avg_response_time = sum(response_times) / len(response_times) if response_times else 0
            
            engagement_score = self._calculate_engagement_score(messages)
            sentiment_score = self._analyze_conversation_sentiment(messages)
            
            return {
                "conversation_id": conversation_id,
                "message_count": len(messages),
                "duration_minutes": duration_minutes,
                "avg_response_time_seconds": avg_response_time,
                "user_message_count": len(user_messages),
                "ai_message_count": len(ai_messages),
                "engagement_score": engagement_score,
                "sentiment_score": sentiment_score,
                "topics": self._analyze_conversation_topics(messages)
            }
            
        except Exception as e:
            logger.error(f"Error getting conversation metrics: {e}")
            return {
                "conversation_id": conversation_id,
                "error": str(e)
            }
    
    async def get_user_conversation_history(
        self,
        user_id: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get user's conversation history with analytics"""
        try:
            if not self.db:
                self.db = get_db()
            
            conversations = self.db.query(RacineAIConversation).filter(
                RacineAIConversation.user_id == user_id
            ).order_by(desc(RacineAIConversation.created_at)).limit(limit).all()
            
            history = []
            for conv in conversations:
                metrics = await self.get_conversation_metrics(str(conv.id))
                history.append({
                    "conversation_id": str(conv.id),
                    "title": conv.title,
                    "conversation_type": conv.conversation_type.value if hasattr(conv.conversation_type, 'value') else str(conv.conversation_type),
                    "created_at": conv.created_at.isoformat() if conv.created_at else None,
                    "last_updated": conv.last_updated.isoformat() if conv.last_updated else None,
                    "metrics": metrics
                })
            
            return history
            
        except Exception as e:
            logger.error(f"Error getting user conversation history: {e}")
            return []

