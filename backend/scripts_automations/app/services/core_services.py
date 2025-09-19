"""
Core Services

Base service classes and fundamental services used throughout the application.
"""

import asyncio
import logging
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Type, TypeVar, Generic, Union
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
import json
import redis
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, or_, select, update, delete, func
from pydantic import BaseModel

from ..core.database import get_db_session, get_async_db_session
from ..core.cache import get_redis_client
from ..core.events import EventBus
from ..models.core_models import BaseModel as DBBaseModel
from ..utils.exceptions import ServiceException, NotFoundError, ValidationError

T = TypeVar('T', bound=DBBaseModel)
CreateSchemaType = TypeVar('CreateSchemaType', bound=BaseModel)
UpdateSchemaType = TypeVar('UpdateSchemaType', bound=BaseModel)

logger = logging.getLogger(__name__)


class BaseService(Generic[T, CreateSchemaType, UpdateSchemaType], ABC):
    """
    Base service class providing common CRUD operations and utilities.
    
    This class provides a foundation for all domain services with:
    - Standard CRUD operations
    - Caching integration
    - Event publishing
    - Error handling
    - Logging
    - Transaction management
    """
    
    def __init__(
        self,
        model: Type[T],
        db_session: Optional[Session] = None,
        cache_service: Optional['CacheService'] = None,
        event_service: Optional['EventService'] = None
    ):
        self.model = model
        self._db_session = db_session
        self._cache_service = cache_service
        self._event_service = event_service
        self.logger = logging.getLogger(self.__class__.__name__)
    
    @property
    def db_session(self) -> Session:
        """Get database session."""
        if self._db_session is None:
            self._db_session = next(get_db_session())
        return self._db_session
    
    @property
    def cache_service(self) -> 'CacheService':
        """Get cache service."""
        if self._cache_service is None:
            self._cache_service = CacheService()
        return self._cache_service
    
    @property
    def event_service(self) -> 'EventService':
        """Get event service."""
        if self._event_service is None:
            self._event_service = EventService()
        return self._event_service
    
    # CRUD Operations
    
    async def create(self, obj_in: CreateSchemaType, **kwargs) -> T:
        """Create a new record."""
        try:
            # Convert Pydantic model to dict
            obj_data = obj_in.dict() if hasattr(obj_in, 'dict') else obj_in
            
            # Add audit fields if available
            if hasattr(self.model, 'created_by') and 'created_by' in kwargs:
                obj_data['created_by'] = kwargs['created_by']
            
            # Create database object
            db_obj = self.model(**obj_data)
            
            # Save to database
            self.db_session.add(db_obj)
            self.db_session.commit()
            self.db_session.refresh(db_obj)
            
            # Clear related cache
            await self._invalidate_cache(db_obj.id)
            
            # Publish event
            await self.event_service.publish(
                f"{self.model.__tablename__}.created",
                {"id": str(db_obj.id), "data": db_obj.to_dict()}
            )
            
            self.logger.info(f"Created {self.model.__name__} with ID: {db_obj.id}")
            return db_obj
            
        except Exception as e:
            self.db_session.rollback()
            self.logger.error(f"Error creating {self.model.__name__}: {str(e)}")
            raise ServiceException(f"Failed to create {self.model.__name__}: {str(e)}")
    
    async def get(self, id: Any, use_cache: bool = True) -> Optional[T]:
        """Get record by ID."""
        try:
            # Try cache first
            if use_cache:
                cached_obj = await self.cache_service.get(self._get_cache_key(id))
                if cached_obj:
                    return self._deserialize_from_cache(cached_obj)
            
            # Query database
            db_obj = self.db_session.query(self.model).filter(self.model.id == id).first()
            
            # Cache the result
            if db_obj and use_cache:
                await self.cache_service.set(
                    self._get_cache_key(id),
                    self._serialize_for_cache(db_obj),
                    ttl=3600  # 1 hour
                )
            
            return db_obj
            
        except Exception as e:
            self.logger.error(f"Error getting {self.model.__name__} {id}: {str(e)}")
            raise ServiceException(f"Failed to get {self.model.__name__}: {str(e)}")
    
    async def get_multi(
        self,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
        order_by: Optional[str] = None,
        use_cache: bool = False
    ) -> List[T]:
        """Get multiple records with filtering and pagination."""
        try:
            query = self.db_session.query(self.model)
            
            # Apply filters
            if filters:
                for key, value in filters.items():
                    if hasattr(self.model, key):
                        if isinstance(value, list):
                            query = query.filter(getattr(self.model, key).in_(value))
                        else:
                            query = query.filter(getattr(self.model, key) == value)
            
            # Apply ordering
            if order_by:
                if order_by.startswith('-'):
                    query = query.order_by(getattr(self.model, order_by[1:]).desc())
                else:
                    query = query.order_by(getattr(self.model, order_by))
            
            # Apply pagination
            query = query.offset(skip).limit(limit)
            
            return query.all()
            
        except Exception as e:
            self.logger.error(f"Error getting multiple {self.model.__name__}: {str(e)}")
            raise ServiceException(f"Failed to get {self.model.__name__} list: {str(e)}")
    
    async def update(self, id: Any, obj_in: UpdateSchemaType, **kwargs) -> Optional[T]:
        """Update record by ID."""
        try:
            # Get existing record
            db_obj = await self.get(id, use_cache=False)
            if not db_obj:
                raise NotFoundError(f"{self.model.__name__} not found")
            
            # Convert update data to dict
            update_data = obj_in.dict(exclude_unset=True) if hasattr(obj_in, 'dict') else obj_in
            
            # Add audit fields if available
            if hasattr(self.model, 'updated_by') and 'updated_by' in kwargs:
                update_data['updated_by'] = kwargs['updated_by']
            
            if hasattr(self.model, 'version'):
                update_data['version'] = db_obj.version + 1
            
            # Update object
            for field, value in update_data.items():
                if hasattr(db_obj, field):
                    setattr(db_obj, field, value)
            
            # Save changes
            self.db_session.commit()
            self.db_session.refresh(db_obj)
            
            # Clear cache
            await self._invalidate_cache(id)
            
            # Publish event
            await self.event_service.publish(
                f"{self.model.__tablename__}.updated",
                {"id": str(db_obj.id), "data": db_obj.to_dict()}
            )
            
            self.logger.info(f"Updated {self.model.__name__} with ID: {id}")
            return db_obj
            
        except Exception as e:
            self.db_session.rollback()
            self.logger.error(f"Error updating {self.model.__name__} {id}: {str(e)}")
            raise ServiceException(f"Failed to update {self.model.__name__}: {str(e)}")
    
    async def delete(self, id: Any, soft_delete: bool = True, **kwargs) -> bool:
        """Delete record by ID."""
        try:
            # Get existing record
            db_obj = await self.get(id, use_cache=False)
            if not db_obj:
                raise NotFoundError(f"{self.model.__name__} not found")
            
            if soft_delete and hasattr(db_obj, 'soft_delete'):
                # Soft delete
                db_obj.soft_delete()
                if hasattr(db_obj, 'updated_by') and 'updated_by' in kwargs:
                    db_obj.updated_by = kwargs['updated_by']
            else:
                # Hard delete
                self.db_session.delete(db_obj)
            
            self.db_session.commit()
            
            # Clear cache
            await self._invalidate_cache(id)
            
            # Publish event
            await self.event_service.publish(
                f"{self.model.__tablename__}.deleted",
                {"id": str(id), "soft_delete": soft_delete}
            )
            
            self.logger.info(f"Deleted {self.model.__name__} with ID: {id}")
            return True
            
        except Exception as e:
            self.db_session.rollback()
            self.logger.error(f"Error deleting {self.model.__name__} {id}: {str(e)}")
            raise ServiceException(f"Failed to delete {self.model.__name__}: {str(e)}")
    
    async def count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        """Count records with optional filters."""
        try:
            query = self.db_session.query(func.count(self.model.id))
            
            # Apply filters
            if filters:
                for key, value in filters.items():
                    if hasattr(self.model, key):
                        if isinstance(value, list):
                            query = query.filter(getattr(self.model, key).in_(value))
                        else:
                            query = query.filter(getattr(self.model, key) == value)
            
            return query.scalar()
            
        except Exception as e:
            self.logger.error(f"Error counting {self.model.__name__}: {str(e)}")
            raise ServiceException(f"Failed to count {self.model.__name__}: {str(e)}")
    
    # Cache management
    
    def _get_cache_key(self, id: Any) -> str:
        """Generate cache key for record."""
        return f"{self.model.__tablename__}:{id}"
    
    def _serialize_for_cache(self, obj: T) -> str:
        """Serialize object for cache storage."""
        return json.dumps(obj.to_dict(), default=str)
    
    def _deserialize_from_cache(self, cached_data: str) -> T:
        """Deserialize object from cache."""
        data = json.loads(cached_data)
        return self.model(**data)
    
    async def _invalidate_cache(self, id: Any):
        """Invalidate cache for record."""
        await self.cache_service.delete(self._get_cache_key(id))
        # Also invalidate list caches
        await self.cache_service.delete_pattern(f"{self.model.__tablename__}:list:*")


class DatabaseService:
    """Service for database operations and health monitoring."""
    
    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)
    
    @asynccontextmanager
    async def transaction(self):
        """Async context manager for database transactions."""
        async with get_async_db_session() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
    
    async def health_check(self) -> Dict[str, Any]:
        """Check database health."""
        try:
            async with self.transaction() as session:
                result = await session.execute(select(1))
                return {
                    "status": "healthy",
                    "timestamp": datetime.utcnow().isoformat(),
                    "connection": "active"
                }
        except Exception as e:
            self.logger.error(f"Database health check failed: {str(e)}")
            return {
                "status": "unhealthy",
                "timestamp": datetime.utcnow().isoformat(),
                "error": str(e)
            }
    
    async def get_connection_info(self) -> Dict[str, Any]:
        """Get database connection information."""
        # Implementation would depend on your database configuration
        return {
            "pool_size": "configured_pool_size",
            "active_connections": "active_count",
            "idle_connections": "idle_count"
        }


class CacheService:
    """Service for cache operations using Redis."""
    
    def __init__(self, redis_client: Optional[redis.Redis] = None):
        self.redis_client = redis_client or get_redis_client()
        self.logger = logging.getLogger(self.__class__.__name__)
    
    async def get(self, key: str) -> Optional[str]:
        """Get value from cache."""
        try:
            return self.redis_client.get(key)
        except Exception as e:
            self.logger.error(f"Cache get error for key {key}: {str(e)}")
            return None
    
    async def set(self, key: str, value: str, ttl: Optional[int] = None) -> bool:
        """Set value in cache."""
        try:
            if ttl:
                return self.redis_client.setex(key, ttl, value)
            else:
                return self.redis_client.set(key, value)
        except Exception as e:
            self.logger.error(f"Cache set error for key {key}: {str(e)}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete key from cache."""
        try:
            return self.redis_client.delete(key) > 0
        except Exception as e:
            self.logger.error(f"Cache delete error for key {key}: {str(e)}")
            return False
    
    async def delete_pattern(self, pattern: str) -> int:
        """Delete keys matching pattern."""
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                return self.redis_client.delete(*keys)
            return 0
        except Exception as e:
            self.logger.error(f"Cache delete pattern error for {pattern}: {str(e)}")
            return 0
    
    async def exists(self, key: str) -> bool:
        """Check if key exists in cache."""
        try:
            return self.redis_client.exists(key) > 0
        except Exception as e:
            self.logger.error(f"Cache exists error for key {key}: {str(e)}")
            return False
    
    async def expire(self, key: str, ttl: int) -> bool:
        """Set expiration for key."""
        try:
            return self.redis_client.expire(key, ttl)
        except Exception as e:
            self.logger.error(f"Cache expire error for key {key}: {str(e)}")
            return False


class EventService:
    """Service for publishing and handling events."""
    
    def __init__(self, event_bus: Optional[EventBus] = None):
        self.event_bus = event_bus or EventBus()
        self.logger = logging.getLogger(self.__class__.__name__)
    
    async def publish(self, event_type: str, data: Dict[str, Any]) -> bool:
        """Publish an event."""
        try:
            event = {
                "type": event_type,
                "data": data,
                "timestamp": datetime.utcnow().isoformat(),
                "id": str(uuid.uuid4())
            }
            
            await self.event_bus.publish(event_type, event)
            self.logger.debug(f"Published event: {event_type}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error publishing event {event_type}: {str(e)}")
            return False
    
    async def subscribe(self, event_type: str, handler: callable) -> bool:
        """Subscribe to an event type."""
        try:
            await self.event_bus.subscribe(event_type, handler)
            self.logger.debug(f"Subscribed to event: {event_type}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error subscribing to event {event_type}: {str(e)}")
            return False
    
    async def unsubscribe(self, event_type: str, handler: callable) -> bool:
        """Unsubscribe from an event type."""
        try:
            await self.event_bus.unsubscribe(event_type, handler)
            self.logger.debug(f"Unsubscribed from event: {event_type}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error unsubscribing from event {event_type}: {str(e)}")
            return False