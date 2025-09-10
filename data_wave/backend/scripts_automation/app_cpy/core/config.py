"""
Enterprise Core Configuration

Comprehensive configuration management for the Enterprise Data Governance Platform
with environment-specific settings, security configurations, and advanced features.
"""

import os
from typing import Optional, List, Dict, Any
from pydantic import Field, validator, BaseSettings
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

class DatabaseConfig(BaseSettings):
    """Database configuration settings."""
    
    url: str = Field(
        default=os.getenv("DATABASE_URL", "mysql+pymysql://user:password@localhost:3306/pursightdb"),
        description="Database connection URL"
    )
    pool_size: int = Field(default=20, description="Connection pool size")
    max_overflow: int = Field(default=30, description="Maximum overflow connections")
    pool_timeout: int = Field(default=30, description="Pool timeout in seconds")
    pool_recycle: int = Field(default=3600, description="Pool recycle time in seconds")
    echo: bool = Field(default=False, description="Enable SQL echo for debugging")
    
    class Config:
        env_prefix = "DB_"

class RedisConfig(BaseSettings):
    """Redis configuration settings."""
    
    url: str = Field(
        default=os.getenv("REDIS_URL", "redis://data_governance_redis:6379/0"),
        description="Redis connection URL"
    )
    password: Optional[str] = Field(default=None, description="Redis password")
    max_connections: int = Field(default=50, description="Maximum Redis connections")
    retry_on_timeout: bool = Field(default=True, description="Retry on timeout")
    health_check_interval: int = Field(default=30, description="Health check interval")
    
    class Config:
        env_prefix = "REDIS_"

class SecurityConfig(BaseSettings):
    """Security configuration settings."""
    
    secret_key: str = Field(
        default=os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production"),
        description="Application secret key"
    )
    jwt_secret: str = Field(
        default=os.getenv("JWT_SECRET", "jwt-secret-key"),
        description="JWT signing secret"
    )
    jwt_algorithm: str = Field(default="HS256", description="JWT algorithm")
    jwt_expiration_hours: int = Field(default=24, description="JWT expiration in hours")
    password_min_length: int = Field(default=8, description="Minimum password length")
    max_login_attempts: int = Field(default=5, description="Maximum login attempts")
    session_timeout_minutes: int = Field(default=60, description="Session timeout in minutes")
    
    class Config:
        env_prefix = "SECURITY_"

class AzureConfig(BaseSettings):
    """Azure/Microsoft Purview configuration settings."""
    
    auth_type: Optional[str] = Field(default=os.getenv("AUTH_TYPE"), description="Authentication type")
    tenant_id: Optional[str] = Field(default=os.getenv("TENANT_ID"), description="Azure tenant ID")
    client_id: Optional[str] = Field(default=os.getenv("CLIENT_ID"), description="Azure client ID")
    client_secret: Optional[str] = Field(default=os.getenv("CLIENT_SECRET"), description="Azure client secret")
    purview_name: Optional[str] = Field(default=os.getenv("PURVIEW_NAME"), description="Purview account name")
    
    class Config:
        env_prefix = "AZURE_"

class ScanConfig(BaseSettings):
    """Scan configuration settings."""
    
    max_scan_rows: int = Field(
        default=int(os.getenv("MAX_SCAN_ROWS", "1000")),
        description="Maximum rows to scan"
    )
    scan_timeout_seconds: int = Field(default=1800, description="Scan timeout in seconds")
    concurrent_scans: int = Field(default=5, description="Maximum concurrent scans")
    scan_retry_attempts: int = Field(default=3, description="Scan retry attempts")
    scan_batch_size: int = Field(default=1000, description="Scan batch size")
    enable_incremental_scan: bool = Field(default=True, description="Enable incremental scanning")
    
    class Config:
        env_prefix = "SCAN_"

class ClassificationConfig(BaseSettings):
    """Classification configuration settings."""
    
    enable_classification: bool = Field(
        default=os.getenv("ENABLE_CLASSIFICATION", "true").lower() == "true",
        description="Enable automatic classification"
    )
    classification_threshold: float = Field(default=0.8, description="Classification confidence threshold")
    enable_ml_classification: bool = Field(default=True, description="Enable ML-based classification")
    ml_model_update_interval_hours: int = Field(default=24, description="ML model update interval")
    
    class Config:
        env_prefix = "CLASSIFICATION_"

class CacheConfig(BaseSettings):
    """Cache configuration settings."""
    
    enable_caching: bool = Field(default=True, description="Enable caching")
    default_ttl_seconds: int = Field(default=3600, description="Default cache TTL")
    max_cache_size: int = Field(default=10000, description="Maximum cache size")
    cache_strategy: str = Field(default="lru", description="Cache eviction strategy")
    
    class Config:
        env_prefix = "CACHE_"

class RateLimitConfig(BaseSettings):
    """Rate limiting configuration settings."""
    
    enable_rate_limiting: bool = Field(default=True, description="Enable rate limiting")
    api_requests_per_hour: int = Field(default=1000, description="API requests per hour per user")
    scan_requests_per_hour: int = Field(default=50, description="Scan requests per hour per user")
    export_requests_per_hour: int = Field(default=10, description="Export requests per hour per user")
    
    class Config:
        env_prefix = "RATE_LIMIT_"

class MonitoringConfig(BaseSettings):
    """Monitoring and observability configuration."""
    
    enable_metrics: bool = Field(default=True, description="Enable metrics collection")
    metrics_port: int = Field(default=8002, description="Metrics server port")
    log_level: str = Field(default="INFO", description="Logging level")
    enable_tracing: bool = Field(default=True, description="Enable distributed tracing")
    health_check_interval: int = Field(default=30, description="Health check interval")
    
    class Config:
        env_prefix = "MONITORING_"

class AIMLConfig(BaseSettings):
    """AI/ML configuration settings."""
    
    enable_ai_features: bool = Field(default=True, description="Enable AI/ML features")
    model_cache_dir: str = Field(default="./models", description="Model cache directory")
    huggingface_cache_dir: str = Field(default="./hf_cache", description="HuggingFace cache directory")
    max_model_memory_gb: int = Field(default=4, description="Maximum model memory usage in GB")
    enable_gpu: bool = Field(default=False, description="Enable GPU acceleration")
    
    # Specific model configurations
    embedding_model: str = Field(
        default="sentence-transformers/all-MiniLM-L6-v2",
        description="Embedding model name"
    )
    classification_model: str = Field(
        default="bert-base-uncased",
        description="Classification model name"
    )
    summarization_model: str = Field(
        default="facebook/bart-large-cnn",
        description="Summarization model name"
    )
    
    class Config:
        env_prefix = "AIML_"

class EnterpriseConfig(BaseSettings):
    """Enterprise-level configuration settings."""
    
    environment: str = Field(default="development", description="Environment (development/staging/production)")
    debug: bool = Field(default=True, description="Enable debug mode")
    testing: bool = Field(default=False, description="Enable testing mode")
    
    # Application settings
    app_name: str = Field(default="PurSight Enterprise Data Governance", description="Application name")
    app_version: str = Field(default="2.0.0", description="Application version")
    api_prefix: str = Field(default="/api/v1", description="API prefix")
    
    # CORS settings
    cors_origins: List[str] = Field(
        default=[
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173"
        ],
        description="CORS allowed origins"
    )
    
    # Enterprise features
    enable_enterprise_features: bool = Field(default=True, description="Enable enterprise features")
    enable_audit_logging: bool = Field(default=True, description="Enable audit logging")
    enable_compliance_tracking: bool = Field(default=True, description="Enable compliance tracking")
    enable_advanced_analytics: bool = Field(default=True, description="Enable advanced analytics")
    
    # Performance settings
    max_workers: int = Field(default=4, description="Maximum worker processes")
    request_timeout_seconds: int = Field(default=300, description="Request timeout")
    max_request_size_mb: int = Field(default=100, description="Maximum request size in MB")
    
    @validator('environment')
    def validate_environment(cls, v):
        allowed = ['development', 'staging', 'production']
        if v not in allowed:
            raise ValueError(f'Environment must be one of {allowed}')
        return v
    
    class Config:
        env_prefix = "ENTERPRISE_"
        case_sensitive = False

class Settings:
    """
    Main settings class that combines all configuration sections.
    
    This class provides a centralized configuration management system
    for the Enterprise Data Governance Platform.
    """
    
    def __init__(self):
        # Load all configuration sections
        self.database = DatabaseConfig()
        self.redis = RedisConfig()
        self.security = SecurityConfig()
        self.azure = AzureConfig()
        self.scan = ScanConfig()
        self.classification = ClassificationConfig()
        self.cache = CacheConfig()
        self.rate_limit = RateLimitConfig()
        self.monitoring = MonitoringConfig()
        self.aiml = AIMLConfig()
        self.enterprise = EnterpriseConfig()
        
        # Legacy compatibility properties
        self.AUTH_TYPE = self.azure.auth_type
        self.TENANT_ID = self.azure.tenant_id
        self.CLIENT_ID = self.azure.client_id
        self.CLIENT_SECRET = self.azure.client_secret
        self.PURVIEW_NAME = self.azure.purview_name
        self.MAX_SCAN_ROWS = self.scan.max_scan_rows
        self.ENABLE_CLASSIFICATION = self.classification.enable_classification
        self.DATABASE_URL = self.database.url
        
        # Configure logging based on settings
        self._configure_logging()
    
    def _configure_logging(self):
        """Configure logging based on settings."""
        log_level = getattr(logging, self.monitoring.log_level.upper())
        
        # Basic logging configuration
        logging.basicConfig(
            level=log_level,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        # Set specific logger levels
        if self.enterprise.environment == 'production':
            # More restrictive logging in production
            logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)
            logging.getLogger('redis').setLevel(logging.WARNING)
        else:
            # More verbose logging in development
            if self.database.echo:
                logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)
    
    def get_database_url(self, async_driver: bool = False) -> str:
        """
        Get database URL with optional async driver.
        
        Args:
            async_driver: Whether to use async driver
            
        Returns:
            Database URL string
        """
        url = self.database.url
        if async_driver and 'mysql+pymysql' in url:
            url = url.replace('mysql+pymysql', 'mysql+aiomysql')
        elif async_driver and 'postgresql+psycopg2' in url:
            url = url.replace('postgresql+psycopg2', 'postgresql+asyncpg')
        return url
    
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.enterprise.environment == 'production'
    
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.enterprise.environment == 'development'
    
    def get_feature_flags(self) -> Dict[str, bool]:
        """Get all feature flags."""
        return {
            'enterprise_features': self.enterprise.enable_enterprise_features,
            'ai_features': self.aiml.enable_ai_features,
            'classification': self.classification.enable_classification,
            'ml_classification': self.classification.enable_ml_classification,
            'caching': self.cache.enable_caching,
            'rate_limiting': self.rate_limit.enable_rate_limiting,
            'metrics': self.monitoring.enable_metrics,
            'tracing': self.monitoring.enable_tracing,
            'audit_logging': self.enterprise.enable_audit_logging,
            'compliance_tracking': self.enterprise.enable_compliance_tracking,
            'advanced_analytics': self.enterprise.enable_advanced_analytics,
            'incremental_scan': self.scan.enable_incremental_scan,
            'gpu': self.aiml.enable_gpu
        }
    
    def get_performance_settings(self) -> Dict[str, Any]:
        """Get performance-related settings."""
        return {
            'max_workers': self.enterprise.max_workers,
            'request_timeout': self.enterprise.request_timeout_seconds,
            'max_request_size_mb': self.enterprise.max_request_size_mb,
            'database_pool_size': self.database.pool_size,
            'redis_max_connections': self.redis.max_connections,
            'concurrent_scans': self.scan.concurrent_scans,
            'scan_batch_size': self.scan.scan_batch_size,
            'cache_max_size': self.cache.max_cache_size
        }
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert all settings to dictionary."""
        return {
            'database': self.database.dict(),
            'redis': self.redis.dict(),
            'security': self.security.dict(exclude={'secret_key', 'jwt_secret', 'client_secret'}),
            'azure': self.azure.dict(exclude={'client_secret'}),
            'scan': self.scan.dict(),
            'classification': self.classification.dict(),
            'cache': self.cache.dict(),
            'rate_limit': self.rate_limit.dict(),
            'monitoring': self.monitoring.dict(),
            'aiml': self.aiml.dict(),
            'enterprise': self.enterprise.dict()
        }

# Global settings instance
settings = Settings()

# Export commonly used settings for backward compatibility
DATABASE_URL = settings.DATABASE_URL
AUTH_TYPE = settings.AUTH_TYPE
TENANT_ID = settings.TENANT_ID
CLIENT_ID = settings.CLIENT_ID
CLIENT_SECRET = settings.CLIENT_SECRET
PURVIEW_NAME = settings.PURVIEW_NAME
MAX_SCAN_ROWS = settings.MAX_SCAN_ROWS
ENABLE_CLASSIFICATION = settings.ENABLE_CLASSIFICATION