"""
Integration Provider Registry
============================

Enterprise integration provider registry for managing and coordinating
integration providers across the data governance system.

This service provides:
- Integration provider registration and management
- Provider discovery and selection
- Provider configuration management
- Provider health monitoring
- Provider performance tracking
- Provider fallback mechanisms
- Provider authentication management
- Provider data transformation
"""

import logging
from typing import Dict, List, Any, Optional, Type
from datetime import datetime, timedelta
import json
import asyncio
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)


class IntegrationProvider(ABC):
    """Abstract base class for integration providers"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.provider_id = config.get("provider_id", "")
        self.provider_name = config.get("provider_name", "")
        self.provider_type = config.get("provider_type", "")
        self.connection_status = "disconnected"
        self.last_health_check = None
        self.error_count = 0
        self.success_count = 0
    
    @abstractmethod
    async def connect(self) -> bool:
        """Connect to the integration provider"""
        pass
    
    @abstractmethod
    async def disconnect(self) -> bool:
        """Disconnect from the integration provider"""
        pass
    
    @abstractmethod
    async def sync_data(self, sync_config: Dict[str, Any]) -> Dict[str, Any]:
        """Sync data with the integration provider"""
        pass
    
    @abstractmethod
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check on the integration provider"""
        pass
    
    async def get_provider_info(self) -> Dict[str, Any]:
        """Get provider information"""
        return {
            "provider_id": self.provider_id,
            "provider_name": self.provider_name,
            "provider_type": self.provider_type,
            "connection_status": self.connection_status,
            "last_health_check": self.last_health_check,
            "error_count": self.error_count,
            "success_count": self.success_count
        }


class DatabaseProvider(IntegrationProvider):
    """Database integration provider"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.connection_string = config.get("connection_string", "")
        self.database_type = config.get("database_type", "unknown")
    
    async def connect(self) -> bool:
        """Connect to database"""
        try:
            # Real database connection logic
            from app.services.data_source_connection_service import DataSourceConnectionService
            from app.services.database_health_monitor import DatabaseHealthMonitor
            
            connection_service = DataSourceConnectionService()
            health_monitor = DatabaseHealthMonitor()
            
            # Validate connection string
            if not self.connection_string:
                raise ValueError("Connection string is required")
            
            # Test connection
            connection_result = await connection_service.test_connection({
                "connection_string": self.connection_string,
                "database_type": self.database_type
            })
            
            if connection_result.get("success", False):
                self.connection_status = "connected"
                logger.info(f"Connected to database provider: {self.provider_name}")
                
                # Register with health monitor
                await health_monitor.register_database(self.provider_id, self.connection_string)
                return True
            else:
                self.connection_status = "failed"
                logger.error(f"Failed to connect to database provider {self.provider_name}: {connection_result.get('error', 'Unknown error')}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to connect to database provider {self.provider_name}: {e}")
            self.connection_status = "failed"
            return False
    
    async def disconnect(self) -> bool:
        """Disconnect from database"""
        try:
            # Real database disconnection logic
            from app.services.data_source_connection_service import DataSourceConnectionService
            from app.services.database_health_monitor import DatabaseHealthMonitor
            
            connection_service = DataSourceConnectionService()
            health_monitor = DatabaseHealthMonitor()
            
            # Close database connection
            disconnect_result = await connection_service.close_connection(self.provider_id)
            
            if disconnect_result.get("success", False):
                self.connection_status = "disconnected"
                logger.info(f"Disconnected from database provider: {self.provider_name}")
                
                # Unregister from health monitor
                await health_monitor.unregister_database(self.provider_id)
                return True
            else:
                logger.error(f"Failed to disconnect from database provider {self.provider_name}: {disconnect_result.get('error', 'Unknown error')}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to disconnect from database provider {self.provider_name}: {e}")
            return False
    
    async def sync_data(self, sync_config: Dict[str, Any]) -> Dict[str, Any]:
        """Sync data with database"""
        try:
            # Real database synchronization logic
            from app.services.catalog_service import EnhancedCatalogService
            from app.services.data_source_service import DataSourceService
            
            catalog_service = EnhancedCatalogService()
            data_source_service = DataSourceService()
            
            start_time = datetime.utcnow()
            
            # Get sync configuration
            sync_type = sync_config.get("sync_type", "full")
            tables = sync_config.get("tables", [])
            filters = sync_config.get("filters", {})
            
            # Perform actual data synchronization
            sync_result = await catalog_service.sync_catalog_items(
                data_source_id=self.provider_id,
                sync_type=sync_type,
                tables=tables,
                filters=filters
            )
            
            end_time = datetime.utcnow()
            sync_duration = (end_time - start_time).total_seconds()
            
            if sync_result.get("success", False):
                self.success_count += 1
                return {
                    "success": True,
                    "provider_id": self.provider_id,
                    "sync_type": "database",
                    "records_synced": sync_result.get("records_synced", 0),
                    "sync_duration": sync_duration,
                    "timestamp": datetime.utcnow().isoformat(),
                    "details": sync_result.get("details", {})
                }
            else:
                self.error_count += 1
                return {
                    "success": False,
                    "provider_id": self.provider_id,
                    "error": sync_result.get("error", "Unknown sync error"),
                    "timestamp": datetime.utcnow().isoformat()
                }
                
        except Exception as e:
            self.error_count += 1
            logger.error(f"Database sync failed for {self.provider_name}: {e}")
            return {
                "success": False,
                "provider_id": self.provider_id,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check on database"""
        try:
            # Real database health check logic
            from app.services.database_health_monitor import DatabaseHealthMonitor
            from app.services.data_source_connection_service import DataSourceConnectionService
            
            health_monitor = DatabaseHealthMonitor()
            connection_service = DataSourceConnectionService()
            
            start_time = datetime.utcnow()
            
            # Perform actual health check
            health_result = await health_monitor.check_database_health(self.provider_id)
            
            end_time = datetime.utcnow()
            response_time = (end_time - start_time).total_seconds()
            self.last_health_check = datetime.utcnow().isoformat()
            
            if health_result.get("healthy", False):
                return {
                    "success": True,
                    "provider_id": self.provider_id,
                    "status": "healthy",
                    "response_time": response_time,
                    "database_type": self.database_type,
                    "timestamp": self.last_health_check,
                    "metrics": health_result.get("metrics", {})
                }
            else:
                return {
                    "success": False,
                    "provider_id": self.provider_id,
                    "status": "unhealthy",
                    "error": health_result.get("error", "Health check failed"),
                    "response_time": response_time,
                    "timestamp": self.last_health_check
                }
                
        except Exception as e:
            logger.error(f"Health check failed for database provider {self.provider_name}: {e}")
            return {
                "success": False,
                "provider_id": self.provider_id,
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }


class APIProvider(IntegrationProvider):
    """API integration provider"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.api_endpoint = config.get("api_endpoint", "")
        self.api_key = config.get("api_key", "")
        self.api_version = config.get("api_version", "v1")
    
    async def connect(self) -> bool:
        """Connect to API"""
        try:
            # Real API connection logic
            import aiohttp
            from app.services.enterprise_integration_service import EnterpriseIntegrationService
            
            integration_service = EnterpriseIntegrationService()
            
            # Validate API endpoint
            if not self.api_endpoint:
                raise ValueError("API endpoint is required")
            
            # Test API connection
            async with aiohttp.ClientSession() as session:
                headers = {"Authorization": f"Bearer {self.api_key}"} if self.api_key else {}
                
                try:
                    async with session.get(f"{self.api_endpoint}/health", headers=headers, timeout=10) as response:
                        if response.status == 200:
                            self.connection_status = "connected"
                            logger.info(f"Connected to API provider: {self.provider_name}")
                            
                            # Register with integration service
                            await integration_service.register_api_provider(
                                self.provider_id,
                                self.api_endpoint,
                                self.api_key,
                                self.api_version
                            )
                            return True
                        else:
                            self.connection_status = "failed"
                            logger.error(f"API health check failed for {self.provider_name}: {response.status}")
                            return False
                except Exception as e:
                    self.connection_status = "failed"
                    logger.error(f"API connection failed for {self.provider_name}: {e}")
                    return False
                    
        except Exception as e:
            logger.error(f"Failed to connect to API provider {self.provider_name}: {e}")
            self.connection_status = "failed"
            return False
    
    async def disconnect(self) -> bool:
        """Disconnect from API"""
        try:
            # Real API disconnection logic
            from app.services.enterprise_integration_service import EnterpriseIntegrationService
            
            integration_service = EnterpriseIntegrationService()
            
            # Unregister API provider
            unregister_result = await integration_service.unregister_api_provider(self.provider_id)
            
            if unregister_result.get("success", False):
                self.connection_status = "disconnected"
                logger.info(f"Disconnected from API provider: {self.provider_name}")
                return True
            else:
                logger.error(f"Failed to disconnect from API provider {self.provider_name}: {unregister_result.get('error', 'Unknown error')}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to disconnect from API provider {self.provider_name}: {e}")
            return False
    
    async def sync_data(self, sync_config: Dict[str, Any]) -> Dict[str, Any]:
        """Sync data with API"""
        try:
            # Real API data synchronization logic
            import aiohttp
            from app.services.enterprise_integration_service import EnterpriseIntegrationService
            
            integration_service = EnterpriseIntegrationService()
            
            start_time = datetime.utcnow()
            
            # Get sync configuration
            endpoint = sync_config.get("endpoint", "/data")
            method = sync_config.get("method", "GET")
            payload = sync_config.get("payload", {})
            
            # Perform actual API data synchronization
            async with aiohttp.ClientSession() as session:
                headers = {"Authorization": f"Bearer {self.api_key}"} if self.api_key else {}
                
                if method.upper() == "GET":
                    async with session.get(f"{self.api_endpoint}{endpoint}", headers=headers, timeout=30) as response:
                        if response.status == 200:
                            data = await response.json()
                            records_synced = len(data.get("records", []))
                            
                            # Process the data through integration service
                            sync_result = await integration_service.process_api_data(
                                self.provider_id,
                                data,
                                sync_config
                            )
                            
                            end_time = datetime.utcnow()
                            sync_duration = (end_time - start_time).total_seconds()
                            
                            if sync_result.get("success", False):
                                self.success_count += 1
                                return {
                                    "success": True,
                                    "provider_id": self.provider_id,
                                    "sync_type": "api",
                                    "records_synced": records_synced,
                                    "api_calls": 1,
                                    "sync_duration": sync_duration,
                                    "timestamp": datetime.utcnow().isoformat(),
                                    "details": sync_result.get("details", {})
                                }
                            else:
                                self.error_count += 1
                                return {
                                    "success": False,
                                    "provider_id": self.provider_id,
                                    "error": sync_result.get("error", "Data processing failed"),
                                    "timestamp": datetime.utcnow().isoformat()
                                }
                        else:
                            self.error_count += 1
                            return {
                                "success": False,
                                "provider_id": self.provider_id,
                                "error": f"API request failed with status {response.status}",
                                "timestamp": datetime.utcnow().isoformat()
                            }
                else:
                    # Handle POST/PUT requests
                    async with session.post(f"{self.api_endpoint}{endpoint}", json=payload, headers=headers, timeout=30) as response:
                        if response.status in [200, 201]:
                            data = await response.json()
                            records_synced = len(data.get("records", []))
                            
                            end_time = datetime.utcnow()
                            sync_duration = (end_time - start_time).total_seconds()
                            
                            self.success_count += 1
                            return {
                                "success": True,
                                "provider_id": self.provider_id,
                                "sync_type": "api",
                                "records_synced": records_synced,
                                "api_calls": 1,
                                "sync_duration": sync_duration,
                                "timestamp": datetime.utcnow().isoformat()
                            }
                        else:
                            self.error_count += 1
                            return {
                                "success": False,
                                "provider_id": self.provider_id,
                                "error": f"API request failed with status {response.status}",
                                "timestamp": datetime.utcnow().isoformat()
                            }
                            
        except Exception as e:
            self.error_count += 1
            logger.error(f"API sync failed for {self.provider_name}: {e}")
            return {
                "success": False,
                "provider_id": self.provider_id,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check on API"""
        try:
            # Real API health check logic
            import aiohttp
            from app.services.enterprise_integration_service import EnterpriseIntegrationService
            
            integration_service = EnterpriseIntegrationService()
            
            start_time = datetime.utcnow()
            
            # Perform actual API health check
            async with aiohttp.ClientSession() as session:
                headers = {"Authorization": f"Bearer {self.api_key}"} if self.api_key else {}
                
                try:
                    async with session.get(f"{self.api_endpoint}/health", headers=headers, timeout=5) as response:
                        end_time = datetime.utcnow()
                        response_time = (end_time - start_time).total_seconds()
                        self.last_health_check = datetime.utcnow().isoformat()
                        
                        if response.status == 200:
                            health_data = await response.json()
                            return {
                                "success": True,
                                "provider_id": self.provider_id,
                                "status": "healthy",
                                "response_time": response_time,
                                "api_version": self.api_version,
                                "timestamp": self.last_health_check,
                                "health_data": health_data
                            }
                        else:
                            return {
                                "success": False,
                                "provider_id": self.provider_id,
                                "status": "unhealthy",
                                "error": f"API health check failed with status {response.status}",
                                "response_time": response_time,
                                "timestamp": self.last_health_check
                            }
                except Exception as e:
                    end_time = datetime.utcnow()
                    response_time = (end_time - start_time).total_seconds()
                    return {
                        "success": False,
                        "provider_id": self.provider_id,
                        "status": "unhealthy",
                        "error": f"API connection failed: {str(e)}",
                        "response_time": response_time,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    
        except Exception as e:
            logger.error(f"Health check failed for API provider {self.provider_name}: {e}")
            return {
                "success": False,
                "provider_id": self.provider_id,
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }


class FileSystemProvider(IntegrationProvider):
    """File system integration provider"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.file_path = config.get("file_path", "")
        self.file_type = config.get("file_type", "unknown")
    
    async def connect(self) -> bool:
        """Connect to file system"""
        try:
            # Real file system connection logic
            import os
            from app.services.file_system_service import FileSystemService
            
            file_system_service = FileSystemService()
            
            # Validate file path
            if not self.file_path:
                raise ValueError("File path is required")
            
            # Check if path exists and is accessible
            if not os.path.exists(self.file_path):
                raise FileNotFoundError(f"File path does not exist: {self.file_path}")
            
            # Test file system access
            access_result = await file_system_service.test_file_system_access(self.file_path)
            
            if access_result.get("success", False):
                self.connection_status = "connected"
                logger.info(f"Connected to file system provider: {self.provider_name}")
                return True
            else:
                self.connection_status = "failed"
                logger.error(f"Failed to connect to file system provider {self.provider_name}: {access_result.get('error', 'Unknown error')}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to connect to file system provider {self.provider_name}: {e}")
            self.connection_status = "failed"
            return False
    
    async def disconnect(self) -> bool:
        """Disconnect from file system"""
        try:
            # Real file system disconnection logic
            from app.services.file_system_service import FileSystemService
            
            file_system_service = FileSystemService()
            
            # Close file system connection
            disconnect_result = await file_system_service.close_file_system_connection(self.provider_id)
            
            if disconnect_result.get("success", False):
                self.connection_status = "disconnected"
                logger.info(f"Disconnected from file system provider: {self.provider_name}")
                return True
            else:
                logger.error(f"Failed to disconnect from file system provider {self.provider_name}: {disconnect_result.get('error', 'Unknown error')}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to disconnect from file system provider {self.provider_name}: {e}")
            return False
    
    async def sync_data(self, sync_config: Dict[str, Any]) -> Dict[str, Any]:
        """Sync data with file system"""
        try:
            # Real file system data synchronization logic
            from app.services.file_system_service import FileSystemService
            from app.services.data_import_service import DataImportService
            
            file_system_service = FileSystemService()
            import_service = DataImportService()
            
            start_time = datetime.utcnow()
            
            # Get sync configuration
            sync_type = sync_config.get("sync_type", "full")
            file_patterns = sync_config.get("file_patterns", ["*"])
            recursive = sync_config.get("recursive", True)
            
            # Perform actual file system synchronization
            sync_result = await file_system_service.sync_file_system_data(
                file_path=self.file_path,
                sync_type=sync_type,
                file_patterns=file_patterns,
                recursive=recursive
            )
            
            end_time = datetime.utcnow()
            sync_duration = (end_time - start_time).total_seconds()
            
            if sync_result.get("success", False):
                self.success_count += 1
                return {
                    "success": True,
                    "provider_id": self.provider_id,
                    "sync_type": "file_system",
                    "files_processed": sync_result.get("files_processed", 0),
                    "data_size_mb": sync_result.get("data_size_mb", 0),
                    "sync_duration": sync_duration,
                    "timestamp": datetime.utcnow().isoformat(),
                    "details": sync_result.get("details", {})
                }
            else:
                self.error_count += 1
                return {
                    "success": False,
                    "provider_id": self.provider_id,
                    "error": sync_result.get("error", "File system sync failed"),
                    "timestamp": datetime.utcnow().isoformat()
                }
                
        except Exception as e:
            self.error_count += 1
            logger.error(f"File system sync failed for {self.provider_name}: {e}")
            return {
                "success": False,
                "provider_id": self.provider_id,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check on file system"""
        try:
            # Real file system health check logic
            import os
            from app.services.file_system_service import FileSystemService
            
            file_system_service = FileSystemService()
            
            start_time = datetime.utcnow()
            
            # Perform actual file system health check
            health_result = await file_system_service.check_file_system_health(self.file_path)
            
            end_time = datetime.utcnow()
            response_time = (end_time - start_time).total_seconds()
            self.last_health_check = datetime.utcnow().isoformat()
            
            if health_result.get("healthy", False):
                return {
                    "success": True,
                    "provider_id": self.provider_id,
                    "status": "healthy",
                    "response_time": response_time,
                    "file_type": self.file_type,
                    "timestamp": self.last_health_check,
                    "metrics": health_result.get("metrics", {})
                }
            else:
                return {
                    "success": False,
                    "provider_id": self.provider_id,
                    "status": "unhealthy",
                    "error": health_result.get("error", "File system health check failed"),
                    "response_time": response_time,
                    "timestamp": self.last_health_check
                }
                
        except Exception as e:
            logger.error(f"Health check failed for file system provider {self.provider_name}: {e}")
            return {
                "success": False,
                "provider_id": self.provider_id,
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }


class IntegrationProviderRegistry:
    """Registry for managing integration providers"""
    
    _providers: Dict[str, IntegrationProvider] = {}
    _provider_types: Dict[str, Type[IntegrationProvider]] = {
        "database": DatabaseProvider,
        "api": APIProvider,
        "file_system": FileSystemProvider
    }
    
    @classmethod
    def register_provider(cls, provider_id: str, provider_config: Dict[str, Any]) -> bool:
        """Register a new integration provider"""
        try:
            provider_type = provider_config.get("provider_type", "")
            
            if provider_type not in cls._provider_types:
                logger.error(f"Unknown provider type: {provider_type}")
                return False
            
            provider_class = cls._provider_types[provider_type]
            provider = provider_class(provider_config)
            
            cls._providers[provider_id] = provider
            logger.info(f"Registered provider: {provider_id} ({provider_type})")
            return True
            
        except Exception as e:
            logger.error(f"Failed to register provider {provider_id}: {e}")
            return False
    
    @classmethod
    def get(cls, provider_id: str) -> Optional[IntegrationProvider]:
        """Get a provider by ID"""
        return cls._providers.get(provider_id)
    
    @classmethod
    def list_providers(cls) -> List[Dict[str, Any]]:
        """List all registered providers"""
        providers = []
        
        for provider_id, provider in cls._providers.items():
            providers.append({
                "provider_id": provider_id,
                "provider_name": provider.provider_name,
                "provider_type": provider.provider_type,
                "connection_status": provider.connection_status,
                "last_health_check": provider.last_health_check,
                "error_count": provider.error_count,
                "success_count": provider.success_count
            })
        
        return providers
    
    @classmethod
    def remove_provider(cls, provider_id: str) -> bool:
        """Remove a provider from the registry"""
        try:
            if provider_id in cls._providers:
                provider = cls._providers[provider_id]
                
                # Disconnect provider if connected
                if provider.connection_status == "connected":
                    asyncio.create_task(provider.disconnect())
                
                del cls._providers[provider_id]
                logger.info(f"Removed provider: {provider_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to remove provider {provider_id}: {e}")
            return False
    
    @classmethod
    async def health_check_all(cls) -> Dict[str, Any]:
        """Perform health check on all providers"""
        try:
            health_results = {}
            total_providers = len(cls._providers)
            healthy_providers = 0
            
            for provider_id, provider in cls._providers.items():
                try:
                    health_result = await provider.health_check()
                    health_results[provider_id] = health_result
                    
                    if health_result.get("success", False):
                        healthy_providers += 1
                        
                except Exception as e:
                    logger.error(f"Health check failed for provider {provider_id}: {e}")
                    health_results[provider_id] = {
                        "success": False,
                        "error": str(e),
                        "timestamp": datetime.utcnow().isoformat()
                    }
            
            return {
                "success": True,
                "total_providers": total_providers,
                "healthy_providers": healthy_providers,
                "unhealthy_providers": total_providers - healthy_providers,
                "health_rate": healthy_providers / total_providers if total_providers > 0 else 0,
                "provider_results": health_results,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to perform health check on all providers: {e}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    @classmethod
    async def sync_all_providers(cls, sync_config: Dict[str, Any]) -> Dict[str, Any]:
        """Sync data with all providers"""
        try:
            sync_results = {}
            total_providers = len(cls._providers)
            successful_syncs = 0
            
            for provider_id, provider in cls._providers.items():
                try:
                    sync_result = await provider.sync_data(sync_config)
                    sync_results[provider_id] = sync_result
                    
                    if sync_result.get("success", False):
                        successful_syncs += 1
                        
                except Exception as e:
                    logger.error(f"Sync failed for provider {provider_id}: {e}")
                    sync_results[provider_id] = {
                        "success": False,
                        "error": str(e),
                        "timestamp": datetime.utcnow().isoformat()
                    }
            
            return {
                "success": True,
                "total_providers": total_providers,
                "successful_syncs": successful_syncs,
                "failed_syncs": total_providers - successful_syncs,
                "success_rate": successful_syncs / total_providers if total_providers > 0 else 0,
                "sync_results": sync_results,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to sync all providers: {e}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    @classmethod
    def get_provider_stats(cls) -> Dict[str, Any]:
        """Get statistics for all providers"""
        try:
            stats = {
                "total_providers": len(cls._providers),
                "providers_by_type": {},
                "connection_status": {},
                "total_errors": 0,
                "total_successes": 0
            }
            
            for provider in cls._providers.values():
                # Count by type
                provider_type = provider.provider_type
                stats["providers_by_type"][provider_type] = stats["providers_by_type"].get(provider_type, 0) + 1
                
                # Count by connection status
                connection_status = provider.connection_status
                stats["connection_status"][connection_status] = stats["connection_status"].get(connection_status, 0) + 1
                
                # Sum errors and successes
                stats["total_errors"] += provider.error_count
                stats["total_successes"] += provider.success_count
            
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get provider stats: {e}")
            return {"error": str(e)}
    
    @classmethod
    def register_provider_type(cls, provider_type: str, provider_class: Type[IntegrationProvider]) -> bool:
        """Register a new provider type"""
        try:
            cls._provider_types[provider_type] = provider_class
            logger.info(f"Registered provider type: {provider_type}")
            return True
        except Exception as e:
            logger.error(f"Failed to register provider type {provider_type}: {e}")
            return False
