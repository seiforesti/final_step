from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class TaskType(str, Enum):
    SCAN = "scan"
    BACKUP = "backup"
    CLEANUP = "cleanup"
    SYNC = "sync"
    REPORT = "report"
    MAINTENANCE = "maintenance"


class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    SCHEDULED = "scheduled"


class ScheduledTask(SQLModel, table=True):
    """Scheduled task model for task management"""
    __tablename__ = "scheduled_tasks"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    data_source_id: int = Field(foreign_key="datasource.id", index=True)
    
    # Task details
    task_name: str
    task_type: TaskType
    description: Optional[str] = None
    
    # Scheduling
    cron_expression: str
    is_enabled: bool = Field(default=True)
    
    # Execution
    status: TaskStatus = Field(default=TaskStatus.SCHEDULED)
    last_run: Optional[datetime] = None
    next_run: Optional[datetime] = None
    run_count: int = Field(default=0)
    
    # Configuration
    task_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Audit fields
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class TaskExecution(SQLModel, table=True):
    """Task execution model for tracking task runs"""
    __tablename__ = "task_executions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    task_id: int = Field(foreign_key="scheduled_tasks.id")
    
    # Execution details
    execution_id: str = Field(index=True)
    status: TaskStatus = Field(default=TaskStatus.PENDING)
    
    # Timing
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    
    # Results
    result_data: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    error_message: Optional[str] = None
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


# Response Models
class ScheduledTaskResponse(SQLModel):
    id: int
    data_source_id: int
    task_name: str
    task_type: TaskType
    description: Optional[str]
    cron_expression: str
    is_enabled: bool
    status: TaskStatus
    last_run: Optional[datetime]
    next_run: Optional[datetime]
    run_count: int
    created_by: Optional[str]
    created_at: datetime


class TaskExecutionResponse(SQLModel):
    id: int
    task_id: int
    execution_id: str
    status: TaskStatus
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    duration_seconds: Optional[int]
    error_message: Optional[str]
    created_at: datetime


class TaskStatusResponse(SQLModel):
    scheduled_tasks: List[ScheduledTaskResponse]
    recent_executions: List[TaskExecutionResponse]
    task_statistics: Dict[str, Any]
    recommendations: List[str]
