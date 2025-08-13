from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum
import json


class MetricType(str, Enum):
    RESPONSE_TIME = "response_time"
    THROUGHPUT = "throughput"
    ERROR_RATE = "error_rate"
    CPU_USAGE = "cpu_usage"
    MEMORY_USAGE = "memory_usage"
    DISK_USAGE = "disk_usage"
    NETWORK_LATENCY = "network_latency"
    QUERY_PERFORMANCE = "query_performance"


class MetricStatus(str, Enum):
    GOOD = "good"
    WARNING = "warning"
    CRITICAL = "critical"
    UNKNOWN = "unknown"


class PerformanceMetric(SQLModel, table=True):
    """Performance metric model for tracking data source performance"""
    __tablename__ = "performance_metrics"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    data_source_id: int = Field(foreign_key="data_sources.id", index=True)
    metric_type: MetricType
    
    # Metric values
    value: float
    unit: str
    threshold: Optional[float] = None
    status: MetricStatus = Field(default=MetricStatus.UNKNOWN)
    
    # Trend analysis
    trend: str = Field(default="stable")  # improving, stable, degrading
    previous_value: Optional[float] = None
    change_percentage: Optional[float] = None
    
    # Metadata
    measurement_time: datetime = Field(default_factory=datetime.now)
    time_range: str = Field(default="1h")  # Time range for the metric
    
    # Additional data stored as JSON
    metric_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class PerformanceAlert(SQLModel, table=True):
    """Performance alert model for tracking performance issues"""
    __tablename__ = "performance_alerts"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    data_source_id: int = Field(foreign_key="data_sources.id", index=True)
    metric_id: int = Field(foreign_key="performance_metrics.id")
    
    # Alert details
    alert_type: str  # threshold_exceeded, anomaly_detected, etc.
    severity: str = Field(default="medium")  # low, medium, high, critical
    title: str
    description: str
    
    # Status
    status: str = Field(default="active")  # active, acknowledged, resolved
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class PerformanceBaseline(SQLModel, table=True):
    """Performance baseline model for tracking normal performance ranges"""
    __tablename__ = "performance_baselines"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    data_source_id: int = Field(foreign_key="data_sources.id", index=True)
    metric_type: MetricType
    
    # Baseline values
    baseline_value: float
    min_value: float
    max_value: float
    std_deviation: float
    
    # Thresholds
    warning_threshold: float
    critical_threshold: float
    
    # Metadata
    calculation_period: str = Field(default="30d")  # Period used to calculate baseline
    last_calculated: datetime = Field(default_factory=datetime.now)
    sample_count: int = Field(default=0)
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


# Response Models
class PerformanceMetricResponse(SQLModel):
    id: int
    data_source_id: int
    metric_type: MetricType
    value: float
    unit: str
    threshold: Optional[float]
    status: MetricStatus
    trend: str
    previous_value: Optional[float]
    change_percentage: Optional[float]
    measurement_time: datetime
    time_range: str
    metric_metadata: Dict[str, Any]


class PerformanceAlertResponse(SQLModel):
    id: int
    data_source_id: int
    metric_id: int
    alert_type: str
    severity: str
    title: str
    description: str
    status: str
    acknowledged_by: Optional[str]
    acknowledged_at: Optional[datetime]
    resolved_at: Optional[datetime]
    created_at: datetime


class PerformanceOverviewResponse(SQLModel):
    overall_score: float
    metrics: List[PerformanceMetricResponse]
    alerts: List[PerformanceAlertResponse]
    trends: Dict[str, Any]
    recommendations: List[str]


# Create Models
class PerformanceMetricCreate(SQLModel):
    data_source_id: int
    metric_type: MetricType
    value: float
    unit: str
    threshold: Optional[float] = None
    status: MetricStatus = MetricStatus.UNKNOWN
    trend: str = "stable"
    time_range: str = "1h"
    metric_metadata: Dict[str, Any] = Field(default_factory=dict)


class PerformanceAlertCreate(SQLModel):
    data_source_id: int
    metric_id: int
    alert_type: str
    severity: str = "medium"
    title: str
    description: str


# Update Models
class PerformanceMetricUpdate(SQLModel):
    value: Optional[float] = None
    unit: Optional[str] = None
    threshold: Optional[float] = None
    status: Optional[MetricStatus] = None
    trend: Optional[str] = None
    metric_metadata: Optional[Dict[str, Any]] = None


class PerformanceAlertUpdate(SQLModel):
    status: Optional[str] = None
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None