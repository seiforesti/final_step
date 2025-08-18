"""
EmbeddingService
Generates vector embeddings for text content used by rule templates and semantic features.
"""

import logging
from typing import Any, Dict, List
import hashlib

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Lightweight deterministic embedding for production fallback."""

    async def generate_embeddings(
        self,
        text: str,
        model_name: str = "enterprise-default",
        embedding_dimensions: int = 256,
        include_metadata: bool = True,
        include_confidence: bool = True,
    ) -> Dict[str, Any]:
        """
        Produce a deterministic embedding vector of requested dimension from text hash.
        Returns: { embedding_vector: List[float], confidence: float, model_name: str }
        """
        try:
            # Deterministic hash-based embedding (placeholder for real model integration)
            digest = hashlib.sha256((model_name + "::" + (text or "")).encode("utf-8")).digest()
            # Expand digest to requested dimensions
            values: List[float] = []
            i = 0
            while len(values) < embedding_dimensions:
                chunk = digest[i % len(digest)]
                values.append((chunk / 255.0) * 2 - 1)  # normalize to [-1, 1]
                i += 1

            result: Dict[str, Any] = {"embedding_vector": values[:embedding_dimensions]}
            if include_metadata:
                result["model_name"] = model_name
                result["dimensions"] = embedding_dimensions
            if include_confidence:
                # Heuristic confidence: longer text => higher
                conf = min(0.95, max(0.5, len(text) / 2000.0 + 0.5))
                result["confidence"] = float(round(conf, 3))
            return result
        except Exception as exc:
            logger.error(f"generate_embeddings failed: {exc}")
            return {"embedding_vector": [0.0] * embedding_dimensions, "confidence": 0.5, "model_name": model_name}


