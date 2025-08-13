from sqlmodel import Session, select
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from app.models.report_models import (
    Report, ReportTemplate, ReportGeneration,
    ReportResponse, ReportTemplateResponse, ReportCreate, ReportUpdate,
    ReportStats, ReportType, ReportStatus, ReportFormat
)
from app.models.scan_models import DataSource
import logging

logger = logging.getLogger(__name__)


class ReportService:
    """Service layer for report management"""
    
    @staticmethod
    def get_reports_by_data_source(session: Session, data_source_id: int) -> List[ReportResponse]:
        """Get all reports for a data source"""
        try:
            statement = select(Report).where(Report.data_source_id == data_source_id)
            reports = session.exec(statement).all()
            
            return [ReportResponse.from_orm(report) for report in reports]
        except Exception as e:
            logger.error(f"Error getting reports for data source {data_source_id}: {str(e)}")
            return []
    
    @staticmethod
    def get_report_by_id(session: Session, report_id: int) -> Optional[ReportResponse]:
        """Get report by ID"""
        try:
            statement = select(Report).where(Report.id == report_id)
            report = session.exec(statement).first()
            
            if report:
                return ReportResponse.from_orm(report)
            return None
        except Exception as e:
            logger.error(f"Error getting report {report_id}: {str(e)}")
            return None
    
    @staticmethod
    def create_report(session: Session, report_data: ReportCreate, user_id: str) -> ReportResponse:
        """Create a new report"""
        try:
            # Verify data source exists if provided
            if report_data.data_source_id:
                data_source = session.get(DataSource, report_data.data_source_id)
                if not data_source:
                    raise ValueError(f"Data source {report_data.data_source_id} not found")
            
            # Create report
            report = Report(
                data_source_id=report_data.data_source_id,
                name=report_data.name,
                description=report_data.description,
                report_type=report_data.report_type,
                format=report_data.format,
                generated_by=user_id,
                is_scheduled=report_data.is_scheduled,
                schedule_cron=report_data.schedule_cron,
                parameters=report_data.parameters,
                filters=report_data.filters
            )
            
            # Calculate next run if scheduled
            if report.is_scheduled and report.schedule_cron:
                report.next_run = ReportService._calculate_next_run(report.schedule_cron)
            
            session.add(report)
            session.commit()
            session.refresh(report)
            
            logger.info(f"Created report {report.id} for user {user_id}")
            return ReportResponse.from_orm(report)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating report: {str(e)}")
            raise
    
    @staticmethod
    def update_report(session: Session, report_id: int, report_data: ReportUpdate, user_id: str) -> Optional[ReportResponse]:
        """Update an existing report"""
        try:
            report = session.get(Report, report_id)
            if not report:
                return None
            
            # Update fields
            if report_data.name is not None:
                report.name = report_data.name
            if report_data.description is not None:
                report.description = report_data.description
            if report_data.format is not None:
                report.format = report_data.format
            if report_data.is_scheduled is not None:
                report.is_scheduled = report_data.is_scheduled
            if report_data.schedule_cron is not None:
                report.schedule_cron = report_data.schedule_cron
                if report.is_scheduled:
                    report.next_run = ReportService._calculate_next_run(report_data.schedule_cron)
            if report_data.parameters is not None:
                report.parameters = report_data.parameters
            if report_data.filters is not None:
                report.filters = report_data.filters
            
            report.updated_at = datetime.now()
            
            session.add(report)
            session.commit()
            session.refresh(report)
            
            logger.info(f"Updated report {report_id} by user {user_id}")
            return ReportResponse.from_orm(report)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error updating report {report_id}: {str(e)}")
            raise
    
    @staticmethod
    def delete_report(session: Session, report_id: int, user_id: str) -> bool:
        """Delete a report"""
        try:
            report = session.get(Report, report_id)
            if not report:
                return False
            
            session.delete(report)
            session.commit()
            
            logger.info(f"Deleted report {report_id} by user {user_id}")
            return True
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error deleting report {report_id}: {str(e)}")
            return False
    
    @staticmethod
    def generate_report(session: Session, report_id: int, user_id: str) -> bool:
        """Generate a report"""
        try:
            report = session.get(Report, report_id)
            if not report:
                return False
            
            # Update report status
            report.status = ReportStatus.GENERATING
            report.updated_at = datetime.now()
            
            # Create generation record
            generation = ReportGeneration(
                report_id=report_id,
                status=ReportStatus.GENERATING,
                triggered_by=user_id,
                trigger_type="manual"
            )
            
            session.add(report)
            session.add(generation)
            session.commit()
            
            # Here you would integrate with actual report generation logic
            # For now, we'll simulate completion
            ReportService._simulate_report_generation(session, report, generation)
            
            logger.info(f"Started generation for report {report_id} by user {user_id}")
            return True
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error generating report {report_id}: {str(e)}")
            return False
    
    @staticmethod
    def get_report_stats(session: Session, data_source_id: Optional[int] = None) -> ReportStats:
        """Get report statistics"""
        try:
            # Base query
            query = select(Report)
            if data_source_id:
                query = query.where(Report.data_source_id == data_source_id)
            
            reports = session.exec(query).all()
            
            # Calculate statistics
            total_reports = len(reports)
            completed_reports = len([r for r in reports if r.status == ReportStatus.COMPLETED])
            failed_reports = len([r for r in reports if r.status == ReportStatus.FAILED])
            pending_reports = len([r for r in reports if r.status == ReportStatus.PENDING])
            scheduled_reports = len([r for r in reports if r.is_scheduled])
            
            # Calculate total size and average generation time
            total_size_bytes = sum(r.file_size or 0 for r in reports)
            total_size_mb = total_size_bytes / (1024 * 1024) if total_size_bytes > 0 else 0
            
            # Get most used report type
            type_counts = {}
            for report in reports:
                type_counts[report.report_type] = type_counts.get(report.report_type, 0) + 1
            most_used_type = max(type_counts.items(), key=lambda x: x[1])[0] if type_counts else "none"
            
            # Calculate success rate
            success_rate = (completed_reports / total_reports * 100) if total_reports > 0 else 0
            
            return ReportStats(
                total_reports=total_reports,
                completed_reports=completed_reports,
                failed_reports=failed_reports,
                pending_reports=pending_reports,
                scheduled_reports=scheduled_reports,
                total_size_mb=round(total_size_mb, 2),
                avg_generation_time_minutes=5.2,  # Mock value
                most_used_type=most_used_type,
                success_rate_percentage=round(success_rate, 1)
            )
            
        except Exception as e:
            logger.error(f"Error getting report stats: {str(e)}")
            return ReportStats(
                total_reports=0,
                completed_reports=0,
                failed_reports=0,
                pending_reports=0,
                scheduled_reports=0,
                total_size_mb=0.0,
                avg_generation_time_minutes=0.0,
                most_used_type="none",
                success_rate_percentage=0.0
            )
    
    @staticmethod
    def get_templates(session: Session) -> List[ReportTemplateResponse]:
        """Get all report templates"""
        try:
            statement = select(ReportTemplate).where(ReportTemplate.is_active == True)
            templates = session.exec(statement).all()
            
            return [ReportTemplateResponse.from_orm(template) for template in templates]
        except Exception as e:
            logger.error(f"Error getting report templates: {str(e)}")
            return []
    
    @staticmethod
    def get_scheduled_reports(session: Session) -> List[ReportResponse]:
        """Get all scheduled reports"""
        try:
            statement = select(Report).where(
                Report.is_scheduled == True,
                Report.status != ReportStatus.FAILED
            )
            reports = session.exec(statement).all()
            
            return [ReportResponse.from_orm(report) for report in reports]
        except Exception as e:
            logger.error(f"Error getting scheduled reports: {str(e)}")
            return []
    
    @staticmethod
    def _calculate_next_run(cron_expression: str) -> datetime:
        """Calculate next run time from cron expression"""
        # Simple implementation - in production, use croniter library
        # For now, return next hour
        return datetime.now() + timedelta(hours=1)
    
    @staticmethod
    def _simulate_report_generation(session: Session, report: Report, generation: ReportGeneration):
        """Simulate report generation completion"""
        try:
            # Simulate processing
            import time
            time.sleep(0.1)  # Brief delay to simulate processing
            
            # Update report and generation
            report.status = ReportStatus.COMPLETED
            report.generated_at = datetime.now()
            report.file_path = f"/reports/{report.id}_{report.name.replace(' ', '_')}.{report.format}"
            report.file_size = 1024 * 1024  # 1MB mock size
            
            generation.status = ReportStatus.COMPLETED
            generation.completed_at = datetime.now()
            generation.duration_seconds = 5
            generation.output_file_path = report.file_path
            generation.output_file_size = report.file_size
            generation.records_processed = 1000
            
            session.add(report)
            session.add(generation)
            session.commit()
            
        except Exception as e:
            logger.error(f"Error in simulated report generation: {str(e)}")
            # Mark as failed
            report.status = ReportStatus.FAILED
            generation.status = ReportStatus.FAILED
            generation.error_message = str(e)
            session.add(report)
            session.add(generation)
            session.commit()