from sqlmodel import Session, select
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.models.tag_models import (
    Tag, TagCategory, DataSourceTag, TagRule, TagUsage,
    TagResponse, TagCategoryResponse, DataSourceTagResponse,
    TagCreate, TagUpdate, TagAssignRequest, TagStats,
    TagType, TagScope
)
from app.models.scan_models import DataSource
import logging

logger = logging.getLogger(__name__)


class TagService:
    """Service layer for tag management"""
    
    @staticmethod
    def get_tags(session: Session, tag_type: Optional[TagType] = None, is_active: bool = True) -> List[TagResponse]:
        """Get all tags"""
        try:
            query = select(Tag).where(Tag.is_active == is_active)
            if tag_type:
                query = query.where(Tag.tag_type == tag_type)
            
            tags = session.exec(query).all()
            return [TagResponse.from_orm(tag) for tag in tags]
        except Exception as e:
            logger.error(f"Error getting tags: {str(e)}")
            return []
    
    @staticmethod
    def get_tag_by_id(session: Session, tag_id: int) -> Optional[TagResponse]:
        """Get tag by ID"""
        try:
            tag = session.get(Tag, tag_id)
            if tag:
                return TagResponse.from_orm(tag)
            return None
        except Exception as e:
            logger.error(f"Error getting tag {tag_id}: {str(e)}")
            return None
    
    @staticmethod
    def create_tag(session: Session, tag_data: TagCreate, created_by: str) -> TagResponse:
        """Create a new tag"""
        try:
            # Check if tag name already exists
            existing = session.exec(select(Tag).where(Tag.name == tag_data.name)).first()
            if existing:
                raise ValueError(f"Tag with name '{tag_data.name}' already exists")
            
            tag = Tag(
                name=tag_data.name,
                display_name=tag_data.display_name,
                description=tag_data.description,
                color=tag_data.color,
                tag_type=tag_data.tag_type,
                scope=tag_data.scope,
                category_id=tag_data.category_id,
                icon=tag_data.icon,
                metadata=tag_data.metadata,
                created_by=created_by
            )
            
            session.add(tag)
            session.commit()
            session.refresh(tag)
            
            logger.info(f"Created tag {tag.id} by {created_by}")
            return TagResponse.from_orm(tag)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating tag: {str(e)}")
            raise
    
    @staticmethod
    def update_tag(session: Session, tag_id: int, tag_data: TagUpdate, updated_by: str) -> Optional[TagResponse]:
        """Update an existing tag"""
        try:
            tag = session.get(Tag, tag_id)
            if not tag:
                return None
            
            # Update fields
            if tag_data.name is not None:
                # Check name uniqueness
                existing = session.exec(
                    select(Tag).where(Tag.name == tag_data.name, Tag.id != tag_id)
                ).first()
                if existing:
                    raise ValueError(f"Tag with name '{tag_data.name}' already exists")
                tag.name = tag_data.name
            
            if tag_data.display_name is not None:
                tag.display_name = tag_data.display_name
            if tag_data.description is not None:
                tag.description = tag_data.description
            if tag_data.color is not None:
                tag.color = tag_data.color
            if tag_data.tag_type is not None:
                tag.tag_type = tag_data.tag_type
            if tag_data.scope is not None:
                tag.scope = tag_data.scope
            if tag_data.category_id is not None:
                tag.category_id = tag_data.category_id
            if tag_data.icon is not None:
                tag.icon = tag_data.icon
            if tag_data.metadata is not None:
                tag.metadata = tag_data.metadata
            if tag_data.is_active is not None:
                tag.is_active = tag_data.is_active
            
            tag.updated_at = datetime.now()
            
            session.add(tag)
            session.commit()
            session.refresh(tag)
            
            logger.info(f"Updated tag {tag_id} by {updated_by}")
            return TagResponse.from_orm(tag)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error updating tag {tag_id}: {str(e)}")
            raise
    
    @staticmethod
    def delete_tag(session: Session, tag_id: int, deleted_by: str) -> bool:
        """Delete a tag"""
        try:
            tag = session.get(Tag, tag_id)
            if not tag:
                return False
            
            # Remove all data source associations
            session.exec(
                select(DataSourceTag).where(DataSourceTag.tag_id == tag_id)
            ).all()
            for association in session.exec(select(DataSourceTag).where(DataSourceTag.tag_id == tag_id)):
                session.delete(association)
            
            session.delete(tag)
            session.commit()
            
            logger.info(f"Deleted tag {tag_id} by {deleted_by}")
            return True
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error deleting tag {tag_id}: {str(e)}")
            return False
    
    @staticmethod
    def get_data_source_tags(session: Session, data_source_id: int) -> List[DataSourceTagResponse]:
        """Get all tags for a data source"""
        try:
            statement = select(DataSourceTag).where(
                DataSourceTag.data_source_id == data_source_id
            ).where(
                (DataSourceTag.expires_at.is_(None)) | 
                (DataSourceTag.expires_at > datetime.now())
            )
            
            associations = session.exec(statement).all()
            
            result = []
            for assoc in associations:
                tag = session.get(Tag, assoc.tag_id)
                if tag:
                    response = DataSourceTagResponse.from_orm(assoc)
                    response.tag = TagResponse.from_orm(tag)
                    result.append(response)
            
            return result
        except Exception as e:
            logger.error(f"Error getting tags for data source {data_source_id}: {str(e)}")
            return []
    
    @staticmethod
    def assign_tags(session: Session, data_source_id: int, request: TagAssignRequest, assigned_by: str) -> bool:
        """Assign tags to a data source"""
        try:
            # Verify data source exists
            data_source = session.get(DataSource, data_source_id)
            if not data_source:
                raise ValueError(f"Data source {data_source_id} not found")
            
            # Remove existing assignments for these tags
            existing = session.exec(
                select(DataSourceTag).where(
                    DataSourceTag.data_source_id == data_source_id,
                    DataSourceTag.tag_id.in_(request.tag_ids)
                )
            ).all()
            
            for assoc in existing:
                session.delete(assoc)
            
            # Create new assignments
            for tag_id in request.tag_ids:
                # Verify tag exists
                tag = session.get(Tag, tag_id)
                if not tag:
                    logger.warning(f"Tag {tag_id} not found, skipping")
                    continue
                
                assignment = DataSourceTag(
                    data_source_id=data_source_id,
                    tag_id=tag_id,
                    assigned_by=assigned_by,
                    context=request.context
                )
                
                session.add(assignment)
                
                # Update tag usage
                tag.usage_count += 1
                tag.last_used = datetime.now()
                session.add(tag)
                
                # Log usage
                TagService._log_usage(session, tag_id, assigned_by, "applied", "data_source", str(data_source_id))
            
            session.commit()
            
            logger.info(f"Assigned {len(request.tag_ids)} tags to data source {data_source_id} by {assigned_by}")
            return True
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error assigning tags: {str(e)}")
            return False
    
    @staticmethod
    def remove_tag_from_data_source(session: Session, data_source_id: int, tag_id: int, removed_by: str) -> bool:
        """Remove a tag from a data source"""
        try:
            association = session.exec(
                select(DataSourceTag).where(
                    DataSourceTag.data_source_id == data_source_id,
                    DataSourceTag.tag_id == tag_id
                )
            ).first()
            
            if not association:
                return False
            
            session.delete(association)
            
            # Update tag usage
            tag = session.get(Tag, tag_id)
            if tag and tag.usage_count > 0:
                tag.usage_count -= 1
                session.add(tag)
            
            # Log usage
            TagService._log_usage(session, tag_id, removed_by, "removed", "data_source", str(data_source_id))
            
            session.commit()
            
            logger.info(f"Removed tag {tag_id} from data source {data_source_id} by {removed_by}")
            return True
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error removing tag: {str(e)}")
            return False
    
    @staticmethod
    def get_categories(session: Session) -> List[TagCategoryResponse]:
        """Get all tag categories"""
        try:
            categories = session.exec(
                select(TagCategory).where(TagCategory.is_active == True)
                .order_by(TagCategory.sort_order)
            ).all()
            
            result = []
            for category in categories:
                response = TagCategoryResponse.from_orm(category)
                # Get tags in this category
                tags = session.exec(
                    select(Tag).where(Tag.category_id == category.id, Tag.is_active == True)
                ).all()
                response.tags = [TagResponse.from_orm(tag) for tag in tags]
                result.append(response)
            
            return result
        except Exception as e:
            logger.error(f"Error getting tag categories: {str(e)}")
            return []
    
    @staticmethod
    def search_tags(session: Session, query: str, limit: int = 20) -> List[TagResponse]:
        """Search tags by name or description"""
        try:
            statement = select(Tag).where(
                Tag.is_active == True,
                (Tag.name.ilike(f"%{query}%")) | 
                (Tag.display_name.ilike(f"%{query}%")) |
                (Tag.description.ilike(f"%{query}%"))
            ).limit(limit)
            
            tags = session.exec(statement).all()
            return [TagResponse.from_orm(tag) for tag in tags]
        except Exception as e:
            logger.error(f"Error searching tags: {str(e)}")
            return []
    
    @staticmethod
    def get_tag_stats(session: Session) -> TagStats:
        """Get tag statistics"""
        try:
            # Get tag counts
            all_tags = session.exec(select(Tag)).all()
            total_tags = len(all_tags)
            active_tags = len([t for t in all_tags if t.is_active])
            system_tags = len([t for t in all_tags if t.tag_type == TagType.SYSTEM])
            user_tags = len([t for t in all_tags if t.tag_type == TagType.USER])
            automated_tags = len([t for t in all_tags if t.tag_type == TagType.AUTOMATED])
            
            # Get assignment count
            total_assignments = session.exec(select(DataSourceTag)).all()
            assignment_count = len(total_assignments)
            
            # Get most used tags
            most_used = sorted(all_tags, key=lambda x: x.usage_count, reverse=True)[:5]
            most_used_data = []
            for tag in most_used:
                most_used_data.append({
                    "id": tag.id,
                    "name": tag.name,
                    "usage_count": tag.usage_count
                })
            
            # Get recent tags
            recent_tags = session.exec(
                select(Tag).order_by(Tag.created_at.desc()).limit(5)
            ).all()
            
            # Get category count
            categories_count = len(session.exec(select(TagCategory)).all())
            
            return TagStats(
                total_tags=total_tags,
                active_tags=active_tags,
                system_tags=system_tags,
                user_tags=user_tags,
                automated_tags=automated_tags,
                total_assignments=assignment_count,
                most_used_tags=most_used_data,
                recent_tags=[TagResponse.from_orm(tag) for tag in recent_tags],
                categories_count=categories_count
            )
            
        except Exception as e:
            logger.error(f"Error getting tag stats: {str(e)}")
            return TagStats(
                total_tags=0,
                active_tags=0,
                system_tags=0,
                user_tags=0,
                automated_tags=0,
                total_assignments=0,
                most_used_tags=[],
                recent_tags=[],
                categories_count=0
            )
    
    @staticmethod
    def _log_usage(session: Session, tag_id: int, user_id: str, action: str, resource_type: str, resource_id: str, context: Optional[str] = None):
        """Log tag usage"""
        try:
            usage = TagUsage(
                tag_id=tag_id,
                used_by=user_id,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                context=context
            )
            
            session.add(usage)
            session.commit()
        except Exception as e:
            logger.error(f"Error logging tag usage: {str(e)}")
            # Don't raise - logging failures shouldn't break main functionality