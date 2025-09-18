# Scan Logic Base System — Deep Technical Analysis (Hidden)

## 1. Executive Overview

The Scan Logic base system is the runtime brain that plans, schedules, executes, monitors, and optimizes scanning across heterogeneous data sources. It orchestrates the execution of scan rules (classification, quality, compliance, security) over defined scopes, integrates with surrounding governance systems (Catalog, Compliance, Classification, Lineage), and provides enterprise-grade reliability, observability, and performance controls.

This document explains exactly how Scan Logic is modeled, executed, and integrated in PurSight:
- Domain models that represent scans, executions, rules, results, schedules, workflows, and orchestration jobs
- Services that plan and execute scans (`ScanService`, `ScanSchedulerService`, `ScanWorkflowEngine`, `ScanOrchestrationService`)
- API routes that expose intelligent scanning capabilities and live monitoring
- Integration pathways to Catalog, Classification, Compliance, Lineage, and Analytics
- Reliability, performance, and security mechanisms underpinning production operation

---

## 2. Core Domain Models (What the system acts upon)

### 2.1 Data source and scope models
- `DataSource` (in `app/models/scan_models.py`) captures connection details, pool sizing, cloud/hybrid context, organizational and orchestrator linkage, and operational telemetry (health, error rates, QPS, etc.). It is the anchor for any scan.
- `ScanRuleSet` defines WHAT to scan: include/exclude lists at schema/table/column levels, sampling toggles and size. It can be associated with a `DataSource` and with Compliance relationships. Enhanced variants (`EnhancedScanRuleSet`) add enterprise orchestration knobs (AI pattern recognition, intelligent sampling, resource limits, priorities, validation & quality thresholds, ML references, catalogs, audit, SLAs).

### 2.2 Scan and results models
- `Scan` tracks a single scan run: UUID, source, optional rule set, status lifecycle (PENDING → RUNNING → COMPLETED/FAILED/CANCELLED), timestamps, and relationships to results.
- `ScanResult` stores per-object outcomes (schema/table/column), classification labels, sensitivity, compliance issues, technical metadata, and arbitrary `scan_metadata`. These records are the bridge to downstream enrichment.

### 2.3 Rule definition and execution tracking
- `ScanRule` represents an enterprise rule: type/category/severity, rule expression/config/dependencies, AI flags, resource requirements, lifecycle and performance metrics. It can belong to an enhanced rule set; it is the atomic logical unit the execution engines will run.
- `ScanExecution` captures per-rule execution across contexts (which scan/orchestration, environment, progression, timings, resource usage, outputs, errors, retries, validation, alerts, audit, tags). This enables granular analytics and auditability.

### 2.4 Scheduling and discovery
- `ScanSchedule` defines cron-based recurring scans, binding a `DataSource` and a `ScanRuleSet`, with `last_run`/`next_run` management.
- `DiscoveryHistory` records discovery operations (used when scans do schema discovery and store metadata), including counts, durations, status, and details.

### 2.5 Workflow and orchestration (HOW scans run)
- `ScanWorkflowTemplate`, `ScanWorkflow`, `WorkflowStage`, `WorkflowTask`, `WorkflowCondition`, `WorkflowTrigger`, `WorkflowApproval`, `ScanWorkflowExecutionDetail`
  - Define reusable templates and concrete workflows; each workflow includes ordered stages (INIT, VALIDATION, PROCESSING, ANALYSIS, REPORTING, CLEANUP, etc.), each with tasks (SCAN_EXECUTION, DATA_COLLECTION, QUALITY_ASSESSMENT, COMPLIANCE_CHECK, CLASSIFICATION, LINEAGE_TRACKING, NOTIFICATION, APPROVAL_REQUEST, DATA_EXPORT, CUSTOM_SCRIPT), conditions, retries, timeouts, and dependencies.
- Orchestration models in `scan_models` provide enterprise job-level coordination:
  - `ScanOrchestrationJob` with strategy, priority, targets, execution config, performance/quality/business metrics, and relationships to `EnhancedScanRuleSet` and `ScanWorkflowExecution`.
  - `ScanWorkflowExecution` for per-step tracking within orchestration jobs (status, timings, resource usage, outputs, errors, dependencies, quality, cost, audit).
  - `ScanResourceAllocation` for CPU/memory/network/storage/DB connections/API limits allocation tracking with costs and efficiency.

---

## 3. Service Layer (How execution is planned and performed)

### 3.1 ScanService — unit scan execution
Responsibilities:
- CRUD for `Scan`, status transitions, and storage of `ScanResult`.
- Execution method `execute_scan()` that:
  1) Validates scan state and sets RUNNING.
  2) Loads `DataSource` and optional `ScanRuleSet`.
  3) Extracts metadata using extraction adapters per DB type via `_extract_*_metadata()`; payload includes include/exclude filters from the rule set.
  4) Persists results into `ScanResult` with table/column detail.
  5) Creates a `DiscoveryHistory` record and transitions to COMPLETED; on errors, records FAILED with discovery entry.
- Storage path `_store_scan_results()` is format-aware (SQL vs MongoDB), normalizes schemas/tables/columns.
- Health endpoint calculations: computes success rate and service health.

Execution behavior:
- Uses async-friendly patterns; spawns task when loop exists; otherwise executes inline.
- ThreadPoolExecutor is used to offload blocking extraction HTTP calls.
- Robust status/timestamp updates; idempotent error handling for partial failures.

### 3.2 ScanSchedulerService — recurring execution
- Manages `ScanSchedule` CRUD, cron validation (`croniter`), `next_run` computation.
- The scheduler loop periodically looks up due schedules, creates a `Scan` via `ScanService.create_scan`, invokes `ScanService.execute_scan`, and advances schedule times.
- This provides hands-free periodic scanning with clear audit of runs.

### 3.3 ScanWorkflowEngine — staged, conditional, governable execution
- Provides an enterprise workflow runtime for scan logic.
- Components:
  - Stage executors for INIT, VALIDATION, PROCESSING, ANALYSIS, REPORTING, CLEANUP, NOTIFICATION, APPROVAL, CUSTOM.
  - Task handlers mapping `TaskType` to concrete operations (e.g., `_handle_scan_execution_task` submits a scan request via the orchestrator and monitors it; others perform data collection, quality assessment, compliance checks, classification, lineage tracking, notifications, approvals, exports).
  - Condition evaluators (EQUALS, IN, REGEX, etc.), retries, timeouts, escalation, auto-approval, and periodic health/metrics loops.
- Lifecycle:
  1) Create workflow from template; merge defaults and variables.
  2) Initialize ordered stages and tasks with per-stage timeouts/retries and conditions.
  3) Execute stages in order respecting dependencies; update progress; fail-fast on critical stage failures; otherwise continue.
  4) Persist/emit metrics; generate a workflow report; move to completed/failed ring buffers.
- Optimization:
  - Background loops analyze throughput, failure rates, average durations, and template stats; produce recommendations and adjust baselines.
  - Escalation/approval management loops ensure governance and responsiveness.

### 3.4 ScanOrchestrationService — resource-aware, AI-optimized coordination
- Designs and executes multi-rule, multi-source plans with strategies (SEQUENTIAL, PARALLEL, ADAPTIVE, INTELLIGENT, PRIORITY_BASED, RESOURCE_OPTIMIZED).
- Responsibilities:
  - Validate scan request (source, rules) using `DataSourceConnectionService` and `EnterpriseScanRuleService`.
  - Analyze resource requirements from source sizing and rule complexity; compute CPU/memory/storage/network/DB/API needs; estimate duration; compute complexity score.
  - Check availability vs current allocations; queue if insufficient (priority heap) with wait-time estimates.
  - Allocate resources with expiry tied to estimated duration + buffer.
  - Generate execution plan: batching rules sequentially/parallel or using AI optimization (`ScanIntelligenceService.optimize_scan_execution`).
  - Execute each stage; for parallel stages, run rules concurrently; monitor success/failure, attempt recovery (retry with sequential fallback), update progress and metrics; persist orchestration execution snapshot.
  - Release resources and update performance metrics (utilization, throughput, success rate).
- Optimization & ML:
  - Maintains RandomForest-based predictors for duration/resource usage; scalers; periodic retraining using historical data; derives optimization insights and allocation ranges.
  - Background loops for orchestration queue processing, resource monitoring, performance optimization, and metrics collection.

---

## 4. API Exposure (Scan Logic routes)

The `app/api/routes/intelligent_scanning_routes.py` file groups endpoints for intelligent scan logic:
- Execute logic (`/execute`): validate, build AI plan, execute via a unified manager (coordination layer), monitor in background.
- Workflow execution (`/workflow`): validate steps, create workflow via `ScanWorkflowEngine`, coordinate execution, monitor.
- Orchestration (`/orchestrate`): create orchestration plan via coordinator, execute via unified manager, monitor.
- Analysis (`/analyze`): perform performance analysis and return optimization recommendations.
- Status (`/status/{execution_id}`): return real-time status/metrics/progress.
- Optimization recommendations and performance insights routes; and real-time streaming (`/stream/logic-updates`).
- All endpoints are guarded by RBAC permissions and use dependency-injected services.

These routes provide the external control plane to start/observe/optimize scan logic at runtime.

---

## 5. End-to-End Execution Flow (Functional Perspective)

1) Trigger sources
- Manual: user calls intelligent scanning endpoints or traditional `ScanService` execution.
- Scheduled: `ScanSchedulerService` wakes, creates scans, and runs them.
- Workflow: `ScanWorkflowEngine` kicks off a multi-stage plan, possibly invoking orchestrated scans as a task.
- Orchestration: `ScanOrchestrationService` accepts a high-level rule set and target, builds an optimized plan, and executes.

2) Planning
- Validate data source and rule set/rules.
- Size environment; estimate resources; select strategy (sequential/parallel/adaptive/intelligent) based on complexity and capacity.
- Build stages: group rules to batches, define dependencies and concurrency, define timeouts/retries.

3) Execution
- For unit scans: extract metadata, filter by rule set, persist results; update discovery and status.
- For orchestrations: for each stage, execute rules (parallel where possible). Update per-rule `ScanExecution` and stage results.
- For workflows: run tasks in each stage; a scan execution task submits to orchestrator and monitors.

4) Post-processing and integration
- Persist results (`ScanResult`).
- Integrate with Classification (labels, sensitivity), Compliance (violations and risk), and Catalog (enrichment) using integration models.
- Optionally trigger lineage updates and analytics.

5) Monitoring and optimization
- Status endpoints and SSE streaming provide progress, metrics, and logs.
- Background loops compute performance baselines, detect bottlenecks, generate optimization hints, and optionally auto-tune resource allocations.

---

## 6. Integration Points Across the Platform

- Data Catalog: `ScanCatalogEnrichment` links results to catalog assets; orchestration jobs track enrichment and classification mappings that feed advanced catalog models.
- Classification: integration models carry labels and confidence; Scan Logic can call `ScanIntelligenceService.classify_items` in workflow tasks.
- Compliance: compliance validations and remediation actions captured alongside scan results; rule types and statuses map to frameworks.
- Lineage: workflow tasks can call lineage tracking; orchestrations can compute upstream/downstream impacts.
- Analytics: execution metrics feed analytics services for dashboards, trends, ROI, and capacity planning.

---

## 7. Reliability, Safety, and Production Controls

- Status transitions and timestamps at scan, stage, and task levels with retries, backoffs, and critical vs optional failure semantics.
- Timeouts at stage/task, cancellation pathways, and queued orchestration wait-time estimation.
- Resource pools and allocations with expiry; periodic cleanup and leak prevention.
- Audit trails and RBAC checks at API entry points; health checks and structured logging.
- Idempotent storage paths for results; batch inserts; commit boundaries; robust exception handling.

---

## 8. Performance and Scalability Techniques

- PgBouncer-backed DB connections; thread/async hybrid execution for blocking I/O.
- Parallel stages limited by CPU/DB connections/API rate limit caps.
- AI-assisted stage creation and grouping; prediction of durations; adaptive concurrency.
- Metrics loops compute throughput/queue depth; optimizers adjust resource ranges and target concurrency.
- Caching layers for repeated rule evaluations and metadata warmup.

---

## 9. Security and Compliance Considerations

- RBAC guards for execute/view/orchestrate/workflow/insights endpoints.
- `ScanRule` carries compliance frameworks and audit requirements; `ScanExecution` tracks compliance status and alerts.
- Sensitive data handling through rule expressions, masking/anonymization strategies in downstream integrations.
- Audit trails for changes to plans, approvals, escalations, and execution results.

---

## 10. How Scan Logic Differs from Scan Rule Sets (and works together)

- Rule sets define WHAT to scan and the logical rules to apply (scope, expressions, templates, governance lifecycle).
- Scan Logic defines HOW to execute: when to run, how to plan, how to allocate resources, which tasks/stages to use, how to parallelize, and how to recover.
- Scan Logic consumes rule sets to create efficient, safe, and predictable executions, then feeds back results and enrichment to other modules.

---

## 11. Example Functional Scenarios (Narrative)

1) Nightly enterprise scan across 200 tables
- Scheduler triggers; `ScanOrchestrationService` groups rules into parallel stages based on DB connections and CPU.
- Execution runs with retries on intermittent failures; stage-level metrics are collected.
- Results feed Classification and Catalog enrichment; Compliance violations open remediation tickets.

2) On-demand PII discovery for a new data source
- User invokes workflow with VALIDATION → PROCESSING (classification tasks) → REPORTING → NOTIFICATION.
- Orchestrator submits scans for the target schemas; workflow waits for completion and assembles a PII report.

3) Incremental scan under high load
- Orchestrator detects high utilization; switches strategy to smaller parallel batches; leverages predictions to meet SLA.
- Results update Catalog and Quality metrics; optimization loop updates allocation ranges.

---

## 12. Operational Metrics and KPIs

- Orchestration metrics: total/completed/failed, average orchestration time, stage counts, success rate, throughput/minute.
- Resource metrics: CPU/memory/network/storage utilization, DB connections, API limits, allocation efficiency.
- Workflow metrics: queue depth, approvals pending, health status, baseline completion time.
- Scan metrics: scan success rate, table/column coverage, findings, violations, classification confidence.

---

## 13. Failure Modes and Recovery Strategies

- Stage failure: retry with sequential fallback; mark optional stages as skipped; halt on critical stage failure.
- Resource exhaustion: queue orchestration; estimate wait; auto-release expired allocations; cancel on timeout.
- External service errors: catch and degrade (e.g., notify but continue), or fail-fast depending on stage criticality.
- Data source connectivity failure: mark discovery failed; store error; scheduler will retry on next window.

---

## 14. Extensibility and Customization

- Add new `TaskType` and handler in `ScanWorkflowEngine` for custom logic (e.g., ML inference, export target).
- Add new orchestration strategy or adjust grouping heuristics; plug-in alternate optimization backends.
- Extend `ScanRule` categories; register specialized evaluators.
- Integrate additional systems via new integration models or route modules.

---

## 15. Governance and Audit Readiness

- Every execution carries creator IDs, timestamps, and audit trails.
- Approvals/escalations recorded; RBAC enforced on sensitive operations.
- Compliance fields on rules/executions make audit extraction straightforward.

---

## 16. Summary — Why it’s production-ready

- Clear separation of concerns: WHAT (rule sets) vs HOW (logic) with strong contracts.
- Battle-tested reliability patterns: retries, timeouts, recovery, idempotent writes, queueing, health checks.
- Performance at scale: parallelization under resource constraints, predictive sizing, caching, pooling, metrics.
- Integrated intelligence: ML-guided planning and continuous optimization.
- Deep integration with the broader governance platform for end-to-end value.

---

## Appendix A: Model and Service Mapping (Quick Reference)

- Models (core): `DataSource`, `Scan`, `ScanResult`, `ScanRuleSet`, `ScanRule`, `ScanExecution`, `ScanSchedule`.
- Models (workflow/orchestration): `ScanWorkflowTemplate`, `ScanWorkflow`, `WorkflowStage`, `WorkflowTask`, `WorkflowCondition`, `WorkflowTrigger`, `WorkflowApproval`, `ScanWorkflowExecutionDetail`, `ScanOrchestrationJob`, `ScanWorkflowExecution`, `ScanResourceAllocation`.
- Integration models: `ScanClassificationIntegration`, `ScanComplianceIntegration`, `ScanCatalogEnrichment`.
- Services: `ScanService`, `ScanSchedulerService`, `ScanWorkflowEngine`, `ScanOrchestrationService`.
- Routes: `intelligent_scanning_routes.py` for execution, orchestration, analysis, status, optimization, streaming.

## Appendix B: Data Flows and State Machines (Textual)

- Scan status: PENDING → RUNNING → COMPLETED|FAILED|CANCELLED.
- Stage status: PENDING → RUNNING → COMPLETED|FAILED|SKIPPED.
- Task status: PENDING → RUNNING → COMPLETED|FAILED.
- Orchestration status: PENDING → RUNNING → COMPLETED|FAILED|PAUSED|CANCELLED.

## Appendix C: Operational Runbook (Essentials)

- Start scheduler: enable `ScanSchedulerService.start_scheduler()` in a background task.
- Observe orchestration: use `/api/v1/scan-logic/intelligent-scanning/status/{execution_id}` and SSE stream.
- Tune performance: review optimization insights; adjust rule grouping, priority, or allocation caps.
- Troubleshoot failures: inspect stage/task errors; check resource bottlenecks; review approvals/escalations.
