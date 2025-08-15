"""
Enterprise-Grade Task Scheduler Service
======================================

Production-ready task scheduling service for the data governance platform.
Provides robust job scheduling, monitoring, error handling, and integration
with all data governance services.
"""

import logging
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Callable, Any
from dataclasses import dataclass
from enum import Enum

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.executors.pool import ThreadPoolExecutor
from apscheduler.events import EVENT_JOB_EXECUTED, EVENT_JOB_ERROR, EVENT_JOB_MISSED
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger

# Import all services that need scheduling
from app.services.extraction_service import extract_sql_schema
from app.core.logging import get_logger

# Configure logging
logger = get_logger(__name__)

class JobStatus(Enum):
    """Job execution status enumeration"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    RETRYING = "retrying"
    CANCELLED = "cancelled"

@dataclass
class JobConfig:
    """Configuration for scheduled jobs"""
    id: str
    name: str
    func: Callable
    trigger_type: str  # 'interval', 'cron', 'date'
    trigger_config: Dict[str, Any]
    max_retries: int = 3
    retry_delay: int = 300  # seconds
    timeout: int = 3600  # seconds
    enabled: bool = True
    description: str = ""
    category: str = "general"

class EnterpriseScheduler:
    """
    Enterprise-grade task scheduler with advanced features:
    - Job persistence using database
    - Error handling and retries
    - Job monitoring and logging
    - Performance metrics
    - Health checks
    """
    
    def __init__(self):
        self.scheduler = None
        self.job_configs: Dict[str, JobConfig] = {}
        self.job_stats: Dict[str, Dict] = {}
        self._initialize_scheduler()
        self._setup_job_configs()
        
    def _initialize_scheduler(self):
        """Initialize the APScheduler with enterprise configuration"""
        # Use database for job persistence
        database_url = os.environ.get("DATABASE_URL", "sqlite:///scheduler_jobs.db")
        
        jobstores = {
            'default': SQLAlchemyJobStore(url=database_url)
        }
        
        executors = {
            'default': ThreadPoolExecutor(max_workers=20),
        }
        
        job_defaults = {
            'coalesce': False,
            'max_instances': 3,
            'misfire_grace_time': 30
        }
        
        self.scheduler = BackgroundScheduler(
            jobstores=jobstores,
            executors=executors,
            job_defaults=job_defaults,
            timezone='UTC'
        )
        
        # Add event listeners for monitoring
        self.scheduler.add_listener(self._job_executed_listener, EVENT_JOB_EXECUTED)
        self.scheduler.add_listener(self._job_error_listener, EVENT_JOB_ERROR)
        self.scheduler.add_listener(self._job_missed_listener, EVENT_JOB_MISSED)
        
    def _setup_job_configs(self):
        """Setup all scheduled jobs for the data governance platform"""
        
        # Data Extraction Jobs
        self.job_configs["schema_extraction"] = JobConfig(
            id="schema_extraction",
            name="Database Schema Extraction",
            func=self._run_schema_extraction,
            trigger_type="interval",
            trigger_config={"minutes": 60},
            max_retries=3,
            timeout=1800,
            description="Extract database schemas from all configured data sources",
            category="data_extraction"
        )
        
        # Scan Jobs
        self.job_configs["automated_scans"] = JobConfig(
            id="automated_scans",
            name="Automated Data Scans",
            func=self._run_automated_scans,
            trigger_type="cron",
            trigger_config={"hour": 2, "minute": 0},
            max_retries=2,
            timeout=3600,
            description="Run automated data classification and sensitivity scans",
            category="scanning"
        )
        
        # Compliance Monitoring
        self.job_configs["compliance_monitoring"] = JobConfig(
            id="compliance_monitoring",
            name="Compliance Rule Monitoring",
            func=self._run_compliance_monitoring,
            trigger_type="interval",
            trigger_config={"hours": 4},
            max_retries=3,
            timeout=1200,
            description="Monitor compliance rules and generate alerts",
            category="compliance"
        )
        
        # Data Quality Checks
        self.job_configs["data_quality_checks"] = JobConfig(
            id="data_quality_checks",
            name="Data Quality Assessment",
            func=self._run_data_quality_checks,
            trigger_type="cron",
            trigger_config={"hour": 6, "minute": 30},
            max_retries=2,
            timeout=2400,
            description="Assess data quality across all data sources",
            category="quality"
        )
        
        # Metadata Synchronization
        self.job_configs["metadata_sync"] = JobConfig(
            id="metadata_sync",
            name="Metadata Synchronization",
            func=self._run_metadata_sync,
            trigger_type="interval",
            trigger_config={"minutes": 30},
            max_retries=3,
            timeout=900,
            description="Synchronize metadata across all integrated systems",
            category="metadata"
        )
        
        # Analytics and Reporting
        self.job_configs["analytics_aggregation"] = JobConfig(
            id="analytics_aggregation",
            name="Analytics Data Aggregation",
            func=self._run_analytics_aggregation,
            trigger_type="cron",
            trigger_config={"hour": 1, "minute": 0},
            max_retries=2,
            timeout=1800,
            description="Aggregate analytics data for dashboards and reports",
            category="analytics"
        )
        
        # System Health Checks
        self.job_configs["health_checks"] = JobConfig(
            id="health_checks",
            name="System Health Monitoring",
            func=self._run_health_checks,
            trigger_type="interval",
            trigger_config={"minutes": 15},
            max_retries=1,
            timeout=300,
            description="Monitor system health and performance metrics",
            category="monitoring"
        )
        
    def _job_executed_listener(self, event):
        """Handle successful job execution"""
        job_id = event.job_id
        logger.info(f"Job {job_id} executed successfully")
        
        if job_id not in self.job_stats:
            self.job_stats[job_id] = {
                "executions": 0,
                "failures": 0,
                "last_success": None,
                "last_failure": None,
                "avg_duration": 0
            }
        
        self.job_stats[job_id]["executions"] += 1
        self.job_stats[job_id]["last_success"] = datetime.utcnow()
        
    def _job_error_listener(self, event):
        """Handle job execution errors"""
        job_id = event.job_id
        logger.error(f"Job {job_id} failed: {event.exception}")
        
        if job_id not in self.job_stats:
            self.job_stats[job_id] = {
                "executions": 0,
                "failures": 0,
                "last_success": None,
                "last_failure": None,
                "avg_duration": 0
            }
        
        self.job_stats[job_id]["failures"] += 1
        self.job_stats[job_id]["last_failure"] = datetime.utcnow()
        
        # Implement retry logic if configured
        job_config = self.job_configs.get(job_id)
        if job_config and job_config.max_retries > 0:
            self._schedule_retry(job_id, job_config)
            
    def _job_missed_listener(self, event):
        """Handle missed job executions"""
        job_id = event.job_id
        logger.warning(f"Job {job_id} was missed")
        
    def _schedule_retry(self, job_id: str, job_config: JobConfig):
        """Schedule a retry for a failed job"""
        retry_time = datetime.utcnow() + timedelta(seconds=job_config.retry_delay)
        
        retry_job_id = f"{job_id}_retry_{int(retry_time.timestamp())}"
        
        self.scheduler.add_job(
            func=job_config.func,
            trigger='date',
            run_date=retry_time,
            id=retry_job_id,
            max_instances=1,
            coalesce=True
        )
        
        logger.info(f"Scheduled retry for job {job_id} at {retry_time}")
        
    def start(self):
        """Start the scheduler and add all configured jobs"""
        logger.info("Starting Enterprise Task Scheduler...")
        
        # Add all configured jobs
        for job_config in self.job_configs.values():
            if job_config.enabled:
                self._add_job(job_config)
                
        self.scheduler.start()
        logger.info("Enterprise Task Scheduler started successfully")
        
    def stop(self):
        """Stop the scheduler gracefully"""
        logger.info("Stopping Enterprise Task Scheduler...")
        if self.scheduler:
            self.scheduler.shutdown(wait=True)
        logger.info("Enterprise Task Scheduler stopped")
        
    def _add_job(self, job_config: JobConfig):
        """Add a job to the scheduler"""
        if job_config.trigger_type == "interval":
            trigger = IntervalTrigger(**job_config.trigger_config)
        elif job_config.trigger_type == "cron":
            trigger = CronTrigger(**job_config.trigger_config)
        else:
            logger.error(f"Unsupported trigger type: {job_config.trigger_type}")
            return
            
        self.scheduler.add_job(
            func=job_config.func,
            trigger=trigger,
            id=job_config.id,
            name=job_config.name,
            max_instances=1,
            coalesce=True
        )
        
        logger.info(f"Added job: {job_config.name} ({job_config.id})")
        
    # Job implementation methods
    def _run_schema_extraction(self):
        """Run database schema extraction"""
        try:
            logger.info("Starting schema extraction job...")
            
            # Get database configurations from environment or service
            database_configs = self._get_database_configs()
            
            for config in database_configs:
                extract_sql_schema(config["connection_string"], config["db_type"])
                
            logger.info("Schema extraction job completed successfully")
            
        except Exception as e:
            logger.error(f"Schema extraction job failed: {e}")
            raise
            
    def _run_automated_scans(self):
        """Run automated data scans"""
        try:
            logger.info("Starting automated scans job...")
            
            # Import scan services
            from app.services.scan_service import run_automated_scans
            
            result = run_automated_scans()
            logger.info(f"Automated scans completed: {result}")
            
        except Exception as e:
            logger.error(f"Automated scans job failed: {e}")
            raise
            
    def _run_compliance_monitoring(self):
        """Run compliance monitoring"""
        try:
            logger.info("Starting compliance monitoring job...")
            
            # Import compliance services
            from app.services.compliance_rule_service import monitor_compliance_rules
            
            result = monitor_compliance_rules()
            logger.info(f"Compliance monitoring completed: {result}")
            
        except Exception as e:
            logger.error(f"Compliance monitoring job failed: {e}")
            raise
            
    def _run_data_quality_checks(self):
        """Run data quality checks"""
        try:
            logger.info("Starting data quality checks job...")
            
            # Import quality services
            from app.services.catalog_quality_service import run_quality_assessment
            
            result = run_quality_assessment()
            logger.info(f"Data quality checks completed: {result}")
            
        except Exception as e:
            logger.error(f"Data quality checks job failed: {e}")
            raise
            
    def _run_metadata_sync(self):
        """Run metadata synchronization"""
        try:
            logger.info("Starting metadata synchronization job...")
            
            # Import metadata services
            from app.services.enterprise_catalog_service import sync_metadata
            
            result = sync_metadata()
            logger.info(f"Metadata synchronization completed: {result}")
            
        except Exception as e:
            logger.error(f"Metadata synchronization job failed: {e}")
            raise
            
    def _run_analytics_aggregation(self):
        """Run analytics data aggregation"""
        try:
            logger.info("Starting analytics aggregation job...")
            
            # Import analytics services
            from app.services.comprehensive_analytics_service import aggregate_analytics_data
            
            result = aggregate_analytics_data()
            logger.info(f"Analytics aggregation completed: {result}")
            
        except Exception as e:
            logger.error(f"Analytics aggregation job failed: {e}")
            raise
            
    def _run_health_checks(self):
        """Run system health checks"""
        try:
            logger.info("Starting health checks job...")
            
            # Import monitoring services
            from app.services.performance_service import run_health_checks
            
            result = run_health_checks()
            logger.info(f"Health checks completed: {result}")
            
        except Exception as e:
            logger.error(f"Health checks job failed: {e}")
            raise
            
    def _get_database_configs(self) -> List[Dict[str, str]]:
        """Get database configurations for schema extraction"""
        # In production, this would load from configuration service
        return [
            {
                "connection_string": os.environ.get(
                    "DATABASE_URL", 
                    "postgresql://postgres:postgres@postgres:5432/data_governance"
                ),
                "db_type": "postgresql"
            }
        ]
        
    def get_job_status(self, job_id: str) -> Dict[str, Any]:
        """Get status and statistics for a specific job"""
        return self.job_stats.get(job_id, {})
        
    def get_all_job_status(self) -> Dict[str, Dict[str, Any]]:
        """Get status and statistics for all jobs"""
        return self.job_stats.copy()

# Global scheduler instance
_scheduler_instance: Optional[EnterpriseScheduler] = None

def get_scheduler() -> EnterpriseScheduler:
    """Get the global scheduler instance"""
    global _scheduler_instance
    if _scheduler_instance is None:
        _scheduler_instance = EnterpriseScheduler()
    return _scheduler_instance

def schedule_tasks():
    """Initialize and start the enterprise task scheduler"""
    scheduler = get_scheduler()
    scheduler.start()
    return scheduler
