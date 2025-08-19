from typing import Dict, Any, List
import logging

from .data_quality_service import DataQualityService

logger = logging.getLogger(__name__)


class ValidationService:
    """Enterprise validation service relying on DataQualityService and rule engines."""

    async def validate_imported_data(self, data: List[Dict[str, Any]], validation_rules: Dict[str, Any]) -> Dict[str, Any]:
        try:
            # Simple schema/field validation according to provided rules
            required_fields = validation_rules.get("required_fields", [])
            max_records = validation_rules.get("max_records")

            passed = True
            errors: List[str] = []

            if max_records is not None and isinstance(max_records, int):
                if len(data) > max_records:
                    passed = False
                    errors.append(f"Too many records: {len(data)} > {max_records}")

            for idx, row in enumerate(data):
                for f in required_fields:
                    if f not in row or row[f] in (None, ""):
                        passed = False
                        errors.append(f"Row {idx}: missing required field '{f}'")

            return {"passed": passed, "errors": errors, "details": {"checked": len(data)}}
        except Exception as e:
            logger.error(f"validate_imported_data error: {e}")
            return {"passed": False, "errors": [str(e)]}

    async def validate_data_source(self, data_source_id: int, validation_rules: Dict[str, Any], quality_checks: Dict[str, Any] | None = None) -> Dict[str, Any]:
        try:
            quality_checks = quality_checks or {}
            dqs = DataQualityService()
            quality = await dqs.assess_data_source_quality(data_source_id)
            score = quality.get("quality_score", 0.0)
            min_score = validation_rules.get("min_quality_score", 0.0)
            passed = score >= min_score
            return {
                "success": True,
                "validation_passed": 1 if passed else 0,
                "items_validated": 1,
                "details": {"quality_score": score, "min_required": min_score},
            }
        except Exception as e:
            logger.error(f"validate_data_source error: {e}")
            return {"success": False, "error": str(e)}



