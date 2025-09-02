"""Enhanced service for managing data sources with advanced monitoring."""

from typing import List, Optional, Dict, Any, Union, cast, Sequence, Tuple
from sqlmodel import Session, select, func, text, Column, desc, or_
from app.models.scan_models import (
    DataSource, DataSourceType, DataSourceLocation, DataSourceStatus,
    Environment, Criticality, DataClassification, ScanFrequency, Scan, ScanResult,
    DataSourceHealthResponse, UserFavorite, QualityMetric, GrowthMetric,
    CloudProvider, ScanRuleSet
)
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.sql.expression import Select
import logging
from datetime import datetime, timedelta
from app.services.secret_manager import get_secret, set_secret, delete_secret
import uuid
from cryptography.fernet import Fernet
import base64
import hashlib
import time
from sqlalchemy import create_engine
from sqlalchemy.types import String

# Setup logging
logger = logging.getLogger(__name__)

# Encryption key derived from application secret
def get_encryption_key(app_secret: str) -> bytes:
    """Generate a Fernet key from an application secret."""
    # Use SHA-256 to get a consistent length hash
    digest = hashlib.sha256(app_secret.encode()).digest()
    # Convert to base64 URL-safe format as required by Fernet
    return base64.urlsafe_b64encode(digest)


class DataSourceService:
    """Enhanced service for managing data sources with advanced monitoring."""
    
    @staticmethod
    def create_data_source(
        session: Session,
        name: str,
        source_type: Union[DataSourceType, str],
        location: Union[DataSourceLocation, str],
        host: str,
        port: int,
        username: str,
        password: str,
        database_name: Optional[str] = None,
        description: Optional[str] = None,
        connection_properties: Optional[Dict[str, Any]] = None,
        secret_manager_type: str = "local",
        use_encryption: bool = False,
        app_secret: Optional[str] = None,
        environment: Optional[Environment] = None,
        criticality: Optional[Criticality] = None,
        data_classification: Optional[DataClassification] = None,
        owner: Optional[str] = None,
        team: Optional[str] = None,
        tags: Optional[List[str]] = None,
        scan_frequency: Optional[ScanFrequency] = None,
        cloud_provider: Optional[CloudProvider] = None,
        cloud_config: Optional[Dict[str, Any]] = None,
        replica_config: Optional[Dict[str, Any]] = None,
        ssl_config: Optional[Dict[str, str]] = None,
        pool_size: Optional[int] = None,
        max_overflow: Optional[int] = None,
        pool_timeout: Optional[int] = None,
        created_by: Optional[str] = None
    ) -> DataSource:
        """Create a new data source with enhanced fields."""
        try:
            # Convert string enums to enum types if needed
            if isinstance(source_type, str):
                source_type = DataSourceType(source_type)
            if isinstance(location, str):
                location = DataSourceLocation(location)
            if isinstance(environment, str):
                environment = Environment(environment)
            if isinstance(criticality, str):
                criticality = Criticality(criticality)
            if isinstance(data_classification, str):
                data_classification = DataClassification(data_classification)
            if isinstance(scan_frequency, str):
                scan_frequency = ScanFrequency(scan_frequency)
            if isinstance(cloud_provider, str):
                cloud_provider = CloudProvider(cloud_provider)
            
            # Generate a unique secret name
            secret_name = f"datasource_{uuid.uuid4()}"
            
            # Store the password in the secret manager or encrypt it
            if use_encryption and app_secret:
                # Encrypt the password before storing it
                key = get_encryption_key(app_secret)
                f = Fernet(key)
                encrypted_password = f.encrypt(password.encode()).decode()
                
                # Store the encrypted password
                set_secret(secret_name, encrypted_password)
            else:
                # Store the password directly
                set_secret(secret_name, password)
                
            data_source = DataSource(
                name=name,
                description=description,
                source_type=source_type,
                location=location,
                host=host,
                port=port,
                username=username,
                password_secret=secret_name,
                secret_manager_type=secret_manager_type,
                use_encryption=use_encryption,
                database_name=database_name,
                connection_properties=connection_properties,
                status=DataSourceStatus.PENDING,
                environment=environment,
                criticality=criticality or Criticality.MEDIUM,
                data_classification=data_classification or DataClassification.INTERNAL,
                owner=owner or created_by,  # Use created_by as owner if not specified
                team=team,
                tags=tags,
                scan_frequency=scan_frequency or ScanFrequency.WEEKLY,
                monitoring_enabled=True,  # Enable monitoring by default
                backup_enabled=False,  # Backup disabled by default
                encryption_enabled=use_encryption,
                cloud_provider=cloud_provider,
                cloud_config=cloud_config,
                replica_config=replica_config,
                ssl_config=ssl_config,
                pool_size=pool_size or 5,
                max_overflow=max_overflow or 10,
                pool_timeout=pool_timeout or 30,
                created_by=created_by,
                updated_by=created_by
            )
            
            session.add(data_source)
            session.commit()
            session.refresh(data_source)
            logger.info(f"Created data source: {name} ({source_type})")
            return data_source
        except SQLAlchemyError as e:
            session.rollback()
            logger.error(f"Error creating data source: {str(e)}")
            raise
    
    @staticmethod
    def get_data_source(session: Session, data_source_id: int, current_user: Optional[str] = None) -> Optional[DataSource]:
        """Get a data source by ID with RBAC filtering."""
        query = select(DataSource).where(DataSource.id == data_source_id)
        
        # Apply RBAC filtering - users can only see their own data sources or ones they have access to
        if current_user:
            # For now, allow users to see data sources they created or own
            # In a more complex RBAC system, this would check permissions
            query = query.where(
                or_(
                    DataSource.created_by == current_user,
                    DataSource.owner == current_user,
                    DataSource.created_by.is_(None)  # Legacy data sources without created_by
                )
            )
        
        result = session.execute(query).scalars().first()
        return cast(Optional[DataSource], result)
    
    @staticmethod
    def get_all_data_sources(
        session: Session, 
        current_user: Optional[str] = None,
        include_all: bool = False
    ) -> List[DataSource]:
        """Get all data sources with RBAC filtering."""
        # Use SQLAlchemy query instead of SQLModel select
        query = session.query(DataSource)
        
        # Apply RBAC filtering unless explicitly requested to include all (for admin users)
        if current_user and not include_all:
            query = query.filter(
                or_(
                    DataSource.created_by == current_user,
                    DataSource.owner == current_user,
                    DataSource.created_by.is_(None)  # Legacy data sources without created_by
                )
            )
        
        # Order by most recent first
        query = query.order_by(desc(DataSource.created_at))
        
        result = query.all()
        return cast(List[DataSource], result)
    
    @staticmethod
    def get_data_source_by_name(session: Session, name: str) -> Optional[DataSource]:
        """Get a data source by name."""
        # Use SQLAlchemy query instead of SQLModel select
        result = session.query(DataSource).filter(DataSource.name == name).first()
        return cast(Optional[DataSource], result)
    
    @staticmethod
    def update_data_source(
        session: Session,
        data_source_id: int,
        updated_by: Optional[str] = None,
        **kwargs
    ) -> Optional[DataSource]:
        """Update a data source."""
        data_source = session.get(DataSource, data_source_id)
        if not data_source:
            return None
        
        # Handle password update separately
        if 'password' in kwargs:
            password = kwargs.pop('password')
            app_secret = kwargs.pop('app_secret', None)
            
            # Store the password in the secret manager or encrypt it
            if data_source.use_encryption and app_secret:
                # Encrypt the password before storing it
                key = get_encryption_key(app_secret)
                f = Fernet(key)
                encrypted_password = f.encrypt(password.encode()).decode()
                
                # Update the encrypted password
                set_secret(data_source.password_secret, encrypted_password)
            else:
                # Update the password directly
                set_secret(data_source.password_secret, password)
        
        # Update fields
        for key, value in kwargs.items():
            if hasattr(data_source, key):
                setattr(data_source, key, value)
        
        # Set RBAC user tracking
        data_source.updated_at = datetime.utcnow()
        data_source.updated_by = updated_by
        
        session.add(data_source)
        session.commit()
        session.refresh(data_source)
        logger.info(f"Updated data source: {data_source.name} (ID: {data_source_id}) by user: {updated_by}")
        return data_source
    
    @staticmethod
    def delete_data_source(session: Session, data_source_id: int) -> bool:
        """Delete a data source."""
        data_source = session.get(DataSource, data_source_id)
        if not data_source:
            return False
        
        # Delete the password from the secret manager
        try:
            delete_secret(data_source.password_secret)
        except Exception as e:
            logger.error(f"Error deleting secret: {str(e)}")
        
        session.delete(data_source)
        session.commit()
        logger.info(f"Deleted data source: {data_source.name} (ID: {data_source_id})")
        return True
    
    @staticmethod
    def get_data_source_password(data_source: DataSource, app_secret: Optional[str] = None) -> Optional[str]:
        """Get the password for a data source."""
        # Get the password from the secret manager
        password = get_secret(data_source.password_secret)
        
        # Decrypt the password if it's encrypted
        if data_source.use_encryption and app_secret and password:
            try:
                key = get_encryption_key(app_secret)
                f = Fernet(key)
                password = f.decrypt(password.encode()).decode()
            except Exception as e:
                logger.error(f"Error decrypting password: {str(e)}")
                return None
        
        return password
    
    @staticmethod
    def validate_connection(data_source: DataSource, app_secret: Optional[str] = None) -> Dict[str, Any]:
        """Validate connection to a data source."""
        try:
            # Get the password
            password = DataSourceService.get_data_source_password(data_source, app_secret)
            if not password:
                return {"success": False, "message": "Failed to retrieve password"}
            
            # Create connection URI with the actual password
            if data_source.source_type == DataSourceType.MYSQL:
                connection_uri = f"mysql+pymysql://{data_source.username}:{password}@{data_source.host}:{data_source.port}/{data_source.database_name or ''}"
                engine = create_engine(connection_uri)
                with engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
                    return {"success": True, "message": "Connection successful"}
            
            elif data_source.source_type == DataSourceType.POSTGRESQL:
                connection_uri = f"postgresql+psycopg2://{data_source.username}:{password}@{data_source.host}:{data_source.port}/{data_source.database_name or ''}"
                engine = create_engine(connection_uri)
                with engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
                    return {"success": True, "message": "Connection successful"}
            
            elif data_source.source_type == DataSourceType.MONGODB:
                connection_uri = f"mongodb://{data_source.username}:{password}@{data_source.host}:{data_source.port}"
                from pymongo import MongoClient
                client = MongoClient(connection_uri)
                # Force a command to check the connection
                client.admin.command('ping')
                return {"success": True, "message": "Connection successful"}
            
            else:
                return {"success": False, "message": f"Unsupported data source type: {data_source.source_type}"}
                
        except Exception as e:
            logger.error(f"Connection validation failed: {str(e)}")
            return {"success": False, "message": f"Connection failed: {str(e)}"}

    @staticmethod
    def get_data_source_health(session: Session, data_source_id: int) -> Dict[str, Any]:
        """Get health status for a data source."""
        data_source = DataSourceService.get_data_source(session, data_source_id)
        if not data_source:
            return {
                "status": "critical",
                "last_checked": datetime.utcnow(),
                "latency_ms": None,
                "error_message": "Data source not found",
                "recommendations": ["Check if the data source ID is correct."]
            }
        
        start = time.time()
        try:
            result = DataSourceService.validate_connection(data_source)
            latency = int((time.time() - start) * 1000)
            status = "healthy" if result.get("success") else "critical"
            error_message = None if result.get("success") else result.get("message")
            recommendations = []
            
            if not result.get("success"):
                recommendations.append("Check connection parameters and network access.")
            elif latency > 1000:  # High latency threshold
                recommendations.append("Consider optimizing network connectivity or connection pooling.")
            
            # Check other health indicators
            if data_source.error_rate and data_source.error_rate > 0.05:  # 5% error rate threshold
                status = "warning" if status == "healthy" else status
                recommendations.append("Investigate high error rate in queries.")
            
            if data_source.storage_used_percentage and data_source.storage_used_percentage > 85:
                status = "warning" if status == "healthy" else status
                recommendations.append("Storage usage is high. Consider cleanup or expansion.")
            
            return {
                "status": status,
                "last_checked": datetime.utcnow(),
                "latency_ms": latency,
                "error_message": error_message,
                "recommendations": recommendations,
                "metrics": {
                    "health_score": data_source.health_score,
                    "error_rate": data_source.error_rate,
                    "uptime": data_source.uptime_percentage,
                    "active_connections": data_source.active_connections,
                    "storage_used": data_source.storage_used_percentage
                }
            }
            
        except Exception as e:
            latency = int((time.time() - start) * 1000)
            return {
                "status": "critical",
                "last_checked": datetime.utcnow(),
                "latency_ms": latency,
                "error_message": str(e),
                "recommendations": ["Check connection parameters, credentials, and network access."]
            }

    @staticmethod
    def get_data_source_stats(session: Session, data_source_id: int) -> Dict[str, Any]:
        """Get comprehensive statistics for a data source."""
        data_source = DataSourceService.get_data_source(session, data_source_id)
        if not data_source:
            return {
                "entity_stats": {"total_entities": 0, "tables": 0, "views": 0, "stored_procedures": 0},
                "size_stats": {"total_size_formatted": "0 B", "total_size_gb": 0.0},
                "last_scan_time": None,
                "classification_stats": {"classified_columns": 0, "sensitive_columns": 0},
                "sensitivity_stats": {"sensitive_columns": 0, "pii_columns": 0},
                "compliance_stats": {"compliance_score": "N/A", "violations": 0},
                "performance_stats": {"avg_query_time": 0, "peak_connections": 0},
                "quality_stats": {"quality_score": 0, "issues_found": 0}
            }

        # Get latest scan results for this data source
        stmt = (
            select(Scan)
            .where(Scan.data_source_id == data_source_id)
            .where(Scan.status == "completed")
            .order_by(desc(Scan.completed_at))
            .limit(1)
        )
        latest_scan = session.execute(stmt).scalars().first()

        # Calculate entity stats from scan results
        entity_stats = {"total_entities": 0, "tables": 0, "views": 0, "stored_procedures": 0}
        if latest_scan:
            scan_results = cast(List[ScanResult], session.execute(
                select(ScanResult).where(ScanResult.scan_id == latest_scan.id)
            ).all())
            
            tables = set()
            views = set()
            stored_procs = set()
            columns = 0
            
            for result in scan_results:
                if result.table_name:
                    if result.object_type == 'table':
                        tables.add(f"{result.schema_name}.{result.table_name}")
                    elif result.object_type == 'view':
                        views.add(f"{result.schema_name}.{result.table_name}")
                    elif result.object_type == 'stored_procedure':
                        stored_procs.add(f"{result.schema_name}.{result.table_name}")
                if result.column_name:
                    columns += 1
            
            entity_stats = {
                "total_entities": len(tables) + len(views) + len(stored_procs) + columns,
                "tables": len(tables),
                "views": len(views),
                "stored_procedures": len(stored_procs),
                "columns": columns
            }

        # Calculate growth rate from historical data
        growth_metrics = session.execute(
            select(GrowthMetric)
            .where(GrowthMetric.data_source_id == data_source_id)
            .order_by(desc(GrowthMetric.measured_at))
            .limit(30)  # Last 30 measurements
        ).all()
        
        size_gb = data_source.size_gb or 0.0
        growth_rate = 0.0
        if len(growth_metrics) >= 2:
            # Calculate average daily growth rate
            daily_rates = []
            for i in range(len(growth_metrics) - 1):
                days = (growth_metrics[i].measured_at - growth_metrics[i+1].measured_at).days
                if days > 0:
                    rate = (growth_metrics[i].size_bytes - growth_metrics[i+1].size_bytes) / (days * 1024 * 1024 * 1024)  # Convert to GB/day
                    daily_rates.append(rate)
            growth_rate = sum(daily_rates) / len(daily_rates) if daily_rates else 0.0

        size_stats = {
            "total_size_formatted": DataSourceService._format_size(size_gb * 1024 * 1024 * 1024),
            "total_size_gb": size_gb,
            "growth_rate_gb_per_day": growth_rate
        }

        # Get classification and sensitivity stats from latest scan
        classification_stats = {
            "classified_columns": 0,
            "unclassified_columns": entity_stats.get("columns", 0),
            "sensitive_columns": 0
        }
        
        sensitivity_stats = {
            "sensitive_columns": 0,
            "pii_columns": 0,
            "financial_columns": 0
        }

        if latest_scan:
            # Count classified and sensitive columns
            for result in scan_results:
                if result.classification_labels:
                    classification_stats["classified_columns"] += 1
                    classification_stats["unclassified_columns"] -= 1
                if result.sensitivity_level in ('high', 'critical'):
                    sensitivity_stats["sensitive_columns"] += 1
                if 'PII' in (result.classification_labels or []):
                    sensitivity_stats["pii_columns"] += 1
                if 'FINANCIAL' in (result.classification_labels or []):
                    sensitivity_stats["financial_columns"] += 1

        # Get compliance stats
        compliance_stats = {
            "compliance_score": str(data_source.compliance_score or 0),
            "violations": sum(1 for r in scan_results if r.compliance_issues),
            "last_audit": data_source.last_scan.isoformat() if data_source.last_scan else None
        }

        # Get cache hit ratio and other performance stats
        performance_stats = {
            "avg_query_time": data_source.avg_response_time or 0,
            "peak_connections": data_source.connection_pool_size or 0,
            "cache_hit_ratio": DataSourceService._get_cache_hit_ratio(session, data_source_id)
        }

        # Get quality stats
        quality_stats = DataSourceService._get_quality_stats(session, data_source_id)

        return {
            "entity_stats": entity_stats,
            "size_stats": size_stats,
            "last_scan_time": data_source.last_scan,
            "classification_stats": classification_stats,
            "sensitivity_stats": sensitivity_stats,
            "compliance_stats": compliance_stats,
            "performance_stats": performance_stats,
            "quality_stats": quality_stats
        }

    @staticmethod
    def _format_size(size_bytes: float) -> str:
        """Format size in bytes to human readable format."""
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size_bytes < 1024.0:
                return f"{size_bytes:.1f} {unit}"
            size_bytes /= 1024.0
        return f"{size_bytes:.1f} PB"

    @staticmethod
    def update_data_source_metrics(
        session: Session, 
        data_source_id: int, 
        metrics: dict
    ) -> Optional[DataSource]:
        """Update performance and health metrics for a data source."""
        data_source = session.get(DataSource, data_source_id)
        if not data_source:
            return None

        # Update metrics
        for key, value in metrics.items():
            if hasattr(data_source, key):
                setattr(data_source, key, value)

        data_source.updated_at = datetime.utcnow()
        session.add(data_source)
        session.commit()
        session.refresh(data_source)
        return data_source
    
    @staticmethod
    def toggle_favorite(session: Session, data_source_id: int, user_id: str) -> bool:
        """Toggle favorite status for a data source (user-specific)."""
        data_source = session.get(DataSource, data_source_id)
        if not data_source:
            return False

        # Check if favorite already exists
        favorite = session.execute(
            select(UserFavorite)
            .where(UserFavorite.data_source_id == data_source_id)
            .where(UserFavorite.user_id == user_id)
        ).first()

        if favorite:
            # Remove favorite
            session.delete(favorite)
        else:
            # Add favorite
            favorite = UserFavorite(
                user_id=user_id,
                data_source_id=data_source_id
            )
            session.add(favorite)

        session.commit()
        return True

    @staticmethod
    def get_user_favorites(session: Session, user_id: str) -> List[DataSource]:
        """Get all favorite data sources for a user."""
        favorites = session.execute(
            select(DataSource)
            .join(UserFavorite)
            .where(UserFavorite.user_id == user_id)
        ).all()
        return list(favorites)

    @staticmethod
    def bulk_update_data_sources(
        session: Session,
        data_source_ids: List[int],
        updates: dict
    ) -> List[DataSource]:
        """Bulk update multiple data sources."""
        stmt = select(DataSource).where(Column("id").in_(data_source_ids))
        data_sources = cast(List[DataSource], session.execute(stmt).scalars().all())

        updated_sources = []
        for data_source in data_sources:
            for key, value in updates.items():
                if hasattr(data_source, key):
                    setattr(data_source, key, value)
            data_source.updated_at = datetime.utcnow()
            session.add(data_source)
            updated_sources.append(data_source)

        session.commit()
        for data_source in updated_sources:
            session.refresh(data_source)
        
        return updated_sources

    @staticmethod
    def _get_cache_hit_ratio(session: Session, data_source_id: int) -> float:
        """Get real cache hit ratio from performance metrics."""
        data_source = session.get(DataSource, data_source_id)
        if not data_source:
            return 0.0

        try:
            if data_source.source_type == DataSourceType.POSTGRESQL:
                # Query PostgreSQL stats
                password = DataSourceService.get_data_source_password(data_source)
                if not password:
                    return 0.0

                connection_uri = f"postgresql://{data_source.username}:{password}@{data_source.host}:{data_source.port}/{data_source.database_name or 'postgres'}"
                engine = create_engine(connection_uri)
                
                with engine.connect() as conn:
                    result = conn.execute(text("""
                        SELECT 
                            blks_hit::float / nullif(blks_hit + blks_read, 0) * 100 as cache_hit_ratio
                        FROM pg_stat_database 
                        WHERE datname = current_database()
                    """)).first()
                    return float(result[0]) if result and result[0] else 0.0

            elif data_source.source_type == DataSourceType.MYSQL:
                # Query MySQL stats
                password = DataSourceService.get_data_source_password(data_source)
                if not password:
                    return 0.0

                connection_uri = f"mysql+pymysql://{data_source.username}:{password}@{data_source.host}:{data_source.port}/{data_source.database_name or ''}"
                engine = create_engine(connection_uri)
                
                with engine.connect() as conn:
                    result = conn.execute(text("""
                        SHOW GLOBAL STATUS WHERE Variable_name IN 
                        ('Innodb_buffer_pool_reads', 'Innodb_buffer_pool_read_requests')
                    """)).mappings().all()
                    stats = {row["Variable_name"]: float(row["Value"]) for row in result}
                    
                    if stats.get("Innodb_buffer_pool_read_requests", 0) > 0:
                        hit_ratio = (1 - stats.get("Innodb_buffer_pool_reads", 0) / 
                                   stats.get("Innodb_buffer_pool_read_requests", 1)) * 100
                        return hit_ratio
                    return 0.0

            return 0.0

        except Exception as e:
            logger.error(f"Error getting cache hit ratio: {str(e)}")
            return 0.0

    @staticmethod
    def _get_quality_stats(session: Session, data_source_id: int) -> Dict[str, Any]:
        """Get real quality statistics from quality metrics."""
        # Get data source first to ensure it exists
        data_source = session.get(DataSource, data_source_id)
        if not data_source:
            return {
                "quality_score": 0,
                "issues_found": 0,
                "data_freshness": "Unknown",
                "metrics": {}
            }

        # Get latest quality metrics
        metrics = session.execute(
            select(QualityMetric)
            .where(QualityMetric.data_source_id == data_source_id)
            .order_by(desc(QualityMetric.created_at))
        ).all()

        if not metrics:
            return {
                "quality_score": 0,
                "issues_found": 0,
                "data_freshness": "Unknown",
                "metrics": {}
            }

        # Calculate overall quality score
        metric_weights = {
            "completeness": 0.3,
            "accuracy": 0.3,
            "consistency": 0.2,
            "timeliness": 0.2
        }

        quality_score = 0
        metric_values = {}
        issues_found = 0

        for metric in metrics:
            if metric.metric_type in metric_weights:
                metric_values[metric.metric_type] = metric.metric_value
                quality_score += metric.metric_value * metric_weights[metric.metric_type]
                if metric.details:
                    issues_found += len(metric.details.get("issues", []))

        # Check data freshness
        data_freshness = "Current" if data_source.last_scan and \
                        (datetime.utcnow() - data_source.last_scan).days < 7 else "Stale"

        return {
            "quality_score": round(quality_score, 2),
            "issues_found": issues_found,
            "data_freshness": data_freshness,
            "metrics": metric_values
        }

    @staticmethod
    def get_data_sources_by_filters(
        session: Session,
        source_type: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
        environment: Optional[str] = None,
        criticality: Optional[str] = None,
        owner: Optional[str] = None,
        team: Optional[str] = None,
        page: int = 1,
        limit: int = 50
    ) -> Tuple[List[DataSource], int]:
        """Get data sources with filters and pagination."""
        query = select(DataSource)

        # Apply filters
        if source_type:
            query = query.where(DataSource.source_type == source_type)
        if status:
            query = query.where(DataSource.status == status)
        if environment:
            query = query.where(DataSource.environment == environment)
        if criticality:
            query = query.where(DataSource.criticality == criticality)
        if owner:
            query = query.where(DataSource.owner == owner)
        if team:
            query = query.where(DataSource.team == team)
        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    Column("name", String).ilike(search_pattern),
                    Column("description", String).ilike(search_pattern),
                    Column("host", String).ilike(search_pattern)
                )
            )

        # Get total count
        total = session.scalar(select(func.count("*")).select_from(DataSource)) or 0

        # Apply pagination
        query = query.offset((page - 1) * limit).limit(limit)

        # Execute query and ensure type safety
        results = list(session.execute(query).scalars().all())
        return results, total

    @staticmethod
    def get_data_source_with_stats(session: Session, data_source_id: int) -> Optional[Dict[str, Any]]:
        """Get data source with detailed statistics."""
        data_source = DataSourceService.get_data_source(session, data_source_id)
        if not data_source:
            return None

        # Get health status
        health = DataSourceService.get_data_source_health(session, data_source_id)

        # Get statistics
        stats = DataSourceService.get_data_source_stats(session, data_source_id)

        # Get quality metrics
        quality_metrics = session.execute(
            select(QualityMetric)
            .where(QualityMetric.data_source_id == data_source_id)
            .order_by(desc(QualityMetric.created_at))
            .limit(10)
        ).all()

        # Get growth metrics
        growth_metrics = session.execute(
            select(GrowthMetric)
            .where(GrowthMetric.data_source_id == data_source_id)
            .order_by(desc(GrowthMetric.measured_at))
            .limit(30)
        ).all()

        return {
            "data_source": data_source,
            "health": health,
            "stats": stats,
            "quality_metrics": [
                {
                    "metric_type": m.metric_type,
                    "metric_value": m.metric_value,
                    "sample_size": m.sample_size,
                    "created_at": m.created_at,
                    "details": m.details
                }
                for m in quality_metrics
            ],
            "growth_metrics": [
                {
                    "size_bytes": m.size_bytes,
                    "record_count": m.record_count,
                    "measured_at": m.measured_at,
                    "growth_rate_bytes": m.growth_rate_bytes,
                    "growth_rate_records": m.growth_rate_records
                }
                for m in growth_metrics
            ]
        }

    @staticmethod
    def update_data_source_cloud_config(
        session: Session,
        data_source_id: int,
        cloud_provider: Optional[CloudProvider] = None,
        cloud_config: Optional[Dict[str, Any]] = None,
        replica_config: Optional[Dict[str, Any]] = None,
        ssl_config: Optional[Dict[str, str]] = None
    ) -> Optional[DataSource]:
        """Update cloud configuration for a data source."""
        data_source = session.get(DataSource, data_source_id)
        if not data_source:
            return None

        if cloud_provider:
            data_source.cloud_provider = cloud_provider
        if cloud_config:
            data_source.cloud_config = cloud_config
        if replica_config:
            data_source.replica_config = replica_config
        if ssl_config:
            data_source.ssl_config = ssl_config

        data_source.updated_at = datetime.utcnow()
        session.add(data_source)
        session.commit()
        session.refresh(data_source)
        return data_source

    @staticmethod
    def update_data_source_pool_config(
        session: Session,
        data_source_id: int,
        pool_size: Optional[int] = None,
        max_overflow: Optional[int] = None,
        pool_timeout: Optional[int] = None
    ) -> Optional[DataSource]:
        """Update connection pool configuration for a data source."""
        data_source = session.get(DataSource, data_source_id)
        if not data_source:
            return None

        if pool_size is not None:
            data_source.pool_size = pool_size
        if max_overflow is not None:
            data_source.max_overflow = max_overflow
        if pool_timeout is not None:
            data_source.pool_timeout = pool_timeout

        data_source.updated_at = datetime.utcnow()
        session.add(data_source)
        session.commit()
        session.refresh(data_source)
        return data_source

    @staticmethod
    def get_data_source_connection_info(
        session: Session,
        data_source_id: int,
        app_secret: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Get detailed connection information for a data source."""
        data_source = session.get(DataSource, data_source_id)
        if not data_source:
            return None

        # Get decrypted password if needed
        password = DataSourceService.get_data_source_password(data_source, app_secret)

        return {
            "connection_uri": data_source.get_connection_uri(),
            "connection_properties": data_source.connection_properties,
            "cloud_config": data_source.cloud_config,
            "replica_config": data_source.replica_config,
            "ssl_config": data_source.ssl_config,
            "pool_config": {
                "pool_size": data_source.pool_size,
                "max_overflow": data_source.max_overflow,
                "pool_timeout": data_source.pool_timeout
            },
            "credentials": {
                "username": data_source.username,
                "password": "********" if password else None,
                "secret_manager_type": data_source.secret_manager_type,
                "use_encryption": data_source.use_encryption
            }
        }

    @staticmethod
    def get_data_source_summary(session: Session, data_source_id: int) -> Optional[Dict[str, Any]]:
        """Get a summary of data source information for dashboard display."""
        data_source = session.get(DataSource, data_source_id)
        if not data_source:
            return None

        # Get recent scans
        recent_scans = session.execute(
            select(Scan)
            .where(Scan.data_source_id == data_source_id)
            .order_by(desc(Scan.created_at))
            .limit(5)
        ).all()

        # Get scan rule sets
        rule_sets = session.execute(
            select(ScanRuleSet)
            .where(ScanRuleSet.data_source_id == data_source_id)
        ).all()

        return {
            "basic_info": {
                "id": data_source.id,
                "name": data_source.name,
                "type": data_source.source_type,
                "location": data_source.location,
                "status": data_source.status,
                "environment": data_source.environment,
                "criticality": data_source.criticality
            },
            "monitoring": {
                "health_score": data_source.health_score,
                "compliance_score": data_source.compliance_score,
                "monitoring_enabled": data_source.monitoring_enabled,
                "backup_enabled": data_source.backup_enabled
            },
            "usage": {
                "entity_count": data_source.entity_count,
                "size_gb": data_source.size_gb,
                "active_connections": data_source.active_connections,
                "queries_per_second": data_source.queries_per_second
            },
            "recent_scans": [
                {
                    "id": scan.id,
                    "name": scan.name,
                    "status": scan.status,
                    "started_at": scan.started_at,
                    "completed_at": scan.completed_at
                }
                for scan in recent_scans
            ],
            "rule_sets": [
                {
                    "id": rs.id,
                    "name": rs.name,
                    "sample_data": rs.sample_data,
                    "sample_size": rs.sample_size
                }
                for rs in rule_sets
            ],
            "last_updated": data_source.updated_at
        }