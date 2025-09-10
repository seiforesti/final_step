from typing import List, Optional, Dict, Any
from sqlmodel import Session, select
from app.models.scan_models import ScanSchedule, Scan, DataSource, ScanRuleSet
from app.services.scan_service import ScanService
from sqlalchemy.exc import SQLAlchemyError
import logging
from datetime import datetime
from croniter import croniter
import asyncio
import time

# Setup logging
logger = logging.getLogger(__name__)


class ScanSchedulerService:
    """Service for managing scan schedules."""
    
    # Flag to control the scheduler loop
    _running = False
    
    @staticmethod
    def create_scan_schedule(
        session: Session,
        name: str,
        data_source_id: int,
        scan_rule_set_id: int,
        cron_expression: str,
        description: Optional[str] = None,
        enabled: bool = True
    ) -> ScanSchedule:
        """Create a new scan schedule."""
        try:
            # Validate data source
            data_source = session.get(DataSource, data_source_id)
            if not data_source:
                raise ValueError(f"Data source with ID {data_source_id} not found")
            
            # Validate scan rule set
            scan_rule_set = session.get(ScanRuleSet, scan_rule_set_id)
            if not scan_rule_set:
                raise ValueError(f"Scan rule set with ID {scan_rule_set_id} not found")
            
            # Validate cron expression
            if not croniter.is_valid(cron_expression):
                raise ValueError(f"Invalid cron expression: {cron_expression}")
            
            # Calculate next run time
            next_run = None
            if enabled:
                cron = croniter(cron_expression, datetime.utcnow())
                next_run = cron.get_next(datetime)
            
            scan_schedule = ScanSchedule(
                name=name,
                description=description,
                data_source_id=data_source_id,
                scan_rule_set_id=scan_rule_set_id,
                cron_expression=cron_expression,
                enabled=enabled,
                next_run=next_run
            )
            
            session.add(scan_schedule)
            session.commit()
            session.refresh(scan_schedule)
            logger.info(f"Created scan schedule: {name}")
            return scan_schedule
        except SQLAlchemyError as e:
            session.rollback()
            logger.error(f"Error creating scan schedule: {str(e)}")
            raise
    
    @staticmethod
    def get_scan_schedule(session: Session, schedule_id: int) -> Optional[ScanSchedule]:
        """Get a scan schedule by ID."""
        return session.get(ScanSchedule, schedule_id)
    
    @staticmethod
    def get_all_schedules(session: Session) -> List[ScanSchedule]:
        """Get all scan schedules"""
        result = session.execute(select(ScanSchedule))
        return result.scalars().all()

    @staticmethod
    def get_enabled_schedules(session: Session) -> List[ScanSchedule]:
        """Get enabled scan schedules"""
        result = session.execute(select(ScanSchedule).where(ScanSchedule.enabled == True))
        return result.scalars().all()
    
    @staticmethod
    def update_scan_schedule(
        session: Session,
        schedule_id: int,
        **kwargs
    ) -> Optional[ScanSchedule]:
        """Update a scan schedule."""
        schedule = session.get(ScanSchedule, schedule_id)
        if not schedule:
            return None
        
        # Update fields
        for key, value in kwargs.items():
            if hasattr(schedule, key):
                setattr(schedule, key, value)
        
        # If cron expression is updated, validate it
        if "cron_expression" in kwargs:
            if not croniter.is_valid(schedule.cron_expression):
                raise ValueError(f"Invalid cron expression: {schedule.cron_expression}")
        
        # If enabled status changes or cron expression changes, update next run time
        if "enabled" in kwargs or "cron_expression" in kwargs:
            if schedule.enabled:
                cron = croniter(schedule.cron_expression, datetime.utcnow())
                schedule.next_run = cron.get_next(datetime)
            else:
                schedule.next_run = None
        
        schedule.updated_at = datetime.utcnow()
        session.add(schedule)
        session.commit()
        session.refresh(schedule)
        logger.info(f"Updated scan schedule: {schedule.name} (ID: {schedule_id})")
        return schedule
    
    @staticmethod
    def delete_scan_schedule(session: Session, schedule_id: int) -> bool:
        """Delete a scan schedule."""
        schedule = session.get(ScanSchedule, schedule_id)
        if not schedule:
            return False
        
        session.delete(schedule)
        session.commit()
        logger.info(f"Deleted scan schedule: {schedule.name} (ID: {schedule_id})")
        return True
    
    @staticmethod
    def enable_scan_schedule(session: Session, schedule_id: int) -> Optional[ScanSchedule]:
        """Enable a scan schedule."""
        schedule = session.get(ScanSchedule, schedule_id)
        if not schedule:
            return None
        
        if not schedule.enabled:
            schedule.enabled = True
            cron = croniter(schedule.cron_expression, datetime.utcnow())
            schedule.next_run = cron.get_next(datetime)
            schedule.updated_at = datetime.utcnow()
            
            session.add(schedule)
            session.commit()
            session.refresh(schedule)
            logger.info(f"Enabled scan schedule: {schedule.name} (ID: {schedule_id})")
        
        return schedule
    
    @staticmethod
    def disable_scan_schedule(session: Session, schedule_id: int) -> Optional[ScanSchedule]:
        """Disable a scan schedule."""
        schedule = session.get(ScanSchedule, schedule_id)
        if not schedule:
            return None
        
        if schedule.enabled:
            schedule.enabled = False
            schedule.next_run = None
            schedule.updated_at = datetime.utcnow()
            
            session.add(schedule)
            session.commit()
            session.refresh(schedule)
            logger.info(f"Disabled scan schedule: {schedule.name} (ID: {schedule_id})")
        
        return schedule
    
    @staticmethod
    async def start_scheduler():
        """Start the scan scheduler."""
        if ScanSchedulerService._running:
            logger.warning("Scan scheduler is already running")
            return
        
        ScanSchedulerService._running = True
        logger.info("Starting scan scheduler")
        
        try:
            await ScanSchedulerService._scheduler_loop()
        except Exception as e:
            logger.error(f"Error in scan scheduler: {str(e)}")
            ScanSchedulerService._running = False
    
    @staticmethod
    def stop_scheduler():
        """Stop the scan scheduler."""
        ScanSchedulerService._running = False
        logger.info("Stopping scan scheduler")
    
    @staticmethod
    async def _scheduler_loop():
        """Main scheduler loop."""
        from app.db_session import get_session
        
        while ScanSchedulerService._running:
            try:
                # Check for schedules that need to be executed
                with get_session() as session:
                    now = datetime.utcnow()
                    schedules_to_run_result = session.execute(
                        select(ScanSchedule)
                        .where(ScanSchedule.enabled == True)
                        .where(ScanSchedule.next_run <= now)
                    )
                    schedules_to_run = schedules_to_run_result.scalars().all()
                    
                    for schedule in schedules_to_run:
                        # Create and execute scan
                        scan_name = f"{schedule.name} (scheduled {now.strftime('%Y-%m-%d %H:%M:%S')})"
                        scan = ScanService.create_scan(
                            session=session,
                            name=scan_name,
                            data_source_id=schedule.data_source_id,
                            scan_rule_set_id=schedule.scan_rule_set_id,
                            description=f"Scheduled scan from {schedule.name}"
                        )
                        
                        # Execute scan
                        ScanService.execute_scan(session, scan.id)
                        
                        # Update schedule's last run and next run times
                        schedule.last_run = now
                        cron = croniter(schedule.cron_expression, now)
                        schedule.next_run = cron.get_next(datetime)
                        session.add(schedule)
                        session.commit()
                        
                        logger.info(f"Executed scheduled scan: {scan_name} (ID: {scan.id})")
            
            except Exception as e:
                logger.error(f"Error in scheduler loop: {str(e)}")
            
            # Sleep for a short time before checking again
            await asyncio.sleep(60)  # Check every minute