# Complete Backend API Mapping - localhost:8000

## 🎯 Executive Summary
Complete mapping of all available backend API endpoints at `localhost:8000` for proper frontend integration.

## 🔧 Backend Server Details
- **Base URL:** `http://localhost:8000`
- **Server:** FastAPI with Uvicorn
- **CORS Enabled:** Yes (allows localhost:3000, localhost:5173)

## 📊 Complete API Endpoint Mapping

### 1. **Authentication & User Management** - `/auth/*`
```
GET    /auth/me                           # Get current user profile
PUT    /auth/me                           # Update user profile  
GET    /auth/permissions                  # Get user permissions
GET    /auth/preferences                  # Get user preferences
PUT    /auth/preferences                  # Update user preferences
GET    /auth/device-preferences           # Get device preferences
GET    /auth/custom-themes               # Get custom themes
GET    /auth/custom-layouts              # Get custom layouts
POST   /auth/email                       # Email operations
GET    /auth/api-keys                    # Get API keys
POST   /auth/api-keys                    # Create API key
DELETE /auth/api-keys/{key_id}           # Delete API key
POST   /auth/api-keys/{key_id}/regenerate # Regenerate API key
PUT    /auth/api-keys/{key_id}/permissions # Update API key permissions
GET    /auth/profile                     # Get user profile (alias)
GET    /auth/notifications               # Get user notifications
GET    /auth/usage/statistics            # Get usage statistics
GET    /auth/analytics                   # Get user analytics
GET    /auth/activity/summary            # Get activity summary
```

### 2. **RBAC (Role-Based Access Control)** - `/rbac/*`
```
GET    /rbac/condition-templates         # Get condition templates
POST   /rbac/condition-templates         # Create condition template
GET    /rbac/condition-templates/helpers # Get template helpers
GET    /rbac/condition-templates/{template_id} # Get specific template
PUT    /rbac/condition-templates/{template_id} # Update template
DELETE /rbac/condition-templates/{template_id} # Delete template
POST   /rbac/validate-condition          # Validate condition
GET    /rbac/role-assignments            # Get role assignments
GET    /rbac/users/{user_id}/effective-permissions-v2 # Get effective permissions v2
GET    /rbac/users/{user_id}/effective-permissions # Get effective permissions
GET    /rbac/access-requests             # Get access requests
POST   /rbac/access-review/trigger       # Trigger access review
GET    /rbac/audit-logs/filter           # Get filtered audit logs
GET    /rbac/users                       # Get users
POST   /rbac/users/{user_id}/deactivate  # Deactivate user
POST   /rbac/users/{user_id}/activate    # Activate user
POST   /rbac/users/{user_id}/remove-role # Remove user role
POST   /rbac/users/{user_id}/reactivate  # Reactivate user
POST   /rbac/users/bulk-assign-roles     # Bulk assign roles
```

### 3. **Data Sources Management** - `/scan/data-sources/*`
```
POST   /scan/data-sources                # Create data source
GET    /scan/data-sources                # Get all data sources
GET    /scan/data-sources/{data_source_id} # Get specific data source
PUT    /scan/data-sources/{data_source_id} # Update data source
DELETE /scan/data-sources/{data_source_id} # Delete data source
POST   /scan/data-sources/{data_source_id}/validate # Validate data source
GET    /scan/data-sources/{data_source_id}/health # Get data source health
GET    /scan/data-sources/{data_source_id}/stats # Get data source stats
PUT    /scan/data-sources/{data_source_id}/metrics # Update metrics
POST   /scan/data-sources/{data_source_id}/toggle-favorite # Toggle favorite
POST   /scan/data-sources/{data_source_id}/scan # Start scan
POST   /scan/data-sources/bulk-update    # Bulk update data sources
DELETE /scan/data-sources/bulk-delete    # Bulk delete data sources
GET    /scan/data-sources/enums          # Get enums
GET    /scan/data-sources/favorites      # Get favorite data sources
POST   /scan/data-sources/{data_source_id}/toggle-monitoring # Toggle monitoring
POST   /scan/data-sources/{data_source_id}/toggle-backup # Toggle backup
```

### 4. **Scan Rule Sets** - `/scan/rule-sets/*`
```
POST   /scan/rule-sets                   # Create rule set
GET    /scan/rule-sets                   # Get all rule sets
GET    /scan/rule-sets/{rule_set_id}     # Get specific rule set
PUT    /scan/rule-sets/{rule_set_id}     # Update rule set
DELETE /scan/rule-sets/{rule_set_id}     # Delete rule set
```

### 5. **Scans Management** - `/scan/scans/*`
```
POST   /scan/scans                       # Create scan
GET    /scan/scans                       # Get all scans
GET    /scan/scans/{scan_id}             # Get specific scan
POST   /scan/scans/{scan_id}/execute     # Execute scan
GET    /scan/scans/{scan_id}/results     # Get scan results
GET    /scan/scans/{scan_id}/summary     # Get scan summary
DELETE /scan/scans/{scan_id}             # Delete scan
```

### 6. **Data Discovery** - `/data-discovery/*`
```
POST   /data-discovery/data-sources/{data_source_id}/test-connection # Test connection
POST   /data-discovery/data-sources/{data_source_id}/discover-schema # Discover schema
GET    /data-discovery/data-sources/{data_source_id}/discovery-history # Get discovery history
POST   /data-discovery/data-sources/{data_source_id}/preview-table # Preview table
POST   /data-discovery/data-sources/profile-column # Profile column
GET    /data-discovery/data-sources/{data_source_id}/workspaces # Get workspaces
POST   /data-discovery/data-sources/{data_source_id}/save-workspace # Save workspace
```

### 7. **Racine Orchestration** - `/api/racine/orchestration/*`
```
POST   /api/racine/orchestration/create  # Create orchestration
GET    /api/racine/orchestration/{orchestration_id} # Get orchestration
PUT    /api/racine/orchestration/{orchestration_id} # Update orchestration
DELETE /api/racine/orchestration/{orchestration_id} # Delete orchestration
POST   /api/racine/orchestration/{orchestration_id}/execute-workflow # Execute workflow
GET    /api/racine/orchestration/{orchestration_id}/workflows # Get workflows
GET    /api/racine/orchestration/{orchestration_id}/health # Get health
POST   /api/racine/orchestration/{orchestration_id}/optimize # Optimize
GET    /api/racine/orchestration/{orchestration_id}/metrics # Get metrics
GET    /api/racine/orchestration/masters # Get masters
GET    /api/racine/orchestration/health  # Get overall health
GET    /api/racine/orchestration/alerts  # Get alerts
GET    /api/racine/orchestration/metrics # Get overall metrics
GET    /api/racine/orchestration/recommendations # Get recommendations
GET    /api/racine/orchestration/active  # Get active orchestrations
POST   /api/racine/orchestration/bulk-operations # Bulk operations
GET    /api/racine/orchestration/service-registry # Get service registry
```

### 8. **Racine Workspace** - `/api/racine/workspace/*`
```
POST   /api/racine/workspace/create      # Create workspace
GET    /api/racine/workspace/{workspace_id} # Get workspace
PUT    /api/racine/workspace/{workspace_id} # Update workspace
DELETE /api/racine/workspace/{workspace_id} # Delete workspace
GET    /api/racine/workspace/            # List workspaces
GET    /api/racine/workspace/{workspace_id}/members # Get members
POST   /api/racine/workspace/{workspace_id}/members # Add member
PUT    /api/racine/workspace/{workspace_id}/members/{member_id} # Update member
DELETE /api/racine/workspace/{workspace_id}/members/{member_id} # Remove member
GET    /api/racine/workspace/{workspace_id}/resources # Get resources
POST   /api/racine/workspace/{workspace_id}/resources/link # Link resource
DELETE /api/racine/workspace/{workspace_id}/resources/{resource_link_id} # Unlink resource
GET    /api/racine/workspace/{workspace_id}/resources/discover # Discover resources
GET    /api/racine/workspace/templates/  # Get templates
POST   /api/racine/workspace/templates/  # Create template
POST   /api/racine/workspace/{workspace_id}/clone # Clone workspace
GET    /api/racine/workspace/{workspace_id}/analytics # Get analytics
GET    /api/racine/workspace/{workspace_id}/activity-stream # Get activity
POST   /api/racine/workspace/{workspace_id}/invite # Invite user
GET    /api/racine/workspace/{workspace_id}/export # Export workspace
GET    /api/racine/workspace/health      # Get workspace health
```

### 9. **System Health & Monitoring**
```
GET    /health                           # Main health check
GET    /api/v1/platform/status           # Platform status
GET    /metrics                          # Prometheus metrics
GET    /admin/db/health                  # Database health
POST   /admin/db/cleanup                 # Database cleanup
```

### 10. **Notifications** - `/notifications/*`
```
GET    /notifications                    # Get notifications
POST   /notifications                    # Create notification
PUT    /notifications/{notification_id} # Update notification
DELETE /notifications/{notification_id} # Delete notification
```

### 11. **Collaboration** - `/collaboration/*`
```
GET    /collaboration/workspaces         # Get workspaces
GET    /collaboration/workspaces/current # Get current workspace
GET    /collaboration/sessions/active    # Get active sessions
```

### 12. **Enterprise APIs** - Various prefixes
```
GET    /scan/catalog                     # Get catalog
GET    /scan/integrations                # Get integrations
GET    /scan/notifications               # Get scan notifications
GET    /scan/tasks                       # Get scan tasks
```

## 🚨 Critical Frontend Mapping Issues

### **WRONG Frontend Calls (Currently Breaking)**
```
❌ /proxy/auth/profile              → Should be: /auth/me
❌ /proxy/rbac/user/permissions     → Should be: /rbac/users/{user_id}/effective-permissions
❌ /proxy/api/racine/integration/health → Should be: /api/racine/orchestration/health
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

## 🔧 WebSocket Endpoints (Currently Disabled)
```
ws://localhost:8000/ws/validation     # Validation WebSocket
ws://localhost:8000/ws/workspace      # Workspace WebSocket
ws://localhost:8000/ws                # General WebSocket
ws://localhost:8000/v3/ai/realtime   # AI Realtime WebSocket
ws://localhost:8000/orchestration    # Orchestration WebSocket
```
**Note:** WebSocket routes need to be implemented in backend before enabling in frontend.

## 📝 Next Steps
1. Fix frontend API base URLs from `/api/proxy` to `/proxy`
2. Update incorrect endpoint mappings
3. Remove non-existent API calls
4. Implement proper error handling for missing endpoints
5. Add circuit breakers to prevent loops
6. Test all API mappings with backend

This mapping ensures frontend correctly communicates with backend at localhost:8000.