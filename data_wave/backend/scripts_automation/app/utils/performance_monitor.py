"""
Performance Monitor Utility
==========================

Basic performance monitoring utilities for the enterprise data governance platform.
"""

import time
import logging
import functools
from typing import Any, Callable, Dict, Optional
from contextlib import contextmanager

logger = logging.getLogger(__name__)

class PerformanceMonitor:
    """Basic performance monitoring utility"""
    
    def __init__(self):
        self.metrics = {}
    
    def record_metric(self, name: str, value: float, tags: Optional[Dict[str, str]] = None):
        """Record a performance metric"""
        if name not in self.metrics:
            self.metrics[name] = []
        self.metrics[name].append({
            'value': value,
            'timestamp': time.time(),
            'tags': tags or {}
        })
    
    def get_metric(self, name: str) -> Optional[float]:
        """Get the latest value for a metric"""
        if name in self.metrics and self.metrics[name]:
            return self.metrics[name][-1]['value']
        return None

# Global performance monitor instance
performance_monitor = PerformanceMonitor()

def monitor_performance(func_name: Optional[str] = None):
    """Decorator to monitor function performance"""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                return result
            finally:
                execution_time = time.time() - start_time
                name = func_name or f"{func.__module__}.{func.__name__}"
                performance_monitor.record_metric(name, execution_time)
        return wrapper
    return decorator

@contextmanager
def performance_context(name: str):
    """Context manager for performance monitoring"""
    start_time = time.time()
    try:
        yield
    finally:
        execution_time = time.time() - start_time
        performance_monitor.record_metric(name, execution_time)
