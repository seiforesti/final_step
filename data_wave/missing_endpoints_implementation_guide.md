# Missing Backend API Endpoints Implementation Guide

## Overview
This document provides implementation guidance for the missing backend API endpoints identified in the data-sources frontend/backend mapping analysis.

## Missing Endpoints by Category

### 1. Backup & Restore Operations (9 endpoints missing)

#### Required Endpoints:
```python
# In scan_routes.py or new backup_routes.py

@router.get("/data-sources/{data_source_id}/backup-status")
async def get_backup_status(data_source_id: int, session: Session = Depends(get_session)):
    """Get backup status for a data source"""
    pass

@router.get("/data-sources/{data_source_id}/backups")
async def get_backups(data_source_id: int, session: Session = Depends(get_session)):
    """Get all backups for a data source"""
    pass

@router.post("/data-sources/{data_source_id}/backups")
async def start_backup(data_source_id: int, backup_data: dict, session: Session = Depends(get_session)):
    """Start a new backup for a data source"""
    pass

@router.delete("/data-sources/{data_source_id}/backups/{backup_id}")
async def delete_backup(data_source_id: int, backup_id: int, session: Session = Depends(get_session)):
    """Delete a backup"""
    pass

@router.post("/data-sources/{data_source_id}/backups/{backup_id}/restore")
async def restore_backup(data_source_id: int, backup_id: int, options: dict, session: Session = Depends(get_session)):
    """Restore a backup"""
    pass

@router.get("/data-sources/{data_source_id}/backup-schedules")
async def get_backup_schedules(data_source_id: int, session: Session = Depends(get_session)):
    """Get backup schedules for a data source"""
    pass

@router.post("/data-sources/{data_source_id}/backup-schedules")
async def create_backup_schedule(data_source_id: int, schedule: dict, session: Session = Depends(get_session)):
    """Create a backup schedule"""
    pass

@router.put("/data-sources/{data_source_id}/backup-schedules/{schedule_id}")
async def update_backup_schedule(data_source_id: int, schedule_id: int, schedule: dict, session: Session = Depends(get_session)):
    """Update a backup schedule"""
    pass

@router.delete("/data-sources/{data_source_id}/backup-schedules/{schedule_id}")
async def delete_backup_schedule(data_source_id: int, schedule_id: int, session: Session = Depends(get_session)):
    """Delete a backup schedule"""
    pass
```

#### Implementation Priority: HIGH
- **Impact**: Complete functionality missing
- **Effort**: Medium (requires backup service implementation)
- **Dependencies**: Backup service, storage service

### 2. Reports Operations (10 endpoints missing)

#### Required Endpoints:
```python
# In new reports_routes.py

@router.get("/data-sources/{data_source_id}/reports")
async def get_reports(data_source_id: int, session: Session = Depends(get_session)):
    """Get all reports for a data source"""
    pass

@router.get("/data-sources/{data_source_id}/reports/{report_id}")
async def get_report(data_source_id: int, report_id: int, session: Session = Depends(get_session)):
    """Get a specific report"""
    pass

@router.post("/data-sources/{data_source_id}/reports")
async def create_report(data_source_id: int, report_data: dict, session: Session = Depends(get_session)):
    """Create a new report"""
    pass

@router.post("/data-sources/{data_source_id}/reports/{report_id}/generate")
async def generate_report(data_source_id: int, report_id: int, session: Session = Depends(get_session)):
    """Generate a report"""
    pass

@router.post("/data-sources/{data_source_id}/reports/{report_id}/cancel")
async def cancel_report(data_source_id: int, report_id: int, session: Session = Depends(get_session)):
    """Cancel a report generation"""
    pass

@router.delete("/data-sources/{data_source_id}/reports/{report_id}")
async def delete_report(data_source_id: int, report_id: int, session: Session = Depends(get_session)):
    """Delete a report"""
    pass

@router.get("/data-sources/{data_source_id}/reports/{report_id}/download")
async def download_report(data_source_id: int, report_id: int, session: Session = Depends(get_session)):
    """Download a report"""
    pass

@router.get("/report-templates")
async def get_report_templates(session: Session = Depends(get_session)):
    """Get available report templates"""
    pass

@router.get("/data-sources/{data_source_id}/reports/stats")
async def get_report_stats(data_source_id: int, session: Session = Depends(get_session)):
    """Get report statistics"""
    pass

@router.post("/data-sources/{data_source_id}/reports/{report_id}/schedule")
async def schedule_report(data_source_id: int, report_id: int, schedule: dict, session: Session = Depends(get_session)):
    """Schedule a report"""
    pass
```

#### Implementation Priority: HIGH
- **Impact**: Complete functionality missing
- **Effort**: High (requires reporting engine)
- **Dependencies**: Report service, template service, scheduling service

### 3. Notification Management (5 endpoints missing)

#### Required Endpoints:
```python
# In notification_routes.py

@router.post("/{notification_id}/read")
async def mark_notification_read(notification_id: int, session: Session = Depends(get_session)):
    """Mark a notification as read"""
    pass

@router.post("/mark-read")
async def mark_multiple_notifications_read(notification_ids: List[int], session: Session = Depends(get_session)):
    """Mark multiple notifications as read"""
    pass

@router.post("/{notification_id}/acknowledge")
async def acknowledge_notification(notification_id: int, session: Session = Depends(get_session)):
    """Acknowledge a notification"""
    pass

@router.delete("/{notification_id}")
async def delete_notification(notification_id: int, session: Session = Depends(get_session)):
    """Delete a notification"""
    pass

@router.get("/stats")
async def get_notification_stats(session: Session = Depends(get_session)):
    """Get notification statistics"""
    pass
```

#### Implementation Priority: MEDIUM
- **Impact**: Partial functionality missing
- **Effort**: Low (extend existing notification system)
- **Dependencies**: Existing notification service

### 4. Security & Access Control (2 endpoints missing)

#### Required Endpoints:
```python
# In scan_routes.py or new security_routes.py

@router.get("/data-sources/{data_source_id}/security-audit")
async def get_security_audit(data_source_id: int, session: Session = Depends(get_session)):
    """Get security audit for a data source"""
    pass

@router.get("/data-sources/{data_source_id}/access-control")
async def get_access_control(data_source_id: int, session: Session = Depends(get_session)):
    """Get access control for a data source"""
    pass
```

#### Implementation Priority: MEDIUM
- **Impact**: Enhanced functionality missing
- **Effort**: Medium (requires security service)
- **Dependencies**: Security service, RBAC service

## Implementation Strategy

### Phase 1: High Priority Missing Features (Weeks 1-4)
1. **Backup & Restore System**
   - Create backup service
   - Implement backup storage
   - Add backup/restore endpoints
   - Test with frontend

2. **Reporting System**
   - Create report service
   - Implement report templates
   - Add report generation endpoints
   - Test with frontend

### Phase 2: Medium Priority Enhancements (Weeks 5-6)
1. **Notification Management**
   - Extend existing notification system
   - Add missing CRUD endpoints
   - Test with frontend

2. **Security & Access Control**
   - Create security service
   - Add security audit endpoints
   - Add access control endpoints
   - Test with frontend

### Phase 3: Low Priority Optimizations (Weeks 7-8)
1. **API Consistency**
   - Standardize response formats
   - Implement consistent error handling
   - Add comprehensive logging

2. **Documentation & Testing**
   - Add API documentation
   - Implement integration tests
   - Performance optimization

## Service Dependencies

### New Services Required:
1. **BackupService** - Handle backup/restore operations
2. **ReportService** - Handle report generation and management
3. **SecurityService** - Handle security audits and access control
4. **TemplateService** - Handle report templates
5. **SchedulingService** - Handle scheduled operations

### Database Models Required:
1. **Backup** - Store backup metadata
2. **BackupSchedule** - Store backup schedules
3. **Report** - Store report metadata
4. **ReportTemplate** - Store report templates
5. **ReportSchedule** - Store report schedules

## Testing Strategy

### Unit Tests:
- Test each service independently
- Mock external dependencies
- Test error conditions

### Integration Tests:
- Test API endpoints with database
- Test frontend/backend integration
- Test error handling

### End-to-End Tests:
- Test complete user workflows
- Test backup/restore scenarios
- Test report generation scenarios

## Monitoring & Logging

### Metrics to Track:
- API response times
- Error rates
- Backup success rates
- Report generation times
- User activity

### Logging Requirements:
- Request/response logging
- Error logging with context
- Performance logging
- Security event logging

## Security Considerations

### Authentication & Authorization:
- All endpoints require authentication
- Role-based access control
- Audit logging for sensitive operations

### Data Protection:
- Encrypt backup data
- Secure report storage
- Protect sensitive information in logs

### Input Validation:
- Validate all input parameters
- Sanitize user inputs
- Prevent injection attacks

## Conclusion

Implementing these missing endpoints will provide complete functionality parity between the frontend and backend systems. The phased approach ensures that critical features are implemented first while maintaining system stability and security.





// Frontend expects these but backend has NONE:
GET /api/data-sources/{id}/backup-status
GET /api/data-sources/{id}/backups
POST /api/data-sources/{id}/backups
DELETE /api/data-sources/{id}/backups/{backupId}
POST /api/data-sources/{id}/backups/{backupId}/restore
GET /api/data-sources/{id}/backup-schedules
POST /api/data-sources/{id}/backup-schedules
PUT /api/data-sources/{id}/backup-schedules/{scheduleId}
DELETE /api/data-sources/{id}/backup-schedules/{scheduleId}

// Frontend expects these but backend has NONE:
GET /api/data-sources/{id}/reports
GET /api/data-sources/{id}/reports/{reportId}
POST /api/data-sources/{id}/reports
POST /api/data-sources/{id}/reports/{reportId}/generate
POST /api/data-sources/{id}/reports/{reportId}/cancel
DELETE /api/data-sources/{id}/reports/{reportId}
GET /api/data-sources/{id}/reports/{reportId}/download
GET /api/report-templates
GET /api/data-sources/{id}/reports/stats
POST /api/data-sources/{id}/reports/{reportId}/schedule


// Frontend expects these but backend only has basic GET:
POST /api/notifications/{id}/read
POST /api/notifications/mark-read
POST /api/notifications/{id}/acknowledge
DELETE /api/notifications/{id}
GET /api/notifications/stats

// Frontend expects these but backend has NONE:
GET /scan/data-sources/{id}/security-audit
GET /scan/data-sources/{id}/access-control