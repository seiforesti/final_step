from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class NotificationType(str, Enum):
    ALERT = "alert"
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    SUCCESS = "success"


class NotificationChannel(str, Enum):
    EMAIL = "email"
    SLACK = "slack"
    WEBHOOK = "webhook"
    SMS = "sms"
    IN_APP = "in_app"


class NotificationStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    READ = "read"


class Notification(SQLModel, table=True):
    """Notification model"""
    __tablename__ = "notifications"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    data_source_id: Optional[int] = Field(foreign_key="datasource.id", index=True)
    user_id: str = Field(index=True)
    
    # Notification details
    title: str
    message: str
    notification_type: NotificationType
    channel: NotificationChannel
    
    # Status
    status: NotificationStatus = Field(default=NotificationStatus.PENDING)
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    
    # Delivery details
    recipient: str
    delivery_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


# Response Models
class NotificationResponse(SQLModel):
    id: int
    data_source_id: Optional[int]
    user_id: str
    title: str
    message: str
    notification_type: NotificationType
    channel: NotificationChannel
    status: NotificationStatus
    sent_at: Optional[datetime]
    delivered_at: Optional[datetime]
    read_at: Optional[datetime]
    recipient: str
    created_at: datetime