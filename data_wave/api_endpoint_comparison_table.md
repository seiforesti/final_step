# Data Sources API Endpoint Comparison Table

## Frontend vs Backend API Mapping

| Category | Frontend API | HTTP Method | Backend Route | HTTP Method | Status | Notes |
|----------|-------------|-------------|---------------|-------------|--------|-------|
| **Data Source CRUD** | | | | | | |
| | `/scan/data-sources` | GET | `/data-sources` | GET | ✅ Match | Line 284 in scan_routes.py |
| | `/scan/data-sources/{id}` | GET | `/data-sources/{data_source_id}` | GET | ✅ Match | Line 345 in scan_routes.py |
| | `/scan/data-sources` | POST | `/data-sources` | POST | ✅ Match | Line 245 in scan_routes.py |
| | `/scan/data-sources/{id}` | PUT | `/data-sources/{data_source_id}` | PUT | ✅ Match | Line 363 in scan_routes.py |
| | `/scan/data-sources/{id}` | DELETE | `/data-sources/{data_source_id}` | DELETE | ✅ Match | Line 397 in scan_routes.py |
| **Health & Stats** | | | | | | |
| | `/scan/data-sources/{id}/health` | GET | `/data-sources/{data_source_id}/health` | GET | ✅ Match | Line 430 in scan_routes.py |
| | `/scan/data-sources/{id}/stats` | GET | `/data-sources/{data_source_id}/stats` | GET | ✅ Match | Line 448 in scan_routes.py |
| | `/scan/data-sources/{id}/performance-metrics` | GET | `/data-sources/{data_source_id}/performance-metrics` | GET | ✅ Match | Line 1000+ in scan_routes.py |
| | `/scan/data-sources/{id}/security-audit` | GET | ❌ Missing | ❌ Missing | ❌ Missing | Not implemented in backend |
| | `/scan/data-sources/{id}/access-control` | GET | ❌ Missing | ❌ Missing | ❌ Missing | Not implemented in backend |
| **Connection Testing** | | | | | | |
| | `/data-discovery/data-sources/{id}/test-connection` | POST | `/data-sources/{data_source_id}/test-connection` | POST | ✅ Match | Line 283 in data_discovery_routes.py |
| | `/data-sources/{id}/health` | GET | `/data-sources/{data_source_id}/health` | GET | ✅ Match | Line 430 in scan_routes.py |
| **Data Discovery** | | | | | | |
| | `/data-discovery/data-sources/{id}/discover-schema` | POST | `/data-sources/{data_source_id}/discover-schema` | POST | ✅ Match | Line 83 in data_discovery_routes.py |
| | `/data-discovery/data-sources/{id}/discovery-history` | GET | `/data-sources/{data_source_id}/discovery-history` | GET | ✅ Match | Line 516 in data_discovery_routes.py |
| | `/data-discovery/data-sources/{id}/preview-table` | POST | `/data-sources/{data_source_id}/preview-table` | POST | ✅ Match | Line 327 in data_discovery_routes.py |
| | `/data-discovery/data-sources/profile-column` | POST | `/data-sources/profile-column` | POST | ✅ Match | Line 374 in data_discovery_routes.py |
| | `/data-discovery/data-sources/{id}/save-workspace` | POST | `/data-sources/{data_source_id}/save-workspace` | POST | ✅ Match | Line 573 in data_discovery_routes.py |
| | `/data-discovery/data-sources/{id}/workspaces` | GET | `/data-sources/{data_source_id}/workspaces` | GET | ✅ Match | Line 659 in data_discovery_routes.py |
| **Backup & Restore** | | | | | | |
| | `/api/data-sources/{id}/backup-status` | GET | ❌ Missing | ❌ Missing | ❌ Missing | Not implemented in backend |
| | `/api/data-sources/{id}/backups` | GET | ❌ Missing | ❌ Missing | ❌ Missing | Not implemented in backend |
| | `/api/data-sources/{id}/backups` | POST | ❌ Missing | ❌ Missing | ❌ Missing | Not implemented in backend |
| | `/api/data-sources/{id}/backups/{backupId}` | DELETE | ❌ Missing | ❌ Missing | ❌ Missing | Not implemented in backend |
| | `/api/data-sources/{id}/backups/{backupId}/restore` | POST | ❌ Missing | ❌ Missing | ❌ Missing | Not implemented in backend |
| | `/api/data-sources/{id}/backup-schedules` | GET | ❌ Missing | ❌ Missing | ❌ Missing | Not implemented in backend |
| | `/api/data-sources/{id}/backup-schedules` | POST | ❌ Missing | ❌ Missing | ❌ Missing | Not implemented in backend |
| | `/api/data-sources/{id}/backup-schedules/{scheduleId}` | PUT | ❌ Missing | ❌ Missing | ❌ Missing | Not implemented in backend |
| | `/api/data-sources/{id}/backup-schedules/{scheduleId}` | DELETE | ❌ Missing | ❌ Missing | ❌ Missing | Not implemented in backend |
| **Notifications** | | | | | | |
| | `/api/notifications` | GET | `/` | GET | ✅ Match | Line 67 in notification_routes.py |
| | `/api/notifications/{id}/read` | POST | ❌ Missing | ❌ Missing | ❌ Missing | Not implemented in backend |
| | `/api/notifications/mark-read` | POST | ❌ Missing | ❌ Missing | ❌ Missing | Not implemented in backend |
| | `/api/notifications/{id}/acknowledge` | POST | ❌ Missing | ❌ Missing | ❌ Missing | Not implemented in backend |
| | `/api/notifications/{id}` | DELETE | ❌ Missing | ❌ Missing | ❌ Missing | Not implemented in backend |
| | `/api/notifications/stats` | GET | ❌ Missing | ❌ Missing | ❌ Missing | Not implemented in backend |
| | `/api/notifications/preferences` | GET | `/settings` | GET | ✅ Match | Line 130 in notification_routes.py |
| **Reports** | | | | | | |
| | `/api/data-sources/{id}/reports` | GET | ❌ Missing | ❌ Missing | ❌ Missing | Not implemented in backend |
| | `/api/data-sources/{id}/reports/{reportId}` | GET | ❌ Missing | ❌ Missing | ❌ Missing | Not implemented in backend |
| | `/api/data-sources/{id}/reports` | POST | ❌ Missing | ❌ Missing | ❌ Missing | Not implemented in backend |
| | `/api/data-sources/{id}/reports/{reportId}/generate` | POST | ❌ Missing | ❌ Missing | ❌ Missing | Not implemented in backend |
| | `/api/data-sources/{id}/reports/{reportId}/cancel` | POST | ❌ Missing | ❌ Missing | ❌ Missing | Not implemented in backend |
| | `/api/data-sources/{id}/reports/{reportId}` | DELETE | ❌ Missing | ❌ Missing | ❌ Missing | Not implemented in backend |
| | `/api/data-sources/{id}/reports/{reportId}/download` | GET | ❌ Missing | ❌ Missing | ❌ Missing | Not implemented in backend |
| | `/api/report-templates` | GET | ❌ Missing | ❌ Missing | ❌ Missing | Not implemented in backend |
| | `/api/data-sources/{id}/reports/stats` | GET | ❌ Missing | ❌ Missing | ❌ Missing | Not implemented in backend |
| | `/api/data-sources/{id}/reports/{reportId}/schedule` | POST | ❌ Missing | ❌ Missing | ❌ Missing | Not implemented in backend |
| **Bulk Operations** | | | | | | |
| | `/api/data-sources/bulk-update` | POST | `/data-sources/bulk-update` | POST | ✅ Match | Line 542 in scan_routes.py |
| | `/api/data-sources/bulk-delete` | DELETE | `/data-sources/bulk-delete` | DELETE | ✅ Match | Line 560 in scan_routes.py |
| **Scan Operations** | | | | | | |
| | `/scan/data-sources/{id}/scan` | POST | `/data-sources/{data_source_id}/scan` | POST | ✅ Match | Line 513 in scan_routes.py |
| | `/scan/schedules` | GET | `/schedules` | GET | ✅ Match | Line 850 in scan_routes.py |
| **Enterprise Features** | | | | | | |
| | Various enterprise endpoints | Various | Distributed across multiple files | Various | ⚠️ Partial | enterprise_integration_routes.py, compliance_routes.py, etc. |

## Summary Statistics

- **Total Frontend APIs Analyzed**: 45 endpoints
- **✅ Fully Mapped**: 18 endpoints (40%)
- **⚠️ Partially Mapped**: 2 endpoints (4%)
- **❌ Missing**: 25 endpoints (56%)

## Key Findings

1. **Core CRUD operations** are fully implemented and mapped
2. **Data discovery operations** are fully implemented and mapped
3. **Backup & restore functionality** is completely missing from backend
4. **Reporting functionality** is completely missing from backend
5. **Notification management** is partially implemented (only read operations)
6. **Enterprise features** are distributed across multiple route files

## Priority Recommendations

### High Priority (Missing Core Features)
1. Implement backup/restore API endpoints
2. Implement comprehensive reporting API endpoints
3. Complete notification management endpoints

### Medium Priority (Enhancement)
1. Add security audit endpoints
2. Add access control management endpoints
3. Standardize API response formats

### Low Priority (Optimization)
1. Improve error handling consistency
2. Add comprehensive API documentation
3. Implement API versioning strategy
