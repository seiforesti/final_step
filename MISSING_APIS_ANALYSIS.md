# Missing APIs Analysis and Implementation Guide

## Overview
This document analyzes the APIs that are failing with "Network Error" and "Enterprise API Error: {}" and provides the correct implementation paths.

## Error Analysis

### 1. Network Errors
**Root Cause**: The backend server is not running or not accessible
**Symptoms**: 
- `Network Error` in console
- `Enterprise API Error: {}` with empty error details
- Multiple API calls failing simultaneously

**Affected APIs**:
- `getDataSources` - `/scan/data-sources`
- `getSecurityAudit` - `/scan/data-sources/{id}/security-audit`
- `getPerformanceMetrics` - `/scan/data-sources/{id}/performance-metrics`
- `getWorkflowExecutions` - `/workflow/executions`
- `getSystemHealth` - `/scan/health/system`

### 2. Missing Backend Routes
**Root Cause**: Frontend is calling APIs that don't exist in the backend
**Symptoms**: 404 errors, API not found

## API Mapping Corrections

### ✅ **Correctly Mapped APIs (Working)**

| Frontend API | Backend Route | Status |
|--------------|---------------|---------|
| `getDataSources` | `/scan/data-sources` | ✅ Working |
| `getSecurityAudit` | `/scan/data-sources/{id}/security-audit` | ✅ Working |
| `getPerformanceMetrics` | `/scan/data-sources/{id}/performance-metrics` | ✅ Working |
| `getBackupStatus` | `/scan/data-sources/{id}/backup-status` | ✅ Working |
| `getScheduledTasks` | `/scan/data-sources/{id}/scheduled-tasks` | ✅ Working |

### ❌ **Missing Backend Routes (Need Implementation)**

| Frontend API | Expected Backend Route | Current Status | Required Action |
|--------------|----------------------|----------------|-----------------|
| `getPerformanceAlerts` | `/performance/alerts` | ❌ Missing | Create in `performance_routes.py` |
| `getPerformanceTrends` | `/performance/analytics/trends` | ❌ Missing | Create in `performance_routes.py` |
| `getOptimizationRecommendations` | `/performance/optimization/recommendations` | ❌ Missing | Create in `performance_routes.py` |
| `getPerformanceThresholds` | `/performance/thresholds` | ❌ Missing | Create in `performance_routes.py` |
| `getWorkflowTemplates` | `/workflow/templates` | ❌ Missing | Create in `workflow_routes.py` |
| `getPendingApprovals` | `/workflow/approvals/pending` | ❌ Missing | Create in `workflow_routes.py` |
| `getCollaborationWorkspaces` | `/collaboration/workspaces` | ❌ Missing | Create in `collaboration_routes.py` |
| `getActiveCollaborationSessions` | `/collaboration/sessions/active` | ❌ Missing | Create in `collaboration_routes.py` |

### 🔧 **Backend Implementation Required**

#### 1. Performance Routes (`performance_routes.py`)
```python
@router.get("/alerts")
async def get_performance_alerts(
    severity: Optional[str] = None,
    status: Optional[str] = None,
    days: Optional[int] = None
):
    # Implementation for performance alerts
    
@router.get("/analytics/trends")
async def get_performance_trends(
    data_source_id: Optional[int] = None,
    time_range: str = "30d"
):
    # Implementation for performance trends
    
@router.get("/optimization/recommendations")
async def get_optimization_recommendations(
    data_source_id: Optional[int] = None
):
    # Implementation for optimization recommendations
    
@router.get("/thresholds")
async def get_performance_thresholds(
    data_source_id: Optional[int] = None
):
    # Implementation for performance thresholds
```

#### 2. Workflow Routes (`workflow_routes.py`)
```python
@router.get("/templates")
async def get_workflow_templates(
    category: Optional[str] = None
):
    # Implementation for workflow templates
    
@router.get("/approvals/pending")
async def get_pending_approvals(
    approver_id: Optional[str] = None
):
    # Implementation for pending approvals
```

#### 3. Collaboration Routes (`collaboration_routes.py`)
```python
@router.get("/workspaces")
async def get_collaboration_workspaces():
    # Implementation for collaboration workspaces
    
@router.get("/sessions/active")
async def get_active_collaboration_sessions():
    # Implementation for active collaboration sessions
```

## Immediate Actions Required

### 1. **Backend Server Status**
- [ ] Verify backend server is running on `http://localhost:8000`
- [ ] Check if backend is accessible from frontend
- [ ] Verify environment variables are set correctly

### 2. **Missing Route Implementation**
- [ ] Implement performance alerts endpoint
- [ ] Implement performance trends endpoint
- [ ] Implement optimization recommendations endpoint
- [ ] Implement performance thresholds endpoint
- [ ] Implement workflow templates endpoint
- [ ] Implement pending approvals endpoint
- [ ] Implement collaboration workspaces endpoint
- [ ] Implement active collaboration sessions endpoint

### 3. **Frontend Service Updates**
- [ ] Update `getPerformanceAlerts` to use correct endpoint
- [ ] Update `getPerformanceTrends` to use correct endpoint
- [ ] Update `getOptimizationRecommendations` to use correct endpoint
- [ ] Update `getPerformanceThresholds` to use correct endpoint
- [ ] Update `getWorkflowTemplates` to use correct endpoint
- [ ] Update `getPendingApprovals` to use correct endpoint
- [ ] Update `getCollaborationWorkspaces` to use correct endpoint
- [ ] Update `getActiveCollaborationSessions` to use correct endpoint

## Testing Strategy

### 1. **Backend Connectivity Test**
```bash
# Test if backend is accessible
curl http://localhost:8000/health/system
curl http://localhost:8000/scan/data-sources
```

### 2. **API Endpoint Test**
```bash
# Test each implemented endpoint
curl http://localhost:8000/performance/alerts
curl http://localhost:8000/workflow/templates
curl http://localhost:8000/collaboration/workspaces
```

### 3. **Frontend Integration Test**
- [ ] Test data source loading
- [ ] Test performance metrics
- [ ] Test security audit
- [ ] Test workflow operations
- [ ] Test collaboration features

## Priority Order

### **High Priority (Critical for Basic Functionality)**
1. Backend server connectivity
2. Data source CRUD operations
3. Security audit endpoints
4. Performance metrics endpoints

### **Medium Priority (Important for User Experience)**
1. Performance alerts
2. Performance trends
3. Workflow templates
4. Pending approvals

### **Low Priority (Nice to Have)**
1. Collaboration workspaces
2. Active collaboration sessions
3. Optimization recommendations
4. Performance thresholds

## Conclusion

The main issue is that the backend server is not running or accessible, causing network errors. Additionally, several API endpoints that the frontend expects don't exist in the backend and need to be implemented.

**Immediate Action**: Start the backend server and verify connectivity
**Next Action**: Implement missing API endpoints in the correct route files
**Final Action**: Test all endpoints and update frontend services if needed

This will resolve the "Network Error" and "Enterprise API Error: {}" issues currently affecting the data sources application.
