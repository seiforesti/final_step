from sqlmodel import Session, select
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from app.models.task_models import (
    ScheduledTask, TaskExecution,
    TaskType, TaskStatus
)
from app.models.scan_models import DataSource
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)


class TaskResponse(BaseModel):
    """Task response model"""
    id: int
    data_source_id: Optional[int]
    name: str
    description: Optional[str]
    task_type: TaskType
    cron_expression: str
    is_enabled: bool
    next_run: Optional[datetime]
    last_run: Optional[datetime]
    configuration: Dict[str, Any]
    retry_count: int
    max_retries: int
    timeout_minutes: int
    status: TaskStatus
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TaskExecutionResponse(BaseModel):
    """Task execution response model"""
    id: int
    task_id: int
    status: TaskStatus
    started_at: datetime
    completed_at: Optional[datetime]
    duration_seconds: Optional[int]
    result_data: Optional[Dict[str, Any]]
    error_message: Optional[str]
    retry_attempt: int

    class Config:
        from_attributes = True


class TaskCreate(BaseModel):
    """Task creation model"""
    data_source_id: Optional[int] = None
    name: str
    description: Optional[str] = None
    task_type: TaskType
    cron_expression: str
    configuration: Dict[str, Any] = {}
    max_retries: int = 3
    timeout_minutes: int = 30


class TaskUpdate(BaseModel):
    """Task update model"""
    name: Optional[str] = None
    description: Optional[str] = None
    cron_expression: Optional[str] = None
    configuration: Optional[Dict[str, Any]] = None
    max_retries: Optional[int] = None
    timeout_minutes: Optional[int] = None
    is_enabled: Optional[bool] = None


class TaskStats(BaseModel):
    """Task statistics model"""
    total_tasks: int
    enabled_tasks: int
    disabled_tasks: int
    running_tasks: int
    successful_executions: int
    failed_executions: int
    success_rate_percentage: float
    avg_execution_time_minutes: float
    next_scheduled_task: Optional[datetime]
    task_types_distribution: Dict[str, int]


class TaskService:
    """Service layer for scheduled task management"""
    
    @staticmethod
    def get_tasks(session: Session, data_source_id: Optional[int] = None) -> List[TaskResponse]:
        """Get all tasks, optionally filtered by data source"""
        try:
            query = select(ScheduledTask)
            if data_source_id:
                query = query.where(ScheduledTask.data_source_id == data_source_id)
            
            tasks = session.exec(query.order_by(ScheduledTask.created_at.desc())).all()
            return [TaskResponse.from_orm(task) for task in tasks]
        except Exception as e:
            logger.error(f"Error getting tasks: {str(e)}")
            return []
    
    @staticmethod
    def get_task_by_id(session: Session, task_id: int) -> Optional[TaskResponse]:
        """Get task by ID"""
        try:
            task = session.get(ScheduledTask, task_id)
            if task:
                return TaskResponse.from_orm(task)
            return None
        except Exception as e:
            logger.error(f"Error getting task {task_id}: {str(e)}")
            return None
    
    @staticmethod
    def create_task(session: Session, task_data: TaskCreate, created_by: str) -> TaskResponse:
        """Create a new scheduled task"""
        try:
            # Verify data source exists if provided
            if task_data.data_source_id:
                data_source = session.get(DataSource, task_data.data_source_id)
                if not data_source:
                    raise ValueError(f"Data source {task_data.data_source_id} not found")
            
            # Calculate next run time
            next_run = TaskService._calculate_next_run(task_data.cron_expression)
            
            task = ScheduledTask(
                data_source_id=task_data.data_source_id,
                name=task_data.name,
                description=task_data.description,
                task_type=task_data.task_type,
                cron_expression=task_data.cron_expression,
                next_run=next_run,
                configuration=task_data.configuration,
                max_retries=task_data.max_retries,
                timeout_minutes=task_data.timeout_minutes,
                created_by=created_by
            )
            
            session.add(task)
            session.commit()
            session.refresh(task)
            
            logger.info(f"Created task {task.id} by {created_by}")
            return TaskResponse.from_orm(task)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating task: {str(e)}")
            raise
    
    @staticmethod
    def update_task(session: Session, task_id: int, task_data: TaskUpdate, updated_by: str) -> Optional[TaskResponse]:
        """Update an existing task"""
        try:
            task = session.get(ScheduledTask, task_id)
            if not task:
                return None
            
            # Update fields
            if task_data.name is not None:
                task.name = task_data.name
            if task_data.description is not None:
                task.description = task_data.description
            if task_data.cron_expression is not None:
                task.cron_expression = task_data.cron_expression
                task.next_run = TaskService._calculate_next_run(task_data.cron_expression)
            if task_data.configuration is not None:
                task.configuration = task_data.configuration
            if task_data.max_retries is not None:
                task.max_retries = task_data.max_retries
            if task_data.timeout_minutes is not None:
                task.timeout_minutes = task_data.timeout_minutes
            if task_data.is_enabled is not None:
                task.is_enabled = task_data.is_enabled
                if not task.is_enabled:
                    task.status = TaskStatus.DISABLED
                else:
                    task.status = TaskStatus.PENDING
            
            task.updated_at = datetime.now()
            
            session.add(task)
            session.commit()
            session.refresh(task)
            
            logger.info(f"Updated task {task_id} by {updated_by}")
            return TaskResponse.from_orm(task)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error updating task {task_id}: {str(e)}")
            raise
    
    @staticmethod
    def delete_task(session: Session, task_id: int, deleted_by: str) -> bool:
        """Delete a task"""
        try:
            task = session.get(ScheduledTask, task_id)
            if not task:
                return False
            
            # Delete execution history
            executions = session.exec(
                select(TaskExecution).where(TaskExecution.task_id == task_id)
            ).all()
            for execution in executions:
                session.delete(execution)
            
            session.delete(task)
            session.commit()
            
            logger.info(f"Deleted task {task_id} by {deleted_by}")
            return True
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error deleting task {task_id}: {str(e)}")
            return False
    
    @staticmethod
    def enable_task(session: Session, task_id: int, enabled_by: str) -> bool:
        """Enable a task"""
        try:
            task = session.get(ScheduledTask, task_id)
            if not task:
                return False
            
            task.is_enabled = True
            task.status = TaskStatus.PENDING
            task.next_run = TaskService._calculate_next_run(task.cron_expression)
            task.updated_at = datetime.now()
            
            session.add(task)
            session.commit()
            
            logger.info(f"Enabled task {task_id} by {enabled_by}")
            return True
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error enabling task {task_id}: {str(e)}")
            return False
    
    @staticmethod
    def disable_task(session: Session, task_id: int, disabled_by: str) -> bool:
        """Disable a task"""
        try:
            task = session.get(ScheduledTask, task_id)
            if not task:
                return False
            
            task.is_enabled = False
            task.status = TaskStatus.DISABLED
            task.next_run = None
            task.updated_at = datetime.now()
            
            session.add(task)
            session.commit()
            
            logger.info(f"Disabled task {task_id} by {disabled_by}")
            return True
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error disabling task {task_id}: {str(e)}")
            return False
    
    @staticmethod
    def execute_task(session: Session, task_id: int, triggered_by: str = "scheduler") -> bool:
        """Execute a task manually"""
        try:
            task = session.get(ScheduledTask, task_id)
            if not task:
                return False
            
            # Create execution record
            execution = TaskExecution(
                task_id=task_id,
                status=TaskStatus.RUNNING,
                retry_attempt=0
            )
            
            session.add(execution)
            
            # Update task status
            task.status = TaskStatus.RUNNING
            task.last_run = datetime.now()
            session.add(task)
            
            session.commit()
            session.refresh(execution)
            
            # Simulate task execution
            success = TaskService._simulate_task_execution(session, task, execution)
            
            # Update next run time if successful
            if success and task.is_enabled:
                task.next_run = TaskService._calculate_next_run(task.cron_expression)
                session.add(task)
                session.commit()
            
            logger.info(f"Executed task {task_id} triggered by {triggered_by}")
            return success
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error executing task {task_id}: {str(e)}")
            return False
    
    @staticmethod
    def get_task_executions(session: Session, task_id: int, limit: int = 50) -> List[TaskExecutionResponse]:
        """Get execution history for a task"""
        try:
            statement = select(TaskExecution).where(
                TaskExecution.task_id == task_id
            ).order_by(TaskExecution.started_at.desc()).limit(limit)
            
            executions = session.exec(statement).all()
            return [TaskExecutionResponse.from_orm(execution) for execution in executions]
        except Exception as e:
            logger.error(f"Error getting task executions: {str(e)}")
            return []
    
    @staticmethod
    def get_due_tasks(session: Session) -> List[TaskResponse]:
        """Get tasks that are due for execution"""
        try:
            now = datetime.now()
            statement = select(ScheduledTask).where(
                ScheduledTask.is_enabled == True,
                ScheduledTask.next_run <= now,
                ScheduledTask.status != TaskStatus.RUNNING
            )
            
            tasks = session.exec(statement).all()
            return [TaskResponse.from_orm(task) for task in tasks]
        except Exception as e:
            logger.error(f"Error getting due tasks: {str(e)}")
            return []
    
    @staticmethod
    def get_task_stats(session: Session, data_source_id: Optional[int] = None) -> TaskStats:
        """Get task statistics"""
        try:
            # Get tasks
            query = select(ScheduledTask)
            if data_source_id:
                query = query.where(ScheduledTask.data_source_id == data_source_id)
            
            tasks = session.exec(query).all()
            
            total_tasks = len(tasks)
            enabled_tasks = len([t for t in tasks if t.is_enabled])
            disabled_tasks = total_tasks - enabled_tasks
            running_tasks = len([t for t in tasks if t.status == TaskStatus.RUNNING])
            
            # Get executions
            task_ids = [t.id for t in tasks]
            exec_query = select(TaskExecution)
            if task_ids:
                exec_query = exec_query.where(TaskExecution.task_id.in_(task_ids))
            
            executions = session.exec(exec_query).all()
            
            successful_executions = len([e for e in executions if e.status == TaskStatus.COMPLETED])
            failed_executions = len([e for e in executions if e.status == TaskStatus.FAILED])
            total_executions = len(executions)
            
            success_rate = (successful_executions / total_executions * 100) if total_executions > 0 else 0
            
            # Calculate average execution time
            completed_executions = [e for e in executions if e.duration_seconds is not None]
            avg_duration = sum(e.duration_seconds for e in completed_executions) / len(completed_executions) if completed_executions else 0
            avg_execution_time_minutes = avg_duration / 60
            
            # Get next scheduled task
            next_task = session.exec(
                select(ScheduledTask).where(
                    ScheduledTask.is_enabled == True,
                    ScheduledTask.next_run.is_not(None)
                ).order_by(ScheduledTask.next_run.asc())
            ).first()
            
            next_scheduled = next_task.next_run if next_task else None
            
            # Task types distribution
            task_types = {}
            for task in tasks:
                task_types[task.task_type] = task_types.get(task.task_type, 0) + 1
            
            return TaskStats(
                total_tasks=total_tasks,
                enabled_tasks=enabled_tasks,
                disabled_tasks=disabled_tasks,
                running_tasks=running_tasks,
                successful_executions=successful_executions,
                failed_executions=failed_executions,
                success_rate_percentage=round(success_rate, 1),
                avg_execution_time_minutes=round(avg_execution_time_minutes, 2),
                next_scheduled_task=next_scheduled,
                task_types_distribution=task_types
            )
            
        except Exception as e:
            logger.error(f"Error getting task stats: {str(e)}")
            return TaskStats(
                total_tasks=0,
                enabled_tasks=0,
                disabled_tasks=0,
                running_tasks=0,
                successful_executions=0,
                failed_executions=0,
                success_rate_percentage=0.0,
                avg_execution_time_minutes=0.0,
                next_scheduled_task=None,
                task_types_distribution={}
            )
    
    @staticmethod
    def _calculate_next_run(cron_expression: str) -> datetime:
        """Calculate next run time from cron expression"""
        # Simple implementation - in production, use croniter library
        # For now, return next hour
        return datetime.now() + timedelta(hours=1)
    
    @staticmethod
    def _simulate_task_execution(session: Session, task: ScheduledTask, execution: TaskExecution) -> bool:
        """Simulate task execution"""
        try:
            import time
            time.sleep(0.1)  # Simulate work
            
            # Update execution as completed
            execution.status = TaskStatus.COMPLETED
            execution.completed_at = datetime.now()
            execution.duration_seconds = 5
            execution.result_data = {"status": "success", "processed": 100}
            
            # Update task status
            task.status = TaskStatus.COMPLETED
            task.retry_count = 0
            
            session.add(execution)
            session.add(task)
            session.commit()
            
            return True
            
        except Exception as e:
            logger.error(f"Error in simulated task execution: {str(e)}")
            
            # Mark as failed
            execution.status = TaskStatus.FAILED
            execution.completed_at = datetime.now()
            execution.error_message = str(e)
            
            task.status = TaskStatus.FAILED
            task.retry_count += 1
            
            session.add(execution)
            session.add(task)
            session.commit()
            
            return False