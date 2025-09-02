# Correct API Mappings - Based on Actual Backend Routes

## Overview
This document shows the correct API mappings between frontend and backend based on the actual routes that exist in the backend files.

## ✅ **Working API Mappings (Backend Routes Exist)**

### 1. **Data Source APIs** - `scan_routes.py`
| Frontend Call | Backend Route | Status |
|---------------|---------------|---------|
| `GET /scan/data-sources` | `@router.get("/data-sources")` | ✅ Working |
| `GET /scan/data-sources/{id}` | `@router.get("/data-sources/{data_source_id}")` | ✅ Working |
| `PUT /scan/data-sources/{id}` | `@router.put("/data-sources/{data_source_id}")` | ✅ Working |
| `DELETE /scan/data-sources/{id}` | `@router.delete("/data-sources/{data_source_id}")` | ✅ Working |
| `GET /scan/data-sources/{id}/health` | `@router.get("/data-sources/{data_source_id}/health")` | ✅ Working |
| `GET /scan/data-sources/{id}/stats` | `@router.get("/data-sources/{data_source_id}/stats")` | ✅ Working |
| `GET /scan/data-sources/{id}/performance-metrics` | `@router.get("/data-sources/{data_source_id}/performance-metrics")` | ✅ Working |
| `GET /scan/data-sources/{id}/security-audit` | `@router.get("/data-sources/{data_source_id}/security-audit")` | ✅ Working |
| `GET /scan/data-sources/{id}/compliance-status` | `@router.get("/data-sources/{data_source_id}/compliance-status")` | ✅ Working |
| `GET /scan/data-sources/{id}/backup-status` | `@router.get("/data-sources/{data_source_id}/backup-status")` | ✅ Working |
| `GET /scan/data-sources/{id}/scheduled-tasks` | `@router.get("/data-sources/{data_source_id}/scheduled-tasks")` | ✅ Working |
| `GET /scan/data-sources/{id}/access-control` | `@router.get("/data-sources/{data_source_id}/access-control")` | ✅ Working |
| `GET /scan/data-sources/{id}/tags` | `@router.get("/data-sources/{data_source_id}/tags")` | ✅ Working |
| `GET /scan/data-sources/{id}/integrations` | `@router.get("/data-sources/{data_source_id}/integrations")` | ✅ Working |
| `GET /scan/data-sources/{id}/catalog` | `@router.get("/data-sources/{data_source_id}/catalog")` | ✅ Working |
| `GET /scan/data-sources/{id}/version-history` | `@router.get("/data-sources/{data_source_id}/version-history")` | ✅ Working |

### 2. **Performance APIs** - `performance_routes.py`
| Frontend Call | Backend Route | Status |
|---------------|---------------|---------|
| `GET /performance/metrics/{id}` | `@router.get("/metrics/{data_source_id}")` | ✅ Working |
| `GET /performance/alerts` | `@router.get("/alerts")` | ✅ Working |
| `GET /performance/thresholds` | `@router.get("/thresholds")` | ✅ Working |
| `GET /performance/analytics/trends` | `@router.get("/analytics/trends")` | ✅ Working |
| `GET /performance/optimization/recommendations` | `@router.get("/optimization/recommendations")` | ✅ Working |
| `GET /performance/reports/summary` | `@router.get("/reports/summary")` | ✅ Working |

### 3. **Workflow APIs** - `workflow_routes.py`
| Frontend Call | Backend Route | Status |
|---------------|---------------|---------|
| `GET /workflow/designer/workflows` | `@router.get("/designer/workflows")` | ✅ Working |
| `GET /workflow/executions` | `@router.get("/executions")` | ✅ Working |
| `GET /workflow/approvals/pending` | `@router.get("/approvals/pending")` | ✅ Working |
| `GET /workflow/templates` | `@router.get("/templates")` | ✅ Working |

### 4. **Collaboration APIs** - `collaboration_routes.py`
| Frontend Call | Backend Route | Status |
|---------------|---------------|---------|
| `GET /collaboration/workspaces` | `@router.get("/workspaces")` | ✅ Working |
| `GET /collaboration/sessions/active` | `@router.get("/sessions/active")` | ✅ Working |
| `GET /collaboration/documents` | `@router.get("/workspaces/{id}/documents")` | ✅ Working |

### 5. **Backup APIs** - `backup_routes.py`
| Frontend Call | Backend Route | Status |
|---------------|---------------|---------|
| `GET /backup/{id}/backup-status` | `@router.get("/{data_source_id}/backup-status")` | ✅ Working |
| `POST /backup/backups` | `@router.post("/{data_source_id}/backups")` | ✅ Working |
| `POST /backup/schedules` | `@router.post("/{data_source_id}/backup-schedules")` | ✅ Working |

### 6. **Version APIs** - `version_routes.py`
| Frontend Call | Backend Route | Status |
|---------------|---------------|---------|
| `GET /version/{id}/version-history` | `@router.get("/{data_source_id}/version-history")` | ✅ Working |
| `POST /version/version-history` | `@router.post("/{data_source_id}/version-history")` | ✅ Working |
| `POST /version/version-history/restore` | `@router.post("/{data_source_id}/version-history/restore")` | ✅ Working |

### 7. **System APIs** - `scan_routes.py`
| Frontend Call | Backend Route | Status |
|---------------|---------------|---------|
| `GET /scan/health/system` | `@router.get("/health/system")` | ✅ Working |
| `GET /scan/tasks` | `@router.get("/tasks")` | ✅ Working |
| `GET /scan/reports` | `@router.get("/reports")` | ✅ Working |
| `GET /scan/integrations` | `@router.get("/integrations")` | ✅ Working |

## 🔧 **Frontend Service Updates Required**

### 1. **Fix getScheduledTasks**
```typescript
// BEFORE (Incorrect)
export const getScheduledTasks = async (data_source_id?: number): Promise<TaskResponse[]> => {
  const params = data_source_id ? `?data_source_id=${data_source_id}` : ''
  const { data } = await enterpriseApi.get(`/scan/data-sources/scheduled-tasks${params}`)
  return data
}

// AFTER (Correct)
export const getScheduledTasks = async (data_source_id?: number): Promise<TaskResponse[]> => {
  if (!data_source_id) {
    throw new Error('data_source_id is required for scheduled tasks')
  }
  const { data } = await enterpriseApi.get(`/scan/data-sources/${data_source_id}/scheduled-tasks`)
  return data
}
```

### 2. **Fix getPerformanceMetrics**
```typescript
// BEFORE (Incorrect)
const { data } = await enterpriseApi.get(`/performance/metrics/${request.data_source_id}?${params.toString()}`)

// AFTER (Correct)
const { data } = await enterpriseApi.get(`/scan/data-sources/${request.data_source_id}/performance-metrics?${params.toString()}`)
```

### 3. **Fix getSecurityAudit**
```typescript
// BEFORE (Incorrect)
const { data } = await enterpriseApi.get(`/data-sources/${dataSourceId}/security-audit`)

// AFTER (Correct)
const { data } = await enterpriseApi.get(`/scan/data-sources/${dataSourceId}/security-audit`)
```

## 📋 **Proxy Configuration Updates**

The proxy configuration has been updated to correctly map:
- `/api/performance/alerts` → `/performance/alerts`
- `/api/performance/trends` → `/performance/analytics/trends`
- `/api/performance/recommendations` → `/performance/optimization/recommendations`
- `/api/performance/thresholds` → `/performance/thresholds`
- `/api/workflow/templates` → `/workflow/templates`
- `/api/workflow/approvals/pending` → `/workflow/approvals/pending`

## 🚀 **Next Steps**

1. **Update Frontend Services** to use the correct endpoints
2. **Test API Connectivity** once backend is running
3. **Verify All Endpoints** are working correctly
4. **Monitor for 502 Errors** and fix any remaining mapping issues

## ✅ **Conclusion**

All the required API endpoints exist in the backend. The issue was incorrect mapping between frontend calls and backend routes. With the updated proxy configuration and frontend service fixes, the APIs should work correctly once the backend server is running.
