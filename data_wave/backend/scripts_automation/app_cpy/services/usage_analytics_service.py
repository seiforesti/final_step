"""
Enterprise UsageAnalyticsService
Facade used by catalog and marketplace to compute usage/popularity scores.
"""

import logging
from typing import Any, Dict, Optional
from datetime import datetime, timedelta

from sqlmodel import select

from ..db_session import get_session
from ..models.advanced_catalog_models import AssetUsageMetrics

logger = logging.getLogger(__name__)


class UsageAnalyticsService:
    """Compute usage and popularity scores for catalog items."""

    async def get_item_usage_score(self, item_id: int, item_type: Optional[str] = None) -> float:
        """
        Returns a normalized usage score in 0..1 based on recent access metrics.
        Uses the last 30 days of `AssetUsageMetrics` for the given asset.
        """
        try:
            since = datetime.utcnow() - timedelta(days=30)
            with get_session() as session:
                stmt = (
                    select(AssetUsageMetrics)
                    .where(AssetUsageMetrics.asset_id == item_id)
                    .where(AssetUsageMetrics.metric_date >= since)
                )
                rows = session.execute(stmt).scalars().all() or []
                if not rows:
                    return 0.0

                total_accesses = sum(r.total_accesses or 0 for r in rows)
                unique_users = sum(r.unique_users or 0 for r in rows)
                # Heuristic normalization: cap denominator to avoid runaway values
                norm = total_accesses + unique_users
                # Assume 1000 combined events in 30 days is effectively "1.0"
                score = min(1.0, norm / 1000.0)
                return float(round(score, 4))
        except Exception as exc:
            logger.error(f"get_item_usage_score failed for {item_id}: {exc}")
            return 0.0

    async def get_item_popularity_score(self, item_id: int) -> float:
        """
        Returns a popularity score in 0..1 derived from peak concurrency and search/usage intensity.
        """
        try:
            since = datetime.utcnow() - timedelta(days=90)
            with get_session() as session:
                rows = session.execute(
                    select(AssetUsageMetrics)
                    .where(AssetUsageMetrics.asset_id == item_id)
                    .where(AssetUsageMetrics.metric_date >= since)
                ).all() or []
                if not rows:
                    return 0.0

                peak_concurrent = max((r.peak_concurrent_users or 0) for r in rows)
                searches = sum(len(r.popular_queries or []) for r in rows)
                accesses = sum((r.total_accesses or 0) for r in rows)

                popularity = 0.5 * min(1.0, peak_concurrent / 50.0) + 0.3 * min(1.0, searches / 200.0) + 0.2 * min(1.0, accesses / 5000.0)
                return float(round(min(1.0, popularity), 4))
        except Exception as exc:
            logger.error(f"get_item_popularity_score failed for {item_id}: {exc}")
            return 0.0

    async def get_user_usage_statistics(self, user_id: str, time_range: str = "30d") -> Dict[str, Any]:
        """
        Get user usage statistics for the specified time range.
        """
        try:
            # Parse time range
            days = 30
            if time_range == "7d":
                days = 7
            elif time_range == "24h":
                days = 1
            
            since = datetime.utcnow() - timedelta(days=days)
            
            with get_session() as session:
                # Mock statistics for now - replace with real implementation
                statistics = {
                    "api_calls": 150,
                    "data_sources_accessed": 8,
                    "scans_performed": 12,
                    "reports_generated": 5,
                    "workflows_executed": 3,
                    "collaboration_sessions": 7,
                    "last_activity": since.isoformat(),
                    "active_days": days,
                    "engagement_score": 85.5
                }
                
                return {
                    "user_id": user_id,
                    "time_range": time_range,
                    "statistics": statistics,
                    "timestamp": datetime.utcnow().isoformat()
                }
        except Exception as exc:
            logger.error(f"get_user_usage_statistics failed for user {user_id}: {exc}")
            # Return fallback statistics
            return {
                "user_id": user_id,
                "time_range": time_range,
                "statistics": {
                    "api_calls": 0,
                    "data_sources_accessed": 0,
                    "scans_performed": 0,
                    "reports_generated": 0,
                    "workflows_executed": 0,
                    "collaboration_sessions": 0,
                    "last_activity": datetime.utcnow().isoformat(),
                    "active_days": 0,
                    "engagement_score": 0.0
                },
                "timestamp": datetime.utcnow().isoformat()
            }


