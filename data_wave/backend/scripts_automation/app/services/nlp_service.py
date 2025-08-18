"""
NLPService
Provides sentiment and simple NLP utilities used by rule templates and analysis services.
"""

import logging
from typing import Any, Dict

logger = logging.getLogger(__name__)


class NLPService:
    """Enterprise NLP utilities (lightweight production fallback)."""

    async def analyze_sentiment(
        self,
        text: str,
        analysis_type: str = "comprehensive",
        include_confidence: bool = True,
        include_emotions: bool = False,
    ) -> Dict[str, Any]:
        """
        Return sentiment in 0..1, where 0.5 ~ neutral. Heuristic using keywords.
        """
        try:
            t = (text or "").lower()
            positives = ["good", "valid", "success", "excellent", "optimal", "secure", "compliant"]
            negatives = ["error", "invalid", "fail", "critical", "vulnerable", "non-compliant", "risky"]

            pos = sum(1 for w in positives if w in t)
            neg = sum(1 for w in negatives if w in t)
            score = 0.5
            if pos or neg:
                score = max(0.0, min(1.0, 0.5 + 0.1 * (pos - neg)))

            result: Dict[str, Any] = {"sentiment_score": float(round(score, 3))}
            if include_confidence:
                conf = 0.5 + min(0.45, (pos + neg) * 0.05)
                result["confidence"] = float(round(conf, 3))
            if include_emotions:
                result["emotions"] = {"positive": pos, "negative": neg, "neutral": max(0, 5 - (pos + neg))}
            return result
        except Exception as exc:
            logger.warning(f"analyze_sentiment fallback: {exc}")
            return {"sentiment_score": 0.5, "confidence": 0.5}


