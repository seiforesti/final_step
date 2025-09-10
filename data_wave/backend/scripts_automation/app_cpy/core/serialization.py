"""
Custom serialization utilities to handle ModelField and other serialization issues.
"""

import json
from typing import Any, Dict, List, Union
from pydantic import BaseModel
from fastapi.encoders import jsonable_encoder
import logging

logger = logging.getLogger(__name__)

# Handle different Pydantic versions
try:
    from pydantic import ModelField
except ImportError:
    try:
        from pydantic.fields import ModelField
    except ImportError:
        # For newer Pydantic versions, ModelField might not be available
        ModelField = None

def safe_jsonable_encoder(obj: Any, **kwargs) -> Any:
    """
    Safe JSON encoder that handles ModelField and other problematic objects.
    """
    try:
        # Handle ModelField objects specifically (if available)
        if ModelField and isinstance(obj, ModelField):
            logger.warning("Attempting to serialize ModelField object, converting to dict")
            return {
                "name": getattr(obj, 'name', 'unknown'),
                "type_": str(getattr(obj, 'type_', 'unknown')),
                "default": getattr(obj, 'default', None),
                "required": getattr(obj, 'required', False)
            }
        
        # Handle objects that might cause serialization issues
        if hasattr(obj, '__dict__') and not hasattr(obj, 'dict'):
            # This might be a problematic object that can't be serialized
            logger.warning(f"Attempting to serialize object of type {type(obj)} that might cause issues")
            try:
                return vars(obj)
            except TypeError:
                return {
                    "type": str(type(obj)),
                    "error": "Object cannot be serialized",
                    "str_repr": str(obj)
                }
        
        # Handle BaseModel objects
        if isinstance(obj, BaseModel):
            return obj.dict()
        
        # Handle dictionaries with ModelField values
        if isinstance(obj, dict):
            result = {}
            for key, value in obj.items():
                if ModelField and isinstance(value, ModelField):
                    result[key] = safe_jsonable_encoder(value)
                else:
                    result[key] = safe_jsonable_encoder(value)
            return result
        
        # Handle lists with ModelField values
        if isinstance(obj, list):
            return [safe_jsonable_encoder(item) for item in obj]
        
        # Handle tuples
        if isinstance(obj, tuple):
            return list(safe_jsonable_encoder(item) for item in obj)
        
        # For other objects, try the standard encoder
        return jsonable_encoder(obj, **kwargs)
        
    except Exception as e:
        logger.error(f"Serialization error for object {type(obj)}: {e}")
        # Return a safe fallback
        return {
            "error": "Serialization failed",
            "type": str(type(obj)),
            "message": str(e)
        }

def safe_json_response(data: Any, **kwargs) -> Dict[str, Any]:
    """
    Create a safe JSON response that handles serialization errors.
    """
    try:
        return safe_jsonable_encoder(data, **kwargs)
    except Exception as e:
        logger.error(f"Failed to create safe JSON response: {e}")
        return {
            "error": "Response serialization failed",
            "message": str(e),
            "data": None
        }

def handle_model_field_serialization(obj: Any) -> Any:
    """
    Specifically handle ModelField serialization issues.
    """
    if ModelField and isinstance(obj, ModelField):
        return {
            "field_name": getattr(obj, 'name', 'unknown'),
            "field_type": str(getattr(obj, 'type_', 'unknown')),
            "is_required": getattr(obj, 'required', False),
            "default_value": getattr(obj, 'default', None)
        }
    
    if isinstance(obj, dict):
        return {k: handle_model_field_serialization(v) for k, v in obj.items()}
    
    if isinstance(obj, (list, tuple)):
        return [handle_model_field_serialization(item) for item in obj]
    
    return obj
