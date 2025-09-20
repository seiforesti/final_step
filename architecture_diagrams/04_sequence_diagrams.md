# Sequence Diagrams

## Eraser.io Diagram Code

### 1. User Authentication & Authorization Flow

```eraser
title: User Authentication & Authorization Flow

actor user [icon: user] {
  label: "User"
}

component frontend [icon: react] {
  label: "React Frontend"
}

component api-gateway [icon: gateway] {
  label: "API Gateway"
}

component auth-middleware [icon: shield] {
  label: "Auth Middleware"
}

component auth-service [icon: lock] {
  label: "Auth Service"
}

component rbac-service [icon: key] {
  label: "RBAC Service"
}

database postgres [icon: postgresql] {
  label: "PostgreSQL"
}

cache redis [icon: redis] {
  label: "Redis Cache"
}

// Authentication Flow
user --> frontend: 1. Login Request (email, password)
frontend --> api-gateway: 2. POST /auth/login
api-gateway --> auth-service: 3. authenticate_user()
auth-service --> postgres: 4. SELECT user WHERE email = ?
postgres --> auth-service: 5. User data
auth-service --> auth-service: 6. verify_password()
auth-service --> redis: 7. store_session(user_id, token)
auth-service --> api-gateway: 8. JWT token + user info
api-gateway --> frontend: 9. Authentication response
frontend --> user: 10. Login success

// Subsequent Authorization Flow
user --> frontend: 11. Access protected resource
frontend --> api-gateway: 12. GET /api/resource (Bearer token)
api-gateway --> auth-middleware: 13. validate_token()
auth-middleware --> redis: 14. get_session(token)
redis --> auth-middleware: 15. Session data
auth-middleware --> rbac-service: 16. check_permissions(user, resource, action)
rbac-service --> postgres: 17. SELECT permissions WHERE user_id = ?
postgres --> rbac-service: 18. User permissions
rbac-service --> auth-middleware: 19. Permission granted/denied
auth-middleware --> api-gateway: 20. User context (if authorized)
api-gateway --> api-gateway: 21. Process request
api-gateway --> frontend: 22. Resource data
frontend --> user: 23. Display data
```

### 2. Data Source Scanning & Classification Workflow

```eraser
title: Data Source Scanning & Classification Workflow

actor user [icon: user] {
  label: "Data Steward"
}

component frontend [icon: react] {
  label: "React Frontend"
}

component orchestration [icon: conductor] {
  label: "Orchestration Service"
}

component workspace-mgr [icon: workspace] {
  label: "Workspace Manager"
}

component data-source-svc [icon: database-connect] {
  label: "Data Source Service"
}

component scan-service [icon: scanner] {
  label: "Scan Service"
}

component classification-svc [icon: classifier] {
  label: "Classification Service"
}

component compliance-svc [icon: compliance] {
  label: "Compliance Service"
}

component catalog-svc [icon: catalog] {
  label: "Catalog Service"
}

component ai-assistant [icon: brain] {
  label: "AI Assistant"
}

database postgres [icon: postgresql] {
  label: "PostgreSQL"
}

storage blob-storage [icon: blob] {
  label: "Blob Storage"
}

// Initiate Scan
user --> frontend: 1. Initiate data source scan
frontend --> orchestration: 2. POST /racine/orchestration/scan-workflow
orchestration --> workspace-mgr: 3. validate_workspace_access()
workspace-mgr --> orchestration: 4. Access validated

// Data Source Discovery
orchestration --> data-source-svc: 5. get_data_source_info(source_id)
data-source-svc --> postgres: 6. SELECT * FROM data_sources WHERE id = ?
postgres --> data-source-svc: 7. Data source configuration
data-source-svc --> orchestration: 8. Source details & connection info

// Scan Execution
orchestration --> scan-service: 9. execute_scan(source_config)
scan-service --> scan-service: 10. Connect to data source
scan-service --> scan-service: 11. Discover schema & sample data
scan-service --> postgres: 12. INSERT scan_results
scan-service --> blob-storage: 13. Store sample data files

// AI-Powered Classification
scan-service --> classification-svc: 14. classify_data(scan_results)
classification-svc --> ai-assistant: 15. analyze_patterns(data_samples)
ai-assistant --> ai-assistant: 16. Apply ML models
ai-assistant --> classification-svc: 17. Classification predictions
classification-svc --> postgres: 18. INSERT classification_results
classification-svc --> scan-service: 19. Classification complete

// Compliance Validation
scan-service --> compliance-svc: 20. validate_compliance(scan_id)
compliance-svc --> postgres: 21. SELECT compliance_rules
compliance-svc --> compliance-svc: 22. Apply validation rules
compliance-svc --> postgres: 23. INSERT compliance_results
compliance-svc --> scan-service: 24. Compliance validation complete

// Catalog Update
scan-service --> catalog-svc: 25. update_catalog(scan_results)
catalog-svc --> postgres: 26. INSERT/UPDATE catalog_items
catalog-svc --> postgres: 27. INSERT metadata & lineage
catalog-svc --> scan-service: 28. Catalog updated

// Complete Workflow
scan-service --> orchestration: 29. Scan workflow complete
orchestration --> frontend: 30. Scan results & summary
frontend --> user: 31. Display scan results dashboard
```

### 3. Racine Workspace Collaboration Flow

```eraser
title: Racine Workspace Collaboration Flow

actor user1 [icon: user] {
  label: "User 1 (Owner)"
}

actor user2 [icon: user] {
  label: "User 2 (Member)"
}

component frontend1 [icon: react] {
  label: "Frontend 1"
}

component frontend2 [icon: react] {
  label: "Frontend 2"
}

component websocket [icon: websocket] {
  label: "WebSocket Service"
}

component collaboration-hub [icon: collaboration] {
  label: "Collaboration Hub"
}

component workspace-mgr [icon: workspace] {
  label: "Workspace Manager"
}

component activity-tracker [icon: activity] {
  label: "Activity Tracker"
}

database postgres [icon: postgresql] {
  label: "PostgreSQL"
}

cache redis [icon: redis] {
  label: "Redis Cache"
}

// Create Collaboration Session
user1 --> frontend1: 1. Create collaboration session
frontend1 --> collaboration-hub: 2. POST /racine/collaboration/session
collaboration-hub --> workspace-mgr: 3. validate_workspace_access(user1)
workspace-mgr --> postgres: 4. SELECT workspace permissions
postgres --> workspace-mgr: 5. Permission data
workspace-mgr --> collaboration-hub: 6. Access granted
collaboration-hub --> postgres: 7. INSERT collaboration_session
collaboration-hub --> redis: 8. Store session state
collaboration-hub --> frontend1: 9. Session created (session_id)

// Invite Collaboration
user1 --> frontend1: 10. Invite User 2
frontend1 --> collaboration-hub: 11. POST /racine/collaboration/invite
collaboration-hub --> postgres: 12. INSERT collaboration_participant
collaboration-hub --> websocket: 13. send_invitation(user2, session_id)
websocket --> frontend2: 14. Real-time invitation notification
frontend2 --> user2: 15. Show collaboration invitation

// Accept Invitation
user2 --> frontend2: 16. Accept invitation
frontend2 --> collaboration-hub: 17. POST /racine/collaboration/join
collaboration-hub --> postgres: 18. UPDATE participant status = 'active'
collaboration-hub --> websocket: 19. broadcast_join_event(session_id)
websocket --> frontend1: 20. User 2 joined notification
websocket --> frontend2: 21. Successfully joined session
frontend1 --> user1: 22. Show User 2 joined
frontend2 --> user2: 23. Show collaboration interface

// Real-time Document Sharing
user1 --> frontend1: 24. Share document
frontend1 --> collaboration-hub: 25. POST /racine/collaboration/share-document
collaboration-hub --> postgres: 26. INSERT collaboration_document
collaboration-hub --> activity-tracker: 27. track_activity(document_share)
activity-tracker --> postgres: 28. INSERT activity_log
collaboration-hub --> websocket: 29. broadcast_document_shared(session_id)
websocket --> frontend2: 30. Document shared notification
frontend2 --> user2: 31. Show shared document

// Real-time Chat
user2 --> frontend2: 32. Send chat message
frontend2 --> collaboration-hub: 33. POST /racine/collaboration/message
collaboration-hub --> postgres: 34. INSERT collaboration_message
collaboration-hub --> redis: 35. Cache recent messages
collaboration-hub --> websocket: 36. broadcast_message(session_id)
websocket --> frontend1: 37. New message notification
frontend1 --> user1: 38. Display chat message

// End Collaboration
user1 --> frontend1: 39. End collaboration session
frontend1 --> collaboration-hub: 40. POST /racine/collaboration/end-session
collaboration-hub --> postgres: 41. UPDATE session status = 'ended'
collaboration-hub --> activity-tracker: 42. track_activity(session_ended)
collaboration-hub --> websocket: 43. broadcast_session_ended(session_id)
websocket --> frontend2: 44. Session ended notification
frontend2 --> user2: 45. Show session ended message
```

### 4. AI-Assisted Pipeline Optimization Flow

```eraser
title: AI-Assisted Pipeline Optimization Flow

actor user [icon: user] {
  label: "Data Engineer"
}

component frontend [icon: react] {
  label: "React Frontend"
}

component pipeline-optimizer [icon: pipeline] {
  label: "Pipeline Optimizer"
}

component ai-assistant [icon: brain] {
  label: "AI Assistant"
}

component workflow-engine [icon: flow-chart] {
  label: "Workflow Engine"
}

component performance-monitor [icon: monitor] {
  label: "Performance Monitor"
}

component orchestration [icon: conductor] {
  label: "Orchestration Service"
}

database postgres [icon: postgresql] {
  label: "PostgreSQL"
}

cache redis [icon: redis] {
  label: "Redis Cache"
}

external spark [icon: spark] {
  label: "Apache Spark"
}

// Initiate Pipeline Analysis
user --> frontend: 1. Request pipeline optimization
frontend --> pipeline-optimizer: 2. POST /racine/pipeline/optimize
pipeline-optimizer --> postgres: 3. SELECT pipeline_execution_history
postgres --> pipeline-optimizer: 4. Historical performance data
pipeline-optimizer --> ai-assistant: 5. analyze_pipeline_performance(data)

// AI Analysis
ai-assistant --> ai-assistant: 6. Apply ML models for pattern analysis
ai-assistant --> ai-assistant: 7. Identify bottlenecks & inefficiencies
ai-assistant --> ai-assistant: 8. Generate optimization recommendations
ai-assistant --> pipeline-optimizer: 9. Optimization suggestions

// Performance Monitoring
pipeline-optimizer --> performance-monitor: 10. get_real_time_metrics()
performance-monitor --> redis: 11. GET current_performance_metrics
redis --> performance-monitor: 12. Real-time metrics data
performance-monitor --> pipeline-optimizer: 13. Current performance state

// Generate Optimization Plan
pipeline-optimizer --> pipeline-optimizer: 14. Create optimization plan
pipeline-optimizer --> postgres: 15. INSERT pipeline_optimization_plan
pipeline-optimizer --> frontend: 16. Optimization recommendations

// User Reviews & Approves
frontend --> user: 17. Display optimization recommendations
user --> frontend: 18. Approve optimization plan
frontend --> pipeline-optimizer: 19. POST /racine/pipeline/apply-optimization

// Apply Optimizations
pipeline-optimizer --> workflow-engine: 20. update_pipeline_definition(optimizations)
workflow-engine --> postgres: 21. UPDATE pipeline configuration
workflow-engine --> orchestration: 22. schedule_optimized_execution()
orchestration --> spark: 23. Deploy optimized pipeline
spark --> orchestration: 24. Pipeline deployed successfully

// Monitor Results
orchestration --> performance-monitor: 25. start_performance_monitoring()
performance-monitor --> redis: 26. Stream performance metrics
performance-monitor --> ai-assistant: 27. feed_optimization_results()
ai-assistant --> ai-assistant: 28. Learn from optimization outcomes
ai-assistant --> postgres: 29. UPDATE AI model with feedback

// Report Results
performance-monitor --> pipeline-optimizer: 30. Optimization results
pipeline-optimizer --> frontend: 31. Performance improvement report
frontend --> user: 32. Show optimization success metrics
```

## Sequence Diagram Descriptions

These sequence diagrams illustrate the key interaction flows within the PurSight Data Governance Platform:

### 1. User Authentication & Authorization Flow
- **Purpose**: Shows how users authenticate and access protected resources
- **Key Features**: JWT tokens, session management, RBAC permission checking
- **Components**: React frontend, API gateway, auth services, PostgreSQL, Redis

### 2. Data Source Scanning & Classification Workflow
- **Purpose**: Demonstrates the complete data governance workflow from scan initiation to catalog update
- **Key Features**: AI-powered classification, compliance validation, metadata management
- **Components**: Orchestration service, multiple domain services, AI assistant, storage systems

### 3. Racine Workspace Collaboration Flow
- **Purpose**: Shows real-time collaboration features within workspaces
- **Key Features**: WebSocket communication, real-time notifications, document sharing, chat
- **Components**: Collaboration hub, workspace manager, WebSocket service, activity tracker

### 4. AI-Assisted Pipeline Optimization Flow
- **Purpose**: Illustrates how AI analyzes and optimizes data pipelines
- **Key Features**: ML-based analysis, performance monitoring, automated optimization
- **Components**: Pipeline optimizer, AI assistant, workflow engine, external Spark integration

### Key Patterns Demonstrated:
1. **Asynchronous Communication**: WebSocket for real-time features
2. **Event-Driven Architecture**: Activity tracking and notifications
3. **AI Integration**: Machine learning for intelligent automation
4. **Microservices Coordination**: Service orchestration and communication
5. **Caching Strategy**: Redis for session management and performance
6. **Security**: Authentication and authorization at every layer