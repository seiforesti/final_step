"""
Cache Manager Utility
====================

Provides the CacheManager class for the enterprise data governance platform.
This module acts as a wrapper around the EnterpriseCache functionality.
"""

from .cache import EnterpriseCache, CacheConfig, CacheStats

class CacheManager(EnterpriseCache):
    """
    Cache Manager class that extends EnterpriseCache for backward compatibility.
    This provides the interface expected by scan_intelligence_service.
    """
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
    
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
