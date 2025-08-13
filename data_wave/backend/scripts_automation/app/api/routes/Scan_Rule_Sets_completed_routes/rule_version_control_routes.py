"""
🔧 Advanced Rule Version Control Routes for Scan-Rule-Sets Group
===============================================================

This module provides comprehensive API endpoints for rule version control,
including Git-like functionality, branching, merging, and collaboration features.

Key Features:
- Complete Git-like version control for rules
- Branch management and merging
- Version comparison and diff visualization  
- Merge request workflows with reviews
- Collaborative development features
- Advanced conflict resolution
- Comprehensive change tracking
"""

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlmodel import Session, select
from typing import Dict, List, Optional, Any
from datetime import datetime

from app.core.database import get_session
from app.api.security.rbac import require_permission, get_current_user
from app.utils.rate_limiter import check_rate_limit
from app.core.logging_config import get_logger
from app.models.Scan-Rule-Sets-completed-models.rule_version_control_models import (
    RuleVersion, RuleBranch, RuleChange, MergeRequest, MergeRequestReview,
    VersionComparison, RuleVersionCreate, RuleBranchCreate, MergeRequestCreate,
    MergeRequestReviewCreate, VersionComparisonRequest, VersionComparisonResponse,
    RuleVersionResponse, RuleBranchResponse, MergeRequestResponse,
    ConflictResolutionRequest, ConflictResolutionResponse
)
from app.services.Scan-Rule-Sets-completed-services.rule_version_control_service import RuleVersionControlService
from app.models.response_models import StandardResponse

# Initialize router and logger
router = APIRouter(prefix="/rule-version-control", tags=["Rule Version Control"])
logger = get_logger(__name__)

# Permission constants
PERMISSION_RULE_VERSION_VIEW = "rule_version:view"
PERMISSION_RULE_VERSION_CREATE = "rule_version:create"
PERMISSION_RULE_VERSION_UPDATE = "rule_version:update"
PERMISSION_RULE_VERSION_DELETE = "rule_version:delete"
PERMISSION_RULE_BRANCH_MANAGE = "rule_branch:manage"
PERMISSION_MERGE_REQUEST_CREATE = "merge_request:create"
PERMISSION_MERGE_REQUEST_REVIEW = "merge_request:review"
PERMISSION_MERGE_REQUEST_MERGE = "merge_request:merge"


# ===============================
# VERSION MANAGEMENT ENDPOINTS
# ===============================

@router.post("/versions", response_model=StandardResponse)
async def create_rule_version(
    version_data: RuleVersionCreate,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_RULE_VERSION_CREATE))
):
    """
    Create a new version of a rule with comprehensive change tracking
    """
    try:
        # Rate limiting
        user_id = current_user.get("id", "anonymous")
        if not await check_rate_limit("create_version", user_id, 20, 60):
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
        
        # Initialize service
        version_service = RuleVersionControlService()
        
        # Create version
        version = await version_service.create_version(
            session=session,
            rule_id=version_data.rule_id,
            content=version_data.content,
            commit_message=version_data.commit_message,
            author=current_user.get("username", "system"),
            branch_name=version_data.branch_name,
            parent_version_id=version_data.parent_version_id
        )
        
        # Background tasks
        background_tasks.add_task(
            version_service.analyze_version_impact,
            session, version.id
        )
        
        logger.info(f"Created rule version {version.id} for rule {version_data.rule_id}")
        
        return StandardResponse(
            success=True,
            message="Rule version created successfully",
            data={
                "version_id": version.id,
                "version_number": version.version_number,
                "commit_hash": version.commit_hash,
                "branch_name": version.branch_name,
                "created_at": version.created_at
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to create rule version: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create version: {str(e)}")


@router.get("/versions/{version_id}", response_model=RuleVersionResponse)
async def get_rule_version(
    version_id: int,
    include_content: bool = Query(default=True, description="Include rule content"),
    include_changes: bool = Query(default=False, description="Include change details"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_RULE_VERSION_VIEW))
):
    """
    Get detailed information about a specific rule version
    """
    try:
        version_service = RuleVersionControlService()
        
        # Get version details
        version = await version_service.get_version(
            session=session,
            version_id=version_id,
            include_content=include_content,
            include_changes=include_changes
        )
        
        if not version:
            raise HTTPException(status_code=404, detail="Version not found")
        
        return RuleVersionResponse(
            id=version.id,
            rule_id=version.rule_id,
            version_number=version.version_number,
            commit_hash=version.commit_hash,
            commit_message=version.commit_message,
            content=version.content if include_content else None,
            author=version.author,
            branch_name=version.branch_name,
            parent_version_id=version.parent_version_id,
            created_at=version.created_at,
            is_current=version.is_current,
            tags=version.tags,
            metadata=version.metadata,
            changes=version.changes if include_changes else []
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get rule version {version_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve version")


@router.get("/rules/{rule_id}/versions", response_model=List[RuleVersionResponse])
async def get_rule_versions(
    rule_id: int,
    branch_name: Optional[str] = Query(default=None, description="Filter by branch"),
    limit: int = Query(default=50, le=100, description="Maximum number of versions"),
    offset: int = Query(default=0, description="Number of versions to skip"),
    include_tags: bool = Query(default=True, description="Include version tags"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_RULE_VERSION_VIEW))
):
    """
    Get version history for a specific rule with optional filtering
    """
    try:
        version_service = RuleVersionControlService()
        
        # Get version history
        versions = await version_service.get_rule_version_history(
            session=session,
            rule_id=rule_id,
            branch_name=branch_name,
            limit=limit,
            offset=offset,
            include_tags=include_tags
        )
        
        return [
            RuleVersionResponse(
                id=v.id,
                rule_id=v.rule_id,
                version_number=v.version_number,
                commit_hash=v.commit_hash,
                commit_message=v.commit_message,
                author=v.author,
                branch_name=v.branch_name,
                parent_version_id=v.parent_version_id,
                created_at=v.created_at,
                is_current=v.is_current,
                tags=v.tags if include_tags else [],
                metadata=v.metadata
            ) for v in versions
        ]
        
    except Exception as e:
        logger.error(f"Failed to get versions for rule {rule_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve versions")


@router.post("/versions/{version_id}/tag", response_model=StandardResponse)
async def tag_version(
    version_id: int,
    tag_name: str,
    tag_message: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_RULE_VERSION_UPDATE))
):
    """
    Add a tag to a specific version for easy reference
    """
    try:
        version_service = RuleVersionControlService()
        
        # Add tag to version
        result = await version_service.tag_version(
            session=session,
            version_id=version_id,
            tag_name=tag_name,
            tag_message=tag_message,
            tagger=current_user.get("username", "system")
        )
        
        if not result:
            raise HTTPException(status_code=404, detail="Version not found")
        
        logger.info(f"Tagged version {version_id} with tag '{tag_name}'")
        
        return StandardResponse(
            success=True,
            message=f"Version tagged as '{tag_name}' successfully",
            data={"version_id": version_id, "tag_name": tag_name}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to tag version {version_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to tag version")


# ===============================
# BRANCH MANAGEMENT ENDPOINTS
# ===============================

@router.post("/branches", response_model=StandardResponse)
async def create_branch(
    branch_data: RuleBranchCreate,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_RULE_BRANCH_MANAGE))
):
    """
    Create a new branch for rule development
    """
    try:
        version_service = RuleVersionControlService()
        
        # Create branch
        branch = await version_service.create_branch(
            session=session,
            rule_id=branch_data.rule_id,
            branch_name=branch_data.branch_name,
            description=branch_data.description,
            source_version_id=branch_data.source_version_id,
            creator=current_user.get("username", "system")
        )
        
        logger.info(f"Created branch '{branch_data.branch_name}' for rule {branch_data.rule_id}")
        
        return StandardResponse(
            success=True,
            message="Branch created successfully",
            data={
                "branch_id": branch.id,
                "branch_name": branch.branch_name,
                "rule_id": branch.rule_id,
                "created_at": branch.created_at
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to create branch: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create branch: {str(e)}")


@router.get("/rules/{rule_id}/branches", response_model=List[RuleBranchResponse])
async def get_rule_branches(
    rule_id: int,
    include_inactive: bool = Query(default=False, description="Include inactive branches"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_RULE_VERSION_VIEW))
):
    """
    Get all branches for a specific rule
    """
    try:
        version_service = RuleVersionControlService()
        
        # Get branches
        branches = await version_service.get_rule_branches(
            session=session,
            rule_id=rule_id,
            include_inactive=include_inactive
        )
        
        return [
            RuleBranchResponse(
                id=b.id,
                rule_id=b.rule_id,
                branch_name=b.branch_name,
                description=b.description,
                created_by=b.created_by,
                source_version_id=b.source_version_id,
                current_version_id=b.current_version_id,
                is_active=b.is_active,
                is_protected=b.is_protected,
                created_at=b.created_at,
                last_commit_at=b.last_commit_at,
                metadata=b.metadata
            ) for b in branches
        ]
        
    except Exception as e:
        logger.error(f"Failed to get branches for rule {rule_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve branches")


@router.put("/branches/{branch_id}/protection", response_model=StandardResponse)
async def update_branch_protection(
    branch_id: int,
    is_protected: bool,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_RULE_BRANCH_MANAGE))
):
    """
    Update branch protection settings
    """
    try:
        version_service = RuleVersionControlService()
        
        # Update protection
        result = await version_service.update_branch_protection(
            session=session,
            branch_id=branch_id,
            is_protected=is_protected,
            updated_by=current_user.get("username", "system")
        )
        
        if not result:
            raise HTTPException(status_code=404, detail="Branch not found")
        
        protection_status = "enabled" if is_protected else "disabled"
        logger.info(f"Branch protection {protection_status} for branch {branch_id}")
        
        return StandardResponse(
            success=True,
            message=f"Branch protection {protection_status} successfully",
            data={"branch_id": branch_id, "is_protected": is_protected}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update branch protection: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update protection")


# ===============================
# VERSION COMPARISON ENDPOINTS
# ===============================

@router.post("/versions/compare", response_model=VersionComparisonResponse)
async def compare_versions(
    comparison_request: VersionComparisonRequest,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_RULE_VERSION_VIEW))
):
    """
    Compare two rule versions and generate detailed diff
    """
    try:
        version_service = RuleVersionControlService()
        
        # Perform comparison
        comparison = await version_service.compare_versions(
            session=session,
            source_version_id=comparison_request.source_version_id,
            target_version_id=comparison_request.target_version_id,
            comparison_type=comparison_request.comparison_type,
            include_metadata=comparison_request.include_metadata
        )
        
        if not comparison:
            raise HTTPException(status_code=404, detail="One or both versions not found")
        
        return VersionComparisonResponse(
            source_version_id=comparison.source_version_id,
            target_version_id=comparison.target_version_id,
            comparison_type=comparison.comparison_type,
            diff_summary=comparison.diff_summary,
            changes_count=comparison.changes_count,
            additions_count=comparison.additions_count,
            deletions_count=comparison.deletions_count,
            modifications_count=comparison.modifications_count,
            detailed_diff=comparison.detailed_diff,
            conflict_indicators=comparison.conflict_indicators,
            similarity_score=comparison.similarity_score,
            comparison_metadata=comparison.comparison_metadata
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to compare versions: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to compare versions")


# ===============================
# MERGE REQUEST ENDPOINTS
# ===============================

@router.post("/merge-requests", response_model=StandardResponse)
async def create_merge_request(
    merge_request_data: MergeRequestCreate,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_MERGE_REQUEST_CREATE))
):
    """
    Create a new merge request for collaborative rule development
    """
    try:
        version_service = RuleVersionControlService()
        
        # Create merge request
        merge_request = await version_service.create_merge_request(
            session=session,
            source_branch_id=merge_request_data.source_branch_id,
            target_branch_id=merge_request_data.target_branch_id,
            title=merge_request_data.title,
            description=merge_request_data.description,
            creator=current_user.get("username", "system"),
            reviewers=merge_request_data.reviewers,
            labels=merge_request_data.labels
        )
        
        logger.info(f"Created merge request {merge_request.id}")
        
        return StandardResponse(
            success=True,
            message="Merge request created successfully",
            data={
                "merge_request_id": merge_request.id,
                "title": merge_request.title,
                "status": merge_request.status,
                "created_at": merge_request.created_at
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to create merge request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create merge request: {str(e)}")


@router.get("/merge-requests/{merge_request_id}", response_model=MergeRequestResponse)
async def get_merge_request(
    merge_request_id: int,
    include_reviews: bool = Query(default=True, description="Include reviews"),
    include_conflicts: bool = Query(default=True, description="Include conflict analysis"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_RULE_VERSION_VIEW))
):
    """
    Get detailed information about a merge request
    """
    try:
        version_service = RuleVersionControlService()
        
        # Get merge request
        merge_request = await version_service.get_merge_request(
            session=session,
            merge_request_id=merge_request_id,
            include_reviews=include_reviews,
            include_conflicts=include_conflicts
        )
        
        if not merge_request:
            raise HTTPException(status_code=404, detail="Merge request not found")
        
        return MergeRequestResponse(
            id=merge_request.id,
            source_branch_id=merge_request.source_branch_id,
            target_branch_id=merge_request.target_branch_id,
            title=merge_request.title,
            description=merge_request.description,
            status=merge_request.status,
            created_by=merge_request.created_by,
            assigned_reviewers=merge_request.assigned_reviewers,
            labels=merge_request.labels,
            created_at=merge_request.created_at,
            updated_at=merge_request.updated_at,
            merged_at=merge_request.merged_at,
            merged_by=merge_request.merged_by,
            conflict_status=merge_request.conflict_status,
            metadata=merge_request.metadata,
            reviews=merge_request.reviews if include_reviews else [],
            conflicts=merge_request.conflicts if include_conflicts else []
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get merge request {merge_request_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve merge request")


@router.post("/merge-requests/{merge_request_id}/reviews", response_model=StandardResponse)
async def submit_merge_request_review(
    merge_request_id: int,
    review_data: MergeRequestReviewCreate,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_MERGE_REQUEST_REVIEW))
):
    """
    Submit a review for a merge request
    """
    try:
        version_service = RuleVersionControlService()
        
        # Submit review
        review = await version_service.submit_review(
            session=session,
            merge_request_id=merge_request_id,
            reviewer=current_user.get("username", "system"),
            review_status=review_data.review_status,
            comments=review_data.comments,
            suggestions=review_data.suggestions
        )
        
        logger.info(f"Submitted review for merge request {merge_request_id}")
        
        return StandardResponse(
            success=True,
            message="Review submitted successfully",
            data={
                "review_id": review.id,
                "merge_request_id": merge_request_id,
                "status": review.review_status,
                "submitted_at": review.submitted_at
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to submit review: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to submit review: {str(e)}")


@router.post("/merge-requests/{merge_request_id}/merge", response_model=StandardResponse)
async def merge_request(
    merge_request_id: int,
    merge_strategy: str = Query(default="merge", description="Merge strategy"),
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_MERGE_REQUEST_MERGE))
):
    """
    Merge an approved merge request
    """
    try:
        version_service = RuleVersionControlService()
        
        # Perform merge
        merge_result = await version_service.merge_request(
            session=session,
            merge_request_id=merge_request_id,
            merger=current_user.get("username", "system"),
            merge_strategy=merge_strategy
        )
        
        if not merge_result.success:
            raise HTTPException(status_code=400, detail=merge_result.error_message)
        
        # Background tasks for post-merge processing
        background_tasks.add_task(
            version_service.post_merge_cleanup,
            session, merge_request_id
        )
        
        logger.info(f"Merged request {merge_request_id} successfully")
        
        return StandardResponse(
            success=True,
            message="Merge request merged successfully",
            data={
                "merge_request_id": merge_request_id,
                "merge_commit_hash": merge_result.merge_commit_hash,
                "merged_at": merge_result.merged_at
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to merge request {merge_request_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to merge request: {str(e)}")


@router.post("/merge-requests/{merge_request_id}/resolve-conflicts", response_model=StandardResponse)
async def resolve_merge_conflicts(
    merge_request_id: int,
    resolution_data: ConflictResolutionRequest,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_MERGE_REQUEST_MERGE))
):
    """
    Resolve merge conflicts in a merge request
    """
    try:
        version_service = RuleVersionControlService()
        
        # Resolve conflicts
        resolution_result = await version_service.resolve_conflicts(
            session=session,
            merge_request_id=merge_request_id,
            conflict_resolutions=resolution_data.conflict_resolutions,
            resolver=current_user.get("username", "system")
        )
        
        if not resolution_result.success:
            raise HTTPException(status_code=400, detail=resolution_result.error_message)
        
        logger.info(f"Resolved conflicts for merge request {merge_request_id}")
        
        return StandardResponse(
            success=True,
            message="Conflicts resolved successfully",
            data={
                "merge_request_id": merge_request_id,
                "conflicts_resolved": resolution_result.conflicts_resolved,
                "remaining_conflicts": resolution_result.remaining_conflicts
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to resolve conflicts: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to resolve conflicts: {str(e)}")


# ===============================
# ANALYTICS AND REPORTING ENDPOINTS
# ===============================

@router.get("/analytics/version-control", response_model=Dict[str, Any])
async def get_version_control_analytics(
    rule_id: Optional[int] = Query(default=None, description="Filter by rule ID"),
    days: int = Query(default=30, le=365, description="Number of days to analyze"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_RULE_VERSION_VIEW))
):
    """
    Get version control analytics and metrics
    """
    try:
        version_service = RuleVersionControlService()
        
        # Get analytics
        analytics = await version_service.get_version_control_analytics(
            session=session,
            rule_id=rule_id,
            days=days
        )
        
        return {
            "success": True,
            "data": analytics,
            "generated_at": datetime.now()
        }
        
    except Exception as e:
        logger.error(f"Failed to get version control analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve analytics")


@router.get("/health", response_model=Dict[str, Any])
async def version_control_health_check():
    """
    Health check endpoint for version control system
    """
    try:
        return {
            "status": "healthy",
            "service": "rule-version-control",
            "timestamp": datetime.now(),
            "version": "1.0.0"
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now()
        }