"""
Error Handler Utility
====================

Basic error handling utilities for the enterprise data governance platform.
"""

import logging
import traceback
from typing import Any, Callable, Dict, Optional, Type
from functools import wraps

logger = logging.getLogger(__name__)

def handle_service_error(
    error_type: Optional[Type[Exception]] = None,
    default_return: Any = None,
    log_error: bool = True,
    reraise: bool = False
):
    """
    Decorator to handle service errors gracefully.
    
    Args:
        error_type: Specific exception type to catch
        default_return: Value to return on error
        log_error: Whether to log the error
        reraise: Whether to re-raise the exception
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                if error_type is None or isinstance(e, error_type):
                    if log_error:
                        logger.error(f"Error in {func.__name__}: {str(e)}")
                        logger.debug(f"Traceback: {traceback.format_exc()}")
                    
                    if reraise:
                        raise
                    
                    return default_return
                else:
                    raise
        return wrapper
    return decorator

class ServiceError(Exception):
    """Base exception for service errors"""
    pass

class ConfigurationError(ServiceError):
    """Configuration related errors"""
    pass

class ValidationError(ServiceError):
    """Validation related errors"""
    pass

class ConnectionError(ServiceError):
    """Connection related errors"""
    pass

def safe_execute(func: Callable, *args, **kwargs) -> Optional[Any]:
    """
    Safely execute a function and return None on any exception.
    
    Args:
        func: Function to execute
        *args: Function arguments
        **kwargs: Function keyword arguments
    
    Returns:
        Function result or None on error
    """
    try:
        return func(*args, **kwargs)
    except Exception as e:
        logger.error(f"Error executing {func.__name__}: {str(e)}")
        return None
