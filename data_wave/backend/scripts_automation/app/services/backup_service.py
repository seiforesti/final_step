from sqlmodel import Session, select, func, and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from app.models.backup_models import (
    BackupOperation, RestoreOperation, BackupSchedule,
    BackupOperationResponse, RestoreOperationResponse, BackupScheduleResponse,
    BackupStatusResponse, BackupOperationCreate, RestoreOperationCreate,
    BackupScheduleCreate, BackupOperationUpdate, RestoreOperationUpdate,
    BackupScheduleUpdate, BackupType, BackupStatus, RestoreStatus
)
from app.models.scan_models import DataSource
import logging

logger = logging.getLogger(__name__)


class BackupService:
    """Service layer for backup management"""
    
    @staticmethod
    def get_backup_status(session: Session, data_source_id: int) -> BackupStatusResponse:
        """Get comprehensive backup status for a data source"""
        try:
            # Verify data source exists
            data_source = session.get(DataSource, data_source_id)
            if not data_source:
                raise ValueError(f"Data source {data_source_id} not found")
            
            # Get recent backups
            recent_backups = BackupService.get_recent_backups(session, data_source_id)
            
            # Get scheduled backups
            scheduled_backups = BackupService.get_backup_schedules(session, data_source_id)
            
            # Calculate statistics
            backup_statistics = BackupService._calculate_backup_statistics(session, data_source_id)
            
            # Calculate storage usage
            storage_usage = BackupService._calculate_storage_usage(session, data_source_id)
            
            # Generate recommendations
            recommendations = BackupService._generate_backup_recommendations(
                recent_backups, scheduled_backups, backup_statistics
            )
            
            return BackupStatusResponse(
                recent_backups=recent_backups,
                scheduled_backups=scheduled_backups,
                backup_statistics=backup_statistics,
                storage_usage=storage_usage,
                recommendations=recommendations
            )
            
        except Exception as e:
            logger.error(f"Error getting backup status for data source {data_source_id}: {str(e)}")
            raise
    
    @staticmethod
    def get_recent_backups(
        session: Session, 
        data_source_id: int,
        limit: int = 20
    ) -> List[BackupOperationResponse]:
        """Get recent backup operations for a data source"""
        try:
            query = select(BackupOperation).where(
                BackupOperation.data_source_id == data_source_id
            ).order_by(BackupOperation.created_at.desc()).limit(limit)
            
            backups = session.exec(query).all()
            
            return [BackupOperationResponse.from_orm(backup) for backup in backups]
            
        except Exception as e:
            logger.error(f"Error getting recent backups for data source {data_source_id}: {str(e)}")
            return []
    
    @staticmethod
    def get_backup_schedules(
        session: Session, 
        data_source_id: int
    ) -> List[BackupScheduleResponse]:
        """Get backup schedules for a data source"""
        try:
            query = select(BackupSchedule).where(
                BackupSchedule.data_source_id == data_source_id
            ).order_by(BackupSchedule.next_run.asc())
            
            schedules = session.exec(query).all()
            
            return [BackupScheduleResponse.from_orm(schedule) for schedule in schedules]
            
        except Exception as e:
            logger.error(f"Error getting backup schedules for data source {data_source_id}: {str(e)}")
            return []
    
    @staticmethod
    def start_backup(
        session: Session,
        backup_data: BackupOperationCreate,
        user_id: str
    ) -> BackupOperationResponse:
        """Start a new backup operation"""
        try:
            # Verify data source exists
            data_source = session.get(DataSource, backup_data.data_source_id)
            if not data_source:
                raise ValueError(f"Data source {backup_data.data_source_id} not found")
            
            backup = BackupOperation(
                data_source_id=backup_data.data_source_id,
                backup_type=backup_data.backup_type,
                backup_name=backup_data.backup_name,
                description=backup_data.description,
                backup_metadata=backup_data.backup_metadata,
                status=BackupStatus.RUNNING,
                started_at=datetime.now(),
                created_by=user_id
            )
            
            session.add(backup)
            session.commit()
            session.refresh(backup)
            
            # Trigger actual backup process in background
            try:
                # Start background backup task
                backup_task = asyncio.create_task(
                    BackupService._execute_backup_process(backup.id, data_source_id, session)
                )
                
                # Store task reference for monitoring
                backup.background_task_id = str(backup_task.get_name()) if hasattr(backup_task, 'get_name') else str(id(backup_task))
                
                # Update backup record with task info
                session.add(backup)
                session.commit()
                
                logger.info(f"Background backup task started for backup {backup.id}")
                
            except Exception as e:
                logger.error(f"Error starting background backup task: {str(e)}")
                # Continue with backup creation even if background task fails
            
            return BackupOperationResponse.from_orm(backup)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error starting backup: {str(e)}")
            raise
    
    @staticmethod
    def _calculate_backup_statistics(session: Session, data_source_id: int) -> Dict[str, Any]:
        """Calculate backup statistics"""
        try:
            # Get backup counts by status
            query = select(
                BackupOperation.status,
                func.count(BackupOperation.id).label("count")
            ).where(
                BackupOperation.data_source_id == data_source_id
            ).group_by(BackupOperation.status)
            
            results = session.exec(query).all()
            
            status_counts = {status.value: 0 for status in BackupStatus}
            for status, count in results:
                status_counts[status.value] = count
            
            # Calculate success rate
            total_backups = sum(status_counts.values())
            successful_backups = status_counts.get("completed", 0)
            success_rate = (successful_backups / total_backups * 100) if total_backups > 0 else 0
            
            # Get average backup duration
            avg_duration_query = select(
                func.avg(BackupOperation.duration_seconds)
            ).where(
                and_(
                    BackupOperation.data_source_id == data_source_id,
                    BackupOperation.status == BackupStatus.COMPLETED
                )
            )
            
            avg_duration = session.exec(avg_duration_query).first() or 0
            
            return {
                "total_backups": total_backups,
                "successful_backups": successful_backups,
                "failed_backups": status_counts.get("failed", 0),
                "success_rate": round(success_rate, 2),
                "average_duration_seconds": int(avg_duration) if avg_duration else 0,
                "status_counts": status_counts
            }
            
        except Exception as e:
            logger.error(f"Error calculating backup statistics: {str(e)}")
            return {}
    
    @staticmethod
    def _calculate_storage_usage(session: Session, data_source_id: int) -> Dict[str, Any]:
        """Calculate storage usage for backups"""
        try:
            # Get total backup size
            total_size_query = select(
                func.sum(BackupOperation.backup_size_bytes)
            ).where(
                and_(
                    BackupOperation.data_source_id == data_source_id,
                    BackupOperation.status == BackupStatus.COMPLETED
                )
            )
            
            total_size = session.exec(total_size_query).first() or 0
            
            # Get backup count by type
            type_query = select(
                BackupOperation.backup_type,
                func.count(BackupOperation.id).label("count"),
                func.sum(BackupOperation.backup_size_bytes).label("total_size")
            ).where(
                and_(
                    BackupOperation.data_source_id == data_source_id,
                    BackupOperation.status == BackupStatus.COMPLETED
                )
            ).group_by(BackupOperation.backup_type)
            
            type_results = session.exec(type_query).all()
            
            type_breakdown = {}
            for backup_type, count, size in type_results:
                type_breakdown[backup_type.value] = {
                    "count": count,
                    "total_size_bytes": size or 0
                }
            
            return {
                "total_size_bytes": total_size,
                "total_size_gb": round(total_size / (1024**3), 2) if total_size else 0,
                "backup_count": len(type_breakdown),
                "type_breakdown": type_breakdown
            }
            
        except Exception as e:
            logger.error(f"Error calculating storage usage: {str(e)}")
            return {}
    
    @staticmethod
    def _generate_backup_recommendations(
        recent_backups: List[BackupOperationResponse],
        scheduled_backups: List[BackupScheduleResponse],
        statistics: Dict[str, Any]
    ) -> List[str]:
        """Generate backup recommendations"""
        recommendations = []
        
        # Check for failed backups
        failed_backups = [b for b in recent_backups if b.status == BackupStatus.FAILED]
        if failed_backups:
            recommendations.append(f"Review and fix {len(failed_backups)} failed backup operations")
        
        # Check for missing scheduled backups
        if not scheduled_backups:
            recommendations.append("Set up automated backup schedules")
        
        # Check backup frequency
        if recent_backups:
            last_backup = recent_backups[0]
            if last_backup.created_at < datetime.now() - timedelta(days=7):
                recommendations.append("Consider more frequent backups")
        
        # Check success rate
        success_rate = statistics.get("success_rate", 0)
        if success_rate < 90:
            recommendations.append("Improve backup success rate")
        
        # Check for disabled schedules
        disabled_schedules = [s for s in scheduled_backups if not s.is_enabled]
        if disabled_schedules:
            recommendations.append(f"Enable {len(disabled_schedules)} disabled backup schedules")
        
        return recommendations
