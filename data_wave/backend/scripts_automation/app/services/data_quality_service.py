"""
Enterprise DataQualityService
Provides production-grade data quality insights and assessments used across catalog and ML services.
"""

import logging
from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta

from sqlmodel import select

from ..db_session import get_session
from ..models.advanced_catalog_models import (
    IntelligentDataAsset,
    DataQualityAssessment,
    AssetUsageMetrics,
)

logger = logging.getLogger(__name__)


class DataQualityService:
    """
    Enterprise-level service for computing data quality insights.
    """

    async def get_table_quality_insights(self, table_name: str, data_source_id: int) -> Dict[str, Any]:
        """
        Return detailed quality insights for a specific table within a data source.
        Output schema:
        {
          overall_score: float (0-10 scale),
          dimensions: { completeness, accuracy, consistency, validity, uniqueness, timeliness },
          recent_assessments: [...],
          last_assessed_at: iso str | None
        }
        """
        try:
            with get_session() as session:
                asset_stmt = (
                    select(IntelligentDataAsset)
                    .where(IntelligentDataAsset.table_name == table_name)
                    .where(IntelligentDataAsset.data_source_id == data_source_id)
                )
                asset = session.exec(asset_stmt).first()

                if not asset:
                    return {
                        "overall_score": 0.0,
                        "dimensions": {},
                        "recent_assessments": [],
                        "last_assessed_at": None,
                    }

                # Pull latest assessments (up to 5)
                assess_stmt = (
                    select(DataQualityAssessment)
                    .where(DataQualityAssessment.asset_id == asset.id)
                    .order_by(DataQualityAssessment.assessment_date.desc())
                )
                assessments = session.exec(assess_stmt).all() or []
                recent = assessments[:5]

                # Use live fields when present; otherwise, derive from latest assessment
                dimensions = {
                    "completeness": float(asset.completeness or 0.0),
                    "accuracy": float(asset.accuracy or 0.0),
                    "consistency": float(asset.consistency or 0.0),
                    "validity": float(asset.validity or 0.0),
                    "uniqueness": float(asset.uniqueness or 0.0),
                    "timeliness": float(asset.timeliness or 0.0),
                }

                if not any(dimensions.values()) and recent:
                    latest = recent[0]
                    dimensions = {
                        "completeness": float(latest.completeness_score or 0.0),
                        "accuracy": float(latest.accuracy_score or 0.0),
                        "consistency": float(latest.consistency_score or 0.0),
                        "validity": float(latest.validity_score or 0.0),
                        "uniqueness": float(latest.uniqueness_score or 0.0),
                        "timeliness": float(latest.timeliness_score or 0.0),
                    }

                # Overall score on 0-10 scale
                overall = float(asset.quality_score or 0.0)
                if overall == 0.0 and recent:
                    overall = float(recent[0].overall_quality_score or 0.0)
                overall_0_to_10 = round(overall * 10.0, 2)

                return {
                    "overall_score": overall_0_to_10,
                    "dimensions": dimensions,
                    "recent_assessments": [
                        {
                            "assessment_id": r.assessment_id,
                            "overall": float(r.overall_quality_score or 0.0),
                            "date": r.assessment_date.isoformat() if r.assessment_date else None,
                        }
                        for r in recent
                    ],
                    "last_assessed_at": (
                        recent[0].assessment_date.isoformat() if recent and recent[0].assessment_date else None
                    ),
                }

        except Exception as exc:
            logger.error(f"get_table_quality_insights failed: {exc}")
            return {"overall_score": 0.0, "dimensions": {}, "recent_assessments": [], "last_assessed_at": None}

    async def assess_data_source_quality(self, data_source_id: int) -> Dict[str, Any]:
        """
        Aggregate quality across all assets of a data source.
        Returns a normalized quality_score in 0..1 and dimension averages.
        """
        try:
            with get_session() as session:
                assets = session.exec(
                    select(IntelligentDataAsset).where(IntelligentDataAsset.data_source_id == data_source_id)
                ).all() or []

                if not assets:
                    return {"quality_score": 0.0, "asset_count": 0, "dimensions": {}}

                def avg(values: List[Optional[float]]) -> float:
                    vals = [float(v) for v in values if isinstance(v, (int, float))]
                    return round(sum(vals) / len(vals), 4) if vals else 0.0

                dimensions = {
                    "completeness": avg([a.completeness for a in assets]),
                    "accuracy": avg([a.accuracy for a in assets]),
                    "consistency": avg([a.consistency for a in assets]),
                    "validity": avg([a.validity for a in assets]),
                    "uniqueness": avg([a.uniqueness for a in assets]),
                    "timeliness": avg([a.timeliness for a in assets]),
                }

                overall = avg([a.quality_score for a in assets])

                return {
                    "quality_score": overall,
                    "asset_count": len(assets),
                    "dimensions": dimensions,
                }

        except Exception as exc:
            logger.error(f"assess_data_source_quality failed: {exc}")
            return {"quality_score": 0.0, "asset_count": 0, "dimensions": {}}


