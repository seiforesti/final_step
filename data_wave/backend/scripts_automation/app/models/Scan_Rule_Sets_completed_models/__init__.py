"""
Scan-Rule-Sets Completed Models Package

This package contains all the advanced models for the scan-rule-sets group,
including rule templates, version control, enhanced collaboration, and analytics.
"""

# Import all models for easy access
from .rule_template_models import (
    RuleTemplate, TemplateCategory, TemplateVersion, TemplateUsage,
    TemplateReview, TemplateAnalytics, TemplateCreateRequest, TemplateUpdateRequest,
    TemplateResponse, TemplateSearchParams
)

from .rule_version_control_models import (
    RuleVersion, RuleBranch, RuleChange, MergeRequest, MergeRequestReview,
    VersionComparison, VersionCreateRequest, BranchCreateRequest,
    MergeRequestCreateRequest, VersionResponse, BranchResponse
)

from .enhanced_collaboration_models import (
    RuleTeamMember, RuleDiscussion, TeamHubCreateRequest, ReviewCreateRequest, 
    RuleCommentCreateRequest, KnowledgeItemCreateRequest, EnhancedRuleReview, EnhancedRuleComment
)

from .advanced_collaboration_models import (
    RuleReview, RuleComment, ApprovalWorkflow, AdvancedKnowledgeBase,
    ExpertConsultation, ReviewCreateRequest as RuleReviewRequest, CommentCreateRequest as RuleCommentRequest,
    ConsultationRequest as ExpertConsultationRequest, KnowledgeArticleRequest as KnowledgeBaseRequest,
    ReviewResponse as RuleReviewResponse, CommentResponse as RuleCommentResponse, 
    ConsultationResponse as ExpertConsultationResponse, KnowledgeArticleResponse as KnowledgeBaseResponse
)

from .analytics_reporting_models import (
    UsageAnalytics, TrendAnalysis, ROIMetrics, ComplianceIntegration,
    UsageAnalyticsCreate, UsageAnalyticsResponse, TrendAnalysisCreate,
    TrendAnalysisResponse, ROIMetricsCreate, ROIMetricsResponse,
    ComplianceIntegrationCreate, ComplianceIntegrationResponse,
    AnalyticsSummary, ROIDashboard, ComplianceDashboard,
    MarketplaceAnalytics, UsageMetrics
)

__all__ = [
    # Template Models
    "RuleTemplate", "TemplateCategory", "TemplateVersion", "TemplateUsage",
    "TemplateReview", "TemplateAnalytics", "TemplateCreateRequest", "TemplateUpdateRequest",
    "TemplateResponse", "TemplateSearchParams",
    
    # Version Control Models
    "RuleVersion", "RuleBranch", "RuleChange", "MergeRequest", "MergeRequestReview",
    "VersionComparison", "VersionCreateRequest", "BranchCreateRequest",
    "MergeRequestCreateRequest", "VersionResponse", "BranchResponse",
    
    # Collaboration Models
    "RuleReview", "RuleComment", "ApprovalWorkflow", "AdvancedKnowledgeBase",
    "ExpertConsultation", "RuleTeamMember", "RuleDiscussion", "EnhancedRuleReview", "EnhancedRuleComment", "RuleReviewRequest", "RuleCommentRequest",
    "RuleCommentCreateRequest", "TeamHubCreateRequest", "KnowledgeItemCreateRequest",
    "RuleReviewResponse", "RuleCommentResponse", "KnowledgeBaseResponse", "ExpertConsultationResponse",
    
    # Analytics Models
    "UsageAnalytics", "TrendAnalysis", "ROIMetrics", "ComplianceIntegration",
    "UsageAnalyticsCreate", "UsageAnalyticsResponse", "TrendAnalysisCreate",
    "TrendAnalysisResponse", "ROIMetricsCreate", "ROIMetricsResponse",
    "ComplianceIntegrationCreate", "ComplianceIntegrationResponse",
    "AnalyticsSummary", "ROIDashboard", "ComplianceDashboard",
    "MarketplaceAnalytics", "UsageMetrics"
]