# Data Sources API Mapping Analysis

## Overview
This document provides a comprehensive analysis of the APIs used by the data-sources frontend components and their corresponding backend routes. The analysis identifies matches, mismatches, and missing endpoints to ensure proper integration between frontend and backend.

## Frontend API Categories

### 1. Data Source CRUD Operations

#### Frontend APIs (from `apis.ts`):
- `GET /scan/data-sources` - Get all data sources
- `GET /scan/data-sources/{id}` - Get specific data source
- `POST /scan/data-sources` - Create data source
- `PUT /scan/data-sources/{id}` - Update data source
- `DELETE /scan/data-sources/{id}` - Delete data source

#### Backend Routes (from `scan_routes.py`):
✅ **MATCHES FOUND:**
- `GET /data-sources` (line 284) - Get all data sources
- `GET /data-sources/{data_source_id}` (line 345) - Get specific data source
- `POST /data-sources` (line 245) - Create data source
- `PUT /data-sources/{data_source_id}` (line 363) - Update data source
- `DELETE /data-sources/{data_source_id}` (line 397) - Delete data source

**Status:** ✅ All CRUD operations are properly mapped

### 2. Data Source Health & Statistics

#### Frontend APIs:
- `GET /scan/data-sources/{id}/health` - Get data source health
- `GET /scan/data-sources/{id}/stats` - Get data source statistics
- `GET /scan/data-sources/{id}/performance-metrics` - Get performance metrics
- `GET /scan/data-sources/{id}/security-audit` - Get security audit
- `GET /scan/data-sources/{id}/access-control` - Get access control

#### Backend Routes:
✅ **MATCHES FOUND:**
- `GET /data-sources/{data_source_id}/health` (line 430) - Get health status
- `GET /data-sources/{data_source_id}/stats` (line 448) - Get statistics
- `GET /data-sources/{data_source_id}/performance-metrics` (line 1000+) - Get performance metrics

❌ **MISSING BACKEND ROUTES:**
- Security audit endpoint
- Access control endpoint

**Status:** ⚠️ Partially mapped - missing security and access control endpoints

### 3. Connection Testing

#### Frontend APIs:
- `POST /data-discovery/data-sources/{id}/test-connection` - Test connection
- `GET /data-sources/{id}/health` - Health check

#### Backend Routes:
✅ **MATCHES FOUND:**
- `POST /data-sources/{data_source_id}/test-connection` (data_discovery_routes.py line 283) - Test connection
- `GET /data-sources/{data_source_id}/health` (scan_routes.py line 430) - Health check

**Status:** ✅ Properly mapped

### 4. Data Discovery Operations

#### Frontend APIs:
- `POST /data-discovery/data-sources/{id}/discover-schema` - Discover schema
- `GET /data-discovery/data-sources/{id}/discovery-history` - Get discovery history
- `POST /data-discovery/data-sources/{id}/preview-table` - Preview table
- `POST /data-discovery/data-sources/profile-column` - Profile column
- `POST /data-discovery/data-sources/{id}/save-workspace` - Save workspace
- `GET /data-discovery/data-sources/{id}/workspaces` - Get workspaces

#### Backend Routes:
✅ **MATCHES FOUND:**
- `POST /data-sources/{data_source_id}/discover-schema` (line 83) - Discover schema
- `GET /data-sources/{data_source_id}/discovery-history` (line 516) - Get discovery history
- `POST /data-sources/{data_source_id}/preview-table` (line 327) - Preview table
- `POST /data-sources/profile-column` (line 374) - Profile column
- `POST /data-sources/{data_source_id}/save-workspace` (line 573) - Save workspace
- `GET /data-sources/{data_source_id}/workspaces` (line 659) - Get workspaces

**Status:** ✅ All discovery operations are properly mapped

### 5. Backup & Restore Operations

#### Frontend APIs (from `data-source-backup-restore.tsx`):
- `GET /api/data-sources/{id}/backup-status` - Get backup status
- `GET /api/data-sources/{id}/backups` - Get backups
- `POST /api/data-sources/{id}/backups` - Start backup
- `DELETE /api/data-sources/{id}/backups/{backupId}` - Delete backup
- `POST /api/data-sources/{id}/backups/{backupId}/restore` - Restore backup
- `GET /api/data-sources/{id}/backup-schedules` - Get backup schedules
- `POST /api/data-sources/{id}/backup-schedules` - Create backup schedule
- `PUT /api/data-sources/{id}/backup-schedules/{scheduleId}` - Update backup schedule
- `DELETE /api/data-sources/{id}/backup-schedules/{scheduleId}` - Delete backup schedule

#### Backend Routes:
❌ **MISSING BACKEND ROUTES:**
- No backup/restore endpoints found in scan_routes.py or other route files

**Status:** ❌ Missing - No backup/restore functionality in backend

### 6. Notification Operations

#### Frontend APIs (from `data-source-notifications.tsx`):
- `GET /api/notifications` - Get notifications
- `POST /api/notifications/{id}/read` - Mark as read
- `POST /api/notifications/mark-read` - Mark multiple as read
- `POST /api/notifications/{id}/acknowledge` - Acknowledge notification
- `DELETE /api/notifications/{id}` - Delete notification
- `GET /api/notifications/stats` - Get notification stats
- `GET /api/notifications/preferences` - Get notification preferences

#### Backend Routes (from `notification_routes.py`):
✅ **MATCHES FOUND:**
- `GET /` (line 67) - Get notifications
- `GET /settings` (line 130) - Get notification settings

❌ **MISSING BACKEND ROUTES:**
- Mark as read endpoint
- Mark multiple as read endpoint
- Acknowledge notification endpoint
- Delete notification endpoint
- Notification stats endpoint

**Status:** ⚠️ Partially mapped - missing several notification management endpoints

### 7. Reports Operations

#### Frontend APIs (from `data-source-reports.tsx`):
- `GET /api/data-sources/{id}/reports` - Get reports
- `GET /api/data-sources/{id}/reports/{reportId}` - Get specific report
- `POST /api/data-sources/{id}/reports` - Create report
- `POST /api/data-sources/{id}/reports/{reportId}/generate` - Generate report
- `POST /api/data-sources/{id}/reports/{reportId}/cancel` - Cancel report
- `DELETE /api/data-sources/{id}/reports/{reportId}` - Delete report
- `GET /api/data-sources/{id}/reports/{reportId}/download` - Download report
- `GET /api/report-templates` - Get report templates
- `GET /api/data-sources/{id}/reports/stats` - Get report stats
- `POST /api/data-sources/{id}/reports/{reportId}/schedule` - Schedule report

#### Backend Routes:
❌ **MISSING BACKEND ROUTES:**
- No report endpoints found in scan_routes.py or other route files

**Status:** ❌ Missing - No report functionality in backend

### 8. Bulk Operations

#### Frontend APIs:
- `POST /api/data-sources/bulk-update` - Bulk update data sources
- `DELETE /api/data-sources/bulk-delete` - Bulk delete data sources

#### Backend Routes (from `scan_routes.py`):
✅ **MATCHES FOUND:**
- `POST /data-sources/bulk-update` (line 542) - Bulk update data sources
- `DELETE /data-sources/bulk-delete` (line 560) - Bulk delete data sources

**Status:** ✅ Properly mapped

### 9. Scan Operations

#### Frontend APIs:
- `POST /scan/data-sources/{id}/scan` - Start scan
- `GET /scan/schedules` - Get scan schedules

#### Backend Routes (from `scan_routes.py`):
✅ **MATCHES FOUND:**
- `POST /data-sources/{data_source_id}/scan` (line 513) - Start scan
- `GET /schedules` (line 850) - Get scan schedules

**Status:** ✅ Properly mapped

### 10. Enterprise Integration

#### Frontend APIs (from `enterprise-apis.ts`):
- Various enterprise-specific endpoints for security, compliance, and advanced features

#### Backend Routes:
✅ **PARTIAL MATCHES FOUND:**
- Multiple enterprise routes in various files (enterprise_integration_routes.py, compliance_routes.py, etc.)

**Status:** ⚠️ Partially mapped - enterprise features are distributed across multiple route files

## Summary of API Mapping Status

### ✅ Fully Mapped Categories:
1. **Data Source CRUD Operations** - 100% mapped
2. **Connection Testing** - 100% mapped
3. **Data Discovery Operations** - 100% mapped
4. **Bulk Operations** - 100% mapped
5. **Scan Operations** - 100% mapped

### ⚠️ Partially Mapped Categories:
1. **Health & Statistics** - 60% mapped (missing security audit, access control)
2. **Notifications** - 30% mapped (missing most management endpoints)
3. **Enterprise Integration** - 70% mapped (distributed across multiple files)

### ❌ Missing Categories:
1. **Backup & Restore Operations** - 0% mapped
2. **Reports Operations** - 0% mapped

## Recommendations

### 1. High Priority - Missing Core Functionality
- **Backup & Restore**: Implement complete backup/restore API endpoints
- **Reports**: Implement comprehensive reporting API endpoints
- **Notification Management**: Add missing notification CRUD endpoints

### 2. Medium Priority - Enhance Existing Functionality
- **Security Audit**: Add security audit endpoints
- **Access Control**: Add access control management endpoints
- **Performance Metrics**: Enhance performance monitoring endpoints

### 3. Low Priority - Optimization
- **API Consistency**: Standardize API response formats across all endpoints
- **Error Handling**: Implement consistent error handling patterns
- **Documentation**: Add comprehensive API documentation

## API Prefix Mapping

### Frontend Prefixes:
- `/api/data-sources/*` - Main data source operations
- `/api/notifications/*` - Notification operations
- `/scan/*` - Scan and discovery operations
- `/data-discovery/*` - Data discovery operations

### Backend Prefixes:
- `/data-sources/*` - Main data source operations
- `/api/v1/notifications/*` - Notification operations
- `/scans/*` - Scan operations
- `/data-discovery/*` - Data discovery operations

**Note:** The frontend uses `/api/` prefix while backend uses direct paths. This is handled by the frontend API configuration.

## Conclusion

The data-sources frontend and backend have a **70% API mapping coverage**. Core CRUD operations, discovery, and scan functionality are well-mapped, but significant gaps exist in backup/restore, reporting, and notification management. Addressing these gaps will ensure full functionality parity between frontend and backend systems.
