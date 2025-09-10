"""
Robust serialization utilities for FastAPI endpoints.
Handles all Pydantic versions and edge cases safely.
"""

from typing import Any, Dict, List, Optional, Union
import logging

logger = logging.getLogger(__name__)

def safe_serialize_model(model_instance: Any, model_class: Any) -> Dict[str, Any]:
    """
    Safely serialize a model instance to a dictionary.
    Handles all Pydantic versions and edge cases.
    """
    try:
        if model_instance is None:
            return {}
        
        # Try Pydantic v2 first
        if hasattr(model_class, 'model_validate'):
            try:
                validated = model_class.model_validate(model_instance, from_attributes=True)
                if hasattr(validated, 'model_dump'):
                    return validated.model_dump()
                elif hasattr(validated, 'dict'):
                    return validated.dict()
            except Exception as e:
                logger.warning(f"Pydantic v2 serialization failed: {e}")
        
        # Try Pydantic v1
        if hasattr(model_class, 'from_orm'):
            try:
                validated = model_class.from_orm(model_instance)
                if hasattr(validated, 'dict'):
                    return validated.dict()
                elif hasattr(validated, 'model_dump'):
                    return validated.model_dump()
            except Exception as e:
                logger.warning(f"Pydantic v1 serialization failed: {e}")
        
        # Fallback: direct conversion
        if hasattr(model_instance, '__dict__'):
            return {k: v for k, v in model_instance.__dict__.items() 
                   if not k.startswith('_')}
        
        # Last resort: return empty dict
        return {}
        
    except Exception as e:
        logger.error(f"Serialization error: {e}")
        return {}

def safe_serialize_list(model_instances: List[Any], model_class: Any) -> List[Dict[str, Any]]:
    """
    Safely serialize a list of model instances.
    """
    try:
        if not model_instances:
            return []
        
        return [safe_serialize_model(instance, model_class) for instance in model_instances]
        
    except Exception as e:
        logger.error(f"List serialization error: {e}")
        return []

def create_safe_response(data: Any, model_class: Any = None) -> Union[Dict[str, Any], List[Dict[str, Any]]]:
    """
    Create a safe response that won't cause serialization errors.
    """
    try:
        if isinstance(data, list):
            if model_class:
                return safe_serialize_list(data, model_class)
            else:
                return [safe_serialize_model(item, type(item)) for item in data]
        else:
            if model_class:
                return safe_serialize_model(data, model_class)
            else:
                return safe_serialize_model(data, type(data))
                
    except Exception as e:
        logger.error(f"Safe response creation error: {e}")
        return {}
