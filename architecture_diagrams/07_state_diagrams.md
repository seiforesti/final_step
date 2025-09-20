# State Diagrams

## Eraser.io Diagram Code

### 1. Data Source Lifecycle State Diagram

```eraser
title: Data Source Lifecycle States

// Initial State
state initial [icon: start] {
  label: "Initial"
  description: "System start state"
}

// Registration States
state registered [icon: register] {
  label: "Registered"
  description: "Data source registered in system"
  color: blue
}

state configuring [icon: config] {
  label: "Configuring"
  description: "Setting up connection parameters"
  color: yellow
}

state connected [icon: connected] {
  label: "Connected"
  description: "Successfully connected to data source"
  color: green
}

state connection-failed [icon: error] {
  label: "Connection Failed"
  description: "Unable to establish connection"
  color: red
}

// Scanning States
state scanning [icon: scan] {
  label: "Scanning"
  description: "Discovering data structures and content"
  color: orange
}

state scan-failed [icon: scan-error] {
  label: "Scan Failed"
  description: "Error during data discovery"
  color: red
}

state scanned [icon: scanned] {
  label: "Scanned"
  description: "Data discovery completed successfully"
  color: green
}

// Classification States
state classifying [icon: classify] {
  label: "Classifying"
  description: "Applying classification rules"
  color: purple
}

state classified [icon: classified] {
  label: "Classified"
  description: "Data classification completed"
  color: green
}

// Validation States
state validating [icon: validate] {
  label: "Validating"
  description: "Running compliance checks"
  color: orange
}

state validated [icon: validated] {
  label: "Validated"
  description: "Compliance validation passed"
  color: green
}

// Catalog States
state cataloging [icon: catalog] {
  label: "Cataloging"
  description: "Adding to data catalog"
  color: teal
}

state cataloged [icon: cataloged] {
  label: "Cataloged"
  description: "Successfully added to catalog"
  color: green
}

// Monitoring States
state monitoring [icon: monitor] {
  label: "Monitoring"
  description: "Active monitoring and health checks"
  color: blue
}

// Final States
state archived [icon: archive] {
  label: "Archived"
  description: "Data source archived"
  color: gray
}

state deleted [icon: delete] {
  label: "Deleted"
  description: "Data source removed"
  color: black
}

// State Transitions
initial --> registered: "Register Data Source"
registered --> configuring: "Configure Connection"
configuring --> connected: "Connection Success"
configuring --> connection-failed: "Connection Error"
connection-failed --> configuring: "Retry Configuration"

connected --> scanning: "Start Discovery Scan"
scanning --> scanned: "Scan Complete"
scanning --> scan-failed: "Scan Error"
scan-failed --> scanning: "Retry Scan"

scanned --> classifying: "Start Classification"
classifying --> classified: "Classification Complete"

classified --> validating: "Start Compliance Check"
validating --> validated: "Validation Success"

validated --> cataloging: "Add to Catalog"
cataloging --> cataloged: "Cataloging Complete"

cataloged --> monitoring: "Start Monitoring"
monitoring --> scanning: "Scheduled Re-scan"

cataloged --> archived: "Archive Request"
archived --> cataloged: "Restore from Archive"
cataloged --> deleted: "Delete Request"
```

### 2. Workflow Execution State Diagram

```eraser
title: Workflow Execution Lifecycle

// Initial State
state initial [icon: start] {
  label: "Initial"
  description: "Workflow creation start"
}

// Design States
state draft [icon: draft] {
  label: "Draft"
  description: "Workflow being designed"
  color: gray
}

state validating [icon: validate] {
  label: "Validating"
  description: "Checking workflow definition"
  color: yellow
}

state valid [icon: valid] {
  label: "Valid"
  description: "Workflow definition is correct"
  color: green
}

state invalid [icon: invalid] {
  label: "Invalid"
  description: "Workflow has validation errors"
  color: red
}

// Scheduling States
state scheduled [icon: schedule] {
  label: "Scheduled"
  description: "Workflow scheduled for execution"
  color: blue
}

state queued [icon: queue] {
  label: "Queued"
  description: "Waiting for resources"
  color: orange
}

// Execution States
state running [icon: running] {
  label: "Running"
  description: "Workflow currently executing"
  color: green
}

state paused [icon: pause] {
  label: "Paused"
  description: "Execution temporarily stopped"
  color: yellow
}

state retrying [icon: retry] {
  label: "Retrying"
  description: "Retrying failed steps"
  color: orange
}

// Completion States
state completed [icon: success] {
  label: "Completed"
  description: "Workflow executed successfully"
  color: green
}

state failed [icon: failed] {
  label: "Failed"
  description: "Workflow execution failed"
  color: red
}

state cancelled [icon: cancelled] {
  label: "Cancelled"
  description: "Execution cancelled by user"
  color: gray
}

state abandoned [icon: abandoned] {
  label: "Abandoned"
  description: "Exceeded max retry attempts"
  color: black
}

// State Transitions
initial --> draft: "Create Workflow"
draft --> validating: "Submit for Validation"
validating --> valid: "Validation Success"
validating --> invalid: "Validation Failed"
invalid --> draft: "Fix Issues"

valid --> scheduled: "Schedule Execution"
scheduled --> queued: "Enter Execution Queue"
queued --> running: "Resources Available"

running --> completed: "Execution Success"
running --> failed: "Execution Error"
running --> paused: "Pause Request"
running --> cancelled: "Cancel Request"

paused --> running: "Resume Execution"
paused --> cancelled: "Cancel While Paused"

failed --> retrying: "Retry Execution"
retrying --> running: "Retry Started"
retrying --> abandoned: "Max Retries Exceeded"

completed --> scheduled: "Re-schedule"
failed --> draft: "Modify and Resubmit"
```

### 3. Racine Workspace State Diagram

```eraser
title: Racine Workspace Lifecycle

// Initial State
state initial [icon: start] {
  label: "Initial"
  description: "Workspace creation start"
}

// Creation States
state creating [icon: creating] {
  label: "Creating"
  description: "Workspace being provisioned"
  color: yellow
}

state creation-failed [icon: creation-error] {
  label: "Creation Failed"
  description: "Workspace creation error"
  color: red
}

// Active States
state active [icon: active] {
  label: "Active"
  description: "Workspace is operational"
  color: green
}

state configuring [icon: config] {
  label: "Configuring"
  description: "Modifying workspace settings"
  color: blue
}

// Collaboration States
state collaborating [icon: collaborate] {
  label: "Collaborating"
  description: "Active collaboration session"
  color: purple
}

state sharing [icon: share] {
  label: "Sharing"
  description: "Resources being shared"
  color: teal
}

// Maintenance States
state maintenance [icon: maintenance] {
  label: "Maintenance"
  description: "Workspace under maintenance"
  color: orange
}

state upgrading [icon: upgrade] {
  label: "Upgrading"
  description: "Workspace being upgraded"
  color: blue
}

// Archival States
state archiving [icon: archiving] {
  label: "Archiving"
  description: "Preparing for archive"
  color: gray
}

state archived [icon: archived] {
  label: "Archived"
  description: "Workspace archived"
  color: gray
}

// Deletion States
state deleting [icon: deleting] {
  label: "Deleting"
  description: "Workspace being removed"
  color: red
}

state deleted [icon: deleted] {
  label: "Deleted"
  description: "Workspace permanently removed"
  color: black
}

// Error States
state error [icon: error] {
  label: "Error"
  description: "Workspace in error state"
  color: red
}

state recovering [icon: recover] {
  label: "Recovering"
  description: "Attempting error recovery"
  color: yellow
}

// State Transitions
initial --> creating: "Create Workspace"
creating --> active: "Creation Complete"
creating --> creation-failed: "Creation Error"
creation-failed --> creating: "Retry Creation"

active --> configuring: "Modify Settings"
configuring --> active: "Configuration Saved"

active --> collaborating: "Start Collaboration"
collaborating --> active: "End Collaboration"
collaborating --> sharing: "Share Resources"
sharing --> collaborating: "Sharing Complete"

active --> maintenance: "Schedule Maintenance"
maintenance --> active: "Maintenance Complete"
maintenance --> upgrading: "Upgrade Workspace"
upgrading --> active: "Upgrade Complete"

active --> archiving: "Archive Request"
archiving --> archived: "Archive Complete"
archived --> active: "Restore Workspace"

active --> deleting: "Delete Request"
archived --> deleting: "Delete Archived"
deleting --> deleted: "Deletion Complete"

active --> error: "System Error"
error --> recovering: "Start Recovery"
recovering --> active: "Recovery Success"
recovering --> error: "Recovery Failed"
```

### 4. AI Assistant Conversation State Diagram

```eraser
title: AI Assistant Conversation States

// Initial State
state initial [icon: start] {
  label: "Initial"
  description: "Conversation start"
}

// Conversation States
state listening [icon: listen] {
  label: "Listening"
  description: "Waiting for user input"
  color: blue
}

state processing [icon: process] {
  label: "Processing"
  description: "Analyzing user request"
  color: yellow
}

state understanding [icon: understand] {
  label: "Understanding"
  description: "Interpreting context and intent"
  color: orange
}

// Analysis States
state analyzing [icon: analyze] {
  label: "Analyzing"
  description: "Deep analysis of request"
  color: purple
}

state learning [icon: learn] {
  label: "Learning"
  description: "Updating knowledge base"
  color: green
}

// Response States
state responding [icon: respond] {
  label: "Responding"
  description: "Generating response"
  color: teal
}

state recommending [icon: recommend] {
  label: "Recommending"
  description: "Providing recommendations"
  color: blue
}

// Action States
state executing [icon: execute] {
  label: "Executing"
  description: "Performing requested action"
  color: green
}

state monitoring [icon: monitor] {
  label: "Monitoring"
  description: "Tracking action progress"
  color: orange
}

// Completion States
state completed [icon: complete] {
  label: "Completed"
  description: "Task completed successfully"
  color: green
}

state waiting [icon: wait] {
  label: "Waiting"
  description: "Awaiting user feedback"
  color: blue
}

// Error States
state confused [icon: confused] {
  label: "Confused"
  description: "Unable to understand request"
  color: red
}

state clarifying [icon: clarify] {
  label: "Clarifying"
  description: "Asking for clarification"
  color: yellow
}

// Final States
state ended [icon: end] {
  label: "Ended"
  description: "Conversation terminated"
  color: gray
}

// State Transitions
initial --> listening: "Start Conversation"
listening --> processing: "User Input Received"
processing --> understanding: "Input Processed"
understanding --> analyzing: "Complex Request"
understanding --> responding: "Simple Request"

analyzing --> learning: "New Pattern Detected"
learning --> responding: "Knowledge Updated"

responding --> recommending: "Generate Recommendations"
responding --> executing: "Execute Action"
responding --> waiting: "Response Sent"

recommending --> waiting: "Recommendations Provided"
executing --> monitoring: "Action Started"
monitoring --> completed: "Action Successful"
completed --> waiting: "Task Complete"

waiting --> listening: "Continue Conversation"
waiting --> ended: "End Conversation"

processing --> confused: "Cannot Parse Input"
understanding --> confused: "Ambiguous Request"
confused --> clarifying: "Request Clarification"
clarifying --> listening: "Clarification Sent"

listening --> ended: "Timeout/User Exit"
```

## State Diagram Descriptions

These state diagrams illustrate the comprehensive lifecycle management and state transitions within the PurSight Data Governance Platform:

### 1. Data Source Lifecycle State Diagram

**Purpose**: Tracks the complete lifecycle of data sources from registration to deletion.

**Key States**:
- **Registration Phase**: Initial setup and connection establishment
- **Discovery Phase**: Data scanning and structure analysis
- **Governance Phase**: Classification and compliance validation
- **Operational Phase**: Active monitoring and maintenance
- **Archival Phase**: Long-term storage and eventual deletion

**Critical Transitions**:
- Error handling with retry mechanisms
- Scheduled re-scanning for data changes
- Archive/restore capabilities for data retention

### 2. Workflow Execution State Diagram

**Purpose**: Manages the complete workflow execution lifecycle from design to completion.

**Key States**:
- **Design Phase**: Draft creation and validation
- **Scheduling Phase**: Queue management and resource allocation
- **Execution Phase**: Active processing with pause/resume capabilities
- **Completion Phase**: Success, failure, or cancellation handling

**Critical Transitions**:
- Validation loops for error correction
- Retry mechanisms with abandonment limits
- Pause/resume for operational flexibility

### 3. Racine Workspace State Diagram

**Purpose**: Governs the advanced workspace management capabilities of the Racine Main Manager.

**Key States**:
- **Provisioning Phase**: Creation and initial setup
- **Operational Phase**: Active use with collaboration features
- **Maintenance Phase**: Upgrades and system maintenance
- **Lifecycle Management**: Archive, restore, and deletion

**Critical Transitions**:
- Real-time collaboration state management
- Error recovery mechanisms
- Graceful degradation and restoration

### 4. AI Assistant Conversation State Diagram

**Purpose**: Manages the intelligent conversation flow and learning capabilities of the AI assistant.

**Key States**:
- **Input Processing**: Understanding and context analysis
- **Intelligence Phase**: Learning and knowledge updates
- **Response Generation**: Recommendations and actions
- **Execution Monitoring**: Task completion tracking

**Critical Transitions**:
- Context-aware state management
- Clarification loops for ambiguous requests
- Continuous learning integration

### Common Patterns Across All State Diagrams:

1. **Error Handling**: Comprehensive error states with recovery mechanisms
2. **Retry Logic**: Intelligent retry patterns with abandonment conditions
3. **Monitoring Integration**: Active monitoring throughout all lifecycles
4. **Graceful Degradation**: Fallback states for system resilience
5. **Audit Trail**: State transitions logged for compliance
6. **Real-time Updates**: WebSocket integration for live state updates
7. **Resource Management**: Efficient resource allocation and cleanup

These state diagrams ensure robust lifecycle management, error resilience, and optimal user experience across all platform components.