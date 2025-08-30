"""
Cache Manager Utility
====================

Provides the CacheManager class for the enterprise data governance platform.
This module acts as a wrapper around the EnterpriseCache functionality.
"""

import threading
from .cache import EnterpriseCache, CacheConfig, CacheStats

class CacheManager(EnterpriseCache):
    """
    Cache Manager class that extends EnterpriseCache for backward compatibility.
    This provides the interface expected by scan_intelligence_service.
    """
    
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls, *args, **kwargs):
        """Ensure only one instance exists (Singleton pattern)"""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self, *args, **kwargs):
        # Only initialize once (Singleton pattern)
        if hasattr(self, '_initialized'):
            return
        self._initialized = True
        
        # Don't start background tasks during initialization
        # They will be started when explicitly requested
        super().__init__(*args, **kwargs)
        # Override the background task startup
        if hasattr(self, '_background_tasks_started'):
            self._background_tasks_started = False
    
    # Add any additional methods that might be expected by the scan_intelligence_service
    def get_cache_stats(self) -> CacheStats:
        """Get cache statistics"""
        return self.get_stats()
    
    def clear_cache(self):
        """Clear all cache entries"""
        return self.clear()
    
    def get_cache_size(self) -> int:
        """Get current cache size"""
        return self.get_size()
