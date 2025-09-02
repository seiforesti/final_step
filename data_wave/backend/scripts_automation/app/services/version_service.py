from sqlmodel import Session, select
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.models.version_models import (
    DataSourceVersion, VersionChange, VersionApproval, VersionDeployment,
    DataSourceVersionResponse, VersionChangeResponse, VersionCreate, VersionUpdate,
    VersionStats, VersionStatus, ChangeType
)
from app.models.scan_models import DataSource
import logging
import numpy as np

logger = logging.getLogger(__name__)


class VersionService:
    """Service layer for version management"""
    
    @staticmethod
    def get_versions_by_data_source(session: Session, data_source_id: int) -> List[DataSourceVersionResponse]:
        """Get all versions for a data source"""
        try:
            statement = select(DataSourceVersion).where(
                DataSourceVersion.data_source_id == data_source_id
            ).order_by(DataSourceVersion.created_at.desc())
            
            versions = session.execute(statement).scalars().all()
            
            result = []
            for version in versions:
                response = DataSourceVersionResponse.from_orm(version)
                # Get changes for this version
                changes = session.execute(
                    select(VersionChange).where(VersionChange.version_id == version.id)
                ).all()
                response.changes = [VersionChangeResponse.from_orm(change) for change in changes]
                result.append(response)
            
            return result
        except Exception as e:
            logger.error(f"Error getting versions for data source {data_source_id}: {str(e)}")
            return []
    
    @staticmethod
    def get_version_by_id(session: Session, version_id: int) -> Optional[DataSourceVersionResponse]:
        """Get version by ID"""
        try:
            version = session.get(DataSourceVersion, version_id)
            if not version:
                return None
            
            response = DataSourceVersionResponse.from_orm(version)
            # Get changes
            changes = session.execute(
                select(VersionChange).where(VersionChange.version_id == version_id)
            ).all()
            response.changes = [VersionChangeResponse.from_orm(change) for change in changes]
            
            return response
        except Exception as e:
            logger.error(f"Error getting version {version_id}: {str(e)}")
            return None
    
    @staticmethod
    def get_current_version(session: Session, data_source_id: int) -> Optional[DataSourceVersionResponse]:
        """Get current active version for a data source"""
        try:
            statement = select(DataSourceVersion).where(
                DataSourceVersion.data_source_id == data_source_id,
                DataSourceVersion.is_current == True
            )
            
            version = session.execute(statement).scalars().first()
            if version:
                response = DataSourceVersionResponse.from_orm(version)
                # Get changes
                changes = session.execute(
                    select(VersionChange).where(VersionChange.version_id == version.id)
                ).all()
                response.changes = [VersionChangeResponse.from_orm(change) for change in changes]
                return response
            
            return None
        except Exception as e:
            logger.error(f"Error getting current version for data source {data_source_id}: {str(e)}")
            return None
    
    @staticmethod
    def create_version(session: Session, data_source_id: int, version_data: VersionCreate, created_by: str) -> DataSourceVersionResponse:
        """Create a new version"""
        try:
            # Verify data source exists
            data_source = session.get(DataSource, data_source_id)
            if not data_source:
                raise ValueError(f"Data source {data_source_id} not found")
            
            # Check if version already exists
            existing = session.execute(
                select(DataSourceVersion).where(
                    DataSourceVersion.data_source_id == data_source_id,
                    DataSourceVersion.version == version_data.version
                )
            ).first()
            
            if existing:
                raise ValueError(f"Version {version_data.version} already exists for this data source")
            
            # Create version
            version = DataSourceVersion(
                data_source_id=data_source_id,
                version=version_data.version,
                name=version_data.name,
                description=version_data.description,
                changes_summary=version_data.changes_summary,
                breaking_changes=version_data.breaking_changes,
                configuration=version_data.configuration,
                schema_snapshot=version_data.schema_snapshot,
                parent_version_id=version_data.parent_version_id,
                created_by=created_by
            )
            
            session.add(version)
            session.commit()
            session.refresh(version)
            
            logger.info(f"Created version {version.id} for data source {data_source_id} by {created_by}")
            return DataSourceVersionResponse.from_orm(version)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating version: {str(e)}")
            raise
    
    @staticmethod
    def update_version(session: Session, version_id: int, version_data: VersionUpdate, updated_by: str) -> Optional[DataSourceVersionResponse]:
        """Update an existing version"""
        try:
            version = session.get(DataSourceVersion, version_id)
            if not version:
                return None
            
            # Only allow updates if version is in draft status
            if version.status != VersionStatus.DRAFT:
                raise ValueError("Only draft versions can be updated")
            
            # Update fields
            if version_data.name is not None:
                version.name = version_data.name
            if version_data.description is not None:
                version.description = version_data.description
            if version_data.changes_summary is not None:
                version.changes_summary = version_data.changes_summary
            if version_data.breaking_changes is not None:
                version.breaking_changes = version_data.breaking_changes
            if version_data.configuration is not None:
                version.configuration = version_data.configuration
            if version_data.schema_snapshot is not None:
                version.schema_snapshot = version_data.schema_snapshot
            
            version.updated_at = datetime.now()
            
            session.add(version)
            session.commit()
            session.refresh(version)
            
            logger.info(f"Updated version {version_id} by {updated_by}")
            
            response = DataSourceVersionResponse.from_orm(version)
            # Get changes
            changes = session.execute(
                select(VersionChange).where(VersionChange.version_id == version_id)
            ).all()
            response.changes = [VersionChangeResponse.from_orm(change) for change in changes]
            
            return response
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error updating version {version_id}: {str(e)}")
            raise
    
    @staticmethod
    def activate_version(session: Session, version_id: int, activated_by: str) -> bool:
        """Activate a version (make it current)"""
        try:
            version = session.get(DataSourceVersion, version_id)
            if not version:
                return False
            
            # Deactivate current version
            current = session.execute(
                select(DataSourceVersion).where(
                    DataSourceVersion.data_source_id == version.data_source_id,
                    DataSourceVersion.is_current == True
                )
            ).first()
            
            if current:
                current.is_current = False
                current.status = VersionStatus.ARCHIVED
                current.archived_at = datetime.now()
                session.add(current)
            
            # Activate new version
            version.is_current = True
            version.status = VersionStatus.ACTIVE
            version.activated_at = datetime.now()
            
            # Create deployment record
            deployment = VersionDeployment(
                version_id=version_id,
                deployment_type="deploy",
                deployed_by=activated_by,
                status="completed",
                completed_at=datetime.now()
            )
            
            session.add(version)
            session.add(deployment)
            session.commit()
            
            logger.info(f"Activated version {version_id} by {activated_by}")
            return True
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error activating version {version_id}: {str(e)}")
            return False
    
    @staticmethod
    def restore_version(session: Session, data_source_id: int, version_id: int, restored_by: str) -> bool:
        """Restore to a specific version"""
        try:
            target_version = session.get(DataSourceVersion, version_id)
            if not target_version or target_version.data_source_id != data_source_id:
                return False
            
            # Get current version
            current = session.execute(
                select(DataSourceVersion).where(
                    DataSourceVersion.data_source_id == data_source_id,
                    DataSourceVersion.is_current == True
                )
            ).first()
            
            if current:
                current.is_current = False
                current.status = VersionStatus.ARCHIVED
                session.add(current)
            
            # Activate target version
            target_version.is_current = True
            target_version.status = VersionStatus.ACTIVE
            target_version.activated_at = datetime.now()
            
            # Create restore deployment record
            deployment = VersionDeployment(
                version_id=version_id,
                deployment_type="restore",
                deployed_by=restored_by,
                status="completed",
                completed_at=datetime.now(),
                rollback_version_id=current.id if current else None,
                deployment_notes=f"Restored to version {target_version.version}"
            )
            
            session.add(target_version)
            session.add(deployment)
            session.commit()
            
            logger.info(f"Restored to version {version_id} by {restored_by}")
            return True
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error restoring version: {str(e)}")
            return False

    @staticmethod
    def rollback_version(session: Session, data_source_id: int, rolled_back_by: str) -> bool:
        """Rollback to previous version"""
        try:
            # Get current version
            current = session.execute(
                select(DataSourceVersion).where(
                    DataSourceVersion.data_source_id == data_source_id,
                    DataSourceVersion.is_current == True
                )
            ).first()
            
            if not current:
                return False
            
            # Get previous version (most recent non-current)
            previous = session.execute(
                select(DataSourceVersion).where(
                    DataSourceVersion.data_source_id == data_source_id,
                    DataSourceVersion.id != current.id
                ).order_by(DataSourceVersion.created_at.desc())
            ).first()
            
            if not previous:
                return False
            
            # Deactivate current version
            current.is_current = False
            current.status = VersionStatus.ROLLBACK
            session.add(current)
            
            # Activate previous version
            previous.is_current = True
            previous.status = VersionStatus.ACTIVE
            previous.activated_at = datetime.now()
            
            # Create rollback deployment record
            deployment = VersionDeployment(
                version_id=previous.id,
                deployment_type="rollback",
                deployed_by=rolled_back_by,
                status="completed",
                completed_at=datetime.now(),
                rollback_version_id=current.id,
                deployment_notes=f"Rolled back from version {current.version} to {previous.version}"
            )
            
            session.add(previous)
            session.add(deployment)
            session.commit()
            
            logger.info(f"Rolled back from version {current.version} to {previous.version} by {rolled_back_by}")
            return True
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error rolling back version: {str(e)}")
            return False
    
    @staticmethod
    def delete_version(session: Session, version_id: int, deleted_by: str) -> bool:
        """Delete a version"""
        try:
            version = session.get(DataSourceVersion, version_id)
            if not version:
                return False
            
            # Cannot delete active version
            if version.is_current:
                raise ValueError("Cannot delete the current active version")
            
            # Delete associated changes
            changes = session.execute(
                select(VersionChange).where(VersionChange.version_id == version_id)
            ).all()
            for change in changes:
                session.delete(change)
            
            session.delete(version)
            session.commit()
            
            logger.info(f"Deleted version {version_id} by {deleted_by}")
            return True
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error deleting version {version_id}: {str(e)}")
            return False
    
    @staticmethod
    def add_version_change(session: Session, version_id: int, change_type: ChangeType, field_path: str, old_value: Optional[str], new_value: Optional[str], description: str, impact_level: str = "low") -> bool:
        """Add a change record to a version"""
        try:
            version = session.get(DataSourceVersion, version_id)
            if not version:
                return False
            
            change = VersionChange(
                version_id=version_id,
                change_type=change_type,
                field_path=field_path,
                old_value=old_value,
                new_value=new_value,
                description=description,
                impact_level=impact_level
            )
            
            session.add(change)
            session.commit()
            
            logger.info(f"Added change to version {version_id}")
            return True
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error adding version change: {str(e)}")
            return False
    
    @staticmethod
    def get_version_stats(session: Session, data_source_id: Optional[int] = None) -> VersionStats:
        """Get version statistics"""
        try:
            # Base query
            query = select(DataSourceVersion)
            if data_source_id:
                query = query.where(DataSourceVersion.data_source_id == data_source_id)
            
            versions = session.execute(query).scalars().all()
            
            total_versions = len(versions)
            active_versions = len([v for v in versions if v.status == VersionStatus.ACTIVE])
            draft_versions = len([v for v in versions if v.status == VersionStatus.DRAFT])
            archived_versions = len([v for v in versions if v.status == VersionStatus.ARCHIVED])
            
            # Get changes stats
            version_ids = [v.id for v in versions]
            changes_query = select(VersionChange)
            if version_ids:
                changes_query = changes_query.where(VersionChange.version_id.in_(version_ids))
            
            changes = session.execute(changes_query).scalars().all()
            total_changes = len(changes)
            breaking_changes_count = len([v for v in versions if v.breaking_changes])
            
            # Calculate most common change type
            change_types = {}
            for change in changes:
                change_types[change.change_type] = change_types.get(change.change_type, 0) + 1
            
            most_common_change_type = "none"
            if change_types:
                most_common_change_type = max(change_types.items(), key=lambda x: x[1])[0]
            
            # Calculate real deployment metrics from actual deployment history
            from ..models.deployment_models import DeploymentHistory, DeploymentStatus
            
            deployment_query = select(DeploymentHistory)
            if data_source_id:
                deployment_query = deployment_query.where(DeploymentHistory.data_source_id == data_source_id)
            
            deployments = session.execute(deployment_query).scalars().all()
            
            if deployments:
                # Calculate real deployment metrics
                successful_deployments = [d for d in deployments if d.status == DeploymentStatus.SUCCESSFUL]
                failed_deployments = [d for d in deployments if d.status == DeploymentStatus.FAILED]
                
                # Calculate average deployment time
                deployment_times = []
                for deployment in successful_deployments:
                    if deployment.deployment_start and deployment.deployment_end:
                        duration = (deployment.deployment_end - deployment.deployment_start).total_seconds() / 60
                        deployment_times.append(duration)
                
                avg_deployment_time = np.mean(deployment_times) if deployment_times else 5.0
                
                # Calculate success rate
                total_deployments = len(deployments)
                successful_count = len(successful_deployments)
                success_rate = (successful_count / total_deployments * 100) if total_deployments > 0 else 95.0
            else:
                # Default values if no deployment history
                avg_deployment_time = 5.0
                success_rate = 95.0
            
            return VersionStats(
                total_versions=total_versions,
                active_versions=active_versions,
                draft_versions=draft_versions,
                archived_versions=archived_versions,
                total_changes=total_changes,
                breaking_changes_count=breaking_changes_count,
                avg_deployment_time_minutes=avg_deployment_time,
                success_rate_percentage=success_rate,
                most_common_change_type=most_common_change_type
            )
            
        except Exception as e:
            logger.error(f"Error getting version stats: {str(e)}")
            return VersionStats(
                total_versions=0,
                active_versions=0,
                draft_versions=0,
                archived_versions=0,
                total_changes=0,
                breaking_changes_count=0,
                avg_deployment_time_minutes=0.0,
                success_rate_percentage=0.0,
                most_common_change_type="none"
            )

    @staticmethod
    def compare_versions(session: Session, version1_id: int, version2_id: int) -> Dict[str, Any]:
        """Compare two versions"""
        try:
            version1 = session.get(DataSourceVersion, version1_id)
            version2 = session.get(DataSourceVersion, version2_id)
            
            if not version1 or not version2:
                return None
            
            # Get changes for both versions
            changes1 = session.execute(
                select(VersionChange).where(VersionChange.version_id == version1_id)
            ).scalars().all()
            
            changes2 = session.execute(
                select(VersionChange).where(VersionChange.version_id == version2_id)
            ).scalars().all()
            
            # Compare configurations
            config1 = version1.configuration or {}
            config2 = version2.configuration or {}
            
            config_diff = {}
            all_keys = set(config1.keys()) | set(config2.keys())
            
            for key in all_keys:
                val1 = config1.get(key)
                val2 = config2.get(key)
                if val1 != val2:
                    config_diff[key] = {
                        "version1": val1,
                        "version2": val2,
                        "changed": True
                    }
            
            # Compare schema snapshots
            schema1 = version1.schema_snapshot or {}
            schema2 = version2.schema_snapshot or {}
            
            schema_diff = {}
            all_schema_keys = set(schema1.keys()) | set(schema2.keys())
            
            for key in all_schema_keys:
                val1 = schema1.get(key)
                val2 = schema2.get(key)
                if val1 != val2:
                    schema_diff[key] = {
                        "version1": val1,
                        "version2": val2,
                        "changed": True
                    }
            
            return {
                "version1": {
                    "id": version1.id,
                    "version": version1.version,
                    "name": version1.name,
                    "created_at": version1.created_at,
                    "changes_count": len(changes1)
                },
                "version2": {
                    "id": version2.id,
                    "version": version2.version,
                    "name": version2.name,
                    "created_at": version2.created_at,
                    "changes_count": len(changes2)
                },
                "configuration_diff": config_diff,
                "schema_diff": schema_diff,
                "changes_summary": {
                    "version1_changes": [VersionChangeResponse.from_orm(c) for c in changes1],
                    "version2_changes": [VersionChangeResponse.from_orm(c) for c in changes2]
                },
                "breaking_changes": {
                    "version1": version1.breaking_changes,
                    "version2": version2.breaking_changes
                }
            }
            
        except Exception as e:
            logger.error(f"Error comparing versions: {str(e)}")
            return None

    @staticmethod
    def get_version_changes(session: Session, version_id: int) -> List[VersionChangeResponse]:
        """Get changes for a specific version"""
        try:
            changes = session.execute(
                select(VersionChange).where(VersionChange.version_id == version_id)
            ).scalars().all()
            
            return [VersionChangeResponse.from_orm(change) for change in changes]
            
        except Exception as e:
            logger.error(f"Error getting version changes: {str(e)}")
            return []