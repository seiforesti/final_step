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


class NotificationUpdate(SQLModel):
    """Notification update model"""
    title: Optional[str] = None
    message: Optional[str] = None
    notification_type: Optional[NotificationType] = None
    channel: Optional[NotificationChannel] = None
    status: Optional[NotificationStatus] = None
    delivery_metadata: Optional[Dict[str, Any]] = None


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


class NotificationStats(SQLModel):
    """Notification statistics model"""
    total_notifications: int
    unread_notifications: int
    read_notifications: int
    failed_notifications: int
    notifications_by_type: Dict[str, int]
    notifications_by_status: Dict[str, int]
    recent_notifications: List[NotificationResponse]


class NotificationPreference(SQLModel, table=True):
    """Notification preference model for user settings"""
    __tablename__ = "notification_preferences"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True, unique=True)
    
    # Channel preferences
    email_enabled: bool = Field(default=True)
    slack_enabled: bool = Field(default=True)
    in_app_enabled: bool = Field(default=True)
    webhook_enabled: bool = Field(default=False)
    sms_enabled: bool = Field(default=False)
    
    # Notification type preferences
    alert_enabled: bool = Field(default=True)
    info_enabled: bool = Field(default=True)
    warning_enabled: bool = Field(default=True)
    error_enabled: bool = Field(default=True)
    success_enabled: bool = Field(default=True)
    
    # Quiet hours settings
    quiet_hours_enabled: bool = Field(default=False)
    quiet_hours_start: str = Field(default="22:00")
    quiet_hours_end: str = Field(default="08:00")
    
    # Frequency settings
    notification_frequency: str = Field(default="immediate")  # immediate, hourly, daily, weekly
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class NotificationTemplate(SQLModel, table=True):
    """Notification template model for reusable message templates"""
    __tablename__ = "notification_templates"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    template_name: str = Field(unique=True, index=True)
    template_type: NotificationType
    
    # Template content
    subject: str
    message: str
    variables: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Template settings
    is_active: bool = Field(default=True)
    is_system: bool = Field(default=False)  # System templates cannot be deleted
    
    # Usage tracking
    usage_count: int = Field(default=0)
    last_used: Optional[datetime] = None
    
    # Audit fields
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class NotificationChannelConfig(SQLModel, table=True):
    """Notification channel configuration model"""
    __tablename__ = "notification_channels"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    channel_id: str = Field(unique=True, index=True)
    channel_name: str
    channel_description: str
    
    # Channel configuration
    is_enabled: bool = Field(default=True)
    config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Channel capabilities
    supports_priority: bool = Field(default=True)
    supports_attachments: bool = Field(default=False)
    max_message_length: Optional[int] = None
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


# Response Models for new entities
class NotificationPreferenceResponse(SQLModel):
    id: int
    user_id: str
    email_enabled: bool
    slack_enabled: bool
    in_app_enabled: bool
    webhook_enabled: bool
    sms_enabled: bool
    alert_enabled: bool
    info_enabled: bool
    warning_enabled: bool
    error_enabled: bool
    success_enabled: bool
    quiet_hours_enabled: bool
    quiet_hours_start: str
    quiet_hours_end: str
    notification_frequency: str
    created_at: datetime
    updated_at: datetime


class NotificationTemplateResponse(SQLModel):
    id: int
    template_name: str
    template_type: NotificationType
    subject: str
    message: str
    variables: List[str]
    is_active: bool
    is_system: bool
    usage_count: int
    last_used: Optional[datetime]
    created_by: Optional[str]
    created_at: datetime
    updated_at: datetime


class NotificationChannelConfigResponse(SQLModel):
    id: int
    channel_id: str
    channel_name: str
    channel_description: str
    is_enabled: bool
    config: Dict[str, Any]
    supports_priority: bool
    supports_attachments: bool
    max_message_length: Optional[int]
    created_at: datetime
    updated_at: datetime


# Create Models
class NotificationCreate(SQLModel):
    """Notification creation model"""
    data_source_id: Optional[int] = None
    title: str
    message: str
    notification_type: NotificationType
    channel: NotificationChannel = Field(default=NotificationChannel.IN_APP)
    recipient: str
    delivery_metadata: Dict[str, Any] = {}