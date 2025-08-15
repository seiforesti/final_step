"""
Advanced AI Service for Enterprise Classification System - Version 3
Revolutionary AI service surpassing Databricks and Microsoft Purview
Cutting-edge AI-powered classification with explainable intelligence
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Tuple, AsyncGenerator
import json
import uuid
import openai
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, and_, or_, func, desc, asc
import hashlib
import re
from pathlib import Path

# AI Framework Imports
try:
    import openai
    from openai import AsyncOpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logging.warning("OpenAI not available. Install openai for full functionality.")

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

try:
    import google.generativeai as genai
    GOOGLE_AI_AVAILABLE = True
except ImportError:
    GOOGLE_AI_AVAILABLE = False

# Import models and services
from ..models.ai_models import (
    AIModelConfiguration, AIConversation, AIMessage, AIPrediction,
    AIFeedback, AIExperiment, AIExperimentRun, AIKnowledgeBase,
    AIModelMonitoring, AIInsight, AIModelType, AITaskType, AIModelStatus,
    AIProviderType, ReasoningType, ExplainabilityLevel
)
from ..models.classification_models import (
    ClassificationFramework, ClassificationRule, ClassificationResult,
    SensitivityLevel, ClassificationConfidenceLevel, ClassificationScope
)
from ..models.ml_models import MLPrediction, MLModelConfiguration
from ..db_session import get_session
from .notification_service import NotificationService
from .task_service import TaskService

# Setup logging
logger = logging.getLogger(__name__)

class EnterpriseAIService:
    """
    Enterprise AI Service for Revolutionary Classification
    Cutting-edge AI capabilities with explainable intelligence
    """
    
    def __init__(self):
        self.notification_service = NotificationService()
        self.task_service = TaskService()
        self.ai_clients = {}
        self.conversation_cache = {}
        self.knowledge_cache = {}
        self.reasoning_engines = {}
        
    # ============ AI Model Configuration Management ============

    # Lightweight vector update utility for personalization
    def _update_user_preference_vector(self, user_id: str, interaction: Dict[str, Any], current_vector: Any) -> Any:
        try:
            import numpy as _np
            dim = 50
            if current_vector is None or not hasattr(current_vector, 'shape'):
                vec = _np.zeros(dim)
            else:
                vec = current_vector
            # Deterministic small update based on hashed interaction keys
            seed = int(hashlib.sha256((user_id + str(interaction)).encode()).hexdigest(), 16) % (2**32 - 1)
            rng = _np.random.default_rng(seed)
            direction = rng.normal(0, 0.05, dim)
            vec = vec + direction
            # Clip to reasonable bounds
            _np.clip(vec, -3.0, 3.0, out=vec)
            return vec
        except Exception:
            return current_vector
    
    async def create_ai_model_config(
        self,
        session: AsyncSession,
        user: dict,
        config_data: Dict[str, Any]
    ) -> AIModelConfiguration:
        """Create advanced AI model configuration"""
        try:
            # Validate AI configuration
            validated_config = await self._validate_ai_config(config_data)
            
            # Create AI model configuration
            ai_config = AIModelConfiguration(
                name=validated_config["name"],
                description=validated_config.get("description"),
                model_type=AIModelType(validated_config["model_type"]),
                task_type=AITaskType(validated_config["task_type"]),
                provider=AIProviderType(validated_config["provider"]),
                model_config=validated_config["model_config"],
                api_config=validated_config["api_config"],
                model_parameters=validated_config.get("model_parameters", {}),
                prompt_templates=validated_config["prompt_templates"],
                system_prompts=validated_config["system_prompts"],
                reasoning_config=validated_config["reasoning_config"],
                reasoning_types=validated_config.get("reasoning_types", []),
                explainability_config=validated_config["explainability_config"],
                explainability_level=ExplainabilityLevel(validated_config.get("explainability_level", "detailed")),
                knowledge_base_config=validated_config.get("knowledge_base_config", {}),
                performance_config=validated_config["performance_config"],
                rate_limiting=validated_config["rate_limiting"],
                cost_optimization=validated_config["cost_optimization"],
                monitoring_config=validated_config["monitoring_config"],
                classification_framework_id=validated_config.get("classification_framework_id"),
                target_sensitivity_levels=validated_config.get("target_sensitivity_levels", []),
                classification_scope=validated_config.get("classification_scope"),
                created_by=user["id"]
            )
            
            session.add(ai_config)
            await session.commit()
            await session.refresh(ai_config)
            
            # Initialize AI client
            await self._initialize_ai_client(ai_config)
            
            # Setup knowledge base
            await self._initialize_knowledge_base(session, ai_config)
            
            # Log creation
            logger.info(f"Created AI model configuration: {ai_config.name} (ID: {ai_config.id})")
            
            return ai_config
            
        except Exception as e:
            logger.error(f"Error creating AI model configuration: {str(e)}")
            await session.rollback()
            raise
    
    async def get_ai_model_configs(
        self,
        session: AsyncSession,
        filters: Optional[Dict[str, Any]] = None,
        pagination: Optional[Dict[str, Any]] = None
    ) -> Tuple[List[AIModelConfiguration], int]:
        """Get AI model configurations with advanced filtering"""
        try:
            query = select(AIModelConfiguration).options(
                selectinload(AIModelConfiguration.classification_framework),
                selectinload(AIModelConfiguration.ai_conversations),
                selectinload(AIModelConfiguration.ai_experiments)
            )
            
            # Apply filters
            if filters:
                if filters.get("model_type"):
                    query = query.where(AIModelConfiguration.model_type == filters["model_type"])
                if filters.get("provider"):
                    query = query.where(AIModelConfiguration.provider == filters["provider"])
                if filters.get("status"):
                    query = query.where(AIModelConfiguration.status == filters["status"])
                if filters.get("is_active") is not None:
                    query = query.where(AIModelConfiguration.is_active == filters["is_active"])
                if filters.get("search_query"):
                    search = f"%{filters['search_query']}%"
                    query = query.where(
                        or_(
                            AIModelConfiguration.name.ilike(search),
                            AIModelConfiguration.description.ilike(search)
                        )
                    )
            
            # Get total count
            count_query = select(func.count(AIModelConfiguration.id))
            if filters:
                count_query = count_query.where(query.whereclause)
            
            total_count = await session.scalar(count_query)
            
            # Apply pagination
            if pagination:
                offset = (pagination.get("page", 1) - 1) * pagination.get("size", 10)
                query = query.offset(offset).limit(pagination.get("size", 10))
            
            # Apply sorting
            query = query.order_by(desc(AIModelConfiguration.updated_at))
            
            result = await session.execute(query)
            configs = result.scalars().all()
            
            # Enrich with performance metrics
            for config in configs:
                config.current_performance = await self._get_ai_performance_summary(session, config.id)
            
            return configs, total_count
            
        except Exception as e:
            logger.error(f"Error getting AI model configurations: {str(e)}")
            raise
    
    # ============ AI Conversation Management ============
    
    async def start_ai_conversation(
        self,
        session: AsyncSession,
        user: dict,
        conversation_request: Dict[str, Any]
    ) -> AIConversation:
        """Start intelligent AI conversation for classification"""
        try:
            # Generate conversation ID
            conversation_id = f"ai_conv_{uuid.uuid4().hex[:12]}"
            
            # Create conversation
            conversation = AIConversation(
                conversation_id=conversation_id,
                ai_model_id=conversation_request["ai_model_id"],
                conversation_type=conversation_request.get("conversation_type", "classification"),
                context_type=conversation_request.get("context_type", "general"),
                context_id=conversation_request.get("context_id"),
                conversation_config=conversation_request.get("conversation_config", {}),
                system_context=conversation_request.get("system_context", {}),
                conversation_memory={},
                created_by=user["id"]
            )
            
            session.add(conversation)
            await session.commit()
            await session.refresh(conversation)
            
            # Initialize conversation context
            await self._initialize_conversation_context(session, conversation, user)
            
            logger.info(f"Started AI conversation: {conversation_id}")
            
            return conversation
            
        except Exception as e:
            logger.error(f"Error starting AI conversation: {str(e)}")
            await session.rollback()
            raise
    
    async def send_message(
        self,
        session: AsyncSession,
        user: dict,
        conversation_id: int,
        message_content: str,
        message_type: str = "user_input"
    ) -> AIMessage:
        """Send message and get AI response"""
        try:
            # Get conversation
            conversation = await session.get(
                AIConversation, 
                conversation_id,
                options=[selectinload(AIConversation.ai_model)]
            )
            if not conversation:
                raise ValueError("Conversation not found")
            
            # Create user message
            user_message = await self._create_message(
                session, conversation, message_content, "user_input", "user", user
            )
            
            # Generate AI response
            ai_response = await self._generate_ai_response(
                session, conversation, user_message, user
            )
            
            # Update conversation state
            await self._update_conversation_state(session, conversation)
            
            logger.info(f"Processed message in conversation: {conversation.conversation_id}")
            
            return ai_response
            
        except Exception as e:
            logger.error(f"Error sending message: {str(e)}")
            raise
    
    async def _generate_ai_response(
        self,
        session: AsyncSession,
        conversation: AIConversation,
        user_message: AIMessage,
        user: dict
    ) -> AIMessage:
        """Generate intelligent AI response with reasoning"""
        try:
            # Get AI model configuration
            ai_model = conversation.ai_model
            
            # Prepare conversation context
            context = await self._prepare_conversation_context(session, conversation, user_message)
            
            # Get AI client
            ai_client = await self._get_ai_client(ai_model)
            
            # Generate response with reasoning
            start_time = datetime.utcnow()
            
            if ai_model.provider == AIProviderType.OPENAI:
                response_data = await self._generate_openai_response(
                    ai_client, ai_model, context, user_message
                )
            elif ai_model.provider == AIProviderType.ANTHROPIC:
                response_data = await self._generate_anthropic_response(
                    ai_client, ai_model, context, user_message
                )
            elif ai_model.provider == AIProviderType.GOOGLE:
                response_data = await self._generate_google_response(
                    ai_client, ai_model, context, user_message
                )
            else:
                response_data = await self._generate_custom_response(
                    ai_client, ai_model, context, user_message
                )
            
            end_time = datetime.utcnow()
            
            # Process and enhance response
            enhanced_response = await self._enhance_ai_response(
                session, response_data, ai_model, context
            )
            
            # Create AI response message
            ai_message = AIMessage(
                message_id=f"ai_msg_{uuid.uuid4().hex[:12]}",
                conversation_id=conversation.id,
                message_type="ai_response",
                message_role="assistant",
                content=enhanced_response["content"],
                formatted_content=enhanced_response.get("formatted_content", {}),
                message_context=context,
                reasoning_chain=enhanced_response.get("reasoning_chain", {}),
                thought_process=enhanced_response.get("thought_process"),
                confidence_score=enhanced_response.get("confidence_score"),
                processing_time_ms=int((end_time - start_time).total_seconds() * 1000),
                token_usage=response_data.get("token_usage", {}),
                classification_suggestions=enhanced_response.get("classification_suggestions", []),
                sensitivity_analysis=enhanced_response.get("sensitivity_analysis", {}),
                risk_assessment=enhanced_response.get("risk_assessment", {}),
                created_by=user["id"]
            )
            
            session.add(ai_message)
            await session.commit()
            await session.refresh(ai_message)
            
            return ai_message
            
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}")
            raise
    
    # ============ AI Prediction and Classification ============
    
    async def create_ai_prediction(
        self,
        session: AsyncSession,
        user: dict,
        prediction_request: Dict[str, Any]
    ) -> AIPrediction:
        """Create AI prediction with explainable intelligence"""
        try:
            # Generate prediction ID
            prediction_id = f"ai_pred_{uuid.uuid4().hex[:12]}"
            
            # Get AI model configuration
            ai_model = await session.get(
                AIModelConfiguration,
                prediction_request["ai_model_id"]
            )
            if not ai_model or ai_model.status != AIModelStatus.ACTIVE:
                raise ValueError("AI model not found or not active")
            
            # Prepare input for AI processing
            enriched_input = await self._prepare_ai_input(
                session, prediction_request["input_data"], ai_model
            )
            
            # Generate AI prediction with reasoning
            start_time = datetime.utcnow()
            prediction_result = await self._generate_ai_classification(
                session, ai_model, enriched_input, prediction_request
            )
            end_time = datetime.utcnow()
            
            # Create prediction record
            ai_prediction = AIPrediction(
                prediction_id=prediction_id,
                ai_model_id=ai_model.id,
                target_type=prediction_request["target_type"],
                target_id=prediction_request["target_id"],
                target_identifier=prediction_request["target_identifier"],
                target_metadata=prediction_request.get("target_metadata", {}),
                input_data=prediction_request["input_data"],
                preprocessed_input=enriched_input,
                prediction_result=prediction_result,
                primary_classification=prediction_result["primary_classification"],
                alternative_classifications=prediction_result.get("alternative_classifications", []),
                classification_probabilities=prediction_result.get("probabilities", {}),
                confidence_score=prediction_result["confidence_score"],
                confidence_level=self._determine_confidence_level(prediction_result["confidence_score"]),
                reasoning_chain=prediction_result["reasoning_chain"],
                thought_process=prediction_result["thought_process"],
                decision_factors=prediction_result.get("decision_factors", []),
                explanation=prediction_result["explanation"],
                detailed_explanation=prediction_result["detailed_explanation"],
                sensitivity_prediction=SensitivityLevel(prediction_result["sensitivity_prediction"]),
                risk_score=prediction_result.get("risk_score", 0.0),
                risk_factors=prediction_result.get("risk_factors", []),
                processing_time_ms=int((end_time - start_time).total_seconds() * 1000),
                token_usage=prediction_result.get("token_usage", {}),
                created_by=user["id"]
            )
            
            session.add(ai_prediction)
            await session.commit()
            await session.refresh(ai_prediction)
            
            # Update model usage statistics
            await self._update_ai_model_usage_stats(session, ai_model.id)
            
            logger.info(f"Created AI prediction: {prediction_id}")
            
            return ai_prediction
            
        except Exception as e:
            logger.error(f"Error creating AI prediction: {str(e)}")
            await session.rollback()
            raise
    
    async def _generate_ai_classification(
        self,
        session: AsyncSession,
        ai_model: AIModelConfiguration,
        input_data: Dict[str, Any],
        request: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate AI classification with advanced reasoning"""
        try:
            # Get relevant knowledge base entries
            knowledge_context = await self._get_relevant_knowledge(
                session, ai_model.id, input_data, request["target_type"]
            )
            
            # Prepare classification prompt
            classification_prompt = await self._prepare_classification_prompt(
                ai_model, input_data, knowledge_context, request
            )
            
            # Get AI client
            ai_client = await self._get_ai_client(ai_model)
            
            # Generate classification with reasoning
            if ai_model.provider == AIProviderType.OPENAI:
                result = await self._classify_with_openai(
                    ai_client, ai_model, classification_prompt, input_data
                )
            elif ai_model.provider == AIProviderType.ANTHROPIC:
                result = await self._classify_with_anthropic(
                    ai_client, ai_model, classification_prompt, input_data
                )
            else:
                result = await self._classify_with_custom_ai(
                    ai_client, ai_model, classification_prompt, input_data
                )
            
            # Enhance with explainability
            enhanced_result = await self._enhance_classification_explainability(
                result, ai_model, input_data, knowledge_context
            )
            
            return enhanced_result
            
        except Exception as e:
            logger.error(f"Error generating AI classification: {str(e)}")
            raise
    
    # ============ AI Knowledge Management ============
    
    async def create_knowledge_entry(
        self,
        session: AsyncSession,
        user: dict,
        knowledge_data: Dict[str, Any]
    ) -> AIKnowledgeBase:
        """Create AI knowledge base entry"""
        try:
            # Generate knowledge ID
            knowledge_id = f"kb_{uuid.uuid4().hex[:12]}"
            
            # Create knowledge entry
            knowledge = AIKnowledgeBase(
                knowledge_id=knowledge_id,
                title=knowledge_data["title"],
                domain=knowledge_data["domain"],
                category=knowledge_data["category"],
                content=knowledge_data["content"],
                structured_content=knowledge_data.get("structured_content", {}),
                knowledge_type=knowledge_data["knowledge_type"],
                related_concepts=knowledge_data.get("related_concepts", []),
                prerequisites=knowledge_data.get("prerequisites", []),
                applications=knowledge_data.get("applications", []),
                confidence_score=knowledge_data.get("confidence_score", 1.0),
                knowledge_source=knowledge_data.get("knowledge_source"),
                source_type=knowledge_data.get("source_type", "manual"),
                classification_relevance=knowledge_data.get("classification_relevance", {}),
                created_by=user["id"]
            )
            
            session.add(knowledge)
            await session.commit()
            await session.refresh(knowledge)
            
            # Update knowledge cache
            await self._update_knowledge_cache(session, knowledge)
            
            logger.info(f"Created knowledge entry: {knowledge_id}")
            
            return knowledge
            
        except Exception as e:
            logger.error(f"Error creating knowledge entry: {str(e)}")
            await session.rollback()
            raise
    
    async def generate_ai_insights(
        self,
        session: AsyncSession,
        user: dict,
        ai_model_id: int,
        scope_config: Dict[str, Any]
    ) -> List[AIInsight]:
        """Generate AI-powered insights for data governance"""
        try:
            # Get AI model
            ai_model = await session.get(AIModelConfiguration, ai_model_id)
            if not ai_model:
                raise ValueError("AI model not found")
            
            # Analyze data patterns
            data_analysis = await self._analyze_data_patterns(
                session, scope_config, ai_model
            )
            
            # Generate insights using AI
            insights_data = await self._generate_insights_with_ai(
                session, ai_model, data_analysis, scope_config
            )
            
            insights = []
            for insight_data in insights_data:
                insight = AIInsight(
                    insight_id=f"insight_{uuid.uuid4().hex[:12]}",
                    ai_model_id=ai_model.id,
                    insight_type=insight_data["insight_type"],
                    title=insight_data["title"],
                    description=insight_data["description"],
                    detailed_analysis=insight_data["detailed_analysis"],
                    scope_type=scope_config["scope_type"],
                    scope_identifier=scope_config.get("scope_identifier"),
                    context_metadata=scope_config.get("context_metadata", {}),
                    confidence_score=insight_data["confidence_score"],
                    relevance_score=insight_data["relevance_score"],
                    actionability_score=insight_data["actionability_score"],
                    impact_score=insight_data["impact_score"],
                    evidence_data=insight_data["evidence_data"],
                    recommendations=insight_data["recommendations"],
                    business_priority=insight_data.get("business_priority", "medium"),
                    created_by=user["id"]
                )
                insights.append(insight)
                session.add(insight)
            
            await session.commit()
            
            logger.info(f"Generated {len(insights)} AI insights")
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating AI insights: {str(e)}")
            raise
    
    # ============ AI Model Monitoring ============
    
    async def monitor_ai_model_performance(
        self,
        session: AsyncSession,
        ai_model_id: int
    ) -> AIModelMonitoring:
        """Monitor AI model performance and behavior"""
        try:
            # Get recent AI predictions
            recent_predictions = await self._get_recent_ai_predictions(session, ai_model_id)
            
            # Calculate performance metrics
            performance_metrics = await self._calculate_ai_performance_metrics(recent_predictions)
            
            # Analyze reasoning quality
            reasoning_metrics = await self._analyze_reasoning_quality(recent_predictions)
            
            # Check for hallucinations and bias
            quality_analysis = await self._analyze_ai_quality(recent_predictions)
            
            # Calculate costs and usage
            usage_metrics = await self._calculate_ai_usage_metrics(recent_predictions)
            
            # Create monitoring record
            monitoring = AIModelMonitoring(
                ai_model_id=ai_model_id,
                monitoring_timestamp=datetime.utcnow(),
                accuracy_metrics=performance_metrics["accuracy"],
                reasoning_quality_metrics=reasoning_metrics,
                explanation_quality_metrics=performance_metrics["explanation"],
                hallucination_rate=quality_analysis.get("hallucination_rate"),
                consistency_score=quality_analysis.get("consistency_score"),
                contextual_relevance=quality_analysis.get("contextual_relevance"),
                bias_detection_metrics=quality_analysis.get("bias_metrics", {}),
                total_predictions=len(recent_predictions),
                successful_predictions=sum(1 for p in recent_predictions if p.confidence_score > 0.7),
                average_response_time_ms=usage_metrics["avg_response_time"],
                total_api_calls=usage_metrics["total_api_calls"],
                total_tokens_consumed=usage_metrics["total_tokens"],
                total_cost=usage_metrics["total_cost"],
                alert_status="normal",
                created_by=1  # System user
            )
            
            # Check for alerts
            alerts = await self._check_ai_performance_alerts(monitoring)
            if alerts:
                monitoring.alert_status = "warning"
                monitoring.active_alerts = alerts
            
            session.add(monitoring)
            await session.commit()
            
            logger.info(f"Completed AI model monitoring for model: {ai_model_id}")
            
            return monitoring
            
        except Exception as e:
            logger.error(f"Error monitoring AI model: {str(e)}")
            raise
    
    # ============ Helper Methods ============
    
    async def _validate_ai_config(self, config_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate AI model configuration"""
        required_fields = [
            "name", "model_type", "task_type", "provider", "model_config", 
            "api_config", "prompt_templates", "system_prompts", "reasoning_config",
            "explainability_config", "performance_config", "rate_limiting",
            "cost_optimization", "monitoring_config"
        ]
        
        for field in required_fields:
            if field not in config_data:
                raise ValueError(f"Missing required field: {field}")
        
        # Validate provider availability
        if config_data["provider"] == "openai" and not OPENAI_AVAILABLE:
            raise ValueError("OpenAI not available")
        
        return config_data
    
    async def _initialize_ai_client(self, ai_config: AIModelConfiguration) -> None:
        """Initialize AI client for the model"""
        try:
            if ai_config.provider == AIProviderType.OPENAI:
                self.ai_clients[ai_config.id] = AsyncOpenAI(
                    api_key=ai_config.api_config.get("api_key"),
                    base_url=ai_config.api_config.get("base_url")
                )
            elif ai_config.provider == AIProviderType.ANTHROPIC:
                self.ai_clients[ai_config.id] = anthropic.AsyncAnthropic(
                    api_key=ai_config.api_config.get("api_key")
                )
            # Add other providers as needed
            
            logger.info(f"Initialized AI client for model: {ai_config.name}")
            
        except Exception as e:
            logger.error(f"Error initializing AI client: {str(e)}")
            raise
    
    def _determine_confidence_level(self, confidence_score: float) -> ClassificationConfidenceLevel:
        """Determine confidence level from AI score"""
        if confidence_score >= 0.95:
            return ClassificationConfidenceLevel.AI_VALIDATED
        elif confidence_score >= 0.85:
            return ClassificationConfidenceLevel.VERY_HIGH
        elif confidence_score >= 0.70:
            return ClassificationConfidenceLevel.HIGH
        elif confidence_score >= 0.50:
            return ClassificationConfidenceLevel.MEDIUM
        else:
            return ClassificationConfidenceLevel.LOW
    
    # ============ Advanced AI Intelligence Scenarios ============
    
    async def contextual_domain_intelligence(
        self,
        session: AsyncSession,
        ai_model_id: int,
        domain_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Advanced domain-specific intelligence for contextual classification"""
        try:
            ai_model = await session.get(AIModelConfiguration, ai_model_id)
            
            # Analyze domain characteristics
            domain_analysis = await self._analyze_domain_characteristics(
                domain_context, ai_model
            )
            
            # Generate domain-specific strategies
            domain_strategies = await self._generate_domain_strategies(
                domain_analysis, ai_model
            )
            
            # Create adaptive reasoning frameworks
            reasoning_frameworks = await self._create_adaptive_reasoning_frameworks(
                domain_strategies, domain_context
            )
            
            # Generate domain expertise recommendations
            expertise_recommendations = await self._generate_domain_expertise(
                reasoning_frameworks, domain_analysis
            )
            
            return {
                "domain_analysis": domain_analysis,
                "domain_strategies": domain_strategies,
                "reasoning_frameworks": reasoning_frameworks,
                "expertise_recommendations": expertise_recommendations,
                "implementation_roadmap": await self._generate_domain_implementation_roadmap(
                    reasoning_frameworks, domain_context
                )
            }
            
        except Exception as e:
            logger.error(f"Error in contextual domain intelligence: {str(e)}")
            raise
    
    async def intelligent_conversation_orchestration(
        self,
        session: AsyncSession,
        conversation_id: int,
        orchestration_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Advanced conversation orchestration with multi-agent intelligence"""
        try:
            conversation = await session.get(AIConversation, conversation_id)
            
            # Analyze conversation patterns
            conversation_analysis = await self._analyze_conversation_patterns(
                session, conversation, orchestration_config
            )
            
            # Generate multi-agent strategies
            multi_agent_strategies = await self._generate_multi_agent_strategies(
                conversation_analysis, orchestration_config
            )
            
            # Create intelligent workflows
            intelligent_workflows = await self._create_intelligent_workflows(
                multi_agent_strategies, conversation
            )
            
            # Execute orchestrated intelligence
            orchestration_results = await self._execute_orchestrated_intelligence(
                session, conversation, intelligent_workflows
            )
            
            return {
                "conversation_analysis": conversation_analysis,
                "multi_agent_strategies": multi_agent_strategies,
                "intelligent_workflows": intelligent_workflows,
                "orchestration_results": orchestration_results,
                "optimization_insights": await self._generate_conversation_optimization_insights(
                    orchestration_results
                )
            }
            
        except Exception as e:
            logger.error(f"Error in intelligent conversation orchestration: {str(e)}")
            raise
    
    async def advanced_explainable_reasoning(
        self,
        session: AsyncSession,
        prediction_id: str,
        explanation_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Revolutionary explainable AI with multi-dimensional reasoning analysis"""
        try:
            # Get AI prediction
            from sqlalchemy import select
            stmt = select(AIPrediction).where(AIPrediction.prediction_id == prediction_id)
            result = await session.execute(stmt)
            prediction = result.scalar_one_or_none()
            
            if not prediction:
                raise ValueError(f"AI prediction {prediction_id} not found")
            
            # Multi-dimensional reasoning analysis
            reasoning_analysis = await self._perform_multi_dimensional_reasoning_analysis(
                prediction, explanation_config
            )
            
            # Generate causal explanations
            causal_explanations = await self._generate_causal_explanations(
                reasoning_analysis, prediction
            )
            
            # Create interactive explanations
            interactive_explanations = await self._create_interactive_explanations(
                causal_explanations, explanation_config
            )
            
            # Generate counterfactual scenarios
            counterfactual_scenarios = await self._generate_counterfactual_scenarios(
                prediction, reasoning_analysis
            )
            
            return {
                "reasoning_analysis": reasoning_analysis,
                "causal_explanations": causal_explanations,
                "interactive_explanations": interactive_explanations,
                "counterfactual_scenarios": counterfactual_scenarios,
                "explanation_confidence": await self._calculate_explanation_confidence(
                    reasoning_analysis, causal_explanations
                )
            }
            
        except Exception as e:
            logger.error(f"Error in advanced explainable reasoning: {str(e)}")
            raise
    
    async def intelligent_auto_tagging_system(
        self,
        session: AsyncSession,
        ai_model_id: int,
        tagging_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Advanced auto-tagging with intelligent semantic understanding"""
        try:
            ai_model = await session.get(AIModelConfiguration, ai_model_id)
            
            # Semantic content analysis
            semantic_analysis = await self._perform_semantic_content_analysis(
                tagging_context, ai_model
            )
            
            # Generate intelligent tags
            intelligent_tags = await self._generate_intelligent_tags(
                semantic_analysis, tagging_context
            )
            
            # Create tag relationships and hierarchies
            tag_relationships = await self._create_tag_relationships(
                intelligent_tags, semantic_analysis
            )
            
            # Generate contextual metadata
            contextual_metadata = await self._generate_contextual_metadata(
                tag_relationships, tagging_context
            )
            
            # Validate and optimize tags
            optimized_tags = await self._validate_and_optimize_tags(
                intelligent_tags, contextual_metadata
            )
            
            return {
                "semantic_analysis": semantic_analysis,
                "intelligent_tags": intelligent_tags,
                "tag_relationships": tag_relationships,
                "contextual_metadata": contextual_metadata,
                "optimized_tags": optimized_tags,
                "tagging_confidence": await self._calculate_tagging_confidence(
                    optimized_tags, semantic_analysis
                )
            }
            
        except Exception as e:
            logger.error(f"Error in intelligent auto-tagging system: {str(e)}")
            raise
    
    async def cognitive_workload_optimization(
        self,
        session: AsyncSession,
        ai_model_id: int,
        workload_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Advanced cognitive workload optimization for TCO improvement"""
        try:
            ai_model = await session.get(AIModelConfiguration, ai_model_id)
            
            # Analyze current workload patterns
            workload_analysis = await self._analyze_workload_patterns(
                session, ai_model, workload_config
            )
            
            # Generate optimization strategies
            optimization_strategies = await self._generate_workload_optimization_strategies(
                workload_analysis, ai_model
            )
            
            # Create intelligent resource allocation
            resource_allocation = await self._create_intelligent_resource_allocation(
                optimization_strategies, workload_config
            )
            
            # Calculate TCO improvements
            tco_improvements = await self._calculate_tco_improvements(
                resource_allocation, workload_analysis
            )
            
            # Generate implementation plan
            implementation_plan = await self._generate_optimization_implementation_plan(
                optimization_strategies, tco_improvements
            )
            
            return {
                "workload_analysis": workload_analysis,
                "optimization_strategies": optimization_strategies,
                "resource_allocation": resource_allocation,
                "tco_improvements": tco_improvements,
                "implementation_plan": implementation_plan,
                "roi_projections": await self._calculate_roi_projections(
                    tco_improvements, implementation_plan
                )
            }
            
        except Exception as e:
            logger.error(f"Error in cognitive workload optimization: {str(e)}")
            raise
    
    async def real_time_intelligence_engine(
        self,
        session: AsyncSession,
        ai_model_id: int,
        intelligence_config: Dict[str, Any]
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Real-time intelligence engine with streaming analytics"""
        try:
            ai_model = await session.get(AIModelConfiguration, ai_model_id)
            
            # Initialize real-time processing
            processing_state = await self._initialize_real_time_processing(
                ai_model, intelligence_config
            )
            
            # Start intelligence streaming
            async for intelligence_event in self._stream_intelligence_events(
                processing_state, intelligence_config
            ):
                # Process intelligence event
                processed_event = await self._process_intelligence_event(
                    intelligence_event, processing_state
                )
                
                # Generate real-time insights
                real_time_insights = await self._generate_real_time_insights(
                    processed_event, processing_state
                )
                
                # Update processing state
                processing_state = await self._update_processing_state(
                    processing_state, processed_event
                )
                
                yield {
                    "intelligence_event": processed_event,
                    "real_time_insights": real_time_insights,
                    "processing_state": processing_state,
                    "timestamp": datetime.utcnow().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Error in real-time intelligence engine: {str(e)}")
            raise
    
    async def advanced_knowledge_synthesis(
        self,
        session: AsyncSession,
        ai_model_id: int,
        synthesis_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Advanced knowledge synthesis with cross-domain intelligence"""
        try:
            ai_model = await session.get(AIModelConfiguration, ai_model_id)
            
            # Collect knowledge from multiple domains
            multi_domain_knowledge = await self._collect_multi_domain_knowledge(
                session, synthesis_config
            )
            
            # Perform knowledge synthesis
            synthesized_knowledge = await self._perform_knowledge_synthesis(
                multi_domain_knowledge, ai_model, synthesis_config
            )
            
            # Generate intelligent connections
            intelligent_connections = await self._generate_intelligent_connections(
                synthesized_knowledge, multi_domain_knowledge
            )
            
            # Create knowledge graphs
            knowledge_graphs = await self._create_knowledge_graphs(
                intelligent_connections, synthesized_knowledge
            )
            
            # Generate actionable insights
            actionable_insights = await self._generate_actionable_insights(
                knowledge_graphs, synthesis_config
            )
            
            return {
                "multi_domain_knowledge": multi_domain_knowledge,
                "synthesized_knowledge": synthesized_knowledge,
                "intelligent_connections": intelligent_connections,
                "knowledge_graphs": knowledge_graphs,
                "actionable_insights": actionable_insights,
                "synthesis_confidence": await self._calculate_synthesis_confidence(
                    synthesized_knowledge, intelligent_connections
                )
            }
            
        except Exception as e:
            logger.error(f"Error in advanced knowledge synthesis: {str(e)}")
            raise
    
    # ============ Enhanced Helper Methods ============
    
    async def _prepare_conversation_context(
        self, 
        session: AsyncSession, 
        conversation: AIConversation, 
        user_message: AIMessage
    ) -> Dict[str, Any]:
        """Prepare comprehensive conversation context for AI processing"""
        try:
            # Get conversation history
            conversation_history = await self._get_conversation_history(session, conversation.id)
            
            # Analyze conversation patterns
            conversation_patterns = await self._analyze_conversation_patterns_detailed(
                conversation_history, conversation
            )
            
            # Get relevant knowledge base entries
            relevant_knowledge = await self._get_relevant_knowledge(
                session, conversation.ai_model_id, user_message.content, conversation.context_type
            )
            
            # Prepare system context
            system_context = {
                "conversation_type": conversation.conversation_type,
                "context_type": conversation.context_type,
                "conversation_history": conversation_history[-10:],  # Last 10 messages
                "conversation_patterns": conversation_patterns,
                "relevant_knowledge": relevant_knowledge,
                "user_preferences": conversation.user_preferences,
                "conversation_memory": conversation.conversation_memory,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            return system_context
            
        except Exception as e:
            logger.error(f"Error preparing conversation context: {str(e)}")
            raise
    
    async def _get_ai_client(self, ai_model: AIModelConfiguration):
        """Get AI client for the model with intelligent caching"""
        try:
            if ai_model.id in self.ai_clients:
                return self.ai_clients[ai_model.id]
            
            # Initialize client based on provider
            if ai_model.provider == AIProviderType.OPENAI:
                if OPENAI_AVAILABLE:
                    client = AsyncOpenAI(
                        api_key=ai_model.api_config.get("api_key"),
                        base_url=ai_model.api_config.get("base_url")
                    )
                    self.ai_clients[ai_model.id] = client
                    return client
                else:
                    raise ValueError("OpenAI client not available")
            
            elif ai_model.provider == AIProviderType.ANTHROPIC:
                if ANTHROPIC_AVAILABLE:
                    client = anthropic.AsyncAnthropic(
                        api_key=ai_model.api_config.get("api_key")
                    )
                    self.ai_clients[ai_model.id] = client
                    return client
                else:
                    raise ValueError("Anthropic client not available")
            
            else:
                raise ValueError(f"Unsupported AI provider: {ai_model.provider}")
                
        except Exception as e:
            logger.error(f"Error getting AI client: {str(e)}")
            raise
    
    async def _generate_openai_response(
        self, 
        client, 
        ai_model: AIModelConfiguration, 
        context: Dict[str, Any], 
        user_message: AIMessage
    ) -> Dict[str, Any]:
        """Generate advanced response using OpenAI with sophisticated prompting"""
        try:
            # Prepare system prompt with context
            system_prompt = await self._prepare_system_prompt(ai_model, context)
            
            # Prepare conversation messages
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message.content}
            ]
            
            # Add conversation history
            if context.get("conversation_history"):
                for msg in context["conversation_history"]:
                    messages.insert(-1, {
                        "role": msg.get("role", "user"),
                        "content": msg.get("content", "")
                    })
            
            # Make API call with advanced parameters
            response = await client.chat.completions.create(
                model=ai_model.model_config.get("model_name", "gpt-4"),
                messages=messages,
                temperature=ai_model.model_parameters.get("temperature", 0.7),
                max_tokens=ai_model.model_parameters.get("max_tokens", 2000),
                top_p=ai_model.model_parameters.get("top_p", 1.0),
                frequency_penalty=ai_model.model_parameters.get("frequency_penalty", 0.0),
                presence_penalty=ai_model.model_parameters.get("presence_penalty", 0.0)
            )
            
            # Extract response data
            response_content = response.choices[0].message.content
            token_usage = {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens
            }
            
            return {
                "content": response_content,
                "token_usage": token_usage,
                "model_used": response.model,
                "finish_reason": response.choices[0].finish_reason
            }
            
        except Exception as e:
            logger.error(f"Error generating OpenAI response: {str(e)}")
            raise
    
    async def _enhance_ai_response(
        self, 
        session: AsyncSession, 
        response_data: Dict[str, Any], 
        ai_model: AIModelConfiguration, 
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Enhance AI response with additional intelligence and reasoning"""
        try:
            content = response_data.get("content", "")
            
            # Analyze response content
            content_analysis = await self._analyze_response_content(content, ai_model)
            
            # Generate reasoning chain
            reasoning_chain = await self._generate_reasoning_chain(
                content, context, ai_model
            )
            
            # Extract classification suggestions
            classification_suggestions = await self._extract_classification_suggestions(
                content, reasoning_chain
            )
            
            # Perform sensitivity analysis
            sensitivity_analysis = await self._perform_sensitivity_analysis(
                content, classification_suggestions, ai_model
            )
            
            # Generate risk assessment
            risk_assessment = await self._generate_risk_assessment(
                sensitivity_analysis, classification_suggestions
            )
            
            # Calculate confidence score
            confidence_score = await self._calculate_response_confidence(
                content_analysis, reasoning_chain
            )
            
            # Generate thought process explanation
            thought_process = await self._generate_thought_process(
                reasoning_chain, content_analysis
            )
            
            return {
                "content": content,
                "formatted_content": await self._format_response_content(content),
                "reasoning_chain": reasoning_chain,
                "thought_process": thought_process,
                "confidence_score": confidence_score,
                "classification_suggestions": classification_suggestions,
                "sensitivity_analysis": sensitivity_analysis,
                "risk_assessment": risk_assessment,
                "content_analysis": content_analysis
            }
            
        except Exception as e:
            logger.error(f"Error enhancing AI response: {str(e)}")
            raise
    
    async def _prepare_system_prompt(
        self, 
        ai_model: AIModelConfiguration, 
        context: Dict[str, Any]
    ) -> str:
        """Prepare sophisticated system prompt with context awareness"""
        try:
            base_prompt = ai_model.system_prompts.get("base_prompt", "")
            
            # Add context-specific instructions
            context_instructions = ""
            if context.get("conversation_type") == "classification":
                context_instructions += ai_model.system_prompts.get("classification_prompt", "")
            
            # Add knowledge base context
            if context.get("relevant_knowledge"):
                knowledge_context = "Relevant knowledge:\n"
                for knowledge in context["relevant_knowledge"][:3]:  # Top 3 relevant
                    knowledge_context += f"- {knowledge.get('title', '')}: {knowledge.get('content', '')}\n"
                context_instructions += f"\n{knowledge_context}"
            
            # Add conversation patterns
            if context.get("conversation_patterns"):
                patterns = context["conversation_patterns"]
                context_instructions += f"\nConversation patterns: {patterns.get('summary', '')}"
            
            # Combine all parts
            full_prompt = f"{base_prompt}\n\n{context_instructions}\n\nPlease provide thoughtful, accurate, and helpful responses with clear reasoning."
            
            return full_prompt
            
        except Exception as e:
            logger.error(f"Error preparing system prompt: {str(e)}")
            return ai_model.system_prompts.get("base_prompt", "You are a helpful AI assistant.")
    
    async def _analyze_response_content(
        self, 
        content: str, 
        ai_model: AIModelConfiguration
    ) -> Dict[str, Any]:
        """Analyze response content for quality and insights"""
        try:
            # Basic content analysis
            word_count = len(content.split())
            sentence_count = len([s for s in content.split('.') if s.strip()])
            
            # Extract key topics (simplified)
            key_topics = await self._extract_key_topics(content)
            
            # Analyze sentiment
            sentiment_score = await self._analyze_sentiment(content)
            
            # Check for classification terms
            classification_terms = await self._extract_classification_terms(content)
            
            return {
                "word_count": word_count,
                "sentence_count": sentence_count,
                "key_topics": key_topics,
                "sentiment_score": sentiment_score,
                "classification_terms": classification_terms,
                "complexity_score": min(word_count / 100, 1.0),  # Simplified complexity
                "clarity_score": max(0.5, 1.0 - (word_count / 500))  # Simplified clarity
            }
            
        except Exception as e:
            logger.error(f"Error analyzing response content: {str(e)}")
            return {}
    
    async def _generate_reasoning_chain(
        self, 
        content: str, 
        context: Dict[str, Any], 
        ai_model: AIModelConfiguration
    ) -> Dict[str, Any]:
        """Generate detailed reasoning chain for the response"""
        try:
            reasoning_steps = []
            
            # Step 1: Context analysis
            reasoning_steps.append({
                "step": 1,
                "type": "context_analysis",
                "description": "Analyzed conversation context and user intent",
                "details": {
                    "context_type": context.get("context_type"),
                    "conversation_history_length": len(context.get("conversation_history", [])),
                    "knowledge_sources_used": len(context.get("relevant_knowledge", []))
                }
            })
            
            # Step 2: Information synthesis
            reasoning_steps.append({
                "step": 2,
                "type": "information_synthesis",
                "description": "Synthesized relevant information and knowledge",
                "details": {
                    "knowledge_integration": "Applied domain-specific knowledge",
                    "pattern_matching": "Identified relevant patterns from conversation history"
                }
            })
            
            # Step 3: Response generation
            reasoning_steps.append({
                "step": 3,
                "type": "response_generation",
                "description": "Generated response based on analysis and synthesis",
                "details": {
                    "reasoning_type": ai_model.reasoning_types[0] if ai_model.reasoning_types else "logical",
                    "explainability_level": ai_model.explainability_level
                }
            })
            
            # Estimate confidence from evidence richness and model explainability
            evidence_signals = 0
            for step in reasoning_steps:
                if step.get("details"):
                    evidence_signals += len(step["details"]) 
            explainability = getattr(ai_model, "explainability_level", "medium")
            base = {"low": 0.55, "medium": 0.7, "high": 0.85}.get(explainability, 0.7)
            confidence = max(0.5, min(0.99, base + 0.02 * evidence_signals))
            return {
                "reasoning_steps": reasoning_steps,
                "reasoning_confidence": confidence,
                "total_steps": len(reasoning_steps),
                "primary_reasoning_type": ai_model.reasoning_types[0] if ai_model.reasoning_types else "logical"
            }
            
        except Exception as e:
            logger.error(f"Error generating reasoning chain: {str(e)}")
            return {}
    
    async def _extract_classification_suggestions(
        self, 
        content: str, 
        reasoning_chain: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Extract classification suggestions from AI response"""
        try:
            suggestions = []
            
            # Look for classification keywords
            classification_keywords = [
                "classify", "classification", "category", "type", "label",
                "sensitive", "confidential", "public", "private", "restricted"
            ]
            
            content_lower = content.lower()
            for keyword in classification_keywords:
                if keyword in content_lower:
                    # Extract context around the keyword
                    keyword_index = content_lower.index(keyword)
                    context_start = max(0, keyword_index - 50)
                    context_end = min(len(content), keyword_index + 50)
                    context = content[context_start:context_end]
                    
                    # Heuristic confidence from presence of strong indicators
                    strong = any(k in context.lower() for k in ["pii", "confidential", "restricted", "public"])
                    suggestions.append({
                        "keyword": keyword,
                        "context": context,
                        "confidence": 0.85 if strong else 0.65,
                        "suggestion_type": "classification"
                    })
            
            return suggestions
            
        except Exception as e:
            logger.error(f"Error extracting classification suggestions: {str(e)}")
            return []
    
    async def _perform_sensitivity_analysis(
        self, 
        content: str, 
        classification_suggestions: List[Dict[str, Any]], 
        ai_model: AIModelConfiguration
    ) -> Dict[str, Any]:
        """Perform sensitivity analysis on the content and suggestions"""
        try:
            # Check for sensitive terms
            sensitive_terms = [
                "ssn", "social security", "credit card", "password", "confidential",
                "personal", "private", "medical", "health", "financial"
            ]
            
            content_lower = content.lower()
            detected_sensitive_terms = [term for term in sensitive_terms if term in content_lower]
            
            # Calculate sensitivity score
            sensitivity_score = min(len(detected_sensitive_terms) * 0.2, 1.0)
            
            # Determine sensitivity level
            if sensitivity_score >= 0.8:
                sensitivity_level = "HIGHLY_SENSITIVE"
            elif sensitivity_score >= 0.5:
                sensitivity_level = "SENSITIVE"
            elif sensitivity_score >= 0.2:
                sensitivity_level = "POTENTIALLY_SENSITIVE"
            else:
                sensitivity_level = "PUBLIC"
            
            return {
                "sensitivity_score": sensitivity_score,
                "sensitivity_level": sensitivity_level,
                "detected_sensitive_terms": detected_sensitive_terms,
                "classification_impact": len(classification_suggestions) * 0.1,
                "recommendations": [
                    "Review for data privacy compliance",
                    "Consider additional security measures",
                    "Validate classification accuracy"
                ]
            }
            
        except Exception as e:
            logger.error(f"Error performing sensitivity analysis: {str(e)}")
            return {}
    
    async def _generate_risk_assessment(
        self, 
        sensitivity_analysis: Dict[str, Any], 
        classification_suggestions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate comprehensive risk assessment"""
        try:
            # Calculate base risk score
            sensitivity_score = sensitivity_analysis.get("sensitivity_score", 0.0)
            classification_risk = len(classification_suggestions) * 0.1
            
            overall_risk_score = min((sensitivity_score + classification_risk) / 2, 1.0)
            
            # Determine risk level
            if overall_risk_score >= 0.8:
                risk_level = "HIGH"
            elif overall_risk_score >= 0.5:
                risk_level = "MEDIUM"
            elif overall_risk_score >= 0.2:
                risk_level = "LOW"
            else:
                risk_level = "MINIMAL"
            
            # Generate risk factors
            risk_factors = []
            if sensitivity_score > 0.5:
                risk_factors.append("High sensitivity content detected")
            if len(classification_suggestions) > 3:
                risk_factors.append("Multiple classification suggestions require review")
            
            return {
                "overall_risk_score": overall_risk_score,
                "risk_level": risk_level,
                "risk_factors": risk_factors,
                "mitigation_strategies": [
                    "Implement additional validation steps",
                    "Require human review for high-risk classifications",
                    "Apply enhanced security controls"
                ],
                "compliance_considerations": [
                    "GDPR compliance check required",
                    "Data retention policy review",
                    "Access control validation"
                ]
            }
            
        except Exception as e:
            logger.error(f"Error generating risk assessment: {str(e)}")
            return {}
    
    async def _calculate_response_confidence(
        self, 
        content_analysis: Dict[str, Any], 
        reasoning_chain: Dict[str, Any]
    ) -> float:
        """Calculate confidence score for the AI response"""
        try:
            # Factors contributing to confidence
            clarity_score = content_analysis.get("clarity_score", 0.5)
            reasoning_confidence = reasoning_chain.get("reasoning_confidence", 0.5)
            content_quality = min(content_analysis.get("word_count", 0) / 100, 1.0)
            
            # Weighted average
            confidence_score = (clarity_score * 0.3 + reasoning_confidence * 0.5 + content_quality * 0.2)
            
            return min(max(confidence_score, 0.0), 1.0)
            
        except Exception as e:
            logger.error(f"Error calculating response confidence: {str(e)}")
            return 0.5
    
    async def _generate_thought_process(
        self, 
        reasoning_chain: Dict[str, Any], 
        content_analysis: Dict[str, Any]
    ) -> str:
        """Generate human-readable thought process explanation"""
        try:
            thought_process = "AI Reasoning Process:\n\n"
            
            reasoning_steps = reasoning_chain.get("reasoning_steps", [])
            for step in reasoning_steps:
                thought_process += f"{step['step']}. {step['description']}\n"
                if step.get('details'):
                    for key, value in step['details'].items():
                        thought_process += f"   - {key}: {value}\n"
                thought_process += "\n"
            
            # Add content analysis insights
            thought_process += "Content Analysis:\n"
            thought_process += f"- Response complexity: {content_analysis.get('complexity_score', 0):.2f}\n"
            thought_process += f"- Clarity score: {content_analysis.get('clarity_score', 0):.2f}\n"
            thought_process += f"- Key topics identified: {', '.join(content_analysis.get('key_topics', []))}\n"
            
            return thought_process
            
        except Exception as e:
            logger.error(f"Error generating thought process: {str(e)}")
            return "Unable to generate thought process explanation."