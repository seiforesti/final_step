# API Mapping Analysis: Frontend Data Sources vs Backend Routes

## Overview
This document provides a comprehensive analysis of all APIs used by the v15_enhanced_1 data-sources components and their corresponding backend routes in the scripts_automation backend.

## Frontend API Categories

### 1. Core Data Source APIs
**Frontend Hooks:**
- `useDataSourcesQuery` - Get all data sources
- `useDataSourceQuery` - Get specific data source
- `useDataSourceHealthQuery` - Get data source health metrics
- `useDataSourceStatsQuery` - Get data source statistics
- `useConnectionPoolStatsQuery` - Get connection pool statistics
- `useDiscoveryHistoryQuery` - Get discovery history
- `useScanResultsQuery` - Get scan results
- `useQualityMetricsQuery` - Get quality metrics
- `useGrowthMetricsQuery` - Get growth metrics
- `useSchemaDiscoveryQuery` - Get schema discovery results
- `useDataLineageQuery` - Get data lineage information
- `useDataCatalogQuery` - Get data catalog information

**Backend Routes:**
- `/scan/data-sources` - Data source CRUD operations
- `/scan/data-sources/{id}/health` - Health metrics
- `/scan/data-sources/{id}/stats` - Statistics
- `/data-discovery/data-sources/{id}/discover-schema` - Schema discovery
- `/scan/scan-results` - Scan results
- `/enterprise-catalog/assets` - Data catalog

### 2. Data Source Management APIs
**Frontend Hooks:**
- `useUpdateDataSourceMutation` - Update data source
- `useTestConnectionMutation` - Test data source connection
- `useCreateDataSourceMutation` - Create new data source
- `useDeleteDataSourceMutation` - Delete data source

**Backend Routes:**
- `/scan/data-sources` - POST (create), PUT (update), DELETE
- `/scan/data-sources/{id}/test-connection` - Test connection

### 3. Access Control & Security APIs
**Frontend Hooks:**
- `useDataSourceAccessControlQuery` - Get access control settings
- `useCreateAccessControlMutation` - Create access control rules
- `useUpdateAccessControlMutation` - Update access control rules
- `useDeleteAccessControlMutation` - Delete access control rules
- `useUserPermissionsQuery` - Get user permissions
- `useAuditLogsQuery` - Get audit logs

**Backend Routes:**
- `/rbac/permissions` - Permission management
- `/rbac/access-control` - Access control rules
- `/audit/logs` - Audit logging

### 4. Performance & Monitoring APIs
**Frontend Hooks:**
- `useSystemHealthQuery` - Get system health
- `useEnhancedPerformanceMetricsQuery` - Get performance metrics
- `usePerformanceAlertsQuery` - Get performance alerts
- `usePerformanceTrendsQuery` - Get performance trends
- `useOptimizationRecommendationsQuery` - Get optimization recommendations
- `usePerformanceSummaryReportQuery` - Get performance summary
- `useStartRealTimeMonitoringMutation` - Start real-time monitoring
- `useStopRealTimeMonitoringMutation` - Stop real-time monitoring

**Backend Routes:**
- `/monitoring/system-health` - System health metrics
- `/monitoring/performance` - Performance metrics
- `/monitoring/alerts` - Performance alerts
- `/monitoring/trends` - Performance trends
- `/monitoring/recommendations` - Optimization recommendations

### 5. Security & Compliance APIs
**Frontend Hooks:**
- `useEnhancedSecurityAuditQuery` - Get security audit information
- `useVulnerabilityAssessmentsQuery` - Get vulnerability assessments
- `useSecurityIncidentsQuery` - Get security incidents
- `useComplianceChecksQuery` - Get compliance checks
- `useThreatDetectionQuery` - Get threat detection results
- `useSecurityAnalyticsDashboardQuery` - Get security analytics
- `useRiskAssessmentReportQuery` - Get risk assessment reports
- `useCreateEnhancedSecurityScanMutation` - Create security scan
- `useRemediateVulnerabilityMutation` - Remediate vulnerabilities

**Backend Routes:**
- `/security/audit` - Security audit
- `/security/vulnerabilities` - Vulnerability management
- `/security/incidents` - Security incidents
- `/compliance/checks` - Compliance checks
- `/security/threats` - Threat detection
- `/security/analytics` - Security analytics
- `/security/risk-assessment` - Risk assessment

### 6. Collaboration & Workspace APIs
**Frontend Hooks:**
- `useCollaborationWorkspacesQuery` - Get collaboration workspaces
- `useActiveCollaborationSessionsQuery` - Get active collaboration sessions
- `useSharedDocumentsQuery` - Get shared documents
- `useCreateSharedDocumentMutation` - Create shared document
- `useDocumentCommentsQuery` - Get document comments
- `useAddDocumentCommentMutation` - Add document comment
- `useInviteToWorkspaceMutation` - Invite to workspace
- `useWorkspaceActivityQuery` - Get workspace activity

**Backend Routes:**
- `/collaboration/workspaces` - Workspace management
- `/collaboration/sessions` - Collaboration sessions
- `/collaboration/documents` - Document management
- `/collaboration/comments` - Comment management

### 7. Workflow & Approval APIs
**Frontend Hooks:**
- `useWorkflowDefinitionsQuery` - Get workflow definitions
- `useWorkflowExecutionsQuery` - Get workflow executions
- `usePendingApprovalsQuery` - Get pending approvals
- `useWorkflowTemplatesQuery` - Get workflow templates
- `useCreateWorkflowDefinitionMutation` - Create workflow definition
- `useExecuteWorkflowMutation` - Execute workflow
- `useCreateApprovalWorkflowMutation` - Create approval workflow
- `useApproveRequestMutation` - Approve request
- `useRejectRequestMutation` - Reject request

**Backend Routes:**
- `/workflows/definitions` - Workflow definitions
- `/workflows/executions` - Workflow executions
- `/workflows/approvals` - Approval workflows
- `/workflows/templates` - Workflow templates

### 8. AI & ML APIs
**Frontend Hooks:**
- `useDiscoverAndCatalogSchemaMutation` - AI-powered schema discovery
- `useSyncCatalogWithDataSourceMutation` - Sync catalog with data source
- `useDiscoverSchemaWithOptionsMutation` - Discover schema with options

**Backend Routes:**
- `/ai/classification` - AI classification
- `/ai/explainability` - AI explainability
- `/ml/models` - ML model management
- `/ml/predictions` - ML predictions
- `/ml/training` - ML training

### 9. Backup & Version Management APIs
**Frontend Hooks:**
- `useBackupStatusQuery` - Get backup status
- `useCreateBackupMutation` - Create backup
- `useDataSourceVersionHistoryQuery` - Get version history
- `useCreateVersionMutation` - Create version
- `useRestoreVersionMutation` - Restore version

**Backend Routes:**
- `/backup/status` - Backup status
- `/backup/create` - Create backup
- `/version/history` - Version history
- `/version/restore` - Restore version

### 10. Integration & Notification APIs
**Frontend Hooks:**
- `useIntegrationsQuery` - Get integrations
- `useCreateIntegrationMutation` - Create integration
- `useNotificationsQuery` - Get notifications
- `useMarkNotificationReadMutation` - Mark notification as read

**Backend Routes:**
- `/integrations` - Integration management
- `/notifications` - Notification management

## API Request Type Mapping

### GET Requests (Query APIs)
- **Frontend:** `use*Query` hooks
- **Backend:** `@router.get()` endpoints
- **Examples:**
  - `useDataSourcesQuery` → `/scan/data-sources`
  - `useDataSourceHealthQuery` → `/scan/data-sources/{id}/health`
  - `useSystemHealthQuery` → `/monitoring/system-health`

### POST Requests (Create/Mutation APIs)
- **Frontend:** `use*Mutation` hooks
- **Backend:** `@router.post()` endpoints
- **Examples:**
  - `useCreateDataSourceMutation` → `/scan/data-sources`
  - `useCreateWorkflowDefinitionMutation` → `/workflows/definitions`
  - `useCreateSecurityScanMutation` → `/security/scans`

### PUT Requests (Update APIs)
- **Frontend:** `use*Mutation` hooks
- **Backend:** `@router.put()` endpoints
- **Examples:**
  - `useUpdateDataSourceMutation` → `/scan/data-sources/{id}`
  - `useUpdateWorkflowDefinitionMutation` → `/workflows/definitions/{id}`

### DELETE Requests (Delete APIs)
- **Frontend:** `use*Mutation` hooks
- **Backend:** `@router.delete()` endpoints
- **Examples:**
  - `useDeleteDataSourceMutation` → `/scan/data-sources/{id}`
  - `useDeleteAccessControlMutation` → `/rbac/access-control/{id}`

## Backend Route Prefixes

### Core Routes
- `/scan` - Data source scanning and management
- `/data-discovery` - Schema discovery and exploration
- `/enterprise-catalog` - Enterprise catalog management
- `/monitoring` - System monitoring and performance
- `/security` - Security and compliance
- `/compliance` - Compliance workflows and checks

### Advanced Routes
- `/ai` - AI-powered classification and analysis
- `/ml` - Machine learning model management
- `/workflows` - Workflow orchestration
- `/collaboration` - Team collaboration features
- `/rbac` - Role-based access control
- `/audit` - Audit logging and compliance

### Integration Routes
- `/integrations` - Third-party integrations
- `/notifications` - Notification management
- `/backup` - Backup and restore operations
- `/version` - Version control and history

## API Coverage Analysis

### ✅ Fully Covered APIs
- Data source CRUD operations
- Health monitoring and metrics
- Security scanning and compliance
- Performance monitoring
- Workflow management
- Collaboration features

### ⚠️ Partially Covered APIs
- AI/ML classification (basic coverage, advanced features may need expansion)
- Real-time monitoring (WebSocket support needed)
- Advanced analytics (may need additional endpoints)

### ❌ Missing Backend Routes
- Some specialized monitoring endpoints
- Advanced AI explainability features
- Real-time collaboration WebSocket endpoints

## Recommendations

### 1. Backend Route Expansion
- Add missing monitoring endpoints for real-time metrics
- Implement WebSocket support for real-time collaboration
- Expand AI/ML classification endpoints

### 2. API Standardization
- Standardize response models across all routes
- Implement consistent error handling
- Add comprehensive API documentation

### 3. Performance Optimization
- Implement caching for frequently accessed data
- Add pagination for large result sets
- Optimize database queries for complex operations

### 4. Security Enhancement
- Implement rate limiting for all endpoints
- Add comprehensive audit logging
- Enhance RBAC implementation

## Conclusion

The frontend data-sources components have comprehensive API coverage with the backend routes. Most core functionality is properly implemented, with some advanced features needing additional backend support. The API structure follows consistent patterns and provides a solid foundation for enterprise data management operations.
