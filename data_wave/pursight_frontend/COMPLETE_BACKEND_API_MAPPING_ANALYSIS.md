# Complete Backend API Mapping Analysis - ACTUAL BACKEND ROUTES

## 🎯 Executive Summary
After deep analysis of the actual backend code in `scripts_automation/app/api/routes/`, I found that the backend APIs DO exist and are properly registered. The frontend was calling wrong endpoints due to incorrect mapping.

## 🔧 Backend Server Details
- **Base URL:** `http://localhost:8000`
- **Server:** FastAPI with Uvicorn
- **CORS Enabled:** Yes (allows localhost:3000, localhost:5173)

## 📊 ACTUAL Backend API Endpoint Mapping

### 1. **Authentication & User Management** - `/auth/*` ✅ EXISTS
```python
# From auth_routes.py
router = APIRouter(prefix="/auth", tags=["Authentication"])

GET    /auth/me                           # ✅ get_current_user_info()
GET    /auth/permissions                  # ✅ get_user_permissions()
GET    /auth/preferences                  # ✅ get_user_preferences()
PUT    /auth/preferences                  # ✅ update_user_preferences()
GET    /auth/device-preferences           # ✅ get_device_preferences()
GET    /auth/custom-themes               # ✅ get_custom_themes()
GET    /auth/custom-layouts              # ✅ get_custom_layouts()
POST   /auth/email                       # ✅ email operations
GET    /auth/api-keys                    # ✅ get_api_keys()
POST   /auth/api-keys                    # ✅ create_api_key()
DELETE /auth/api-keys/{key_id}           # ✅ delete_api_key()
POST   /auth/api-keys/{key_id}/regenerate # ✅ regenerate_api_key()
PUT    /auth/api-keys/{key_id}/permissions # ✅ update_api_key_permissions()
GET    /auth/profile                     # ✅ get_user_profile() - alias for /me
GET    /auth/notifications               # ✅ get_user_notifications()
GET    /auth/usage/statistics            # ✅ get_usage_statistics()
GET    /auth/analytics                   # ✅ get_user_analytics()
GET    /auth/activity/summary            # ✅ get_activity_summary()
```

### 2. **RBAC (Role-Based Access Control)** - `/rbac/*` ✅ EXISTS
```python
# From rbac/rbac_routes.py
app.include_router(rbac_router, prefix="/rbac", tags=["rbac"])

GET    /rbac/condition-templates         # ✅ get_condition_templates()
POST   /rbac/condition-templates         # ✅ create_condition_template()
GET    /rbac/condition-templates/helpers # ✅ get_template_helpers()
GET    /rbac/condition-templates/{template_id} # ✅ get_condition_template()
PUT    /rbac/condition-templates/{template_id} # ✅ update_condition_template()
DELETE /rbac/condition-templates/{template_id} # ✅ delete_condition_template()
POST   /rbac/validate-condition          # ✅ validate_condition()
GET    /rbac/role-assignments            # ✅ get_role_assignments()
GET    /rbac/users/{user_id}/effective-permissions-v2 # ✅ get_effective_permissions_v2()
GET    /rbac/users/{user_id}/effective-permissions # ✅ get_effective_permissions()
GET    /rbac/access-requests             # ✅ get_access_requests()
POST   /rbac/access-review/trigger       # ✅ trigger_access_review()
GET    /rbac/audit-logs/filter           # ✅ get_filtered_audit_logs()
GET    /rbac/users                       # ✅ get_users()
POST   /rbac/users/{user_id}/deactivate  # ✅ deactivate_user()
POST   /rbac/users/{user_id}/activate    # ✅ activate_user()
POST   /rbac/users/{user_id}/remove-role # ✅ remove_user_role()
POST   /rbac/users/{user_id}/reactivate  # ✅ reactivate_user()
POST   /rbac/users/bulk-assign-roles     # ✅ bulk_assign_roles()
```

### 3. **Racine Orchestration** - `/racine/orchestration/*` ✅ EXISTS
```python
# From racine_orchestration_api.py
app.include_router(racine_orchestration_api_router, prefix="/racine/orchestration", tags=["Racine Orchestration API"])

POST   /racine/orchestration/create      # ✅ create_orchestration()
GET    /racine/orchestration/{orchestration_id} # ✅ get_orchestration()
PUT    /racine/orchestration/{orchestration_id} # ✅ update_orchestration()
DELETE /racine/orchestration/{orchestration_id} # ✅ delete_orchestration()
POST   /racine/orchestration/{orchestration_id}/execute-workflow # ✅ execute_workflow()
GET    /racine/orchestration/{orchestration_id}/workflows # ✅ get_workflows()
GET    /racine/orchestration/{orchestration_id}/health # ✅ get_health()
POST   /racine/orchestration/{orchestration_id}/optimize # ✅ optimize()
GET    /racine/orchestration/{orchestration_id}/metrics # ✅ get_metrics()
GET    /racine/orchestration/active      # ✅ get_active_orchestrations()
POST   /racine/orchestration/bulk-operations # ✅ bulk_operations()
GET    /racine/orchestration/service-registry # ✅ get_service_registry()
POST   /racine/orchestration/emergency-shutdown # ✅ emergency_shutdown()
```

### 4. **Racine Workspace** - `/api/racine/workspace/*` ✅ EXISTS
```python
# From racine_routes/racine_workspace_routes.py
router = APIRouter(prefix="/api/racine/workspace", tags=["racine-workspace"])

POST   /api/racine/workspace/create      # ✅ create_workspace()
GET    /api/racine/workspace/{workspace_id} # ✅ get_workspace()
PUT    /api/racine/workspace/{workspace_id} # ✅ update_workspace()
DELETE /api/racine/workspace/{workspace_id} # ✅ delete_workspace()
GET    /api/racine/workspace/            # ✅ list_workspaces()
GET    /api/racine/workspace/{workspace_id}/members # ✅ get_workspace_members()
POST   /api/racine/workspace/{workspace_id}/members # ✅ add_workspace_member()
PUT    /api/racine/workspace/{workspace_id}/members/{member_id} # ✅ update_workspace_member()
DELETE /api/racine/workspace/{workspace_id}/members/{member_id} # ✅ remove_workspace_member()
GET    /api/racine/workspace/{workspace_id}/resources # ✅ get_workspace_resources()
POST   /api/racine/workspace/{workspace_id}/resources/link # ✅ link_workspace_resource()
DELETE /api/racine/workspace/{workspace_id}/resources/{resource_link_id} # ✅ unlink_workspace_resource()
GET    /api/racine/workspace/{workspace_id}/resources/discover # ✅ discover_workspace_resources()
GET    /api/racine/workspace/templates/  # ✅ get_workspace_templates()
POST   /api/racine/workspace/templates/  # ✅ create_workspace_template()
POST   /api/racine/workspace/{workspace_id}/clone # ✅ clone_workspace()
GET    /api/racine/workspace/{workspace_id}/analytics # ✅ get_workspace_analytics()
GET    /api/racine/workspace/{workspace_id}/activity-stream # ✅ get_workspace_activity()
POST   /api/racine/workspace/{workspace_id}/invite # ✅ invite_to_workspace()
GET    /api/racine/workspace/{workspace_id}/export # ✅ export_workspace()
GET    /api/racine/workspace/health      # ✅ get_workspace_health()
```

### 5. **Notifications** - `/notifications/*` ✅ EXISTS
```python
# From notification_routes.py
router = APIRouter(prefix="/notifications", tags=["notifications"])

GET    /notifications                    # ✅ get_notifications()
POST   /notifications                    # ✅ create_notification()
PUT    /notifications/{notification_id} # ✅ update_notification()
DELETE /notifications/{notification_id} # ✅ delete_notification()
```

### 6. **WebSocket Routes** - ✅ EXISTS
```python
# From websocket_routes.py
app.include_router(websocket_router, tags=["WebSocket"])

ws://localhost:8000/ws/validation     # ✅ validation_websocket_router
ws://localhost:8000/ws/workspace      # ✅ workspace WebSocket
ws://localhost:8000/ws                # ✅ general WebSocket
ws://localhost:8000/v3/ai/realtime   # ✅ AI Realtime WebSocket
ws://localhost:8000/orchestration    # ✅ orchestration WebSocket
```

### 7. **Data Sources Management** - `/scan/*` ✅ EXISTS
```python
# From scan_routes.py and related files
GET    /scan/data-sources               # ✅ get_data_sources()
POST   /scan/data-sources               # ✅ create_data_source()
GET    /scan/data-sources/{data_source_id} # ✅ get_data_source()
PUT    /scan/data-sources/{data_source_id} # ✅ update_data_source()
DELETE /scan/data-sources/{data_source_id} # ✅ delete_data_source()
POST   /scan/data-sources/{data_source_id}/validate # ✅ validate_data_source()
GET    /scan/data-sources/{data_source_id}/health # ✅ get_data_source_health()
GET    /scan/data-sources/{data_source_id}/stats # ✅ get_data_source_stats()
```

## 🚨 CRITICAL FRONTEND MAPPING FIXES NEEDED

### **WRONG Frontend Calls (Currently Breaking)**
```javascript
❌ /proxy/auth/profile              → Should be: /auth/me
❌ /proxy/rbac/user/permissions     → Should be: /rbac/users/{user_id}/effective-permissions
❌ /proxy/api/racine/integration/health → Should be: /racine/orchestration/health
❌ /proxy/api/racine/workspace/list → Should be: /api/racine/workspace/
❌ /proxy/auth/custom-themes        → Should be: /auth/custom-themes
❌ /proxy/auth/custom-layouts       → Should be: /auth/custom-layouts
❌ /proxy/auth/device-preferences   → Should be: /auth/device-preferences
❌ /proxy/api/v1/notifications      → Should be: /notifications
❌ /proxy/api/v1/notifications/settings → Should be: /notifications (no settings endpoint)
```

### **Correct Proxy Configuration**
Frontend should use Next.js proxy with these mappings:
```javascript
// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/proxy/:path*',
        destination: 'http://localhost:8000/:path*',
      },
    ];
  },
};
```

### **Correct Frontend API Base URL**
```javascript
const API_BASE_URL = '/proxy'; // NOT '/api/proxy'
```

## 🔧 WebSocket Endpoints (ACTUALLY IMPLEMENTED)
```javascript
ws://localhost:8000/ws/validation     # ✅ validation_websocket_router
ws://localhost:8000/ws/workspace      # ✅ workspace WebSocket
ws://localhost:8000/ws                # ✅ general WebSocket
ws://localhost:8000/v3/ai/realtime   # ✅ AI Realtime WebSocket
ws://localhost:8000/orchestration    # ✅ orchestration WebSocket
```
**Note:** WebSocket routes ARE implemented in backend and should be enabled in frontend.

## 📝 Next Steps
1. Fix frontend API base URLs from `/api/proxy` to `/proxy`
2. Update incorrect endpoint mappings to match actual backend routes
3. Enable WebSocket connections (they ARE implemented)
4. Test all API mappings with backend
5. Remove circuit breakers and retry limits (APIs exist)

This mapping ensures frontend correctly communicates with backend at localhost:8000 using the ACTUAL implemented routes.

