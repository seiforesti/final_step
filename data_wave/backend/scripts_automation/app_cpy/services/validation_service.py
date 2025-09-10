from typing import Dict, Any, List, Optional
import logging
import time
import os
import hmac
import hashlib
import base64

from .data_quality_service import DataQualityService
from .data_source_connection_service import DataSourceConnectionService

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

    # ==========================
    # Datasource preflight layer
    # ==========================
    def _get_signing_secret(self) -> bytes:
        secret = os.environ.get("PREFLIGHT_SIGNING_SECRET", "dev-secret-change-me")
        return secret.encode("utf-8")

    def _canonicalize_payload(self, payload: Dict[str, Any]) -> str:
        # Stable ordering for signature; include only connection-relevant keys
        allowed_keys = [
            "name", "source_type", "location", "host", "port", "username",
            "password", "database_name", "connection_properties", "environment",
            "criticality", "data_classification", "scan_frequency"
        ]
        canonical: Dict[str, Any] = {k: payload.get(k) for k in allowed_keys}
        # Normalize connection_properties to string
        props = canonical.get("connection_properties")
        if isinstance(props, dict):
            # Sort keys for stability
            canonical["connection_properties"] = {k: props[k] for k in sorted(props.keys())}
        return str(canonical)

    def _sign_preflight(self, payload: Dict[str, Any], ttl_seconds: int = 600) -> str:
        issued_at = int(time.time())
        exp = issued_at + ttl_seconds
        canonical = self._canonicalize_payload(payload)
        message = f"{issued_at}.{exp}.{canonical}".encode("utf-8")
        signature = hmac.new(self._get_signing_secret(), message, hashlib.sha256).digest()
        token = base64.urlsafe_b64encode(message + b"." + signature).decode("utf-8")
        return token

    def _verify_preflight(self, payload: Dict[str, Any], token: str) -> Dict[str, Any]:
        try:
            raw = base64.urlsafe_b64decode(token.encode("utf-8"))
            parts = raw.split(b".")
            if len(parts) < 4:
                return {"ok": False, "reason": "Malformed token"}
            issued_at = int(parts[0].decode("utf-8"))
            exp = int(parts[1].decode("utf-8"))
            canonical = b".".join(parts[2:-1])  # account for dots inside canonical str
            sig = parts[-1]
            now = int(time.time())
            if now > exp:
                return {"ok": False, "reason": "Token expired"}
            expected_msg = f"{issued_at}.{exp}.{self._canonicalize_payload(payload)}".encode("utf-8")
            expected_sig = hmac.new(self._get_signing_secret(), expected_msg, hashlib.sha256).digest()
            if not hmac.compare_digest(sig, expected_sig):
                return {"ok": False, "reason": "Signature mismatch"}
            return {"ok": True}
        except Exception as e:
            logger.error(f"_verify_preflight error: {e}")
            return {"ok": False, "reason": str(e)}

    async def preflight_validate_connection(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Validate connection using production DataSourceConnectionService. Return diagnostics and a signed preflight token."""
        try:
            # Import DataSource model to create a temporary instance for testing
            from app.models.scan_models import DataSource, DataSourceType, DataSourceLocation
            
            # Create a temporary DataSource instance for connection testing
            temp_ds = DataSource(
                name=payload.get("name") or "preflight_test",
                source_type=DataSourceType(payload.get("source_type")),
                location=DataSourceLocation(payload.get("location", "on_prem")),
                host=payload.get("host"),
                port=payload.get("port"),
                username=payload.get("username"),
                password_secret=payload.get("password"),  # Store password temporarily
                database_name=payload.get("database_name"),
                description="Preflight connection test",
                connection_properties=payload.get("connection_properties") or {},
                environment=payload.get("environment", "development"),
                criticality=payload.get("criticality", "medium"),
                data_classification=payload.get("data_classification", "internal")
            )
            
            # Use production DataSourceConnectionService for real connection testing
            from .data_source_connection_service import DataSourceConnectionService
            conn_service = DataSourceConnectionService()
            
            # Create a temporary DataSource instance for connection testing
            temp_ds = DataSource(
                name=payload.get("name") or "preflight_test",
                source_type=DataSourceType(payload.get("source_type")),
                location=DataSourceLocation(payload.get("location", "on_prem")),
                host=payload.get("host"),
                port=payload.get("port"),
                username=payload.get("username"),
                password_secret=payload.get("password"),  # Store password temporarily
                database_name=payload.get("database_name"),
                description="Preflight connection test",
                connection_properties=payload.get("connection_properties") or {},
                environment=payload.get("environment", "development"),
                criticality=payload.get("criticality", "medium"),
                data_classification=payload.get("data_classification", "internal")
            )
            
            # Override the _get_connector method temporarily to inject password
            original_get_connector = conn_service._get_connector
            
            def temp_get_connector(ds):
                from .data_source_connection_service import CloudAwareMongoDBConnector, CloudAwarePostgreSQLConnector, CloudAwareMySQLConnector
                from app.models.scan_models import DataSourceType
                
                if ds.source_type == DataSourceType.MONGODB:
                    connector = CloudAwareMongoDBConnector(ds)
                elif ds.source_type == DataSourceType.POSTGRESQL:
                    connector = CloudAwarePostgreSQLConnector(ds)
                elif ds.source_type == DataSourceType.MYSQL:
                    connector = CloudAwareMySQLConnector(ds)
                else:
                    raise ValueError(f"Unsupported data source type: {ds.source_type}")
                
                # Override the _get_password method to return the password directly
                connector._get_password = lambda: payload.get("password")
                return connector
            
            conn_service._get_connector = temp_get_connector
            
            try:
                diagnostics = await conn_service.test_connection(temp_ds)
            finally:
                # Restore original method
                conn_service._get_connector = original_get_connector

            # Diagnostics should include latency, version, ssl, permissions if available
            success = diagnostics.get("success", False)
            if not success:
                return {
                    "success": False,
                    "message": diagnostics.get("message", "Connection test failed"),
                    "diagnostics": diagnostics
                }

            token = self._sign_preflight(payload)
            return {
                "success": True,
                "preflight_token": token,
                "diagnostics": diagnostics,
                "normalized_config": {
                    "scan_frequency": payload.get("scan_frequency"),
                    "environment": payload.get("environment"),
                    "data_classification": payload.get("data_classification")
                }
            }
        except Exception as e:
            logger.error(f"preflight_validate_connection error: {e}")
            return {"success": False, "message": str(e)}

    def verify_preflight_token(self, payload: Dict[str, Any], token: str) -> bool:
        result = self._verify_preflight(payload, token)
        return bool(result.get("ok"))



